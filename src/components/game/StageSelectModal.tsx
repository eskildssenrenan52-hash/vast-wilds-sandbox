// @ts-nocheck — typed under the applet tsconfig
import React, { useMemo, useState } from 'react';
import { ChapterDef, HudSnapshot, PlayModeId } from '../../game/types';
import { getAnyBiomeMeta } from '../../game/worldDataUnderworld';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface StageSelectModalProps {
  hud: HudSnapshot;
  playMode?: PlayModeId;
  chapters: ChapterDef[];
  collectedRelics: Set<string>;
  onSelectChapter: (chapterIdx: number) => void;
  onFastTravelStage: (stageId: string) => void;
  onClose: () => void;
}

const SURFACE_ACT_RANGES = [
  { id: 0, label: 'Ato I · 1–10', min: 0, max: 9, color: '#52e5ff' },
  { id: 1, label: 'Ato II · 11–20', min: 10, max: 19, color: '#ffd27d' },
  { id: 2, label: 'Ato III · 21–30', min: 20, max: 29, color: '#4df0c0' },
  { id: 3, label: 'Ato IV · 31–40', min: 30, max: 39, color: '#e879f9' },
  { id: 4, label: 'Ato V · 41–50', min: 40, max: 49, color: '#ff5c8a' },
  { id: -1, label: 'Todos (50)', min: 0, max: 99, color: '#f5efe6' },
];

const UNDERWORLD_ACT_RANGES = [
  { id: 0, label: 'Círculos 1–5', min: 0, max: 4, color: '#2dd4bf' },
  { id: 1, label: 'Círculos 6–10', min: 5, max: 9, color: '#f59e0b' },
  { id: 2, label: 'Círculos 11–15', min: 10, max: 14, color: '#c084fc' },
  { id: 3, label: 'Círculos 16–20', min: 15, max: 19, color: '#ff2e63' },
  { id: -1, label: 'Todos (20)', min: 0, max: 99, color: '#ffd27d' },
];

function formatBest(sec: number | null): string {
  if (sec === null) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  hud,
  playMode = 'campaign',
  chapters,
  collectedRelics,
  onSelectChapter,
  onFastTravelStage,
  onClose,
}) => {
  const isUnderworld = playMode === 'underworld' || chapters.length === 20;
  const actRanges = isUnderworld ? UNDERWORLD_ACT_RANGES : SURFACE_ACT_RANGES;
  const unlockAllModes = playMode === 'speedrun' || playMode === 'mirror_void';
  const visitedSet = new Set(hud.visitedStages);
  const shrineSet = new Set(hud.unlockedShrines);
  const activeChapter = chapters[hud.chapterIndex] ?? chapters[0];

  const defaultAct = isUnderworld
    ? Math.min(3, Math.floor((hud.chapterIndex ?? 0) / 5))
    : Math.min(4, Math.floor((hud.chapterIndex ?? 0) / 10));
  const [selectedAct, setSelectedAct] = useState<number>(defaultAct);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChapters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return chapters.filter((ch) => {
      if (q) {
        return (
          ch.name.toLowerCase().includes(q) ||
          ch.subtitle.toLowerCase().includes(q) ||
          String(ch.index + 1) === q
        );
      }
      if (selectedAct === -1) return true;
      const range = actRanges.find((a) => a.id === selectedAct);
      return range ? ch.index >= range.min && ch.index <= range.max : true;
    });
  }, [chapters, searchQuery, selectedAct, actRanges]);

  const maxGx = Math.max(...activeChapter.stages.map((s) => s.gx), 0);
  const maxGy = Math.max(...activeChapter.stages.map((s) => s.gy), 0);
  const stageCoordMap = new Map(activeChapter.stages.map((s) => [`${s.gx},${s.gy}`, s]));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Seleção de Fases e Etapas"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-4 pointer-events-auto"
    >
      <PixelWindow
        title={isUnderworld ? `Submundo · 20 Círculos Infernais` : `Seleção de Mundos (${chapters.length} Biomas)`}
        subtitle={`Estrelas Totais: ${hud.totalWorldStars ?? 0}/${chapters.length * 3}★ · ${
          isUnderworld ? 'Campanha Extrema Feita à Mão — 100 Etapas Únicas' : 'Conclua cada mundo ou explore por Atos'
        }`}
        accentColor={isUnderworld ? '#ff2e63' : '#ffd27d'}
        onClose={onClose}
        closeLabel="Fechar seleção de fases"
        maxWidthClass="max-w-5xl"
      >
        {/* Act Tabs & Filter Input */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-2 border-[#07050d] bg-[#100b1d] p-2">
          <div className="flex flex-wrap items-center gap-1">
            {actRanges.map((act) => (
              <PixelButton
                key={act.id}
                type="button"
                variant={selectedAct === act.id && !searchQuery ? 'gold' : 'slate'}
                onClick={() => {
                  setSelectedAct(act.id);
                  setSearchQuery('');
                }}
                className="px-2.5 py-1 text-[11px]"
              >
                <span
                  style={{ backgroundColor: act.color }}
                  className="inline-block h-2 w-2 border border-[#07050d]"
                  aria-hidden="true"
                />
                <span>{act.label}</span>
              </PixelButton>
            ))}
          </div>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar bioma ou nº..."
            aria-label="Buscar mundo ou bioma"
            className="w-full sm:w-48 border-2 border-[#07050d] bg-[#0b0816] px-2.5 py-1 font-body-pixel text-xs text-[#f5efe6] placeholder-[#7b7094] focus:border-[#52e5ff] focus:outline-none"
          />
        </div>

        <div className="max-h-[64vh] overflow-y-auto pr-1 pixel-scroll">
          {/* Worlds Grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((ch) => {
              const rec = hud.chapterRecords[ch.index] ?? {
                unlocked: ch.index === 0,
                cleared: false,
                bestTimeSeconds: null,
                fewestDeaths: null,
              };
              const isUnlocked = rec.unlocked || unlockAllModes;
              const meta = getAnyBiomeMeta(ch.id);
              const isCurrent = hud.chapterIndex === ch.index;
              const stars = hud.worldStars?.[ch.index] ?? (rec.cleared ? 1 : 0);
              const relicsHere = ch.stages.reduce(
                (acc, st) =>
                  acc +
                  st.entities.filter(
                    (e) =>
                      (e.kind === 'relic' || e.kind === 'winged_relic') &&
                      collectedRelics.has(e.id)
                  ).length,
                0
              );

              return (
                <div
                  key={ch.id}
                  style={{
                    borderColor: isCurrent ? '#ffd27d' : '#07050d',
                  }}
                  className="pixel-subpanel flex flex-col justify-between p-3"
                >
                  <div>
                    {/* Biome Color Strip */}
                    <div
                      style={{
                        backgroundColor: meta.skyMid,
                        borderBottom: `3px solid ${ch.accent}`,
                      }}
                      className="mb-2.5 flex items-center justify-between px-2.5 py-2 border-2 border-[#07050d]"
                    >
                      <span className="font-pixel text-xs font-bold" style={{ color: ch.accent }}>
                        {isUnderworld ? `CÍRCULO ${ch.index + 1}` : `MUNDO ${ch.index + 1}`}
                      </span>
                      <span className="flex items-center gap-1.5 font-pixel text-xs">
                        {stars > 0 && (
                          <span className="font-mono-num text-[11px] font-bold text-[#ffe066]">
                            {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
                          </span>
                        )}
                        {rec.cleared ? (
                          <span className="flex items-center gap-1 text-[#4df0c0]">
                            <PixelIcon name="check" className="h-3.5 w-3.5" />
                            OK
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[#ffd27d]">Disponível</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#7b7094]">
                            <PixelIcon name="lock" className="h-3.5 w-3.5" />
                            Bloq.
                          </span>
                        )}
                      </span>
                    </div>

                    <h3 className="font-pixel text-base font-bold text-[#f5efe6]">
                      {ch.name.replace(/^(Fase \d+ · |Círculo [IVXLCDM]+ · )/, '')}
                    </h3>
                    <p className="font-body-pixel text-[11px] text-[#a9a0bd]">{ch.subtitle}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-num text-[11px] text-[#d6cde8]">
                      <span>{ch.stages.length} Etapas</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Relíquias {relicsHere}/{ch.totalRelics}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Recorde {formatBest(rec.bestTimeSeconds)}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <PixelButton
                      type="button"
                      variant={isCurrent ? 'gold' : isUnlocked ? 'cyan' : 'slate'}
                      disabled={!isUnlocked}
                      onClick={() => onSelectChapter(ch.index)}
                      className="w-full py-1.5 text-sm"
                    >
                      {!isUnlocked ? (
                        <>
                          <PixelIcon name="lock" className="h-3.5 w-3.5" />
                          <span>Conclua o {isUnderworld ? 'Círculo' : 'Mundo'} {ch.index}</span>
                        </>
                      ) : isCurrent ? (
                        <>
                          <PixelIcon name="play" className="h-3.5 w-3.5" />
                          <span>Reiniciar {isUnderworld ? 'Círculo' : 'Mundo'} {ch.index + 1}</span>
                        </>
                      ) : (
                        <>
                          <PixelIcon name="play" className="h-3.5 w-3.5" />
                          <span>Jogar {isUnderworld ? 'Círculo' : 'Mundo'} {ch.index + 1}</span>
                        </>
                      )}
                    </PixelButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Chapter Stage Mini-Map */}
          <div className="pixel-subpanel mt-4 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[#07050d]">
              <div>
                <h3 className="font-pixel text-base font-bold text-[#e8a87c]">
                  Mapa Interno · {activeChapter.name}
                </h3>
                <p className="font-body-pixel text-[11px] text-[#a9a0bd]">
                  Etapas conectadas deste mundo · Clique em uma Fogueira acesa para viajar
                </p>
              </div>
              <span className="font-mono-num text-xs text-[#ffd27d]">
                Etapa {hud.stageNumber}/{hud.totalStagesInChapter} · {hud.roomName}
              </span>
            </div>

            <div
              style={{ gridTemplateColumns: `repeat(${maxGx + 1}, minmax(0, 1fr))` }}
              className="mt-3 grid gap-1.5"
            >
              {Array.from({ length: maxGy + 1 }).map((_, gy) =>
                Array.from({ length: maxGx + 1 }).map((__, gx) => {
                  const st = stageCoordMap.get(`${gx},${gy}`);
                  if (!st) {
                    return <div key={`empty_${gx}_${gy}`} className="h-11 bg-[#0b0814]/40 border border-[#1d172e]" />;
                  }
                  const visited = visitedSet.has(st.id);
                  const isCurrent = hud.currentRoomId === st.id;
                  const hasShrine = shrineSet.has(st.id);

                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={!hasShrine}
                      onClick={() => hasShrine && onFastTravelStage(st.id)}
                      title={visited ? st.name : `Etapa ${st.stageIndex + 1} (não visitada)`}
                      aria-label={visited ? `${st.name}${hasShrine ? ' - Viajar para fogueira' : ''}` : `Etapa ${st.stageIndex + 1}`}
                      style={{
                        backgroundColor: isCurrent
                          ? '#3d2f1e'
                          : visited
                            ? getAnyBiomeMeta(activeChapter.id).mountainNear
                            : '#120e1c',
                        borderColor: isCurrent ? '#ffd27d' : visited ? activeChapter.accent : '#2a223d',
                      }}
                      className={`flex h-11 items-center justify-center gap-1.5 border-2 px-2 font-pixel text-xs ${
                        hasShrine ? 'cursor-pointer hover:brightness-125' : 'cursor-default'
                      }`}
                    >
                      {isCurrent && <PixelIcon name="pin" className="h-4 w-4" />}
                      {!isCurrent && hasShrine && <PixelIcon name="flame" className="h-4 w-4" />}
                      {!isCurrent && !hasShrine && st.stageIndex === activeChapter.stages.length - 1 && (
                        <PixelIcon name="crown" className="h-3.5 w-3.5" />
                      )}
                      <span className="truncate text-[#f5efe6]">
                        {visited ? `E${st.stageIndex + 1}` : '?'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};
