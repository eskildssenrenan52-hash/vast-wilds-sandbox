// @ts-nocheck
import { BiomeId, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './types';
import { colorWithAlpha, drawCachedGlow, drawMicroSparkle, snapHalf } from './visualFx';
import { BiomeMeta } from './worldData';

function mod(n: number, len: number): number {
  return ((Math.floor(n) % len) + len) % len;
}

export function drawNewBiomeSpectacle(
  ctx: CanvasRenderingContext2D,
  biome: BiomeId,
  meta: BiomeMeta,
  gx: number,
  _gy: number,
  pSky: number,
  pSkyY: number,
  pFar: number,
  pFarY: number,
  time: number
): boolean {
  switch (biome) {
    case 'coral_abyss': {
      // Shimmering ocean surface caustics + volumetric light shafts
      for (let i = 0; i < 7; i++) {
        const rx = mod(18 + i * 48 - pSky + Math.sin(time * 0.9 + i) * 8, VIRTUAL_WIDTH);
        const g = ctx.createLinearGradient(rx, 0, rx + 24, 165);
        g.addColorStop(0, '#7cf9ff44');
        g.addColorStop(0.5, '#ff7eb61e');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx + 18, 0);
        ctx.lineTo(rx + 42, 165);
        ctx.lineTo(rx + 10, 165);
        ctx.closePath();
        ctx.fill();
      }
      // Abyssal whale silhouette + glowing markings & escort fish
      const wx = mod(Math.round(time * 11 - pFar), VIRTUAL_WIDTH + 110) - 55;
      const wy = 44 + Math.round(Math.sin(time * 0.9) * 6);
      ctx.fillStyle = '#031729cc';
      ctx.fillRect(wx, wy, 40, 11);
      ctx.fillRect(wx + 8, wy - 4, 20, 4);
      ctx.fillRect(wx - 9, wy + 2, 10, 5);
      ctx.fillRect(wx - 14, wy - 2 + Math.round(Math.sin(time * 3) * 2), 7, 4);
      ctx.fillStyle = '#38f8ffaa';
      ctx.fillRect(wx + 31, wy + 4, 2, 2);
      ctx.fillRect(wx + 12, wy + 6, 10, 1);
      // School of glowing reef fish darting in parallax
      for (let f = 0; f < 10; f++) {
        const fx = mod(Math.round(time * (20 + (f % 3) * 5) + f * 31 - pFar * 1.1), VIRTUAL_WIDTH + 20) - 10;
        const fy = 66 + (f % 4) * 14 + Math.round(Math.sin(time * 3.5 + f) * 3);
        ctx.fillStyle = f % 2 === 0 ? '#ff7eb6bb' : '#7cf9ffbb';
        ctx.fillRect(fx, fy, 4, 2);
        ctx.fillRect(fx - 2, fy + 1, 2, 1);
      }
      // Giant swaying sea-fans & bioluminescent coral stalks
      for (let i = 0; i < 9; i++) {
        const cx = mod(i * 39 - pFar, VIRTUAL_WIDTH + 20) - 10;
        const sway = Math.round(Math.sin(time * 2.1 + i) * 2);
        const h = 38 + (i % 3) * 16;
        ctx.fillStyle = meta.mountainFar;
        ctx.fillRect(cx, VIRTUAL_HEIGHT - h, 6, h);
        ctx.fillRect(cx - 6 + sway, VIRTUAL_HEIGHT - h - 7, 18, 7);
        ctx.fillStyle = i % 2 === 0 ? '#ff7eb688' : '#38f8ff77';
        ctx.fillRect(cx - 5 + sway, VIRTUAL_HEIGHT - h - 8, 16, 2);
        ctx.fillRect(cx + 1 + sway, VIRTUAL_HEIGHT - h + 8, 3, 2);
      }
      return true;
    }
    case 'ember_steppe': {
      // Blazing soot clouds + glowing horizon magma horizon band
      ctx.fillStyle = '#ff541222';
      ctx.fillRect(0, 118, VIRTUAL_WIDTH, 62);
      // Distant erupting volcano calderas with lava cascades & ash plumes
      for (let v = 0; v < 2; v++) {
        const vx = mod(75 + v * 165 - pFar, VIRTUAL_WIDTH + 90) - 45;
        ctx.fillStyle = '#290a05';
        for (let row = 0; row < 30; row++) {
          ctx.fillRect(vx - 12 - row * 1.4, 70 + row * 3, 24 + row * 2.8, 3);
        }
        // Flowing molten lava stream down volcano flank
        const lFlow = Math.floor(time * 18 + v * 5) % 8;
        ctx.fillStyle = '#ff6b2baa';
        for (let lr = 0; lr < 20; lr++) {
          ctx.fillRect(vx - 3 + Math.round(Math.sin(lr * 0.6 + v) * 4), 72 + lr * 4, 4, 4);
        }
        ctx.fillStyle = '#fde047cc';
        for (let lr = lFlow; lr < 76; lr += 12) {
          ctx.fillRect(vx - 2 + Math.round(Math.sin(lr * 0.15 + v) * 3), 73 + lr, 2, 4);
        }
        ctx.fillStyle = '#ff6b2b';
        ctx.fillRect(vx - 9, 68, 18, 4);
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(vx - 5, 65, 10, 4);
        // Volumetric smoke puffs + flying pyroclastic bombs
        for (let s = 0; s < 7; s++) {
          const prog = (time * 0.35 + s * 0.15 + v * 0.4) % 1;
          const sy = Math.round(66 - prog * 62);
          const sx = vx - 5 + Math.round(Math.sin(time * 1.8 + s) * (4 + prog * 8));
          ctx.fillStyle = prog < 0.35 ? '#ff7b2977' : '#3a1a1488';
          ctx.fillRect(sx, sy, Math.max(3, Math.round(12 - prog * 6)), 4);
        }
        // Flying lava cinders arcing out
        for (let b = 0; b < 4; b++) {
          const arc = (time * 0.9 + b * 0.25 + v * 0.5) % 1;
          const bx = Math.round(vx + (b % 2 === 0 ? 1 : -1) * arc * 34);
          const by = Math.round(66 - Math.sin(arc * Math.PI) * 26);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(bx, by, 2, 2);
        }
      }
      return true;
    }
    case 'jade_bamboo': {
      // Soft emerald sun disk + mist waterfall + towering swaying bamboo forest & fireflies
      const sx = 232 - Math.round(pSky * 0.3);
      drawCachedGlow(ctx, sx, 36, 48, '#4ade80', 0.36);
      drawCachedGlow(ctx, sx, 36, 20, '#d9f99d', 0.52, 1, true);
      ctx.fillStyle = '#ecfccbdd';
      ctx.beginPath();
      ctx.arc(sx, 36, 8, 0, Math.PI * 2);
      ctx.fill();

      // Far misty emerald waterfall
      const wfx = mod(110 - pFar, VIRTUAL_WIDTH);
      ctx.fillStyle = '#a7f3d044';
      ctx.fillRect(wfx, 56, 12, 124);
      const fStep = Math.floor(time * 24) % 10;
      ctx.fillStyle = '#ffffff66';
      for (let y = 58 + fStep; y < VIRTUAL_HEIGHT; y += 10) {
        ctx.fillRect(wfx + 3, y, 2, 5);
        ctx.fillRect(wfx + 8, (y + 5) % VIRTUAL_HEIGHT, 2, 4);
      }

      // 2-depth swaying bamboo stalks + rustling leaves + drifting fireflies
      for (let i = 0; i < 18; i++) {
        const bx = mod(i * 19 - pFar, VIRTUAL_WIDTH + 20) - 10;
        const sway = Math.round(Math.sin(time * 1.7 + i * 0.7) * 1.8);
        ctx.fillStyle = i % 2 === 0 ? '#0c2e1f' : '#144730';
        ctx.fillRect(bx + sway, 18, 3, VIRTUAL_HEIGHT - 18);
        ctx.fillStyle = '#4ade8055';
        for (let seg = 28; seg < 150; seg += 16) {
          ctx.fillRect(bx + sway - 1, seg, 5, 1);
        }
        if (i % 2 === 0) {
          ctx.fillStyle = '#80ffc44c';
          ctx.fillRect(bx + sway - 6, 36 + (i % 4) * 14, 14, 3);
          ctx.fillRect(bx + sway - 3, 40 + (i % 4) * 14, 8, 2);
        }
      }
      // Flying cranes across bamboo mist
      for (let c = 0; c < 2; c++) {
        const cx = mod(Math.round(time * 16 + c * 150 - pFar), VIRTUAL_WIDTH + 30) - 15;
        const cy = 28 + c * 14 + Math.round(Math.sin(time * 3 + c) * 2);
        const wing = Math.sin(time * 8 + c) > 0 ? -1 : 1;
        ctx.fillStyle = '#ecfccbdd';
        ctx.fillRect(cx, cy, 4, 1);
        ctx.fillRect(cx - 2, cy + wing, 2, 1);
        ctx.fillRect(cx + 4, cy + wing, 2, 1);
      }
      return true;
    }
    case 'glacial_fjord': {
      // Multi-ribbon shimmer aurora + diamond prism ring + floating icebergs
      for (let x = 0; x < VIRTUAL_WIDTH; x += 2) {
        const ax = x + pSky;
        const ay = 12 + Math.round(Math.sin(ax * 0.025 + time * 1.4) * 9);
        ctx.fillStyle = '#38bdf84c';
        ctx.fillRect(x, ay, 2, 26);
        ctx.fillStyle = '#34d39944';
        ctx.fillRect(x, ay + 6, 2, 14);
        ctx.fillStyle = '#c084fc2c';
        ctx.fillRect(x, ay - 3, 2, 8);
        if (x % 6 === 0) {
          ctx.fillStyle = '#ffffff38';
          ctx.fillRect(x, ay + 1, 1, 18);
        }
      }
      // Faceted glacier peaks with cyan ice gleam
      for (let p = 0; p < 5; p++) {
        const fx = mod(24 + p * 72 - pFar, VIRTUAL_WIDTH + 60) - 30;
        ctx.fillStyle = '#0e2849';
        for (let r = 0; r < 26; r++) {
          ctx.fillRect(fx - r, 54 + r * 3, 2 + r * 2, 3);
        }
        ctx.fillStyle = '#7dd3fc55';
        for (let r = 0; r < 18; r++) {
          ctx.fillRect(fx, 54 + r * 3, Math.max(2, r), 3);
        }
        ctx.fillStyle = '#e0f2fe88';
        ctx.fillRect(fx - 2, 54, 5, 10);
      }
      // Reflective glacial fjord water line
      ctx.fillStyle = '#38bdf822';
      ctx.fillRect(0, 126, VIRTUAL_WIDTH, 54);
      ctx.fillStyle = '#bae6fd44';
      ctx.fillRect(0, 126, VIRTUAL_WIDTH, 1);
      return true;
    }
    case 'rust_foundry': {
      // Giant interlocking gears, vertical pistons, furnace vents & smoke
      for (let g = 0; g < 4; g++) {
        const cx = mod(42 + g * 88 - pFar, VIRTUAL_WIDTH + 60) - 30;
        const cy = 56 + (g % 2) * 24;
        const rad = 20 + (g % 2) * 7;
        ctx.strokeStyle = '#f59e0b44';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#fb923c33';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(6, rad - 8), 0, Math.PI * 2);
        ctx.stroke();
        for (let k = 0; k < 12; k++) {
          const a = time * (g % 2 === 0 ? 0.55 : -0.45) + (k * Math.PI * 2) / 12;
          ctx.fillStyle = '#f59e0b55';
          ctx.fillRect(Math.round(cx + Math.cos(a) * (rad + 4)) - 2, Math.round(cy + Math.sin(a) * (rad + 4)) - 2, 4, 4);
        }
      }
      for (let s = 0; s < 5; s++) {
        const sx = mod(26 + s * 68 - pFar, VIRTUAL_WIDTH + 20) - 10;
        ctx.fillStyle = '#1c110b';
        ctx.fillRect(sx, 46, 11, 96);
        const pump = Math.round(Math.sin(time * 2.5 + s) * 6);
        ctx.fillStyle = '#f59e0b66';
        ctx.fillRect(sx - 1, 46 + pump, 13, 3);
        // Rising coal smoke puffs
        for (let sp = 0; sp < 4; sp++) {
          const sy = mod(44 - Math.round(time * 16 + sp * 12), 44);
          ctx.fillStyle = '#47302666';
          ctx.fillRect(sx + 2 + Math.round(Math.sin(time + sp) * 4), sy, 7, 4);
        }
      }
      return true;
    }
    case 'fungal_myriad': {
      // Glowing cathedral spore caps, hanging mycelium tendrils & drifting spore jellyfish
      for (let m = 0; m < 6; m++) {
        const mx = mod(26 + m * 58 - pFar, VIRTUAL_WIDTH + 40) - 20;
        const my = 62 + (m % 2) * 18;
        ctx.fillStyle = '#220b3b';
        ctx.fillRect(mx - 4, my, 8, VIRTUAL_HEIGHT - my);
        ctx.fillStyle = '#4d2b7a';
        ctx.fillRect(mx - 22, my - 10, 44, 12);
        ctx.fillRect(mx - 15, my - 17, 30, 7);
        const pulse = Math.sin(time * 2.6 + m) > 0;
        ctx.fillStyle = pulse ? '#e879f9cc' : '#34d39999';
        ctx.fillRect(mx - 14, my - 8, 5, 3);
        ctx.fillRect(mx + 6, my - 12, 4, 3);
        ctx.fillRect(mx - 2, my - 4, 6, 2);
        // Hanging bioluminescent tendrils
        ctx.fillStyle = '#34d39955';
        ctx.fillRect(mx - 14, my + 2, 1, 12);
        ctx.fillRect(mx + 12, my + 2, 1, 15);
      }
      for (let j = 0; j < 4; j++) {
        const jx = mod(40 + j * 82 + Math.round(Math.sin(time + j) * 10) - pFar * 0.8, VIRTUAL_WIDTH);
        const jy = 34 + j * 14 + Math.round(Math.sin(time * 2.2 + j) * 5);
        ctx.fillStyle = '#e879f955';
        ctx.fillRect(jx - 4, jy, 8, 4);
        ctx.fillStyle = '#34d39966';
        ctx.fillRect(jx - 2, jy + 4, 1, 6);
        ctx.fillRect(jx + 1, jy + 4, 1, 5);
      }
      return true;
    }
    case 'storm_archipelago': {
      // Frequent branching storm lightning + sky-islands with waterfalls + arc bolts
      if (Math.sin(time * 2.7) > 0.86 || Math.sin(time * 4.3 + 2) > 0.92) {
        ctx.fillStyle = '#22d3ee2e';
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        const lx = mod(155 - pSky + Math.round(Math.sin(time * 9) * 65), VIRTUAL_WIDTH);
        ctx.fillStyle = '#fff9c4ee';
        ctx.fillRect(lx, 2, 2, 32);
        ctx.fillRect(lx - 6, 34, 7, 2);
        ctx.fillRect(lx - 7, 36, 2, 28);
        ctx.fillRect(lx + 1, 20, 6, 2);
        ctx.fillRect(lx + 6, 22, 2, 18);
      }
      for (let i = 0; i < 5; i++) {
        const ix = mod(22 + i * 72 - pFar, VIRTUAL_WIDTH + 50) - 25;
        const iy = 38 + (i % 2) * 22 + Math.round(Math.sin(time * 1.4 + i) * 3);
        ctx.fillStyle = meta.mountainMid;
        ctx.fillRect(ix, iy, 36, 8);
        ctx.fillRect(ix + 6, iy + 8, 24, 7);
        ctx.fillRect(ix + 12, iy + 15, 12, 6);
        ctx.fillStyle = '#38bdf877';
        ctx.fillRect(ix + 25, iy + 1, 4, 48);
        const drop = Math.floor(time * 26 + i * 7) % 12;
        ctx.fillStyle = '#ffffff88';
        ctx.fillRect(ix + 26, iy + 4 + drop, 2, 6);
      }
      return true;
    }
    case 'obsidian_temple': {
      // Turquoise eclipse sun + terraced golden ziggurats + flickering braziers
      const sx = 160 - Math.round(pSky * 0.35);
      drawCachedGlow(ctx, sx, 36, 48, '#fbbf24', 0.3);
      drawCachedGlow(ctx, sx, 36, 22, '#14b8a6', 0.55);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(sx, 36, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#040d0f';
      ctx.beginPath();
      ctx.arc(sx, 36, 6.5, 0, Math.PI * 2);
      ctx.fill();
      for (let z = 0; z < 2; z++) {
        const zx = mod(60 + z * 165 - pFar, VIRTUAL_WIDTH + 70) - 35;
        ctx.fillStyle = '#0b2126';
        for (let step = 0; step < 6; step++) {
          ctx.fillRect(zx - 32 + step * 5, 122 - step * 8, 64 - step * 10, 8);
          ctx.fillStyle = '#fbbf2455';
          ctx.fillRect(zx - 32 + step * 5, 122 - step * 8, 64 - step * 10, 1);
          ctx.fillStyle = '#0b2126';
        }
        // Flickering turquoise altar flame at apex
        const fH = 5 + (Math.floor(time * 10 + z) % 3);
        ctx.fillStyle = '#14b8a6cc';
        ctx.fillRect(zx - 2, 74 - fH, 4, fH);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(zx - 1, 75 - fH, 2, 3);
      }
      return true;
    }
    case 'mercury_mire': {
      // Reflective liquid silver basin + shimmering wave bands + rising neon lime bubbles
      ctx.fillStyle = '#cbd5e12c';
      ctx.fillRect(0, 118, VIRTUAL_WIDTH, 62);
      ctx.fillStyle = '#ffffff66';
      ctx.fillRect(0, 118, VIRTUAL_WIDTH, 1);
      for (let w = 0; w < 6; w++) {
        const rx = mod(w * 60 + Math.round(time * 18) - pFar, VIRTUAL_WIDTH);
        ctx.fillStyle = '#e2e8f044';
        ctx.fillRect(rx, 124 + (w % 3) * 6, 22, 1);
      }
      for (let i = 0; i < 8; i++) {
        const vx = mod(i * 42 - pFar, VIRTUAL_WIDTH);
        const rise = Math.round(Math.sin(time * 2.2 + i) * 7);
        ctx.fillStyle = '#a3e6353a';
        ctx.fillRect(vx, 72 + rise, 8, 46);
        ctx.fillStyle = '#bef264aa';
        ctx.fillRect(vx + 3, 66 + rise, 3, 3);
      }
      return true;
    }
    case 'crimson_foundry': {
      // Colossal furnace arches + swinging molten crucibles & dripping spark curtains
      for (let i = 0; i < 3; i++) {
        const ax = mod(45 + i * 110 - pFar, VIRTUAL_WIDTH + 50) - 25;
        ctx.fillStyle = '#24040a';
        ctx.fillRect(ax - 20, 50, 40, 84);
        ctx.fillStyle = '#f43f5e4d';
        ctx.fillRect(ax - 11, 60, 22, 64);
        ctx.fillStyle = '#fde04733';
        ctx.fillRect(ax - 6, 70, 12, 48);
        const swing = Math.round(Math.sin(time * 1.9 + i) * 4);
        ctx.fillStyle = '#fb718599';
        ctx.fillRect(ax + swing - 2, 16, 4, 24);
        ctx.fillStyle = '#fde047aa';
        ctx.fillRect(ax + swing - 7, 40, 14, 8);
        // Dripping molten drop
        const dripY = (Math.floor(time * 28 + i * 15) % 44) + 48;
        ctx.fillStyle = '#fde047';
        ctx.fillRect(ax + swing, dripY, 2, 4);
      }
      return true;
    }
    case 'mirror_labyrinth': {
      // Giant floating crystals + crisscrossing spectral laser reflection beams
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < 5; i++) {
        const dx = mod(32 + i * 66 - pFar, VIRTUAL_WIDTH + 30) - 15;
        const dy = 42 + (i % 2) * 26 + Math.round(Math.sin(time * 1.7 + i) * 5);
        pts.push({ x: dx, y: dy });
        ctx.fillStyle = i % 2 === 0 ? '#e879f93d' : '#67e8f93d';
        ctx.fillRect(dx - 8, dy - 15, 16, 30);
        ctx.fillStyle = '#ffffff77';
        ctx.fillRect(dx - 2, dy - 11, 4, 22);
        ctx.fillRect(dx - 6, dy - 2, 12, 4);
      }
      ctx.strokeStyle = '#e879f955';
      for (let i = 0; i < pts.length - 1; i++) {
        if (Math.abs(pts[i].x - pts[i + 1].x) < 120) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
          ctx.stroke();
        }
      }
      return true;
    }
    case 'hourglass_desert': {
      // Rotating astrolabe halo + colossal celestial hourglass + golden sand stream
      const hx = 160 - Math.round(pSky * 0.4);
      const hy = 40 - Math.round(pSkyY * 0.3);
      ctx.strokeStyle = '#fde04744';
      ctx.beginPath();
      ctx.arc(hx, hy, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx - 15, hy - 19);
      ctx.lineTo(hx + 15, hy - 19);
      ctx.lineTo(hx - 15, hy + 19);
      ctx.lineTo(hx + 15, hy + 19);
      ctx.closePath();
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let s = 0; s < 5; s++) {
        const sandY = (Math.floor(time * 24) + s * 4) % 18;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(hx, hy + sandY, 1, 2);
      }
      ctx.fillStyle = '#fbbf2466';
      ctx.fillRect(hx - 9, hy + 13, 18, 5);
      return true;
    }
    case 'velvet_opera': {
      // Sweeping stage spotlights + draped curtains + multi-tier crystal chandeliers
      for (let sp = 0; sp < 2; sp++) {
        const sx = 64 + sp * 192;
        const sweep = Math.round(Math.sin(time * 1.2 + sp * 2) * 42);
        const grad = ctx.createLinearGradient(sx, 0, sx + sweep, 170);
        grad.addColorStop(0, '#ffd24d44');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(sx - 4, 0);
        ctx.lineTo(sx + 4, 0);
        ctx.lineTo(sx + sweep + 26, 175);
        ctx.lineTo(sx + sweep - 26, 175);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#591448bb';
      ctx.fillRect(0, 0, 22, 72);
      ctx.fillRect(VIRTUAL_WIDTH - 22, 0, 22, 72);
      ctx.fillStyle = '#ffd24d77';
      ctx.fillRect(20, 0, 2, 72);
      ctx.fillRect(VIRTUAL_WIDTH - 22, 0, 2, 72);
      for (let c = 0; c < 3; c++) {
        const cx = mod(58 + c * 102 - pFar, VIRTUAL_WIDTH);
        ctx.fillStyle = '#ffd24d99';
        ctx.fillRect(cx - 11, 20, 22, 2);
        ctx.fillRect(cx - 7, 26, 14, 2);
        ctx.fillStyle = '#ffffffdd';
        ctx.fillRect(cx - 9, 17, 2, 3);
        ctx.fillRect(cx, 14, 2, 6);
        ctx.fillRect(cx + 8, 17, 2, 3);
      }
      return true;
    }
    case 'bone_catacombs': {
      // Towering ribcage arches + glowing soul wisps + flickering skull lanterns
      for (let i = 0; i < 4; i++) {
        const rx = mod(38 + i * 82 - pFar, VIRTUAL_WIDTH + 40) - 20;
        ctx.fillStyle = '#cbd5e138';
        ctx.fillRect(rx - 15, 18, 4, 98);
        ctx.fillRect(rx + 11, 18, 4, 98);
        ctx.fillRect(rx - 13, 13, 26, 5);
        ctx.fillRect(rx - 9, 34, 18, 3);
        ctx.fillStyle = '#2dd4bfaa';
        const wy = 48 + Math.round(Math.sin(time * 2.5 + i) * 10);
        ctx.fillRect(rx - 1, wy, 3, 3);
        ctx.fillStyle = '#ffffffcc';
        ctx.fillRect(rx, wy + 1, 1, 1);
      }
      return true;
    }
    case 'cloud_monastery': {
      // Sunlit golden cloud sea + distant tiered monastery + fluttering prayer flags
      ctx.fillStyle = '#fef9c330';
      ctx.fillRect(0, 112, VIRTUAL_WIDTH, 24);
      ctx.fillStyle = '#fde04738';
      ctx.fillRect(0, 112, VIRTUAL_WIDTH, 2);
      for (let i = 0; i < 4; i++) {
        const tx = mod(42 + i * 86 - pFar, VIRTUAL_WIDTH + 40) - 20;
        ctx.fillStyle = '#1f4e7a';
        ctx.fillRect(tx - 11, 56, 22, 58);
        ctx.fillStyle = '#fde04799';
        ctx.fillRect(tx - 16, 52, 32, 4);
        ctx.fillRect(tx - 1, 38, 2, 14);
        // Fluttering prayer flags between temples
        for (let f = 0; f < 5; f++) {
          const wave = Math.round(Math.sin(time * 4 + f + i) * 1.5);
          ctx.fillStyle = f % 2 === 0 ? '#f43f5eaa' : '#38bdf8aa';
          ctx.fillRect(tx + 14 + f * 9, 64 + wave, 5, 4);
        }
      }
      return true;
    }
    case 'cyber_grid': {
      // Striped retro-synthwave sun + animated horizon neon equalizer + perspective grid + flying jets
      const sx = 160 - Math.round(pSky * 0.25);
      const sy = 56;
      for (let dy = -22; dy <= 22; dy++) {
        if (dy > 2 && dy % 4 === 0) continue;
        const w = Math.round(Math.sqrt(484 - dy * dy));
        ctx.fillStyle = dy < -4 ? '#fde047' : dy < 6 ? '#fb7185' : '#ff2a85';
        ctx.fillRect(sx - w, sy + dy, w * 2, 1);
      }
      // Audio-reactive synthwave equalizer bars along horizon
      for (let ex = 8; ex < VIRTUAL_WIDTH; ex += 8) {
        const barH = 4 + Math.round(Math.abs(Math.sin(time * 4.5 + ex * 0.11)) * 16);
        ctx.fillStyle = ex % 16 === 0 ? '#00f5d44c' : '#ff2a8544';
        ctx.fillRect(ex, 108 - barH, 5, barH);
      }
      ctx.fillStyle = '#00f5d455';
      for (let gy = 108; gy < VIRTUAL_HEIGHT; gy += 9) {
        ctx.fillRect(0, gy, VIRTUAL_WIDTH, 1);
      }
      for (let gxLine = -6; gxLine <= 6; gxLine++) {
        const topX = 160 + gxLine * 22 - (pFar % 22);
        const botX = 160 + gxLine * 54 - (pFar % 22) * 2;
        ctx.strokeStyle = '#ff2a853c';
        ctx.beginPath();
        ctx.moveTo(topX, 108);
        ctx.lineTo(botX, VIRTUAL_HEIGHT);
        ctx.stroke();
      }
      return true;
    }
    case 'amber_hive': {
      // Golden hexagonal honeycomb + dripping glowing honey strands + darting golden bees
      ctx.strokeStyle = '#f59e0b36';
      for (let hy = 10; hy < 132; hy += 18) {
        for (let hx = 8; hx < VIRTUAL_WIDTH; hx += 22) {
          const ox = hx + ((hy / 18) % 2 ? 11 : 0) - (pSky % 22);
          ctx.strokeRect(ox, hy, 14, 12);
          if ((hx + hy) % 5 === 0) {
            ctx.fillStyle = '#fbbf2418';
            ctx.fillRect(ox + 2, hy + 2, 10, 8);
          }
        }
      }
      for (let b = 0; b < 8; b++) {
        const bx = mod(Math.round(time * (28 + b * 4) + b * 40 - pFar), VIRTUAL_WIDTH);
        const by = 34 + (b % 4) * 22 + Math.round(Math.sin(time * 6 + b) * 4);
        ctx.fillStyle = '#fde047cc';
        ctx.fillRect(bx, by, 3, 2);
        ctx.fillStyle = '#ffffffaa';
        ctx.fillRect(bx + 1, by - 1, 1, 1);
      }
      return true;
    }
    case 'astral_library': {
      // Infinite receding bookshelves + floating glowing tomes + turning pages
      for (let i = 0; i < 5; i++) {
        const bx = mod(24 + i * 66 - pFar, VIRTUAL_WIDTH + 30) - 15;
        ctx.fillStyle = '#0b0d29';
        ctx.fillRect(bx, 18, 24, 128);
        for (let row = 26; row < 134; row += 11) {
          ctx.fillStyle = (row + i) % 22 === 0 ? '#fbbf2477' : '#818cf84c';
          ctx.fillRect(bx + 2, row, 20, 2);
        }
        const by = 40 + Math.round(Math.sin(time * 2 + i) * 7);
        ctx.fillStyle = '#e0e7ffdd';
        ctx.fillRect(bx + 28, by, 8, 5);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(bx + 31, by, 2, 5);
        ctx.fillStyle = '#818cf888';
        ctx.fillRect(bx + 27, by + 6, 10, 1);
      }
      return true;
    }
    case 'magnetic_rift': {
      // Levitating monolith slabs + crackling cyan/violet lightning + orbiting shards
      for (let i = 0; i < 4; i++) {
        const mx = mod(36 + i * 82 - pFar, VIRTUAL_WIDTH + 30) - 15;
        const my = 38 + (i % 2) * 18 + Math.round(Math.sin(time * 2.2 + i) * 4);
        ctx.fillStyle = '#2a0d4f';
        ctx.fillRect(mx, my, 12, 30);
        ctx.fillStyle = '#a855f7bb';
        ctx.fillRect(mx + 2, my + 2, 8, 2);
        ctx.fillRect(mx + 4, my + 12, 4, 6);
        if (Math.floor(time * 9 + i) % 2 === 0) {
          ctx.strokeStyle = '#22d3ee99';
          ctx.beginPath();
          ctx.moveTo(mx + 12, my + 12);
          ctx.lineTo(mx + 28, my + 6 + ((Math.floor(time * 15) + i) % 5));
          ctx.lineTo(mx + 44, my + 8);
          ctx.stroke();
        }
      }
      return true;
    }
    case 'prism_sanctum': {
      // 7-band spectral rainbow arches + rotating floating crystal prisms
      const colors = ['#f43f5e3c', '#fb923c3c', '#fde0473c', '#4ade803c', '#38bdf83c', '#818cf83c', '#e879f93c'];
      const cx = 160 - Math.round(pSky * 0.3);
      for (let c = 0; c < colors.length; c++) {
        ctx.strokeStyle = colors[c];
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, 125, 66 + c * 5, Math.PI, 0);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        const px = mod(38 + k * 64 - pFar, VIRTUAL_WIDTH);
        const py = 46 + (k % 2) * 20 + Math.round(Math.sin(time * 2 + k) * 4);
        ctx.fillStyle = colors[k % colors.length].replace('3c', 'aa');
        ctx.fillRect(px - 3, py - 6, 6, 12);
        ctx.fillStyle = '#ffffffcc';
        ctx.fillRect(px - 1, py - 4, 2, 8);
      }
      return true;
    }
    case 'void_nebula': {
      // Swirling dual-ribbon cosmic nebula + glowing vortex eye + drifting asteroids
      for (let x = 0; x < VIRTUAL_WIDTH; x += 3) {
        const y = 34 + Math.round(Math.sin((x + pSky) * 0.03 + time * 0.7) * 16);
        ctx.fillStyle = x % 6 === 0 ? '#c084fc36' : '#f472b62a';
        ctx.fillRect(x, y, 3, 24);
      }
      for (let a = 0; a < 6; a++) {
        const ax = mod(25 + a * 58 - pFar + Math.round(time * 7), VIRTUAL_WIDTH);
        const ay = 28 + (a % 3) * 22 + Math.round(Math.sin(time + a) * 3);
        ctx.fillStyle = '#2b0f5e';
        ctx.fillRect(ax, ay, 9, 6);
        ctx.fillStyle = '#d8b4fe77';
        ctx.fillRect(ax + 1, ay, 6, 1);
      }
      return true;
    }
    case 'solar_corona': {
      // Blazing huge solar limb + pulsing plasma loops + orbiting silhouetted planets
      const sx = 160 - Math.round(pSky * 0.35);
      const sy = 50;
      drawCachedGlow(ctx, sx, sy, 62, '#f97316', 0.36);
      drawCachedGlow(ctx, sx, sy, 34, '#fde047', 0.65, 1, true);
      ctx.strokeStyle = '#fde04788';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx - 24, sy, 14 + Math.sin(time * 3) * 3, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx + 24, sy, 14 + Math.cos(time * 3) * 3, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
      ctx.lineWidth = 1;
      // Orbiting dark planets silhouetted across the corona
      for (let p = 0; p < 2; p++) {
        const ox = Math.round(sx + Math.cos(time * (0.7 + p * 0.4) + p * 2) * (34 + p * 14));
        const oy = Math.round(sy + Math.sin(time * (0.7 + p * 0.4) + p * 2) * 10);
        ctx.fillStyle = '#240c02';
        ctx.fillRect(ox - 2, oy - 2, 4 + p, 4 + p);
      }
      return true;
    }
    case 'lunar_bastion': {
      // Giant ringed homeworld + laser grid + twinkling lunar citadel spires
      const px = 210 - gx * 3 - Math.round(pSky * 0.3);
      const py = 36;
      drawCachedGlow(ctx, px, py, 42, '#7dd3fc', 0.44, 1, true);
      ctx.fillStyle = '#38bdf877';
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0cc';
      ctx.beginPath();
      ctx.arc(px, py, 14, Math.PI * 0.5, Math.PI * 1.5);
      ctx.fill();
      ctx.strokeStyle = '#f8fafc99';
      ctx.beginPath();
      ctx.ellipse(px, py, 26, 7, -0.25, 0, Math.PI * 2);
      ctx.stroke();
      return true;
    }
    case 'chrono_paradox': {
      // Broken rotating celestial clock + concentric orbital rings + Roman ticks
      const cx = 160 - Math.round(pSky * 0.3);
      const cy = 48;
      ctx.strokeStyle = '#22d3ee77';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0.2, Math.PI * 1.85);
      ctx.stroke();
      ctx.strokeStyle = '#fbbf2444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.stroke();
      for (let t = 0; t < 12; t++) {
        const a = (t * Math.PI) / 6;
        ctx.fillStyle = '#22d3eeaa';
        ctx.fillRect(Math.round(cx + Math.cos(a) * 30), Math.round(cy + Math.sin(a) * 30), 2, 2);
      }
      const a1 = time * 1.1;
      const a2 = -time * 2.4;
      ctx.strokeStyle = '#fbbf24cc';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(Math.round(cx + Math.cos(a1) * 26), Math.round(cy + Math.sin(a1) * 26));
      ctx.moveTo(cx, cy);
      ctx.lineTo(Math.round(cx + Math.cos(a2) * 18), Math.round(cy + Math.sin(a2) * 18));
      ctx.stroke();
      return true;
    }
    case 'starlight_harbor': {
      // Sweeping golden lighthouse beam + gliding sky-galleons + starlight water horizon
      ctx.fillStyle = '#1e3a8a38';
      ctx.fillRect(0, 120, VIRTUAL_WIDTH, 60);
      ctx.fillStyle = '#fde04755';
      ctx.fillRect(0, 120, VIRTUAL_WIDTH, 1);
      const beamAng = Math.sin(time * 0.9) * 0.35;
      ctx.save();
      ctx.translate(48, 52);
      ctx.rotate(beamAng);
      const bg = ctx.createLinearGradient(0, 0, 150, 0);
      bg.addColorStop(0, '#fde04777');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(150, -20);
      ctx.lineTo(150, 20);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      for (let s = 0; s < 3; s++) {
        const sx = mod(Math.round(time * (10 + s * 4) + s * 115 - pFar), VIRTUAL_WIDTH + 60) - 30;
        const sy = 40 + s * 18 + Math.round(Math.sin(time * 1.5 + s) * 2);
        ctx.fillStyle = '#0b1e47';
        ctx.fillRect(sx, sy + 8, 28, 6);
        ctx.fillRect(sx + 6, sy - 6, 13, 12);
        ctx.fillStyle = '#fde047aa';
        ctx.fillRect(sx + 10, sy + 10, 6, 2);
      }
      return true;
    }
    case 'blood_eclipse': {
      // Dramatic black sun + pulsing crimson shockwave ring + scarlet solar flares
      const sx = 160 - Math.round(pSky * 0.3);
      const sy = 42;
      drawCachedGlow(ctx, sx, sy, 54, '#ef4444', 0.55);
      drawCachedGlow(ctx, sx, sy, 28, '#f43f5e', 0.65);
      const pulseR = 20 + ((time * 14) % 28);
      ctx.strokeStyle = '#ef444466';
      ctx.beginPath();
      ctx.arc(sx, sy, pulseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(sx, sy, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0002';
      ctx.beginPath();
      ctx.arc(sx, sy, 11, 0, Math.PI * 2);
      ctx.fill();
      return true;
    }
    case 'crystal_singularity': {
      // Gravitational lensing black hole + spiraling crystal debris + glowing accretion disc
      const cx = 160 - Math.round(pSky * 0.3);
      const cy = 46;
      drawCachedGlow(ctx, cx, cy, 48, '#a855f7', 0.45);
      drawCachedGlow(ctx, cx, cy, 24, '#67e8f9', 0.45);
      ctx.fillStyle = '#030107';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#67e8f9bb';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 36, 10, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      for (let d = 0; d < 8; d++) {
        const a = time * 1.9 + (d * Math.PI) / 4;
        const dx = Math.round(cx + Math.cos(a) * 32);
        const dy = Math.round(cy + Math.sin(a) * 9);
        ctx.fillStyle = d % 2 === 0 ? '#67e8f9' : '#f472b6';
        ctx.fillRect(dx, dy, 2, 2);
      }
      return true;
    }
    case 'seraph_citadel': {
      // Rotating angelic halos + radiant wing silhouettes + rising golden motes
      const cx = 160 - Math.round(pSky * 0.3);
      const cy = 44;
      ctx.fillStyle = '#fde04724';
      ctx.fillRect(cx - 46, cy - 8, 22, 16);
      ctx.fillRect(cx + 24, cy - 8, 22, 16);
      ctx.strokeStyle = '#fde04788';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#f9a8d477';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 35, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 6; k++) {
        const a = time * 0.8 + (k * Math.PI) / 3;
        ctx.fillStyle = '#ffffffdd';
        ctx.fillRect(Math.round(cx + Math.cos(a) * 30) - 1, Math.round(cy + Math.sin(a) * 30) - 1, 3, 3);
      }
      return true;
    }
    case 'abyss_throne': {
      // Diagonal colossal chains + blazing crimson sky fracture + pulsing abyssal sigil
      ctx.strokeStyle = '#f43f5eaa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(106, 0);
      ctx.lineTo(145, 36);
      ctx.lineTo(132, 72);
      ctx.lineTo(170, 112);
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const cx = 40 + i * 76 - (pFar % 76);
        ctx.strokeStyle = '#38152bdd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 28, 120);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      return true;
    }
    case 'eternity_apex': {
      // Grand multi-band prism aurora + convergent mandala + 8 orbiting cosmic stars
      for (let x = 0; x < VIRTUAL_WIDTH; x += 2) {
        const ay = 14 + Math.round(Math.sin((x + pSky) * 0.03 + time * 1.4) * 8);
        ctx.fillStyle = '#ffd27d44';
        ctx.fillRect(x, ay, 2, 16);
        ctx.fillStyle = '#52e5ff40';
        ctx.fillRect(x, ay + 6, 2, 12);
        ctx.fillStyle = '#f472b633';
        ctx.fillRect(x, ay - 3, 2, 8);
      }
      const cx = 160 - Math.round(pSky * 0.25);
      const cy = 44;
      ctx.strokeStyle = '#ffd27d99';
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#52e5ff88';
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 8; k++) {
        const a = time * 1.15 + (k * Math.PI) / 4;
        ctx.fillStyle = k % 2 === 0 ? '#ffd27d' : '#52e5ff';
        ctx.fillRect(Math.round(cx + Math.cos(a) * 29) - 1, Math.round(cy + Math.sin(a) * 29) - 1, 3, 3);
      }
      return true;
    }
    default:
      return false;
  }
}

export function drawNewBiomeForegroundWeather(
  ctx: CanvasRenderingContext2D,
  biome: BiomeId,
  meta: BiomeMeta,
  pFgX: number,
  _pFgY: number,
  time: number
): boolean {
  if (
    biome !== 'coral_abyss' &&
    biome !== 'ember_steppe' &&
    biome !== 'jade_bamboo' &&
    biome !== 'glacial_fjord' &&
    biome !== 'cyber_grid' &&
    biome !== 'eternity_apex' &&
    biome !== 'blood_eclipse' &&
    biome !== 'solar_corona' &&
    biome !== 'prism_sanctum' &&
    biome !== 'hourglass_desert'
  ) {
    const rising =
      biome === 'fungal_myriad' ||
      biome === 'mercury_mire' ||
      biome === 'crimson_foundry' ||
      biome === 'bone_catacombs' ||
      biome === 'magnetic_rift' ||
      biome === 'crystal_singularity' ||
      biome === 'abyss_throne' ||
      biome === 'void_nebula';
    for (let i = 0; i < 26; i++) {
      const px = mod(i * 25 + Math.sin(time * 2 + i) * 7 - pFgX * 0.5, VIRTUAL_WIDTH);
      const py = rising
        ? mod(VIRTUAL_HEIGHT - (time * (18 + (i % 4) * 5) + i * 19), VIRTUAL_HEIGHT)
        : mod(i * 19 + time * (22 + (i % 3) * 6), VIRTUAL_HEIGHT);
      const col = i % 2 === 0 ? meta.accent : meta.secondaryAccent;
      const sx = snapHalf(px);
      const sy = snapHalf(py);
      if (i % 4 === 0) {
        drawCachedGlow(ctx, sx + 0.5, sy + 0.5, 5, col, 0.38, 1, true);
        drawMicroSparkle(ctx, sx + 0.5, sy + 0.5, 1.5, col, 0.7);
      } else {
        ctx.fillStyle = colorWithAlpha(col, 0.72);
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
    return true;
  }

  if (biome === 'coral_abyss') {
    for (let i = 0; i < 24; i++) {
      const bx = snapHalf(mod(i * 23 + Math.sin(time * 2 + i) * 5 - pFgX * 0.5, VIRTUAL_WIDTH));
      const by = snapHalf(mod(VIRTUAL_HEIGHT - (time * (20 + (i % 3) * 6) + i * 19), VIRTUAL_HEIGHT));
      const col = i % 2 === 0 ? '#ff7eb6' : '#38f8ff';
      if (i % 3 === 0) drawCachedGlow(ctx, bx + 0.5, by + 0.5, 5, col, 0.35, 1, true);
      ctx.fillStyle = colorWithAlpha(col, 0.8);
      ctx.fillRect(bx, by, 1.5, 1.5);
    }
  } else if (biome === 'ember_steppe' || biome === 'solar_corona') {
    for (let i = 0; i < 28; i++) {
      const ex = snapHalf(mod(i * 24 + Math.sin(time * 2.5 + i) * 8 - pFgX * 0.5, VIRTUAL_WIDTH));
      const ey = snapHalf(mod(VIRTUAL_HEIGHT - (time * (26 + (i % 4) * 7) + i * 17), VIRTUAL_HEIGHT));
      const col = i % 2 === 0 ? '#fde047' : '#ff7b29';
      if (i % 3 === 0) drawCachedGlow(ctx, ex + 0.5, ey + 0.5, 5, col, 0.45, 1, true);
      ctx.fillStyle = colorWithAlpha(col, 0.88);
      ctx.fillRect(ex, ey, i % 5 === 0 ? 1.5 : 1, i % 5 === 0 ? 1.5 : 1);
    }
  } else if (biome === 'jade_bamboo') {
    for (let i = 0; i < 24; i++) {
      const lx = snapHalf(mod(i * 27 - time * 36 + Math.sin(time * 2 + i) * 6 - pFgX * 0.5, VIRTUAL_WIDTH));
      const ly = snapHalf(mod(i * 17 + time * 24, VIRTUAL_HEIGHT));
      ctx.fillStyle = i % 2 === 0 ? '#4ade80dd' : '#bef264bb';
      ctx.fillRect(lx, ly, 2.5, 1);
    }
  } else if (biome === 'glacial_fjord') {
    ctx.fillStyle = '#e0f2fedd';
    for (let i = 0; i < 32; i++) {
      const sx = snapHalf(mod(i * 21 - time * 55 - pFgX * 0.6, VIRTUAL_WIDTH));
      const sy = snapHalf(mod(i * 17 + time * 52, VIRTUAL_HEIGHT));
      ctx.fillRect(sx, sy, i % 3 === 0 ? 1.5 : 0.5, 1);
    }
  } else if (biome === 'cyber_grid') {
    for (let i = 0; i < 22; i++) {
      const cx = snapHalf(mod(i * 21 - pFgX * 0.5, VIRTUAL_WIDTH));
      const cy = snapHalf(mod(i * 19 + time * 105, VIRTUAL_HEIGHT));
      const col = i % 2 === 0 ? '#00f5d4' : '#ff2a85';
      ctx.fillStyle = colorWithAlpha(col, 0.78);
      ctx.fillRect(cx, cy, 0.5, 5);
    }
  } else if (biome === 'blood_eclipse') {
    for (let i = 0; i < 24; i++) {
      const ax = snapHalf(mod(i * 25 - time * 30 - pFgX * 0.5, VIRTUAL_WIDTH));
      const ay = snapHalf(mod(VIRTUAL_HEIGHT - (time * 22 + i * 19), VIRTUAL_HEIGHT));
      const col = i % 2 === 0 ? '#ef4444' : '#fde047';
      if (i % 4 === 0) drawCachedGlow(ctx, ax + 0.5, ay + 0.5, 5, col, 0.38, 1, true);
      ctx.fillStyle = colorWithAlpha(col, 0.85);
      ctx.fillRect(ax, ay, 1.5, 1.5);
    }
  } else if (biome === 'prism_sanctum' || biome === 'eternity_apex') {
    const prism = ['#ffd27d', '#52e5ff', '#f472b6', '#a855f7', '#ffffff'];
    for (let i = 0; i < 28; i++) {
      const px = snapHalf(mod(i * 23 + Math.sin(time * 2 + i) * 7 - pFgX * 0.5, VIRTUAL_WIDTH));
      const py = snapHalf(mod(VIRTUAL_HEIGHT - (time * (18 + (i % 4) * 5) + i * 19), VIRTUAL_HEIGHT));
      const col = prism[i % prism.length];
      if (i % 4 === 0) drawMicroSparkle(ctx, px + 0.5, py + 0.5, 2, col, 0.78);
      ctx.fillStyle = colorWithAlpha(col, 0.85);
      ctx.fillRect(px, py, 1, 1);
    }
  } else if (biome === 'hourglass_desert') {
    for (let i = 0; i < 26; i++) {
      const sx = snapHalf(mod(i * 25 - time * 64 - pFgX * 0.6, VIRTUAL_WIDTH));
      const sy = snapHalf(mod(i * 19 + Math.sin(time * 3 + i) * 5, VIRTUAL_HEIGHT));
      ctx.fillStyle = '#fef08acc';
      ctx.fillRect(sx, sy, 2, 0.5);
    }
  }
  return true;
}
