/**
 * Fabrique les icônes de l'application à partir de assets/mascotte.svg.
 *
 *     node tools/generer-icones.js
 *
 * Nécessite Playwright, utilisé ici uniquement comme moteur de rendu :
 *     npm i -D playwright   (ou npx playwright install chromium)
 *
 * Les icônes sont donc dérivées de la mascotte, pas dessinées à part : changer
 * le renard change les icônes, et elles restent cohérentes entre elles.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RACINE = path.resolve(__dirname, '..');
const MASCOTTE = fs.readFileSync(path.join(RACINE, 'assets', 'mascotte.svg'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .trim();

/** Le renard, mis à l'échelle voulue et centré dans un carré. */
function renard(pourcentage, filtre = '') {
  return `<div style="width:${pourcentage}%;height:${pourcentage}%;${filtre}">${MASCOTTE
    .replace('width="100" height="100"', 'width="100%" height="100%"')}</div>`;
}

const FOND_BLEU = 'linear-gradient(150deg,#7183ff,#4a56d6)';

const ICONES = [
  // Icône principale : fond bleu de l'application, renard bien lisible.
  { nom: 'icon.png', taille: 1024, fond: FOND_BLEU, contenu: renard(74) },
  // Android, couche avant : le logo doit tenir dans les deux tiers centraux.
  { nom: 'android-icon-foreground.png', taille: 1024, fond: 'transparent', contenu: renard(56) },
  // Android, couche arrière : un aplat suffit.
  { nom: 'android-icon-background.png', taille: 1024, fond: FOND_BLEU, contenu: '' },
  // Android, version monochrome : une silhouette blanche.
  {
    nom: 'android-icon-monochrome.png',
    taille: 1024,
    fond: 'transparent',
    contenu: renard(56, 'filter:grayscale(1) brightness(0) invert(1);'),
  },
  // Écran de démarrage : le renard seul, sur fond transparent.
  { nom: 'splash-icon.png', taille: 512, fond: 'transparent', contenu: renard(80) },
  // Onglet du navigateur pour la cible web.
  { nom: 'favicon.png', taille: 96, fond: FOND_BLEU, contenu: renard(78) },
];

(async () => {
  const navigateur = await chromium.launch(
    process.env.CHROME ? { executablePath: process.env.CHROME } : {},
  );
  for (const { nom, taille, fond, contenu } of ICONES) {
    const page = await navigateur.newPage({
      viewport: { width: taille, height: taille },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<body style="margin:0;width:${taille}px;height:${taille}px;background:${fond};`
      + `display:flex;align-items:center;justify-content:center">${contenu}</body>`,
    );
    await page.waitForTimeout(150);
    await page.screenshot({
      path: path.join(RACINE, 'assets', nom),
      omitBackground: fond === 'transparent',
    });
    await page.close();
    console.log(`  ${nom} (${taille}px)`);
  }
  await navigateur.close();
})();
