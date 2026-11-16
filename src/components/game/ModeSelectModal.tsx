// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React from 'react';
import { PLAY_MODES } from '../../game/modes';
import { PlayModeId } from '../../game/types';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface ModeSelectModalProps {
  activeMode: PlayModeId;
  bestSurvivalWave: number;
  bestBossRushSeconds: number | null;
  bestTowerFloor?: number;
  totalUnderworldStars?: number;
  sandboxHousesCount?: number;
  sandboxNpcsCount?: number;
  onSelectMode: (mode: PlayModeId) => void;
  onClose: () => void;
}

function formatSec(sec: number | null): string {
  if (sec === null) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  activeMode,
  bestSurvivalWave,
  bestBossRushSeconds,
  bestTowerFloor = 0,
  totalUnderworldStars = 0,
  sandboxHousesCount = 0,
  sandboxNpcsCount = 0,
  onSelectMode,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modos de Jogo e Desafios"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-4 pointer-events-auto"
    >
      <PixelWindow
        title="Modos de Jogo"
        subtitle="9 experiências completas: Campanha, Submundo (20 Círculos), Mundo Sandbox (Estilo Terraria), Torre Infinita, Rush dos Chefões, Arena, Speedrun e Desafios"
        accentColor="#ffd27d"
        onClose={onClose}
        closeLabel="Fechar Modos de Jogo"
        maxWidthClass="max-w-5xl"
      >
        <div className="max-h-[72vh] overflow-y-auto pr-1 pixel-scroll">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {PLAY_MODES.map((m) => {
              const isActive = activeMode === m.id;
              return (
                <div
                  key={m.id}
                  style={{ borderColor: isActive ? m.accentColor : '#07050d' }}
                  className="pixel-subpanel flex flex-col justify-between p-3.5"
                >
                  <div>
                    <div
                      style={{ borderBottom: `3px solid ${m.accentColor}` }}
                      className="mb-2.5 flex items-center justify-between bg-[#0e0a1a] px-2.5 py-1.5 border-2 border-[#07050d]"
                    >
                      <span
                        style={{ color: m.accentColor }}
                        className="font-pixel text-[11px] font-bold uppercase tracking-wider"
                      >
                        {m.badge}
                      </span>
                      <span className="font-pixel text-[10px] text-[#b8afc9]">
                        {m.difficulty}
                      </span>
                    </div>

                    <h3
                      style={{ color: m.accentColor }}
                      className="font-pixel text-lg font-bold text-stroke-dark"
                    >
                      {m.name}
                    </h3>
                    <div className="font-pixel text-xs text-[#efe8fa]">{m.tagline}</div>
                    <p className="mt-2 font-body-pixel text-[11px] leading-relaxed text-[#c9c0db]">
                      {m.description}
                    </p>

                    <ul className="mt-2.5 space-y-1 border-t border-[#261f38] pt-2">
                      {m.rules.map((r) => (
                        <li key={r} className="flex items-start gap-1.5 font-body-pixel text-[10px] text-[#dcd3eb]">
                          <span style={{ color: m.accentColor }} aria-hidden="true">■</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>

                    {m.id === 'underworld' && (
                      <div className="mt-2 border border-[#590c22] bg-[#240610] px-2 py-1 font-mono-num text-[11px] text-[#ffe066]">
                        Estrelas Submundo: ★ {totalUnderworldStars}/60
                      </div>
                    )}
                    {m.id === 'tower' && (
                      <div className="mt-2 border border-[#163a52] bg-[#0a1b29] px-2 py-1 font-mono-num text-[11px] text-[#38bdf8]">
                        Melhor Andar: {bestTowerFloor > 0 ? `Andar ${bestTowerFloor}` : '--'}
                      </div>
                    )}
                    {m.id === 'boss_rush' && (
                      <div className="mt-2 border border-[#3a1f2e] bg-[#1b0c18] px-2 py-1 font-mono-num text-[11px] text-[#ffd27d]">
                        Recorde Rush: {formatSec(bestBossRushSeconds)}
                      </div>
                    )}
                    {m.id === 'survival' && (
                      <div className="mt-2 border border-[#173d36] bg-[#0a211d] px-2 py-1 font-mono-num text-[11px] text-[#4df0c0]">
                        Melhor Onda: {bestSurvivalWave > 0 ? `Onda ${bestSurvivalWave}` : '--'}
                      </div>
                    )}
                    {m.id === 'sandbox_world' && (
                      <div className="mt-2 border border-[#174239] bg-[#0a211d] px-2 py-1 font-mono-num text-[11px] text-[#4df0c0]">
                        Mundo 1600×320 · Casas: {sandboxHousesCount} · NPCs: {sandboxNpcsCount}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-1">
                    <PixelButton
                      type="button"
                      variant={isActive ? 'gold' : 'cyan'}
                      data-testid={`play-mode-${m.id}`}
                      onClick={() => onSelectMode(m.id)}
                      className="w-full py-2 text-xs"
                    >
                      <PixelIcon name="play" className="h-3.5 w-3.5" />
                      <span>{isActive ? `Jogar ${m.name}` : `Iniciar ${m.name}`}</span>
                    </PixelButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};
