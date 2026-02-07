import React, { useState, useCallback } from 'react';
import PatientListPage from '../components/PatientListPage';
import PatientDetailPage from '../components/PatientDetailPage';
import PinLock from '../components/PinLock';

type View = 'LIST' | 'DETAIL' | 'NEW_PATIENT';

const PatientRecordsPage: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(sessionStorage.getItem('patientRecordsUnlocked') === 'true');
  const [view, setView] = useState<View>('LIST');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectPatient = useCallback((patientId: number) => {
    setSelectedPatientId(patientId);
    setIsEditing(false);
    setView('DETAIL');
  }, []);

  const handleNewPatient = useCallback(() => {
    setSelectedPatientId(null);
    setIsEditing(true);
    setView('DETAIL');
  }, []);

  const handleEditPatient = useCallback((patientId: number) => {
    setSelectedPatientId(patientId);
    setIsEditing(true);
    setView('DETAIL');
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedPatientId(null);
    setIsEditing(false);
    setView('LIST');
  }, []);

  const handleUnlock = () => {
      sessionStorage.setItem('patientRecordsUnlocked', 'true');
      setIsUnlocked(true);
  };

  if (!isUnlocked) {
      return (
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Accès Sécurisé aux Dossiers</h1>
            <p className="text-lg text-slate-600 mb-8">
              Cette section est protégée pour garantir la confidentialité des données des patients.
            </p>
            <PinLock onUnlock={handleUnlock} />
          </div>
      )
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Patients</h1>
      <p className="text-lg text-slate-600 mb-8">
        Gérez les dossiers de vos patients. Toutes les données sont stockées localement et en toute sécurité sur votre navigateur.
      </p>

      {view === 'LIST' && (
        <PatientListPage
          onSelectPatient={handleSelectPatient}
          onNewPatient={handleNewPatient}
          onEditPatient={handleEditPatient}
        />
      )}
      
      {(view === 'DETAIL' || view === 'NEW_PATIENT') && (
        <PatientDetailPage
          patientId={selectedPatientId}
          onBack={handleBackToList}
          initialEditMode={isEditing}
        />
      )}
    </div>
  );
};

export default PatientRecordsPage;