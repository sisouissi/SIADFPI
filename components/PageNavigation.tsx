import React from 'react';
import { SECTIONS } from '../constants';
import { SectionId } from '../types';

interface PageNavigationProps {
  activeSectionId: SectionId;
  onNavigate: (sectionId: SectionId) => void;
}

const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);


const PageNavigation: React.FC<PageNavigationProps> = ({ activeSectionId, onNavigate }) => {
    // Les sections 'algorithm' et 'patient-records' sont des outils et n'appartiennent pas au flux de lecture du guide.
    const navigableSections = SECTIONS.filter(s => s.id !== 'algorithm' && s.id !== 'patient-records');

    const currentIndex = navigableSections.findIndex(s => s.id === activeSectionId);
    
    // Si la section active n'est pas dans la liste navigable (ex: on est sur la page patient), on ne montre pas la navigation.
    if (currentIndex === -1) {
        return null;
    }

    const prevSection = currentIndex > 0 ? navigableSections[currentIndex - 1] : null;
    const nextSection = currentIndex < navigableSections.length - 1 ? navigableSections[currentIndex + 1] : null;

    return (
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-300">
            <div>
                {prevSection && (
                    <button
                        onClick={() => onNavigate(prevSection.id as SectionId)}
                        className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-3 shrink-0 text-slate-500 group-hover:text-accent-blue transition-colors" />
                        <div className="text-left">
                            <span className="text-xs block text-slate-500">Précédent</span>
                            <span className="font-semibold text-slate-700">{prevSection.title}</span>
                        </div>
                    </button>
                )}
            </div>
            <div>
                {nextSection && (
                    <button
                        onClick={() => onNavigate(nextSection.id as SectionId)}
                        className="flex items-center text-right px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                        <div className="text-right">
                             <span className="text-xs block text-slate-500">Suivant</span>
                            <span className="font-semibold text-slate-700">{nextSection.title}</span>
                        </div>
                        <ArrowRightIcon className="w-5 h-5 ml-3 shrink-0 text-slate-500 group-hover:text-accent-blue transition-colors" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PageNavigation;