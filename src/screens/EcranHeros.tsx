/**
 * L’atelier du héros : l’enfant compose son personnage, qui devient ensuite
 * le protagoniste de toutes les histoires.
 *
 * Aucune photo n’est demandée. Le personnage est dessiné (voir components/
 * Heros.tsx), donc rien de sensible n’est stocké ni transmis, et l’enfant
 * garde le plaisir de se reconnaître dans son héros.
 */

import React, { useCallback, useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

import { Pilule } from '../components/Boutons';
import { Ecran } from '../components/Ecran';
import { Heros } from '../components/Heros';
import {
  Avatar, AVATAR_PAR_DEFAUT, CHEVEUX, COSTUMES, COULEURS_CHEVEUX, TEINTS, YEUX,
} from '../data/avatar';
import { useFeedback } from '../lib/feedback';
import { useProgress } from '../state/progress';
import { colors, gradients, radius, shadow } from '../theme';

export function EcranHeros({ onRetour, onFini }: { onRetour: () => void; onFini?: () => void }) {
  const { progress, definirHeros } = useProgress();
  const { dire, vibrer } = useFeedback();
  const [avatar, setAvatar] = useState<Avatar>(progress.heros ?? AVATAR_PAR_DEFAUT);

  const modifier = useCallback(<K extends keyof Avatar>(cle: K, valeur: Avatar[K]) => {
    vibrer('tap');
    setAvatar((a) => ({ ...a, [cle]: valeur }));
  }, [vibrer]);

  const valider = useCallback(() => {
    definirHeros(avatar);
    vibrer('succes');
    const prenom = avatar.prenom.trim();
    dire(prenom ? `Super ! Voici ${prenom} !` : 'Super ! Ton héros est prêt !');
    (onFini ?? onRetour)();
  }, [avatar, definirHeros, dire, onFini, onRetour, vibrer]);

  return (
    <Ecran titre="Mon héros" degrade={gradients.heros} onRetour={onRetour}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contenu}>
        <View style={[styles.scene, shadow(4)]}>
          <Heros avatar={avatar} taille={150} />
        </View>

        <View style={[styles.panneau, shadow(3)]}>
          <Text style={styles.etiquette}>Son prénom</Text>
          <TextInput
            value={avatar.prenom}
            onChangeText={(t) => setAvatar((a) => ({ ...a, prenom: t.slice(0, 14) }))}
            placeholder="Écris ton prénom"
            placeholderTextColor={colors.grisMoyen}
            style={styles.champ}
            maxLength={14}
            autoCapitalize="words"
            returnKeyType="done"
            accessibilityLabel="Prénom du héros"
          />
          <View style={styles.ligneChoix}>
            <Pilule
              titre="Un héros"
              onPress={() => modifier('accord', 'masculin')}
              couleur={avatar.accord === 'masculin' ? colors.bleu : colors.papier}
              couleurTexte={avatar.accord === 'masculin' ? colors.papier : colors.encre}
            />
            <Pilule
              titre="Une héroïne"
              onPress={() => modifier('accord', 'feminin')}
              couleur={avatar.accord === 'feminin' ? colors.rose : colors.papier}
              couleurTexte={avatar.accord === 'feminin' ? colors.papier : colors.encre}
            />
          </View>
        </View>

        <Rangee titre="Le costume">
          {COSTUMES.map((c) => (
            <Vignette
              key={c.id}
              actif={avatar.costume === c.id}
              onPress={() => modifier('costume', c.id)}
              accessibilityLabel={`Costume ${c.nom}`}
            >
              <Text style={styles.vignetteEmoji}>{c.emoji}</Text>
              <Text style={styles.vignetteTexte}>{c.nom}</Text>
            </Vignette>
          ))}
        </Rangee>

        <Rangee titre="La peau">
          {TEINTS.map((t) => (
            <Pastille
              key={t.id}
              couleur={t.couleur}
              actif={avatar.teint === t.id}
              onPress={() => modifier('teint', t.id)}
              accessibilityLabel={`Teint ${t.id}`}
            />
          ))}
        </Rangee>

        <Rangee titre="La coiffure">
          {CHEVEUX.map((c) => (
            <Vignette
              key={c.id}
              actif={avatar.cheveux === c.id}
              onPress={() => modifier('cheveux', c.id)}
              accessibilityLabel={`Cheveux ${c.nom}`}
            >
              <Heros avatar={{ ...avatar, cheveux: c.id }} taille={56} cadrage="visage" sansCouvreChef />
            </Vignette>
          ))}
        </Rangee>

        <Rangee titre="La couleur des cheveux">
          {COULEURS_CHEVEUX.map((c) => (
            <Pastille
              key={c.id}
              couleur={c.couleur}
              actif={avatar.couleurCheveux === c.id}
              onPress={() => modifier('couleurCheveux', c.id)}
              accessibilityLabel={`Cheveux ${c.id}`}
            />
          ))}
        </Rangee>

        <Rangee titre="Les yeux">
          {YEUX.map((y) => (
            <Vignette
              key={y.id}
              actif={avatar.yeux === y.id}
              onPress={() => modifier('yeux', y.id)}
              accessibilityLabel={`Yeux ${y.nom}`}
            >
              <Heros avatar={{ ...avatar, yeux: y.id }} taille={56} cadrage="visage" sansCouvreChef />
            </Vignette>
          ))}
        </Rangee>

        <Pilule
          titre="C’est parti ! 🎉"
          onPress={valider}
          couleur={colors.vert}
          couleurTexte={colors.papier}
          style={styles.valider}
        />
      </ScrollView>
    </Ecran>
  );
}

function Rangee({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <View style={styles.rangee}>
      <Text style={styles.etiquette}>{titre}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangeeContenu}>
        {children}
      </ScrollView>
    </View>
  );
}

function Vignette(
  { actif, onPress, children, accessibilityLabel }:
  { actif: boolean; onPress: () => void; children: React.ReactNode; accessibilityLabel: string },
) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: actif }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.vignette, shadow(2), actif && styles.vignetteActive]}
    >
      {children}
    </Pressable>
  );
}

function Pastille(
  { couleur, actif, onPress, accessibilityLabel }:
  { couleur: string; actif: boolean; onPress: () => void; accessibilityLabel: string },
) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: actif }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.pastille, shadow(2), { backgroundColor: couleur }, actif && styles.pastilleActive]}
    />
  );
}

const styles = StyleSheet.create({
  contenu: { paddingBottom: 24, gap: 12 },
  scene: {
    alignSelf: 'center',
    backgroundColor: colors.papier,
    borderRadius: radius.l,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  panneau: {
    backgroundColor: colors.papier,
    borderRadius: radius.m,
    padding: 14,
    gap: 10,
  },
  etiquette: { fontSize: 15, fontWeight: '800', color: colors.encre },
  champ: {
    borderWidth: 2,
    borderColor: colors.gris,
    backgroundColor: colors.gris,
    borderRadius: radius.s,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 20,
    fontWeight: '700',
    color: colors.encre,
  },
  ligneChoix: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  rangee: { gap: 6 },
  rangeeContenu: { gap: 10, paddingVertical: 4, paddingHorizontal: 2 },
  vignette: {
    minWidth: 74,
    minHeight: 74,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.s,
    backgroundColor: colors.papier,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  vignetteActive: { borderColor: colors.bleu },
  vignetteEmoji: { fontSize: 30, lineHeight: 36 },
  vignetteTexte: { fontSize: 12, fontWeight: '700', color: colors.encre },
  pastille: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  pastilleActive: { borderColor: colors.bleu },
  valider: { alignSelf: 'center', paddingHorizontal: 40, marginTop: 6 },
});
