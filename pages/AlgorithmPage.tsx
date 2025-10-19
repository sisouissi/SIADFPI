import React from 'react';
import Accordion from '../components/Accordion';
import InternalLink from '../components/InternalLink';

const SubSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-xl font-semibold text-accent-blue mb-3">{title}</h4>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);


const AlgorithmPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Algorithme Diagnostique de la PID Fibrosante</h1>
            <p className="text-lg text-slate-600 mb-10">
                Ce guide interactif vous accompagne pas à pas dans la démarche diagnostique devant une suspicion de Pneumopathie Interstitielle Diffuse (PID) fibrosante.
            </p>

            <div className="space-y-2">
                <Accordion title="SUSPICION CLINIQUE ET EXAMENS INITIAUX">
                    <div className="pt-4 pl-4">
                        <SubSection title="Éléments évocateurs">
                            <ul className="list-disc list-inside">
                                <li><strong>Symptômes respiratoires :</strong> Dyspnée progressive, toux chronique</li>
                                <li><strong>Examen clinique :</strong> Râles crépitants aux bases pulmonaires</li>
                                <li><strong>Terrain :</strong> Patient âgé de &gt; 60 ans</li>
                                <li><strong>Imagerie initiale :</strong> Radiographie thoracique évocatrice de fibrose pulmonaire diffuse</li>
                            </ul>
                        </SubSection>
                    </div>
                </Accordion>

                <Accordion title="RÔLE CENTRAL DU SCANNER THORACIQUE (TDM-HR)">
                    <div className="space-y-6 pt-4 pl-4">
                        <SubSection title="Réalisation et Analyse">
                            <p>Scanner thoracique haute résolution (TDM-HR) <strong>sans injection</strong>, avec analyse minutieuse du motif radiologique et de sa distribution.</p>
                        </SubSection>
                        <SubSection title="Analyse des aspects radiologiques">
                            <ul className="list-disc list-inside">
                                <li><strong>A. Aspect typique de PIC/UIP :</strong> Prédominance sous-pleurale et basale, présence de rayon de miel (honeycombing), bronchectasies de traction, et absence de caractéristiques atypiques.</li>
                                <li><strong>B. Aspects non typiques :</strong>
                                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                        <li><strong>PIC probable :</strong> Caractéristiques d'UIP mais incomplètes.</li>
                                        <li><strong>PIC indéterminée :</strong> Motifs ambigus.</li>
                                        <li><strong>Autres aspects :</strong> Distribution non basale/sous-pleurale, prédominance de verre dépoli, aspect en mosaïque, nodules, etc.</li>
                                    </ul>
                                </li>
                            </ul>
                        </SubSection>
                    </div>
                </Accordion>

                <Accordion title="EXCLUSION DES DIAGNOSTICS DIFFÉRENTIELS">
                    <div className="space-y-6 pt-4 pl-4">
                        <SubSection title="Interrogatoire Approfondi">
                            <ul className="list-disc list-inside">
                                <li><strong>Expositions :</strong> Professionnelles (amiante, silice), environnementales (oiseaux, moisissures).</li>
                                <li><strong>Médicaments :</strong> Amiodarone, nitrofurantoïne, méthotrexate, chimiothérapies.</li>
                                <li><strong>Antécédents familiaux :</strong> Recherche de PID familiale.</li>
                                <li><strong>Signes de connectivite ou vascularite :</strong> Arthralgies, phénomène de Raynaud, sécheresse, éruptions, atteinte ORL/rénale.</li>
                            </ul>
                        </SubSection>
                        <SubSection title="Bilans Complémentaires (selon contexte)">
                            <ul className="list-disc list-inside">
                                <li><strong>Bilan immunologique :</strong> AAN, anti-ENA, FR, anti-CCP, ANCA.</li>
                                <li><strong>Bilan biologique :</strong> NFS, CRP, fonction rénale/hépatique, CPK.</li>
                                <li><strong>Précipitines sériques :</strong> Si suspicion de pneumopathie d'hypersensibilité.</li>
                            </ul>
                        </SubSection>
                    </div>
                </Accordion>

                <Accordion title="DISCUSSION MULTIDISCIPLINAIRE (DMD)">
                     <div className="pt-4 pl-4">
                        <SubSection title="Principe et Objectif">
                            <p className="mb-2">La DMD est l'étape centrale et obligatoire du processus. Elle réunit pneumologue, radiologue thoracique et anatomopathologiste pour un diagnostic consensuel.</p>
                            <p>Son objectif est d'aboutir à un diagnostic de consensus en intégrant toutes les données (cliniques, radiologiques, fonctionnelles, biologiques et histopathologiques) et décider de la nécessité d'investigations complémentaires.</p>
                        </SubSection>
                     </div>
                </Accordion>

                <Accordion title="ARBRE DÉCISIONNEL POST-DMD">
                    <div className="space-y-6 pt-4 pl-4">
                        <SubSection title="CAS 1 : Diagnostic clair - Aspect typique d'UIP + Contexte compatible">
                             <h5 className="font-semibold text-slate-800 mb-2">Critères</h5>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Scanner HRCT montrant un aspect typique d'UIP.</li>
                                <li>Absence de cause secondaire identifiée.</li>
                                <li>Concordance clinico-radiologique.</li>
                            </ul>
                             <p className="font-semibold text-green-500 mt-3">✅ Décision : Diagnostic de Fibrose Pulmonaire Idiopathique (FPI) retenu SANS histologie.</p>
                        </SubSection>
                         <SubSection title="CAS 2 : Diagnostic indéterminé + Possibilité de retentissement fonctionnel">
                              <h5 className="font-semibold text-slate-800 mb-2">Situation</h5>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Aspect radiologique non typique (PIC probable ou indéterminée).</li>
                                <li>Doute diagnostique persistant après DMD.</li>
                            </ul>
                             <h5 className="font-semibold text-amber-500 mt-3">Discussion d'une biopsie pulmonaire :</h5>
                             <p>À envisager si le patient est sans comorbidités majeures et si le résultat peut modifier la prise en charge. La biopsie chirurgicale (vidéo-thoracoscopie) est le gold standard ; la cryobiopsie est une alternative.</p>
                        </SubSection>
                        <SubSection title="CAS 3 : Diagnostic discordant ou atypique">
                             <h5 className="font-semibold text-slate-800 mb-2">Situation</h5>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Discordance clinico-radiologique, éléments atypiques.</li>
                                <li>Biopsie contre-indiquée, refusée ou non concluante.</li>
                            </ul>
                            <h5 className="font-semibold text-sky-500 mt-3">Conduite à tenir :</h5>
                            <p>Surveillance évolutive avec réévaluation clinique, fonctionnelle (EFR) et radiologique (TDM-HR) à 3-6 mois, suivie d'une nouvelle DMD pour reconsidérer les diagnostics différentiels (PHS chronique, PINS, PID associée à une connectivite, etc.).</p>
                        </SubSection>
                    </div>
                </Accordion>

                 <Accordion title="DIAGNOSTIC FINAL ET PRISE EN CHARGE">
                    <div className="space-y-6 pt-4 pl-4">
                        <SubSection title="Si FPI Confirmée">
                            <ul className="list-disc list-inside">
                                <li><strong>Traitement antifibrosant :</strong> Nintédanib ou pirfénidone.</li>
                                <li><strong>Prise en charge symptomatique :</strong> Oxygénothérapie si hypoxémie, réhabilitation respiratoire, traitement du <InternalLink sectionId='complications' anchorId='complication-rgo'>RGO</InternalLink>, vaccinations.</li>
                                <li><strong>Suivi régulier :</strong> Clinique et EFR tous les 3-6 mois.</li>
                            </ul>
                        </SubSection>
                        <SubSection title="Si Autre PID">
                             <p>Traitement spécifique selon le diagnostic retenu (ex: immunosuppresseurs pour PID inflammatoire, éviction pour PHS).</p>
                        </SubSection>
                        <SubSection title="Suivi à Long Terme (pour toutes les PID fibrosantes)">
                             <ul className="list-disc list-inside">
                                <li>Surveillance de l'évolution de la maladie.</li>
                                <li>Dépistage des complications (<InternalLink sectionId='complications' anchorId='complication-htp'>hypertension pulmonaire</InternalLink>, <InternalLink sectionId='complications' anchorId='complication-cancer'>cancer</InternalLink>).</li>
                                <li>Discussion d'une éventuelle transplantation pulmonaire si éligible.</li>
                            </ul>
                        </SubSection>
                    </div>
                </Accordion>

                <Accordion title="POINTS CLÉS À RETENIR">
                    <div className="pt-4 pl-4">
                        <ol className="list-decimal list-inside space-y-3">
                            <li><strong>La DMD est centrale :</strong> Aucun diagnostic de PID fibrosante ne devrait être posé sans discussion multidisciplinaire.</li>
                            <li><strong>L'aspect typique d'UIP</strong> au scanner permet le diagnostic de FPI sans biopsie si le contexte clinique est compatible.</li>
                            <li><strong>L'exclusion des causes secondaires</strong> est fondamentale avant de conclure à une PID idiopathique.</li>
                            <li><strong>La biopsie n'est pas systématique :</strong> Elle est discutée au cas par cas selon le bénéfice attendu.</li>
                            <li><strong>Le suivi évolutif</strong> peut être un outil diagnostique dans les cas incertains.</li>
                            <li><strong>La prise en charge doit être précoce</strong> pour optimiser le pronostic.</li>
                        </ol>
                    </div>
                </Accordion>
            </div>
        </div>
    );
};

export default AlgorithmPage;