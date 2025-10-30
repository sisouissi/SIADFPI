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
    const [error, setError] = useState<string | null>(null);
    const printableAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && consultation && patient) {
            const generateReport = async () => {
                setIsLoading(true);
                setError(null);
                setReport(null);
                let fullReport = '';
                try {
                    // FIX: Use the streaming version of generateConsultationSynthesis by providing a callback to accumulate chunks.
                    await generateConsultationSynthesis(patient, consultation, (chunk: string) => {
                        fullReport += chunk;
                        setReport(fullReport);
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

    const handlePrint = () => {
        const contentToPrint = printableAreaRef.current;
        if (!contentToPrint) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Rapport de Consultation</title>');
            printWindow.document.write(`<style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
                @page { 
                    margin: 1.5cm;
                    @bottom-center {
                        content: "Page " counter(page) " / " counter(pages);
                        font-size: 9pt;
                        color: #808080;
                    }
                }
                body { font-family: 'Poppins', sans-serif; line-height: 1.6; color: #334155; margin: 0; }
                h1, h2, h3, h4 { color: #0F172A; margin: 0; }
                .ai-report-content h2, .ai-report-content h3, .ai-report-content h4 {
                    font-size: 1.25rem; font-weight: 700; color: #1e293b;
                    border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;
                    margin-top: 1.5rem; margin-bottom: 1rem;
                }
                .ai-report-content p { margin-bottom: 1rem; }
                .ai-report-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .ai-report-content li { margin-bottom: 0.5rem; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; } 
                    .no-print { display: none; }
                    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
                    p, ul, table { page-break-inside: avoid; }
                }
            </style>`);
            printWindow.document.write('</head><body>');
            printWindow.document.write(contentToPrint.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
        }
    };

    const handleDownloadPdf = () => {
        handlePrint();
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
                        <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end gap-3 no-print">
                            <button
                                onClick={handlePrint}
                                className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Imprimer
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Télécharger en PDF
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