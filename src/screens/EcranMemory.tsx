/**
 * Jeu « Le memory des animaux » : retrouver les paires.
 * Il travaille l’attention et la mémoire visuelle, et sert de récréation
 * entre deux exercices de lettres.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Pilule } from '../components/Boutons';
import { BulleMascotte } from '../components/BulleMascotte';
import { Ecran } from '../components/Ecran';
import { ANIMALS, PRAISES } from '../data/content';
import { useFeedback } from '../lib/feedback';
import { pick, shuffle } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

const PAIRES = 6;

type Carte = { id: number; emoji: string; retournee: boolean; trouvee: boolean };

function nouvellePartie(): Carte[] {
  const choisis = shuffle(ANIMALS).slice(0, PAIRES);
  const doubles = shuffle([...choisis, ...choisis]);
  return doubles.map((emoji, id) => ({ id, emoji, retournee: false, trouvee: false }));
}

export function EcranMemory({ onRetour }: { onRetour: () => void }) {
  const { dire, reagir } = useFeedback();
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();
  const { width } = useWindowDimensions();

  // Douze cartes en quatre colonnes, adaptées à la largeur de l’écran.
  const largeurCarte = Math.max(64, Math.min(104, Math.floor((Math.min(width, 720) - 28 - 3 * 10) / 4)));

  const [cartes, setCartes] = useState<Carte[]>(nouvellePartie);
  const [coups, setCoups] = useState(0);
  const [salve, setSalve] = useState(0);
  const [message, setMessage] = useState('');
  const verrou = useRef(false);

  const trouvees = cartes.filter((c) => c.trouvee).length;
  const gagne = trouvees === cartes.length;

  useEffect(() => {
    if (!gagne) return;
    reagir('succes');
    setSalve((n) => n + 1);
    ajouterEtoiles(2);
    // Moins il y a de coups, meilleur c’est : on garde le record à l’envers.
    const ancien = progress.records.memory ?? 0;
    if (ancien === 0 || coups < ancien) enregistrerRecord('memory', coups);
    const bravo = pick(PRAISES);
    setMessage(`${bravo} Toutes les paires ! +2 ⭐`);
    dire(`${bravo} Tu as trouvé toutes les paires`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gagne]);

  const rejouer = useCallback(() => {
    setCartes(nouvellePartie());
    setCoups(0);
    setMessage('');
    verrou.current = false;
  }, []);

  const retourner = useCallback((carte: Carte) => {
    if (verrou.current || carte.retournee || carte.trouvee) return;

    const ouvertes = cartes.filter((c) => c.retournee && !c.trouvee);
    const suivantes = cartes.map((c) => (c.id === carte.id ? { ...c, retournee: true } : c));
    setCartes(suivantes);
    reagir('tap');

    if (ouvertes.length === 0) return;

    const premiere = ouvertes[0];
    setCoups((n) => n + 1);

    if (premiere.emoji === carte.emoji) {
      setCartes(suivantes.map((c) => (
        c.emoji === carte.emoji ? { ...c, trouvee: true, retournee: true } : c
      )));
      reagir('etape');
      setMessage('Une paire ! 🎉');
    } else {
      verrou.current = true;
      setMessage('');
      setTimeout(() => {
        setCartes((liste) => liste.map((c) => (c.trouvee ? c : { ...c, retournee: false })));
        verrou.current = false;
      }, 850);
    }
  }, [cartes, reagir]);

  return (
    <Ecran titre="Le memory" degrade={gradients.memory} onRetour={onRetour}>
      <View style={styles.centre}>
        <BulleMascotte
          taille={48}
          humeur={gagne ? 'content' : 'normal'}
          message={message || 'Retrouve les deux mêmes animaux 🐾'}
        />

        <View style={styles.grille}>
          {cartes.map((carte) => (
            <CarteMemory
              key={carte.id}
              carte={carte}
              largeur={largeurCarte}
              onPress={() => retourner(carte)}
            />
          ))}
        </View>

        <Text style={styles.score}>
          Coups : {coups}   •   Paires : {trouvees / 2} / {PAIRES}
          {progress.records.memory ? `   •   Record : ${progress.records.memory} coups` : ''}
        </Text>

        <Pilule
          titre={gagne ? 'Rejouer 🎲' : 'Nouvelle partie'}
          onPress={rejouer}
          couleur={gagne ? colors.vert : colors.papier}
          couleurTexte={gagne ? colors.papier : colors.encre}
        />
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

/** Une carte, avec sa bascule en trois dimensions. */
function CarteMemory(
  { carte, largeur, onPress }: { carte: Carte; largeur: number; onPress: () => void },
) {
  const bascule = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bascule, {
      toValue: carte.retournee ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [carte.retournee, bascule]);

  const dos = {
    transform: [{
      rotateY: bascule.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }),
    }],
    opacity: bascule.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [1, 1, 0, 0] }),
  };
  const face = {
    transform: [{
      rotateY: bascule.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] }),
    }],
    opacity: bascule.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] }),
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={carte.retournee ? `Carte ${carte.emoji}` : 'Carte cachée'}
      style={[styles.carte, { width: largeur, height: largeur * 1.24 }]}
    >
      <Animated.View style={[styles.faceCarte, styles.dos, shadow(3), dos]}>
        <Text style={styles.dosTexte}>?</Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.faceCarte,
          shadow(3),
          face,
          carte.trouvee && styles.faceTrouvee,
        ]}
      >
        <Text style={styles.faceTexte}>{carte.emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: 420,
  },
  carte: {},
  faceCarte: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius.s,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: colors.papier,
  },
  dos: { backgroundColor: colors.bleu },
  dosTexte: { fontSize: 38, fontWeight: '800', color: colors.papier },
  faceTexte: { fontSize: 44, lineHeight: 52 },
  faceTrouvee: { backgroundColor: '#d8f6e3' },
  score: { fontSize: 14, fontWeight: '700', color: colors.grisTexte, textAlign: 'center' },
});
