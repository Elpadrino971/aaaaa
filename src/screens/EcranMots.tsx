/**
 * Jeu « Je forme des mots » : une image, des cases vides, et les lettres du
 * mot en désordre. L’enfant place les lettres dans l’ordre ; une lettre posée
 * au mauvais endroit est refusée en douceur plutôt que d’être validée à la fin,
 * pour que le retour arrive au moment du geste.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { ENCOURAGEMENTS, PRAISES, WORDS, WordEntry } from '../data/content';
import { useFeedback } from '../lib/feedback';
import { pick, shuffle } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

type Jeton = { id: number; lettre: string; utilise: boolean };

function preparer(mot: WordEntry): Jeton[] {
  const lettres = mot.word.split('');
  // On mélange en gardant un identifiant stable par jeton : deux « M » restent
  // deux jetons distincts.
  return shuffle(lettres.map((lettre, id) => ({ id, lettre, utilise: false })));
}

export function EcranMots({ onRetour }: { onRetour: () => void }) {
  const { dire, vibrer } = useFeedback();
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();
  const { width } = useWindowDimensions();

  // Les jetons rétrécissent juste ce qu’il faut pour que le mot le plus long
  // (six lettres) tienne sur une seule ligne.
  const cote = Math.max(42, Math.min(66, Math.floor((Math.min(width, 720) - 28 - 5 * 10) / 6)));

  const [ordre] = useState(() => shuffle(WORDS));
  const [position, setPosition] = useState(0);
  const mot = ordre[position % ordre.length];

  const [jetons, setJetons] = useState<Jeton[]>(() => preparer(mot));
  const [places, setPlaces] = useState<string[]>([]);
  const [faux, setFaux] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [salve, setSalve] = useState(0);
  const [reussis, setReussis] = useState(0);

  const lettres = useMemo(() => mot.word.split(''), [mot]);
  const gagne = places.length === lettres.length;

  const annoncer = useCallback(() => {
    dire(`Écris ${mot.spoken}`);
  }, [dire, mot.spoken]);

  useEffect(() => { annoncer(); }, [annoncer]);

  const nouveauMot = useCallback(() => {
    const suivant = position + 1;
    setPosition(suivant);
    const prochain = ordre[suivant % ordre.length];
    setJetons(preparer(prochain));
    setPlaces([]);
    setFaux(null);
    setMessage('');
  }, [ordre, position]);

  const recommencer = useCallback(() => {
    setJetons(preparer(mot));
    setPlaces([]);
    setFaux(null);
    setMessage('');
  }, [mot]);

  const poser = useCallback((jeton: Jeton) => {
    if (gagne || jeton.utilise) return;
    const attendue = lettres[places.length];

    if (jeton.lettre !== attendue) {
      setFaux(jeton.id);
      vibrer('erreur');
      setMessage(pick(ENCOURAGEMENTS));
      dire(`La lettre suivante est ${attendue}`);
      setTimeout(() => setFaux(null), 600);
      return;
    }

    const suite = [...places, jeton.lettre];
    setPlaces(suite);
    setJetons((liste) => liste.map((j) => (j.id === jeton.id ? { ...j, utilise: true } : j)));
    vibrer('tap');

    if (suite.length === lettres.length) {
      const total = reussis + 1;
      setReussis(total);
      vibrer('succes');
      setSalve((n) => n + 1);
      ajouterEtoiles(1);
      enregistrerRecord('mots', total);
      const bravo = pick(PRAISES);
      setMessage(`${bravo} +1 ⭐`);
      dire(`${bravo} ${mot.spoken}`);
    } else {
      dire(jeton.lettre);
    }
  }, [ajouterEtoiles, dire, enregistrerRecord, gagne, lettres, mot.spoken,
    places, reussis, vibrer]);

  return (
    <Ecran titre="Je forme des mots" degrade={gradients.mots} onRetour={onRetour}>
      <View style={styles.centre}>
        <Pressable
          onPress={annoncer}
          accessibilityRole="button"
          accessibilityLabel={`Écouter : ${mot.spoken}`}
          style={({ pressed }) => [styles.image, shadow(4), pressed && styles.enfonce]}
        >
          <Text style={styles.imageEmoji}>{mot.emoji}</Text>
          <Text style={styles.imageTexte}>{mot.spoken} 🔊</Text>
        </Pressable>

        <View style={styles.cases}>
          {lettres.map((lettre, i) => (
            <View
              key={i}
              style={[
                styles.case,
                { width: cote, height: cote * 1.2 },
                i < places.length && styles.caseRemplie,
              ]}
            >
              <Text style={[styles.caseTexte, i < places.length && styles.caseTexteRempli]}>
                {i < places.length ? lettre : ''}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.message, gagne && styles.messageGagne]}>
          {message || 'Touche les lettres dans le bon ordre 👆'}
        </Text>

        <View style={styles.jetons}>
          {jetons.map((jeton) => (
            <Pressable
              key={jeton.id}
              onPress={() => poser(jeton)}
              disabled={jeton.utilise}
              accessibilityRole="button"
              accessibilityLabel={`Lettre ${jeton.lettre}`}
              style={({ pressed }) => [
                styles.jeton,
                { width: cote, height: cote },
                shadow(3),
                jeton.utilise && styles.jetonUtilise,
                faux === jeton.id && styles.jetonFaux,
                pressed && !jeton.utilise && styles.enfonce,
              ]}
            >
              <Text style={[styles.jetonTexte, faux === jeton.id && styles.jetonTexteFaux]}>
                {jeton.lettre}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          <Pilule titre="Recommencer" onPress={recommencer} couleur={colors.jaune} />
          <Pilule
            titre="Mot suivant ›"
            onPress={nouveauMot}
            couleur={gagne ? colors.vert : colors.papier}
            couleurTexte={gagne ? colors.papier : colors.encre}
          />
        </View>

        <Text style={styles.score}>
          Mots réussis : {reussis}   •   Record : {progress.records.mots ?? 0}
        </Text>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  image: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  imageEmoji: { fontSize: 76, lineHeight: 88 },
  imageTexte: { fontSize: 16, fontWeight: '700', color: colors.grisTexte },
  cases: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  case: {
    borderRadius: radius.s,
    backgroundColor: colors.gris,
    borderWidth: 3,
    borderColor: colors.grisMoyen,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseRemplie: {
    backgroundColor: colors.vert,
    borderColor: colors.vert,
    borderStyle: 'solid',
  },
  caseTexte: { fontSize: 30, fontWeight: '800', color: colors.encre },
  caseTexteRempli: { color: colors.papier },
  message: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.grisTexte,
    textAlign: 'center',
    minHeight: 24,
  },
  messageGagne: { color: colors.vertFonce, fontSize: 20 },
  jetons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  jeton: {
    borderRadius: radius.s,
    backgroundColor: colors.jaune,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jetonUtilise: { opacity: 0 },
  enfonce: { transform: [{ translateY: 2 }] },
  jetonFaux: { backgroundColor: colors.rouge },
  jetonTexte: { fontSize: 30, fontWeight: '800', color: colors.encre },
  jetonTexteFaux: { color: colors.papier },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  score: { fontSize: 14, fontWeight: '700', color: colors.grisTexte },
});
