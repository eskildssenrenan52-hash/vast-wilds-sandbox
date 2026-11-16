// @ts-nocheck — imported game code, typed under the original looser tsconfig
import { gameAudio } from './audio';
import { BOSS_INTRO_CUTSCENE, CHAPTER_INTRO_CUTSCENE, CUTSCENES } from './cutscenes';
import { MECHANICS_CATALOG, TOTAL_MECHANICS } from './mechanicsCatalog';
import { BOSS_ORDER, getAnyBossMeta, isBossKind } from './modes';
import {
  CollisionGrid,
  PHYS,
  createInitialPlayer,
  isTileValueSolid,
  overlapsSolid,
  resolveSwingRelease,
  resolveSwingStep,
  stepPlayerPhysics,
  unstickPlayerFromSolid,
  updateHairVerlet,
} from './physics';
import {
  STAGE_EXPLORATION_SECTORS,
  buildSideQuestViewList,
  computeRoomSectorIndex,
  computeStageExplorationPct,
  generateChapterSideQuests,
  incrementSideQuestMap,
} from './sideQuests';
import {
  AnyBiomeId,
  AssistOptions,
  AuraTrailId,
  BlessingUpgrades,
  BoonId,
  BossEntityKind,
  BossSubState,
  ChapterDef,
  ChapterSaveRecord,
  CutsceneId,
  DialogueState,
  ElementType,
  EXCLUSIVE_ENEMY_KINDS,
  GameModeState,
  HudSnapshot,
  InputState,
  MasteryTreeState,
  PlayModeId,
  PlayerState,
  RoomDef,
  RoomEntityDef,
  RuneId,
  SideQuestKind,
  SpiritId,
  StyleRank,
  TalismanId,
  TILE_SIZE,
  TileType,
  TitleId,
  VIRTUAL_HEIGHT,
  VIRTUAL_WIDTH,
  WeatherKind,
} from './types';
import {
  ACHIEVEMENTS,
  BOON_MAP,
  chooseSafeRetreatPoint,
  computeBoonBonuses,
  computeBossDesiredAnchor,
  computeBossPhaseStats,
  computeRuneBonuses,
  ELEMENT_META,
  evaluateUnlockedTitles,
  getAnyBossBestiary,
  getLevelProgressFromXp,
  getMasteryBonuses,
  getMasteryUpgradeCost,
  getPlayerLevelBonuses,
  GhostFrame,
  HUNTER_CONTRACTS,
  JUKEBOX_TRACKS,
  pickBoonDraftOptions,
  pickRoomWeather,
  resolveElementalReaction,
  RUNE_MAP,
  SPIRIT_MAP,
  stepSmoothVelocity,
  TALISMAN_MAP,
  WEATHER_META,
} from './systems';
import { CHAPTERS, NPCS, createSurvivalArenaRoom, createTowerFloorRoom } from './worldData';
import { UNDERWORLD_CHAPTERS, getAnyBiomeMeta } from './worldDataUnderworld';
import {
  ALL_ENEMY_BESTIARY_MAP,
  AURA_TRAIL_MAP,
  DAILY_REWARDS,
  MISSIONS,
  PASS_ASTRAL_UNLOCK_COST,
  PASS_TIERS,
  STAR_MILESTONES,
  computeWorldStars,
  getPassProgressFromXp,
} from './passAndRewards';
import {
  computeProgressiveEnemyHp,
  stepExclusiveEnemyAI,
} from './exclusiveEnemies';
import {
  ALCHEMY_BUFFS,
  CRAFT_RECIPES,
  MaterialId,
  RECIPE_MAP,
  canCraftRecipe,
  createStarterMaterials,
  getBiomeMaterialDrops,
} from './crafting';
import {
  AggregatedEquipmentBonuses,
  EQUIP_SLOTS,
  EquipSlot,
  EquipmentItem,
  EquipmentPrefix,
  computeHeroEquipmentBonuses,
  createEquipmentItem,
  createStarterEquipmentInventory,
  getRarityEvolveCost,
  getReforgePrefixes,
  getUpgradeCost,
} from './equipment';
import {
  EVOLUTION_REQUIREMENTS,
  canEvolveHero,
  getHeroEvolutionData,
} from './heroEvolution';
import {
  DETAILED_PET_MAP,
  computePetLevelBonuses,
  getPetNextLevelXp,
} from './pets';
import {
  SANDBOX_COLS,
  SANDBOX_QUESTS,
  SANDBOX_ROWS,
  SANDBOX_TILE_META,
  SANDBOX_WORLD_HEIGHT_PX,
  SANDBOX_WORLD_WIDTH_PX,
  SB_TILE,
  SB_WALL,
  SandboxDeltaSave,
  SandboxHotbarSlot,
  SandboxWorld,
  applySandboxDelta,
  buildSandboxCollisionGrid,
  createStarterHotbar,
  exportSandboxDelta,
  generateSandboxWorld,
  getSandboxBiomeAt,
  getSandboxExplorationPct,
  isSandboxNight,
  isSandboxSolid,
  markSandboxSectorAt,
  mineSandboxTile,
  registerValidatedHouse,
  setSandboxTile,
  setSandboxWall,
  spawnSandboxBoss,
  validateHouseAt,
} from './sandboxWorld';

export interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
}

import {
  canUnlockHero,
  getHeroDef,
  getHeroElement,
  getHeroSkinDef,
  getHeroUnlockReq,
  HEROES,
  HeroId,
  STARTER_HERO_IDS,
} from './heroes';
import type { HeroAnimKey } from './sprites';

export interface GhostSprite {
  active: boolean;
  heroId: HeroId;
  anim: HeroAnimKey;
  frameIdx: number;
  x: number;
  y: number;
  facing: 1 | -1;
  color: string;
  alpha: number;
}

export interface LiveEntity {
  def: RoomEntityDef;
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
  state: 'idle' | 'windup' | 'active' | 'return' | 'dead' | 'lit' | 'open' | 'retreat';
  hp: number;
  maxHp: number;
  dir: 1 | -1;
  flash: number;
  koTimer: number;
  collected: boolean;
  attackIdx?: number;
  tx?: number;
  ty?: number;
  aimX?: number;
  aimY?: number;
  bossSubState?: BossSubState;
  stagger?: number;
  maxStagger?: number;
  recoverTimer?: number;
  trail?: { x: number; y: number }[];
  subType?: ElementType;
  elementMark?: ElementType | null;
  elementTimer?: number;
  isElite?: boolean;
  hitInvulnTimer?: number;
  immunePopCd?: number;
}

export interface Projectile {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  gravity: number;
  homing: boolean;
  friendly: boolean;
  pierceWalls: boolean;
  color: string;
  life: number;
}

export interface HazardBeam {
  active: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
  windup: number;
  activeTime: number;
  state: 'windup' | 'active';
}

export interface TileRuntime {
  state: 'solid' | 'shaking' | 'gone' | 'faded';
  timer: number;
}

export interface ShockwaveRing {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface ImpactSlash {
  active: boolean;
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  color: string;
  life: number;
  maxLife: number;
  cross: boolean;
}

const SAVE_KEY = 'aethelgard_stages_v2';
const PARTICLE_POOL_SIZE = 1280;
const GHOST_POOL_SIZE = 48;
const PROJECTILE_POOL_SIZE = 128;
const BEAM_POOL_SIZE = 24;
const SHOCKWAVE_POOL_SIZE = 64;
const FLOATING_TEXT_POOL_SIZE = 64;
const IMPACT_SLASH_POOL_SIZE = 48;

export class GameEngine {
  /** Rocket Pack fuel (seconds of thrust left). */
  public jetFuel = 0;
  /** Star shards collected in the current stage (5 = bonus). */
  public starShards = 0;
  public mode: GameModeState = 'title';
  public heroId: HeroId = 'lyra';
  public heroSkinByHero: Partial<Record<HeroId, string>> = {};
  public chapters: ChapterDef[] = CHAPTERS;
  public chapterIndex = 0;
  public rooms: RoomDef[];
  public roomMap: Map<string, RoomDef>;
  public currentRoom: RoomDef;
  public player: PlayerState;

  public liveEntities: LiveEntity[] = [];
  public tileStates: Map<number, TileRuntime> = new Map();
  public particles: Particle[];
  private particleHead = 0;
  public ghosts: GhostSprite[];
  private ghostHead = 0;
  public playMode: PlayModeId = 'campaign';
  public bossRushIndex = 0;
  public bossRushAdvanceTimer = 0;
  public survivalWave = 0;
  public survivalKills = 0;
  public survivalWaveTimer = 0;
  public bestSurvivalWave = 0;
  public bestBossRushSeconds: number | null = null;
  public towerFloor = 0;
  public bestTowerFloor = 0;
  public playerXp = 0;
  public unlockedHeroes: Set<HeroId> = new Set(STARTER_HERO_IDS);
  public projectiles: Projectile[];
  private projHead = 0;
  public beams: HazardBeam[];
  private beamHead = 0;
  public shockwaves: ShockwaveRing[];
  private shockwaveHead = 0;
  public floatingTexts: FloatingText[];
  private floatingTextHead = 0;
  public impactSlashes: ImpactSlash[];
  private impactSlashHead = 0;
  private prevWalkDust = 0;
  private wasInWater = false;

  public ambientMotes: { x: number; y: number; speed: number; size: number; phase: number }[] = [];

  public beatTimer = 0;
  public beatPhase: 0 | 1 = 0;
  public hitstop = 0;
  public trauma = 0;
  public damageFlashTimer = 0;
  public damageFlashColor = '#ff2244';
  public hitFlashTimer = 0;
  public hitFlashColor = '#ffe47a';
  public hitFlashX = 0;
  public hitFlashY = 0;
  public chromaticShakeTimer = 0;
  public speedLinesTimer = 0;
  public shakeDirX = 0;
  public shakeDirY = 0;
  public wipeTimer = 0;
  public wipeMode: 'none' | 'out' | 'in' = 'none';
  public transitionTimer = 0;
  public transitionDir: { dx: number; dy: number } = { dx: 0, dy: 0 };
  public prevRoomSnapshot: RoomDef | null = null;

  public cameraX = 0;
  public cameraY = 0;

  public deaths = 0;
  public elapsedSeconds = 0;
  public chapterDeaths = 0;
  public chapterElapsedSeconds = 0;
  public chapterRecords: ChapterSaveRecord[];
  public underworldChapterRecords: ChapterSaveRecord[];
  public underworldWorldStars: Record<number, number> = {};
  public soulCharge = 50;
  public activeCampaignSet: 'surface' | 'underworld' = 'surface';
  public visitedRooms: Set<string> = new Set();
  public collectedRelics: Set<string> = new Set();
  public unlockedShrines: Set<string> = new Set();
  public discoveredMechanics: Set<string> = new Set(['SOLID_TERRAIN', 'SEAMLESS_WORLD', 'COMPENDIUM_TRACKER']);
  public openedDoors: Set<string> = new Set();
  public collectedCoins: Set<string> = new Set();
  public astralCoins = 0;
  public comboCount = 0;
  public comboTimer = 0;
  public styleScore = 0;
  public overdrive = 0;
  public overdriveTimer = 0;
  public activeCutscene: CutsceneId | null = null;
  public seenCutscenes: Set<CutsceneId> = new Set();
  public skipNextAutoCutscene = false;
  public onRumble?: (durationMs: number, weak: number, strong: number) => void;
  public heroSkillCooldown = 0;
  public roomRespawnOverride: { roomId: string; x: number; y: number } | null = null;
  public openedChests: Set<string> = new Set();
  public openBlessingsRequested = false;
  public blessings: BlessingUpgrades = {
    speedLv: 0,
    staminaLv: 0,
    skillCdLv: 0,
    magnetLv: 0,
  };
  public stompChain = 0;
  public victory = false;
  public hardcoreGameOver = false;

  // 10 New Complex Systems State
  public equippedRunes: RuneId[] = ['furia_carmesim', 'passos_fantasma'];
  public unlockedRunes: Set<RuneId> = new Set(['furia_carmesim', 'passos_fantasma']);
  public equippedSpirit: SpiritId = 'coruja_runica';
  public unlockedSpirits: Set<SpiritId> = new Set(['coruja_runica']);
  public spiritX = 0;
  public spiritY = 0;
  public spiritShootTimer = 2.6;
  public tagHeroId: HeroId = 'zephyr';
  public tagSwapCooldown = 0;
  public roomWeather: WeatherKind = 'clear';
  public riftActive = false;
  public riftRings: { x: number; y: number; collected: boolean }[] = [];
  public riftProgress = 0;
  public riftTotal = 5;
  public riftTimer = 0;
  public completedRifts: Set<string> = new Set();
  public mastery: MasteryTreeState = {
    mobilityLv: 0,
    combatLv: 0,
    explorationLv: 0,
    survivalLv: 0,
    xp: 35,
  };
  public unlockedAchievements: Set<string> = new Set();
  public ghostEnabled = true;
  public ghostRoomClock = 0;
  public ghostRecording: GhostFrame[] = [];
  public ghostRecordAccum = 0;
  public ghostBestByRoom: Record<string, { time: number; frames: GhostFrame[] }> = {};
  public activeGrappleId: string | null = null;
  public grappleAngle = 0;
  public grappleAngVel = 0;
  public grappleRadius = 28;
  public grappleCooldown = 0;

  // +100 Ambitious Systems State
  public activeBoons: BoonId[] = [];
  public pendingBoonChoices: BoonId[] | null = null;
  public equippedTalisman: TalismanId = 'selo_cinza';
  public unlockedTalismans: Set<TalismanId> = new Set(['selo_cinza']);
  public activeTitle: TitleId = 'viajante';
  public claimedContracts: Set<string> = new Set();
  public bestiaryDefeats: Record<string, number> = {};
  public perfectDodges = 0;
  public perfectDodgeCooldown = 0;
  public crownShardsCollected = 0;
  public totalParries = 0;
  public totalReactions = 0;
  public totalStyleSS = 0;
  public aegisRegenTimer = 0;
  public phoenixAshUsedInRoom = false;
  public vampiricHits = 0;
  public imbuedElement: ElementType | null = null;
  public imbuedTimer = 0;
  public echoCloneTimer = 0;
  public echoHistory: { x: number; y: number; facing: 1 | -1 }[] = [];
  public echoCloneX = 0;
  public echoCloneY = 0;
  public echoCloneFacing: 1 | -1 = 1;
  public jukeboxTrackId = 'cinzas_tema';

  // Passe Estelar, Missões, Estrelas de Mundo, Cofre Diário, Trilhas de Aura & Caçadas
  public passXp = 0;
  public passAstralUnlocked = false;
  public claimedFreePassTiers: Set<number> = new Set();
  public claimedAstralPassTiers: Set<number> = new Set();
  public claimedMissions: Set<string> = new Set();
  public missionStats = {
    enemiesDefeated: 0,
    stagesCleared: 0,
    dashesUsed: 0,
    perfectDodges: 0,
    bossesDefeated: 0,
    relicsCollected: 0,
    coinsEarned: 0,
    styleSSCount: 0,
  };
  public worldStars: Record<number, number> = {};
  public claimedStarMilestones: Set<number> = new Set();
  public dailyStreakDay = 0;
  public lastDailyClaimDate = '';
  public equippedAuraTrail: AuraTrailId = 'none';
  public unlockedAuraTrails: Set<AuraTrailId> = new Set(['none']);
  public enemyKills: Record<string, number> = {};
  public claimedEnemyBounties: Set<string> = new Set();
  public litBeacons: Set<string> = new Set();
  public readTablets: Set<string> = new Set();
  public sideQuestProgress: Record<string, number> = {};
  public claimedSideQuests: Set<string> = new Set();
  public discoveredSectors: Record<string, number[]> = {};

  // Ambitious RPG, Equipment (10-slot), Crafting, 3x Hero Evolution, Pets & Open Sandbox State
  public craftingMaterials: Record<MaterialId, number> = createStarterMaterials();
  public activeAlchemyBuffs: { id: string; name: string; color: string; remainingSec: number }[] = [];
  public heroEquipment: Record<string, Partial<Record<EquipSlot, string>>> = {};
  public equipmentInventory: EquipmentItem[] = [];
  public heroEvolutions: Record<string, number> = {};
  public petLevels: Record<string, number> = { coruja_runica: 1 };
  public petBondXp: Record<string, number> = { coruja_runica: 0 };
  public petSkillCooldown = 0;
  public sandboxWorld: SandboxWorld | null = null;
  public sandboxHotbar: SandboxHotbarSlot[] = createStarterHotbar();
  public sandboxBackpack: SandboxHotbarSlot[] = [];
  public sandboxSelectedSlot = 0;
  public sandboxToolTier = 1;
  public sandboxQuestsClaimed: Set<string> = new Set();
  public sandboxHoverTx = -1;
  public sandboxHoverTy = -1;
  public sandboxSwingTimer = 0;
  public sandboxSwingAngle = 0;
  public sandboxSwingKind: 'tool' | 'weapon' = 'tool';
  private sandboxCrystalCooldown = 0;
  private sandboxSpiritBoltCooldown = 0;
  private pendingSandboxDelta: SandboxDeltaSave | null = null;

  public dialogue: DialogueState | null = null;
  public bannerTitle: string | null = null;
  public bannerSub: string | null = null;
  public bannerTimer = 0;
  public recentMechanicToast: string | null = null;
  public mechanicToastTimer = 0;

  public assist: AssistOptions = {
    gameSpeed: 1,
    infiniteStamina: false,
    extraDash: false,
    invincible: false,
    hardcoreMode: false,
    lowGravity: false,
    turboMode: false,
  };

  private lastBiomeBanner: AnyBiomeId | null = null;
  private onHudChange: (snap: HudSnapshot) => void;
  private hudThrottle = 0;
  private lockedGoalToastCooldown = 0;

  constructor(onHudChange: (snap: HudSnapshot) => void) {
    this.onHudChange = onHudChange;
    this.chapters = CHAPTERS;
    const survivalRoom = createSurvivalArenaRoom();
    this.rooms = [...CHAPTERS.flatMap((c) => c.stages), ...UNDERWORLD_CHAPTERS.flatMap((c) => c.stages)];
    this.roomMap = new Map(this.rooms.map((r) => [r.id, r]));
    this.roomMap.set(survivalRoom.id, survivalRoom);
    this.chapterRecords = CHAPTERS.map((_, idx) => ({
      unlocked: idx === 0,
      cleared: false,
      bestTimeSeconds: null,
      fewestDeaths: null,
    }));
    this.underworldChapterRecords = UNDERWORLD_CHAPTERS.map((_, idx) => ({
      unlocked: idx === 0,
      cleared: false,
      bestTimeSeconds: null,
      fewestDeaths: null,
    }));
    const startCh = this.chapters[0];
    this.currentRoom = this.roomMap.get(startCh.startStageId) ?? startCh.stages[0];
    this.visitedRooms.add(this.currentRoom.id);
    this.unlockedShrines.add(this.currentRoom.id);
    const starterEq = createStarterEquipmentInventory();
    this.equipmentInventory = starterEq.inventory;
    this.heroEquipment = starterEq.heroEquipment;
    this.player = createInitialPlayer(
      this.currentRoom.spawnX,
      this.currentRoom.spawnY,
      this.heroId,
      this.getHeroSkinId()
    );

    this.particles = Array.from({ length: PARTICLE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 1,
      color: '#fff',
      gravity: 0,
    }));

    this.ghosts = Array.from({ length: GHOST_POOL_SIZE }, () => ({
      active: false,
      heroId: 'lyra' as HeroId,
      anim: 'dash' as HeroAnimKey,
      frameIdx: 0,
      x: 0,
      y: 0,
      facing: 1,
      color: '#52e5ff',
      alpha: 0,
    }));

    this.projectiles = Array.from({ length: PROJECTILE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 3,
      gravity: 0,
      homing: false,
      friendly: false,
      pierceWalls: false,
      color: '#ff6688',
      life: 0,
    }));

    this.beams = Array.from({ length: BEAM_POOL_SIZE }, () => ({
      active: false,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      width: 6,
      color: '#ffd27d',
      windup: 0.6,
      activeTime: 0.4,
      state: 'windup',
    }));

    this.shockwaves = Array.from({ length: SHOCKWAVE_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 2,
      maxRadius: 24,
      color: '#52e5ff',
      life: 0,
      maxLife: 0.3,
    }));

    this.floatingTexts = Array.from({ length: FLOATING_TEXT_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      vy: -22,
      text: '',
      color: '#ffffff',
      life: 0,
      maxLife: 0.85,
    }));

    this.impactSlashes = Array.from({ length: IMPACT_SLASH_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      length: 24,
      width: 4,
      color: '#ffe47a',
      life: 0,
      maxLife: 0.2,
      cross: false,
    }));

    this.ambientMotes = Array.from({ length: 56 }, (_, i) => ({
      x: (i * 47) % VIRTUAL_WIDTH,
      y: (i * 31) % VIRTUAL_HEIGHT,
      speed: 8 + (i % 5) * 4,
      size: i % 4 === 0 ? 2 : 1,
      phase: i * 0.7,
    }));

    this.loadSave();
    this.enterRoom(this.currentRoom.id, false, null);
    this.snapCamera();
    this.emitHud();
  }

  public snapCamera(): void {
    const roomW = this.currentRoom.cols * TILE_SIZE;
    const roomH = this.currentRoom.rows * TILE_SIZE;
    const maxX = Math.max(0, roomW - VIRTUAL_WIDTH);
    const maxY = Math.max(0, roomH - VIRTUAL_HEIGHT);
    const lookAhead = this.player.facing * 24;
    const targetX = this.player.x + this.player.w * 0.5 - VIRTUAL_WIDTH * 0.5 + lookAhead;
    const targetY = this.player.y + this.player.h * 0.5 - VIRTUAL_HEIGHT * 0.54;
    this.cameraX = Math.max(0, Math.min(maxX, targetX));
    this.cameraY = Math.max(0, Math.min(maxY, targetY));
  }

  private updateCamera(dt: number): void {
    const roomW = this.currentRoom.cols * TILE_SIZE;
    const roomH = this.currentRoom.rows * TILE_SIZE;
    const maxX = Math.max(0, roomW - VIRTUAL_WIDTH);
    const maxY = Math.max(0, roomH - VIRTUAL_HEIGHT);
    const lookAhead = this.player.facing * 26 + this.player.vx * 0.08;
    const targetX = Math.max(
      0,
      Math.min(maxX, this.player.x + this.player.w * 0.5 - VIRTUAL_WIDTH * 0.5 + lookAhead)
    );
    const targetY = Math.max(
      0,
      Math.min(maxY, this.player.y + this.player.h * 0.5 - VIRTUAL_HEIGHT * 0.54)
    );
    const smoothX = 1 - Math.exp(-9.5 * dt);
    const smoothY = 1 - Math.exp(-8.0 * dt);
    this.cameraX += (targetX - this.cameraX) * smoothX;
    this.cameraY += (targetY - this.cameraY) * smoothY;
    if (Math.abs(targetX - this.cameraX) < 0.15) this.cameraX = targetX;
    if (Math.abs(targetY - this.cameraY) < 0.15) this.cameraY = targetY;
  }

  public spawnShockwave(
    x: number,
    y: number,
    maxRadius: number,
    color: string,
    life = 0.28
  ): void {
    const sw = this.shockwaves[this.shockwaveHead];
    this.shockwaveHead = (this.shockwaveHead + 1) % SHOCKWAVE_POOL_SIZE;
    sw.active = true;
    sw.x = x;
    sw.y = y;
    sw.radius = 2;
    sw.maxRadius = maxRadius;
    sw.color = color;
    sw.life = life;
    sw.maxLife = life;
  }

  public spawnImpactSlash(
    x: number,
    y: number,
    angle: number,
    length = 24,
    width = 4,
    color = '#ffe47a',
    cross = false,
    life = 0.2
  ): void {
    const sl = this.impactSlashes[this.impactSlashHead];
    this.impactSlashHead = (this.impactSlashHead + 1) % IMPACT_SLASH_POOL_SIZE;
    sl.active = true;
    sl.x = x;
    sl.y = y;
    sl.angle = angle;
    sl.length = length;
    sl.width = width;
    sl.color = color;
    sl.life = life;
    sl.maxLife = life;
    sl.cross = cross;
  }

  public unlockMechanic(code: string): void {
    if (this.discoveredMechanics.has(code)) return;
    this.discoveredMechanics.add(code);
    const meta = MECHANICS_CATALOG.find((m) => m.code === code);
    if (meta) {
      this.recentMechanicToast = `${meta.name} (#${meta.id}/${TOTAL_MECHANICS})`;
      this.mechanicToastTimer = 2.6;
    }
  }

  public getHeroSkinId(heroId: HeroId = this.heroId): string {
    return getHeroSkinDef(heroId, this.heroSkinByHero[heroId]).id;
  }

  public getBossPhase(hp: number, maxHp: number): 1 | 2 | 3 {
    if (hp <= Math.floor(maxHp * 0.35)) return 3;
    if (hp <= Math.floor(maxHp * 0.68)) return 2;
    return 1;
  }

  private loadSave(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.heroSkinByHero && typeof data.heroSkinByHero === 'object') {
        const cleaned: Partial<Record<HeroId, string>> = {};
        for (const [k, v] of Object.entries(data.heroSkinByHero)) {
          if (typeof v === 'string') {
            const hDef = getHeroDef(k);
            cleaned[hDef.id] = getHeroSkinDef(hDef.id, v).id;
          }
        }
        this.heroSkinByHero = cleaned;
      }
      if (typeof data.heroId === 'string') {
        this.heroId = getHeroDef(data.heroId).id;
        this.player.heroId = this.heroId;
        this.player.skinId = this.getHeroSkinId();
      }
      if (typeof data.playMode === 'string' && data.playMode === 'underworld') {
        this.playMode = 'underworld';
        this.activeCampaignSet = 'underworld';
        this.chapters = UNDERWORLD_CHAPTERS;
      }
      if (typeof data.chapterIndex === 'number' && this.chapters[data.chapterIndex]) {
        this.chapterIndex = data.chapterIndex;
      }
      if (data.currentRoomId && this.roomMap.has(data.currentRoomId)) {
        this.currentRoom = this.roomMap.get(data.currentRoomId)!;
        if (this.currentRoom.id.startsWith('uw_')) {
          this.playMode = 'underworld';
          this.activeCampaignSet = 'underworld';
          this.chapters = UNDERWORLD_CHAPTERS;
        } else if (this.playMode === 'underworld') {
          this.playMode = 'campaign';
          this.activeCampaignSet = 'surface';
          this.chapters = CHAPTERS;
        }
        this.chapterIndex = this.currentRoom.chapterIndex;
      }
      if (Array.isArray(data.chapterRecords)) {
        data.chapterRecords.forEach((rec: ChapterSaveRecord, idx: number) => {
          if (this.chapterRecords[idx]) this.chapterRecords[idx] = { ...this.chapterRecords[idx], ...rec };
        });
        this.chapterRecords[0].unlocked = true;
      }
      if (Array.isArray(data.underworldChapterRecords)) {
        data.underworldChapterRecords.forEach((rec: ChapterSaveRecord, idx: number) => {
          if (this.underworldChapterRecords[idx]) {
            this.underworldChapterRecords[idx] = { ...this.underworldChapterRecords[idx], ...rec };
          }
        });
        this.underworldChapterRecords[0].unlocked = true;
      }
      if (data.underworldWorldStars && typeof data.underworldWorldStars === 'object') {
        for (const [k, v] of Object.entries(data.underworldWorldStars)) {
          const idx = Number(k);
          const s = Number(v);
          if (!Number.isNaN(idx) && !Number.isNaN(s)) {
            this.underworldWorldStars[idx] = Math.max(0, Math.min(3, Math.floor(s)));
          }
        }
      }
      if (typeof data.soulCharge === 'number') {
        this.soulCharge = Math.max(0, Math.min(100, Math.round(data.soulCharge)));
      }
      if (typeof data.deaths === 'number') this.deaths = data.deaths;
      if (typeof data.elapsedSeconds === 'number') this.elapsedSeconds = data.elapsedSeconds;
      if (Array.isArray(data.visitedRooms)) data.visitedRooms.forEach((id: string) => this.visitedRooms.add(id));
      if (Array.isArray(data.collectedRelics)) data.collectedRelics.forEach((id: string) => this.collectedRelics.add(id));
      if (Array.isArray(data.unlockedShrines)) data.unlockedShrines.forEach((id: string) => this.unlockedShrines.add(id));
      if (Array.isArray(data.discoveredMechanics)) data.discoveredMechanics.forEach((id: string) => this.discoveredMechanics.add(id));
      if (Array.isArray(data.openedDoors)) data.openedDoors.forEach((id: string) => this.openedDoors.add(id));
      if (Array.isArray(data.collectedCoins)) data.collectedCoins.forEach((id: string) => this.collectedCoins.add(id));
      if (Array.isArray(data.openedChests)) data.openedChests.forEach((id: string) => this.openedChests.add(id));
      if (Array.isArray(data.seenCutscenes)) {
        data.seenCutscenes.forEach((id: CutsceneId) => {
          if (CUTSCENES[id]) this.seenCutscenes.add(id);
        });
      }
      if (typeof data.astralCoins === 'number') this.astralCoins = data.astralCoins;
      if (typeof data.styleScore === 'number') this.styleScore = data.styleScore;
      if (typeof data.bestSurvivalWave === 'number') this.bestSurvivalWave = data.bestSurvivalWave;
      if (typeof data.bestBossRushSeconds === 'number') this.bestBossRushSeconds = data.bestBossRushSeconds;
      if (typeof data.bestTowerFloor === 'number') this.bestTowerFloor = Math.max(0, Math.floor(data.bestTowerFloor));
      if (typeof data.playerXp === 'number') this.playerXp = Math.max(0, Math.floor(data.playerXp));
      if (Array.isArray(data.unlockedHeroes)) {
        data.unlockedHeroes.forEach((id: string) => {
          const h = getHeroDef(id);
          this.unlockedHeroes.add(h.id);
        });
      }
      // Guarantee starters & any already-equipped legacy saved heroes are unlocked
      for (const starter of STARTER_HERO_IDS) this.unlockedHeroes.add(starter);
      this.unlockedHeroes.add(this.heroId);
      if (data.blessings && typeof data.blessings === 'object') {
        this.blessings = {
          speedLv: Math.max(0, Math.min(3, Number(data.blessings.speedLv) || 0)),
          staminaLv: Math.max(0, Math.min(3, Number(data.blessings.staminaLv) || 0)),
          skillCdLv: Math.max(0, Math.min(3, Number(data.blessings.skillCdLv) || 0)),
          magnetLv: Math.max(0, Math.min(2, Number(data.blessings.magnetLv) || 0)),
        };
      }
      if (Array.isArray(data.unlockedRunes)) {
        data.unlockedRunes.forEach((id: RuneId) => {
          if (id in RUNE_MAP) this.unlockedRunes.add(id);
        });
      }
      if (Array.isArray(data.equippedRunes)) {
        this.equippedRunes = (data.equippedRunes as RuneId[]).filter((id) => id in RUNE_MAP).slice(0, 3);
      }
      if (typeof data.equippedSpirit === 'string' && (data.equippedSpirit === 'none' || data.equippedSpirit in SPIRIT_MAP || data.equippedSpirit in DETAILED_PET_MAP)) {
        this.equippedSpirit = data.equippedSpirit as SpiritId;
      }
      if (Array.isArray(data.unlockedSpirits)) {
        data.unlockedSpirits.forEach((id: SpiritId) => {
          if (id in SPIRIT_MAP || id in DETAILED_PET_MAP) this.unlockedSpirits.add(id);
        });
      }
      if (typeof data.tagHeroId === 'string') {
        this.tagHeroId = getHeroDef(data.tagHeroId).id;
        this.unlockedHeroes.add(this.tagHeroId);
      }
      if (data.mastery && typeof data.mastery === 'object') {
        this.mastery = {
          mobilityLv: Math.max(0, Math.min(10, Number(data.mastery.mobilityLv) || 0)),
          combatLv: Math.max(0, Math.min(10, Number(data.mastery.combatLv) || 0)),
          explorationLv: Math.max(0, Math.min(10, Number(data.mastery.explorationLv) || 0)),
          survivalLv: Math.max(0, Math.min(10, Number(data.mastery.survivalLv) || 0)),
          xp: Math.max(0, Number(data.mastery.xp) || 0),
        };
      }
      if (Array.isArray(data.unlockedAchievements)) {
        data.unlockedAchievements.forEach((id: string) => this.unlockedAchievements.add(id));
      }
      if (Array.isArray(data.completedRifts)) {
        data.completedRifts.forEach((id: string) => this.completedRifts.add(id));
      }
      if (typeof data.ghostEnabled === 'boolean') {
        this.ghostEnabled = data.ghostEnabled;
      }
      if (data.ghostBestByRoom && typeof data.ghostBestByRoom === 'object') {
        this.ghostBestByRoom = data.ghostBestByRoom;
      }
      if (Array.isArray(data.activeBoons)) {
        this.activeBoons = (data.activeBoons as BoonId[]).filter((id) => id in BOON_MAP);
      }
      if (typeof data.equippedTalisman === 'string' && (data.equippedTalisman === 'none' || data.equippedTalisman in TALISMAN_MAP)) {
        this.equippedTalisman = data.equippedTalisman as TalismanId;
      }
      if (Array.isArray(data.unlockedTalismans)) {
        data.unlockedTalismans.forEach((id: TalismanId) => {
          if (id in TALISMAN_MAP) this.unlockedTalismans.add(id);
        });
      }
      if (typeof data.activeTitle === 'string') {
        this.activeTitle = data.activeTitle as TitleId;
      }
      if (Array.isArray(data.claimedContracts)) {
        data.claimedContracts.forEach((id: string) => this.claimedContracts.add(id));
      }
      if (data.bestiaryDefeats && typeof data.bestiaryDefeats === 'object') {
        this.bestiaryDefeats = data.bestiaryDefeats;
      }
      if (typeof data.perfectDodges === 'number') this.perfectDodges = data.perfectDodges;
      if (typeof data.crownShardsCollected === 'number') this.crownShardsCollected = data.crownShardsCollected;
      if (typeof data.totalParries === 'number') this.totalParries = data.totalParries;
      if (typeof data.totalReactions === 'number') this.totalReactions = data.totalReactions;
      if (typeof data.totalStyleSS === 'number') this.totalStyleSS = data.totalStyleSS;
      if (typeof data.jukeboxTrackId === 'string') this.jukeboxTrackId = data.jukeboxTrackId;
      if (typeof data.passXp === 'number') this.passXp = Math.max(0, Math.floor(data.passXp));
      if (typeof data.passAstralUnlocked === 'boolean') this.passAstralUnlocked = data.passAstralUnlocked;
      if (Array.isArray(data.claimedFreePassTiers)) {
        data.claimedFreePassTiers.forEach((t: number) => {
          if (typeof t === 'number') this.claimedFreePassTiers.add(t);
        });
      }
      if (Array.isArray(data.claimedAstralPassTiers)) {
        data.claimedAstralPassTiers.forEach((t: number) => {
          if (typeof t === 'number') this.claimedAstralPassTiers.add(t);
        });
      }
      if (Array.isArray(data.claimedMissions)) {
        data.claimedMissions.forEach((id: string) => {
          if (typeof id === 'string') this.claimedMissions.add(id);
        });
      }
      if (data.missionStats && typeof data.missionStats === 'object') {
        this.missionStats = {
          enemiesDefeated: Number(data.missionStats.enemiesDefeated) || 0,
          stagesCleared: Number(data.missionStats.stagesCleared) || 0,
          dashesUsed: Number(data.missionStats.dashesUsed) || 0,
          perfectDodges: Number(data.missionStats.perfectDodges) || 0,
          bossesDefeated: Number(data.missionStats.bossesDefeated) || 0,
          relicsCollected: Number(data.missionStats.relicsCollected) || 0,
          coinsEarned: Number(data.missionStats.coinsEarned) || 0,
          styleSSCount: Number(data.missionStats.styleSSCount) || 0,
        };
      }
      if (data.worldStars && typeof data.worldStars === 'object') {
        for (const [k, v] of Object.entries(data.worldStars)) {
          const idx = Number(k);
          const s = Number(v);
          if (!Number.isNaN(idx) && !Number.isNaN(s)) {
            this.worldStars[idx] = Math.max(0, Math.min(3, Math.floor(s)));
          }
        }
      }
      if (Array.isArray(data.claimedStarMilestones)) {
        data.claimedStarMilestones.forEach((s: number) => {
          if (typeof s === 'number') this.claimedStarMilestones.add(s);
        });
      }
      if (typeof data.dailyStreakDay === 'number') this.dailyStreakDay = Math.max(0, Math.floor(data.dailyStreakDay));
      if (typeof data.lastDailyClaimDate === 'string') this.lastDailyClaimDate = data.lastDailyClaimDate;
      if (typeof data.equippedAuraTrail === 'string' && data.equippedAuraTrail in AURA_TRAIL_MAP) {
        this.equippedAuraTrail = data.equippedAuraTrail as AuraTrailId;
      }
      if (Array.isArray(data.unlockedAuraTrails)) {
        data.unlockedAuraTrails.forEach((id: AuraTrailId) => {
          if (id in AURA_TRAIL_MAP) this.unlockedAuraTrails.add(id);
        });
      }
      this.unlockedAuraTrails.add('none');
      if (data.enemyKills && typeof data.enemyKills === 'object') {
        this.enemyKills = { ...data.enemyKills };
      }
      if (Array.isArray(data.claimedEnemyBounties)) {
        data.claimedEnemyBounties.forEach((k: string) => {
          if (typeof k === 'string') this.claimedEnemyBounties.add(k);
        });
      }
      if (Array.isArray(data.litBeacons)) {
        data.litBeacons.forEach((k: string) => {
          if (typeof k === 'string') this.litBeacons.add(k);
        });
      }
      if (Array.isArray(data.readTablets)) {
        data.readTablets.forEach((k: string) => {
          if (typeof k === 'string') this.readTablets.add(k);
        });
      }
      if (data.sideQuestProgress && typeof data.sideQuestProgress === 'object') {
        for (const [k, v] of Object.entries(data.sideQuestProgress)) {
          if (typeof v === 'number' && !Number.isNaN(v)) {
            this.sideQuestProgress[k] = Math.max(0, Math.floor(v));
          }
        }
      }
      if (Array.isArray(data.claimedSideQuests)) {
        data.claimedSideQuests.forEach((k: string) => {
          if (typeof k === 'string') this.claimedSideQuests.add(k);
        });
      }
      if (data.discoveredSectors && typeof data.discoveredSectors === 'object') {
        for (const [k, v] of Object.entries(data.discoveredSectors)) {
          if (Array.isArray(v)) {
            this.discoveredSectors[k] = v.filter((n) => typeof n === 'number' && n >= 0 && n < STAGE_EXPLORATION_SECTORS);
          }
        }
      }
      if (data.craftingMaterials && typeof data.craftingMaterials === 'object') {
        this.craftingMaterials = { ...createStarterMaterials(), ...data.craftingMaterials };
      }
      if (Array.isArray(data.equipmentInventory) && data.equipmentInventory.length > 0) {
        this.equipmentInventory = data.equipmentInventory;
      }
      if (data.heroEquipment && typeof data.heroEquipment === 'object') {
        this.heroEquipment = data.heroEquipment;
      }
      if (data.heroEvolutions && typeof data.heroEvolutions === 'object') {
        this.heroEvolutions = { ...data.heroEvolutions };
      }
      if (data.petLevels && typeof data.petLevels === 'object') {
        this.petLevels = { coruja_runica: 1, ...data.petLevels };
      }
      if (data.petBondXp && typeof data.petBondXp === 'object') {
        this.petBondXp = { coruja_runica: 0, ...data.petBondXp };
      }
      if (typeof data.sandboxToolTier === 'number') {
        this.sandboxToolTier = Math.max(1, Math.min(6, Math.floor(data.sandboxToolTier)));
        const pickSlot = this.sandboxHotbar.find((s) => s.kind === 'tool');
        if (pickSlot) pickSlot.name = `Picareta T${this.sandboxToolTier}`;
      }
      if (Array.isArray(data.sandboxBackpack)) {
        this.sandboxBackpack = data.sandboxBackpack.filter(
          (s: any) => s && typeof s.id === 'string' && typeof s.name === 'string' && typeof s.count === 'number' && s.count > 0
        );
      }
      if (Array.isArray(data.sandboxQuestsClaimed)) {
        data.sandboxQuestsClaimed.forEach((id: string) => {
          if (typeof id === 'string') this.sandboxQuestsClaimed.add(id);
        });
      }
      if (data.sandboxDelta && typeof data.sandboxDelta === 'object') {
        this.pendingSandboxDelta = data.sandboxDelta as SandboxDeltaSave;
      }
      this.unlockMechanic('AUTO_SAVE');
    } catch {
      // Ignore corrupt storage
    }
  }

  public saveProgress(): void {
    if (typeof window === 'undefined') return;
    try {
      const ghostEntries = Object.entries(this.ghostBestByRoom).slice(-20);
      window.localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          heroId: this.heroId,
          heroSkinByHero: this.heroSkinByHero,
          chapterIndex: this.chapterIndex,
          chapterRecords: this.chapterRecords,
          currentRoomId: this.currentRoom.id,
          deaths: this.deaths,
          elapsedSeconds: this.elapsedSeconds,
          astralCoins: this.astralCoins,
          blessings: this.blessings,
          collectedCoins: Array.from(this.collectedCoins),
          visitedRooms: Array.from(this.visitedRooms),
          collectedRelics: Array.from(this.collectedRelics),
          unlockedShrines: Array.from(this.unlockedShrines),
          discoveredMechanics: Array.from(this.discoveredMechanics),
          openedDoors: Array.from(this.openedDoors),
          openedChests: Array.from(this.openedChests),
          seenCutscenes: Array.from(this.seenCutscenes),
          styleScore: this.styleScore,
          bestSurvivalWave: this.bestSurvivalWave,
          bestBossRushSeconds: this.bestBossRushSeconds,
          bestTowerFloor: this.bestTowerFloor,
          playerXp: this.playerXp,
          unlockedHeroes: Array.from(this.unlockedHeroes),
          equippedRunes: this.equippedRunes,
          unlockedRunes: Array.from(this.unlockedRunes),
          equippedSpirit: this.equippedSpirit,
          unlockedSpirits: Array.from(this.unlockedSpirits),
          tagHeroId: this.tagHeroId,
          mastery: this.mastery,
          unlockedAchievements: Array.from(this.unlockedAchievements),
          completedRifts: Array.from(this.completedRifts),
          ghostEnabled: this.ghostEnabled,
          ghostBestByRoom: Object.fromEntries(ghostEntries),
          activeBoons: this.activeBoons,
          equippedTalisman: this.equippedTalisman,
          unlockedTalismans: Array.from(this.unlockedTalismans),
          activeTitle: this.activeTitle,
          claimedContracts: Array.from(this.claimedContracts),
          bestiaryDefeats: this.bestiaryDefeats,
          perfectDodges: this.perfectDodges,
          crownShardsCollected: this.crownShardsCollected,
          totalParries: this.totalParries,
          totalReactions: this.totalReactions,
          totalStyleSS: this.totalStyleSS,
          jukeboxTrackId: this.jukeboxTrackId,
          passXp: this.passXp,
          passAstralUnlocked: this.passAstralUnlocked,
          claimedFreePassTiers: Array.from(this.claimedFreePassTiers),
          claimedAstralPassTiers: Array.from(this.claimedAstralPassTiers),
          claimedMissions: Array.from(this.claimedMissions),
          missionStats: this.missionStats,
          worldStars: this.worldStars,
          claimedStarMilestones: Array.from(this.claimedStarMilestones),
          dailyStreakDay: this.dailyStreakDay,
          lastDailyClaimDate: this.lastDailyClaimDate,
          equippedAuraTrail: this.equippedAuraTrail,
          unlockedAuraTrails: Array.from(this.unlockedAuraTrails),
          enemyKills: this.enemyKills,
          claimedEnemyBounties: Array.from(this.claimedEnemyBounties),
          playMode: this.playMode === 'underworld' ? 'underworld' : 'campaign',
          underworldChapterRecords: this.underworldChapterRecords,
          underworldWorldStars: this.underworldWorldStars,
          soulCharge: this.soulCharge,
          litBeacons: Array.from(this.litBeacons),
          readTablets: Array.from(this.readTablets),
          sideQuestProgress: this.sideQuestProgress,
          claimedSideQuests: Array.from(this.claimedSideQuests),
          discoveredSectors: this.discoveredSectors,
          craftingMaterials: this.craftingMaterials,
          equipmentInventory: this.equipmentInventory,
          heroEquipment: this.heroEquipment,
          heroEvolutions: this.heroEvolutions,
          petLevels: this.petLevels,
          petBondXp: this.petBondXp,
          sandboxToolTier: this.sandboxToolTier,
          sandboxBackpack: this.sandboxBackpack,
          sandboxQuestsClaimed: Array.from(this.sandboxQuestsClaimed),
          sandboxDelta: this.sandboxWorld ? exportSandboxDelta(this.sandboxWorld) : this.pendingSandboxDelta,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }

  public resetFullRun(): void {
    this.deaths = 0;
    this.elapsedSeconds = 0;
    this.chapterIndex = 0;
    this.chapterDeaths = 0;
    this.chapterElapsedSeconds = 0;
    this.victory = false;
    this.hardcoreGameOver = false;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.styleScore = 0;
    this.overdrive = 0;
    this.overdriveTimer = 0;
    this.activeCutscene = null;
    this.seenCutscenes.clear();
    this.heroSkillCooldown = 0;
    this.tagSwapCooldown = 0;
    this.roomRespawnOverride = null;
    this.collectedRelics.clear();
    this.openedDoors.clear();
    this.openedChests.clear();
    this.collectedCoins.clear();
    this.completedRifts.clear();
    this.litBeacons.clear();
    this.readTablets.clear();
    this.sideQuestProgress = {};
    this.claimedSideQuests.clear();
    this.discoveredSectors = {};
    this.astralCoins = 0;
    this.blessings = { speedLv: 0, staminaLv: 0, skillCdLv: 0, magnetLv: 0 };
    this.chapterRecords = this.chapters.map((_, idx) => ({
      unlocked: idx === 0,
      cleared: false,
      bestTimeSeconds: null,
      fewestDeaths: null,
    }));
    const startId = this.chapters[0].startStageId;
    this.visitedRooms = new Set([startId]);
    this.unlockedShrines = new Set([startId]);
    this.lastBiomeBanner = null;
    this.dialogue = null;
    this.enterRoom(startId, false, null);
    this.player = createInitialPlayer(
      this.currentRoom.spawnX,
      this.currentRoom.spawnY,
      this.heroId,
      this.getHeroSkinId()
    );
    this.ensurePlayerClear();
    this.snapCamera();
    this.saveProgress();
    this.emitHud();
  }

  public spawnFloatingText(x: number, y: number, text: string, color = '#ffe47a'): void {
    const ft = this.floatingTexts[this.floatingTextHead];
    this.floatingTextHead = (this.floatingTextHead + 1) % FLOATING_TEXT_POOL_SIZE;
    ft.active = true;
    ft.x = Math.round(x);
    ft.y = Math.round(y);
    ft.vy = -24;
    ft.text = text;
    ft.color = color;
    ft.life = 0.85;
    ft.maxLife = 0.85;
  }

  public triggerCutscene(id: CutsceneId, markSeen = true): void {
    if (!CUTSCENES[id]) return;
    this.activeCutscene = id;
    if (markSeen) {
      this.seenCutscenes.add(id);
      this.saveProgress();
    }
    this.emitHud();
  }

  public finishCutscene(): void {
    if (!this.activeCutscene) return;
    const finished = this.activeCutscene;
    this.seenCutscenes.add(finished);
    this.activeCutscene = null;
    if (finished === 'prologue' && !this.seenCutscenes.has('ch1_intro')) {
      this.seenCutscenes.add('ch1_intro');
    }
    this.saveProgress();
    this.emitHud();
  }

  public getEffectiveHeroStats(heroId: HeroId = this.heroId): {
    eq: AggregatedEquipmentBonuses;
    evo: ReturnType<typeof getHeroEvolutionData>;
    alchemySpeedMult: number;
    alchemySkillCdMult: number;
    alchemyAttackBonus: number;
    alchemyMiningMult: number;
    totalAttackBonus: number;
  } {
    const eq = computeHeroEquipmentBonuses(heroId, this.heroEquipment, this.equipmentInventory);
    const evo = getHeroEvolutionData(heroId, this.heroEvolutions[heroId] ?? 0);
    let alchemySpeedMult = 1;
    let alchemySkillCdMult = 1;
    let alchemyAttackBonus = 0;
    let alchemyMiningMult = 1;
    for (const buff of this.activeAlchemyBuffs) {
      const def = ALCHEMY_BUFFS[buff.id as keyof typeof ALCHEMY_BUFFS];
      if (!def) continue;
      alchemySpeedMult = Math.max(alchemySpeedMult, def.speedMult);
      alchemySkillCdMult = Math.min(alchemySkillCdMult, def.skillCdMult);
      alchemyAttackBonus += def.attackBonus;
      alchemyMiningMult = Math.max(alchemyMiningMult, def.miningSpeedMult);
    }
    const petBonuses = computePetLevelBonuses(
      this.equippedSpirit,
      this.petLevels[this.equippedSpirit] ?? 1
    );
    return {
      eq,
      evo,
      alchemySpeedMult,
      alchemySkillCdMult,
      alchemyAttackBonus,
      alchemyMiningMult,
      totalAttackBonus: eq.attackBonus + evo.attackBonus + alchemyAttackBonus + petBonuses.attackBonus,
    };
  }

  public getEffectiveSkillCdMult(): number {
    const modeCdMult = this.playMode === 'glass_cannon' ? 0.6 : 1;
    const runeB = computeRuneBonuses(this.equippedRunes);
    const boonB = computeBoonBonuses(this.activeBoons);
    const mastB = getMasteryBonuses(this.mastery);
    const lvB = getPlayerLevelBonuses(this.getPlayerLevel());
    const weatherM = WEATHER_META[this.roomWeather] ?? WEATHER_META.clear;
    const spiritCd = this.equippedSpirit === 'fada_crono' ? 0.9 : 1;
    const talismanCd = this.equippedTalisman === 'ampulheta_eterna' ? 0.88 : 1;
    const heroStats = this.getEffectiveHeroStats();
    return Math.max(
      0.2,
      (1 - this.blessings.skillCdLv * 0.2) *
        modeCdMult *
        runeB.skillCdMult *
        boonB.skillCdMult *
        mastB.skillCdMult *
        lvB.skillCdMult *
        weatherM.skillCdMult *
        spiritCd *
        talismanCd *
        heroStats.eq.skillCdMult *
        heroStats.evo.skillCdMult *
        heroStats.alchemySkillCdMult
    );
  }

  public getPlayerLevel(): number {
    return getLevelProgressFromXp(this.playerXp).level;
  }

  public grantPlayerXp(baseXp: number): boolean {
    if (baseXp <= 0) return false;
    const prevLv = this.getPlayerLevel();
    const sp = this.equippedSpirit !== 'none' ? (SPIRIT_MAP[this.equippedSpirit] ?? DETAILED_PET_MAP[this.equippedSpirit]) : null;
    const gain = Math.max(1, Math.round(baseXp * (sp?.xpBonus ?? 1)));
    this.playerXp += gain;
    this.passXp += Math.max(1, Math.round(gain * 1.35));
    const nextLv = this.getPlayerLevel();
    if (nextLv > prevLv) {
      const coinBonus = 5 + Math.floor(nextLv / 2);
      this.addAstralCoins(coinBonus);
      this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
      this.player.stamina = this.player.maxStamina;
      this.spawnShockwave(this.player.x + 4, this.player.y + 5, 44, '#ffe066', 0.42);
      this.burstParticles(this.player.x + 4, this.player.y + 5, 24, '#ffe066', 120);
      this.spawnFloatingText(this.player.x + 4, this.player.y - 14, `NÍVEL ${nextLv}! +${coinBonus}★`, '#ffe066');
      this.recentMechanicToast = `NÍVEL ${nextLv} ALCANÇADO! (+${coinBonus}★ & Bônus Passivo)`;
      this.mechanicToastTimer = 3.2;
      gameAudio.playRelic();
      this.saveProgress();
      this.emitHud();
      return true;
    }
    return false;
  }

  public addAstralCoins(amount: number): void {
    if (amount <= 0) return;
    this.astralCoins += amount;
    this.missionStats.coinsEarned += amount;
  }

  public getTotalWorldStars(): number {
    return Object.values(this.worldStars).reduce((acc, v) => acc + v, 0);
  }

  private getTodayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  public canClaimDailyReward(): boolean {
    return this.lastDailyClaimDate !== this.getTodayKey();
  }

  private applyPassReward(reward: (typeof PASS_TIERS)[number]['freeReward']): void {
    if (reward.kind === 'coins' || reward.kind === 'chest') {
      this.addAstralCoins(reward.amount ?? 30);
    } else if (reward.kind === 'mastery_xp') {
      this.grantMasteryXp(reward.amount ?? 80);
    } else if (reward.kind === 'aura_trail' && reward.itemId && reward.itemId in AURA_TRAIL_MAP) {
      const aId = reward.itemId as AuraTrailId;
      this.unlockedAuraTrails.add(aId);
      this.equippedAuraTrail = aId;
      if (reward.amount) this.addAstralCoins(reward.amount);
    } else if (reward.kind === 'talisman' && reward.itemId && reward.itemId in TALISMAN_MAP) {
      this.unlockedTalismans.add(reward.itemId as TalismanId);
    }
  }

  public unlockAstralPass(): boolean {
    if (this.passAstralUnlocked || this.astralCoins < PASS_ASTRAL_UNLOCK_COST) return false;
    this.astralCoins -= PASS_ASTRAL_UNLOCK_COST;
    this.passAstralUnlocked = true;
    this.recentMechanicToast = 'PASSE ASTRAL DESBLOQUEADO! (40 Níveis de Recompensas)';
    this.mechanicToastTimer = 3.2;
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public claimPassReward(tier: number, track: 'free' | 'astral'): boolean {
    const def = PASS_TIERS.find((p) => p.tier === tier);
    if (!def) return false;
    const prog = getPassProgressFromXp(this.passXp);
    if (prog.level < tier) return false;
    if (track === 'free') {
      if (this.claimedFreePassTiers.has(tier)) return false;
      this.claimedFreePassTiers.add(tier);
      this.applyPassReward(def.freeReward);
    } else {
      if (!this.passAstralUnlocked || this.claimedAstralPassTiers.has(tier)) return false;
      this.claimedAstralPassTiers.add(tier);
      this.applyPassReward(def.astralReward);
    }
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public claimAllPassRewards(): number {
    const prog = getPassProgressFromXp(this.passXp);
    let claimed = 0;
    for (const def of PASS_TIERS) {
      if (def.tier > prog.level) break;
      if (!this.claimedFreePassTiers.has(def.tier)) {
        this.claimedFreePassTiers.add(def.tier);
        this.applyPassReward(def.freeReward);
        claimed++;
      }
      if (this.passAstralUnlocked && !this.claimedAstralPassTiers.has(def.tier)) {
        this.claimedAstralPassTiers.add(def.tier);
        this.applyPassReward(def.astralReward);
        claimed++;
      }
    }
    if (claimed > 0) {
      this.recentMechanicToast = `${claimed} RECOMPENSAS DO PASSE RESGATADAS!`;
      this.mechanicToastTimer = 3.0;
      gameAudio.playRelic();
      this.saveProgress();
      this.emitHud();
    }
    return claimed;
  }

  public claimMission(id: string): boolean {
    if (this.claimedMissions.has(id)) return false;
    const def = MISSIONS.find((m) => m.id === id);
    if (!def) return false;
    const current = this.missionStats[def.metric] ?? 0;
    if (current < def.target) return false;
    this.claimedMissions.add(id);
    this.addAstralCoins(def.coinReward);
    this.grantMasteryXp(def.masteryXpReward);
    this.passXp += def.passXpReward;
    this.recentMechanicToast = `MISSÃO: ${def.title} (+${def.coinReward}★ / +${def.passXpReward} XP Passe)`;
    this.mechanicToastTimer = 3.2;
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public claimStarMilestone(starsRequired: number): boolean {
    if (this.claimedStarMilestones.has(starsRequired)) return false;
    const def = STAR_MILESTONES.find((s) => s.starsRequired === starsRequired);
    if (!def || this.getTotalWorldStars() < starsRequired) return false;
    this.claimedStarMilestones.add(starsRequired);
    this.addAstralCoins(def.coinReward);
    this.grantMasteryXp(def.masteryXpReward);
    this.passXp += def.passXpReward;
    if (def.auraUnlock && def.auraUnlock in AURA_TRAIL_MAP) {
      this.unlockedAuraTrails.add(def.auraUnlock);
      this.equippedAuraTrail = def.auraUnlock;
    }
    this.recentMechanicToast = `COFRE ${starsRequired}★: ${def.title} (+${def.coinReward}★)`;
    this.mechanicToastTimer = 3.2;
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public claimDailyReward(): boolean {
    if (!this.canClaimDailyReward()) return false;
    const dayIndex = this.dailyStreakDay % DAILY_REWARDS.length;
    const def = DAILY_REWARDS[dayIndex];
    this.lastDailyClaimDate = this.getTodayKey();
    this.dailyStreakDay += 1;
    this.addAstralCoins(def.coinReward);
    this.grantMasteryXp(def.masteryXpReward);
    this.passXp += def.passXpReward;
    this.recentMechanicToast = `${def.label}: +${def.coinReward}★ / +${def.passXpReward} XP Passe!`;
    this.mechanicToastTimer = 3.2;
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public equipOrBuyAuraTrail(id: AuraTrailId): boolean {
    const def = AURA_TRAIL_MAP[id];
    if (!def) return false;
    if (!this.unlockedAuraTrails.has(id)) {
      if (this.astralCoins < def.cost) return false;
      this.astralCoins -= def.cost;
      this.unlockedAuraTrails.add(id);
    }
    this.equippedAuraTrail = id;
    gameAudio.playCrystal();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public claimEnemyBounty(kind: string): boolean {
    if (this.claimedEnemyBounties.has(kind)) return false;
    const entry = ALL_ENEMY_BESTIARY_MAP[kind];
    if (!entry || entry.bountyTarget <= 0) return false;
    if ((this.enemyKills[kind] ?? 0) < entry.bountyTarget) return false;
    this.claimedEnemyBounties.add(kind);
    this.addAstralCoins(entry.bountyCoins);
    this.passXp += 40;
    this.recentMechanicToast = `CAÇADA ${entry.name.toUpperCase()}: +${entry.bountyCoins}★`;
    this.mechanicToastTimer = 3.0;
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public isHeroUnlocked(id: HeroId): boolean {
    return this.unlockedHeroes.has(id);
  }

  public unlockHero(id: HeroId): boolean {
    const hero = getHeroDef(id);
    if (this.unlockedHeroes.has(hero.id)) return true;
    const lv = this.getPlayerLevel();
    if (!canUnlockHero(hero, this.astralCoins, lv).canUnlock) return false;
    const req = getHeroUnlockReq(hero);
    this.astralCoins = Math.max(0, this.astralCoins - req.coinCost);
    this.unlockedHeroes.add(hero.id);
    this.grantPlayerXp(12);
    this.spawnFloatingText(this.player.x + 4, this.player.y - 12, `${hero.name.toUpperCase()} DESBLOQUEADO!`, hero.accentColor);
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 36, hero.accentColor, 0.34);
    this.burstParticles(this.player.x + 4, this.player.y + 5, 20, hero.particleColor, 105);
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public grantMasteryXp(baseXp: number): void {
    const sp = this.equippedSpirit !== 'none' ? (SPIRIT_MAP[this.equippedSpirit] ?? DETAILED_PET_MAP[this.equippedSpirit]) : null;
    const gain = Math.max(1, Math.round(baseXp * (sp?.xpBonus ?? 1)));
    this.mastery = { ...this.mastery, xp: this.mastery.xp + gain };
  }

  public unlockAchievement(id: string): void {
    if (this.unlockedAchievements.has(id)) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return;
    this.unlockedAchievements.add(id);
    this.astralCoins += def.coinReward;
    this.grantMasteryXp(def.xpReward);
    this.grantPlayerXp(Math.max(15, Math.round(def.xpReward * 0.6)));
    this.recentMechanicToast = `CONQUISTA: ${def.name} (+${def.coinReward}★)`;
    this.mechanicToastTimer = 3.2;
    this.spawnFloatingText(this.player.x + 4, this.player.y - 14, `★ ${def.name}`, def.color);
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 34, def.color, 0.34);
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
  }

  public toggleRune(id: RuneId): boolean {
    const def = RUNE_MAP[id];
    if (!def) return false;
    if (!this.unlockedRunes.has(id)) {
      if (this.astralCoins < def.cost) return false;
      this.astralCoins -= def.cost;
      this.unlockedRunes.add(id);
    }
    if (this.equippedRunes.includes(id)) {
      this.equippedRunes = this.equippedRunes.filter((r) => r !== id);
    } else if (this.equippedRunes.length < 3) {
      this.equippedRunes = [...this.equippedRunes, id];
    } else {
      this.equippedRunes = [...this.equippedRunes.slice(1), id];
    }
    const hDef = getHeroDef(this.heroId);
    const runeB = computeRuneBonuses(this.equippedRunes);
    const mastB = getMasteryBonuses(this.mastery);
    const nextMax = Math.round(
      PHYS.MAX_STAMINA *
        hDef.modifiers.staminaMult *
        (1 + this.blessings.staminaLv * 0.15) *
        (1 + runeB.staminaBonus) *
        mastB.staminaMult
    );
    this.player.maxStamina = nextMax;
    this.player.stamina = Math.min(nextMax, this.player.stamina);
    gameAudio.playCrystal();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public selectSpirit(id: SpiritId): boolean {
    if (id !== 'none') {
      const def = SPIRIT_MAP[id] ?? DETAILED_PET_MAP[id];
      if (!def) return false;
      if (!this.unlockedSpirits.has(id)) {
        if (this.astralCoins < def.cost) return false;
        this.astralCoins -= def.cost;
        this.unlockedSpirits.add(id);
      }
    }
    this.equippedSpirit = id;
    this.spiritX = this.player.x - this.player.facing * 14;
    this.spiritY = this.player.y - 8;
    gameAudio.playCrystal();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public setTagHero(id: HeroId, enforceUnlock = false): boolean {
    const hero = getHeroDef(id);
    if (enforceUnlock && !this.unlockedHeroes.has(hero.id)) return false;
    this.unlockedHeroes.add(hero.id);
    this.tagHeroId = hero.id;
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public upgradeMasteryBranch(
    branch: 'mobilityLv' | 'combatLv' | 'explorationLv' | 'survivalLv'
  ): boolean {
    const cur = this.mastery[branch];
    if (cur >= 10) return false;
    const cost = getMasteryUpgradeCost(cur);
    if (this.mastery.xp < cost) return false;
    this.mastery = {
      ...this.mastery,
      xp: this.mastery.xp - cost,
      [branch]: cur + 1,
    };
    const hDef = getHeroDef(this.heroId);
    const runeB = computeRuneBonuses(this.equippedRunes);
    const mastB = getMasteryBonuses(this.mastery);
    const nextMax = Math.round(
      PHYS.MAX_STAMINA *
        hDef.modifiers.staminaMult *
        (1 + this.blessings.staminaLv * 0.15) *
        (1 + runeB.staminaBonus) *
        mastB.staminaMult
    );
    this.player.maxStamina = nextMax;
    this.player.stamina = nextMax;
    this.spawnShockwave(this.player.x + 4, this.player.y + 4, 28, '#52e5ff', 0.3);
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public toggleGhost(): void {
    this.ghostEnabled = !this.ghostEnabled;
    this.saveProgress();
    this.emitHud();
  }

  public selectTalisman(id: TalismanId): boolean {
    if (id !== 'none') {
      const def = TALISMAN_MAP[id];
      if (!def) return false;
      if (!this.unlockedTalismans.has(id)) {
        if (this.astralCoins < def.cost) return false;
        this.astralCoins -= def.cost;
        this.unlockedTalismans.add(id);
      }
    }
    this.equippedTalisman = id;
    this.unlockMechanic('TALISMAN_FORGE');
    this.unlockMechanic('TALISMAN_SYNERGY');
    gameAudio.playCrystal();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public getTotalBossesDefeated(): number {
    return Object.values(this.bestiaryDefeats).reduce((a, b) => a + b, 0);
  }

  public getUnlockedTitlesList(): TitleId[] {
    return evaluateUnlockedTitles({
      perfectDodges: this.perfectDodges,
      crownShards: this.crownShardsCollected,
      bossesDefeated: this.getTotalBossesDefeated(),
      styleSS: this.totalStyleSS,
      reactions: this.totalReactions,
      relics: this.collectedRelics.size,
      bestWave: this.bestSurvivalWave,
      discoveredMechanics: this.discoveredMechanics.size,
    });
  }

  public selectTitle(id: TitleId): void {
    const unlocked = this.getUnlockedTitlesList();
    if (!unlocked.includes(id)) return;
    this.activeTitle = id;
    this.unlockMechanic('PLAYER_TITLES');
    gameAudio.playKeyOrSwitch();
    this.saveProgress();
    this.emitHud();
  }

  public claimContract(contractId: string): boolean {
    if (this.claimedContracts.has(contractId)) return false;
    const def = HUNTER_CONTRACTS.find((c) => c.id === contractId);
    if (!def) return false;
    const stats = {
      bossesDefeated: this.getTotalBossesDefeated(),
      perfectDodges: this.perfectDodges,
      crownShards: this.crownShardsCollected,
      relics: this.collectedRelics.size,
      reactions: this.totalReactions,
      bestWave: this.bestSurvivalWave,
      styleSS: this.totalStyleSS,
      parries: this.totalParries,
    };
    if ((stats[def.metric] ?? 0) < def.target) return false;
    this.claimedContracts.add(contractId);
    this.astralCoins += def.coinReward;
    this.grantMasteryXp(def.xpReward);
    this.grantPlayerXp(Math.max(18, Math.round(def.xpReward * 0.65)));
    this.unlockMechanic('HUNTER_CONTRACTS');
    this.unlockMechanic('CONTRACT_CLAIM');
    this.recentMechanicToast = `CONTRATO CONCLUÍDO: ${def.title} (+${def.coinReward}★)`;
    this.mechanicToastTimer = 3.0;
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public chooseBoon(id: BoonId): void {
    if (!BOON_MAP[id]) return;
    if (!this.activeBoons.includes(id)) {
      this.activeBoons = [...this.activeBoons, id];
    }
    this.pendingBoonChoices = null;
    this.unlockMechanic(BOON_MAP[id].code);
    this.unlockMechanic('BOON_DRAFT_SHRINE');
    this.spawnFloatingText(this.player.x + 4, this.player.y - 12, `BÊNÇÃO: ${BOON_MAP[id].name.toUpperCase()}`, BOON_MAP[id].color);
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 36, BOON_MAP[id].color, 0.34);
    if (this.mode === 'paused') {
      this.setPaused(false);
    }
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
  }

  public triggerBoonDraft(): void {
    this.pendingBoonChoices = pickBoonDraftOptions(
      this.activeBoons,
      this.activeBoons.length * 13 + Math.round(this.elapsedSeconds) + this.survivalWave
    );
    this.setPaused(true);
    this.emitHud();
  }

  public playJukeboxTrack(trackId: string): void {
    this.jukeboxTrackId = trackId;
    const track = JUKEBOX_TRACKS.find((t) => t.id === trackId);
    if (track) {
      gameAudio.playJukeboxPreview(trackId);
    }
    this.unlockMechanic('JUKEBOX_SANCTUARY');
    this.saveProgress();
    this.emitHud();
  }

  public practiceBoss(bossKind: BossEntityKind): boolean {
    const uwCh = UNDERWORLD_CHAPTERS.find((c) => c.stages.some((st) => st.entities.some((e) => e.kind === bossKind)));
    const sfCh = CHAPTERS.find((c) => c.stages.some((st) => st.entities.some((e) => e.kind === bossKind)));
    const ch = uwCh ?? sfCh;
    if (!ch) return false;
    const bossStage = ch.stages.find((st) => st.entities.some((e) => e.kind === bossKind));
    if (!bossStage) return false;
    if (uwCh) {
      this.playMode = 'underworld';
      this.activeCampaignSet = 'underworld';
      this.chapters = UNDERWORLD_CHAPTERS;
    } else {
      this.playMode = 'campaign';
      this.activeCampaignSet = 'surface';
      this.chapters = CHAPTERS;
    }
    this.chapterIndex = ch.index;
    this.skipNextAutoCutscene = true;
    this.dialogue = null;
    this.activeCutscene = null;
    this.pendingBoonChoices = null;
    this.enterRoom(bossStage.id, false, null);
    this.player = createInitialPlayer(
      this.currentRoom.spawnX,
      this.currentRoom.spawnY,
      this.heroId,
      this.getHeroSkinId()
    );
    this.player.heroShieldReady = true;
    this.ensurePlayerClear();
    this.snapCamera();
    this.mode = 'playing';
    this.unlockMechanic('BOSS_PRACTICE_DUEL');
    this.unlockMechanic('BOSS_DUEL_WARP');
    const bMeta = getAnyBossMeta(bossKind);
    this.bannerTitle = `DUELO DIRETO · ${bMeta.name.toUpperCase()}`;
    this.bannerSub = bMeta.title;
    this.bannerTimer = 3.0;
    gameAudio.playBossRoar();
    this.emitHud();
    return true;
  }

  public addCombo(pts = 1, basePoints = 50): void {
    this.comboCount += pts;
    const boonB = computeBoonBonuses(this.activeBoons);
    this.comboTimer = 3.6 + boonB.comboTimeBonus + (this.equippedTalisman === 'ampulheta_eterna' ? 1.5 : 0);
    const modeStyleMult = this.playMode === 'glass_cannon' ? 3 : 1;
    const styleMult = this.activeBoons.includes('style_emperor') ? 1.35 : 1;
    const mult = (this.overdriveTimer > 0 ? 2 : 1) * modeStyleMult * styleMult;
    this.styleScore += Math.round(basePoints * Math.max(1, Math.min(8, this.comboCount)) * mult);

    const rank = this.getStyleRank();
    if (rank === 'S' || rank === 'SS') {
      this.unlockAchievement('style_s');
    }
    if (rank === 'SS') {
      this.totalStyleSS += 1;
      this.missionStats.styleSSCount += 1;
    }

    if (this.overdriveTimer <= 0) {
      const chargeRate = this.playMode === 'glass_cannon' ? 2.5 : 1;
      const weatherM = WEATHER_META[this.roomWeather] ?? WEATHER_META.clear;
      const mastB = getMasteryBonuses(this.mastery);
      this.overdrive = Math.min(
        100,
        this.overdrive + Math.round(pts * 12 * chargeRate * weatherM.overdriveMult * mastB.overdriveGainMult)
      );
      if (this.overdrive >= 100) {
        this.activateOverdrive();
      }
    }
  }

  public activateOverdrive(): void {
    this.overdrive = 100;
    this.overdriveTimer = 5.0;
    this.heroSkillCooldown = 0;
    this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
    this.player.stamina = this.player.maxStamina;
    if (this.activeBoons.includes('eter_overflow')) {
      this.player.heroShieldReady = true;
      for (const e of this.liveEntities) {
        if (e.state !== 'dead' && isBossKind(e.def.kind) && Math.hypot(e.x - this.player.x, e.y - this.player.y) < 92) {
          this.damageEntity(e, 1, getHeroElement(this.heroId));
        }
      }
    }
    this.trauma = Math.min(1, this.trauma + 0.6);
    this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, 0.22);
    this.speedLinesTimer = Math.max(this.speedLinesTimer, 0.42);
    this.hitFlashTimer = 0.22;
    this.hitFlashColor = '#ffe066';
    this.hitFlashX = this.player.x + 4;
    this.hitFlashY = this.player.y + 5;
    this.spawnImpactSlash(this.player.x + 4, this.player.y + 5, -Math.PI * 0.25, 38, 5, '#ffe066', true, 0.24);
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 48, '#ffe066', 0.36);
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 32, '#52e5ff', 0.28);
    this.burstParticles(this.player.x + 4, this.player.y + 5, 32, '#ffe066', 135);
    this.burstParticles(this.player.x + 4, this.player.y + 5, 16, '#52e5ff', 105);
    this.spawnFloatingText(this.player.x + 4, this.player.y - 8, 'ETER SUPREMO!', '#ffe066');
    this.onRumble?.(140, 0.35, 0.7);
    gameAudio.playRelic();
  }

  public getStyleRank(): StyleRank {
    if (this.comboCount >= 12 || this.styleScore >= 4000) return 'SS';
    if (this.comboCount >= 9 || this.styleScore >= 2500) return 'S';
    if (this.comboCount >= 6 || this.styleScore >= 1400) return 'A';
    if (this.comboCount >= 4 || this.styleScore >= 700) return 'B';
    if (this.comboCount >= 2 || this.styleScore >= 250) return 'C';
    return 'D';
  }

  public buyBlessingUpgrade(key: keyof BlessingUpgrades): boolean {
    const cur = this.blessings[key];
    const maxLv = key === 'magnetLv' ? 2 : 3;
    if (cur >= maxLv) return false;
    const costs = key === 'magnetLv' ? [6, 14] : [5, 10, 18];
    const cost = costs[cur] ?? 99;
    if (this.astralCoins < cost) return false;
    this.astralCoins -= cost;
    this.blessings = { ...this.blessings, [key]: cur + 1 };
    if (key === 'staminaLv') {
      const hero = getHeroDef(this.heroId);
      const runeB = computeRuneBonuses(this.equippedRunes);
      const mastB = getMasteryBonuses(this.mastery);
      const nextMax = Math.round(
        PHYS.MAX_STAMINA *
          hero.modifiers.staminaMult *
          (1 + this.blessings.staminaLv * 0.15) *
          (1 + runeB.staminaBonus) *
          mastB.staminaMult
      );
      this.player.maxStamina = nextMax;
      this.player.stamina = nextMax;
    }
    this.spawnShockwave(this.player.x + 4, this.player.y + 4, 28, '#ffd27d', 0.34);
    this.burstParticles(this.player.x + 4, this.player.y + 4, 18, '#ffd27d', 95);
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public setHeroSkin(skinId: string): void {
    const skin = getHeroSkinDef(this.heroId, skinId);
    this.heroSkinByHero[this.heroId] = skin.id;
    this.player.skinId = skin.id;
    if (skin.id !== 'default') {
      this.unlockMechanic('HERO_SKINS_MASTERY');
    }
    this.burstParticles(this.player.x + 4, this.player.y + 5, 16, skin.palette.particleColor, 85);
    this.saveProgress();
    this.emitHud();
  }

  public setHero(id: HeroId, skinId?: string, enforceUnlock = false): boolean {
    const hero = getHeroDef(id);
    if (enforceUnlock && !this.unlockedHeroes.has(hero.id)) return false;
    this.unlockedHeroes.add(hero.id);
    this.heroId = hero.id;
    const resolvedSkin = getHeroSkinDef(hero.id, skinId ?? this.heroSkinByHero[hero.id]).id;
    this.heroSkinByHero[hero.id] = resolvedSkin;
    const prevX = this.player.x;
    const prevY = this.player.y;
    const prevFacing = this.player.facing;
    const prevKeys = [...this.player.carryingKeys];
    this.player = createInitialPlayer(prevX, prevY, hero.id, resolvedSkin);
    this.player.facing = prevFacing;
    this.player.carryingKeys = prevKeys;
    if (resolvedSkin !== 'default') {
      this.unlockMechanic('HERO_SKINS_MASTERY');
    }
    this.burstParticles(prevX + 4, prevY + 5, 16, hero.accentColor, 85);
    this.saveProgress();
    this.emitHud();
    return true;
  }

  private getActiveChapterRecords(): ChapterSaveRecord[] {
    return this.playMode === 'underworld' ? this.underworldChapterRecords : this.chapterRecords;
  }

  public canAccessChapter(idx: number): boolean {
    if (!this.chapters[idx]) return false;
    if (this.playMode === 'speedrun' || this.playMode === 'mirror_void') return true;
    return Boolean(this.getActiveChapterRecords()[idx]?.unlocked);
  }

  public startPlayMode(mode: PlayModeId, fromUserGesture = true): void {
    this.playMode = mode;
    if (mode === 'underworld') {
      this.activeCampaignSet = 'underworld';
      this.chapters = UNDERWORLD_CHAPTERS;
    } else {
      this.activeCampaignSet = 'surface';
      this.chapters = CHAPTERS;
    }
    this.elapsedSeconds = 0;
    this.chapterElapsedSeconds = 0;
    this.deaths = 0;
    this.chapterDeaths = 0;
    this.victory = false;
    this.hardcoreGameOver = false;
    this.bossRushAdvanceTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.styleScore = 0;
    this.overdrive = 0;
    this.overdriveTimer = 0;
    this.soulCharge = Math.max(50, this.soulCharge);
    this.heroSkillCooldown = 0;
    this.dialogue = null;
    this.activeCutscene = null;
    for (const b of this.beams) b.active = false;

    if (mode === 'underworld') {
      this.skipNextAutoCutscene = true;
      const highestUnlocked = this.underworldChapterRecords.reduce(
        (best, r, i) => (r.unlocked ? i : best),
        0
      );
      this.startChapter(highestUnlocked, fromUserGesture);
      this.bannerTitle = 'SUBMUNDO DE AETHELGARD';
      this.bannerSub = `Círculo ${highestUnlocked + 1}/20 · Desafios Infernais Extremos`;
      this.bannerTimer = 3.2;
      this.emitHud();
      return;
    }

    if (mode === 'boss_rush') {
      this.bossRushIndex = 0;
      const bossCh = this.chapters[0];
      const bossStage = bossCh.stages[bossCh.stages.length - 1];
      this.chapterIndex = 0;
      this.skipNextAutoCutscene = true;
      this.enterRoom(bossStage.id, false, null);
      this.player = createInitialPlayer(
        this.currentRoom.spawnX,
        this.currentRoom.spawnY,
        this.heroId,
        this.getHeroSkinId()
      );
      this.snapCamera();
      this.startPlaying(fromUserGesture);
      const bMeta = getAnyBossMeta(BOSS_ORDER[0]);
      this.bannerTitle = `RUSH DOS CHEFOES (1/${BOSS_ORDER.length})`;
      this.bannerSub = `${bMeta.name} · ${bMeta.title}`;
      this.bannerTimer = 3.0;
      gameAudio.playBossRoar();
      this.emitHud();
      return;
    }

    if (mode === 'survival') {
      this.survivalWave = 0;
      this.survivalKills = 0;
      this.survivalWaveTimer = 0.25;
      if (!this.roomMap.has('survival_arena')) {
        this.roomMap.set('survival_arena', createSurvivalArenaRoom());
      }
      this.chapterIndex = this.chapters.length - 1;
      this.skipNextAutoCutscene = true;
      this.enterRoom('survival_arena', false, null);
      this.player = createInitialPlayer(
        this.currentRoom.spawnX,
        this.currentRoom.spawnY,
        this.heroId,
        this.getHeroSkinId()
      );
      this.snapCamera();
      this.startPlaying(fromUserGesture);
      this.spawnSurvivalWave();
      this.emitHud();
      return;
    }

    if (mode === 'tower') {
      this.skipNextAutoCutscene = true;
      this.loadTowerFloor(1, fromUserGesture);
      return;
    }

    if (mode === 'sandbox_world') {
      this.skipNextAutoCutscene = true;
      if (!this.sandboxWorld) {
        this.sandboxWorld = generateSandboxWorld(202504);
        if (this.pendingSandboxDelta) {
          applySandboxDelta(this.sandboxWorld, this.pendingSandboxDelta);
          this.pendingSandboxDelta = null;
        }
      }
      this.player = createInitialPlayer(
        this.sandboxWorld.spawnTx * TILE_SIZE,
        this.sandboxWorld.spawnTy * TILE_SIZE,
        this.heroId,
        this.getHeroSkinId()
      );
      markSandboxSectorAt(
        this.sandboxWorld.exploredSectors,
        this.sandboxWorld.spawnTx,
        this.sandboxWorld.spawnTy
      );
      this.spiritX = this.player.x - 14;
      this.spiritY = this.player.y - 8;
      this.cameraX = Math.max(0, Math.min(SANDBOX_WORLD_WIDTH_PX - VIRTUAL_WIDTH, this.player.x - VIRTUAL_WIDTH * 0.5));
      this.cameraY = Math.max(0, Math.min(SANDBOX_WORLD_HEIGHT_PX - VIRTUAL_HEIGHT, this.player.y - VIRTUAL_HEIGHT * 0.5));
      this.startPlaying(fromUserGesture);
      this.bannerTitle = 'MUNDO ABERTO CONECTADO';
      this.bannerSub = '4800×640 Blocos · 24 Biomas Interligados · Mapa [M]';
      this.bannerTimer = 4.2;
      this.emitHud();
      return;
    }

    if (mode === 'speedrun') {
      this.skipNextAutoCutscene = true;
    }
    this.startChapter(0, fromUserGesture);
  }

  public loadTowerFloor(floor: number, fromUserGesture = false): void {
    const safeFloor = Math.max(1, Math.floor(floor));
    this.playMode = 'tower';
    this.towerFloor = safeFloor;
    this.bestTowerFloor = Math.max(this.bestTowerFloor, safeFloor);
    const towerRoom = createTowerFloorRoom(safeFloor);
    this.roomMap.set(towerRoom.id, towerRoom);
    this.chapterIndex = towerRoom.chapterIndex;
    this.skipNextAutoCutscene = true;
    this.lastBiomeBanner = null;
    this.enterRoom(towerRoom.id, safeFloor > 1, safeFloor > 1 ? { dx: 0, dy: -1 } : null);
    this.player = createInitialPlayer(
      this.currentRoom.spawnX,
      this.currentRoom.spawnY,
      this.heroId,
      this.getHeroSkinId()
    );
    this.player.heroShieldReady = true;
    this.ensurePlayerClear();
    this.snapCamera();
    if (fromUserGesture) {
      this.startPlaying(true);
    } else {
      this.mode = 'playing';
      this.hardcoreGameOver = false;
    }
    const isBossFloor = safeFloor % 5 === 0;
    const activeBoss = this.liveEntities.find((e) => isBossKind(e.def.kind));
    const bMeta = activeBoss && isBossKind(activeBoss.def.kind) ? getAnyBossMeta(activeBoss.def.kind) : null;
    this.bannerTitle = isBossFloor
      ? `TORRE · ANDAR ${safeFloor} (GUARDIÃO!)`
      : `TORRE DO ÉTER · ANDAR ${safeFloor}`;
    this.bannerSub = isBossFloor && bMeta
      ? `${bMeta.name} bloqueia o portal do andar!`
      : `${getAnyBiomeMeta(towerRoom.biome).name} · Escale até o cume!`;
    this.bannerTimer = 2.8;
    if (isBossFloor) gameAudio.playBossRoar();
    this.saveProgress();
    this.emitHud();
  }

  public startChapter(idx: number, fromUserGesture = true): void {
    const ch = this.chapters[idx];
    if (!ch || !this.canAccessChapter(idx)) return;
    if (this.playMode === 'boss_rush' || this.playMode === 'survival' || this.playMode === 'tower') {
      this.playMode = 'campaign';
    }
    this.chapterIndex = idx;
    this.chapterDeaths = 0;
    this.chapterElapsedSeconds = 0;
    this.victory = false;
    this.hardcoreGameOver = false;
    this.lastBiomeBanner = null;
    this.dialogue = null;
    this.unlockedShrines.add(ch.startStageId);
    this.enterRoom(ch.startStageId, false, null);
    this.player = createInitialPlayer(
      this.currentRoom.spawnX,
      this.currentRoom.spawnY,
      this.heroId,
      this.getHeroSkinId()
    );
    this.snapCamera();
    this.startPlaying(fromUserGesture);
    const introId = CHAPTER_INTRO_CUTSCENE[idx];
    if (
      fromUserGesture &&
      !this.skipNextAutoCutscene &&
      this.playMode !== 'speedrun' &&
      this.playMode !== 'underworld' &&
      introId &&
      !this.seenCutscenes.has(introId)
    ) {
      this.triggerCutscene(introId);
    }
    this.saveProgress();
  }

  public nextChapter(): void {
    const nextIdx = this.chapterIndex + 1;
    if (nextIdx < this.chapters.length) {
      this.startChapter(nextIdx, true);
    } else {
      this.mode = 'gameover';
      this.emitHud();
    }
  }

  public replayChapter(): void {
    if (this.playMode === 'boss_rush' || this.playMode === 'survival' || this.playMode === 'tower') {
      this.startPlayMode(this.playMode, true);
      return;
    }
    this.startChapter(this.chapterIndex, true);
  }

  public startPlaying(fromUserGesture = true): void {
    if (fromUserGesture) gameAudio.unlock();
    this.mode = 'playing';
    this.hardcoreGameOver = false;
    if (fromUserGesture) gameAudio.updateBiomeAmbience(this.currentRoom.biome);
    this.showBiomeBannerIfChanged(this.currentRoom.biome);
    if (fromUserGesture && !this.skipNextAutoCutscene && !this.seenCutscenes.has('prologue')) {
      this.triggerCutscene('prologue');
    } else {
      this.emitHud();
    }
    this.skipNextAutoCutscene = false;
  }

  public setPaused(p: boolean): void {
    if (this.mode === 'gameover' || this.mode === 'title') return;
    this.mode = p ? 'paused' : 'playing';
    if (p) gameAudio.stopAmbience();
    else gameAudio.updateBiomeAmbience(this.currentRoom.biome);
    this.emitHud();
  }

  public returnToTitle(): void {
    this.mode = 'title';
    this.dialogue = null;
    gameAudio.stopAmbience();
    this.emitHud();
  }

  public fastTravelToRoom(roomId: string): void {
    if (!this.unlockedShrines.has(roomId) || !this.roomMap.has(roomId)) return;
    this.unlockMechanic('FAST_TRAVEL');
    this.enterRoom(roomId, false, null);
    const shrine = this.liveEntities.find((e) => e.def.kind === 'campfire');
    if (shrine) {
      this.player.x = shrine.x + 12;
      this.player.y = shrine.y - 4;
    }
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.dashes = this.player.maxDashes;
    this.player.stamina = this.player.maxStamina;
    this.ensurePlayerClear();
    this.snapCamera();
    this.mode = 'playing';
    gameAudio.playRespawn();
    gameAudio.updateBiomeAmbience(this.currentRoom.biome);
    this.emitHud();
  }

  private showBiomeBannerIfChanged(biome: AnyBiomeId): void {
    if (this.lastBiomeBanner === biome) return;
    this.lastBiomeBanner = biome;
    const meta = getAnyBiomeMeta(biome);
    this.bannerTitle = meta.name;
    this.bannerSub = meta.subtitle;
    this.bannerTimer = 3.2;
    this.unlockMechanic('BIOME_BANNER');
  }

  public ensurePlayerClear(): void {
    unstickPlayerFromSolid(this.player, this.buildCollisionGrid());
  }

  private commitGhostRun(): void {
    if (this.ghostRecording.length < 6) return;
    const roomId = this.currentRoom.id;
    const totalT = this.ghostRoomClock;
    const prev = this.ghostBestByRoom[roomId];
    if (!prev || totalT < prev.time) {
      this.ghostBestByRoom[roomId] = {
        time: totalT,
        frames: this.ghostRecording.slice(0, 800),
      };
    }
  }

  public enterRoom(roomId: string, withSlide = false, dir: { dx: number; dy: number } | null = null): void {
    const next = this.roomMap.get(roomId);
    if (!next) return;
    this.starShards = 0;
    if (withSlide && this.currentRoom && this.currentRoom.id !== next.id) {
      this.commitGhostRun();
    }
    if (withSlide && dir) {
      this.prevRoomSnapshot = this.currentRoom;
      this.transitionDir = dir;
      this.transitionTimer = 0.24;
      this.unlockMechanic('SEAMLESS_WORLD');
    }
    this.currentRoom = next;
    this.visitedRooms.add(next.id);
    this.roomWeather = pickRoomWeather(next.biome, next.stageIndex);
    this.activeGrappleId = null;
    this.grappleCooldown = 0;
    this.riftActive = false;
    this.riftRings = [];
    this.riftProgress = 0;
    this.riftTimer = 0;
    this.ghostRoomClock = 0;
    this.ghostRecording = [];
    this.ghostRecordAccum = 0;
    if (this.roomRespawnOverride && this.roomRespawnOverride.roomId !== next.id) {
      this.roomRespawnOverride = null;
    }
    this.tileStates.clear();
    for (const pr of this.projectiles) pr.active = false;
    for (const b of this.beams) b.active = false;
    this.player.dashedInRoom = false;
    this.player.bubbleId = null;
    this.player.tetherId = null;
    this.player.gravityDir = 1;
    const hDef = getHeroDef(this.heroId);
    const runeB = computeRuneBonuses(this.equippedRunes);
    const mastB = getMasteryBonuses(this.mastery);
    const lvB = getPlayerLevelBonuses(this.getPlayerLevel());
    const heroStats = this.getEffectiveHeroStats();
    this.player.heroId = this.heroId;
    this.player.skinId = this.getHeroSkinId();
    this.player.heroShieldReady = hDef.modifiers.shieldPerRoom || this.playMode === 'tower';
    this.player.maxAirJumps = hDef.modifiers.airJumps + runeB.extraAirJump + heroStats.eq.extraAirJump + heroStats.evo.extraAirJump;
    this.player.airJumpsLeft = this.player.maxAirJumps;
    const expectedMaxStam = Math.round(
      PHYS.MAX_STAMINA *
        hDef.modifiers.staminaMult *
        (1 + (this.blessings?.staminaLv ?? 0) * 0.15) *
        (1 + runeB.staminaBonus) *
        mastB.staminaMult *
        lvB.staminaMult *
        heroStats.eq.staminaMult *
        heroStats.evo.staminaMult
    );
    this.player.maxStamina = expectedMaxStam;
    this.player.stamina = expectedMaxStam;
    this.prevWalkDust = this.player.walkDist;
    this.wasInWater = false;

    for (const sw of this.shockwaves) sw.active = false;
    for (const sl of this.impactSlashes) sl.active = false;

    // Spawn live entities
    this.liveEntities = next.entities.map((def, idx) => {
      const isRelic = def.kind === 'relic' || def.kind === 'winged_relic';
      const isCoin = def.kind === 'astral_coin';
      const isChestOpen = def.kind === 'treasure_chest' && this.openedChests.has(def.id);
      const isRiftDone = def.kind === 'rift_trial' && this.completedRifts.has(def.id);
      const collected =
        (isRelic && this.collectedRelics.has(def.id)) ||
        (isCoin && this.collectedCoins.has(def.id)) ||
        isRiftDone;
      const isBeaconLit = def.kind === 'quest_beacon' && this.litBeacons.has(def.id);
      const isTabletRead = def.kind === 'lore_tablet' && this.readTablets.has(def.id);
      const isDoorOpen = (def.kind === 'lock_door' || def.kind === 'switch_gate') && this.openedDoors.has(def.id);
      let w = def.w ?? 12;
      let h = def.h ?? 12;
      const bossKind = isBossKind(def.kind) ? def.kind : null;
      const bossEntity = bossKind !== null;
      if (def.kind === 'astral_coin') {
        w = def.w ?? 8;
        h = def.h ?? 8;
      } else if (def.kind === 'speed_pad') {
        w = def.w ?? 16;
        h = def.h ?? 8;
      } else if (def.kind === 'treasure_chest') {
        w = def.w ?? 14;
        h = def.h ?? 12;
      } else if (def.kind === 'quest_beacon') {
        w = def.w ?? 14;
        h = def.h ?? 20;
      } else if (def.kind === 'lore_tablet') {
        w = def.w ?? 14;
        h = def.h ?? 16;
      } else if (def.kind === 'checkpoint_totem' || def.kind === 'elemental_totem' || def.kind === 'echo_mirror') {
        w = def.w ?? 14;
        h = def.h ?? 18;
      } else if (def.kind === 'chrono_gate') {
        w = def.w ?? 14;
        h = def.h ?? 22;
      } else if (def.kind === 'bumper_orb' || def.kind === 'shield_orb' || def.kind === 'grapple_anchor' || def.kind === 'heal_orb' || def.kind === 'laser_prism') {
        w = def.w ?? 14;
        h = def.h ?? 14;
      } else if (def.kind === 'boss_crown_shard') {
        w = def.w ?? 12;
        h = def.h ?? 12;
      } else if (def.kind === 'rift_trial') {
        w = def.w ?? 16;
        h = def.h ?? 18;
      } else if (def.kind === 'boost_hoop') {
        w = def.w ?? 14;
        h = def.h ?? 18;
      } else if (def.kind === 'blessing_shrine') {
        w = def.w ?? 16;
        h = def.h ?? 18;
      } else if (bossEntity) {
        w = 22;
        h = 24;
      } else if (def.kind === 'cannon_barrel') {
        w = 14;
        h = 14;
      } else if (def.kind === 'phase_veil') {
        w = def.w ?? 6;
        h = def.h ?? 40;
      } else if (def.kind === 'pulse_fan') {
        w = def.w ?? 24;
        h = def.h ?? 72;
      } else if (def.kind === 'star_shard') {
        w = 8;
        h = 8;
      } else if (def.kind === 'zip_block' || def.kind === 'plate_bridge') {
        w = def.w ?? 24;
        h = def.h ?? 10;
      } else if (def.kind === 'wind_up' || def.kind === 'wind_left' || def.kind === 'wind_right' || def.kind === 'wind_down' || def.kind === 'antigrav_zone' || def.kind === 'lightning_zone') {
        w = def.w ?? 32;
        h = def.h ?? 96;
      }
      const isElite = Boolean(def.isElite && !bossEntity);
      const isExclusiveEnemy = (EXCLUSIVE_ENEMY_KINDS as readonly string[]).includes(def.kind);
      const baseMaxHp = bossKind
        ? getAnyBossMeta(bossKind).maxHp
        : isExclusiveEnemy
          ? computeProgressiveEnemyHp(def.kind as any, next.chapterIndex, next.stageIndex, isElite)
          : def.kind === 'enemy_abyss_knight' ||
              def.kind === 'enemy_obsidian_golem_uw' ||
              def.kind === 'enemy_fallen_seraph'
            ? 3
            : def.kind === 'enemy_golem' ||
                def.kind === 'enemy_slime_king' ||
                def.kind === 'enemy_magma_wyrm' ||
                def.kind === 'enemy_bone_knight' ||
                def.kind === 'enemy_shield_phalanx' ||
                def.kind === 'enemy_anchor_brute' ||
                def.kind === 'enemy_rune_monolith' ||
                def.kind === 'enemy_crystal_gargoyle' ||
                def.kind === 'enemy_chain_jailer' ||
                def.kind === 'enemy_hellhound' ||
                def.kind === 'enemy_doom_bell' ||
                def.kind === 'enemy_abyss_gargoyle' ||
                def.kind === 'enemy_magma_tortoise' ||
                def.kind === 'enemy_spectral_executioner' ||
                def.kind === 'enemy_styx_ferryman'
              ? 2
              : 1;
      const maxHp = isExclusiveEnemy ? baseMaxHp : isElite ? baseMaxHp * 2 : baseMaxHp;
      const bEntry = bossKind ? getAnyBossBestiary(bossKind) : null;
      const elemCycle: ElementType[] = ['flame', 'frost', 'volt', 'void', 'astral'];
      return {
        def,
        x: def.x,
        y: def.y,
        w,
        h,
        vx: 0,
        vy: 0,
        homeX: def.x,
        homeY: def.y,
        timer: 0,
        cooldown: bossEntity ? 0.9 : 0,
        state: isDoorOpen || isChestOpen ? 'open' : isBeaconLit || isTabletRead ? 'lit' : 'idle',
        hp: maxHp,
        maxHp,
        dir: def.dir ?? 1,
        flash: 0,
        koTimer: 0,
        collected,
        attackIdx: 0,
        aimX: def.x,
        aimY: def.y,
        bossSubState: bossEntity ? 'orbit' : undefined,
        stagger: 0,
        maxStagger: bEntry ? bEntry.maxStagger : undefined,
        recoverTimer: 0,
        trail: bossEntity ? [] : undefined,
        subType: def.kind === 'elemental_totem' ? elemCycle[(idx + next.chapterIndex + next.stageIndex) % elemCycle.length] : undefined,
        elementMark: null,
        elementTimer: 0,
        isElite,
        hitInvulnTimer: 0,
        immunePopCd: 0,
      };
    });

    this.phoenixAshUsedInRoom = false;
    this.aegisRegenTimer = 0;
    this.echoCloneTimer = 0;
    this.echoHistory = [];
    this.unlockMechanic('DETAILED_MASONRY');
    this.unlockMechanic('BIOME_DETAIL_PROPS');

    if (!withSlide) {
      if (this.roomRespawnOverride && this.roomRespawnOverride.roomId === next.id) {
        this.player.x = this.roomRespawnOverride.x;
        this.player.y = this.roomRespawnOverride.y;
        const cp = this.liveEntities.find((e) => e.def.kind === 'checkpoint_totem');
        if (cp) cp.state = 'lit';
      } else {
        this.player.x = next.spawnX;
        this.player.y = next.spawnY;
      }
    }
    this.ensurePlayerClear();
    this.spiritX = this.player.x - this.player.facing * 14;
    this.spiritY = this.player.y - 8;
    this.snapCamera();

    if (this.mode === 'playing') {
      gameAudio.updateBiomeAmbience(next.biome);
      this.showBiomeBannerIfChanged(next.biome);
      const roomBoss = this.liveEntities.find((e) => isBossKind(e.def.kind) && e.state !== 'dead');
      if (roomBoss && isBossKind(roomBoss.def.kind)) {
        const bMeta = getAnyBossMeta(roomBoss.def.kind);
        this.bannerTitle = bMeta.name.toUpperCase();
        this.bannerSub = bMeta.title;
        this.bannerTimer = 3.2;
        gameAudio.playBossRoar();
        const bCs = BOSS_INTRO_CUTSCENE[roomBoss.def.kind];
        if (
          this.playMode === 'campaign' &&
          !this.skipNextAutoCutscene &&
          bCs &&
          !this.seenCutscenes.has(bCs)
        ) {
          this.triggerCutscene(bCs);
        }
      }
    }
    this.saveProgress();
  }

  public spawnParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    life = 0.35,
    size = 2,
    gravity = 120
  ): void {
    const p = this.particles[this.particleHead];
    this.particleHead = (this.particleHead + 1) % PARTICLE_POOL_SIZE;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.life = life;
    p.maxLife = life;
    p.size = size;
    p.gravity = gravity;
  }

  public burstParticles(x: number, y: number, count: number, color: string, speed = 75): void {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const spd = speed * (0.45 + Math.random() * 0.75);
      this.spawnParticle(x, y, Math.cos(a) * spd, Math.sin(a) * spd, color, 0.25 + Math.random() * 0.25, i % 3 === 0 ? 2 : 1, 140);
    }
  }

  public burstDirectionalSparks(
    x: number,
    y: number,
    dirAngle: number,
    spread: number,
    count: number,
    color: string,
    speed = 135
  ): void {
    for (let i = 0; i < count; i++) {
      const a = dirAngle + (Math.random() - 0.5) * spread;
      const spd = speed * (0.6 + Math.random() * 0.75);
      this.spawnParticle(
        x + (Math.random() - 0.5) * 4,
        y + (Math.random() - 0.5) * 4,
        Math.cos(a) * spd,
        Math.sin(a) * spd,
        color,
        0.22 + Math.random() * 0.22,
        i % 3 === 0 ? 2 : 1,
        110
      );
    }
  }

  private spawnGhost(): void {
    const g = this.ghosts[this.ghostHead];
    this.ghostHead = (this.ghostHead + 1) % GHOST_POOL_SIZE;
    const hero = getHeroDef(this.player.heroId);
    g.active = true;
    g.heroId = hero.id;
    g.anim = this.player.dashTimer > 0 ? 'dash' : 'jump';
    g.frameIdx = Math.floor(Math.random() * 2);
    g.x = this.player.x;
    g.y = this.player.y;
    g.facing = this.player.facing;
    g.color = this.player.dashes >= 2 ? hero.secondaryColor : hero.accentColor;
    g.alpha = 0.72;
    this.unlockMechanic('GHOST_TRAIL');
  }

  private spawnProjectile(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    gravity = 0,
    homing = false,
    pierceWalls = false
  ): void {
    const pr = this.projectiles[this.projHead];
    this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
    pr.active = true;
    pr.x = x;
    pr.y = y;
    pr.vx = vx;
    pr.vy = vy;
    pr.radius = 3;
    pr.gravity = gravity;
    pr.homing = homing;
    pr.friendly = false;
    pr.pierceWalls = pierceWalls;
    pr.color = color;
    pr.life = 4.5;
  }

  public spawnHazardBeam(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    color: string,
    windup = 0.65,
    activeTime = 0.42
  ): void {
    const b = this.beams[this.beamHead];
    this.beamHead = (this.beamHead + 1) % BEAM_POOL_SIZE;
    b.active = true;
    b.x1 = x1;
    b.y1 = y1;
    b.x2 = x2;
    b.y2 = y2;
    b.width = width;
    b.color = color;
    b.windup = windup;
    b.activeTime = activeTime;
    b.state = 'windup';
  }

  private buildCollisionGrid(): CollisionGrid {
    const room = this.currentRoom;
    const cols = room.cols;
    const rows = room.rows;
    const tileStates = this.tileStates;
    const beatPhase = this.beatPhase;
    const liveEntities = this.liveEntities;

    const getTile = (tx: number, ty: number): number => {
      if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return TileType.EMPTY;
      const idx = ty * cols + tx;
      const rt = tileStates.get(idx);
      if (rt && (rt.state === 'gone' || rt.state === 'faded')) return TileType.EMPTY;
      return room.tiles[idx];
    };

    const overlapsLiveSolidEntity = (px: number, py: number, player?: PlayerState): boolean => {
      for (const e of liveEntities) {
        if (e.state === 'open' || e.state === 'dead') continue;
        const k = e.def.kind;
        if (
          k === 'zip_block' ||
          k === 'lock_door' ||
          k === 'switch_gate' ||
          (k === 'plate_bridge' && e.state === 'active')
        ) {
          if (px >= e.x && px < e.x + e.w && py >= e.y && py < e.y + e.h) {
            // Check key opening lock door!
            if (k === 'lock_door' && player && player.carryingKeys.length > 0) {
              player.carryingKeys.pop();
              e.state = 'open';
              this.openedDoors.add(e.def.id);
              this.unlockMechanic('KEY_LOCK_DOOR');
              this.burstParticles(e.x + 4, e.y + 20, 18, '#ffd27d', 90);
              gameAudio.playKeyOrSwitch();
              return false;
            }
            return true;
          }
        }
      }
      return false;
    };

    return {
      isSolidAtPixel: (px: number, py: number, player?: PlayerState) => {
        if (overlapsLiveSolidEntity(px, py, player)) return true;
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        const t = getTile(tx, ty);
        if (t === TileType.BEAT_A) {
          if (beatPhase === 0) this.unlockMechanic('BEAT_BLOCK_A');
          return beatPhase === 0;
        }
        if (t === TileType.BEAT_B) {
          if (beatPhase === 1) this.unlockMechanic('BEAT_BLOCK_B');
          return beatPhase === 1;
        }
        return isTileValueSolid(t);
      },
      isOneWayAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        const t = getTile(tx, ty);
        if (t === TileType.ONE_WAY) {
          this.unlockMechanic('ONE_WAY_PLATFORM');
          return true;
        }
        return false;
      },
      isDreamAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        return getTile(tx, ty) === TileType.DREAM_BLOCK;
      },
      isIceAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        return getTile(tx, ty) === TileType.ICE;
      },
      isStickyAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        return getTile(tx, ty) === TileType.STICKY_RESIN;
      },
      isMagmaAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        return getTile(tx, ty) === TileType.MAGMA_CRUST;
      },
      isWaterAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        return getTile(tx, ty) === TileType.WATER;
      },
      isCloudBounceAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        return getTile(tx, ty) === TileType.CLOUD_BOUNCE;
      },
      getConveyorAtPixel: (px: number, py: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        const t = getTile(tx, ty);
        if (t === TileType.CONVEYOR_LEFT) return -42;
        if (t === TileType.CONVEYOR_RIGHT) return 42;
        return 0;
      },
      isHazardAtPixel: (px: number, py: number, _vx: number, vy: number) => {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        const t = getTile(tx, ty);
        if (t === TileType.LIQUID_LETHAL) {
          this.unlockMechanic('LETHAL_LIQUID');
          return true;
        }
        if (t === TileType.SPIKE_UP && vy >= -10) {
          this.unlockMechanic('THORN_SPIKE');
          return true;
        }
        if (t === TileType.SPIKE_DOWN && vy <= 10) {
          this.unlockMechanic('THORN_SPIKE');
          return true;
        }
        if (t === TileType.SPIKE_LEFT || t === TileType.SPIKE_RIGHT) {
          this.unlockMechanic('THORN_SPIKE');
          return true;
        }
        return false;
      },
      onTileTouched: (tx: number, ty: number, kind: 'land' | 'dash' | 'grab') => {
        if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return;
        const idx = ty * cols + tx;
        const t = room.tiles[idx];
        const rt = tileStates.get(idx);

        if (t === TileType.CRUMBLE && (!rt || rt.state === 'solid')) {
          tileStates.set(idx, { state: 'shaking', timer: 0.45 });
          this.unlockMechanic('CRUMBLE_BLOCK');
          gameAudio.playCrumble();
        } else if (t === TileType.FRAGILE_GLASS && kind === 'land' && (!rt || rt.state === 'solid')) {
          tileStates.set(idx, { state: 'shaking', timer: 0.12 });
          this.unlockMechanic('FRAGILE_GLASS');
        } else if (t === TileType.BREAKABLE && kind === 'dash' && (!rt || rt.state === 'solid')) {
          tileStates.set(idx, { state: 'gone', timer: 9999 });
          this.unlockMechanic('BREAKABLE_WALL');
          this.hitstop = 0.04;
          this.trauma = Math.min(1, this.trauma + 0.45);
          this.spawnShockwave(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 24, '#ffd299', 0.25);
          this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 14, '#c7b8a1', 95);
          gameAudio.playEnemyHit(true);
        } else if (t === TileType.SECRET_WALL && kind === 'dash' && (!rt || rt.state === 'solid')) {
          // Reveal entire connected secret cluster!
          this.revealSecretCluster(tx, ty);
          this.unlockMechanic('SECRET_FALSE_WALL');
          this.spawnShockwave(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 26, '#ffe099', 0.28);
          this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 12, '#ffe099', 70);
          gameAudio.playCrystal();
        }
      },
    };
  }

  private revealSecretCluster(startX: number, startY: number): void {
    const cols = this.currentRoom.cols;
    const rows = this.currentRoom.rows;
    const stack: [number, number][] = [[startX, startY]];
    const seen = new Set<number>();
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
      const idx = y * cols + x;
      if (seen.has(idx)) continue;
      seen.add(idx);
      if (this.currentRoom.tiles[idx] === TileType.SECRET_WALL) {
        this.tileStates.set(idx, { state: 'faded', timer: 9999 });
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
  }

  public killPlayer(bypassShield = false): void {
    if (this.player.dead || this.assist.invincible) return;
    const hero = getHeroDef(this.player.heroId);
    const px = this.player.x + 4;
    const py = this.player.y + 5;
    if (!bypassShield && this.player.heroShieldReady) {
      this.player.heroShieldReady = false;
      this.player.invulnTimer = 1.25;
      this.player.vy = -135 * this.player.gravityDir;
      this.player.dashes = Math.max(this.player.dashes, hero.modifiers.baseDashes);
      this.aegisRegenTimer = 12.0;
      this.hitstop = 0.065;
      this.trauma = 0.72;
      this.shakeDirY = -3.2;
      this.damageFlashTimer = 0.34;
      this.damageFlashColor = '#ffe066';
      this.hitFlashTimer = 0.2;
      this.hitFlashColor = '#ffe066';
      this.hitFlashX = px;
      this.hitFlashY = py;
      this.chromaticShakeTimer = 0.24;
      this.speedLinesTimer = 0.26;
      this.spawnImpactSlash(px, py, -Math.PI * 0.25, 32, 4, '#ffe066', true, 0.22);
      this.spawnShockwave(px, py, 34, '#ffe066', 0.3);
      this.spawnShockwave(px, py, 20, '#ffffff', 0.2);
      this.burstParticles(px, py, 28, '#ff8833', 145);
      this.burstParticles(px, py, 16, '#ffe066', 110);
      this.burstParticles(px, py, 10, '#ffffff', 95);
      gameAudio.playEnemyHit(true);
      this.emitHud();
      return;
    }
    if (!bypassShield && this.activeBoons.includes('phoenix_ash') && !this.phoenixAshUsedInRoom) {
      this.phoenixAshUsedInRoom = true;
      this.player.invulnTimer = 2.0;
      this.player.vy = -155 * this.player.gravityDir;
      this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
      this.player.stamina = this.player.maxStamina;
      this.hitstop = 0.08;
      this.trauma = 0.8;
      this.shakeDirY = -3.8;
      this.damageFlashTimer = 0.38;
      this.damageFlashColor = '#ff7733';
      this.hitFlashTimer = 0.24;
      this.hitFlashColor = '#ffaa44';
      this.hitFlashX = px;
      this.hitFlashY = py;
      this.chromaticShakeTimer = 0.28;
      this.speedLinesTimer = 0.34;
      this.spawnFloatingText(px, this.player.y - 12, 'CINZAS DA FÊNIX!', '#ff7733');
      this.spawnImpactSlash(px, py, 0, 40, 5, '#ff7733', true, 0.24);
      this.spawnShockwave(px, py, 48, '#ff7733', 0.36);
      this.spawnShockwave(px, py, 26, '#ffe066', 0.24);
      this.burstParticles(px, py, 36, '#ffe066', 155);
      this.burstParticles(px, py, 18, '#ff5511', 120);
      gameAudio.playRelic();
      this.emitHud();
      return;
    }
    this.player.dead = true;
    this.player.respawnTimer = 0.45;
    this.player.pendingRelics = [];
    this.deaths += 1;
    this.chapterDeaths += 1;
    this.hitstop = 0.07;
    this.trauma = 0.92;
    this.shakeDirY = 3.6;
    this.damageFlashTimer = 0.42;
    this.damageFlashColor = '#ff2244';
    this.hitFlashTimer = 0.22;
    this.hitFlashColor = '#ff3864';
    this.hitFlashX = px;
    this.hitFlashY = py;
    this.chromaticShakeTimer = 0.3;
    this.speedLinesTimer = 0.26;
    this.onRumble?.(160, 0.4, 0.85);
    this.wipeMode = 'out';
    this.wipeTimer = 0.45;
    this.unlockMechanic('TRAUMA_SHAKE');
    this.unlockMechanic('ZERO_FRICTION_RESPAWN');
    this.spawnImpactSlash(px, py, Math.PI * 0.25, 34, 4, '#ff3864', true, 0.24);
    this.spawnShockwave(px, py, 34, '#ff3864', 0.3);
    this.spawnShockwave(px, py, 18, '#ffffff', 0.2);
    // Check if killed in/near lava or bio acid -> splash magma/acid sparks!
    const ltx = Math.floor(px / TILE_SIZE);
    const lty = Math.floor((this.player.y + this.player.h - 2) / TILE_SIZE);
    const deathTile =
      ltx >= 0 && ltx < this.currentRoom.cols && lty >= 0 && lty < this.currentRoom.rows
        ? this.currentRoom.tiles[lty * this.currentRoom.cols + ltx]
        : 0;
    if (deathTile === TileType.LIQUID_LETHAL) {
      const bio = this.currentRoom.biome === 'bioluminescent';
      this.burstParticles(px, this.player.y + 6, 26, bio ? '#7dff80' : '#ff6622', 155);
      this.burstParticles(px, this.player.y + 6, 14, bio ? '#d9ffb3' : '#ffd24d', 110);
    } else {
      this.burstParticles(px, py, 28, hero.accentColor, 150);
      this.burstParticles(px, py, 16, '#ff3864', 120);
      this.burstParticles(px, py, 16, '#ffffff', 100);
    }
    gameAudio.playDeath();

    if (
      this.assist.hardcoreMode ||
      this.playMode === 'glass_cannon' ||
      this.playMode === 'survival' ||
      this.playMode === 'tower'
    ) {
      if (this.playMode === 'survival') {
        this.bestSurvivalWave = Math.max(this.bestSurvivalWave, this.survivalWave);
      }
      if (this.playMode === 'tower') {
        this.bestTowerFloor = Math.max(this.bestTowerFloor, this.towerFloor);
      }
      this.hardcoreGameOver = true;
      this.mode = 'gameover';
      this.saveProgress();
      this.emitHud();
      return;
    }
    this.saveProgress();
    this.emitHud();
  }

  private respawnPlayerInRoom(): void {
    const useOverride =
      this.roomRespawnOverride && this.roomRespawnOverride.roomId === this.currentRoom.id;
    const sx = useOverride ? this.roomRespawnOverride!.x : this.currentRoom.spawnX;
    const sy = useOverride ? this.roomRespawnOverride!.y : this.currentRoom.spawnY;
    const keys = [...this.player.carryingKeys];
    this.player = createInitialPlayer(sx, sy, this.heroId, this.getHeroSkinId());
    this.player.carryingKeys = keys;
    this.player.invulnTimer = 0.35;
    this.enterRoom(this.currentRoom.id, false, null);
    this.player.x = sx;
    this.player.y = sy;
    this.ensurePlayerClear();
    this.snapCamera();
    this.wipeMode = 'in';
    this.wipeTimer = 0.3;
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 22, getHeroDef(this.heroId).accentColor, 0.25);
    this.burstParticles(this.player.x + 4, this.player.y + 5, 14, getHeroDef(this.heroId).accentColor, 75);
    gameAudio.playRespawn();
  }

  public advanceDialogue(choiceIndex?: number): void {
    if (!this.dialogue) return;
    if (this.dialogue.replyText) {
      this.dialogue = null;
      this.emitHud();
      return;
    }
    if (choiceIndex !== undefined && this.dialogue.choices?.[choiceIndex]) {
      this.dialogue.replyText = this.dialogue.choices[choiceIndex].reply;
      gameAudio.playDialogueBlip(1.15);
      this.emitHud();
      return;
    }
    if (this.dialogue.lineIndex < this.dialogue.lines.length - 1) {
      this.dialogue.lineIndex += 1;
      this.dialogue.charIndex = 0;
      gameAudio.playDialogueBlip(1);
    } else if (!this.dialogue.choices || this.dialogue.choices.length === 0) {
      this.dialogue = null;
    }
    this.emitHud();
  }

  private stepFxPools(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (const g of this.ghosts) {
      if (!g.active) continue;
      g.alpha -= dt * 2.8;
      if (g.alpha <= 0) g.active = false;
    }
    for (const sw of this.shockwaves) {
      if (!sw.active) continue;
      sw.life -= dt;
      if (sw.life <= 0) {
        sw.active = false;
        continue;
      }
      const t = 1 - sw.life / sw.maxLife;
      sw.radius = 2 + (sw.maxRadius - 2) * (1 - (1 - t) * (1 - t));
    }
    for (const sl of this.impactSlashes) {
      if (!sl.active) continue;
      sl.life -= dt;
      if (sl.life <= 0) {
        sl.active = false;
      }
    }
    for (const ft of this.floatingTexts) {
      if (!ft.active) continue;
      ft.life -= dt;
      if (ft.life <= 0) {
        ft.active = false;
        continue;
      }
      ft.y += ft.vy * dt;
      ft.vy *= 0.94;
    }
  }

  public step(rawDt: number, input: InputState): void {
    const dt = Math.min(rawDt, 0.05);

    // Ambient motes always animate gently (Title & Playing)
    for (const m of this.ambientMotes) {
      m.phase += dt;
      m.x -= m.speed * dt;
      m.y += Math.sin(m.phase * 1.4) * 8 * dt;
      if (m.x < 0) m.x += VIRTUAL_WIDTH;
      if (m.y < 0) m.y += VIRTUAL_HEIGHT;
      if (m.y >= VIRTUAL_HEIGHT) m.y -= VIRTUAL_HEIGHT;
    }

    if (this.mode === 'title' || this.activeCutscene) {
      updateHairVerlet(this.player, dt, -14);
      return;
    }
    if (this.mode === 'paused' || this.mode === 'gameover' || this.mode === 'stage_clear') {
      return;
    }

    // Banner & mechanic toast timers
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.bannerTitle = null;
        this.bannerSub = null;
      }
    }
    if (this.mechanicToastTimer > 0) {
      this.mechanicToastTimer -= dt;
      if (this.mechanicToastTimer <= 0) {
        this.recentMechanicToast = null;
      }
    }

    // Dialogue interaction pause
    if (this.dialogue) {
      const fullLine = this.dialogue.replyText ?? this.dialogue.lines[this.dialogue.lineIndex];
      if (this.dialogue.charIndex < fullLine.length) {
        this.dialogue.charIndex = Math.min(fullLine.length, this.dialogue.charIndex + dt * 55);
      }
      if (input.interactJustPressed || input.jumpJustPressed) {
        this.advanceDialogue();
      }
      return;
    }

    this.elapsedSeconds += dt;
    this.chapterElapsedSeconds += dt;

    if (this.petSkillCooldown > 0) {
      this.petSkillCooldown = Math.max(0, this.petSkillCooldown - dt);
    }
    if (this.activeAlchemyBuffs.length > 0) {
      for (const buff of this.activeAlchemyBuffs) buff.remainingSec -= dt;
      this.activeAlchemyBuffs = this.activeAlchemyBuffs.filter((b) => b.remainingSec > 0);
    }

    if (this.playMode === 'sandbox_world' && this.sandboxWorld) {
      this.stepSandboxMode(dt, input);
      return;
    }

    // Trauma & screen-FX decay
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer = Math.max(0, this.damageFlashTimer - dt);
    }
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    }
    if (this.chromaticShakeTimer > 0) {
      this.chromaticShakeTimer = Math.max(0, this.chromaticShakeTimer - dt);
    }
    if (this.speedLinesTimer > 0) {
      this.speedLinesTimer = Math.max(0, this.speedLinesTimer - dt);
    }
    const dirDecay = Math.exp(-16 * dt);
    this.shakeDirX *= dirDecay;
    this.shakeDirY *= dirDecay;
    if (Math.abs(this.shakeDirX) < 0.02) this.shakeDirX = 0;
    if (Math.abs(this.shakeDirY) < 0.02) this.shakeDirY = 0;

    // Room slide transition freeze
    if (this.transitionTimer > 0) {
      this.transitionTimer = Math.max(0, this.transitionTimer - dt);
      if (this.transitionTimer === 0) this.prevRoomSnapshot = null;
      return;
    }

    // Wipe timer
    if (this.wipeTimer > 0) {
      this.wipeTimer = Math.max(0, this.wipeTimer - dt);
      if (this.wipeTimer === 0) this.wipeMode = 'none';
    }

    this.stepFxPools(dt);

    if (this.hitstop > 0) {
      this.hitstop = Math.max(0, this.hitstop - dt);
      return;
    }

    // Death respawn timer
    if (this.player.dead) {
      this.player.respawnTimer -= dt;
      if (this.player.respawnTimer <= 0) {
        this.respawnPlayerInRoom();
      }
      return;
    }

    const overdriveSpeed = this.overdriveTimer > 0 ? 1.12 : 1.0;
    const simDt = dt * this.assist.gameSpeed * overdriveSpeed;

    // Combo, Overdrive & active skill timers
    if (this.overdriveTimer > 0) {
      this.overdriveTimer = Math.max(0, this.overdriveTimer - dt);
      this.overdrive = Math.round((this.overdriveTimer / 5.0) * 100);
      if (Math.random() < 0.3) {
        this.spawnParticle(
          this.player.x + 4 + (Math.random() - 0.5) * 10,
          this.player.y + 4 + (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 20,
          -24,
          Math.random() < 0.5 ? '#ffe066' : '#52e5ff',
          0.32,
          1,
          -15
        );
      }
    }
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - simDt);
      if (this.comboTimer === 0) this.comboCount = 0;
    }
    if (this.heroSkillCooldown > 0) {
      this.heroSkillCooldown = Math.max(0, this.heroSkillCooldown - simDt);
    }
    if (this.tagSwapCooldown > 0) {
      this.tagSwapCooldown = Math.max(0, this.tagSwapCooldown - simDt);
    }
    if (this.grappleCooldown > 0) {
      this.grappleCooldown = Math.max(0, this.grappleCooldown - simDt);
    }
    if (this.perfectDodgeCooldown > 0) {
      this.perfectDodgeCooldown = Math.max(0, this.perfectDodgeCooldown - simDt);
    }
    if (this.imbuedTimer > 0) {
      this.imbuedTimer = Math.max(0, this.imbuedTimer - simDt);
      if (this.imbuedTimer === 0) this.imbuedElement = null;
    }
    if (this.activeBoons.includes('aegis_reforge') && !this.player.heroShieldReady) {
      this.aegisRegenTimer -= simDt;
      if (this.aegisRegenTimer <= 0) {
        this.player.heroShieldReady = true;
        this.spawnFloatingText(this.player.x + 4, this.player.y - 10, 'ÉGIDE ATIVA!', '#ff9e64');
        this.spawnShockwave(this.player.x + 4, this.player.y + 5, 22, '#ff9e64', 0.25);
        gameAudio.playCrystal();
      }
    }
    if (this.echoCloneTimer > 0) {
      this.echoCloneTimer = Math.max(0, this.echoCloneTimer - simDt);
      this.echoHistory.push({ x: this.player.x, y: this.player.y, facing: this.player.facing });
      if (this.echoHistory.length > 18) {
        const delayed = this.echoHistory.shift()!;
        this.echoCloneX = delayed.x;
        this.echoCloneY = delayed.y;
        this.echoCloneFacing = delayed.facing;
      }
    }
    if (this.player.stasisTimer && this.player.stasisTimer > 0) {
      this.player.stasisTimer = Math.max(0, this.player.stasisTimer - simDt);
    }

    // Orbiting Spirit companion movement & periodic combat bolt
    if (this.equippedSpirit !== 'none') {
      const spDef = SPIRIT_MAP[this.equippedSpirit] ?? DETAILED_PET_MAP[this.equippedSpirit];
      if (spDef) {
        const targetSpX = this.player.x + 4 - this.player.facing * 14 + Math.cos(this.elapsedSeconds * 3.1) * 5;
        const targetSpY = this.player.y - 6 + Math.sin(this.elapsedSeconds * 4.2) * 4;
        const sLerp = 1 - Math.exp(-8.5 * dt);
        this.spiritX += (targetSpX - this.spiritX) * sLerp;
        this.spiritY += (targetSpY - this.spiritY) * sLerp;
        if (Math.random() < 0.25) {
          this.spawnParticle(this.spiritX, this.spiritY, (Math.random() - 0.5) * 14, -12, spDef.color, 0.26, 1, 0);
        }
      this.spiritShootTimer -= simDt;
      if (this.spiritShootTimer <= 0) {
        let nearestFoe: LiveEntity | null = null;
        let bestDist = 175;
        for (const foe of this.liveEntities) {
          if (foe.state === 'dead') continue;
          if (!foe.def.kind.startsWith('enemy_') && !isBossKind(foe.def.kind)) continue;
          const d = Math.hypot(foe.x + foe.w * 0.5 - this.spiritX, foe.y + foe.h * 0.5 - this.spiritY);
          if (d < bestDist) {
            bestDist = d;
            nearestFoe = foe;
          }
        }
        if (nearestFoe) {
          this.spiritShootTimer = spDef.shootInterval;
          const fx = nearestFoe.x + nearestFoe.w * 0.5;
          const fy = nearestFoe.y + nearestFoe.h * 0.5;
          const len = Math.hypot(fx - this.spiritX, fy - this.spiritY) || 1;
          const spr = this.projectiles[this.projHead];
          this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
          spr.active = true;
          spr.x = this.spiritX;
          spr.y = this.spiritY;
          spr.vx = ((fx - this.spiritX) / len) * 185;
          spr.vy = ((fy - this.spiritY) / len) * 185;
          spr.radius = 3;
          spr.gravity = 0;
          spr.homing = true;
          spr.friendly = true;
          spr.pierceWalls = true;
          spr.color = spDef.color;
          spr.life = 2.4;
          this.burstParticles(this.spiritX, this.spiritY, 6, spDef.secondaryColor, 55);
          gameAudio.playCrystal();
        } else {
          this.spiritShootTimer = 0.6;
        }
      }
      }
    }

    // Ghost Replay sampling
    this.ghostRoomClock += simDt;
    this.ghostRecordAccum += simDt;
    if (this.ghostRecordAccum >= 0.06) {
      this.ghostRecordAccum -= 0.06;
      if (this.ghostRecording.length < 800) {
        this.ghostRecording.push({
          t: Number(this.ghostRoomClock.toFixed(2)),
          x: Math.round(this.player.x * 10) / 10,
          y: Math.round(this.player.y * 10) / 10,
          facing: this.player.facing,
        });
      }
    }

    // Astral Rift Trial timer & rings
    if (this.riftActive) {
      this.riftTimer -= simDt;
      for (const ring of this.riftRings) {
        if (ring.collected) continue;
        if (Math.hypot(this.player.x + 4 - ring.x, this.player.y + 5 - ring.y) < 16) {
          ring.collected = true;
          this.riftProgress += 1;
          this.player.dashes = Math.max(this.player.dashes, 1);
          this.player.stamina = this.player.maxStamina;
          this.addCombo(2, 110);
          this.spawnShockwave(ring.x, ring.y, 24, '#4df0c0', 0.25);
          this.burstParticles(ring.x, ring.y, 14, '#ffe066', 90);
          this.spawnFloatingText(ring.x, ring.y - 8, `${this.riftProgress}/${this.riftTotal}`, '#4df0c0');
          gameAudio.playCrystal();
        }
      }
      if (this.riftProgress >= this.riftTotal) {
        this.riftActive = false;
        const trialEntity = this.liveEntities.find((e) => e.def.kind === 'rift_trial');
        if (trialEntity) {
          trialEntity.collected = true;
          this.completedRifts.add(trialEntity.def.id);
        }
        this.astralCoins += 8;
        this.grantMasteryXp(75);
        this.spawnFloatingText(this.player.x + 4, this.player.y - 12, 'FENDA CONCLUIDA! +8 ★', '#ffe066');
        this.spawnShockwave(this.player.x + 4, this.player.y + 5, 42, '#4df0c0', 0.36);
        this.unlockAchievement('rift_runner');
        this.saveProgress();
        this.emitHud();
      } else if (this.riftTimer <= 0) {
        this.riftActive = false;
        this.riftRings = [];
        this.spawnFloatingText(this.player.x + 4, this.player.y - 10, 'FENDA EXPIRADA', '#ff6688');
        this.emitHud();
      }
    }

    // Weather ambient particles
    if (this.roomWeather === 'astral_meteor' && Math.random() < 0.14) {
      this.spawnParticle(
        this.cameraX + Math.random() * VIRTUAL_WIDTH,
        this.cameraY - 4,
        -35,
        160,
        '#fbbf24',
        0.9,
        2,
        20
      );
    } else if (this.roomWeather === 'wind_gale' && Math.random() < 0.25) {
      this.spawnParticle(
        this.cameraX - 4,
        this.cameraY + Math.random() * VIRTUAL_HEIGHT,
        180,
        Math.sin(this.elapsedSeconds * 3) * 18,
        '#5eead4',
        0.85,
        1,
        0
      );
    }

    // Beat blocks pulse every 1.1s
    this.beatTimer += simDt;
    if (this.beatTimer >= 1.1) {
      this.beatTimer -= 1.1;
      this.beatPhase = this.beatPhase === 0 ? 1 : 0;
    }

    // Tile runtime updates (crumble/respawn)
    const roomCols = this.currentRoom.cols;
    for (const [idx, rt] of this.tileStates.entries()) {
      if (rt.state === 'shaking') {
        rt.timer -= simDt;
        if (rt.timer <= 0) {
          rt.state = 'gone';
          rt.timer = 2.5;
          const tx = idx % roomCols;
          const ty = Math.floor(idx / roomCols);
          this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 6, '#9e92a8', 45);
        }
      } else if (rt.state === 'gone' && rt.timer < 500) {
        rt.timer -= simDt;
        if (rt.timer <= 0) {
          this.tileStates.delete(idx);
          this.unlockMechanic('CRUMBLE_RESPAWN');
        }
      }
    }

    // Compute active wind / antigrav zones overlapping player
    const weatherMeta = WEATHER_META[this.roomWeather] ?? WEATHER_META.clear;
    let windX = weatherMeta.windX;
    let windY = 0;
    let lowGravZone = false;
    for (const e of this.liveEntities) {
      if (
        this.player.x + this.player.w > e.x &&
        this.player.x < e.x + e.w &&
        this.player.y + this.player.h > e.y &&
        this.player.y < e.y + e.h
      ) {
        if (e.def.kind === 'wind_up') {
          windY -= 1100;
          this.unlockMechanic('WIND_UPDRAFT');
        } else if (e.def.kind === 'wind_left') {
          windX -= 320;
          this.unlockMechanic('WIND_CROSS');
        } else if (e.def.kind === 'wind_right') {
          windX += 320;
          this.unlockMechanic('WIND_CROSS');
        } else if (e.def.kind === 'wind_down') {
          windY += 420;
          this.unlockMechanic('WIND_DOWN');
        } else if (e.def.kind === 'antigrav_zone') {
          lowGravZone = true;
        }
      }
    }

    const swingGrid = this.buildCollisionGrid();

    // Free Aerial Grapple Hook / Vine Swing (wall-collision & corner-safe!)
    if (this.activeGrappleId) {
      const anchor = this.liveEntities.find((e) => e.def.id === this.activeGrappleId);
      if (!anchor || input.jumpJustPressed || !input.grabHeld) {
        const speedMul = 1 + computeRuneBonuses(this.equippedRunes).jumpBonus;
        resolveSwingRelease(swingGrid, this.player, this.grappleAngle, 195 * speedMul, -142 * speedMul);
        this.player.dashes = Math.max(this.player.dashes, 1);
        this.player.airJumpsLeft = this.player.maxAirJumps;
        this.activeGrappleId = null;
        this.grappleCooldown = 0.22;
        this.spawnShockwave(this.player.x + 4, this.player.y + 4, 24, '#38bdf8', 0.24);
        gameAudio.playJump(true);
      } else {
        const drive = ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 12;
        const climb = ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * 42 * simDt;
        const targetRadius = Math.max(14, Math.min(48, this.grappleRadius + climb));
        this.grappleAngVel += (-Math.sin(this.grappleAngle) * 16 + drive) * simDt;
        this.grappleAngVel *= 0.992;
        const prevAngle = this.grappleAngle;
        const targetAngle = prevAngle + this.grappleAngVel * simDt;
        const ax = anchor.x + anchor.w * 0.5;
        const ay = anchor.y + anchor.h * 0.5;
        const solved = resolveSwingStep(
          swingGrid,
          this.player,
          ax,
          ay,
          prevAngle,
          targetAngle,
          this.grappleAngVel,
          targetRadius
        );
        this.player.x = solved.x;
        this.player.y = solved.y;
        this.grappleAngle = solved.angle;
        this.grappleAngVel = solved.angVel;
        this.grappleRadius = solved.radius;
        if (Math.abs(this.grappleAngVel) > 0.05) {
          this.player.facing = this.grappleAngVel >= 0 ? 1 : -1;
        }
        this.updateCamera(dt);
        updateHairVerlet(this.player, dt, 0);
        return;
      }
    } else if (input.grabHeld && !this.player.onGround && this.grappleCooldown <= 0) {
      let bestAnchor: LiveEntity | null = null;
      const boonGrappleRange = 66 * computeBoonBonuses(this.activeBoons).grappleRangeMult;
      let bestDist = boonGrappleRange;
      const px = this.player.x + 4;
      const py = this.player.y + 5;
      for (const e of this.liveEntities) {
        if (e.def.kind !== 'grapple_anchor') continue;
        const d = Math.hypot(e.x + e.w * 0.5 - px, e.y + e.h * 0.5 - py);
        if (d < bestDist && py >= e.y - 6) {
          bestDist = d;
          bestAnchor = e;
        }
      }
      if (bestAnchor) {
        const ax = bestAnchor.x + bestAnchor.w * 0.5;
        const ay = bestAnchor.y + bestAnchor.h * 0.5;
        const initRad = Math.max(16, Math.min(48, bestDist));
        const initAngle = Math.atan2(px - ax, Math.max(4, py - ay));
        const initVel = (this.player.vx / Math.max(18, initRad)) * 0.9;
        const solved = resolveSwingStep(
          swingGrid,
          this.player,
          ax,
          ay,
          initAngle,
          initAngle,
          initVel,
          initRad
        );
        this.player.x = solved.x;
        this.player.y = solved.y;
        this.activeGrappleId = bestAnchor.def.id;
        this.grappleRadius = solved.radius;
        this.grappleAngle = solved.angle;
        this.grappleAngVel = solved.angVel;
        this.spawnShockwave(ax, ay, 20, '#38bdf8', 0.22);
        gameAudio.playKeyOrSwitch();
      }
    }

    // Bubble / Tether override check
    if (this.player.bubbleId) {
      this.player.bubbleTimer -= simDt;
      const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      const moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
      if (this.player.bubbleTimer <= 0 || input.jumpJustPressed || input.dashJustPressed) {
        const dx = moveX || this.player.facing;
        const dy = moveY;
        const len = Math.hypot(dx, dy) || 1;
        this.player.vx = (dx / len) * 230;
        this.player.vy = (dy / len) * 230;
        this.player.bubbleId = null;
        this.player.dashes = Math.max(this.player.dashes, 1);
        gameAudio.playDash(true);
        this.unlockMechanic('BOUNCE_BUBBLE');
      }
      return;
    }

    if (this.player.tetherId) {
      const ring = this.liveEntities.find((e) => e.def.id === this.player.tetherId);
      if (!ring || input.jumpJustPressed || !input.grabHeld) {
        this.player.tetherId = null;
        this.grappleCooldown = 0.22;
        resolveSwingRelease(swingGrid, this.player, this.player.tetherAngle, 140, -125);
        this.player.dashes = Math.max(this.player.dashes, 1);
        gameAudio.playJump(true);
      } else {
        const drive = ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * 9;
        this.player.tetherAngVel += (-Math.sin(this.player.tetherAngle) * 14 + drive) * simDt;
        this.player.tetherAngVel *= 0.99;
        const prevAngle = this.player.tetherAngle;
        const targetAngle = prevAngle + this.player.tetherAngVel * simDt;
        const solved = resolveSwingStep(
          swingGrid,
          this.player,
          ring.x + 4,
          ring.y + 4,
          prevAngle,
          targetAngle,
          this.player.tetherAngVel,
          22
        );
        this.player.x = solved.x;
        this.player.y = solved.y;
        this.player.tetherAngle = solved.angle;
        this.player.tetherAngVel = solved.angVel;
        this.updateCamera(dt);
        updateHairVerlet(this.player, dt, 0);
        return;
      }
    }

    if (this.lockedGoalToastCooldown > 0) {
      this.lockedGoalToastCooldown = Math.max(0, this.lockedGoalToastCooldown - dt);
    }

    // Duo Tag-Team Swap [F]
    if (input.swapJustPressed && this.tagSwapCooldown <= 0) {
      const prevHeroId = this.heroId;
      const unlockedList = Array.from(this.unlockedHeroes);
      const nextHeroId =
        this.tagHeroId !== prevHeroId && this.unlockedHeroes.has(this.tagHeroId)
          ? this.tagHeroId
          : unlockedList.find((id) => id !== prevHeroId) ?? 'zephyr';
      this.tagHeroId = prevHeroId;
      this.tagSwapCooldown = 3.2;
      const prevElem = getHeroElement(prevHeroId);
      const nextElem = getHeroElement(nextHeroId);
      const nextHero = getHeroDef(nextHeroId);
      const resolvedSkin = getHeroSkinDef(nextHeroId, this.heroSkinByHero[nextHeroId]).id;
      this.heroId = nextHeroId;
      this.player.heroId = nextHeroId;
      this.player.skinId = resolvedSkin;
      this.player.dashes = Math.max(this.player.dashes, 1);
      this.player.invulnTimer = Math.max(this.player.invulnTimer, 0.25);
      this.hitstop = 0.035;
      this.spawnGhost();
      this.spawnShockwave(this.player.x + 4, this.player.y + 5, 42, nextHero.accentColor, 0.3);
      this.burstParticles(this.player.x + 4, this.player.y + 5, 22, nextHero.particleColor, 110);
      this.spawnFloatingText(this.player.x + 4, this.player.y - 10, `DUPLA: ${nextHero.name.toUpperCase()}!`, nextHero.accentColor);
      for (const foe of this.liveEntities) {
        if (
          foe.state !== 'dead' &&
          (foe.def.kind.startsWith('enemy_') || isBossKind(foe.def.kind)) &&
          Math.hypot(foe.x + foe.w * 0.5 - (this.player.x + 4), foe.y + foe.h * 0.5 - (this.player.y + 5)) < 54
        ) {
          foe.elementMark = foe.elementMark ?? prevElem;
          foe.elementTimer = 6.0;
          this.damageEntity(foe, 1, nextElem);
        }
      }
      this.unlockAchievement('duo_synergy');
      gameAudio.playDash(true);
      this.emitHud();
    }

    // Step player physics + [Q] Hero Signature Active Skill + [U] Golpe da Alma
    const grid = swingGrid;
    if (input.skillJustPressed && this.heroSkillCooldown <= 0) {
      this.triggerHeroSkill(grid);
    }
    if (input.soulSlashJustPressed) {
      this.triggerSoulStrike();
    }
    const modeWindMult = this.playMode === 'mirror_void' ? 1.45 : 1;
    const runeB = computeRuneBonuses(this.equippedRunes);
    const boonB = computeBoonBonuses(this.activeBoons);
    const mastB = getMasteryBonuses(this.mastery);
    const lvB = getPlayerLevelBonuses(this.getPlayerLevel());
    const heroStats = this.getEffectiveHeroStats();
    const talSpeedBonus = this.equippedTalisman === 'selo_cinza' ? 1.08 : 1;
    const talStamBonus = this.equippedTalisman === 'asa_serafim' ? 1.22 : 1;
    const events = stepPlayerPhysics(
      this.player,
      input,
      simDt,
      grid,
      this.assist,
      windX * modeWindMult,
      windY * modeWindMult,
      lowGravZone,
      this.blessings,
      {
        gravityMult: (this.playMode === 'mirror_void' ? 0.72 : 1) * weatherMeta.gravityMult,
        speedMult:
          (this.playMode === 'glass_cannon' ? 1.15 : 1) *
          (1 + runeB.speedBonus) *
          mastB.speedMult *
          boonB.speedMult *
          talSpeedBonus *
          lvB.speedMult *
          heroStats.eq.speedMult *
          heroStats.evo.speedMult *
          heroStats.alchemySpeedMult,
        jumpMult: (1 + runeB.jumpBonus) * mastB.jumpMult * heroStats.eq.jumpMult,
        staminaMult:
          (1 + runeB.staminaBonus) *
          mastB.staminaMult *
          boonB.staminaMult *
          talStamBonus *
          lvB.staminaMult *
          heroStats.eq.staminaMult *
          heroStats.evo.staminaMult,
        extraAirDash: (this.playMode === 'mirror_void' ? 1 : 0) + heroStats.eq.extraAirDash + heroStats.evo.extraAirDash,
        extraAirJump: runeB.extraAirJump + boonB.extraAirJump + heroStats.eq.extraAirJump + heroStats.evo.extraAirJump,
      }
    );

    // Process physics events -> audio, particles, mechanics!
    for (const code of events.unlockedMechanics) {
      this.unlockMechanic(code);
    }

    // Track advanced movement mechanics + Frost Nova Boon
    if (Math.hypot(this.player.vx, this.player.vy) > 220) {
      this.unlockMechanic('MOMENTUM_CONSERVATION');
      this.unlockMechanic('VELOCITY_AURA');
    }
    if (this.player.inWater && this.player.dashTimer > 0) {
      this.player.vy = Math.min(this.player.vy, -110 * this.player.gravityDir);
      this.unlockMechanic('WATER_SKIP');
    }
    if (this.player.gravityDir === -1 && this.player.crouch) {
      this.unlockMechanic('GRAVITY_SLIDE');
    }

    const activeHero = getHeroDef(this.player.heroId);
    if (events.jumped) {
      gameAudio.playJump(events.airJumped);
      if (events.airJumped) {
        this.burstParticles(this.player.x + 4, this.player.y + this.player.h, 12, '#ffe885', 68);
        this.burstParticles(this.player.x + 4, this.player.y + 6, 8, '#9ed9ff', 54);
      } else {
        this.burstParticles(this.player.x + 4, this.player.y + this.player.h, 5, '#e8e2f0', 42);
      }
    }
    if (events.wallJumped) {
      gameAudio.playJump(true);
      this.burstParticles(this.player.x + 4, this.player.y + 6, 6, activeHero.particleColor, 48);
    }
    if (events.dashed) {
      const superTech =
        events.unlockedMechanics.includes('HYPER_DASH') ||
        events.unlockedMechanics.includes('WAVE_DASH') ||
        events.unlockedMechanics.includes('WALL_BOUNCE');
      gameAudio.playDash(superTech);
      this.hitstop = superTech ? 0.04 : 0.03;
      this.trauma = Math.min(1, this.trauma + (superTech ? 0.36 : 0.28));
      this.shakeDirX = this.player.dashDirX * (superTech ? 2.5 : 1.6);
      this.shakeDirY = this.player.dashDirY * (superTech ? 2.0 : 1.2);
      this.speedLinesTimer = Math.max(this.speedLinesTimer, superTech ? 0.3 : 0.16);
      if (superTech) this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, 0.1);
      this.onRumble?.(55, 0.18, 0.3);
      this.spawnShockwave(
        this.player.x + 4,
        this.player.y + 5,
        superTech ? 28 : 19,
        activeHero.accentColor,
        0.24
      );
      if (superTech) {
        this.spawnShockwave(this.player.x + 4, this.player.y + 5, 16, '#ffffff', 0.18);
      }
      this.missionStats.dashesUsed += 1;
      const jetAngle = Math.atan2(-this.player.dashDirY, -this.player.dashDirX || -this.player.facing);
      this.burstParticles(this.player.x + 4, this.player.y + 5, 12, activeHero.particleColor, 95);
      this.burstDirectionalSparks(this.player.x + 4, this.player.y + 5, jetAngle, 0.95, 10, '#ffffff', 130);
      this.spawnGhost();

      if (this.activeBoons.includes('frost_nova')) {
        for (const pr of this.projectiles) {
          if (pr.active && !pr.friendly && Math.hypot(pr.x - (this.player.x + 4), pr.y - (this.player.y + 5)) < 34) {
            pr.active = false;
            this.burstParticles(pr.x, pr.y, 5, '#7ce8ff', 50);
          }
        }
      }

      // Winged relics flee if player dashes in the room!
      for (const e of this.liveEntities) {
        if (e.def.kind === 'winged_relic' && !e.collected && e.state === 'idle') {
          e.state = 'active';
          this.unlockMechanic('WINGED_RELIC');
        }
      }
    }
    if (this.player.dashTimer > 0 && Math.random() < 0.55) {
      this.spawnGhost();
    }
    // Subtle hero ambient trail (embers for Ignis, wind sparkles when Zephyr glides)
    if (activeHero.id === 'ignis' && Math.random() < 0.22) {
      this.spawnParticle(
        this.player.x + 4 + (Math.random() - 0.5) * 6,
        this.player.y + 2 + Math.random() * 6,
        -this.player.facing * 12,
        -24 - Math.random() * 14,
        Math.random() < 0.5 ? '#ff7722' : '#ffe066',
        0.35,
        1,
        -15
      );
    } else if (
      activeHero.modifiers.glideMaxFall !== null &&
      !this.player.onGround &&
      this.player.vy > 20 &&
      input.jumpHeld &&
      Math.random() < 0.35
    ) {
      this.spawnParticle(
        this.player.x + 4 + (Math.random() - 0.5) * 10,
        this.player.y + 9,
        (Math.random() - 0.5) * 18,
        10,
        activeHero.particleColor,
        0.28,
        1,
        0
      );
    }
    if (events.landed) {
      gameAudio.playLand(events.heavyLanded);
      this.stompChain = 0;
      this.burstParticles(this.player.x + 4, this.player.y + this.player.h, events.heavyLanded ? 12 : 5, '#d9d4e8', events.heavyLanded ? 56 : 36);
      if (events.heavyLanded) {
        this.trauma = Math.min(1, this.trauma + 0.24);
        this.shakeDirY = 2.0;
        this.spawnShockwave(this.player.x + 4, this.player.y + this.player.h, 16, '#d9d4e8', 0.18);
      }
      if (
        events.unlockedMechanics.includes('METEOR_DIVE') ||
        (events.heavyLanded && this.activeBoons.includes('meteor_slam'))
      ) {
        const cx = this.player.x + 4;
        const cy = this.player.y + this.player.h;
        this.hitstop = 0.04;
        this.trauma = Math.min(1, this.trauma + 0.42);
        this.spawnShockwave(cx, cy, 36, '#ff9944', 0.28);
        this.burstParticles(cx, cy, 18, '#ff9944', 110);
        this.spawnFloatingText(cx, cy - 10, this.activeBoons.includes('meteor_slam') ? 'IMPACTO RESSONANTE!' : 'METEORO!', '#ffe066');
        if (this.activeBoons.includes('meteor_slam')) this.unlockMechanic('RESONANT_LANDING');
        for (const e of this.liveEntities) {
          if (e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && Math.hypot(e.x + e.w * 0.5 - cx, e.y + e.h * 0.5 - cy) < 42) {
            this.damageEntity(e, 1, getHeroElement(this.heroId));
          }
        }
        gameAudio.playEnemyHit(true);
      }
      // Bank pending relics!
      if (this.player.pendingRelics.length > 0 && !this.player.onIce) {
        for (const r of this.player.pendingRelics) {
          this.collectedRelics.add(r.id);
          this.missionStats.relicsCollected += 1;
          this.grantMasteryXp(20);
          this.grantPlayerXp(22);
          this.unlockMechanic(r.winged ? 'WINGED_RELIC' : 'ECHO_RELIC');
          this.burstParticles(this.player.x + 4, this.player.y - 4, 16, '#ff6688', 95);
        }
        this.player.pendingRelics = [];
        if (this.collectedRelics.size >= 10) this.unlockAchievement('relic_hunter_10');
        if (this.collectedRelics.size >= 30) this.unlockAchievement('relic_hunter_30');
        gameAudio.playRelic();
        this.saveProgress();
      }
    }
    if (events.died) {
      this.killPlayer();
      return;
    }

    // Footstep dust, wall-slide friction sparks & water splashes
    if (this.player.onGround && Math.abs(this.player.vx) > 25) {
      if (this.player.walkDist - this.prevWalkDust >= 16) {
        this.prevWalkDust = this.player.walkDist;
        this.spawnParticle(
          this.player.x + 4 - this.player.facing * 3,
          this.player.y + this.player.h - 1,
          -this.player.facing * 14,
          -14,
          getAnyBiomeMeta(this.currentRoom.biome).particleColor,
          0.22,
          1,
          60
        );
      }
    } else {
      this.prevWalkDust = this.player.walkDist;
    }
    if (this.player.wallSlideDir !== 0 && Math.random() < 0.45) {
      this.spawnParticle(
        this.player.wallSlideDir < 0 ? this.player.x : this.player.x + this.player.w,
        this.player.y + 4,
        -this.player.wallSlideDir * 14,
        -22,
        activeHero.particleColor,
        0.2,
        1,
        80
      );
    }
    if (this.player.inWater !== this.wasInWater) {
      this.wasInWater = this.player.inWater;
      this.burstParticles(this.player.x + 4, this.player.y + this.player.h - 1, 8, '#8ce4ff', 58);
    }

    // Update entities, projectiles & hazard beams
    this.stepEntities(simDt, input);
    this.stepProjectiles(simDt);
    this.stepBeams(simDt);

    // Boss Rush auto-advance fallback timer
    if (this.playMode === 'boss_rush' && this.bossRushAdvanceTimer > 0) {
      this.bossRushAdvanceTimer -= dt;
      if (this.bossRushAdvanceTimer <= 0) {
        this.advanceBossRush();
        return;
      }
    }

    // Survival Arena Wave Manager
    if (this.playMode === 'survival' && !this.player.dead) {
      const aliveFoes = this.liveEntities.some(
        (e) => (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && e.state !== 'dead'
      );
      if (!aliveFoes) {
        if (this.survivalWaveTimer <= 0) {
          this.survivalWaveTimer = 1.65;
          this.spawnFloatingText(this.player.x + 4, this.player.y - 12, 'ONDA LIMPA!', '#4df0c0');
        } else {
          this.survivalWaveTimer -= dt;
          if (this.survivalWaveTimer <= 0) {
            this.spawnSurvivalWave();
          }
        }
      }
    }

    // Hair Verlet
    updateHairVerlet(this.player, dt, windX * 0.25);

    // Track 6-sector exploration progress across 3x stages
    if (!this.player.dead) {
      const sectorIdx = computeRoomSectorIndex(
        this.player.x + this.player.w * 0.5,
        this.currentRoom.cols * TILE_SIZE
      );
      const list = this.discoveredSectors[this.currentRoom.id] ?? [];
      if (!list.includes(sectorIdx)) {
        const nextList = [...list, sectorIdx];
        this.discoveredSectors[this.currentRoom.id] = nextList;
        if (nextList.length >= STAGE_EXPLORATION_SECTORS) {
          this.addAstralCoins(8);
          this.grantPlayerXp(35);
          this.passXp += 25;
          this.spawnShockwave(this.player.x + 4, this.player.y + 5, 38, '#ffe066', 0.35);
          this.burstParticles(this.player.x + 4, this.player.y + 5, 22, '#ffe066', 110);
          this.spawnFloatingText(this.player.x + 4, this.player.y - 12, 'ETAPA 100% EXPLORADA! +8 ★', '#ffe066');
          gameAudio.playRelic();
          this.saveProgress();
          this.emitHud();
        } else if (nextList.length > 1) {
          this.spawnFloatingText(
            this.player.x + 4,
            this.player.y - 10,
            `SETOR ${nextList.length}/${STAGE_EXPLORATION_SECTORS}`,
            '#67e8f9'
          );
          this.emitHud();
        }
      }
    }

    // Check screen edge transitions & smooth scrolling camera
    this.checkRoomExitTransitions();
    this.updateCamera(dt);

    // Update throttled HUD snapshot
    this.hudThrottle += dt;
    if (this.hudThrottle >= 0.1) {
      this.hudThrottle = 0;
      this.emitHud();
    }
  }

  private checkRoomExitTransitions(): void {
    const p = this.player;
    const room = this.currentRoom;
    const roomW = room.cols * TILE_SIZE;
    const roomH = room.rows * TILE_SIZE;
    const ch = room.chapterIndex;
    const gx = room.gx;
    const gy = room.gy;

    const roomPrefix = room.id.startsWith('uw_') ? `uw_ch${ch}_` : `ch${ch}_`;
    const findStage = (nx: number, ny: number) => this.roomMap.get(`${roomPrefix}${nx},${ny}`);

    if (p.x + p.w * 0.5 < 0) {
      const target = findStage(gx - 1, gy);
      if (target) {
        const prevRow = room.exits?.leftRow ?? (room.rows - 3);
        const targetRow = target.exits?.rightRow ?? (target.rows - 3);
        const minY = Math.max(2, targetRow - 5) * TILE_SIZE + 2;
        const maxY = targetRow * TILE_SIZE - p.h - 1;
        p.x = target.cols * TILE_SIZE - p.w - 4;
        p.y = Math.max(minY, Math.min(maxY, targetRow * TILE_SIZE + (p.y - prevRow * TILE_SIZE)));
        this.enterRoom(target.id, true, { dx: -1, dy: 0 });
        this.ensurePlayerClear();
        target.spawnX = p.x;
        target.spawnY = p.y;
        this.snapCamera();
      } else {
        p.x = 2;
      }
    } else if (p.x + p.w * 0.5 > roomW) {
      const target = findStage(gx + 1, gy);
      if (target) {
        const prevRow = room.exits?.rightRow ?? (room.rows - 3);
        const targetRow = target.exits?.leftRow ?? (target.rows - 3);
        const minY = Math.max(2, targetRow - 5) * TILE_SIZE + 2;
        const maxY = targetRow * TILE_SIZE - p.h - 1;
        p.x = 4;
        p.y = Math.max(minY, Math.min(maxY, targetRow * TILE_SIZE + (p.y - prevRow * TILE_SIZE)));
        this.enterRoom(target.id, true, { dx: 1, dy: 0 });
        this.ensurePlayerClear();
        target.spawnX = p.x;
        target.spawnY = p.y;
        this.snapCamera();
      } else {
        p.x = roomW - p.w - 2;
      }
    } else if (p.y + p.h * 0.5 < 0) {
      const target = findStage(gx, gy - 1);
      if (target) {
        const prevCol = room.exits?.upCol ?? Math.floor(room.cols / 2);
        const targetCol = target.exits?.downCol ?? Math.floor(target.cols / 2);
        const c0 = Math.max(6, Math.min(target.cols - 10, targetCol - 3));
        p.y = target.rows * TILE_SIZE - p.h - 10;
        p.x = Math.max(c0 * TILE_SIZE + 2, Math.min((c0 + 6) * TILE_SIZE - p.w - 2, targetCol * TILE_SIZE + (p.x - prevCol * TILE_SIZE)));
        p.vy = Math.min(p.vy, -120);
        this.enterRoom(target.id, true, { dx: 0, dy: -1 });
        this.ensurePlayerClear();
        target.spawnX = p.x;
        target.spawnY = p.y;
        this.snapCamera();
      } else {
        p.y = 2;
      }
    } else if (p.y > roomH + 4) {
      const target = findStage(gx, gy + 1);
      if (target) {
        const prevCol = room.exits?.downCol ?? Math.floor(room.cols / 2);
        const targetCol = target.exits?.upCol ?? Math.floor(target.cols / 2);
        const c0 = Math.max(6, Math.min(target.cols - 10, targetCol - 3));
        p.y = 8;
        p.x = Math.max(c0 * TILE_SIZE + 2, Math.min((c0 + 6) * TILE_SIZE - p.w - 2, targetCol * TILE_SIZE + (p.x - prevCol * TILE_SIZE)));
        this.enterRoom(target.id, true, { dx: 0, dy: 1 });
        this.ensurePlayerClear();
        target.spawnX = p.x;
        target.spawnY = p.y;
        this.snapCamera();
      } else {
        this.killPlayer();
      }
    }
  }

  private stepEntities(simDt: number, input: InputState): void {
    const p = this.player;
    const modeEnemyMult = this.playMode === 'mirror_void' ? 1.25 : 1;
    const stasisMult = p.stasisTimer && p.stasisTimer > 0 ? 0.22 : 1;
    const heroDef = getHeroDef(this.heroId);
    const enemyDt = (p.chronoTimer > 0 ? simDt * 0.35 : simDt) * modeEnemyMult * stasisMult;

    if (this.jetFuel > 0) {
      if (input.jumpHeld && !p.onGround && !p.dead) {
        this.jetFuel = Math.max(0, this.jetFuel - simDt);
        p.vy = Math.max(-135, p.vy - 720 * simDt * p.gravityDir);
        if (Math.random() < 0.6) this.burstParticles(p.x + p.w / 2, p.y + p.h, 1, Math.random() < 0.5 ? '#ff9d5c' : '#ffe066', 30);
      } else if (p.onGround) {
        this.jetFuel = Math.max(0, this.jetFuel - simDt * 0.25);
      }
    }

    for (const e of this.liveEntities) {
      if (e.flash > 0) e.flash = Math.max(0, e.flash - simDt);
      if (e.cooldown > 0) e.cooldown = Math.max(0, e.cooldown - enemyDt);
      if (e.hitInvulnTimer && e.hitInvulnTimer > 0) {
        e.hitInvulnTimer = Math.max(0, e.hitInvulnTimer - simDt);
      }
      if (e.immunePopCd && e.immunePopCd > 0) {
        e.immunePopCd = Math.max(0, e.immunePopCd - simDt);
      }
      if (e.elementTimer && e.elementTimer > 0) {
        e.elementTimer = Math.max(0, e.elementTimer - simDt);
        if (e.elementTimer === 0) e.elementMark = null;
      }

      if (e.state === 'dead') {
        e.koTimer += simDt;
        e.y += 60 * simDt;
        continue;
      }

      const kind = e.def.kind;

      // ---- New mechanics: per-frame behaviour ----
      if (kind === 'pulse_fan') {
        e.timer += simDt;
        const on = e.timer % 3 < 1.6;
        e.state = on ? 'active' : 'idle';
      }
      if (kind === 'cannon_barrel' && e.state === 'active') {
        e.timer -= simDt;
        p.x = e.x + e.w / 2 - p.w / 2;
        p.y = e.y + e.h / 2 - p.h / 2;
        p.vx = 0;
        p.vy = 0;
        if (e.timer <= 0) {
          const dir = e.def.dir ?? 1;
          p.vx = dir * 250;
          p.vy = -150 * p.gravityDir;
          p.dashes = Math.max(p.dashes, p.maxDashes);
          p.stamina = p.maxStamina;
          p.invulnTimer = Math.max(p.invulnTimer, 0.15);
          e.state = 'idle';
          e.cooldown = 0.8;
          e.flash = 0.25;
          this.trauma = Math.min(1, this.trauma + 0.35);
          this.spawnShockwave(e.x + 7, e.y + 7, 26, '#ffb347', 0.28);
          this.burstParticles(e.x + 7 + dir * 6, e.y + 4, 16, '#ffcf6b', 110);
          gameAudio.playSpring();
        }
        continue;
      }

      // Magnetic pull on Astral Coins, Heal Orbs & Crown Shards (Blessings + Runes + Boons + Talismans + Spirit)!
      if ((kind === 'astral_coin' || kind === 'boss_crown_shard' || kind === 'heal_orb') && !e.collected) {
        const runeB = computeRuneBonuses(this.equippedRunes);
        const boonB = computeBoonBonuses(this.activeBoons);
        const spDef = this.equippedSpirit !== 'none' ? (SPIRIT_MAP[this.equippedSpirit] ?? DETAILED_PET_MAP[this.equippedSpirit]) : null;
        const talMag = this.equippedTalisman === 'pedra_filosofal' ? 42 : 0;
        const magRadius = 22 + this.blessings.magnetLv * 24 + runeB.magnetRange + boonB.magnetRange + talMag + (spDef?.collectRange ?? 0);
        const dx = p.x + 4 - (e.x + e.w * 0.5);
        const dy = p.y + 5 - (e.y + e.h * 0.5);
        const dist = Math.hypot(dx, dy);
        if (dist > 0.1 && dist < magRadius) {
          const pull = (135 + this.blessings.magnetLv * 55 + runeB.magnetRange + boonB.magnetRange * 0.5) * simDt;
          e.x += (dx / dist) * pull;
          e.y += (dy / dist) * pull;
        }
      }

      // Winged relic flying away
      if (kind === 'winged_relic' && e.state === 'active') {
        e.y -= 75 * simDt;
        e.x += Math.sin(e.timer * 8) * 20 * simDt;
        e.timer += simDt;
        continue;
      }

      // Zip Block
      if (kind === 'zip_block') {
        const tx = e.def.tx ?? e.homeX + 80;
        const ty = e.def.ty ?? e.homeY;
        const playerRiding =
          Math.abs(p.y + p.h - e.y) <= 2 && p.x + p.w > e.x && p.x < e.x + e.w;
        if (e.state === 'idle' && playerRiding) {
          e.state = 'active';
          e.timer = 0;
          this.unlockMechanic('ZIP_BLOCK');
          gameAudio.playSpring();
        } else if (e.state === 'active') {
          e.timer = Math.min(1, e.timer + simDt * 2.2);
          const prevX = e.x;
          const prevY = e.y;
          e.x = e.homeX + (tx - e.homeX) * (e.timer * e.timer);
          e.y = e.homeY + (ty - e.homeY) * (e.timer * e.timer);
          if (playerRiding) {
            p.x += e.x - prevX;
            p.y += e.y - prevY;
          }
          if (e.timer >= 1) {
            e.state = 'return';
            e.timer = 1;
          }
        } else if (e.state === 'return') {
          e.timer = Math.max(0, e.timer - simDt * 0.65);
          e.x = e.homeX + (tx - e.homeX) * e.timer;
          e.y = e.homeY + (ty - e.homeY) * e.timer;
          if (e.timer <= 0) e.state = 'idle';
        }
        continue;
      }

      // Falling Icicle
      if (kind === 'falling_icicle') {
        if (e.state === 'idle' && Math.abs(p.x - e.x) < 18 && p.y > e.y) {
          e.state = 'windup';
          e.timer = 0.35;
          this.unlockMechanic('FALLING_ICICLE');
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) e.state = 'active';
        } else if (e.state === 'active') {
          e.vy += 320 * enemyDt;
          e.y += e.vy * enemyDt;
          if (e.y > this.currentRoom.rows * TILE_SIZE) {
            e.state = 'idle';
            e.y = e.homeY;
            e.vy = 0;
          }
        }
      }

      // Steam Geyser
      if (kind === 'steam_geyser') {
        e.timer += enemyDt;
        const cyc = e.timer % 2.8;
        if (cyc < 1.5) e.state = 'idle';
        else if (cyc < 2.0) e.state = 'windup';
        else {
          e.state = 'active';
          this.unlockMechanic('STEAM_GEYSER');
        }
      }

      // Lightning Zone
      if (kind === 'lightning_zone') {
        e.timer += enemyDt;
        const cyc = e.timer % 3.4;
        if (cyc < 2.0) e.state = 'idle';
        else if (cyc < 2.75) e.state = 'windup';
        else {
          e.state = 'active';
          this.unlockMechanic('LIGHTNING_ZONE');
        }
      }

      // Enemy Behaviors!
      if (kind === 'enemy_crawler') {
        const dist = e.def.patrolDist ?? 36;
        e.x += e.dir * 26 * enemyDt;
        if (e.x > e.homeX + dist) e.dir = -1;
        if (e.x < e.homeX - dist * 0.25) e.dir = 1;
      } else if (kind === 'enemy_wisp') {
        e.timer += enemyDt * 2.2;
        const rad = e.def.patrolDist ?? 20;
        e.x = e.homeX + Math.cos(e.timer) * rad;
        e.y = e.homeY + Math.sin(e.timer * 2) * (rad * 0.45);
      } else if (kind === 'enemy_saw') {
        e.timer += enemyDt * 1.8;
        const rad = e.def.patrolDist ?? 48;
        e.x = e.homeX + Math.sin(e.timer) * rad;
      } else if (kind === 'enemy_drone') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2) * 5;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 150) {
          e.state = 'windup';
          e.timer = 0.6;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            const dx = p.x + 4 - (e.x + 6);
            const dy = p.y + 5 - (e.y + 6);
            const len = Math.hypot(dx, dy) || 1;
            this.spawnProjectile(e.x + 6, e.y + 6, (dx / len) * 115, (dy / len) * 115, '#ff5577', 0, false);
            this.unlockMechanic('ENEMY_DRONE');
            e.state = 'idle';
            e.cooldown = 2.0;
          }
        }
      } else if (kind === 'enemy_mortar') {
        e.timer += enemyDt;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 160) {
          e.state = 'windup';
          e.timer = 0.5;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            const dirToP = p.x < e.x ? -1 : 1;
            this.spawnProjectile(e.x + 6, e.y, dirToP * 58, -125, '#8aff80', 180, false);
            this.unlockMechanic('ENEMY_MORTAR');
            e.state = 'idle';
            e.cooldown = 2.2;
          }
        }
      } else if (kind === 'enemy_charger') {
        if (e.state === 'idle' && e.cooldown <= 0 && Math.abs(p.y - e.y) < 20 && Math.abs(p.x - e.x) < 100) {
          e.dir = p.x < e.x ? -1 : 1;
          e.state = 'windup';
          e.timer = 0.45;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.timer = 0.55;
            this.unlockMechanic('ENEMY_CHARGER');
          }
        } else if (e.state === 'active') {
          e.x += e.dir * 115 * enemyDt;
          e.timer -= enemyDt;
          if (e.timer <= 0 || Math.abs(e.x - e.homeX) > 48) {
            e.state = 'return';
            e.cooldown = 1.1;
          }
        } else if (e.state === 'return') {
          e.x += Math.sign(e.homeX - e.x) * 35 * enemyDt;
          if (Math.abs(e.x - e.homeX) < 3) e.state = 'idle';
        }
      } else if (kind === 'enemy_mimic') {
        if (e.state === 'idle' && Math.hypot(p.x - e.x, p.y - e.y) < 44) {
          e.state = 'windup';
          e.timer = 0.3;
          this.unlockMechanic('ENEMY_MIMIC');
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            const len = Math.hypot(dx, dy) || 1;
            e.vx = (dx / len) * 95;
            e.vy = (dy / len) * 95;
            e.timer = 0.6;
          }
        } else if (e.state === 'active') {
          e.x += e.vx * enemyDt;
          e.y += e.vy * enemyDt;
          e.timer -= enemyDt;
          if (e.timer <= 0) e.state = 'return';
        } else if (e.state === 'return') {
          e.x += (e.homeX - e.x) * 2 * enemyDt;
          e.y += (e.homeY - e.y) * 2 * enemyDt;
          if (Math.hypot(e.homeX - e.x, e.homeY - e.y) < 3) e.state = 'idle';
        }
      } else if (kind === 'enemy_golem') {
        const dist = e.def.patrolDist ?? 30;
        e.x += e.dir * 18 * enemyDt;
        if (e.x > e.homeX + dist) e.dir = -1;
        if (e.x < e.homeX - dist) e.dir = 1;
      } else if (kind === 'enemy_phantom') {
        e.timer += enemyDt;
        e.y += Math.sin(e.timer * 3) * 8 * enemyDt;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 128) {
          e.state = 'windup';
          e.timer = 0.52;
          const roomMaxX = (this.currentRoom.cols - 3) * TILE_SIZE;
          const targetX = Math.max(16, Math.min(roomMaxX, p.x - p.facing * 28));
          const targetY = Math.max(20, Math.min((this.currentRoom.rows - 4) * TILE_SIZE, p.y - 12));
          e.vx = targetX;
          e.vy = targetY;
          e.dir = p.x < e.x ? -1 : 1;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.burstParticles(e.x + 6, e.y + 6, 8, '#c4b5fd', 55);
            e.x = e.vx;
            e.y = e.vy;
            e.dir = p.x < e.x ? -1 : 1;
            this.spawnShockwave(e.x + 6, e.y + 6, 18, '#52e5ff', 0.22);
            const dx = p.x + 4 - (e.x + 6);
            const dy = p.y + 5 - (e.y + 6);
            const len = Math.hypot(dx, dy) || 1;
            this.spawnProjectile(e.x + 6, e.y + 6, (dx / len) * 105, (dy / len) * 105, '#c4b5fd', 0, false);
            e.state = 'idle';
            e.cooldown = 2.2;
          }
        }
      } else if (kind === 'enemy_slime_king') {
        if (e.state === 'idle') {
          if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 120) {
            e.dir = p.x < e.x ? -1 : 1;
            e.state = 'windup';
            e.timer = 0.42;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.vx = e.dir * 64;
            e.vy = -148;
          }
        } else if (e.state === 'active') {
          e.vy += 320 * enemyDt;
          e.x += e.vx * enemyDt;
          e.y += e.vy * enemyDt;
          const roomMaxX = (this.currentRoom.cols - 3) * TILE_SIZE;
          e.x = Math.max(16, Math.min(roomMaxX, e.x));
          if (e.y >= e.homeY) {
            e.y = e.homeY;
            e.vx = 0;
            e.vy = 0;
            e.state = 'idle';
            e.cooldown = 1.45;
            this.spawnProjectile(e.x + 6, e.y + 4, -55, -85, '#2dd4bf', 180, false);
            this.spawnProjectile(e.x + 6, e.y + 4, 55, -85, '#2dd4bf', 180, false);
            this.burstParticles(e.x + 6, e.y + 8, 8, '#a7f3d0', 50);
          }
        }
      } else if (kind === 'enemy_laser_eye') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.2) * 3;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 155) {
          e.dir = p.x < e.x ? -1 : 1;
          const dx = p.x + 4 - (e.x + 6);
          const dy = p.y + 5 - (e.y + 6);
          const len = Math.hypot(dx, dy) || 1;
          e.vx = dx / len;
          e.vy = dy / len;
          e.state = 'windup';
          e.timer = 0.65;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnProjectile(e.x + 6, e.y + 6, e.vx * 195, e.vy * 195, '#ff2e63', 0, false);
            this.spawnShockwave(e.x + 6, e.y + 6, 16, '#ffe066', 0.18);
            e.state = 'idle';
            e.cooldown = 2.4;
          }
        }
      } else if (kind === 'enemy_spark_beetle') {
        if (e.state === 'idle') {
          const dist = e.def.patrolDist ?? 28;
          e.x += e.dir * 52 * enemyDt;
          if (e.x > e.homeX + dist) e.dir = -1;
          if (e.x < e.homeX - dist) e.dir = 1;
          if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 92) {
            e.state = 'windup';
            e.timer = 0.48;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnProjectile(e.x + 6, e.y + 5, -110, 0, '#38bdf8', 0, false);
            this.spawnProjectile(e.x + 6, e.y + 5, 110, 0, '#38bdf8', 0, false);
            this.spawnShockwave(e.x + 6, e.y + 5, 20, '#fde047', 0.2);
            e.state = 'idle';
            e.cooldown = 2.1;
          }
        }
      } else if (kind === 'enemy_magma_wyrm') {
        if (e.state === 'idle') {
          if (e.cooldown <= 0 && Math.abs(p.x - e.x) < 62) {
            e.state = 'windup';
            e.timer = 0.55;
            e.dir = p.x < e.x ? -1 : 1;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.vy = -180;
            this.burstParticles(e.x + 6, e.homeY, 10, '#fb923c', 75);
          }
        } else if (e.state === 'active') {
          const prevVy = e.vy;
          e.vy += 265 * enemyDt;
          e.y += e.vy * enemyDt;
          if (prevVy < 0 && e.vy >= 0) {
            this.spawnProjectile(e.x + 6, e.y + 4, -52, -40, '#fb923c', 190, false);
            this.spawnProjectile(e.x + 6, e.y + 4, 52, -40, '#fb923c', 190, false);
          }
          if (e.y >= e.homeY) {
            e.y = e.homeY;
            e.vy = 0;
            e.state = 'idle';
            e.cooldown = 1.65;
          }
        }
      } else if (kind === 'enemy_sand_wraith') {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        const slowFactor = heroDef.modifiers.slowField && dist < 82 ? 0.72 : 1;
        e.timer += enemyDt * slowFactor;
        e.x = e.homeX + Math.sin(e.timer * 2.1) * (e.def.patrolDist ?? 26);
        e.y = e.homeY + Math.cos(e.timer * 3.4) * 9;
        if (e.state === 'idle' && e.cooldown <= 0 && dist < 130) {
          e.state = 'windup';
          e.timer = 0.48;
          this.unlockMechanic('ENEMY_ELITE_NEW');
        } else if (e.state === 'windup') {
          e.timer -= enemyDt * slowFactor;
          if (e.timer <= 0) {
            const dx = p.x + 4 - (e.x + 6);
            const dy = p.y + 5 - (e.y + 6);
            const len = Math.hypot(dx, dy) || 1;
            const ang = Math.atan2(dy, dx);
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang - 0.18) * 112, Math.sin(ang - 0.18) * 112, '#fbbf24', 0, false);
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang + 0.18) * 112, Math.sin(ang + 0.18) * 112, '#fb923c', 0, false);
            e.dir = dx < 0 ? -1 : 1;
            e.state = 'idle';
            e.cooldown = 2.2;
          }
        }
      } else if (kind === 'enemy_bone_knight') {
        const dist = e.def.patrolDist ?? 26;
        const slowFactor = heroDef.modifiers.slowField && Math.hypot(p.x - e.x, p.y - e.y) < 82 ? 0.72 : 1;
        e.x += e.dir * 32 * enemyDt * slowFactor;
        if (e.x > e.homeX + dist) e.dir = -1;
        if (e.x < e.homeX - dist) e.dir = 1;
        if (e.cooldown <= 0 && Math.abs(p.y - e.y) < 26 && Math.abs(p.x - e.x) < 88) {
          this.unlockMechanic('ENEMY_ELITE_NEW');
          const dToP = p.x < e.x ? -1 : 1;
          this.spawnProjectile(e.x + 6, e.y + 4, dToP * 118, -32, '#d8b4fe', 95, false);
          e.cooldown = 2.3;
        }
      } else if (kind === 'enemy_alchemist') {
        e.timer += enemyDt;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 150) {
          e.state = 'windup';
          e.timer = 0.52;
          this.unlockMechanic('ENEMY_ELITE_NEW');
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            const vx = e.dir * 72;
            this.spawnProjectile(e.x + 6, e.y + 2, vx, -138, '#2dd4bf', 195, false);
            this.spawnProjectile(e.x + 6, e.y + 2, vx * 0.65, -110, '#f43f5e', 180, false);
            e.state = 'idle';
            e.cooldown = 2.1;
          }
        }
      } else if (kind === 'enemy_frost_valkyrie') {
        e.timer += enemyDt;
        const rad = e.def.patrolDist ?? 28;
        e.x = e.homeX + Math.sin(e.timer * 1.9) * rad;
        e.y = e.homeY + Math.cos(e.timer * 3.1) * 10;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 145) {
          e.state = 'windup';
          e.timer = 0.45;
          this.unlockMechanic('ENEMY_ELITE_NEW');
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            const dx = p.x + 4 - (e.x + 6);
            const dy = p.y + 5 - (e.y + 6);
            const ang = Math.atan2(dy, dx);
            for (let k = -1; k <= 1; k++) {
              this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang + k * 0.24) * 124, Math.sin(ang + k * 0.24) * 124, '#67e8f9', 0, false);
            }
            e.state = 'idle';
            e.cooldown = 2.25;
          }
        }
      } else if (kind === 'enemy_mirror_orb') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.8) * 6;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 140) {
          this.unlockMechanic('ENEMY_ELITE_NEW');
          const offset = (e.attackIdx ?? 0) % 2 === 0 ? 0 : Math.PI / 4;
          e.attackIdx = (e.attackIdx ?? 0) + 1;
          for (let k = 0; k < 4; k++) {
            const a = offset + (Math.PI * 2 * k) / 4;
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 96, Math.sin(a) * 96, '#e879f9', 0, false);
          }
          e.cooldown = 2.15;
        }
      } else if (kind === 'enemy_rift_stalker') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 130) {
          e.state = 'windup';
          e.timer = 0.55;
          e.aimX = Math.max(24, Math.min(this.currentRoom.cols * TILE_SIZE - 36, p.x + (p.x > e.x ? -28 : 28)));
          e.aimY = Math.max(20, p.y - 6);
          this.spawnShockwave(e.aimX + 6, e.aimY + 6, 16, '#c084fc', 0.45);
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.burstParticles(e.x + 6, e.y + 6, 8, '#c084fc', 65);
            e.x = e.aimX ?? e.x;
            e.y = e.aimY ?? e.y;
            this.spawnShockwave(e.x + 6, e.y + 6, 20, '#e879f9', 0.25);
            const dx = p.x + 4 - (e.x + 6);
            const dy = p.y + 5 - (e.y + 6);
            const len = Math.hypot(dx, dy) || 1;
            this.spawnProjectile(e.x + 6, e.y + 6, (dx / len) * 118, (dy / len) * 118, '#c084fc', 0, false);
            e.state = 'idle';
            e.cooldown = 2.5;
          }
        }
      } else if (kind === 'enemy_cryo_turret') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 145) {
          e.state = 'windup';
          e.timer = 0.48;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            for (let k = 0; k < 6; k++) {
              const a = (Math.PI * 2 * k) / 6 + (e.attackIdx ?? 0) * 0.35;
              this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 92, Math.sin(a) * 92, '#7ce8ff', 0, false);
            }
            e.attackIdx = ((e.attackIdx ?? 0) + 1) % 2;
            e.state = 'idle';
            e.cooldown = 2.3;
          }
        }
      } else if (kind === 'enemy_chrono_weaver') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.4) * 7;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 138) {
          const dx = p.x + 4 - (e.x + 6);
          const dy = p.y + 5 - (e.y + 6);
          const len = Math.hypot(dx, dy) || 1;
          this.spawnProjectile(e.x + 6, e.y + 6, (dx / len) * 105, (dy / len) * 105, '#fbbf24', 0, true);
          this.spawnShockwave(e.x + 6, e.y + 6, 18, '#fbbf24', 0.22);
          e.cooldown = 2.45;
        }
      } else if (kind === 'enemy_void_leech') {
        const dx = p.x + 4 - (e.x + 6);
        const dy = p.y + 5 - (e.y + 6);
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 118) {
          e.x += (dx / dist) * 38 * enemyDt;
          e.y += (dy / dist) * 32 * enemyDt;
          e.dir = dx < 0 ? -1 : 1;
          if (e.cooldown <= 0) {
            this.spawnProjectile(e.x + 6, e.y + 6, (dx / dist) * 96, (dy / dist) * 96, '#a855f7', 0, false);
            e.cooldown = 2.0;
          }
        }
      } else if (kind === 'enemy_shield_phalanx') {
        const dist = e.def.patrolDist ?? 26;
        e.x += e.dir * 30 * enemyDt;
        if (e.x > e.homeX + dist) e.dir = -1;
        if (e.x < e.homeX - dist) e.dir = 1;
        if (e.cooldown <= 0 && Math.abs(p.y - e.y) < 20 && Math.abs(p.x - e.x) < 76) {
          e.dir = p.x < e.x ? -1 : 1;
          this.spawnProjectile(e.x + 6, e.y + 5, e.dir * 124, 0, '#94a3b8', 0, false);
          e.cooldown = 2.2;
        }
      } else if (kind === 'enemy_chain_tesla') {
        e.timer += enemyDt;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 135) {
          e.state = 'windup';
          e.timer = 0.5;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (const [vx, vy] of dirs) {
              this.spawnProjectile(e.x + 6, e.y + 6, vx * 112, vy * 112, '#38bdf8', 0, false);
            }
            this.spawnShockwave(e.x + 6, e.y + 6, 20, '#38bdf8', 0.22);
            e.state = 'idle';
            e.cooldown = 2.1;
          }
        }
      } else if (kind === 'enemy_spore_splitter') {
        e.vy += 280 * enemyDt;
        e.x += e.dir * 34 * enemyDt;
        e.y += e.vy * enemyDt;
        const dist = e.def.patrolDist ?? 24;
        if (e.x > e.homeX + dist) e.dir = -1;
        if (e.x < e.homeX - dist) e.dir = 1;
        if (e.y >= e.homeY) {
          e.y = e.homeY;
          e.vy = e.cooldown <= 0 ? -125 : 0;
          if (e.cooldown <= 0) e.cooldown = 1.4;
        }
      } else if (kind === 'enemy_magma_slug') {
        const dist = e.def.patrolDist ?? 28;
        e.x += e.dir * 26 * enemyDt;
        if (e.x > e.homeX + dist) e.dir = -1;
        if (e.x < e.homeX - dist) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 120) {
          this.spawnProjectile(e.x + 6, e.y + 2, (Math.random() - 0.5) * 48, -130, '#f97316', 210, false);
          e.cooldown = 1.85;
        }
      } else if (kind === 'enemy_prism_cherub') {
        e.timer += enemyDt;
        e.x = e.homeX + Math.sin(e.timer * 2.2) * (e.def.patrolDist ?? 22);
        e.y = e.homeY + Math.cos(e.timer * 3.0) * 8;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 140) {
          const ang = Math.atan2(p.y + 5 - (e.y + 6), p.x + 4 - (e.x + 6));
          for (let k = -1; k <= 1; k++) {
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang + k * 0.25) * 116, Math.sin(ang + k * 0.25) * 116, k === 0 ? '#f472b6' : '#52e5ff', 0, false);
          }
          e.cooldown = 2.15;
        }
      } else if (kind === 'enemy_gravity_imp') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.6) * 8;
        const dx = (e.x + 6) - (p.x + 4);
        const dy = (e.y + 6) - (p.y + 5);
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 64 && p.dashTimer <= 0) {
          p.vx += (dx / dist) * 42 * enemyDt;
        }
        if (e.cooldown <= 0 && dist < 125) {
          this.spawnProjectile(e.x + 6, e.y + 6, (-dx / dist) * 95, (-dy / dist) * 95, '#818cf8', 0, false);
          e.cooldown = 2.3;
        }
      } else if (kind === 'enemy_blade_dancer') {
        const patrol = e.def.patrolDist ?? 30;
        if (e.state === 'idle') {
          e.x += e.dir * 42 * enemyDt;
          if (e.x > e.homeX + patrol) e.dir = -1;
          if (e.x < e.homeX - patrol) e.dir = 1;
          if (e.cooldown <= 0 && Math.abs(p.y - e.y) < 18 && Math.abs(p.x - e.x) < 76) {
            e.state = 'windup';
            e.dir = p.x < e.x ? -1 : 1;
            e.timer = 0.36;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.timer = 0.28;
          }
        } else if (e.state === 'active') {
          e.x += e.dir * 168 * enemyDt;
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'idle';
            e.cooldown = 1.9;
          }
        }
      } else if (kind === 'enemy_ember_phoenix') {
        e.timer += enemyDt;
        const rad = e.def.patrolDist ?? 26;
        e.x = e.homeX + Math.sin(e.timer * 2.5) * rad;
        e.y = e.homeY + Math.abs(Math.sin(e.timer * 2.5)) * 14 - 7;
        e.dir = Math.cos(e.timer * 2.5) >= 0 ? 1 : -1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 130) {
          this.spawnProjectile(e.x + 6, e.y + 8, -42, 48, '#fb923c', 90, false);
          this.spawnProjectile(e.x + 6, e.y + 8, 42, 48, '#fde047', 90, false);
          e.cooldown = 1.95;
        }
      } else if (kind === 'enemy_anchor_brute') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 110) {
          e.state = 'windup';
          e.timer = 0.52;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnShockwave(e.x + 6, e.y + 11, 24, '#22d3ee', 0.25);
            this.spawnProjectile(e.x + 6, e.y + 9, -118, 0, '#22d3ee', 0, false);
            this.spawnProjectile(e.x + 6, e.y + 9, 118, 0, '#22d3ee', 0, false);
            e.state = 'idle';
            e.cooldown = 2.4;
          }
        }
      } else if (kind === 'enemy_echo_assassin') {
        const patrol = e.def.patrolDist ?? 26;
        if (e.state === 'idle') {
          e.x += e.dir * 38 * enemyDt;
          if (e.x > e.homeX + patrol) e.dir = -1;
          if (e.x < e.homeX - patrol) e.dir = 1;
          if (e.cooldown <= 0 && Math.abs(p.y - e.y) < 22 && Math.abs(p.x - e.x) < 90) {
            e.state = 'windup';
            e.dir = p.x < e.x ? -1 : 1;
            e.timer = 0.34;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.x = Math.max(20, Math.min(this.currentRoom.cols * TILE_SIZE - 32, e.x + e.dir * 42));
            this.spawnProjectile(e.x + 6, e.y + 5, e.dir * 135, 0, '#e879f9', 0, false);
            e.state = 'idle';
            e.cooldown = 2.2;
          }
        }
      } else if (kind === 'enemy_magnet_core') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.2) * 5;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 120) {
          const pushSign = (e.attackIdx ?? 0) % 2 === 0 ? -1 : 1;
          e.attackIdx = (e.attackIdx ?? 0) + 1;
          const dx = p.x + 4 - (e.x + 6);
          const dy = p.y + 5 - (e.y + 6);
          const dist = Math.hypot(dx, dy) || 1;
          if (dist < 72 && p.dashTimer <= 0) {
            p.vx += (dx / dist) * pushSign * 78;
          }
          this.spawnShockwave(e.x + 6, e.y + 6, 24, '#60a5fa', 0.25);
          this.spawnProjectile(e.x + 6, e.y + 6, (dx / dist) * 102, (dy / dist) * 102, '#60a5fa', 0, false);
          e.cooldown = 2.35;
        }
      } else if (kind === 'enemy_amber_wasp') {
        e.timer += enemyDt;
        e.x = e.homeX + Math.sin(e.timer * 3.1) * (e.def.patrolDist ?? 24);
        e.y = e.homeY + Math.cos(e.timer * 5.2) * 8;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 125) {
          const dx = p.x + 4 - (e.x + 6);
          const dy = p.y + 5 - (e.y + 6);
          const len = Math.hypot(dx, dy) || 1;
          this.spawnProjectile(e.x + 6, e.y + 6, (dx / len) * 124, (dy / len) * 124, '#f59e0b', 0, false);
          e.cooldown = 1.95;
        }
      } else if (kind === 'enemy_rune_monolith') {
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 130) {
          e.state = 'windup';
          e.timer = 0.55;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnShockwave(e.x + 6, e.y + 6, 30, '#34d399', 0.3);
            for (let k = 0; k < 6; k++) {
              const a = (Math.PI * 2 * k) / 6;
              this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 88, Math.sin(a) * 88, '#34d399', 0, false);
            }
            e.state = 'idle';
            e.cooldown = 2.5;
          }
        }
      } else if (kind === 'enemy_tidal_jelly') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.0) * 10;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 125) {
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI * 2 * k) / 6 + 0.25;
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 84, Math.sin(a) * 84, '#2dd4bf', 0, false);
          }
          e.cooldown = 2.35;
        }
      } else if (kind === 'enemy_clock_spider') {
        const patrol = e.def.patrolDist ?? 30;
        e.x += e.dir * 52 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 120) {
          const dToP = p.x < e.x ? -1 : 1;
          this.spawnProjectile(e.x + 6, e.y + 4, dToP * 92, -88, '#eab308', 180, false);
          e.cooldown = 1.9;
        }
      } else if (kind === 'enemy_solar_acolyte') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 150) {
          e.state = 'windup';
          e.timer = 0.62;
          const bx = Math.max(28, Math.min(this.currentRoom.cols * TILE_SIZE - 28, p.x + 4));
          this.spawnHazardBeam(bx, 16, bx, this.currentRoom.rows * TILE_SIZE - 16, 9, '#fde047', 0.65, 0.35);
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'idle';
            e.cooldown = 2.6;
          }
        }
      } else if (kind === 'enemy_shadow_hook') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 148) {
          const dx = p.x + 4 - (e.x + 6);
          const dy = p.y + 5 - (e.y + 6);
          const len = Math.hypot(dx, dy) || 1;
          this.spawnProjectile(e.x + 6, e.y + 6, (dx / len) * 145, (dy / len) * 145, '#f43f5e', 0, true);
          e.cooldown = 2.4;
        }
      } else if (kind === 'enemy_crystal_gargoyle') {
        e.timer += enemyDt;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 130) {
          e.state = 'windup';
          e.timer = 0.55;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            const ang = Math.atan2(p.y + 5 - (e.y + 6), p.x + 4 - (e.x + 6));
            for (let k = -1; k <= 1; k++) {
              this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang + k * 0.28) * 108, Math.sin(ang + k * 0.28) * 108, '#93c5fd', 0, false);
            }
            e.state = 'idle';
            e.cooldown = 2.3;
          }
        }
      } else if (kind === 'enemy_star_bomber') {
        const patrol = e.def.patrolDist ?? 34;
        e.x += e.dir * 38 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.abs(p.x - e.x) < 92) {
          this.spawnProjectile(e.x + 6, e.y + 10, (Math.random() - 0.5) * 26, 20, '#a5b4fc', 140, false);
          e.cooldown = 1.7;
        }
      } else if (kind === 'enemy_abyss_knight') {
        const patrol = e.def.patrolDist ?? 28;
        e.x += e.dir * 36 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 135) {
          const ang = Math.atan2(p.y + 5 - (e.y + 6), p.x + 4 - (e.x + 6));
          for (let k = -1; k <= 1; k++) {
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang + k * 0.2) * 125, Math.sin(ang + k * 0.2) * 125, '#ff2e63', 0, false);
          }
          this.spawnShockwave(e.x + 6, e.y + 6, 18, '#ff2e63', 0.22);
          e.cooldown = 2.1;
        }
      } else if (kind === 'enemy_bone_pendulum') {
        e.timer += enemyDt;
        const ang = Math.sin(e.timer * 2.5) * 1.15;
        e.x = e.homeX + Math.sin(ang) * 26;
        e.y = e.homeY + Math.cos(ang) * 22;
        e.dir = Math.cos(ang) >= 0 ? 1 : -1;
      } else if (kind === 'enemy_soul_siphon') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.2) * 5;
        e.dir = p.x < e.x ? -1 : 1;
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (dist <= 94) {
          p.stamina = Math.max(0, p.stamina - 16 * enemyDt);
          this.overdrive = Math.max(0, this.overdrive - 8 * enemyDt);
        }
        if (e.cooldown <= 0 && dist < 135) {
          const ang = Math.atan2(p.y + 5 - (e.y + 6), p.x + 4 - (e.x + 6));
          this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang) * 102, Math.sin(ang) * 102, '#a855f7', 0, false);
          e.cooldown = 2.25;
        }
      } else if (kind === 'enemy_ash_stalker') {
        const patrol = e.def.patrolDist ?? 24;
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (e.state === 'idle') {
          e.x += e.dir * 22 * enemyDt;
          if (e.x > e.homeX + patrol) e.dir = -1;
          if (e.x < e.homeX - patrol) e.dir = 1;
          if (e.cooldown <= 0 && dist < 92 && Math.abs(p.y - e.y) < 28) {
            e.state = 'windup';
            e.dir = p.x < e.x ? -1 : 1;
            e.timer = 0.35;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.timer = 0.28;
            this.burstParticles(e.x + 6, e.y + 6, 8, '#e879f9', 65);
          }
        } else if (e.state === 'active') {
          e.timer -= enemyDt;
          e.x = Math.max(18, Math.min(this.currentRoom.cols * TILE_SIZE - 30, e.x + e.dir * 138 * enemyDt));
          if (e.timer <= 0) {
            e.state = 'idle';
            e.cooldown = 2.0;
          }
        }
      } else if (kind === 'enemy_crimson_bat') {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (e.state === 'idle') {
          e.timer += enemyDt;
          e.x = e.homeX + Math.sin(e.timer * 2.1) * 18;
          e.y = e.homeY + Math.cos(e.timer * 3.0) * 3;
          e.dir = p.x < e.x ? -1 : 1;
          if (e.cooldown <= 0 && dist < 118 && p.y > e.y - 8) {
            e.state = 'windup';
            e.timer = 0.32;
            e.aimX = p.x;
            e.aimY = p.y;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.timer = 0.65;
            const dx = (e.aimX ?? p.x) - e.x;
            const dy = (e.aimY ?? p.y) - e.y;
            const len = Math.hypot(dx, dy) || 1;
            e.vx = (dx / len) * 118;
            e.vy = (dy / len) * 118;
          }
        } else {
          e.timer -= enemyDt;
          e.x += e.vx * enemyDt;
          e.y += e.vy * enemyDt;
          e.vy -= 120 * enemyDt;
          if (e.timer <= 0 || e.y <= e.homeY) {
            e.x = Math.max(20, Math.min(this.currentRoom.cols * TILE_SIZE - 32, e.x));
            e.y = e.homeY;
            e.state = 'idle';
            e.cooldown = 2.1;
          }
        }
      } else if (kind === 'enemy_pyre_acolyte') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 150) {
          e.state = 'windup';
          e.timer = 0.65;
          e.aimX = Math.max(24, Math.min(this.currentRoom.cols * TILE_SIZE - 24, p.x + 4));
          e.aimY = p.y + p.h;
          const bx = e.aimX;
          this.spawnHazardBeam(bx, Math.max(16, e.aimY - 84), bx, Math.min(this.currentRoom.rows * TILE_SIZE - 16, e.aimY + 8), 10, '#fb923c', 0.65, 0.36);
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'idle';
            e.cooldown = 2.55;
          }
        }
      } else if (kind === 'enemy_chain_jailer') {
        const patrol = e.def.patrolDist ?? 24;
        e.x += e.dir * 28 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 142) {
          e.dir = p.x < e.x ? -1 : 1;
          const ang = Math.atan2(p.y + 5 - (e.y + 6), p.x + 4 - (e.x + 6));
          this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang) * 145, Math.sin(ang) * 145, '#f59e0b', 0, false);
          e.cooldown = 2.35;
        }
      } else if (kind === 'enemy_frost_wraith_uw') {
        e.timer += enemyDt;
        e.x = e.homeX + Math.sin(e.timer * 2.0) * 24;
        e.y = e.homeY + Math.sin(e.timer * 4.0) * 7;
        e.dir = Math.cos(e.timer * 2.0) >= 0 ? 1 : -1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 130) {
          this.spawnProjectile(e.x + 6, e.y + 10, 0, 56, '#7ce8ff', 60, false);
          e.cooldown = 1.85;
        }
      } else if (kind === 'enemy_plague_toad') {
        if (e.state === 'idle') {
          e.dir = p.x < e.x ? -1 : 1;
          if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 125) {
            e.state = 'windup';
            e.timer = 0.36;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.timer = 0.58;
            e.vx = e.dir * 52;
            e.vy = -118;
          }
        } else {
          e.timer -= enemyDt;
          e.x = Math.max(18, Math.min(this.currentRoom.cols * TILE_SIZE - 30, e.x + e.vx * enemyDt));
          e.y = Math.min(e.homeY, e.y + e.vy * enemyDt);
          e.vy += 420 * enemyDt;
          if (e.y >= e.homeY || e.timer <= 0) {
            e.y = e.homeY;
            e.vy = 0;
            for (let k = -1; k <= 1; k++) {
              this.spawnProjectile(e.x + 6, e.y + 4, k * 65, -72, '#84cc16', 180, false);
            }
            e.state = 'idle';
            e.cooldown = 2.2;
          }
        }
      } else if (kind === 'enemy_hellhound') {
        const patrol = e.def.patrolDist ?? 26;
        if (e.state === 'idle') {
          e.x += e.dir * 42 * enemyDt;
          if (e.x > e.homeX + patrol) e.dir = -1;
          if (e.x < e.homeX - patrol) e.dir = 1;
          if (e.cooldown <= 0 && Math.abs(p.y - e.y) < 22 && Math.abs(p.x - e.x) < 108) {
            e.state = 'windup';
            e.dir = p.x < e.x ? -1 : 1;
            e.timer = 0.32;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'active';
            e.timer = 0.38;
          }
        } else {
          e.timer -= enemyDt;
          e.x = Math.max(18, Math.min(this.currentRoom.cols * TILE_SIZE - 30, e.x + e.dir * 145 * enemyDt));
          if (Math.random() < 0.4) {
            this.spawnParticle(e.x + 6, e.y + 8, -e.dir * 24, -18, '#fb923c', 0.25, 2, 0);
          }
          if (e.timer <= 0) {
            e.state = 'idle';
            e.cooldown = 2.05;
          }
        }
      } else if (kind === 'enemy_doom_bell') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 1.8) * 3;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 135) {
          e.state = 'windup';
          e.timer = 0.55;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnShockwave(e.x + 6, e.y + 6, 32, '#fbbf24', 0.3);
            for (let k = 0; k < 6; k++) {
              const a = (Math.PI * 2 * k) / 6;
              this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 86, Math.sin(a) * 86, '#fbbf24', 0, false);
            }
            e.state = 'idle';
            e.cooldown = 2.6;
          }
        }
      } else if (kind === 'enemy_magma_tortoise') {
        const patrol = e.def.patrolDist ?? 22;
        e.x += e.dir * 20 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 128) {
          this.spawnProjectile(e.x + 6, e.y, -48, -112, '#ff6622', 200, false);
          this.spawnProjectile(e.x + 6, e.y, 48, -112, '#ff6622', 200, false);
          e.cooldown = 2.4;
        }
      } else if (kind === 'enemy_shadow_mimic') {
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (e.state === 'idle') {
          if (dist < 52) {
            e.state = 'active';
            e.dir = p.x < e.x ? -1 : 1;
            this.spawnShockwave(e.x + 6, e.y + 6, 20, '#c084fc', 0.24);
          }
        } else {
          e.dir = p.x < e.x ? -1 : 1;
          e.x = Math.max(18, Math.min(this.currentRoom.cols * TILE_SIZE - 30, e.x + e.dir * 62 * enemyDt));
          if (e.cooldown <= 0 && dist < 115) {
            this.spawnProjectile(e.x + 6, e.y + 5, e.dir * 116, -20, '#e879f9', 60, false);
            e.cooldown = 1.9;
          }
        }
      } else if (kind === 'enemy_blood_alchemist') {
        const patrol = e.def.patrolDist ?? 24;
        e.x += e.dir * 28 * enemyDt;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 138) {
          e.dir = p.x < e.x ? -1 : 1;
          const vx = (p.x - e.x) * 1.15;
          this.spawnProjectile(e.x + 6, e.y + 2, Math.max(-135, Math.min(135, vx)), -118, '#fb7185', 200, false);
          e.cooldown = 2.15;
        }
      } else if (kind === 'enemy_abyss_gargoyle') {
        e.dir = p.x < e.x ? -1 : 1;
        if (e.state === 'idle' && e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 135) {
          e.state = 'windup';
          e.timer = 0.58;
          e.aimX = p.x + 4;
          e.aimY = p.y + 5;
          const dx = e.aimX - (e.x + 6);
          const dy = e.aimY - (e.y + 6);
          const len = Math.hypot(dx, dy) || 1;
          this.spawnHazardBeam(e.x + 6, e.y + 6, e.x + 6 + (dx / len) * 195, e.y + 6 + (dy / len) * 195, 7, '#ff3864', 0.6, 0.32);
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            e.state = 'idle';
            e.cooldown = 2.65;
          }
        }
      } else if (kind === 'enemy_void_leecher_uw') {
        e.timer += enemyDt;
        e.x = e.homeX + Math.sin(e.timer * 2.4) * 28;
        e.y = e.homeY + Math.sin(e.timer * 4.8) * 11;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 132) {
          const ang = Math.atan2(p.y + 5 - (e.y + 6), p.x + 4 - (e.x + 6));
          this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang - 0.18) * 108, Math.sin(ang - 0.18) * 108, '#c084fc', 0, false);
          this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(ang + 0.18) * 108, Math.sin(ang + 0.18) * 108, '#c084fc', 0, false);
          e.cooldown = 2.15;
        }
      } else if (kind === 'enemy_spectral_executioner') {
        const patrol = e.def.patrolDist ?? 26;
        if (e.state === 'idle') {
          e.x += e.dir * 34 * enemyDt;
          if (e.x > e.homeX + patrol) e.dir = -1;
          if (e.x < e.homeX - patrol) e.dir = 1;
          if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 120) {
            e.state = 'windup';
            e.timer = 0.42;
            e.x = Math.max(20, Math.min(this.currentRoom.cols * TILE_SIZE - 32, p.x - p.facing * 26));
            e.dir = p.x < e.x ? -1 : 1;
            this.burstParticles(e.x + 6, e.y + 6, 10, '#38bdf8', 70);
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnProjectile(e.x + 6, e.y + 5, e.dir * 145, 0, '#38bdf8', 0, false);
            e.state = 'idle';
            e.cooldown = 2.55;
          }
        }
      } else if (kind === 'enemy_soul_lantern') {
        e.timer += enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.5) * 6;
        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (e.state === 'idle' && e.cooldown <= 0 && dist < 44) {
          e.state = 'windup';
          e.timer = 0.55;
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnShockwave(e.x + 6, e.y + 6, 30, '#5eead4', 0.3);
            for (let k = 0; k < 8; k++) {
              const a = (Math.PI * 2 * k) / 8;
              this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 90, Math.sin(a) * 90, '#5eead4', 0, false);
            }
            e.state = 'idle';
            e.cooldown = 2.8;
          }
        }
      } else if (kind === 'enemy_obsidian_golem_uw') {
        const patrol = e.def.patrolDist ?? 20;
        if (e.state === 'idle') {
          e.x += e.dir * 18 * enemyDt;
          if (e.x > e.homeX + patrol) e.dir = -1;
          if (e.x < e.homeX - patrol) e.dir = 1;
          if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 118) {
            e.state = 'windup';
            e.timer = 0.55;
          }
        } else if (e.state === 'windup') {
          e.timer -= enemyDt;
          if (e.timer <= 0) {
            this.spawnShockwave(e.x + 6, e.y + 10, 26, '#a855f7', 0.25);
            this.spawnProjectile(e.x + 6, e.y + 8, -125, 0, '#a855f7', 0, false);
            this.spawnProjectile(e.x + 6, e.y + 8, 125, 0, '#a855f7', 0, false);
            e.state = 'idle';
            e.cooldown = 2.6;
          }
        }
      } else if (kind === 'enemy_fallen_seraph') {
        e.timer += enemyDt;
        e.x = e.homeX + Math.sin(e.timer * 2.2) * (e.def.patrolDist ?? 28);
        e.y = e.homeY + Math.cos(e.timer * 3.6) * 10;
        e.dir = p.x < e.x ? -1 : 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 140) {
          for (let k = 0; k < 4; k++) {
            const a = e.timer + (k * Math.PI) / 2;
            this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 96, Math.sin(a) * 96, '#fde047', 0, false);
          }
          e.cooldown = 2.05;
        }
      } else if (kind === 'enemy_styx_ferryman') {
        const patrol = e.def.patrolDist ?? 30;
        e.timer += enemyDt;
        e.x += e.dir * 32 * enemyDt;
        e.y = e.homeY + Math.sin(e.timer * 2.0) * 3;
        if (e.x > e.homeX + patrol) e.dir = -1;
        if (e.x < e.homeX - patrol) e.dir = 1;
        if (e.cooldown <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < 140) {
          this.spawnProjectile(e.x + 6, e.y + 6, -110, 0, '#2dd4bf', 0, false);
          this.spawnProjectile(e.x + 6, e.y + 6, 110, 0, '#2dd4bf', 0, false);
          e.cooldown = 2.2;
        }
      } else if ((EXCLUSIVE_ENEMY_KINDS as readonly string[]).includes(kind)) {
        stepExclusiveEnemyAI(e, enemyDt, this.currentRoom, this.player, {
          spawnProjectile: (px, py, vx, vy, col, grav, homing) =>
            this.spawnProjectile(px, py, vx, vy, col, grav, homing),
          spawnHazardBeam: (x1, y1, x2, y2, w, col, warm, act) =>
            this.spawnHazardBeam(x1, y1, x2, y2, w, col, warm, act),
          spawnShockwave: (sx, sy, rad, col, life) =>
            this.spawnShockwave(sx, sy, rad, col, life),
          burstParticles: (bx, by, cnt, col, spd) =>
            this.burstParticles(bx, by, cnt, col, spd),
        });
      } else if (kind === 'gravity_vortex') {
        e.timer += simDt;
        const cx = e.x + e.w * 0.5;
        const cy = e.y + e.h * 0.5;
        const dx = cx - (p.x + p.w * 0.5);
        const dy = cy - (p.y + p.h * 0.5);
        const dist = Math.hypot(dx, dy);
        if (dist > 3 && dist < 44 && p.dashTimer <= 0) {
          const pull = (44 - dist) * 5.2;
          p.vx += (dx / dist) * pull * simDt;
          p.vy += (dy / dist) * pull * simDt;
        }
        if (dist < 14 && e.cooldown <= 0 && (input.jumpJustPressed || input.dashJustPressed)) {
          p.vy = -172 * p.gravityDir;
          p.vx = p.facing * 145;
          p.dashes = Math.max(p.dashes, 1);
          p.stamina = p.maxStamina;
          e.cooldown = 0.65;
          this.unlockMechanic('GRAVITY_VORTEX');
          this.spawnShockwave(cx, cy, 26, '#c084fc', 0.25);
          this.burstParticles(cx, cy, 12, '#c084fc', 80);
          gameAudio.playSpring();
        }
      } else if (isBossKind(kind)) {
        this.stepBossEntity(e, enemyDt);
      }

      // Proximity-based [E] interaction for NPCs, Signposts, Shrines, Beacons & Lore Tablets
      if (
        (kind === 'npc' || kind === 'signpost' || kind === 'blessing_shrine' || kind === 'quest_beacon' || kind === 'lore_tablet') &&
        input.interactJustPressed &&
        Math.hypot(p.x + 4 - (e.x + e.w * 0.5), p.y + 5 - (e.y + e.h * 0.5)) < 28
      ) {
        if (kind === 'quest_beacon' && e.state !== 'lit') {
          this.activateQuestBeacon(e);
          continue;
        }
        if (kind === 'lore_tablet' && e.state !== 'lit') {
          this.activateLoreTablet(e);
          continue;
        }
        if (kind === 'blessing_shrine') {
          this.openBlessingsRequested = true;
          this.setPaused(true);
          continue;
        }
        if (kind === 'signpost' && e.def.text) {
          this.dialogue = {
            npcId: 'signpost',
            speaker: 'Placa da Senda',
            role: 'Orientação',
            accentColor: '#e8a87c',
            lines: [e.def.text],
            lineIndex: 0,
            charIndex: 0,
          };
          gameAudio.playDialogueBlip(1);
          this.emitHud();
          continue;
        }
        if (kind === 'npc' && e.def.npcId) {
          const profile = NPCS[e.def.npcId];
          if (profile) {
            this.dialogue = {
              npcId: profile.id,
              speaker: profile.name,
              role: profile.role,
              accentColor: profile.accentColor,
              lines: profile.lines,
              lineIndex: 0,
              charIndex: 0,
              choices: profile.choices,
            };
            this.unlockMechanic('NPC_DIALOGUE');
            this.unlockMechanic('NPC_QUESTS');
            gameAudio.playDialogueBlip(profile.voicePitch);
            this.emitHud();
            continue;
          }
        }
      }

      // Player Overlap Checks!
      const hit =
        p.x + p.w > e.x &&
        p.x < e.x + e.w &&
        p.y + p.h > e.y &&
        p.y < e.y + e.h;

      if (!hit) continue;

      // ---- New mechanics: contact behaviour ----
      if (kind === 'jump_orb' && e.cooldown <= 0 && !p.onGround) {
        p.airJumpsLeft = Math.max(p.airJumpsLeft, 0) + 1;
        p.stamina = p.maxStamina;
        e.cooldown = 2.4;
        this.addCombo(1);
        this.unlockMechanic('JUMP_ORB');
        this.spawnShockwave(e.x + 6, e.y + 6, 18, '#7fd8ff', 0.22);
        this.burstParticles(e.x + 6, e.y + 6, 10, '#7fd8ff', 60);
        gameAudio.playCrystal();
        continue;
      }
      if (kind === 'cannon_barrel' && e.cooldown <= 0 && e.state !== 'active') {
        e.state = 'active';
        e.timer = 0.32;
        this.unlockMechanic('STAR_CANNON');
        this.burstParticles(e.x + 7, e.y + 7, 8, '#ffcf6b', 40);
        continue;
      }
      if (kind === 'phase_veil') {
        if (p.dashTimer > 0) {
          if (e.cooldown <= 0) {
            p.dashes = Math.max(p.dashes, 1);
            e.cooldown = 0.5;
            e.flash = 0.3;
            this.addCombo(1);
            this.unlockMechanic('PHASE_VEIL');
            this.burstParticles(e.x + 3, p.y + 5, 12, '#c48bff', 70);
            gameAudio.playCrystal();
          }
        } else {
          const side = p.x + p.w / 2 < e.x + e.w / 2 ? -1 : 1;
          p.x = side < 0 ? e.x - p.w - 0.5 : e.x + e.w + 0.5;
          p.vx = side * 90;
          e.flash = 0.15;
        }
        continue;
      }
      if (kind === 'rocket_pack' && e.cooldown <= 0) {
        this.jetFuel = 1.8;
        e.cooldown = 5;
        this.unlockMechanic('ROCKET_PACK');
        this.spawnFloatingText(p.x + 4, p.y - 10, 'FOGUETE! segure Pular', '#ff9d5c');
        this.burstParticles(e.x + 6, e.y + 6, 12, '#ff9d5c', 70);
        gameAudio.playCrystal();
        continue;
      }
      if (kind === 'pulse_fan' && e.state === 'active') {
        p.vy = Math.max(-150, p.vy - 640 * simDt * p.gravityDir);
        if (p.dashes < 1) p.dashes = 1;
        this.unlockMechanic('PULSE_FAN');
        continue;
      }
      if (kind === 'star_shard' && !e.collected) {
        e.collected = true;
        this.starShards += 1;
        this.advanceSideQuest('star_shards', 1);
        this.addCombo(1);
        this.unlockMechanic('STAR_SHARDS');
        const total = this.liveEntities.filter((o) => o.def.kind === 'star_shard').length;
        this.spawnFloatingText(e.x + 4, e.y - 6, `${this.starShards}/${total} ✦`, '#fff1a8');
        this.burstParticles(e.x + 4, e.y + 4, 8, '#fff1a8', 50);
        gameAudio.playCrystal();
        if (this.starShards >= total) {
          p.maxAirJumps = Math.max(p.maxAirJumps, 1);
          p.airJumpsLeft = Math.max(p.airJumpsLeft, 1);
          this.spawnShockwave(p.x + 4, p.y + 5, 36, '#fff1a8', 0.35);
          this.spawnFloatingText(p.x + 4, p.y - 16, 'CONSTELAÇÃO COMPLETA! +PULO DUPLO', '#fff1a8');
        }
        continue;
      }
      if (kind === 'quest_beacon' && e.state !== 'lit') {
        this.activateQuestBeacon(e);
        continue;
      }
      if (kind === 'lore_tablet' && e.state !== 'lit') {
        this.activateLoreTablet(e);
        continue;
      }

      if (kind === 'campfire') {
        if (!this.unlockedShrines.has(this.currentRoom.id)) {
          this.unlockedShrines.add(this.currentRoom.id);
          this.unlockMechanic('CAMPFIRE_SHRINE');
          this.burstParticles(e.x + 6, e.y + 4, 14, '#ffaa44', 75);
          gameAudio.playCrystal();
          this.saveProgress();
        }
        p.stamina = p.maxStamina;
        p.dashes = Math.max(p.dashes, p.maxDashes);
      } else if (kind === 'torch' && e.state !== 'lit') {
        e.state = 'lit';
        this.unlockMechanic('TORCH_IGNITER');
        this.unlockMechanic('DARK_ILLUMINATION');
        this.burstParticles(e.x + 4, e.y + 4, 10, '#ffbb55', 60);
        gameAudio.playCrystal();
      } else if (kind === 'spring_up') {
        p.vy = -178;
        p.dashes = Math.max(p.dashes, 1);
        p.stamina = p.maxStamina;
        p.scaleX = 0.78;
        p.scaleY = 1.28;
        e.flash = 0.2;
        this.unlockMechanic('DIRECTIONAL_SPRING');
        gameAudio.playSpring();
      } else if (kind === 'spring_left' || kind === 'spring_right') {
        p.vx = kind === 'spring_left' ? -210 : 210;
        p.vy = -85;
        p.dashes = Math.max(p.dashes, 1);
        e.flash = 0.2;
        this.unlockMechanic('DIRECTIONAL_SPRING');
        gameAudio.playSpring();
      } else if (kind === 'bounce_shroom') {
        p.vy = input.jumpHeld ? -185 : -148;
        p.dashes = Math.max(p.dashes, 1);
        p.stamina = p.maxStamina;
        e.flash = 0.25;
        this.unlockMechanic('BOUNCE_SHROOM');
        gameAudio.playSpring();
        this.burstParticles(e.x + 6, e.y + 4, 8, '#4df0c0', 55);
      } else if (kind === 'dash_crystal' && e.cooldown <= 0) {
        p.dashes = Math.max(p.dashes, 1);
        p.stamina = p.maxStamina;
        e.cooldown = 2.2;
        this.hitstop = 0.03;
        this.addCombo(1);
        this.unlockMechanic('DASH_CRYSTAL');
        this.spawnShockwave(e.x + 6, e.y + 6, 18, '#66ff99', 0.22);
        this.burstParticles(e.x + 6, e.y + 6, 10, '#66ff99', 65);
        this.maybeFirePrismDarts(e.x + 6, e.y + 6);
        gameAudio.playCrystal();
      } else if (kind === 'double_dash_crystal' && e.cooldown <= 0) {
        p.dashes = Math.max(p.dashes, 2);
        p.stamina = p.maxStamina;
        e.cooldown = 2.6;
        this.hitstop = 0.035;
        this.addCombo(1);
        this.unlockMechanic('DOUBLE_DASH_CRYSTAL');
        this.spawnShockwave(e.x + 6, e.y + 6, 22, '#ff77dd', 0.25);
        this.burstParticles(e.x + 6, e.y + 6, 12, '#ff77dd', 75);
        this.maybeFirePrismDarts(e.x + 6, e.y + 6);
        gameAudio.playCrystal();
      } else if (kind === 'stamina_orb' && e.cooldown <= 0) {
        p.stamina = p.maxStamina;
        e.cooldown = 2.0;
        this.unlockMechanic('STAMINA_ORB');
        this.burstParticles(e.x + 6, e.y + 6, 8, '#ffee77', 55);
        gameAudio.playCrystal();
      } else if (kind === 'heal_orb' && e.cooldown <= 0) {
        e.cooldown = 7.5;
        p.heroShieldReady = true;
        p.stamina = p.maxStamina;
        p.dashes = Math.max(p.dashes, p.maxDashes);
        this.overdrive = Math.min(100, this.overdrive + 14);
        this.addCombo(1, 90);
        this.unlockMechanic('HEAL_ORB_FOUNTAIN');
        this.unlockMechanic('STAMINA_OVERCHARGE');
        this.spawnFloatingText(e.x + 7, e.y - 8, 'VIGOR + ESCUDO!', '#4df0c0');
        this.spawnShockwave(e.x + 7, e.y + 7, 28, '#4df0c0', 0.28);
        this.burstParticles(e.x + 7, e.y + 7, 16, '#4df0c0', 90);
        gameAudio.playRelic();
      } else if (kind === 'elemental_totem' && e.cooldown <= 0) {
        e.cooldown = 4.0;
        const totemElem = e.subType ?? 'flame';
        this.imbuedElement = totemElem;
        this.imbuedTimer = 10.0;
        this.unlockMechanic('ELEMENTAL_TOTEM_ALTAR');
        this.unlockMechanic('ELEMENTAL_IMBUEMENT');
        this.unlockMechanic('TOTEM_ELEMENT_BURST');
        this.unlockMechanic('TOTEM_ALTAR_NETWORK');
        this.spawnFloatingText(e.x + 7, e.y - 10, `IMBUÍDO: ${totemElem.toUpperCase()}!`, '#ffd24d');
        this.spawnShockwave(e.x + 7, e.y + 9, 44, '#ffd24d', 0.34);
        this.burstParticles(e.x + 7, e.y + 9, 20, '#ffd24d', 105);
        for (const foe of this.liveEntities) {
          if (foe.state !== 'dead' && (foe.def.kind.startsWith('enemy_') || isBossKind(foe.def.kind)) && Math.hypot(foe.x - e.x, foe.y - e.y) < 76) {
            this.damageEntity(foe, 1, totemElem);
          }
        }
        gameAudio.playCrystal();
      } else if (kind === 'chrono_gate' && e.cooldown <= 0) {
        e.cooldown = 1.6;
        this.heroSkillCooldown = Math.max(0, this.heroSkillCooldown - 2.0);
        this.comboTimer += 2.2;
        p.dashes = Math.max(p.dashes, 1);
        this.addCombo(1, 100);
        this.unlockMechanic('CHRONO_GATE_ARCH');
        this.unlockMechanic('CHRONO_GATE_CHAIN');
        this.spawnFloatingText(e.x + 7, e.y - 10, 'FLUXO CRONO! -2s', '#52e5ff');
        this.spawnShockwave(e.x + 7, e.y + 11, 26, '#52e5ff', 0.26);
        this.burstParticles(e.x + 7, e.y + 11, 14, '#52e5ff', 85);
        gameAudio.playDash(true);
      } else if (kind === 'echo_mirror' && e.cooldown <= 0) {
        e.cooldown = 5.0;
        this.echoCloneTimer = 9.0;
        this.echoCloneX = p.x;
        this.echoCloneY = p.y;
        this.echoCloneFacing = p.facing;
        this.echoHistory = [];
        this.unlockMechanic('ECHO_MIRROR_PAD');
        this.unlockMechanic('ECHO_CLONE_STEP');
        this.unlockMechanic('ECHO_CLONE_SYSTEM');
        this.spawnFloatingText(e.x + 7, e.y - 10, 'CLONE DO ECO ATIVO!', '#a89eff');
        this.spawnShockwave(e.x + 7, e.y + 9, 30, '#a89eff', 0.3);
        this.burstParticles(e.x + 7, e.y + 9, 18, '#a89eff', 90);
        gameAudio.playRelic();
      } else if (kind === 'boss_crown_shard' && !e.collected) {
        e.collected = true;
        this.crownShardsCollected += 1;
        const coinGain = this.equippedTalisman === 'coroa_soberana' ? 5 : 3;
        this.astralCoins += coinGain;
        this.overdrive = Math.min(100, this.overdrive + 35);
        this.grantMasteryXp(18);
        this.addCombo(2, 160);
        this.unlockMechanic('BOSS_CROWN_SHARD');
        this.unlockMechanic('BOSS_CROWN_COLLECTION');
        this.spawnFloatingText(e.x + 6, e.y - 10, `FRAGMENTO REAL +${coinGain}★!`, '#ffe066');
        this.spawnShockwave(e.x + 6, e.y + 6, 28, '#ffe066', 0.3);
        this.burstParticles(e.x + 6, e.y + 6, 18, '#ffe066', 95);
        gameAudio.playRelic();
        this.saveProgress();
      } else if (kind === 'laser_prism' && e.cooldown <= 0 && (p.dashTimer > 0 || input.skillJustPressed)) {
        e.cooldown = 1.4;
        const target = this.liveEntities.find(
          (f) => f.state !== 'dead' && (f.def.kind.startsWith('enemy_') || isBossKind(f.def.kind))
        );
        const tx = target ? target.x + target.w * 0.5 : e.x + p.facing * 140;
        const ty = target ? target.y + target.h * 0.5 : e.y + 6;
        const ang = Math.atan2(ty - (e.y + 7), tx - (e.x + 7));
        const sp = this.projectiles[this.projHead];
        this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
        sp.active = true;
        sp.x = e.x + 7;
        sp.y = e.y + 7;
        sp.vx = Math.cos(ang) * 230;
        sp.vy = Math.sin(ang) * 230;
        sp.radius = 4;
        sp.gravity = 0;
        sp.homing = true;
        sp.friendly = true;
        sp.pierceWalls = true;
        sp.color = '#52e5ff';
        sp.life = 2.2;
        this.unlockMechanic('LASER_PRISM_TURRET');
        this.unlockMechanic('LASER_PRISM_STRIKE');
        this.unlockMechanic('PRISM_NETWORK');
        this.spawnFloatingText(e.x + 7, e.y - 8, 'PRISMA LASER!', '#52e5ff');
        this.spawnShockwave(e.x + 7, e.y + 7, 24, '#52e5ff', 0.25);
        gameAudio.playBossLaser();
      } else if (kind === 'gravity_crystal' && e.cooldown <= 0) {
        p.gravityDir = p.gravityDir === 1 ? -1 : 1;
        p.vy = 0;
        e.cooldown = 1.0;
        this.unlockMechanic('GRAVITY_CRYSTAL');
        this.spawnShockwave(e.x + 6, e.y + 6, 20, '#c080ff', 0.24);
        this.burstParticles(e.x + 6, e.y + 6, 10, '#c080ff', 70);
        gameAudio.playCrystal();
      } else if (kind === 'feather_aura' && e.cooldown <= 0) {
        p.featherTimer = 2.8;
        e.cooldown = 4.0;
        this.unlockMechanic('FEATHER_AURA');
        this.burstParticles(e.x + 6, e.y + 6, 12, '#ffdd66', 80);
        gameAudio.playRelic();
      } else if (kind === 'chrono_prism' && e.cooldown <= 0) {
        p.chronoTimer = 2.8;
        e.cooldown = 4.5;
        this.unlockMechanic('CHRONO_PRISM');
        this.burstParticles(e.x + 6, e.y + 6, 12, '#7ce8ff', 70);
        gameAudio.playCrystal();
      } else if (kind === 'prism_splitter' && e.cooldown <= 0) {
        p.dashes = Math.max(p.dashes, 2);
        p.stamina = p.maxStamina;
        e.cooldown = 3.2;
        this.hitstop = 0.035;
        this.addCombo(1);
        this.unlockMechanic('PRISM_SPLITTER');
        this.spawnFloatingText(e.x + 6, e.y - 6, 'PRISMA x2!', '#fbbf24');
        this.spawnShockwave(e.x + 6, e.y + 6, 36, '#fbbf24', 0.28);
        this.burstParticles(e.x + 6, e.y + 6, 16, '#fbbf24', 95);
        for (const pr of this.projectiles) {
          if (pr.active && !pr.friendly && Math.hypot(pr.x - (e.x + 6), pr.y - (e.y + 6)) < 76) {
            pr.active = false;
            this.burstParticles(pr.x, pr.y, 4, '#fbbf24', 45);
          }
        }
        gameAudio.playCrystal();
      } else if (kind === 'stasis_orb' && e.cooldown <= 0) {
        p.stasisTimer = 2.4;
        e.cooldown = 4.2;
        this.addCombo(1);
        this.unlockMechanic('STASIS_ORB');
        this.spawnFloatingText(e.x + 6, e.y - 6, 'ESTASE!', '#67e8f9');
        this.spawnShockwave(e.x + 6, e.y + 6, 40, '#67e8f9', 0.3);
        this.burstParticles(e.x + 6, e.y + 6, 16, '#67e8f9', 80);
        gameAudio.playCrystal();
      } else if (kind === 'dash_ring' && p.dashTimer > 0 && e.cooldown <= 0) {
        p.vx *= 1.55;
        p.vy *= 1.55;
        p.dashTimer = PHYS.DASH_TIME;
        e.cooldown = 0.6;
        this.addCombo(1);
        this.spawnShockwave(e.x + 6, e.y + 6, 22, '#ff9944', 0.22);
        this.unlockMechanic('DASH_BOOST_RING');
        gameAudio.playDash(true);
      } else if (kind === 'mag_rail' && e.cooldown <= 0) {
        p.vx = (e.x + 6 - (p.x + 4)) * 5;
        p.vy = -125;
        p.dashes = Math.max(p.dashes, 1);
        e.cooldown = 0.5;
        this.unlockMechanic('MAG_RAIL');
        gameAudio.playCrystal();
      } else if (kind === 'portal_a' || kind === 'portal_b') {
        if (e.cooldown <= 0 && e.def.tx !== undefined && e.def.ty !== undefined) {
          p.x = e.def.tx;
          p.y = e.def.ty;
          e.cooldown = 0.7;
          for (const other of this.liveEntities) {
            if (other.def.kind === 'portal_a' || other.def.kind === 'portal_b') other.cooldown = 0.7;
          }
          this.unlockMechanic('MIRROR_PORTAL');
          this.burstParticles(p.x + 4, p.y + 5, 12, '#d580ff', 75);
          gameAudio.playCrystal();
        }
      } else if (kind === 'tether_ring' && input.grabHeld && !p.tetherId && this.grappleCooldown <= 0) {
        p.tetherId = e.def.id;
        p.tetherAngle = 0.4 * p.facing;
        p.tetherAngVel = p.vx * 0.04;
        const tetherSolved = resolveSwingStep(
          this.buildCollisionGrid(),
          p,
          e.x + 4,
          e.y + 4,
          p.tetherAngle,
          p.tetherAngle,
          p.tetherAngVel,
          22
        );
        p.x = tetherSolved.x;
        p.y = tetherSolved.y;
        p.tetherAngle = tetherSolved.angle;
        this.unlockMechanic('TETHER_RING');
      } else if (kind === 'bubble' && e.cooldown <= 0) {
        p.bubbleId = e.def.id;
        p.bubbleTimer = 0.9;
        p.x = e.x + 2;
        p.y = e.y + 1;
        e.cooldown = 1.6;
      } else if (kind === 'key' && !e.collected) {
        e.collected = true;
        p.carryingKeys.push(e.def.id);
        this.unlockMechanic('KEY_FOLLOWER');
        this.burstParticles(e.x + 6, e.y + 6, 10, '#ffd27d', 65);
        gameAudio.playKeyOrSwitch();
      } else if (kind === 'touch_switch' && !e.collected) {
        e.collected = true;
        this.addCombo(1);
        this.spawnShockwave(e.x + 6, e.y + 6, 20, '#66ffd9', 0.24);
        this.burstParticles(e.x + 6, e.y + 6, 10, '#66ffd9', 65);
        gameAudio.playKeyOrSwitch();
        const remaining = this.liveEntities.filter((o) => o.def.kind === 'touch_switch' && !o.collected);
        if (remaining.length === 0) {
          for (const gate of this.liveEntities) {
            if (gate.def.kind === 'switch_gate') {
              gate.state = 'open';
              this.openedDoors.add(gate.def.id);
              this.unlockMechanic('TOUCH_SWITCH_GATE');
              this.spawnShockwave(gate.x + 4, gate.y + 20, 30, '#66ffd9', 0.3);
              this.burstParticles(gate.x + 4, gate.y + 20, 18, '#66ffd9', 90);
            }
          }
        }
      } else if (kind === 'pressure_plate' && e.state !== 'active') {
        e.state = 'active';
        for (const br of this.liveEntities) {
          if (br.def.kind === 'plate_bridge') {
            br.state = 'active';
            this.unlockMechanic('PRESSURE_BRIDGE');
          }
        }
        gameAudio.playKeyOrSwitch();
      } else if ((kind === 'relic' || kind === 'winged_relic') && !e.collected && e.state === 'idle') {
        e.collected = true;
        p.pendingRelics.push({
          id: e.def.id,
          x: e.x,
          y: e.y,
          timer: 0,
          winged: kind === 'winged_relic',
        });
        this.addCombo(2);
        this.spawnShockwave(e.x + 6, e.y + 6, 22, '#ff6688', 0.25);
        this.burstParticles(e.x + 6, e.y + 6, 8, '#ff6688', 55);
        gameAudio.playCrystal();
      } else if (kind === 'astral_coin' && !e.collected) {
        e.collected = true;
        this.collectedCoins.add(e.def.id);
        const coinGain = this.playMode === 'mirror_void' ? 2 : 1;
        this.astralCoins += coinGain;
        this.addCombo(1);
        this.spawnFloatingText(e.x + 4, e.y - 2, `+${coinGain} ★`, '#ffe47a');
        this.burstParticles(e.x + 4, e.y + 4, 10, '#ffe47a', 70);
        gameAudio.playCrystal();
        this.saveProgress();
        this.emitHud();
      } else if (kind === 'boost_hoop' && e.cooldown <= 0) {
        p.vx = p.facing * 260;
        p.vy = -115 * p.gravityDir;
        p.dashes = Math.max(p.dashes, p.maxDashes);
        p.stamina = p.maxStamina;
        p.scaleX = 1.28;
        p.scaleY = 0.78;
        e.cooldown = 0.75;
        this.addCombo(2);
        this.hitstop = 0.025;
        this.spawnShockwave(e.x + 7, e.y + 9, 26, '#52e5ff', 0.26);
        this.burstParticles(e.x + 7, e.y + 9, 14, '#52e5ff', 95);
        gameAudio.playDash(true);
      } else if (kind === 'blessing_shrine' && e.cooldown <= 0) {
        e.cooldown = 1.8;
        p.stamina = p.maxStamina;
        p.dashes = Math.max(p.dashes, p.maxDashes);
        this.heroSkillCooldown = 0;
        const heroDef = getHeroDef(this.heroId);
        if (heroDef.modifiers.shieldPerRoom) p.heroShieldReady = true;
        this.unlockedShrines.add(this.currentRoom.id);
        this.spawnFloatingText(e.x + 8, e.y - 6, 'ALTAR!', '#ffd27d');
        this.spawnShockwave(e.x + 8, e.y + 6, 30, '#ffd27d', 0.34);
        this.burstParticles(e.x + 8, e.y + 6, 18, '#ffd27d', 90);
        gameAudio.playRelic();
        this.saveProgress();
        this.emitHud();
      } else if (kind === 'bumper_orb' && e.cooldown <= 0) {
        const cx = e.x + e.w * 0.5;
        const cy = e.y + e.h * 0.5;
        const dx = p.x + p.w * 0.5 - cx;
        const dy = p.y + p.h * 0.5 - cy;
        const len = Math.hypot(dx, dy) || 1;
        p.vx = (dx / len) * 235;
        p.vy = Math.min(-125, (dy / len) * 225);
        p.dashes = Math.max(p.dashes, p.maxDashes);
        p.stamina = p.maxStamina;
        p.scaleX = 0.78;
        p.scaleY = 1.28;
        e.cooldown = 0.35;
        e.flash = 0.25;
        this.addCombo(2, 90);
        this.hitstop = 0.03;
        this.spawnFloatingText(cx, cy - 8, 'IMPULSO!', '#ff88dd');
        this.spawnShockwave(cx, cy, 26, '#ff88dd', 0.26);
        this.burstParticles(cx, cy, 14, '#ff88dd', 95);
        gameAudio.playSpring();
      } else if (kind === 'speed_pad' && e.cooldown <= 0) {
        const dir = e.dir || p.facing || 1;
        p.vx = dir * 285;
        p.vy = -70 * p.gravityDir;
        p.facing = dir;
        p.dashes = Math.max(p.dashes, p.maxDashes);
        p.stamina = p.maxStamina;
        p.scaleX = 1.3;
        p.scaleY = 0.76;
        e.cooldown = 0.28;
        e.flash = 0.25;
        this.addCombo(1, 70);
        this.spawnFloatingText(e.x + 8, e.y - 6, 'TURBO!', '#ffd24d');
        this.spawnShockwave(e.x + 8, e.y + 4, 22, '#ffd24d', 0.22);
        this.burstParticles(e.x + 8, e.y + 4, 12, '#ffd24d', 85);
        gameAudio.playDash(true);
      } else if (kind === 'treasure_chest' && e.state !== 'open') {
        e.state = 'open';
        this.openedChests.add(e.def.id);
        this.astralCoins += 5;
        this.grantPlayerXp(16);
        const chestDrops = getBiomeMaterialDrops(this.currentRoom.biome, false, true, Math.floor(e.x + e.y));
        for (const dr of chestDrops) {
          this.craftingMaterials[dr.id] = (this.craftingMaterials[dr.id] ?? 0) + dr.qty;
        }
        this.advanceSideQuest('secret_vaults', 1);
        this.addCombo(3, 180);
        this.hitstop = 0.05;
        this.trauma = Math.min(1, this.trauma + 0.35);
        this.onRumble?.(90, 0.25, 0.45);
        this.spawnFloatingText(e.x + 7, e.y - 6, '+5 ★ +MATERIAIS', '#ffe47a');
        this.spawnShockwave(e.x + 7, e.y + 6, 30, '#ffe47a', 0.3);
        this.burstParticles(e.x + 7, e.y + 4, 24, '#ffe47a', 110);
        this.burstParticles(e.x + 7, e.y + 4, 12, '#ffffff', 75);
        gameAudio.playRelic();
        this.saveProgress();
        this.emitHud();
      } else if (kind === 'checkpoint_totem' && e.state !== 'lit') {
        e.state = 'lit';
        this.roomRespawnOverride = {
          roomId: this.currentRoom.id,
          x: Math.round(e.x + 2),
          y: Math.round(e.y + e.h - this.player.h),
        };
        this.addCombo(1, 80);
        p.stamina = p.maxStamina;
        p.dashes = Math.max(p.dashes, p.maxDashes);
        this.spawnFloatingText(e.x + 6, e.y - 6, 'CHECKPOINT!', '#52e5ff');
        this.spawnShockwave(e.x + 6, e.y + 6, 26, '#52e5ff', 0.28);
        this.burstParticles(e.x + 6, e.y + 6, 16, '#52e5ff', 85);
        gameAudio.playCrystal();
        this.emitHud();
      } else if (kind === 'shield_orb' && e.cooldown <= 0) {
        e.cooldown = 8.0;
        p.heroShieldReady = true;
        this.addCombo(1, 80);
        this.spawnFloatingText(e.x + 7, e.y - 6, 'ESCUDO!', '#ffd24d');
        this.spawnShockwave(e.x + 7, e.y + 7, 24, '#ffd24d', 0.26);
        this.burstParticles(e.x + 7, e.y + 7, 14, '#ffd24d', 80);
        gameAudio.playCrystal();
        this.emitHud();
      } else if (kind === 'rift_trial' && !e.collected && !this.riftActive) {
        this.riftActive = true;
        this.riftProgress = 0;
        this.riftTotal = 5;
        this.riftTimer = 15.0;
        const roomW = this.currentRoom.cols * TILE_SIZE;
        const roomH = this.currentRoom.rows * TILE_SIZE;
        this.riftRings = Array.from({ length: 5 }, (_, idx) => {
          const angle = -Math.PI * 0.8 + idx * 0.42;
          const rx = Math.max(36, Math.min(roomW - 36, e.x + 8 + Math.cos(angle) * (42 + idx * 14) * (idx % 2 === 0 ? 1 : -1)));
          const ry = Math.max(28, Math.min(roomH - 36, e.y - 26 - idx * 12));
          return { x: Math.round(rx), y: Math.round(ry), collected: false };
        });
        this.spawnFloatingText(e.x + 8, e.y - 10, 'FENDA ASTRAL! COLETAR 5 ANEIS!', '#4df0c0');
        this.spawnShockwave(e.x + 8, e.y + 9, 34, '#4df0c0', 0.34);
        gameAudio.playRelic();
        this.emitHud();
      } else if (kind === 'chapter_goal' && !e.collected) {
        if (this.isGoalLocked()) {
          if (this.lockedGoalToastCooldown <= 0) {
            this.lockedGoalToastCooldown = 1.2;
            this.spawnFloatingText(e.x + 6, e.y - 10, 'DERROTE O CHEFE!', '#ff6688');
            gameAudio.playEnemyHit(false);
          }
          continue;
        }
        e.collected = true;
        this.commitGhostRun();
        if (this.playMode === 'tower') {
          const clearedFloor = Math.max(1, this.towerFloor);
          const isBossFloor = clearedFloor % 5 === 0;
          const coinGain = (isBossFloor ? 12 : 4) + getPlayerLevelBonuses(this.getPlayerLevel()).coinBonusFlat;
          this.astralCoins += coinGain;
          this.grantMasteryXp(isBossFloor ? 55 : 24);
          this.grantPlayerXp(isBossFloor ? 75 : 30);
          this.hitstop = 0.06;
          this.trauma = 0.55;
          this.burstParticles(e.x + 6, e.y + 6, 28, '#38bdf8', 120);
          this.spawnFloatingText(e.x + 6, e.y - 10, `ANDAR ${clearedFloor} CONCLUÍDO! +${coinGain}★`, '#38bdf8');
          gameAudio.playVictory();
          this.loadTowerFloor(clearedFloor + 1, false);
          return;
        }
        if (this.playMode === 'boss_rush') {
          this.advanceBossRush();
          return;
        }
        const activeRecs = this.getActiveChapterRecords();
        const rec = activeRecs[this.chapterIndex];
        rec.cleared = true;
        rec.bestTimeSeconds =
          rec.bestTimeSeconds === null
            ? this.chapterElapsedSeconds
            : Math.min(rec.bestTimeSeconds, this.chapterElapsedSeconds);
        rec.fewestDeaths =
          rec.fewestDeaths === null
            ? this.chapterDeaths
            : Math.min(rec.fewestDeaths, this.chapterDeaths);
        const stageRelicsHere = this.chapters[this.chapterIndex].stages.reduce(
          (acc, st) =>
            acc +
            st.entities.filter(
              (ent) => (ent.kind === 'relic' || ent.kind === 'winged_relic') && this.collectedRelics.has(ent.id)
            ).length,
          0
        );
        const earnedStars = computeWorldStars(
          true,
          this.chapterDeaths,
          stageRelicsHere,
          this.chapters[this.chapterIndex].totalRelics
        );
        const starsMap = this.playMode === 'underworld' ? this.underworldWorldStars : this.worldStars;
        starsMap[this.chapterIndex] = Math.max(starsMap[this.chapterIndex] ?? 0, earnedStars);
        this.missionStats.stagesCleared += 1;
        if (this.chapterIndex + 1 < activeRecs.length) {
          activeRecs[this.chapterIndex + 1].unlocked = true;
        }
        const clearedCount = activeRecs.filter((r) => r.cleared).length;
        if (clearedCount >= 5) this.unlockAchievement('boss_5');
        if (clearedCount >= 10) this.unlockAchievement('boss_10');
        if (clearedCount >= 20) this.unlockAchievement('boss_20');
        this.grantMasteryXp(65);
        this.grantPlayerXp(75);
        this.mode = 'stage_clear';
        this.hitstop = 0.08;
        this.trauma = 0.7;
        this.burstParticles(e.x + 6, e.y + 6, 32, '#ffd27d', 140);
        gameAudio.playVictory();
        this.saveProgress();
        this.emitHud();
      } else if (kind === 'summit_heart' && !e.collected) {
        if (this.isGoalLocked()) {
          if (this.lockedGoalToastCooldown <= 0) {
            this.lockedGoalToastCooldown = 1.2;
            this.spawnFloatingText(e.x + 6, e.y - 10, 'DERROTE O SOBERANO!', '#ffd27d');
            gameAudio.playEnemyHit(false);
          }
          continue;
        }
        e.collected = true;
        this.commitGhostRun();
        if (this.playMode === 'boss_rush') {
          this.advanceBossRush();
          return;
        }
        const activeRecs = this.getActiveChapterRecords();
        const rec = activeRecs[this.chapterIndex];
        rec.cleared = true;
        rec.bestTimeSeconds =
          rec.bestTimeSeconds === null
            ? this.chapterElapsedSeconds
            : Math.min(rec.bestTimeSeconds, this.chapterElapsedSeconds);
        rec.fewestDeaths =
          rec.fewestDeaths === null
            ? this.chapterDeaths
            : Math.min(rec.fewestDeaths, this.chapterDeaths);
        const stageRelicsHere = this.chapters[this.chapterIndex].stages.reduce(
          (acc, st) =>
            acc +
            st.entities.filter(
              (ent) => (ent.kind === 'relic' || ent.kind === 'winged_relic') && this.collectedRelics.has(ent.id)
            ).length,
          0
        );
        const earnedStars = computeWorldStars(
          true,
          this.chapterDeaths,
          stageRelicsHere,
          this.chapters[this.chapterIndex].totalRelics
        );
        const starsMap = this.playMode === 'underworld' ? this.underworldWorldStars : this.worldStars;
        starsMap[this.chapterIndex] = Math.max(starsMap[this.chapterIndex] ?? 0, earnedStars);
        this.missionStats.stagesCleared += 1;
        const clearedCount = activeRecs.filter((r) => r.cleared).length;
        if (clearedCount >= 20) this.unlockAchievement('boss_20');
        this.grantMasteryXp(85);
        this.grantPlayerXp(140);
        this.victory = true;
        this.mode = 'gameover';
        this.unlockMechanic('SUMMIT_HEART');
        this.hitstop = 0.08;
        this.trauma = 0.9;
        this.onRumble?.(240, 0.5, 0.95);
        this.burstParticles(e.x + 6, e.y + 6, 36, '#ffd27d', 150);
        gameAudio.playVictory();
        if (this.playMode !== 'speedrun' && this.playMode !== 'underworld') {
          this.triggerCutscene('ending_victory');
        }
        this.saveProgress();
        this.emitHud();
      } else if (
        kind === 'spinner' ||
        kind === 'enemy_saw' ||
        (kind === 'falling_icicle' && e.state === 'active') ||
        ((kind === 'steam_geyser' || kind === 'lightning_zone') && e.state === 'active')
      ) {
        if (kind === 'spinner') this.unlockMechanic('SPINNER_BLADE');
        if (kind === 'enemy_saw') this.unlockMechanic('ENEMY_SAW');
        this.killPlayer();
        return;
      } else if (kind.startsWith('enemy_') || isBossKind(kind)) {
        const stomping = p.vy * p.gravityDir > 0 && p.y + p.h - 4 <= e.y + 7;
        const dashing = p.dashTimer > 0;
        const spikyShell = kind === 'enemy_magma_tortoise' && stomping && !dashing;
        const shieldedFront =
          (kind === 'enemy_golem' ||
            kind === 'enemy_bone_knight' ||
            kind === 'enemy_shield_phalanx' ||
            kind === 'enemy_obsidian_golem_uw') &&
          !stomping &&
          Math.sign(p.x - e.x) === e.dir;

        if (spikyShell) {
          p.vy = -148 * p.gravityDir;
          p.dashes = Math.max(p.dashes, 1);
          this.burstParticles(e.x + 6, e.y, 8, '#ff7733', 65);
          this.spawnFloatingText(e.x + 6, e.y - 8, 'CASCO QUENTE! USE DASH/[U]', '#ff9944');
          gameAudio.playEnemyHit(false);
        } else if (shieldedFront) {
          const cx = e.x + e.w * 0.5;
          const cy = e.y + e.h * 0.5;
          p.vx = e.dir * 120;
          p.vy = -70;
          this.hitstop = Math.max(this.hitstop, 0.04);
          this.trauma = Math.min(1, this.trauma + 0.34);
          this.shakeDirX = e.dir * 2.8;
          this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, 0.1);
          this.hitFlashTimer = 0.12;
          this.hitFlashColor = '#7ce8ff';
          this.hitFlashX = cx;
          this.hitFlashY = cy;
          this.spawnImpactSlash(cx, cy, e.dir > 0 ? -0.45 : Math.PI + 0.45, 22, 3, '#7ce8ff', false, 0.18);
          this.spawnShockwave(cx, cy, 20, '#7ce8ff', 0.22);
          this.burstDirectionalSparks(cx, cy, e.dir > 0 ? 0 : Math.PI, 1.4, 12, '#7ce8ff', 135);
          this.burstDirectionalSparks(cx, cy, e.dir > 0 ? 0 : Math.PI, 1.1, 6, '#ffd27d', 110);
          this.unlockMechanic(kind === 'enemy_golem' ? 'ENEMY_GOLEM' : 'ENEMY_ELITE_NEW');
          this.spawnFloatingText(e.x + 6, e.y - 6, 'BLINDADO!', '#ffaa44');
          gameAudio.playEnemyHit(false);
        } else if (stomping || dashing) {
          this.hitstop = 0.055;
          this.trauma = Math.min(1, this.trauma + 0.45);
          this.onRumble?.(85, 0.3, 0.6);
          p.dashes = Math.max(p.dashes, 1);
          p.stamina = p.maxStamina;
          p.invulnTimer = 0.35;
          this.unlockMechanic('IFRAMES_SHIELD');
          this.unlockMechanic('ENEMY_HITSTOP');
          if (stomping) {
            p.vy = -142 * p.gravityDir;
            this.stompChain += 1;
            this.unlockMechanic('STOMP_BOUNCE');
            if (this.stompChain >= 2) this.unlockMechanic('STOMP_CHAIN');
          } else {
            this.unlockMechanic('DASH_SHATTER');
          }
          const atkElem = this.imbuedElement ?? (this.equippedTalisman !== 'none' ? TALISMAN_MAP[this.equippedTalisman]?.element : null) ?? getHeroElement(this.heroId);
          this.damageEntity(e, 1, atkElem, false, stomping);
        } else if (p.invulnTimer <= 0 && (!isBossKind(kind) || e.bossSubState !== 'staggered')) {
          this.killPlayer();
          return;
        }
      }
    }
  }

  private maybeFirePrismDarts(ox: number, oy: number): void {
    if (!this.activeBoons.includes('prism_burst')) return;
    const foe = this.liveEntities.find((e) => e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)));
    const baseA = foe ? Math.atan2(foe.y - oy, foe.x - ox) : -Math.PI * 0.25;
    for (let i = -1; i <= 1; i++) {
      const sp = this.projectiles[this.projHead];
      this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
      sp.active = true;
      sp.x = ox;
      sp.y = oy;
      sp.vx = Math.cos(baseA + i * 0.22) * 165;
      sp.vy = Math.sin(baseA + i * 0.22) * 165;
      sp.radius = 3;
      sp.gravity = 0;
      sp.homing = true;
      sp.friendly = true;
      sp.pierceWalls = true;
      sp.color = '#ff66dd';
      sp.life = 1.9;
    }
  }

  public triggerBossRetreat(e: LiveEntity): void {
    const roomW = this.currentRoom.cols * TILE_SIZE;
    const roomH = this.currentRoom.rows * TILE_SIZE;
    const cx = e.x + e.w * 0.5;
    const safePt = chooseSafeRetreatPoint(this.player.x + 4, this.player.y + 5, e.x, roomW, roomH);
    e.tx = safePt.x;
    e.ty = safePt.y;
    e.vx = 0;
    e.vy = -125;
    e.state = 'retreat';
    e.bossSubState = 'retreat';
    e.timer = 0.56;
    this.unlockMechanic('BOSS_PARABOLIC_LEAP');
    this.unlockMechanic('BOSS_PERCH_RESPECT');
    const meta = isBossKind(e.def.kind) ? getAnyBossMeta(e.def.kind) : null;
    this.spawnShockwave(cx, e.y + e.h * 0.5, 28, meta?.accentColor ?? '#52e5ff', 0.26);
    this.burstParticles(cx, e.y + e.h * 0.5, 16, meta?.accentColor ?? '#52e5ff', 105);
    this.spawnFloatingText(cx, e.y - 10, 'SALTO TÁTICO!', meta?.accentColor ?? '#52e5ff');
  }

  public damageEntity(
    e: LiveEntity,
    rawDmg: number,
    elem: ElementType,
    isParry = false,
    stomping = false
  ): void {
    if (e.state === 'dead') return;
    const bossKind = isBossKind(e.def.kind) ? e.def.kind : null;
    if (bossKind && (e.hitInvulnTimer ?? 0) > 0) {
      if ((e.immunePopCd ?? 0) <= 0) {
        const ix = e.x + e.w * 0.5;
        const iy = e.y + e.h * 0.5;
        e.immunePopCd = 0.25;
        this.spawnFloatingText(ix, e.y - 10, 'IMUNE!', '#52e5ff');
        this.spawnShockwave(ix, iy, 18, '#52e5ff', 0.18);
        this.burstParticles(ix, iy, 6, '#52e5ff', 75);
        gameAudio.playEnemyHit(false);
      }
      return;
    }

    this.soulCharge = Math.min(100, this.soulCharge + (isParry ? 18 : 10));
    const prevHp = e.hp;
    const activeElem = this.imbuedElement ?? elem;
    let totalDmg = rawDmg;
    let weaknessHit = false;
    let staggerGain = isParry || this.overdriveTimer > 0 ? 2 : 1;

    // Elemental Weakness x2 & Critical Vulnerability Check on Bosses
    if (bossKind) {
      const bEntry = getAnyBossBestiary(bossKind);
      if (bEntry && bEntry.weaknessElement === activeElem) {
        weaknessHit = true;
        totalDmg += 1;
        staggerGain += 1;
        this.unlockMechanic('BOSS_ELEMENTAL_WEAKNESS');
        this.unlockMechanic('BOSS_WEAKNESS_CRIT');
      }
      if (e.bossSubState === 'staggered' || e.bossSubState === 'recover') {
        if (this.activeBoons.includes('critical_edge')) totalDmg += 1;
        if (e.bossSubState === 'staggered' && this.equippedTalisman === 'olho_aguia') totalDmg += 1;
      }
    }

    const existingMark = e.elementMark ?? null;
    if (existingMark && existingMark !== activeElem && (e.elementTimer ?? 0) > 0) {
      const reaction = resolveElementalReaction(existingMark, activeElem);
      e.elementMark = null;
      e.elementTimer = 0;
      if (reaction) {
        const boonB = computeBoonBonuses(this.activeBoons);
        totalDmg += reaction.bonusDamage + boonB.reactionBonusDamage;
        staggerGain += 1;
        this.totalReactions += 1;
        this.overdrive = Math.min(100, this.overdrive + reaction.overdriveGain);
        if (this.overdrive >= 100 && this.overdriveTimer <= 0) {
          this.activateOverdrive();
        }
        const cx = e.x + e.w * 0.5;
        const cy = e.y + e.h * 0.5;
        this.spawnFloatingText(cx, e.y - 12, reaction.name, reaction.color);
        this.spawnShockwave(cx, cy, reaction.radius, reaction.color, 0.34);
        this.burstParticles(cx, cy, 22, reaction.color, 125);
        this.unlockAchievement('elemental_master');
      }
    } else {
      e.elementMark = activeElem;
      e.elementTimer = 6.5;
    }

    if (isParry) {
      this.totalParries += 1;
      this.unlockAchievement('parry_ace');
      if (this.equippedRunes.includes('contra_golpe')) {
        this.heroSkillCooldown *= 0.5;
      }
      if (this.equippedRunes.includes('furia_carmesim')) {
        this.overdrive = Math.min(100, this.overdrive + 15);
      }
      if (this.activeBoons.includes('lightning_parry')) {
        this.spawnFloatingText(e.x + e.w * 0.5, e.y - 16, 'PARRY VOLTAICO!', '#facc15');
        this.spawnShockwave(e.x + e.w * 0.5, e.y + e.h * 0.5, 42, '#facc15', 0.28);
      }
    }

    if (this.activeBoons.includes('vampiric_dash') && this.player.dashTimer > 0) {
      this.vampiricHits += 1;
      this.player.stamina = this.player.maxStamina;
      this.overdrive = Math.min(100, this.overdrive + 8);
      if (this.vampiricHits % 5 === 0) this.player.heroShieldReady = true;
    }

    e.hp -= totalDmg;
    e.flash = 0.18;
    const hitCx = e.x + e.w * 0.5;
    const hitCy = e.y + e.h * 0.5;
    const elemCol = ELEMENT_META[activeElem]?.color ?? '#ffd27d';
    const atkAngle = Math.atan2(hitCy - (this.player.y + 5), hitCx - (this.player.x + 4));
    this.hitstop = Math.max(this.hitstop, bossKind || weaknessHit || isParry ? 0.055 : 0.042);
    this.trauma = Math.min(1, this.trauma + (bossKind || isParry ? 0.54 : 0.4));
    this.shakeDirX = Math.cos(atkAngle) * (bossKind ? 3.2 : 2.2);
    this.shakeDirY = Math.sin(atkAngle) * (bossKind ? 2.4 : 1.6);
    this.hitFlashTimer = 0.14;
    this.hitFlashColor = elemCol;
    this.hitFlashX = hitCx;
    this.hitFlashY = hitCy;
    this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, isParry || weaknessHit ? 0.16 : 0.1);
    this.onRumble?.(70, 0.25, 0.45);
    this.spawnImpactSlash(
      hitCx,
      hitCy,
      atkAngle + (Math.random() - 0.5) * 0.5,
      bossKind ? 32 : 24,
      bossKind ? 5 : 4,
      elemCol,
      isParry || weaknessHit,
      0.2
    );
    this.burstDirectionalSparks(hitCx, hitCy, atkAngle, 1.35, bossKind ? 16 : 12, elemCol, 155);
    this.burstDirectionalSparks(hitCx, hitCy, atkAngle, 0.9, 7, '#ffffff', 170);

    this.unlockMechanic('DAMAGE_NUMBER_POP');
    if (e.hp <= 0) {
      this.handleEnemyKilled(e, stomping);
      return;
    }

    this.addCombo(1);
    if (bossKind) {
      e.hitInvulnTimer = 1.0;
      this.checkBossPhaseTransition(e, prevHp);
      // Accumulate Boss Stagger & Trigger Guard Break
      const boonStaggerMult = computeBoonBonuses(this.activeBoons).staggerMult;
      const talStaggerMult =
        this.equippedTalisman === 'coroa_soberana'
          ? 1.25
          : this.equippedTalisman === 'selo_cinza'
            ? 1.1
            : 1;
      const incStagger = staggerGain * boonStaggerMult * talStaggerMult * (this.overdriveTimer > 0 ? 1.5 : 1);
      if (this.overdriveTimer > 0) this.unlockMechanic('OVERDRIVE_FINISHER');
      const maxStag = e.maxStagger ?? getAnyBossBestiary(bossKind)?.maxStagger ?? 5;
      this.unlockMechanic('BOSS_STAGGER_BAR');

      if (e.bossSubState !== 'staggered') {
        e.stagger = (e.stagger ?? 0) + incStagger;
        if (e.stagger >= maxStag) {
          e.stagger = maxStag;
          e.bossSubState = 'staggered';
          e.state = 'idle';
          e.vx = 0;
          e.vy = 0;
          e.timer = 2.45;
          e.recoverTimer = 0;
          this.hitstop = 0.09;
          this.trauma = Math.min(1, this.trauma + 0.78);
          this.chromaticShakeTimer = 0.26;
          this.speedLinesTimer = 0.32;
          this.hitFlashTimer = 0.24;
          this.hitFlashColor = '#ffe066';
          this.hitFlashX = hitCx;
          this.hitFlashY = hitCy;
          this.unlockMechanic('BOSS_GUARD_BREAK');
          this.unlockMechanic('BOSS_DIZZY_STARS');
          this.spawnFloatingText(hitCx, e.y - 16, 'QUEBRA DE GUARDA!', '#ffe066');
          this.spawnImpactSlash(hitCx, hitCy, -Math.PI * 0.25, 44, 5, '#ffe066', true, 0.26);
          this.spawnShockwave(hitCx, hitCy, 52, '#ffe066', 0.38);
          this.spawnShockwave(hitCx, hitCy, 30, '#ffffff', 0.24);
          this.burstParticles(hitCx, hitCy, 26, '#ffe066', 155);
          this.burstParticles(hitCx, hitCy, 14, '#ffffff', 120);
          // Drop collectible Crown Shard!
          this.liveEntities.push({
            def: { id: `shard_${Math.round(this.elapsedSeconds * 100)}_${Math.random()}`, kind: 'boss_crown_shard', x: e.x + 4, y: e.y + 8 },
            x: e.x + 4,
            y: Math.min((this.currentRoom.rows - 4) * TILE_SIZE, e.y + 16),
            w: 12,
            h: 12,
            vx: 0,
            vy: 0,
            homeX: e.x + 4,
            homeY: e.y + 16,
            timer: 0,
            cooldown: 0,
            state: 'idle',
            hp: 1,
            maxHp: 1,
            dir: 1,
            flash: 0.25,
            koTimer: 0,
            collected: false,
          });
          gameAudio.playRelic();
          return;
        }
      }

      if (weaknessHit) {
        this.spawnFloatingText(hitCx, e.y - 14, `FRAQUEZA -${totalDmg}!`, '#4df0c0');
      } else {
        this.spawnFloatingText(hitCx, e.y - 8, `-${totalDmg}`, '#ffd27d');
      }
      this.spawnShockwave(hitCx, hitCy, 24, elemCol, 0.24);
      this.spawnShockwave(hitCx, hitCy, 13, '#ffffff', 0.16);

      if (e.bossSubState !== 'staggered') {
        this.triggerBossRetreat(e);
      }
    } else {
      this.spawnFloatingText(hitCx, e.y - 6, isParry ? `CONTRA -${totalDmg}!` : `-${totalDmg}`, '#ffd27d');
      this.spawnShockwave(hitCx, hitCy, 22, elemCol, 0.22);
      this.spawnShockwave(hitCx, hitCy, 12, '#ffffff', 0.15);
    }
    this.burstParticles(hitCx, hitCy, 12, '#ffd27d', 95);
    gameAudio.playEnemyHit(false);
  }

  private checkBossPhaseTransition(e: LiveEntity, prevHp: number): void {
    const prevPhase = this.getBossPhase(prevHp, e.maxHp);
    const nextPhase = this.getBossPhase(e.hp, e.maxHp);
    if (nextPhase > prevPhase) {
      const cx = e.x + e.w * 0.5;
      const cy = e.y + e.h * 0.5;
      this.unlockMechanic('BOSS_THREE_PHASES');
      this.unlockMechanic('BOSS_PHASE_CROWN');
      if (nextPhase === 2) this.unlockMechanic('BOSS_PHASE_II_SURGE');
      if (nextPhase === 3) this.unlockMechanic('BOSS_PHASE_III_APEX');
      const color = nextPhase === 3 ? '#ff2e63' : '#ff8833';
      const label = nextPhase === 3 ? 'FASE III · FÚRIA!' : 'FASE II · ESCALADA!';
      this.trauma = Math.min(1, this.trauma + 0.65);
      this.chromaticShakeTimer = 0.24;
      this.speedLinesTimer = 0.34;
      this.hitFlashTimer = 0.2;
      this.hitFlashColor = color;
      this.hitFlashX = cx;
      this.hitFlashY = cy;
      this.spawnFloatingText(cx, e.y - 10, label, color);
      this.spawnImpactSlash(cx, cy, Math.PI * 0.15, 42, 5, color, true, 0.26);
      this.spawnShockwave(cx, cy, nextPhase === 3 ? 52 : 40, color, 0.36);
      this.spawnShockwave(cx, cy, 26, '#ffffff', 0.22);
      this.burstParticles(cx, cy, 28, color, 150);
      gameAudio.playBossRoar();
    }
  }

  public isGoalLocked(): boolean {
    return this.liveEntities.some((o) => isBossKind(o.def.kind) && o.state !== 'dead');
  }

  public handleEnemyKilled(e: LiveEntity, stomping: boolean): void {
    const isBoss = isBossKind(e.def.kind);
    const cx = e.x + e.w * 0.5;
    const cy = e.y + e.h * 0.5;
    e.state = 'dead';
    this.addCombo(isBoss ? 5 : 2, isBoss ? 200 : 50);
    this.grantMasteryXp(isBoss ? 45 : 8);
    this.grantPlayerXp(isBoss ? 50 : 8);

    const lvCoins = getPlayerLevelBonuses(this.getPlayerLevel()).coinBonusFlat;
    let coinBonus = isBoss ? 8 + lvCoins : e.isElite ? 4 + lvCoins : 0;
    if (this.playMode === 'glass_cannon') coinBonus += 2;
    if (this.playMode === 'survival' || this.playMode === 'tower') {
      if (this.playMode === 'survival') this.survivalKills += 1;
      coinBonus += isBoss ? 5 : 1;
    }
    if (coinBonus > 0) {
      this.addAstralCoins(coinBonus);
    }
    if (e.isElite || isBoss) {
      this.advanceSideQuest('hunt_elites', 1);
      if (e.isElite) this.grantPlayerXp(28);
    }
    this.missionStats.enemiesDefeated += 1;
    this.soulCharge = Math.min(100, this.soulCharge + (isBoss ? 30 : e.isElite ? 22 : 14));
    const matDrops = getBiomeMaterialDrops(
      this.currentRoom.biome,
      isBoss,
      Boolean(e.isElite),
      Math.floor(e.x + this.elapsedSeconds)
    );
    for (const dr of matDrops) {
      this.craftingMaterials[dr.id] = (this.craftingMaterials[dr.id] ?? 0) + dr.qty;
    }
    this.grantPetBondXp(isBoss ? 24 : 5);
    if (!isBoss) {
      this.enemyKills[e.def.kind] = (this.enemyKills[e.def.kind] ?? 0) + 1;
      if (e.def.kind === 'enemy_spore_splitter') {
        this.spawnProjectile(e.x + 6, e.y + 4, -55, -105, '#4ade80', 180, false);
        this.spawnProjectile(e.x + 6, e.y + 4, 55, -105, '#4ade80', 180, false);
      } else if (e.def.kind === 'enemy_soul_lantern') {
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI * 2 * k) / 6;
          this.spawnProjectile(e.x + 6, e.y + 6, Math.cos(a) * 84, Math.sin(a) * 84, '#5eead4', 0, false);
        }
      }
    } else {
      this.missionStats.bossesDefeated += 1;
    }

    const finisherColor = isBoss ? '#ffe47a' : '#ff6699';
    this.hitstop = Math.max(this.hitstop, isBoss ? 0.12 : 0.065);
    this.trauma = Math.min(1, this.trauma + (isBoss ? 0.92 : 0.58));
    this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, isBoss ? 0.34 : 0.16);
    this.speedLinesTimer = Math.max(this.speedLinesTimer, isBoss ? 0.45 : 0.18);
    this.hitFlashTimer = isBoss ? 0.25 : 0.15;
    this.hitFlashColor = finisherColor;
    this.hitFlashX = cx;
    this.hitFlashY = cy;
    this.onRumble?.(isBoss ? 180 : 95, isBoss ? 0.45 : 0.28, isBoss ? 0.9 : 0.55);

    const label = isBoss
      ? 'CHEFE DERROTADO!'
      : stomping
        ? this.stompChain > 1
          ? `PISAO x${this.stompChain}!`
          : 'PISAO!'
        : 'ABATE!';
    this.spawnFloatingText(cx, e.y - 8, label, finisherColor);
    this.spawnImpactSlash(cx, cy, Math.random() * Math.PI, isBoss ? 48 : 30, isBoss ? 5 : 4, finisherColor, true, isBoss ? 0.28 : 0.22);
    this.spawnShockwave(cx, cy, isBoss ? 58 : 30, finisherColor, isBoss ? 0.44 : 0.28);
    this.spawnShockwave(cx, cy, isBoss ? 36 : 18, '#ffffff', isBoss ? 0.3 : 0.18);
    if (isBoss) {
      this.spawnShockwave(cx, cy, 74, '#ff5588', 0.52);
    }
    this.burstParticles(cx, cy, isBoss ? 48 : 24, finisherColor, isBoss ? 175 : 135);
    this.burstParticles(cx, cy, isBoss ? 24 : 12, '#ffffff', isBoss ? 140 : 105);
    gameAudio.playEnemyHit(true);

    if (isBoss) {
      this.bestiaryDefeats[e.def.kind] = (this.bestiaryDefeats[e.def.kind] ?? 0) + 1;
      this.unlockAchievement('first_blood');
      for (const b of this.beams) b.active = false;
      for (const pr of this.projectiles) if (!pr.friendly) pr.active = false;
      if (this.playMode === 'boss_rush') {
        this.bossRushAdvanceTimer = 1.45;
        this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
        this.player.stamina = this.player.maxStamina;
        this.player.heroShieldReady = true;
      } else if (this.playMode === 'survival') {
        this.liveEntities.push({
          def: { id: `surv_heal_${this.survivalWave}`, kind: 'heal_orb', x: e.x, y: Math.min((this.currentRoom.rows - 4) * TILE_SIZE, e.y + 8) },
          x: e.x,
          y: Math.min((this.currentRoom.rows - 4) * TILE_SIZE, e.y + 8),
          w: 14,
          h: 14,
          vx: 0,
          vy: 0,
          homeX: e.x,
          homeY: e.y + 8,
          timer: 0,
          cooldown: 0,
          state: 'idle',
          hp: 1,
          maxHp: 1,
          dir: 1,
          flash: 0.25,
          koTimer: 0,
          collected: false,
        });
        this.unlockMechanic('ARENA_RIFT_SYNERGY');
        this.unlockMechanic('SURVIVAL_ARMORY_DROPS');
        this.triggerBoonDraft();
      } else if (this.activeBoons.length < 6) {
        this.triggerBoonDraft();
      }
      this.saveProgress();
      this.emitHud();
    }
  }

  private advanceBossRush(): void {
    this.bossRushAdvanceTimer = 0;
    this.bossRushIndex += 1;
    if (this.bossRushIndex >= BOSS_ORDER.length) {
      this.victory = true;
      this.bestBossRushSeconds =
        this.bestBossRushSeconds === null
          ? this.elapsedSeconds
          : Math.min(this.bestBossRushSeconds, this.elapsedSeconds);
      this.mode = 'gameover';
      gameAudio.playVictory();
      this.saveProgress();
      this.emitHud();
      return;
    }
    const nextCh = this.chapters[this.bossRushIndex] ?? this.chapters[0];
    const nextBossRoom = nextCh.stages[nextCh.stages.length - 1];
    this.chapterIndex = nextCh.index;
    this.enterRoom(nextBossRoom.id, true, { dx: 1, dy: 0 });
    this.player.x = this.currentRoom.spawnX;
    this.player.y = this.currentRoom.spawnY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.heroShieldReady = true;
    this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
    this.player.stamina = this.player.maxStamina;
    this.ensurePlayerClear();
    this.snapCamera();
    const bMeta = getAnyBossMeta(BOSS_ORDER[this.bossRushIndex]);
    this.bannerTitle = `RUSH DOS CHEFOES (${this.bossRushIndex + 1}/${BOSS_ORDER.length})`;
    this.bannerSub = `${bMeta.name} · ${bMeta.title}`;
    this.bannerTimer = 3.0;
    this.emitHud();
  }

  public spawnSurvivalWave(): void {
    this.survivalWave += 1;
    this.bestSurvivalWave = Math.max(this.bestSurvivalWave, this.survivalWave);
    if (this.survivalWave > 1) this.grantPlayerXp(22);
    if (this.survivalWave >= 5) this.unlockAchievement('survival_5');
    gameAudio.playWaveStart();

    // Refresh arena pickups for player sustain
    for (const e of this.liveEntities) {
      if (e.def.kind === 'dash_crystal' || e.def.kind === 'double_dash_crystal' || e.def.kind === 'shield_orb') {
        e.cooldown = 0;
      }
    }
    // Keep only arena non-enemy entities when spawning fresh wave
    this.liveEntities = this.liveEntities.filter(
      (e) => !e.def.kind.startsWith('enemy_') && !isBossKind(e.def.kind)
    );

    const wave = this.survivalWave;
    const isBossWave = wave % 3 === 0;
    const spawnSpots: [number, number][] = [
      [12 * TILE_SIZE, 15 * TILE_SIZE],
      [44 * TILE_SIZE, 15 * TILE_SIZE],
      [29 * TILE_SIZE, 11 * TILE_SIZE],
      [14 * TILE_SIZE, 7 * TILE_SIZE],
      [44 * TILE_SIZE, 7 * TILE_SIZE],
      [20 * TILE_SIZE, 20 * TILE_SIZE],
      [38 * TILE_SIZE, 20 * TILE_SIZE],
    ];

    if (isBossWave) {
      const bKind = BOSS_ORDER[(Math.floor(wave / 3) - 1) % BOSS_ORDER.length];
      const bMeta = getAnyBossMeta(bKind);
      const def: RoomEntityDef = {
        id: `wave_${wave}_boss`,
        kind: bKind,
        x: 29 * TILE_SIZE,
        y: 8 * TILE_SIZE,
      };
      this.liveEntities.push({
        def,
        x: def.x,
        y: def.y,
        w: 22,
        h: 24,
        vx: 0,
        vy: 0,
        homeX: def.x,
        homeY: def.y,
        timer: 0,
        cooldown: 1.0,
        state: 'idle',
        hp: bMeta.maxHp,
        maxHp: bMeta.maxHp,
        dir: -1,
        flash: 0,
        koTimer: 0,
        collected: false,
        attackIdx: 0,
        hitInvulnTimer: 0,
        immunePopCd: 0,
      });
      this.spawnShockwave(def.x + 11, def.y + 12, 42, bMeta.accentColor, 0.38);
      gameAudio.playBossRoar();
      this.bannerTitle = `ONDA ${wave} · DESAFIO DE CHEFE!`;
      this.bannerSub = `${bMeta.name} entrou no Coliseu`;
    } else {
      this.bannerTitle = `ONDA ${wave}`;
      this.bannerSub = 'Elimine todos os inimigos do Coliseu!';
    }
    this.bannerTimer = 2.6;

    const pool: RoomEntityDef['kind'][] = [
      'enemy_crawler',
      'enemy_wisp',
      'enemy_drone',
      'enemy_spark_beetle',
      'enemy_phantom',
      'enemy_laser_eye',
      'enemy_slime_king',
      'enemy_sand_wraith',
      'enemy_bone_knight',
      'enemy_alchemist',
      'enemy_frost_valkyrie',
      'enemy_mirror_orb',
      'enemy_rift_stalker',
      'enemy_cryo_turret',
      'enemy_chrono_weaver',
      'enemy_void_leech',
      'enemy_shield_phalanx',
      'enemy_chain_tesla',
      'enemy_spore_splitter',
      'enemy_prism_cherub',
      'enemy_blade_dancer',
      'enemy_ember_phoenix',
      'enemy_anchor_brute',
      'enemy_solar_acolyte',
      'enemy_crystal_gargoyle',
      'enemy_abyss_knight',
    ];
    const count = isBossWave ? 2 : Math.min(7, 2 + Math.floor(wave * 0.85));
    for (let i = 0; i < count; i++) {
      const [sx, sy] = spawnSpots[(i + wave) % spawnSpots.length];
      const k = pool[(i * 3 + wave) % pool.length];
      const maxHp =
        k === 'enemy_abyss_knight'
          ? 3
          : k === 'enemy_slime_king' ||
              k === 'enemy_bone_knight' ||
              k === 'enemy_shield_phalanx' ||
              k === 'enemy_anchor_brute' ||
              k === 'enemy_crystal_gargoyle'
            ? 2
            : 1;
      this.liveEntities.push({
        def: { id: `wave_${wave}_e${i}`, kind: k, x: sx, y: sy, patrolDist: 28 },
        x: sx,
        y: sy,
        w: 12,
        h: 12,
        vx: 0,
        vy: 0,
        homeX: sx,
        homeY: sy,
        timer: 0,
        cooldown: 0.8 + i * 0.25,
        state: 'idle',
        hp: maxHp,
        maxHp,
        dir: sx > this.player.x ? -1 : 1,
        flash: 0,
        koTimer: 0,
        collected: false,
      });
      this.spawnShockwave(sx + 6, sy + 6, 20, '#52e5ff', 0.24);
    }
    this.saveProgress();
    this.emitHud();
  }

  private stepBossEntity(e: LiveEntity, enemyDt: number): void {
    const p = this.player;
    const kind = e.def.kind;
    if (!isBossKind(kind)) return;

    this.unlockMechanic('BOSS_PHASES');
    this.unlockMechanic('BOSS_SPRING_STEERING');
    this.unlockMechanic('BOSS_PERCH_RESPECT');
    const phaseStats = computeBossPhaseStats(e.hp, e.maxHp);
    const bossPhase = phaseStats.phase;
    const phase2 = bossPhase >= 2;
    const phase3 = bossPhase >= 3;
    const atkIdx = (e.attackIdx ?? 0) % 3;
    const roomW = this.currentRoom.cols * TILE_SIZE;
    const roomH = this.currentRoom.rows * TILE_SIZE;
    const cx = e.x + e.w * 0.5;
    const cy = e.y + e.h * 0.5;

    // Record smooth motion afterimage trail when moving rapidly
    e.trail = e.trail ?? [];
    if (e.state === 'retreat' || e.state === 'active' || e.bossSubState === 'lunge') {
      e.trail.push({ x: e.x, y: e.y });
      if (e.trail.length > 6) e.trail.shift();
    } else if (e.trail.length > 0) {
      e.trail.shift();
    }

    // STAGGERED (Guard Broken!) state: boss lowers to reachable altitude for 2.45s punish
    if (e.bossSubState === 'staggered') {
      e.timer -= enemyDt;
      const perchY = Math.min(roomH - 42, Math.max(e.homeY, p.y - 6));
      const steered = stepSmoothVelocity(e.x, e.y, e.vx, e.vy, e.x, perchY, enemyDt, 160, 7.0, 95);
      e.x = Math.max(24, Math.min(roomW - 46, steered.x));
      e.y = Math.max(24, Math.min(roomH - 36, steered.y));
      e.vx = steered.vx;
      e.vy = steered.vy;
      if (e.timer <= 0) {
        e.bossSubState = 'orbit';
        e.stagger = 0;
        e.state = 'idle';
        e.cooldown = 0.65;
      }
      return;
    }

    if (e.state === 'retreat') {
      e.timer -= enemyDt;
      const rate = 1 - Math.exp(-9.5 * enemyDt);
      if (e.tx !== undefined && e.ty !== undefined) {
        e.x += (e.tx - e.x) * rate;
        // Parabolic arc leap curve
        const arcLift = Math.sin(Math.max(0, Math.min(1, e.timer / 0.56)) * Math.PI) * 16;
        e.y += (e.ty - arcLift - e.y) * rate;
        e.y = Math.max(24, Math.min(roomH - 40, e.y));
      }
      if (Math.random() < 0.75) {
        const meta = getAnyBossMeta(kind);
        this.spawnParticle(cx, cy, (Math.random() - 0.5) * 24, -14, meta.accentColor, 0.24, 2, 0);
      }
      if (e.timer <= 0) {
        if (e.tx !== undefined && e.ty !== undefined) {
          e.x = e.tx;
          e.y = e.ty;
        }
        e.vx = 0;
        e.vy = 0;
        e.state = 'idle';
        e.bossSubState = 'orbit';
        e.cooldown = (phase3 ? 0.5 : phase2 ? 0.68 : 0.88);
      }
      return;
    }

    if (e.state === 'idle') {
      e.timer += enemyDt;
      if (e.recoverTimer && e.recoverTimer > 0) {
        e.recoverTimer = Math.max(0, e.recoverTimer - enemyDt);
        e.bossSubState = 'recover';
        this.unlockMechanic('BOSS_RECOVER_WINDOW');
        // Gently decelerate & hover slightly lower during punish window
        const recY = Math.min(roomH - 42, Math.max(36, p.y - 12));
        const recSteer = stepSmoothVelocity(e.x, e.y, e.vx, e.vy, e.x, recY, enemyDt, 140, 8.0, 80);
        e.x = Math.max(26, Math.min(roomW - 48, recSteer.x));
        e.y = Math.max(24, Math.min(roomH - 38, recSteer.y));
        e.vx = recSteer.vx;
        e.vy = recSteer.vy;
      } else {
        e.bossSubState = Math.abs(p.x - e.x) > 135 ? 'chase' : 'orbit';
        const anchor = computeBossDesiredAnchor({
          homeX: e.homeX,
          homeY: e.homeY,
          playerX: p.x + 4,
          playerY: p.y + 5,
          roomWidth: roomW,
          roomHeight: roomH,
          phase: bossPhase,
          time: e.timer,
          preferredDist: kind === 'boss_sentinel' || kind === 'boss_automaton' ? 84 : 76,
          bobAmplitude: kind === 'boss_sentinel' ? 12 : 16,
        });
        const steer = stepSmoothVelocity(
          e.x,
          e.y,
          e.vx,
          e.vy,
          anchor.x - e.w * 0.5,
          anchor.y - e.h * 0.5,
          enemyDt,
          290 * phaseStats.speedMult,
          5.2,
          140 * phaseStats.speedMult
        );
        e.x = Math.max(24, Math.min(roomW - 48, steer.x));
        e.y = Math.max(22, Math.min(roomH - 38, steer.y));
        e.vx = steer.vx;
        e.vy = steer.vy;
      }
      e.dir = p.x + 4 < cx ? -1 : 1;

      if (e.cooldown <= 0 && (!e.recoverTimer || e.recoverTimer <= 0)) {
        e.state = 'windup';
        e.bossSubState = 'windup';
        e.timer = phase3 ? 0.38 : phase2 ? 0.46 : 0.58;
        e.aimX = p.x + 4;
        e.aimY = p.y + 5;
        this.unlockMechanic('BOSS_WINDUP_TELEGRAPH');
        const meta = getAnyBossMeta(kind);

        // Queue telegraphs cleanly using aimX/aimY (never clobbering vx/vy!)
        if (kind === 'boss_sentinel') {
          if (atkIdx === 1) {
            const laneY = Math.max(32, Math.min(roomH - 36, p.y + 5));
            e.aimY = laneY;
            this.spawnHazardBeam(24, laneY, roomW - 24, laneY, 8, meta.accentColor, e.timer + 0.12, 0.14);
            if (phase3) {
              const altY = Math.max(32, Math.min(roomH - 36, laneY - 34));
              this.spawnHazardBeam(24, altY, roomW - 24, altY, 7, '#ff4d7d', e.timer + 0.12, 0.2);
            }
          }
        } else if (kind === 'boss_mycelium') {
          if (atkIdx === 1) {
            const count = phase3 ? 5 : phase2 ? 4 : 3;
            for (let i = 0; i < count; i++) {
              const bx = Math.max(44, Math.min(roomW - 44, p.x + 4 + (i - (count - 1) / 2) * 40));
              this.spawnHazardBeam(bx, roomH - 16, bx, 24, 10, '#4df0c0', e.timer + 0.1, 0.42);
            }
          }
        } else if (kind === 'boss_glacier') {
          if (atkIdx === 0) {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            this.spawnHazardBeam(cx, cy, cx + ux * 260, cy + uy * 260, 8, '#7ce8ff', e.timer + 0.08, 0.42);
            if (phase2) {
              this.spawnHazardBeam(cx, cy, cx + (ux - uy * 0.35) * 240, cy + (uy + ux * 0.35) * 240, 7, '#a5f3fc', e.timer + 0.08, 0.42);
            }
            if (phase3) {
              this.spawnHazardBeam(cx, cy, cx + (ux + uy * 0.35) * 240, cy + (uy - ux * 0.35) * 240, 7, '#ffffff', e.timer + 0.08, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_ignis_rex') {
          if (atkIdx === 0) {
            const count = phase3 ? 6 : phase2 ? 5 : 3;
            for (let i = 0; i < count; i++) {
              const bx = 56 + ((roomW - 112) * i) / (count - 1);
              this.spawnHazardBeam(bx, roomH - 16, bx, 32, 12, '#ff6622', e.timer + 0.12, 0.45);
            }
          }
        } else if (kind === 'boss_astral_oracle') {
          if (atkIdx === 0) {
            const tx = Math.max(48, Math.min(roomW - 72, p.x < roomW * 0.5 ? roomW * 0.72 : roomW * 0.25));
            const ty = 56;
            e.aimX = tx;
            e.aimY = ty;
            this.spawnShockwave(tx + 11, ty + 12, 24, '#d580ff', e.timer);
          }
        } else if (kind === 'boss_sakura') {
          if (atkIdx === 0) {
            const laneY = Math.max(32, Math.min(roomH - 36, p.y + 5));
            e.aimY = laneY;
            this.spawnHazardBeam(24, laneY, roomW - 24, laneY, 7, '#ff70a6', e.timer + 0.1, 0.14);
          } else if (atkIdx === 2) {
            const tx = Math.max(48, Math.min(roomW - 72, p.x < roomW * 0.5 ? roomW * 0.74 : roomW * 0.24));
            const ty = 64;
            e.aimX = tx;
            e.aimY = ty;
            this.spawnShockwave(tx + 11, ty + 12, 24, '#ffd1dc', e.timer);
          }
        } else if (kind === 'boss_leviathan') {
          if (atkIdx === 0) {
            const count = phase3 ? 6 : phase2 ? 5 : 3;
            for (let i = 0; i < count; i++) {
              const bx = 56 + ((roomW - 112) * i) / (count - 1);
              this.spawnHazardBeam(bx, roomH - 16, bx, 24, 11, '#4de1ff', e.timer + 0.1, 0.44);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_chronos') {
          if (atkIdx === 0) {
            this.spawnHazardBeam(cx - 170, cy - 110, cx + 170, cy + 110, 8, '#ffb84d', e.timer + 0.1, 0.42);
            this.spawnHazardBeam(cx + 170, cy - 110, cx - 170, cy + 110, 8, '#66e6ff', e.timer + 0.1, 0.42);
            if (phase3) {
              this.spawnHazardBeam(24, cy, roomW - 24, cy, 8, '#ff4d7d', e.timer + 0.1, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          } else if (atkIdx === 2) {
            const laneY = Math.max(32, Math.min(roomH - 36, p.y + 5));
            this.spawnHazardBeam(24, laneY, roomW - 24, laneY, 9, '#ffd37a', e.timer + 0.08, 0.36);
          }
        } else if (kind === 'boss_seraph_king') {
          if (atkIdx === 0) {
            const rays = phase3 ? 8 : phase2 ? 6 : 4;
            for (let i = 0; i < rays; i++) {
              const a = (Math.PI * 2 * i) / rays + (this.elapsedSeconds % 1.2);
              this.spawnHazardBeam(cx, cy, cx + Math.cos(a) * 240, cy + Math.sin(a) * 240, 8, '#57f2a8', e.timer + 0.1, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_sphinx') {
          if (atkIdx === 0) {
            const pillars = phase3 ? 5 : phase2 ? 4 : 3;
            for (let i = 0; i < pillars; i++) {
              const bx = 64 + ((roomW - 128) * i) / (pillars - 1);
              this.spawnHazardBeam(bx, 20, bx, roomH - 16, 10, '#fbbf24', e.timer + 0.1, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          } else if (atkIdx === 1) {
            const laneY = Math.max(36, Math.min(roomH - 36, p.y + 5));
            e.aimY = laneY;
            this.spawnHazardBeam(24, laneY, roomW - 24, laneY, 8, '#f97316', e.timer + 0.08, 0.16);
          }
        } else if (kind === 'boss_lich') {
          if (atkIdx === 0) {
            const tx = Math.max(48, Math.min(roomW - 72, p.x < roomW * 0.5 ? roomW * 0.72 : roomW * 0.25));
            const ty = 58;
            e.aimX = tx;
            e.aimY = ty;
            this.spawnShockwave(tx + 11, ty + 12, 24, '#c084fc', e.timer);
          } else if (atkIdx === 2) {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            this.spawnHazardBeam(cx, cy, cx + (dx / len) * 260, cy + (dy / len) * 260, 8, '#5eead4', e.timer + 0.1, 0.4);
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_automaton') {
          if (atkIdx === 0) {
            const lanes = phase3 ? 3 : 2;
            for (let i = 0; i < lanes; i++) {
              const ly = 56 + i * 44;
              this.spawnHazardBeam(24, ly, roomW - 24, ly, 8, '#2dd4bf', e.timer + 0.1, 0.38);
            }
            if (phase2) {
              this.spawnHazardBeam(cx, 20, cx, roomH - 16, 9, '#f43f5e', e.timer + 0.1, 0.38);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_valkyrie') {
          if (atkIdx === 1) {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            this.spawnHazardBeam(cx, cy, cx + ux * 260, cy + uy * 260, 8, '#67e8f9', e.timer + 0.08, 0.38);
            if (phase2) {
              this.spawnHazardBeam(cx, cy, cx + (ux - uy * 0.4) * 240, cy + (uy + ux * 0.4) * 240, 7, '#e879f9', e.timer + 0.08, 0.38);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_canyon_colossus') {
          if (atkIdx === 0) {
            const count = phase3 ? 5 : 3;
            for (let i = 0; i < count; i++) {
              const bx = 58 + ((roomW - 116) * i) / (count - 1);
              this.spawnHazardBeam(bx, roomH - 16, bx, 26, 11, '#fb923c', e.timer + 0.1, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_cyber_archon') {
          if (atkIdx === 0) {
            const lanes = phase3 ? 3 : 2;
            for (let i = 0; i < lanes; i++) {
              const ly = 50 + i * 44;
              this.spawnHazardBeam(24, ly, roomW - 24, ly, 8, '#22d3ee', e.timer + 0.1, 0.38);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_marble_titan') {
          if (atkIdx === 0) {
            const rays = phase3 ? 6 : 4;
            for (let i = 0; i < rays; i++) {
              const a = (Math.PI * 2 * i) / rays + 0.4;
              this.spawnHazardBeam(cx, cy, cx + Math.cos(a) * 250, cy + Math.sin(a) * 250, 9, '#fde047', e.timer + 0.1, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_fen_hydra') {
          if (atkIdx === 0) {
            const jets = phase3 ? 5 : 4;
            for (let i = 0; i < jets; i++) {
              const bx = 56 + ((roomW - 112) * i) / (jets - 1);
              this.spawnHazardBeam(bx, roomH - 16, bx, 28, 10, '#a3e635', e.timer + 0.12, 0.44);
            }
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_star_emperor') {
          if (atkIdx === 0) {
            this.spawnHazardBeam(cx - 170, cy - 110, cx + 170, cy + 110, 9, '#818cf8', e.timer + 0.1, 0.42);
            this.spawnHazardBeam(cx + 170, cy - 110, cx - 170, cy + 110, 9, '#38bdf8', e.timer + 0.1, 0.42);
            this.unlockMechanic('BOSS_LASER');
          }
        } else if (kind === 'boss_twilight_wraith') {
          if (atkIdx === 0) {
            const tx = Math.max(48, Math.min(roomW - 72, p.x < roomW * 0.5 ? roomW * 0.72 : roomW * 0.25));
            const ty = 56;
            e.aimX = tx;
            e.aimY = ty;
            this.spawnShockwave(tx + 11, ty + 12, 24, '#e879f9', e.timer);
          }
        } else if (kind === 'boss_sovereign') {
          if (atkIdx === 0) {
            const count = phase3 ? 7 : phase2 ? 5 : 3;
            for (let i = 0; i < count; i++) {
              const bx = Math.max(48, Math.min(roomW - 48, p.x + 4 + (i - Math.floor(count / 2)) * 42));
              this.spawnHazardBeam(bx, 18, bx, roomH - 16, 10, '#ffe066', e.timer + 0.1, 0.42);
            }
            this.unlockMechanic('BOSS_LASER');
          } else if (atkIdx === 1) {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            this.spawnHazardBeam(cx, cy, cx + (dx / len) * 260, cy + (dy / len) * 260, 9, '#ffd27d', e.timer + 0.08, 0.42);
            if (phase3) {
              this.spawnHazardBeam(24, cy, roomW - 24, cy, 8, '#ff4d7d', e.timer + 0.08, 0.42);
            }
          }
        } else {
          // 30 New Bosses Elemental & Kinetic Telegraphs
          const bMeta = getAnyBossMeta(kind);
          const bWeak = getAnyBossBestiary(kind)?.weaknessElement ?? 'astral';
          const bCol = bMeta.accentColor;
          if (atkIdx === 0) {
            if (bWeak === 'flame' || bWeak === 'frost') {
              const cols = phase3 ? 6 : phase2 ? 4 : 3;
              for (let i = 0; i < cols; i++) {
                const bx = 54 + ((roomW - 108) * i) / Math.max(1, cols - 1);
                this.spawnHazardBeam(bx, roomH - 16, bx, 26, 10, bCol, e.timer + 0.1, 0.4);
              }
            } else if (bWeak === 'volt') {
              const lanes = phase3 ? 3 : 2;
              for (let i = 0; i < lanes; i++) {
                const ly = 52 + i * 44;
                this.spawnHazardBeam(24, ly, roomW - 24, ly, 8, bCol, e.timer + 0.1, 0.38);
              }
            } else {
              const tx = Math.max(48, Math.min(roomW - 72, p.x < roomW * 0.5 ? roomW * 0.72 : roomW * 0.25));
              const ty = 56;
              e.aimX = tx;
              e.aimY = ty;
              this.spawnShockwave(tx + 11, ty + 12, 24, bCol, e.timer);
            }
            this.unlockMechanic('BOSS_LASER');
          } else if (atkIdx === 1) {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            this.spawnHazardBeam(cx, cy, cx + (dx / len) * 260, cy + (dy / len) * 260, 8, bCol, e.timer + 0.09, 0.38);
            this.unlockMechanic('BOSS_LASER');
          }
        }
      }
    } else if (e.state === 'windup') {
      e.timer -= enemyDt;
      // Pull-back anticipation motion during windup
      e.x += (e.dir * -1) * 14 * enemyDt;
      e.vx = 0;
      e.vy = 0;
      if (e.timer <= 0) {
        e.state = 'active';
        e.bossSubState = 'lunge';
        this.unlockMechanic('BOSS_BULLET_HELL_WEAVE');
        const nextCycle = ((e.attackIdx ?? 0) + 1) % 3;
        e.attackIdx = nextCycle;

        if (kind === 'boss_sentinel') {
          if (atkIdx === 0) {
            e.vy = -170;
            e.vx = Math.sign(p.x + 4 - cx || 1) * (phase3 ? 95 : 75);
            e.timer = 0.75;
          } else if (atkIdx === 1) {
            e.y = Math.max(32, Math.min(roomH - 44, (e.aimY ?? e.y) - 12));
            e.vx = (p.x + 4 < cx ? -1 : 1) * (phase3 ? 215 : phase2 ? 195 : 165);
            e.timer = 0.6;
            this.spawnShockwave(cx, cy, 24, '#ff9933', 0.25);
          } else {
            const bolts = phase3 ? 7 : phase2 ? 5 : 3;
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            for (let i = 0; i < bolts; i++) {
              const a = baseA + (i - Math.floor(bolts / 2)) * 0.24;
              this.spawnProjectile(cx, cy, Math.cos(a) * 118, Math.sin(a) * 118, '#ff9933', 0, false, true);
            }
            this.unlockMechanic('BOSS_SHOCKWAVE');
            e.timer = 0.25;
          }
        } else if (kind === 'boss_mycelium') {
          if (atkIdx === 0) {
            const bombs = phase3 ? 7 : phase2 ? 5 : 3;
            for (let i = 0; i < bombs; i++) {
              const vx = (i - Math.floor(bombs / 2)) * 38 + (Math.random() - 0.5) * 18;
              this.spawnProjectile(cx, cy, vx, -135, '#80ff80', 185, false, true);
            }
            e.timer = 0.35;
          } else if (atkIdx === 1) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else {
            const count = phase3 ? 12 : phase2 ? 8 : 6;
            for (let i = 0; i < count; i++) {
              const a = (Math.PI * 2 * i) / count + this.elapsedSeconds;
              this.spawnProjectile(cx, cy, Math.cos(a) * 92, Math.sin(a) * 92, '#4df0c0', 0, false, true);
            }
            this.unlockMechanic('BOSS_SHOCKWAVE');
            e.timer = 0.3;
          }
        } else if (kind === 'boss_glacier') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.52;
          } else if (atkIdx === 1) {
            const hail = phase3 ? 9 : phase2 ? 7 : 5;
            for (let i = 0; i < hail; i++) {
              const hx = 48 + ((roomW - 96) * i) / (hail - 1);
              this.spawnProjectile(hx, 20, 0, 108, '#a5f3fc', 65, false, true);
            }
            e.timer = 0.4;
          } else {
            const count = phase3 ? 12 : phase2 ? 8 : 6;
            for (let i = 0; i < count; i++) {
              const a = (Math.PI * 2 * i) / count;
              this.spawnProjectile(cx, cy, Math.cos(a) * 108, Math.sin(a) * 108, '#7ce8ff', 0, false, true);
            }
            e.timer = 0.35;
          }
        } else if (kind === 'boss_ignis_rex') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else if (atkIdx === 1) {
            const spokes = phase3 ? 12 : phase2 ? 8 : 4;
            for (let i = 0; i < spokes; i++) {
              const a = (Math.PI * 2 * i) / spokes + this.elapsedSeconds;
              this.spawnProjectile(cx, cy, Math.cos(a) * 114, Math.sin(a) * 114, '#ffaa33', 0, false, true);
            }
            e.timer = 0.35;
          } else {
            e.vx = Math.sign(p.x + 4 - cx || 1) * (phase3 ? 195 : phase2 ? 175 : 145);
            e.vy = 22;
            e.timer = 0.65;
          }
        } else if (kind === 'boss_astral_oracle') {
          if (atkIdx === 0) {
            this.burstParticles(cx, cy, 14, '#d580ff', 85);
            e.x = e.aimX ?? e.x;
            e.y = e.aimY ?? e.y;
            this.spawnShockwave(e.x + 11, e.y + 12, 26, '#d580ff', 0.25);
            const ncx = e.x + 11;
            const ncy = e.y + 12;
            this.spawnHazardBeam(24, ncy, roomW - 24, ncy, 8, '#d580ff', 0.45, 0.38);
            this.spawnHazardBeam(ncx, 20, ncx, roomH - 20, 8, '#52e5ff', 0.45, 0.38);
            gameAudio.playBossLaser();
            e.timer = 0.65;
          } else if (atkIdx === 1) {
            const seekers = phase3 ? 4 : phase2 ? 3 : 2;
            for (let i = 0; i < seekers; i++) {
              this.spawnProjectile(cx, cy, (i - (seekers - 1) / 2) * 55, -40, '#f0a3ff', 0, true, true);
            }
            this.unlockMechanic('HOMING_SPARK');
            e.timer = 0.35;
          } else {
            const stars = phase3 ? 14 : phase2 ? 10 : 8;
            for (let i = 0; i < stars; i++) {
              const a = (Math.PI * 2 * i) / stars;
              this.spawnProjectile(cx, cy, Math.cos(a) * 98, Math.sin(a) * 98, i % 2 === 0 ? '#52e5ff' : '#d580ff', 0, false, true);
            }
            e.timer = 0.35;
          }
        } else if (kind === 'boss_sakura') {
          if (atkIdx === 0) {
            e.y = Math.max(32, Math.min(roomH - 44, (e.aimY ?? e.y) - 12));
            e.vx = (p.x + 4 < cx ? -1 : 1) * (phase3 ? 230 : phase2 ? 210 : 180);
            e.timer = 0.55;
            this.spawnShockwave(cx, cy, 26, '#ff70a6', 0.26);
          } else if (atkIdx === 1) {
            const petals = phase3 ? 9 : phase2 ? 7 : 5;
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            for (let i = 0; i < petals; i++) {
              const a = baseA + (i - Math.floor(petals / 2)) * 0.2;
              this.spawnProjectile(cx, cy, Math.cos(a) * 124, Math.sin(a) * 124, i % 2 === 0 ? '#ff70a6' : '#ffd1dc', 0, false, true);
            }
            e.timer = 0.32;
          } else {
            this.burstParticles(cx, cy, 14, '#ff70a6', 90);
            e.x = e.aimX ?? e.x;
            e.y = e.aimY ?? e.y;
            const ncx = e.x + 11;
            const ncy = e.y + 12;
            this.spawnShockwave(ncx, ncy, 28, '#ffd1dc', 0.28);
            const ring = phase3 ? 12 : phase2 ? 8 : 6;
            for (let i = 0; i < ring; i++) {
              const a = (Math.PI * 2 * i) / ring + 0.25;
              this.spawnProjectile(ncx, ncy, Math.cos(a) * 102, Math.sin(a) * 102, '#ff70a6', 0, false, true);
            }
            e.timer = 0.38;
          }
        } else if (kind === 'boss_leviathan') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else if (atkIdx === 1) {
            const pearls = phase3 ? 8 : phase2 ? 6 : 4;
            for (let i = 0; i < pearls; i++) {
              const vx = (i - (pearls - 1) / 2) * 40;
              this.spawnProjectile(cx, cy, vx, -145, '#7cf2ff', 190, false, true);
            }
            e.timer = 0.38;
          } else {
            const ring = phase3 ? 12 : phase2 ? 10 : 8;
            for (let i = 0; i < ring; i++) {
              const a = (Math.PI * 2 * i) / ring;
              this.spawnProjectile(cx, cy, Math.cos(a) * 96, Math.sin(a) * 96, i % 2 === 0 ? '#4de1ff' : '#ff96b8', 0, false, true);
            }
            if (phase2) {
              this.spawnProjectile(cx, cy, 0, -50, '#7cf2ff', 0, true, true);
            }
            this.unlockMechanic('BOSS_SHOCKWAVE');
            e.timer = 0.35;
          }
        } else if (kind === 'boss_chronos') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else if (atkIdx === 1) {
            const cogs = phase3 ? 12 : phase2 ? 10 : 8;
            for (let i = 0; i < cogs; i++) {
              const a = (Math.PI * 2 * i) / cogs + this.elapsedSeconds;
              this.spawnProjectile(cx, cy, Math.cos(a) * 115, Math.sin(a) * 115, i % 2 === 0 ? '#ffb84d' : '#66e6ff', 0, false, true);
            }
            e.timer = 0.35;
          } else {
            gameAudio.playBossLaser();
            e.vx = Math.sign(p.x + 4 - cx || 1) * (phase3 ? 185 : phase2 ? 160 : 130);
            e.vy = 0;
            e.timer = 0.55;
          }
        } else if (kind === 'boss_seraph_king') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else if (atkIdx === 1) {
            const hail = phase3 ? 10 : phase2 ? 8 : 5;
            for (let i = 0; i < hail; i++) {
              const hx = 44 + ((roomW - 88) * i) / (hail - 1);
              this.spawnProjectile(hx, 20, i % 2 === 0 ? 12 : -12, 98, '#57f2a8', 70, false, true);
            }
            e.timer = 0.42;
          } else {
            const blades = phase3 ? 10 : phase2 ? 8 : 5;
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            for (let i = 0; i < blades; i++) {
              const a = baseA + (i - Math.floor(blades / 2)) * 0.22;
              this.spawnProjectile(cx, cy, Math.cos(a) * 120, Math.sin(a) * 120, i % 2 === 0 ? '#ffe985' : '#57f2a8', 0, false, true);
            }
            if (phase2) {
              this.spawnProjectile(cx, cy, 0, -40, '#ffe985', 0, true, true);
            }
            e.timer = 0.38;
          }
        } else if (kind === 'boss_sphinx') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.52;
          } else if (atkIdx === 1) {
            e.y = Math.max(36, Math.min(roomH - 44, (e.aimY ?? e.y) - 12));
            e.vx = (p.x + 4 < cx ? -1 : 1) * (phase3 ? 210 : phase2 ? 185 : 155);
            e.timer = 0.58;
            this.spawnShockwave(cx, cy, 26, '#fbbf24', 0.26);
          } else {
            const sunRing = phase3 ? 12 : phase2 ? 9 : 6;
            for (let i = 0; i < sunRing; i++) {
              const a = (Math.PI * 2 * i) / sunRing + this.elapsedSeconds;
              this.spawnProjectile(cx, cy, Math.cos(a) * 105, Math.sin(a) * 105, i % 2 === 0 ? '#fbbf24' : '#f97316', 0, false, true);
            }
            if (phase3) {
              this.spawnProjectile(cx, cy, -45, -45, '#fde68a', 0, true, true);
              this.spawnProjectile(cx, cy, 45, -45, '#fde68a', 0, true, true);
            }
            this.unlockMechanic('BOSS_SHOCKWAVE');
            e.timer = 0.36;
          }
        } else if (kind === 'boss_lich') {
          if (atkIdx === 0) {
            this.burstParticles(cx, cy, 14, '#c084fc', 85);
            e.x = e.aimX ?? e.x;
            e.y = e.aimY ?? e.y;
            const ncx = e.x + 11;
            const ncy = e.y + 12;
            const bolts = phase3 ? 10 : phase2 ? 8 : 6;
            for (let i = 0; i < bolts; i++) {
              const a = (Math.PI * 2 * i) / bolts;
              this.spawnProjectile(ncx, ncy, Math.cos(a) * 98, Math.sin(a) * 98, i % 2 === 0 ? '#c084fc' : '#5eead4', 0, false, true);
            }
            this.spawnShockwave(ncx, ncy, 28, '#c084fc', 0.28);
            e.timer = 0.38;
          } else if (atkIdx === 1) {
            const skulls = phase3 ? 4 : phase2 ? 3 : 2;
            for (let i = 0; i < skulls; i++) {
              this.spawnProjectile(cx, cy, (i - (skulls - 1) / 2) * 58, -42, '#5eead4', 0, true, true);
            }
            this.unlockMechanic('HOMING_SPARK');
            e.timer = 0.36;
          } else {
            gameAudio.playBossLaser();
            e.timer = 0.52;
          }
        } else if (kind === 'boss_automaton') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.54;
          } else if (atkIdx === 1) {
            const vials = phase3 ? 7 : phase2 ? 5 : 4;
            for (let i = 0; i < vials; i++) {
              const vx = (i - (vials - 1) / 2) * 44;
              this.spawnProjectile(cx, cy, vx, -142, i % 2 === 0 ? '#2dd4bf' : '#f43f5e', 185, false, true);
            }
            e.vx = Math.sign(p.x + 4 - cx || 1) * (phase3 ? 175 : 140);
            e.vy = 0;
            e.timer = 0.55;
          } else {
            const sparks = phase3 ? 12 : phase2 ? 9 : 6;
            for (let i = 0; i < sparks; i++) {
              const a = (Math.PI * 2 * i) / sparks + 0.3;
              this.spawnProjectile(cx, cy, Math.cos(a) * 112, Math.sin(a) * 112, '#f43f5e', 0, false, true);
            }
            e.timer = 0.36;
          }
        } else if (kind === 'boss_valkyrie') {
          if (atkIdx === 0) {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            const spdDive = phase3 ? 225 : phase2 ? 195 : 165;
            e.vx = (dx / len) * spdDive;
            e.vy = (dy / len) * spdDive;
            e.timer = 0.52;
            this.spawnShockwave(cx, cy, 24, '#67e8f9', 0.26);
          } else if (atkIdx === 1) {
            gameAudio.playBossLaser();
            e.timer = 0.5;
          } else {
            const spears = phase3 ? 12 : phase2 ? 9 : 6;
            for (let i = 0; i < spears; i++) {
              const a = (Math.PI * 2 * i) / spears + this.elapsedSeconds;
              this.spawnProjectile(cx, cy, Math.cos(a) * 115, Math.sin(a) * 115, i % 2 === 0 ? '#67e8f9' : '#e879f9', 0, false, true);
            }
            if (phase3) {
              this.spawnProjectile(cx, cy, 0, -50, '#e879f9', 0, true, true);
            }
            e.timer = 0.36;
          }
        } else if (kind === 'boss_canyon_colossus') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else if (atkIdx === 1) {
            const rocks = phase3 ? 7 : phase2 ? 5 : 4;
            for (let i = 0; i < rocks; i++) {
              const vx = (i - (rocks - 1) / 2) * 44;
              this.spawnProjectile(cx, cy, vx, -145, '#fb923c', 185, false, true);
            }
            e.timer = 0.38;
          } else {
            e.vx = Math.sign(p.x + 4 - cx || 1) * (phase3 ? 215 : 175);
            e.vy = 0;
            e.timer = 0.56;
            this.spawnShockwave(cx, cy, 28, '#f97316', 0.28);
          }
        } else if (kind === 'boss_cyber_archon') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.52;
          } else if (atkIdx === 1) {
            const drones = phase3 ? 4 : phase2 ? 3 : 2;
            for (let i = 0; i < drones; i++) {
              this.spawnProjectile(cx, cy, (i - (drones - 1) / 2) * 55, -35, '#22d3ee', 0, true, true);
            }
            e.timer = 0.36;
          } else {
            const bolts = phase3 ? 12 : 8;
            for (let i = 0; i < bolts; i++) {
              const a = (Math.PI * 2 * i) / bolts + this.elapsedSeconds;
              this.spawnProjectile(cx, cy, Math.cos(a) * 116, Math.sin(a) * 116, i % 2 === 0 ? '#22d3ee' : '#f43f5e', 0, false, true);
            }
            e.timer = 0.36;
          }
        } else if (kind === 'boss_marble_titan') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.54;
          } else if (atkIdx === 1) {
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            const spears = phase3 ? 9 : 5;
            for (let i = 0; i < spears; i++) {
              const a = baseA + (i - Math.floor(spears / 2)) * 0.2;
              this.spawnProjectile(cx, cy, Math.cos(a) * 124, Math.sin(a) * 124, '#fde047', 0, false, true);
            }
            e.timer = 0.34;
          } else {
            const dx = p.x + 4 - cx;
            const dy = p.y + 5 - cy;
            const len = Math.hypot(dx, dy) || 1;
            e.vx = (dx / len) * (phase3 ? 210 : 175);
            e.vy = (dy / len) * (phase3 ? 210 : 175);
            e.timer = 0.52;
          }
        } else if (kind === 'boss_fen_hydra') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.54;
          } else if (atkIdx === 1) {
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            for (let i = -2; i <= 2; i++) {
              const a = baseA + i * 0.22;
              this.spawnProjectile(cx, cy, Math.cos(a) * 112, Math.sin(a) * 112, '#a3e635', 0, false, true);
            }
            e.timer = 0.36;
          } else {
            const orbs = phase3 ? 8 : 6;
            for (let i = 0; i < orbs; i++) {
              const vx = (i - (orbs - 1) / 2) * 38;
              this.spawnProjectile(cx, cy, vx, -135, '#84cc16', 175, false, true);
            }
            e.timer = 0.38;
          }
        } else if (kind === 'boss_star_emperor') {
          if (atkIdx === 0) {
            gameAudio.playBossLaser();
            e.timer = 0.54;
          } else if (atkIdx === 1) {
            const comets = phase3 ? 4 : 3;
            for (let i = 0; i < comets; i++) {
              this.spawnProjectile(cx, cy, (i - 1) * 58, -45, '#818cf8', 0, true, true);
            }
            e.timer = 0.36;
          } else {
            const ring = phase3 ? 14 : 10;
            for (let i = 0; i < ring; i++) {
              const a = (Math.PI * 2 * i) / ring;
              this.spawnProjectile(cx, cy, Math.cos(a) * 108, Math.sin(a) * 108, i % 2 === 0 ? '#38bdf8' : '#e879f9', 0, false, true);
            }
            e.timer = 0.38;
          }
        } else if (kind === 'boss_twilight_wraith') {
          if (atkIdx === 0) {
            this.burstParticles(cx, cy, 14, '#e879f9', 85);
            e.x = e.aimX ?? e.x;
            e.y = e.aimY ?? e.y;
            const ncx = e.x + 11;
            const ncy = e.y + 12;
            const ring = phase3 ? 10 : 7;
            for (let i = 0; i < ring; i++) {
              const a = (Math.PI * 2 * i) / ring;
              this.spawnProjectile(ncx, ncy, Math.cos(a) * 104, Math.sin(a) * 104, '#f472b6', 0, false, true);
            }
            e.timer = 0.36;
          } else if (atkIdx === 1) {
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            for (let i = -2; i <= 2; i++) {
              const a = baseA + i * 0.24;
              this.spawnProjectile(cx, cy, Math.cos(a) * 120, Math.sin(a) * 120, '#e879f9', 0, false, true);
            }
            e.timer = 0.34;
          } else {
            this.spawnProjectile(cx, cy, -55, -35, '#a855f7', 0, true, true);
            this.spawnProjectile(cx, cy, 55, -35, '#a855f7', 0, true, true);
            e.timer = 0.38;
          }
        } else if (kind === 'boss_sovereign') {
          if (atkIdx === 0 || atkIdx === 1) {
            gameAudio.playBossLaser();
            e.timer = 0.55;
          } else {
            const count = phase3 ? 12 : phase2 ? 8 : 6;
            for (let i = 0; i < count; i++) {
              const a = (Math.PI * 2 * i) / count;
              this.spawnProjectile(cx, cy, Math.cos(a) * 108, Math.sin(a) * 108, '#ff77aa', 0, false, true);
            }
            this.spawnProjectile(cx, cy, (p.x - e.x) * 0.7, 25, '#ffd27d', 0, true, true);
            if (phase2) {
              this.spawnProjectile(cx, cy, (p.x - e.x) * -0.5, -35, '#ffe066', 0, true, true);
            }
            if (phase3) {
              this.spawnProjectile(cx, cy, 0, 55, '#ff4d7d', 0, true, true);
            }
            this.unlockMechanic('HOMING_SPARK');
            this.unlockMechanic('BOSS_SHOCKWAVE');
            e.timer = 0.4;
          }
        } else {
          // 30 New Bosses Active Attack Patterns
          const bMeta = getAnyBossMeta(kind);
          const bWeak = getAnyBossBestiary(kind)?.weaknessElement ?? 'astral';
          const bCol = bMeta.accentColor;
          if (atkIdx === 0) {
            if (bWeak === 'void' || bWeak === 'astral') {
              this.burstParticles(cx, cy, 14, bCol, 90);
              e.x = e.aimX ?? e.x;
              e.y = e.aimY ?? e.y;
              const ncx = e.x + 11;
              const ncy = e.y + 12;
              const ring = phase3 ? 12 : phase2 ? 9 : 6;
              for (let i = 0; i < ring; i++) {
                const a = (Math.PI * 2 * i) / ring;
                this.spawnProjectile(ncx, ncy, Math.cos(a) * 106, Math.sin(a) * 106, bCol, 0, false, true);
              }
            } else {
              gameAudio.playBossLaser();
            }
            e.timer = 0.48;
          } else if (atkIdx === 1) {
            const bolts = phase3 ? 5 : 3;
            const baseA = Math.atan2(p.y + 5 - cy, p.x + 4 - cx);
            for (let i = 0; i < bolts; i++) {
              const a = baseA + (i - Math.floor(bolts / 2)) * 0.22;
              this.spawnProjectile(cx, cy, Math.cos(a) * 116, Math.sin(a) * 116, bCol, 0, false, true);
            }
            if (phase2) {
              this.spawnProjectile(cx, cy, (p.x - e.x) * 0.65, -35, '#ffd27d', 0, true, true);
            }
            e.timer = 0.36;
          } else {
            const count = phase3 ? 10 : phase2 ? 7 : 5;
            for (let i = 0; i < count; i++) {
              const a = (Math.PI * 2 * i) / count + this.elapsedSeconds * 0.6;
              this.spawnProjectile(cx, cy, Math.cos(a) * 102, Math.sin(a) * 102, bCol, 0, false, true);
            }
            this.spawnShockwave(cx, cy, 34, bCol, 0.3);
            e.timer = 0.4;
          }
        }
      }
    } else if (e.state === 'active') {
      e.timer -= enemyDt;
      if (kind === 'boss_sentinel' && atkIdx === 1) {
        e.vy += 320 * enemyDt;
        e.x = Math.max(36, Math.min(roomW - 60, e.x + e.vx * enemyDt));
        e.y += e.vy * enemyDt;
        if (e.y >= e.homeY + 18) {
          e.y = e.homeY + 18;
          e.vy = 0;
          this.spawnShockwave(cx, e.y + e.h, 30, '#ff9933', 0.28);
          this.spawnProjectile(cx, e.y + e.h - 4, -135, 0, '#ff9933', 0, false, true);
          this.spawnProjectile(cx, e.y + e.h - 4, 135, 0, '#ff9933', 0, false, true);
          e.timer = 0;
        }
      } else if (
        (kind === 'boss_sentinel' && atkIdx === 2) ||
        (kind === 'boss_sakura' && atkIdx === 1) ||
        (kind === 'boss_sphinx' && atkIdx === 2)
      ) {
        e.x = Math.max(32, Math.min(roomW - 56, e.x + e.vx * enemyDt));
        if (Math.random() < 0.45) {
          const pCol = kind === 'boss_sakura' ? '#ff70a6' : kind === 'boss_sphinx' ? '#fbbf24' : '#ffaa33';
          this.spawnParticle(cx, cy, 0, -14, pCol, 0.25, 2, 30);
        }
      } else if (kind === 'boss_ignis_rex' && atkIdx === 0) {
        e.x = Math.max(32, Math.min(roomW - 56, e.x + e.vx * enemyDt));
        e.y = Math.max(40, Math.min(roomH - 44, e.y + e.vy * enemyDt));
        if (Math.random() < 0.16) {
          this.spawnProjectile(cx, cy + 4, 0, 20, '#ff7722', 160, false, true);
        }
      } else if (kind === 'boss_valkyrie' && atkIdx === 1) {
        this.unlockMechanic('BOSS_DIVE_SLICE');
        e.x = Math.max(32, Math.min(roomW - 56, e.x + e.vx * enemyDt));
        e.y = Math.max(28, Math.min(roomH - 44, e.y + e.vy * enemyDt));
        if (Math.random() < 0.4) {
          this.spawnParticle(cx, cy, 0, 0, '#67e8f9', 0.24, 2, 0);
        }
      } else if (
        (kind === 'boss_chronos' && atkIdx === 0) ||
        (kind === 'boss_automaton' && atkIdx === 2) ||
        (kind === 'boss_canyon_colossus' && atkIdx === 0)
      ) {
        e.x = Math.max(32, Math.min(roomW - 56, e.x + e.vx * enemyDt));
      } else if (kind === 'boss_marble_titan' && atkIdx === 0) {
        e.x = Math.max(32, Math.min(roomW - 56, e.x + e.vx * enemyDt));
        e.y = Math.max(28, Math.min(roomH - 44, e.y + e.vy * enemyDt));
      }

      if (e.timer <= 0) {
        e.vx = 0;
        e.vy = 0;
        e.state = 'idle';
        e.bossSubState = 'recover';
        e.recoverTimer = phase3 ? 0.55 : phase2 ? 0.72 : 0.9;
        e.cooldown = phase3 ? 0.85 : phase2 ? 1.15 : 1.5;
      }
    }
  }

  private stepBeams(simDt: number): void {
    const p = this.player;
    const px = p.x + p.w * 0.5;
    const py = p.y + p.h * 0.5;

    for (const b of this.beams) {
      if (!b.active) continue;
      if (b.state === 'windup') {
        b.windup -= simDt;
        if (b.windup <= 0) {
          b.state = 'active';
          this.trauma = Math.min(1, this.trauma + 0.18);
        }
      } else {
        b.activeTime -= simDt;
        if (b.activeTime <= 0) {
          b.active = false;
          continue;
        }
        // Segment-point distance check against player hurtbox
        if (p.invulnTimer <= 0 && p.dashTimer <= 0) {
          const vx = b.x2 - b.x1;
          const vy = b.y2 - b.y1;
          const len2 = vx * vx + vy * vy || 1;
          const t = Math.max(0, Math.min(1, ((px - b.x1) * vx + (py - b.y1) * vy) / len2));
          const cx = b.x1 + t * vx;
          const cy = b.y1 + t * vy;
          const dist = Math.hypot(px - cx, py - cy);
          if (dist < b.width * 0.5 + 2.5) {
            this.killPlayer();
            return;
          }
        }
      }
    }
  }

  private stepProjectiles(simDt: number): void {
    const p = this.player;
    const stasisMult = p.stasisTimer && p.stasisTimer > 0 ? 0.22 : 1;
    const heroDef = getHeroDef(this.heroId);
    for (const pr of this.projectiles) {
      if (!pr.active) continue;
      pr.life -= simDt;
      if (pr.life <= 0) {
        pr.active = false;
        continue;
      }
      const pSlow = !pr.friendly && heroDef.modifiers.slowField && Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5)) < 70 ? 0.72 : 1;
      const pDt = pr.friendly ? simDt : simDt * stasisMult * pSlow;
      if (pr.homing && !pr.friendly) {
        const dx = p.x + 4 - pr.x;
        const dy = p.y + 5 - pr.y;
        const len = Math.hypot(dx, dy) || 1;
        pr.vx += (dx / len) * 90 * pDt;
        pr.vy += (dy / len) * 90 * pDt;
      } else if (pr.homing && pr.friendly) {
        if (this.playMode === 'sandbox_world' && this.sandboxWorld) {
          let bestPos: { x: number; y: number } | null = null;
          let bestD = 280;
          for (const foe of this.sandboxWorld.enemies) {
            if (foe.hp <= 0) continue;
            const d = Math.hypot(foe.x + foe.w * 0.5 - pr.x, foe.y + foe.h * 0.5 - pr.y);
            if (d < bestD) {
              bestD = d;
              bestPos = { x: foe.x + foe.w * 0.5, y: foe.y + foe.h * 0.5 };
            }
          }
          if (bestPos) {
            const tx = bestPos.x - pr.x;
            const ty = bestPos.y - pr.y;
            const len = Math.hypot(tx, ty) || 1;
            pr.vx += (tx / len) * 320 * pDt;
            pr.vy += (ty / len) * 320 * pDt;
          }
        } else {
          let bestTarget: LiveEntity | null = null;
          let bestD = 260;
          for (const e of this.liveEntities) {
            if (e.state === 'dead') continue;
            if (!e.def.kind.startsWith('enemy_') && !isBossKind(e.def.kind)) continue;
            const d = Math.hypot(e.x + e.w * 0.5 - pr.x, e.y + e.h * 0.5 - pr.y);
            if (d < bestD) {
              bestD = d;
              bestTarget = e;
            }
          }
          if (bestTarget) {
            const tx = bestTarget.x + bestTarget.w * 0.5 - pr.x;
            const ty = bestTarget.y + bestTarget.h * 0.5 - pr.y;
            const len = Math.hypot(tx, ty) || 1;
            pr.vx += (tx / len) * 320 * pDt;
            pr.vy += (ty / len) * 320 * pDt;
          }
        }
      }
      pr.vy += pr.gravity * pDt;
      pr.x += pr.vx * pDt;
      pr.y += pr.vy * pDt;

      // Hit walls (unless pierceWalls flagged on boss aerial volleys)
      const tx = Math.floor(pr.x / TILE_SIZE);
      const ty = Math.floor(pr.y / TILE_SIZE);
      if (this.playMode === 'sandbox_world' && this.sandboxWorld) {
        if (tx >= 0 && tx < SANDBOX_COLS && ty >= 0 && ty < SANDBOX_ROWS) {
          if (!pr.pierceWalls && isSandboxSolid(this.sandboxWorld.tiles[ty * SANDBOX_COLS + tx])) {
            pr.active = false;
            this.burstParticles(pr.x, pr.y, 7, pr.color, 55);
            this.burstParticles(pr.x, pr.y, 3, '#ffffff', 40);
            continue;
          }
        } else {
          pr.active = false;
          continue;
        }
      } else if (tx >= 0 && tx < this.currentRoom.cols && ty >= 0 && ty < this.currentRoom.rows) {
        if (!pr.pierceWalls && isTileValueSolid(this.currentRoom.tiles[ty * this.currentRoom.cols + tx])) {
          pr.active = false;
          this.burstParticles(pr.x, pr.y, 7, pr.color, 55);
          this.burstParticles(pr.x, pr.y, 3, '#ffffff', 40);
          continue;
        }
      } else {
        pr.active = false;
        continue;
      }

      // Friendly parried projectile or spirit bolt damages enemies OR bosses!
      if (pr.friendly) {
        const runeB = computeRuneBonuses(this.equippedRunes);
        if (this.playMode === 'sandbox_world' && this.sandboxWorld) {
          for (const foe of this.sandboxWorld.enemies) {
            if (foe.hp <= 0) continue;
            if (Math.hypot(pr.x - (foe.x + foe.w * 0.5), pr.y - (foe.y + foe.h * 0.5)) < pr.radius + 11) {
              pr.active = false;
              this.burstParticles(pr.x, pr.y, 12, '#66ffee', 95);
              this.damageSandboxEnemy(foe, (pr.radius >= 8 ? 2 : 1) + runeB.parryDamageBonus);
              break;
            }
          }
          continue;
        }
        for (const e of this.liveEntities) {
          if (e.state === 'dead') continue;
          if (!e.def.kind.startsWith('enemy_') && !isBossKind(e.def.kind)) continue;
          if (Math.hypot(pr.x - (e.x + e.w * 0.5), pr.y - (e.y + e.h * 0.5)) < pr.radius + 11) {
            pr.active = false;
            this.burstParticles(pr.x, pr.y, 12, '#66ffee', 95);
            const boltElem: ElementType =
              this.equippedSpirit === 'fenix_menor' && pr.color === '#ff6622'
                ? 'flame'
                : this.equippedSpirit === 'fada_crono' && pr.color === '#a89eff'
                  ? 'volt'
                  : this.equippedSpirit === 'dragao_cristal' && pr.color === '#4df0c0'
                    ? 'astral'
                    : getHeroElement(this.heroId);
            this.damageEntity(e, 1 + runeB.parryDamageBonus, boltElem, true);
            break;
          }
        }
        continue;
      }

      // Hit player, Dash Parry (with Homing Ricochet), or Perfect Dodge!
      const pDist = Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5));
      if (!pr.friendly && pDist < pr.radius + 4) {
        if (p.dashTimer > 0) {
          pr.friendly = true;
          pr.homing = true;
          pr.pierceWalls = true;
          pr.vx = -pr.vx * 1.55;
          pr.vy = -pr.vy * 1.55;
          pr.color = '#66ffee';
          p.dashes = Math.max(p.dashes, 1);
          p.invulnTimer = 0.25;
          this.hitstop = 0.055;
          this.trauma = Math.min(1, this.trauma + 0.36);
          this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, 0.14);
          this.hitFlashTimer = 0.14;
          this.hitFlashColor = '#66ffee';
          this.hitFlashX = pr.x;
          this.hitFlashY = pr.y;
          this.onRumble?.(75, 0.25, 0.55);
          this.addCombo(2);
          this.unlockMechanic('DASH_PARRY');
          this.unlockMechanic('PARRY_VAULT');
          this.spawnFloatingText(pr.x, pr.y - 6, 'PARRY!', '#66ffee');
          this.spawnImpactSlash(pr.x, pr.y, Math.atan2(pr.vy, pr.vx), 26, 4, '#66ffee', true, 0.2);
          this.spawnShockwave(pr.x, pr.y, 26, '#66ffee', 0.26);
          this.spawnShockwave(pr.x, pr.y, 15, '#ffffff', 0.18);
          this.burstParticles(pr.x, pr.y, 16, '#66ffee', 110);
          this.burstParticles(pr.x, pr.y, 6, '#ffffff', 85);
          gameAudio.playParry();
        } else if (p.invulnTimer <= 0) {
          pr.active = false;
          if (this.playMode === 'sandbox_world') {
            this.respawnPlayerInSandbox();
          } else {
            this.killPlayer();
          }
          return;
        }
      } else if (
        !pr.friendly &&
        p.dashTimer > 0 &&
        this.perfectDodgeCooldown <= 0 &&
        pDist < pr.radius + (this.equippedTalisman === 'prisma_glacial' ? 19 : 15)
      ) {
        this.perfectDodges += 1;
        this.missionStats.perfectDodges += 1;
        this.advanceSideQuest('style_mastery', 1);
        this.perfectDodgeCooldown = 0.8;
        p.dashes = Math.max(p.dashes, p.maxDashes);
        p.chronoTimer = Math.max(p.chronoTimer, 0.48);
        const etherGain = this.activeBoons.includes('void_siphon') ? 30 : 18;
        if (this.activeBoons.includes('void_siphon')) this.heroSkillCooldown = 0;
        this.overdrive = Math.min(100, this.overdrive + etherGain);
        this.addCombo(2, 130);
        this.unlockMechanic('PERFECT_DODGE');
        this.unlockMechanic('PERFECT_DODGE_COUNTER');
        this.spawnFloatingText(p.x + 4, p.y - 12, 'ESQUIVA PERFEITA!', '#52e5ff');
        this.spawnShockwave(p.x + 4, p.y + 5, 28, '#52e5ff', 0.26);
        gameAudio.playCrystal();
      }
    }
  }

  private triggerHeroSkill(grid: CollisionGrid): void {
    const p = this.player;
    const hero = getHeroDef(this.heroId);
    const heroElem = getHeroElement(hero.id);
    const cdMult = this.getEffectiveSkillCdMult();
    this.heroSkillCooldown = hero.skillCooldown * cdMult;
    this.addCombo(1);

    const evoTier = this.heroEvolutions[hero.id] ?? 0;
    if (evoTier >= 3) {
      for (const dir of [-1, 1]) {
        const pr = this.projectiles[this.projHead];
        this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
        pr.active = true;
        pr.x = p.x + 4;
        pr.y = p.y + 4;
        pr.vx = dir * 210;
        pr.vy = -24;
        pr.radius = 3;
        pr.gravity = 0;
        pr.homing = true;
        pr.friendly = true;
        pr.pierceWalls = true;
        pr.color = '#ffe066';
        pr.life = 2.0;
      }
    }

    if (hero.id === 'lyra') {
      p.stamina = p.maxStamina;
      p.vy = -128 * p.gravityDir;
      p.scaleX = 0.78;
      p.scaleY = 1.25;
      this.spawnShockwave(p.x + 4, p.y + 6, 26, hero.accentColor, 0.28);
      this.burstParticles(p.x + 4, p.y + 6, 16, hero.accentColor, 85);
      gameAudio.playJump(true);
    } else if (hero.id === 'zephyr') {
      p.vy = -168 * p.gravityDir;
      p.dashes = Math.max(p.dashes, p.maxDashes);
      p.scaleX = 0.72;
      p.scaleY = 1.32;
      this.spawnShockwave(p.x + 4, p.y + p.h, 28, '#4df0c0', 0.28);
      this.burstParticles(p.x + 4, p.y + p.h, 20, '#4df0c0', 110);
      gameAudio.playSpring();
    } else if (hero.id === 'nyx') {
      let stepDist = 0;
      const roomMaxX =
        (this.playMode === 'sandbox_world' ? SANDBOX_WORLD_WIDTH_PX : this.currentRoom.cols * TILE_SIZE) - 2;
      for (let d = 44; d >= 8; d -= 4) {
        const testX = p.x + p.facing * d;
        if (testX >= 2 && testX + p.w <= roomMaxX && !overlapsSolid(testX, p.y, p.w, p.h, grid, p)) {
          stepDist = d;
          break;
        }
      }
      this.spawnGhost();
      this.spawnShockwave(p.x + 4, p.y + 5, 22, '#d580ff', 0.25);
      this.burstParticles(p.x + 4, p.y + 5, 14, '#d580ff', 80);
      p.x += p.facing * stepDist;
      p.vy = 0;
      p.invulnTimer = Math.max(p.invulnTimer, 0.25);
      this.spawnGhost();
      this.spawnShockwave(p.x + 4, p.y + 5, 24, '#ff66dd', 0.25);
      this.burstParticles(p.x + 4, p.y + 5, 16, '#ff66dd', 95);
      gameAudio.playDash(true);
    } else if (hero.id === 'ignis') {
      p.dashes = Math.max(p.dashes, p.maxDashes);
      this.hitstop = 0.05;
      this.trauma = Math.min(1, this.trauma + 0.5);
      this.spawnShockwave(p.x + 4, p.y + 5, 42, '#ff7733', 0.32);
      this.burstParticles(p.x + 4, p.y + 5, 28, '#ff7733', 135);
      this.burstParticles(p.x + 4, p.y + 5, 12, '#ffe066', 90);
      if (this.playMode === 'sandbox_world') {
        this.damageSandboxEnemiesInRadius(p.x + 4, p.y + 5, 58, 2);
      }
      for (const e of this.liveEntities) {
        if (e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && Math.hypot(e.x - p.x, e.y - p.y) < 56) {
          this.damageEntity(e, 1, heroElem);
        }
      }
      for (const pr of this.projectiles) {
        if (pr.active && !pr.friendly && Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5)) < 56) {
          pr.active = false;
        }
      }
      gameAudio.playEnemyHit(true);
    } else if (hero.id === 'seraphina') {
      p.featherTimer = 2.4;
      p.airJumpsLeft = p.maxAirJumps;
      p.dashes = Math.max(p.dashes, 1);
      this.spawnShockwave(p.x + 4, p.y + 5, 30, '#ffd27d', 0.3);
      this.burstParticles(p.x + 4, p.y + 5, 22, '#ffd27d', 100);
      gameAudio.playRelic();
    } else if (hero.id === 'volt') {
      p.vx = p.facing * 320;
      p.vy = 0;
      p.dashTimer = 0.16;
      p.dashDirX = p.facing;
      p.dashDirY = 0;
      p.invulnTimer = Math.max(p.invulnTimer, 0.25);
      this.hitstop = 0.04;
      this.trauma = Math.min(1, this.trauma + 0.35);
      this.spawnGhost();
      this.spawnShockwave(p.x + 4, p.y + 5, 32, '#38e8ff', 0.26);
      this.burstParticles(p.x + 4, p.y + 5, 24, '#38e8ff', 130);
      if (this.playMode === 'sandbox_world') {
        this.damageSandboxEnemiesInRadius(p.x + 4, p.y + 5, 48, 2);
      }
      for (const e of this.liveEntities) {
        if (e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && Math.hypot(e.x - p.x, e.y - p.y) < 42) {
          this.damageEntity(e, 1, heroElem);
        }
      }
      gameAudio.playDash(true);
    } else if (hero.id === 'umbra') {
      p.gravityDir = p.gravityDir === 1 ? -1 : 1;
      p.vy *= 0.2;
      p.dashes = Math.max(p.dashes, p.maxDashes);
      p.scaleX = 1.22;
      p.scaleY = 0.78;
      this.spawnShockwave(p.x + 4, p.y + 5, 30, '#a89eff', 0.3);
      this.burstParticles(p.x + 4, p.y + 5, 20, '#a89eff', 95);
      gameAudio.playCrystal();
    } else if (hero.id === 'aegis') {
      p.heroShieldReady = true;
      this.hitstop = 0.04;
      this.spawnShockwave(p.x + 4, p.y + 5, 38, '#60a5fa', 0.32);
      this.burstParticles(p.x + 4, p.y + 5, 22, '#60a5fa', 110);
      for (const pr of this.projectiles) {
        if (pr.active && !pr.friendly && Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5)) < 48) {
          pr.active = false;
        }
      }
      if (this.playMode === 'sandbox_world') {
        this.damageSandboxEnemiesInRadius(p.x + 4, p.y + 5, 48, 2);
      }
      for (const e of this.liveEntities) {
        if (e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && Math.hypot(e.x - p.x, e.y - p.y) < 42) {
          this.damageEntity(e, 1, heroElem);
        }
      }
      gameAudio.playCrystal();
    } else if (hero.id === 'kitsune') {
      p.vx = p.facing * 270;
      p.vy = -105 * p.gravityDir;
      p.dashTimer = 0.16;
      p.invulnTimer = Math.max(p.invulnTimer, 0.28);
      p.dashes = Math.max(p.dashes, p.maxDashes);
      this.spawnGhost();
      this.spawnShockwave(p.x + 4, p.y + 5, 28, '#f472b6', 0.28);
      this.burstParticles(p.x + 4, p.y + 5, 24, '#f472b6', 120);
      gameAudio.playDash(true);
    } else if (hero.id === 'chronos_mage') {
      p.stasisTimer = 2.6;
      p.chronoTimer = 2.6;
      this.unlockMechanic('STASIS_ORB');
      this.spawnFloatingText(p.x + 4, p.y - 8, 'CRONO ESTASE!', '#fbbf24');
      this.spawnShockwave(p.x + 4, p.y + 5, 44, '#fbbf24', 0.34);
      this.burstParticles(p.x + 4, p.y + 5, 24, '#67e8f9', 95);
      gameAudio.playCrystal();
    } else if (hero.id === 'tidal') {
      p.vy = -172 * p.gravityDir;
      p.stamina = p.maxStamina;
      p.dashes = Math.max(p.dashes, 1);
      p.scaleX = 0.75;
      p.scaleY = 1.28;
      this.spawnShockwave(p.x + 4, p.y + p.h, 32, '#22d3ee', 0.28);
      this.burstParticles(p.x + 4, p.y + p.h, 24, '#22d3ee', 110);
      for (const pr of this.projectiles) {
        if (pr.active && !pr.friendly && Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5)) < 46) {
          pr.active = false;
        }
      }
      gameAudio.playSpring();
    } else if (hero.id === 'solaris') {
      p.featherTimer = Math.max(p.featherTimer, 1.5);
      p.dashes = Math.max(p.dashes, p.maxDashes);
      this.hitstop = 0.05;
      this.trauma = Math.min(1, this.trauma + 0.45);
      this.spawnShockwave(p.x + 4, p.y + 5, 48, '#fbbf24', 0.36);
      this.burstParticles(p.x + 4, p.y + 5, 28, '#fbbf24', 135);
      for (const pr of this.projectiles) {
        if (pr.active && !pr.friendly && Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5)) < 64) {
          pr.active = false;
        }
      }
      if (this.playMode === 'sandbox_world') {
        this.damageSandboxEnemiesInRadius(p.x + 4, p.y + 5, 60, 2);
      }
      for (const e of this.liveEntities) {
        if (e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && Math.hypot(e.x - p.x, e.y - p.y) < 58) {
          this.damageEntity(e, 1, heroElem);
        }
      }
      gameAudio.playRelic();
    } else {
      // Dynamic Elemental Signature Skill for all 24 additional Heroes!
      p.dashes = Math.max(p.dashes, p.maxDashes);
      p.stamina = p.maxStamina;
      p.invulnTimer = Math.max(p.invulnTimer, 0.25);
      this.hitstop = 0.04;
      this.trauma = Math.min(1, this.trauma + 0.35);
      this.spawnFloatingText(p.x + 4, p.y - 8, hero.activeSkillName.toUpperCase() + '!', hero.accentColor);
      this.spawnShockwave(p.x + 4, p.y + 5, 44, hero.accentColor, 0.32);
      this.burstParticles(p.x + 4, p.y + 5, 24, hero.particleColor, 120);

      if (hero.modifiers.shieldPerRoom || heroElem === 'frost') {
        p.heroShieldReady = true;
      }
      if (heroElem === 'volt' || heroElem === 'void') {
        p.vx = p.facing * 265;
        p.vy = -88 * p.gravityDir;
        p.dashTimer = 0.14;
        p.dashDirX = p.facing;
        p.dashDirY = 0;
        this.spawnGhost();
      } else if (heroElem === 'astral' || hero.modifiers.glideMaxFall !== null) {
        p.featherTimer = Math.max(p.featherTimer, 1.4);
        p.vy = -138 * p.gravityDir;
      }

      // Fire 2 homing elemental projectiles + damage close enemies
      for (const sign of [-1, 1]) {
        const sp = this.projectiles[this.projHead];
        this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
        sp.active = true;
        sp.x = p.x + 4;
        sp.y = p.y + 4;
        sp.vx = p.facing * 155 + sign * 35;
        sp.vy = -65;
        sp.radius = 3;
        sp.gravity = 0;
        sp.homing = true;
        sp.friendly = true;
        sp.pierceWalls = true;
        sp.color = hero.accentColor;
        sp.life = 2.0;
      }
      for (const pr of this.projectiles) {
        if (pr.active && !pr.friendly && Math.hypot(pr.x - (p.x + 4), pr.y - (p.y + 5)) < 54) {
          pr.friendly = true;
          pr.homing = true;
          pr.vx = -pr.vx * 1.4;
          pr.vy = -pr.vy * 1.4;
          pr.color = hero.accentColor;
        }
      }
      if (this.playMode === 'sandbox_world') {
        this.damageSandboxEnemiesInRadius(p.x + 4, p.y + 5, 58, 2);
      }
      for (const e of this.liveEntities) {
        if (e.state !== 'dead' && (e.def.kind.startsWith('enemy_') || isBossKind(e.def.kind)) && Math.hypot(e.x - p.x, e.y - p.y) < 56) {
          this.damageEntity(e, 1, heroElem);
        }
      }
      gameAudio.playRelic();
    }
    // Echo Clone synchronized burst & Echo Slash Boon extra strike!
    if (this.echoCloneTimer > 0 || this.activeBoons.includes('echo_slash')) {
      const target = this.liveEntities.find((f) => f.state !== 'dead' && (f.def.kind.startsWith('enemy_') || isBossKind(f.def.kind)));
      const originX = this.echoCloneTimer > 0 ? this.echoCloneX : p.x + 4;
      const originY = this.echoCloneTimer > 0 ? this.echoCloneY : p.y + 4;
      const dx = target ? target.x + target.w * 0.5 - originX : p.facing * 120;
      const dy = target ? target.y + target.h * 0.5 - originY : -20;
      const ang = Math.atan2(dy, dx);
      const sp = this.projectiles[this.projHead];
      this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
      sp.active = true;
      sp.x = originX;
      sp.y = originY;
      sp.vx = Math.cos(ang) * 195;
      sp.vy = Math.sin(ang) * 195;
      sp.radius = 4;
      sp.gravity = 0;
      sp.homing = true;
      sp.friendly = true;
      sp.pierceWalls = true;
      sp.color = '#a89eff';
      sp.life = 2.0;
      if (this.echoCloneTimer > 0) this.unlockMechanic('ECHO_CLONE_STRIKE');
    }
    this.emitHud();
  }

  public triggerSoulStrike(): boolean {
    if (this.player.dead || this.soulCharge < 40) return false;
    this.soulCharge = Math.max(0, this.soulCharge - 40);
    const p = this.player;
    const cx = p.x + 4;
    const cy = p.y + 5;
    const elem = this.imbuedElement ?? getHeroElement(this.heroId);
    const elemCol = this.playMode === 'underworld' ? '#fb7185' : ELEMENT_META[elem]?.color ?? '#67e8f9';

    p.invulnTimer = Math.max(p.invulnTimer, 0.28);
    p.vx += p.facing * 52;
    this.hitstop = Math.max(this.hitstop, 0.055);
    this.trauma = Math.min(1, this.trauma + 0.52);
    this.chromaticShakeTimer = Math.max(this.chromaticShakeTimer, 0.16);
    this.speedLinesTimer = Math.max(this.speedLinesTimer, 0.22);
    this.spawnFloatingText(cx, p.y - 10, 'GOLPE DA ALMA!', elemCol);
    this.spawnImpactSlash(cx + p.facing * 12, cy, p.facing > 0 ? 0 : Math.PI, 40, 6, elemCol, true, 0.24);
    this.spawnShockwave(cx, cy, 46, elemCol, 0.34);
    this.spawnShockwave(cx, cy, 24, '#ffffff', 0.2);
    this.burstDirectionalSparks(cx, cy, p.facing > 0 ? 0 : Math.PI, 0.85, 18, elemCol, 155);

    // Clear enemy bullets nearby & reward overdrive
    let clearedBullets = 0;
    for (const pr of this.projectiles) {
      if (pr.active && !pr.friendly && Math.hypot(pr.x - cx, pr.y - cy) < 58) {
        pr.active = false;
        clearedBullets += 1;
        this.burstParticles(pr.x, pr.y, 4, '#ffffff', 50);
      }
    }
    if (clearedBullets > 0) {
      this.overdrive = Math.min(100, this.overdrive + clearedBullets * 6);
    }

    // Spawn piercing crescent Soul Wave projectile
    const wave = this.projectiles[this.projHead];
    this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
    wave.active = true;
    wave.x = cx + p.facing * 6;
    wave.y = cy;
    wave.vx = p.facing * 265;
    wave.vy = 0;
    wave.radius = 10;
    wave.gravity = 0;
    wave.homing = false;
    wave.friendly = true;
    wave.pierceWalls = true;
    wave.color = elemCol;
    wave.life = 0.72;

    // Close-range crescent cleave damages and breaks shields immediately
    const dmg = this.overdriveTimer > 0 ? 3 : 2;
    let soulHits = 0;
    if (this.playMode === 'sandbox_world') {
      soulHits += this.damageSandboxEnemiesInRadius(cx, cy, 56, dmg);
    }
    for (const e of this.liveEntities) {
      if (e.state === 'dead') continue;
      if (!e.def.kind.startsWith('enemy_') && !isBossKind(e.def.kind)) continue;
      const ex = e.x + e.w * 0.5;
      const ey = e.y + e.h * 0.5;
      if (Math.hypot(ex - cx, ey - cy) < 52) {
        this.damageEntity(e, dmg, elem, true);
        soulHits += 1;
      }
    }
    if (soulHits > 0 || clearedBullets > 0) {
      this.advanceSideQuest('style_mastery', 1);
    }

    gameAudio.playDash(true);
    this.emitHud();
    return true;
  }

  private advanceSideQuest(kind: SideQuestKind, delta = 1): void {
    const res = incrementSideQuestMap(
      this.sideQuestProgress,
      this.chapterIndex,
      this.playMode === 'underworld',
      kind,
      delta
    );
    if (res.justCompleted) {
      this.recentMechanicToast = 'Side Quest Concluída! Pressione [J] para resgatar';
      this.mechanicToastTimer = 3.2;
      this.spawnFloatingText(this.player.x + 4, this.player.y - 18, 'MISSÃO SECUNDÁRIA PRONTA [O]!', '#ffe066');
      gameAudio.playRelic();
    }
  }

  private activateQuestBeacon(e: LiveEntity): void {
    e.state = 'lit';
    this.litBeacons.add(e.def.id);
    this.advanceSideQuest('light_beacons', 1);
    this.addAstralCoins(3);
    this.grantPlayerXp(25);
    this.passXp += 15;
    this.addCombo(2, 110);
    this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
    this.player.stamina = this.player.maxStamina;
    this.hitstop = Math.max(this.hitstop, 0.04);
    this.trauma = Math.min(1, this.trauma + 0.25);
    this.spawnFloatingText(e.x + 7, e.y - 8, 'FAROL ACESO! +3 ★', '#52e5ff');
    this.spawnShockwave(e.x + 7, e.y + 8, 34, '#52e5ff', 0.34);
    this.burstParticles(e.x + 7, e.y + 8, 20, '#52e5ff', 95);
    this.burstParticles(e.x + 7, e.y + 6, 10, '#ffe066', 70);
    gameAudio.playCrystal();
    this.saveProgress();
    this.emitHud();
  }

  private activateLoreTablet(e: LiveEntity): void {
    e.state = 'lit';
    this.readTablets.add(e.def.id);
    this.advanceSideQuest('lore_tablets', 1);
    this.addAstralCoins(2);
    this.grantPlayerXp(20);
    this.passXp += 12;
    this.addCombo(1, 85);
    this.player.stamina = this.player.maxStamina;
    this.player.dashes = Math.max(this.player.dashes, this.player.maxDashes);
    const LORE_INSCRIPTIONS = [
      'Antiga runa entalhada: "Cada asa da montanha guarda um eco esquecido."',
      'Crônica estelar: "Onde os faróis ardem, até a cinza lembra sua luz."',
      'Estela ancestral: "Os Guardiões Coroados protegem os segredos do abismo."',
      'Fragmento do Sábio: "Atravessa a pedra falsa para reivindicar o tesouro oculto."',
    ];
    const lineIdx = Math.abs(Math.round(e.x) + this.chapterIndex) % LORE_INSCRIPTIONS.length;
    this.spawnFloatingText(e.x + 7, e.y - 8, 'ESTELA DECIFRADA! +2 ★', '#67e8f9');
    this.recentMechanicToast = LORE_INSCRIPTIONS[lineIdx];
    this.mechanicToastTimer = 3.5;
    this.spawnShockwave(e.x + 7, e.y + 8, 28, '#67e8f9', 0.3);
    this.burstParticles(e.x + 7, e.y + 8, 16, '#67e8f9', 80);
    gameAudio.playCrystal();
    this.saveProgress();
    this.emitHud();
  }

  public claimSideQuest(questId: string): boolean {
    if (this.claimedSideQuests.has(questId)) return false;
    const defs = generateChapterSideQuests(this.chapterIndex, this.playMode === 'underworld');
    const q = defs.find((d) => d.id === questId);
    if (!q) return false;
    const progress = Math.min(q.target, this.sideQuestProgress[questId] ?? 0);
    if (progress < q.target) return false;

    this.claimedSideQuests.add(questId);
    this.addAstralCoins(q.coinReward);
    this.grantPlayerXp(q.playerXpReward);
    this.passXp += q.passXpReward;
    this.spawnFloatingText(
      this.player.x + 4,
      this.player.y - 14,
      `+${q.coinReward} ★ · +${q.playerXpReward} XP!`,
      '#ffe066'
    );
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return true;
  }

  // ==================== AMBITIOUS SYSTEMS API ====================
  public craftRecipe(recipeId: string): { ok: boolean; msg: string } {
    const recipe = RECIPE_MAP[recipeId];
    if (!recipe) return { ok: false, msg: 'Receita não encontrada.' };
    if (!canCraftRecipe(recipe, this.craftingMaterials, this.astralCoins)) {
      return { ok: false, msg: 'Materiais ou Moedas Astrais insuficientes.' };
    }
    if (recipe.coinCost) this.astralCoins -= recipe.coinCost;
    for (const ing of recipe.ingredients) {
      this.craftingMaterials[ing.id] = Math.max(0, (this.craftingMaterials[ing.id] ?? 0) - ing.qty);
    }

    if (recipe.output.kind === 'equipment') {
      const prefixes: EquipmentPrefix[] = getReforgePrefixes();
      const chosenPrefix = Math.random() < 0.4 ? prefixes[Math.floor(Math.random() * prefixes.length)] : 'Padrão';
      const item = createEquipmentItem(recipe.output.templateId, chosenPrefix);
      this.equipmentInventory.push(item);
      this.saveProgress();
      this.emitHud();
      return { ok: true, msg: `Forjado: ${item.name} (${item.prefix})!` };
    }

    if (recipe.output.kind === 'buff') {
      const buff = ALCHEMY_BUFFS[recipe.output.buffId];
      if (buff) {
        const existing = this.activeAlchemyBuffs.find((b) => b.id === buff.id);
        if (existing) {
          existing.remainingSec = recipe.output.durationSec;
        } else {
          this.activeAlchemyBuffs.push({
            id: buff.id,
            name: buff.name,
            color: buff.color,
            remainingSec: recipe.output.durationSec,
          });
        }
        if (buff.id === 'pocao_escudo') this.player.heroShieldReady = true;
      }
      this.saveProgress();
      this.emitHud();
      return { ok: true, msg: `${recipe.name} ativado!` };
    }

    if (recipe.output.kind === 'tool_tier') {
      this.sandboxToolTier = Math.max(this.sandboxToolTier, recipe.output.tier);
      const pickSlot = this.sandboxHotbar.find((s) => s.kind === 'tool');
      if (pickSlot) pickSlot.name = `Picareta T${this.sandboxToolTier}`;
      this.saveProgress();
      this.emitHud();
      return { ok: true, msg: `Picareta aprimorada para Nível ${this.sandboxToolTier}!` };
    }

    if (recipe.output.kind === 'sandbox_item') {
      const itemId = recipe.output.itemId;
      const qty = recipe.output.qty;
      let destMsg = 'adicionado ao inventário Sandbox!';
      if (itemId === 'block_plank') {
        destMsg = this.addSandboxCraftItem('tile_plank', 'Tábua', 'tile', { tile: SB_TILE.PLANK, color: '#bd8455' }, qty);
      } else if (itemId === 'block_sakura_plank') {
        destMsg = this.addSandboxCraftItem('tile_sakura_plank', 'Tábua Sakura', 'tile', { tile: SB_TILE.SAKURA_PLANK, color: '#f472b6' }, qty);
      } else if (itemId === 'block_brick') {
        destMsg = this.addSandboxCraftItem('tile_brick', 'Tijolo', 'tile', { tile: SB_TILE.BRICK_BLOCK, color: '#9c7883' }, qty);
      } else if (itemId === 'block_neon_brick') {
        destMsg = this.addSandboxCraftItem('tile_neon_brick', 'Tijolo Neon', 'tile', { tile: SB_TILE.NEON_BRICK, color: '#38e8ff' }, qty);
      } else if (itemId === 'block_platform') {
        destMsg = this.addSandboxCraftItem('tile_platform', 'Plataforma', 'tile', { tile: SB_TILE.PLATFORM, color: '#d49966' }, qty);
      } else if (itemId === 'furn_torch') {
        destMsg = this.addSandboxCraftItem('tile_torch', 'Tocha', 'tile', { tile: SB_TILE.TORCH, color: '#ffd24d' }, qty);
      } else if (itemId === 'furn_lantern') {
        destMsg = this.addSandboxCraftItem('tile_lantern', 'Lanterna', 'tile', { tile: SB_TILE.LANTERN, color: '#fde047' }, qty);
      } else if (itemId === 'block_dream') {
        destMsg = this.addSandboxCraftItem('tile_dream', 'Bloco Sonho', 'tile', { tile: SB_TILE.DREAM_BLOCK, color: '#c084fc' }, qty);
      } else if (itemId === 'block_cloud_bounce') {
        destMsg = this.addSandboxCraftItem('tile_cloud_bounce', 'Nuvem Elástica', 'tile', { tile: SB_TILE.CLOUD_BOUNCE, color: '#f8fafc' }, qty);
      } else if (itemId === 'block_conveyor_r') {
        destMsg = this.addSandboxCraftItem('tile_conveyor_r', 'Esteira Crono', 'tile', { tile: SB_TILE.CONVEYOR_RIGHT, color: '#fbbf24' }, qty);
      } else if (itemId === 'block_spring') {
        destMsg = this.addSandboxCraftItem('tile_spring', 'Mola Propulsão', 'tile', { tile: SB_TILE.SPRING_UP, color: '#fb7185' }, qty);
      } else if (itemId === 'block_dash_crystal') {
        destMsg = this.addSandboxCraftItem('tile_dash_crystal', 'Cristal Dash', 'tile', { tile: SB_TILE.DASH_CRYSTAL, color: '#4df099' }, qty);
      } else if (itemId === 'furn_bed') {
        destMsg = this.addSandboxCraftItem('tile_bed', 'Cama Spawn', 'tile', { tile: SB_TILE.BED_SPAWN, color: '#f43f5e' }, qty);
      } else if (itemId === 'station_loom_anvil') {
        this.addSandboxCraftItem('tile_loom', 'Tear Rúnico', 'tile', { tile: SB_TILE.LOOM, color: '#c084fc' }, qty);
        destMsg = this.addSandboxCraftItem('tile_anvil', 'Bigorna Mitril', 'tile', { tile: SB_TILE.ANVIL, color: '#94a3b8' }, qty);
      } else if (itemId === 'boss_summon') {
        destMsg = this.addSandboxCraftItem('summon_boss', 'Olho Núcleo', 'summon', { color: '#e879f9', bossKind: 'core_boss' }, qty);
      } else if (itemId === 'boss_summon_leviathan') {
        destMsg = this.addSandboxCraftItem('summon_leviathan', 'Concha Leviatã', 'summon', { color: '#38bdf8', bossKind: 'leviathan_boss' }, qty);
      } else if (itemId === 'boss_summon_chronos') {
        destMsg = this.addSandboxCraftItem('summon_chronos', 'Engrenagem Cronos', 'summon', { color: '#fbbf24', bossKind: 'chronos_boss' }, qty);
      } else if (itemId === 'boss_summon_magma') {
        destMsg = this.addSandboxCraftItem('summon_magma', 'Coroa Magma', 'summon', { color: '#ff5522', bossKind: 'magma_boss' }, qty);
      } else if (itemId === 'kit_house') {
        this.addSandboxCraftItem('tile_door', 'Porta', 'tile', { tile: SB_TILE.DOOR_CLOSED, color: '#a06a41' }, 2);
        this.addSandboxCraftItem('tile_furniture', 'Móveis', 'tile', { tile: SB_TILE.TABLE, color: '#c88c5c' }, 4);
        destMsg = this.addSandboxCraftItem('wall_wood', 'Parede Mad.', 'wall', { wall: SB_WALL.WOOD, color: '#784f32' }, 40);
      }
      this.saveProgress();
      this.emitHud();
      return { ok: true, msg: `${recipe.name} ${destMsg}` };
    }

    const matId = recipe.output.materialId;
    this.craftingMaterials[matId] = (this.craftingMaterials[matId] ?? 0) + recipe.output.qty;
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: `Criado: ${recipe.name}!` };
  }

  public equipItemForHero(heroId: HeroId | string, itemUid: string, targetSlot?: EquipSlot): boolean {
    const item = this.equipmentInventory.find((i) => i.uid === itemUid);
    if (!item) return false;
    const slot = targetSlot ?? item.slot;
    if (targetSlot === 'ring1' || targetSlot === 'ring2') {
      if (item.slot !== 'ring1' && item.slot !== 'ring2') return false;
    } else if (item.slot !== slot) {
      return false;
    }
    if (!this.heroEquipment[heroId]) this.heroEquipment[heroId] = {};
    this.heroEquipment[heroId][slot] = item.uid;
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public unequipItemSlot(heroId: HeroId | string, slot: EquipSlot): void {
    if (!this.heroEquipment[heroId]) return;
    delete this.heroEquipment[heroId][slot];
    this.saveProgress();
    this.emitHud();
  }

  public upgradeEquipmentItem(itemUid: string): { ok: boolean; msg: string } {
    const item = this.equipmentInventory.find((i) => i.uid === itemUid);
    if (!item) return { ok: false, msg: 'Item não encontrado.' };
    if (item.upgradeLv >= 15) return { ok: false, msg: 'Nível máximo (+15) alcançado!' };
    const cost = getUpgradeCost(item.upgradeLv);
    if (this.astralCoins < cost.coins || (this.craftingMaterials[cost.materialId] ?? 0) < cost.qty) {
      return { ok: false, msg: `Requer ${cost.coins}★ e ${cost.qty}x ${cost.materialId}.` };
    }
    this.astralCoins -= cost.coins;
    this.craftingMaterials[cost.materialId] -= cost.qty;
    item.upgradeLv += 1;
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: `${item.name} aprimorado para +${item.upgradeLv}!` };
  }

  public evolveEquipmentItem(itemUid: string): { ok: boolean; msg: string } {
    const item = this.equipmentInventory.find((i) => i.uid === itemUid);
    if (!item) return { ok: false, msg: 'Item não encontrado.' };
    const cost = getRarityEvolveCost(item.rarity);
    if (!cost.nextRarity) return { ok: false, msg: 'Raridade Mítica máxima!' };
    if (this.astralCoins < cost.coins || (this.craftingMaterials[cost.materialId] ?? 0) < cost.qty) {
      return { ok: false, msg: `Requer ${cost.coins}★ e ${cost.qty}x ${cost.materialId}.` };
    }
    this.astralCoins -= cost.coins;
    this.craftingMaterials[cost.materialId] -= cost.qty;
    item.rarity = cost.nextRarity;
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: `${item.name} evoluiu para ${cost.nextRarity}!` };
  }

  public reforgeEquipmentItem(itemUid: string): { ok: boolean; msg: string } {
    const item = this.equipmentInventory.find((i) => i.uid === itemUid);
    if (!item) return { ok: false, msg: 'Item não encontrado.' };
    if (this.astralCoins < 6) return { ok: false, msg: 'Requer 6 Moedas Astrais para reforjar.' };
    const prefixes = getReforgePrefixes().filter((p) => p !== item.prefix);
    const nextPref = prefixes[Math.floor(Math.random() * prefixes.length)] ?? 'Celestial';
    this.astralCoins -= 6;
    item.prefix = nextPref;
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: `${item.name} reforjado como ${nextPref}!` };
  }

  public evolveHero(heroId: HeroId): { ok: boolean; msg: string } {
    const curTier = this.heroEvolutions[heroId] ?? 0;
    const check = canEvolveHero(curTier, this.astralCoins, this.craftingMaterials, this.getPlayerLevel());
    if (!check.canEvolve || !check.req) {
      return { ok: false, msg: check.reason ?? 'Requisitos insuficientes.' };
    }
    this.astralCoins -= check.req.coins;
    for (const m of check.req.materials) {
      this.craftingMaterials[m.id] = Math.max(0, (this.craftingMaterials[m.id] ?? 0) - m.qty);
    }
    const nextTier = curTier + 1;
    this.heroEvolutions[heroId] = nextTier;
    const evoData = getHeroEvolutionData(heroId, nextTier);
    if (this.heroId === heroId) {
      this.spawnShockwave(this.player.x + 4, this.player.y + 5, 48, evoData.auraColor, 0.42);
      this.burstParticles(this.player.x + 4, this.player.y + 5, 28, evoData.crownColor, 130);
      this.spawnFloatingText(this.player.x + 4, this.player.y - 12, `EVOLUÇÃO ${nextTier}x!`, evoData.crownColor);
    }
    gameAudio.playRelic();
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: `Herói evoluído para ${evoData.tierLabel}!` };
  }

  public grantPetBondXp(amount: number): void {
    if (this.equippedSpirit === 'none' || amount <= 0) return;
    const id = this.equippedSpirit;
    let lv = this.petLevels[id] ?? 1;
    let xp = (this.petBondXp[id] ?? 0) + amount;
    while (lv < 10 && xp >= getPetNextLevelXp(lv)) {
      xp -= getPetNextLevelXp(lv);
      lv += 1;
    }
    this.petLevels[id] = lv;
    this.petBondXp[id] = xp;
  }

  public feedPet(petId: SpiritId): { ok: boolean; msg: string } {
    if (petId === 'none' || !this.unlockedSpirits.has(petId)) {
      return { ok: false, msg: 'Desbloqueie este Pet primeiro.' };
    }
    if ((this.craftingMaterials.racao_estelar ?? 0) < 1) {
      return { ok: false, msg: 'Sem Ração Estelar! Crie na Alquimia ou colete de Elites.' };
    }
    this.craftingMaterials.racao_estelar -= 1;
    const prev = this.equippedSpirit;
    this.equippedSpirit = petId;
    this.grantPetBondXp(45);
    this.equippedSpirit = prev;
    const newLv = this.petLevels[petId] ?? 1;
    this.saveProgress();
    this.emitHud();
    return { ok: true, msg: `Pet alimentado! Nível de Vínculo: ${newLv}/10` };
  }

  public triggerPetSkill(): boolean {
    if (this.equippedSpirit === 'none' || this.petSkillCooldown > 0) return false;
    const pet = DETAILED_PET_MAP[this.equippedSpirit];
    if (!pet) return false;
    this.petSkillCooldown = 8.0;
    const count = 4 + Math.floor((this.petLevels[pet.id] ?? 1) / 3);
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count;
      const pr = this.projectiles[this.projHead];
      this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
      pr.active = true;
      pr.x = this.spiritX;
      pr.y = this.spiritY;
      pr.vx = Math.cos(ang) * 165;
      pr.vy = Math.sin(ang) * 165;
      pr.radius = 3;
      pr.gravity = 0;
      pr.homing = true;
      pr.friendly = true;
      pr.pierceWalls = true;
      pr.color = pet.color;
      pr.life = 2.6;
    }
    if (pet.id === 'serafim_eter') {
      this.player.heroShieldReady = true;
    }
    this.spawnFloatingText(this.spiritX, this.spiritY - 10, pet.skillName.toUpperCase(), pet.color);
    this.spawnShockwave(this.spiritX, this.spiritY, 28, pet.color, 0.3);
    gameAudio.playCrystal();
    this.emitHud();
    return true;
  }

  private addSandboxCraftItem(
    slotId: string,
    name: string,
    kind: SandboxHotbarSlot['kind'],
    opts: Partial<SandboxHotbarSlot>,
    qty: number
  ): string {
    const inHotbar = this.sandboxHotbar.find((s) => s.id === slotId);
    if (inHotbar) {
      inHotbar.count += qty;
      return 'adicionado à barra rápida!';
    }
    if (this.sandboxHotbar.length < 9) {
      this.sandboxHotbar.push({ id: slotId, name, kind, count: qty, color: opts.color ?? '#94a3b8', ...opts });
      return 'adicionado à barra rápida!';
    }
    const inBag = this.sandboxBackpack.find((s) => s.id === slotId);
    if (inBag) {
      inBag.count += qty;
    } else {
      this.sandboxBackpack.push({ id: slotId, name, kind, count: qty, color: opts.color ?? '#94a3b8', ...opts });
    }
    return 'guardado na Mochila!';
  }

  public assignSandboxBackpackToSlot(backpackId: string, hotbarIdx: number): void {
    const bagIdx = this.sandboxBackpack.findIndex((s) => s.id === backpackId);
    if (bagIdx === -1) return;
    const safeIdx = Math.max(2, Math.min(8, hotbarIdx));
    const incoming = this.sandboxBackpack[bagIdx];
    this.sandboxBackpack.splice(bagIdx, 1);
    const displaced = this.sandboxHotbar[safeIdx];
    this.sandboxHotbar[safeIdx] = incoming;
    if (displaced && displaced.count > 0 && displaced.kind !== 'tool' && displaced.kind !== 'weapon') {
      const existingBag = this.sandboxBackpack.find((b) => b.id === displaced.id);
      if (existingBag) existingBag.count += displaced.count;
      else this.sandboxBackpack.push(displaced);
    }
    this.sandboxSelectedSlot = safeIdx;
    this.saveProgress();
    this.emitHud();
  }

  public selectSandboxSlot(idx: number): void {
    this.sandboxSelectedSlot = Math.max(0, Math.min(this.sandboxHotbar.length - 1, idx));
    this.emitHud();
  }

  private damageSandboxEnemy(foe: SandboxWorld['enemies'][number], baseDmg: number): void {
    if (!this.sandboxWorld || foe.hp <= 0) return;
    foe.hp -= baseDmg;
    foe.flash = 0.16;
    this.soulCharge = Math.min(100, this.soulCharge + 10);
    this.addCombo(1, foe.isBoss ? 120 : 45);
    this.burstParticles(foe.x + foe.w * 0.5, foe.y + foe.h * 0.5, 10, foe.color, 95);
    this.spawnFloatingText(foe.x + 6, foe.y - 8, `-${baseDmg}`, '#ffe066');
    gameAudio.playEnemyHit(foe.hp <= 0);
    if (foe.hp <= 0) {
      this.addAstralCoins(foe.isBoss ? 30 : 2);
      this.grantPlayerXp(foe.isBoss ? 75 : 14);
      if (foe.isBoss) {
        this.sandboxWorld.progress.bossDefeated += 1;
        this.craftingMaterials.nucleo_guardiao = (this.craftingMaterials.nucleo_guardiao ?? 0) + 3;
        this.craftingMaterials.pedra_evolucao = (this.craftingMaterials.pedra_evolucao ?? 0) + 1;
        this.spawnShockwave(foe.x + foe.w * 0.5, foe.y + foe.h * 0.5, 48, '#ffe066', 0.42);
        this.spawnFloatingText(foe.x, foe.y - 12, `${foe.name.toUpperCase()} DERROTADO!`, '#ffe066');
      }
      this.saveProgress();
    }
  }

  private damageSandboxEnemiesInRadius(cx: number, cy: number, radius: number, dmg: number): number {
    if (!this.sandboxWorld) return 0;
    let hits = 0;
    for (const foe of this.sandboxWorld.enemies) {
      if (foe.hp <= 0) continue;
      if (Math.hypot(foe.x + foe.w * 0.5 - cx, foe.y + foe.h * 0.5 - cy) <= radius) {
        this.damageSandboxEnemy(foe, dmg);
        hits += 1;
      }
    }
    return hits;
  }

  private respawnPlayerInSandbox(): void {
    const world = this.sandboxWorld;
    if (!world) return;
    this.player.dead = false;
    this.player.x = world.spawnTx * TILE_SIZE;
    this.player.y = world.spawnTy * TILE_SIZE;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.dashes = this.player.maxDashes;
    this.player.stamina = this.player.maxStamina;
    this.player.invulnTimer = 1.3;
    this.cameraX = Math.max(0, Math.min(SANDBOX_WORLD_WIDTH_PX - VIRTUAL_WIDTH, this.player.x - VIRTUAL_WIDTH * 0.5));
    this.cameraY = Math.max(0, Math.min(SANDBOX_WORLD_HEIGHT_PX - VIRTUAL_HEIGHT, this.player.y - VIRTUAL_HEIGHT * 0.5));
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 30, '#52e5ff', 0.3);
    this.spawnFloatingText(this.player.x, this.player.y - 12, 'RETORNO AO SPAWN!', '#52e5ff');
    gameAudio.playRespawn();
    this.emitHud();
  }

  private activateSandboxTileInteract(tx: number, ty: number): boolean {
    const world = this.sandboxWorld;
    if (!world || tx < 0 || tx >= world.cols || ty < 0 || ty >= world.rows) return false;
    const tile = world.tiles[ty * world.cols + tx];
    const key = `${tx},${ty}`;

    if (tile === SB_TILE.TELEPORT_PYLON) {
      this.warpToNextSandboxPylon();
      return true;
    }
    if (tile === SB_TILE.SHRINE) {
      this.player.dashes = this.player.maxDashes;
      this.player.stamina = this.player.maxStamina;
      this.grantPlayerXp(8);
      this.spawnShockwave(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 30, '#52e5ff', 0.3);
      this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 10, 'BÊNÇÃO DO TOTEM!', '#52e5ff');
      gameAudio.playRelic();
      this.emitHud();
      return true;
    }
    if (tile === SB_TILE.QUEST_BEACON && !world.litBeacons.has(key)) {
      world.litBeacons.add(key);
      world.progress.beaconsLit += 1;
      this.addAstralCoins(4);
      this.grantPlayerXp(35);
      this.soulCharge = Math.min(100, this.soulCharge + 25);
      this.spawnShockwave(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 38, '#52e5ff', 0.36);
      this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 22, '#52e5ff', 100);
      this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 10, 'FAROL ASTRAL ACESO! +4★', '#52e5ff');
      gameAudio.playCrystal();
      this.saveProgress();
      this.emitHud();
      return true;
    }
    if (tile === SB_TILE.LORE_TABLET && !world.readTablets.has(key)) {
      world.readTablets.add(key);
      world.progress.tabletsRead += 1;
      const SANDBOX_LORE = [
        'Crônica dos 24 Biomas: "Todas as trilhas — do oceano abissal às ilhas celestes — convergem em um único mundo vivo."',
        'Estela de Cronos: "Nos eixos da Torre do Relógio, os blocos de sonho obedecem apenas ao impulso do Dash."',
        'Tabuleta Sakura: "Onde caem as pétalas carmesim, erga uma casa digna e os viajantes atenderão ao chamado."',
        'Selo do Núcleo: "Sob o magma e o éter dormem os quatro Guardiões; forje suas insígnias na Bigorna Suprema."',
      ];
      const text = SANDBOX_LORE[Math.abs(tx + ty) % SANDBOX_LORE.length];
      this.addAstralCoins(3);
      this.grantPlayerXp(25);
      this.recentMechanicToast = text;
      this.mechanicToastTimer = 4.2;
      this.spawnShockwave(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 30, '#67e8f9', 0.32);
      this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 10, 'ESTELA DECIFRADA! +3★', '#67e8f9');
      gameAudio.playCrystal();
      this.saveProgress();
      this.emitHud();
      return true;
    }
    if (tile === SB_TILE.CHEST && !world.openedChests.has(key)) {
      world.openedChests.add(key);
      world.progress.chestsOpened += 1;
      this.addAstralCoins(12);
      this.craftingMaterials.minerio_mitril = (this.craftingMaterials.minerio_mitril ?? 0) + 3;
      this.craftingMaterials.pedra_evolucao = (this.craftingMaterials.pedra_evolucao ?? 0) + 1;
      this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 8, 'BAÚ ANTIGO +12★!', '#ffe066');
      this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 18, '#ffe066', 110);
      gameAudio.playRelic();
      this.saveProgress();
      this.emitHud();
      return true;
    }
    return false;
  }

  public handleSandboxPointer(worldPxX: number, worldPxY: number, action: 'hover' | 'mine' | 'place'): void {
    const world = this.sandboxWorld;
    if (!world || this.playMode !== 'sandbox_world') return;
    const tx = Math.max(0, Math.min(SANDBOX_COLS - 1, Math.floor(worldPxX / TILE_SIZE)));
    const ty = Math.max(0, Math.min(SANDBOX_ROWS - 1, Math.floor(worldPxY / TILE_SIZE)));
    this.sandboxHoverTx = tx;
    this.sandboxHoverTy = ty;
    if (action === 'hover') return;

    const ptx = Math.floor((this.player.x + 4) / TILE_SIZE);
    const pty = Math.floor((this.player.y + 5) / TILE_SIZE);
    if (Math.hypot(tx - ptx, ty - pty) > 10) {
      if (action === 'mine' || action === 'place') {
        this.spawnFloatingText(worldPxX, worldPxY - 8, 'MUITO LONGE', '#ff9e64');
      }
      return;
    }

    const slot = this.sandboxHotbar[this.sandboxSelectedSlot] ?? this.sandboxHotbar[0];

    if (action === 'mine') {
      this.sandboxSwingTimer = 0.18;
      this.sandboxSwingAngle = Math.atan2(worldPxY - (this.player.y + 4), worldPxX - (this.player.x + 4));
      this.sandboxSwingKind = slot.kind === 'weapon' ? 'weapon' : 'tool';

      // Weapon slash or attacking nearby Sandbox enemy first!
      const hitEnemy = world.enemies.find(
        (foe) =>
          foe.hp > 0 &&
          Math.hypot(foe.x + foe.w * 0.5 - worldPxX, foe.y + foe.h * 0.5 - worldPxY) < 28
      );
      if (hitEnemy || slot.kind === 'weapon') {
        const target =
          hitEnemy ??
          world.enemies.find(
            (foe) =>
              foe.hp > 0 &&
              Math.hypot(foe.x - this.player.x, foe.y - this.player.y) < 38
          );
        if (target) {
          const dmg = 1 + Math.floor(this.getEffectiveHeroStats().totalAttackBonus * 0.5);
          this.damageSandboxEnemy(target, dmg);
          this.emitHud();
          return;
        }
      }

      const clickedTile = world.tiles[ty * world.cols + tx];
      if (clickedTile === SB_TILE.CHEST && !world.openedChests.has(`${tx},${ty}`)) {
        this.activateSandboxTileInteract(tx, ty);
        return;
      }
      if (clickedTile === SB_TILE.QUEST_BEACON && !world.litBeacons.has(`${tx},${ty}`)) {
        this.activateSandboxTileInteract(tx, ty);
        return;
      }
      if (clickedTile === SB_TILE.LORE_TABLET && !world.readTablets.has(`${tx},${ty}`)) {
        this.activateSandboxTileInteract(tx, ty);
        return;
      }

      const res = mineSandboxTile(world, tx, ty, Math.max(this.sandboxToolTier, 1));
      if (res.status === 'too_hard') {
        this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 6, 'PICARETA FRACA!', '#ff6688');
        return;
      }
      if (res.status === 'damaged') {
        this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 4, '#cbd5e1', 45);
        gameAudio.playLand();
      } else if (res.status === 'broken') {
        if (clickedTile === SB_TILE.POT) {
          this.addAstralCoins(3);
          const torchSlot = this.sandboxHotbar.find((s) => s.tile === SB_TILE.TORCH);
          if (torchSlot) torchSlot.count += 2;
          this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 8, '+3★ & Tochas!', '#ffd27d');
        } else if (clickedTile === SB_TILE.LIFE_CRYSTAL) {
          this.addAstralCoins(6);
          this.grantPlayerXp(25);
          this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 10, 'CRISTAL DE VIDA +6★!', '#ff3864');
          this.spawnShockwave(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 28, '#ff3864', 0.35);
          gameAudio.playRelic();
        }
        if (res.materialDrop) {
          this.craftingMaterials[res.materialDrop] = (this.craftingMaterials[res.materialDrop] ?? 0) + (res.dropQty ?? 1);
        }
        if (res.selfTileDrop !== undefined) {
          this.addSandboxCraftItem(
            `tile_${res.selfTileDrop}`,
            SANDBOX_TILE_META[res.selfTileDrop]?.name ?? 'Bloco',
            'tile',
            {
              tile: res.selfTileDrop,
              color: SANDBOX_TILE_META[res.selfTileDrop]?.color ?? '#94a3b8',
            },
            1
          );
        }
        this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 9, '#ffd27d', 75);
        gameAudio.playLand();
        this.emitHud();
      }
      return;
    }

    if (action === 'place') {
      const existing = world.tiles[ty * world.cols + tx];
      if (existing === SB_TILE.DOOR_CLOSED) {
        setSandboxTile(world, tx, ty, SB_TILE.DOOR_OPEN);
        this.emitHud();
        return;
      }
      if (existing === SB_TILE.DOOR_OPEN) {
        setSandboxTile(world, tx, ty, SB_TILE.DOOR_CLOSED);
        this.emitHud();
        return;
      }
      if (this.activateSandboxTileInteract(tx, ty)) {
        return;
      }

      if (slot.kind === 'summon' && slot.count > 0) {
        slot.count -= 1;
        const boss = spawnSandboxBoss(world, this.player.x, this.player.y, slot.bossKind ?? 'core_boss');
        this.spawnShockwave(boss.x + 11, boss.y + 11, 48, boss.color, 0.4);
        this.spawnFloatingText(this.player.x, this.player.y - 12, `${boss.name.toUpperCase()} INVOCADO!`, boss.color);
        gameAudio.playBossRoar();
        this.emitHud();
        return;
      }

      if (slot.kind === 'wall' && slot.wall !== undefined && slot.count > 0) {
        if (world.walls[ty * world.cols + tx] !== slot.wall) {
          setSandboxWall(world, tx, ty, slot.wall);
          slot.count -= 1;
          gameAudio.playLand();
          this.emitHud();
        }
        return;
      }

      if (slot.kind === 'tile' && slot.tile !== undefined && slot.count > 0) {
        let placeTile = slot.tile;
        if (slot.id === 'tile_furniture') {
          const leftTile = tx > 0 ? world.tiles[ty * world.cols + (tx - 1)] : 0;
          if (leftTile === SB_TILE.TABLE) placeTile = SB_TILE.CHAIR;
        }
        if (existing === SB_TILE.AIR) {
          setSandboxTile(world, tx, ty, placeTile);
          slot.count -= 1;
          gameAudio.playLand();
          if (placeTile === SB_TILE.BED_SPAWN) {
            world.spawnTx = tx;
            world.spawnTy = ty - 1;
            this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 8, 'SPAWN DEFINIDO!', '#ffd27d');
          }
          this.emitHud();
        }
      }
    }
  }

  public validateCurrentSandboxHouse(): { valid: boolean; reason: string } {
    const world = this.sandboxWorld;
    if (!world) return { valid: false, reason: 'Entre no Modo Sandbox primeiro.' };
    const ptx = Math.floor((this.player.x + 4) / TILE_SIZE);
    const pty = Math.floor((this.player.y + 5) / TILE_SIZE);
    const res = validateHouseAt(world, ptx, pty);
    if (!res.valid) {
      this.spawnFloatingText(this.player.x, this.player.y - 12, res.reason, '#ff6688');
      return { valid: false, reason: res.reason };
    }
    const reg = registerValidatedHouse(world, res);
    if (reg.registered) {
      const msg = reg.newNpc
        ? `Casa validada! ${reg.newNpc.name} (${reg.newNpc.role}) se mudou!`
        : 'Casa validada e registrada!';
      this.spawnFloatingText(this.player.x, this.player.y - 14, msg, '#4df0c0');
      this.saveProgress();
      this.emitHud();
      return { valid: true, reason: msg };
    }
    return { valid: true, reason: 'Casa já registrada!' };
  }

  public claimSandboxQuest(questId: string): boolean {
    const world = this.sandboxWorld;
    if (!world || this.sandboxQuestsClaimed.has(questId)) return false;
    const q = SANDBOX_QUESTS.find((item) => item.id === questId);
    if (!q) return false;
    const prog = this.getSandboxQuestProgress(questId);
    if (prog < q.target) return false;
    this.sandboxQuestsClaimed.add(questId);
    this.addAstralCoins(q.coinReward);
    this.grantPlayerXp(q.xpReward);
    this.saveProgress();
    this.emitHud();
    return true;
  }

  public getSandboxQuestProgress(questId: string): number {
    const w = this.sandboxWorld;
    if (!w) return 0;
    if (questId === 'sb_cut_wood') return w.progress.woodGathered;
    if (questId === 'sb_mine_ore') return w.progress.oresMined;
    if (questId === 'sb_build_house') return w.houses.length;
    if (questId === 'sb_attract_npc') return w.npcs.length;
    if (questId === 'sb_upgrade_pick') return this.sandboxToolTier >= 3 ? 1 : 0;
    if (questId === 'sb_reach_sky') return w.progress.reachedSky;
    if (questId === 'sb_reach_hell') return w.progress.reachedHell;
    if (questId === 'sb_explore_dungeon') return w.progress.chestsOpened;
    if (questId === 'sb_light_beacons') return w.progress.beaconsLit;
    if (questId === 'sb_read_tablets') return w.progress.tabletsRead;
    if (questId === 'sb_explore_10') return getSandboxExplorationPct(w.exploredSectors);
    if (questId === 'sb_defeat_boss') return w.progress.bossDefeated;
    return 0;
  }

  public warpToSandboxPylonAt(tx: number, ty: number): { ok: boolean; label: string } {
    const world = this.sandboxWorld;
    if (!world) return { ok: false, label: 'Mundo não iniciado' };
    const pylon = world.pylons.find((py) => py.tx === tx && py.ty === ty);
    this.player.x = tx * TILE_SIZE;
    this.player.y = (ty - 2) * TILE_SIZE;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.dashes = this.player.maxDashes;
    this.player.stamina = this.player.maxStamina;
    this.cameraX = Math.max(0, Math.min(SANDBOX_WORLD_WIDTH_PX - VIRTUAL_WIDTH, this.player.x - VIRTUAL_WIDTH * 0.5));
    this.cameraY = Math.max(0, Math.min(SANDBOX_WORLD_HEIGHT_PX - VIRTUAL_HEIGHT, this.player.y - VIRTUAL_HEIGHT * 0.5));
    markSandboxSectorAt(world.exploredSectors, tx, ty - 2);
    const label = pylon?.label ?? `Setor (${tx}, ${ty})`;
    const color = pylon?.color ?? '#52e5ff';
    this.spawnShockwave(this.player.x + 4, this.player.y + 5, 36, color, 0.35);
    this.spawnFloatingText(this.player.x, this.player.y - 14, `Teleporte: ${label}`, color);
    gameAudio.playDash(true);
    this.emitHud();
    return { ok: true, label };
  }

  public warpToNextSandboxPylon(): { ok: boolean; label: string } {
    const world = this.sandboxWorld;
    if (!world || world.pylons.length === 0) return { ok: false, label: 'Sem pilões ativos' };
    const ptx = Math.floor(this.player.x / TILE_SIZE);
    const pty = Math.floor(this.player.y / TILE_SIZE);
    let closestIdx = 0;
    let bestD = Infinity;
    world.pylons.forEach((py, idx) => {
      const d = Math.hypot(py.tx - ptx, py.ty - pty);
      if (d < bestD) {
        bestD = d;
        closestIdx = idx;
      }
    });
    const nextIdx = bestD < 18 ? (closestIdx + 1) % world.pylons.length : closestIdx;
    const target = world.pylons[nextIdx];
    return this.warpToSandboxPylonAt(target.tx, target.ty);
  }

  private stepSandboxMode(simDt: number, input: InputState): void {
    const world = this.sandboxWorld;
    if (!world) return;
    const p = this.player;
    if (this.sandboxSwingTimer > 0) this.sandboxSwingTimer = Math.max(0, this.sandboxSwingTimer - simDt);
    if (this.sandboxCrystalCooldown > 0) this.sandboxCrystalCooldown = Math.max(0, this.sandboxCrystalCooldown - simDt);
    if (this.heroSkillCooldown > 0) this.heroSkillCooldown = Math.max(0, this.heroSkillCooldown - simDt);
    if (this.tagSwapCooldown > 0) this.tagSwapCooldown = Math.max(0, this.tagSwapCooldown - simDt);
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - simDt);
      if (this.comboTimer === 0) this.comboCount = 0;
    }

    // Day/Night clock (24h cycle every ~4 min)
    world.dayTime = (world.dayTime + simDt * 0.1) % 24;
    const night = isSandboxNight(world.dayTime);

    // Step crumbling tiles
    for (const [idx, cState] of world.crumbleTimers.entries()) {
      cState.timer -= simDt;
      if (cState.state === 'shaking' && cState.timer <= 0) {
        cState.state = 'gone';
        cState.timer = 2.4;
      } else if (cState.state === 'gone' && cState.timer <= 0) {
        const ctx = idx % world.cols;
        const cty = Math.floor(idx / world.cols);
        const rx = ctx * TILE_SIZE;
        const ry = cty * TILE_SIZE;
        const playerOverlaps =
          p.x < rx + TILE_SIZE && p.x + p.w > rx && p.y < ry + TILE_SIZE && p.y + p.h > ry;
        if (!playerOverlaps) {
          world.crumbleTimers.delete(idx);
        } else {
          cState.timer = 0.25;
        }
      }
    }

    // Duo Tag-Team Swap [F]
    if (input.swapJustPressed && this.tagSwapCooldown <= 0) {
      const prevHeroId = this.heroId;
      const unlockedList = Array.from(this.unlockedHeroes);
      const nextHeroId =
        this.tagHeroId !== prevHeroId && this.unlockedHeroes.has(this.tagHeroId)
          ? this.tagHeroId
          : unlockedList.find((id) => id !== prevHeroId) ?? 'zephyr';
      this.tagHeroId = prevHeroId;
      this.tagSwapCooldown = 3.2;
      const nextHero = getHeroDef(nextHeroId);
      const resolvedSkin = getHeroSkinDef(nextHeroId, this.heroSkinByHero[nextHeroId]).id;
      this.heroId = nextHeroId;
      this.player.heroId = nextHeroId;
      this.player.skinId = resolvedSkin;
      this.player.dashes = Math.max(this.player.dashes, 1);
      this.player.invulnTimer = Math.max(this.player.invulnTimer, 0.25);
      this.spawnGhost();
      this.spawnShockwave(p.x + 4, p.y + 5, 38, nextHero.accentColor, 0.28);
      this.spawnFloatingText(p.x + 4, p.y - 10, `DUPLA: ${nextHero.name.toUpperCase()}!`, nextHero.accentColor);
      this.damageSandboxEnemiesInRadius(p.x + 4, p.y + 5, 52, 2);
      gameAudio.playDash(true);
    }

    // Campaign CollisionGrid Adapter over the 4800x640 world!
    const grid = buildSandboxCollisionGrid(world, (tx, ty, tile, kind) => {
      if (tile === SB_TILE.CRUMBLE && kind === 'land') {
        this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 4, '#d97706', 45);
      } else if (tile === SB_TILE.SECRET_WALL && kind === 'dash') {
        this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 12, '#a89eff', 85);
        this.spawnFloatingText(tx * TILE_SIZE, ty * TILE_SIZE - 8, 'PASSAGEM SECRETA!', '#a89eff');
        gameAudio.playCrystal();
      } else if (tile === SB_TILE.CLOUD_BOUNCE && kind === 'land') {
        this.burstParticles(tx * TILE_SIZE + 4, ty * TILE_SIZE + 4, 8, '#f8fafc', 70);
        gameAudio.playSpring();
      }
    });

    if (input.skillJustPressed && this.heroSkillCooldown <= 0) {
      this.triggerHeroSkill(grid);
    }
    if (input.soulSlashJustPressed) {
      this.triggerSoulStrike();
    }

    const runeB = computeRuneBonuses(this.equippedRunes);
    const boonB = computeBoonBonuses(this.activeBoons);
    const mastB = getMasteryBonuses(this.mastery);
    const lvB = getPlayerLevelBonuses(this.getPlayerLevel());
    const heroStats = this.getEffectiveHeroStats();
    const curTx0 = Math.floor((p.x + 4) / TILE_SIZE);
    const curTy0 = Math.floor((p.y + 5) / TILE_SIZE);
    const curBiomeInfo = getSandboxBiomeAt(curTx0, curTy0);
    const lowGravSky = curTy0 <= 115 || curBiomeInfo.id === 'sky_aerie' || curBiomeInfo.id === 'void_nebula';

    const wasDashes = p.dashes;
    const events = stepPlayerPhysics(
      p,
      input,
      simDt,
      grid,
      this.assist,
      0,
      0,
      lowGravSky,
      this.blessings,
      {
        speedMult:
          (1 + runeB.speedBonus) *
          mastB.speedMult *
          boonB.speedMult *
          lvB.speedMult *
          heroStats.eq.speedMult *
          heroStats.evo.speedMult *
          heroStats.alchemySpeedMult,
        jumpMult: (1 + runeB.jumpBonus) * mastB.jumpMult * heroStats.eq.jumpMult,
        staminaMult:
          (1 + runeB.staminaBonus) *
          mastB.staminaMult *
          boonB.staminaMult *
          lvB.staminaMult *
          heroStats.eq.staminaMult *
          heroStats.evo.staminaMult,
        extraAirDash: heroStats.eq.extraAirDash + heroStats.evo.extraAirDash,
        extraAirJump: runeB.extraAirJump + boonB.extraAirJump + heroStats.eq.extraAirJump + heroStats.evo.extraAirJump,
      }
    );

    if (events.dashed) {
      this.spawnGhost();
      this.spawnShockwave(p.x + 4, p.y + 5, 22, getHeroDef(this.heroId).accentColor, 0.22);
      gameAudio.playDash(wasDashes > 1);
    }
    if (events.jumped || events.airJumped || events.wallJumped) {
      gameAudio.playJump(events.airJumped);
    }
    if (events.landed && events.heavyLanded) {
      gameAudio.playLand();
    }

    // Gentle 1-tile Terraria auto-step when walking into a single-block step on ground
    const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (p.onGround && moveDir !== 0 && Math.abs(p.vx) < 18) {
      const checkX = p.x + moveDir * 2;
      const stepY = p.y - TILE_SIZE;
      if (
        checkX >= 8 &&
        checkX + p.w <= SANDBOX_WORLD_WIDTH_PX - 8 &&
        stepY >= 8 &&
        !overlapsSolid(checkX, stepY, p.w, p.h, grid, p)
      ) {
        p.x = checkX;
        p.y = stepY;
      }
    }

    // Clamp player within mega-world bounds
    p.x = Math.max(8, Math.min(SANDBOX_WORLD_WIDTH_PX - p.w - 8, p.x));
    p.y = Math.max(8, Math.min(SANDBOX_WORLD_HEIGHT_PX - p.h - 16, p.y));

    if (events.died) {
      this.respawnPlayerInSandbox();
      return;
    }

    const curTx = Math.floor((p.x + 4) / TILE_SIZE);
    const curTy = Math.floor((p.y + 5) / TILE_SIZE);

    // Mark sector explored & track Sky / Hell milestones!
    markSandboxSectorAt(world.exploredSectors, curTx, curTy);
    if (curTy <= 140) world.progress.reachedSky = 1;
    if (curTy >= 490) world.progress.reachedHell = 1;

    // Interactive Tiles at player feet/body (Bounce Shroom, Spring Up, Dash Crystal, Campfire)
    const footTile =
      curTx >= 0 && curTx < world.cols && curTy >= 0 && curTy < world.rows
        ? world.tiles[curTy * world.cols + curTx]
        : SB_TILE.AIR;
    if ((footTile === SB_TILE.BOUNCE_SHROOM || footTile === SB_TILE.SPRING_UP) && p.vy >= -40) {
      p.vy = footTile === SB_TILE.SPRING_UP ? -305 : -275;
      p.onGround = false;
      p.dashes = p.maxDashes;
      this.burstParticles(curTx * TILE_SIZE + 4, curTy * TILE_SIZE + 4, 10, footTile === SB_TILE.SPRING_UP ? '#fb7185' : '#4df0c0', 80);
      gameAudio.playSpring();
    } else if (footTile === SB_TILE.DASH_CRYSTAL && this.sandboxCrystalCooldown <= 0) {
      this.sandboxCrystalCooldown = 1.6;
      p.dashes = p.maxDashes;
      p.airJumpsLeft = p.maxAirJumps;
      this.spawnShockwave(curTx * TILE_SIZE + 4, curTy * TILE_SIZE + 4, 20, '#4df099', 0.25);
      this.spawnFloatingText(curTx * TILE_SIZE, curTy * TILE_SIZE - 10, '+DASH!', '#4df099');
      gameAudio.playRelic();
    } else if (footTile === SB_TILE.CAMPFIRE) {
      p.stamina = Math.min(p.maxStamina, p.stamina + simDt * 45);
    }

    // [E] Interact with nearby Pylon, Quest Beacon, Lore Tablet, Chest, or Shrine
    if (input.interactJustPressed) {
      let handled = false;
      for (let dy = -2; dy <= 2 && !handled; dy++) {
        for (let dx = -2; dx <= 2 && !handled; dx++) {
          handled = this.activateSandboxTileInteract(curTx + dx, curTy + dy);
        }
      }
    }

    // NPC gentle idle pacing inside their town/camp
    for (const npc of world.npcs) {
      npc.dir = Math.sin(this.elapsedSeconds * 0.7 + npc.homeTx) > 0 ? 1 : -1;
      const targetX = npc.homeTx * TILE_SIZE + Math.sin(this.elapsedSeconds * 0.7 + npc.homeTx) * 18;
      npc.x += (targetX - npc.x) * Math.min(1, simDt * 2);
    }

    // Spawn ambient biome-matched Sandbox monsters using real ENEMY_SPRITES!
    const curBiome = curBiomeInfo.id;
    const aliveNear = world.enemies.filter((e) => e.hp > 0 && Math.abs(e.x - p.x) < 420);
    if (aliveNear.length < 6 && Math.random() < simDt * (night || curTy > 290 ? 0.52 : 0.16)) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const ex = Math.max(32, Math.min(SANDBOX_WORLD_WIDTH_PX - 32, p.x + side * (115 + Math.random() * 55)));
      const kind =
        curTy >= 490
          ? 'hell_imp'
          : curTy >= 295
            ? 'cave_skeleton'
            : night
              ? 'demon_eye'
              : curBiome === 'desert' || curBiome === 'sun_pyramid'
                ? 'sand_crawler'
                : 'slime';
      const spriteKind =
        kind === 'hell_imp'
          ? 'enemy_cinder_sentinel'
          : kind === 'cave_skeleton'
            ? 'enemy_crypt_reaper'
            : kind === 'demon_eye'
              ? 'enemy_laser_eye'
              : curBiome === 'desert' || curBiome === 'sun_pyramid'
                ? 'enemy_dune_scorpion'
                : curBiome === 'tundra' || curBiome === 'crystal_glacier'
                  ? 'enemy_glacial_golem'
                  : curBiome === 'jungle' || curBiome === 'biolum_cave'
                    ? 'enemy_mycelium_sporeling'
                    : 'enemy_slime_king';
      world.enemies.push({
        id: `sb_e_${Date.now()}_${Math.random()}`,
        kind,
        spriteKind,
        name:
          kind === 'hell_imp'
            ? 'Sentinela de Cinza'
            : kind === 'cave_skeleton'
              ? 'Ceifador da Cripta'
              : kind === 'demon_eye'
                ? 'Olho Noturno'
                : curBiome === 'desert' || curBiome === 'sun_pyramid'
                  ? 'Escorpião Solar'
                  : curBiome === 'tundra' || curBiome === 'crystal_glacier'
                    ? 'Golem Glacial'
                    : 'Rei Slime',
        x: ex,
        y: Math.max(24, p.y - 24),
        vx: 0,
        vy: 0,
        hp: kind === 'slime' ? 2 : curTy >= 480 ? 5 : 3,
        maxHp: kind === 'slime' ? 2 : curTy >= 480 ? 5 : 3,
        w: 12,
        h: 11,
        color: kind === 'hell_imp' ? '#ff5522' : kind === 'demon_eye' ? '#e11d48' : kind === 'cave_skeleton' ? '#e2e8f0' : '#4df0c0',
        timer: 0,
        flash: 0,
      });
    }

    // Step Sandbox enemies & 4 Bosses
    for (const foe of world.enemies) {
      if (foe.hp <= 0) continue;
      if (Math.abs(foe.x - p.x) > 700 && !foe.isBoss) continue;
      if (foe.flash > 0) foe.flash = Math.max(0, foe.flash - simDt);
      const dx = p.x - foe.x;
      const dy = p.y - foe.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dir = dx >= 0 ? 1 : -1;
      if (foe.isBoss || foe.kind === 'demon_eye' || foe.kind === 'hell_imp') {
        const spd = foe.isBoss ? 56 : 44;
        foe.x += (dx / dist) * spd * simDt;
        foe.y += (dy / dist) * spd * simDt;
        if (foe.isBoss) {
          foe.shootTimer = (foe.shootTimer ?? 1.5) - simDt;
          if (foe.shootTimer <= 0) {
            foe.shootTimer = foe.kind === 'magma_boss' ? 1.35 : 1.75;
            const shots = foe.kind === 'chronos_boss' ? 5 : 3;
            const baseAng = Math.atan2(dy, dx);
            for (let si = 0; si < shots; si++) {
              const ang = baseAng + (si - (shots - 1) * 0.5) * 0.24;
              const pr = this.projectiles[this.projHead];
              this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
              pr.active = true;
              pr.x = foe.x + foe.w * 0.5;
              pr.y = foe.y + foe.h * 0.5;
              pr.vx = Math.cos(ang) * 145;
              pr.vy = Math.sin(ang) * 145;
              pr.radius = 3.2;
              pr.gravity = 0;
              pr.homing = foe.kind === 'leviathan_boss' && si === 1;
              pr.friendly = false;
              pr.pierceWalls = true;
              pr.color = foe.color;
              pr.life = 2.6;
            }
          }
        }
      } else {
        foe.vx = dir * 32;
        foe.x += foe.vx * simDt;
        foe.vy = Math.min(200, foe.vy + 400 * simDt);
        const fty = Math.floor((foe.y + foe.h + foe.vy * simDt) / TILE_SIZE);
        const ftx = Math.floor((foe.x + foe.w * 0.5) / TILE_SIZE);
        if (ftx >= 0 && ftx < world.cols && fty >= 0 && fty < world.rows && isSandboxSolid(world.tiles[fty * world.cols + ftx])) {
          foe.y = fty * TILE_SIZE - foe.h;
          foe.vy = foe.kind === 'slime' ? -110 : 0;
        } else {
          foe.y += foe.vy * simDt;
        }
      }
      // Player stomp or dash hits sandbox enemy!
      if (Math.abs(p.x - foe.x) < 13 && Math.abs(p.y - foe.y) < 13 && (p.dashTimer > 0 || p.vy > 30)) {
        const dmg = 1 + Math.floor(heroStats.totalAttackBonus * 0.5);
        this.damageSandboxEnemy(foe, dmg);
        p.vy = -140;
      }
    }

    // Companion spirit orbit & periodic homing bolt vs Sandbox enemies
    const targetSpX = p.x + 4 - p.facing * 14 + Math.cos(this.elapsedSeconds * 3.1) * 5;
    const targetSpY = p.y - 6 + Math.sin(this.elapsedSeconds * 4.2) * 4;
    this.spiritX += (targetSpX - this.spiritX) * Math.min(1, simDt * 8);
    this.spiritY += (targetSpY - this.spiritY) * Math.min(1, simDt * 8);
    if (this.equippedSpirit !== 'none') {
      this.sandboxSpiritBoltCooldown -= simDt;
      if (this.sandboxSpiritBoltCooldown <= 0) {
        const target = world.enemies.find(
          (foe) => foe.hp > 0 && Math.hypot(foe.x - this.spiritX, foe.y - this.spiritY) < 180
        );
        if (target) {
          this.sandboxSpiritBoltCooldown = 1.65;
          const pet = DETAILED_PET_MAP[this.equippedSpirit];
          const ang = Math.atan2(target.y + target.h * 0.5 - this.spiritY, target.x + target.w * 0.5 - this.spiritX);
          const pr = this.projectiles[this.projHead];
          this.projHead = (this.projHead + 1) % PROJECTILE_POOL_SIZE;
          pr.active = true;
          pr.x = this.spiritX;
          pr.y = this.spiritY;
          pr.vx = Math.cos(ang) * 165;
          pr.vy = Math.sin(ang) * 165;
          pr.radius = 2.8;
          pr.gravity = 0;
          pr.homing = true;
          pr.friendly = true;
          pr.pierceWalls = true;
          pr.color = pet?.color ?? '#67e8f9';
          pr.life = 2.2;
        }
      }
    }

    this.stepProjectiles(simDt);

    // Camera clamp to giant 4800x640 Sandbox world
    const targetCamX = Math.max(0, Math.min(SANDBOX_WORLD_WIDTH_PX - VIRTUAL_WIDTH, p.x + 4 - VIRTUAL_WIDTH * 0.5));
    const targetCamY = Math.max(0, Math.min(SANDBOX_WORLD_HEIGHT_PX - VIRTUAL_HEIGHT, p.y + 5 - VIRTUAL_HEIGHT * 0.5));
    this.cameraX += (targetCamX - this.cameraX) * Math.min(1, simDt * 10);
    this.cameraY += (targetCamY - this.cameraY) * Math.min(1, simDt * 10);
    this.stepFxPools(simDt);
    updateHairVerlet(p, simDt, 0);
    this.hudThrottle -= simDt;
    if (this.hudThrottle <= 0) {
      this.hudThrottle = 0.12;
      this.emitHud();
    }
  }

  public getSnapshot(): HudSnapshot {
    const ch = this.chapters[this.chapterIndex] ?? this.chapters[0];
    const hero = getHeroDef(this.heroId);
    const cdMult = this.getEffectiveSkillCdMult();
    const totalRelics = this.chapters.reduce(
      (acc, c) => acc + c.totalRelics,
      0
    );
    const chapterRelicsCollected = ch.stages.reduce(
      (acc, st) =>
        acc +
        st.entities.filter(
          (e) => (e.kind === 'relic' || e.kind === 'winged_relic') && this.collectedRelics.has(e.id)
        ).length,
      0
    );
    const activeBoss = this.liveEntities.find((e) => isBossKind(e.def.kind) && e.state !== 'dead');
    const bossMeta = activeBoss && isBossKind(activeBoss.def.kind) ? getAnyBossMeta(activeBoss.def.kind) : null;
    const bossPhase: 1 | 2 | 3 = activeBoss ? this.getBossPhase(activeBoss.hp, activeBoss.maxHp) : 1;
    const nearShrine = this.liveEntities.some(
      (e) =>
        e.def.kind === 'blessing_shrine' &&
        Math.hypot(this.player.x + 4 - (e.x + 8), this.player.y + 5 - (e.y + 9)) < 30
    );
    const stageNodes = ch.stages.map((st) => ({
      id: st.id,
      gx: st.gx,
      gy: st.gy,
      visited: this.visitedRooms.has(st.id),
      current: st.id === this.currentRoom.id,
      hasGoal: st.entities.some((e) => e.kind === 'chapter_goal' || e.kind === 'summit_heart'),
    }));

    const modeExtraDash = this.playMode === 'mirror_void' ? 1 : 0;
    const baseDashes = hero.modifiers.baseDashes + modeExtraDash;
    const weatherMeta = WEATHER_META[this.roomWeather] ?? WEATHER_META.clear;
    const elementMarks = Array.from(
      new Set(
        this.liveEntities
          .filter((e) => e.state !== 'dead' && e.elementMark)
          .map((e) => e.elementMark as ElementType)
      )
    );

    const lvProgress = getLevelProgressFromXp(this.playerXp);

    const isUw = this.playMode === 'underworld';
    const sideQuests = buildSideQuestViewList(
      this.chapterIndex,
      isUw,
      ch.name,
      this.sideQuestProgress,
      this.claimedSideQuests
    );
    const sideQuestsReadyCount = sideQuests.filter((q) => q.completed && !q.claimed).length;
    const roomSectors = this.discoveredSectors[this.currentRoom.id] ?? [];
    const stageExplorationPct = computeStageExplorationPct(roomSectors);
    let nearInteractLabel: string | null = nearShrine ? '[E / B] Altar de Bênçãos' : null;
    if (!nearInteractLabel) {
      for (const e of this.liveEntities) {
        const d = Math.hypot(this.player.x + 4 - (e.x + e.w * 0.5), this.player.y + 5 - (e.y + e.h * 0.5));
        if (d >= 28) continue;
        if (e.def.kind === 'quest_beacon' && e.state !== 'lit') {
          nearInteractLabel = '[E] Acender Farol Astral';
          break;
        }
        if (e.def.kind === 'lore_tablet' && e.state !== 'lit') {
          nearInteractLabel = '[E] Decifrar Estela';
          break;
        }
        if (e.def.kind === 'npc') {
          nearInteractLabel = '[E] Conversar';
          break;
        }
      }
    }

    return {
      mode: this.mode,
      playMode: this.playMode,
      heroId: hero.id,
      heroSkinId: this.getHeroSkinId(),
      heroName: hero.name,
      heroShieldReady: this.player.heroShieldReady,
      heroSkillCooldown: this.heroSkillCooldown,
      heroSkillMaxCooldown: hero.skillCooldown * cdMult,
      astralCoins: this.astralCoins,
      playerLevel: lvProgress.level,
      playerXp: lvProgress.totalXp,
      playerCurrentLevelXp: lvProgress.currentLevelXp,
      playerNextLevelXp: lvProgress.nextLevelXp,
      playerLevelProgress: lvProgress.progressRatio,
      unlockedHeroes: Array.from(this.unlockedHeroes),
      towerFloor: this.towerFloor,
      bestTowerFloor: this.bestTowerFloor,
      comboCount: this.comboCount,
      comboTimer: this.comboTimer,
      styleScore: this.styleScore,
      styleRank: this.getStyleRank(),
      blessings: { ...this.blessings },
      chapterIndex: this.chapterIndex,
      totalChapters: this.chapters.length,
      biome: this.currentRoom.biome,
      biomeName: ch.name,
      roomName: this.currentRoom.name,
      stageNumber: this.currentRoom.stageIndex + 1,
      totalStagesInChapter: ch.stages.length,
      dashes: this.player.dashes,
      maxDashes: this.assist.extraDash ? Math.max(2, baseDashes) : baseDashes,
      staminaRatio: Math.max(0, Math.min(1, this.player.stamina / this.player.maxStamina)),
      deaths: this.deaths,
      chapterDeaths: this.chapterDeaths,
      chapterElapsedSeconds: this.chapterElapsedSeconds,
      relicsCollected: this.collectedRelics.size,
      totalRelics,
      chapterRelicsCollected,
      chapterTotalRelics: ch.totalRelics,
      elapsedSeconds: this.elapsedSeconds,
      discoveredMechanics: this.discoveredMechanics.size,
      totalMechanics: TOTAL_MECHANICS,
      visitedStages: Array.from(this.visitedRooms),
      unlockedShrines: Array.from(this.unlockedShrines),
      currentRoomId: this.currentRoom.id,
      chapterRecords: this.getActiveChapterRecords().map((r) => ({ ...r })),
      dialogue: this.dialogue ? { ...this.dialogue } : null,
      bannerTitle: this.bannerTitle,
      bannerSub: this.bannerSub,
      muted: gameAudio.isMuted(),
      victory: this.victory,
      hardcoreGameOver: this.hardcoreGameOver,
      assist: { ...this.assist },
      recentMechanicToast: this.recentMechanicToast,
      bossHp: activeBoss ? activeBoss.hp : null,
      bossMaxHp: activeBoss ? activeBoss.maxHp : null,
      bossName: bossMeta ? bossMeta.name : null,
      bossTitle: bossMeta ? bossMeta.title : null,
      bossPhase,
      bossRushIndex: this.bossRushIndex + 1,
      bossRushTotal: BOSS_ORDER.length,
      survivalWave: this.survivalWave,
      survivalKills: this.survivalKills,
      bestSurvivalWave: this.bestSurvivalWave,
      bestBossRushSeconds: this.bestBossRushSeconds,
      goalLockedByBoss: this.isGoalLocked(),
      nearShrine,
      activeCheckpoint: Boolean(
        this.roomRespawnOverride && this.roomRespawnOverride.roomId === this.currentRoom.id
      ),
      stageNodes,
      overdrive: Math.round(this.overdrive),
      overdriveActive: this.overdriveTimer > 0,
      activeCutscene: this.activeCutscene,
      seenCutscenes: Array.from(this.seenCutscenes),
      weather: this.roomWeather,
      weatherName: weatherMeta.name,
      equippedRunes: [...this.equippedRunes],
      equippedSpirit: this.equippedSpirit,
      tagHeroId: this.tagHeroId,
      tagSwapCooldown: this.tagSwapCooldown,
      elementMarks,
      riftActive: this.riftActive,
      riftProgress: this.riftProgress,
      riftTotal: this.riftTotal,
      riftTimer: Math.max(0, this.riftTimer),
      mastery: { ...this.mastery },
      unlockedAchievements: Array.from(this.unlockedAchievements),
      ghostEnabled: this.ghostEnabled,
      hasGhostRecord: Boolean(this.ghostBestByRoom[this.currentRoom.id]),
      activeBoons: [...this.activeBoons],
      pendingBoonChoices: this.pendingBoonChoices ? [...this.pendingBoonChoices] : null,
      equippedTalisman: this.equippedTalisman,
      unlockedTalismans: Array.from(this.unlockedTalismans),
      activeTitle: this.activeTitle,
      unlockedTitles: this.getUnlockedTitlesList(),
      claimedContracts: Array.from(this.claimedContracts),
      bestiaryDefeats: { ...this.bestiaryDefeats },
      bossStaggerRatio: activeBoss
        ? Math.min(1, (activeBoss.stagger ?? 0) / Math.max(1, activeBoss.maxStagger ?? 5))
        : null,
      bossSubState: activeBoss?.bossSubState ?? null,
      bossWeakness:
        activeBoss && isBossKind(activeBoss.def.kind)
          ? (getAnyBossBestiary(activeBoss.def.kind)?.weaknessElement ?? 'astral')
          : null,
      bossHitInvulnRemaining: activeBoss ? Math.max(0, activeBoss.hitInvulnTimer ?? 0) : 0,
      perfectDodges: this.perfectDodges,
      crownShardsCollected: this.crownShardsCollected,
      echoCloneActive: this.echoCloneTimer > 0,
      imbuedElement: this.imbuedElement,
      imbuedTimer: Math.max(0, this.imbuedTimer),
      jukeboxTrackId: this.jukeboxTrackId,
      totalParries: this.totalParries,
      totalReactions: this.totalReactions,
      totalStyleSS: this.totalStyleSS,
      passXp: this.passXp,
      passLevel: getPassProgressFromXp(this.passXp).level,
      passLevelProgress: getPassProgressFromXp(this.passXp).progress,
      passAstralUnlocked: this.passAstralUnlocked,
      claimedFreePassTiers: Array.from(this.claimedFreePassTiers),
      claimedAstralPassTiers: Array.from(this.claimedAstralPassTiers),
      claimedMissions: Array.from(this.claimedMissions),
      missionStats: { ...this.missionStats },
      worldStars: isUw ? { ...this.underworldWorldStars } : { ...this.worldStars },
      totalWorldStars: isUw
        ? Object.values(this.underworldWorldStars).reduce((a, v) => a + v, 0)
        : this.getTotalWorldStars(),
      claimedStarMilestones: Array.from(this.claimedStarMilestones),
      dailyStreakDay: this.dailyStreakDay,
      canClaimDaily: this.canClaimDailyReward(),
      equippedAuraTrail: this.equippedAuraTrail,
      unlockedAuraTrails: Array.from(this.unlockedAuraTrails),
      enemyKills: { ...this.enemyKills },
      claimedEnemyBounties: Array.from(this.claimedEnemyBounties),
      soulCharge: Math.round(this.soulCharge),
      isUnderworld: isUw,
      underworldChapterRecords: this.underworldChapterRecords.map((r) => ({ ...r })),
      underworldWorldStars: { ...this.underworldWorldStars },
      totalUnderworldStars: Object.values(this.underworldWorldStars).reduce((a, v) => a + v, 0),
      underworldTotalChapters: UNDERWORLD_CHAPTERS.length,
      sideQuests,
      sideQuestsReadyCount,
      stageExplorationPct,
      stageZonesVisited: roomSectors.length,
      stageZonesTotal: STAGE_EXPLORATION_SECTORS,
      nearInteractLabel,
      craftingMaterials: { ...this.craftingMaterials },
      activeAlchemyBuffs: this.activeAlchemyBuffs.map((b) => ({ ...b })),
      heroEvolutions: { ...this.heroEvolutions },
      activeHeroEvolution: this.heroEvolutions[hero.id] ?? 0,
      heroEquipmentSlots: this.heroEquipment,
      equipmentInventoryCount: this.equipmentInventory.length,
      heroPowerScore: this.getEffectiveHeroStats(hero.id).eq.powerScore,
      petLevel: this.petLevels[this.equippedSpirit] ?? 1,
      petBondXp: this.petBondXp[this.equippedSpirit] ?? 0,
      petSkillCooldown: this.petSkillCooldown,
      petSkillMaxCooldown: 8.0,
      isSandboxWorld: this.playMode === 'sandbox_world',
      sandboxBiomeName: this.sandboxWorld
        ? getSandboxBiomeAt(
            Math.floor((this.player.x + 4) / TILE_SIZE),
            Math.floor((this.player.y + 5) / TILE_SIZE)
          ).label
        : '',
      sandboxDayTime: this.sandboxWorld?.dayTime ?? 9,
      sandboxIsNight: this.sandboxWorld ? isSandboxNight(this.sandboxWorld.dayTime) : false,
      sandboxHousesCount: this.sandboxWorld?.houses.length ?? 0,
      sandboxNpcsCount: this.sandboxWorld?.npcs.length ?? 0,
      sandboxHotbar: this.sandboxHotbar.map((s) => ({
        id: s.id,
        label: s.name,
        count: s.count,
        color: s.color,
        category: s.kind,
      })),
      sandboxSelectedSlot: this.sandboxSelectedSlot,
      sandboxToolTier: this.sandboxToolTier,
      sandboxQuestsCompleted: this.sandboxWorld
        ? SANDBOX_QUESTS.filter((q) => this.getSandboxQuestProgress(q.id) >= q.target).length
        : 0,
      sandboxQuestsTotal: SANDBOX_QUESTS.length,
      sandboxBossActive: Boolean(this.sandboxWorld?.enemies.some((e) => e.isBoss && e.hp > 0)),
      sandboxExplorationPct: this.sandboxWorld ? getSandboxExplorationPct(this.sandboxWorld.exploredSectors) : 0,
      sandboxWorldCols: SANDBOX_COLS,
      sandboxWorldRows: SANDBOX_ROWS,
      sandboxBackpack: this.sandboxBackpack.map((s) => ({
        id: s.id,
        label: s.name,
        count: s.count,
        color: s.color,
        category: s.kind,
      })),
      sandboxPlayerTx: Math.floor((this.player.x + 4) / TILE_SIZE),
      sandboxPlayerTy: Math.floor((this.player.y + 5) / TILE_SIZE),
      sandboxPylons: this.sandboxWorld ? this.sandboxWorld.pylons.map((py) => ({ tx: py.tx, ty: py.ty, label: py.label, color: py.color })) : [],
    };
  }

  public emitHud(): void {
    this.onHudChange(this.getSnapshot());
  }
}
