/**
 * Lecture des bruitages.
 *
 * Les six sons sont synthétisés par tools/generer-sons.py et embarqués : rien
 * à télécharger, et la banque tient en une centaine de kilo-octets.
 *
 * Un lecteur est créé par son, une seule fois, puis réutilisé : c'est ce que
 * recommande expo-audio pour rejouer un effet court sans empiler les
 * instances. Rejouer consiste à revenir au début et à relancer.
 */

import { AudioPlayer, createAudioPlayer } from 'expo-audio';

export type Son = 'pop' | 'bien' | 'bravo' | 'oups' | 'etoile' | 'page';

const SOURCES: Record<Son, number> = {
  pop: require('../../assets/sons/pop.wav'),
  bien: require('../../assets/sons/bien.wav'),
  bravo: require('../../assets/sons/bravo.wav'),
  oups: require('../../assets/sons/oups.wav'),
  etoile: require('../../assets/sons/etoile.wav'),
  page: require('../../assets/sons/page.wav'),
};

/** Volume propre à chaque son, pour qu'aucun ne domine les autres. */
const VOLUMES: Record<Son, number> = {
  pop: 0.5,
  bien: 0.7,
  bravo: 0.85,
  oups: 0.55,
  etoile: 0.7,
  page: 0.45,
};

const lecteurs = new Map<Son, AudioPlayer>();

function lecteur(nom: Son): AudioPlayer | null {
  const deja = lecteurs.get(nom);
  if (deja) return deja;
  try {
    const nouveau = createAudioPlayer(SOURCES[nom]);
    nouveau.volume = VOLUMES[nom];
    lecteurs.set(nom, nouveau);
    return nouveau;
  } catch {
    // Pas d'audio disponible (simulateur muet, navigateur restrictif…) :
    // l'application doit rester parfaitement jouable sans le son.
    return null;
  }
}

export function jouerSon(nom: Son): void {
  const l = lecteur(nom);
  if (!l) return;
  try {
    l.seekTo(0);
    l.play();
  } catch {
    // Un échec de lecture ne doit jamais interrompre un jeu.
  }
}

/** Libère les lecteurs ; appelé à la fermeture de l'application. */
export function libererSons(): void {
  for (const l of lecteurs.values()) {
    try {
      l.remove();
    } catch {
      // Rien à faire : on ferme de toute façon.
    }
  }
  lecteurs.clear();
}
