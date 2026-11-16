// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  HEROES,
  HERO_RARITY_META,
  HeroDef,
  HeroId,
  HeroRarity,
  canUnlockHero,
  getHeroElement,
  getHeroSkinDef,
  getHeroUnlockReq,
} from '../../game/heroes';
import { ELEMENT_META } from '../../game/systems';
import { HERO_SPRITE_SETS, buildHeroPalette, drawPixelSprite } from '../../game/sprites';
import { colorWithAlpha } from '../../game/visualFx';
import { HeroFullSpriteCanvas, HeroPortrait } from './HeroPortrait';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

export const HeroSpritePreview: React.FC<{
  hero: HeroDef;
  skinId?: string;
  sizeClass?: string;
  animateRun?: boolean;
}> = ({ hero, skinId = 'default', sizeClass = 'h-16 w-16', animateRun = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameTick = 0;
    const draw = () => {
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 22, 22);

      // Subtle atmospheric aura halo behind champion sprite
      const halo = ctx.createRadialGradient(11, 13, 1, 11, 13, 10);
      halo.addColorStop(0, colorWithAlpha(hero.accentColor, 0.3));
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, 22, 22);

      const set = HERO_SPRITE_SETS[hero.id] ?? HERO_SPRITE_SETS.lyra;
      const frames = animateRun ? set.run : set.idle;
      const idx = frameTick % frames.length;
      const rows = frames[idx];
      const pal = buildHeroPalette(hero.id, hero.modifiers.baseDashes, false, false, skinId);

      drawPixelSprite(
        ctx,
        `preview_${hero.id}_${skinId}_${animateRun ? 'r' : 'i'}_${idx}`,
        rows,
        pal,
        11,
        20,
        false,
        1,
        1,
        true
      );
      frameTick++;
    };

    draw();
    const timer = window.setInterval(draw, animateRun ? 140 : 210);
    return () => window.clearInterval(timer);
  }, [hero.id, hero.accentColor, hero.modifiers.baseDashes, animateRun, skinId]);

  return (
    <canvas
      ref={canvasRef}
      width={44}
      height={44}
      className={`pixel-canvas ${sizeClass}`}
      aria-label={`Sprite animado de ${hero.name}`}
    />
  );
};

const PixelStatBar: React.FC<{
  label: string;
  value: number;
  max?: number;
  color: string;
}> = ({ label, value, max = 5, color }) => (
  <div className="flex items-center justify-between gap-2 text-[11px]">
    <span className="font-pixel text-[#b8afc9]">{label}</span>
    <div className="flex items-center gap-0.5" aria-label={`${label}: ${value}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            backgroundColor: i < value ? color : '#1c152e',
          }}
          className="inline-block h-2.5 w-3 border border-[#07050d]"
        />
      ))}
    </div>
  </div>
);

const HEADGEAR_LABELS: Record<string, string> = {
  none: 'Clássico',
  crown: 'Coroa Real',
  horns: 'Chifres',
  halo: 'Auréola',
  ears: 'Orelhas',
  visor: 'Visor',
  crest: 'Crista',
};

const RARITY_FILTERS: ('Todas' | HeroRarity)[] = [
  'Todas',
  'Comum',
  'Raro',
  'Super-Raro',
  'Épico',
  'Mítico',
  'Lendário',
];

interface HeroSelectModalProps {
  activeHeroId: HeroId;
  heroSkins?: Partial<Record<HeroId, string>>;
  tagHeroId?: HeroId;
  playerLevel?: number;
  astralCoins?: number;
  unlockedHeroes?: HeroId[];
  onUnlockHero?: (id: HeroId) => void;
  onSelectHero: (id: HeroId, skinId?: string) => void;
  onSelectTagHero?: (id: HeroId) => void;
  onClose: () => void;
}

export const HeroSelectModal: React.FC<HeroSelectModalProps> = ({
  activeHeroId,
  heroSkins = {},
  tagHeroId,
  playerLevel = 1,
  astralCoins = 0,
  unlockedHeroes,
  onUnlockHero,
  onSelectHero,
  onSelectTagHero,
  onClose,
}) => {
  const [view, setView] = useState<'roster' | 'showcase'>('roster');
  const [rarityFilter, setRarityFilter] = useState<'Todas' | HeroRarity>('Todas');
  const [unlockFilter, setUnlockFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [focusedHeroId, setFocusedHeroId] = useState<HeroId>(activeHeroId);
  const [draftSkinId, setDraftSkinId] = useState<string>(heroSkins[activeHeroId] ?? 'default');

  const unlockedSet = useMemo(
    () => new Set<HeroId>(unlockedHeroes ?? HEROES.map((h) => h.id)),
    [unlockedHeroes]
  );

  const unlockedCount = useMemo(
    () => HEROES.filter((h) => unlockedSet.has(h.id)).length,
    [unlockedSet]
  );

  const filteredHeroes = useMemo(() => {
    return HEROES.filter((h) => {
      if (rarityFilter !== 'Todas' && h.rarity !== rarityFilter) return false;
      const isUnl = unlockedSet.has(h.id);
      if (unlockFilter === 'unlocked' && !isUnl) return false;
      if (unlockFilter === 'locked' && isUnl) return false;
      return true;
    });
  }, [rarityFilter, unlockFilter, unlockedSet]);

  const focusedHero = useMemo(
    () => HEROES.find((h) => h.id === focusedHeroId) ?? HEROES[0],
    [focusedHeroId]
  );

  const openHeroShowcase = (id: HeroId) => {
    setFocusedHeroId(id);
    setDraftSkinId(heroSkins[id] ?? 'default');
    setView('showcase');
  };

  const stepShowcaseHero = (delta: number) => {
    const idx = HEROES.findIndex((h) => h.id === focusedHeroId);
    const nextIdx = (idx + delta + HEROES.length) % HEROES.length;
    const nextHero = HEROES[nextIdx];
    setFocusedHeroId(nextHero.id);
    setDraftSkinId(heroSkins[nextHero.id] ?? 'default');
  };

  const activeSkinForHero = getHeroSkinDef(focusedHero.id, draftSkinId);
  const equippedSkinForFocused = heroSkins[focusedHero.id] ?? 'default';
  const isFocusedEquipped =
    focusedHero.id === activeHeroId && activeSkinForHero.id === equippedSkinForFocused;
  const isFocusedUnlocked = unlockedSet.has(focusedHero.id);
  const focusReq = getHeroUnlockReq(focusedHero);
  const canBuyFocused =
    !isFocusedUnlocked && canUnlockHero(focusedHero, astralCoins, playerLevel).canUnlock;

  const rarityMeta = HERO_RARITY_META[focusedHero.rarity];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Seleção de Heróis"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/92 p-3 md:p-6 pointer-events-auto"
    >
      <PixelWindow
        title={
          view === 'roster'
            ? `Campeões de Aethelgard (${HEROES.length} Heróis · ${HEROES.length * 3} Skins)`
            : `${focusedHero.name} · ${activeSkinForHero.name}`
        }
        subtitle={
          view === 'roster'
            ? 'Escolha um campeão na grade de retratos em pixel art para abrir sua tela única e equipar skins.'
            : `${focusedHero.rarity} · ${focusedHero.archetype} · Alterne entre 3 skins com alterações visuais únicas.`
        }
        accentColor={view === 'showcase' ? activeSkinForHero.badgeColor : '#ffd27d'}
        onClose={onClose}
        maxWidthClass="max-w-6xl"
      >
        {view === 'roster' ? (
          <div className="flex flex-col gap-3">
            {/* Top Rarity & Unlock Status Filter Strip */}
            <div className="flex flex-col gap-2 border-2 border-[#07050d] bg-[#100b1d] px-2.5 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {RARITY_FILTERS.map((r) => {
                    const selected = rarityFilter === r;
                    const meta = r !== 'Todas' ? HERO_RARITY_META[r] : null;
                    return (
                      <PixelButton
                        key={r}
                        type="button"
                        variant={selected ? 'gold' : 'slate'}
                        onClick={() => setRarityFilter(r)}
                        className="px-2.5 py-1 text-[11px]"
                      >
                        {meta && (
                          <span
                            style={{ backgroundColor: meta.color }}
                            className="inline-block h-2 w-2 border border-[#07050d]"
                            aria-hidden="true"
                          />
                        )}
                        <span>{r === 'Todas' ? `Todos (${HEROES.length})` : r}</span>
                      </PixelButton>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-2 font-pixel text-[11px]">
                  <span className="border border-[#07050d] bg-[#182c3f] px-2 py-0.5 font-bold text-[#52e5ff]">
                    NV.{playerLevel}
                  </span>
                  <span className="border border-[#07050d] bg-[#2c2112] px-2 py-0.5 font-bold text-[#ffe47a]">
                    {astralCoins}★
                  </span>
                  <span className="text-[#8effdb] font-bold">
                    {unlockedCount}/{HEROES.length} Liberados
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#221a36] pt-1.5">
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'all', label: 'Todos' },
                      { id: 'unlocked', label: `Liberados (${unlockedCount})` },
                      { id: 'locked', label: `Bloqueados (${HEROES.length - unlockedCount})` },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      data-testid={`hero-filter-${st.id}`}
                      onClick={() => setUnlockFilter(st.id)}
                      className={`border px-2 py-0.5 font-pixel text-[10px] font-bold ${
                        unlockFilter === st.id
                          ? 'border-[#ffd27d] bg-[#2a1f44] text-[#ffd27d]'
                          : 'border-[#2b2142] bg-[#140e24] text-[#b8afc9] hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
                <span className="font-pixel text-[11px] text-[#b8afc9]">
                  Ativo:{' '}
                  <strong className="text-[#ffd27d]">
                    {HEROES.find((h) => h.id === activeHeroId)?.name} (
                    {getHeroSkinDef(activeHeroId, heroSkins[activeHeroId]).name})
                  </strong>
                </span>
              </div>
            </div>

            {/* Brawl-Stars-Organized Hero Portrait Grid */}
            <div className="pixel-scroll grid max-h-[66vh] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
              {filteredHeroes.map((hero) => {
                const isEquipped = hero.id === activeHeroId;
                const isTag = hero.id === tagHeroId;
                const isUnlocked = unlockedSet.has(hero.id);
                const req = getHeroUnlockReq(hero);
                const readyToBuy =
                  !isUnlocked && canUnlockHero(hero, astralCoins, playerLevel).canUnlock;
                const skinId = heroSkins[hero.id] ?? 'default';
                const skin = getHeroSkinDef(hero.id, skinId);
                const rMeta = HERO_RARITY_META[hero.rarity];
                const elMeta = ELEMENT_META[getHeroElement(hero.id)];
                return (
                  <button
                    key={hero.id}
                    type="button"
                    data-testid={`hero-card-${hero.id}`}
                    onClick={() => openHeroShowcase(hero.id)}
                    style={{
                      borderColor: isEquipped
                        ? skin.badgeColor
                        : readyToBuy
                          ? '#ffe066'
                          : isUnlocked
                            ? rMeta.color + '88'
                            : '#352a4f',
                    }}
                    className={`pixel-subpanel group flex flex-col justify-between p-2.5 text-left transition-transform hover:-translate-y-0.5 ${
                      isEquipped
                        ? 'bg-[#1e1636]'
                        : isUnlocked
                          ? 'bg-[#120d22] hover:bg-[#19122e]'
                          : 'bg-[#0e0a1a] opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Top Rarity & Unlock Status Header */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <span
                            style={{
                              backgroundColor: rMeta.bg,
                              color: rMeta.color,
                              borderColor: rMeta.color,
                            }}
                            className="border px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase tracking-wider"
                          >
                            {hero.rarity}
                          </span>
                          <span
                            style={{
                              color: elMeta.color,
                              borderColor: elMeta.color + 'aa',
                            }}
                            className="border bg-[#0c0818] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase"
                          >
                            {elMeta.label}
                          </span>
                        </div>
                        {isEquipped && (
                          <span
                            style={{ backgroundColor: skin.badgeColor, color: '#09080f' }}
                            className="border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase"
                          >
                            EM USO
                          </span>
                        )}
                        {!isEquipped && isTag && isUnlocked && (
                          <span className="border border-[#07050d] bg-[#4df0c0] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase text-[#09080f]">
                            DUPLA [F]
                          </span>
                        )}
                        {!isUnlocked && (
                          <span
                            className={`border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase ${
                              readyToBuy
                                ? 'bg-[#ffd24d] text-[#09080f]'
                                : 'bg-[#2a1d38] text-[#ffd27d]'
                            }`}
                          >
                            {readyToBuy
                              ? `LIBERAR ${req.coinCost}★`
                              : `NV.${req.requiredLevel} · ${req.coinCost}★`}
                          </span>
                        )}
                      </div>

                      {/* Portrait & Hero Title Row */}
                      <div className="mt-2 flex items-center gap-2.5">
                        <div className={`relative shrink-0 ${!isUnlocked ? 'grayscale-[45%]' : ''}`}>
                          <HeroPortrait
                            heroId={hero.id}
                            skinId={skin.id}
                            size={68}
                            animate={isEquipped}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            style={{ color: hero.accentColor }}
                            className="truncate font-pixel text-base font-bold leading-tight text-stroke-dark"
                          >
                            {hero.name}
                          </h3>
                          <p className="truncate font-pixel text-[10px] text-[#efe8fa]">
                            {hero.title}
                          </p>
                          <p
                            style={{ color: skin.badgeColor }}
                            className="mt-1 truncate font-pixel text-[10px] font-bold"
                          >
                            Skin: {skin.name}
                          </p>
                          <p className="mt-0.5 truncate font-body-pixel text-[10px] text-[#b8afc9]">
                            {hero.archetype}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mini Stat Strip Footer */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#271e40] pt-1.5 font-pixel text-[10px]">
                      <span className="text-[#a9a0bd] truncate">
                        [Q] {hero.activeSkillName}
                      </span>
                      <span
                        className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                          isUnlocked
                            ? 'text-[#ffd27d]'
                            : readyToBuy
                              ? 'text-[#4df0c0] font-bold'
                              : 'text-[#ff8899]'
                        }`}
                      >
                        {isUnlocked
                          ? 'Abrir ►'
                          : readyToBuy
                            ? 'Desbloquear ►'
                            : `Nv.${req.requiredLevel} / ${req.coinCost}★`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Single-Hero Dedicated Brawl-Stars Showcase Screen */
          <div className="flex flex-col gap-3">
            {/* Showcase Navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-2 border-[#07050d] bg-[#100b1d] px-2.5 py-2">
              <PixelButton
                type="button"
                variant="slate"
                data-testid="hero-back-roster"
                onClick={() => setView('roster')}
                className="px-3 py-1.5 text-xs"
              >
                <span>◀ Voltar à Grade</span>
              </PixelButton>

              <div className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: rarityMeta.bg,
                    color: rarityMeta.color,
                    borderColor: rarityMeta.color,
                  }}
                  className="border-2 px-2 py-0.5 font-pixel text-[11px] font-bold uppercase"
                >
                  {focusedHero.rarity}
                </span>
                <span
                  style={{
                    color: ELEMENT_META[getHeroElement(focusedHero.id)].color,
                    borderColor: ELEMENT_META[getHeroElement(focusedHero.id)].color,
                  }}
                  className="border-2 bg-[#0c0818] px-2 py-0.5 font-pixel text-[11px] font-bold uppercase"
                >
                  Elemento: {ELEMENT_META[getHeroElement(focusedHero.id)].label}
                </span>
                <span className="font-mono-num text-xs text-[#b8afc9]">
                  Herói {HEROES.findIndex((h) => h.id === focusedHero.id) + 1}/{HEROES.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <PixelButton
                  type="button"
                  variant="slate"
                  onClick={() => stepShowcaseHero(-1)}
                  className="px-2.5 py-1 text-xs"
                  aria-label="Herói anterior"
                >
                  ◄ Anterior
                </PixelButton>
                <PixelButton
                  type="button"
                  variant="slate"
                  onClick={() => stepShowcaseHero(1)}
                  className="px-2.5 py-1 text-xs"
                  aria-label="Próximo herói"
                >
                  Próximo ►
                </PixelButton>
              </div>
            </div>

            {/* 2-Column Single-Hero Pedestal + Kit Layout */}
            <div className="grid max-h-[72vh] grid-cols-1 gap-3 overflow-y-auto pr-1 pixel-scroll lg:grid-cols-12">
              {/* LEFT: Animated Pedestal + Pixel Portrait + 3 Skin Cards */}
              <div className="flex flex-col gap-3 lg:col-span-5">
                <div
                  style={{ borderColor: activeSkinForHero.badgeColor }}
                  className="pixel-subpanel relative flex flex-col items-center justify-center bg-[#0d0919] p-4"
                >
                  {/* Top-Left Portrait Badge & Top-Right Headgear Tag */}
                  <div className="flex w-full items-start justify-between gap-2">
                    <HeroPortrait
                      heroId={focusedHero.id}
                      skinId={activeSkinForHero.id}
                      size={56}
                      animate
                    />
                    <div className="text-right">
                      <span
                        style={{
                          color: activeSkinForHero.badgeColor,
                          borderColor: activeSkinForHero.badgeColor,
                        }}
                        className="inline-block border bg-[#161029] px-2 py-0.5 font-pixel text-[10px] font-bold uppercase"
                      >
                        Visual: {HEADGEAR_LABELS[activeSkinForHero.palette.headgear ?? 'none']}
                      </span>
                      <div className="mt-1 font-pixel text-[11px] text-[#d7cee8]">
                        {activeSkinForHero.name}
                      </div>
                    </div>
                  </div>

                  {/* Large Animated Full-Body Sprite Standing on Glowing Pedestal */}
                  <div className="my-2 flex items-center justify-center">
                    <HeroFullSpriteCanvas
                      heroId={focusedHero.id}
                      skinId={activeSkinForHero.id}
                      size={136}
                    />
                  </div>

                  <p className="text-center font-body-pixel text-xs text-[#cfc6e0]">
                    “{activeSkinForHero.tagline}”
                  </p>
                </div>

                {/* 3 Visual Skins Selector */}
                <div className="pixel-subpanel bg-[#100b1d] p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-pixel text-xs font-bold uppercase tracking-wider text-[#ffd27d]">
                      Skins do Herói ({focusedHero.skins.length})
                    </span>
                    <span className="font-pixel text-[10px] text-[#a9a0bd]">
                      Troca cores, manto e adereço
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {focusedHero.skins.map((sk) => {
                      const selected = sk.id === activeSkinForHero.id;
                      return (
                        <button
                          key={sk.id}
                          type="button"
                          data-testid={`skin-btn-${sk.id}`}
                          onClick={() => setDraftSkinId(sk.id)}
                          style={{
                            borderColor: selected ? sk.badgeColor : '#07050d',
                          }}
                          className={`flex flex-col items-start gap-1.5 border-2 p-2 text-left transition-colors ${
                            selected ? 'bg-[#21183b]' : 'bg-[#140e24] hover:bg-[#1a132e]'
                          }`}
                        >
                          {/* 4-Color Pixel Swatch Bar */}
                          <div className="flex w-full items-center gap-0.5 border border-[#07050d]">
                            <span
                              style={{ backgroundColor: sk.palette.hairMain }}
                              className="h-2.5 flex-1"
                            />
                            <span
                              style={{ backgroundColor: sk.palette.cloakMid }}
                              className="h-2.5 flex-1"
                            />
                            <span
                              style={{ backgroundColor: sk.palette.metalHi }}
                              className="h-2.5 flex-1"
                            />
                            <span
                              style={{ backgroundColor: sk.badgeColor }}
                              className="h-2.5 flex-1"
                            />
                          </div>
                          <span
                            style={{ color: selected ? sk.badgeColor : '#f5efe6' }}
                            className="w-full line-clamp-2 font-pixel text-[10px] font-bold leading-tight"
                          >
                            {sk.name}
                          </span>
                          <span className="font-pixel text-[9px] text-[#a9a0bd]">
                            {HEADGEAR_LABELS[sk.palette.headgear ?? 'none']}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: Hero Bio, Stats, Passive, Active [Q] & Equip CTA */}
              <div className="flex flex-col justify-between gap-3 lg:col-span-7">
                <div className="flex flex-col gap-3">
                  <div className="pixel-subpanel bg-[#120d22] p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3
                        style={{ color: focusedHero.accentColor }}
                        className="font-pixel text-2xl font-bold text-stroke-dark"
                      >
                        {focusedHero.name}
                      </h3>
                      <span
                        style={{ color: focusedHero.secondaryColor }}
                        className="font-pixel text-xs font-bold"
                      >
                        {focusedHero.archetype}
                      </span>
                    </div>
                    <p className="font-pixel text-xs text-[#ffd27d]">{focusedHero.title}</p>
                    <p className="mt-2 font-body-pixel text-xs leading-relaxed text-[#dfd8ee]">
                      {focusedHero.lore}
                    </p>
                  </div>

                  {/* Stats Block */}
                  <div className="pixel-subpanel bg-[#120d22] p-3">
                    <div className="mb-2 font-pixel text-xs font-bold uppercase tracking-wider text-[#ffd27d]">
                      Atributos de Combate & Mobilidade
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <PixelStatBar
                        label="Salto"
                        value={focusedHero.stats.jump}
                        color={focusedHero.accentColor}
                      />
                      <PixelStatBar
                        label="Velocidade"
                        value={focusedHero.stats.speed}
                        color={focusedHero.secondaryColor}
                      />
                      <PixelStatBar
                        label="Vigor"
                        value={focusedHero.stats.stamina}
                        color="#4df0c0"
                      />
                      <PixelStatBar
                        label="Dashes"
                        value={focusedHero.stats.dash}
                        color="#d580ff"
                      />
                    </div>
                  </div>

                  {/* Passiva + Ativa [Q] */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="pixel-subpanel bg-[#120d22] p-3">
                      <div
                        style={{ color: focusedHero.accentColor }}
                        className="font-pixel text-xs font-bold"
                      >
                        PASSIVA · {focusedHero.abilityName}
                      </div>
                      <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                        {focusedHero.abilityDesc}
                      </p>
                    </div>
                    <div className="pixel-subpanel bg-[#120d22] p-3">
                      <div
                        style={{ color: focusedHero.secondaryColor }}
                        className="font-pixel text-xs font-bold"
                      >
                        ATIVA [Q] · {focusedHero.activeSkillName} ({focusedHero.skillCooldown}s)
                      </div>
                      <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#efe8fa]">
                        {focusedHero.activeSkillDesc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Equip OR Unlock Action Bar */}
                {!isFocusedUnlocked ? (
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 border-2 border-[#4f243b] bg-[#1b0e1f] px-3 py-2">
                      <div className="font-pixel text-xs font-bold text-[#ffd27d]">
                        CAMPEÃO BLOQUEADO
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-mono-num text-xs font-bold">
                        <span
                          className={
                            playerLevel >= focusReq.requiredLevel
                              ? 'text-[#4df0c0]'
                              : 'text-[#ff758f]'
                          }
                        >
                          Nível {playerLevel}/{focusReq.requiredLevel}
                        </span>
                        <span
                          className={
                            astralCoins >= focusReq.coinCost ? 'text-[#ffe066]' : 'text-[#ff758f]'
                          }
                        >
                          {astralCoins}/{focusReq.coinCost}★ Astrais
                        </span>
                      </div>
                    </div>
                    <PixelButton
                      type="button"
                      variant={canBuyFocused ? 'gold' : 'slate'}
                      disabled={!canBuyFocused || !onUnlockHero}
                      data-testid="unlock-hero-btn"
                      onClick={() => onUnlockHero?.(focusedHero.id)}
                      className="w-full py-2.5 text-sm"
                    >
                      <PixelIcon name="coin" className="h-4 w-4" />
                      <span>
                        {canBuyFocused
                          ? `Desbloquear ${focusedHero.name} (${focusReq.coinCost}★)`
                          : playerLevel < focusReq.requiredLevel
                            ? `Requer Nível ${focusReq.requiredLevel} & ${focusReq.coinCost}★`
                            : `Precisa ${focusReq.coinCost}★ Astrais`}
                      </span>
                    </PixelButton>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <PixelButton
                      type="button"
                      variant={isFocusedEquipped ? 'emerald' : 'gold'}
                      data-testid="equip-hero-btn"
                      onClick={() => onSelectHero(focusedHero.id, activeSkinForHero.id)}
                      className="flex-1 py-2.5 text-sm"
                    >
                      <PixelIcon name={isFocusedEquipped ? 'check' : 'hero'} className="h-4 w-4" />
                      <span>
                        {isFocusedEquipped
                          ? `${focusedHero.name} (${activeSkinForHero.name}) Equipado!`
                          : `Equipar ${focusedHero.name} · ${activeSkinForHero.name}`}
                      </span>
                    </PixelButton>

                    {onSelectTagHero && (
                      <PixelButton
                        type="button"
                        variant={focusedHero.id === tagHeroId ? 'emerald' : 'cyan'}
                        data-testid="equip-tag-hero-btn"
                        onClick={() => onSelectTagHero(focusedHero.id)}
                        className="px-4 py-2.5 text-sm"
                      >
                        <span>
                          {focusedHero.id === tagHeroId
                            ? 'Parceiro Dupla [F] Ativo'
                            : 'Definir como Dupla [F]'}
                        </span>
                      </PixelButton>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PixelWindow>
    </div>
  );
};
