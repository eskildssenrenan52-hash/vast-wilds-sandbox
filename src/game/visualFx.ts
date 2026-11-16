// @ts-nocheck
// High-performance Canvas2D visual polish utilities:
// - Cached offscreen radial glow stamps (eliminates per-frame createRadialGradient GC churn)
// - Pure color manipulation & luminance helpers
// - 0.5-virtual-pixel (true 640x360 native micro-pixel) snapping helpers

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const rgbCache = new Map<string, RgbColor>();
const glowStampCache = new Map<string, HTMLCanvasElement>();
const MAX_GLOW_CACHE = 180;

export function parseHexColor(color: string): RgbColor {
  if (!color) return { r: 255, g: 255, b: 255 };
  const cached = rgbCache.get(color);
  if (cached) return cached;

  let res: RgbColor = { r: 255, g: 255, b: 255 };
  if (color.startsWith('#')) {
    const raw = color.slice(1);
    if (raw.length === 3 || raw.length === 4) {
      res = {
        r: parseInt(raw[0] + raw[0], 16) || 0,
        g: parseInt(raw[1] + raw[1], 16) || 0,
        b: parseInt(raw[2] + raw[2], 16) || 0,
      };
    } else if (raw.length >= 6) {
      res = {
        r: parseInt(raw.slice(0, 2), 16) || 0,
        g: parseInt(raw.slice(2, 4), 16) || 0,
        b: parseInt(raw.slice(4, 6), 16) || 0,
      };
    }
  } else if (color.startsWith('rgb')) {
    const m = color.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) {
      res = {
        r: Math.min(255, Math.max(0, Number(m[1]) || 0)),
        g: Math.min(255, Math.max(0, Number(m[2]) || 0)),
        b: Math.min(255, Math.max(0, Number(m[3]) || 0)),
      };
    }
  }
  rgbCache.set(color, res);
  return res;
}

export function mixHexColors(hexA: string, hexB: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const a = parseHexColor(hexA);
  const b = parseHexColor(hexB);
  const r = Math.round(a.r + (b.r - a.r) * clamped)
    .toString(16)
    .padStart(2, '0');
  const g = Math.round(a.g + (b.g - a.g) * clamped)
    .toString(16)
    .padStart(2, '0');
  const bl = Math.round(a.b + (b.b - a.b) * clamped)
    .toString(16)
    .padStart(2, '0');
  return `#${r}${g}${bl}`;
}

export function colorWithAlpha(color: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const { r, g, b } = parseHexColor(color);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

export function colorLuminance(color: string): number {
  const { r, g, b } = parseHexColor(color);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function quantizeGlowRadius(radius: number): number {
  const r = Math.max(4, Math.min(128, Math.round(radius)));
  return Math.max(4, Math.round(r / 4) * 4);
}

/** Snap coordinate to 0.5 virtual pixels (exact 1px on the 640x360 render buffer). */
export function snapHalf(v: number): number {
  return Math.round(v * 2) * 0.5;
}

function getGlowStamp(color: string, radius: number, coreWhite = false): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const qRad = quantizeGlowRadius(radius);
  const { r, g, b } = parseHexColor(color);
  const key = `${r},${g},${b}:${qRad}:${coreWhite ? 1 : 0}`;
  const existing = glowStampCache.get(key);
  if (existing) return existing;

  if (glowStampCache.size >= MAX_GLOW_CACHE) {
    const firstKey = glowStampCache.keys().next().value;
    if (firstKey) glowStampCache.delete(firstKey);
  }

  const size = qRad * 2;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const gctx = c.getContext('2d');
  if (!gctx) return null;

  const grad = gctx.createRadialGradient(qRad, qRad, 0, qRad, qRad, qRad);
  if (coreWhite) {
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.22, `rgba(${r},${g},${b},0.72)`);
    grad.addColorStop(0.55, `rgba(${r},${g},${b},0.22)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  } else {
    grad.addColorStop(0, `rgba(${r},${g},${b},0.92)`);
    grad.addColorStop(0.32, `rgba(${r},${g},${b},0.46)`);
    grad.addColorStop(0.68, `rgba(${r},${g},${b},0.12)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  }
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, size, size);
  glowStampCache.set(key, c);
  return c;
}

/**
 * Draws a pre-baked radial soft glow centered at (cx, cy).
 * Much faster than per-frame createRadialGradient and supports vertical squash for floor light pools.
 */
export function drawCachedGlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  alpha = 0.5,
  scaleY = 1,
  coreWhite = false
): void {
  if (alpha <= 0.01 || radius <= 1) return;
  const stamp = getGlowStamp(color, radius, coreWhite);
  if (!stamp) return;
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * Math.max(0, Math.min(1, alpha));
  const w = radius * 2;
  const h = radius * 2 * scaleY;
  ctx.drawImage(stamp, cx - radius, cy - radius * scaleY, w, h);
  ctx.globalAlpha = prevAlpha;
}

/** Draws a crisp specular 4-point star sparkle at sub-pixel precision. */
export function drawMicroSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  armLen: number,
  color: string,
  alpha = 1
): void {
  if (alpha <= 0.05) return;
  const prev = ctx.globalAlpha;
  const sx = snapHalf(cx);
  const sy = snapHalf(cy);
  ctx.globalAlpha = prev * alpha;
  ctx.fillStyle = color;
  ctx.fillRect(sx - armLen, sy - 0.5, armLen * 2, 1);
  ctx.fillRect(sx - 0.5, sy - armLen, 1, armLen * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(sx - 0.5, sy - 0.5, 1, 1);
  ctx.globalAlpha = prev;
}
