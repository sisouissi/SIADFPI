import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db, searchPatients, deletePatient, exportData, importData, BackupData, getAllDataForExport, INITIAL_DMD_FORM_DATA, importSinglePatient, PatientWithConsultations } from '../services/db';
import { Patient } from '../types';
import { MagnifyingGlassIcon, UsersIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, UserIcon, AcademicCapIcon, CalendarDaysIcon, PencilSquareIcon } from '../constants';
import * as XLSX from 'xlsx';
import { decryptData } from '../services/cryptoService';
import Modal from './Modal';


const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const ArrowUpTrayIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const UserPlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21.75c-2.636 0-5.053-.94-6.9-2.515z" />
    </svg>
);


interface ImportPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileContent: string;
    onImportSuccess: () => void;
}

const ImportPatientModal: React.FC<ImportPatientModalProps> = ({ isOpen, onClose, fileContent, onImportSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async () => {
        if (!password) {
            setError('Veuillez entrer un mot de passe.');
            return;
        }
        setIsImporting(true);
        setError('');
        try {
            const decryptedData = await decryptData(fileContent, password);
            const patientData = JSON.parse(decryptedData) as PatientWithConsultations;
            
            // Re-hydrate dates
            patientData.createdAt = new Date(patientData.createdAt);
            patientData.updatedAt = new Date(patientData.updatedAt);
            patientData.consultations.forEach(c => {
                c.consultationDate = new Date(c.consultationDate);
            });

            await importSinglePatient(patientData);
            onImportSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Déchiffrer et Importer le Dossier Patient">
            <div className="space-y-4">
                <p>Veuillez entrer le mot de passe qui a été utilisé pour chiffrer ce dossier patient.</p>
                <div>
                    <label htmlFor="import-password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
                    <input
                        id="import-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">Annuler</button>
                    <button onClick={handleImport} disabled={isImporting} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-sky-500 to-accent-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg disabled:translate-y-0">
                        {isImporting ? 'Importation...' : 'Importer'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};


interface PatientListPageProps {
  onSelectPatient: (patientId: number) => void;
  onNewPatient: () => void;
  onEditPatient: (patientId: number) => void;
}

const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    try {
        const birthDate = new Date(dateOfBirth);
        if (isNaN(birthDate.getTime())) return 0; // Invalid date
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        return 0; // Return 0 if any error occurs
    }
};

const PatientListPage: React.FC<PatientListPageProps> = ({ onSelectPatient, onNewPatient, onEditPatient }) => {
  const [allMatchingPatients, setAllMatchingPatients] = useState<Patient[]>([]);
  const [lastConsultationDates, setLastConsultationDates] = useState<Map<number, Date>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const PATIENTS_PER_PAGE = 5;

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<number>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [fileToImport, setFileToImport] = useState<string | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [fileToRestore, setFileToRestore] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);


  const fetchPatientsAndConsultations = useCallback(async () => {
    setLoading(true);
    try {
        const [patientResults, allConsultations] = await Promise.all([
            searchPatients(searchQuery),
            db.consultations.toArray()
        ]);

        const dateMap = new Map<number, Date>();
        allConsultations.forEach(consult => {
            const patientId = consult.patientId;
            const existingDate = dateMap.get(patientId);
            if (!existingDate || consult.consultationDate > existingDate) {
                dateMap.set(patientId, consult.consultationDate);
            }
        });

        setAllMatchingPatients(patientResults);
        setLastConsultationDates(dateMap);
        setCurrentPage(1); // Reset to page 1 on new search
    } catch (error) {
        console.error("Failed to fetch patient data:", error);
    } finally {
        setLoading(false);
    }
}, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchPatientsAndConsultations();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPatientsAndConsultations]);
  
  const handleDeleteClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setPatientToDelete(patient);
  };

  const handleEditClick = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    if (patient.id) {
        onEditPatient(patient.id);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!patientToDelete || !patientToDelete.id) return;

    try {
        await deletePatient(patientToDelete.id);
        setSelectedPatientIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(patientToDelete!.id!);
            return newSet;
        });
        fetchPatientsAndConsultations();
    } catch (error) {
        console.error("Erreur lors de la suppression du patient :", error);
        alert("Une erreur est survenue lors de la suppression.");
    } finally {
        setPatientToDelete(null);
    }
  };
  
  const handleSaveData = async () => {
    try {
        const data = await exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `siad-fpi-sauvegarde-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Sauvegarde réussie ! Le fichier a été téléchargé.");
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
        alert("Une erreur est survenue lors de la sauvegarde des données.");
    }
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          setFileToRestore(file);
      }
      event.target.value = ''; // Reset input to allow re-selecting the same file
  };

  const handleConfirmRestore = async () => {
      if (!fileToRestore) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') throw new Error("Format de fichier invalide.");
              
              const data = JSON.parse(text) as BackupData;

              if (!data.patients || !data.consultations || !Array.isArray(data.patients) || !Array.isArray(data.consultations)) {
                  throw new Error("Le fichier de sauvegarde est corrompu ou invalide.");
              }
              
              // Re-hydrate dates which are stored as strings in JSON
              data.patients.forEach(p => {
                  (p as any).createdAt = new Date(p.createdAt);
                  (p as any).updatedAt = new Date(p.updatedAt);
              });
              data.consultations.forEach(c => {
                  (c as any).consultationDate = new Date(c.consultationDate);
              });

              await importData(data);
              alert("Restauration réussie ! Les données ont été importées.");
              setSelectedPatientIds(new Set());
              fetchPatientsAndConsultations();

          } catch (error) {
              console.error("Erreur lors de la restauration :", error);
              alert(`Une erreur est survenue lors de la restauration : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          } finally {
              setFileToRestore(null); // This will close the modal
          }
      };
      reader.readAsText(fileToRestore);
  };
    
    // Pagination data
    const totalPages = Math.ceil(allMatchingPatients.length / PATIENTS_PER_PAGE);
    const paginatedPatients = allMatchingPatients.slice(
        (currentPage - 1) * PATIENTS_PER_PAGE,
        currentPage * PATIENTS_PER_PAGE
    );

    const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentPagePatientIds = paginatedPatients.map(p => p.id!);
        if (e.target.checked) {
            setSelectedPatientIds(prev => new Set([...prev, ...currentPagePatientIds]));
        } else {
            setSelectedPatientIds(prev => {
                const newSet = new Set(prev);
                currentPagePatientIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };

    const handleSelectSinglePatient = (patientId: number) => {
        setSelectedPatientIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(patientId)) {
                newSet.delete(patientId);
            } else {
                newSet.add(patientId);
            }
            return newSet;
        });
    };

    const handleExportExcel = async () => {
        if (selectedPatientIds.size === 0) {
            alert("Veuillez sélectionner au moins un patient à exporter.");
            return;
        }
    setExporting(true);
    try {
        const allData = await getAllDataForExport();
        const dataToExport = allData.filter(p => p.id && selectedPatientIds.has(p.id));

        if (dataToExport.length === 0) {
            alert("Aucun des patients sélectionnés n'a pu être trouvé pour l'exportation.");
            setExporting(false);
            return;
        }

        const flattenObject = (obj: any, parentKey = '', result: { [key: string]: any } = {}) => {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const newKey = parentKey ? `${parentKey}.${key}` : key;
                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        flattenObject(obj[key], newKey, result);
                    } else if (Array.isArray(obj[key])) {
                        result[newKey] = obj[key].join('; ');
                    } else {
                        result[newKey] = obj[key];
                    }
                }
            }
            return result;
        };
        
        const flatData = dataToExport.flatMap(patient => {
            const patientBase = {
                patient_id: patient.id,
                patient_nom: patient.lastName,
                patient_prenom: patient.firstName,
                patient_date_naissance: patient.dateOfBirth,
                patient_identifiant: patient.identifier,
            };

            if (patient.consultations.length === 0) {
                const flatEmptyConsultation = flattenObject(INITIAL_DMD_FORM_DATA, 'consultation_data');
                return [{
                    ...patientBase,
                    consultation_id: null,
                    consultation_date: '',
                    ...flatEmptyConsultation
                }];
            }

            return patient.consultations.map(consultation => {
                const flatConsultationData = flattenObject(consultation.formData, 'consultation_data');
                return {
                    ...patientBase,
                    consultation_id: consultation.id,
                    consultation_date: consultation.consultationDate.toISOString(),
                    ...flatConsultationData
                };
            });
        });
        
        if (flatData.length === 0) {
            alert("Aucune donnée de consultation à exporter pour les patients sélectionnés.");
            setExporting(false);
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dossiers Patients");

        const date = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `export-patients-fpi-${date}.xlsx`);


    } catch (error) {
        console.error("Erreur lors de l'exportation Excel :", error);
        alert("Une erreur est survenue lors de l'exportation des données.");
    } finally {
        setExporting(false);
    }
    };

    const handleImportPatientClick = () => {
        importFileInputRef.current?.click();
    };

    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                setFileToImport(text);
                setIsImportModalOpen(true);
            } else {
                alert('Erreur de lecture du fichier.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

  const areAllOnPageSelected = paginatedPatients.length > 0 && paginatedPatients.every(p => selectedPatientIds.has(p.id!));

  const PaginationControls: React.FC = () => {
    if (totalPages <= 1) return null;

    const goToPage = (pageNumber: number) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };
    
    return (
        <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-slate-500">
                Affiche {paginatedPatients.length} sur {allMatchingPatients.length} patient(s)
            </span>
            <nav className="flex items-center gap-2">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Préc.
                </button>
                
                <span className="text-sm text-slate-500">
                    Page {currentPage} / {totalPages}
                </span>

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Suiv.
                </button>
            </nav>
        </div>
    );
  };


  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom ou identifiant..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-10 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <button
                onClick={handleExportExcel}
                disabled={exporting || selectedPatientIds.size === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg disabled:translate-y-0"
            >
                <ArrowDownTrayIcon className="w-5 h-5" />
                {exporting ? 'Exportation...' : `Exporter ${selectedPatientIds.size > 0 ? `(${selectedPatientIds.size})` : ''}`}
            </button>
            <button
              onClick={onNewPatient}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-sky-500 to-accent-blue text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50"
            >
              <UserPlusIcon />
              <span>Ajouter un patient</span>
            </button>
        </div>
      </div>

      <div className="mt-4 min-h-[350px]">
        {loading ? (
          <p className="text-center text-slate-500 py-10">Chargement des dossiers...</p>
        ) : allMatchingPatients.length > 0 ? (
            <>
            <div className="flex items-center border-b border-slate-200 pb-2 mb-3 px-4">
                <input
                    type="checkbox"
                    id="select-all-patients"
                    checked={areAllOnPageSelected}
                    onChange={handleSelectAllOnPage}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-slate-300 rounded mr-3"
                />
                <label htmlFor="select-all-patients" className="text-sm font-semibold text-slate-600">
                    {selectedPatientIds.size > 0 ? `${selectedPatientIds.size} / ${allMatchingPatients.length} sélectionné(s)` : "Sélectionner la page"}
                </label>
            </div>
            <ul className="space-y-3">
            {paginatedPatients.map((p) => {
                const age = calculateAge(p.dateOfBirth);
                const lastConsultationDate = lastConsultationDates.get(p.id!);
                const formattedDate = lastConsultationDate
                    ? new Date(lastConsultationDate).toLocaleDateString('fr-FR')
                    : 'Aucune';

                return (
                    <li key={p.id}>
                        <div
                        className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-sky-50 hover:border-accent-blue transition-all"
                        >
                        <div className="flex items-center flex-grow cursor-pointer gap-4 min-w-0" onClick={() => onSelectPatient(p.id!)}>
                            <input
                                type="checkbox"
                                id={`patient-${p.id}`}
                                checked={selectedPatientIds.has(p.id!)}
                                onChange={() => handleSelectSinglePatient(p.id!)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-5 w-5 text-accent-blue focus:ring-accent-blue border-slate-300 rounded shrink-0"
                                aria-label={`Sélectionner ${p.firstName} ${p.lastName}`}
                            />
                            <div className="flex-grow min-w-0">
                                <p className="font-bold text-slate-800 truncate">{p.lastName.toUpperCase()} {p.firstName}</p>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span title={`${age} ans`}>{age} ans</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <AcademicCapIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span title={p.referringDoctor}>{p.referringDoctor}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate">
                                        <CalendarDaysIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span title={`Dernière RCP: ${formattedDate}`}>Dernière RCP: {formattedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                            <button
                                onClick={(e) => handleEditClick(e, p)}
                                className="p-2 text-slate-400 hover:text-amber-600 rounded-full hover:bg-amber-100 transition-colors"
                                aria-label="Modifier la fiche patient"
                                title="Modifier la fiche patient"
                            >
                                <PencilSquareIcon />
                            </button>
                            <button 
                                onClick={(e) => handleDeleteClick(e, p)}
                                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"
                                aria-label="Supprimer ce patient"
                                title="Supprimer ce patient"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                        </div>
                    </li>
                );
            })}
          </ul>
           <PaginationControls />
          </>
        ) : (
          <div className="text-center py-12">
             <UsersIcon className="w-16 h-16 mx-auto text-slate-300" />
             <h3 className="mt-4 text-xl font-semibold text-slate-700">Aucun dossier patient</h3>
             <p className="mt-1 text-slate-500">Commencez par ajouter votre premier patient pour créer une consultation.</p>
          </div>
        )}
      </div>
      
       <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Gestion des Données</h3>
          <p className="text-sm text-slate-500 mb-4">
              Sauvegardez l'ensemble de vos dossiers patients dans un fichier, ou restaurez-les à partir d'une sauvegarde précédente. Les données sont traitées localement pour garantir leur confidentialité.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                  onClick={handleSaveData}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-sky-600 to-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50"
              >
                  <ArrowDownTrayIcon />
                  <span>Sauvegarder (JSON)</span>
              </button>
              <button
                  onClick={handleRestoreClick}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50"
              >
                  <ArrowUpTrayIcon />
                  <span>Restaurer (JSON)</span>
              </button>
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
              />
              <button
                onClick={handleImportPatientClick}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-opacity-50"
                >
                <DocumentArrowUpIcon />
                <span>Importer patient</span>
            </button>
            <input
                type="file"
                ref={importFileInputRef}
                onChange={handleImportFileChange}
                accept=".fpi-crypt"
                className="hidden"
            />
          </div>
      </div>
       {fileToImport && (
            <ImportPatientModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                fileContent={fileToImport}
                onImportSuccess={() => {
                    alert('Patient importé avec succès !');
                    fetchPatientsAndConsultations();
                }}
            />
        )}
        {patientToDelete && (
            <Modal
                isOpen={!!patientToDelete}
                onClose={() => setPatientToDelete(null)}
                title="Confirmer la suppression"
            >
                <div>
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-bold text-slate-900">
                                Supprimer le dossier patient
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-500">
                                    Êtes-vous sûr de vouloir supprimer le dossier de <strong>{patientToDelete.firstName} {patientToDelete.lastName}</strong> ?
                                </p>
                                <p className="mt-2 text-sm text-red-700 font-semibold">
                                    Cette action est définitive et supprimera toutes les consultations associées.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            onClick={() => setPatientToDelete(null)}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
                            onClick={handleConfirmDelete}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </Modal>
        )}
        {fileToRestore && (
            <Modal
                isOpen={!!fileToRestore}
                onClose={() => setFileToRestore(null)}
                title="Confirmer la restauration des données"
            >
                <div>
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-bold text-slate-900">
                                Écraser les données actuelles ?
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-slate-500">
                                    Vous êtes sur le point de restaurer les données depuis le fichier <strong>{fileToRestore.name}</strong>.
                                </p>
                                <p className="mt-2 text-sm text-red-700 font-semibold">
                                    Cette action est irréversible et remplacera toutes les données actuelles de l'application. Assurez-vous d'avoir une sauvegarde si nécessaire.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-6 py-2 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            onClick={() => setFileToRestore(null)}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50"
                            onClick={handleConfirmRestore}
                        >
                            Restaurer et Écraser
                        </button>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default PatientListPage;