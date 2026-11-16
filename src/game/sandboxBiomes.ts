// @ts-nocheck -- imported game code
import type { AnyBiomeId } from './types';

export const SANDBOX_COLS = 4800;
export const SANDBOX_ROWS = 640;
export const SANDBOX_SECTOR_TILE_SIZE = 40;
export const SANDBOX_SECTOR_COLS = SANDBOX_COLS / SANDBOX_SECTOR_TILE_SIZE; // 120
export const SANDBOX_SECTOR_ROWS = SANDBOX_ROWS / SANDBOX_SECTOR_TILE_SIZE; // 16
export const SANDBOX_TOTAL_SECTORS = SANDBOX_SECTOR_COLS * SANDBOX_SECTOR_ROWS; // 1920

export type SandboxBiomeId =
  | 'ocean_west'
  | 'ancient_dungeon'
  | 'tundra'
  | 'jade_bamboo'
  | 'crimson_sakura'
  | 'forest'
  | 'desert'
  | 'jungle'
  | 'clockwork_city'
  | 'crimson_canyon'
  | 'twilight_garden'
  | 'obsidian_temple'
  | 'abyss_surface'
  | 'ocean_east'
  | 'sky_islands'
  | 'cloud_monastery'
  | 'aurora_sky'
  | 'caverns'
  | 'sunken_cathedral'
  | 'bone_catacombs'
  | 'alchemical_caves'
  | 'underworld'
  | 'magma_core'
  | 'pandemonium_citadel';

export interface SandboxRegionDef {
  id: SandboxBiomeId;
  minTx: number;
  maxTx: number;
  label: string;
  subtitle: string;
  color: string;
  campaignBiome: AnyBiomeId;
  dangerTier: number;
}

/** 14 Seamless Interconnected Horizontal Surface Regions across 4800 columns */
export const SANDBOX_SURFACE_REGIONS: SandboxRegionDef[] = [
  {
    id: 'ocean_west',
    minTx: 0,
    maxTx: 160,
    label: 'Porto Estelar Oeste',
    subtitle: 'Dunas marítimas, farol antigo e enseada submersa',
    color: '#38bdf8',
    campaignBiome: 'starlight_harbor',
    dangerTier: 1,
  },
  {
    id: 'ancient_dungeon',
    minTx: 160,
    maxTx: 440,
    label: 'Masmorra & Cripta Ametista',
    subtitle: 'Torre arruinada descendo às catacumbas antigas',
    color: '#818cf8',
    campaignBiome: 'amethyst_crypt',
    dangerTier: 2,
  },
  {
    id: 'tundra',
    minTx: 440,
    maxTx: 780,
    label: 'Fiorde Glacial Safira',
    subtitle: 'Geleiras escorregadias, prismas boreais e cavernas de gelo',
    color: '#7ce8ff',
    campaignBiome: 'frostglass',
    dangerTier: 2,
  },
  {
    id: 'jade_bamboo',
    minTx: 780,
    maxTx: 1140,
    label: 'Bosque de Bambu Jade',
    subtitle: 'Penhascos esmeralda, cachoeiras e plataformas suspensas',
    color: '#34d399',
    campaignBiome: 'jade_bamboo',
    dangerTier: 1,
  },
  {
    id: 'crimson_sakura',
    minTx: 1140,
    maxTx: 1480,
    label: 'Santuário Sakura Carmesim',
    subtitle: 'Portais Torii, cerejeiras e templos ancestrais',
    color: '#f472b6',
    campaignBiome: 'crimson_sakura',
    dangerTier: 1,
  },
  {
    id: 'forest',
    minTx: 1480,
    maxTx: 1880,
    label: 'Vale de Aethelgard (Base)',
    subtitle: 'Coração verdejante com acampamento, forjas e oficinas',
    color: '#4df0c0',
    campaignBiome: 'silver_ash',
    dangerTier: 1,
  },
  {
    id: 'desert',
    minTx: 1880,
    maxTx: 2260,
    label: 'Miragem Solar & Pirâmide',
    subtitle: 'Dunas douradas, labirinto interno e câmara secreta',
    color: '#fbbf24',
    campaignBiome: 'solar_mirage',
    dangerTier: 2,
  },
  {
    id: 'jungle',
    minTx: 2260,
    maxTx: 2640,
    label: 'Selva Bioluminescente',
    subtitle: 'Micélio brilhante, cogumelos elásticos e poços profundos',
    color: '#2dd4bf',
    campaignBiome: 'bioluminescent',
    dangerTier: 2,
  },
  {
    id: 'clockwork_city',
    minTx: 2640,
    maxTx: 3020,
    label: 'Torre do Relógio & Subcidade',
    subtitle: 'Engrenagens colossais, esteiras mecânicas e cofres oníricos',
    color: '#22d3ee',
    campaignBiome: 'clockwork_spire',
    dangerTier: 3,
  },
  {
    id: 'crimson_canyon',
    minTx: 3020,
    maxTx: 3380,
    label: 'Desfiladeiro Carmesim',
    subtitle: 'Cânions rubros, pontes metálicas e poços de minério',
    color: '#fb923c',
    campaignBiome: 'crimson_canyon',
    dangerTier: 3,
  },
  {
    id: 'twilight_garden',
    minTx: 3380,
    maxTx: 3760,
    label: 'Jardim Crepuscular',
    subtitle: 'Salgueiros etéreos, blocos oníricos e estelas arcanas',
    color: '#e879f9',
    campaignBiome: 'twilight_garden',
    dangerTier: 3,
  },
  {
    id: 'obsidian_temple',
    minTx: 3760,
    maxTx: 4140,
    label: 'Templo de Obsidiana',
    subtitle: 'Monolitos vulcânicos, cristais de dash e relíquias antigas',
    color: '#a855f7',
    campaignBiome: 'obsidian_temple',
    dangerTier: 4,
  },
  {
    id: 'abyss_surface',
    minTx: 4140,
    maxTx: 4520,
    label: 'Abismo do Eclipse Rubro',
    subtitle: 'Espinhaço corrompido com fendas do vazio e altares',
    color: '#f43f5e',
    campaignBiome: 'blood_eclipse',
    dangerTier: 4,
  },
  {
    id: 'ocean_east',
    minTx: 4520,
    maxTx: 4800,
    label: 'Abismo de Corais Leste',
    subtitle: 'Lagoas luminosas, recifes e farol do horizonte oriental',
    color: '#fb7185',
    campaignBiome: 'coral_abyss',
    dangerTier: 3,
  },
];

export interface SandboxBiomeInfo {
  id: SandboxBiomeId;
  label: string;
  subtitle: string;
  color: string;
  campaignBiome: AnyBiomeId;
  dangerTier: number;
}

export function getSandboxSurfaceRegion(tx: number): SandboxRegionDef {
  const cx = Math.max(0, Math.min(SANDBOX_COLS - 1, tx));
  for (let i = 0; i < SANDBOX_SURFACE_REGIONS.length; i++) {
    const r = SANDBOX_SURFACE_REGIONS[i];
    if (cx >= r.minTx && cx < r.maxTx) return r;
  }
  return SANDBOX_SURFACE_REGIONS[SANDBOX_SURFACE_REGIONS.length - 1];
}

export function getSandboxBiomeAt(tx: number, ty: number): SandboxBiomeInfo {
  const cx = Math.max(0, Math.min(SANDBOX_COLS - 1, Math.floor(tx)));
  const cy = Math.max(0, Math.min(SANDBOX_ROWS - 1, Math.floor(ty)));

  // Vertical Stratum 1: Sky Archipelago & Cloud Monasteries (ty < 145)
  if (cy < 145) {
    if (cx < 1400) {
      return {
        id: 'aurora_sky',
        label: 'Zênite da Aurora Celeste',
        subtitle: 'Ilhas flutuantes sob auroras polares e ventos ascendentes',
        color: '#7ce8ff',
        campaignBiome: 'aurora_zenith',
        dangerTier: 2,
      };
    }
    if (cx < 3100) {
      return {
        id: 'sky_islands',
        label: 'Arquipélago Esmeralda Celeste',
        subtitle: 'Nuvens elásticas, cristais de dash e santuários aéreos',
        color: '#5eead4',
        campaignBiome: 'emerald_sky',
        dangerTier: 2,
      };
    }
    return {
      id: 'cloud_monastery',
      label: 'Monastério das Nuvens',
      subtitle: 'Templos celestes conectados por nuvens e sinos de vento',
      color: '#fde047',
      campaignBiome: 'cloud_monastery',
      dangerTier: 3,
    };
  }

  // Vertical Stratum 4: Deep Underworld & Magma Core (ty >= 490)
  if (cy >= 490) {
    if (cx < 1550) {
      return {
        id: 'underworld',
        label: 'Margens do Estige Profundo',
        subtitle: 'Cavernas infernais ocidentais com águas sombrias e obsidiana',
        color: '#2dd4bf',
        campaignBiome: 'styx_ferry',
        dangerTier: 4,
      };
    }
    if (cx < 3250) {
      return {
        id: 'magma_core',
        label: 'Núcleo de Magma & Caldeira',
        subtitle: 'Profundezas incandescentes ricas em Pedra Infernal e Éter',
        color: '#ff5522',
        campaignBiome: 'magma_core',
        dangerTier: 5,
      };
    }
    return {
      id: 'pandemonium_citadel',
      label: 'Cidadela do Pandemônio',
      subtitle: 'Fortaleza abissal oriental dos soberanos das cinzas',
      color: '#ff2e63',
      campaignBiome: 'pandemonium_citadel',
      dangerTier: 5,
    };
  }

  // Vertical Stratum 3: Mid-Cavern Realms (ty 275..490)
  if (cy >= 275) {
    if (cx < 1200) {
      return {
        id: 'sunken_cathedral',
        label: 'Catedral Submersa',
        subtitle: 'Galerias alagadas, vitrais antigos e tesouros afundados',
        color: '#38bdf8',
        campaignBiome: 'sunken_cathedral',
        dangerTier: 3,
      };
    }
    if (cx < 2600) {
      return {
        id: 'caverns',
        label: 'Geodos Prismáticos Profundos',
        subtitle: 'Veios de Mithril, Ouro, Blocos Oníricos e lagos subterrâneos',
        color: '#67e8f9',
        campaignBiome: 'prism_sanctum',
        dangerTier: 3,
      };
    }
    if (cx < 3700) {
      return {
        id: 'alchemical_caves',
        label: 'Laboratórios Alquímicos Subterrâneos',
        subtitle: 'Câmaras de esporos, esteiras e veios de Titânio',
        color: '#34d399',
        campaignBiome: 'alchemical_labs',
        dangerTier: 4,
      };
    }
    return {
      id: 'bone_catacombs',
      label: 'Catacumbas do Ossuário',
      subtitle: 'Salões de marfim antigo, armadilhas e minérios de Éter',
      color: '#e2e8f0',
      campaignBiome: 'bone_ossuary',
      dangerTier: 4,
    };
  }

  // Vertical Stratum 2: Surface & Upper Crust (ty 145..275)
  const surf = getSandboxSurfaceRegion(cx);
  return {
    id: surf.id,
    label: surf.label,
    subtitle: surf.subtitle,
    color: surf.color,
    campaignBiome: surf.campaignBiome,
    dangerTier: surf.dangerTier,
  };
}

export function getSandboxCampaignBiomeAt(tx: number, ty: number): AnyBiomeId {
  return getSandboxBiomeAt(tx, ty).campaignBiome;
}

export function getSandboxSurfaceHeightAt(tx: number, seed = 202504): number {
  if (tx < 120) return 216 + Math.round(Math.sin(tx * 0.08) * 3);
  if (tx > 4580) return 216 + Math.round(Math.sin(tx * 0.08) * 3);
  // Flat welcoming Hub clearing at tx = 1650..1715
  if (tx >= 1650 && tx <= 1715) return 208;
  // Smooth Pyramid plateau at tx = 2010..2130
  if (tx >= 2010 && tx <= 2130) return 208;
  // Clockwork Plaza plateau at tx = 2780..2860
  if (tx >= 2780 && tx <= 2860) return 204;

  const wave =
    Math.sin(tx * 0.018 + seed * 0.001) * 9 +
    Math.cos(tx * 0.048) * 4 +
    Math.sin(tx * 0.005) * 8;
  return Math.max(182, Math.min(234, Math.round(208 + wave)));
}

export function markSandboxSectorAt(explored: Uint8Array, tx: number, ty: number): boolean {
  const sx = Math.max(0, Math.min(SANDBOX_SECTOR_COLS - 1, Math.floor(tx / SANDBOX_SECTOR_TILE_SIZE)));
  const sy = Math.max(0, Math.min(SANDBOX_SECTOR_ROWS - 1, Math.floor(ty / SANDBOX_SECTOR_TILE_SIZE)));
  const idx = sy * SANDBOX_SECTOR_COLS + sx;
  let newlyMarked = false;
  // Discover current sector and immediate 4-neighbors within close range
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (Math.abs(dx) + Math.abs(dy) > 1) continue;
      const nx = sx + dx;
      const ny = sy + dy;
      if (nx < 0 || nx >= SANDBOX_SECTOR_COLS || ny < 0 || ny >= SANDBOX_SECTOR_ROWS) continue;
      const nIdx = ny * SANDBOX_SECTOR_COLS + nx;
      if (explored[nIdx] === 0) {
        explored[nIdx] = 1;
        newlyMarked = true;
      }
    }
  }
  if (explored[idx] === 0) {
    explored[idx] = 1;
    newlyMarked = true;
  }
  return newlyMarked;
}

export function getSandboxExplorationPct(explored: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < explored.length; i++) {
    if (explored[i] > 0) count++;
  }
  return Math.round((count / Math.max(1, explored.length)) * 100);
}
