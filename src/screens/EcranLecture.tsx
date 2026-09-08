/**
 * Jeu « Je lis » : le déchiffrage, en deux étapes.
 *
 *   • Syllabes — l’application prononce une syllabe, l’enfant la retrouve parmi
 *     quatre. Les leurres sont choisis exprès : même consonne avec une autre
 *     voyelle, et même voyelle avec une autre consonne, pour obliger à écouter
 *     les deux sons plutôt qu’à reconnaître une forme globale.
 *
 *   • Mots — le mot s’affiche découpé en syllabes que l’on peut toucher une à
 *     une pour les entendre, puis l’enfant choisit l’image correspondante.
 *     C’est la lecture complète : déchiffrer, puis comprendre.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { ENCOURAGEMENTS, PRAISES } from '../data/content';
import { MOTS_A_LIRE, MotLu, SYLLABES, TOUTES_SYLLABES } from '../data/lecture';
import { useFeedback } from '../lib/feedback';
import { pick, shuffle } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

type Mode = 'syllabes' | 'mots';

type MancheSyllabe = { cible: string; propositions: string[] };
type MancheMot = { cible: MotLu; propositions: MotLu[] };

/**
 * Construit les quatre propositions d’une syllabe : la bonne, une de même
 * consonne, une de même voyelle, et une quelconque.
 */
function tirerSyllabe(): MancheSyllabe {
  const famille = pick(SYLLABES);
  const cible = pick(famille);
  const consonne = cible[0];
  const voyelle = cible.slice(1);

  const memeConsonne = pick(famille.filter((s) => s !== cible));
  const memeVoyelle = pick(
    TOUTES_SYLLABES.filter((s) => s.slice(1) === voyelle && s[0] !== consonne),
  );
  const autre = pick(
    TOUTES_SYLLABES.filter(
      (s) => s !== cible && s !== memeConsonne && s !== memeVoyelle,
    ),
  );

  return { cible, propositions: shuffle([cible, memeConsonne, memeVoyelle, autre]) };
}

function tirerMot(): MancheMot {
  const cible = pick(MOTS_A_LIRE);
  const leurres = shuffle(MOTS_A_LIRE.filter((m) => m.mot !== cible.mot)).slice(0, 2);
  return { cible, propositions: shuffle([cible, ...leurres]) };
}

export function EcranLecture({ onRetour }: { onRetour: () => void }) {
  const { dire, direSuite, vibrer } = useFeedback();
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();

  const [mode, setMode] = useState<Mode>('syllabes');
  const [syllabe, setSyllabe] = useState<MancheSyllabe>(tirerSyllabe);
  const [mot, setMot] = useState<MancheMot>(tirerMot);
  const [choisi, setChoisi] = useState<string | null>(null);
  const [serie, setSerie] = useState(0);
  const [message, setMessage] = useState('');
  const [salve, setSalve] = useState(0);
  const [gagne, setGagne] = useState(false);

  const cle = mode === 'syllabes' ? syllabe.cible : mot.cible.mot;

  /** Relit la consigne : la syllabe seule, ou le mot syllabe par syllabe. */
  const enoncer = useCallback(() => {
    if (mode === 'syllabes') {
      direSuite([syllabe.cible, syllabe.cible], true);
    } else {
      direSuite([...mot.cible.syllabes, mot.cible.parle], true);
    }
  }, [direSuite, mode, mot.cible, syllabe.cible]);

  useEffect(() => { enoncer(); }, [enoncer]);

  const nouvelleManche = useCallback(() => {
    if (mode === 'syllabes') setSyllabe(tirerSyllabe());
    else setMot(tirerMot());
    setChoisi(null);
    setMessage('');
    setGagne(false);
  }, [mode]);

  const changerMode = useCallback((cible: Mode) => {
    setMode(cible);
    setChoisi(null);
    setMessage('');
    setGagne(false);
    setSerie(0);
  }, []);

  const repondre = useCallback((valeur: string, juste: boolean, aDire: string) => {
    if (choisi !== null) return;
    setChoisi(valeur);

    if (juste) {
      const nouvelleSerie = serie + 1;
      setSerie(nouvelleSerie);
      setGagne(true);
      vibrer('succes');
      setSalve((n) => n + 1);
      ajouterEtoiles(1);
      enregistrerRecord(mode === 'syllabes' ? 'syllabes' : 'lecture', nouvelleSerie);
      const bravo = pick(PRAISES);
      setMessage(`${bravo} +1 ⭐`);
      dire(`${bravo} ${aDire}`);
      setTimeout(nouvelleManche, 2000);
    } else {
      vibrer('erreur');
      setSerie(0);
      setMessage(pick(ENCOURAGEMENTS));
      setTimeout(() => {
        setChoisi(null);
        enoncer();
      }, 1000);
    }
  }, [ajouterEtoiles, choisi, dire, enoncer, enregistrerRecord, mode,
    nouvelleManche, serie, vibrer]);

  const consigne = mode === 'syllabes'
    ? 'Touche la syllabe que tu entends'
    : 'Lis le mot, puis touche la bonne image';

  return (
    <Ecran titre="Je lis" degrade={gradients.lecture} onRetour={onRetour}>
      <View style={styles.centre} key={cle}>
        <View style={styles.onglets}>
          <Pilule
            titre="Syllabes"
            onPress={() => changerMode('syllabes')}
            couleur={mode === 'syllabes' ? colors.turquoise : colors.papier}
            couleurTexte={mode === 'syllabes' ? colors.papier : colors.encre}
          />
          <Pilule
            titre="Mots"
            onPress={() => changerMode('mots')}
            couleur={mode === 'mots' ? colors.turquoise : colors.papier}
            couleurTexte={mode === 'mots' ? colors.papier : colors.encre}
          />
        </View>

        {mode === 'syllabes' ? (
          <>
            <Pressable
              onPress={enoncer}
              accessibilityRole="button"
              accessibilityLabel="Réécouter la syllabe"
              style={({ pressed }) => [styles.hautParleur, shadow(5), pressed && styles.enfonce]}
            >
              <Text style={styles.hautParleurEmoji}>🔊</Text>
              <Text style={styles.hautParleurTexte}>Réécouter</Text>
            </Pressable>

            <Text style={styles.consigne}>{consigne}</Text>

            <View style={styles.grille}>
              {syllabe.propositions.map((s) => {
                const estChoisi = choisi === s;
                const juste = estChoisi && s === syllabe.cible;
                const faux = estChoisi && s !== syllabe.cible;
                return (
                  <Pressable
                    key={s}
                    onPress={() => repondre(s, s === syllabe.cible, s)}
                    accessibilityRole="button"
                    accessibilityLabel={`Syllabe ${s}`}
                    style={({ pressed }) => [
                      styles.tuile,
                      shadow(4),
                      juste && styles.juste,
                      faux && styles.faux,
                      pressed && styles.enfonce,
                    ]}
                  >
                    <Text style={[styles.tuileTexte, (juste || faux) && styles.texteFort]}>
                      {s}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={[styles.motCarte, shadow(4)]}>
              <View style={styles.syllabes}>
                {mot.cible.syllabes.map((s, i) => (
                  <React.Fragment key={`${s}-${i}`}>
                    {i > 0 && <Text style={styles.separateur}>·</Text>}
                    <Pressable
                      onPress={() => direSuite([s], true)}
                      accessibilityRole="button"
                      accessibilityLabel={`Syllabe ${s}`}
                      style={({ pressed }) => [styles.syllabe, pressed && styles.enfonce]}
                    >
                      <Text style={styles.syllabeTexte}>{s}</Text>
                    </Pressable>
                  </React.Fragment>
                ))}
              </View>
              <Pressable
                onPress={enoncer}
                accessibilityRole="button"
                accessibilityLabel="Écouter le mot syllabe par syllabe"
              >
                <Text style={styles.motAide}>🔊 Écouter syllabe par syllabe</Text>
              </Pressable>
            </View>

            <Text style={styles.consigne}>{consigne}</Text>

            <View style={styles.grille}>
              {mot.propositions.map((m) => {
                const estChoisi = choisi === m.mot;
                const juste = estChoisi && m.mot === mot.cible.mot;
                const faux = estChoisi && m.mot !== mot.cible.mot;
                return (
                  <Pressable
                    key={m.mot}
                    onPress={() => repondre(m.mot, m.mot === mot.cible.mot, mot.cible.parle)}
                    accessibilityRole="button"
                    accessibilityLabel={`Image ${m.mot}`}
                    style={({ pressed }) => [
                      styles.choixImage,
                      shadow(4),
                      juste && styles.juste,
                      faux && styles.faux,
                      pressed && styles.enfonce,
                    ]}
                  >
                    <Text style={styles.choixEmoji}>{m.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={[styles.message, gagne && styles.messageGagne]}>
          {message || (mode === 'syllabes'
            ? 'Réécoute autant de fois que tu veux 👂'
            : 'Touche une syllabe pour l\'entendre 👀')}
        </Text>

        <Text style={styles.score}>
          Série : {serie}   •   Record :{' '}
          {progress.records[mode === 'syllabes' ? 'syllabes' : 'lecture'] ?? 0}
        </Text>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', paddingTop: 4, gap: 14 },
  onglets: { flexDirection: 'row', gap: 10 },
  hautParleur: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingVertical: 12,
    paddingHorizontal: 34,
    alignItems: 'center',
  },
  hautParleurEmoji: { fontSize: 50, lineHeight: 58 },
  hautParleurTexte: { fontSize: 15, fontWeight: '700', color: colors.grisTexte },
  consigne: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.encre,
    textAlign: 'center',
  },
  motCarte: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    gap: 6,
  },
  syllabes: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  syllabe: { paddingHorizontal: 6, paddingVertical: 2 },
  syllabeTexte: { fontSize: 40, fontWeight: '800', color: colors.encre, letterSpacing: 1 },
  separateur: { fontSize: 34, color: colors.grisMoyen, fontWeight: '800' },
  motAide: { fontSize: 14, fontWeight: '700', color: colors.turquoise },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  tuile: {
    width: 130,
    height: 86,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tuileTexte: { fontSize: 38, fontWeight: '800', color: colors.encre, letterSpacing: 1 },
  choixImage: {
    width: 100,
    height: 100,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choixEmoji: { fontSize: 54, lineHeight: 62 },
  juste: { backgroundColor: colors.vert },
  faux: { backgroundColor: colors.rouge },
  texteFort: { color: colors.papier },
  enfonce: { transform: [{ translateY: 2 }] },
  message: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.grisTexte,
    textAlign: 'center',
    minHeight: 24,
  },
  messageGagne: { color: colors.vertFonce, fontSize: 20 },
  score: { fontSize: 14, fontWeight: '700', color: colors.grisTexte, marginTop: 'auto' },
});
