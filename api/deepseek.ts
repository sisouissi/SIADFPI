import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the structure for a message in the Deepseek API
interface DeepseekMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Creates the messages payload for the Deepseek API.
 * @param type The type of AI request to make.
 * @param payload The data associated with the request.
 * @returns An array of message objects for the API.
 */
const createMessages = (type: string, payload: any): DeepseekMessage[] => {
    let system_prompt = "Tu es un assistant expert en pneumologie, spécialisé dans la Fibrose Pulmonaire Idiopathique (FPI). Tes réponses doivent être précises, basées sur les connaissances médicales actuelles, et formulées de manière claire pour des professionnels de santé. Réponds en français au format Markdown.";
    let user_prompt = '';

    // Sanitize data by removing potentially large or irrelevant fields before stringifying
    const sanitizePayload = (p: any) => {
        if (!p) return null;
        // This is a placeholder for more specific sanitization if needed in the future
        return p;
    };

    switch (type) {
        case 'question':
            user_prompt = payload.question;
            break;

        case 'consultation_synthesis':
            system_prompt = "Tu es un pneumologue expert. Analyse les données suivantes d'une consultation pour un patient atteint de FPI. Rédige un rapport de synthèse clair et structuré en français et au format Markdown. Le rapport doit inclure : 1. Un résumé du contexte clinique. 2. L'interprétation des examens clés (TDM, EFR). 3. Une conclusion diagnostique probable et les arguments principaux. 4. La question posée à la RCP et ta recommandation.";
            user_prompt = `Données du patient: ${JSON.stringify(sanitizePayload(payload.patient), null, 2)}\n\nDonnées de la consultation: ${JSON.stringify(sanitizePayload(payload.consultation), null, 2)}`;
            break;

        case 'general_synthesis':
            system_prompt = "Tu es un pneumologue expert. Analyse l'historique complet d'un patient atteint de FPI à travers plusieurs consultations. Rédige une synthèse générale de l'évolution de la maladie en français et au format Markdown. Ton rapport doit commenter : 1. La trajectoire de la fonction respiratoire (CVF, DLCO). 2. L'évolution radiologique si mentionnée. 3. L'apparition/gestion des comorbidités. 4. Conclus sur le phénotype évolutif (stable, progressif) et le pronostic.";
            user_prompt = `Données du patient: ${JSON.stringify(sanitizePayload(payload.patient), null, 2)}\n\nHistorique des consultations: ${JSON.stringify(sanitizePayload(payload.consultations), null, 2)}`;
            break;

        case 'exam_suggestions':
            system_prompt = "Tu es un pneumologue expert aidant un confrère. Basé sur le dossier actuel d'un patient avec suspicion/diagnostic de PID, suggère des examens complémentaires pertinents pour affiner le diagnostic ou le bilan. Justifie brièvement chaque suggestion. Tes réponses doivent être concises, sous forme de liste à puces, en français et au format Markdown.";
            user_prompt = `Données du patient: ${JSON.stringify(sanitizePayload(payload.patient), null, 2)}\n\nDonnées du formulaire de la consultation actuelle: ${JSON.stringify(sanitizePayload(payload.formData), null, 2)}`;
            break;

        default:
            throw new Error(`Type de requête non valide: ${type}`);
    }

    return [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
    ];
};

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

const handler = async (req: VercelRequest, res: VercelResponse) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "La clé API n'est pas configurée sur le serveur." });
    }

    const { type, payload, stream } = req.body;
    if (!type || !payload) {
        return res.status(400).json({ error: 'Le type de requête et les données sont requis.' });
    }

    try {
        const messages = createMessages(type, payload);

        const apiBody = JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages,
            stream: !!stream,
        });

        const apiResponse = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_KEY}`,
            },
            body: apiBody,
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json().catch(() => ({}));
            const errorMessage = errorBody.error?.message || apiResponse.statusText;
            console.error(`Deepseek API Error (${apiResponse.status}):`, errorMessage, errorBody);
            
            if (apiResponse.status === 401) {
                 return res.status(401).json({ error: "Non autorisé : La clé API fournie pour le service Deepseek n'est pas valide." });
            }
            return res.status(apiResponse.status).json({
                error: `L'API Deepseek a retourné une erreur: ${errorMessage}`
            });
        }
        
        if (stream && apiResponse.body) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            const reader = apiResponse.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6);
                        if (data.trim() === '[DONE]') {
                            break;
                        }
                        try {
                            const json = JSON.parse(data);
                            const text = json.choices[0]?.delta?.content;
                            if (text) {
                                res.write(text);
                            }
                        } catch (e) {
                            console.error('Error parsing stream chunk:', data, e);
                        }
                    }
                }
            }
            res.end();
        } else {
            const json = await apiResponse.json();
            const answer = json.choices[0]?.message?.content;
            if (!answer) {
                throw new Error("La réponse de l'API était vide ou malformée.");
            }
            res.status(200).json({ answer });
        }

    } catch (error: any) {
        console.error(`Erreur interne du serveur pour le type '${type}':`, error);
        if (!res.writableEnded) {
            res.status(500).json({ error: `Erreur interne du serveur: ${error.message}` });
        }
    }
};

export default handler;
