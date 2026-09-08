/**
 * Malin, le petit renard qui donne son nom à l'application.
 *
 * Il accueille l'enfant sur le menu et réagit dans les jeux : content quand
 * c'est réussi, désolé quand ça rate — jamais fâché. Comme le héros, il est
 * dessiné en SVG, donc net à toutes les tailles et sans image à charger.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type Humeur = 'normal' | 'content' | 'oups' | 'surpris';

const ROUX = '#f0873c';
const ROUX_FONCE = '#c05416';
const CREME = '#fdf2e4';
const ENCRE = '#3a2a1e';

type Props = {
  humeur?: Humeur;
  taille: number;
  /** Clignement des yeux et léger balancement : à réserver aux grandes tailles. */
  anime?: boolean;
};

export function Mascotte({ humeur = 'normal', taille, anime = false }: Props) {
  const [clignote, setClignote] = useState(false);
  const balancement = useRef(new Animated.Value(0)).current;

  // Un clignement de temps en temps suffit à rendre le personnage vivant.
  useEffect(() => {
    if (!anime) return;
    let minuteur: ReturnType<typeof setTimeout>;
    const programmer = () => {
      minuteur = setTimeout(() => {
        setClignote(true);
        setTimeout(() => {
          setClignote(false);
          programmer();
        }, 130);
      }, 2600 + Math.random() * 3200);
    };
    programmer();
    return () => clearTimeout(minuteur);
  }, [anime]);

  useEffect(() => {
    if (!anime) return;
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.timing(balancement, {
          toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(balancement, {
          toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, [anime, balancement]);

  const yeuxFermes = clignote || humeur === 'content';

  const dessin = (
    <Svg width={taille} height={taille} viewBox="0 0 100 100">
      {/* Buste et poitrail */}
      <Path d="M20 100 Q24 76 50 76 Q76 76 80 100 Z" fill={ROUX} />
      <Path d="M35 100 Q37 85 50 85 Q63 85 65 100 Z" fill={CREME} />

      {/* Oreilles */}
      <Path d="M20 44 L13 10 L45 28 Z" fill={ROUX} />
      <Path d="M80 44 L87 10 L55 28 Z" fill={ROUX} />
      <Path d="M23 40 L19 19 L39 30 Z" fill={ROUX_FONCE} />
      <Path d="M77 40 L81 19 L61 30 Z" fill={ROUX_FONCE} />

      {/* Tête */}
      <Ellipse cx={50} cy={50} rx={34} ry={30} fill={ROUX} />
      {/* Joues claires, qui donnent la silhouette du renard */}
      <Path d="M16 52 Q22 74 40 72 Q28 64 24 46 Z" fill={CREME} />
      <Path d="M84 52 Q78 74 60 72 Q72 64 76 46 Z" fill={CREME} />

      {/* Museau */}
      <Ellipse cx={50} cy={62} rx={21} ry={15} fill={CREME} />
      <Ellipse cx={50} cy={55} rx={5.2} ry={4} fill={ENCRE} />

      <Bouche humeur={humeur} />
      <Yeux fermes={yeuxFermes} humeur={humeur} />

      {/* Sourcils : c'est eux qui portent l'émotion */}
      {humeur === 'oups' && (
        <G>
          <Path d="M28 33 Q35 30 42 34" stroke={ROUX_FONCE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <Path d="M58 34 Q65 30 72 33" stroke={ROUX_FONCE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </G>
      )}
      {humeur === 'surpris' && (
        <G>
          <Path d="M28 31 Q35 27 42 31" stroke={ROUX_FONCE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          <Path d="M58 31 Q65 27 72 31" stroke={ROUX_FONCE} strokeWidth={2.6} strokeLinecap="round" fill="none" />
        </G>
      )}
    </Svg>
  );

  if (!anime) return dessin;

  return (
    <Animated.View
      style={{
        transform: [{
          rotate: balancement.interpolate({
            inputRange: [0, 1],
            outputRange: ['-3deg', '3deg'],
          }),
        }],
      }}
    >
      <View>{dessin}</View>
    </Animated.View>
  );
}

function Yeux({ fermes, humeur }: { fermes: boolean; humeur: Humeur }) {
  if (fermes) {
    // Yeux plissés : le sourire passe d'abord par là.
    return (
      <G>
        <Path d="M30 45 Q36 39 42 45" stroke={ENCRE} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M58 45 Q64 39 70 45" stroke={ENCRE} strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>
    );
  }
  const rayon = humeur === 'surpris' ? 6.4 : 5.2;
  return (
    <G>
      <Circle cx={36} cy={44} r={rayon} fill={ENCRE} />
      <Circle cx={64} cy={44} r={rayon} fill={ENCRE} />
      <Circle cx={38} cy={42} r={1.9} fill="#ffffff" />
      <Circle cx={66} cy={42} r={1.9} fill="#ffffff" />
    </G>
  );
}

function Bouche({ humeur }: { humeur: Humeur }) {
  if (humeur === 'content') {
    return (
      <G>
        <Path d="M40 62 Q50 73 60 62 Z" fill={ENCRE} />
        <Path d="M43 66 Q50 71 57 66" stroke="#e8748a" strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>
    );
  }
  if (humeur === 'oups') {
    return (
      <Path
        d="M42 68 Q46 63 50 68 Q54 73 58 68"
        stroke={ENCRE} strokeWidth={2.8} strokeLinecap="round" fill="none"
      />
    );
  }
  if (humeur === 'surpris') {
    return <Ellipse cx={50} cy={67} rx={4.5} ry={5.5} fill={ENCRE} />;
  }
  return (
    <G>
      <Path d="M50 59 V63" stroke={ENCRE} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M42 65 Q50 70 58 65" stroke={ENCRE} strokeWidth={2.8} strokeLinecap="round" fill="none" />
    </G>
  );
}
