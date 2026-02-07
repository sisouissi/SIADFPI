import { DMDFormData, Patient } from '../types';

interface ChecklistItem {
    id: string;
    label: string;
    critical: boolean;
    checker: (formData: DMDFormData, patient: Patient | null) => boolean;
}

interface ChecklistSection {
    id: string;
    title: string;
    weight: number;
    items: ChecklistItem[];
}

const isNonEmptyString = (value: string | undefined | null) => !!value && value.trim() !== '';
const isFilledNumber = (value: number | '' | undefined | null) => typeof value === 'number' && !isNaN(value);
const isNonEmptyArray = (value: any[] | undefined | null) => Array.isArray(value) && value.length > 0;
const isRadioSelected = (value: string | undefined | null) => !!value && value !== 'Non recherché' && value !== 'Inconnu';


export const checklistSections: ChecklistSection[] = [
    {
        id: 'demographics',
        title: '1. DONNÉES DÉMOGRAPHIQUES ET ANAMNÈSE',
        weight: 15,
        items: [
            { id: 'age_sex', label: 'Âge et sexe', critical: true, checker: (formData, patient) => isFilledNumber(formData.anamnese.patientAge) && isNonEmptyString(patient?.gender) },
            { id: 'symptom_date', label: 'Description des symptômes', critical: true, checker: (formData) => isNonEmptyString(formData.anamnese.symptomatology) },
            { id: 'dyspnea', label: 'Dyspnée (échelle)', critical: true, checker: (formData) => isNonEmptyString(formData.anamnese.dyspneaScale.scale) && isFilledNumber(formData.anamnese.dyspneaScale.value) },
            { id: 'smoking', label: 'Tabagisme', critical: true, checker: (formData) => isNonEmptyString(formData.anamnese.smokingStatus) && (formData.anamnese.smokingStatus === 'Jamais' || isFilledNumber(formData.anamnese.smokingPA)) },
            { id: 'family_history', label: 'Antécédents familiaux de fibrose', critical: false, checker: (formData) => isNonEmptyString(formData.anamnese.familialHistory) },
            { id: 'occupational_exposure', label: 'Expositions professionnelles/domestiques', critical: true, checker: (formData) => isNonEmptyArray(formData.environnement.exposures) },
            { id: 'medications', label: 'Médicaments à risque', critical: true, checker: (formData) => formData.medicamenteux.hasRiskMeds === 'Non' || (formData.medicamenteux.hasRiskMeds === 'Oui' && isNonEmptyString(formData.medicamenteux.medsList)) },
            { id: 'comorbidities', label: 'Comorbidités (RGO)', critical: false, checker: (formData) => isRadioSelected(formData.anamnese.comorbidities.rgo) },
        ]
    },
    {
        id: 'clinical',
        title: '2. EXAMEN CLINIQUE',
        weight: 10,
        items: [
            { id: 'velcro_crackles', label: 'Crépitants "Velcro"', critical: true, checker: (formData) => formData.examens.physicalExam.respiratory.includes("Râles crépitants 'velcro'") },
            { id: 'digital_clubbing', label: 'Hippocratisme digital', critical: false, checker: (formData) => formData.examens.physicalExam.respiratory.includes("Hippocratisme digital") },
            { id: 'ctd_signs', label: 'Signes de connectivite', critical: false, checker: (formData) => isNonEmptyArray(formData.examens.physicalExam.cutaneous) || isNonEmptyArray(formData.examens.physicalExam.articular) },
            { id: 'capillaroscopy', label: 'Capillaroscopie', critical: false, checker: (formData) => !formData.examens.physicalExam.capillaroscopyPerformed || isNonEmptyString(formData.examens.physicalExam.capillaroscopyResult) },
            { id: 'salivary_biopsy', label: 'Biopsie Glandes Salivaires', critical: false, checker: (formData) => !formData.examens.physicalExam.salivaryGlandBiopsyPerformed || (isNonEmptyString(formData.examens.physicalExam.salivaryGlandBiopsyResult) && (formData.examens.physicalExam.salivaryGlandBiopsyResult !== 'Autre' || isNonEmptyString(formData.examens.physicalExam.salivaryGlandBiopsyOther))) }
        ]
    },
    {
        id: 'hrct',
        title: '3. TDM HAUTE RÉSOLUTION (TDM-HR)',
        weight: 25,
        items: [
            { id: 'hrct_date', label: 'Date du scanner', critical: true, checker: (formData) => isNonEmptyString(formData.examens.radiology.hrctDate) },
            { id: 'hrct_protocol', label: 'Protocole HRCT', critical: true, checker: (formData) => isRadioSelected(formData.examens.radiology.hrctProtocol) },
            { id: 'distribution', label: 'Distribution des lésions', critical: true, checker: (formData) => isNonEmptyArray(formData.examens.radiology.distribution) },
            { id: 'honeycombing', label: 'Rayon de miel', critical: true, checker: (formData) => isNonEmptyString(formData.examens.radiology.honeycombing) },
            { id: 'reticulations', label: 'Réticulations', critical: true, checker: (formData) => isNonEmptyString(formData.examens.radiology.reticulations) },
            { id: 'traction_bronchiectasis', label: 'Bronchectasies de traction', critical: true, checker: (formData) => isNonEmptyString(formData.examens.radiology.tractionBronchiectasis) },
            { id: 'atypical_features', label: 'Signes atypiques', critical: false, checker: (formData) => isNonEmptyArray(formData.examens.radiology.atypicalFeatures) },
        ]
    },
    {
        id: 'pft',
        title: '4. ÉPREUVES FONCTIONNELLES RESPIRATOIRES',
        weight: 20,
        items: [
            { id: 'fvc', label: 'CVF (% théorique)', critical: true, checker: (formData) => isFilledNumber(formData.examens.efr.cvfPercent) },
            { id: 'dlco', label: 'DLCO (% théorique)', critical: true, checker: (formData) => isFilledNumber(formData.examens.efr.dlcoPercent) },
            { id: 'tlc', label: 'CPT (% théorique)', critical: true, checker: (formData) => isFilledNumber(formData.examens.efr.cptPercent) },
        ]
    },
    {
        id: '6mwt',
        title: '5. TEST DE MARCHE DE 6 MINUTES',
        weight: 8,
        items: [
            { id: 'spo2_baseline', label: 'SpO2 de base', critical: false, checker: (formData) => isFilledNumber(formData.examens.tm6.spo2Baseline) },
            { id: 'spo2_min', label: 'SpO2 minimale', critical: false, checker: (formData) => isFilledNumber(formData.examens.tm6.spo2Min) },
            { id: 'desaturation', label: 'Présence de désaturation', critical: false, checker: (formData) => isFilledNumber(formData.examens.tm6.spo2Baseline) && isFilledNumber(formData.examens.tm6.spo2Min) },
        ]
    },
    {
        id: 'immunology',
        title: '6. BILAN IMMUNOLOGIQUE',
        weight: 12,
        items: [
            { id: 'ana', label: 'Anticorps anti-nucléaires (AAN)', critical: true, checker: (formData) => formData.medicamenteux.immunology.tests['AAN'] !== 'Non réalisé' },
            { id: 'rf', label: 'Facteur rhumatoïde (FR)', critical: true, checker: (formData) => formData.medicamenteux.immunology.tests['Facteur Rhumatoïde'] !== 'Non réalisé' },
            { id: 'anti_ccp', label: 'Anti-CCP', critical: true, checker: (formData) => formData.medicamenteux.immunology.tests['Anti-CCP'] !== 'Non réalisé' },
            { id: 'precipitins', label: 'Précipitines', critical: false, checker: (formData) => isNonEmptyString(formData.environnement.precipitines) },
        ]
    },
    {
        id: 'bal',
        title: '7. LAVAGE BRONCHO-ALVÉOLAIRE',
        weight: 5,
        items: [
            { id: 'bal_performed', label: 'LBA réalisé', critical: false, checker: (formData) => formData.synthese.lba === 'Oui' || formData.synthese.lba === 'Non' },
            { id: 'bal_differential', label: 'Formule cellulaire', critical: false, checker: (formData) => formData.synthese.lba === 'Non' || (isFilledNumber(formData.synthese.lbaCellularity.lymphocytes) && isFilledNumber(formData.synthese.lbaCellularity.neutrophiles)) },
        ]
    },
     {
      id: 'echo',
      title: '8. ÉCHOCARDIOGRAPHIE',
      weight: 5,
      items: [
        { id: 'echo_performed', label: 'Échocardiographie réalisée', critical: false, checker: (formData) => formData.examens.echocardiography.performed === 'Oui' },
        { id: 'paps', label: 'PAPS estimée', critical: false, checker: (formData) => formData.examens.echocardiography.performed === 'Non' || isFilledNumber(formData.examens.echocardiography.paps) },
      ]
    }
];