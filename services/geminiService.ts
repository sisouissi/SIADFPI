import { DMDFormData, Patient, Consultation } from '../types';

const handleApiError = async (response: Response): Promise<string> => {
    const errorBody = await response.json();
    const errorMessage = errorBody.details 
        ? `${errorBody.error}: ${errorBody.details}` 
        : errorBody.error;
    return errorMessage || "Une erreur est survenue lors de l'appel à l'API.";
};

/**
 * Answers a user's question based on the FPI guide content using Gemini API.
 * It now relies on the model's broad knowledge of FPI guidelines.
 */
export const getAnswerFromGuide = async (question: string): Promise<string> => {
  try {
    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getAnswer',
        data: {
          question
        }
      })
    });

    if (!response.ok) {
      return await handleApiError(response);
    }

    const { result } = await response.json();
    return result;

  } catch (error) {
    console.error("Erreur de connexion à l'API Gemini:", error);
    return "Impossible de contacter le service de l'IA. Vérifiez votre connexion internet ou réessayez plus tard.";
  }
};

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
    // FIX: Replace deprecated 'extraRespiSymptoms' with the new 'ctdSigns' structure from DMDFormData.
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
    // FIX: Replace deprecated 'immunoBase' and 'immunoSpecifics' with the new 'immunology.tests' object structure.
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
    // FIX: Replace deprecated 'clinicalSigns' with the new 'physicalExam' object structure.
    const physicalExam = data.examens.physicalExam;
    const allPhysicalSigns = [
        ...physicalExam.respiratory,
        ...physicalExam.cutaneous,
        ...physicalExam.articular,
        ...physicalExam.vascular,
    ];
    if (physicalExam.other) {
        allPhysicalSigns.push(physicalExam.other);
    }
    result += `- Signes à l'examen physique: ${formatValue(allPhysicalSigns)}\n`;
    result += `- TDM-HR - Distribution: ${formatValue(data.examens.radiology.distribution)}\n`;
    result += `- TDM-HR - Rayon de miel: ${formatValue(data.examens.radiology.honeycombing)}\n`;
    result += `- TDM-HR - Autres signes de fibrose: ${formatValue(data.examens.radiology.otherFibrosisSigns)}\n`;
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

export const generateConsultationSynthesis = async (patient: Patient, consultation: Consultation): Promise<string> => {
    const formattedData = formatDataForPrompt(consultation.formData);

    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'generateConsultationSynthesis',
                data: {
                    patient,
                    consultation,
                    formattedData
                }
            })
        });

        if (!response.ok) {
            return await handleApiError(response);
        }

        const { result } = await response.json();
        return result;

    } catch (error) {
        console.error("Erreur de connexion à l'API Gemini pour la synthèse:", error);
        return "Impossible de contacter le service de l'IA. Vérifiez votre connexion internet ou réessayez plus tard.";
    }
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


export const generateGeneralSynthesis = async (patient: Patient, consultations: Consultation[]): Promise<string> => {
    const sortedConsultations = [...consultations].sort((a, b) => 
        new Date(a.consultationDate).getTime() - new Date(b.consultationDate).getTime()
    );

    const historyPrompt = sortedConsultations.map((c, i) => {
        const dateStr = new Date(c.consultationDate).toLocaleDateString('fr-FR');
        // If it's the most recent consultation OR there are few consultations, send full data.
        // Otherwise, send a summary. This provides full context for the initial report 
        // but optimizes for long-term follow-up to prevent timeouts.
        if (i === sortedConsultations.length - 1 || sortedConsultations.length <= 2) {
            return `
CONSULTATION ${i + 1} - ${dateStr} (DÉTAILS COMPLETS):
${formatDataForPrompt(c.formData)}
---`;
        } else {
            return `
CONSULTATION ${i + 1} - ${dateStr} (RÉSUMÉ CLÉ):
${formatDataForSummaryPrompt(c.formData)}
---`;
        }
    }).join('\n');


    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'generateGeneralSynthesis',
                data: {
                    patient,
                    historyPrompt
                }
            })
        });

        if (!response.ok) {
            return await handleApiError(response);
        }

        const { result } = await response.json();
        return result;

    } catch (error) {
        console.error("Erreur de connexion à l'API Gemini pour la synthèse générale:", error);
        return "Impossible de contacter le service de l'IA. Vérifiez votre connexion internet ou réessayez plus tard.";
    }
};

export const generateExamSuggestions = async (
    patient: Patient,
    formData: DMDFormData,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const formattedData = formatDataForPrompt(formData);

    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'generateExamSuggestions',
                data: {
                    patient,
                    formattedData
                }
            })
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response);
            throw new Error(errorMessage);
        }
        
        if (!response.body) {
            throw new Error("La réponse de l'API est vide.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            if (value) {
                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }
        }

    } catch (error) {
        console.error("Erreur de connexion à l'API Gemini pour les suggestions:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Impossible de contacter le service de l'IA. Vérifiez votre connexion internet ou réessayez plus tard.");
    }
};