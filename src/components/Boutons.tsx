/**
 * Boutons de l'application : grandes cibles (au moins 56 dp), coins très
 * arrondis, retour visuel immédiat à l'appui.
 */

import React from 'react';
import {
  Pressable, StyleProp, StyleSheet, Text, View, ViewStyle,
} from 'react-native';

import { colors, radius, shadow } from '../theme';

type PilulleProps = {
  titre: string;
  onPress: () => void;
  couleur?: string;
  couleurTexte?: string;
  desactive?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Bouton d'action arrondi, utilisé pour la navigation dans les jeux. */
export function Pilule({
  titre, onPress, couleur = colors.papier, couleurTexte = colors.encre,
  desactive = false, style, accessibilityLabel,
}: PilulleProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titre}
      accessibilityState={{ disabled: desactive }}
      disabled={desactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pilule,
        shadow(3),
        { backgroundColor: couleur, opacity: desactive ? 0.4 : 1 },
        pressed && !desactive && styles.enfonce,
        style,
      ]}
    >
      <Text style={[styles.piluleTexte, { color: couleurTexte }]}>{titre}</Text>
    </Pressable>
  );
}

type CarteJeuProps = {
  titre: string;
  sousTitre: string;
  emoji: string;
  couleur: string;
  onPress: () => void;
};

/** Grande carte colorée du menu d'accueil. */
export function CarteJeu({ titre, sousTitre, emoji, couleur, onPress }: CarteJeuProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titre}. ${sousTitre}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.carte,
        shadow(5),
        { backgroundColor: couleur },
        pressed && styles.enfonce,
      ]}
    >
      <Text style={styles.carteEmoji}>{emoji}</Text>
      <Text style={styles.carteTitre}>{titre}</Text>
      <Text style={styles.carteSousTitre}>{sousTitre}</Text>
    </Pressable>
  );
}

type BasculeProps = {
  titre: string;
  actif: boolean;
  onPress: () => void;
};

/** Interrupteur simple de la zone parents. */
export function Bascule({ titre, actif, onPress }: BasculeProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: actif }}
      accessibilityLabel={titre}
      onPress={onPress}
      style={styles.bascule}
    >
      <Text style={styles.basculeTitre}>{titre}</Text>
      <View style={[styles.rail, actif && { backgroundColor: colors.vert }]}>
        <View style={[styles.pastille, actif && styles.pastilleActive]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pilule: {
    minHeight: 56,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.rond,
  },
  piluleTexte: {
    fontSize: 18,
    fontWeight: '700',
  },
  enfonce: {
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  carte: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 150,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 4,
  },
  carteEmoji: {
    fontSize: 46,
    lineHeight: 54,
  },
  carteTitre: {
    color: colors.papier,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  carteSousTitre: {
    color: colors.papier,
    fontSize: 12.5,
    opacity: 0.92,
    textAlign: 'center',
  },
  bascule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
  },
  basculeTitre: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.encre,
  },
  rail: {
    width: 62,
    height: 34,
    borderRadius: radius.rond,
    backgroundColor: colors.grisMoyen,
    padding: 3,
    justifyContent: 'center',
  },
  pastille: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.papier,
    ...shadow(1),
  },
  pastilleActive: {
    alignSelf: 'flex-end',
  },
});
