// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React from 'react';
import { LORE_CODEX } from '../../game/cutscenes';
import { CutsceneId } from '../../game/types';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface ChroniclesModalProps {
  seenCutscenes: CutsceneId[];
  onPlayCutscene: (id: CutsceneId) => void;
  onClose: () => void;
}

export const ChroniclesModal: React.FC<ChroniclesModalProps> = ({
  seenCutscenes,
  onPlayCutscene,
  onClose,
}) => {
  const seenSet = new Set<CutsceneId>(seenCutscenes);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crônicas e Cutscenes de Aethelgard"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#05040a]/85 p-4 pointer-events-auto"
    >
      <PixelWindow
        title="Crônicas de Aethelgard"
        subtitle={`História da Campanha & Teatro de Cutscenes (${Math.max(1, seenCutscenes.length)}/${LORE_CODEX.length})`}
        accentColor="#ffd27d"
        onClose={onClose}
        closeLabel="Fechar Crônicas"
        maxWidthClass="max-w-3xl"
      >
        <div className="max-h-[66vh] space-y-2.5 overflow-y-auto pr-1">
          {LORE_CODEX.map((entry) => {
            const unlocked = entry.id === 'prologue' || seenSet.has(entry.id);
            return (
              <div
                key={entry.id}
                style={{ borderColor: unlocked ? entry.accentColor : '#31274a' }}
                className="pixel-subpanel flex flex-wrap items-center justify-between gap-3 border-2 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ color: entry.accentColor }}
                      className="font-pixel text-xs font-bold uppercase tracking-wider"
                    >
                      {entry.chapterLabel}
                    </span>
                    <span className="text-[#5c5373]">·</span>
                    <strong className="font-pixel text-base font-bold text-[#f5efe6]">
                      {entry.title}
                    </strong>
                  </div>
                  <p className="mt-1 font-body-pixel text-xs leading-relaxed text-[#c9c0db]">
                    {unlocked
                      ? entry.summary
                      : 'Explore novas fases da campanha para revelar esta crônica.'}
                  </p>
                </div>

                <div className="shrink-0">
                  {unlocked ? (
                    <PixelButton
                      type="button"
                      variant="cyan"
                      onClick={() => onPlayCutscene(entry.id)}
                      className="px-3.5 py-2 text-xs"
                    >
                      <PixelIcon name="play" className="h-3.5 w-3.5" />
                      <span>Assistir Cena</span>
                    </PixelButton>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 border-2 border-[#07050d] bg-[#1a1526] px-3 py-1.5 font-pixel text-xs text-[#7d7491]">
                      <PixelIcon name="lock" className="h-3.5 w-3.5" />
                      <span>Bloqueada</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PixelWindow>
    </div>
  );
};
