// @ts-nocheck -- imported game code, written for a looser TS config
import type { GameEngine } from './engine';
import { AnyBiomeId, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './types';
import { getAnyBiomeMeta } from './worldDataUnderworld';
import { drawNewBiomeForegroundWeather, drawNewBiomeSpectacle } from './newBackdrops';
import { drawUnderworldForegroundWeather, drawUnderworldSpectacle } from './underworldBackdrops';
import { colorWithAlpha, drawCachedGlow, drawMicroSparkle, snapHalf } from './visualFx';

function safeModIdx(n: number, len: number): number {
  return ((Math.floor(n) % len) + len) % len;
}

const skyCache = new Map<AnyBiomeId, HTMLCanvasElement>();
const celestialCache = new Map<string, HTMLCanvasElement>();

function getCachedSky(biome: AnyBiomeId): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const existing = skyCache.get(biome);
  if (existing) return existing;
  const meta = getAnyBiomeMeta(biome);
  const c = document.createElement('canvas');
  c.width = VIRTUAL_WIDTH;
  c.height = VIRTUAL_HEIGHT;
  const sctx = c.getContext('2d');
  if (!sctx) return null;

  // Smooth multi-stop base sky + Bayer 4x4 dithering across bands
  sctx.fillStyle = meta.skyTop;
  sctx.fillRect(0, 0, VIRTUAL_WIDTH, 46);
  sctx.fillStyle = meta.skyMid;
  sctx.fillRect(0, 46, VIRTUAL_WIDTH, 58);
  sctx.fillStyle = meta.skyBottom;
  sctx.fillRect(0, 104, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - 104);

  const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];
  sctx.fillStyle = meta.skyMid;
  for (let y = 26; y < 60; y++) {
    const t = (y - 26) / 34;
    for (let x = 0; x < VIRTUAL_WIDTH; x++) {
      if (bayer[y & 3][x & 3] / 16 < t) sctx.fillRect(x, y, 1, 1);
    }
  }
  sctx.fillStyle = meta.skyBottom;
  for (let y = 80; y < 122; y++) {
    const t = (y - 80) / 42;
    for (let x = 0; x < VIRTUAL_WIDTH; x++) {
      if (bayer[y & 3][x & 3] / 16 < t) sctx.fillRect(x, y, 1, 1);
    }
  }

  // Diagonal cosmic nebula / Milky Way stardust band baked subtly into sky
  for (let x = 0; x < VIRTUAL_WIDTH; x += 2) {
    const bandY = Math.round(14 + (x / VIRTUAL_WIDTH) * 44 + Math.sin(x * 0.05) * 6);
    for (let dy = -10; dy <= 10; dy += 2) {
      if ((bayer[(bandY + dy) & 3][(x) & 3] / 16) > Math.abs(dy) / 11) {
        sctx.fillStyle = (x + dy) % 6 === 0 ? meta.secondaryAccent + '14' : meta.accent + '12';
        sctx.fillRect(x, bandY + dy, 2, 2);
      }
    }
  }

  // Rich horizon atmospheric bloom wash
  const hg = sctx.createLinearGradient(0, 78, 0, VIRTUAL_HEIGHT);
  hg.addColorStop(0, 'rgba(0,0,0,0)');
  hg.addColorStop(0.55, meta.accent + '28');
  hg.addColorStop(0.85, meta.secondaryAccent + '1c');
  hg.addColorStop(1, meta.mountainFar + '33');
  sctx.fillStyle = hg;
  sctx.fillRect(0, 78, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - 78);

  skyCache.set(biome, c);
  return c;
}

function getCachedCelestialDisc(key: string, accent: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const existing = celestialCache.get(key);
  if (existing) return existing;

  const c = document.createElement('canvas');
  if (key.startsWith('crescent:')) {
    const r = 13;
    c.width = 28;
    c.height = 28;
    const dctx = c.getContext('2d');
    if (!dctx) return null;
    const cx = 14;
    const cy = 14;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 <= r * r) {
          const cut = (dx - 5) * (dx - 5) + (dy + 2) * (dy + 2);
          if (cut > (r - 2) * (r - 2)) {
            const crater = (dx + 5) * (dx + 5) + (dy - 2) * (dy - 2) <= 3 || (dx + 2) * (dx + 2) + (dy + 5) * (dy + 5) <= 2;
            dctx.fillStyle = crater
              ? accent
              : d2 > (r - 2) * (r - 2)
                ? accent
                : '#fff9ea';
            dctx.fillRect(cx + dx, cy + dy, 1, 1);
          }
        }
      }
    }
  } else if (key === 'astral_planet') {
    c.width = 26;
    c.height = 26;
    const dctx = c.getContext('2d');
    if (!dctx) return null;
    const cx = 13;
    const cy = 13;
    for (let dy = -12; dy <= 12; dy++) {
      for (let dx = -12; dx <= 12; dx++) {
        if (dx * dx + dy * dy <= 144) {
          const band = Math.abs(dy + Math.round(dx * 0.15)) % 5 === 0;
          dctx.fillStyle = dy < -4 ? (band ? '#a774ff' : '#864ae8') : dy < 4 ? (band ? '#6838c2' : '#53299e') : '#291157';
          dctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    }
  } else if (key === 'sakura_moon') {
    c.width = 32;
    c.height = 32;
    const dctx = c.getContext('2d');
    if (!dctx) return null;
    const cx = 16;
    const cy = 16;
    for (let dy = -15; dy <= 15; dy++) {
      for (let dx = -15; dx <= 15; dx++) {
        if (dx * dx + dy * dy <= 225) {
          const mare = (dx + 3) * (dx + 3) + (dy + 2) * (dy + 2) < 22 || (dx - 5) * (dx - 5) + (dy - 4) * (dy - 4) < 14;
          dctx.fillStyle = dy < -4 ? (mare ? '#ffd1e3' : '#fff0f6') : dy < 6 ? (mare ? '#ff8fbd' : '#ffb3d1') : '#d9487f';
          dctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    }
  } else if (key === 'amethyst_moon') {
    c.width = 28;
    c.height = 28;
    const dctx = c.getContext('2d');
    if (!dctx) return null;
    const cx = 14;
    const cy = 14;
    for (let dy = -12; dy <= 12; dy++) {
      for (let dx = -12; dx <= 12; dx++) {
        if (dx * dx + dy * dy <= 144) {
          const cut = (dx - 4) * (dx - 4) + (dy + 2) * (dy + 2);
          if (cut > 95) {
            dctx.fillStyle = dy < 0 ? '#f3e8ff' : '#c084fc';
            dctx.fillRect(cx + dx, cy + dy, 1, 1);
          }
        }
      }
    }
  }
  celestialCache.set(key, c);
  return c;
}

export function drawEnhancedBackdrop(
  ctx: CanvasRenderingContext2D,
  biome: AnyBiomeId,
  gx: number,
  gy: number,
  camX: number,
  camY: number,
  time: number,
  engine: GameEngine
): void {
  const meta = getAnyBiomeMeta(biome);
  const pSky = Math.round(camX * 0.04);
  const pSkyY = Math.round(camY * 0.03);
  const pCloud = Math.round(camX * 0.10);
  const pFar = Math.round(camX * 0.18);
  const pFarY = Math.round(camY * 0.07);
  const pMid = Math.round(camX * 0.34);
  const pMidY = Math.round(camY * 0.14);
  const pNear = Math.round(camX * 0.58);
  const pNearY = Math.round(camY * 0.22);

  // Plane 0: Cached 3-Stop Pixel Sky + 4x4 Ordered Bayer Dithering
  const cachedSky = getCachedSky(biome);
  if (cachedSky) {
    ctx.drawImage(cachedSky, 0, 0);
  } else {
    ctx.fillStyle = meta.skyTop;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, 48);
    ctx.fillStyle = meta.skyMid;
    ctx.fillRect(0, 48, VIRTUAL_WIDTH, 56);
    ctx.fillStyle = meta.skyBottom;
    ctx.fillRect(0, 104, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - 104);
  }

  // Distant branching sky lightning & sheet illumination on Stormcrown
  if (biome === 'stormcrown') {
    const wave = Math.sin(time * 1.9);
    const wave2 = Math.sin(time * 3.1 + 1.4);
    if (wave > 0.92 || wave2 > 0.96) {
      ctx.fillStyle = '#d8f4ff26';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      const lx = safeModIdx(190 - pSky + (wave2 > 0.96 ? 80 : 0), VIRTUAL_WIDTH);
      ctx.fillStyle = '#fff9c4ee';
      ctx.fillRect(lx, 6, 2, 26);
      ctx.fillRect(lx - 4, 32, 5, 2);
      ctx.fillRect(lx - 6, 34, 2, 24);
      ctx.fillRect(lx + 1, 22, 6, 1);
      ctx.fillRect(lx + 6, 23, 2, 16);
      ctx.fillStyle = '#7ce8ff88';
      ctx.fillRect(lx - 1, 10, 4, 18);
    }
  }

  // Subtle Drifting High-Altitude Nebula Ribbons
  for (let i = 0; i < 6; i++) {
    const nx = safeModIdx(i * 62 + Math.round(time * 2.5) - pSky, VIRTUAL_WIDTH + 60) - 30;
    const ny = 14 + (i % 3) * 16 + Math.round(Math.sin(time * 0.5 + i) * 3);
    ctx.fillStyle = i % 2 === 0 ? meta.accent + '14' : meta.secondaryAccent + '12';
    ctx.fillRect(nx, ny, 44, 6);
    ctx.fillRect(nx + 8, ny - 2, 26, 3);
  }

  // Layered Starfield (120 stars across 2 parallax depths + 0.5px cross glints + constellation threads)
  let prevStarX = -1;
  let prevStarY = -1;
  for (let i = 0; i < 120; i++) {
    const depth = i % 3 === 0 ? 1 : 0.55;
    const sx = snapHalf((((i * 47 + gx * 19 + (i % 5) * 9 - pSky * depth) % VIRTUAL_WIDTH) + VIRTUAL_WIDTH) % VIRTUAL_WIDTH);
    const sy = snapHalf((((i * 23 + gy * 11 - pSkyY) % 124) + 124) % 124);
    const twinkle = Math.sin(time * 2.9 + i * 1.35);
    if (i % 10 === 0 && prevStarX >= 0 && Math.abs(sx - prevStarX) < 54 && Math.abs(sy - prevStarY) < 30) {
      ctx.strokeStyle = colorWithAlpha(meta.secondaryAccent, 0.16);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(prevStarX, prevStarY);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
    if (i % 10 === 0) {
      prevStarX = sx;
      prevStarY = sy;
    }
    if (twinkle > 0.65) {
      const col = i % 2 === 0 ? meta.secondaryAccent : meta.accent;
      drawMicroSparkle(ctx, sx, sy, 1.5, col, 0.92);
    } else if (i % 7 === 0) {
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.78);
      ctx.fillRect(sx, sy, 1, 1);
    } else {
      ctx.fillStyle = twinkle > -0.15 ? 'rgba(255,255,255,0.82)' : colorWithAlpha(meta.tileHighlight, 0.52);
      ctx.fillRect(sx, sy, 0.5, 0.5);
    }
  }

  // Dual Shooting Stars / Comets with glowing diagonal plasma tails
  for (let mIdx = 0; mIdx < 2; mIdx++) {
    const cycle = (time + mIdx * 2.7) % 4.8;
    if (cycle < 0.72) {
      const p = cycle / 0.72;
      const mx = 28 + mIdx * 110 + p * 175 - pSky * 0.5;
      const my = 8 + mIdx * 14 + p * 48;
      const fade = Math.sin(Math.PI * p);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = colorWithAlpha(meta.secondaryAccent, 0.85 * fade);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - 18, my - 5);
      ctx.stroke();
      ctx.strokeStyle = colorWithAlpha('#ffffff', 0.95 * fade);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - 7, my - 2);
      ctx.stroke();
      drawCachedGlow(ctx, mx, my, 6, meta.secondaryAccent, 0.55 * fade, 1, true);
      ctx.restore();
    }
  }

  // Biome Celestial / Cavern Spectacle
  const handledNew =
    drawNewBiomeSpectacle(ctx, biome, meta, gx, gy, pSky, pSkyY, pFar, pFarY, time) ||
    drawUnderworldSpectacle(ctx, biome, meta, time, camX);
  if (handledNew) {
    // Already rendered rich bespoke spectacle for the 30 new worlds or 20 Underworld worlds
  } else if (biome === 'silver_ash' || biome === 'stormcrown') {
    const mx = 224 - gx * 4 - Math.round(pSky * 0.5);
    const my = 34 - Math.round(pSkyY * 0.4);
    const mg = ctx.createRadialGradient(mx, my, 3, mx, my, 40);
    mg.addColorStop(0, meta.accent + '66');
    mg.addColorStop(0.5, meta.secondaryAccent + '26');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(mx - 40, my - 40, 80, 80);

    // Subtle pulsing celestial halo ring around moon
    const ringR = 17 + Math.sin(time * 1.4) * 1.2;
    ctx.strokeStyle = meta.secondaryAccent + '44';
    ctx.beginPath();
    ctx.arc(mx, my, ringR, 0, Math.PI * 2);
    ctx.stroke();

    const disc = getCachedCelestialDisc(`crescent:${meta.accent}`, meta.accent);
    if (disc) {
      ctx.drawImage(disc, mx - 14, my - 14);
    }
    const cd = Math.round(time * 5) % 58;
    ctx.fillStyle = meta.skyMid + 'cc';
    ctx.fillRect(mx - 24 + cd, my + 2, 20, 3);
    ctx.fillRect(mx - 16 + cd, my + 1, 12, 2);

    // Drifting distant ruined aqueduct arches & floating embers/ash ribbons
    for (let i = 0; i < 4; i++) {
      const ax = safeModIdx(24 + i * 86 - pFar, VIRTUAL_WIDTH + 40) - 20;
      ctx.fillStyle = meta.mountainFar + 'cc';
      ctx.fillRect(ax, 76, 8, 52);
      ctx.fillRect(ax + 34, 76, 8, 52);
      ctx.fillRect(ax + 6, 76, 30, 5);
      ctx.fillStyle = meta.accent + '33';
      ctx.fillRect(ax + 6, 75, 30, 1);
    }
  } else if (biome === 'astral_void') {
    const px = 248 - gx * 4 - Math.round(pSky * 0.5);
    const py = 36 - Math.round(pSkyY * 0.4);
    const pg = ctx.createRadialGradient(px, py, 4, px, py, 44);
    pg.addColorStop(0, '#d580ff66');
    pg.addColorStop(0.5, '#66eeff2c');
    pg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pg;
    ctx.fillRect(px - 44, py - 44, 88, 88);

    // Swirling spiral galaxy core + vertical nebula curtains
    for (let nx = -78; nx < -10; nx += 4) {
      const nOff = Math.round(Math.sin(time * 0.9 + nx * 0.08) * 6);
      ctx.fillStyle = nx % 8 === 0 ? '#66eeff22' : '#8b5cf62a';
      ctx.fillRect(px + nx, 4 + nOff, 4, 88);
    }

    const disc = getCachedCelestialDisc('astral_planet', meta.accent);
    if (disc) ctx.drawImage(disc, px - 13, py - 13);

    ctx.strokeStyle = '#e6b3ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(px, py, 24, 5.5, -0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#66eeffaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(px, py, 29, 7.5, -0.22, 0, Math.PI * 2);
    ctx.stroke();

    // Twin orbiting astral moons
    for (let m = 0; m < 2; m++) {
      const ang = time * (1.1 + m * 0.7) + m * Math.PI;
      const omx = Math.round(px + Math.cos(ang) * (25 + m * 8));
      const omy = Math.round(py + Math.sin(ang) * (8 + m * 3));
      ctx.fillStyle = m === 0 ? '#66eeff' : '#ffd27d';
      ctx.fillRect(omx - 1, omy - 1, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(omx, omy, 1, 1);
    }
  } else if (biome === 'frostglass') {
    // Multi-ribbon polar aurora + faceted glacial ice spires + prism dust
    for (let x = 0; x < VIRTUAL_WIDTH; x += 2) {
      const ax = x + pSky;
      const ay = 14 + Math.round(Math.sin(ax * 0.028 + time * 1.35) * 10);
      const h = 26 + Math.round(Math.cos(ax * 0.045 - time * 0.9) * 8);
      ctx.fillStyle = '#5ef2ff44';
      ctx.fillRect(x, ay, 2, h);
      ctx.fillStyle = '#b8ffea40';
      ctx.fillRect(x, ay + 4, 2, 12);
      ctx.fillStyle = '#a880ff30';
      ctx.fillRect(x, ay - 3, 2, 6);
      if (x % 6 === 0) {
        ctx.fillStyle = '#ffffff38';
        ctx.fillRect(x, ay + 2, 1, h - 4);
      }
    }
    // Distant crystalline ice spires with specular edge gleam
    for (let i = 0; i < 6; i++) {
      const sx = safeModIdx(26 + i * 62 - pFar, VIRTUAL_WIDTH + 40) - 20;
      const sh = 38 + (i % 3) * 14;
      ctx.fillStyle = '#14324d';
      ctx.beginPath();
      ctx.moveTo(sx - 10, 124);
      ctx.lineTo(sx, 124 - sh);
      ctx.lineTo(sx + 10, 124);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7ce8ff44';
      ctx.fillRect(sx - 1, 124 - sh + 2, 2, sh - 6);
      ctx.fillStyle = '#ffffff88';
      ctx.fillRect(sx, 124 - sh, 1, 5);
    }
  } else if (biome === 'obsidian_forge') {
    // Molten horizon magma sea + twin distant lava falls + forge vents + hanging chains
    const mg = ctx.createLinearGradient(0, 118, 0, VIRTUAL_HEIGHT);
    mg.addColorStop(0, '#ff441144');
    mg.addColorStop(0.5, '#ff772255');
    mg.addColorStop(1, '#290808');
    ctx.fillStyle = mg;
    ctx.fillRect(0, 118, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - 118);

    for (let f = 0; f < 3; f++) {
      const fx = safeModIdx(64 + f * 108 - gx * 6 - pFar, VIRTUAL_WIDTH + 24) - 12;
      const fw = f === 0 ? 15 : 9;
      ctx.fillStyle = '#ff441144';
      ctx.fillRect(fx - 2, 38, fw + 4, VIRTUAL_HEIGHT - 38);
      ctx.fillStyle = '#ff882266';
      ctx.fillRect(fx, 40, fw, VIRTUAL_HEIGHT - 40);
      const flow = Math.floor(time * 32 + f * 7) % 14;
      ctx.fillStyle = '#ffe06699';
      for (let y = 40 + flow; y < VIRTUAL_HEIGHT; y += 14) {
        ctx.fillRect(fx + 1, y, fw - 2, 6);
      }
      // Splashing foam pool at base
      ctx.fillStyle = '#ffd24d77';
      ctx.fillRect(fx - 4, 124, fw + 8, 3);
    }
    ctx.fillStyle = '#240909';
    for (let i = 0; i < 6; i++) {
      const cx = safeModIdx(i * 58 - pFar, VIRTUAL_WIDTH);
      const sway = Math.round(Math.sin(time * 1.5 + i) * 1.5);
      for (let cy = 0; cy < 68 + ((i * 19) % 28); cy += 4) {
        ctx.fillRect(cx + sway, cy, 2, 3);
        if (cy % 12 === 0) {
          ctx.fillStyle = '#ff662255';
          ctx.fillRect(cx + sway, cy + 1, 2, 1);
          ctx.fillStyle = '#240909';
        }
      }
    }
    // Rising volcanic heat embers
    for (let e = 0; e < 14; e++) {
      const ex = safeModIdx(e * 27 - pFar + Math.round(Math.sin(time * 2 + e) * 6), VIRTUAL_WIDTH);
      const ey = safeModIdx(140 - Math.round(time * (22 + (e % 3) * 8) + e * 13), 130);
      ctx.fillStyle = e % 2 === 0 ? '#ffe066aa' : '#ff5522aa';
      ctx.fillRect(ex, ey, 2, 2);
    }
  } else if (biome === 'bioluminescent') {
    // Stalactites with glowing crystal tips + giant luminous mushroom caps + spore medusas
    ctx.fillStyle = '#061a24';
    for (let i = 0; i < 12; i++) {
      const sx = safeModIdx(i * 34 - pFar, VIRTUAL_WIDTH + 16) - 8;
      const sh = 16 + ((i * 13 + gx * 5) % 20);
      ctx.fillRect(sx, 0, 8, sh);
      ctx.fillRect(sx + 2, sh, 4, 7);
      if (i % 2 === 0) {
        const glow = Math.sin(time * 2.5 + i) > 0 ? '#7dffe299' : '#4df0c066';
        ctx.fillStyle = glow;
        ctx.fillRect(sx + 3, sh + 7, 2, 11);
        ctx.fillRect(sx + 2, sh + 16, 4, 2);
        ctx.fillStyle = '#061a24';
      }
    }
    // Distant giant mushroom silhouettes with pulsing gill underglow
    for (let m = 0; m < 4; m++) {
      const mx = safeModIdx(38 + m * 86 - pFar, VIRTUAL_WIDTH + 40) - 20;
      const mh = 26 + (m % 2) * 12;
      ctx.fillStyle = '#092430';
      ctx.fillRect(mx - 3, 128 - mh, 6, mh);
      ctx.fillRect(mx - 14, 128 - mh - 6, 28, 7);
      ctx.fillRect(mx - 10, 128 - mh - 10, 20, 4);
      const pulse = 0.45 + 0.35 * Math.sin(time * 2.2 + m);
      ctx.fillStyle = `rgba(77, 240, 192, ${pulse.toFixed(2)})`;
      ctx.fillRect(mx - 12, 128 - mh, 24, 2);
      ctx.fillRect(mx - 7, 128 - mh - 8, 3, 2);
      ctx.fillRect(mx + 3, 128 - mh - 7, 4, 2);
    }
  } else if (biome === 'crimson_sakura') {
    const mx = 224 - gx * 4 - Math.round(pSky * 0.45);
    const my = 40 - Math.round(pSkyY * 0.4);
    const mg = ctx.createRadialGradient(mx, my, 4, mx, my, 42);
    mg.addColorStop(0, '#ff70a677');
    mg.addColorStop(0.55, '#ffd27d28');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(mx - 42, my - 42, 84, 84);
    const disc = getCachedCelestialDisc('sakura_moon', meta.accent);
    if (disc) ctx.drawImage(disc, mx - 16, my - 16);

    // Floating warm sky lanterns rising gently behind pagodas
    for (let l = 0; l < 10; l++) {
      const lx = safeModIdx(l * 36 + Math.round(Math.sin(time * 0.8 + l) * 7) - Math.round(pFar * 0.6), VIRTUAL_WIDTH);
      const ly = safeModIdx(122 - Math.round(time * (7 + (l % 3) * 3) + l * 19), 115);
      ctx.fillStyle = '#ff994444';
      ctx.fillRect(lx - 2, ly - 2, 7, 8);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(lx, ly, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx + 1, ly + 2, 1, 2);
    }

    // Curved Pagoda Tiers + Illuminated Torii Gate + Glowing Warm Windows
    ctx.fillStyle = meta.mountainFar;
    for (let i = 0; i < 3; i++) {
      const px = safeModIdx(48 + i * 110 - pFar, VIRTUAL_WIDTH + 40) - 20;
      ctx.fillRect(px - 10, 82, 20, 44);
      ctx.fillRect(px - 16, 79, 32, 4);
      ctx.fillRect(px - 18, 77, 4, 2);
      ctx.fillRect(px + 14, 77, 4, 2);
      ctx.fillRect(px - 12, 66, 24, 4);
      ctx.fillRect(px - 14, 64, 3, 2);
      ctx.fillRect(px + 11, 64, 3, 2);
      ctx.fillRect(px - 7, 56, 14, 4);
      ctx.fillRect(px - 1, 49, 2, 7);
      ctx.fillStyle = '#ffd27d88';
      ctx.fillRect(px - 2, 88, 4, 6);
      ctx.fillRect(px - 2, 70, 4, 4);
      ctx.fillStyle = meta.mountainFar;
    }
    // Distant hillside torii silhouette
    const tx = safeModIdx(104 - pFar, VIRTUAL_WIDTH + 40) - 20;
    ctx.fillStyle = '#5c122e';
    ctx.fillRect(tx - 12, 96, 24, 3);
    ctx.fillRect(tx - 9, 101, 18, 2);
    ctx.fillRect(tx - 7, 98, 2, 22);
    ctx.fillRect(tx + 5, 98, 2, 22);
  } else if (biome === 'sunken_cathedral') {
    for (let i = 0; i < 6; i++) {
      const rx = safeModIdx(24 + i * 62 - pSky + Math.round(Math.sin(time * 1.4 + i) * 6), VIRTUAL_WIDTH);
      const rg = ctx.createLinearGradient(rx, 0, rx + 8, 145);
      rg.addColorStop(0, '#a8f9ff34');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + 10 + (i % 3) * 4, 0);
      ctx.lineTo(rx + 28 + (i % 3) * 4, 150);
      ctx.lineTo(rx + 8, 150);
      ctx.closePath();
      ctx.fill();
    }
    // Sunken stained-glass rose window arches
    for (let a = 0; a < 2; a++) {
      const ax = safeModIdx(84 + a * 164 - pFar, VIRTUAL_WIDTH + 60) - 30;
      ctx.strokeStyle = '#38bdf833';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ax, 76, 18, Math.PI, 0);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#52e5ff28';
      ctx.fillRect(ax - 7, 66, 14, 14);
      ctx.fillStyle = '#ffd27d28';
      ctx.fillRect(ax - 2, 62, 4, 22);
    }
    // Distant gliding manta rays + school of tiny fish + rising bubbles
    for (let m = 0; m < 2; m++) {
      const mx = safeModIdx(Math.round(time * (18 + m * 6) + m * 170 - pFar), VIRTUAL_WIDTH + 40) - 20;
      const my = 46 + m * 28 + Math.round(Math.sin(time * 2 + m) * 4);
      const flap = Math.round(Math.sin(time * 4 + m) * 2);
      ctx.fillStyle = '#072236aa';
      ctx.fillRect(mx - 6, my, 12, 3);
      ctx.fillRect(mx - 10, my + flap, 5, 2);
      ctx.fillRect(mx + 5, my + flap, 5, 2);
      ctx.fillRect(mx - 9, my + 1, 4, 1);
    }
    for (let f = 0; f < 7; f++) {
      const fx = safeModIdx(Math.round(time * 28 + f * 9 - pFar), VIRTUAL_WIDTH + 20) - 10;
      const fy = 88 + Math.round(Math.sin(time * 3 + f * 0.7) * 5) + (f % 3) * 3;
      ctx.fillStyle = '#7ce8ff66';
      ctx.fillRect(fx, fy, 3, 1);
    }
    for (let i = 0; i < 16; i++) {
      const bx = safeModIdx(i * 25 - pFar, VIRTUAL_WIDTH);
      const by = safeModIdx(VIRTUAL_HEIGHT - Math.round(time * (16 + (i % 4) * 5) + i * 21), 135);
      ctx.fillStyle = '#a8f9ff66';
      ctx.fillRect(bx, by, 2, 2);
      ctx.fillStyle = '#ffffffaa';
      ctx.fillRect(bx, by, 1, 1);
    }
  } else if (biome === 'clockwork_spire') {
    // Swinging great brass pendulum + interlocking geared spokes + escaping steam puffs
    const pendPivotX = safeModIdx(160 - pFar, VIRTUAL_WIDTH + 60) - 30;
    const pendAng = Math.sin(time * 1.4) * 0.35;
    const pendEndX = Math.round(pendPivotX + Math.sin(pendAng) * 74);
    const pendEndY = Math.round(14 + Math.cos(pendAng) * 74);
    ctx.strokeStyle = '#ffb84d38';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pendPivotX, 14);
    ctx.lineTo(pendEndX, pendEndY);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#ffd27d55';
    ctx.fillRect(pendEndX - 5, pendEndY - 5, 10, 10);

    for (let g = 0; g < 5; g++) {
      const gcx = safeModIdx(46 + g * 76 - pFar, VIRTUAL_WIDTH + 60) - 30;
      const gcy = 44 + (g % 2) * 28 - Math.round(pFarY * 0.4);
      const rad = 17 + (g % 3) * 6;
      ctx.strokeStyle = '#ffb84d3a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(gcx, gcy, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      const dir = g % 2 === 0 ? 1 : -1;
      for (let s = 0; s < 4; s++) {
        const sa = time * 0.45 * dir + (s * Math.PI) / 2;
        ctx.strokeStyle = '#ffb84d2a';
        ctx.beginPath();
        ctx.moveTo(gcx, gcy);
        ctx.lineTo(Math.round(gcx + Math.cos(sa) * rad), Math.round(gcy + Math.sin(sa) * rad));
        ctx.stroke();
      }
      for (let t = 0; t < 12; t++) {
        const a = time * 0.45 * dir + (t * Math.PI * 2) / 12;
        const tx = Math.round(gcx + Math.cos(a) * (rad + 4));
        const ty = Math.round(gcy + Math.sin(a) * (rad + 4));
        ctx.fillStyle = '#ffb84d44';
        ctx.fillRect(tx - 2, ty - 2, 4, 4);
      }
      ctx.fillStyle = '#66e6ff44';
      ctx.fillRect(gcx - 2, gcy - 2, 4, 4);
    }
  } else if (biome === 'emerald_sky') {
    const sx = 246 - gx * 4 - Math.round(pSky * 0.4);
    const sy = 32 - Math.round(pSkyY * 0.35);
    const sg = ctx.createRadialGradient(sx, sy, 3, sx, sy, 48);
    sg.addColorStop(0, '#ffe98588');
    sg.addColorStop(0.5, '#57f2a833');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx - 48, sy - 48, 96, 96);
    ctx.fillStyle = '#fff5b8';
    ctx.fillRect(sx - 6, sy - 6, 12, 12);

    // Distant floating sky ship gliding peacefully
    const shipX = safeModIdx(Math.round(time * 10 - Math.round(pFar * 0.4)), VIRTUAL_WIDTH + 60) - 30;
    const shipY = 34 + Math.round(Math.sin(time * 1.6) * 2);
    ctx.fillStyle = '#1b4332aa';
    ctx.fillRect(shipX - 8, shipY, 16, 4);
    ctx.fillRect(shipX - 5, shipY - 7, 10, 6);
    ctx.fillStyle = '#ffd27d88';
    ctx.fillRect(shipX - 3, shipY - 5, 6, 3);

    for (let i = 0; i < 4; i++) {
      const ix = safeModIdx(38 + i * 84 - pFar, VIRTUAL_WIDTH + 40) - 20;
      const iy = 48 + (i % 2) * 18 + Math.round(Math.sin(time * 1.4 + i) * 2);
      ctx.fillStyle = meta.mountainMid;
      ctx.fillRect(ix, iy, 30, 7);
      ctx.fillRect(ix + 5, iy + 7, 20, 6);
      ctx.fillRect(ix + 10, iy + 13, 10, 5);
      ctx.fillStyle = '#57f2a888';
      ctx.fillRect(ix + 1, iy - 2, 28, 3);
      // Twin shimmering waterfalls cascading off island
      ctx.fillStyle = '#a8f9ff66';
      const flow = Math.floor(time * 26) % 8;
      ctx.fillRect(ix + 21, iy + 1, 3, 32);
      ctx.fillRect(ix + 6, iy + 3, 2, 20);
      ctx.fillStyle = '#ffffff88';
      ctx.fillRect(ix + 22, iy + 2 + flow, 1, 5);
    }
  } else if (biome === 'solar_mirage') {
    const sx = 236 - gx * 4 - Math.round(pSky * 0.4);
    const sy = 34 - Math.round(pSkyY * 0.35);
    const sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 48);
    sg.addColorStop(0, '#ffe47a99');
    sg.addColorStop(0.55, '#ff8f3344');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx - 48, sy - 48, 96, 96);
    ctx.fillStyle = '#fff5b8';
    ctx.fillRect(sx - 9, sy - 9, 18, 18);
    ctx.fillStyle = '#ffb84d';
    ctx.fillRect(sx + 16, sy + 4, 7, 7);
    // Stepped pyramids + hovering golden obelisks with glyph pulses
    ctx.fillStyle = meta.mountainFar;
    for (let i = 0; i < 3; i++) {
      const px = safeModIdx(40 + i * 108 - pFar, VIRTUAL_WIDTH + 60) - 30;
      for (let tier = 0; tier < 18; tier++) {
        ctx.fillRect(px + tier, 118 - tier * 2, 38 - tier * 2, 2);
      }
      ctx.fillStyle = '#ffd24d88';
      ctx.fillRect(px + 18, 80, 2, 5);
      const obX = safeModIdx(px + 46, VIRTUAL_WIDTH + 20) - 10;
      const obY = 58 + Math.round(Math.sin(time * 1.7 + i) * 3);
      ctx.fillStyle = '#3b200f';
      ctx.fillRect(obX, obY, 5, 16);
      ctx.fillStyle = '#ffe47a99';
      ctx.fillRect(obX + 2, obY + 4, 1, 7);
      ctx.fillStyle = meta.mountainFar;
    }
  } else if (biome === 'amethyst_crypt') {
    const mx = 228 - gx * 4 - Math.round(pSky * 0.45);
    const my = 36 - Math.round(pSkyY * 0.35);
    const mg = ctx.createRadialGradient(mx, my, 4, mx, my, 42);
    mg.addColorStop(0, '#c084fc77');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(mx - 42, my - 42, 84, 84);
    const disc = getCachedCelestialDisc('amethyst_moon', meta.accent);
    if (disc) ctx.drawImage(disc, mx - 14, my - 14);
    for (let i = 0; i < 4; i++) {
      const rx = safeModIdx(36 + i * 86 - pFar, VIRTUAL_WIDTH + 30) - 15;
      const ry = 44 + (i % 2) * 18 + Math.round(Math.sin(time * 1.8 + i) * 3);
      ctx.fillStyle = '#1b0e2e';
      ctx.fillRect(rx, ry, 10, 22);
      ctx.fillStyle = '#c084fcaa';
      ctx.fillRect(rx + 4, ry + 5, 2, 4);
      ctx.fillRect(rx + 3, ry + 12, 4, 2);
      ctx.strokeStyle = '#e879f944';
      ctx.beginPath();
      ctx.ellipse(rx + 5, ry + 11, 10, 3, time * 0.8 + i, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Giant horizon crystal clusters
    for (let c = 0; c < 6; c++) {
      const cx = safeModIdx(20 + c * 56 - pFar, VIRTUAL_WIDTH + 24) - 12;
      ctx.fillStyle = '#4c1d9555';
      ctx.fillRect(cx, 108, 6, 18);
      ctx.fillStyle = '#d8b4fe66';
      ctx.fillRect(cx + 2, 104, 2, 16);
    }
  } else if (biome === 'alchemical_labs') {
    // Connecting brass manifolds + giant bubbling alchemy vats + arc sparks
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 36, VIRTUAL_WIDTH, 3);
    for (let i = 0; i < 4; i++) {
      const vx = safeModIdx(42 + i * 88 - pFar, VIRTUAL_WIDTH + 40) - 20;
      ctx.fillStyle = '#0c1c26';
      ctx.fillRect(vx, 30, 18, 82);
      ctx.fillStyle = i % 2 === 0 ? '#34d39944' : '#f472b644';
      ctx.fillRect(vx + 2, 36, 14, 72);
      for (let b = 0; b < 3; b++) {
        const bub = Math.floor(time * (16 + b * 6) + i * 17 + b * 23) % 62;
        ctx.fillStyle = i % 2 === 0 ? '#6ee7b7cc' : '#fbcfe8cc';
        ctx.fillRect(vx + 4 + ((i + b * 4) % 9), 104 - bub, 3 - (b % 2), 3 - (b % 2));
      }
      ctx.fillStyle = '#ffffff44';
      ctx.fillRect(vx + 3, 40, 2, 60);
      // Brass cap & flickering arc
      ctx.fillStyle = '#b45309';
      ctx.fillRect(vx - 1, 27, 20, 4);
      if (Math.floor(time * 8 + i) % 5 === 0) {
        ctx.fillStyle = '#67e8f9cc';
        ctx.fillRect(vx + 6, 22, 6, 2);
      }
    }
  } else if (biome === 'aurora_zenith') {
    for (let x = 0; x < VIRTUAL_WIDTH; x += 2) {
      const ax = x + pSky;
      const ay = 12 + Math.round(Math.sin(ax * 0.025 + time * 1.5) * 9);
      const h = 30 + Math.round(Math.cos(ax * 0.04 - time * 1.1) * 9);
      ctx.fillStyle = '#38bdf84a';
      ctx.fillRect(x, ay, 2, h);
      ctx.fillStyle = '#34d39940';
      ctx.fillRect(x, ay + 5, 2, 13);
      ctx.fillStyle = '#f472b633';
      ctx.fillRect(x, ay - 3, 2, 7);
      ctx.fillStyle = '#fde04728';
      ctx.fillRect(x, ay + h - 4, 2, 4);
      if (x % 8 === 0) {
        ctx.fillStyle = '#ffffff26';
        ctx.fillRect(x, ay + 2, 1, h - 6);
      }
    }
  } else if (biome === 'crimson_canyon') {
    const sx = 230 - gx * 4 - Math.round(pSky * 0.45);
    const sy = 36 - Math.round(pSkyY * 0.35);
    const sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, 48);
    sg.addColorStop(0, '#ff773388');
    sg.addColorStop(0.55, '#fb71853d');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx - 48, sy - 48, 96, 96);
    ctx.fillStyle = '#fff5c4';
    ctx.fillRect(sx - 10, sy - 10, 20, 20);
    ctx.fillStyle = '#ff9944';
    ctx.fillRect(sx - 12, sy - 4, 24, 8);
    ctx.fillStyle = meta.mountainFar;
    for (let i = 0; i < 4; i++) {
      const mx = safeModIdx(24 + i * 86 - pFar, VIRTUAL_WIDTH + 50) - 25;
      const mh = 34 + (i % 2) * 14;
      ctx.fillRect(mx, VIRTUAL_HEIGHT - mh - 46, 36, mh + 46);
      ctx.fillRect(mx - 6, VIRTUAL_HEIGHT - mh - 32, 48, 32);
      // Mesa sedimentary strata bands
      ctx.fillStyle = '#fb923c55';
      ctx.fillRect(mx, VIRTUAL_HEIGHT - mh - 46, 36, 2);
      ctx.fillRect(mx - 4, VIRTUAL_HEIGHT - mh - 24, 44, 2);
      ctx.fillStyle = meta.mountainFar;
    }
    // Circling canyon hawks
    for (let b = 0; b < 3; b++) {
      const bx = safeModIdx(Math.round(time * (14 + b * 3) + b * 90 - pSky), VIRTUAL_WIDTH + 20) - 10;
      const by = 28 + b * 9 + Math.round(Math.sin(time * 2.4 + b) * 3);
      const wing = Math.sin(time * 6 + b) > 0 ? -1 : 1;
      ctx.fillStyle = '#2d0c16';
      ctx.fillRect(bx, by, 3, 1);
      ctx.fillRect(bx - 2, by + wing, 2, 1);
      ctx.fillRect(bx + 3, by + wing, 2, 1);
    }
  } else if (biome === 'cyber_undercity') {
    for (let i = 0; i < 5; i++) {
      const tx = safeModIdx(18 + i * 70 - pFar, VIRTUAL_WIDTH + 40) - 20;
      const th = 58 + ((i * 23) % 34);
      ctx.fillStyle = '#070a1c';
      ctx.fillRect(tx, VIRTUAL_HEIGHT - th - 36, 22, th + 36);
      const neonCol = i % 2 === 0 ? '#22d3eeaa' : '#f472b6aa';
      ctx.fillStyle = neonCol;
      ctx.fillRect(tx + 2, VIRTUAL_HEIGHT - th - 34, 18, 2);
      for (let wy = VIRTUAL_HEIGHT - th - 26; wy < VIRTUAL_HEIGHT - 44; wy += 6) {
        if ((wy + i * 3) % 12 === 0) {
          ctx.fillRect(tx + 4, wy, 5, 2);
          ctx.fillRect(tx + 13, wy, 5, 2);
        }
      }
      if (i % 2 === 1) {
        const flick = Math.floor(time * 6 + i) % 5 !== 0;
        if (flick) {
          ctx.fillStyle = '#22d3ee44';
          ctx.fillRect(tx - 4, VIRTUAL_HEIGHT - th - 48, 30, 8);
          ctx.fillStyle = '#ffffffcc';
          ctx.fillRect(tx, VIRTUAL_HEIGHT - th - 45, 20, 2);
        }
      }
    }
    // Flying neon sky-spinners + elevated monorail train
    for (let s = 0; s < 3; s++) {
      const dir = s % 2 === 0 ? 1 : -1;
      const sx = safeModIdx(Math.round(time * (48 + s * 14) * dir + s * 110 - pFar), VIRTUAL_WIDTH + 40) - 20;
      const sy = 34 + s * 18;
      ctx.fillStyle = s % 2 === 0 ? '#f472b688' : '#22d3ee88';
      ctx.fillRect(sx - dir * 10, sy + 1, 10, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx, sy, 4, 2);
    }
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 58, VIRTUAL_WIDTH, 3);
    const trainX = safeModIdx(Math.round(time * 75 - pFar), VIRTUAL_WIDTH + 60) - 40;
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(trainX, 54, 26, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(trainX + 2, 55, 18, 1);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(trainX + 22, 55, 4, 2);
  } else if (biome === 'celestial_marble') {
    const sx = 160 - Math.round(pSky * 0.3);
    const sg = ctx.createRadialGradient(sx, 36, 5, sx, 36, 58);
    sg.addColorStop(0, '#fff7cc99');
    sg.addColorStop(0.6, '#fbbf2433');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(sx - 58, 0, 116, 96);
    // Double golden halo ring above sky temple
    ctx.strokeStyle = '#fde04755';
    ctx.beginPath();
    ctx.ellipse(sx, 28, 34, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#e2e8f02c';
    ctx.fillRect(sx - 34, 46, 68, 42);
    ctx.fillStyle = '#fbbf2466';
    ctx.fillRect(sx - 20, 32, 40, 14);
    ctx.fillRect(sx - 2, 24, 4, 8);
    for (let c = -28; c <= 28; c += 14) {
      ctx.fillStyle = '#f8fafc55';
      ctx.fillRect(sx + c - 2, 48, 4, 38);
    }
  } else if (biome === 'ebony_fen') {
    const mx = 216 - gx * 4 - Math.round(pSky * 0.45);
    const my = 34 - Math.round(pSkyY * 0.35);
    const mg = ctx.createRadialGradient(mx, my, 4, mx, my, 42);
    mg.addColorStop(0, '#4df0c055');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(mx - 42, my - 42, 84, 84);
    ctx.fillStyle = '#bbf7d0';
    ctx.fillRect(mx - 10, my - 10, 20, 20);
    ctx.fillStyle = meta.skyMid;
    ctx.fillRect(mx - 4, my - 6, 6, 5);
    // Ghostly weeping willow silhouettes & floating lantern wisps
    for (let w = 0; w < 3; w++) {
      const wx = safeModIdx(44 + w * 116 - pFar, VIRTUAL_WIDTH + 40) - 20;
      ctx.fillStyle = '#0a1f1c';
      ctx.fillRect(wx - 2, 82, 4, 42);
      ctx.fillRect(wx - 12, 76, 24, 6);
      const sway = Math.round(Math.sin(time * 1.4 + w) * 1.2);
      for (let b = -10; b <= 10; b += 5) {
        ctx.fillRect(wx + b + sway, 82, 1, 18);
      }
    }
    for (let i = 0; i < 8; i++) {
      const fx = safeModIdx(i * 44 - pFar, VIRTUAL_WIDTH);
      const fy = 88 + Math.round(Math.sin(time * 2.1 + i) * 7);
      ctx.fillStyle = '#34d39955';
      ctx.fillRect(fx - 2, fy - 2, 6, 6);
      ctx.fillStyle = '#34d399cc';
      ctx.fillRect(fx, fy, 2, 2);
      ctx.fillStyle = '#ffffffdd';
      ctx.fillRect(fx, fy, 1, 1);
    }
  } else if (biome === 'orbital_nexus') {
    // Distant ringed planet + planetary curvature + orbital station core
    const px = 72 - Math.round(pSky * 0.25);
    ctx.fillStyle = '#1e3a8a44';
    ctx.beginPath();
    ctx.arc(px, 46, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#67e8f944';
    ctx.beginPath();
    ctx.ellipse(px, 46, 34, 7, 0.25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#081b38';
    ctx.fillRect(0, 118, VIRTUAL_WIDTH, 62);
    ctx.fillStyle = '#38bdf866';
    ctx.fillRect(0, 117, VIRTUAL_WIDTH, 2);
    ctx.fillStyle = '#ffffffaa';
    ctx.fillRect(0, 118, VIRTUAL_WIDTH, 1);
    const ox = 196 - Math.round(pSky * 0.4);
    const oy = 42 - Math.round(pSkyY * 0.3);
    ctx.strokeStyle = '#67e8f988';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(ox, oy, 38, 12, -0.18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    // Blinking orbital beacons along ring
    const bx = Math.round(ox + Math.cos(time * 1.4) * 36);
    const by = Math.round(oy + Math.sin(time * 1.4) * 10);
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(bx - 1, by - 1, 3, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(ox - 5, oy - 5, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox - 2, oy - 2, 4, 4);
  } else if (biome === 'twilight_garden') {
    const mx = 224 - gx * 4 - Math.round(pSky * 0.45);
    const my = 38 - Math.round(pSkyY * 0.35);
    const mg = ctx.createRadialGradient(mx, my, 4, mx, my, 48);
    mg.addColorStop(0, '#c084fc77');
    mg.addColorStop(0.6, '#f472b630');
    mg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(mx - 48, my - 48, 96, 96);
    const disc = getCachedCelestialDisc('crescent:#e879f9', '#e879f9');
    if (disc) ctx.drawImage(disc, mx - 14, my - 14);
    for (let i = 0; i < 8; i++) {
      const vx = safeModIdx(i * 44 - pFar, VIRTUAL_WIDTH);
      const sway = Math.round(Math.sin(time * 2 + i) * 1.4);
      const vh = 18 + ((i * 11) % 22);
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(vx + sway, 0, 2, vh);
      ctx.fillStyle = i % 2 === 0 ? '#f472b6dd' : '#67e8f9dd';
      ctx.fillRect(vx - 1 + sway, vh, 4, 4);
      ctx.fillStyle = '#ffffffaa';
      ctx.fillRect(vx + sway, vh + 1, 2, 2);
    }
    // Floating luminescent pollen motes
    for (let p = 0; p < 10; p++) {
      const px = safeModIdx(p * 33 + Math.round(Math.sin(time * 1.3 + p) * 12) - pFar, VIRTUAL_WIDTH);
      const py = 72 + ((p * 17) % 44) + Math.round(Math.cos(time * 1.7 + p) * 5);
      ctx.fillStyle = p % 2 === 0 ? '#f472b699' : '#67e8f999';
      ctx.fillRect(px, py, 2, 2);
    }
  }

  // Subtle animated aurora / atmospheric shimmer across upper sky
  for (let ax = 0; ax < VIRTUAL_WIDTH; ax += 4) {
    const waveY = 10 + Math.round(Math.sin(time * 0.85 + ax * 0.04) * 5);
    const alpha = 0.09 + 0.06 * Math.sin(time * 1.3 + ax * 0.07);
    ctx.fillStyle = meta.accent + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillRect(ax, waveY, 4, 9);
  }

  // Horizon atmospheric glow wash
  const horizonGrad = ctx.createLinearGradient(0, 56, 0, VIRTUAL_HEIGHT - 18);
  horizonGrad.addColorStop(0, 'rgba(0,0,0,0)');
  horizonGrad.addColorStop(0.55, meta.accent + '2c');
  horizonGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = horizonGrad;
  ctx.fillRect(0, 56, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - 74);

  // Plane 1A: Distant High Cirrus Wisps (0.06x parallax)
  if (biome !== 'obsidian_forge' && biome !== 'sunken_cathedral' && biome !== 'coral_abyss') {
    for (let i = 0; i < 6; i++) {
      const cx = safeModIdx(i * 68 + time * 1.8 - Math.round(pCloud * 0.6), VIRTUAL_WIDTH + 80) - 40;
      const cy = 10 + (i % 3) * 11 - Math.round(pSkyY * 0.35);
      ctx.fillStyle = meta.tileHighlight + '24';
      ctx.fillRect(cx, cy, 42 + (i % 2) * 14, 2);
      ctx.fillRect(cx + 8, cy - 2, 24, 2);
    }
  }

  // Plane 1B: 4-Tone Sculpted Cel-Shaded Cumulus Clouds with Rim Highlights (0.10x parallax)
  if (biome !== 'obsidian_forge' && biome !== 'sunken_cathedral' && biome !== 'coral_abyss') {
    const cloudSpan = VIRTUAL_WIDTH + 96;
    for (let i = 0; i < 8; i++) {
      const cw = 34 + (i % 3) * 14;
      const cx =
        safeModIdx(i * 58 + time * (3.2 + (i % 3) * 0.75) - gx * 12 - pCloud, cloudSpan) - 54;
      const cy = 16 + (i % 3) * 17 - Math.round(pSkyY * 0.5);
      ctx.fillStyle = meta.mountainFar + 'bb';
      ctx.fillRect(cx + 2, cy + 5, cw - 4, 3);
      ctx.fillStyle = meta.accent + '28';
      ctx.fillRect(cx + 3, cy + 6, cw - 6, 1);
      ctx.fillStyle = meta.tileHighlight + '44';
      ctx.fillRect(cx, cy + 2, cw, 4);
      ctx.fillRect(cx + 5, cy - 2, cw - 11, 4);
      ctx.fillRect(cx + 10, cy - 5, Math.max(8, cw - 20), 3);
      ctx.fillStyle = meta.secondaryAccent + '55';
      ctx.fillRect(cx + 11, cy - 5, Math.max(6, cw - 22), 1);
    }
  }

  // Plane 2: Biome-Tailored Midground Architecture & Flora Silhouettes (0.18x parallax)
  ctx.fillStyle = meta.mountainFar;
  const ruinPeriod = 54;
  const isOriental = biome === 'crimson_sakura' || biome === 'jade_bamboo' || biome === 'cloud_monastery';
  const isCyber = biome === 'cyber_undercity' || biome === 'cyber_grid' || biome === 'orbital_nexus' || biome === 'lunar_bastion';
  const isFungal = biome === 'bioluminescent' || biome === 'fungal_myriad' || biome === 'ebony_fen';
  const isDesert = biome === 'solar_mirage' || biome === 'hourglass_desert' || biome === 'crimson_canyon' || biome === 'obsidian_temple';
  for (let i = -1; i <= Math.ceil(VIRTUAL_WIDTH / ruinPeriod) + 1; i++) {
    const worldSlot = Math.floor(pFar / ruinPeriod) + i;
    const px = worldSlot * ruinPeriod - pFar;
    const hash = Math.abs(worldSlot * 17 + gx * 23);
    const ph = 58 + (hash % 36);
    const baseY = VIRTUAL_HEIGHT - ph + Math.round(pFarY * 0.4);
    if (isFungal) {
      ctx.fillRect(px + 2, baseY, 4, ph);
      ctx.fillRect(px - 10, baseY - 5, 28, 7);
      const glowOn = Math.sin(time * 2.2 + worldSlot) > -0.2;
      ctx.fillStyle = glowOn ? meta.accent + '88' : meta.secondaryAccent + '44';
      ctx.fillRect(px - 6, baseY - 3, 6, 2);
      ctx.fillRect(px + 6, baseY - 4, 5, 2);
      ctx.fillStyle = meta.secondaryAccent + '77';
      ctx.fillRect(px - 3, baseY + 2, 2, 6);
      ctx.fillStyle = meta.mountainFar;
    } else if (isOriental) {
      ctx.fillRect(px + 1, baseY + 6, 12, ph);
      ctx.fillRect(px - 5, baseY + 3, 24, 4);
      ctx.fillRect(px - 7, baseY + 1, 3, 2);
      ctx.fillRect(px + 18, baseY + 1, 3, 2);
      ctx.fillRect(px - 2, baseY - 6, 18, 4);
      ctx.fillRect(px + 5, baseY - 12, 4, 6);
      // Swaying glowing paper lantern under eaves
      const sway = Math.round(Math.sin(time * 2.6 + worldSlot) * 1.2);
      ctx.fillStyle = '#ffd27d99';
      ctx.fillRect(px - 5 + sway, baseY + 8, 3, 4);
      ctx.fillStyle = meta.mountainFar;
    } else if (isCyber) {
      ctx.fillRect(px - 2, baseY - 8, 18, ph + 8);
      ctx.fillRect(px + 5, baseY - 18, 2, 10);
      const blink = Math.floor(time * 3 + worldSlot) % 2 === 0;
      ctx.fillStyle = blink ? meta.accent + 'cc' : meta.secondaryAccent + '66';
      ctx.fillRect(px + 5, baseY - 19, 2, 2);
      ctx.fillStyle = meta.secondaryAccent + '44';
      ctx.fillRect(px, baseY - 3, 14, 2);
      ctx.fillRect(px + 2, baseY + 8, 4, 14);
      ctx.fillRect(px + 9, baseY + 12, 4, 10);
      ctx.fillStyle = meta.mountainFar;
    } else if (isDesert) {
      // Tapered sandstone obelisk + pulsing solar glyph
      ctx.fillRect(px + 1, baseY, 12, ph);
      ctx.fillRect(px + 3, baseY - 8, 8, 8);
      ctx.fillRect(px + 5, baseY - 13, 4, 5);
      ctx.fillStyle = meta.accent + '77';
      ctx.fillRect(px + 6, baseY - 4, 2, 4);
      ctx.fillStyle = meta.mountainFar;
    } else {
      // Gothic spire / cathedral silhouette with rose window & animated banner
      ctx.fillRect(px, baseY, 14, ph);
      ctx.fillRect(px - 2, baseY, 18, 4);
      ctx.fillRect(px + 3, baseY - 5, 8, 5);
      ctx.fillRect(px + 5, baseY - 12, 3, 7);
      const flagSway = Math.round(Math.sin(time * 4.2 + worldSlot * 1.4) * 1.5);
      ctx.fillStyle = meta.accent + '77';
      ctx.fillRect(px + 8, baseY - 11 + (flagSway > 0 ? 1 : 0), 6, 2);
      const lit = Math.sin(time * 1.8 + hash) > -0.5;
      ctx.fillStyle = lit ? meta.secondaryAccent + '66' : meta.accent + '33';
      ctx.fillRect(px + 4, baseY + 9, 5, 9);
      ctx.fillRect(px + 5, baseY + 24, 3, 5);
      ctx.fillStyle = meta.mountainFar;
      if (Math.abs(worldSlot) % 2 === 0) {
        ctx.fillRect(px + 14, baseY + 9, ruinPeriod - 14, 4);
        ctx.fillStyle = meta.accent + '28';
        ctx.fillRect(px + 14, baseY + 9, ruinPeriod - 14, 1);
        ctx.fillStyle = meta.mountainFar;
      }
    }
  }

  // Plane 2.5: Far Mountain Ridge + Crisp 1px Stratified Crags + Illuminated Crests + Depth Haze
  for (let x = 0; x < VIRTUAL_WIDTH; x += 1) {
    const wx = x + pFar + gx * 40;
    const h =
      70 +
      snapHalf(Math.sin(wx * 0.021) * 19 + Math.cos(wx * 0.053) * 9 + Math.sin(wx * 0.11) * 2) -
      snapHalf(pFarY * 0.5);
    const fh = Math.max(24, h);
    ctx.fillStyle = meta.mountainFar;
    ctx.fillRect(x, VIRTUAL_HEIGHT - fh, 1, fh);
    // Sunlit ridge crest & vertical cliff strata shading
    ctx.fillStyle = colorWithAlpha(meta.tileHighlight, 0.24);
    ctx.fillRect(x, VIRTUAL_HEIGHT - fh, 1, 1);
    if (Math.floor(wx) % 9 === 0) {
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.11);
      ctx.fillRect(x, VIRTUAL_HEIGHT - fh + 2, 1, Math.min(20, fh - 4));
    }
  }
  // Aerial perspective haze between Far and Mid ridges
  const farHaze = ctx.createLinearGradient(0, VIRTUAL_HEIGHT - 84, 0, VIRTUAL_HEIGHT - 42);
  farHaze.addColorStop(0, 'rgba(0,0,0,0)');
  farHaze.addColorStop(0.55, colorWithAlpha(meta.skyBottom, 0.42));
  farHaze.addColorStop(1, colorWithAlpha(meta.accent, 0.14));
  ctx.fillStyle = farHaze;
  ctx.fillRect(0, VIRTUAL_HEIGHT - 84, VIRTUAL_WIDTH, 42);

  // Plane 3: Mid Silhouette Ridge + 1px Rim-lit Slopes + Pulsing Beacons + Biome Landmarks (0.34x parallax)
  for (let x = 0; x < VIRTUAL_WIDTH; x += 1) {
    const wx = x + pMid + gx * 55;
    const h =
      48 +
      snapHalf(Math.sin(wx * 0.031 + 0.8) * 14 + Math.cos((wx + gy * 25) * 0.068) * 7) -
      snapHalf(pMidY * 0.6);
    const mh = Math.max(18, h);
    ctx.fillStyle = meta.mountainMid;
    ctx.fillRect(x, VIRTUAL_HEIGHT - mh, 1, mh);
    ctx.fillStyle = colorWithAlpha(meta.accent, 0.28);
    ctx.fillRect(x, VIRTUAL_HEIGHT - mh, 1, 0.5);
    ctx.fillStyle = meta.mountainMid;
    if (Math.floor(wx) % 16 === 0) {
      if (biome === 'silver_ash' || biome === 'frostglass' || biome === 'emerald_sky' || biome === 'glacial_fjord') {
        ctx.fillRect(x, VIRTUAL_HEIGHT - mh - 9, 1.5, 9);
        ctx.fillRect(x - 1.5, VIRTUAL_HEIGHT - mh - 5, 4.5, 1.5);
      } else if (biome === 'crimson_sakura' || biome === 'jade_bamboo') {
        ctx.fillRect(x - 0.5, VIRTUAL_HEIGHT - mh - 6, 3, 6);
        ctx.fillStyle = colorWithAlpha(meta.accent, 0.44);
        ctx.fillRect(x - 4, VIRTUAL_HEIGHT - mh - 10, 9, 3.5);
      } else if (biome === 'sunken_cathedral' || biome === 'coral_abyss') {
        ctx.fillRect(x, VIRTUAL_HEIGHT - mh - 10, 1.5, 10);
        ctx.fillRect(x + 1.5, VIRTUAL_HEIGHT - mh - 7, 1.5, 3);
      } else if (biome === 'clockwork_spire' || biome === 'rust_foundry') {
        ctx.fillRect(x - 0.5, VIRTUAL_HEIGHT - mh - 11, 3, 11);
        ctx.fillStyle = '#ffb84d88';
        ctx.fillRect(x, VIRTUAL_HEIGHT - mh - 13, 1.5, 1.5);
      } else if (biome === 'cyber_undercity' || biome === 'cyber_grid' || biome === 'orbital_nexus') {
        ctx.fillRect(x - 0.5, VIRTUAL_HEIGHT - mh - 13, 3, 13);
        ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.72);
        ctx.fillRect(x, VIRTUAL_HEIGHT - mh - 15, 1.5, 1.5);
      } else {
        ctx.fillRect(x - 0.5, VIRTUAL_HEIGHT - mh - 9, 3, 9);
        ctx.fillStyle = colorWithAlpha(meta.accent, 0.52);
        ctx.fillRect(x, VIRTUAL_HEIGHT - mh - 11, 1.5, 1.5);
      }
    }
    // Pulsing distant watchfire/rune dot along ridge slopes
    if (Math.floor(wx) % 56 === 0) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 3 + wx * 0.1);
      ctx.fillStyle = colorWithAlpha(pulse > 0.5 ? meta.secondaryAccent : meta.accent, 0.55 + pulse * 0.35);
      ctx.fillRect(x, VIRTUAL_HEIGHT - mh + 6, 1.5, 1.5);
      if (pulse > 0.7) {
        drawCachedGlow(ctx, x + 0.5, VIRTUAL_HEIGHT - mh + 6.5, 6, meta.secondaryAccent, 0.25);
      }
    }
  }

  // Second atmospheric mist band between Mid & Near ridges
  ctx.fillStyle = colorWithAlpha(meta.skyBottom, 0.28);
  ctx.fillRect(0, VIRTUAL_HEIGHT - 44, VIRTUAL_WIDTH, 16);

  // Plane 4: Near Ridge Silhouette + Crisp Secondary Edge Rim (0.58x parallax)
  for (let x = 0; x < VIRTUAL_WIDTH; x += 1) {
    const wx = x + pNear + gx * 70;
    const h =
      28 +
      snapHalf(Math.sin(wx * 0.044 + 1.4) * 10 + Math.cos((wx + gy * 15) * 0.09) * 5) -
      snapHalf(pNearY * 0.7);
    const nh = Math.max(10, h);
    ctx.fillStyle = meta.mountainNear;
    ctx.fillRect(x, VIRTUAL_HEIGHT - nh, 1, nh);
    ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.25);
    ctx.fillRect(x, VIRTUAL_HEIGHT - nh, 1, 0.5);
  }

  // Distant drifting flock / sky wisps for living atmosphere
  for (let b = 0; b < 5; b++) {
    const bx = safeModIdx(Math.round(time * (13 + b * 4) + b * 74 - pMid), VIRTUAL_WIDTH + 30) - 15;
    const by = 28 + (b % 3) * 15 + Math.round(Math.sin(time * 3 + b * 2) * 3);
    const wing = Math.sin(time * 9 + b) > 0 ? -1 : 1;
    ctx.fillStyle = meta.tileOutline + 'cc';
    ctx.fillRect(bx, by, 2, 1);
    ctx.fillRect(bx - 1, by + wing, 1, 1);
    ctx.fillRect(bx + 2, by + wing, 1, 1);
  }

  // Plane 4.5: Volumetric Diagonal God Rays + Mist Ribbons
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const rx = safeModIdx(24 + i * 76 - Math.round(camX * 0.45) + Math.round(Math.sin(time * 0.35 + i * 2) * 9), VIRTUAL_WIDTH + 60) - 30;
    const wTop = 14 + (i % 2) * 10;
    const grad = ctx.createLinearGradient(rx, 0, rx + 38, VIRTUAL_HEIGHT);
    grad.addColorStop(0, meta.accent + '30');
    grad.addColorStop(0.6, meta.secondaryAccent + '16');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + wTop, 0);
    ctx.lineTo(rx + wTop + 48, VIRTUAL_HEIGHT);
    ctx.lineTo(rx + 28, VIRTUAL_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  const mistDrift = Math.round(time * 10) - pNear;
  ctx.fillStyle = meta.accent + '22';
  ctx.fillRect(0, VIRTUAL_HEIGHT - 44, VIRTUAL_WIDTH, 18);
  ctx.fillStyle = meta.tileHighlight + '2a';
  ctx.fillRect(0, VIRTUAL_HEIGHT - 36, VIRTUAL_WIDTH, 9);
  ctx.fillRect(safeModIdx(mistDrift, VIRTUAL_WIDTH), VIRTUAL_HEIGHT - 46, 100, 6);
  ctx.fillRect(safeModIdx(mistDrift + 160, VIRTUAL_WIDTH), VIRTUAL_HEIGHT - 36, 88, 5);

  // Mid-air ambient motes
  for (let i = 0; i < engine.ambientMotes.length; i++) {
    const m = engine.ambientMotes[i];
    const mx = safeModIdx(Math.round(m.x - camX * 0.35), VIRTUAL_WIDTH);
    const my = safeModIdx(Math.round(m.y - camY * 0.25), VIRTUAL_HEIGHT);
    ctx.fillStyle = i % 3 === 0 ? meta.secondaryAccent + 'ee' : meta.particleColor + 'cc';
    ctx.fillRect(mx, my, i % 4 === 0 ? 2 : 1, 1);
  }
}

export function drawEnhancedForeground(
  ctx: CanvasRenderingContext2D,
  biome: AnyBiomeId,
  time: number,
  engine: GameEngine,
  camX = 0,
  camY = 0
): void {
  const meta = getAnyBiomeMeta(biome);
  const pFgX = Math.round(camX * 1.35);
  const pFgY = Math.round(camY * 0.6);

  // Plane 6: Foreground 1.35x Parallax Framing Foliage / Crystal Spires / Chains
  ctx.fillStyle = meta.tileOutline + 'dd';
  const fgStep = 64;
  for (let i = -1; i <= Math.ceil(VIRTUAL_WIDTH / fgStep) + 1; i++) {
    const slot = Math.floor(pFgX / fgStep) + i;
    const fx = slot * fgStep - pFgX;
    const hash = Math.abs(slot * 31 + 7);
    const sway = Math.round(Math.sin(time * 2.2 + slot) * 1.2);
    if (hash % 3 === 0) {
      ctx.fillRect(fx + sway, VIRTUAL_HEIGHT - 13, 4, 13);
      ctx.fillRect(fx + 5 + sway, VIRTUAL_HEIGHT - 9, 3, 9);
      ctx.fillStyle = meta.accent + '55';
      ctx.fillRect(fx + sway, VIRTUAL_HEIGHT - 13, 2, 2);
      ctx.fillStyle = meta.tileOutline + 'dd';
    } else if (hash % 3 === 1 && biome !== 'silver_ash') {
      ctx.fillRect(fx + 10, 0, 3, 9 + (hash % 6));
      ctx.fillRect(fx + 15, 0, 2, 6 + (hash % 4));
    }
  }

  // Biome Weather Particles
  if (biome === 'frostglass') {
    ctx.fillStyle = '#e6fbffbb';
    for (let i = 0; i < 24; i++) {
      const sx = safeModIdx(Math.round(i * 23 - time * 48 - pFgX * 0.7), VIRTUAL_WIDTH);
      const sy = safeModIdx(Math.round(i * 19 + time * 54 - pFgY * 0.5), VIRTUAL_HEIGHT);
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, 1);
    }
  } else if (biome === 'obsidian_forge') {
    for (let i = 0; i < 20; i++) {
      const ex = safeModIdx(Math.round(i * 29 + Math.sin(time * 2 + i) * 8 - pFgX * 0.5), VIRTUAL_WIDTH);
      const ey = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * (22 + (i % 4) * 6) + i * 17) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#ff7722cc' : '#ffe066bb';
      ctx.fillRect(ex, ey, 2, 2);
    }
  } else if (biome === 'crimson_sakura') {
    for (let i = 0; i < 24; i++) {
      const px = safeModIdx(Math.round(i * 25 - time * 32 + Math.sin(time * 2 + i) * 6 - pFgX * 0.6), VIRTUAL_WIDTH);
      const py = safeModIdx(Math.round(i * 15 + time * 26 - pFgY * 0.4), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 3 === 0 ? '#ffd1dcdd' : '#ff70a6cc';
      ctx.fillRect(px, py, 2, 1);
    }
  } else if (biome === 'sunken_cathedral') {
    for (let i = 0; i < 20; i++) {
      const bx = safeModIdx(Math.round(i * 27 + Math.sin(time * 1.8 + i) * 4 - pFgX * 0.5), VIRTUAL_WIDTH);
      const by = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * (18 + (i % 3) * 6) + i * 21) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#7cf2ff88' : '#ffffff99';
      ctx.fillRect(bx, by, 2, 2);
    }
  } else if (biome === 'clockwork_spire') {
    for (let i = 0; i < 18; i++) {
      const sx = safeModIdx(Math.round(i * 31 + time * 28 - pFgX * 0.5), VIRTUAL_WIDTH);
      const sy = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * 24 + i * 19) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#ffb84dcc' : '#66e6ffaa';
      ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, 1);
    }
  } else if (biome === 'emerald_sky') {
    for (let i = 0; i < 22; i++) {
      const lx = safeModIdx(Math.round(i * 26 - time * 36 + Math.sin(time * 3 + i) * 5 - pFgX * 0.6), VIRTUAL_WIDTH);
      const ly = safeModIdx(Math.round(i * 17 + Math.cos(time * 2 + i) * 8 + time * 12), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#57f2a8cc' : '#ffe985bb';
      ctx.fillRect(lx, ly, 2, 1);
    }
  } else if (biome === 'stormcrown') {
    ctx.fillStyle = '#a5f3fc66';
    for (let i = 0; i < 20; i++) {
      const rx = safeModIdx(Math.round(i * 31 - time * 90), VIRTUAL_WIDTH);
      const ry = safeModIdx(Math.round(i * 17 + time * 135), VIRTUAL_HEIGHT);
      ctx.fillRect(rx, ry, 1, 5);
    }
  } else if (biome === 'solar_mirage') {
    for (let i = 0; i < 20; i++) {
      const sx = safeModIdx(Math.round(i * 29 - time * 52 - pFgX * 0.6), VIRTUAL_WIDTH);
      const sy = safeModIdx(Math.round(i * 19 + Math.sin(time * 2.5 + i) * 5), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#ffd24daa' : '#ffe89988';
      ctx.fillRect(sx, sy, 2, 1);
    }
  } else if (biome === 'amethyst_crypt') {
    for (let i = 0; i < 18; i++) {
      const ax = safeModIdx(Math.round(i * 27 + Math.sin(time * 1.5 + i) * 6 - pFgX * 0.5), VIRTUAL_WIDTH);
      const ay = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * 16 + i * 19) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#c084fcaa' : '#38bdf888';
      ctx.fillRect(ax, ay, 2, 2);
    }
  } else if (biome === 'alchemical_labs') {
    for (let i = 0; i < 18; i++) {
      const lx = safeModIdx(Math.round(i * 26 + Math.sin(time * 2.1 + i) * 4 - pFgX * 0.5), VIRTUAL_WIDTH);
      const ly = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * 22 + i * 21) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#34d39999' : '#f472b699';
      ctx.fillRect(lx, ly, 2, 2);
    }
  } else if (biome === 'aurora_zenith') {
    for (let i = 0; i < 22; i++) {
      const fx = safeModIdx(Math.round(i * 23 - time * 42 - pFgX * 0.6), VIRTUAL_WIDTH);
      const fy = safeModIdx(Math.round(i * 17 + time * 38 - pFgY * 0.5), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 3 === 0 ? '#34d399cc' : i % 3 === 1 ? '#38bdf8cc' : '#f472b6bb';
      ctx.fillRect(fx, fy, 2, 1);
    }
  } else if (biome === 'crimson_canyon') {
    for (let i = 0; i < 20; i++) {
      const dx = safeModIdx(Math.round(i * 27 - time * 58 - pFgX * 0.6), VIRTUAL_WIDTH);
      const dy = safeModIdx(Math.round(i * 19 + Math.sin(time * 2.8 + i) * 7), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#fb923ccc' : '#ffe06688';
      ctx.fillRect(dx, dy, 2, 1);
    }
  } else if (biome === 'cyber_undercity') {
    for (let i = 0; i < 22; i++) {
      const cx = safeModIdx(Math.round(i * 23 - pFgX * 0.5), VIRTUAL_WIDTH);
      const cy = safeModIdx(Math.round(i * 17 + time * 95), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#22d3ee99' : '#f472b688';
      ctx.fillRect(cx, cy, 1, 4);
    }
  } else if (biome === 'celestial_marble') {
    for (let i = 0; i < 18; i++) {
      const mx = safeModIdx(Math.round(i * 29 + Math.sin(time * 1.8 + i) * 6 - pFgX * 0.5), VIRTUAL_WIDTH);
      const my = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * 18 + i * 21) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#fbbf24bb' : '#ffffffaa';
      ctx.fillRect(mx, my, 2, 2);
    }
  } else if (biome === 'ebony_fen') {
    for (let i = 0; i < 18; i++) {
      const wx = safeModIdx(Math.round(i * 27 + Math.sin(time * 2.2 + i) * 8 - pFgX * 0.5), VIRTUAL_WIDTH);
      const wy = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * 15 + i * 23) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#34d399cc' : '#a3e635aa';
      ctx.fillRect(wx, wy, 2, 2);
    }
  } else if (biome === 'orbital_nexus') {
    for (let i = 0; i < 20; i++) {
      const ox = safeModIdx(Math.round(i * 31 - time * 72 - pFgX * 0.6), VIRTUAL_WIDTH);
      const oy = safeModIdx(Math.round(i * 19 + time * 14), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#67e8f9cc' : '#ffffffbb';
      ctx.fillRect(ox, oy, 3, 1);
    }
  } else if (biome === 'twilight_garden') {
    for (let i = 0; i < 22; i++) {
      const px = safeModIdx(Math.round(i * 25 + Math.sin(time * 2 + i) * 7 - pFgX * 0.5), VIRTUAL_WIDTH);
      const py = safeModIdx(Math.round(i * 17 + time * 24 - pFgY * 0.4), VIRTUAL_HEIGHT);
      ctx.fillStyle = i % 2 === 0 ? '#e879f9cc' : '#67e8f9aa';
      ctx.fillRect(px, py, 2, 2);
    }
  } else {
    drawNewBiomeForegroundWeather(ctx, biome, meta, pFgX, pFgY, time);
    drawUnderworldForegroundWeather(ctx, engine, meta);
  }

  // Dynamic Room Weather Streaks & Tints
  const weather = engine.roomWeather;
  if (weather === 'wind_gale') {
    ctx.fillStyle = '#5eead466';
    for (let i = 0; i < 14; i++) {
      const wx = safeModIdx(Math.round(i * 31 + time * 165), VIRTUAL_WIDTH);
      const wy = (i * 19 + 7) % VIRTUAL_HEIGHT;
      ctx.fillRect(wx, wy, 14, 1);
    }
  } else if (weather === 'astral_meteor') {
    for (let i = 0; i < 8; i++) {
      const mx = safeModIdx(Math.round(i * 44 - time * 110), VIRTUAL_WIDTH);
      const my = safeModIdx(Math.round(i * 23 + time * 95), VIRTUAL_HEIGHT);
      ctx.fillStyle = '#fbbf24aa';
      ctx.fillRect(mx, my, 2, 2);
      ctx.fillStyle = '#ffffff88';
      ctx.fillRect(mx + 2, my - 2, 2, 1);
    }
  } else if (weather === 'blood_eclipse') {
    ctx.fillStyle = 'rgba(180, 20, 50, 0.08)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    for (let i = 0; i < 10; i++) {
      const ex = safeModIdx(Math.round(i * 37 - time * 36), VIRTUAL_WIDTH);
      const ey = safeModIdx(Math.round(VIRTUAL_HEIGHT - ((time * 24 + i * 29) % VIRTUAL_HEIGHT)), VIRTUAL_HEIGHT);
      ctx.fillStyle = '#fb7185aa';
      ctx.fillRect(ex, ey, 2, 2);
    }
  } else if (weather === 'aurora_blessing') {
    ctx.fillStyle = 'rgba(52, 211, 153, 0.06)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, 42);
  }

  // Foreground 1.35x faster drifting spores / snow / embers with soft glow halos
  for (let i = 0; i < 18; i++) {
    const m = engine.ambientMotes[i];
    if (!m) continue;
    const fx = snapHalf((((m.x * 1.4 - pFgX + time * 12) % VIRTUAL_WIDTH) + VIRTUAL_WIDTH) % VIRTUAL_WIDTH);
    const fy = snapHalf((((m.y * 1.15 - pFgY) % VIRTUAL_HEIGHT) + VIRTUAL_HEIGHT) % VIRTUAL_HEIGHT);
    const col = i % 2 === 0 ? meta.secondaryAccent : meta.accent;
    ctx.fillStyle = colorWithAlpha(col, 0.72);
    ctx.fillRect(fx, fy, i % 3 === 0 ? 1.5 : 1, 1);
    if (i % 4 === 0) {
      drawCachedGlow(ctx, fx + 0.5, fy + 0.5, 6, col, 0.28);
    }
  }
}
