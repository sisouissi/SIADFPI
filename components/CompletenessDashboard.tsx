import React, { useMemo, useState } from 'react';
import { DMDFormData, Patient, Consultation } from '../types';
import { checklistSections } from '../services/checklist';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, SparklesIcon } from '../constants';
import { generateExamSuggestions } from '../services/geminiService';
import { parseMarkdown } from '../services/markdownParser';

interface CompletenessDashboardProps {
  formData: DMDFormData;
  patient: Patient | null;
  onSuggestionsGenerated: (suggestions: string) => void;
}

const CompletenessDashboard: React.FC<CompletenessDashboardProps> = ({ formData, patient, onSuggestionsGenerated }) => {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  
  const scores = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    let criticalItems = 0;
    let criticalCompleted = 0;
    let weightedScore = 0;
    const missingCritical: string[] = [];

    checklistSections.forEach(section => {
      let sectionCompleted = 0;
      section.items.forEach(item => {
        totalItems++;
        if (item.critical) criticalItems++;

        if (item.checker(formData, patient)) {
          completedItems++;
          sectionCompleted++;
          if (item.critical) criticalCompleted++;
        } else {
            if (item.critical) {
                missingCritical.push(item.label);
            }
        }
      });
      
      const sectionScore = (sectionCompleted / section.items.length) * section.weight;
      weightedScore += sectionScore;
    });

    const overallCompletion = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const criticalCompletion = criticalItems > 0 ? (criticalCompleted / criticalItems) * 100 : 100;

    let status: 'complete' | 'acceptable' | 'incomplete' = 'incomplete';
    if (criticalCompletion === 100 && weightedScore >= 80) {
      status = 'complete';
    } else if (criticalCompletion >= 80 && weightedScore >= 60) {
      status = 'acceptable';
    }

    return {
      overall: overallCompletion.toFixed(0),
      weighted: weightedScore.toFixed(0),
      critical: criticalCompletion.toFixed(0),
      status,
      completedItems,
      totalItems,
      criticalCompleted,
      criticalItems,
      missingCritical,
    };
  }, [formData, patient]);

  const handleGetSuggestions = async () => {
    if (!patient) return;
    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    let fullSuggestions = "";
    try {
        await generateExamSuggestions(
            patient, 
            formData,
            (chunk: string) => {
                fullSuggestions += chunk;
                setSuggestions(fullSuggestions);
            }
        );
        onSuggestionsGenerated(fullSuggestions);
    } catch (err) {
        setSuggestionsError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        setSuggestions(null); // On error, reset to null to allow retrying
    } finally {
        setIsLoadingSuggestions(false);
    }
  };


  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'complete':
        return <CheckCircleIcon className="w-8 h-8 text-green-600" />;
      case 'acceptable':
        return <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />;
      default:
        return <XCircleIcon className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'complete':
        return 'DOSSIER COMPLET - Prêt pour RCP';
      case 'acceptable':
        return 'DOSSIER ACCEPTABLE - À compléter si possible';
      default:
        return 'DOSSIER INCOMPLET - Examens manquants critiques';
    }
  };

    const getStatusColor = (status: string) => {
    switch(status) {
      case 'complete':
        return 'bg-green-50/70 border-green-400';
      case 'acceptable':
        return 'bg-yellow-50/70 border-yellow-400';
      default:
        return 'bg-red-50/70 border-red-400';
    }
  };

  return (
    <div className={`border-l-4 rounded-r-xl p-6 mb-8 shadow-md ${getStatusColor(scores.status)}`}>
        <div className="flex items-center gap-4">
            {getStatusIcon(scores.status)}
            <div>
                <h2 className="text-xl font-bold text-slate-800">
                    {getStatusText(scores.status)}
                </h2>
                <p className="text-sm text-slate-600">
                    {scores.completedItems}/{scores.totalItems} éléments complétés
                    {' • '}
                    {scores.criticalCompleted}/{scores.criticalItems} éléments critiques
                </p>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-300/50">
            {/* Global progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                    <span>Progression Globale</span>
                    <span className="font-bold text-accent-blue">{scores.overall}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-accent-blue h-2.5 rounded-full" style={{ width: `${scores.overall}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>
            
            {/* Score cards for weighted and critical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm border border-slate-200">
                    <span className="font-semibold text-slate-700">Score Pondéré</span>
                    <span className="text-2xl font-bold text-purple-600">{scores.weighted}%</span>
                </div>
                <div className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm border border-slate-200">
                    <span className="font-semibold text-slate-700">Éléments Critiques</span>
                    <span className={`text-2xl font-bold ${scores.critical === '100' ? 'text-green-600' : 'text-red-600'}`}>{scores.critical}%</span>
                </div>
            </div>
        </div>
        
        {scores.missingCritical.length > 0 && (
            <details open className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-red-700 hover:underline">
                    {scores.missingCritical.length} élément(s) critique(s) manquant(s)
                </summary>
                <ul className="mt-2 text-xs text-red-700 list-disc list-inside columns-2 sm:columns-3 md:columns-4 gap-x-4">
                    {scores.missingCritical.map(item => <li key={item}>{item}</li>)}
                </ul>
            </details>
        )}

        <div className="mt-6 pt-4 border-t border-slate-300/50">
            <h3 className="font-bold text-slate-800 mb-2">Suggestions de l'IA</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleGetSuggestions}
                    disabled={isLoadingSuggestions}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg border border-purple-200 hover:bg-purple-200 transition disabled:opacity-50"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isLoadingSuggestions ? 'Analyse en cours...' : (suggestionsError ? 'Réessayer' : (suggestions !== null) ? 'Regénérer les suggestions' : 'Suggérer des examens')}
                </button>
            </div>


            {isLoadingSuggestions && (
                <div className="flex items-center gap-2 text-slate-500 mt-4">
                    <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyse du dossier par l'IA...</span>
                </div>
            )}

            {suggestionsError && !isLoadingSuggestions && (
                 <div className="flex items-center p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg mt-4">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2"/>
                    <p className="text-sm"><strong>Erreur :</strong> {suggestionsError}</p>
                </div>
            )}
            
            {suggestions !== null && suggestions.trim() !== "" && (
                <div
                    className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-200 mt-4"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(suggestions) }}
                />
            )}
        </div>
    </div>
  );
};

export default CompletenessDashboard;