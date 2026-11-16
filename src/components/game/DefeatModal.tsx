// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React from 'react';
import { getHeroDef, getHeroElement } from '../../game/heroes';
import { computeDefeatSummary, ELEMENT_META, SPIRIT_MAP } from '../../game/systems';
import { HudSnapshot } from '../../game/types';
import { HeroSpritePreview } from './HeroSelectModal';
import { PixelButton, PixelIcon } from './PixelUi';

interface DefeatModalProps {
  hud: HudSnapshot;
  onRetry: () => void;
  onOpenStages: () => void;
  onReturnTitle: () => void;
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PixelShatteredCrest: React.FC = () => (
  <svg
    viewBox="0 0 64 26"
    shapeRendering="crispEdges"
    className="h-8 w-20 sm:h-10 sm:w-24 shrink-0"
    aria-hidden="true"
  >
    {/* Dark pixel outline */}
    <path
      fill="#07050d"
      d="M16 4h6v3h4v2h12V7h4V4h6v5h-3v4h2v9H17v-9h2V9h-3V4z"
    />
    {/* Shattered dark iron & crimson crown */}
    <path fill="#6e1b2d" d="M18 6h4v4h3v10h-6V12h-1V6zm24 0h4v6h-1v8h-6V10h3V6z" />
    <path fill="#ff4d6d" d="M26 10h4v4h-2v6h-2V10zm8 0h4v10h-2v-6h-2v-4z" />
    {/* Crack gap + skull ember core */}
    <rect x="30" y="9" width="4" height="3" fill="#ffd27d" />
    <rect x="31" y="13" width="2" height="5" fill="#07050d" />
    <rect x="31" y="18" width="2" height="2" fill="#ff758f" />
    {/* Broken wing tips */}
    <rect x="7" y="12" width="8" height="3" fill="#3a2334" />
    <rect x="49" y="12" width="8" height="3" fill="#3a2334" />
    <rect x="9" y="13" width="4" height="1" fill="#ff4d6d" />
    <rect x="51" y="13" width="4" height="1" fill="#ff4d6d" />
  </svg>
);

export const DefeatModal: React.FC<DefeatModalProps> = ({
  hud,
  onRetry,
  onOpenStages,
  onReturnTitle,
}) => {
  const activeHero = getHeroDef(hud.heroId);
  const heroElem = ELEMENT_META[getHeroElement(hud.heroId)];
  const spirit = SPIRIT_MAP[hud.equippedSpirit];
  const bossWeakness = hud.bossWeakness ? ELEMENT_META[hud.bossWeakness] : null;

  const summary = computeDefeatSummary({
    playMode: hud.playMode,
    bossName: hud.bossName,
    bossHp: hud.bossHp,
    bossMaxHp: hud.bossMaxHp,
    bossWeakness: hud.bossWeakness,
    survivalWave: hud.survivalWave,
    survivalKills: hud.survivalKills,
    bestSurvivalWave: hud.bestSurvivalWave,
    towerFloor: hud.towerFloor,
    bestTowerFloor: hud.bestTowerFloor,
    stageNumber: hud.stageNumber,
    totalStagesInChapter: hud.totalStagesInChapter,
    perfectDodges: hud.perfectDodges,
    totalParries: hud.totalParries,
    hardcoreGameOver: hud.hardcoreGameOver,
  });

  const embers = [
    { left: '14%', delay: '0ms', color: '#ff4d6d' },
    { left: '28%', delay: '450ms', color: '#ff944d' },
    { left: '44%', delay: '920ms', color: '#ff4d6d' },
    { left: '60%', delay: '280ms', color: '#ff758f' },
    { left: '75%', delay: '710ms', color: '#ff944d' },
    { left: '87%', delay: '1100ms', color: '#ff4d6d' },
  ];

  const isSurvival = hud.playMode === 'survival';
  const isTower = hud.playMode === 'tower';
  const showStagesButton =
    hud.playMode !== 'survival' && hud.playMode !== 'boss_rush' && hud.playMode !== 'tower';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={summary.headline}
      data-testid="defeat-modal"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#090308]/90 p-2 sm:p-4 pointer-events-auto overflow-hidden"
    >
      {/* Dramatic Crimson Vignette & Falling Ember Ash */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background:
              'radial-gradient(circle at 50% 38%, rgba(163, 29, 61, 0.38) 0%, rgba(18, 6, 14, 0.85) 68%)',
          }}
        />
        {embers.map((em, i) => (
          <span
            key={i}
            style={{
              left: em.left,
              top: '18%',
              backgroundColor: em.color,
              animationDelay: em.delay,
            }}
            className="animate-mla-ember absolute h-2 w-2 border border-[#07050d]"
          />
        ))}
      </div>

      {/* Main Crimson-Obsidian Pixel Defeat Panel */}
      <div className="pixel-panel relative z-10 w-full max-w-xl max-h-[94vh] overflow-y-auto pixel-scroll p-3.5 sm:p-5 text-[#f5efe6] !border-[#07050d] !bg-[#160b16] shadow-[inset_3px_3px_0_0_#6e2139,inset_-3px_-3px_0_0_#290d1a,0_6px_0_0_#07050d]">
        {/* Crimson-Iron Corner Rivets */}
        <span className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 bg-[#ff5c77]" aria-hidden="true" />
        <span className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 bg-[#ff5c77]" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 bg-[#ff5c77]" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 bg-[#ff5c77]" aria-hidden="true" />

        {/* 1. Shattered Crest + Iron-and-Blood Ribbon Header */}
        <div className="animate-mla-banner flex flex-col items-center text-center">
          <PixelShatteredCrest />

          <div className="relative -mt-1 flex items-center justify-center">
            <div className="hidden sm:block h-4 w-5 -mr-1 bg-[#420d1b] border-2 border-[#07050d] translate-y-1" aria-hidden="true" />
            <div className="relative border-3 border-[#07050d] bg-[#69132a] px-5 py-1.5 shadow-[inset_2px_2px_0_0_#ff5c77,inset_-2px_-2px_0_0_#380714,0_4px_0_0_#07050d]">
              <h2 className="font-pixel text-2xl sm:text-3xl font-bold tracking-wider text-[#ffd6de] text-stroke-dark leading-none">
                {summary.headline}
              </h2>
            </div>
            <div className="hidden sm:block h-4 w-5 -ml-1 bg-[#420d1b] border-2 border-[#07050d] translate-y-1" aria-hidden="true" />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="border border-[#07050d] bg-[#30111f] px-2 py-0.5 font-pixel text-[10px] font-bold tracking-wider text-[#ff8899]">
              {summary.modeBadge}
            </span>
            <span className="font-pixel text-xs text-[#cbb8cb]">
              {isTower
                ? `Torre Infinita · Andar ${hud.towerFloor}`
                : `Fase ${hud.chapterIndex + 1} · ${hud.biomeName.replace(/^Fase\s+\d+\s*·\s*/i, '')}`}
            </span>
          </div>

          <p className="mt-1.5 font-body-pixel text-xs font-medium text-[#e3d2dc]">
            {summary.subtitle}
          </p>
        </div>

        {/* 2. Fallen Hero Altar + Contextual Boss / Wave / Stage Breakdown */}
        <div className="pixel-subpanel relative mt-3 overflow-hidden !bg-[#1e0f1c] px-3 py-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Fallen Hero Pedestal */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="opacity-85 grayscale-[25%]">
                  <HeroSpritePreview
                    hero={activeHero}
                    skinId={hud.heroSkinId}
                    sizeClass="h-14 w-14 sm:h-16 sm:w-16"
                    animateRun={false}
                  />
                </div>
                <div className="mt-0.5 h-2 w-16 border-2 border-[#07050d] bg-[#592434]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-pixel text-sm font-bold text-[#ffd6de]">
                    {activeHero.name}
                  </span>
                  <span
                    style={{ color: heroElem.color, borderColor: heroElem.color + '88' }}
                    className="border bg-[#120812] px-1.5 py-0.5 font-pixel text-[10px] font-bold"
                  >
                    {heroElem.label}
                  </span>
                </div>
                {spirit && (
                  <div className="mt-1 font-body-pixel text-[11px] text-[#bda8ba]">
                    Espírito: <span style={{ color: spirit.color }}>{spirit.name}</span>
                  </div>
                )}
                <div className="mt-1 font-mono-num text-[11px] text-[#9fb3c8]">
                  Rank <strong className="text-[#52e5ff]">{hud.styleRank}</strong> · {hud.styleScore} pts
                </div>
              </div>
            </div>

            {/* Right Contextual Progress Card: Boss HP OR Survival Record OR Stage Progress */}
            <div className="w-full sm:w-64 border-2 border-[#07050d] bg-[#120812] p-2.5">
              {summary.bossRemainingPct !== null ? (
                <div>
                  <div className="flex items-center justify-between gap-2 font-pixel text-xs font-bold">
                    <span style={{ color: summary.bossAccent ?? '#ff5c77' }} className="truncate">
                      {hud.bossName}
                    </span>
                    <span className="font-mono-num text-[#ffd6de] shrink-0">
                      {hud.bossHp}/{hud.bossMaxHp} ({summary.bossRemainingPct}%)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden border border-[#07050d] bg-[#24101b]">
                    <div
                      style={{ width: `${summary.bossRemainingPct}%` }}
                      className="h-full bg-[#ff3b63]"
                    />
                  </div>
                  {bossWeakness && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-pixel">
                      <span className="text-[#b89fb3]">Fraqueza Elemental:</span>
                      <span style={{ color: bossWeakness.color }} className="font-bold">
                        {bossWeakness.label}
                      </span>
                    </div>
                  )}
                </div>
              ) : isSurvival ? (
                <div>
                  <div className="flex items-center justify-between font-pixel text-xs font-bold">
                    <span className="text-[#8effdb]">Onda {hud.survivalWave}</span>
                    {summary.isNewWaveRecord ? (
                      <span className="border border-[#07050d] bg-[#a3701d] px-1.5 py-0.5 text-[10px] text-[#fff2a6]">
                        NOVO RECORDE!
                      </span>
                    ) : (
                      <span className="font-mono-num text-[11px] text-[#b89fb3]">
                        Recorde: Onda {hud.bestSurvivalWave}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 font-body-pixel text-[11px] text-[#d6c2d1]">
                    Abates totais na arena: <strong className="font-mono-num text-[#ffd27d]">{hud.survivalKills}</strong>
                  </div>
                </div>
              ) : isTower ? (
                <div>
                  <div className="flex items-center justify-between font-pixel text-xs font-bold">
                    <span className="text-[#38bdf8]">Andar {hud.towerFloor}</span>
                    {summary.isNewTowerRecord ? (
                      <span className="border border-[#07050d] bg-[#a3701d] px-1.5 py-0.5 text-[10px] text-[#fff2a6]">
                        NOVO RECORDE!
                      </span>
                    ) : (
                      <span className="font-mono-num text-[11px] text-[#b89fb3]">
                        Recorde: Andar {hud.bestTowerFloor}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 font-body-pixel text-[11px] text-[#d6c2d1]">
                    Torre Infinita · Guardião a cada 5 andares
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between font-pixel text-xs font-bold">
                    <span className="text-[#ffd27d]">Progresso na Fase</span>
                    <span className="font-mono-num text-[#f5efe6]">
                      Etapa {hud.stageNumber}/{hud.totalStagesInChapter}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden border border-[#07050d] bg-[#24101b]">
                    <div
                      style={{ width: `${summary.stageProgressPct}%` }}
                      className="h-full bg-[#ff7096]"
                    />
                  </div>
                  <div className="mt-1 truncate font-body-pixel text-[10px] text-[#b89fb3]">
                    {hud.roomName.replace(/^Etapa\s+\d+\s*·\s*/i, '')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. 4-Tile Tabular Telemetry Strip */}
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="pixel-subpanel !bg-[#1a0d18] p-2">
            <div className="font-pixel text-[10px] text-[#b89fb3]">
              {isSurvival ? 'Onda / Tempo' : isTower ? 'Andar' : 'Tempo'}
            </div>
            <div className="mt-0.5 font-mono-num text-sm font-bold text-[#f5efe6]">
              {isSurvival
                ? `Onda ${hud.survivalWave}`
                : isTower
                  ? `Andar ${hud.towerFloor}`
                  : formatTimer(hud.elapsedSeconds)}
            </div>
          </div>
          <div className="pixel-subpanel !bg-[#1a0d18] p-2">
            <div className="font-pixel text-[10px] text-[#b89fb3]">
              {isSurvival ? 'Abates' : isTower ? 'Recorde' : 'Relíquias'}
            </div>
            <div className="mt-0.5 font-mono-num text-sm font-bold text-[#ff8899]">
              {isSurvival
                ? hud.survivalKills
                : isTower
                  ? `Andar ${hud.bestTowerFloor}`
                  : `${hud.relicsCollected}/${hud.totalRelics}`}
            </div>
          </div>
          <div className="pixel-subpanel !bg-[#1a0d18] p-2">
            <div className="font-pixel text-[10px] text-[#b89fb3]">Estilo</div>
            <div className="mt-0.5 font-mono-num text-sm font-bold text-[#52e5ff]">
              {hud.styleRank} · {hud.styleScore}
            </div>
          </div>
          <div className="pixel-subpanel !bg-[#1a0d18] p-2">
            <div className="font-pixel text-[10px] text-[#b89fb3]">Esquivas / Parry</div>
            <div className="mt-0.5 font-mono-num text-sm font-bold text-[#ffd27d]">
              {hud.perfectDodges} / {hud.totalParries}
            </div>
          </div>
        </div>

        {/* 4. Contextual Tactical Recovery Tip Strip */}
        <div className="mt-2.5 flex items-start gap-2 border-2 border-[#07050d] bg-[#140914] px-3 py-2">
          <PixelIcon name="flame" className="mt-0.5 h-4 w-4 text-[#ff884d] shrink-0" />
          <p className="font-body-pixel text-xs leading-snug text-[#eddce6]">
            <strong className="font-pixel text-[#ffd27d]">Conselho Tático: </strong>
            {summary.tacticalTip}
          </p>
        </div>

        {/* 5. Action Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <PixelButton
            type="button"
            variant="gold"
            data-start="true"
            onClick={onRetry}
            className="px-5 py-2.5 text-base whitespace-nowrap shrink-0"
          >
            <PixelIcon name="restart" className="h-4 w-4" />
            <span>Tentar Novamente</span>
          </PixelButton>

          {showStagesButton && (
            <PixelButton
              type="button"
              variant="cyan"
              onClick={onOpenStages}
              className="px-4 py-2 text-sm whitespace-nowrap shrink-0"
            >
              <PixelIcon name="stages" className="h-4 w-4" />
              <span>Fases</span>
            </PixelButton>
          )}

          <PixelButton
            type="button"
            variant="slate"
            onClick={onReturnTitle}
            className="px-4 py-2 text-sm whitespace-nowrap shrink-0"
          >
            <span>Menu Principal</span>
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
