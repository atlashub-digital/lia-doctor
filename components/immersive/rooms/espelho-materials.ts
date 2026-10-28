'use client';

import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three';

// Procedural, licence-free surface maps for the Golden Room. Deterministic (seeded) so screenshots are reproducible.
// They stand in for scanned PBR sets until the Direction approves a sourced material library (asset #5/#6).

function random(seed: number) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

// Tileable value noise sampled into a Float32Array (0..1).
function valueNoise(size: number, cells: number, seed: number) {
  const rand = random(seed);
  const lattice = Array.from({ length: cells * cells }, rand);
  const out = new Float32Array(size * size);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const gx = x / size * cells, gy = y / size * cells;
    const x0 = Math.floor(gx), y0 = Math.floor(gy), tx = smooth(gx - x0), ty = smooth(gy - y0);
    const at = (i: number, j: number) => lattice[(j % cells) * cells + (i % cells)];
    const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
    const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
    out[y * size + x] = top * (1 - ty) + bottom * ty;
  }
  return out;
}

function fbm(size: number, seed: number, octaves: [cells: number, weight: number][]) {
  const total = octaves.reduce((sum, [, weight]) => sum + weight, 0);
  const out = new Float32Array(size * size);
  octaves.forEach(([cells, weight], i) => { const layer = valueNoise(size, cells, seed + i * 101); for (let p = 0; p < out.length; p++) out[p] += layer[p] * weight / total; });
  return out;
}

function hex(color: string) {
  const n = parseInt(color.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type Painter = (x: number, y: number, i: number) => [number, number, number];

function paint(size: number, painter: Painter, srgb: boolean, repeat: [number, number] = [1, 1]): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('2D canvas unavailable');
  const image = context.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = y * size + x, [r, g, b] = painter(x, y, i);
    image.data.set([r, g, b, 255], i * 4);
  }
  context.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(...repeat);
  texture.anisotropy = 4;
  if (srgb) texture.colorSpace = SRGBColorSpace;
  return texture;
}

function mix(a: number[], b: number[], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Mineral lime plaster: soft cloudy variation, almost no relief. */
export function limePlaster(base: string, shade: string, seed: number, repeat: [number, number]) {
  const size = 256, cloud = fbm(size, seed, [[4, 4], [8, 2], [32, 1]]), grain = valueNoise(size, 128, seed + 7);
  const a = hex(base), b = hex(shade);
  return {
    map: paint(size, (_x, _y, i) => mix(a, b, Math.min(1, Math.max(0, cloud[i] * 1.3 - .25 + grain[i] * .08))), true, repeat),
    bump: paint(size, (_x, _y, i) => { const v = 120 + cloud[i] * 50 + grain[i] * 70; return [v, v, v]; }, false, repeat),
  };
}

/** Honed travertine laid in large slabs: horizontal bedding, pores and fine grout joints. */
export function travertine(base: string, vein: string, seed: number, repeat: [number, number]) {
  const size = 512, bedding = fbm(size, seed, [[2, 3], [6, 2], [24, 1]]), pores = valueNoise(size, 160, seed + 3);
  const a = hex(base), b = hex(vein);
  const joint = (x: number, y: number) => (x % 256 < 2 || y % 512 < 2);
  return {
    map: paint(size, (x, y, i) => {
      if (joint(x, y)) return mix(a, [150, 128, 104], .55);
      const band = Math.sin(y / size * Math.PI * 9 + bedding[i] * 6) * .5 + .5;
      const tone = mix(a, b, band * .45 + bedding[i] * .25);
      return pores[i] > .9 ? mix(tone, [170, 146, 118], .5) : tone;
    }, true, repeat),
    rough: paint(size, (x, y, i) => { const v = joint(x, y) ? 250 : 120 + bedding[i] * 60 + (pores[i] > .9 ? 80 : 0); return [v, v, v]; }, false, repeat),
    bump: paint(size, (x, y, i) => { const v = joint(x, y) ? 40 : pores[i] > .9 ? 90 : 150 + bedding[i] * 30; return [v, v, v]; }, false, repeat),
  };
}

/** Linen/bouclé weave for upholstery and sheers. */
export function linen(base: string, seed: number, repeat: [number, number]) {
  const size = 256, slub = valueNoise(size, 64, seed), a = hex(base);
  return {
    map: paint(size, (x, y, i) => { const weave = ((x >> 1) + (y >> 1)) % 2 ? 1 : .94; const v = weave * (0.94 + slub[i] * .1); return [a[0] * v, a[1] * v, a[2] * v]; }, true, repeat),
    bump: paint(size, (x, y, i) => { const v = (x % 4 < 2) !== (y % 4 < 2) ? 170 : 100; return [v + slub[i] * 40, v + slub[i] * 40, v + slub[i] * 40]; }, false, repeat),
  };
}

/** Rift-sawn light oak. */
export function oak(base: string, seed: number, repeat: [number, number]) {
  const size = 256, warp = fbm(size, seed, [[3, 2], [12, 1]]), a = hex(base);
  const fibre = valueNoise(size, 96, seed + 5);
  return paint(size, (x, _y, i) => { const ring = Math.sin((x / size) * 38 + warp[i] * 4) * .5 + .5; const v = .9 + ring * .07 + fibre[i] * .05; return [a[0] * v, a[1] * v, a[2] * v]; }, true, repeat);
}

/** Bookcloth for blank volumes (covers stay blank until the approved P01–P05 files are transferred). */
export function bookcloth(base: string, seed: number) {
  const size = 128, fibre = valueNoise(size, 64, seed), a = hex(base);
  return paint(size, (x, y, i) => { const v = .93 + fibre[i] * .1 - ((x + y) % 3 === 0 ? .02 : 0); return [a[0] * v, a[1] * v, a[2] * v]; }, true);
}

/**
 * Coastal plate for the window (environment plate #7 stand-in): late-afternoon sky, layered headlands with
 * aerial perspective, a calm bay and a near olive hedge. Painted, not sampled from the master, so no lettering
 * and no resolution loss.
 */
export function coastView(seed: number) {
  const width = 1024, height = 768;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('2D canvas unavailable');
  const rand = random(seed);
  const sky = g.createLinearGradient(0, 0, 0, height * .62);
  sky.addColorStop(0, '#a9c3cf'); sky.addColorStop(.55, '#e9d9c3'); sky.addColorStop(1, '#f7dcb8');
  g.fillStyle = sky; g.fillRect(0, 0, width, height);
  const sun = g.createRadialGradient(width * .18, height * .46, 10, width * .18, height * .46, width * .5);
  sun.addColorStop(0, '#fff1d6cc'); sun.addColorStop(1, '#fff1d600');
  g.fillStyle = sun; g.fillRect(0, 0, width, height);
  const ridge = (base: number, amplitude: number, color: string, peaks: [number, number, number][]) => {
    g.beginPath(); g.moveTo(0, height);
    for (let x = 0; x <= width; x += 4) {
      let y = base + Math.sin(x / 90 + rand() * .02) * amplitude * .15;
      for (const [cx, w, h] of peaks) y -= h * Math.exp(-(((x - cx) / w) ** 2));
      g.lineTo(x, y);
    }
    g.lineTo(width, height); g.closePath(); g.fillStyle = color; g.fill();
  };
  ridge(height * .56, 30, '#b9b3b0', [[160, 140, 70], [620, 220, 60], [900, 120, 90]]);
  ridge(height * .6, 40, '#94928a', [[330, 70, 210], [420, 160, 70], [780, 150, 60]]);
  const sea = g.createLinearGradient(0, height * .6, 0, height);
  sea.addColorStop(0, '#9fb9bd'); sea.addColorStop(1, '#5f8a92');
  g.fillStyle = sea; g.fillRect(0, height * .62, width, height * .38);
  g.strokeStyle = '#fff4dd88';
  for (let i = 0; i < 160; i++) { const y = height * .63 + rand() * height * .3, x = rand() * width, w = 6 + rand() * 30; g.lineWidth = rand() < .5 ? 1 : 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke(); }
  ridge(height * .66, 18, '#7f8a6c', [[60, 90, 40], [980, 100, 30]]);
  for (let i = 0; i < 1400; i++) {
    const x = rand() * width, y = height * .9 + rand() * height * .12, r = 3 + rand() * 8;
    g.fillStyle = ['#6e7a5c', '#8a9474', '#a3ab8c', '#5f6b50'][Math.floor(rand() * 4)];
    g.beginPath(); g.ellipse(x, y, r, r * .55, rand() * Math.PI, 0, Math.PI * 2); g.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('2D canvas unavailable');
  draw(g);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Spine of a real volume: catalogue title and volume number, set like a stamped cloth spine. */
export function spineLabel(title: string, code: string, tone: string) {
  return canvasTexture(96, 608, g => {
    g.fillStyle = tone; g.fillRect(0, 0, 96, 608);
    g.fillStyle = '#b97a55'; g.fillRect(0, 26, 96, 5); g.fillRect(0, 577, 96, 5);
    g.fillStyle = '#3b2a22'; g.font = '600 22px Georgia, "DejaVu Serif", serif'; g.textAlign = 'center';
    g.fillText(code, 48, 560);
    g.save(); g.translate(52, 300); g.rotate(Math.PI / 2);
    g.font = '400 25px Georgia, "DejaVu Serif", serif'; g.fillText(title.length > 30 ? `${title.slice(0, 29)}…` : title, 0, 0);
    g.restore();
  });
}

/**
 * Front board while the approved cover is pending editorial GO. Deliberately reads as a placeholder (it says so),
 * never as a substitute cover: no imagery, no invented art.
 */
export function pendingCover(title: string, code: string) {
  return canvasTexture(540, 760, g => {
    g.fillStyle = '#f4ebdf'; g.fillRect(0, 0, 540, 760);
    g.strokeStyle = '#b97a55'; g.lineWidth = 3; g.strokeRect(28, 28, 484, 704);
    g.fillStyle = '#7a5442'; g.textAlign = 'center';
    g.font = '600 18px "DejaVu Sans", Arial, sans-serif'; g.fillText('ESPELHOMEU EDITIONS', 270, 92);
    g.font = '400 96px Georgia, "DejaVu Serif", serif'; g.fillText(code, 270, 300);
    g.fillStyle = '#2f2620'; g.font = '400 34px Georgia, "DejaVu Serif", serif';
    const words = title.split(' '); let line = '', y = 400;
    for (const word of words) { const next = line ? `${line} ${word}` : word; if (g.measureText(next).width > 400) { g.fillText(line, 270, y); line = word; y += 44; } else line = next; }
    g.fillText(line, 270, y);
    g.fillStyle = '#8c7a6b'; g.font = 'italic 400 20px Georgia, "DejaVu Serif", serif'; g.fillText('Capa oficial em homologação', 270, 690);
  });
}
