// api/gemini.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

// Common error handler for the API endpoint
const handleApiError = (error: unknown, context: string): { error: string, details?: string } => {
    console.error(`Erreur de l'API Gemini (${context}):`, error);
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    if (message.includes('API key not valid')) {
        return { error: "La clé API n'est pas valide. Veuillez vérifier la configuration du serveur." };
    }
    return { error: `Impossible de contacter le service de l'IA via le serveur.`, details: message };
};


// Handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.API_KEY) {
      console.error('Gemini API key missing from environment variables');
      return res.status(500).json({ error: "La clé API n'est pas configurée sur le serveur." });
    }
    
    const { action, data } = req.body;

    // Handle streaming action separately
    if (action === 'generateExamSuggestions') {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        try {
            const { patient, formattedData } = data;
            const system_prompt = `Tu es un pneumologue expert en PID. Ton analyse doit être concise et justifiée. Ne suggère que ce qui est cliniquement pertinent. Si le dossier semble complet, indique-le simplement. Propose une liste d'examens complémentaires sous forme de liste à puces Markdown. Pour chaque suggestion, fournis une brève justification clinique (1-2 lignes max). Si tu suggères un bilan immunologique, détaille explicitement les examens et anticorps à demander (par exemple : AAN, facteur rhumatoïde, anti-CCP, ANCA, anti-synthétases, etc.). Ne fournis que la liste Markdown, sans introduction ni conclusion. Exemple de format : * **Examen Suggéré 1:** Justification brève.`;
            const user_prompt = `En te basant sur le dossier patient incomplet ci-dessous, identifie les 3 examens complémentaires les plus pertinents à suggérer pour affiner le diagnostic ou le bilan pré-thérapeutique.\n\nDOSSIER PATIENT:\n---\n**Patient:** ${patient.lastName} ${patient.firstName}, né(e) le ${patient.dateOfBirth}\n**Données actuelles:**\n${formattedData}\n---`;
            
            const responseStream = await ai.models.generateContentStream({
                model,
                contents: user_prompt,
                config: { systemInstruction: system_prompt }
            });

            for await (const chunk of responseStream) {
                res.write(chunk.text);
            }
            res.end();

        } catch (error) {
            console.error("Error streaming from Gemini:", error);
            if (!res.writableEnded) {
                try {
                    res.status(500).end('Erreur de communication avec le service IA.');
                } catch (e) {
                    console.error("Impossible d'envoyer la réponse d'erreur:", e);
                }
            }
        }
        return;
    }
    
    // Handle non-streaming actions
    let result;
    switch (action) {
      case 'getAnswerFromGuide':
        result = await getAnswerFromGuide(data.question);
        break;
      
      case 'generateConsultationSynthesis':
        result = await generateConsultationSynthesis(data.patient, data.formattedData);
        break;
      
      case 'generateGeneralSynthesis':
        result = await generateGeneralSynthesis(data.patient, data.historyPrompt);
        break;
      
      default:
        return res.status(400).json({ error: 'Action non reconnue' });
    }

    return res.status(200).json({ result });

  } catch (error) {
    const errorResponse = handleApiError(error, 'handler');
    return res.status(500).json(errorResponse);
  }
}

// --- Logic functions (moved from service file) ---

async function getAnswerFromGuide(question: string) {
    const system_prompt = `Tu es un assistant expert spécialisé dans la Fibrose Pulmonaire Idiopathique (FPI). Ta base de connaissances inclut le guide Tunisien de 2022, les recommandations de la Société de Pneumologie de Langue Française (SPLF), et les directives ERS/EULAR jusqu'à 2025. Réponds à la question de l'utilisateur de manière précise, professionnelle et complète en te basant sur cet ensemble de références. Structure ta réponse clairement. Si possible, mentionne la source de l'information (ex: "Selon la SPLF...").`;
    const user_prompt = `Question: "${question}"`;
    const response = await ai.models.generateContent({
        model,
        contents: user_prompt,
        config: { systemInstruction: system_prompt }
    });
    return response.text;
}

async function generateConsultationSynthesis(patient: any, formattedData: string) {
    const system_prompt = `Tu es un pneumologue expert spécialisé dans les pneumopathies interstitielles diffuses (PID), agissant dans le cadre d'une discussion multidisciplinaire (DMD). Ton raisonnement doit s'appuyer sur les recommandations les plus récentes et pertinentes (guide SPLF 2022 FPI, ERS/EULAR CTD-ILD). Rédige un rapport structuré, professionnel et concis.`;
    const user_prompt = `Analyse les données de la consultation pour le patient **${patient.firstName} ${patient.lastName}**.\n\nVoici les données du dossier de consultation :\n---\n${formattedData}\n---\n\nEn te basant UNIQUEMENT sur ces informations mais en appliquant une démarche clinique rigoureuse, rédige un rapport argumenté en utilisant impérativement le format Markdown avec les sections suivantes :\n\n## 1. Synthèse Clinique\nRésume les points clés de l'anamnèse, de l'examen clinique et des expositions.\n## 2. Analyse des Examens Complémentaires\nInterprète les résultats de la TDM-HR (en concluant sur un pattern PIC/UIP), des EFR et des autres examens.\n## 3. Hypothèses Diagnostiques\nListe les diagnostics les plus probables par ordre de priorité.\n## 4. Discussion et Conclusion de la DMD\nPropose un diagnostic de travail, évalue le niveau de certitude, et discute de la nécessité d'examens supplémentaires (LBA, biopsie).\n## 5. Plan de Prise en Charge Proposé\nSuggère les prochaines étapes (thérapeutiques, surveillance, etc.).`;
    
    const response = await ai.models.generateContent({
        model,
        contents: user_prompt,
        config: { systemInstruction: system_prompt }
    });
    return response.text;
}

async function generateGeneralSynthesis(patient: any, historyPrompt: string) {
    const system_prompt = `Tu es un pneumologue expert qui rédige une synthèse de suivi pour un dossier patient. Sois structuré, professionnel et concis. Analyse l'historique complet des consultations du patient **${patient.firstName} ${patient.lastName}**. **IMPORTANT:** L'historique fourni contient des résumés pour les consultations plus anciennes ("RÉSUMÉ CLÉ") et les détails complets pour la ou les plus récentes ("DÉTAILS COMPLETS"). Ta synthèse doit intégrer toutes ces informations pour donner une vue d'ensemble de l'évolution.`;
    const user_prompt = `Voici les données du dossier :\n---\n**PATIENT:**\n- Nom: ${patient.lastName}, ${patient.firstName}\n- Date de Naissance: ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}\n\n**HISTORIQUE DES CONSULTATIONS:**\n${historyPrompt}\n---\n\nRédige un rapport de synthèse concis mais complet, en utilisant le format Markdown avec les sections suivantes :\n\n## 1. Résumé du Cas\nPrésente brièvement le patient, son diagnostic initial et le contexte du suivi.\n## 2. Évolution Clinique et Symptomatique\nDécris l'évolution des symptômes (dyspnée, toux) au fil des consultations en te basant sur les informations fournies.\n## 3. Évolution Fonctionnelle et Radiologique\nAnalyse la trajectoire des EFR (CVF, DLCO) et des données du TM6 en te basant sur les points clés des résumés et les détails de la dernière consultation.\n## 4. Tolérance et Efficacité des Traitements\nFais le point sur les traitements en cours, leur tolérance et leur impact sur la progression de la maladie.\n## 5. Conclusion et Plan de Suivi\nConclus sur le statut actuel de la maladie (stable, en progression) et propose un plan pour la suite (ajustement thérapeutique, examens à prévoir, etc.).`;
    
    const response = await ai.models.generateContent({
        model,
        contents: user_prompt,
        config: { systemInstruction: system_prompt }
    });
    return response.text;
}
