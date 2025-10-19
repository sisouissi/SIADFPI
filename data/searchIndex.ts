import { SectionId } from '../types';

export interface SearchResult {
    id: string;
    sectionId: SectionId;
    title: string;
    content: string;
}

export const SEARCH_INDEX: SearchResult[] = [
    // Home
    {
        id: 'home-about',
        sectionId: 'home',
        title: 'À propos de ce guide',
        content: 'Ce guide est une monographie web interactive sur la Fibrose Pulmonaire Idiopathique (FPI), basée sur le Guide de Pratique Clinique (GPC) Tunisien publié en 2022 par la Société Tunisienne des Maladies Respiratoires et d’Allergologie (STMRA). Il est destiné aux professionnels de santé pour standardiser la prise en charge de la FPI.'
    },
    {
        id: 'home-objectives',
        sectionId: 'home',
        title: 'Objectifs du Guide',
        content: 'Les principaux objectifs sont de fournir des recommandations basées sur des preuves pour le diagnostic et le traitement de la FPI, d\'améliorer la qualité des soins, de réduire les variations de pratique clinique, et de servir de référence pour les professionnels de santé en Tunisie.'
    },
    {
        id: 'home-methodology',
        sectionId: 'home',
        title: 'Démarche et Méthodologie',
        content: 'La méthodologie a suivi les standards internationaux, incluant une revue systématique de la littérature, la formulation de questions cliniques précises, et l\'évaluation de la qualité des preuves. Les recommandations ont été élaborées par un consensus d\'experts et validées selon la grille AGREE II.'
    },
    {
        id: 'home-electronic-format',
        sectionId: 'home',
        title: 'L\'Intérêt du Format Électronique',
        content: 'Le format web interactif offre plusieurs avantages : une accessibilité immédiate sur tout support, une navigation fluide, une recherche d\'information rapide, l\'intégration d\'outils visuels comme les graphiques, et un assistant IA pour des réponses rapides aux questions cliniques. Il permet également des mises à jour faciles.'
    },
    // Introduction
    {
        id: 'intro-definition',
        sectionId: 'introduction',
        title: 'Définition',
        content: 'La Fibrose Pulmonaire Idiopathique (FPI) est la forme la plus fréquente et la plus sévère des pneumopathies interstitielles idiopathiques. C\'est une maladie chronique, progressive et irréversible.'
    },
    {
        id: 'intro-etiopathogenie',
        sectionId: 'introduction',
        title: 'Étiopathogénie',
        content: 'Son origine est complexe, impliquant une cicatrisation anormale du tissu pulmonaire due à un excès de fibroblastes et de dépôts de matrice extracellulaire.'
    },
    {
        id: 'intro-profil',
        sectionId: 'introduction',
        title: 'Profil Typique du Patient',
        content: 'La FPI survient généralement après 60 ans et touche majoritairement les hommes.'
    },
    {
        id: 'intro-diagnostic',
        sectionId: 'introduction',
        title: 'Diagnostic',
        content: 'Le diagnostic est multidisciplinaire, basé sur la clinique, le scanner thoracique (TDM-HR) et parfois la biopsie pulmonaire, cherchant un aspect de Pneumopathie Interstitielle Commune (PIC).'
    },
    {
        id: 'intro-source',
        sectionId: 'introduction',
        title: 'Source du Guide',
        content: 'Ce guide interactif est une synthèse basée sur le Guide de Pratique Clinique Tunisien pour la FPI publié en 2022 par la Société Tunisienne des Maladies Respiratoires et d’Allergologie (STMRA). Consulter le document original (PDF).'
    },
    // Epidemiology
    {
        id: 'epi-incidence',
        sectionId: 'epidemiology',
        title: 'Incidence et Prévalence',
        content: 'Incidence : 0,2 à 93,7 cas / 100 000 habitants par an, en augmentation mondiale. Prévalence : 0,33 à 4,51 cas / 10 000 habitants.'
    },
    {
        id: 'epi-mortalite',
        sectionId: 'epidemiology',
        title: 'Mortalité',
        content: 'La survie médiane est estimée à 3,8 ans chez les adultes de 65 ans et plus aux États-Unis. La mortalité varie selon les pays.'
    },
    {
        id: 'epi-facteurs-non-genetiques',
        sectionId: 'epidemiology',
        title: 'Facteurs de Risque Non Génétiques',
        content: 'Âge avancé, Sexe masculin, Tabagisme (actif ou sevré), Reflux gastro-œsophagien (RGO).'
    },
    {
        id: 'epi-facteurs-genetiques',
        sectionId: 'epidemiology',
        title: 'Facteurs de Risque Génétiques',
        content: '5 à 10% des cas sont familiaux (transmission autosomique dominante). Mutations des gènes des télomères (TERT, TERC...). Polymorphisme du gène MUC5B (facteur de risque majeur).'
    },
    // Diagnosis
    {
        id: 'diag-symptomes',
        sectionId: 'diagnosis',
        title: 'Symptômes Cliniques',
        content: 'Début progressif et insidieux. Dyspnée d\'effort progressive. Toux sèche chronique. Signes généraux possibles : asthénie, amaigrissement.'
    },
    {
        id: 'diag-examen',
        sectionId: 'diagnosis',
        title: 'Examen Physique',
        content: 'Râles crépitants secs bilatéraux ("velcro") aux bases (>80% des cas). Hippocratisme digital. Examen extra-respiratoire pour éliminer une connectivite.'
    },
    {
        id: 'diag-biologie',
        sectionId: 'diagnosis',
        title: 'Biologie',
        content: 'Bilan initial pour rechercher : Syndrome inflammatoire (souvent absent). Signes d\'auto-immunité (AAN, anti-CCP, FR) pour écarter une connectivite.'
    },
    {
        id: 'diag-imagerie',
        sectionId: 'diagnosis',
        title: 'Imagerie (TDM-HR)',
        content: 'Le scanner thoracique à haute résolution (TDM-HR) est l\'examen clé. La classification repose sur quatre patterns : 1. PIC Typique (UIP Pattern) : critère obligatoire de "rayon de miel" (honeycombing) avec une distribution sous-pleurale et basale. 2. PIC Probable (Probable UIP) : même distribution, avec réticulations et bronchectasies de traction, mais sans rayon de miel. 3. Indéterminé pour une PIC (Indeterminate for UIP) : fibrose ne remplissant pas les critères de PIC typique/probable ni ceux d\'un diagnostic alternatif (ex: fibrose subtile, verre dépoli discret). 4. Diagnostic Alternatif : présence de signes fortement évocateurs d\'un autre diagnostic (ex: prédominance du verre dépoli, nodules, kystes, distribution aux lobes supérieurs).'
    },
    {
        id: 'diag-efr',
        sectionId: 'diagnosis',
        title: 'Explorations Fonctionnelles Respiratoires (EFR)',
        content: 'Les EFR montrent typiquement un trouble ventilatoire restrictif (baisse de la Capacité Vitale Forcée CVF et de la Capacité Pulmonaire Totale CPT, avec un rapport VEMS/CVF normal ou augmenté) et une altération des échanges gazeux (baisse de la capacité de diffusion du monoxyde de carbone DLCO), qui est souvent un signe précoce et marqué.'
    },
    {
        id: 'diag-exclusion',
        sectionId: 'diagnosis',
        title: 'Diagnostic d\'Élimination',
        content: 'La FPI est un diagnostic d\'exclusion. Il est crucial d\'éliminer les autres causes de pneumopathies interstitielles fibrosantes, notamment les connectivites (polyarthrite rhumatoïde, sclérodermie), les expositions environnementales (pneumopathies d\'hypersensibilité chroniques) et la toxicité de certains médicaments.'
    },
    {
        id: 'diag-rcp',
        sectionId: 'diagnosis',
        title: 'Concertation Pluridisciplinaire (RCP)',
        content: 'C\'est l\'étape clé et obligatoire du processus diagnostique, surtout pour les cas où le scanner n\'est pas typique. Elle réunit pneumologues, radiologues et anatomopathologistes pour une analyse collégiale du dossier et aboutir à un diagnostic de consensus final.'
    },
    {
        id: 'diag-invasifs',
        sectionId: 'diagnosis',
        title: 'Examens Invasifs (si TDM non concluante)',
        content: 'Si le diagnostic reste incertain, un Lavage Broncho-Alvéolaire (LBA) peut aider à écarter d\'autres diagnostics. La biopsie pulmonaire chirurgicale, si réalisable, est l\'examen de référence pour l\'histologie, cherchant un aspect de Pneumopathie Interstitielle Commune (PIC/UIP). La décision de recourir à ces examens est prise en RCP.'
    },
    // Algorithm
    {
        id: 'algo-step1',
        sectionId: 'algorithm',
        title: 'Algorithme Étape 1 : Suspicion Clinique',
        content: 'La démarche diagnostique d\'une PID fibrosante commence par une suspicion clinique basée sur des symptômes comme la dyspnée progressive et la toux chronique, des signes comme les râles crépitants, et un terrain évocateur (patient > 60 ans).'
    },
    {
        id: 'algo-step2',
        sectionId: 'algorithm',
        title: 'Algorithme Étape 2 : Scanner Thoracique (TDM-HR)',
        content: 'Le scanner thoracique haute résolution (TDM-HR) est l\'examen clé. L\'analyse se concentre sur les motifs radiologiques, notamment la recherche d\'un aspect typique de Pneumopathie Interstitielle Commune (PIC/UIP) avec rayon de miel, ou d\'autres aspects (PIC probable, indéterminée, ou alternative).'
    },
    {
        id: 'algo-step3',
        sectionId: 'algorithm',
        title: 'Algorithme Étape 3 : Exclusion des Causes Secondaires',
        content: 'Il est impératif d\'exclure les causes secondaires de fibrose pulmonaire par un interrogatoire approfondi sur les expositions (professionnelles, environnementales), les médicaments, et les antécédents familiaux, complété par des bilans biologiques et immunologiques ciblés.'
    },
    {
        id: 'algo-step4',
        sectionId: 'algorithm',
        title: 'Algorithme Étape 4 : Discussion Multidisciplinaire (DMD)',
        content: 'La Discussion Multidisciplinaire (DMD) est une étape obligatoire qui réunit pneumologue, radiologue et anatomopathologiste. Son objectif est de parvenir à un diagnostic consensuel en intégrant toutes les données disponibles.'
    },
    {
        id: 'algo-step5',
        sectionId: 'algorithm',
        title: 'Algorithme Étape 5 : Prise de Décision Post-DMD',
        content: 'Après la DMD, la décision dépend du niveau de certitude. Un aspect typique d\'UIP sans cause secondaire mène au diagnostic de FPI sans biopsie. En cas d\'incertitude (PIC probable/indéterminée), une biopsie pulmonaire peut être discutée. Si le cas est discordant, une surveillance évolutive est préconisée.'
    },
    {
        id: 'algo-step6',
        sectionId: 'algorithm',
        title: 'Algorithme Étape 6 : Confirmation et Prise en Charge',
        content: 'Une fois le diagnostic de FPI confirmé, la prise en charge inclut un traitement antifibrosant, la gestion des symptômes (oxygénothérapie, réhabilitation), le traitement des comorbidités (RGO), et un suivi régulier. Pour les autres PID, un traitement spécifique est mis en place.'
    },
    // Prognosis
    {
        id: 'prog-demographiques',
        sectionId: 'prognosis',
        title: 'Facteurs Démographiques et Cliniques',
        content: 'Âge avancé et sexe masculin. Intensité de la dyspnée. IMC bas (< 25 kg/m²).'
    },
    {
        id: 'prog-fonctionnels',
        sectionId: 'prognosis',
        title: 'Facteurs Fonctionnels et Radiologiques',
        content: 'CVF basse, DLCO très basse (< 40%). Désaturation au TM6 (< 88%). Étendue du rayon de miel sur TDM. Présence d\'Hypertension Pulmonaire (HTP).'
    },
    {
        id: 'prog-suivi',
        sectionId: 'prognosis',
        title: 'Critères de Progression de la Maladie',
        content: 'La progression de la maladie est définie par le déclin de la capacité vitale forcée (CVF ≥ 5% absolu ou ≥ 10% relatif), la réduction de la capacité de diffusion (DLCO ≥ 15% relatif), la diminution de la distance au test de marche de 6 minutes (TM6 ≥ 50 mètres), ou une aggravation clinique/radiologique. La fréquence des évaluations est de 3 à 6 mois.'
    },
    // Treatment
    {
        id: 'treat-nintedanib',
        sectionId: 'treatment',
        title: 'Nintedanib (Ofev®)',
        content: 'Inhibiteur de tyrosine kinases. Posologie : 150 mg, deux fois par jour. Effet secondaire principal : diarrhée, gérée par lopéramide et adaptations de dose. Nécessite une surveillance hépatique.'
    },
    {
        id: 'treat-pirfenidone',
        sectionId: 'treatment',
        title: 'Pirfénidone (Esbriet®)',
        content: 'Molécule antifibrotique. Posologie cible : 801 mg, trois fois par jour, pendant les repas. Effets secondaires principaux : photosensibilité (nécessite photoprotection) et troubles digestifs.'
    },
    {
        id: 'treat-oxygen',
        sectionId: 'treatment',
        title: 'Oxygénothérapie',
        content: 'Vise à maintenir une SpO2 ≥ 90%. Prescrite au repos si PaO2 ≤ 55 mmHg, ou à la déambulation pour corriger la désaturation à l\'effort.'
    },
    {
        id: 'treat-rehab',
        sectionId: 'treatment',
        title: 'Réhabilitation Respiratoire',
        content: 'Programme multidisciplinaire essentiel pour améliorer la tolérance à l\'effort, réduire la dyspnée et améliorer la qualité de vie de tous les patients FPI.'
    },
    {
        id: 'treat-transplant',
        sectionId: 'treatment',
        title: 'Transplantation Pulmonaire',
        content: 'Seul traitement curatif. Une orientation précoce vers un centre spécialisé est cruciale. Critères : DLCO < 40%, déclin de CVF ≥ 10% sur 6 mois, désaturation < 88% au TM6.'
    },
    {
        id: 'treat-symptoms',
        sectionId: 'treatment',
        title: 'Gestion des Symptômes',
        content: 'Gestion de la toux chronique (opiacés faible dose) et de la dyspnée (réhabilitation, oxygène, morphiniques en phase palliative).'
    },
     {
        id: 'treat-support',
        sectionId: 'treatment',
        title: 'Prévention et Soins de Support',
        content: 'Importance des vaccinations (grippe, pneumocoque, COVID-19) pour prévenir les exacerbations. Introduction précoce des soins palliatifs pour améliorer la qualité de vie.'
    },
    // Exacerbation
    {
        id: 'exacer-definition-criteria',
        sectionId: 'exacerbation',
        title: 'Critères Diagnostiques de l\'EAFPI',
        content: 'L\'exacerbation aiguë de FPI (EAFPI) est une détérioration respiratoire aiguë (< 1 mois) chez un patient avec FPI connue, présentant de nouvelles opacités en verre dépoli ou condensations bilatérales à la TDM-HR, et après avoir exclu d\'autres causes comme une infection, une embolie pulmonaire ou une insuffisance cardiaque.'
    },
    {
        id: 'exacer-bilan',
        sectionId: 'exacerbation',
        title: 'Bilan Diagnostique d\'une EAFPI',
        content: 'Le diagnostic d\'EAFPI étant un diagnostic d\'exclusion, un bilan complet est nécessaire. Il inclut des examens biologiques (NFS, CRP, BNP, D-dimères), une TDM-HR (parfois un angioscanner), des prélèvements microbiologiques et souvent un lavage broncho-alvéolaire (LBA) pour rechercher une infection.'
    },
    {
        id: 'exacer-traitement',
        sectionId: 'exacerbation',
        title: 'Traitement de l\'EAFPI',
        content: 'La prise en charge se fait en milieu hospitalier. Aucun traitement n\'a formellement prouvé son efficacité. Elle repose sur des soins de support (oxygénothérapie, parfois ventilation non invasive), une corticothérapie systémique à haute dose, et souvent une antibiothérapie empirique à large spectre.'
    },
    {
        id: 'exacer-pronostic-prevention',
        sectionId: 'exacerbation',
        title: 'Pronostic et Prévention de l\'EAFPI',
        content: 'Le pronostic est très sombre, avec une mortalité hospitalière d\'environ 50%. La prévention est un enjeu majeur et repose sur la vaccination (grippe, pneumocoque, COVID-19), le traitement rapide des infections et la gestion des comorbidités comme le RGO.'
    },
    // Complications
    {
        id: 'comp-htp',
        sectionId: 'complications',
        title: 'Hypertension Pulmonaire (HTP)',
        content: 'Complication fréquente et grave, surtout aux stades avancés. À suspecter si la dyspnée est disproportionnée. Dépistage par échocardiographie.'
    },
    {
        id: 'comp-emphyseme',
        sectionId: 'complications',
        title: 'Emphysème (Syndrome CPFE)',
        content: 'Association fibrose + emphysème. Caractérisé par une DLCO très altérée malgré des volumes pulmonaires "pseudo-normaux". Risque accru d\'HTP.'
    },
    {
        id: 'comp-saos',
        sectionId: 'complications',
        title: 'Apnées du Sommeil (SAOS)',
        content: 'Très forte prévalence (jusqu\'à 88%). Aggrave l\'hypoxémie et la progression de la maladie. Le dépistage est crucial.'
    },
    {
        id: 'comp-cancer',
        sectionId: 'complications',
        title: 'Cancer Broncho-Pulmonaire',
        content: 'Le risque est 5 fois plus élevé que dans la population générale. Nécessite une vigilance radiologique accrue.'
    },
    {
        id: 'comp-rgo',
        sectionId: 'complications',
        title: 'Reflux Gastro-Œsophagien (RGO)',
        content: 'Extrêmement fréquent (>60%). Suspecté de jouer un rôle dans la progression de la fibrose. À traiter même si asymptomatique.'
    },
    {
        id: 'comp-autres',
        sectionId: 'complications',
        title: 'Autres comorbidités',
        content: 'Pathologies cardiovasculaires, maladie thromboembolique, diabète, dépression. Une prise en charge globale est indispensable.'
    },
    // Recommendations
    { id: 'reco-1', sectionId: 'recommendations', title: 'Recommandation 1', content: 'Lorsqu’une FPI est suspectée, il est recommandé de réaliser un interrogatoire minutieux et un examen physique complet respiratoire et extra-respiratoire. Il est aussi recommandé de rechercher la présence d’autres cas de PID dans la famille.' },
    { id: 'reco-2', sectionId: 'recommendations', title: 'Recommandation 2', content: 'Si une FPI est suspectée, il est recommandé de réaliser systématiquement un bilan biologique comportant : NFS, créatininémie, transaminases, gamma-GT, phosphatases alcalines, CRP et CPK.' },
    { id: 'reco-3', sectionId: 'recommendations', title: 'Recommandation 3', content: 'Si une FPI est suspectée, il est recommandé de réaliser un bilan immunologique comportant des anticorps antinucléaires, anti-CCP et facteur rhumatoïde. Le dosage des ANCA est suggéré. D\'autres examens peuvent être demandés pour éliminer une connectivite associée.' },
    { id: 'reco-4', sectionId: 'recommendations', title: 'Recommandation 4', content: 'Il est recommandé de retenir le diagnostic de FPI chez un patient avec une présentation clinique évocatrice, un aspect TDM de PIC ou PIC probable, après élimination des autres causes de PIC.' },
    { id: 'reco-5', sectionId: 'recommendations', title: 'Recommandation 5', content: 'Il est suggéré de réaliser un lavage bronchoalvéolaire si l’aspect radiologique n’est pas celui d’une PIC et si le risque est faible.' },
    { id: 'reco-6', sectionId: 'recommendations', title: 'Recommandation 6', content: 'Il est recommandé de rechercher des arguments en faveur d’une cause déterminée de PID (médicaments, antigène inhalé, particules minérales, connectivite, vascularite systémique).' },
    { id: 'reco-7', sectionId: 'recommendations', title: 'Recommandation 7', content: 'Il est recommandé de rechercher des cas de PID dans la famille et des arguments pour une cause génétique (âge < 50 ans, etc.). Une consultation spécialisée en génétique est suggérée.' },
    { id: 'reco-8', sectionId: 'recommendations', title: 'Recommandation 8', content: 'Il est recommandé d’envisager une biopsie pulmonaire en cas d’incertitude diagnostique après discussion multidisciplinaire, surtout si TDM non PIC ou PIC probable. La cryobiopsie peut être proposée.' },
    { id: 'reco-9', sectionId: 'recommendations', title: 'Recommandation 9', content: 'Il est recommandé de discuter les dossiers des patients en discussion multidisciplinaire (DMD) pour valider le diagnostic, indiquer d’autres explorations et décider du traitement.' },
    { id: 'reco-10', sectionId: 'recommendations', title: 'Recommandation 10', content: 'Il est recommandé de réaliser une spirométrie avec mesure de la CVF et de la DLCO chez tout patient présentant une FPI.' },
    { id: 'reco-11', sectionId: 'recommendations', title: 'Recommandation 11', content: 'En l’absence de mesure de la DLCO, il est recommandé de réaliser un test de marche de six minutes (TM6) avec monitorage de la saturation, en plus de la CVF.' },
    { id: 'reco-12', sectionId: 'recommendations', title: 'Recommandation 12', content: 'Il est recommandé d’évaluer initialement le pronostic sur la sévérité de la dyspnée, l’EFR, la saturation au TM6, l’étendue du rayon de miel, les signes d’HTP et le calcul d’un score comme le GAP.' },
    { id: 'reco-13', sectionId: 'recommendations', title: 'Recommandation 13', content: 'Au cours du suivi, il est recommandé d’effectuer un examen clinique et une EFR tous les trois à six mois. Un scanner thoracique annuel est suggéré. Un scanner est recommandé en cas de suspicion d’exacerbation ou de complication.' },
    { id: 'reco-14', sectionId: 'recommendations', title: 'Recommandation 14', content: 'Chez un patient avec FPI légère à modérée (CVF ≥ 50 %, DLCO ≥ 30 %), il est recommandé de proposer un traitement par nintedanib, surveillé par un pneumologue expérimenté.' },
    { id: 'reco-15', sectionId: 'recommendations', title: 'Recommandation 15', content: 'Il est recommandé de traiter la FPI par l’antifibrosant dès que le diagnostic est établi, en tenant compte de la balance bénéfices-risques.' },
    { id: 'reco-16', sectionId: 'recommendations', title: 'Recommandation 16', content: 'Il est recommandé de ne pas instituer de traitement par corticothérapie, trithérapie (prednisone-azathioprine-N-acétylcystéine), monothérapie par N-acétylcystéine, colchicine, ciclosporine A, étanercept, carlumab ou simtuzumab.' },
    { id: 'reco-17', sectionId: 'recommendations', title: 'Recommandation 17', content: 'Il est recommandé de ne pas instituer de traitement par warfarine ou anti-vitamines K en dehors d’une indication cardiovasculaire.' },
    { id: 'reco-18', sectionId: 'recommendations', title: 'Recommandation 18', content: 'Il est recommandé de ne pas instituer de traitement par Interféron- Gamma- 1b.' },
    { id: 'reco-19', sectionId: 'recommendations', title: 'Recommandation 19', content: 'Il est recommandé de ne pas instituer de traitement par bosentan, macitentan et ambrisentan.' },
    { id: 'reco-20', sectionId: 'recommendations', title: 'Recommandation 20', content: 'Il est recommandé de proposer la vaccination anti-grippale annuelle, antipneumococcique et contre la COVID-19.' },
    { id: 'reco-21', sectionId: 'recommendations', title: 'Recommandation 21', content: 'En cas de toux chronique invalidante, il est suggéré de rechercher une cause, un RGO, et d\'envisager une corticothérapie ou un traitement morphinique à faible dose.' },
    { id: 'reco-22', sectionId: 'recommendations', title: 'Recommandation 22', content: 'En cas de dyspnée invalidante, il est suggéré de prescrire des dérivés morphiniques à faible dose, en évaluant l’efficacité et la tolérance.' },
    { id: 'reco-23', sectionId: 'recommendations', title: 'Recommandation 23', content: 'Il est recommandé d’indiquer l’oxygénothérapie de longue durée en cas d\'insuffisance respiratoire chronique grave (PaO2 < 55 mmHg ou 56-60 mmHg avec critères associés).' },
    { id: 'reco-24', sectionId: 'recommendations', title: 'Recommandation 24', content: 'Il est suggéré d’indiquer l’oxygénothérapie de déambulation en cas de dyspnée d’effort importante et de désaturation.' },
    { id: 'reco-25', sectionId: 'recommendations', title: 'Recommandation 25', content: 'Il est recommandé de prescrire un programme de réhabilitation respiratoire chez les patients avec limitation des capacités à l’exercice, initié dans un centre dédié.' },
    { id: 'reco-26', sectionId: 'recommendations', title: 'Recommandation 26', content: 'Il est recommandé d’adresser les patients à un centre de pneumologie de troisième ligne pour une évaluation précoce de l’indication d’une transplantation pulmonaire.' },
    { id: 'reco-27', sectionId: 'recommendations', title: 'Recommandation 27', content: 'Il est suggéré d’inscrire sur la liste d’attente de transplantation les patients avec une forme grave de FPI, un cœur pulmonaire chronique ou un déclin important de la fonction respiratoire.' },
    { id: 'reco-28', sectionId: 'recommendations', title: 'Recommandation 28', content: 'Il est recommandé de retenir le diagnostic d’exacerbation aiguë en cas d’aggravation récente de la dyspnée (< 1 mois) non liée à une cause extra-parenchymateuse, associée à de nouvelles opacités en verre dépoli et/ou alvéolaires.' },
    { id: 'reco-29', sectionId: 'recommendations', title: 'Recommandation 29', content: 'Il est suggéré d’utiliser les corticoïdes à posologie élevée pour traiter les exacerbations aiguës, potentiellement associés à une antibiothérapie empirique.' },
    { id: 'reco-30', sectionId: 'recommendations', title: 'Recommandation 30', content: 'Il est recommandé de ne pas utiliser les immunosupresseurs (cyclophosphamide) pour traiter les exacerbations aiguës de la FPI.' },
    { id: 'reco-31', sectionId: 'recommendations', title: 'Recommandation 31', content: 'Il est suggéré d’entreprendre des mesures de réanimation en cas d\'exacerbation aiguë s\'il existe un projet de transplantation, une cause réversible d’aggravation identifiée, ou si la recherche étiologique n’a pas été effectuée.' },
    { id: 'reco-32', sectionId: 'recommendations', title: 'Recommandation 32', content: 'Il est suggéré de réaliser une échographie cardiaque et un angioscanner thoracique pour rechercher une HTP en cas d’aggravation clinique.' },
    { id: 'reco-33', sectionId: 'recommendations', title: 'Recommandation 33', content: 'Il est suggéré de réaliser un cathétérisme cardiaque droit pour diagnostiquer une HTP en cas de doute sur un autre diagnostic.' },
    { id: 'reco-34', sectionId: 'recommendations', title: 'Recommandation 34', content: 'En cas d\'HTP, il est recommandé de rechercher et de corriger une hypoxémie de repos, une maladie veineuse thrombo-embolique et une insuffisance cardiaque gauche.' },
    { id: 'reco-35', sectionId: 'recommendations', title: 'Recommandation 35', content: 'Il est recommandé de ne pas prescrire un traitement spécifique de l’hypertension artérielle pulmonaire en cas d\'HTP précapillaire.' },
    { id: 'reco-36', sectionId: 'recommendations', title: 'Recommandation 36', content: 'Il est recommandé de rechercher des signes d’emphysème sur le scanner pour ne pas sous-estimer la sévérité du syndrome emphysème-fibrose lorsque les volumes sont préservés.' },
    { id: 'reco-37', sectionId: 'recommendations', title: 'Recommandation 37', content: 'Il est suggéré de surveiller particulièrement le risque d’HTP sévère en cas de syndrome emphysème-fibrose.' },
    { id: 'reco-38', sectionId: 'recommendations', title: 'Recommandation 38', content: 'En cas d\'emphysème associé, il est suggéré de le prendre en charge selon les pratiques habituelles (traitements inhalés, etc.).' },
    { id: 'reco-39', sectionId: 'recommendations', title: 'Recommandation 39', content: 'Il est suggéré de ne pas prendre en compte la présence de l’emphysème dans le choix des thérapeutiques antifibrosantes.' },
    { id: 'reco-40', sectionId: 'recommendations', title: 'Recommandation 40', content: 'Il est recommandé de pratiquer une polygraphie ventilatoire ou une polysomnographie pour rechercher un SAHOS s’il existe des signes cliniques évocateurs.' },
    { id: 'reco-41', sectionId: 'recommendations', title: 'Recommandation 41', content: 'S\'il est présent, il est suggéré de traiter le SAHOS selon les recommandations en vigueur.' },
    { id: 'reco-42', sectionId: 'recommendations', title: 'Recommandation 42', content: 'Il est suggéré d’informer le médecin en charge du suivi de la fréquence du cancer bronchopulmonaire sur ce terrain.' },
    { id: 'reco-43', sectionId: 'recommendations', title: 'Recommandation 43', content: 'Il est recommandé de conseiller au patient d’arrêter le tabac s’il est fumeur.' },
    { id: 'reco-44', sectionId: 'recommendations', title: 'Recommandation 44', content: 'En cas de cancer bronchopulmonaire, il est recommandé de prendre en compte la FPI dans les choix thérapeutiques.' },
    { id: 'reco-45', sectionId: 'recommendations', title: 'Recommandation 45', content: 'Il est recommandé de rechercher un antécédent ou des symptômes de RGO. En cas de suspicion, il est suggéré de l’explorer et de le traiter.' },
    { id: 'reco-46', sectionId: 'recommendations', title: 'Recommandation 46', content: 'Il est suggéré de rechercher et d’organiser la prise en charge des comorbidités (cardiovasculaires, thromboemboliques, diabète, dépression) en partenariat avec le médecin traitant.' },
    {
        id: 'ref-main',
        sectionId: 'references',
        title: 'Références Bibliographiques',
        content: `Société Tunisienne des Maladies Respiratoires et d’Allergologie (STMRA). Guide de Pratique Clinique Tunisien : Diagnostic et prise en charge de la Fibrose Pulmonaire Idiopathique. Tunis; 2022. Cottin V, Crestani B, Cadranel J, et al. Recommandations de la Société de pneumologie de langue française sur la fibrose pulmonaire idiopathique (actualisation 2017). Rev Mal Respir. 2017. Raghu G, Collard HR, Egan JJ, et al. An official ATS/ERS/JRS/ALAT statement: idiopathic pulmonary fibrosis: evidence-based guidelines for diagnosis and management. Am J Respir Crit Care Med. 2011. Richeldi L, du Bois RM, Raghu G, et al. Efficacy and safety of nintedanib in idiopathic pulmonary fibrosis. N Engl J Med. 2014. King TE Jr, Bradford WZ, Castro-Bernardini S, et al. A phase 3 trial of pirfenidone in patients with idiopathic pulmonary fibrosis. N Engl J Med. 2014.`
    }
];