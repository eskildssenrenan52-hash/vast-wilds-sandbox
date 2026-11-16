// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import { drawEnhancedBackdrop, drawEnhancedForeground } from './backdropRenderer';
import { drawBiomeDecorBackdrop, drawBiomeDecorForeground } from './biomeDecor';
import { GameEngine, LiveEntity } from './engine';
import { getHeroDef, getHeroSkinDef } from './heroes';
import { getAnyBossMeta, isBossKind } from './modes';
import { isTileValueSolid } from './physics';
import {
  ENEMY_SPRITES,
  HERO_SPRITE_SETS,
  HeroAnimKey,
  NPC_SPRITES,
  PROP_SPRITES,
  buildHeroPalette,
  drawPixelSprite,
  drawTintedSprite,
} from './sprites';
import {
  ELEMENT_META,
  SPIRIT_MAP,
  getAnyBossBestiary,
  sampleGhostFrame,
} from './systems';
import { AURA_TRAIL_MAP } from './passAndRewards';
import { getHeroEvolutionData } from './heroEvolution';
import {
  drawHeroEvolutionBackLayers,
  drawHeroEvolutionFrontLayers,
} from './heroEvolutionRenderer';
import { DETAILED_PET_MAP, drawDetailedPetShowcase } from './pets';
import { renderSandboxWorld } from './sandboxRenderer';
import { drawEnhancedTilePolish, drawEnhancedTiles } from './tileRenderer';
import {
  ElementType,
  RoomDef,
  RoomPropDef,
  TILE_SIZE,
  TileType,
  VIRTUAL_HEIGHT,
  VIRTUAL_WIDTH,
} from './types';
import {
  colorWithAlpha,
  drawCachedGlow,
  drawMicroSparkle,
  snapHalf,
} from './visualFx';
import { BiomeMeta } from './worldData';
import { getAnyBiomeMeta } from './worldDataUnderworld';

function safeModIdx(n: number, len: number): number {
  return ((Math.floor(n) % len) + len) % len;
}

export class PixelRenderer {
  private lightCanvas: HTMLCanvasElement | null = null;
  private lightCtx: CanvasRenderingContext2D | null = null;
  private time = 0;

  private ensureLightBuffer(): void {
    if (typeof document === 'undefined') return;
    if (!this.lightCanvas) {
      this.lightCanvas = document.createElement('canvas');
      this.lightCanvas.width = VIRTUAL_WIDTH;
      this.lightCanvas.height = VIRTUAL_HEIGHT;
      this.lightCtx = this.lightCanvas.getContext('2d');
    }
  }

  public render(ctx: CanvasRenderingContext2D, engine: GameEngine, dt: number): void {
    this.time += Math.max(0, dt);
    ctx.save();
    ctx.scale(2, 2);
    ctx.imageSmoothingEnabled = false;

    if (engine.playMode === 'sandbox_world' && engine.sandboxWorld) {
      renderSandboxWorld(ctx, engine, this.time, () => {
        this.drawGhosts(ctx, engine);
        this.drawEchoClone(ctx, engine);
        this.drawPlayer(ctx, engine);
        this.drawSpiritCompanion(ctx, engine);
        this.drawShockwaves(ctx, engine);
        this.drawImpactSlashes(ctx, engine);
        this.drawParticles(ctx, engine);
        this.drawFloatingTexts(ctx, engine);
      });
      this.drawCombatScreenFX(ctx, engine, Math.round(engine.cameraX), Math.round(engine.cameraY));
      ctx.restore();
      return;
    }

    const room = engine.currentRoom;
    const meta = getAnyBiomeMeta(room.biome);
    const camX = Math.round(engine.cameraX);
    const camY = Math.round(engine.cameraY);

    // Trauma + directional impact camera shake (sub-pixel 0.5 step precision for 2x buffer)
    let shakeX = Math.round(engine.shakeDirX * 2) / 2;
    let shakeY = Math.round(engine.shakeDirY * 2) / 2;
    if (engine.trauma > 0) {
      const mag = engine.trauma * engine.trauma * 6;
      shakeX += Math.round((Math.random() * 2 - 1) * mag * 2) / 2;
      shakeY += Math.round((Math.random() * 2 - 1) * mag * 2) / 2;
    }

    const bgCamX = engine.mode === 'title' ? Math.round(this.time * 18) : camX;
    const bgCamY = engine.mode === 'title' ? Math.round(Math.sin(this.time * 0.45) * 3) : camY;

    // 1. Multi-layer Parallax Backdrop (Planes 0..4 responding to bgCamX / bgCamY)
    drawEnhancedBackdrop(ctx, room.biome, room.gx, room.gy, bgCamX, bgCamY, this.time, engine);
    drawBiomeDecorBackdrop(ctx, room.biome, bgCamX, bgCamY, this.time);

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 2. Room Slide Transition or Active Scrolling World (Plane 5)
    if (engine.transitionTimer > 0 && engine.prevRoomSnapshot) {
      const t = 1 - engine.transitionTimer / 0.24;
      const ease = 1 - (1 - t) * (1 - t);
      const ox = engine.transitionDir.dx * VIRTUAL_WIDTH;
      const oy = engine.transitionDir.dy * VIRTUAL_HEIGHT;

      ctx.save();
      ctx.translate(Math.round(-ox * ease) - camX, Math.round(-oy * ease) - camY);
      this.drawRoomProps(ctx, engine.prevRoomSnapshot, meta, engine.player.x, engine.player.y, camX, camY);
      drawEnhancedTiles(ctx, engine.prevRoomSnapshot, engine, this.time, camX, camY);
      ctx.restore();

      ctx.save();
      ctx.translate(Math.round(ox * (1 - ease)) - camX, Math.round(oy * (1 - ease)) - camY);
      this.drawRoomProps(ctx, room, meta, engine.player.x, engine.player.y, camX, camY);
      drawEnhancedTiles(ctx, room, engine, this.time, camX, camY);
      this.drawEntities(ctx, engine);
      this.drawPlayer(ctx, engine);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(-camX, -camY);
      this.drawRoomProps(ctx, room, meta, engine.player.x, engine.player.y, camX, camY);
      this.drawBossArenaFloorSigil(ctx, room, engine);
      drawEnhancedTiles(ctx, room, engine, this.time, camX, camY);
      drawEnhancedTilePolish(ctx, room, this.time, camX, camY);
      this.drawWaterReflections(ctx, engine, camX, camY);
      this.drawContactShadows(ctx, engine);
      this.drawRiftRings(ctx, engine);
      this.drawEntities(ctx, engine);
      this.drawGrappleTether(ctx, engine);
      this.drawBeams(ctx, engine);
      this.drawProjectiles(ctx, engine);
      this.drawReplayGhost(ctx, engine);
      this.drawGhosts(ctx, engine);
      this.drawEchoClone(ctx, engine);
      this.drawPlayer(ctx, engine);
      this.drawSpiritCompanion(ctx, engine);
      this.drawShockwaves(ctx, engine);
      this.drawImpactSlashes(ctx, engine);
      this.drawParticles(ctx, engine);
      this.drawFloatingTexts(ctx, engine);
      this.drawAdditiveGlows(ctx, engine, camX, camY);
      ctx.restore();
    }

    ctx.restore();

    // 3. Darkness & Dynamic Light Pass (screen-space with camera offset)
    if (room.dark) {
      this.drawDarknessPass(ctx, engine, camX, camY);
    }

    // 4. Plane 6: Foreground 1.35x Parallax Framing & Spores/Embers
    drawEnhancedForeground(ctx, room.biome, this.time, engine, bgCamX, bgCamY);
    drawBiomeDecorForeground(ctx, room.biome, bgCamX, this.time);

    // 4b. Cinematic light shafts, drifting motes and color grade
    this.drawCinematicPass(ctx, meta.accent, bgCamX, bgCamY);

    // 4c. Tactile Combat Screen FX (hit-flash burst, damage vignette, chromatic split, overdrive aura, speedlines)
    this.drawCombatScreenFX(ctx, engine, camX, camY);

    // 5. Subtle Atmospheric Vignette & Biome Color Wash
    ctx.fillStyle = meta.accent + '06';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    const vig = ctx.createRadialGradient(
      VIRTUAL_WIDTH * 0.5,
      VIRTUAL_HEIGHT * 0.5,
      96,
      VIRTUAL_WIDTH * 0.5,
      VIRTUAL_HEIGHT * 0.5,
      208
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(4,2,10,0.36)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 6. Death / Respawn Pixel Wipe
    if (engine.wipeMode !== 'none') {
      const prog =
        engine.wipeMode === 'out'
          ? 1 - engine.wipeTimer / 0.45
          : engine.wipeTimer / 0.3;
      const barH = Math.ceil((VIRTUAL_HEIGHT / 2) * Math.max(0, Math.min(1, prog)));
      ctx.fillStyle = '#09080f';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, barH);
      ctx.fillRect(0, VIRTUAL_HEIGHT - barH, VIRTUAL_WIDTH, barH);
    }

    ctx.restore();
  }

  /** Soft elliptical shadows under the player and grounded entities for depth. */
  private drawContactShadows(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const room = engine.currentRoom;
    const isOpen = (tx: number, ty: number) => {
      if (tx < 0 || ty < 0 || tx >= room.cols || ty >= room.rows) return false;
      const tv = room.tiles[ty * room.cols + tx];
      return tv === TileType.EMPTY || tv === TileType.WATER;
    };
    const shadowAt = (cx: number, footY: number, w: number) => {
      let ty = Math.floor(footY / TILE_SIZE);
      const tx = Math.floor(cx / TILE_SIZE);
      for (let i = 0; i < 6 && ty < room.rows; i++, ty++) {
        if (!isOpen(tx, ty)) {
          const dist = ty * TILE_SIZE - footY;
          const a = Math.max(0, 0.42 - dist * 0.012);
          if (a <= 0.02) return;
          const sw = w * (1 - dist * 0.01);
          ctx.fillStyle = `rgba(4,2,12,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx, ty * TILE_SIZE, sw / 2, 1.6, 0, 0, Math.PI * 2);
          ctx.fill();
          return;
        }
      }
    };
    const p = engine.player;
    if (!p.dead) shadowAt(p.x + p.w / 2, p.y + p.h, p.w + 4);
    for (const e of engine.liveEntities) {
      if (e.collected || e.state === 'dead' || e.w > 28) continue;
      shadowAt(e.x + e.w / 2, e.y + e.h, Math.min(16, e.w + 2));
    }
  }

  /** Real-time scanline-rippled mirrored water reflections & surface shimmer glints. */
  private drawWaterReflections(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    camX: number,
    camY: number
  ): void {
    const room = engine.currentRoom;
    const minC = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const maxC = Math.min(room.cols - 1, Math.ceil((camX + VIRTUAL_WIDTH) / TILE_SIZE) + 1);
    const minR = Math.max(1, Math.floor(camY / TILE_SIZE) - 1);
    const maxR = Math.min(room.rows - 1, Math.ceil((camY + VIRTUAL_HEIGHT) / TILE_SIZE) + 1);

    // Quick gather of visible water surface spans
    const waterSpans: { sx: number; ex: number; sy: number }[] = [];
    for (let ty = minR; ty <= maxR; ty++) {
      let spanStart = -1;
      for (let tx = minC; tx <= maxC; tx++) {
        const cur = room.tiles[ty * room.cols + tx];
        const above = room.tiles[(ty - 1) * room.cols + tx];
        const isSurf = cur === TileType.WATER && above !== TileType.WATER;
        if (isSurf && spanStart < 0) {
          spanStart = tx;
        } else if (!isSurf && spanStart >= 0) {
          waterSpans.push({ sx: spanStart * TILE_SIZE, ex: tx * TILE_SIZE, sy: ty * TILE_SIZE });
          spanStart = -1;
        }
      }
      if (spanStart >= 0) {
        waterSpans.push({ sx: spanStart * TILE_SIZE, ex: (maxC + 1) * TILE_SIZE, sy: ty * TILE_SIZE });
      }
    }
    if (waterSpans.length === 0) return;

    const p = engine.player;
    const hero = getHeroDef(p.heroId);
    const pcx = p.x + p.w * 0.5;
    const pBottom = p.y + p.h;

    ctx.save();
    for (const sp of waterSpans) {
      // Shimmering foam crest & harmonic wave glints
      const spanW = sp.ex - sp.sx;
      ctx.fillStyle = 'rgba(205, 248, 255, 0.35)';
      ctx.fillRect(sp.sx, snapHalf(sp.sy + 0.5), spanW, 0.5);
      for (let rx = sp.sx + 2; rx < sp.ex - 4; rx += 10) {
        const waveOff = Math.sin(this.time * 4.5 + rx * 0.12) * 1.5;
        ctx.fillStyle = ((rx + Math.floor(this.time * 8)) % 20 < 10) ? 'rgba(255,255,255,0.45)' : 'rgba(110,231,255,0.28)';
        ctx.fillRect(snapHalf(rx + waveOff), snapHalf(sp.sy + 2.5), 4, 0.5);
      }

      // Mirrored scanline reflection of nearby player hero
      if (!p.dead && pcx >= sp.sx - 12 && pcx <= sp.ex + 12) {
        const dist = sp.sy - pBottom;
        if (dist >= -6 && dist < 44) {
          const fade = Math.max(0.12, 0.42 - Math.max(0, dist) * 0.008);
          for (let slice = 0; slice < 6; slice++) {
            const ry = sp.sy + 2 + slice * 1.5;
            const ripX = Math.sin(this.time * 9 + slice * 1.3 + sp.sy) * (1.2 + slice * 0.35);
            const rw = Math.max(3, 8 - slice * 0.6);
            ctx.fillStyle = colorWithAlpha(slice < 2 ? hero.accentColor : hero.secondaryColor, fade * (1 - slice * 0.14));
            ctx.fillRect(snapHalf(pcx - rw * 0.5 + ripX), snapHalf(ry), rw, 1);
          }
        }
      }

      // Reflected light columns from luminous entities near the water's edge
      for (const e of engine.liveEntities) {
        if (e.collected || e.state === 'dead') continue;
        const k = e.def.kind;
        const ecx = e.x + e.w * 0.5;
        if (ecx < sp.sx - 16 || ecx > sp.ex + 16) continue;
        const edist = sp.sy - (e.y + e.h);
        if (edist < -4 || edist > 52) continue;
        let rCol: string | null = null;
        if (k === 'campfire' || (k === 'torch' && e.state === 'lit')) rCol = '#ff9444';
        else if (k === 'quest_beacon') rCol = e.state === 'lit' ? '#52e5ff' : '#ffd27d';
        else if (k === 'chapter_goal' || k === 'blessing_shrine') rCol = '#ffe066';
        else if (k === 'relic' || k === 'winged_relic') rCol = '#ff6688';
        if (!rCol) continue;
        for (let s = 0; s < 5; s++) {
          const rip = Math.sin(this.time * 7 + s * 1.6 + ecx * 0.1) * (1 + s * 0.4);
          ctx.fillStyle = colorWithAlpha(rCol, 0.32 - s * 0.05);
          ctx.fillRect(snapHalf(ecx - 4 + s * 0.4 + rip), snapHalf(sp.sy + 2 + s * 2), Math.max(2, 8 - s), 1);
        }
      }
    }
    ctx.restore();
  }

  /** Screen-space god rays, parallax motes and a gentle split-tone grade. */
  private drawCinematicPass(ctx: CanvasRenderingContext2D, accent: string, camX: number, camY: number): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const raySpan = VIRTUAL_WIDTH + 140;
    for (let i = 0; i < 4; i++) {
      const raw = i * 97 - camX * 0.15 + this.time * 4;
      const base = (((raw % raySpan) + raySpan) % raySpan) - 70;
      const pulse = 0.042 + 0.025 * Math.sin(this.time * 0.7 + i * 1.7);
      // Warm overhead source halo for each volumetric shaft
      drawCachedGlow(ctx, base + 9, 4, 24, accent, pulse * 2.2, 0.7);
      const g = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
      g.addColorStop(0, `rgba(255,242,220,${(pulse * 1.55).toFixed(3)})`);
      g.addColorStop(0.55, colorWithAlpha(accent, pulse * 0.55));
      g.addColorStop(1, 'rgba(255,240,220,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(base, -4);
      ctx.lineTo(base + 18 + i * 4, -4);
      ctx.lineTo(base + 70 + i * 6, VIRTUAL_HEIGHT);
      ctx.lineTo(base + 34, VIRTUAL_HEIGHT);
      ctx.closePath();
      ctx.fill();
      // Fine internal light filament inside shaft
      ctx.strokeStyle = `rgba(255,250,235,${(pulse * 0.85).toFixed(3)})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(base + 8 + i * 1.5, -2);
      ctx.lineTo(base + 50 + i * 3, VIRTUAL_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < 36; i++) {
      const depth = 0.28 + (i % 5) * 0.12;
      const mx = ((i * 53.7 - camX * depth + Math.sin(this.time * 0.4 + i) * 12) % VIRTUAL_WIDTH + VIRTUAL_WIDTH) % VIRTUAL_WIDTH;
      const my = ((i * 31.3 - camY * depth - this.time * (3 + (i % 4))) % VIRTUAL_HEIGHT + VIRTUAL_HEIGHT) % VIRTUAL_HEIGHT;
      const tw = 0.28 + 0.44 * (0.5 + 0.5 * Math.sin(this.time * 2.2 + i * 2.1));
      const rx = snapHalf(mx);
      const ry = snapHalf(my);
      const col = i % 3 === 0 ? accent : '#fff6e0';
      if (i % 6 === 0) {
        drawCachedGlow(ctx, rx, ry, 4, col, tw * 0.45, 1, true);
        if (tw > 0.58) drawMicroSparkle(ctx, rx, ry, 1.5, col, tw * 0.85);
      } else {
        ctx.fillStyle = colorWithAlpha(col, tw);
        ctx.fillRect(rx, ry, i % 5 === 0 ? 1 : 0.5, i % 5 === 0 ? 1 : 0.5);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const grade = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    grade.addColorStop(0, 'rgba(255,205,155,0.24)');
    grade.addColorStop(0.55, 'rgba(128,128,128,0)');
    grade.addColorStop(1, 'rgba(38,56,145,0.32)');
    ctx.fillStyle = grade;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    ctx.restore();
  }



  private drawRoomProps(
    ctx: CanvasRenderingContext2D,
    room: RoomDef,
    meta: BiomeMeta,
    px = 0,
    py = 0,
    camX = 0,
    camY = 0
  ): void {
    const roomHeightPx = room.rows * TILE_SIZE;
    for (const pr of room.props ?? []) {
      const x = pr.tx * TILE_SIZE;
      const y = pr.ty * TILE_SIZE;
      const hPx = (pr.h ?? 6) * TILE_SIZE;
      if (
        x + 48 < camX ||
        x - 48 > camX + VIRTUAL_WIDTH ||
        y + hPx + 24 < camY ||
        y - 24 > camY + VIRTUAL_HEIGHT
      ) {
        continue;
      }
      this.drawSingleProp(ctx, pr, x, y, hPx, roomHeightPx, meta, px, py);
    }
  }

  private drawSingleProp(
    ctx: CanvasRenderingContext2D,
    pr: RoomPropDef,
    x: number,
    y: number,
    hPx: number,
    roomHeightPx: number,
    meta: BiomeMeta,
    px: number,
    py: number
  ): void {
    const pulseOn = Math.sin(this.time * 3.6 + x * 0.25) > 0;
    const flick = Math.floor(this.time * 11 + x) % 3;

    if (pr.kind === 'pillar') {
      // Fluted ancient column with stepped capital, basal plinth, vine/moss cracks & pulsing runic glyphs
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 2, y, 12, hPx);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x - 1, y + 3, 10, hPx - 6);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x, y + 4, 8, hPx - 8);
      // Carved vertical flutes (triple-rib relief)
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x + 1, y + 5, 1, hPx - 10);
      ctx.fillRect(x + 4, y + 5, 1, hPx - 10);
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x + 2, y + 5, 1, hPx - 10);
      ctx.fillRect(x + 6, y + 5, 1, hPx - 10);
      // Horizontal masonry seams & weathering
      for (let sy = y + 10; sy < y + hPx - 6; sy += 8) {
        ctx.fillStyle = meta.tileShadow;
        ctx.fillRect(x, sy, 8, 1);
      }
      // Ornate Stepped Capital & Pedestal with Brass Rivets
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 4, y, 16, 5);
      ctx.fillRect(x - 4, y + hPx - 5, 16, 5);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x - 3, y + 1, 14, 3);
      ctx.fillRect(x - 3, y + hPx - 4, 14, 3);
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x - 3, y + 1, 14, 1);
      ctx.fillRect(x - 3, y + hPx - 4, 14, 1);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 3, y + 2, 2, 1);
      ctx.fillRect(x + 3, y + hPx - 3, 2, 1);
      // Mid-shaft glowing carved rune
      const midY = y + (hPx >> 1);
      ctx.fillStyle = pulseOn ? '#ffffff' : meta.secondaryAccent;
      ctx.fillRect(x + 3, midY - 1, 2, 3);
      ctx.fillStyle = meta.accent + '88';
      ctx.fillRect(x + 2, midY, 4, 1);
    } else if (pr.kind === 'arch') {
      // Monumental Vaulted Stone Archway with voussoir blocks, hanging moss/chains & swinging censer wick
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 2, y, 8, hPx);
      ctx.fillRect(x + 26, y, 8, hPx);
      ctx.fillRect(x - 2, y - 1, 36, 9);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x - 1, y + 1, 6, hPx - 2);
      ctx.fillRect(x + 27, y + 1, 6, hPx - 2);
      ctx.fillRect(x, y, 32, 7);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x, y + 2, 4, hPx - 4);
      ctx.fillRect(x + 28, y + 2, 4, hPx - 4);
      ctx.fillRect(x + 2, y + 1, 28, 4);
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x + 1, y, 30, 1);
      ctx.fillRect(x, y + 2, 1, hPx - 4);
      ctx.fillRect(x + 28, y + 2, 1, hPx - 4);
      // Voussoir block seams across lintel
      ctx.fillStyle = meta.tileOutline;
      for (let vx = x + 6; vx <= x + 26; vx += 5) {
        ctx.fillRect(vx, y + 1, 1, 4);
      }
      // Carved Keystone, Twin Corner Corbels & Hanging Swaying Spark Charm
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 14, y - 1, 4, 7);
      ctx.fillRect(x + 4, y + 6, 4, 3);
      ctx.fillRect(x + 24, y + 6, 4, 3);
      ctx.fillStyle = pulseOn ? '#ffffff' : meta.secondaryAccent;
      ctx.fillRect(x + 15, y + 1, 2, 2);
      const wickSway = Math.round(Math.sin(this.time * 2.8 + x) * 1);
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x + 15 + wickSway, y + 7, 2, 4);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + 15 + wickSway, y + 10, 2, 2);
    } else if (pr.kind === 'window' || pr.kind === 'stained_window') {
      const isStained = pr.kind === 'stained_window';
      const w = isStained ? 22 : 16;
      // Stepped gothic lancet frame with deep jamb shadow & carved sill
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x, y + 2, w + 4, hPx - 1);
      ctx.fillRect(x + 3, y - 2, w - 2, 5);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x + 1, y + 3, w + 2, hPx - 3);
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x, y + hPx - 2, w + 4, 2);
      ctx.fillRect(x + 1, y + hPx - 3, w + 2, 1);
      if (isStained) {
        const halfW = (w - 4) >> 1;
        const halfH = (hPx - 8) >> 1;
        // 4-pane jeweled cathedral stained glass + diamond sun crest
        ctx.fillStyle = '#2563ebaa';
        ctx.fillRect(x + 4, y + 4, halfW, halfH);
        ctx.fillStyle = '#e11d48aa';
        ctx.fillRect(x + 4 + halfW, y + 4, halfW, halfH);
        ctx.fillStyle = '#f59e0baa';
        ctx.fillRect(x + 4, y + 4 + halfH, halfW, halfH);
        ctx.fillStyle = '#10b981aa';
        ctx.fillRect(x + 4 + halfW, y + 4 + halfH, halfW, halfH);
        // Sparkling top arch jewel
        ctx.fillStyle = pulseOn ? '#ffffffdd' : '#fde047cc';
        ctx.fillRect(x + 2 + (w >> 1) - 1, y, 2, 3);
        // Volumetric diagonal god-ray + drifting gold pollen dust motes
        ctx.fillStyle = meta.accent + '20';
        ctx.beginPath();
        ctx.moveTo(x + 4, y + hPx - 3);
        ctx.lineTo(x + w, y + hPx - 3);
        ctx.lineTo(x + w + 32, roomHeightPx);
        ctx.lineTo(x + 10, roomHeightPx);
        ctx.closePath();
        ctx.fill();
        const m0 = Math.floor(this.time * 7 + x) % 14;
        ctx.fillStyle = '#ffffffaa';
        ctx.fillRect(x + 11 + m0, y + hPx + 5, 1, 1);
        ctx.fillRect(x + 22 - m0, y + hPx + 13, 1, 1);
        ctx.fillStyle = meta.secondaryAccent + 'aa';
        ctx.fillRect(x + 16 + (m0 >> 1), y + hPx + 20, 1, 1);
      } else {
        ctx.fillStyle = meta.skyMid;
        ctx.fillRect(x + 4, y + 4, w - 4, hPx - 6);
        ctx.fillStyle = meta.accent + '44';
        ctx.fillRect(x + 4, y + 4, w - 4, hPx - 8);
      }
      // Intricate Iron Tracery, Mullions & Center Rosette
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x + 2 + (w >> 1) - 1, y + 1, 2, hPx - 3);
      ctx.fillRect(x + 4, y + Math.floor(hPx * 0.46), w - 4, 2);
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x + 2 + (w >> 1) - 2, y + Math.floor(hPx * 0.46) - 2, 4, 5);
      ctx.fillStyle = '#ffffffaa';
      ctx.fillRect(x + 5, y + 5, 2, 6);
      ctx.fillRect(x + 2 + (w >> 1) - 1, y + Math.floor(hPx * 0.46) - 1, 2, 3);
    } else if (pr.kind === 'banner') {
      const sway = Math.round(Math.sin(this.time * 3.6 + x * 0.3) * 1.3);
      // Iron Wall Mount + Spear Crossbar with Golden Acorn Finials
      ctx.fillStyle = '#090712';
      ctx.fillRect(x - 3, y - 1, 14, 3);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 2, y, 12, 1);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x - 3, y - 1, 2, 3);
      ctx.fillRect(x + 9, y - 1, 2, 3);
      // Layered Cloth Drape with Crease Highlights + Gold Fringe Trim
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 1, y + 2, 10, hPx - 5);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x, y + 2, 8, hPx - 6);
      ctx.fillStyle = '#ffffff2a';
      ctx.fillRect(x + 1, y + 3, 2, hPx - 8);
      ctx.fillStyle = '#00000044';
      ctx.fillRect(x + 6, y + 2, 2, hPx - 6);
      // Embroidered Royal Crest Diamond & Border Piping
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x, y + 3, 8, 1);
      ctx.fillRect(x, y + hPx - 6, 8, 1);
      ctx.fillStyle = meta.secondaryAccent;
      ctx.fillRect(x + 3, y + 6, 2, Math.max(4, hPx - 14));
      ctx.fillRect(x + 2, y + 9, 4, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3, y + 9, 2, 1);
      // Animated Fluttering Swallowtail Ribbon Tips
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + sway, y + hPx - 5, 3, 4);
      ctx.fillRect(x + 5 + sway, y + hPx - 5, 3, 4);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + sway, y + hPx - 2, 2, 1);
      ctx.fillRect(x + 6 + sway, y + hPx - 2, 2, 1);
    } else if (pr.kind === 'lantern') {
      const sway = Math.round(Math.sin(this.time * 2.6 + x) * 1.2);
      // Warm conical light spill underneath hanging lantern
      ctx.fillStyle = '#ff992218';
      ctx.beginPath();
      ctx.moveTo(x + sway, y + hPx);
      ctx.lineTo(x + 8 + sway, y + hPx);
      ctx.lineTo(x + 15 + sway, y + hPx + 20);
      ctx.lineTo(x - 7 + sway, y + hPx + 20);
      ctx.closePath();
      ctx.fill();
      // Iron Wall Bracket + Linked Hanging Chain
      ctx.fillStyle = '#140f1d';
      ctx.fillRect(x + 3, y, 2, Math.max(4, hPx - 11));
      ctx.fillStyle = '#6b758f';
      ctx.fillRect(x + 1, y, 6, 2);
      ctx.fillRect(x + 3, y + 3, 2, 2);
      // Ornate Stepped Lantern Cage + Flickering Flame Core + Rising Spark
      ctx.fillStyle = '#090712';
      ctx.fillRect(x - 1 + sway, y + hPx - 11, 10, 11);
      ctx.fillStyle = '#4c4668';
      ctx.fillRect(x + sway, y + hPx - 10, 8, 2);
      ctx.fillRect(x + sway, y + hPx - 2, 8, 2);
      ctx.fillStyle = '#8b93ab';
      ctx.fillRect(x + 1 + sway, y + hPx - 10, 6, 1);
      ctx.fillStyle = flick === 0 ? '#ff6622' : flick === 1 ? '#ffaa33' : '#ffd24d';
      ctx.fillRect(x + 1 + sway, y + hPx - 8, 6, 6);
      ctx.fillStyle = '#fff9c4';
      ctx.fillRect(x + 3 + sway, y + hPx - 7 + (flick === 2 ? -1 : 0), 2, 4);
      // Iron cage ribs across glass
      ctx.fillStyle = '#140f1d';
      ctx.fillRect(x + 1 + sway, y + hPx - 8, 1, 6);
      ctx.fillRect(x + 6 + sway, y + hPx - 8, 1, 6);
      const spY = Math.floor(this.time * 14 + x) % 6;
      ctx.fillStyle = '#ffe066bb';
      ctx.fillRect(x + 4 + sway, y + hPx - 12 - spY, 1, 1);
    } else if (pr.kind === 'brazier') {
      // Heavy Wrought-Iron Tripod Bowl + Glowing Charcoal Bed + 3-Layer Roaring Fire & Embers
      ctx.fillStyle = '#090712';
      ctx.fillRect(x - 1, y + 8, 18, 8);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x + 1, y + 13, 3, 3);
      ctx.fillRect(x + 12, y + 13, 3, 3);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x + 1, y + 10, 14, 4);
      ctx.fillStyle = '#9aa3bd';
      ctx.fillRect(x, y + 8, 16, 2);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + 3, y + 11, 2, 2);
      ctx.fillRect(x + 7, y + 11, 2, 2);
      ctx.fillRect(x + 11, y + 11, 2, 2);
      // Live animated flames & floating ash sparks
      ctx.fillStyle = '#ff3b1a';
      ctx.fillRect(x + 2, y + 4 + (flick === 0 ? 1 : 0), 12, 4);
      ctx.fillStyle = '#ff9922';
      ctx.fillRect(x + 4, y + 1 + (flick === 1 ? 1 : 0), 8, 6);
      ctx.fillStyle = '#fff5aa';
      ctx.fillRect(x + 6, y + 2 + (flick === 2 ? -1 : 0), 4, 4);
      const emberY = Math.floor(this.time * 16 + x) % 9;
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(x + 4 + (flick * 2), y - emberY, 1, 1);
      ctx.fillStyle = '#ff8833';
      ctx.fillRect(x + 10 - flick, y - ((emberY + 4) % 9), 1, 1);
    } else if (pr.kind === 'waterfall') {
      const flow = Math.floor(this.time * 36) % 12;
      ctx.fillStyle = '#0c3e5e88';
      ctx.fillRect(x - 2, y, 16, hPx);
      ctx.fillStyle = '#1875ab99';
      ctx.fillRect(x, y, 12, hPx);
      ctx.fillStyle = '#5eead4aa';
      ctx.fillRect(x + 2, y, 8, hPx);
      // Fast Multi-Strand Vertical Foam Streaks
      ctx.fillStyle = '#e6fbffdd';
      for (let sy = (flow % 8) - 4; sy < hPx - 3; sy += 7) {
        if (sy >= 0) {
          ctx.fillRect(x + 2, y + sy, 2, 5);
          ctx.fillRect(x + 6, y + ((sy + 3) % Math.max(8, hPx - 4)), 2, 4);
          ctx.fillRect(x + 9, y + ((sy + 5) % Math.max(8, hPx - 4)), 1, 3);
        }
      }
      // Top Crest Lip + Tumbling Splash Mist Clouds & Spray Droplets at Bottom
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 12, 2);
      const f = Math.floor(this.time * 14) % 3;
      ctx.fillStyle = '#dcfafff0';
      ctx.fillRect(x - 4 - f, y + hPx - 4, 20 + f * 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 5 - f, y + hPx - 7 - (f % 2), 3, 2);
      ctx.fillRect(x + 14 + f, y + hPx - 7 - ((f + 1) % 2), 3, 2);
      ctx.fillStyle = '#a8f9ffcc';
      ctx.fillRect(x - 7 + f, y + hPx - 10 + (f % 2), 2, 2);
      ctx.fillRect(x + 17 - f, y + hPx - 11 + ((f + 1) % 2), 2, 2);
    } else if (pr.kind === 'tree_pine') {
      const sway = Math.round(Math.sin(this.time * 2 + x * 0.3) * 0.8);
      // Bark-Textured Trunk + Root Flare
      ctx.fillStyle = '#140906';
      ctx.fillRect(x + 5, y + hPx - 16, 6, 16);
      ctx.fillRect(x + 3, y + hPx - 3, 10, 3);
      ctx.fillStyle = '#5c3826';
      ctx.fillRect(x + 6, y + hPx - 15, 4, 15);
      ctx.fillStyle = '#85533a';
      ctx.fillRect(x + 6, y + hPx - 14, 1, 13);
      // 4 Lush Layered Conifer Boughs with Rim Highlight + Frost/Dew Tips
      const tierColors = [meta.tileShadow, meta.tileMain, meta.accent];
      for (let t = 0; t < 4; t++) {
        const ty = y + t * 9;
        const tw = 6 + t * 5;
        const txOff = x + 8 - (tw >> 1) + (t < 3 ? sway : 0);
        ctx.fillStyle = meta.tileOutline;
        ctx.fillRect(txOff - 1, ty, tw + 2, 10);
        ctx.fillStyle = tierColors[Math.min(2, 2 - Math.floor(t / 2))];
        ctx.fillRect(txOff, ty + 1, tw, 8);
        ctx.fillStyle = meta.tileHighlight + 'aa';
        ctx.fillRect(txOff + 1, ty + 1, Math.max(2, tw - 4), 2);
        ctx.fillStyle = meta.secondaryAccent + '99';
        ctx.fillRect(txOff, ty + 7, 2, 2);
        ctx.fillRect(txOff + tw - 2, ty + 7, 2, 2);
      }
    } else if (pr.kind === 'shroom_giant') {
      // Glowing Gill Underside + Pulsing Bioluminescent Cap Spots + Drifting Spore Motes
      ctx.fillStyle = '#071c1a';
      ctx.fillRect(x + 4, y + 9, 8, Math.max(9, hPx - 9));
      ctx.fillStyle = '#255c54';
      ctx.fillRect(x + 5, y + 10, 6, Math.max(8, hPx - 10));
      ctx.fillStyle = '#52f0c4';
      ctx.fillRect(x + 6, y + 10, 2, Math.max(8, hPx - 10));
      // Umbrella Gill Rim
      ctx.fillStyle = '#091f1d';
      ctx.fillRect(x - 4, y + 3, 24, 10);
      ctx.fillRect(x, y - 1, 16, 5);
      ctx.fillStyle = '#18544f';
      ctx.fillRect(x - 3, y + 4, 22, 7);
      ctx.fillRect(x + 1, y, 14, 5);
      ctx.fillStyle = '#a8ffea';
      ctx.fillRect(x - 2, y + 10, 20, 1);
      // Pulsing Glowing Spots
      ctx.fillStyle = pulseOn ? '#ffffff' : '#7dffe2';
      ctx.fillRect(x + 3, y + 1, 9, 2);
      ctx.fillRect(x, y + 5, 3, 3);
      ctx.fillRect(x + 12, y + 5, 4, 3);
      ctx.fillRect(x + 6, y + 6, 3, 2);
      const sporeY = Math.floor(this.time * 10 + x) % 9;
      ctx.fillStyle = '#7dffe2cc';
      ctx.fillRect(x + 2, y - 2 - sporeY, 1, 1);
      ctx.fillRect(x + 13, y - 4 - ((sporeY + 4) % 9), 1, 1);
    } else if (pr.kind === 'bird_perch') {
      const dist = Math.hypot(px - x, py - y);
      const scared = dist < 36;
      const flyOff = scared ? Math.min(30, (36 - dist) * 1.45) : 0;
      const flap = scared || Math.floor(this.time * 8 + x) % 12 === 0 ? Math.floor(this.time * 18) % 2 : 0;
      const bx = Math.round(x + flyOff * 0.7);
      const by = Math.round(y + 4 - flyOff - (flap ? 1 : 0));
      ctx.fillStyle = '#09080f';
      ctx.fillRect(bx, by, 7, 5);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(bx + 1, by + 1, 5, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 2, by + 2, 2, 1);
      ctx.fillStyle = '#ffe47a';
      ctx.fillRect(bx + 6, by + 1, 2, 1);
      if (flap) {
        ctx.fillStyle = '#ffffffdd';
        ctx.fillRect(bx + 1, by - 2, 4, 2);
      }
    } else if (pr.kind === 'chain') {
      const sway = Math.round(Math.sin(this.time * 2.2 + x) * 0.9);
      for (let cy = 0; cy < hPx; cy += 4) {
        const cx = x + 3 + (cy > 14 ? sway : 0);
        ctx.fillStyle = '#0c0814';
        ctx.fillRect(cx - 1, y + cy, 4, 4);
        ctx.fillStyle = cy % 8 === 0 ? '#787194' : '#433b57';
        ctx.fillRect(cx, y + cy + 1, 2, 2);
        if (cy % 8 === 0) {
          ctx.fillStyle = '#b4accf';
          ctx.fillRect(cx, y + cy + 1, 1, 1);
        }
      }
    } else if (pr.kind === 'statue') {
      // Heroic Cloaked Sentinel Statue with Sword/Halo Motif, Pedestal Plaque & Glowing Eyes
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 2, y + 4, 16, hPx - 4);
      ctx.fillRect(x + 1, y, 10, 6);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x - 1, y + 5, 14, hPx - 6);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x + 1, y + 7, 10, hPx - 10);
      ctx.fillRect(x + 2, y + 1, 8, 6);
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x + 1, y + 7, 3, hPx - 11);
      ctx.fillRect(x + 2, y + 1, 3, 2);
      // Sword Blade Down Front + Glowing Eyes + Engraved Pedestal
      ctx.fillStyle = '#d4d9e8';
      ctx.fillRect(x + 5, y + 9, 2, Math.max(6, hPx - 14));
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 4, y + 4, 1, 1);
      ctx.fillRect(x + 7, y + 4, 1, 1);
      ctx.fillRect(x + 3, y + 9, 6, 1);
      ctx.fillRect(x - 2, y + hPx - 4, 16, 4);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + 2, y + hPx - 3, 8, 1);
    } else if (pr.kind === 'crystal_cluster') {
      const shimmer = Math.floor(this.time * 6 + x) % 3;
      ctx.fillStyle = '#090712';
      ctx.fillRect(x, y + 2, 6, 14);
      ctx.fillRect(x + 6, y + 5, 6, 11);
      ctx.fillRect(x - 3, y + 8, 4, 8);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 1, y + 3, 4, 12);
      ctx.fillRect(x + 7, y + 6, 4, 9);
      ctx.fillStyle = meta.secondaryAccent;
      ctx.fillRect(x - 2, y + 9, 2, 6);
      ctx.fillStyle = '#ffffffdd';
      ctx.fillRect(x + 2, y + 4 + shimmer, 1, 6);
      ctx.fillRect(x + 8, y + 7, 1, 4);
    } else if (pr.kind === 'ruin_tower') {
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 1, y + 3, 22, hPx - 3);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x + 1, y + 5, 18, hPx - 5);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x + 2, y + 7, 16, hPx - 9);
      // Staggered Brick Courses + Arrow-Slit Windows + Battlements
      ctx.fillStyle = meta.tileShadow;
      for (let by = y + 11; by < y + hPx - 5; by += 5) {
        ctx.fillRect(x + 2, by, 16, 1);
        ctx.fillRect(x + 2 + ((by % 10) === 0 ? 4 : 10), by - 4, 1, 4);
      }
      ctx.fillStyle = meta.tileHighlight;
      ctx.fillRect(x, y - 1, 5, 5);
      ctx.fillRect(x + 8, y - 1, 4, 5);
      ctx.fillRect(x + 15, y - 1, 5, 5);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 8, y + 13, 4, 9);
      ctx.fillStyle = pulseOn ? '#ffffffcc' : meta.secondaryAccent;
      ctx.fillRect(x + 9, y + 14, 2, 5);
    } else if (pr.kind === 'crystal_spire') {
      const glintY = y + 6 + (Math.floor(this.time * 12 + x) % Math.max(6, hPx - 14));
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x + 1, y + 5, 10, hPx - 5);
      ctx.fillRect(x + 3, y - 1, 6, 7);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 2, y + 6, 8, hPx - 6);
      ctx.fillRect(x + 4, y + 1, 4, 6);
      ctx.fillStyle = meta.secondaryAccent;
      ctx.fillRect(x + 3, y + 7, 3, Math.max(4, hPx - 12));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, glintY, 2, 3);
    } else if (pr.kind === 'hanging_vine') {
      const tipSw = Math.sin(this.time * 2.4 + x * 0.18) * 2.2;
      for (let vy = 0; vy < hPx; vy += 4) {
        const ratio = vy / Math.max(4, hPx);
        const vx = Math.round(x + 3 + tipSw * ratio);
        ctx.fillStyle = meta.tileOutline;
        ctx.fillRect(vx - 1, y + vy, 4, 4);
        ctx.fillStyle = vy % 8 === 0 ? meta.accent : meta.tileHighlight;
        ctx.fillRect(vx, y + vy, 2, 3);
        if (vy % 12 === 4) {
          ctx.fillStyle = meta.secondaryAccent;
          ctx.fillRect(vx + (vy % 24 === 4 ? -3 : 3), y + vy + 1, 3, 2);
          ctx.fillStyle = '#ffffff88';
          ctx.fillRect(vx + (vy % 24 === 4 ? -2 : 4), y + vy + 1, 1, 1);
        }
      }
      const endX = Math.round(x + 3 + tipSw);
      ctx.fillStyle = pulseOn ? '#ffffff' : meta.secondaryAccent;
      ctx.fillRect(endX, y + hPx - 2, 2, 3);
      ctx.fillStyle = meta.accent + '66';
      ctx.fillRect(endX - 1, y + hPx - 3, 4, 4);
    } else if (pr.kind === 'anvil') {
      ctx.fillStyle = '#0d090f';
      ctx.fillRect(x - 2, y + 4, 20, 12);
      ctx.fillStyle = '#3d3445';
      ctx.fillRect(x + 4, y + 11, 8, 5);
      ctx.fillStyle = '#5c5069';
      ctx.fillRect(x - 1, y + 6, 18, 5);
      ctx.fillStyle = '#a397b0';
      ctx.fillRect(x, y + 5, 15, 2);
      ctx.fillStyle = '#ff6622';
      ctx.fillRect(x + 4, y + 4, 7, 2);
      ctx.fillStyle = flick === 0 ? '#ffffff' : '#ffe066';
      ctx.fillRect(x + 5, y + 4, 5, 1);
      if (flick === 1) {
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(x + 6, y + 1, 1, 1);
      }
    } else if (pr.kind === 'obelisk') {
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x, y + 5, 14, hPx - 5);
      ctx.fillRect(x + 3, y - 1, 8, 7);
      ctx.fillStyle = meta.tileShadow;
      ctx.fillRect(x + 1, y + 6, 12, hPx - 7);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x + 2, y + 6, 8, hPx - 7);
      ctx.fillStyle = pulseOn ? '#ffffff' : meta.accent;
      ctx.fillRect(x + 5, y + 10, 4, 3);
      ctx.fillRect(x + 4, y + 16, 6, 2);
      ctx.fillRect(x + 6, y + 22, 2, 4);
      ctx.fillStyle = meta.secondaryAccent;
      ctx.fillRect(x + 5, y + 1, 4, 3);
    } else if (pr.kind === 'torii_gate') {
      ctx.fillStyle = '#12050b';
      ctx.fillRect(x, y + 9, 8, hPx - 9);
      ctx.fillRect(x + 28, y + 9, 8, hPx - 9);
      ctx.fillRect(x - 4, y + 1, 44, 7);
      ctx.fillRect(x - 1, y + 9, 38, 4);
      ctx.fillStyle = '#2a2233';
      ctx.fillRect(x - 1, y + hPx - 6, 10, 6);
      ctx.fillRect(x + 27, y + hPx - 6, 10, 6);
      ctx.fillStyle = '#cf274c';
      ctx.fillRect(x + 1, y + 7, 6, hPx - 13);
      ctx.fillRect(x + 29, y + 7, 6, hPx - 13);
      ctx.fillRect(x - 3, y + 2, 42, 5);
      ctx.fillRect(x, y + 10, 36, 2);
      ctx.fillStyle = '#ff6b8b';
      ctx.fillRect(x - 5, y, 7, 2);
      ctx.fillRect(x + 34, y, 7, 2);
      ctx.fillRect(x + 1, y + 2, 34, 1);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + 16, y + 5, 4, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 17, y + 6, 2, 2);
      const sway = Math.round(Math.sin(this.time * 4 + x) * 1.2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 9 + sway, y + 12, 2, 5);
      ctx.fillRect(x + 25 - sway, y + 12, 2, 5);
    } else if (pr.kind === 'sakura_tree') {
      const sway = Math.round(Math.sin(this.time * 2.2 + x * 0.2) * 1);
      ctx.fillStyle = '#12050b';
      ctx.fillRect(x + 12, y + hPx - 28, 10, 28);
      ctx.fillStyle = '#4f2830';
      ctx.fillRect(x + 13, y + hPx - 27, 8, 27);
      ctx.fillStyle = '#7d3e49';
      ctx.fillRect(x + 14, y + hPx - 26, 2, 25);
      ctx.fillRect(x + 7, y + hPx - 28, 20, 4);
      ctx.fillStyle = '#a32856';
      ctx.fillRect(x - 3 + sway, y + 7, 40, 19);
      ctx.fillRect(x + 3 + sway, y + 1, 28, 10);
      ctx.fillStyle = '#ff70a6';
      ctx.fillRect(x - 1 + sway, y + 5, 36, 16);
      ctx.fillRect(x + 5 + sway, y, 24, 9);
      ctx.fillStyle = '#ffd1dc';
      ctx.fillRect(x + 3 + sway, y + 2, 16, 5);
      ctx.fillRect(x + 18 + sway, y + 8, 12, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6 + sway, y + 3, 5, 2);
      const py1 = Math.floor(this.time * 16 + x) % 20;
      ctx.fillStyle = '#ffb3d1';
      ctx.fillRect(x + 5 + (py1 % 6), y + 23 + py1, 2, 1);
      ctx.fillRect(x + 25 - (py1 % 5), y + 19 + ((py1 + 10) % 20), 2, 1);
    } else if (pr.kind === 'paper_lantern') {
      const sway = Math.round(Math.sin(this.time * 2.8 + x * 0.3) * 1.2);
      ctx.fillStyle = '#2a2029';
      ctx.fillRect(x + 4, y, 2, Math.max(4, hPx - 12));
      ctx.fillStyle = '#14080f';
      ctx.fillRect(x - 1 + sway, y + hPx - 13, 12, 12);
      ctx.fillStyle = '#d93259';
      ctx.fillRect(x + sway, y + hPx - 11, 10, 8);
      ctx.fillStyle = pulseOn ? '#ffe082' : '#ffaa44';
      ctx.fillRect(x + 2 + sway, y + hPx - 10, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4 + sway, y + hPx - 9, 2, 3);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + 1 + sway, y + hPx - 12, 8, 1);
      ctx.fillRect(x + 1 + sway, y + hPx - 3, 8, 1);
      ctx.fillStyle = '#ff70a6';
      ctx.fillRect(x + 4 + sway, y + hPx - 1, 2, 4);
    } else if (pr.kind === 'coral_fan') {
      const sway = Math.round(Math.sin(this.time * 3 + x * 0.3) * 1.2);
      ctx.fillStyle = '#061a24';
      ctx.fillRect(x + 5, y + 9, 6, 15);
      ctx.fillStyle = '#ff6b9d';
      ctx.fillRect(x + 6, y + 8, 4, 16);
      ctx.fillRect(x + sway, y + 4, 16, 3);
      ctx.fillRect(x + 1 + sway, y - 1, 3, 10);
      ctx.fillRect(x + 7 + sway, y - 3, 2, 11);
      ctx.fillRect(x + 12 + sway, y, 3, 9);
      ctx.fillStyle = '#ffd1e3';
      ctx.fillRect(x + 1 + sway, y - 1, 2, 2);
      ctx.fillRect(x + 7 + sway, y - 3, 2, 2);
      ctx.fillRect(x + 13 + sway, y, 2, 2);
    } else if (pr.kind === 'kelp_strand') {
      for (let ky = 0; ky < hPx; ky += 4) {
        const wave = Math.round(Math.sin(this.time * 3.4 + ky * 0.22 + x) * 1.8);
        ctx.fillStyle = '#0c4d4a';
        ctx.fillRect(x + 2 + wave, y + ky, 4, 4);
        ctx.fillStyle = ky % 8 === 0 ? '#57f2a8' : '#26a68d';
        ctx.fillRect(x + 3 + wave, y + ky, 2, 3);
        if (ky % 8 === 0) {
          ctx.fillStyle = '#a8fff2';
          ctx.fillRect(x + 5 + wave, y + ky + 1, 2, 2);
        }
      }
      const topWave = Math.round(Math.sin(this.time * 3.4 + x) * 1.8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3 + topWave, y - 2, 2, 2);
    } else if (pr.kind === 'sunken_anchor') {
      const sway = Math.round(Math.sin(this.time * 1.8 + x) * 0.8);
      ctx.fillStyle = '#14222e';
      for (let cy = 0; cy < hPx - 14; cy += 4) {
        ctx.fillRect(x + 7 + (cy > 12 ? sway : 0), y + cy, 2, 3);
      }
      const ay = y + hPx - 16;
      const ax = x + sway;
      ctx.fillStyle = '#0a141c';
      ctx.fillRect(ax + 5, ay, 6, 15);
      ctx.fillRect(ax + 1, ay + 3, 14, 3);
      ctx.fillRect(ax, ay + 11, 16, 4);
      ctx.fillStyle = '#4c758a';
      ctx.fillRect(ax + 7, ay + 1, 2, 13);
      ctx.fillRect(ax + 2, ay + 4, 12, 1);
      ctx.fillRect(ax + 1, ay + 12, 14, 2);
      ctx.fillStyle = '#4df0c0';
      ctx.fillRect(ax + 3, ay + 11, 2, 1);
      ctx.fillRect(ax + 10, ay + 4, 2, 1);
    } else if (pr.kind === 'clock_gear') {
      const cx = x + 16;
      const cy = y + 16;
      const rad = 14;
      const spin = this.time * 1.1 * (x % 2 === 0 ? 1 : -1);
      ctx.save();
      ctx.strokeStyle = '#0d0804';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#9e6c2a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffd37a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, rad - 1, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = spin + (i * Math.PI) / 4;
        const tx = Math.round(cx + Math.cos(a) * (rad + 3));
        const ty = Math.round(cy + Math.sin(a) * (rad + 3));
        ctx.fillStyle = '#ffb84d';
        ctx.fillRect(tx - 2, ty - 2, 4, 4);
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(tx - 1, ty - 1, 2, 1);
        if (i < 4) {
          ctx.strokeStyle = '#7a511e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - Math.cos(a) * (rad - 2), cy - Math.sin(a) * (rad - 2));
          ctx.lineTo(cx + Math.cos(a) * (rad - 2), cy + Math.sin(a) * (rad - 2));
          ctx.stroke();
        }
      }
      ctx.fillStyle = '#1c120a';
      ctx.fillRect(cx - 5, cy - 5, 10, 10);
      ctx.fillStyle = '#66e6ff';
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
      ctx.restore();
    } else if (pr.kind === 'pendulum') {
      const px0 = x + 8;
      const ang = Math.sin(this.time * 2.1 + x * 0.1) * 0.36;
      const bobX = Math.round(px0 + Math.sin(ang) * (hPx - 8));
      const bobY = Math.round(y + Math.cos(ang) * (hPx - 8));
      ctx.strokeStyle = '#291c11';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px0, y);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();
      ctx.strokeStyle = '#ffd27d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px0, y);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();
      ctx.fillStyle = '#0d0804';
      ctx.fillRect(bobX - 7, bobY - 7, 14, 14);
      ctx.fillStyle = '#ffb84d';
      ctx.fillRect(bobX - 6, bobY - 6, 12, 12);
      ctx.fillStyle = '#fff5b8';
      ctx.fillRect(bobX - 3, bobY - 3, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bobX - 1, bobY - 1, 2, 2);
    } else if (pr.kind === 'floating_island') {
      const bob = Math.round(Math.sin(this.time * 2.2 + x * 0.25) * 2);
      const iy = y + bob;
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x - 1, iy + 2, 28, 7);
      ctx.fillRect(x + 3, iy + 9, 20, 5);
      ctx.fillRect(x + 8, iy + 14, 10, 6);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x, iy + 3, 26, 5);
      ctx.fillRect(x + 4, iy + 8, 18, 4);
      ctx.fillRect(x + 9, iy + 12, 8, 5);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x - 1, iy, 28, 3);
      ctx.fillStyle = '#ffffffcc';
      ctx.fillRect(x + 2, iy, 10, 1);
      ctx.fillStyle = meta.secondaryAccent;
      ctx.fillRect(x + 11, iy + 17, 4, 4);
    } else if (pr.kind === 'wind_chime') {
      const sway = Math.round(Math.sin(this.time * 4.2 + x * 0.4) * 1.4);
      ctx.fillStyle = '#3b2b1d';
      ctx.fillRect(x + 4, y, 2, 6);
      ctx.fillStyle = '#0d0804';
      ctx.fillRect(x, y + 6, 10, 7);
      ctx.fillStyle = '#ffd27d';
      ctx.fillRect(x + 1, y + 7, 8, 5);
      ctx.fillStyle = '#fff5b8';
      ctx.fillRect(x + 3, y + 8, 4, 2);
      ctx.fillStyle = meta.accent;
      ctx.fillRect(x + 3 + sway, y + 13, 4, 10);
      ctx.fillStyle = '#ffffffcc';
      ctx.fillRect(x + 4 + sway, y + 15, 2, 3);
    } else if (pr.kind === 'sun_dial') {
      ctx.fillStyle = meta.tileOutline;
      ctx.fillRect(x + 1, y + hPx - 15, 18, 15);
      ctx.fillStyle = meta.tileMain;
      ctx.fillRect(x + 2, y + hPx - 14, 16, 13);
      ctx.fillStyle = '#ffe985';
      ctx.fillRect(x - 1, y + hPx - 18, 22, 4);
      ctx.fillStyle = '#57f2a8';
      ctx.fillRect(x + 9, y + hPx - 25, 2, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 9, y + hPx - 26, 2, 2);
    } else if (pr.kind === 'rose_window') {
      const cx = x + 12;
      const cy = y + 12;
      ctx.fillStyle = meta.tileOutline;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      const colors = ['#4de1ff99', '#ff70a699', '#ffd24d99', '#57f2a899'];
      for (let q = 0; q < 4; q++) {
        ctx.fillStyle = colors[q];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 12, (q * Math.PI) / 2, ((q + 1) * Math.PI) / 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = meta.tileHighlight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.moveTo(cx - 12, cy);
      ctx.lineTo(cx + 12, cy);
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      ctx.fillStyle = '#ffffffdd';
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
      ctx.fillStyle = meta.accent + '1c';
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy + 9);
      ctx.lineTo(cx + 9, cy + 9);
      ctx.lineTo(cx + 30, roomHeightPx);
      ctx.lineTo(cx + 4, roomHeightPx);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1;
    } else if (pr.kind === 'pyramid_obelisk') {
      ctx.fillStyle = '#29170a';
      ctx.fillRect(x + 1, y + 6, 14, hPx - 6);
      ctx.fillRect(x + 4, y - 1, 8, 7);
      ctx.fillStyle = '#a36e2c';
      ctx.fillRect(x + 2, y + 7, 12, hPx - 8);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(x + 5, y + 1, 6, 6);
      ctx.fillRect(x + 5, y + 12, 6, 2);
      ctx.fillRect(x + 6, y + 18, 4, 5);
      ctx.fillStyle = '#ffffffdd';
      ctx.fillRect(x + 7, y + 2, 2, 2);
    } else if (pr.kind === 'sun_brazier') {
      ctx.fillStyle = '#261408';
      ctx.fillRect(x, y + 8, 16, 8);
      ctx.fillStyle = '#d9962b';
      ctx.fillRect(x + 1, y + 9, 14, 5);
      ctx.fillStyle = '#ffe875';
      ctx.fillRect(x + 3, y + 8, 10, 2);
      ctx.fillStyle = '#ff5511';
      ctx.fillRect(x + 2, y + 3 + (flick === 0 ? 1 : 0), 12, 6);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(x + 4, y + 1 + (flick === 1 ? 1 : 0), 8, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 2, 4, 3);
    } else if (pr.kind === 'crystal_chandelier') {
      const sway = Math.round(Math.sin(this.time * 2 + x) * 1);
      ctx.fillStyle = '#1d1033';
      ctx.fillRect(x + 11, y, 2, 8);
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(x + 2 + sway, y + 8, 20, 4);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x + 4 + sway, y + 12, 3, 8);
      ctx.fillRect(x + 10 + sway, y + 12, 4, 10);
      ctx.fillRect(x + 17 + sway, y + 12, 3, 8);
      ctx.fillStyle = '#f5d0fe';
      ctx.fillRect(x + 11 + sway, y + 19, 2, 3);
    } else if (pr.kind === 'soul_urn') {
      ctx.fillStyle = '#140b24';
      ctx.fillRect(x + 1, y + 4, 12, 12);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(x + 2, y + 5, 10, 9);
      ctx.fillStyle = '#d8b4fe';
      ctx.fillRect(x + 3, y + 3, 8, 2);
      const bob = Math.round(Math.sin(this.time * 5 + x) * 2);
      ctx.fillStyle = '#38bdf8cc';
      ctx.fillRect(x + 5, y - 4 + bob, 4, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y - 3 + bob, 2, 2);
    } else if (pr.kind === 'alchemy_vat') {
      ctx.fillStyle = '#09141c';
      ctx.fillRect(x - 1, y + 1, 18, Math.max(20, hPx - 1));
      ctx.fillStyle = '#114242';
      ctx.fillRect(x + 1, y + 5, 14, Math.max(14, hPx - 7));
      const bub = Math.floor(this.time * 16 + x) % Math.max(8, hPx - 12);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(x + 3, y + Math.max(7, hPx - 8 - bub), 3, 3);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 9, y + Math.max(7, hPx - 12 - ((bub + 6) % Math.max(8, hPx - 12))), 3, 3);
      ctx.fillStyle = '#ffffffaa';
      ctx.fillRect(x + 2, y + 7, 2, Math.max(10, hPx - 12));
      ctx.fillStyle = '#d99e30';
      ctx.fillRect(x, y + 2, 16, 3);
      ctx.fillRect(x, y + Math.max(18, hPx - 4), 16, 3);
    } else if (pr.kind === 'tesla_coil') {
      ctx.fillStyle = '#141724';
      ctx.fillRect(x + 3, y + 6, 10, hPx - 6);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 1, y + 8, 14, 3);
      ctx.fillRect(x + 1, y + 14, 14, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 2, y + 1, 12, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 2, 6, 2);
      if (Math.floor(this.time * 18 + x) % 3 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 2, y + 2, 4, 2);
        ctx.fillRect(x + 14, y + 3, 4, 2);
      }
    } else if (pr.kind === 'aurora_prism') {
      const bob = Math.round(Math.sin(this.time * 3 + x) * 2);
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(x + 2, y + 3 + bob, 12, 15);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 3, y + 4 + bob, 10, 13);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(x + 5, y + 6 + bob, 6, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 7 + bob, 2, 6);
    } else if (pr.kind === 'frost_arch') {
      ctx.fillStyle = '#0a192f';
      ctx.fillRect(x - 1, y, 6, hPx);
      ctx.fillRect(x + 27, y, 6, hPx);
      ctx.fillRect(x - 1, y, 34, 7);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x, y + 1, 4, hPx - 2);
      ctx.fillRect(x + 28, y + 1, 4, hPx - 2);
      ctx.fillRect(x + 1, y + 1, 30, 5);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(x + 3, y + 1, 26, 2);
      ctx.fillStyle = '#34d399cc';
      ctx.fillRect(x + 14, y + 3, 4, 4);
    } else if (pr.kind === 'canyon_totem') {
      ctx.fillStyle = '#290d07';
      ctx.fillRect(x + 1, y + 2, 14, hPx - 2);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 2, y + 3, 12, hPx - 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x, y + 6, 16, 4);
      ctx.fillRect(x, y + 16, 16, 4);
      ctx.fillStyle = pulseOn ? '#fef08a' : '#ef4444';
      ctx.fillRect(x + 4, y + 7, 3, 2);
      ctx.fillRect(x + 9, y + 7, 3, 2);
      ctx.fillRect(x + 6, y + 17, 4, 2);
    } else if (pr.kind === 'holo_pylon') {
      ctx.fillStyle = '#060c1a';
      ctx.fillRect(x + 2, y + 8, 12, Math.max(10, hPx - 8));
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 3, y + 9, 10, Math.max(8, hPx - 10));
      const bob = Math.round(Math.sin(this.time * 4.5 + x) * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(x + 3, y + bob, 10, 7);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 5, y + 1 + bob, 6, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 7, y + 2 + bob, 2, 3);
    } else if (pr.kind === 'marble_column') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, 16, hPx);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x + 1, y + 3, 14, hPx - 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 4, y + 4, 2, hPx - 8);
      ctx.fillRect(x + 10, y + 4, 2, hPx - 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 1, y, 18, 4);
      ctx.fillRect(x - 1, y + hPx - 4, 18, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 1, y + 1, 14, 1);
    } else if (pr.kind === 'willow_tree') {
      const sway = Math.round(Math.sin(this.time * 2.2 + x * 0.2) * 1.2);
      ctx.fillStyle = '#0b1915';
      ctx.fillRect(x + 10, y + 12, 6, Math.max(12, hPx - 12));
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x, y + 2, 26, 12);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(x + 2, y, 22, 8);
      for (let vx = 1; vx < 24; vx += 4) {
        const vh = 10 + ((vx + x) % 10);
        ctx.fillStyle = vx % 2 === 0 ? '#34d399dd' : '#5eead4bb';
        ctx.fillRect(x + vx + sway, y + 12, 2, vh);
      }
    } else if (pr.kind === 'star_satellite') {
      const bob = Math.round(Math.sin(this.time * 3 + x) * 2);
      ctx.fillStyle = '#0c1930';
      ctx.fillRect(x + 4, y + 4 + bob, 8, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 5, y + 5 + bob, 6, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x - 3, y + 6 + bob, 7, 4);
      ctx.fillRect(x + 12, y + 6 + bob, 7, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 7, y + bob, 2, 4);
      if (Math.floor(this.time * 8 + x) % 2 === 0) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(x + 7, y - 1 + bob, 2, 2);
      }
    } else if (pr.kind === 'twilight_lotus') {
      ctx.fillStyle = '#1d0b33';
      ctx.fillRect(x + 1, y + 8, 14, 8);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(x - 1, y + 5, 6, 7);
      ctx.fillRect(x + 11, y + 5, 6, 7);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 3, y + 2, 10, 9);
      ctx.fillStyle = pulseOn ? '#ffffff' : '#fde047';
      ctx.fillRect(x + 7, y + 3, 2, 4);
    }
  }

  private drawBossArenaFloorSigil(
    ctx: CanvasRenderingContext2D,
    room: RoomDef,
    engine: GameEngine
  ): void {
    const activeBoss = engine.liveEntities.find((e) => isBossKind(e.def.kind) && e.state !== 'dead');
    if (!activeBoss || !isBossKind(activeBoss.def.kind)) return;
    const bMeta = getAnyBossMeta(activeBoss.def.kind);
    const cx = Math.round(room.cols * TILE_SIZE * 0.5);
    const cy = Math.round(room.rows * TILE_SIZE * 0.52);
    const hpPct = activeBoss.hp / Math.max(1, activeBoss.maxHp);
    const bossPhase = hpPct <= 0.35 ? 3 : hpPct <= 0.68 ? 2 : 1;
    const mainCol = bossPhase === 3 ? '#ff2e63' : bossPhase === 2 ? '#ff8833' : bMeta.accentColor;

    ctx.save();
    // Soft floor arcane aura
    const ag = ctx.createRadialGradient(cx, cy, 4, cx, cy, 56);
    ag.addColorStop(0, mainCol + '22');
    ag.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ag;
    ctx.fillRect(cx - 56, cy - 56, 112, 112);

    ctx.strokeStyle = mainCol + '48';
    ctx.lineWidth = bossPhase === 3 ? 1.5 : 1;
    const outerR = (bossPhase === 3 ? 52 : 46) + Math.sin(this.time * (bossPhase === 3 ? 4.4 : 2.6)) * 3;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = bMeta.secondaryColor + '36';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating sacred triangle/square rune polygon
    const sides = bossPhase === 3 ? 4 : 3;
    ctx.strokeStyle = mainCol + '34';
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      const rot = this.time * (pass === 0 ? 0.45 : -0.45) + (pass * Math.PI) / sides;
      for (let i = 0; i <= sides; i++) {
        const a = rot + (i * Math.PI * 2) / sides;
        const px = cx + Math.cos(a) * (outerR * 0.86);
        const py = cy + Math.sin(a) * (outerR * 0.86);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    const sigilNodes = bossPhase === 3 ? 8 : 6;
    for (let i = 0; i < sigilNodes; i++) {
      const ang = this.time * (bossPhase === 3 ? 1.7 : bossPhase === 2 ? 1.15 : 0.6) + (i * Math.PI * 2) / sigilNodes;
      const rx = cx + Math.cos(ang) * outerR;
      const ry = cy + Math.sin(ang) * outerR;
      ctx.fillStyle = (i % 2 === 0 ? bMeta.accentColor : bMeta.secondaryColor) + '99';
      ctx.fillRect(Math.round(rx) - 1.5, Math.round(ry) - 1.5, 3, 3);
    }
    ctx.restore();
  }

  private drawEntities(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const p = engine.player;
    for (const e of engine.liveEntities) {
      if (e.collected || e.state === 'open') continue;
      if (e.state === 'dead' && e.koTimer > 0.35) continue;

      const x = Math.round(e.x);
      const y = Math.round(e.y);
      const kind = e.def.kind;

      if (e.state === 'dead') {
        ctx.globalAlpha = Math.max(0, 1 - e.koTimer / 0.35);
      }

      if (this.drawNewMechanic(ctx, e, x, y)) {
        // drawn by the new-mechanics renderer
      } else if (kind === 'wind_up' || kind === 'wind_left' || kind === 'wind_right' || kind === 'wind_down') {
        ctx.fillStyle = '#a8ecff16';
        ctx.fillRect(x, y, e.w, e.h);
        const isVert = kind === 'wind_up' || kind === 'wind_down';
        for (let i = 0; i < 7; i++) {
          const span = Math.max(14, isVert ? e.h : e.w);
          const prog = (this.time * 78 + i * 21) % span;
          const base = isVert
            ? x + 2 + ((i * 13) % Math.max(4, e.w - 4))
            : y + 2 + ((i * 11) % Math.max(4, e.h - 4));
          const wave = Math.round(Math.sin(this.time * 8 + i * 1.4 + prog * 0.14) * 2);
          ctx.fillStyle = i % 2 === 0 ? '#ffffff99' : '#80e5ff77';
          if (isVert) {
            const wy = kind === 'wind_up' ? y + e.h - prog : y + prog;
            ctx.fillRect(Math.round(base + wave), Math.round(wy), 1, 5);
            ctx.fillRect(Math.round(base + wave * 0.5), Math.round(wy + (kind === 'wind_up' ? 5 : -5)), 1, 3);
          } else {
            const wx = kind === 'wind_right' ? x + prog : x + e.w - prog;
            ctx.fillRect(Math.round(wx), Math.round(base + wave), 6, 1);
            ctx.fillRect(Math.round(wx + (kind === 'wind_right' ? -4 : 6)), Math.round(base + wave * 0.5), 3, 1);
          }
        }
      } else if (kind === 'antigrav_zone') {
        ctx.fillStyle = '#a866ff16';
        ctx.fillRect(x, y, e.w, e.h);
        ctx.strokeStyle = '#d580ff66';
        ctx.strokeRect(x + 0.5, y + 0.5, e.w - 1, e.h - 1);
        for (let i = 0; i < 5; i++) {
          const oy = y + e.h - ((Math.floor(this.time * 18 + i * 24)) % Math.max(8, e.h));
          ctx.fillStyle = '#e6b3ff99';
          ctx.fillRect(x + ((i * 17 + 6) % Math.max(8, e.w - 4)), oy, 2, 2);
        }
      } else if (kind === 'lightning_zone') {
        // Tesla pylons top & bottom + branching crackling plasma arc
        ctx.fillStyle = '#120d1c';
        ctx.fillRect(x + 2, y, e.w - 4, 4);
        ctx.fillRect(x + 2, y + e.h - 4, e.w - 4, 4);
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(x + 4, y + 1, e.w - 8, 2);
        ctx.fillRect(x + 4, y + e.h - 3, e.w - 8, 2);
        const cx = x + Math.floor(e.w * 0.5);
        if (e.state === 'windup') {
          ctx.fillStyle = '#ffe06688';
          ctx.fillRect(cx - 1, y + 4, 2, e.h - 8);
          ctx.fillStyle = '#ffffffcc';
          ctx.fillRect(cx - 2, y + 4, 4, 2);
          ctx.fillRect(cx - 2, y + e.h - 6, 4, 2);
        } else if (e.state === 'active') {
          ctx.fillStyle = '#ffe06644';
          ctx.fillRect(x + 2, y + 4, e.w - 4, e.h - 8);
          ctx.strokeStyle = '#7ce8ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, y + 4);
          for (let ly = y + 8; ly < y + e.h - 4; ly += 6) {
            const jx = Math.round(Math.sin(this.time * 75 + ly * 0.7) * 4);
            ctx.lineTo(cx + jx, ly);
          }
          ctx.lineTo(cx, y + e.h - 4);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
          // Spark tips
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 2, y + 4, 4, 2);
          ctx.fillRect(cx - 2, y + e.h - 6, 4, 2);
        }
      } else if (kind === 'steam_geyser') {
        ctx.fillStyle = '#140c0f';
        ctx.fillRect(x - 1, y + 3, 14, 5);
        ctx.fillStyle = '#5c3c3c';
        ctx.fillRect(x, y + 4, 12, 4);
        ctx.fillStyle = e.state === 'windup' ? '#ff9933' : '#ffd27d';
        ctx.fillRect(x + 2, y + 4, 8, 1);
        if (e.state === 'windup') {
          const jit = Math.round(Math.sin(this.time * 48) * 1.5);
          ctx.fillStyle = '#e8f4ffbb';
          ctx.fillRect(x + 2 + jit, y - 6, 8, 7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 4 + jit, y - 5, 4, 3);
        } else if (e.state === 'active') {
          ctx.fillStyle = '#a8e6ff99';
          ctx.fillRect(x + 1, y - 38, 10, 42);
          ctx.fillStyle = '#e8f8ffcc';
          ctx.fillRect(x + 3, y - 38, 6, 41);
          for (let i = 0; i < 4; i++) {
            const py = y - ((Math.floor(this.time * 42 + i * 10)) % 38);
            const r = 4 + (i % 2) * 2;
            ctx.fillStyle = '#ffffffdd';
            ctx.fillRect(x + 6 - r, py - 2, r * 2, 4);
          }
        }
      } else if (kind === 'campfire') {
        const f = safeModIdx(this.time * 9, PROP_SPRITES.campfire.frames.length);
        // Stone hearth pit & warm glowing coals underneath
        ctx.fillStyle = 'rgba(5, 4, 12, 0.55)';
        ctx.fillRect(x - 1, y + 7, 14, 3);
        ctx.fillStyle = '#474359';
        ctx.fillRect(x - 1, y + 6, 3, 2);
        ctx.fillRect(x + 10, y + 6, 3, 2);
        ctx.fillStyle = '#ff6622';
        ctx.fillRect(x + 3, y + 7, 6, 1);
        drawPixelSprite(
          ctx,
          `campfire_${f}`,
          PROP_SPRITES.campfire.frames[f],
          PROP_SPRITES.campfire.palette,
          x + 6,
          y + 8,
          false,
          1,
          1,
          true
        );
      } else if (kind === 'torch') {
        ctx.fillStyle = '#0c0814';
        ctx.fillRect(x + 2, y + 2, 4, 7);
        ctx.fillStyle = '#73513a';
        ctx.fillRect(x + 3, y + 3, 2, 6);
        ctx.fillStyle = '#b08963';
        ctx.fillRect(x + 2, y + 3, 4, 1);
        if (e.state === 'lit') {
          const flick = Math.floor(this.time * 12 + x) % 2;
          ctx.fillStyle = '#ff6622';
          ctx.fillRect(x + 1, y - 1, 6, 4);
          ctx.fillStyle = '#ffbb44';
          ctx.fillRect(x + 2, y - 2 - flick, 4, 4);
          ctx.fillStyle = '#fff5b8';
          ctx.fillRect(x + 3, y - 1 - flick, 2, 2);
        } else {
          ctx.fillStyle = '#4a4359';
          ctx.fillRect(x + 2, y, 4, 3);
        }
      } else if (kind === 'signpost') {
        ctx.fillStyle = '#09060d';
        ctx.fillRect(x + 4, y + 4, 4, 5);
        ctx.fillRect(x, y - 1, 12, 7);
        ctx.fillStyle = '#6b4a35';
        ctx.fillRect(x + 5, y + 5, 2, 4);
        ctx.fillStyle = '#b88b67';
        ctx.fillRect(x + 1, y, 10, 5);
        ctx.fillStyle = '#e0b892';
        ctx.fillRect(x + 1, y, 10, 1);
        ctx.fillStyle = '#3b281c';
        ctx.fillRect(x + 3, y + 2, 6, 1);
        ctx.fillRect(x + 3, y + 4, 4, 1);
        // Tiny warm lantern + [E] hint when player nearby
        ctx.fillStyle = '#ffbb44';
        ctx.fillRect(x + 10, y + 1, 2, 2);
        if (Math.hypot(p.x + 4 - (e.x + 6), p.y + 5 - (e.y + 5)) < 26) {
          const bob = Math.round(Math.sin(this.time * 6) * 1.5);
          ctx.fillStyle = '#09080f';
          ctx.fillRect(x + 1, y - 12 + bob, 10, 8);
          ctx.strokeStyle = '#ffd27d';
          ctx.strokeRect(x + 1.5, y - 11.5 + bob, 9, 7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 4, y - 10 + bob, 4, 1);
          ctx.fillRect(x + 4, y - 8 + bob, 3, 1);
          ctx.fillRect(x + 4, y - 6 + bob, 4, 1);
          ctx.fillRect(x + 4, y - 10 + bob, 1, 5);
        }
      } else if (kind === 'spring_up' || kind === 'spring_left' || kind === 'spring_right') {
        const stretch = e.flash > 0 ? 4 : 0;
        ctx.fillStyle = 'rgba(5, 4, 12, 0.48)';
        ctx.fillRect(x - 1, y + 7, 14, 2);
        ctx.fillStyle = '#0e0a16';
        ctx.fillRect(x - 1, y + 4, 14, 4);
        ctx.fillStyle = '#756d8c';
        ctx.fillRect(x, y + 5, 12, 2);
        ctx.fillStyle = '#332c45';
        ctx.fillRect(x + 1, y + 5, 2, 2);
        ctx.fillRect(x + 9, y + 5, 2, 2);
        // Coiled golden piston neck
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x + 3, y + 3 - stretch, 6, 2 + stretch);
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(x + 4, y + 3 - stretch, 4, 2 + stretch);
        // Crimson padded top cap with bevels
        ctx.fillStyle = '#0e0a16';
        ctx.fillRect(x, y - 1 - stretch, 12, 5);
        ctx.fillStyle = '#b81d45';
        ctx.fillRect(x + 1, y + 2 - stretch, 10, 1);
        ctx.fillStyle = '#ff3864';
        ctx.fillRect(x + 1, y - stretch, 10, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 2, y - stretch, 6, 1);
      } else if (kind === 'bounce_shroom') {
        const sy = e.flash > 0 ? 0.78 : 1;
        ctx.fillStyle = 'rgba(5, 4, 12, 0.45)';
        ctx.fillRect(x, y + 7, 12, 2);
        drawPixelSprite(
          ctx,
          'bounce_shroom',
          PROP_SPRITES.bounce_shroom.frames[0],
          PROP_SPRITES.bounce_shroom.palette,
          x + 6,
          y + 8,
          false,
          1,
          sy,
          true
        );
      } else if (
        kind === 'dash_crystal' ||
        kind === 'double_dash_crystal' ||
        kind === 'stamina_orb' ||
        kind === 'gravity_crystal'
      ) {
        const bob = Math.round(Math.sin(this.time * 4 + x) * 2);
        const cMain =
          kind === 'dash_crystal'
            ? '#4df099'
            : kind === 'double_dash_crystal'
              ? '#ff66dd'
              : kind === 'stamina_orb'
                ? '#ffe066'
                : '#b366ff';
        const cDark =
          kind === 'dash_crystal'
            ? '#199958'
            : kind === 'double_dash_crystal'
              ? '#a8228b'
              : kind === 'stamina_orb'
                ? '#b88618'
                : '#5b22a6';
        if (e.cooldown > 0) {
          ctx.strokeStyle = cMain + '66';
          ctx.strokeRect(x + 2.5, y + 2.5 + bob, 7, 7);
        } else {
          const f = safeModIdx(this.time * 4, PROP_SPRITES.crystal.frames.length);
          drawPixelSprite(
            ctx,
            `crystal_${kind}_${f}`,
            PROP_SPRITES.crystal.frames[f],
            { o: '#08060f', c: cMain, w: '#ffffff', d: cDark },
            x + 1,
            y + 1 + bob
          );
          // 2 orbiting mini sparkle shards
          const ox = Math.round(Math.cos(this.time * 4.5 + x) * 7);
          const oy = Math.round(Math.sin(this.time * 4.5 + x) * 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 6 + ox, y + 6 + bob + oy, 1, 1);
          ctx.fillStyle = cMain;
          ctx.fillRect(x + 6 - ox, y + 6 + bob - oy, 2, 2);
        }
      } else if (kind === 'feather_aura' || kind === 'chrono_prism') {
        const col = kind === 'feather_aura' ? '#ffd24d' : '#7ce8ff';
        if (e.cooldown > 0) {
          ctx.strokeStyle = col + '55';
          ctx.strokeRect(x + 2.5, y + 2.5, 7, 7);
        } else {
          const bob = Math.round(Math.sin(this.time * 4.2) * 2);
          ctx.fillStyle = '#090712';
          ctx.fillRect(x + 2, y + 1 + bob, 8, 10);
          if (kind === 'feather_aura') {
            ctx.fillStyle = '#ff9933';
            ctx.fillRect(x + 3, y + 2 + bob, 6, 8);
            ctx.fillStyle = '#ffe47a';
            ctx.fillRect(x + 4, y + 2 + bob, 4, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 5, y + 2 + bob, 2, 8);
          } else {
            // Hourglass sapphire prism
            ctx.fillStyle = '#2a85c9';
            ctx.fillRect(x + 3, y + 2 + bob, 6, 8);
            ctx.fillStyle = '#7ce8ff';
            ctx.fillRect(x + 4, y + 3 + bob, 4, 2);
            ctx.fillRect(x + 4, y + 7 + bob, 4, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 5, y + 5 + bob, 2, 2);
          }
        }
      } else if (kind === 'zip_block') {
        const tx = e.def.tx ?? e.homeX + 80;
        const ty = e.def.ty ?? e.homeY;
        const cx0 = Math.round(e.homeX + e.w * 0.5);
        const cy0 = Math.round(e.homeY + e.h * 0.5);
        const cx1 = Math.round(tx + e.w * 0.5);
        const cy1 = Math.round(ty + e.h * 0.5);
        ctx.strokeStyle = '#332c45';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx0, cy0);
        ctx.lineTo(cx1, cy1);
        ctx.stroke();
        ctx.lineWidth = 1;
        // End-anchor cogs
        ctx.fillStyle = '#8b83a8';
        ctx.fillRect(cx0 - 2, cy0 - 2, 4, 4);
        ctx.fillRect(cx1 - 2, cy1 - 2, 4, 4);
        ctx.fillStyle = '#090712';
        ctx.fillRect(x - 1, y - 1, e.w + 2, e.h + 2);
        ctx.fillStyle = '#474359';
        ctx.fillRect(x, y, e.w, e.h);
        ctx.fillStyle = '#756f8f';
        ctx.fillRect(x, y, e.w, 2);
        ctx.fillStyle = e.state === 'active' ? '#ff477e' : '#52e5ff';
        ctx.fillRect(x + Math.floor(e.w * 0.5) - 4, y + 3, 8, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + Math.floor(e.w * 0.5) - 2, y + 4, 4, 2);
      } else if (kind === 'falling_icicle') {
        const j = e.state === 'windup' ? Math.round(Math.sin(this.time * 60)) : 0;
        ctx.fillStyle = '#091224';
        ctx.fillRect(x + 1 + j, y, 8, 7);
        ctx.fillRect(x + 3 + j, y + 7, 4, 6);
        ctx.fillStyle = '#4fa8db';
        ctx.fillRect(x + 2 + j, y, 6, 6);
        ctx.fillRect(x + 4 + j, y + 6, 2, 6);
        ctx.fillStyle = '#9ee8ff';
        ctx.fillRect(x + 2 + j, y, 4, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 3 + j, y + 1, 2, 4);
        if (e.state === 'idle' && Math.floor(this.time * 4 + x) % 6 === 0) {
          ctx.fillStyle = '#dcfaff';
          ctx.fillRect(x + 4, y + 12 + (Math.floor(this.time * 12) % 3), 1, 2);
        }
      } else if (kind === 'spinner') {
        const f = safeModIdx(this.time * 8, PROP_SPRITES.spinner.frames.length);
        drawPixelSprite(
          ctx,
          `spinner_${f}`,
          PROP_SPRITES.spinner.frames[f],
          PROP_SPRITES.spinner.palette,
          x + 1,
          y + 1
        );
      } else if (kind === 'portal_a' || kind === 'portal_b') {
        const col = kind === 'portal_a' ? '#52e5ff' : '#d580ff';
        const hi = kind === 'portal_a' ? '#b8f4ff' : '#f3c4ff';
        this.glow(ctx, x + 6, y + 7, 15, col, 0.35);
        ctx.fillStyle = '#0a0617';
        ctx.fillRect(x - 1, y - 2, 14, 18);
        ctx.fillStyle = '#473178';
        ctx.fillRect(x, y - 1, 12, 16);
        ctx.fillStyle = '#ffd27d';
        ctx.fillRect(x + 1, y, 2, 2);
        ctx.fillRect(x + 9, y, 2, 2);
        ctx.fillStyle = col;
        ctx.fillRect(x + 3, y + 2, 6, 11);
        const swirl = Math.round(Math.sin(this.time * 8) * 3);
        ctx.fillStyle = hi;
        ctx.fillRect(x + 4, y + 4 + swirl, 4, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 5 - swirl, 2, 2);
        const oa = this.time * 4 + x;
        ctx.fillStyle = hi;
        ctx.fillRect(Math.round(x + 6 + Math.cos(oa) * 8), Math.round(y + 7 + Math.sin(oa) * 9), 1, 1);
      } else if (kind === 'tether_ring' || kind === 'dash_ring' || kind === 'mag_rail' || kind === 'bubble') {
        const col =
          kind === 'bubble' ? '#66eeff' : kind === 'dash_ring' ? '#ff9944' : kind === 'mag_rail' ? '#ff5577' : '#ffe082';
        ctx.strokeStyle = '#090712';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        // Core emblem & twin orbiting spark pixels
        ctx.fillStyle = col + '88';
        ctx.fillRect(x + 5, y + 5, 2, 2);
        const ox = Math.round(Math.cos(this.time * 5 + x) * 6);
        const oy = Math.round(Math.sin(this.time * 5 + x) * 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 6 + ox, y + 6 + oy, 2, 2);
        ctx.fillStyle = col;
        ctx.fillRect(x + 6 - ox, y + 6 - oy, 2, 2);
      } else if (kind === 'key') {
        const bob = Math.round(Math.sin(this.time * 5) * 2);
        const f = safeModIdx(this.time * 4, PROP_SPRITES.key.frames.length);
        drawPixelSprite(
          ctx,
          `key_${f}`,
          PROP_SPRITES.key.frames[f],
          PROP_SPRITES.key.palette,
          x + 2,
          y + 1 + bob
        );
      } else if (kind === 'touch_switch') {
        const bob = Math.round(Math.sin(this.time * 5) * 2);
        ctx.fillStyle = '#081412';
        ctx.fillRect(x + 1, y + bob, 10, 10);
        ctx.fillStyle = '#18856b';
        ctx.fillRect(x + 2, y + 1 + bob, 8, 8);
        ctx.fillStyle = '#4df0c0';
        ctx.fillRect(x + 3, y + 2 + bob, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 3 + bob, 3, 3);
      } else if (kind === 'lock_door' || kind === 'switch_gate') {
        const isLock = kind === 'lock_door';
        const pulse = Math.floor(this.time * 4) % 2;
        ctx.fillStyle = '#0c0814';
        ctx.fillRect(x - 1, y - 1, e.w + 2, e.h + 2);
        ctx.fillStyle = isLock ? '#6e4d1e' : '#154a40';
        ctx.fillRect(x, y, e.w, e.h);
        ctx.fillStyle = isLock ? '#b88b3d' : '#2e8c7a';
        ctx.fillRect(x + 1, y + 1, e.w - 2, e.h - 2);
        ctx.fillStyle = isLock ? '#f0c46c' : '#58d9be';
        ctx.fillRect(x + 1, y + 1, e.w - 2, 2);
        // Horizontal iron bars & rivets
        for (let by = y + 5; by < y + e.h - 3; by += 6) {
          ctx.fillStyle = '#1f192e';
          ctx.fillRect(x + 1, by, e.w - 2, 1);
        }
        ctx.fillStyle = isLock ? (pulse ? '#fff2a6' : '#ffe066') : (pulse ? '#b8fff0' : '#66ffd9');
        ctx.fillRect(x + 2, y + Math.floor(e.h * 0.5) - 4, 4, 8);
        ctx.fillStyle = '#090712';
        ctx.fillRect(x + 3, y + Math.floor(e.h * 0.5) - 1, 2, 3);
      } else if (kind === 'pressure_plate') {
        ctx.fillStyle = '#090712';
        ctx.fillRect(x - 1, y + 4, 14, 4);
        ctx.fillStyle = e.state === 'active' ? '#4df0c0' : '#ff5c44';
        ctx.fillRect(x, y + (e.state === 'active' ? 6 : 5), 12, e.state === 'active' ? 2 : 3);
      } else if (kind === 'plate_bridge') {
        if (e.state === 'active') {
          ctx.fillStyle = '#0b2922';
          ctx.fillRect(x, y, e.w, 5);
          ctx.fillStyle = '#4df0c0';
          ctx.fillRect(x + 1, y + 1, e.w - 2, 2);
          ctx.fillStyle = '#ffffffaa';
          ctx.fillRect(x + 2, y + 1, e.w - 4, 1);
        } else {
          ctx.strokeStyle = '#4df0c055';
          ctx.strokeRect(x + 0.5, y + 0.5, e.w - 1, 3);
        }
      } else if (kind === 'relic' || kind === 'winged_relic') {
        const bob = Math.round(Math.sin(this.time * 4 + x) * 2);
        if (kind === 'winged_relic') {
          const flap = Math.round(Math.sin(this.time * 12) * 2);
          ctx.fillStyle = '#090712';
          ctx.fillRect(x - 5, y + 2 + bob + flap, 7, 5);
          ctx.fillRect(x + 10, y + 2 + bob + flap, 7, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - 4, y + 3 + bob + flap, 5, 3);
          ctx.fillRect(x + 11, y + 3 + bob + flap, 5, 3);
        }
        const f = safeModIdx(this.time * 4, PROP_SPRITES.relic.frames.length);
        drawPixelSprite(
          ctx,
          `relic_${f}`,
          PROP_SPRITES.relic.frames[f],
          PROP_SPRITES.relic.palette,
          x,
          y + bob
        );
      } else if (kind === 'astral_coin') {
        const bob = Math.round(Math.sin(this.time * 5 + x) * 2);
        const f = safeModIdx(this.time * 6, PROP_SPRITES.astral_coin.frames.length);
        drawPixelSprite(
          ctx,
          `astral_coin_${f}`,
          PROP_SPRITES.astral_coin.frames[f],
          PROP_SPRITES.astral_coin.palette,
          x,
          y + bob
        );
      } else if (kind === 'boost_hoop') {
        const active = e.cooldown <= 0;
        const pulse = Math.sin(this.time * 6 + x) * 1.2;
        ctx.strokeStyle = '#090712';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(x + 7, y + 9, 5 + pulse * 0.4, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = active ? '#52e5ff' : '#ffffff44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x + 7, y + 9, 5 + pulse * 0.4, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        if (active) {
          ctx.fillStyle = '#ffe47a';
          ctx.fillRect(x + 6, y, 2, 2);
          ctx.fillRect(x + 6, y + 16, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 1, y + 8, 2, 2);
          ctx.fillRect(x + 11, y + 8, 2, 2);
        }
      } else if (kind === 'blessing_shrine') {
        const ready = e.cooldown <= 0;
        ctx.fillStyle = 'rgba(5, 4, 12, 0.55)';
        ctx.fillRect(x - 1, y + 17, 18, 2);
        // Ornate stepped pedestal + rune pillars + floating gold flame crystal
        ctx.fillStyle = '#0e0a16';
        ctx.fillRect(x, y + 4, 16, 14);
        ctx.fillStyle = '#38324a';
        ctx.fillRect(x + 2, y + 5, 12, 12);
        ctx.fillStyle = '#6b6388';
        ctx.fillRect(x + 3, y + 5, 2, 11);
        ctx.fillRect(x + 11, y + 5, 2, 11);
        ctx.fillStyle = '#a9a0c7';
        ctx.fillRect(x, y + 15, 16, 3);
        ctx.fillStyle = '#ffd27d';
        ctx.fillRect(x + 6, y + 8, 4, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 7, y + 9, 2, 2);
        const bob = Math.round(Math.sin(this.time * 4) * 1.5);
        ctx.fillStyle = '#0e0a16';
        ctx.fillRect(x + 4, y - 5 + bob, 8, 9);
        ctx.fillStyle = ready ? '#ffd27d' : '#6c6882';
        ctx.fillRect(x + 5, y - 4 + bob, 6, 7);
        if (ready) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 7, y - 3 + bob, 2, 4);
        }
        // Prompt [E] when player nearby
        if (Math.hypot(p.x + 4 - (e.x + 8), p.y + 5 - (e.y + 9)) < 30) {
          const pbob = Math.round(Math.sin(this.time * 6) * 1.5);
          ctx.fillStyle = '#09080f';
          ctx.fillRect(x + 3, y - 16 + pbob, 10, 8);
          ctx.strokeStyle = '#ffd27d';
          ctx.strokeRect(x + 3.5, y - 15.5 + pbob, 9, 7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 6, y - 14 + pbob, 4, 1);
          ctx.fillRect(x + 6, y - 12 + pbob, 3, 1);
          ctx.fillRect(x + 6, y - 10 + pbob, 4, 1);
          ctx.fillRect(x + 6, y - 14 + pbob, 1, 5);
        }
      } else if (kind === 'bumper_orb') {
        const pulse = e.flash > 0 ? 2 : Math.round(Math.sin(this.time * 5 + x) * 1);
        const cx = x + 7;
        const cy = y + 7;
        ctx.fillStyle = '#0c0714';
        ctx.fillRect(cx - 6 - pulse, cy - 6 - pulse, 12 + pulse * 2, 12 + pulse * 2);
        ctx.fillStyle = e.cooldown > 0 ? '#704468' : '#ff55bb';
        ctx.fillRect(cx - 5 - pulse, cy - 5 - pulse, 10 + pulse * 2, 10 + pulse * 2);
        ctx.fillStyle = '#ffb8ee';
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, cy - 2, 3, 2);
        // 4 outer cardinal bumper studs
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(cx - 1, cy - 7 - pulse, 2, 2);
        ctx.fillRect(cx - 1, cy + 5 + pulse, 2, 2);
        ctx.fillRect(cx - 7 - pulse, cy - 1, 2, 2);
        ctx.fillRect(cx + 5 + pulse, cy - 1, 2, 2);
      } else if (kind === 'speed_pad') {
        ctx.fillStyle = '#090712';
        ctx.fillRect(x - 1, y + 3, 18, 5);
        ctx.fillStyle = '#40344f';
        ctx.fillRect(x, y + 4, 16, 3);
        const shift = Math.floor(this.time * 18) % 6;
        ctx.fillStyle = e.flash > 0 ? '#ffffff' : '#ffaa22';
        ctx.fillRect(x + 1, y + 3, 14, 2);
        ctx.fillStyle = '#ffe47a';
        ctx.fillRect(x + 1 + shift, y + 2, 4, 2);
        ctx.fillRect(x + 8 + (shift % 4), y + 2, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 2 + shift, y + 2, 1, 1);
      } else if (kind === 'treasure_chest') {
        const gleam = Math.floor(this.time * 5 + x) % 6 === 0;
        ctx.fillStyle = 'rgba(5, 4, 12, 0.52)';
        ctx.fillRect(x - 1, y + 11, 16, 2);
        ctx.fillStyle = '#0c0814';
        ctx.fillRect(x, y + 1, 14, 11);
        ctx.fillStyle = '#6e3f1f';
        ctx.fillRect(x + 1, y + 2, 12, 9);
        ctx.fillStyle = '#a86538';
        ctx.fillRect(x + 2, y + 2, 10, 3);
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(x + 1, y + 5, 12, 2);
        ctx.fillRect(x + 1, y + 2, 2, 9);
        ctx.fillRect(x + 11, y + 2, 2, 9);
        ctx.fillRect(x + 6, y + 4, 2, 4);
        ctx.fillStyle = '#52e5ff';
        ctx.fillRect(x + 6, y + 5, 2, 2);
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(x + 2, y + 2, 10, 1);
        if (gleam) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 11, y - 1, 2, 2);
          ctx.fillRect(x + 2, y + 3, 2, 1);
        }
      } else if (kind === 'checkpoint_totem') {
        const lit = e.state === 'lit';
        ctx.fillStyle = 'rgba(5, 4, 12, 0.55)';
        ctx.fillRect(x - 1, y + 15, 14, 2);
        ctx.fillStyle = '#0b0814';
        ctx.fillRect(x, y + 2, 12, 14);
        ctx.fillStyle = '#4d4666';
        ctx.fillRect(x + 1, y + 3, 10, 12);
        ctx.fillStyle = '#8b83a8';
        ctx.fillRect(x - 1, y + 13, 14, 3);
        ctx.fillRect(x + 2, y + 3, 2, 10);
        const bob = Math.round(Math.sin(this.time * 5) * 1.2);
        ctx.fillStyle = lit ? '#52e5ff' : '#7b7391';
        ctx.fillRect(x + 4, y + 5, 4, 6);
        ctx.fillRect(x + 3, y - 3 + (lit ? bob : 0), 6, 5);
        if (lit) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 5, y - 2 + bob, 2, 2);
          const orbX = Math.round(x + 6 + Math.cos(this.time * 4.5) * 7);
          const orbY = Math.round(y + 4 + Math.sin(this.time * 4.5) * 3);
          ctx.fillStyle = '#a6f6ff';
          ctx.fillRect(orbX, orbY, 2, 2);
        }
      } else if (kind === 'shield_orb') {
        const bob = Math.round(Math.sin(this.time * 4.5 + x) * 2);
        if (e.cooldown > 0) {
          ctx.strokeStyle = '#ffd24d55';
          ctx.strokeRect(x + 3, y + 3 + bob, 8, 8);
        } else {
          ctx.fillStyle = '#0c0814';
          ctx.fillRect(x + 1, y + bob, 12, 13);
          ctx.fillStyle = '#ff9922';
          ctx.fillRect(x + 2, y + 1 + bob, 10, 10);
          ctx.fillStyle = '#ffe47a';
          ctx.fillRect(x + 3, y + 2 + bob, 8, 7);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 5, y + 3 + bob, 3, 3);
          const ox = Math.round(Math.cos(this.time * 5 + x) * 7);
          ctx.fillStyle = '#ffe066';
          ctx.fillRect(x + 7 + ox, y + 6 + bob, 2, 2);
        }
      } else if (kind === 'prism_splitter') {
        const bob = Math.round(Math.sin(this.time * 4 + x) * 2);
        const cx = x + 6;
        const cy = y + 6 + bob;
        ctx.fillStyle = '#0a0814';
        ctx.fillRect(cx - 5, cy - 6, 10, 12);
        ctx.fillStyle = e.cooldown > 0 ? '#64748b' : '#ffd24d';
        ctx.fillRect(cx - 4, cy - 5, 8, 10);
        ctx.fillStyle = e.cooldown > 0 ? '#94a3b8' : '#38bdf8';
        ctx.fillRect(cx - 2, cy - 3, 4, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, cy - 2, 2, 3);
        for (let i = 0; i < 3; i++) {
          const a = this.time * 3.8 + (i * Math.PI * 2) / 3;
          ctx.fillStyle = i === 0 ? '#ff66dd' : i === 1 ? '#52e5ff' : '#ffe066';
          ctx.fillRect(Math.round(cx + Math.cos(a) * 8), Math.round(cy + Math.sin(a) * 6), 2, 2);
        }
      } else if (kind === 'gravity_vortex') {
        const cx = x + 7;
        const cy = y + 7;
        ctx.strokeStyle = '#9333eacc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 8 + Math.sin(this.time * 6) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#52e5ffdd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#090412';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
        for (let i = 0; i < 4; i++) {
          const a = -this.time * 5.2 + (i * Math.PI) / 2;
          ctx.fillStyle = i % 2 === 0 ? '#e879f9' : '#67e8f9';
          ctx.fillRect(Math.round(cx + Math.cos(a) * 6), Math.round(cy + Math.sin(a) * 6), 2, 2);
        }
      } else if (kind === 'stasis_orb') {
        const bob = Math.round(Math.sin(this.time * 4 + x) * 2);
        const cx = x + 6;
        const cy = y + 6 + bob;
        ctx.strokeStyle = '#ffd27d';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = e.cooldown > 0 ? '#475569' : '#38bdf8';
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, cy - 2, 4, 2);
        ctx.fillRect(cx - 1, cy + 1, 2, 2);
      } else if (kind === 'chapter_goal' || kind === 'summit_heart') {
        const bob = Math.round(Math.sin(this.time * 3.5) * 2);
        const locked = engine.isGoalLocked();
        if (locked) {
          ctx.globalAlpha = 0.48;
        } else {
          // Orbiting Golden Crown Halo Particles around unlocked Goal Prism / Summit Heart
          for (let i = 0; i < 4; i++) {
            const ang = this.time * 3.6 + (i * Math.PI) / 2;
            const ox = Math.round(x + 6 + Math.cos(ang) * 11);
            const oy = Math.round(y + 6 + bob + Math.sin(ang) * 7);
            ctx.fillStyle = i % 2 === 0 ? '#ffffff' : kind === 'summit_heart' ? '#67e8f9' : '#ffe066';
            ctx.fillRect(ox, oy, 2, 2);
          }
        }
        if (kind === 'chapter_goal') {
          const f = safeModIdx(this.time * 4, PROP_SPRITES.chapter_goal.frames.length);
          drawPixelSprite(
            ctx,
            `chapter_goal_${f}`,
            PROP_SPRITES.chapter_goal.frames[f],
            PROP_SPRITES.chapter_goal.palette,
            x - 1,
            y + bob
          );
        } else {
          const f = safeModIdx(this.time * 4, PROP_SPRITES.summit_heart.frames.length);
          drawPixelSprite(
            ctx,
            `summit_heart_${f}`,
            PROP_SPRITES.summit_heart.frames[f],
            PROP_SPRITES.summit_heart.palette,
            x - 1,
            y + bob
          );
        }
        ctx.globalAlpha = 1;
        if (locked) {
          const pulse = Math.sin(this.time * 8) * 1.5;
          ctx.strokeStyle = '#ff4d7dcc';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x + 6, y + 8, 12 + pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.fillStyle = '#090712';
          ctx.fillRect(x + 2, y + 14, 8, 7);
          ctx.fillStyle = '#ff4d7d';
          ctx.fillRect(x + 3, y + 15, 6, 5);
          ctx.fillStyle = '#ffd27d';
          ctx.fillRect(x + 5, y + 16, 2, 3);
        }
      } else if (kind === 'grapple_anchor') {
        const cx = x + 7;
        const cy = y + 7;
        const near = Math.hypot(p.x + 4 - cx, p.y + 5 - cy) <= 84;
        if (near) {
          ctx.strokeStyle = Math.floor(this.time * 12) % 2 === 0 ? '#52e5ffcc' : '#ffd24daa';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(cx, cy, 13 + Math.sin(this.time * 6) * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = '#090712';
        ctx.fillRect(cx - 5, cy - 5, 10, 10);
        ctx.fillStyle = near ? '#52e5ff' : '#fbbf24';
        ctx.fillRect(cx - 4, cy - 4, 8, 8);
        ctx.fillStyle = '#090712';
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
        const rot = this.time * 4.5 + x;
        for (let i = 0; i < 3; i++) {
          const a = rot + (i * Math.PI * 2) / 3;
          ctx.fillStyle = '#fde047';
          ctx.fillRect(Math.round(cx + Math.cos(a) * 6), Math.round(cy + Math.sin(a) * 6), 2, 2);
        }
      } else if (kind === 'rift_trial') {
        const completed = engine.completedRifts.has(e.def.id);
        const cx = x + 8;
        const cy = y + 9;
        ctx.strokeStyle = completed ? '#34d39966' : '#4df0c0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 7, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = completed ? '#064e3b88' : '#10b98188';
        ctx.fillRect(cx - 4, cy - 7, 8, 14);
        const sw = Math.round(Math.sin(this.time * 7) * 2);
        ctx.fillStyle = completed ? '#a7f3d0' : '#ffe066';
        ctx.fillRect(cx - 2 + sw, cy - 3, 4, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, cy - 1, 2, 2);
      } else if (kind === 'heal_orb') {
        const bob = Math.round(Math.sin(this.time * 4 + x) * 2);
        const cx = x + 6;
        const cy = y + 6 + bob;
        ctx.strokeStyle = '#34d39999';
        ctx.beginPath();
        ctx.arc(cx, cy, 7 + Math.sin(this.time * 5) * 1.2, 0, Math.PI * 2);
        ctx.stroke();
        const f = safeModIdx(this.time * 4, PROP_SPRITES.heal_orb.frames.length);
        drawPixelSprite(
          ctx,
          `heal_orb_${f}`,
          PROP_SPRITES.heal_orb.frames[f],
          PROP_SPRITES.heal_orb.palette,
          x,
          y + bob
        );
      } else if (kind === 'elemental_totem') {
        const el = (e.subType as ElementType) || 'flame';
        const em = ELEMENT_META[el] ?? ELEMENT_META.flame;
        ctx.fillStyle = 'rgba(5, 4, 12, 0.5)';
        ctx.fillRect(x, y + 12, 12, 2);
        const f = safeModIdx(this.time * 4, PROP_SPRITES.elemental_totem.frames.length);
        drawPixelSprite(
          ctx,
          `el_totem_${el}_${f}`,
          PROP_SPRITES.elemental_totem.frames[f],
          {
            ...PROP_SPRITES.elemental_totem.palette,
            c: em.color,
            g: em.color,
          },
          x,
          y
        );
        const orbA = this.time * 4 + x;
        ctx.fillStyle = em.color;
        ctx.fillRect(Math.round(x + 6 + Math.cos(orbA) * 8), Math.round(y + 4 + Math.sin(orbA) * 4), 2, 2);
      } else if (kind === 'chrono_gate') {
        // Golden-cyan twin hourglass pylons with rippling temporal curtain + caps
        const capPulse = Math.floor(this.time * 6) % 2;
        ctx.fillStyle = '#090712';
        ctx.fillRect(x, y, 4, e.h);
        ctx.fillRect(x + e.w - 4, y, 4, e.h);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 1, y + 1, 2, e.h - 2);
        ctx.fillRect(x + e.w - 3, y + 1, 2, e.h - 2);
        ctx.fillStyle = '#ffd24d';
        ctx.fillRect(x + 1, y + 1, 2, 3);
        ctx.fillRect(x + e.w - 3, y + 1, 2, 3);
        ctx.fillStyle = capPulse ? '#ffffff' : '#67e8f9';
        ctx.fillRect(x + 1, y - 1, 2, 2);
        ctx.fillRect(x + e.w - 3, y - 1, 2, 2);
        ctx.fillStyle = e.cooldown > 0 ? '#64748b44' : '#38bdf866';
        ctx.fillRect(x + 4, y + 2, Math.max(4, e.w - 8), e.h - 4);
        const scanY = y + 2 + ((Math.floor(this.time * 22) + x) % Math.max(4, e.h - 4));
        const scanY2 = y + 2 + ((Math.floor(this.time * 14) + x + 7) % Math.max(4, e.h - 4));
        ctx.fillStyle = '#ffffffdd';
        ctx.fillRect(x + 4, scanY, Math.max(4, e.w - 8), 1);
        ctx.fillStyle = '#ffe066aa';
        ctx.fillRect(x + 4, scanY2, Math.max(4, e.w - 8), 1);
      } else if (kind === 'echo_mirror') {
        const bob = Math.round(Math.sin(this.time * 3 + x) * 1.5);
        const glintY = Math.floor(this.time * 10 + x) % 10;
        ctx.fillStyle = 'rgba(5, 4, 12, 0.45)';
        ctx.fillRect(x + 1, y + 18, 12, 2);
        ctx.fillStyle = '#090712';
        ctx.fillRect(x, y + bob, 14, 18);
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(x + 1, y + 1 + bob, 12, 16);
        ctx.fillStyle = '#d8b4fe';
        ctx.fillRect(x + 1, y + 1 + bob, 12, 2);
        ctx.fillStyle = '#1d1033';
        ctx.fillRect(x + 3, y + 3 + bob, 8, 12);
        // Reflective shimmer bands + orbiting arcane spark
        ctx.fillStyle = e.cooldown > 0 ? '#64748b' : '#67e8f9';
        ctx.fillRect(x + 4, y + 4 + bob + (glintY % 7), 6, 2);
        ctx.fillStyle = '#f0abfc88';
        ctx.fillRect(x + 5, y + 9 + bob, 4, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 6, y + 1 + bob, 2, 1);
      } else if (kind === 'boss_crown_shard') {
        const bob = Math.round(Math.sin(this.time * 6 + x) * 2);
        const f = safeModIdx(this.time * 6, PROP_SPRITES.boss_crown_shard.frames.length);
        drawPixelSprite(
          ctx,
          `crown_shard_${f}`,
          PROP_SPRITES.boss_crown_shard.frames[f],
          PROP_SPRITES.boss_crown_shard.palette,
          x,
          y + bob
        );
        const ang = this.time * 6 + x;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(x + 6 + Math.cos(ang) * 7), Math.round(y + 4 + bob + Math.sin(ang) * 5), 2, 2);
      } else if (kind === 'laser_prism') {
        const cx = x + 7;
        const cy = y + 7 + Math.round(Math.sin(this.time * 4 + x));
        ctx.fillStyle = 'rgba(5, 4, 12, 0.5)';
        ctx.fillRect(x + 1, y + 13, 12, 2);
        ctx.fillStyle = '#090712';
        ctx.fillRect(x + 2, y + 10, 10, 4);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 3, y + 11, 8, 2);
        ctx.fillStyle = '#ffd27d';
        ctx.fillRect(x + 4, y + 11, 6, 1);
        ctx.fillStyle = '#090712';
        ctx.fillRect(cx - 5, cy - 6, 10, 10);
        ctx.fillStyle = e.state === 'active' ? '#ff3864' : e.state === 'windup' ? '#fde047' : '#38bdf8';
        ctx.fillRect(cx - 4, cy - 5, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 2, cy - 3, 3, 3);
        const ox = Math.round(Math.cos(this.time * 6 + x) * 7);
        const oy = Math.round(Math.sin(this.time * 6 + x) * 5);
        ctx.fillStyle = e.state === 'active' ? '#ff88aa' : '#67e8f9';
        ctx.fillRect(cx + ox, cy + oy, 2, 2);
      } else if (kind === 'npc') {
        this.drawNpc(ctx, e, p.x, p.y);
      } else if (kind.startsWith('enemy_') || isBossKind(kind)) {
        this.drawEnemy(ctx, e, p.x, p.y);
      }

      ctx.globalAlpha = 1;
    }
  }

  private glow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, a = 0.5): void {
    drawCachedGlow(ctx, cx, cy, r, color, a, 1, true);
  }

  /** Renders the newer mechanics. Returns true when handled. */
  private drawNewMechanic(ctx: CanvasRenderingContext2D, e: LiveEntity, x: number, y: number): boolean {
    const kind = e.def.kind as string;
    const t = this.time;
    if (kind === 'jump_orb') {
      const bob = Math.sin(t * 3 + x) * 2;
      const cx = x + 6, cy = y + 6 + bob;
      if (e.cooldown > 0) {
        ctx.strokeStyle = '#7fd8ff55';
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.stroke();
        return true;
      }
      this.glow(ctx, cx, cy, 14, '#7fd8ff', 0.45);
      ctx.fillStyle = '#1b4d7a'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7fd8ff'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e6f8ff'; ctx.fillRect(Math.round(cx) - 2, Math.round(cy) - 3, 2, 2);
      // upward chevron
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 1);
      ctx.fillRect(Math.round(cx) - 2, Math.round(cy), 1, 1);
      ctx.fillRect(Math.round(cx) + 2, Math.round(cy), 1, 1);
      for (let i = 0; i < 3; i++) {
        const a = t * 2 + (i * Math.PI * 2) / 3;
        ctx.fillStyle = '#bfefff';
        ctx.fillRect(Math.round(cx + Math.cos(a) * 7), Math.round(cy + Math.sin(a) * 7), 1, 1);
      }
      return true;
    }
    if (kind === 'cannon_barrel') {
      const dir = e.def.dir ?? 1;
      const cx = x + 7, cy = y + 7;
      const charging = e.state === 'active';
      this.glow(ctx, cx, cy, charging ? 20 : 13, '#ffb347', charging ? 0.6 : 0.3);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(dir * -0.6 + (charging ? Math.sin(t * 60) * 0.06 : 0));
      ctx.fillStyle = '#3a1e10'; ctx.fillRect(-7, -6, 14, 12);
      ctx.fillStyle = '#8a4b22'; ctx.fillRect(-6, -5, 12, 10);
      ctx.fillStyle = '#c47a3a'; ctx.fillRect(-6, -5, 12, 2);
      ctx.fillStyle = '#ffd27a'; ctx.fillRect(-7, -6, 2, 12); ctx.fillRect(3, -6, 2, 12);
      ctx.fillStyle = '#1a0d06'; ctx.fillRect(dir > 0 ? 5 : -8, -3, 3, 6);
      ctx.fillStyle = '#fff1c0'; ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
      if (e.flash > 0) this.glow(ctx, cx + dir * 8, cy - 5, 16, '#fff1c0', e.flash * 3);
      return true;
    }
    if (kind === 'phase_veil') {
      const flick = 0.5 + 0.5 * Math.sin(t * 6);
      const g = ctx.createLinearGradient(x, 0, x + e.w, 0);
      g.addColorStop(0, '#c48bff00');
      g.addColorStop(0.5, e.flash > 0 ? '#ffffffcc' : '#c48bff88');
      g.addColorStop(1, '#c48bff00');
      ctx.fillStyle = g;
      ctx.fillRect(x - 2, y, e.w + 4, e.h);
      for (let i = 0; i < 6; i++) {
        const py = y + ((t * 22 + i * 13) % e.h);
        ctx.fillStyle = i % 2 ? '#f0dcff' : '#c48bff';
        ctx.globalAlpha = 0.5 + flick * 0.5;
        ctx.fillRect(x + 1 + (i % 3) * 2, Math.round(py), 1, 3);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#5a2e8a'; ctx.fillRect(x - 1, y - 2, e.w + 2, 2); ctx.fillRect(x - 1, y + e.h, e.w + 2, 2);
      ctx.fillStyle = '#e8c8ff'; ctx.fillRect(x + 1, y - 2, e.w - 2, 1);
      return true;
    }
    if (kind === 'rocket_pack') {
      const bob = Math.sin(t * 3.5 + x) * 1.5;
      const cx = x + 6, cy = y + 6 + bob;
      if (e.cooldown > 0) { ctx.globalAlpha = 0.25; }
      this.glow(ctx, cx, cy, 13, '#ff9d5c', 0.4);
      ctx.fillStyle = '#4a2a1a'; ctx.fillRect(cx - 4, cy - 5, 8, 9);
      ctx.fillStyle = '#d9663a'; ctx.fillRect(cx - 3, cy - 4, 6, 7);
      ctx.fillStyle = '#ffd0a0'; ctx.fillRect(cx - 3, cy - 4, 6, 1);
      ctx.fillStyle = '#9aa3b8'; ctx.fillRect(cx - 4, cy + 3, 3, 2); ctx.fillRect(cx + 1, cy + 3, 3, 2);
      const fl = 2 + Math.round(Math.random() * 2);
      ctx.fillStyle = '#ffe066'; ctx.fillRect(cx - 3, cy + 5, 1, fl); ctx.fillRect(cx + 2, cy + 5, 1, fl);
      ctx.globalAlpha = 1;
      return true;
    }
    if (kind === 'pulse_fan') {
      const on = e.state === 'active';
      if (on) {
        ctx.fillStyle = '#9ff7ff12';
        ctx.fillRect(x, y, e.w, e.h - 6);
        for (let i = 0; i < 9; i++) {
          const prog = (t * 110 + i * 17) % (e.h - 6);
          ctx.fillStyle = i % 2 ? '#ffffff99' : '#9ff7ff77';
          ctx.fillRect(x + 2 + ((i * 7) % (e.w - 4)), Math.round(y + e.h - 6 - prog), 1, 5);
        }
      }
      const by = y + e.h - 6;
      ctx.fillStyle = '#1d2433'; ctx.fillRect(x, by, e.w, 6);
      ctx.fillStyle = '#4b5a78'; ctx.fillRect(x + 1, by + 1, e.w - 2, 1);
      const spin = t * (on ? 24 : 3);
      for (let b = 0; b < 4; b++) {
        const bx = x + e.w / 2 + Math.cos(spin + b * 1.57) * (e.w / 2 - 3);
        ctx.fillStyle = on ? '#bff8ff' : '#6b7a99';
        ctx.fillRect(Math.round(bx) - 1, by + 2, 3, 2);
      }
      ctx.fillStyle = on ? '#6cff9a' : '#ff5c6c';
      ctx.fillRect(x + 1, by + 4, 2, 1);
      if (on) this.glow(ctx, x + e.w / 2, by, 16, '#9ff7ff', 0.35);
      return true;
    }
    if (kind === 'star_shard') {
      if (e.collected) return true;
      const bob = Math.sin(t * 4 + x * 0.3) * 1.5;
      const cx = Math.round(x + 4), cy = Math.round(y + 4 + bob);
      this.glow(ctx, cx, cy, 10, '#fff1a8', 0.5 + 0.2 * Math.sin(t * 5 + x));
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(cx - 1, cy - 3, 2, 6);
      ctx.fillRect(cx - 3, cy - 1, 6, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, cy - 1, 2, 2);
      return true;
    }
    if (kind === 'quest_beacon') {
      const lit = e.state === 'lit';
      const bob = Math.round(Math.sin(t * 4.5 + x * 0.2) * 1.5);
      const pulse = 0.5 + 0.5 * Math.sin(t * 6);
      const cx = x + 7;
      // Stone pedestal & gothic obelisk silhouette
      ctx.fillStyle = '#090712';
      ctx.fillRect(x + 1, y + 4, 12, 16);
      ctx.fillRect(x - 1, y + 16, 16, 4);
      ctx.fillStyle = '#2d2642';
      ctx.fillRect(x + 2, y + 5, 10, 14);
      ctx.fillRect(x, y + 17, 14, 2);
      ctx.fillStyle = '#534973';
      ctx.fillRect(x + 2, y + 5, 3, 12);
      // Astral brazier crystal
      const gemY = y + (lit ? 2 + bob : 4);
      this.glow(ctx, cx, gemY + 3, lit ? 22 : 12, lit ? '#52e5ff' : '#ffd24d', lit ? 0.65 : 0.35 + pulse * 0.15, 1, true);
      ctx.fillStyle = '#090712';
      ctx.fillRect(cx - 4, gemY - 1, 8, 8);
      ctx.fillStyle = lit ? '#52e5ff' : '#ff9933';
      ctx.fillRect(cx - 3, gemY, 6, 6);
      ctx.fillStyle = lit ? '#e6fbff' : '#ffe47a';
      ctx.fillRect(cx - 2, gemY + 1, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 1, gemY + 1, 2, 2);
      if (lit) {
        // Ascending astral waystone light pillar & orbiting sparks
        const beam = ctx.createLinearGradient(0, y - 34, 0, gemY + 2);
        beam.addColorStop(0, 'rgba(82,229,255,0)');
        beam.addColorStop(1, 'rgba(82,229,255,0.45)');
        ctx.fillStyle = beam;
        ctx.fillRect(cx - 3, y - 34, 6, 36);
        for (let i = 0; i < 3; i++) {
          const a = t * 4 + (i * Math.PI * 2) / 3;
          ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#ffe066';
          ctx.fillRect(Math.round(cx + Math.cos(a) * 8), Math.round(gemY + 3 + Math.sin(a) * 4), 2, 2);
        }
      } else {
        // Unlit quest exclamation rune marker
        const my = y - 8 + bob;
        ctx.fillStyle = '#090712';
        ctx.fillRect(cx - 2, my, 4, 7);
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(cx - 1, my + 1, 2, 3);
        ctx.fillRect(cx - 1, my + 5, 2, 1);
      }
      return true;
    }
    if (kind === 'lore_tablet') {
      const read = e.state === 'lit';
      const cx = x + 7;
      ctx.fillStyle = '#090712';
      ctx.fillRect(x + 1, y + 1, 12, 15);
      ctx.fillRect(x, y + 13, 14, 3);
      ctx.fillStyle = '#2b3248';
      ctx.fillRect(x + 2, y + 2, 10, 13);
      ctx.fillStyle = '#566487';
      ctx.fillRect(x + 2, y + 2, 10, 2);
      ctx.fillStyle = read ? '#67e8f9' : '#38bdf8';
      ctx.fillRect(x + 4, y + 5, 6, 1);
      ctx.fillRect(x + 4, y + 7, 4, 1);
      ctx.fillRect(x + 4, y + 9, 6, 1);
      ctx.fillRect(x + 5, y + 11, 4, 1);
      if (read) {
        drawMicroSparkle(ctx, cx, y - 3 + Math.sin(t * 4) * 1.5, 2, '#67e8f9', 0.85);
      } else {
        this.glow(ctx, cx, y + 7, 12, '#38bdf8', 0.35 + 0.15 * Math.sin(t * 5));
      }
      return true;
    }
    return false;
  }

  private drawNpc(ctx: CanvasRenderingContext2D, e: LiveEntity, px: number, py: number): void {
    const x = Math.round(e.x);
    const y = Math.round(e.y);
    const id = e.def.npcId ?? 'vespera';
    const sprite = NPC_SPRITES[id] ?? NPC_SPRITES.vespera;
    const frameIdx = safeModIdx(this.time * 4 + x * 0.1, sprite.frames.length);
    const flip = px < x;

    // Grounded contact drop shadow under NPC
    ctx.fillStyle = 'rgba(5, 4, 12, 0.45)';
    ctx.fillRect(x, y + 7, 12, 2);

    drawPixelSprite(
      ctx,
      `npc_${id}_${frameIdx}`,
      sprite.frames[frameIdx],
      sprite.palette,
      x + 6,
      y + 8,
      flip,
      1,
      1,
      true
    );

    if (Math.hypot(px - x, py - y) < 28) {
      const bob = Math.round(Math.sin(this.time * 6) * 1.5);
      ctx.fillStyle = '#09080f';
      ctx.fillRect(x + 1, y - 16 + bob, 10, 9);
      ctx.strokeStyle = sprite.palette.h ?? '#ffd27d';
      ctx.strokeRect(x + 1.5, y - 15.5 + bob, 9, 8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 4, y - 13 + bob, 4, 1);
      ctx.fillRect(x + 4, y - 11 + bob, 3, 1);
      ctx.fillRect(x + 4, y - 9 + bob, 4, 1);
      ctx.fillRect(x + 4, y - 13 + bob, 1, 5);
    }
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, e: LiveEntity, px: number, py: number): void {
    const x = Math.round(e.x);
    const y = Math.round(e.y);
    const k = e.def.kind;
    const white = e.flash > 0;

    if (k === 'enemy_drone' && e.state === 'windup') {
      ctx.strokeStyle = '#ff3366bb';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6);
      ctx.lineTo(px + 4, py + 5);
      ctx.stroke();
    } else if (k === 'enemy_laser_eye' && e.state === 'windup') {
      const pulse = Math.floor(this.time * 24) % 2 === 0;
      ctx.strokeStyle = pulse ? '#ff2e63cc' : '#ffe066cc';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6);
      ctx.lineTo(Math.round(x + 6 + e.vx * 115), Math.round(y + 6 + e.vy * 115));
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 5, 2, 2);
    } else if (k === 'enemy_phantom' && e.state === 'windup') {
      ctx.strokeStyle = '#52e5ffbb';
      ctx.beginPath();
      ctx.arc(Math.round(e.vx + 6), Math.round(e.vy + 6), 6 + Math.sin(this.time * 20) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (k === 'enemy_spark_beetle' && e.state === 'windup') {
      const sp = Math.floor(this.time * 20) % 2;
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x - 3 - sp, y + 2, 2, 2);
      ctx.fillRect(x + 15 + sp, y + 2, 2, 2);
      ctx.fillRect(x + 6, y - 4 - sp, 2, 2);
    } else if (k === 'enemy_magma_wyrm' && e.state === 'windup') {
      const spout = Math.floor(this.time * 18) % 3;
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(x + 2, Math.round(e.homeY) - 2 - spout, 8, 3);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 4, Math.round(e.homeY) - 4 - spout, 4, 2);
    } else if (k === 'enemy_sand_wraith' && e.state === 'windup') {
      ctx.strokeStyle = '#fbbf24cc';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 7 + Math.sin(this.time * 18) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (k === 'enemy_bone_knight') {
      // Gleaming frontal shield indicator
      const shieldX = e.dir >= 0 ? x + e.w : x - 3;
      ctx.fillStyle = e.state === 'windup' ? '#fde047' : '#94a3b8';
      ctx.fillRect(shieldX, y + 2, 3, e.h - 3);
    } else if (k === 'enemy_alchemist' && e.state === 'windup') {
      ctx.fillStyle = '#34d399';
      ctx.fillRect(x + 4, y - 4, 4, 4);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 5, y - 3, 2, 2);
    } else if (k === 'enemy_frost_valkyrie' && e.state === 'windup') {
      ctx.strokeStyle = '#38bdf8cc';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6);
      ctx.lineTo(px + 4, py + 5);
      ctx.stroke();
    } else if (k === 'enemy_mirror_orb') {
      const a = this.time * 5;
      ctx.strokeStyle = '#e879f9aa';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(x + 6 + Math.cos(a) * 8), Math.round(y + 6 + Math.sin(a) * 8), 2, 2);
    } else if (k === 'enemy_rift_stalker' && e.state === 'windup') {
      ctx.strokeStyle = '#a855f7cc';
      ctx.beginPath();
      ctx.arc(Math.round((e.aimX ?? x) + 6), Math.round((e.aimY ?? y) + 6), 6 + Math.sin(this.time * 20) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (k === 'enemy_shield_phalanx') {
      const shieldX = e.dir >= 0 ? x + e.w : x - 3;
      ctx.fillStyle = e.state === 'windup' ? '#fde047' : '#f43f5e';
      ctx.fillRect(shieldX, y + 1, 3, e.h - 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(shieldX + 1, y + 3, 1, 4);
    } else if (k === 'enemy_rune_monolith') {
      if (e.state !== 'windup') {
        ctx.strokeStyle = '#14b8a6aa';
        ctx.strokeRect(x - 2, y - 2, e.w + 4, e.h + 4);
      } else {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 5, y - 4, 2, 2);
      }
    } else if (k === 'enemy_magnet_core') {
      const pull = Math.floor(this.time * 2) % 2 === 0;
      ctx.strokeStyle = pull ? '#38bdf877' : '#f43f5e77';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 12 + Math.sin(this.time * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if ((k === 'enemy_shadow_hook' || k === 'enemy_solar_acolyte' || k === 'enemy_chrono_weaver') && e.state === 'windup') {
      ctx.strokeStyle = k === 'enemy_solar_acolyte' ? '#fde047cc' : k === 'enemy_chrono_weaver' ? '#22d3eecc' : '#ef4444cc';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6);
      ctx.lineTo(px + 4, py + 5);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (k === 'enemy_star_bomber' && e.state === 'windup') {
      ctx.fillStyle = Math.floor(this.time * 20) % 2 === 0 ? '#ffffff' : '#fde047';
      ctx.fillRect(x + 4, y - 4, 4, 3);
    } else if (k === 'enemy_abyss_knight') {
      ctx.strokeStyle = '#f43f5e66';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 9, 0, Math.PI * 2);
      ctx.stroke();
    } else if (k === 'enemy_bone_pendulum') {
      ctx.strokeStyle = '#94a3b8cc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.round(e.homeX + 6), Math.round(e.homeY));
      ctx.lineTo(x + 6, y + 4);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(Math.round(e.homeX + 5), Math.round(e.homeY) - 1, 3, 3);
    } else if (k === 'enemy_soul_siphon') {
      const dist = Math.hypot(px - x, py - y);
      if (dist <= 96) {
        ctx.strokeStyle = Math.floor(this.time * 14) % 2 === 0 ? '#a855f7cc' : '#5eead4cc';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 6);
        ctx.lineTo(px + 4, py + 5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (k === 'enemy_abyss_gargoyle' && e.state === 'windup') {
      ctx.strokeStyle = '#ff2e63cc';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 6);
      ctx.lineTo(Math.round(e.aimX ?? px + 4), Math.round(e.aimY ?? py + 5));
      ctx.stroke();
    } else if (k === 'enemy_pyre_acolyte' && e.state === 'windup') {
      const gx = Math.round(e.aimX ?? px);
      const gy = Math.round(e.aimY ?? py + 8);
      ctx.fillStyle = Math.floor(this.time * 20) % 2 === 0 ? '#fb923c' : '#fde047';
      ctx.fillRect(gx - 6, gy - 2, 12, 3);
      ctx.fillRect(gx - 2, gy - 12, 4, 10);
    } else if (k === 'enemy_magma_tortoise') {
      ctx.fillStyle = '#ff4d6d';
      ctx.fillRect(x + 2, y - 1, 2, 2);
      ctx.fillRect(x + 6, y - 2, 2, 3);
      ctx.fillRect(x + 10, y - 1, 2, 2);
    } else if (k === 'enemy_soul_lantern' && e.state === 'windup') {
      ctx.strokeStyle = Math.floor(this.time * 24) % 2 === 0 ? '#ff3864ee' : '#5eead4ee';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 12 + Math.sin(this.time * 24) * 3, 0, Math.PI * 2);
      ctx.stroke();
    } else if (k === 'enemy_doom_bell' && e.state === 'windup') {
      ctx.strokeStyle = '#fbbf24cc';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 10 + Math.sin(this.time * 28) * 2, 0, Math.PI * 2);
      ctx.stroke();
    } else if (k === 'enemy_obsidian_golem_uw') {
      const shieldX = e.dir >= 0 ? x + e.w : x - 3;
      ctx.fillStyle = e.state === 'windup' ? '#ff7733' : '#a855f7';
      ctx.fillRect(shieldX, y + 1, 3, e.h - 2);
    } else if (k === 'enemy_fallen_seraph') {
      ctx.strokeStyle = e.state === 'windup' ? '#ff2e63cc' : '#fde04777';
      ctx.beginPath();
      ctx.arc(x + 6, y + 6, 10, 0, Math.PI * 2);
      ctx.stroke();
    } else if ((k === 'enemy_hellhound' || k === 'enemy_crimson_bat' || k === 'enemy_spectral_executioner') && e.state === 'windup') {
      ctx.fillStyle = '#ff3864';
      ctx.fillRect(x + 5, y - 5, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y - 4, 2, 1);
    }
    if (isBossKind(k)) {
      const bMeta = getAnyBossMeta(k);
      const cx = Math.round(x + e.w * 0.5);
      const cy = Math.round(y + e.h * 0.5);
      const hpPct = e.hp / Math.max(1, e.maxHp);
      const phase = hpPct <= 0.35 ? 3 : hpPct <= 0.68 ? 2 : 1;
      const phase2 = phase >= 2;
      const r = phase === 3 ? 25 : phase === 2 ? 22 : 19;

      // Velocity Motion Afterimage Trail (smooth steering feedback)
      if (e.trail && e.trail.length > 0) {
        const bossSprite = ENEMY_SPRITES[k];
        if (bossSprite) {
          for (let ti = 0; ti < e.trail.length; ti++) {
            const tr = e.trail[ti];
            ctx.save();
            ctx.globalAlpha = 0.14 + ti * 0.08;
            drawTintedSprite(
              ctx,
              `boss_trail_${k}`,
              bossSprite.frames[0],
              e.state === 'retreat' ? '#52e5ff' : bMeta.accentColor,
              tr.x + e.w * 0.5,
              tr.y + e.h,
              e.dir < 0,
              true
            );
            ctx.restore();
          }
        }
      }

      // Grounded shadow beneath floating/heavy bosses
      ctx.fillStyle = 'rgba(5, 4, 12, 0.48)';
      ctx.fillRect(cx - 11, y + e.h - 2, 22, 3);

      // Windup Aim Vector Telegraph (e.aimX / e.aimY) so players read every lunge cleanly
      if (e.state === 'windup' && e.aimX !== undefined && e.aimY !== undefined) {
        ctx.save();
        ctx.strokeStyle = Math.floor(this.time * 22) % 2 === 0 ? '#ffe066dd' : '#ff3864dd';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(Math.round(e.aimX + e.w * 0.5), Math.round(e.aimY + e.h * 0.5));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ff3864';
        ctx.fillRect(Math.round(e.aimX + e.w * 0.5) - 3, Math.round(e.aimY + e.h * 0.5) - 3, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(e.aimX + e.w * 0.5) - 1, Math.round(e.aimY + e.h * 0.5) - 1, 2, 2);
        ctx.restore();
      }

      // Guard-Broken STAGGERED Halo & Recover Vulnerable Ring
      if (e.bossSubState === 'staggered') {
        ctx.save();
        ctx.strokeStyle = '#ffd24dee';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let ds = 0; ds < 3; ds++) {
          const sa = this.time * 6.5 + (ds * Math.PI * 2) / 3;
          ctx.fillStyle = ds % 2 === 0 ? '#ffe066' : '#ffffff';
          ctx.fillRect(Math.round(cx + Math.cos(sa) * 14) - 2, Math.round(y - 10 + Math.sin(sa) * 3), 3, 3);
        }
        ctx.restore();
      } else if (e.bossSubState === 'recover') {
        ctx.strokeStyle = '#52e5ffaa';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 1-Second Post-Hit Immunity Hexagonal Shield Barrier
      if ((e.hitInvulnTimer ?? 0) > 0) {
        const sr = Math.max(e.w, e.h) * 0.82;
        const rot = this.time * 4.5;
        ctx.save();
        ctx.strokeStyle = Math.floor(this.time * 20) % 2 === 0 ? '#52e5ffee' : '#ffe066ee';
        ctx.fillStyle = 'rgba(82, 229, 255, 0.14)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let hi = 0; hi < 6; hi++) {
          const ha = rot + (hi * Math.PI) / 3;
          const hx = cx + Math.cos(ha) * sr;
          const hy = cy + Math.sin(ha) * sr;
          if (hi === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Evolving Phase I / II / III Floating Boss Crown
      const crownY = y - 16 + Math.round(Math.sin(this.time * 4) * 1.5);
      if (phase >= 2) {
        ctx.fillStyle = phase === 3 ? '#ff2e63' : '#ffd24d';
        ctx.fillRect(cx - 5, crownY, 10, 2);
        ctx.fillRect(cx - 5, crownY - 2, 2, 2);
        ctx.fillRect(cx - 1, crownY - (phase === 3 ? 4 : 3), 2, phase === 3 ? 4 : 3);
        ctx.fillRect(cx + 3, crownY - 2, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, crownY - 2, 2, 2);
      }

      // Phase 1/2/3 multi-ring escalation aura
      ctx.strokeStyle = phase === 3 ? 'rgba(255, 46, 99, 0.85)' : phase === 2 ? 'rgba(255, 136, 51, 0.72)' : bMeta.accentColor + '55';
      ctx.lineWidth = phase === 3 ? 2 : phase === 2 ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.sin(this.time * 6) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      if (phase === 3) {
        ctx.strokeStyle = 'rgba(255, 224, 102, 0.65)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 5 + Math.cos(this.time * 10) * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineWidth = 1;

      if (k === 'boss_sentinel') {
        for (let i = 0; i < 4; i++) {
          const a = this.time * (phase2 ? 3.1 : 1.8) + (i * Math.PI) / 2;
          const ox = Math.round(cx + Math.cos(a) * (r + 2));
          const oy = Math.round(cy + Math.sin(a) * (r - 4));
          ctx.fillStyle = '#090712';
          ctx.fillRect(ox - 3, oy - 3, 6, 6);
          ctx.fillStyle = i % 2 === 0 ? '#e8a87c' : '#ffd27d';
          ctx.fillRect(ox - 2, oy - 2, 4, 4);
        }
        if (e.state === 'windup') {
          const dir = px > cx ? 1 : -1;
          ctx.strokeStyle = '#ff4455cc';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + dir * 70, cy);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (k === 'boss_mycelium') {
        for (let i = 0; i < 5; i++) {
          const a = this.time * 2.2 + (i * Math.PI * 2) / 5;
          const rx = Math.round(cx + Math.cos(a) * (r + 3));
          const ry = Math.round(cy + Math.sin(a * 1.3) * 12);
          ctx.fillStyle = i % 2 === 0 ? '#4df0c0' : '#a7f3d0';
          ctx.fillRect(rx - 2, ry - 2, 3, 3);
        }
      } else if (k === 'boss_glacier') {
        const wingFlap = Math.round(Math.sin(this.time * 7) * 3);
        ctx.fillStyle = '#2a85c9aa';
        ctx.fillRect(cx - 22, cy - 8 + wingFlap, 10, 5);
        ctx.fillRect(cx + 12, cy - 8 + wingFlap, 10, 5);
        ctx.fillStyle = '#a6f6ffcc';
        ctx.fillRect(cx - 20, cy - 2 - wingFlap, 8, 4);
        ctx.fillRect(cx + 12, cy - 2 - wingFlap, 8, 4);
      } else if (k === 'boss_ignis_rex') {
        for (let i = 0; i < 4; i++) {
          const a = this.time * (phase2 ? 4.2 : 2.5) + (i * Math.PI) / 2;
          const sx = Math.round(cx + Math.cos(a) * 20);
          const sy = Math.round(cy + Math.sin(a) * 14);
          ctx.fillStyle = '#ff5511';
          ctx.fillRect(sx - 2, sy - 2, 5, 5);
          ctx.fillStyle = '#ffe066';
          ctx.fillRect(sx - 1, sy - 1, 3, 3);
        }
      } else if (k === 'boss_astral_oracle') {
        ctx.strokeStyle = '#52e5ff88';
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = -this.time * 2.4 + (i * Math.PI) / 2;
          const px0 = Math.round(cx + Math.cos(a) * 22);
          const py0 = Math.round(cy + Math.sin(a) * 22);
          if (i === 0) ctx.moveTo(px0, py0);
          else ctx.lineTo(px0, py0);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (k === 'boss_sovereign') {
        for (let i = 0; i < 6; i++) {
          const a = this.time * (phase2 ? 3.8 : 2.1) + (i * Math.PI) / 3;
          const rx = Math.round(cx + Math.cos(a) * r);
          const ry = Math.round(cy + Math.sin(a) * r);
          ctx.fillStyle = i % 2 === 0 ? '#ffd27d' : '#ff3864';
          ctx.fillRect(rx - 1, ry - 1, 3, 3);
        }
        if (Math.floor(this.time * 16) % 3 === 0) {
          ctx.strokeStyle = '#52e5ffaa';
          ctx.beginPath();
          ctx.moveTo(cx - 16, cy - 10);
          ctx.lineTo(cx - 8, cy - 15);
          ctx.lineTo(cx + 8, cy - 15);
          ctx.lineTo(cx + 16, cy - 10);
          ctx.stroke();
        }
      } else if (k === 'boss_sakura') {
        for (let i = 0; i < 6; i++) {
          const a = this.time * (phase2 ? 4.4 : 2.6) + (i * Math.PI) / 3;
          const ox = Math.round(cx + Math.cos(a) * (r + 2));
          const oy = Math.round(cy + Math.sin(a) * (r - 4));
          ctx.fillStyle = i % 2 === 0 ? '#ff70a6' : '#ffd1dc';
          ctx.fillRect(ox - 1, oy - 1, 3, 2);
        }
        if (e.state === 'windup') {
          const dir = px > cx ? 1 : -1;
          ctx.strokeStyle = '#ff70a6cc';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + dir * 75, cy);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (k === 'boss_leviathan') {
        for (let i = 0; i < 5; i++) {
          const a = this.time * (phase2 ? 3.2 : 1.9) + (i * Math.PI * 2) / 5;
          const rx = Math.round(cx + Math.cos(a) * (r + 3));
          const ry = Math.round(cy + Math.sin(a) * 14);
          ctx.fillStyle = '#091826';
          ctx.fillRect(rx - 2, ry - 2, 5, 5);
          ctx.fillStyle = i % 2 === 0 ? '#4de1ff' : '#ff96b8';
          ctx.fillRect(rx - 1, ry - 1, 3, 3);
        }
      } else if (k === 'boss_chronos') {
        ctx.strokeStyle = '#ffb84daa';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.stroke();
        const hrAng = this.time * (phase2 ? 3.5 : 1.6);
        const minAng = -this.time * 0.7;
        ctx.strokeStyle = '#66e6ff';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(Math.round(cx + Math.cos(hrAng) * 18), Math.round(cy + Math.sin(hrAng) * 18));
        ctx.moveTo(cx, cy);
        ctx.lineTo(Math.round(cx + Math.cos(minAng) * 14), Math.round(cy + Math.sin(minAng) * 14));
        ctx.stroke();
      } else if (k === 'boss_seraph_king') {
        const wf = Math.round(Math.sin(this.time * 8) * 3);
        ctx.fillStyle = '#57f2a8aa';
        ctx.fillRect(cx - 24, cy - 10 + wf, 12, 4);
        ctx.fillRect(cx + 12, cy - 10 + wf, 12, 4);
        ctx.fillStyle = '#ffe985cc';
        ctx.fillRect(cx - 22, cy - 3 - wf, 10, 4);
        ctx.fillRect(cx + 12, cy - 3 - wf, 10, 4);
        ctx.fillRect(cx - 18, cy + 4 + wf, 7, 3);
        ctx.fillRect(cx + 11, cy + 4 + wf, 7, 3);
      } else if (k === 'boss_sphinx') {
        for (let i = 0; i < 4; i++) {
          const a = this.time * (phase2 ? 3.4 : 2) + (i * Math.PI) / 2;
          const sx = Math.round(cx + Math.cos(a) * r);
          const sy = Math.round(cy + Math.sin(a) * 14);
          ctx.fillStyle = '#ffd24d';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
          ctx.fillStyle = '#fff5b8';
          ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }
      } else if (k === 'boss_lich') {
        for (let i = 0; i < 5; i++) {
          const a = -this.time * (phase2 ? 3.8 : 2.1) + (i * Math.PI * 2) / 5;
          const sx = Math.round(cx + Math.cos(a) * (r + 2));
          const sy = Math.round(cy + Math.sin(a) * (r - 4));
          ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#38bdf8';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }
      } else if (k === 'boss_automaton') {
        for (let i = 0; i < 4; i++) {
          const a = this.time * (phase2 ? 4.4 : 2.4) + (i * Math.PI) / 2;
          const sx = Math.round(cx + Math.cos(a) * 21);
          const sy = Math.round(cy + Math.sin(a) * 16);
          ctx.fillStyle = i % 2 === 0 ? '#34d399' : '#f472b6';
          ctx.fillRect(sx - 2, sy - 2, 5, 5);
        }
      } else if (k === 'boss_valkyrie') {
        const wf = Math.round(Math.sin(this.time * 9) * 3);
        ctx.fillStyle = '#38bdf8bb';
        ctx.fillRect(cx - 25, cy - 9 + wf, 12, 4);
        ctx.fillRect(cx + 13, cy - 9 + wf, 12, 4);
        ctx.fillStyle = '#34d399cc';
        ctx.fillRect(cx - 22, cy - 2 - wf, 10, 4);
        ctx.fillRect(cx + 12, cy - 2 - wf, 10, 4);
        ctx.fillStyle = '#f472b6aa';
        ctx.fillRect(cx - 18, cy + 5 + wf, 7, 3);
        ctx.fillRect(cx + 11, cy + 5 + wf, 7, 3);
      } else if (k === 'boss_canyon_colossus') {
        for (let i = 0; i < 4; i++) {
          const a = this.time * (phase2 ? 3.5 : 2.1) + (i * Math.PI) / 2;
          const sx = Math.round(cx + Math.cos(a) * (r + 2));
          const sy = Math.round(cy + Math.sin(a) * 14);
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(sx - 3, sy - 3, 6, 6);
          ctx.fillStyle = '#fb923c';
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        }
      } else if (k === 'boss_cyber_archon') {
        ctx.strokeStyle = '#22d3ee99';
        ctx.strokeRect(cx - 19, cy - 19, 38, 38);
        for (let i = 0; i < 4; i++) {
          const a = -this.time * 3.8 + (i * Math.PI) / 2;
          ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#f472b6';
          ctx.fillRect(Math.round(cx + Math.cos(a) * 23) - 2, Math.round(cy + Math.sin(a) * 23) - 2, 4, 4);
        }
      } else if (k === 'boss_marble_titan') {
        for (let i = 0; i < 4; i++) {
          const a = this.time * 2.2 + (i * Math.PI) / 2;
          const sx = Math.round(cx + Math.cos(a) * 22);
          const sy = Math.round(cy + Math.sin(a) * 16);
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(sx - 3, sy - 4, 6, 8);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(sx - 1, sy - 2, 2, 4);
        }
      } else if (k === 'boss_fen_hydra') {
        for (let i = 0; i < 5; i++) {
          const a = this.time * (phase2 ? 3.8 : 2.3) + (i * Math.PI * 2) / 5;
          ctx.fillStyle = i % 2 === 0 ? '#10b981' : '#a3e635';
          ctx.fillRect(Math.round(cx + Math.cos(a) * r) - 2, Math.round(cy + Math.sin(a) * 15) - 2, 4, 4);
        }
      } else if (k === 'boss_star_emperor') {
        ctx.strokeStyle = '#67e8f988';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r + 5, 9, 0.25, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = this.time * 3.6 + (i * Math.PI * 2) / 3;
          ctx.fillStyle = i === 0 ? '#fde047' : i === 1 ? '#38bdf8' : '#e879f9';
          ctx.fillRect(Math.round(cx + Math.cos(a) * (r + 3)) - 2, Math.round(cy + Math.sin(a) * 12) - 2, 4, 4);
        }
      } else if (k === 'boss_twilight_wraith') {
        for (let i = 0; i < 4; i++) {
          const a = -this.time * (phase2 ? 4.4 : 2.6) + (i * Math.PI) / 2;
          const sx = Math.round(cx + Math.cos(a) * 21);
          const sy = Math.round(cy + Math.sin(a) * 21);
          ctx.fillStyle = i % 2 === 0 ? '#c084fc' : '#f472b6';
          ctx.fillRect(sx - 2, sy - 3, 4, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - 1, sy - 1, 2, 2);
        }
      } else {
        // Distinct orbiting relics/wings & harmonic rings for all 30 new World Bosses!
        const orbs = phase === 3 ? 6 : phase === 2 ? 5 : 4;
        for (let i = 0; i < orbs; i++) {
          const a = this.time * (phase2 ? 3.8 : 2.3) + (i * Math.PI * 2) / orbs;
          const ox = Math.round(cx + Math.cos(a) * (r + 3));
          const oy = Math.round(cy + Math.sin(a) * 14);
          ctx.fillStyle = '#090712';
          ctx.fillRect(ox - 2, oy - 2, 5, 5);
          ctx.fillStyle = i % 2 === 0 ? bMeta.accentColor : '#ffffff';
          ctx.fillRect(ox - 1, oy - 1, 3, 3);
        }
        ctx.strokeStyle = bMeta.accentColor + '77';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r + 5, 8, Math.sin(this.time * 1.4) * 0.25, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (e.state === 'retreat' && e.tx !== undefined && e.ty !== undefined) {
      ctx.save();
      ctx.strokeStyle = '#52e5ff88';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x + e.w * 0.5, y + e.h * 0.5);
      ctx.lineTo(e.tx + e.w * 0.5, e.ty + e.h * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.42;
      ctx.fillStyle = '#52e5ff';
      ctx.fillRect(Math.round((x + e.tx) * 0.5), Math.round((y + e.ty) * 0.5), e.w, e.h);
      ctx.restore();
    }

    const sprite = ENEMY_SPRITES[k];
    if (!sprite) return;

    const fps = e.state === 'active' || e.state === 'windup' ? 11 : 6;
    const frameIdx = safeModIdx(this.time * fps + e.homeX, sprite.frames.length);
    const palette: PixelPalette = white
      ? Object.fromEntries(Object.keys(sprite.palette).map((key) => [key, '#ffffff']))
      : sprite.palette;
    const keySuffix = white ? 'flash' : 'norm';

    const grounded =
      k === 'enemy_crawler' ||
      k === 'enemy_charger' ||
      k === 'enemy_mortar' ||
      k === 'enemy_golem' ||
      k === 'enemy_slime_king' ||
      k === 'enemy_spark_beetle' ||
      k === 'enemy_bone_knight' ||
      k === 'enemy_alchemist' ||
      k === 'enemy_hellhound' ||
      k === 'enemy_plague_toad' ||
      k === 'enemy_magma_tortoise' ||
      k === 'enemy_obsidian_golem_uw' ||
      k === 'enemy_chain_jailer' ||
      k === 'enemy_pyre_acolyte' ||
      k === 'enemy_blood_alchemist' ||
      k === 'enemy_shadow_mimic' ||
      k === 'boss_sentinel' ||
      k === 'boss_ignis_rex' ||
      k === 'boss_sakura' ||
      k === 'boss_sphinx' ||
      k === 'boss_automaton' ||
      k === 'boss_canyon_colossus' ||
      k === 'boss_marble_titan';

    const scaleX = k === 'enemy_slime_king' && e.state === 'windup' ? 1.24 : 1;
    const scaleY = k === 'enemy_slime_king' && e.state === 'windup' ? 0.72 : 1;

    const stealthFade = k === 'enemy_ash_stalker' && e.state === 'idle';
    const bossInvulnFade = isBossKind(k) && (e.hitInvulnTimer ?? 0) > 0;
    if (stealthFade || bossInvulnFade) {
      ctx.save();
      ctx.globalAlpha = stealthFade
        ? 0.25
        : Math.floor(this.time * 24) % 2 === 0
          ? 0.54
          : 0.92;
    }

    drawPixelSprite(
      ctx,
      `${k}_${frameIdx}_${keySuffix}`,
      sprite.frames[frameIdx],
      palette,
      x + e.w * 0.5,
      grounded ? y + e.h : y + e.h,
      e.dir < 0,
      scaleX,
      scaleY,
      true
    );

    if (stealthFade || bossInvulnFade) {
      ctx.restore();
    }

    if (isBossKind(k)) {
      const bMeta = getAnyBossMeta(k);
      const barW = e.maxHp * 4 - 1;
      const startX = Math.round(x + e.w * 0.5 - barW * 0.5);
      ctx.fillStyle = '#090712';
      ctx.fillRect(startX - 1, y - 8, barW + 2, 4);
      for (let i = 0; i < e.maxHp; i++) {
        ctx.fillStyle = i < e.hp ? bMeta.accentColor : '#2c223b';
        ctx.fillRect(startX + i * 4, y - 7, 3, 2);
      }

      if ((e.hitInvulnTimer ?? 0) > 0) {
        const invPct = Math.max(0, Math.min(1, (e.hitInvulnTimer ?? 0) / 1.0));
        const ix = Math.round(x + e.w * 0.5 - 12);
        ctx.fillStyle = '#090712';
        ctx.fillRect(ix - 1, y - 12, 26, 3);
        ctx.fillStyle = '#52e5ff';
        ctx.fillRect(ix, y - 11, Math.round(24 * invPct), 1);
      }

      // Boss Posture / Stagger Bar + Weakness Gem directly beneath Boss
      const bEntry = getAnyBossBestiary(k);
      const maxStag = Math.max(1, e.maxStagger ?? bEntry?.maxStagger ?? 5);
      const stagPct = Math.max(0, Math.min(1, (e.stagger ?? 0) / maxStag));
      const stagW = 24;
      const sx = Math.round(x + e.w * 0.5 - stagW * 0.5);
      ctx.fillStyle = '#090712';
      ctx.fillRect(sx - 1, y + e.h + 2, stagW + 2, 3);
      ctx.fillStyle = e.bossSubState === 'staggered' ? '#ffffff' : '#ffd24d';
      ctx.fillRect(sx, y + e.h + 3, Math.round(stagW * stagPct), 1);

      const weakMeta = ELEMENT_META[bEntry?.weaknessElement ?? 'astral'];
      ctx.fillStyle = '#090712';
      ctx.fillRect(sx - 6, y + e.h + 1, 5, 5);
      ctx.fillStyle = weakMeta.color;
      ctx.fillRect(sx - 5, y + e.h + 2, 3, 3);
    }

    if (e.isElite && !isBossKind(k) && e.state !== 'dead') {
      const ecx = Math.round(x + e.w * 0.5);
      const bob = Math.round(Math.sin(this.time * 6 + x) * 1);
      drawCachedGlow(ctx, ecx, y + e.h * 0.5, 16, '#fb7185', 0.38, 1, false);
      // Golden Elite Guardian Crown above enemy
      ctx.fillStyle = '#090712';
      ctx.fillRect(ecx - 5, y - 6 + bob, 10, 5);
      ctx.fillStyle = '#ffd24d';
      ctx.fillRect(ecx - 4, y - 4 + bob, 8, 2);
      ctx.fillRect(ecx - 4, y - 6 + bob, 2, 2);
      ctx.fillRect(ecx - 1, y - 6 + bob, 2, 2);
      ctx.fillRect(ecx + 2, y - 6 + bob, 2, 2);
      ctx.fillStyle = '#ff3864';
      ctx.fillRect(ecx - 1, y - 4 + bob, 2, 1);
      // Crisp Elite mini HP pips
      if (e.maxHp > 1) {
        const bw = e.maxHp * 3;
        const bx = ecx - Math.floor(bw * 0.5);
        ctx.fillStyle = '#090712';
        ctx.fillRect(bx - 1, y - 10 + bob, bw + 2, 3);
        for (let hi = 0; hi < e.maxHp; hi++) {
          ctx.fillStyle = hi < e.hp ? '#fb7185' : '#2a1c36';
          ctx.fillRect(bx + hi * 3, y - 9 + bob, 2, 1);
        }
      }
    }

    if (e.elementMark) {
      const em = ELEMENT_META[e.elementMark];
      const ecx = x + e.w * 0.5;
      const ecy = y + e.h * 0.5;
      ctx.save();
      ctx.strokeStyle = em.color + '88';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ecx, ecy, Math.max(e.w, e.h) * 0.55 + Math.sin(this.time * 8) * 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      const mx = Math.round(ecx);
      const my = isBossKind(k) ? y - 14 : e.isElite ? y - 13 : y - 8;
      ctx.fillStyle = '#090712';
      ctx.fillRect(mx - 3, my - 3, 6, 6);
      ctx.fillStyle = em.color;
      ctx.fillRect(mx - 2, my - 2, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(mx - 1, my - 1, 2, 1);
    }
  }

  private drawBeams(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const b of engine.beams) {
      if (!b.active) continue;
      ctx.save();
      if (b.state === 'windup') {
        const blink = Math.floor(this.time * 24) % 2 === 0;
        ctx.strokeStyle = blink ? b.color : '#ffffffaa';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(b.x1 - 2), Math.round(b.y1 - 2), 4, 4);
      } else {
        ctx.lineCap = 'round';
        ctx.strokeStyle = b.color + '88';
        ctx.lineWidth = b.width + 6;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();

        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.width;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.5, b.width * 0.42);
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pr of engine.projectiles) {
      if (!pr.active) continue;
      if (pr.friendly && pr.pierceWalls) {
        // Soul Strike Crescent Wave rendering
        const dir = pr.vx >= 0 ? 1 : -1;
        const cx = Math.round(pr.x);
        const cy = Math.round(pr.y);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawCachedGlow(ctx, cx, cy, 14, pr.color, 0.55, 1, true);
        ctx.fillStyle = pr.color + '55';
        ctx.fillRect(cx - 6 * dir, cy - 9, 6, 18);
        ctx.fillStyle = pr.color;
        ctx.fillRect(cx - 2, cy - 8, 5, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + dir, cy - 6, 3, 12);
        ctx.restore();
        continue;
      }
      // 3-step fading silky comet trail + crisp halo
      drawCachedGlow(ctx, pr.x, pr.y, 9, pr.color, 0.45, 1, true);
      ctx.fillStyle = colorWithAlpha(pr.color, 0.25);
      ctx.fillRect(snapHalf(pr.x - pr.vx * 0.045 - 1), snapHalf(pr.y - pr.vy * 0.045 - 1), 2, 2);
      ctx.fillStyle = pr.color + '55';
      ctx.fillRect(snapHalf(pr.x - pr.vx * 0.03 - 1.5), snapHalf(pr.y - pr.vy * 0.03 - 1.5), 3, 3);
      ctx.fillStyle = pr.color + '99';
      ctx.fillRect(snapHalf(pr.x - pr.vx * 0.015 - 2), snapHalf(pr.y - pr.vy * 0.015 - 2), 4, 4);
      ctx.fillStyle = '#09080f';
      ctx.fillRect(Math.round(pr.x - 3), Math.round(pr.y - 3), 6, 6);
      ctx.fillStyle = pr.color;
      ctx.fillRect(Math.round(pr.x - 2), Math.round(pr.y - 2), 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(pr.x - 1), Math.round(pr.y - 1), 2, 2);
    }
  }

  private drawRiftRings(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    if (!engine.riftActive || engine.riftRings.length === 0) return;
    ctx.save();
    for (let i = 0; i < engine.riftRings.length; i++) {
      const ring = engine.riftRings[i];
      if (ring.collected) continue;
      const bob = Math.round(Math.sin(this.time * 5 + i) * 2);
      ctx.strokeStyle = '#090712';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y + bob, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#4df0c0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y + bob, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(ring.x - 1, ring.y - 1 + bob, 2, 2);
    }
    ctx.restore();
  }

  private drawGrappleTether(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const activeId = engine.activeGrappleId ?? engine.player.tetherId;
    if (!activeId) return;
    const anchor = engine.liveEntities.find((e) => e.def.id === activeId);
    if (!anchor) return;
    const ax = Math.round(anchor.x + anchor.w * 0.5);
    const ay = Math.round(anchor.y + anchor.h * 0.5);
    const px = Math.round(engine.player.x + engine.player.w * 0.5);
    const py = Math.round(engine.player.y + engine.player.h * 0.5);
    const isTether = Boolean(engine.player.tetherId && !engine.activeGrappleId);
    const outerCol = isTether ? '#4df0c099' : '#38bdf899';
    const leafCol = isTether ? '#34d399' : '#67e8f9';
    ctx.save();
    ctx.strokeStyle = outerCol;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Segmented botanical/astral vine nodes along tether
    const segs = 5;
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const nx = Math.round(ax + (px - ax) * t);
      const ny = Math.round(ay + (py - ay) * t);
      const side = i % 2 === 0 ? 2 : -2;
      ctx.fillStyle = leafCol;
      ctx.fillRect(nx - 1 + side, ny - 1, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(nx, ny, 1, 1);
    }

    // Active anchor halo pulse
    ctx.strokeStyle = leafCol + 'bb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ax, ay, 8 + Math.sin(this.time * 10) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawReplayGhost(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    if (!engine.ghostEnabled) return;
    const best = engine.ghostBestByRoom[engine.currentRoom.id];
    if (!best || best.frames.length === 0) return;
    const frame = sampleGhostFrame(best.frames, engine.ghostRoomClock);
    if (!frame) return;
    const set = HERO_SPRITE_SETS[engine.player.heroId] ?? HERO_SPRITE_SETS.lyra;
    const spr = set.run[Math.floor(this.time * 8) % set.run.length];
    ctx.save();
    ctx.globalAlpha = 0.36;
    drawTintedSprite(
      ctx,
      `replay_ghost_${engine.player.heroId}`,
      spr,
      '#67e8f9',
      frame.x + 4,
      frame.y + 11,
      frame.facing < 0,
      true
    );
    ctx.restore();
  }

  private drawSpiritCompanion(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    if (engine.equippedSpirit === 'none') return;
    const detailed = DETAILED_PET_MAP[engine.equippedSpirit];
    const spirit = SPIRIT_MAP[engine.equippedSpirit];
    const sx = Math.round(engine.spiritX);
    const sy = Math.round(engine.spiritY);

    if (detailed) {
      const petLv = engine.petLevels?.[engine.equippedSpirit] ?? 1;
      drawDetailedPetShowcase(ctx, detailed, this.time, sx, sy, {
        facing: engine.player.facing < 0 ? -1 : 1,
        bondLv: petLv,
        drawBackdrop: false,
        scale: 0.9,
      });
      return;
    }

    if (!spirit) return;
    const flap = Math.round(Math.sin(this.time * 12) * 1.5);
    ctx.fillStyle = '#090712';
    ctx.fillRect(sx - 4, sy - 4, 8, 8);
    ctx.fillStyle = spirit.color;
    ctx.fillRect(sx - 3, sy - 3, 6, 6);
    ctx.fillStyle = spirit.secondaryColor;
    ctx.fillRect(sx - 5, sy - 2 + flap, 2, 3);
    ctx.fillRect(sx + 3, sy - 2 + flap, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 1, sy - 1, 2, 2);
  }

  private drawEchoClone(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    if (engine.echoCloneTimer <= 0) return;
    const set = HERO_SPRITE_SETS[engine.player.heroId] ?? HERO_SPRITE_SETS.lyra;
    const spr = set.run[Math.floor(this.time * 10) % set.run.length];
    const ex = Math.round(engine.echoCloneX);
    const ey = Math.round(engine.echoCloneY);
    ctx.save();
    ctx.globalAlpha = 0.62;
    drawTintedSprite(
      ctx,
      `echo_clone_${engine.player.heroId}`,
      spr,
      '#c084fc',
      ex + 4,
      ey + 11,
      engine.echoCloneFacing < 0,
      true
    );
    ctx.strokeStyle = '#67e8f9cc';
    ctx.beginPath();
    ctx.arc(ex + 4, ey + 5, 8 + Math.sin(this.time * 9) * 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawGhosts(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const g of engine.ghosts) {
      if (!g.active) continue;
      ctx.globalAlpha = Math.max(0, Math.min(0.65, g.alpha));
      const set = HERO_SPRITE_SETS[g.heroId] ?? HERO_SPRITE_SETS.lyra;
      const frames = set[g.anim] ?? set.idle;
      const frame = frames[safeModIdx(g.frameIdx, frames.length)];
      drawTintedSprite(
        ctx,
        `ghost_${g.heroId}_${g.anim}_${g.frameIdx}`,
        frame,
        g.color,
        g.x + 4,
        g.y + 11,
        g.facing < 0,
        true
      );
    }
    ctx.globalAlpha = 1;
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const p = engine.player;
    if (p.dead) return;

    const hero = getHeroDef(p.heroId);
    const skin = getHeroSkinDef(hero.id, p.skinId);

    // Subtle grounded contact shadow when near/on floor
    if (p.onGround) {
      ctx.fillStyle = 'rgba(5, 4, 12, 0.48)';
      ctx.fillRect(Math.round(p.x - 2), Math.round(p.y + p.h - 1), 12, 2);
    }

    p.pendingRelics.forEach((_r, idx) => {
      const fx = Math.round(p.x - p.facing * (12 + idx * 10));
      const fy = Math.round(p.y - 6 + Math.sin(this.time * 6 + idx) * 2);
      drawPixelSprite(
        ctx,
        'pending_relic',
        PROP_SPRITES.relic.frames[0],
        PROP_SPRITES.relic.palette,
        fx,
        fy
      );
    });
    p.carryingKeys.forEach((_k, idx) => {
      const kx = Math.round(p.x - p.facing * (10 + idx * 8));
      const ky = Math.round(p.y + 4 + Math.cos(this.time * 5 + idx) * 2);
      drawPixelSprite(
        ctx,
        'carry_key',
        PROP_SPRITES.key.frames[0],
        PROP_SPRITES.key.palette,
        kx,
        ky
      );
    });

    // Hero-specific Verlet Flowing Trail respecting selected Skin palette!
    let trailMain = skin.id !== 'default' ? skin.palette.hairMain : hero.accentColor;
    let trailHighlight = skin.id !== 'default' ? skin.palette.hairHi : hero.secondaryColor;
    if (skin.id === 'default') {
      if (hero.id === 'lyra') {
        trailMain =
          p.featherTimer > 0
            ? '#ffd24d'
            : p.dashes >= 2
              ? '#ff66dd'
              : p.dashes === 1
                ? '#e04868'
                : '#52c8ff';
        trailHighlight =
          p.featherTimer > 0
            ? '#fff7bd'
            : p.dashes >= 2
              ? '#ffb8f0'
              : p.dashes === 1
                ? '#ff94aa'
                : '#b8eeff';
      } else if (hero.id === 'zephyr') {
        trailMain = p.dashes === 0 ? '#3182a8' : '#26c4b8';
        trailHighlight = '#a8fff2';
      } else if (hero.id === 'nyx') {
        trailMain = p.dashes >= 2 ? '#c44dff' : p.dashes === 1 ? '#804cd4' : '#3d2866';
        trailHighlight = '#ffb3ff';
      } else if (hero.id === 'ignis') {
        trailMain = '#e63c14';
        trailHighlight = '#ffd24d';
      } else if (hero.id === 'seraphina') {
        trailMain = '#7ce8ff';
        trailHighlight = '#fff3b8';
      } else if (hero.id === 'volt') {
        trailMain = p.dashes === 0 ? '#1b7abf' : '#38e8ff';
        trailHighlight = '#fff066';
      } else if (hero.id === 'umbra') {
        trailMain = '#857be0';
        trailHighlight = '#f2f7ff';
      }
    } else if (p.featherTimer > 0) {
      trailMain = '#ffd24d';
      trailHighlight = '#fff7bd';
    }

    // Connected Verlet Flowing Trail (0.5px micro-interpolated silky ribbon + luminous tip glint)
    const getNodeSize = (idx: number) =>
      hero.trailStyle === 'cape'
        ? Math.max(2, 5 - Math.floor(idx / 2))
        : hero.trailStyle === 'spark'
          ? Math.max(1.5, 3 - Math.floor(idx / 3))
          : Math.max(2, 4 - Math.floor(idx / 2));

    for (let i = p.hair.length - 1; i >= 0; i--) {
      const node = p.hair[i];
      const rad = getNodeSize(i);
      const jit = hero.trailStyle === 'spark' ? Math.sin(this.time * 28 + i * 2) * 1.5 : 0;
      ctx.fillStyle = '#090712';
      ctx.fillRect(snapHalf(node.x - rad * 0.5) - 0.5, snapHalf(node.y - rad * 0.5 + jit) - 0.5, rad + 1, rad + 1);
      if (i > 0) {
        const prev = p.hair[i - 1];
        const mx = (node.x + prev.x) * 0.5;
        const my = (node.y + prev.y) * 0.5;
        const mRad = Math.max(1.5, rad - 0.5);
        ctx.fillRect(snapHalf(mx - mRad * 0.5) - 0.5, snapHalf(my - mRad * 0.5 + jit) - 0.5, mRad + 1, mRad + 1);
      }
      if (hero.trailStyle === 'ribbons' && i >= 1) {
        const offY = Math.sin(this.time * 12 + i) * 1.5;
        ctx.fillRect(snapHalf(node.x - p.facing * 2 - 0.5), snapHalf(node.y + 3 + offY - 0.5), 3, 3);
      }
    }
    for (let i = p.hair.length - 1; i >= 0; i--) {
      const node = p.hair[i];
      const rad = getNodeSize(i);
      const jit = hero.trailStyle === 'spark' ? Math.sin(this.time * 28 + i * 2) * 1.5 : 0;
      ctx.fillStyle = i < 2 ? trailHighlight : trailMain;
      if (i > 0) {
        const prev = p.hair[i - 1];
        const mx = (node.x + prev.x) * 0.5;
        const my = (node.y + prev.y) * 0.5;
        const mRad = Math.max(1.5, rad - 0.5);
        ctx.fillRect(snapHalf(mx - mRad * 0.5), snapHalf(my - mRad * 0.5 + jit), mRad, mRad);
      }
      ctx.fillRect(snapHalf(node.x - rad * 0.5), snapHalf(node.y - rad * 0.5 + jit), rad, rad);
      // Crisp 0.5px specular highlight thread along top edge of cape/hair
      ctx.fillStyle = colorWithAlpha(trailHighlight, 0.72);
      ctx.fillRect(snapHalf(node.x - rad * 0.5), snapHalf(node.y - rad * 0.5 + jit), rad, 0.5);
      if (hero.trailStyle === 'ribbons' && i >= 1) {
        const offY = Math.sin(this.time * 12 + i) * 1.5;
        ctx.fillStyle = i % 2 === 0 ? '#ff66dd' : '#d580ff';
        ctx.fillRect(snapHalf(node.x - p.facing * 2), snapHalf(node.y + 3 + offY), 2, 2);
      } else if (hero.trailStyle === 'veil' && i >= 1) {
        ctx.fillStyle = '#d4ceffaa';
        ctx.fillRect(snapHalf(node.x - p.facing), snapHalf(node.y + 2), 2, 0.5);
      }
    }
    if (p.hair.length > 0 && (p.featherTimer > 0 || p.dashes >= 2)) {
      const tip = p.hair[p.hair.length - 1];
      drawMicroSparkle(ctx, tip.x, tip.y, 1.5, trailHighlight, 0.85);
    }

    // Equipped Aura Trail (earned via Passe Estelar, World Stars, or Shop)
    const auraDef = engine.equippedAuraTrail && engine.equippedAuraTrail !== 'none' ? AURA_TRAIL_MAP[engine.equippedAuraTrail] : null;
    if (auraDef) {
      for (let i = 0; i < p.hair.length; i++) {
        const node = p.hair[i];
        const a = this.time * 9 + i * 1.3;
        const ox = snapHalf(node.x + Math.cos(a) * 3);
        const oy = snapHalf(node.y + Math.sin(a) * 3);
        const col = i % 2 === 0 ? auraDef.primaryColor : auraDef.secondaryColor;
        if (i === 0 || i === 2) drawCachedGlow(ctx, ox, oy, 5, col, 0.38, 1, true);
        ctx.fillStyle = col;
        ctx.fillRect(ox, oy, i === 0 ? 1.5 : 1, i === 0 ? 1.5 : 1);
      }
    }

    // Water surface ripple shimmer when wading/swimming + Dash wake sparks
    if (p.inWater) {
      const rw = 4 + Math.sin(this.time * 10) * 1.5;
      ctx.fillStyle = '#e6fbffbb';
      ctx.fillRect(snapHalf(p.x + p.w * 0.5 - rw), snapHalf(p.y + p.h - 2), rw * 2, 0.5);
    }
    if (p.dashTimer > 0) {
      const col = auraDef ? auraDef.primaryColor : trailHighlight;
      drawCachedGlow(ctx, p.x + p.w * 0.5, p.y + p.h * 0.5, 14, col, 0.42, 1, true);
      ctx.fillStyle = col;
      ctx.fillRect(snapHalf(p.x + p.w * 0.5 - p.facing * 8), snapHalf(p.y + 1.5), 4, 0.5);
      ctx.fillRect(snapHalf(p.x + p.w * 0.5 - p.facing * 10), snapHalf(p.y + 5.5), 3, 0.5);
      ctx.fillRect(snapHalf(p.x + p.w * 0.5 - p.facing * 7), snapHalf(p.y + 8.5), 4, 0.5);
    }

    const heroSet = HERO_SPRITE_SETS[hero.id] ?? HERO_SPRITE_SETS.lyra;
    let anim: HeroAnimKey = 'idle';
    let frameIdx = 0;
    if (p.dashTimer > 0) {
      anim = 'dash';
      frameIdx = safeModIdx(this.time * 16, heroSet.dash.length);
    } else if (p.wallGrabbing) {
      anim = 'climb';
      frameIdx = safeModIdx(Math.abs(p.y) * 0.25, heroSet.climb.length);
    } else if (p.crouch) {
      anim = 'crouch';
    } else if (!p.onGround) {
      anim = p.vy * p.gravityDir < 0 ? 'jump' : 'fall';
      frameIdx = safeModIdx(this.time * 8, heroSet[anim].length);
    } else if (Math.abs(p.vx) > 8) {
      anim = 'run';
      frameIdx = safeModIdx(p.walkDist * 0.22, heroSet.run.length);
    } else {
      anim = 'idle';
      const blinkCycle = safeModIdx(this.time * 4, 14);
      frameIdx = blinkCycle === 13 ? 2 : blinkCycle % 4;
    }

    const flashLowStamina =
      p.stamina < p.maxStamina * 0.25 && safeModIdx(this.time * 16, 2) === 0;

    const dashPaletteKey = p.featherTimer > 0 ? 'f' : p.dashes >= 2 ? '2' : p.dashes === 1 ? '1' : '0';
    const skinKey = p.skinId ?? 'default';
    const heroPalette = buildHeroPalette(hero.id, p.dashes, p.featherTimer > 0, flashLowStamina, skinKey);

    const frames = heroSet[anim] ?? heroSet.idle;
    const safeIdx = safeModIdx(frameIdx, frames.length);
    const frame = frames[safeIdx];

    const evoTier = engine.heroEvolutions?.[hero.id] ?? 0;
    let firstSolidRowEvo = 0;
    for (let r = 0; r < frame.length; r++) {
      if (/[^.\s]/.test(frame[r])) {
        firstSolidRowEvo = r;
        break;
      }
    }
    const evoHeadTop = p.y + p.h - (frame.length - firstSolidRowEvo) * p.scaleY;

    if (evoTier >= 1) {
      drawHeroEvolutionBackLayers(ctx, {
        heroId: hero.id,
        tier: evoTier,
        time: this.time,
        cx: p.x + p.w * 0.5,
        cy: p.y + p.h * 0.5,
        headTopY: evoHeadTop,
        feetY: p.y + p.h,
        facing: p.facing < 0 ? -1 : 1,
        scale: 1,
      });
    }

    drawPixelSprite(
      ctx,
      `hero_${hero.id}_${skinKey}_${anim}_${safeIdx}_${dashPaletteKey}_${flashLowStamina ? 'w' : 'n'}`,
      frame,
      heroPalette,
      p.x + p.w * 0.5,
      p.y + p.h,
      p.facing < 0,
      p.scaleX,
      p.scaleY * p.gravityDir,
      true
    );

    if (evoTier >= 1) {
      drawHeroEvolutionFrontLayers(ctx, {
        heroId: hero.id,
        tier: evoTier,
        time: this.time,
        cx: p.x + p.w * 0.5,
        cy: p.y + p.h * 0.5,
        headTopY: evoHeadTop,
        feetY: p.y + p.h,
        facing: p.facing < 0 ? -1 : 1,
        scale: 1,
      });
    }

    // Distinct Skin Headgear Overlay anchored dynamically to top solid row of Hero Head
    const headgear = skin.palette.headgear;
    if (headgear && headgear !== 'none') {
      let firstSolidRow = 0;
      for (let r = 0; r < frame.length; r++) {
        if (/[^.\s]/.test(frame[r])) {
          firstSolidRow = r;
          break;
        }
      }
      const hcx = Math.round(p.x + p.w * 0.5);
      const spriteHeight = frame.length - firstSolidRow;
      const headTop = p.gravityDir < 0
        ? Math.round(p.y + p.h + spriteHeight - 3)
        : Math.round(p.y + p.h - spriteHeight * p.scaleY);
      if (headgear === 'crown') {
        ctx.fillStyle = '#090712';
        ctx.fillRect(hcx - 4, headTop - 2, 8, 3);
        ctx.fillStyle = skin.badgeColor;
        ctx.fillRect(hcx - 3, headTop - 1, 6, 2);
        ctx.fillRect(hcx - 3, headTop - 3, 2, 2);
        ctx.fillRect(hcx - 1, headTop - 3, 2, 2);
        ctx.fillRect(hcx + 1, headTop - 3, 2, 2);
      } else if (headgear === 'horns') {
        ctx.fillStyle = '#090712';
        ctx.fillRect(hcx - 5, headTop - 2, 2, 3);
        ctx.fillRect(hcx + 3, headTop - 2, 2, 3);
        ctx.fillStyle = skin.badgeColor;
        ctx.fillRect(hcx - 5, headTop - 3, 2, 2);
        ctx.fillRect(hcx + 3, headTop - 3, 2, 2);
      } else if (headgear === 'halo') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hcx - 4, headTop - 3, 8, 1);
        ctx.fillStyle = skin.badgeColor;
        ctx.fillRect(hcx - 5, headTop - 2, 10, 1);
      } else if (headgear === 'ears') {
        ctx.fillStyle = skin.badgeColor;
        ctx.fillRect(hcx - 5, headTop - 3, 2, 3);
        ctx.fillRect(hcx + 3, headTop - 3, 2, 3);
      } else if (headgear === 'visor') {
        ctx.fillStyle = skin.badgeColor;
        ctx.fillRect(hcx - 3, headTop + 4, 6, 1);
      } else if (headgear === 'crest') {
        ctx.fillStyle = '#ffd27d';
        ctx.fillRect(hcx - 1, headTop - 3, 2, 3);
        ctx.fillStyle = skin.badgeColor;
        ctx.fillRect(hcx - 3, headTop - 2, 6, 1);
      }
    }

    // Stasis Orbiting Distortion Ring
    if ((p.stasisTimer ?? 0) > 0) {
      ctx.strokeStyle = '#38bdf8bb';
      ctx.beginPath();
      ctx.arc(Math.round(p.x + p.w * 0.5), Math.round(p.y + p.h * 0.5), 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shield Ring Indicator (for Ignis innate shield OR any hero who picked up Shield Orb!)
    if (p.heroShieldReady) {
      const cx = Math.round(p.x + p.w * 0.5);
      const cy = Math.round(p.y + p.h * 0.5 - 2);
      const pulse = Math.sin(this.time * 8) * 1.2;
      ctx.strokeStyle = hero.id === 'ignis' ? 'rgba(255, 165, 55, 0.78)' : 'rgba(255, 224, 102, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      const orbX = Math.round(cx + Math.cos(this.time * 5) * 11);
      const orbY = Math.round(cy + Math.sin(this.time * 5) * 11);
      ctx.fillStyle = '#ffe066';
      ctx.fillRect(orbX - 1, orbY - 1, 2, 2);
    }

    // Stamina Panting Sweat Droplets when stamina < 25%
    if (p.stamina < p.maxStamina * 0.25 && !p.onGround) {
      const syOff = Math.floor(this.time * 14) % 4;
      ctx.fillStyle = '#7ce8ff';
      ctx.fillRect(Math.round(p.x - 2), Math.round(p.y - 1 + syOff), 1, 2);
      ctx.fillRect(Math.round(p.x + p.w + 1), Math.round(p.y + syOff), 1, 2);
    }

    // Seraphina Aerial Double-Jump Feather Sparkle
    if (!p.onGround && p.airJumpsLeft > 0 && hero.id === 'seraphina') {
      const hx = Math.round(p.x + p.w * 0.5 + Math.cos(this.time * 6) * 8);
      const hy = Math.round(p.y - 4 + Math.sin(this.time * 6) * 2);
      ctx.fillStyle = '#fff5b8';
      ctx.fillRect(hx, hy, 2, 2);
    }

    // Overdrive Golden-Cyan Aura & Rotating Sparkles
    if (engine.overdriveTimer > 0) {
      const cx = Math.round(p.x + p.w * 0.5);
      const cy = Math.round(p.y + p.h * 0.5 - 1);
      ctx.strokeStyle = Math.floor(this.time * 16) % 2 === 0 ? '#ffe066' : '#52e5ff';
      ctx.beginPath();
      ctx.arc(cx, cy, 13 + Math.sin(this.time * 14) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle directional Dash Aim Pixel Chevron when dash charge ready
    if (p.dashes > 0 && p.dashTimer <= 0 && !p.onGround && engine.mode === 'playing') {
      const ax = Math.round(p.x + p.w * 0.5 + p.facing * 9);
      const ay = Math.round(p.y + 4);
      ctx.fillStyle = p.dashes >= 2 ? '#ff66ddaa' : '#52e5ff99';
      ctx.fillRect(ax, ay, 2, 1);
      ctx.fillRect(ax + p.facing, ay - 1, 1, 3);
    }

    if (p.bubbleId) {
      ctx.strokeStyle = '#66eeff';
      ctx.beginPath();
      ctx.arc(Math.round(p.x + 4), Math.round(p.y + 5), 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawShockwaves(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const sw of engine.shockwaves) {
      if (!sw.active) continue;
      const alpha = Math.max(0, Math.min(1, sw.life / sw.maxLife));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * 0.78;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = alpha > 0.55 ? 2.2 : 1.1;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      // Crisp bright inner echo ring
      if (sw.radius > 4) {
        ctx.globalAlpha = alpha * 0.55;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(1, sw.radius * 0.74), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawImpactSlashes(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    const drawBlade = (len: number, w: number, col: string, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.quadraticCurveTo(0, -w, len * 0.5, 0);
      ctx.quadraticCurveTo(0, w, -len * 0.5, 0);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = Math.min(1, alpha * 1.15);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-len * 0.42, 0);
      ctx.quadraticCurveTo(0, -w * 0.42, len * 0.42, 0);
      ctx.quadraticCurveTo(0, w * 0.42, -len * 0.42, 0);
      ctx.closePath();
      ctx.fill();
    };

    for (const sl of engine.impactSlashes) {
      if (!sl.active) continue;
      const prog = 1 - sl.life / sl.maxLife;
      const alpha = Math.max(0, 1 - prog * prog);
      const stretch = 0.75 + prog * 0.55;
      const curLen = sl.length * stretch;
      const curW = Math.max(0.8, sl.width * (1 - prog * 0.65));

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.angle);
      drawBlade(curLen, curW, sl.color, alpha);
      if (sl.cross) {
        ctx.rotate(Math.PI * 0.5);
        drawBlade(curLen * 0.88, curW * 0.9, sl.color, alpha * 0.92);
      }
      ctx.restore();
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    for (const pt of engine.particles) {
      if (!pt.active) continue;
      const spd = Math.hypot(pt.vx, pt.vy);
      const alpha = Math.max(0.15, Math.min(1, pt.life / Math.max(0.01, pt.maxLife)));
      if (spd > 58) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = pt.size >= 2 ? 1.4 : 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - pt.vx * 0.028, pt.y - pt.vy * 0.028);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(snapHalf(pt.x) - 0.5, snapHalf(pt.y) - 0.5, 1, 1);
        ctx.restore();
      } else {
        const px = snapHalf(pt.x);
        const py = snapHalf(pt.y);
        if (pt.size >= 2) {
          drawCachedGlow(ctx, px + pt.size * 0.5, py + pt.size * 0.5, 4 + pt.size, pt.color, alpha * 0.42, 1, true);
        }
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.fillRect(px, py, pt.size, pt.size);
        if (pt.size >= 2) {
          ctx.fillStyle = pt.size >= 3 ? '#ffffffdd' : '#ffffff99';
          ctx.fillRect(px, py, 0.5, 0.5);
        }
        ctx.restore();
      }
    }
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
    ctx.save();
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    for (const ft of engine.floatingTexts) {
      if (!ft.active) continue;
      const elapsed = 1 - ft.life / ft.maxLife;
      const pop = elapsed < 0.16 ? 1.38 - (elapsed / 0.16) * 0.38 : 1.0;
      const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(Math.round(ft.x), Math.round(ft.y));
      ctx.scale(pop, pop);
      ctx.fillStyle = '#07050d';
      ctx.fillText(ft.text, -1, 0);
      ctx.fillText(ft.text, 1, 0);
      ctx.fillText(ft.text, 0, -1);
      ctx.fillText(ft.text, 0, 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  private drawAdditiveGlows(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    camX = 0,
    camY = 0
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Soft dynamic hero aura + grounded floor-bounce light pool matching chosen hero
    if (!engine.player.dead) {
      const hero = getHeroDef(engine.player.heroId);
      const hx = engine.player.x + engine.player.w * 0.5;
      const hy = engine.player.y + 3;
      const hRad = engine.player.dashTimer > 0 ? 30 : 22;
      drawCachedGlow(ctx, hx, hy, hRad, hero.accentColor, engine.player.dashTimer > 0 ? 0.34 : 0.22);
      if (engine.player.onGround) {
        drawCachedGlow(ctx, hx, engine.player.y + engine.player.h + 1, 16, hero.secondaryColor, 0.22, 0.34);
      }
    }

    // Soft additive light halos + floor pools on glowing decorations
    for (const pr of engine.currentRoom.props ?? []) {
      const px = pr.tx * TILE_SIZE + 8;
      const py = pr.ty * TILE_SIZE + ((pr.h ?? 4) * TILE_SIZE) * 0.5;
      if (px + 48 < camX || px - 48 > camX + VIRTUAL_WIDTH || py + 48 < camY || py - 48 > camY + VIRTUAL_HEIGHT) {
        continue;
      }
      let pCol: string | null = null;
      let pAlpha = 0.22;
      let pRad = 24;
      if (pr.kind === 'paper_lantern' || pr.kind === 'lantern' || pr.kind === 'brazier' || pr.kind === 'sun_brazier') {
        pCol = '#ffa541';
        pAlpha = 0.26;
        pRad = 30 + Math.sin(this.time * 8 + px) * 2;
      } else if (pr.kind === 'rose_window' || pr.kind === 'crystal_chandelier' || pr.kind === 'soul_urn') {
        pCol = pr.kind === 'rose_window' ? '#82dcff' : '#c084fc';
        pAlpha = 0.22;
        pRad = 34;
      } else if (pr.kind === 'alchemy_vat' || pr.kind === 'tesla_coil' || pr.kind === 'aurora_prism') {
        pCol = pr.kind === 'alchemy_vat' ? '#34d399' : '#38bdf8';
        pAlpha = 0.24;
        pRad = 30;
      } else if (pr.kind === 'sun_dial' || pr.kind === 'clock_gear') {
        pCol = '#ffd25a';
        pAlpha = 0.18;
        pRad = 26;
      } else if (pr.kind === 'holo_pylon' || pr.kind === 'star_satellite') {
        pCol = '#22d3ee';
        pAlpha = 0.26;
        pRad = 28;
      } else if (pr.kind === 'twilight_lotus' || pr.kind === 'willow_tree') {
        pCol = pr.kind === 'twilight_lotus' ? '#e879f9' : '#34d399';
        pAlpha = 0.22;
        pRad = 26;
      } else if (pr.kind === 'canyon_totem') {
        pCol = '#f97316';
        pAlpha = 0.24;
        pRad = 24;
      } else if (pr.kind === 'crystal_cluster' || pr.kind === 'crystal_spire') {
        pCol = getAnyBiomeMeta(engine.currentRoom.biome).accent;
        pAlpha = 0.24;
        pRad = 24;
      } else if (pr.kind === 'waterfall') {
        // Mist bounce light pool at base of waterfall
        drawCachedGlow(ctx, px - 2, pr.ty * TILE_SIZE + (pr.h ?? 6) * TILE_SIZE - 2, 22, '#9ff7ff', 0.26, 0.4, true);
      }
      if (!pCol) continue;
      drawCachedGlow(ctx, px, py, pRad, pCol, pAlpha, 1, true);
      if (pr.kind === 'brazier' || pr.kind === 'sun_brazier' || pr.kind === 'alchemy_vat') {
        drawCachedGlow(ctx, px, pr.ty * TILE_SIZE + (pr.h ?? 2) * TILE_SIZE, 22, pCol, 0.24, 0.34);
      }
    }

    // Orbiting Spirit Companion Halo
    if (engine.equippedSpirit !== 'none') {
      const spMeta = SPIRIT_MAP[engine.equippedSpirit] ?? DETAILED_PET_MAP[engine.equippedSpirit];
      if (spMeta) {
        drawCachedGlow(ctx, engine.spiritX, engine.spiritY, 18, spMeta.color, 0.36, 1, true);
      }
    }

    for (const e of engine.liveEntities) {
      if (e.collected || e.state === 'open' || e.state === 'dead') continue;
      if (
        e.x + 60 < camX ||
        e.x - 60 > camX + VIRTUAL_WIDTH ||
        e.y + 60 < camY ||
        e.y - 60 > camY + VIRTUAL_HEIGHT
      ) {
        continue;
      }
      const k = e.def.kind;
      let col: string | null = null;
      let alpha = 0.3;
      let rad = 22;
      let floorPool = false;
      if (k === 'campfire') {
        col = '#ff8228';
        alpha = 0.42;
        rad = 42 + Math.sin(this.time * 12) * 3;
        floorPool = true;
      } else if (k === 'torch' && e.state === 'lit') {
        col = '#ffb43c';
        alpha = 0.34;
        rad = 34;
        floorPool = true;
      } else if (k === 'dash_crystal' && e.cooldown <= 0) {
        col = '#50ffa0';
        alpha = 0.32;
      } else if (k === 'double_dash_crystal' && e.cooldown <= 0) {
        col = '#ff64dc';
        alpha = 0.32;
      } else if (k === 'relic' || k === 'winged_relic') {
        col = '#ff3c64';
        alpha = 0.3;
      } else if (k === 'astral_coin') {
        col = '#ffe066';
        alpha = 0.3;
        rad = 16;
      } else if (k === 'bumper_orb') {
        col = '#ff6ed2';
        alpha = 0.32;
        rad = 22;
      } else if (k === 'speed_pad') {
        col = '#ffc83c';
        alpha = 0.3;
        rad = 22;
      } else if (k === 'checkpoint_totem' && e.state === 'lit') {
        col = '#52e5ff';
        alpha = 0.38;
        rad = 30;
        floorPool = true;
      } else if (k === 'shield_orb' && e.cooldown <= 0) {
        col = '#ffd250';
        alpha = 0.32;
        rad = 20;
      } else if (k === 'prism_splitter' && e.cooldown <= 0) {
        col = '#ffd250';
        alpha = 0.35;
        rad = 24;
      } else if (k === 'gravity_vortex') {
        col = '#c084fc';
        alpha = 0.36;
        rad = 26;
      } else if (k === 'stasis_orb' && e.cooldown <= 0) {
        col = '#38bdf8';
        alpha = 0.34;
        rad = 24;
      } else if (k === 'grapple_anchor') {
        col = '#52e5ff';
        alpha = 0.32;
        rad = 26;
      } else if (k === 'rift_trial') {
        col = '#4df0c0';
        alpha = 0.38;
        rad = 34;
        floorPool = true;
      } else if (k === 'treasure_chest') {
        col = '#ffe066';
        alpha = 0.28;
        rad = 24;
      } else if (k === 'boost_hoop' && e.cooldown <= 0) {
        col = '#52e5ff';
        alpha = 0.32;
        rad = 24;
      } else if (k === 'blessing_shrine') {
        col = '#ffd27d';
        alpha = 0.38;
        rad = 36 + Math.sin(this.time * 4) * 3;
        floorPool = true;
      } else if (k === 'npc') {
        col = '#ffd782';
        alpha = 0.18;
        rad = 24;
      } else if (k === 'portal_a' || k === 'portal_b') {
        col = k === 'portal_a' ? '#52e5ff' : '#d580ff';
        alpha = 0.34;
        rad = 28;
        floorPool = true;
      } else if (k === 'chapter_goal') {
        col = '#ffd264';
        alpha = 0.44;
        rad = 44 + Math.sin(this.time * 5) * 4;
        floorPool = true;
      } else if (k === 'summit_heart') {
        col = '#64e6ff';
        alpha = 0.44;
        rad = 46 + Math.sin(this.time * 5) * 4;
        floorPool = true;
      } else if (k === 'heal_orb') {
        col = '#34d399';
        alpha = 0.36;
        rad = 24;
      } else if (k === 'elemental_totem') {
        col = ELEMENT_META[(e.subType as ElementType) || 'flame']?.color ?? '#ff8844';
        alpha = 0.36;
        rad = 28;
      } else if (k === 'chrono_gate') {
        col = '#38bdf8';
        alpha = 0.36;
        rad = 28;
      } else if (k === 'echo_mirror') {
        col = '#c084fc';
        alpha = 0.36;
        rad = 26;
      } else if (k === 'boss_crown_shard') {
        col = '#ffd24d';
        alpha = 0.44;
        rad = 26;
      } else if (k === 'laser_prism') {
        col = e.state === 'active' ? '#ff3864' : '#38bdf8';
        alpha = e.state === 'active' ? 0.45 : 0.3;
        rad = 26;
      } else if (k === 'quest_beacon') {
        col = e.state === 'lit' ? '#52e5ff' : '#ffd24d';
        alpha = e.state === 'lit' ? 0.44 : 0.28;
        rad = e.state === 'lit' ? 38 : 24;
        floorPool = true;
      } else if (k === 'lore_tablet') {
        col = '#38bdf8';
        alpha = e.state === 'lit' ? 0.36 : 0.24;
        rad = 24;
      } else if (isBossKind(k)) {
        const bMeta = getAnyBossMeta(k);
        const hpPct = e.hp / Math.max(1, e.maxHp);
        if ((e.hitInvulnTimer ?? 0) > 0) {
          col = '#52e5ff';
          alpha = 0.48;
          rad = 60 + Math.sin(this.time * 18) * 4;
        } else {
          col = hpPct <= 0.35 ? '#ff2e63' : bMeta.accentColor;
          alpha = hpPct <= 0.35 ? 0.44 : 0.35;
          rad = (hpPct <= 0.35 ? 56 : 48) + Math.sin(this.time * 6) * 4;
        }
      }
      if (!col) continue;
      const cx = e.x + e.w * 0.5;
      const cy = e.y + e.h * 0.5;
      drawCachedGlow(ctx, cx, cy, rad, col, alpha, 1, true);
      if (floorPool) {
        drawCachedGlow(ctx, cx, e.y + e.h + 1, rad * 0.72, col, alpha * 0.72, 0.32);
      }

      // Vertical light pillars & portal vortex halos on key shrines, goals & collectibles
      if (
        k === 'chapter_goal' ||
        k === 'summit_heart' ||
        k === 'blessing_shrine' ||
        k === 'boss_crown_shard' ||
        k === 'relic' ||
        k === 'winged_relic'
      ) {
        const beamH = k === 'chapter_goal' || k === 'summit_heart' ? 72 : 44;
        const beamW = k === 'chapter_goal' || k === 'summit_heart' ? 12 : 7;
        const bg = ctx.createLinearGradient(0, cy - beamH, 0, cy + 4);
        bg.addColorStop(0, 'rgba(0,0,0,0)');
        bg.addColorStop(0.65, colorWithAlpha(col, alpha));
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(cx - beamW * 0.5, cy - beamH, beamW, beamH + 4);
        if (k === 'chapter_goal' || k === 'summit_heart') {
          drawMicroSparkle(ctx, cx, cy - 12 - Math.sin(this.time * 3) * 4, 2.5, '#ffffff', 0.75);
        }
      } else if (k === 'portal_a' || k === 'portal_b') {
        ctx.strokeStyle = colorWithAlpha(col, 0.58);
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(cx, cy, 10 + Math.sin(this.time * 6) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    for (const pr of engine.projectiles) {
      if (!pr.active) continue;
      drawCachedGlow(ctx, pr.x, pr.y, 13, pr.color, 0.42, 1, true);
    }
    ctx.restore();
  }

  private drawCombatScreenFX(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    camX: number,
    camY: number
  ): void {
    // 1. Hit-Flash Radial Impact Flare in world-projected screen coords
    if (engine.hitFlashTimer > 0) {
      const a = Math.max(0, Math.min(1, engine.hitFlashTimer / 0.22));
      const sx = engine.hitFlashX - camX;
      const sy = engine.hitFlashY - camY;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawCachedGlow(ctx, sx, sy, 40 * (1.2 - a * 0.3), engine.hitFlashColor, a * 0.68, 1, true);
      ctx.restore();
    }

    // 2. Chromatic Aberration Edge Split during Heavy Hits & Guard Breaks
    if (engine.chromaticShakeTimer > 0) {
      const ca = Math.max(0, Math.min(1, engine.chromaticShakeTimer / 0.24));
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = ca * 0.32;
      ctx.fillStyle = '#ff2255';
      ctx.fillRect(0, 0, 5, VIRTUAL_HEIGHT);
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, 2);
      ctx.fillStyle = '#22eeff';
      ctx.fillRect(VIRTUAL_WIDTH - 5, 0, 5, VIRTUAL_HEIGHT);
      ctx.fillRect(0, VIRTUAL_HEIGHT - 2, VIRTUAL_WIDTH, 2);
      ctx.restore();
    }

    // 3. Damage / Shield-Shatter Screen Border Flash Vignette
    if (engine.damageFlashTimer > 0) {
      const da = Math.max(0, Math.min(1, engine.damageFlashTimer / 0.38));
      ctx.save();
      const vg = ctx.createRadialGradient(
        VIRTUAL_WIDTH * 0.5,
        VIRTUAL_HEIGHT * 0.5,
        VIRTUAL_WIDTH * 0.26,
        VIRTUAL_WIDTH * 0.5,
        VIRTUAL_HEIGHT * 0.5,
        VIRTUAL_WIDTH * 0.62
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, engine.damageFlashColor);
      ctx.globalAlpha = da * 0.55;
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Corner crack/impact border lines
      ctx.strokeStyle = engine.damageFlashColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = da * 0.8;
      ctx.strokeRect(1, 1, VIRTUAL_WIDTH - 2, VIRTUAL_HEIGHT - 2);
      ctx.restore();
    }

    // 4. Overdrive Screen Edge Aureole
    if (engine.overdriveTimer > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const pulse = 0.22 + 0.12 * Math.sin(this.time * 16);
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = Math.floor(this.time * 12) % 2 === 0 ? '#ffe066' : '#52e5ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, VIRTUAL_WIDTH - 2, VIRTUAL_HEIGHT - 2);
      ctx.restore();
    }

    // 5. Dynamic Speedlines (Hyper-Dash, Overdrive, Boss Finishers, High Speed)
    const speedMag = Math.hypot(engine.player.vx, engine.player.vy);
    if (engine.speedLinesTimer > 0 || engine.overdriveTimer > 0 || speedMag > 205) {
      const slAlpha =
        engine.speedLinesTimer > 0
          ? Math.min(0.6, engine.speedLinesTimer * 2.2)
          : engine.overdriveTimer > 0
            ? 0.36
            : 0.3;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = slAlpha;
      ctx.fillStyle = engine.overdriveTimer > 0 ? '#ffe066' : '#ffffff';
      for (let i = 0; i < 12; i++) {
        const sy = ((Math.floor(this.time * 48) * 17 + i * 29) % (VIRTUAL_HEIGHT - 12)) + 6;
        const len = 16 + ((i * 7) % 18);
        const sx = i % 2 === 0 ? 2 : VIRTUAL_WIDTH - len - 2;
        ctx.fillRect(sx, sy, len, 0.5);
      }
      ctx.restore();
    }
  }

  private drawDarknessPass(
    ctx: CanvasRenderingContext2D,
    engine: GameEngine,
    camX = 0,
    camY = 0
  ): void {
    this.ensureLightBuffer();
    if (!this.lightCtx || !this.lightCanvas) return;
    const lctx = this.lightCtx;
    lctx.globalCompositeOperation = 'source-over';
    lctx.fillStyle = 'rgba(4, 3, 11, 0.87)';
    lctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    lctx.globalCompositeOperation = 'destination-out';
    const punchLight = (lx: number, ly: number, r: number) => {
      const sx = lx - camX;
      const sy = ly - camY;
      if (sx + r < 0 || sx - r > VIRTUAL_WIDTH || sy + r < 0 || sy - r > VIRTUAL_HEIGHT) return;
      const g = lctx.createRadialGradient(sx, sy, r * 0.22, sx, sy, r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = g;
      lctx.beginPath();
      lctx.arc(sx, sy, r, 0, Math.PI * 2);
      lctx.fill();
    };

    punchLight(engine.player.x + 4, engine.player.y + 5, 62);
    for (const e of engine.liveEntities) {
      if (e.def.kind === 'campfire' || (e.def.kind === 'torch' && e.state === 'lit')) {
        punchLight(e.x + 4, e.y + 4, 78);
      } else if (
        e.def.kind === 'dash_crystal' ||
        e.def.kind === 'double_dash_crystal' ||
        e.def.kind === 'relic' ||
        e.def.kind === 'chapter_goal'
      ) {
        punchLight(e.x + 6, e.y + 6, 40);
      }
    }
    ctx.drawImage(this.lightCanvas, 0, 0);

    // Rich colored warm/arcane atmospheric bloom inside dark caves after cutout
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hero = getHeroDef(engine.player.heroId);
    drawCachedGlow(ctx, engine.player.x + 4 - camX, engine.player.y + 4 - camY, 44, hero.secondaryColor, 0.16);
    for (const e of engine.liveEntities) {
      const sx = e.x + 6 - camX;
      const sy = e.y + 6 - camY;
      if (sx + 80 < 0 || sx - 80 > VIRTUAL_WIDTH || sy + 80 < 0 || sy - 80 > VIRTUAL_HEIGHT) continue;
      if (e.def.kind === 'campfire' || (e.def.kind === 'torch' && e.state === 'lit')) {
        drawCachedGlow(ctx, sx, sy, 52 + Math.sin(this.time * 10 + sx) * 3, '#ff8e3c', 0.26);
      } else if (e.def.kind === 'chapter_goal') {
        drawCachedGlow(ctx, sx, sy, 36, '#ffd27d', 0.24);
      }
    }
    ctx.restore();
  }
}
