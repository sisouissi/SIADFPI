import { DMDFormData, Patient, Consultation } from '../types';

// Common error handler for fetch calls
const handleApiError = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type');
    let errorMessage: string;

    try {
        if (contentType && contentType.includes('application/json')) {
            const errorBody = await response.json();
            errorMessage = errorBody.details 
                ? `${errorBody.error}: ${errorBody.details}` 
                : errorBody.error || `Une erreur serveur est survenue (status: ${response.status}).`;
        } else {
            // Handle plain text errors, which can happen with server crashes or streaming errors
            errorMessage = await response.text();
            if (!errorMessage) {
                 errorMessage = `Une erreur serveur est survenue (status: ${response.status}) sans message d'erreur.`;
            }
        }
    } catch (e) {
        console.error("Erreur lors de la lecture de la réponse d'erreur API:", e);
        errorMessage = `Une erreur serveur est survenue (status: ${response.status}) et la réponse n'a pas pu être lue.`;
    }
    
    console.error("Erreur de l'API:", errorMessage);
    return errorMessage;
};

/**
 * Answers a user's question by calling the backend API.
 */
export const getAnswerFromGuide = async (question: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getAnswerFromGuide',
        data: { question }
      })
    });

    if (!response.ok) {
      return await handleApiError(response);
    }

    const { result } = await response.json();
    return result;

  } catch (error) {
    console.error("Erreur de connexion à l'API backend:", error);
    return "Impossible de contacter le service de l'IA via le serveur. Vérifiez votre connexion internet ou réessayez plus tard.";
  }
};

// --- Helper functions for formatting data (unchanged) ---

const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
        return 'Non renseigné';
    }
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'Aucun';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    return String(value);
};

const formatDataForPrompt = (data: DMDFormData): string => {
    let result = '';
    
    // Anamnèse
    result += `ANAMNÈSE:\n`;
    result += `- Antécédents familiaux: ${formatValue(data.anamnese.familialHistory)}`;
    if (data.anamnese.familialHistory === 'Oui') {
        result += ` (${formatValue(data.anamnese.familialHistoryDetails)})`;
    }
    result += `\n- Âge: ${formatValue(data.anamnese.patientAge)} ans\n`;
    result += `- Tabagisme: ${formatValue(data.anamnese.smokingStatus)}`;
    if (data.anamnese.smokingStatus !== 'Jamais' && data.anamnese.smokingPA) {
        result += ` (${formatValue(data.anamnese.smokingPA)} PA)`;
    }
    const ctdSigns = data.anamnese.ctdSigns;
    const allCtdSigns = [
        ...ctdSigns.articular,
        ...ctdSigns.cutaneous,
        ...ctdSigns.muscular,
        ...ctdSigns.sicca,
        ...ctdSigns.general,
    ];
    if (ctdSigns.other) {
        allCtdSigns.push(ctdSigns.other);
    }
    result += `\n- Signes de connectivite (anamnèse): ${formatValue(allCtdSigns)}\n`;
    result += `- Description clinique: ${formatValue(data.anamnese.symptomatology)}\n`;
    
    // Comorbidités
    result += `\nCOMORBIDITÉS:\n`;
    const comorbidities = Object.entries(data.anamnese.comorbidities)
        .filter(([, value]) => value === 'Oui')
        .map(([key]) => key.toUpperCase());
    result += `- Présentes: ${comorbidities.length > 0 ? comorbidities.join(', ') : 'Aucune'}\n`;
    result += `- Détails comorbidités: ${formatValue(data.anamnese.comorbiditiesDetails)}\n`;

    // Expositions
    result += `\nEXPOSITIONS:\n`;
    result += `- Type d'expositions: ${formatValue(data.environnement.exposures)}\n`;
    if (data.environnement.exposures.length > 0 && !data.environnement.exposures.includes('Aucune connue')) {
        result += `- Détails expositions: ${formatValue(data.environnement.exposureDetails)}\n`;
    }
    result += `- Précipitines: ${formatValue(data.environnement.precipitines)}`;
     if (data.environnement.precipitines === 'Oui, positives') {
        result += ` (${formatValue(data.environnement.precipitinesDetails)})`;
    }
    result += `\n`;

    // Causes médicamenteuses et auto-immunes
    result += `\nAUTRES CAUSES POTENTIELLES:\n`;
    result += `- Médicaments à risque: ${formatValue(data.medicamenteux.medsList)}\n`;
    const baseTests = ['AAN', 'Facteur Rhumatoïde', 'Anti-CCP', 'ANCA', 'CPK'];
    const immunoTests = data.medicamenteux.immunology.tests;

    const baseResults = baseTests
        .filter(test => immunoTests[test] && immunoTests[test] !== 'Non réalisé')
        .map(test => `${test}: ${immunoTests[test]}`);

    result += `- Bilan immunologique de base: ${formatValue(baseResults)}`;
    if (immunoTests['AAN'] === 'Positif') {
        result += ` (Titre: ${formatValue(data.medicamenteux.immunology.aanTiter)}, Pattern: ${formatValue(data.medicamenteux.immunology.aanPattern)})`;
    }
    result += `\n`;

    const specificAntibodies = Object.keys(immunoTests).filter(test => !baseTests.includes(test));
    const specificResults = specificAntibodies
        .filter(test => immunoTests[test] && immunoTests[test] !== 'Non réalisé')
        .map(test => `${test}: ${immunoTests[test]}`);

    result += `- Spécificités immunologiques: ${formatValue(specificResults)}`;
    if (data.medicamenteux.immunology.otherTests) {
        result += ` (Autres: ${formatValue(data.medicamenteux.immunology.otherTests)})`;
    }
    result += `\n`;

    // Examens
    result += `\nEXAMENS:\n`;
    const physicalExam = data.examens.physicalExam;
    const allPhysicalSigns = [
        ...physicalExam.respiratory,
        ...physicalExam.cutaneous,
        ...physicalExam.articular,
    ];
    if (physicalExam.capillaroscopyPerformed) {
        allPhysicalSigns.push(`Capillaroscopie: ${physicalExam.capillaroscopyResult}`);
    }
    if (physicalExam.salivaryGlandBiopsyPerformed) {
        let biopsyText = `Biopsie glandes salivaires: ${physicalExam.salivaryGlandBiopsyResult}`;
        if (physicalExam.salivaryGlandBiopsyResult === 'Autre') {
            biopsyText += ` (${physicalExam.salivaryGlandBiopsyOther})`;
        }
        allPhysicalSigns.push(biopsyText);
    }
    if (physicalExam.other) {
        allPhysicalSigns.push(physicalExam.other);
    }
    result += `- Signes à l'examen physique: ${formatValue(allPhysicalSigns)}\n`;
    result += `- TDM-HR - Distribution: ${formatValue(data.examens.radiology.distribution)}\n`;
    result += `- TDM-HR - Rayon de miel: ${formatValue(data.examens.radiology.honeycombing)}\n`;
    result += `- TDM-HR - Réticulations: ${formatValue(data.examens.radiology.reticulations)}\n`;
    result += `- TDM-HR - Bronchectasies de traction: ${formatValue(data.examens.radiology.tractionBronchiectasis)}\n`;
    result += `- TDM-HR - Signes atypiques: ${formatValue(data.examens.radiology.atypicalFeatures)}\n`;
    result += `- EFR - CVF: ${formatValue(data.examens.efr.cvfPercent)}% (${formatValue(data.examens.efr.cvfValue)} L)\n`;
    result += `- EFR - DLCO: ${formatValue(data.examens.efr.dlcoPercent)}% (${formatValue(data.examens.efr.dlcoValue)} ml/min/mmHg)\n`;
    result += `- TM6 - Distance: ${formatValue(data.examens.tm6.distance)}m, SpO2 de base: ${formatValue(data.examens.tm6.spo2Baseline)}%, SpO2 min: ${formatValue(data.examens.tm6.spo2Min)}%\n`;

    // Synthèse
    result += `\nSYNTHÈSE & EXAMENS INVASIFS:\n`;
    result += `- LBA réalisé: ${formatValue(data.synthese.lba)}\n`;
    if (data.synthese.lba === 'Oui') {
        result += `- LBA - Cellularité: ${formatValue(data.synthese.lbaCellularity.total)}/ml, Lymphocytes: ${formatValue(data.synthese.lbaCellularity.lymphocytes)}%, Neutrophiles: ${formatValue(data.synthese.lbaCellularity.neutrophiles)}%\n`;
    }
    result += `- Biopsie réalisée: ${formatValue(data.synthese.biopsy)}\n`;
    if (data.synthese.biopsy.startsWith('Oui')) {
        result += `- Résultat biopsie: ${formatValue(data.synthese.biopsyResult)}\n`;
    }
    
    return result;
}

const handleStreamingApiCall = async (action: string, data: object, onChunk: (chunk: string) => void) => {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data })
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response);
            throw new Error(errorMessage);
        }
        
        if (!response.body) { throw new Error("La réponse de l'API est vide."); }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }
        }
    } catch (error) {
        console.error(`Erreur de connexion à l'API pour l'action ${action}:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Impossible de contacter le service de l'IA. Vérifiez votre connexion internet ou réessayez plus tard.");
    }
};

export const generateConsultationSynthesis = async (
    patient: Patient,
    consultation: Consultation,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const formattedData = formatDataForPrompt(consultation.formData);
    const apiData = { 
        patient, 
        consultationDate: consultation.consultationDate, 
        formattedData 
    };
    await handleStreamingApiCall('generateConsultationSynthesis', apiData, onChunk);
};

const formatDataForSummaryPrompt = (data: DMDFormData): string => {
    const summary = data.synthese.summary.split('--- RAPPORT IA ---')[0].trim();
    const pattern = (() => {
        const { distribution, honeycombing, atypicalFeatures } = data.examens.radiology;
        const hasSpecificAtypicalFeatures = atypicalFeatures.length > 0 && !atypicalFeatures.includes('Aucun de ces aspects');
        if (hasSpecificAtypicalFeatures) return "Alternatif";
        if (distribution.includes('Sous-pleurale et basale') && honeycombing === 'Oui') return "PIC Certaine";
        if (distribution.includes('Sous-pleurale et basale') && honeycombing === 'Non') return "PIC Probable";
        return "Indéterminé";
    })();

    const keyPoints = [
        `CVF: ${data.examens.efr.cvfPercent || 'N/A'}%`,
        `DLCO: ${data.examens.efr.dlcoPercent || 'N/A'}%`,
        `TM6 SpO2 min: ${data.examens.tm6.spo2Min || 'N/A'}%`,
        `Pattern TDM: ${pattern}`,
        `Conclusion: ${summary.substring(0, 120)}${summary.length > 120 ? '...' : ''}`
    ];
    return keyPoints.map(p => `- ${p}`).join('\n');
};

export const generateGeneralSynthesis = async (
    patient: Patient,
    consultations: Consultation[],
    onChunk: (chunk: string) => void
): Promise<void> => {
    const sortedConsultations = [...consultations].sort((a, b) => 
        new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime()
    );

    const historyPrompt = sortedConsultations.map((c, i) => {
        const dateStr = new Date(c.consultationDate).toLocaleDateString('fr-FR');
        if (i === sortedConsultations.length - 1 || sortedConsultations.length <= 2) {
            return `\nCONSULTATION ${i + 1} - ${dateStr} (DÉTAILS COMPLETS):\n${formatDataForPrompt(c.formData)}\n---`;
        } else {
            return `\nCONSULTATION ${i + 1} - ${dateStr} (RÉSUMÉ CLÉ):\n${formatDataForSummaryPrompt(c.formData)}\n---`;
        }
    }).join('\n');

    const apiData = { patient, historyPrompt };
    await handleStreamingApiCall('generateGeneralSynthesis', apiData, onChunk);
};

export const generateExamSuggestions = async (
    patient: Patient,
    formData: DMDFormData,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const formattedData = formatDataForPrompt(formData);
    const apiData = { patient, formattedData };
    await handleStreamingApiCall('generateExamSuggestions', apiData, onChunk);
};