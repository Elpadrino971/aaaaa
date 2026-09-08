/**
 * Matière première des histoires.
 *
 * Le conteur (lib/conteur.ts) pioche ici un décor, un compagnon, un objet
 * perdu et deux cachettes, puis assemble le tout. Six décors × quatre
 * compagnons × six objets × quatre gestes × les variantes de formulation
 * donnent des milliers d’histoires possibles, toutes cohérentes, sans le
 * moindre appel réseau.
 *
 * Les phrases sont volontairement courtes et écrites avec le vocabulaire des
 * jeux de lecture : une histoire doit rester déchiffrable par un enfant de
 * grande section.
 */

export type Compagnon = {
  /** Forme définie, telle qu’elle s’insère dans une phrase : « le renard ». */
  defini: string;
  /** Forme indéfinie : « un renard ». */
  indefini: string;
  emoji: string;
};

export type Cachette = { texte: string; emoji: string };

export type Decor = {
  id: string;
  /** Nom court affiché sur la carte de choix. */
  nom: string;
  /** Forme insérée après un verbe de mouvement : « vers la grande forêt ». */
  lieu: string;
  /**
   * Forme locative complète, préposition comprise : « dans la grande forêt »
   * mais « sur la plage dorée ». Stockée plutôt que calculée, parce que le
   * choix de la préposition dépend du lieu et non de sa grammaire.
   */
  situe: string;
  emoji: string;
  degrade: readonly string[];
  compagnons: Compagnon[];
  cachettes: Cachette[];
};

export const DECORS: Decor[] = [
  {
    id: 'foret',
    nom: 'La forêt',
    lieu: 'la grande forêt',
    situe: 'dans la grande forêt',
    emoji: '🌲',
    degrade: ['#d9f0d5', '#c9e8ef'],
    compagnons: [
      { defini: 'le renard', indefini: 'un renard', emoji: '🦊' },
      { defini: 'le hibou', indefini: 'un hibou', emoji: '🦉' },
      { defini: "l’écureuil", indefini: 'un écureuil', emoji: '🐿️' },
      { defini: 'le petit cerf', indefini: 'un petit cerf', emoji: '🦌' },
    ],
    cachettes: [
      { texte: 'sous le grand arbre', emoji: '🌳' },
      { texte: 'près de la rivière', emoji: '💧' },
      { texte: 'dans les hautes herbes', emoji: '🌾' },
      { texte: 'au creux du vieux tronc', emoji: '🪵' },
    ],
  },
  {
    id: 'chateau',
    nom: 'Le château',
    lieu: 'le vieux château',
    situe: 'dans le vieux château',
    emoji: '🏰',
    degrade: ['#e6ddf7', '#d7dcf0'],
    compagnons: [
      { defini: 'le dragon', indefini: 'un dragon', emoji: '🐉' },
      { defini: 'le chat noir', indefini: 'un chat noir', emoji: '🐈‍⬛' },
      { defini: 'la petite souris', indefini: 'une petite souris', emoji: '🐭' },
      { defini: 'la licorne', indefini: 'une licorne', emoji: '🦄' },
    ],
    cachettes: [
      { texte: 'dans la grande tour', emoji: '🗼' },
      { texte: "sous l’escalier", emoji: '🪜' },
      { texte: 'derrière le rideau', emoji: '🎭' },
      { texte: 'dans la cuisine', emoji: '🍲' },
    ],
  },
  {
    id: 'mer',
    nom: 'La plage',
    lieu: 'la plage dorée',
    situe: 'sur la plage dorée',
    emoji: '🏖️',
    degrade: ['#fdf0cf', '#cfe8fb'],
    compagnons: [
      { defini: 'le dauphin', indefini: 'un dauphin', emoji: '🐬' },
      { defini: 'le crabe', indefini: 'un crabe', emoji: '🦀' },
      { defini: 'la tortue', indefini: 'une tortue', emoji: '🐢' },
      { defini: 'le poisson doré', indefini: 'un poisson doré', emoji: '🐠' },
    ],
    cachettes: [
      { texte: 'sous le gros rocher', emoji: '🪨' },
      { texte: 'dans le vieux bateau', emoji: '🛶' },
      { texte: "au fond de l’eau", emoji: '🌊' },
      { texte: 'sous le parasol', emoji: '⛱️' },
    ],
  },
  {
    id: 'espace',
    nom: 'Les étoiles',
    lieu: 'le ciel des étoiles',
    situe: 'dans le ciel des étoiles',
    emoji: '🌌',
    degrade: ['#d8d5f7', '#e9d7f0'],
    compagnons: [
      { defini: 'le robot', indefini: 'un robot', emoji: '🤖' },
      { defini: 'la comète', indefini: 'une comète', emoji: '☄️' },
      { defini: 'le petit alien', indefini: 'un petit alien', emoji: '👽' },
      { defini: 'la lune', indefini: 'une lune', emoji: '🌙' },
    ],
    cachettes: [
      { texte: 'dans la fusée', emoji: '🚀' },
      { texte: 'sur la lune', emoji: '🌕' },
      { texte: 'derrière la planète', emoji: '🪐' },
      { texte: "dans le nuage d’étoiles", emoji: '✨' },
    ],
  },
  {
    id: 'jungle',
    nom: 'La jungle',
    lieu: 'la jungle verte',
    situe: 'dans la jungle verte',
    emoji: '🌴',
    degrade: ['#d7f0dd', '#f7f0cf'],
    compagnons: [
      { defini: 'le singe', indefini: 'un singe', emoji: '🐵' },
      { defini: 'le perroquet', indefini: 'un perroquet', emoji: '🦜' },
      { defini: 'le tigre', indefini: 'un tigre', emoji: '🐯' },
      { defini: 'la grenouille', indefini: 'une grenouille', emoji: '🐸' },
    ],
    cachettes: [
      { texte: 'dans la cabane', emoji: '🛖' },
      { texte: 'sous la grande feuille', emoji: '🍃' },
      { texte: 'près de la cascade', emoji: '💦' },
      { texte: 'dans le vieux puits', emoji: '🪣' },
    ],
  },
  {
    id: 'montagne',
    nom: 'La montagne',
    lieu: 'la haute montagne',
    situe: 'sur la haute montagne',
    emoji: '⛰️',
    degrade: ['#dfe9f7', '#f0e4dd' ],
    compagnons: [
      { defini: "l’aigle", indefini: 'un aigle', emoji: '🦅' },
      { defini: 'la chèvre', indefini: 'une chèvre', emoji: '🐐' },
      { defini: "l’ours brun", indefini: 'un ours brun', emoji: '🐻' },
      { defini: 'le renard blanc', indefini: 'un renard blanc', emoji: '🦊' },
    ],
    cachettes: [
      { texte: 'dans la grotte', emoji: '🕳️' },
      { texte: 'sous la neige', emoji: '❄️' },
      { texte: 'près du lac gelé', emoji: '🧊' },
      { texte: 'sur le grand rocher', emoji: '🪨' },
    ],
  },
];

export type Objet = { defini: string; emoji: string };

/** Ce que le compagnon a perdu, et que le héros va retrouver. */
export const OBJETS: Objet[] = [
  { defini: "la clé d’or", emoji: '🔑' },
  { defini: 'la carte au trésor', emoji: '🗺️' },
  { defini: 'le coquillage magique', emoji: '🐚' },
  { defini: 'la plume dorée', emoji: '🪶' },
  { defini: 'la lanterne bleue', emoji: '🏮' },
  { defini: 'le petit tambour', emoji: '🥁' },
];

export type Geste = {
  /** Libellé du bouton de choix. */
  libelle: string;
  emoji: string;
  /** Ce qui se passe ensuite. */
  suite: string;
};

/** Les façons d’aborder le compagnon : on en tire deux par histoire. */
export const GESTES: Geste[] = [
  { libelle: 'Dire bonjour', emoji: '👋', suite: '{H} dit : « Bonjour ! » Et {C} sourit très fort.' },
  { libelle: 'Offrir un gâteau', emoji: '🧁', suite: '{H} donne un petit gâteau. {C} le mange en deux bouchées !' },
  { libelle: 'Faire un câlin', emoji: '🤗', suite: '{H} fait un gros câlin. {C} ferme les yeux de bonheur.' },
  { libelle: 'Chanter une chanson', emoji: '🎵', suite: '{H} chante une petite chanson. {C} danse sur place !' },
];

export const OUVERTURES = [
  '{H} ouvre la porte. Le soleil brille. {H} part vers {L}.',
  'Ce matin, {H} met ses bottes. Direction {L} !',
  'Aujourd’hui, {H} part en promenade {D}.',
];

export const RENCONTRES = [
  '{D}, {H} voit {Ci}. {C} a l’air triste.',
  'Au bout du chemin, {Ci} attend. {C} ne sourit pas.',
  '{H} entend un petit bruit. C’est {Ci}, et {C} pleure.',
];

export const PERTES = [
  '{C} dit : « J’ai perdu {O} ! »',
  '{C} explique : « Je ne trouve plus {O} ! »',
  '« Au secours ! » dit {C}. « {O} a disparu. »',
];

export const TROUVAILLES = [
  '{H} cherche {K}. Et là… surprise ! {O} est là.',
  '{H} regarde {K}. Bingo ! {O} brille dans le noir.',
  '{H} fouille {K}. Youpi ! {O} était juste là.',
];

export const RETOURS = [
  '{H} donne {O} {aC}. {C} saute de joie !',
  '{H} rend {O}. {C} crie : « Merci beaucoup ! »',
  '{C} reprend {O} et fait trois tours de joie.',
];

export const FINS = [
  '{C} offre une étoile magique {aH}. {H} rentre à la maison, très content{e}.',
  'Le soir tombe. {H} rentre avec une étoile dans la poche.',
  '{C} et {H} sont amis pour toujours. {H} rentre le cœur léger.',
];
