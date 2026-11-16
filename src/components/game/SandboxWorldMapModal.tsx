// @ts-nocheck -- UI module
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/engine';
import {
  SANDBOX_COLS,
  SANDBOX_ROWS,
  SANDBOX_SECTOR_COLS,
  SANDBOX_SECTOR_TILE_SIZE,
  SANDBOX_SURFACE_REGIONS,
} from '../../game/sandboxBiomes';
import { SANDBOX_TILE_META, SB_TILE } from '../../game/sandboxWorld';
import { HudSnapshot, TILE_SIZE } from '../../game/types';
import { PixelButton, PixelWindow } from './PixelUi';

interface SandboxWorldMapModalProps {
  engine: GameEngine;
  hud: HudSnapshot;
  onTeleportPylon: (tx: number, ty: number) => void;
  onClose: () => void;
}

const MAP_W = 600;
const MAP_H = 80; // 4800 / 8 = 600, 640 / 8 = 80 exact 1:8 ratio!

export const SandboxWorldMapModal: React.FC<SandboxWorldMapModalProps> = ({
  engine,
  hud,
  onTeleportPylon,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPylon, setHoveredPylon] = useState<{ tx: number; ty: number; label: string; color: string } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    const world = engine.sandboxWorld;
    if (!c || !world) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    // Sky-to-abyss gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, MAP_H);
    bg.addColorStop(0, '#091026');
    bg.addColorStop(0.32, '#131d3a');
    bg.addColorStop(0.42, '#140f1e');
    bg.addColorStop(0.75, '#190b18');
    bg.addColorStop(1, '#26080d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // Draw terrain at 8x8 block downsampling (600x80)
    const img = ctx.getImageData(0, 0, MAP_W, MAP_H);
    const data = img.data;
    const hexCache = new Map<number, [number, number, number]>();
    const getRgb = (tile: number): [number, number, number] => {
      let c3 = hexCache.get(tile);
      if (c3) return c3;
      const hex = SANDBOX_TILE_META[tile]?.color ?? '#64748b';
      const clean = hex.replace('#', '');
      const num = parseInt(clean.length >= 6 ? clean.slice(0, 6) : '64748b', 16);
      c3 = [(num >> 16) & 255, (num >> 8) & 255, num & 255];
      hexCache.set(tile, c3);
      return c3;
    };

    for (let my = 0; my < MAP_H; my++) {
      const ty = my * 8 + 4;
      const sy = Math.floor(ty / SANDBOX_SECTOR_TILE_SIZE);
      for (let mx = 0; mx < MAP_W; mx++) {
        const tx = mx * 8 + 4;
        const sx = Math.floor(tx / SANDBOX_SECTOR_TILE_SIZE);
        const explored = world.exploredSectors[sy * SANDBOX_SECTOR_COLS + sx] > 0;

        // Pick dominant non-air tile inside small 4x4 probe for sharp caves & platforms
        let picked = world.tiles[ty * world.cols + tx];
        if (picked === SB_TILE.AIR) {
          const t2 = world.tiles[(ty - 2) * world.cols + tx];
          const t3 = world.tiles[ty * world.cols + Math.min(world.cols - 1, tx + 2)];
          picked = t2 !== SB_TILE.AIR ? t2 : t3;
        }
        if (picked === SB_TILE.AIR) continue;

        const [r, g, b] = getRgb(picked);
        const pIdx = (my * MAP_W + mx) * 4;
        const dim = explored ? 1 : 0.42;
        data[pIdx] = Math.round(r * dim);
        data[pIdx + 1] = Math.round(g * dim);
        data[pIdx + 2] = Math.round(b * dim);
        data[pIdx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Subtle Fog-of-War overlay on unexplored 40x40 sectors (5x5 map px)
    for (let sy = 0; sy < 16; sy++) {
      for (let sx = 0; sx < SANDBOX_SECTOR_COLS; sx++) {
        if (world.exploredSectors[sy * SANDBOX_SECTOR_COLS + sx] === 0) {
          ctx.fillStyle = 'rgba(5, 4, 10, 0.48)';
          ctx.fillRect(sx * 5, sy * 5, 5, 5);
        }
      }
    }

    // Region separator lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    for (const reg of SANDBOX_SURFACE_REGIONS) {
      const rx = Math.round(reg.minTx / 8);
      if (rx > 0) {
        ctx.beginPath();
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, MAP_H);
        ctx.stroke();
      }
    }

    // Validated Houses
    for (const h of world.houses) {
      ctx.fillStyle = '#4df0c0';
      ctx.fillRect(Math.round(h.centerTx / 8) - 2, Math.round(h.centerTy / 8) - 2, 4, 4);
    }

    // Teleport Pylons
    for (const py of world.pylons) {
      const px = Math.round(py.tx / 8);
      const ppy = Math.round(py.ty / 8);
      ctx.fillStyle = '#07050d';
      ctx.fillRect(px - 3, ppy - 3, 6, 6);
      ctx.fillStyle = py.color;
      ctx.fillRect(px - 2, ppy - 2, 4, 4);
    }

    // Active Bosses
    for (const foe of world.enemies) {
      if (foe.isBoss && foe.hp > 0) {
        const bx = Math.round(foe.x / TILE_SIZE / 8);
        const by = Math.round(foe.y / TILE_SIZE / 8);
        ctx.fillStyle = '#ff2e63';
        ctx.fillRect(bx - 3, by - 3, 6, 6);
      }
    }

    // Player Marker
    const plX = Math.round(hud.sandboxPlayerTx / 8);
    const plY = Math.round(hud.sandboxPlayerTy / 8);
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plX - 4, plY - 4, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(plX - 2, plY - 2, 4, 4);
  }, [engine.sandboxWorld, hud.sandboxPlayerTx, hud.sandboxPlayerTy, hud.sandboxExplorationPct]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickTx = ((e.clientX - rect.left) / rect.width) * SANDBOX_COLS;
    const clickTy = ((e.clientY - rect.top) / rect.height) * SANDBOX_ROWS;
    let best: { tx: number; ty: number; label: string; color: string } | null = null;
    let bestD = 160;
    for (const py of hud.sandboxPylons) {
      const d = Math.hypot(py.tx - clickTx, (py.ty - clickTy) * 2.5);
      if (d < bestD) {
        bestD = d;
        best = py;
      }
    }
    if (best) {
      onTeleportPylon(best.tx, best.ty);
    }
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverTx = ((e.clientX - rect.left) / rect.width) * SANDBOX_COLS;
    const hoverTy = ((e.clientY - rect.top) / rect.height) * SANDBOX_ROWS;
    let best: { tx: number; ty: number; label: string; color: string } | null = null;
    let bestD = 140;
    for (const py of hud.sandboxPylons) {
      const d = Math.hypot(py.tx - hoverTx, (py.ty - hoverTy) * 2.5);
      if (d < bestD) {
        bestD = d;
        best = py;
      }
    }
    setHoveredPylon(best);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atlas do Mundo Aberto Conectado"
      data-testid="sandbox-world-map-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-3 sm:p-4 pointer-events-auto"
    >
      <PixelWindow
        title="Atlas do Mundo Aberto Conectado"
        subtitle={`${SANDBOX_COLS}×${SANDBOX_ROWS} blocos · 24 Biomas Interligados · ${hud.sandboxExplorationPct}% Explorado`}
        accentColor="#4df0c0"
        onClose={onClose}
        closeLabel="Fechar Atlas Mundial"
        maxWidthClass="max-w-5xl"
      >
        <div className="flex flex-col gap-3">
        {/* Top Metrics Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-2 border-[#07050d] bg-[#0b0816] px-3 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-pixel text-[#4df0c0]">
              Bioma Atual: <strong className="text-[#f5efe6]">{hud.sandboxBiomeName}</strong>
            </span>
            <span className="font-mono-num text-[#52e5ff]">
              Posição: ({hud.sandboxPlayerTx}, {hud.sandboxPlayerTy})
            </span>
            <span className="font-mono-num text-[#ffe066]">
              Exploração: {hud.sandboxExplorationPct}%
            </span>
          </div>
          <div className="flex items-center gap-3 font-pixel text-[10px] text-[#b8afc9]">
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 border border-[#ffe066] bg-white" /> Você
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 bg-[#52e5ff]" /> Pilão (Teleporte)
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-2.5 w-2.5 bg-[#4df0c0]" /> Casas ({hud.sandboxHousesCount})
            </span>
          </div>
        </div>

        {/* Region Header Labels */}
        <div className="relative overflow-hidden border-2 border-[#41385e] bg-[#07050e] p-2">
          <div className="mb-1 flex text-[8px] font-pixel text-[#b8afc9]">
            {SANDBOX_SURFACE_REGIONS.map((reg) => {
              const widthPct = ((reg.maxTx - reg.minTx) / SANDBOX_COLS) * 100;
              return (
                <div
                  key={reg.id}
                  style={{ width: `${widthPct}%`, color: reg.color }}
                  title={reg.label}
                  className="truncate border-l border-[#29223d] pl-1"
                >
                  {reg.label.split(' ')[0]}
                </div>
              );
            })}
          </div>

          <canvas
            ref={canvasRef}
            width={MAP_W}
            height={MAP_H}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setHoveredPylon(null)}
            style={{ imageRendering: 'pixelated' }}
            className="w-full cursor-crosshair border-2 border-[#07050d] bg-[#05040a]"
          />

          <div className="mt-1.5 flex items-center justify-between text-[10px]">
            <span className="font-body-pixel text-[#c7bddb]">
              {hoveredPylon
                ? `Clique para teleportar até: ${hoveredPylon.label} (${hoveredPylon.tx}, ${hoveredPylon.ty})`
                : 'Clique diretamente em qualquer Pilão colorido no mapa (ou nos cartões abaixo) para viajar instantaneamente.'}
            </span>
            <span className="font-mono-num text-[#ffd27d]">
              {hud.sandboxPylons.length} Pilões Ativos
            </span>
          </div>
        </div>

        {/* Clickable Biome Pylon Teleport Grid */}
        <div>
          <div className="mb-1.5 font-pixel text-[11px] uppercase tracking-wider text-[#ffd27d]">
            Rede de Teleporte Interligada (24 Biomas · 1 Mundo Contínuo)
          </div>
          <div className="grid max-h-[210px] grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-5 pixel-scroll">
            {hud.sandboxPylons.map((py) => (
              <button
                key={`${py.tx}_${py.ty}`}
                type="button"
                data-testid={`map-pylon-${py.tx}-${py.ty}`}
                onClick={() => onTeleportPylon(py.tx, py.ty)}
                style={{ borderColor: py.color }}
                className="flex flex-col justify-between border-2 bg-[#120d21] p-2 text-left transition-transform hover:-translate-y-0.5 hover:bg-[#1e1638]"
              >
                <span style={{ color: py.color }} className="truncate font-pixel text-[11px] font-bold">
                  ✦ {py.label}
                </span>
                <span className="mt-1 font-mono-num text-[9px] text-[#b8afc9]">
                  X:{py.tx} · Y:{py.ty}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <PixelButton type="button" variant="slate" onClick={onClose} className="px-4 py-1.5 text-xs">
            Voltar ao Mundo [M / Esc]
          </PixelButton>
        </div>
        </div>
      </PixelWindow>
    </div>
  );
};
