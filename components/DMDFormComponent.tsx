import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Consultation, DMDFormData, Patient, TestResult } from '../types';
import { parseMarkdown } from '../services/markdownParser';
import CompletenessDashboard from './CompletenessDashboard';
import { checklistSections } from '../services/checklist';
import Modal from './Modal';
// FIX: Import 'generateExamSuggestions' to resolve the 'Cannot find name' error.
import { generateConsultationSynthesis, generateExamSuggestions } from '../services/geminiService';
import { SparklesIcon } from '../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// --- HELPER COMPONENTS ---
const Question: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="font-semibold text-slate-800 mb-2">{children}</p>
);

const SubHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-xl font-bold text-accent-blue mb-4 mt-6 border-b border-slate-300 pb-2">{children}</h3>
);

const QuestionBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`py-3 ${className}`}>{children}</div>
);

const ConditionalField: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => (
    <div className={`transition-all duration-300 overflow-hidden ${show ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mt-2 ml-4 pl-4 border-l-2 border-accent-blue">
         {children}
        </div>
    </div>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const EfrInputPair: React.FC<{
    label: string;
    baseName: string;
    value: number | '';
    percent: number | '';
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit: string;
}> = ({ label, baseName, value, percent, onChange, unit }) => (
    <div>
        <p className="font-semibold text-slate-700 text-center mb-2">{label}</p>
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <label htmlFor={`${baseName}Value`} className="text-xs text-slate-500">{unit}</label>
                <input
                    type="number"
                    name={`${baseName}Value`}
                    id={`${baseName}Value`}
                    value={value}
                    onChange={onChange}
                    placeholder="valeur"
                    className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
            </div>
            <div className="flex-1">
                <label htmlFor={`${baseName}Percent`} className="text-xs text-slate-500">% théo</label>
                <input
                    type="number"
                    name={`${baseName}Percent`}
                    id={`${baseName}Percent`}
                    value={percent}
                    onChange={onChange}
                    placeholder="%"
                    className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
            </div>
        </div>
    </div>
);

interface MultiInputFieldProps {
    label: string;
    section: keyof DMDFormData;
    field: string;
    values: string[];
    onDetailChange: (section: keyof DMDFormData, field: string, index: number, value: string) => void;
    onAddDetail: (section: keyof DMDFormData, field: string) => void;
    onRemoveDetail: (section: keyof DMDFormData, field: string, index: number) => void;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({ label, section, field, values, onDetailChange, onAddDetail, onRemoveDetail }) => (
    <>
        <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
        {values.map((detail, index) => (
            <div key={index} className="flex items-start gap-2 mb-2">
                <textarea
                    value={detail}
                    onChange={(e) => onDetailChange(section, field, index, e.target.value)}
                    rows={2}
                    className="flex-grow bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                {values.length > 1 && (
                    <button
                        type="button"
                        onClick={() => onRemoveDetail(section, field, index)}
                        className="p-2 mt-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"
                        aria-label="Supprimer ce champ"
                    >
                        <TrashIcon />
                    </button>
                )}
            </div>
        ))}
        <button
            type="button"
            onClick={() => onAddDetail(section, field)}
            className="mt-1 text-sm font-semibold text-accent-blue hover:text-sky-700"
        >
            + Ajouter une autre précision
        </button>
    </>
);

const ImmunoTestRow: React.FC<{
    testName: string;
    status: TestResult;
    onChange: (testName: string, status: TestResult) => void;
}> = ({ testName, status, onChange }) => {
    const isChecked = status !== 'Non réalisé';

    const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(testName, e.target.checked ? 'Positif' : 'Non réalisé'); // Default to Positive when checked
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(testName, e.target.value as TestResult);
    };

    return (
        <div className="flex items-center space-x-4 py-2 border-b border-slate-200 last:border-b-0">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer w-2/5">
                <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={handleCheckChange}
                    className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" 
                />
                <span>{testName}</span>
            </label>
            <div className={`flex items-center space-x-4 transition-opacity duration-300 ${isChecked ? 'opacity-100' : 'opacity-0'}`}>
                 <label className="flex items-center space-x-1 cursor-pointer">
                    <input 
                        type="radio" 
                        name={`immuno-${testName}`} 
                        value="Positif" 
                        checked={status === 'Positif'} 
                        onChange={handleStatusChange} 
                        disabled={!isChecked}
                        className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" 
                    />
                    <span>Positif</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                    <input 
                        type="radio" 
                        name={`immuno-${testName}`} 
                        value="Négatif" 
                        checked={status === 'Négatif'} 
                        onChange={handleStatusChange} 
                        disabled={!isChecked}
                        className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" 
                    />
                    <span>Négatif</span>
                </label>
            </div>
        </div>
    );
};

// --- GAP Score Component ---
const GapScoreCalculator: React.FC<{
    patient: Patient | null;
    formData: DMDFormData;
    onScoreChange: (score: number | '', stage: 'I' | 'II' | 'III' | '') => void;
}> = ({ patient, formData, onScoreChange }) => {

    const gapResult = useMemo(() => {
        const { patientAge } = formData.anamnese;
        const { cvfPercent, dlcoPercent } = formData.examens.efr;
        
        const isDataSufficient = patient?.gender && typeof patientAge === 'number' && typeof cvfPercent === 'number' && typeof dlcoPercent === 'number';

        if (!isDataSufficient) {
            return {
                breakdown: { gender: 'N/A', age: 'N/A', cvf: 'N/A', dlco: 'N/A' },
                totalScore: null,
                stage: null,
                interpretation: "Données insuffisantes (sexe, âge, CVF, DLCO).",
                color: "text-slate-500"
            };
        }

        const genderPoints = patient.gender === 'Homme' ? 1 : 0;
        const agePoints = patientAge <= 60 ? 0 : (patientAge <= 65 ? 1 : 2);
        const cvfPoints = cvfPercent > 75 ? 0 : (cvfPercent >= 50 ? 1 : 2);
        const dlcoPoints = dlcoPercent > 55 ? 0 : (dlcoPercent > 35 ? 1 : 2);

        const totalScore = genderPoints + agePoints + cvfPoints + dlcoPoints;

        let stage: 'I' | 'II' | 'III' | null = null;
        let interpretation = '';
        let color = '';

        if (totalScore <= 3) {
            stage = 'I';
            interpretation = "Stade I : Mortalité à 1 an ~6%";
            color = "text-green-600";
        } else if (totalScore <= 5) {
            stage = 'II';
            interpretation = "Stade II : Mortalité à 1 an ~16%";
            color = "text-amber-600";
        } else {
            stage = 'III';
            interpretation = "Stade III : Mortalité à 1 an ~39%";
            color = "text-red-600";
        }

        return {
            breakdown: { gender: genderPoints, age: agePoints, cvf: cvfPoints, dlco: dlcoPoints },
            totalScore,
            stage,
            interpretation,
            color
        };

    }, [patient, formData.anamnese.patientAge, formData.examens.efr.cvfPercent, formData.examens.efr.dlcoPercent]);

    useEffect(() => {
        onScoreChange(gapResult.totalScore ?? '', gapResult.stage ?? '');
    }, [gapResult.totalScore, gapResult.stage, onScoreChange]);

    return (
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
            <h4 className="font-bold text-slate-700 mb-3">Score Pronostique GAP</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-sm text-slate-500">Sexe (G)</p>
                    <p className="font-bold text-2xl text-slate-800">{gapResult.breakdown.gender}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">Âge (A)</p>
                    <p className="font-bold text-2xl text-slate-800">{gapResult.breakdown.age}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">CVF (P)</p>
                    <p className="font-bold text-2xl text-slate-800">{gapResult.breakdown.cvf}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">DLCO (P)</p>
                    <p className="font-bold text-2xl text-slate-800">{gapResult.breakdown.dlco}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500">Score Total</p>
                <p className="font-extrabold text-5xl text-accent-blue">{gapResult.totalScore ?? '-'}</p>
                <p className={`font-bold mt-2 text-lg ${gapResult.color}`}>{gapResult.interpretation}</p>
            </div>
        </div>
    );
};


// --- FORM COMPONENT ---
interface DMDFormComponentProps {
    initialConsultation: Consultation;
    patient: Patient | null;
    onSave: (consultation: Consultation) => void;
    onCancel: () => void;
}

const DMDFormComponent: React.FC<DMDFormComponentProps> = ({ initialConsultation, patient, onSave, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<DMDFormData>(initialConsultation.formData);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState('');
    const [isSummaryReportModalOpen, setIsSummaryReportModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const reportToPrintRef = useRef<HTMLDivElement>(null);


    // If initialConsultation changes, update the form data
    useEffect(() => {
        setFormData(initialConsultation.formData);
    }, [initialConsultation]);
    
    const steps = [
        { id: 1, title: 'Anamnèse' },
        { id: 2, title: 'Comorbidités' },
        { id: 3, title: 'Expositions' },
        { id: 4, title: 'Autres causes' },
        { id: 5, title: 'Scanner' },
        { id: 6, title: 'Autres' },
        { id: 7, title: 'Synthèse' },
    ];
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const path = name.split('.');

        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy to ensure immutability
            let current: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            const finalValue = type === 'number' && value !== '' ? parseFloat(value) : value;
            current[path[path.length - 1]] = finalValue;
            return newState;
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        const path = name.split('.');

        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]];
            }
            current[path[path.length - 1]] = checked;

            // If unchecking, reset dependent fields
            if (!checked) {
                if (name === 'examens.physicalExam.capillaroscopyPerformed') {
                    current['capillaroscopyResult'] = '';
                }
                if (name === 'examens.physicalExam.salivaryGlandBiopsyPerformed') {
                    current['salivaryGlandBiopsyResult'] = '';
                    current['salivaryGlandBiopsyOther'] = '';
                }
            }
            return newState;
        });
    };

    const handleMultiChoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        const path = name.split('.');
        
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let parent: any = newState;
            for (let i = 0; i < path.length - 1; i++) {
                parent = parent[path[i]];
            }
            const field = path[path.length - 1];
            let currentValues: string[] = parent[field] || [];

            if (name === 'examens.radiology.distribution') {
                if (checked) {
                    if (value === 'Diffuse') {
                        currentValues = ['Diffuse'];
                    } else {
                        currentValues = [...currentValues, value].filter(item => item !== 'Diffuse');
                    }
                } else {
                    currentValues = currentValues.filter(item => item !== value);
                }
            } else {
                if (checked) {
                    if (value.startsWith('Aucun')) {
                        currentValues = [value];
                    } else {
                        currentValues = [...currentValues, value].filter(item => !item.startsWith('Aucun'));
                    }
                } else {
                    currentValues = currentValues.filter(item => item !== value);
                }
            }
            
            parent[field] = currentValues;
            return newState;
        });
    };
    
    const handleDetailChange = (section: keyof DMDFormData, field: string, index: number, value: string) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const newDetailsArray = [...(newState[section] as any)[field]];
            newDetailsArray[index] = value;
            (newState[section] as any)[field] = newDetailsArray;
            return newState;
        });
    };
    
    const handleAddDetail = (section: keyof DMDFormData, field: string) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            const newDetailsArray = [...(newState[section] as any)[field], ''];
            (newState[section] as any)[field] = newDetailsArray;
            return newState;
        });
    };
    
    const handleRemoveDetail = (section: keyof DMDFormData, field: string, index: number) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            let newDetailsArray = (newState[section] as any)[field].filter((_: any, i: number) => i !== index);
            if (newDetailsArray.length === 0) {
                newDetailsArray.push('');
            }
            (newState[section] as any)[field] = newDetailsArray;
            return newState;
        });
    };
    
    const handleImmunoTestChange = (testName: string, status: TestResult) => {
        setFormData(prev => {
            const newState = JSON.parse(JSON.stringify(prev));
            newState.medicamenteux.immunology.tests[testName] = status;
            return newState;
        });
    };
    
    const handleSuggestionsUpdate = (suggestions: string) => {
        setFormData(prev => ({
            ...prev,
            synthese: {
                ...prev.synthese,
                aiSuggestions: suggestions
            }
        }));
    };
    
    const handleGapScoreChange = useCallback((score: number | '', stage: 'I' | 'II' | 'III' | '') => {
        setFormData(prev => {
            if (prev.synthese.gapScore === score && prev.synthese.gapStage === stage) {
                return prev;
            }
            return {
                ...prev,
                synthese: {
                    ...prev.synthese,
                    gapScore: score,
                    gapStage: stage,
                }
            };
        });
    }, []);


    const derivedPattern = useMemo(() => {
        const { distribution, honeycombing, reticulations, tractionBronchiectasis, atypicalFeatures } = formData.examens.radiology;

        const hasSpecificAtypicalFeatures = atypicalFeatures.length > 0 && !atypicalFeatures.includes('Aucun de ces aspects');
        const hasAtypicalDistribution = distribution.some(d => d === 'Péribronchovasculaire' || d === 'Aux lobes supérieurs');

        if (hasSpecificAtypicalFeatures || hasAtypicalDistribution) {
            return {
                name: "Pattern en faveur d'un Diagnostic Alternatif",
                reason: "Présence de signes ou d'une distribution atypiques pour une FPI.",
                color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-400"
            };
        }

        const isBasalSubpleural = distribution.includes('Sous-pleurale et basale');

        if (isBasalSubpleural && honeycombing === 'Oui' && reticulations === 'Oui') {
            return {
                name: "Pattern de PIC/UIP Certaine",
                reason: "Présence de rayon de miel ET de réticulations avec une distribution typique.",
                color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-400"
            };
        }

        if (isBasalSubpleural && honeycombing === 'Non' && (reticulations === 'Oui' || tractionBronchiectasis === 'Oui')) {
            return {
                name: "Pattern de PIC/UIP Probable",
                reason: "Distribution typique avec réticulations/bronchectasies de traction, mais sans rayon de miel.",
                color: "text-sky-600", bgColor: "bg-sky-50", borderColor: "border-sky-400"
            };
        }

        const isPristine = distribution.length === 0 && honeycombing === '' && reticulations === '' && tractionBronchiectasis === '' && atypicalFeatures.length === 0;
        if (isPristine) return null;

        return {
            name: "Pattern Indéterminé pour la PIC/UIP",
            reason: "Les critères pour une PIC certaine ou probable ne sont pas remplis.",
            color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-400"
        };
    }, [formData.examens.radiology]);

    const goToStep = (targetStep: number) => {
        setCurrentStep(targetStep);
    };
    
    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const validateForm = (): string[] => {
        const missing: string[] = [];
        checklistSections.forEach(section => {
            section.items.forEach(item => {
                if (item.critical && !item.checker(formData, patient)) {
                    missing.push(item.label);
                }
            });
        });
        return missing;
    };

    const handleSaveClick = async () => {
        const missingFields = validateForm();
        if (missingFields.length > 0) {
            setValidationErrors(missingFields);
            setIsValidationModalOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            if (!patient) throw new Error("Données patient non disponibles.");
            
            let summary = "";
            let fullSuggestions = "";
            
            // Run both API calls in parallel
            await Promise.all([
                generateConsultationSynthesis(
                    patient, 
                    { ...initialConsultation, formData },
                    (chunk) => { summary += chunk; }
                ),
                (async () => {
                    try {
                        await generateExamSuggestions(patient, formData, (chunk) => {
                            fullSuggestions += chunk;
                        });
                    } catch (suggestionError) {
                        // Don't block the main process if suggestions fail
                        console.error("Erreur lors de la génération des suggestions:", suggestionError);
                    }
                })()
            ]);
            
            const aiMarker = '--- RAPPORT IA ---';
            const userSummaryPart = formData.synthese.summary.split(aiMarker)[0].trim();

            const cleanedSummary = summary.includes('---') ? summary.split('---').slice(1).join('---').trim() : summary;
            const newFullSummary = `${userSummaryPart}\n\n${aiMarker}\n${cleanedSummary}`.trim();
            
            setFormData(prev => ({
                ...prev,
                synthese: {
                    ...prev.synthese,
                    summary: newFullSummary,
                    aiSuggestions: fullSuggestions,
                }
            }));
            
            setGeneratedSummary(cleanedSummary);
            setIsConfirmationModalOpen(true);

        } catch (error) {
            alert(`Erreur lors de la génération de la synthèse IA : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmAndSave = () => {
        onSave({
            ...initialConsultation,
            formData: formData,
        });
        setIsConfirmationModalOpen(false);
    };

    const handlePrint = () => {
        const contentToPrint = reportToPrintRef.current;
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
        const element = reportToPrintRef.current;
        if (!element || !patient) return;
    
        setIsDownloading(true);
    
        // Temporarily set a fixed width on the element to ensure correct wrapping for html2canvas
        const originalWidth = element.style.width;
        element.style.width = '800px';
    
        html2canvas(element, { 
            scale: 1, 
            useCORS: true, 
            windowWidth: element.scrollWidth // Use the element's scroll width after setting a fixed width
        })
        .then((canvas) => {
            // Restore original width after canvas capture
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
    
            // FIX: Use `pdf.getNumberOfPages()` instead of `pdf.internal.getNumberOfPages()`.
            const pageCount = pdf.getNumberOfPages();
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
    
            const date = new Date().toISOString().slice(0, 10);
            pdf.save(`rapport-${patient.lastName}-${date}.pdf`);
        })
        .catch(err => {
            element.style.width = originalWidth; // Restore on error
            console.error("Erreur de génération PDF : ", err);
            alert("Une erreur est survenue lors de la génération du PDF.");
        })
        .finally(() => {
            setIsDownloading(false);
        });
    };

    const baseTests = ['AAN', 'Facteur Rhumatoïde', 'Anti-CCP', 'ANCA', 'CPK'];
    const specificAntibodies = [
        'Anti-synthétases (Jo-1, PL-7, PL-12)', 'Anti-MDA5', 'Anti-TIF1γ', 'Anti-Scl-70', 
        'Anti-centromère', 'Anti-Ro52/SSA', 'Anti-La/SSB', 'Anti-Sm', 'Anti-RNP'
    ];
    
    const aiReport = formData.synthese.summary.split('--- RAPPORT IA ---')[1] || null;

    return (
        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    Consultation pour {patient?.firstName} {patient?.lastName.toUpperCase()}
                </h2>
                <p className="text-slate-500">Date : {new Date(initialConsultation.consultationDate).toLocaleString('fr-FR')}</p>
            </div>
            
            <CompletenessDashboard formData={formData} patient={patient} onSuggestionsGenerated={handleSuggestionsUpdate} />

            <div className="flex mb-8 mt-8">
                {steps.map((step, index) => (
                    <button
                        key={step.id}
                        onClick={() => goToStep(index)}
                        className="flex-1 text-center cursor-pointer group p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label={`Aller à l'étape ${step.title}`}
                    >
                        <div className={`h-1 transition-colors group-hover:bg-sky-300 ${index <= currentStep ? 'bg-accent-blue' : 'bg-slate-300'}`}></div>
                        <p className={`mt-2 text-sm font-bold transition-colors group-hover:text-sky-500 ${
                            index === currentStep 
                            ? 'text-accent-blue' 
                            : index < currentStep 
                            ? 'text-slate-700' 
                            : 'text-slate-400'
                        }`}>{step.title}</p>
                    </button>
                ))}
            </div>
            
            {/* Form content based on currentStep */}
            <div className="min-h-[400px]">
              {currentStep === 0 && (
                    <div>
                        <SubHeader>Étape 1 : Anamnèse & Symptômes</SubHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                             <QuestionBlock className="md:col-span-2">
                                <Question>Antécédents de PID, pathologies auto-immunes, ou maladies hépatiques/hématologiques dans la famille ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui', 'Non', 'Ne sait pas'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="anamnese.familialHistory" value={option} checked={formData.anamnese.familialHistory === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <ConditionalField show={formData.anamnese.familialHistory === 'Oui'}>
                                   <MultiInputField
                                        label="Préciser (lien de parenté, pathologie) :"
                                        section="anamnese"
                                        field="familialHistoryDetails"
                                        values={formData.anamnese.familialHistoryDetails}
                                        onDetailChange={handleDetailChange}
                                        onAddDetail={handleAddDetail}
                                        onRemoveDetail={handleRemoveDetail}
                                    />
                                </ConditionalField>
                            </QuestionBlock>
                            <QuestionBlock>
                                <Question>Âge du patient au moment du diagnostic ?</Question>
                                <input type="number" name="anamnese.patientAge" value={formData.anamnese.patientAge} onChange={handleInputChange} className="form-input w-32 bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                            </QuestionBlock>
                             <QuestionBlock>
                                <Question>Statut tabagique ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Actif', 'Sevré', 'Jamais'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="anamnese.smokingStatus" value={option} checked={formData.anamnese.smokingStatus === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <ConditionalField show={formData.anamnese.smokingStatus === 'Sevré' || formData.anamnese.smokingStatus === 'Actif'}>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Nombre de paquets-années :</label>
                                    <input type="number" name="anamnese.smokingPA" value={formData.anamnese.smokingPA} onChange={handleInputChange} className="form-input w-32 bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                </ConditionalField>
                            </QuestionBlock>
                             <QuestionBlock className="md:col-span-2">
                                <Question>Décrire la symptomatologie clinique (date d'apparition, évolution) :</Question>
                                <textarea name="anamnese.symptomatology" value={formData.anamnese.symptomatology} onChange={handleInputChange} placeholder="Ex: Dyspnée d'effort depuis 2 ans, majorée depuis 6 mois..." rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical" />
                            </QuestionBlock>
                             <QuestionBlock className="md:col-span-2">
                                <Question>Échelle de dyspnée :</Question>
                                <div className="flex items-center gap-4">
                                    <select name="anamnese.dyspneaScale.scale" value={formData.anamnese.dyspneaScale.scale} onChange={handleInputChange} className="form-select w-40 bg-slate-50 border-slate-300 rounded-md p-2">
                                        <option value="">Choisir</option>
                                        <option value="mMRC">mMRC</option>
                                        <option value="Borg">Borg</option>
                                    </select>
                                    <input type="number" name="anamnese.dyspneaScale.value" value={formData.anamnese.dyspneaScale.value} onChange={handleInputChange} disabled={!formData.anamnese.dyspneaScale.scale} className="form-input w-32 bg-slate-50 border-slate-300 rounded-md p-2 disabled:bg-slate-200" />
                                </div>
                            </QuestionBlock>
                        </div>
                        <h4 className="text-lg font-bold text-slate-700 mb-3 mt-6">Recherche de signes de connectivite (Anamnèse)</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                            <div>
                                <p className="font-semibold text-slate-600 mb-2">Signes Articulaires</p>
                                {['Arthralgies inflammatoires', 'Mains de mécanicien', 'Doigts boudinés / Sclérodactylie', 'Arthrite (gonflement articulaire)'].map(option => (
                                    <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                        <input type="checkbox" name="anamnese.ctdSigns.articular" value={option} checked={formData.anamnese.ctdSigns.articular.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-600 mb-2">Signes Cutanés</p>
                                {['Phénomène de Raynaud', 'Rash héliotrope (paupières)', 'Papules de Gottron', 'Ulcères digitaux', 'Photosensibilité', 'Livedo reticularis'].map(option => (
                                    <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                        <input type="checkbox" name="anamnese.ctdSigns.cutaneous" value={option} checked={formData.anamnese.ctdSigns.cutaneous.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-600 mb-2">Signes Musculaires</p>
                                {['Myalgies', 'Déficit musculaire proximal'].map(option => (
                                    <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                        <input type="checkbox" name="anamnese.ctdSigns.muscular" value={option} checked={formData.anamnese.ctdSigns.muscular.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                             <div>
                                <p className="font-semibold text-slate-600 mb-2">Syndrome Sec (Sicca)</p>
                                {['Sécheresse oculaire', 'Sécheresse buccale'].map(option => (
                                    <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                        <input type="checkbox" name="anamnese.ctdSigns.sicca" value={option} checked={formData.anamnese.ctdSigns.sicca.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="lg:col-span-2">
                                <label htmlFor="anamnese.ctdSigns.other" className="font-semibold text-slate-600 mb-2">Autres signes rapportés :</label>
                                <input type="text" name="anamnese.ctdSigns.other" id="anamnese.ctdSigns.other" value={formData.anamnese.ctdSigns.other} onChange={handleInputChange} placeholder="Fièvre inexpliquée, amaigrissement, dysphagie..." className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                            </div>
                        </div>
                    </div>
                )}
                
                {currentStep === 1 && (
                     <div>
                        <SubHeader>Étape 2 : Comorbidités Fréquentes</SubHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            {[
                                { id: 'rgo', label: 'Reflux Gastro-Œsophagien (RGO)' },
                                { id: 'saos', label: 'Apnées du Sommeil (SAOS)' },
                                { id: 'cardio', label: 'Pathologie cardiovasculaire' },
                                { id: 'emphyseme', label: 'Emphysème associé' },
                                { id: 'htp', label: 'HTP connue' },
                                { id: 'cancer', label: 'Antécédent de cancer broncho-pulmonaire' },
                                { id: 'depression', label: 'Dépression / Anxiété' },
                            ].map(comorbidity => (
                                <QuestionBlock key={comorbidity.id}>
                                    <Question>{comorbidity.label} ?</Question>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {['Oui', 'Non', 'Non recherché'].map(option => (
                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                <input type="radio" name={`anamnese.comorbidities.${comorbidity.id}`} value={option} checked={formData.anamnese.comorbidities[comorbidity.id as keyof typeof formData.anamnese.comorbidities] === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </QuestionBlock>
                            ))}
                             <QuestionBlock className="md:col-span-2">
                                <Question>Précisions sur les comorbidités (traitement, sévérité...) :</Question>
                                <textarea name="anamnese.comorbiditiesDetails" value={formData.anamnese.comorbiditiesDetails} onChange={handleInputChange} placeholder="Ex: RGO traité par IPP, SAOS appareillé..." rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical" />
                            </QuestionBlock>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <SubHeader>Étape 3 : Expositions Environnementales & Domestiques</SubHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                            <QuestionBlock className="md:col-span-2">
                                <Question>Expositions professionnelles ou domestiques notables ?</Question>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                    {['Poussières minérales (amiante, silice)', 'Poussières végétales/animales', 'Moisissures', 'Oiseaux/plumes', 'Textiles', 'Métaux', 'Aucune connue'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="checkbox" name="environnement.exposures" value={option} checked={formData.environnement.exposures.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <ConditionalField show={formData.environnement.exposures.length > 0 && !formData.environnement.exposures.includes('Aucune connue')}>
                                    <MultiInputField
                                        label="Préciser la durée et l'intensité de l'exposition :"
                                        section="environnement"
                                        field="exposureDetails"
                                        values={formData.environnement.exposureDetails}
                                        onDetailChange={handleDetailChange}
                                        onAddDetail={handleAddDetail}
                                        onRemoveDetail={handleRemoveDetail}
                                    />
                                </ConditionalField>
                            </QuestionBlock>
                            <QuestionBlock>
                                <Question>Détails sur l'habitat, les loisirs, ou les animaux de compagnie ?</Question>
                                <textarea name="environnement.habitatDetails" value={formData.environnement.habitatDetails} onChange={handleInputChange} placeholder="Ex: Pigeons sur le balcon, cave humide, travail du bois en amateur..." rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical" />
                            </QuestionBlock>
                            <QuestionBlock>
                                <Question>Des précipitines sériques ont-elles été demandées ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui, positives', 'Oui, négatives', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="environnement.precipitines" value={option} checked={formData.environnement.precipitines === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <ConditionalField show={formData.environnement.precipitines === 'Oui, positives'}>
                                    <MultiInputField
                                        label="Si oui, lesquelles ?"
                                        section="environnement"
                                        field="precipitinesDetails"
                                        values={formData.environnement.precipitinesDetails}
                                        onDetailChange={handleDetailChange}
                                        onAddDetail={handleAddDetail}
                                        onRemoveDetail={handleRemoveDetail}
                                    />
                                </ConditionalField>
                            </QuestionBlock>
                        </div>
                    </div>
                )}
                
                {currentStep === 3 && (
                     <div>
                        <SubHeader>Étape 4 : Causes Médicamenteuses et Bilan Immunologique</SubHeader>
                        <div className="space-y-6">
                            <QuestionBlock>
                                <Question>Notion de prise médicamenteuse à risque fibrosant ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="medicamenteux.hasRiskMeds" value={option} checked={formData.medicamenteux.hasRiskMeds === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <ConditionalField show={formData.medicamenteux.hasRiskMeds === 'Oui'}>
                                    <label className="block text-sm font-medium text-slate-600 mb-1 mt-2">Inventaire des médicaments (notamment ceux à risque fibrosant) :</label>
                                    <textarea name="medicamenteux.medsList" value={formData.medicamenteux.medsList} onChange={handleInputChange} placeholder="Amiodarone, nitrofurantoïne, méthotrexate, bléomycine, biothérapies..." rows={3} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical" />
                                </ConditionalField>
                            </QuestionBlock>

                             <QuestionBlock>
                                <Question>Antécédents d'exposition à des radiations ou drogues ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="medicamenteux.radiation" value={option} checked={formData.medicamenteux.radiation === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>
                             <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                                <h4 className="font-bold text-slate-700 mb-3">Bilan Immunologique</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <div>
                                        <p className="font-semibold text-slate-600 mb-2">Bilan de base</p>
                                        {baseTests.map(test => (
                                            <React.Fragment key={test}>
                                                <ImmunoTestRow 
                                                    testName={test}
                                                    status={formData.medicamenteux.immunology.tests[test]}
                                                    onChange={handleImmunoTestChange}
                                                />
                                                {test === 'AAN' && (
                                                    <ConditionalField show={formData.medicamenteux.immunology.tests['AAN'] === 'Positif'}>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
                                                            <div>
                                                                <label htmlFor="medicamenteux.immunology.aanTiter" className="block text-sm font-medium text-slate-600 mb-1">Titre des AAN :</label>
                                                                <select name="medicamenteux.immunology.aanTiter" id="medicamenteux.immunology.aanTiter" value={formData.medicamenteux.immunology.aanTiter} onChange={handleInputChange} className="form-select w-full bg-white border-slate-300 rounded-md p-2">
                                                                    <option value="">Sélectionner</option>
                                                                    <option value="Négatif">Négatif</option>
                                                                    <option value="< 1/160">&lt; 1/160</option>
                                                                    <option value="1/160">1/160</option>
                                                                    <option value="1/320">1/320</option>
                                                                    <option value="1/640">1/640</option>
                                                                    <option value="> 1/640">&gt; 1/640</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="medicamenteux.immunology.aanPattern" className="block text-sm font-medium text-slate-600 mb-1">Aspect des AAN :</label>
                                                                <select name="medicamenteux.immunology.aanPattern" id="medicamenteux.immunology.aanPattern" value={formData.medicamenteux.immunology.aanPattern} onChange={handleInputChange} className="form-select w-full bg-white border-slate-300 rounded-md p-2">
                                                                    <option value="">Sélectionner</option>
                                                                    <option value="Non applicable">Non applicable</option>
                                                                    <option value="Moucheté">Moucheté</option>
                                                                    <option value="Homogène">Homogène</option>
                                                                    <option value="Nucléolaire">Nucléolaire</option>
                                                                    <option value="Centromérique">Centromérique</option>
                                                                    <option value="Cytoplasmique">Cytoplasmique</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </ConditionalField>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-600 mb-2">Anticorps spécifiques</p>
                                        {specificAntibodies.map(test => (
                                            <ImmunoTestRow 
                                                key={test}
                                                testName={test}
                                                status={formData.medicamenteux.immunology.tests[test]}
                                                onChange={handleImmunoTestChange}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <QuestionBlock className="mt-4 pt-4 border-t border-slate-200">
                                    <Question>Autres résultats immunologiques ou biologiques pertinents :</Question>
                                    <textarea name="medicamenteux.immunology.otherTests" value={formData.medicamenteux.immunology.otherTests} onChange={handleInputChange} placeholder="Ex: FR positif à X UI/mL, CPK à X UI/L..." rows={2} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                </QuestionBlock>
                            </div>
                        </div>
                    </div>
                )}
                
                {currentStep === 4 && (
                     <div>
                        <SubHeader>Étape 5 : Analyse du Scanner Thoracique (TDM-HR)</SubHeader>
                        <div className="md:col-span-2 p-4 border border-slate-300 rounded-lg bg-slate-50/70 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="examens.radiology.hrctDate" className="block text-sm font-medium text-slate-600 mb-1">Date du scanner :</label>
                                    <input type="date" id="examens.radiology.hrctDate" name="examens.radiology.hrctDate" value={formData.examens.radiology.hrctDate} onChange={handleInputChange} className="form-input w-full bg-white border-slate-300 rounded-md p-2" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Protocole HRCT approprié ?</label>
                                     <div className="flex flex-wrap gap-x-4 gap-y-2">
                                        {['Approprié', 'Non approprié', 'Inconnu'].map(option => (
                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                <input type="radio" name="examens.radiology.hrctProtocol" value={option} checked={formData.examens.radiology.hrctProtocol === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <QuestionBlock>
                                <Question>1. Quelle est la distribution prédominante des anomalies ?</Question>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Sous-pleurale et basale', 'Péribronchovasculaire', 'Diffuse', 'Aux lobes supérieurs'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="checkbox" name="examens.radiology.distribution" value={option} checked={formData.examens.radiology.distribution.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>

                            <QuestionBlock>
                                <Question>2. Y a-t-il une présence de rayons de miel (honeycombing) ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="examens.radiology.honeycombing" value={option} checked={formData.examens.radiology.honeycombing === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>

                            <QuestionBlock>
                                <Question>3. Y a-t-il une présence de réticulations ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="examens.radiology.reticulations" value={option} checked={formData.examens.radiology.reticulations === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>

                             <QuestionBlock>
                                <Question>4. Y a-t-il une présence de bronchectasies de traction ?</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    {['Oui', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="examens.radiology.tractionBronchiectasis" value={option} checked={formData.examens.radiology.tractionBronchiectasis === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>

                            <QuestionBlock>
                                <Question>5. Y a-t-il des aspects atypiques ou en faveur d'un autre diagnostic ?</Question>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Verre dépoli prédominant', 'Consolidations', 'Nodules diffus', 'Kystes multiples', 'Piégeage aérique important', 'Aucun de ces aspects'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="checkbox" name="examens.radiology.atypicalFeatures" value={option} checked={formData.examens.radiology.atypicalFeatures.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>
                            
                            <QuestionBlock>
                                <Question>6. Quantification estimée de la fibrose (%) :</Question>
                                <input type="number" name="examens.radiology.fibrosisExtent" value={formData.examens.radiology.fibrosisExtent} onChange={handleInputChange} placeholder="ex: 25" className="form-input w-32 bg-white border-slate-300 rounded-md p-2" />
                            </QuestionBlock>

                            {derivedPattern && (
                                <div className={`mt-6 p-4 border-l-4 rounded-r-lg ${derivedPattern.borderColor} ${derivedPattern.bgColor}`}>
                                    <p className="font-bold text-sm text-slate-700">Conclusion radiologique probable :</p>
                                    <p className={`text-xl font-bold ${derivedPattern.color}`}>{derivedPattern.name}</p>
                                    <p className={`text-xs mt-1 italic ${derivedPattern.color}`}>{derivedPattern.reason}</p>
                                </div>
                            )}
                        </div>
                         <QuestionBlock className="md:col-span-2 mt-6">
                            <Question>Rapport de l'expert en imagerie thoracique</Question>
                            <textarea
                                name="examens.radiology.radiologyReport"
                                value={formData.examens.radiology.radiologyReport}
                                onChange={handleInputChange}
                                placeholder="Rédiger le compte-rendu ou les points clés du rapport radiologique..."
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical"
                            />
                        </QuestionBlock>
                    </div>
                )}
                
                {currentStep === 5 && (
                    <div>
                        <SubHeader>Étape 6 : Examen Clinique & Paraclinique</SubHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                             <div className="md:col-span-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                                 <h4 className="font-bold text-slate-700 mb-3">Examen Physique</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <p className="font-semibold text-slate-600 mb-2">Examen Respiratoire</p>
                                        {["Râles crépitants 'velcro'", "Hippocratisme digital", "Cyanose", "Signes d'HTP"].map(option => (
                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                                <input type="checkbox" name="examens.physicalExam.respiratory" value={option} checked={formData.examens.physicalExam.respiratory.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                     </div>
                                      <div>
                                        <p className="font-semibold text-slate-600 mb-2">Examen Cutané</p>
                                        {["Telangiectasies", "Sclérodactylie", "Rash malaire", "Livedo reticularis"].map(option => (
                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                                <input type="checkbox" name="examens.physicalExam.cutaneous" value={option} checked={formData.examens.physicalExam.cutaneous.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                     </div>
                                     <div>
                                        <p className="font-semibold text-slate-600 mb-2">Examen Articulaire</p>
                                        {["Arthrite / Synovite", "Déformations articulaires"].map(option => (
                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                                <input type="checkbox" name="examens.physicalExam.articular" value={option} checked={formData.examens.physicalExam.articular.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                     </div>
                                      <div>
                                        <p className="font-semibold text-slate-600 mb-2">Autres Examens</p>
                                        <div className="space-y-3">
                                            {/* Capillaroscopy */}
                                            <div>
                                                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                    <input type="checkbox" name="examens.physicalExam.capillaroscopyPerformed" checked={!!formData.examens.physicalExam.capillaroscopyPerformed} onChange={handleCheckboxChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                    <span>Capillaroscopie</span>
                                                </label>
                                                <ConditionalField show={!!formData.examens.physicalExam.capillaroscopyPerformed}>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                                        {['Normale', 'Anormale'].map(option => (
                                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                                <input type="radio" name="examens.physicalExam.capillaroscopyResult" value={option} checked={formData.examens.physicalExam.capillaroscopyResult === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                                                <span>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </ConditionalField>
                                            </div>
                                            {/* Salivary Gland Biopsy */}
                                            <div>
                                                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                    <input type="checkbox" name="examens.physicalExam.salivaryGlandBiopsyPerformed" checked={!!formData.examens.physicalExam.salivaryGlandBiopsyPerformed} onChange={handleCheckboxChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                    <span>Biopsie des glandes salivaires</span>
                                                </label>
                                                <ConditionalField show={!!formData.examens.physicalExam.salivaryGlandBiopsyPerformed}>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                                        {['Normale', 'Sialadenitis', 'Autre'].map(option => (
                                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                                <input type="radio" name="examens.physicalExam.salivaryGlandBiopsyResult" value={option} checked={formData.examens.physicalExam.salivaryGlandBiopsyResult === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                                                <span>{option}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <ConditionalField show={formData.examens.physicalExam.salivaryGlandBiopsyResult === 'Autre'}>
                                                        <input type="text" name="examens.physicalExam.salivaryGlandBiopsyOther" value={formData.examens.physicalExam.salivaryGlandBiopsyOther} onChange={handleInputChange} placeholder="Préciser le résultat" className="form-input w-full mt-2 bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                                    </ConditionalField>
                                                </ConditionalField>
                                            </div>
                                        </div>
                                    </div>
                                      <div className="md:col-span-2">
                                        <label htmlFor="examens.physicalExam.other" className="font-semibold text-slate-600 mb-2">Autres trouvailles à l'examen :</label>
                                        <input type="text" name="examens.physicalExam.other" id="examens.physicalExam.other" value={formData.examens.physicalExam.other} onChange={handleInputChange} placeholder="Adénopathies, hépatomégalie..." className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                    </div>
                                 </div>
                             </div>
                            <QuestionBlock className="md:col-span-2">
                                <Question>Résultats des Explorations Fonctionnelles Respiratoires (EFR) :</Question>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <EfrInputPair label="CVF" baseName="examens.efr.cvf" value={formData.examens.efr.cvfValue} percent={formData.examens.efr.cvfPercent} onChange={handleInputChange} unit="L" />
                                    <EfrInputPair label="CPT" baseName="examens.efr.cpt" value={formData.examens.efr.cptValue} percent={formData.examens.efr.cptPercent} onChange={handleInputChange} unit="L" />
                                    <EfrInputPair label="VEMS" baseName="examens.efr.vems" value={formData.examens.efr.vemsValue} percent={formData.examens.efr.vemsPercent} onChange={handleInputChange} unit="L" />
                                    <EfrInputPair label="DLCO" baseName="examens.efr.dlco" value={formData.examens.efr.dlcoValue} percent={formData.examens.efr.dlcoPercent} onChange={handleInputChange} unit="ml/min/mmHg" />
                                </div>
                                <div className="mt-2">
                                     <label htmlFor="examens.efr.efrInterpretation" className="block text-sm font-medium text-slate-600 mb-1">Interprétation du pattern :</label>
                                     <select name="examens.efr.efrInterpretation" id="examens.efr.efrInterpretation" value={formData.examens.efr.efrInterpretation} onChange={handleInputChange} className="form-select w-full md:w-1/2 bg-white border-slate-300 rounded-md p-2">
                                        <option value="">Sélectionner</option>
                                        <option value="Restrictif">Syndrome restrictif</option>
                                        <option value="Mixte">Syndrome mixte (obstructif + restrictif)</option>
                                        <option value="Normal">Volumes normaux</option>
                                        <option value="Autre">Autre</option>
                                     </select>
                                </div>
                            </QuestionBlock>
                            <QuestionBlock className="md:col-span-2">
                                <Question>Résultats du Test de Marche de 6 minutes (TM6) :</Question>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div>
                                        <label htmlFor="examens.tm6.distance" className="block text-sm font-medium text-slate-600 mb-1">Distance (mètres) :</label>
                                        <input
                                            type="number"
                                            name="examens.tm6.distance"
                                            id="examens.tm6.distance"
                                            value={formData.examens.tm6.distance}
                                            onChange={handleInputChange}
                                            placeholder="ex: 350"
                                            className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="examens.tm6.spo2Baseline" className="block text-sm font-medium text-slate-600 mb-1">SpO2 de base (%) :</label>
                                        <input
                                            type="number"
                                            name="examens.tm6.spo2Baseline"
                                            id="examens.tm6.spo2Baseline"
                                            value={formData.examens.tm6.spo2Baseline}
                                            onChange={handleInputChange}
                                            placeholder="ex: 96"
                                            className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="examens.tm6.spo2Min" className="block text-sm font-medium text-slate-600 mb-1">SpO2 minimale (%) :</label>
                                        <input
                                            type="number"
                                            name="examens.tm6.spo2Min"
                                            id="examens.tm6.spo2Min"
                                            value={formData.examens.tm6.spo2Min}
                                            onChange={handleInputChange}
                                            placeholder="ex: 87"
                                            className="form-input w-full bg-white border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                        />
                                    </div>
                                </div>
                            </QuestionBlock>
                            <QuestionBlock className="md:col-span-2">
                                <Question>Échocardiographie :</Question>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                                    {['Oui', 'Non'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="radio" name="examens.echocardiography.performed" value={option} checked={formData.examens.echocardiography.performed === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <ConditionalField show={formData.examens.echocardiography.performed === 'Oui'}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div>
                                            <label htmlFor="examens.echocardiography.paps" className="block text-sm font-medium text-slate-600 mb-1">PAPS estimée (mmHg) :</label>
                                            <input type="number" name="examens.echocardiography.paps" id="examens.echocardiography.paps" value={formData.examens.echocardiography.paps} onChange={handleInputChange} placeholder="ex: 45" className="form-input w-full bg-white border-slate-300 rounded-md p-2"/>
                                        </div>
                                        <div>
                                            <label htmlFor="examens.echocardiography.lvef" className="block text-sm font-medium text-slate-600 mb-1">FEVG (%) :</label>
                                            <input type="number" name="examens.echocardiography.lvef" id="examens.echocardiography.lvef" value={formData.examens.echocardiography.lvef} onChange={handleInputChange} placeholder="ex: 60" className="form-input w-full bg-white border-slate-300 rounded-md p-2"/>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="block text-sm font-medium text-slate-600 mb-1">Signes indirects d'HTAP :</p>
                                             {['Dilatation des cavités droites', 'Dysfonction VD', 'Aplatissement du SIV'].map(option => (
                                                <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                                    <input type="checkbox" name="examens.echocardiography.pahSigns" value={option} checked={formData.examens.echocardiography.pahSigns.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </ConditionalField>
                            </QuestionBlock>
                        </div>
                    </div>
                )}

                {currentStep === 6 && (
                     (() => {
                        const aiMarker = '--- RAPPORT IA ---';
                        const summaryParts = formData.synthese.summary.split(aiMarker);
                        const userSummary = summaryParts[0];
                        const aiReport = summaryParts.length > 1 ? summaryParts[1] : null;

                        const handleUserSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const newUserSummary = e.target.value;
                            
                            setFormData(prev => {
                                const prevSummaryParts = prev.synthese.summary.split(aiMarker);
                                const prevAiReport = prevSummaryParts.length > 1 ? prevSummaryParts[1] : null;

                                const newFullSummary = prevAiReport 
                                    ? `${newUserSummary.trim()}\n\n${aiMarker}\n${prevAiReport.trim()}`
                                    : newUserSummary;

                                return {
                                    ...prev,
                                    synthese: {
                                        ...prev.synthese,
                                        summary: newFullSummary,
                                    },
                                };
                            });
                        };

                        return (
                            <div>
                                <SubHeader>Étape 7 : Synthèse & Examens Invasifs</SubHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    <QuestionBlock>
                                        <Question>Un lavage broncho-alvéolaire (LBA) a-t-il été réalisé ?</Question>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                                            {['Oui', 'Non'].map(option => (
                                                <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                    <input type="radio" name="synthese.lba" value={option} checked={formData.synthese.lba === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <ConditionalField show={formData.synthese.lba === 'Oui'}>
                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <label htmlFor="synthese.lbaCellularity.total" className="block text-sm font-medium text-slate-600 mb-1">Cellularité totale (éléments/ml) :</label>
                                                    <input type="number" name="synthese.lbaCellularity.total" id="synthese.lbaCellularity.total" value={formData.synthese.lbaCellularity.total} onChange={handleInputChange} placeholder="ex: 200000" className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="synthese.lbaCellularity.lymphocytes" className="block text-sm font-medium text-slate-600 mb-1">Lymphocytes (%) :</label>
                                                        <input type="number" name="synthese.lbaCellularity.lymphocytes" id="synthese.lbaCellularity.lymphocytes" value={formData.synthese.lbaCellularity.lymphocytes} onChange={handleInputChange} placeholder="%" className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="synthese.lbaCellularity.neutrophiles" className="block text-sm font-medium text-slate-600 mb-1">Neutrophiles (%) :</label>
                                                        <input type="number" name="synthese.lbaCellularity.neutrophiles" id="synthese.lbaCellularity.neutrophiles" value={formData.synthese.lbaCellularity.neutrophiles} onChange={handleInputChange} placeholder="%" className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="synthese.lbaCellularity.eosinophiles" className="block text-sm font-medium text-slate-600 mb-1">Éosinophiles (%) :</label>
                                                        <input type="number" name="synthese.lbaCellularity.eosinophiles" id="synthese.lbaCellularity.eosinophiles" value={formData.synthese.lbaCellularity.eosinophiles} onChange={handleInputChange} placeholder="%" className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                                    </div>
                                                     <div>
                                                        <label htmlFor="synthese.lbaCellularity.lbaCd4Cd8Ratio" className="block text-sm font-medium text-slate-600 mb-1">Ratio CD4/CD8 :</label>
                                                        <input type="number" name="synthese.lbaCellularity.lbaCd4Cd8Ratio" id="synthese.lbaCellularity.lbaCd4Cd8Ratio" value={formData.synthese.lbaCellularity.lbaCd4Cd8Ratio} onChange={handleInputChange} placeholder="ex: 2.5" className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                                                    </div>
                                                </div>
                                            </div>
                                        </ConditionalField>
                                    </QuestionBlock>
                                    <QuestionBlock>
                                        <Question>Une biopsie pulmonaire a-t-elle été réalisée ?</Question>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                                            {['Oui (chirurgicale)', 'Oui (cryobiopsie)', 'Non'].map(option => (
                                                <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                    <input type="radio" name="synthese.biopsy" value={option} checked={formData.synthese.biopsy === option} onChange={handleInputChange} className="form-radio bg-slate-100 border-slate-300 text-accent-blue focus:ring-accent-blue" />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <ConditionalField show={formData.synthese.biopsy.startsWith('Oui')}>
                                             <MultiInputField
                                                label="Quel est le résultat histopathologique ?"
                                                section="synthese"
                                                field="biopsyResult"
                                                values={formData.synthese.biopsyResult}
                                                onDetailChange={handleDetailChange}
                                                onAddDetail={handleAddDetail}
                                                onRemoveDetail={handleRemoveDetail}
                                            />
                                        </ConditionalField>
                                    </QuestionBlock>
                                    <QuestionBlock className="md:col-span-2">
                                        <GapScoreCalculator patient={patient} formData={formData} onScoreChange={handleGapScoreChange} />
                                    </QuestionBlock>
                                    <QuestionBlock className="md:col-span-2">
                                        <Question>Question(s) principale(s) posée(s) à la RCP :</Question>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                            {['Confirmation diagnostique', 'Indication thérapeutique', 'Discussion de biopsie', 'Autre (préciser)'].map(option => (
                                                <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                                    <input type="checkbox" name="synthese.rcpQuestion" value={option} checked={formData.synthese.rcpQuestion.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </QuestionBlock>
                                    <QuestionBlock className="md:col-span-2">
                                        <Question>Synthèse et conclusion du comité RCP :</Question>
                                        <textarea 
                                            value={userSummary} 
                                            onChange={handleUserSummaryChange} 
                                            placeholder="Résumé des éléments clés et des questions en suspens..." 
                                            rows={4} 
                                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical" 
                                        />
                                        {aiReport && (
                                            <div className="mt-6">
                                                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Rapport de Synthèse IA (non-modifiable)</h4>
                                                <div 
                                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-none ai-report-content"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(aiReport) }}
                                                >
                                                </div>
                                            </div>
                                        )}
                                        {formData.synthese.aiSuggestions && (
                                            <div className="mt-6">
                                                <h4 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Suggestions d'examens complémentaires (IA)</h4>
                                                <div 
                                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-none ai-report-content"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.synthese.aiSuggestions) }}
                                                >
                                                </div>
                                            </div>
                                        )}
                                    </QuestionBlock>
                                </div>
                            </div>
                        )
                    })()
                )}
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
                <div>
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-50"
                    >
                        Précédent
                    </button>
                    <button
                        onClick={nextStep}
                        disabled={currentStep === steps.length - 1}
                        className="ml-4 px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-50"
                    >
                        Suivant
                    </button>
                </div>
                <div>
                    <button onClick={onCancel} className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                        Annuler
                    </button>
                    { (formData.synthese.summary.includes('--- RAPPORT IA ---') || formData.synthese.aiSuggestions) &&
                        <button 
                            type="button"
                            onClick={() => setIsSummaryReportModalOpen(true)}
                            className="ml-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Synthèse
                        </button>
                    }
                    <button 
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="ml-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Analyse IA...' : 'Enregistrer la Consultation'}
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isValidationModalOpen}
                onClose={() => setIsValidationModalOpen(false)}
                title="Champs obligatoires manquants"
            >
                <p className="mb-4">Veuillez compléter les champs critiques suivants avant de pouvoir enregistrer la consultation :</p>
                <ul className="list-disc list-inside bg-red-50 p-4 rounded-md text-red-800 text-sm">
                    {validationErrors.map(error => <li key={error}>{error}</li>)}
                </ul>
            </Modal>
            
            <Modal
                isOpen={isConfirmationModalOpen}
                onClose={handleConfirmAndSave}
                title="Consultation Enregistrée avec Succès"
                closeButtonText="Terminer"
            >
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <div ref={reportToPrintRef}>
                         <div className="border-b border-slate-200 pb-4 mb-4">
                            <h1 className="text-2xl font-bold text-slate-800">Rapport de Consultation</h1>
                        </div>
                        <p className="font-bold text-slate-800">Patient: <span className="font-normal">{patient?.firstName} {patient?.lastName.toUpperCase()}</span></p>
                        <p className="font-bold text-slate-800">Date: <span className="font-normal">{new Date(initialConsultation.consultationDate).toLocaleDateString('fr-FR')}</span></p>
                        <p className="font-bold text-slate-800">Médecin Référent: <span className="font-normal">{patient?.referringDoctor}</span></p>
                        
                        {generatedSummary && (
                            <>
                                <div 
                                    className="ai-report-content mt-4"
                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedSummary) }}
                                ></div>
                            </>
                        )}
                        {formData.synthese.aiSuggestions && (
                            <div className="mt-6">
                                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Suggestions d'examens complémentaires</h2>
                                <div 
                                    className="ai-report-content"
                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.synthese.aiSuggestions) }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3 no-print">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-sm hover:shadow-md"
                    >
                        Imprimer
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:opacity-50"
                    >
                        {isDownloading ? 'Téléchargement...' : 'Télécharger en PDF'}
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={isSummaryReportModalOpen}
                onClose={() => setIsSummaryReportModalOpen(false)}
                title="Rapport de l'IA"
            >
                {aiReport && (
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Synthèse de la Consultation</h4>
                        <div 
                            className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-none ai-report-content"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiReport.trim()) }}
                        >
                        </div>
                    </div>
                )}
                {formData.synthese.aiSuggestions && (
                    <div className="mt-6">
                        <h4 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Suggestions d'examens complémentaires</h4>
                        <div 
                            className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-none ai-report-content"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.synthese.aiSuggestions) }}
                        >
                        </div>
                    </div>
                )}
                { !aiReport && !formData.synthese.aiSuggestions && (
                    <p>Aucun rapport de l'IA n'est disponible pour cette consultation.</p>
                )}
            </Modal>

        </div>
    );
};

export default DMDFormComponent;