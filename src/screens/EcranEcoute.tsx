/**
 * Jeu « J'écoute » : l'application prononce une lettre ou un chiffre,
 * l'enfant retrouve le bon symbole parmi quatre propositions.
 * C'est l'exercice miroir du tracé : reconnaître avant d'écrire.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { ENCOURAGEMENTS, NUMBER_NAMES, PRAISES } from '../data/content';
import { DIGIT_LIST, LETTER_LIST } from '../data/glyphs';
import { useFeedback } from '../lib/feedback';
import { makeChoices, pick } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

type Mode = 'lettres' | 'chiffres';

function tirer(mode: Mode) {
  const source = mode === 'chiffres' ? DIGIT_LIST : LETTER_LIST;
  const cible = pick(source);
  return { cible, propositions: makeChoices(cible, source, 4) };
}

export function EcranEcoute({ onRetour }: { onRetour: () => void }) {
  const { dire, vibrer } = useFeedback();
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();
  const { width } = useWindowDimensions();

  // Quatre tuiles disposées en carré 2 x 2, quelle que soit la largeur.
  const cote = Math.max(96, Math.min(150, Math.floor((Math.min(width, 720) - 28 - 12) / 2)));

  const [mode, setMode] = useState<Mode>('lettres');
  const [manche, setManche] = useState(() => tirer('lettres'));
  const [choisi, setChoisi] = useState<string | null>(null);
  const [serie, setSerie] = useState(0);
  const [message, setMessage] = useState('');
  const [salve, setSalve] = useState(0);

  const prononcer = useCallback((symbole: string) => (
    mode === 'chiffres' ? NUMBER_NAMES[Number(symbole)] ?? symbole : symbole
  ), [mode]);

  const enoncer = useCallback(() => {
    dire(`Trouve : ${prononcer(manche.cible)}`);
  }, [dire, manche.cible, prononcer]);

  useEffect(() => { enoncer(); }, [enoncer]);

  const changerMode = useCallback((nouveau: Mode) => {
    setMode(nouveau);
    setManche(tirer(nouveau));
    setChoisi(null);
    setMessage('');
    setSerie(0);
  }, []);

  const repondre = useCallback((symbole: string) => {
    if (choisi !== null) return;
    setChoisi(symbole);

    if (symbole === manche.cible) {
      const nouvelleSerie = serie + 1;
      setSerie(nouvelleSerie);
      vibrer('succes');
      setSalve((n) => n + 1);
      ajouterEtoiles(1);
      enregistrerRecord('ecoute', nouvelleSerie);
      const bravo = pick(PRAISES);
      setMessage(`${bravo} +1 ⭐`);
      dire(bravo);
      setTimeout(() => {
        setManche(tirer(mode));
        setChoisi(null);
        setMessage('');
      }, 1300);
    } else {
      vibrer('erreur');
      setSerie(0);
      setMessage(pick(ENCOURAGEMENTS));
      dire(`Non, écoute encore : ${prononcer(manche.cible)}`);
      setTimeout(() => setChoisi(null), 1000);
    }
  }, [ajouterEtoiles, choisi, dire, enregistrerRecord, manche.cible, mode,
    prononcer, serie, vibrer]);

  return (
    <Ecran titre="J'écoute" degrade={gradients.ecoute} onRetour={onRetour}>
      <View style={styles.centre}>
        <View style={styles.onglets}>
          <Pilule
            titre="Lettres"
            onPress={() => changerMode('lettres')}
            couleur={mode === 'lettres' ? colors.violet : colors.papier}
            couleurTexte={mode === 'lettres' ? colors.papier : colors.encre}
          />
          <Pilule
            titre="Chiffres"
            onPress={() => changerMode('chiffres')}
            couleur={mode === 'chiffres' ? colors.violet : colors.papier}
            couleurTexte={mode === 'chiffres' ? colors.papier : colors.encre}
          />
        </View>

        <Pressable
          onPress={enoncer}
          accessibilityRole="button"
          accessibilityLabel="Réécouter"
          style={({ pressed }) => [styles.hautParleur, shadow(5), pressed && styles.enfonce]}
        >
          <Text style={styles.hautParleurEmoji}>🔊</Text>
          <Text style={styles.hautParleurTexte}>Réécouter</Text>
        </Pressable>

        <Text style={[styles.message, choisi === manche.cible && styles.messageGagne]}>
          {message || 'Touche ce que tu entends 👂'}
        </Text>

        <View style={[styles.grille, { maxWidth: cote * 2 + 12 }]}>
          {manche.propositions.map((symbole) => {
            const estChoisi = choisi === symbole;
            const juste = estChoisi && symbole === manche.cible;
            const faux = estChoisi && symbole !== manche.cible;
            return (
              <Pressable
                key={symbole}
                onPress={() => repondre(symbole)}
                accessibilityRole="button"
                accessibilityLabel={prononcer(symbole)}
                style={({ pressed }) => [
                  styles.tuile,
                  { width: cote, height: cote * 0.92 },
                  shadow(4),
                  juste && styles.tuileJuste,
                  faux && styles.tuileFausse,
                  pressed && styles.enfonce,
                ]}
              >
                <Text style={[styles.tuileTexte, (juste || faux) && styles.tuileTexteFort]}>
                  {symbole}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.score}>
          Série : {serie}   •   Record : {progress.records.ecoute ?? 0}
        </Text>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  onglets: { flexDirection: 'row', gap: 10 },
  hautParleur: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingVertical: 16,
    paddingHorizontal: 34,
    alignItems: 'center',
  },
  hautParleurEmoji: { fontSize: 54, lineHeight: 62 },
  hautParleurTexte: { fontSize: 15, fontWeight: '700', color: colors.grisTexte },
  message: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.grisTexte,
    textAlign: 'center',
    minHeight: 24,
  },
  messageGagne: { color: colors.vertFonce, fontSize: 20 },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  tuile: {
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tuileJuste: { backgroundColor: colors.vert },
  tuileFausse: { backgroundColor: colors.rouge },
  tuileTexte: { fontSize: 48, fontWeight: '800', color: colors.encre },
  tuileTexteFort: { color: colors.papier },
  enfonce: { transform: [{ translateY: 2 }] },
  score: { fontSize: 14, fontWeight: '700', color: colors.grisTexte },
});
