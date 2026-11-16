// @ts-nocheck -- imported game code
import { MaterialId } from './crafting';
import { HeroId } from './heroes';

export const EQUIP_SLOTS = [
  'weapon',
  'offhand',
  'helmet',
  'armor',
  'gloves',
  'boots',
  'cape',
  'ring1',
  'ring2',
  'amulet',
] as const;

export type EquipSlot = (typeof EQUIP_SLOTS)[number];

export interface EquipSlotMeta {
  slot: EquipSlot;
  label: string;
  shortLabel: string;
  accent: string;
}

export const EQUIP_SLOT_META: Record<EquipSlot, EquipSlotMeta> = {
  weapon: { slot: 'weapon', label: 'Arma Principal', shortLabel: 'ARMA', accent: '#ff5c8a' },
  offhand: { slot: 'offhand', label: 'Mão Secundária / Escudo', shortLabel: 'SEC.', accent: '#60a5fa' },
  helmet: { slot: 'helmet', label: 'Elmo / Coroa', shortLabel: 'ELMO', accent: '#ffd27d' },
  armor: { slot: 'armor', label: 'Armadura / Túnica', shortLabel: 'PEITO', accent: '#94a3b8' },
  gloves: { slot: 'gloves', label: 'Manoplas / Luvas', shortLabel: 'LUVAS', accent: '#4df0c0' },
  boots: { slot: 'boots', label: 'Botas / Grevas', shortLabel: 'BOTAS', accent: '#52e5ff' },
  cape: { slot: 'cape', label: 'Capa / Manto', shortLabel: 'CAPA', accent: '#d580ff' },
  ring1: { slot: 'ring1', label: 'Anel Esquerdo', shortLabel: 'ANEL 1', accent: '#fbbf24' },
  ring2: { slot: 'ring2', label: 'Anel Direito', shortLabel: 'ANEL 2', accent: '#c084fc' },
  amulet: { slot: 'amulet', label: 'Amuleto / Relíquia', shortLabel: 'AMUL.', accent: '#ffe066' },
};

export type EquipmentRarity = 'Comum' | 'Raro' | 'Épico' | 'Lendário' | 'Mítico';
export type EquipmentPrefix = 'Padrão' | 'Veloz' | 'Bruto' | 'Arcano' | 'Vampírico' | 'Celestial';
export type EquipmentSetId = 'cinzas' | 'micelio' | 'aurora' | 'draconico' | 'eter';

export interface EquipmentStats {
  attack: number;
  defense: number;
  critChance: number; // 0..1
  speedBonus: number; // fractional e.g. 0.08 = +8%
  jumpBonus: number;
  staminaBonus: number;
  skillCdReduction: number; // 0..0.4
  extraAirJump: number;
  extraAirDash: number;
  lifestealPct: number;
  dropLuckPct: number;
  miningPower: number;
}

export interface EquipmentTemplateDef {
  id: string;
  name: string;
  slot: EquipSlot;
  setId: EquipmentSetId;
  baseRarity: EquipmentRarity;
  color: string;
  desc: string;
  baseStats: Partial<EquipmentStats>;
}

export interface EquipmentItem {
  uid: string;
  templateId: string;
  name: string;
  slot: EquipSlot;
  setId: EquipmentSetId;
  rarity: EquipmentRarity;
  prefix: EquipmentPrefix;
  upgradeLv: number; // 0..15
  color: string;
}

export const RARITY_ORDER: EquipmentRarity[] = ['Comum', 'Raro', 'Épico', 'Lendário', 'Mítico'];

export const RARITY_COLOR: Record<EquipmentRarity, string> = {
  Comum: '#cbd5e1',
  Raro: '#52e5ff',
  Épico: '#c084fc',
  Lendário: '#ffd27d',
  Mítico: '#ff4d7d',
};

export const RARITY_MULT: Record<EquipmentRarity, number> = {
  Comum: 1.0,
  Raro: 1.25,
  Épico: 1.55,
  Lendário: 1.9,
  Mítico: 2.35,
};

export const PREFIX_BONUSES: Record<EquipmentPrefix, Partial<EquipmentStats>> = {
  Padrão: {},
  Veloz: { speedBonus: 0.05, jumpBonus: 0.03 },
  Bruto: { attack: 1, critChance: 0.04 },
  Arcano: { skillCdReduction: 0.04, staminaBonus: 0.08 },
  Vampírico: { lifestealPct: 0.04, attack: 1 },
  Celestial: { attack: 1, defense: 1, speedBonus: 0.04, critChance: 0.05 },
};

export const EQUIPMENT_SET_BONUS: Record<
  EquipmentSetId,
  { name: string; color: string; bonus2: string; bonus4: string }
> = {
  cinzas: {
    name: 'Conjunto das Cinzas',
    color: '#e8a87c',
    bonus2: '+1 Ataque & +10% Vigor',
    bonus4: '+10% Velocidade & +12% Crítico',
  },
  micelio: {
    name: 'Conjunto Biolum',
    color: '#4df0c0',
    bonus2: '+1 Defesa & +15% Sorte de Drop',
    bonus4: '+1 Pulo Aéreo Extra & -10% Recarga [Q]',
  },
  aurora: {
    name: 'Conjunto da Aurora',
    color: '#7ce8ff',
    bonus2: '+12% Velocidade & +8% Salto',
    bonus4: '+1 Dash Aéreo Extra & +2 Ataque',
  },
  draconico: {
    name: 'Conjunto Dracônico',
    color: '#ff3864',
    bonus2: '+2 Ataque & +10% Crítico',
    bonus4: '+3 Ataque & +8% Roubo de Alma',
  },
  eter: {
    name: 'Conjunto do Éter Supremo',
    color: '#ffd27d',
    bonus2: '+2 Defesa & -12% Recarga [Q]',
    bonus4: '+4 Ataque, +1 Dash Extra & +15% Velocidade',
  },
};

export const EQUIPMENT_TEMPLATES: EquipmentTemplateDef[] = [
  {
    id: 'eq_espada_cinzas',
    name: 'Lâmina das Cinzas',
    slot: 'weapon',
    setId: 'cinzas',
    baseRarity: 'Comum',
    color: '#e8a87c',
    desc: 'Espada temperada nas ruínas da Primeira Vigília.',
    baseStats: { attack: 2, critChance: 0.06, miningPower: 1 },
  },
  {
    id: 'eq_escudo_basalto',
    name: 'Égide de Basalto',
    slot: 'offhand',
    setId: 'cinzas',
    baseRarity: 'Comum',
    color: '#94a3b8',
    desc: 'Broquel sólido que amortece golpes abissais.',
    baseStats: { defense: 1, staminaBonus: 0.1 },
  },
  {
    id: 'eq_elmo_ferro',
    name: 'Elmo do Explorador',
    slot: 'helmet',
    setId: 'cinzas',
    baseRarity: 'Comum',
    color: '#cbd5e1',
    desc: 'Viseira com lanterna rúnica para cavernas profundas.',
    baseStats: { staminaBonus: 0.1, miningPower: 1 },
  },
  {
    id: 'eq_peitoral_ferro',
    name: 'Cota de Forja',
    slot: 'armor',
    setId: 'cinzas',
    baseRarity: 'Incomum' as EquipmentRarity,
    color: '#cbd5e1',
    desc: 'Armadura forjada com brasa viva e ferro.',
    baseStats: { defense: 2, staminaBonus: 0.12 },
  },
  {
    id: 'eq_luvas_micelio',
    name: 'Manoplas Biolum',
    slot: 'gloves',
    setId: 'micelio',
    baseRarity: 'Raro',
    color: '#4df0c0',
    desc: 'Concede aderência extrema e golpes velozes.',
    baseStats: { attack: 1, critChance: 0.08, skillCdReduction: 0.05 },
  },
  {
    id: 'eq_botas_vendaval',
    name: 'Botas do Vendaval',
    slot: 'boots',
    setId: 'aurora',
    baseRarity: 'Raro',
    color: '#52e5ff',
    desc: 'Passos leves como vento nas encostas.',
    baseStats: { speedBonus: 0.14, jumpBonus: 0.08 },
  },
  {
    id: 'eq_capa_aurora',
    name: 'Manto da Aurora',
    slot: 'cape',
    setId: 'aurora',
    baseRarity: 'Épico',
    color: '#a5b4fc',
    desc: 'Tecida com luz boreal, sustenta o herói no ar.',
    baseStats: { extraAirJump: 1, skillCdReduction: 0.08, speedBonus: 0.05 },
  },
  {
    id: 'eq_anel_solar',
    name: 'Anel do Sol Dourado',
    slot: 'ring1',
    setId: 'cinzas',
    baseRarity: 'Raro',
    color: '#fbbf24',
    desc: 'Atrai tesouros, minérios e amplia golpes críticos.',
    baseStats: { attack: 1, dropLuckPct: 0.15, critChance: 0.05 },
  },
  {
    id: 'eq_anel_sombrio',
    name: 'Anel do Eclipse',
    slot: 'ring2',
    setId: 'draconico',
    baseRarity: 'Épico',
    color: '#c084fc',
    desc: 'Drena energia sombria a cada abate.',
    baseStats: { critChance: 0.1, lifestealPct: 0.04, attack: 1 },
  },
  {
    id: 'eq_amuleto_eter',
    name: 'Amuleto Coração de Éter',
    slot: 'amulet',
    setId: 'eter',
    baseRarity: 'Lendário',
    color: '#52e5ff',
    desc: 'Relíquia astral que concede um Dash Aéreo adicional.',
    baseStats: { attack: 2, skillCdReduction: 0.12, extraAirDash: 1 },
  },
  {
    id: 'eq_lamina_draconica',
    name: 'Espada Dracônica',
    slot: 'weapon',
    setId: 'draconico',
    baseRarity: 'Épico',
    color: '#ff3864',
    desc: 'Lâmina carmesim forjada com escamas e adamantita.',
    baseStats: { attack: 4, critChance: 0.15, miningPower: 2 },
  },
  {
    id: 'eq_armadura_eter',
    name: 'Armadura Soberana do Éter',
    slot: 'armor',
    setId: 'eter',
    baseRarity: 'Mítico',
    color: '#ffd27d',
    desc: 'Couraça suprema dos guardiões celestes.',
    baseStats: { defense: 4, staminaBonus: 0.3, speedBonus: 0.15 },
  },
  {
    id: 'eq_elmo_aurora',
    name: 'Diadema da Aurora',
    slot: 'helmet',
    setId: 'aurora',
    baseRarity: 'Épico',
    color: '#7ce8ff',
    desc: 'Coroa boreal que acelera recarga de habilidades.',
    baseStats: { defense: 2, skillCdReduction: 0.1, staminaBonus: 0.15 },
  },
  {
    id: 'eq_escudo_eter',
    name: 'Orbe Guardião do Éter',
    slot: 'offhand',
    setId: 'eter',
    baseRarity: 'Lendário',
    color: '#ffd27d',
    desc: 'Escudo astral flutuante que reduz recarga e protege.',
    baseStats: { defense: 3, attack: 1, skillCdReduction: 0.08 },
  },
  {
    id: 'eq_luvas_draconicas',
    name: 'Garras Dracônicas',
    slot: 'gloves',
    setId: 'draconico',
    baseRarity: 'Lendário',
    color: '#ff3864',
    desc: 'Aumenta impacto corpo-a-corpo e chance crítica.',
    baseStats: { attack: 2, critChance: 0.12, miningPower: 2 },
  },
  {
    id: 'eq_botas_eter',
    name: 'Grevas Celestiais',
    slot: 'boots',
    setId: 'eter',
    baseRarity: 'Lendário',
    color: '#52e5ff',
    desc: 'Permite avanços velozes e saltos monumentais.',
    baseStats: { speedBonus: 0.2, jumpBonus: 0.12 },
  },
];

export const EQUIPMENT_TEMPLATE_MAP: Record<string, EquipmentTemplateDef> = Object.fromEntries(
  EQUIPMENT_TEMPLATES.map((t) => [t.id, t])
);

let nextItemSeq = 1;

export function createEquipmentItem(
  templateId: string,
  prefix: EquipmentPrefix = 'Padrão',
  upgradeLv = 0,
  rarityOverride?: EquipmentRarity,
  uidOverride?: string
): EquipmentItem {
  const tpl = EQUIPMENT_TEMPLATE_MAP[templateId] ?? EQUIPMENT_TEMPLATES[0];
  const validRarity: EquipmentRarity = RARITY_ORDER.includes(tpl.baseRarity) ? tpl.baseRarity : 'Comum';
  const rarity = rarityOverride ?? validRarity;
  return {
    uid: uidOverride ?? `eq_${tpl.id}_${Date.now().toString(36)}_${nextItemSeq++}`,
    templateId: tpl.id,
    name: tpl.name,
    slot: tpl.slot,
    setId: tpl.setId,
    rarity,
    prefix,
    upgradeLv: Math.max(0, Math.min(15, upgradeLv)),
    color: RARITY_COLOR[rarity] ?? tpl.color,
  };
}

export function createStarterEquipmentInventory(): {
  inventory: EquipmentItem[];
  heroEquipment: Record<string, Partial<Record<EquipSlot, string>>>;
} {
  const starterSword = createEquipmentItem('eq_espada_cinzas', 'Bruto', 1, 'Raro', 'starter_sword_lyra');
  const starterBoots = createEquipmentItem('eq_botas_vendaval', 'Veloz', 0, 'Comum', 'starter_boots_lyra');
  const starterRing = createEquipmentItem('eq_anel_solar', 'Padrão', 0, 'Comum', 'starter_ring_lyra');
  return {
    inventory: [starterSword, starterBoots, starterRing],
    heroEquipment: {
      lyra: {
        weapon: starterSword.uid,
        boots: starterBoots.uid,
        ring1: starterRing.uid,
      },
    },
  };
}

export function computeSingleItemStats(item: EquipmentItem): EquipmentStats {
  const tpl = EQUIPMENT_TEMPLATE_MAP[item.templateId];
  const base = tpl?.baseStats ?? {};
  const rMult = RARITY_MULT[item.rarity] ?? 1;
  const upgMult = 1 + item.upgradeLv * 0.1;
  const scale = rMult * upgMult;
  const pref = PREFIX_BONUSES[item.prefix] ?? {};

  return {
    attack: Math.round((base.attack ?? 0) * scale) + (pref.attack ?? 0) + Math.floor(item.upgradeLv / 4),
    defense: Math.round((base.defense ?? 0) * scale) + (pref.defense ?? 0) + Math.floor(item.upgradeLv / 5),
    critChance: Number(((base.critChance ?? 0) * rMult + (pref.critChance ?? 0) + item.upgradeLv * 0.005).toFixed(3)),
    speedBonus: Number(((base.speedBonus ?? 0) * (1 + item.upgradeLv * 0.04) + (pref.speedBonus ?? 0)).toFixed(3)),
    jumpBonus: Number(((base.jumpBonus ?? 0) * (1 + item.upgradeLv * 0.03) + (pref.jumpBonus ?? 0)).toFixed(3)),
    staminaBonus: Number(((base.staminaBonus ?? 0) * rMult + (pref.staminaBonus ?? 0)).toFixed(3)),
    skillCdReduction: Number(
      Math.min(0.25, (base.skillCdReduction ?? 0) * (1 + item.upgradeLv * 0.03) + (pref.skillCdReduction ?? 0)).toFixed(3)
    ),
    extraAirJump: base.extraAirJump ?? 0,
    extraAirDash: base.extraAirDash ?? 0,
    lifestealPct: Number(((base.lifestealPct ?? 0) + (pref.lifestealPct ?? 0)).toFixed(3)),
    dropLuckPct: Number(((base.dropLuckPct ?? 0) * rMult + item.upgradeLv * 0.01).toFixed(3)),
    miningPower: (base.miningPower ?? 0) + Math.floor(item.upgradeLv / 3),
  };
}

export interface AggregatedEquipmentBonuses {
  attackBonus: number;
  defenseBonus: number;
  critChance: number;
  speedMult: number;
  jumpMult: number;
  staminaMult: number;
  skillCdMult: number;
  extraAirJump: number;
  extraAirDash: number;
  lifestealPct: number;
  dropLuckPct: number;
  miningPower: number;
  powerScore: number;
  activeSets: { setId: EquipmentSetId; name: string; pieces: number; tier: 0 | 2 | 4; color: string }[];
}

export function computeHeroEquipmentBonuses(
  heroId: HeroId | string,
  heroEquipment: Record<string, Partial<Record<EquipSlot, string>>>,
  inventory: EquipmentItem[]
): AggregatedEquipmentBonuses {
  const slotsMap = heroEquipment[heroId] ?? {};
  const itemByUid = new Map(inventory.map((i) => [i.uid, i]));

  let attack = 0;
  let defense = 0;
  let critChance = 0;
  let speedBonus = 0;
  let jumpBonus = 0;
  let staminaBonus = 0;
  let skillCdReduction = 0;
  let extraAirJump = 0;
  let extraAirDash = 0;
  let lifestealPct = 0;
  let dropLuckPct = 0;
  let miningPower = 0;

  const setCounts: Partial<Record<EquipmentSetId, number>> = {};

  for (const slot of EQUIP_SLOTS) {
    const uid = slotsMap[slot];
    if (!uid) continue;
    const item = itemByUid.get(uid);
    if (!item) continue;
    const st = computeSingleItemStats(item);
    attack += st.attack;
    defense += st.defense;
    critChance += st.critChance;
    speedBonus += st.speedBonus;
    jumpBonus += st.jumpBonus;
    staminaBonus += st.staminaBonus;
    skillCdReduction += st.skillCdReduction;
    extraAirJump += st.extraAirJump;
    extraAirDash += st.extraAirDash;
    lifestealPct += st.lifestealPct;
    dropLuckPct += st.dropLuckPct;
    miningPower += st.miningPower;
    setCounts[item.setId] = (setCounts[item.setId] ?? 0) + 1;
  }

  const activeSets: AggregatedEquipmentBonuses['activeSets'] = [];
  for (const [setId, pieces] of Object.entries(setCounts) as [EquipmentSetId, number][]) {
    const meta = EQUIPMENT_SET_BONUS[setId];
    if (!meta || pieces <= 0) continue;
    const tier: 0 | 2 | 4 = pieces >= 4 ? 4 : pieces >= 2 ? 2 : 0;
    if (tier >= 2) {
      if (setId === 'cinzas') {
        attack += 1;
        staminaBonus += 0.1;
      } else if (setId === 'micelio') {
        defense += 1;
        dropLuckPct += 0.15;
      } else if (setId === 'aurora') {
        speedBonus += 0.12;
        jumpBonus += 0.08;
      } else if (setId === 'draconico') {
        attack += 2;
        critChance += 0.1;
      } else if (setId === 'eter') {
        defense += 2;
        skillCdReduction += 0.12;
      }
    }
    if (tier === 4) {
      if (setId === 'cinzas') {
        speedBonus += 0.1;
        critChance += 0.12;
      } else if (setId === 'micelio') {
        extraAirJump += 1;
        skillCdReduction += 0.1;
      } else if (setId === 'aurora') {
        extraAirDash += 1;
        attack += 2;
      } else if (setId === 'draconico') {
        attack += 3;
        lifestealPct += 0.08;
      } else if (setId === 'eter') {
        attack += 4;
        extraAirDash += 1;
        speedBonus += 0.15;
      }
    }
    activeSets.push({ setId, name: meta.name, pieces, tier, color: meta.color });
  }

  const clampedCdRed = Math.min(0.42, skillCdReduction);
  const powerScore = Math.round(
    attack * 18 +
      defense * 14 +
      critChance * 120 +
      speedBonus * 140 +
      staminaBonus * 90 +
      extraAirJump * 35 +
      extraAirDash * 45 +
      miningPower * 10
  );

  return {
    attackBonus: attack,
    defenseBonus: defense,
    critChance: Math.min(0.65, critChance),
    speedMult: 1 + speedBonus,
    jumpMult: 1 + jumpBonus,
    staminaMult: 1 + staminaBonus,
    skillCdMult: Math.max(0.58, 1 - clampedCdRed),
    extraAirJump,
    extraAirDash,
    lifestealPct: Math.min(0.25, lifestealPct),
    dropLuckPct,
    miningPower,
    powerScore,
    activeSets,
  };
}

export function getUpgradeCost(currentLv: number): { coins: number; materialId: MaterialId; qty: number } {
  const coins = 4 + currentLv * 3;
  if (currentLv < 4) return { coins, materialId: 'minerio_ferro', qty: 2 + currentLv };
  if (currentLv < 8) return { coins, materialId: 'minerio_mitril', qty: 2 + (currentLv - 4) };
  if (currentLv < 12) return { coins, materialId: 'minerio_titanio', qty: 2 + (currentLv - 8) };
  return { coins, materialId: 'minerio_eter', qty: 1 + (currentLv - 12) };
}

export function getRarityEvolveCost(rarity: EquipmentRarity): {
  nextRarity: EquipmentRarity | null;
  coins: number;
  materialId: MaterialId;
  qty: number;
} {
  const idx = RARITY_ORDER.indexOf(rarity);
  if (idx < 0 || idx >= RARITY_ORDER.length - 1) {
    return { nextRarity: null, coins: 0, materialId: 'minerio_eter', qty: 0 };
  }
  const nextRarity = RARITY_ORDER[idx + 1];
  if (nextRarity === 'Raro') return { nextRarity, coins: 10, materialId: 'cristal_biolum', qty: 4 };
  if (nextRarity === 'Épico') return { nextRarity, coins: 18, materialId: 'essencia_sombria', qty: 5 };
  if (nextRarity === 'Lendário') return { nextRarity, coins: 30, materialId: 'essencia_solar', qty: 6 };
  return { nextRarity, coins: 50, materialId: 'nucleo_guardiao', qty: 2 };
}

export function getReforgePrefixes(): EquipmentPrefix[] {
  return ['Veloz', 'Bruto', 'Arcano', 'Vampírico', 'Celestial'];
}
