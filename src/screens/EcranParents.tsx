/**
 * Zone parents : réglages, aperçu de la progression et remise à zéro.
 * Volontairement sobre — c'est le seul écran qui ne s'adresse pas à l'enfant.
 */

import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Bascule, Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { DIGIT_LIST, LETTER_LIST } from '../data/glyphs';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

export function EcranParents({ onRetour }: { onRetour: () => void }) {
  const { progress, basculerReglage, reinitialiser } = useProgress();

  const demanderReinitialisation = useCallback(() => {
    Alert.alert(
      'Tout remettre à zéro ?',
      'Les étoiles, les lettres tracées et les records seront effacés. Les réglages sont conservés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer', style: 'destructive', onPress: reinitialiser },
      ],
    );
  }, [reinitialiser]);

  return (
    <Ecran
      titre="Zone parents"
      degrade={gradients.accueil}
      onRetour={onRetour}
      sansEtoiles
      defilant
    >
      <View style={[styles.panneau, shadow(4)]}>
        <Text style={styles.titre}>Réglages</Text>
        <Bascule
          titre="Voix (consignes et félicitations)"
          actif={progress.reglages.voix}
          onPress={() => basculerReglage('voix')}
        />
        <View style={styles.separateur} />
        <Bascule
          titre="Vibrations"
          actif={progress.reglages.vibrations}
          onPress={() => basculerReglage('vibrations')}
        />
      </View>

      <View style={[styles.panneau, shadow(4)]}>
        <Text style={styles.titre}>Progression</Text>
        <Text style={styles.chiffreCle}>⭐ {progress.etoiles} étoiles</Text>

        <Text style={styles.sousTitre}>
          Lettres tracées : {progress.lettres.length} / {LETTER_LIST.length}
        </Text>
        <View style={styles.pastilles}>
          {LETTER_LIST.map((c) => (
            <View key={c} style={[styles.pastille, progress.lettres.includes(c) && styles.pastilleFaite]}>
              <Text style={[styles.pastilleTexte, progress.lettres.includes(c) && styles.pastilleTexteFait]}>
                {c}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sousTitre}>
          Chiffres tracés : {progress.chiffres.length} / {DIGIT_LIST.length}
        </Text>
        <View style={styles.pastilles}>
          {DIGIT_LIST.map((c) => (
            <View key={c} style={[styles.pastille, progress.chiffres.includes(c) && styles.pastilleFaite]}>
              <Text style={[styles.pastilleTexte, progress.chiffres.includes(c) && styles.pastilleTexteFait]}>
                {c}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.sousTitre}>Records</Text>
        <Text style={styles.ligne}>
          Je compte : {progress.records.compter ?? 0} bonnes réponses d'affilée
        </Text>
        <Text style={styles.ligne}>
          J'écoute : {progress.records.ecoute ?? 0} bonnes réponses d'affilée
        </Text>
        <Text style={styles.ligne}>
          Je forme des mots : {progress.records.mots ?? 0} mots dans une partie
        </Text>
        <Text style={styles.ligne}>
          Memory : {progress.records.memory ? `${progress.records.memory} coups` : '—'}
        </Text>
      </View>

      <View style={[styles.panneau, shadow(4)]}>
        <Text style={styles.titre}>À propos</Text>
        <Text style={styles.paragraphe}>
          Ludo Malin s'adresse aux enfants de 3 à 7 ans. Tout fonctionne hors ligne :
          aucune donnée ne quitte l'appareil, il n'y a ni publicité, ni compte à créer,
          ni achat intégré.
        </Text>
        <Text style={styles.paragraphe}>
          Conseil : dans « Je trace », laissez l'enfant suivre le point vert numéroté
          plutôt que de viser la perfection du geste. La tolérance est volontairement
          large pour les doigts encore malhabiles.
        </Text>
        <Pilule
          titre="Tout remettre à zéro"
          onPress={demanderReinitialisation}
          couleur={colors.rouge}
          couleurTexte={colors.papier}
        />
      </View>
    </Ecran>
  );
}

const styles = StyleSheet.create({
  panneau: {
    backgroundColor: colors.papier,
    borderRadius: radius.m,
    padding: 18,
    gap: 8,
  },
  titre: { fontSize: 20, fontWeight: '800', color: colors.encre },
  sousTitre: { fontSize: 15, fontWeight: '700', color: colors.encre, marginTop: 10 },
  chiffreCle: { fontSize: 26, fontWeight: '800', color: colors.encre },
  ligne: { fontSize: 15, color: colors.grisTexte, fontWeight: '600' },
  paragraphe: { fontSize: 15, lineHeight: 22, color: colors.grisTexte },
  separateur: { height: 1, backgroundColor: colors.gris },
  pastilles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pastille: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.gris,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleFaite: { backgroundColor: colors.vert },
  pastilleTexte: { fontSize: 14, fontWeight: '800', color: colors.encre },
  pastilleTexteFait: { color: colors.papier },
});
