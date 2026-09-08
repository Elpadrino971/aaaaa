/**
 * Coquille commune à tous les écrans : fond dégradé, barre de titre,
 * bouton retour et compteur d’étoiles.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProgress } from '../state/progress';
import { colors, radius, shadow } from '../theme';

type Props = {
  titre: string;
  degrade: readonly string[];
  onRetour?: () => void;
  /** Masque le compteur d’étoiles (zone parents par exemple). */
  sansEtoiles?: boolean;
  /** Rend le contenu défilant plutôt que fixe. */
  defilant?: boolean;
  children: React.ReactNode;
};

export function Ecran({
  titre, degrade, onRetour, sansEtoiles = false, defilant = false, children,
}: Props) {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();

  const contenu = defilant
    ? (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.defilant}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    )
    : <View style={styles.flex}>{children}</View>;

  return (
    <LinearGradient
      colors={degrade as [string, string, ...string[]]}
      style={styles.fond}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
    >
      <View
        style={[
          styles.contenu,
          { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <View style={styles.barre}>
          {onRetour ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour au menu"
              onPress={onRetour}
              style={({ pressed }) => [styles.retour, shadow(2), pressed && styles.enfonce]}
            >
              <Text style={styles.retourTexte}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.espaceur} />
          )}

          <Text style={styles.titre} numberOfLines={1}>{titre}</Text>

          {sansEtoiles ? (
            <View style={styles.espaceur} />
          ) : (
            <View
              style={[styles.etoiles, shadow(2)]}
              accessibilityLabel={`${progress.etoiles} étoiles gagnées`}
            >
              <Text style={styles.etoilesTexte}>⭐ {progress.etoiles}</Text>
            </View>
          )}
        </View>

        {contenu}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fond: { flex: 1 },
  flex: { flex: 1 },
  contenu: {
    flex: 1,
    paddingHorizontal: 14,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  defilant: { paddingBottom: 24, gap: 12 },
  barre: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
  },
  retour: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retourTexte: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.encre,
    marginTop: -4,
  },
  espaceur: { width: 52, height: 52 },
  enfonce: { transform: [{ translateY: 2 }] },
  titre: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.encre,
  },
  etoiles: {
    minWidth: 68,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radius.rond,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etoilesTexte: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.encre,
  },
});
