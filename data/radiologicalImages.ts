export const radiologicalImages = {
  subpleuralBasal: {
    src: '/assets/images/subpleural-basal.jpg',
    title: 'Exemple de Distribution Sous-pleurale et Basale',
    alt: 'Scanner thoracique montrant une fibrose prédominant aux bases et à la périphérie des poumons',
    description: "Cette distribution est caractéristique de la FPI. Les anomalies (réticulations, rayon de miel) sont plus marquées dans les régions inférieures (bases) et à la périphérie du poumon, juste sous la plèvre. Ce gradient apico-basal est un critère essentiel pour les patterns de PIC certaine et probable."
  },
  honeycombing: {
    src: '/assets/images/honeycombing.jpg',
    title: 'Exemple de Rayon de Miel (Honeycombing)',
    alt: 'Scanner thoracique montrant des kystes en rayon de miel',
    description: "Le rayon de miel se caractérise par des espaces kystiques aériques en grappes, généralement de 3 à 10 mm de diamètre, avec des parois épaisses et bien définies. C'est le signe histologique d'une fibrose pulmonaire avancée et irréversible, et un critère majeur pour le pattern de PIC/UIP certaine."
  },
  reticulations: {
    src: '/assets/images/reticulations.jpg',
    title: 'Exemple de Réticulations',
    alt: 'Scanner thoracique montrant un réseau de fines opacités linéaires',
    description: "Les réticulations correspondent à un réseau de fines opacités linéaires entrecroisées. Elles traduisent l'épaississement des septa inter- et intra-lobulaires par la fibrose. C'est un signe fondamental de fibrose pulmonaire, présent dans les patterns de PIC certaine et probable."
  },
  tractionBronchiectasis: {
    src: '/assets/images/traction-bronchiectasis.jpg',
    title: 'Exemple de Bronchectasies de Traction',
    alt: 'Scanner thoracique montrant une dilatation irrégulière des voies aériennes',
    description: "Les bronchectasies (et bronchiolectasies) de traction sont une dilatation irrégulière des voies aériennes causée par la rétraction du parenchyme fibrosé adjacent. Elles sont un signe de fibrose établie et sont fréquemment associées au rayon de miel et aux réticulations."
  },
  groundGlass: {
    src: '/assets/images/ground-glass.jpg',
    title: 'Exemple de Verre Dépoli',
    alt: 'Scanner thoracique montrant des opacités en verre dépoli',
    description: "L'opacité en verre dépoli est une augmentation de la densité pulmonaire qui n'efface pas les contours des vaisseaux et des bronches. Lorsqu'il est prédominant et étendu, il est considéré comme un signe atypique pour une FPI, orientant plutôt vers un autre diagnostic comme une PINS ou une PHS."
  }
};

export type RadiologicalSign = keyof typeof radiologicalImages;

export interface RadiologicalImage {
    src: string;
    title: string;
    alt: string;
    description: string;
}
