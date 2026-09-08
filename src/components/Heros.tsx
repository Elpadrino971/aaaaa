/**
 * Le personnage de l’enfant, entièrement dessiné en SVG.
 *
 * Tout tient dans un repère de 100 x 140 : le composant peut donc être affiché
 * en grand dans l’atelier comme en vignette dans les pages d’histoire, sans
 * jamais recharger d’image.
 */

import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import {
  Avatar, costumeDe, couleurCheveuxDe, teintDe,
} from '../data/avatar';

type Props = {
  avatar: Avatar;
  /** Largeur souhaitée ; la hauteur suit la proportion du cadrage. */
  taille: number;
  /** 'visage' cadre sur la tête, pour les vignettes de choix. */
  cadrage?: 'entier' | 'visage';
  /**
   * Masque le chapeau ou le casque du costume. Indispensable dans le
   * sélecteur de coiffure : sinon le couvre-chef cache justement ce que
   * l’enfant est en train de choisir.
   */
  sansCouvreChef?: boolean;
};

export function Heros({ avatar, taille, cadrage = 'entier', sansCouvreChef = false }: Props) {
  const peau = teintDe(avatar.teint);
  const cheveux = couleurCheveuxDe(avatar.couleurCheveux).couleur;
  const costume = costumeDe(avatar.costume);

  const visage = cadrage === 'visage';

  return (
    <Svg
      width={taille}
      height={visage ? taille : taille * 1.4}
      viewBox={visage ? '17 5 66 66' : '0 0 100 140'}
    >
      {/* Cape, derrière tout le reste */}
      {costume.cape && (
        <Path
          d="M30 74 L14 128 L50 116 L86 128 L70 74 Z"
          fill={costume.cape}
          opacity={0.95}
        />
      )}

      {/* Jambes et chaussures */}
      <Rect x={38} y={100} width={9} height={26} rx={4.5} fill={costume.bas} />
      <Rect x={53} y={100} width={9} height={26} rx={4.5} fill={costume.bas} />
      <Ellipse cx={41} cy={129} rx={9} ry={5.5} fill="#3a3f5c" />
      <Ellipse cx={59} cy={129} rx={9} ry={5.5} fill="#3a3f5c" />

      {/* Bras */}
      <Path
        d="M36 80 L24 100"
        stroke={costume.haut}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M64 80 L76 100"
        stroke={costume.haut}
        strokeWidth={10}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={23} cy={102} r={6} fill={peau.couleur} />
      <Circle cx={77} cy={102} r={6} fill={peau.couleur} />

      {/* Buste */}
      <Path
        d="M34 72 H66 A10 10 0 0 1 76 82 V96 A10 10 0 0 1 66 106 H34 A10 10 0 0 1 24 96 V82 A10 10 0 0 1 34 72 Z"
        fill={costume.haut}
      />
      {costume.id === 'super' && (
        <Path d="M50 78 L44 90 H50 L46 100 L58 86 H51 L56 78 Z" fill="#ffd23c" />
      )}
      {costume.id === 'explorateur' && (
        <Path d="M28 84 H72" stroke="#5d4c26" strokeWidth={5} strokeLinecap="round" />
      )}

      {/* Cou et tête */}
      <Rect x={45} y={64} width={10} height={12} fill={peau.ombre} />
      <Circle cx={24} cy={46} r={5.5} fill={peau.ombre} />
      <Circle cx={76} cy={46} r={5.5} fill={peau.ombre} />
      <Circle cx={50} cy={44} r={26} fill={peau.couleur} />

      <Coiffure style={avatar.cheveux} couleur={cheveux} />

      {/* Joues */}
      <Circle cx={35} cy={52} r={4.5} fill="#f2808a" opacity={0.35} />
      <Circle cx={65} cy={52} r={4.5} fill="#f2808a" opacity={0.35} />

      <Regard style={avatar.yeux} />

      {/* Sourire */}
      <Path
        d="M42 54 Q50 62 58 54"
        stroke="#4a3226"
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />

      {!sansCouvreChef && <CouvreChef type={costume.couvreChef} costume={costume.id} />}
    </Svg>
  );
}

/** Les coiffures : une calotte commune, plus ce qui la distingue. */
function Coiffure({ style, couleur }: { style: string; couleur: string }) {
  const calotte = (
    <Path
      d="M24 46 C24 27 34 17 50 17 C66 17 76 27 76 46 C76 35 66 31 50 31 C34 31 24 35 24 46 Z"
      fill={couleur}
    />
  );

  switch (style) {
    case 'boucles':
      return (
        <G>
          {calotte}
          <Circle cx={31} cy={30} r={8} fill={couleur} />
          <Circle cx={44} cy={23} r={9} fill={couleur} />
          <Circle cx={57} cy={23} r={9} fill={couleur} />
          <Circle cx={69} cy={30} r={8} fill={couleur} />
        </G>
      );
    case 'longs':
      return (
        <G>
          <Path d="M22 44 C22 24 34 15 50 15 C66 15 78 24 78 44 L78 84 L68 84 L68 46 C68 36 60 32 50 32 C40 32 32 36 32 46 L32 84 L22 84 Z" fill={couleur} />
        </G>
      );
    case 'couettes':
      return (
        <G>
          {calotte}
          <Circle cx={17} cy={54} r={11} fill={couleur} />
          <Circle cx={83} cy={54} r={11} fill={couleur} />
        </G>
      );
    case 'chignon':
      return (
        <G>
          {calotte}
          <Circle cx={50} cy={13} r={10} fill={couleur} />
        </G>
      );
    case 'crete':
      return (
        <G>
          <Path d="M26 44 C26 34 34 30 50 30 C66 30 74 34 74 44 C72 38 62 36 50 36 C38 36 28 38 26 44 Z" fill={couleur} />
          <Path d="M50 8 L58 34 H42 Z" fill={couleur} />
          <Path d="M38 14 L46 34 H32 Z" fill={couleur} />
          <Path d="M62 14 L68 34 H54 Z" fill={couleur} />
        </G>
      );
    case 'tresses':
      return (
        <G>
          {calotte}
          <Rect x={16} y={44} width={9} height={34} rx={4.5} fill={couleur} />
          <Rect x={75} y={44} width={9} height={34} rx={4.5} fill={couleur} />
          <Circle cx={20.5} cy={80} r={5} fill={couleur} />
          <Circle cx={79.5} cy={80} r={5} fill={couleur} />
        </G>
      );
    default:
      return calotte;
  }
}

function Regard({ style }: { style: string }) {
  if (style === 'rieurs') {
    return (
      <G>
        <Path d="M35 46 Q41 39 47 46" stroke="#3a2c22" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M53 46 Q59 39 65 46" stroke="#3a2c22" strokeWidth={3} strokeLinecap="round" fill="none" />
      </G>
    );
  }
  if (style === 'etoiles') {
    return (
      <G>
        <Path d="M41 38 L43.4 43.6 L49 44 L44.6 47.6 L46 53 L41 50 L36 53 L37.4 47.6 L33 44 L38.6 43.6 Z" fill="#3a2c22" />
        <Path d="M59 38 L61.4 43.6 L67 44 L62.6 47.6 L64 53 L59 50 L54 53 L55.4 47.6 L51 44 L56.6 43.6 Z" fill="#3a2c22" />
      </G>
    );
  }
  return (
    <G>
      <Circle cx={41} cy={44} r={4.2} fill="#3a2c22" />
      <Circle cx={59} cy={44} r={4.2} fill="#3a2c22" />
      <Circle cx={42.5} cy={42.5} r={1.5} fill="#ffffff" />
      <Circle cx={60.5} cy={42.5} r={1.5} fill="#ffffff" />
    </G>
  );
}

function CouvreChef({ type, costume }: { type?: string; costume: string }) {
  switch (type) {
    case 'casque':
      return (
        <G>
          {/* Calotte pleine : un simple bandeau ne se lisait pas comme un casque. */}
          <Path d="M20 44 A30 30 0 0 1 80 44 Z" fill="#b9c2d8" />
          <Path d="M20 44 H80 V50 H20 Z" fill="#9aa4bf" />
          <Rect x={20} y={44} width={8} height={16} rx={4} fill="#b9c2d8" />
          <Rect x={72} y={44} width={8} height={16} rx={4} fill="#b9c2d8" />
          <Rect x={46} y={40} width={8} height={22} rx={3} fill="#9aa4bf" />
          <Path d="M50 6 L55 20 H45 Z" fill="#e05a5f" />
          <Rect x={47} y={18} width={6} height={6} fill="#e05a5f" />
        </G>
      );
    case 'bulle':
      return (
        <G>
          <Circle cx={50} cy={44} r={31} fill="#bfe4ff" opacity={0.35} />
          <Circle cx={50} cy={44} r={31} stroke="#8fc7f0" strokeWidth={3} fill="none" />
          <Path d="M32 26 Q40 18 50 17" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.8} />
        </G>
      );
    case 'bandana':
      return (
        <G>
          <Path d="M23 36 A27 27 0 0 1 77 36 L77 30 A27 27 0 0 0 23 30 Z" fill="#e0484d" />
          <Path d="M23 30 H77 V38 H23 Z" fill="#e0484d" />
          <Path d="M77 34 L90 30 L86 42 Z" fill="#c93b40" />
        </G>
      );
    case 'pointu':
      return (
        <G>
          <Path d="M50 -2 L74 34 H26 Z" fill="#5b3ab0" />
          <Path d="M22 34 H78 V42 H22 Z" fill="#4a2f92" />
          <Path d="M50 10 L52.4 16 L58 16.6 L53.4 20.4 L55 26 L50 22.8 L45 26 L46.6 20.4 L42 16.6 L47.6 16 Z" fill="#f0c04a" />
        </G>
      );
    case 'brousse':
      return (
        <G>
          <Ellipse cx={50} cy={34} rx={38} ry={9} fill="#a98c4c" />
          <Path d="M30 34 A20 20 0 0 1 70 34 Z" fill="#c8a659" />
          <Path d="M30 32 H70 V36 H30 Z" fill="#7d6a3a" />
        </G>
      );
    default:
      return costume === 'super' ? (
        <Path d="M26 34 H74 V40 H26 Z" fill="#e5484d" opacity={0.9} />
      ) : null;
  }
}
