// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React from 'react';
import { getHeroDef, getHeroElement } from '../../game/heroes';
import { BOSS_ORDER } from '../../game/modes';
import { computeVictoryRewards, ELEMENT_META, SPIRIT_MAP, TITLE_MAP } from '../../game/systems';
import { HudSnapshot } from '../../game/types';
import { BIOME_META } from '../../game/worldData';
import { getAnyBiomeMeta, UNDERWORLD_BIOME_META } from '../../game/worldDataUnderworld';
import { HeroSpritePreview } from './HeroSelectModal';
import { PixelButton, PixelIcon } from './PixelUi';

interface VictoryModalProps {
  hud: HudSnapshot;
  isFinalVictory: boolean;
  onNextChapter: () => void;
  onReplayChapter: () => void;
  onOpenStages: () => void;
  onReplayFull: () => void;
  onReturnTitle: () => void;
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PixelWingedCrest: React.FC<{ color: string }> = ({ color }) => (
  <svg
    viewBox="0 0 64 26"
    shapeRendering="crispEdges"
    className="h-8 w-20 sm:h-10 sm:w-24 shrink-0"
    aria-hidden="true"
  >
    {/* Dark pixel border silhouette */}
    <path
      fill="#07050d"
      d="M2 8h10v3h6v3h6v-3h2V6h4V2h4v4h4v5h2v3h6v-3h6V8h10v4h-4v3h-5v3h-7v3H42v3H22v-3h-8v-3H7v-3H2V8z"
    />
    {/* Left & right golden pixel wings */}
    <path fill="#ffd24d" d="M4 9h8v2H4V9zm6 3h8v2h-8v-2zm6 3h8v2h-8v-2z" />
    <path fill="#fff3b0" d="M5 9h5v1H5V9zm6 3h5v1h-5v-1z" />
    <path fill="#ffd24d" d="M52 9h8v2h-8V9zm-6 3h8v2h-8v-2zm-6 3h8v2h-8v-2z" />
    <path fill="#fff3b0" d="M54 9h5v1h-5V9zm-6 3h5v1h-5v-1z" />
    {/* Center royal crown & jewel */}
    <path fill="#f59e0b" d="M23 11h18v10H23V11z" />
    <path fill="#ffe066" d="M25 8h4v5h6V8h4v11H25V8z" />
    <rect x="30" y="3" width="4" height="5" fill="#ffe066" />
    <rect x="31" y="4" width="2" height="2" fill="#ffffff" />
    <rect x="29" y="13" width="6" height="5" fill="#07050d" />
    <rect x="30" y="14" width="4" height="3" fill={color} />
    <rect x="30" y="14" width="2" height="1" fill="#ffffff" />
  </svg>
);

const PixelVictoryStar: React.FC<{ filled: boolean; index: 1 | 2 | 3 }> = ({ filled, index }) => {
  const animClass = index === 1 ? 'animate-mla-star-1' : index === 2 ? 'animate-mla-star-2' : 'animate-mla-star-3';
  const lift = index === 2 ? '-translate-y-1.5 scale-110' : '';
  return (
    <div className={`relative ${lift} ${filled ? animClass : 'opacity-40'}`}>
      <svg
        viewBox="0 0 18 18"
        shapeRendering="crispEdges"
        className="h-8 w-8 sm:h-10 sm:w-10"
        aria-hidden="true"
      >
        <path
          fill="#07050d"
          d="M7 1h4v4h5v4h-2v2h1v5h-4v-2H7v2H3v-5h1V9H2V5h5V1z"
        />
        <path
          fill={filled ? '#ffd24d' : '#261f3d'}
          d="M8 2h2v4h5v2h-3v3h1v4h-3v-2H8v2H5v-4h1V8H3V6h5V2z"
        />
        {filled && (
          <>
            <rect x="8" y="3" width="2" height="3" fill="#fff8c4" />
            <rect x="5" y="6" width="3" height="2" fill="#fff8c4" />
            <rect x="7" y="9" width="4" height="3" fill="#f59e0b" />
          </>
        )}
      </svg>
    </div>
  );
};

export const VictoryModal: React.FC<VictoryModalProps> = ({
  hud,
  isFinalVictory,
  onNextChapter,
  onReplayChapter,
  onOpenStages,
  onReplayFull,
  onReturnTitle,
}) => {
  const activeHero = getHeroDef(hud.heroId);
  const tagHero = getHeroDef(hud.tagHeroId);
  const hasDistinctTagHero = hud.tagHeroId !== hud.heroId;
  const spirit = SPIRIT_MAP[hud.equippedSpirit];
  const titleDef = TITLE_MAP[hud.activeTitle];
  const heroElem = ELEMENT_META[getHeroElement(hud.heroId)];
  const currentBiomeMeta = getAnyBiomeMeta(hud.biome);
  const biomeList = Object.values(hud.isUnderworld ? UNDERWORLD_BIOME_META : BIOME_META);
  const nextBiomeMeta = !isFinalVictory && hud.chapterIndex + 1 < biomeList.length
    ? biomeList[hud.chapterIndex + 1]
    : null;

  const elapsed = isFinalVictory ? hud.elapsedSeconds : hud.chapterElapsedSeconds;
  const deaths = isFinalVictory ? hud.deaths : hud.chapterDeaths;
  const relics = isFinalVictory ? hud.relicsCollected : hud.chapterRelicsCollected;
  const totalRelics = isFinalVictory ? hud.totalRelics : hud.chapterTotalRelics;

  const rewards = computeVictoryRewards({
    elapsedSeconds: elapsed,
    deaths,
    relicsCollected: relics,
    totalRelics,
    styleRank: hud.styleRank,
    styleScore: hud.styleScore,
    chapterIndex: hud.chapterIndex,
    isBossRush: hud.playMode === 'boss_rush',
    isFinalVictory,
  });

  const bannerHeadline = isFinalVictory
    ? hud.playMode === 'boss_rush'
      ? 'RUSH TRIUNFANTE!'
      : 'VITÓRIA SUPREMA!'
    : hud.isUnderworld
      ? 'CÍRCULO PURIFICADO!'
      : 'FASE PURIFICADA!';

  const bannerSub = isFinalVictory
    ? hud.playMode === 'boss_rush'
      ? `${hud.heroName} venceu os ${BOSS_ORDER.length} Guardiões`
      : hud.isUnderworld
        ? 'Cidadela de Pandemônio Conquistada'
        : 'Pináculo do Éter Despertado'
    : `${hud.biomeName}`;

  const sparks = [
    { left: '12%', delay: '0ms', color: '#ffe066' },
    { left: '24%', delay: '380ms', color: '#52e5ff' },
    { left: '38%', delay: '820ms', color: '#ff70a6' },
    { left: '62%', delay: '220ms', color: '#4df0c0' },
    { left: '76%', delay: '640ms', color: '#ffe066' },
    { left: '88%', delay: '960ms', color: '#c084fc' },
  ];

  const hasNextChapter = !isFinalVictory && hud.chapterIndex + 1 < hud.totalChapters;
  const auraColor = currentBiomeMeta?.accent ?? '#ffd24d';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isFinalVictory ? 'Tela de Vitória Suprema' : `Vitória na Fase ${hud.chapterIndex + 1}`}
      data-testid="victory-modal"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#05040c]/88 p-2 sm:p-4 pointer-events-auto overflow-hidden"
    >
      {/* Stepped Pixel Sunburst, Biome Aura & Floating Sparks */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
        <div
          className="absolute h-[540px] w-[540px] opacity-30"
          style={{
            background: `radial-gradient(circle, ${auraColor}55 0%, transparent 65%)`,
          }}
        />
        <div
          className="animate-mla-sunburst h-[760px] w-[760px] opacity-25"
          style={{
            background:
              'repeating-conic-gradient(from 0deg, rgba(255, 210, 77, 0.36) 0deg 10deg, transparent 10deg 24deg)',
          }}
        />
        {sparks.map((sp, i) => (
          <span
            key={i}
            style={{
              left: sp.left,
              bottom: '22%',
              backgroundColor: sp.color,
              animationDelay: sp.delay,
            }}
            className="animate-mla-spark absolute h-2 w-2 border border-[#07050d]"
          />
        ))}
      </div>

      {/* Main Crisp Pixel Victory Card */}
      <div className="pixel-panel relative z-10 w-full max-w-xl max-h-[94vh] overflow-y-auto pixel-scroll p-3.5 sm:p-5 text-[#f5efe6]">
        {/* Brass Pixel Corner Rivets */}
        <span className="pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 bg-[#ffd24d]" aria-hidden="true" />
        <span className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 bg-[#ffd24d]" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 bg-[#ffd24d]" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 bg-[#ffd24d]" aria-hidden="true" />

        {/* 1. Winged Crown + Stepped Crimson-Gold Victory Ribbon */}
        <div className="animate-mla-banner flex flex-col items-center text-center">
          <PixelWingedCrest color={rewards.gradeColor} />

          <div className="relative -mt-1 flex items-center justify-center">
            <div className="hidden sm:block h-4 w-5 -mr-1 bg-[#7d1730] border-2 border-[#07050d] translate-y-1" aria-hidden="true" />
            <div className="relative border-3 border-[#07050d] bg-[#a31d3d] px-5 py-1.5 shadow-[inset_2px_2px_0_0_#ff6b8b,inset_-2px_-2px_0_0_#5e0e22,0_4px_0_0_#07050d]">
              <h2 className="font-pixel text-2xl sm:text-3xl font-bold tracking-wider text-[#ffe066] text-stroke-dark leading-none">
                {bannerHeadline}
              </h2>
            </div>
            <div className="hidden sm:block h-4 w-5 -ml-1 bg-[#7d1730] border-2 border-[#07050d] translate-y-1" aria-hidden="true" />
          </div>

          <p className="mt-2 font-body-pixel text-xs font-semibold tracking-wide text-[#d4cae8]">
            {bannerSub}
          </p>

          {/* 2. Three Animated Pixel Stars + Grade Tag */}
          <div
            className="mt-2 flex items-end justify-center gap-2.5"
            aria-label={`Classificação: ${rewards.stars} de 3 estrelas - ${rewards.gradeLabel}`}
          >
            <PixelVictoryStar filled={rewards.stars >= 1} index={1} />
            <PixelVictoryStar filled={rewards.stars >= 2} index={2} />
            <PixelVictoryStar filled={rewards.stars >= 3} index={3} />
          </div>
          <div
            style={{ color: rewards.gradeColor }}
            className="mt-1 font-pixel text-xs sm:text-sm font-bold tracking-widest text-stroke-dark"
          >
            {rewards.gradeLabel}
          </div>

          {/* 2b. Explicit 3-Star Breakdown Pills */}
          <div className="mt-2 grid w-full grid-cols-3 gap-1.5 text-left">
            {rewards.starCriteria.map((sc) => (
              <div
                key={sc.id}
                className={`border border-[#07050d] px-2 py-1 ${
                  sc.achieved ? 'bg-[#172f29]' : 'bg-[#161124] opacity-75'
                }`}
              >
                <div className="flex items-center gap-1 font-pixel text-[10px] font-bold">
                  <span
                    className={`inline-flex h-3 w-3 shrink-0 items-center justify-center border border-[#07050d] text-[9px] ${
                      sc.achieved
                        ? 'bg-[#4df0c0] text-[#07050d]'
                        : 'bg-[#2a2140] text-[#8d82a8]'
                    }`}
                  >
                    {sc.achieved ? '✓' : '–'}
                  </span>
                  <span className={sc.achieved ? 'text-[#a8ffea] truncate' : 'text-[#b8afc9] truncate'}>
                    {sc.label}
                  </span>
                </div>
                <div className="mt-0.5 truncate font-mono-num text-[10px] text-[#e5def2]">
                  {sc.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Hero + Duo + Spirit Sanctuary Podium Showcase */}
        <div className="pixel-subpanel relative mt-2.5 overflow-hidden px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Podium Horizon Floor */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 border-t-2 border-[#07050d] bg-[#120d22]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Hero & Duo Sprites Podium */}
            <div className="flex items-end justify-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <div className="animate-mla-podium flex items-end justify-center">
                  <HeroSpritePreview
                    hero={activeHero}
                    skinId={hud.heroSkinId}
                    sizeClass="h-14 w-14 sm:h-16 sm:w-16"
                    animateRun
                  />
                </div>
                <div className="mt-0.5 h-2.5 w-20 border-2 border-[#07050d] bg-[#b47429] shadow-[inset_0_2px_0_0_#ffe066]" />
                <div className="mt-1 flex items-center gap-1">
                  <span className="font-pixel text-xs font-bold text-[#ffe066]">
                    {activeHero.name}
                  </span>
                  <span
                    style={{ color: heroElem.color, borderColor: heroElem.color + '99' }}
                    className="border bg-[#0e0a1a] px-1 py-0 font-pixel text-[9px] font-bold"
                  >
                    {heroElem.label}
                  </span>
                </div>
              </div>

              {hasDistinctTagHero && (
                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center opacity-95">
                    <HeroSpritePreview
                      hero={tagHero}
                      sizeClass="h-11 w-11 sm:h-12 sm:w-12"
                      animateRun={false}
                    />
                  </div>
                  <div className="mt-0.5 h-2 w-14 border-2 border-[#07050d] bg-[#364d75] shadow-[inset_0_2px_0_0_#67e8f9]" />
                  <span className="mt-1 font-pixel text-[10px] font-bold text-[#9ff0ff]">
                    Duo: {tagHero.name}
                  </span>
                </div>
              )}
            </div>

            {/* Podium Badges: Rank, Title & Spirit */}
            <div className="flex flex-col items-center sm:items-end gap-1.5 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 border-2 border-[#07050d] bg-[#0d0918] px-3 py-1">
                <span className="font-pixel text-[11px] text-[#a9a0bd]">ESTILO</span>
                <span className="font-mono-num text-xl font-bold text-[#52e5ff] leading-none">
                  {hud.styleRank}
                </span>
                <span className="font-mono-num text-xs text-[#ffe066]">
                  {hud.styleScore} pts
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
                {titleDef && (
                  <span
                    style={{ borderColor: titleDef.color, color: titleDef.color }}
                    className="border bg-[#140e24] px-2 py-0.5 font-pixel text-[10px] font-bold"
                  >
                    {titleDef.name}
                  </span>
                )}
                {spirit && (
                  <span
                    style={{ borderColor: spirit.color, color: spirit.color }}
                    className="inline-flex items-center gap-1 border bg-[#140e24] px-2 py-0.5 font-pixel text-[10px] font-bold"
                  >
                    <span
                      style={{ backgroundColor: spirit.color }}
                      className="h-1.5 w-1.5"
                    />
                    {spirit.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. 4-Metric Tabular Telemetry Grid */}
        <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="pixel-subpanel p-2">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Tempo</div>
            <div className="mt-0.5 font-mono-num text-sm sm:text-base font-bold text-[#f5efe6]">
              {formatTimer(elapsed)}
            </div>
          </div>
          <div className="pixel-subpanel p-2">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Mortes</div>
            <div className="mt-0.5 font-mono-num text-sm sm:text-base font-bold text-[#ff8899]">
              {deaths}
            </div>
          </div>
          <div className="pixel-subpanel p-2">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Relíquias</div>
            <div className="mt-0.5 font-mono-num text-sm sm:text-base font-bold text-[#ffd27d]">
              {relics}/{totalRelics}
            </div>
          </div>
          <div className="pixel-subpanel p-2">
            <div className="font-pixel text-[10px] text-[#a9a0bd]">Esquivas / Parry</div>
            <div className="mt-0.5 font-mono-num text-sm sm:text-base font-bold text-[#4df0c0]">
              {hud.perfectDodges} / {hud.totalParries}
            </div>
          </div>
        </div>

        {/* 5. Commendations & Victory Spoils */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pixel-subpanel px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {rewards.commendations.map((c) => (
              <span
                key={c.id}
                style={{ borderColor: c.color, color: c.color }}
                className="border bg-[#0d0a17] px-2 py-0.5 font-pixel text-[10px] font-bold"
              >
                {c.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 font-mono-num text-xs font-bold">
            <div className="flex items-center gap-1.5 border border-[#07050d] bg-[#131d2e] px-2 py-0.5">
              <span className="font-pixel text-[10px] text-[#52e5ff]">NV.{hud.playerLevel ?? 1}</span>
              <div className="h-1.5 w-10 overflow-hidden border border-[#07050d] bg-[#09080f]">
                <div
                  style={{ width: `${Math.round((hud.playerLevelProgress ?? 0) * 100)}%` }}
                  className="h-full bg-[#52e5ff]"
                />
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[#e879f9]">
              <PixelIcon name="crown" className="h-3.5 w-3.5" />
              Passe NV.{hud.passLevel ?? 0} · {hud.totalWorldStars ?? 0}/{(hud.totalChapters ?? 50) * 3}★
            </span>
            <span className="inline-flex items-center gap-1 text-[#4df0c0]">
              <PixelIcon name="bolt" className="h-3.5 w-3.5" />
              +{rewards.masteryXp} XP
            </span>
            <span className="inline-flex items-center gap-1 text-[#ffe066]">
              <PixelIcon name="coin" className="h-3.5 w-3.5" />
              +{rewards.bonusCoins}
            </span>
          </div>
        </div>

        {/* 6. Next Biome Preview Strip (if advancing in campaign) */}
        {hasNextChapter && nextBiomeMeta && (
          <div className="mt-2 flex items-center justify-between gap-2 border-2 border-[#07050d] bg-[#0f0c1d] px-3 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span
                style={{ backgroundColor: nextBiomeMeta.accent }}
                className="h-3 w-3 shrink-0 border border-[#07050d]"
                aria-hidden="true"
              />
              <div className="min-w-0 truncate font-body-pixel text-xs text-[#d4cae8]">
                <span className="font-pixel text-[11px] font-bold text-[#ffd27d]">Próximo Destino: </span>
                <span className="font-semibold text-[#f5efe6]">{nextBiomeMeta.name}</span>
                <span className="hidden sm:inline text-[#9d92b5]"> — {nextBiomeMeta.subtitle}</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. Primary & Secondary Actions */}
        <div className="mt-3.5 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2">
          {hasNextChapter ? (
            <PixelButton
              type="button"
              variant="gold"
              data-start="true"
              onClick={onNextChapter}
              className="px-4 py-2 text-sm whitespace-nowrap shrink-0"
            >
              <PixelIcon name="play" className="h-4 w-4" />
              <span>
                {hud.isUnderworld
                  ? `Próximo Círculo (${hud.chapterIndex + 2})`
                  : `Próxima Fase (${hud.chapterIndex + 2})`}
              </span>
            </PixelButton>
          ) : (
            <PixelButton
              type="button"
              variant="gold"
              data-start="true"
              onClick={onReplayFull}
              className="px-4 py-2 text-sm whitespace-nowrap shrink-0"
            >
              <PixelIcon name="restart" className="h-4 w-4" />
              <span>Jogar Novamente</span>
            </PixelButton>
          )}

          {!isFinalVictory && (
            <PixelButton
              type="button"
              variant="cyan"
              onClick={onReplayChapter}
              className="px-3 py-2 text-xs whitespace-nowrap shrink-0"
            >
              <PixelIcon name="restart" className="h-3.5 w-3.5" />
              <span>Repetir</span>
            </PixelButton>
          )}

          <PixelButton
            type="button"
            variant="slate"
            onClick={onOpenStages}
            className="px-3 py-2 text-xs whitespace-nowrap shrink-0"
          >
            <PixelIcon name="stages" className="h-3.5 w-3.5" />
            <span>Fases</span>
          </PixelButton>

          <PixelButton
            type="button"
            variant="slate"
            onClick={onReturnTitle}
            className="px-3 py-2 text-xs whitespace-nowrap shrink-0"
          >
            <span>Menu Principal</span>
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
