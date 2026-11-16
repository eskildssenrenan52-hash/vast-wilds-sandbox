// @ts-nocheck -- imported game code
import React, { useState } from 'react';
import {
  CRAFTING_STATIONS,
  CRAFT_RECIPES,
  CraftingStationId,
  MATERIAL_MAP,
  MATERIALS,
  canCraftRecipe,
} from '../../game/crafting';
import {
  EQUIP_SLOTS,
  EQUIP_SLOT_META,
  EQUIPMENT_SET_BONUS,
  EquipSlot,
  RARITY_COLOR,
  computeHeroEquipmentBonuses,
  computeSingleItemStats,
  getRarityEvolveCost,
  getUpgradeCost,
} from '../../game/equipment';
import { GameEngine } from '../../game/engine';
import { canEvolveHero, EVOLUTION_TIER_NAMES, getHeroEvolutionData } from '../../game/heroEvolution';
import { HEROES, getHeroDef } from '../../game/heroes';
import { HudSnapshot } from '../../game/types';
import { HeroFullSpriteCanvas, HeroPortrait } from './HeroPortrait';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface ForgeEquipmentModalProps {
  engine: GameEngine;
  hud: HudSnapshot;
  initialTab?: 'equipment' | 'crafting' | 'evolution';
  onClose: () => void;
}

export const ForgeEquipmentModal: React.FC<ForgeEquipmentModalProps> = ({
  engine,
  hud,
  initialTab = 'equipment',
  onClose,
}) => {
  const [tab, setTab] = useState<'equipment' | 'crafting' | 'evolution'>(initialTab);
  const [selectedHeroId, setSelectedHeroId] = useState(hud.heroId);
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot | null>(null);
  const [stationFilter, setStationFilter] = useState<CraftingStationId | 'all'>('all');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  const targetHero = getHeroDef(selectedHeroId);
  const targetSkin = engine.heroSkinByHero[selectedHeroId] ?? 'default';
  const targetEvoTier = engine.heroEvolutions[selectedHeroId] ?? 0;
  const targetEvoData = getHeroEvolutionData(selectedHeroId, targetEvoTier);
  const heroSlots = engine.heroEquipment[selectedHeroId] ?? {};
  const eqBonuses = computeHeroEquipmentBonuses(
    selectedHeroId,
    engine.heroEquipment,
    engine.equipmentInventory
  );

  const filteredInventory = engine.equipmentInventory.filter((item) => {
    if (!selectedSlot) return true;
    if (selectedSlot === 'ring1' || selectedSlot === 'ring2') {
      return item.slot === 'ring1' || item.slot === 'ring2';
    }
    return item.slot === selectedSlot;
  });

  const filteredRecipes = CRAFT_RECIPES.filter(
    (r) => stationFilter === 'all' || r.station === stationFilter
  );

  const evoCheck = canEvolveHero(
    targetEvoTier,
    hud.astralCoins,
    hud.craftingMaterials,
    hud.playerLevel
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Forja, Equipamentos 10-Slots e Evolução de Heróis"
      data-testid="forge-equipment-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-3 sm:p-4 pointer-events-auto"
    >
      <PixelWindow
        title="Forja, Arsenal & Evolução 3x"
        subtitle={`Moedas Astrais: ${hud.astralCoins}★ · Inventário: ${engine.equipmentInventory.length} itens · Picareta T${hud.sandboxToolTier}`}
        accentColor="#ff9f43"
        onClose={onClose}
        closeLabel="Fechar Forja e Equipamentos"
        maxWidthClass="max-w-6xl"
      >
        {/* Top Navigation Tabs */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#2a2140] pb-2.5">
          <div className="flex flex-wrap gap-1.5">
            <PixelButton
              type="button"
              variant={tab === 'equipment' ? 'gold' : 'slate'}
              data-testid="forge-tab-equipment"
              onClick={() => {
                setTab('equipment');
                setFeedback(null);
              }}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 text-xs"
            >
              Equipamentos (10 Slots)
            </PixelButton>
            <PixelButton
              type="button"
              variant={tab === 'crafting' ? 'cyan' : 'slate'}
              data-testid="forge-tab-crafting"
              onClick={() => {
                setTab('crafting');
                setFeedback(null);
              }}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 text-xs"
            >
              Forja & Crafting de Biomas
            </PixelButton>
            <PixelButton
              type="button"
              variant={tab === 'evolution' ? 'emerald' : 'slate'}
              data-testid="forge-tab-evolution"
              onClick={() => {
                setTab('evolution');
                setFeedback(null);
              }}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 text-xs"
            >
              Evolução de Heróis (3x)
            </PixelButton>
          </div>

          {feedback && (
            <div
              className={`border-2 border-[#07050d] px-2.5 py-1 font-pixel text-xs font-bold ${
                feedback.ok ? 'bg-[#123d32] text-[#8effdb]' : 'bg-[#4a1220] text-[#ff9bb2]'
              }`}
            >
              {feedback.msg}
            </div>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-1 pixel-scroll">
          {/* TAB 1: 10-SLOT EQUIPMENT PER HERO */}
          {tab === 'equipment' && (
            <div className="space-y-3">
              {/* Hero Picker Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {HEROES.filter((h) => hud.unlockedHeroes.includes(h.id) || h.id === selectedHeroId).map(
                  (h) => {
                    const isSel = h.id === selectedHeroId;
                    const hEvo = engine.heroEvolutions[h.id] ?? 0;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setSelectedHeroId(h.id);
                          setFeedback(null);
                        }}
                        style={{ borderColor: isSel ? h.accentColor : '#2a2140' }}
                        className={`flex shrink-0 items-center gap-2 border-2 px-2 py-1 text-left transition-colors ${
                          isSel ? 'bg-[#1d1433]' : 'bg-[#0e0a19] hover:bg-[#161026]'
                        }`}
                      >
                        <HeroPortrait heroId={h.id} skinId={engine.heroSkinByHero[h.id]} evolutionTier={hEvo} size={28} />
                        <div>
                          <div style={{ color: h.accentColor }} className="font-pixel text-[11px] font-bold">
                            {h.name}
                          </div>
                          <div className="font-mono-num text-[9px] text-[#b8afc9]">
                            {hEvo > 0 ? `Evo ${hEvo}x` : 'Base'}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                {/* Left Column: 10-Slot Paperdoll + Computed Hero Bonuses */}
                <div className="space-y-2.5 lg:col-span-5">
                  <div className="pixel-subpanel p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span style={{ color: targetHero.accentColor }} className="font-pixel text-sm font-bold">
                          {targetHero.name}
                        </span>
                        <span className="ml-2 border border-[#07050d] bg-[#1a132c] px-1.5 py-0.5 font-mono-num text-[10px] text-[#ffe066]">
                          Poder {eqBonuses.powerScore}
                        </span>
                      </div>
                      {selectedSlot && (
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(null)}
                          className="border border-[#3a2f57] bg-[#140e24] px-2 py-0.5 font-pixel text-[10px] text-[#52e5ff]"
                        >
                          Mostrar Todos
                        </button>
                      )}
                    </div>

                    {/* 10 Slots Grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {EQUIP_SLOTS.map((slot) => {
                        const meta = EQUIP_SLOT_META[slot];
                        const uid = heroSlots[slot];
                        const eqItem = uid
                          ? engine.equipmentInventory.find((it) => it.uid === uid)
                          : undefined;
                        const activeFilter = selectedSlot === slot;
                        return (
                          <div
                            key={slot}
                            style={{
                              borderColor: activeFilter
                                ? '#ffe066'
                                : eqItem
                                  ? RARITY_COLOR[eqItem.rarity]
                                  : '#261e3b',
                            }}
                            className={`flex flex-col justify-between border-2 bg-[#0c0816] p-2 ${
                              activeFilter ? 'ring-1 ring-[#ffe066]' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedSlot(activeFilter ? null : slot)}
                                style={{ color: meta.accent }}
                                className="font-pixel text-[10px] font-bold uppercase hover:underline text-left"
                              >
                                {meta.shortLabel}
                              </button>
                              {eqItem && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    engine.unequipItemSlot(selectedHeroId, slot);
                                    setFeedback({ ok: true, msg: `${meta.shortLabel} desequipado.` });
                                    refresh();
                                  }}
                                  aria-label={`Desequipar ${meta.label}`}
                                  className="font-pixel text-[9px] text-[#ff708d] hover:underline"
                                >
                                  Remover
                                </button>
                              )}
                            </div>
                            {eqItem ? (
                              <div className="mt-1">
                                <div
                                  style={{ color: RARITY_COLOR[eqItem.rarity] }}
                                  className="truncate font-pixel text-[11px] font-bold"
                                >
                                  {eqItem.name} {eqItem.upgradeLv > 0 ? `+${eqItem.upgradeLv}` : ''}
                                </div>
                                <div className="font-body-pixel text-[9px] text-[#b8afc9]">
                                  {eqItem.rarity} · {eqItem.prefix}
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className="mt-1 text-left font-body-pixel text-[10px] text-[#6d6485] hover:text-[#a69dc2]"
                              >
                                Vazio (filtrar)
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aggregated Bonuses + Active Set Bonuses */}
                  <div className="pixel-subpanel p-3">
                    <div className="mb-1.5 font-pixel text-[11px] font-bold uppercase text-[#ffd27d]">
                      Atributos Totais do Arsenal
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono-num text-[11px] text-[#e5def2]">
                      <div className="bg-[#0b0814] px-2 py-1">ATQ +{eqBonuses.attackBonus}</div>
                      <div className="bg-[#0b0814] px-2 py-1">DEF +{eqBonuses.defenseBonus}</div>
                      <div className="bg-[#0b0814] px-2 py-1">CRIT {Math.round(eqBonuses.critChance * 100)}%</div>
                      <div className="bg-[#0b0814] px-2 py-1">VEL +{Math.round((eqBonuses.speedMult - 1) * 100)}%</div>
                      <div className="bg-[#0b0814] px-2 py-1">VIG +{Math.round((eqBonuses.staminaMult - 1) * 100)}%</div>
                      <div className="bg-[#0b0814] px-2 py-1">CD -{Math.round((1 - eqBonuses.skillCdMult) * 100)}%</div>
                      <div className="bg-[#0b0814] px-2 py-1">PULO +{eqBonuses.extraAirJump}</div>
                      <div className="bg-[#0b0814] px-2 py-1">DASH +{eqBonuses.extraAirDash}</div>
                      <div className="bg-[#0b0814] px-2 py-1">MINER +{eqBonuses.miningPower}</div>
                    </div>
                    {eqBonuses.activeSets.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-[#261e3b] pt-2">
                        {eqBonuses.activeSets.map((s) => (
                          <div key={s.setId} className="font-body-pixel text-[10px]" style={{ color: s.color }}>
                            <strong>
                              {s.name} ({s.pieces} peças)
                            </strong>
                            {s.tier >= 2 && ` · 2p: ${EQUIPMENT_SET_BONUS[s.setId].bonus2}`}
                            {s.tier === 4 && ` · 4p: ${EQUIPMENT_SET_BONUS[s.setId].bonus4}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Equipment Inventory + Upgrade / Evolve / Reforge */}
                <div className="pixel-subpanel p-3 lg:col-span-7">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-pixel text-xs font-bold uppercase text-[#52e5ff]">
                      Inventário de Equipamentos ({filteredInventory.length})
                      {selectedSlot ? ` · Filtro: ${EQUIP_SLOT_META[selectedSlot].label}` : ''}
                    </span>
                    <span className="font-body-pixel text-[10px] text-[#b8afc9]">
                      Cada herói possui seus próprios 10 slots!
                    </span>
                  </div>

                  {filteredInventory.length === 0 ? (
                    <div className="border border-[#261e3b] bg-[#0b0814] p-6 text-center font-body-pixel text-xs text-[#9e94b8]">
                      Nenhum equipamento para este filtro. Forje novos itens na aba{' '}
                      <strong className="text-[#52e5ff]">Forja & Crafting de Biomas</strong>!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {filteredInventory.map((item) => {
                        const st = computeSingleItemStats(item);
                        const upgCost = getUpgradeCost(item.upgradeLv);
                        const evoCost = getRarityEvolveCost(item.rarity);
                        const equippedSlotForThisHero = Object.entries(heroSlots).find(
                          ([, u]) => u === item.uid
                        )?.[0] as EquipSlot | undefined;
                        const targetEquipSlot: EquipSlot =
                          selectedSlot === 'ring2' && (item.slot === 'ring1' || item.slot === 'ring2')
                            ? 'ring2'
                            : item.slot;
                        return (
                          <div
                            key={item.uid}
                            style={{ borderColor: RARITY_COLOR[item.rarity] }}
                            className="flex flex-col justify-between border-2 bg-[#0c0817] p-2.5"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div
                                    style={{ color: RARITY_COLOR[item.rarity] }}
                                    className="font-pixel text-xs font-bold"
                                  >
                                    {item.name} {item.upgradeLv > 0 ? `+${item.upgradeLv}` : ''}
                                  </div>
                                  <div className="font-body-pixel text-[10px] text-[#b8afc9]">
                                    {EQUIP_SLOT_META[item.slot].shortLabel} · {item.rarity} · Prefixo{' '}
                                    <span className="text-[#ffd27d]">{item.prefix}</span>
                                  </div>
                                </div>
                                {equippedSlotForThisHero && (
                                  <span className="border border-[#07050d] bg-[#1a5c49] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#8effdb]">
                                    EQUIPADO
                                  </span>
                                )}
                              </div>

                              <div className="mt-1.5 flex flex-wrap gap-1 font-mono-num text-[10px] text-[#dcd3eb]">
                                {st.attack > 0 && <span className="bg-[#18112b] px-1.5">ATQ +{st.attack}</span>}
                                {st.defense > 0 && <span className="bg-[#18112b] px-1.5">DEF +{st.defense}</span>}
                                {st.critChance > 0 && (
                                  <span className="bg-[#18112b] px-1.5">CRIT +{Math.round(st.critChance * 100)}%</span>
                                )}
                                {st.speedBonus > 0 && (
                                  <span className="bg-[#18112b] px-1.5">VEL +{Math.round(st.speedBonus * 100)}%</span>
                                )}
                                {st.staminaBonus > 0 && (
                                  <span className="bg-[#18112b] px-1.5">VIG +{Math.round(st.staminaBonus * 100)}%</span>
                                )}
                                {st.skillCdReduction > 0 && (
                                  <span className="bg-[#18112b] px-1.5">CD -{Math.round(st.skillCdReduction * 100)}%</span>
                                )}
                                {st.extraAirJump > 0 && <span className="bg-[#18112b] px-1.5">+Pulo</span>}
                                {st.extraAirDash > 0 && <span className="bg-[#18112b] px-1.5">+Dash</span>}
                              </div>
                            </div>

                            <div className="mt-2.5 flex flex-wrap gap-1 border-t border-[#221a36] pt-2">
                              <PixelButton
                                type="button"
                                variant={equippedSlotForThisHero ? 'slate' : 'emerald'}
                                onClick={() => {
                                  if (equippedSlotForThisHero) {
                                    engine.unequipItemSlot(selectedHeroId, equippedSlotForThisHero);
                                    setFeedback({ ok: true, msg: `${item.name} desequipado.` });
                                  } else {
                                    engine.equipItemForHero(selectedHeroId, item.uid, targetEquipSlot);
                                    setFeedback({
                                      ok: true,
                                      msg: `${item.name} equipado em ${targetHero.name}!`,
                                    });
                                  }
                                  refresh();
                                }}
                                className="!px-2 !py-1 text-[10px]"
                              >
                                {equippedSlotForThisHero ? 'Desequipar' : 'Equipar'}
                              </PixelButton>

                              {item.upgradeLv < 15 && (
                                <PixelButton
                                  type="button"
                                  variant="gold"
                                  onClick={() => {
                                    const res = engine.upgradeEquipmentItem(item.uid);
                                    setFeedback(res);
                                    refresh();
                                  }}
                                  title={`Custo: ${upgCost.coins}★ + ${upgCost.qty}x ${MATERIAL_MAP[upgCost.materialId]?.name}`}
                                  className="!px-2 !py-1 text-[10px]"
                                >
                                  +1 ({upgCost.coins}★)
                                </PixelButton>
                              )}

                              {evoCost.nextRarity && (
                                <PixelButton
                                  type="button"
                                  variant="cyan"
                                  onClick={() => {
                                    const res = engine.evolveEquipmentItem(item.uid);
                                    setFeedback(res);
                                    refresh();
                                  }}
                                  title={`Evoluir para ${evoCost.nextRarity}: ${evoCost.coins}★ + ${evoCost.qty}x ${MATERIAL_MAP[evoCost.materialId]?.name}`}
                                  className="!px-2 !py-1 text-[10px]"
                                >
                                  Evoluir ({evoCost.nextRarity})
                                </PixelButton>
                              )}

                              <PixelButton
                                type="button"
                                variant="slate"
                                onClick={() => {
                                  const res = engine.reforgeEquipmentItem(item.uid);
                                  setFeedback(res);
                                  refresh();
                                }}
                                title="Altera o prefixo para Veloz/Bruto/Arcano/Vampírico/Celestial (6★)"
                                className="!px-2 !py-1 text-[10px]"
                              >
                                Reforjar 6★
                              </PixelButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADVANCED BIOME CRAFTING */}
          {tab === 'crafting' && (
            <div className="space-y-3">
              {/* Biome Resource Pouch */}
              <div className="pixel-subpanel p-3">
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-pixel text-xs font-bold uppercase text-[#4df0c0]">
                    Bolsa de Materiais dos Biomas (28 Recursos)
                  </span>
                  <span className="font-body-pixel text-[10px] text-[#b8afc9]">
                    Coletados ao derrotar inimigos, abrir baús e minerar no Mundo Sandbox
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-7">
                  {MATERIALS.map((mat) => {
                    const qty = hud.craftingMaterials[mat.id] ?? 0;
                    return (
                      <div
                        key={mat.id}
                        title={`${mat.name} (${mat.rarity}): ${mat.desc}`}
                        className={`flex items-center justify-between border px-1.5 py-1 ${
                          qty > 0 ? 'border-[#33294d] bg-[#110d20]' : 'border-[#1a1428] bg-[#090710] opacity-60'
                        }`}
                      >
                        <span style={{ color: mat.color }} className="truncate font-body-pixel text-[10px]">
                          {mat.name}
                        </span>
                        <span className="ml-1 font-mono-num text-[10px] font-bold text-[#ffe066]">
                          {qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Crafting Stations Tabs */}
              <div className="flex flex-wrap gap-1.5">
                <PixelButton
                  type="button"
                  variant={stationFilter === 'all' ? 'gold' : 'slate'}
                  onClick={() => setStationFilter('all')}
                  className="whitespace-nowrap shrink-0 !px-2.5 !py-1 text-[11px]"
                >
                  Todas Estações ({CRAFT_RECIPES.length})
                </PixelButton>
                {CRAFTING_STATIONS.map((st) => (
                  <PixelButton
                    key={st.id}
                    type="button"
                    variant={stationFilter === st.id ? 'cyan' : 'slate'}
                    onClick={() => setStationFilter(st.id)}
                    className="whitespace-nowrap shrink-0 !px-2.5 !py-1 text-[11px]"
                  >
                    <span style={{ color: st.color }}>●</span>
                    <span>{st.name}</span>
                  </PixelButton>
                ))}
              </div>

              {/* Recipe Cards */}
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map((rec) => {
                  const craftable = canCraftRecipe(rec, hud.craftingMaterials, hud.astralCoins);
                  return (
                    <div
                      key={rec.id}
                      style={{ borderColor: craftable ? rec.color : '#261e3b' }}
                      className="pixel-subpanel flex flex-col justify-between p-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 style={{ color: rec.color }} className="font-pixel text-sm font-bold">
                            {rec.name}
                          </h4>
                          <span className="border border-[#07050d] bg-[#140e24] px-1.5 py-0.5 font-pixel text-[9px] uppercase text-[#b8afc9]">
                            {rec.category}
                          </span>
                        </div>
                        <p className="mt-1 font-body-pixel text-[11px] text-[#d5cce6]">{rec.desc}</p>

                        <div className="mt-2 space-y-1 border-t border-[#241b38] pt-2">
                          {rec.ingredients.map((ing) => {
                            const have = hud.craftingMaterials[ing.id] ?? 0;
                            const ok = have >= ing.qty;
                            const mDef = MATERIAL_MAP[ing.id];
                            return (
                              <div key={ing.id} className="flex items-center justify-between font-body-pixel text-[10px]">
                                <span style={{ color: mDef?.color ?? '#cbd5e1' }}>
                                  {mDef?.name ?? ing.id}
                                </span>
                                <span className={`font-mono-num font-bold ${ok ? 'text-[#4df0c0]' : 'text-[#ff708d]'}`}>
                                  {have}/{ing.qty}
                                </span>
                              </div>
                            );
                          })}
                          {rec.coinCost && (
                            <div className="flex items-center justify-between font-body-pixel text-[10px]">
                              <span className="text-[#ffe47a]">Moedas Astrais</span>
                              <span
                                className={`font-mono-num font-bold ${
                                  hud.astralCoins >= rec.coinCost ? 'text-[#ffe47a]' : 'text-[#ff708d]'
                                }`}
                              >
                                {hud.astralCoins}/{rec.coinCost}★
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={craftable ? 'emerald' : 'slate'}
                          disabled={!craftable}
                          data-testid={`craft-recipe-${rec.id}`}
                          onClick={() => {
                            const res = engine.craftRecipe(rec.id);
                            setFeedback(res);
                            refresh();
                          }}
                          className="w-full py-1.5 text-xs"
                        >
                          <PixelIcon name="bolt" className="h-3.5 w-3.5" />
                          <span>{craftable ? 'Forjar / Criar' : 'Recursos Insuficientes'}</span>
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 3X HERO EVOLUTION SYSTEM */}
          {tab === 'evolution' && (
            <div className="space-y-3">
              {/* Hero Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {HEROES.filter((h) => hud.unlockedHeroes.includes(h.id) || h.id === selectedHeroId).map(
                  (h) => {
                    const isSel = h.id === selectedHeroId;
                    const hEvo = engine.heroEvolutions[h.id] ?? 0;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setSelectedHeroId(h.id);
                          setFeedback(null);
                        }}
                        style={{ borderColor: isSel ? h.accentColor : '#2a2140' }}
                        className={`flex shrink-0 items-center gap-2 border-2 px-2 py-1 text-left ${
                          isSel ? 'bg-[#1d1433]' : 'bg-[#0e0a19] hover:bg-[#161026]'
                        }`}
                      >
                        <HeroPortrait heroId={h.id} skinId={engine.heroSkinByHero[h.id]} evolutionTier={hEvo} size={28} />
                        <div>
                          <div style={{ color: h.accentColor }} className="font-pixel text-[11px] font-bold">
                            {h.name}
                          </div>
                          <div className="font-mono-num text-[9px] text-[#ffe066]">
                            Estágio {hEvo}/3
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                {/* Visual Evolution Preview Showcase */}
                <div
                  style={{ borderColor: targetEvoData.crownColor }}
                  className="pixel-subpanel flex flex-col items-center justify-between p-4 text-center lg:col-span-5"
                >
                  <div>
                    <div
                      style={{ color: targetEvoData.crownColor }}
                      className="font-pixel text-base font-bold text-stroke-dark"
                    >
                      {targetHero.name} · {EVOLUTION_TIER_NAMES[targetEvoData.tier]}
                    </div>
                    <p className="mt-0.5 font-body-pixel text-[11px] text-[#b8afc9]">
                      Visual Muta: Brasão (1x) → Asas Elementais (2x) → Halo Seráfico (3x)
                    </p>
                  </div>

                  <div className="my-3 flex items-center justify-center">
                    <HeroFullSpriteCanvas
                      heroId={selectedHeroId}
                      skinId={targetSkin}
                      evolutionTier={targetEvoTier}
                      size={140}
                    />
                  </div>

                  <div className="grid w-full grid-cols-2 gap-1.5 font-mono-num text-[11px]">
                    <div className="border border-[#281e42] bg-[#0b0814] p-1.5 text-[#ff8aa8]">
                      Ataque +{targetEvoData.attackBonus}
                    </div>
                    <div className="border border-[#281e42] bg-[#0b0814] p-1.5 text-[#52e5ff]">
                      Vel. {Math.round(targetEvoData.speedMult * 100)}%
                    </div>
                    <div className="border border-[#281e42] bg-[#0b0814] p-1.5 text-[#4df0c0]">
                      Vigor {Math.round(targetEvoData.staminaMult * 100)}%
                    </div>
                    <div className="border border-[#281e42] bg-[#0b0814] p-1.5 text-[#ffd27d]">
                      Recarga [Q] {Math.round(targetEvoData.skillCdMult * 100)}%
                    </div>
                  </div>
                </div>

                {/* 3 Evolution Tiers & Upgrade CTA */}
                <div className="flex flex-col justify-between gap-3 lg:col-span-7">
                  <div className="space-y-2">
                    {([1, 2, 3] as const).map((tierNum) => {
                      const unlocked = targetEvoTier >= tierNum;
                      const preview = getHeroEvolutionData(selectedHeroId, tierNum);
                      const skill = preview.skills.find((s) => s.tier === tierNum);
                      return (
                        <div
                          key={tierNum}
                          style={{ borderColor: unlocked ? preview.crownColor : '#28203d' }}
                          className={`pixel-subpanel p-3 ${unlocked ? 'bg-[#171129]' : 'opacity-80'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  backgroundColor: unlocked ? preview.crownColor : '#1c152e',
                                  color: unlocked ? '#09080f' : '#b8afc9',
                                }}
                                className="border border-[#07050d] px-2 py-0.5 font-pixel text-[10px] font-bold"
                              >
                                {tierNum}ª EVOLUÇÃO
                              </span>
                              <strong className="font-pixel text-sm text-[#f5efe6]">
                                {skill?.name}
                              </strong>
                            </div>
                            <span
                              className={`font-pixel text-[10px] font-bold ${
                                unlocked ? 'text-[#4df0c0]' : 'text-[#9e94b8]'
                              }`}
                            >
                              {unlocked ? 'DESPERTADO' : skill?.trigger}
                            </span>
                          </div>
                          <p className="mt-1 font-body-pixel text-[11px] text-[#d5cce6]">
                            {skill?.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Evolution Cost + Evolve CTA */}
                  <div className="pixel-subpanel p-3">
                    {evoCheck.req ? (
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-pixel text-xs font-bold text-[#ffe066]">
                            Próxima Evolução ({evoCheck.req.targetTier}x) · Requer Nv.{evoCheck.req.minPlayerLevel}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 font-body-pixel text-[11px]">
                            <span
                              className={
                                hud.astralCoins >= evoCheck.req.coins ? 'text-[#ffe47a]' : 'text-[#ff708d]'
                              }
                            >
                              {hud.astralCoins}/{evoCheck.req.coins}★
                            </span>
                            {evoCheck.req.materials.map((m) => {
                              const have = hud.craftingMaterials[m.id] ?? 0;
                              return (
                                <span
                                  key={m.id}
                                  className={have >= m.qty ? 'text-[#4df0c0]' : 'text-[#ff708d]'}
                                >
                                  {MATERIAL_MAP[m.id]?.name}: {have}/{m.qty}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <PixelButton
                          type="button"
                          variant={evoCheck.canEvolve ? 'gold' : 'slate'}
                          disabled={!evoCheck.canEvolve}
                          data-testid="evolve-hero-btn"
                          onClick={() => {
                            const res = engine.evolveHero(selectedHeroId);
                            setFeedback(res);
                            refresh();
                          }}
                          className="whitespace-nowrap shrink-0 px-4 py-2 text-xs"
                        >
                          <PixelIcon name="crown" className="h-4 w-4" />
                          <span>
                            {evoCheck.canEvolve
                              ? `Evoluir ${targetHero.name} (${evoCheck.req.targetTier}x)`
                              : evoCheck.reason ?? 'Bloqueado'}
                          </span>
                        </PixelButton>
                      </div>
                    ) : (
                      <div className="text-center font-pixel text-xs font-bold text-[#ffe066]">
                        ★ {targetHero.name} alcançou a Apoteose Máxima (3/3 Evoluções)! ★
                      </div>
                    )}
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
