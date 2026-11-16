// @ts-nocheck -- UI module
import React, { useState } from 'react';
import blessingsArt from '../../assets/icons/blessings.png';
import campaignArt from '../../assets/icons/campaign.png';
import chroniclesArt from '../../assets/icons/chronicles.png';
import compendiumArt from '../../assets/icons/compendium.png';
import forgeArt from '../../assets/icons/forge.png';
import heroesArt from '../../assets/icons/heroes.png';
import modesArt from '../../assets/icons/modes.png';
import passArt from '../../assets/icons/pass.png';
import petsArt from '../../assets/icons/pets.png';
import questsArt from '../../assets/icons/quests.png';
import restartArt from '../../assets/icons/restart.png';
import sanctuaryArt from '../../assets/icons/sanctuary.png';
import sandboxArt from '../../assets/icons/sandbox.png';
import stagesArt from '../../assets/icons/stages.png';
import underworldArt from '../../assets/icons/underworld.png';
import type { HeroDef } from '../../game/heroes';
import { HEROES } from '../../game/heroes';
import { TOTAL_MECHANICS } from '../../game/mechanicsCatalog';
import type { PlayModeDef } from '../../game/modes';
import { PASS_MAX_TIER } from '../../game/passAndRewards';
import { ChapterDef, HudSnapshot } from '../../game/types';
import { CHAPTERS } from '../../game/worldData';
import { UNDERWORLD_CHAPTERS } from '../../game/worldDataUnderworld';
import { PixelButton, PixelIcon } from './PixelUi';
import { HeroEvolutionAndPetShowcaseCard, StagePreviewCard } from './TitleShowcaseWidgets';

interface ArtButtonMeta {
  id: string;
  label: string;
  subLabel?: string;
  art: string;
  title: string;
  description: string;
  hotkey?: string;
  accent: string;
  borderClass: string;
  bgClass: string;
  testId?: string;
  isStart?: boolean;
  colSpanClass?: string;
  tooltipSide?: 'top' | 'bottom';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface TitleScreenProps {
  hud: HudSnapshot;
  activeHero: HeroDef;
  activeModeDef: PlayModeDef;
  titleChapter: ChapterDef;
  titlePassProg: { level: number; progress: number };
  titleAura: { name: string; primaryColor: string };
  hasSavedProgress: boolean;
  gamepadName: string | null;
  onStart: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  onStartPlayMode: (mode: 'underworld' | 'campaign' | 'sandbox_world') => void;
  onOpenOverlay: (
    overlay:
      | 'map'
      | 'modes'
      | 'heroes'
      | 'forge'
      | 'pets'
      | 'sanctuary'
      | 'quests'
      | 'pass'
      | 'blessings'
      | 'compendium'
      | 'chronicles',
    forgeTab?: 'equipment' | 'crafting' | 'evolution'
  ) => void;
  onToggleMute: () => void;
  onRestartFull: () => void;
}

const SectionHeading: React.FC<{ label: string; accent: string }> = ({ label, accent }) => (
  <div className="mb-1 flex flex-1 items-center gap-2">
    <span style={{ backgroundColor: accent }} className="inline-block h-1.5 w-1.5 rotate-45" />
    <span style={{ color: accent }} className="font-pixel text-[10px] font-bold uppercase tracking-[0.2em]">
      {label}
    </span>
    <span
      style={{ background: `linear-gradient(90deg, ${accent}66, transparent)` }}
      className="h-px flex-1"
    />
  </div>
);

const ArtActionButton: React.FC<{
  btn: ArtButtonMeta;
  hoveredId: string | null;
  onHover: (btn: ArtButtonMeta | null) => void;
  tileMode?: boolean;
}> = ({ btn, hoveredId, onHover, tileMode = false }) => {
  const isHovered = hoveredId === btn.id;
  const side = btn.tooltipSide ?? 'top';

  return (
    <div className={`relative flex ${btn.colSpanClass ?? ''}`}>
      <button
        type="button"
        data-start={btn.isStart ? 'true' : undefined}
        data-testid={btn.testId}
        aria-label={`${btn.label}: ${btn.description}`}
        onMouseEnter={() => onHover(btn)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(btn)}
        onBlur={() => onHover(null)}
        onClick={btn.onClick}
        style={{
          borderColor: isHovered ? btn.accent : undefined,
          boxShadow: isHovered
            ? `0 0 0 1px ${btn.accent}, 0 4px 0 0 #07050d, 0 0 18px ${btn.accent}44`
            : '0 3px 0 0 #07050d',
        }}
        className={`group relative flex w-full border-2 transition-all duration-150 ${
          tileMode
            ? 'flex-col items-center justify-center gap-1 px-1 py-1.5 text-center'
            : 'flex-row items-center gap-2.5 px-2.5 py-2 text-left'
        } ${btn.borderClass} ${btn.bgClass} hover:-translate-y-0.5 active:translate-y-0.5`}
      >
        {tileMode && btn.hotkey && (
          <span className="absolute right-1 top-1 border border-[#07050d] bg-[#0a0714] px-1 py-0.5 font-mono-num text-[8px] font-bold leading-none text-[#ffd27d]">
            {btn.hotkey}
          </span>
        )}

        {/* Inner engraved art medallion */}
        <div
          style={{ borderColor: isHovered ? btn.accent : '#07050d' }}
          className={`relative shrink-0 overflow-hidden border-2 bg-[#07050d] shadow-inner ${
            tileMode ? 'h-8 w-8' : btn.isStart ? 'h-11 w-11' : 'h-10 w-10'
          }`}
        >
          <img
            src={btn.art}
            alt=""
            aria-hidden="true"
            style={{ imageRendering: 'pixelated' }}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
          />
          <span
            aria-hidden="true"
            style={{ background: `radial-gradient(circle, ${btn.accent}33 0%, transparent 70%)` }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>

        {/* Text & keybind */}
        <div className="min-w-0 flex-1 w-full">
          <div className={`flex items-center gap-1 ${tileMode ? 'justify-center' : 'justify-between'}`}>
            <span
              className={`font-pixel font-bold leading-tight text-[#f5efe6] text-stroke-dark ${
                tileMode ? 'text-[11px]' : btn.isStart ? 'text-[13px]' : 'text-[12px]'
              }`}
            >
              {btn.label}
            </span>
            {!tileMode && btn.hotkey && (
              <span className="shrink-0 border border-[#07050d] bg-[#0a0714] px-1 py-0.5 font-mono-num text-[9px] font-bold text-[#ffd27d]">
                {btn.hotkey}
              </span>
            )}
          </div>
          {btn.subLabel && (
            <div
              style={{ color: btn.accent }}
              className={`mt-0.5 truncate font-mono-num font-bold leading-none ${
                tileMode ? 'text-[9px]' : 'text-[10px]'
              }`}
            >
              {btn.subLabel}
            </div>
          )}
        </div>
      </button>

      {/* Floating Art Tooltip Popover on Hover / Focus */}
      {isHovered && (
        <div
          role="tooltip"
          style={{ borderColor: btn.accent }}
          className={`pointer-events-none absolute left-1/2 z-50 w-72 -translate-x-1/2 border-2 bg-[#0b0816fa] p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.88)] ${
            side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-[#29223d] pb-1.5">
            <img
              src={btn.art}
              alt=""
              style={{ imageRendering: 'pixelated' }}
              className="h-7 w-7 shrink-0 border border-[#07050d] bg-[#07050d]"
            />
            <div className="min-w-0 flex-1">
              <div style={{ color: btn.accent }} className="font-pixel text-xs font-bold leading-tight">
                {btn.title}
              </div>
              {btn.hotkey && (
                <div className="mt-0.5 font-mono-num text-[9px] text-[#b8afc9]">Atalho: {btn.hotkey}</div>
              )}
            </div>
          </div>
          <p className="mt-1.5 font-body-pixel text-[11px] leading-snug text-[#ece6f7]">
            {btn.description}
          </p>
        </div>
      )}
    </div>
  );
};

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hud,
  activeHero,
  activeModeDef,
  titleChapter,
  titlePassProg,
  titleAura,
  hasSavedProgress,
  gamepadName,
  onStart,
  onStartPlayMode,
  onOpenOverlay,
  onToggleMute,
  onRestartFull,
}) => {
  const [hoveredBtn, setHoveredBtn] = useState<ArtButtonMeta | null>(null);

  const primaryButtons: ArtButtonMeta[] = [
    {
      id: 'start',
      label: hud.isUnderworld
        ? `Continuar Círculo ${hud.chapterIndex + 1}`
        : hasSavedProgress
          ? `Continuar Fase ${hud.chapterIndex + 1}`
          : 'Iniciar Campanha',
      subLabel: hud.isUnderworld ? 'Submundo Ativo · 20 Círculos' : '50 Mundos · Até 20 Salas/Fase',
      art: campaignArt,
      title: 'Campanha Principal · Superfície',
      description:
        'Aventura em capítulos com 50 mundos e até 20 salas únicas por fase, chefes elementais, segredos e parkour de precisão.',
      hotkey: 'ENTER',
      accent: '#ffe066',
      borderClass: 'border-[#ffd27d]',
      bgClass: 'bg-gradient-to-br from-[#3a2810] via-[#24170a] to-[#140d07]',
      isStart: true,
      colSpanClass: 'col-span-2 sm:col-span-2',
      tooltipSide: 'bottom',
      onClick: onStart,
    },
    hud.isUnderworld
      ? {
          id: 'surface',
          label: 'Superfície',
          subLabel: '50 Mundos',
          art: campaignArt,
          title: 'Alternar para Superfície (50 Mundos)',
          description:
            'Retorna para a campanha principal nos picos gelados, florestas sakura e cidadelas celestes de Aethelgard.',
          accent: '#52e5ff',
          borderClass: 'border-[#52e5ff]',
          bgClass: 'bg-gradient-to-br from-[#102b3d] to-[#0a1826]',
          tooltipSide: 'bottom',
          onClick: () => onStartPlayMode('campaign'),
        }
      : {
          id: 'underworld',
          label: 'Submundo',
          subLabel: '20 Círculos',
          art: underworldArt,
          title: 'Campanha do Submundo · Abismo',
          description:
            'Desça por 20 círculos infernais e criptas bioluminescentes com inimigos sombrios e recompensas do Abismo.',
          accent: '#ff477e',
          borderClass: 'border-[#ff2e63]',
          bgClass: 'bg-gradient-to-br from-[#3d1020] to-[#1d0811]',
          testId: 'start-underworld-btn',
          tooltipSide: 'bottom',
          onClick: () => onStartPlayMode('underworld'),
        },
    {
      id: 'sandbox',
      label: 'Mundo Aberto',
      subLabel: 'Minerar · Craft · Construir',
      art: sandboxArt,
      title: 'Mundo Aberto · Novo Modo Sobrevivência',
      description:
        'Um único mundo contínuo sem telas de carregamento: 24 biomas conectados, mineração, construção de vilas, 4 chefes, física da campanha e Mapa [M].',
      accent: '#4df0c0',
      borderClass: 'border-[#4df0c0]',
      bgClass: 'bg-gradient-to-br from-[#0e362c] via-[#09231d] to-[#061613]',
      testId: 'start-sandbox-btn',
      tooltipSide: 'bottom',
      onClick: () => onStartPlayMode('sandbox_world'),
    },
    {
      id: 'stages',
      label: 'Mapa de Fases',
      subLabel: `${CHAPTERS.length} Mundos`,
      art: stagesArt,
      title: 'Atlas de Fases & Teleporte',
      description:
        'Visualize todos os capítulos da campanha, estrelas obtidas por fase, relíquias coletadas e viaje direto para salas visitadas.',
      hotkey: 'M',
      accent: '#52e5ff',
      borderClass: 'border-[#3d7b99]',
      bgClass: 'bg-gradient-to-br from-[#142038] to-[#0c1222]',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('map'),
    },
    {
      id: 'modes',
      label: 'Modos Extras',
      subLabel: activeModeDef.badge,
      art: modesArt,
      title: 'Modos Especiais & Desafios',
      description:
        'Alterne entre Boss Rush, Sobrevivência em Ondas, Torre Infinita, Canhão de Vidro, Gravidade Espelhada ou Mundo Sandbox.',
      accent: '#fbbf24',
      borderClass: 'border-[#6d5932]',
      bgClass: 'bg-gradient-to-br from-[#271d14] to-[#15101b]',
      testId: 'open-modes-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('modes'),
    },
  ];

  const rpgButtons: ArtButtonMeta[] = [
    {
      id: 'heroes',
      label: 'Heróis',
      subLabel: `${hud.unlockedHeroes.length}/${HEROES.length} Desbl.`,
      art: heroesArt,
      title: 'Salão dos Heróis & Skins',
      description:
        'Escolha entre 36 heróis elementais únicos, altere skins visuais e defina seu parceiro de Troca em Dupla [F].',
      hotkey: 'H',
      accent: '#4df0c0',
      borderClass: 'border-[#2f6e5c]',
      bgClass: 'bg-[#111f22]',
      testId: 'open-heroes-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('heroes'),
    },
    {
      id: 'forge',
      label: 'Forja & Craft',
      subLabel: `Poder ${hud.heroPowerScore}`,
      art: forgeArt,
      title: 'Forja 10-Slots, Crafting & Evolução 3x',
      description:
        'Crie armas, armaduras, blocos especiais do Sandbox, broca cósmica T6, poções alquímicas e evolua heróis até o Tier 3.',
      hotkey: 'I',
      accent: '#ffd27d',
      borderClass: 'border-[#7a5d29]',
      bgClass: 'bg-[#211912]',
      testId: 'open-forge-title-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('forge', 'equipment'),
    },
    {
      id: 'pets',
      label: 'Pets',
      subLabel: `Vínculo Nv.${hud.petLevel}`,
      art: petsArt,
      title: 'Companheiros Espirituais',
      description:
        'Alimente, suba o nível de vínculo e equipe guardiões voadores que disparam rajadas guiadas [Y] ao seu lado.',
      hotkey: 'Y',
      accent: '#38e8ff',
      borderClass: 'border-[#2d6980]',
      bgClass: 'bg-[#101c28]',
      testId: 'open-pets-title-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('pets'),
    },
    {
      id: 'sanctuary',
      label: 'Santuário',
      subLabel: 'Runas & Maestria',
      art: sanctuaryArt,
      title: 'Santuário de Runas, Maestria & Jukebox',
      description:
        'Equipe runas passivas, invista em árvores de maestria, escolha trilhas sonoras e personalize títulos e auras.',
      hotkey: 'G',
      accent: '#a89eff',
      borderClass: 'border-[#4c4282]',
      bgClass: 'bg-[#161229]',
      testId: 'open-sanctuary-title-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('sanctuary'),
    },
    {
      id: 'quests',
      label: 'Missões',
      subLabel:
        hud.sideQuestsReadyCount > 0 ? `${hud.sideQuestsReadyCount} Pronta(s)!` : 'Side Quests',
      art: questsArt,
      title: 'Quadro de Side Quests',
      description:
        'Cumpra objetivos de exploração, acenda faróis e decifre estelas para resgatar Moedas Astrais e XP de Temporada.',
      hotkey: 'O',
      accent: '#8effdb',
      borderClass: 'border-[#2e6b58]',
      bgClass: 'bg-[#0f1f1d]',
      testId: 'open-quests-title-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('quests'),
    },
  ];

  const archiveButtons: ArtButtonMeta[] = [
    {
      id: 'pass',
      label: `Passe Nv.${titlePassProg.level}`,
      subLabel: hud.canClaimDaily ? '★ Bônus Diário' : 'Temporada',
      art: passArt,
      title: 'Passe Astral & Bônus Diário',
      description:
        'Resgate recompensas gratuitas e estelares subindo de nível no passe e coletando seu presente diário de login.',
      hotkey: 'V',
      accent: '#ffe066',
      borderClass: 'border-[#785e24]',
      bgClass: 'bg-[#1d1711]',
      testId: 'open-pass-title-btn',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('pass'),
    },
    {
      id: 'blessings',
      label: 'Bênçãos',
      subLabel: `${hud.astralCoins} ★`,
      art: blessingsArt,
      title: 'Altar de Bênçãos Permanentes',
      description:
        'Invista suas Moedas Astrais (★) para aumentar velocidade, estamina máxima e poder das habilidades em qualquer modo.',
      hotkey: 'B',
      accent: '#ffd27d',
      borderClass: 'border-[#5e4d31]',
      bgClass: 'bg-[#1a151c]',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('blessings'),
    },
    {
      id: 'compendium',
      label: 'Compêndio',
      subLabel: `${hud.discoveredMechanics}/${TOTAL_MECHANICS}`,
      art: compendiumArt,
      title: `Enciclopédia das ${TOTAL_MECHANICS} Mecânicas`,
      description:
        'Consulte cada técnica descoberta — de Wave-Dash e Parry Aéreo até Blocos de Sonho e Combos Elementais.',
      accent: '#52e5ff',
      borderClass: 'border-[#2f5d78]',
      bgClass: 'bg-[#111926]',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('compendium'),
    },
    {
      id: 'chronicles',
      label: 'Crônicas',
      subLabel: 'Lore & Códice',
      art: chroniclesArt,
      title: 'Crônicas de Aethelgard & Códice',
      description:
        'Leia os pergaminhos históricos encontrados nas ruínas, reveja cutscenes desbloqueadas e acompanhe suas conquistas.',
      accent: '#f472b6',
      borderClass: 'border-[#6b3456]',
      bgClass: 'bg-[#1e1222]',
      tooltipSide: 'top',
      onClick: () => onOpenOverlay('chronicles'),
    },
  ];

  if (hasSavedProgress) {
    archiveButtons.push({
      id: 'restart',
      label: 'Nova Run',
      subLabel: 'Zerar Fase',
      art: restartArt,
      title: 'Reiniciar Campanha do Zero',
      description:
        'Comece uma nova jornada desde a Fase 1 reiniciando o progresso da campanha atual sem perder suas conquistas gerais.',
      accent: '#ff708d',
      borderClass: 'border-[#612c3c]',
      bgClass: 'bg-[#1c1018]',
      tooltipSide: 'top',
      onClick: onRestartFull,
    });
  }

  return (
    <div
      data-testid="title-screen"
      className="fixed inset-0 z-20 flex flex-col justify-between overflow-y-auto lg:overflow-hidden bg-gradient-to-b from-[#07050eb8] via-transparent to-[#07050ee6] p-2.5 md:p-4 pointer-events-none"
    >
      {/* Top Status Ribbon */}
      <div className="mx-auto flex w-full max-w-[1380px] shrink-0 flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div
          className={`flex items-center gap-2.5 px-3 py-1 ${
            hud.isUnderworld ? 'pixel-panel-infernal' : 'pixel-panel border-[#41385e]'
          }`}
        >
          <span
            style={{ backgroundColor: hud.isUnderworld ? '#ff2e63' : activeHero.accentColor }}
            className="inline-block h-2.5 w-2.5 shrink-0 border border-[#07050d]"
          />
          <span className="font-pixel text-[11px] tracking-wider text-[#b8afc9]">
            {hud.isUnderworld
              ? `SUBMUNDO ${(hud.chapterIndex ?? 0) + 1}/${UNDERWORLD_CHAPTERS.length}`
              : `MUNDO ${(hud.chapterIndex ?? 0) + 1}/${CHAPTERS.length}`}
          </span>
          <strong className="font-pixel text-xs text-[#f5efe6] text-stroke-dark">
            {titleChapter.name}
          </strong>
          <span className="border border-[#07050d] bg-[#1b132e] px-1.5 py-0.5 font-pixel text-[10px] text-[#ffd27d]">
            {activeModeDef.badge}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="pixel-panel flex items-center gap-3 border-[#41385e] px-3 py-1 font-mono-num text-xs">
            <span className="text-[#ffd27d]">★ {hud.totalWorldStars}/{hud.isUnderworld ? 60 : 150}</span>
            {!hud.isUnderworld && (
              <span className="text-[#ff5c8a]">Abismo {hud.totalUnderworldStars ?? 0}/60★</span>
            )}
            <span className="text-[#ffe47a]">{hud.astralCoins} Moedas</span>
            <span className="text-[#52e5ff]">
              Passe Nv.{titlePassProg.level}/{PASS_MAX_TIER}
            </span>
          </div>
          <PixelButton
            type="button"
            variant="slate"
            onClick={onToggleMute}
            aria-label={hud.muted ? 'Ativar Áudio' : 'Silenciar Áudio'}
            className="!px-2.5 !py-1 text-xs"
          >
            <PixelIcon
              name={hud.muted ? 'sound_off' : 'sound_on'}
              className={`h-4 w-4 ${hud.muted ? 'text-[#ff708d]' : 'text-[#4df0c0]'}`}
            />
            <span>[N]</span>
          </PixelButton>
        </div>
      </div>

      {/* Center 12-Col Split Layout: Left Emblem & Art-Button Command Center | Right Compact Live Showcases */}
      <div className="my-auto mx-auto grid w-full max-w-[1380px] grid-cols-1 gap-3 py-1 lg:grid-cols-12 lg:items-center pointer-events-none">
        {/* Left Column */}
        <div className="flex flex-col items-start gap-2 lg:col-span-7 pointer-events-auto">
          {/* Sculpted Pixel Mountain & Crystal Crest Emblem (Compact & Crisp) */}
          <div className="flex w-full items-center justify-between gap-3">
            <svg
              viewBox="0 0 470 80"
              shapeRendering="crispEdges"
              className="w-full max-w-[400px] drop-shadow-[0_5px_0_#07050d]"
              role="img"
              aria-label="Aethelgard: Abismo de Cinzas"
            >
              <rect x="12" y="8" width="2" height="2" fill="#52e5ff" opacity="0.85" />
              <rect x="44" y="6" width="2" height="2" fill="#ffd27d" opacity="0.9" />
              <rect x="8" y="30" width="2" height="2" fill="#ff5c8a" opacity="0.75" />
              <rect x="48" y="26" width="2" height="2" fill="#52e5ff" opacity="0.85" />

              <rect x="26" y="2" width="6" height="4" fill="#a8f5ff" />
              <rect x="23" y="6" width="12" height="6" fill="#52e5ff" />
              <rect x="21" y="10" width="16" height="5" fill="#2cb7db" />
              <rect x="26" y="7" width="5" height="4" fill="#ffffff" />
              <rect x="12" y="19" width="34" height="2" fill="#ffd27d" />

              <rect x="24" y="23" width="10" height="7" fill="#f2cbb0" />
              <rect x="19" y="30" width="20" height="11" fill="#e8a87c" />
              <rect x="15" y="41" width="28" height="13" fill="#b87148" />
              <rect x="11" y="54" width="36" height="11" fill="#7d4930" />
              <rect x="23" y="43" width="12" height="22" fill="#07050d" />
              <rect x="27" y="49" width="4" height="14" fill="#ff2e63" />
              <rect x="28" y="52" width="2" height="9" fill="#ffe066" />
              <rect x="6" y="67" width="46" height="3" fill="#ffd27d" />
              <rect x="12" y="72" width="34" height="3" fill="#ff2e63" />

              <text
                x="66"
                y="44"
                fill="#07050d"
                fontFamily="Pixelify Sans, monospace"
                fontWeight="700"
                fontSize="38"
                letterSpacing="2"
              >
                AETHELGARD
              </text>
              <text
                x="64"
                y="41"
                fill="#f5efe6"
                fontFamily="Pixelify Sans, monospace"
                fontWeight="700"
                fontSize="38"
                letterSpacing="2"
              >
                AETHELGARD
              </text>
              <rect x="64" y="50" width="194" height="2" fill="#52e5ff" opacity="0.85" />
              <rect x="262" y="48" width="6" height="6" fill="#ffd27d" />
              <rect x="272" y="50" width="160" height="2" fill="#ff2e63" opacity="0.92" />
              <rect x="62" y="57" width="374" height="16" fill="#07050d" opacity="0.72" />
              <text
                x="66"
                y="69"
                fill="#ffd27d"
                fontFamily="Pixelify Sans, monospace"
                fontWeight="700"
                fontSize="11.5"
                letterSpacing="1.6"
              >
                50 MUNDOS · 20 CÍRCULOS · MUNDO ABERTO
              </text>
            </svg>
          </div>

          {/* Command Dock Card */}
          <div className="pixel-panel relative flex w-full flex-col gap-1.5 border-[#41385e] bg-[#0e0a19f2] p-2.5 shadow-[0_0_0_1px_#07050d,0_12px_40px_#07050d99]">
            {/* Section 1: Play Modes (Balanced 3-col grid: Start spans 2 + Submundo = 3; Row 2 = 3 cols) */}
            <div>
              <div className="flex items-center justify-between">
                <SectionHeading label="Jogar" accent="#52e5ff" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {primaryButtons.map((btn) => (
                  <ArtActionButton
                    key={btn.id}
                    btn={btn}
                    hoveredId={hoveredBtn?.id ?? null}
                    onHover={setHoveredBtn}
                  />
                ))}
              </div>
            </div>

            {/* Section 2: Progression + Archive in one compact, evenly spaced tile strip */}
            <div className="pt-1">
              <SectionHeading label="Progressão & Arquivo" accent="#ffd27d" />
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {[...rpgButtons, ...archiveButtons].map((btn) => (
                  <ArtActionButton
                    key={btn.id}
                    btn={btn}
                    hoveredId={hoveredBtn?.id ?? null}
                    onHover={setHoveredBtn}
                    tileMode
                  />
                ))}
              </div>
            </div>

            {/* Live Button Inspector Bar */}
            <div
              data-testid="title-button-inspector"
              style={{ borderColor: hoveredBtn?.accent ?? '#29223d' }}
              className="flex min-h-[38px] items-center gap-2.5 border-2 bg-[#080510] px-2.5 py-1 transition-colors"
            >
              {hoveredBtn ? (
                <>
                  <img
                    src={hoveredBtn.art}
                    alt=""
                    style={{ imageRendering: 'pixelated' }}
                    className="h-6 w-6 shrink-0 border border-[#07050d]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ color: hoveredBtn.accent }} className="font-pixel text-xs font-bold">
                        {hoveredBtn.title}
                      </span>
                      {hoveredBtn.hotkey && (
                        <span className="border border-[#07050d] bg-[#161224] px-1 font-mono-num text-[9px] text-[#ffd27d]">
                          [{hoveredBtn.hotkey}]
                        </span>
                      )}
                    </div>
                    <p className="font-body-pixel text-[11px] leading-snug text-[#ded7eb]">
                      {hoveredBtn.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex w-full items-center justify-between gap-2 text-[#b8afc9]">
                  <span className="truncate font-pixel text-[11px]">
                    ✦ Passe o mouse sobre qualquer ícone para ver o que o botão faz.
                  </span>
                  <span className="hidden whitespace-nowrap font-mono-num text-[10px] text-[#52e5ff] sm:inline">
                    Enter Iniciar · M Fases · I Forja
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Compact Live Stage Preview + Interactive Hero Evolution & Pet Showcase */}
        <div className="flex flex-col gap-2 lg:col-span-5 pointer-events-auto">
          <StagePreviewCard
            chapter={titleChapter}
            chapterIndex={hud.chapterIndex ?? 0}
            isUnderworld={Boolean(hud.isUnderworld)}
            onOpenStageMap={() => onOpenOverlay('map')}
          />

          <HeroEvolutionAndPetShowcaseCard
            hero={activeHero}
            skinId={hud.heroSkinId}
            actualEvolutionTier={hud.activeHeroEvolution ?? 0}
            equippedPetId={hud.equippedSpirit}
            petBondLv={hud.petLevel ?? 1}
            playerLevel={hud.playerLevel}
            levelProgress={hud.playerLevelProgress}
            currentXp={hud.playerCurrentLevelXp}
            nextXp={hud.playerNextLevelXp}
            heroPowerScore={hud.heroPowerScore}
            auraName={titleAura.name}
            auraColor={titleAura.primaryColor}
            passLevel={titlePassProg.level}
            passProgress={titlePassProg.progress}
            onOpenHeroes={() => onOpenOverlay('heroes')}
            onOpenForgeEvo={() => onOpenOverlay('forge', 'evolution')}
            onOpenPets={() => onOpenOverlay('pets')}
          />
        </div>
      </div>

      {/* Bottom Controls Line */}
      <div className="mx-auto flex w-full max-w-[1380px] shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="border border-[#29223d] bg-[#0b0815d9] px-2.5 py-1 font-pixel text-[10px] tracking-wide text-[#b8afc9]">
          WASD/Setas · Espaço/Z Pular · X/Shift Dash · C Escalar · Q Poder · U Alma · F Dupla · I Forja · M Mapa · Y Pets
        </p>
        {gamepadName && (
          <span className="border-2 border-[#07050d] bg-[#1a5c49] px-2 py-0.5 font-pixel text-[10px] font-bold text-[#8effdb]">
            JOYSTICK ATIVO
          </span>
        )}
      </div>
    </div>
  );
};
