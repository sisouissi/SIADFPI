import React, { useState } from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import GeminiSummarizer from '../components/GeminiSummarizer';
import { HeartIcon, ExclamationTriangleIcon } from '../constants';
import Modal from '../components/Modal';

// Define the content for the modals
const comorbidityDetails = {
  htp: {
    title: "Détails sur l'Hypertension Pulmonaire (HTP)",
    content: (
      <>
        <p className="font-semibold">Prévalence :</p>
        <p>L'HTP complique l'évolution de la FPI dans 30 à 50% des cas aux stades légers à modérés, et jusqu'à 85% aux stades avancés. C'est un facteur de pronostic péjoratif majeur.</p>
        <p className="font-semibold mt-3">Mécanismes :</p>
        <p>Elle est principalement due à la destruction du lit capillaire pulmonaire par la fibrose et à la vasoconstriction hypoxique chronique.</p>
        <p className="font-semibold mt-3">Diagnostic :</p>
        <p>Elle est suspectée devant une dyspnée disproportionnée par rapport au syndrome restrictif, ou des signes d'insuffisance cardiaque droite. L'échocardiographie est l'examen de dépistage, mais la confirmation diagnostique repose sur le cathétérisme cardiaque droit.</p>
        <p className="font-semibold mt-3">Prise en charge :</p>
        <p>Le traitement est principalement supportif, centré sur l'oxygénothérapie pour corriger l'hypoxémie. Les traitements spécifiques de l'HTAP (groupe 1) ne sont généralement pas recommandés dans ce contexte (HTP du groupe 3).</p>
      </>
    )
  },
  emphyseme: {
    title: "Détails sur le Syndrome Combiné Fibrose-Emphysème (CPFE)",
    content: (
      <>
        <p className="font-semibold">Définition :</p>
        <p>Le CPFE est une entité distincte associant un emphysème, typiquement des lobes supérieurs, à une fibrose pulmonaire des lobes inférieurs.</p>
        <p className="font-semibold mt-3">Caractéristiques Fonctionnelles :</p>
        <p>Les volumes pulmonaires (CVF, CPT) sont souvent "pseudo-normalisés" car les effets restrictifs de la fibrose sont contrebalancés par l'hyperinflation de l'emphysème. En revanche, la DLCO est très sévèrement et précocement altérée, reflétant la destruction du lit capillaire par les deux pathologies.</p>
        <p className="font-semibold mt-3">Impact Clinique :</p>
        <p>Les patients atteints de CPFE ont un risque très élevé de développer une hypertension pulmonaire sévère, qui est le principal facteur pronostique de la maladie.</p>
      </>
    )
  },
  saos: {
    title: "Détails sur le Syndrome d'Apnées du Sommeil (SAOS)",
    content: (
      <>
        <p className="font-semibold">Prévalence :</p>
        <p>La prévalence du SAOS est extrêmement élevée chez les patients FPI, pouvant atteindre plus de 88% dans certaines études. Ce dépistage doit être systématique.</p>
        <p className="font-semibold mt-3">Impact :</p>
        <p>L'hypoxémie intermittente nocturne liée au SAOS peut aggraver l'hypoxémie diurne, majorer l'hypertension pulmonaire et potentiellement accélérer la progression de la fibrose par des mécanismes inflammatoires.</p>
        <p className="font-semibold mt-3">Prise en charge :</p>
        <p>Le traitement par Pression Positive Continue (PPC) est efficace, mais l'adhérence peut être difficile en raison de la toux ou de la dyspnée.</p>
      </>
    )
  },
  cancer: {
    title: "Détails sur le Cancer Broncho-Pulmonaire",
    content: (
      <>
        <p className="font-semibold">Risque :</p>
        <p>Le risque de développer un cancer du poumon est 5 à 10 fois plus élevé chez les patients atteints de FPI que dans la population générale. Le tabagisme est un facteur de risque commun, mais le risque persiste chez les non-fumeurs.</p>
        <p className="font-semibold mt-3">Mécanismes :</p>
        <p>L'inflammation chronique et les processus de réparation tissulaire anormaux dans le poumon fibrosant sont suspectés de favoriser la carcinogenèse.</p>
        <p className="font-semibold mt-3">Diagnostic et Traitement :</p>
        <p>Le diagnostic est souvent difficile car les nodules peuvent être masqués par la fibrose. La prise en charge thérapeutique (chirurgie, radiothérapie, chimiothérapie) est complexe et limitée par la fonction respiratoire précaire du patient.</p>
      </>
    )
  },
  rgo: {
    title: "Détails sur le Reflux Gastro-Œsophagien (RGO)",
    content: (
      <>
        <p className="font-semibold">Prévalence :</p>
        <p>Le RGO est retrouvé chez près de 90% des patients FPI, et il est souvent asymptomatique ("reflux silencieux").</p>
        <p className="font-semibold mt-3">Rôle dans la FPI :</p>
        <p>Il est considéré comme un facteur de risque et un cofacteur de progression de la maladie. L'hypothèse principale est que les micro-aspirations chroniques de contenu gastrique dans les poumons provoquent des lésions épithéliales répétées, stimulant une réponse fibrosante anormale.</p>
        <p className="font-semibold mt-3">Prise en charge :</p>
        <p>Un traitement anti-reflux (souvent par inhibiteurs de la pompe à protons - IPP) est largement recommandé, même en l'absence de symptômes typiques de RGO, pour potentiellement ralentir la progression de la maladie et réduire le risque d'exacerbations aiguës.</p>
      </>
    )
  },
  autres: {
    title: "Détails sur les Autres Comorbidités",
    content: (
      <>
        <p className="font-semibold">Pathologies Cardiovasculaires :</p>
        <p>La maladie coronarienne, l'insuffisance cardiaque et les arythmies sont fréquentes, partageant des facteurs de risque comme l'âge et le tabagisme. L'hypoxémie chronique de la FPI peut également surcharger le système cardiovasculaire.</p>
        <p className="font-semibold mt-3">Maladie Thromboembolique Veineuse :</p>
        <p>Le risque d'embolie pulmonaire est accru. Une aggravation brutale de la dyspnée doit toujours faire évoquer ce diagnostic.</p>
        <p className="font-semibold mt-3">Dépression et Anxiété :</p>
        <p>Le fardeau d'une maladie chronique, progressive et au pronostic sévère a un impact psychologique majeur. Le soutien psychologique fait partie intégrante de la prise en charge globale du patient.</p>
      </>
    )
  }
};

type ComorbidityKey = keyof typeof comorbidityDetails;

const ComplicationsPage: React.FC = () => {
  const [modalContent, setModalContent] = useState<{ title: string; content: React.ReactNode } | null>(null);

  const openModal = (comorbidityKey: ComorbidityKey) => {
    setModalContent(comorbidityDetails[comorbidityKey]);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const LearnMoreButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
      onClick={onClick}
      className="mt-4 text-sm font-bold text-accent-blue hover:underline focus:outline-none"
    >
      En savoir plus...
    </button>
  );

  return (
    <div>
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Autres Complications et Comorbidités</h1>
      <GeminiSummarizer />
      <ContentSection title="Pathologies Associées Fréquentes">
        <InfoCapsule id="complication-htp" title="Hypertension Pulmonaire (HTP)" icon={HeartIcon}>
          <p>Complication fréquente et grave, surtout aux stades avancés. À suspecter si la dyspnée est disproportionnée. Dépistage par échocardiographie.</p>
          <LearnMoreButton onClick={() => openModal('htp')} />
        </InfoCapsule>
        <InfoCapsule id="complication-emphyseme" title="Emphysème (Syndrome CPFE)" icon={ExclamationTriangleIcon}>
          <p>Association fibrose + emphysème. Caractérisé par une DLCO très altérée malgré des volumes pulmonaires "pseudo-normaux". Risque accru d'HTP.</p>
          <LearnMoreButton onClick={() => openModal('emphyseme')} />
        </InfoCapsule>
        <InfoCapsule id="complication-saos" title="Apnées du Sommeil (SAOS)" icon={ExclamationTriangleIcon}>
          <p>Très forte prévalence (jusqu'à 88%). Aggrave l'hypoxémie et la progression de la maladie. Le dépistage est crucial.</p>
          <LearnMoreButton onClick={() => openModal('saos')} />
        </InfoCapsule>
        <InfoCapsule id="complication-cancer" title="Cancer Broncho-Pulmonaire" icon={ExclamationTriangleIcon}>
          <p>Le risque est <strong>5 fois plus élevé</strong> que dans la population générale. Nécessite une vigilance radiologique accrue.</p>
          <LearnMoreButton onClick={() => openModal('cancer')} />
        </InfoCapsule>
        <InfoCapsule id="complication-rgo" title="Reflux Gastro-Œsophagien (RGO)" icon={ExclamationTriangleIcon}>
          <p>Extrêmement fréquent (&gt;60%). Suspecté de jouer un rôle dans la progression de la fibrose. À traiter même si asymptomatique.</p>
          <LearnMoreButton onClick={() => openModal('rgo')} />
        </InfoCapsule>
         <InfoCapsule title="Autres comorbidités" icon={HeartIcon}>
          <p>Pathologies cardiovasculaires, maladie thromboembolique, diabète, dépression. Une prise en charge globale est indispensable.</p>
          <LearnMoreButton onClick={() => openModal('autres')} />
        </InfoCapsule>
      </ContentSection>

      <Modal
        isOpen={!!modalContent}
        onClose={closeModal}
        title={modalContent?.title || ''}
      >
        {modalContent?.content}
      </Modal>
    </div>
  );
};

export default ComplicationsPage;