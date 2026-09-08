/**
 * Progression de l'enfant et réglages, conservés sur l'appareil.
 *
 * Une seule clé AsyncStorage suffit : les données sont minuscules et toujours
 * lues d'un bloc. L'écriture est différée pour ne pas ralentir l'interface.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';

const STORAGE_KEY = 'ludo-malin/v1';

export type Settings = {
  /** Lecture à voix haute des consignes et des félicitations. */
  voix: boolean;
  /** Retour vibrant lors des réussites et des erreurs. */
  vibrations: boolean;
};

export type Progress = {
  etoiles: number;
  /** Lettres déjà tracées jusqu'au bout. */
  lettres: string[];
  /** Chiffres déjà tracés jusqu'au bout. */
  chiffres: string[];
  /** Meilleure série de bonnes réponses, par jeu. */
  records: Record<string, number>;
  reglages: Settings;
};

const VIDE: Progress = {
  etoiles: 0,
  lettres: [],
  chiffres: [],
  records: {},
  reglages: { voix: true, vibrations: true },
};

type Ctx = {
  progress: Progress;
  /** true tant que la sauvegarde n'a pas été relue au démarrage. */
  chargement: boolean;
  ajouterEtoiles: (n: number) => void;
  marquerTrace: (kind: 'letters' | 'digits', ch: string) => boolean;
  enregistrerRecord: (jeu: string, valeur: number) => void;
  basculerReglage: (cle: keyof Settings) => void;
  reinitialiser: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

function fusionner(brut: unknown): Progress {
  if (!brut || typeof brut !== 'object') return VIDE;
  const p = brut as Partial<Progress>;
  return {
    etoiles: typeof p.etoiles === 'number' ? p.etoiles : 0,
    lettres: Array.isArray(p.lettres) ? p.lettres : [],
    chiffres: Array.isArray(p.chiffres) ? p.chiffres : [],
    records: p.records && typeof p.records === 'object' ? p.records : {},
    reglages: { ...VIDE.reglages, ...(p.reglages ?? {}) },
  };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(VIDE);
  const [chargement, setChargement] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pret = useRef(false);

  useEffect(() => {
    let vivant = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((brut) => {
        if (!vivant) return;
        if (brut) {
          try {
            setProgress(fusionner(JSON.parse(brut)));
          } catch {
            // Sauvegarde illisible : on repart d'une progression vierge.
          }
        }
      })
      .finally(() => {
        if (!vivant) return;
        pret.current = true;
        setChargement(false);
      });
    return () => { vivant = false; };
  }, []);

  // Sauvegarde différée : on écrit au plus une fois par demi-seconde.
  useEffect(() => {
    if (!pret.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(() => {});
    }, 500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [progress]);

  const ajouterEtoiles = useCallback((n: number) => {
    setProgress((p) => ({ ...p, etoiles: p.etoiles + n }));
  }, []);

  /**
   * Note un signe comme tracé. Renvoie true s'il s'agit d'une première fois
   * (l'appelant offre alors une étoile).
   */
  const marquerTrace = useCallback((kind: 'letters' | 'digits', ch: string) => {
    let nouveau = false;
    setProgress((p) => {
      const cle = kind === 'digits' ? 'chiffres' : 'lettres';
      const deja = p[cle];
      if (deja.includes(ch)) return p;
      nouveau = true;
      return { ...p, [cle]: [...deja, ch], etoiles: p.etoiles + 1 };
    });
    return nouveau;
  }, []);

  const enregistrerRecord = useCallback((jeu: string, valeur: number) => {
    setProgress((p) => (
      (p.records[jeu] ?? 0) >= valeur ? p : { ...p, records: { ...p.records, [jeu]: valeur } }
    ));
  }, []);

  const basculerReglage = useCallback((cle: keyof Settings) => {
    setProgress((p) => ({ ...p, reglages: { ...p.reglages, [cle]: !p.reglages[cle] } }));
  }, []);

  const reinitialiser = useCallback(() => {
    setProgress((p) => ({ ...VIDE, reglages: p.reglages }));
  }, []);

  const valeur = useMemo<Ctx>(() => ({
    progress, chargement, ajouterEtoiles, marquerTrace,
    enregistrerRecord, basculerReglage, reinitialiser,
  }), [progress, chargement, ajouterEtoiles, marquerTrace,
    enregistrerRecord, basculerReglage, reinitialiser]);

  return <ProgressContext.Provider value={valeur}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress doit être utilisé dans un ProgressProvider');
  return ctx;
}
