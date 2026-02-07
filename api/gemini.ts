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
    
    const STREAMING_ACTIONS = ['generateExamSuggestions', 'generateConsultationSynthesis', 'generateGeneralSynthesis'];

    if (STREAMING_ACTIONS.includes(action)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        let system_prompt = '';
        let user_prompt = '';

        switch (action) {
            case 'generateExamSuggestions': {
                const { patient, formattedData } = data;
                system_prompt = `Tu es un pneumologue expert en PID. Ton analyse doit être concise, justifiée et basée sur la **classification ERS/ATS 2025**.

                NOUVELLES DIRECTIVES ERS/ATS 2025 À APPLIQUER :
                1. Distingue les motifs interstitiels (UIP, NSIP, BIP, PPFE) des motifs de comblement alvéolaire (OP, RB-ILD, AMP).
                2. Recherche activement les causes secondaires avant de conclure à une cause idiopathique.
                3. Si suspicion de pattern bronchiolocentrique, utilise le terme **BIP** (Bronchiolocentric Interstitial Pneumonia).
                4. Si suspicion de connectivite (CTD-ILD), applique les règles de dépistage (TDM-HR + anticorps spécifiques).

                **CRITÈRE DE PERTINENCE STRICT :** Ne suggère QUE les examens strictement nécessaires et validés par les recommandations pour confirmer le diagnostic ou écarter un diagnostic différentiel majeur. Évite absolument les examens superflus ou "au cas où".

                Si le dossier est suffisant pour poser un diagnostic avec un niveau de confiance ≥90% (Diagnostic Confiant), indique simplement "Aucun examen supplémentaire nécessaire". Sinon, propose une liste restreinte et ciblée sous forme de liste à puces Markdown.`;
                
                user_prompt = `En te basant sur le dossier patient ci-dessous, identifie UNIQUEMENT les examens complémentaires indispensables (si nécessaire) pour affiner le diagnostic.\n\nDOSSIER PATIENT:\n---\n**Patient:** ${patient.lastName} ${patient.firstName}, né(e) le ${patient.dateOfBirth}\n**Données actuelles:**\n${formattedData}\n---`;
                break;
            }
            case 'generateConsultationSynthesis': {
                const { patient, consultationDate, formattedData } = data;
                system_prompt = `Tu es un pneumologue expert spécialisé dans les pneumopathies interstitielles diffuses (PID), agissant dans le cadre d'une discussion multidisciplinaire (DMD). 
                
                TES RÉFÉRENCES PRIORITAIRES :
                1. **Mise à jour ERS/ATS 2025** sur la classification des pneumopathies interstitielles.
                2. Recommandations ERS/EULAR 2025 pour les CTD-ILD.
                3. Guide Tunisien 2022 pour la FPI.
                
                POINTS CLÉS DE LA CLASSIFICATION ERS/ATS 2025 À UTILISER :
                - **Terminologie :** Utilise **BIP** (Bronchiolocentric Interstitial Pneumonia) au lieu de "pattern PHS" histologique. Utilise **AMP** (Alveolar Macrophage Pneumonia) au lieu de DIP. Utilise **iDAD** au lieu de AIP.
                - **Catégorisation :** Classe le pattern en "Interstitiel" (UIP, NSIP, BIP, PPFE, LIP, DAD) ou "Comblement Alvéolaire" (OP, RB-ILD, AMP).
                - **Certitude :** Évalue si le diagnostic est "Confiant" (≥90%), "Provisoire" (51-89%) ou "Inclassable".
                - **FPI :** Reste définie par un pattern UIP sans cause secondaire identifiée.
                
                Rédige un rapport structuré, professionnel et concis en Markdown.`;
                
                user_prompt = `Analyse les données de la consultation du **${new Date(consultationDate).toLocaleDateString('fr-FR')}** pour le patient **${patient.firstName} ${patient.lastName}**.\n\nVoici les données du dossier de consultation :\n---\n${formattedData}\n---\n\nEn te basant UNIQUEMENT sur ces informations mais en appliquant une démarche clinique rigoureuse selon la classification ERS 2025, rédige un rapport argumenté.\n\n**Commence ton rapport par le paragraphe suivant :**\n"Analyse intelligente des données médicales du dossier du patient ${patient.firstName} ${patient.lastName}, réalisée à partir de son dossier détaillé et conformément aux nouveaux standards de classification (ERS/ATS 2025). Cette analyse vise à proposer une synthèse pertinente pour alimenter la discussion multidisciplinaire."\n\n**Ensuite, utilise IMPÉRATIVEMENT le format Markdown avec les sections suivantes :**\n\n## 1. Synthèse Clinique\nRésume les points clés de l'anamnèse, de l'examen clinique et des expositions.\n## 2. Analyse des Examens Complémentaires\nInterprète les résultats de la TDM-HR (en utilisant la terminologie 2025 : UIP, NSIP, BIP, OP, etc.) et des EFR.\n## 3. Hypothèses Diagnostiques\nListe les diagnostics les plus probables (ex: FPI, PID secondaire à connectivite, PHS/BIP, etc.).\n## 4. Discussion et Conclusion de la DMD\nPropose un diagnostic de travail, évalue le niveau de certitude (Confiant/Provisoire).\n## 5. Plan de Prise en Charge Proposé\nSuggère les prochaines étapes.`;
                break;
            }
            case 'generateGeneralSynthesis': {
                const { patient, historyPrompt } = data;
                system_prompt = `Tu es un pneumologue expert qui rédige une synthèse de suivi pour un dossier patient. Sois structuré, professionnel et concis. 
                
                Utilise les concepts actuels :
                - **Fibrose Pulmonaire Progressive (PPF)** (critères ERS/ATS) pour l'évolution.
                - Classification **ERS/ATS 2025** pour la terminologie des patterns (BIP, AMP, etc.).
                - **ERS/EULAR 2025** si une connectivite est impliquée.`;
                
                user_prompt = `Voici les données du dossier :\n---\n**PATIENT:**\n- Nom: ${patient.lastName}, ${patient.firstName}\n- Date de Naissance: ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}\n\n**HISTORIQUE DES CONSULTATIONS:**\n${historyPrompt}\n---\n\nRédige un rapport de synthèse concis mais complet.\n\n**Commence ton rapport par le paragraphe suivant :**\n"Analyse intelligente des données médicales du dossier du patient ${patient.firstName} ${patient.lastName}, réalisée à partir de son dossier détaillé. Cette analyse longitudinale vise à évaluer la progression de la maladie selon les critères internationaux récents (ERS/ATS 2025)."\n\n**Ensuite, utilise IMPÉRATIVEMENT le format Markdown avec les sections suivantes :**\n\n## 1. Résumé du Cas\nPrésente brièvement le patient, son diagnostic initial (terminologie 2025) et le contexte.\n## 2. Évolution Clinique et Symptomatique\nDécris l'évolution des symptômes.\n## 3. Évolution Fonctionnelle et Radiologique\nAnalyse la trajectoire des EFR (CVF, DLCO) et des données du TM6.\n## 4. Tolérance et Efficacité des Traitements\nFais le point sur les traitements.\n## 5. Conclusion et Plan de Suivi\nConclus sur le statut (stable, progression/PPF) et propose un plan.`;
                break;
            }
        }
        
        try {
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
            console.error(`Error streaming from Gemini for action ${action}:`, error);
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
      
      default:
        return res.status(400).json({ error: 'Action non reconnue ou non-streaming' });
    }

    return res.status(200).json({ result });

  } catch (error) {
    const errorResponse = handleApiError(error, 'handler');
    return res.status(500).json(errorResponse);
  }
}

// --- Logic functions for non-streaming actions ---
async function getAnswerFromGuide(question: string) {
    const system_prompt = `Tu es un assistant expert spécialisé dans les PID. Ta base de connaissances intègre désormais la **déclaration ERS/ATS 2025 sur la classification des pneumopathies interstitielles**.

    QUAND TU RÉPONDS :
    1. Utilise la nouvelle terminologie : **BIP** (Bronchiolocentric Interstitial Pneumonia) pour les patterns centrés sur les voies aériennes, **AMP** (Alveolar Macrophage Pneumonia) pour l'ancienne DIP, **iDAD** pour l'ancienne AIP.
    2. Distingue clairement les **Motifs Interstitiels** (UIP, NSIP, BIP, PPFE, LIP, DAD) des **Motifs de Comblement Alvéolaire** (OP, RB-ILD, AMP).
    3. Souligne l'importance de la certitude diagnostique (Confiant, Provisoire, Inclassable).
    4. Réserve le terme "FPI" aux patterns UIP sans cause secondaire.
    
    Réponds à la question de manière précise et professionnelle.`;
    const user_prompt = `Question: "${question}"`;
    const response = await ai.models.generateContent({
        model,
        contents: user_prompt,
        config: { systemInstruction: system_prompt }
    });
    return response.text;
}