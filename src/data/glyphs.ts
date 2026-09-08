/**
 * Tracés des lettres majuscules et des chiffres.
 *
 * Chaque signe est une liste de traits, dans l'ordre où on apprend à les
 * écrire, et chaque trait est un chemin SVG exprimé dans un repère carré de
 * 100 x 100 (origine en haut à gauche). Les lettres occupent la zone
 * x ∈ [20, 80], y ∈ [12, 88], ce qui laisse une marge confortable au doigt.
 */

export type GlyphKind = 'letters' | 'digits';

const LETTERS: Record<string, string[]> = {
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

const DIGITS: Record<string, string[]> = {
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

export const LETTER_LIST = Object.keys(LETTERS);
export const DIGIT_LIST = Object.keys(DIGITS);

export function glyphList(kind: GlyphKind): string[] {
  return kind === 'digits' ? DIGIT_LIST : LETTER_LIST;
}

export function glyphStrokes(kind: GlyphKind, ch: string): string[] {
  const table = kind === 'digits' ? DIGITS : LETTERS;
  return table[ch] ?? [];
}
