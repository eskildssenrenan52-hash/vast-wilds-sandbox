// @ts-nocheck -- imported game code, written for a looser TS config
// Animated multi-layered spectacles & atmospheric foregrounds for the 20 Underworld Biomes
import type { GameEngine } from './engine';
import { VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './types';
import { colorWithAlpha, drawCachedGlow, drawMicroSparkle, snapHalf } from './visualFx';
import type { BiomeMeta } from './worldData';

export function isUnderworldBiome(biome: string): boolean {
  return (
    biome === 'styx_ferry' ||
    biome === 'asphodel_wastes' ||
    biome === 'brass_tartarus' ||
    biome === 'brimstone_caldera' ||
    biome === 'blood_aqueduct' ||
    biome === 'bone_ossuary' ||
    biome === 'cocytus_trench' ||
    biome === 'phlegethon_rapids' ||
    biome === 'acheron_gorge' ||
    biome === 'lethe_depths' ||
    biome === 'wailing_spires' ||
    biome === 'iron_dungeon' ||
    biome === 'pestilence_marsh' ||
    biome === 'ash_necropolis' ||
    biome === 'obsidian_labyrinth' ||
    biome === 'hellglass_cathedral' ||
    biome === 'shadow_sanctum' ||
    biome === 'magma_core' ||
    biome === 'void_gate' ||
    biome === 'pandemonium_citadel'
  );
}

export function drawUnderworldSpectacle(
  ctx: CanvasRenderingContext2D,
  biome: string,
  meta: BiomeMeta,
  t: number,
  camX: number
): boolean {
  if (!isUnderworldBiome(biome)) return false;

  // Atmospheric sub-horizon abyssal mist glow
  const glowY = 104 + Math.sin(t * 0.7) * 4;
  const mistG = ctx.createLinearGradient(0, glowY - 14, 0, VIRTUAL_HEIGHT);
  mistG.addColorStop(0, 'rgba(0,0,0,0)');
  mistG.addColorStop(0.45, colorWithAlpha(meta.accent, 0.14));
  mistG.addColorStop(1, colorWithAlpha(meta.secondaryAccent, 0.12));
  ctx.fillStyle = mistG;
  ctx.fillRect(0, glowY - 14, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - glowY + 14);

  if (biome === 'styx_ferry' || biome === 'lethe_depths') {
    // Spectral horizon moons & drifting ferry lantern silhouettes
    const mx = 236 - ((camX * 0.04) % 40);
    drawCachedGlow(ctx, mx, 32, 34, meta.accent, 0.34);
    drawCachedGlow(ctx, mx, 32, 16, meta.secondaryAccent, 0.42, 1, true);
    ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.72);
    ctx.beginPath();
    ctx.arc(mx, 32, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.arc(mx - 2, 30, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Floating ghostly ferry silhouettes crossing distant water
    for (let i = 0; i < 3; i++) {
      const bx = ((i * 124 + t * (9 + i * 3) - camX * 0.14) % (VIRTUAL_WIDTH + 60)) - 30;
      const by = 114 + i * 11 + Math.sin(t * 2 + i) * 1.5;
      const sx = snapHalf(bx);
      const sy = snapHalf(by);
      ctx.fillStyle = '#040a0e';
      ctx.fillRect(sx, sy, 22, 4);
      ctx.fillRect(sx + 4, sy - 4, 10, 4);
      // Ferry prow rim highlight & lantern bloom
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.5);
      ctx.fillRect(sx + 1, sy, 20, 0.5);
      drawCachedGlow(ctx, sx + 18, sy - 4, 9, meta.secondaryAccent, 0.55, 1, true);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(sx + 17, sy - 5, 2, 2);
      // Water wake ripple under boat
      ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.25);
      ctx.fillRect(sx - 5, sy + 4, 30, 0.5);
    }
    // Shimmering water bands (0.5px silk ripples)
    for (let y = 134; y < VIRTUAL_HEIGHT; y += 3.5) {
      const offset = Math.sin(t * 2.2 + y * 0.3) * 10;
      const wx = ((y * 23 + offset) % VIRTUAL_WIDTH + VIRTUAL_WIDTH) % VIRTUAL_WIDTH;
      ctx.fillStyle = colorWithAlpha(y % 7 < 3.5 ? meta.accent : meta.secondaryAccent, y % 7 < 3.5 ? 0.22 : 0.14);
      ctx.fillRect(snapHalf(wx), snapHalf(y), 24, 0.5);
    }
    return true;
  }

  if (biome === 'asphodel_wastes' || biome === 'shadow_sanctum') {
    // Tall gothic willow / shadow monoliths + pulsing spectral eyes & wisps in mist
    for (let i = 0; i < 6; i++) {
      const tx = ((i * 68 - camX * 0.12) % (VIRTUAL_WIDTH + 48) + VIRTUAL_WIDTH + 48) % (VIRTUAL_WIDTH + 48) - 24;
      const h = 44 + (i % 3) * 16;
      const sx = snapHalf(tx);
      ctx.fillStyle = meta.mountainFar;
      ctx.fillRect(sx, VIRTUAL_HEIGHT - h - 20, 10, h + 20);
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.32);
      ctx.fillRect(sx + 0.5, VIRTUAL_HEIGHT - h - 20, 1, h + 18);
      ctx.fillRect(sx + 3, VIRTUAL_HEIGHT - h - 18, 1.5, h);
      // Swaying willow wisps & glowing floating spirit motes
      const sway = Math.sin(t * 1.6 + i) * 3;
      ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.35);
      ctx.fillRect(snapHalf(tx - 6 + sway), VIRTUAL_HEIGHT - h - 12, 2.5, 18);
      ctx.fillRect(snapHalf(tx + 11 + sway), VIRTUAL_HEIGHT - h - 8, 2.5, 14);
      const wx = snapHalf(tx + 5 + Math.cos(t * 1.3 + i * 2) * 8);
      const wy = snapHalf(VIRTUAL_HEIGHT - h - 16 + Math.sin(t * 2.1 + i) * 5);
      drawCachedGlow(ctx, wx, wy, 7, meta.secondaryAccent, 0.45, 1, true);
    }
    return true;
  }

  if (biome === 'brass_tartarus' || biome === 'iron_dungeon') {
    // Massive slow rotating Tartarus gears & hanging iron prison cages
    for (let g = 0; g < 3; g++) {
      const gx = 54 + g * 106 - ((camX * 0.08) % 80);
      const gy = 56 + (g % 2) * 26;
      const r = 18 + (g % 2) * 6;
      drawCachedGlow(ctx, gx, gy, r * 1.1, meta.accent, 0.14);
      ctx.strokeStyle = colorWithAlpha(meta.accent, 0.34);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = colorWithAlpha(meta.secondaryAccent, 0.25);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(gx, gy, r - 4, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 8; k++) {
        const ang = t * (g % 2 === 0 ? 0.5 : -0.4) + (k * Math.PI) / 4;
        ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.42);
        ctx.fillRect(snapHalf(gx + Math.cos(ang) * r) - 1.5, snapHalf(gy + Math.sin(ang) * r) - 1.5, 3, 3);
      }
    }
    ctx.lineWidth = 1;
    // Hanging cages swaying gently with ember lanterns inside
    for (let c = 0; c < 4; c++) {
      const cx = ((c * 88 + 20 - camX * 0.16) % (VIRTUAL_WIDTH + 40) + VIRTUAL_WIDTH + 40) % (VIRTUAL_WIDTH + 40) - 20;
      const sway = Math.sin(t * 1.4 + c * 1.7) * 2;
      const topH = 32 + (c % 2) * 14;
      ctx.fillStyle = '#09060c';
      ctx.fillRect(snapHalf(cx), 0, 1, topH);
      ctx.strokeStyle = colorWithAlpha(meta.accent, 0.48);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(snapHalf(cx + sway) - 6, topH, 12, 16);
      drawCachedGlow(ctx, cx + sway, topH + 10, 8, meta.secondaryAccent, 0.36, 1, true);
    }
    ctx.lineWidth = 1;
    return true;
  }

  if (biome === 'brimstone_caldera' || biome === 'phlegethon_rapids' || biome === 'magma_core') {
    // Boiling volcanic horizon fissures & distant lava cascades
    for (let v = 0; v < 4; v++) {
      const vx = ((v * 92 - camX * 0.1) % (VIRTUAL_WIDTH + 50) + VIRTUAL_WIDTH + 50) % (VIRTUAL_WIDTH + 50) - 25;
      const crestY = 62 + (v % 2) * 14;
      ctx.fillStyle = '#0f0404';
      ctx.beginPath();
      ctx.moveTo(vx - 34, VIRTUAL_HEIGHT);
      ctx.lineTo(vx - 6, crestY);
      ctx.lineTo(vx + 8, crestY);
      ctx.lineTo(vx + 38, VIRTUAL_HEIGHT);
      ctx.fill();
      // Caldera crater rim glow
      drawCachedGlow(ctx, vx + 1, crestY, 22, meta.accent, 0.45, 0.6, true);
      // Flowing lava fall inside caldera
      const pulse = Math.floor(t * 12 + v) % 4;
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.72);
      ctx.fillRect(snapHalf(vx - 2), crestY + 2, 4, 110);
      ctx.fillStyle = meta.secondaryAccent;
      ctx.fillRect(snapHalf(vx - 1), crestY + 4 + pulse * 4, 2, 10);
      ctx.fillStyle = 'rgba(255,255,230,0.65)';
      ctx.fillRect(snapHalf(vx - 0.5), crestY + 4 + ((pulse * 7) % 18), 1, 5);
    }
    return true;
  }

  if (biome === 'blood_aqueduct' || biome === 'hellglass_cathedral') {
    // Tall gothic pointed arches & crimson cascades / shattered rose window
    const rx = 160 - ((camX * 0.04) % 30);
    drawCachedGlow(ctx, rx, 46, 38, meta.accent, 0.34);
    ctx.strokeStyle = colorWithAlpha(meta.accent, 0.42);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rx, 46, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = colorWithAlpha(meta.secondaryAccent, 0.38);
    ctx.lineWidth = 0.75;
    for (let i = 0; i < 8; i++) {
      const a = t * 0.15 + (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(rx, 46);
      ctx.lineTo(rx + Math.cos(a) * 25, 46 + Math.sin(a) * 25);
      ctx.stroke();
    }
    drawMicroSparkle(ctx, rx, 46, 4, '#ffffff', 0.7);
    ctx.lineWidth = 1;
    for (let a = 0; a < 5; a++) {
      const ax = ((a * 76 - camX * 0.14) % (VIRTUAL_WIDTH + 40) + VIRTUAL_WIDTH + 40) % (VIRTUAL_WIDTH + 40) - 20;
      ctx.fillStyle = meta.mountainMid;
      ctx.fillRect(snapHalf(ax), 58, 12, VIRTUAL_HEIGHT - 58);
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.45);
      ctx.fillRect(snapHalf(ax + 4), 76, 4, VIRTUAL_HEIGHT - 76);
      ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.35);
      ctx.fillRect(snapHalf(ax + 5.5), 78, 1, VIRTUAL_HEIGHT - 78);
    }
    return true;
  }

  if (biome === 'cocytus_trench' || biome === 'acheron_gorge') {
    // Vertical crystalline ice spires + shimmering subzero aurora ribbons
    for (let x = 0; x < VIRTUAL_WIDTH; x += 3) {
      const wave = Math.sin(x * 0.035 + t * 1.4) * 9 + Math.cos(x * 0.018 - t * 0.9) * 5;
      const ay = 30 + wave;
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.16);
      ctx.fillRect(x, snapHalf(ay), 3, 16);
      ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.22);
      ctx.fillRect(x, snapHalf(ay + 4), 2.5, 5);
      if (x % 9 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(x, snapHalf(ay + 1), 0.5, 11);
      }
    }
    for (let i = 0; i < 7; i++) {
      const sx = ((i * 54 - camX * 0.15) % (VIRTUAL_WIDTH + 30) + VIRTUAL_WIDTH + 30) % (VIRTUAL_WIDTH + 30) - 15;
      const sh = 50 + (i % 3) * 22;
      ctx.fillStyle = meta.mountainNear;
      ctx.beginPath();
      ctx.moveTo(sx - 12, VIRTUAL_HEIGHT);
      ctx.lineTo(sx, VIRTUAL_HEIGHT - sh);
      ctx.lineTo(sx + 12, VIRTUAL_HEIGHT);
      ctx.fill();
      ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.36);
      ctx.fillRect(snapHalf(sx - 0.5), VIRTUAL_HEIGHT - sh + 4, 1.5, sh - 8);
      drawMicroSparkle(ctx, sx, VIRTUAL_HEIGHT - sh + 1, 2, '#e0f7ff', 0.65);
    }
    return true;
  }

  if (biome === 'pandemonium_citadel' || biome === 'void_gate') {
    // Fractured Black Sun Eclipse + floating abyssal obelisks
    const sx = 160;
    const sy = 42;
    drawCachedGlow(ctx, sx, sy, 52 + Math.sin(t * 2.4) * 3, meta.accent, 0.45);
    drawCachedGlow(ctx, sx, sy, 32, meta.secondaryAccent, 0.55);
    ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.65);
    ctx.beginPath();
    ctx.arc(sx, sy, 22.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#050208';
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, Math.PI * 2);
    ctx.fill();

    // Solar eclipse flare spikes & inner crisp corona ring
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, 20.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let r = 0; r < 12; r++) {
      const a = t * 0.35 + (r * Math.PI * 2) / 12;
      const len = 28 + Math.sin(t * 4 + r) * 6;
      ctx.strokeStyle = colorWithAlpha(r % 2 === 0 ? meta.secondaryAccent : meta.accent, 0.48);
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 20.5, sy + Math.sin(a) * 20.5);
      ctx.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      ctx.stroke();
    }
    return true;
  }

  // Remaining Underworld Biomes (bone_ossuary, wailing_spires, pestilence_marsh, ash_necropolis, obsidian_labyrinth)
  for (let i = 0; i < 6; i++) {
    const ox = ((i * 62 - camX * 0.14) % (VIRTUAL_WIDTH + 32) + VIRTUAL_WIDTH + 32) % (VIRTUAL_WIDTH + 32) - 16;
    const bob = Math.sin(t * 1.8 + i) * 3;
    const h = 42 + (i % 3) * 18;
    const sx = snapHalf(ox);
    const topY = snapHalf(VIRTUAL_HEIGHT - h - bob);
    ctx.fillStyle = meta.mountainNear;
    ctx.fillRect(sx, topY, 11, h + bob);
    ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.25);
    ctx.fillRect(sx, topY, 1, h + bob);
    drawCachedGlow(ctx, sx + 5, topY + 6, 9, meta.accent, 0.32, 1, true);
    ctx.fillStyle = colorWithAlpha(meta.accent, 0.55);
    ctx.fillRect(sx + 3, topY + 4, 4, 4);
    ctx.fillRect(sx + 4, topY + 12, 2, 16);
  }
  return true;
}

export function drawUnderworldForegroundWeather(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  meta: BiomeMeta
): void {
  const biome = engine.currentRoom.biome;
  if (!isUnderworldBiome(biome)) return;
  const t = engine.elapsedSeconds;

  // Rising embers / souls / snow / spores across foreground with subtle additive glow
  const rising =
    biome === 'brimstone_caldera' ||
    biome === 'phlegethon_rapids' ||
    biome === 'magma_core' ||
    biome === 'pandemonium_citadel' ||
    biome === 'styx_ferry' ||
    biome === 'brass_tartarus';

  for (let i = 0; i < 24; i++) {
    const px = ((i * 41 + Math.sin(t * 1.5 + i) * 12 + (rising ? 0 : t * 18)) % VIRTUAL_WIDTH + VIRTUAL_WIDTH) % VIRTUAL_WIDTH;
    const rawY = t * (20 + (i % 4) * 6) + i * 19;
    const py = rising
      ? VIRTUAL_HEIGHT - (rawY % VIRTUAL_HEIGHT)
      : rawY % VIRTUAL_HEIGHT;
    const col = i % 3 === 0 ? meta.secondaryAccent : meta.accent;
    const sx = snapHalf(px);
    const sy = snapHalf(py);
    if (i % 4 === 0) {
      drawCachedGlow(ctx, sx + 0.5, sy + 0.5, 5, col, 0.35, 1, true);
      ctx.fillStyle = '#ffffffcc';
      ctx.fillRect(sx, sy, 1, 1);
    } else {
      ctx.fillStyle = colorWithAlpha(col, 0.65);
      ctx.fillRect(sx, sy, 1, 1);
    }
  }
}

