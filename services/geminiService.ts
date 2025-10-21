import { GoogleGenAI } from "@google/genai";
import { DMDFormData, Patient, Consultation } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

// Common error handler
const handleApiError = (error: unknown, context: string): string => {
    console.error(`Erreur de connexion à l'API Gemini (${context}):`, error);
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    if (message.includes('API key not valid')) {
        return "La clé API n'est pas valide. Veuillez vérifier la configuration.";
    }
    return `Impossible de contacter le service de l'IA (${message}). Vérifiez votre connexion internet ou réessayez plus tard.`;
};

/**
 * Answers a user's question based on the FPI guide content using the API.
 */
export const getAnswerFromGuide = async (question: string): Promise<string> => {
  const system_prompt = `Tu es un assistant expert spécialisé dans la Fibrose Pulmonaire Idiopathique (FPI). Ta base de connaissances inclut le guide Tunisien de 2022, les recommandations de la Société de Pneumologie de Langue Française (SPLF), et les directives ERS/EULAR jusqu'à 2025. Réponds à la question de l'utilisateur de manière précise, professionnelle et complète en te basant sur cet ensemble de références. Structure ta réponse clairement. Si possible, mentionne la source de l'information (ex: "Selon la SPLF...").`;
  const user_prompt = `Question: "${question}"`;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: user_prompt,
        config: {
            systemInstruction: system_prompt
        }
    });
    return response.text;
  } catch (error) {
    return handleApiError(error, 'getAnswer');
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

export const generateConsultationSynthesis = async (patient: Patient, consultation: Consultation): Promise<string> => {
    const formattedData = formatDataForPrompt(consultation.formData);
    const system_prompt = `Tu es un pneumologue expert spécialisé dans les pneumopathies interstitielles diffuses (PID), agissant dans le cadre d'une discussion multidisciplinaire (DMD). Ton raisonnement doit s'appuyer sur les recommandations les plus récentes et pertinentes (guide SPLF 2022 FPI, ERS/EULAR CTD-ILD). Rédige un rapport structuré, professionnel et concis.`;
    const user_prompt = `Analyse les données de la consultation du **${new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}** pour le patient **${patient.firstName} ${patient.lastName}**.

Voici les données du dossier de consultation :
---
${formattedData}
---

En te basant UNIQUEMENT sur ces informations mais en appliquant une démarche clinique rigoureuse, rédige un rapport argumenté en utilisant impérativement le format Markdown avec les sections suivantes :

## 1. Synthèse Clinique
Résume les points clés de l'anamnèse, de l'examen clinique et des expositions.
## 2. Analyse des Examens Complémentaires
Interprète les résultats de la TDM-HR (en concluant sur un pattern PIC/UIP), des EFR et des autres examens.
## 3. Hypothèses Diagnostiques
Liste les diagnostics les plus probables par ordre de priorité.
## 4. Discussion et Conclusion de la DMD
Propose un diagnostic de travail, évalue le niveau de certitude, et discute de la nécessité d'examens supplémentaires (LBA, biopsie).
## 5. Plan de Prise en Charge Proposé
Suggère les prochaines étapes (thérapeutiques, surveillance, etc.).`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: user_prompt,
            config: {
                systemInstruction: system_prompt
            }
        });
        return response.text;
    } catch (error) {
        return handleApiError(error, 'consultationSynthesis');
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

    const system_prompt = `Tu es un pneumologue expert qui rédige une synthèse de suivi pour un dossier patient. Sois structuré, professionnel et concis. Analyse l'historique complet des consultations du patient **${patient.firstName} ${patient.lastName}**. **IMPORTANT:** L'historique fourni contient des résumés pour les consultations plus anciennes ("RÉSUMÉ CLÉ") et les détails complets pour la ou les plus récentes ("DÉTAILS COMPLETS"). Ta synthèse doit intégrer toutes ces informations pour donner une vue d'ensemble de l'évolution.`;
    const user_prompt = `Voici les données du dossier :
---
**PATIENT:**
- Nom: ${patient.lastName}, ${patient.firstName}
- Date de Naissance: ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}

**HISTORIQUE DES CONSULTATIONS:**
${historyPrompt}
---

Rédige un rapport de synthèse concis mais complet, en utilisant le format Markdown avec les sections suivantes :

## 1. Résumé du Cas
Présente brièvement le patient, son diagnostic initial et le contexte du suivi.
## 2. Évolution Clinique et Symptomatique
Décris l'évolution des symptômes (dyspnée, toux) au fil des consultations en te basant sur les informations fournies.
## 3. Évolution Fonctionnelle et Radiologique
Analyse la trajectoire des EFR (CVF, DLCO) et des données du TM6 en te basant sur les points clés des résumés et les détails de la dernière consultation.
## 4. Tolérance et Efficacité des Traitements
Fais le point sur les traitements en cours, leur tolérance et leur impact sur la progression de la maladie.
## 5. Conclusion et Plan de Suivi
Conclus sur le statut actuel de la maladie (stable, en progression) et propose un plan pour la suite (ajustement thérapeutique, examens à prévoir, etc.).`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: user_prompt,
            config: {
                systemInstruction: system_prompt
            }
        });
        return response.text;
    } catch (error) {
        return handleApiError(error, 'generalSynthesis');
    }
};

export const generateExamSuggestions = async (
    patient: Patient,
    formData: DMDFormData,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const formattedData = formatDataForPrompt(formData);
    const system_prompt = `Tu es un pneumologue expert en PID. Ton analyse doit être concise et justifiée. Ne suggère que ce qui est cliniquement pertinent. Si le dossier semble complet, indique-le simplement. Propose une liste d'examens complémentaires sous forme de liste à puces Markdown. Pour chaque suggestion, fournis une brève justification clinique (1-2 lignes max). Ne fournis que la liste Markdown, sans introduction ni conclusion. Exemple de format : * **Examen Suggéré 1:** Justification brève.`;
    const user_prompt = `En te basant sur le dossier patient incomplet ci-dessous, identifie les 3 examens complémentaires les plus pertinents à suggérer pour affiner le diagnostic ou le bilan pré-thérapeutique.

DOSSIER PATIENT:
---
**Patient:** ${patient.lastName} ${patient.firstName}, né(e) le ${patient.dateOfBirth}
**Données actuelles:**
${formattedData}
---`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model,
            contents: user_prompt,
            config: {
                systemInstruction: system_prompt
            }
        });

        for await (const chunk of responseStream) {
            onChunk(chunk.text);
        }

    } catch (error) {
        console.error("Erreur de connexion à l'API pour les suggestions:", error);
        const errorMessage = handleApiError(error, 'examSuggestions');
        throw new Error(errorMessage);
    }
};