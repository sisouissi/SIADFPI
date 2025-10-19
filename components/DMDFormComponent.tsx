import React, { useState, useMemo, useEffect } from 'react';
import { Consultation, DMDFormData, Patient, TestResult } from '../types';
import { parseMarkdown } from '../services/markdownParser';
import CompletenessDashboard from './CompletenessDashboard';
import { checklistSections } from '../services/checklist';


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
    <div className={`mt-2 ml-4 pl-4 border-l-2 border-accent-blue transition-all duration-300 overflow-hidden ${show ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
      {children}
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


// --- FORM COMPONENT ---
interface DMDFormComponentProps {
    initialConsultation: Consultation;
    patient: Patient | null;
    onSave: (consultation: Consultation) => void;
    onCancel: () => void;
}

const CRITICAL_ITEMS_PER_STEP: { [key: number]: string[] } = {
    0: ['age_sex', 'symptom_date', 'dyspnea', 'smoking'], // Anamnèse
    1: [], // Comorbidités (RGO is not critical)
    2: ['occupational_exposure'], // Expositions
    3: ['medications', 'ana', 'rf', 'anti_ccp'], // Autres causes
    4: ['hrct_date', 'hrct_protocol', 'distribution', 'honeycombing', 'reticulations', 'traction_bronchiectasis'], // Scanner
    5: ['velcro_crackles', 'fvc', 'dlco', 'tlc', 'pattern_interpretation', 'spo2_baseline', 'spo2_min', 'desaturation'], // Autres Examens
    6: [] // Synthèse
};

const DMDFormComponent: React.FC<DMDFormComponentProps> = ({ initialConsultation, patient, onSave, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<DMDFormData>(initialConsultation.formData);
    const [stepErrors, setStepErrors] = useState<string[]>([]);

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
        { id: 6, title: 'Autres Examens' },
        { id: 7, title: 'Synthèse' },
    ];

    const validateCurrentStep = () => {
        const itemsToValidate = CRITICAL_ITEMS_PER_STEP[currentStep];
        if (!itemsToValidate || itemsToValidate.length === 0) {
            setStepErrors([]);
            return true;
        }

        const allItems = checklistSections.flatMap(s => s.items);
        const criticalItemsInStep = allItems.filter(i => itemsToValidate.includes(i.id));

        const missing = criticalItemsInStep.filter(item => !item.checker(formData, patient));

        if (missing.length > 0) {
            setStepErrors(missing.map(item => item.label));
            return false;
        }

        setStepErrors([]);
        return true;
    };
    
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

    const derivedPattern = useMemo(() => {
        const { distribution, honeycombing, otherFibrosisSigns, atypicalFeatures } = formData.examens.radiology;

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

        if (isBasalSubpleural && honeycombing === 'Oui' && otherFibrosisSigns.includes('Réticulations')) {
            return {
                name: "Pattern de PIC/UIP Certaine",
                reason: "Présence de rayon de miel ET de réticulations avec une distribution typique.",
                color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-400"
            };
        }

        if (isBasalSubpleural && honeycombing === 'Non' && otherFibrosisSigns.length > 0) {
            return {
                name: "Pattern de PIC/UIP Probable",
                reason: "Distribution typique avec réticulations/bronchectasies de traction, mais sans rayon de miel.",
                color: "text-sky-600", bgColor: "bg-sky-50", borderColor: "border-sky-400"
            };
        }

        const isPristine = distribution.length === 0 && honeycombing === '' && otherFibrosisSigns.length === 0 && atypicalFeatures.length === 0;
        if (isPristine) return null;

        return {
            name: "Pattern Indéterminé pour la PIC/UIP",
            reason: "Les critères pour une PIC certaine ou probable ne sont pas remplis.",
            color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-400"
        };
    }, [formData.examens.radiology]);

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };
    const prevStep = () => {
        setStepErrors([]); // Clear errors when going back
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }

    const handleFormSave = () => {
        onSave({
            ...initialConsultation,
            formData: formData,
        });
    }

    const baseTests = ['AAN', 'Facteur Rhumatoïde', 'Anti-CCP', 'ANCA', 'CPK'];
    const specificAntibodies = [
        'Anti-synthétases (Jo-1, PL-7, PL-12)', 'Anti-MDA5', 'Anti-TIF1γ', 'Anti-Scl-70', 
        'Anti-centromère', 'Anti-Ro52/SSA', 'Anti-La/SSB', 'Anti-Sm', 'Anti-RNP'
    ];

    return (
        <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    Consultation pour {patient?.firstName} {patient?.lastName.toUpperCase()}
                </h2>
                <p className="text-slate-500">Date : {new Date(initialConsultation.consultationDate).toLocaleString('fr-FR')}</p>
            </div>
            
            <CompletenessDashboard formData={formData} patient={patient} />

            <div className="flex mb-8 mt-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex-1">
                        <div className={`h-1 transition-colors ${index <= currentStep ? 'bg-accent-blue' : 'bg-slate-300'}`}></div>
                        <p className={`mt-2 text-sm font-bold text-center ${index <= currentStep ? 'text-accent-blue' : 'text-slate-500'}`}>{step.title}</p>
                    </div>
                ))}
            </div>
            
            {/* Form content based on currentStep */}
            <div className="min-h-[400px]">
              {stepErrors.length > 0 && (
                <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg" role="alert">
                    <p className="font-bold">Champs critiques manquants :</p>
                    <ul className="list-disc list-inside mt-2 text-sm">
                        {stepErrors.map(err => <li key={err}>{err}</li>)}
                    </ul>
                </div>
              )}
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
                                            <ImmunoTestRow 
                                                key={test}
                                                testName={test}
                                                status={formData.medicamenteux.immunology.tests[test]}
                                                onChange={handleImmunoTestChange}
                                            />
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
                                <ConditionalField show={formData.medicamenteux.immunology.tests['AAN'] === 'Positif'}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
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
                                <Question>3. Quels autres signes de fibrose sont présents ?</Question>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Réticulations', 'Bronchectasies de traction'].map(option => (
                                        <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                                            <input type="checkbox" name="examens.radiology.otherFibrosisSigns" value={option} checked={formData.examens.radiology.otherFibrosisSigns.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </QuestionBlock>

                            <QuestionBlock>
                                <Question>4. Y a-t-il des aspects atypiques ou en faveur d'un autre diagnostic ?</Question>
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
                                <Question>5. Quantification estimée de la fibrose (%) :</Question>
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
                        <SubHeader>Étape 6 : Examen Clinique & Fonctionnel</SubHeader>
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
                                        <p className="font-semibold text-slate-600 mb-2">Examen Vasculaire</p>
                                        {["Capillaroscopie anormale"].map(option => (
                                            <label key={option} className="flex items-center space-x-2 text-slate-600 cursor-pointer mb-1">
                                                <input type="checkbox" name="examens.physicalExam.vascular" value={option} checked={formData.examens.physicalExam.vascular.includes(option)} onChange={handleMultiChoiceChange} className="form-checkbox bg-slate-100 border-slate-300 rounded text-accent-blue focus:ring-accent-blue" />
                                                <span>{option}</span>
                                            </label>
                                        ))}
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
                                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(aiReport) }}
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
                    <button onClick={handleFormSave} className="ml-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50">
                        Enregistrer la Consultation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DMDFormComponent;