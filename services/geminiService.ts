// services/geminiService.ts

/**
 * Helper function for standard, non-streaming API calls to the backend.
 * @param type The type of AI request to make.
 * @param payload The data associated with the request.
 * @returns A promise that resolves with the AI's answer.
 */
const callApi = async (type: string, payload: any): Promise<string> => {
    try {
        const response = await fetch('/api/deepseek', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Réponse invalide du serveur.' }));
            // Specific handling for 401 Unauthorized to provide a clearer user message.
            if (response.status === 401) {
                throw new Error(errorData.error || "L'authentification avec l'assistant IA a échoué. La clé d'API est probablement invalide ou mal configurée.");
            }
            throw new Error(errorData.error || `Une erreur est survenue: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.answer) {
            throw new Error("La réponse de l'API était vide.");
        }
        return data.answer;
    } catch (error) {
        console.error(`Erreur lors de l'appel à l'assistant IA pour '${type}':`, error);
        if (error instanceof Error) {
            // The error message from the backend is already user-friendly, so we return it.
            return `Erreur : ${error.message}`;
        }
        return "Erreur : Impossible de contacter l'assistant IA.";
    }
};

/**
 * Answers a user's question by calling the secure backend endpoint.
 */
export const getAnswerFromGuide = (question: string): Promise<string> => {
    return callApi('question', { question });
};

/**
 * Generates a synthesis for a single consultation.
 */
export const generateConsultationSynthesis = (patient: any, consultation: any): Promise<string> => {
    return callApi('consultation_synthesis', { patient, consultation });
};

/**
 * Generates a general synthesis for a patient based on all their consultations.
 */
export const generateGeneralSynthesis = (patient: any, consultations: any[]): Promise<string> => {
    return callApi('general_synthesis', { patient, consultations });
};

/**
 * Generates suggestions for further exams in a streaming fashion.
 */
export const generateExamSuggestions = async (
    patient: any,
    formData: any,
    onChunk: (chunk: string) => void
): Promise<void> => {
    try {
        const response = await fetch('/api/deepseek', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'exam_suggestions', payload: { patient, formData }, stream: true }),
        });

        if (!response.ok || !response.body) {
            const errorData = await response.json().catch(() => ({ error: 'Réponse invalide du serveur.' }));
             // Specific handling for 401 Unauthorized to provide a clearer user message.
            if (response.status === 401) {
                throw new Error(errorData.error || "L'authentification avec l'assistant IA a échoué. La clé d'API est probablement invalide ou mal configurée.");
            }
            throw new Error(errorData.error || `Une erreur est survenue: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    } catch (error) {
         console.error("Erreur lors du streaming des suggestions:", error);
         const errorMessage = error instanceof Error ? `Erreur : ${error.message}` : "Erreur inconnue lors du streaming.";
         // Pass the error message back as a chunk to be displayed in the UI
         onChunk(errorMessage);
    }
};