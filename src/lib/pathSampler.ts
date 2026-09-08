/**
 * Échantillonnage de chemins SVG en pur JavaScript.
 *
 * Sur le web on appellerait getPointAtLength() ; en React Native cette API
 * n'existe pas, on convertit donc nous-mêmes les commandes utilisées par les
 * tracés de lettres (M, L, H, V, C, A, Z) en une suite de points régulièrement
 * espacés. C'est cette suite qui sert ensuite à savoir si le doigt de l'enfant
 * suit bien le chemin.
 */

export type Point = { x: number; y: number };

export type SampledPath = {
  /** Points espacés d'environ `step` unités le long du tracé. */
  points: Point[];
  /** Longueur totale du tracé, dans les unités du repère. */
  length: number;
};

const TOKEN = /([MLHVCAZmlhvcaz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;

type Token = string | number;

function tokenize(d: string): Token[] {
  const out: Token[] = [];
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(d)) !== null) {
    out.push(m[1] !== undefined ? m[1] : parseFloat(m[2]));
  }
  return out;
}

function dist(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function cubicAt(p0: Point, c1: Point, c2: Point, p1: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * p0.x + b * c1.x + c * c2.x + e * p1.x,
    y: a * p0.y + b * c1.y + c * c2.y + e * p1.y,
  };
}

/** Angle orienté entre deux vecteurs, utilisé par la conversion d'arc. */
function vectorAngle(ux: number, uy: number, vx: number, vy: number) {
  const sign = ux * vy - uy * vx < 0 ? -1 : 1;
  const dot = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
  return sign * Math.acos(Math.min(1, Math.max(-1, dot)));
}

type ArcCenter = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  phi: number;
  theta1: number;
  dtheta: number;
};

/**
 * Passe de la description « endpoint » d'un arc SVG à sa description « centre »,
 * suivant l'annexe F.6 de la spécification SVG.
 */
function arcToCenter(
  x1: number, y1: number,
  rxIn: number, ryIn: number, phiDeg: number,
  largeArc: boolean, sweep: boolean,
  x2: number, y2: number,
): ArcCenter | null {
  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx === 0 || ry === 0) return null;

  const phi = (phiDeg * Math.PI) / 180;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const dx2 = (x1 - x2) / 2;
  const dy2 = (y1 - y2) / 2;
  const x1p = cosP * dx2 + sinP * dy2;
  const y1p = -sinP * dx2 + cosP * dy2;

  // Agrandit les rayons s'ils sont trop petits pour relier les deux extrémités.
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }

  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const factor = (largeArc !== sweep ? 1 : -1) * Math.sqrt(Math.max(0, num / den));

  const cxp = factor * ((rx * y1p) / ry);
  const cyp = factor * ((-ry * x1p) / rx);

  const cx = cosP * cxp - sinP * cyp + (x1 + x2) / 2;
  const cy = sinP * cxp + cosP * cyp + (y1 + y2) / 2;

  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  const theta1 = vectorAngle(1, 0, ux, uy);
  let dtheta = vectorAngle(ux, uy, vx, vy);
  if (!sweep && dtheta > 0) dtheta -= 2 * Math.PI;
  if (sweep && dtheta < 0) dtheta += 2 * Math.PI;

  return { cx, cy, rx, ry, phi, theta1, dtheta };
}

function arcAt(a: ArcCenter, t: number): Point {
  const theta = a.theta1 + a.dtheta * t;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(a.phi);
  const sinP = Math.sin(a.phi);
  return {
    x: cosP * a.rx * cosT - sinP * a.ry * sinT + a.cx,
    y: sinP * a.rx * cosT + cosP * a.ry * sinT + a.cy,
  };
}

/** Aplati le chemin en une polyligne dense (avant rééchantillonnage). */
function flatten(d: string): Point[] {
  const t = tokenize(d);
  const dense: Point[] = [];
  let cur: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  let cmd = '';
  let i = 0;

  const push = (p: Point) => {
    const last = dense[dense.length - 1];
    if (!last || dist(last, p) > 1e-6) dense.push(p);
  };
  const num = () => t[i++] as number;

  while (i < t.length) {
    if (typeof t[i] === 'string') {
      cmd = t[i] as string;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        push({ ...start });
        cur = { ...start };
        continue;
      }
    }
    const rel = cmd === cmd.toLowerCase();
    const base = rel ? cur : { x: 0, y: 0 };

    switch (cmd.toUpperCase()) {
      case 'M': {
        const p = { x: base.x + num(), y: base.y + num() };
        push(p);
        cur = p;
        start = p;
        // Les paires suivantes d'un « M » sont des lignes implicites.
        cmd = rel ? 'l' : 'L';
        break;
      }
      case 'L': {
        const p = { x: base.x + num(), y: base.y + num() };
        push(p);
        cur = p;
        break;
      }
      case 'H': {
        const p = { x: base.x + num(), y: cur.y };
        push(p);
        cur = p;
        break;
      }
      case 'V': {
        const p = { x: cur.x, y: base.y + num() };
        push(p);
        cur = p;
        break;
      }
      case 'C': {
        const c1 = { x: base.x + num(), y: base.y + num() };
        const c2 = { x: base.x + num(), y: base.y + num() };
        const p1 = { x: base.x + num(), y: base.y + num() };
        // Le polygone de contrôle donne une bonne borne de la longueur.
        const rough = dist(cur, c1) + dist(c1, c2) + dist(c2, p1);
        const steps = Math.max(8, Math.ceil(rough / 0.7));
        for (let s = 1; s <= steps; s++) push(cubicAt(cur, c1, c2, p1, s / steps));
        cur = p1;
        break;
      }
      case 'A': {
        const rx = num();
        const ry = num();
        const phi = num();
        const largeArc = num() !== 0;
        const sweep = num() !== 0;
        const p1 = { x: base.x + num(), y: base.y + num() };
        const arc = arcToCenter(cur.x, cur.y, rx, ry, phi, largeArc, sweep, p1.x, p1.y);
        if (!arc) {
          push(p1);
        } else {
          const rough = Math.abs(arc.dtheta) * Math.max(arc.rx, arc.ry);
          const steps = Math.max(8, Math.ceil(rough / 0.7));
          for (let s = 1; s <= steps; s++) push(arcAt(arc, s / steps));
        }
        cur = p1;
        break;
      }
      default:
        // Commande inconnue : on abandonne plutôt que de boucler indéfiniment.
        i = t.length;
        break;
    }
  }
  return dense;
}

const cache = new Map<string, SampledPath>();

/**
 * Découpe un chemin SVG en points régulièrement espacés.
 * Le résultat est mémorisé : chaque lettre n'est calculée qu'une fois.
 */
export function samplePath(d: string, step = 1.5): SampledPath {
  const key = `${step}|${d}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const dense = flatten(d);
  if (dense.length === 0) {
    const empty = { points: [], length: 0 };
    cache.set(key, empty);
    return empty;
  }

  // Longueurs cumulées le long de la polyligne dense.
  const cum: number[] = [0];
  for (let k = 1; k < dense.length; k++) cum.push(cum[k - 1] + dist(dense[k - 1], dense[k]));
  const total = cum[cum.length - 1];

  const count = Math.max(2, Math.round(total / step));
  const points: Point[] = [];
  let seg = 1;
  for (let k = 0; k <= count; k++) {
    const target = (total * k) / count;
    while (seg < cum.length - 1 && cum[seg] < target) seg++;
    const a = dense[seg - 1];
    const b = dense[seg];
    const spanStart = cum[seg - 1];
    const span = cum[seg] - spanStart;
    const r = span > 1e-9 ? (target - spanStart) / span : 0;
    points.push({ x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r });
  }

  const result = { points, length: total };
  cache.set(key, result);
  return result;
}

/** Direction (vecteur unitaire) au départ du tracé, pour dessiner la flèche. */
export function startDirection(points: Point[]): Point {
  if (points.length < 2) return { x: 1, y: 0 };
  const a = points[0];
  const b = points[Math.min(points.length - 1, 6)];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: (b.x - a.x) / len, y: (b.y - a.y) / len };
}
