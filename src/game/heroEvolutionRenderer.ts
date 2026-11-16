// @ts-nocheck -- imported game code
import { getHeroEvolutionData } from './heroEvolution';
import type { HeroId } from './heroes';

export interface HeroEvolutionRenderOpts {
  heroId: HeroId;
  tier: number;
  time: number;
  cx: number;
  cy: number;
  headTopY: number;
  feetY: number;
  facing?: 1 | -1;
  scale?: number;
}

function drawMicroStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  outline = '#090712'
): void {
  const rx = Math.round(x * 2) * 0.5;
  const ry = Math.round(y * 2) * 0.5;
  ctx.fillStyle = outline;
  ctx.fillRect(rx - r - 0.5, ry - 0.5, (r + 0.5) * 2, 1);
  ctx.fillRect(rx - 0.5, ry - r - 0.5, 1, (r + 0.5) * 2);
  ctx.fillStyle = color;
  ctx.fillRect(rx - r, ry - 0.5, r * 2, 1);
  ctx.fillRect(rx - 0.5, ry - r, 1, r * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(rx - 0.5, ry - 0.5, 1, 1);
}

/**
 * Renders behind-hero multi-layer animated evolution aesthetics:
 * - Tier 1: Elemental rising motes + rotating ground sigil halo
 * - Tier 2: Articulated multi-feather 2-layer flapping wings + back orbital crystal
 * - Tier 3: Rotating 8-tick Sacred Pixel Mandala + 4-wing Seraph/Draconic spread + ascension beam
 */
export function drawHeroEvolutionBackLayers(
  ctx: CanvasRenderingContext2D,
  opts: HeroEvolutionRenderOpts
): void {
  const tier = Math.max(0, Math.min(3, Math.floor(opts.tier)));
  if (tier <= 0) return;

  const evo = getHeroEvolutionData(opts.heroId, tier);
  const { time, cx, cy, feetY } = opts;
  const sc = opts.scale ?? 1;
  const primary = evo.auraColor;
  const crownCol = evo.crownColor;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);
  const relFeet = feetY - cy;

  // Soft pulsing aura halo + vertical ascension beam at Tier 3
  const pulse = 0.78 + 0.22 * Math.sin(time * 3.4);
  if (tier >= 3) {
    const beamW = 8 + Math.sin(time * 4) * 1.5;
    ctx.globalAlpha = 0.16 * pulse;
    ctx.fillStyle = crownCol;
    ctx.fillRect(-beamW * 0.5, -22, beamW, relFeet + 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-beamW * 0.2, -22, beamW * 0.4, relFeet + 22);
  }

  const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, 11 + tier * 3.5);
  grad.addColorStop(0, primary + '77');
  grad.addColorStop(0.55, crownCol + '28');
  grad.addColorStop(1, '#09071200');
  ctx.globalAlpha = pulse;
  ctx.fillStyle = grad;
  ctx.fillRect(-18, -18, 36, 36);
  ctx.globalAlpha = 1;

  // Ground rotating pixel rune halo (ellipse)
  const ringRx = 7 + tier * 1.6;
  const ringRy = 2.2;
  ctx.globalAlpha = 0.55 + tier * 0.1;
  ctx.strokeStyle = tier >= 3 ? '#ffe066' : primary;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(0, relFeet - 0.5, ringRx, ringRy, 0, 0, Math.PI * 2);
  ctx.stroke();
  const runeCount = 4 + tier * 2;
  for (let i = 0; i < runeCount; i++) {
    const a = time * (1.8 + tier * 0.4) + (Math.PI * 2 * i) / runeCount;
    const rx = Math.round(Math.cos(a) * ringRx * 2) * 0.5;
    const ry = Math.round((relFeet - 0.5 + Math.sin(a) * ringRy) * 2) * 0.5;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : crownCol;
    ctx.fillRect(rx - 0.5, ry - 0.5, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Tier 3 Rotating 8-Tick Sacred Mandala Ring behind hero
  if (tier >= 3) {
    const r = 13.5 + Math.sin(time * 2.5) * 0.6;
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(0, -1, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -1, r - 2.2, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const ang = time * 1.15 + (Math.PI * 2 * i) / 8;
      const sx = Math.cos(ang) * r;
      const sy = -1 + Math.sin(ang) * r;
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#ffe066';
      ctx.fillRect(Math.round(sx * 2) * 0.5 - 0.5, Math.round(sy * 2) * 0.5 - 0.5, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;
  }

  // Tier 1: Illuminated Back Crest / Mantle Sigil
  if (tier === 1) {
    const bob = Math.sin(time * 4) * 0.8;
    ctx.fillStyle = '#090712';
    ctx.fillRect(-7, -5 + bob, 14, 3);
    ctx.fillStyle = primary;
    ctx.fillRect(-6, -4.5 + bob, 12, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -4.5 + bob, 3, 0.5);
    ctx.fillRect(2, -4.5 + bob, 3, 0.5);
  }

  // Tier 2 & 3: Articulated Multi-Feather Flapping Wings
  if (tier >= 2) {
    const featherCount = tier >= 3 ? 6 : 5;
    const baseFlap = Math.sin(time * 6.5);
    const wingFill = tier >= 3 ? '#ffe066' : crownCol;
    const wingCore = tier >= 3 ? '#ffffff' : primary;

    for (const side of [-1, 1] as const) {
      for (let f = 0; f < featherCount; f++) {
        const frac = f / (featherCount - 1);
        const reachX = (6.5 + (1 - frac) * (tier >= 3 ? 6.5 : 4.2)) * side;
        const spreadY = -6 + frac * 9 + baseFlap * (1.2 + (1 - frac) * 1.6);
        const thickness = f < 2 ? 2.2 : 1.7;
        const len = Math.abs(reachX);
        const startX = side * 3;
        const x0 = side < 0 ? startX - len : startX;

        // Crisp outline
        ctx.fillStyle = '#090712';
        ctx.fillRect(
          Math.round((x0 - 0.5) * 2) * 0.5,
          Math.round((spreadY - 0.5) * 2) * 0.5,
          len + 1,
          thickness + 1
        );
        // Sculpted feather body
        ctx.fillStyle = f % 2 === 0 ? wingFill : primary;
        ctx.fillRect(
          Math.round(x0 * 2) * 0.5,
          Math.round(spreadY * 2) * 0.5,
          len,
          thickness
        );
        // Leading edge rim highlight
        ctx.fillStyle = wingCore;
        ctx.fillRect(
          Math.round((side < 0 ? x0 : x0 + len - 2.5) * 2) * 0.5,
          Math.round(spreadY * 2) * 0.5,
          2.5,
          0.7
        );
      }

      // Tier 3 Lower Secondary Seraph Pinions
      if (tier >= 3) {
        for (let f = 0; f < 3; f++) {
          const ly = 2 + f * 2.5 - baseFlap * 1.1;
          const lw = 5.5 - f * 1.1;
          const lx = side < 0 ? -3 - lw : 3;
          ctx.fillStyle = '#090712';
          ctx.fillRect(lx - 0.5, ly - 0.5, lw + 1, 2.2);
          ctx.fillStyle = primary;
          ctx.fillRect(lx, ly, lw, 1.4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(side < 0 ? lx : lx + lw - 1.5, ly, 1.5, 0.6);
        }
      }
    }
  }

  // Z-sorted orbital gems (back half: sin(ang) < 0)
  const orbCount = tier >= 3 ? 4 : tier >= 2 ? 2 : 1;
  for (let i = 0; i < orbCount; i++) {
    const ang = time * 2.7 + (Math.PI * 2 * i) / orbCount;
    if (Math.sin(ang) < 0) {
      const ox = Math.cos(ang) * (9 + tier * 2);
      const oy = -2 + Math.sin(ang) * 3.5;
      drawMicroStar(ctx, ox, oy, tier >= 3 ? 1.5 : 1, i % 2 === 0 ? crownCol : '#52e5ff');
    }
  }

  // Rising elemental motes
  const moteCount = 3 + tier * 2;
  for (let i = 0; i < moteCount; i++) {
    const p = (time * 0.65 + i / moteCount) % 1;
    const mx = Math.sin(i * 2.3 + time * 1.6) * (6 + tier * 2.5);
    const my = relFeet - 1 - p * (16 + tier * 3);
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.85;
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : crownCol;
    ctx.fillRect(Math.round(mx * 2) * 0.5, Math.round(my * 2) * 0.5, 1, 1);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Renders foreground evolution adornments anchored accurately above hero head/shoulders:
 * - Tier 1: Glowing elemental pauldrons + floating diamond crest
 * - Tier 2: 3-spike Ascended Diadem + front z-sorted orbital crystal
 * - Tier 3: Floating Sovereign Golden Crown + pulsing Halo ring + 4 orbital stars
 */
export function drawHeroEvolutionFrontLayers(
  ctx: CanvasRenderingContext2D,
  opts: HeroEvolutionRenderOpts
): void {
  const tier = Math.max(0, Math.min(3, Math.floor(opts.tier)));
  if (tier <= 0) return;

  const evo = getHeroEvolutionData(opts.heroId, tier);
  const { time, cx, cy, headTopY } = opts;
  const sc = opts.scale ?? 1;
  const relHead = headTopY - cy;
  const primary = evo.auraColor;
  const crownCol = evo.crownColor;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);

  const bob = Math.sin(time * 4.5) * 0.7;

  if (tier === 1) {
    // Illuminated pauldrons + floating forehead rune diamond
    ctx.fillStyle = '#090712';
    ctx.fillRect(-5.5, -0.5, 2.5, 2.5);
    ctx.fillRect(3, -0.5, 2.5, 2.5);
    ctx.fillStyle = primary;
    ctx.fillRect(-5, 0, 1.8, 1.8);
    ctx.fillRect(3.2, 0, 1.8, 1.8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, 0, 1, 0.6);
    ctx.fillRect(3.5, 0, 1, 0.6);
    drawMicroStar(ctx, 0, relHead - 2.5 + bob, 1.2, crownCol);
  } else if (tier === 2) {
    // Ascended Elemental Diadem
    const y0 = Math.round((relHead - 3 + bob) * 2) * 0.5;
    ctx.fillStyle = '#090712';
    ctx.fillRect(-4.5, y0, 9, 2.5);
    ctx.fillRect(-1.5, y0 - 1.5, 3, 2);
    ctx.fillStyle = crownCol;
    ctx.fillRect(-4, y0 + 0.5, 8, 1.5);
    ctx.fillRect(-4, y0 - 0.5, 1.5, 1.5);
    ctx.fillRect(2.5, y0 - 0.5, 1.5, 1.5);
    ctx.fillRect(-1, y0 - 1, 2, 2.5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.5, y0 - 0.5, 1, 1);
  } else {
    // Tier 3 Floating Sovereign Golden Crown + Radiant Seraph Halo
    const hy = Math.round((relHead - 4.2 + bob) * 2) * 0.5;
    // Outer Halo Ellipse
    ctx.strokeStyle = '#fff5b8';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, hy - 0.5, 6.2, 1.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Sovereign Crown resting beneath halo glow
    ctx.fillStyle = '#090712';
    ctx.fillRect(-5, hy + 0.5, 10, 2.5);
    ctx.fillRect(-2, hy - 1, 4, 2);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(-4.5, hy + 1, 9, 1.5);
    ctx.fillRect(-4.5, hy, 1.5, 1.5);
    ctx.fillRect(3, hy, 1.5, 1.5);
    ctx.fillRect(-1.5, hy - 0.5, 3, 2.5);
    ctx.fillStyle = primary;
    ctx.fillRect(-0.8, hy + 0.5, 1.6, 1.4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-0.4, hy, 0.8, 0.8);

    // Golden shoulder mantles
    ctx.fillStyle = '#090712';
    ctx.fillRect(-6, -1, 3, 2.5);
    ctx.fillRect(3, -1, 3, 2.5);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(-5.5, -0.5, 2, 1.5);
    ctx.fillRect(3.5, -0.5, 2, 1.5);
  }

  // Front half of z-sorted orbital stars
  const orbCount = tier >= 3 ? 4 : tier >= 2 ? 2 : 1;
  for (let i = 0; i < orbCount; i++) {
    const ang = time * 2.7 + (Math.PI * 2 * i) / orbCount;
    if (Math.sin(ang) >= 0) {
      const ox = Math.cos(ang) * (9 + tier * 2);
      const oy = -2 + Math.sin(ang) * 3.5;
      drawMicroStar(ctx, ox, oy, tier >= 3 ? 1.5 : 1, i % 2 === 0 ? crownCol : '#52e5ff');
    }
  }

  ctx.restore();
}
