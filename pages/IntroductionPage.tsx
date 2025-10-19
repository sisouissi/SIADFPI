import React from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import AiAssistant from '../components/AiAssistant';
import { BookOpenIcon, MicroscopeIcon, UserGroupIcon, LightBulbIcon, LinkIcon } from '../constants';

const IntroductionPage: React.FC = () => (
  <div>
    <h1 className="text-4xl font-bold text-slate-900 mb-8">Introduction et Objectif du Guide</h1>
    <AiAssistant />
    <ContentSection title="Présentation Générale de la FPI">
      <InfoCapsule title="Définition" icon={BookOpenIcon}>
        <p>La Fibrose Pulmonaire Idiopathique (FPI) est la forme la plus fréquente et la plus sévère des pneumopathies interstitielles idiopathiques. C'est une maladie chronique, progressive et irréversible.</p>
      </InfoCapsule>
      <InfoCapsule title="Étiopathogénie" icon={MicroscopeIcon}>
        <p>Son origine est complexe, impliquant une cicatrisation anormale du tissu pulmonaire due à un excès de fibroblastes et de dépôts de matrice extracellulaire.</p>
      </InfoCapsule>
       <InfoCapsule title="Profil Typique du Patient" icon={UserGroupIcon}>
        <p>La FPI survient généralement après 60 ans et touche majoritairement les hommes.</p>
      </InfoCapsule>
      <InfoCapsule title="Diagnostic" icon={LightBulbIcon}>
        <p>Le diagnostic est multidisciplinaire, basé sur la clinique, le scanner thoracique (TDM-HR) et parfois la biopsie pulmonaire, cherchant un aspect de Pneumopathie Interstitielle Commune (PIC).</p>
      </InfoCapsule>
      <InfoCapsule title="Source du Guide" icon={LinkIcon} className="md:col-span-2">
        <p>Ce guide interactif est une synthèse basée sur le <strong>Guide de Pratique Clinique Tunisien pour la FPI</strong> publié en 2022 par la Société Tunisienne des Maladies Respiratoires et d’Allergologie (STMRA).</p>
        <a href="https://drive.google.com/file/d/18vg6wrHt8w17SCyifBEV9JPrTl17KQ5m/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-accent-blue font-semibold hover:underline">
          Consulter le document original (PDF)
        </a>
      </InfoCapsule>
    </ContentSection>
  </div>
);

export default IntroductionPage;