/**
 * Zone parents : réglages, aperçu de la progression et remise à zéro.
 * Volontairement sobre — c’est le seul écran qui ne s’adresse pas à l’enfant.
 */

import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Bascule, Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { Ecriture, glyphList, versCapitale } from '../data/glyphs';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

/** Les quatre séries suivies, dans l’ordre d’apprentissage. */
const SERIES: { ecriture: Ecriture; titre: string }[] = [
  { ecriture: 'capitales', titre: "Capitales d’imprimerie" },
  { ecriture: 'script', titre: "Minuscules d’imprimerie" },
  { ecriture: 'cursive', titre: 'Écriture attachée' },
  { ecriture: 'chiffres', titre: 'Chiffres' },
];

const RECORDS: { cle: string; libelle: string; unite: string }[] = [
  { cle: 'sons', libelle: 'Les sons', unite: "bonnes réponses d’affilée" },
  { cle: 'syllabes', libelle: 'Je lis — syllabes', unite: "bonnes réponses d’affilée" },
  { cle: 'lecture', libelle: 'Je lis — mots', unite: "bonnes réponses d’affilée" },
  { cle: 'compter', libelle: 'Je compte', unite: "bonnes réponses d’affilée" },
  { cle: 'ecoute', libelle: "J’écoute", unite: "bonnes réponses d’affilée" },
  { cle: 'mots', libelle: 'Je forme des mots', unite: 'mots dans une partie' },
  { cle: 'histoires', libelle: 'Mon histoire', unite: 'histoires terminées' },
];

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
        <Text style={styles.chiffreCle}>
          ⭐ {progress.etoiles} étoile{progress.etoiles > 1 ? 's' : ''}
        </Text>

        {SERIES.map(({ ecriture, titre }) => {
          const liste = glyphList(ecriture);
          const faits = progress.traces[ecriture] ?? [];
          return (
            <View key={ecriture}>
              <Text style={styles.sousTitre}>
                {titre} : {faits.length} / {liste.length}
              </Text>
              <View style={styles.pastilles}>
                {liste.map((c) => {
                  const fait = faits.includes(c);
                  return (
                    <View
                      key={c}
                      style={[styles.pastille, fait && styles.pastilleFaite]}
                      accessibilityLabel={`${versCapitale(c)}${fait ? ', tracé' : ''}`}
                    >
                      <Text style={[styles.pastilleTexte, fait && styles.pastilleTexteFait]}>
                        {c}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <Text style={styles.sousTitre}>Records</Text>
        {RECORDS.map(({ cle, libelle, unite }) => (
          <Text key={cle} style={styles.ligne}>
            {libelle} : {progress.records[cle] ?? 0} {unite}
          </Text>
        ))}
        <Text style={styles.ligne}>
          Memory : {progress.records.memory ? `${progress.records.memory} coups` : '—'}
        </Text>
      </View>

      <View style={[styles.panneau, shadow(4)]}>
        <Text style={styles.titre}>À propos</Text>
        <Text style={styles.paragraphe}>
          Ludo Malin s’adresse aux enfants de 3 à 7 ans. Tout fonctionne hors ligne :
          aucune donnée ne quitte l’appareil, il n’y a ni publicité, ni compte à créer,
          ni achat intégré.
        </Text>
        <Text style={styles.paragraphe}>
          « Mon histoire » n’utilise aucune photo : le héros est un personnage
          dessiné que l’enfant compose lui-même, et les récits sont assemblés sur
          l’appareil à partir de textes écrits pour être déchiffrables. Le prénom
          saisi ne sert qu’aux histoires et reste sur le téléphone.
        </Text>
        <Text style={styles.paragraphe}>
          Conseil : dans « Je trace », laissez l’enfant suivre le point vert numéroté
          plutôt que de viser la perfection du geste. La tolérance est volontairement
          large pour les doigts encore malhabiles.
        </Text>
        <Text style={styles.paragraphe}>
          L’ordre habituel de l’école : d’abord les capitales, puis les minuscules
          d’imprimerie, enfin l’attaché — souvent seulement en grande section ou au
          CP. « Les sons » prépare la lecture, « Je lis » la met en pratique.
        </Text>
        <Pilule
          titre="Tout remettre à zéro"
          onPress={demanderReinitialisation}
          couleur={colors.rouge}
          couleurTexte={colors.papier}
        />
        <Text style={styles.note}>
          Les étoiles, les tracés et les records sont effacés. Le héros et les
          réglages sont conservés.
        </Text>
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
  note: { fontSize: 13, lineHeight: 19, color: colors.grisMoyen, marginTop: 4 },
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
