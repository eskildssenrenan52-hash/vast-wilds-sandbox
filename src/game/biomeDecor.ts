// @ts-nocheck -- canvas decoration layer, matches the imported game's loose typing
// Extra, richly detailed per-biome decoration layers drawn on top of the original
// backdrop and foreground. Every biome maps to a visual theme; palette comes from BiomeMeta.
import { VIRTUAL_HEIGHT as H, VIRTUAL_WIDTH as W } from './types';
import { drawCachedGlow, drawMicroSparkle, snapHalf } from './visualFx';
import { getAnyBiomeMeta } from './worldDataUnderworld';

type Theme =
  | 'forest' | 'ice' | 'fire' | 'tech' | 'void' | 'water' | 'desert'
  | 'crypt' | 'crystal' | 'sky' | 'swamp' | 'hell';

const THEMES: Record<string, Theme> = {
  bioluminescent: 'forest', crimson_sakura: 'forest', twilight_garden: 'forest', jade_bamboo: 'forest',
  fungal_myriad: 'forest', amber_hive: 'forest', asphodel_wastes: 'forest',
  frostglass: 'ice', aurora_zenith: 'ice', glacial_fjord: 'ice', cocytus_trench: 'ice', lunar_bastion: 'ice',
  obsidian_forge: 'fire', ember_steppe: 'fire', crimson_foundry: 'fire', solar_corona: 'fire',
  brimstone_caldera: 'fire', phlegethon_rapids: 'fire', magma_core: 'fire', crimson_canyon: 'fire',
  clockwork_spire: 'tech', alchemical_labs: 'tech', cyber_undercity: 'tech', orbital_nexus: 'tech',
  rust_foundry: 'tech', cyber_grid: 'tech', magnetic_rift: 'tech', chrono_paradox: 'tech',
  brass_tartarus: 'tech', iron_dungeon: 'tech',
  astral_void: 'void', void_nebula: 'void', crystal_singularity: 'void', abyss_throne: 'void',
  void_gate: 'void', shadow_sanctum: 'void', eternity_apex: 'void', blood_eclipse: 'void',
  sunken_cathedral: 'water', coral_abyss: 'water', starlight_harbor: 'water', styx_ferry: 'water',
  blood_aqueduct: 'water', lethe_depths: 'water', mercury_mire: 'water',
  solar_mirage: 'desert', hourglass_desert: 'desert', silver_ash: 'desert', acheron_gorge: 'desert',
  amethyst_crypt: 'crypt', bone_catacombs: 'crypt', bone_ossuary: 'crypt', ash_necropolis: 'crypt',
  wailing_spires: 'crypt', velvet_opera: 'crypt',
  prism_sanctum: 'crystal', mirror_labyrinth: 'crystal', hellglass_cathedral: 'crystal',
  obsidian_temple: 'crystal', obsidian_labyrinth: 'crystal',
  emerald_sky: 'sky', cloud_monastery: 'sky', celestial_marble: 'sky', seraph_citadel: 'sky',
  storm_archipelago: 'sky', stormcrown: 'sky', astral_library: 'sky',
  ebony_fen: 'swamp', pestilence_marsh: 'swamp',
  pandemonium_citadel: 'hell',
};

export function getBiomeTheme(biome: string): Theme {
  return THEMES[biome] ?? 'void';
}

// ---------- helpers ----------
function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function seedOf(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h % 9973);
}
function rgba(hex: string, a: number): string {
  const h = hex.replace('#', '').slice(0, 6);
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}
function mix(a: string, b: string, t: number): string {
  const pa = a.replace('#', ''), pb = b.replace('#', '');
  const c = (i: number) => {
    const x = parseInt(pa.slice(i, i + 2), 16) || 0;
    const y = parseInt(pb.slice(i, i + 2), 16) || 0;
    return Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  };
  return `#${c(0)}${c(2)}${c(4)}`;
}
const px = (ctx, x, y, w = 1, h = 1) => ctx.fillRect(Math.round(x), Math.round(y), w, h);

// ---------- motif silhouettes (drawn at base y, growing upward) ----------
function motif(ctx, theme: Theme, x: number, base: number, s: number, r: number, col: string, rim: string, glow: string, t: number) {
  ctx.fillStyle = col;
  switch (theme) {
    case 'forest': {
      const h = 18 + r * 22 * s;
      px(ctx, x - 1, base - h * 0.4, 2, h * 0.4);
      if (r > 0.5) {
        for (let i = 0; i < 5; i++) {
          const w = (11 - i * 2) * s, y = base - h * 0.3 - i * h * 0.15;
          ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x, y - h * 0.28); ctx.lineTo(x + w, y); ctx.fill();
        }
      } else {
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.arc(x + (hash(r + i) - 0.5) * 8 * s, base - h * 0.55 - i * 4, (7 - i) * s, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = rim; px(ctx, x + 2, base - h * 0.7, 1, h * 0.25);
      ctx.fillStyle = rgba(glow, 0.5 + 0.5 * Math.sin(t * 2 + r * 9));
      px(ctx, x - 3, base - h * 0.5); px(ctx, x + 4, base - h * 0.62); px(ctx, x, base - h * 0.42);
      break;
    }
    case 'ice': {
      const h = 22 + r * 34 * s, w = 5 + r * 6;
      ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x - 1, base - h); ctx.lineTo(x + 2, base - h * 0.8); ctx.lineTo(x + w, base); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + w * 0.6, base); ctx.lineTo(x + w + 3, base - h * 0.5); ctx.lineTo(x + w * 1.8, base); ctx.fill();
      ctx.fillStyle = rim; ctx.beginPath(); ctx.moveTo(x - 1, base - h); ctx.lineTo(x + 1, base - h * 0.6); ctx.lineTo(x - w * 0.4, base); ctx.lineTo(x - w * 0.6, base); ctx.fill();
      ctx.fillStyle = rgba('#ffffff', 0.4 + 0.4 * Math.sin(t * 3 + r * 20)); px(ctx, x - 1, base - h + 2);
      break;
    }
    case 'fire': {
      const h = 20 + r * 30 * s, w = 14 + r * 14;
      ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x - 3, base - h); ctx.lineTo(x + 3, base - h); ctx.lineTo(x + w, base); ctx.fill();
      ctx.fillStyle = rgba(glow, 0.7 + 0.3 * Math.sin(t * 4 + r * 7));
      px(ctx, x - 3, base - h - 1, 6, 1);
      for (let i = 0; i < 3; i++) {
        let lx = x - 1 + i, ly = base - h + 1;
        while (ly < base) { px(ctx, lx, ly); ly += 2; lx += (hash(ly + r * 50 + i) - 0.5) * 3; }
      }
      ctx.fillStyle = rgba(glow, 0.15); ctx.beginPath(); ctx.arc(x, base - h, 6, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'tech': case 'hell': {
      const h = 24 + r * 44 * s, w = 6 + Math.floor(r * 8);
      px(ctx, x - w, base - h, w * 2, h);
      px(ctx, x - w + 2, base - h - 4, w * 2 - 4, 4);
      px(ctx, x, base - h - 12, 1, 8);
      if (theme === 'hell') { ctx.beginPath(); ctx.moveTo(x - w, base - h); ctx.lineTo(x - w + 2, base - h - 9); ctx.lineTo(x - w + 4, base - h); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + w - 4, base - h); ctx.lineTo(x + w - 2, base - h - 9); ctx.lineTo(x + w, base - h); ctx.fill(); }
      ctx.fillStyle = rim; px(ctx, x + w - 1, base - h, 1, h);
      for (let yy = base - h + 3; yy < base - 2; yy += 4) for (let xx = x - w + 2; xx < x + w - 2; xx += 3) {
        const on = hash(xx * 3.1 + yy * 7.7 + Math.floor(t * 0.5 + r * 10)) > 0.62;
        if (on) { ctx.fillStyle = rgba(glow, 0.85); px(ctx, xx, yy); }
      }
      if (Math.sin(t * 3 + r * 30) > 0) { ctx.fillStyle = theme === 'hell' ? '#ff5a2a' : '#ff4466'; px(ctx, x, base - h - 13); }
      break;
    }
    case 'void': {
      const cy = base - 30 - r * 40 + Math.sin(t * 0.8 + r * 10) * 3, w = 8 + r * 12;
      ctx.beginPath(); ctx.moveTo(x - w, cy); ctx.lineTo(x + w, cy); ctx.lineTo(x + w * 0.3, cy + w * 0.9); ctx.lineTo(x - w * 0.4, cy + w * 0.6); ctx.fill();
      ctx.fillStyle = rim; px(ctx, x - w, cy - 1, w * 2, 1);
      ctx.fillStyle = rgba(glow, 0.9); ctx.beginPath(); ctx.moveTo(x - 2, cy); ctx.lineTo(x, cy - 7 - r * 6); ctx.lineTo(x + 2, cy); ctx.fill();
      ctx.strokeStyle = rgba(glow, 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, cy - 3, w * 0.9, 2.5, 0, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case 'water': {
      if (r > 0.45) {
        const h = 30 + r * 36 * s, w = 10 + r * 8;
        px(ctx, x - w, base - h, 3, h); px(ctx, x + w - 3, base - h, 3, h);
        ctx.beginPath(); ctx.arc(x, base - h, w, Math.PI, 0); ctx.lineTo(x + w - 3, base - h); ctx.arc(x, base - h, w - 3, 0, Math.PI, true); ctx.fill();
        ctx.fillStyle = rim; px(ctx, x - w, base - h, 1, h);
      } else {
        for (let k = 0; k < 4; k++) {
          let kx = x + k * 3;
          for (let yy = base; yy > base - 20 - r * 30 - k * 4; yy -= 1) { px(ctx, kx + Math.sin(yy * 0.25 + t * 1.5 + k) * 1.5, yy); }
        }
      }
      ctx.fillStyle = rgba(glow, 0.6 + 0.4 * Math.sin(t * 2 + r * 5)); px(ctx, x, base - 10 - r * 20);
      break;
    }
    case 'desert': {
      if (r > 0.6) {
        const h = 22 + r * 26; ctx.beginPath(); ctx.moveTo(x - h * 0.8, base); ctx.lineTo(x, base - h); ctx.lineTo(x + h * 0.8, base); ctx.fill();
        ctx.fillStyle = rim; ctx.beginPath(); ctx.moveTo(x, base - h); ctx.lineTo(x + h * 0.8, base); ctx.lineTo(x + h * 0.3, base); ctx.fill();
      } else {
        const h = 16 + r * 30; px(ctx, x - 2, base - h, 4, h); ctx.beginPath(); ctx.moveTo(x - 2, base - h); ctx.lineTo(x, base - h - 4); ctx.lineTo(x + 2, base - h); ctx.fill();
        ctx.fillStyle = rgba(glow, 0.7); px(ctx, x - 1, base - h * 0.6, 2, 1);
      }
      break;
    }
    case 'crypt': {
      const h = 26 + r * 40 * s, w = 4 + r * 5;
      px(ctx, x - w, base - h, w * 2, h);
      ctx.beginPath(); ctx.moveTo(x - w - 1, base - h); ctx.lineTo(x, base - h - 14 - r * 10); ctx.lineTo(x + w + 1, base - h); ctx.fill();
      px(ctx, x, base - h - 22 - r * 10, 1, 6); px(ctx, x - 2, base - h - 20 - r * 10, 5, 1);
      ctx.fillStyle = rgba(glow, 0.5 + 0.4 * Math.sin(t * 1.4 + r * 11));
      ctx.beginPath(); ctx.arc(x, base - h + 6, 2, Math.PI, 0); ctx.fill(); px(ctx, x - 2, base - h + 6, 4, 4);
      ctx.fillStyle = rim; px(ctx, x + w - 1, base - h, 1, h);
      break;
    }
    case 'crystal': {
      for (let k = 0; k < 3; k++) {
        const h = (18 + r * 30) * (1 - k * 0.25), ox = (k - 1) * 6, lean = (k - 1) * 3;
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + ox - 3, base); ctx.lineTo(x + ox + lean, base - h); ctx.lineTo(x + ox + 3, base); ctx.fill();
        ctx.fillStyle = rgba(glow, 0.55); ctx.beginPath(); ctx.moveTo(x + ox, base); ctx.lineTo(x + ox + lean, base - h); ctx.lineTo(x + ox + 3, base); ctx.fill();
      }
      ctx.fillStyle = rgba('#ffffff', Math.max(0, Math.sin(t * 2.5 + r * 17))); px(ctx, x, base - 20 - r * 20);
      break;
    }
    case 'sky': {
      const cy = base - 28 - r * 40 + Math.sin(t * 0.6 + r * 8) * 2, w = 12 + r * 10;
      ctx.beginPath(); ctx.moveTo(x - w, cy); ctx.lineTo(x + w, cy); ctx.lineTo(x + 3, cy + w * 0.8); ctx.lineTo(x - 4, cy + w * 0.5); ctx.fill();
      px(ctx, x - 4, cy - 6, 8, 6); ctx.beginPath(); ctx.moveTo(x - 7, cy - 6); ctx.lineTo(x, cy - 11); ctx.lineTo(x + 7, cy - 6); ctx.fill();
      ctx.fillStyle = rim; px(ctx, x - w, cy, w * 2, 1);
      ctx.fillStyle = rgba(glow, 0.8); px(ctx, x - 1, cy - 4, 2, 2);
      ctx.fillStyle = rgba('#dff4ff', 0.35); for (let yy = cy + 2; yy < cy + 30; yy++) px(ctx, x + w - 3, yy + ((t * 30) % 2));
      break;
    }
    case 'swamp': {
      const h = 22 + r * 30;
      let tx = x;
      for (let yy = base; yy > base - h; yy -= 1) { tx += (hash(yy + r * 100) - 0.5) * 0.8; px(ctx, tx - 1, yy, 2, 1); }
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(tx, base - h); ctx.lineTo(tx - 8, base - h - 6); ctx.moveTo(tx, base - h * 0.8); ctx.lineTo(tx + 9, base - h * 0.9 - 4); ctx.moveTo(tx - 4, base - h - 3); ctx.lineTo(tx - 6, base - h - 10); ctx.stroke();
      ctx.fillStyle = rgba(glow, 0.3 + 0.3 * Math.sin(t * 1.3 + r * 5));
      for (let k = 0; k < 4; k++) px(ctx, tx - 7 + k * 0.5, base - h - 5 + k * 2, 1, 2);
      break;
    }
  }
}

// ---------- hanging details from the top ----------
function hanging(ctx, theme: Theme, x: number, r: number, t: number, col: string, glow: string) {
  const len = 10 + r * 34;
  ctx.fillStyle = col;
  switch (theme) {
    case 'forest': case 'swamp':
      for (let y = 0; y < len; y++) {
        const sx = x + Math.sin(y * 0.18 + t * 1.2 + r * 6) * 1.5;
        px(ctx, sx, y);
        if (y % 5 === 2) { px(ctx, sx - 2, y, 2, 1); px(ctx, sx + 1, y + 1, 2, 1); }
      }
      ctx.fillStyle = rgba(glow, 0.6 + 0.4 * Math.sin(t * 3 + r * 9)); px(ctx, x + Math.sin(len * 0.18 + t * 1.2 + r * 6) * 1.5, len, 2, 2);
      break;
    case 'ice': case 'crystal':
      ctx.beginPath(); ctx.moveTo(x - 3, 0); ctx.lineTo(x, len * 0.7); ctx.lineTo(x + 3, 0); ctx.fill();
      ctx.fillStyle = rgba(glow, 0.5); px(ctx, x, 0, 1, len * 0.6);
      if (r > 0.7) { ctx.fillStyle = rgba('#ffffff', 0.6); px(ctx, x, len * 0.7 + ((t * 20 + r * 50) % 40), 1, 1); }
      break;
    case 'fire': case 'hell': case 'tech': case 'crypt': {
      for (let y = 0; y < len; y += 3) { px(ctx, x - 1, y, 1, 2); px(ctx, x + 1, y + 1, 1, 2); }
      if (theme === 'tech') { ctx.fillStyle = rgba(glow, 0.9); px(ctx, x - 1, len, 3, 2); ctx.fillStyle = rgba(glow, 0.15); ctx.beginPath(); ctx.arc(x, len + 4, 7, 0, Math.PI * 2); ctx.fill(); }
      else if (theme === 'crypt') { ctx.fillStyle = col; px(ctx, x - 3, len, 7, 6); ctx.fillStyle = rgba(glow, 0.5 + 0.5 * Math.sin(t * 6 + r * 4)); px(ctx, x, len + 2, 1, 2); }
      else { ctx.fillStyle = col; px(ctx, x - 3, len, 7, 1); px(ctx, x - 3, len, 1, 8); px(ctx, x + 3, len, 1, 8); px(ctx, x - 3, len + 8, 7, 1); ctx.fillStyle = rgba(glow, 0.5 + 0.3 * Math.sin(t * 5 + r)); px(ctx, x - 1, len + 5, 3, 3); }
      break;
    }
    case 'sky': case 'desert': {
      const sway = Math.sin(t * 1.6 + r * 6) * 2;
      for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? col : rgba(glow, 0.7); ctx.beginPath(); const bx = x + k * 7, by = 6 + k * 1.5 + r * 6; ctx.moveTo(bx, by); ctx.lineTo(bx + 5, by); ctx.lineTo(bx + 2.5 + sway * 0.5, by + 6); ctx.fill(); }
      ctx.strokeStyle = rgba(col, 0.8); ctx.beginPath(); ctx.moveTo(x - 2, 5 + r * 6); ctx.quadraticCurveTo(x + 12, 9 + r * 6 + sway, x + 28, 10 + r * 6); ctx.stroke();
      break;
    }
    case 'water': case 'void': default:
      break;
  }
}

// ---------- particles ----------
function particles(ctx, theme: Theme, t: number, camX: number, seed: number, glow: string, sec: string, near: boolean) {
  const n = near ? 14 : 40;
  for (let i = 0; i < n; i++) {
    const a = hash(i + seed), b = hash(i * 3.7 + seed), c = hash(i * 9.1 + seed);
    const par = near ? 1.3 : 0.5 + c * 0.4;
    let x = ((a * (W + 40) - camX * par * 0.3) % (W + 40) + W + 40) % (W + 40) - 20;
    let y = b * H, sz = near ? 2 : 1, col = c > 0.5 ? glow : sec, alpha = near ? 0.55 : 0.75;
    switch (theme) {
      case 'ice': y = (b * H + t * (10 + c * 14)) % H; x += Math.sin(t + i) * 4; col = '#f2fbff'; break;
      case 'fire': case 'hell': y = H - ((b * H + t * (14 + c * 20)) % H); x += Math.sin(t * 2 + i) * 3; alpha *= 0.5 + 0.5 * Math.sin(t * 8 + i); break;
      case 'water': y = H - ((b * H + t * (8 + c * 10)) % H); x += Math.sin(t * 1.5 + i) * 2; col = '#cdf6ff'; alpha = 0.45; break;
      case 'desert': x = ((x + t * (40 + c * 50)) % (W + 40)) - 20; y = b * H; sz = 1; alpha = 0.35; break;
      case 'tech': y = (b * H + t * (20 + c * 30)) % H; alpha = Math.sin(t * 4 + i) > 0 ? 0.9 : 0.2; break;
      case 'forest': case 'swamp': y = b * H + Math.sin(t * 0.9 + i) * 6; x += Math.cos(t * 0.7 + i) * 6; alpha = 0.3 + 0.6 * Math.max(0, Math.sin(t * 2 + i * 1.7)); break;
      case 'sky': y = (b * H + t * (6 + c * 6)) % H; x = ((x + t * 20) % (W + 40)) - 20; col = c > 0.5 ? '#ffd6ea' : '#ffffff'; break;
      default: y = b * H + Math.sin(t * 0.5 + i) * 4; alpha = 0.3 + 0.6 * Math.max(0, Math.sin(t * 1.5 + i * 2.3));
    }
    ctx.fillStyle = rgba(col, alpha);
    const sx = snapHalf(x);
    const sy = snapHalf(y);
    ctx.fillRect(sx, sy, sz * 0.5 + 0.5, sz * 0.5 + 0.5);
    if (!near && (theme === 'forest' || theme === 'void' || theme === 'crystal' || theme === 'crypt' || theme === 'swamp' || theme === 'fire' || theme === 'hell')) {
      drawCachedGlow(ctx, sx, sy, near ? 5 : 4, col, alpha * 0.35);
    }
  }
}

// ---------- public: backdrop decor (after original backdrop, before world) ----------
export function drawBiomeDecorBackdrop(ctx: CanvasRenderingContext2D, biome: string, camX: number, camY: number, t: number) {
  const meta = getAnyBiomeMeta(biome);
  const theme = getBiomeTheme(biome);
  const seed = seedOf(biome);
  ctx.save();

  // Sky: twinkling starfield with 0.5px micro-sparkles & subtle celestial corona
  const starry = theme === 'void' || theme === 'ice' || theme === 'crypt' || theme === 'water' || theme === 'swamp' || theme === 'hell';
  if (starry) {
    for (let i = 0; i < 72; i++) {
      const x = ((hash(i + seed) * W * 1.5 - camX * 0.02) % W + W) % W, y = hash(i * 2.3 + seed) * 90;
      const tw = 0.28 + 0.72 * Math.max(0, Math.sin(t * (1 + hash(i) * 2) + i));
      const starCol = i % 7 === 0 ? meta.secondaryAccent : i % 11 === 0 ? meta.accent : '#ffffff';
      ctx.fillStyle = rgba(starCol, tw * 0.78);
      ctx.fillRect(snapHalf(x), snapHalf(y), 0.5, 0.5);
      if (i % 13 === 0 && tw > 0.78) {
        drawMicroSparkle(ctx, x, y, 1.5, starCol, tw * 0.85);
      }
    }
  }
  const bx = W * (0.7 + hash(seed) * 0.2) - camX * 0.01, by = 26 + hash(seed + 1) * 14;
  const celCol = theme === 'fire' || theme === 'desert' ? '#ffe7a8' : meta.secondaryAccent;
  drawCachedGlow(ctx, bx, by, 52, celCol, 0.36);
  drawCachedGlow(ctx, bx, by, 22, '#ffffff', 0.22);
  ctx.fillStyle = rgba(theme === 'fire' || theme === 'desert' ? '#fff4d4' : '#f2f7ff', 0.85);
  ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(meta.skyTop, 0.35);
  ctx.beginPath(); ctx.arc(bx + 2, by - 1, 2, 0, Math.PI * 2); ctx.arc(bx - 3, by + 2, 1.5, 0, Math.PI * 2); ctx.fill();
  // Subtle crescent rim highlight
  ctx.strokeStyle = rgba('#ffffff', 0.5);
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.arc(bx, by, 7.2, Math.PI * 0.9, Math.PI * 1.7); ctx.stroke();

  // Aurora ribbons on ice/void/sky
  if (theme === 'ice' || theme === 'void' || theme === 'sky') {
    for (let band = 0; band < 2; band++) {
      for (let x = 0; x < W; x += 2) {
        const y = 20 + band * 14 + Math.sin(x * 0.03 + t * 0.45 + band * 2) * 8 + Math.sin(x * 0.011 - t * 0.2) * 5;
        const a = 0.07 + 0.06 * Math.sin(x * 0.05 + t + band);
        const ribbonH = 11 + Math.sin(x * 0.07 + t) * 4;
        ctx.fillStyle = rgba(band ? meta.accent : meta.secondaryAccent, a);
        ctx.fillRect(x, y, 2, ribbonH);
        if (x % 6 === 0) {
          ctx.fillStyle = rgba('#ffffff', a * 0.65);
          ctx.fillRect(x, y + 1, 0.5, ribbonH * 0.7);
        }
      }
    }
  }

  // Drifting cloud / mist wisps
  for (let i = 0; i < 6; i++) {
    const w = 40 + hash(i + seed * 2) * 60;
    const x = ((hash(i * 5 + seed) * (W + w) - camX * 0.06 + t * (2 + i)) % (W + w) + W + w) % (W + w) - w;
    const y = 18 + hash(i * 7 + seed) * 60;
    ctx.fillStyle = rgba(meta.skyMid, 0.22);
    ctx.fillRect(x, y, w, 3); ctx.fillRect(x + 6, y - 2, w - 14, 2); ctx.fillRect(x + 12, y + 3, w - 24, 2);
    ctx.fillStyle = rgba(meta.secondaryAccent, 0.12); ctx.fillRect(x + 6, y - 2, w - 14, 1);
  }

  // Two extra detailed silhouette planes with rim light
  const planes = [
    { par: 0.12, base: 132, s: 0.8, col: mix(meta.mountainFar, meta.skyMid, 0.35), rim: rgba(meta.secondaryAccent, 0.35), spacing: 34 },
    { par: 0.26, base: 150, s: 1.0, col: mix(meta.mountainMid, meta.mountainFar, 0.25), rim: rgba(meta.accent, 0.45), spacing: 46 },
  ];
  planes.forEach((p, pi) => {
    const off = camX * p.par;
    const start = Math.floor(off / p.spacing) - 1;
    for (let k = start; k < start + Math.ceil(W / p.spacing) + 3; k++) {
      const r = hash(k * 1.37 + seed + pi * 50);
      if (r < 0.15) continue;
      const x = k * p.spacing - off + (hash(k + 9 + pi) - 0.5) * p.spacing * 0.6;
      motif(ctx, theme, x, p.base - camY * p.par * 0.5, p.s, r, p.col, p.rim, pi ? meta.accent : meta.secondaryAccent, t);
    }
    // atmospheric haze between planes
    const g = ctx.createLinearGradient(0, p.base - 40, 0, p.base + 10);
    g.addColorStop(0, rgba(meta.skyBottom, 0)); g.addColorStop(1, rgba(meta.skyBottom, 0.35));
    ctx.fillStyle = g; ctx.fillRect(0, p.base - 40, W, 50);
  });

  // Rolling volumetric fog bands
  for (let b = 0; b < 2; b++) {
    ctx.fillStyle = rgba(b ? meta.particleColor : meta.skyBottom, b ? 0.06 : 0.16);
    for (let x = 0; x < W; x += 4) {
      const y = 128 + b * 18 + Math.sin((x + camX * (0.3 + b * 0.2)) * 0.04 + t * (0.5 + b * 0.3)) * 4;
      ctx.fillRect(x, y, 4, 14);
    }
  }

  // God rays
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const x = ((hash(i + seed * 3) * W * 1.4 - camX * 0.08) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2;
    const a = 0.035 + 0.025 * Math.sin(t * 0.6 + i * 2);
    ctx.fillStyle = rgba(meta.secondaryAccent, a);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 60, H); ctx.lineTo(x + 26, H); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';

  // Hanging details
  const hpar = 0.45, hsp = 38, hoff = camX * hpar;
  const hs = Math.floor(hoff / hsp) - 1;
  for (let k = hs; k < hs + Math.ceil(W / hsp) + 3; k++) {
    const r = hash(k * 2.11 + seed + 7);
    if (r < 0.35) continue;
    hanging(ctx, theme, k * hsp - hoff + r * 10, r, t, mix(meta.mountainNear, '#000000', 0.2), meta.accent);
  }

  // Back particles
  particles(ctx, theme, t, camX, seed, meta.particleColor, meta.secondaryAccent, false);

  // Water caustics
  if (theme === 'water') {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba(meta.secondaryAccent, 0.05);
    for (let x = 0; x < W; x += 3) for (let y = 0; y < 60; y += 6) {
      if (Math.sin(x * 0.11 + y * 0.2 + t * 1.4) * Math.sin(x * 0.07 - t) > 0.6) ctx.fillRect(x, y, 3, 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

// ---------- public: foreground decor (after original foreground) ----------
export function drawBiomeDecorForeground(ctx: CanvasRenderingContext2D, biome: string, camX: number, t: number) {
  const meta = getAnyBiomeMeta(biome);
  const theme = getBiomeTheme(biome);
  const seed = seedOf(biome);
  ctx.save();

  particles(ctx, theme, t, camX, seed + 77, meta.particleColor, meta.accent, true);

  // Bottom edge framing tufts (short, so gameplay stays readable)
  const dark = mix(meta.tileShadow, '#000000', 0.5);
  const off = camX * 1.2, sp = 9;
  const s0 = Math.floor(off / sp) - 1;
  for (let k = s0; k < s0 + Math.ceil(W / sp) + 3; k++) {
    const r = hash(k * 0.73 + seed), x = k * sp - off, base = H;
    ctx.fillStyle = dark;
    switch (theme) {
      case 'forest': case 'swamp': {
        for (let b = 0; b < 4; b++) {
          const h = 3 + hash(k + b * 3.3) * 7, lean = Math.sin(t * 1.8 + k + b) * 1.2;
          ctx.beginPath(); ctx.moveTo(x + b * 2, base); ctx.lineTo(x + b * 2 + lean + 0.5, base - h); ctx.lineTo(x + b * 2 + 1.5, base); ctx.fill();
        }
        if (r > 0.75) { ctx.fillStyle = rgba(meta.accent, 0.9); px(ctx, x + 3 + Math.sin(t * 1.8 + k), base - 9, 2, 2); }
        break;
      }
      case 'ice': ctx.beginPath(); ctx.ellipse(x, base, 7, 3 + r * 2, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = rgba('#e8f8ff', 0.25); px(ctx, x - 4, base - 3 - r * 2, 6, 1); break;
      case 'fire': case 'hell': ctx.beginPath(); ctx.moveTo(x - 4, base); ctx.lineTo(x - 1, base - 3 - r * 5); ctx.lineTo(x + 4, base); ctx.fill(); ctx.fillStyle = rgba(meta.accent, 0.5 + 0.5 * Math.sin(t * 5 + k)); px(ctx, x - 1, base - 1, 2, 1); break;
      case 'water': for (let yy = 0; yy < 6 + r * 8; yy++) px(ctx, x + Math.sin(yy * 0.4 + t * 2 + k) * 1.5, base - yy); break;
      case 'crystal': ctx.fillStyle = rgba(meta.accent, 0.35); ctx.beginPath(); ctx.moveTo(x - 2, base); ctx.lineTo(x + r * 2, base - 4 - r * 6); ctx.lineTo(x + 2, base); ctx.fill(); break;
      case 'crypt': if (r > 0.7) { px(ctx, x, base - 5, 2, 5); ctx.fillStyle = rgba('#ffcf7a', 0.6 + 0.4 * Math.sin(t * 9 + k)); px(ctx, x, base - 7, 2, 2); } else px(ctx, x - 2, base - 2, 5, 2); break;
      case 'tech': px(ctx, x - 4, base - 3, 9, 3); ctx.fillStyle = rgba(meta.accent, Math.sin(t * 3 + k) > 0.5 ? 0.9 : 0.2); px(ctx, x, base - 2); break;
      case 'sky': ctx.fillStyle = rgba('#ffffff', 0.12); ctx.beginPath(); ctx.arc(x, base + 2, 6 + r * 4, 0, Math.PI * 2); ctx.fill(); break;
      default: px(ctx, x - 2, base - 1 - r * 3, 4, 1 + r * 3);
    }
  }

  // Top corner framing silhouettes
  ctx.fillStyle = rgba(dark, 0.85);
  for (const side of [0, 1]) {
    const x0 = side ? W : 0, dir = side ? -1 : 1;
    for (let i = 0; i < 14; i++) {
      const len = 4 + hash(i + seed + side * 20) * 14;
      px(ctx, x0 + dir * i * 2 - (side ? 2 : 0), 0, 2, len * (1 - i / 16));
    }
  }

  // Accent bloom + cinematic vignette
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba(mix(meta.skyTop, '#000000', 0.6), 0.45));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rgba(meta.accent, 0.025 + 0.01 * Math.sin(t * 0.8));
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
