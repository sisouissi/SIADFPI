// api/deepseek.ts
// NOTE: This file uses the Deepseek API via an OpenAI-compatible interface.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
    
    if (!API_KEY) {
      console.error('Deepseek API key missing from environment variables');
      return res.status(500).json({ 
        error: "The API key is not configured on the server" 
      });
    }

    const { action, data } = req.body;

    const deepseek = new OpenAI({ 
      apiKey: API_KEY,
      baseURL: 'https://api.deepseek.com/v1' 
    });

    // Handle streaming action separately
    if (action === 'generateExamSuggestions') {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        return await handleExamSuggestionsStream(deepseek, data, res);
    }

    // Handle non-streaming actions
    let result;
    switch (action) {
      case 'getAnswer':
        result = await handleGetAnswer(deepseek, data.question);
        break;
      
      case 'generateConsultationSynthesis':
        result = await handleConsultationSynthesis(deepseek, data);
        break;
      
      case 'generateGeneralSynthesis':
        result = await handleGeneralSynthesis(deepseek, data);
        break;
      
      default:
        return res.status(400).json({ error: 'Unrecognized action' });
    }

    return res.status(200).json({ result });

  } catch (error) {
    console.error("Detailed error:", error);
    const errorMessage = "Error calling the Deepseek API";
    const errorDetails = error instanceof Error ? error.message : String(error);

    return res.status(500).json({ 
      error: errorMessage,
      details: errorDetails
    });
  }
}

async function handleExamSuggestionsStream(deepseek: OpenAI, data: any, res: VercelResponse) {
  const { patient, formattedData } = data;

  const system_prompt = `Tu es un pneumologue expert en PID. Ton analyse doit être concise et justifiée. Ne suggère que ce qui est cliniquement pertinent. Si le dossier semble complet, indique-le simplement. Propose une liste d'examens complémentaires sous forme de liste à puces Markdown. Pour chaque suggestion, fournis une brève justification clinique (1-2 lignes max). Ne fournis que la liste Markdown, sans introduction ni conclusion. Exemple de format : * **Examen Suggéré 1:** Justification brève.`;
  const user_prompt = `En te basant sur le dossier patient incomplet ci-dessous, identifie les 3 examens complémentaires les plus pertinents à suggérer pour affiner le diagnostic ou le bilan pré-thérapeutique.

DOSSIER PATIENT:
---
**Patient:** ${patient.lastName} ${patient.firstName}, né(e) le ${patient.dateOfBirth}
**Données actuelles:**
${formattedData}
---`;

  try {
    const stream = await deepseek.chat.completions.create({
        model: 'deepseek-chat', 
        messages: [
            { role: 'system', content: system_prompt },
            { role: 'user', content: user_prompt }
        ],
        stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        res.write(chunk.choices[0]?.delta?.content);
      }
    }
    res.end();
  } catch (error) {
    console.error("Error streaming from Deepseek:", error);
    if (!res.writableEnded) {
        try {
            res.status(500).end('Error communicating with the AI service');
        } catch (e) {
            console.error("Could not send error response:", e);
        }
    }
  }
}

async function handleGetAnswer(deepseek: OpenAI, question: string) {
  const system_prompt = `Tu es un assistant expert spécialisé dans la Fibrose Pulmonaire Idiopathique (FPI). Ta base de connaissances inclut le guide Tunisien de 2022, les recommandations de la Société de Pneumologie de Langue Française (SPLF), et les directives ERS/EULAR jusqu'à 2025. Réponds à la question de l'utilisateur de manière précise, professionnelle et complète en te basant sur cet ensemble de références. Structure ta réponse clairement. Si possible, mentionne la source de l'information (ex: "Selon la SPLF...").`;
  const user_prompt = `Question: "${question}"`;

  const chatCompletion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
    ],
  });
  return chatCompletion.choices[0]?.message?.content || '';
}

async function handleConsultationSynthesis(deepseek: OpenAI, data: any) {
  const { patient, consultation, formattedData } = data;
  
  const system_prompt = `Tu es un pneumologue expert spécialisé dans les pneumopathies interstitielles diffuses (PID), agissant dans le cadre d'une discussion multidisciplinaire (DMD). Ton raisonnement doit s'appuyer sur les recommandations les plus récentes et pertinentes (guide SPLF 2022 FPI, ERS/EULAR CTD-ILD). Rédige un rapport structuré, professionnel et concis.`;
  const user_prompt = `Analyse les données de la consultation du **${new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}** pour le patient **${patient.firstName} ${patient.lastName}**.

Voici les données du dossier de consultation :
---
${formattedData}
---

En te basant UNIQUEMENT sur ces informations mais en appliquant une démarche clinique rigoureuse, rédige un rapport argumenté en utilisant impérativement le format Markdown avec les sections suivantes :

**1. Synthèse Clinique:** Résume les points clés de l'anamnèse, de l'examen clinique et des expositions.
**2. Analyse des Examens Complémentaires:** Interprète les résultats de la TDM-HR (en concluant sur un pattern PIC/UIP), des EFR et des autres examens.
**3. Hypothèses Diagnostiques:** Liste les diagnostics les plus probables par ordre de priorité.
**4. Discussion et Conclusion de la DMD:** Propose un diagnostic de travail, évalue le niveau de certitude, et discute de la nécessité d'examens supplémentaires (LBA, biopsie).
**5. Plan de Prise en Charge Proposé:** Suggère les prochaines étapes (thérapeutiques, surveillance, etc.).`;

  const chatCompletion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
    ],
  });

  return chatCompletion.choices[0]?.message?.content || '';
}

async function handleGeneralSynthesis(deepseek: OpenAI, data: any) {
  const { patient, historyPrompt } = data;
  
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

**1. Résumé du Cas:** Présente brièvement le patient, son diagnostic initial et le contexte du suivi.
**2. Évolution Clinique et Symptomatique:** Décris l'évolution des symptômes (dyspnée, toux) au fil des consultations en te basant sur les informations fournies.
**3. Évolution Fonctionnelle et Radiologique:** Analyse la trajectoire des EFR (CVF, DLCO) et des données du TM6 en te basant sur les points clés des résumés et les détails de la dernière consultation.
**4. Tolérance et Efficacité des Traitements:** Fais le point sur les traitements en cours, leur tolérance et leur impact sur la progression de la maladie.
**5. Conclusion et Plan de Suivi:** Conclus sur le statut actuel de la maladie (stable, en progression) et propose un plan pour la suite (ajustement thérapeutique, examens à prévoir, etc.).`;

  const chatCompletion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
    ],
  });

  return chatCompletion.choices[0]?.message?.content || '';
}