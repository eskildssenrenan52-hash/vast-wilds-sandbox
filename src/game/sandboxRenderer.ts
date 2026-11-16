// @ts-nocheck -- imported game code
import { drawEnhancedBackdrop, drawEnhancedForeground } from './backdropRenderer';
import { drawBiomeDecorBackdrop, drawBiomeDecorForeground } from './biomeDecor';
import type { GameEngine } from './engine';
import {
  SANDBOX_COLS,
  SANDBOX_ROWS,
  SANDBOX_SECTOR_COLS,
  SANDBOX_SECTOR_ROWS,
  SANDBOX_TILE_META,
  SB_TILE,
  SB_WALL,
  SandboxScenicProp,
  getSandboxBiomeAt,
  getSandboxCampaignBiomeAt,
  getSandboxSurfaceHeightAt,
  isSandboxNight,
  isSandboxSolid,
} from './sandboxWorld';
import {
  ENEMY_SPRITES,
  NPC_SPRITES,
  PROP_SPRITES,
  PixelPalette,
  drawPixelSprite,
} from './sprites';
import { TILE_SIZE, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './types';
import { colorWithAlpha, drawCachedGlow, snapHalf } from './visualFx';
import { getAnyBiomeMeta } from './worldDataUnderworld';

const WALL_COLORS: Record<number, { base: string; seam: string }> = {
  [SB_WALL.DIRT_WALL]: { base: '#3d271a', seam: '#2b190f' },
  [SB_WALL.WOOD_WALL]: { base: '#54351e', seam: '#3b2413' },
  [SB_WALL.STONE_WALL]: { base: '#343a47', seam: '#232833' },
  [SB_WALL.BRICK_WALL]: { base: '#4a333c', seam: '#2e1e25' },
  [SB_WALL.GLASS_WALL]: { base: '#2c5a6e', seam: '#6be0ff' },
  [SB_WALL.DUNGEON_WALL]: { base: '#1a2338', seam: '#101626' },
  [SB_WALL.SAKURA_WALL]: { base: '#54203b', seam: '#8a3560' },
  [SB_WALL.NEON_WALL]: { base: '#112738', seam: '#1b4f69' },
};

export const SANDBOX_OBJECT_SPRITES: Record<string, { palette: PixelPalette; frames: string[][] }> = {
  workbench: {
    palette: { o: '#090712', w: '#d49966', m: '#9c6334', d: '#633c1c', s: '#cbd5e1' },
    frames: [
      [
        'oo..oooooooooo',
        'ossoowwwwwwwwo',
        'oooooooooooooom',
        '.ommmmmmmmmmmo',
        '.oodmmo..ommdo',
        '..oddo....oddo',
        '..oddo....oddo',
        '..oooo....oooo',
      ].map((r) => (r.length > 14 ? r.slice(0, 14) : r.padEnd(14, '.'))),
    ],
  },
  forge: {
    palette: {
      o: '#090712',
      s: '#6a6280',
      h: '#a89ec2',
      d: '#38324a',
      f: '#ff4d1c',
      y: '#ffe066',
      w: '#ffffff',
    },
    frames: [
      [
        '..oooooooooo..',
        '.ohhhhhhhhhho.',
        '.osssssssssso.',
        'oossddddddssso',
        'oshddofffodddo',
        'oshdofyywfdddo',
        'ossdofwwwwdddo',
        'osddoffffodddo',
        'oddddddddddddd'.slice(0, 14),
        '.oooooooooooo.',
      ].map((r) => r.padEnd(14, '.')),
      [
        '..oooooooooo..',
        '.ohhhhhhhhhho.',
        '.osssssssssso.',
        'oossddddddssso',
        'oshddoffyodddo',
        'oshdofwwwfdddo',
        'ossdofyyffdddo',
        'osddoffffodddo',
        'oddddddddddddd'.slice(0, 14),
        '.oooooooooooo.',
      ].map((r) => r.padEnd(14, '.')),
    ],
  },
  cauldron: {
    palette: { o: '#061210', m: '#365e5e', l: '#649e9e', d: '#1a3030', g: '#4df0c0', w: '#ffffff' },
    frames: [
      [
        '..oo..w..oo.',
        '..ogggggggo.',
        '.olmmmmmmmlo',
        '.ommmmmmmmmo',
        'ommmmlmmmmmo',
        'ommdddddddmo',
        '.omddddddmo.',
        '.ooddddddoo.',
        '..oo....oo..',
      ],
      [
        '.w..oo..o...',
        '..oggwggggo.',
        '.olmmmmmmmlo',
        '.ommmmmmmmmo',
        'ommmmlmmmmmo',
        'ommdddddddmo',
        '.omddddddmo.',
        '.ooddddddoo.',
        '..oo....oo..',
      ],
    ],
  },
  chest: {
    palette: { o: '#0c0806', g: '#ffd24d', w: '#ffffff', b: '#a86e22', d: '#663f0e' },
    frames: [
      [
        '.oooooooooo.',
        'obggggggggbo',
        'obbbwwwwbbbo',
        'oooooooooooo',
        'odddggggdddo',
        'odddgwwgdddo',
        'oddddddddddo',
        '.oooooooooo.',
      ],
    ],
  },
  bed: {
    palette: { o: '#090712', w: '#ffffff', c: '#d9c8e8', r: '#e0365f', d: '#8c1b39', b: '#8f5932' },
    frames: [
      [
        '.oooo...........',
        'owwwcooooooooo..',
        'occccorrrrrrrro.',
        'obbbborrrrddddoo',
        'obbbbbbbbbbbbbbo',
        'obb..ooooo..bbbo',
        'ooo..........ooo',
      ],
    ],
  },
  door_closed: {
    palette: { o: '#090712', w: '#b57845', m: '#855128', d: '#522f14', g: '#ffe066' },
    frames: [
      [
        '.oooooo.',
        'owmmmmwo',
        'omddddmo',
        'omddddmo',
        'owmmmmwo',
        'omddddmo',
        'omdddggo',
        'owmmmggo',
        'omddddmo',
        'omddddmo',
        'owmmmmwo',
        'omddddmo',
        'omddddmo',
        'oooooooo',
      ],
    ],
  },
  table: {
    palette: { o: '#090712', h: '#d49966', m: '#995f32', d: '#5c3518' },
    frames: [
      [
        'oooooooooooooo',
        'ohhhhhhhhhhhho',
        'ommmmmmmmmmmmo',
        '.ooddddddddoo.',
        '..odd....ddo..',
        '..odd....ddo..',
        '..odd....ddo..',
        '..ooo....ooo..',
      ],
    ],
  },
  chair: {
    palette: { o: '#090712', h: '#d49966', m: '#995f32', d: '#5c3518' },
    frames: [
      [
        '.ooo....',
        'ohmo....',
        'ommo....',
        'ommooooo',
        'ohhhhhho',
        'omddddmo',
        '.od..do.',
        '.od..do.',
        '.oo..oo.',
      ],
    ],
  },
  altar: {
    palette: { o: '#0a0414', p: '#c084fc', w: '#ffffff', s: '#584b75', d: '#312747' },
    frames: [
      [
        '.....oooo.....',
        '....opwwpo....',
        '....oppppo....',
        '.....oppo.....',
        '..oossssssoo..',
        '.oshhsppshhso.',
        '.osddddddddso.',
        'oosddddddddsoo',
        'oooooooooooooo',
      ],
      [
        '.....owwo.....',
        '....owppwo....',
        '....opwwpo....',
        '.....oppo.....',
        '..oossssssoo..',
        '.oshhsppshhso.',
        '.osddddddddso.',
        'oosddddddddsoo',
        'oooooooooooooo',
      ],
    ],
  },
  life_crystal: {
    palette: { o: '#14040a', r: '#ff3864', l: '#ff94b2', w: '#ffffff', d: '#961233' },
    frames: [
      [
        '..oooo..oooo..',
        '.olllroorlllo.',
        'olwwrrrrrllrho'.replace('h', 'r'),
        'orwrrrrrrrrrdo',
        'orrrrrrrrrdddo',
        '.orrrrrrrdddo.',
        '..orrrrrdddo..',
        '...orrrdddo...',
        '....orrddo....',
        '.....oodo.....',
        '......oo......',
      ],
      [
        '..oooo..oooo..',
        '.orllroorllro.',
        'olwwwrrrrwwrro',
        'orwwrrrrrrrwdo',
        'orrrrrrrrrdddo',
        '.orrrrrrrdddo.',
        '..orrrrrdddo..',
        '...orrrdddo...',
        '....orrddo....',
        '.....oodo.....',
        '......oo......',
      ],
    ],
  },
  pot: {
    palette: { o: '#120806', h: '#e08e67', m: '#b35f39', d: '#6e321a', g: '#ffd27d' },
    frames: [
      [
        '..oooooo..',
        '.ohhhhhho.',
        '..oooooo..',
        '.ohmggmho.',
        'ohmmmmmmmo',
        'ommmmmdddo',
        'ommdddddoo',
        '.ooddddoo.',
        '..oooooo..',
      ],
    ],
  },
  teleport_pylon: {
    palette: {
      o: '#060c18',
      c: '#52e5ff',
      w: '#ffffff',
      b: '#2378ab',
      g: '#ffd27d',
      s: '#696285',
      d: '#36304a',
    },
    frames: [
      [
        '......oo......',
        '.....occo.....',
        '....ocwwco....',
        '...ocwccwbo...',
        '...occcccbo...',
        '....obbbbo....',
        '.....obbo.....',
        '......oo......',
        '...ooggggoo...',
        '..osssssssso..',
        '..osddddddso..',
        '.oosddddddsoo.',
        '.oooooooooooo.',
      ],
      [
        '.....oooo.....',
        '....ocwwco....',
        '...ocwccwbo...',
        '...occcccbo...',
        '....occcbo....',
        '.....obbo.....',
        '......oo......',
        '..............',
        '...ooggggoo...',
        '..osssssssso..',
        '..osddddddso..',
        '.oosddddddsoo.',
        '.oooooooooooo.',
      ],
    ],
  },
  banner: {
    palette: { o: '#090712', w: '#d4a359', r: '#e02853', d: '#851430', g: '#ffe066' },
    frames: [
      [
        'oooooooo',
        'owwwwwwo',
        '.orrrro.',
        '.orggro.',
        '.orggro.',
        '.orrrro.',
        '.odrrdo.',
        '.oddddo.',
        '..oddo..',
        '...oo...',
      ],
      [
        'oooooooo',
        'owwwwwwo',
        '.orrrro.',
        '..oggro.',
        '..oggrdo'.slice(0, 8),
        '.orrrdo.',
        '.oddddo.',
        '.ooddoo.',
        '..oddo..',
        '...oo...',
      ],
    ],
  },
};

// Offscreen Minimap & Light Cache
const MINIMAP_W = 120;
const MINIMAP_H = 32;
let minimapCanvas: HTMLCanvasElement | null = null;
let minimapCtx: CanvasRenderingContext2D | null = null;
let minimapFogCanvas: HTMLCanvasElement | null = null;
let minimapFogCtx: CanvasRenderingContext2D | null = null;
let minimapFogExploredCount = -1;
let minimapSeed = -1;

let sbLightCanvas: HTMLCanvasElement | null = null;
let sbLightCtx: CanvasRenderingContext2D | null = null;

function ensureMinimapBuilt(world: NonNullable<GameEngine['sandboxWorld']>): void {
  if (typeof document === 'undefined') return;
  if (!minimapCanvas) {
    minimapCanvas = document.createElement('canvas');
    minimapCanvas.width = MINIMAP_W;
    minimapCanvas.height = MINIMAP_H;
    minimapCtx = minimapCanvas.getContext('2d');
  }
  if (!minimapCtx) return;

  const stepX = Math.floor(SANDBOX_COLS / MINIMAP_W); // 40
  const stepY = Math.floor(SANDBOX_ROWS / MINIMAP_H); // 20

  if (minimapSeed !== world.seed) {
    minimapSeed = world.seed;
    minimapCtx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
    for (let gx = 0; gx < MINIMAP_W; gx++) {
      const tx = Math.min(SANDBOX_COLS - 1, gx * stepX);
      for (let gy = 0; gy < MINIMAP_H; gy++) {
        const ty = Math.min(SANDBOX_ROWS - 1, gy * stepY);
        const t = world.tiles[ty * world.cols + tx];
        if (t !== SB_TILE.AIR) {
          const meta = SANDBOX_TILE_META[t];
          minimapCtx.fillStyle = meta?.color && meta.color !== 'transparent' ? meta.color : '#4d4666';
          minimapCtx.fillRect(gx, gy, 1, 1);
        } else if (ty >= 490) {
          minimapCtx.fillStyle = '#330b10';
          minimapCtx.fillRect(gx, gy, 1, 1);
        } else if (ty >= 230) {
          minimapCtx.fillStyle = '#120f1e';
          minimapCtx.fillRect(gx, gy, 1, 1);
        }
      }
    }
    world.terrainDirtyTiles.length = 0;
  } else if (world.terrainDirtyTiles.length > 0) {
    const seenCells = new Set<number>();
    for (const idx of world.terrainDirtyTiles) {
      const ty = Math.floor(idx / world.cols);
      const tx = idx - ty * world.cols;
      const gx = Math.min(MINIMAP_W - 1, Math.floor(tx / stepX));
      const gy = Math.min(MINIMAP_H - 1, Math.floor(ty / stepY));
      const key = gy * MINIMAP_W + gx;
      if (seenCells.has(key)) continue;
      seenCells.add(key);

      const sampleIdx = Math.min(world.rows - 1, gy * stepY) * world.cols + Math.min(world.cols - 1, gx * stepX);
      const t = world.tiles[sampleIdx];
      if (t !== SB_TILE.AIR) {
        const meta = SANDBOX_TILE_META[t];
        minimapCtx.fillStyle = meta?.color && meta.color !== 'transparent' ? meta.color : '#4d4666';
        minimapCtx.fillRect(gx, gy, 1, 1);
      } else {
        minimapCtx.clearRect(gx, gy, 1, 1);
      }
    }
    world.terrainDirtyTiles.length = 0;
  }

  let expCount = 0;
  for (let i = 0; i < world.exploredSectors.length; i++) {
    if (world.exploredSectors[i] > 0) expCount++;
  }
  if (!minimapFogCanvas) {
    minimapFogCanvas = document.createElement('canvas');
    minimapFogCanvas.width = MINIMAP_W;
    minimapFogCanvas.height = MINIMAP_H;
    minimapFogCtx = minimapFogCanvas.getContext('2d');
  }
  if (minimapFogCtx && minimapFogExploredCount !== expCount) {
    minimapFogExploredCount = expCount;
    minimapFogCtx.clearRect(0, 0, MINIMAP_W, MINIMAP_H);
    minimapFogCtx.fillStyle = 'rgba(4, 3, 10, 0.48)';
    const secStepX = MINIMAP_W / SANDBOX_SECTOR_COLS;
    const secStepY = MINIMAP_H / SANDBOX_SECTOR_ROWS;
    for (let sy = 0; sy < SANDBOX_SECTOR_ROWS; sy++) {
      for (let sx = 0; sx < SANDBOX_SECTOR_COLS; sx++) {
        if (world.exploredSectors[sy * SANDBOX_SECTOR_COLS + sx] === 0) {
          minimapFogCtx.fillRect(
            Math.floor(sx * secStepX),
            Math.floor(sy * secStepY),
            Math.ceil(secStepX),
            Math.ceil(secStepY)
          );
        }
      }
    }
  }
}

function drawSandboxScenicProp(
  ctx: CanvasRenderingContext2D,
  pr: SandboxScenicProp,
  camX: number,
  camY: number,
  time: number
): void {
  const sx = Math.round(pr.tx * TILE_SIZE - camX);
  const sy = Math.round(pr.ty * TILE_SIZE - camY);
  if (sx < -52 || sx > VIRTUAL_WIDTH + 52 || sy < -72 || sy > VIRTUAL_HEIGHT + 52) return;

  const hPx = (pr.h ?? 4) * TILE_SIZE;
  const sway = Math.round(Math.sin(time * 2.1 + pr.tx * 0.2) * 1.1);
  const pulse = Math.floor(time * 3.5 + pr.tx) % 2 === 0;

  if (pr.kind === 'torii_gate') {
    ctx.fillStyle = '#12050b';
    ctx.fillRect(sx - 12, sy - hPx + 8, 6, hPx - 8);
    ctx.fillRect(sx + 10, sy - hPx + 8, 6, hPx - 8);
    ctx.fillRect(sx - 16, sy - hPx, 36, 6);
    ctx.fillRect(sx - 13, sy - hPx + 8, 30, 3);
    ctx.fillStyle = '#cf274c';
    ctx.fillRect(sx - 11, sy - hPx + 6, 4, hPx - 10);
    ctx.fillRect(sx + 11, sy - hPx + 6, 4, hPx - 10);
    ctx.fillRect(sx - 15, sy - hPx + 1, 34, 4);
    ctx.fillRect(sx - 12, sy - hPx + 9, 28, 2);
    ctx.fillStyle = '#ffd27d';
    ctx.fillRect(sx, sy - hPx + 4, 4, 5);
  } else if (pr.kind === 'sakura_tree') {
    ctx.fillStyle = '#12050b';
    ctx.fillRect(sx - 2, sy - 28, 8, 28);
    ctx.fillStyle = '#6b333e';
    ctx.fillRect(sx - 1, sy - 27, 6, 27);
    ctx.fillStyle = '#a32856';
    ctx.fillRect(sx - 16 + sway, sy - 42, 36, 17);
    ctx.fillStyle = '#ff70a6';
    ctx.fillRect(sx - 14 + sway, sy - 45, 32, 15);
    ctx.fillStyle = '#ffd1dc';
    ctx.fillRect(sx - 10 + sway, sy - 43, 14, 5);
    ctx.fillRect(sx + 5 + sway, sy - 38, 10, 4);
  } else if (pr.kind === 'tree_pine') {
    ctx.fillStyle = '#090712';
    ctx.fillRect(sx, sy - 22, 6, 22);
    ctx.fillStyle = '#633c1e';
    ctx.fillRect(sx + 1, sy - 21, 4, 21);
    for (let tier = 0; tier < 3; tier++) {
      const w = 24 - tier * 5;
      const ty = sy - 19 - tier * 8;
      ctx.fillStyle = '#061712';
      ctx.fillRect(sx + 3 - w * 0.5 - 1, ty - 7, w + 2, 9);
      ctx.fillStyle = tier === 2 ? '#4df0a8' : '#1e7356';
      ctx.fillRect(sx + 3 - w * 0.5, ty - 6, w, 7);
      ctx.fillStyle = '#8effdb';
      ctx.fillRect(sx + 3 - w * 0.5 + 1, ty - 6, Math.max(2, w * 0.4), 2);
    }
  } else if (pr.kind === 'willow_tree') {
    ctx.fillStyle = '#0b1915';
    ctx.fillRect(sx + 1, sy - 24, 6, 24);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(sx - 10, sy - 34, 28, 12);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(sx - 8, sy - 36, 24, 8);
    for (let vx = -9; vx <= 13; vx += 4) {
      const vh = 12 + (Math.abs(vx + pr.tx) % 10);
      ctx.fillStyle = vx % 2 === 0 ? '#34d399cc' : '#5eead4aa';
      ctx.fillRect(sx + vx + sway, sy - 24, 2, vh);
    }
  } else if (pr.kind === 'cactus_saguaro') {
    ctx.fillStyle = '#08170b';
    ctx.fillRect(sx, sy - 22, 8, 22);
    ctx.fillRect(sx - 6, sy - 15, 6, 4);
    ctx.fillRect(sx - 6, sy - 21, 4, 9);
    ctx.fillRect(sx + 8, sy - 12, 6, 4);
    ctx.fillRect(sx + 10, sy - 18, 4, 9);
    ctx.fillStyle = '#2d9c4b';
    ctx.fillRect(sx + 1, sy - 21, 6, 21);
    ctx.fillRect(sx - 5, sy - 20, 2, 8);
    ctx.fillRect(sx + 11, sy - 17, 2, 8);
    ctx.fillStyle = '#8ef5a7';
    ctx.fillRect(sx + 2, sy - 20, 2, 18);
  } else if (pr.kind === 'giant_shroom') {
    ctx.fillStyle = '#061214';
    ctx.fillRect(sx + 1, sy - 18, 6, 18);
    ctx.fillStyle = '#c8ebe3';
    ctx.fillRect(sx + 2, sy - 17, 4, 17);
    ctx.fillStyle = '#061214';
    ctx.fillRect(sx - 8, sy - 26, 24, 10);
    ctx.fillStyle = '#18b88c';
    ctx.fillRect(sx - 7, sy - 25, 22, 8);
    ctx.fillStyle = '#a8ffea';
    ctx.fillRect(sx - 4, sy - 24, 4, 3);
    ctx.fillRect(sx + 5, sy - 22, 5, 3);
  } else if (pr.kind === 'crystal_spire') {
    ctx.fillStyle = '#071424';
    ctx.fillRect(sx - 2, sy - 22, 10, 22);
    ctx.fillStyle = '#52e5ff';
    ctx.fillRect(sx - 1, sy - 21, 8, 21);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx, sy - 20, 2, 15);
    drawCachedGlow(ctx, sx + 3, sy - 12, 16, '#52e5ff', 0.25, 1, true);
  } else if (pr.kind === 'aurora_prism') {
    const bob = Math.round(Math.sin(time * 3 + pr.tx) * 2);
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(sx - 2, sy - 22 + bob, 12, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(sx - 1, sy - 21 + bob, 10, 14);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(sx + 1, sy - 19 + bob, 6, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx + 2, sy - 18 + bob, 2, 6);
    drawCachedGlow(ctx, sx + 4, sy - 14 + bob, 18, '#38bdf8', 0.28, 1, true);
  } else if (pr.kind === 'clock_gear') {
    const cx = sx + 4;
    const cy = sy - 18;
    const rad = 13;
    const spin = time * 1.1 * (pr.tx % 2 === 0 ? 1 : -1);
    ctx.strokeStyle = '#0d0804';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#9e6c2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = spin + (i * Math.PI) / 4;
      const gx = Math.round(cx + Math.cos(a) * (rad + 2));
      const gy = Math.round(cy + Math.sin(a) * (rad + 2));
      ctx.fillStyle = '#ffb84d';
      ctx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
    }
    ctx.fillStyle = '#66e6ff';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
    ctx.lineWidth = 1;
  } else if (pr.kind === 'pendulum') {
    const ang = Math.sin(time * 2.1 + pr.tx * 0.1) * 0.35;
    const px0 = sx + 4;
    const py0 = sy - hPx;
    const bobX = Math.round(px0 + Math.sin(ang) * (hPx - 6));
    const bobY = Math.round(py0 + Math.cos(ang) * (hPx - 6));
    ctx.strokeStyle = '#ffd27d';
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    ctx.fillStyle = '#ffb84d';
    ctx.fillRect(bobX - 4, bobY - 4, 8, 8);
    ctx.fillStyle = '#fff5b8';
    ctx.fillRect(bobX - 2, bobY - 2, 4, 4);
  } else if (pr.kind === 'holo_pylon') {
    ctx.fillStyle = '#060c1a';
    ctx.fillRect(sx - 2, sy - 16, 12, 16);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(sx - 1, sy - 15, 10, 14);
    const bob = Math.round(Math.sin(time * 4.5 + pr.tx) * 2);
    ctx.fillStyle = '#22d3ee';
    ctx.fillRect(sx - 1, sy - 25 + bob, 10, 7);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(sx + 1, sy - 24 + bob, 6, 5);
    drawCachedGlow(ctx, sx + 4, sy - 21 + bob, 16, '#22d3ee', 0.28, 1, true);
  } else if (pr.kind === 'waterfall') {
    const flow = Math.floor(time * 32) % 10;
    ctx.fillStyle = '#0c3e5e77';
    ctx.fillRect(sx - 4, sy - hPx, 14, hPx);
    ctx.fillStyle = '#1875ab88';
    ctx.fillRect(sx - 2, sy - hPx, 10, hPx);
    ctx.fillStyle = '#e6fbffcc';
    for (let wy = (flow % 7); wy < hPx - 3; wy += 7) {
      ctx.fillRect(sx, sy - hPx + wy, 2, 4);
      ctx.fillRect(sx + 4, sy - hPx + ((wy + 3) % (hPx - 3)), 2, 3);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx - 4, sy - 3, 14, 3);
  } else if (pr.kind === 'ruin_tower') {
    ctx.fillStyle = '#090712';
    ctx.fillRect(sx - 4, sy - hPx, 18, hPx);
    ctx.fillStyle = '#3a3452';
    ctx.fillRect(sx - 3, sy - hPx + 2, 16, hPx - 2);
    ctx.fillStyle = '#5e5582';
    ctx.fillRect(sx - 4, sy - hPx - 2, 4, 4);
    ctx.fillRect(sx + 3, sy - hPx - 2, 4, 4);
    ctx.fillRect(sx + 10, sy - hPx - 2, 4, 4);
    ctx.fillStyle = pulse ? '#52e5ff' : '#ffd27d';
    ctx.fillRect(sx + 3, sy - hPx + 10, 4, 7);
  } else if (pr.kind === 'stained_window') {
    ctx.fillStyle = '#090712';
    ctx.fillRect(sx - 4, sy - 28, 14, 24);
    ctx.fillStyle = '#52e5ffaa';
    ctx.fillRect(sx - 3, sy - 26, 6, 10);
    ctx.fillStyle = '#f472b6aa';
    ctx.fillRect(sx + 3, sy - 26, 6, 10);
    ctx.fillStyle = '#ffd24daa';
    ctx.fillRect(sx - 3, sy - 16, 12, 10);
  } else if (pr.kind === 'alchemy_vat') {
    ctx.fillStyle = '#09141c';
    ctx.fillRect(sx - 4, sy - 24, 16, 24);
    ctx.fillStyle = '#114242';
    ctx.fillRect(sx - 2, sy - 20, 12, 17);
    const bub = Math.floor(time * 16 + pr.tx) % 12;
    ctx.fillStyle = '#34d399';
    ctx.fillRect(sx, sy - 6 - bub, 3, 3);
    ctx.fillStyle = '#d99e30';
    ctx.fillRect(sx - 3, sy - 23, 14, 3);
    ctx.fillRect(sx - 3, sy - 3, 14, 3);
  } else if (pr.kind === 'marble_column') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx - 3, sy - hPx, 14, hPx);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(sx - 2, sy - hPx + 3, 12, hPx - 6);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(sx - 4, sy - hPx, 16, 3);
    ctx.fillRect(sx - 4, sy - 3, 16, 3);
  } else if (pr.kind === 'pyramid_obelisk') {
    ctx.fillStyle = '#29170a';
    ctx.fillRect(sx - 2, sy - 26, 12, 26);
    ctx.fillStyle = '#a36e2c';
    ctx.fillRect(sx - 1, sy - 24, 10, 24);
    ctx.fillStyle = '#ffd24d';
    ctx.fillRect(sx + 1, sy - 28, 6, 5);
    ctx.fillRect(sx + 2, sy - 18, 4, 8);
  } else if (pr.kind === 'ruin_statue') {
    ctx.fillStyle = '#090712';
    ctx.fillRect(sx - 2, sy - 24, 14, 24);
    ctx.fillStyle = '#574e70';
    ctx.fillRect(sx - 1, sy - 23, 12, 23);
    ctx.fillStyle = '#8b80ab';
    ctx.fillRect(sx, sy - 22, 3, 20);
    ctx.fillStyle = '#52e5ff';
    ctx.fillRect(sx + 3, sy - 18, 2, 2);
    ctx.fillRect(sx + 7, sy - 18, 2, 2);
  } else if (pr.kind === 'sun_brazier') {
    ctx.fillStyle = '#0c0806';
    ctx.fillRect(sx - 1, sy - 14, 10, 14);
    ctx.fillStyle = '#785a32';
    ctx.fillRect(sx, sy - 13, 8, 13);
    const fl = Math.floor(time * 10 + pr.tx) % 2;
    ctx.fillStyle = '#ff6b2b';
    ctx.fillRect(sx, sy - 19 - fl, 8, 6);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(sx + 2, sy - 18, 4, 4);
    drawCachedGlow(ctx, sx + 4, sy - 16, 18, '#ff9933', 0.3, 1, true);
  } else if (pr.kind === 'coral_pillar') {
    ctx.fillStyle = '#081822';
    ctx.fillRect(sx, sy - 18, 8, 18);
    ctx.fillStyle = '#ff6b9d';
    ctx.fillRect(sx + 1, sy - 17, 6, 17);
    ctx.fillRect(sx - 4, sy - 13, 4, 4);
    ctx.fillRect(sx + 8, sy - 10, 4, 4);
    ctx.fillStyle = '#ffd1e3';
    ctx.fillRect(sx + 2, sy - 16, 2, 10);
  } else {
    ctx.fillStyle = '#0a0514';
    ctx.fillRect(sx, sy - 26, 10, 26);
    ctx.fillStyle = '#3c2661';
    ctx.fillRect(sx + 1, sy - 25, 8, 25);
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(sx + 4, sy - 20, 2, 12);
  }
}

function drawSandboxMinimap(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  playerTx: number,
  playerTy: number
): void {
  const world = engine.sandboxWorld;
  if (!world) return;
  ensureMinimapBuilt(world);

  // Compact minimap (scaled down so it never covers the playfield)
  const mw = Math.round(MINIMAP_W * 0.6);
  const mh = Math.round(MINIMAP_H * 0.6);
  const mx = VIRTUAL_WIDTH - mw - 4;
  const my = 20;

  ctx.save();
  ctx.fillStyle = 'rgba(7, 5, 13, 0.88)';
  ctx.fillRect(mx - 1, my - 1, mw + 2, mh + 2);
  ctx.strokeStyle = '#a892c766';
  ctx.lineWidth = 1;
  ctx.strokeRect(mx - 0.5, my - 0.5, mw + 1, mh + 1);

  if (minimapCanvas) {
    ctx.drawImage(minimapCanvas, mx, my, mw, mh);
  }
  if (minimapFogCanvas) {
    ctx.drawImage(minimapFogCanvas, mx, my, mw, mh);
  }

  // Pylon markers
  for (const py of world.pylons) {
    const px = mx + Math.floor((py.tx / SANDBOX_COLS) * mw);
    const ppy = my + Math.floor((py.ty / SANDBOX_ROWS) * mh);
    ctx.fillStyle = py.color;
    ctx.fillRect(px, ppy, 2, 2);
  }
  // Houses markers
  for (const h of world.houses) {
    const hx = mx + Math.floor((h.centerTx / SANDBOX_COLS) * mw);
    const hy = my + Math.floor((h.centerTy / SANDBOX_ROWS) * mh);
    ctx.fillStyle = '#ffe066';
    ctx.fillRect(hx - 1, hy - 1, 2, 2);
  }
  // Active Bosses
  for (const e of world.enemies) {
    if (e.isBoss && e.hp > 0) {
      const bx = mx + Math.floor((e.x / TILE_SIZE / SANDBOX_COLS) * mw);
      const by = my + Math.floor((e.y / TILE_SIZE / SANDBOX_ROWS) * mh);
      ctx.fillStyle = '#ff2e63';
      ctx.fillRect(bx - 1, by - 1, 3, 3);
    }
  }
  // Player crosshair
  const plx = mx + Math.floor((playerTx / SANDBOX_COLS) * mw);
  const ply = my + Math.floor((playerTy / SANDBOX_ROWS) * mh);
  ctx.fillStyle = '#090712';
  ctx.fillRect(plx - 1, ply - 1, 4, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(plx, ply, 2, 2);
  ctx.restore();
}

function drawSandboxProjectiles(ctx: CanvasRenderingContext2D, engine: GameEngine): void {
  for (const pr of engine.projectiles) {
    if (!pr.active) continue;
    if (pr.friendly && pr.pierceWalls && pr.radius >= 8) {
      // Soul Crescent Wave
      const dir = pr.vx >= 0 ? 1 : -1;
      const cx = Math.round(pr.x);
      const cy = Math.round(pr.y);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawCachedGlow(ctx, cx, cy, 14, pr.color, 0.55, 1, true);
      ctx.fillStyle = pr.color + '55';
      ctx.fillRect(cx - 6 * dir, cy - 9, 6, 18);
      ctx.fillStyle = pr.color;
      ctx.fillRect(cx - 2, cy - 8, 5, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + dir, cy - 6, 3, 12);
      ctx.restore();
      continue;
    }
    drawCachedGlow(ctx, pr.x, pr.y, 9, pr.color, 0.45, 1, true);
    ctx.fillStyle = colorWithAlpha(pr.color, 0.35);
    ctx.fillRect(snapHalf(pr.x - pr.vx * 0.03 - 1.5), snapHalf(pr.y - pr.vy * 0.03 - 1.5), 3, 3);
    ctx.fillStyle = '#09080f';
    ctx.fillRect(Math.round(pr.x - 3), Math.round(pr.y - 3), 6, 6);
    ctx.fillStyle = pr.color;
    ctx.fillRect(Math.round(pr.x - 2), Math.round(pr.y - 2), 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(pr.x - 1), Math.round(pr.y - 1), 2, 2);
  }
}

function tileHash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const TEXTURED_TILES = new Set<number>([
  SB_TILE.DIRT, SB_TILE.GRASS, SB_TILE.STONE, SB_TILE.SAND, SB_TILE.SNOW, SB_TILE.ICE,
  SB_TILE.MUD, SB_TILE.JUNGLE_GRASS, SB_TILE.ASH, SB_TILE.OBSIDIAN,
]);

/** Pixel speckles + depth-from-air shading so large terrain masses read as sculpted rock, not flat color. */
function drawTerrainTexture(
  ctx: CanvasRenderingContext2D,
  world: NonNullable<GameEngine['sandboxWorld']>,
  tile: number,
  tx: number,
  ty: number,
  sx: number,
  sy: number,
  meta: { color: string; highlightColor: string }
): void {
  if (!TEXTURED_TILES.has(tile)) return;
  const h = tileHash(tx, ty);
  const h2 = tileHash(tx + 911, ty - 377);
  // Dark pebbles
  ctx.fillStyle = 'rgba(9,7,18,0.28)';
  ctx.fillRect(sx + Math.floor(h * 6), sy + Math.floor(h2 * 6), 2, 1);
  if (h2 > 0.45) ctx.fillRect(sx + Math.floor(h2 * 5) + 1, sy + Math.floor(h * 5) + 2, 1, 2);
  // Light grains
  if (h > 0.55) {
    ctx.fillStyle = colorWithAlpha(meta.highlightColor, 0.35);
    ctx.fillRect(sx + Math.floor(h2 * 7), sy + Math.floor(h * 7), 1, 1);
  }
  // Large embedded stones every few tiles
  if (h > 0.93) {
    ctx.fillStyle = 'rgba(9,7,18,0.35)';
    ctx.fillRect(sx + 2, sy + 3, 4, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(sx + 2, sy + 3, 3, 1);
  }
  // Depth shading: tiles buried deeper than the nearest air above get progressively darker
  let depth = 0;
  for (let k = 1; k <= 4; k++) {
    const yy = ty - k;
    if (yy < 0 || !isSandboxSolid(world.tiles[yy * world.cols + tx])) break;
    depth = k;
  }
  if (depth > 0) {
    ctx.fillStyle = `rgba(7,5,14,${(depth * 0.09).toFixed(2)})`;
    ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
  }
}

/** Continuous, seamless underground backdrop: layered cave silhouettes that tile infinitely in X and Y. */
function drawCavernBackdrop(
  ctx: CanvasRenderingContext2D,
  meta: { tileMain: string; tileShadow: string; skyBottom?: string },
  camX: number,
  camY: number,
  time: number,
  depthRatio: number,
  hellRatio: number
): void {
  const g = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
  const top = hellRatio > 0.3 ? '#2a0d10' : '#151024';
  const bot = hellRatio > 0.3 ? '#4a1410' : '#0b0814';
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  const layers = [
    { par: 0.12, col: colorWithAlpha(meta.tileShadow, 0.35), amp: 26, step: 14 },
    { par: 0.25, col: colorWithAlpha(meta.tileShadow, 0.55), amp: 20, step: 10 },
    { par: 0.4, col: colorWithAlpha(meta.tileMain, 0.28), amp: 14, step: 8 },
  ];
  for (const L of layers) {
    const ox = camX * L.par;
    const oy = (camY * L.par) % 240;
    ctx.fillStyle = L.col;
    for (let x = -L.step; x < VIRTUAL_WIDTH + L.step; x += L.step) {
      const wx = Math.floor((x + ox) / L.step);
      const sx = x - (ox % L.step);
      const hTop = 10 + Math.floor(tileHash(wx, 7) * L.amp);
      const hBot = 10 + Math.floor(tileHash(wx, 13) * L.amp);
      ctx.fillRect(Math.round(sx), 0, L.step, hTop);
      ctx.fillRect(Math.round(sx), VIRTUAL_HEIGHT - hBot, L.step, hBot);
      // stalactite / pillar accents
      if (tileHash(wx, 29) > 0.82) {
        const py = Math.round(((tileHash(wx, 41) * 240 - oy) % 240 + 240) % 240) - 30;
        ctx.fillRect(Math.round(sx) + 3, py, 3, 40);
      }
    }
  }
  // Drifting motes for life
  ctx.fillStyle = hellRatio > 0.3 ? 'rgba(255,140,60,0.6)' : 'rgba(168,146,199,0.45)';
  for (let i = 0; i < 18; i++) {
    const mx = ((i * 53 - camX * 0.3 + time * 4) % VIRTUAL_WIDTH + VIRTUAL_WIDTH) % VIRTUAL_WIDTH;
    const my = ((i * 37 - camY * 0.3 - time * 3 * (1 + (i % 3))) % VIRTUAL_HEIGHT + VIRTUAL_HEIGHT) % VIRTUAL_HEIGHT;
    ctx.fillRect(Math.round(mx), Math.round(my), 1, 1);
  }
  if (depthRatio > 0) {
    ctx.fillStyle = `rgba(5,4,12,${(depthRatio * 0.25).toFixed(2)})`;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }
}

export function renderSandboxWorld(
  ctx: CanvasRenderingContext2D,
  engine: GameEngine,
  time: number,
  drawPlayerAndFx: () => void
): void {
  const world = engine.sandboxWorld;
  if (!world) return;

  const camX = Math.round(engine.cameraX);
  const camY = Math.round(engine.cameraY);
  const playerTx = Math.floor((engine.player.x + 4) / TILE_SIZE);
  const playerTy = Math.floor((engine.player.y + 5) / TILE_SIZE);
  const biome = getSandboxBiomeAt(playerTx, playerTy);
  const campaignBiome = getSandboxCampaignBiomeAt(playerTx, playerTy);
  const biomeMeta = getAnyBiomeMeta(campaignBiome);
  const dayTime = ((world.dayTime % 24) + 24) % 24;
  const night = isSandboxNight(dayTime);

  const depthRatio = Math.max(0, Math.min(1, (playerTy - 210) / 140));
  const hellRatio = Math.max(0, Math.min(1, (playerTy - 470) / 70));

  // 1. Campaign-grade Multi-Layer Parallax Backdrop & Biome Decor!
  const bgGx = Math.floor(playerTx / 120);
  const bgGy = Math.floor(playerTy / 80);
  // Anchor vertical parallax to the local surface line so the campaign backdrop never slides
  // off-screen (that used to cut the background abruptly while descending).
  const surfaceTy = getSandboxSurfaceHeightAt(playerTx, world.seed ?? 202504);
  const relY = Math.max(-60, Math.min(40, (camY - (surfaceTy * TILE_SIZE - VIRTUAL_HEIGHT * 0.62)) * 0.25));
  const caveMix = Math.max(0, Math.min(1, (playerTy - surfaceTy - 6) / 26));
  if (caveMix < 1) {
    drawEnhancedBackdrop(ctx, campaignBiome, bgGx, bgGy, camX * 0.45, relY, time, engine);
    drawBiomeDecorBackdrop(ctx, campaignBiome, camX * 0.45, relY, time);
  }
  if (caveMix > 0) {
    ctx.save();
    ctx.globalAlpha = caveMix;
    drawCavernBackdrop(ctx, biomeMeta, camX, camY, time, depthRatio, hellRatio);
    ctx.restore();
  }

  // Subtle Time-of-Day & Depth Atmospheric Wash (preserves vivid Campaign parallax behind!)
  if (depthRatio > 0.1) {
    ctx.fillStyle = `rgba(9, 7, 18, ${(depthRatio * 0.42).toFixed(2)})`;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  } else if (night) {
    ctx.fillStyle = 'rgba(7, 9, 28, 0.34)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  } else if (dayTime >= 16.5 && dayTime < 19) {
    ctx.fillStyle = 'rgba(217, 87, 99, 0.14)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  } else if (dayTime >= 5 && dayTime < 7.5) {
    ctx.fillStyle = 'rgba(247, 157, 101, 0.14)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }
  if (hellRatio > 0.05) {
    ctx.fillStyle = `rgba(88, 16, 14, ${(hellRatio * 0.28).toFixed(2)})`;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  }

  // Orbiting Sun / Moon & Stars above ground
  if (depthRatio < 0.4) {
    if (night || dayTime < 6.5 || dayTime > 17.5) {
      ctx.fillStyle = '#ffffffcc';
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 73 + Math.round(camX * 0.08)) % VIRTUAL_WIDTH + VIRTUAL_WIDTH) % VIRTUAL_WIDTH;
        const sy = (i * 29) % 95;
        ctx.globalAlpha = (Math.sin(time * 2.5 + i) > 0.2 ? 0.85 : 0.35) * (1 - depthRatio * 2);
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    const isSun = dayTime >= 6 && dayTime <= 18;
    const progress = isSun ? (dayTime - 6) / 12 : ((dayTime + 6) % 24) / 12;
    const ox = Math.round(28 + progress * (VIRTUAL_WIDTH - 56));
    const oy = Math.round(88 - Math.sin(progress * Math.PI) * 62);
    drawCachedGlow(ctx, ox, oy, isSun ? 20 : 14, isSun ? '#ffe066' : '#a8d5ff', 0.36, 1, true);
    ctx.fillStyle = isSun ? '#fff199' : '#e6f4ff';
    ctx.fillRect(ox - 4, oy - 4, 8, 8);
  }

  // 2. Chunk-Culled Campaign Scenic Props
  const minTx = Math.max(0, Math.floor(camX / TILE_SIZE) - 2);
  const maxTx = Math.min(world.cols - 1, Math.ceil((camX + VIRTUAL_WIDTH) / TILE_SIZE) + 2);
  const minTy = Math.max(0, Math.floor(camY / TILE_SIZE) - 2);
  const maxTy = Math.min(world.rows - 1, Math.ceil((camY + VIRTUAL_HEIGHT) / TILE_SIZE) + 2);

  const minBucket = Math.floor(minTx / 64) - 1;
  const maxBucket = Math.floor(maxTx / 64) + 1;
  for (let b = minBucket; b <= maxBucket; b++) {
    const props = world.scenicBuckets.get(b);
    if (!props) continue;
    for (const pr of props) {
      drawSandboxScenicProp(ctx, pr, camX, camY, time);
    }
  }

  // 3. Visible Tile Grid Window
  ctx.save();
  const lightSources: { sx: number; sy: number; color: string; rad: number }[] = [];

  for (let ty = minTy; ty <= maxTy; ty++) {
    const sy = ty * TILE_SIZE - camY;
    const rowOff = ty * world.cols;
    for (let tx = minTx; tx <= maxTx; tx++) {
      const idx = rowOff + tx;
      const sx = tx * TILE_SIZE - camX;
      const wall = world.walls[idx];
      const tile = world.tiles[idx];

      // Background wall
      if (wall !== SB_WALL.NONE) {
        const wCol = WALL_COLORS[wall] ?? WALL_COLORS[SB_WALL.DIRT_WALL];
        ctx.fillStyle = wCol.base;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = wCol.seam;
        if ((tx + ty) % 2 === 0) {
          ctx.fillRect(sx, sy, TILE_SIZE, 1);
          ctx.fillRect(sx, sy, 1, TILE_SIZE);
        }
      }

      if (tile === SB_TILE.AIR) continue;
      // Check crumbling tile vanish state
      const cState = world.crumbleTimers.get(idx);
      if (cState && cState.state === 'gone') {
        ctx.strokeStyle = '#a892c744';
        ctx.strokeRect(sx + 1.5, sy + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
        continue;
      }

      const meta = SANDBOX_TILE_META[tile];
      if (!meta) continue;

      if (tile === SB_TILE.WATER) {
        ctx.fillStyle = '#1875ab77';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        const upTile = ty > 0 ? world.tiles[(ty - 1) * world.cols + tx] : SB_TILE.AIR;
        if (upTile === SB_TILE.AIR) {
          const wave = Math.round(Math.sin(time * 4 + tx * 0.7) * 1);
          ctx.fillStyle = '#8ef5ffcc';
          ctx.fillRect(sx, sy + Math.max(0, wave), TILE_SIZE, 2);
        }
      } else if (tile === SB_TILE.DREAM_BLOCK) {
        ctx.fillStyle = '#120829';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#c084fc88';
        ctx.strokeRect(sx + 0.5, sy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        const tw = Math.floor(time * 5 + tx * 3 + ty * 7) % 4;
        ctx.fillStyle = tw === 0 ? '#ffffff' : tw === 1 ? '#52e5ff' : '#f472b6';
        ctx.fillRect(sx + ((tx * 3 + ty) % 5) + 1, sy + ((ty * 5 + tx) % 5) + 1, 2, 2);
      } else if (tile === SB_TILE.CLOUD_BOUNCE) {
        ctx.fillStyle = '#a3d5ff';
        ctx.fillRect(sx, sy + 1, TILE_SIZE, TILE_SIZE - 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 1, sy, TILE_SIZE - 2, 4);
      } else if (tile === SB_TILE.CONVEYOR_LEFT || tile === SB_TILE.CONVEYOR_RIGHT) {
        ctx.fillStyle = '#1c2436';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#39465e';
        ctx.fillRect(sx, sy + 1, TILE_SIZE, 2);
        const dir = tile === SB_TILE.CONVEYOR_RIGHT ? 1 : -1;
        const shift = ((Math.floor(time * 16 * dir) % 4) + 4) % 4;
        ctx.fillStyle = dir > 0 ? '#fb923c' : '#52e5ff';
        ctx.fillRect(sx + shift, sy + 2, 2, 2);
        ctx.fillRect(sx + ((shift + 4) % TILE_SIZE), sy + 2, 2, 2);
      } else if (tile === SB_TILE.CRUMBLE) {
        const jx = cState ? Math.round(Math.sin(time * 48) * 1.2) : 0;
        ctx.fillStyle = '#453759';
        ctx.fillRect(sx + jx, sy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#a892c7';
        ctx.fillRect(sx + jx + 1, sy + 1, TILE_SIZE - 2, 1);
        ctx.fillStyle = '#171124';
        ctx.fillRect(sx + jx + 2, sy + 3, 2, 4);
        ctx.fillRect(sx + jx + 4, sy + 2, 2, 3);
      } else if (tile === SB_TILE.MAGMA_CRUST) {
        ctx.fillStyle = '#5c1414';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#ff6b2b';
        ctx.fillRect(sx + 1, sy, TILE_SIZE - 2, 2);
        if ((tx + ty) % 2 === 0) {
          ctx.fillStyle = '#ffe066';
          ctx.fillRect(sx + 2, sy + 4, 3, 2);
        }
        lightSources.push({ sx: sx + 4, sy: sy + 4, color: '#ff5522', rad: 16 });
      } else if (tile === SB_TILE.SPIKE_UP) {
        ctx.fillStyle = '#181424';
        ctx.fillRect(sx, sy + 6, TILE_SIZE, 2);
        ctx.fillStyle = '#ff3864';
        ctx.fillRect(sx + 1, sy + 3, 2, 4);
        ctx.fillRect(sx + 5, sy + 2, 2, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + 1, sy + 2, 1, 1);
        ctx.fillRect(sx + 5, sy + 1, 1, 1);
      } else if (tile === SB_TILE.SECRET_WALL) {
        ctx.fillStyle = biomeMeta.tileMain;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = biomeMeta.tileShadow;
        ctx.fillRect(sx + 2, sy + 2, 4, 1);
        ctx.fillRect(sx + 3, sy + 5, 3, 1);
      } else if (tile === SB_TILE.PLATFORM) {
        ctx.fillStyle = '#090712';
        ctx.fillRect(sx, sy, TILE_SIZE, 3);
        ctx.fillStyle = meta.color;
        ctx.fillRect(sx, sy, TILE_SIZE, 2);
        ctx.fillStyle = meta.highlightColor;
        ctx.fillRect(sx, sy, TILE_SIZE, 1);
      } else if (tile === SB_TILE.TORCH || tile === SB_TILE.LANTERN) {
        const isLantern = tile === SB_TILE.LANTERN;
        if (isLantern) {
          ctx.fillStyle = '#1e192b';
          ctx.fillRect(sx + 2, sy, 4, 2);
          ctx.fillStyle = '#ffb84d';
          ctx.fillRect(sx + 1, sy + 2, 6, 5);
          ctx.fillStyle = '#fff9c4';
          ctx.fillRect(sx + 3, sy + 3, 2, 3);
          lightSources.push({ sx: sx + 4, sy: sy + 4, color: '#ffd27d', rad: 34 });
        } else {
          ctx.fillStyle = '#6e4526';
          ctx.fillRect(sx + 3, sy + 3, 2, 5);
          const flicker = Math.floor(time * 12 + tx) % 2;
          ctx.fillStyle = '#ff7733';
          ctx.fillRect(sx + 2, sy + 1 - flicker, 4, 3);
          ctx.fillStyle = '#fff5b8';
          ctx.fillRect(sx + 3, sy + 1, 2, 2);
          lightSources.push({ sx: sx + 4, sy: sy + 2, color: '#ffae42', rad: 26 });
        }
      } else if (tile === SB_TILE.WOOD_TRUNK) {
        ctx.fillStyle = '#29170a';
        ctx.fillRect(sx + 1, sy, 6, TILE_SIZE);
        ctx.fillStyle = meta.color;
        ctx.fillRect(sx + 2, sy, 4, TILE_SIZE);
        ctx.fillStyle = meta.highlightColor;
        ctx.fillRect(sx + 2, sy, 1, TILE_SIZE);
      } else if (tile === SB_TILE.LEAVES) {
        const isSakuraZone = biome.id === 'crimson_sakura';
        ctx.fillStyle = isSakuraZone ? '#4d122c' : '#091f11';
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = isSakuraZone ? '#e85d99' : meta.color;
        ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        ctx.fillStyle = isSakuraZone ? '#ffd1e3' : meta.highlightColor;
        ctx.fillRect(sx + 1, sy + 1, 3, 2);
        ctx.fillRect(sx + 5, sy + 4, 2, 2);
      } else if (tile === SB_TILE.DOOR_CLOSED) {
        const sp = SANDBOX_OBJECT_SPRITES.door_closed;
        drawPixelSprite(ctx, 'sb_door_closed', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else if (tile === SB_TILE.DOOR_OPEN) {
        ctx.fillStyle = '#3b210e';
        ctx.fillRect(sx, sy - 6, 3, TILE_SIZE + 6);
        ctx.fillStyle = meta.color;
        ctx.fillRect(sx, sy - 5, 2, TILE_SIZE + 5);
      } else if (tile === SB_TILE.WORKBENCH) {
        const sp = SANDBOX_OBJECT_SPRITES.workbench;
        drawPixelSprite(ctx, 'sb_workbench', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else if (tile === SB_TILE.LOOM) {
        ctx.fillStyle = '#1c0f29';
        ctx.fillRect(sx - 2, sy - 4, 12, 12);
        ctx.fillStyle = '#8b3fb0';
        ctx.fillRect(sx - 1, sy - 3, 10, 10);
        ctx.fillStyle = '#f0abfc';
        ctx.fillRect(sx + 1, sy - 1, 6, 4);
      } else if (tile === SB_TILE.ANVIL) {
        ctx.fillStyle = '#090712';
        ctx.fillRect(sx - 2, sy + 1, 12, 7);
        ctx.fillStyle = '#6b6485';
        ctx.fillRect(sx - 1, sy + 2, 10, 3);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(sx, sy + 1, 8, 1);
      } else if (tile === SB_TILE.FORGE) {
        const sp = SANDBOX_OBJECT_SPRITES.forge;
        const fi = Math.floor(time * 7 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_forge_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 3, color: '#ff6622', rad: 28 });
      } else if (tile === SB_TILE.CAULDRON) {
        const sp = SANDBOX_OBJECT_SPRITES.cauldron;
        const fi = Math.floor(time * 5 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_cauldron_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 2, color: '#4df0c0', rad: 22 });
      } else if (tile === SB_TILE.TABLE) {
        const sp = SANDBOX_OBJECT_SPRITES.table;
        drawPixelSprite(ctx, 'sb_table', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else if (tile === SB_TILE.CHAIR) {
        const sp = SANDBOX_OBJECT_SPRITES.chair;
        drawPixelSprite(ctx, 'sb_chair', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else if (tile === SB_TILE.CHEST) {
        const sp = SANDBOX_OBJECT_SPRITES.chest;
        drawPixelSprite(ctx, 'sb_chest', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        if (!world.openedChests.has(`${tx},${ty}`)) {
          lightSources.push({ sx: sx + 4, sy: sy + 3, color: '#ffe066', rad: 16 });
        }
      } else if (tile === SB_TILE.BED_SPAWN) {
        const sp = SANDBOX_OBJECT_SPRITES.bed;
        drawPixelSprite(ctx, 'sb_bed', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else if (tile === SB_TILE.ALTAR) {
        const sp = SANDBOX_OBJECT_SPRITES.altar;
        const fi = Math.floor(time * 4 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_altar_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 1, color: '#e88aff', rad: 26 });
      } else if (tile === SB_TILE.CAMPFIRE) {
        const sp = PROP_SPRITES.campfire;
        const fi = Math.floor(time * 8 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_campfire_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 3, color: '#ff9922', rad: 34 });
      } else if (tile === SB_TILE.SPRING_UP) {
        ctx.fillStyle = '#090712';
        ctx.fillRect(sx, sy + 5, 8, 3);
        ctx.fillStyle = '#ff4d7d';
        ctx.fillRect(sx + 1, sy + 2, 6, 3);
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(sx + 1, sy + 1, 6, 2);
      } else if (tile === SB_TILE.BOUNCE_SHROOM) {
        const sp = PROP_SPRITES.bounce_shroom;
        drawPixelSprite(ctx, 'sb_shroom', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 3, color: '#4df0c0', rad: 15 });
      } else if (tile === SB_TILE.DASH_CRYSTAL) {
        const sp = PROP_SPRITES.crystal;
        const fi = Math.floor(time * 5 + tx) % sp.frames.length;
        const bob = Math.round(Math.sin(time * 5 + tx) * 1.5);
        drawPixelSprite(ctx, `sb_crystal_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE + bob, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 3 + bob, color: '#4df099', rad: 18 });
      } else if (tile === SB_TILE.LIFE_CRYSTAL) {
        const sp = SANDBOX_OBJECT_SPRITES.life_crystal;
        const fi = Math.floor(time * 4 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_life_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 2, color: '#ff3864', rad: 20 });
      } else if (tile === SB_TILE.POT) {
        const sp = SANDBOX_OBJECT_SPRITES.pot;
        drawPixelSprite(ctx, 'sb_pot', sp.frames[0], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else if (tile === SB_TILE.SHRINE) {
        const sp = PROP_SPRITES.elemental_totem;
        const fi = Math.floor(time * 4 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_totem_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 2, color: '#52e5ff', rad: 24 });
      } else if (tile === SB_TILE.TELEPORT_PYLON) {
        const sp = SANDBOX_OBJECT_SPRITES.teleport_pylon;
        const fi = Math.floor(time * 4 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_pylon_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
        lightSources.push({ sx: sx + 4, sy: sy + 1, color: '#66eeff', rad: 30 });
      } else if (tile === SB_TILE.LORE_TABLET) {
        const read = world.readTablets.has(`${tx},${ty}`);
        ctx.fillStyle = '#0a0714';
        ctx.fillRect(sx - 1, sy - 6, 10, 14);
        ctx.fillStyle = '#3b4f78';
        ctx.fillRect(sx, sy - 5, 8, 12);
        ctx.fillStyle = read ? '#4df0c0' : '#67e8f9';
        ctx.fillRect(sx + 2, sy - 3, 4, 2);
        ctx.fillRect(sx + 1, sy + 1, 6, 2);
        if (!read) lightSources.push({ sx: sx + 4, sy: sy, color: '#67e8f9', rad: 20 });
      } else if (tile === SB_TILE.QUEST_BEACON) {
        const lit = world.litBeacons.has(`${tx},${ty}`);
        ctx.fillStyle = '#0a0814';
        ctx.fillRect(sx, sy - 8, 8, 16);
        ctx.fillStyle = '#1f5c6b';
        ctx.fillRect(sx + 1, sy - 7, 6, 15);
        ctx.fillStyle = lit ? '#ffe066' : '#52e5ff';
        ctx.fillRect(sx + 2, sy - 6, 4, 4);
        lightSources.push({ sx: sx + 4, sy: sy - 4, color: lit ? '#ffe066' : '#52e5ff', rad: lit ? 36 : 22 });
      } else if (tile === SB_TILE.BANNER) {
        const sp = SANDBOX_OBJECT_SPRITES.banner;
        const fi = Math.floor(time * 3 + tx) % sp.frames.length;
        drawPixelSprite(ctx, `sb_banner_${fi}`, sp.frames[fi], sp.palette, sx + 4, sy + TILE_SIZE, false, 1, 1, true);
      } else {
        // Sculpted Auto-Bordered Solid Terrain & Ores
        ctx.fillStyle = meta.color;
        ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        drawTerrainTexture(ctx, world, tile, tx, ty, sx, sy, meta);

        const upSolid = ty > 0 && isSandboxSolid(world.tiles[(ty - 1) * world.cols + tx]);
        const dnSolid = ty < world.rows - 1 && isSandboxSolid(world.tiles[(ty + 1) * world.cols + tx]);
        const lfSolid = tx > 0 && isSandboxSolid(world.tiles[rowOff + tx - 1]);
        const rtSolid = tx < world.cols - 1 && isSandboxSolid(world.tiles[rowOff + tx + 1]);

        if (!upSolid) {
          ctx.fillStyle = '#090712';
          ctx.fillRect(sx, sy, TILE_SIZE, 1);
          ctx.fillStyle = meta.highlightColor;
          ctx.fillRect(sx, sy + 1, TILE_SIZE, 2);
          if ((tile === SB_TILE.GRASS || tile === SB_TILE.JUNGLE_GRASS) && (tx + ty) % 2 === 0) {
            ctx.fillRect(sx + 2, sy - 1, 1, 1);
            ctx.fillRect(sx + 5, sy - 2, 1, 2);
          }
        }
        if (!dnSolid) {
          ctx.fillStyle = '#090712';
          ctx.fillRect(sx, sy + TILE_SIZE - 1, TILE_SIZE, 1);
        }
        if (!lfSolid) {
          ctx.fillStyle = '#090712';
          ctx.fillRect(sx, sy, 1, TILE_SIZE);
        }
        if (!rtSolid) {
          ctx.fillStyle = '#090712';
          ctx.fillRect(sx + TILE_SIZE - 1, sy, 1, TILE_SIZE);
        }

        if (
          tile === SB_TILE.COPPER_ORE ||
          tile === SB_TILE.IRON_ORE ||
          tile === SB_TILE.GOLD_ORE ||
          tile === SB_TILE.MITHRIL_ORE ||
          tile === SB_TILE.TITANIUM_ORE ||
          tile === SB_TILE.ADAMANTITE_ORE ||
          tile === SB_TILE.ETHER_ORE ||
          tile === SB_TILE.HELLSTONE
        ) {
          ctx.fillStyle = '#090712';
          ctx.fillRect(sx + 1, sy + 2, 3, 3);
          ctx.fillRect(sx + 4, sy + 5, 3, 2);
          ctx.fillStyle = meta.highlightColor;
          ctx.fillRect(sx + 1, sy + 2, 2, 2);
          ctx.fillRect(sx + 5, sy + 5, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx + 1, sy + 2, 1, 1);
          if (
            tile === SB_TILE.MITHRIL_ORE ||
            tile === SB_TILE.TITANIUM_ORE ||
            tile === SB_TILE.ADAMANTITE_ORE ||
            tile === SB_TILE.ETHER_ORE ||
            tile === SB_TILE.HELLSTONE
          ) {
            lightSources.push({ sx: sx + 4, sy: sy + 4, color: meta.highlightColor, rad: 14 });
          }
        } else if (
          tile === SB_TILE.BRICK_BLOCK ||
          tile === SB_TILE.DUNGEON_BRICK ||
          tile === SB_TILE.PLANK ||
          tile === SB_TILE.SAKURA_PLANK ||
          tile === SB_TILE.NEON_BRICK
        ) {
          ctx.fillStyle = meta.highlightColor;
          ctx.fillRect(sx, sy + 1, TILE_SIZE, 1);
          ctx.fillStyle = '#09071255';
          ctx.fillRect(sx, sy + 4, TILE_SIZE, 1);
          ctx.fillRect(sx + (ty % 2) * 4, sy, 1, TILE_SIZE);
        } else if (tile === SB_TILE.GLASS) {
          ctx.fillStyle = '#ffffff99';
          ctx.fillRect(sx + 1, sy + 1, 2, 2);
          ctx.fillRect(sx + 5, sy + 5, 2, 2);
        }
      }

      // Mining cracks
      const dmg = world.tileDamage[idx];
      if (dmg > 0 && meta.hitsRequired > 0) {
        const ratio = Math.min(1, dmg / meta.hitsRequired);
        ctx.fillStyle = 'rgba(9, 7, 18, 0.78)';
        ctx.fillRect(sx + 1, sy + 3, Math.ceil(6 * ratio), 2);
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(sx + 2, sy + 1, 1, Math.ceil(5 * ratio));
      }
    }
  }

  for (const g of lightSources) {
    drawCachedGlow(ctx, g.sx, g.sy, g.rad, g.color, 0.35, 1, true);
  }

  // Validated house beacons
  for (const h of world.houses) {
    const hsx = h.centerTx * TILE_SIZE - camX;
    const hsy = (h.centerTy - 2) * TILE_SIZE - camY;
    if (hsx < -20 || hsx > VIRTUAL_WIDTH + 20 || hsy < -20 || hsy > VIRTUAL_HEIGHT + 20) continue;
    drawPixelSprite(
      ctx,
      'sb_house_banner',
      SANDBOX_OBJECT_SPRITES.banner.frames[0],
      SANDBOX_OBJECT_SPRITES.banner.palette,
      hsx + 2,
      hsy + 6,
      false,
      0.85,
      0.85,
      true
    );
  }

  // NPCs
  for (const npc of world.npcs) {
    const nx = Math.round(npc.x - camX);
    const ny = Math.round(npc.y - camY);
    if (nx < -24 || nx > VIRTUAL_WIDTH + 24 || ny < -24 || ny > VIRTUAL_HEIGHT + 24) continue;
    const sp = npc.spriteKind ? NPC_SPRITES[npc.spriteKind] : undefined;
    if (sp && sp.frames.length > 0) {
      const fi = Math.floor(time * 3 + npc.homeTx) % sp.frames.length;
      drawPixelSprite(
        ctx,
        `sb_npc_${npc.spriteKind}_f${fi}`,
        sp.frames[fi],
        sp.palette,
        nx + 4,
        ny + 12,
        npc.dir < 0,
        1,
        1,
        true
      );
    } else {
      ctx.fillStyle = '#090712';
      ctx.fillRect(nx - 1, ny - 1, 10, 13);
      ctx.fillStyle = npc.accentColor;
      ctx.fillRect(nx + 1, ny + 4, 6, 7);
      ctx.fillStyle = '#ffd9bd';
      ctx.fillRect(nx + 2, ny, 4, 4);
    }
    if (Math.hypot(engine.player.x - npc.x, engine.player.y - npc.y) < 64) {
      ctx.fillStyle = '#090712cc';
      ctx.fillRect(nx - 6, ny - 14, 20, 4);
      ctx.fillStyle = npc.accentColor;
      ctx.fillRect(nx - 5, ny - 13, 18, 2);
    }
  }

  // Enemies & 4 Biome Bosses
  for (const foe of world.enemies) {
    if (foe.hp <= 0) continue;
    const fx = Math.round(foe.x - camX);
    const fy = Math.round(foe.y - camY);
    if (fx < -44 || fx > VIRTUAL_WIDTH + 44 || fy < -44 || fy > VIRTUAL_HEIGHT + 44) continue;
    const spKey =
      foe.spriteKind ??
      (foe.isBoss
        ? 'boss_ignis_rex'
        : foe.kind === 'slime'
          ? 'enemy_slime_king'
          : foe.kind === 'demon_eye'
            ? 'enemy_laser_eye'
            : foe.kind === 'hell_imp'
              ? 'enemy_cinder_sentinel'
              : 'enemy_crypt_reaper');
    const sp = ENEMY_SPRITES[spKey];
    if (sp && sp.frames.length > 0) {
      const fi = Math.floor(time * 6) % sp.frames.length;
      if (foe.isBoss) {
        drawCachedGlow(ctx, fx + foe.w * 0.5, fy + foe.h * 0.5, 24, foe.color || '#ff2e63', 0.4, 1, true);
      }
      drawPixelSprite(
        ctx,
        `sb_foe_${spKey}_f${fi}`,
        sp.frames[fi],
        sp.palette,
        fx + foe.w * 0.5,
        fy + foe.h,
        foe.vx < 0,
        1,
        1,
        true
      );
      if (foe.flash > 0) {
        ctx.fillStyle = '#ffffff88';
        ctx.fillRect(fx, fy, foe.w, foe.h);
      }
    } else {
      ctx.fillStyle = '#090712';
      ctx.fillRect(fx - 1, fy - 1, foe.w + 2, foe.h + 2);
      ctx.fillStyle = foe.flash > 0 ? '#ffffff' : foe.color;
      ctx.fillRect(fx, fy, foe.w, foe.h);
    }

    if (foe.isBoss) {
      ctx.strokeStyle = foe.color || '#ffe066';
      ctx.beginPath();
      ctx.arc(fx + foe.w * 0.5, fy + foe.h * 0.5, foe.w * 0.72 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#090712';
      ctx.fillRect(fx - 4, fy - 9, foe.w + 8, 3);
      ctx.fillStyle = '#ff2e63';
      ctx.fillRect(fx - 3, fy - 8, Math.round((foe.w + 6) * Math.max(0, foe.hp / foe.maxHp)), 1);
    } else if (foe.hp < foe.maxHp) {
      ctx.fillStyle = '#090712';
      ctx.fillRect(fx, fy - 5, foe.w, 2);
      ctx.fillStyle = '#ff5c8a';
      ctx.fillRect(fx, fy - 5, Math.round(foe.w * Math.max(0, foe.hp / foe.maxHp)), 1);
    }
  }

  // World-space player, pet, projectiles, swings & FX
  ctx.save();
  ctx.translate(-camX, -camY);
  drawSandboxProjectiles(ctx, engine);
  drawPlayerAndFx();

  if (engine.sandboxSwingTimer > 0) {
    const prog = 1 - engine.sandboxSwingTimer / 0.18;
    const baseAngle = engine.sandboxSwingAngle;
    const sweep = baseAngle + (prog - 0.5) * 1.9;
    const ox = engine.player.x + 4;
    const oy = engine.player.y + 4;
    const isBlade = engine.sandboxSwingKind === 'weapon';
    const len = isBlade ? 16 : 13;
    const tipX = ox + Math.cos(sweep) * len;
    const tipY = oy + Math.sin(sweep) * len;

    ctx.strokeStyle = isBlade ? '#ff5c8a' : '#52e5ff';
    ctx.lineWidth = isBlade ? 2.5 : 2;
    ctx.beginPath();
    ctx.arc(ox, oy, len - 2, sweep - 0.7, sweep + 0.1);
    ctx.stroke();

    ctx.strokeStyle = '#6e4526';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.fillStyle = isBlade ? '#ffe066' : '#a8f5ff';
    ctx.fillRect(Math.round(tipX) - 2, Math.round(tipY) - 2, 4, 4);
  }
  ctx.restore();

  // Target Hover Cursor Box (respects reach indicator)
  if (engine.sandboxHoverTx >= 0 && engine.sandboxHoverTy >= 0) {
    const hx = engine.sandboxHoverTx * TILE_SIZE - camX;
    const hy = engine.sandboxHoverTy * TILE_SIZE - camY;
    const inReach = Math.hypot(engine.sandboxHoverTx - playerTx, engine.sandboxHoverTy - playerTy) <= 10;
    ctx.strokeStyle = inReach ? '#ffe066dd' : '#ff5c8a99';
    ctx.lineWidth = 1;
    ctx.strokeRect(hx + 0.5, hy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  }

  ctx.restore();

  // 4. Campaign Foreground Parallax & Atmospheric Particles
  drawEnhancedForeground(ctx, campaignBiome, time, engine, camX * 0.45, camY * 0.25);
  drawBiomeDecorForeground(ctx, campaignBiome, camX * 0.45, time);

  // 5. Subtle Deep-Cave / Night Ambient Light Cutout (gentle so biome colors remain crisp)
  if ((night || depthRatio > 0.45) && typeof document !== 'undefined') {
    if (!sbLightCanvas) {
      sbLightCanvas = document.createElement('canvas');
      sbLightCanvas.width = VIRTUAL_WIDTH;
      sbLightCanvas.height = VIRTUAL_HEIGHT;
      sbLightCtx = sbLightCanvas.getContext('2d');
    }
    if (sbLightCtx && sbLightCanvas) {
      const darknessAlpha = Math.max(night ? 0.32 : 0, depthRatio * 0.52);
      sbLightCtx.globalCompositeOperation = 'source-over';
      sbLightCtx.fillStyle = `rgba(5, 4, 14, ${darknessAlpha.toFixed(2)})`;
      sbLightCtx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      sbLightCtx.globalCompositeOperation = 'destination-out';

      const punch = (lx: number, ly: number, rad: number) => {
        if (lx + rad < 0 || lx - rad > VIRTUAL_WIDTH || ly + rad < 0 || ly - rad > VIRTUAL_HEIGHT) return;
        const g = sbLightCtx!.createRadialGradient(lx, ly, rad * 0.2, lx, ly, rad);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        sbLightCtx!.fillStyle = g;
        sbLightCtx!.beginPath();
        sbLightCtx!.arc(lx, ly, rad, 0, Math.PI * 2);
        sbLightCtx!.fill();
      };
      punch(engine.player.x + 4 - camX, engine.player.y + 5 - camY, 64);
      for (const ls of lightSources) {
        punch(ls.sx, ls.sy, ls.rad * 1.5);
      }
      ctx.drawImage(sbLightCanvas, 0, 0);
    }
  }

  // 6. Top-Right Cached Minimap
  drawSandboxMinimap(ctx, engine, playerTx, playerTy);
}
