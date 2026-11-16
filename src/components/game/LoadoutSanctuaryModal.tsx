// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React, { useState } from 'react';
import { GameEngine } from '../../game/engine';
import { HEROES, HERO_RARITY_META, getHeroElement } from '../../game/heroes';
import {
  ACHIEVEMENTS,
  BESTIARY_ENTRIES,
  BOONS,
  ELEMENT_META,
  HUNTER_CONTRACTS,
  JUKEBOX_TRACKS,
  PLAYER_TITLES,
  RUNES,
  SPIRITS,
  TALISMANS,
  TITLE_MAP,
  UNDERWORLD_BESTIARY_ENTRIES,
  computeRuneBonuses,
  getContractMetricValue,
  getMasteryBonuses,
  getMasteryUpgradeCost,
} from '../../game/systems';
import {
  ALL_ENEMY_BESTIARY,
  ENEMY_BESTIARY,
  UNDERWORLD_ENEMY_BESTIARY,
} from '../../game/passAndRewards';
import { HudSnapshot, RuneId, SpiritId, TalismanId, TitleId } from '../../game/types';
import { HeroPortrait } from './HeroPortrait';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

type SanctuaryTab =
  | 'runes'
  | 'talismans'
  | 'boons'
  | 'bestiary'
  | 'contracts'
  | 'spirit'
  | 'tag'
  | 'mastery'
  | 'achievements'
  | 'jukebox'
  | 'ghost';

interface LoadoutSanctuaryModalProps {
  engine: GameEngine;
  hud: HudSnapshot;
  onClose: () => void;
}

const MASTERY_BRANCHES: {
  key: 'mobilityLv' | 'combatLv' | 'explorationLv' | 'survivalLv';
  name: string;
  color: string;
  desc: string;
  statLabel: (lv: number) => string;
}[] = [
  {
    key: 'mobilityLv',
    name: 'Maestria da Mobilidade',
    color: '#52e5ff',
    desc: 'Aumenta a velocidade base de movimento e aceleração em todas as fases.',
    statLabel: (lv) => `+${lv * 4}% Velocidade`,
  },
  {
    key: 'combatLv',
    name: 'Maestria de Combate',
    color: '#ff5c8a',
    desc: 'Acelera a recarga da habilidade [Q] e eleva a carga de Éter Supremo.',
    statLabel: (lv) => `-${lv * 3}% Recarga · +${lv * 5}% Éter`,
  },
  {
    key: 'explorationLv',
    name: 'Maestria de Exploração',
    color: '#ffd27d',
    desc: 'Expande o raio magnético de coleta de moedas e bônus de Moedas Astrais.',
    statLabel: (lv) => `+${lv * 8}px Imã · +${Math.floor(lv / 2)}★ Bônus`,
  },
  {
    key: 'survivalLv',
    name: 'Maestria de Sobrevivência',
    color: '#4df0c0',
    desc: 'Fortalece o vigor máximo para escalar paredões verticais e saltos.',
    statLabel: (lv) => `+${lv * 6}% Vigor Máximo`,
  },
];

export const LoadoutSanctuaryModal: React.FC<LoadoutSanctuaryModalProps> = ({
  engine,
  hud,
  onClose,
}) => {
  const [tab, setTab] = useState<SanctuaryTab>('runes');
  const [bestiaryFilter, setBestiaryFilter] = useState<'bosses' | 'enemies'>('bosses');
  const [bestiaryRealm, setBestiaryRealm] = useState<'all' | 'surface' | 'underworld'>('all');

  const runeBonuses = computeRuneBonuses(hud.equippedRunes);
  const masteryBonuses = getMasteryBonuses(hud.mastery);
  const tagHero = HEROES.find((h) => h.id === hud.tagHeroId) ?? HEROES[0];
  const tagEl = ELEMENT_META[getHeroElement(tagHero.id)];
  const totalBossesDefeated = engine.getTotalBossesDefeated();

  const contractStats = {
    perfectDodges: hud.perfectDodges,
    crownShards: hud.crownShardsCollected,
    bossesDefeated: totalBossesDefeated,
    parries: hud.totalParries,
    reactions: hud.totalReactions,
    relics: hud.relicsCollected,
    styleSS: hud.totalStyleSS,
    bestWave: hud.bestSurvivalWave,
  };

  const tabs: { id: SanctuaryTab; label: string; color: string }[] = [
    { id: 'runes', label: `Runas (${hud.equippedRunes.length}/3)`, color: '#ff5c8a' },
    { id: 'talismans', label: 'Talismãs & Títulos', color: '#ffd24d' },
    { id: 'boons', label: `Cartas (${hud.activeBoons.length}/${BOONS.length})`, color: '#c084fc' },
    {
      id: 'bestiary',
      label: `Bestiário (${BESTIARY_ENTRIES.length + UNDERWORLD_BESTIARY_ENTRIES.length + ALL_ENEMY_BESTIARY.length})`,
      color: '#ff3864',
    },
    {
      id: 'contracts',
      label: `Contratos (${hud.claimedContracts.length}/${HUNTER_CONTRACTS.length})`,
      color: '#4df0c0',
    },
    { id: 'spirit', label: 'Espírito', color: '#52e5ff' },
    { id: 'tag', label: 'Dupla [F]', color: '#34d399' },
    { id: 'mastery', label: `Maestria (${hud.mastery.xp} XP)`, color: '#ffe066' },
    {
      id: 'achievements',
      label: `Conquistas (${hud.unlockedAchievements.length}/${ACHIEVEMENTS.length})`,
      color: '#e879f9',
    },
    { id: 'jukebox', label: 'Jukebox', color: '#38bdf8' },
    { id: 'ghost', label: 'Fantasma', color: '#a5b4fc' },
  ];

  const activeTitleDef = TITLE_MAP[hud.activeTitle] ?? PLAYER_TITLES[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Santuário de Runas, Talismãs, Bestiário e Maestria"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/92 p-3 md:p-6 pointer-events-auto"
    >
      <PixelWindow
        title="Santuário Astral · Arsenal, Bestiário & Maestria"
        subtitle={`Título: ${activeTitleDef.name} · Moedas: ${hud.astralCoins}★ · XP: ${hud.mastery.xp} · Troca [F]: ${tagHero.name}`}
        accentColor="#52e5ff"
        onClose={onClose}
        maxWidthClass="max-w-5xl"
      >
        {/* Tab Strip */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 border-2 border-[#07050d] bg-[#100b1d] p-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <PixelButton
                key={t.id}
                type="button"
                variant={active ? 'gold' : 'slate'}
                data-testid={`sanctuary-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className="px-2.5 py-1.5 text-xs"
              >
                <span
                  style={{ backgroundColor: t.color }}
                  className="inline-block h-2 w-2 border border-[#07050d]"
                  aria-hidden="true"
                />
                <span>{t.label}</span>
              </PixelButton>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="pixel-scroll max-h-[66vh] overflow-y-auto pr-1">
          {tab === 'runes' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel text-[#ffd27d]">
                  FORJA DE RUNAS · ATÉ 3 RUNAS ATIVAS ({hud.equippedRunes.length}/3)
                </span>
                <span className="font-body-pixel text-[#d7cee8]">
                  Bônus Totais: +{Math.round(runeBonuses.speedBonus * 100)}% Vel ·{' '}
                  {runeBonuses.extraAirJump > 0 ? '+1 Salto Aéreo · ' : ''}
                  {runeBonuses.parryDamageBonus > 0 ? `+${runeBonuses.parryDamageBonus} Dano Parry · ` : ''}
                  Recarga x{runeBonuses.skillCdMult.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {RUNES.map((rune) => {
                  const unlocked = engine.unlockedRunes.has(rune.id);
                  const equipped = hud.equippedRunes.includes(rune.id);
                  const canAfford = hud.astralCoins >= rune.cost;
                  return (
                    <div
                      key={rune.id}
                      style={{ borderColor: equipped ? rune.color : '#2d2347' }}
                      className={`pixel-subpanel flex flex-col justify-between p-3 ${
                        equipped ? 'bg-[#1f1638]' : 'bg-[#120d22]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <strong style={{ color: rune.color }} className="font-pixel text-sm font-bold">
                            {rune.name}
                          </strong>
                          {equipped ? (
                            <span className="border border-[#07050d] bg-[#4df0c0] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#09080f]">
                              EQUIPADA
                            </span>
                          ) : unlocked ? (
                            <span className="border border-[#07050d] bg-[#2a223d] px-1.5 py-0.5 font-pixel text-[9px] text-[#b8afc9]">
                              FORJADA
                            </span>
                          ) : (
                            <span className="border border-[#07050d] bg-[#362010] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#ffd27d]">
                              {rune.cost}★
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-pixel text-[11px] font-bold text-[#ffe47a]">
                          {rune.title}
                        </p>
                        <p className="mt-1 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                          {rune.description}
                        </p>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={equipped ? 'emerald' : unlocked || canAfford ? 'gold' : 'slate'}
                          disabled={!unlocked && !canAfford}
                          data-testid={`rune-btn-${rune.id}`}
                          onClick={() => engine.toggleRune(rune.id as RuneId)}
                          className="w-full py-1.5 text-xs"
                        >
                          {equipped
                            ? 'Remover do Slot'
                            : unlocked
                              ? 'Equipar Runa'
                              : canAfford
                                ? `Forjar & Equipar (${rune.cost}★)`
                                : `Precisa ${rune.cost}★`}
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'talismans' && (
            <div className="flex flex-col gap-4">
              {/* Talisman Forge */}
              <div className="flex flex-col gap-2.5">
                <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                  <span className="font-pixel font-bold text-[#ffd24d]">
                    TALISMÃS ELEMENTAIS (11 RELÍQUIAS DE PODER)
                  </span>
                  <PixelButton
                    type="button"
                    variant={hud.equippedTalisman === 'none' ? 'gold' : 'slate'}
                    onClick={() => engine.selectTalisman('none')}
                    className="px-2.5 py-1 text-[10px]"
                  >
                    Sem Talismã
                  </PixelButton>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {TALISMANS.map((tal) => {
                    const unlocked = hud.unlockedTalismans.includes(tal.id);
                    const equipped = hud.equippedTalisman === tal.id;
                    const canAfford = hud.astralCoins >= tal.cost;
                    const elMeta = ELEMENT_META[tal.element];
                    return (
                      <div
                        key={tal.id}
                        style={{ borderColor: equipped ? tal.color : '#2d2347' }}
                        className={`pixel-subpanel flex flex-col justify-between p-3 ${
                          equipped ? 'bg-[#22193c]' : 'bg-[#120d22]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <strong style={{ color: tal.color }} className="font-pixel text-sm font-bold">
                              {tal.name}
                            </strong>
                            <span
                              style={{ color: elMeta.color, borderColor: elMeta.color }}
                              className="border px-1.5 py-0.5 font-pixel text-[9px] font-bold"
                            >
                              {elMeta.label}
                            </span>
                          </div>
                          <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                            {tal.desc}
                          </p>
                        </div>
                        <div className="mt-3">
                          <PixelButton
                            type="button"
                            variant={equipped ? 'emerald' : unlocked || canAfford ? 'gold' : 'slate'}
                            disabled={!unlocked && !canAfford}
                            data-testid={`talisman-btn-${tal.id}`}
                            onClick={() => engine.selectTalisman(tal.id as TalismanId)}
                            className="w-full py-1.5 text-xs"
                          >
                            {equipped
                              ? 'Talismã Equipado'
                              : unlocked
                                ? 'Equipar Talismã'
                                : canAfford
                                  ? `Forjar (${tal.cost}★)`
                                  : `Precisa ${tal.cost}★`}
                          </PixelButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player Honorific Titles */}
              <div className="flex flex-col gap-2.5">
                <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                  <span className="font-pixel font-bold text-[#52e5ff]">
                    TÍTULOS DE HONRA ({hud.unlockedTitles.length}/{PLAYER_TITLES.length})
                  </span>
                  <span className="font-body-pixel text-[#d7cee8]">
                    Esquivas Perfeitas: {hud.perfectDodges} · Fragmentos de Coroa: {hud.crownShardsCollected}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {PLAYER_TITLES.map((t) => {
                    const unlocked = hud.unlockedTitles.includes(t.id);
                    const active = hud.activeTitle === t.id;
                    return (
                      <div
                        key={t.id}
                        style={{ borderColor: active ? t.color : '#281e42' }}
                        className={`pixel-subpanel flex flex-col justify-between p-2.5 ${
                          unlocked ? 'bg-[#17122b]' : 'bg-[#0e0a1a] opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <strong style={{ color: t.color }} className="font-pixel text-sm font-bold">
                              {t.name}
                            </strong>
                            {active && (
                              <span className="border border-[#07050d] bg-[#4df0c0] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#09080f]">
                                ATIVO
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-body-pixel text-[11px] text-[#cfc6e0]">{t.requirement}</p>
                        </div>
                        <div className="mt-2">
                          <PixelButton
                            type="button"
                            variant={active ? 'emerald' : unlocked ? 'cyan' : 'slate'}
                            disabled={!unlocked}
                            onClick={() => engine.selectTitle(t.id as TitleId)}
                            className="w-full py-1 text-[11px]"
                          >
                            {active ? 'Título em Uso' : unlocked ? 'Exibir Título' : 'Bloqueado'}
                          </PixelButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'boons' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <div>
                  <span className="font-pixel font-bold text-[#c084fc]">
                    CARTAS ASTRAIS ROGUELITE ({hud.activeBoons.length}/{BOONS.length} ATIVAS NA CORRIDA)
                  </span>
                  <p className="font-body-pixel text-[11px] text-[#d7cee8]">
                    Escolha 1 entre 3 bênçãos únicas sempre que purificar etapas críticas, derrotar guardiões ou sortear no Santuário.
                  </p>
                </div>
                <PixelButton
                  type="button"
                  variant="gold"
                  disabled={hud.astralCoins < 5 || hud.activeBoons.length >= BOONS.length}
                  data-testid="draft-boon-btn"
                  onClick={() => {
                    if (engine.astralCoins >= 5) {
                      engine.astralCoins -= 5;
                      engine.triggerBoonDraft();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs"
                >
                  <PixelIcon name="shrine" className="h-3.5 w-3.5" />
                  <span>Sortear Carta (5★)</span>
                </PixelButton>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {BOONS.map((b) => {
                  const active = hud.activeBoons.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      style={{ borderColor: active ? b.color : '#281e42' }}
                      className={`pixel-subpanel p-3 ${active ? 'bg-[#22163b]' : 'bg-[#120d22] opacity-85'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <strong style={{ color: b.color }} className="font-pixel text-sm font-bold">
                          {b.name}
                        </strong>
                        <span
                          className={`border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold ${
                            active
                              ? 'bg-[#4df0c0] text-[#09080f]'
                              : b.rarity === 'Mítica'
                                ? 'bg-[#3b155e] text-[#e879f9]'
                                : b.rarity === 'Rara'
                                  ? 'bg-[#152d4f] text-[#52e5ff]'
                                  : 'bg-[#1f1933] text-[#d7cee8]'
                          }`}
                        >
                          {active ? 'ATIVA' : b.rarity}
                        </span>
                      </div>
                      <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                        {b.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'bestiary' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel font-bold text-[#ff3864]">
                  BESTIÁRIO ({BESTIARY_ENTRIES.length + UNDERWORLD_BESTIARY_ENTRIES.length} GUARDIÕES + {ALL_ENEMY_BESTIARY.length} INIMIGOS)
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <PixelButton
                    type="button"
                    variant={bestiaryFilter === 'bosses' ? 'gold' : 'slate'}
                    onClick={() => setBestiaryFilter('bosses')}
                    className="px-2.5 py-1 text-[11px]"
                  >
                    <span>Guardiões ({BESTIARY_ENTRIES.length + UNDERWORLD_BESTIARY_ENTRIES.length})</span>
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant={bestiaryFilter === 'enemies' ? 'cyan' : 'slate'}
                    data-testid="bestiary-enemies-btn"
                    onClick={() => setBestiaryFilter('enemies')}
                    className="px-2.5 py-1 text-[11px]"
                  >
                    <span>Inimigos ({ALL_ENEMY_BESTIARY.length})</span>
                  </PixelButton>
                  <span className="mx-1 hidden h-4 w-[2px] bg-[#2f254a] sm:inline-block" aria-hidden="true" />
                  <PixelButton
                    type="button"
                    variant={bestiaryRealm === 'all' ? 'emerald' : 'slate'}
                    onClick={() => setBestiaryRealm('all')}
                    className="px-2 py-1 text-[10px]"
                  >
                    <span>Todos</span>
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant={bestiaryRealm === 'surface' ? 'emerald' : 'slate'}
                    onClick={() => setBestiaryRealm('surface')}
                    className="px-2 py-1 text-[10px]"
                  >
                    <span>Superfície</span>
                  </PixelButton>
                  <PixelButton
                    type="button"
                    variant={bestiaryRealm === 'underworld' ? 'gold' : 'slate'}
                    data-testid="bestiary-underworld-btn"
                    onClick={() => setBestiaryRealm('underworld')}
                    className="px-2 py-1 text-[10px]"
                  >
                    <span>Submundo (20)</span>
                  </PixelButton>
                </div>
              </div>

              {bestiaryFilter === 'bosses' ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {(bestiaryRealm === 'surface'
                    ? BESTIARY_ENTRIES
                    : bestiaryRealm === 'underworld'
                      ? UNDERWORLD_BESTIARY_ENTRIES
                      : [...BESTIARY_ENTRIES, ...UNDERWORLD_BESTIARY_ENTRIES]
                  ).map((entry) => {
                    const kills = hud.bestiaryDefeats[entry.kind] ?? 0;
                    const weakEl = ELEMENT_META[entry.weaknessElement];
                    const isUwBoss = entry.kind.startsWith('uboss_');
                    return (
                      <div
                        key={entry.kind}
                        style={{ borderColor: entry.accent + '88' }}
                        className="pixel-subpanel flex flex-col justify-between bg-[#120d22] p-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-mono-num text-[10px] text-[#a9a0bd]">
                                {isUwBoss ? `SUBMUNDO · CÍRCULO ${entry.chapter + 1}` : `MUNDO ${entry.chapter + 1}`} · {entry.title}
                              </div>
                              <strong style={{ color: entry.accent }} className="font-pixel text-base font-bold">
                                {entry.name}
                              </strong>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                style={{ color: weakEl.color, borderColor: weakEl.color }}
                                className="border bg-[#0b0816] px-1.5 py-0.5 font-pixel text-[9px] font-bold"
                              >
                                FRACO A {weakEl.label.toUpperCase()}
                              </span>
                              <span className="font-mono-num text-[10px] text-[#ffd27d]">
                                Postura: {entry.maxStagger} · Abates: {kills}
                              </span>
                            </div>
                          </div>

                          <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#cfc6e0]">
                            {entry.lore}
                          </p>
                          <p className="mt-1.5 font-body-pixel text-[11px] text-[#8effdb]">
                            Tática: {entry.tacticalTip}
                          </p>
                        </div>

                        <div className="mt-3">
                          <PixelButton
                            type="button"
                            variant="gold"
                            data-testid={`duel-boss-${entry.kind}`}
                            onClick={() => {
                              engine.practiceBoss(entry.kind);
                              onClose();
                            }}
                            className="w-full py-1.5 text-xs"
                          >
                            <PixelIcon name="play" className="h-3.5 w-3.5" />
                            <span>Duelo Direto contra {entry.name}</span>
                          </PixelButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {(bestiaryRealm === 'surface'
                    ? ENEMY_BESTIARY
                    : bestiaryRealm === 'underworld'
                      ? UNDERWORLD_ENEMY_BESTIARY
                      : ALL_ENEMY_BESTIARY
                  ).map((en) => {
                    const kills = hud.enemyKills?.[en.kind] ?? 0;
                    const claimed = hud.claimedEnemyBounties?.includes(en.kind) ?? false;
                    const canClaim = !claimed && en.bountyTarget > 0 && kills >= en.bountyTarget;
                    return (
                      <div
                        key={en.kind}
                        style={{ borderColor: claimed ? '#4df0c0' : en.accent + '88' }}
                        className="pixel-subpanel flex flex-col justify-between bg-[#120d22] p-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                style={{ color: en.accent, borderColor: en.accent + '66' }}
                                className="inline-block border bg-[#0b0816] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase"
                              >
                                {en.archetype}
                              </span>
                              <strong style={{ color: en.accent }} className="mt-1 block font-pixel text-sm font-bold">
                                {en.name}
                              </strong>
                            </div>
                            <span className="font-mono-num text-[10px] font-bold text-[#ffd27d]">
                              Abates: {kills}
                            </span>
                          </div>
                          <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#cfc6e0]">
                            {en.mechanic}
                          </p>
                          <p className="mt-1 font-body-pixel text-[11px] text-[#8effdb]">
                            Dica: {en.counterTip}
                          </p>
                        </div>

                        {en.bountyTarget > 0 && (
                          <div className="mt-2.5">
                            <PixelButton
                              type="button"
                              variant={claimed ? 'emerald' : canClaim ? 'gold' : 'slate'}
                              disabled={!canClaim}
                              onClick={() => engine.claimEnemyBounty(en.kind)}
                              className="w-full py-1 text-[11px]"
                            >
                              {claimed
                                ? `Recompensa Coletada (+${en.bountyCoins}★)`
                                : canClaim
                                  ? `Resgatar Caçada (+${en.bountyCoins}★)`
                                  : `Caçada: ${Math.min(kills, en.bountyTarget)}/${en.bountyTarget} (+${en.bountyCoins}★)`}
                            </PixelButton>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'contracts' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel font-bold text-[#4df0c0]">
                  CONTRATOS DE CAÇA ({hud.claimedContracts.length}/{HUNTER_CONTRACTS.length} RESGATADOS)
                </span>
                <span className="font-body-pixel text-[#d7cee8]">
                  Cumpra metas de Esquiva Perfeita, Parry, Quebra de Guarda e Chefões para ganhar ★ e XP.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {HUNTER_CONTRACTS.map((c) => {
                  const claimed = hud.claimedContracts.includes(c.id);
                  const val = getContractMetricValue(c.metric, contractStats);
                  const pct = Math.min(1, val / Math.max(1, c.target));
                  const ready = !claimed && val >= c.target;
                  return (
                    <div
                      key={c.id}
                      style={{ borderColor: claimed ? '#4df0c0' : ready ? c.color : '#281e42' }}
                      className="pixel-subpanel flex flex-col justify-between bg-[#120d22] p-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <strong style={{ color: c.color }} className="font-pixel text-sm font-bold">
                            {c.title}
                          </strong>
                          <span className="font-mono-num text-[10px] text-[#ffe47a]">
                            +{c.coinReward}★ / +{c.xpReward}XP
                          </span>
                        </div>
                        <p className="mt-1 font-body-pixel text-xs text-[#d7cee8]">{c.desc}</p>
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between font-mono-num text-[10px] text-[#b8afc9]">
                            <span>Progresso</span>
                            <span>
                              {Math.min(val, c.target)}/{c.target}
                            </span>
                          </div>
                          <div className="h-2 w-full border border-[#07050d] bg-[#0a0712]">
                            <div
                              style={{
                                width: `${Math.round(pct * 100)}%`,
                                backgroundColor: claimed ? '#4df0c0' : c.color,
                              }}
                              className="h-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={claimed ? 'emerald' : ready ? 'gold' : 'slate'}
                          disabled={!ready}
                          data-testid={`claim-contract-${c.id}`}
                          onClick={() => engine.claimContract(c.id)}
                          className="w-full py-1.5 text-xs"
                        >
                          {claimed
                            ? 'Recompensa Resgatada'
                            : ready
                              ? `Resgatar (+${c.coinReward}★)`
                              : `Faltam ${Math.max(0, c.target - val)}`}
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'spirit' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel text-[#52e5ff]">
                  COMPANHEIRO ESPIRITUAL ORBITAL · SEGUE & DISPARA AUTOMATICAMENTE
                </span>
                <PixelButton
                  type="button"
                  variant={hud.equippedSpirit === 'none' ? 'gold' : 'slate'}
                  onClick={() => engine.selectSpirit('none')}
                  className="px-2.5 py-1 text-[10px]"
                >
                  Sem Espírito
                </PixelButton>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SPIRITS.map((sp) => {
                  const unlocked = engine.unlockedSpirits.has(sp.id);
                  const equipped = hud.equippedSpirit === sp.id;
                  const canAfford = hud.astralCoins >= sp.cost;
                  return (
                    <div
                      key={sp.id}
                      style={{ borderColor: equipped ? sp.color : '#2d2347' }}
                      className={`pixel-subpanel flex flex-col justify-between p-3 ${
                        equipped ? 'bg-[#191f38]' : 'bg-[#120d22]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: sp.color }}
                              className="inline-block h-3.5 w-3.5 border border-[#07050d]"
                            />
                            <strong style={{ color: sp.color }} className="font-pixel text-base font-bold">
                              {sp.name}
                            </strong>
                          </div>
                          {equipped ? (
                            <span className="border border-[#07050d] bg-[#52e5ff] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#09080f]">
                              ORBITANDO
                            </span>
                          ) : unlocked ? (
                            <span className="border border-[#07050d] bg-[#2a223d] px-1.5 py-0.5 font-pixel text-[9px] text-[#b8afc9]">
                              LIBERADO
                            </span>
                          ) : (
                            <span className="border border-[#07050d] bg-[#362010] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#ffd27d]">
                              {sp.cost}★
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-pixel text-xs font-bold text-[#8effdb]">
                          Coleta: {sp.collectRange}px · Disparo: {sp.shootInterval}s · XP x{sp.xpBonus}
                        </p>
                        <p className="mt-1 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                          {sp.perk}
                        </p>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={equipped ? 'emerald' : unlocked || canAfford ? 'cyan' : 'slate'}
                          disabled={!unlocked && !canAfford}
                          data-testid={`spirit-btn-${sp.id}`}
                          onClick={() => engine.selectSpirit(sp.id as SpiritId)}
                          className="w-full py-1.5 text-xs"
                        >
                          {equipped
                            ? 'Companheiro Ativo'
                            : unlocked
                              ? 'Invocar Espírito'
                              : canAfford
                                ? `Invocar (${sp.cost}★)`
                                : `Precisa ${sp.cost}★`}
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'tag' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <div>
                  <span className="font-pixel font-bold text-[#4df0c0]">
                    TROCA RÁPIDA EM DUPLA [TECLA F] · PARCEIRO: {tagHero.name.toUpperCase()} ({tagEl.label})
                  </span>
                  <p className="font-body-pixel text-[11px] text-[#d7cee8]">
                    Aperte [F] em qualquer fase para alternar com {tagHero.name}, disparar uma onda elemental de entrada, ganhar +1 Dash aéreo e detonar Reações Elementais!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {HEROES.map((hero) => {
                  const isPartner = hero.id === hud.tagHeroId;
                  const isMain = hero.id === hud.heroId;
                  const isUnlocked = (hud.unlockedHeroes ?? []).includes(hero.id);
                  const rMeta = HERO_RARITY_META[hero.rarity];
                  const elMeta = ELEMENT_META[getHeroElement(hero.id)];
                  return (
                    <button
                      key={hero.id}
                      type="button"
                      disabled={!isUnlocked}
                      data-testid={`tag-hero-btn-${hero.id}`}
                      onClick={() => isUnlocked && engine.setTagHero(hero.id, true)}
                      style={{ borderColor: isPartner ? '#4df0c0' : '#261d3d' }}
                      className={`pixel-subpanel flex items-center gap-2 p-2 text-left transition-colors ${
                        !isUnlocked
                          ? 'bg-[#0c0818] opacity-55 cursor-not-allowed'
                          : isPartner
                            ? 'bg-[#132d2b]'
                            : 'bg-[#120d22] hover:bg-[#19132e]'
                      }`}
                    >
                      <HeroPortrait heroId={hero.id} size={46} animate={isPartner} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            style={{ color: hero.accentColor }}
                            className="truncate font-pixel text-xs font-bold"
                          >
                            {hero.name}
                          </span>
                          {!isUnlocked ? (
                            <span className="border border-[#07050d] bg-[#2a1d38] px-1 font-pixel text-[8px] font-bold text-[#ff8899]">
                              BLOQ.
                            </span>
                          ) : isPartner ? (
                            <span className="border border-[#07050d] bg-[#4df0c0] px-1 font-pixel text-[8px] font-bold text-[#09080f]">
                              DUPLA
                            </span>
                          ) : isMain ? (
                            <span className="border border-[#07050d] bg-[#ffd27d] px-1 font-pixel text-[8px] font-bold text-[#09080f]">
                              ATUAL
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1">
                          <span
                            style={{ color: elMeta.color, borderColor: elMeta.color }}
                            className="border px-1 font-pixel text-[8px] font-bold"
                          >
                            {elMeta.label}
                          </span>
                          <span style={{ color: rMeta.color }} className="font-pixel text-[8px]">
                            {hero.rarity}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate font-body-pixel text-[10px] text-[#b8afc9]">
                          [Q] {hero.activeSkillName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'mastery' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel font-bold text-[#ffd27d]">
                  ÁRVORE DE MAESTRIA · XP DISPONÍVEL: {hud.mastery.xp}
                </span>
                <span className="font-body-pixel text-[#d7cee8]">
                  Total Ativo: Vel x{masteryBonuses.speedMult.toFixed(2)} · Recarga x
                  {masteryBonuses.skillCdMult.toFixed(2)} · Vigor x{masteryBonuses.staminaMult.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MASTERY_BRANCHES.map((branch) => {
                  const lv = hud.mastery[branch.key];
                  const cost = getMasteryUpgradeCost(lv);
                  const maxed = lv >= 10;
                  const canUpgrade = !maxed && hud.mastery.xp >= cost;
                  return (
                    <div
                      key={branch.key}
                      style={{ borderColor: branch.color + '88' }}
                      className="pixel-subpanel flex flex-col justify-between bg-[#120d22] p-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <strong style={{ color: branch.color }} className="font-pixel text-sm font-bold">
                            {branch.name}
                          </strong>
                          <span className="font-mono-num text-xs font-bold text-[#ffd27d]">
                            Nível {lv}/10
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-0.5">
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: idx < lv ? branch.color : '#1d1630' }}
                              className="h-2.5 flex-1 border border-[#07050d]"
                            />
                          ))}
                        </div>

                        <p className="mt-2 font-pixel text-xs font-bold text-[#8effdb]">
                          Efeito: {branch.statLabel(lv)}
                        </p>
                        <p className="mt-1 font-body-pixel text-xs text-[#d7cee8]">{branch.desc}</p>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={maxed ? 'emerald' : canUpgrade ? 'gold' : 'slate'}
                          disabled={maxed || !canUpgrade}
                          data-testid={`mastery-upgrade-${branch.key}`}
                          onClick={() => engine.upgradeMasteryBranch(branch.key)}
                          className="w-full py-1.5 text-xs"
                        >
                          {maxed
                            ? 'Maestria Máxima!'
                            : canUpgrade
                              ? `Evoluir (${cost} XP)`
                              : `Precisa ${cost} XP`}
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'achievements' && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ACHIEVEMENTS.map((ach) => {
                const done = hud.unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    style={{ borderColor: done ? ach.color : '#281e42' }}
                    className={`pixel-subpanel p-3 ${done ? 'bg-[#1a1530]' : 'bg-[#0f0b1c] opacity-80'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong
                        style={{ color: done ? ach.color : '#9c92b0' }}
                        className="font-pixel text-sm font-bold"
                      >
                        {ach.name}
                      </strong>
                      <span
                        className={`border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold ${
                          done ? 'bg-[#4df0c0] text-[#09080f]' : 'bg-[#1d1630] text-[#9c92b0]'
                        }`}
                      >
                        {done ? 'CONCLUÍDA' : `+${ach.coinReward}★ / +${ach.xpReward}XP`}
                      </span>
                    </div>
                    <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                      {ach.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'jukebox' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-2 bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel font-bold text-[#38bdf8]">
                  JUKEBOX SINTÉTICO DE AETHELGARD ({JUKEBOX_TRACKS.length} TEMAS)
                </span>
                <span className="font-body-pixel text-[#d7cee8]">
                  Selecione qualquer tema musical chiptune para ouvir sua escala harmônica e ritmo.
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {JUKEBOX_TRACKS.map((track) => {
                  const playing = hud.jukeboxTrackId === track.id;
                  return (
                    <div
                      key={track.id}
                      style={{ borderColor: playing ? track.color : '#281e42' }}
                      className={`pixel-subpanel flex items-center justify-between gap-3 p-3 ${
                        playing ? 'bg-[#1b1938]' : 'bg-[#120d22]'
                      }`}
                    >
                      <div className="min-w-0">
                        <strong style={{ color: track.color }} className="font-pixel text-sm font-bold">
                          {track.name}
                        </strong>
                        <p className="font-body-pixel text-xs text-[#cfc6e0]">{track.subtitle}</p>
                        <span className="font-mono-num text-[10px] text-[#8effdb]">
                          {track.bpm} BPM · {track.scale.length} Notas
                        </span>
                      </div>
                      <PixelButton
                        type="button"
                        variant={playing ? 'emerald' : 'cyan'}
                        data-testid={`jukebox-play-${track.id}`}
                        onClick={() => engine.playJukeboxTrack(track.id)}
                        className="shrink-0 px-3 py-1.5 text-xs"
                      >
                        <PixelIcon name="sound_on" className="h-3.5 w-3.5" />
                        <span>{playing ? 'Tocando' : 'Tocar'}</span>
                      </PixelButton>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'ghost' && (
            <div className="pixel-subpanel flex flex-col gap-3 bg-[#120d22] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-pixel text-base font-bold text-[#a5b4fc]">
                    Fantasma de Replay & Recordes por Etapa
                  </h3>
                  <p className="mt-1 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                    Ao completar qualquer etapa de uma fase, sua melhor corrida fica salva localmente. Com o Fantasma ativado, uma silhueta astral corre ao seu lado mostrando sua rota recorde!
                  </p>
                </div>
                <PixelButton
                  type="button"
                  variant={hud.ghostEnabled ? 'emerald' : 'slate'}
                  data-testid="toggle-ghost-btn"
                  onClick={() => engine.toggleGhost()}
                  className="px-4 py-2 text-xs"
                >
                  <PixelIcon name="play" className="h-3.5 w-3.5" />
                  <span>Fantasma: {hud.ghostEnabled ? 'ATIVADO' : 'DESATIVADO'}</span>
                </PixelButton>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="pixel-subpanel bg-[#18122b] p-3">
                  <div className="font-pixel text-xs text-[#b8afc9]">Etapa Atual</div>
                  <div className="mt-1 font-pixel text-sm font-bold text-[#ffd27d]">
                    {hud.roomName}
                  </div>
                </div>
                <div className="pixel-subpanel bg-[#18122b] p-3">
                  <div className="font-pixel text-xs text-[#b8afc9]">Fantasma Gravado Nesta Etapa</div>
                  <div className="mt-1 font-pixel text-sm font-bold text-[#52e5ff]">
                    {hud.hasGhostRecord ? 'Disponível (Correndo)' : 'Sem recorde ainda — avance até a próxima etapa!'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PixelWindow>
    </div>
  );
};

