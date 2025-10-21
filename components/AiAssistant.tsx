import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getAnswerFromGuide } from '../services/geminiService';
import { parseMarkdown } from '../services/markdownParser';
import { SparklesIcon, ExclamationTriangleIcon } from '../constants';

const AiAssistant: React.FC = () => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAssistantVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAssistantVisible]);

  const handleQuestionSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const result = await getAnswerFromGuide(question);
      setAnswer(result);
      setQuestion(''); // Clear input after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue.');
    } finally {
      setIsLoading(false);
    }
  }, [question, isLoading]);

  const toggleVisibility = () => {
    setIsAssistantVisible(prev => !prev);
  }

  return (
    <div className="mb-10">
      <button
        onClick={toggleVisibility}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-slate-100 transition-all duration-200"
        aria-expanded={isAssistantVisible}
      >
        <SparklesIcon className="w-5 h-5 text-accent-blue" />
        Demander à l'IA
      </button>

      {isAssistantVisible && (
        <div className="mt-4 p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center mb-4">
            <SparklesIcon className="w-6 h-6 text-accent-blue mr-3" />
            <h3 className="text-xl font-bold text-slate-800">Assistant IA du Guide FPI</h3>
          </div>
          
          <form onSubmit={handleQuestionSubmit}>
            <label htmlFor="ai-question" className="sr-only">Posez votre question sur la FPI</label>
            <textarea
              id="ai-question"
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Quels sont les effets secondaires de la pirfénidone ?"
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-blue resize-none"
              rows={3}
              disabled={isLoading}
            />
            <div className="mt-3 flex h-10 items-center">
              {isLoading ? (
                <div className="flex items-center gap-3 text-slate-500">
                  <svg className="animate-spin h-5 w-5 text-accent-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Réflexion...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!question.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue text-white font-bold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Soumettre la question
                </button>
              )}
            </div>
          </form>

          {(error || answer) && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="w-6 h-6 mr-3"/>
                    <p><strong>Erreur :</strong> {error}</p>
                </div>
              )}
              {answer && (
                <div>
                   <h4 className="font-bold text-slate-800 mb-2">Réponse de l'assistant :</h4>
                   <div
                    className="prose prose-sm max-w-none text-slate-600 prose-li:marker:text-accent-blue space-y-2"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(answer) }}
                    />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
