// @ts-nocheck
import { BiomeId, BossEntityKind, EntityKind, RoomPropDef, TileType } from './types';
import {
  buildNew30UniqueBossArena,
  buildNew30UniqueSanctuary,
  buildNew30UniqueStart,
  layoutHash,
} from './uniqueStageLayouts';

export interface BiomeMetaLike {
  id: BiomeId;
  name: string;
  subtitle: string;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  mountainFar: string;
  mountainMid: string;
  mountainNear: string;
  tileMain: string;
  tileHighlight: string;
  tileShadow: string;
  tileOutline: string;
  accent: string;
  secondaryAccent: string;
  particleColor: string;
}

export interface NpcProfileLike {
  id: string;
  name: string;
  role: string;
  accentColor: string;
  voicePitch: number;
  lines: string[];
  choices?: { label: string; reply: string }[];
}

export interface StagePainterLike {
  readonly cols: number;
  readonly rows: number;
  get(tx: number, ty: number): number;
  set(tx: number, ty: number, val: number): void;
  rect(x: number, y: number, w: number, h: number, val: number): void;
  cliff(x: number, topY: number, w: number, val?: number): void;
  island(x: number, y: number, w: number, thickness?: number, val?: number): void;
  ceilingMass(x: number, w: number, depth: number, val?: number): void;
  spikes(x: number, y: number, len: number, dir: 'up' | 'down' | 'left' | 'right', vertical?: boolean): void;
  add(kind: EntityKind, tx: number, ty: number, extra?: Record<string, any>): void;
  prop(kind: RoomPropDef['kind'], tx: number, ty: number, h?: number): void;
}

export const NEW_30_BIOME_META: Record<
  | 'coral_abyss'
  | 'ember_steppe'
  | 'jade_bamboo'
  | 'glacial_fjord'
  | 'rust_foundry'
  | 'fungal_myriad'
  | 'storm_archipelago'
  | 'obsidian_temple'
  | 'mercury_mire'
  | 'crimson_foundry'
  | 'mirror_labyrinth'
  | 'hourglass_desert'
  | 'velvet_opera'
  | 'bone_catacombs'
  | 'cloud_monastery'
  | 'cyber_grid'
  | 'amber_hive'
  | 'astral_library'
  | 'magnetic_rift'
  | 'prism_sanctum'
  | 'void_nebula'
  | 'solar_corona'
  | 'lunar_bastion'
  | 'chrono_paradox'
  | 'starlight_harbor'
  | 'blood_eclipse'
  | 'crystal_singularity'
  | 'seraph_citadel'
  | 'abyss_throne'
  | 'eternity_apex',
  BiomeMetaLike
> = {
  coral_abyss: {
    id: 'coral_abyss',
    name: 'Fase 21 · Abismo de Coral',
    subtitle: 'Recifes Fosforescentes & Fossa Abissal',
    skyTop: '#020e1c',
    skyMid: '#062640',
    skyBottom: '#0c4d6e',
    mountainFar: '#051f33',
    mountainMid: '#093452',
    mountainNear: '#104f75',
    tileMain: '#19647e',
    tileHighlight: '#ff7eb6',
    tileShadow: '#0d3b4d',
    tileOutline: '#010812',
    accent: '#ff7eb6',
    secondaryAccent: '#38f8ff',
    particleColor: '#a6f9ff',
  },
  ember_steppe: {
    id: 'ember_steppe',
    name: 'Fase 22 · Estepe das Brasas',
    subtitle: 'Campos Vulcânicos & Gêiseres de Fogo',
    skyTop: '#170603',
    skyMid: '#3b1106',
    skyBottom: '#78260c',
    mountainFar: '#260a04',
    mountainMid: '#471508',
    mountainNear: '#6e220c',
    tileMain: '#59291f',
    tileHighlight: '#ff9642',
    tileShadow: '#33120d',
    tileOutline: '#120302',
    accent: '#ff7b29',
    secondaryAccent: '#ffe066',
    particleColor: '#ffb366',
  },
  jade_bamboo: {
    id: 'jade_bamboo',
    name: 'Fase 23 · Floresta de Bambu Jade',
    subtitle: 'Ventos Esmeralda & Telhados Antigos',
    skyTop: '#04140e',
    skyMid: '#0a2e20',
    skyBottom: '#15543b',
    mountainFar: '#072117',
    mountainMid: '#0f3b29',
    mountainNear: '#19593e',
    tileMain: '#286b4a',
    tileHighlight: '#80ffc4',
    tileShadow: '#153d29',
    tileOutline: '#020a07',
    accent: '#4ade80',
    secondaryAccent: '#bef264',
    particleColor: '#bbf7d0',
  },
  glacial_fjord: {
    id: 'glacial_fjord',
    name: 'Fase 24 · Fiorde Glacial',
    subtitle: 'Penhascos Nórdicos & Ventos Boreais',
    skyTop: '#041021',
    skyMid: '#0d2647',
    skyBottom: '#1e4a78',
    mountainFar: '#091b33',
    mountainMid: '#123159',
    mountainNear: '#1e4b82',
    tileMain: '#38689c',
    tileHighlight: '#bae6fd',
    tileShadow: '#1e3c61',
    tileOutline: '#020812',
    accent: '#38bdf8',
    secondaryAccent: '#e0f2fe',
    particleColor: '#f0f9ff',
  },
  rust_foundry: {
    id: 'rust_foundry',
    name: 'Fase 25 · Fundição Ferrugem',
    subtitle: 'Caldeiras Industriais & Pistões de Ferro',
    skyTop: '#120b07',
    skyMid: '#2b1b12',
    skyBottom: '#4f3220',
    mountainFar: '#1c110b',
    mountainMid: '#362115',
    mountainNear: '#543320',
    tileMain: '#6e452e',
    tileHighlight: '#f59e0b',
    tileShadow: '#3d2417',
    tileOutline: '#0d0704',
    accent: '#f59e0b',
    secondaryAccent: '#fb7185',
    particleColor: '#fcd34d',
  },
  fungal_myriad: {
    id: 'fungal_myriad',
    name: 'Fase 26 · Micélio Miríade',
    subtitle: 'Cúpulas de Esporos & Colônia Viva',
    skyTop: '#0d041a',
    skyMid: '#220b3b',
    skyBottom: '#3e1863',
    mountainFar: '#160729',
    mountainMid: '#2c104a',
    mountainNear: '#471a73',
    tileMain: '#4d2b7a',
    tileHighlight: '#e879f9',
    tileShadow: '#2b1547',
    tileOutline: '#080212',
    accent: '#e879f9',
    secondaryAccent: '#34d399',
    particleColor: '#f5d0fe',
  },
  storm_archipelago: {
    id: 'storm_archipelago',
    name: 'Fase 27 · Arquipélago Tempestuoso',
    subtitle: 'Ilhas Voadoras sob Trovões Contínuos',
    skyTop: '#050c17',
    skyMid: '#0e2038',
    skyBottom: '#1c3e66',
    mountainFar: '#0a1626',
    mountainMid: '#132a47',
    mountainNear: '#1e426b',
    tileMain: '#33577d',
    tileHighlight: '#7dd3fc',
    tileShadow: '#1b314a',
    tileOutline: '#03080f',
    accent: '#22d3ee',
    secondaryAccent: '#fde047',
    particleColor: '#cffafe',
  },
  obsidian_temple: {
    id: 'obsidian_temple',
    name: 'Fase 28 · Templo de Obsidiana',
    subtitle: 'Zigurate Sagrado de Turquesa & Ouro',
    skyTop: '#040d0f',
    skyMid: '#0b2126',
    skyBottom: '#143c42',
    mountainFar: '#07171a',
    mountainMid: '#0f2b30',
    mountainNear: '#18444a',
    tileMain: '#28323b',
    tileHighlight: '#2dd4bf',
    tileShadow: '#141a21',
    tileOutline: '#020508',
    accent: '#14b8a6',
    secondaryAccent: '#fbbf24',
    particleColor: '#99f6e4',
  },
  mercury_mire: {
    id: 'mercury_mire',
    name: 'Fase 29 · Pântano de Mercúrio',
    subtitle: 'Lagos Prateados & Névoa Alquímica',
    skyTop: '#080d14',
    skyMid: '#152230',
    skyBottom: '#293f54',
    mountainFar: '#0e1721',
    mountainMid: '#1b2c3d',
    mountainNear: '#2b455e',
    tileMain: '#475c73',
    tileHighlight: '#cbd5e1',
    tileShadow: '#263442',
    tileOutline: '#05080d',
    accent: '#94a3b8',
    secondaryAccent: '#a3e635',
    particleColor: '#e2e8f0',
  },
  crimson_foundry: {
    id: 'crimson_foundry',
    name: 'Fase 30 · Fornalha Rubra',
    subtitle: 'Sinos de Sangue & Correntes Ardentes',
    skyTop: '#170206',
    skyMid: '#360610',
    skyBottom: '#660d1f',
    mountainFar: '#24040a',
    mountainMid: '#450915',
    mountainNear: '#6e1022',
    tileMain: '#5e1b29',
    tileHighlight: '#fb7185',
    tileShadow: '#360c15',
    tileOutline: '#120104',
    accent: '#f43f5e',
    secondaryAccent: '#fde047',
    particleColor: '#fda4af',
  },
  mirror_labyrinth: {
    id: 'mirror_labyrinth',
    name: 'Fase 31 · Labirinto dos Espelhos',
    subtitle: 'Galerias de Cristal Refletor',
    skyTop: '#070a1c',
    skyMid: '#131b42',
    skyBottom: '#253575',
    mountainFar: '#0d122e',
    mountainMid: '#1a2454',
    mountainNear: '#2c3d82',
    tileMain: '#4d63a8',
    tileHighlight: '#f0abfc',
    tileShadow: '#283666',
    tileOutline: '#040612',
    accent: '#e879f9',
    secondaryAccent: '#67e8f9',
    particleColor: '#ffffff',
  },
  hourglass_desert: {
    id: 'hourglass_desert',
    name: 'Fase 32 · Deserto da Ampulheta',
    subtitle: 'Dunas Temporais & Templos Soterrados',
    skyTop: '#1c1003',
    skyMid: '#422808',
    skyBottom: '#7a4b12',
    mountainFar: '#2b1905',
    mountainMid: '#4f2f0a',
    mountainNear: '#7a4a12',
    tileMain: '#a16b27',
    tileHighlight: '#fde047',
    tileShadow: '#633e11',
    tileOutline: '#140b02',
    accent: '#fbbf24',
    secondaryAccent: '#38bdf8',
    particleColor: '#fef08a',
  },
  velvet_opera: {
    id: 'velvet_opera',
    name: 'Fase 33 · Ópera de Veludo',
    subtitle: 'Teatro Fantasma de Lustres Dourados',
    skyTop: '#140412',
    skyMid: '#300a29',
    skyBottom: '#591448',
    mountainFar: '#21061c',
    mountainMid: '#3d0d33',
    mountainNear: '#611850',
    tileMain: '#63224e',
    tileHighlight: '#fda4af',
    tileShadow: '#38102b',
    tileOutline: '#0f020c',
    accent: '#fb7185',
    secondaryAccent: '#ffd24d',
    particleColor: '#ffe4e6',
  },
  bone_catacombs: {
    id: 'bone_catacombs',
    name: 'Fase 34 · Catacumbas de Marfim',
    subtitle: 'Ossuário Antigo & Chamas Espectrais',
    skyTop: '#09090d',
    skyMid: '#1a1a24',
    skyBottom: '#323242',
    mountainFar: '#12121a',
    mountainMid: '#242430',
    mountainNear: '#39394a',
    tileMain: '#6b6b7d',
    tileHighlight: '#f1f5f9',
    tileShadow: '#3d3d4a',
    tileOutline: '#050508',
    accent: '#e2e8f0',
    secondaryAccent: '#2dd4bf',
    particleColor: '#f8fafc',
  },
  cloud_monastery: {
    id: 'cloud_monastery',
    name: 'Fase 35 · Monastério das Nuvens',
    subtitle: 'Mosteiros Dourados Acima do Horizonte',
    skyTop: '#081b33',
    skyMid: '#173f66',
    skyBottom: '#3574a6',
    mountainFar: '#102d4d',
    mountainMid: '#1f4e7a',
    mountainNear: '#326ea3',
    tileMain: '#789cc4',
    tileHighlight: '#fef08a',
    tileShadow: '#426085',
    tileOutline: '#061121',
    accent: '#fde047',
    secondaryAccent: '#ffffff',
    particleColor: '#fef9c3',
  },
  cyber_grid: {
    id: 'cyber_grid',
    name: 'Fase 36 · Matriz Holográfica',
    subtitle: 'Horizonte Synthwave & Feixes de Dados',
    skyTop: '#050214',
    skyMid: '#140636',
    skyBottom: '#2d0b66',
    mountainFar: '#0c0424',
    mountainMid: '#1b0947',
    mountainNear: '#2f1073',
    tileMain: '#1f2359',
    tileHighlight: '#00f5d4',
    tileShadow: '#0f1233',
    tileOutline: '#02010a',
    accent: '#00f5d4',
    secondaryAccent: '#ff2a85',
    particleColor: '#72efdd',
  },
  amber_hive: {
    id: 'amber_hive',
    name: 'Fase 37 · Colmeia de Âmbar',
    subtitle: 'Alvéolos Hexagonais & Resina Dourada',
    skyTop: '#170c02',
    skyMid: '#382005',
    skyBottom: '#6b3e09',
    mountainFar: '#241403',
    mountainMid: '#472907',
    mountainNear: '#73420a',
    tileMain: '#8f5511',
    tileHighlight: '#fcd34d',
    tileShadow: '#522f07',
    tileOutline: '#120801',
    accent: '#f59e0b',
    secondaryAccent: '#fef08a',
    particleColor: '#fde68a',
  },
  astral_library: {
    id: 'astral_library',
    name: 'Fase 38 · Biblioteca Infinita',
    subtitle: 'Estantes Colossais & Tomos Flutuantes',
    skyTop: '#06071a',
    skyMid: '#12153d',
    skyBottom: '#24296b',
    mountainFar: '#0b0d29',
    mountainMid: '#181c4a',
    mountainNear: '#282f73',
    tileMain: '#47437a',
    tileHighlight: '#a5b4fc',
    tileShadow: '#26234a',
    tileOutline: '#040410',
    accent: '#818cf8',
    secondaryAccent: '#fbbf24',
    particleColor: '#e0e7ff',
  },
  magnetic_rift: {
    id: 'magnetic_rift',
    name: 'Fase 39 · Fenda Magnética',
    subtitle: 'Monólitos Levitantes & Arcos Polares',
    skyTop: '#0a0317',
    skyMid: '#20093d',
    skyBottom: '#3e126e',
    mountainFar: '#120526',
    mountainMid: '#2a0d4f',
    mountainNear: '#471780',
    tileMain: '#4e2f78',
    tileHighlight: '#c084fc',
    tileShadow: '#2a1647',
    tileOutline: '#06010f',
    accent: '#a855f7',
    secondaryAccent: '#22d3ee',
    particleColor: '#e9d5ff',
  },
  prism_sanctum: {
    id: 'prism_sanctum',
    name: 'Fase 40 · Santuário do Prisma',
    subtitle: 'Espectros Arco-Íris & Pilares Diamante',
    skyTop: '#0a061c',
    skyMid: '#1b1140',
    skyBottom: '#33216b',
    mountainFar: '#110a2b',
    mountainMid: '#241652',
    mountainNear: '#3b247d',
    tileMain: '#5b4b94',
    tileHighlight: '#f9a8d4',
    tileShadow: '#332859',
    tileOutline: '#050310',
    accent: '#f472b6',
    secondaryAccent: '#38bdf8',
    particleColor: '#fdf2f8',
  },
  void_nebula: {
    id: 'void_nebula',
    name: 'Fase 41 · Nebulosa do Vazio',
    subtitle: 'Poeira Cósmica & Asteroides Errantes',
    skyTop: '#03010a',
    skyMid: '#100526',
    skyBottom: '#230b4d',
    mountainFar: '#080317',
    mountainMid: '#160733',
    mountainNear: '#2b0f5e',
    tileMain: '#381e63',
    tileHighlight: '#d8b4fe',
    tileShadow: '#1e0e38',
    tileOutline: '#020005',
    accent: '#c084fc',
    secondaryAccent: '#f472b6',
    particleColor: '#f3e8ff',
  },
  solar_corona: {
    id: 'solar_corona',
    name: 'Fase 42 · Coroa Solar',
    subtitle: 'Anéis de Plasma & Forjas Estelares',
    skyTop: '#1c0702',
    skyMid: '#471504',
    skyBottom: '#8c3108',
    mountainFar: '#2e0c03',
    mountainMid: '#5c1e06',
    mountainNear: '#91340a',
    tileMain: '#a64d14',
    tileHighlight: '#fef08a',
    tileShadow: '#5e2708',
    tileOutline: '#140401',
    accent: '#fde047',
    secondaryAccent: '#fb7185',
    particleColor: '#fef9c3',
  },
  lunar_bastion: {
    id: 'lunar_bastion',
    name: 'Fase 43 · Bastião Lunar',
    subtitle: 'Torres Prateadas sob Baixa Gravidade',
    skyTop: '#040712',
    skyMid: '#0d152b',
    skyBottom: '#1c2b4f',
    mountainFar: '#080e1f',
    mountainMid: '#121e3b',
    mountainNear: '#1e3059',
    tileMain: '#546482',
    tileHighlight: '#f8fafc',
    tileShadow: '#2c374d',
    tileOutline: '#02040a',
    accent: '#e2e8f0',
    secondaryAccent: '#7dd3fc',
    particleColor: '#ffffff',
  },
  chrono_paradox: {
    id: 'chrono_paradox',
    name: 'Fase 44 · Paradoxo Temporal',
    subtitle: 'Mostradores Partidos & Ecos do Futuro',
    skyTop: '#031017',
    skyMid: '#092433',
    skyBottom: '#124259',
    mountainFar: '#051924',
    mountainMid: '#0d3145',
    mountainNear: '#164d69',
    tileMain: '#285f78',
    tileHighlight: '#67e8f9',
    tileShadow: '#153647',
    tileOutline: '#020a0f',
    accent: '#22d3ee',
    secondaryAccent: '#fbbf24',
    particleColor: '#cffafe',
  },
  starlight_harbor: {
    id: 'starlight_harbor',
    name: 'Fase 45 · Porto da Luz Estelar',
    subtitle: 'Galeões Celestes & Faróis de Éter',
    skyTop: '#040a1c',
    skyMid: '#0b1e47',
    skyBottom: '#173b7d',
    mountainFar: '#071430',
    mountainMid: '#10295c',
    mountainNear: '#1d448a',
    tileMain: '#38588f',
    tileHighlight: '#93c5fd',
    tileShadow: '#1d3257',
    tileOutline: '#020612',
    accent: '#38bdf8',
    secondaryAccent: '#fde047',
    particleColor: '#dbeafe',
  },
  blood_eclipse: {
    id: 'blood_eclipse',
    name: 'Fase 46 · Eclipse Escarlate',
    subtitle: 'Sol Negro & Sombras Vivas',
    skyTop: '#0f0105',
    skyMid: '#29030c',
    skyBottom: '#570718',
    mountainFar: '#1a0208',
    mountainMid: '#360410',
    mountainNear: '#5e091b',
    tileMain: '#47121e',
    tileHighlight: '#fb7185',
    tileShadow: '#24070e',
    tileOutline: '#0a0002',
    accent: '#ef4444',
    secondaryAccent: '#fde047',
    particleColor: '#fecdd3',
  },
  crystal_singularity: {
    id: 'crystal_singularity',
    name: 'Fase 47 · Singularidade Cristalina',
    subtitle: 'Horizonte de Eventos & Cacos Orbitais',
    skyTop: '#04010d',
    skyMid: '#12042e',
    skyBottom: '#290a5c',
    mountainFar: '#0a021c',
    mountainMid: '#1a063d',
    mountainNear: '#310d6b',
    tileMain: '#432573',
    tileHighlight: '#e879f9',
    tileShadow: '#221040',
    tileOutline: '#020008',
    accent: '#a855f7',
    secondaryAccent: '#67e8f9',
    particleColor: '#fae8ff',
  },
  seraph_citadel: {
    id: 'seraph_citadel',
    name: 'Fase 48 · Cidadela dos Serafins',
    subtitle: 'Muralhas de Marfim & Halos Dourados',
    skyTop: '#0f1224',
    skyMid: '#23284a',
    skyBottom: '#434b7d',
    mountainFar: '#181c36',
    mountainMid: '#2d335c',
    mountainNear: '#475087',
    tileMain: '#9498b8',
    tileHighlight: '#fef08a',
    tileShadow: '#575b78',
    tileOutline: '#0a0c1a',
    accent: '#fde047',
    secondaryAccent: '#f9a8d4',
    particleColor: '#fef9c3',
  },
  abyss_throne: {
    id: 'abyss_throne',
    name: 'Fase 49 · Trono do Abismo',
    subtitle: 'Correntes Gigantes & Realidade Fendida',
    skyTop: '#0a0108',
    skyMid: '#210319',
    skyBottom: '#470831',
    mountainFar: '#14020f',
    mountainMid: '#2e0521',
    mountainNear: '#520b38',
    tileMain: '#38152b',
    tileHighlight: '#fb7185',
    tileShadow: '#1c0815',
    tileOutline: '#050004',
    accent: '#f43f5e',
    secondaryAccent: '#c084fc',
    particleColor: '#fecdd3',
  },
  eternity_apex: {
    id: 'eternity_apex',
    name: 'Fase 50 · Ápice da Eternidade',
    subtitle: 'Convergência Suprema das Auroras',
    skyTop: '#05071a',
    skyMid: '#181242',
    skyBottom: '#3b1e6e',
    mountainFar: '#0d0d2b',
    mountainMid: '#211852',
    mountainNear: '#3e277a',
    tileMain: '#5a448f',
    tileHighlight: '#ffd27d',
    tileShadow: '#302154',
    tileOutline: '#03030f',
    accent: '#ffd27d',
    secondaryAccent: '#52e5ff',
    particleColor: '#ffffff',
  },
};

export const NEW_30_NPCS: Record<string, NpcProfileLike> = {
  marina: { id: 'marina', name: 'Marina', role: 'Mergulhadora Abissal', accentColor: '#ff7eb6', voicePitch: 1.15, lines: ['Os corais vivos pulsam com energia elétrica! Use os impulsos d\'água e cuidado com a Sereia de Coral na câmara final.'] },
  ignar: { id: 'ignar', name: 'Ignar', role: 'Forjador das Estepes', accentColor: '#ff7b29', voicePitch: 0.88, lines: ['O chão de magma queima devagar — não fique parado! Os Vermes e Lesmas de Magma deixam rastros escaldantes.'] },
  lin: { id: 'lin', name: 'Mestra Lin', role: 'Guardiã do Bambu', accentColor: '#4ade80', voicePitch: 1.18, lines: ['A leveza vence a força bruta. Desvie das Dançarinas de Lâmina com Dash Parry e retalie no ar!'] },
  bjorn: { id: 'bjorn', name: 'Bjorn', role: 'Navegador Glacial', accentColor: '#38bdf8', voicePitch: 0.85, lines: ['As Torres Crio disparam anéis de gelo em quatro direções! Mantenha o ritmo pelo fiorde até o Kraken.'] },
  vexa: { id: 'vexa', name: 'Vexa', role: 'Mecânica Rebelde', accentColor: '#f59e0b', voicePitch: 1.06, lines: ['Esteiras, serras e Brutos de Âncora guardam a Fundição. Salte no instante em que a onda sísmica varrer o chão!'] },
  spora: { id: 'spora', name: 'Spora', role: 'Estudiosa de Esporos', accentColor: '#e879f9', voicePitch: 1.2, lines: ['Esporos Divisores se partem em dois ao morrer — finalize ambos antes que cerquem seu caminho!'] },
  zephyra: { id: 'zephyra', name: 'Zephyra', role: 'Corsária dos Ventos', accentColor: '#22d3ee', voicePitch: 1.12, lines: ['Bobinas Tesla encadeiam relâmpagos cruzados entre plataformas. Domine os ventos ascendentes e vença a Rocs!'] },
  tlaloc: { id: 'tlaloc', name: 'Tlaloc', role: 'Sacerdote de Obsidiana', accentColor: '#14b8a6', voicePitch: 0.92, lines: ['Os Monólitos Rúnicos erguem escudos impenetráveis enquanto não piscarem — aguarde a brecha entre pulsações!'] },
  lyss: { id: 'lyss', name: 'Lyss', role: 'Química Errante', accentColor: '#a3e635', voicePitch: 1.08, lines: ['O mercúrio reflete sombras e alimenta Sanguessugas do Vazio. Dê um dash para quebrar o dreno!'] },
  carmilla: { id: 'carmilla', name: 'Carmilla', role: 'Caçadora Escarlate', accentColor: '#f43f5e', voicePitch: 1.04, lines: ['A Falange Escudada bloqueia golpes frontais! Atravesse com Dash ou ataque pelas costas para destruí-la.'] },
  iris: { id: 'iris', name: 'Iris', role: 'Ilusionista do Cristal', accentColor: '#e879f9', voicePitch: 1.22, lines: ['Assassinos de Eco ficam translúcidos antes de investir. Observe os olhos brilhantes e contra-ataque!'] },
  khepri: { id: 'khepri', name: 'Khepri', role: 'Guardião da Areia', accentColor: '#fbbf24', voicePitch: 0.95, lines: ['As Tecelãs do Tempo lançam bumerangues que retornam pelo mesmo traço — salte duas vezes!'] },
  aria: { id: 'aria', name: 'Aria', role: 'Soprano Fantasma', accentColor: '#fda4af', voicePitch: 1.26, lines: ['Neste palco eterno, cada candelabro ecoa nossa última canção. Cuidado com o Maestro Fantasma!'] },
  yorick: { id: 'yorick', name: 'Yorick', role: 'Batedor dos Ossos', accentColor: '#e2e8f0', voicePitch: 0.9, lines: ['Fantasmas da Fenda se teletransportam após o sinal luminoso — acerte o ponto exato do surgimento!'] },
  tenzin: { id: 'tenzin', name: 'Tenzin', role: 'Monge do Vento', accentColor: '#fef08a', voicePitch: 0.98, lines: ['Nuvens elásticas levam às alturas serenas, mas os Acólitos Solares conjuram pilares verticais do céu!'] },
  nova9: { id: 'nova9', name: 'Nova-9', role: 'Hacktivista', accentColor: '#00f5d4', voicePitch: 1.14, lines: ['Aranhas Relógio disparam engrenagens em arco dentro da Matriz. Atravesse os véus de fase com Dash!'] },
  melis: { id: 'melis', name: 'Melis', role: 'Apicultora Arcana', accentColor: '#f59e0b', voicePitch: 1.16, lines: ['Vespas de Âmbar atacam em zigue-zague e defendem a Colmeia. Suba pela resina viscosa com calma!'] },
  thoth: { id: 'thoth', name: 'Thoth', role: 'Arquivista Sábio', accentColor: '#818cf8', voicePitch: 0.93, lines: ['Os tomos flutuantes guardam feitiços de estase. Não subestime os Gárgulas de Cristal nos altos!'] },
  tesla: { id: 'tesla', name: 'Nikolai', role: 'Físico do Éter', accentColor: '#a855f7', voicePitch: 0.96, lines: ['Núcleos Magnéticos alternam atração e repulsão! Use o puxão magnético para ganhar velocidade nos saltos!'] },
  lumina: { id: 'lumina', name: 'Lumina', role: 'Sacerdotisa da Luz', accentColor: '#f472b6', voicePitch: 1.2, lines: ['Querubins do Prisma lançam esferas que ricocheteiam em 3 vias pelas paredes de diamante!'] },
  nyxia: { id: 'nyxia', name: 'Nyxia', role: 'Viajante Cósmica', accentColor: '#c084fc', voicePitch: 1.07, lines: ['Bombardeiros Estelares soltam minas cintilantes no vácuo — mantenha distância quando piscarem!'] },
  helios: { id: 'helios', name: 'Helios', role: 'Guardião Solar', accentColor: '#fde047', voicePitch: 0.94, lines: ['Fênix de Brasas rasgam o céu em mergulhos flamejantes! Dê Parry quando a chama ficar dourada!'] },
  selene: { id: 'selene', name: 'Selene', role: 'Sentinela Lunar', accentColor: '#e2e8f0', voicePitch: 1.15, lines: ['Na baixa gravidade do Bastião Lunar, os Diabretes Gravitacionais distorcem o seu salto!'] },
  kairos: { id: 'kairos', name: 'Kairos', role: 'Observador do Tempo', accentColor: '#22d3ee', voicePitch: 0.99, lines: ['Portais temporais e blocos de batida A/B exigem precisão absoluta para enfrentar o Aeon!'] },
  altair: { id: 'altair', name: 'Altair', role: 'Timoneiro Sideral', accentColor: '#38bdf8', voicePitch: 0.97, lines: ['Águas-vivas das Marés pulsam ondas de choque circulares pelos conveses dos galeões astrais!'] },
  malakor: { id: 'malakor', name: 'Malakor', role: 'Exilado Rubro', accentColor: '#ef4444', voicePitch: 0.86, lines: ['Ganchos Sombrios tentam puxar você para o abismo! Quebre a linha com um Dash imediato!'] },
  oriana: { id: 'oriana', name: 'Oriana', role: 'Astrofísica Arcana', accentColor: '#a855f7', voicePitch: 1.13, lines: ['Na Singularidade, vórtices e blocos oníricos criam um balé espacial rumo ao Núcleo!'] },
  uriel: { id: 'uriel', name: 'Uriel', role: 'Arauto Celeste', accentColor: '#fef08a', voicePitch: 1.02, lines: ['Os serafins vigiam cada passo de mármore. Honre a luz do Ápice para vencer a Cidadela!'] },
  nyx_elder: { id: 'nyx_elder', name: 'Sombra Anciã', role: 'Testemunha', accentColor: '#f43f5e', voicePitch: 0.82, lines: ['Cavaleiros do Abismo exigem três golpes firmes para cair. Poucos chegaram até este trono de correntes!'] },
};

export interface NewWorldBlueprintMeta {
  id: BiomeId;
  name: string;
  subtitle: string;
  difficultyLabel: string;
  accent: string;
  npcId: string;
  boss: BossEntityKind;
  bossName: string;
  enemyPair: [EntityKind, EntityKind, EntityKind];
  midTile: number;
  gripTile: number;
  hazardTile: number;
  propMain: RoomPropDef['kind'];
  propSec: RoomPropDef['kind'];
  isFinalSummit?: boolean;
}

export const NEW_30_WORLDS: NewWorldBlueprintMeta[] = [
  { id: 'coral_abyss', name: 'Fase 21 · Abismo de Coral', subtitle: 'Recifes Fosforescentes & Fossa Abissal', difficultyLabel: 'Dificuldade: Impossível+', accent: '#ff7eb6', npcId: 'marina', boss: 'boss_coral_siren', bossName: 'Sereia de Coral', enemyPair: ['enemy_tidal_jelly', 'enemy_shadow_hook', 'enemy_void_leech'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.STICKY_RESIN, hazardTile: TileType.WATER, propMain: 'coral_fan', propSec: 'kelp_strand' },
  { id: 'ember_steppe', name: 'Fase 22 · Estepe das Brasas', subtitle: 'Campos Vulcânicos & Gêiseres de Fogo', difficultyLabel: 'Dificuldade: Impossível+', accent: '#ff7b29', npcId: 'ignar', boss: 'boss_ash_behemoth', bossName: 'Behemoth de Cinzas', enemyPair: ['enemy_magma_slug', 'enemy_ember_phoenix', 'enemy_anchor_brute'], midTile: TileType.CRUMBLE, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.LIQUID_LETHAL, propMain: 'brazier', propSec: 'canyon_totem' },
  { id: 'jade_bamboo', name: 'Fase 23 · Floresta de Bambu Jade', subtitle: 'Ventos Esmeralda & Telhados Antigos', difficultyLabel: 'Dificuldade: Impossível+', accent: '#4ade80', npcId: 'lin', boss: 'boss_jade_shogun', bossName: 'Xogum de Jade', enemyPair: ['enemy_blade_dancer', 'enemy_echo_assassin', 'enemy_amber_wasp'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.STICKY_RESIN, hazardTile: TileType.SPIKE_UP, propMain: 'torii_gate', propSec: 'wind_chime' },
  { id: 'glacial_fjord', name: 'Fase 24 · Fiorde Glacial', subtitle: 'Penhascos Nórdicos & Ventos Boreais', difficultyLabel: 'Dificuldade: Impossível+', accent: '#38bdf8', npcId: 'bjorn', boss: 'boss_fjord_kraken', bossName: 'Kraken do Fiorde', enemyPair: ['enemy_cryo_turret', 'enemy_crystal_gargoyle', 'enemy_tidal_jelly'], midTile: TileType.ICE, gripTile: TileType.ICE, hazardTile: TileType.SPIKE_UP, propMain: 'frost_arch', propSec: 'crystal_spire' },
  { id: 'rust_foundry', name: 'Fase 25 · Fundição Ferrugem', subtitle: 'Caldeiras Industriais & Pistões de Ferro', difficultyLabel: 'Dificuldade: Extrema', accent: '#f59e0b', npcId: 'vexa', boss: 'boss_rust_juggernaut', bossName: 'Colosso de Ferrugem', enemyPair: ['enemy_anchor_brute', 'enemy_clock_spider', 'enemy_magnet_core'], midTile: TileType.CONVEYOR_RIGHT, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.LIQUID_LETHAL, propMain: 'clock_gear', propSec: 'chain' },
  { id: 'fungal_myriad', name: 'Fase 26 · Micélio Miríade', subtitle: 'Cúpulas de Esporos & Colônia Viva', difficultyLabel: 'Dificuldade: Extrema', accent: '#e879f9', npcId: 'spora', boss: 'boss_spore_archon', bossName: 'Arconte dos Esporos', enemyPair: ['enemy_spore_splitter', 'enemy_void_leech', 'enemy_amber_wasp'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.STICKY_RESIN, hazardTile: TileType.LIQUID_LETHAL, propMain: 'shroom_giant', propSec: 'hanging_vine' },
  { id: 'storm_archipelago', name: 'Fase 27 · Arquipélago Tempestuoso', subtitle: 'Ilhas Voadoras sob Trovões Contínuos', difficultyLabel: 'Dificuldade: Extrema', accent: '#22d3ee', npcId: 'zephyra', boss: 'boss_tempest_roc', bossName: 'Rocs da Tempestade', enemyPair: ['enemy_chain_tesla', 'enemy_prism_cherub', 'enemy_star_bomber'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'floating_island', propSec: 'tesla_coil' },
  { id: 'obsidian_temple', name: 'Fase 28 · Templo de Obsidiana', subtitle: 'Zigurate Sagrado de Turquesa & Ouro', difficultyLabel: 'Dificuldade: Extrema', accent: '#14b8a6', npcId: 'tlaloc', boss: 'boss_obsidian_idol', bossName: 'Ídolo de Obsidiana', enemyPair: ['enemy_rune_monolith', 'enemy_shield_phalanx', 'enemy_solar_acolyte'], midTile: TileType.FRAGILE_GLASS, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.SPIKE_UP, propMain: 'pyramid_obelisk', propSec: 'sun_brazier' },
  { id: 'mercury_mire', name: 'Fase 29 · Pântano de Mercúrio', subtitle: 'Lagos Prateados & Névoa Alquímica', difficultyLabel: 'Dificuldade: Extrema', accent: '#94a3b8', npcId: 'lyss', boss: 'boss_mercury_twin', bossName: 'Gêmeo de Mercúrio', enemyPair: ['enemy_void_leech', 'enemy_magma_slug', 'enemy_mirror_orb'], midTile: TileType.CRUMBLE, gripTile: TileType.STICKY_RESIN, hazardTile: TileType.LIQUID_LETHAL, propMain: 'alchemy_vat', propSec: 'willow_tree' },
  { id: 'crimson_foundry', name: 'Fase 30 · Fornalha Rubra', subtitle: 'Sinos de Sangue & Correntes Ardentes', difficultyLabel: 'Dificuldade: Soberana', accent: '#f43f5e', npcId: 'carmilla', boss: 'boss_blood_cantor', bossName: 'Cantor de Sangue', enemyPair: ['enemy_shield_phalanx', 'enemy_abyss_knight', 'enemy_ember_phoenix'], midTile: TileType.CONVEYOR_LEFT, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.LIQUID_LETHAL, propMain: 'chain', propSec: 'brazier' },
  { id: 'mirror_labyrinth', name: 'Fase 31 · Labirinto dos Espelhos', subtitle: 'Galerias de Cristal Refletor', difficultyLabel: 'Dificuldade: Soberana', accent: '#e879f9', npcId: 'iris', boss: 'boss_mirror_queen', bossName: 'Rainha dos Espelhos', enemyPair: ['enemy_echo_assassin', 'enemy_prism_cherub', 'enemy_crystal_gargoyle'], midTile: TileType.FRAGILE_GLASS, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'crystal_chandelier', propSec: 'rose_window' },
  { id: 'hourglass_desert', name: 'Fase 32 · Deserto da Ampulheta', subtitle: 'Dunas Temporais & Templos Soterrados', difficultyLabel: 'Dificuldade: Soberana', accent: '#fbbf24', npcId: 'khepri', boss: 'boss_sand_empress', bossName: 'Imperatriz da Areia', enemyPair: ['enemy_chrono_weaver', 'enemy_sand_wraith', 'enemy_solar_acolyte'], midTile: TileType.CRUMBLE, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'sun_dial', propSec: 'pyramid_obelisk' },
  { id: 'velvet_opera', name: 'Fase 33 · Ópera de Veludo', subtitle: 'Teatro Fantasma de Lustres Dourados', difficultyLabel: 'Dificuldade: Soberana', accent: '#fb7185', npcId: 'aria', boss: 'boss_phantom_maestro', bossName: 'Maestro Fantasma', enemyPair: ['enemy_blade_dancer', 'enemy_echo_assassin', 'enemy_shadow_hook'], midTile: TileType.BEAT_A, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'crystal_chandelier', propSec: 'banner' },
  { id: 'bone_catacombs', name: 'Fase 34 · Catacumbas de Marfim', subtitle: 'Ossuário Antigo & Chamas Espectrais', difficultyLabel: 'Dificuldade: Soberana', accent: '#e2e8f0', npcId: 'yorick', boss: 'boss_titan_reaper', bossName: 'Ceifador Titã', enemyPair: ['enemy_rift_stalker', 'enemy_abyss_knight', 'enemy_bone_knight'], midTile: TileType.CRUMBLE, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'soul_urn', propSec: 'arch' },
  { id: 'cloud_monastery', name: 'Fase 35 · Monastério das Nuvens', subtitle: 'Mosteiros Dourados Acima do Horizonte', difficultyLabel: 'Dificuldade: Divina', accent: '#fde047', npcId: 'tenzin', boss: 'boss_cloud_monk', bossName: 'Grande Monge das Nuvens', enemyPair: ['enemy_solar_acolyte', 'enemy_prism_cherub', 'enemy_blade_dancer'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'torii_gate', propSec: 'wind_chime' },
  { id: 'cyber_grid', name: 'Fase 36 · Matriz Holográfica', subtitle: 'Horizonte Synthwave & Feixes de Dados', difficultyLabel: 'Dificuldade: Divina', accent: '#00f5d4', npcId: 'nova9', boss: 'boss_grid_warden', bossName: 'Guardião da Matriz', enemyPair: ['enemy_clock_spider', 'enemy_chain_tesla', 'enemy_magnet_core'], midTile: TileType.BEAT_B, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.LIQUID_LETHAL, propMain: 'holo_pylon', propSec: 'tesla_coil' },
  { id: 'amber_hive', name: 'Fase 37 · Colmeia de Âmbar', subtitle: 'Alvéolos Hexagonais & Resina Dourada', difficultyLabel: 'Dificuldade: Divina', accent: '#f59e0b', npcId: 'melis', boss: 'boss_amber_matriarch', bossName: 'Matriarca de Âmbar', enemyPair: ['enemy_amber_wasp', 'enemy_spore_splitter', 'enemy_anchor_brute'], midTile: TileType.STICKY_RESIN, gripTile: TileType.STICKY_RESIN, hazardTile: TileType.LIQUID_LETHAL, propMain: 'shroom_giant', propSec: 'sun_brazier' },
  { id: 'astral_library', name: 'Fase 38 · Biblioteca Infinita', subtitle: 'Estantes Colossais & Tomos Flutuantes', difficultyLabel: 'Dificuldade: Divina', accent: '#818cf8', npcId: 'thoth', boss: 'boss_tome_keeper', bossName: 'Guardião dos Tomos', enemyPair: ['enemy_crystal_gargoyle', 'enemy_rune_monolith', 'enemy_chrono_weaver'], midTile: TileType.DREAM_BLOCK, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'obelisk', propSec: 'crystal_chandelier' },
  { id: 'magnetic_rift', name: 'Fase 39 · Fenda Magnética', subtitle: 'Monólitos Levitantes & Arcos Polares', difficultyLabel: 'Dificuldade: Divina', accent: '#a855f7', npcId: 'tesla', boss: 'boss_polarity_lord', bossName: 'Senhor da Polaridade', enemyPair: ['enemy_magnet_core', 'enemy_chain_tesla', 'enemy_gravity_imp'], midTile: TileType.DREAM_BLOCK, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'tesla_coil', propSec: 'floating_island' },
  { id: 'prism_sanctum', name: 'Fase 40 · Santuário do Prisma', subtitle: 'Espectros Arco-Íris & Pilares Diamante', difficultyLabel: 'Dificuldade: Celestial', accent: '#f472b6', npcId: 'lumina', boss: 'boss_prism_angel', bossName: 'Arcanjo do Prisma', enemyPair: ['enemy_prism_cherub', 'enemy_crystal_gargoyle', 'enemy_solar_acolyte'], midTile: TileType.FRAGILE_GLASS, gripTile: TileType.ICE, hazardTile: TileType.SPIKE_UP, propMain: 'aurora_prism', propSec: 'marble_column' },
  { id: 'void_nebula', name: 'Fase 41 · Nebulosa do Vazio', subtitle: 'Poeira Cósmica & Asteroides Errantes', difficultyLabel: 'Dificuldade: Celestial', accent: '#c084fc', npcId: 'nyxia', boss: 'boss_nebula_wyrm', bossName: 'Serpente da Nebulosa', enemyPair: ['enemy_star_bomber', 'enemy_rift_stalker', 'enemy_gravity_imp'], midTile: TileType.DREAM_BLOCK, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'star_satellite', propSec: 'floating_island' },
  { id: 'solar_corona', name: 'Fase 42 · Coroa Solar', subtitle: 'Anéis de Plasma & Forjas Estelares', difficultyLabel: 'Dificuldade: Celestial', accent: '#fde047', npcId: 'helios', boss: 'boss_solar_deity', bossName: 'Divindade Solar', enemyPair: ['enemy_ember_phoenix', 'enemy_solar_acolyte', 'enemy_magma_slug'], midTile: TileType.CRUMBLE, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.LIQUID_LETHAL, propMain: 'sun_brazier', propSec: 'sun_dial' },
  { id: 'lunar_bastion', name: 'Fase 43 · Bastião Lunar', subtitle: 'Torres Prateadas sob Baixa Gravidade', difficultyLabel: 'Dificuldade: Celestial', accent: '#e2e8f0', npcId: 'selene', boss: 'boss_lunar_empress', bossName: 'Imperatriz Lunar', enemyPair: ['enemy_gravity_imp', 'enemy_cryo_turret', 'enemy_echo_assassin'], midTile: TileType.ICE, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'marble_column', propSec: 'rose_window' },
  { id: 'chrono_paradox', name: 'Fase 44 · Paradoxo Temporal', subtitle: 'Mostradores Partidos & Ecos do Futuro', difficultyLabel: 'Dificuldade: Celestial', accent: '#22d3ee', npcId: 'kairos', boss: 'boss_paradox_aeon', bossName: 'Aeon do Paradoxo', enemyPair: ['enemy_chrono_weaver', 'enemy_clock_spider', 'enemy_rift_stalker'], midTile: TileType.BEAT_A, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'clock_gear', propSec: 'pendulum' },
  { id: 'starlight_harbor', name: 'Fase 45 · Porto da Luz Estelar', subtitle: 'Galeões Celestes & Faróis de Éter', difficultyLabel: 'Dificuldade: Cósmica', accent: '#38bdf8', npcId: 'altair', boss: 'boss_star_admiral', bossName: 'Almirante Estelar', enemyPair: ['enemy_tidal_jelly', 'enemy_anchor_brute', 'enemy_star_bomber'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.SOLID, hazardTile: TileType.WATER, propMain: 'sunken_anchor', propSec: 'star_satellite' },
  { id: 'blood_eclipse', name: 'Fase 46 · Eclipse Escarlate', subtitle: 'Sol Negro & Sombras Vivas', difficultyLabel: 'Dificuldade: Cósmica', accent: '#ef4444', npcId: 'malakor', boss: 'boss_eclipse_herald', bossName: 'Arauto do Eclipse', enemyPair: ['enemy_shadow_hook', 'enemy_void_leech', 'enemy_blade_dancer'], midTile: TileType.CRUMBLE, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.LIQUID_LETHAL, propMain: 'obelisk', propSec: 'brazier' },
  { id: 'crystal_singularity', name: 'Fase 47 · Singularidade Cristalina', subtitle: 'Horizonte de Eventos & Cacos Orbitais', difficultyLabel: 'Dificuldade: Cósmica', accent: '#a855f7', npcId: 'oriana', boss: 'boss_singularity_core', bossName: 'Núcleo da Singularidade', enemyPair: ['enemy_gravity_imp', 'enemy_crystal_gargoyle', 'enemy_rune_monolith'], midTile: TileType.DREAM_BLOCK, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'crystal_spire', propSec: 'holo_pylon' },
  { id: 'seraph_citadel', name: 'Fase 48 · Cidadela dos Serafins', subtitle: 'Muralhas de Marfim & Halos Dourados', difficultyLabel: 'Dificuldade: Cósmica', accent: '#fde047', npcId: 'uriel', boss: 'boss_seraph_prime', bossName: 'Serafim Supremo', enemyPair: ['enemy_shield_phalanx', 'enemy_solar_acolyte', 'enemy_prism_cherub'], midTile: TileType.CLOUD_BOUNCE, gripTile: TileType.SOLID, hazardTile: TileType.SPIKE_UP, propMain: 'marble_column', propSec: 'arch' },
  { id: 'abyss_throne', name: 'Fase 49 · Trono do Abismo', subtitle: 'Correntes Gigantes & Realidade Fendida', difficultyLabel: 'Dificuldade: Transcendente', accent: '#f43f5e', npcId: 'nyx_elder', boss: 'boss_abyss_king', bossName: 'Rei do Abismo Profundo', enemyPair: ['enemy_abyss_knight', 'enemy_shadow_hook', 'enemy_rift_stalker'], midTile: TileType.BEAT_B, gripTile: TileType.MAGMA_CRUST, hazardTile: TileType.LIQUID_LETHAL, propMain: 'chain', propSec: 'statue' },
  { id: 'eternity_apex', name: 'Fase 50 · Ápice da Eternidade', subtitle: 'Convergência Suprema das Auroras', difficultyLabel: 'Dificuldade: Ápice Final', accent: '#ffd27d', npcId: 'vespera', boss: 'boss_eternity_god', bossName: 'Arquiteto da Eternidade', enemyPair: ['enemy_abyss_knight', 'enemy_chrono_weaver', 'enemy_prism_cherub'], midTile: TileType.DREAM_BLOCK, gripTile: TileType.DREAM_BLOCK, hazardTile: TileType.SPIKE_UP, propMain: 'aurora_prism', propSec: 'rose_window', isFinalSummit: true },
];

export const NEW_30_WORLD_MAP: Record<string, NewWorldBlueprintMeta> = Object.fromEntries(
  NEW_30_WORLDS.map((w) => [w.id, w])
);

export function addNew30BiomeDecor(p: StagePainterLike, biome: BiomeId): void {
  const w = NEW_30_WORLD_MAP[biome];
  if (!w) return;
  const C = p.cols;
  const R = p.rows;
  p.prop(w.propMain, 7, R - 10, 7);
  p.prop(w.propMain, C - 11, R - 10, 7);
  p.prop(w.propSec, Math.floor(C * 0.34), 4, 6);
  p.prop(w.propSec, Math.floor(C * 0.66), 4, 6);
  if (C >= 120) {
    p.prop(w.propMain, Math.floor(C * 0.24), R - 10, 7);
    p.prop(w.propMain, Math.floor(C * 0.5), R - 10, 7);
    p.prop(w.propMain, Math.floor(C * 0.76), R - 10, 7);
    p.prop(w.propSec, Math.floor(C * 0.17), 4, 6);
    p.prop(w.propSec, Math.floor(C * 0.52), 4, 6);
    p.prop(w.propSec, Math.floor(C * 0.84), 4, 6);
  }
}

export function populateNew30BiomeEntities(
  p: StagePainterLike,
  biome: BiomeId,
  stageIdx: number,
  leftFloor: number,
  rightFloor: number
): void {
  const w = NEW_30_WORLD_MAP[biome];
  if (!w) return;
  const C = p.cols;
  const R = p.rows;
  const midCol = Math.floor(C * 0.5);
  const [e0, e1, e2] = w.enemyPair;

  // Always showcase the world's new enemies cleanly in air/on platforms
  p.add(e0, C - 10, rightFloor - 2, { patrolDist: 24 });
  p.add(stageIdx % 2 === 0 ? e1 : e2, midCol + 3, 8, { patrolDist: 26 });
  if (stageIdx >= 4) {
    p.add(stageIdx % 2 === 0 ? e2 : e1, 16, 9, { patrolDist: 22 });
  }

  // Movement/traversal gimmicks tailored to world tier
  if (stageIdx % 2 === 0) {
    p.add('grapple_anchor', midCol - 5, 8);
    p.add('double_dash_crystal', midCol + 4, 9);
  } else {
    p.add('dash_ring', midCol, 9);
    p.add('gravity_vortex', midCol + 5, 10);
  }
  if (biome === 'lunar_bastion' || biome === 'void_nebula' || biome === 'crystal_singularity') {
    p.add('antigrav_zone', 12, 4, { w: (C - 24) * 8, h: 100 });
  }
  if (biome === 'glacial_fjord' || biome === 'storm_archipelago' || biome === 'cloud_monastery') {
    p.add('wind_up', midCol - 3, 5, { w: 32, h: 112 });
  }
  if (biome === 'coral_abyss' || biome === 'starlight_harbor') {
    p.add('bounce_shroom', 10, leftFloor - 1);
    p.add('bounce_shroom', C - 11, rightFloor - 1);
  }
  if (biome === 'chrono_paradox' || biome === 'mirror_labyrinth') {
    p.add('stasis_orb', midCol - 3, 10);
  }
  if (biome === 'ember_steppe' || biome === 'crimson_foundry' || biome === 'solar_corona') {
    p.add('steam_geyser', Math.floor(C * 0.36), R - 4);
  }
}

const STAGE_TITLES: [string, string][] = [
  ['Pórtico da Chegada', 'Acampamento inicial e primeiro contato com o bioma'],
  ['Senda dos Ecos', 'Plataformas assimétricas e primeiros guardiões'],
  ['Cânion dos Ventos', 'Saltos encadeados sobre o abismo elemental'],
  ['Torre da Ascensão', 'Escalada vertical sob pressão constante'],
  ['Santuário Oculto', 'Passagens secretas e desafios de precisão'],
  ['Terraço da Vigília', 'Descanso intermediário com Altar de Bênçãos'],
  ['Galerias Quebradas', 'Ritmo acelerado entre blocos dinâmicos'],
  ['Câmara da Prova', 'Combinação aérea de gancho, dash e parry'],
  ['Ponte do Guardião', 'Última travessia antes da sala do Chefe'],
  ['Trono do Guardião', 'Derrote o Guardião do Mundo para liberar o portal'],
];

// 12 Connected 10-stage chapter topologies (all adjacent paths, with sIdx 8 West of sIdx 9!)
const TOPOLOGIES: [number, number][][] = [
  [[0, 2], [1, 2], [2, 2], [2, 1], [1, 1], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 1], [1, 1], [1, 2], [2, 2], [3, 2], [3, 1], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1], [4, 2], [5, 2], [5, 1], [6, 1]],
  [[0, 2], [0, 1], [1, 1], [1, 0], [2, 0], [3, 0], [3, 1], [4, 1], [5, 1], [6, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [4, 1], [5, 1], [6, 1]],
  [[0, 1], [0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2]],
  [[0, 2], [1, 2], [1, 1], [2, 1], [2, 0], [3, 0], [4, 0], [4, 1], [5, 1], [6, 1]],
  [[0, 1], [1, 1], [2, 1], [2, 0], [3, 0], [3, 1], [3, 2], [4, 2], [5, 2], [6, 2]],
  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2], [3, 2], [3, 1], [4, 1], [5, 1], [6, 1]],
  [[0, 2], [1, 2], [2, 2], [3, 2], [3, 1], [3, 0], [4, 0], [5, 0], [5, 1], [6, 1]],
  [[0, 1], [0, 2], [1, 2], [1, 1], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [3, 2], [4, 2], [5, 2]],
];

export function getNew30ChapterConfigs(): {
  id: BiomeId;
  name: string;
  subtitle: string;
  difficultyLabel: string;
  accent: string;
  stages: any[];
}[] {
  return NEW_30_WORLDS.map((w, idx) => {
    const chNum = 21 + idx;
    const coords = TOPOLOGIES[idx % TOPOLOGIES.length];
    const towerStageA = 2 + (idx % 3); // tower in sIdx 2, 3, or 4
    const towerStageB = 6 + (idx % 2); // second vertical challenge in some worlds

    const stages = coords.map(([gx, gy], sIdx) => {
      const [baseTitle, baseSub] = STAGE_TITLES[sIdx];
      const h = layoutHash(chNum, sIdx + 1, idx + 7, 31);
      const isTower = sIdx === towerStageA || (idx % 2 === 1 && sIdx === towerStageB);
      const pattern = isTower ? 4 : [0, 1, 2, 3, 5][h % 5];

      if (sIdx === 0) {
        const rightRow = 12 + (idx % 5); // varied exit elevation (12..16)
        return {
          gx,
          gy,
          cols: 62,
          rows: 26,
          spawnCol: 4,
          spawnRow: 20,
          rightRow,
          name: `Etapa 1 · ${baseTitle}`,
          subtitle: `${w.name}: ${baseSub}`,
          isStart: true,
          pattern: 0,
          build: (p: StagePainterLike, _b: BiomeId, exits: { rightRow: number }) => {
            buildNew30UniqueStart(p, idx, w, exits.rightRow, addNew30BiomeDecor);
          },
        };
      }

      if (sIdx === 5) {
        return {
          gx,
          gy,
          cols: 60,
          rows: 26,
          name: `Etapa 6 · ${baseTitle}`,
          subtitle: `${w.subtitle} — Altar de Bênçãos`,
          pattern: 2,
          build: (p: StagePainterLike, _b: BiomeId, exits: { leftRow: number; rightRow: number }) => {
            buildNew30UniqueSanctuary(p, idx, w, exits.leftRow, exits.rightRow, addNew30BiomeDecor);
          },
        };
      }

      if (sIdx === 9) {
        return {
          gx,
          gy,
          cols: 62,
          rows: 28,
          spawnCol: 4,
          spawnRow: 16,
          leftRow: 17,
          name: `Etapa 10 · Arena de ${w.bossName}`,
          subtitle: `Derrote ${w.bossName} para concluir a Fase ${chNum}!`,
          isGoal: true,
          pattern: 0,
          build: (p: StagePainterLike, _b: BiomeId, exits: { leftRow: number }) => {
            buildNew30UniqueBossArena(p, idx, w, exits.leftRow, addNew30BiomeDecor);
          },
        };
      }

      return {
        gx,
        gy,
        cols: pattern === 4 ? 48 : 64,
        rows: pattern === 4 ? 34 : 26,
        rightRow: sIdx === 8 ? 17 : undefined,
        name: `Etapa ${sIdx + 1} · ${baseTitle}`,
        subtitle: `${w.name}: ${baseSub}`,
        pattern,
      };
    });

    return {
      id: w.id,
      name: w.name,
      subtitle: w.subtitle,
      difficultyLabel: w.difficultyLabel,
      accent: w.accent,
      stages,
    };
  });
}
