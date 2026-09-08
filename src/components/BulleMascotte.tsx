/**
 * Malin et sa bulle : c'est lui qui porte les consignes et les réactions des
 * jeux, à la place d'une simple ligne de texte.
 *
 * Un message a besoin d'un visage pour être lu par un enfant qui ne lit pas
 * encore : l'expression dit déjà « c'est gagné » ou « essaie encore » avant
 * même que le texte soit déchiffré.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Humeur, Mascotte } from './Mascotte';
import { colors, radius } from '../theme';

type Props = {
  message: string;
  humeur?: Humeur;
  /** Taille de la mascotte ; la bulle s'adapte. */
  taille?: number;
};

export function BulleMascotte({ message, humeur = 'normal', taille = 52 }: Props) {
  return (
    <View style={styles.rangee} accessibilityRole="text" accessibilityLabel={message}>
      <Mascotte humeur={humeur} taille={taille} />
      <View style={[styles.bulle, humeur === 'content' && styles.bulleGagnee]}>
        <View style={[styles.pointe, humeur === 'content' && styles.pointeGagnee]} />
        <Text style={[styles.texte, humeur === 'content' && styles.texteGagne]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rangee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  bulle: {
    flexShrink: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.m,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  bulleGagnee: { backgroundColor: colors.vert },
  pointe: {
    position: 'absolute',
    left: -6,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    transform: [{ rotate: '45deg' }],
  },
  pointeGagnee: { backgroundColor: colors.vert },
  texte: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.encre,
  },
  texteGagne: { color: colors.papier },
});
