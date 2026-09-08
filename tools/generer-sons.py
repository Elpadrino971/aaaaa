#!/usr/bin/env python3
"""
Fabrique les bruitages de l'application.

Les sons sont synthétisés plutôt que téléchargés : ils sont donc libres de
droits, minuscules (quelques kilo-octets), et surtout reproductibles — pour en
changer le caractère, on modifie ce fichier et on le relance :

    python3 tools/generer-sons.py

Le parti pris sonore : doux, mat, jamais strident. Les enfants jouent souvent
le téléphone contre l'oreille, et un jeu d'apprentissage ne doit pas sanctionner
l'erreur par un son désagréable.

Aucune dépendance : uniquement la bibliothèque standard.
"""

import math
import random
import struct
import wave
from pathlib import Path

TAUX = 22050          # suffisant : la note la plus aiguë est à 2,6 kHz
AMPLITUDE_MAX = 0.55  # on garde de la marge, les haut-parleurs de téléphone saturent vite
FONDU = 0.005         # 5 ms d'entrée et de sortie, pour supprimer les clics

DESTINATION = Path(__file__).resolve().parent.parent / 'assets' / 'sons'


def enveloppe(t: float, duree: float, attaque: float, decroissance: float) -> float:
    """Enveloppe percussive : attaque courte puis décroissance exponentielle."""
    if t < attaque:
        return t / attaque
    return math.exp(-(t - attaque) / decroissance)


def note(frequence: float, duree: float, depart: float, amplitude: float,
         decroissance: float, harmonique: float = 0.3) -> list[tuple[float, float]]:
    """
    Une note de type cloche : fondamentale plus une octave discrète, ce qui
    donne un timbre proche d'un carillon ou d'un xylophone.
    """
    n = int(duree * TAUX)
    debut = int(depart * TAUX)
    sortie = []
    for i in range(n):
        t = i / TAUX
        env = enveloppe(t, duree, 0.004, decroissance)
        onde = math.sin(2 * math.pi * frequence * t)
        onde += harmonique * math.sin(4 * math.pi * frequence * t)
        sortie.append((debut + i, amplitude * env * onde / (1 + harmonique)))
    return sortie


def glissando(f1: float, f2: float, duree: float, depart: float,
              amplitude: float, decroissance: float) -> list[tuple[float, float]]:
    """Une note dont la hauteur glisse : sert au « pop » et au tourne-page."""
    n = int(duree * TAUX)
    debut = int(depart * TAUX)
    sortie = []
    phase = 0.0
    for i in range(n):
        t = i / TAUX
        f = f1 + (f2 - f1) * (t / duree)
        phase += 2 * math.pi * f / TAUX
        env = enveloppe(t, duree, 0.003, decroissance)
        sortie.append((debut + i, amplitude * env * math.sin(phase)))
    return sortie


def souffle(duree: float, depart: float, amplitude: float, lissage: int) -> list[tuple[float, float]]:
    """
    Bruit adouci par moyenne glissante : approxime un filtre passe-bas et donne
    un souffle de page qui tourne plutôt qu'un grésillement.
    """
    n = int(duree * TAUX)
    debut = int(depart * TAUX)
    brut = [random.uniform(-1, 1) for _ in range(n + lissage)]
    sortie = []
    for i in range(n):
        t = i / TAUX
        moyenne = sum(brut[i:i + lissage]) / lissage
        # Gonflement puis retombée, comme un geste.
        env = math.sin(math.pi * t / duree) ** 2
        sortie.append((debut + i, amplitude * env * moyenne))
    return sortie


def melanger(morceaux: list[list[tuple[float, float]]]) -> list[float]:
    """Superpose les morceaux et rabote ce qui dépasse."""
    longueur = max((m[-1][0] for m in morceaux if m), default=0) + 1
    piste = [0.0] * longueur
    for morceau in morceaux:
        for indice, valeur in morceau:
            piste[indice] += valeur

    crete = max((abs(v) for v in piste), default=1.0) or 1.0
    facteur = AMPLITUDE_MAX / crete if crete > AMPLITUDE_MAX else 1.0

    fondu = int(FONDU * TAUX)
    for i in range(len(piste)):
        piste[i] *= facteur
        if i < fondu:
            piste[i] *= i / fondu
        if i >= len(piste) - fondu:
            piste[i] *= (len(piste) - i) / fondu
    return piste


def ecrire(nom: str, piste: list[float]) -> None:
    chemin = DESTINATION / f'{nom}.wav'
    with wave.open(str(chemin), 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(TAUX)
        f.writeframes(b''.join(
            struct.pack('<h', max(-32768, min(32767, int(v * 32767)))) for v in piste
        ))
    print(f'  {chemin.name:14} {len(piste) / TAUX:.2f} s   {chemin.stat().st_size // 1024} Ko')


def main() -> None:
    random.seed(7)  # des sons identiques d'une génération à l'autre
    DESTINATION.mkdir(parents=True, exist_ok=True)
    print('Génération des bruitages :')

    # Le clic léger de chaque appui : très court, il ne doit pas fatiguer.
    ecrire('pop', melanger([glissando(620, 940, 0.07, 0, 0.9, 0.020)]))

    # Une étape franchie (un trait terminé, une lettre posée) : deux notes qui montent.
    ecrire('bien', melanger([
        note(659.3, 0.16, 0.00, 0.9, 0.055),   # mi
        note(880.0, 0.20, 0.09, 0.9, 0.070),   # la
    ]))

    # La réussite complète : un arpège majeur, franc et joyeux.
    ecrire('bravo', melanger([
        note(523.3, 0.30, 0.00, 0.9, 0.10),    # do
        note(659.3, 0.30, 0.09, 0.9, 0.10),    # mi
        note(784.0, 0.30, 0.18, 0.9, 0.11),    # sol
        note(1046.5, 0.55, 0.27, 1.0, 0.20),   # do aigu
    ]))

    # L'erreur : deux notes qui descendent, douces et basses. Jamais un buzzer.
    ecrire('oups', melanger([
        note(392.0, 0.18, 0.00, 0.7, 0.07, harmonique=0.15),
        note(329.6, 0.26, 0.11, 0.7, 0.10, harmonique=0.15),
    ]))

    # L'étoile gagnée : un scintillement qui monte.
    ecrire('etoile', melanger([
        note(1046.5, 0.16, 0.00, 0.7, 0.045, harmonique=0.5),
        note(1568.0, 0.16, 0.07, 0.7, 0.045, harmonique=0.5),
        note(2093.0, 0.30, 0.14, 0.8, 0.090, harmonique=0.5),
    ]))

    # La page qui tourne, dans les histoires.
    ecrire('page', melanger([
        souffle(0.22, 0.0, 0.8, 40),
        glissando(320, 220, 0.16, 0.02, 0.25, 0.06),
    ]))


if __name__ == '__main__':
    main()
