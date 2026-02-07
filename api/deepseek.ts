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

  const system_prompt = `Tu es un pneumologue expert en PID. Ton analyse doit être concise et justifiée. Ne suggère que ce qui est cliniquement pertinent selon les **recommandations ERS/ATS 2025** et ERS/EULAR 2025.
                
  Règles spécifiques :
  1. Classification 2025 : Termes **BIP**, **AMP**, **iDAD**.
  2. Pertinence : Ne propose QUE les examens **strictement nécessaires et validés** pour le diagnostic. Évite toute suggestion superflue.
  3. Si le dossier permet un diagnostic confiant (≥90%), réponds simplement "Le dossier est complet pour le diagnostic".
  
  Si des examens manquent, propose une liste restreinte sous forme de liste à puces Markdown. Pour chaque suggestion, fournis une justification clinique brève (1 ligne).`;
  
  const user_prompt = `En te basant sur le dossier patient ci-dessous, identifie les examens complémentaires indispensables (le cas échéant) pour affiner le diagnostic.

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
  const system_prompt = `Tu es un assistant expert spécialisé dans les PID. Ta base de connaissances intègre la **Mise à jour ERS/ATS 2025 sur la classification des pneumopathies interstitielles**.
  
  POINTS IMPORTANTS À RESPECTER :
  - **Nomenclature :** Parle de BIP (Bronchiolocentric Interstitial Pneumonia) au lieu de pattern PHS. Parle d'AMP (Alveolar Macrophage Pneumonia) au lieu de DIP.
  - **Structure :** Distingue "Troubles Interstitiels" (UIP, NSIP, BIP, PPFE...) et "Troubles de Comblement Alvéolaire" (OP, RB-ILD, AMP).
  - **Certitude :** Mentionne l'importance d'un diagnostic "Confiant" (≥90%) ou "Provisoire".
  - **FPI :** Est un diagnostic de pattern UIP idiopathique.
  
  Réponds à la question de l'utilisateur de manière précise, professionnelle et complète en te basant sur ces nouvelles références.`;
  
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
  
  const system_prompt = `Tu es un pneumologue expert spécialisé dans les pneumopathies interstitielles diffuses (PID).
                
  TES RÉFÉRENCES :
  1. **Mise à jour ERS/ATS 2025** (Classification des PID).
  2. ERS/EULAR 2025 (Connectivites).
  3. Guide Tunisien 2022 (FPI).
  
  DIRECTIVES DE RÉDACTION ERS/ATS 2025 :
  - Analyse TDM : Identifie le pattern dominant : UIP, NSIP, **BIP** (nouveau terme pour bronchiolocentrique/PHS), **AMP** (nouveau terme pour DIP), DAD, OP, ou PPFE.
  - Classement : Précise s'il s'agit d'un trouble interstitiel ou de comblement alvéolaire.
  - Diagnostic : Évalue le niveau de confiance (Confiant, Provisoire, Inclassable). Utilise le terme "Provisoire" si <90% de certitude.
  
  Rédige un rapport structuré, professionnel et concis.`;

  const user_prompt = `Analyse les données de la consultation du **${new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}** pour le patient **${patient.firstName} ${patient.lastName}**.

Voici les données du dossier de consultation :
---
${formattedData}
---

En te basant UNIQUEMENT sur ces informations mais en appliquant la classification ERS 2025, rédige un rapport argumenté en utilisant impérativement le format Markdown avec les sections suivantes :

## 1. Synthèse Clinique
Résume les points clés de l'anamnèse et de l'examen.
## 2. Analyse des Examens Complémentaires
Interprète les résultats TDM (pattern UIP, NSIP, BIP, etc.) et EFR.
## 3. Hypothèses Diagnostiques
Liste les diagnostics probables (ex: FPI, BIP idiopathique ou secondaire, etc.).
## 4. Discussion et Conclusion de la DMD
Propose un diagnostic, évalue la certitude (Confiant/Provisoire).
## 5. Plan de Prise en Charge Proposé
Suggère les prochaines étapes.`;

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
  
  const system_prompt = `Tu es un pneumologue expert qui rédige une synthèse de suivi. 
  
  Utilise :
  - **Fibrose Pulmonaire Progressive (PPF)** (critères ERS/ATS).
  - Terminologie **ERS/ATS 2025** (BIP, AMP, iDAD, PPFE...).`;
  
  const user_prompt = `Voici les données du dossier :
---
**PATIENT:**
- Nom: ${patient.lastName}, ${patient.firstName}
- Date de Naissance: ${new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}

**HISTORIQUE DES CONSULTATIONS:**
${historyPrompt}
---

Rédige un rapport de synthèse concis mais complet (format Markdown) :

## 1. Résumé du Cas
Présente le patient et son diagnostic (terminologie 2025).
## 2. Évolution Clinique et Symptomatique
## 3. Évolution Fonctionnelle et Radiologique
## 4. Tolérance et Efficacité des Traitements
## 5. Conclusion et Plan de Suivi
Statut (stable, PPF) et plan.`;

  const chatCompletion = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt }
    ],
  });

  return chatCompletion.choices[0]?.message?.content || '';
}