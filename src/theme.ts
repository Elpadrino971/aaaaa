/**
 * Palette et constantes visuelles.
 * Couleurs franches, très contrastées, pensées pour de jeunes enfants.
 */

export const colors = {
  bleu: '#5b6ef5',
  bleuFonce: '#4a56d6',
  violet: '#9b5bf5',
  rose: '#f55b9b',
  orange: '#ff8a3d',
  jaune: '#ffc93c',
  vert: '#35c46b',
  vertFonce: '#23a856',
  turquoise: '#2ec5c5',
  rouge: '#ef4444',

  encre: '#2b2d5b',
  papier: '#ffffff',
  gris: '#eef0fb',
  grisMoyen: '#c9cee8',
  grisTexte: '#7a80a8',
} as const;

/** Dégradés de fond des différents écrans. */
export const gradients = {
  accueil: ['#cfe3ff', '#e6d9ff', '#ffe2ef'],
  lettres: ['#d7e6ff', '#cfd8ff'],
  chiffres: ['#ffe6d1', '#ffd9e6'],
  compter: ['#d6f5e3', '#d3ecff'],
  ecoute: ['#e8dcff', '#ffe0f0'],
  mots: ['#fff0cf', '#ffdcd6'],
  memory: ['#d5f0ff', '#e2e0ff'],
} as const;

export const radius = {
  s: 14,
  m: 22,
  l: 28,
  rond: 999,
};

/** Ombre portée cohérente entre iOS et Android. */
export function shadow(elevation = 4) {
  return {
    shadowColor: '#2b2d5b',
    shadowOpacity: 0.22,
    shadowRadius: elevation * 2,
    shadowOffset: { width: 0, height: elevation },
    elevation,
  };
}

export const font = {
  titre: 30,
  sousTitre: 20,
  corps: 16,
  petit: 13,
};
