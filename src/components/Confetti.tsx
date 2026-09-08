/**
 * Pluie de confettis jouée à chaque réussite.
 * `trigger` est un compteur : dès qu’il change, une nouvelle salve part.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors } from '../theme';

const NOMBRE = 28;
const PALETTE = [colors.jaune, colors.rose, colors.vert, colors.bleu, colors.orange, colors.turquoise];

type Piece = {
  gauche: number;
  derive: number;
  taille: number;
  couleur: string;
  delai: number;
  duree: number;
  tours: string;
};

export function Confetti({ trigger }: { trigger: number }) {
  const { width, height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const valeurs = useRef(
    Array.from({ length: NOMBRE }, () => new Animated.Value(0)),
  ).current;

  const pieces = useMemo<Piece[]>(
    () => Array.from({ length: NOMBRE }, () => ({
      gauche: Math.random() * width,
      derive: (Math.random() - 0.5) * 160,
      taille: 8 + Math.random() * 8,
      couleur: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      delai: Math.random() * 350,
      duree: 1100 + Math.random() * 900,
      tours: `${Math.round((Math.random() - 0.5) * 720)}deg`,
    })),
    // Une nouvelle salve = de nouvelles positions.
    [trigger, width],
  );

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    valeurs.forEach((v) => v.setValue(0));
    const animations = valeurs.map((v, i) => Animated.timing(v, {
      toValue: 1,
      duration: pieces[i].duree,
      delay: pieces[i].delai,
      easing: Easing.linear,
      useNativeDriver: true,
    }));
    const salve = Animated.parallel(animations);
    salve.start(({ finished }) => {
      if (finished) setVisible(false);
    });
    return () => salve.stop();
  }, [trigger, pieces, valeurs]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.gauche,
            top: -30,
            width: p.taille,
            height: p.taille * 1.4,
            borderRadius: 3,
            backgroundColor: p.couleur,
            opacity: valeurs[i].interpolate({
              inputRange: [0, 0.85, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateY: valeurs[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, height + 60],
                }),
              },
              {
                translateX: valeurs[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, p.derive],
                }),
              },
              {
                rotate: valeurs[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', p.tours],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
