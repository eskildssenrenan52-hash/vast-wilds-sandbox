// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React, { useState } from 'react';
import { getHeroDef, getHeroElement } from '../../game/heroes';
import { getPlayModeDef } from '../../game/modes';
import { ELEMENT_META, SPIRIT_MAP, WEATHER_META } from '../../game/systems';
import { HudSnapshot } from '../../game/types';
import { HeroSpritePreview } from './HeroSelectModal';
import { PixelButton, PixelIcon } from './PixelUi';

export type PauseOverlayTarget =
  | 'heroes'
  | 'sanctuary'
  | 'pass'
  | 'quests'
  | 'blessings'
  | 'map'
  | 'modes'
  | 'compendium'
  | 'chronicles';

interface PauseModalProps {
  hud: HudSnapshot;
  totalMechanics: number;
  totalChronicles: number;
  gamepadName: string | null;
  showRadar: boolean;
  showTouchControls: boolean;
  onResume: () => void;
  onRestartChapter: () => void;
  onReturnTitle: () => void;
  onToggleMute: () => void;
  onOpenOverlay: (target: PauseOverlayTarget) => void;
  onCycleGameSpeed: () => void;
  onToggleAssist: (key: 'infiniteStamina' | 'extraDash' | 'hardcoreMode' | 'lowGravity' | 'turboMode') => void;
  onToggleRadar: () => void;
  onToggleTouch: () => void;
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  hud,
  totalMechanics,
  totalChronicles,
  gamepadName,
  showRadar,
  showTouchControls,
  onResume,
  onRestartChapter,
  onReturnTitle,
  onToggleMute,
  onOpenOverlay,
  onCycleGameSpeed,
  onToggleAssist,
  onToggleRadar,
  onToggleTouch,
}) => {
  const [tab, setTab] = useState<'menus' | 'assist' | 'controls'>('menus');
  const activeHero = getHeroDef(hud.heroId);
  const tagHero = getHeroDef(hud.tagHeroId);
  const heroElem = ELEMENT_META[getHeroElement(hud.heroId)];
  const activeModeDef = getPlayModeDef(hud.playMode);
  const spirit = SPIRIT_MAP[hud.equippedSpirit];
  const weatherInfo = WEATHER_META[hud.weather];

  const assistActiveCount =
    (hud.assist.gameSpeed !== 1 ? 1 : 0) +
    (hud.assist.infiniteStamina ? 1 : 0) +
    (hud.assist.extraDash ? 1 : 0) +
    (hud.assist.hardcoreMode ? 1 : 0) +
    (hud.assist.lowGravity ? 1 : 0) +
    (hud.assist.turboMode ? 1 : 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu de Pausa"
      data-testid="pause-modal"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#05040b]/88 p-2 sm:p-4 pointer-events-auto"
    >
      <div className="pixel-panel relative w-full max-w-xl max-h-[94vh] overflow-y-auto pixel-scroll p-3.5 sm:p-4 text-[#f5efe6]">
        {/* Brass Pixel Corner Rivets */}
        <span className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
        <span className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 bg-[#ffd27d]" aria-hidden="true" />

        {/* 1. Compact Hero + Stage Context Header */}
        <div className="flex items-start justify-between gap-2.5 border-b-2 border-[#07050d] pb-2.5 shadow-[0_2px_0_0_#2b2245]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="pixel-subpanel flex h-12 w-12 shrink-0 items-center justify-center bg-[#0e0a1b]">
              <HeroSpritePreview
                hero={activeHero}
                skinId={hud.heroSkinId}
                sizeClass="h-10 w-10"
                animateRun={false}
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="font-pixel text-lg sm:text-xl font-bold tracking-wide text-[#ffd27d] text-stroke-dark leading-none">
                  JOGO PAUSADO
                </h2>
                <span
                  style={{ borderColor: activeModeDef.accentColor + '99', color: activeModeDef.accentColor }}
                  className="border bg-[#0d0a17] px-1.5 py-0.5 font-pixel text-[10px] font-bold uppercase whitespace-nowrap"
                >
                  {activeModeDef.badge}
                </span>
                <span className="border border-[#07050d] bg-[#16273b] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#52e5ff] whitespace-nowrap">
                  NV.{hud.playerLevel ?? 1}
                </span>
                {hud.weather !== 'clear' && weatherInfo && (
                  <span
                    style={{ borderColor: weatherInfo.color + '88', color: weatherInfo.color }}
                    className="border bg-[#0d0a17] px-1.5 py-0.5 font-pixel text-[10px] font-bold whitespace-nowrap"
                  >
                    {hud.weatherName}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate font-body-pixel text-xs text-[#cfc6e3]">
                <span style={{ color: activeHero.accentColor }} className="font-bold">
                  {activeHero.name}
                </span>
                <span className="text-[#786e91]"> · </span>
                <span>{hud.biomeName}</span>
                <span className="text-[#786e91]"> · </span>
                <span className="text-[#ffd27d]">
                  {hud.playMode === 'tower'
                    ? `Torre · Andar ${hud.towerFloor} (Rec. ${hud.bestTowerFloor})`
                    : `Etapa ${hud.stageNumber}/${hud.totalStagesInChapter}`}
                </span>
              </p>
            </div>
          </div>

          <PixelButton
            type="button"
            variant="slate"
            onClick={onResume}
            aria-label="Retomar jogo (Esc)"
            title="Retomar [Esc]"
            className="h-9 shrink-0 !px-2.5 !py-0 text-xs whitespace-nowrap"
          >
            <PixelIcon name="close" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono-num text-[10px] text-[#ffd27d]">ESC</span>
          </PixelButton>
        </div>

        {/* 2. Compact 4-Cell Inline Run Telemetry Strip */}
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
          <div className="pixel-subpanel px-2 py-1.5">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Tempo</div>
            <div className="font-mono-num text-xs sm:text-sm font-bold text-[#f5efe6]">
              {formatTimer(hud.chapterElapsedSeconds)}
            </div>
          </div>
          <div className="pixel-subpanel px-2 py-1.5">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Mortes</div>
            <div className="font-mono-num text-xs sm:text-sm font-bold text-[#ff8899]">
              {hud.chapterDeaths}
            </div>
          </div>
          <div className="pixel-subpanel px-2 py-1.5">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Relíquias</div>
            <div className="font-mono-num text-xs sm:text-sm font-bold text-[#ffd27d]">
              {hud.chapterRelicsCollected}/{hud.chapterTotalRelics}
            </div>
          </div>
          <div className="pixel-subpanel px-2 py-1.5">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Moedas</div>
            <div className="inline-flex items-center justify-center gap-1 font-mono-num text-xs sm:text-sm font-bold text-[#ffe47a]">
              <PixelIcon name="coin" className="h-3 w-3" />
              <span>{hud.astralCoins}</span>
            </div>
          </div>
        </div>

        {/* 3. Primary Quick-Action Bar */}
        <div className="mt-2.5 grid grid-cols-3 sm:flex sm:items-center gap-1.5">
          <PixelButton
            type="button"
            variant="gold"
            onClick={onResume}
            className="col-span-3 sm:flex-1 py-2 text-sm sm:text-base whitespace-nowrap shrink-0"
          >
            <PixelIcon name="play" className="h-4 w-4" />
            <span>Retomar Fase</span>
          </PixelButton>

          <PixelButton
            type="button"
            variant="slate"
            onClick={onRestartChapter}
            title="Reiniciar fase atual"
            className="px-2.5 sm:px-3 py-2 text-xs whitespace-nowrap shrink-0"
          >
            <PixelIcon name="restart" className="h-3.5 w-3.5 text-[#52e5ff]" />
            <span>Reiniciar</span>
          </PixelButton>

          <PixelButton
            type="button"
            variant="slate"
            onClick={onToggleMute}
            aria-label={hud.muted ? 'Ativar áudio' : 'Silenciar áudio'}
            title="Áudio [N]"
            className="px-2.5 py-2 text-xs whitespace-nowrap shrink-0"
          >
            <PixelIcon
              name={hud.muted ? 'sound_off' : 'sound_on'}
              className={`h-3.5 w-3.5 ${hud.muted ? 'text-[#ff708d]' : 'text-[#4df0c0]'}`}
            />
            <span>{hud.muted ? 'Mudo' : 'Som'}</span>
          </PixelButton>

          <PixelButton
            type="button"
            variant="danger"
            onClick={onReturnTitle}
            title="Voltar ao Menu Principal"
            className="px-2.5 sm:px-3 py-2 text-xs whitespace-nowrap shrink-0"
          >
            <span>Menu</span>
          </PixelButton>
        </div>

        {/* 4. Organized 3-Tab Switcher */}
        <div
          role="tablist"
          aria-label="Seções do Menu de Pausa"
          className="mt-3 grid grid-cols-3 gap-1.5 border-b-2 border-[#07050d] pb-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'menus'}
            data-testid="pause-tab-menus"
            onClick={() => setTab('menus')}
            className={`border-2 border-[#07050d] px-1.5 sm:px-2 py-1.5 font-pixel text-xs font-bold whitespace-nowrap transition-colors ${
              tab === 'menus'
                ? 'bg-[#2a4a6e] text-[#9ff0ff] shadow-[inset_0_2px_0_0_#67e8f9]'
                : 'bg-[#171228] text-[#b8afc9] hover:bg-[#221a3b]'
            }`}
          >
            <span className="sm:hidden">Menus</span>
            <span className="hidden sm:inline">Menus & Santuário</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'assist'}
            data-testid="pause-tab-assist"
            onClick={() => setTab('assist')}
            className={`border-2 border-[#07050d] px-2 py-1.5 font-pixel text-xs font-bold whitespace-nowrap transition-colors ${
              tab === 'assist'
                ? 'bg-[#1a5c49] text-[#8effdb] shadow-[inset_0_2px_0_0_#4df0c0]'
                : 'bg-[#171228] text-[#b8afc9] hover:bg-[#221a3b]'
            }`}
          >
            Assistência{assistActiveCount > 0 ? ` (${assistActiveCount})` : ''}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'controls'}
            data-testid="pause-tab-controls"
            onClick={() => setTab('controls')}
            className={`border-2 border-[#07050d] px-2 py-1.5 font-pixel text-xs font-bold whitespace-nowrap transition-colors ${
              tab === 'controls'
                ? 'bg-[#4b311d] text-[#ffe066] shadow-[inset_0_2px_0_0_#ffd27d]'
                : 'bg-[#171228] text-[#b8afc9] hover:bg-[#221a3b]'
            }`}
          >
            Controles {gamepadName ? '· Pad' : ''}
          </button>
        </div>

        {/* 5. Tab Content */}
        {tab === 'menus' && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Featured Sanctuary Card spanning 2 cols */}
            <button
              type="button"
              onClick={() => onOpenOverlay('sanctuary')}
              className="sm:col-span-2 flex items-center justify-between gap-3 border-2 border-[#07050d] bg-[#1b2d47] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#4977ad,inset_-2px_-2px_0_0_#0f1929] hover:bg-[#223959]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <PixelIcon name="bolt" className="h-5 w-5 text-[#52e5ff] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-sm font-bold text-[#9ff0ff]">
                    Santuário · Runas, Espíritos & Dupla [G]
                  </div>
                  <div className="truncate font-body-pixel text-[11px] text-[#c7d6ec]">
                    {hud.equippedRunes.length}/3 Runas · Dupla: {tagHero.name}
                    {spirit ? ` · ${spirit.name}` : ''}
                  </div>
                </div>
              </div>
              <span className="shrink-0 border border-[#07050d] bg-[#0e1929] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#52e5ff]">
                NV.{hud.mastery.mobilityLv + hud.mastery.combatLv + hud.mastery.explorationLv + hud.mastery.survivalLv}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('pass')}
              data-testid="pause-open-pass-btn"
              className="sm:col-span-2 flex items-center justify-between gap-3 border-2 border-[#07050d] bg-[#2c193d] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#7c3aed,inset_-2px_-2px_0_0_#190c26] hover:bg-[#3a2052]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <PixelIcon name="crown" className="h-5 w-5 text-[#ffd27d] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-sm font-bold text-[#ffd27d]">
                    Passe Estelar, Missões & Cofre Diário [V]
                  </div>
                  <div className="truncate font-body-pixel text-[11px] text-[#e2d4f5]">
                    Passe NV.{hud.passLevel ?? 0}/40 · Estrelas {hud.totalWorldStars ?? 0}/150★
                    {hud.canClaimDaily ? ' · Cofre Diário Disponível!' : ''}
                  </div>
                </div>
              </div>
              <span className="shrink-0 border border-[#07050d] bg-[#160b24] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#ffe066]">
                PASSE
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('quests')}
              data-testid="pause-open-quests-btn"
              className="sm:col-span-2 flex items-center justify-between gap-3 border-2 border-[#07050d] bg-[#142c33] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#2b7a8c,inset_-2px_-2px_0_0_#0a1a1f] hover:bg-[#1a3942]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <PixelIcon name="star" className="h-5 w-5 text-[#4df0c0] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-sm font-bold text-[#8effdb]">
                    Side Quests & Exploração da Fase [O]
                  </div>
                  <div className="truncate font-body-pixel text-[11px] text-[#bfe8dc]">
                    Exploração Etapa: {hud.stageExplorationPct}% ({hud.stageZonesVisited}/{hud.stageZonesTotal}) ·{' '}
                    {hud.sideQuests.filter((q) => q.claimed).length}/{hud.sideQuests.length} missões resgatadas
                  </div>
                </div>
              </div>
              <span className="shrink-0 border border-[#07050d] bg-[#0b181c] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#ffe066]">
                {hud.sideQuestsReadyCount > 0 ? `${hud.sideQuestsReadyCount} PRONTA` : 'QUESTS'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('heroes')}
              className="flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#16362e] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#2b6959] hover:bg-[#1d473d]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <PixelIcon name="hero" className="h-4 w-4 text-[#4df0c0] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-xs font-bold text-[#8effdb]">Heróis [H]</div>
                  <div className="truncate font-body-pixel text-[11px] text-[#bfe8dc]">
                    {activeHero.name} · {heroElem.label}
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-mono-num text-[10px] font-bold text-[#4df0c0]">
                {hud.unlockedHeroes?.length ?? 36}/36
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('blessings')}
              className="flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#292038] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#4c3d69] hover:bg-[#342947]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <PixelIcon name="shrine" className="h-4 w-4 text-[#ffd27d] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-xs font-bold text-[#ffe47a]">Altar de Bênçãos [B]</div>
                  <div className="truncate font-body-pixel text-[11px] text-[#cfc6e3]">
                    Upgrades de Escalada
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-mono-num text-[11px] font-bold text-[#ffe47a]">
                {hud.astralCoins}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('map')}
              className="flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#1e1830] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#3b305c] hover:bg-[#282040]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <PixelIcon name="stages" className="h-4 w-4 text-[#ffd27d] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-xs font-bold text-[#f5efe6]">Fases e Etapas [M]</div>
                  <div className="truncate font-body-pixel text-[11px] text-[#b8afc9]">
                    Mapa dos 50 Biomas
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-mono-num text-[10px] font-bold text-[#ffd27d]">
                {hud.chapterIndex + 1}/{hud.totalChapters}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('modes')}
              className="flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#1e1830] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#3b305c] hover:bg-[#282040]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <PixelIcon name="crown" className="h-4 w-4 text-[#ffd27d] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-xs font-bold text-[#f5efe6]">Modos de Jogo</div>
                  <div className="truncate font-body-pixel text-[11px] text-[#b8afc9]">
                    {activeModeDef.name}
                  </div>
                </div>
              </div>
              <span
                style={{ color: activeModeDef.accentColor }}
                className="shrink-0 font-pixel text-[10px] font-bold"
              >
                {activeModeDef.badge}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('compendium')}
              className="flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#1e1830] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#3b305c] hover:bg-[#282040]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <PixelIcon name="book" className="h-4 w-4 text-[#52e5ff] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-xs font-bold text-[#f5efe6]">Compêndio</div>
                  <div className="truncate font-body-pixel text-[11px] text-[#b8afc9]">
                    Mecânicas & Segredos
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-mono-num text-[10px] font-bold text-[#52e5ff]">
                {hud.discoveredMechanics}/{totalMechanics}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenOverlay('chronicles')}
              className="flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#1e1830] px-3 py-2 text-left shadow-[inset_2px_2px_0_0_#3b305c] hover:bg-[#282040]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <PixelIcon name="flame" className="h-4 w-4 text-[#ff9666] shrink-0" />
                <div className="min-w-0">
                  <div className="font-pixel text-xs font-bold text-[#f5efe6]">Crônicas</div>
                  <div className="truncate font-body-pixel text-[11px] text-[#b8afc9]">
                    Lore & Cenas da Montanha
                  </div>
                </div>
              </div>
              <span className="shrink-0 font-mono-num text-[10px] font-bold text-[#ffd27d]">
                {hud.seenCutscenes.length}/{totalChronicles}
              </span>
            </button>
          </div>
        )}

        {tab === 'assist' && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <PixelButton
              type="button"
              variant="slate"
              onClick={onCycleGameSpeed}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Velocidade do Jogo</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-mono-num text-[11px] text-[#ffd27d]">
                {Math.round(hud.assist.gameSpeed * 100)}%
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={hud.assist.infiniteStamina ? 'emerald' : 'slate'}
              onClick={() => onToggleAssist('infiniteStamina')}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Vigor Infinito</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {hud.assist.infiniteStamina ? 'ATIVO' : 'DESL.'}
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={hud.assist.extraDash ? 'cyan' : 'slate'}
              onClick={() => onToggleAssist('extraDash')}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Dash Duplo</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {hud.assist.extraDash ? 'ATIVO' : 'DESL.'}
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={hud.assist.hardcoreMode ? 'danger' : 'slate'}
              onClick={() => onToggleAssist('hardcoreMode')}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Ironman (1 Vida)</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {hud.assist.hardcoreMode ? 'ATIVO' : 'DESL.'}
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={hud.assist.lowGravity ? 'cyan' : 'slate'}
              onClick={() => onToggleAssist('lowGravity')}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Baixa Gravidade</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {hud.assist.lowGravity ? 'ATIVA' : 'DESL.'}
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={hud.assist.turboMode ? 'gold' : 'slate'}
              onClick={() => onToggleAssist('turboMode')}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Modo Turbo</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {hud.assist.turboMode ? 'ATIVO' : 'DESL.'}
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={showRadar ? 'emerald' : 'slate'}
              onClick={onToggleRadar}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Radar da Fase [Tab]</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {showRadar ? 'VISÍVEL' : 'OCULTO'}
              </strong>
            </PixelButton>

            <PixelButton
              type="button"
              variant={showTouchControls ? 'emerald' : 'slate'}
              onClick={onToggleTouch}
              className="!justify-between px-3 py-2 text-xs whitespace-nowrap"
            >
              <span>Controles Touch [T]</span>
              <strong className="border border-[#07050d] bg-[#0e0a17] px-1.5 py-0.5 font-pixel text-[10px]">
                {showTouchControls ? 'ATIVOS' : 'OCULTOS'}
              </strong>
            </PixelButton>
          </div>
        )}

        {tab === 'controls' && (
          <div className="mt-2.5 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { action: 'Mover / Mirar', keys: 'WASD · Setas' },
                { action: 'Pular / Pulo Duplo', keys: 'Espaço · Z · J' },
                { action: 'Dash / Parry', keys: 'X · Shift · K' },
                { action: 'Escalar Paredes', keys: 'C · L (Segurar)' },
                { action: 'Habilidade Elemental', keys: 'Q' },
                { action: 'Alternar Dupla', keys: 'F' },
                { action: 'Interagir / Farol / Altar', keys: 'E · Enter' },
                { action: 'Side Quests & Mapa', keys: 'O · M' },
                { action: 'Pausar / Retomar', keys: 'Esc · P' },
              ].map((item) => (
                <div
                  key={item.action}
                  className="pixel-subpanel flex items-center justify-between gap-2 px-2.5 py-1.5"
                >
                  <span className="font-body-pixel text-[11px] text-[#cfc6e3] truncate">
                    {item.action}
                  </span>
                  <kbd className="shrink-0 border border-[#07050d] bg-[#0d0917] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#ffd27d]">
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pixel-subpanel p-2.5">
              <div className="flex items-center justify-between gap-2">
                <strong className="font-pixel text-xs text-[#8effdb]">Joystick / Controle</strong>
                <span
                  className={`border border-[#07050d] px-1.5 py-0.5 font-pixel text-[10px] font-bold ${
                    gamepadName
                      ? 'bg-[#1a5c49] text-[#8effdb]'
                      : 'bg-[#140e24] text-[#ffd27d]'
                  }`}
                >
                  {gamepadName ? 'CONECTADO' : 'AGUARDANDO USB / BT'}
                </span>
              </div>
              <p className="mt-1 font-body-pixel text-[11px] leading-relaxed text-[#b8afc9]">
                Analógico/D-Pad: Mover · [A]: Pular · [X/RT]: Dash · [LB/RB]: Escalar · [Y]: Poder · [B]: Falar · [Start]: Pausa
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
