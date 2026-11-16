// @ts-nocheck -- imported game code
import {
  AnyBiomeId,
  BiomeId,
  EnemyBestiaryEntry,
  ExclusiveEnemyKind,
  EXCLUSIVE_ENEMY_KINDS,
  RoomDef,
  TILE_SIZE,
} from './types';

export interface ExclusiveEnemyMeta {
  kind: ExclusiveEnemyKind;
  name: string;
  title: string;
  tier: 1 | 2 | 3 | 4 | 5;
  baseHp: number;
  baseSpeed: number;
  accent: string;
  element: 'fire' | 'ice' | 'wind' | 'earth' | 'shadow' | 'light' | 'lightning' | 'astral';
  archetype: string;
  mechanic: string;
  counterTip: string;
  biomes: AnyBiomeId[];
  bountyTarget: number;
  bountyCoins: number;
}

export const EXCLUSIVE_ENEMY_META: Record<ExclusiveEnemyKind, ExclusiveEnemyMeta> = {
  enemy_ash_hound: {
    kind: 'enemy_ash_hound',
    name: 'Sabujo das Cinzas',
    title: 'Predador de Ruínas',
    tier: 1,
    baseHp: 2,
    baseSpeed: 56,
    accent: '#e8a87c',
    element: 'fire',
    archetype: 'Fera Emboscadora',
    mechanic: 'Fareja o jogador a distância média e executa uma investida dupla em brasa.',
    counterTip: 'Pule por cima na carga ou aplique Parry durante a piscada laranja.',
    biomes: ['silver_ash', 'ember_steppe', 'crimson_canyon', 'asphodel_wastes'],
    bountyTarget: 6,
    bountyCoins: 14,
  },
  enemy_mycelium_sporeling: {
    kind: 'enemy_mycelium_sporeling',
    name: 'Esporídio Abissal',
    title: 'Colônia Micelial',
    tier: 1,
    baseHp: 2,
    baseSpeed: 38,
    accent: '#4df0c0',
    element: 'earth',
    archetype: 'Saltador Tóxico',
    mechanic: 'Salta em arcos regulares liberando esporos luminosos ao tocar o solo.',
    counterTip: 'Acertar no ar cancela a liberação de esporos.',
    biomes: ['bioluminescent', 'fungal_myriad', 'ebony_fen', 'emerald_sky', 'pestilence_marsh'],
    bountyTarget: 6,
    bountyCoins: 15,
  },
  enemy_glacial_golem: {
    kind: 'enemy_glacial_golem',
    name: 'Colosso de Safira',
    title: 'Guardião Glacial',
    tier: 2,
    baseHp: 3,
    baseSpeed: 24,
    accent: '#7ce8ff',
    element: 'ice',
    archetype: 'Blindado Criogênico',
    mechanic: 'Avança blindado e soca o chão disparando ondas gêmeas de gelo rasante.',
    counterTip: 'Salte antes do impacto sísmico e pise ou use ataques de Fogo.',
    biomes: ['frostglass', 'glacial_fjord', 'aurora_zenith', 'cocytus_trench'],
    bountyTarget: 7,
    bountyCoins: 18,
  },
  enemy_abyssal_nautilus: {
    kind: 'enemy_abyssal_nautilus',
    name: 'Nautilus Abissal',
    title: 'Concha Sônica',
    tier: 2,
    baseHp: 3,
    baseSpeed: 40,
    accent: '#4de1ff',
    element: 'ice',
    archetype: 'Flutuador Blindado',
    mechanic: 'Orbita em espiral e dispara 4 bolhas de pressão hidrostática em cruz.',
    counterTip: 'Reflita os projéteis com Dash para quebrar sua carapaça instantaneamente.',
    biomes: ['sunken_cathedral', 'coral_abyss', 'lethe_depths', 'starlight_harbor'],
    bountyTarget: 7,
    bountyCoins: 18,
  },
  enemy_cinder_sentinel: {
    kind: 'enemy_cinder_sentinel',
    name: 'Sentinela da Fornalha',
    title: 'Armadura Ígnea',
    tier: 3,
    baseHp: 3,
    baseSpeed: 34,
    accent: '#ff7733',
    element: 'fire',
    archetype: 'Artilheiro Vulcânico',
    mechanic: 'Flutua sobre magma e dispara leques triplos de esferas flamejantes.',
    counterTip: 'Use o intervalo entre rajadas para executar um Golpe da Alma [U].',
    biomes: ['obsidian_forge', 'obsidian_temple', 'crimson_foundry', 'brimstone_caldera', 'magma_core'],
    bountyTarget: 8,
    bountyCoins: 22,
  },
  enemy_dune_scorpion: {
    kind: 'enemy_dune_scorpion',
    name: 'Escorpião Solar',
    title: 'Ferrão das Dunas',
    tier: 3,
    baseHp: 3,
    baseSpeed: 54,
    accent: '#fbbf24',
    element: 'earth',
    archetype: 'Emboscador Ágil',
    mechanic: 'Finca a cauda e arremessa dardos parabólicos dourados antes de avançar.',
    counterTip: 'Mantenha altitude usando plataformas ou ganchos e ataque de cima.',
    biomes: ['solar_mirage', 'hourglass_desert', 'amber_hive', 'brass_tartarus'],
    bountyTarget: 8,
    bountyCoins: 22,
  },
  enemy_crypt_reaper: {
    kind: 'enemy_crypt_reaper',
    name: 'Ceifador da Cripta',
    title: 'Sombra da Necrópole',
    tier: 4,
    baseHp: 4,
    baseSpeed: 46,
    accent: '#c084fc',
    element: 'shadow',
    archetype: 'Assassino Espectral',
    mechanic: 'Teleporta-se para trás do herói e dispara lâminas espectrais crescentes.',
    counterTip: 'Mude de direção com um Dash assim que o círculo violeta surgir.',
    biomes: ['amethyst_crypt', 'bone_catacombs', 'ash_necropolis', 'shadow_sanctum'],
    bountyTarget: 9,
    bountyCoins: 26,
  },
  enemy_plague_chemist: {
    kind: 'enemy_plague_chemist',
    name: 'Alquimista da Peste',
    title: 'Destilador Tóxico',
    tier: 4,
    baseHp: 3,
    baseSpeed: 32,
    accent: '#2dd4bf',
    element: 'shadow',
    archetype: 'Bombardeiro Ácido',
    mechanic: 'Arremessa frascos em arco alto que dividem o ar com gotas ácidas.',
    counterTip: 'Aproxime-se com Dash aéreo enquanto ele prepara o arremesso.',
    biomes: ['alchemical_labs', 'mercury_mire', 'velvet_opera', 'blood_aqueduct'],
    bountyTarget: 8,
    bountyCoins: 24,
  },
  enemy_gear_colossus: {
    kind: 'enemy_gear_colossus',
    name: 'Autômato Engrenagem',
    title: 'Titã Relojoeiro',
    tier: 4,
    baseHp: 4,
    baseSpeed: 30,
    accent: '#ffb84d',
    element: 'lightning',
    archetype: 'Torre Mecânica',
    mechanic: 'Dispara serras rotativas em ângulos horizontais e diagonais sincronizados.',
    counterTip: 'Use Parry nas serras para devolver o dobro de dano!',
    biomes: ['clockwork_spire', 'rust_foundry', 'iron_dungeon', 'storm_archipelago'],
    bountyTarget: 9,
    bountyCoins: 26,
  },
  enemy_cyber_mantis: {
    kind: 'enemy_cyber_mantis',
    name: 'Louva-a-Deus Neon',
    title: 'Ciborgue de Dados',
    tier: 4,
    baseHp: 3,
    baseSpeed: 64,
    accent: '#22d3ee',
    element: 'lightning',
    archetype: 'Duelista Relâmpago',
    mechanic: 'Carrega lâminas de plasma e rasga a tela em cortes horizontais velozes.',
    counterTip: 'Salte na vertical durante o carregamento ciano e pise na cabeça.',
    biomes: ['cyber_undercity', 'cyber_grid', 'magnetic_rift', 'jade_bamboo'],
    bountyTarget: 9,
    bountyCoins: 26,
  },
  enemy_nebula_serpent: {
    kind: 'enemy_nebula_serpent',
    name: 'Serpente Nebulosa',
    title: 'Wyrm Cósmico',
    tier: 5,
    baseHp: 4,
    baseSpeed: 48,
    accent: '#a5b4fc',
    element: 'astral',
    archetype: 'Serpente Orbital',
    mechanic: 'Ondula pelo ar disparando feixes sinusoidais e orbes estelares.',
    counterTip: 'Combine dano elemental diferente para detonar Reações Astrais.',
    biomes: ['orbital_nexus', 'void_nebula', 'astral_library', 'void_gate'],
    bountyTarget: 10,
    bountyCoins: 30,
  },
  enemy_starlight_templar: {
    kind: 'enemy_starlight_templar',
    name: 'Templário Estelar',
    title: 'Escudo do Partenon',
    tier: 5,
    baseHp: 5,
    baseSpeed: 36,
    accent: '#fde68a',
    element: 'light',
    archetype: 'Paladino de Élite',
    mechanic: 'Invoca ondas sagradas em anel e lança dardos dourados guiados.',
    counterTip: 'Quebre a guarda com habilidades [Q] ou ataques em sequência.',
    biomes: ['celestial_marble', 'seraph_citadel', 'solar_corona', 'cloud_monastery'],
    bountyTarget: 10,
    bountyCoins: 32,
  },
  enemy_void_beholder: {
    kind: 'enemy_void_beholder',
    name: 'Observador do Vazio',
    title: 'Olho Dimensional',
    tier: 5,
    baseHp: 4,
    baseSpeed: 28,
    accent: '#d580ff',
    element: 'shadow',
    archetype: 'Artilheiro de Feixes',
    mechanic: 'Dispara raios em X com aviso prévio que varrem plataformas próximas.',
    counterTip: 'Saia das linhas pontilhadas violetas antes do disparo.',
    biomes: ['astral_void', 'mirror_labyrinth', 'prism_sanctum', 'obsidian_labyrinth'],
    bountyTarget: 10,
    bountyCoins: 30,
  },
  enemy_ether_seraph: {
    kind: 'enemy_ether_seraph',
    name: 'Serafim de Sakura',
    title: 'Lâmina Celeste',
    tier: 5,
    baseHp: 4,
    baseSpeed: 50,
    accent: '#ff70a6',
    element: 'wind',
    archetype: 'Anjo Acrobata',
    mechanic: 'Paira sobre as plataformas arremessando pétalas cortantes em leque de 5 pontas.',
    counterTip: 'Use o escudo do Dash ou habilidades de área para limpar as pétalas.',
    biomes: ['crimson_sakura', 'twilight_garden', 'lunar_bastion', 'hellglass_cathedral'],
    bountyTarget: 10,
    bountyCoins: 32,
  },
  enemy_eclipse_reaver: {
    kind: 'enemy_eclipse_reaver',
    name: 'Algoz do Eclipse',
    title: 'Cavaleiro Rubro',
    tier: 5,
    baseHp: 5,
    baseSpeed: 52,
    accent: '#ff3864',
    element: 'shadow',
    archetype: 'Vanguarda Abissal',
    mechanic: 'Alterna investidas sombrias com ondas de choque carmesim ao redor.',
    counterTip: 'Mantenha distância durante o pulso e contra-ataque na recuperação.',
    biomes: ['blood_eclipse', 'abyss_throne', 'wailing_spires', 'acheron_gorge'],
    bountyTarget: 10,
    bountyCoins: 34,
  },
  enemy_eternity_warden: {
    kind: 'enemy_eternity_warden',
    name: 'Guardião da Eternidade',
    title: 'Sentinela Apex',
    tier: 5,
    baseHp: 6,
    baseSpeed: 44,
    accent: '#ffd27d',
    element: 'astral',
    archetype: 'Guardião Supremo',
    mechanic: 'Manipula fendas temporais disparando 6 orbes em espiral e raios verticais.',
    counterTip: 'Use [U] Golpe da Alma e Reações Elementais para abatê-lo rapidamente.',
    biomes: ['stormcrown', 'chrono_paradox', 'crystal_singularity', 'eternity_apex', 'pandemonium_citadel'],
    bountyTarget: 10,
    bountyCoins: 38,
  },
};

export interface PixelSpriteSpec {
  palette: Record<string, string>;
  frames: string[][];
}

// Detailed 14x14 multi-frame pixel-art sprites for every exclusive biome enemy
export const EXCLUSIVE_ENEMY_SPRITES: Record<ExclusiveEnemyKind, PixelSpriteSpec> = {
  enemy_ash_hound: {
    palette: { o: '#0c0812', a: '#e8a87c', d: '#753c2a', f: '#ff6622', y: '#ffe066', e: '#ffffff' },
    frames: [
      [
        '..oo......oo..',
        '.oaaaooooaao..',
        '.oadddddddao..',
        '.oddaeeedddo..',
        '..odddffddoo..',
        '.oaaaaaaaaaao.',
        'ofaaaddddaaao.',
        'oyoaadddddaao.',
        '..oaaaddddao..',
        '..oad.oo.ado..',
        '..odd....ddo..',
        '..oo......oo..',
        '..............',
        '..............',
      ],
      [
        '..oo......oo..',
        '.oaaaooooaao..',
        '.oadddddddao..',
        '.oddaeeedddo..',
        '..odddffddoo..',
        '.oaaaaaaaaaao.',
        'oyaaaddddaaao.',
        'ofoaadddddaao.',
        '..oaaaddddao..',
        '.oad..oo..ado.',
        '.odd......ddo.',
        '.oo........oo.',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_mycelium_sporeling: {
    palette: { o: '#051214', g: '#4df0c0', l: '#b8ffea', d: '#146956', s: '#dcece6', e: '#07050d' },
    frames: [
      [
        '....oooooo....',
        '..oogllllgoo..',
        '.ogglgggglggo.',
        'ogggggllgggggo',
        'ogddddddddddgo',
        '.oooooooooooo.',
        '...osssssso...',
        '...oseeesoo...',
        '...osssssso...',
        '...osssddso...',
        '....os..so....',
        '....oo..oo....',
        '..............',
        '..............',
      ],
      [
        '..............',
        '....oooooo....',
        '..oogllllgoo..',
        '.ogglgggglggo.',
        'ogggggllgggggo',
        'ogddddddddddgo',
        '.oooooooooooo.',
        '..osssssssso..',
        '..oseeeessoo..',
        '...osssssso...',
        '...os....so...',
        '...oo....oo...',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_glacial_golem: {
    palette: { o: '#061020', c: '#7ce8ff', l: '#e6fbff', d: '#28568a', e: '#ffe066', s: '#4c88c4' },
    frames: [
      [
        '...oooooooo...',
        '..occllllcco..',
        '.occcccccccco.',
        '.ocdccccccdco.',
        'oocdddeedddcoo',
        'ocssccccccssso',
        'ocssscddcsssso',
        'ocssddddddssso',
        '.oossddddssoo.',
        '..ossddddsso..',
        '..odd....ddo..',
        '..ooo....ooo..',
        '..............',
        '..............',
      ],
      [
        '..oooooooooo..',
        '.occlllllccco.',
        '.occcccccccco.',
        'oocdccccccdcoo',
        'oocdddeedddcoo',
        'ocssccccccssso',
        'ocssscddcsssso',
        '.ossddddddssso',
        '.oossddddssoo.',
        '..ossddddsso..',
        '.odd......ddo.',
        '.ooo......ooo.',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_abyssal_nautilus: {
    palette: { o: '#041220', c: '#4de1ff', l: '#b8f7ff', d: '#164d6e', g: '#ffd27d', p: '#ff70a6' },
    frames: [
      [
        '...oooooooo...',
        '..olccccccco..',
        '.olccddddccco.',
        '.occdggddccdo.',
        'ooccdgdddccddo',
        'occcccccccdddo',
        '.ooddddddddoo.',
        '..opppccpppo..',
        '.opp.opp.ppo..',
        '.oo...oo..oo..',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
      [
        '...oooooooo...',
        '..olccccccco..',
        '.olccddddccco.',
        '.occdggddccdo.',
        'ooccdgdddccddo',
        'occcccccccdddo',
        '.ooddddddddoo.',
        '..occppppcco..',
        '..op..oo..po..',
        '..oo......oo..',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_cinder_sentinel: {
    palette: { o: '#140507', a: '#ff7733', y: '#ffe066', d: '#5c1914', s: '#8f3024', w: '#ffffff' },
    frames: [
      [
        '....oooooo....',
        '...oyaaaayo...',
        '..oaaddddaao..',
        '.oaddawwaddao.',
        '.oasdddddddsso',
        'oaaassssaaaao.',
        'oyyaaddddaayyo',
        '.oaaddddddaao.',
        '..ooddddddoo..',
        '...oy..yy.yo..',
        '....a..aa..a..',
        '..............',
        '..............',
        '..............',
      ],
      [
        '...oooooooo...',
        '..oyaaaaaayo..',
        '..oaaddddaao..',
        '.oaddawwaddao.',
        'oassddddddssso',
        '.oaaassssaaaao',
        '.oyyaaddddaayo',
        '..oaadddddaao.',
        '..ooddddddoo..',
        '..oy..yy..yo..',
        '...a..aa..a...',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_dune_scorpion: {
    palette: { o: '#160b04', g: '#fbbf24', y: '#fef08a', d: '#854d0e', r: '#ef4444', e: '#ffffff' },
    frames: [
      [
        '.........ooo..',
        '........ogryo.',
        '........oggdo.',
        '..ooo...ogdo..',
        '.oggyooogddo..',
        'ogdeedddddggo.',
        'ogggggggggddo.',
        '.oodddddddoo..',
        '.og.og..og.oo.',
        'og..og..og..go',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
      [
        '........ooo...',
        '.......ogryo..',
        '.......oggdo..',
        '..ooo..ogdo...',
        '.oggyoogddo...',
        'ogdeedddddggo.',
        'ogggggggggddo.',
        '.oodddddddoo..',
        'og..og..og..go',
        '.oo..oo..oo...',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_crypt_reaper: {
    palette: { o: '#080312', v: '#c084fc', d: '#3b0764', l: '#f3e8ff', c: '#5eead4', e: '#ff3864' },
    frames: [
      [
        '....oooooo....',
        '...oddddddo...',
        '..odddvvdddo..',
        '..oddeeedddo..',
        '..oddddddddo..',
        '.oovvvvvvvvooo',
        'olccvvvvvvdcdo',
        'ol..oddddooddo',
        '....oddddo..o.',
        '....oddddo....',
        '...ovd..dvo...',
        '...oo....oo...',
        '..............',
        '..............',
      ],
      [
        '....oooooo....',
        '...oddddddo...',
        '..odddvvdddo..',
        '..oddeeedddo..',
        '..oddddddddo..',
        'ooovvvvvvvvo..',
        'olccvvvvvvdco.',
        '.o..oddddoodo.',
        '....oddddo....',
        '...ovddddvo...',
        '...od....do...',
        '...oo....oo...',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_plague_chemist: {
    palette: { o: '#061412', t: '#2dd4bf', g: '#a3e635', d: '#134e4a', m: '#94a3b8', y: '#fde047' },
    frames: [
      [
        '...oooooooo...',
        '..oddddddddo..',
        '.oodddddddddo.',
        '..ommmmmmmmo..',
        '..omyooooymo..',
        '..oddddddddo..',
        '.otttttttttto.',
        'oggtddddddttgo',
        'ogotddddddtogo',
        '.o.oddddddo.o.',
        '...od....do...',
        '...oo....oo...',
        '..............',
        '..............',
      ],
      [
        '...oooooooo...',
        '..oddddddddo..',
        '.oodddddddddo.',
        '..ommmmmmmmo..',
        '..omyooooymo..',
        '..oddddddddo..',
        '.otttttttttto.',
        'oygtddddddtgyo',
        '.ootddddddtoo.',
        '...oddddddo...',
        '...od....do...',
        '...oo....oo...',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_gear_colossus: {
    palette: { o: '#100a06', g: '#ffb84d', y: '#fff3b0', d: '#66411b', s: '#94a3b8', c: '#38bdf8' },
    frames: [
      [
        '..oo..oo..oo..',
        '.oggoggoggoggo',
        '..ogggggggggo.',
        'ooggdccccdggoo',
        '.ogsdccccdsgo.',
        'oggddddddddggo',
        'ogdyyyyyyyydgo',
        '.ogddddddddgo.',
        '..ogdd..ddgo..',
        '..ogg....ggo..',
        '..ooo....ooo..',
        '..............',
        '..............',
        '..............',
      ],
      [
        '.oo...oo...oo.',
        'ogg..oggo..ggo',
        '..ogggggggggo.',
        'ooggdccccdggoo',
        '.ogsdccccdsgo.',
        'oggddddddddggo',
        'ogdyyyyyyyydgo',
        '.ogddddddddgo.',
        '..ogdd..ddgo..',
        '..odd....ddo..',
        '..ooo....ooo..',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_cyber_mantis: {
    palette: { o: '#020814', c: '#22d3ee', w: '#ffffff', d: '#0f2d4f', m: '#f472b6', g: '#4df0c0' },
    frames: [
      [
        '.oo........oo.',
        '.occoooooocco.',
        '..ocddddddco..',
        '..odmmwwmmdo..',
        'ooccccccccccoo',
        'owwcddddddcwwo',
        'o..oddddddo..o',
        '...occcccco...',
        '..occ....cco..',
        '.occ......cco.',
        '.oo........oo.',
        '..............',
        '..............',
        '..............',
      ],
      [
        '..oo......oo..',
        '..occoooocco..',
        '..ocddddddco..',
        '..odmmwwmmdo..',
        '.ooccccccccoo.',
        'owwccccccccwwo',
        '.o.oddddddo.o.',
        '...occcccco...',
        '..od......do..',
        '.od........do.',
        '.oo........oo.',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_nebula_serpent: {
    palette: { o: '#050414', i: '#a5b4fc', w: '#ffffff', d: '#312e81', c: '#38bdf8', y: '#fde047' },
    frames: [
      [
        '....oooooo....',
        '..ooiiwwiioo..',
        '.oiiiddddiico.',
        '.oiiyyyyiiico.',
        '..oooddddiico.',
        '....oiicciio..',
        '..ooiiddiiio..',
        '.oiiiddddiio..',
        '.oiicciiiooo..',
        '..ooooo.......',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
      [
        '....oooooo....',
        '..ooiiwwiioo..',
        '.oiiiddddiico.',
        '.oiiyyyyiiico.',
        '..oooddddiico.',
        '...ooiicciio..',
        '..oiiiddiiio..',
        '..oiiddddiio..',
        '...ooicciio...',
        '.....ooooo....',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_starlight_templar: {
    palette: { o: '#100c14', g: '#fde68a', w: '#ffffff', d: '#785a1a', s: '#cbd5e1', c: '#60a5fa' },
    frames: [
      [
        '....ooggoo....',
        '...ogwwwwgo...',
        '...osssssso...',
        '..osdcccdssso.',
        '..ossssssssso.',
        '.ooggggggggoo.',
        'ogwwsggggswwgo',
        'ogccsggggsccgo',
        '.ossddddddssso',
        '..osdd..ddso..',
        '..odd....ddo..',
        '..ooo....ooo..',
        '..............',
        '..............',
      ],
      [
        '....ooggoo....',
        '...ogwwwwgo...',
        '...osssssso...',
        '..osdcccdssso.',
        '..ossssssssso.',
        '.ooggggggggoo.',
        'ogwwsggggswwgo',
        'ogccsggggsccgo',
        '.ossddddddssso',
        '..osdd..ddso..',
        '.odd......ddo.',
        '.ooo......ooo.',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_void_beholder: {
    palette: { o: '#060210', v: '#d580ff', w: '#ffffff', d: '#3b0a6e', r: '#ff3864', c: '#52e5ff' },
    frames: [
      [
        '.oo...oo...oo.',
        '.ovoooooooovo.',
        '..ovvvvvvvvo..',
        '.ovvddddddvvo.',
        '.ovdwwwwwwdvo.',
        '.ovdwrrrrwdvo.',
        '.ovdwwwwwwdvo.',
        '.ovvddddddvvo.',
        '..ovvvvvvvvo..',
        '.ov.ov..vo.vo.',
        'oo..oo..oo..oo',
        '..............',
        '..............',
        '..............',
      ],
      [
        'oo....oo....oo',
        '.ovoooooooovo.',
        '..ovvvvvvvvo..',
        '.ovvddddddvvo.',
        '.ovdwwwwwwdvo.',
        '.ovdwccccwdvo.',
        '.ovdwwwwwwdvo.',
        '.ovvddddddvvo.',
        '..ovvvvvvvvo..',
        '.ov..ovvo..vo.',
        'oo...oooo...oo',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_ether_seraph: {
    palette: { o: '#140610', p: '#ff70a6', w: '#ffffff', l: '#ffd1dc', g: '#ffd27d', d: '#831843' },
    frames: [
      [
        '....oggggo....',
        '.oo.ollllo.oo.',
        'owwooppppoowwo',
        'ollwopddpowllo',
        '.olwopwwpowlo.',
        '..oooppppooo..',
        '....opggpo....',
        '....opddpo....',
        '...opddddpo...',
        '...ol....lo...',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
      [
        '....oggggo....',
        'ooo.ollllo.ooo',
        'ollwoppppowllo',
        'owwoopddpowwwo',
        '..ooopwwpooo..',
        '....oppppo....',
        '....opggpo....',
        '....opddpo....',
        '...opddddpo...',
        '...ol....lo...',
        '..............',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_eclipse_reaver: {
    palette: { o: '#0d0308', r: '#ff3864', d: '#580d22', y: '#ffe066', s: '#33293a', w: '#ffffff' },
    frames: [
      [
        '..oo......oo..',
        '.orroooooorro.',
        '..orddddddro..',
        '..ordywwydro..',
        '..orrrrrrrro..',
        '.oossssssssoo.',
        'orrssrrrrssrr.',
        'owdssrrrrssdwo',
        '..ossddddsso..',
        '..osd....dso..',
        '..orr....rro..',
        '..ooo....ooo..',
        '..............',
        '..............',
      ],
      [
        '..oo......oo..',
        '.orroooooorro.',
        '..orddddddro..',
        '..ordywwydro..',
        '..orrrrrrrro..',
        '.oossssssssoo.',
        'owwssrrrrsswwo',
        '.odssrrrrssdo.',
        '..ossddddsso..',
        '.osd......dso.',
        '.orr......rro.',
        '.ooo......ooo.',
        '..............',
        '..............',
      ],
    ],
  },
  enemy_eternity_warden: {
    palette: { o: '#080512', g: '#ffd27d', w: '#ffffff', c: '#52e5ff', v: '#c084fc', d: '#2d1c4d' },
    frames: [
      [
        '...oooggooo...',
        '..ogwwwwwwgo..',
        '.ooggccccggoo.',
        '.ogdccccccdgo.',
        'oogddddddddgoo',
        'ocvggggggggvco',
        'ocvvddddddvvco',
        '.oogddddddgoo.',
        '...oggggggo...',
        '..ogg....ggo..',
        '..ow......wo..',
        '..............',
        '..............',
        '..............',
      ],
      [
        '...oooggooo...',
        '..ogccccccgo..',
        '.ooggwwwwggoo.',
        '.ogdccccccdgo.',
        'oogddddddddgoo',
        'ogvggggggggvgo',
        'ogvvddddddvvgo',
        '.oogddddddgoo.',
        '...oggggggo...',
        '..ocg....gco..',
        '..ow......wo..',
        '..............',
        '..............',
        '..............',
      ],
    ],
  },
};

export const EXCLUSIVE_ENEMY_BESTIARY: EnemyBestiaryEntry[] = EXCLUSIVE_ENEMY_KINDS.map((kind) => {
  const m = EXCLUSIVE_ENEMY_META[kind];
  return {
    kind: m.kind,
    name: m.name,
    archetype: `${m.archetype} (Nível ${m.tier})`,
    mechanic: m.mechanic,
    counterTip: m.counterTip,
    accent: m.accent,
    bountyTarget: m.bountyTarget,
    bountyCoins: m.bountyCoins,
  };
});

/** Picks 2 signature exclusive enemies appropriate for a given biome + chapter progression. */
export function pickExclusiveEnemiesForBiome(biome: AnyBiomeId, chapterIndex: number): [ExclusiveEnemyKind, ExclusiveEnemyKind] {
  const matches = EXCLUSIVE_ENEMY_KINDS.filter((k) => EXCLUSIVE_ENEMY_META[k].biomes.includes(biome));
  if (matches.length >= 2) {
    return [matches[0], matches[1]];
  }
  if (matches.length === 1) {
    const tierTarget = Math.min(5, Math.max(1, 1 + Math.floor(chapterIndex / 10)));
    const fallback =
      EXCLUSIVE_ENEMY_KINDS.find((k) => k !== matches[0] && EXCLUSIVE_ENEMY_META[k].tier === tierTarget) ??
      EXCLUSIVE_ENEMY_KINDS[(chapterIndex + 3) % EXCLUSIVE_ENEMY_KINDS.length];
    return [matches[0], fallback];
  }
  const idxA = chapterIndex % EXCLUSIVE_ENEMY_KINDS.length;
  const idxB = (chapterIndex + 5) % EXCLUSIVE_ENEMY_KINDS.length;
  return [EXCLUSIVE_ENEMY_KINDS[idxA], EXCLUSIVE_ENEMY_KINDS[idxB]];
}

/** Computes progressive HP scaling for an enemy based on chapter & room depth inside up to 20-room phase. */
export function computeProgressiveEnemyHp(
  baseHp: number,
  chapterIndex: number,
  stageIndex: number,
  totalStagesInChapter: number
): number {
  const chScale = Math.floor(chapterIndex / 12); // +1..+4 across 50 chapters
  const roomRatio = totalStagesInChapter > 1 ? stageIndex / (totalStagesInChapter - 1) : 0;
  const depthScale = roomRatio >= 0.72 ? 2 : roomRatio >= 0.35 ? 1 : 0;
  return Math.max(1, baseHp + chScale + depthScale);
}

export interface ExclusiveEnemyLiveRef {
  def: { kind: string; patrolDist?: number };
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
  timer: number;
  cooldown: number;
  state: string;
  dir: 1 | -1;
  aimX?: number;
  aimY?: number;
  attackIdx?: number;
}

export interface ExclusiveEnemyHelpers {
  spawnProjectile: (x: number, y: number, vx: number, vy: number, color: string, gravity?: number, pierceWalls?: boolean) => void;
  spawnShockwave: (x: number, y: number, maxRadius: number, color: string, duration?: number) => void;
  spawnHazardBeam: (x1: number, y1: number, x2: number, y2: number, width: number, color: string, telegraphSec?: number, activeSec?: number) => void;
  burstParticles: (x: number, y: number, count: number, color: string, speed?: number) => void;
}

/** Steps AI for all 16 exclusive biome enemy archetypes. */
export function stepExclusiveEnemyAI(
  e: ExclusiveEnemyLiveRef,
  player: { x: number; y: number; w: number; h: number; facing: 1 | -1 },
  room: RoomDef,
  enemyDt: number,
  helpers: ExclusiveEnemyHelpers
): boolean {
  const kind = e.def.kind as ExclusiveEnemyKind;
  if (!(kind in EXCLUSIVE_ENEMY_META)) return false;

  const meta = EXCLUSIVE_ENEMY_META[kind];
  const patrol = e.def.patrolDist ?? 28;
  const cx = e.x + e.w * 0.5;
  const cy = e.y + e.h * 0.5;
  const px = player.x + player.w * 0.5;
  const py = player.y + player.h * 0.5;
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const maxX = (room.cols - 3) * TILE_SIZE;
  const maxY = (room.rows - 4) * TILE_SIZE;

  switch (kind) {
    case 'enemy_ash_hound': {
      if (e.state === 'idle') {
        e.x += e.dir * meta.baseSpeed * 0.65 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && dist < 105 && Math.abs(dy) < 24) {
          e.dir = dx < 0 ? -1 : 1;
          e.state = 'windup';
          e.timer = 0.34;
        }
      } else if (e.state === 'windup') {
        e.timer -= enemyDt;
        if (e.timer <= 0) {
          e.state = 'active';
          e.timer = 0.35;
          helpers.burstParticles(cx, cy, 8, meta.accent, 75);
        }
      } else {
        e.timer -= enemyDt;
        e.x = Math.max(16, Math.min(maxX, e.x + e.dir * 135 * enemyDt));
        if (e.timer <= 0) {
          e.state = 'idle';
          e.cooldown = 1.9;
        }
      }
      return true;
    }

    case 'enemy_mycelium_sporeling': {
      if (e.state === 'idle') {
        e.dir = dx < 0 ? -1 : 1;
        if (e.cooldown <= 0 && dist < 120) {
          e.state = 'active';
          e.vx = e.dir * 48;
          e.vy = -128;
        }
      } else {
        e.vy += 310 * enemyDt;
        e.x = Math.max(16, Math.min(maxX, e.x + e.vx * enemyDt));
        e.y += e.vy * enemyDt;
        if (e.y >= e.homeY) {
          e.y = e.homeY;
          e.vx = 0;
          e.vy = 0;
          e.state = 'idle';
          e.cooldown = 1.65;
          helpers.spawnProjectile(cx, cy, -52, -78, meta.accent, 175, false);
          helpers.spawnProjectile(cx, cy, 52, -78, meta.accent, 175, false);
        }
      }
      return true;
    }

    case 'enemy_glacial_golem': {
      if (e.state === 'idle') {
        e.x += e.dir * meta.baseSpeed * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && dist < 110) {
          e.state = 'windup';
          e.timer = 0.55;
        }
      } else if (e.state === 'windup') {
        e.timer -= enemyDt;
        if (e.timer <= 0) {
          helpers.spawnShockwave(cx, cy + 4, 24, meta.accent, 0.25);
          helpers.spawnProjectile(cx, cy + 3, -118, 0, meta.accent, 0, false);
          helpers.spawnProjectile(cx, cy + 3, 118, 0, meta.accent, 0, false);
          e.state = 'idle';
          e.cooldown = 2.4;
        }
      }
      return true;
    }

    case 'enemy_abyssal_nautilus': {
      e.timer += enemyDt;
      e.x = e.homeX + Math.cos(e.timer * 2.1) * 22;
      e.y = e.homeY + Math.sin(e.timer * 3.0) * 10;
      e.dir = dx < 0 ? -1 : 1;
      if (e.cooldown <= 0 && dist < 135) {
        for (let k = 0; k < 4; k++) {
          const a = (Math.PI * 2 * k) / 4 + ((e.attackIdx ?? 0) % 2) * (Math.PI / 4);
          helpers.spawnProjectile(cx, cy, Math.cos(a) * 92, Math.sin(a) * 92, meta.accent, 0, false);
        }
        e.attackIdx = (e.attackIdx ?? 0) + 1;
        e.cooldown = 2.15;
      }
      return true;
    }

    case 'enemy_cinder_sentinel': {
      e.timer += enemyDt;
      e.y = e.homeY + Math.sin(e.timer * 2.3) * 6;
      e.dir = dx < 0 ? -1 : 1;
      if (e.state === 'idle' && e.cooldown <= 0 && dist < 145) {
        e.state = 'windup';
        e.timer = 0.45;
      } else if (e.state === 'windup') {
        e.timer -= enemyDt;
        if (e.timer <= 0) {
          const ang = Math.atan2(dy, dx);
          for (let k = -1; k <= 1; k++) {
            helpers.spawnProjectile(cx, cy, Math.cos(ang + k * 0.22) * 116, Math.sin(ang + k * 0.22) * 116, meta.accent, 0, false);
          }
          e.state = 'idle';
          e.cooldown = 2.2;
        }
      }
      return true;
    }

    case 'enemy_dune_scorpion': {
      if (e.state === 'idle') {
        e.x += e.dir * meta.baseSpeed * 0.6 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && dist < 130) {
          e.dir = dx < 0 ? -1 : 1;
          helpers.spawnProjectile(cx, cy - 2, e.dir * 86, -110, meta.accent, 195, false);
          e.cooldown = 1.95;
        }
      }
      return true;
    }

    case 'enemy_crypt_reaper': {
      e.dir = dx < 0 ? -1 : 1;
      if (e.state === 'idle' && e.cooldown <= 0 && dist < 135) {
        e.state = 'windup';
        e.timer = 0.5;
        e.aimX = Math.max(20, Math.min(maxX, player.x - player.facing * 26));
        e.aimY = Math.max(20, Math.min(maxY, player.y - 6));
        helpers.spawnShockwave(e.aimX + 6, e.aimY + 6, 16, meta.accent, 0.4);
      } else if (e.state === 'windup') {
        e.timer -= enemyDt;
        if (e.timer <= 0) {
          e.x = e.aimX ?? e.x;
          e.y = e.aimY ?? e.y;
          const ang = Math.atan2(player.y + 5 - (e.y + 6), player.x + 4 - (e.x + 6));
          helpers.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang) * 130, Math.sin(ang) * 130, meta.accent, 0, false);
          e.state = 'idle';
          e.cooldown = 2.4;
        }
      }
      return true;
    }

    case 'enemy_plague_chemist': {
      e.dir = dx < 0 ? -1 : 1;
      if (e.cooldown <= 0 && dist < 145) {
        helpers.spawnProjectile(cx, cy - 2, e.dir * 68, -135, meta.accent, 210, false);
        helpers.spawnProjectile(cx, cy - 2, e.dir * 45, -108, '#a3e635', 210, false);
        e.cooldown = 2.2;
      }
      return true;
    }

    case 'enemy_gear_colossus': {
      e.x += e.dir * meta.baseSpeed * enemyDt;
      if (e.x > e.homeX + patrol) e.dir = -1;
      if (e.x < e.homeX - patrol) e.dir = 1;
      if (e.cooldown <= 0 && dist < 140) {
        const dP = dx < 0 ? -1 : 1;
        helpers.spawnProjectile(cx, cy, dP * 115, 0, meta.accent, 0, false);
        helpers.spawnProjectile(cx, cy, dP * 92, -48, '#fde047', 65, false);
        e.cooldown = 2.1;
      }
      return true;
    }

    case 'enemy_cyber_mantis': {
      if (e.state === 'idle') {
        e.x += e.dir * 44 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.abs(dy) < 20 && Math.abs(dx) < 92) {
          e.dir = dx < 0 ? -1 : 1;
          e.state = 'windup';
          e.timer = 0.34;
        }
      } else if (e.state === 'windup') {
        e.timer -= enemyDt;
        if (e.timer <= 0) {
          e.state = 'active';
          e.timer = 0.26;
          helpers.spawnProjectile(cx, cy, e.dir * 145, 0, meta.accent, 0, false);
        }
      } else {
        e.timer -= enemyDt;
        e.x = Math.max(16, Math.min(maxX, e.x + e.dir * 165 * enemyDt));
        if (e.timer <= 0) {
          e.state = 'idle';
          e.cooldown = 1.95;
        }
      }
      return true;
    }

    case 'enemy_nebula_serpent': {
      e.timer += enemyDt;
      e.x = e.homeX + Math.sin(e.timer * 2.2) * 30;
      e.y = e.homeY + Math.sin(e.timer * 4.4) * 11;
      e.dir = dx < 0 ? -1 : 1;
      if (e.cooldown <= 0 && dist < 145) {
        const ang = Math.atan2(dy, dx);
        helpers.spawnProjectile(cx, cy, Math.cos(ang - 0.14) * 124, Math.sin(ang - 0.14) * 124, meta.accent, 0, false);
        helpers.spawnProjectile(cx, cy, Math.cos(ang + 0.14) * 124, Math.sin(ang + 0.14) * 124, '#38bdf8', 0, false);
        e.cooldown = 2.0;
      }
      return true;
    }

    case 'enemy_starlight_templar': {
      e.x += e.dir * meta.baseSpeed * enemyDt;
      if (e.x > e.homeX + patrol) e.dir = -1;
      if (e.x < e.homeX - patrol) e.dir = 1;
      if (e.cooldown <= 0 && dist < 135) {
        helpers.spawnShockwave(cx, cy, 26, meta.accent, 0.26);
        const ang = Math.atan2(dy, dx);
        helpers.spawnProjectile(cx, cy, Math.cos(ang) * 132, Math.sin(ang) * 132, meta.accent, 0, false);
        e.cooldown = 2.1;
      }
      return true;
    }

    case 'enemy_void_beholder': {
      e.timer += enemyDt;
      e.y = e.homeY + Math.sin(e.timer * 2.0) * 6;
      e.dir = dx < 0 ? -1 : 1;
      if (e.state === 'idle' && e.cooldown <= 0 && dist < 145) {
        e.state = 'windup';
        e.timer = 0.6;
        helpers.spawnHazardBeam(cx - 80, cy - 60, cx + 80, cy + 60, 7, meta.accent, 0.6, 0.3);
        helpers.spawnHazardBeam(cx + 80, cy - 60, cx - 80, cy + 60, 7, meta.accent, 0.6, 0.3);
      } else if (e.state === 'windup') {
        e.timer -= enemyDt;
        if (e.timer <= 0) {
          e.state = 'idle';
          e.cooldown = 2.55;
        }
      }
      return true;
    }

    case 'enemy_ether_seraph': {
      e.timer += enemyDt;
      e.x = e.homeX + Math.cos(e.timer * 2.0) * 26;
      e.y = e.homeY + Math.sin(e.timer * 3.2) * 10;
      e.dir = dx < 0 ? -1 : 1;
      if (e.cooldown <= 0 && dist < 145) {
        const ang = Math.atan2(dy, dx);
        for (let k = -2; k <= 2; k++) {
          helpers.spawnProjectile(cx, cy, Math.cos(ang + k * 0.2) * 110, Math.sin(ang + k * 0.2) * 110, meta.accent, 0, false);
        }
        e.cooldown = 2.25;
      }
      return true;
    }

    case 'enemy_eclipse_reaver': {
      e.x += e.dir * 38 * enemyDt;
      if (e.x > e.homeX + patrol) e.dir = -1;
      if (e.x < e.homeX - patrol) e.dir = 1;
      if (e.cooldown <= 0 && dist < 130) {
        const dP = dx < 0 ? -1 : 1;
        helpers.spawnShockwave(cx, cy, 24, meta.accent, 0.25);
        helpers.spawnProjectile(cx, cy, dP * 138, 0, meta.accent, 0, true);
        helpers.spawnProjectile(cx, cy, -dP * 110, 0, '#ffe066', 0, false);
        e.cooldown = 2.0;
      }
      return true;
    }

    case 'enemy_eternity_warden': {
      e.timer += enemyDt;
      e.y = e.homeY + Math.sin(e.timer * 2.1) * 7;
      e.dir = dx < 0 ? -1 : 1;
      if (e.cooldown <= 0 && dist < 150) {
        const rot = ((e.attackIdx ?? 0) * Math.PI) / 6;
        for (let k = 0; k < 6; k++) {
          const a = rot + (Math.PI * 2 * k) / 6;
          helpers.spawnProjectile(cx, cy, Math.cos(a) * 104, Math.sin(a) * 104, k % 2 === 0 ? '#ffd27d' : '#52e5ff', 0, false);
        }
        e.attackIdx = (e.attackIdx ?? 0) + 1;
        e.cooldown = 2.25;
      }
      return true;
    }
  }
}
