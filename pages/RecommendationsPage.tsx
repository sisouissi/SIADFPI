import React, { useState, useMemo } from 'react';
import Accordion from '../components/Accordion';
import InternalLink from '../components/InternalLink';

const recommendationGroups = [
  {
    groupTitle: "DIAGNOSTIC ET BILAN INITIAL",
    recommendations: [
      {
        title: "Recommandation 1",
        grade: "Avis d'experts",
        content: (
          <ul className="list-disc list-inside space-y-2">
            <li>Lorsqu'une FPI est suspectée, il est recommandé de réaliser un interrogatoire minutieux et un examen physique complet respiratoire et extra-respiratoire à la recherche de signes cliniques de fibrose ou en faveur d'un diagnostic alternatif.</li>
            <li>Lorsqu'une FPI est suspectée, il est recommandé de rechercher à l'interrogatoire, la présence d'autres cas de pneumopathie interstitielle diffuse (PID) dans la famille.</li>
          </ul>
        )
      },
      {
        title: "Recommandation 2",
        grade: "Avis d'experts",
        content: <p>Si une FPI est suspectée, il est recommandé de réaliser systématiquement un bilan biologique comportant : une numération formule sanguine (NFS), la créatininémie, les transaminases, les gamma-glutamyl-transférases, les phosphatases alcalines, la C-réactive Protéine (CRP) et la créatine phosphokinase (CPK).</p>
      },
      {
        title: "Recommandation 3",
        grade: "Avis d'experts",
        content: (
          <ul className="list-disc list-inside space-y-2">
            <li>Si une FPI est suspectée, Il est recommandé de réaliser un bilan immunologique comportant des anticorps antinucléaires, anticorps anti-peptides cycliques citrullinés et facteur rhumatoïde. Il est suggéré de réaliser le dosage des anticorps anti-cytoplasme des neutrophiles (ANCA).</li>
            <li>Selon le contexte clinique, biologique, radiologique et/ou si les anticorps antinucléaires sont positifs, d'autres examens seront demandés pour éliminer une connectivite associée : Sclérodermie systémique (anticorps anti-centromères, anti-topoismérase-1, anti-U3RNP), myopathies inflammatoires (anticorps anti-synthétases/Dot Myositis), Syndrome de Sjögren (anticorps anti-SSA, anti-RO-52) Ou une vascularite systémique (ANCA, si non faits d'emblée) Ou une PHS (recherche de précipitines orientée par la clinique).</li>
          </ul>
        )
      },
      {
        title: "Recommandation 4",
        grade: "Grade C, niveau 4",
        content: <p>Il est recommandé de retenir le diagnostic de FPI chez un patient ayant une présentation clinique évocatrice, devant un aspect tomodensitométrique de pneumopathie interstitielle commune (PIC) ou de PIC probable et après élimination des autres causes de PIC.</p>
      },
      {
        title: "Recommandation 5",
        grade: "Grade C, niveau 4",
        content: <p>Lorsqu'une FPI est suspectée chez un patient, il est suggéré de réaliser un lavage bronchoalvéolaire si l'aspect radiologique n'est pas celui d'une PIC et si le risque lié à l'examen est estimé faible.</p>
      },
      {
        title: "Recommandation 6",
        grade: "Grade C, niveau 4",
        content: <p>Lorsqu' une FPI est suspectée chez un patient, il est recommandé de rechercher des arguments en faveur d'une cause déterminée de PID, en particulier une exposition à des médicaments, à un antigène inhalé, à des particules minérales, une connectivite ou une vascularite systémique.</p>
      },
      {
        title: "Recommandation 7",
        grade: "Avis d'experts",
        content: (
          <ul className="list-disc list-inside space-y-2">
            <li>Lorsqu'une FPI est suspectée chez un patient présentant une PID, il est recommandé de rechercher à l'interrogatoire la présence d'autres cas de PID dans la famille et de rechercher chez le patient la présence d'arguments cliniques et biologiques en faveur d'une cause génétique (âge &lt; 50 ans, anomalies cutanéo-muqueuses, hématologiques ou hépatiques).</li>
            <li>Devant une FPI dans un contexte familial, il est suggéré de réaliser une consultation spécialisée en génétique.</li>
          </ul>
        )
      },
      {
        title: "Recommandation 8",
        grade: "Grade C, niveau 4",
        content: (
          <>
            <p>IL est recommandé d'envisager une biopsie pulmonaire en cas d'incertitude diagnostique de FPI, à l'issue de la discussion multidisciplinaire, particulièrement si le patient ne présente pas un aspect tomodensitométrique de PIC ou de PIC probable.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
                <li>L'indication d'une biopsie pulmonaire est prise au cours d'une discussion multidisciplinaire, en tenant compte de l'âge, des comorbidités du patient, du retentissement fonctionnel et de l'évolutivité de la maladie.</li>
                <li>La biopsie pulmonaire se fait habituellement par vidéo-thoracoscopie. La cryobiopsie, si elle disponible, peut être proposée.</li>
            </ul>
          </>
        )
      },
      {
        title: "Recommandation 9",
        grade: "Grade C, niveau 4",
        content: <p>Il est recommandé de discuter les dossiers des patients chez qui une FPI est suspectée, en discussion multidisciplinaire (DMD), afin de valider le diagnostic, indiquer d'autres explorations complémentaires et décider du traitement. Cette DMD fait intervenir, pneumologues, radiologues, anatomopathologistes, internistes et rhumatologues expérimentés dans le domaine des PID.</p>
      },
    ]
  },
  {
    groupTitle: "EVALUATION DU PRONOSTIC",
    recommendations: [
        {
            title: "Recommandation 10",
            grade: "Grade A, niveau 1",
            content: <p>Il est recommandé chez tout patient présentant une FPI, de réaliser une spirométrie avec mesure de la capacité vitale forcée (CVF) et la capacité de diffusion du monoxyde de carbone (DLCO).</p>
        },
        {
            title: "Recommandation 11",
            grade: "Grade A, niveau 1",
            content: <p>Chez un patient ayant un diagnostic confirmé de FPI et en l'absence d'un plateau technique permettant la mesure de la DLCO, il est recommandé de réaliser outre la mesure de la CVF, un test de marche de six minutes (TM6) avec monitorage de la saturation.</p>
        },
        {
            title: "Recommandation 12",
            grade: "Grade A, niveau 1",
            content: <p>Il est recommandé d'évaluer initialement le pronostic d'un patient atteint de FPI sur la sévérité de la dyspnée, l'EFR (CVF, DLCO), la saturation percutanée en oxygène en fin de TM6, l'étendue de l'aspect en rayon de miel sur le scanner thoracique de haute résolution, l'existence de signes d'hypertension pulmonaire à l'échographie doppler cardiaque et le calcul d'un score tel que le score GAP.</p>
        },
        {
            title: "Recommandation 13",
            grade: "Grade A, niveau 1",
            content: (
                <p>Au cours du suivi d'un patient atteint de FPI et en fonction de l'évolution des symptômes, de la CVF, de la DLCO et éventuellement de l'existence de signes d'hypertension pulmonaire à l'échocardiographie et de la fibrose sur le scanner thoracique :</p>
            )
        },
    ]
  },
   {
    groupTitle: "TRAITEMENT",
    recommendations: [
        {
            title: "Recommandation 14",
            grade: "Grade A, niveau 1",
            content: (
                <>
                    <p>Chez un patient présentant une FPI légère à modérée (capacité vitale forcée ≥ 50 % de la valeur théorique et capacité de diffusion du monoxyde de carbone ≥30 %), il est recommandé de proposer un traitement par nintedanib.</p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>Ce traitement doit être instauré et surveillé par un pneumologue expérimenté dans le diagnostic et le traitement de la FPI.</li>
                        <li>Le traitement par nintedanib nécessite une surveillance régulière de la tolérance clinique et de la fonction hépatique.</li>
                    </ul>
                </>
            )
        },
        {
            title: "Recommandation 15",
            grade: "Grade A, niveau 1",
            content: <p>Il est recommandé de traiter la FPI par l'antifibrosant dès que le diagnostic est établi en tenant compte, pour chaque patient, de la balance bénéfices-risques du traitement.</p>
        },
        {
            title: "Recommandation 16",
            grade: "Grade A, niveau 1",
            content: (
                 <>
                    <p>Chez un patient présentant une FPI confirmée, il est recommandé de ne pas instituer un traitement par:</p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>une corticothérapie (avec ou sans immunosuppresseur) en dehors d'une exacerbation aiguë de fibrose</li>
                        <li>une trithérapie associant prednisone-azathioprine-N-acétylcystéine</li>
                        <li>une monothérapie par N-acétylcystéine</li>
                        <li>la colchicine</li>
                        <li>la ciclosporine A</li>
                        <li>l'étanercept</li>
                        <li>le carlumab</li>
                        <li>le simtuzumab</li>
                    </ul>
                </>
            )
        },
        {
            title: "Recommandation 17",
            grade: "Grade A, niveau 1",
            content: (
                <>
                    <p>Chez un patient présentant une FPI confirmée, il est recommandé de ne pas instituer un traitement par :</p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>La warfarine ou les anti-vitamines K, en dehors d'une indication cardiovasculaire.</li>
                        <li>Il n'y a pas de données actuelles sur les anticoagulants oraux au cours de la FPI.</li>
                    </ul>
                </>
            )
        },
        { title: "Recommandation 18", grade: "Grade A, niveau 1", content: <p>Chez un patient présentant une FPI confirmée, il est recommandé de ne pas instituer un traitement par l'Interféron- Gamma- 1b.</p> },
        { title: "Recommandation 19", grade: "Grade A, niveau 1", content: <p>Chez un patient présentant une FPI confirmée, il est recommandé de ne pas instituer un traitement par le bosentan, le macitentan et l'ambrisentan.</p> },
        { title: "Recommandation 20", grade: "Avis d'experts", content: <p>Chez un patient ayant une FPI confirmée, il est recommandé de lui proposer la vaccination anti-grippale annuelle, la vaccination antipneumococcique et la vaccination contre la COVID-19.</p> },
        {
            title: "Recommandation 21",
            grade: "Grade C, niveau 4",
            content: (
                 <>
                    <p>Chez un patient suivi pour une FPI confirmée et présentant une toux chronique invalidante, il est suggéré de :</p>
                    <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>Rechercher une cause à cette toux, telle qu'une progression de la maladie, une infection respiratoire intercurrente, une prise médicamenteuse, une hyperréactivité bronchique associée</li>
                        <li>Rechercher un <InternalLink sectionId="complications" anchorId="complication-rgo">RGO</InternalLink> et le traiter</li>
                        <li>Prescrire, éventuellement, une corticothérapie orale à faible dose (ne dépassant pas 10mg/jour d'équivalent de prednisone), en évaluant le rapport bénéfice-risque.</li>
                        <li>Prescrire un traitement morphinique à faible dose (5 mg de sulfate de morphine à libération prolongée toutes les 12 heures per os), en évaluant le rapport bénéfice-risque.</li>
                    </ul>
                </>
            )
        },
        { title: "Recommandation 22", grade: "Grade C, niveau 4", content: <p>Chez un patient présentant une FPI confirmée et une dyspnée invalidante, il est suggéré de prescrire des dérivés morphiniques à faible dose, en évaluant leur efficacité et en surveillant leur tolérance (risque de dépression des centres respiratoires).</p> },
        { title: "Recommandation 23", grade: "Grade A, niveau 1", content: <p>Il est recommandé d'indiquer l'oxygénothérapie de longue durée chez les patients ayant un diagnostic confirmé de FPI et présentant une insuffisance respiratoire chronique grave, définie par une PaO2 &lt;55 mm Hg ou une PaO2 entre 56 – 60 mm Hg en présence d'au moins l'un des critères suivants : polyglobulie (Hématocrite &gt; 55 %), signes d'hypertension pulmonaire, une insuffisance cardiaque droite documentée, des désaturations nocturnes non apnéiques.</p> },
        { title: "Recommandation 24", grade: "Grade B, niveau 2", content: <p>Il est suggéré d'indiquer l'oxygénothérapie de déambulation chez les patients ayant un diagnostic confirmé de FPI et présentant une dyspnée d'effort importante, un handicap significatif et une désaturation à l'effort.</p> },
        {
            title: "Recommandation 25",
            grade: "Grade A, niveau 1",
            content: (
                 <>
                    <p>Il est recommandé de prescrire un programme de réhabilitation respiratoire chez les patients ayant un diagnostic confirmé de FPI et présentant une limitation des capacités à l'exercice.</p>
                    <p className="mt-2">- Il est suggéré d'initier le programme de réhabilitation respiratoire dans un centre dédié et avec un encadrement assuré par une équipe spécialisée.</p>
                 </>
            )
        },
        { title: "Recommandation 26", grade: "Grade C, niveau 4", content: <p>Il est recommandé d'adresser les patients ayant un diagnostic confirmé de FPI, à un centre de pneumologie de troisième ligne, en vue d'une évaluation précoce de l'indication d'une transplantation pulmonaire, sauf contre-indication à ce traitement.</p> },
        { title: "Recommandation 27", grade: "Grade C, niveau 4", content: <p>Il est suggéré d'inscrire sur la liste d'attente de transplantation pulmonaire les patients porteurs d'une FPI confirmée et atteints d'une forme grave avec un cœur pulmonaire chronique ou un déclin important de la fonction respiratoire lors du suivi.</p> },
    ]
  },
  {
    groupTitle: "EXACERBATION AIGUE",
    recommendations: [
        { title: "Recommandation 28", grade: "Grade A, niveau 1", content: <p>Chez un patient ayant un diagnostic confirmé de FPI, il est recommandé de retenir le diagnostic d'exacerbation aiguë de sa maladie, en cas d'aggravation récente de la dyspnée depuis moins d'un mois, non liée à une cause extra-parenchymateuse (exemple : pneumothorax, pleurésie, embolie pulmonaire), associée à de nouvelles opacités en verre dépoli et/ou alvéolaires à l'imagerie, non totalement expliquée par une insuffisance cardiaque ou une surcharge hydrosodée. Un facteur déclenchant doit être recherché (infection, procédure diagnostique, cause médicamenteuse, inhalation).</p> },
        { title: "Recommandation 29", grade: "Grade C, niveau 4", content: <p>Il est suggéré d'utiliser les corticoïdes à posologie élevée pour traiter les exacerbations aiguës de la FPI. Cette corticothérapie peut être associée à une antibiothérapie empirique à large spectre.</p> },
        { title: "Recommandation 30", grade: "Grade A, niveau 1", content: <p>Il est recommandé de ne pas utiliser les immunosupresseurs (cyclophosphamide) pour traiter les exacerbations aiguës de la FPI.</p> },
        { title: "Recommandation 31", grade: "Grade B, niveau 2", content: <p>Il est suggéré d'entreprendre des mesures de réanimation chez un patient en exacerbation aiguë de FPI lorsqu'il existe un projet de transplantation pulmonaire, lorsqu'une cause réversible d'aggravation a été identifiée ou si la recherche étiologique n'a pas été effectuée. Dans tous les cas l'appréciation du clinicien est essentielle devant chaque situation.</p> },
    ]
  },
  {
    groupTitle: "AUTRES COMPLICATIONS ET COMORBIDITES",
    subGroups: [
        {
            subGroupTitle: "1. Hypertension pulmonaire",
            recommendations: [
                { title: "Recommandation 32", grade: "Grade B, niveau 2", content: <p>Chez un patient présentant une FPI confirmée, il est suggéré de réaliser une échographie cardiaque à la recherche d'une <InternalLink sectionId="complications" anchorId="complication-htp">hypertension pulmonaire</InternalLink> et de comorbidités cardiaques lors du diagnostic et un angioscanner thoracique en cas d'aggravation clinique ou de diminution de la capacité de diffusion du monoxyde de carbone non expliquée par l'évolution de la FPI.</p> },
                { title: "Recommandation 33", grade: "Grade B, niveau 2", content: <p>Il est suggéré de réaliser un cathétérisme cardiaque droit pour diagnostiquer une <InternalLink sectionId="complications" anchorId="complication-htp">hypertension pulmonaire</InternalLink> chez les patients ayant un diagnostic confirmé de FPI en cas de doute sur un autre diagnostic (hypertension artérielle pulmonaire du groupe 1, hypertension pulmonaire thromboembolique chronique, cardiopathie gauche à fonction systolique conservée).</p> },
                { title: "Recommandation 34", grade: "Grade A, niveau 1", content: <p>Chez les patients atteints de FPI confirmée et présentant une <InternalLink sectionId="complications" anchorId="complication-htp">hypertension pulmonaire</InternalLink>, il est recommandé de rechercher et de corriger une hypoxémie de repos, une maladie veineuse thrombo-embolique et une insuffisance cardiaque gauche.</p> },
                { title: "Recommandation 35", grade: "Grade A, niveau 1", content: <p>Chez les patients atteints de FPI confirmée et présentant une <InternalLink sectionId="complications" anchorId="complication-htp">hypertension pulmonaire</InternalLink> précapillaire, il est recommandé de ne pas prescrire un traitement spécifique de l'hypertension artérielle pulmonaire.</p> },
            ]
        },
        {
            subGroupTitle: "2. Emphysème pulmonaire",
            recommendations: [
                { title: "Recommandation 36", grade: "Grade A, niveau 1", content: <p>Il est recommandé de rechercher des signes d'<InternalLink sectionId="complications" anchorId="complication-emphyseme">emphysème</InternalLink> sur le scanner thoracique pratiqué pour le diagnostic de FPI, pour ne pas sous-estimer la sévérité du syndrome emphysème—fibrose pulmonaire lorsque les volumes sont préservés.</p> },
                { title: "Recommandation 37", grade: "Grade B, niveau 2", content: <p>Il est suggéré de surveiller plus particulièrement le risque d'<InternalLink sectionId="complications" anchorId="complication-htp">hypertension pulmonaire</InternalLink> sévère lorsqu'il existe un syndrome <InternalLink sectionId="complications" anchorId="complication-emphyseme">emphysème</InternalLink>—fibrose.</p> },
                { title: "Recommandation 38", grade: "Grade C, niveau 4", content: <p>Chez un patient présentant un diagnostic confirmé de FPI, lorsqu'existe un <InternalLink sectionId="complications" anchorId="complication-emphyseme">emphysème</InternalLink>, il est suggéré de le prendre en charge selon les pratiques habituelles, cela inclut la prescription de traitements inhalés (bronchodilatateurs) si indiqués et la prise en charge des exacerbations.</p> },
                { title: "Recommandation 39", grade: "Grade B, niveau 2", content: <p>Il est suggéré de ne pas prendre en compte la présence de l'<InternalLink sectionId="complications" anchorId="complication-emphyseme">emphysème</InternalLink> dans les choix des thérapeutiques antifibrosantes chez les patients ayant un diagnostic confirmé de FPI.</p> },
            ]
        },
        {
            subGroupTitle: "3. Syndrome d'apnées hypopnées obstructives du sommeil",
            recommendations: [
                { title: "Recommandation 40", grade: "Grade B, niveau 2", content: <p>Chez les patients ayant un diagnostic confirmé de FPI, Il est recommandé de pratiquer une polygraphie ventilatoire ou une polysomnographie pour rechercher un <InternalLink sectionId="complications" anchorId="complication-saos">syndrome d'apnées hypopnées obstructives du sommeil</InternalLink> s'il existe des signes cliniques évocateurs de ce syndrome.</p> },
                { title: "Recommandation 41", grade: "Grade B, niveau 2", content: <p>Lorsqu'il est présent, chez un patient ayant un diagnostic confirmé de FPI, il est suggéré de traiter le <InternalLink sectionId="complications" anchorId="complication-saos">syndrome d'apnées hypopnées obstructives du sommeil</InternalLink> selon les recommandations en vigueur en dehors de la FPI.</p> },
            ]
        },
        {
            subGroupTitle: "4. Cancer broncho-pulmonaire",
            recommendations: [
                { title: "Recommandation 42", grade: "Grade B, niveau 2", content: <p>Chez les patients ayant un diagnostic confirmé de FPI, il est suggéré d'informer le médecin en charge du suivi de la fréquence du <InternalLink sectionId="complications" anchorId="complication-cancer">cancer bronchopulmonaire</InternalLink> sur ce terrain.</p> },
                { title: "Recommandation 43", grade: "Grade A, niveau 1", content: <p>Chez les patients ayant un diagnostic confirmé de FPI, il est recommandé de conseiller au patient d'arrêter le tabac s'il est fumeur et de l'informer sur les moyens d'aide au sevrage tabagique.</p> },
                { title: "Recommandation 44", grade: "Grade A, niveau 1", content: <p>Chez les patients ayant un diagnostic confirmé de FPI et présentant un <InternalLink sectionId="complications" anchorId="complication-cancer">cancer bronchopulmonaire</InternalLink>, il est recommandé de prendre en compte la FPI dans les choix thérapeutiques.</p> },
            ]
        },
        {
            subGroupTitle: "5. Reflux gastro-œsophagien",
            recommendations: [
                 {
                    title: "Recommandation 45",
                    grade: "Grade B, niveau 2",
                    content: (
                        <>
                            <p>Il est recommandé de rechercher à l'interrogatoire un antécédent ou des symptômes de <InternalLink sectionId="complications" anchorId="complication-rgo">reflux gastro-œsophagien</InternalLink> chez les patients ayant un diagnostic confirmé de FPI.</p>
                            <p className="mt-2">Lorsqu'existe une suspicion de <InternalLink sectionId="complications" anchorId="complication-rgo">reflux gastro-œsophagien</InternalLink>, il est suggéré de l'explorer et de le traiter selon les recommandations en vigueur en dehors de la FPI.</p>
                        </>
                    )
                },
            ]
        },
        {
            subGroupTitle: "6. Autres comorbidités",
            recommendations: [
                { title: "Recommandation 46", grade: "Grade B, niveau 2", content: <p>Il est suggéré de rechercher des comorbidités (pathologies cardiovasculaires, maladie veineuse thromboembolique, diabète, dépression) chez les patients ayant un diagnostic confirmé de FPI et d'organiser leur prise en charge en partenariat avec le médecin traitant et de tenir compte du risque d'interactions médicamenteuses avec le traitement anti-fibrosant.</p> },
            ]
        },
    ]
  }
];

const ALL_GRADES = ["Grade A, niveau 1", "Grade B, niveau 2", "Grade C, niveau 4", "Avis d'experts"];
const ALL_SECTIONS = [...new Set(recommendationGroups.map(g => g.groupTitle.split('(')[0].trim()))];


const RecommendationsPage: React.FC = () => {
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    const handleGradeChange = (grade: string) => {
        setSelectedGrades(prev =>
            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
        );
    };

    const handleSectionChange = (section: string) => {
        setSelectedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const resetFilters = () => {
        setSelectedGrades([]);
        setSelectedSections([]);
    };

    const filteredGroups = useMemo(() => {
        if (selectedGrades.length === 0 && selectedSections.length === 0) {
            return recommendationGroups;
        }

        return recommendationGroups
            .filter(group => selectedSections.length === 0 || selectedSections.includes(group.groupTitle))
            .map(group => {
                const newGroup = { ...group };
                
                if (newGroup.recommendations) {
                    newGroup.recommendations = newGroup.recommendations.filter(rec =>
                        selectedGrades.length === 0 || selectedGrades.includes(rec.grade)
                    );
                }

                if (newGroup.subGroups) {
                    newGroup.subGroups = newGroup.subGroups
                        .map(subGroup => ({
                            ...subGroup,
                            recommendations: subGroup.recommendations.filter(rec =>
                                selectedGrades.length === 0 || selectedGrades.includes(rec.grade)
                            ),
                        }))
                        .filter(subGroup => subGroup.recommendations.length > 0);
                }
                
                return newGroup;
            })
            .filter(group => (group.recommendations?.length || 0) > 0 || (group.subGroups?.length || 0) > 0);

    }, [selectedGrades, selectedSections]);

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Synthèse des Recommandations du Guide</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h3 className="text-xl font-bold text-slate-800 mb-4 md:mb-0">Filtrer les Recommandations</h3>
            <button
                onClick={resetFilters}
                className="text-sm font-semibold text-accent-blue hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
                disabled={selectedGrades.length === 0 && selectedSections.length === 0}
            >
                Réinitialiser les filtres
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <p className="font-semibold text-slate-700 mb-2">Par Grade :</p>
                <div className="flex flex-wrap gap-2">
                    {ALL_GRADES.map(grade => (
                        <button
                            key={grade}
                            onClick={() => handleGradeChange(grade)}
                            className={`px-3 py-1 text-xs font-bold rounded-full border-2 transition-colors ${
                                selectedGrades.includes(grade)
                                ? 'bg-accent-blue border-accent-blue text-white'
                                : 'bg-white border-slate-300 text-slate-600 hover:border-accent-blue'
                            }`}
                        >
                            {grade}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <p className="font-semibold text-slate-700 mb-2">Par Section :</p>
                <div className="flex flex-wrap gap-2">
                    {ALL_SECTIONS.map(section => (
                        <button
                            key={section}
                            onClick={() => handleSectionChange(section)}
                            className={`px-3 py-1 text-xs font-bold rounded-full border-2 transition-colors capitalize ${
                                selectedSections.includes(section)
                                ? 'bg-accent-blue border-accent-blue text-white'
                                : 'bg-white border-slate-300 text-slate-600 hover:border-accent-blue'
                            }`}
                        >
                            {section.toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {filteredGroups.length > 0 ? (
          <div className="space-y-2">
            {filteredGroups.map((group) => (
              <Accordion key={group.groupTitle} title={group.groupTitle}>
                <div className="space-y-4 pt-4 pl-4">
                  {group.recommendations?.map((rec) => (
                    <Accordion 
                        key={rec.title} 
                        title={rec.title} 
                        grade={rec.grade}
                        titleClassName="font-poppins font-semibold text-xl"
                    >
                        {rec.content}
                    </Accordion>
                  ))}

                  {group.subGroups?.map((subGroup) => (
                      <div key={subGroup.subGroupTitle} className="mt-6">
                          <h3 className="text-2xl font-semibold text-accent-blue mb-4">{subGroup.subGroupTitle}</h3>
                          <div className="space-y-4">
                              {subGroup.recommendations.map((rec) => (
                                  <Accordion 
                                    key={rec.title} 
                                    title={rec.title} 
                                    grade={rec.grade}
                                    titleClassName="font-poppins font-semibold text-xl"
                                  >
                                      {rec.content}
                                  </Accordion>
                              ))}
                          </div>
                      </div>
                  ))}
                </div>
              </Accordion>
            ))}
          </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-700">Aucune recommandation ne correspond à vos filtres</h3>
            <p className="mt-2 text-slate-500">Essayez de modifier ou de réinitialiser vos filtres pour voir plus de résultats.</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;