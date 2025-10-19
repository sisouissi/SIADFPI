import React, { useState } from 'react';
import ContentSection from '../components/ContentSection';
import InfoCapsule from '../components/InfoCapsule';
import AiAssistant from '../components/AiAssistant';
import Accordion from '../components/Accordion';
import Modal from '../components/Modal';

import { 
    ClipboardListIcon, 
    MicroscopeIcon, 
    MagnifyingGlassIcon,
    ChartBarIcon,
    UserGroupIcon,
    ShieldExclamationIcon,
    EyeIcon
} from '../constants';

const radiologicalImages = {
  subpleuralBasal: {
    src: './assets/images/subpleural-basal.png',
    title: 'Exemple de Distribution Sous-pleurale et Basale',
    alt: 'Scanner thoracique montrant une prédominance des anomalies fibrosantes aux bases et en sous-pleural',
    description: "Cette distribution est caractéristique de la FPI. Les anomalies (réticulations, rayon de miel) sont plus marquées dans les régions inférieures (bases) et à la périphérie du poumon, juste sous la plèvre. Ce gradient apico-basal est un critère essentiel pour les patterns de PIC certaine et probable."
  },
  honeycombing: {
    src: './assets/images/honeycombing.png',
    title: 'Exemple de Rayon de Miel (Honeycombing)',
    alt: 'Scanner thoracique montrant des kystes en rayon de miel',
    description: "Le rayon de miel se caractérise par des espaces kystiques aériques en grappes, généralement de 3 à 10 mm de diamètre, avec des parois épaisses et bien définies. C'est le signe histologique d'une fibrose pulmonaire avancée et irréversible, et un critère majeur pour le pattern de PIC/UIP certaine."
  },
  reticulations: {
    src: './assets/images/reticulations.png',
    title: 'Exemple de Réticulations',
    alt: 'Scanner thoracique montrant des réticulations intralobulaires',
    description: "Les réticulations correspondent à un réseau de fines opacités linéaires entrecroisées. Elles traduisent l'épaississement des septa inter- et intra-lobulaires par la fibrose. C'est un signe fondamental de fibrose pulmonaire, présent dans les patterns de PIC certaine et probable."
  },
  tractionBronchiectasis: {
    src: './assets/images/traction-bronchiectasis.png',
    title: 'Exemple de Bronchectasies de Traction',
    alt: 'Scanner thoracique montrant des bronchectasies de traction',
    description: "Les bronchectasies (et bronchiolectasies) de traction sont une dilatation irrégulière des voies aériennes causée par la rétraction du parenchyme fibrosé adjacent. Elles sont un signe de fibrose établie et sont fréquemment associées au rayon de miel et aux réticulations."
  },
  groundGlass: {
    src: './assets/images/ground-glass.png',
    title: 'Exemple de Verre Dépoli',
    alt: 'Scanner thoracique montrant des opacités en verre dépoli',
    description: "L'opacité en verre dépoli est une augmentation de la densité pulmonaire qui n'efface pas les contours des vaisseaux et des bronches. Lorsqu'il est prédominant et étendu, il est considéré comme un signe atypique pour une FPI, orientant plutôt vers un autre diagnostic comme une PINS ou une PHS."
  }
};

type RadiologicalSign = keyof typeof radiologicalImages;

const DiagnosisPage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string; description: string; } | null>(null);

    const openImageModal = (sign: RadiologicalSign) => {
        setSelectedImage(radiologicalImages[sign]);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
    };

    const ViewImageButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="ml-3 inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold text-sky-600 bg-sky-100 rounded-full border border-sky-200 hover:bg-sky-200 transition-colors"
        >
            <EyeIcon className="w-3 h-3" />
            Voir un exemple
        </button>
    );

    return (
        <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Diagnostic et Bilan Initial</h1>
            <AiAssistant />
            
            <ContentSection title="Évaluation Clinique et Examens Initiaux">
                <InfoCapsule id="symptomes-cliniques" title="Symptômes Cliniques" icon={ClipboardListIcon}>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Début progressif et insidieux.</li>
                        <li>Dyspnée d'effort progressive.</li>
                        <li>Toux sèche chronique.</li>
                        <li>Signes généraux possibles : asthénie, amaigrissement.</li>
                    </ul>
                </InfoCapsule>
                <InfoCapsule title="Examen Physique" icon={UserGroupIcon}>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Râles crépitants secs bilatéraux ("velcro") aux bases (&gt;80% des cas).</li>
                        <li>Hippocratisme digital.</li>
                        <li>Examen extra-respiratoire pour éliminer une connectivite.</li>
                    </ul>
                </InfoCapsule>
                <InfoCapsule title="Biologie" icon={MicroscopeIcon}>
                    <p>Bilan initial pour rechercher :</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Syndrome inflammatoire (souvent absent).</li>
                        <li>Signes d'auto-immunité (AAN, anti-CCP, FR) pour écarter une connectivite.</li>
                    </ul>
                </InfoCapsule>
                <InfoCapsule title="Explorations Fonctionnelles (EFR)" icon={ChartBarIcon}>
                    <p>Syndrome restrictif avec :</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Baisse de la Capacité Vitale Forcée (CVF).</li>
                        <li>Baisse de la DLCO (souvent précoce et marquée).</li>
                    </ul>
                </InfoCapsule>
            </ContentSection>

            <ContentSection title="Imagerie et Diagnostic Différentiel">
                <InfoCapsule title="Imagerie (TDM-HR)" icon={MagnifyingGlassIcon} className="md:col-span-2">
                    <p>Le scanner thoracique à haute résolution (TDM-HR) est l'examen clé. Il permet de classer l'aspect radiologique en 4 patterns :</p>
                    <Accordion title="1. PIC Typique (UIP Pattern)">
                        <p>Cet aspect est très spécifique de la FPI et permet de poser le diagnostic sans biopsie si le contexte clinique est compatible. Les critères sont :</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li><strong>Distribution :</strong> Prédominance nette <strong>sous-pleurale et basale</strong>.<ViewImageButton onClick={() => openImageModal('subpleuralBasal')} /></li>
                            <li><strong>Signe obligatoire :</strong> Présence de <strong>rayon de miel</strong> (honeycombing).<ViewImageButton onClick={() => openImageModal('honeycombing')} /></li>
                            <li><strong>Signes associés :</strong> <strong>Réticulations</strong> fines ou grossières <ViewImageButton onClick={() => openImageModal('reticulations')} />, avec ou sans <strong>bronchectasies de traction</strong> <ViewImageButton onClick={() => openImageModal('tractionBronchiectasis')} />.</li>
                            <li><strong>Absence de signes atypiques :</strong> Le verre dépoli, s'il est présent, doit être discret et superposé aux réticulations.</li>
                        </ul>
                    </Accordion>
                    <Accordion title="2. PIC Probable (Probable UIP)">
                        <p>Ce pattern est également très évocateur de FPI en l'absence de cause identifiée. La différence majeure est l'absence de rayon de miel.</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li><strong>Distribution :</strong> Prédominance <strong>sous-pleurale et basale</strong>, similaire à la PIC typique.<ViewImageButton onClick={() => openImageModal('subpleuralBasal')} /></li>
                            <li><strong>Signes obligatoires :</strong> Présence de <strong>réticulations</strong>.<ViewImageButton onClick={() => openImageModal('reticulations')} /></li>
                            <li><strong>Signes fréquents :</strong> <strong>Bronchectasies</strong> ou bronchiolectasies <strong>de traction</strong>.<ViewImageButton onClick={() => openImageModal('tractionBronchiectasis')} /></li>
                            <li><strong>Absence de rayon de miel</strong> et de signes atypiques.</li>
                        </ul>
                    </Accordion>
                    <Accordion title="3. Indéterminé pour une PIC (Indeterminate for UIP)">
                        <p>Ce pattern correspond à des anomalies de fibrose qui ne remplissent ni les critères de PIC typique/probable, ni ceux d'un diagnostic alternatif. Le diagnostic reste incertain.</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li><strong>Signes de fibrose :</strong> Réticulations, distorsion architecturale.</li>
                            <li><strong>Distribution :</strong> Peut être sous-pleurale et basale, mais aussi diffuse.</li>
                            <li><strong>Caractéristiques :</strong> La présence de <strong>verre dépoli</strong> plus marqué <ViewImageButton onClick={() => openImageModal('groundGlass')} /> ou d'autres signes discrets empêche de le classer en PIC probable.</li>
                            <li><strong>Conclusion :</strong> Le diagnostic nécessite une discussion multidisciplinaire approfondie, et souvent des examens complémentaires (LBA, biopsie).</li>
                        </ul>
                    </Accordion>
                    <Accordion title="4. Diagnostic Alternatif">
                        <p>Ce pattern regroupe les signes qui sont <strong>incompatibles</strong> avec un diagnostic de FPI et orientent fortement vers une autre pathologie (ex: PHS, PINS, connectivite...).</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                            <li><strong>Anomalies prédominantes :</strong> <strong>Verre dépoli</strong> étendu <ViewImageButton onClick={() => openImageModal('groundGlass')} />, <strong>consolidations</strong>, <strong>nodules centro-lobulaires</strong> profus.</li>
                            <li><strong>Autres signes évocateurs :</strong> <strong>Kystes</strong> multiples (différents du rayon de miel), <strong>atténuation en mosaïque</strong> marquée (piégeage aérique).</li>
                            <li><strong>Distribution atypique :</strong> Prédominance aux <strong>lobes supérieurs</strong> ou <strong>péribronchovasculaire</strong>.</li>
                        </ul>
                    </Accordion>
                </InfoCapsule>
                <InfoCapsule title="Diagnostic d'Élimination" icon={ShieldExclamationIcon} className="md:col-span-2">
                    <p>La FPI est un diagnostic d'exclusion. Il est crucial d'éliminer les autres causes de pneumopathies interstitielles fibrosantes, notamment :</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li><strong>Connectivites :</strong> polyarthrite rhumatoïde, sclérodermie...</li>
                        <li><strong>Expositions environnementales :</strong> pneumopathies d'hypersensibilité chroniques.</li>
                        <li><strong>Toxicité de certains médicaments.</strong></li>
                    </ul>
                </InfoCapsule>
            </ContentSection>

            <ContentSection title="Processus de Décision Diagnostique">
                <InfoCapsule title="Concertation Pluridisciplinaire (RCP)" icon={UserGroupIcon} className="md:col-span-2">
                    <p>C'est l'étape clé et <strong>obligatoire</strong> du processus diagnostique, surtout pour les cas où le scanner n'est pas typique. Elle réunit pneumologues, radiologues et anatomopathologistes pour une analyse collégiale du dossier et aboutir à un diagnostic de consensus final.</p>
                </InfoCapsule>
                <InfoCapsule title="Examens Invasifs (si TDM non concluante)" icon={MicroscopeIcon} className="md:col-span-2">
                    <p>Si le diagnostic reste incertain après la RCP, des examens invasifs peuvent être discutés :</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                        <li><strong>Lavage Broncho-Alvéolaire (LBA) :</strong> Peut aider à écarter d'autres diagnostics (infection, PHS...).</li>
                        <li><strong>Biopsie pulmonaire chirurgicale :</strong> Si réalisable, c'est l'examen de référence pour l'histologie, cherchant un aspect de PIC/UIP.</li>
                    </ul>
                </InfoCapsule>
            </ContentSection>
            
            <Modal
                isOpen={!!selectedImage}
                onClose={closeImageModal}
                title={selectedImage?.title || ''}
                maxWidth="max-w-3xl"
            >
                {selectedImage && (
                    <div>
                        <img 
                            src={selectedImage.src} 
                            alt={selectedImage.alt} 
                            className="max-w-full h-auto rounded-lg mx-auto border border-slate-200"
                        />
                        <p className="mt-4 text-slate-600 text-sm leading-relaxed">{selectedImage.description}</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DiagnosisPage;