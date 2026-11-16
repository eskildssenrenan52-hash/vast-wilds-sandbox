// @ts-nocheck -- imported game code, written for a looser TS config
import { useEffect, useRef } from 'react';

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  hue: number;
  ember: boolean;
  sparkle: boolean;
  phase: number;
};

const EMBER_BUCKETS = [16, 22, 28, 34, 42] as const;

function buildEmberCache(): HTMLCanvasElement[] {
  if (typeof document === 'undefined') return [];
  return EMBER_BUCKETS.map((hue) => {
    const size = 32;
    const off = document.createElement('canvas');
    off.width = size;
    off.height = size;
    const octx = off.getContext('2d');
    if (octx) {
      const c = size * 0.5;
      const g = octx.createRadialGradient(c, c, 0, c, c, c);
      g.addColorStop(0, `hsla(${hue + 14}, 100%, 92%, 1)`);
      g.addColorStop(0.18, `hsla(${hue}, 100%, 72%, 0.85)`);
      g.addColorStop(0.48, `hsla(${hue - 4}, 100%, 54%, 0.28)`);
      g.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      octx.fillStyle = g;
      octx.fillRect(0, 0, size, size);
    }
    return off;
  });
}

/** Atmospheric layer: drifting cached-glow embers, crisp bokeh sparkles, ash motes and dual-core volumetric light shafts. */
export function CinematicFX({ playing }: { playing: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const emberStamps = buildEmberCache();
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = 0.5;
    const resize = () => {
      w = Math.max(320, c.clientWidth);
      h = Math.max(180, c.clientHeight);
      c.width = Math.max(160, Math.floor(w * dpr));
      c.height = Math.max(90, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const motes: Mote[] = [];
    const spawn = (anywhere: boolean): Mote => {
      const ember = Math.random() < 0.48;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 12,
        vx: (Math.random() - 0.3) * 15,
        vy: -(ember ? 18 + Math.random() * 42 : 4 + Math.random() * 11),
        r: ember ? 0.9 + Math.random() * 2.0 : 0.6 + Math.random() * 1.25,
        life: 0,
        max: 4 + Math.random() * 7,
        hue: Math.floor(Math.random() * EMBER_BUCKETS.length),
        ember,
        sparkle: ember && Math.random() < 0.28,
        phase: Math.random() * Math.PI * 2,
      };
    };
    for (let i = 0; i < 36; i++) motes.push(spawn(true));

    let last = performance.now();
    let lastDraw = 0;
    let t = 0;
    const tick = (now: number) => {
      const interval = playingRef.current ? 55 : 140;
      if (lastDraw !== 0 && now - lastDraw < interval) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastDraw = now;
      const dt = Math.min((now - last) / 1000, 0.12);
      last = now;
      t += dt;
      ctx.clearRect(0, 0, w, h);

      // Volumetric dual-core light shafts
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 4; i++) {
        const sway = Math.sin(t * 0.13 + i * 1.7) * w * 0.06;
        const x = w * (0.14 + i * 0.24) + sway;
        const a = 0.036 + 0.024 * Math.sin(t * 0.4 + i * 2.1);
        const g = ctx.createLinearGradient(x, 0, x - w * 0.25, h);
        g.addColorStop(0, `rgba(255, 205, 145, ${a * 1.65})`);
        g.addColorStop(0.55, `rgba(255, 145, 95, ${a * 0.52})`);
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.032, -10);
        ctx.lineTo(x + w * 0.052, -10);
        ctx.lineTo(x - w * 0.18, h);
        ctx.lineTo(x - w * 0.38, h);
        ctx.closePath();
        ctx.fill();

        // Crisp inner shaft filament
        ctx.fillStyle = `rgba(255, 232, 196, ${a * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.002, -10);
        ctx.lineTo(x + w * 0.014, -10);
        ctx.lineTo(x - w * 0.25, h);
        ctx.lineTo(x - w * 0.275, h);
        ctx.closePath();
        ctx.fill();
      }

      // Embers (using cached sprite stamps) and ash motes
      const target = playingRef.current ? 64 : 56;
      while (motes.length < target) motes.push(spawn(false));
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i]!;
        m.life += dt;
        m.x += (m.vx + Math.sin(t * 1.3 + m.y * 0.02 + m.phase) * 11) * dt;
        m.y += m.vy * dt;
        const k = m.life / m.max;
        if (k >= 1 || m.y < -20) {
          motes.splice(i, 1);
          continue;
        }
        const fade = Math.sin(Math.PI * k);
        const flick = m.ember ? 0.72 + 0.28 * Math.sin(t * 12 + m.phase + i) : 1;
        if (m.ember) {
          const rr = m.r * 5.2;
          const stamp = emberStamps[m.hue] ?? emberStamps[0];
          const alpha = Math.min(1, 0.92 * fade * flick);
          if (stamp) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(stamp, m.x - rr, m.y - rr, rr * 2, rr * 2);
            ctx.globalAlpha = 1;
          }
          // Crisp 4-point bokeh glint on standout embers
          if (m.sparkle && flick > 0.8) {
            const sp = m.r * 1.6;
            ctx.fillStyle = `rgba(255, 248, 220, ${alpha * 0.85})`;
            ctx.fillRect(m.x - sp, m.y - 0.5, sp * 2, 1);
            ctx.fillRect(m.x - 0.5, m.y - sp, 1, sp * 2);
          }
        } else {
          ctx.fillStyle = `rgba(210, 206, 228, ${0.24 * fade})`;
          ctx.fillRect(m.x - m.r * 0.5, m.y - m.r * 0.5, m.r, m.r);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="game-atmos pointer-events-none absolute inset-0 h-full w-full" />;
}
