/** Petites aides de tirage aléatoire partagées par les jeux. */

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function shuffle<T>(list: readonly T[]): T[] {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Entier aléatoire dans l’intervalle fermé [min, max]. */
export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Construit une liste de propositions contenant la bonne réponse et des
 * leurres pris dans `pool`, le tout mélangé.
 */
export function makeChoices<T>(correct: T, pool: readonly T[], total: number): T[] {
  const others = shuffle(pool.filter((v) => v !== correct)).slice(0, Math.max(0, total - 1));
  return shuffle([correct, ...others]);
}
