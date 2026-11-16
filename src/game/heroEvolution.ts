// @ts-nocheck -- imported game code
import { MaterialId } from './crafting';
import { getHeroDef, HeroId } from './heroes';

export type EvolutionTier = 0 | 1 | 2 | 3;

export interface HeroEvolutionSkillDef {
  tier: 1 | 2 | 3;
  name: string;
  trigger: 'Passiva' | 'Reativa' | 'Suprema';
  desc: string;
}

export interface HeroEvolutionBonuses {
  tier: EvolutionTier;
  tierLabel: string;
  attackBonus: number;
  speedMult: number;
  staminaMult: number;
  skillCdMult: number;
  extraAirJump: number;
  extraAirDash: number;
  crownColor: string;
  auraColor: string;
  wingStyle: 'none' | 'crest' | 'wings' | 'seraph_halo';
  skills: HeroEvolutionSkillDef[];
}

export interface EvolutionRequirement {
  targetTier: 1 | 2 | 3;
  coins: number;
  materials: { id: MaterialId; qty: number }[];
  minPlayerLevel: number;
}

export const EVOLUTION_REQUIREMENTS: Record<1 | 2 | 3, EvolutionRequirement> = {
  1: {
    targetTier: 1,
    coins: 15,
    materials: [
      { id: 'pedra_evolucao', qty: 1 },
      { id: 'cristal_biolum', qty: 4 },
    ],
    minPlayerLevel: 1,
  },
  2: {
    targetTier: 2,
    coins: 35,
    materials: [
      { id: 'pedra_evolucao', qty: 2 },
      { id: 'essencia_solar', qty: 4 },
      { id: 'essencia_sombria', qty: 4 },
    ],
    minPlayerLevel: 3,
  },
  3: {
    targetTier: 3,
    coins: 75,
    materials: [
      { id: 'pedra_evolucao', qty: 3 },
      { id: 'nucleo_guardiao', qty: 2 },
      { id: 'minerio_eter', qty: 4 },
    ],
    minPlayerLevel: 6,
  },
};

export const EVOLUTION_TIER_NAMES: Record<EvolutionTier, string> = {
  0: 'Forma Base',
  1: 'Estágio I · Despertar',
  2: 'Estágio II · Ascensão',
  3: 'Estágio III · Apoteose',
};

/** Computes stat boosts, visual transformations, and up to 3 new evolution skills for any HeroId + Tier (0..3). */
export function getHeroEvolutionData(heroId: HeroId, rawTier: number): HeroEvolutionBonuses {
  const tier = Math.max(0, Math.min(3, Math.floor(rawTier))) as EvolutionTier;
  const hero = getHeroDef(heroId);
  const elem = hero.element ?? 'astral';

  const elemSkillNames: Record<string, [string, string, string]> = {
    wind: ['Lâminas do Zéfiro', 'Vórtice Ascendente', 'Fúria do Furacão Astral'],
    fire: ['Brasa Perpétua', 'Manto de Magma', 'Supernova Solar'],
    ice: ['Cristais Cortantes', 'Armadura Boreal', 'Zero Absoluto Cósmico'],
    lightning: ['Centelha de Passo', 'Campo Voltaico', 'Juízo do Trovão Eterno'],
    shadow: ['Passo do Crepúsculo', 'Espelho Espectral', 'Eclipse Devorador'],
    light: ['Brilho Restaurador', 'Égide Seráfica', 'Juízo da Aurora Dourada'],
    earth: ['Vigor da Montanha', 'Pele de Basalto', 'Impacto Telúrico'],
    astral: ['Eco Estelar', 'Anel Prismático', 'Apoteose Cósmica'],
  };
  const [s1, s2, s3] = elemSkillNames[elem] ?? elemSkillNames.astral;

  const allSkills: HeroEvolutionSkillDef[] = [
    {
      tier: 1,
      name: `${s1} (${hero.name})`,
      trigger: 'Passiva',
      desc: `+15% Velocidade/Vigor, +1 Ataque base e ombreiras luminosas de ${hero.archetype}.`,
    },
    {
      tier: 2,
      name: `${s2}`,
      trigger: 'Reativa',
      desc: '+1 Pulo Aéreo extra, -15% recarga de [Q], +2 Ataque e manifesta Asas Elementais épicas.',
    },
    {
      tier: 3,
      name: `${s3}`,
      trigger: 'Suprema',
      desc: '+1 Dash Aéreo extra, +3 Ataque, [Q] dispara 2 projéteis orbitais extras e Forma Coroada Transcendente.',
    },
  ];

  const unlockedSkills = allSkills.filter((s) => s.tier <= tier);

  const crownColor =
    tier === 3 ? '#ffe066' : tier === 2 ? hero.accentColor : hero.secondaryColor;
  const auraColor = tier === 3 ? '#ffd27d' : hero.accentColor;

  return {
    tier,
    tierLabel: EVOLUTION_TIER_NAMES[tier],
    attackBonus: tier === 0 ? 0 : tier === 1 ? 1 : tier === 2 ? 2 : 4,
    speedMult: tier === 0 ? 1 : tier === 1 ? 1.12 : tier === 2 ? 1.22 : 1.34,
    staminaMult: tier === 0 ? 1 : tier === 1 ? 1.15 : tier === 2 ? 1.28 : 1.45,
    skillCdMult: tier === 0 ? 1 : tier === 1 ? 0.92 : tier === 2 ? 0.84 : 0.74,
    extraAirJump: tier >= 2 ? 1 : 0,
    extraAirDash: tier >= 3 ? 1 : 0,
    crownColor,
    auraColor,
    wingStyle: tier === 0 ? 'none' : tier === 1 ? 'crest' : tier === 2 ? 'wings' : 'seraph_halo',
    skills: unlockedSkills,
  };
}

export function canEvolveHero(
  currentTier: number,
  coins: number,
  materials: Record<string, number>,
  playerLevel: number
): { canEvolve: boolean; reason?: string; req?: EvolutionRequirement } {
  if (currentTier >= 3) {
    return { canEvolve: false, reason: 'Evolução Máxima (3/3) atingida!' };
  }
  const target = (currentTier + 1) as 1 | 2 | 3;
  const req = EVOLUTION_REQUIREMENTS[target];
  if (playerLevel < req.minPlayerLevel) {
    return { canEvolve: false, reason: `Requer Nível ${req.minPlayerLevel} da conta.`, req };
  }
  if (coins < req.coins) {
    return { canEvolve: false, reason: `Requer ${req.coins} Moedas Astrais.`, req };
  }
  for (const m of req.materials) {
    if ((materials[m.id] ?? 0) < m.qty) {
      return { canEvolve: false, reason: `Faltam materiais (${m.id}).`, req };
    }
  }
  return { canEvolve: true, req };
}
