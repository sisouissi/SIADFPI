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
                system_prompt = `Tu es un pneumologue expert en PID. Ton analyse doit être concise et justifiée. Ne suggère que ce qui est cliniquement pertinent selon les recommandations ERS/EULAR 2025. 
                
                Règles spécifiques ERS/EULAR 2025 à appliquer si suspicion de connectivite :
                1. Dépistage : TDM-HR recommandée (EFR insuffisantes) pour SSc, et pour PR/Myosites/Sjögren si facteurs de risque.
                2. Si suspicion SSc : Capillaroscopie, auto-anticorps spécifiques (Anti-Topoisomérase I, Anti-Centromère, Anti-RNA Polymerase III).
                3. Si suspicion Myosite (IIM) : Panel myosite (Anti-Synthetases, Anti-MDA5, Anti-Ro52).
                4. Si suspicion PR : Anti-CCP, Facteur Rhumatoïde.
                
                Si le dossier semble complet, indique-le simplement. Propose une liste d'examens complémentaires sous forme de liste à puces Markdown. Pour chaque suggestion, fournis une brève justification clinique.`;
                
                user_prompt = `En te basant sur le dossier patient incomplet ci-dessous, identifie les 3 examens complémentaires les plus pertinents à suggérer pour affiner le diagnostic ou le bilan pré-thérapeutique.\n\nDOSSIER PATIENT:\n---\n**Patient:** ${patient.lastName} ${patient.firstName}, né(e) le ${patient.dateOfBirth}\n**Données actuelles:**\n${formattedData}\n---`;
                break;
            }
            case 'generateConsultationSynthesis': {
                const { patient, consultationDate, formattedData } = data;
                system_prompt = `Tu es un pneumologue expert spécialisé dans les pneumopathies interstitielles diffuses (PID), agissant dans le cadre d'une discussion multidisciplinaire (DMD). 
                
                TES RÉFÉRENCES :
                1. Pour la FPI : Guide Tunisien 2022 et SPLF.
                2. Pour les PID associées aux connectivites (CTD-ILD) : Utilise IMPÉRATIVEMENT les **Recommandations ERS/EULAR 2025**.
                
                POINTS CLÉS ERS/EULAR 2025 À INTÉGRER DANS L'ANALYSE :
                - Classification : Distingue bien SSc-ILD, RA-ILD, IIM-ILD, SjD-ILD.
                - Pronostic : Utilise le pattern TDM (UIP vs non-UIP), la CVF, la DLCO et l'extension au scanner.
                - Traitement (si abordé) : 
                   * SSc-ILD : Mycophenolate (MMF), Tocilizumab (si inflammatoire/précoce), Nintedanib (si progression), Rituximab/Cyclophosphamide (si sévère).
                   * RA-ILD : Immunosuppresseurs, Pirfénidone (si pattern UIP), Nintedanib (si fibrose progressive).
                   * IIM-ILD : Corticoïdes + Immunosuppresseurs (Tacrolimus, Rituximab, etc.).
                   * Fibrose Progressive (PPF) : Nintedanib en ajout.

                Rédige un rapport structuré, professionnel et concis.`;
                
                user_prompt = `Analyse les données de la consultation du **${new Date(consultationDate).toLocaleDateString('fr-FR')}** pour le patient **${patient.firstName} ${patient.lastName}**.\n\nVoici les données du dossier de consultation :\n---\n${formattedData}\n---\n\nEn te basant UNIQUEMENT sur ces informations mais en appliquant une démarche clinique rigoureuse, rédige un rapport argumenté.\n\n**Commence ton rapport par le paragraphe suivant :**\n"Analyse intelligente des données médicales du dossier du patient ${patient.firstName} ${patient.lastName}, réalisée à partir de son dossier détaillé et conformément aux référentiels actuels (Guide Tunisien 2022, ERS/EULAR 2025 pour les CTD-ILD). Cette analyse, propulsée par l’intelligence artificielle, vise à proposer une synthèse pertinente pour alimenter la discussion multidisciplinaire."\n\n**Ensuite, utilise IMPÉRATIVEMENT le format Markdown avec les sections suivantes :**\n\n## 1. Synthèse Clinique\nRésume les points clés de l'anamnèse, de l'examen clinique et des expositions.\n## 2. Analyse des Examens Complémentaires\nInterprète les résultats de la TDM-HR (en concluant sur un pattern PIC/UIP ou Alternatif), des EFR et des autres examens.\n## 3. Hypothèses Diagnostiques\nListe les diagnostics les plus probables par ordre de priorité (FPI vs CTD-ILD vs PHS).\n## 4. Discussion et Conclusion de la DMD\nPropose un diagnostic de travail, évalue le niveau de certitude.\n## 5. Plan de Prise en Charge Proposé\nSuggère les prochaines étapes (thérapeutiques selon ERS 2025 si CTD-ILD, surveillance, etc.).`;
                break;
            }
            case 'generateGeneralSynthesis': {
                const { patient, historyPrompt } = data;
                system_prompt = `Tu es un pneumologue expert qui rédige une synthèse de suivi pour un dossier patient. Sois structuré, professionnel et concis. 
                
                Utilise les critères de **Fibrose Pulmonaire Progressive (PPF)** des guidelines ERS/ATS pour évaluer l'évolution :
                - Déclin physiologique (CVF ≥5% absolu ou DLCO ≥10%).
                - Aggravation des symptômes.
                - Progression radiologique.
                
                Si le patient présente une connectivite, réfère-toi aux guidelines ERS/EULAR 2025 pour l'analyse de la réponse thérapeutique.`;
                
                user_prompt = `Voici les données du dossier :\n---\n**PATIENT:**\n- Nom: ${patient.lastName}, ${patient.firstName}\n- Date de Naissance: ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}\n\n**HISTORIQUE DES CONSULTATIONS:**\n${historyPrompt}\n---\n\nRédige un rapport de synthèse concis mais complet.\n\n**Commence ton rapport par le paragraphe suivant :**\n"Analyse intelligente des données médicales du dossier du patient ${patient.firstName} ${patient.lastName}, réalisée à partir de son dossier détaillé. Cette analyse longitudinale vise à évaluer la progression de la maladie selon les critères internationaux récents (ERS/EULAR 2025)."\n\n**Ensuite, utilise IMPÉRATIVEMENT le format Markdown avec les sections suivantes :**\n\n## 1. Résumé du Cas\nPrésente brièvement le patient, son diagnostic initial et le contexte du suivi.\n## 2. Évolution Clinique et Symptomatique\nDécris l'évolution des symptômes (dyspnée, toux) au fil des consultations en te basant sur les informations fournies.\n## 3. Évolution Fonctionnelle et Radiologique\nAnalyse la trajectoire des EFR (CVF, DLCO) et des données du TM6 en te basant sur les points clés des résumés et les détails de la dernière consultation.\n## 4. Tolérance et Efficacité des Traitements\nFais le point sur les traitements en cours, leur tolérance et leur impact sur la progression de la maladie.\n## 5. Conclusion et Plan de Suivi\nConclus sur le statut actuel de la maladie (stable, en progression/PPF) et propose un plan pour la suite.`;
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
    const system_prompt = `Tu es un assistant expert spécialisé dans la Fibrose Pulmonaire Idiopathique (FPI) et les PID associées aux connectivites. Ta base de connaissances inclut le guide Tunisien de 2022, les recommandations SPLF, et surtout les **directives ERS/EULAR 2025 pour les CTD-ILD**. Réponds à la question de l'utilisateur de manière précise, professionnelle et complète. Si la question concerne une connectivite (Sclérodermie, PR, Myosite...), cite spécifiquement les recommandations 2025 (dépistage par TDM-HR, traitement par Tocilizumab/Rituximab/Nintedanib selon le cas).`;
    const user_prompt = `Question: "${question}"`;
    const response = await ai.models.generateContent({
        model,
        contents: user_prompt,
        config: { systemInstruction: system_prompt }
    });
    return response.text;
}