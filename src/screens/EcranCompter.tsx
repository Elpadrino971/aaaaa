/**
 * Jeu « Je compte » : des objets apparaissent, l'enfant choisit le bon nombre.
 * Il peut aussi toucher chaque objet un par un : l'application compte à voix
 * haute, ce qui installe la correspondance un objet = un nombre.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Ecran } from '../components/Ecran';
import { COUNTABLES, ENCOURAGEMENTS, NUMBER_NAMES, PRAISES } from '../data/content';
import { useFeedback } from '../lib/feedback';
import { makeChoices, pick, randInt } from '../lib/random';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

type Manche = {
  quantite: number;
  objet: string;
  propositions: number[];
};

/** Le maximum grandit avec la série en cours : 5, puis 8, puis 10. */
function maximumPour(serie: number) {
  if (serie < 4) return 5;
  if (serie < 8) return 8;
  return 10;
}

function nouvelleManche(serie: number): Manche {
  const max = maximumPour(serie);
  const quantite = randInt(1, max);
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  return {
    quantite,
    objet: pick(COUNTABLES),
    propositions: makeChoices(quantite, pool, Math.min(4, max)),
  };
}

export function EcranCompter({ onRetour }: { onRetour: () => void }) {
  const { dire, vibrer } = useFeedback();
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();

  const [serie, setSerie] = useState(0);
  const [manche, setManche] = useState<Manche>(() => nouvelleManche(0));
  const [choisi, setChoisi] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [salve, setSalve] = useState(0);
  const [comptes, setComptes] = useState<number[]>([]);

  const question = useMemo(
    () => `Combien y a-t-il de ${manche.objet} ?`,
    [manche],
  );

  useEffect(() => {
    dire('Combien y en a-t-il ?');
  }, [manche, dire]);

  const manchesuivante = useCallback((nouvelleSerie: number) => {
    setSerie(nouvelleSerie);
    setManche(nouvelleManche(nouvelleSerie));
    setChoisi(null);
    setMessage('');
    setComptes([]);
  }, []);

  const repondre = useCallback((valeur: number) => {
    if (choisi !== null) return;
    setChoisi(valeur);

    if (valeur === manche.quantite) {
      const nouvelleSerie = serie + 1;
      vibrer('succes');
      setSalve((n) => n + 1);
      ajouterEtoiles(1);
      enregistrerRecord('compter', nouvelleSerie);
      const bravo = pick(PRAISES);
      setMessage(`${bravo} ${NUMBER_NAMES[manche.quantite]} ! +1 ⭐`);
      dire(`${bravo} ${NUMBER_NAMES[manche.quantite]}`);
      setTimeout(() => manchesuivante(nouvelleSerie), 1600);
    } else {
      vibrer('erreur');
      setMessage(pick(ENCOURAGEMENTS));
      dire('Essaie encore');
      setTimeout(() => setChoisi(null), 900);
    }
  }, [ajouterEtoiles, choisi, dire, enregistrerRecord, manche.quantite,
    manchesuivante, serie, vibrer]);

  /** Toucher un objet le compte à voix haute. */
  const toucherObjet = useCallback((i: number) => {
    if (comptes.includes(i)) return;
    const suivants = [...comptes, i];
    setComptes(suivants);
    vibrer('tap');
    dire(NUMBER_NAMES[suivants.length] ?? String(suivants.length));
  }, [comptes, dire, vibrer]);

  return (
    <Ecran titre="Je compte" degrade={gradients.compter} onRetour={onRetour}>
      <View style={styles.centre}>
        <Text style={styles.question}>{question}</Text>

        <View style={[styles.scene, shadow(4)]}>
          {Array.from({ length: manche.quantite }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => toucherObjet(i)}
              accessibilityRole="button"
              accessibilityLabel={`Objet ${i + 1}`}
              style={styles.objet}
            >
              <Text style={[styles.objetTexte, comptes.includes(i) && styles.objetCompte]}>
                {manche.objet}
              </Text>
              {comptes.includes(i) && (
                <View style={styles.pastille}>
                  <Text style={styles.pastilleTexte}>{comptes.indexOf(i) + 1}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.message, choisi === manche.quantite && styles.messageGagne]}>
          {message || 'Touche les objets pour les compter 👆'}
        </Text>

        <View style={styles.reponses}>
          {manche.propositions.map((valeur) => {
            const estChoisi = choisi === valeur;
            const juste = estChoisi && valeur === manche.quantite;
            const faux = estChoisi && valeur !== manche.quantite;
            return (
              <Pressable
                key={valeur}
                onPress={() => repondre(valeur)}
                accessibilityRole="button"
                accessibilityLabel={NUMBER_NAMES[valeur] ?? String(valeur)}
                style={({ pressed }) => [
                  styles.reponse,
                  shadow(4),
                  juste && styles.reponseJuste,
                  faux && styles.reponseFausse,
                  pressed && styles.enfonce,
                ]}
              >
                <Text style={[styles.reponseTexte, (juste || faux) && styles.reponseTexteFort]}>
                  {valeur}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.score}>
          Série : {serie}   •   Record : {progress.records.compter ?? 0}
        </Text>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  question: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.encre,
    textAlign: 'center',
  },
  scene: {
    width: '100%',
    flex: 1,
    minHeight: 170,
    maxHeight: 380,
    backgroundColor: colors.papier,
    borderRadius: radius.m,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  objet: { padding: 4 },
  objetTexte: { fontSize: 44, lineHeight: 52 },
  objetCompte: { opacity: 0.45 },
  pastille: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: colors.vert,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleTexte: { color: colors.papier, fontWeight: '800', fontSize: 12 },
  message: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.grisTexte,
    textAlign: 'center',
    minHeight: 24,
  },
  messageGagne: { color: colors.vertFonce, fontSize: 20 },
  reponses: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  reponse: {
    minWidth: 74,
    height: 82,
    paddingHorizontal: 10,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reponseJuste: { backgroundColor: colors.vert },
  reponseFausse: { backgroundColor: colors.rouge },
  reponseTexte: { fontSize: 36, fontWeight: '800', color: colors.encre },
  reponseTexteFort: { color: colors.papier },
  enfonce: { transform: [{ translateY: 2 }] },
  score: { fontSize: 14, fontWeight: '700', color: colors.grisTexte },
});
