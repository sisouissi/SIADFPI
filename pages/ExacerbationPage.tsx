import React from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import AiAssistant from '../components/AiAssistant';
import InternalLink from '../components/InternalLink';
import { LightBulbIcon, ShieldExclamationIcon, ClipboardListIcon, MagnifyingGlassIcon, PillIcon, ChartBarIcon } from '../constants';

const ExacerbationPage: React.FC = () => (
  <div>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Exacerbation Aiguë de la FPI (EAFPI)</h1>
    <AiAssistant />

    <ContentSection title="Définition et Bilan Diagnostique">
        <InfoCapsule title="Définition" icon={LightBulbIcon}>
            <p>Détérioration respiratoire aiguë (survenant en moins d'un mois), cliniquement significative et inexpliquée, chez un patient avec un diagnostic de FPI préalablement établi.</p>
        </InfoCapsule>
        <InfoCapsule title="Facteurs Déclenchants à Exclure" icon={ShieldExclamationIcon}>
            <p>L'EAFPI est un diagnostic d'élimination. Il est impératif d'écarter d'autres causes d'aggravation respiratoire :</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Infection (virale ou bactérienne)</li>
                <li>Embolie pulmonaire</li>
                <li>Insuffisance cardiaque (OAP)</li>
                <li>Pneumothorax</li>
                <li>Épanchement pleural abondant</li>
            </ul>
        </InfoCapsule>
        <InfoCapsule title="Critères Diagnostiques" icon={ClipboardListIcon} className="md:col-span-2">
            <p>Le diagnostic repose sur la combinaison des critères suivants :</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Diagnostic de FPI certain ou probable préexistant.</li>
                <li>Aggravation inexpliquée de la dyspnée sur moins de 30 jours.</li>
                <li>Nouvelles anomalies radiologiques bilatérales sur la TDM-HR (opacités en verre dépoli et/ou consolidations).</li>
                <li>Absence d'argument pour une insuffisance cardiaque ou une surcharge volémique comme cause principale des anomalies.</li>
            </ul>
        </InfoCapsule>
        <InfoCapsule title="Bilan Diagnostique" icon={MagnifyingGlassIcon} className="md:col-span-2">
            <p>Le bilan en urgence vise à confirmer l'EAFPI et surtout à éliminer les diagnostics différentiels :</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Biologie :</strong> NFS, CRP, procalcitonine, D-dimères, BNP ou NT-proBNP.</li>
                <li><strong>Imagerie :</strong> TDM-HR systématique, complétée par un angioscanner si suspicion d'embolie pulmonaire.</li>
                <li><strong>Microbiologie :</strong> Prélèvements pour recherches virales et bactériennes (ECBC, PCR...).</li>
                <li><strong>Lavage Broncho-Alvéolaire (LBA) :</strong> Souvent réalisé pour écarter une infection opportuniste ou une hémorragie alvéolaire, si l'état du patient le permet.</li>
            </ul>
        </InfoCapsule>
    </ContentSection>

    <ContentSection title="Prise en Charge, Pronostic et Prévention">
        <InfoCapsule title="Principes de Traitement" icon={PillIcon}>
            <p>La prise en charge se fait en milieu hospitalier. Aucun traitement n'a formellement prouvé son efficacité, l'approche est donc pragmatique :</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Soins de support :</strong> C'est la pierre angulaire du traitement. Oxygénothérapie pour maintenir SpO2 &gt; 90%, parfois par VNI ou oxygénothérapie à haut débit.</li>
                <li><strong>Corticothérapie systémique :</strong> Généralement administrée à haute dose (ex: bolus de méthylprednisolone), bien que son bénéfice soit débattu.</li>
                <li><strong>Antibiothérapie :</strong> Souvent débutée de manière empirique et à large spectre pour couvrir une infection non documentée.</li>
            </ul>
        </InfoCapsule>
        <InfoCapsule title="Pronostic" icon={ChartBarIcon}>
            <p>Le pronostic de l'EAFPI est extrêmement sombre, marquant un tournant dans l'évolution de la maladie.</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
                <li>La mortalité hospitalière est très élevée, de l'ordre de <strong>50%</strong>.</li>
                <li>La survie médiane après un premier épisode d'exacerbation est de seulement quelques mois.</li>
            </ul>
        </InfoCapsule>
        <InfoCapsule title="Prévention" icon={ShieldExclamationIcon} className="md:col-span-2">
            <p>La prévention est un enjeu majeur pour améliorer la survie des patients. Elle repose sur :</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
                <li><strong>Vaccinations :</strong> Mise à jour systématique des vaccins contre la grippe, le pneumocoque et la COVID-19.</li>
                <li><strong>Gestion des infections :</strong> Traitement précoce et adapté de toute infection respiratoire.</li>
                <li><strong>Gestion du <InternalLink sectionId="complications" anchorId="complication-rgo">RGO</InternalLink> :</strong> Un traitement anti-reflux est souvent recommandé pour limiter le risque de micro-aspirations.</li>
                <li><strong>Éducation du patient :</strong> Reconnaissance des signes d'alerte pour une consultation rapide.</li>
            </ul>
        </InfoCapsule>
    </ContentSection>
  </div>
);

export default ExacerbationPage;