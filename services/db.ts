import Dexie, { Table } from 'dexie';
// FIX: Import the `TestResult` type to be used for explicit typing.
import { Patient, Consultation, DMDFormData, TestResult } from '../types';

// FIX: Explicitly type `initialImmunologyTests` with `{[key: string]: TestResult}`.
// This resolves TypeScript errors where the inferred `string` type was not assignable to the more specific `TestResult` union type.
const initialImmunologyTests: { [key: string]: TestResult } = {
    'AAN': 'Non réalisé',
    'Facteur Rhumatoïde': 'Non réalisé',
    'Anti-CCP': 'Non réalisé',
    'ANCA': 'Non réalisé',
    'CPK': 'Non réalisé',
    'Anti-synthétases (Jo-1, PL-7, PL-12)': 'Non réalisé',
    'Anti-MDA5': 'Non réalisé',
    'Anti-TIF1γ': 'Non réalisé',
    'Anti-Scl-70': 'Non réalisé',
    'Anti-centromère': 'Non réalisé',
    'Anti-Ro52/SSA': 'Non réalisé',
    'Anti-La/SSB': 'Non réalisé',
    'Anti-Sm': 'Non réalisé',
    'Anti-RNP': 'Non réalisé'
};


export const INITIAL_DMD_FORM_DATA: DMDFormData = {
  anamnese: {
    familialHistory: '', familialHistoryDetails: [''], patientAge: '', smokingStatus: '', smokingPA: '', symptomatology: '',
    dyspneaScale: { scale: '', value: '' },
    ctdSigns: { articular: [], cutaneous: [], muscular: [], sicca: [], general: [], other: '' },
    comorbidities: { rgo: '', saos: '', cardio: '', emphyseme: '', htp: '', cancer: '', depression: '' },
    comorbiditiesDetails: '',
  },
  environnement: { exposures: [], exposureDetails: [''], habitatDetails: '', precipitines: '', precipitinesDetails: [''] },
  medicamenteux: {
    hasRiskMeds: '',
    medsList: '', 
    radiation: '',
    immunology: { 
        tests: initialImmunologyTests,
        aanTiter: '', 
        aanPattern: '', 
        otherTests: '' 
    },
  },
  examens: {
    physicalExam: { 
        respiratory: [], 
        cutaneous: [], 
        articular: [], 
        other: '',
        capillaroscopyPerformed: false,
        capillaroscopyResult: '',
        salivaryGlandBiopsyPerformed: false,
        salivaryGlandBiopsyResult: '',
        salivaryGlandBiopsyOther: '',
    },
    radiology: {
      hrctDate: '',
      hrctProtocol: '',
      distribution: [],
      honeycombing: '',
      reticulations: '',
      tractionBronchiectasis: '',
      atypicalFeatures: [],
      fibrosisExtent: '',
      radiologyReport: '',
    },
    efr: {
        cvfValue: '', cvfPercent: '',
        cptValue: '', cptPercent: '',
        vemsValue: '', vemsPercent: '',
        dlcoValue: '', dlcoPercent: '',
        efrInterpretation: '',
    },
    tm6: { distance: '', spo2Baseline: '', spo2Min: '' },
    abg: { performed: '', ph: '', pao2: '', paco2: '' },
    echocardiography: {
        performed: 'Non',
        paps: '',
        pahSigns: [],
        lvef: '',
    }
  },
  synthese: { lba: '', lbaCellularity: { total: '', lymphocytes: '', macrophages: '', neutrophiles: '', eosinophiles: '', lbaCd4Cd8Ratio: '' }, biopsy: '', biopsyResult: [''], rcpQuestion: [], summary: '', aiSuggestions: '', gapScore: '', gapStage: '' },
};

export class FpiDB extends Dexie {
  patients!: Table<Patient>;
  consultations!: Table<Consultation>;

  constructor() {
    super('fpiClinicalGuideDB');
    // FIX: Explicitly cast 'this' to Dexie to resolve typing issue with 'version' method.
    (this as Dexie).version(1).stores({
      patients: '++id, &[lastName+firstName], identifier',
      consultations: '++id, patientId, consultationDate',
    });
  }
}

// FIX: Explicitly cast 'db' to also be of type Dexie to resolve typing issues with its methods.
export const db = new FpiDB() as FpiDB & Dexie;

// --- Backup Data Structure ---
export interface BackupData {
    patients: Patient[];
    consultations: Consultation[];
}

// --- Types for Export ---
export interface PatientWithConsultations extends Patient {
    consultations: Consultation[];
}


// --- Patient Functions ---

export const searchPatients = async (query: string): Promise<Patient[]> => {
    if (!query) {
        return db.patients.orderBy('lastName').toArray();
    }
    const lowerCaseQuery = query.toLowerCase();
    return db.patients.filter(p => 
        p.firstName.toLowerCase().includes(lowerCaseQuery) ||
        p.lastName.toLowerCase().includes(lowerCaseQuery) ||
        p.identifier.toLowerCase().includes(lowerCaseQuery)
    ).toArray();
};

export const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const newPatient: Omit<Patient, 'id'> = {
        ...patient,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    return db.patients.add(newPatient as Patient);
};

export const getPatientWithConsultations = async (patientId: number): Promise<{ patient: Patient; consultations: Consultation[] } | null> => {
    const patient = await db.patients.get(patientId);
    if (!patient) return null;

    const consultations = await db.consultations
        .where('patientId')
        .equals(patientId)
        .sortBy('consultationDate');
        
    return { patient, consultations: consultations.reverse() };
};

// --- Consultation Functions ---

export const addConsultation = async (patientId: number): Promise<Consultation | undefined> => {
    // Find the most recent consultation to use as a template
    const latestConsultation = await db.consultations
        .where('patientId')
        .equals(patientId)
        .last();

    let formData: DMDFormData;

    if (latestConsultation) {
        // Deep copy the latest form data
        formData = JSON.parse(JSON.stringify(latestConsultation.formData));
        
        // Reset fields that need to be updated at each follow-up
        formData.examens.efr = INITIAL_DMD_FORM_DATA.examens.efr;
        formData.examens.tm6 = INITIAL_DMD_FORM_DATA.examens.tm6;
        formData.examens.abg = INITIAL_DMD_FORM_DATA.examens.abg;
        
        // Reset only the parts of synthese that are specific to the new consultation
        formData.synthese.rcpQuestion = INITIAL_DMD_FORM_DATA.synthese.rcpQuestion;
        formData.synthese.summary = INITIAL_DMD_FORM_DATA.synthese.summary;


    } else {
        // If it's the first consultation, use the initial blank form
        formData = INITIAL_DMD_FORM_DATA;
    }

    const newConsultation: Omit<Consultation, 'id'> = {
        patientId,
        consultationDate: new Date(),
        formData: formData,
    };

    const newId = await db.consultations.add(newConsultation as Consultation);
    return db.consultations.get(newId);
}

export const updateConsultation = async (consultation: Consultation): Promise<number> => {
    if (!consultation.id) {
        throw new Error("Consultation ID is required for update.");
    }
    return db.consultations.update(consultation.id, consultation);
}

export const deletePatient = async (patientId: number): Promise<void> => {
  await db.transaction('rw', db.patients, db.consultations, async () => {
    await db.consultations.where('patientId').equals(patientId).delete();
    await db.patients.delete(patientId);
  });
};

export const deleteConsultation = async (consultationId: number): Promise<void> => {
    if (!consultationId) return;
    await db.consultations.delete(consultationId);
}

// --- Data Management Functions ---

export const exportData = async (): Promise<BackupData> => {
    const patients = await db.patients.toArray();
    const consultations = await db.consultations.toArray();
    return { patients, consultations };
};

export const importData = async (data: BackupData): Promise<void> => {
    await db.transaction('rw', db.patients, db.consultations, async () => {
        // Clear existing data
        await db.consultations.clear();
        await db.patients.clear();

        // Add new data. Dexie will handle re-inserting with existing IDs since the tables are empty.
        await db.patients.bulkAdd(data.patients);
        await db.consultations.bulkAdd(data.consultations);
    });
};

export const getAllDataForExport = async (): Promise<PatientWithConsultations[]> => {
    const patients = await db.patients.toArray();
    const consultations = await db.consultations.toArray();

    const patientMap = new Map<number, PatientWithConsultations>();
    patients.forEach(p => {
        if(p.id) {
            patientMap.set(p.id, { ...p, consultations: [] });
        }
    });

    consultations.forEach(c => {
        const patient = patientMap.get(c.patientId);
        if (patient) {
            patient.consultations.push(c);
        }
    });

    return Array.from(patientMap.values());
};

export const importSinglePatient = async (data: PatientWithConsultations): Promise<void> => {
    await db.transaction('rw', db.patients, db.consultations, async () => {
        // Check for conflict
        const existingPatient = await db.patients.where('identifier').equals(data.identifier).first();
        if (existingPatient) {
            throw new Error(`Un patient avec l'identifiant "${data.identifier}" existe déjà.`);
        }

        // Prepare patient data (without id)
        const { id, consultations, ...patientToAdd } = data;
        const newPatientId = await db.patients.add(patientToAdd as Patient);

        // Prepare and add consultations
        const consultationsToAdd = consultations.map(c => {
            const { id, ...consultationData } = c;
            return {
                ...consultationData,
                patientId: newPatientId
            };
        });
        await db.consultations.bulkAdd(consultationsToAdd as Consultation[]);
    });
};


// --- Data Seeding ---

const seedDatabase = async () => {
    const patientCount = await db.patients.count();
    if (patientCount > 0) {
        return; // Database already has data
    }

    try {
        // Patient 1: Jean Dupont
        const patient1Id = await db.patients.add({
            firstName: 'Jean',
            lastName: 'Dupont',
            dateOfBirth: '1955-03-15',
            gender: 'Homme',
            identifier: 'JD-1955-01',
            referringDoctor: 'Dr. Z. Souissi',
            createdAt: new Date('2023-01-20'),
            updatedAt: new Date('2023-07-25'),
        });

        // Consultation 1 for Jean Dupont
        await db.consultations.add({
            patientId: patient1Id,
            consultationDate: new Date('2023-01-20'),
            formData: {
                ...INITIAL_DMD_FORM_DATA, // Start with initial data
                anamnese: {
                    familialHistory: 'Non', familialHistoryDetails: [''], patientAge: 68, smokingStatus: 'Sevré', smokingPA: 40, symptomatology: "Dyspnée d'effort progressive depuis 3 ans, toux sèche chronique.",
                    dyspneaScale: { scale: 'mMRC', value: 2 },
                    ctdSigns: { articular: [], cutaneous: [], muscular: [], sicca: [], general: [], other: '' },
                    comorbidities: { rgo: 'Oui', saos: 'Non recherché', cardio: 'Non', emphyseme: 'Oui', htp: 'Non', cancer: 'Non', depression: 'Non' },
                    comorbiditiesDetails: "RGO traité par IPP. Emphysème centrolobulaire discret aux sommets.",
                },
                environnement: { exposures: ['Aucune connue'], exposureDetails: [''], habitatDetails: '', precipitines: 'Non', precipitinesDetails: [''] },
                 medicamenteux: {
                    hasRiskMeds: 'Non',
                    medsList: '',
                    radiation: 'Non',
                    immunology: {
                        tests: { ...initialImmunologyTests },
                        aanTiter: '',
                        aanPattern: '',
                        otherTests: ''
                    }
                },
                examens: { 
                    ...INITIAL_DMD_FORM_DATA.examens,
                    physicalExam: { respiratory: ["Râles crépitants 'velcro'", "Hippocratisme digital"], cutaneous: [], articular: [], other: '', capillaroscopyPerformed: false, capillaroscopyResult: '', salivaryGlandBiopsyPerformed: false, salivaryGlandBiopsyResult: '', salivaryGlandBiopsyOther: '' },
                    radiology: {
                        hrctDate: '2023-01-10',
                        hrctProtocol: 'Approprié',
                        distribution: ['Sous-pleurale et basale'], 
                        honeycombing: 'Oui', 
                        reticulations: 'Oui',
                        tractionBronchiectasis: 'Oui',
                        atypicalFeatures: ['Aucun de ces aspects'],
                        fibrosisExtent: 20,
                        radiologyReport: "Aspect de pneumopathie interstitielle commune (PIC) typique. Rayon de miel prédominant aux bases et en sous-pleural, associé à des réticulations et des bronchectasies de traction. Pas de signe atypique. Lésions d'emphysème centrolobulaire aux sommets."
                    },
                    efr: { cvfValue: 2.8, cvfPercent: 75, cptValue: 4.5, cptPercent: 80, vemsValue: 2.4, vemsPercent: 78, dlcoValue: 12, dlcoPercent: 45, efrInterpretation: 'Restrictif' }, 
                    tm6: { distance: 350, spo2Baseline: 95, spo2Min: 87 },
                    abg: { performed: 'Oui', ph: 7.41, pao2: 75, paco2: 40 },
                },
                synthese: { 
                    lba: 'Non', lbaCellularity: { total: '', lymphocytes: '', macrophages: '', neutrophiles: '', eosinophiles: '', lbaCd4Cd8Ratio: '' }, biopsy: 'Non', biopsyResult: [''], 
                    rcpQuestion: ['Confirmation diagnostique', 'Indication thérapeutique'], 
                    summary: "Patient de 68 ans, ancien grand tabagique, présentant un tableau clinique et fonctionnel de PID. Le scanner est typique d'une PIC/UIP. Diagnostic de FPI retenu en RCP.",
                    aiSuggestions: '',
                    gapScore: 4,
                    gapStage: 'II',
                },
            },
        });

        // Patient 2: Marie Martin
        const patient2Id = await db.patients.add({
            firstName: 'Marie',
            lastName: 'Martin',
            dateOfBirth: '1960-08-22',
            gender: 'Femme',
            identifier: 'MM-1960-02',
            referringDoctor: 'Dr. L. Masmoudi',
            createdAt: new Date('2023-03-10'),
            updatedAt: new Date('2023-03-10'),
        });
        
        // Consultation 1 for Marie Martin
        await db.consultations.add({
            patientId: patient2Id,
            consultationDate: new Date('2023-03-10'),
            formData: {
                ...INITIAL_DMD_FORM_DATA,
                anamnese: {
                    familialHistory: 'Non', familialHistoryDetails: [''], patientAge: 63, smokingStatus: 'Jamais', smokingPA: '', symptomatology: "Dyspnée d'effort d'apparition récente (1 an). Toux sèche intermittente. Arthralgies des mains.",
                    dyspneaScale: { scale: 'mMRC', value: 1},
                    ctdSigns: { articular: ['Arthralgies inflammatoires'], cutaneous: ['Phénomène de Raynaud'], muscular: [], sicca: [], general: [], other: '' },
                    comorbidities: { rgo: 'Non', saos: 'Non', cardio: 'Non', emphyseme: 'Non', htp: 'Non', cancer: 'Non', depression: 'Oui' },
                    comorbiditiesDetails: "Suivi psychologique pour anxiété réactionnelle.",
                },
                environnement: { exposures: ['Aucune connue'], exposureDetails: [''], habitatDetails: '', precipitines: 'Oui, négatives', precipitinesDetails: [''] },
                medicamenteux: { 
                    hasRiskMeds: 'Non',
                    medsList: '', 
                    radiation: 'Non',
                    immunology: { 
                        tests: {
                            ...initialImmunologyTests,
                            'AAN': 'Positif',
                            'Facteur Rhumatoïde': 'Négatif',
                            'Anti-CCP': 'Négatif',
                        },
                        aanTiter: '1/320', 
                        aanPattern: 'Moucheté', 
                        otherTests: "Bilan complémentaire de connectivite demandé." 
                    },
                },
                examens: { 
                    ...INITIAL_DMD_FORM_DATA.examens,
                    physicalExam: { respiratory: ["Râles crépitants 'velcro'"], cutaneous: [], articular: [], other: '', capillaroscopyPerformed: false, capillaroscopyResult: '', salivaryGlandBiopsyPerformed: false, salivaryGlandBiopsyResult: '', salivaryGlandBiopsyOther: '' },
                    radiology: {
                        hrctDate: '2023-03-01',
                        hrctProtocol: 'Approprié',
                        distribution: ['Sous-pleurale et basale', 'Diffuse'], 
                        honeycombing: 'Non', 
                        reticulations: 'Oui',
                        tractionBronchiectasis: 'Non',
                        atypicalFeatures: ['Verre dépoli prédominant'],
                        fibrosisExtent: 15,
                        radiologyReport: "Anomalies interstitielles diffuses avec une prédominance de verre dépoli et de fines réticulations. Pas de rayon de miel. Distribution basale et sous-pleurale, mais également diffuse. Aspect le plus compatible avec une PINS."
                    },
                    efr: { cvfValue: 2.2, cvfPercent: 85, cptValue: 3.5, cptPercent: 88, vemsValue: 1.9, vemsPercent: 86, dlcoValue: 14, dlcoPercent: 60, efrInterpretation: 'Normal' }, 
                    tm6: { distance: 450, spo2Baseline: 97, spo2Min: 91 },
                },
                synthese: { 
                    ...INITIAL_DMD_FORM_DATA.synthese,
                    lba: 'Oui', lbaCellularity: { total: 250000, lymphocytes: 35, macrophages: 55, neutrophiles: 8, eosinophiles: 2, lbaCd4Cd8Ratio: '' }, biopsy: 'Non', biopsyResult: [''], 
                    rcpQuestion: ['Confirmation diagnostique', 'Discussion de biopsie'], 
                    summary: "Patiente de 63 ans, non fumeuse, avec des signes extra-respiratoires. Le scanner montre des signes de fibrose avec du verre dépoli, non typique d'une UIP. Le LBA montre une lymphocytose. Bilan immunologique positif. Diagnostic discuté en RCP : PINS probable dans le cadre d'une connectivite débutante à classer. Une biopsie est discutée." 
                },
            },
        });
    } catch (error) {
        console.error("Failed to seed database:", error);
    }
};

// Seed the database on application load if it's empty
db.on('ready', seedDatabase);