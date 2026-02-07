import React, { useState, useEffect, useCallback } from 'react';
import { addPatient, updatePatient, getPatientWithConsultations, addConsultation, updateConsultation, deleteConsultation, INITIAL_DMD_FORM_DATA, PatientWithConsultations } from '../services/db';
import { Patient, Consultation } from '../types';
import DMDFormComponent from './DMDFormComponent';
import SynthesisModal from './SynthesisModal';
import GeneralSynthesisModal from './GeneralSynthesisModal';
import ReportModal from './ReportModal'; // Import du nouveau composant
import { SparklesIcon, DocumentLockClosedIcon, UserIcon, CalendarDaysIcon, AcademicCapIcon, DocumentArrowDownIcon } from '../constants';
import { encryptData } from '../services/cryptoService';
import Modal from './Modal';

const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


interface ExportPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (password: string) => void;
    isExporting: boolean;
}

const ExportPatientModal: React.FC<ExportPatientModalProps> = ({ isOpen, onClose, onExport, isExporting }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleExportClick = () => {
        if (password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères.');
            return;
        }
        setError('');
        onExport(password);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chiffrer et Exporter le Dossier Patient">
            <div className="space-y-4">
                <p>Veuillez définir un mot de passe pour sécuriser ce fichier. Ce mot de passe sera nécessaire pour déchiffrer et importer le dossier.</p>
                <div>
                    <label htmlFor="export-password" className="block text-sm font-medium text-slate-700">Mot de passe (8 caractères minimum)</label>
                    <input
                        id="export-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">Annuler</button>
                    <button onClick={handleExportClick} disabled={isExporting} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-sky-500 to-accent-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg disabled:translate-y-0">
                        {isExporting ? 'Exportation...' : 'Exporter'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};


interface PatientDetailPageProps {
  patientId: number | null;
  onBack: () => void;
  initialEditMode?: boolean;
}

const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patientId, onBack, initialEditMode = false }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isEditingPatient, setIsEditingPatient] = useState(initialEditMode || !patientId);
  const [currentConsultation, setCurrentConsultation] = useState<Consultation | null>(null);
  const [isSynthesisModalOpen, setIsSynthesisModalOpen] = useState(false);
  const [isGeneralSynthesisModalOpen, setIsGeneralSynthesisModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // Nouvel état pour le modal de rapport
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedConsultationForSynthesis, setSelectedConsultationForSynthesis] = useState<Consultation | null>(null);

  const loadPatientData = useCallback(async () => {
    if (patientId) {
      const data = await getPatientWithConsultations(patientId);
      if (data) {
        setPatient(data.patient);
        setConsultations(data.consultations);
      }
    }
  }, [patientId]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Si on est en mode édition avec un patient déjà chargé, on doit s'assurer que le formulaire s'affiche
  useEffect(() => {
      if (initialEditMode) {
          setIsEditingPatient(true);
      }
  }, [initialEditMode]);

  const handlePatientSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPatientData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as 'Homme' | 'Femme' | '',
      identifier: formData.get('identifier') as string,
      referringDoctor: formData.get('referringDoctor') as string,
    };
    
    if (patient && patient.id) {
        await updatePatient({ ...patient, ...newPatientData });
        setIsEditingPatient(false);
        await loadPatientData();
    } else {
      await addPatient(newPatientData);
      onBack(); // Go back to list to see the new patient
    }
  };
  
  const handleAddNewConsultation = async () => {
    if (patient?.id) {
        const newConsultation = await addConsultation(patient.id);
        if (newConsultation) {
            // Add the new consultation to the top of the list for immediate UI feedback
            setConsultations(prev => [newConsultation, ...prev]);
            // Set it as the current one to open the form
            setCurrentConsultation(newConsultation);
        }
    }
  }

  const handleSaveConsultation = async (consultationToSave: Consultation) => {
    await updateConsultation(consultationToSave);
    setCurrentConsultation(null);
    await loadPatientData();
  };

  const handleDeleteConsultation = async (consultationId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette consultation ?")) {
        await deleteConsultation(consultationId);
        await loadPatientData();
    }
  }

  const handleOpenSynthesisModal = (consultation: Consultation) => {
    setSelectedConsultationForSynthesis(consultation);
    setIsSynthesisModalOpen(true);
  };
  
  const handleCloseSynthesisModal = () => {
    setIsSynthesisModalOpen(false);
    setSelectedConsultationForSynthesis(null);
  };

  const handleSaveReport = async (reportText: string) => {
    if (!selectedConsultationForSynthesis) return;

    const existingSummary = selectedConsultationForSynthesis.formData.synthese.summary || '';
    const aiMarker = '--- RAPPORT IA ---';
    const userSummaryPart = existingSummary.split(aiMarker)[0].trim();
    
    const newSummary = `${userSummaryPart}\n\n${aiMarker}\n${reportText}`.trim();

    const updatedConsultation = {
        ...selectedConsultationForSynthesis,
        formData: {
            ...selectedConsultationForSynthesis.formData,
            synthese: {
                ...selectedConsultationForSynthesis.formData.synthese,
                summary: newSummary
            }
        }
    };
    
    await updateConsultation(updatedConsultation);
    handleCloseSynthesisModal();
    await loadPatientData(); // Refresh data
  };
  
  const handleExport = async (password: string) => {
    if (!patient || !consultations) return;
    setIsExporting(true);
    try {
        const fullPatientData: PatientWithConsultations = {
            ...patient,
            consultations: consultations,
        };

        const jsonString = JSON.stringify(fullPatientData);
        const encryptedData = await encryptData(jsonString, password);

        const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dossier-${patient.lastName}-${patient.identifier}.fpi-crypt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsExportModalOpen(false);
        alert('Dossier patient exporté avec succès.');

    } catch (err) {
        alert(err instanceof Error ? err.message : "Une erreur est survenue lors de l'exportation.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleCancelEdit = () => {
      if (patient && patient.id) {
          setIsEditingPatient(false);
      } else {
          onBack();
      }
  };


  if (isEditingPatient) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{patient ? 'Modifier le Dossier Patient' : 'Nouveau Dossier Patient'}</h2>
        <form onSubmit={handlePatientSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
              <input type="text" id="lastName" name="lastName" defaultValue={patient?.lastName} required className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
              <input type="text" id="firstName" name="firstName" defaultValue={patient?.firstName} required className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2" />
            </div>
             <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1">Sexe</label>
              <select id="gender" name="gender" defaultValue={patient?.gender} required className="form-select w-full bg-slate-50 border-slate-300 rounded-md p-2">
                <option value="">Sélectionner...</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-600 mb-1">Date de Naissance</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" defaultValue={patient?.dateOfBirth} required className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2" />
            </div>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-600 mb-1">Identifiant (N° dossier)</label>
              <input type="text" id="identifier" name="identifier" defaultValue={patient?.identifier} required className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2" />
            </div>
             <div>
              <label htmlFor="referringDoctor" className="block text-sm font-medium text-slate-600 mb-1">Médecin Référent</label>
              <input type="text" id="referringDoctor" name="referringDoctor" defaultValue={patient?.referringDoctor} required placeholder="Dr. Prénom NOM" className="form-input w-full bg-slate-50 border-slate-300 rounded-md p-2" />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={handleCancelEdit} className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">Annuler</button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-sky-500 to-accent-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50">Enregistrer</button>
          </div>
        </form>
      </div>
    );
  }

  if (currentConsultation) {
    return (
        <DMDFormComponent
            initialConsultation={currentConsultation}
            patient={patient}
            onSave={handleSaveConsultation}
            onCancel={() => setCurrentConsultation(null)}
        />
    )
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 mb-6 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group">
        <ArrowLeftIcon className="w-5 h-5 text-slate-500 group-hover:text-accent-blue" />
        <span className="font-semibold text-slate-700">Retour à la liste</span>
      </button>
      
      {patient && (
         <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-6">
                 <h2 className="text-3xl font-bold text-slate-800">{patient.lastName.toUpperCase()} {patient.firstName}</h2>
                 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 mt-2">
                    <div className="flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-slate-400"/>
                        <span>{patient.gender}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-4 h-4 text-slate-400"/>
                        <span>Né(e) le: {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-600">ID:</span>
                        <span>{patient.identifier}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AcademicCapIcon className="w-4 h-4 text-slate-400"/>
                        <span>{patient.referringDoctor}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-bold text-slate-700">Historique des Consultations</h3>
                <div className="flex items-center flex-wrap gap-3">
                    <button onClick={() => setIsReportModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50">
                        <DocumentArrowDownIcon className="w-5 h-5" />
                        Exporter PDF
                    </button>
                    <button onClick={() => setIsExportModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50">
                        <DocumentLockClosedIcon className="w-5 h-5" />
                        Exporter (.fpi)
                    </button>
                    <button onClick={() => setIsGeneralSynthesisModalOpen(true)} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-purple-500 to-violet-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50">
                        <SparklesIcon className="w-5 h-5" />
                        Synthèse IA
                    </button>
                    <button onClick={handleAddNewConsultation} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-sky-500 to-accent-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50">
                        <PlusIcon />
                        <span>Nouvelle Consultation</span>
                    </button>
                </div>
            </div>

            {consultations.length > 0 ? (
                <ul className="space-y-3">
                    {consultations.map(c => (
                        <li key={c.id} className="flex flex-wrap justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                            <div>
                                <p className="font-semibold text-slate-800">
                                    Consultation du {new Date(c.consultationDate).toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleOpenSynthesisModal(c)}
                                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 border-2 border-purple-200 rounded-full hover:bg-purple-200 hover:border-purple-300 transition-colors"
                                    title="Générer une synthèse avec l'IA"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    Rapport IA
                                </button>
                                <button onClick={() => setCurrentConsultation(c)} className="px-3 py-1 text-xs font-bold text-sky-700 bg-sky-100 border-2 border-sky-200 rounded-full hover:bg-sky-200 hover:border-sky-300 transition-colors">
                                    Voir / Modifier
                                </button>
                                <button onClick={() => handleDeleteConsultation(c.id!)} className="px-3 py-1 text-xs font-bold text-red-700 bg-red-100 border-2 border-red-200 rounded-full hover:bg-red-200 hover:border-red-300 transition-colors">
                                    Supprimer
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-slate-500 py-8">Aucune consultation enregistrée pour ce patient.</p>
            )}
         </div>
      )}

      {isSynthesisModalOpen && (
          <SynthesisModal
            isOpen={isSynthesisModalOpen}
            onClose={handleCloseSynthesisModal}
            patient={patient}
            consultation={selectedConsultationForSynthesis}
            onSaveReport={handleSaveReport}
          />
      )}
      
      {isGeneralSynthesisModalOpen && (
          <GeneralSynthesisModal
            isOpen={isGeneralSynthesisModalOpen}
            onClose={() => setIsGeneralSynthesisModalOpen(false)}
            patient={patient}
            consultations={consultations}
          />
      )}
      <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          patient={patient}
          consultations={consultations}
      />
      <ExportPatientModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
};

export default PatientDetailPage;