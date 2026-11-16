// @ts-nocheck -- imported game code, written for a looser TS config
import {
  BiomeId,
  EntityKind,
  RoomEntityDef,
  RoomPropDef,
  TILE_SIZE,
  TileType,
} from './types';

export interface PainterLike {
  readonly cols: number;
  readonly rows: number;
  get(tx: number, ty: number): number;
  set(tx: number, ty: number, val: number): void;
  rect(x: number, y: number, w: number, h: number, val: number): void;
  cliff(x: number, topY: number, w: number, val?: number): void;
  island(x: number, y: number, w: number, thickness?: number, val?: number): void;
  ceilingMass(x: number, w: number, depth: number, val?: number): void;
  spikes(x: number, y: number, len: number, dir: 'up' | 'down' | 'left' | 'right', vertical?: boolean): void;
  add(kind: EntityKind, tx: number, ty: number, extra?: Partial<RoomEntityDef>): void;
  prop(kind: RoomPropDef['kind'], tx: number, ty: number, h?: number): void;
}

export interface ZoneThemePalette {
  hazardTile: number;
  midTile: number;
  gripTile: number;
  e0: EntityKind;
  e1: EntityKind;
  e2: EntityKind;
}

/** Deterministic integer hash producing non-negative 32-bit pseudo-random values. */
export function layoutHash(a: number, b: number, c = 0, d = 0): number {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647 + d * 1597334677) | 0;
  h = ((h ^ (h >>> 13)) * 1274126177) | 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function clampRow(R: number, row: number, min = 9, marginBottom = 4): number {
  return Math.max(min, Math.min(R - marginBottom, row));
}

function fillHazardBed(
  p: PainterLike,
  x: number,
  w: number,
  R: number,
  hazardTile: number
): void {
  if (w <= 0) return;
  if (hazardTile === TileType.SPIKE_UP) {
    p.spikes(x, R - 3, w, 'up');
  } else {
    p.rect(x, R - 4, w, 2, hazardTile);
  }
}

/**
 * Renders one of 10 structurally distinct horizontal zone architectures inside [x0, x1).
 * Every archetype guarantees safe jump/dash reachability from leftFloor (x0) to rightFloor (x1).
 */
export function buildZoneArchetype(
  p: PainterLike,
  archetype: number,
  x0: number,
  x1: number,
  leftFloor: number,
  rightFloor: number,
  palette: ZoneThemePalette,
  seed: number,
  role: 'west_approach' | 'mid_viaduct' | 'east_bastion',
  chIdx: number,
  sIdx: number
): void {
  const R = p.rows;
  const w = Math.max(24, x1 - x0);
  const { hazardTile, midTile, gripTile, e0, e1, e2 } = palette;
  const lFl = clampRow(R, leftFloor, 10, 4);
  const rFl = clampRow(R, rightFloor, 10, 4);
  const safeMid = midTile === TileType.CRUMBLE ? TileType.SOLID : midTile;
  const variantSign = layoutHash(chIdx, sIdx, seed, 11) % 2 === 0 ? 1 : -1;

  // Solid edge piers guaranteeing seamless entry/exit at zone boundaries
  const lPierW = 6 + (layoutHash(chIdx, sIdx, seed, 1) % 3); // 6..8
  const rPierW = 6 + (layoutHash(chIdx, sIdx, seed, 2) % 3); // 6..8
  p.cliff(x0, lFl, lPierW, TileType.SOLID);
  p.cliff(x1 - rPierW, rFl, rPierW, TileType.SOLID);

  const gStart = x0 + lPierW;
  const gEnd = x1 - rPierW;
  const gW = Math.max(8, gEnd - gStart);
  const midX = Math.floor((gStart + gEnd) * 0.5);
  const q1X = gStart + Math.max(2, Math.floor(gW * 0.25));
  const q3X = gStart + Math.max(4, Math.floor(gW * 0.75));
  const enemyChoice: EntityKind = role === 'west_approach' ? e0 : role === 'mid_viaduct' ? e1 : e2;

  const arch = ((archetype % 10) + 10) % 10;

  if (arch === 0) {
    // ARCHETYPE 0: Twin-Tier Aqueduct & Suspended Skywalk
    p.rect(gStart, R - 4, gW, 2, TileType.WATER);
    const bridgeY = clampRow(R, Math.round((lFl + rFl) * 0.5), 11, 5);
    const pierW = Math.min(10, Math.max(6, Math.floor(gW * 0.32)));
    const pierX = midX - Math.floor(pierW * 0.5);
    p.cliff(pierX, bridgeY, pierW, TileType.SOLID);
    p.island(Math.max(gStart + 1, q1X - 3), clampRow(R, bridgeY - 1, 9, 6), 5, 2, safeMid);
    p.island(Math.min(gEnd - 6, q3X - 2), clampRow(R, bridgeY + 1, 9, 5), 5, 2, gripTile);
    const skyY = Math.max(6, bridgeY - 6);
    p.rect(midX - 7, skyY, 14, 1, TileType.ONE_WAY);
    p.add('speed_pad', x0 + 2, lFl - 1);
    p.add('astral_coin', q1X, bridgeY - 3);
    p.add('astral_coin', q3X, bridgeY - 2);
    p.add('quest_beacon', midX, skyY - 2);
    p.add(enemyChoice, midX - 1, bridgeY - 2, { patrolDist: 24, isElite: role !== 'west_approach' });
  } else if (arch === 1) {
    // ARCHETYPE 1: Stepped Ruin Cascade (Ascending or Descending Terraces)
    fillHazardBed(p, gStart, gW, R, hazardTile);
    const dir = variantSign;
    const baseY = clampRow(R, Math.round((lFl + rFl) * 0.5), 11, 5);
    const yA = clampRow(R, baseY + dir * 2, 9, 5);
    const yB = clampRow(R, baseY - dir * 1, 9, 5);
    const yC = clampRow(R, baseY - dir * 3, 8, 6);
    p.cliff(gStart + 2, yA, 6, TileType.SOLID);
    p.island(midX - 4, yB, 8, 2, safeMid);
    p.cliff(gEnd - 9, yC, 6, gripTile);
    p.rect(midX - 5, Math.max(5, yB - 5), 10, 1, TileType.ONE_WAY);
    p.add('boost_hoop', midX, Math.max(5, yB - 3));
    p.add('astral_coin', gStart + 4, yA - 2);
    p.add('astral_coin', gEnd - 6, yC - 2);
    if (role === 'west_approach') p.add('lore_tablet', midX, Math.max(4, yB - 7));
    else p.add('quest_beacon', midX, Math.max(4, yB - 7));
    p.add(enemyChoice, midX - 1, yB - 2, { patrolDist: 20, isElite: role === 'east_bastion' });
  } else if (arch === 2) {
    // ARCHETYPE 2: Sunken Treasure Crypt & Breakable Spire
    p.rect(gStart, R - 4, Math.max(4, midX - 6 - gStart), 2, TileType.WATER);
    p.rect(midX + 6, R - 4, Math.max(4, gEnd - (midX + 6)), 2, hazardTile);
    const cryptTop = clampRow(R, R - 8, 12, 6);
    p.cliff(midX - 6, cryptTop, 12, TileType.SOLID);
    // Carve secret chamber inside central pier
    if (cryptTop + 5 <= R - 2) {
      p.rect(midX - 4, cryptTop + 2, 8, 3, TileType.EMPTY);
      p.rect(midX - 5, cryptTop + 2, 1, 3, TileType.SECRET_WALL);
      p.add('treasure_chest', midX, cryptTop + 3);
      p.add('astral_coin', midX - 2, cryptTop + 3);
    }
    p.island(gStart + 2, Math.max(9, lFl - 2), 6, 2, midTile);
    p.island(gEnd - 8, Math.max(9, rFl - 2), 6, 2, gripTile);
    // Overhead breakable / dream divider + upper shrine deck
    p.rect(midX - 1, Math.max(5, cryptTop - 7), 2, 5, seed % 2 === 0 ? TileType.BREAKABLE : TileType.DREAM_BLOCK);
    p.rect(midX - 6, Math.max(5, cryptTop - 8), 12, 1, TileType.ONE_WAY);
    p.add('quest_beacon', midX + 3, Math.max(4, cryptTop - 10));
    p.add(enemyChoice, midX, cryptTop - 2, { patrolDist: 22, isElite: role !== 'west_approach' });
  } else if (arch === 3) {
    // ARCHETYPE 3: Zip-Rail Grand Gorge & Floating Shrines
    fillHazardBed(p, gStart, gW, R, hazardTile);
    const railY = clampRow(R, Math.min(lFl, rFl) - 2, 9, 7);
    // Emergency lower stepping piers so players never get stranded if missing zip block
    p.island(q1X - 2, clampRow(R, railY + 4, 12, 5), 5, 2, safeMid);
    p.island(midX - 3, clampRow(R, railY + 3, 11, 5), 6, 2, TileType.SOLID);
    p.island(q3X - 2, clampRow(R, railY + 4, 12, 5), 5, 2, gripTile);
    // Upper floating sky-shrines
    p.rect(q1X - 3, Math.max(6, railY - 4), 7, 1, TileType.ONE_WAY);
    p.rect(q3X - 3, Math.max(6, railY - 4), 7, 1, TileType.ONE_WAY);
    p.add('zip_block', gStart + 1, railY, {
      w: 24,
      h: 10,
      tx: Math.max(gStart + 4, gEnd - 5) * TILE_SIZE,
      ty: railY * TILE_SIZE,
    });
    p.add('double_dash_crystal', midX, Math.max(5, railY - 3));
    p.add('quest_beacon', q3X, Math.max(4, railY - 6));
    p.add('astral_coin', q1X, Math.max(4, railY - 6));
    p.add(enemyChoice, midX, clampRow(R, railY + 1, 8, 7), { patrolDist: 18, isElite: role === 'mid_viaduct' });
  } else if (arch === 4) {
    // ARCHETYPE 4: Twin-Chimney Wall-Cling Gauntlet
    fillHazardBed(p, gStart, gW, R, hazardTile);
    const baseLow = clampRow(R, Math.max(lFl, rFl) + 1, 13, 5);
    p.island(gStart + 2, baseLow - 2, 5, 2, TileType.SOLID);
    p.island(gEnd - 7, baseLow - 2, 5, 2, TileType.SOLID);
    // Two tall climbable monolith towers framing a central sky-bridge
    const colL = midX - 5;
    const colR = midX + 3;
    const wallTop = Math.max(6, baseLow - 11);
    p.rect(colL, wallTop, 2, baseLow - wallTop - 1, gripTile);
    p.rect(colR, wallTop, 2, baseLow - wallTop - 1, gripTile);
    // Lower safe floor between towers
    p.cliff(colL - 1, baseLow, 12, TileType.SOLID);
    // Top summit crown linking both walls
    p.rect(colL - 2, wallTop - 1, 14, 1, TileType.ONE_WAY);
    p.add('dash_crystal', midX, wallTop + 4);
    p.add('grapple_anchor', midX, Math.max(4, wallTop - 4));
    p.add('quest_beacon', midX, wallTop - 3);
    p.add('astral_coin', midX, baseLow - 3);
    p.add(enemyChoice, colL + 3, baseLow - 2, { patrolDist: 20, isElite: role === 'east_bastion' });
  } else if (arch === 5) {
    // ARCHETYPE 5: Cloud-Bounce Sky Archipelago
    fillHazardBed(p, gStart, gW, R, TileType.WATER);
    const skyBase = clampRow(R, Math.round((lFl + rFl) * 0.5), 11, 5);
    p.island(q1X - 3, clampRow(R, skyBase + 1, 10, 5), 6, 1, TileType.CLOUD_BOUNCE);
    p.island(midX - 3, clampRow(R, skyBase - 3, 8, 6), 6, 1, TileType.CLOUD_BOUNCE);
    p.island(q3X - 3, clampRow(R, skyBase, 10, 5), 6, 1, TileType.CLOUD_BOUNCE);
    // High sanctuary ledge reachable by bounce
    const topY = Math.max(5, skyBase - 8);
    p.rect(midX - 5, topY, 10, 1, TileType.ONE_WAY);
    p.add('bounce_shroom', x0 + 4, lFl - 1);
    p.add('bumper_orb', q1X, Math.max(5, skyBase - 4));
    p.add('bumper_orb', q3X, Math.max(5, skyBase - 4));
    p.add('quest_beacon', midX, topY - 2);
    p.add('astral_coin', midX - 2, topY - 2);
    p.add('astral_coin', midX + 2, topY - 2);
    p.add(enemyChoice, q3X, Math.max(5, skyBase - 2), { patrolDist: 22 });
  } else if (arch === 6) {
    // ARCHETYPE 6: Pressure-Plate Drawbridge & Split-Route Gorge
    fillHazardBed(p, gStart, gW, R, hazardTile);
    const bridgeY = clampRow(R, Math.round((lFl + rFl) * 0.5), 12, 5);
    const upperY = Math.max(7, bridgeY - 5);
    // Upper cliff housing the pressure plate
    p.island(x0 + 3, upperY, 6, 2, TileType.SOLID);
    p.rect(x0 + 2, bridgeY - 2, 4, 1, TileType.ONE_WAY);
    p.add('pressure_plate', x0 + 5, upperY - 1);
    p.add('plate_bridge', gStart + 2, bridgeY, { w: Math.max(48, Math.min(112, (gW - 4) * TILE_SIZE)), h: 8 });
    // Alternate lower stepping piers for fearless jumpers
    p.island(q1X - 2, clampRow(R, bridgeY + 3, 12, 5), 5, 2, safeMid);
    p.island(midX - 3, clampRow(R, bridgeY + 2, 12, 5), 6, 2, TileType.SOLID);
    p.island(q3X - 2, clampRow(R, bridgeY + 3, 12, 5), 5, 2, gripTile);
    p.rect(midX - 4, Math.max(5, upperY - 2), 8, 1, TileType.ONE_WAY);
    p.add('quest_beacon', midX, Math.max(3, upperY - 4));
    p.add('astral_coin', midX, bridgeY - 2);
    p.add(enemyChoice, midX, clampRow(R, bridgeY, 8, 6), { patrolDist: 22, isElite: role === 'mid_viaduct' });
  } else if (arch === 7) {
    // ARCHETYPE 7: Phasing Dream-Rift Chamber
    fillHazardBed(p, gStart, gW, R, hazardTile);
    const midY = clampRow(R, Math.round((lFl + rFl) * 0.5) - 1, 10, 6);
    p.island(q1X - 3, midY + 1, 6, 2, TileType.DREAM_BLOCK);
    p.cliff(midX - 4, midY - 1, 8, TileType.DREAM_BLOCK);
    p.island(q3X - 3, midY + 1, 6, 2, TileType.DREAM_BLOCK);
    // Solid anchor balcony & lower recovery ledge so non-dash timing never softlocks
    p.rect(midX - 5, Math.max(6, midY - 5), 10, 1, TileType.ONE_WAY);
    p.rect(q1X - 2, clampRow(R, midY + 4, 13, 4), 5, 1, TileType.ONE_WAY);
    p.rect(q3X - 2, clampRow(R, midY + 4, 13, 4), 5, 1, TileType.ONE_WAY);
    p.add('double_dash_crystal', q1X, Math.max(5, midY - 2));
    p.add('echo_mirror', x0 + 3, lFl - 2);
    p.add('quest_beacon', midX, Math.max(4, midY - 7));
    p.add('astral_coin', midX, midY - 3);
    p.add(enemyChoice, x1 - 4, rFl - 2, { patrolDist: 18, isElite: role === 'east_bastion' });
  } else if (arch === 8) {
    // ARCHETYPE 8: Hanging Cavern Ceiling & Tether Pendulum Chasm
    fillHazardBed(p, gStart, gW, R, hazardTile);
    // Dramatic hanging stalactite masses framing the upper cavern
    p.ceilingMass(q1X - 3, 7, 4, TileType.SOLID);
    p.ceilingMass(q3X - 3, 7, 4, TileType.SOLID);
    const bridgeY = clampRow(R, Math.round((lFl + rFl) * 0.5) + 1, 12, 5);
    p.island(gStart + 3, bridgeY, 6, 2, midTile === TileType.CRUMBLE ? TileType.FRAGILE_GLASS : safeMid);
    p.island(midX - 4, bridgeY - 2, 8, 2, TileType.SOLID);
    p.island(gEnd - 9, bridgeY, 6, 2, TileType.FRAGILE_GLASS);
    p.rect(midX - 4, Math.max(6, bridgeY - 7), 8, 1, TileType.ONE_WAY);
    p.add('tether_ring', midX, 6);
    p.add('grapple_anchor', q1X, 8);
    p.add('grapple_anchor', q3X, 8);
    p.add('quest_beacon', midX, Math.max(4, bridgeY - 9));
    p.add('astral_coin', midX, bridgeY - 4);
    p.add(enemyChoice, midX, bridgeY - 4, { patrolDist: 22, isElite: true });
  } else {
    // ARCHETYPE 9: Colosseum Bastion & Elite Amphitheater
    const pitFloor = clampRow(R, Math.max(lFl, rFl) + 1, 13, 4);
    p.cliff(gStart, pitFloor, gW, TileType.SOLID);
    // Asymmetric side moat dips on flanks
    if (gW >= 18) {
      p.rect(gStart + 1, pitFloor, 3, 2, hazardTile === TileType.WATER ? TileType.WATER : TileType.ONE_WAY);
      p.rect(gEnd - 4, pitFloor, 3, 2, hazardTile === TileType.WATER ? TileType.WATER : TileType.ONE_WAY);
    }
    const tierY1 = Math.max(10, pitFloor - 4);
    const tierY2 = Math.max(6, pitFloor - 8);
    p.rect(gStart + 4, tierY1, 6, 1, TileType.ONE_WAY);
    p.rect(gEnd - 10, tierY1, 6, 1, TileType.ONE_WAY);
    p.rect(midX - 6, tierY2, 12, 1, TileType.ONE_WAY);
    p.add('treasure_chest', x1 - 4, rFl - 2);
    p.add('quest_beacon', midX, tierY2 - 2);
    p.add('shield_orb', midX, tierY1 - 2);
    p.add('astral_coin', gStart + 6, tierY1 - 2);
    p.add('astral_coin', gEnd - 7, tierY1 - 2);
    p.add(enemyChoice, midX, pitFloor - 2, { patrolDist: 30, isElite: true });
  }

  // Role-specific reliable progression landmarks & secret rewards
  if (role === 'west_approach') {
    if (arch !== 1) p.add('lore_tablet', Math.min(x1 - 5, x0 + 5), Math.max(4, lFl - 2));
    p.add('checkpoint_totem', x1 - 4, rFl - 2);
  } else if (role === 'mid_viaduct') {
    p.add('checkpoint_totem', x0 + 4, lFl - 2);
    p.add('dash_crystal', midX - 5, Math.max(4, clampRow(R, lFl, 9, 6) - 4));
  } else {
    p.add('checkpoint_totem', x1 - 5, rFl - 2);
    if (arch !== 2 && w >= 42) {
      p.add('boost_hoop', q1X, Math.max(6, lFl - 4));
    }
  }
}

/**
 * Renders one of 4 distinct vertical tower/citadel organizations for tall stages (R >= 32).
 */
export function buildVerticalTowerLayout(
  p: PainterLike,
  chIdx: number,
  stageIdx: number,
  leftFloor: number,
  rightFloor: number,
  palette: ZoneThemePalette
): void {
  const C = p.cols;
  const R = p.rows;
  const { hazardTile, midTile, gripTile, e0, e1, e2 } = palette;
  const th = layoutHash(chIdx + 1, stageIdx + 1, 77, 13);
  const towerStyle = (layoutHash(chIdx + 1, 5, 77, 13) + stageIdx + (stageIdx >= 5 ? 2 : 0)) % 4;
  const flip = (th & 1) === 1;
  const jitter = ((th >>> 2) % 3) - 1; // -1, 0, +1
  const safeMid = midTile === TileType.CRUMBLE ? TileType.SOLID : midTile;
  const mx = (rawX: number, width: number) => (flip ? C - rawX - width : rawX);

  p.rect(12, R - 3, C - 24, 2, hazardTile === TileType.WATER ? TileType.WATER : TileType.LIQUID_LETHAL);

  if (towerStyle === 0) {
    // Style 0: Spiral Grand Citadel Ascent (9 sweeping tiers, mirrored/shifted per stage)
    const tierCount = 9;
    const stepSpacing = Math.max(4, Math.floor((R - 12) / tierCount));
    for (let t = 0; t < tierCount; t++) {
      const y = Math.max(7, R - 7 - t * stepSpacing + (t % 2 === 0 ? jitter : 0));
      const side = (t + (th % 3)) % 3;
      const rawX =
        side === 0 ? 9 + ((t * 3 + (th % 5)) % 7) : side === 1 ? Math.floor(C * 0.42) - 4 : C - 24 - ((t * 3) % 7);
      const x = mx(rawX, 12);
      p.island(x, y, 12, 2, t % 3 === 2 ? gripTile : TileType.SOLID);
      const oppRaw = side === 0 ? C - 22 : side === 2 ? 10 : C - 28;
      const oppX = mx(oppRaw, 9);
      p.rect(oppX, y + 1, 9, 1, TileType.ONE_WAY);
      p.add('astral_coin', x + 5, y - 2);
      if (t === 2) p.add('lore_tablet', oppX + 4, y - 1);
      else if (t === 4) {
        p.add('checkpoint_totem', x + 5, y - 2);
        p.add('quest_beacon', oppX + 4, y - 1);
      } else if (t === 6) {
        p.add(e1, x + 5, y - 2, { patrolDist: 28, isElite: true });
        p.add('treasure_chest', oppX + 4, y - 1);
      } else if (t === 7) p.add('quest_beacon', x + 6, y - 2);
    }
    p.rect(Math.floor(C * 0.45) + jitter, 10, 2, Math.min(18, R - 20), gripTile);
    p.rect(Math.floor(C * 0.55) - jitter, 9, 2, Math.min(18, R - 20), TileType.SOLID);
    p.add('dash_crystal', Math.floor(C * 0.5), Math.floor(R * 0.45));
    p.add('double_dash_crystal', Math.floor(C * 0.5), Math.floor(R * 0.25));
    p.add('boost_hoop', Math.floor(C * 0.5), Math.floor(R * 0.65));
  } else if (towerStyle === 1) {
    // Style 1: Twin-Shaft Dual Monolith Spire (West Wing vs East Wing separated by central Spine w/ Windows)
    const spineX = Math.floor(C * 0.5) - 2 + jitter * 2;
    p.rect(spineX, 8, 3, R - 15, gripTile);
    for (const winY of [Math.floor(R * 0.28), Math.floor(R * 0.54), Math.floor(R * 0.77)]) {
      p.rect(spineX, winY, 3, 4, TileType.EMPTY);
      p.rect(spineX - 2, winY + 4, 7, 1, TileType.ONE_WAY);
    }
    for (let t = 0; t < 7; t++) {
      const y = R - 8 - t * 6;
      const lx = mx(t % 2 === 0 ? 12 : 24, 10);
      const rx = mx(t % 2 === 0 ? C - 34 : C - 22, 10);
      p.island(lx, y, 10, 2, t % 2 === 0 ? TileType.SOLID : safeMid);
      p.island(rx, y - 2, 10, 2, t % 2 === 1 ? TileType.SOLID : gripTile);
      if (t === 1) p.add('lore_tablet', lx + 4, y - 2);
      if (t === 3) {
        p.add('checkpoint_totem', rx + 4, y - 4);
        p.add('quest_beacon', lx + 4, y - 2);
      }
      if (t === 5) {
        p.add(e0, lx + 4, y - 2, { patrolDist: 22, isElite: true });
        p.add('treasure_chest', rx + 5, y - 4);
        p.add('quest_beacon', spineX + 1, y - 4);
      }
    }
    p.add('wind_up', mx(Math.floor(C * 0.28), 4), 10, { w: 28, h: (R - 14) * 8 });
    p.add('dash_crystal', mx(Math.floor(C * 0.72), 2), Math.floor(R * 0.42));
  } else if (towerStyle === 2) {
    // Style 2: Hourglass Amphitheater Tower (Broad Lower Plaza -> Narrow Gauntlet -> Broad Sky Terrace)
    const midY = Math.floor(R * 0.52) + jitter * 2;
    const bastionW = 16 + (th % 4);
    p.cliff(14, R - 8, C - 28, TileType.SOLID);
    p.rect(14, midY - 3, bastionW, 5, TileType.SOLID);
    p.rect(C - 14 - bastionW, midY - 3, bastionW, 5, TileType.SOLID);
    p.rect(Math.floor(C * 0.5) - 6, midY + 4, 12, 1, TileType.ONE_WAY);
    p.rect(Math.floor(C * 0.5) - 5, midY - 2, 10, 1, TileType.ONE_WAY);
    p.add('spring_up', Math.floor(C * 0.5), midY + 3);
    p.add('double_dash_crystal', Math.floor(C * 0.5), midY - 6);
    const topY = Math.max(9, midY - 12);
    p.island(14, topY, 16, 2, safeMid);
    p.island(C - 30, topY, 16, 2, gripTile);
    p.rect(Math.floor(C * 0.5) - 8, topY - 4, 16, 1, TileType.ONE_WAY);
    p.add('lore_tablet', flip ? C - 19 : 18, R - 10);
    p.add('checkpoint_totem', Math.floor(C * 0.5), R - 10);
    p.add('quest_beacon', 20, topY - 2);
    p.add('quest_beacon', C - 20, topY - 2);
    p.add('treasure_chest', Math.floor(C * 0.5), topY - 6);
    p.add(e2, Math.floor(C * 0.5), R - 10, { patrolDist: 36, isElite: true });
    p.add(e1, Math.floor(C * 0.5), topY - 6, { patrolDist: 24, isElite: true });
  } else {
    // Style 3: Hanging Sanctuary Bridges & Zip-Lift Atrium
    p.cliff(Math.floor(C * 0.5) - 7 + jitter, R - 7, 14, TileType.SOLID);
    for (let t = 0; t < 6; t++) {
      const y = R - 12 - t * 6;
      const spanW = 13 + ((t + th) % 3) * 2;
      const rawX = t % 2 === 0 ? 14 + t * 2 : C - 14 - spanW - t * 2;
      const x = mx(rawX, spanW);
      p.rect(x, y, spanW, 1, TileType.ONE_WAY);
      p.island(Math.floor(C * 0.5) - 4, y - 2, 8, 2, t % 2 === 0 ? TileType.CLOUD_BOUNCE : safeMid);
      if (t === 1) p.add('lore_tablet', x + 4, y - 2);
      if (t === 2) {
        p.add('checkpoint_totem', Math.floor(C * 0.5), y - 4);
        p.add('quest_beacon', x + 5, y - 2);
      }
      if (t === 4) {
        p.add('quest_beacon', x + 5, y - 2);
        p.add(e1, Math.floor(C * 0.5), y - 4, { patrolDist: 22, isElite: true });
      }
      if (t === 5) p.add('treasure_chest', x + 5, y - 2);
    }
    p.add('zip_block', 14, Math.floor(R * 0.48), {
      w: 24,
      h: 10,
      tx: (C - 18) * TILE_SIZE,
      ty: Math.floor(R * 0.48) * TILE_SIZE,
    });
    p.add('astral_coin', 14, leftFloor - 3);
    p.add('astral_coin', C - 14, rightFloor - 3);
  }
}

/**
 * Generates an entire multi-wing horizontal stage (typically ~186x28) with unique zone boundaries,
 * elevations, and 3 non-repeating zone architectures per (chIdx, stageIdx).
 */
export function buildUniqueHorizontalStage(
  p: PainterLike,
  chIdx: number,
  stageIdx: number,
  pattern: number,
  leftFloor: number,
  rightFloor: number,
  palette: ZoneThemePalette
): void {
  const C = p.cols;
  const R = p.rows;

  // Choose varied zone split ratios & elevations so no two chapters or stages share gridlines
  const splitPresets: [number, number][] = [
    [0.31, 0.67],
    [0.36, 0.70],
    [0.28, 0.62],
    [0.39, 0.73],
    [0.34, 0.65],
    [0.29, 0.71],
  ];
  const [f1, f2] = splitPresets[layoutHash(chIdx, stageIdx, pattern, 3) % splitPresets.length];
  const z1End = Math.floor(C * f1);
  const z2End = Math.floor(C * f2);

  const lFl = clampRow(R, leftFloor, 10, 4);
  const rFl = clampRow(R, rightFloor, 10, 4);
  const delta1 = (layoutHash(chIdx, stageIdx, 19, 1) % 7) - 3; // -3..+3
  const delta2 = (layoutHash(chIdx, stageIdx, 23, 2) % 7) - 3;
  const z1Floor = clampRow(R, Math.round((lFl + rFl) * 0.5) + delta1, 11, 5);
  const z2Floor = clampRow(R, Math.round((lFl + rFl) * 0.5) + delta2, 11, 5);

  p.cliff(2, lFl, 10, TileType.SOLID);
  p.cliff(C - 12, rFl, 10, TileType.SOLID);

  // Pick 3 STRICTLY DISTINCT zone archetypes out of 10!
  const h = layoutHash(chIdx + 1, stageIdx + 1, pattern + 1, 91);
  const arch1 = h % 10;
  let arch2 = (arch1 + 1 + ((h >>> 4) % 9)) % 10;
  let arch3 = (arch2 + 1 + ((h >>> 8) % 8)) % 10;
  if (arch3 === arch1) arch3 = (arch3 + 1) % 10;
  if (arch3 === arch2) arch3 = (arch3 + 1) % 10;

  buildZoneArchetype(p, arch1, 12, z1End, lFl, z1Floor, palette, h + 1, 'west_approach', chIdx, stageIdx);
  buildZoneArchetype(p, arch2, z1End, z2End, z1Floor, z2Floor, palette, h + 2, 'mid_viaduct', chIdx, stageIdx);
  buildZoneArchetype(p, arch3, z2End, C - 12, z2Floor, rFl, palette, h + 3, 'east_bastion', chIdx, stageIdx);
}

/**
 * Generates one of 6 unique Underworld 3x Expansion Wings (`44x24` span), strictly verified
 * for BFS jump/dash reachability (horizontal gap <= 4..5 cols, step-up <= 3..4 rows).
 */
export function buildUniqueUnderworldWing(
  tiles: number[],
  cols: number,
  rows: number,
  entities: RoomEntityDef[],
  prefix: string,
  eidRef: { v: number },
  worldIndex: number,
  stageIdx: number,
  enemies: { a: EntityKind; b: EntityKind; c: EntityKind },
  wingStart: number,
  wingWidth: number,
  leftRow: number,
  rightRow: number,
  wingRole: 'approach' | 'mid_viaduct' | 'vault'
): void {
  const setT = (c: number, r: number, val: number) => {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return;
    tiles[r * cols + c] = val;
  };
  const rectT = (c0: number, r0: number, w: number, h: number, val: number) => {
    for (let dr = 0; dr < h; dr++) {
      for (let dc = 0; dc < w; dc++) {
        setT(c0 + dc, r0 + dr, val);
      }
    }
  };
  const clampR = (r: number) => Math.max(9, Math.min(rows - 4, r));
  const lFloor = clampR(leftRow);
  const rFloor = clampR(rightRow);
  const midC = wingStart + Math.floor(wingWidth * 0.5);
  const midFloor = clampR(Math.round((lFloor + rFloor) * 0.5) - 1);

  const addE = (kind: EntityKind, c: number, r: number, extra: Partial<RoomEntityDef> = {}) => {
    entities.push({
      id: `${prefix}_e${eidRef.v++}`,
      kind,
      x: c * TILE_SIZE,
      y: r * TILE_SIZE,
      ...extra,
    });
  };

  // Clear interior air & bedrock
  rectT(wingStart, 1, wingWidth, rows - 2, TileType.EMPTY);
  rectT(wingStart, 0, wingWidth, 1, TileType.SOLID);
  rectT(wingStart, rows - 2, wingWidth, 2, TileType.SOLID);

  const poolKind = worldIndex % 3 === 1 ? TileType.WATER : TileType.LIQUID_LETHAL;
  rectT(wingStart + 6, rows - 3, wingWidth - 12, 1, poolKind);

  // Solid West & East docks matching exact seam rows
  rectT(wingStart, lFloor, 8, rows - lFloor, TileType.SOLID);
  rectT(wingStart + wingWidth - 8, rFloor, 8, rows - rFloor, TileType.SOLID);

  const roleOffset = wingRole === 'approach' ? 1 : wingRole === 'mid_viaduct' ? 3 : 5;
  const archetype = layoutHash(worldIndex + 1, stageIdx + 1, roleOffset, 47) % 6;

  // Helpers for guaranteed reachable stepping layout (max gap <= 4 cols, step-up <= 3 rows)
  let beaconCol = midC;
  let beaconRow = Math.max(4, midFloor - 6);
  let loreCol = wingStart + 13;
  let loreRow = Math.max(4, lFloor - 6);
  let chestCol = wingStart + wingWidth - 14;
  let chestRow = Math.max(4, rFloor - 6);
  let enemyCol = midC;
  let enemyRow = midFloor - 2;

  if (archetype === 0) {
    // 0: Asymmetric Twin-Spire Viaduct
    const d1Y = clampR(lFloor - 2);
    const d2Y = clampR(midFloor - 2);
    const d3Y = clampR(rFloor - 1);
    rectT(wingStart + 11, d1Y, 6, 2, TileType.SOLID);
    rectT(midC - 3, d2Y, 7, rows - d2Y, TileType.SOLID);
    rectT(wingStart + wingWidth - 17, d3Y, 6, 2, TileType.SOLID);
    rectT(wingStart + 11, Math.max(5, d1Y - 4), 6, 1, TileType.ONE_WAY);
    rectT(midC - 4, Math.max(5, d2Y - 5), 8, 1, TileType.ONE_WAY);
    rectT(wingStart + wingWidth - 17, Math.max(5, d3Y - 4), 6, 1, TileType.ONE_WAY);
    loreCol = wingStart + 13;
    loreRow = Math.max(3, d1Y - 6);
    beaconCol = midC;
    beaconRow = Math.max(3, d2Y - 7);
    chestCol = wingStart + wingWidth - 15;
    chestRow = Math.max(3, d3Y - 6);
    enemyCol = midC;
    enemyRow = d2Y - 2;
  } else if (archetype === 1) {
    // 1: Stepped Descending/Ascending Ossuary Terraces
    const up = (worldIndex + stageIdx) % 2 === 0 ? -1 : 1;
    const y1 = clampR(lFloor + up * 1);
    const y2 = clampR(lFloor + up * 2);
    const y3 = clampR(rFloor + up * 1);
    rectT(wingStart + 10, y1, 7, rows - y1, TileType.SOLID);
    rectT(midC - 4, y2, 8, 2, TileType.SOLID);
    rectT(wingStart + wingWidth - 18, y3, 7, rows - y3, TileType.SOLID);
    rectT(midC - 5, Math.max(5, y2 - 5), 10, 1, TileType.ONE_WAY);
    rectT(wingStart + 11, Math.max(5, y1 - 4), 5, 1, TileType.ONE_WAY);
    loreCol = wingStart + 13;
    loreRow = Math.max(3, y1 - 6);
    beaconCol = midC;
    beaconRow = Math.max(3, y2 - 7);
    chestCol = wingStart + wingWidth - 15;
    chestRow = y3 - 2;
    enemyCol = midC - 1;
    enemyRow = y2 - 2;
  } else if (archetype === 2) {
    // 2: Split Catacomb (Solid Lower Causeway + Upper One-Way Skywalk Sanctuary)
    const lowY = clampR(Math.max(lFloor, rFloor), 14, 4);
    const highY = Math.max(8, lowY - 6);
    rectT(wingStart + 10, lowY, 7, 2, TileType.SOLID);
    rectT(midC - 4, lowY - 1, 9, 2, TileType.SOLID);
    rectT(wingStart + wingWidth - 17, lowY, 7, 2, TileType.SOLID);
    // Upper continuous skywalk stepped cleanly from West/East
    rectT(wingStart + 9, lowY - 3, 5, 1, TileType.ONE_WAY);
    rectT(wingStart + 15, highY, 15, 1, TileType.ONE_WAY);
    rectT(wingStart + wingWidth - 14, lowY - 3, 5, 1, TileType.ONE_WAY);
    loreCol = wingStart + 17;
    loreRow = highY - 2;
    beaconCol = midC;
    beaconRow = highY - 2;
    chestCol = wingStart + wingWidth - 15;
    chestRow = lowY - 2;
    enemyCol = midC;
    enemyRow = lowY - 3;
  } else if (archetype === 3) {
    // 3: Spring & Sky-Island Void Chasm (Spring bounce up + mid stepping bridges)
    const mY = clampR(midFloor);
    rectT(wingStart + 10, mY, 6, 2, TileType.SOLID);
    rectT(midC - 4, Math.max(10, mY - 3), 8, 2, TileType.CLOUD_BOUNCE);
    rectT(wingStart + wingWidth - 16, mY, 6, 2, TileType.SOLID);
    rectT(midC - 5, Math.max(5, mY - 7), 10, 1, TileType.ONE_WAY);
    addE('spring_up', wingStart + 12, mY - 1);
    loreCol = wingStart + 13;
    loreRow = mY - 2;
    beaconCol = midC;
    beaconRow = Math.max(3, mY - 9);
    chestCol = wingStart + wingWidth - 14;
    chestRow = mY - 2;
    enemyCol = midC + 1;
    enemyRow = Math.max(5, mY - 9);
  } else if (archetype === 4) {
    // 4: Twin Monolith Gatehouse & Suspended Center Altar
    const gateY = clampR(Math.round((lFloor + rFloor) * 0.5));
    rectT(wingStart + 10, gateY, 6, rows - gateY, TileType.SOLID);
    rectT(midC - 5, Math.max(10, gateY - 2), 10, 2, TileType.SOLID);
    rectT(wingStart + wingWidth - 16, gateY, 6, rows - gateY, TileType.SOLID);
    // Overhead monolith crown
    rectT(wingStart + 13, 3, 2, Math.max(2, gateY - 9), TileType.SOLID);
    rectT(wingStart + wingWidth - 15, 3, 2, Math.max(2, gateY - 9), TileType.SOLID);
    rectT(midC - 4, Math.max(5, gateY - 6), 8, 1, TileType.ONE_WAY);
    loreCol = wingStart + 12;
    loreRow = gateY - 2;
    beaconCol = midC;
    beaconRow = Math.max(3, gateY - 8);
    chestCol = wingStart + wingWidth - 14;
    chestRow = gateY - 2;
    enemyCol = midC;
    enemyRow = Math.max(6, gateY - 4);
  } else {
    // 5: Staggered Bridge Viaduct w/ Lower Refuge Shelf & High Shrine
    const stepA = clampR(lFloor - 1);
    const stepB = clampR(midFloor + 1);
    const stepC = clampR(rFloor - 2);
    rectT(wingStart + 10, stepA, 7, 2, TileType.SOLID);
    rectT(midC - 3, stepB, 7, 2, TileType.SOLID);
    rectT(wingStart + wingWidth - 17, stepC, 7, 2, TileType.SOLID);
    rectT(wingStart + 11, Math.max(5, stepA - 4), 5, 1, TileType.ONE_WAY);
    rectT(midC - 4, Math.max(5, stepB - 5), 8, 1, TileType.ONE_WAY);
    rectT(wingStart + wingWidth - 16, Math.max(5, stepC - 4), 5, 1, TileType.ONE_WAY);
    loreCol = wingStart + 13;
    loreRow = Math.max(3, stepA - 6);
    beaconCol = midC;
    beaconRow = Math.max(3, stepB - 7);
    chestCol = wingStart + wingWidth - 14;
    chestRow = Math.max(3, stepC - 6);
    enemyCol = midC;
    enemyRow = stepB - 2;
  }

  addE('astral_coin', wingStart + 12, Math.max(3, lFloor - 3));
  addE('astral_coin', beaconCol - 2, beaconRow);
  addE('astral_coin', wingStart + wingWidth - 13, Math.max(3, rFloor - 3));
  addE('dash_crystal', midC - 6, Math.max(4, midFloor - 3));

  if (wingRole === 'approach') {
    addE('lore_tablet', loreCol, loreRow);
    addE('quest_beacon', beaconCol, beaconRow);
    addE('checkpoint_totem', wingStart + wingWidth - 5, rFloor - 2);
    addE(enemies.a, enemyCol, enemyRow, { patrolDist: 20 });
  } else if (wingRole === 'mid_viaduct') {
    addE('checkpoint_totem', wingStart + 4, lFloor - 2);
    addE('quest_beacon', beaconCol, beaconRow);
    addE('treasure_chest', chestCol, chestRow);
    addE(enemies.b, enemyCol, enemyRow, { patrolDist: 20, isElite: true });
  } else {
    addE('checkpoint_totem', wingStart + 4, lFloor - 2);
    addE('quest_beacon', beaconCol, beaconRow);
    addE('treasure_chest', chestCol, chestRow);
    addE('relic', loreCol, loreRow);
    addE(enemies.c, enemyCol, enemyRow, { patrolDist: 20, isElite: true });
  }
}

/**
 * Builds 1 of 6 distinct Start Camp architectures for Chapters 21..50 (Stage 1 core 62x26).
 */
export function buildNew30UniqueStart(
  p: PainterLike,
  idx: number,
  meta: {
    id: BiomeId;
    npcId: string;
    enemyPair: [EntityKind, EntityKind, EntityKind];
    midTile: number;
    gripTile: number;
    hazardTile: number;
  },
  rightRow: number,
  addDecor: (p: PainterLike, biome: BiomeId) => void
): void {
  const variant = idx % 6;
  const [e0, e1] = meta.enemyPair;
  const safeMid = meta.midTile === TileType.CRUMBLE ? TileType.SOLID : meta.midTile;
  const rFl = Math.max(10, Math.min(22, rightRow));

  p.cliff(2, 21, 14, TileType.SOLID);
  p.cliff(38, rFl, 22, TileType.SOLID);
  if (meta.hazardTile === TileType.SPIKE_UP) p.spikes(16, 23, 22, 'up');
  else p.rect(16, 22, 22, 4, meta.hazardTile);

  if (variant === 0) {
    // Classic Cliffside Outpost + Floating Pier
    p.island(19, 17, 7, 2, safeMid);
    p.island(29, 13, 6, 2, meta.gripTile);
    p.add('grapple_anchor', 25, 9);
    p.add('relic', 31, 10);
  } else if (variant === 1) {
    // Upper Archway Sanctuary + Lower Sprint Bridge
    p.island(18, 19, 8, 2, TileType.SOLID);
    p.island(29, 17, 7, 2, safeMid);
    p.rect(17, 12, 10, 1, TileType.ONE_WAY);
    p.rect(29, 10, 8, 1, TileType.ONE_WAY);
    p.add('speed_pad', 12, 20);
    p.add('relic', 32, 8);
  } else if (variant === 2) {
    // Twin-Tower Gap w/ Zip-Block Crossing
    p.cliff(25, 16, 8, TileType.SOLID);
    p.rect(24, 10, 10, 1, TileType.ONE_WAY);
    p.add('zip_block', 17, 15, { w: 24, h: 10, tx: 35 * TILE_SIZE, ty: 12 * TILE_SIZE });
    p.add('relic', 28, 8);
  } else if (variant === 3) {
    // Cloud Bounce Sky-Step Approach
    p.island(18, 18, 6, 1, TileType.CLOUD_BOUNCE);
    p.island(27, 14, 6, 1, safeMid);
    p.rect(21, 9, 8, 1, TileType.ONE_WAY);
    p.add('bounce_shroom', 13, 20);
    p.add('relic', 24, 7);
  } else if (variant === 4) {
    // Hanging Ceiling Gorge + Dream Phasing Monolith
    p.ceilingMass(20, 10, 5, TileType.SOLID);
    p.island(18, 16, 6, 2, TileType.DREAM_BLOCK);
    p.island(28, 14, 7, 2, meta.gripTile);
    p.add('tether_ring', 25, 9);
    p.add('relic', 30, 11);
  } else {
    // Colosseum Stepped Balcony w/ Pressure Bridge
    p.island(6, 14, 7, 2, TileType.SOLID);
    p.island(28, 16, 6, 2, safeMid);
    p.add('pressure_plate', 8, 13);
    p.add('plate_bridge', 17, 18, { w: 80, h: 8 });
    p.add('relic', 30, 13);
  }

  addDecor(p, meta.id);
  p.add('campfire', 5, 20);
  p.add('npc', 11, 20, { npcId: meta.npcId });
  p.add('rift_trial', 42, rFl - 2);
  p.add('double_dash_crystal', 24, 12);
  p.add('astral_coin', 21, 14);
  p.add('astral_coin', 45, rFl - 2);
  p.add(variant % 2 === 0 ? e0 : e1, 50, rFl - 2, { patrolDist: 22 });
}

/**
 * Builds 1 of 6 distinct Sanctuary Stage (`sIdx === 5`) architectures for Chapters 21..50 (60x26).
 */
export function buildNew30UniqueSanctuary(
  p: PainterLike,
  idx: number,
  meta: {
    id: BiomeId;
    enemyPair: [EntityKind, EntityKind, EntityKind];
    midTile: number;
    gripTile: number;
    hazardTile: number;
  },
  leftRow: number,
  rightRow: number,
  addDecor: (p: PainterLike, biome: BiomeId) => void
): void {
  const variant = (idx + 2) % 6;
  const [, e1, e2] = meta.enemyPair;
  const lFl = Math.max(10, Math.min(22, leftRow));
  const rFl = Math.max(10, Math.min(22, rightRow));
  const safeMid = meta.midTile === TileType.CRUMBLE ? TileType.SOLID : meta.midTile;

  p.cliff(2, lFl, 16, TileType.SOLID);
  p.cliff(38, rFl, 20, TileType.SOLID);
  if (meta.hazardTile === TileType.WATER) p.rect(18, 22, 20, 4, TileType.WATER);
  else p.spikes(18, 23, 20, 'up');

  if (variant === 0) {
    p.island(21, 15, 7, 2, safeMid);
    p.rect(28, 11, 8, 1, TileType.ONE_WAY);
    p.add('relic', 31, 9);
  } else if (variant === 1) {
    // Elevated Central Altar Island
    p.cliff(24, 16, 10, TileType.SOLID);
    p.rect(18, 13, 5, 1, TileType.ONE_WAY);
    p.rect(34, 13, 5, 1, TileType.ONE_WAY);
    p.add('relic', 28, 14);
  } else if (variant === 2) {
    // Twin Arch Grotto w/ Underground Vault
    p.cliff(22, 18, 12, TileType.SOLID);
    p.rect(24, 19, 8, 3, TileType.EMPTY);
    p.rect(23, 19, 1, 3, TileType.SECRET_WALL);
    p.rect(23, 12, 10, 1, TileType.ONE_WAY);
    p.add('treasure_chest', 28, 20);
    p.add('relic', 27, 10);
  } else if (variant === 3) {
    // Bounce Oasis + Sky Terrace
    p.island(20, 17, 6, 1, TileType.CLOUD_BOUNCE);
    p.island(29, 14, 6, 2, meta.gripTile);
    p.rect(23, 9, 10, 1, TileType.ONE_WAY);
    p.add('relic', 28, 7);
  } else if (variant === 4) {
    // Stepped Cloister w/ Dream-Block Bridge
    p.island(20, 15, 6, 2, TileType.DREAM_BLOCK);
    p.island(29, 15, 6, 2, TileType.DREAM_BLOCK);
    p.rect(24, 10, 8, 1, TileType.ONE_WAY);
    p.add('relic', 27, 8);
  } else {
    // Twin Pillars + Grapple Atrium
    p.rect(22, 13, 3, 10, meta.gripTile);
    p.rect(32, 13, 3, 10, meta.gripTile);
    p.rect(20, 12, 17, 1, TileType.ONE_WAY);
    p.add('grapple_anchor', 28, 8);
    p.add('relic', 28, 10);
  }

  addDecor(p, meta.id);
  p.add('campfire', 7, lFl - 1);
  p.add('blessing_shrine', 13, lFl - 2);
  p.add('double_dash_crystal', 26, 9);
  p.add(e1, 46, rFl - 2, { patrolDist: 20 });
  p.add(e2, 26, 9, { patrolDist: 18 });
  p.add('astral_coin', 24, 13);
}

/**
 * Builds 1 of 6 distinct Boss Arena architectures for Chapters 21..50 (Stage 10 core 62x28).
 */
export function buildNew30UniqueBossArena(
  p: PainterLike,
  idx: number,
  meta: {
    id: BiomeId;
    boss: EntityKind;
    midTile: number;
    gripTile: number;
    hazardTile: number;
    isFinalSummit?: boolean;
  },
  leftRow: number,
  addDecor: (p: PainterLike, biome: BiomeId) => void
): void {
  const variant = idx % 6;
  const arenaSafeMid = meta.midTile === TileType.CRUMBLE ? TileType.ONE_WAY : meta.midTile;
  p.cliff(2, leftRow, 11, TileType.SOLID);
  p.cliff(49, 17, 11, TileType.SOLID);

  if (variant === 0) {
    // 0: Grand Amphitheater w/ Twin Perches & Center Sky Deck
    p.cliff(13, 21, 36, TileType.SOLID);
    p.rect(14, 15, 7, 1, arenaSafeMid);
    p.rect(25, 11, 12, 1, TileType.ONE_WAY);
    p.rect(41, 15, 7, 1, arenaSafeMid);
  } else if (variant === 1) {
    // 1: Split-Moat Bastion (Safe Central Pedestal + Twin Shallow Pools + Bounce Shrooms)
    p.cliff(13, 22, 8, TileType.SOLID);
    p.rect(21, 22, 6, 4, TileType.WATER);
    p.cliff(27, 19, 8, TileType.SOLID);
    p.rect(35, 22, 6, 4, TileType.WATER);
    p.cliff(41, 22, 8, TileType.SOLID);
    p.rect(14, 14, 8, 1, TileType.ONE_WAY);
    p.rect(25, 10, 12, 1, TileType.ONE_WAY);
    p.rect(40, 14, 8, 1, TileType.ONE_WAY);
    p.add('bounce_shroom', 16, 21);
    p.add('bounce_shroom', 45, 21);
  } else if (variant === 2) {
    // 2: Twin High-Spire Colosseum (Stepped Tiered Wings + Floating Cloud Bridge)
    p.cliff(13, 21, 36, TileType.SOLID);
    p.island(15, 16, 6, 2, meta.gripTile);
    p.island(41, 16, 6, 2, meta.gripTile);
    p.rect(24, 12, 14, 1, TileType.CLOUD_BOUNCE);
    p.rect(12, 11, 5, 1, TileType.ONE_WAY);
    p.rect(45, 11, 5, 1, TileType.ONE_WAY);
  } else if (variant === 3) {
    // 3: Rift Pillar Sanctum (Climbable Side Monoliths + Mid-Air Dream Core)
    p.cliff(13, 21, 36, TileType.SOLID);
    p.rect(18, 13, 2, 8, meta.gripTile);
    p.rect(42, 13, 2, 8, meta.gripTile);
    p.rect(25, 16, 12, 2, TileType.DREAM_BLOCK);
    p.rect(24, 10, 14, 1, TileType.ONE_WAY);
  } else if (variant === 4) {
    // 4: Floating Sky-Island Ring Arena (Multi-Level Platforms over Safe Sub-Floor)
    p.cliff(13, 23, 36, TileType.SOLID);
    p.island(15, 18, 8, 2, TileType.SOLID);
    p.island(39, 18, 8, 2, TileType.SOLID);
    p.island(26, 15, 10, 2, arenaSafeMid);
    p.rect(18, 11, 7, 1, TileType.ONE_WAY);
    p.rect(37, 11, 7, 1, TileType.ONE_WAY);
  } else {
    // 5: Crowned Sanctuary Courtyard (Sunken Center Pit + Flanking Arch Bridges)
    p.cliff(13, 20, 10, TileType.SOLID);
    p.cliff(23, 23, 16, TileType.SOLID);
    p.cliff(39, 20, 10, TileType.SOLID);
    p.rect(15, 14, 7, 1, TileType.ONE_WAY);
    p.rect(25, 12, 12, 1, TileType.ONE_WAY);
    p.rect(40, 14, 7, 1, TileType.ONE_WAY);
  }

  if (meta.isFinalSummit) {
    p.rect(25, 18, 12, 2, TileType.DREAM_BLOCK);
    p.island(4, 9, 5, 2, TileType.SOLID);
    p.island(53, 9, 5, 2, TileType.SOLID);
  }

  addDecor(p, meta.id);
  p.add('grapple_anchor', 22, 9);
  p.add('grapple_anchor', 39, 9);
  p.add('double_dash_crystal', 16, 13);
  p.add('double_dash_crystal', 45, 13);
  p.add('shield_orb', 30, 9);
  p.add('heal_orb', 8, 14);
  p.add('elemental_totem', 16, 19);
  p.add('echo_mirror', 45, 13);
  p.add('astral_coin', 27, 9);
  p.add('astral_coin', 34, 9);
  p.add('relic', 30, 19);
  p.add(meta.boss, 31, 8);
  p.add(meta.isFinalSummit ? 'summit_heart' : 'chapter_goal', 53, 15);
}
