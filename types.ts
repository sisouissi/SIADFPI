import React from 'react';

export type SectionId =
  | 'home'
  | 'introduction'
  | 'epidemiology'
  | 'diagnosis'
  | 'algorithm'
  | 'patient-records' // Ancien 'dmd-form'
  | 'prognosis'
  | 'treatment'
  | 'exacerbation'
  | 'complications'
  | 'recommendations'
  | 'references'
  | 'abbreviations';

export interface Section {
  id: SectionId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

// --- Nouveaux types pour la base de données ---

export interface Patient {
  id?: number; // Auto-incrémenté par IndexedDB
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Homme' | 'Femme' | '';
  identifier: string; // Numéro de dossier ou autre identifiant unique
  referringDoctor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id?: number; // Auto-incrémenté par IndexedDB
  patientId: number;
  consultationDate: Date;
  formData: DMDFormData;
}

export interface PatientWithConsultations extends Patient {
    consultations: Consultation[];
}


// --- Structure de données du formulaire DMD ---

export interface LbaCellularity {
  total: number | '';
  lymphocytes: number | '';
  macrophages: number | '';
  neutrophiles: number | '';
  eosinophiles: number | '';
  lbaCd4Cd8Ratio: number | '';
}

export interface EfrData {
  cvfValue: number | '';
  cvfPercent: number | '';
  cptValue: number | '';
  cptPercent: number | '';
  vemsValue: number | '';
  vemsPercent: number | '';
  dlcoValue: number | '';
  dlcoPercent: number | '';
  efrInterpretation: 'Restrictif' | 'Obstructif' | 'Mixte' | 'Normal' | 'Autre' | '';
}

export interface Tm6Data {
  distance: number | '';
  spo2Baseline: number | '';
  spo2Min: number | '';
}

export interface AbgData {
  performed: string;
  ph: number | '';
  pao2: number | '';
  paco2: number | '';
}

export type TestResult = 'Positif' | 'Négatif' | 'Non réalisé';

export interface ImmunologyData {
  tests: {
    [testName: string]: TestResult;
  };
  aanTiter: string;
  aanPattern: string;
  otherTests: string;
}

export interface EchocardiographyData {
    performed: 'Oui' | 'Non';
    paps: number | '';
    pahSigns: string[];
    lvef: number | '';
}

export interface DMDFormData {
  anamnese: {
    familialHistory: string;
    familialHistoryDetails: string[];
    patientAge: number | '';
    smokingStatus: string;
    smokingPA: number | '';
    symptomatology: string;
    dyspneaScale: {
        scale: 'mMRC' | 'Borg' | '';
        value: number | '';
    };
    ctdSigns: {
      articular: string[];
      cutaneous: string[];
      muscular: string[];
      sicca: string[];
      general: string[];
      other: string;
    };
    comorbidities: {
      rgo: string;
      saos: string;
      cardio: string;
      emphyseme: string;
      htp: string;
      cancer: string;
      depression: string;
    };
    comorbiditiesDetails: string;
  };
  environnement: {
    exposures: string[];
    exposureDetails: string[];
    habitatDetails: string;
    precipitines: string;
    precipitinesDetails: string[];
  };
  medicamenteux: {
    hasRiskMeds: 'Oui' | 'Non' | '';
    medsList: string;
    radiation: string;
    immunology: ImmunologyData;
  };
  examens: {
    physicalExam: {
      respiratory: string[];
      cutaneous: string[];
      articular: string[];
      capillaroscopyPerformed: boolean;
      capillaroscopyResult: 'Normale' | 'Anormale' | '';
      salivaryGlandBiopsyPerformed: boolean;
      salivaryGlandBiopsyResult: 'Normale' | 'Sialadenitis' | 'Autre' | '';
      salivaryGlandBiopsyOther: string;
      other: string;
    };
    radiology: {
      hrctDate: string;
      hrctProtocol: 'Approprié' | 'Non approprié' | 'Inconnu' | '';
      distribution: string[];
      honeycombing: string;
      reticulations: 'Oui' | 'Non' | '';
      tractionBronchiectasis: 'Oui' | 'Non' | '';
      atypicalFeatures: string[];
      fibrosisExtent: number | '';
      radiologyReport: string;
    };
    efr: EfrData;
    tm6: Tm6Data;
    abg: AbgData;
    echocardiography: EchocardiographyData;
  };
  synthese: {
    lba: string;
    lbaCellularity: LbaCellularity;
    biopsy: string;
    biopsyResult: string[];
    rcpQuestion: string[];
    summary: string;
    aiSuggestions: string;
    gapScore: number | '';
    gapStage: 'I' | 'II' | 'III' | '';
  };
}