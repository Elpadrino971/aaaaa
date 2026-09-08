/**
 * Menu principal : six grandes cartes, une par jeu.
 * Aucun texte n’est indispensable pour s’y retrouver — l’emoji et la couleur
 * suffisent à un enfant qui ne lit pas encore.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CarteJeu, Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { BulleMascotte } from '../components/BulleMascotte';
import { Heros } from '../components/Heros';
import { nomHeros } from '../data/avatar';
import { useProgress } from '../state/progress';
import { Route } from '../navigation';
import { colors, gradients, radius, shadow } from '../theme';

type Props = { onNaviguer: (route: Route) => void };

const JEUX: { route: Route; titre: string; sousTitre: string; emoji: string; couleur: string }[] = [
  { route: { nom: 'trace', groupe: 'lettres' }, titre: 'Je trace les lettres', sousTitre: "A B C, a b c et l’attaché", emoji: '✏️', couleur: colors.bleu },
  { route: { nom: 'trace', groupe: 'chiffres' }, titre: 'Je trace les chiffres', sousTitre: '0 1 2 … avec le doigt', emoji: '🔢', couleur: colors.violet },
  { route: { nom: 'sons' }, titre: 'Les sons', sousTitre: 'Le son qui commence le mot', emoji: '🔤', couleur: colors.rose },
  { route: { nom: 'lecture' }, titre: 'Je lis', sousTitre: 'Syllabes et premiers mots', emoji: '📖', couleur: colors.turquoise },
  { route: { nom: 'compter' }, titre: 'Je compte', sousTitre: 'Combien y en a-t-il ?', emoji: '🍎', couleur: colors.vert },
  { route: { nom: 'ecoute' }, titre: "J’écoute", sousTitre: 'Trouve ce que tu entends', emoji: '👂', couleur: colors.orange },
  { route: { nom: 'mots' }, titre: 'Je forme des mots', sousTitre: 'Remets les lettres en ordre', emoji: '🧩', couleur: colors.corail },
  { route: { nom: 'memory' }, titre: 'Le memory', sousTitre: 'Retrouve les paires', emoji: '🐼', couleur: colors.indigo },
];



/** Ce que Malin dit en haut du menu, selon l'avancée de l'enfant. */
function accueil(etoiles: number): string {
  if (etoiles === 0) return 'Bonjour ! Moi c’est Malin. On joue ?';
  if (etoiles < 10) return `Déjà ${etoiles} étoile${etoiles > 1 ? 's' : ''} ! Continue !`;
  if (etoiles < 40) return `${etoiles} étoiles ⭐ Tu deviens très fort !`;
  return `${etoiles} étoiles ! Tu es un vrai champion 🏆`;
}

export function EcranAccueil({ onNaviguer }: Props) {
  const { progress } = useProgress();

  return (
    <Ecran titre="Ludo Malin" degrade={gradients.accueil}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenu}>
        {/* L’histoire est mise en avant : c’est le jeu où l’enfant se voit. */}
        <Pressable
          onPress={() => onNaviguer({ nom: 'histoire' })}
          accessibilityRole="button"
          accessibilityLabel="Mon histoire, une aventure avec ton héros"
          style={({ pressed }) => [styles.vedette, shadow(5), pressed && styles.enfonce]}
        >
          <View style={styles.vedetteHeros}>
            {progress.heros
              ? <Heros avatar={progress.heros} taille={64} />
              : <Text style={styles.vedetteEmoji}>🦸</Text>}
          </View>
          <View style={styles.vedetteTexte}>
            <Text style={styles.vedetteTitre}>📚 Mon histoire</Text>
            <Text style={styles.vedetteSousTitre}>
              {progress.heros
                ? `Une aventure avec ${nomHeros(progress.heros)}`
                : 'Crée ton héros et pars à l’aventure'}
            </Text>
          </View>
          <Pressable
            onPress={() => onNaviguer({ nom: 'heros' })}
            accessibilityRole="button"
            accessibilityLabel="Modifier mon héros"
            hitSlop={10}
            style={styles.vedetteCrayon}
          >
            <Text style={styles.vedetteCrayonTexte}>🎨</Text>
          </Pressable>
        </Pressable>

        <View style={styles.grille}>
          {JEUX.map((jeu) => (
            <CarteJeu
              key={jeu.titre}
              titre={jeu.titre}
              sousTitre={jeu.sousTitre}
              emoji={jeu.emoji}
              couleur={jeu.couleur}
              onPress={() => onNaviguer(jeu.route)}
            />
          ))}
        </View>

        <BulleMascotte message={accueil(progress.etoiles)} taille={58} />

        <View style={styles.bas}>
          <Pilule titre="👨‍👩‍👧 Zone parents" onPress={() => onNaviguer({ nom: 'parents' })} />
        </View>
      </ScrollView>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  contenu: { paddingBottom: 20, gap: 14 },
  vedette: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.m,
    backgroundColor: colors.papier,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  vedetteHeros: { width: 64, alignItems: 'center', justifyContent: 'center' },
  vedetteEmoji: { fontSize: 48, lineHeight: 56 },
  vedetteTexte: { flex: 1, gap: 2 },
  vedetteTitre: { fontSize: 19, fontWeight: '800', color: colors.encre },
  vedetteSousTitre: { fontSize: 13, fontWeight: '600', color: colors.grisTexte },
  vedetteCrayon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.gris,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vedetteCrayonTexte: { fontSize: 22 },
  enfonce: { transform: [{ translateY: 2 }] },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bas: { alignItems: 'center' },
});
