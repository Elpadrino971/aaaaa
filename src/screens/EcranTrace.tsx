/**
 * Jeu « Je trace » : l'enfant suit du doigt le tracé d'une lettre ou d'un
 * chiffre, trait par trait, dans le bon sens.
 *
 * Les lettres sont proposées dans les trois écritures de l'école — capitales,
 * script, cursive — que l'on change d'un geste sans quitter l'écran.
 *
 * Principe de validation : chaque trait est converti en une suite de points
 * (voir pathSampler). Un curseur avance le long de cette suite quand le doigt
 * passe assez près du point suivant. Il ne peut ni sauter loin devant, ni
 * reculer, ce qui garantit que le geste part du bon endroit et suit la bonne
 * direction, tout en restant très tolérant sur la précision.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent, PanResponder, Pressable, ScrollView,
  StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import Svg, {
  Circle, Line, Path, Polygon, Polyline, Text as SvgText,
} from 'react-native-svg';

import { Confetti } from '../components/Confetti';
import { Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { DIGIT_ICONS, LETTER_WORDS, NUMBER_NAMES, PRAISES } from '../data/content';
import {
  ECRITURES_LETTRES, ETIQUETTES, Ecriture, epaisseur, glyphList, glyphStrokes,
  reglure, versCapitale,
} from '../data/glyphs';
import { useFeedback } from '../lib/feedback';
import { Point, samplePath, startDirection } from '../lib/pathSampler';
import { pick } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

/** Distance maximale au chemin, en unités du repère 0-100. Volontairement large. */
const TOLERANCE = 11;
/** Nombre de points que le doigt peut franchir d'un coup (évite les raccourcis). */
const AVANCE_MAX = 16;
/** Le trait est validé quand il reste moins de 3 points à parcourir. */
const MARGE_FIN = 3;
/** Gris du chemin à suivre : assez visible pour guider, assez clair pour que le vert ressorte. */
const GUIDE = '#dbe1f7';

type TraitEchantillonne = { d: string; points: Point[]; longueur: number };

type Props = {
  /** 'chiffres' fige l'écriture ; 'lettres' laisse le choix entre les trois. */
  groupe: 'lettres' | 'chiffres';
  onRetour: () => void;
};

export function EcranTrace({ groupe, onRetour }: Props) {
  const { width, height } = useWindowDimensions();
  const { dire, vibrer } = useFeedback();
  const { progress, marquerTrace, choisirEcriture } = useProgress();

  const ecriture: Ecriture = groupe === 'chiffres'
    ? 'chiffres'
    : (progress.ecriturePreferee === 'chiffres' ? 'capitales' : progress.ecriturePreferee);

  const liste = useMemo(() => glyphList(ecriture), [ecriture]);
  const [index, setIndex] = useState(0);
  const signe = liste[Math.min(index, liste.length - 1)];

  const traits = useMemo<TraitEchantillonne[]>(
    () => glyphStrokes(ecriture, signe).map((d) => {
      const { points, length } = samplePath(d);
      return { d, points, longueur: length };
    }),
    [ecriture, signe],
  );

  const [traitCourant, setTraitCourant] = useState(0);
  const [curseur, setCurseur] = useState(-1);
  const [encre, setEncre] = useState<Point[][]>([]);
  const [fini, setFini] = useState(false);
  const [message, setMessage] = useState('');
  const [salve, setSalve] = useState(0);

  // Le PanResponder est créé une seule fois : il lit l'état par références.
  const traitsRef = useRef(traits);
  const traitCourantRef = useRef(0);
  const curseurRef = useRef(-1);
  const finiRef = useRef(false);
  const tailleRef = useRef(1);
  const encreRef = useRef<Point[][]>([]);

  // Position de la zone de dessin à l'écran. On travaille en coordonnées
  // absolues plutôt qu'avec locationX : cette dernière est relative à
  // l'élément touché, qui peut être un morceau du dessin plutôt que la zone
  // elle-même, et les points seraient alors faussés en cours de geste.
  const toileRef = useRef<View>(null);
  const origineRef = useRef<{ x: number; y: number } | null>(null);
  const mesurerToile = useCallback(() => {
    toileRef.current?.measureInWindow((x, y) => {
      if (Number.isFinite(x) && Number.isFinite(y)) origineRef.current = { x, y };
    });
  }, []);

  const cote = Math.max(200, Math.min(width - 44, height * 0.46, 440));
  tailleRef.current = cote;

  const reinitialiserSigne = useCallback(() => {
    traitCourantRef.current = 0;
    curseurRef.current = -1;
    finiRef.current = false;
    encreRef.current = [];
    setTraitCourant(0);
    setCurseur(-1);
    setEncre([]);
    setFini(false);
    setMessage('');
  }, []);

  useEffect(() => {
    traitsRef.current = traits;
    reinitialiserSigne();
  }, [traits, reinitialiserSigne]);

  const capitale = versCapitale(signe);
  const [motRepere, imageRepere] = ecriture === 'chiffres'
    ? [NUMBER_NAMES[Number(signe)] ?? signe, DIGIT_ICONS[signe] ?? '🔢']
    : LETTER_WORDS[capitale] ?? [capitale, ''];

  const phraseIndice = useCallback(() => {
    if (ecriture === 'chiffres') return `Le chiffre ${NUMBER_NAMES[Number(signe)] ?? signe}`;
    return `${capitale} comme ${motRepere}`;
  }, [capitale, ecriture, motRepere, signe]);

  // Annonce le signe à chaque changement.
  useEffect(() => {
    dire(phraseIndice());
  }, [phraseIndice, dire]);

  const terminer = useCallback(() => {
    finiRef.current = true;
    setFini(true);
    setSalve((n) => n + 1);
    vibrer('succes');
    const premiereFois = marquerTrace(ecriture, signe);
    setMessage(premiereFois ? `${pick(PRAISES)} +1 ⭐` : pick(PRAISES));
    dire(`${pick(PRAISES)} ${phraseIndice()}`);
  }, [dire, ecriture, marquerTrace, phraseIndice, signe, vibrer]);

  /** Traite un point du doigt, exprimé dans le repère 0-100 du dessin. */
  const suivrePoint = useCallback((gx: number, gy: number) => {
    if (finiRef.current) return;
    const trait = traitsRef.current[traitCourantRef.current];
    if (!trait) return;

    const pts = trait.points;
    const depuis = Math.max(0, curseurRef.current);
    const jusqua = Math.min(pts.length - 1, curseurRef.current + AVANCE_MAX);

    let meilleur = -1;
    let meilleureDistance = TOLERANCE;
    for (let i = depuis; i <= jusqua; i++) {
      const d = Math.hypot(pts[i].x - gx, pts[i].y - gy);
      if (d < meilleureDistance) {
        meilleureDistance = d;
        meilleur = i;
      }
    }
    if (meilleur <= curseurRef.current) return;

    curseurRef.current = meilleur;
    setCurseur(meilleur);

    // Trace l'encre du doigt pour que l'enfant voie son geste.
    const courant = encreRef.current[traitCourantRef.current] ?? [];
    const dernier = courant[courant.length - 1];
    if (!dernier || Math.hypot(dernier.x - gx, dernier.y - gy) > 1.5) {
      const copie = encreRef.current.slice();
      copie[traitCourantRef.current] = [...courant, { x: gx, y: gy }];
      encreRef.current = copie;
      setEncre(copie);
    }

    if (meilleur >= pts.length - 1 - MARGE_FIN) {
      const suivant = traitCourantRef.current + 1;
      if (suivant >= traitsRef.current.length) {
        terminer();
      } else {
        traitCourantRef.current = suivant;
        curseurRef.current = -1;
        setTraitCourant(suivant);
        setCurseur(-1);
        vibrer('tap');
      }
    }
  }, [terminer, vibrer]);

  // Le PanResponder doit être créé une seule fois pour toute la vie de
  // l'écran : le recréer casse le geste en cours, la vue perdant la main au
  // premier réaffichage. Les fonctions à jour sont donc atteintes par
  // référence plutôt que capturées.
  const suivrePointRef = useRef(suivrePoint);
  const mesurerRef = useRef(mesurerToile);
  useEffect(() => { suivrePointRef.current = suivrePoint; }, [suivrePoint]);
  useEffect(() => { mesurerRef.current = mesurerToile; }, [mesurerToile]);

  const panResponder = useMemo(() => {
    const traiter = (e: GestureResponderEvent) => {
      const { pageX, pageY, locationX, locationY } = e.nativeEvent;
      const taille = tailleRef.current || 1;
      const origine = origineRef.current;
      // Repli sur locationX tant que la zone n'a pas été mesurée : au tout
      // premier contact, l'élément touché est bien la zone de dessin.
      const x = origine ? pageX - origine.x : locationX;
      const y = origine ? pageY - origine.y : locationY;
      suivrePointRef.current((x / taille) * 100, (y / taille) * 100);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        mesurerRef.current();
        traiter(e);
      },
      onPanResponderMove: traiter,
    });
  }, []);

  const changerSigne = useCallback((nouvelIndex: number) => {
    setIndex((nouvelIndex + liste.length) % liste.length);
  }, [liste.length]);

  /** Change d'écriture en restant sur la même lettre. */
  const changerEcriture = useCallback((cible: Ecriture) => {
    setIndex((i) => i); // la position dans l'alphabet est la même d'une écriture à l'autre
    choisirEcriture(cible);
  }, [choisirEcriture]);

  const dejaFait = progress.traces[ecriture] ?? [];
  const lignes = reglure(ecriture);
  const largeurTrait = epaisseur(ecriture);
  const trait = traits[traitCourant];
  const avancement = trait && curseur >= 0
    ? Math.min(1, (curseur + 1) / trait.points.length)
    : 0;
  const direction = trait ? startDirection(trait.points) : { x: 1, y: 0 };

  return (
    <Ecran
      titre={groupe === 'chiffres' ? 'Je trace les chiffres' : 'Je trace les lettres'}
      degrade={groupe === 'chiffres' ? gradients.chiffres : gradients.lettres}
      onRetour={onRetour}
    >
      <View style={styles.centre}>
        {groupe === 'lettres' && (
          <View style={styles.onglets}>
            {ECRITURES_LETTRES.map((e) => (
              <Pressable
                key={e}
                onPress={() => changerEcriture(e)}
                accessibilityRole="button"
                accessibilityState={{ selected: e === ecriture }}
                accessibilityLabel={`Écriture ${ETIQUETTES[e]}`}
                style={[styles.onglet, e === ecriture && styles.ongletActif]}
              >
                <Text
                  style={[
                    styles.ongletTexte,
                    e === 'cursive' && styles.ongletCursive,
                    e === ecriture && styles.ongletTexteActif,
                  ]}
                >
                  {ETIQUETTES[e]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => dire(phraseIndice())}
          accessibilityRole="button"
          accessibilityLabel={`Écouter : ${phraseIndice()}`}
          style={styles.indice}
        >
          <Text style={styles.indiceTexte}>
            {imageRepere}{' '}
            {ecriture === 'chiffres'
              ? `${signe} — ${motRepere}`
              : `${capitale} comme ${motRepere}`} 🔊
          </Text>
        </Pressable>

        <View
          ref={toileRef}
          onLayout={mesurerToile}
          style={[styles.toile, shadow(5), { width: cote, height: cote }]}
          {...panResponder.panHandlers}
        >
          <Svg width={cote} height={cote} viewBox="0 0 100 100" pointerEvents="none">
            {/* Réglure du cahier */}
            <Line x1={0} y1={lignes.montante} x2={100} y2={lignes.montante}
              stroke={colors.gris} strokeWidth={0.8} />
            {lignes.petite !== lignes.montante && (
              <Line x1={0} y1={lignes.petite} x2={100} y2={lignes.petite}
                stroke={colors.gris} strokeWidth={0.8} strokeDasharray="3 3" />
            )}
            <Line x1={0} y1={lignes.ligne} x2={100} y2={lignes.ligne}
              stroke={colors.grisMoyen} strokeWidth={1} />
            {lignes.descendante !== lignes.ligne && (
              <Line x1={0} y1={lignes.descendante} x2={100} y2={lignes.descendante}
                stroke={colors.gris} strokeWidth={0.8} strokeDasharray="3 3" />
            )}

            {/* Chemins à suivre */}
            {traits.map((t, i) => (
              <Path
                key={`guide-${i}`}
                d={t.d}
                stroke={i < traitCourant || fini ? colors.vert : GUIDE}
                strokeWidth={i === traitCourant && !fini ? largeurTrait + 2 : largeurTrait}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

            {/* Progression sur le trait en cours */}
            {trait && !fini && avancement > 0 && (
              <Path
                d={trait.d}
                stroke={colors.vert}
                strokeWidth={largeurTrait + 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={`${trait.longueur * avancement} ${trait.longueur}`}
              />
            )}

            {/* Encre laissée par le doigt */}
            {encre.map((pts, i) => (
              pts && pts.length > 1 ? (
                <Polyline
                  key={`encre-${i}`}
                  points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                  stroke={colors.bleu}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.55}
                />
              ) : null
            ))}

            {/* Points de départ des traits à venir. Plusieurs lettres (B, D, E, P, R)
                démarrent deux traits au même endroit : ceux-ci sont dessinés en
                premier pour que le point vert du trait en cours reste au-dessus. */}
            {traits.map((t, i) => (
              fini || i <= traitCourant ? null : (
                <PointDepart key={`depart-${i}`} p={t.points[0]} numero={i + 1} courant={false} />
              )
            ))}

            {/* Point de départ du trait en cours, toujours visible */}
            {trait && !fini && (
              <PointDepart p={trait.points[0]} numero={traitCourant + 1} courant />
            )}

            {/* Flèche indiquant le sens du trait en cours */}
            {trait && !fini && curseur < 0 && (
              <Polygon points={fleche(trait.points[0], direction)} fill={colors.vert} opacity={0.9} />
            )}
          </Svg>
        </View>

        <Text style={[styles.message, fini && styles.messageGagne]}>
          {message || (curseur < 0
            ? `Pose ton doigt sur le point ${traitCourant + 1} 🟢`
            : 'Continue…')}
        </Text>

        <View style={styles.actions}>
          <Pilule
            titre="‹"
            onPress={() => changerSigne(index - 1)}
            accessibilityLabel="Signe précédent"
            style={styles.boutonFleche}
          />
          <Pilule titre="Effacer" onPress={reinitialiserSigne} couleur={colors.jaune} />
          <Pilule
            titre={fini ? 'Suivant ›' : '›'}
            onPress={() => changerSigne(index + 1)}
            couleur={fini ? colors.vert : colors.papier}
            couleurTexte={fini ? colors.papier : colors.encre}
            accessibilityLabel="Signe suivant"
            style={fini ? undefined : styles.boutonFleche}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bande}
          contentContainerStyle={styles.jetons}
        >
          {liste.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => changerSigne(i)}
              accessibilityRole="button"
              accessibilityLabel={`Aller à ${versCapitale(c)}`}
              style={[styles.jeton, i === index && styles.jetonActif]}
            >
              <Text style={[styles.jetonTexte, i === index && styles.jetonTexteActif]}>{c}</Text>
              {dejaFait.includes(c) && <Text style={styles.jetonEtoile}>⭐</Text>}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

/** Pastille numérotée marquant le début d'un trait. */
function PointDepart(
  { p, numero, courant }: { p: Point; numero: number; courant: boolean },
) {
  return (
    <>
      <Circle
        cx={p.x}
        cy={p.y}
        r={courant ? 5.4 : 4}
        fill={courant ? colors.vert : colors.grisMoyen}
        stroke={colors.papier}
        strokeWidth={courant ? 1.2 : 0.8}
      />
      <SvgText
        x={p.x}
        y={p.y + 2.3}
        fontSize={courant ? 6.4 : 5}
        fontWeight="bold"
        fill={colors.papier}
        textAnchor="middle"
      >
        {numero}
      </SvgText>
    </>
  );
}

/** Petite flèche triangulaire posée au départ du trait, orientée vers le geste. */
function fleche(depart: Point, dir: Point): string {
  const base = { x: depart.x + dir.x * 7, y: depart.y + dir.y * 7 };
  const pointe = { x: base.x + dir.x * 6, y: base.y + dir.y * 6 };
  const nx = -dir.y;
  const ny = dir.x;
  const a = { x: base.x + nx * 3.4, y: base.y + ny * 3.4 };
  const b = { x: base.x - nx * 3.4, y: base.y - ny * 3.4 };
  return `${pointe.x},${pointe.y} ${a.x},${a.y} ${b.x},${b.y}`;
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', gap: 8 },
  onglets: { flexDirection: 'row', gap: 8 },
  onglet: {
    minWidth: 78,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radius.rond,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ongletActif: { backgroundColor: colors.bleu },
  ongletTexte: { fontSize: 17, fontWeight: '800', color: colors.encre },
  ongletCursive: { fontStyle: 'italic', fontSize: 15 },
  ongletTexteActif: { color: colors.papier },
  indice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.rond,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  indiceTexte: { fontSize: 18, fontWeight: '700', color: colors.encre },
  toile: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    overflow: 'hidden',
    // Sans cela, le navigateur interprète le tracé comme une sélection de
    // texte puis comme un glisser-déposer, ce qui interrompt le geste.
    userSelect: 'none',
  },
  message: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.grisTexte,
    textAlign: 'center',
    minHeight: 24,
  },
  messageGagne: { color: colors.vertFonce, fontSize: 21 },
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  boutonFleche: { paddingHorizontal: 26 },
  bande: { alignSelf: 'stretch', flexGrow: 0, marginTop: 'auto' },
  jetons: { gap: 8, paddingHorizontal: 4, paddingVertical: 6 },
  jeton: {
    width: 48,
    height: 48,
    borderRadius: radius.s,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jetonActif: { backgroundColor: colors.bleu },
  jetonTexte: { fontSize: 19, fontWeight: '800', color: colors.encre },
  jetonTexteActif: { color: colors.papier },
  jetonEtoile: { position: 'absolute', top: -4, right: -2, fontSize: 12 },
});
