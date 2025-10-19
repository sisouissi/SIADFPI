import React from 'react';
import Accordion from '../components/Accordion';

const referencesByCategory = [
    {
        category: "Généralités, Épidémiologie et Diagnostic",
        references: [
            {
                id: 1,
                citation: "Société Tunisienne des Maladies Respiratoires et d’Allergologie (STMRA). Guide de Pratique Clinique Tunisien : Diagnostic et prise en charge de la Fibrose Pulmonaire Idiopathique. Tunis; 2022.",
                note: "Document source principal de cette monographie interactive."
            },
            {
                id: 2,
                citation: "Raghu G, Remy-Jardin M, Myers JL, et al. Diagnosis of Idiopathic Pulmonary Fibrosis. An Official ATS/ERS/JRS/ALAT Clinical Practice Guideline. Am J Respir Crit Care Med. 2018;198(5):e44-e68.",
                note: "Guideline international de référence pour les critères diagnostiques."
            },
             {
                id: 16,
                citation: "Cottin V, Crestani B, Cadranel J, et al. Recommandations de la Société de pneumologie de langue française sur la fibrose pulmonaire idiopathique (actualisation 2017). Rev Mal Respir. 2017;34(9):900-968.",
                note: "Recommandations pratiques de la SPLF, une référence clé pour la pratique francophone."
            },
            {
                id: 3,
                citation: "Raghu G, Collard HR, Egan JJ, et al. An official ATS/ERS/JRS/ALAT statement: idiopathic pulmonary fibrosis: evidence-based guidelines for diagnosis and management. Am J Respir Crit Care Med. 2011;183(6):788-824.",
                note: "Guideline fondateur de 2011 pour le diagnostic et la prise en charge."
            },
            {
                id: 4,
                citation: "Seibold MA, Wise AL, Speer MC, et al. A common MUC5B promoter polymorphism and pulmonary fibrosis. N Engl J Med. 2011;364(16):1503-1512.",
                note: "Étude clé identifiant le polymorphisme du gène MUC5B comme principal facteur de risque génétique."
            },
        ]
    },
    {
        category: "Pronostic et Suivi",
        references: [
            {
                id: 5,
                citation: "Ley B, Ryerson CJ, Vittinghoff E, et al. A multidimensional index and staging system for idiopathic pulmonary fibrosis. Ann Intern Med. 2012;156(10):684-691.",
                note: "Publication originale du score pronostique GAP (Gender, Age, Physiology)."
            },
            {
                id: 6,
                citation: "du Bois RM, Weycker D, Albera C, et al. Ascertainment of individual risk of mortality for patients with idiopathic pulmonary fibrosis. Am J Respir Crit Care Med. 2011;184(4):459-466.",
                note: "Analyse des facteurs de risque de mortalité, incluant le déclin de la CVF."
            },
        ]
    },
    {
        category: "Traitement Pharmacologique",
        references: [
            {
                id: 7,
                citation: "Richeldi L, du Bois RM, Raghu G, et al. Efficacy and safety of nintedanib in idiopathic pulmonary fibrosis. N Engl J Med. 2014;370(22):2071-2082.",
                note: "Étude pivot (INPULSIS) démontrant l'efficacité du nintedanib."
            },
            {
                id: 8,
                citation: "King TE Jr, Bradford WZ, Castro-Bernardini S, et al. A phase 3 trial of pirfenidone in patients with idiopathic pulmonary fibrosis. N Engl J Med. 2014;370(22):2083-2092.",
                note: "Étude pivot (ASCEND) démontrant l'efficacité de la pirfénidone."
            },
            {
                id: 9,
                citation: "Idiopathic Pulmonary Fibrosis Clinical Research Network, Raghu G, Anstrom KJ, et al. Prednisone, azathioprine, and N-acetylcysteine for pulmonary fibrosis. N Engl J Med. 2012;366(21):1968-1977.",
                note: "Étude PANTHER-IPF montrant la nocivité de la trithérapie, conduisant à sa contre-indication."
            },
        ]
    },
    {
        category: "Traitement Non-Pharmacologique et Prise en Charge Globale",
        references: [
             {
                id: 10,
                citation: "Dowman L, Hill CJ, May A, Holland AE. Pulmonary rehabilitation for interstitial lung disease. Cochrane Database Syst Rev. 2021;2(2):CD006322.",
                note: "Revue Cochrane confirmant les bénéfices de la réhabilitation respiratoire."
            },
            {
                id: 11,
                citation: "Crockett AJ, Cranston JM, Antic N. Domiciliary oxygen for interstitial lung disease. Cochrane Database Syst Rev. 2011;(2):CD006354.",
                note: "Revue Cochrane sur l'oxygénothérapie à domicile."
            },
            {
                id: 12,
                citation: "Weill D, Benden C, Corris PA, et al. A consensus document for the selection of lung transplant candidates: 2014--an update from the Pulmonary Transplantation Council of the International Society for Heart and Lung Transplantation. J Heart Lung Transplant. 2015;34(1):1-15.",
                note: "Consensus sur les critères de sélection pour la transplantation pulmonaire."
            },
        ]
    },
    {
        category: "Exacerbation Aiguë et Comorbidités",
        references: [
            {
                id: 13,
                citation: "Collard HR, Ryerson CJ, Corte TJ, et al. Acute Exacerbation of Idiopathic Pulmonary Fibrosis. An Official ATS/ERS/JRS/ALAT Clinical Practice Guideline. Am J Respir Crit Care Med. 2016;194(3):265-275.",
                note: "Guideline international sur la définition et la gestion des exacerbations aiguës."
            },
            {
                id: 14,
                citation: "Raghu G, Freudenberger TD, Yang S, et al. High prevalence of abnormal acid gastro-oesophageal reflux in idiopathic pulmonary fibrosis. Eur Respir J. 2006;27(1):136-142.",
                note: "Étude soulignant la forte prévalence du RGO dans la FPI."
            },
            {
                id: 15,
                citation: "Lee JS, Ryu JH, Elicker BM, et al. Combined pulmonary fibrosis and emphysema: a distinct clinical entity. Chest. 2009;135(5):1377-1385.",
                note: "Description du syndrome combiné fibrose-emphysème (CPFE)."
            },
        ]
    }
];


const ReferenceItem: React.FC<{ citation: string; note: string; }> = ({ citation, note }) => (
    <div className="p-4 bg-slate-50 border-l-4 border-slate-300">
        <p className="text-slate-700 leading-relaxed">{citation}</p>
        <p className="text-xs text-accent-blue mt-2 italic">{note}</p>
    </div>
);


const ReferencesPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Références Bibliographiques</h1>
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-slate-900 border-b-2 border-slate-300 pb-3 mb-8">Principales Sources Utilisées</h2>
        <div className="space-y-4">
          {referencesByCategory.map((categoryData) => (
            <Accordion key={categoryData.category} title={categoryData.category}>
                <div className="space-y-4">
                    {categoryData.references.map((ref) => (
                        <ReferenceItem key={ref.id} citation={ref.citation} note={ref.note} />
                    ))}
                </div>
            </Accordion>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReferencesPage;