// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import { BOSS_META } from './modes';
import {
  BiomeId,
  BoonDef,
  BoonId,
  BossBestiaryEntry,
  BossEntityKind,
  ElementType,
  UnderworldBossKind,
  HunterContractDef,
  JukeboxTrackDef,
  MasteryTreeState,
  PlayModeId,
  PlayerTitleDef,
  RuneId,
  SpiritId,
  StyleRank,
  TalismanDef,
  TalismanId,
  TitleId,
  WeatherKind,
} from './types';

// ============================================================================
// 1. VIRTUAL ANALOG JOYSTICK DECODER
// ============================================================================
export interface VirtualJoystickOutput {
  analogX: number;
  analogY: number;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  knobX: number;
  knobY: number;
}

export function decodeVirtualJoystick(
  dx: number,
  dy: number,
  maxRadius = 44,
  deadzone = 0.22
): VirtualJoystickOutput {
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-4) {
    return { analogX: 0, analogY: 0, left: false, right: false, up: false, down: false, knobX: 0, knobY: 0 };
  }
  const clampedDist = Math.min(dist, maxRadius);
  const nx = (dx / dist) * (clampedDist / maxRadius);
  const ny = (dy / dist) * (clampedDist / maxRadius);
  const mag = Math.min(1, clampedDist / maxRadius);

  const knobX = (dx / dist) * clampedDist;
  const knobY = (dy / dist) * clampedDist;

  if (mag < deadzone) {
    return { analogX: 0, analogY: 0, left: false, right: false, up: false, down: false, knobX, knobY };
  }

  return {
    analogX: Math.max(-1, Math.min(1, nx)),
    analogY: Math.max(-1, Math.min(1, ny)),
    left: nx < -0.28,
    right: nx > 0.28,
    up: ny < -0.34,
    down: ny > 0.34,
    knobX,
    knobY,
  };
}

// ============================================================================
// 2. SISTEMA DE FORJA DE RUNAS (3 SLOTS EQUIPÁVEIS)
// ============================================================================
export interface RuneDef {
  id: RuneId;
  name: string;
  title: string;
  color: string;
  cost: number;
  description: string;
  speedBonus: number;
  jumpBonus: number;
  staminaBonus: number;
  skillCdMult: number;
  magnetRange: number;
  parryDamageBonus: number;
  extraAirJump: number;
}

export const RUNES: RuneDef[] = [
  {
    id: 'furia_carmesim',
    name: 'Runa Fúria Carmesim',
    title: '+2 Dano de Parry & Onda +35%',
    color: '#ff4d7d',
    cost: 0,
    description: 'Parries e reações elementares causam +1 de dano adicional em chefões e carregam +15% de Éter.',
    speedBonus: 0.04,
    jumpBonus: 0,
    staminaBonus: 0,
    skillCdMult: 0.94,
    magnetRange: 0,
    parryDamageBonus: 1,
    extraAirJump: 0,
  },
  {
    id: 'passos_fantasma',
    name: 'Runa Passos Fantasma',
    title: 'Velocidade +14% & Habilidade -12% CD',
    color: '#52e5ff',
    cost: 0,
    description: 'Concede +14% de velocidade de corrida no chão e reduz a recarga da habilidade [Q] em 12%.',
    speedBonus: 0.14,
    jumpBonus: 0.03,
    staminaBonus: 0,
    skillCdMult: 0.88,
    magnetRange: 0,
    parryDamageBonus: 0,
    extraAirJump: 0,
  },
  {
    id: 'ima_astral',
    name: 'Runa Ímã Astral',
    title: 'Atração +52px & Vigor +20%',
    color: '#ffd24d',
    cost: 4,
    description: 'Puxa automaticamente moedas astrais e orbes próximos e amplia o fôlego máximo de escalada.',
    speedBonus: 0.02,
    jumpBonus: 0,
    staminaBonus: 0.2,
    skillCdMult: 1,
    magnetRange: 52,
    parryDamageBonus: 0,
    extraAirJump: 0,
  },
  {
    id: 'contra_golpe',
    name: 'Runa Contra-Golpe Solar',
    title: 'Parry Explosivo + 15% CD',
    color: '#ff7733',
    cost: 6,
    description: 'Refletir projéteis dispara um raio teleguiado duplo contra chefões e reseta metade de [Q].',
    speedBonus: 0,
    jumpBonus: 0,
    staminaBonus: 0.1,
    skillCdMult: 0.85,
    magnetRange: 0,
    parryDamageBonus: 1,
    extraAirJump: 0,
  },
  {
    id: 'salto_gravitacional',
    name: 'Runa Salto Estelar',
    title: 'Salto +12% & Gravidade Suave',
    color: '#d580ff',
    cost: 8,
    description: 'Eleva a altura dos saltos em 12% e adiciona impulso leve para alcançar chefes que fogem.',
    speedBonus: 0.05,
    jumpBonus: 0.12,
    staminaBonus: 0.1,
    skillCdMult: 0.96,
    magnetRange: 0,
    parryDamageBonus: 0,
    extraAirJump: 0,
  },
  {
    id: 'eco_duplo',
    name: 'Runa Asa do Eco',
    title: '+1 Pulo Aéreo Extra',
    color: '#4df0c0',
    cost: 12,
    description: 'Runa Mítica que concede +1 pulo adicional no ar para qualquer herói equipado!',
    speedBonus: 0.04,
    jumpBonus: 0.04,
    staminaBonus: 0.15,
    skillCdMult: 0.92,
    magnetRange: 12,
    parryDamageBonus: 0,
    extraAirJump: 1,
  },
];

export const RUNE_MAP: Record<RuneId, RuneDef> = Object.fromEntries(
  RUNES.map((r) => [r.id, r])
) as Record<RuneId, RuneDef>;

export interface AggregatedRuneBonuses {
  speedBonus: number;
  jumpBonus: number;
  staminaBonus: number;
  skillCdMult: number;
  magnetRange: number;
  parryDamageBonus: number;
  extraAirJump: number;
}

export function computeRuneBonuses(equipped: RuneId[]): AggregatedRuneBonuses {
  const unique = Array.from(new Set(equipped)).slice(0, 3);
  const out: AggregatedRuneBonuses = {
    speedBonus: 0,
    jumpBonus: 0,
    staminaBonus: 0,
    skillCdMult: 1,
    magnetRange: 0,
    parryDamageBonus: 0,
    extraAirJump: 0,
  };
  for (const id of unique) {
    const r = RUNE_MAP[id];
    if (!r) continue;
    out.speedBonus += r.speedBonus;
    out.jumpBonus += r.jumpBonus;
    out.staminaBonus += r.staminaBonus;
    out.skillCdMult *= r.skillCdMult;
    out.magnetRange += r.magnetRange;
    out.parryDamageBonus += r.parryDamageBonus;
    out.extraAirJump += r.extraAirJump;
  }
  return out;
}

// ============================================================================
// 3. COMPANHEIRO ESPIRITUAL (PET ORBITAL DE COMBATE & COLETA)
// ============================================================================
export interface SpiritDef {
  id: SpiritId;
  name: string;
  color: string;
  secondaryColor: string;
  cost: number;
  perk: string;
  collectRange: number;
  shootInterval: number;
  xpBonus: number;
}

export const SPIRITS: SpiritDef[] = [
  {
    id: 'coruja_runica',
    name: 'Coruja Rúnica',
    color: '#52e5ff',
    secondaryColor: '#ffd27d',
    cost: 0,
    perk: 'Coleta moedas num raio de 36px e dispara flechas arcanas nos chefões a cada 4.2s.',
    collectRange: 36,
    shootInterval: 4.2,
    xpBonus: 1.1,
  },
  {
    id: 'fenix_menor',
    name: 'Fênix Escarlate',
    color: '#ff6622',
    secondaryColor: '#ffe066',
    cost: 6,
    perk: 'Dispara brasas de Fogo no chefe a cada 3.2s, aplicando a marca Elemental FOGO!',
    collectRange: 28,
    shootInterval: 3.2,
    xpBonus: 1.2,
  },
  {
    id: 'fada_crono',
    name: 'Fada Crono',
    color: '#a89eff',
    secondaryColor: '#66eeff',
    cost: 9,
    perk: 'Dispara pulsos temporais (marca RAIO), acelera recarga de [Q] em 10% e puxa cristais.',
    collectRange: 44,
    shootInterval: 3.5,
    xpBonus: 1.25,
  },
  {
    id: 'dragao_cristal',
    name: 'Dragão de Cristal',
    color: '#4df0c0',
    secondaryColor: '#ff70a6',
    cost: 14,
    perk: 'Espírito Lendário: aplica marca ASTRAL a cada 2.8s, +35% XP de Maestria e atração de 54px.',
    collectRange: 54,
    shootInterval: 2.8,
    xpBonus: 1.35,
  },
];

export const SPIRIT_MAP: Record<string, SpiritDef> = Object.fromEntries(
  SPIRITS.map((s) => [s.id, s])
);

// ============================================================================
// 4. CLIMA DINÂMICO POR SALA E BIOMA
// ============================================================================
export interface WeatherMetaDef {
  id: WeatherKind;
  name: string;
  color: string;
  windX: number;
  gravityMult: number;
  skillCdMult: number;
  overdriveMult: number;
  desc: string;
}

export const WEATHER_META: Record<WeatherKind, WeatherMetaDef> = {
  clear: {
    id: 'clear',
    name: 'Céu Límpido',
    color: '#a5b4fc',
    windX: 0,
    gravityMult: 1,
    skillCdMult: 1,
    overdriveMult: 1,
    desc: 'Física equilibrada em condições perfeitas de escalada.',
  },
  wind_gale: {
    id: 'wind_gale',
    name: 'Ventania Cortante',
    color: '#5eead4',
    windX: 46,
    gravityMult: 0.96,
    skillCdMult: 0.95,
    overdriveMult: 1.1,
    desc: 'Brisa dinâmica impulsiona travessias e suaviza levemente a gravidade.',
  },
  astral_meteor: {
    id: 'astral_meteor',
    name: 'Chuva de Meteoros',
    color: '#fbbf24',
    windX: 0,
    gravityMult: 1,
    skillCdMult: 0.88,
    overdriveMult: 1.25,
    desc: 'Energia estelar no ar acelera [Q] em 12% e Éter Supremo em 25%.',
  },
  blood_eclipse: {
    id: 'blood_eclipse',
    name: 'Eclipse Carmesim',
    color: '#fb7185',
    windX: -28,
    gravityMult: 1.03,
    skillCdMult: 0.84,
    overdriveMult: 1.45,
    desc: 'Lua de sangue concede +45% de carga de Éter e recarga veloz.',
  },
  aurora_blessing: {
    id: 'aurora_blessing',
    name: 'Benção Boreal',
    color: '#34d399',
    windX: 0,
    gravityMult: 0.9,
    skillCdMult: 0.9,
    overdriveMult: 1.2,
    desc: 'Luz boreal reduz a gravidade em 10% para saltos graciosos.',
  },
};

export function pickRoomWeather(biome: BiomeId, stageIndex: number): WeatherKind {
  if (stageIndex === 0) return 'clear';
  const pool: Record<BiomeId, WeatherKind[]> = {
    silver_ash: ['clear', 'wind_gale', 'aurora_blessing'],
    bioluminescent: ['clear', 'aurora_blessing', 'astral_meteor'],
    frostglass: ['wind_gale', 'aurora_blessing', 'clear'],
    obsidian_forge: ['blood_eclipse', 'astral_meteor', 'wind_gale'],
    astral_void: ['astral_meteor', 'aurora_blessing', 'blood_eclipse'],
    crimson_sakura: ['wind_gale', 'clear', 'blood_eclipse'],
    sunken_cathedral: ['clear', 'aurora_blessing', 'wind_gale'],
    clockwork_spire: ['wind_gale', 'astral_meteor', 'clear'],
    emerald_sky: ['aurora_blessing', 'wind_gale', 'astral_meteor'],
    solar_mirage: ['wind_gale', 'blood_eclipse', 'astral_meteor'],
    amethyst_crypt: ['blood_eclipse', 'astral_meteor', 'clear'],
    alchemical_labs: ['astral_meteor', 'blood_eclipse', 'aurora_blessing'],
    aurora_zenith: ['aurora_blessing', 'wind_gale', 'astral_meteor'],
    crimson_canyon: ['wind_gale', 'blood_eclipse', 'astral_meteor'],
    cyber_undercity: ['astral_meteor', 'blood_eclipse', 'clear'],
    celestial_marble: ['aurora_blessing', 'astral_meteor', 'wind_gale'],
    ebony_fen: ['blood_eclipse', 'wind_gale', 'clear'],
    orbital_nexus: ['astral_meteor', 'aurora_blessing', 'blood_eclipse'],
    twilight_garden: ['blood_eclipse', 'aurora_blessing', 'astral_meteor'],
    stormcrown: ['blood_eclipse', 'wind_gale', 'astral_meteor'],
  };
  const list = pool[biome] ?? ['clear'];
  return list[stageIndex % list.length];
}

// ============================================================================
// 5. SISTEMA DE COMBO ELEMENTAL & REAÇÕES
// ============================================================================
export const ELEMENT_META: Record<ElementType, { label: string; color: string }> = {
  flame: { label: 'FOGO', color: '#ff6622' },
  frost: { label: 'GELO', color: '#7ce8ff' },
  volt: { label: 'RAIO', color: '#facc15' },
  void: { label: 'VAZIO', color: '#c084fc' },
  astral: { label: 'ASTRAL', color: '#4df0c0' },
};

export interface ElementalReactionResult {
  name: string;
  color: string;
  bonusDamage: number;
  overdriveGain: number;
  radius: number;
}

export function resolveElementalReaction(a: ElementType, b: ElementType): ElementalReactionResult | null {
  if (a === b) return null;
  const pair = [a, b].sort().join('+');
  const map: Record<string, ElementalReactionResult> = {
    'flame+frost': {
      name: 'VAPORIZAÇÃO CRÍTICA!',
      color: '#ff9e64',
      bonusDamage: 2,
      overdriveGain: 28,
      radius: 56,
    },
    'flame+volt': {
      name: 'SOBRECARGA EXPLOSIVA!',
      color: '#fde047',
      bonusDamage: 2,
      overdriveGain: 24,
      radius: 64,
    },
    'frost+volt': {
      name: 'SUPERCONDUTOR!',
      color: '#67e8f9',
      bonusDamage: 1,
      overdriveGain: 22,
      radius: 60,
    },
    'flame+void': {
      name: 'ECLIPSE INFERNAL!',
      color: '#fb7185',
      bonusDamage: 2,
      overdriveGain: 30,
      radius: 58,
    },
    'astral+void': {
      name: 'COLAPSO SIDERAL!',
      color: '#e879f9',
      bonusDamage: 2,
      overdriveGain: 34,
      radius: 68,
    },
    'astral+flame': {
      name: 'SUPERNOVA SOLAR!',
      color: '#ffe066',
      bonusDamage: 2,
      overdriveGain: 30,
      radius: 66,
    },
    'astral+frost': {
      name: 'AURORA ESTELAR!',
      color: '#5eead4',
      bonusDamage: 1,
      overdriveGain: 26,
      radius: 58,
    },
    'astral+volt': {
      name: 'TEMPESTADE QUÂNTICA!',
      color: '#38bdf8',
      bonusDamage: 2,
      overdriveGain: 28,
      radius: 64,
    },
    'frost+void': {
      name: 'ESTASE ABISSAL!',
      color: '#a78bfa',
      bonusDamage: 1,
      overdriveGain: 25,
      radius: 56,
    },
    'void+volt': {
      name: 'RUPTURA DIMENSIONAL!',
      color: '#d580ff',
      bonusDamage: 2,
      overdriveGain: 30,
      radius: 62,
    },
  };
  return (
    map[pair] ?? {
      name: 'REAÇÃO ELEMENTAL!',
      color: '#ffd27d',
      bonusDamage: 1,
      overdriveGain: 20,
      radius: 52,
    }
  );
}

// ============================================================================
// 6. ÁRVORE DE MAESTRIA INFINITA (4 RAMOS PERMANENTES)
// ============================================================================
export interface MasteryBonuses {
  speedMult: number;
  jumpMult: number;
  staminaMult: number;
  skillCdMult: number;
  overdriveGainMult: number;
  levelTotal: number;
}

export function getMasteryUpgradeCost(currentLevel: number): number {
  return 25 + currentLevel * 20;
}

export function getMasteryBonuses(m: MasteryTreeState): MasteryBonuses {
  const mob = Math.min(10, m.mobilityLv);
  const com = Math.min(10, m.combatLv);
  const exp = Math.min(10, m.explorationLv);
  const sur = Math.min(10, m.survivalLv);
  return {
    speedMult: 1 + mob * 0.025,
    jumpMult: 1 + mob * 0.015,
    staminaMult: 1 + sur * 0.05,
    skillCdMult: Math.max(0.7, 1 - com * 0.03),
    overdriveGainMult: 1 + exp * 0.06,
    levelTotal: m.mobilityLv + m.combatLv + m.explorationLv + m.survivalLv,
  };
}

// ============================================================================
// 7. SISTEMA DE 16 CONQUISTAS RÚNICAS
// ============================================================================
export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  coinReward: number;
  xpReward: number;
  color: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_blood', name: 'Primeiro Selo Quebrado', desc: 'Derrote seu primeiro Guardião Chefão.', coinReward: 5, xpReward: 40, color: '#ffd27d' },
  { id: 'relic_hunter_10', name: 'Colecionador do Eco', desc: 'Colete 10 Relíquias secretas na campanha.', coinReward: 6, xpReward: 50, color: '#ff5e8e' },
  { id: 'relic_hunter_30', name: 'Mestre das Relíquias', desc: 'Colete 30 Relíquias pelas montanhas.', coinReward: 12, xpReward: 120, color: '#fbbf24' },
  { id: 'style_s', name: 'Estilo Rank S', desc: 'Atinja Rank S ou SS em uma sequência de combo.', coinReward: 4, xpReward: 45, color: '#38bdf8' },
  { id: 'elemental_master', name: 'Alquimista Elemental', desc: 'Ative uma Reação Elemental combinando 2 elementos.', coinReward: 5, xpReward: 50, color: '#e879f9' },
  { id: 'rift_runner', name: 'Corredor de Fendas', desc: 'Complete um desafio cronometrado de Fenda Astral.', coinReward: 8, xpReward: 75, color: '#4df0c0' },
  { id: 'duo_synergy', name: 'Ataque em Dupla', desc: 'Execute uma Troca Rápida [F] entre dois heróis.', coinReward: 4, xpReward: 35, color: '#a89eff' },
  { id: 'boss_5', name: 'Caçador de Colossos', desc: 'Vença 5 capítulos completos.', coinReward: 10, xpReward: 100, color: '#f97316' },
  { id: 'boss_10', name: 'Lenda dos Dez Reinos', desc: 'Conquiste 10 capítulos completos.', coinReward: 16, xpReward: 160, color: '#c084fc' },
  { id: 'boss_20', name: 'Soberano Absoluto', desc: 'Conquiste todos os 20 biomas e o Soberano dos Ecos.', coinReward: 30, xpReward: 300, color: '#ffe066' },
  { id: 'survival_5', name: 'Sobrevivente da Arena', desc: 'Alcance a Onda 5 na Arena Infinita.', coinReward: 7, xpReward: 60, color: '#34d399' },
  { id: 'parry_ace', name: 'Mestre da Aparada', desc: 'Reflita projéteis usando Parry no Dash.', coinReward: 5, xpReward: 45, color: '#67e8f9' },
];

// ============================================================================
// 8. FANTASMA DE REPLAY (GHOST RACER FRAME)
// ============================================================================
export interface GhostFrame {
  t: number;
  x: number;
  y: number;
  facing: 1 | -1;
}

export function sampleGhostFrame(frames: GhostFrame[], elapsed: number): GhostFrame | null {
  if (!frames || frames.length === 0) return null;
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (frames[mid].t <= elapsed) lo = mid;
    else hi = mid - 1;
  }
  return frames[lo];
}

// ============================================================================
// 9. CARTAS ASTRAIS ROGUELITE (18 BÊNÇÃOS ATIVAS POR RUN)
// ============================================================================
export const BOONS: BoonDef[] = [
  { id: 'vampiric_dash', name: 'Dash Vampírico', rarity: 'Rara', color: '#ff4d7d', desc: 'Acertar inimigos no Dash regenera Vigor, +8 Éter e reativa o Escudo a cada 5 acertos.', code: 'BOON_VAMPIRIC_DASH' },
  { id: 'lightning_parry', name: 'Parry Voltaico', rarity: 'Rara', color: '#facc15', desc: 'Aparar projéteis invoca raios em cadeia em até 3 inimigos próximos.', code: 'BOON_LIGHTNING_PARRY' },
  { id: 'meteor_slam', name: 'Impacto Meteórico', rarity: 'Comum', color: '#ff8844', desc: 'Pousos após queda rápida detonam ondas concussivas que geram Postura.', code: 'BOON_METEOR_SLAM' },
  { id: 'echo_slash', name: 'Corte Duplo do Eco', rarity: 'Mítica', color: '#a89eff', desc: 'Habilidades [Q] atingem em dobro com alcance expandido em +50%.', code: 'BOON_ECHO_SLASH' },
  { id: 'frost_nova', name: 'Nova Glacial', rarity: 'Comum', color: '#7ce8ff', desc: 'Dashes congelam e dissipam projéteis dentro de 32px.', code: 'BOON_FROST_NOVA' },
  { id: 'chrono_surge', name: 'Surto Crono', rarity: 'Rara', color: '#52e5ff', desc: 'Reduz recarga de [Q] e Troca [F] em 22%.', code: 'BOON_CHRONO_SURGE' },
  { id: 'star_magnet', name: 'Órbita Magnética', rarity: 'Comum', color: '#ffd24d', desc: 'Atrai moedas, orbes e fragmentos de coroa em +75px.', code: 'BOON_STAR_MAGNET' },
  { id: 'aegis_reforge', name: 'Égide Reforjada', rarity: 'Rara', color: '#ff9e64', desc: 'Regenera seu Escudo automaticamente após 12s sem sofrer dano.', code: 'BOON_AEGIS_REFORGE' },
  { id: 'air_dancer', name: 'Dançarino dos Céus', rarity: 'Mítica', color: '#4df0c0', desc: '+1 Salto Aéreo extra e +10% agilidade horizontal.', code: 'BOON_AIR_DANCER' },
  { id: 'prism_burst', name: 'Estilhaço Prismático', rarity: 'Rara', color: '#ff66dd', desc: 'Coletar Cristais dispara 3 dardos arcanos no inimigo próximo.', code: 'BOON_PRISM_BURST' },
  { id: 'solar_flare', name: 'Labareda Solar', rarity: 'Comum', color: '#ffe066', desc: '+1 dano bônus e +25% raio em todas as Reações Elementais.', code: 'BOON_SOLAR_FLARE' },
  { id: 'void_siphon', name: 'Sifão do Vazio', rarity: 'Mítica', color: '#c084fc', desc: 'Esquivas Perfeitas concedem +30 Éter e resetam a recarga de [Q].', code: 'BOON_VOID_SIPHON' },
  { id: 'grappler_pro', name: 'Mestre do Arpão', rarity: 'Comum', color: '#38bdf8', desc: 'Alcance do Arpão Aéreo +45% e impulso tangencial reforçado.', code: 'BOON_GRAPPLER_PRO' },
  { id: 'eter_overflow', name: 'Transbordo de Éter', rarity: 'Rara', color: '#fde047', desc: 'Ativar Éter Supremo causa dano em área e dobra a quebra de postura.', code: 'BOON_ETER_OVERFLOW' },
  { id: 'style_emperor', name: 'Imperador de Estilo', rarity: 'Comum', color: '#f472b6', desc: 'Combos duram +2.5s extras e rendem +35% de pontos e XP.', code: 'BOON_STYLE_EMPEROR' },
  { id: 'critical_edge', name: 'Lâmina Crítica', rarity: 'Rara', color: '#fb7185', desc: 'Chefões atordoados ou em recuperação sofrem +1 dano adicional por golpe.', code: 'BOON_CRITICAL_EDGE' },
  { id: 'wind_walker', name: 'Passo dos Ventos', rarity: 'Comum', color: '#5eead4', desc: '+15% velocidade de movimento e +18% vigor máximo.', code: 'BOON_WIND_WALKER' },
  { id: 'phoenix_ash', name: 'Cinzas da Fênix', rarity: 'Mítica', color: '#ff6622', desc: 'Salva você 1 vez por etapa de um golpe letal com explosão solar!', code: 'BOON_PHOENIX_ASH' },
];

export const BOON_MAP: Record<BoonId, BoonDef> = Object.fromEntries(
  BOONS.map((b) => [b.id, b])
) as Record<BoonId, BoonDef>;

export interface AggregatedBoonBonuses {
  speedMult: number;
  staminaMult: number;
  skillCdMult: number;
  magnetRange: number;
  extraAirJump: number;
  grappleRangeMult: number;
  reactionBonusDamage: number;
  comboTimeBonus: number;
  staggerMult: number;
  critVulnerableBonus: number;
}

export function computeBoonBonuses(active: BoonId[]): AggregatedBoonBonuses {
  const set = new Set(active);
  return {
    speedMult: (set.has('wind_walker') ? 1.15 : 1) * (set.has('air_dancer') ? 1.06 : 1),
    staminaMult: set.has('wind_walker') ? 1.18 : 1,
    skillCdMult: set.has('chrono_surge') ? 0.78 : 1,
    magnetRange: set.has('star_magnet') ? 75 : 0,
    extraAirJump: set.has('air_dancer') ? 1 : 0,
    grappleRangeMult: set.has('grappler_pro') ? 1.45 : 1,
    reactionBonusDamage: set.has('solar_flare') ? 1 : 0,
    comboTimeBonus: set.has('style_emperor') ? 2.5 : 0,
    staggerMult: set.has('eter_overflow') ? 1.35 : 1,
    critVulnerableBonus: set.has('critical_edge') ? 1 : 0,
  };
}

export function pickBoonDraftOptions(owned: BoonId[], seed = 0): BoonId[] {
  const ownedSet = new Set(owned);
  const pool = BOONS.filter((b) => !ownedSet.has(b.id));
  const source = pool.length >= 3 ? pool : BOONS;
  const picks: BoonId[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = (Math.abs(seed) + i * 7) % source.length;
    const candidate = source[idx].id;
    if (!picks.includes(candidate)) {
      picks.push(candidate);
    } else {
      const alt = source[(idx + 1) % source.length].id;
      if (!picks.includes(alt)) picks.push(alt);
    }
  }
  for (const b of source) {
    if (picks.length >= 3) break;
    if (!picks.includes(b.id)) picks.push(b.id);
  }
  return picks;
}

// ============================================================================
// 10. FORJA DE 12 TALISMÃS ELEMENTAIS
// ============================================================================
export const TALISMANS: TalismanDef[] = [
  { id: 'selo_cinza', name: 'Selo das Cinzas', color: '#e8a87c', cost: 0, element: 'astral', desc: '+10% Postura contra chefões e +8% velocidade inicial.' },
  { id: 'coracao_brasas', name: 'Coração de Brasas', color: '#ff6622', cost: 4, element: 'flame', desc: 'Aplica marca FOGO em dashes ofensivos e fortalece explosões.' },
  { id: 'prisma_glacial', name: 'Prisma Glacial', color: '#7ce8ff', cost: 5, element: 'frost', desc: 'Aplica marca GELO e amplia a janela de Esquiva Perfeita em +4px.' },
  { id: 'ampulheta_eterna', name: 'Ampulheta Eterna', color: '#52e5ff', cost: 6, element: 'astral', desc: 'Reduz recarga de [Q] em 12% e prolonga combos em +1.5s.' },
  { id: 'olho_aguia', name: 'Olho de Águia', color: '#ffd24d', cost: 7, element: 'volt', desc: '+1 de dano bônus quando o chefão estiver Atordoado!' },
  { id: 'garra_trovao', name: 'Garra do Trovão', color: '#facc15', cost: 8, element: 'volt', desc: 'Aplica RAIO nos golpes e aumenta carga de Éter por esquiva.' },
  { id: 'manto_vazio', name: 'Manto do Vazio', color: '#c084fc', cost: 9, element: 'void', desc: 'Aplica VAZIO e garante +15 Éter ao executar Troca [F].' },
  { id: 'coroa_soberana', name: 'Coroa do Soberano', color: '#ffe066', cost: 14, element: 'astral', desc: '+25% dano de Postura e +2★ extras por Fragmento de Coroa!' },
  { id: 'asa_serafim', name: 'Asa de Serafim', color: '#4df0c0', cost: 10, element: 'astral', desc: '+22% Vigor máximo e +10% alcance de Arpão Aéreo.' },
  { id: 'anel_parry', name: 'Anel do Contra-Ataque', color: '#67e8f9', cost: 8, element: 'volt', desc: 'Parry e Esquiva Perfeita disparam descarga voltaica de +1 dano.' },
  { id: 'pedra_filosofal', name: 'Pedra Filosofal', color: '#e879f9', cost: 15, element: 'void', desc: 'Gera +20% XP de Maestria e atrai todos os cristais/orbes de campo.' },
];

export const TALISMAN_MAP: Record<TalismanId, TalismanDef> = Object.fromEntries(
  TALISMANS.map((t) => [t.id, t])
) as Record<TalismanId, TalismanDef>;

// ============================================================================
// 11. 10 TÍTULOS HONORÍFICOS DO JOGADOR
// ============================================================================
export const PLAYER_TITLES: PlayerTitleDef[] = [
  { id: 'viajante', name: 'Viajante do Abismo', color: '#e8a87c', requirement: 'Título inicial da jornada em Aethelgard.' },
  { id: 'esquiva_fantasma', name: 'Sombra Intocável', color: '#52e5ff', requirement: 'Execute 3 Esquivas Perfeitas em combate.' },
  { id: 'cacador_coroas', name: 'Caçador de Coroas', color: '#ffd24d', requirement: 'Colete 3 Fragmentos da Coroa Real de chefões.' },
  { id: 'quebra_guardas', name: 'Quebrador de Guardas', color: '#ff8844', requirement: 'Atordoe Guardiões e derrote 3 Chefões.' },
  { id: 'mestre_combo', name: 'Maestro Rank SS', color: '#ff66dd', requirement: 'Alcance Rank SS em combate ou travessia.' },
  { id: 'alquimista_eter', name: 'Alquimista do Éter', color: '#e879f9', requirement: 'Detone 5 Reações Elementais combinadas.' },
  { id: 'duelista_apex', name: 'Duelista do Pináculo', color: '#4df0c0', requirement: 'Vença 8 Guardiões no Bestiário ou Campanha.' },
  { id: 'colecionador', name: 'Guardião das Relíquias', color: '#fb7185', requirement: 'Colete 20 Relíquias pelas montanhas.' },
  { id: 'sobrevivente', name: 'Campeão do Coliseu', color: '#34d399', requirement: 'Alcance a Onda 6 na Arena Infinita.' },
  { id: 'lenda_eterna', name: 'Lenda Eterna', color: '#ffe066', requirement: 'Desbloqueie 160+ mecânicas e derrote 15 chefões.' },
];

export const TITLE_MAP: Record<TitleId, PlayerTitleDef> = Object.fromEntries(
  PLAYER_TITLES.map((t) => [t.id, t])
) as Record<TitleId, PlayerTitleDef>;

export function evaluateUnlockedTitles(stats: {
  perfectDodges: number;
  crownShards: number;
  bossesDefeated: number;
  styleSS: number;
  reactions: number;
  relics: number;
  bestWave: number;
  discoveredMechanics: number;
}): TitleId[] {
  const out: TitleId[] = ['viajante'];
  if (stats.perfectDodges >= 3) out.push('esquiva_fantasma');
  if (stats.crownShards >= 3) out.push('cacador_coroas');
  if (stats.bossesDefeated >= 3) out.push('quebra_guardas');
  if (stats.styleSS >= 1) out.push('mestre_combo');
  if (stats.reactions >= 5) out.push('alquimista_eter');
  if (stats.bossesDefeated >= 8) out.push('duelista_apex');
  if (stats.relics >= 20) out.push('colecionador');
  if (stats.bestWave >= 6) out.push('sobrevivente');
  if (stats.discoveredMechanics >= 160 && stats.bossesDefeated >= 15) out.push('lenda_eterna');
  return out;
}

// ============================================================================
// 12. 12 CONTRATOS DE CAÇA COM RECOMPENSAS
// ============================================================================
export const HUNTER_CONTRACTS: HunterContractDef[] = [
  { id: 'c_dodge_3', title: 'Dança da Navalha I', desc: 'Execute 3 Esquivas Perfeitas raspando em golpes.', target: 3, metric: 'perfectDodges', coinReward: 6, xpReward: 40, color: '#52e5ff' },
  { id: 'c_dodge_12', title: 'Dança da Navalha II', desc: 'Execute 12 Esquivas Perfeitas em qualquer modo.', target: 12, metric: 'perfectDodges', coinReward: 14, xpReward: 90, color: '#38bdf8' },
  { id: 'c_boss_1', title: 'Primeiro Guardião', desc: 'Derrote 1 Chefão em Campanha, Duelo ou Boss Rush.', target: 1, metric: 'bossesDefeated', coinReward: 6, xpReward: 50, color: '#ff8844' },
  { id: 'c_boss_5', title: 'Exterminador de Titãs', desc: 'Derrote 5 Chefões ao todo.', target: 5, metric: 'bossesDefeated', coinReward: 14, xpReward: 110, color: '#ff5c8a' },
  { id: 'c_boss_15', title: 'Soberania das 20 Terras', desc: 'Derrote 15 Chefões para dominar o Códice.', target: 15, metric: 'bossesDefeated', coinReward: 28, xpReward: 240, color: '#ffe066' },
  { id: 'c_crown_2', title: 'Ladrão de Coroas I', desc: 'Recolha 2 Fragmentos de Coroa após atordoar chefes.', target: 2, metric: 'crownShards', coinReward: 8, xpReward: 60, color: '#ffd24d' },
  { id: 'c_crown_6', title: 'Ladrão de Coroas II', desc: 'Recolha 6 Fragmentos de Coroa em Quebras de Guarda.', target: 6, metric: 'crownShards', coinReward: 18, xpReward: 140, color: '#fbbf24' },
  { id: 'c_parry_4', title: 'Espelho de Aço', desc: 'Reflita 4 projéteis usando Dash Parry.', target: 4, metric: 'parries', coinReward: 7, xpReward: 55, color: '#67e8f9' },
  { id: 'c_react_5', title: 'Mestre Alquimista', desc: 'Detone 5 Reações Elementais em inimigos.', target: 5, metric: 'reactions', coinReward: 8, xpReward: 65, color: '#e879f9' },
  { id: 'c_relic_15', title: 'Rastreador do Éter', desc: 'Colete 15 Relíquias pelas montanhas.', target: 15, metric: 'relics', coinReward: 12, xpReward: 100, color: '#ff4d7d' },
  { id: 'c_style_ss', title: 'Apogeu do Estilo', desc: 'Atinja Rank SS por 3 vezes em combate.', target: 3, metric: 'styleSS', coinReward: 10, xpReward: 80, color: '#f472b6' },
  { id: 'c_wave_5', title: 'Gladiador Infinito', desc: 'Chegue à Onda 5 no Coliseu do Éter.', target: 5, metric: 'bestWave', coinReward: 12, xpReward: 95, color: '#4df0c0' },
];

export function getContractMetricValue(
  metric: HunterContractDef['metric'],
  stats: Record<HunterContractDef['metric'], number>
): number {
  return stats[metric] ?? 0;
}

// ============================================================================
// 13. BESTIÁRIO VIVO DOS 20 CHEFÕES (FRAQUEZAS, POSTURA, DICAS & DUELO)
// ============================================================================
export const BESTIARY_ENTRIES: BossBestiaryEntry[] = [
  { kind: 'boss_sentinel', name: 'Sentinela das Cinzas', title: 'Guardião do Desfiladeiro', chapter: 0, weaknessElement: 'volt', maxStagger: 4, accent: '#ff7744', lore: 'Autômato ancestral forjado nas torres de basalto para vigiar o portão oeste.', tacticalTip: 'Dash com Raio ou Parry nas varreduras horizontais quebram sua guarda rápido.' },
  { kind: 'boss_mycelium', name: 'Matriarca Micélia', title: 'Rainha dos Esporos', chapter: 1, weaknessElement: 'flame', maxStagger: 4, accent: '#4df0c0', lore: 'Consciência fúngica que ilumina as cavernas profundas com bioluminescência.', tacticalTip: 'Use ataques de Fogo para queimar sua rede de esporos e atordoá-la.' },
  { kind: 'boss_glacier', name: 'Arconte Glacial', title: 'Senhor dos Espelhos de Gelo', chapter: 2, weaknessElement: 'flame', maxStagger: 5, accent: '#7ce8ff', lore: 'Monarca cristalino que refrata relâmpagos nas geleiras de espelho.', tacticalTip: 'Evite os feixes verticais após a linha guia e puna na janela de recuperação.' },
  { kind: 'boss_ignis_rex', name: 'Ignis Rex', title: 'Colosso da Forja', chapter: 3, weaknessElement: 'frost', maxStagger: 5, accent: '#ff5522', lore: 'Titã de obsidiana derretida nascido no coração dos altos-fornos subterrâneos.', tacticalTip: 'Gelo causa dano x2! Salte as ondas sísmicas com super pulos.' },
  { kind: 'boss_astral_oracle', name: 'Oráculo Astral', title: 'Observadora do Vazio', chapter: 4, weaknessElement: 'void', maxStagger: 5, accent: '#d580ff', lore: 'Profetisa suspensa entre portais dimensionais tecendo órbitas gravitacionais.', tacticalTip: 'Ataques de Vazio perfuram sua órbita psíquica e derrubam Fragmentos.' },
  { kind: 'boss_sakura', name: 'Kitsune Carmesim', title: 'Guardiã das Pétalas', chapter: 5, weaknessElement: 'frost', maxStagger: 5, accent: '#ff88b8', lore: 'Espírito veloz de sete caudas que dança entre vendavais de cerejeira.', tacticalTip: 'Acompanhe os saltos parabólicos pelo rastro rosa; Gelo reduz seu ímpeto.' },
  { kind: 'boss_leviathan', name: 'Leviatã Abissal', title: 'Terror da Catedral Submersa', chapter: 6, weaknessElement: 'volt', maxStagger: 6, accent: '#38bdf8', lore: 'Serpente abissal que ecoa cantos pelos vitrais inundados.', tacticalTip: 'Raio eletrifica a arena causando Quebra de Guarda instantânea!' },
  { kind: 'boss_chronos', name: 'Mestre Cronos', title: 'Arquiteto das Engrenagens', chapter: 7, weaknessElement: 'void', maxStagger: 6, accent: '#fbbf24', lore: 'Relojoeiro imortal cujo coração pulsa sincronizado aos pêndulos da torre.', tacticalTip: 'Use Portais Crono e Vazio para desequilibrar sua cadência.' },
  { kind: 'boss_seraph_king', name: 'Rei Serafim', title: 'Senhor dos Céus Esmeralda', chapter: 8, weaknessElement: 'flame', maxStagger: 6, accent: '#34d399', lore: 'Arcanjo alado que patrulha as ilhas flutuantes sob tempestades solares.', tacticalTip: 'Use o Arpão Aéreo quando ele recuar para as plataformas altas.' },
  { kind: 'boss_sphinx', name: 'Esfinge Solar', title: 'Enigma das Dunas Douradas', chapter: 9, weaknessElement: 'frost', maxStagger: 6, accent: '#f59e0b', lore: 'Guardiã de areia e ouro que dispara prismas refratores no deserto.', tacticalTip: 'Congele sua coroa com Gelo e aproveite os cristais centrais.' },
  { kind: 'boss_lich', name: 'Lich de Ametista', title: 'Soberano da Cripta', chapter: 10, weaknessElement: 'astral', maxStagger: 6, accent: '#a855f7', lore: 'Necromante cristalino que comanda runas roxas na câmara funerária.', tacticalTip: 'Dano Astral estilhaça seu filactério durante a Fase II.' },
  { kind: 'boss_automaton', name: 'Autômato Alquímico', title: 'Golem de Mercúrio', chapter: 11, weaknessElement: 'volt', maxStagger: 7, accent: '#22d3ee', lore: 'Experimento vivo alimentado por bobinas de plasma e ácidos.', tacticalTip: 'Sobrecargas elétricas superaquecem o núcleo de mercúrio.' },
  { kind: 'boss_valkyrie', name: 'Valquíria da Aurora', title: 'Lança Boreal', chapter: 12, weaknessElement: 'flame', maxStagger: 7, accent: '#6ee7b7', lore: 'Guerreira celestial dos picos árticos que mergulha em velocidade sônica.', tacticalTip: 'Desvie perpendicularmente da linha tracejada e contra-ataque com Fogo.' },
  { kind: 'boss_canyon_colossus', name: 'Colosso do Cânion', title: 'Titã Telúrico', chapter: 13, weaknessElement: 'astral', maxStagger: 7, accent: '#fb7185', lore: 'Gigante esculpido em rocha vermelha com força sísmica avassaladora.', tacticalTip: 'Suba nas plataformas elevadas durante suas ondas de choque no piso.' },
  { kind: 'boss_cyber_archon', name: 'Arconte Cibernético', title: 'Mente da Subcidade', chapter: 14, weaknessElement: 'volt', maxStagger: 7, accent: '#00f5d4', lore: 'IA holográfica armada com canhões de fótons e matrizes digitais.', tacticalTip: 'Parry nos projéteis de plasma devolve rajadas direto para o núcleo!' },
  { kind: 'boss_marble_titan', name: 'Titã de Mármore', title: 'Juiz do Panteão Celeste', chapter: 15, weaknessElement: 'void', maxStagger: 8, accent: '#e2e8f0', lore: 'Estátua viva banhada a ouro cuja guarda impõe respeito aos deuses.', tacticalTip: 'Vazio ignora sua carapaça marmórea — use Esquivas Perfeitas!' },
  { kind: 'boss_fen_hydra', name: 'Hidra do Pântano', title: 'Sombra de Ébano', chapter: 16, weaknessElement: 'flame', maxStagger: 8, accent: '#84cc16', lore: 'Monstruosidade venenosa que cospe chuvas ácidas pelos mangues sombrios.', tacticalTip: 'Mantenha pressão aérea e use Fogo para cauterizar suas cabeças.' },
  { kind: 'boss_star_emperor', name: 'Imperador Estelar', title: 'Comandante Orbital', chapter: 17, weaknessElement: 'void', maxStagger: 8, accent: '#60a5fa', lore: 'Soberano cósmico protegido por anéis gravitacionais e satélites armados.', tacticalTip: 'Use os anéis de gravidade e Vazio para cortar suas órbitas.' },
  { kind: 'boss_twilight_wraith', name: 'Espectro do Crepúsculo', title: 'Flor da Meia-Noite', chapter: 18, weaknessElement: 'astral', maxStagger: 8, accent: '#f472b6', lore: 'Lótus sombria do jardim eterno capaz de multiplicar ilusões letais.', tacticalTip: 'Ative o Espelho do Eco e acerte o espectro real com Luz Astral.' },
  { kind: 'boss_sovereign', name: 'O Soberano dos Ecos', title: 'Coroa da Tempestade Final', chapter: 19, weaknessElement: 'astral', maxStagger: 9, accent: '#ffe066', lore: 'O arquiteto primordial do Pináculo de Aethelgard, reunindo todos os elementos.', tacticalTip: 'Combine Reações Elementais, Quebra de Guarda e Modo Éter na Fase III!' },
  { kind: 'boss_coral_siren', name: 'Sirena do Coral Abissal', title: 'Cantora das Fossas', chapter: 20, weaknessElement: 'volt', maxStagger: 6, accent: '#22d3ee', lore: 'Sereia bioluminescente que comanda cardumes prismáticos nas fossas oceânicas.', tacticalTip: 'Descargas elétricas propagam pela água causando dano crítico.' },
  { kind: 'boss_ash_behemoth', name: 'Behemoth das Brasas', title: 'Colosso Vulcânico', chapter: 21, weaknessElement: 'frost', maxStagger: 7, accent: '#fb923c', lore: 'Fera blindada nascida das cinzas fumegantes da estepe.', tacticalTip: 'Resfrie sua couraça com Gelo para expor o núcleo.' },
  { kind: 'boss_jade_shogun', name: 'Shogun de Jade', title: 'Guardião do Bambuzal', chapter: 22, weaknessElement: 'flame', maxStagger: 6, accent: '#34d399', lore: 'Espadachim ancestral que defende os santuários ocultos na névoa de jade.', tacticalTip: 'Dê Parry em sua investida de lâmina e puna com Fogo.' },
  { kind: 'boss_fjord_kraken', name: 'Kraken do Fiorde', title: 'Terror Ártico', chapter: 23, weaknessElement: 'flame', maxStagger: 7, accent: '#38bdf8', lore: 'Cefalópode colosal congelado sob geleiras milenares.', tacticalTip: 'Derreta suas barreiras de gelo com habilidades flamejantes.' },
  { kind: 'boss_rust_juggernaut', name: 'Juggernaut da Ferrugem', title: 'Fornalha Blindada', chapter: 24, weaknessElement: 'volt', maxStagger: 7, accent: '#f97316', lore: 'Máquina de cerco a vapor que esmaga intrusos com pistões gigantes.', tacticalTip: 'Sobrecarregue seus circuitos com Raio durante os intervalos de vapor.' },
  { kind: 'boss_spore_archon', name: 'Arconte do Pólen', title: 'Monarca da Gruta Dourada', chapter: 25, weaknessElement: 'flame', maxStagger: 6, accent: '#facc15', lore: 'Soberano dos fungos dourados que espalha esporos alucinógenos.', tacticalTip: 'Fogo purifica as nuvens de pólen em segundos.' },
  { kind: 'boss_tempest_roc', name: 'Roca da Tormenta', title: 'Águia dos Relâmpagos', chapter: 26, weaknessElement: 'void', maxStagger: 7, accent: '#60a5fa', lore: 'Ave titânica que cria furacões entre ilhas flutuantes.', tacticalTip: 'Use o Arpão Aéreo e Vazio para puxá-la durante o voo.' },
  { kind: 'boss_obsidian_idol', name: 'Ídolo de Obsidiana', title: 'Divindade do Templo', chapter: 27, weaknessElement: 'frost', maxStagger: 7, accent: '#f59e0b', lore: 'Monólito vivo erguido por civilizações solares esquecidas.', tacticalTip: 'Congele seus pilares solares antes do disparo.' },
  { kind: 'boss_mercury_twin', name: 'Gêmeo de Mercúrio', title: 'Alquimista Líquido', chapter: 28, weaknessElement: 'volt', maxStagger: 7, accent: '#94a3b8', lore: 'Entidade metálica fluida que divide ataques em pares espelhados.', tacticalTip: 'Raio cristaliza o mercúrio líquido permitindo combos longos.' },
  { kind: 'boss_blood_cantor', name: 'Cantor do Rubi', title: 'Maestro Escarlate', chapter: 29, weaknessElement: 'astral', maxStagger: 7, accent: '#f43f5e', lore: 'Regente espectral dos vitrais rubros da catedral profana.', tacticalTip: 'Luz Astral silencia suas notas sônicas.' },
  { kind: 'boss_mirror_queen', name: 'Rainha dos Espelhos', title: 'Soberana das Ilusões', chapter: 30, weaknessElement: 'void', maxStagger: 7, accent: '#e2e8f0', lore: 'Monarca que refrata feixes em paredes espelhadas.', tacticalTip: 'Vazio atravessa os reflexos falsos.' },
  { kind: 'boss_sand_empress', name: 'Imperatriz da Ampulheta', title: 'Senhora do Tempo', chapter: 31, weaknessElement: 'frost', maxStagger: 7, accent: '#fbbf24', lore: 'Regente das areias móveis que rebobina projéteis.', tacticalTip: 'Use Gelo para travar os grãos temporais.' },
  { kind: 'boss_phantom_maestro', name: 'Maestro Fantasma', title: 'Regente da Ópera', chapter: 32, weaknessElement: 'astral', maxStagger: 7, accent: '#e879f9', lore: 'Espírito teatral que derruba lustres em compasso musical.', tacticalTip: 'Desvie do brilho no teto e contra-ataque com Astral.' },
  { kind: 'boss_titan_reaper', name: 'Ceifador do Ossuário', title: 'Senhor dos Titãs', chapter: 33, weaknessElement: 'flame', maxStagger: 8, accent: '#e5e7eb', lore: 'Guardião das costelas colossais de leviatãs antigos.', tacticalTip: 'Fogo reduz rapidamente sua barra de postura.' },
  { kind: 'boss_cloud_monk', name: 'Grande Monge das Nuvens', title: 'Mestre Celeste', chapter: 34, weaknessElement: 'void', maxStagger: 7, accent: '#fef08a', lore: 'Asceta voador que domina correntes de vento ascendentes.', tacticalTip: 'Antecipe seus mergulhos e aplique Vazio.' },
  { kind: 'boss_grid_warden', name: 'Guardião da Matriz', title: 'Sentinela Holográfica', chapter: 35, weaknessElement: 'volt', maxStagger: 8, accent: '#00f5d4', lore: 'Protocolo de defesa digital que projeta grades de laser.', tacticalTip: 'Parry e Raio rompem sua matriz de dados.' },
  { kind: 'boss_amber_matriarch', name: 'Matriarca de Âmbar', title: 'Rainha da Colmeia', chapter: 36, weaknessElement: 'flame', maxStagger: 8, accent: '#f59e0b', lore: 'Imperatriz insetoide protegida por resina cristalizada.', tacticalTip: 'Derreta a resina com ataques de Fogo.' },
  { kind: 'boss_tome_keeper', name: 'Guardião dos Tomos', title: 'Arquivista Infinito', chapter: 37, weaknessElement: 'void', maxStagger: 8, accent: '#818cf8', lore: 'Mago feito de pergaminhos flutuantes e selos arcanos.', tacticalTip: 'Vazio consome seus grimórios protetores.' },
  { kind: 'boss_polarity_lord', name: 'Senhor da Polaridade', title: 'Titã Magnético', chapter: 38, weaknessElement: 'volt', maxStagger: 8, accent: '#a855f7', lore: 'Colosso ferroso que alterna campos de atração e repulsão.', tacticalTip: 'Aproveite a repulsão para ganhar altura e atacar de cima.' },
  { kind: 'boss_prism_angel', name: 'Arcanjo do Prisma', title: 'Luz Refratada', chapter: 39, weaknessElement: 'void', maxStagger: 8, accent: '#f472b6', lore: 'Serafim geométrico que divide feixes em sete cores letais.', tacticalTip: 'Ataques de Vazio anulam sua refração prismática.' },
  { kind: 'boss_nebula_wyrm', name: 'Serpente da Nebulosa', title: 'Dragão Cósmico', chapter: 40, weaknessElement: 'frost', maxStagger: 8, accent: '#c084fc', lore: 'Dragão estelar formado por poeira cósmica e gás ionizado.', tacticalTip: 'Gelo condensa sua forma gasosa e abre janela de stagger.' },
  { kind: 'boss_solar_deity', name: 'Divindade da Coroa Solar', title: 'Avatar Estelar', chapter: 41, weaknessElement: 'frost', maxStagger: 9, accent: '#fde047', lore: 'Essência viva de uma estrela anã em erupção contínua.', tacticalTip: 'Gelo e Esquiva Perfeita são vitais na Fase III.' },
  { kind: 'boss_lunar_empress', name: 'Imperatriz Lunar', title: 'Regente Prateada', chapter: 42, weaknessElement: 'flame', maxStagger: 9, accent: '#e2e8f0', lore: 'Guardiã das crateras prateadas sob gravidade reduzida.', tacticalTip: 'Use a baixa gravidade para encadear golpes aéreos.' },
  { kind: 'boss_paradox_aeon', name: 'Aeon do Paradoxo', title: 'Tecelão Temporal', chapter: 43, weaknessElement: 'astral', maxStagger: 9, accent: '#22d3ee', lore: 'Entidade fora do fluxo linear que invoca ecos do passado.', tacticalTip: 'Luz Astral estabiliza o tempo e paralisa o chefe.' },
  { kind: 'boss_star_admiral', name: 'Almirante Estelar', title: 'Comandante Etéreo', chapter: 44, weaknessElement: 'volt', maxStagger: 9, accent: '#38bdf8', lore: 'Capitão fantasma da frota astral que bombardeia dos céus.', tacticalTip: 'Reflita os disparos de canhão com Dash Parry!' },
  { kind: 'boss_eclipse_herald', name: 'Arauto do Eclipse', title: 'Profeta Carmesim', chapter: 45, weaknessElement: 'astral', maxStagger: 9, accent: '#ef4444', lore: 'Sacerdote que invoca a sombra total da lua sangrenta.', tacticalTip: 'Habilidades Astrais perfuram o manto do eclipse.' },
  { kind: 'boss_singularity_core', name: 'Núcleo da Singularidade', title: 'Horizonte de Eventos', chapter: 46, weaknessElement: 'astral', maxStagger: 9, accent: '#a855f7', lore: 'Estrela colapsada rodeada por cristais orbitais.', tacticalTip: 'Mantenha distância durante a sucção e ataque na recuperação.' },
  { kind: 'boss_seraph_prime', name: 'Serafim Supremo', title: 'Guardião Alado', chapter: 47, weaknessElement: 'void', maxStagger: 10, accent: '#fef08a', lore: 'Comandante de seis asas da cidadela de marfim celestial.', tacticalTip: 'Vazio rompe sua égide dourada.' },
  { kind: 'boss_abyss_king', name: 'Rei do Abismo Profundo', title: 'Monarca das Correntes', chapter: 48, weaknessElement: 'astral', maxStagger: 10, accent: '#f43f5e', lore: 'Tirano aprisionado nas profundezas da realidade partida.', tacticalTip: 'Combine reações elementais para quebrar suas correntes.' },
  { kind: 'boss_eternity_god', name: 'Arquiteto da Eternidade', title: 'Soberano do Ápice', chapter: 49, weaknessElement: 'astral', maxStagger: 12, accent: '#ffd27d', lore: 'A consciência suprema no topo dos 50 mundos de Aethelgard.', tacticalTip: 'Domine Parry, Esquiva Perfeita e Modo Éter para a vitória final!' },
];

export const BESTIARY_MAP: Record<BossEntityKind, BossBestiaryEntry> = Object.fromEntries(
  BESTIARY_ENTRIES.map((b) => [b.kind, b])
) as Record<BossEntityKind, BossBestiaryEntry>;

export const UNDERWORLD_BESTIARY_ENTRIES: BossBestiaryEntry[] = [
  { kind: 'uboss_charon', name: 'Caronte, O Barqueiro', title: 'Guardião do Estige', chapter: 0, weaknessElement: 'volt', maxStagger: 6, accent: '#2dd4bf', lore: 'Navegador imortal que cobra o pedágio das almas nas margens negras.', tacticalTip: 'Raio eletrifica suas águas espectrais.' },
  { kind: 'uboss_hecate', name: 'Hécate Tríplice', title: 'Bruxa de Asfódelo', chapter: 1, weaknessElement: 'astral', maxStagger: 6, accent: '#c084fc', lore: 'Feiticeira de três faces que conjura selos lunares nas sombras.', tacticalTip: 'Luz Astral revela suas projeções reais.' },
  { kind: 'uboss_vulcan_lord', name: 'Forjador de Bronze', title: 'Carcereiro do Tártaro', chapter: 2, weaknessElement: 'frost', maxStagger: 7, accent: '#f59e0b', lore: 'Mestre da bigorna infernal que prende titãs com correntes vivas.', tacticalTip: 'Gelo resfria e racha sua armadura de bronze.' },
  { kind: 'uboss_malphas', name: 'Malphas, O Corvo Ígneo', title: 'Senhor da Caldeira', chapter: 3, weaknessElement: 'frost', maxStagger: 7, accent: '#facc15', lore: 'Demônio alado nascido das chamas amarelas de enxofre.', tacticalTip: 'Gelo e Golpe da Alma [U] interrompem seu mergulho.' },
  { kind: 'uboss_carmilla', name: 'Condessa Carmilla', title: 'Rainha do Aqueduto', chapter: 4, weaknessElement: 'astral', maxStagger: 7, accent: '#f43f5e', lore: 'Soberana vampírica que comanda rios escarlates nas profundezas.', tacticalTip: 'Luz Astral queima sua forma etérea.' },
  { kind: 'uboss_ossuary_king', name: 'Rei do Ossuário', title: 'Monarca das Caveiras', chapter: 5, weaknessElement: 'flame', maxStagger: 7, accent: '#e2e8f0', lore: 'Amálgama de dez mil guerreiros caídos coroados por marfim.', tacticalTip: 'Fogo consome rapidamente seus ossos ressecados.' },
  { kind: 'uboss_cocytus_queen', name: 'Rainha de Cocito', title: 'Imperatriz Glacial', chapter: 6, weaknessElement: 'flame', maxStagger: 8, accent: '#38bdf8', lore: 'Soberana do lago congelado onde o vento corta como navalha.', tacticalTip: 'Fogo derrete seus espelhos de gelo eterno.' },
  { kind: 'uboss_phlegethon', name: 'Dragão de Flegetonte', title: 'Serpente de Fogo', chapter: 7, weaknessElement: 'frost', maxStagger: 8, accent: '#ff5522', lore: 'Leviatã flamejante que nada nas cachoeiras ferventes.', tacticalTip: 'Ataques de Gelo apagam suas escamas incandescentes.' },
  { kind: 'uboss_acheron', name: 'Titã de Aqueronte', title: 'Colosso dos Ventos', chapter: 8, weaknessElement: 'void', maxStagger: 8, accent: '#67e8f9', lore: 'Guardião do desfiladeiro sônico onde nenhuma voz sobrevive.', tacticalTip: 'Vazio absorve as ondas sonoras do titã.' },
  { kind: 'uboss_lethe_siren', name: 'Sereia do Lete', title: 'Tecelã do Esquecimento', chapter: 9, weaknessElement: 'volt', maxStagger: 8, accent: '#a78bfa', lore: 'Entidade melódica que apaga memórias nos labirintos oníricos.', tacticalTip: 'Raio rompe a ilusão e abre janela de stagger.' },
  { kind: 'uboss_banshee_matriarch', name: 'Matriarca Banshee', title: 'Soberana do Lamento', chapter: 10, weaknessElement: 'astral', maxStagger: 9, accent: '#e879f9', lore: 'Espírito cujo pranto estilhaça torres de obsidiana inteiras.', tacticalTip: 'Use Parry e [U] contra suas ondas sônicas.' },
  { kind: 'uboss_iron_torturer', name: 'Carrasco de Ferro', title: 'Carrasco Eterno', chapter: 11, weaknessElement: 'volt', maxStagger: 9, accent: '#94a3b8', lore: 'Executor blindado que empunha pêndulos colossais.', tacticalTip: 'Raio conduz através de sua armadura metálica!' },
  { kind: 'uboss_nurgle_lord', name: 'Arquiduque da Praga', title: 'Senhor do Brejo', chapter: 12, weaknessElement: 'flame', maxStagger: 9, accent: '#a3e635', lore: 'Alquimista corrompido que ferve os pântanos venenosos.', tacticalTip: 'Fogo purifica os esporos tóxicos na hora.' },
  { kind: 'uboss_ashen_sovereign', name: 'Soberano das Cinzas', title: 'Imperador da Necrópole', chapter: 13, weaknessElement: 'frost', maxStagger: 9, accent: '#fb923c', lore: 'Antigo herói consumido pelo abismo que guarda o túmulo real.', tacticalTip: 'Gelo retarda suas investidas flamejantes.' },
  { kind: 'uboss_minotaur_prime', name: 'Astérion Abissal', title: 'Minotauro de Obsidiana', chapter: 14, weaknessElement: 'void', maxStagger: 10, accent: '#c026d3', lore: 'Besta imbatível do centro do labirinto negro.', tacticalTip: 'Vazio distorce seu ritmo de investida!' },
  { kind: 'uboss_stained_seraph', name: 'Serafim dos Vitrais', title: 'Anjo Estilhaçado', chapter: 15, weaknessElement: 'void', maxStagger: 10, accent: '#fb7185', lore: 'Anjo caído feito de vitrais carmesins e vidro afiado.', tacticalTip: 'Vazio perfura sua guarda prismática.' },
  { kind: 'uboss_erebus', name: 'Érebo Primordial', title: 'Senhor da Escuridão', chapter: 16, weaknessElement: 'astral', maxStagger: 10, accent: '#6366f1', lore: 'Sombra consciente nascida antes da própria luz.', tacticalTip: 'Luz Astral e [U] dissolvem seu véu escuro.' },
  { kind: 'uboss_caldera_wyrm', name: 'Wyrm do Núcleo', title: 'Dragão do Magma', chapter: 17, weaknessElement: 'frost', maxStagger: 11, accent: '#ef4444', lore: 'Coração dracônico que aquece todas as profundezas do submundo.', tacticalTip: 'Gelo e reações elementais quebram suas escamas.' },
  { kind: 'uboss_null_architect', name: 'Arquiteto do Nulo', title: 'Guardião do Portal', chapter: 18, weaknessElement: 'astral', maxStagger: 11, accent: '#22d3ee', lore: 'Entidade geométrica que controla a gravidade na fronteira final.', tacticalTip: 'Domine a inversão gravitacional e [U]!' },
  { kind: 'uboss_lucifer_apex', name: 'Senhor de Pandemônio', title: 'Imperador do Submundo', chapter: 19, weaknessElement: 'astral', maxStagger: 13, accent: '#ff2e63', lore: 'O governante absoluto dos 20 círculos sob o Sol Negro.', tacticalTip: 'Use Parry, Golpe da Alma [U] e Modo Éter ao máximo!' },
];

export const UNDERWORLD_BESTIARY_MAP: Record<UnderworldBossKind, BossBestiaryEntry> = Object.fromEntries(
  UNDERWORLD_BESTIARY_ENTRIES.map((b) => [b.kind, b])
) as Record<UnderworldBossKind, BossBestiaryEntry>;

export function getAnyBossBestiary(kind: string): BossBestiaryEntry | null {
  if (kind in BESTIARY_MAP) return BESTIARY_MAP[kind as BossEntityKind];
  if (kind in UNDERWORLD_BESTIARY_MAP) return UNDERWORLD_BESTIARY_MAP[kind as UnderworldBossKind];
  return null;
}

// ============================================================================
// 14. JUKEBOX DO SANTUÁRIO (8 TEMAS SINTÉTICOS DE BIOMA & CHEFÕES)
// ============================================================================
export const JUKEBOX_TRACKS: JukeboxTrackDef[] = [
  { id: 'cinzas_tema', name: 'Ecos das Cinzas', subtitle: 'Tema Melancólico do Capítulo 1', bpm: 92, scale: [220, 261.63, 293.66, 329.63, 392, 440], color: '#e8a87c' },
  { id: 'micelio_danca', name: 'Esporos Neon', subtitle: 'Cavernas Bioluminescentes', bpm: 108, scale: [246.94, 293.66, 369.99, 440, 493.88, 587.33], color: '#4df0c0' },
  { id: 'forja_furia', name: 'Coração da Forja', subtitle: 'Batalha Pesada de Obsidiana', bpm: 132, scale: [146.83, 174.61, 220, 261.63, 293.66, 349.23], color: '#ff6622' },
  { id: 'sakura_vento', name: 'Pétalas ao Vento', subtitle: 'Santificação Carmesim', bpm: 116, scale: [261.63, 293.66, 329.63, 392, 440, 523.25], color: '#ff88b8' },
  { id: 'crono_engrenagem', name: 'Relógio Celestial', subtitle: 'Torre das Engrenagens', bpm: 124, scale: [220, 246.94, 329.63, 392, 440, 493.88], color: '#fbbf24' },
  { id: 'vazio_astral', name: 'Horizonte Sideral', subtitle: 'Mistério do Vazio Profundo', bpm: 98, scale: [196, 233.08, 293.66, 349.23, 392, 466.16], color: '#c084fc' },
  { id: 'boss_duelo', name: 'Coroa em Chamas', subtitle: 'Tema Épico de Duelo contra Chefões', bpm: 144, scale: [164.81, 196, 246.94, 293.66, 329.63, 392], color: '#ff4d7d' },
  { id: 'pinaculo_final', name: 'Soberano do Pináculo', subtitle: 'Clímax Supremo de Aethelgard', bpm: 152, scale: [220, 261.63, 329.63, 440, 523.25, 659.25], color: '#ffe066' },
];

// ============================================================================
// 15. FÍSICA DE MOVIMENTAÇÃO PRÁTICA & INTELIGENTE DE CHEFÕES (UNIT-TESTABLE)
// ============================================================================
export interface BossAnchorInput {
  homeX: number;
  homeY: number;
  playerX: number;
  playerY: number;
  roomWidth: number;
  roomHeight: number;
  phase: 1 | 2 | 3;
  time: number;
  preferredDist?: number;
  bobAmplitude?: number;
}

export function computeBossDesiredAnchor(inp: BossAnchorInput): { x: number; y: number } {
  const minX = 28;
  const maxX = Math.max(minX + 32, inp.roomWidth - 28);
  const minY = 26;
  // Keep boss cleanly above floor hazard pits yet always reachable by platform/dash/jump
  const maxY = Math.max(minY + 24, inp.roomHeight - 40);

  const prefDist = inp.preferredDist ?? (inp.phase === 3 ? 64 : inp.phase === 2 ? 78 : 90);
  const side = inp.playerX >= inp.homeX ? -1 : 1;
  // Gentle figure-8 sweep around tactical flank relative to player & arena center
  const centerBiasX = inp.roomWidth * 0.5;
  const orbitOffset = Math.sin(inp.time * (1.1 + inp.phase * 0.25)) * 22;
  const desiredRawX = inp.playerX + side * prefDist + orbitOffset;
  const blendedX = desiredRawX * 0.65 + centerBiasX * 0.35;

  const bobAmp = inp.bobAmplitude ?? 14;
  // Track player elevation softly without hugging out-of-reach ceiling corners
  const targetYRaw = inp.playerY - 26 + Math.cos(inp.time * 1.45) * bobAmp;

  return {
    x: Math.max(minX, Math.min(maxX, blendedX)),
    y: Math.max(minY, Math.min(maxY, targetYRaw)),
  };
}

export function stepSmoothVelocity(
  curX: number,
  curY: number,
  vx: number,
  vy: number,
  targetX: number,
  targetY: number,
  dt: number,
  accel = 280,
  damping = 5.5,
  maxSpeed = 145
): { x: number; y: number; vx: number; vy: number } {
  const dx = targetX - curX;
  const dy = targetY - curY;
  const dist = Math.hypot(dx, dy);
  let nvx = vx;
  let nvy = vy;

  if (dist > 1.5) {
    const dirX = dx / dist;
    const dirY = dy / dist;
    const pull = Math.min(1, dist / 24);
    nvx += dirX * accel * pull * dt;
    nvy += dirY * accel * pull * dt;
  }

  const damp = Math.exp(-damping * dt);
  nvx *= damp;
  nvy *= damp;

  const speed = Math.hypot(nvx, nvy);
  if (speed > maxSpeed) {
    nvx = (nvx / speed) * maxSpeed;
    nvy = (nvy / speed) * maxSpeed;
  }

  return {
    x: curX + nvx * dt,
    y: curY + nvy * dt,
    vx: nvx,
    vy: nvy,
  };
}

export function chooseSafeRetreatPoint(
  playerX: number,
  playerY: number,
  curX: number,
  roomWidth: number,
  roomHeight: number
): { x: number; y: number } {
  const minX = 34;
  const maxX = Math.max(minX + 40, roomWidth - 34);
  const centerX = roomWidth * 0.5;
  // Jump gracefully to the clear open flank away from the player (always inside playable bounds)
  const targetX = playerX < centerX ? maxX - 18 : minX + 18;
  // Ensure noticeable lateral displacement even if already near boundary
  const finalX =
    Math.abs(targetX - curX) < 56
      ? curX < centerX
        ? Math.min(maxX, curX + 96)
        : Math.max(minX, curX - 96)
      : targetX;
  const minY = 34;
  const maxY = Math.max(minY + 20, roomHeight - 46);
  const idealY = Math.max(minY, Math.min(maxY, Math.min(playerY - 22, roomHeight * 0.48)));
  return { x: finalX, y: idealY };
}

export function computeBossPhaseStats(hp: number, maxHp: number): {
  phase: 1 | 2 | 3;
  speedMult: number;
  cooldownMult: number;
} {
  const ratio = maxHp > 0 ? hp / maxHp : 1;
  if (ratio <= 0.35) {
    return { phase: 3, speedMult: 1.32, cooldownMult: 0.72 };
  }
  if (ratio <= 0.68) {
    return { phase: 2, speedMult: 1.16, cooldownMult: 0.86 };
  }
  return { phase: 1, speedMult: 1.0, cooldownMult: 1.0 };
}

// ============================================================================
// 16. CÁLCULO DE RECOMPENSAS & ESTRELAS DA TELA DE VITÓRIA (UNIT-TESTABLE)
// ============================================================================
export interface VictoryRewardInput {
  elapsedSeconds: number;
  deaths: number;
  relicsCollected: number;
  totalRelics: number;
  styleRank: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
  styleScore: number;
  chapterIndex: number;
  isBossRush?: boolean;
  isFinalVictory?: boolean;
}

export interface VictoryCommendation {
  id: string;
  label: string;
  color: string;
}

export interface VictoryStarCriterion {
  id: 'clear' | 'precision' | 'relics_style';
  label: string;
  achieved: boolean;
  detail: string;
}

export interface VictoryRewardSummary {
  stars: 1 | 2 | 3;
  gradeLabel: string;
  gradeColor: string;
  masteryXp: number;
  bonusCoins: number;
  commendations: VictoryCommendation[];
  starCriteria: VictoryStarCriterion[];
}

export function computeVictoryRewards(inp: VictoryRewardInput): VictoryRewardSummary {
  const safeTotalRelics = Math.max(0, inp.totalRelics);
  const relicRatio = safeTotalRelics > 0 ? inp.relicsCollected / safeTotalRelics : 1;
  const highStyle = inp.styleRank === 'SS' || inp.styleRank === 'S' || inp.styleRank === 'A';
  const targetTime = inp.isBossRush ? 180 : 120 + Math.min(60, inp.chapterIndex * 4);
  const fastClear = inp.elapsedSeconds > 0 && inp.elapsedSeconds <= targetTime;
  const precisionAchieved = inp.deaths <= 2 || fastClear;
  const masteryAchieved = relicRatio >= 0.75 || highStyle || Boolean(inp.isFinalVictory);

  let starScore = 1;
  if (inp.deaths <= 2 || relicRatio >= 0.5 || highStyle) {
    starScore = 2;
  }
  if ((inp.deaths === 0 || fastClear) && masteryAchieved) {
    starScore = 3;
  }

  const stars = Math.max(1, Math.min(3, starScore)) as 1 | 2 | 3;
  const starCriteria: VictoryStarCriterion[] = [
    {
      id: 'clear',
      label: inp.isFinalVictory ? 'Pináculo Conquistado' : 'Etapa Concluída',
      achieved: true,
      detail: inp.isBossRush ? 'Guardiões vencidos' : 'Prisma purificado',
    },
    {
      id: 'precision',
      label: 'Precisão & Tempo',
      achieved: precisionAchieved,
      detail:
        inp.deaths === 0
          ? 'Impecável (0 mortes)'
          : fastClear
            ? `${Math.round(inp.elapsedSeconds)}s ≤ meta ${targetTime}s`
            : `${inp.deaths} mortes (meta ≤ 2)`,
    },
    {
      id: 'relics_style',
      label: 'Relíquias & Estilo',
      achieved: masteryAchieved,
      detail:
        safeTotalRelics > 0
          ? `${inp.relicsCollected}/${safeTotalRelics} · Rank ${inp.styleRank}`
          : `Estilo Rank ${inp.styleRank}`,
    },
  ];

  const commendations: VictoryCommendation[] = [];
  if (inp.deaths === 0) {
    commendations.push({ id: 'flawless', label: 'Impecável (0 Mortes)', color: '#4df0c0' });
  }
  if (safeTotalRelics > 0 && inp.relicsCollected >= safeTotalRelics) {
    commendations.push({ id: 'all_relics', label: 'Relíquias 100%', color: '#ff70a6' });
  }
  if (fastClear) {
    commendations.push({ id: 'speedster', label: 'Velocista Astral', color: '#52e5ff' });
  }
  if (inp.styleRank === 'SS' || inp.styleRank === 'S') {
    commendations.push({ id: 'maestro', label: `Estilo Rank ${inp.styleRank}`, color: '#ffe066' });
  }
  if (commendations.length === 0) {
    commendations.push({ id: 'conqueror', label: 'Desbravador', color: '#e8a87c' });
  }

  const gradeMap: Record<1 | 2 | 3, { label: string; color: string }> = {
    1: { label: 'TRIUNFO', color: '#e8a87c' },
    2: { label: 'GLÓRIA ASTRAL', color: '#52e5ff' },
    3: { label: 'VITÓRIA LENDÁRIA', color: '#ffe066' },
  };

  const masteryXp = (inp.isFinalVictory ? 85 : 65) + stars * 15 + commendations.length * 10;
  const bonusCoins = (inp.isFinalVictory ? 6 : 3) + stars * 2 + (inp.deaths === 0 ? 2 : 0);

  return {
    stars,
    gradeLabel: gradeMap[stars].label,
    gradeColor: gradeMap[stars].color,
    masteryXp,
    bonusCoins,
    commendations: commendations.slice(0, 3),
    starCriteria,
  };
}

// ============================================================================
// 17. RESUMO TÁTICO DA TELA DE DERROTA (UNIT-TESTABLE)
// ============================================================================
export interface DefeatSummaryInput {
  playMode: PlayModeId;
  bossName: string | null;
  bossHp: number | null;
  bossMaxHp: number | null;
  bossWeakness: ElementType | null;
  survivalWave: number;
  survivalKills: number;
  bestSurvivalWave: number;
  towerFloor?: number;
  bestTowerFloor?: number;
  stageNumber: number;
  totalStagesInChapter: number;
  perfectDodges: number;
  totalParries: number;
  hardcoreGameOver: boolean;
}

export interface DefeatSummary {
  headline: string;
  subtitle: string;
  modeBadge: string;
  bossRemainingPct: number | null;
  bossAccent: string | null;
  bestiaryTip: string | null;
  tacticalTip: string;
  isNewWaveRecord: boolean;
  isNewTowerRecord: boolean;
  stageProgressPct: number;
}

export function computeDefeatSummary(inp: DefeatSummaryInput): DefeatSummary {
  const safeStages = Math.max(1, inp.totalStagesInChapter);
  const stageProgressPct = Math.max(5, Math.min(100, Math.round((inp.stageNumber / safeStages) * 100)));
  const hasBoss = inp.bossHp !== null && inp.bossMaxHp !== null && inp.bossMaxHp > 0;
  const bossRemainingPct = hasBoss
    ? Math.max(0, Math.min(100, Math.round((inp.bossHp! / inp.bossMaxHp!) * 100)))
    : null;
  const normBossName = inp.bossName ? inp.bossName.trim().toLowerCase() : '';
  const bestiaryEntry = normBossName
    ? BESTIARY_ENTRIES.find(
        (b) =>
          b.name.toLowerCase() === normBossName ||
          (BOSS_META[b.kind]?.name ?? '').toLowerCase() === normBossName
      ) ?? null
    : null;
  const bestiaryTip = bestiaryEntry?.tacticalTip ?? null;
  const bossAccent = bestiaryEntry?.accent ?? (hasBoss ? '#ff5c77' : null);

  if (inp.playMode === 'tower') {
    const floor = Math.max(1, inp.towerFloor ?? 1);
    const best = Math.max(floor, inp.bestTowerFloor ?? floor);
    const isNewTowerRecord = floor > 1 && floor >= best;
    const tacticalTip =
      floor % 5 === 0
        ? bestiaryTip ?? 'Andares múltiplos de 5 abrigam Guardiões! Use [Q], cipós e sua Dupla [F].'
        : 'Segure [C] perto dos cipós celestes para ganhar impulso vertical e economizar seu Dash!';
    return {
      headline: 'ESCALADA ENCERRADA',
      subtitle: hasBoss
        ? `Caiu no Andar ${floor} diante de ${inp.bossName ?? 'Guardião'} (${bossRemainingPct}% HP).`
        : `Alcançou o Andar ${floor} da Torre do Éter!`,
      modeBadge: 'TORRE INFINITA',
      bossRemainingPct,
      bossAccent,
      bestiaryTip,
      tacticalTip,
      isNewWaveRecord: false,
      isNewTowerRecord,
      stageProgressPct,
    };
  }

  if (inp.playMode === 'survival') {
    const isNewWaveRecord = inp.survivalWave > 0 && inp.survivalWave >= inp.bestSurvivalWave;
    const tacticalTip =
      inp.survivalWave <= 2
        ? 'Use Dash no último instante para Esquiva Perfeita e carregue [Q] contra hordas.'
        : 'Alterne Heróis [F] para detonar Reações Elementais x2 e recupere fôlego nos intervalos.';
    return {
      headline: 'ARENA ENCERRADA',
      subtitle: `Resistiu até a Onda ${inp.survivalWave} com ${inp.survivalKills} abates.`,
      modeBadge: 'COLISEU INFINITO',
      bossRemainingPct,
      bossAccent,
      bestiaryTip,
      tacticalTip,
      isNewWaveRecord,
      isNewTowerRecord: false,
      stageProgressPct,
    };
  }

  if (inp.playMode === 'boss_rush') {
    return {
      headline: 'RUSH INTERROMPIDO',
      subtitle: hasBoss
        ? `Caiu diante de ${inp.bossName ?? 'Guardião'} (${bossRemainingPct}% HP restante).`
        : 'A sequência contra os Guardiões foi interrompida.',
      modeBadge: 'RUSH DE CHEFÕES',
      bossRemainingPct,
      bossAccent,
      bestiaryTip,
      tacticalTip:
        bestiaryTip ??
        'Explore o elemento de fraqueza do Guardião com ataques [Q] e Parry [X] em projéteis.',
      isNewWaveRecord: false,
      isNewTowerRecord: false,
      stageProgressPct,
    };
  }

  const headline = inp.hardcoreGameOver ? 'QUEDA IRONMAN' : 'QUEDA NO ABISMO';
  const modeBadge = inp.hardcoreGameOver ? 'DESAFIO 1 VIDA' : 'ESCALADA INTERROMPIDA';
  const subtitle = hasBoss
    ? `Derrotado por ${inp.bossName ?? 'Guardião'} com ${bossRemainingPct}% de vida restante.`
    : `Etapa ${inp.stageNumber}/${safeStages} — A montanha exige precisão implacável.`;

  let tacticalTip = bestiaryTip;
  if (!tacticalTip) {
    if (inp.perfectDodges === 0 && inp.totalParries === 0) {
      tacticalTip =
        'Dê Dash [X] no momento exato do perigo para ativar Esquiva Perfeita e carregar Éter.';
    } else {
      tacticalTip =
        'Alterne sua Dupla [F] para combinar elementos ou visite o Santuário [G] para equipar Runas.';
    }
  }

  return {
    headline,
    subtitle,
    modeBadge,
    bossRemainingPct,
    bossAccent,
    bestiaryTip,
    tacticalTip,
    isNewWaveRecord: false,
    isNewTowerRecord: false,
    stageProgressPct,
  };
}

// ============================================================================
// 18. SISTEMA DE NÍVEL & PROGRESSÃO DE EXPERIÊNCIA DO JOGADOR
// ============================================================================
export const PLAYER_MAX_LEVEL = 50;

export function getXpRequiredForLevel(level: number): number {
  const safeLv = Math.max(1, Math.min(PLAYER_MAX_LEVEL, Math.floor(level)));
  return Math.round(45 + (safeLv - 1) * 32 + Math.pow(safeLv - 1, 1.4) * 14);
}

export interface PlayerLevelProgress {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressRatio: number;
}

export function getLevelProgressFromXp(rawXp: number): PlayerLevelProgress {
  const totalXp = Math.max(0, Math.floor(rawXp || 0));
  let level = 1;
  let remaining = totalXp;
  while (level < PLAYER_MAX_LEVEL) {
    const req = getXpRequiredForLevel(level);
    if (remaining < req) {
      return {
        level,
        totalXp,
        currentLevelXp: remaining,
        nextLevelXp: req,
        progressRatio: Math.max(0, Math.min(1, remaining / req)),
      };
    }
    remaining -= req;
    level += 1;
  }
  const capReq = getXpRequiredForLevel(PLAYER_MAX_LEVEL);
  return {
    level: PLAYER_MAX_LEVEL,
    totalXp,
    currentLevelXp: capReq,
    nextLevelXp: capReq,
    progressRatio: 1,
  };
}

export interface PlayerLevelBonuses {
  speedMult: number;
  skillCdMult: number;
  staminaMult: number;
  coinBonusFlat: number;
}

export function getPlayerLevelBonuses(level: number): PlayerLevelBonuses {
  const lv = Math.max(1, Math.min(PLAYER_MAX_LEVEL, Math.floor(level)));
  const gains = lv - 1;
  return {
    speedMult: 1 + Math.min(0.14, gains * 0.006),
    skillCdMult: Math.max(0.78, 1 - gains * 0.008),
    staminaMult: 1 + Math.min(0.28, gains * 0.012),
    coinBonusFlat: Math.floor(gains / 5),
  };
}



