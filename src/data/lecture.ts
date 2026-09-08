/**
 * Contenu des deux jeux de lecture.
 *
 * « Les sons » travaille la conscience phonologique : associer un mot au son
 * qui le commence, et inversement. Les mots ont été choisis pour que la lettre
 * initiale se prononce de sa façon la plus régulière — pas de « chat » pour le
 * C (qui se dit [ʃ]), pas de H muet, pas de mot commençant par une lettre dont
 * le son varie.
 *
 * « Je lis » suit la progression classique : d’abord des syllabes simples
 * consonne + voyelle, puis des mots courants découpés en syllabes.
 */

export type MotSon = { lettre: string; mot: string; emoji: string };

/** Mots rangés par son initial. */
export const MOTS_PAR_SON: MotSon[] = [
  { lettre: 'A', mot: 'avion', emoji: '✈️' },
  { lettre: 'A', mot: 'abeille', emoji: '🐝' },
  { lettre: 'A', mot: 'ananas', emoji: '🍍' },
  { lettre: 'B', mot: 'banane', emoji: '🍌' },
  { lettre: 'B', mot: 'ballon', emoji: '🎈' },
  { lettre: 'B', mot: 'bateau', emoji: '⛵' },
  { lettre: 'C', mot: 'carotte', emoji: '🥕' },
  { lettre: 'C', mot: 'canard', emoji: '🦆' },
  { lettre: 'C', mot: 'cadeau', emoji: '🎁' },
  { lettre: 'D', mot: 'dauphin', emoji: '🐬' },
  { lettre: 'D', mot: 'dé', emoji: '🎲' },
  { lettre: 'D', mot: 'dragon', emoji: '🐉' },
  { lettre: 'F', mot: 'fleur', emoji: '🌸' },
  { lettre: 'F', mot: 'fraise', emoji: '🍓' },
  { lettre: 'F', mot: 'fusée', emoji: '🚀' },
  { lettre: 'G', mot: 'gâteau', emoji: '🎂' },
  { lettre: 'G', mot: 'guitare', emoji: '🎸' },
  { lettre: 'G', mot: 'gomme', emoji: '🧽' },
  { lettre: 'J', mot: 'jus', emoji: '🧃' },
  { lettre: 'J', mot: 'jouet', emoji: '🧸' },
  { lettre: 'K', mot: 'koala', emoji: '🐨' },
  { lettre: 'K', mot: 'kiwi', emoji: '🥝' },
  { lettre: 'L', mot: 'lune', emoji: '🌙' },
  { lettre: 'L', mot: 'lion', emoji: '🦁' },
  { lettre: 'L', mot: 'livre', emoji: '📚' },
  { lettre: 'M', mot: 'maison', emoji: '🏠' },
  { lettre: 'M', mot: 'main', emoji: '✋' },
  { lettre: 'M', mot: 'montagne', emoji: '⛰️' },
  { lettre: 'N', mot: 'nuage', emoji: '☁️' },
  { lettre: 'N', mot: 'nid', emoji: '🪹' },
  { lettre: 'O', mot: 'orange', emoji: '🍊' },
  { lettre: 'O', mot: 'ours', emoji: '🐻' },
  { lettre: 'O', mot: 'oiseau', emoji: '🐦' },
  { lettre: 'P', mot: 'pomme', emoji: '🍎' },
  { lettre: 'P', mot: 'poisson', emoji: '🐟' },
  { lettre: 'P', mot: 'papillon', emoji: '🦋' },
  { lettre: 'R', mot: 'renard', emoji: '🦊' },
  { lettre: 'R', mot: 'robot', emoji: '🤖' },
  { lettre: 'R', mot: 'raisin', emoji: '🍇' },
  { lettre: 'S', mot: 'soleil', emoji: '☀️' },
  { lettre: 'S', mot: 'souris', emoji: '🐭' },
  { lettre: 'S', mot: 'serpent', emoji: '🐍' },
  { lettre: 'T', mot: 'tortue', emoji: '🐢' },
  { lettre: 'T', mot: 'train', emoji: '🚂' },
  { lettre: 'T', mot: 'tomate', emoji: '🍅' },
  { lettre: 'V', mot: 'vache', emoji: '🐮' },
  { lettre: 'V', mot: 'vélo', emoji: '🚲' },
  { lettre: 'V', mot: 'voiture', emoji: '🚗' },
  { lettre: 'Z', mot: 'zèbre', emoji: '🦓' },
];

/** Les lettres pour lesquelles on dispose d’au moins deux mots-repères. */
export const LETTRES_SONS = Array.from(new Set(MOTS_PAR_SON.map((m) => m.lettre)));

/**
 * Syllabes simples, rangées par consonne. On commence par les consonnes
 * « longues » (m, l, s, r, f) qui se prolongent facilement à voix haute et
 * rendent la fusion plus audible pour l’enfant.
 */
export const SYLLABES: string[][] = [
  ['MA', 'ME', 'MI', 'MO', 'MU'],
  ['LA', 'LE', 'LI', 'LO', 'LU'],
  ['SA', 'SE', 'SI', 'SO', 'SU'],
  ['RA', 'RE', 'RI', 'RO', 'RU'],
  ['FA', 'FE', 'FI', 'FO', 'FU'],
  ['PA', 'PE', 'PI', 'PO', 'PU'],
  ['TA', 'TE', 'TI', 'TO', 'TU'],
  ['BA', 'BE', 'BI', 'BO', 'BU'],
  ['VA', 'VE', 'VI', 'VO', 'VU'],
  ['DA', 'DE', 'DI', 'DO', 'DU'],
  ['NA', 'NE', 'NI', 'NO', 'NU'],
];

export const TOUTES_SYLLABES = SYLLABES.flat();

export type MotLu = {
  mot: string;
  emoji: string;
  /** Découpage en syllabes, lu à voix haute morceau par morceau. */
  syllabes: string[];
  /** Article utilisé quand on prononce le mot en entier. */
  parle: string;
};

/** Mots à déchiffrer, du plus simple au plus long. */
export const MOTS_A_LIRE: MotLu[] = [
  { mot: 'LUNE', emoji: '🌙', syllabes: ['LU', 'NE'], parle: 'la lune' },
  { mot: 'MOTO', emoji: '🛵', syllabes: ['MO', 'TO'], parle: 'la moto' },
  { mot: 'VÉLO', emoji: '🚲', syllabes: ['VÉ', 'LO'], parle: 'le vélo' },
  { mot: 'PIZZA', emoji: '🍕', syllabes: ['PIZ', 'ZA'], parle: 'la pizza' },
  { mot: 'LAPIN', emoji: '🐰', syllabes: ['LA', 'PIN'], parle: 'le lapin' },
  { mot: 'ROBOT', emoji: '🤖', syllabes: ['RO', 'BOT'], parle: 'le robot' },
  { mot: 'VACHE', emoji: '🐮', syllabes: ['VA', 'CHE'], parle: 'la vache' },
  { mot: 'POULE', emoji: '🐔', syllabes: ['POU', 'LE'], parle: 'la poule' },
  { mot: 'FUSÉE', emoji: '🚀', syllabes: ['FU', 'SÉE'], parle: 'la fusée' },
  { mot: 'CANARD', emoji: '🦆', syllabes: ['CA', 'NARD'], parle: 'le canard' },
  { mot: 'TORTUE', emoji: '🐢', syllabes: ['TOR', 'TUE'], parle: 'la tortue' },
  { mot: 'SOLEIL', emoji: '☀️', syllabes: ['SO', 'LEIL'], parle: 'le soleil' },
  { mot: 'BANANE', emoji: '🍌', syllabes: ['BA', 'NA', 'NE'], parle: 'la banane' },
  { mot: 'TOMATE', emoji: '🍅', syllabes: ['TO', 'MA', 'TE'], parle: 'la tomate' },
  { mot: 'SALADE', emoji: '🥗', syllabes: ['SA', 'LA', 'DE'], parle: 'la salade' },
  { mot: 'CADEAU', emoji: '🎁', syllabes: ['CA', 'DEAU'], parle: 'le cadeau' },
  { mot: 'CHEVAL', emoji: '🐴', syllabes: ['CHE', 'VAL'], parle: 'le cheval' },
  { mot: 'MAISON', emoji: '🏠', syllabes: ['MAI', 'SON'], parle: 'la maison' },
  { mot: 'BALLON', emoji: '🎈', syllabes: ['BAL', 'LON'], parle: 'le ballon' },
  { mot: 'POISSON', emoji: '🐟', syllabes: ['POIS', 'SON'], parle: 'le poisson' },
  { mot: 'GUITARE', emoji: '🎸', syllabes: ['GUI', 'TA', 'RE'], parle: 'la guitare' },
  { mot: 'CHAPEAU', emoji: '🎩', syllabes: ['CHA', 'PEAU'], parle: 'le chapeau' },
  { mot: 'BALEINE', emoji: '🐳', syllabes: ['BA', 'LEI', 'NE'], parle: 'la baleine' },
  { mot: 'PAPILLON', emoji: '🦋', syllabes: ['PA', 'PIL', 'LON'], parle: 'le papillon' },
];
