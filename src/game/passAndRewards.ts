// @ts-nocheck -- imported game code, written for a looser TS config
import type {
  AuraTrailDef,
  AuraTrailId,
  DailyRewardDef,
  EnemyBestiaryEntry,
  MissionDef,
  PassTierDef,
  StarMilestoneDef,
} from './types';
import { EXCLUSIVE_ENEMY_BESTIARY } from './exclusiveEnemies';

export const PASS_ASTRAL_UNLOCK_COST = 120;
export const PASS_XP_PER_TIER = 100;
export const PASS_MAX_TIER = 40;

export const AURA_TRAILS: AuraTrailDef[] = [
  {
    id: 'none',
    name: 'Sem Trilha',
    desc: 'Rastro clássico padrão do herói selecionado.',
    primaryColor: '#52e5ff',
    secondaryColor: '#ffffff',
    cost: 0,
  },
  {
    id: 'starfire',
    name: 'Fogo Estelar',
    desc: 'Fagulhas douradas e brasas cintilantes a cada salto e dash.',
    primaryColor: '#ffd27d',
    secondaryColor: '#ff7733',
    cost: 45,
  },
  {
    id: 'aurora',
    name: 'Véu da Aurora',
    desc: 'Partículas boreais ciano-esmeralda fluindo atrás do manto.',
    primaryColor: '#4df0c0',
    secondaryColor: '#52e5ff',
    cost: 60,
  },
  {
    id: 'prism_void',
    name: 'Vazio Prismático',
    desc: 'Ecos violetas e centelhas dimensionais durante manobras.',
    primaryColor: '#d580ff',
    secondaryColor: '#f472b6',
    cost: 80,
  },
  {
    id: 'sakura_petals',
    name: 'Pétalas Carmesins',
    desc: 'Pétalas de cerejeira brilhantes que dançam no ar.',
    primaryColor: '#ff5e8e',
    secondaryColor: '#ffd27d',
    cost: 70,
  },
  {
    id: 'solar_gold',
    name: 'Glória Solar',
    desc: 'Coroa radiante de luz áurea e poeira estelar.',
    primaryColor: '#fde047',
    secondaryColor: '#f59e0b',
    cost: 95,
  },
  {
    id: 'frost_crystal',
    name: 'Cristal Glacial',
    desc: 'Flocos de safira e estilhaços criogênicos cintilantes.',
    primaryColor: '#7ce8ff',
    secondaryColor: '#e0f2fe',
    cost: 75,
  },
  {
    id: 'abyss_lightning',
    name: 'Relâmpago Abissal',
    desc: 'Arcos elétricos púrpuras e faíscas de alta voltagem.',
    primaryColor: '#a855f7',
    secondaryColor: '#38bdf8',
    cost: 120,
  },
];

export const AURA_TRAIL_MAP: Record<AuraTrailId, AuraTrailDef> = Object.fromEntries(
  AURA_TRAILS.map((a) => [a.id, a])
) as Record<AuraTrailId, AuraTrailDef>;

export const PASS_TIERS: PassTierDef[] = Array.from({ length: PASS_MAX_TIER }, (_, idx) => {
  const tier = idx + 1;
  const xpRequired = tier * PASS_XP_PER_TIER;

  // Free Track
  let freeReward: PassTierDef['freeReward'];
  if (tier === 5) {
    freeReward = { kind: 'aura_trail', itemId: 'starfire', label: 'Trilha Fogo Estelar', color: '#ffd27d' };
  } else if (tier === 15) {
    freeReward = { kind: 'aura_trail', itemId: 'frost_crystal', label: 'Trilha Cristal Glacial', color: '#7ce8ff' };
  } else if (tier === 25) {
    freeReward = { kind: 'talisman', itemId: 'olho_aguia', label: 'Talismã Olho de Águia', color: '#52e5ff' };
  } else if (tier === 35) {
    freeReward = { kind: 'aura_trail', itemId: 'aurora', label: 'Trilha Véu da Aurora', color: '#4df0c0' };
  } else if (tier === 40) {
    freeReward = { kind: 'chest', amount: 150, label: 'Baú Supremo (150★)', color: '#ffd27d' };
  } else if (tier % 2 === 0) {
    freeReward = { kind: 'mastery_xp', amount: 60 + tier * 5, label: `+${60 + tier * 5} XP Maestria`, color: '#4df0c0' };
  } else {
    freeReward = { kind: 'coins', amount: 15 + tier * 2, label: `+${15 + tier * 2} Moedas ★`, color: '#ffe47a' };
  }

  // Astral Track
  let astralReward: PassTierDef['astralReward'];
  if (tier === 3) {
    astralReward = { kind: 'aura_trail', itemId: 'sakura_petals', label: 'Trilha Pétalas Carmesins', color: '#ff5e8e' };
  } else if (tier === 10) {
    astralReward = { kind: 'talisman', itemId: 'coracao_brasas', label: 'Talismã Coração das Brasas', color: '#fb923c' };
  } else if (tier === 18) {
    astralReward = { kind: 'aura_trail', itemId: 'prism_void', label: 'Trilha Vazio Prismático', color: '#d580ff' };
  } else if (tier === 28) {
    astralReward = { kind: 'aura_trail', itemId: 'solar_gold', label: 'Trilha Glória Solar', color: '#fde047' };
  } else if (tier === 32) {
    astralReward = { kind: 'talisman', itemId: 'coroa_soberana', label: 'Talismã Coroa Soberana', color: '#ffd27d' };
  } else if (tier === 40) {
    astralReward = { kind: 'aura_trail', itemId: 'abyss_lightning', label: 'Trilha Relâmpago Abissal + 250★', amount: 250, color: '#a855f7' };
  } else if (tier % 3 === 0) {
    astralReward = { kind: 'chest', amount: 40 + tier * 3, label: `Baú Astral (+${40 + tier * 3}★)`, color: '#52e5ff' };
  } else if (tier % 2 === 0) {
    astralReward = { kind: 'coins', amount: 28 + tier * 3, label: `+${28 + tier * 3} Moedas ★`, color: '#ffd27d' };
  } else {
    astralReward = { kind: 'mastery_xp', amount: 110 + tier * 8, label: `+${110 + tier * 8} XP Maestria`, color: '#c084fc' };
  }

  return { tier, xpRequired, freeReward, astralReward };
});

export function getPassProgressFromXp(rawXp: number): {
  level: number;
  currentTierXp: number;
  nextTierXp: number;
  progress: number;
} {
  const xp = Math.max(0, Math.floor(rawXp));
  const level = Math.min(PASS_MAX_TIER, Math.floor(xp / PASS_XP_PER_TIER));
  if (level >= PASS_MAX_TIER) {
    return {
      level: PASS_MAX_TIER,
      currentTierXp: PASS_XP_PER_TIER,
      nextTierXp: PASS_XP_PER_TIER,
      progress: 1,
    };
  }
  const currentTierXp = xp % PASS_XP_PER_TIER;
  return {
    level,
    currentTierXp,
    nextTierXp: PASS_XP_PER_TIER,
    progress: currentTierXp / PASS_XP_PER_TIER,
  };
}

export const MISSIONS: MissionDef[] = [
  // Daily Missions
  {
    id: 'daily_enemies_12',
    category: 'daily',
    title: 'Caçador do Crepúsculo',
    desc: 'Derrote 12 inimigos em qualquer modo de jogo.',
    metric: 'enemiesDefeated',
    target: 12,
    passXpReward: 120,
    coinReward: 35,
    masteryXpReward: 80,
    accent: '#ff5c8a',
  },
  {
    id: 'daily_stages_3',
    category: 'daily',
    title: 'Andarilho dos Biomas',
    desc: 'Conclua 3 etapas em qualquer mundo.',
    metric: 'stagesCleared',
    target: 3,
    passXpReward: 140,
    coinReward: 40,
    masteryXpReward: 90,
    accent: '#52e5ff',
  },
  {
    id: 'daily_dashes_25',
    category: 'daily',
    title: 'Passo Relâmpago',
    desc: 'Execute 25 dashes acrobáticos pelas plataformas.',
    metric: 'dashesUsed',
    target: 25,
    passXpReward: 100,
    coinReward: 30,
    masteryXpReward: 70,
    accent: '#4df0c0',
  },
  {
    id: 'daily_dodges_3',
    category: 'daily',
    title: 'Reflexo Espectral',
    desc: 'Realize 3 Esquivas Perfeitas ou Parries.',
    metric: 'perfectDodges',
    target: 3,
    passXpReward: 150,
    coinReward: 45,
    masteryXpReward: 100,
    accent: '#ffd27d',
  },

  // Milestone Missions
  {
    id: 'mile_enemies_50',
    category: 'milestone',
    title: 'Sentinela Implacável',
    desc: 'Derrote 50 inimigos ao longo de sua jornada.',
    metric: 'enemiesDefeated',
    target: 50,
    passXpReward: 240,
    coinReward: 75,
    masteryXpReward: 180,
    accent: '#fb7185',
  },
  {
    id: 'mile_enemies_200',
    category: 'milestone',
    title: 'Flagelo dos Ecos',
    desc: 'Derrote 200 inimigos nos reinos de Aethelgard.',
    metric: 'enemiesDefeated',
    target: 200,
    passXpReward: 480,
    coinReward: 160,
    masteryXpReward: 420,
    accent: '#f43f5e',
  },
  {
    id: 'mile_stages_15',
    category: 'milestone',
    title: 'Explorador das Fronteiras',
    desc: 'Conclua 15 etapas interligadas.',
    metric: 'stagesCleared',
    target: 15,
    passXpReward: 260,
    coinReward: 85,
    masteryXpReward: 200,
    accent: '#38bdf8',
  },
  {
    id: 'mile_stages_60',
    category: 'milestone',
    title: 'Cartógrafo Sideral',
    desc: 'Conclua 60 etapas através dos 50 mundos.',
    metric: 'stagesCleared',
    target: 60,
    passXpReward: 520,
    coinReward: 180,
    masteryXpReward: 460,
    accent: '#818cf8',
  },
  {
    id: 'mile_bosses_5',
    category: 'milestone',
    title: 'Quebrador de Coroas',
    desc: 'Derrote 5 Guardiões Chefões.',
    metric: 'bossesDefeated',
    target: 5,
    passXpReward: 320,
    coinReward: 110,
    masteryXpReward: 250,
    accent: '#fbbf24',
  },
  {
    id: 'mile_bosses_25',
    category: 'milestone',
    title: 'Algoz dos Titãs',
    desc: 'Derrote 25 Guardiões Chefões.',
    metric: 'bossesDefeated',
    target: 25,
    passXpReward: 700,
    coinReward: 260,
    masteryXpReward: 650,
    accent: '#f59e0b',
  },
  {
    id: 'mile_relics_25',
    category: 'milestone',
    title: 'Guardião das Relíquias',
    desc: 'Colete 25 Relíquias do Eco escondidas.',
    metric: 'relicsCollected',
    target: 25,
    passXpReward: 300,
    coinReward: 100,
    masteryXpReward: 240,
    accent: '#ff3864',
  },
  {
    id: 'mile_style_ss_10',
    category: 'milestone',
    title: 'Virtuoso Rank SS',
    desc: 'Alcance o Rank de Estilo SS 10 vezes em combate.',
    metric: 'styleSSCount',
    target: 10,
    passXpReward: 350,
    coinReward: 120,
    masteryXpReward: 300,
    accent: '#e879f9',
  },
];

export const STAR_MILESTONES: StarMilestoneDef[] = [
  { starsRequired: 3, title: 'Centelha Inicial', coinReward: 40, passXpReward: 120, masteryXpReward: 90, accent: '#ffd27d' },
  { starsRequired: 10, title: 'Conquistador do Ato I', coinReward: 80, passXpReward: 220, masteryXpReward: 160, auraUnlock: 'starfire', accent: '#4df0c0' },
  { starsRequired: 25, title: 'Guardião dos Biomas', coinReward: 130, passXpReward: 340, masteryXpReward: 280, accent: '#52e5ff' },
  { starsRequired: 45, title: 'Soberano Elemental', coinReward: 200, passXpReward: 480, masteryXpReward: 420, auraUnlock: 'aurora', accent: '#38bdf8' },
  { starsRequired: 70, title: 'Senhor dos Sonhos', coinReward: 280, passXpReward: 650, masteryXpReward: 600, auraUnlock: 'prism_void', accent: '#c084fc' },
  { starsRequired: 100, title: 'Lenda de Cem Estrelas', coinReward: 380, passXpReward: 850, masteryXpReward: 800, auraUnlock: 'solar_gold', accent: '#fbbf24' },
  { starsRequired: 125, title: 'Arauto da Eternidade', coinReward: 500, passXpReward: 1100, masteryXpReward: 1000, accent: '#fb7185' },
  { starsRequired: 150, title: 'Coroa Absoluta (150★)', coinReward: 800, passXpReward: 1600, masteryXpReward: 1500, auraUnlock: 'abyss_lightning', accent: '#fde047' },
];

export const DAILY_REWARDS: DailyRewardDef[] = [
  { day: 1, label: 'Dia 1 · Sopro Astral', coinReward: 35, passXpReward: 100, masteryXpReward: 60, accent: '#52e5ff' },
  { day: 2, label: 'Dia 2 · Bolsa de Moedas', coinReward: 55, passXpReward: 130, masteryXpReward: 90, accent: '#4df0c0' },
  { day: 3, label: 'Dia 3 · Prisma de Maestria', coinReward: 75, passXpReward: 170, masteryXpReward: 140, accent: '#ffd27d' },
  { day: 4, label: 'Dia 4 · Relicário Brilhante', coinReward: 95, passXpReward: 210, masteryXpReward: 180, accent: '#fb923c' },
  { day: 5, label: 'Dia 5 · Essência do Passe', coinReward: 125, passXpReward: 280, masteryXpReward: 230, accent: '#e879f9' },
  { day: 6, label: 'Dia 6 · Tesouro Real', coinReward: 160, passXpReward: 340, masteryXpReward: 300, accent: '#38bdf8' },
  { day: 7, label: 'Dia 7 · Baú da Coroa', coinReward: 250, passXpReward: 500, masteryXpReward: 500, accent: '#fde047' },
];

export const ENEMY_BESTIARY: EnemyBestiaryEntry[] = [
  // Original 18
  { kind: 'enemy_crawler', name: 'Rastejador de Micélio', archetype: 'Patrulheiro', mechanic: 'Patrulha plataformas e inverte na borda.', counterTip: 'Pise no topo para quicar.', accent: '#4df0c0', bountyTarget: 5, bountyCoins: 18 },
  { kind: 'enemy_wisp', name: 'Fogo-Fátuo Orbital', archetype: 'Flutuante', mechanic: 'Orbita âncoras em trajetória senoidal.', counterTip: 'Dash direto estilhaça a chama.', accent: '#52e5ff', bountyTarget: 5, bountyCoins: 18 },
  { kind: 'enemy_drone', name: 'Drone Sentinela', archetype: 'Atirador', mechanic: 'Mira feixe vermelho antes de atirar.', counterTip: 'Use Dash Parry no projétil.', accent: '#ff5c8a', bountyTarget: 5, bountyCoins: 20 },
  { kind: 'enemy_charger', name: 'Bruto da Forja', archetype: 'Investida', mechanic: 'Prepara carga veloz quando avista o herói.', counterTip: 'Salte por cima após o brilho.', accent: '#ff7733', bountyTarget: 5, bountyCoins: 22 },
  { kind: 'enemy_mortar', name: 'Morteiro de Esporos', archetype: 'Artilharia', mechanic: 'Dispara esporos em arco parabólico.', counterTip: 'Mova-se rápido e pise na cúpula.', accent: '#a7f3d0', bountyTarget: 5, bountyCoins: 20 },
  { kind: 'enemy_mimic', name: 'Mímico do Vazio', archetype: 'Emboscada', mechanic: 'Disfarçado de cristal até aproximação.', counterTip: 'Observe a pulsação violeta.', accent: '#d580ff', bountyTarget: 4, bountyCoins: 24 },
  { kind: 'enemy_golem', name: 'Golem Escudado', archetype: 'Blindado', mechanic: 'Escudo frontal bloqueia dashes diretos.', counterTip: 'Ataque pelas costas ou por cima.', accent: '#e8a87c', bountyTarget: 4, bountyCoins: 25 },
  { kind: 'enemy_saw', name: 'Orbe-Serra Blindado', archetype: 'Armadilha', mechanic: 'Percorre trilhos sem poder ser destruído.', counterTip: 'Desvie no tempo certo.', accent: '#94a3b8', bountyTarget: 0, bountyCoins: 0 },
  { kind: 'enemy_phantom', name: 'Espectro Sombrio', archetype: 'Perseguidor', mechanic: 'Flutua atravessando o ar em busca do alvo.', counterTip: 'Acertar com Dash ou Q.', accent: '#c084fc', bountyTarget: 5, bountyCoins: 22 },
  { kind: 'enemy_slime_king', name: 'Rei Slime Abissal', archetype: 'Saltador', mechanic: 'Saltos altos que liberam gotas ao cair.', counterTip: 'Dois acertos para derrotar.', accent: '#2dd4bf', bountyTarget: 4, bountyCoins: 25 },
  { kind: 'enemy_laser_eye', name: 'Olho Prismático', archetype: 'Sniper', mechanic: 'Carrega disparo de alta velocidade.', counterTip: 'Reflita com Dash Parry.', accent: '#ff2e63', bountyTarget: 5, bountyCoins: 22 },
  { kind: 'enemy_spark_beetle', name: 'Besouro Elétrico', archetype: 'Descarga', mechanic: 'Emite faíscas horizontais duplas.', counterTip: 'Pise entre as descargas.', accent: '#38bdf8', bountyTarget: 5, bountyCoins: 20 },
  { kind: 'enemy_magma_wyrm', name: 'Serpe de Magma', archetype: 'Saltador', mechanic: 'Salta de baixo para cima cuspindo brasas.', counterTip: 'Desvie durante o ápice.', accent: '#fb923c', bountyTarget: 4, bountyCoins: 24 },
  { kind: 'enemy_sand_wraith', name: 'Espectro das Dunas', archetype: 'Atirador', mechanic: 'Dispara leque duplo solar em voo.', counterTip: 'Aproveite o intervalo entre leques.', accent: '#fbbf24', bountyTarget: 5, bountyCoins: 22 },
  { kind: 'enemy_bone_knight', name: 'Cavaleiro de Ossos', archetype: 'Elite', mechanic: 'Armadura pesada com arremesso de lança.', counterTip: 'Precisa de 2 impactos ou Q.', accent: '#d8b4fe', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_alchemist', name: 'Alquimista Errante', archetype: 'Bombardeiro', mechanic: 'Lança frascos ácidos em parábola dupla.', counterTip: 'Aproxime-se rapidamente.', accent: '#2dd4bf', bountyTarget: 5, bountyCoins: 22 },
  { kind: 'enemy_frost_valkyrie', name: 'Valquíria Glacial', archetype: 'Voadora', mechanic: 'Dispara tridente de cristais de gelo.', counterTip: 'Dash diagonal corta os flancos.', accent: '#67e8f9', bountyTarget: 5, bountyCoins: 24 },
  { kind: 'enemy_mirror_orb', name: 'Orbe Espelho', archetype: 'Torreta', mechanic: 'Dispara cruzes rotativas de 4 feixes.', counterTip: 'Alterne ângulo X e +.', accent: '#e879f9', bountyTarget: 5, bountyCoins: 24 },

  // 24 Brand-New Enemies
  { kind: 'enemy_rift_stalker', name: 'Espreitador da Fenda', archetype: 'Teleporte', mechanic: 'Abre uma fenda violeta e se teleporta perto do herói antes do golpe.', counterTip: 'Afaste-se quando o portal pulsar.', accent: '#c084fc', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_cryo_turret', name: 'Torre Criogênica', archetype: 'Artilharia', mechanic: 'Dispara anel glacial e cristais congelantes em sequência.', counterTip: 'Quebre com Dash durante a recarga.', accent: '#7ce8ff', bountyTarget: 4, bountyCoins: 25 },
  { kind: 'enemy_chrono_weaver', name: 'Tecelão Temporal', archetype: 'Controle', mechanic: 'Emite pulso crono e lança bumerangues que retornam.', counterTip: 'Atenção à volta do projétil!', accent: '#fbbf24', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_void_leech', name: 'Sanguessuga do Vazio', archetype: 'Perseguidor', mechanic: 'Acelera em direção ao herói e lança orbes drenantes.', counterTip: 'Elimine antes que feche distância.', accent: '#a855f7', bountyTarget: 5, bountyCoins: 24 },
  { kind: 'enemy_shield_phalanx', name: 'Falange Blindada', archetype: 'Tanque', mechanic: 'Escudo frontal impenetrável; 2 de HP e choque ao bater de frente.', counterTip: 'Flanqueie por trás ou use Skill [Q].', accent: '#94a3b8', bountyTarget: 4, bountyCoins: 30 },
  { kind: 'enemy_chain_tesla', name: 'Bobina Tesla Viva', archetype: 'Elétrico', mechanic: 'Libera descargas em cruz horizontal e vertical ritmadas.', counterTip: 'Observe as faíscas de aviso.', accent: '#38bdf8', bountyTarget: 4, bountyCoins: 26 },
  { kind: 'enemy_spore_splitter', name: 'Fungo Divisor', archetype: 'Enxame', mechanic: 'Salta continuamente e se divide em projéteis-esporo ao morrer.', counterTip: 'Afaste-se logo após derrotá-lo.', accent: '#4ade80', bountyTarget: 5, bountyCoins: 24 },
  { kind: 'enemy_magma_slug', name: 'Lesma Vulcânica', archetype: 'Área', mechanic: 'Patrulha deixando brasas quentes que explodem para cima.', counterTip: 'Evite pisar no rastro incandescente.', accent: '#f97316', bountyTarget: 5, bountyCoins: 24 },
  { kind: 'enemy_prism_cherub', name: 'Querubim Prismático', archetype: 'Voador', mechanic: 'Dispara leque triplo de raios arco-íris em alta cadência.', counterTip: 'Use Parry no projétil central.', accent: '#f472b6', bountyTarget: 4, bountyCoins: 26 },
  { kind: 'enemy_gravity_imp', name: 'Diabrete Gravitacional', archetype: 'Anomalia', mechanic: 'Atrai levemente o jogador e arremessa bombas do vazio.', counterTip: 'Dash cancela a tração gravitacional.', accent: '#818cf8', bountyTarget: 4, bountyCoins: 26 },
  { kind: 'enemy_blade_dancer', name: 'Dançarina das Lâminas', archetype: 'Duelista', mechanic: 'Telegrafa brilho carmesim e desfere corte veloz horizontal.', counterTip: 'Pule assim que os olhos brilharem.', accent: '#fb7185', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_ember_phoenix', name: 'Fênix das Brasas', archetype: 'Voadora', mechanic: 'Mergulha em arco flamejante soltando penas incandescentes.', counterTip: 'Pise no topo após o mergulho.', accent: '#fb923c', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_anchor_brute', name: 'Bruto da Âncora', archetype: 'Pesado', mechanic: 'Bate a âncora no chão criando ondas de choque duplas (2 HP).', counterTip: 'Salte sobre as ondas laterais.', accent: '#22d3ee', bountyTarget: 3, bountyCoins: 32 },
  { kind: 'enemy_echo_assassin', name: 'Assassino do Eco', archetype: 'Furtivo', mechanic: 'Fica translúcido e avança rápido pelas costas.', counterTip: 'Fique atento ao rastro brilhante.', accent: '#e879f9', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_magnet_core', name: 'Núcleo Magnético', archetype: 'Polaridade', mechanic: 'Alterna pulsos de atração e repulsão magnética + faíscas.', counterTip: 'Use o pulso repulsor a seu favor.', accent: '#60a5fa', bountyTarget: 4, bountyCoins: 26 },
  { kind: 'enemy_amber_wasp', name: 'Vespa de Âmbar', archetype: 'Voadora', mechanic: 'Voa em zigue-zague e atira ferrões de resina dourada.', counterTip: 'Ataque no momento da parada.', accent: '#f59e0b', bountyTarget: 5, bountyCoins: 24 },
  { kind: 'enemy_rune_monolith', name: 'Monólito Rúnico', archetype: 'Suporte', mechanic: 'Emite ondas rúnicas expansivas que punem aproximação lenta.', counterTip: 'Quebre com Dash direto ou [Q].', accent: '#34d399', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_tidal_jelly', name: 'Medusa Abissal', archetype: 'Marinha', mechanic: 'Flutua verticalmente liberando anéis de água sônicos.', counterTip: 'Quique na cúpula translúcida.', accent: '#2dd4bf', bountyTarget: 5, bountyCoins: 24 },
  { kind: 'enemy_clock_spider', name: 'Aranha Relógio', archetype: 'Mecânica', mechanic: 'Corre rapidamente e dispara engrenagens dentadas.', counterTip: 'Pise ou use Dash lateral.', accent: '#eab308', bountyTarget: 5, bountyCoins: 25 },
  { kind: 'enemy_solar_acolyte', name: 'Acólito Solar', archetype: 'Mago', mechanic: 'Invoca pilares verticais de luz telegrafados no solo.', counterTip: 'Saia da coluna brilhante a tempo.', accent: '#fde047', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_shadow_hook', name: 'Arpoador Sombrio', archetype: 'Sniper', mechanic: 'Dispara arpões sombrios teleguiados de longa distância.', counterTip: 'Parry no arpão devolve a energia.', accent: '#f43f5e', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_crystal_gargoyle', name: 'Gárgula de Cristal', archetype: 'Guardião', mechanic: 'Alterna estado pétreo blindado e voo com rajada de cacos (2 HP).', counterTip: 'Ataque quando as asas abrirem.', accent: '#93c5fd', bountyTarget: 4, bountyCoins: 30 },
  { kind: 'enemy_star_bomber', name: 'Bombardeiro Estelar', archetype: 'Aéreo', mechanic: 'Patrulha o topo da tela soltando minas estelares temporizadas.', counterTip: 'Passe por baixo entre as bombas.', accent: '#a5b4fc', bountyTarget: 4, bountyCoins: 28 },
  { kind: 'enemy_abyss_knight', name: 'Paladino do Abismo', archetype: 'Campeão', mechanic: 'Elite de 3 HP que combina salto sísmico e onda tripla do vazio.', counterTip: 'Use reações elementais e [Q]!', accent: '#ff2e63', bountyTarget: 3, bountyCoins: 38 },
];

export const ENEMY_BESTIARY_MAP: Record<string, EnemyBestiaryEntry> = Object.fromEntries(
  ENEMY_BESTIARY.map((e) => [e.kind, e])
);

export const UNDERWORLD_ENEMY_BESTIARY: EnemyBestiaryEntry[] = [
  { kind: 'enemy_styx_ferryman', name: 'Barqueiro do Estige', archetype: 'Espectro', mechanic: 'Flutua sobre abismos e dispara lanternas espectrais duplas recuando ao perigo.', counterTip: 'Use Dash aéreo ou Golpe da Alma [U] para alcançá-lo.', accent: '#2dd4bf', bountyTarget: 4, bountyCoins: 35 },
  { kind: 'enemy_bone_pendulum', name: 'Pêndulo de Ossos', archetype: 'Armadilha Viva', mechanic: 'Lâmina gigante presa ao teto que oscila em arco mortal cortando a travessia.', counterTip: 'Salte por baixo no ápice ou quebre a âncora superior com Dash.', accent: '#e2e8f0', bountyTarget: 3, bountyCoins: 40 },
  { kind: 'enemy_soul_siphon', name: 'Sifão de Almas', archetype: 'Drenador', mechanic: 'Conecta um feixe sugador ao herói drenando estamina contínua até ser quebrado.', counterTip: 'Avance rápido com Dash direto no núcleo!', accent: '#a855f7', bountyTarget: 4, bountyCoins: 36 },
  { kind: 'enemy_ash_stalker', name: 'Espreitador das Cinzas', archetype: 'Furtivo', mechanic: 'Fica quase invisível nas sombras e dá um bote veloz ao detectar proximidade.', counterTip: 'Observe a aura vermelha antes do bote e contra-ataque.', accent: '#fb923c', bountyTarget: 5, bountyCoins: 34 },
  { kind: 'enemy_crimson_bat', name: 'Morcego Carmesim', archetype: 'Predador Aéreo', mechanic: 'Empoleirado no teto, mergulha em arco V perseguindo o jogador.', counterTip: 'Atravesse o mergulho com Dash ou pise na volta.', accent: '#f43f5e', bountyTarget: 6, bountyCoins: 30 },
  { kind: 'enemy_pyre_acolyte', name: 'Acólito da Pira', archetype: 'Piromante', mechanic: 'Conjura fissuras de fogo diretamente sob os pés do jogador com aviso no piso.', counterTip: 'Mova-se assim que a runa vermelha acender no chão.', accent: '#ff5522', bountyTarget: 4, bountyCoins: 36 },
  { kind: 'enemy_chain_jailer', name: 'Carcereiro das Correntes', archetype: 'Sentinela', mechanic: 'Blindado (2 HP) que dispara correntes horizontais velozes que repuxam o alvo.', counterTip: 'Reflita a corrente com Dash Parry ou use [U]!', accent: '#94a3b8', bountyTarget: 4, bountyCoins: 38 },
  { kind: 'enemy_frost_wraith_uw', name: 'Aparição de Cocito', archetype: 'Criomante', mechanic: 'Patrulha gélida que deixa cristais de gelo suspensos no ar atrás de si.', counterTip: 'Destrua os rastros de gelo com Dash ou Skill.', accent: '#38bdf8', bountyTarget: 4, bountyCoins: 35 },
  { kind: 'enemy_plague_toad', name: 'Sapo da Pestilência', archetype: 'Saltador', mechanic: 'Salta alto e libera 3 glóbulos ácidos em leque ao tocar o chão.', counterTip: 'Pise no topo entre os saltos.', accent: '#a3e635', bountyTarget: 5, bountyCoins: 32 },
  { kind: 'enemy_hellhound', name: 'Cão do Tártaro', archetype: 'Besta Feroz', mechanic: 'Rosna telegrafando chamas e dispara em investida feroz deixando rastro ígneo (2 HP).', counterTip: 'Pule por cima da investida e pise nas costas.', accent: '#ff7733', bountyTarget: 4, bountyCoins: 38 },
  { kind: 'enemy_doom_bell', name: 'Sino da Perdição', archetype: 'Sônico', mechanic: 'Badala no ar soltando ondas circulares de 6 notas sombrias (2 HP).', counterTip: 'Use Golpe da Alma [U] para anular as ondas!', accent: '#f59e0b', bountyTarget: 4, bountyCoins: 38 },
  { kind: 'enemy_shadow_mimic', name: 'Mímico das Sombras', archetype: 'Emboscada', mechanic: 'Finge ser um orbe sombrio inofensivo e salta com fúria quando você chega perto.', counterTip: 'Ataque à distância ou com Dash preventivo.', accent: '#818cf8', bountyTarget: 5, bountyCoins: 34 },
  { kind: 'enemy_blood_alchemist', name: 'Alquimista de Sangue', archetype: 'Bombardeiro', mechanic: 'Arremessa frascos em parábola que viram poças ácidas explosivas.', counterTip: 'Mantenha ritmo agressivo de perto.', accent: '#e11d48', bountyTarget: 4, bountyCoins: 36 },
  { kind: 'enemy_abyss_gargoyle', name: 'Gárgula Abissal', archetype: 'Atirador', mechanic: 'Mira com laser rubi fino antes de disparar raio perfurante de alta velocidade (2 HP).', counterTip: 'Saia da linha do laser vermelho antes do disparo!', accent: '#ef4444', bountyTarget: 4, bountyCoins: 40 },
  { kind: 'enemy_void_leecher_uw', name: 'Parasita do Vazio', archetype: 'Orbital', mechanic: 'Descreve órbita em 8 infinito atirando projéteis duplos giratórios.', counterTip: 'Preveja o cruzamento do 8 para acertar em cheio.', accent: '#c084fc', bountyTarget: 5, bountyCoins: 34 },
  { kind: 'enemy_magma_tortoise', name: 'Cágado de Magma', archetype: 'Couraça', mechanic: 'Casco superior espinhoso repele pisões! Só sofre dano por Dash lateral ou Golpe [U] (2 HP).', counterTip: 'NÃO pise em cima! Ataque pelo lado com Dash!', accent: '#fb7185', bountyTarget: 4, bountyCoins: 40 },
  { kind: 'enemy_spectral_executioner', name: 'Carrasco Espectral', archetype: 'Teleportador', mechanic: 'Surge atrás do herói após clarão violeta desferindo onda cortante (2 HP).', counterTip: 'Vire e dê Dash assim que o brilho violeta sumir.', accent: '#d946ef', bountyTarget: 4, bountyCoins: 42 },
  { kind: 'enemy_soul_lantern', name: 'Lanterna Maldita', archetype: 'Bomba-Alma', mechanic: 'Ao morrer ou se aproximar, inicia contagem de 0.55s e explode em nova de 8 faíscas!', counterTip: 'Afaste-se assim que derrotá-la!', accent: '#5eead4', bountyTarget: 5, bountyCoins: 32 },
  { kind: 'enemy_obsidian_golem_uw', name: 'Colosso de Obsidiana', archetype: 'Colosso', mechanic: 'Escudo frontal + 3 HP; soca o solo invocando pilares de magma duplos.', counterTip: 'Flanqueie pelas costas ou quebre com [U]!', accent: '#f97316', bountyTarget: 3, bountyCoins: 48 },
  { kind: 'enemy_fallen_seraph', name: 'Serafim Caído', archetype: 'Anjo Abissal', mechanic: 'Elite de 3 HP que tece espirais sagradas corrompidas e investidas celestes.', counterTip: 'Combine Parry e Golpe da Alma [U]!', accent: '#ffe066', bountyTarget: 3, bountyCoins: 52 },
];

export const ALL_ENEMY_BESTIARY: EnemyBestiaryEntry[] = [
  ...ENEMY_BESTIARY,
  ...UNDERWORLD_ENEMY_BESTIARY,
  ...EXCLUSIVE_ENEMY_BESTIARY,
];

export const ALL_ENEMY_BESTIARY_MAP: Record<string, EnemyBestiaryEntry> = Object.fromEntries(
  ALL_ENEMY_BESTIARY.map((e) => [e.kind, e])
);

export function computeWorldStars(cleared: boolean, deaths: number, relicsHere: number, totalRelicsHere: number): number {
  if (!cleared) return 0;
  let stars = 1;
  if (deaths <= 4) stars++;
  if (totalRelicsHere > 0 ? relicsHere >= Math.ceil(totalRelicsHere * 0.5) : deaths <= 1) stars++;
  return Math.min(3, stars);
}
