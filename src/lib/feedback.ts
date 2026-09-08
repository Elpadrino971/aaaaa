/**
 * Retours sensoriels : voix de synthèse et vibrations.
 * Les deux respectent les réglages choisis dans la zone parents.
 */

import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { useProgress } from '../state/progress';

const VOIX = {
  language: 'fr-FR',
  pitch: 1.15,   // un peu aiguë, plus chaleureuse pour un enfant
  rate: 0.92,    // légèrement ralentie pour être bien comprise
} as const;

export function useFeedback() {
  const { progress } = useProgress();
  const { voix, vibrations } = progress.reglages;

  /** Lit un texte à voix haute, en interrompant la phrase précédente. */
  const dire = useCallback((texte: string) => {
    if (!voix || !texte) return;
    Speech.stop();
    Speech.speak(texte, VOIX);
  }, [voix]);

  /**
   * Lit plusieurs morceaux à la suite, en les séparant nettement.
   * Sert à déchiffrer un mot syllabe par syllabe : « LA… PIN… lapin ».
   * expo-speech met les énoncés en file d'attente, il suffit donc de les
   * empiler après un seul arrêt.
   */
  const direSuite = useCallback((morceaux: string[], lent = true) => {
    if (!voix) return;
    Speech.stop();
    morceaux
      .filter((m) => m.length > 0)
      .forEach((morceau) => Speech.speak(morceau, { ...VOIX, rate: lent ? 0.6 : VOIX.rate }));
  }, [voix]);

  const taire = useCallback(() => {
    Speech.stop();
  }, []);

  const vibrer = useCallback((type: 'succes' | 'erreur' | 'tap') => {
    if (!vibrations || Platform.OS === 'web') return;
    if (type === 'succes') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (type === 'erreur') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [vibrations]);

  return useMemo(
    () => ({ dire, direSuite, taire, vibrer }),
    [dire, direSuite, taire, vibrer],
  );
}
