/**
 * Le héros que l’enfant compose lui-même.
 *
 * Rien n’est photographié : le personnage est entièrement dessiné, ce qui
 * évite de faire sortir la moindre image d’enfant de l’appareil tout en
 * gardant le plaisir du « c’est moi ».
 */

export type Accord = 'masculin' | 'feminin';

export type Avatar = {
  /** Prénom du héros, saisi par un adulte. Vide = « le héros ». */
  prenom: string;
  /** Sert uniquement aux accords du récit (content / contente). */
  accord: Accord;
  teint: string;
  cheveux: string;
  couleurCheveux: string;
  yeux: string;
  costume: string;
};

export const TEINTS = [
  { id: 'clair', couleur: '#f7d7bd', ombre: '#e8bd9c' },
  { id: 'dore', couleur: '#f0c193', ombre: '#dda672' },
  { id: 'hale', couleur: '#d99b6c', ombre: '#c07f4f' },
  { id: 'ambre', couleur: '#b3703f', ombre: '#96592e' },
  { id: 'brun', couleur: '#8a5230', ombre: '#6f3f22' },
  { id: 'ebene', couleur: '#5c3520', ombre: '#452716' },
];

export const COULEURS_CHEVEUX = [
  { id: 'noir', couleur: '#2b2118' },
  { id: 'brun', couleur: '#5b3a21' },
  { id: 'chatain', couleur: '#8b5a2b' },
  { id: 'blond', couleur: '#e3b451' },
  { id: 'roux', couleur: '#c65525' },
  { id: 'blanc', couleur: '#d8d8e0' },
  { id: 'bleu', couleur: '#4a8fe0' },
  { id: 'rose', couleur: '#e879ac' },
];

/** Les coiffures sont dessinées par le composant Heros ; ici leur libellé. */
export const CHEVEUX = [
  { id: 'courts', nom: 'Courts' },
  { id: 'boucles', nom: 'Bouclés' },
  { id: 'longs', nom: 'Longs' },
  { id: 'couettes', nom: 'Couettes' },
  { id: 'chignon', nom: 'Chignon' },
  { id: 'crete', nom: 'Crête' },
  { id: 'tresses', nom: 'Tresses' },
];

export const YEUX = [
  { id: 'ronds', nom: 'Ronds' },
  { id: 'rieurs', nom: 'Rieurs' },
  { id: 'etoiles', nom: 'Étoilés' },
];

export type Costume = {
  id: string;
  nom: string;
  emoji: string;
  /** Couleur du haut. */
  haut: string;
  /** Couleur du bas. */
  bas: string;
  /** Couleur de la cape, quand il y en a une. */
  cape?: string;
  /** Couvre-chef dessiné par le composant Heros. */
  couvreChef?: 'casque' | 'bulle' | 'bandana' | 'pointu' | 'brousse';
};

export const COSTUMES: Costume[] = [
  { id: 'super', nom: 'Super-héros', emoji: '⚡', haut: '#4a6df5', bas: '#2f49b5', cape: '#e5484d' },
  { id: 'chevalier', nom: 'Chevalier', emoji: '🛡️', haut: '#9aa4bf', bas: '#6b7490', couvreChef: 'casque' },
  { id: 'astronaute', nom: 'Astronaute', emoji: '🚀', haut: '#f2f4fb', bas: '#cfd5e8', couvreChef: 'bulle' },
  { id: 'pirate', nom: 'Pirate', emoji: '🏴‍☠️', haut: '#e0484d', bas: '#2f3140', couvreChef: 'bandana' },
  { id: 'magicien', nom: 'Magicien', emoji: '✨', haut: '#8b5bf5', bas: '#5b3ab0', cape: '#f0c04a', couvreChef: 'pointu' },
  { id: 'explorateur', nom: 'Explorateur', emoji: '🧭', haut: '#c8a659', bas: '#7d6a3a', couvreChef: 'brousse' },
];

export const AVATAR_PAR_DEFAUT: Avatar = {
  prenom: '',
  accord: 'masculin',
  teint: 'dore',
  cheveux: 'courts',
  couleurCheveux: 'brun',
  yeux: 'ronds',
  costume: 'super',
};

export function costumeDe(id: string): Costume {
  return COSTUMES.find((c) => c.id === id) ?? COSTUMES[0];
}

export function teintDe(id: string) {
  return TEINTS.find((t) => t.id === id) ?? TEINTS[1];
}

export function couleurCheveuxDe(id: string) {
  return COULEURS_CHEVEUX.find((c) => c.id === id) ?? COULEURS_CHEVEUX[1];
}

/** Nom d’usage du personnage dans les histoires. */
export function nomHeros(avatar: Avatar): string {
  const prenom = avatar.prenom.trim();
  if (prenom) return prenom;
  return avatar.accord === 'feminin' ? "l’héroïne" : 'le héros';
}
