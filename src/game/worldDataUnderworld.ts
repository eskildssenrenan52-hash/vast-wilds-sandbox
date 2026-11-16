// @ts-nocheck -- imported game code, written for a looser TS config
// 20 Unique Underworld Biomes + Strict ASCII Map Compiler + Hand-Crafted Underworld Chapters
import {
  AnyBiomeId,
  BiomeId,
  ChapterDef,
  EntityKind,
  ROOM_ROWS,
  RoomDef,
  RoomEntityDef,
  RoomExits,
  RoomPropDef,
  TILE_SIZE,
  TileType,
  UnderworldBiomeId,
} from './types';
import { UNDERWORLD_WORLDS_A, type UnderworldWorldBlueprint } from './worldDataUnderworldMapsA';
import { UNDERWORLD_WORLDS_B } from './worldDataUnderworldMapsB';
import { BIOME_META, type BiomeMeta } from './worldData';
import { buildUniqueUnderworldWing } from './uniqueStageLayouts';

export const UNDERWORLD_BIOME_META: Record<UnderworldBiomeId, BiomeMeta> = {
  styx_ferry: {
    id: 'styx_ferry',
    name: 'Círculo I · Margens do Estige',
    subtitle: 'Águas Negras e Barcas Espectrais',
    skyTop: '#03080c',
    skyMid: '#091b24',
    skyBottom: '#12363d',
    mountainFar: '#07151c',
    mountainMid: '#0d2630',
    mountainNear: '#153b45',
    tileMain: '#244752',
    tileHighlight: '#5eead4',
    tileShadow: '#12272e',
    tileOutline: '#040a0e',
    accent: '#2dd4bf',
    secondaryAccent: '#a7f3d0',
    particleColor: '#5eead4',
  },
  asphodel_wastes: {
    id: 'asphodel_wastes',
    name: 'Círculo II · Pântanos de Asfódelo',
    subtitle: 'Bruma Violeta e Caçadores Furtivos',
    skyTop: '#090414',
    skyMid: '#180c2e',
    skyBottom: '#2d164d',
    mountainFar: '#130924',
    mountainMid: '#1f1038',
    mountainNear: '#2e1952',
    tileMain: '#3f2861',
    tileHighlight: '#c084fc',
    tileShadow: '#23133b',
    tileOutline: '#07030f',
    accent: '#c084fc',
    secondaryAccent: '#f472b6',
    particleColor: '#d8b4fe',
  },
  brass_tartarus: {
    id: 'brass_tartarus',
    name: 'Círculo III · Forja de Bronze',
    subtitle: 'Correntes Incandescentes do Tártaro',
    skyTop: '#120704',
    skyMid: '#261006',
    skyBottom: '#47210a',
    mountainFar: '#1c0c05',
    mountainMid: '#301609',
    mountainNear: '#47220d',
    tileMain: '#6e3d19',
    tileHighlight: '#f59e0b',
    tileShadow: '#3d1e0a',
    tileOutline: '#0f0602',
    accent: '#f59e0b',
    secondaryAccent: '#fed7aa',
    particleColor: '#fbbf24',
  },
  brimstone_caldera: {
    id: 'brimstone_caldera',
    name: 'Círculo IV · Caldeira de Enxofre',
    subtitle: 'Gêiseres Tóxicos e Fissuras Ígneas',
    skyTop: '#120d03',
    skyMid: '#291c05',
    skyBottom: '#4d3208',
    mountainFar: '#1f1504',
    mountainMid: '#332307',
    mountainNear: '#4a330a',
    tileMain: '#594212',
    tileHighlight: '#facc15',
    tileShadow: '#332408',
    tileOutline: '#0d0902',
    accent: '#facc15',
    secondaryAccent: '#fb7185',
    particleColor: '#fde047',
  },
  blood_aqueduct: {
    id: 'blood_aqueduct',
    name: 'Círculo V · Aqueduto Rubro',
    subtitle: 'Cachoeiras Escarlates e Alquimistas',
    skyTop: '#120307',
    skyMid: '#290711',
    skyBottom: '#4a0d1f',
    mountainFar: '#1d050c',
    mountainMid: '#300a15',
    mountainNear: '#470f1f',
    tileMain: '#631d32',
    tileHighlight: '#fb7185',
    tileShadow: '#360d19',
    tileOutline: '#0d0205',
    accent: '#f43f5e',
    secondaryAccent: '#fda4af',
    particleColor: '#fb7185',
  },
  bone_ossuary: {
    id: 'bone_ossuary',
    name: 'Círculo VI · Ossuário Infinito',
    subtitle: 'Catacumbas de Marfim e Lâminas Oscilantes',
    skyTop: '#0a0810',
    skyMid: '#181424',
    skyBottom: '#2d263d',
    mountainFar: '#13101c',
    mountainMid: '#201b2e',
    mountainNear: '#302942',
    tileMain: '#524b63',
    tileHighlight: '#e2e8f0',
    tileShadow: '#2b2638',
    tileOutline: '#08060d',
    accent: '#e2e8f0',
    secondaryAccent: '#a855f7',
    particleColor: '#cbd5e1',
  },
  cocytus_trench: {
    id: 'cocytus_trench',
    name: 'Círculo VII · Fossa de Cocito',
    subtitle: 'Gelo Negro e Estalactites Cortantes',
    skyTop: '#030814',
    skyMid: '#081833',
    skyBottom: '#103059',
    mountainFar: '#061329',
    mountainMid: '#0b2142',
    mountainNear: '#12325e',
    tileMain: '#1f4b78',
    tileHighlight: '#7ce8ff',
    tileShadow: '#102845',
    tileOutline: '#030712',
    accent: '#38bdf8',
    secondaryAccent: '#e0f2fe',
    particleColor: '#7dd3fc',
  },
  phlegethon_rapids: {
    id: 'phlegethon_rapids',
    name: 'Círculo VIII · Corredeiras de Flegetonte',
    subtitle: 'Cascatas de Fogo Líquido e Magma',
    skyTop: '#140402',
    skyMid: '#2e0b04',
    skyBottom: '#5c1808',
    mountainFar: '#210703',
    mountainMid: '#3b1006',
    mountainNear: '#59190a',
    tileMain: '#6e2310',
    tileHighlight: '#ff7733',
    tileShadow: '#3d1106',
    tileOutline: '#120301',
    accent: '#ff5522',
    secondaryAccent: '#fde047',
    particleColor: '#fb923c',
  },
  acheron_gorge: {
    id: 'acheron_gorge',
    name: 'Círculo IX · Garganta de Aqueronte',
    subtitle: 'Abismos Sônicos e Ventos Cortantes',
    skyTop: '#040a14',
    skyMid: '#0b1e33',
    skyBottom: '#153754',
    mountainFar: '#081526',
    mountainMid: '#102740',
    mountainNear: '#193959',
    tileMain: '#2b5275',
    tileHighlight: '#67e8f9',
    tileShadow: '#172f47',
    tileOutline: '#030810',
    accent: '#67e8f9',
    secondaryAccent: '#818cf8',
    particleColor: '#a5f3fc',
  },
  lethe_depths: {
    id: 'lethe_depths',
    name: 'Círculo X · Profundezas do Lete',
    subtitle: 'Águas da Memória e Blocos Oníricos',
    skyTop: '#070517',
    skyMid: '#130e33',
    skyBottom: '#251c59',
    mountainFar: '#0f0b29',
    mountainMid: '#1b1442',
    mountainNear: '#2b2061',
    tileMain: '#3e3080',
    tileHighlight: '#a78bfa',
    tileShadow: '#22194a',
    tileOutline: '#060412',
    accent: '#a78bfa',
    secondaryAccent: '#5eead4',
    particleColor: '#c4b5fd',
  },
  wailing_spires: {
    id: 'wailing_spires',
    name: 'Círculo XI · Torres do Lamento',
    subtitle: 'Pináculos Negros e Gritos Cortantes',
    skyTop: '#0d0414',
    skyMid: '#210a30',
    skyBottom: '#3e1454',
    mountainFar: '#190726',
    mountainMid: '#2c0e40',
    mountainNear: '#42165c',
    tileMain: '#542370',
    tileHighlight: '#e879f9',
    tileShadow: '#2f1142',
    tileOutline: '#0b0310',
    accent: '#e879f9',
    secondaryAccent: '#ffffff',
    particleColor: '#f0abfc',
  },
  iron_dungeon: {
    id: 'iron_dungeon',
    name: 'Círculo XII · Masmorra de Ferro',
    subtitle: 'Grades de Aço e Pêndulos Mortais',
    skyTop: '#07090d',
    skyMid: '#131821',
    skyBottom: '#232c3b',
    mountainFar: '#0f131a',
    mountainMid: '#1b222e',
    mountainNear: '#293345',
    tileMain: '#3e4c63',
    tileHighlight: '#94a3b8',
    tileShadow: '#212936',
    tileOutline: '#06070a',
    accent: '#94a3b8',
    secondaryAccent: '#ef4444',
    particleColor: '#cbd5e1',
  },
  pestilence_marsh: {
    id: 'pestilence_marsh',
    name: 'Círculo XIII · Brejo Pestilento',
    subtitle: 'Ácido Fluorescente e Sapos Venenosos',
    skyTop: '#060d04',
    skyMid: '#10240b',
    skyBottom: '#1d4013',
    mountainFar: '#0c1c08',
    mountainMid: '#16300e',
    mountainNear: '#214716',
    tileMain: '#346121',
    tileHighlight: '#a3e635',
    tileShadow: '#1b3610',
    tileOutline: '#050a03',
    accent: '#a3e635',
    secondaryAccent: '#22c55e',
    particleColor: '#bef264',
  },
  ash_necropolis: {
    id: 'ash_necropolis',
    name: 'Círculo XIV · Necrópole das Cinzas',
    subtitle: 'Mausoléus Quebrados e Predadores Furtivos',
    skyTop: '#0d0907',
    skyMid: '#1f1612',
    skyBottom: '#38271f',
    mountainFar: '#17110e',
    mountainMid: '#291e19',
    mountainNear: '#3d2c25',
    tileMain: '#543f35',
    tileHighlight: '#fb923c',
    tileShadow: '#2e211b',
    tileOutline: '#0a0705',
    accent: '#fb923c',
    secondaryAccent: '#cbd5e1',
    particleColor: '#fdba74',
  },
  obsidian_labyrinth: {
    id: 'obsidian_labyrinth',
    name: 'Círculo XV · Labirinto de Obsidiana',
    subtitle: 'Portais, Blocos Rítmicos e Minotaurs',
    skyTop: '#0b0412',
    skyMid: '#1a0a2b',
    skyBottom: '#31134f',
    mountainFar: '#140821',
    mountainMid: '#230e38',
    mountainNear: '#361654',
    tileMain: '#47216b',
    tileHighlight: '#c026d3',
    tileShadow: '#27113d',
    tileOutline: '#08030e',
    accent: '#c026d3',
    secondaryAccent: '#fde047',
    particleColor: '#e879f9',
  },
  hellglass_cathedral: {
    id: 'hellglass_cathedral',
    name: 'Círculo XVI · Catedral de Vidro',
    subtitle: 'Vitrais Carmesins e Pisos Estilhaçáveis',
    skyTop: '#12040a',
    skyMid: '#290a17',
    skyBottom: '#4a142a',
    mountainFar: '#1f0711',
    mountainMid: '#360e1e',
    mountainNear: '#52162e',
    tileMain: '#6b2240',
    tileHighlight: '#fb7185',
    tileShadow: '#3b1122',
    tileOutline: '#0e0308',
    accent: '#fb7185',
    secondaryAccent: '#bae6fd',
    particleColor: '#fda4af',
  },
  shadow_sanctum: {
    id: 'shadow_sanctum',
    name: 'Círculo XVII · Santuário das Sombras',
    subtitle: 'Escuridão Viva e Tochas Guias',
    skyTop: '#03030a',
    skyMid: '#08091c',
    skyBottom: '#131538',
    mountainFar: '#060714',
    mountainMid: '#0d0f29',
    mountainNear: '#171a40',
    tileMain: '#24295c',
    tileHighlight: '#818cf8',
    tileShadow: '#121536',
    tileOutline: '#020208',
    accent: '#6366f1',
    secondaryAccent: '#c7d2fe',
    particleColor: '#818cf8',
  },
  magma_core: {
    id: 'magma_core',
    name: 'Círculo XVIII · Núcleo Abissal',
    subtitle: 'Pressão Máxima e Superaquecimento',
    skyTop: '#140202',
    skyMid: '#300505',
    skyBottom: '#610c0c',
    mountainFar: '#240404',
    mountainMid: '#400808',
    mountainNear: '#610e0e',
    tileMain: '#781717',
    tileHighlight: '#ff6622',
    tileShadow: '#420a0a',
    tileOutline: '#120202',
    accent: '#ef4444',
    secondaryAccent: '#ffd24d',
    particleColor: '#ff7733',
  },
  void_gate: {
    id: 'void_gate',
    name: 'Círculo XIX · Portal do Abismo Nulo',
    subtitle: 'Singularidade, Antimatéria e Desafios Finais',
    skyTop: '#02080d',
    skyMid: '#071a26',
    skyBottom: '#0e3447',
    mountainFar: '#05121a',
    mountainMid: '#0b2533',
    mountainNear: '#123a4f',
    tileMain: '#1b4f69',
    tileHighlight: '#22d3ee',
    tileShadow: '#0d2b3b',
    tileOutline: '#02060a',
    accent: '#22d3ee',
    secondaryAccent: '#f43f5e',
    particleColor: '#67e8f9',
  },
  pandemonium_citadel: {
    id: 'pandemonium_citadel',
    name: 'Círculo XX · Cidadela de Pandemônio',
    subtitle: 'O Trono Negro e o Juízo Final do Submundo',
    skyTop: '#0d0206',
    skyMid: '#240511',
    skyBottom: '#470a21',
    mountainFar: '#1a030c',
    mountainMid: '#300717',
    mountainNear: '#4d0c24',
    tileMain: '#631431',
    tileHighlight: '#ffe066',
    tileShadow: '#360919',
    tileOutline: '#0a0105',
    accent: '#ff2e63',
    secondaryAccent: '#ffe066',
    particleColor: '#ffe066',
  },
};

export function getAnyBiomeMeta(biome: AnyBiomeId): BiomeMeta {
  if (biome in BIOME_META) return BIOME_META[biome as BiomeId];
  if (biome in UNDERWORLD_BIOME_META) return UNDERWORLD_BIOME_META[biome as UnderworldBiomeId];
  return BIOME_META.silver_ash;
}

const ASCII_COLS = 44;
const ASCII_ROWS = 24;

function charToTile(ch: string): number {
  switch (ch) {
    case '#': return TileType.SOLID;
    case '=': return TileType.ONE_WAY;
    case '^': return TileType.SPIKE_UP;
    case 'v': return TileType.SPIKE_DOWN;
    case '<': return TileType.SPIKE_LEFT;
    case '>': return TileType.SPIKE_RIGHT;
    case '~': return TileType.LIQUID_LETHAL;
    case 'w': return TileType.WATER;
    case 'D': return TileType.DREAM_BLOCK;
    case 'I': return TileType.ICE;
    case 'C': return TileType.CRUMBLE;
    case 'G': return TileType.FRAGILE_GLASS;
    case 'S': return TileType.STICKY_RESIN;
    case 'L': return TileType.CONVEYOR_LEFT;
    case 'R': return TileType.CONVEYOR_RIGHT;
    case 'A': return TileType.BEAT_A;
    case 'B': return TileType.BEAT_B;
    case 'K': return TileType.BREAKABLE;
    case 'M': return TileType.MAGMA_CRUST;
    case 'O': return TileType.CLOUD_BOUNCE;
    default: return TileType.EMPTY;
  }
}

function getBiomePropPool(biome: UnderworldBiomeId): RoomPropDef['kind'][] {
  switch (biome) {
    case 'styx_ferry': return ['lantern', 'chain', 'sunken_anchor', 'soul_urn'];
    case 'asphodel_wastes': return ['willow_tree', 'lantern', 'ruin_tower'];
    case 'brass_tartarus': return ['anvil', 'chain', 'brazier', 'clock_gear'];
    case 'brimstone_caldera': return ['brazier', 'obelisk', 'canyon_totem'];
    case 'blood_aqueduct': return ['waterfall', 'stained_window', 'arch'];
    case 'bone_ossuary': return ['soul_urn', 'pillar', 'statue'];
    case 'cocytus_trench': return ['frost_arch', 'crystal_spire', 'aurora_prism'];
    case 'phlegethon_rapids': return ['brazier', 'waterfall', 'chain'];
    case 'acheron_gorge': return ['wind_chime', 'ruin_tower', 'hanging_vine'];
    case 'lethe_depths': return ['twilight_lotus', 'crystal_cluster', 'aurora_prism'];
    case 'wailing_spires': return ['rose_window', 'tesla_coil', 'pillar'];
    case 'iron_dungeon': return ['chain', 'pendulum', 'brazier'];
    case 'pestilence_marsh': return ['shroom_giant', 'alchemy_vat', 'hanging_vine'];
    case 'ash_necropolis': return ['obelisk', 'statue', 'brazier'];
    case 'obsidian_labyrinth': return ['pyramid_obelisk', 'pillar', 'crystal_spire'];
    case 'hellglass_cathedral': return ['rose_window', 'stained_window', 'crystal_chandelier'];
    case 'shadow_sanctum': return ['lantern', 'soul_urn', 'obelisk'];
    case 'magma_core': return ['brazier', 'crystal_cluster', 'anvil'];
    case 'void_gate': return ['holo_pylon', 'star_satellite', 'aurora_prism'];
    case 'pandemonium_citadel': return ['sun_brazier', 'marble_column', 'stained_window'];
  }
}

const EXPANDED_UW_COLS = ASCII_COLS * 3; // 132 cols (3x width!)

function buildUnderworldExpansionWing(
  tiles: number[],
  cols: number,
  rows: number,
  entities: RoomEntityDef[],
  prefix: string,
  eidRef: { v: number },
  world: UnderworldWorldBlueprint,
  stageIdx: number,
  wingStart: number,
  wingWidth: number,
  leftRow: number,
  rightRow: number,
  wingRole: 'approach' | 'mid_viaduct' | 'vault'
): void {
  buildUniqueUnderworldWing(
    tiles,
    cols,
    rows,
    entities,
    prefix,
    eidRef,
    world.index,
    stageIdx,
    { a: world.enemyA, b: world.enemyB, c: world.enemyC },
    wingStart,
    wingWidth,
    leftRow,
    rightRow,
    wingRole
  );
}

export function buildRoomFromAscii(
  world: UnderworldWorldBlueprint,
  stageIdx: number
): RoomDef {
  const st = world.stages[stageIdx];
  const cols = EXPANDED_UW_COLS;
  const rows = ASCII_ROWS;
  const tiles = new Array<number>(cols * rows).fill(TileType.EMPTY);
  const entities: RoomEntityDef[] = [];
  const props: RoomPropDef[] = [];
  const prefix = `uw_ch${world.index}_s${stageIdx}`;
  const eidRef = { v: 0 };

  const hasLeftDoor = st.exitLeftRow !== undefined;
  const coreOffset = hasLeftDoor ? ASCII_COLS : 0; // Start stage keeps Zone 0 at 0; Stages 1..4 put core gauntlet at 44!

  let spawnX = 3 * TILE_SIZE;
  let spawnY = (st.exitLeftRow ?? 20) * TILE_SIZE - 11;

  // 1. Stamp the hand-crafted 44x24 Underworld core gauntlet at [coreOffset .. coreOffset + 43]
  for (let r = 0; r < rows; r++) {
    const rawLine = st.grid[r] ?? '#'.padEnd(ASCII_COLS, '.');
    for (let lc = 0; lc < ASCII_COLS; lc++) {
      const c = coreOffset + lc;
      const ch = lc < rawLine.length ? rawLine[lc] : (st.exitRightRow !== undefined && r >= st.exitRightRow - 5 && r < st.exitRightRow ? '.' : '#');
      const idx = r * cols + c;
      const tile = charToTile(ch);
      if (tile !== TileType.EMPTY) {
        tiles[idx] = tile;
        continue;
      }

      const px = c * TILE_SIZE;
      const py = r * TILE_SIZE;
      if (ch === '@') {
        spawnX = px;
        spawnY = (r + 1) * TILE_SIZE - 11;
      } else if (ch === 's') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'spring_up', x: px, y: py });
      } else if (ch === 'c') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'dash_crystal', x: px, y: py });
      } else if (ch === 'd') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'double_dash_crystal', x: px, y: py });
      } else if (ch === 'j') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'jump_orb', x: px, y: py });
      } else if (ch === 'b') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'bumper_orb', x: px, y: py });
      } else if (ch === 'g') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'grapple_anchor', x: px, y: py });
        props.push({ kind: 'chain', tx: c, ty: Math.max(1, r - 2), h: 2 });
      } else if (ch === 'k') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'checkpoint_totem', x: px, y: py });
      } else if (ch === 'h') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'heal_orb', x: px, y: py });
      } else if (ch === 'f') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'campfire', x: px, y: py });
      } else if (ch === '*') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'relic', x: px, y: py });
      } else if (ch === '$') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'astral_coin', x: px, y: py });
      } else if (ch === 't') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'torch', x: px, y: py });
      } else if (ch === 'p') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'portal_a', x: px, y: py, linkId: 'uw_p1' });
      } else if (ch === 'q') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'portal_b', x: px, y: py, linkId: 'uw_p1' });
      } else if (ch === 'u') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'wind_up', x: px, y: py, w: 24, h: 48 });
      } else if (ch === 'z') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'boost_hoop', x: px, y: py });
      } else if (ch === '!') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'falling_icicle', x: px, y: py });
      } else if (ch === 'X') {
        entities.push({ id: `${prefix}_e${eidRef.v++}`, kind: 'spinner', x: px, y: py });
      } else if (ch === 'E') {
        const kind: EntityKind = stageIdx === 2 && eidRef.v % 2 === 1 ? world.enemyC : world.enemyA;
        entities.push({
          id: `${prefix}_e${eidRef.v++}`,
          kind,
          x: px,
          y: py,
          patrolDist: 28,
          dir: lc > ASCII_COLS * 0.5 ? -1 : 1,
        });
      } else if (ch === 'F') {
        const kind: EntityKind = stageIdx >= 3 && eidRef.v % 2 === 1 ? world.enemyC : world.enemyB;
        entities.push({
          id: `${prefix}_e${eidRef.v++}`,
          kind,
          x: px,
          y: py,
          patrolDist: 28,
          dir: lc > ASCII_COLS * 0.5 ? -1 : 1,
        });
      } else if (ch === 'Z') {
        entities.push({
          id: `${prefix}_boss_${world.boss}`,
          kind: world.boss,
          x: px,
          y: py,
          dir: -1,
        });
        entities.push({
          id: `${prefix}_goal`,
          kind: 'chapter_goal',
          x: Math.min(coreOffset + ASCII_COLS - 5, c + 6) * TILE_SIZE,
          y: (20 - 1) * TILE_SIZE,
        });
      }
    }
  }

  // 2. Build 2 brand-new 44x24 Underworld Expansion Wings so every Underworld stage is 3x wider (132x24)!
  const openSeam = (seamCol: number, floorRow: number) => {
    const rFl = Math.max(8, Math.min(rows - 4, floorRow));
    for (let dc = -3; dc <= 3; dc++) {
      const c = seamCol + dc;
      if (c <= 0 || c >= cols - 1) continue;
      for (let r = Math.max(2, rFl - 5); r < rFl; r++) {
        tiles[r * cols + c] = TileType.EMPTY;
      }
      tiles[rFl * cols + c] = TileType.SOLID;
      for (let r = rFl + 1; r < rows; r++) {
        tiles[r * cols + c] = TileType.SOLID;
      }
    }
  };

  if (coreOffset === 0) {
    // Stage 0: Core gauntlet at 0..43; expand Zone 2 (44..87) & Zone 3 (88..131) to the right
    const seamRow = st.exitRightRow ?? 20;
    buildUnderworldExpansionWing(tiles, cols, rows, entities, prefix, eidRef, world, stageIdx, ASCII_COLS, ASCII_COLS, seamRow, seamRow, 'mid_viaduct');
    buildUnderworldExpansionWing(tiles, cols, rows, entities, prefix, eidRef, world, stageIdx, ASCII_COLS * 2, ASCII_COLS, seamRow, seamRow, 'vault');
    openSeam(ASCII_COLS, seamRow);
    openSeam(ASCII_COLS * 2, seamRow);
  } else {
    // Stages 1..4: Approach Wing at 0..43 -> Core Gauntlet at 44..87 -> Treasury/Exit Wing at 88..131
    const leftEntry = st.exitLeftRow ?? 20;
    const rightOut = st.exitRightRow ?? 20;
    buildUnderworldExpansionWing(tiles, cols, rows, entities, prefix, eidRef, world, stageIdx, 0, ASCII_COLS, leftEntry, leftEntry, 'approach');
    openSeam(ASCII_COLS, leftEntry);
    buildUnderworldExpansionWing(tiles, cols, rows, entities, prefix, eidRef, world, stageIdx, ASCII_COLS * 2, ASCII_COLS, rightOut, rightOut, 'vault');
    openSeam(ASCII_COLS * 2, rightOut);
  }

  // 3. Enforce crisp outer perimeter doorway corridors and solid edge floors for 100% seamless transitions
  const exits: RoomExits = {};
  if (st.exitLeftRow !== undefined) {
    exits.leftRow = st.exitLeftRow;
    for (let r = Math.max(1, st.exitLeftRow - 5); r < st.exitLeftRow; r++) {
      for (let c = 0; c <= 2; c++) {
        tiles[r * cols + c] = TileType.EMPTY;
      }
    }
    for (let c = 0; c <= 4; c++) {
      tiles[st.exitLeftRow * cols + c] = TileType.SOLID;
    }
    spawnX = 2 * TILE_SIZE;
    spawnY = st.exitLeftRow * TILE_SIZE - 11;
  } else {
    for (let r = 0; r < rows; r++) tiles[r * cols + 0] = TileType.SOLID;
  }

  if (st.exitRightRow !== undefined) {
    exits.rightRow = st.exitRightRow;
    for (let r = Math.max(1, st.exitRightRow - 5); r < st.exitRightRow; r++) {
      for (let c = cols - 3; c < cols; c++) {
        tiles[r * cols + c] = TileType.EMPTY;
      }
    }
    for (let c = cols - 5; c < cols; c++) {
      tiles[st.exitRightRow * cols + c] = TileType.SOLID;
    }
  } else {
    for (let r = 0; r < rows; r++) tiles[r * cols + (cols - 1)] = TileType.SOLID;
  }

  // Guarantee top roof is always closed solid
  for (let c = 0; c < cols; c++) tiles[0 * cols + c] = TileType.SOLID;

  // Sprinkle deterministic world-appropriate atmospheric background props across all 3x wings
  const propPool = getBiomePropPool(world.biome);
  for (let i = 0; i < 12; i++) {
    const px = 6 + i * 10 + ((world.index + stageIdx) % 3);
    if (px < cols - 4) {
      props.push({
        kind: propPool[(world.index + stageIdx + i) % propPool.length],
        tx: px,
        ty: 4 + (i % 2) * 2,
        h: 4 + (i % 3),
      });
    }
  }

  return {
    id: `uw_ch${world.index}_${stageIdx},0`,
    chapterIndex: world.index,
    stageIndex: stageIdx,
    gx: stageIdx,
    gy: 0,
    cols,
    rows,
    biome: world.biome,
    name: `${world.name.replace(/^Círculo [IVXLCDM]+ · /, '')} · ${st.name}`,
    subtitle: st.subtitle,
    dark: st.dark,
    tiles,
    entities,
    props,
    spawnX,
    spawnY,
    exits,
  };
}

const ALL_UW_BLUEPRINTS: UnderworldWorldBlueprint[] = [
  ...UNDERWORLD_WORLDS_A,
  ...UNDERWORLD_WORLDS_B,
];

export const UNDERWORLD_CHAPTERS: ChapterDef[] = ALL_UW_BLUEPRINTS.map((w) => {
  const stages = w.stages.map((_, sIdx) => buildRoomFromAscii(w, sIdx));
  const totalRelics = stages.reduce(
    (acc, st) => acc + st.entities.filter((e) => e.kind === 'relic' || e.kind === 'winged_relic').length,
    0
  );
  return {
    index: w.index,
    id: w.biome,
    name: w.name,
    subtitle: w.subtitle,
    difficultyLabel: w.difficultyLabel,
    accent: w.accent,
    startStageId: stages[0].id,
    stages,
    totalRelics,
  };
});
