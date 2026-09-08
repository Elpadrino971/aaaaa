/**
 * Contenu pédagogique : mots-repères, listes de mots, illustrations (emoji).
 * Tout est en français et embarqué dans l'application — aucune ressource
 * distante n'est nécessaire, l'app fonctionne hors ligne.
 */

/** Un mot-repère par lettre : « A comme Avion ». */
export const LETTER_WORDS: Record<string, [string, string]> = {
  A: ['Avion', '✈️'], B: ['Bateau', '⛵'], C: ['Chat', '🐱'],
  D: ['Dauphin', '🐬'], E: ['Éléphant', '🐘'], F: ['Fleur', '🌸'],
  G: ['Gâteau', '🎂'], H: ['Hibou', '🦉'], I: ['Île', '🏝️'],
  J: ['Jus', '🧃'], K: ['Koala', '🐨'], L: ['Lune', '🌙'],
  M: ['Maison', '🏠'], N: ['Nuage', '☁️'], O: ['Ours', '🐻'],
  P: ['Pomme', '🍎'], Q: ['Quille', '🎳'], R: ['Renard', '🦊'],
  S: ['Soleil', '☀️'], T: ['Tortue', '🐢'], U: ['Univers', '🌌'],
  V: ['Vélo', '🚲'], W: ['Wagon', '🚃'], X: ['Xylophone', '🎼'],
  Y: ['Yaourt', '🥛'], Z: ['Zèbre', '🦓'],
};

/** Chaque chiffre est illustré par une image répétée autant de fois. */
export const DIGIT_ICONS: Record<string, string> = {
  '0': '🕳️', '1': '🎈', '2': '🍒', '3': '🐟', '4': '⭐',
  '5': '🍓', '6': '🐞', '7': '🌈', '8': '🐙', '9': '🐝',
};

export const NUMBER_NAMES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq',
  'six', 'sept', 'huit', 'neuf', 'dix',
];

export type WordEntry = { word: string; emoji: string; spoken: string };

/** Mots à reconstituer, rangés du plus court au plus long. */
export const WORDS: WordEntry[] = [
  { word: 'CLÉ', emoji: '🔑', spoken: 'la clé' },
  { word: 'FEU', emoji: '🔥', spoken: 'le feu' },
  { word: 'ROI', emoji: '👑', spoken: 'le roi' },
  { word: 'CHAT', emoji: '🐱', spoken: 'le chat' },
  { word: 'LUNE', emoji: '🌙', spoken: 'la lune' },
  { word: 'OURS', emoji: '🐻', spoken: "l'ours" },
  { word: 'VÉLO', emoji: '🚲', spoken: 'le vélo' },
  { word: 'MAIN', emoji: '✋', spoken: 'la main' },
  { word: 'LION', emoji: '🦁', spoken: 'le lion' },
  { word: 'POMME', emoji: '🍎', spoken: 'la pomme' },
  { word: 'FLEUR', emoji: '🌸', spoken: 'la fleur' },
  { word: 'CHIEN', emoji: '🐶', spoken: 'le chien' },
  { word: 'ARBRE', emoji: '🌳', spoken: "l'arbre" },
  { word: 'VACHE', emoji: '🐮', spoken: 'la vache' },
  { word: 'PIZZA', emoji: '🍕', spoken: 'la pizza' },
  { word: 'GLACE', emoji: '🍦', spoken: 'la glace' },
  { word: 'LAPIN', emoji: '🐰', spoken: 'le lapin' },
  { word: 'TRAIN', emoji: '🚂', spoken: 'le train' },
  { word: 'ROBOT', emoji: '🤖', spoken: 'le robot' },
  { word: 'NUAGE', emoji: '☁️', spoken: 'le nuage' },
  { word: 'CANARD', emoji: '🦆', spoken: 'le canard' },
  { word: 'RENARD', emoji: '🦊', spoken: 'le renard' },
  { word: 'TORTUE', emoji: '🐢', spoken: 'la tortue' },
  { word: 'MAISON', emoji: '🏠', spoken: 'la maison' },
  { word: 'BATEAU', emoji: '⛵', spoken: 'le bateau' },
  { word: 'SOLEIL', emoji: '☀️', spoken: 'le soleil' },
  { word: 'ÉTOILE', emoji: '⭐', spoken: "l'étoile" },
  { word: 'GÂTEAU', emoji: '🎂', spoken: 'le gâteau' },
  { word: 'SOURIS', emoji: '🐭', spoken: 'la souris' },
  { word: 'BALLON', emoji: '🎈', spoken: 'le ballon' },
];

/** Objets à compter. */
export const COUNTABLES = ['🍎', '🍓', '🐟', '🎈', '⭐', '🐞', '🍪', '🐝', '🌸', '🚗', '🦋', '🐸'];

/** Cartes du jeu de mémoire. */
export const ANIMALS = [
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🦉', '🦋', '🐢', '🐝', '🦓', '🐬',
];

export const PRAISES = [
  'Bravo !', 'Super !', 'Génial !', 'Bien joué !',
  'Champion !', 'Magnifique !', 'Tu es fort !',
];

export const ENCOURAGEMENTS = [
  'Essaie encore !', 'Presque !', 'On recommence ?', 'Continue, tu vas y arriver !',
];
