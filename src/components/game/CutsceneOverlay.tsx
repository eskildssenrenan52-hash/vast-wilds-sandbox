// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React, { useEffect, useRef, useState } from 'react';
import { gameAudio } from '../../game/audio';
import { CUTSCENES, formatCutsceneText } from '../../game/cutscenes';
import { getHeroDef, HeroId } from '../../game/heroes';
import {
  ENEMY_SPRITES,
  HERO_SPRITE_SETS,
  NPC_SPRITES,
  buildHeroPalette,
  drawPixelSprite,
} from '../../game/sprites';
import { CutsceneId } from '../../game/types';
import { colorWithAlpha, drawCachedGlow } from '../../game/visualFx';
import { getAnyBiomeMeta } from '../../game/worldDataUnderworld';
import { PixelButton, PixelIcon } from './PixelUi';

interface CutsceneOverlayProps {
  cutsceneId: CutsceneId;
  heroId: HeroId;
  skinId?: string;
  gamepadConfirmTick: number;
  gamepadSkipTick: number;
  onFinish: () => void;
}

const SCENE_W = 320;
const SCENE_H = 132;

export const CutsceneOverlay: React.FC<CutsceneOverlayProps> = ({
  cutsceneId,
  heroId,
  skinId = 'default',
  gamepadConfirmTick,
  gamepadSkipTick,
  onFinish,
}) => {
  const def = CUTSCENES[cutsceneId];
  const hero = getHeroDef(heroId);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [beatIdx, setBeatIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const beat = def.beats[Math.min(beatIdx, def.beats.length - 1)];
  const fullText = formatCutsceneText(beat.text, hero.name);
  const speakerName = formatCutsceneText(beat.speaker, hero.name);
  const isLineComplete = charCount >= fullText.length;

  useEffect(() => {
    setBeatIdx(0);
    setCharCount(0);
  }, [cutsceneId]);

  // Typewriter animation
  useEffect(() => {
    if (charCount >= fullText.length) return;
    const timer = window.setInterval(() => {
      setCharCount((prev) => {
        const next = Math.min(fullText.length, prev + 2);
        if (next % 10 === 2) {
          gameAudio.playDialogueBlip(beat.voicePitch);
        }
        return next;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [beatIdx, fullText, beat.voicePitch, charCount >= fullText.length]);

  const handleAdvance = () => {
    gameAudio.unlock();
    if (!isLineComplete) {
      setCharCount(fullText.length);
      return;
    }
    if (beatIdx < def.beats.length - 1) {
      const nextBeat = def.beats[beatIdx + 1];
      setBeatIdx((v) => v + 1);
      setCharCount(0);
      gameAudio.playDialogueBlip(nextBeat.voicePitch);
    } else {
      onFinish();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase() ?? '';
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE' || e.code === 'KeyZ' || k === ' ' || k === 'enter') {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      } else if (e.code === 'Escape' || k === 'escape') {
        e.preventDefault();
        e.stopPropagation();
        onFinish();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  // Gamepad edge navigation hooks
  const prevConfirm = useRef(gamepadConfirmTick);
  useEffect(() => {
    if (gamepadConfirmTick !== prevConfirm.current) {
      prevConfirm.current = gamepadConfirmTick;
      handleAdvance();
    }
  });

  const prevSkip = useRef(gamepadSkipTick);
  useEffect(() => {
    if (gamepadSkipTick !== prevSkip.current) {
      prevSkip.current = gamepadSkipTick;
      onFinish();
    }
  });

  // Bespoke Multi-Layer Animated Pixel Diorama Renderer
  useEffect(() => {
    let rafId = 0;
    let t = 0;
    let last = performance.now();
    let camPan = 0;

    const renderScene = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      t += dt;

      const targetPan =
        beat.cameraFocus === 'hero'
          ? -14
          : beat.cameraFocus === 'ally'
            ? 14
            : beat.cameraFocus === 'sky'
              ? Math.sin(t * 0.4) * 6
              : 0;
      camPan += (targetPan - camPan) * Math.min(1, dt * 3.5);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.imageSmoothingEnabled = false;
        const meta = getAnyBiomeMeta(def.biome);

        // 1. Continuous Smooth Atmospheric Sky Gradient + 0.5px Twinkling Stars
        const skyGrad = ctx.createLinearGradient(0, 0, 0, SCENE_H);
        if (def.diorama === 'dawn_restored') {
          skyGrad.addColorStop(0, '#18244d');
          skyGrad.addColorStop(0.5, '#6e3a6e');
          skyGrad.addColorStop(1, '#e88b5a');
        } else {
          skyGrad.addColorStop(0, meta.skyTop);
          skyGrad.addColorStop(0.48, meta.skyMid);
          skyGrad.addColorStop(1, meta.skyBottom);
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, SCENE_W, SCENE_H);

        for (let i = 0; i < 64; i++) {
          const sx = ((i * 53 + camPan * 0.3) % SCENE_W + SCENE_W) % SCENE_W;
          const sy = (i * 19 + (i % 7) * 3) % 82;
          const tw = Math.sin(t * 2.8 + i) * 0.5 + 0.5;
          ctx.fillStyle = tw > 0.68 ? '#ffffff' : colorWithAlpha(meta.accent, 0.35 + tw * 0.4);
          const sz = tw > 0.85 && i % 6 === 0 ? 1 : 0.5;
          ctx.fillRect(Math.round(sx * 2) * 0.5, Math.round(sy * 2) * 0.5, sz, sz);
          if (i % 13 === 0 && tw > 0.72) {
            drawCachedGlow(ctx, sx, sy, 5, meta.accent, 0.25 * tw, 1, true);
          }
        }

        // 2. Celestial / Diorama Centerpiece
        const cx = Math.round(160 + camPan * 0.45);
        if (def.diorama === 'shattered_summit' || def.diorama === 'dawn_restored') {
          const glow = ctx.createRadialGradient(cx, 38, 4, cx, 38, 44);
          glow.addColorStop(
            0,
            def.diorama === 'dawn_restored' ? 'rgba(255, 224, 102, 0.55)' : 'rgba(82, 229, 255, 0.45)'
          );
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(cx - 44, 0, 88, 84);

          if (def.diorama === 'shattered_summit') {
            // Shattered floating prism shards
            for (let s = 0; s < 6; s++) {
              const ang = t * 0.9 + (s * Math.PI) / 3;
              const px = Math.round(cx + Math.cos(ang) * (14 + (s % 2) * 8));
              const py = Math.round(36 + Math.sin(ang * 1.4) * 7);
              ctx.fillStyle = s % 2 === 0 ? '#52e5ff' : '#ff4d7d';
              ctx.fillRect(px - 2, py - 3, 4, 6);
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(px - 1, py - 1, 2, 2);
            }
          } else {
            // Restored golden radiant Ether Core
            ctx.fillStyle = '#ffe066';
            ctx.fillRect(cx - 8, 28, 16, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 4, 32, 8, 8);
          }
        } else if (def.diorama === 'aurora_citadel') {
          for (let x = 0; x < SCENE_W; x += 3) {
            const ay = 18 + Math.round(Math.sin(x * 0.03 + t * 1.4) * 8);
            ctx.fillStyle = '#5ef2ff44';
            ctx.fillRect(x, ay, 3, 18);
            ctx.fillStyle = '#b8ffea38';
            ctx.fillRect(x, ay + 5, 3, 8);
          }
        } else if (def.diorama === 'astral_rift') {
          ctx.strokeStyle = '#d580ff88';
          ctx.beginPath();
          ctx.arc(cx, 42, 22 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#52e5ff';
          ctx.fillRect(cx - 3, 39, 6, 6);
        } else if (def.diorama === 'molten_crucible') {
          ctx.fillStyle = '#ff551155';
          ctx.fillRect(cx - 10, 20, 20, 88);
          ctx.fillStyle = '#ffe06688';
          const flow = Math.floor(t * 28) % 14;
          for (let fy = 20 + flow; fy < 108; fy += 14) {
            ctx.fillRect(cx - 5, fy, 10, 6);
          }
        } else if (def.diorama === 'fungal_abyss') {
          for (let i = 0; i < 6; i++) {
            const mx = 36 + i * 54 + Math.round(camPan * 0.35);
            ctx.fillStyle = '#0f4c45';
            ctx.fillRect(mx - 2, 74, 4, 36);
            ctx.fillStyle = '#2dd4bf';
            ctx.fillRect(mx - 10, 66, 20, 8);
            ctx.fillStyle = '#a7f3d0';
            ctx.fillRect(mx - 6, 68, 4, 3);
            ctx.fillRect(mx + 2, 68, 4, 3);
          }
        } else if (def.diorama === 'ash_ruins') {
          for (let i = 0; i < 4; i++) {
            const ax = 48 + i * 74 + Math.round(camPan * 0.4);
            ctx.fillStyle = '#332528';
            ctx.fillRect(ax - 6, 54, 12, 50);
            ctx.fillRect(ax - 9, 50, 18, 6);
            ctx.fillStyle = '#ffd27d55';
            ctx.fillRect(ax - 2, 62, 4, 10);
          }
        } else if (def.diorama === 'storm_summit') {
          if (Math.sin(t * 2.5) > 0.85) {
            ctx.fillStyle = '#fff5b844';
            ctx.fillRect(cx - 2, 0, 4, 80);
            ctx.fillRect(cx + 2, 34, 8, 2);
            ctx.fillRect(cx + 8, 36, 3, 22);
          }
          ctx.strokeStyle = '#ff4d7d66';
          ctx.beginPath();
          ctx.arc(cx, 44, 26 + Math.sin(t * 3) * 2, 0, Math.PI * 2);
          ctx.stroke();
        } else if (def.diorama === 'sakura_shrine') {
          // Vermilion Torii silhouette + pink sakura moon & blossoms
          ctx.fillStyle = '#ff70a644';
          ctx.fillRect(cx - 14, 16, 28, 28);
          ctx.fillStyle = '#cf274c';
          ctx.fillRect(cx - 16, 48, 4, 56);
          ctx.fillRect(cx + 12, 48, 4, 56);
          ctx.fillRect(cx - 22, 44, 44, 5);
          ctx.fillRect(cx - 18, 54, 36, 3);
        } else if (def.diorama === 'sunken_depths') {
          // Underwater caustic vertical cathedral shafts + coral arches
          for (let i = 0; i < 5; i++) {
            const sx = cx - 80 + i * 38;
            ctx.fillStyle = '#4de1ff22';
            ctx.fillRect(sx, 0, 12, 104);
          }
          ctx.fillStyle = '#ff6b9d88';
          ctx.fillRect(cx - 48, 86, 6, 18);
          ctx.fillRect(cx + 42, 82, 6, 22);
        } else if (def.diorama === 'clockwork_tower') {
          // Rotating giant brass clock gear in diorama background
          ctx.strokeStyle = '#ffb84d88';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, 48, 26, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
          for (let i = 0; i < 8; i++) {
            const a = t * 1.1 + (i * Math.PI) / 4;
            ctx.fillStyle = '#ffd37a';
            ctx.fillRect(Math.round(cx + Math.cos(a) * 28) - 2, Math.round(48 + Math.sin(a) * 28) - 2, 4, 4);
          }
        } else if (def.diorama === 'emerald_clouds') {
          // Hovering sky archipelago island + waterfall stream
          ctx.fillStyle = '#ffe98533';
          ctx.fillRect(cx - 18, 12, 36, 36);
          const bob = Math.round(Math.sin(t * 2) * 2);
          ctx.fillStyle = '#2d6e58';
          ctx.fillRect(cx - 28, 48 + bob, 56, 8);
          ctx.fillRect(cx - 18, 56 + bob, 36, 6);
          ctx.fillStyle = '#57f2a8';
          ctx.fillRect(cx - 28, 45 + bob, 56, 3);
          ctx.fillStyle = '#7cf2ff88';
          ctx.fillRect(cx + 18, 48 + bob, 4, 52);
        } else if (def.diorama === 'solar_desert') {
          // Twin golden suns & desert pyramid silhouettes
          ctx.fillStyle = '#fde04788';
          ctx.fillRect(cx - 22, 16, 16, 16);
          ctx.fillStyle = '#fbbf2466';
          ctx.fillRect(cx + 12, 22, 10, 10);
          ctx.fillStyle = '#92400e';
          for (let py = 0; py < 36; py++) {
            ctx.fillRect(cx - 40 + py, 68 + py, 72 - py * 2, 1);
          }
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx - 2, 58, 4, 46);
        } else if (def.diorama === 'amethyst_vault') {
          // Violet crypt arch + floating crystal chandelier
          ctx.fillStyle = '#4c1d95';
          ctx.fillRect(cx - 46, 36, 6, 68);
          ctx.fillRect(cx + 40, 36, 6, 68);
          ctx.fillRect(cx - 46, 32, 92, 6);
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(cx - 8, 42 + Math.round(Math.sin(t * 2) * 2), 16, 8);
          ctx.fillStyle = '#f3e8ff';
          ctx.fillRect(cx - 2, 44 + Math.round(Math.sin(t * 2) * 2), 4, 4);
        } else if (def.diorama === 'alchemy_lab') {
          // Bubbling emerald alchemy vats + tesla arcs
          for (let i = -1; i <= 1; i += 2) {
            const vx = cx + i * 44;
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(vx - 8, 56, 16, 48);
            ctx.fillStyle = '#a3e635aa';
            ctx.fillRect(vx - 6, 60, 12, 40);
            const by = 92 - ((Math.floor(t * 24) + i * 11) % 30);
            ctx.fillStyle = '#ecfccb';
            ctx.fillRect(vx - 2, by, 4, 4);
          }
          ctx.fillStyle = '#38bdf8aa';
          ctx.fillRect(cx - 34, 46 + (Math.floor(t * 16) % 3), 68, 2);
        } else if (def.diorama === 'aurora_peak') {
          // Curtain aurora ribbons + bounce clouds
          for (let x = 0; x < SCENE_W; x += 3) {
            const ay = 14 + Math.round(Math.sin(x * 0.04 + t * 1.6) * 10);
            ctx.fillStyle = x % 6 === 0 ? '#67e8f966' : '#e879f955';
            ctx.fillRect(x, ay, 3, 22);
          }
          ctx.fillStyle = '#ffffffaa';
          ctx.fillRect(cx - 52, 64, 24, 6);
          ctx.fillRect(cx + 28, 58, 24, 6);
        } else if (def.diorama === 'canyon_mesa') {
          // Terraced red mesa canyon pillars + glowing canyon totem
          ctx.fillStyle = '#78221e';
          ctx.fillRect(cx - 88, 60, 32, 44);
          ctx.fillRect(cx - 78, 44, 18, 16);
          ctx.fillRect(cx + 52, 54, 36, 50);
          ctx.fillRect(cx + 60, 40, 20, 14);
          ctx.fillStyle = '#fb7185';
          ctx.fillRect(cx - 4, 52, 8, 52);
          ctx.fillStyle = '#fcd34d';
          ctx.fillRect(cx - 2, 58 + (Math.floor(t * 6) % 2), 4, 4);
          ctx.fillRect(cx - 2, 72, 4, 4);
        } else if (def.diorama === 'cyber_city') {
          // Neon skyline towers + holographic grid pulse
          const bHeights = [46, 62, 38, 70, 52, 64];
          for (let i = 0; i < bHeights.length; i++) {
            const bx = cx - 96 + i * 32;
            const bh = bHeights[i];
            ctx.fillStyle = '#0f1b3d';
            ctx.fillRect(bx, 104 - bh, 22, bh);
            ctx.fillStyle = i % 2 === 0 ? '#22d3ee99' : '#f472b699';
            ctx.fillRect(bx + 3, 108 - bh, 16, 2);
            ctx.fillRect(bx + 5, 118 - bh, 4, 6);
            ctx.fillRect(bx + 13, 126 - bh, 4, 6);
          }
          ctx.fillStyle = '#22d3ee55';
          ctx.fillRect(cx - 120, 32 + Math.round(Math.sin(t * 2) * 3), 240, 1);
        } else if (def.diorama === 'marble_temple') {
          // Celestial Parthenon columns + golden sun pediment
          ctx.fillStyle = '#cbd5e1';
          for (let i = -2; i <= 2; i++) {
            const px = cx + i * 24;
            ctx.fillRect(px - 3, 46, 6, 58);
            ctx.fillStyle = '#fef9c3';
            ctx.fillRect(px - 4, 44, 8, 3);
            ctx.fillStyle = '#cbd5e1';
          }
          ctx.fillStyle = '#fde68a';
          ctx.fillRect(cx - 58, 38, 116, 6);
          ctx.fillStyle = '#60a5faaa';
          ctx.fillRect(cx - 3, 22, 6, 12);
        } else if (def.diorama === 'ebony_swamp') {
          // Silhouette weeping willows + drifting marsh wisps
          for (let i = -1; i <= 1; i += 2) {
            const wx = cx + i * 54;
            ctx.fillStyle = '#11211d';
            ctx.fillRect(wx - 4, 52, 8, 52);
            ctx.fillStyle = '#1e3a32';
            ctx.fillRect(wx - 20, 42, 40, 14);
            ctx.fillRect(wx - 16, 56, 4, 18);
            ctx.fillRect(wx + 12, 56, 4, 18);
          }
          for (let w = 0; w < 4; w++) {
            const ox = cx - 42 + w * 28;
            const oy = 62 + Math.round(Math.sin(t * 2.3 + w) * 6);
            ctx.fillStyle = '#34d399';
            ctx.fillRect(ox, oy, 4, 4);
          }
        } else if (def.diorama === 'orbital_station') {
          // Planetary curvature arc + orbiting satellite ring
          ctx.strokeStyle = '#6366f188';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, 146, 98, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
          ctx.lineWidth = 1;
          const sx = cx + Math.round(Math.cos(t * 1.2) * 48);
          const sy = 38 + Math.round(Math.sin(t * 1.2) * 12);
          ctx.fillStyle = '#a5b4fc';
          ctx.fillRect(sx - 6, sy - 2, 12, 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(sx - 2, sy - 3, 4, 6);
        } else if (def.diorama === 'twilight_grove') {
          // Glowing twilight lotus blossoms + crescent moon
          ctx.fillStyle = '#f5d0fe88';
          ctx.fillRect(cx - 10, 16, 18, 18);
          ctx.fillStyle = '#2e0b40';
          ctx.fillRect(cx - 4, 18, 14, 14);
          for (let i = -2; i <= 2; i++) {
            const lx = cx + i * 32;
            const ly = 94 - (Math.abs(i) % 2) * 4;
            ctx.fillStyle = '#e879f9';
            ctx.fillRect(lx - 5, ly, 10, 5);
            ctx.fillStyle = '#fb7185';
            ctx.fillRect(lx - 2, ly - 3, 4, 4);
          }
        } else if (def.diorama === 'boss_arena') {
          const glow = ctx.createRadialGradient(cx, 54, 6, cx, 54, 52);
          glow.addColorStop(0, def.accentColor + '55');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(cx - 52, 4, 104, 100);
          ctx.strokeStyle = def.accentColor + 'aa';
          ctx.beginPath();
          ctx.arc(cx, 54, 28 + Math.sin(t * 2.5) * 2, 0, Math.PI * 2);
          ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const a = t * 1.4 + (i * Math.PI) / 3;
            ctx.fillStyle = i % 2 === 0 ? def.accentColor : '#ffffff';
            ctx.fillRect(Math.round(cx + Math.cos(a) * 28) - 1, Math.round(54 + Math.sin(a) * 28) - 1, 3, 3);
          }
        }

        // 3. Far & Closer Rim-Lit Mountain Ridge Silhouettes
        ctx.fillStyle = meta.mountainFar;
        for (let x = 0; x < SCENE_W; x += 2) {
          const wx = x - camPan * 0.45;
          const h = 48 + Math.round(Math.sin(wx * 0.022) * 14 + Math.cos(wx * 0.055) * 7);
          ctx.fillRect(x, SCENE_H - h, 2, h);
        }
        ctx.fillStyle = meta.mountainNear ?? meta.mountainFar;
        for (let x = 0; x < SCENE_W; x += 1) {
          const wx = x - camPan * 0.7;
          const h = 34 + Math.round(Math.sin(wx * 0.036 + 1.4) * 9 + Math.cos(wx * 0.08) * 4);
          ctx.fillRect(x, SCENE_H - h, 1, h);
          ctx.fillStyle = colorWithAlpha(meta.accent, 0.24);
          ctx.fillRect(x, SCENE_H - h, 1, 0.5);
          ctx.fillStyle = meta.mountainNear ?? meta.mountainFar;
        }

        // 4. Foreground Ruin Cliff, Stone Masonry Fissures, Pillars & Warm Campfire
        const floorY = 104;
        // Soft atmospheric mist along cliff horizon
        const mistGrad = ctx.createLinearGradient(0, floorY - 14, 0, floorY + 2);
        mistGrad.addColorStop(0, 'rgba(0,0,0,0)');
        mistGrad.addColorStop(1, colorWithAlpha(meta.accent, 0.14));
        ctx.fillStyle = mistGrad;
        ctx.fillRect(0, floorY - 14, SCENE_W, 16);

        // Flanking Ancient Ruin Pillars & Hanging Embers framing the diorama stage
        for (const px of [Math.round(30 + camPan * 0.85), Math.round(284 + camPan * 0.85)]) {
          ctx.fillStyle = meta.tileShadow;
          ctx.fillRect(px - 5, floorY - 38, 10, 38);
          ctx.fillStyle = meta.tileMain;
          ctx.fillRect(px - 6, floorY - 41, 12, 4);
          ctx.fillRect(px - 4, floorY - 38, 5, 38);
          ctx.fillStyle = meta.tileHighlight;
          ctx.fillRect(px - 6, floorY - 41, 12, 1);
          drawCachedGlow(ctx, px, floorY - 44, 14, meta.accent, 0.3, 0.9, true);
          ctx.fillStyle = meta.accent;
          ctx.fillRect(px - 1, floorY - 45, 2, 3);
        }

        ctx.fillStyle = meta.tileShadow;
        ctx.fillRect(0, floorY, SCENE_W, SCENE_H - floorY);
        ctx.fillStyle = meta.tileMain;
        ctx.fillRect(0, floorY, SCENE_W, 8);
        ctx.fillStyle = meta.tileHighlight;
        ctx.fillRect(0, floorY, SCENE_W, 1.5);
        // Subtle pixel stone fissures along cliff lip
        ctx.fillStyle = 'rgba(0,0,0,0.32)';
        for (let sx = 6; sx < SCENE_W; sx += 16) {
          ctx.fillRect(sx, floorY + 2, 0.5, 6);
          ctx.fillRect(sx + 8, floorY + 10, 0.5, 16);
        }
        ctx.fillStyle = colorWithAlpha(meta.accent, 0.14);
        ctx.fillRect(0, floorY + 8, SCENE_W, 0.5);

        // Glowing Campfire / Pedestal at center
        const fireX = Math.round(156 + camPan);
        const fAnim = Math.floor(t * 10) % 3;
        drawCachedGlow(ctx, fireX + 2, floorY - 5, 28 + fAnim * 2, '#ff8833', 0.42, 0.85, true);
        drawCachedGlow(ctx, fireX + 2, floorY + 1, 20, '#ffaa44', 0.28, 0.35, false);
        ctx.fillStyle = '#5c3c24';
        ctx.fillRect(fireX - 4, floorY - 3, 12, 3);
        ctx.fillStyle = '#ff6622';
        ctx.fillRect(fireX - 2, floorY - 9 - fAnim, 8, 6 + fAnim);
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(fireX, floorY - 7 - (fAnim % 2), 4, 4);

        // 5. Animated Hero Actor on Left Side of Bonfire
        const heroX = Math.round(108 + camPan);
        const heroSet = HERO_SPRITE_SETS[hero.id] ?? HERO_SPRITE_SETS.lyra;
        const heroFrame = heroSet.idle[Math.floor(t * 4) % heroSet.idle.length];
        const heroPal = buildHeroPalette(hero.id, hero.modifiers.baseDashes, false, false, skinId);
        drawPixelSprite(ctx, `cs_hero_${hero.id}_${skinId}`, heroFrame, heroPal, heroX, floorY, false, 1, 1, true);

        // 6. Optional Companion NPC Actor on Right Side of Bonfire
        if (def.companionNpcId && NPC_SPRITES[def.companionNpcId]) {
          const npcSprite = NPC_SPRITES[def.companionNpcId];
          const npcFrame = npcSprite.frames[Math.floor(t * 4) % npcSprite.frames.length];
          const npcX = Math.round(204 + camPan);
          drawPixelSprite(
            ctx,
            `cs_npc_${def.companionNpcId}`,
            npcFrame,
            npcSprite.palette,
            npcX,
            floorY,
            true,
            1,
            1,
            true
          );
        }

        // 7. Optional Hovering Chapter Boss Silhouette in Arena/Sky
        if (def.showBoss) {
          const bossKey = def.bossKind ?? 'boss_sovereign';
          const boss = ENEMY_SPRITES[bossKey] ?? ENEMY_SPRITES.boss_sovereign;
          const bf = boss.frames[Math.floor(t * 5) % boss.frames.length];
          const by = Math.round((def.diorama === 'boss_arena' ? 68 : 52) + Math.sin(t * 2.4) * 4);
          drawPixelSprite(
            ctx,
            `cs_boss_${bossKey}`,
            bf,
            boss.palette,
            Math.round(160 + camPan * 0.7),
            by,
            false,
            1,
            1,
            true
          );
        }

        // 8. Drifting Atmospheric Embers / Stars
        for (let i = 0; i < 20; i++) {
          const px = ((i * 37 + Math.round(t * (12 + (i % 3) * 5))) % SCENE_W + SCENE_W) % SCENE_W;
          const py = ((SCENE_H - ((Math.round(t * 18) + i * 19) % SCENE_H)) + SCENE_H) % SCENE_H;
          ctx.fillStyle = i % 2 === 0 ? def.accentColor : '#ffffffaa';
          ctx.fillRect(px, py, i % 4 === 0 ? 2 : 1, 1);
        }
      }

      rafId = requestAnimationFrame(renderScene);
    };

    rafId = requestAnimationFrame(renderScene);
    return () => cancelAnimationFrame(rafId);
  }, [cutsceneId, hero.id, skinId, beat.cameraFocus, def]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={def.title}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#040308]/95 p-4 pointer-events-auto"
    >
      <div className="pixel-panel w-full max-w-4xl overflow-hidden p-4 text-[#f5efe6]">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#07050d] pb-2.5">
          <div>
            <h2
              style={{ color: def.accentColor }}
              className="font-pixel text-xl font-bold tracking-wide text-stroke-dark"
            >
              {def.title}
            </h2>
            <p className="font-body-pixel text-xs text-[#b8afc9]">{def.subtitle}</p>
          </div>
          <PixelButton
            type="button"
            variant="slate"
            onClick={onFinish}
            className="px-3 py-1.5 text-xs"
          >
            <span>Pular Cena [Esc / Start]</span>
          </PixelButton>
        </div>

        {/* Animated Pixel Art Diorama Stage (2x 640x264 native micro-pixel canvas) */}
        <div className="mt-3 border-2 border-[#07050d] bg-[#07050d] p-1">
          <canvas
            ref={canvasRef}
            width={SCENE_W * 2}
            height={SCENE_H * 2}
            data-testid="cutscene-canvas"
            className="pixel-canvas aspect-[320/132] w-full"
          />
        </div>

        {/* Narrative Box */}
        <div className="pixel-subpanel mt-3 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#31274a] pb-1.5">
            <div className="flex items-baseline gap-2">
              <strong
                style={{ color: beat.accentColor }}
                className="font-pixel text-lg font-bold text-stroke-dark"
              >
                {speakerName}
              </strong>
              <span className="font-pixel text-xs text-[#a9a0bd]">· {beat.role}</span>
            </div>

            <div className="flex items-center gap-1.5" aria-label={`Cena ${beatIdx + 1} de ${def.beats.length}`}>
              {def.beats.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-4 border border-[#07050d] ${
                    i <= beatIdx ? 'bg-[#ffd27d]' : 'bg-[#1c162b]'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="mt-3 min-h-[3.4rem] font-body-pixel text-sm leading-relaxed text-[#f5efe6]">
            {fullText.slice(0, charCount)}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-pixel text-xs text-[#9c92b0]">
              Teclado: [Espaço / E] · Controle: [A] Continuar / [Start] Pular
            </span>
            <PixelButton
              type="button"
              variant="gold"
              onClick={handleAdvance}
              className="px-5 py-2 text-sm"
            >
              <PixelIcon name="play" className="h-4 w-4" />
              <span>
                {!isLineComplete
                  ? 'Completar'
                  : beatIdx < def.beats.length - 1
                    ? 'Continuar'
                    : 'Começar Jornada'}
              </span>
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
};
