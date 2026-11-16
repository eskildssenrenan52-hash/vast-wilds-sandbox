// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import {
  AnyBiomeId,
  BiomeId,
  ChapterDef,
  EntityKind,
  ROOM_COLS,
  ROOM_ROWS,
  RoomDef,
  RoomEntityDef,
  RoomPropDef,
  TILE_SIZE,
  TileType,
} from './types';
import {
  NEW_30_BIOME_META,
  NEW_30_NPCS,
  NEW_30_WORLD_MAP,
  NEW_30_WORLDS,
  addNew30BiomeDecor,
  getNew30ChapterConfigs,
  populateNew30BiomeEntities,
} from './worldDataNew30';
import {
  buildUniqueHorizontalStage,
  buildVerticalTowerLayout,
  buildZoneArchetype,
  layoutHash,
  type ZoneThemePalette,
} from './uniqueStageLayouts';
import { pickExclusiveEnemiesForBiome } from './exclusiveEnemies';
import {
  generateUniquePhaseOrganization,
  getArchetypeLabel,
  getProgressiveEnemySpawnCount,
  selectProgressiveEnemyKind,
} from './phaseOrganization';

export interface BiomeMeta {
  id: AnyBiomeId;
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

export const BIOME_META: Record<BiomeId, BiomeMeta> = {
  silver_ash: {
    id: 'silver_ash',
    name: 'Fase 1 · Vale das Cinzas',
    subtitle: 'Ruínas da Primeira Vigília',
    skyTop: '#0b0817',
    skyMid: '#1a142e',
    skyBottom: '#33274a',
    mountainFar: '#161126',
    mountainMid: '#231b3b',
    mountainNear: '#32264f',
    tileMain: '#4d4666',
    tileHighlight: '#9b93bd',
    tileShadow: '#2f2a42',
    tileOutline: '#0b0814',
    accent: '#e8a87c',
    secondaryAccent: '#ffd27d',
    particleColor: '#ebe6f7',
  },
  bioluminescent: {
    id: 'bioluminescent',
    name: 'Fase 2 · Bosque Abissal',
    subtitle: 'Cavernas do Micélio Luminoso',
    skyTop: '#030d14',
    skyMid: '#081f2b',
    skyBottom: '#113a47',
    mountainFar: '#071924',
    mountainMid: '#0d2b38',
    mountainNear: '#14404d',
    tileMain: '#1c5459',
    tileHighlight: '#52f0c4',
    tileShadow: '#0f3238',
    tileOutline: '#030b10',
    accent: '#4df0c0',
    secondaryAccent: '#a8ffea',
    particleColor: '#7dffe2',
  },
  frostglass: {
    id: 'frostglass',
    name: 'Fase 3 · Cidadela Safira',
    subtitle: 'Bastião de Cristal & Ventania',
    skyTop: '#071129',
    skyMid: '#122952',
    skyBottom: '#25538a',
    mountainFar: '#0e2042',
    mountainMid: '#183566',
    mountainNear: '#27528c',
    tileMain: '#457db8',
    tileHighlight: '#c4f2ff',
    tileShadow: '#284e7d',
    tileOutline: '#050c1c',
    accent: '#7ce8ff',
    secondaryAccent: '#ffffff',
    particleColor: '#eefaff',
  },
  obsidian_forge: {
    id: 'obsidian_forge',
    name: 'Fase 4 · Forja de Magma',
    subtitle: 'Fornalhas de Obsidiana Viva',
    skyTop: '#140507',
    skyMid: '#2e0b0b',
    skyBottom: '#571510',
    mountainFar: '#210809',
    mountainMid: '#380e0d',
    mountainNear: '#591a12',
    tileMain: '#4f2424',
    tileHighlight: '#e86f3c',
    tileShadow: '#2b1012',
    tileOutline: '#0f0304',
    accent: '#ff7733',
    secondaryAccent: '#ffd24d',
    particleColor: '#ffb347',
  },
  astral_void: {
    id: 'astral_void',
    name: 'Fase 5 · Observatório Astral',
    subtitle: 'Câmara dos Sonhos Partidos',
    skyTop: '#04020d',
    skyMid: '#13092e',
    skyBottom: '#281359',
    mountainFar: '#0c051f',
    mountainMid: '#1a0c3d',
    mountainNear: '#311869',
    tileMain: '#3e2570',
    tileHighlight: '#cc9eff',
    tileShadow: '#221245',
    tileOutline: '#04010a',
    accent: '#d580ff',
    secondaryAccent: '#66eeff',
    particleColor: '#f4c7ff',
  },
  crimson_sakura: {
    id: 'crimson_sakura',
    name: 'Fase 6 · Santuário Carmesim',
    subtitle: 'Pagodes de Pétalas & Espelhos',
    skyTop: '#160711',
    skyMid: '#361224',
    skyBottom: '#69233c',
    mountainFar: '#260d1b',
    mountainMid: '#421629',
    mountainNear: '#5e2038',
    tileMain: '#5c2d3e',
    tileHighlight: '#ff9ec4',
    tileShadow: '#381925',
    tileOutline: '#12050b',
    accent: '#ff70a6',
    secondaryAccent: '#ffd1dc',
    particleColor: '#ffb3d1',
  },
  sunken_cathedral: {
    id: 'sunken_cathedral',
    name: 'Fase 7 · Catedral Submersa',
    subtitle: 'Nave Abissal de Corais',
    skyTop: '#020b14',
    skyMid: '#072236',
    skyBottom: '#0e415e',
    mountainFar: '#061a29',
    mountainMid: '#0c2e45',
    mountainNear: '#154763',
    tileMain: '#1e5873',
    tileHighlight: '#7cf2ff',
    tileShadow: '#103447',
    tileOutline: '#02080f',
    accent: '#4de1ff',
    secondaryAccent: '#ff96b8',
    particleColor: '#a8f9ff',
  },
  clockwork_spire: {
    id: 'clockwork_spire',
    name: 'Fase 8 · Torre do Relógio',
    subtitle: 'Engrenagens do Grande Pêndulo',
    skyTop: '#0f0a06',
    skyMid: '#261a10',
    skyBottom: '#472f19',
    mountainFar: '#1c120a',
    mountainMid: '#332214',
    mountainNear: '#4d331d',
    tileMain: '#63492c',
    tileHighlight: '#ffd37a',
    tileShadow: '#382716',
    tileOutline: '#0d0804',
    accent: '#ffb84d',
    secondaryAccent: '#66e6ff',
    particleColor: '#ffe08a',
  },
  emerald_sky: {
    id: 'emerald_sky',
    name: 'Fase 9 · Jardins Celestes',
    subtitle: 'Arquipélago dos Ventos Dourados',
    skyTop: '#061a1c',
    skyMid: '#0f3834',
    skyBottom: '#1f6151',
    mountainFar: '#0a2623',
    mountainMid: '#15453c',
    mountainNear: '#216353',
    tileMain: '#2d6e58',
    tileHighlight: '#96ffca',
    tileShadow: '#194537',
    tileOutline: '#05120f',
    accent: '#57f2a8',
    secondaryAccent: '#ffe985',
    particleColor: '#c9ffe4',
  },
  solar_mirage: {
    id: 'solar_mirage',
    name: 'Fase 10 · Miragem Solar',
    subtitle: 'Pirâmides de Ônix & Areia Estelar',
    skyTop: '#1c0c04',
    skyMid: '#451d0a',
    skyBottom: '#823b12',
    mountainFar: '#2e1406',
    mountainMid: '#52250b',
    mountainNear: '#7a3b12',
    tileMain: '#9c5a25',
    tileHighlight: '#ffd56b',
    tileShadow: '#5e3111',
    tileOutline: '#170902',
    accent: '#fbbf24',
    secondaryAccent: '#fb923c',
    particleColor: '#fde68a',
  },
  amethyst_crypt: {
    id: 'amethyst_crypt',
    name: 'Fase 11 · Cripta Ametista',
    subtitle: 'Necrópole dos Ecos Rúnicos',
    skyTop: '#070212',
    skyMid: '#180930',
    skyBottom: '#311459',
    mountainFar: '#100521',
    mountainMid: '#210c42',
    mountainNear: '#39186b',
    tileMain: '#472a73',
    tileHighlight: '#d8b4fe',
    tileShadow: '#261442',
    tileOutline: '#05010a',
    accent: '#c084fc',
    secondaryAccent: '#5eead4',
    particleColor: '#e9d5ff',
  },
  alchemical_labs: {
    id: 'alchemical_labs',
    name: 'Fase 12 · Laboratórios Alquímicos',
    subtitle: 'Caldeirões de Plasma & Bobinas Tesla',
    skyTop: '#031214',
    skyMid: '#09292b',
    skyBottom: '#134745',
    mountainFar: '#061c1e',
    mountainMid: '#0d3336',
    mountainNear: '#165252',
    tileMain: '#235957',
    tileHighlight: '#5eead4',
    tileShadow: '#123332',
    tileOutline: '#020b0c',
    accent: '#2dd4bf',
    secondaryAccent: '#f43f5e',
    particleColor: '#99f6e4',
  },
  aurora_zenith: {
    id: 'aurora_zenith',
    name: 'Fase 13 · Zênite da Aurora',
    subtitle: 'Véus Boreais & Nuvens Cristalinas',
    skyTop: '#03081a',
    skyMid: '#0b2247',
    skyBottom: '#1c4f6b',
    mountainFar: '#071430',
    mountainMid: '#12315c',
    mountainNear: '#21547d',
    tileMain: '#376c96',
    tileHighlight: '#a5f3fc',
    tileShadow: '#1c3e5e',
    tileOutline: '#020612',
    accent: '#67e8f9',
    secondaryAccent: '#e879f9',
    particleColor: '#e0f2fe',
  },
  crimson_canyon: {
    id: 'crimson_canyon',
    name: 'Fase 14 · Cânion Escarlate',
    subtitle: 'Desfiladeiros Rubros & Totens',
    skyTop: '#1a0608',
    skyMid: '#3d1014',
    skyBottom: '#78221e',
    mountainFar: '#290a0d',
    mountainMid: '#4f1517',
    mountainNear: '#7a2520',
    tileMain: '#8c372b',
    tileHighlight: '#fb923c',
    tileShadow: '#4d1914',
    tileOutline: '#140404',
    accent: '#fb7185',
    secondaryAccent: '#fcd34d',
    particleColor: '#fda4af',
  },
  cyber_undercity: {
    id: 'cyber_undercity',
    name: 'Fase 15 · Submundo Neon',
    subtitle: 'Metrópole Subterrânea de Dados',
    skyTop: '#030714',
    skyMid: '#091533',
    skyBottom: '#132a5e',
    mountainFar: '#060e24',
    mountainMid: '#0d1c45',
    mountainNear: '#172e6b',
    tileMain: '#1e356e',
    tileHighlight: '#22d3ee',
    tileShadow: '#0f1b3d',
    tileOutline: '#02050d',
    accent: '#22d3ee',
    secondaryAccent: '#f472b6',
    particleColor: '#67e8f9',
  },
  celestial_marble: {
    id: 'celestial_marble',
    name: 'Fase 16 · Partenon Celeste',
    subtitle: 'Colunas de Mármore & Ouro',
    skyTop: '#0a1229',
    skyMid: '#182b59',
    skyBottom: '#33528c',
    mountainFar: '#101d40',
    mountainMid: '#1e3570',
    mountainNear: '#2e4e96',
    tileMain: '#cbd5e1',
    tileHighlight: '#fef9c3',
    tileShadow: '#64748b',
    tileOutline: '#090e1c',
    accent: '#fde68a',
    secondaryAccent: '#60a5fa',
    particleColor: '#fef08a',
  },
  ebony_fen: {
    id: 'ebony_fen',
    name: 'Fase 17 · Pântano de Ébano',
    subtitle: 'Salgueiros & Bruma Alquímica',
    skyTop: '#030d09',
    skyMid: '#082117',
    skyBottom: '#12402d',
    mountainFar: '#051710',
    mountainMid: '#0b2b1e',
    mountainNear: '#144733',
    tileMain: '#1b4d3a',
    tileHighlight: '#34d399',
    tileShadow: '#0c291e',
    tileOutline: '#020805',
    accent: '#34d399',
    secondaryAccent: '#c084fc',
    particleColor: '#6ee7b7',
  },
  orbital_nexus: {
    id: 'orbital_nexus',
    name: 'Fase 18 · Nexo Orbital',
    subtitle: 'Estação Sideral Sem Gravidade',
    skyTop: '#02030d',
    skyMid: '#080e2b',
    skyBottom: '#141f54',
    mountainFar: '#05081f',
    mountainMid: '#0c143b',
    mountainNear: '#182361',
    tileMain: '#313e78',
    tileHighlight: '#a5b4fc',
    tileShadow: '#192147',
    tileOutline: '#020208',
    accent: '#a5b4fc',
    secondaryAccent: '#fbbf24',
    particleColor: '#c7d2fe',
  },
  twilight_garden: {
    id: 'twilight_garden',
    name: 'Fase 19 · Jardim do Crepúsculo',
    subtitle: 'Lótus Violetas do Ocaso Eterno',
    skyTop: '#12041c',
    skyMid: '#2e0b40',
    skyBottom: '#591763',
    mountainFar: '#1d072b',
    mountainMid: '#3a1052',
    mountainNear: '#5c1a78',
    tileMain: '#522266',
    tileHighlight: '#f0abfc',
    tileShadow: '#2e103b',
    tileOutline: '#0a0210',
    accent: '#e879f9',
    secondaryAccent: '#fb7185',
    particleColor: '#f5d0fe',
  },
  stormcrown: {
    id: 'stormcrown',
    name: 'Fase 20 · Pináculo Etéreo',
    subtitle: 'Trono do Soberano dos Ecos',
    skyTop: '#090614',
    skyMid: '#211333',
    skyBottom: '#47274d',
    mountainFar: '#160d24',
    mountainMid: '#2c193d',
    mountainNear: '#4c284f',
    tileMain: '#584166',
    tileHighlight: '#ffdf96',
    tileShadow: '#33223d',
    tileOutline: '#06030d',
    accent: '#ffd27d',
    secondaryAccent: '#ff5c8a',
    particleColor: '#ffefa8',
  },
  ...NEW_30_BIOME_META,
};

export interface NpcProfile {
  id: string;
  name: string;
  role: string;
  accentColor: string;
  voicePitch: number;
  lines: string[];
  choices?: { label: string; reply: string }[];
}

export const NPCS: Record<string, NpcProfile> = {
  ...NEW_30_NPCS,
  vespera: {
    id: 'vespera',
    name: 'Vespera',
    role: 'Guardiã do Fogo',
    accentColor: '#e8a87c',
    voicePitch: 1.05,
    lines: [
      'Você finalmente despertou entre as cinzas, Lyra. Cada Fase desta montanha esconde múltiplas etapas interligadas — explore cada passagem para achar Relíquias secretas!',
      'Domine o Wave Dash (dash diagonal-baixo no ar + pulo ao tocar o chão) para preservar velocidade e recarregar o dash no mesmo instante.',
      'Toque o Prisma Dourado na etapa final de cada fase para purificar a região e abrir o caminho para o próximo capítulo.',
    ],
    choices: [
      {
        label: 'Como fazer um Wallbounce?',
        reply: 'Dê um Dash reto para CIMA rente a uma parede e aperte Pular imediatamente. Você subirá o triplo da altura normal!',
      },
      {
        label: 'O que há na Fase 20?',
        reply: 'O Soberano dos Ecos guarda o Coração do Éter acima da Tempestade. Somente quem dominar todas as 20 fases chegará lá.',
      },
    ],
  },
  kael: {
    id: 'kael',
    name: 'Kael',
    role: 'O Cartógrafo Errante',
    accentColor: '#8cb4ff',
    voicePitch: 0.85,
    lines: [
      'Mapeiei cada bifurcação desta etapa! Embora pareça um mundo sem fim, esta região leva diretamente ao Santuário do Vale.',
      'Paredes rachadas estilhaçam com um Dash. E paredes ilusórias revelam cofres secretos quando você investe contra elas.',
    ],
    choices: [
      {
        label: 'Como pegar a Relíquia Alada?',
        reply: 'Relíquias Aladas fogem ao menor sinal de Dash na etapa! Suba usando apenas Wall Jumps e escalada pura.',
      },
      {
        label: 'Para onde sigo nesta fase?',
        reply: 'Siga pelos arcos ao leste e suba pelas torres de pedra. Use o Mapa [M] para ver as etapas já descobertas!',
      },
    ],
  },
  mirella: {
    id: 'mirella',
    name: 'Mirella',
    role: 'A Botânica Cega',
    accentColor: '#4df0c0',
    voicePitch: 1.18,
    lines: [
      'Ouço o pulsar dos esporos no escuro... Aqui a resina verde nas paredes restaura seu vigor — descanse nela sem cansar!',
      'Os cogumelos luminosos devolvem seu Dash ao quicar. Mas cuidado com os Morteiros de Esporos nas cavernas inferiores.',
    ],
  },
  orin: {
    id: 'orin',
    name: 'Orin',
    role: 'Relojoeiro de Gelo',
    accentColor: '#7ce8ff',
    voicePitch: 0.92,
    lines: [
      'Neste bastião congelado, o vento corta os ossos e o piso de safira tira todo o atrito dos pés.',
      'Acenda as tochas antigas passando por elas. Elas aquecem a escuridão e iluminam o caminho sob as estalactites!',
    ],
  },
  ferro: {
    id: 'ferro',
    name: 'Ferro-IX',
    role: 'Autômato da Forja',
    accentColor: '#ff7733',
    voicePitch: 0.72,
    lines: [
      'ALERTA TÉRMICO: As crostas de magma drenam seu vigor em dobro. Faça saltos rápidos em vez de segurar!',
      'Dê Dash exatamente contra projéteis dos Drones Sentinelas para ativar o Dash Parry e refletir o disparo.',
    ],
  },
  echo: {
    id: 'echo',
    name: 'Eco Sombrio',
    role: 'Reflexo de Lyra',
    accentColor: '#d580ff',
    voicePitch: 1.25,
    lines: [
      'Ainda escalando, outra metade de mim? No Observatório Astral, até a gravidade obedece ao ritmo dos blocos estelares.',
      'Blocos de Sonho parecem muros... até você mergulhar neles com um Dash. Mostre que merece subir ao Pináculo!',
    ],
  },
  akane: {
    id: 'akane',
    name: 'Mestre Akane',
    role: 'Guardiã do Torii Carmesim',
    accentColor: '#ff70a6',
    voicePitch: 1.12,
    lines: [
      'As cerejeiras rubras florescem mesmo no vento cortante do santuário. Cada pétala carrega o fio de uma lâmina antiga.',
      'Observe o brilho carmesim antes do corte da Kensei das Pétalas e use o Dash na vertical para escapar do leque de flores!',
    ],
  },
  nereida: {
    id: 'nereida',
    name: 'Nereida',
    role: 'Cantora dos Abismos',
    accentColor: '#4de1ff',
    voicePitch: 1.22,
    lines: [
      'Os vitrais desta catedral foram submersos quando o grande glaciar derreteu. Corais vivos ainda iluminam os arcos de pedra.',
      'Mergulhe pelas águas abissais para amortecer quedas longas e desvie das marés sônicas do Leviatã das Profundezas!',
    ],
  },
  corvus: {
    id: 'corvus',
    name: 'Corvus',
    role: 'Artífice do Grande Pêndulo',
    accentColor: '#ffb84d',
    voicePitch: 0.82,
    lines: [
      'Cada segundo nesta torre move toneladas de latão e engrenagens eternas. Não lute contra o ritmo — corra sobre as esteiras!',
      'Chronos Prime sincroniza raios horizontais com engrenagens giratórias. Antecipe o tique-taque!',
    ],
  },
  aelia: {
    id: 'aelia',
    name: 'Aelia',
    role: 'Voz dos Jardins Celestes',
    accentColor: '#57f2a8',
    voicePitch: 1.16,
    lines: [
      'Acima das nuvens de éter, ilhas inteiras flutuam presas a correntes de esmeralda e sinos de vento.',
      'Atravesse os Anéis de Impulso no ar e use os ventos ascendentes para encarar o Serafim Esmeralda!',
    ],
  },
  zafir: {
    id: 'zafir',
    name: 'Zafir',
    role: 'Nomade da Miragem',
    accentColor: '#fbbf24',
    voicePitch: 0.94,
    lines: [
      'As pirâmides de ônix guardam prismas divisores que multiplicam a luz solar pelo deserto antigo.',
      'Cuidado com os Espectros de Areia que se materializam sob as nuvens de impulso — use o Dash para atravessar os feixes da Esfinge!',
    ],
  },
  morwen: {
    id: 'morwen',
    name: 'Morwen',
    role: 'Coveiro das Runas',
    accentColor: '#c084fc',
    voicePitch: 0.78,
    lines: [
      'Na Cripta Ametista, até a gravidade se curva aos Vórtices arcanos e Orbes de Estase que congelam o tempo dos inimigos!',
      'Os Cavaleiros Ósseos bloqueiam golpes frontais quando erguem o escudo; acerte pelas costas ou ative um Orbe de Estase!',
    ],
  },
  alch_vera: {
    id: 'alch_vera',
    name: 'Dra. Vera',
    role: 'Mestra Alquimista',
    accentColor: '#2dd4bf',
    voicePitch: 1.14,
    lines: [
      'Os reatores destes laboratórios derramaram plasma ácido pelos fossos inferiores e energizaram as Bobinas Tesla!',
      'Desvie dos frascos corrosivos dos Alquimistas e antecipe a sobrecarga prismática do Autômato Alquímico.',
    ],
  },
  freya: {
    id: 'freya',
    name: 'Freya',
    role: 'Vigia Boreal',
    accentColor: '#67e8f9',
    voicePitch: 1.2,
    lines: [
      'Bem-vindo ao Zênite da Aurora! As Nuvens de Impulso brilham no céu congelado e lançam você muito acima dos abismos sem gastar Dash.',
      'As Valquírias Boriais e Orbes Espelho patrulham o topo antes da próxima região — prove seu valor perante a Valquíria Boreal!',
    ],
  },
  kuroda: {
    id: 'kuroda',
    name: 'Mestre Kuroda',
    role: 'Guardião dos Totens Rubros',
    accentColor: '#fb7185',
    voicePitch: 0.86,
    lines: [
      'Os cânions escarlates guardam âncoras antigas! Segure [C] / Escalar perto de uma Âncora de Gancho no ar para balançar e disparar como um cometa.',
      'O Colosso do Cânion recua para longe toda vez que sofre dano — persiga-o usando os ganchos aéreos!',
    ],
  },
  zed9: {
    id: 'zed9',
    name: 'Zed-9',
    role: 'Hacker do Submundo Neon',
    accentColor: '#22d3ee',
    voicePitch: 1.08,
    lines: [
      'Bem-vindo à rede subterrânea de Neon! Ative os Portais de Fenda Astral para desafios cronometrados de 5 anéis e recompensas épicas.',
      'Use Troca em Dupla [F] quando estiver em apuros: seu parceiro entra golpeando em onda e restaura 1 Dash no ar!',
    ],
  },
  athena: {
    id: 'athena',
    name: 'Paladina Athena',
    role: 'Protetora do Partenon',
    accentColor: '#fde68a',
    voicePitch: 1.15,
    lines: [
      'As colunas de mármore sustentam o templo acima das tempestades. Combine dois elementos distintos para detonar Reações Elementais nos chefes!',
      'Prepare-se: o Colosso de Mármore protege o altar com escudos solares e relâmpagos olímpicos.',
    ],
  },
  morgana: {
    id: 'morgana',
    name: 'Bruxa Morgana',
    role: 'Alquimista do Pântano',
    accentColor: '#34d399',
    voicePitch: 1.04,
    lines: [
      'Sob os salgueiros do Pântano de Ébano, o veneno corre pelas fendas. Equipe Runas e Espíritos no Santuário [G] antes de avançar!',
      'A Hidra de Ébano ataca com tríplice baforada e salta pelas bordas sempre que é atingida!',
    ],
  },
  astra: {
    id: 'astra',
    name: 'Comandante Astra',
    role: 'Piloto da Estação Orbital',
    accentColor: '#a5b4fc',
    voicePitch: 1.12,
    lines: [
      'A estação orbita além das nuvens! Aproveite os Vórtices e ganchos magnéticos para cruzar o vazio cósmico sem perder impulso.',
      'O Imperador Sideral dispara órbitas quânticas — dê Dash Parry no momento exato para devolver o golpe teleguiado!',
    ],
  },
  sylphie: {
    id: 'sylphie',
    name: 'Sylphie',
    role: 'Guardiã das Lótus Noturnas',
    accentColor: '#e879f9',
    voicePitch: 1.24,
    lines: [
      'Você alcançou o Jardim do Crepúsculo, último portal antes do Pináculo Etéreo! Cada lótus guarda memórias antigas da montanha.',
      'Domine sua Árvore de Maestria e vença o Espectro do Crepúsculo para encarar o Soberano dos Ecos na Fase 20!',
    ],
  },
};

class StagePainter {
  public readonly cols: number;
  public readonly rows: number;
  public tiles: number[];
  public entities: RoomEntityDef[] = [];
  public props: RoomPropDef[] = [];
  private entSeq = 0;
  private stageId: string;

  constructor(stageId: string, cols = 60, rows = 25) {
    this.stageId = stageId;
    this.cols = cols;
    this.rows = rows;
    this.tiles = new Array(cols * rows).fill(TileType.EMPTY);
  }

  public get(tx: number, ty: number): number {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return TileType.SOLID;
    return this.tiles[ty * this.cols + tx];
  }

  public set(tx: number, ty: number, val: number): void {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return;
    this.tiles[ty * this.cols + tx] = val;
  }

  public rect(x: number, y: number, w: number, h: number, val: number): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.set(x + dx, y + dy, val);
      }
    }
  }

  /** Anchored stepped bedrock mass from topY all the way down to bottom floor. */
  public cliff(x: number, topY: number, w: number, val: number = TileType.SOLID): void {
    const clampedTop = Math.max(2, Math.min(this.rows - 2, topY));
    this.rect(x, clampedTop, w, this.rows - clampedTop, val);
  }

  /** Rugged multi-step rock island / plateau with beveled underside so terrain isn't boxy. */
  public island(x: number, y: number, w: number, thickness = 2, val: number = TileType.SOLID): void {
    this.rect(x, y, w, thickness, val);
    if (w >= 4 && thickness >= 2) {
      this.rect(x + 1, y + thickness, w - 2, 1, val);
    }
  }

  /** Hanging rocky stalactite / ceiling overhang mass from top border. */
  public ceilingMass(x: number, w: number, depth: number, val: number = TileType.SOLID): void {
    this.rect(x, 0, w, depth, val);
    if (w >= 4) {
      this.rect(x + 1, depth, w - 2, 1, val);
    }
    if (w >= 6) {
      this.rect(x + 2, depth + 1, w - 4, 1, val);
    }
  }

  public spikes(
    x: number,
    y: number,
    len: number,
    dir: 'up' | 'down' | 'left' | 'right',
    vertical = false
  ): void {
    const val =
      dir === 'up'
        ? TileType.SPIKE_UP
        : dir === 'down'
          ? TileType.SPIKE_DOWN
          : dir === 'left'
            ? TileType.SPIKE_LEFT
            : TileType.SPIKE_RIGHT;
    for (let i = 0; i < len; i++) {
      this.set(vertical ? x : x + i, vertical ? y + i : y, val);
    }
  }

  public add(kind: EntityKind, tx: number, ty: number, extra: Partial<RoomEntityDef> = {}): void {
    this.entSeq++;
    this.entities.push({
      id: `${this.stageId}_e${this.entSeq}`,
      kind,
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
      ...extra,
    });
  }

  public prop(kind: RoomPropDef['kind'], tx: number, ty: number, h = 6): void {
    this.props.push({ kind, tx, ty, h });
  }
}

class TranslatedStagePainter {
  public readonly cols: number;
  public readonly rows: number;
  private inner: StagePainter;
  private offsetX: number;
  private offsetY: number;

  constructor(inner: StagePainter, origCols: number, origRows: number, offsetX: number, offsetY = 0) {
    this.inner = inner;
    this.cols = origCols;
    this.rows = origRows;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  public get(tx: number, ty: number): number {
    return this.inner.get(tx + this.offsetX, ty + this.offsetY);
  }

  public set(tx: number, ty: number, val: number): void {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= this.rows) return;
    this.inner.set(tx + this.offsetX, ty + this.offsetY, val);
  }

  public rect(x: number, y: number, w: number, h: number, val: number): void {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.set(x + dx, y + dy, val);
      }
    }
  }

  public cliff(x: number, topY: number, w: number, val: number = TileType.SOLID): void {
    const clampedTop = Math.max(2, Math.min(this.rows - 2, topY));
    this.rect(x, clampedTop, w, this.rows - clampedTop, val);
  }

  public island(x: number, y: number, w: number, thickness = 2, val: number = TileType.SOLID): void {
    this.rect(x, y, w, thickness, val);
    if (w >= 4 && thickness >= 2) {
      this.rect(x + 1, y + thickness, w - 2, 1, val);
    }
  }

  public ceilingMass(x: number, w: number, depth: number, val: number = TileType.SOLID): void {
    this.rect(x, 0, w, depth, val);
    if (w >= 4) this.rect(x + 1, depth, w - 2, 1, val);
    if (w >= 6) this.rect(x + 2, depth + 1, w - 4, 1, val);
  }

  public spikes(x: number, y: number, len: number, dir: 'up' | 'down' | 'left' | 'right', vertical = false): void {
    const val =
      dir === 'up'
        ? TileType.SPIKE_UP
        : dir === 'down'
          ? TileType.SPIKE_DOWN
          : dir === 'left'
            ? TileType.SPIKE_LEFT
            : TileType.SPIKE_RIGHT;
    for (let i = 0; i < len; i++) {
      this.set(vertical ? x : x + i, vertical ? y + i : y, val);
    }
  }

  public add(kind: EntityKind, tx: number, ty: number, extra: Partial<RoomEntityDef> = {}): void {
    const shifted: Partial<RoomEntityDef> = { ...extra };
    if (typeof shifted.tx === 'number') shifted.tx = shifted.tx + this.offsetX * TILE_SIZE;
    if (typeof shifted.ty === 'number') shifted.ty = shifted.ty + this.offsetY * TILE_SIZE;
    this.inner.add(kind, tx + this.offsetX, ty + this.offsetY, shifted);
  }

  public prop(kind: RoomPropDef['kind'], tx: number, ty: number, h = 6): void {
    this.inner.prop(kind, tx + this.offsetX, ty + this.offsetY, h);
  }
}

interface NeighborMask {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

interface ResolvedExits {
  leftRow: number;
  rightRow: number;
  upCol: number;
  downCol: number;
}

function applyStageBorders(
  p: StagePainter,
  neighbors: NeighborMask,
  exits: ResolvedExits,
  clearTitleSky = false
): void {
  const C = p.cols;
  const R = p.rows;

  // Outer perimeter rock frame + subtle organic crags along top ceiling and sides
  p.rect(0, 0, C, 2, TileType.SOLID);
  p.rect(0, R - 2, C, 2, TileType.SOLID);
  p.rect(0, 0, 2, R, TileType.SOLID);
  p.rect(C - 2, 0, 2, R, TileType.SOLID);

  for (let tx = 4; tx < C - 4; tx += 7) {
    const crag = ((tx * 13 + R * 7) % 3);
    if (crag > 0 && !(clearTitleSky && tx < 22)) {
      p.rect(tx, 2, 3, crag, TileType.SOLID);
    }
  }

  if (clearTitleSky) {
    // Open starry sky view behind Title emblem on Stage 1 top-left
    p.rect(2, 0, 20, 2, TileType.EMPTY);
  }

  const carveSideDoor = (isRight: boolean, floorRow: number) => {
    const colStart = isRight ? C - 2 : 0;
    const innerCol = isRight ? C - 6 : 2;
    const clampedFloor = Math.max(8, Math.min(R - 2, floorRow));
    const topOpen = Math.max(2, clampedFloor - 5);
    p.rect(colStart, topOpen, 2, clampedFloor - topOpen, TileType.EMPTY);
    p.rect(innerCol, topOpen, 4, clampedFloor - topOpen, TileType.EMPTY);
    p.rect(colStart, clampedFloor, 2, R - clampedFloor, TileType.SOLID);
    p.rect(innerCol, clampedFloor, 4, 1, TileType.SOLID);
    // Ornamental stone arch/lantern framing doorway
    p.prop('lantern', isRight ? C - 4 : 3, Math.max(2, topOpen - 1), 3);
  };

  if (neighbors.left) carveSideDoor(false, exits.leftRow);
  if (neighbors.right) carveSideDoor(true, exits.rightRow);

  const carveVertDoor = (isBottom: boolean, colCenter: number) => {
    const c0 = Math.max(6, Math.min(C - 10, colCenter - 3));
    if (!isBottom) {
      p.rect(c0, 0, 6, 4, TileType.EMPTY);
      p.rect(c0 - 2, 4, 3, 1, TileType.ONE_WAY);
      p.rect(c0 + 5, 4, 3, 1, TileType.ONE_WAY);
    } else {
      p.rect(c0, R - 4, 6, 4, TileType.EMPTY);
      // Guarantee a clear descent shaft through upper ceiling/bridges down to bottom exit
      for (let ty = R - 5; ty >= 10; ty--) {
        for (let x = c0; x < c0 + 6; x++) {
          const cur = p.get(x, ty);
          if (cur !== TileType.EMPTY && cur !== TileType.ONE_WAY) {
            p.set(x, ty, TileType.EMPTY);
          }
        }
      }
      p.rect(c0, R - 3, 6, 1, TileType.ONE_WAY);
      // Bounce spring to easily ascend back up through vertical portals
      const springExists = p.entities.some(
        (e) => e.kind === 'spring_up' && Math.abs(e.x - (c0 + 2) * TILE_SIZE) < 24 && e.y >= (R - 5) * TILE_SIZE
      );
      if (!springExists) {
        p.add('spring_up', c0 + 2, R - 4);
      }
    }
  };

  if (neighbors.up) carveVertDoor(false, exits.upCol);
  if (neighbors.down) carveVertDoor(true, exits.downCol);
}

/** Finds an open air pocket (w x h tiles, plus 1 tile margin) near a target, or null. */
function findAirPocket(p: StagePainter, cx: number, cy: number, w: number, h: number): { tx: number; ty: number } | null {
  const fits = (tx: number, ty: number) => {
    for (let y = ty - 1; y <= ty + h; y++) {
      for (let x = tx - 1; x <= tx + w; x++) {
        if (x < 3 || y < 3 || x >= p.cols - 3 || y >= p.rows - 4) return false;
        if (p.get(x, y) !== TileType.EMPTY) return false;
      }
    }
    const tooClose = p.entities.some((e) => Math.abs(e.x / TILE_SIZE - tx) < 3 && Math.abs(e.y / TILE_SIZE - ty) < 3);
    return !tooClose;
  };
  for (let r = 0; r < 10; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (fits(cx + dx, cy + dy)) return { tx: cx + dx, ty: cy + dy };
      }
    }
  }
  return null;
}

/** Sprinkles the newer mechanics through every non-boss stage in safe open air. */
function addNewMechanics(p: StagePainter, seed: number): void {
  const C = p.cols;
  const R = p.rows;
  const place = (kind: EntityKind, fx: number, fy: number, w = 2, h = 2, extra: Partial<RoomEntityDef> = {}) => {
    const spot = findAirPocket(p, Math.floor(C * fx), Math.floor(R * fy), w, h);
    if (spot) p.add(kind, spot.tx, spot.ty, extra);
    return Boolean(spot);
  };
  const v = seed % 5;
  if (v === 0 || v === 3) place('jump_orb', 0.42, 0.42);
  if (v === 1 || v === 4) place('cannon_barrel', 0.3, 0.55, 2, 2, { dir: seed % 2 ? -1 : 1 });
  if (v === 2) place('rocket_pack', 0.5, 0.6);
  if (v === 3) place('phase_veil', 0.6, 0.35, 1, 5);
  if (v === 1 || v === 2) place('pulse_fan', 0.66, 0.5, 3, 9, { w: 24, h: 72 });
  if (v === 4) place('jump_orb', 0.7, 0.38);
  // Every stage hides a 3-shard constellation in its upper corners/centre
  place('star_shard', 0.14, 0.2, 1, 1);
  place('star_shard', 0.5, 0.15, 1, 1);
  place('star_shard', 0.86, 0.2, 1, 1);
}

interface StageBlueprint {
  gx: number;
  gy: number;
  name: string;
  subtitle: string;
  cols?: number;
  rows?: number;
  spawnCol?: number;
  spawnRow?: number;
  leftRow?: number;
  rightRow?: number;
  upCol?: number;
  downCol?: number;
  isStart?: boolean;
  isGoal?: boolean;
  dark?: boolean;
  pattern: number;
  build?: (p: StagePainter, biome: BiomeId, exits: ResolvedExits) => void;
}

function addBiomeDecor(p: StagePainter, biome: BiomeId, seed: number): void {
  const C = p.cols;
  const R = p.rows;
  if (biome === 'silver_ash') {
    p.prop('ruin_tower', 8 + (seed % 5), R - 11, 9);
    p.prop('rose_window', Math.floor(C * 0.48), 4, 6);
    p.prop('tree_pine', 4, R - 9, 6);
    p.prop('tree_pine', C - 9, R - 9, 6);
    p.prop('bird_perch', Math.floor(C * 0.35), 7, 1);
    p.prop('wind_chime', Math.floor(C * 0.65), 2, 4);
  } else if (biome === 'bioluminescent') {
    p.prop('shroom_giant', 6, R - 9, 6);
    p.prop('shroom_giant', C - 10, R - 10, 7);
    p.prop('hanging_vine', Math.floor(C * 0.32), 2, 6);
    p.prop('hanging_vine', Math.floor(C * 0.68), 2, 7);
    p.prop('kelp_strand', Math.floor(C * 0.22), R - 10, 7);
    p.prop('coral_fan', Math.floor(C * 0.56), R - 5, 3);
    p.prop('waterfall', Math.floor(C * 0.78), 2, R - 5);
  } else if (biome === 'frostglass') {
    p.prop('crystal_spire', Math.floor(C * 0.25), R - 9, 7);
    p.prop('crystal_spire', Math.floor(C * 0.72), R - 10, 8);
    p.prop('rose_window', Math.floor(C * 0.5), 4, 6);
    p.prop('wind_chime', Math.floor(C * 0.36), 2, 4);
    p.prop('tree_pine', 5, R - 9, 6);
  } else if (biome === 'obsidian_forge') {
    p.prop('anvil', 6, R - 5, 2);
    p.prop('brazier', Math.floor(C * 0.35), R - 5, 2);
    p.prop('brazier', Math.floor(C * 0.75), R - 5, 2);
    p.prop('chain', Math.floor(C * 0.28), 2, 9);
    p.prop('chain', Math.floor(C * 0.64), 2, 11);
    p.prop('pendulum', Math.floor(C * 0.48), 2, 7);
  } else if (biome === 'astral_void') {
    p.prop('obelisk', Math.floor(C * 0.28), R - 10, 8);
    p.prop('obelisk', Math.floor(C * 0.72), R - 10, 8);
    p.prop('rose_window', Math.floor(C * 0.5), 4, 6);
    p.prop('floating_island', Math.floor(C * 0.18), 5, 3);
  } else if (biome === 'crimson_sakura') {
    p.prop('sakura_tree', 5 + (seed % 4), R - 11, 8);
    p.prop('sakura_tree', C - 12, R - 11, 8);
    p.prop('torii_gate', Math.floor(C * 0.46), R - 10, 7);
    p.prop('paper_lantern', Math.floor(C * 0.24), 2, 5);
    p.prop('paper_lantern', Math.floor(C * 0.72), 2, 5);
    p.prop('wind_chime', Math.floor(C * 0.35), 2, 4);
    p.prop('bird_perch', Math.floor(C * 0.62), 6, 1);
  } else if (biome === 'sunken_cathedral') {
    p.prop('rose_window', Math.floor(C * 0.48), 4, 7);
    p.prop('coral_fan', 6 + (seed % 5), R - 6, 3);
    p.prop('coral_fan', C - 11, R - 6, 3);
    p.prop('kelp_strand', Math.floor(C * 0.2), R - 11, 8);
    p.prop('kelp_strand', Math.floor(C * 0.78), R - 11, 8);
    p.prop('sunken_anchor', Math.floor(C * 0.34), 2, 8);
    p.prop('waterfall', Math.floor(C * 0.65), 2, R - 5);
  } else if (biome === 'clockwork_spire') {
    p.prop('clock_gear', Math.floor(C * 0.22), 5, 6);
    p.prop('clock_gear', Math.floor(C * 0.74), 6, 6);
    p.prop('pendulum', Math.floor(C * 0.48), 2, 9);
    p.prop('rose_window', Math.floor(C * 0.36), 4, 6);
    p.prop('chain', Math.floor(C * 0.62), 2, 10);
    p.prop('brazier', 7, R - 5, 2);
  } else if (biome === 'emerald_sky') {
    p.prop('floating_island', Math.floor(C * 0.22), 5, 4);
    p.prop('floating_island', Math.floor(C * 0.72), 6, 4);
    p.prop('sun_dial', Math.floor(C * 0.5), R - 9, 6);
    p.prop('wind_chime', Math.floor(C * 0.34), 2, 4);
    p.prop('wind_chime', Math.floor(C * 0.66), 2, 4);
    p.prop('waterfall', Math.floor(C * 0.24), 8, R - 10);
    p.prop('bird_perch', Math.floor(C * 0.55), 7, 1);
  } else if (biome === 'solar_mirage') {
    p.prop('pyramid_obelisk', Math.floor(C * 0.24), R - 11, 9);
    p.prop('pyramid_obelisk', Math.floor(C * 0.74), R - 11, 9);
    p.prop('sun_brazier', 7, R - 5, 3);
    p.prop('sun_brazier', C - 9, R - 5, 3);
    p.prop('sun_dial', Math.floor(C * 0.49), R - 9, 6);
    p.prop('banner', Math.floor(C * 0.37), 3, 5);
  } else if (biome === 'amethyst_crypt') {
    p.prop('crystal_chandelier', Math.floor(C * 0.3), 2, 5);
    p.prop('crystal_chandelier', Math.floor(C * 0.7), 2, 5);
    p.prop('soul_urn', 8 + (seed % 4), R - 5, 3);
    p.prop('soul_urn', C - 10, R - 5, 3);
    p.prop('rose_window', Math.floor(C * 0.5), 4, 6);
    p.prop('obelisk', Math.floor(C * 0.19), R - 10, 8);
  } else if (biome === 'alchemical_labs') {
    p.prop('alchemy_vat', Math.floor(C * 0.23), R - 7, 5);
    p.prop('alchemy_vat', Math.floor(C * 0.75), R - 7, 5);
    p.prop('tesla_coil', Math.floor(C * 0.42), R - 8, 6);
    p.prop('tesla_coil', Math.floor(C * 0.58), R - 8, 6);
    p.prop('chain', Math.floor(C * 0.34), 2, 9);
    p.prop('clock_gear', Math.floor(C * 0.5), 5, 6);
  } else if (biome === 'aurora_zenith') {
    p.prop('aurora_prism', Math.floor(C * 0.26), R - 10, 8);
    p.prop('aurora_prism', Math.floor(C * 0.74), R - 10, 8);
    p.prop('frost_arch', Math.floor(C * 0.47), R - 10, 7);
    p.prop('crystal_chandelier', Math.floor(C * 0.35), 2, 5);
    p.prop('wind_chime', Math.floor(C * 0.64), 2, 4);
  } else if (biome === 'crimson_canyon') {
    p.prop('canyon_totem', 7 + (seed % 4), R - 11, 8);
    p.prop('canyon_totem', C - 10, R - 11, 8);
    p.prop('brazier', Math.floor(C * 0.32), R - 5, 2);
    p.prop('brazier', Math.floor(C * 0.68), R - 5, 2);
    p.prop('banner', Math.floor(C * 0.5), 3, 5);
  } else if (biome === 'cyber_undercity') {
    p.prop('holo_pylon', Math.floor(C * 0.24), R - 10, 8);
    p.prop('holo_pylon', Math.floor(C * 0.76), R - 10, 8);
    p.prop('tesla_coil', Math.floor(C * 0.5), R - 8, 6);
    p.prop('chain', Math.floor(C * 0.38), 2, 8);
  } else if (biome === 'celestial_marble') {
    p.prop('marble_column', 8, R - 12, 10);
    p.prop('marble_column', C - 11, R - 12, 10);
    p.prop('marble_column', Math.floor(C * 0.5), R - 12, 10);
    p.prop('sun_dial', Math.floor(C * 0.32), R - 9, 6);
    p.prop('rose_window', Math.floor(C * 0.66), 4, 6);
  } else if (biome === 'ebony_fen') {
    p.prop('willow_tree', 6 + (seed % 3), R - 12, 9);
    p.prop('willow_tree', C - 12, R - 12, 9);
    p.prop('hanging_vine', Math.floor(C * 0.36), 2, 7);
    p.prop('hanging_vine', Math.floor(C * 0.64), 2, 7);
    p.prop('soul_urn', Math.floor(C * 0.48), R - 5, 3);
  } else if (biome === 'orbital_nexus') {
    p.prop('star_satellite', Math.floor(C * 0.28), 4, 6);
    p.prop('star_satellite', Math.floor(C * 0.72), 4, 6);
    p.prop('holo_pylon', Math.floor(C * 0.5), R - 10, 8);
    p.prop('floating_island', Math.floor(C * 0.16), 6, 4);
  } else if (biome === 'twilight_garden') {
    p.prop('twilight_lotus', 8, R - 8, 5);
    p.prop('twilight_lotus', C - 11, R - 8, 5);
    p.prop('twilight_lotus', Math.floor(C * 0.48), R - 8, 5);
    p.prop('paper_lantern', Math.floor(C * 0.32), 2, 5);
    p.prop('paper_lantern', Math.floor(C * 0.68), 2, 5);
    p.prop('sakura_tree', Math.floor(C * 0.22), R - 11, 8);
  } else if (biome in NEW_30_WORLD_MAP) {
    addNew30BiomeDecor(p, biome);
  } else {
    p.prop('obelisk', Math.floor(C * 0.22), R - 10, 8);
    p.prop('ruin_tower', Math.floor(C * 0.76), R - 12, 10);
    p.prop('rose_window', Math.floor(C * 0.5), 4, 6);
    p.prop('sun_dial', Math.floor(C * 0.36), R - 9, 6);
    p.prop('floating_island', Math.floor(C * 0.64), 5, 3);
    p.prop('brazier', Math.floor(C * 0.14), R - 5, 2);
  }

  // Extra atmospheric vista props spanning expanded 3x stages (Zone 1 & Zone 3 wings)
  if (C >= 120) {
    const spanPool: RoomPropDef['kind'][] = [
      'arch',
      'ruin_tower',
      'stained_window',
      'lantern',
      'brazier',
      'banner',
      'statue',
      'crystal_cluster',
    ];
    for (let z = 0; z < 5; z++) {
      const col = Math.floor(C * (0.12 + z * 0.19));
      const kind = spanPool[(seed + z * 3) % spanPool.length];
      const topProp = kind === 'lantern' || kind === 'banner' || kind === 'stained_window';
      p.prop(kind, col, topProp ? 3 + (z % 2) : Math.max(4, R - 11), 6 + (z % 3));
    }
  }
}

const CHAPTER_CONFIGS: {
  id: BiomeId;
  name: string;
  subtitle: string;
  difficultyLabel: string;
  accent: string;
  stages: StageBlueprint[];
}[] = [
  // ===========================================================================
  // FASE 1: VALE DAS CINZAS PRATEADAS (8 Etapas assimétricas e multi-nível)
  // ===========================================================================
  {
    id: 'silver_ash',
    name: 'Fase 1 · Vale das Cinzas',
    subtitle: 'Ruínas da Primeira Vigília',
    difficultyLabel: 'Dificuldade: Alta',
    accent: '#e8a87c',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 24,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Santuário Inicial',
        subtitle: 'Fogueira da Vigília · Suba os terraços e falésias até o portão alto!',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          // Terraced valley: sunken moat at middle so player CANNOT walk flat to the right!
          p.cliff(2, 21, 18, TileType.SOLID);
          p.rect(20, 21, 10, 3, TileType.WATER);
          p.cliff(30, 18, 9, TileType.SOLID);
          p.rect(39, 20, 6, 4, TileType.LIQUID_LETHAL);
          p.cliff(45, exits.rightRow, 13, TileType.SOLID);

          // Upper scenic & ruined bridge platforms
          p.rect(6, 17, 6, 1, TileType.ONE_WAY);
          p.island(14, 15, 7, 2, TileType.SOLID);
          p.rect(23, 13, 6, 1, TileType.ONE_WAY);
          p.island(31, 12, 7, 2, TileType.SOLID);
          p.rect(14, 9, 6, 1, TileType.ONE_WAY);
          p.rect(21, 6, 8, 1, TileType.ONE_WAY);
          p.island(41, 10, 7, 2, TileType.SOLID);

          // Secret wall vault tucked high right
          p.rect(52, 4, 6, 6, TileType.SOLID);
          p.rect(53, 5, 4, 4, TileType.EMPTY);
          p.rect(52, 5, 1, 4, TileType.SECRET_WALL);
          p.add('relic', 55, 7);

          p.prop('tree_pine', 3, 15, 6);
          p.prop('arch', 8, 14, 7);
          p.prop('brazier', 8, 19, 2);
          p.prop('stained_window', 25, 4, 6);
          p.prop('stained_window', 47, 4, 6);
          p.prop('ruin_tower', 33, 4, 8);
          p.prop('lantern', 12, 2, 4);
          p.prop('waterfall', 54, 10, 4);
          p.prop('bird_perch', 24, 5, 1);
          p.prop('bird_perch', 43, 9, 1);

          p.add('campfire', 10, 20);
          p.add('npc', 13, 20, { npcId: 'vespera' });
          p.add('signpost', 6, 20, {
            text: 'WASD/Setas: Mover · Espaço/Z: Pular · X/Shift: Dash · C: Escalar · Q: Poder · B: Bênçãos',
          });
          p.add('speed_pad', 17, 20);
          p.add('bumper_orb', 25, 17);
          p.add('checkpoint_totem', 34, 16);
          p.add('treasure_chest', 44, 8);
          p.add('shield_orb', 22, 8);
          p.add('blessing_shrine', 15, 13);
          p.add('boost_hoop', 22, 9);
          p.add('boost_hoop', 42, 7);
          p.add('astral_coin', 8, 15);
          p.add('astral_coin', 17, 13);
          p.add('astral_coin', 26, 11);
          p.add('astral_coin', 34, 10);
          p.add('astral_coin', 43, 8);
          p.add('dash_crystal', 26, 11);
          p.add('dash_crystal', 41, 13);
          p.add('spring_up', 37, 17);
          p.add('relic', 25, 4);
        },
      },
      {
        gx: 1,
        gy: 1,
        cols: 66,
        rows: 26,
        spawnCol: 4,
        spawnRow: 13,
        leftRow: 14,
        rightRow: 19,
        name: 'Etapa 2 · Desfiladeiro dos Ecos',
        subtitle: 'Abismo partido por pontes instáveis e vigias errantes',
        pattern: 1,
        build: (p, _b, exits) => {
          // High West entrance stepping down across gaping spike chasm toward low East gate
          p.cliff(2, exits.leftRow, 9, TileType.SOLID);
          p.spikes(11, 23, 18, 'up');
          p.island(13, 16, 6, 2, TileType.CRUMBLE);
          p.cliff(29, 19, 9, TileType.SOLID);
          p.spikes(38, 23, 14, 'up');
          p.rect(22, 13, 5, 1, TileType.ONE_WAY);
          p.island(41, 15, 6, 2, TileType.SOLID);
          p.rect(49, 12, 5, 1, TileType.ONE_WAY);
          p.cliff(52, exits.rightRow, 12, TileType.SOLID);

          // Upper alternate shortcut with crystal + relic
          p.island(27, 8, 8, 2, TileType.SOLID);
          p.rect(17, 9, 6, 1, TileType.ONE_WAY);
          p.ceilingMass(14, 10, 4);
          p.ceilingMass(38, 12, 4);

          p.prop('ruin_tower', 31, 11, 8);
          p.prop('stained_window', 33, 5, 6);
          p.prop('arch', 54, 12, 7);
          p.prop('bird_perch', 29, 7, 1);

          p.add('enemy_crawler', 31, 18, { patrolDist: 28 });
          p.add('enemy_wisp', 44, 10, { patrolDist: 18 });
          p.add('dash_crystal', 20, 12);
          p.add('dash_crystal', 43, 12);
          p.add('boost_hoop', 35, 11);
          p.add('astral_coin', 15, 14);
          p.add('astral_coin', 31, 6);
          p.add('astral_coin', 44, 13);
          p.add('relic', 30, 6);
        },
      },
      {
        gx: 2,
        gy: 1,
        cols: 62,
        rows: 30,
        spawnCol: 4,
        spawnRow: 18,
        leftRow: 19,
        rightRow: 16,
        upCol: 32,
        name: 'Etapa 3 · Encruzilhada da Torre',
        subtitle: 'Sobe pela Chaminé Norte [Cima] ou segue às Runas [Leste]',
        pattern: 2,
        build: (p, _b, exits) => {
          // Bifurcated hub: central abyss, switch-lit ascent chimney to north exit!
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.rect(14, 27, 12, 3, TileType.WATER);
          p.cliff(26, 22, 10, TileType.SOLID);
          p.spikes(36, 27, 10, 'up');
          p.cliff(46, exits.rightRow, 14, TileType.SOLID);

          // Vertical climb chimney around x = 28..36 heading up to exits.upCol
          p.rect(24, 6, 2, 13, TileType.SOLID);
          p.rect(38, 6, 2, 13, TileType.SOLID);
          p.rect(27, 16, 4, 1, TileType.ONE_WAY);
          p.rect(32, 12, 5, 1, TileType.ONE_WAY);
          p.rect(27, 8, 4, 1, TileType.ONE_WAY);
          p.rect(16, 17, 6, 1, TileType.CRUMBLE);
          p.island(41, 14, 4, 2, TileType.ONE_WAY);

          p.prop('statue', 7, 15, 4);
          p.prop('brazier', 9, 17, 2);
          p.prop('stained_window', 30, 4, 6);
          p.prop('banner', 48, 10, 5);
          p.prop('waterfall', 20, 2, 25);

          p.add('campfire', 6, 18);
          p.add('blessing_shrine', 29, 20);
          p.add('checkpoint_totem', 33, 20);
          p.add('bumper_orb', 20, 15);
          p.add('treasure_chest', 42, 12);
          p.add('spring_up', 22, 26);
          p.add('enemy_crawler', 49, 15, { patrolDist: 28 });
          p.add('enemy_wisp', 19, 12, { patrolDist: 16 });
          p.add('dash_crystal', 31, 14);
          p.add('dash_crystal', 42, 11);
          p.add('astral_coin', 18, 15);
          p.add('astral_coin', 34, 10);
          p.add('astral_coin', 43, 12);
          p.add('relic', 28, 6);
        },
      },
      {
        gx: 3,
        gy: 1,
        cols: 64,
        rows: 26,
        spawnCol: 4,
        spawnRow: 15,
        leftRow: 16,
        name: 'Etapa 4 · Claustro das Runas',
        subtitle: 'Explore as 3 asas submersas para abrir o Cofre do Sábio!',
        pattern: 3,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.rect(13, 21, 20, 5, TileType.WATER);
          p.cliff(33, 20, 12, TileType.SOLID);
          p.cliff(45, 18, 17, TileType.SOLID);

          p.island(16, 15, 6, 2, TileType.SOLID);
          p.rect(25, 11, 6, 1, TileType.ONE_WAY);
          p.island(36, 13, 6, 2, TileType.SOLID);
          p.rect(11, 9, 6, 1, TileType.ONE_WAY);
          p.rect(47, 5, 2, 13, TileType.SOLID);

          p.prop('arch', 8, 9, 7);
          p.prop('stained_window', 24, 4, 6);
          p.prop('waterfall', 19, 2, 19);
          p.prop('banner', 49, 11, 5);

          p.add('switch_gate', 47, 13, { w: 8, h: 40 });
          p.add('touch_switch', 13, 7);
          p.add('touch_switch', 27, 9);
          p.add('touch_switch', 38, 11);
          p.add('enemy_wisp', 21, 11, { patrolDist: 18 });
          p.add('astral_coin', 18, 13);
          p.add('astral_coin', 38, 18);
          p.add('astral_coin', 54, 15);
          p.add('boost_hoop', 31, 14);
          p.add('relic', 56, 16);
        },
      },
      {
        gx: 2,
        gy: 0,
        cols: 64,
        rows: 30,
        spawnCol: 32,
        spawnRow: 26,
        downCol: 32,
        leftRow: 13,
        rightRow: 10,
        name: 'Etapa 5 · Torre dos Ventos',
        subtitle: 'Eixo vertical entre o Mirante Oeste e o Altar Leste!',
        pattern: 4,
      },
      {
        gx: 1,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 56,
        spawnRow: 12,
        leftRow: 16,
        rightRow: 13,
        name: 'Etapa 6 · Galeria das Torres',
        subtitle: 'Pontes quebradiças, paredes rachadas e salto entre obeliscos',
        pattern: 5,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 9, TileType.SOLID);
          p.spikes(11, 23, 14, 'up');
          p.island(14, 15, 5, 1, TileType.CRUMBLE);
          p.cliff(25, 19, 11, TileType.SOLID);
          p.rect(36, 22, 12, 4, TileType.WATER);
          p.island(39, 15, 6, 2, TileType.CRUMBLE);
          p.cliff(48, exits.rightRow, 12, TileType.SOLID);
          p.rect(31, 13, 2, 6, TileType.BREAKABLE);
          p.rect(20, 9, 7, 1, TileType.ONE_WAY);

          p.prop('ruin_tower', 27, 11, 8);
          p.prop('stained_window', 38, 4, 6);
          p.prop('lantern', 18, 2, 4);

          p.add('enemy_crawler', 26, 18, { patrolDist: 18 });
          p.add('enemy_wisp', 42, 9, { patrolDist: 20 });
          p.add('dash_crystal', 22, 12);
          p.add('dash_crystal', 44, 11);
          p.add('astral_coin', 16, 13);
          p.add('astral_coin', 23, 7);
          p.add('relic', 34, 17);
        },
      },
      {
        gx: 0,
        gy: 0,
        cols: 58,
        rows: 28,
        spawnCol: 52,
        spawnRow: 15,
        rightRow: 16,
        name: 'Etapa 7 · Mirante Secreto',
        subtitle: 'Kael, o Cartógrafo · Relíquia Alada (Suba sem usar Dash!)',
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 22, 14, TileType.SOLID);
          p.spikes(16, 25, 10, 'up');
          p.cliff(26, 19, 8, TileType.SOLID);
          p.spikes(34, 25, 12, 'up');
          p.cliff(46, exits.rightRow, 10, TileType.SOLID);

          p.island(16, 18, 4, 2, TileType.SOLID);
          p.island(23, 14, 5, 2, TileType.SOLID);
          p.rect(14, 10, 5, 1, TileType.ONE_WAY);
          p.island(6, 7, 6, 2, TileType.SOLID);

          p.prop('arch', 4, 15, 7);
          p.prop('statue', 29, 15, 4);
          p.prop('stained_window', 18, 4, 6);
          p.prop('bird_perch', 8, 6, 1);

          p.add('npc', 50, exits.rightRow - 1, { npcId: 'kael' });
          p.add('winged_relic', 8, 5);
          p.add('astral_coin', 16, 8);
          p.add('astral_coin', 25, 12);
          p.add('dash_crystal', 39, 14);
        },
      },
      {
        gx: 3,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 9,
        leftRow: 10,
        rightRow: 15,
        name: 'Etapa 8 · Pátio do Guardião',
        subtitle: 'Salte entre as ruínas suspensas rumo à cidadela do Sentinela',
        pattern: 2,
      },
      {
        gx: 4,
        gy: 0,
        cols: 64,
        rows: 26,
        leftRow: 15,
        rightRow: 17,
        name: 'Etapa 9 · Muralha das Cinzas',
        subtitle: 'Bandeiras quebradas, sinos e fúria antes da arena final',
        pattern: 3,
      },
      {
        gx: 5,
        gy: 0,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 18,
        leftRow: 19,
        name: 'Etapa 10 · Arena do Sentinela',
        subtitle: 'Derrote o Sentinela de Obsidiana para liberar o Prisma das Cinzas!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 14, TileType.SOLID);
          p.cliff(16, 21, 28, TileType.SOLID);
          p.cliff(44, 18, 14, TileType.SOLID);

          p.rect(10, 14, 7, 1, TileType.ONE_WAY);
          p.rect(24, 12, 12, 1, TileType.ONE_WAY);
          p.rect(42, 13, 7, 1, TileType.ONE_WAY);
          p.island(18, 16, 5, 1, TileType.ONE_WAY);
          p.island(37, 16, 5, 1, TileType.ONE_WAY);

          p.prop('arch', 25, 4, 8);
          p.prop('stained_window', 14, 4, 6);
          p.prop('stained_window', 40, 4, 6);
          p.prop('banner', 8, 10, 5);
          p.prop('banner', 50, 10, 5);
          p.prop('brazier', 15, 19, 2);
          p.prop('brazier', 42, 16, 2);

          p.add('dash_crystal', 13, 12);
          p.add('dash_crystal', 45, 11);
          p.add('shield_orb', 29, 10);
          p.add('boost_hoop', 29, 15);
          p.add('astral_coin', 26, 10);
          p.add('astral_coin', 33, 10);
          p.add('relic', 29, 8);
          p.add('boss_sentinel', 35, 15);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 2: BOSQUE ABISSAL BIOLUMINESCENTE (8 Etapas)
  // ===========================================================================
  {
    id: 'bioluminescent',
    name: 'Fase 2 · Bosque Abissal',
    subtitle: 'Cavernas do Micélio Luminoso',
    difficultyLabel: 'Dificuldade: Muito Alta',
    accent: '#4df0c0',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 15,
        name: 'Etapa 1 · Jardim de Esporos',
        subtitle: 'Mirella, a Botânica · Cachoeiras & Paredes de Resina',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 14, TileType.SOLID);
          p.rect(16, 20, 14, 6, TileType.WATER);
          p.cliff(30, 19, 10, TileType.SOLID);
          p.rect(40, 22, 8, 4, TileType.LIQUID_LETHAL);
          p.cliff(48, exits.rightRow, 10, TileType.SOLID);

          p.rect(14, 12, 2, 7, TileType.STICKY_RESIN);
          p.rect(22, 12, 6, 1, TileType.ONE_WAY);
          p.island(33, 13, 6, 2, TileType.SOLID);
          p.rect(42, 11, 2, 6, TileType.STICKY_RESIN);

          p.prop('crystal_cluster', 4, 19, 2);
          p.prop('shroom_giant', 35, 13, 6);
          p.prop('waterfall', 20, 2, 18);
          p.prop('hanging_vine', 29, 2, 6);
          p.prop('hanging_vine', 45, 2, 7);

          p.add('campfire', 5, 20);
          p.add('blessing_shrine', 35, 11);
          p.add('npc', 8, 20, { npcId: 'mirella' });
          p.add('bounce_shroom', 13, 20);
          p.add('bounce_shroom', 31, 18);
          p.add('astral_coin', 12, 13);
          p.add('astral_coin', 24, 10);
          p.add('astral_coin', 43, 9);
          p.add('stamina_orb', 18, 9);
          p.add('relic', 25, 10);
        },
      },
      {
        gx: 1,
        gy: 1,
        cols: 66,
        rows: 26,
        name: 'Etapa 2 · Lagoa Fluorescente',
        subtitle: 'Morteiros de Esporos sobre lagoas ácidas',
        pattern: 1,
      },
      {
        gx: 2,
        gy: 1,
        cols: 62,
        rows: 28,
        name: 'Etapa 3 · Gruta Sombria',
        subtitle: 'Acenda as tochas para abrir caminho nas trevas',
        dark: true,
        pattern: 2,
      },
      {
        gx: 3,
        gy: 1,
        cols: 64,
        rows: 28,
        name: 'Etapa 4 · Abismo das Raízes',
        subtitle: 'Bolhas e argolas de pêndulo sobre esporos letais',
        pattern: 3,
      },
      {
        gx: 3,
        gy: 0,
        cols: 46,
        rows: 36,
        name: 'Etapa 5 · Chaminé de Resina',
        subtitle: 'Escalada vertical com vigor regenerativo!',
        pattern: 4,
      },
      {
        gx: 2,
        gy: 0,
        cols: 62,
        rows: 26,
        name: 'Etapa 6 · Trilha Oculta do Micélio',
        subtitle: 'Passagem escura com Relíquia secreta',
        dark: true,
        pattern: 5,
      },
      {
        gx: 1,
        gy: 0,
        cols: 58,
        rows: 26,
        name: 'Etapa 7 · Câmara das Sementes',
        subtitle: 'Desvio opcional de maestria aérea',
        pattern: 1,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 9, TileType.SOLID);
          p.rect(11, 22, 34, 4, TileType.LIQUID_LETHAL);
          p.cliff(45, exits.rightRow, 11, TileType.SOLID);
          p.island(14, 16, 4, 1, TileType.CRUMBLE);
          p.rect(23, 12, 5, 1, TileType.ONE_WAY);
          p.island(33, 9, 6, 2, TileType.SOLID);
          p.prop('shroom_giant', 5, 15, 6);
          p.prop('hanging_vine', 26, 2, 6);
          p.add('bounce_shroom', 8, 20);
          p.add('bounce_shroom', 25, 11);
          p.add('stamina_orb', 19, 10);
          p.add('astral_coin', 16, 14);
          p.add('astral_coin', 35, 7);
          p.add('winged_relic', 36, 7);
        },
      },
      {
        gx: 4,
        gy: 0,
        cols: 62,
        rows: 26,
        name: 'Etapa 8 · Santuário Verdejante',
        subtitle: 'Pontes de resina e cachoeiras rumo ao trono do bosque',
        pattern: 0,
      },
      {
        gx: 5,
        gy: 0,
        cols: 64,
        rows: 26,
        rightRow: 18,
        name: 'Etapa 9 · Berço das Raízes',
        subtitle: 'Esporos flutuantes e cipós sobre lagos luminescentes',
        pattern: 3,
      },
      {
        gx: 6,
        gy: 0,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Trono do Micélio',
        subtitle: 'Derrote a Hidra de Esporos para purificar o Bosque Abissal!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.rect(14, 24, 10, 4, TileType.WATER);
          p.cliff(24, 21, 12, TileType.SOLID);
          p.rect(36, 24, 8, 4, TileType.WATER);
          p.cliff(44, 18, 14, TileType.SOLID);

          p.rect(13, 14, 7, 1, TileType.ONE_WAY);
          p.rect(25, 11, 10, 1, TileType.ONE_WAY);
          p.rect(39, 14, 7, 1, TileType.ONE_WAY);
          p.island(16, 18, 6, 1, TileType.ONE_WAY);
          p.island(37, 18, 6, 1, TileType.ONE_WAY);

          p.prop('shroom_giant', 8, 12, 6);
          p.prop('shroom_giant', 49, 12, 6);
          p.prop('waterfall', 19, 2, 22);
          p.prop('waterfall', 40, 2, 22);
          p.prop('hanging_vine', 27, 2, 6);
          p.prop('hanging_vine', 33, 2, 6);

          p.add('bounce_shroom', 11, 17);
          p.add('bounce_shroom', 46, 17);
          p.add('dash_crystal', 21, 12);
          p.add('dash_crystal', 38, 12);
          p.add('stamina_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 32, 9);
          p.add('relic', 29, 19);
          p.add('boss_mycelium', 32, 12);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 3: CIDADELA DE CRISTAL & GELO (8 Etapas)
  // ===========================================================================
  {
    id: 'frostglass',
    name: 'Fase 3 · Cidadela Safira',
    subtitle: 'Bastião de Cristal & Ventania',
    difficultyLabel: 'Dificuldade: Extrema',
    accent: '#7ce8ff',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 12,
        name: 'Etapa 1 · Santuário Boreal',
        subtitle: 'Orin, Relojoeiro · Ventos & Estalactites de Safira',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 16, TileType.ICE);
          p.spikes(18, 23, 12, 'up');
          p.cliff(30, 17, 9, TileType.ICE);
          p.spikes(39, 23, 9, 'up');
          p.cliff(48, exits.rightRow, 10, TileType.ICE);

          p.rect(18, 15, 7, 1, TileType.ICE);
          p.rect(39, 13, 6, 1, TileType.ONE_WAY);
          p.prop('stained_window', 10, 5, 7);
          p.prop('stained_window', 32, 4, 7);
          p.prop('crystal_spire', 24, 2, 6);
          p.prop('brazier', 6, 19, 2);
          p.prop('bird_perch', 41, 12, 1);

          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'orin' });
          p.add('torch', 19, 14);
          p.add('wind_up', 25, 7, { w: 28, h: 120 });
          p.add('astral_coin', 21, 13);
          p.add('astral_coin', 34, 15);
          p.add('astral_coin', 42, 10);
          p.add('boost_hoop', 27, 10);
          p.add('dash_crystal', 44, 9);
          p.add('relic', 34, 15);
        },
      },
      {
        gx: 1,
        gy: 1,
        cols: 66,
        rows: 26,
        name: 'Etapa 2 · Galeria da Ventania',
        subtitle: 'Correntes ascendentes e vidro frágil sobre o abismo',
        pattern: 2,
      },
      {
        gx: 2,
        gy: 1,
        cols: 46,
        rows: 34,
        name: 'Etapa 3 · Torre dos Pingentes',
        subtitle: 'Subida vertical sob estalactites e wisps árticos',
        pattern: 4,
      },
      {
        gx: 2,
        gy: 0,
        cols: 64,
        rows: 26,
        name: 'Etapa 4 · Varanda da Aurora',
        subtitle: 'Ventos contrários em plena travessia aérea',
        pattern: 1,
      },
      {
        gx: 1,
        gy: 0,
        cols: 62,
        rows: 26,
        name: 'Etapa 5 · Cofre Glacial',
        subtitle: 'Recupere a Chave Espectral para destravar o portão!',
        pattern: 3,
        build: (p, _b, exits) => {
          p.cliff(2, 20, 12, TileType.ICE);
          p.spikes(14, 23, 12, 'up');
          p.cliff(26, 17, 12, TileType.ICE);
          p.cliff(38, exits.rightRow, 22, TileType.ICE);
          p.rect(14, 15, 6, 1, TileType.ONE_WAY);
          p.island(29, 11, 6, 2, TileType.ICE);
          p.island(16, 7, 7, 2, TileType.SOLID);
          p.rect(10, 5, 2, 15, TileType.SOLID);
          p.prop('crystal_spire', 32, 4, 7);
          p.add('key', 18, 5);
          p.add('lock_door', 10, 15, { w: 8, h: 40 });
          p.add('relic', 5, 18);
          p.add('astral_coin', 31, 9);
          p.add('enemy_wisp', 23, 9, { patrolDist: 22 });
        },
      },
      {
        gx: 3,
        gy: 0,
        cols: 68,
        rows: 26,
        name: 'Etapa 6 · Ponte de Safira',
        subtitle: 'Cristal rosa de Dash Duplo no abismo sem fundo',
        pattern: 5,
      },
      {
        gx: 4,
        gy: 0,
        cols: 48,
        rows: 34,
        name: 'Etapa 7 · Espiral Cristalino',
        subtitle: 'Molas laterais e precisão extrema na descida',
        pattern: 4,
      },
      {
        gx: 4,
        gy: 1,
        cols: 62,
        rows: 26,
        name: 'Etapa 8 · Passarela Boreal',
        subtitle: 'Cristais fraturados sob o sopro gelado da cidadela',
        pattern: 2,
      },
      {
        gx: 5,
        gy: 1,
        cols: 64,
        rows: 26,
        rightRow: 18,
        name: 'Etapa 9 · Nave de Safira',
        subtitle: 'Correntes ascendentes para o confronto na cúpula',
        pattern: 5,
      },
      {
        gx: 6,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Pináculo do Serafim',
        subtitle: 'Derrote o Serafim Glacial para recuperar o Prisma de Safira!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 13, TileType.ICE);
          p.cliff(15, 22, 30, TileType.SOLID);
          p.cliff(45, 18, 13, TileType.ICE);

          p.rect(12, 13, 7, 1, TileType.ONE_WAY);
          p.rect(24, 10, 12, 1, TileType.ONE_WAY);
          p.rect(41, 13, 7, 1, TileType.ONE_WAY);
          p.rect(19, 17, 6, 1, TileType.ONE_WAY);
          p.rect(35, 17, 6, 1, TileType.ONE_WAY);

          p.prop('crystal_spire', 8, 11, 7);
          p.prop('crystal_spire', 50, 11, 7);
          p.prop('stained_window', 20, 4, 6);
          p.prop('stained_window', 38, 4, 6);
          p.prop('arch', 26, 3, 7);

          p.add('double_dash_crystal', 15, 11);
          p.add('double_dash_crystal', 44, 11);
          p.add('wind_up', 28, 12, { w: 32, h: 80 });
          p.add('shield_orb', 29, 8);
          p.add('astral_coin', 27, 8);
          p.add('astral_coin', 32, 8);
          p.add('relic', 29, 20);
          p.add('boss_glacier', 30, 8);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 4: FORJA SUBTERRÂNEA DE MAGMA (8 Etapas)
  // ===========================================================================
  {
    id: 'obsidian_forge',
    name: 'Fase 4 · Forja de Magma',
    subtitle: 'Fornalhas de Obsidiana Viva',
    difficultyLabel: 'Dificuldade: Implacável',
    accent: '#ff7733',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 15,
        name: 'Etapa 1 · Portão da Fornalha',
        subtitle: 'Ferro-IX · Rios de Lava e Esteiras de Escória',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 14, TileType.SOLID);
          p.rect(16, 22, 18, 4, TileType.LIQUID_LETHAL);
          p.cliff(34, 19, 10, TileType.SOLID);
          p.rect(44, 22, 5, 4, TileType.LIQUID_LETHAL);
          p.cliff(49, exits.rightRow, 9, TileType.SOLID);

          p.island(17, 16, 6, 2, TileType.MAGMA_CRUST);
          p.rect(26, 13, 7, 1, TileType.CONVEYOR_RIGHT);
          p.rect(38, 12, 6, 1, TileType.ONE_WAY);

          p.prop('chain', 10, 2, 8);
          p.prop('chain', 26, 2, 10);
          p.prop('anvil', 12, 19, 2);
          p.prop('brazier', 36, 17, 2);

          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'ferro' });
          p.add('speed_pad', 12, 20);
          p.add('bumper_orb', 24, 17);
          p.add('checkpoint_totem', 35, 17);
          p.add('shield_orb', 20, 13);
          p.add('treasure_chest', 41, 10);
          p.add('steam_geyser', 38, 18);
          p.add('boost_hoop', 24, 10);
          p.add('astral_coin', 19, 14);
          p.add('astral_coin', 29, 11);
          p.add('relic', 40, 10);
        },
      },
      {
        gx: 1,
        gy: 1,
        cols: 66,
        rows: 26,
        name: 'Etapa 2 · Esteiras de Escória',
        subtitle: 'Carregadores blindados e jatos de vapor',
        pattern: 1,
      },
      {
        gx: 2,
        gy: 1,
        cols: 64,
        rows: 28,
        name: 'Etapa 3 · Caldeira dos Golens',
        subtitle: 'Pise em Golens para rebotes acima do magma',
        pattern: 2,
      },
      {
        gx: 2,
        gy: 0,
        cols: 64,
        rows: 26,
        name: 'Etapa 4 · Ponte da Placa de Pressão',
        subtitle: 'Ative a placa na torre para materializar a ponte sobre a lava!',
        pattern: 3,
        build: (p, _b, exits) => {
          p.cliff(2, 20, 14, TileType.SOLID);
          p.rect(16, 22, 28, 4, TileType.LIQUID_LETHAL);
          p.cliff(44, exits.rightRow, 18, TileType.SOLID);
          p.island(6, 14, 7, 2, TileType.SOLID);
          p.prop('chain', 22, 2, 9);
          p.prop('chain', 36, 2, 9);
          p.prop('brazier', 48, exits.rightRow - 2, 2);
          p.add('pressure_plate', 8, 13);
          p.add('plate_bridge', 20, 16, { w: 96, h: 8 });
          p.add('dash_ring', 32, 10);
          p.add('astral_coin', 24, 14);
          p.add('astral_coin', 34, 14);
          p.add('relic', 32, 7);
        },
      },
      {
        gx: 3,
        gy: 0,
        cols: 68,
        rows: 26,
        name: 'Etapa 5 · Trilho Magnético',
        subtitle: 'Voe entre trilhos sobre lagos de obsidiana derretida',
        pattern: 4,
      },
      {
        gx: 4,
        gy: 0,
        cols: 48,
        rows: 34,
        name: 'Etapa 6 · Câmara das Serras',
        subtitle: 'Descida entre serras circulares e Pena de Éter',
        pattern: 5,
      },
      {
        gx: 4,
        gy: 1,
        cols: 66,
        rows: 26,
        name: 'Etapa 7 · Fundição Sentinela',
        subtitle: 'Use Dash Parry para devolver disparos de drones!',
        pattern: 2,
      },
      {
        gx: 5,
        gy: 1,
        cols: 64,
        rows: 26,
        name: 'Etapa 8 · Passarela da Escória',
        subtitle: 'Esteiras ferventes e trilhos sobre o mar de lava',
        pattern: 5,
      },
      {
        gx: 6,
        gy: 1,
        cols: 66,
        rows: 26,
        rightRow: 18,
        name: 'Etapa 9 · Fornalha dos Anciãos',
        subtitle: 'O calor ruge — atravessando o último fosso vulcânico',
        pattern: 3,
      },
      {
        gx: 7,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Caldeira do Rei Ígneo',
        subtitle: 'Derrote Ignis Rex para conquistar o Prisma Vulcânico!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 13, TileType.SOLID);
          p.cliff(15, 22, 30, TileType.MAGMA_CRUST);
          p.cliff(45, 18, 13, TileType.SOLID);

          p.rect(11, 14, 7, 1, TileType.ONE_WAY);
          p.rect(24, 11, 12, 1, TileType.ONE_WAY);
          p.rect(42, 14, 7, 1, TileType.ONE_WAY);
          p.rect(18, 17, 6, 1, TileType.ONE_WAY);
          p.rect(36, 17, 6, 1, TileType.ONE_WAY);

          p.prop('chain', 16, 2, 10);
          p.prop('chain', 42, 2, 10);
          p.prop('brazier', 11, 16, 2);
          p.prop('brazier', 47, 16, 2);
          p.prop('anvil', 29, 20, 2);

          p.add('dash_crystal', 15, 12);
          p.add('dash_crystal', 44, 12);
          p.add('boost_hoop', 29, 15);
          p.add('shield_orb', 29, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 32, 9);
          p.add('relic', 29, 19);
          p.add('boss_ignis_rex', 33, 12);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 5: OBSERVATÓRIO DO VAZIO ETÉREO (8 Etapas)
  // ===========================================================================
  {
    id: 'astral_void',
    name: 'Fase 5 · Observatório Astral',
    subtitle: 'Câmara dos Sonhos Partidos',
    difficultyLabel: 'Dificuldade: Pesadelo',
    accent: '#d580ff',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Limiar do Vazio',
        subtitle: 'Eco Sombrio · Mergulhe pelos Blocos de Sonho',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 24, 'up');
          p.cliff(41, exits.rightRow, 17, TileType.SOLID);
          p.rect(19, 12, 7, 5, TileType.DREAM_BLOCK);
          p.rect(29, 10, 7, 4, TileType.DREAM_BLOCK);
          p.rect(37, 15, 4, 1, TileType.ONE_WAY);
          p.prop('obelisk', 12, 13, 8);
          p.prop('stained_window', 24, 3, 6);
          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'echo' });
          p.add('double_dash_crystal', 15, 14);
          p.add('astral_coin', 27, 12);
          p.add('astral_coin', 39, 12);
          p.add('relic', 31, 7);
        },
      },
      {
        gx: 1,
        gy: 1,
        cols: 66,
        rows: 26,
        name: 'Etapa 2 · Sinfonia Rítmica',
        subtitle: 'Blocos Beat A/B no compasso cósmico sobre o abismo',
        pattern: 2,
      },
      {
        gx: 2,
        gy: 1,
        cols: 64,
        rows: 28,
        name: 'Etapa 3 · Galeria dos Portais',
        subtitle: 'Teleporte estelar preservando todo o momento',
        pattern: 3,
      },
      {
        gx: 2,
        gy: 0,
        cols: 46,
        rows: 34,
        name: 'Etapa 4 · Órbita Invertida',
        subtitle: 'Cristal de Gravidade e subida invertida',
        pattern: 4,
      },
      {
        gx: 1,
        gy: 0,
        cols: 62,
        rows: 26,
        name: 'Etapa 5 · Câmara dos Mímicos',
        subtitle: 'Atenção: nem toda relíquia flutuante é amiga!',
        pattern: 5,
      },
      {
        gx: 3,
        gy: 0,
        cols: 66,
        rows: 26,
        name: 'Etapa 6 · Prisma Temporal',
        subtitle: 'Desacelere projéteis e sentinelas no espaço',
        pattern: 1,
      },
      {
        gx: 4,
        gy: 0,
        cols: 48,
        rows: 34,
        name: 'Etapa 7 · Zona Sem Gravidade',
        subtitle: 'Descida astral em baixa gravidade nas trevas',
        dark: true,
        pattern: 2,
      },
      {
        gx: 4,
        gy: 1,
        cols: 64,
        rows: 26,
        name: 'Etapa 8 · Espelho do Infinito',
        subtitle: 'Blocos de Sonho suspensos entre constelações partidas',
        pattern: 3,
      },
      {
        gx: 5,
        gy: 1,
        cols: 66,
        rows: 26,
        rightRow: 18,
        name: 'Etapa 9 · Corredor das Estrelas',
        subtitle: 'Portais duplos e gravidade mutante antes do Oráculo',
        pattern: 5,
      },
      {
        gx: 6,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Cúpula do Oráculo',
        subtitle: 'Derrote o Oráculo Astral para reivindicar o Prisma do Vazio!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.cliff(14, 22, 32, TileType.SOLID);
          p.cliff(46, 18, 12, TileType.SOLID);

          p.rect(11, 14, 7, 1, TileType.ONE_WAY);
          p.rect(24, 10, 12, 1, TileType.ONE_WAY);
          p.rect(42, 14, 7, 1, TileType.ONE_WAY);
          p.rect(20, 17, 6, 2, TileType.DREAM_BLOCK);
          p.rect(34, 17, 6, 2, TileType.DREAM_BLOCK);

          p.prop('obelisk', 10, 10, 8);
          p.prop('obelisk', 48, 10, 8);
          p.prop('stained_window', 28, 3, 7);

          p.add('double_dash_crystal', 14, 11);
          p.add('double_dash_crystal', 45, 11);
          p.add('shield_orb', 29, 8);
          p.add('astral_coin', 27, 8);
          p.add('astral_coin', 32, 8);
          p.add('relic', 29, 20);
          p.add('boss_astral_oracle', 30, 8);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 6: SANTUÁRIO CARMESIM DAS PÉTALAS (10 Etapas)
  // ===========================================================================
  {
    id: 'crimson_sakura',
    name: 'Fase 6 · Santuário Carmesim',
    subtitle: 'Pagodes de Pétalas & Espelhos',
    difficultyLabel: 'Dificuldade: Severa',
    accent: '#ff70a6',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Portal do Torii Rubro',
        subtitle: 'Mestre Akane · Cerejeiras antigas sob lanternas de papel',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.rect(17, 22, 12, 4, TileType.WATER);
          p.cliff(29, 18, 9, TileType.SOLID);
          p.spikes(38, 23, 8, 'up');
          p.cliff(46, exits.rightRow, 12, TileType.SOLID);

          p.rect(19, 15, 7, 1, TileType.ONE_WAY);
          p.island(31, 12, 6, 2, TileType.SOLID);
          p.rect(40, 11, 5, 1, TileType.ONE_WAY);

          p.prop('torii_gate', 9, 14, 7);
          p.prop('sakura_tree', 2, 13, 8);
          p.prop('sakura_tree', 49, 6, 7);
          p.prop('paper_lantern', 21, 2, 5);
          p.prop('paper_lantern', 34, 2, 5);
          p.prop('wind_chime', 27, 2, 4);

          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'akane' });
          p.add('speed_pad', 13, 20);
          p.add('dash_crystal', 24, 12);
          p.add('boost_hoop', 42, 8);
          p.add('astral_coin', 22, 13);
          p.add('astral_coin', 33, 10);
          p.add('relic', 34, 10);
        },
      },
      { gx: 1, gy: 1, cols: 66, rows: 26, name: 'Etapa 2 · Jardim dos Bambus', subtitle: 'Pontes lacadas entre precipícios de pétalas', pattern: 1 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 3 · Pagode Escarlate', subtitle: 'Escalada vertical de cinco telhados curvos', pattern: 4 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 4 · Ponte das Lanternas', subtitle: 'Lanternas suspensas sobre o rio de reflexos', pattern: 2 },
      { gx: 1, gy: 0, cols: 62, rows: 26, name: 'Etapa 5 · Templo do Leque', subtitle: 'Espelhos antigos e ventos transversais', pattern: 3 },
      { gx: 3, gy: 0, cols: 68, rows: 26, name: 'Etapa 6 · Alamedas Rubras', subtitle: 'Salto duplo entre santuários flutuantes', pattern: 5 },
      { gx: 4, gy: 0, cols: 48, rows: 34, name: 'Etapa 7 · Campanário da Flor', subtitle: 'Sinos sagrados na torre do vento oeste', pattern: 4 },
      { gx: 4, gy: 1, cols: 64, rows: 26, name: 'Etapa 8 · Passarela da Bruma', subtitle: 'Lagoas escuras e pilares de madeira lacada', dark: true, pattern: 2 },
      { gx: 5, gy: 1, cols: 66, rows: 26, rightRow: 18, name: 'Etapa 9 · Pátio da Lâmina', subtitle: 'Última prova antes do duelo contra a Kensei', pattern: 5 },
      {
        gx: 6,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Arena da Cerejeira Eterna',
        subtitle: 'Derrote a Kensei das Pétalas para conquistar o Prisma Carmesim!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.cliff(14, 22, 32, TileType.SOLID);
          p.cliff(46, 18, 12, TileType.SOLID);

          p.rect(11, 14, 7, 1, TileType.ONE_WAY);
          p.rect(24, 10, 12, 1, TileType.ONE_WAY);
          p.rect(42, 14, 7, 1, TileType.ONE_WAY);
          p.rect(19, 17, 6, 1, TileType.ONE_WAY);
          p.rect(35, 17, 6, 1, TileType.ONE_WAY);

          p.prop('torii_gate', 26, 15, 7);
          p.prop('sakura_tree', 8, 10, 8);
          p.prop('sakura_tree', 48, 10, 8);
          p.prop('paper_lantern', 18, 2, 5);
          p.prop('paper_lantern', 41, 2, 5);

          p.add('double_dash_crystal', 14, 11);
          p.add('double_dash_crystal', 45, 11);
          p.add('shield_orb', 29, 8);
          p.add('astral_coin', 27, 8);
          p.add('astral_coin', 32, 8);
          p.add('relic', 29, 20);
          p.add('boss_sakura', 32, 12);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 7: CATEDRAL SUBMERSA DOS CORAIS (10 Etapas)
  // ===========================================================================
  {
    id: 'sunken_cathedral',
    name: 'Fase 7 · Catedral Submersa',
    subtitle: 'Nave Abissal de Corais',
    difficultyLabel: 'Dificuldade: Extrema',
    accent: '#4de1ff',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Átrio dos Corais',
        subtitle: 'Nereida · Vitrais submersos e grandes algas luminosas',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 14, TileType.SOLID);
          p.rect(16, 20, 16, 6, TileType.WATER);
          p.cliff(32, 19, 8, TileType.SOLID);
          p.rect(40, 21, 7, 5, TileType.WATER);
          p.cliff(47, exits.rightRow, 11, TileType.SOLID);

          p.island(18, 15, 6, 2, TileType.SOLID);
          p.rect(26, 12, 6, 1, TileType.ONE_WAY);
          p.rect(40, 13, 6, 1, TileType.ONE_WAY);

          p.prop('rose_window', 24, 4, 7);
          p.prop('coral_fan', 12, 18, 3);
          p.prop('coral_fan', 35, 16, 3);
          p.prop('kelp_strand', 21, 15, 7);
          p.prop('sunken_anchor', 42, 2, 8);

          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'nereida' });
          p.add('bounce_shroom', 14, 20);
          p.add('dash_crystal', 28, 10);
          p.add('astral_coin', 20, 13);
          p.add('astral_coin', 42, 11);
          p.add('relic', 35, 17);
        },
      },
      { gx: 1, gy: 1, cols: 66, rows: 26, name: 'Etapa 2 · Claustro das Marés', subtitle: 'Piscinas profundas entre arcos góticos de coral', pattern: 2 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 3 · Torre do Sino Afundado', subtitle: 'Ascensão entre âncoras e correntes marinhas', pattern: 4 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 4 · Nave das Rosáceas', subtitle: 'Luz solar filtrada através de gigantes vitrais antigos', pattern: 1 },
      { gx: 1, gy: 0, cols: 62, rows: 26, name: 'Etapa 5 · Cripta das Pérolas', subtitle: 'Cofres abissais sob vigilância de espectros', dark: true, pattern: 3 },
      { gx: 3, gy: 0, cols: 68, rows: 26, name: 'Etapa 6 · Galeria das Anêmonas', subtitle: 'Plataformas estreitas sobre trincheiras de água viva', pattern: 5 },
      { gx: 4, gy: 0, cols: 48, rows: 34, name: 'Etapa 7 · Abismo das Bolhas', subtitle: 'Descida espiralada sob olhos sentinelas', pattern: 4 },
      { gx: 4, gy: 1, cols: 64, rows: 26, name: 'Etapa 8 · Altar dos Náufragos', subtitle: 'Navios partidos e estátuas tomadas por algas', pattern: 3 },
      { gx: 5, gy: 1, cols: 66, rows: 26, rightRow: 18, name: 'Etapa 9 · Limiar do Leviatã', subtitle: 'A água estremece — o guardião das profundezas desperta', pattern: 5 },
      {
        gx: 6,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Cúpula do Leviatã',
        subtitle: 'Derrote o Leviatã Abissal para erguer o Prisma das Marés!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.rect(14, 23, 8, 5, TileType.WATER);
          p.cliff(22, 21, 16, TileType.SOLID);
          p.rect(38, 23, 8, 5, TileType.WATER);
          p.cliff(46, 18, 12, TileType.SOLID);

          p.rect(12, 13, 7, 1, TileType.ONE_WAY);
          p.rect(24, 10, 12, 1, TileType.ONE_WAY);
          p.rect(41, 13, 7, 1, TileType.ONE_WAY);
          p.rect(16, 17, 6, 1, TileType.ONE_WAY);
          p.rect(38, 17, 6, 1, TileType.ONE_WAY);

          p.prop('rose_window', 26, 3, 7);
          p.prop('sunken_anchor', 16, 2, 9);
          p.prop('sunken_anchor', 42, 2, 9);
          p.prop('coral_fan', 9, 15, 3);
          p.prop('coral_fan', 48, 15, 3);

          p.add('double_dash_crystal', 15, 11);
          p.add('double_dash_crystal', 44, 11);
          p.add('shield_orb', 29, 8);
          p.add('astral_coin', 27, 8);
          p.add('astral_coin', 32, 8);
          p.add('relic', 29, 19);
          p.add('boss_leviathan', 30, 8);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 8: TORRE DO RELÓGIO & ENGRENAGENS (10 Etapas)
  // ===========================================================================
  {
    id: 'clockwork_spire',
    name: 'Fase 8 · Torre do Relógio',
    subtitle: 'Engrenagens do Grande Pêndulo',
    difficultyLabel: 'Dificuldade: Implacável',
    accent: '#ffb84d',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Mecanismo de Entrada',
        subtitle: 'Corvus · Engrenagens douradas, pêndulos e esteiras de bronze',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 24, 'up');
          p.cliff(41, exits.rightRow, 17, TileType.SOLID);

          p.rect(18, 17, 8, 1, TileType.CONVEYOR_RIGHT);
          p.island(29, 14, 7, 2, TileType.SOLID);
          p.rect(38, 11, 6, 1, TileType.ONE_WAY);

          p.prop('clock_gear', 12, 5, 6);
          p.prop('clock_gear', 45, 4, 6);
          p.prop('pendulum', 25, 2, 9);
          p.prop('rose_window', 31, 4, 6);

          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'corvus' });
          p.add('speed_pad', 13, 20);
          p.add('dash_crystal', 27, 12);
          p.add('bumper_orb', 38, 15);
          p.add('astral_coin', 22, 15);
          p.add('astral_coin', 32, 12);
          p.add('relic', 40, 9);
        },
      },
      { gx: 1, gy: 1, cols: 66, rows: 26, name: 'Etapa 2 · Esteiras do Compasso', subtitle: 'Correias velozes e jatos de pressão constante', pattern: 1 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 3 · Eixo dos Pêndulos', subtitle: 'Subida vertical ao redor de pêndulos de bronze', pattern: 4 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 4 · Oficina de Latão', subtitle: 'Drones sentinelas entre roldanas incandescentes', pattern: 3 },
      { gx: 1, gy: 0, cols: 62, rows: 26, name: 'Etapa 5 · Cofre do Turbilhão', subtitle: 'Prisma Temporal e travessia por serras cronométricas', pattern: 5 },
      { gx: 3, gy: 0, cols: 68, rows: 26, name: 'Etapa 6 · Ponte do Meio-Dia', subtitle: 'Esteiras opostas sobre fosso mecânico', pattern: 2 },
      { gx: 4, gy: 0, cols: 48, rows: 34, name: 'Etapa 7 · Câmara das Molas', subtitle: 'Descida rápida usando molas e dash rings', pattern: 4 },
      { gx: 4, gy: 1, cols: 64, rows: 26, name: 'Etapa 8 · Escapamento Sombrio', subtitle: 'Engrenagens na penumbra iluminadas por faíscas', dark: true, pattern: 1 },
      { gx: 5, gy: 1, cols: 66, rows: 26, rightRow: 18, name: 'Etapa 9 · Salão dos Ponteiros', subtitle: 'Os ponteiros se alinham para o guardião do tempo', pattern: 5 },
      {
        gx: 6,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Mostrador de Chronos',
        subtitle: 'Derrote Chronos Prime para conquistar o Prisma do Tempo!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.cliff(14, 22, 32, TileType.SOLID);
          p.cliff(46, 18, 12, TileType.SOLID);

          p.rect(11, 14, 7, 1, TileType.ONE_WAY);
          p.rect(24, 10, 12, 1, TileType.CONVEYOR_RIGHT);
          p.rect(42, 14, 7, 1, TileType.ONE_WAY);
          p.rect(18, 17, 7, 1, TileType.ONE_WAY);
          p.rect(35, 17, 7, 1, TileType.ONE_WAY);

          p.prop('clock_gear', 14, 4, 6);
          p.prop('clock_gear', 42, 4, 6);
          p.prop('pendulum', 29, 2, 10);
          p.prop('rose_window', 27, 4, 6);

          p.add('double_dash_crystal', 14, 11);
          p.add('double_dash_crystal', 45, 11);
          p.add('shield_orb', 29, 8);
          p.add('astral_coin', 27, 8);
          p.add('astral_coin', 32, 8);
          p.add('relic', 29, 20);
          p.add('boss_chronos', 30, 8);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 9: JARDINS CELESTES DE ESMERALDA (10 Etapas)
  // ===========================================================================
  {
    id: 'emerald_sky',
    name: 'Fase 9 · Jardins Celestes',
    subtitle: 'Arquipélago dos Ventos Dourados',
    difficultyLabel: 'Dificuldade: Pesadelo',
    accent: '#57f2a8',
    stages: [
      {
        gx: 0,
        gy: 1,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Terraço da Aurora Verde',
        subtitle: 'Aelia · Ilhas flutuantes, relógios solares e cachoeiras aéreas',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 14, TileType.SOLID);
          p.spikes(16, 23, 26, 'up');
          p.cliff(42, exits.rightRow, 16, TileType.SOLID);

          p.island(18, 15, 7, 2, TileType.SOLID);
          p.island(29, 12, 7, 2, TileType.SOLID);
          p.rect(38, 10, 5, 1, TileType.ONE_WAY);

          p.prop('sun_dial', 11, 15, 6);
          p.prop('floating_island', 22, 4, 4);
          p.prop('floating_island', 44, 4, 4);
          p.prop('wind_chime', 33, 2, 4);
          p.prop('waterfall', 20, 7, 14);

          p.add('campfire', 5, 20);
          p.add('npc', 8, 20, { npcId: 'aelia' });
          p.add('wind_up', 25, 6, { w: 28, h: 120 });
          p.add('boost_hoop', 35, 9);
          p.add('dash_crystal', 40, 12);
          p.add('astral_coin', 21, 13);
          p.add('astral_coin', 32, 10);
          p.add('relic', 40, 8);
        },
      },
      { gx: 1, gy: 1, cols: 66, rows: 26, name: 'Etapa 2 · Pontes de Mármore', subtitle: 'Arquipélago suspenso por ventos ascendentes', pattern: 2 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 3 · Obelisco dos Sinos', subtitle: 'Escalada aérea entre sinos dourados e cristais', pattern: 4 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 4 · Cachoeira do Céu', subtitle: 'Cascatas infinitas vertendo para o mar de nuvens', pattern: 1 },
      { gx: 1, gy: 0, cols: 62, rows: 26, name: 'Etapa 5 · Relógio Solar Sagrado', subtitle: 'Blocos rítmicos sob o brilho esmeralda', pattern: 5 },
      { gx: 3, gy: 0, cols: 68, rows: 26, name: 'Etapa 6 · Varanda dos Serafins', subtitle: 'Dash duplo e anéis de impulso sobre o vazio celeste', pattern: 3 },
      { gx: 4, gy: 0, cols: 48, rows: 34, name: 'Etapa 7 · Pináculo Verdejante', subtitle: 'Ventos cruzados em alta altitude', pattern: 4 },
      { gx: 4, gy: 1, cols: 64, rows: 26, name: 'Etapa 8 · Santuário dos Ecos Verdes', subtitle: 'Últimas ilhas flutuantes antes do Trono Dourado', pattern: 2 },
      { gx: 5, gy: 1, cols: 66, rows: 26, rightRow: 18, name: 'Etapa 9 · Passagem do Sol', subtitle: 'O Rei Serafim aguarda no centro da coroa celeste', pattern: 5 },
      {
        gx: 6,
        gy: 1,
        cols: 60,
        rows: 28,
        spawnCol: 4,
        spawnRow: 17,
        leftRow: 18,
        name: 'Etapa 10 · Trono do Rei Serafim',
        subtitle: 'Derrote o Rei Serafim Solar para conquistar o Prisma Esmeralda!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 12, TileType.SOLID);
          p.cliff(14, 22, 32, TileType.SOLID);
          p.cliff(46, 18, 12, TileType.SOLID);

          p.rect(11, 13, 7, 1, TileType.ONE_WAY);
          p.rect(24, 10, 12, 1, TileType.ONE_WAY);
          p.rect(42, 13, 7, 1, TileType.ONE_WAY);
          p.rect(18, 17, 6, 1, TileType.ONE_WAY);
          p.rect(36, 17, 6, 1, TileType.ONE_WAY);

          p.prop('sun_dial', 29, 16, 6);
          p.prop('floating_island', 11, 4, 4);
          p.prop('floating_island', 45, 4, 4);
          p.prop('rose_window', 27, 3, 7);

          p.add('double_dash_crystal', 14, 11);
          p.add('double_dash_crystal', 45, 11);
          p.add('wind_up', 28, 12, { w: 32, h: 80 });
          p.add('shield_orb', 29, 8);
          p.add('astral_coin', 27, 8);
          p.add('astral_coin', 32, 8);
          p.add('relic', 29, 20);
          p.add('boss_seraph_king', 30, 8);
          p.add('chapter_goal', 52, 16);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 10: MIRAGEM SOLAR (10 Etapas · Areia Dourada, Prismas & Esfinge de Ônix)
  // ===========================================================================
  {
    id: 'solar_mirage',
    name: 'Fase 10 · Miragem Solar',
    subtitle: 'Pirâmides de Ônix & Areia Estelar',
    difficultyLabel: 'Dificuldade: Muito Alta',
    accent: '#fbbf24',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 15,
        name: 'Etapa 1 · Portão das Dunas',
        subtitle: 'Zafir revela os Prismas Divisores e Nuvens do Oásis',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 18, 'up');
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.rect(20, 17, 4, 1, TileType.CLOUD_BOUNCE);
          p.island(27, 14, 6, 2, TileType.SOLID);
          p.prop('pyramid_obelisk', 44, 6, 9);
          p.prop('sun_brazier', 11, 18, 3);
          p.prop('sun_brazier', 40, exits.rightRow - 3, 3);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'zafir' });
          p.add('prism_splitter', 30, 11);
          p.add('astral_coin', 21, 14);
          p.add('astral_coin', 30, 9);
          p.add('relic', 22, 10);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Vale dos Obeliscos', subtitle: 'Salte entre nuvens douradas e espectros de areia', pattern: 1 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Câmara dos Prismas', subtitle: 'Feixes solares e plataformas fragmentadas', pattern: 3 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Pirâmide Escalonada', subtitle: 'Ascensão vertical sob o calor do meio-dia', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Relicário do Sol', subtitle: 'Santuário oculto protegido por espectros', pattern: 2 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Oásis Suspenso', subtitle: 'Altar de Bênçãos entre palácios flutuantes', pattern: 5 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Passarela de Ônix', subtitle: 'Nuvens de impulso encadeadas sobre abismos', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Salão do Faraó', subtitle: 'Armadilhas solares e guardiões errantes', pattern: 1 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Avenida das Esfinges', subtitle: 'Última travessia rumo à Câmara da Esfinge de Ônix', pattern: 2 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Trono da Esfinge',
        subtitle: 'Enfrente a Esfinge de Ônix em 3 fases implacáveis!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(16, 15, 6, 1, TileType.CLOUD_BOUNCE);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(40, 15, 6, 1, TileType.CLOUD_BOUNCE);
          p.prop('pyramid_obelisk', 18, 12, 9);
          p.prop('pyramid_obelisk', 42, 12, 9);
          p.prop('sun_dial', 29, 15, 6);
          p.add('double_dash_crystal', 18, 13);
          p.add('double_dash_crystal', 43, 13);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 33, 9);
          p.add('relic', 30, 19);
          p.add('boss_sphinx', 31, 8);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 11: CRIPTA AMETISTA (10 Etapas · Vórtices, Orbes de Estase & Arquilich)
  // ===========================================================================
  {
    id: 'amethyst_crypt',
    name: 'Fase 11 · Cripta Ametista',
    subtitle: 'Necrópole dos Ecos Rúnicos',
    difficultyLabel: 'Dificuldade: Muito Alta',
    accent: '#c084fc',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Átrio dos Ossos',
        subtitle: 'Morwen ensina o segredo dos Orbes de Estase Temporal',
        isStart: true,
        dark: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 16, TileType.SOLID);
          p.spikes(18, 23, 16, 'up');
          p.cliff(34, exits.rightRow, 26, TileType.SOLID);
          p.rect(20, 16, 6, 1, TileType.ONE_WAY);
          p.island(27, 13, 5, 2, TileType.DREAM_BLOCK);
          p.prop('crystal_chandelier', 24, 2, 5);
          p.prop('soul_urn', 10, 18, 3);
          p.prop('soul_urn', 40, exits.rightRow - 3, 3);
          p.add('campfire', 5, 20);
          p.add('npc', 13, 20, { npcId: 'morwen' });
          p.add('stasis_orb', 23, 14);
          p.add('gravity_vortex', 30, 10);
          p.add('torch', 19, 14);
          p.add('astral_coin', 22, 12);
          p.add('relic', 29, 9);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Galeria das Urnas', subtitle: 'Cavaleiros Ósseos bloqueiam Investidas frontais', pattern: 1, dark: true },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Nave dos Vórtices', subtitle: 'Deixe os Vórtices puxarem e lançarem seu voo', pattern: 2 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Poço das Almas', subtitle: 'Escalada vertical sob candelabros violetas', pattern: 4, dark: true },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Capela Congelada', subtitle: 'Use Orbes de Estase para desacelerar guardiões', pattern: 5 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Ossuário Real', subtitle: 'Corredores rúnicos com relíquias secretas', pattern: 0 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Câmara de Quartzo', subtitle: 'Blocos de Sonho cruzam colunas espectrais', pattern: 3 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Catacumba Profunda', subtitle: 'Vórtices e plataformas efêmeras sobre o abismo', pattern: 1, dark: true },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Ponte do Necromante', subtitle: 'Última vigília antes do Arquilich Ametista', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Altar do Arquilich',
        subtitle: 'Vença o Arquilich Ametista e purifique a Necrópole!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.ONE_WAY);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.ONE_WAY);
          p.prop('crystal_chandelier', 20, 2, 5);
          p.prop('crystal_chandelier', 40, 2, 5);
          p.prop('rose_window', 28, 3, 7);
          p.add('stasis_orb', 17, 13);
          p.add('stasis_orb', 44, 13);
          p.add('double_dash_crystal', 31, 16);
          p.add('shield_orb', 31, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 35, 9);
          p.add('relic', 30, 19);
          p.add('boss_lich', 31, 8);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 12: LABORATÓRIOS ALQUÍMICOS (10 Etapas · Plasma, Bobinas Tesla & Autômato)
  // ===========================================================================
  {
    id: 'alchemical_labs',
    name: 'Fase 12 · Laboratórios Alquímicos',
    subtitle: 'Caldeirões de Plasma & Bobinas Tesla',
    difficultyLabel: 'Dificuldade: Extrema',
    accent: '#2dd4bf',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Ala dos Reatores',
        subtitle: 'Dra. Vera alerta sobre os Alquimistas e fossos de ácido',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.rect(17, 23, 18, 2, TileType.LIQUID_LETHAL);
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.rect(19, 17, 5, 1, TileType.CONVEYOR_RIGHT);
          p.island(27, 14, 6, 2, TileType.SOLID);
          p.prop('alchemy_vat', 10, 16, 5);
          p.prop('tesla_coil', 42, exits.rightRow - 6, 6);
          p.add('campfire', 5, 20);
          p.add('npc', 13, 20, { npcId: 'alch_vera' });
          p.add('prism_splitter', 29, 11);
          p.add('speed_pad', 20, 16);
          p.add('astral_coin', 22, 13);
          p.add('relic', 29, 12);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Destilaria Ácida', subtitle: 'Esteiras rápidas acima de tanques tóxicos', pattern: 3 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Câmara Tesla', subtitle: 'Zonas elétricas sincronizadas com prismas', pattern: 1 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Torre de Refino', subtitle: 'Ascensão por tubulações de vapor e ácido', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Cofre de Mercúrio', subtitle: 'Alquimistas guardam uma relíquia rara', pattern: 2 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Fornalha Plasma', subtitle: 'Altar de Bênçãos e vórtices energizados', pattern: 5 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Linha de Montagem', subtitle: 'Serras e orbes espelho em movimento constante', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Núcleo Crítico', subtitle: 'Atravesse o laboratório em alerta máximo', pattern: 3 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Passadiço do Colosso', subtitle: 'A sala do Autômato Alquímico aguarda além', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Reator Central',
        subtitle: 'Sobrecarregue e derrote o Autômato Alquímico!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.CONVEYOR_RIGHT);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.CONVEYOR_LEFT);
          p.prop('alchemy_vat', 16, 16, 5);
          p.prop('alchemy_vat', 43, 16, 5);
          p.prop('tesla_coil', 29, 15, 6);
          p.add('double_dash_crystal', 17, 13);
          p.add('double_dash_crystal', 44, 13);
          p.add('prism_splitter', 22, 10);
          p.add('shield_orb', 31, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_automaton', 31, 13);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 13: ZÊNITE DA AURORA (10 Etapas · Nuvens de Impulso, Valquírias & Boreal)
  // ===========================================================================
  {
    id: 'aurora_zenith',
    name: 'Fase 13 · Zênite da Aurora',
    subtitle: 'Véus Boreais & Nuvens Cristalinas',
    difficultyLabel: 'Dificuldade: Extrema',
    accent: '#67e8f9',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Mirante Boreal',
        subtitle: 'Freya apresenta as Nuvens de Impulso e o Véu da Aurora',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 18, 'up');
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.rect(19, 18, 5, 1, TileType.CLOUD_BOUNCE);
          p.rect(27, 14, 5, 1, TileType.CLOUD_BOUNCE);
          p.prop('frost_arch', 10, 14, 7);
          p.prop('aurora_prism', 44, exits.rightRow - 8, 8);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'freya' });
          p.add('stasis_orb', 29, 11);
          p.add('astral_coin', 21, 14);
          p.add('astral_coin', 29, 9);
          p.add('relic', 22, 10);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Ponte das Nuvens', subtitle: 'Encadeie quiques em nuvens sem tocar o solo', pattern: 1 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Arco Glacial', subtitle: 'Valquírias Boriais patrulham os céus iluminados', pattern: 2 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Espiral da Aurora', subtitle: 'Ascensão vertical usando nuvens e vórtices', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Relicário Prismático', subtitle: 'Orbes Espelho disparam em múltiplas direções', pattern: 5 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Santuário Celeste', subtitle: 'Altar de Bênçãos sob véus esmeralda e violeta', pattern: 0 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Véu dos Cometas', subtitle: 'Pisos congelados combinados com Anéis de Dash', pattern: 3 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Trilha das Valquírias', subtitle: 'Duelo aéreo sobre nuvens cristalinas', pattern: 1 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Limiar do Zênite', subtitle: 'O trono da Valquíria Boreal cintila à frente', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Arena da Aurora',
        subtitle: 'Derrote a Valquíria Boreal e abra o caminho para o Pináculo Final!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(15, 16, 6, 1, TileType.CLOUD_BOUNCE);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(40, 16, 6, 1, TileType.CLOUD_BOUNCE);
          p.prop('aurora_prism', 18, 13, 8);
          p.prop('aurora_prism', 42, 13, 8);
          p.prop('frost_arch', 28, 14, 7);
          p.add('double_dash_crystal', 18, 14);
          p.add('double_dash_crystal', 43, 14);
          p.add('stasis_orb', 31, 16);
          p.add('shield_orb', 31, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_valkyrie', 31, 8);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 14: CÂNION ESCARLATE (10 Etapas · Ganchos Aéreos & Colosso do Cânion)
  // ===========================================================================
  {
    id: 'crimson_canyon',
    name: 'Fase 14 · Cânion Escarlate',
    subtitle: 'Desfiladeiros Rubros & Totens',
    difficultyLabel: 'Dificuldade: Implacável',
    accent: '#fb7185',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Desfiladeiro Vermelho',
        subtitle: 'Mestre Kuroda apresenta as Âncoras de Gancho Aéreo [C]',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 18, 'up');
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.island(22, 16, 6, 2, TileType.SOLID);
          p.prop('canyon_totem', 11, 13, 8);
          p.prop('canyon_totem', 44, exits.rightRow - 8, 8);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'kuroda' });
          p.add('grapple_anchor', 25, 10);
          p.add('grapple_anchor', 32, 9);
          p.add('rift_trial', 38, exits.rightRow - 2);
          p.add('astral_coin', 24, 13);
          p.add('relic', 28, 7);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Ponte dos Totens', subtitle: 'Balance entre cânions usando ganchos suspensos', pattern: 1 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Falésia do Eco', subtitle: 'Geysers quentes e rochas instáveis sobre o abismo', pattern: 3 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Chaminé de Basalto', subtitle: 'Escalada vertical entre plataformas de lava', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Fenda Escarlate', subtitle: 'Desafio de velocidade por 5 anéis aéreos', pattern: 2 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Santuário dos Bravos', subtitle: 'Altar de Bênçãos esculpido na rocha rubra', pattern: 5 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Precipício Ventoso', subtitle: 'Ventos laterais e investidas aéreas precisas', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Cidadela de Arenito', subtitle: 'Guardiões de fogo e lâminas giratórias', pattern: 1 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Limiar do Colosso', subtitle: 'A terra treme diante da Arena do Colosso do Cânion', pattern: 2 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Arena do Colosso',
        subtitle: 'Persiga e derrote o Colosso do Cânion!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.ONE_WAY);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.ONE_WAY);
          p.prop('canyon_totem', 18, 13, 8);
          p.prop('canyon_totem', 42, 13, 8);
          p.add('grapple_anchor', 22, 10);
          p.add('grapple_anchor', 39, 10);
          p.add('double_dash_crystal', 16, 13);
          p.add('double_dash_crystal', 45, 13);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_canyon_colossus', 31, 12);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 15: SUBMUNDO NEON (10 Etapas · Fendas Astrais & Arconte Neon-IX)
  // ===========================================================================
  {
    id: 'cyber_undercity',
    name: 'Fase 15 · Submundo Neon',
    subtitle: 'Metrópole Subterrânea de Dados',
    difficultyLabel: 'Dificuldade: Extrema',
    accent: '#22d3ee',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Setor Ciber-01',
        subtitle: 'Zed-9 ensina Troca em Dupla [F] e Portais de Fenda',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 18, 'up');
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.rect(19, 17, 6, 1, TileType.CONVEYOR_RIGHT);
          p.island(27, 14, 6, 2, TileType.DREAM_BLOCK);
          p.prop('holo_pylon', 11, 13, 8);
          p.prop('holo_pylon', 43, exits.rightRow - 8, 8);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'zed9' });
          p.add('grapple_anchor', 25, 9);
          p.add('rift_trial', 39, exits.rightRow - 2);
          p.add('speed_pad', 14, 20);
          p.add('astral_coin', 22, 13);
          p.add('relic', 29, 10);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Autoestrada de Plasma', subtitle: 'Esteiras turbo sob anúncios holográficos', pattern: 1 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Dutos de Resfriamento', subtitle: 'Zonas de estase e olhos laser em patrulha', pattern: 3 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Servidor Central', subtitle: 'Ascensão vertical usando ganchos magnéticos', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Banco de Dados Perdido', subtitle: 'Muros de sonho ocultam relíquias criptografadas', pattern: 5 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Mercado Clandestino', subtitle: 'Altar de Bênçãos e portais de fenda relâmpago', pattern: 2 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Matriz Binária', subtitle: 'Blocos rítmicos alternam em alta frequência', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Torre da Transmissão', subtitle: 'Drones e besouros elétricos defendem a antena', pattern: 3 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Firewall Imperial', subtitle: 'Última barreira antes do Arconte Neon-IX', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Núcleo do Arconte Neon',
        subtitle: 'Hackeie e vença o Arconte Neon-IX em 3 fases!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.CONVEYOR_RIGHT);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.CONVEYOR_LEFT);
          p.prop('holo_pylon', 17, 13, 8);
          p.prop('holo_pylon', 43, 13, 8);
          p.add('grapple_anchor', 21, 9);
          p.add('grapple_anchor', 40, 9);
          p.add('double_dash_crystal', 16, 13);
          p.add('double_dash_crystal', 45, 13);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_cyber_archon', 31, 8);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 16: PARTENON CELESTE (10 Etapas · Mármore & Colosso Olímpico)
  // ===========================================================================
  {
    id: 'celestial_marble',
    name: 'Fase 16 · Partenon Celeste',
    subtitle: 'Colunas de Mármore & Ouro',
    difficultyLabel: 'Dificuldade: Extrema',
    accent: '#fde68a',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Escadaria de Mármore',
        subtitle: 'Paladina Athena revela as Reações Elementais entre heróis',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 18, 'up');
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.rect(19, 17, 5, 1, TileType.CLOUD_BOUNCE);
          p.island(27, 13, 6, 2, TileType.SOLID);
          p.prop('marble_column', 11, 11, 10);
          p.prop('marble_column', 43, exits.rightRow - 10, 10);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'athena' });
          p.add('grapple_anchor', 24, 9);
          p.add('rift_trial', 40, exits.rightRow - 2);
          p.add('astral_coin', 21, 14);
          p.add('relic', 29, 10);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Pórtico Dourado', subtitle: 'Nuvens de impulso e colunas suspensas no céu', pattern: 2 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Galeria das Estátuas', subtitle: 'Prismas de luz dividem raios entre pilares', pattern: 1 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Campanário Olímpico', subtitle: 'Ascensão entre ventos ascendentes e anéis dourados', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Relicário de Atena', subtitle: 'Valquírias guardam uma relíquia ancestral', pattern: 3 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Ágora Flutuante', subtitle: 'Altar de Bênçãos no centro do arquipélago alvo', pattern: 5 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Passarela do Trovão', subtitle: 'Ganchos sobre precipícios iluminados por relâmpagos', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Pátio dos Campeões', subtitle: 'Ondas de inimigos guardam a entrada da cúpula', pattern: 1 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Acrópole Suprema', subtitle: 'O Colosso de Mármore ergue sua égide sagrada', pattern: 2 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Altar Olímpico',
        subtitle: 'Derrote o Colosso de Mármore em combate aéreo!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(15, 16, 6, 1, TileType.CLOUD_BOUNCE);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(40, 16, 6, 1, TileType.CLOUD_BOUNCE);
          p.prop('marble_column', 18, 11, 10);
          p.prop('marble_column', 42, 11, 10);
          p.add('grapple_anchor', 22, 9);
          p.add('grapple_anchor', 39, 9);
          p.add('double_dash_crystal', 16, 14);
          p.add('double_dash_crystal', 45, 14);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_marble_titan', 31, 12);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 17: PÂNTANO DE ÉBANO (10 Etapas · Salgueiros & Hidra de Ébano)
  // ===========================================================================
  {
    id: 'ebony_fen',
    name: 'Fase 17 · Pântano de Ébano',
    subtitle: 'Salgueiros & Bruma Alquímica',
    difficultyLabel: 'Dificuldade: Pesadelo',
    accent: '#34d399',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 14,
        name: 'Etapa 1 · Raízes Sombrias',
        subtitle: 'Bruxa Morgana abençoa seu Santuário de Runas [G]',
        isStart: true,
        dark: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.rect(17, 23, 18, 2, TileType.LIQUID_LETHAL);
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.island(21, 16, 6, 2, TileType.STICKY_RESIN);
          p.rect(29, 13, 5, 1, TileType.ONE_WAY);
          p.prop('willow_tree', 10, 12, 9);
          p.prop('willow_tree', 44, exits.rightRow - 9, 9);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'morgana' });
          p.add('bounce_shroom', 15, 20);
          p.add('grapple_anchor', 26, 9);
          p.add('torch', 23, 14);
          p.add('astral_coin', 24, 13);
          p.add('relic', 31, 10);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Lagoas Venenosas', subtitle: 'Cogumelos saltitantes sobre águas escuras', pattern: 1, dark: true },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Bosques dos Salgueiros', subtitle: 'Parede de resina e alquimistas ocultos', pattern: 2 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Árvore Anciã', subtitle: 'Escalada pelos troncos gigantes envoltos em cipós', pattern: 4, dark: true },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Fenda do Miasma', subtitle: 'Portal cronometrado sobre névoa densa', pattern: 3 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Cabana da Bruxa', subtitle: 'Fogueira segura e Altar de Bênçãos na floresta', pattern: 5 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Brejo dos Ecos', subtitle: 'Morteiros e fantasmas atacam da escuridão', pattern: 0, dark: true },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Santuário Submerso', subtitle: 'Corra por plataformas frágeis sobre o brejo ácido', pattern: 1 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Covil das Serpentes', subtitle: 'A Hidra de Ébano ergue suas três cabeças', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Covil da Hidra de Ébano',
        subtitle: 'Vença a Hidra de Ébano e purifique o pântano!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.ONE_WAY);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.ONE_WAY);
          p.prop('willow_tree', 15, 12, 9);
          p.prop('willow_tree', 43, 12, 9);
          p.add('bounce_shroom', 16, 20);
          p.add('bounce_shroom', 44, 20);
          p.add('grapple_anchor', 22, 9);
          p.add('grapple_anchor', 39, 9);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_fen_hydra', 31, 12);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 18: NEXO ORBITAL (10 Etapas · Gravidade Zero & Imperador Sideral)
  // ===========================================================================
  {
    id: 'orbital_nexus',
    name: 'Fase 18 · Nexo Orbital',
    subtitle: 'Estação Sideral Sem Gravidade',
    difficultyLabel: 'Dificuldade: Pesadelo',
    accent: '#a5b4fc',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Doca Espacial',
        subtitle: 'Comandante Astra libera os Vórtices e Gancho Magnético',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.spikes(17, 23, 18, 'up');
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.island(21, 16, 6, 2, TileType.DREAM_BLOCK);
          p.prop('star_satellite', 24, 3, 6);
          p.prop('star_satellite', 46, 3, 6);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'astra' });
          p.add('gravity_vortex', 27, 11);
          p.add('grapple_anchor', 20, 9);
          p.add('rift_trial', 40, exits.rightRow - 2);
          p.add('double_dash_crystal', 31, 12);
          p.add('astral_coin', 24, 13);
          p.add('relic', 28, 8);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Anel de Satélites', subtitle: 'Zonas antigravidade entre módulos da estação', pattern: 2 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Câmara de Fusão', subtitle: 'Portais duplos e cristais de velocidade orbital', pattern: 3 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Elevador Estelar', subtitle: 'Subida vertical em baixa gravidade pelo eixo central', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Observatório Quântico', subtitle: 'Espelhos arcanos disparam feixes simultâneos', pattern: 5 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Hangar das Estrelas', subtitle: 'Altar de Bênçãos e testes de fenda espacial', pattern: 1 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Corredor de Meteoros', subtitle: 'Salte entre plataformas efêmeras no vácuo', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Sentinela do Vácuo', subtitle: 'Duelo aéreo com dashes consecutivos', pattern: 3 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Ponte do Imperador', subtitle: 'Última plataforma antes da sala do Imperador Sideral', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Trono Orbital',
        subtitle: 'Enfrente o Imperador Sideral acima das estrelas!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.ONE_WAY);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.ONE_WAY);
          p.prop('star_satellite', 18, 3, 6);
          p.prop('star_satellite', 42, 3, 6);
          p.add('grapple_anchor', 22, 9);
          p.add('grapple_anchor', 39, 9);
          p.add('double_dash_crystal', 16, 13);
          p.add('double_dash_crystal', 45, 13);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_star_emperor', 31, 8);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 19: JARDIM DO CREPÚSCULO (10 Etapas · Lótus & Espectro Crepuscular)
  // ===========================================================================
  {
    id: 'twilight_garden',
    name: 'Fase 19 · Jardim do Crepúsculo',
    subtitle: 'Lótus Violetas do Ocaso Eterno',
    difficultyLabel: 'Dificuldade: Impossível',
    accent: '#e879f9',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Lago das Lótus',
        subtitle: 'Sylphie prepara os últimos heróis para a ascensão à Fase 20',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 15, TileType.SOLID);
          p.rect(17, 22, 18, 4, TileType.WATER);
          p.cliff(35, exits.rightRow, 25, TileType.SOLID);
          p.rect(20, 16, 6, 1, TileType.CLOUD_BOUNCE);
          p.island(28, 13, 5, 2, TileType.DREAM_BLOCK);
          p.prop('twilight_lotus', 11, 16, 5);
          p.prop('twilight_lotus', 44, exits.rightRow - 5, 5);
          p.add('campfire', 5, 20);
          p.add('npc', 12, 20, { npcId: 'sylphie' });
          p.add('grapple_anchor', 25, 9);
          p.add('rift_trial', 39, exits.rightRow - 2);
          p.add('double_dash_crystal', 30, 10);
          p.add('astral_coin', 22, 13);
          p.add('relic', 29, 9);
        },
      },
      { gx: 1, gy: 2, cols: 64, rows: 26, name: 'Etapa 2 · Ponte Crepuscular', subtitle: 'Nuvens violetas e ganchos sobre lagos espelhados', pattern: 1 },
      { gx: 2, gy: 2, cols: 62, rows: 26, name: 'Etapa 3 · Mirante das Estrelas', subtitle: 'Orbes de estase e prismas refletores', pattern: 3 },
      { gx: 2, gy: 1, cols: 48, rows: 34, name: 'Etapa 4 · Pagode do Ocaso', subtitle: 'Subida vertical sob lanternas e nuvens de salto', pattern: 4 },
      { gx: 1, gy: 1, cols: 58, rows: 26, name: 'Etapa 5 · Relicário Violeta', subtitle: 'Desafio de fenda e muros ilusórios', pattern: 5 },
      { gx: 2, gy: 0, cols: 64, rows: 26, name: 'Etapa 6 · Santuário da Noite', subtitle: 'Fogueira serena e Altar de Bênçãos antes do cume', pattern: 2 },
      { gx: 3, gy: 0, cols: 62, rows: 26, name: 'Etapa 7 · Alamedas Sombrias', subtitle: 'Fantasmas e cavaleiros ósseos guardam a passagem', pattern: 0 },
      { gx: 4, gy: 0, cols: 64, rows: 28, name: 'Etapa 8 · Jardins Suspensos', subtitle: 'Encadeie dash duplo, gancho e wallbounce', pattern: 1 },
      { gx: 5, gy: 0, cols: 64, rows: 26, rightRow: 17, name: 'Etapa 9 · Portão da Tempestade', subtitle: 'O Espectro do Crepúsculo sela o acesso ao Pináculo', pattern: 5 },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 26,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Cúpula do Crepúsculo',
        subtitle: 'Derrote o Espectro do Crepúsculo para liberar a Fase 20!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 21, 36, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);
          p.rect(14, 15, 7, 1, TileType.CLOUD_BOUNCE);
          p.rect(25, 11, 12, 1, TileType.ONE_WAY);
          p.rect(41, 15, 7, 1, TileType.CLOUD_BOUNCE);
          p.prop('twilight_lotus', 16, 16, 5);
          p.prop('twilight_lotus', 43, 16, 5);
          p.add('grapple_anchor', 22, 9);
          p.add('grapple_anchor', 39, 9);
          p.add('double_dash_crystal', 16, 13);
          p.add('double_dash_crystal', 45, 13);
          p.add('shield_orb', 30, 9);
          p.add('astral_coin', 27, 9);
          p.add('astral_coin', 34, 9);
          p.add('relic', 30, 19);
          p.add('boss_twilight_wraith', 31, 8);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },

  // ===========================================================================
  // FASE 20: PINÁCULO DA TEMPESTADE (10 Etapas + BOSS FINAL!)
  // ===========================================================================
  {
    id: 'stormcrown',
    name: 'Fase 20 · Pináculo Etéreo',
    subtitle: 'Trono do Soberano dos Ecos',
    difficultyLabel: 'Dificuldade: Impossível',
    accent: '#ffd27d',
    stages: [
      {
        gx: 0,
        gy: 2,
        cols: 60,
        rows: 26,
        spawnCol: 4,
        spawnRow: 20,
        rightRow: 13,
        name: 'Etapa 1 · Base da Tempestade',
        subtitle: 'Último acampamento antes da ascensão final',
        isStart: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, 21, 14, TileType.SOLID);
          p.spikes(16, 23, 24, 'up');
          p.cliff(40, exits.rightRow, 18, TileType.SOLID);
          p.rect(17, 16, 6, 1, TileType.ONE_WAY);
          p.island(27, 13, 7, 2, TileType.SOLID);
          p.prop('obelisk', 46, 5, 8);
          p.prop('stained_window', 22, 4, 6);
          p.add('campfire', 5, 20);
          p.add('double_dash_crystal', 24, 11);
          p.add('boost_hoop', 35, 10);
          p.add('astral_coin', 19, 14);
          p.add('astral_coin', 30, 11);
          p.add('relic', 30, 11);
        },
      },
      {
        gx: 1,
        gy: 2,
        cols: 68,
        rows: 26,
        name: 'Etapa 2 · Ponte dos Raios',
        subtitle: 'Relâmpagos periódicos e plataformas zip sobre o precipício',
        pattern: 3,
      },
      {
        gx: 2,
        gy: 2,
        cols: 64,
        rows: 28,
        name: 'Etapa 3 · Bastião dos Ecos',
        subtitle: 'Dream Blocks sincronizados entre serras estelares',
        pattern: 5,
      },
      {
        gx: 2,
        gy: 1,
        cols: 46,
        rows: 36,
        name: 'Etapa 4 · Escadaria do Trovão',
        subtitle: 'Subida vertical sob fogo cruzado!',
        pattern: 4,
      },
      {
        gx: 1,
        gy: 1,
        cols: 60,
        rows: 26,
        name: 'Etapa 5 · Relíquia do Relâmpago',
        subtitle: 'Santuário opcional de alta precisão',
        pattern: 1,
      },
      {
        gx: 2,
        gy: 0,
        cols: 58,
        rows: 26,
        name: 'Etapa 6 · Ante-Câmara Imperial',
        subtitle: 'Fogueira imperial e Altar de Bênçãos antes do Soberano',
        pattern: 2,
        build: (p, _b, exits) => {
          p.cliff(2, 20, 18, TileType.SOLID);
          p.spikes(20, 23, 14, 'up');
          p.cliff(34, exits.rightRow, 22, TileType.SOLID);
          p.rect(18, 14, 7, 1, TileType.ONE_WAY);
          p.rect(28, 12, 6, 1, TileType.ONE_WAY);
          p.prop('arch', 24, 4, 8);
          p.prop('statue', 11, 16, 4);
          p.prop('statue', 42, exits.rightRow - 4, 4);
          p.add('campfire', 8, 19);
          p.add('blessing_shrine', 14, 18);
          p.add('double_dash_crystal', 26, 9);
          p.add('astral_coin', 21, 12);
          p.add('relic', 30, 10);
        },
      },
      {
        gx: 3,
        gy: 0,
        cols: 64,
        rows: 30,
        name: 'Etapa 7 · Senda dos Wallbounces',
        subtitle: 'Desafie a gravidade e ventos intensos rumo à cúpula',
        pattern: 4,
      },
      {
        gx: 4,
        gy: 0,
        cols: 68,
        rows: 26,
        name: 'Etapa 8 · Limiar do Trono',
        subtitle: 'O Soberano dos Ecos aguarda na catedral acima!',
        pattern: 5,
      },
      {
        gx: 5,
        gy: 0,
        cols: 66,
        rows: 26,
        rightRow: 17,
        name: 'Etapa 9 · Ponte dos Soberanos',
        subtitle: 'Última travessia sob relâmpagos antes do Altar Imperial',
        pattern: 5,
      },
      {
        gx: 6,
        gy: 0,
        cols: 62,
        rows: 28,
        spawnCol: 4,
        spawnRow: 16,
        leftRow: 17,
        name: 'Etapa 10 · Altar do Soberano',
        subtitle: 'Derrote o Soberano dos Ecos e reivindique o Coração do Éter!',
        isGoal: true,
        pattern: 0,
        build: (p, _b, exits) => {
          p.cliff(2, exits.leftRow, 11, TileType.SOLID);
          p.cliff(13, 22, 10, TileType.SOLID);
          p.spikes(23, 24, 16, 'up');
          p.cliff(39, 22, 10, TileType.SOLID);
          p.cliff(49, 17, 11, TileType.SOLID);

          p.rect(9, 13, 7, 1, TileType.ONE_WAY);
          p.rect(45, 13, 7, 1, TileType.ONE_WAY);
          p.rect(24, 11, 14, 1, TileType.ONE_WAY);
          p.rect(25, 18, 12, 2, TileType.DREAM_BLOCK);
          p.island(4, 9, 5, 2, TileType.SOLID);
          p.island(53, 9, 5, 2, TileType.SOLID);

          p.prop('arch', 25, 3, 8);
          p.prop('stained_window', 13, 4, 6);
          p.prop('stained_window', 41, 4, 6);
          p.prop('banner', 6, 11, 4);
          p.prop('banner', 54, 11, 4);

          p.add('double_dash_crystal', 12, 11);
          p.add('double_dash_crystal', 48, 11);
          p.add('boost_hoop', 30, 15);
          p.add('shield_orb', 30, 9);
          p.add('heal_orb', 8, 11);
          p.add('elemental_totem', 16, 15);
          p.add('echo_mirror', 45, 11);
          p.add('laser_prism', 22, 11);
          p.add('laser_prism', 39, 11);
          p.add('boss_sovereign', 30, 7);
          p.add('chapter_goal', 53, 15);
        },
      },
    ],
  },
  ...getNew30ChapterConfigs(),
];

function pickBiomeEnemies(biome: BiomeId): [EntityKind, EntityKind, EntityKind] {
  const nwMeta = NEW_30_WORLD_MAP[biome];
  if (nwMeta) return nwMeta.enemyPair;
  switch (biome) {
    case 'silver_ash': return ['enemy_crawler', 'enemy_wisp', 'enemy_spark_beetle'];
    case 'bioluminescent': return ['enemy_mortar', 'enemy_slime_king', 'enemy_crawler'];
    case 'frostglass': return ['enemy_laser_eye', 'enemy_wisp', 'enemy_frost_valkyrie'];
    case 'obsidian_forge': return ['enemy_charger', 'enemy_drone', 'enemy_magma_wyrm'];
    case 'astral_void': return ['enemy_phantom', 'enemy_laser_eye', 'enemy_mimic'];
    case 'crimson_sakura': return ['enemy_phantom', 'enemy_wisp', 'enemy_crawler'];
    case 'sunken_cathedral': return ['enemy_slime_king', 'enemy_mortar', 'enemy_wisp'];
    case 'clockwork_spire': return ['enemy_drone', 'enemy_spark_beetle', 'enemy_charger'];
    case 'emerald_sky': return ['enemy_laser_eye', 'enemy_phantom', 'enemy_wisp'];
    case 'solar_mirage': return ['enemy_sand_wraith', 'enemy_mirror_orb', 'enemy_charger'];
    case 'amethyst_crypt': return ['enemy_bone_knight', 'enemy_phantom', 'enemy_wisp'];
    case 'alchemical_labs': return ['enemy_alchemist', 'enemy_mirror_orb', 'enemy_drone'];
    case 'aurora_zenith': return ['enemy_frost_valkyrie', 'enemy_mirror_orb', 'enemy_wisp'];
    case 'crimson_canyon': return ['enemy_charger', 'enemy_sand_wraith', 'enemy_magma_wyrm'];
    case 'cyber_undercity': return ['enemy_laser_eye', 'enemy_spark_beetle', 'enemy_drone'];
    case 'celestial_marble': return ['enemy_frost_valkyrie', 'enemy_mirror_orb', 'enemy_phantom'];
    case 'ebony_fen': return ['enemy_alchemist', 'enemy_slime_king', 'enemy_phantom'];
    case 'orbital_nexus': return ['enemy_mirror_orb', 'enemy_laser_eye', 'enemy_drone'];
    case 'twilight_garden': return ['enemy_phantom', 'enemy_bone_knight', 'enemy_frost_valkyrie'];
    default: return ['enemy_frost_valkyrie', 'enemy_sand_wraith', 'enemy_bone_knight'];
  }
}

function resolveBiomeTilePalette(biome: BiomeId, pattern: number): { hazardTile: number; midTile: number; gripTile: number } {
  const nwMeta = NEW_30_WORLD_MAP[biome];
  const hazardTile = nwMeta
    ? nwMeta.hazardTile
    : biome === 'obsidian_forge' || biome === 'alchemical_labs' || biome === 'ebony_fen'
      ? TileType.LIQUID_LETHAL
      : biome === 'bioluminescent' || biome === 'sunken_cathedral' || biome === 'twilight_garden'
        ? pattern % 2 === 0
          ? TileType.LIQUID_LETHAL
          : TileType.WATER
        : TileType.SPIKE_UP;

  const midTile = nwMeta
    ? nwMeta.midTile
    : biome === 'frostglass' || biome === 'aurora_zenith' || biome === 'celestial_marble' || biome === 'twilight_garden'
      ? biome === 'frostglass'
        ? TileType.ICE
        : TileType.CLOUD_BOUNCE
      : biome === 'astral_void' || biome === 'amethyst_crypt' || biome === 'orbital_nexus'
        ? TileType.DREAM_BLOCK
        : biome === 'obsidian_forge' || biome === 'alchemical_labs' || biome === 'cyber_undercity'
          ? TileType.CONVEYOR_RIGHT
          : biome === 'solar_mirage'
            ? TileType.CLOUD_BOUNCE
            : TileType.CRUMBLE;

  const gripTile = nwMeta
    ? nwMeta.gripTile
    : biome === 'bioluminescent' || biome === 'ebony_fen'
      ? TileType.STICKY_RESIN
      : biome === 'obsidian_forge' || biome === 'crimson_canyon'
        ? TileType.MAGMA_CRUST
        : biome === 'amethyst_crypt' || biome === 'orbital_nexus'
          ? TileType.DREAM_BLOCK
          : TileType.SOLID;

  return { hazardTile, midTile, gripTile };
}

/** Builds a distinct, varied 3x expansion wing between [startX, endX) unique to (chIdx, sIdx, variant). */
function populateExpansionWing(
  p: StagePainter,
  biome: BiomeId,
  chIdx: number,
  sIdx: number,
  startX: number,
  endX: number,
  leftFloor: number,
  rightFloor: number,
  variant: 'west_approach' | 'mid_viaduct' | 'east_bastion'
): void {
  const { hazardTile, midTile, gripTile } = resolveBiomeTilePalette(biome, (sIdx * 3 + chIdx * 7) % 6);
  const [e0, e1, e2] = pickBiomeEnemies(biome);
  const palette: ZoneThemePalette = { hazardTile, midTile, gripTile, e0, e1, e2 };
  const roleIdx = variant === 'west_approach' ? 1 : variant === 'mid_viaduct' ? 2 : 3;
  const h = layoutHash(chIdx + 1, sIdx + 1, roleIdx, 61);
  // Ensure each wing in the same stage uses a noticeably different architectural archetype
  const arch = (h + roleIdx * 3 + chIdx) % 10;

  buildZoneArchetype(p, arch, startX, endX, leftFloor, rightFloor, palette, h, variant, chIdx, sIdx);

  if ((variant === 'mid_viaduct' || variant === 'east_bastion') && arch !== 2 && arch !== 9) {
    const rFl = Math.max(10, Math.min(p.rows - 4, rightFloor));
    p.add('treasure_chest', endX - 3, rFl - 2);
  }
}

function populateAsymmetricStage(
  p: StagePainter,
  pattern: number,
  biome: BiomeId,
  chIdx: number,
  stageIdx: number,
  neighbors: NeighborMask,
  exits: ResolvedExits,
  totalStages = 14
): void {
  const C = p.cols;
  const R = p.rows;
  const { hazardTile, midTile, gripTile } = resolveBiomeTilePalette(biome, (pattern + chIdx) % 6);
  const [e0, e1, e2] = pickBiomeEnemies(biome);
  const palette: ZoneThemePalette = { hazardTile, midTile, gripTile, e0, e1, e2 };

  // Anchor approach platforms at West/East edges
  const leftFloor = Math.min(R - 3, exits.leftRow);
  const rightFloor = Math.min(R - 3, exits.rightRow);
  p.cliff(2, leftFloor, 10, TileType.SOLID);
  p.cliff(C - 12, rightFloor, 10, TileType.SOLID);

  if (pattern === 4 && R >= 32) {
    // 3X VERTICAL TOWER / GRAND CITADEL ASCENT (4 distinct tower organizations across chapters/stages!)
    buildVerticalTowerLayout(p, chIdx, stageIdx, leftFloor, rightFloor, palette);
  } else {
    // 3-WING GIANT HORIZONTAL EXPLORATION STAGE (~186x28) with unique proportions & 3 distinct archetypes
    buildUniqueHorizontalStage(p, chIdx, stageIdx, pattern, leftFloor, rightFloor, palette);
  }

  // Biome-specific signature enemies, shrines & hoops placed proportionally across the 3x stage
  const midCol = Math.floor(C * 0.5);
  const westCol = Math.floor(C * 0.34);
  const eastCol = Math.floor(C * 0.67);
  if (biome === 'silver_ash') {
    p.add('enemy_crawler', 5, leftFloor - 1, { patrolDist: 26 });
    if (stageIdx % 2 === 1) p.add('enemy_wisp', midCol, 9, { patrolDist: 24 });
    if (stageIdx >= 2) p.add('enemy_spark_beetle', C - 10, rightFloor - 1, { patrolDist: 26 });
    p.add('boost_hoop', westCol, 10);
  } else if (biome === 'bioluminescent') {
    p.add('bounce_shroom', 10, leftFloor - 1);
    p.add('bounce_shroom', C - 11, rightFloor - 1);
    p.add('stamina_orb', midCol - 4, 10);
    p.add(stageIdx % 3 === 1 ? 'enemy_slime_king' : 'enemy_mortar', C - 10, rightFloor - 1, { patrolDist: 24 });
    p.add('torch', 7, leftFloor - 2);
    p.add('torch', westCol, 12);
    if (stageIdx === 3) {
      p.add('tether_ring', midCol, 6);
      p.add('bubble', eastCol, 13);
    }
  } else if (biome === 'frostglass') {
    p.add('torch', 7, leftFloor - 2);
    p.add('falling_icicle', Math.floor(C * 0.28), 2);
    p.add('falling_icicle', Math.floor(C * 0.72), 2);
    p.add(stageIdx % 2 === 0 ? 'enemy_laser_eye' : 'enemy_wisp', eastCol, 9, { patrolDist: 24 });
    p.add('wind_up', westCol, 6, { w: 32, h: 120 });
  } else if (biome === 'obsidian_forge') {
    p.add('steam_geyser', westCol, R - 4);
    p.add('dash_ring', midCol, 9);
    if (stageIdx % 2 === 0) p.add('enemy_magma_wyrm', eastCol, R - 3);
    p.add(stageIdx % 3 === 1 ? 'enemy_charger' : 'enemy_drone', C - 10, rightFloor - 1, { patrolDist: 26 });
    if (stageIdx === 5) p.add('enemy_saw', midCol, 11, { patrolDist: 64 });
  } else if (biome === 'astral_void') {
    p.add('double_dash_crystal', midCol + 3, 9);
    if (stageIdx === 2) {
      p.add('portal_a', 8, leftFloor - 2, { tx: (C - 9) * 8, ty: (rightFloor - 2) * 8 });
      p.add('portal_b', C - 9, rightFloor - 2, { tx: 8 * 8, ty: (leftFloor - 2) * 8 });
    }
    p.add(stageIdx % 2 === 0 ? 'enemy_phantom' : 'enemy_mimic', C - 10, rightFloor - 2);
    p.add('spinner', westCol, 14);
  } else if (biome in NEW_30_WORLD_MAP) {
    populateNew30BiomeEntities(p, biome, stageIdx, leftFloor, rightFloor);
  } else {
    p.add(e0, 5, leftFloor - 1, { patrolDist: 24 });
    p.add(e1, eastCol, 9, { patrolDist: 26 });
    p.add('grapple_anchor', westCol, 8);
    p.add('double_dash_crystal', eastCol, 9);
  }

  // Progressive exclusive biome enemies escalating across the up-to-20 rooms
  const [ex0, ex1] = pickExclusiveEnemiesForBiome(biome, chIdx);
  const progCount = getProgressiveEnemySpawnCount(stageIdx, totalStages);
  for (let ei = 0; ei < progCount; ei++) {
    const enemyKind = selectProgressiveEnemyKind([e0, e1, e2], [ex0, ex1], stageIdx, totalStages, ei);
    const exCol = Math.max(8, Math.min(C - 10, Math.round(C * (0.22 + ((ei + 0.5) / (progCount + 0.8)) * 0.62))));
    let eyRow = Math.max(4, Math.min(R - 5, (ei % 2 === 0 ? leftFloor : rightFloor) - 2));
    while (eyRow > 3 && p.get(exCol, eyRow) !== TileType.EMPTY) eyRow--;
    p.add(enemyKind, exCol, eyRow, {
      patrolDist: 22 + (ei % 3) * 8,
      isElite: stageIdx >= totalStages - 3 && ei === progCount - 1,
    });
  }

  // Always preserve rich collectibles & shrines across all 3 wings
  p.add('checkpoint_totem', westCol, Math.min(R - 5, leftFloor - 2));
  if (stageIdx === 4 || stageIdx === 7) p.add('rift_trial', 8, leftFloor - 2);
  if (stageIdx === 3 || stageIdx === 5) p.add('blessing_shrine', 6, leftFloor - 2);
  p.add('speed_pad', 9, leftFloor - 1);
  p.add('bumper_orb', westCol + 6, 11);
  p.add('treasure_chest', C - 7, rightFloor - 2);
  p.add('shield_orb', eastCol - 6, 9);
  if (stageIdx >= 3) p.add('chrono_gate', westCol - 8, 10);
  if (stageIdx === 5 || stageIdx === 7) p.add('laser_prism', eastCol + 6, 9);
  if (stageIdx === 2 || stageIdx === 6) p.add('elemental_totem', 10, leftFloor - 2);
  if (stageIdx === 4 || stageIdx === 8) p.add('echo_mirror', eastCol, 9);
  if (stageIdx === 8) p.add('heal_orb', C - 10, rightFloor - 2);

  addBiomeDecor(p, biome, stageIdx * 17 + chIdx * 37 + pattern * 31);

  // Secret alcove with relic (every stage keeps 1+ relics >= 400 total)
  if (stageIdx % 2 === 1) {
    p.rect(3, 4, 5, 5, TileType.SOLID);
    p.rect(4, 5, 3, 3, TileType.EMPTY);
    p.rect(7, 5, 1, 3, TileType.SECRET_WALL);
    p.add('relic', 5, 6);
  } else {
    p.add('relic', Math.floor(C * 0.48), 5);
  }
}

function getSharedHorizontalRow(chIdx: number, leftGx: number, gy: number): number {
  return 11 + ((chIdx * 5 + leftGx * 7 + gy * 3) % 8); // ranges 11..18 (varied elevations!)
}

function getSharedVerticalCol(chIdx: number, gx: number, topGy: number): number {
  return 24 + ((chIdx * 7 + gx * 11 + topGy * 5) % 18); // ranges 24..41 (fits inside both 92 & 186 cols!)
}

export function buildChapters(): ChapterDef[] {
  return CHAPTER_CONFIGS.map((cfg, chIdx) => {
    const org = generateUniquePhaseOrganization(chIdx, 20);
    const lastOrgIdx = org.nodes.length - 1;
    const activeBlueprints: StageBlueprint[] = org.nodes.map((node, sIdx) => {
      if (sIdx === 0) {
        return {
          ...cfg.stages[0],
          gx: node.gx,
          gy: node.gy,
          isStart: true,
          isGoal: false,
          leftRow: undefined,
          rightRow: undefined,
          upCol: undefined,
          downCol: undefined,
          subtitle: `${getArchetypeLabel(org.archetype)} · ${org.roomCount} Salas`,
        };
      }
      if (sIdx === lastOrgIdx) {
        const goalBp = cfg.stages[cfg.stages.length - 1];
        return {
          ...goalBp,
          gx: node.gx,
          gy: node.gy,
          isStart: false,
          isGoal: true,
          leftRow: undefined,
          rightRow: undefined,
          upCol: undefined,
          downCol: undefined,
        };
      }
      const midSrc = cfg.stages[Math.min(cfg.stages.length - 2, sIdx)];
      if (sIdx <= cfg.stages.length - 2 && node.role !== 'vertical' && midSrc) {
        return {
          ...midSrc,
          gx: node.gx,
          gy: node.gy,
          pattern: node.pattern,
          isStart: false,
          isGoal: false,
          leftRow: undefined,
          rightRow: undefined,
          upCol: undefined,
          downCol: undefined,
          cols: midSrc.build ? midSrc.cols : node.cols,
          rows: midSrc.build ? midSrc.rows : node.rows,
        };
      }
      return {
        gx: node.gx,
        gy: node.gy,
        name: `${node.titlePrefix} ${sIdx + 1}`,
        subtitle: node.subtitle,
        pattern: node.pattern,
        cols: node.cols,
        rows: node.rows,
        dark: Boolean(midSrc?.dark),
      };
    });

    const coordMap = new Map<string, StageBlueprint>();
    for (const s of activeBlueprints) {
      coordMap.set(`${s.gx},${s.gy}`, s);
    }

    // Track explicit vertical offsets for any custom stage so neighboring stages align portals cleanly
    const resolvedOffsetX = new Map<string, number>();
    for (const s of activeBlueprints) {
      const hasLeft = coordMap.has(`${s.gx - 1},${s.gy}`);
      const origC = s.cols ?? (s.pattern === 4 ? 48 : 64);
      const off = s.build
        ? (s.isStart || !hasLeft) && !s.isGoal
          ? 0
          : origC
        : 0;
      resolvedOffsetX.set(`${s.gx},${s.gy}`, off);
    }

    const stages: RoomDef[] = activeBlueprints.map((bp, sIdx) => {
      const id = `ch${chIdx}_${bp.gx},${bp.gy}`;
      const origCols = bp.cols ?? (bp.pattern === 4 ? 48 : 64);
      const origRows = bp.rows ?? (bp.pattern === 4 ? 34 : 26);

      // Expand EVERY stage (custom and pattern-based) to ~3x area!
      const cols = bp.build
        ? origCols * 3
        : bp.pattern === 4
          ? 92
          : 186;
      const rows = bp.build
        ? origRows
        : bp.pattern === 4
          ? 54
          : 28;

      const leftNb = coordMap.get(`${bp.gx - 1},${bp.gy}`);
      const rightNb = coordMap.get(`${bp.gx + 1},${bp.gy}`);
      const upNb = coordMap.get(`${bp.gx},${bp.gy - 1}`);
      const downNb = coordMap.get(`${bp.gx},${bp.gy + 1}`);

      const myOffsetX = resolvedOffsetX.get(`${bp.gx},${bp.gy}`) ?? 0;
      const upOffsetX = upNb ? (resolvedOffsetX.get(`${upNb.gx},${upNb.gy}`) ?? 0) : 0;
      const downOffsetX = downNb ? (resolvedOffsetX.get(`${downNb.gx},${downNb.gy}`) ?? 0) : 0;

      const maxRow = rows - 3;
      const leftRow = Math.min(
        maxRow,
        bp.leftRow ?? leftNb?.rightRow ?? getSharedHorizontalRow(chIdx, bp.gx - 1, bp.gy)
      );
      const rightRow = Math.min(
        maxRow,
        bp.rightRow ?? rightNb?.leftRow ?? getSharedHorizontalRow(chIdx, bp.gx, bp.gy)
      );
      const rawUpCol = bp.upCol !== undefined
        ? bp.upCol + myOffsetX
        : upNb?.downCol !== undefined
          ? upNb.downCol + upOffsetX
          : getSharedVerticalCol(chIdx, bp.gx, bp.gy - 1);
      const rawDownCol = bp.downCol !== undefined
        ? bp.downCol + myOffsetX
        : downNb?.upCol !== undefined
          ? downNb.upCol + downOffsetX
          : getSharedVerticalCol(chIdx, bp.gx, bp.gy);

      const upCol = Math.min(cols - 8, rawUpCol);
      const downCol = Math.min(cols - 8, rawDownCol);

      const exits: ResolvedExits = { leftRow, rightRow, upCol, downCol };
      const neighbors: NeighborMask = {
        left: Boolean(leftNb),
        right: Boolean(rightNb),
        up: Boolean(upNb),
        down: Boolean(downNb),
      };

      const painter = new StagePainter(id, cols, rows);

      if (bp.build) {
        const sub = new TranslatedStagePainter(painter, origCols, origRows, myOffsetX, 0);
        bp.build(sub as unknown as StagePainter, cfg.id, exits);

        // Bridge seamlessly across the 2 brand-new 1x expansion wings
        const corridorRow = (rowAnchor: number, bridgeX: number) => {
          const clamped = Math.max(8, Math.min(rows - 3, rowAnchor));
          painter.rect(bridgeX - 3, clamped - 5, 7, 5, TileType.EMPTY);
          painter.rect(bridgeX - 3, clamped, 7, rows - clamped, TileType.SOLID);
        };

        if (myOffsetX === 0) {
          // Core stage sits in Zone 1 (0..origCols-1); add scenic Wing 2 + Wing 3 to East!
          populateExpansionWing(painter, cfg.id, chIdx, sIdx, origCols, origCols * 2, exits.rightRow, exits.rightRow, 'mid_viaduct');
          populateExpansionWing(painter, cfg.id, chIdx, sIdx, origCols * 2, cols - 2, exits.rightRow, exits.rightRow, 'east_bastion');
          corridorRow(exits.rightRow, origCols);
          corridorRow(exits.rightRow, origCols * 2);
        } else {
          // Core stage sits in Zone 2 (origCols..origCols*2-1); add West Approach (Zone 1) + East Bastion (Zone 3)!
          const approachRightRow = exits.leftRow;
          populateExpansionWing(painter, cfg.id, chIdx, sIdx, 2, origCols, exits.leftRow, approachRightRow, 'west_approach');
          corridorRow(approachRightRow, origCols);

          const postLeftRow = bp.isGoal ? 17 : exits.rightRow;
          populateExpansionWing(painter, cfg.id, chIdx, sIdx, origCols * 2, cols - 2, postLeftRow, exits.rightRow, 'east_bastion');
          corridorRow(postLeftRow, origCols * 2);
        }
        addBiomeDecor(painter, cfg.id, chIdx * 31 + sIdx * 13);
        if (!bp.isGoal && !bp.isStart) {
          const [ex0, ex1] = pickExclusiveEnemiesForBiome(cfg.id, chIdx);
          painter.add(sIdx % 2 === 0 ? ex0 : ex1, Math.floor(cols * 0.76), Math.max(4, exits.rightRow - 2), {
            patrolDist: 26,
          });
        }
      } else {
        populateAsymmetricStage(painter, bp.pattern, cfg.id, chIdx, sIdx, neighbors, exits, activeBlueprints.length);
      }

      applyStageBorders(painter, neighbors, exits, Boolean(chIdx === 0 && bp.isStart));
      if (!bp.isGoal) addNewMechanics(painter, chIdx * 10 + sIdx);

      // Determine safe spawn position aligned ON TOP of supporting floor (zero tile embedment!)
      const rawSpawnCol = bp.spawnCol !== undefined ? bp.spawnCol + myOffsetX : undefined;
      const spawnCol = rawSpawnCol ?? (neighbors.left ? 4 : neighbors.down ? downCol : 5);
      const hintRow = bp.spawnRow ?? (neighbors.left ? leftRow - 1 : rows - 4);
      let supportRow = Math.max(3, Math.min(rows - 2, hintRow + 1));
      while (supportRow < rows - 2 && painter.get(spawnCol, supportRow) === TileType.EMPTY) {
        supportRow++;
      }
      if (painter.get(spawnCol, supportRow) === TileType.EMPTY || painter.get(spawnCol, supportRow) === TileType.LIQUID_LETHAL || painter.get(spawnCol, supportRow) === TileType.SPIKE_UP) {
        supportRow = Math.max(3, Math.min(rows - 3, hintRow + 1));
        painter.rect(Math.max(2, spawnCol - 1), supportRow, 3, 1, TileType.SOLID);
      }
      // Guarantee 2 unobstructed air rows above supportRow for both columns [spawnCol, spawnCol+1]
      for (let dc = 0; dc <= 1; dc++) {
        const cx = Math.min(cols - 3, spawnCol + dc);
        for (let dr = 1; dr <= 2; dr++) {
          const ry = Math.max(2, supportRow - dr);
          const cur = painter.get(cx, ry);
          if (cur !== TileType.ONE_WAY) {
            painter.set(cx, ry, TileType.EMPTY);
          }
        }
      }
      const exactSpawnY = supportRow * TILE_SIZE - 11;

      return {
        id,
        chapterIndex: chIdx,
        stageIndex: sIdx,
        gx: bp.gx,
        gy: bp.gy,
        cols,
        rows,
        biome: cfg.id,
        name: bp.name,
        subtitle: bp.subtitle,
        dark: bp.dark,
        tiles: painter.tiles,
        entities: painter.entities,
        props: painter.props,
        spawnX: spawnCol * TILE_SIZE,
        spawnY: exactSpawnY,
        exits,
      };
    });

    const totalRelics = stages.reduce(
      (acc, st) =>
        acc + st.entities.filter((e) => e.kind === 'relic' || e.kind === 'winged_relic').length,
      0
    );

    const startStage = stages.find((_, i) => activeBlueprints[i].isStart) ?? stages[0];

    return {
      index: chIdx,
      id: cfg.id,
      name: cfg.name,
      subtitle: cfg.subtitle,
      difficultyLabel: cfg.difficultyLabel,
      accent: cfg.accent,
      startStageId: startStage.id,
      stages,
      totalRelics,
    };
  });
}

export const CHAPTERS: ChapterDef[] = buildChapters();

// Backwards-compatible flattened stages getter for tests
export function buildAllStages(): RoomDef[] {
  return buildChapters().flatMap((c) => c.stages);
}

// Dedicated multi-tiered Colosseum room for Arena Infinita (Survival Mode)
export function createSurvivalArenaRoom(): RoomDef {
  const cols = 60;
  const rows = 26;
  const p = new StagePainter('survival_arena', cols, rows);
  const exits: ResolvedExits = { leftRow: 20, rightRow: 20, upCol: 30, downCol: 30 };

  p.cliff(2, 22, 56, TileType.SOLID);
  p.cliff(2, 17, 6, TileType.SOLID);
  p.cliff(cols - 8, 17, 6, TileType.SOLID);

  p.rect(10, 17, 8, 1, TileType.ONE_WAY);
  p.rect(42, 17, 8, 1, TileType.ONE_WAY);
  p.rect(21, 13, 18, 1, TileType.ONE_WAY);
  p.rect(10, 9, 8, 1, TileType.ONE_WAY);
  p.rect(42, 9, 8, 1, TileType.ONE_WAY);

  p.prop('arch', 25, 3, 8);
  p.prop('rose_window', 13, 4, 6);
  p.prop('rose_window', 41, 4, 6);
  p.prop('sun_dial', 21, 15, 6);
  p.prop('banner', 7, 10, 5);
  p.prop('banner', 51, 10, 5);
  p.prop('brazier', 16, 20, 2);
  p.prop('brazier', 42, 20, 2);
  p.prop('obelisk', 28, 14, 8);

  p.add('dash_crystal', 14, 15);
  p.add('dash_crystal', 45, 15);
  p.add('double_dash_crystal', 30, 8);
  p.add('bumper_orb', 20, 18);
  p.add('bumper_orb', 39, 18);
  p.add('boost_hoop', 30, 16);
  p.add('grapple_anchor', 21, 9);
  p.add('grapple_anchor', 38, 9);
  p.add('shield_orb', 30, 11);
  p.add('heal_orb', 14, 7);
  p.add('elemental_totem', 45, 7);
  p.add('echo_mirror', 30, 20);
  p.add('chrono_gate', 20, 15);
  p.add('laser_prism', 40, 15);

  applyStageBorders(
    p,
    { left: false, right: false, up: false, down: false },
    exits,
    false
  );

  return {
    id: 'survival_arena',
    chapterIndex: 19,
    stageIndex: 0,
    gx: 0,
    gy: 0,
    cols,
    rows,
    biome: 'stormcrown',
    name: 'Coliseu do Éter Infinito',
    subtitle: 'Sobreviva às hordas crescentes — a cada 3 ondas surge um Chefão!',
    tiles: p.tiles,
    entities: p.entities,
    props: p.props,
    spawnX: 29 * TILE_SIZE,
    spawnY: 22 * TILE_SIZE - 11,
    exits,
  };
}

const TOWER_BIOMES: BiomeId[] = [
  'silver_ash',
  'bioluminescent',
  'frostglass',
  'obsidian_forge',
  'astral_void',
  'crimson_sakura',
  'sunken_cathedral',
  'clockwork_spire',
  'emerald_sky',
  'solar_mirage',
  'amethyst_crypt',
  'alchemical_labs',
  'aurora_zenith',
  'crimson_canyon',
  'cyber_undercity',
  'celestial_marble',
  'ebony_fen',
  'orbital_nexus',
  'twilight_garden',
  'stormcrown',
  ...NEW_30_WORLDS.map((w) => w.id),
];

const TOWER_BOSS_KINDS: EntityKind[] = [
  'boss_sentinel',
  'boss_mycelium',
  'boss_glacier',
  'boss_ignis_rex',
  'boss_astral_oracle',
  'boss_sakura',
  'boss_leviathan',
  'boss_chronos',
  'boss_seraph_king',
  'boss_sphinx',
  'boss_lich',
  'boss_automaton',
  'boss_valkyrie',
  'boss_canyon_colossus',
  'boss_cyber_archon',
  'boss_marble_titan',
  'boss_fen_hydra',
  'boss_star_emperor',
  'boss_twilight_wraith',
  'boss_sovereign',
  ...NEW_30_WORLDS.map((w) => w.boss),
];

// Vertical procedural Tower Floor (42x48 tiles) with grapple vines, springs, enemies & Bosses every 5 floors
export function createTowerFloorRoom(rawFloor: number): RoomDef {
  const floor = Math.max(1, Math.floor(rawFloor));
  const cols = 42;
  const rows = 48;
  const biome = TOWER_BIOMES[(floor - 1) % TOWER_BIOMES.length];
  const chapterIndex = (floor - 1) % TOWER_BIOMES.length;
  const isBossFloor = floor % 5 === 0;
  const p = new StagePainter(`tower_floor_${floor}`, cols, rows);
  const exits: ResolvedExits = { leftRow: 40, rightRow: 40, upCol: 21, downCol: 21 };

  // Solid base spawn terrace on bottom left
  p.cliff(2, rows - 4, cols - 4, TileType.SOLID);
  p.prop('brazier', 6, rows - 6, 2);
  p.prop('brazier', 34, rows - 6, 2);
  p.prop('arch', 18, rows - 10, 6);

  // Decorative hanging vines & lanterns framing the vertical tower shaft
  p.prop('hanging_vine', 8, 2, 7);
  p.prop('hanging_vine', 33, 2, 7);
  p.prop('pillar', 5, rows - 24, 10);
  p.prop('pillar', 35, rows - 24, 10);

  // Build alternating ascending platforms from y = rows - 8 up to y = 13
  const stepRows = [rows - 8, rows - 12, rows - 16, rows - 20, rows - 24, rows - 28, rows - 32, rows - 36];
  const seedBase = floor * 37;
  for (let i = 0; i < stepRows.length; i++) {
    const ty = stepRows[i];
    const side = (i + floor) % 3;
    let xStart = 15;
    let width = 10;
    if (side === 0) {
      xStart = 4 + ((seedBase + i * 3) % 4);
      width = 9;
    } else if (side === 1) {
      xStart = 15 + ((seedBase + i * 5) % 4);
      width = 10;
    } else {
      xStart = cols - 14 - ((seedBase + i * 3) % 4);
      width = 9;
    }

    const tileKind =
      i > 1 && i % 4 === 3 && floor >= 3
        ? TileType.ICE
        : i % 2 === 0
          ? TileType.ONE_WAY
          : TileType.SOLID;
    p.rect(xStart, ty, width, 1, tileKind);

    // Side helper ledge for forgiving wall-jump & vine recovery
    const altX = side === 0 ? cols - 11 : side === 2 ? 4 : i % 2 === 0 ? 4 : cols - 10;
    p.rect(altX, ty + 1, 6, 1, TileType.ONE_WAY);

    // Climbing tools: springs, grapple vine anchors, dash crystals, coins & enemies
    if (i === 0 || i === 4) {
      p.add('spring_up', xStart + Math.floor(width / 2), ty - 1);
    }
    if (i === 2 || i === 5) {
      // Place grapple vine anchor safely in open air (>= 5 tiles away from outer walls)
      const gCol = Math.max(8, Math.min(cols - 9, side === 0 ? xStart + width + 4 : xStart - 4));
      p.add('grapple_anchor', gCol, ty - 2);
      p.prop('hanging_vine', gCol, Math.max(2, ty - 6), 4);
    }
    if (i === 1 || i === 5) {
      p.add('dash_crystal', Math.floor(cols / 2), ty - 2);
    }
    if (i === 1 || i === 3 || i === 6) {
      p.add('astral_coin', xStart + 2, ty - 2);
    }

    // Light floor hazards/enemies (never on row 0 spawn or directly blocking narrow exits)
    if (floor >= 2 && (i === 2 || i === 6)) {
      const eKind: EntityKind =
        floor % 3 === 0 ? 'enemy_drone' : i === 2 ? 'enemy_wisp' : 'enemy_crawler';
      p.add(eKind, xStart + Math.floor(width / 2), ty - 2, { patrolDist: 28, dir: i % 2 === 0 ? 1 : -1 });
    }
    if (floor >= 4 && i === 3 && tileKind === TileType.SOLID && width >= 9) {
      p.spikes(xStart + width - 2, ty - 1, 2, 'up');
    }
  }

  // Summit Arena / Goal Platform near the top (ty = 9)
  const summitY = 9;
  p.rect(10, summitY, 22, 1, TileType.SOLID);
  p.rect(5, summitY + 2, 5, 1, TileType.ONE_WAY);
  p.rect(cols - 10, summitY + 2, 5, 1, TileType.ONE_WAY);
  p.prop('rose_window', 18, 3, 5);
  p.add('checkpoint_totem', 12, summitY - 2);
  p.add('chapter_goal', 20, summitY - 2);

  if (isBossFloor) {
    const bossKind = TOWER_BOSS_KINDS[(Math.floor(floor / 5) - 1) % TOWER_BOSS_KINDS.length];
    p.add('heal_orb', 7, summitY + 1);
    p.add('dash_crystal', cols - 8, summitY + 1);
    p.add(bossKind, 26, summitY - 3);
  } else {
    p.add('star_shard', 29, summitY - 2);
  }

  applyStageBorders(
    p,
    { left: false, right: false, up: false, down: false },
    exits,
    false
  );

  return {
    id: `tower_floor_${floor}`,
    chapterIndex,
    stageIndex: floor - 1,
    gx: 0,
    gy: 0,
    cols,
    rows,
    biome,
    name: `Andar ${floor} · ${BIOME_META[biome].name.replace(/^Fase\s+\d+\s*·\s*/i, '')}`,
    subtitle: isBossFloor
      ? `Andar de Guardião (${floor}) — Derrote o Chefe para subir!`
      : `Escalada da Torre do Éter — Alcance o portal no topo!`,
    tiles: p.tiles,
    entities: p.entities,
    props: p.props,
    spawnX: 7 * TILE_SIZE,
    spawnY: (rows - 4) * TILE_SIZE - 11,
    exits,
  };
}


