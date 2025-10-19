import React, { useMemo } from 'react';

const abbreviations = [
  { term: 'AGREE II', definition: 'Appraisal of Guidelines Research and Evaluation' },
  { term: 'CPT', definition: 'Capacité Pulmonaire Totale' },
  { term: 'CRP', definition: 'Protéine C-Réactive' },
  { term: 'CVF', definition: 'Capacité Vitale Forcée' },
  { term: 'DLCO/TCO', definition: 'Coefficient de diffusion du monoxyde de carbone' },
  { term: 'EFR', definition: 'Explorations Fonctionnelles Respiratoires' },
  { term: 'FPI', definition: 'Fibrose Pulmonaire Idiopathique' },
  { term: 'GAP', definition: 'Gender - Age – Physiology (score pronostique)' },
  { term: 'GPC', definition: 'Guide de Pratique Clinique' },
  { term: 'HTP', definition: 'Hypertension Pulmonaire' },
  { term: 'INEAS', definition: 'L’Instance Nationale de l’Evaluation et de l’Accréditation en Santé' },
  { term: 'NFS', definition: 'Numération Formule Sanguine' },
  { term: 'PaO2', definition: 'Pression artérielle en oxygène' },
  { term: 'PaCO2', definition: 'Pression artérielle en dioxyde de carbone' },
  { term: 'PIC', definition: 'Pneumopathie Interstitielle Commune' },
  { term: 'PID', definition: 'Pneumopathies Infiltrantes Diffuses' },
  { term: 'PINS', definition: 'Pneumopathie Interstitielle Non Spécifique' },
  { term: 'SAHOS', definition: 'Syndrome des Apnées Hypopnées Obstructives du sommeil' },
  { term: 'STMRA', definition: 'Société Tunisienne des Maladies Respiratoires et d’Allergologie' },
  { term: 'TM6', definition: 'Test de marche de six minutes' },
  { term: 'VEMS1', definition: 'Volume expiratoire maximum à la première seconde' },
  { term: 'RGO', definition: 'Reflux gastro-oesophagien' },
  { term: 'UIP', definition: 'Usual Interstitial Pneumonia (Pneumopathie Interstitielle Commune)' },
];

const AbbreviationsPage: React.FC = () => {
  const sortedAbbreviations = useMemo(() => 
    [...abbreviations].sort((a, b) => a.term.localeCompare(b.term)),
    []
  );

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Liste des Abréviations et Acronymes</h1>
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 border-b-2 border-slate-300 pb-3 mb-8">Définitions</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAbbreviations.map(({ term, definition }) => (
            <div key={term} className="p-4 bg-white border border-slate-200 rounded-lg shadow">
              <dt className="font-bold text-slate-800 truncate">{term}</dt>
              <dd className="text-slate-600 mt-1">{definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export default AbbreviationsPage;