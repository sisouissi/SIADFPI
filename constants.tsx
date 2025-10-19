import React from 'react';
import { Section } from './types';
import HomePage from './pages/HomePage';
import IntroductionPage from './pages/IntroductionPage';
import EpidemiologyPage from './pages/EpidemiologyPage';
import DiagnosisPage from './pages/DiagnosisPage';
import AlgorithmPage from './pages/AlgorithmPage';
import PatientRecordsPage from './pages/PatientRecordsPage'; // Renamed from DMDFormPage
import PrognosisPage from './pages/PrognosisPage';
import TreatmentPage from './pages/TreatmentPage';
import ExacerbationPage from './pages/ExacerbationPage';
import ComplicationsPage from './pages/ComplicationsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ReferencesPage from './pages/ReferencesPage';
import AbbreviationsPage from './pages/AbbreviationsPage';

// HeroIcons SVGs
export const HomeIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export const BookOpenIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const GlobeAltIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 16.5c-2.998 0-5.74-1.1-7.843-2.918m15.686-7.832L12 12m0 0L4.157 7.582" />
  </svg>
);

export const MagnifyingGlassIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

export const ChartBarIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const BeakerIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v.344c0 .318.04.63.116.932l1.54 6.162c.264 1.054.396 2.13.396 3.212 0 3.225-2.61 5.835-5.835 5.835-3.225 0-5.835-2.61-5.835-5.835 0-1.082.132-2.158.396-3.212l1.54-6.162a4.456 4.456 0 01.116-.932v-.344z" />
    </svg>
);

export const BoltIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const ShieldExclamationIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const QuestionMarkCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

export const FlowChartIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h1.5m3 0h1.5m3 0h1.5m3 0h1.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);

export const FolderIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
);

export const LungIconGraphic = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="lungGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
        </defs>
        
        {/* Lung Shapes - Flipped vertically and moved down */}
        <g transform="scale(1, -1) translate(0, -235)">
            <path d="M103,85 C105,60 120,40 145,35 C175,30 185,70 180,110 C175,150 150,180 125,185 C115,187 103,160 103,130 V 85 Z" fill="url(#lungGradient)" opacity="0.8"/>
            <path d="M97,85 C95,60 80,40 55,35 C25,30 15,70 20,110 C25,150 50,180 75,185 C85,187 97,160 97,130 V 85 Z" fill="url(#lungGradient)" opacity="0.8"/>
        </g>
        
        {/* Trachea, Bronchi, and Network - moved up a little bit */}
        <g transform="translate(0, 20)">
            {/* Trachea and Bronchi - central and more substantial */}
            <path d="M100,20 V 80 C100,85 97,88 94,88 H 90 L 80,105 M100,80 C100,85 103,88 106,88 H 110 L 120,105" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round"/>

            {/* Bronchial Tree Network - more structured branching */}
            <g stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round">
                {/* Left Lung Branches */}
                <path d="M80,105 L70,120 L60,115 M70,120 L75,135 M80,105 L65,90 L55,95"/>
                <path d="M75,135 L65,150 M75,135 L85,155"/>
                {/* Right Lung Branches */}
                <path d="M120,105 L130,120 L140,115 M130,120 L125,135 M120,105 L135,90 L145,95"/>
                <path d="M125,135 L135,150 M125,135 L115,155"/>
                <path d="M135,90 L150,80"/>
            </g>
            
            {/* Nodes at the end of branches - more subtle */}
            <g fill="white">
                <circle cx="60" cy="115" r="2" opacity="0.9"/>
                <circle cx="65" cy="150" r="2.5" opacity="1"/>
                <circle cx="85" cy="155" r="2" opacity="0.9"/>
                <circle cx="55" cy="95" r="2" opacity="0.9"/>
                <circle cx="140" cy="115" r="2" opacity="0.9"/>
                <circle cx="135" cy="150" r="2.5" opacity="1"/>
                <circle cx="115" cy="155" r="2" opacity="0.9"/>
                <circle cx="150" cy="80" r="2" opacity="0.9"/>
            </g>
        </g>
    </svg>
);


export const ArrowRightIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);


// Icons for InfoCapsules & Dashboard
export const LightBulbIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);
export const ClipboardListIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
export const UserGroupIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
export const ExclamationTriangleIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
  </svg>
);
export const PillIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L12 15.25l5.571-3M3.375 7.5l9.375 5.25L21.375 7.5M21.375 7.5v10.5L12.375 24l-9-5.25V7.5z" />
  </svg>
);
export const HeartIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
export const MicroscopeIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
);
export const LinkIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
);
export const SparklesIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.75 18l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.197a3.375 3.375 0 002.456 2.456l1.197.398-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);
export const TrendingDownIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.517l2.74-1.22m0 0l-3.75 3.75M21 12l-3.75-3.75" />
    </svg>
);

export const ChartPieIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
        <path d="M17 16v1h-17v-1h17zM5.203 7.976l4.204 3.026 5.593-6.251v2.284h1v-4.035h-4.036v1h2.366l-5.070 5.665-4.129-2.974-4.372 3.956 0.671 0.741 3.773-3.412z" />
    </svg>
);

export const UsersIcon = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2,2V20a2,2,0,0,0,2,2H22"></path>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6,18V8.5A3.5,3.5,0,0,1,9.5,5h0A3.5,3.5,0,0,1,13,8.5v2.29787A7.20213,7.20213,0,0,0,20.20213,18H22"></path>
    </svg>
);

export const ClockIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const DocumentTextIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const XCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const PaperAirplaneIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export const DocumentLockClosedIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6" />
    </svg>
);

export const DocumentArrowUpIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

export const EyeIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const UserIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

export const AcademicCapIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-2.072-1.036A48.548 48.548 0 0112 5.25a48.548 48.548 0 0111.832 3.861l-2.072 1.036m-17.664 0a48.548 48.548 0 0117.664 0z" />
    </svg>
);

export const CalendarDaysIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
    </svg>
);


export const LungsBackgroundIcon = ({ className = "w-48 h-48" }) => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 392.533 392.533" xmlSpace="preserve" className={className}>
        <g> 
            <path style={{ fill: '#E2E8F0' }} d="M242.618,126.658v136.727c0,24.63,15.838,45.964,39.499,53.075l88.63,26.634v-77.77 C370.747,192.275,314.182,132.218,242.618,126.658z"></path>
            <path style={{ fill: '#E2E8F0' }} d="M21.786,265.325v77.899l88.63-26.634c23.596-7.111,39.499-28.444,39.499-53.075V126.658 C83.653,131.701,23.208,186.65,21.786,265.325z"></path>
        </g>
        <path style={{ fill: '#FBBF24' }} d="M288.388,295.58c-14.287-4.331-23.984-17.261-23.984-32.194V152.711 c48.743,14.222,84.428,59.281,84.428,112.485v48.549L288.388,295.58z"></path>
        <path style={{ fill: '#60A5FA' }} d="M49.39,229.188h39.305c6.012,0,10.925,4.848,10.925,10.925s-4.848,10.925-10.925,10.925H44.606 c-0.517,4.719-0.905,9.438-0.905,14.222v7.564H64.97c6.012,0,10.925,4.848,10.925,10.925s-4.848,10.925-10.925,10.925H43.636v19.135 l60.574-18.23c14.287-4.331,23.984-17.261,23.984-32.194V152.84C90.893,163.507,61.285,192.404,49.39,229.188z"></path>
        <g>
            <path style={{ fill: '#94A3B8' }} d="M231.758,104.485c-6.012,0-10.925,4.848-10.925,10.925v59.863l-13.705-13.705V34.667 c0-6.012-4.848-10.925-10.925-10.925c-6.077,0-10.925,4.848-10.925,10.925v126.966l-13.576,13.64V115.41 c0-6.012-4.848-10.925-10.925-10.925C72.145,104.485,0,176.565,0,265.325v92.574c0,3.491,1.616,6.723,4.396,8.727 c2.327,1.681,6.271,2.78,9.632,1.681l102.723-30.901c32.905-9.891,54.949-39.628,54.949-73.956v-57.341l24.566-24.566 l24.566,24.566v57.341c0,34.327,22.109,64.065,54.95,73.956l102.723,30.901c3.168,1.034,6.4,0.388,9.632-1.681 c2.78-2.069,4.396-5.301,4.396-8.727v-92.574C392.533,176.565,320.388,104.485,231.758,104.485z M149.915,263.386 c0,24.63-15.838,45.964-39.499,53.075l-88.63,26.634v-77.899c1.422-78.61,61.867-133.495,128.129-138.537 C149.915,126.658,149.915,263.386,149.915,263.386z M370.747,343.095l-88.63-26.634c-23.596-7.111-39.499-28.444-39.499-53.075 V126.658c71.564,5.56,128.129,65.616,128.129,138.537L370.747,343.095L370.747,343.095z"></path>
            <path style={{ fill: '#94A3B8' }} d="M279.79,158.4c-5.495-2.457-11.96-0.065-14.481,5.495c-2.457,5.495-0.065,11.96,5.495,14.481 c15.838,7.111,29.414,18.489,39.305,32.84c3.556,4.719,10.343,6.271,15.127,2.78c4.913-3.426,6.206-10.214,2.78-15.127 C315.992,181.155,299.248,167.192,279.79,158.4z"></path>
        </g>
    </svg>
);


export const SECTIONS: Section[] = [
  { id: 'home', title: 'Accueil', icon: HomeIcon, component: HomePage },
  { id: 'introduction', title: 'Introduction & Objectif', icon: BookOpenIcon, component: IntroductionPage },
  { id: 'epidemiology', title: 'Épidémiologie', icon: GlobeAltIcon, component: EpidemiologyPage },
  { id: 'diagnosis', title: 'Diagnostic & Bilan Initial', icon: MagnifyingGlassIcon, component: DiagnosisPage },
  { id: 'algorithm', title: 'Algorithme Diagnostique', icon: FlowChartIcon, component: AlgorithmPage },
  { id: 'patient-records', title: 'Patients', icon: FolderIcon, component: PatientRecordsPage },
  { id: 'prognosis', title: 'Évaluation du Pronostic', icon: ChartBarIcon, component: PrognosisPage },
  { id: 'treatment', title: 'Traitement', icon: BeakerIcon, component: TreatmentPage },
  { id: 'exacerbation', title: 'Exacerbation Aiguë', icon: BoltIcon, component: ExacerbationPage },
  { id: 'complications', title: 'Complications & Comorbidités', icon: ShieldExclamationIcon, component: ComplicationsPage },
  { id: 'recommendations', title: 'Recommandations', icon: ClipboardListIcon, component: RecommendationsPage },
  { id: 'references', title: 'Références', icon: DocumentTextIcon, component: ReferencesPage },
  { id: 'abbreviations', title: 'Abréviations', icon: QuestionMarkCircleIcon, component: AbbreviationsPage },
];