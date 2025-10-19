import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Helper function to create specific prompts for the AI based on the request type.
 * @param type - The type of request (e.g., 'question', 'consultation_synthesis').
 * @param payload - The data associated with the request.
 * @returns An object containing the system and user content for the AI prompt.
 */
const createPrompt = (type: string, payload: any) => {
  let systemContent = "Tu es un assistant expert en pneumologie, spécialisé dans la Fibrose Pulmonaire Idiopathique (FPI). Tes réponses doivent être précises, basées sur les connaissances médicales actuelles, et formulées de manière claire pour des professionnels de santé. Réponds en français au format Markdown.";
  let userContent = '';

  // Sanitize data by removing potentially large or irrelevant fields before stringifying
  const sanitizePayload = (p: any) => {
      if (!p) return null;
      // This is a placeholder for more specific sanitization if needed in the future
      return p;
  };

  switch (type) {
    case 'question':
      userContent = payload.question;
      break;
    
    case 'consultation_synthesis':
      systemContent = "Tu es un pneumologue expert. Analyse les données suivantes d'une consultation pour un patient atteint de FPI. Rédige un rapport de synthèse clair et structuré en français et au format Markdown. Le rapport doit inclure : 1. Un résumé du contexte clinique. 2. L'interprétation des examens clés (TDM, EFR). 3. Une conclusion diagnostique probable et les arguments principaux. 4. La question posée à la RCP et ta recommandation.";
      userContent = `Données du patient: ${JSON.stringify(sanitizePayload(payload.patient), null, 2)}\n\nDonnées de la consultation: ${JSON.stringify(sanitizePayload(payload.consultation), null, 2)}`;
      break;

    case 'general_synthesis':
      systemContent = "Tu es un pneumologue expert. Analyse l'historique complet d'un patient atteint de FPI à travers plusieurs consultations. Rédige une synthèse générale de l'évolution de la maladie en français et au format Markdown. Ton rapport doit commenter : 1. La trajectoire de la fonction respiratoire (CVF, DLCO). 2. L'évolution radiologique si mentionnée. 3. L'apparition/gestion des comorbidités. 4. Conclus sur le phénotype évolutif (stable, progressif) et le pronostic.";
      userContent = `Données du patient: ${JSON.stringify(sanitizePayload(payload.patient), null, 2)}\n\nHistorique des consultations: ${JSON.stringify(sanitizePayload(payload.consultations), null, 2)}`;
      break;

    case 'exam_suggestions':
      systemContent = "Tu es un pneumologue expert aidant un confrère. Basé sur le dossier actuel d'un patient avec suspicion/diagnostic de PID, suggère des examens complémentaires pertinents pour affiner le diagnostic ou le bilan. Justifie brièvement chaque suggestion. Tes réponses doivent être concises, sous forme de liste à puces, en français et au format Markdown.";
      userContent = `Données du patient: ${JSON.stringify(sanitizePayload(payload.patient), null, 2)}\n\nDonnées du formulaire de la consultation actuelle: ${JSON.stringify(sanitizePayload(payload.formData), null, 2)}`;
      break;

    default:
      throw new Error(`Type de requête non valide: ${type}`);
  }
  return { systemContent, userContent };
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "La clé API n'est pas configurée sur le serveur." });
  }

  const { type, payload, stream } = req.body;
  if (!type || !payload) {
    return res.status(400).json({ error: 'Le type de requête et les données sont requis.' });
  }

  try {
    const { systemContent, userContent } = createPrompt(type, payload);
    
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemContent }, { role: 'user', content: userContent }],
        stream: !!stream,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorBody = await deepseekResponse.text();
      console.error('Deepseek API Error:', errorBody);
      throw new Error(`L'API a retourné une erreur: ${deepseekResponse.statusText}`);
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      
      const reader = deepseekResponse.body!.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

            for (const line of lines) {
              const jsonStr = line.replace(/^data: /, '');
              if (jsonStr === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  res.write(content);
                }
              } catch (e) {
                // Ignore incomplete JSON chunks, common during streaming
              }
            }
          }
        } finally {
            if (!res.writableEnded) {
                res.end();
            }
        }
      };
      await processStream();
    } else {
      const data = await deepseekResponse.json();
      const answer = data.choices[0]?.message?.content;
      if (!answer) {
        throw new Error("La réponse de l'API était vide ou malformée.");
      }
      res.status(200).json({ answer });
    }
  } catch (error) {
    console.error(`Erreur lors de la communication avec l'API Deepseek pour le type '${type}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
     if (!res.writableEnded) {
        res.status(500).json({ error: `Erreur interne du serveur: ${errorMessage}` });
     }
  }
}

export default handler;