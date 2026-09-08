/**
 * Tracés des lettres et des chiffres, dans les trois écritures enseignées à
 * l'école maternelle et au CP :
 *
 *   • capitales — les majuscules d'imprimerie (A B C), première écriture apprise ;
 *   • script    — les minuscules d'imprimerie (a b c), celle des livres ;
 *   • cursive   — l'écriture attachée (𝑎 𝑏 𝑐), celle du cahier.
 *
 * Chaque signe est une liste de traits, dans l'ordre où on apprend à les
 * écrire, et chaque trait est un chemin SVG exprimé dans un repère carré de
 * 100 x 100 (origine en haut à gauche).
 *
 * Les minuscules partagent une réglure commune, ce qui permet d'afficher le
 * même cahier derrière les deux écritures :
 *
 *   y =  14  haut des lettres montantes (l, b, h…) et des capitales
 *   y =  48  hauteur des petites lettres (a, o, e…)
 *   y =  82  ligne d'écriture
 *   y =  93  bas des lettres descendantes (g, j, p…)
 */

export type Ecriture = 'capitales' | 'script' | 'cursive' | 'chiffres';

/** Réglure d'une écriture, en unités du repère 0-100. */
export type Reglure = {
  /** Haut des lettres montantes. */
  montante: number;
  /** Hauteur des petites lettres ; égale à `montante` quand il n'y en a pas. */
  petite: number;
  /** Ligne d'écriture. */
  ligne: number;
  /** Bas des lettres descendantes ; égal à `ligne` quand il n'y en a pas. */
  descendante: number;
};

const CAPITALES: Record<string, string[]> = {
  A: ['M20 88 L50 12 L80 88', 'M31 60 H69'],
  B: ['M30 12 V88', 'M30 12 H55 A19 19 0 0 1 55 50 H30', 'M30 50 H59 A19 19 0 0 1 59 88 H30'],
  C: ['M74 26 A32 38 0 1 0 74 74'],
  D: ['M30 12 V88', 'M30 12 H48 A38 38 0 0 1 48 88 H30'],
  E: ['M30 12 V88', 'M30 12 H73', 'M30 50 H64', 'M30 88 H73'],
  F: ['M30 12 V88', 'M30 12 H73', 'M30 50 H64'],
  G: ['M74 26 A32 38 0 1 0 79 63', 'M79 63 V49 H57'],
  H: ['M28 12 V88', 'M72 12 V88', 'M28 50 H72'],
  I: ['M34 12 H66', 'M50 12 V88', 'M34 88 H66'],
  J: ['M65 12 V68 A18 20 0 0 1 29 68'],
  K: ['M30 12 V88', 'M72 12 L30 52', 'M44 42 L74 88'],
  L: ['M32 12 V88 H75'],
  M: ['M25 88 V12 L50 56 L75 12 V88'],
  N: ['M28 88 V12 L72 88 V12'],
  O: ['M50 12 A30 38 0 1 0 50 88 A30 38 0 1 0 50 12'],
  P: ['M30 12 V88', 'M30 12 H55 A19 19 0 0 1 55 50 H30'],
  Q: ['M50 12 A30 38 0 1 0 50 88 A30 38 0 1 0 50 12', 'M60 66 L82 90'],
  R: ['M30 12 V88', 'M30 12 H55 A19 19 0 0 1 55 50 H30', 'M32 50 L74 88'],
  S: ['M72 27 C70 14 30 12 30 34 C30 50 70 48 70 66 C70 88 32 87 28 73'],
  T: ['M22 12 H78', 'M50 12 V88'],
  U: ['M28 12 V62 A22 26 0 0 0 72 62 V12'],
  V: ['M25 12 L50 88 L75 12'],
  W: ['M20 12 L34 88 L50 36 L66 88 L80 12'],
  X: ['M26 12 L74 88', 'M74 12 L26 88'],
  Y: ['M28 12 L50 50 L72 12', 'M50 50 V88'],
  Z: ['M26 12 H74 L26 88 H74'],
};

/**
 * Minuscules d'imprimerie. Les lettres rondes (a, b, d, g, o, p, q) partagent
 * le même cercle, centré en (50, 65) et de rayon 17 : il va donc exactement de
 * la hauteur des petites lettres à la ligne d'écriture.
 */
const SCRIPT: Record<string, string[]> = {
  a: ['M50 48 A17 17 0 1 0 50 82 A17 17 0 1 0 50 48', 'M67 48 V82'],
  b: ['M33 14 V82', 'M33 65 A17 17 0 1 1 67 65 A17 17 0 1 1 33 65'],
  c: ['M63 54 A17 17 0 1 0 63 76'],
  d: ['M50 48 A17 17 0 1 0 50 82 A17 17 0 1 0 50 48', 'M67 14 V82'],
  e: ['M34 66 H66 A17 17 0 1 0 62 77'],
  f: ['M60 24 C56 15 45 16 45 28 V82', 'M33 48 H59'],
  g: ['M50 48 A17 17 0 1 0 50 82 A17 17 0 1 0 50 48', 'M67 48 V86 C67 93 58 96 50 91'],
  h: ['M33 14 V82', 'M33 62 A17 14 0 0 1 67 62 V82'],
  i: ['M50 48 V82', 'M50 30 V37'],
  j: ['M54 48 V86 C54 93 45 96 37 91', 'M54 30 V37'],
  k: ['M33 14 V82', 'M65 50 L33 68', 'M45 61 L67 82'],
  l: ['M42 14 V82'],
  m: [
    'M30 48 V82',
    'M30 60 A12 12 0 0 1 54 60 V82',
    'M54 60 A12 12 0 0 1 78 60 V82',
  ],
  n: ['M33 48 V82', 'M33 62 A17 14 0 0 1 67 62 V82'],
  o: ['M50 48 A17 17 0 1 0 50 82 A17 17 0 1 0 50 48'],
  p: ['M33 48 V93', 'M33 65 A17 17 0 1 1 67 65 A17 17 0 1 1 33 65'],
  q: ['M50 48 A17 17 0 1 0 50 82 A17 17 0 1 0 50 48', 'M67 48 V93'],
  r: ['M36 48 V82', 'M36 61 C36 51 50 46 63 49'],
  s: ['M64 54 C58 46 36 47 36 57 C36 66 64 65 64 74 C64 84 40 84 36 76'],
  t: ['M46 22 V73 C46 81 56 84 63 78', 'M32 48 H60'],
  u: ['M33 48 V70 A17 12 0 0 0 67 70 V48', 'M67 48 V82'],
  v: ['M33 48 L50 82 L67 48'],
  w: ['M28 48 L39 82 L50 55 L61 82 L72 48'],
  x: ['M34 48 L66 82', 'M66 48 L34 82'],
  y: ['M33 48 L51 76', 'M67 48 L44 93'],
  z: ['M34 48 H66 L34 82 H66'],
};

/**
 * Écriture attachée. Chaque lettre commence par une attaque qui monte de la
 * ligne d'écriture et se termine par une sortie qui repart vers la droite :
 * c'est ce qui permettra plus tard de lier les lettres entre elles.
 *
 * Les lettres rondes (a, c, d, g, o, q) utilisent le même ovale, centré en
 * (39, 65) et de demi-axes 11 et 17, parcouru dans le sens inverse des
 * aiguilles d'une montre comme on l'apprend à l'école.
 */
const CURSIVE: Record<string, string[]> = {
  a: ['M16 82 C22 77 33 57 44.5 50.3 A11 17 0 1 0 33.5 79.7 A11 17 0 1 0 44.5 50.3 C48 55 50 66 50 82 C54 87 60 85 66 76'],
  b: ['M16 78 C22 74 31 58 38 40 C42 30 43 18 39 17 C35 16 32 26 34 42 C36 60 35 72 36 78 C42 84 52 84 58 76 C63 69 61 58 53 56 C45 54 39 61 38 69 C41 77 50 82 62 78'],
  c: ['M16 82 C24 76 32 58 44 51 C52 47 58 51 55 56 C50 52 40 54 36 62 C31 71 36 81 46 81 C53 81 58 79 64 75'],
  d: ['M16 82 C22 77 33 57 44.5 50.3 A11 17 0 1 0 33.5 79.7 A11 17 0 1 0 44.5 50.3 C48 42 52 26 55 17 C56 32 52 60 52 82 C56 87 62 85 68 76'],
  e: ['M18 75 C26 81 34 75 40 65 C44 58 44 50 39 50 C32 50 27 58 27 66 C27 76 35 84 45 82 C52 80 58 77 64 72'],
  f: ['M18 78 C24 72 32 54 38 36 C42 24 44 16 40 15 C35 14 33 24 34 40 C36 58 36 74 34 84 C33 92 28 96 23 93 C19 90 21 85 28 84 C40 82 52 80 62 76'],
  g: ['M16 82 C22 76 32 58 44.5 50.3 A11 17 0 1 0 33.5 79.7 A11 17 0 1 0 44.5 50.3 C48 58 50 72 49 84 C48 92 42 96 36 93 C31 90 33 85 40 84 C50 82 58 80 66 76'],
  h: ['M16 78 C22 74 31 58 38 40 C42 30 43 18 39 17 C35 16 32 26 34 42 C36 60 36 74 36 80 C36 66 42 50 50 50 C56 50 58 62 58 80 C62 86 70 84 76 76'],
  i: ['M16 82 C22 76 29 62 34 50 C36 61 36 72 38 80 C42 86 50 84 56 76', 'M34 33 V40'],
  j: ['M16 82 C22 76 28 64 33 52 C35 64 37 76 36 86 C35 93 30 96 25 93 C21 90 23 85 30 84 C40 82 50 80 58 76', 'M33 34 V41'],
  k: [
    'M16 78 C22 74 31 58 38 40 C42 30 43 18 39 17 C35 16 32 26 34 42 C36 60 36 74 36 80',
    'M36 70 C44 66 52 58 58 50 C52 60 47 66 44 70 C50 73 56 78 62 80 C68 82 72 80 76 76',
  ],
  l: ['M16 78 C22 74 31 58 38 40 C42 30 43 18 39 17 C35 16 32 26 34 42 C36 60 36 74 36 80 C40 86 48 84 54 76'],
  m: ['M14 82 C18 74 24 60 28 50 C30 60 30 72 30 80 C30 66 36 50 44 50 C49 50 50 62 50 80 C50 66 56 50 64 50 C69 50 70 62 70 80 C74 86 80 84 84 76'],
  n: ['M16 82 C20 74 26 60 30 50 C32 60 32 72 32 80 C32 66 38 50 46 50 C51 50 52 62 52 80 C56 86 64 84 70 76'],
  o: ['M16 82 C22 77 33 57 44.5 50.3 A11 17 0 1 0 33.5 79.7 A11 17 0 1 0 44.5 50.3 C49 52 54 57 62 55'],
  p: ['M16 78 C20 72 26 60 30 50 C32 64 32 80 30 92 C32 80 34 66 40 58 C48 50 60 54 60 64 C60 74 50 82 40 80 C48 82 58 80 66 76'],
  q: ['M16 82 C22 76 32 58 44.5 50.3 A11 17 0 1 0 33.5 79.7 A11 17 0 1 0 44.5 50.3 C48 60 50 76 50 90 C54 95 62 94 68 88 C71 85 73 81 75 78'],
  r: ['M16 82 C22 76 28 64 32 52 C33 57 33 61 32 66 C36 58 42 51 50 50 C56 49 57 54 53 56 C49 58 47 60 47 64 C47 70 48 76 50 79 C54 84 62 83 68 78'],
  s: ['M18 80 C24 74 31 64 35 50 C38 57 36 62 31 67 C25 73 26 80 34 80 C43 80 52 78 60 74'],
  t: ['M18 78 C24 74 32 50 38 28 C40 36 36 58 36 74 C36 82 44 84 52 76', 'M28 40 H48'],
  u: ['M16 82 C20 74 26 60 30 50 C32 61 32 72 34 80 C36 84 42 84 46 78 C50 70 52 58 54 50 C56 61 56 72 58 80 C62 86 70 84 76 76'],
  v: ['M16 82 C20 74 26 60 30 50 C32 64 34 76 37 81 C42 74 48 60 52 50 C54 58 54 62 58 62 C64 62 70 61 76 63'],
  w: ['M14 82 C17 74 22 60 26 50 C28 64 30 76 34 80 C39 74 43 60 46 50 C48 64 50 76 54 80 C59 74 63 60 66 50 C68 58 68 62 72 62 C77 62 80 61 84 64'],
  x: [
    'M18 80 C24 74 34 64 44 56 C48 53 52 51 56 50',
    'M24 52 C30 58 40 68 48 76 C52 80 58 81 64 79 C69 77 73 75 77 72',
  ],
  y: ['M16 82 C20 74 26 60 30 50 C32 62 33 73 35 80 C37 84 42 84 46 78 C50 71 53 59 55 50 C57 62 57 76 55 86 C54 93 48 96 42 93 C37 90 39 85 46 84 C56 82 64 80 72 76'],
  z: ['M16 78 C22 74 28 66 31 56 C33 60 33 64 32 69 C36 60 44 53 54 53 C51 61 45 70 40 78 C38 82 37 84 38 86 C39 91 34 95 28 93 C24 91 25 86 32 84 C43 82 55 80 66 76'],
};

const CHIFFRES: Record<string, string[]> = {
  '0': ['M50 12 A28 38 0 1 0 50 88 A28 38 0 1 0 50 12'],
  '1': ['M32 28 L50 12 V88', 'M32 88 H70'],
  '2': ['M28 30 C28 12 72 10 72 32 C72 50 34 62 28 88 H74'],
  '3': ['M28 22 C40 8 74 14 70 34 C67 47 52 48 45 48 C52 48 74 49 74 66 C74 90 36 92 27 78'],
  '4': ['M62 12 L24 62 H78', 'M62 12 V88'],
  '5': ['M70 14 H34 L30 46 C48 37 74 44 74 66 C74 90 36 92 28 78'],
  '6': ['M68 16 C44 20 28 40 28 62 C28 78 40 88 50 88 C62 88 72 79 72 66 C72 54 62 46 50 46 C40 46 32 52 28 62'],
  '7': ['M26 14 H74 L42 88'],
  '8': ['M50 48 C34 48 30 40 30 30 C30 18 40 12 50 12 C60 12 70 18 70 30 C70 40 66 48 50 48 C32 48 26 58 26 68 C26 82 38 88 50 88 C62 88 74 82 74 68 C74 58 68 48 50 48'],
  '9': ['M32 84 C56 80 72 60 72 38 C72 22 60 12 50 12 C38 12 28 21 28 34 C28 46 38 54 50 54 C60 54 68 48 72 38'],
};

const TABLES: Record<Ecriture, Record<string, string[]>> = {
  capitales: CAPITALES,
  script: SCRIPT,
  cursive: CURSIVE,
  chiffres: CHIFFRES,
};

const REGLURES: Record<Ecriture, Reglure> = {
  capitales: { montante: 12, petite: 12, ligne: 88, descendante: 88 },
  script: { montante: 14, petite: 48, ligne: 82, descendante: 93 },
  cursive: { montante: 14, petite: 48, ligne: 82, descendante: 93 },
  chiffres: { montante: 12, petite: 12, ligne: 88, descendante: 88 },
};

/** Épaisseur du chemin à suivre : plus fine quand le tracé est plus sinueux. */
const EPAISSEURS: Record<Ecriture, number> = {
  capitales: 12,
  script: 11,
  cursive: 8,
  chiffres: 12,
};

/** Étiquette courte pour les boutons de choix d'écriture. */
export const ETIQUETTES: Record<Ecriture, string> = {
  capitales: 'ABC',
  script: 'abc',
  cursive: 'Attaché',
  chiffres: '123',
};

export const ECRITURES_LETTRES: Ecriture[] = ['capitales', 'script', 'cursive'];

export function glyphList(ecriture: Ecriture): string[] {
  return Object.keys(TABLES[ecriture]);
}

export function glyphStrokes(ecriture: Ecriture, ch: string): string[] {
  return TABLES[ecriture][ch] ?? [];
}

export function reglure(ecriture: Ecriture): Reglure {
  return REGLURES[ecriture];
}

export function epaisseur(ecriture: Ecriture): number {
  return EPAISSEURS[ecriture];
}

/**
 * Capitale correspondant à un signe, quelle que soit l'écriture.
 * Sert à retrouver le mot-repère (« a comme Avion ») et à noter la
 * progression d'une même lettre d'une écriture à l'autre.
 */
export function versCapitale(ch: string): string {
  return ch.toUpperCase();
}

export const LETTER_LIST = Object.keys(CAPITALES);
export const DIGIT_LIST = Object.keys(CHIFFRES);
