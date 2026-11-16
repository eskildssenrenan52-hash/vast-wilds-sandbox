// @ts-nocheck -- imported game code
import type { MaterialId } from './crafting';
import type { CollisionGrid } from './physics';
import {
  SANDBOX_COLS,
  SANDBOX_ROWS,
  SANDBOX_SECTOR_COLS,
  SANDBOX_SECTOR_ROWS,
  getSandboxBiomeAt,
  getSandboxCampaignBiomeAt,
  getSandboxExplorationPct,
  getSandboxSurfaceHeightAt,
  getSandboxSurfaceRegion,
  markSandboxSectorAt,
} from './sandboxBiomes';
import { TILE_SIZE } from './types';

export {
  SANDBOX_COLS,
  SANDBOX_ROWS,
  SANDBOX_SECTOR_COLS,
  SANDBOX_SECTOR_ROWS,
  getSandboxBiomeAt,
  getSandboxCampaignBiomeAt,
  getSandboxExplorationPct,
  getSandboxSurfaceHeightAt,
  getSandboxSurfaceRegion,
  markSandboxSectorAt,
};
export type { SandboxBiomeId, SandboxBiomeInfo, SandboxRegionDef } from './sandboxBiomes';

export const SANDBOX_WORLD_WIDTH_PX = SANDBOX_COLS * TILE_SIZE;
export const SANDBOX_WORLD_HEIGHT_PX = SANDBOX_ROWS * TILE_SIZE;

export const enum SB_TILE {
  AIR = 0,
  DIRT = 1,
  GRASS = 2,
  STONE = 3,
  SAND = 4,
  SNOW = 5,
  ICE = 6,
  WOOD_TRUNK = 7,
  LEAVES = 8,
  MUD = 9,
  JUNGLE_GRASS = 10,
  ASH = 11,
  HELLSTONE = 12,
  OBSIDIAN = 13,
  DUNGEON_BRICK = 14,
  COPPER_ORE = 15,
  IRON_ORE = 16,
  GOLD_ORE = 17,
  MITHRIL_ORE = 18,
  ETHER_ORE = 19,
  PLANK = 20,
  BRICK_BLOCK = 21,
  PLATFORM = 22,
  GLASS = 23,
  TORCH = 24,
  WORKBENCH = 25,
  FORGE = 26,
  CAULDRON = 27,
  DOOR_CLOSED = 28,
  DOOR_OPEN = 29,
  TABLE = 30,
  CHAIR = 31,
  CHEST = 32,
  BED_SPAWN = 33,
  ALTAR = 34,
  CAMPFIRE = 35,
  BOUNCE_SHROOM = 36,
  DASH_CRYSTAL = 37,
  LIFE_CRYSTAL = 38,
  POT = 39,
  SHRINE = 40,
  TELEPORT_PYLON = 41,
  BANNER = 42,
  // Campaign-grade interactive & biome tiles
  DREAM_BLOCK = 43,
  CLOUD_BOUNCE = 44,
  CONVEYOR_LEFT = 45,
  CONVEYOR_RIGHT = 46,
  CRUMBLE = 47,
  WATER = 48,
  MAGMA_CRUST = 49,
  SPIKE_UP = 50,
  SECRET_WALL = 51,
  TITANIUM_ORE = 52,
  ADAMANTITE_ORE = 53,
  SAKURA_PLANK = 54,
  NEON_BRICK = 55,
  LANTERN = 56,
  LOOM = 57,
  ANVIL = 58,
  LORE_TABLET = 59,
  QUEST_BEACON = 60,
  SPRING_UP = 61,
}

export const enum SB_WALL {
  NONE = 0,
  DIRT_WALL = 1,
  WOOD_WALL = 2,
  STONE_WALL = 3,
  BRICK_WALL = 4,
  GLASS_WALL = 5,
  DUNGEON_WALL = 6,
  SAKURA_WALL = 7,
  NEON_WALL = 8,
}

export interface SandboxTileMeta {
  id: SB_TILE;
  name: string;
  solid: boolean;
  platform: boolean;
  blocksHouse: boolean;
  minToolTier: number;
  hitsRequired: number;
  color: string;
  highlightColor: string;
  materialDrop?: MaterialId;
  dropQty?: number;
  selfTileDrop?: SB_TILE;
}

export const SANDBOX_TILE_META: Record<number, SandboxTileMeta> = {
  [SB_TILE.AIR]: { id: SB_TILE.AIR, name: 'Ar', solid: false, platform: false, blocksHouse: false, minToolTier: 0, hitsRequired: 0, color: 'transparent', highlightColor: 'transparent' },
  [SB_TILE.DIRT]: { id: SB_TILE.DIRT, name: 'Terra', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#6b442b', highlightColor: '#8d5b3a', selfTileDrop: SB_TILE.DIRT },
  [SB_TILE.GRASS]: { id: SB_TILE.GRASS, name: 'Grama', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#3aa85b', highlightColor: '#69d97f', materialDrop: 'madeira_ancestral', dropQty: 1, selfTileDrop: SB_TILE.DIRT },
  [SB_TILE.STONE]: { id: SB_TILE.STONE, name: 'Pedra Rúnica', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 3, color: '#5c6475', highlightColor: '#8690a6', materialDrop: 'pedra_runica', dropQty: 1, selfTileDrop: SB_TILE.STONE },
  [SB_TILE.SAND]: { id: SB_TILE.SAND, name: 'Areia Solar', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#d9b56c', highlightColor: '#f5dc93', materialDrop: 'areia_estelar', dropQty: 1, selfTileDrop: SB_TILE.SAND },
  [SB_TILE.SNOW]: { id: SB_TILE.SNOW, name: 'Neve', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#cbe6f7', highlightColor: '#ffffff', materialDrop: 'cristal_gelo', dropQty: 1, selfTileDrop: SB_TILE.SNOW },
  [SB_TILE.ICE]: { id: SB_TILE.ICE, name: 'Gelo Safira', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 3, color: '#5ec8e8', highlightColor: '#bdf3ff', materialDrop: 'cristal_gelo', dropQty: 1, selfTileDrop: SB_TILE.ICE },
  [SB_TILE.WOOD_TRUNK]: { id: SB_TILE.WOOD_TRUNK, name: 'Tronco Antigo', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#6e4526', highlightColor: '#99653c', materialDrop: 'madeira_ancestral', dropQty: 2, selfTileDrop: SB_TILE.PLANK },
  [SB_TILE.LEAVES]: { id: SB_TILE.LEAVES, name: 'Copa de Folhas', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#2b8a4e', highlightColor: '#56c77a', materialDrop: 'esporo_luminoso', dropQty: 1 },
  [SB_TILE.MUD]: { id: SB_TILE.MUD, name: 'Lama Abissal', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#45352d', highlightColor: '#665046', materialDrop: 'erva_celeste', dropQty: 1, selfTileDrop: SB_TILE.MUD },
  [SB_TILE.JUNGLE_GRASS]: { id: SB_TILE.JUNGLE_GRASS, name: 'Musgo Bioluminescente', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#1fb58d', highlightColor: '#6ef7cd', materialDrop: 'cristal_biolum', dropQty: 1, selfTileDrop: SB_TILE.MUD },
  [SB_TILE.ASH]: { id: SB_TILE.ASH, name: 'Cinza Vulcânica', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#38303d', highlightColor: '#594e61', materialDrop: 'pedra_runica', dropQty: 1, selfTileDrop: SB_TILE.ASH },
  [SB_TILE.HELLSTONE]: { id: SB_TILE.HELLSTONE, name: 'Pedra Infernal', solid: true, platform: false, blocksHouse: true, minToolTier: 3, hitsRequired: 5, color: '#9c2424', highlightColor: '#ff7733', materialDrop: 'brasa_viva', dropQty: 2, selfTileDrop: SB_TILE.HELLSTONE },
  [SB_TILE.OBSIDIAN]: { id: SB_TILE.OBSIDIAN, name: 'Obsidiana', solid: true, platform: false, blocksHouse: true, minToolTier: 3, hitsRequired: 5, color: '#241438', highlightColor: '#693fa1', materialDrop: 'obsidiana_viva', dropQty: 2, selfTileDrop: SB_TILE.OBSIDIAN },
  [SB_TILE.DUNGEON_BRICK]: { id: SB_TILE.DUNGEON_BRICK, name: 'Tijolo da Masmorra', solid: true, platform: false, blocksHouse: true, minToolTier: 2, hitsRequired: 4, color: '#293752', highlightColor: '#4c6694', materialDrop: 'osso_antigo', dropQty: 2, selfTileDrop: SB_TILE.DUNGEON_BRICK },
  [SB_TILE.COPPER_ORE]: { id: SB_TILE.COPPER_ORE, name: 'Minério de Cobre', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 3, color: '#8f5238', highlightColor: '#e8966b', materialDrop: 'minerio_cobre', dropQty: 2, selfTileDrop: SB_TILE.COPPER_ORE },
  [SB_TILE.IRON_ORE]: { id: SB_TILE.IRON_ORE, name: 'Minério de Ferro', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 4, color: '#5f6775', highlightColor: '#c2cde0', materialDrop: 'minerio_ferro', dropQty: 3, selfTileDrop: SB_TILE.IRON_ORE },
  [SB_TILE.GOLD_ORE]: { id: SB_TILE.GOLD_ORE, name: 'Veio de Ouro Solar', solid: true, platform: false, blocksHouse: true, minToolTier: 2, hitsRequired: 4, color: '#96711e', highlightColor: '#ffe066', materialDrop: 'minerio_ouro', dropQty: 2, selfTileDrop: SB_TILE.GOLD_ORE },
  [SB_TILE.MITHRIL_ORE]: { id: SB_TILE.MITHRIL_ORE, name: 'Minério de Mithril', solid: true, platform: false, blocksHouse: true, minToolTier: 3, hitsRequired: 5, color: '#1b6e6a', highlightColor: '#5cf2d6', materialDrop: 'minerio_mitril', dropQty: 2, selfTileDrop: SB_TILE.MITHRIL_ORE },
  [SB_TILE.ETHER_ORE]: { id: SB_TILE.ETHER_ORE, name: 'Cristal de Éter Puro', solid: true, platform: false, blocksHouse: true, minToolTier: 4, hitsRequired: 6, color: '#5e248a', highlightColor: '#e08aff', materialDrop: 'minerio_eter', dropQty: 2, selfTileDrop: SB_TILE.ETHER_ORE },
  [SB_TILE.PLANK]: { id: SB_TILE.PLANK, name: 'Tábua de Madeira', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#8f5d38', highlightColor: '#bd8455', selfTileDrop: SB_TILE.PLANK },
  [SB_TILE.BRICK_BLOCK]: { id: SB_TILE.BRICK_BLOCK, name: 'Bloco de Tijolo', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#6b4e57', highlightColor: '#9c7883', selfTileDrop: SB_TILE.BRICK_BLOCK },
  [SB_TILE.PLATFORM]: { id: SB_TILE.PLATFORM, name: 'Plataforma', solid: false, platform: true, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#a36e42', highlightColor: '#d49966', selfTileDrop: SB_TILE.PLATFORM },
  [SB_TILE.GLASS]: { id: SB_TILE.GLASS, name: 'Vidro Estelar', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 1, color: '#78d2eb', highlightColor: '#ffffff', selfTileDrop: SB_TILE.GLASS },
  [SB_TILE.TORCH]: { id: SB_TILE.TORCH, name: 'Tocha', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#ffb833', highlightColor: '#fff5b8', selfTileDrop: SB_TILE.TORCH },
  [SB_TILE.WORKBENCH]: { id: SB_TILE.WORKBENCH, name: 'Bancada', solid: false, platform: true, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#9c6334', highlightColor: '#d1925c', selfTileDrop: SB_TILE.WORKBENCH },
  [SB_TILE.FORGE]: { id: SB_TILE.FORGE, name: 'Forja Rúnica', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#543540', highlightColor: '#ff7733', selfTileDrop: SB_TILE.FORGE },
  [SB_TILE.CAULDRON]: { id: SB_TILE.CAULDRON, name: 'Caldeirão Alquímico', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#274d4c', highlightColor: '#4df0c0', selfTileDrop: SB_TILE.CAULDRON },
  [SB_TILE.DOOR_CLOSED]: { id: SB_TILE.DOOR_CLOSED, name: 'Porta', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#754624', highlightColor: '#b07246', selfTileDrop: SB_TILE.DOOR_CLOSED },
  [SB_TILE.DOOR_OPEN]: { id: SB_TILE.DOOR_OPEN, name: 'Porta Aberta', solid: false, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#543118', highlightColor: '#8c5732', selfTileDrop: SB_TILE.DOOR_CLOSED },
  [SB_TILE.TABLE]: { id: SB_TILE.TABLE, name: 'Mesa', solid: false, platform: true, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#8f5932', highlightColor: '#c48656', selfTileDrop: SB_TILE.TABLE },
  [SB_TILE.CHAIR]: { id: SB_TILE.CHAIR, name: 'Cadeira', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#8f5932', highlightColor: '#c48656', selfTileDrop: SB_TILE.CHAIR },
  [SB_TILE.CHEST]: { id: SB_TILE.CHEST, name: 'Baú de Tesouro', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#b58428', highlightColor: '#ffe066', selfTileDrop: SB_TILE.CHEST },
  [SB_TILE.BED_SPAWN]: { id: SB_TILE.BED_SPAWN, name: 'Cama (Spawn)', solid: false, platform: true, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#c43b5a', highlightColor: '#ffd27d', selfTileDrop: SB_TILE.BED_SPAWN },
  [SB_TILE.ALTAR]: { id: SB_TILE.ALTAR, name: 'Altar do Núcleo', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#6b329c', highlightColor: '#e88aff', selfTileDrop: SB_TILE.ALTAR },
  [SB_TILE.CAMPFIRE]: { id: SB_TILE.CAMPFIRE, name: 'Fogueira', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#ff7733', highlightColor: '#ffe875', selfTileDrop: SB_TILE.CAMPFIRE },
  [SB_TILE.BOUNCE_SHROOM]: { id: SB_TILE.BOUNCE_SHROOM, name: 'Cogumelo Elástico', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#18b88c', highlightColor: '#a8ffea', materialDrop: 'esporo_luminoso', dropQty: 2, selfTileDrop: SB_TILE.BOUNCE_SHROOM },
  [SB_TILE.DASH_CRYSTAL]: { id: SB_TILE.DASH_CRYSTAL, name: 'Cristal de Dash', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#4df099', highlightColor: '#ffffff', materialDrop: 'cristal_biolum', dropQty: 2, selfTileDrop: SB_TILE.DASH_CRYSTAL },
  [SB_TILE.LIFE_CRYSTAL]: { id: SB_TILE.LIFE_CRYSTAL, name: 'Cristal de Vida', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#ff3864', highlightColor: '#ffd6e0', materialDrop: 'pedra_evolucao', dropQty: 1 },
  [SB_TILE.POT]: { id: SB_TILE.POT, name: 'Pote de Tesouro', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#a85a3a', highlightColor: '#e08e67', materialDrop: 'minerio_cobre', dropQty: 1 },
  [SB_TILE.SHRINE]: { id: SB_TILE.SHRINE, name: 'Totem de Bênção', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#52e5ff', highlightColor: '#ffffff', selfTileDrop: SB_TILE.SHRINE },
  [SB_TILE.TELEPORT_PYLON]: { id: SB_TILE.TELEPORT_PYLON, name: 'Pilão de Teleporte', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#66eeff', highlightColor: '#ffe066', selfTileDrop: SB_TILE.TELEPORT_PYLON },
  [SB_TILE.BANNER]: { id: SB_TILE.BANNER, name: 'Estandarte', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#d92b54', highlightColor: '#ffd27d', selfTileDrop: SB_TILE.BANNER },
  [SB_TILE.DREAM_BLOCK]: { id: SB_TILE.DREAM_BLOCK, name: 'Bloco Onírico', solid: true, platform: false, blocksHouse: false, minToolTier: 2, hitsRequired: 3, color: '#1b1036', highlightColor: '#c084fc', materialDrop: 'essencia_sombria', dropQty: 1, selfTileDrop: SB_TILE.DREAM_BLOCK },
  [SB_TILE.CLOUD_BOUNCE]: { id: SB_TILE.CLOUD_BOUNCE, name: 'Nuvem Elástica', solid: true, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#cbeeff', highlightColor: '#ffffff', materialDrop: 'fio_celestial', dropQty: 1, selfTileDrop: SB_TILE.CLOUD_BOUNCE },
  [SB_TILE.CONVEYOR_LEFT]: { id: SB_TILE.CONVEYOR_LEFT, name: 'Esteira Esq.', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#39465e', highlightColor: '#52e5ff', materialDrop: 'engrenagem_arcana', dropQty: 1, selfTileDrop: SB_TILE.CONVEYOR_LEFT },
  [SB_TILE.CONVEYOR_RIGHT]: { id: SB_TILE.CONVEYOR_RIGHT, name: 'Esteira Dir.', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#39465e', highlightColor: '#fb923c', materialDrop: 'engrenagem_arcana', dropQty: 1, selfTileDrop: SB_TILE.CONVEYOR_RIGHT },
  [SB_TILE.CRUMBLE]: { id: SB_TILE.CRUMBLE, name: 'Rocha Frágil', solid: true, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#453759', highlightColor: '#a892c7', materialDrop: 'pedra_runica', dropQty: 1, selfTileDrop: SB_TILE.CRUMBLE },
  [SB_TILE.WATER]: { id: SB_TILE.WATER, name: 'Água Luminosa', solid: false, platform: false, blocksHouse: false, minToolTier: 99, hitsRequired: 99, color: '#1875ab', highlightColor: '#6be0ff' },
  [SB_TILE.MAGMA_CRUST]: { id: SB_TILE.MAGMA_CRUST, name: 'Crosta de Magma', solid: true, platform: false, blocksHouse: false, minToolTier: 3, hitsRequired: 4, color: '#7a1919', highlightColor: '#ff7733', materialDrop: 'brasa_viva', dropQty: 1, selfTileDrop: SB_TILE.MAGMA_CRUST },
  [SB_TILE.SPIKE_UP]: { id: SB_TILE.SPIKE_UP, name: 'Espinhos', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#ff3864', highlightColor: '#ffe066', materialDrop: 'minerio_ferro', dropQty: 1, selfTileDrop: SB_TILE.SPIKE_UP },
  [SB_TILE.SECRET_WALL]: { id: SB_TILE.SECRET_WALL, name: 'Parede Secreta', solid: true, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#4f4669', highlightColor: '#9c8ec4', materialDrop: 'po_fada', dropQty: 1 },
  [SB_TILE.TITANIUM_ORE]: { id: SB_TILE.TITANIUM_ORE, name: 'Minério de Titânio', solid: true, platform: false, blocksHouse: true, minToolTier: 3, hitsRequired: 5, color: '#2b4775', highlightColor: '#60a5fa', materialDrop: 'minerio_titanio', dropQty: 2, selfTileDrop: SB_TILE.TITANIUM_ORE },
  [SB_TILE.ADAMANTITE_ORE]: { id: SB_TILE.ADAMANTITE_ORE, name: 'Minério de Adamantita', solid: true, platform: false, blocksHouse: true, minToolTier: 4, hitsRequired: 6, color: '#7a1936', highlightColor: '#ff4d7d', materialDrop: 'minerio_adamantita', dropQty: 2, selfTileDrop: SB_TILE.ADAMANTITE_ORE },
  [SB_TILE.SAKURA_PLANK]: { id: SB_TILE.SAKURA_PLANK, name: 'Tábua Sakura', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#a83c6b', highlightColor: '#ff94c2', selfTileDrop: SB_TILE.SAKURA_PLANK },
  [SB_TILE.NEON_BRICK]: { id: SB_TILE.NEON_BRICK, name: 'Tijolo Cibernético', solid: true, platform: false, blocksHouse: true, minToolTier: 1, hitsRequired: 2, color: '#1b3b4f', highlightColor: '#22d3ee', selfTileDrop: SB_TILE.NEON_BRICK },
  [SB_TILE.LANTERN]: { id: SB_TILE.LANTERN, name: 'Lanterna Ornamental', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#ffb84d', highlightColor: '#fff5b8', selfTileDrop: SB_TILE.LANTERN },
  [SB_TILE.LOOM]: { id: SB_TILE.LOOM, name: 'Tear Celestial', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#6b3280', highlightColor: '#f0abfc', selfTileDrop: SB_TILE.LOOM },
  [SB_TILE.ANVIL]: { id: SB_TILE.ANVIL, name: 'Bigorna Rúnica', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 2, color: '#474359', highlightColor: '#ff8833', selfTileDrop: SB_TILE.ANVIL },
  [SB_TILE.LORE_TABLET]: { id: SB_TILE.LORE_TABLET, name: 'Estela Ancestral', solid: false, platform: false, blocksHouse: false, minToolTier: 2, hitsRequired: 4, color: '#3b4f78', highlightColor: '#67e8f9', materialDrop: 'po_fada', dropQty: 2 },
  [SB_TILE.QUEST_BEACON]: { id: SB_TILE.QUEST_BEACON, name: 'Farol Astral', solid: false, platform: false, blocksHouse: false, minToolTier: 2, hitsRequired: 4, color: '#1f5c6b', highlightColor: '#52e5ff' },
  [SB_TILE.SPRING_UP]: { id: SB_TILE.SPRING_UP, name: 'Mola de Impulso', solid: false, platform: false, blocksHouse: false, minToolTier: 1, hitsRequired: 1, color: '#ff4d7d', highlightColor: '#ffe066', selfTileDrop: SB_TILE.SPRING_UP },
};

export function isSandboxSolid(tile: number): boolean {
  return Boolean(SANDBOX_TILE_META[tile]?.solid);
}

export function isSandboxPlatform(tile: number): boolean {
  return Boolean(SANDBOX_TILE_META[tile]?.platform);
}

export function isSandboxBlockingHouse(tile: number): boolean {
  return Boolean(SANDBOX_TILE_META[tile]?.blocksHouse);
}

export interface SandboxNpc {
  id: string;
  name: string;
  role: string;
  accentColor: string;
  spriteKind?: string;
  x: number;
  y: number;
  vx: number;
  homeTx: number;
  homeTy: number;
  dir: 1 | -1;
}

export type SandboxEnemyKind =
  | 'slime'
  | 'demon_eye'
  | 'sand_crawler'
  | 'cave_skeleton'
  | 'hell_imp'
  | 'dungeon_guard'
  | 'cyber_drone'
  | 'crystal_wisp'
  | 'core_boss'
  | 'leviathan_boss'
  | 'chronos_boss'
  | 'magma_boss';

export interface SandboxEnemy {
  id: string;
  kind: SandboxEnemyKind;
  spriteKind?: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  w: number;
  h: number;
  color: string;
  timer: number;
  flash: number;
  isBoss?: boolean;
  shootTimer?: number;
}

export type SandboxScenicPropKind =
  | 'tree_pine'
  | 'sakura_tree'
  | 'cactus_saguaro'
  | 'giant_shroom'
  | 'crystal_spire'
  | 'ruin_statue'
  | 'sun_brazier'
  | 'coral_pillar'
  | 'obelisk'
  | 'torii_gate'
  | 'clock_gear'
  | 'stained_window'
  | 'waterfall'
  | 'aurora_prism'
  | 'holo_pylon'
  | 'willow_tree'
  | 'marble_column'
  | 'alchemy_vat'
  | 'ruin_tower'
  | 'pyramid_obelisk'
  | 'pendulum';

export interface SandboxScenicProp {
  id: string;
  kind: SandboxScenicPropKind;
  tx: number;
  ty: number;
  h?: number;
}

export interface SandboxHouse {
  id: string;
  centerTx: number;
  centerTy: number;
  npcId?: string;
}

export interface SandboxHotbarSlot {
  id: string;
  name: string;
  kind: 'tool' | 'weapon' | 'tile' | 'wall' | 'summon';
  tile?: SB_TILE;
  wall?: SB_WALL;
  bossKind?: 'core_boss' | 'leviathan_boss' | 'chronos_boss' | 'magma_boss';
  count: number;
  color: string;
}

export interface SandboxQuestDef {
  id: string;
  title: string;
  desc: string;
  target: number;
  coinReward: number;
  xpReward: number;
  accent: string;
}

export const SANDBOX_QUESTS: SandboxQuestDef[] = [
  { id: 'sb_cut_wood', title: 'Lenhador de Aethelgard', desc: 'Colete 8 blocos de madeira ou troncos na superfície.', target: 8, coinReward: 20, xpReward: 40, accent: '#8d5b3a' },
  { id: 'sb_mine_ore', title: 'Primeira Veia Mineral', desc: 'Minere 12 minérios subterrâneos em cavernas.', target: 12, coinReward: 40, xpReward: 70, accent: '#52e5ff' },
  { id: 'sb_explore_10', title: 'Cartógrafo das Terras', desc: 'Explore pelo menos 10% do Mundo Aberto Conectado.', target: 10, coinReward: 65, xpReward: 120, accent: '#4df0c0' },
  { id: 'sb_light_beacons', title: 'Faróis do Horizonte', desc: 'Acenda 3 Faróis Astrais espalhados pelos biomas [E/Dir].', target: 3, coinReward: 70, xpReward: 130, accent: '#52e5ff' },
  { id: 'sb_read_tablets', title: 'Decifrador das Estelas', desc: 'Decifre 2 Estelas Ancestrais escondidas pelo mundo.', target: 2, coinReward: 55, xpReward: 95, accent: '#c084fc' },
  { id: 'sb_build_house', title: 'Arquiteto do Lar', desc: 'Construa e valide 1 Casa completa (paredes, porta, luz, mesa e cadeira).', target: 1, coinReward: 60, xpReward: 100, accent: '#ffd27d' },
  { id: 'sb_attract_npc', title: 'Vila Despertada', desc: 'Abrigue 3 moradores NPCs em casas validadas.', target: 3, coinReward: 110, xpReward: 170, accent: '#4df0c0' },
  { id: 'sb_upgrade_pick', title: 'Picareta Refinada', desc: 'Evolua sua picareta para Nível 3+ na Forja/Crafting.', target: 1, coinReward: 70, xpReward: 110, accent: '#f59e0b' },
  { id: 'sb_reach_sky', title: 'Ascensão às Nuvens', desc: 'Alcance o Arquipélago Celeste acima de y=140 blocos.', target: 1, coinReward: 65, xpReward: 110, accent: '#a8f5ff' },
  { id: 'sb_reach_hell', title: 'Descida ao Núcleo', desc: 'Alcance o Submundo profundo abaixo de y=490 blocos.', target: 1, coinReward: 95, xpReward: 160, accent: '#ff5522' },
  { id: 'sb_explore_dungeon', title: 'Caçador de Relíquias', desc: 'Abra 4 baús antigos nas Ilhas Celestes, Pirâmide, Catedral ou Masmorra.', target: 4, coinReward: 100, xpReward: 160, accent: '#a855f7' },
  { id: 'sb_defeat_boss', title: 'Soberano dos Guardiões', desc: 'Invoque e derrote 2 Chefes de Bioma no Mundo Sandbox.', target: 2, coinReward: 260, xpReward: 420, accent: '#ff2e63' },
];

export const NPC_ROSTER: Omit<SandboxNpc, 'x' | 'y' | 'vx' | 'homeTx' | 'homeTy' | 'dir'>[] = [
  { id: 'npc_guide', name: 'Guia Lyra', role: 'Exploradora', accentColor: '#52e5ff', spriteKind: 'astra' },
  { id: 'npc_blacksmith', name: 'Ferreiro Korg', role: 'Mestre da Forja', accentColor: '#ff7733', spriteKind: 'ferro' },
  { id: 'npc_alchemist', name: 'Alquimista Vera', role: 'Boticária', accentColor: '#4df0c0', spriteKind: 'alch_vera' },
  { id: 'npc_tamer', name: 'Domador Sol', role: 'Guardião de Pets', accentColor: '#ffd27d', spriteKind: 'kael' },
  { id: 'npc_merchant', name: 'Mercador Astral', role: 'Comerciante', accentColor: '#c084fc', spriteKind: 'morgana' },
  { id: 'npc_chronomancer', name: 'Cronista Aeon', role: 'Engenheiro', accentColor: '#22d3ee', spriteKind: 'chronos' },
  { id: 'npc_sakura', name: 'Mestra Hana', role: 'Sacerdotisa Sakura', accentColor: '#f472b6', spriteKind: 'sakura' },
];

export interface SandboxWorld {
  seed: number;
  cols: number;
  rows: number;
  tiles: Uint8Array;
  walls: Uint8Array;
  tileDamage: Uint8Array;
  exploredSectors: Uint8Array;
  spawnTx: number;
  spawnTy: number;
  dayTime: number;
  houses: SandboxHouse[];
  npcs: SandboxNpc[];
  enemies: SandboxEnemy[];
  scenicProps: SandboxScenicProp[];
  scenicBuckets: Map<number, SandboxScenicProp[]>;
  pylons: { tx: number; ty: number; label: string; color: string }[];
  openedChests: Set<string>;
  litBeacons: Set<string>;
  readTablets: Set<string>;
  modifiedCells: Map<number, { tile: number; wall: number }>;
  terrainDirtyTiles: number[];
  crumbleTimers: Map<number, { state: 'shaking' | 'gone'; timer: number }>;
  progress: {
    woodGathered: number;
    oresMined: number;
    housesBuilt: number;
    chestsOpened: number;
    reachedHell: number;
    reachedSky: number;
    beaconsLit: number;
    tabletsRead: number;
    bossDefeated: number;
  };
}

export interface SandboxDeltaSave {
  seed: number;
  dayTime: number;
  spawnTx: number;
  spawnTy: number;
  changes: [number, number, number][];
  houses: SandboxHouse[];
  openedChests: string[];
  litBeacons?: string[];
  readTablets?: string[];
  exploredSectors?: number[];
  progress: SandboxWorld['progress'];
}

function hash2d(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

export function createStarterHotbar(): SandboxHotbarSlot[] {
  return [
    { id: 'tool_pick', name: 'Picareta', kind: 'tool', count: 1, color: '#52e5ff' },
    { id: 'weapon_blade', name: 'Lâmina Astral', kind: 'weapon', count: 1, color: '#ff5c8a' },
    { id: 'tile_plank', name: 'Tábua', kind: 'tile', tile: SB_TILE.PLANK, count: 64, color: '#bd8455' },
    { id: 'tile_platform', name: 'Plataforma', kind: 'tile', tile: SB_TILE.PLATFORM, count: 32, color: '#d49966' },
    { id: 'wall_wood', name: 'Parede Fundo', kind: 'wall', wall: SB_WALL.WOOD_WALL, count: 80, color: '#70492b' },
    { id: 'tile_torch', name: 'Tocha', kind: 'tile', tile: SB_TILE.TORCH, count: 24, color: '#ffd24d' },
    { id: 'tile_door', name: 'Porta', kind: 'tile', tile: SB_TILE.DOOR_CLOSED, count: 4, color: '#9c6334' },
    { id: 'tile_furniture', name: 'Mesa/Cadeira', kind: 'tile', tile: SB_TILE.TABLE, count: 6, color: '#c48656' },
    { id: 'summon_boss', name: 'Olho Núcleo', kind: 'summon', bossKind: 'core_boss', count: 1, color: '#e879f9' },
  ];
}

export function indexScenicBuckets(props: SandboxScenicProp[]): Map<number, SandboxScenicProp[]> {
  const buckets = new Map<number, SandboxScenicProp[]>();
  for (const pr of props) {
    const b = Math.floor(pr.tx / 64);
    let arr = buckets.get(b);
    if (!arr) {
      arr = [];
      buckets.set(b, arr);
    }
    arr.push(pr);
  }
  return buckets;
}

export function generateSandboxWorld(seed = 202504): SandboxWorld {
  const cols = SANDBOX_COLS;
  const rows = SANDBOX_ROWS;
  const tiles = new Uint8Array(cols * rows);
  const walls = new Uint8Array(cols * rows);
  const tileDamage = new Uint8Array(cols * rows);
  const exploredSectors = new Uint8Array(SANDBOX_SECTOR_COLS * SANDBOX_SECTOR_ROWS);

  const setTile = (tx: number, ty: number, tile: SB_TILE) => {
    if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return;
    tiles[ty * cols + tx] = tile;
  };
  const setWall = (tx: number, ty: number, wall: SB_WALL) => {
    if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return;
    walls[ty * cols + tx] = wall;
  };

  // 1. Base Interconnected Terrain + Caverns + Deep Underworld
  for (let tx = 0; tx < cols; tx++) {
    const surfY = getSandboxSurfaceHeightAt(tx, seed);
    const region = getSandboxSurfaceRegion(tx);

    // West & East Ocean Waters above lower coastal sands
    if ((region.id === 'ocean_west' && tx < 95) || (region.id === 'ocean_east' && tx > 4660)) {
      const seaLevel = 212;
      for (let ty = seaLevel; ty < surfY; ty++) {
        setTile(tx, ty, SB_TILE.WATER);
      }
    }

    for (let ty = surfY; ty < rows; ty++) {
      const depth = ty - surfY;

      // Stratum 4: Deep Underworld & Magma Core (ty >= 490)
      if (ty >= 490) {
        const hellNoise = Math.sin(tx * 0.045 + ty * 0.11) + Math.cos(tx * 0.095 - ty * 0.08);
        if (ty >= 505 && ty <= 590 && hellNoise > -0.65) {
          setTile(tx, ty, SB_TILE.AIR);
          if (ty >= 578) {
            setTile(tx, ty, tx % 17 === 0 ? SB_TILE.OBSIDIAN : SB_TILE.MAGMA_CRUST);
          }
          continue;
        }
        setWall(tx, ty, SB_WALL.DUNGEON_WALL);
        setTile(tx, ty, ty > 605 ? SB_TILE.OBSIDIAN : SB_TILE.ASH);
        continue;
      }

      // Stratum 2 & 3: Connected Winding Caverns & Tunnels
      const n1 = Math.sin(tx * 0.055 + ty * 0.075) + Math.cos(tx * 0.032 - ty * 0.065) * 0.85;
      const n2 = Math.sin((tx - ty) * 0.11) * 0.38;
      // Horizontal subterranean gallery tunnel at ty ~ 335..345 and ty ~ 435..445
      const tunnelA = Math.abs(ty - (338 + Math.round(Math.sin(tx * 0.015) * 14))) <= 4;
      const tunnelB = Math.abs(ty - (440 + Math.round(Math.cos(tx * 0.018) * 12))) <= 4;

      if ((depth > 10 && n1 + n2 > 0.96) || (depth > 18 && (tunnelA || tunnelB))) {
        setWall(tx, ty, depth > 55 ? SB_WALL.STONE_WALL : SB_WALL.DIRT_WALL);
        continue;
      }

      if (depth >= 2) {
        setWall(tx, ty, depth > 48 ? SB_WALL.STONE_WALL : SB_WALL.DIRT_WALL);
      }

      if (depth === 0) {
        if (region.id === 'desert' || region.id === 'ocean_west' || region.id === 'ocean_east') {
          setTile(tx, ty, SB_TILE.SAND);
        } else if (region.id === 'tundra') {
          setTile(tx, ty, SB_TILE.SNOW);
        } else if (region.id === 'jungle' || region.id === 'jade_bamboo') {
          setTile(tx, ty, SB_TILE.JUNGLE_GRASS);
        } else if (region.id === 'abyss_surface' || region.id === 'obsidian_temple') {
          setTile(tx, ty, SB_TILE.OBSIDIAN);
        } else if (region.id === 'crimson_sakura') {
          setTile(tx, ty, SB_TILE.GRASS);
        } else if (region.id === 'clockwork_city') {
          setTile(tx, ty, tx % 6 === 0 ? SB_TILE.CONVEYOR_RIGHT : SB_TILE.NEON_BRICK);
        } else {
          setTile(tx, ty, SB_TILE.GRASS);
        }
      } else if (depth < 16) {
        if (region.id === 'desert') setTile(tx, ty, SB_TILE.SAND);
        else if (region.id === 'tundra') setTile(tx, ty, depth > 7 ? SB_TILE.ICE : SB_TILE.SNOW);
        else if (region.id === 'jungle') setTile(tx, ty, SB_TILE.MUD);
        else if (region.id === 'abyss_surface' || region.id === 'obsidian_temple') setTile(tx, ty, SB_TILE.ASH);
        else if (region.id === 'clockwork_city') setTile(tx, ty, SB_TILE.NEON_BRICK);
        else setTile(tx, ty, SB_TILE.DIRT);
      } else {
        setTile(tx, ty, region.id === 'tundra' && depth < 64 ? SB_TILE.ICE : SB_TILE.STONE);
      }
    }
  }

  // 2. Six Great Vertical Shafts connecting Surface -> Caverns -> Deep Underworld!
  const greatShaftXs = [310, 960, 1620, 2450, 3200, 4050];
  for (const sx of greatShaftXs) {
    const startY = getSandboxSurfaceHeightAt(sx, seed);
    for (let ty = startY - 1; ty <= 535; ty++) {
      for (let dx = -3; dx <= 3; dx++) {
        setTile(sx + dx, ty, SB_TILE.AIR);
        setWall(sx + dx, ty, ty > 400 ? SB_WALL.DUNGEON_WALL : SB_WALL.STONE_WALL);
      }
      if (ty % 9 === 0 && ty > startY + 2) {
        for (let dx = -2; dx <= 2; dx++) setTile(sx + dx, ty, SB_TILE.PLATFORM);
        setTile(sx - 3, ty - 1, SB_TILE.LANTERN);
      }
      if (ty % 36 === 0 && ty > startY + 12) {
        setTile(sx, ty - 3, SB_TILE.DASH_CRYSTAL);
      }
    }
  }

  // 3. Deterministic Ore Veins across ALL depth tiers (Copper -> Iron -> Gold -> Mithril -> Titanium -> Adamantite -> Hellstone -> Ether)
  for (let tx = 16; tx < cols - 16; tx += 3) {
    for (let ty = 212; ty < rows - 14; ty += 3) {
      if (tiles[ty * cols + tx] === SB_TILE.AIR || tiles[ty * cols + tx] === SB_TILE.WATER) continue;
      const r = hash2d(tx, ty, seed);
      if (ty < 310 && r > 0.945) {
        setTile(tx, ty, SB_TILE.COPPER_ORE);
        setTile(tx + 1, ty, SB_TILE.COPPER_ORE);
      } else if (ty >= 235 && ty < 395 && r > 0.952) {
        setTile(tx, ty, SB_TILE.IRON_ORE);
        setTile(tx, ty + 1, SB_TILE.IRON_ORE);
      } else if (ty >= 290 && ty < 450 && r > 0.964) {
        setTile(tx, ty, SB_TILE.GOLD_ORE);
        setTile(tx + 1, ty, SB_TILE.GOLD_ORE);
      } else if (ty >= 340 && ty < 510 && r > 0.972) {
        setTile(tx, ty, SB_TILE.MITHRIL_ORE);
        setTile(tx + 1, ty, SB_TILE.MITHRIL_ORE);
      } else if (ty >= 380 && ty < 560 && r > 0.978) {
        setTile(tx, ty, SB_TILE.TITANIUM_ORE);
        setTile(tx + 1, ty, SB_TILE.TITANIUM_ORE);
      } else if (ty >= 440 && ty < 600 && r > 0.982) {
        setTile(tx, ty, SB_TILE.ADAMANTITE_ORE);
        setTile(tx + 1, ty, SB_TILE.ADAMANTITE_ORE);
      } else if (ty >= 490 && r > 0.978) {
        setTile(tx, ty, r > 0.991 ? SB_TILE.ETHER_ORE : SB_TILE.HELLSTONE);
        setTile(tx + 1, ty, r > 0.991 ? SB_TILE.ETHER_ORE : SB_TILE.HELLSTONE);
      }
    }
  }

  // 4. Surface Trees & Flora
  for (let tx = 140; tx < 4540; tx += 12) {
    if (tx >= 1645 && tx <= 1720) continue; // Keep starter hub clearing open
    if (tx >= 2005 && tx <= 2140) continue; // Pyramid zone
    if (tx >= 2775 && tx <= 2870) continue; // Clockwork plaza
    if (greatShaftXs.some((s) => Math.abs(s - tx) < 6)) continue;
    const region = getSandboxSurfaceRegion(tx);
    if (region.id === 'desert' || region.id === 'clockwork_city' || region.id === 'ancient_dungeon') continue;
    if (hash2d(tx, 99, seed) < 0.4) continue;
    const sy = getSandboxSurfaceHeightAt(tx, seed);
    const height = 5 + Math.floor(hash2d(tx, 77, seed) * 6);
    for (let h = 1; h <= height; h++) {
      setTile(tx, sy - h, SB_TILE.WOOD_TRUNK);
    }
    for (let lx = -2; lx <= 2; lx++) {
      for (let ly = -2; ly <= 0; ly++) {
        if (Math.abs(lx) + Math.abs(ly) <= 3) {
          setTile(tx + lx, sy - height + ly, SB_TILE.LEAVES);
        }
      }
    }
  }

  // 5. Eighteen Interconnected Floating Sky Islands & Cloud Monasteries (ty = 55..130)
  const skyIslandXs = [
    220, 480, 740, 1020, 1290, 1560, 1840, 2110, 2380,
    2650, 2930, 3210, 3490, 3770, 4050, 4310, 4560,
  ];
  skyIslandXs.forEach((ix, i) => {
    const iy = 66 + (i % 4) * 14;
    for (let dx = -14; dx <= 14; dx++) {
      const thickness = Math.max(1, 5 - Math.floor(Math.abs(dx) / 3));
      for (let dy = 0; dy < thickness; dy++) {
        setTile(
          ix + dx,
          iy + dy,
          dy === 0 ? (i % 3 === 0 ? SB_TILE.CLOUD_BOUNCE : SB_TILE.GRASS) : dx % 5 === 0 ? SB_TILE.GOLD_ORE : SB_TILE.DIRT
        );
      }
    }
    // Cloud Bounce & Dash Crystal staircase ascending from ground to island
    const surfY = getSandboxSurfaceHeightAt(ix, seed);
    if (i % 2 === 0) {
      setTile(ix - 10, surfY - 1, SB_TILE.SPRING_UP);
      setTile(ix - 8, surfY - 26, SB_TILE.CLOUD_BOUNCE);
      setTile(ix - 6, surfY - 56, SB_TILE.DASH_CRYSTAL);
      setTile(ix - 4, iy + 20, SB_TILE.CLOUD_BOUNCE);
    }
    // Sky Temple / Pavilion
    for (let px = -5; px <= 5; px++) {
      setTile(ix + px, iy - 5, i % 2 === 0 ? SB_TILE.SAKURA_PLANK : SB_TILE.BRICK_BLOCK);
      for (let py = -4; py <= -1; py++) {
        setWall(ix + px, iy + py, i % 2 === 0 ? SB_WALL.SAKURA_WALL : SB_WALL.BRICK_WALL);
        if (Math.abs(px) === 5) setTile(ix + px, iy + py, py === -1 ? SB_TILE.DOOR_CLOSED : SB_TILE.BRICK_BLOCK);
      }
    }
    setTile(ix, iy - 1, SB_TILE.CHEST);
    setTile(ix - 3, iy - 1, SB_TILE.LANTERN);
    setTile(ix + 3, iy - 1, SB_TILE.LANTERN);
    if (i % 4 === 1) setTile(ix + 2, iy - 1, SB_TILE.LORE_TABLET);
    if (i % 5 === 2) setTile(ix - 2, iy - 1, SB_TILE.QUEST_BEACON);
  });

  // 6. Signature Biome Landmarks Across the 4800-Wide World
  // 6a. West Ancient Dungeon & Amethyst Crypt (tx = 220..265 descending to ty = 320)
  for (let ty = getSandboxSurfaceHeightAt(240, seed) - 5; ty < 320; ty++) {
    for (let tx = 228; tx <= 254; tx++) {
      setWall(tx, ty, SB_WALL.DUNGEON_WALL);
      const isBorder = tx === 228 || tx === 254 || ty === 319;
      setTile(tx, ty, isBorder ? SB_TILE.DUNGEON_BRICK : SB_TILE.AIR);
    }
    if (ty % 9 === 0) {
      for (let tx = 230; tx <= 252; tx++) {
        setTile(tx, ty, tx % 7 === 0 ? SB_TILE.CRUMBLE : SB_TILE.PLATFORM);
      }
      setTile(231, ty - 1, SB_TILE.TORCH);
      setTile(251, ty - 1, SB_TILE.LANTERN);
    }
  }
  setTile(238, 318, SB_TILE.CHEST);
  setTile(242, 318, SB_TILE.ALTAR);
  setTile(246, 318, SB_TILE.LORE_TABLET);

  // 6b. Desert Great Solar Pyramid Labyrinth (tx = 2070)
  const pyrCenter = 2070;
  const pyrBaseY = getSandboxSurfaceHeightAt(pyrCenter, seed) + 1;
  for (let level = 0; level < 32; level++) {
    const halfW = 34 - level;
    const py = pyrBaseY - level;
    for (let dx = -halfW; dx <= halfW; dx++) {
      const isInner = Math.abs(dx) < halfW - 2 && level > 0 && level < 27;
      setWall(pyrCenter + dx, py, SB_WALL.BRICK_WALL);
      setTile(pyrCenter + dx, py, isInner ? SB_TILE.AIR : SB_TILE.BRICK_BLOCK);
    }
  }
  // Inner pyramid secret chambers + Dream Block vault!
  for (let dx = -12; dx <= 12; dx++) setTile(pyrCenter + dx, pyrBaseY - 9, SB_TILE.PLATFORM);
  setTile(pyrCenter - 32, pyrBaseY - 1, SB_TILE.DOOR_CLOSED);
  setTile(pyrCenter - 32, pyrBaseY - 2, SB_TILE.AIR);
  setTile(pyrCenter + 14, pyrBaseY - 1, SB_TILE.SECRET_WALL);
  setTile(pyrCenter + 14, pyrBaseY - 2, SB_TILE.SECRET_WALL);
  setTile(pyrCenter + 17, pyrBaseY - 1, SB_TILE.CHEST);
  setTile(pyrCenter, pyrBaseY - 1, SB_TILE.CHEST);
  setTile(pyrCenter - 6, pyrBaseY - 1, SB_TILE.ALTAR);
  setTile(pyrCenter, pyrBaseY - 10, SB_TILE.QUEST_BEACON);
  setTile(pyrCenter + 5, pyrBaseY - 3, SB_TILE.LANTERN);
  setTile(pyrCenter - 5, pyrBaseY - 3, SB_TILE.LANTERN);

  // 6c. Clockwork Spire & Cyber Dream-Vault Plaza (tx = 2820)
  const cwX = 2820;
  const cwY = getSandboxSurfaceHeightAt(cwX, seed);
  for (let dx = -24; dx <= 24; dx++) {
    setTile(cwX + dx, cwY, dx < 0 ? SB_TILE.CONVEYOR_RIGHT : SB_TILE.CONVEYOR_LEFT);
    setTile(cwX + dx, cwY - 16, SB_TILE.NEON_BRICK);
    setWall(cwX + dx, cwY - 8, SB_WALL.NEON_WALL);
  }
  // Dream block challenge tower
  for (let dy = 1; dy <= 15; dy++) {
    setTile(cwX - 18, cwY - dy, dy >= 6 && dy <= 10 ? SB_TILE.DREAM_BLOCK : SB_TILE.NEON_BRICK);
    setTile(cwX + 18, cwY - dy, dy >= 6 && dy <= 10 ? SB_TILE.DREAM_BLOCK : SB_TILE.NEON_BRICK);
  }
  setTile(cwX, cwY - 17, SB_TILE.CHEST);
  setTile(cwX - 4, cwY - 17, SB_TILE.QUEST_BEACON);
  setTile(cwX + 4, cwY - 17, SB_TILE.SPRING_UP);

  // 6d. Sunken Cathedral Underground Hall (tx = 820, ty = 340)
  for (let ty = 328; ty <= 346; ty++) {
    for (let tx = 800; tx <= 846; tx++) {
      setWall(tx, ty, SB_WALL.DUNGEON_WALL);
      const border = tx === 800 || tx === 846 || ty === 328 || ty === 346;
      setTile(tx, ty, border ? SB_TILE.DUNGEON_BRICK : ty >= 342 ? SB_TILE.WATER : SB_TILE.AIR);
    }
  }
  for (let tx = 808; tx <= 838; tx += 6) setTile(tx, 341, SB_TILE.PLATFORM);
  setTile(823, 340, SB_TILE.CHEST);
  setTile(815, 340, SB_TILE.LORE_TABLET);
  setTile(830, 340, SB_TILE.LANTERN);

  // 6e. Crimson Sakura Shrine Gate & Garden Pavilion (tx = 1320)
  const sakY = getSandboxSurfaceHeightAt(1320, seed);
  for (let dx = -10; dx <= 10; dx++) setTile(1320 + dx, sakY, SB_TILE.SAKURA_PLANK);
  setTile(1316, sakY - 1, SB_TILE.LANTERN);
  setTile(1324, sakY - 1, SB_TILE.LANTERN);
  setTile(1320, sakY - 1, SB_TILE.SHRINE);
  setTile(1326, sakY - 1, SB_TILE.QUEST_BEACON);

  // 7. Starter Safe Camp at Vale de Aethelgard (tx = 1680)
  const spawnTx = 1680;
  const spawnBaseY = getSandboxSurfaceHeightAt(spawnTx, seed);
  for (let dx = -16; dx <= 16; dx++) {
    setTile(spawnTx + dx, spawnBaseY, SB_TILE.GRASS);
  }
  setTile(spawnTx - 10, spawnBaseY - 1, SB_TILE.TELEPORT_PYLON);
  setTile(spawnTx - 7, spawnBaseY - 1, SB_TILE.LANTERN);
  setTile(spawnTx - 5, spawnBaseY - 1, SB_TILE.WORKBENCH);
  setTile(spawnTx - 3, spawnBaseY - 1, SB_TILE.CAMPFIRE);
  setTile(spawnTx + 3, spawnBaseY - 1, SB_TILE.FORGE);
  setTile(spawnTx + 5, spawnBaseY - 1, SB_TILE.CAULDRON);
  setTile(spawnTx + 7, spawnBaseY - 1, SB_TILE.LOOM);
  setTile(spawnTx + 9, spawnBaseY - 1, SB_TILE.ANVIL);
  setTile(spawnTx + 11, spawnBaseY - 1, SB_TILE.SHRINE);
  setTile(spawnTx + 13, spawnBaseY - 1, SB_TILE.BANNER);
  setTile(spawnTx + 15, spawnBaseY - 1, SB_TILE.SPRING_UP);

  // 8. 13 Biome Teleport Pylons across Surface, Sky, Caverns & Deep Underworld
  const pylons: { tx: number; ty: number; label: string; color: string }[] = [
    { tx: spawnTx - 10, ty: spawnBaseY - 1, label: 'Vale Central (Base)', color: '#4df0c0' },
  ];
  const surfacePylonTargets = [
    { tx: 90, label: 'Porto Estelar Oeste', color: '#38bdf8' },
    { tx: 222, label: 'Masmorra Ametista', color: '#818cf8' },
    { tx: 600, label: 'Fiorde Glacial', color: '#7ce8ff' },
    { tx: 960, label: 'Bosque Bambu Jade', color: '#34d399' },
    { tx: 1322, label: 'Santuário Sakura', color: '#f472b6' },
    { tx: 2032, label: 'Pirâmide Solar', color: '#fbbf24' },
    { tx: 2450, label: 'Selva Bioluminescente', color: '#2dd4bf' },
    { tx: 2820, label: 'Torre do Relógio', color: '#22d3ee' },
    { tx: 3560, label: 'Jardim Crepuscular', color: '#e879f9' },
    { tx: 4320, label: 'Abismo Eclipse Rubro', color: '#f43f5e' },
  ];
  for (const pt of surfacePylonTargets) {
    const py = getSandboxSurfaceHeightAt(pt.tx, seed);
    for (let dx = -2; dx <= 2; dx++) setTile(pt.tx + dx, py, SB_TILE.BRICK_BLOCK);
    setTile(pt.tx, py - 1, SB_TILE.TELEPORT_PYLON);
    setTile(pt.tx - 1, py - 1, SB_TILE.LANTERN);
    setTile(pt.tx + 1, py - 1, SB_TILE.LANTERN);
    pylons.push({ tx: pt.tx, ty: py - 1, label: pt.label, color: pt.color });
  }
  // Sky Pylons
  setTile(1556, 65, SB_TILE.TELEPORT_PYLON);
  pylons.push({ tx: 1556, ty: 65, label: 'Ilha Celeste Central', color: '#7ce8ff' });
  setTile(3486, 65, SB_TILE.TELEPORT_PYLON);
  pylons.push({ tx: 3486, ty: 65, label: 'Monastério das Nuvens', color: '#fde047' });
  // Deep Underworld Pylon Bridges
  for (const uwX of [1620, 3200]) {
    for (let dx = -5; dx <= 5; dx++) setTile(uwX + dx, 540, SB_TILE.OBSIDIAN);
    for (let dy = 1; dy <= 5; dy++) {
      for (let dx = -4; dx <= 4; dx++) setTile(uwX + dx, 540 - dy, SB_TILE.AIR);
    }
    setTile(uwX, 539, SB_TILE.TELEPORT_PYLON);
    setTile(uwX - 2, 539, SB_TILE.CAMPFIRE);
    setTile(uwX + 2, 539, SB_TILE.BANNER);
    pylons.push({
      tx: uwX,
      ty: 539,
      label: uwX < 2500 ? 'Núcleo de Magma' : 'Cidadela Pandemônio',
      color: '#ff5522',
    });
  }

  // 9. Populate Treasures, Life Crystals, Bounce Shrooms, Dash Crystals, Beacons, Lore Tablets & Spikes
  for (let tx = 48; tx < cols - 48; tx += 8) {
    const surfY = getSandboxSurfaceHeightAt(tx, seed);
    const region = getSandboxSurfaceRegion(tx);
    if (tx % 32 === 0 && (region.id === 'jungle' || region.id === 'jade_bamboo')) {
      setTile(tx, surfY - 1, SB_TILE.BOUNCE_SHROOM);
    }
    if (tx % 240 === 80 && Math.abs(tx - spawnTx) > 60) {
      setTile(tx, surfY - 1, SB_TILE.QUEST_BEACON);
    }
    if (tx % 320 === 160 && Math.abs(tx - spawnTx) > 80) {
      setTile(tx, surfY - 1, SB_TILE.LORE_TABLET);
    }
    for (let ty = surfY + 12; ty < 480; ty += 12) {
      const idx = ty * cols + tx;
      const below = (ty + 1) * cols + tx;
      if (tiles[idx] === SB_TILE.AIR && isSandboxSolid(tiles[below])) {
        const r = hash2d(tx, ty, seed + 51);
        if (r > 0.94 && ty > 280) {
          setTile(tx, ty, SB_TILE.LIFE_CRYSTAL);
        } else if (r > 0.88 && ty > 350) {
          setTile(tx, ty, SB_TILE.CHEST);
        } else if (r > 0.78) {
          setTile(tx, ty, SB_TILE.POT);
        } else if (r > 0.70 && ty > 250) {
          setTile(tx, ty, SB_TILE.BOUNCE_SHROOM);
        } else if (r < 0.04 && ty > 310) {
          setTile(tx, ty, SB_TILE.SPIKE_UP);
        }
      }
    }
  }

  // 10. Rich Campaign Scenic Props (bucketed per 64 cols for O(1) rendering!)
  const scenicProps: SandboxScenicProp[] = [];
  for (let tx = 36; tx < cols - 36; tx += 14) {
    if (tx >= spawnTx - 18 && tx <= spawnTx + 18) continue;
    if (greatShaftXs.some((s) => Math.abs(s - tx) < 7)) continue;
    const surfY = getSandboxSurfaceHeightAt(tx, seed);
    if (tiles[(surfY - 1) * cols + tx] !== SB_TILE.AIR) continue;
    const region = getSandboxSurfaceRegion(tx);
    const r = hash2d(tx, 333, seed);
    let kind: SandboxScenicPropKind = 'tree_pine';
    let h = 4;

    if (region.id === 'ocean_west' || region.id === 'ocean_east') {
      kind = r > 0.5 ? 'coral_pillar' : 'ruin_statue';
    } else if (region.id === 'ancient_dungeon') {
      kind = r > 0.5 ? 'ruin_tower' : 'stained_window';
      h = 5;
    } else if (region.id === 'tundra') {
      kind = r > 0.55 ? 'aurora_prism' : r > 0.25 ? 'crystal_spire' : 'tree_pine';
      h = 5;
    } else if (region.id === 'jade_bamboo') {
      kind = r > 0.55 ? 'waterfall' : r > 0.25 ? 'tree_pine' : 'ruin_statue';
      h = 6;
    } else if (region.id === 'crimson_sakura') {
      kind = r > 0.65 ? 'torii_gate' : 'sakura_tree';
      h = 5;
    } else if (region.id === 'forest') {
      kind = r > 0.65 ? 'sakura_tree' : r > 0.3 ? 'tree_pine' : 'ruin_statue';
    } else if (region.id === 'desert') {
      kind = r > 0.65 ? 'pyramid_obelisk' : r > 0.3 ? 'cactus_saguaro' : 'sun_brazier';
    } else if (region.id === 'jungle') {
      kind = r > 0.45 ? 'giant_shroom' : 'alchemy_vat';
    } else if (region.id === 'clockwork_city') {
      kind = r > 0.6 ? 'clock_gear' : r > 0.3 ? 'holo_pylon' : 'pendulum';
      h = 5;
    } else if (region.id === 'crimson_canyon') {
      kind = r > 0.5 ? 'sun_brazier' : 'ruin_tower';
    } else if (region.id === 'twilight_garden') {
      kind = r > 0.45 ? 'willow_tree' : 'marble_column';
      h = 5;
    } else if (region.id === 'obsidian_temple') {
      kind = r > 0.5 ? 'obelisk' : 'stained_window';
      h = 5;
    } else {
      kind = r > 0.5 ? 'obelisk' : 'sun_brazier';
    }
    scenicProps.push({ id: `sp_${tx}_${surfY}`, kind, tx, ty: surfY, h });
  }

  // Mark initial starter hub explored
  markSandboxSectorAt(exploredSectors, spawnTx, spawnBaseY);

  return {
    seed,
    cols,
    rows,
    tiles,
    walls,
    tileDamage,
    exploredSectors,
    spawnTx,
    spawnTy: spawnBaseY - 2,
    dayTime: 9.5,
    houses: [],
    npcs: [
      {
        id: 'npc_guide',
        name: 'Guia Lyra',
        role: 'Exploradora',
        accentColor: '#52e5ff',
        spriteKind: 'astra',
        x: (spawnTx + 2) * TILE_SIZE,
        y: (spawnBaseY - 2) * TILE_SIZE,
        vx: 0,
        homeTx: spawnTx + 2,
        homeTy: spawnBaseY - 1,
        dir: 1,
      },
    ],
    enemies: [],
    scenicProps,
    scenicBuckets: indexScenicBuckets(scenicProps),
    pylons,
    openedChests: new Set(),
    litBeacons: new Set(),
    readTablets: new Set(),
    modifiedCells: new Map(),
    terrainDirtyTiles: [],
    crumbleTimers: new Map(),
    progress: {
      woodGathered: 0,
      oresMined: 0,
      housesBuilt: 0,
      chestsOpened: 0,
      reachedHell: 0,
      reachedSky: 0,
      beaconsLit: 0,
      tabletsRead: 0,
      bossDefeated: 0,
    },
  };
}

/**
 * Pure Campaign-Physics Adapter (`CollisionGrid` from physics.ts) for the Sandbox world!
 * Allows full Celeste/Aethelgard platforming (coyote, buffered jump, wall climb, wave/hyper-dash,
 * dream blocks, cloud bounce, ice, conveyors, water swimming) over the 4800x640 Uint8Array grid.
 */
export function buildSandboxCollisionGrid(
  world: SandboxWorld,
  onSpecialTouch?: (tx: number, ty: number, tile: SB_TILE, kind: 'land' | 'dash' | 'grab') => void
): CollisionGrid {
  const tileAtPx = (px: number, py: number): { tx: number; ty: number; tile: SB_TILE } => {
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    if (tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) {
      return { tx, ty, tile: SB_TILE.STONE };
    }
    const idx = ty * world.cols + tx;
    const cState = world.crumbleTimers.get(idx);
    if (cState && cState.state === 'gone') {
      return { tx, ty, tile: SB_TILE.AIR };
    }
    return { tx, ty, tile: world.tiles[idx] as SB_TILE };
  };

  return {
    isSolidAtPixel(px, py, player) {
      const { tile } = tileAtPx(px, py);
      if (tile === SB_TILE.DREAM_BLOCK) {
        if (player && (player.dashTimer > 0 || player.inDream)) return false;
        return true;
      }
      return isSandboxSolid(tile);
    },
    isOneWayAtPixel(px, py) {
      const { tile } = tileAtPx(px, py);
      return isSandboxPlatform(tile);
    },
    isDreamAtPixel(px, py) {
      return tileAtPx(px, py).tile === SB_TILE.DREAM_BLOCK;
    },
    isIceAtPixel(px, py) {
      const { tile } = tileAtPx(px, py);
      return tile === SB_TILE.ICE || tile === SB_TILE.SNOW;
    },
    isStickyAtPixel(px, py) {
      return tileAtPx(px, py).tile === SB_TILE.JUNGLE_GRASS;
    },
    isMagmaAtPixel(px, py) {
      return tileAtPx(px, py).tile === SB_TILE.MAGMA_CRUST;
    },
    isWaterAtPixel(px, py) {
      return tileAtPx(px, py).tile === SB_TILE.WATER;
    },
    isCloudBounceAtPixel(px, py) {
      return tileAtPx(px, py).tile === SB_TILE.CLOUD_BOUNCE;
    },
    getConveyorAtPixel(px, py) {
      const { tile } = tileAtPx(px, py);
      if (tile === SB_TILE.CONVEYOR_RIGHT) return 1;
      if (tile === SB_TILE.CONVEYOR_LEFT) return -1;
      return 0;
    },
    isHazardAtPixel(px, py) {
      const { tile } = tileAtPx(px, py);
      return tile === SB_TILE.SPIKE_UP || tile === SB_TILE.MAGMA_CRUST;
    },
    onTileTouched(tx, ty, kind) {
      if (tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) return;
      const idx = ty * world.cols + tx;
      const tile = world.tiles[idx] as SB_TILE;
      if (tile === SB_TILE.CRUMBLE && !world.crumbleTimers.has(idx)) {
        world.crumbleTimers.set(idx, { state: 'shaking', timer: 0.48 });
      } else if (tile === SB_TILE.SECRET_WALL && kind === 'dash') {
        setSandboxTile(world, tx, ty, SB_TILE.AIR);
      }
      onSpecialTouch?.(tx, ty, tile, kind);
    },
  };
}

export function setSandboxTile(world: SandboxWorld, tx: number, ty: number, tile: SB_TILE): void {
  if (tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) return;
  const idx = ty * world.cols + tx;
  world.tiles[idx] = tile;
  world.tileDamage[idx] = 0;
  world.modifiedCells.set(idx, { tile, wall: world.walls[idx] });
  world.terrainDirtyTiles.push(idx);
}

export function setSandboxWall(world: SandboxWorld, tx: number, ty: number, wall: SB_WALL): void {
  if (tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) return;
  const idx = ty * world.cols + tx;
  world.walls[idx] = wall;
  world.modifiedCells.set(idx, { tile: world.tiles[idx], wall });
}

export function mineSandboxTile(
  world: SandboxWorld,
  tx: number,
  ty: number,
  toolTier: number
): {
  status: 'empty' | 'too_hard' | 'damaged' | 'broken';
  tileName?: string;
  materialDrop?: MaterialId;
  dropQty?: number;
  selfTileDrop?: SB_TILE;
} {
  if (tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) return { status: 'empty' };
  const idx = ty * world.cols + tx;
  const tile = world.tiles[idx];
  if (tile === SB_TILE.AIR || tile === SB_TILE.WATER) return { status: 'empty' };
  const meta = SANDBOX_TILE_META[tile];
  if (!meta) return { status: 'empty' };
  if (toolTier < meta.minToolTier) {
    return { status: 'too_hard', tileName: meta.name };
  }

  const dmgPower = Math.max(1, toolTier);
  const nextDmg = world.tileDamage[idx] + dmgPower;
  if (nextDmg < meta.hitsRequired) {
    world.tileDamage[idx] = nextDmg;
    return { status: 'damaged', tileName: meta.name };
  }

  setSandboxTile(world, tx, ty, SB_TILE.AIR);
  if (tile === SB_TILE.WOOD_TRUNK || tile === SB_TILE.PLANK || tile === SB_TILE.SAKURA_PLANK) {
    world.progress.woodGathered += 1;
  }
  if (
    tile === SB_TILE.COPPER_ORE ||
    tile === SB_TILE.IRON_ORE ||
    tile === SB_TILE.GOLD_ORE ||
    tile === SB_TILE.MITHRIL_ORE ||
    tile === SB_TILE.TITANIUM_ORE ||
    tile === SB_TILE.ADAMANTITE_ORE ||
    tile === SB_TILE.ETHER_ORE ||
    tile === SB_TILE.HELLSTONE
  ) {
    world.progress.oresMined += 1;
  }
  const extraQty = toolTier >= 6 && meta.materialDrop ? 1 : 0;
  return {
    status: 'broken',
    tileName: meta.name,
    materialDrop: meta.materialDrop,
    dropQty: (meta.dropQty ?? 1) + extraQty,
    selfTileDrop: meta.selfTileDrop,
  };
}

export interface HouseValidationResult {
  valid: boolean;
  reason: string;
  interiorCount: number;
  wallCoverage: number;
  hasDoor: boolean;
  hasTorch: boolean;
  hasTable: boolean;
  hasChair: boolean;
  centerTx: number;
  centerTy: number;
}

export function validateHouseAt(world: SandboxWorld, startTx: number, startTy: number): HouseValidationResult {
  if (startTx < 1 || startTx >= world.cols - 1 || startTy < 1 || startTy >= world.rows - 1) {
    return { valid: false, reason: 'Fora dos limites do mundo', interiorCount: 0, wallCoverage: 0, hasDoor: false, hasTorch: false, hasTable: false, hasChair: false, centerTx: startTx, centerTy: startTy };
  }
  const startTile = world.tiles[startTy * world.cols + startTx];
  if (isSandboxBlockingHouse(startTile)) {
    return { valid: false, reason: 'Fique no interior vazio da casa', interiorCount: 0, wallCoverage: 0, hasDoor: false, hasTorch: false, hasTable: false, hasChair: false, centerTx: startTx, centerTy: startTy };
  }

  const maxInterior = 200;
  const visited = new Set<number>();
  const queue: number[] = [startTx, startTy];
  let head = 0;
  let leaked = false;
  let wallCount = 0;
  let hasDoor = false;
  let hasTorch = false;
  let hasTable = false;
  let hasChair = false;
  let sumX = 0;
  let sumY = 0;

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const idx = cy * world.cols + cx;
    if (visited.has(idx)) continue;
    if (cx <= 0 || cx >= world.cols - 1 || cy <= 0 || cy >= world.rows - 1) {
      leaked = true;
      break;
    }

    const tile = world.tiles[idx];
    if (tile === SB_TILE.DOOR_CLOSED || tile === SB_TILE.DOOR_OPEN) {
      hasDoor = true;
      continue;
    }
    if (isSandboxBlockingHouse(tile)) {
      continue;
    }

    visited.add(idx);
    if (visited.size > maxInterior) {
      leaked = true;
      break;
    }

    sumX += cx;
    sumY += cy;
    if (world.walls[idx] !== SB_WALL.NONE) wallCount++;
    if (tile === SB_TILE.TORCH || tile === SB_TILE.LANTERN) hasTorch = true;
    if (tile === SB_TILE.TABLE || tile === SB_TILE.WORKBENCH) hasTable = true;
    if (tile === SB_TILE.CHAIR || tile === SB_TILE.BED_SPAWN) hasChair = true;

    queue.push(cx + 1, cy, cx - 1, cy, cx, cy + 1, cx, cy - 1);
  }

  const count = visited.size;
  const wallCoverage = count > 0 ? wallCount / count : 0;
  const centerTx = count > 0 ? Math.round(sumX / count) : startTx;
  const centerTy = count > 0 ? Math.round(sumY / count) : startTy;

  if (leaked || count < 12) {
    return {
      valid: false,
      reason: leaked ? 'Casa não está totalmente fechada por paredes/blocos!' : 'Casa muito pequena (mín. 12 blocos internos).',
      interiorCount: count,
      wallCoverage,
      hasDoor,
      hasTorch,
      hasTable,
      hasChair,
      centerTx,
      centerTy,
    };
  }
  if (wallCoverage < 0.6) {
    return { valid: false, reason: 'Preencha ao menos 60% das paredes de fundo.', interiorCount: count, wallCoverage, hasDoor, hasTorch, hasTable, hasChair, centerTx, centerTy };
  }
  if (!hasDoor) {
    return { valid: false, reason: 'Falta uma Porta na parede da casa.', interiorCount: count, wallCoverage, hasDoor, hasTorch, hasTable, hasChair, centerTx, centerTy };
  }
  if (!hasTorch) {
    return { valid: false, reason: 'Falta uma Tocha ou Lanterna para iluminação.', interiorCount: count, wallCoverage, hasDoor, hasTorch, hasTable, hasChair, centerTx, centerTy };
  }
  if (!hasTable || !hasChair) {
    return { valid: false, reason: 'Coloque uma Mesa/Bancada e uma Cadeira/Cama dentro.', interiorCount: count, wallCoverage, hasDoor, hasTorch, hasTable, hasChair, centerTx, centerTy };
  }

  return {
    valid: true,
    reason: 'Casa válida para moradia!',
    interiorCount: count,
    wallCoverage,
    hasDoor,
    hasTorch,
    hasTable,
    hasChair,
    centerTx,
    centerTy,
  };
}

export function registerValidatedHouse(
  world: SandboxWorld,
  res: HouseValidationResult
): { registered: boolean; newNpc?: SandboxNpc } {
  if (!res.valid) return { registered: false };
  const duplicate = world.houses.some(
    (h) => Math.abs(h.centerTx - res.centerTx) < 6 && Math.abs(h.centerTy - res.centerTy) < 5
  );
  if (duplicate) return { registered: false };

  const assignedIds = new Set(world.npcs.map((n) => n.id));
  const nextRoster = NPC_ROSTER.find((r) => !assignedIds.has(r.id));
  const houseId = `house_${world.houses.length + 1}`;
  let spawnedNpc: SandboxNpc | undefined;

  if (nextRoster) {
    spawnedNpc = {
      ...nextRoster,
      x: res.centerTx * TILE_SIZE,
      y: res.centerTy * TILE_SIZE,
      vx: 0,
      homeTx: res.centerTx,
      homeTy: res.centerTy,
      dir: 1,
    };
    world.npcs.push(spawnedNpc);
  }
  world.houses.push({
    id: houseId,
    centerTx: res.centerTx,
    centerTy: res.centerTy,
    npcId: spawnedNpc?.id,
  });
  world.progress.housesBuilt = world.houses.length;
  return { registered: true, newNpc: spawnedNpc };
}

export function isSandboxNight(dayTime: number): boolean {
  const h = ((dayTime % 24) + 24) % 24;
  return h >= 18.5 || h < 5.5;
}

export function spawnSandboxBoss(
  world: SandboxWorld,
  nearPxX: number,
  nearPxY: number,
  bossKind: 'core_boss' | 'leviathan_boss' | 'chronos_boss' | 'magma_boss' = 'core_boss'
): SandboxEnemy {
  const existing = world.enemies.find((e) => e.isBoss && e.hp > 0);
  if (existing) return existing;

  const metaByKind: Record<string, { name: string; spriteKind: string; hp: number; color: string }> = {
    core_boss: { name: 'Guardião do Núcleo Sandbox', spriteKind: 'boss_ignis_rex', hp: 20, color: '#ff2e63' },
    leviathan_boss: { name: 'Leviatã Abissal das Marés', spriteKind: 'boss_leviathan', hp: 26, color: '#38bdf8' },
    chronos_boss: { name: 'Arcanjo Cronos do Relógio', spriteKind: 'boss_chronos', hp: 32, color: '#fbbf24' },
    magma_boss: { name: 'Imperador de Magma', spriteKind: 'boss_ash_behemoth', hp: 40, color: '#ff5522' },
  };
  const m = metaByKind[bossKind] ?? metaByKind.core_boss;

  const boss: SandboxEnemy = {
    id: `sb_boss_${bossKind}_${Date.now()}`,
    kind: bossKind,
    spriteKind: m.spriteKind,
    name: m.name,
    x: Math.max(32, Math.min(SANDBOX_WORLD_WIDTH_PX - 64, nearPxX + 70)),
    y: Math.max(24, nearPxY - 56),
    vx: 0,
    vy: 0,
    hp: m.hp,
    maxHp: m.hp,
    w: 24,
    h: 18,
    color: m.color,
    timer: 0,
    flash: 0,
    isBoss: true,
    shootTimer: 1.5,
  };
  world.enemies.push(boss);
  return boss;
}

export function exportSandboxDelta(world: SandboxWorld): SandboxDeltaSave {
  const changes: [number, number, number][] = [];
  for (const [idx, val] of world.modifiedCells.entries()) {
    changes.push([idx, val.tile, val.wall]);
    if (changes.length >= 9000) break;
  }
  const exploredList: number[] = [];
  for (let i = 0; i < world.exploredSectors.length; i++) {
    if (world.exploredSectors[i] > 0) exploredList.push(i);
  }
  return {
    seed: world.seed,
    dayTime: world.dayTime,
    spawnTx: world.spawnTx,
    spawnTy: world.spawnTy,
    changes,
    houses: world.houses,
    openedChests: Array.from(world.openedChests),
    litBeacons: Array.from(world.litBeacons),
    readTablets: Array.from(world.readTablets),
    exploredSectors: exploredList,
    progress: { ...world.progress },
  };
}

export function applySandboxDelta(world: SandboxWorld, delta: SandboxDeltaSave): void {
  if (typeof delta.dayTime === 'number') world.dayTime = delta.dayTime;
  if (typeof delta.spawnTx === 'number') world.spawnTx = delta.spawnTx;
  if (typeof delta.spawnTy === 'number') world.spawnTy = delta.spawnTy;
  if (Array.isArray(delta.changes)) {
    for (const [idx, tile, wall] of delta.changes) {
      if (idx >= 0 && idx < world.tiles.length) {
        world.tiles[idx] = tile;
        world.walls[idx] = wall;
        world.modifiedCells.set(idx, { tile, wall });
        world.terrainDirtyTiles.push(idx);
      }
    }
  }
  if (Array.isArray(delta.openedChests)) {
    world.openedChests = new Set(delta.openedChests);
  }
  if (Array.isArray(delta.litBeacons)) {
    world.litBeacons = new Set(delta.litBeacons);
  }
  if (Array.isArray(delta.readTablets)) {
    world.readTablets = new Set(delta.readTablets);
  }
  if (Array.isArray(delta.exploredSectors)) {
    for (const sIdx of delta.exploredSectors) {
      if (sIdx >= 0 && sIdx < world.exploredSectors.length) {
        world.exploredSectors[sIdx] = 1;
      }
    }
  }
  if (Array.isArray(delta.houses)) {
    world.houses = delta.houses;
    for (const h of world.houses) {
      if (h.npcId && !world.npcs.some((n) => n.id === h.npcId)) {
        const meta = NPC_ROSTER.find((r) => r.id === h.npcId);
        if (meta) {
          world.npcs.push({
            ...meta,
            x: h.centerTx * TILE_SIZE,
            y: h.centerTy * TILE_SIZE,
            vx: 0,
            homeTx: h.centerTx,
            homeTy: h.centerTy,
            dir: 1,
          });
        }
      }
    }
  }
  if (delta.progress) {
    world.progress = { ...world.progress, ...delta.progress };
  }
}
