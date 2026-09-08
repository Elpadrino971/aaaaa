/**
 * Ludo Malin — jeux d'apprentissage pour les 3-7 ans.
 *
 * Composant racine : installe les fournisseurs de contexte, gère la navigation
 * (un menu et huit jeux) et le bouton retour physique d'Android.
 */

import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Route } from './src/navigation';
import { EcranAccueil } from './src/screens/EcranAccueil';
import { EcranCompter } from './src/screens/EcranCompter';
import { EcranEcoute } from './src/screens/EcranEcoute';
import { EcranLecture } from './src/screens/EcranLecture';
import { EcranMemory } from './src/screens/EcranMemory';
import { EcranMots } from './src/screens/EcranMots';
import { EcranParents } from './src/screens/EcranParents';
import { EcranSons } from './src/screens/EcranSons';
import { EcranTrace } from './src/screens/EcranTrace';
import { ProgressProvider } from './src/state/progress';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProgressProvider>
        <StatusBar style="dark" />
        <Navigation />
      </ProgressProvider>
    </SafeAreaProvider>
  );
}

function Navigation() {
  const [route, setRoute] = useState<Route>({ nom: 'accueil' });

  const retour = useCallback(() => {
    Speech.stop();
    setRoute({ nom: 'accueil' });
  }, []);

  const naviguer = useCallback((cible: Route) => {
    Speech.stop();
    setRoute(cible);
  }, []);

  // Sur Android, le bouton retour ramène au menu plutôt que de quitter l'app.
  useEffect(() => {
    const abonnement = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.nom === 'accueil') return false;
      retour();
      return true;
    });
    return () => abonnement.remove();
  }, [route.nom, retour]);

  // Aucune voix ne doit continuer après la fermeture de l'application.
  useEffect(() => () => { Speech.stop(); }, []);

  return (
    <View style={styles.racine}>
      {route.nom === 'accueil' && <EcranAccueil onNaviguer={naviguer} />}
      {route.nom === 'trace' && (
        <EcranTrace key={route.groupe} groupe={route.groupe} onRetour={retour} />
      )}
      {route.nom === 'sons' && <EcranSons onRetour={retour} />}
      {route.nom === 'lecture' && <EcranLecture onRetour={retour} />}
      {route.nom === 'compter' && <EcranCompter onRetour={retour} />}
      {route.nom === 'ecoute' && <EcranEcoute onRetour={retour} />}
      {route.nom === 'mots' && <EcranMots onRetour={retour} />}
      {route.nom === 'memory' && <EcranMemory onRetour={retour} />}
      {route.nom === 'parents' && <EcranParents onRetour={retour} />}
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
});
