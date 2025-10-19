import React from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import GeminiSummarizer from '../components/GeminiSummarizer';
import InternalLink from '../components/InternalLink';
import { GlobeAltIcon, ChartBarIcon, ExclamationTriangleIcon, UserGroupIcon } from '../constants';

const EpidemiologyPage: React.FC = () => (
  <div>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Épidémiologie</h1>
    <GeminiSummarizer />
    <ContentSection title="Incidence, Prévalence et Facteurs de Risque">
        <InfoCapsule title="Incidence et Prévalence" icon={GlobeAltIcon}>
            <p><strong>Incidence :</strong> 0,2 à 93,7 cas / 100 000 habitants par an, en augmentation mondiale.</p>
            <p><strong>Prévalence :</strong> 0,33 à 4,51 cas / 10 000 habitants.</p>
        </InfoCapsule>
        <InfoCapsule title="Mortalité" icon={ChartBarIcon}>
            <p>La survie médiane est estimée à <strong>3,8 ans</strong> chez les adultes de 65 ans et plus aux États-Unis. La mortalité varie selon les pays.</p>
        </InfoCapsule>
        <InfoCapsule title="Facteurs de Risque Non Génétiques" icon={ExclamationTriangleIcon}>
             <ul className="list-disc list-inside space-y-1">
                <li>Âge avancé</li>
                <li>Sexe masculin</li>
                <li>Tabagisme (actif ou sevré)</li>
                <li><InternalLink sectionId="complications" anchorId="complication-rgo">Reflux gastro-œsophagien (RGO)</InternalLink></li>
            </ul>
        </InfoCapsule>
        <InfoCapsule title="Facteurs de Risque Génétiques" icon={UserGroupIcon}>
            <p><strong>5 à 10%</strong> des cas sont familiaux (transmission autosomique dominante).</p>
             <ul className="list-disc list-inside space-y-1">
                <li>Mutations des gènes des télomères (TERT, TERC...).</li>
                <li>Polymorphisme du gène <strong>MUC5B</strong> (facteur de risque majeur).</li>
            </ul>
        </InfoCapsule>
    </ContentSection>
  </div>
);

export default EpidemiologyPage;