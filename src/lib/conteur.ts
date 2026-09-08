/**
 * Le conteur : il assemble une histoire à partir des éléments de
 * data/histoires.ts, en y installant le héros composé par l’enfant.
 *
 * Tout se passe sur l’appareil. Le scénario est tiré au sort une fois pour
 * toutes (décor, compagnon, objet perdu, cachettes, formulations) ; les deux
 * choix de l’enfant ne décident pas de l’issue — à cet âge on ne perd pas —
 * mais changent le chemin et le texte.
 */

import { Avatar, nomHeros } from '../data/avatar';
import {
  Cachette, Compagnon, Decor, FINS, Geste, GESTES, Objet, OBJETS, OUVERTURES,
  PERTES, RENCONTRES, RETOURS, TROUVAILLES,
} from '../data/histoires';
import { pick, shuffle } from './random';

export type Choix = { libelle: string; emoji: string };

export type PageHistoire = {
  texte: string;
  emoji: string;
  /** Présent uniquement sur les deux pages où l’enfant décide. */
  choix?: Choix[];
};

export type Scenario = {
  decor: Decor;
  compagnon: Compagnon;
  objet: Objet;
  gestes: [Geste, Geste];
  cachettes: [Cachette, Cachette];
  ouverture: string;
  rencontre: string;
  perte: string;
  trouvaille: string;
  retour: string;
  fin: string;
};

export function tirerScenario(decor: Decor): Scenario {
  const gestes = shuffle(GESTES).slice(0, 2) as [Geste, Geste];
  const cachettes = shuffle(decor.cachettes).slice(0, 2) as [Cachette, Cachette];
  return {
    decor,
    compagnon: pick(decor.compagnons),
    objet: pick(OBJETS),
    gestes,
    cachettes,
    ouverture: pick(OUVERTURES),
    rencontre: pick(RENCONTRES),
    perte: pick(PERTES),
    trouvaille: pick(TROUVAILLES),
    retour: pick(RETOURS),
    fin: pick(FINS),
  };
}

/**
 * Contracte la préposition « à » avec l’article du nom qui suit :
 * « à le crabe » n’existe pas, on dit « au crabe ». Les noms élidés
 * (« l’aigle ») et les prénoms sont laissés tels quels.
 */
function aveC(nom: string): string {
  if (nom.startsWith('le ')) return `au ${nom.slice(3)}`;
  if (nom.startsWith('les ')) return `aux ${nom.slice(4)}`;
  return `à ${nom}`;
}

/**
 * Remplace les marques du gabarit puis remet une majuscule en tête de chaque
 * phrase : les gabarits peuvent ainsi commencer par « {C} » sans que l’on ait
 * à écrire deux variantes du compagnon.
 */
function remplir(
  gabarit: string,
  avatar: Avatar,
  s: Scenario,
  cachette?: Cachette,
): string {
  const texte = gabarit
    .replace(/\{aH\}/g, aveC(nomHeros(avatar)))
    .replace(/\{aC\}/g, aveC(s.compagnon.defini))
    .replace(/\{H\}/g, nomHeros(avatar))
    .replace(/\{e\}/g, avatar.accord === 'feminin' ? 'e' : '')
    .replace(/\{L\}/g, s.decor.lieu)
    .replace(/\{D\}/g, s.decor.situe)
    .replace(/\{C\}/g, s.compagnon.defini)
    .replace(/\{Ci\}/g, s.compagnon.indefini)
    .replace(/\{O\}/g, s.objet.defini)
    .replace(/\{K\}/g, cachette?.texte ?? '');

  return majusculesDePhrase(texte);
}

/**
 * Met une capitale en tête du texte, après un point, un point d’exclamation ou
 * d’interrogation, après un retour à la ligne, et après un guillemet ouvrant.
 *
 * Volontairement pas après « … », qui sépare deux morceaux d’une même phrase,
 * ni après un guillemet fermant, souvent suivi d’une incise minuscule
 * (« Au secours ! » dit le crabe).
 */
function majusculesDePhrase(texte: string): string {
  return texte.replace(
    /(^|[.!?]\s+|\n|«\s)([a-zàâäéèêëîïôöùûüç])/g,
    (_, avant: string, lettre: string) => avant + lettre.toUpperCase(),
  );
}

export function titreHistoire(avatar: Avatar, s: Scenario): string {
  return `${nomHeros(avatar)} et ${s.compagnon.defini}`;
}

/**
 * Construit les pages connues à ce stade du récit. Tant qu’un choix n’a pas
 * été fait, la page correspondante porte les boutons et le récit s’arrête là.
 */
export function construirePages(
  avatar: Avatar,
  s: Scenario,
  geste?: number,
  cachette?: number,
): PageHistoire[] {
  const pages: PageHistoire[] = [
    { texte: remplir(s.ouverture, avatar, s), emoji: s.decor.emoji },
    {
      texte: `${remplir(s.rencontre, avatar, s)}\nQue fait ${nomHeros(avatar)} ?`,
      emoji: s.compagnon.emoji,
      choix: geste === undefined
        ? s.gestes.map((g) => ({ libelle: g.libelle, emoji: g.emoji }))
        : undefined,
    },
  ];
  if (geste === undefined) return pages;

  pages.push({
    texte: `${remplir(s.gestes[geste].suite, avatar, s)}\n${remplir(s.perte, avatar, s)}`,
    emoji: s.compagnon.emoji,
  });
  pages.push({
    texte: `Où chercher ${s.objet.defini} ?`,
    emoji: '🔍',
    choix: cachette === undefined
      ? s.cachettes.map((c) => ({ libelle: c.texte, emoji: c.emoji }))
      : undefined,
  });
  if (cachette === undefined) return pages;

  const lieu = s.cachettes[cachette];
  pages.push({ texte: remplir(s.trouvaille, avatar, s, lieu), emoji: s.objet.emoji });
  pages.push({ texte: remplir(s.retour, avatar, s), emoji: s.compagnon.emoji });
  pages.push({ texte: `${remplir(s.fin, avatar, s)}\nFIN`, emoji: '⭐' });
  return pages;
}

/** Nombre total de pages une fois les deux choix faits. */
export const PAGES_TOTAL = 7;
