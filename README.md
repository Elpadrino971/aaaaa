# 🎓 Ludo Malin

**Application mobile native de jeux d'apprentissage pour les enfants de 3 à 7 ans.**
Tracer les lettres et les chiffres du bout du doigt, compter, reconnaître les sons,
former des mots, jouer au memory.

Application React Native (Expo), iOS et Android, entièrement en français.
Tout fonctionne **hors ligne** : pas de compte, pas de publicité, pas d'achat
intégré, aucune donnée ne quitte l'appareil.

---

## 🎮 Les six jeux

| Jeu | Ce que l'enfant apprend |
| --- | --- |
| ✏️ **Je trace les lettres** | Le geste d'écriture des 26 majuscules, trait par trait, dans le bon ordre et le bon sens |
| 🔢 **Je trace les chiffres** | Le geste d'écriture des chiffres de 0 à 9 |
| 🍎 **Je compte** | Le dénombrement jusqu'à 10, avec comptage guidé objet par objet |
| 👂 **J'écoute** | Reconnaître une lettre ou un chiffre prononcé à voix haute |
| 🧩 **Je forme des mots** | Reconstituer 30 mots courants à partir de leurs lettres mélangées |
| 🐼 **Le memory** | L'attention et la mémoire visuelle |

Chaque réussite rapporte une étoile ⭐. La progression est conservée sur
l'appareil et consultable dans la zone parents.

## ✨ Choix de conception

- **Pensé pour de petits doigts** : toutes les zones tactiles font au moins
  56 dp, la tolérance du tracé est volontairement large.
- **Utilisable avant de savoir lire** : chaque jeu est identifiable par sa
  couleur et son emoji, et toutes les consignes sont dites à voix haute
  (synthèse vocale française).
- **Aucune sanction** : une erreur déclenche un encouragement, jamais une
  pénalité ni un compte à rebours.
- **Zone parents** : réglages voix et vibrations, tableau de progression,
  remise à zéro.

## 🚀 Lancer l'application

```bash
npm install
npm start          # ouvre Expo ; scannez le QR code avec Expo Go
```

Ou directement sur une cible précise :

```bash
npm run android    # émulateur ou appareil Android
npm run ios        # simulateur iOS (macOS requis)
npm run web        # aperçu dans le navigateur
```

### Générer les applications installables

```bash
npx expo prebuild            # génère les projets natifs ios/ et android/
npx eas build -p android     # ou -p ios, via EAS Build
```

### Vérifications

```bash
npm run typecheck   # TypeScript strict
npm run doctor      # diagnostic Expo
```

## 🏗️ Comment fonctionne le tracé

C'est la partie la plus délicate de l'application.

1. Chaque lettre est décrite dans [`src/data/glyphs.ts`](src/data/glyphs.ts)
   comme une liste de traits — des chemins SVG dans un repère de 100 × 100 —
   rangés dans l'ordre où on apprend à les écrire.
2. [`src/lib/pathSampler.ts`](src/lib/pathSampler.ts) convertit ces chemins
   (commandes `M`, `L`, `H`, `V`, `C`, `A`) en une suite de points
   régulièrement espacés. Le web offrirait `getPointAtLength()`, absent en
   React Native : la conversion, arcs elliptiques compris, est donc faite à la
   main en JavaScript pur.
3. Pendant le geste, un curseur avance le long de cette suite de points dès que
   le doigt passe à moins de 11 unités du point suivant. Il ne peut ni reculer,
   ni sauter plus de 16 points d'un coup : le tracé doit donc partir du bon
   endroit et suivre la bonne direction, sans exiger de précision.
4. Le trait est validé à trois points de la fin, et la lettre lorsque tous ses
   traits le sont.

## 📁 Organisation du code

```
App.tsx                    composant racine, navigation, bouton retour Android
src/
  navigation.ts            description des écrans
  theme.ts                 couleurs, arrondis, ombres
  data/
    glyphs.ts              tracés des 26 lettres et des 10 chiffres
    content.ts             mots-repères, listes de mots, emoji
  lib/
    pathSampler.ts         échantillonnage des chemins SVG
    feedback.ts            voix de synthèse et vibrations
    random.ts              tirages aléatoires
  state/
    progress.tsx           étoiles, réglages et records (AsyncStorage)
  components/
    Ecran.tsx              coquille commune : fond, titre, compteur d'étoiles
    Boutons.tsx            boutons, cartes du menu, interrupteurs
    Confetti.tsx           animation de réussite
  screens/                 un fichier par jeu
```

## 🧰 Dépendances

Expo SDK 57 · React Native 0.86 · TypeScript strict ·
`react-native-svg` (tracés) · `expo-speech` (voix française) ·
`expo-haptics` (vibrations) · `@react-native-async-storage/async-storage`
(progression) · `expo-linear-gradient` · `react-native-safe-area-context`.

## 📄 Licence

MIT — voir [LICENSE](LICENSE).
