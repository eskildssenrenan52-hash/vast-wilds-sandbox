import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialPlayer } from './physics';
import {
  SANDBOX_COLS,
  SANDBOX_ROWS,
  SANDBOX_SURFACE_REGIONS,
  SANDBOX_TOTAL_SECTORS,
  getSandboxBiomeAt,
  getSandboxExplorationPct,
  getSandboxSurfaceHeightAt,
  markSandboxSectorAt,
} from './sandboxBiomes';
import {
  SANDBOX_QUESTS,
  SB_TILE,
  SB_WALL,
  applySandboxDelta,
  buildSandboxCollisionGrid,
  exportSandboxDelta,
  generateSandboxWorld,
  mineSandboxTile,
  registerValidatedHouse,
  setSandboxTile,
  setSandboxWall,
  spawnSandboxBoss,
  validateHouseAt,
} from './sandboxWorld';
import { TILE_SIZE } from './types';

test('generateSandboxWorld builds a 4800x640 continuous world with 24 interconnected biomes and 15 pylons', () => {
  const world = generateSandboxWorld(202504);

  assert.equal(world.cols, 4800);
  assert.equal(world.rows, 640);
  assert.equal(world.tiles.length, SANDBOX_COLS * SANDBOX_ROWS);
  assert.equal(world.walls.length, SANDBOX_COLS * SANDBOX_ROWS);
  assert.equal(world.exploredSectors.length, SANDBOX_TOTAL_SECTORS);
  assert.equal(SANDBOX_SURFACE_REGIONS.length, 14);
  assert.equal(world.pylons.length, 15);
  assert.equal(SANDBOX_QUESTS.length, 12);

  // Sample all 24 biome strata across sky, surface, mid-caverns, and underworld
  const seenBiomes = new Set<string>();
  for (const reg of SANDBOX_SURFACE_REGIONS) {
    const midTx = Math.floor((reg.minTx + reg.maxTx) / 2);
    seenBiomes.add(getSandboxBiomeAt(midTx, 210).id);
  }
  for (const tx of [600, 2000, 4000]) {
    seenBiomes.add(getSandboxBiomeAt(tx, 90).id);
    seenBiomes.add(getSandboxBiomeAt(tx, 540).id);
  }
  for (const tx of [600, 1800, 3100, 4200]) {
    seenBiomes.add(getSandboxBiomeAt(tx, 340).id);
  }
  assert.equal(seenBiomes.size, 24);

  // Starter camp at Vale de Aethelgard has workbench, forge, loom, anvil, and clear air above ground
  const hubGround = getSandboxSurfaceHeightAt(1680, 202504);
  assert.equal(world.tiles[(hubGround - 1) * world.cols + 1680], SB_TILE.AIR);
  assert.equal(world.tiles[(hubGround - 1) * world.cols + 1675], SB_TILE.WORKBENCH);
  assert.equal(world.tiles[(hubGround - 1) * world.cols + 1683], SB_TILE.FORGE);
  assert.equal(world.tiles[(hubGround - 1) * world.cols + 1689], SB_TILE.ANVIL);
});

test('buildSandboxCollisionGrid exposes Campaign physics surfaces (Dream Block, Cloud Bounce, Conveyor, Crumble, Secret Wall)', () => {
  const world = generateSandboxWorld(202504);
  const grid = buildSandboxCollisionGrid(world);
  const player = createInitialPlayer(1680 * TILE_SIZE, 190 * TILE_SIZE);

  // Place Dream Block, Cloud Bounce, Conveyor, Crumble, and Secret Wall at test coordinates
  const tx = 1660;
  const ty = 195;
  setSandboxTile(world, tx, ty, SB_TILE.DREAM_BLOCK);
  setSandboxTile(world, tx + 1, ty, SB_TILE.CLOUD_BOUNCE);
  setSandboxTile(world, tx + 2, ty, SB_TILE.CONVEYOR_RIGHT);
  setSandboxTile(world, tx + 3, ty, SB_TILE.CONVEYOR_LEFT);
  setSandboxTile(world, tx + 4, ty, SB_TILE.CRUMBLE);
  setSandboxTile(world, tx + 5, ty, SB_TILE.SECRET_WALL);

  const px = (idx: number) => (tx + idx) * TILE_SIZE + 4;
  const py = ty * TILE_SIZE + 4;

  // Dream block is solid when walking, passable during dash or inside dream
  player.dashTimer = 0;
  player.inDream = false;
  assert.equal(grid.isSolidAtPixel(px(0), py, player), true);
  assert.equal(grid.isDreamAtPixel?.(px(0), py), true);
  player.dashTimer = 0.1;
  assert.equal(grid.isSolidAtPixel(px(0), py, player), false);

  // Cloud bounce & conveyors
  assert.equal(grid.isCloudBounceAtPixel?.(px(1), py), true);
  assert.equal(grid.getConveyorAtPixel?.(px(2), py), 1);
  assert.equal(grid.getConveyorAtPixel?.(px(3), py), -1);

  // Crumble triggers shaking timer and Secret Wall breaks on dash
  grid.onTileTouched?.(tx + 4, ty, 'land');
  assert.equal(world.crumbleTimers.get(ty * world.cols + (tx + 4))?.state, 'shaking');
  grid.onTileTouched?.(tx + 5, ty, 'dash');
  assert.equal(world.tiles[ty * world.cols + (tx + 5)], SB_TILE.AIR);
});

test('mineSandboxTile enforces tool tier gating and Tier 6 Cosmic Drill bonus drops', () => {
  const world = generateSandboxWorld(202504);
  const tx = 1665;
  const ty = 196;

  setSandboxTile(world, tx, ty, SB_TILE.ETHER_ORE);
  const blocked = mineSandboxTile(world, tx, ty, 2);
  assert.equal(blocked.status, 'too_hard');

  // Tier 6 Cosmic Drill breaks Ether Ore in 1 hit and grants +1 bonus material drop
  const mined = mineSandboxTile(world, tx, ty, 6);
  assert.equal(mined.status, 'broken');
  assert.equal(mined.materialDrop, 'minerio_eter');
  assert.equal(mined.dropQty, 3);
  assert.equal(world.tiles[ty * world.cols + tx], SB_TILE.AIR);
  assert.equal(world.progress.oresMined, 1);
});

test('validateHouseAt & registerValidatedHouse detect enclosed homes and recruit NPCs', () => {
  const world = generateSandboxWorld(202504);
  const baseTx = 1700;
  const baseTy = 190;

  // Carve clear space and build a 9x6 enclosed house
  for (let y = baseTy - 6; y <= baseTy + 1; y++) {
    for (let x = baseTx - 1; x <= baseTx + 9; x++) {
      setSandboxTile(world, x, y, SB_TILE.AIR);
      setSandboxWall(world, x, y, SB_WALL.NONE);
    }
  }
  for (let x = baseTx; x <= baseTx + 8; x++) {
    setSandboxTile(world, x, baseTy, SB_TILE.PLANK);
    setSandboxTile(world, x, baseTy - 5, SB_TILE.PLANK);
  }
  for (let y = baseTy - 4; y <= baseTy - 1; y++) {
    setSandboxTile(world, baseTx, y, y >= baseTy - 2 ? SB_TILE.DOOR_CLOSED : SB_TILE.PLANK);
    setSandboxTile(world, baseTx + 8, y, SB_TILE.PLANK);
    for (let x = baseTx + 1; x <= baseTx + 7; x++) {
      setSandboxWall(world, x, y, SB_WALL.WOOD_WALL);
    }
  }
  setSandboxTile(world, baseTx + 2, baseTy - 1, SB_TILE.TABLE);
  setSandboxTile(world, baseTx + 3, baseTy - 1, SB_TILE.CHAIR);
  setSandboxTile(world, baseTx + 4, baseTy - 3, SB_TILE.TORCH);

  const check = validateHouseAt(world, baseTx + 4, baseTy - 2);
  assert.equal(check.valid, true);
  assert.equal(check.hasDoor, true);
  assert.equal(check.hasTorch, true);
  assert.equal(check.hasTable, true);
  assert.equal(check.hasChair, true);

  const reg = registerValidatedHouse(world, check);
  assert.equal(reg.registered, true);
  assert.ok(reg.newNpc);
  assert.equal(world.houses.length, 1);
});

test('exploration tracking, boss spawning, and delta save/load round-trip', () => {
  const world = generateSandboxWorld(202504);
  const initialPct = getSandboxExplorationPct(world.exploredSectors);
  assert.ok(initialPct >= 0);

  // Mark a distant unexplored sector at Porto Estelar Oeste
  const marked = markSandboxSectorAt(world.exploredSectors, 90, 210);
  assert.equal(marked, true);
  assert.ok(getSandboxExplorationPct(world.exploredSectors) >= initialPct);

  setSandboxTile(world, 1682, 198, SB_TILE.SAKURA_PLANK);
  setSandboxWall(world, 1682, 198, SB_WALL.SAKURA_WALL);
  world.litBeacons.add('beacon_test');
  world.readTablets.add('tablet_test');
  world.openedChests.add('chest_test');

  const boss = spawnSandboxBoss(world, 1680 * TILE_SIZE, 200 * TILE_SIZE, 'leviathan_boss');
  assert.equal(boss.isBoss, true);
  assert.equal(boss.kind, 'leviathan_boss');

  const saved = exportSandboxDelta(world);
  const restored = generateSandboxWorld(202504);
  applySandboxDelta(restored, saved);

  assert.equal(restored.tiles[198 * restored.cols + 1682], SB_TILE.SAKURA_PLANK);
  assert.equal(restored.walls[198 * restored.cols + 1682], SB_WALL.SAKURA_WALL);
  assert.equal(restored.litBeacons.has('beacon_test'), true);
  assert.equal(restored.readTablets.has('tablet_test'), true);
  assert.equal(restored.openedChests.has('chest_test'), true);
  assert.ok(restored.exploredSectors.some((v) => v > 0));
});
