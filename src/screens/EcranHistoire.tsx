/**
 * Jeu « Mon histoire » : une aventure dont le héros est le personnage composé
 * par l’enfant, avec deux choix qui font bifurquer le récit.
 *
 * Le texte est court, écrit avec le vocabulaire des jeux de lecture, lu à voix
 * haute et affichable en capitales : l’histoire est aussi un exercice de
 * lecture, pas seulement une récompense. Tout est produit sur l’appareil.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Confetti } from '../components/Confetti';
import { Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { Heros } from '../components/Heros';
import { nomHeros } from '../data/avatar';
import { Decor, DECORS } from '../data/histoires';
import { construirePages, PAGES_TOTAL, Scenario, tirerScenario, titreHistoire } from '../lib/conteur';
import { useFeedback } from '../lib/feedback';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

type Props = { onRetour: () => void; onCreerHeros: () => void };

export function EcranHistoire({ onRetour, onCreerHeros }: Props) {
  const { progress, ajouterEtoiles, enregistrerRecord } = useProgress();
  const { dire, taire, vibrer } = useFeedback();

  const heros = progress.heros;
  const [decor, setDecor] = useState<Decor | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [geste, setGeste] = useState<number | undefined>(undefined);
  const [cachette, setCachette] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [capitales, setCapitales] = useState(false);
  const [salve, setSalve] = useState(0);
  const [recompense, setRecompense] = useState(false);

  const pages = useMemo(
    () => (heros && scenario ? construirePages(heros, scenario, geste, cachette) : []),
    [heros, scenario, geste, cachette],
  );
  const courante = pages[page];
  const derniere = page === PAGES_TOTAL - 1;

  // Lit la page dès qu’elle s’affiche.
  useEffect(() => {
    if (courante) dire(courante.texte.replace(/\n/g, '. '));
  }, [courante, dire]);

  // La dernière page clôt l’histoire : étoiles et confettis, une seule fois.
  useEffect(() => {
    if (!derniere || recompense) return;
    setRecompense(true);
    setSalve((n) => n + 1);
    vibrer('succes');
    ajouterEtoiles(2);
    enregistrerRecord('histoires', (progress.records.histoires ?? 0) + 1);
  }, [ajouterEtoiles, derniere, enregistrerRecord, progress.records.histoires, recompense, vibrer]);

  const commencer = useCallback((d: Decor) => {
    setDecor(d);
    setScenario(tirerScenario(d));
    setGeste(undefined);
    setCachette(undefined);
    setPage(0);
    setRecompense(false);
  }, []);

  const recommencer = useCallback(() => {
    taire();
    setDecor(null);
    setScenario(null);
    setRecompense(false);
  }, [taire]);

  const choisir = useCallback((i: number) => {
    vibrer('tap');
    if (page === 1) setGeste(i);
    else setCachette(i);
    setPage((p) => p + 1);
  }, [page, vibrer]);

  if (!heros) {
    return (
      <Ecran titre="Mon histoire" degrade={gradients.histoire} onRetour={onRetour}>
        <View style={styles.centre}>
          <Text style={styles.grosEmoji}>🦸</Text>
          <Text style={styles.invite}>
            Pour vivre une histoire, il faut d’abord un héros !
          </Text>
          <Pilule
            titre="Créer mon héros 🎨"
            onPress={onCreerHeros}
            couleur={colors.vert}
            couleurTexte={colors.papier}
          />
        </View>
      </Ecran>
    );
  }

  if (!decor || !scenario) {
    return (
      <Ecran titre="Mon histoire" degrade={gradients.histoire} onRetour={onRetour} defilant>
        <View style={styles.entete}>
          <Heros avatar={heros} taille={92} />
          <View style={styles.enteteTexte}>
            <Text style={styles.bonjour}>Bonjour {nomHeros(heros)} !</Text>
            <Text style={styles.question}>Où va ton aventure ?</Text>
          </View>
        </View>

        <View style={styles.grilleDecors}>
          {DECORS.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => commencer(d)}
              accessibilityRole="button"
              accessibilityLabel={d.nom}
              style={({ pressed }) => [styles.carteDecor, shadow(4), pressed && styles.enfonce]}
            >
              <Text style={styles.decorEmoji}>{d.emoji}</Text>
              <Text style={styles.decorNom}>{d.nom}</Text>
            </Pressable>
          ))}
        </View>
      </Ecran>
    );
  }

  return (
    <Ecran titre={majuscule(titreHistoire(heros, scenario))} degrade={decor.degrade} onRetour={onRetour}>
      <View style={styles.lecture}>
        <View style={styles.barreOutils}>
          <Text style={styles.compteur}>
            Page {page + 1} / {PAGES_TOTAL}
          </Text>
          <Pressable
            onPress={() => setCapitales((c) => !c)}
            accessibilityRole="button"
            accessibilityLabel={capitales ? 'Afficher en minuscules' : 'Afficher en capitales'}
            style={styles.bouton}
          >
            <Text style={styles.boutonTexte}>{capitales ? 'abc' : 'ABC'}</Text>
          </Pressable>
          <Pressable
            onPress={() => courante && dire(courante.texte.replace(/\n/g, '. '))}
            accessibilityRole="button"
            accessibilityLabel="Réécouter la page"
            style={styles.bouton}
          >
            <Text style={styles.boutonTexte}>🔊</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pageContenu}>
          <View style={[styles.pageCarte, shadow(4)]}>
            <View style={styles.scene}>
              <Heros avatar={heros} taille={78} />
              <Text style={styles.sceneEmoji}>{courante?.emoji}</Text>
            </View>
            <Text style={[styles.texte, capitales && styles.texteCapitales]}>
              {courante?.texte}
            </Text>
          </View>

          {courante?.choix ? (
            <View style={styles.choix}>
              {courante.choix.map((c, i) => (
                <Pressable
                  key={c.libelle}
                  onPress={() => choisir(i)}
                  accessibilityRole="button"
                  accessibilityLabel={c.libelle}
                  style={({ pressed }) => [styles.carteChoix, shadow(4), pressed && styles.enfonce]}
                >
                  <Text style={styles.choixEmoji}>{c.emoji}</Text>
                  <Text style={[styles.choixTexte, capitales && styles.texteCapitales]}>
                    {c.libelle}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.navigation}>
              <Pilule
                titre="‹"
                onPress={() => setPage((p) => Math.max(0, p - 1))}
                desactive={page === 0}
                accessibilityLabel="Page précédente"
                style={styles.boutonFleche}
              />
              {derniere ? (
                <Pilule
                  titre="Une autre histoire 📖"
                  onPress={recommencer}
                  couleur={colors.vert}
                  couleurTexte={colors.papier}
                />
              ) : (
                <Pilule
                  titre="Suivant ›"
                  onPress={() => setPage((p) => Math.min(pages.length - 1, p + 1))}
                  couleur={colors.turquoise}
                  couleurTexte={colors.papier}
                />
              )}
            </View>
          )}

          {derniere && <Text style={styles.gain}>+2 ⭐</Text>}
        </ScrollView>
      </View>

      <Confetti trigger={salve} />
    </Ecran>
  );
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

const styles = StyleSheet.create({
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, padding: 20 },
  grosEmoji: { fontSize: 90, lineHeight: 104 },
  invite: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.encre,
    textAlign: 'center',
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.m,
    padding: 10,
  },
  enteteTexte: { flex: 1, gap: 4 },
  bonjour: { fontSize: 19, fontWeight: '800', color: colors.encre },
  question: { fontSize: 15, fontWeight: '700', color: colors.grisTexte },
  grilleDecors: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  carteDecor: {
    width: '30%',
    minWidth: 100,
    aspectRatio: 0.95,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  decorEmoji: { fontSize: 42, lineHeight: 50 },
  decorNom: { fontSize: 13, fontWeight: '800', color: colors.encre, textAlign: 'center' },
  lecture: { flex: 1, gap: 8 },
  barreOutils: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compteur: { flex: 1, fontSize: 14, fontWeight: '800', color: colors.grisTexte },
  bouton: {
    minWidth: 52,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.rond,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonTexte: { fontSize: 16, fontWeight: '800', color: colors.encre },
  pageContenu: { gap: 14, paddingBottom: 20 },
  pageCarte: {
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    padding: 16,
    gap: 12,
  },
  scene: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  sceneEmoji: { fontSize: 76, lineHeight: 88 },
  texte: {
    fontSize: 21,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.encre,
    textAlign: 'center',
  },
  texteCapitales: { textTransform: 'uppercase', letterSpacing: 0.5 },
  choix: { flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  carteChoix: {
    flex: 1,
    minWidth: 130,
    borderRadius: radius.m,
    backgroundColor: colors.jaune,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 4,
  },
  choixEmoji: { fontSize: 40, lineHeight: 48 },
  choixTexte: { fontSize: 15, fontWeight: '800', color: colors.encre, textAlign: 'center' },
  navigation: { flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' },
  boutonFleche: { paddingHorizontal: 24 },
  enfonce: { transform: [{ translateY: 2 }] },
  gain: { textAlign: 'center', fontSize: 22, fontWeight: '800', color: colors.vertFonce },
});
