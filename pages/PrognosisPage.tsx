import React from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import AiAssistant from '../components/AiAssistant';
import PrognosisChart from '../components/PrognosisChart';
import ProgressionCalculator from '../components/ProgressionCalculator';
import Accordion from '../components/Accordion';
import InternalLink from '../components/InternalLink';
import { UserGroupIcon, ChartBarIcon, TrendingDownIcon } from '../constants';

const PrognosisPage: React.FC = () => (
  <div>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Évaluation du Pronostic</h1>
    <AiAssistant />
    <ContentSection title="Facteurs Pronostiques Initiaux">
        <InfoCapsule title="Facteurs Démographiques et Cliniques" icon={UserGroupIcon}>
            <ul className="list-disc list-inside space-y-1">
                <li>Âge avancé et sexe masculin.</li>
                <li>Intensité de la dyspnée.</li>
                <li>IMC bas (&lt; 25 kg/m²).</li>
            </ul>
        </InfoCapsule>
        <InfoCapsule title="Facteurs Fonctionnels et Radiologiques" icon={ChartBarIcon}>
            <ul className="list-disc list-inside space-y-1">
                <li>CVF basse, DLCO très basse (&lt; 40%).</li>
                <li>Désaturation au TM6 (&lt; 88%).</li>
                <li>Étendue du rayon de miel sur TDM.</li>
                <li>Présence d'<InternalLink sectionId="complications" anchorId="complication-htp">Hypertension Pulmonaire (HTP)</InternalLink>.</li>
            </ul>
        </InfoCapsule>
    </ContentSection>
    
    <div className="mb-12 mt-12 space-y-4">
        <Accordion title="Visualisation de la Progression Typique">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <TrendingDownIcon className="w-6 h-6 text-accent-blue" />
                    <h4 className="text-xl font-semibold text-slate-800">Évolution de la CVF et de la DLCO</h4>
                </div>
                <p className="text-slate-600">
                    Ce graphique illustre une trajectoire typique de déclin de la Capacité Vitale Forcée (CVF) et de la capacité de diffusion (DLCO) pour un patient atteint de FPI. Les lignes de référence indiquent les seuils de déclin relatif (10% pour la CVF, 15% pour la DLCO à partir de la ligne de base) qui définissent une progression significative de la maladie.
                </p>
                <PrognosisChart />
            </div>
        </Accordion>
        
        <Accordion title="Suivi et Évaluation de la Progression">
            <ProgressionCalculator />
        </Accordion>
    </div>
  </div>
);

export default PrognosisPage;