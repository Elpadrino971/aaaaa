/**
 * Description des écrans de l'application.
 *
 * L'arborescence est plate — un menu et six jeux — donc une simple union de
 * types et un état dans le composant racine suffisent : pas besoin d'embarquer
 * une bibliothèque de navigation.
 */

import { GlyphKind } from './data/glyphs';

export type Route =
  | { nom: 'accueil' }
  | { nom: 'trace'; kind: GlyphKind }
  | { nom: 'compter' }
  | { nom: 'ecoute' }
  | { nom: 'mots' }
  | { nom: 'memory' }
  | { nom: 'parents' };
