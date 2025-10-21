import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { Consultation, Patient } from '../types';
import { generateConsultationSynthesis } from '../services/geminiService';
import { parseMarkdown } from '../services/markdownParser';
import { ExclamationTriangleIcon } from '../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface SynthesisModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    consultation: Consultation | null;
    onSaveReport: (reportText: string) => void;
}

const SynthesisModal: React.FC<SynthesisModalProps> = ({ isOpen, onClose, patient, consultation, onSaveReport }) => {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const printableAreaRef = useRef<HTMLDivElement>(null);

    // FIX: Switched to streaming call for generateConsultationSynthesis.
    useEffect(() => {
        if (isOpen && consultation && patient) {
            const generateReport = async () => {
                setIsLoading(true);
                setError(null);
                setReport(''); // Use empty string to accumulate chunks
                let fullReport = '';
                try {
                    await generateConsultationSynthesis(patient, consultation, (chunk: string) => {
                        fullReport += chunk;
                        setReport(fullReport); // This will show the streaming text
                    });

                    if (fullReport.startsWith("Impossible de contacter")) {
                        throw new Error(fullReport);
                    }
                    const cleanedResult = fullReport.includes('---') ? fullReport.split('---').slice(1).join('---').trim() : fullReport;
                    setReport(cleanedResult);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
                } finally {
                    setIsLoading(false);
                }
            };
            generateReport();
        }
    }, [isOpen, consultation, patient]);

    const handleDownloadPdf = () => {
        const element = printableAreaRef.current;
        if (!element || !patient || !consultation) return;
    
        setIsDownloading(true);
    
        // Temporarily set a fixed width on the element to ensure correct wrapping for html2canvas
        const originalWidth = element.style.width;
        element.style.width = '800px';
    
        html2canvas(element, { 
            scale: 1, // Reduced scale to decrease file size
            useCORS: true, 
            windowWidth: element.scrollWidth
        })
        .then((canvas) => {
            element.style.width = originalWidth;
    
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 42.5; // 1.5cm in points
    
            const imgWidth = pdfWidth - margin * 2;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            const pageContentHeight = pdfHeight - margin * 2;
    
            let heightLeft = imgHeight;
            let position = 0;
    
            pdf.addImage(canvas, 'PNG', margin, margin, imgWidth, imgHeight);
            heightLeft -= pageContentHeight;
    
            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(canvas, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= pageContentHeight;
            }
    
            const pageCount = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(9);
                pdf.setTextColor(128);
                pdf.text(
                    `Page ${i} / ${pageCount}`,
                    pdf.internal.pageSize.getWidth() / 2,
                    pdf.internal.pageSize.getHeight() - 20,
                    { align: 'center' }
                );
            }
    
            const date = new Date(consultation.consultationDate).toISOString().slice(0, 10);
            pdf.save(`rapport-${patient.lastName}-${date}.pdf`);
        })
        .catch(err => {
            element.style.width = originalWidth;
            console.error("Erreur de génération PDF : ", err);
            alert("Une erreur est survenue lors de la génération du PDF.");
        })
        .finally(() => {
            setIsDownloading(false);
        });
    };

    const handleSave = () => {
        if (report) {
            onSaveReport(report);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Synthèse IA de la Consultation"
        >
            {isLoading && !report && (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <svg className="animate-spin h-10 w-10 text-accent-blue mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600">Génération du rapport en cours...</p>
                    <p className="text-sm text-slate-500">L'IA analyse les données de la consultation.</p>
                </div>
            )}
            {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 mr-3" />
                    <p><strong>Erreur :</strong> {error}</p>
                </div>
            )}
            {report && (
                <>
                    <div ref={printableAreaRef}>
                        <div className="border-b border-slate-200 pb-4 mb-4">
                            <p className="font-bold text-slate-800">Patient: <span className="font-normal">{patient?.firstName} {patient?.lastName}</span></p>
                            <p className="font-bold text-slate-800">Date: <span className="font-normal">{new Date(consultation!.consultationDate).toLocaleDateString('fr-FR')}</span></p>
                        </div>
                        <div className="ai-report-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(report) }}>
                        </div>
                    </div>
                    {!isLoading && (
                        <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isDownloading}
                                className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                            >
                                {isDownloading ? 'Téléchargement...' : 'Télécharger en PDF'}
                            </button>
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
                            >
                                Enregistrer dans l'observation
                            </button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default SynthesisModal;
