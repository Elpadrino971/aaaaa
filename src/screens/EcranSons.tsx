/**
 * Jeu « Les sons » : la conscience phonologique, première marche vers la
 * lecture. Deux types de questions alternent pour travailler le lien
 * lettre ↔ son dans les deux sens :
 *
 *   • une image est montrée, l’enfant retrouve la lettre qui commence le mot ;
 *   • une lettre est donnée, l’enfant retrouve l’image qui commence par ce son.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Ecran } from '../components/Ecran';
import { ENCOURAGEMENTS, PRAISES } from '../data/content';
import { LETTRES_SONS, MOTS_PAR_SON, MotSon } from '../data/lecture';
import { useFeedback } from '../lib/feedback';
import { makeChoices, pick, shuffle } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

type Manche =
  /** Une image, quatre lettres : « par quelle lettre commence ce mot ? » */
  | { type: 'motVersLettre'; cible: MotSon; lettres: string[] }
  /** Une lettre, trois images : « quel mot commence par ce son ? » */
  | { type: 'lettreVersMot'; cible: MotSon; images: MotSon[] };

function tirerManche(numero: number): Manche {
  const cible = pick(MOTS_PAR_SON);

  // On alterne les deux formes de question pour ne pas installer une routine.
  if (numero % 2 === 0) {
    return {
      type: 'motVersLettre',
      cible,
      lettres: makeChoices(cible.lettre, LETTRES_SONS, 4),
    };
  }

  const leurres = shuffle(MOTS_PAR_SON.filter((m) => m.lettre !== cible.lettre));
  // Deux leurres de sons initiaux différents entre eux, pour éviter le doublon.
  const choisis: MotSon[] = [];
  for (const leurre of leurres) {
    if (choisis.every((c) => c.lettre !== leurre.lettre)) choisis.push(leurre);
    if (choisis.length === 2) break;
  }
  return { type: 'lettreVersMot', cible, images: shuffle([cible, ...choisis]) };
}

export function EcranSons({ onRetour }: { onRetour: () => void }) {
  const { dire, vibrer } = useFeedback();
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();

  const [numero, setNumero] = useState(0);
  const [manche, setManche] = useState<Manche>(() => tirerManche(0));
  const [choisi, setChoisi] = useState<string | null>(null);
  const [serie, setSerie] = useState(0);
  const [message, setMessage] = useState('');
  const [salve, setSalve] = useState(0);

  const consigne = manche.type === 'motVersLettre'
    ? `Par quelle lettre commence « ${manche.cible.mot} » ?`
    : `Quel mot commence par la lettre ${manche.cible.lettre} ?`;

  const enoncer = useCallback(() => {
    if (manche.type === 'motVersLettre') {
      dire(`${manche.cible.mot}. Par quelle lettre commence ce mot ?`);
    } else {
      dire(`Quel mot commence par la lettre ${manche.cible.lettre} ?`);
    }
  }, [dire, manche]);

  useEffect(() => { enoncer(); }, [enoncer]);

  const manchesuivante = useCallback(() => {
    const suivant = numero + 1;
    setNumero(suivant);
    setManche(tirerManche(suivant));
    setChoisi(null);
    setMessage('');
  }, [numero]);

  const repondre = useCallback((valeur: string, juste: boolean) => {
    if (choisi !== null) return;
    setChoisi(valeur);

    if (juste) {
      const nouvelleSerie = serie + 1;
      setSerie(nouvelleSerie);
      vibrer('succes');
      setSalve((n) => n + 1);
      ajouterEtoiles(1);
      enregistrerRecord('sons', nouvelleSerie);
      const bravo = pick(PRAISES);
      setMessage(`${bravo} +1 ⭐`);
      dire(`${bravo} ${manche.cible.mot} commence par la lettre ${manche.cible.lettre}`);
      setTimeout(manchesuivante, 2200);
    } else {
      vibrer('erreur');
      setSerie(0);
      setMessage(pick(ENCOURAGEMENTS));
      dire(`Non. Écoute bien : ${manche.cible.mot}`);
      setTimeout(() => setChoisi(null), 1200);
    }
  }, [ajouterEtoiles, choisi, dire, enregistrerRecord, manche.cible,
    manchesuivante, serie, vibrer]);

  const gagne = choisi !== null && message !== '' && !ENCOURAGEMENTS.includes(message);

  return (
    <Ecran titre="Les sons" degrade={gradients.sons} onRetour={onRetour}>
      <View style={styles.centre}>
        <Pressable
          onPress={enoncer}
          accessibilityRole="button"
          accessibilityLabel={`Réécouter : ${consigne}`}
          style={styles.consigne}
        >
          <Text style={styles.consigneTexte}>{consigne} 🔊</Text>
        </Pressable>

        {manche.type === 'motVersLettre' ? (
          <>
            <Pressable
              onPress={() => dire(manche.cible.mot)}
              accessibilityRole="button"
              accessibilityLabel={`Écouter : ${manche.cible.mot}`}
              style={[styles.image, shadow(4)]}
            >
              <Text style={styles.imageEmoji}>{manche.cible.emoji}</Text>
              <Text style={styles.imageTexte}>{manche.cible.mot} 🔊</Text>
            </Pressable>

            <View style={styles.lettres}>
              {manche.lettres.map((lettre) => {
                const estChoisi = choisi === lettre;
                const juste = estChoisi && lettre === manche.cible.lettre;
                const faux = estChoisi && lettre !== manche.cible.lettre;
                return (
                  <Pressable
                    key={lettre}
                    onPress={() => repondre(lettre, lettre === manche.cible.lettre)}
                    accessibilityRole="button"
                    accessibilityLabel={`Lettre ${lettre}`}
                    style={({ pressed }) => [
                      styles.lettre,
                      shadow(4),
                      juste && styles.juste,
                      faux && styles.faux,
                      pressed && styles.enfonce,
                    ]}
                  >
                    <Text style={[styles.lettreTexte, (juste || faux) && styles.texteFort]}>
                      {lettre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <View style={[styles.grosseLettre, shadow(4)]}>
              <Text style={styles.grosseLettreTexte}>
                {manche.cible.lettre} {manche.cible.lettre.toLowerCase()}
              </Text>
            </View>

            <View style={styles.images}>
              {manche.images.map((m) => {
                const estChoisi = choisi === m.mot;
                const juste = estChoisi && m.lettre === manche.cible.lettre;
                const faux = estChoisi && m.lettre !== manche.cible.lettre;
                return (
                  <Pressable
                    key={m.mot}
                    onPress={() => repondre(m.mot, m.lettre === manche.cible.lettre)}
                    accessibilityRole="button"
                    accessibilityLabel={m.mot}
                    style={({ pressed }) => [
                      styles.choixImage,
                      shadow(4),
                      juste && styles.juste,
                      faux && styles.faux,
                      pressed && styles.enfonce,
                    ]}
                  >
                    <Text style={styles.choixEmoji}>{m.emoji}</Text>
                    <Text style={[styles.choixTexte, (juste || faux) && styles.texteFort]}>
                      {m.mot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={[styles.message, gagne && styles.messageGagne]}>
          {message || 'Écoute bien le début du mot 👂'}
        </Text>

        <Text style={styles.score}>
          Série : {serie}   •   Record : {progress.records.sons ?? 0}
        </Text>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', paddingTop: 4, gap: 14 },
  consigne: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.rond,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  consigneTexte: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.encre,
    textAlign: 'center',
  },
  image: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  imageEmoji: { fontSize: 74, lineHeight: 86 },
  imageTexte: { fontSize: 16, fontWeight: '700', color: colors.grisTexte },
  lettres: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  lettre: {
    width: 76,
    height: 80,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettreTexte: { fontSize: 38, fontWeight: '800', color: colors.encre },
  grosseLettre: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingVertical: 8,
    paddingHorizontal: 34,
  },
  grosseLettreTexte: { fontSize: 60, fontWeight: '800', color: colors.violet },
  images: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  choixImage: {
    width: 106,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    paddingVertical: 10,
  },
  choixEmoji: { fontSize: 50, lineHeight: 58 },
  choixTexte: { fontSize: 14, fontWeight: '700', color: colors.encre },
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
