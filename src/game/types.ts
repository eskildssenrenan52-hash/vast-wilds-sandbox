// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import type { HeroId } from './heroes';

export const VIRTUAL_WIDTH = 320;
export const VIRTUAL_HEIGHT = 180;
export const TILE_SIZE = 8;
export const ROOM_COLS = 40;
export const ROOM_ROWS = 23;

export type GameModeState = 'title' | 'playing' | 'paused' | 'stage_clear' | 'gameover';

export type PlayModeId =
  | 'campaign'
  | 'underworld'
  | 'sandbox_world'
  | 'boss_rush'
  | 'speedrun'
  | 'survival'
  | 'tower'
  | 'glass_cannon'
  | 'mirror_void';

export type UnderworldBossKind =
  | 'uboss_charon'
  | 'uboss_hecate'
  | 'uboss_vulcan_lord'
  | 'uboss_malphas'
  | 'uboss_carmilla'
  | 'uboss_ossuary_king'
  | 'uboss_cocytus_queen'
  | 'uboss_phlegethon'
  | 'uboss_acheron'
  | 'uboss_lethe_siren'
  | 'uboss_banshee_matriarch'
  | 'uboss_iron_torturer'
  | 'uboss_nurgle_lord'
  | 'uboss_ashen_sovereign'
  | 'uboss_minotaur_prime'
  | 'uboss_stained_seraph'
  | 'uboss_erebus'
  | 'uboss_caldera_wyrm'
  | 'uboss_null_architect'
  | 'uboss_lucifer_apex';

export const UNDERWORLD_BOSS_KINDS: UnderworldBossKind[] = [
  'uboss_charon',
  'uboss_hecate',
  'uboss_vulcan_lord',
  'uboss_malphas',
  'uboss_carmilla',
  'uboss_ossuary_king',
  'uboss_cocytus_queen',
  'uboss_phlegethon',
  'uboss_acheron',
  'uboss_lethe_siren',
  'uboss_banshee_matriarch',
  'uboss_iron_torturer',
  'uboss_nurgle_lord',
  'uboss_ashen_sovereign',
  'uboss_minotaur_prime',
  'uboss_stained_seraph',
  'uboss_erebus',
  'uboss_caldera_wyrm',
  'uboss_null_architect',
  'uboss_lucifer_apex',
];

export type UnderworldBiomeId =
  | 'styx_ferry'
  | 'asphodel_wastes'
  | 'brass_tartarus'
  | 'brimstone_caldera'
  | 'blood_aqueduct'
  | 'bone_ossuary'
  | 'cocytus_trench'
  | 'phlegethon_rapids'
  | 'acheron_gorge'
  | 'lethe_depths'
  | 'wailing_spires'
  | 'iron_dungeon'
  | 'pestilence_marsh'
  | 'ash_necropolis'
  | 'obsidian_labyrinth'
  | 'hellglass_cathedral'
  | 'shadow_sanctum'
  | 'magma_core'
  | 'void_gate'
  | 'pandemonium_citadel';

export const UNDERWORLD_BIOMES: UnderworldBiomeId[] = [
  'styx_ferry',
  'asphodel_wastes',
  'brass_tartarus',
  'brimstone_caldera',
  'blood_aqueduct',
  'bone_ossuary',
  'cocytus_trench',
  'phlegethon_rapids',
  'acheron_gorge',
  'lethe_depths',
  'wailing_spires',
  'iron_dungeon',
  'pestilence_marsh',
  'ash_necropolis',
  'obsidian_labyrinth',
  'hellglass_cathedral',
  'shadow_sanctum',
  'magma_core',
  'void_gate',
  'pandemonium_citadel',
];

export type UnderworldEnemyKind =
  | 'enemy_styx_ferryman'
  | 'enemy_bone_pendulum'
  | 'enemy_soul_siphon'
  | 'enemy_ash_stalker'
  | 'enemy_crimson_bat'
  | 'enemy_pyre_acolyte'
  | 'enemy_chain_jailer'
  | 'enemy_frost_wraith_uw'
  | 'enemy_plague_toad'
  | 'enemy_hellhound'
  | 'enemy_doom_bell'
  | 'enemy_shadow_mimic'
  | 'enemy_blood_alchemist'
  | 'enemy_abyss_gargoyle'
  | 'enemy_void_leecher_uw'
  | 'enemy_magma_tortoise'
  | 'enemy_spectral_executioner'
  | 'enemy_soul_lantern'
  | 'enemy_obsidian_golem_uw'
  | 'enemy_fallen_seraph';

export const UNDERWORLD_ENEMY_KINDS: UnderworldEnemyKind[] = [
  'enemy_styx_ferryman',
  'enemy_bone_pendulum',
  'enemy_soul_siphon',
  'enemy_ash_stalker',
  'enemy_crimson_bat',
  'enemy_pyre_acolyte',
  'enemy_chain_jailer',
  'enemy_frost_wraith_uw',
  'enemy_plague_toad',
  'enemy_hellhound',
  'enemy_doom_bell',
  'enemy_shadow_mimic',
  'enemy_blood_alchemist',
  'enemy_abyss_gargoyle',
  'enemy_void_leecher_uw',
  'enemy_magma_tortoise',
  'enemy_spectral_executioner',
  'enemy_soul_lantern',
  'enemy_obsidian_golem_uw',
  'enemy_fallen_seraph',
];

export type ExclusiveEnemyKind =
  | 'enemy_ash_hound'
  | 'enemy_mycelium_sporeling'
  | 'enemy_glacial_golem'
  | 'enemy_abyssal_nautilus'
  | 'enemy_cinder_sentinel'
  | 'enemy_dune_scorpion'
  | 'enemy_crypt_reaper'
  | 'enemy_plague_chemist'
  | 'enemy_gear_colossus'
  | 'enemy_cyber_mantis'
  | 'enemy_nebula_serpent'
  | 'enemy_starlight_templar'
  | 'enemy_void_beholder'
  | 'enemy_ether_seraph'
  | 'enemy_eclipse_reaver'
  | 'enemy_eternity_warden';

export const EXCLUSIVE_ENEMY_KINDS: ExclusiveEnemyKind[] = [
  'enemy_ash_hound',
  'enemy_mycelium_sporeling',
  'enemy_glacial_golem',
  'enemy_abyssal_nautilus',
  'enemy_cinder_sentinel',
  'enemy_dune_scorpion',
  'enemy_crypt_reaper',
  'enemy_plague_chemist',
  'enemy_gear_colossus',
  'enemy_cyber_mantis',
  'enemy_nebula_serpent',
  'enemy_starlight_templar',
  'enemy_void_beholder',
  'enemy_ether_seraph',
  'enemy_eclipse_reaver',
  'enemy_eternity_warden',
];

export type BossEntityKind =
  | 'boss_sentinel'
  | 'boss_mycelium'
  | 'boss_glacier'
  | 'boss_ignis_rex'
  | 'boss_astral_oracle'
  | 'boss_sakura'
  | 'boss_leviathan'
  | 'boss_chronos'
  | 'boss_seraph_king'
  | 'boss_sphinx'
  | 'boss_lich'
  | 'boss_automaton'
  | 'boss_valkyrie'
  | 'boss_canyon_colossus'
  | 'boss_cyber_archon'
  | 'boss_marble_titan'
  | 'boss_fen_hydra'
  | 'boss_star_emperor'
  | 'boss_twilight_wraith'
  | 'boss_sovereign'
  | 'boss_coral_siren'
  | 'boss_ash_behemoth'
  | 'boss_jade_shogun'
  | 'boss_fjord_kraken'
  | 'boss_rust_juggernaut'
  | 'boss_spore_archon'
  | 'boss_tempest_roc'
  | 'boss_obsidian_idol'
  | 'boss_mercury_twin'
  | 'boss_blood_cantor'
  | 'boss_mirror_queen'
  | 'boss_sand_empress'
  | 'boss_phantom_maestro'
  | 'boss_titan_reaper'
  | 'boss_cloud_monk'
  | 'boss_grid_warden'
  | 'boss_amber_matriarch'
  | 'boss_tome_keeper'
  | 'boss_polarity_lord'
  | 'boss_prism_angel'
  | 'boss_nebula_wyrm'
  | 'boss_solar_deity'
  | 'boss_lunar_empress'
  | 'boss_paradox_aeon'
  | 'boss_star_admiral'
  | 'boss_eclipse_herald'
  | 'boss_singularity_core'
  | 'boss_seraph_prime'
  | 'boss_abyss_king'
  | 'boss_eternity_god';

export type BiomeId =
  | 'silver_ash'
  | 'bioluminescent'
  | 'frostglass'
  | 'obsidian_forge'
  | 'astral_void'
  | 'crimson_sakura'
  | 'sunken_cathedral'
  | 'clockwork_spire'
  | 'emerald_sky'
  | 'solar_mirage'
  | 'amethyst_crypt'
  | 'alchemical_labs'
  | 'aurora_zenith'
  | 'crimson_canyon'
  | 'cyber_undercity'
  | 'celestial_marble'
  | 'ebony_fen'
  | 'orbital_nexus'
  | 'twilight_garden'
  | 'stormcrown'
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
  | 'eternity_apex';

export type AnyBiomeId = BiomeId | UnderworldBiomeId;
export type AnyBossEntityKind = BossEntityKind | UnderworldBossKind;

export const TileType = {
  EMPTY: 0,
  SOLID: 1,
  ONE_WAY: 2,
  SPIKE_UP: 3,
  SPIKE_DOWN: 4,
  SPIKE_LEFT: 5,
  SPIKE_RIGHT: 6,
  CRUMBLE: 7,
  DREAM_BLOCK: 8,
  ICE: 9,
  BREAKABLE: 10,
  STICKY_RESIN: 11,
  CONVEYOR_LEFT: 12,
  CONVEYOR_RIGHT: 13,
  BEAT_A: 14,
  BEAT_B: 15,
  SECRET_WALL: 16,
  FRAGILE_GLASS: 17,
  LIQUID_LETHAL: 18,
  WATER: 19,
  MAGMA_CRUST: 20,
  CLOUD_BOUNCE: 21,
} as const;

export type TileValue = (typeof TileType)[keyof typeof TileType];

export type EntityKind =
  | 'spring_up'
  | 'spring_left'
  | 'spring_right'
  | 'bounce_shroom'
  | 'dash_crystal'
  | 'double_dash_crystal'
  | 'stamina_orb'
  | 'gravity_crystal'
  | 'feather_aura'
  | 'chrono_prism'
  | 'prism_splitter'
  | 'gravity_vortex'
  | 'stasis_orb'
  | 'zip_block'
  | 'falling_icicle'
  | 'spinner'
  | 'steam_geyser'
  | 'lightning_zone'
  | 'tether_ring'
  | 'portal_a'
  | 'portal_b'
  | 'dash_ring'
  | 'mag_rail'
  | 'wind_up'
  | 'wind_right'
  | 'wind_left'
  | 'wind_down'
  | 'antigrav_zone'
  | 'torch'
  | 'key'
  | 'lock_door'
  | 'touch_switch'
  | 'switch_gate'
  | 'pressure_plate'
  | 'plate_bridge'
  | 'bubble'
  | 'relic'
  | 'winged_relic'
  | 'campfire'
  | 'chapter_goal'
  | 'summit_heart'
  | 'signpost'
  | 'npc'
  | 'enemy_crawler'
  | 'enemy_wisp'
  | 'enemy_drone'
  | 'enemy_charger'
  | 'enemy_mortar'
  | 'enemy_mimic'
  | 'enemy_golem'
  | 'enemy_saw'
  | 'enemy_phantom'
  | 'enemy_slime_king'
  | 'enemy_laser_eye'
  | 'enemy_spark_beetle'
  | 'enemy_magma_wyrm'
  | 'enemy_sand_wraith'
  | 'enemy_bone_knight'
  | 'enemy_alchemist'
  | 'enemy_frost_valkyrie'
  | 'enemy_mirror_orb'
  | 'enemy_rift_stalker'
  | 'enemy_cryo_turret'
  | 'enemy_chrono_weaver'
  | 'enemy_void_leech'
  | 'enemy_shield_phalanx'
  | 'enemy_chain_tesla'
  | 'enemy_spore_splitter'
  | 'enemy_magma_slug'
  | 'enemy_prism_cherub'
  | 'enemy_gravity_imp'
  | 'enemy_blade_dancer'
  | 'enemy_ember_phoenix'
  | 'enemy_anchor_brute'
  | 'enemy_echo_assassin'
  | 'enemy_magnet_core'
  | 'enemy_amber_wasp'
  | 'enemy_rune_monolith'
  | 'enemy_tidal_jelly'
  | 'enemy_clock_spider'
  | 'enemy_solar_acolyte'
  | 'enemy_shadow_hook'
  | 'enemy_crystal_gargoyle'
  | 'enemy_star_bomber'
  | 'enemy_abyss_knight'
  | UnderworldEnemyKind
  | ExclusiveEnemyKind
  | AnyBossEntityKind
  | 'astral_coin'
  | 'boost_hoop'
  | 'blessing_shrine'
  | 'bumper_orb'
  | 'treasure_chest'
  | 'speed_pad'
  | 'checkpoint_totem'
  | 'shield_orb'
  | 'grapple_anchor'
  | 'rift_trial'
  | 'heal_orb'
  | 'elemental_totem'
  | 'chrono_gate'
  | 'echo_mirror'
  | 'boss_crown_shard'
  | 'laser_prism'
  | 'jump_orb'
  | 'cannon_barrel'
  | 'phase_veil'
  | 'rocket_pack'
  | 'pulse_fan'
  | 'star_shard'
  | 'quest_beacon'
  | 'lore_tablet';

export interface BlessingUpgrades {
  speedLv: number;
  staminaLv: number;
  skillCdLv: number;
  magnetLv: number;
}

export interface RoomEntityDef {
  id: string;
  kind: EntityKind;
  x: number;
  y: number;
  w?: number;
  h?: number;
  tx?: number;
  ty?: number;
  linkId?: string;
  npcId?: string;
  text?: string;
  patrolDist?: number;
  speed?: number;
  dir?: 1 | -1;
  isElite?: boolean;
}

export interface RoomPropDef {
  kind:
    | 'pillar'
    | 'arch'
    | 'window'
    | 'stained_window'
    | 'banner'
    | 'lantern'
    | 'chain'
    | 'statue'
    | 'crystal_cluster'
    | 'tree_pine'
    | 'shroom_giant'
    | 'waterfall'
    | 'bird_perch'
    | 'brazier'
    | 'ruin_tower'
    | 'crystal_spire'
    | 'hanging_vine'
    | 'anvil'
    | 'obelisk'
    | 'torii_gate'
    | 'sakura_tree'
    | 'paper_lantern'
    | 'coral_fan'
    | 'kelp_strand'
    | 'sunken_anchor'
    | 'clock_gear'
    | 'pendulum'
    | 'floating_island'
    | 'wind_chime'
    | 'sun_dial'
    | 'rose_window'
    | 'pyramid_obelisk'
    | 'sun_brazier'
    | 'crystal_chandelier'
    | 'soul_urn'
    | 'alchemy_vat'
    | 'tesla_coil'
    | 'aurora_prism'
    | 'frost_arch'
    | 'canyon_totem'
    | 'holo_pylon'
    | 'marble_column'
    | 'willow_tree'
    | 'star_satellite'
    | 'twilight_lotus';
  tx: number;
  ty: number;
  h?: number;
}

export interface RoomExits {
  leftRow?: number;
  rightRow?: number;
  upCol?: number;
  downCol?: number;
}

export interface RoomDef {
  id: string;
  chapterIndex: number;
  stageIndex: number;
  gx: number;
  gy: number;
  cols: number;
  rows: number;
  biome: AnyBiomeId;
  name: string;
  subtitle?: string;
  dark?: boolean;
  tiles: number[]; // length = cols * rows
  entities: RoomEntityDef[];
  props: RoomPropDef[];
  spawnX: number;
  spawnY: number;
  exits?: RoomExits;
}

export interface ChapterDef {
  index: number;
  id: AnyBiomeId;
  name: string;
  subtitle: string;
  difficultyLabel: string;
  accent: string;
  startStageId: string;
  stages: RoomDef[];
  totalRelics: number;
}

export interface ChapterSaveRecord {
  unlocked: boolean;
  cleared: boolean;
  bestTimeSeconds: number | null;
  fewestDeaths: number | null;
}

export interface HairNode {
  x: number;
  y: number;
}

export interface PlayerState {
  heroId: HeroId;
  skinId?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  xRem: number;
  yRem: number;
  facing: 1 | -1;
  onGround: boolean;
  onIce: boolean;
  inWater: boolean;
  inDream: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  dashBufferTimer: number;
  wallSlideDir: -1 | 0 | 1;
  wallGrabbing: boolean;
  onStickyWall: boolean;
  stamina: number;
  maxStamina: number;
  dashes: number;
  maxDashes: number;
  airJumpsLeft: number;
  maxAirJumps: number;
  heroShieldReady: boolean;
  dashTimer: number;
  dashDirX: number;
  dashDirY: number;
  dashCooldown: number;
  superWindowTimer: number;
  wallGraceTimer: number;
  gravityDir: 1 | -1;
  featherTimer: number;
  chronoTimer: number;
  stasisTimer?: number;
  invulnTimer: number;
  flashTimer: number;
  crouch: boolean;
  scaleX: number;
  scaleY: number;
  walkDist: number;
  dead: boolean;
  respawnTimer: number;
  bubbleId: string | null;
  bubbleTimer: number;
  tetherId: string | null;
  tetherAngle: number;
  tetherAngVel: number;
  dashedInRoom: boolean;
  hair: HairNode[];
  carryingKeys: string[];
  pendingRelics: { id: string; x: number; y: number; timer: number; winged: boolean }[];
}

export interface AssistOptions {
  gameSpeed: 1 | 0.8 | 0.6;
  infiniteStamina: boolean;
  extraDash: boolean;
  invincible: boolean;
  hardcoreMode: boolean;
  lowGravity?: boolean;
  turboMode?: boolean;
}

export interface DialogueState {
  npcId: string;
  speaker: string;
  role: string;
  accentColor: string;
  lines: string[];
  lineIndex: number;
  charIndex: number;
  choices?: { label: string; reply: string }[];
  replyText?: string;
}

export type StyleRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export type CutsceneId =
  | 'prologue'
  | 'ch1_intro' | 'ch2_intro' | 'ch3_intro' | 'ch4_intro' | 'ch5_intro'
  | 'ch6_intro' | 'ch7_intro' | 'ch8_intro' | 'ch9_intro' | 'ch10_intro'
  | 'ch11_intro' | 'ch12_intro' | 'ch13_intro' | 'ch14_intro' | 'ch15_intro'
  | 'ch16_intro' | 'ch17_intro' | 'ch18_intro' | 'ch19_intro' | 'ch20_intro'
  | 'ch21_intro' | 'ch22_intro' | 'ch23_intro' | 'ch24_intro' | 'ch25_intro'
  | 'ch26_intro' | 'ch27_intro' | 'ch28_intro' | 'ch29_intro' | 'ch30_intro'
  | 'ch31_intro' | 'ch32_intro' | 'ch33_intro' | 'ch34_intro' | 'ch35_intro'
  | 'ch36_intro' | 'ch37_intro' | 'ch38_intro' | 'ch39_intro' | 'ch40_intro'
  | 'ch41_intro' | 'ch42_intro' | 'ch43_intro' | 'ch44_intro' | 'ch45_intro'
  | 'ch46_intro' | 'ch47_intro' | 'ch48_intro' | 'ch49_intro' | 'ch50_intro'
  | 'boss_ch1' | 'boss_ch2' | 'boss_ch3' | 'boss_ch4' | 'boss_ch5'
  | 'boss_ch6' | 'boss_ch7' | 'boss_ch8' | 'boss_ch9' | 'boss_ch10'
  | 'boss_ch11' | 'boss_ch12' | 'boss_ch13' | 'boss_ch14' | 'boss_ch15'
  | 'boss_ch16' | 'boss_ch17' | 'boss_ch18' | 'boss_ch19' | 'boss_ch20'
  | 'boss_ch21' | 'boss_ch22' | 'boss_ch23' | 'boss_ch24' | 'boss_ch25'
  | 'boss_ch26' | 'boss_ch27' | 'boss_ch28' | 'boss_ch29' | 'boss_ch30'
  | 'boss_ch31' | 'boss_ch32' | 'boss_ch33' | 'boss_ch34' | 'boss_ch35'
  | 'boss_ch36' | 'boss_ch37' | 'boss_ch38' | 'boss_ch39' | 'boss_ch40'
  | 'boss_ch41' | 'boss_ch42' | 'boss_ch43' | 'boss_ch44' | 'boss_ch45'
  | 'boss_ch46' | 'boss_ch47' | 'boss_ch48' | 'boss_ch49' | 'boss_ch50'
  | 'ending_victory';

export type ElementType = 'flame' | 'frost' | 'volt' | 'void' | 'astral';

export type WeatherKind = 'clear' | 'wind_gale' | 'astral_meteor' | 'blood_eclipse' | 'aurora_blessing';

export type RuneId =
  | 'furia_carmesim'
  | 'passos_fantasma'
  | 'ima_astral'
  | 'contra_golpe'
  | 'salto_gravitacional'
  | 'eco_duplo';

export type SpiritId =
  | 'none'
  | 'coruja_runica'
  | 'fenix_menor'
  | 'fada_crono'
  | 'dragao_cristal'
  | 'wisp_lumina'
  | 'raposa_sakura'
  | 'dragao_cinzas'
  | 'espectro_abissal'
  | 'coruja_glacial'
  | 'serafim_eter';

export interface MasteryTreeState {
  mobilityLv: number;
  combatLv: number;
  explorationLv: number;
  survivalLv: number;
  xp: number;
}

export type BoonId =
  | 'vampiric_dash'
  | 'lightning_parry'
  | 'meteor_slam'
  | 'echo_slash'
  | 'frost_nova'
  | 'chrono_surge'
  | 'star_magnet'
  | 'aegis_reforge'
  | 'air_dancer'
  | 'prism_burst'
  | 'solar_flare'
  | 'void_siphon'
  | 'grappler_pro'
  | 'eter_overflow'
  | 'style_emperor'
  | 'critical_edge'
  | 'wind_walker'
  | 'phoenix_ash';

export type TalismanId =
  | 'none'
  | 'selo_cinza'
  | 'coracao_brasas'
  | 'prisma_glacial'
  | 'ampulheta_eterna'
  | 'olho_aguia'
  | 'garra_trovao'
  | 'manto_vazio'
  | 'coroa_soberana'
  | 'asa_serafim'
  | 'anel_parry'
  | 'pedra_filosofal';

export type TitleId =
  | 'viajante'
  | 'esquiva_fantasma'
  | 'cacador_coroas'
  | 'mestre_combo'
  | 'quebra_guardas'
  | 'alquimista_eter'
  | 'duelista_apex'
  | 'colecionador'
  | 'sobrevivente'
  | 'lenda_eterna';

export interface BoonDef {
  id: BoonId;
  name: string;
  rarity: 'Comum' | 'Rara' | 'Mítica';
  color: string;
  desc: string;
  code: string;
}

export interface TalismanDef {
  id: TalismanId;
  name: string;
  color: string;
  cost: number;
  element: ElementType;
  desc: string;
}

export interface PlayerTitleDef {
  id: TitleId;
  name: string;
  color: string;
  requirement: string;
}

export interface HunterContractDef {
  id: string;
  title: string;
  desc: string;
  target: number;
  metric:
    | 'bossesDefeated'
    | 'perfectDodges'
    | 'crownShards'
    | 'relics'
    | 'reactions'
    | 'bestWave'
    | 'styleSS'
    | 'parries';
  coinReward: number;
  xpReward: number;
  color: string;
}

export interface BossBestiaryEntry {
  kind: AnyBossEntityKind;
  name: string;
  title: string;
  chapter: number;
  weaknessElement: ElementType;
  maxStagger: number;
  accent: string;
  lore: string;
  tacticalTip: string;
}

export interface JukeboxTrackDef {
  id: string;
  name: string;
  subtitle: string;
  bpm: number;
  scale: number[];
  color: string;
}

export type BossSubState =
  | 'orbit'
  | 'chase'
  | 'windup'
  | 'lunge'
  | 'leap'
  | 'recover'
  | 'staggered'
  | 'retreat';

export interface MiniRadarNode {
  id: string;
  gx: number;
  gy: number;
  visited: boolean;
  current: boolean;
  hasGoal: boolean;
}

export interface HudSnapshot {
  mode: GameModeState;
  playMode: PlayModeId;
  heroId: HeroId;
  heroSkinId: string;
  heroName: string;
  heroShieldReady: boolean;
  heroSkillCooldown: number;
  heroSkillMaxCooldown: number;
  astralCoins: number;
  comboCount: number;
  comboTimer: number;
  styleScore: number;
  styleRank: StyleRank;
  blessings: BlessingUpgrades;
  chapterIndex: number;
  totalChapters: number;
  biome: AnyBiomeId;
  biomeName: string;
  roomName: string;
  stageNumber: number;
  totalStagesInChapter: number;
  dashes: number;
  maxDashes: number;
  staminaRatio: number;
  deaths: number;
  chapterDeaths: number;
  chapterElapsedSeconds: number;
  relicsCollected: number;
  totalRelics: number;
  chapterRelicsCollected: number;
  chapterTotalRelics: number;
  elapsedSeconds: number;
  discoveredMechanics: number;
  totalMechanics: number;
  visitedStages: string[];
  unlockedShrines: string[];
  currentRoomId: string;
  chapterRecords: ChapterSaveRecord[];
  dialogue: DialogueState | null;
  bannerTitle: string | null;
  bannerSub: string | null;
  muted: boolean;
  victory: boolean;
  hardcoreGameOver: boolean;
  assist: AssistOptions;
  recentMechanicToast: string | null;
  bossHp: number | null;
  bossMaxHp: number | null;
  bossName: string | null;
  bossTitle: string | null;
  bossPhase: 1 | 2 | 3 | null;
  bossRushIndex: number;
  bossRushTotal: number;
  survivalWave: number;
  survivalKills: number;
  bestSurvivalWave: number;
  bestBossRushSeconds: number | null;
  goalLockedByBoss: boolean;
  nearShrine: boolean;
  activeCheckpoint: boolean;
  stageNodes: MiniRadarNode[];
  overdrive: number;
  overdriveActive: boolean;
  activeCutscene: CutsceneId | null;
  seenCutscenes: CutsceneId[];
  weather: WeatherKind;
  weatherName: string;
  equippedRunes: RuneId[];
  equippedSpirit: SpiritId;
  tagHeroId: HeroId;
  tagSwapCooldown: number;
  elementMarks: ElementType[];
  riftActive: boolean;
  riftProgress: number;
  riftTotal: number;
  riftTimer: number;
  mastery: MasteryTreeState;
  unlockedAchievements: string[];
  ghostEnabled: boolean;
  hasGhostRecord: boolean;
  activeBoons: BoonId[];
  pendingBoonChoices: BoonId[] | null;
  equippedTalisman: TalismanId;
  unlockedTalismans: TalismanId[];
  activeTitle: TitleId;
  unlockedTitles: TitleId[];
  claimedContracts: string[];
  bestiaryDefeats: Record<string, number>;
  bossStaggerRatio: number | null;
  bossSubState: BossSubState | null;
  bossWeakness: ElementType | null;
  bossHitInvulnRemaining: number;
  perfectDodges: number;
  crownShardsCollected: number;
  echoCloneActive: boolean;
  imbuedElement: ElementType | null;
  imbuedTimer: number;
  jukeboxTrackId: string;
  totalParries: number;
  totalReactions: number;
  totalStyleSS: number;
  playerLevel: number;
  playerXp: number;
  playerCurrentLevelXp: number;
  playerNextLevelXp: number;
  playerLevelProgress: number;
  unlockedHeroes: HeroId[];
  towerFloor: number;
  bestTowerFloor: number;
  passXp: number;
  passLevel: number;
  passLevelProgress: number;
  passAstralUnlocked: boolean;
  claimedFreePassTiers: number[];
  claimedAstralPassTiers: number[];
  claimedMissions: string[];
  missionStats: {
    enemiesDefeated: number;
    stagesCleared: number;
    dashesUsed: number;
    perfectDodges: number;
    bossesDefeated: number;
    relicsCollected: number;
    coinsEarned: number;
    styleSSCount: number;
  };
  worldStars: Record<number, number>;
  totalWorldStars: number;
  claimedStarMilestones: number[];
  dailyStreakDay: number;
  canClaimDaily: boolean;
  equippedAuraTrail: AuraTrailId;
  unlockedAuraTrails: AuraTrailId[];
  enemyKills: Record<string, number>;
  claimedEnemyBounties: string[];
  soulCharge: number;
  isUnderworld: boolean;
  underworldChapterRecords: ChapterSaveRecord[];
  underworldWorldStars: Record<number, number>;
  totalUnderworldStars: number;
  underworldTotalChapters: number;
  sideQuests: SideQuestViewItem[];
  sideQuestsReadyCount: number;
  stageExplorationPct: number;
  stageZonesVisited: number;
  stageZonesTotal: number;
  nearInteractLabel: string | null;
  // Ambitious RPG, Equipment, Crafting, Evolution, Pets & Sandbox Systems
  craftingMaterials: Record<string, number>;
  activeAlchemyBuffs: { id: string; name: string; color: string; remainingSec: number }[];
  heroEvolutions: Record<string, number>;
  activeHeroEvolution: number;
  heroEquipmentSlots: Record<string, Partial<Record<string, string>>>;
  equipmentInventoryCount: number;
  heroPowerScore: number;
  petLevel: number;
  petBondXp: number;
  petSkillCooldown: number;
  petSkillMaxCooldown: number;
  isSandboxWorld: boolean;
  sandboxBiomeName: string;
  sandboxDayTime: number;
  sandboxIsNight: boolean;
  sandboxHousesCount: number;
  sandboxNpcsCount: number;
  sandboxHotbar: { id: string; label: string; count: number; color: string; category: string }[];
  sandboxSelectedSlot: number;
  sandboxToolTier: number;
  sandboxQuestsCompleted: number;
  sandboxQuestsTotal: number;
  sandboxBossActive: boolean;
  sandboxExplorationPct: number;
  sandboxWorldCols: number;
  sandboxWorldRows: number;
  sandboxBackpack: { id: string; label: string; count: number; color: string; category: string }[];
  sandboxPlayerTx: number;
  sandboxPlayerTy: number;
  sandboxPylons: { tx: number; ty: number; label: string; color: string }[];
}

export type SideQuestKind =
  | 'light_beacons'
  | 'hunt_elites'
  | 'secret_vaults'
  | 'lore_tablets'
  | 'star_shards'
  | 'style_mastery';

export interface SideQuestDef {
  id: string;
  chapterIndex: number;
  isUnderworld: boolean;
  kind: SideQuestKind;
  title: string;
  lore: string;
  objectiveLabel: string;
  target: number;
  coinReward: number;
  playerXpReward: number;
  passXpReward: number;
  accent: string;
}

export interface SideQuestViewItem extends SideQuestDef {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

export type AuraTrailId =
  | 'none'
  | 'starfire'
  | 'aurora'
  | 'prism_void'
  | 'sakura_petals'
  | 'solar_gold'
  | 'frost_crystal'
  | 'abyss_lightning';

export interface AuraTrailDef {
  id: AuraTrailId;
  name: string;
  desc: string;
  primaryColor: string;
  secondaryColor: string;
  cost: number;
}

export type PassRewardKind = 'coins' | 'mastery_xp' | 'aura_trail' | 'talisman' | 'title' | 'chest';

export interface PassRewardDef {
  kind: PassRewardKind;
  amount?: number;
  itemId?: string;
  label: string;
  color: string;
}

export interface PassTierDef {
  tier: number;
  xpRequired: number;
  freeReward: PassRewardDef;
  astralReward: PassRewardDef;
}

export interface MissionDef {
  id: string;
  category: 'daily' | 'milestone';
  title: string;
  desc: string;
  metric:
    | 'enemiesDefeated'
    | 'stagesCleared'
    | 'dashesUsed'
    | 'perfectDodges'
    | 'bossesDefeated'
    | 'relicsCollected'
    | 'coinsEarned'
    | 'styleSSCount';
  target: number;
  passXpReward: number;
  coinReward: number;
  masteryXpReward: number;
  accent: string;
}

export interface StarMilestoneDef {
  starsRequired: number;
  title: string;
  coinReward: number;
  passXpReward: number;
  masteryXpReward: number;
  auraUnlock?: AuraTrailId;
  accent: string;
}

export interface DailyRewardDef {
  day: number;
  label: string;
  coinReward: number;
  passXpReward: number;
  masteryXpReward: number;
  accent: string;
}

export interface EnemyBestiaryEntry {
  kind: string;
  name: string;
  archetype: string;
  mechanic: string;
  counterTip: string;
  accent: string;
  bountyTarget: number;
  bountyCoins: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  analogX?: number;
  analogY?: number;
  jumpHeld: boolean;
  jumpJustPressed: boolean;
  dashJustPressed: boolean;
  grabHeld: boolean;
  interactJustPressed: boolean;
  skillJustPressed?: boolean;
  swapJustPressed?: boolean;
  soulSlashJustPressed?: boolean;
}
