import React from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import GeminiSummarizer from '../components/GeminiSummarizer';
import InternalLink from '../components/InternalLink';
import { PillIcon, HeartIcon, BeakerIcon } from '../constants';

const TreatmentPage: React.FC = () => (
  <div>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Traitement de la FPI</h1>
    <GeminiSummarizer />
    
    <ContentSection title="Traitements Pharmacologiques de Fond">
      <InfoCapsule title="Nintedanib (Ofev®)" icon={PillIcon}>
        <h4 className="font-semibold text-slate-700">Mécanisme d'action</h4>
        <p>Inhibiteur de tyrosine kinases qui cible de multiples récepteurs impliqués dans la fibrose.</p>
        <h4 className="font-semibold text-slate-700 mt-3">Posologie</h4>
        <p>150 mg, deux fois par jour.</p>
        <h4 className="font-semibold text-slate-700 mt-3">Principaux effets secondaires et gestion</h4>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li><strong>Diarrhée :</strong> Très fréquente. À gérer avec un traitement symptomatique (lopéramide), une hydratation et une adaptation/interruption de dose si nécessaire.</li>
          <li><strong>Nausées/Vomissements :</strong> Peuvent survenir.</li>
          <li><strong>Élévation des transaminases :</strong> Nécessite une surveillance régulière de la fonction hépatique (mensuelle les 3 premiers mois, puis trimestrielle).</li>
        </ul>
      </InfoCapsule>

      <InfoCapsule title="Pirfénidone (Esbriet®)" icon={PillIcon}>
         <h4 className="font-semibold text-slate-700">Mécanisme d'action</h4>
        <p>Molécule aux propriétés antifibrotiques, anti-inflammatoires et antioxydantes.</p>
        <h4 className="font-semibold text-slate-700 mt-3">Posologie</h4>
        <p>Augmentation progressive sur 2 semaines jusqu'à la dose cible de 801 mg (3 gélules), trois fois par jour, à prendre impérativement au cours des repas pour améliorer la tolérance digestive.</p>
        <h4 className="font-semibold text-slate-700 mt-3">Principaux effets secondaires et gestion</h4>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li><strong>Photosensibilité :</strong> Très fréquente. Impose une photoprotection rigoureuse (crème solaire à indice élevé, vêtements couvrants).</li>
          <li><strong>Troubles digestifs :</strong> Anorexie, nausées. La prise pendant les repas est essentielle.</li>
          <li><strong>Fatigue.</strong></li>
        </ul>
      </InfoCapsule>
    </ContentSection>

    <ContentSection title="Traitements Non Pharmacologiques">
      <InfoCapsule title="Oxygénothérapie" icon={HeartIcon}>
        <p>L'objectif est de corriger l'hypoxémie pour maintenir une saturation en oxygène (SpO2) ≥ 90%.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>De longue durée :</strong> Indiquée si PaO2 au repos ≤ 55 mmHg.</li>
            <li><strong>De déambulation :</strong> Pour les patients qui désaturent à l'effort, afin de leur permettre de maintenir une activité physique.</li>
        </ul>
      </InfoCapsule>
      <InfoCapsule title="Réhabilitation Respiratoire" icon={HeartIcon}>
        <p>Programme multidisciplinaire essentiel pour tous les patients, visant à :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Améliorer la tolérance à l'effort.</li>
            <li>Réduire la sensation de dyspnée.</li>
            <li>Améliorer la qualité de vie et l'anxiété.</li>
            <li>Éduquer le patient sur sa maladie.</li>
        </ul>
      </InfoCapsule>
       <InfoCapsule title="Transplantation Pulmonaire" icon={HeartIcon} className="md:col-span-2">
        <p>C'est le seul traitement potentiellement curatif de la FPI. En raison de la progression imprévisible de la maladie et des délais d'attente, une orientation précoce vers un centre de transplantation est cruciale.</p>
         <h4 className="font-semibold text-slate-700 mt-3">Critères d'orientation précoce suggérés :</h4>
        <ul className="list-disc list-inside space-y-1 mt-1">
            <li>DLCO &lt; 40% de la valeur prédite.</li>
            <li>Déclin prouvé de la CVF de ≥ 10% ou de la DLCO de ≥ 15% sur 6 mois.</li>
            <li>Désaturation en oxygène &lt; 88% au test de marche de 6 minutes.</li>
            <li>Signes d'<InternalLink sectionId="complications" anchorId="complication-htp">hypertension pulmonaire</InternalLink> sur l'échocardiographie.</li>
        </ul>
      </InfoCapsule>
    </ContentSection>
    
    <ContentSection title="Prise en Charge Symptomatique et de Support">
       <InfoCapsule title="Gestion des Symptômes" icon={BeakerIcon}>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Toux chronique :</strong> Souvent réfractaire. Des traitements comme les corticoïdes inhalés ou des opiacés à faible dose peuvent être essayés.</li>
            <li><strong>Dyspnée :</strong> La réhabilitation et l'oxygénothérapie sont les piliers. En phase palliative, les morphiniques à faible dose sont efficaces.</li>
        </ul>
      </InfoCapsule>
       <InfoCapsule title="Prévention et Soins de Support" icon={BeakerIcon}>
        <ul className="list-disc list-inside space-y-2">
             <li><strong>Vaccinations :</strong> La mise à jour des vaccins (grippe, pneumocoque, COVID-19) est impérative pour prévenir les exacerbations.</li>
             <li><strong>Soins palliatifs :</strong> Une introduction précoce est recommandée pour anticiper les besoins, gérer les symptômes et améliorer la qualité de fin de vie.</li>
        </ul>
      </InfoCapsule>
    </ContentSection>
  </div>
);

export default TreatmentPage;