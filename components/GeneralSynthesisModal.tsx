import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Modal from './Modal';
import { Consultation, Patient } from '../types';
import { generateGeneralSynthesis } from '../services/geminiService';
import { parseMarkdown } from '../services/markdownParser';
import { ExclamationTriangleIcon, PaperAirplaneIcon } from '../constants';
import jsPDF from 'jspdf';

interface GeneralSynthesisModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    consultations: Consultation[];
}

const CustomizedLabel: React.FC<any> = (props) => {
    const { x, y, stroke, value } = props;
    if (value !== undefined && value !== null && value !== '') {
        return <text x={x} y={y} dy={-10} fill={stroke} fontSize={12} textAnchor="middle">{value}%</text>;
    }
    return null;
};

const GeneralSynthesisModal: React.FC<GeneralSynthesisModalProps> = ({ isOpen, onClose, patient, consultations }) => {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const printableAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && patient && consultations.length > 0) {
            const generateReport = async () => {
                setIsLoading(true);
                setError(null);
                setReport(null);
                // FIX: Update to handle streaming response from generateGeneralSynthesis.
                let fullReport = "";
                try {
                    await generateGeneralSynthesis(patient, consultations, (chunk: string) => {
                        fullReport += chunk;
                        // Update report as it streams
                        const cleanedResult = fullReport.includes('---') ? fullReport.split('---').slice(1).join('---').trim() : fullReport;
                        setReport(cleanedResult);
                    });
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
                } finally {
                    setIsLoading(false);
                }
            };
            generateReport();
        }
    }, [isOpen, patient, consultations]);
    
    const chartData = [...consultations]
      .filter(c => c.formData.examens.efr.cvfPercent || c.formData.examens.efr.dlcoPercent)
      .sort((a, b) => new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime())
      .map(c => ({
          date: new Date(c.consultationDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
          cvf: c.formData.examens.efr.cvfPercent || null,
          dlco: c.formData.examens.efr.dlcoPercent || null,
      }));

    const progressionConclusion = (() => {
        if (chartData.length < 2) return { text: "Données insuffisantes pour évaluer la progression." };
        const first = chartData[0];
        const last = chartData[chartData.length - 1];
        let cvfDecline: number | null = null, dlcoDecline: number | null = null;
        if (typeof first.cvf === 'number' && first.cvf > 0 && typeof last.cvf === 'number') cvfDecline = ((first.cvf - last.cvf) / first.cvf) * 100;
        if (typeof first.dlco === 'number' && first.dlco > 0 && typeof last.dlco === 'number') dlcoDecline = ((first.dlco - last.dlco) / first.dlco) * 100;
        const conclusionParts: string[] = [];
        if (cvfDecline !== null && cvfDecline > 10) conclusionParts.push(`baisse de ${cvfDecline.toFixed(0)}% de la CVF`);
        if (dlcoDecline !== null && dlcoDecline > 15) conclusionParts.push(`baisse de ${dlcoDecline.toFixed(0)}% de la DLCO`);
        if (conclusionParts.length > 0) return { text: `Profil évolutif avec ${conclusionParts.join(' et ')}.` };
        return { text: "Profil globalement stable sur la période observée." };
    })();

    const handlePrint = () => {
        const contentToPrint = printableAreaRef.current?.innerHTML;
        if (contentToPrint && patient) {
            const printWindow = window.open('', '_blank', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Synthèse Générale du Dossier Patient</title>');
                printWindow.document.write(`<style> @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'); body { font-family: 'Poppins', sans-serif; line-height: 1.6; color: #334155; margin: 2rem; } h1, h2, h3 { color: #0F172A; } h3 { border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem; margin-top: 1.5rem; } .recharts-wrapper { margin: 0 auto; } @media print { body { -webkit-print-color-adjust: exact; } } </style>`);
                printWindow.document.write('</head><body>');
                printWindow.document.write(contentToPrint);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
            }
        }
    };

    const generatePdfBlob = (): Promise<Blob> => {
        return new Promise((resolve) => {
            const element = printableAreaRef.current;
            if (!element) return;
            const pdf = new jsPDF('p', 'pt', 'a4');
            pdf.html(element, {
                callback: (doc) => {
                    resolve(doc.output('blob'));
                },
                x: 15,
                y: 15,
                width: 565,
                windowWidth: element.scrollWidth,
                html2canvas: { scale: 0.75, useCORS: true }
            });
        });
    };

    const handleDownloadPdf = async () => {
        if (!patient) return;
        setIsDownloading(true);
        const blob = await generatePdfBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `synthese-generale-${patient.lastName}-${date}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
    };

    const handleShare = async () => {
        if (!navigator.share || !patient) {
            alert("La fonction de partage n'est pas supportée sur ce navigateur.");
            return;
        }

        setIsSharing(true);
        try {
            const blob = await generatePdfBlob();
            const date = new Date().toISOString().slice(0, 10);
            const filename = `synthese-generale-${patient.lastName}-${date}.pdf`;
            const file = new File([blob], filename, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Synthèse patient ${patient.lastName}`,
                    text: `Ci-joint la synthèse du dossier pour ${patient.firstName} ${patient.lastName}.`,
                    files: [file],
                });
            } else {
                throw new Error("Impossible de partager ce type de fichier.");
            }
        } catch (error) {
            console.error('Erreur de partage:', error);
            if ( (error as Error).name !== 'AbortError') {
                 alert(`Erreur de partage : ${(error as Error).message}`);
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Synthèse Générale du Dossier Patient"
        >
            {isLoading && !report && (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600">Génération de la synthèse en cours...</p>
                    <p className="text-sm text-slate-500">L'IA analyse l'historique complet du patient.</p>
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
                            <h2 className="text-xl font-bold text-slate-800">Synthèse Générale - {patient?.firstName} {patient?.lastName}</h2>
                            <p className="text-sm text-slate-500">Date de génération : {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>

                        <div className="ai-report-content" dangerouslySetInnerHTML={{ __html: parseMarkdown(report) }}></div>
                        
                        {chartData.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-bold text-slate-800 mt-4 mb-2">Évolution des Paramètres Fonctionnels</h3>
                                <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 'dataMax + 10']} unit="%" />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="cvf" name="CVF (%)" stroke="#38BDF8" strokeWidth={2} activeDot={{ r: 8 }} label={<CustomizedLabel />} />
                                        <Line type="monotone" dataKey="dlco" name="DLCO (%)" stroke="#64748B" strokeWidth={2} activeDot={{ r: 8 }} label={<CustomizedLabel />} />
                                    </LineChart>
                                </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-slate-100 rounded-md text-center">
                                    <p className="font-semibold text-slate-700">Conclusion sur la progression :</p>
                                    <p className="text-slate-600">{progressionConclusion.text}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap justify-end gap-3">
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Imprimer
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isDownloading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-sky-500 to-accent-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50 disabled:opacity-50"
                        >
                            {isDownloading ? 'Téléchargement...' : 'Télécharger (PDF)'}
                        </button>
                        {navigator.share && (
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-violet-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 disabled:opacity-50"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                {isSharing ? 'Partage...' : 'Partager'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default GeneralSynthesisModal;
