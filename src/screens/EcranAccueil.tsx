/**
 * Menu principal : six grandes cartes, une par jeu.
 * Aucun texte n'est indispensable pour s'y retrouver — l'emoji et la couleur
 * suffisent à un enfant qui ne lit pas encore.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CarteJeu, Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { useProgress } from '../state/progress';
import { Route } from '../navigation';
import { colors, gradients } from '../theme';

type Props = { onNaviguer: (route: Route) => void };

const JEUX: { route: Route; titre: string; sousTitre: string; emoji: string; couleur: string }[] = [
  { route: { nom: 'trace', kind: 'letters' }, titre: 'Je trace les lettres', sousTitre: 'A B C … avec le doigt', emoji: '✏️', couleur: colors.bleu },
  { route: { nom: 'trace', kind: 'digits' }, titre: 'Je trace les chiffres', sousTitre: '0 1 2 … avec le doigt', emoji: '🔢', couleur: colors.violet },
  { route: { nom: 'compter' }, titre: 'Je compte', sousTitre: 'Combien y en a-t-il ?', emoji: '🍎', couleur: colors.vert },
  { route: { nom: 'ecoute' }, titre: "J'écoute", sousTitre: 'Trouve ce que tu entends', emoji: '👂', couleur: colors.rose },
  { route: { nom: 'mots' }, titre: 'Je forme des mots', sousTitre: 'Remets les lettres en ordre', emoji: '🧩', couleur: colors.orange },
  { route: { nom: 'memory' }, titre: 'Le memory', sousTitre: 'Retrouve les paires', emoji: '🐼', couleur: colors.turquoise },
];

export function EcranAccueil({ onNaviguer }: Props) {
  const { progress } = useProgress();

  return (
    <Ecran titre="Ludo Malin" degrade={gradients.accueil}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenu}>
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

        <Text style={styles.bilan}>
          {progress.etoiles === 0
            ? 'Choisis un jeu pour gagner tes premières étoiles ⭐'
            : `Tu as gagné ${progress.etoiles} étoile${progress.etoiles > 1 ? 's' : ''} ⭐`}
        </Text>

        <View style={styles.bas}>
          <Pilule titre="👨‍👩‍👧 Zone parents" onPress={() => onNaviguer({ nom: 'parents' })} />
        </View>
      </ScrollView>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  contenu: { paddingBottom: 20, gap: 14 },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bilan: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.grisTexte,
  },
  bas: { alignItems: 'center' },
});
