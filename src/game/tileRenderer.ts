// @ts-nocheck -- imported game code, written for a looser TS config
import type { GameEngine } from './engine';
import { isTileValueSolid } from './physics';
import { RoomDef, TILE_SIZE, TileType, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './types';
import { BiomeMeta } from './worldData';
import { getAnyBiomeMeta } from './worldDataUnderworld';
import { colorWithAlpha, drawMicroSparkle, mixHexColors, snapHalf } from './visualFx';

function getRoomTile(room: RoomDef, tx: number, ty: number): number {
  if (tx < 0 || tx >= room.cols || ty < 0 || ty >= room.rows) return TileType.SOLID;
  return room.tiles[ty * room.cols + tx];
}

function isAirTile(room: RoomDef, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= room.cols || ty >= room.rows) return false;
  const t = room.tiles[ty * room.cols + tx];
  return t === TileType.EMPTY || t === TileType.WATER;
}

export function drawEnhancedTiles(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  engine: GameEngine,
  time: number,
  camX = 0,
  camY = 0
): void {
  const meta = getAnyBiomeMeta(room.biome);
  const startTx = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
  const endTx = Math.min(room.cols - 1, Math.ceil((camX + VIRTUAL_WIDTH) / TILE_SIZE) + 1);
  const startTy = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
  const endTy = Math.min(room.rows - 1, Math.ceil((camY + VIRTUAL_HEIGHT) / TILE_SIZE) + 1);

  const playerCx = engine.player.x + engine.player.w * 0.5;
  const playerCy = engine.player.y + engine.player.h * 0.5;

  for (let ty = startTy; ty <= endTy; ty++) {
    for (let tx = startTx; tx <= endTx; tx++) {
      const idx = ty * room.cols + tx;
      const t = room.tiles[idx];
      if (t === TileType.EMPTY) continue;

      const rt = engine.tileStates.get(idx);
      if (rt && (rt.state === 'gone' || rt.state === 'faded')) {
        if (t === TileType.CRUMBLE) {
          ctx.strokeStyle = 'rgba(220,200,255,0.28)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx * 8 + 1.25, ty * 8 + 1.25, 5.5, 5.5);
          ctx.fillStyle = 'rgba(220,200,255,0.22)';
          ctx.fillRect(tx * 8 + 3.5, ty * 8 + 3.5, 1, 1);
        }
        continue;
      }

      const x = tx * TILE_SIZE + (rt?.state === 'shaking' ? snapHalf(Math.sin(time * 54) * 1.1) : 0);
      const y = ty * TILE_SIZE;

      if (t === TileType.SOLID || t === TileType.SECRET_WALL) {
        drawEnhancedSolidTile(ctx, room, tx, ty, x, y, meta, t === TileType.SECRET_WALL, time);
      } else if (t === TileType.ONE_WAY) {
        const lfOw = getRoomTile(room, tx - 1, ty) === TileType.ONE_WAY;
        const rtOw = getRoomTile(room, tx + 1, ty) === TileType.ONE_WAY;
        // Sculpted bridge deck with double-bevel top edge & carved corbels
        ctx.fillStyle = meta.tileOutline;
        ctx.fillRect(x, y, 8, 4.5);
        ctx.fillStyle = meta.tileShadow;
        ctx.fillRect(x, y + 3, 8, 1.5);
        ctx.fillStyle = meta.tileMain;
        ctx.fillRect(x, y + 1, 8, 2.5);
        ctx.fillStyle = meta.tileHighlight;
        ctx.fillRect(x, y + 0.5, 8, 1.5);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(x + (tx % 2) * 0.5, y + 0.5, 6.5, 0.5);
        // Plank / stone join grooves & brass pins
        ctx.fillStyle = meta.tileOutline;
        ctx.fillRect(x + 3.5, y + 0.5, 0.5, 3);
        ctx.fillStyle = meta.accent;
        ctx.fillRect(x + 1, y + 2, 1, 0.5);
        ctx.fillRect(x + 6, y + 2, 1, 0.5);
        // Ornate support brackets at open ends and rhythmic intervals
        if (!lfOw) {
          ctx.fillStyle = meta.tileOutline;
          ctx.fillRect(x, y + 4, 3.5, 4);
          ctx.fillStyle = meta.tileShadow;
          ctx.fillRect(x + 0.5, y + 4.5, 2, 3);
          ctx.fillStyle = meta.accent;
          ctx.fillRect(x + 1, y + 5, 1, 1);
        }
        if (!rtOw) {
          ctx.fillStyle = meta.tileOutline;
          ctx.fillRect(x + 4.5, y + 4, 3.5, 4);
          ctx.fillStyle = meta.tileShadow;
          ctx.fillRect(x + 5.5, y + 4.5, 2, 3);
          ctx.fillStyle = meta.accent;
          ctx.fillRect(x + 6, y + 5, 1, 1);
        }
        if (tx % 2 === 0 && lfOw && rtOw) {
          ctx.fillStyle = meta.tileOutline;
          ctx.fillRect(x + 3, y + 4, 2, 2);
          ctx.fillStyle = meta.tileShadow;
          ctx.fillRect(x + 3.5, y + 4.5, 1, 1);
        }
      } else if (t === TileType.CRUMBLE) {
        const shaking = rt?.state === 'shaking';
        const glow = shaking || Math.floor(time * 6 + tx) % 5 === 0;
        ctx.fillStyle = '#0d0914';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#332645';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
        ctx.fillStyle = '#a892c7';
        ctx.fillRect(x + 1, y + 1, 6, 1.5);
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillRect(x + 1, y + 1, 4.5, 0.5);
        // Deep diagonal fracture fissures
        ctx.fillStyle = shaking ? '#ff5518' : '#160f21';
        ctx.fillRect(x + 1.5, y + 3, 4.5, 1);
        ctx.fillRect(x + 4, y + 2, 1, 5);
        ctx.fillRect(x + 2, y + 4.5, 1, 2);
        ctx.fillStyle = shaking ? '#ffe082' : glow ? '#e9d5ff' : '#7a688f';
        ctx.fillRect(x + 1.5, y + 5.5, 2, 0.5);
        ctx.fillRect(x + 5, y + 5.5, 1.5, 0.5);
        if (shaking) {
          const dustY = (time * 28 + tx * 3) % 5;
          ctx.fillStyle = '#ffd27dcc';
          ctx.fillRect(x + 2, y + 8 + snapHalf(dustY), 1, 1);
          ctx.fillRect(x + 5.5, y + 7 + snapHalf((dustY + 2.5) % 5), 0.5, 1);
        }
      } else if (t === TileType.DREAM_BLOCK) {
        const nUp = getRoomTile(room, tx, ty - 1) !== TileType.DREAM_BLOCK;
        const nDn = getRoomTile(room, tx, ty + 1) !== TileType.DREAM_BLOCK;
        const nLf = getRoomTile(room, tx - 1, ty) !== TileType.DREAM_BLOCK;
        const nRt = getRoomTile(room, tx + 1, ty) !== TileType.DREAM_BLOCK;

        ctx.fillStyle = '#05020f';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#150833';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);

        // Swirling dual-tone cosmic nebula wash
        const neb = Math.sin(time * 2.1 + tx * 0.45 + ty * 0.35);
        if (neb > 0.05) {
          ctx.fillStyle = neb > 0.55 ? 'rgba(139, 92, 246, 0.32)' : 'rgba(192, 132, 252, 0.22)';
          ctx.fillRect(x + 1, y + 1.5, 6, 5);
        }
        // Flowing border with animated shimmer
        const edgePulse = 0.55 + 0.45 * Math.sin(time * 4 + tx * 0.4 + ty * 0.4);
        ctx.fillStyle = mixHexColors('#c084fc', '#f5d0fe', edgePulse);
        if (nUp) ctx.fillRect(x, y, 8, 1);
        if (nDn) ctx.fillRect(x, y + 7, 8, 1);
        if (nLf) ctx.fillRect(x, y, 1, 8);
        if (nRt) ctx.fillRect(x + 7, y, 1, 8);

        ctx.fillStyle = '#ffffff';
        if (nUp && nLf) ctx.fillRect(x, y, 1.5, 1.5);
        if (nUp && nRt) ctx.fillRect(x + 6.5, y, 1.5, 1.5);
        if (nDn && nLf) ctx.fillRect(x, y + 6.5, 1.5, 1.5);
        if (nDn && nRt) ctx.fillRect(x + 6.5, y + 6.5, 1.5, 1.5);

        // Parallax starfield inside dream block at 0.5px precision
        const driftX = (time * 4.5) % 6;
        const starPhase = (tx * 7 + ty * 13 + Math.floor(time * 6)) % 5;
        const sx1 = x + snapHalf(((tx * 3 + driftX) % 5) + 1.5);
        const sy1 = y + ((ty * 5 + 1) % 5) + 1;
        if (starPhase === 0) {
          drawMicroSparkle(ctx, sx1, sy1, 1.5, '#f0abfc', 0.9);
        } else {
          ctx.fillStyle = starPhase === 1 ? '#6be8ff' : '#ff88ee';
          ctx.fillRect(sx1, sy1, 1, 1);
        }
        ctx.fillStyle = starPhase % 2 === 0 ? 'rgba(168,85,247,0.65)' : 'rgba(56,189,248,0.65)';
        ctx.fillRect(x + ((tx * 5 + 1) % 5) + 1, y + ((ty * 3 + 4) % 5) + 1, 0.5, 0.5);
      } else if (t === TileType.ICE) {
        const nUp = getRoomTile(room, tx, ty - 1) !== TileType.ICE;
        ctx.fillStyle = '#081834';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#184b80';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
        ctx.fillStyle = '#3b82b8';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 4);
        if (nUp) {
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(x, y + 1, 8, 2);
          ctx.fillStyle = '#ecfeff';
          ctx.fillRect(x, y, 8, 1);
        }
        // Diagonal crystal refraction streaks + sweeping prism shine
        const glintStep = (Math.floor(time * 9) - tx - ty) % 10 === 0;
        ctx.fillStyle = glintStep ? '#ffffff' : 'rgba(186,230,253,0.72)';
        ctx.fillRect(x + 1, y + 2, 2, 0.5);
        ctx.fillRect(x + 2, y + 2.5, 2, 0.5);
        ctx.fillRect(x + 3, y + 3, 1.5, 0.5);
        ctx.fillRect(x + 5, y + 5.5, 2, 0.5);
        if (glintStep) {
          drawMicroSparkle(ctx, x + 2.5, y + 2.5, 1.5, '#bae6fd', 0.95);
        }
      } else if (t === TileType.BREAKABLE) {
        ctx.fillStyle = '#160d09';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#5e4235';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
        ctx.fillStyle = '#996f5b';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 2);
        ctx.fillStyle = '#b88b74';
        ctx.fillRect(x + 1, y + 0.5, 5, 0.5);
        ctx.fillStyle = '#160d09';
        ctx.fillRect(x + 2, y + 1, 1, 6);
        ctx.fillRect(x + 3, y + 4, 3, 1);
        const pulse = 0.5 + 0.5 * Math.sin(time * 6 + tx);
        ctx.fillStyle = mixHexColors('#ff7722', '#fff3a8', pulse);
        ctx.fillRect(x + 2.5, y + 2, 2, 1);
        ctx.fillRect(x + 5, y + 5, 1, 1);
      } else if (t === TileType.STICKY_RESIN) {
        const drip = snapHalf(Math.sin(time * 3.5 + tx * 1.3) * 1.2);
        ctx.fillStyle = '#06241b';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#145441';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(x, y, 2, 8);
        ctx.fillRect(x + 6, y, 2, 8);
        ctx.fillStyle = '#a7f3d0';
        ctx.fillRect(x + 0.5, y + 2 + drip, 0.5, 3);
        ctx.fillRect(x + 7, y + 3.5 - drip, 0.5, 2.5);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillRect(x + 2, y + 2.5, 1, 1);
      } else if (t === TileType.MAGMA_CRUST) {
        const glow = 0.5 + 0.5 * Math.sin(time * 4.5 + tx * 0.9);
        ctx.fillStyle = '#120406';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#361212';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
        ctx.fillStyle = mixHexColors('#d43a15', '#ff7722', glow);
        ctx.fillRect(x + 1, y + 1, 6, 1);
        ctx.fillRect(x, y + 4, 3, 1.5);
        ctx.fillRect(x + 5, y + 3, 3, 1.5);
        ctx.fillStyle = mixHexColors('#ff9933', '#fff5b8', glow);
        ctx.fillRect(x + 2, y + 1, 2, 0.5);
        ctx.fillRect(x + 6, y + 3.5, 1, 1);
        if (Math.floor(time * 7 + tx) % 5 === 0) {
          ctx.fillStyle = '#ffe066';
          ctx.fillRect(x + ((tx * 3) % 6) + 1, y - 1, 0.5, 1);
        }
      } else if (t === TileType.CONVEYOR_LEFT || t === TileType.CONVEYOR_RIGHT) {
        ctx.fillStyle = '#0c0914';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = '#282336';
        ctx.fillRect(x, y + 1, 8, 6);
        const spinCog = Math.floor(time * 12) % 2;
        ctx.fillStyle = '#8b83a8';
        ctx.fillRect(x + 1, y + 4.5, 2, 2);
        ctx.fillRect(x + 5, y + 4.5, 2, 2);
        ctx.fillStyle = spinCog ? '#ffffff' : '#4a435e';
        ctx.fillRect(x + 1 + spinCog * 0.5, y + 5, 0.5, 0.5);
        ctx.fillRect(x + 6 - spinCog * 0.5, y + 5, 0.5, 0.5);
        ctx.fillStyle = '#ffaa33';
        const shift = snapHalf((time * 18) % 4);
        const cx = t === TileType.CONVEYOR_RIGHT ? x + shift : x + 3.5 - shift;
        ctx.fillRect(cx, y + 0.5, 2, 2);
        ctx.fillRect(((cx + 4 - x) % 8) + x, y + 0.5, 1, 2);
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(cx, y + 0.5, 1, 1);
        ctx.fillStyle = '#ffd27d';
        ctx.fillRect(x, y + 3, 8, 0.5);
      } else if (t === TileType.FRAGILE_GLASS) {
        const sheen = Math.floor(time * 5 + tx) % 6 === 0;
        ctx.fillStyle = 'rgba(62,168,204,0.38)';
        ctx.fillRect(x, y, 8, 8);
        ctx.fillStyle = 'rgba(166,246,255,0.55)';
        ctx.fillRect(x + 0.5, y + 0.5, 7, 2);
        ctx.strokeStyle = '#e0fdff';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 0.25, y + 0.25, 7.5, 7.5);
        ctx.fillStyle = sheen ? '#ffffff' : 'rgba(255,255,255,0.72)';
        ctx.fillRect(x + 1.5, y + 2, 2, 0.5);
        ctx.fillRect(x + 2.5, y + 2.5, 2, 0.5);
        ctx.fillRect(x + 5, y + 5, 1, 1);
      } else if (t === TileType.BEAT_A || t === TileType.BEAT_B) {
        const active =
          (t === TileType.BEAT_A && engine.beatPhase === 0) ||
          (t === TileType.BEAT_B && engine.beatPhase === 1);
        const col = t === TileType.BEAT_A ? '#ff477e' : '#38d9ff';
        const dark = t === TileType.BEAT_A ? '#7a1236' : '#12537a';
        if (active) {
          ctx.fillStyle = '#090712';
          ctx.fillRect(x, y, 8, 8);
          ctx.fillStyle = dark;
          ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
          ctx.fillStyle = col;
          ctx.fillRect(x + 1, y + 1, 6, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 1, y + 1, 6, 0.5);
          ctx.fillRect(x + 3, y + 3, 2, 2);
        } else {
          ctx.strokeStyle = colorWithAlpha(col, 0.55);
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1.25, y + 1.25, 5.5, 5.5);
          ctx.fillStyle = colorWithAlpha(col, 0.4);
          ctx.fillRect(x + 3.25, y + 3.25, 1.5, 1.5);
        }
      } else if (t === TileType.LIQUID_LETHAL) {
        drawEnhancedLavaTile(ctx, room, tx, ty, x, y, time);
      } else if (t === TileType.WATER) {
        drawEnhancedWaterTile(ctx, room, tx, ty, x, y, time, playerCx, playerCy);
      } else if (t === TileType.CLOUD_BOUNCE) {
        const bounceY = snapHalf(Math.sin(time * 4 + tx * 0.6) * 0.6);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y + 3 + bounceY, 8, 5);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(x, y + 2 + bounceY, 8, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 0.5, y + 1 + bounceY, 7, 2);
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(x, y + 5 + bounceY, 8, 0.5);
        if ((tx + Math.floor(time * 5)) % 5 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillRect(x + 3, y - 1 + bounceY, 1.5, 1);
        }
      } else if (
        t === TileType.SPIKE_UP ||
        t === TileType.SPIKE_DOWN ||
        t === TileType.SPIKE_LEFT ||
        t === TileType.SPIKE_RIGHT
      ) {
        drawEnhancedSpikeTile(ctx, x, y, t, meta.accent, time);
      }
    }
  }
}

function drawEnhancedWaterTile(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  tx: number,
  ty: number,
  x: number,
  y: number,
  time: number,
  playerCx: number,
  playerCy: number
): void {
  const upSame = getRoomTile(room, tx, ty - 1) === TileType.WATER;
  const dnSame = getRoomTile(room, tx, ty + 1) === TileType.WATER;
  const lfTile = getRoomTile(room, tx - 1, ty);
  const rtTile = getRoomTile(room, tx + 1, ty);
  const lfSame = lfTile === TileType.WATER;
  const rtSame = rtTile === TileType.WATER;

  if (!upSame) {
    // Smooth 1px-wide, 0.5px-tall wave harmonics + reactive player splash ripple!
    const distToPlayer = Math.hypot(playerCx - (x + 4), playerCy - y);
    const splashAmp = distToPlayer < 26 ? Math.max(0, 1 - distToPlayer / 26) * 1.5 : 0;

    for (let sx = 0; sx < 8; sx += 1) {
      const wx = x + sx;
      const waveVal =
        Math.sin(time * 4.2 + wx * 0.24) * 0.85 +
        Math.cos(time * 2.7 - wx * 0.16) * 0.45 +
        (splashAmp > 0 ? Math.sin(time * 16 + wx * 0.7) * splashAmp : 0);
      const topY = y + 1 + snapHalf(waveVal);
      const fillH = Math.max(2, y + 8 - topY);

      ctx.fillStyle = 'rgba(18, 86, 140, 0.68)';
      ctx.fillRect(wx, topY, 1, fillH);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.72)';
      ctx.fillRect(wx, topY, 1, 1.5);
      ctx.fillStyle = 'rgba(224, 250, 255, 0.9)';
      ctx.fillRect(wx, topY, 1, 0.5);

      // Animated horizon reflection gleam & crest sparkle
      if (Math.floor(time * 8 + wx * 0.45) % 9 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx, topY, 1, 0.5);
      }
      // Subtle subsurface sky-shimmer reflection bar
      if ((sx + Math.floor(time * 6)) % 4 === 0) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.28)';
        ctx.fillRect(wx, topY + 2.5, 1, 0.5);
      }
    }

    // Shoreline whitewater foam curl against adjacent solid walls
    if (!lfSame && isTileValueSolid(lfTile)) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(x, y + 1, 1.5, 1.5);
    }
    if (!rtSame && isTileValueSolid(rtTile)) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(x + 6.5, y + 1, 1.5, 1.5);
    }
  } else {
    // Beer-Lambert tinted deeper column
    ctx.fillStyle = dnSame ? 'rgba(12, 68, 112, 0.60)' : 'rgba(7, 42, 74, 0.68)';
    ctx.fillRect(x, y, 8, 8);

    // Diagonal underwater caustic rays
    const causticPhase = (tx * 2 + ty + Math.floor(time * 5.5)) % 5;
    if (causticPhase === 0) {
      ctx.fillStyle = 'rgba(125, 232, 255, 0.28)';
      ctx.fillRect(x + 1, y + 1, 5, 1.5);
      ctx.fillRect(x + 3, y + 3, 3.5, 1.5);
    }
    // Crisp 0.5px-highlighted rising underwater bubbles
    if ((tx * 7 + ty * 3) % 3 === 0) {
      const bubY = 7 - ((Math.floor(time * 7 + tx * 4 + ty * 5)) % 8);
      const bx = x + ((tx * 5 + Math.round(Math.sin(time * 3 + ty))) % 5) + 1;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.78)';
      ctx.fillRect(bx, y + bubY, 1.5, 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, y + bubY, 0.5, 0.5);
    }
    // Tiny shimmering fish silhouette in deep pools
    if ((tx * 11 + ty * 17) % 13 === 0) {
      const swimX = ((time * 10 + tx * 3) % 5) + 1;
      ctx.fillStyle = 'rgba(253, 230, 138, 0.8)';
      ctx.fillRect(x + snapHalf(swimX), y + 4, 2, 1);
      ctx.fillRect(x + snapHalf(swimX) - 0.5, y + 4, 0.5, 1);
    }
    ctx.fillStyle = 'rgba(107, 232, 255, 0.30)';
    if (!lfSame) ctx.fillRect(x, y, 0.5, 8);
    if (!rtSame) ctx.fillRect(x + 7.5, y, 0.5, 8);
  }
}

function drawEnhancedLavaTile(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  tx: number,
  ty: number,
  x: number,
  y: number,
  time: number
): void {
  const upSame = getRoomTile(room, tx, ty - 1) === TileType.LIQUID_LETHAL;
  const dnSame = getRoomTile(room, tx, ty + 1) === TileType.LIQUID_LETHAL;
  const lfSame = getRoomTile(room, tx - 1, ty) === TileType.LIQUID_LETHAL;
  const rtSame = getRoomTile(room, tx + 1, ty) === TileType.LIQUID_LETHAL;
  const bio =
    room.biome === 'bioluminescent' ||
    room.biome === 'ebony_fen' ||
    room.biome === 'mercury_mire' ||
    room.biome === 'pestilence_marsh' ||
    room.biome === 'styx_ferry';
  const alchem =
    room.biome === 'alchemical_labs' ||
    room.biome === 'fungal_myriad' ||
    room.biome === 'cyber_grid' ||
    room.biome === 'asphodel_wastes' ||
    room.biome === 'void_gate';
  const amber = room.biome === 'amber_hive' || room.biome === 'brimstone_caldera';
  const blood = room.biome === 'blood_aqueduct' || room.biome === 'hellglass_cathedral';

  const colCore = bio ? '#137035' : alchem ? '#7a165e' : amber ? '#78350f' : blood ? '#5c0618' : '#a81c06';
  const colMid = bio ? '#29ba56' : alchem ? '#d946ef' : amber ? '#d97706' : blood ? '#b81135' : '#e64212';
  const colHot = bio ? '#80ff66' : alchem ? '#34d399' : amber ? '#fbbf24' : blood ? '#fb7185' : '#ff9f24';
  const colCrest = bio ? '#e2ffbf' : alchem ? '#fdf4ff' : amber ? '#fef08a' : blood ? '#ffe4e6' : '#fff5a8';

  if (!upSame) {
    for (let sx = 0; sx < 8; sx += 1) {
      const wx = x + sx;
      const w0 = snapHalf(Math.sin(time * 4.5 + wx * 0.22) * 1.1 + Math.cos(time * 2.8 - wx * 0.16) * 0.4);
      const topY = y + 2 + w0;
      const fillH = Math.max(2, y + 8 - topY);

      ctx.fillStyle = colMid;
      ctx.fillRect(wx, topY, 1, fillH);
      ctx.fillStyle = colHot;
      ctx.fillRect(wx, topY, 1, 1.5);
      ctx.fillStyle = colCrest;
      ctx.fillRect(wx, topY, 1, 0.5);
    }

    if (!lfSame) {
      ctx.fillStyle = colCrest;
      ctx.fillRect(x, y + 2, 0.5, 6);
    }
    if (!rtSame) {
      ctx.fillStyle = colCrest;
      ctx.fillRect(x + 7.5, y + 2, 0.5, 6);
    }

    // Bobbing dark basalt slag chunks
    if ((tx + Math.floor(time * 2.5)) % 4 === 0) {
      ctx.fillStyle = colCore;
      ctx.fillRect(x + 2, y + 4, 4, 1.5);
      ctx.fillStyle = colHot;
      ctx.fillRect(x + 2.5, y + 3.5, 2, 0.5);
    }

    // Rising incandescent sparks above molten surface
    const sparkT = Math.floor(time * 8 + tx * 5);
    if (sparkT % 4 === 0) {
      const lift = sparkT % 4;
      ctx.fillStyle = colCrest;
      ctx.fillRect(x + ((tx * 3 + 2) % 6), y + 1 - lift, 0.5, 1);
    }
  } else {
    ctx.fillStyle = colCore;
    ctx.fillRect(x, y, 8, 8);
    const flow = Math.floor(time * 6 + tx * 2) % 8;
    ctx.fillStyle = colMid;
    ctx.fillRect(x, y + (flow % 4), 8, 2.5);
    ctx.fillRect(x + ((tx * 3 + 1) % 5), y, 2.5, 8);
    const bY = 7 - (Math.floor(time * 7 + tx * 5 + ty * 3) % 8);
    const bX = (tx * 3 + ty * 2) % 6;
    ctx.fillStyle = colHot;
    ctx.fillRect(x + bX, y + bY, 1.5, 1.5);
    ctx.fillStyle = colCrest;
    ctx.fillRect(x + bX, y + bY, 0.5, 0.5);
    ctx.fillStyle = colHot + 'aa';
    if (!lfSame) ctx.fillRect(x, y, 0.5, 8);
    if (!rtSame) ctx.fillRect(x + 7.5, y, 0.5, 8);
    if (!dnSame) ctx.fillRect(x, y + 7.5, 8, 0.5);
  }
}

export function drawEnhancedSolidTile(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  tx: number,
  ty: number,
  x: number,
  y: number,
  meta: BiomeMeta,
  isSecret: boolean,
  time: number
): void {
  const upTile = getRoomTile(room, tx, ty - 1);
  const up = isTileValueSolid(upTile);
  const submerged = upTile === TileType.WATER || upTile === TileType.LIQUID_LETHAL;
  const dn = isTileValueSolid(getRoomTile(room, tx, ty + 1));
  const lf = isTileValueSolid(getRoomTile(room, tx - 1, ty));
  const rt = isTileValueSolid(getRoomTile(room, tx + 1, ty));

  // Base block fill with subtle per-tile tonal variation for organic masonry
  const hash = (tx * 37 + ty * 19) & 15;
  const toneVar = (tx * 11 + ty * 23) % 5;
  ctx.fillStyle = meta.tileMain;
  ctx.fillRect(x, y, 8, 8);
  if (toneVar === 0) {
    ctx.fillStyle = colorWithAlpha(meta.tileShadow, 0.42);
    ctx.fillRect(x, y, 8, 8);
  } else if (toneVar === 2) {
    ctx.fillStyle = colorWithAlpha(meta.tileHighlight, 0.18);
    ctx.fillRect(x, y, 8, 4);
  }

  // Staggered Ashlar Stonework + 0.5px Micro-Bevel Highlights & Deep Mortar Recesses
  const mortarOffset = (ty & 1) * 4;
  ctx.fillStyle = meta.tileShadow;
  ctx.fillRect(x, y + 3, 8, 0.5);
  ctx.fillRect(x, y + 7, 8, 0.5);
  ctx.fillRect(x + mortarOffset, y, 0.5, 3.5);
  ctx.fillRect(x + ((mortarOffset + 4) & 7), y + 3.5, 0.5, 4);

  // Carved inner brick top-left highlight bevel (0.5px resolution!)
  ctx.fillStyle = colorWithAlpha(meta.tileHighlight, 0.36);
  ctx.fillRect(x + ((mortarOffset + 1) & 7), y + 0.5, 2.5, 0.5);
  ctx.fillRect(x + ((mortarOffset + 5) & 7), y + 4, 2.5, 0.5);

  if (hash === 1 || hash === 10) {
    // Fine weathered stone hairline crack
    ctx.fillStyle = colorWithAlpha(meta.tileOutline, 0.58);
    ctx.fillRect(x + 2, y + 1, 0.5, 1);
    ctx.fillRect(x + 2.5, y + 2, 1, 0.5);
    ctx.fillRect(x + 3.5, y + 4, 0.5, 2);
  } else if ((hash & 3) === 0) {
    ctx.fillStyle = colorWithAlpha(meta.tileHighlight, 0.42);
    ctx.fillRect(x + 1 + (hash & 1), y + 5, 3, 0.5);
  } else if (hash === 5 || hash === 13) {
    // Embedded glowing ore / rune crystal with animated specular micro-sparkle
    const shimmer = Math.sin(time * 3.4 + tx * 0.9 + ty);
    ctx.fillStyle = colorWithAlpha(meta.tileOutline, 0.72);
    ctx.fillRect(x + 4, y + 1, 2, 2);
    ctx.fillStyle = shimmer > 0.35 ? '#ffffffdd' : colorWithAlpha(meta.accent, 0.78);
    ctx.fillRect(x + 4, y + 1, 1, 1);
    ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.65);
    ctx.fillRect(x + 5, y + 2, 1, 1);
    if (shimmer > 0.85) {
      drawMicroSparkle(ctx, x + 4.5, y + 1.5, 1.5, meta.secondaryAccent, 0.85);
    }
  } else if (hash === 9) {
    ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.48);
    ctx.fillRect(x + 2, y + 5, 1.5, 1.5);
  }

  // Biome-specific animated & sculpted wall materials
  if (
    room.biome === 'cyber_undercity' ||
    room.biome === 'orbital_nexus' ||
    room.biome === 'alchemical_labs' ||
    room.biome === 'cyber_grid' ||
    room.biome === 'chrono_paradox' ||
    room.biome === 'magnetic_rift'
  ) {
    const scanPhase = Math.floor(time * 8 - tx - ty) & 7;
    if ((tx + ty) % 3 === 0) {
      ctx.fillStyle = scanPhase === 0 ? '#ffffffdd' : colorWithAlpha(meta.accent, 0.52);
      ctx.fillRect(x + 1, y + 4, 5, 0.5);
      ctx.fillRect(x + 5.5, y + 2, 0.5, 2);
      if (scanPhase <= 1) {
        ctx.fillStyle = colorWithAlpha(meta.secondaryAccent, 0.82);
        ctx.fillRect(x + 1 + scanPhase * 3, y + 4, 1.5, 0.5);
      }
    }
  } else if (room.biome === 'clockwork_spire' || room.biome === 'rust_foundry' || room.biome === 'crimson_foundry') {
    if (hash === 3 || hash === 11) {
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.72);
      ctx.fillRect(x + 1, y + 1, 0.5, 0.5);
      ctx.fillRect(x + 6.5, y + 1, 0.5, 0.5);
      ctx.fillRect(x + 2, y + 5, 4, 0.5);
      const tick = Math.floor(time * 5 + tx) % 2;
      ctx.fillStyle = tick ? '#ffe49e' : '#92400e';
      ctx.fillRect(x + 3 + tick * 0.5, y + 4, 1.5, 1.5);
    }
  } else if (
    room.biome === 'obsidian_forge' ||
    room.biome === 'crimson_canyon' ||
    room.biome === 'ember_steppe' ||
    room.biome === 'solar_corona' ||
    room.biome === 'blood_eclipse'
  ) {
    if (hash === 7 || hash === 11 || hash === 14) {
      const ember = Math.sin(time * 3.8 + tx * 0.8 + ty * 1.1);
      ctx.fillStyle = ember > 0.2 ? '#ff8822cc' : ember > -0.3 ? '#d43a1588' : '#7c2d1266';
      ctx.fillRect(x + 1, y + 4, 4, 0.5);
      ctx.fillRect(x + 3, y + 4.5, 1.5, 1.5);
      if (ember > 0.72) {
        ctx.fillStyle = '#fff3b0cc';
        ctx.fillRect(x + 2, y + 4, 1, 0.5);
      }
    }
  } else if (
    room.biome === 'bioluminescent' ||
    room.biome === 'ebony_fen' ||
    room.biome === 'twilight_garden' ||
    room.biome === 'coral_abyss' ||
    room.biome === 'fungal_myriad' ||
    room.biome === 'jade_bamboo' ||
    room.biome === 'mercury_mire'
  ) {
    if (hash === 4 || hash === 12) {
      const bioPulse = 0.45 + 0.55 * Math.sin(time * 2.6 + tx * 1.3 + ty);
      ctx.fillStyle = bioPulse > 0.6 ? colorWithAlpha(meta.secondaryAccent, 0.78) : colorWithAlpha(meta.accent, 0.48);
      ctx.fillRect(x + 2, y + 2, 2.5, 0.5);
      ctx.fillRect(x + 4, y + 5, 1.5, 1.5);
    }
  } else if (
    room.biome === 'frostglass' ||
    room.biome === 'aurora_zenith' ||
    room.biome === 'glacial_fjord' ||
    room.biome === 'lunar_bastion' ||
    room.biome === 'mirror_labyrinth' ||
    room.biome === 'prism_sanctum'
  ) {
    if (hash === 2 || hash === 8 || hash === 15) {
      const iceGlint = Math.floor(time * 6 - tx + ty) % 10 === 0;
      ctx.fillStyle = iceGlint ? '#ffffffdd' : colorWithAlpha(meta.tileHighlight, 0.52);
      ctx.fillRect(x + 1, y + 2, 3, 0.5);
      ctx.fillRect(x + 2, y + 2.5, 2, 0.5);
    }
  } else if (
    room.biome === 'celestial_marble' ||
    room.biome === 'solar_mirage' ||
    room.biome === 'obsidian_temple' ||
    room.biome === 'hourglass_desert' ||
    room.biome === 'cloud_monastery' ||
    room.biome === 'amber_hive' ||
    room.biome === 'seraph_citadel' ||
    room.biome === 'eternity_apex'
  ) {
    if ((tx + ty) % 4 === 1) {
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.44);
      ctx.fillRect(x + 1, y + 2, 5, 0.5);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(x + 2, y + 1, 3, 0.5);
    }
  } else if (
    room.biome === 'astral_void' ||
    room.biome === 'amethyst_crypt' ||
    room.biome === 'sunken_cathedral' ||
    room.biome === 'astral_library' ||
    room.biome === 'void_nebula' ||
    room.biome === 'crystal_singularity' ||
    room.biome === 'abyss_throne'
  ) {
    if (hash === 6 || hash === 12) {
      const runeOn = Math.sin(time * 2.4 + tx * 1.1 + ty * 0.7) > 0.2;
      ctx.fillStyle = runeOn ? colorWithAlpha(meta.accent, 0.65) : colorWithAlpha(meta.secondaryAccent, 0.28);
      ctx.fillRect(x + 3.5, y + 2, 1, 3);
      ctx.fillRect(x + 2.5, y + 3, 3, 0.5);
    }
  }

  if (isSecret && Math.sin(time * 3.2 + tx + ty) > 0.55) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 2, y + 2, 4, 4);
    ctx.fillStyle = colorWithAlpha(meta.accent, 0.78);
    ctx.fillRect(x + 3, y + 3, 2, 2);
  }

  // Exposed Top Surface Cap + Lush 0.5px Flora / Frost / Ember Overhangs
  if (!up) {
    ctx.fillStyle = meta.tileOutline;
    ctx.fillRect(x, y, 8, 0.5);
    ctx.fillStyle = meta.tileHighlight;
    ctx.fillRect(x, y + 0.5, 8, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.34)';
    ctx.fillRect(x + 0.5, y + 0.5, 7, 0.5);
    ctx.fillStyle = colorWithAlpha(meta.accent, 0.34);
    ctx.fillRect(x, y + 2.5, 8, 1);

    if (!submerged) {
      const sway = snapHalf(Math.sin(time * 3.4 + tx * 0.7) * 0.7);
      const icy = room.biome === 'frostglass' || room.biome === 'aurora_zenith' || room.biome === 'glacial_fjord' || room.biome === 'lunar_bastion';
      const hot = room.biome === 'obsidian_forge' || room.biome === 'crimson_canyon' || room.biome === 'solar_mirage' || room.biome === 'ember_steppe' || room.biome === 'solar_corona' || room.biome === 'crimson_foundry';
      if (icy) {
        ctx.fillStyle = '#d8f3ff';
        ctx.fillRect(x, y, 8, 1.5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + (tx % 2) * 0.5, y, 6, 0.5);
        if (hash % 3 === 0) ctx.fillRect(x + 3, y - 0.5, 2, 0.5);
      } else if (hot) {
        ctx.fillStyle = colorWithAlpha(meta.accent, 0.8);
        ctx.fillRect(x + 1, y + 0.5, 6, 1);
        if ((tx * 13 + ty) % 3 === 0) {
          ctx.fillStyle = meta.secondaryAccent;
          ctx.fillRect(x + 2, y - 1, 0.5, 1);
          ctx.fillRect(x + 5 + sway, y - 1.5, 1, 1.5);
        }
      } else {
        // Multi-blade swaying grass/moss carpet & tiny blossom tufts
        const mossCol = mixHexColors(meta.accent, meta.tileHighlight, 0.25);
        ctx.fillStyle = mossCol;
        ctx.fillRect(x + 0.5, y + 0.5, 7, 1);
        if ((tx * 17 + ty) % 2 === 0) {
          ctx.fillStyle = meta.accent;
          ctx.fillRect(x + 1 + sway * 0.5, y - 1, 0.5, 1.5);
          ctx.fillRect(x + 2.5 + sway, y - 1.5, 0.5, 2);
          ctx.fillRect(x + 5 + sway, y - 2.5, 0.5, 3);
          ctx.fillRect(x + 6.5 + sway * 0.5, y - 1, 0.5, 1.5);
          if ((tx * 7 + ty * 3) % 4 === 0) {
            ctx.fillStyle = meta.secondaryAccent;
            ctx.fillRect(x + 5 + sway, y - 3, 1, 1);
            ctx.fillStyle = '#ffffffcc';
            ctx.fillRect(x + 5 + sway, y - 3, 0.5, 0.5);
          }
        }
        if ((tx * 11 + ty) % 5 === 0) {
          // Overhanging moss drip down the block lip
          ctx.fillStyle = colorWithAlpha(meta.accent, 0.72);
          ctx.fillRect(x + 2, y + 2.5, 1, 1.5);
          ctx.fillRect(x + 5.5, y + 2.5, 0.5, 2);
        }
      }
    } else if (upTile === TileType.LIQUID_LETHAL) {
      ctx.fillStyle = 'rgba(255, 153, 51, 0.65)';
      ctx.fillRect(x, y, 8, 1);
    }
  }

  // Exposed Ceiling Underside + Swaying 0.5px Overhang Roots / Icicles / Dew Drops
  if (!dn) {
    ctx.fillStyle = meta.tileOutline;
    ctx.fillRect(x, y + 7.5, 8, 0.5);
    ctx.fillStyle = meta.tileShadow;
    ctx.fillRect(x, y + 6.5, 8, 1);
    if ((tx * 11 + ty) % 3 === 0) {
      const sway = snapHalf(Math.sin(time * 2.5 + tx) * 0.5);
      const len = 3 + (hash % 3);
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x + 3 + sway, y + 8, 1.5, len);
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.8);
      ctx.fillRect(x + 3.5 + sway, y + 7.5 + len, 0.5, 1.5);
      if (hash % 4 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillRect(x + 3.5 + sway, y + 8 + len, 0.5, 0.5);
      }
    }
  }

  // Crisp Exposed Side Edges + 0.5px Beveled Wall Trim
  if (!lf) {
    ctx.fillStyle = meta.tileOutline;
    ctx.fillRect(x, y, 0.5, 8);
    ctx.fillStyle = colorWithAlpha(meta.tileHighlight, 0.7);
    ctx.fillRect(x + 0.5, y + 0.5, 0.5, 7);
    if ((ty * 7 + tx) % 4 === 0) {
      ctx.fillStyle = colorWithAlpha(meta.accent, 0.58);
      ctx.fillRect(x + 1, y + 3, 0.5, 2);
    }
  }
  if (!rt) {
    ctx.fillStyle = meta.tileOutline;
    ctx.fillRect(x + 7.5, y, 0.5, 8);
    ctx.fillStyle = meta.tileShadow;
    ctx.fillRect(x + 7, y + 0.5, 0.5, 7);
  }

  // Sculpted 0.5px Corner Chamfer Rivets & Bevels on exposed outer corners
  ctx.fillStyle = meta.tileOutline;
  if (!up && !lf) {
    ctx.fillRect(x + 0.5, y + 0.5, 1, 1);
    ctx.fillStyle = '#ffffff55';
    ctx.fillRect(x + 1.5, y + 1.5, 0.5, 0.5);
    ctx.fillStyle = meta.tileOutline;
  }
  if (!up && !rt) ctx.fillRect(x + 6.5, y + 0.5, 1, 1);
  if (!dn && !lf) ctx.fillRect(x + 0.5, y + 6.5, 1, 1);
  if (!dn && !rt) ctx.fillRect(x + 6.5, y + 6.5, 1, 1);
}

export function drawEnhancedTilePolish(
  ctx: CanvasRenderingContext2D,
  room: RoomDef,
  time: number,
  camX: number,
  camY: number
): void {
  const meta = getAnyBiomeMeta(room.biome);
  const accent = meta.accent;
  const sx = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
  const ex = Math.min(room.cols - 1, Math.ceil((camX + VIRTUAL_WIDTH) / TILE_SIZE) + 1);
  const sy = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
  const ey = Math.min(room.rows - 1, Math.ceil((camY + VIRTUAL_HEIGHT) / TILE_SIZE) + 1);
  const T = TILE_SIZE;
  for (let ty = sy; ty <= ey; ty++) {
    for (let tx = sx; tx <= ex; tx++) {
      const t = room.tiles[ty * room.cols + tx];
      if (t !== TileType.SOLID && t !== TileType.ICE && t !== TileType.CRUMBLE && t !== TileType.BREAKABLE) {
        if (isAirTile(room, tx, ty)) {
          // Layered directional Ambient Occlusion under ceilings & along wall bases
          if (ty > 0 && room.tiles[(ty - 1) * room.cols + tx] === TileType.SOLID) {
            ctx.fillStyle = 'rgba(4,2,12,0.46)';
            ctx.fillRect(tx * T, ty * T, T, 1.5);
            ctx.fillStyle = 'rgba(4,2,12,0.20)';
            ctx.fillRect(tx * T, ty * T + 1.5, T, 2);
          }
          if (tx > 0 && room.tiles[ty * room.cols + (tx - 1)] === TileType.SOLID) {
            ctx.fillStyle = 'rgba(4,2,12,0.26)';
            ctx.fillRect(tx * T, ty * T, 1.5, T);
          }
          if (tx < room.cols - 1 && room.tiles[ty * room.cols + (tx + 1)] === TileType.SOLID) {
            ctx.fillStyle = 'rgba(4,2,12,0.18)';
            ctx.fillRect(tx * T + T - 1, ty * T, 1, T);
          }
        }
        continue;
      }
      const x = tx * T;
      const y = ty * T;
      const h = (tx * 73856093) ^ (ty * 19349663);
      if (isAirTile(room, tx, ty - 1)) {
        // Sky-bounce rim light & micro spore sparkles along ledges
        ctx.fillStyle = colorWithAlpha(accent, 0.44);
        ctx.fillRect(x, y, T, 0.5);
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.fillRect(x + (h & 3), y, 3, 0.5);
        ctx.fillStyle = colorWithAlpha(accent, 0.14);
        ctx.fillRect(x, y - 1.5, T, 1.5);
        if ((h & 7) === 1) {
          const sway = snapHalf(Math.sin(time * 2.0 + tx) * 0.85);
          ctx.fillStyle = colorWithAlpha(accent, 0.8);
          ctx.fillRect(x + 2 + sway, y - 2, 0.5, 2);
          ctx.fillRect(x + 4, y - 3, 0.5, 3);
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillRect(x + 4, y - 3, 0.5, 0.5);
        } else if ((h & 15) === 6) {
          const tw = (Math.sin(time * 3.4 + h) + 1) * 0.5;
          ctx.fillStyle = `rgba(255,255,255,${(0.3 + tw * 0.65).toFixed(2)})`;
          ctx.fillRect(x + 5, y - 1, 0.5, 0.5);
        }
      }
      if (isAirTile(room, tx - 1, ty)) {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(x, y, 0.5, T);
      }
      if (isAirTile(room, tx + 1, ty)) {
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        ctx.fillRect(x + T - 0.5, y, 0.5, T);
      }
      if (isAirTile(room, tx, ty + 1)) {
        ctx.fillStyle = 'rgba(0,0,0,0.36)';
        ctx.fillRect(x, y + T - 0.5, T, 0.5);
      }
    }
  }
}

export function drawEnhancedSpikeTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  accent: string,
  time: number
): void {
  const gleam = Math.floor(time * 7 + x + y) % 7 === 0;
  if (t === TileType.SPIKE_UP) {
    ctx.fillStyle = '#090712';
    ctx.fillRect(x, y + 6, 8, 2);
    ctx.fillStyle = '#5c5375';
    ctx.fillRect(x, y + 6, 8, 0.5);
    for (let i = 0; i < 2; i++) {
      const sx = x + i * 4;
      ctx.fillStyle = '#140f1d';
      ctx.fillRect(sx, y + 4.5, 4, 2.5);
      ctx.fillRect(sx + 1, y + 1.5, 2, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(sx + 1, y + 2, 2, 4.5);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(sx + 1, y + 2, 1, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + 1, y + 2, 0.5, 3);
      ctx.fillStyle = gleam ? '#ffffff' : accent;
      ctx.fillRect(sx + 1.5, y + 1, 1, 1);
    }
  } else if (t === TileType.SPIKE_DOWN) {
    ctx.fillStyle = '#090712';
    ctx.fillRect(x, y, 8, 2);
    ctx.fillStyle = '#5c5375';
    ctx.fillRect(x, y + 1.5, 8, 0.5);
    for (let i = 0; i < 2; i++) {
      const sx = x + i * 4;
      ctx.fillStyle = '#140f1d';
      ctx.fillRect(sx, y + 1, 4, 3.5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(sx + 1, y + 1.5, 2, 4.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + 1, y + 2, 0.5, 2.5);
      ctx.fillStyle = gleam ? '#ffffff' : accent;
      ctx.fillRect(sx + 1.5, y + 6, 1, 1);
    }
  } else if (t === TileType.SPIKE_LEFT) {
    ctx.fillStyle = '#090712';
    ctx.fillRect(x + 6, y, 2, 8);
    ctx.fillStyle = '#5c5375';
    ctx.fillRect(x + 6, y, 0.5, 8);
    for (let i = 0; i < 2; i++) {
      const sy = y + i * 4;
      ctx.fillStyle = '#140f1d';
      ctx.fillRect(x + 3.5, sy, 3.5, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 2, sy + 1, 4.5, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, sy + 1, 3, 0.5);
      ctx.fillStyle = gleam ? '#ffffff' : accent;
      ctx.fillRect(x + 1, sy + 1.5, 1, 1);
    }
  } else {
    ctx.fillStyle = '#090712';
    ctx.fillRect(x, y, 2, 8);
    ctx.fillStyle = '#5c5375';
    ctx.fillRect(x + 1.5, y, 0.5, 8);
    for (let i = 0; i < 2; i++) {
      const sy = y + i * 4;
      ctx.fillStyle = '#140f1d';
      ctx.fillRect(x + 1, sy, 3.5, 4);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 1.5, sy + 1, 4.5, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, sy + 1, 3, 0.5);
      ctx.fillStyle = gleam ? '#ffffff' : accent;
      ctx.fillRect(x + 6, sy + 1.5, 1, 1);
    }
  }
}
