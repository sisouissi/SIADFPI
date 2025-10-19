import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  grade?: string;
  children: React.ReactNode;
  titleClassName?: string;
}

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const Accordion: React.FC<AccordionProps> = ({ title, grade, children, titleClassName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const finalTitleClassName = titleClassName ?? 'font-semibold text-xl';

  return (
    <div className="border-b-2 border-slate-300/70">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-5 text-left text-slate-800 hover:text-accent-blue transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex items-start">
            <span className={`${finalTitleClassName} mr-4`}>{title}</span>
            {grade && <span className="text-sm font-mono bg-slate-200 text-slate-700 px-3 py-1 rounded-full mt-1">{grade}</span>}
        </div>
        <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
            <div className="text-slate-600 space-y-3 pb-6 pr-10">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;