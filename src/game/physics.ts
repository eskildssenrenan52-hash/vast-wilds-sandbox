// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import {
  AssistOptions,
  BlessingUpgrades,
  InputState,
  PlayerState,
  ROOM_COLS,
  ROOM_ROWS,
  TILE_SIZE,
  TileType,
} from './types';

// Celeste-tuned virtual pixel units (px/sec, 320x180 resolution)
export const PHYS = {
  GRAVITY: 900,
  MAX_FALL: 165,
  FAST_FALL: 240,
  HALF_GRAV_THRESHOLD: 38,
  RUN_MAX: 94,
  RUN_ACCEL: 980,
  RUN_REDUCE: 420,
  AIR_MULT: 0.68,
  ICE_ACCEL_MULT: 0.28,
  JUMP_SPEED: -112,
  JUMP_H_BOOST: 38,
  COYOTE_TIME: 0.1,
  JUMP_BUFFER: 0.12,
  DASH_BUFFER: 0.1,
  WALL_JUMP_HSPEED: 118,
  WALL_JUMP_VSPEED: -108,
  WALL_SLIDE_MAX: 32,
  CLIMB_UP_SPEED: -46,
  CLIMB_DOWN_SPEED: 68,
  MAX_STAMINA: 110,
  STAMINA_HOLD_COST: 10,
  STAMINA_CLIMB_COST: 44,
  STAMINA_JUMP_COST: 27.5,
  DASH_SPEED: 245,
  DASH_TIME: 0.15,
  DASH_END_SPEED: 155,
  SUPER_HSPEED: 235,
  SUPER_VSPEED: -114,
  HYPER_HSPEED: 305,
  HYPER_VSPEED: -96,
  WALLBOUNCE_VSPEED: -146,
  WALLBOUNCE_HSPEED: 125,
  WATER_GRAVITY: 240,
  WATER_SWIM_SPEED: 78,
  FEATHER_SPEED: 138,
} as const;

export interface CollisionGrid {
  isSolidAtPixel(px: number, py: number, player?: PlayerState): boolean;
  isOneWayAtPixel(px: number, py: number): boolean;
  isDreamAtPixel(px: number, py: number): boolean;
  isIceAtPixel(px: number, py: number): boolean;
  isStickyAtPixel(px: number, py: number): boolean;
  isMagmaAtPixel(px: number, py: number): boolean;
  isWaterAtPixel(px: number, py: number): boolean;
  isCloudBounceAtPixel?(px: number, py: number): boolean;
  getConveyorAtPixel(px: number, py: number): number;
  isHazardAtPixel(px: number, py: number, vx: number, vy: number): boolean;
  onTileTouched?(tx: number, ty: number, kind: 'land' | 'dash' | 'grab'): void;
}

import { getHeroDef, HeroId } from './heroes';

export interface StepEvents {
  jumped: boolean;
  airJumped: boolean;
  wallJumped: boolean;
  dashed: boolean;
  landed: boolean;
  heavyLanded: boolean;
  died: boolean;
  unlockedMechanics: string[];
}

export function createInitialPlayer(
  x: number,
  y: number,
  heroId: HeroId = 'lyra',
  skinId = 'default'
): PlayerState {
  const hero = getHeroDef(heroId);
  const maxStamina = Math.round(PHYS.MAX_STAMINA * hero.modifiers.staminaMult);
  const baseDashes = hero.modifiers.baseDashes;
  const hair = Array.from({ length: 7 }, (_, i) => ({ x: x + 4 - i * 2, y: y + 2 }));
  return {
    heroId: hero.id,
    skinId,
    x,
    y,
    w: 8,
    h: 11,
    vx: 0,
    vy: 0,
    xRem: 0,
    yRem: 0,
    facing: 1,
    onGround: false,
    onIce: false,
    inWater: false,
    inDream: false,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    dashBufferTimer: 0,
    wallSlideDir: 0,
    wallGrabbing: false,
    onStickyWall: false,
    stamina: maxStamina,
    maxStamina,
    dashes: baseDashes,
    maxDashes: baseDashes,
    airJumpsLeft: hero.modifiers.airJumps,
    maxAirJumps: hero.modifiers.airJumps,
    heroShieldReady: hero.modifiers.shieldPerRoom,
    dashTimer: 0,
    dashDirX: 1,
    dashDirY: 0,
    dashCooldown: 0,
    superWindowTimer: 0,
    wallGraceTimer: 0,
    gravityDir: 1,
    featherTimer: 0,
    chronoTimer: 0,
    stasisTimer: 0,
    invulnTimer: 0,
    flashTimer: 0,
    crouch: false,
    scaleX: 1,
    scaleY: 1,
    walkDist: 0,
    dead: false,
    respawnTimer: 0,
    bubbleId: null,
    bubbleTimer: 0,
    tetherId: null,
    tetherAngle: 0,
    tetherAngVel: 0,
    dashedInRoom: false,
    hair,
    carryingKeys: [],
    pendingRelics: [],
  };
}

export function approach(val: number, target: number, maxMove: number): number {
  if (val < target) return Math.min(val + maxMove, target);
  if (val > target) return Math.max(val - maxMove, target);
  return target;
}

export function overlapsSolid(
  x: number,
  y: number,
  w: number,
  h: number,
  grid: CollisionGrid,
  player?: PlayerState,
  checkOneWay = false,
  prevBottom?: number
): boolean {
  const left = Math.floor(x);
  const right = Math.floor(x + w - 0.001);
  const top = Math.floor(y);
  const bottom = Math.floor(y + h - 0.001);

  for (let py = top; py <= bottom; py += 4) {
    for (let px = left; px <= right; px += 4) {
      if (grid.isSolidAtPixel(px, py, player)) return true;
    }
    if (grid.isSolidAtPixel(right, py, player)) return true;
  }
  for (let px = left; px <= right; px += 4) {
    if (grid.isSolidAtPixel(px, bottom, player)) return true;
  }
  if (grid.isSolidAtPixel(right, bottom, player)) return true;

  if (checkOneWay && prevBottom !== undefined && prevBottom <= Math.floor(y + h) - 1) {
    const rowY = Math.floor((y + h - 0.001) / TILE_SIZE) * TILE_SIZE;
    if (prevBottom <= rowY + 1) {
      for (let px = left; px <= right; px += 4) {
        if (grid.isOneWayAtPixel(px, y + h - 0.001)) return true;
      }
      if (grid.isOneWayAtPixel(right, y + h - 0.001)) return true;
    }
  }
  return false;
}

export function overlapsDream(
  x: number,
  y: number,
  w: number,
  h: number,
  grid: CollisionGrid
): boolean {
  const pts = [
    [x + 1, y + 1],
    [x + w - 2, y + 1],
    [x + 1, y + h - 2],
    [x + w - 2, y + h - 2],
  ];
  for (const [px, py] of pts) {
    if (grid.isDreamAtPixel(px, py)) return true;
  }
  return false;
}

export function checkHazardOverlap(p: PlayerState, grid: CollisionGrid): boolean {
  // Forgiving Celeste inner hurtbox (inset 2px horizontally, 2px vertically)
  const hx = p.x + 2;
  const hy = p.y + 3;
  const hw = Math.max(2, p.w - 4);
  const hh = Math.max(2, p.h - 4);
  const pts = [
    [hx, hy],
    [hx + hw, hy],
    [hx, hy + hh],
    [hx + hw, hy + hh],
    [hx + hw * 0.5, hy + hh * 0.5],
  ];
  for (const [px, py] of pts) {
    if (grid.isHazardAtPixel(px, py, p.vx, p.vy)) return true;
  }
  return false;
}

export function movePlayerX(
  p: PlayerState,
  amount: number,
  grid: CollisionGrid,
  events: StepEvents
): boolean {
  p.xRem += amount;
  let move = Math.round(p.xRem);
  if (move === 0) return false;
  p.xRem -= move;
  const sign = Math.sign(move);

  while (move !== 0) {
    if (!overlapsSolid(p.x + sign, p.y, p.w, p.h, grid, p)) {
      p.x += sign;
      move -= sign;
    } else {
      // Corner correction during dash (up to 4px nudge up or down)
      if (p.dashTimer > 0 && p.dashDirY === 0) {
        let nudged = false;
        for (let off = 1; off <= 4; off++) {
          if (!overlapsSolid(p.x + sign, p.y - off, p.w, p.h, grid, p)) {
            p.y -= off;
            p.x += sign;
            move -= sign;
            nudged = true;
            events.unlockedMechanics.push('CORNER_CORRECT_DASH');
            break;
          }
          if (!overlapsSolid(p.x + sign, p.y + off, p.w, p.h, grid, p)) {
            p.y += off;
            p.x += sign;
            move -= sign;
            nudged = true;
            events.unlockedMechanics.push('CORNER_CORRECT_DASH');
            break;
          }
        }
        if (nudged) continue;
      }

      // Breakable / Secret walls when dashing
      if (p.dashTimer > 0 && grid.onTileTouched) {
        const probeX = Math.floor((sign > 0 ? p.x + p.w + 1 : p.x - 1) / TILE_SIZE);
        const probeYTop = Math.floor((p.y + 2) / TILE_SIZE);
        const probeYBot = Math.floor((p.y + p.h - 2) / TILE_SIZE);
        grid.onTileTouched(probeX, probeYTop, 'dash');
        grid.onTileTouched(probeX, probeYBot, 'dash');
      }

      p.vx = 0;
      p.xRem = 0;
      return true;
    }
  }
  return false;
}

export function movePlayerY(
  p: PlayerState,
  amount: number,
  grid: CollisionGrid,
  events: StepEvents
): boolean {
  p.yRem += amount;
  let move = Math.round(p.yRem);
  if (move === 0) return false;
  p.yRem -= move;
  const sign = Math.sign(move);

  while (move !== 0) {
    const movingDown = sign * p.gravityDir > 0;
    const prevBottom = p.y + p.h;
    const blocked = overlapsSolid(
      p.x,
      p.y + sign,
      p.w,
      p.h,
      grid,
      p,
      movingDown && !p.crouch,
      prevBottom
    );
    if (!blocked) {
      p.y += sign;
      move -= sign;
    } else {
      // Ceiling corner correction when jumping up
      if (sign < 0 && p.gravityDir === 1) {
        let nudged = false;
        for (let off = 1; off <= 4; off++) {
          if (!overlapsSolid(p.x - off, p.y + sign, p.w, p.h, grid, p)) {
            p.x -= off;
            p.y += sign;
            move -= sign;
            nudged = true;
            events.unlockedMechanics.push('CORNER_CORRECT_UP');
            break;
          }
          if (!overlapsSolid(p.x + off, p.y + sign, p.w, p.h, grid, p)) {
            p.x += off;
            p.y += sign;
            move -= sign;
            nudged = true;
            events.unlockedMechanics.push('CORNER_CORRECT_UP');
            break;
          }
        }
        if (nudged) continue;
      }

      if (p.dashTimer > 0 && grid.onTileTouched) {
        const probeY = Math.floor((sign > 0 ? p.y + p.h + 1 : p.y - 1) / TILE_SIZE);
        const probeXL = Math.floor((p.x + 1) / TILE_SIZE);
        const probeXR = Math.floor((p.x + p.w - 1) / TILE_SIZE);
        grid.onTileTouched(probeXL, probeY, 'dash');
        grid.onTileTouched(probeXR, probeY, 'dash');
      }

      p.vy = 0;
      p.yRem = 0;
      return true;
    }
  }
  return false;
}

export function unstickPlayerFromSolid(p: PlayerState, grid: CollisionGrid): void {
  if (!overlapsSolid(p.x, p.y, p.w, p.h, grid, p)) return;
  for (let off = 1; off <= 16; off++) {
    if (!overlapsSolid(p.x, p.y - off, p.w, p.h, grid, p)) {
      p.y -= off;
      return;
    }
  }
  for (let off = 1; off <= 14; off++) {
    if (!overlapsSolid(p.x - off, p.y, p.w, p.h, grid, p)) {
      p.x -= off;
      return;
    }
    if (!overlapsSolid(p.x + off, p.y, p.w, p.h, grid, p)) {
      p.x += off;
      return;
    }
    if (!overlapsSolid(p.x, p.y + off, p.w, p.h, grid, p)) {
      p.y += off;
      return;
    }
  }
  // Diagonal escape search for tight wall corners / vine pockets
  for (let r = 2; r <= 16; r += 2) {
    const dirs = [
      [-r, -r],
      [r, -r],
      [-r, r],
      [r, r],
    ];
    for (const [dx, dy] of dirs) {
      if (!overlapsSolid(p.x + dx, p.y + dy, p.w, p.h, grid, p)) {
        p.x += dx;
        p.y += dy;
        return;
      }
    }
  }
}

export interface SwingStepResult {
  x: number;
  y: number;
  angle: number;
  angVel: number;
  radius: number;
  collided: boolean;
}

export function resolveSwingStep(
  grid: CollisionGrid,
  p: PlayerState,
  anchorX: number,
  anchorY: number,
  prevAngle: number,
  targetAngle: number,
  angVel: number,
  radius: number
): SwingStepResult {
  const safeMinR = 12;
  const posFor = (ang: number, rad: number) => ({
    x: anchorX + Math.sin(ang) * rad - p.w * 0.5,
    y: anchorY + Math.cos(ang) * rad - p.h * 0.5,
  });

  const direct = posFor(targetAngle, radius);
  if (!overlapsSolid(direct.x, direct.y, p.w, p.h, grid, p)) {
    return {
      x: direct.x,
      y: direct.y,
      angle: targetAngle,
      angVel,
      radius,
      collided: false,
    };
  }

  // Try retracting swing radius slightly so player clears nearby corridor walls cleanly
  for (let r = radius - 2; r >= Math.max(safeMinR, radius - 14); r -= 2) {
    const retracted = posFor(targetAngle, r);
    if (!overlapsSolid(retracted.x, retracted.y, p.w, p.h, grid, p)) {
      return {
        x: retracted.x,
        y: retracted.y,
        angle: targetAngle,
        angVel: angVel * 0.88,
        radius: r,
        collided: true,
      };
    }
  }

  // Sub-step backward toward prevAngle to stay flush against the wall without embedding
  for (let s = 3; s >= 0; s--) {
    const t = s / 4;
    const ang = prevAngle + (targetAngle - prevAngle) * t;
    for (let r = radius; r >= Math.max(safeMinR, radius - 12); r -= 3) {
      const pt = posFor(ang, r);
      if (!overlapsSolid(pt.x, pt.y, p.w, p.h, grid, p)) {
        return {
          x: pt.x,
          y: pt.y,
          angle: ang,
          angVel: -angVel * 0.35,
          radius: r,
          collided: true,
        };
      }
    }
  }

  // Fallback: keep player clear via unsticking and recompute safe polar coordinates
  const probe = { ...p };
  unstickPlayerFromSolid(probe, grid);
  const cx = probe.x + p.w * 0.5;
  const cy = probe.y + p.h * 0.5;
  const nextRad = Math.max(safeMinR, Math.min(48, Math.hypot(cx - anchorX, cy - anchorY)));
  const nextAng = Math.atan2(cx - anchorX, Math.max(2, cy - anchorY));
  return {
    x: probe.x,
    y: probe.y,
    angle: nextAng,
    angVel: 0,
    radius: nextRad,
    collided: true,
  };
}

export function resolveSwingRelease(
  grid: CollisionGrid,
  p: PlayerState,
  angle: number,
  launchSpeed = 195,
  launchVy = -142
): void {
  unstickPlayerFromSolid(p, grid);
  const wallLeft = overlapsSolid(p.x - 2, p.y, p.w, p.h, grid, p);
  const wallRight = overlapsSolid(p.x + 2, p.y, p.w, p.h, grid, p);
  const ceilNear = overlapsSolid(p.x, p.y - 4, p.w, p.h, grid, p);

  let vx = Math.cos(angle) * launchSpeed + p.facing * 35;
  if (wallLeft && !wallRight) {
    vx = Math.max(68, vx);
    p.x += 1;
  } else if (wallRight && !wallLeft) {
    vx = Math.min(-68, vx);
    p.x -= 1;
  }
  p.vx = vx;
  p.vy = ceilNear
    ? Math.max(-52, launchVy * 0.4) * p.gravityDir
    : launchVy * p.gravityDir;
  unstickPlayerFromSolid(p, grid);
}


export function stepPlayerPhysics(
  p: PlayerState,
  input: InputState,
  dt: number,
  grid: CollisionGrid,
  assist: AssistOptions,
  roomWindX: number,
  roomWindY: number,
  lowGravZone: boolean,
  upgrades?: BlessingUpgrades,
  modeOpts?: {
    gravityMult?: number;
    speedMult?: number;
    jumpMult?: number;
    staminaMult?: number;
    extraAirDash?: number;
    extraAirJump?: number;
  }
): StepEvents {
  const events: StepEvents = {
    jumped: false,
    airJumped: false,
    wallJumped: false,
    dashed: false,
    landed: false,
    heavyLanded: false,
    died: false,
    unlockedMechanics: [],
  };

  if (p.dead) return events;

  // Never remain wedged inside solid ground/tiles (prevents spawn or beat-block movement lock)
  if (!p.inDream) {
    unstickPlayerFromSolid(p, grid);
  }

  const hero = getHeroDef(p.heroId);
  const hm = hero.modifiers;
  const turboMult = assist.turboMode ? 1.24 : 1;
  const speedBonus = (1 + (upgrades?.speedLv ?? 0) * 0.08) * turboMult * (modeOpts?.speedMult ?? 1);
  const staminaBonus = (1 + (upgrades?.staminaLv ?? 0) * 0.15) * (modeOpts?.staminaMult ?? 1);
  const jumpMultBonus = hm.jumpMult * (modeOpts?.jumpMult ?? 1);
  const baseModeDashes = hm.baseDashes + (modeOpts?.extraAirDash ?? 0);
  const maxDashes = assist.extraDash ? Math.max(2, baseModeDashes) : baseModeDashes;
  p.maxDashes = baseModeDashes;
  p.maxStamina = Math.round(PHYS.MAX_STAMINA * hm.staminaMult * staminaBonus);
  p.maxAirJumps = hm.airJumps + (modeOpts?.extraAirJump ?? 0);

  // Recover scale exponentially
  p.scaleX = approach(p.scaleX, 1, dt * 5.5);
  p.scaleY = approach(p.scaleY, 1, dt * 5.5);

  if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  if (p.flashTimer > 0) p.flashTimer = Math.max(0, p.flashTimer - dt);
  if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
  if (p.superWindowTimer > 0) p.superWindowTimer = Math.max(0, p.superWindowTimer - dt);
  if (p.wallGraceTimer > 0) p.wallGraceTimer = Math.max(0, p.wallGraceTimer - dt);
  if (p.chronoTimer > 0) p.chronoTimer = Math.max(0, p.chronoTimer - dt);

  // Input buffers
  if (input.jumpJustPressed) {
    p.jumpBufferTimer = PHYS.JUMP_BUFFER;
  } else if (p.jumpBufferTimer > 0) {
    p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
  }

  if (input.dashJustPressed) {
    p.dashBufferTimer = PHYS.DASH_BUFFER;
  } else if (p.dashBufferTimer > 0) {
    p.dashBufferTimer = Math.max(0, p.dashBufferTimer - dt);
  }

  const digitalX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const digitalY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const moveX =
    input.analogX !== undefined && Math.abs(input.analogX) > 0.12
      ? Math.max(-1, Math.min(1, input.analogX))
      : digitalX;
  const moveY =
    input.analogY !== undefined && Math.abs(input.analogY) > 0.18
      ? Math.max(-1, Math.min(1, input.analogY))
      : digitalY;
  if (Math.abs(moveX) > 0.15 && !p.wallGrabbing) {
    p.facing = moveX > 0 ? 1 : -1;
  }

  // Ground check
  const wasOnGround = p.onGround;
  const footY = p.gravityDir === 1 ? p.y + p.h + 1 : p.y - 1;
  p.onGround =
    p.vy * p.gravityDir >= 0 &&
    overlapsSolid(p.x, p.y + p.gravityDir, p.w, p.h, grid, p, !p.crouch, p.y + p.h);

  p.onIce =
    p.onGround &&
    (grid.isIceAtPixel(p.x + 2, footY) || grid.isIceAtPixel(p.x + p.w - 2, footY));

  p.inWater = grid.isWaterAtPixel(p.x + p.w * 0.5, p.y + p.h * 0.5);

  if (p.onGround) {
    if (!wasOnGround) {
      events.landed = true;
      if (Math.abs(p.vy) > 130) {
        events.heavyLanded = true;
        p.scaleX = 1.24;
        p.scaleY = 0.76;
      } else {
        p.scaleX = 1.14;
        p.scaleY = 0.86;
      }
      if (p.jumpBufferTimer > 0 && p.jumpBufferTimer < PHYS.JUMP_BUFFER - 0.01) {
        events.unlockedMechanics.push('JUMP_BUFFER');
      }
    }
    p.coyoteTimer = PHYS.COYOTE_TIME + hm.coyoteBonus;
    p.stamina = p.maxStamina;
    p.airJumpsLeft = p.maxAirJumps;
    if (p.dashTimer <= 0) {
      p.dashes = Math.max(p.dashes, maxDashes);
    }
    if (p.onIce) events.unlockedMechanics.push('ICE_SLIPPERY');
    if (p.inWater) events.unlockedMechanics.push('WATER_BUOYANCY');

    // Notify standing tiles (crumble, fragile glass, cloud bounce)
    if (grid.onTileTouched) {
      const ty = Math.floor(footY / TILE_SIZE);
      grid.onTileTouched(Math.floor((p.x + 1) / TILE_SIZE), ty, 'land');
      grid.onTileTouched(Math.floor((p.x + p.w - 1) / TILE_SIZE), ty, 'land');
    }

    if (
      grid.isCloudBounceAtPixel &&
      (grid.isCloudBounceAtPixel(p.x + 2, footY) || grid.isCloudBounceAtPixel(p.x + p.w - 2, footY))
    ) {
      p.vy = PHYS.JUMP_SPEED * 1.48 * jumpMultBonus * p.gravityDir;
      p.dashes = Math.max(p.dashes, maxDashes);
      p.airJumpsLeft = p.maxAirJumps;
      p.scaleX = 0.72;
      p.scaleY = 1.32;
      events.jumped = true;
      events.unlockedMechanics.push('CLOUD_BOUNCE');
    }
  } else {
    if (p.coyoteTimer > 0) p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
  }

  // Crouch state
  const wantsCrouch = input.down && (p.onGround || p.dashTimer > 0);
  if (wantsCrouch && !p.crouch) {
    p.crouch = true;
    p.h = 7;
    if (p.gravityDir === 1) p.y += 4;
    if (Math.abs(p.vx) > 20) events.unlockedMechanics.push('CROUCH_SLIDE');
  } else if (!wantsCrouch && p.crouch) {
    const testY = p.gravityDir === 1 ? p.y - 4 : p.y;
    if (!overlapsSolid(p.x, testY, p.w, 11, grid, p)) {
      p.crouch = false;
      p.y = testY;
      p.h = 11;
    }
  }

  // Feather flight mode
  if (p.featherTimer > 0) {
    p.featherTimer = Math.max(0, p.featherTimer - dt);
    events.unlockedMechanics.push('FEATHER_AURA');
    const dirLen = Math.hypot(moveX, moveY) || 1;
    const tx = moveX !== 0 || moveY !== 0 ? (moveX / dirLen) * PHYS.FEATHER_SPEED : p.facing * PHYS.FEATHER_SPEED * 0.7;
    const ty = moveX !== 0 || moveY !== 0 ? (moveY / dirLen) * PHYS.FEATHER_SPEED : 0;
    p.vx = approach(p.vx, tx, 700 * dt);
    p.vy = approach(p.vy, ty, 700 * dt);
    movePlayerX(p, p.vx * dt, grid, events);
    movePlayerY(p, p.vy * dt, grid, events);
    return events;
  }

  // Dream Block Phase check
  if (p.inDream) {
    p.vx = p.dashDirX * PHYS.DASH_SPEED * 1.1;
    p.vy = p.dashDirY * PHYS.DASH_SPEED * 1.1;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (!overlapsDream(p.x, p.y, p.w, p.h, grid)) {
      p.inDream = false;
      // Burst out of dream block!
      p.dashes = Math.max(p.dashes, maxDashes);
      p.stamina = p.maxStamina;
      p.vy *= 0.85;
      p.scaleX = 0.8;
      p.scaleY = 1.25;
      if (input.jumpHeld || p.jumpBufferTimer > 0) {
        p.vy = PHYS.JUMP_SPEED * 1.1 * p.gravityDir;
        p.vx += p.facing * 45;
        p.jumpBufferTimer = 0;
        events.jumped = true;
      }
    }
    return events;
  }

  // Start Dash if buffered & ready
  if (p.dashBufferTimer > 0 && p.dashes > 0 && p.dashCooldown <= 0 && p.dashTimer <= 0) {
    p.dashBufferTimer = 0;
    p.dashes -= 1;
    p.dashedInRoom = true;
    p.dashTimer = PHYS.DASH_TIME;
    p.dashCooldown = 0.19;
    p.superWindowTimer = PHYS.DASH_TIME + 0.04;
    p.wallGrabbing = false;
    let dx = moveX;
    let dy = moveY;
    if (dx === 0 && dy === 0) dx = p.facing;
    const len = Math.hypot(dx, dy);
    p.dashDirX = dx / len;
    p.dashDirY = dy / len;
    p.vx = p.dashDirX * PHYS.DASH_SPEED * hm.dashSpeedMult;
    p.vy = p.dashDirY * PHYS.DASH_SPEED * hm.dashSpeedMult;
    p.scaleX = Math.abs(p.dashDirX) > 0.5 ? 1.28 : 0.78;
    p.scaleY = Math.abs(p.dashDirY) > 0.5 ? 1.28 : 0.78;
    events.dashed = true;
    events.unlockedMechanics.push('AIR_DASH_8WAY');
    if (!p.onGround && p.dashDirY > 0.7 && Math.abs(p.dashDirX) < 0.35) {
      p.vy = PHYS.DASH_SPEED * 1.26 * hm.dashSpeedMult;
      events.unlockedMechanics.push('METEOR_DIVE');
    }
    if (p.crouch && dy === 0) {
      events.unlockedMechanics.push('DEMO_DASH');
    }
    if (maxDashes >= 2 && p.dashes === 0) {
      events.unlockedMechanics.push('DOUBLE_DASH');
    }
  }

  // Active Dash state
  if (p.dashTimer > 0) {
    p.dashTimer = Math.max(0, p.dashTimer - dt);

    // Check Dream block entry
    const nx = p.x + p.dashDirX * 3;
    const ny = p.y + p.dashDirY * 3;
    if (overlapsDream(nx, ny, p.w, p.h, grid)) {
      p.inDream = true;
      p.dashTimer = 0;
      events.unlockedMechanics.push('DREAM_BLOCK');
      return events;
    }

    // Super / Hyper / Wave dash jump cancel!
    if (p.jumpBufferTimer > 0 && (p.onGround || p.coyoteTimer > 0)) {
      p.jumpBufferTimer = 0;
      p.coyoteTimer = 0;
      const isExtended = p.dashTimer <= PHYS.DASH_TIME * 0.45;
      p.dashTimer = 0;
      if (isExtended) {
        p.dashes = Math.max(p.dashes, maxDashes);
        events.unlockedMechanics.push('EXTENDED_SUPER');
      }
      if (p.dashDirY > 0.25 && Math.abs(p.dashDirX) > 0.25) {
        p.vx = Math.sign(p.dashDirX) * PHYS.HYPER_HSPEED * hm.dashSpeedMult;
        p.vy = PHYS.HYPER_VSPEED * jumpMultBonus * p.gravityDir;
        if (wasOnGround) {
          events.unlockedMechanics.push('HYPER_DASH');
        } else {
          p.dashes = Math.max(p.dashes, maxDashes);
          events.unlockedMechanics.push('WAVE_DASH');
        }
      } else {
        p.vx = (p.dashDirX !== 0 ? Math.sign(p.dashDirX) : p.facing) * PHYS.SUPER_HSPEED * hm.dashSpeedMult;
        p.vy = PHYS.SUPER_VSPEED * jumpMultBonus * p.gravityDir;
        events.unlockedMechanics.push('SUPER_DASH');
      }
      p.scaleX = 1.25;
      p.scaleY = 0.78;
      events.jumped = true;
    } else if (
      p.jumpBufferTimer > 0 &&
      p.dashDirY < -0.5 &&
      Math.abs(p.dashDirX) < 0.4
    ) {
      // Wallbounce! Up-dash right next to a wall
      const wallL = overlapsSolid(p.x - 4, p.y, p.w, p.h, grid, p);
      const wallR = overlapsSolid(p.x + 4, p.y, p.w, p.h, grid, p);
      if (wallL || wallR) {
        p.jumpBufferTimer = 0;
        p.dashTimer = 0;
        const away = wallL ? 1 : -1;
        p.vx = away * PHYS.WALLBOUNCE_HSPEED;
        p.vy = PHYS.WALLBOUNCE_VSPEED * p.gravityDir;
        p.facing = away;
        p.scaleX = 0.72;
        p.scaleY = 1.32;
        events.wallJumped = true;
        events.unlockedMechanics.push('WALL_BOUNCE');
      }
    }

    if (p.dashTimer === 0 && !events.jumped && !events.wallJumped) {
      if (p.dashDirY <= 0) {
        p.vx = p.dashDirX * PHYS.DASH_END_SPEED;
        p.vy = p.dashDirY * PHYS.DASH_END_SPEED;
      }
    }

    movePlayerX(p, p.vx * dt, grid, events);
    movePlayerY(p, p.vy * dt, grid, events);
    return events;
  }

  // Wall adjacency check
  const touchLeft = overlapsSolid(p.x - 1, p.y, p.w, p.h, grid, p);
  const touchRight = overlapsSolid(p.x + 1, p.y, p.w, p.h, grid, p);
  const nearWallLeft = overlapsSolid(p.x - 3, p.y, p.w, p.h, grid, p);
  const nearWallRight = overlapsSolid(p.x + 3, p.y, p.w, p.h, grid, p);
  const wallDir: -1 | 0 | 1 = touchLeft ? -1 : touchRight ? 1 : 0;

  // Sticky / Magma wall check
  p.onStickyWall = false;
  let onMagmaWall = false;
  if (wallDir !== 0) {
    const wx = wallDir === -1 ? p.x - 1 : p.x + p.w + 1;
    const wy = p.y + p.h * 0.5;
    p.onStickyWall = grid.isStickyAtPixel(wx, wy);
    onMagmaWall = grid.isMagmaAtPixel(wx, wy);
    if (p.onStickyWall) events.unlockedMechanics.push('STICKY_RESIN');
    if (onMagmaWall) events.unlockedMechanics.push('MAGMA_CRUST');
  }

  // Wall grab & climb
  const canGrab = input.grabHeld && wallDir !== 0 && (assist.infiniteStamina || p.stamina > 0);
  if (canGrab && !p.onGround) {
    p.wallGrabbing = true;
    p.facing = wallDir;
    events.unlockedMechanics.push('WALL_GRAB_CLIMB');
    if (grid.onTileTouched) {
      grid.onTileTouched(
        Math.floor((wallDir === -1 ? p.x - 1 : p.x + p.w + 1) / TILE_SIZE),
        Math.floor((p.y + p.h * 0.5) / TILE_SIZE),
        'grab'
      );
    }
    const drainMult = p.onStickyWall || assist.infiniteStamina ? 0 : (onMagmaWall && !hm.magmaImmune) ? 2 : 1;
    if (input.up) {
      p.vy = PHYS.CLIMB_UP_SPEED * hm.climbSpeedMult * p.gravityDir;
      p.stamina = Math.max(0, p.stamina - PHYS.STAMINA_CLIMB_COST * drainMult * dt);
      // Ledge vault assist
      const topProbeY = p.gravityDir === 1 ? p.y - 2 : p.y + p.h + 2;
      if (!overlapsSolid(p.x + wallDir * 2, topProbeY, p.w, 4, grid, p)) {
        p.vy = -68 * p.gravityDir;
        p.vx = wallDir * 52;
        events.unlockedMechanics.push('LEDGE_VAULT');
      }
    } else if (input.down) {
      p.vy = PHYS.CLIMB_DOWN_SPEED * hm.climbSpeedMult * p.gravityDir;
    } else {
      p.vy = approach(p.vy, 0, 900 * dt);
      p.stamina = Math.max(0, p.stamina - PHYS.STAMINA_HOLD_COST * drainMult * dt);
    }
    if (p.stamina > 0 && p.stamina < p.maxStamina * 0.25) {
      events.unlockedMechanics.push('STAMINA_PANTING');
    }
  } else {
    p.wallGrabbing = false;
  }

  // Wall slide
  p.wallSlideDir = 0;
  const slideDir = Math.abs(moveX) > 0.35 ? Math.sign(moveX) : 0;
  if (!p.onGround && !p.wallGrabbing && wallDir !== 0 && slideDir === wallDir && p.vy * p.gravityDir > 0) {
    p.wallSlideDir = wallDir;
    events.unlockedMechanics.push('WALL_SLIDE');
  }

  // Horizontal Movement
  const conveyorSpeed = p.onGround ? grid.getConveyorAtPixel(p.x + p.w * 0.5, footY) : 0;
  if (conveyorSpeed !== 0) events.unlockedMechanics.push('CONVEYOR_BELT');

  if (!p.wallGrabbing) {
    const swimMult = p.inWater ? hm.swimBoostMult ?? 1 : 1;
    const maxRun = PHYS.RUN_MAX * hm.runSpeedMult * speedBonus * swimMult;
    const accelBase =
      Math.abs(p.vx) > maxRun && Math.sign(p.vx) === Math.sign(moveX)
        ? PHYS.RUN_REDUCE
        : PHYS.RUN_ACCEL * hm.runSpeedMult * speedBonus;
    let accel = p.onGround ? accelBase : accelBase * PHYS.AIR_MULT;
    if (p.onIce) accel *= PHYS.ICE_ACCEL_MULT;
    if (p.inWater) accel *= 0.65 * swimMult;
    p.vx = approach(p.vx, moveX * maxRun + conveyorSpeed, accel * dt);
  } else {
    p.vx = 0;
  }

  // Gravity & Variable Jump Cut & Apex Hang & Glide
  if (!p.wallGrabbing) {
    let grav = (p.inWater ? PHYS.WATER_GRAVITY : PHYS.GRAVITY) * hm.gravityMult * (modeOpts?.gravityMult ?? 1);
    if (assist.lowGravity) {
      grav *= 0.58;
    }
    if (lowGravZone) {
      grav *= 0.42;
      events.unlockedMechanics.push('ANTIGRAV_ZONE');
    }
    if (Math.abs(p.vy) < PHYS.HALF_GRAV_THRESHOLD && input.jumpHeld && !p.onGround) {
      grav *= 0.5;
      events.unlockedMechanics.push('APEX_HANG');
    }
    let maxFall = p.inWater ? 55 : input.down ? PHYS.FAST_FALL : PHYS.MAX_FALL;
    if (!p.inWater && !input.down && input.jumpHeld && hm.glideMaxFall !== null && p.vy * p.gravityDir > 0) {
      maxFall = Math.min(maxFall, hm.glideMaxFall);
    }
    if (input.down && !p.onGround && p.vy * p.gravityDir > 20) {
      events.unlockedMechanics.push('FAST_FALL');
    }
    if (p.wallSlideDir !== 0) {
      maxFall = Math.min(maxFall, PHYS.WALL_SLIDE_MAX);
    }
    p.vy = approach(p.vy, maxFall * p.gravityDir, grav * dt);
  }

  // Wind forces
  p.vx += roomWindX * dt;
  p.vy += roomWindY * dt;

  // Variable jump cut
  if (!input.jumpHeld && p.vy * p.gravityDir < -36) {
    p.vy *= 0.55;
    events.unlockedMechanics.push('VAR_JUMP_CUT');
  }

  // Jump execution (Ground/Coyote, Water, Wall Jump, or Hero Double Jump)
  if (p.jumpBufferTimer > 0) {
    if (p.onGround || p.coyoteTimer > 0) {
      const usedCoyote = !p.onGround && p.coyoteTimer > 0;
      p.jumpBufferTimer = 0;
      p.coyoteTimer = 0;
      p.vy = PHYS.JUMP_SPEED * jumpMultBonus * p.gravityDir;
      p.vx += moveX * PHYS.JUMP_H_BOOST;
      p.scaleX = 0.82;
      p.scaleY = 1.22;
      events.jumped = true;
      if (usedCoyote) events.unlockedMechanics.push('COYOTE_TIME');

      // Check super window after dash ended slightly before jump
      if (p.superWindowTimer > 0) {
        p.superWindowTimer = 0;
        p.vx = p.facing * PHYS.SUPER_HSPEED * hm.dashSpeedMult;
        p.vy = PHYS.SUPER_VSPEED * jumpMultBonus * p.gravityDir;
        events.unlockedMechanics.push('SUPER_DASH');
      }
    } else if (p.inWater) {
      p.jumpBufferTimer = 0;
      p.vy = PHYS.JUMP_SPEED * jumpMultBonus * 0.86 * (hm.swimBoostMult ?? 1) * p.gravityDir;
      events.jumped = true;
    } else if (p.wallGrabbing && wallDir !== 0 && Math.abs(moveX) < 0.25) {
      // Climb hop
      p.jumpBufferTimer = 0;
      p.vy = PHYS.JUMP_SPEED * jumpMultBonus * 0.96 * p.gravityDir;
      if (!assist.infiniteStamina && !p.onStickyWall) {
        p.stamina = Math.max(0, p.stamina - PHYS.STAMINA_JUMP_COST);
      }
      p.scaleX = 0.84;
      p.scaleY = 1.2;
      events.wallJumped = true;
      events.unlockedMechanics.push('CLIMB_HOP');
    } else if (nearWallLeft || nearWallRight) {
      p.jumpBufferTimer = 0;
      p.wallGrabbing = false;
      const wDir = nearWallLeft ? -1 : 1;
      const away = -wDir as 1 | -1;
      p.vy = PHYS.WALL_JUMP_VSPEED * hm.wallJumpMult * (modeOpts?.jumpMult ?? 1) * p.gravityDir;
      if (Math.abs(moveX) < 0.25) {
        // Neutral wall jump
        p.vx = away * (PHYS.WALL_JUMP_HSPEED * 0.72);
        events.unlockedMechanics.push('NEUTRAL_WALL_JUMP');
      } else {
        p.vx = away * PHYS.WALL_JUMP_HSPEED;
        events.unlockedMechanics.push('WALL_JUMP');
      }
      p.facing = away;
      p.scaleX = 0.8;
      p.scaleY = 1.22;
      events.wallJumped = true;
    } else if (p.airJumpsLeft > 0) {
      p.jumpBufferTimer = 0;
      p.airJumpsLeft -= 1;
      p.vy = PHYS.JUMP_SPEED * jumpMultBonus * 0.96 * p.gravityDir;
      if (Math.abs(moveX) > 0.15) {
        p.vx = moveX * PHYS.RUN_MAX * hm.runSpeedMult * 1.15;
      }
      p.scaleX = 0.82;
      p.scaleY = 1.24;
      events.jumped = true;
      events.airJumped = true;
    }
  }

  // Integrate & move
  if (p.onGround) {
    p.walkDist += Math.abs(p.vx) * dt;
  }

  movePlayerX(p, p.vx * dt, grid, events);
  movePlayerY(p, p.vy * dt, grid, events);

  // Check spike/lethal tile overlap
  if (!assist.invincible && p.invulnTimer <= 0 && checkHazardOverlap(p, grid)) {
    events.died = true;
  }

  return events;
}

export function updateHairVerlet(p: PlayerState, dt: number, windX = 0): void {
  const anchorX = p.x + p.w * 0.5 - p.facing * 2;
  const anchorY = p.y + (p.crouch ? 2 : 3);
  p.hair[0].x = anchorX;
  p.hair[0].y = anchorY;
  const segLen = 2.6;
  for (let i = 1; i < p.hair.length; i++) {
    const prev = p.hair[i - 1];
    const cur = p.hair[i];
    cur.x += (-p.facing * 24 + windX * 0.25) * dt;
    cur.y += 28 * p.gravityDir * dt;
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    if (dist > segLen) {
      cur.x = prev.x + (dx / dist) * segLen;
      cur.y = prev.y + (dy / dist) * segLen;
    }
  }
}

export function tileIndex(tx: number, ty: number): number {
  if (tx < 0 || tx >= ROOM_COLS || ty < 0 || ty >= ROOM_ROWS) return -1;
  return ty * ROOM_COLS + tx;
}

export function isTileValueSolid(t: number): boolean {
  return (
    t === TileType.SOLID ||
    t === TileType.ICE ||
    t === TileType.BREAKABLE ||
    t === TileType.STICKY_RESIN ||
    t === TileType.CONVEYOR_LEFT ||
    t === TileType.CONVEYOR_RIGHT ||
    t === TileType.SECRET_WALL ||
    t === TileType.FRAGILE_GLASS ||
    t === TileType.MAGMA_CRUST ||
    t === TileType.CRUMBLE ||
    t === TileType.CLOUD_BOUNCE
  );
}
