/**
 * Description des écrans de l’application.
 *
 * L’arborescence est plate — un menu et neuf jeux — donc une simple union de
 * types et un état dans le composant racine suffisent : pas besoin d’embarquer
 * une bibliothèque de navigation.
 */

export type Route =
  | { nom: 'accueil' }
  | { nom: 'trace'; groupe: 'lettres' | 'chiffres' }
  | { nom: 'sons' }
  | { nom: 'lecture' }
  | { nom: 'compter' }
  | { nom: 'ecoute' }
  | { nom: 'mots' }
  | { nom: 'memory' }
  | { nom: 'heros' }
  | { nom: 'histoire' }
  | { nom: 'parents' };
