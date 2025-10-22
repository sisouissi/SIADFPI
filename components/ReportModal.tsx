import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import Modal from './Modal';
import { Consultation, Patient } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { parseMarkdown } from '../services/markdownParser';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    consultations: Consultation[];
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, patient, consultations }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const printableAreaRef = useRef<HTMLDivElement>(null);
    
    if (!patient) return null;

    const chartData = [...consultations]
        .filter(c => c.formData.examens.efr.cvfPercent || c.formData.examens.efr.dlcoPercent)
        .sort((a, b) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime())
        .map(c => ({
            date: new Date(c.consultationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
            cvf: c.formData.examens.efr.cvfPercent,
            dlco: c.formData.examens.efr.dlcoPercent,
        }));
        
    const getTdmPattern = (consultation: Consultation) => {
        const { distribution, honeycombing, atypicalFeatures } = consultation.formData.examens.radiology;
        const hasSpecificAtypicalFeatures = atypicalFeatures.length > 0 && !atypicalFeatures.includes('Aucun de ces aspects');
        if (hasSpecificAtypicalFeatures) return "Alternatif";
        if (distribution.includes('Sous-pleurale et basale') && honeycombing === 'Oui') return "PIC Certaine";
        if (distribution.includes('Sous-pleurale et basale') && honeycombing === 'Non') return "PIC Probable";
        return "Indéterminé";
    };

    const handlePrint = () => {
        const contentToPrint = printableAreaRef.current;
        if (!contentToPrint) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Rapport Patient</title>');
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
                h1, h2, h3, h4 { color: #0F172A; }
                .ai-report-content h2, .ai-report-content h3 { border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 1.5rem; }
                .break-inside-avoid-page { break-inside: avoid; page-break-inside: avoid; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; } 
                    .no-print { display: none; }
                    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
                    p, ul, table, .recharts-wrapper { page-break-inside: avoid; }
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
        const element = printableAreaRef.current;
        if (!element || !patient) return;
    
        setIsDownloading(true);
    
        const originalWidth = element.style.width;
        element.style.width = '800px'; 
    
        html2canvas(element, { 
            scale: 1,
            useCORS: true,
            windowWidth: 800
        }).then(canvas => {
            element.style.width = originalWidth;
    
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;
    
            const contentWidth = pdfWidth - margin * 2;
            const contentHeight = canvas.height * contentWidth / canvas.width;
            const pageHeight = pdfHeight - margin * 2;
    
            let heightLeft = contentHeight;
            let position = 0;
    
            pdf.addImage(canvas, 'PNG', margin, margin, contentWidth, contentHeight);
            heightLeft -= pageHeight;
    
            while (heightLeft > 0) {
                position = position - pageHeight;
                pdf.addPage();
                pdf.addImage(canvas, 'PNG', margin, position, contentWidth, contentHeight);
                heightLeft -= pageHeight;
            }
    
            const pageCount = pdf.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFontSize(9);
                pdf.setTextColor(128);
                pdf.text(`Page ${i} / ${pageCount}`, pdfWidth / 2, pdfHeight - 20, { align: 'center' });
                pdf.text(`${patient.lastName} ${patient.firstName} - ${new Date().toLocaleDateString('fr-FR')}`, margin, pdfHeight - 20);
            }
    
            const date = new Date().toISOString().slice(0, 10);
            pdf.save(`rapport-${patient.lastName}-${date}.pdf`);
        }).catch(err => {
            element.style.width = originalWidth;
            console.error("Erreur de génération PDF : ", err);
            alert("Une erreur est survenue lors de la génération du PDF.");
        }).finally(() => {
            setIsDownloading(false);
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Aperçu du Rapport Patient" maxWidth="max-w-4xl">
            <div ref={printableAreaRef} className="p-4 bg-white text-slate-800">
                {/* En-tête du document */}
                <div className="text-center border-b-2 border-slate-300 pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Rapport Patient - FPI</h1>
                    <p className="text-slate-500">Généré le: {new Date().toLocaleString('fr-FR')}</p>
                </div>

                {/* Section Informations Patient */}
                <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Informations du Patient</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>Nom :</strong> {patient.lastName.toUpperCase()}</p>
                        <p><strong>Prénom :</strong> {patient.firstName}</p>
                        <p><strong>Date de Naissance :</strong> {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Sexe :</strong> {patient.gender}</p>
                        <p><strong>Identifiant :</strong> {patient.identifier}</p>
                        <p><strong>Médecin Référent :</strong> {patient.referringDoctor}</p>
                    </div>
                </div>

                {/* Section Évolution Graphique */}
                {chartData.length > 1 && (
                    <div className="mb-8 break-inside-avoid-page">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Évolution des Paramètres Fonctionnels</h2>
                        <div className="w-full h-80 bg-white p-2 rounded-lg border border-slate-200">
                            <ResponsiveContainer>
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date">
                                        <Label value="Date de consultation" offset={-15} position="insideBottom" />
                                    </XAxis>
                                    <YAxis domain={[0, 'dataMax + 10']} unit="%" />
                                    <Tooltip />
                                    <Legend verticalAlign="top" />
                                    <Line type="monotone" dataKey="cvf" name="CVF (% prédit)" stroke="#38BDF8" strokeWidth={2} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="dlco" name="DLCO (% prédit)" stroke="#64748B" strokeWidth={2} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
                
                {/* Section Historique des Consultations */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Historique des Consultations</h2>
                    <div className="space-y-6">
                        {consultations.map(c => {
                            const summaryParts = c.formData.synthese.summary.split('--- RAPPORT IA ---');
                            const userSummary = summaryParts[0].trim();
                            const aiSummary = summaryParts.length > 1 ? summaryParts[1].trim() : null;

                            return (
                                <div key={c.id} className="p-4 border border-slate-200 rounded-lg break-inside-avoid-page">
                                    <h3 className="text-lg font-bold text-accent-blue border-b border-slate-200 pb-2 mb-3">
                                        Consultation du {new Date(c.consultationDate).toLocaleString('fr-FR')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <p><strong>CVF :</strong> {c.formData.examens.efr.cvfPercent || 'N/A'} %</p>
                                        <p><strong>DLCO :</strong> {c.formData.examens.efr.dlcoPercent || 'N/A'} %</p>
                                        <p><strong>TM6 (distance) :</strong> {c.formData.examens.tm6.distance || 'N/A'} m</p>
                                        <p><strong>TM6 (SpO2 min) :</strong> {c.formData.examens.tm6.spo2Min || 'N/A'} %</p>
                                        <p className="col-span-2"><strong>Pattern TDM-HR :</strong> {getTdmPattern(c)}</p>
                                        <div className="col-span-2 mt-2">
                                            <strong>Conclusion RCP :</strong>
                                            <div className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1 text-base">
                                                {userSummary || 'Aucune conclusion rédigée.'}
                                            </div>
                                        </div>
                                        <div className="col-span-2 mt-2">
                                            <strong>Synthèse IA :</strong>
                                            {aiSummary ? (
                                                <div
                                                    className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1 ai-report-content text-base"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(aiSummary) }}
                                                />
                                            ) : (
                                                <div className="text-slate-500 bg-slate-100 p-2 rounded border border-slate-200 mt-1 italic text-sm">
                                                    (Non générée pour cette consultation)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3 no-print">
                 <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                    Imprimer
                </button>
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 disabled:opacity-50"
                >
                    {isDownloading ? 'Génération...' : 'Télécharger le Rapport'}
                </button>
            </div>
        </Modal>
    );
};

export default ReportModal;