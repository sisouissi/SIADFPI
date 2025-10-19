import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChartPieIcon, 
    UsersIcon, 
    ClockIcon, 
    LungsBackgroundIcon,
    BookOpenIcon,
    FlowChartIcon,
    FolderIcon,
    ExclamationTriangleIcon
} from '../constants';

const statColors = {
    incidence: { border: 'border-sky-500', bg: 'bg-sky-100', text: 'text-sky-600' },
    prevalence: { border: 'border-pink-500', bg: 'bg-pink-100', text: 'text-pink-600' },
    survival: { border: 'border-amber-500', bg: 'bg-amber-100', text: 'text-amber-600' },
};

const StatCard = ({ icon: Icon, title, value, description, colorClass }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-t-4 ${colorClass.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}>
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${colorClass.bg}`}>
                <Icon className={`w-7 h-7 ${colorClass.text}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className={`text-3xl font-bold ${colorClass.text}`}>{value}</p>
            </div>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-20">
            {/* Hero Section */}
            <header className="text-center relative pt-8 pb-4">
                <LungsBackgroundIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 h-56 w-56 opacity-20 z-0" />
                <div className="relative z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Système Interactif d'Aide au Diagnostic de la FPI
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10">
                        Un outil complet pour le diagnostic et la gestion de la FPI, intégrant un guide clinique interactif, un algorithme décisionnel et un module de gestion des dossiers patients.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => navigate('/introduction')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-sky-500 to-accent-blue text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300 focus:ring-opacity-50"
                        >
                            <BookOpenIcon className="w-6 h-6" />
                            <span>Guide interactif</span>
                        </button>
                        <button
                            onClick={() => navigate('/algorithm')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-rose-300 focus:ring-opacity-50"
                        >
                            <FlowChartIcon className="w-6 h-6" />
                            <span>Algorithme</span>
                        </button>
                        <button
                            onClick={() => navigate('/patient-records')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50"
                        >
                            <FolderIcon className="w-6 h-6" />
                            <span>Dossiers Patients</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section>
                <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">La FPI en Chiffres Clés</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard 
                        icon={ChartPieIcon} 
                        title="Incidence" 
                        value="~94/100k" 
                        description="Nouveaux cas par an (max. rapporté)"
                        colorClass={statColors.incidence}
                    />
                    <StatCard 
                        icon={UsersIcon} 
                        title="Prévalence" 
                        value="~4.5/10k" 
                        description="Cas existants (max. rapporté)"
                        colorClass={statColors.prevalence}
                    />
                    <StatCard 
                        icon={ClockIcon} 
                        title="Survie Médiane" 
                        value="~3.8 ans" 
                        description="Après diagnostic (adultes ≥65 ans)"
                        colorClass={statColors.survival}
                    />
                </div>
            </section>

            {/* Disclaimer Section */}
            <section className="mt-20">
                <div className="max-w-4xl mx-auto p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" aria-hidden="true" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-bold text-amber-800">Avis de non-responsabilité</h3>
                            <div className="mt-2 text-sm text-amber-700">
                                <p>
                                    Cette application est un outil d'aide et d'information destiné exclusivement aux professionnels de santé. Elle ne remplace en aucun cas le jugement clinique, un avis médical professionnel, un diagnostic ou un traitement. Les informations fournies sont basées sur le guide de pratique clinique tunisien de 2022 et doivent être utilisées comme support, et non comme unique source de décision.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;