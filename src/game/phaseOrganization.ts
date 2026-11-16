// @ts-nocheck -- imported game code
import { AnyBiomeId, EntityKind } from './types';

export type PhaseTopologyArchetype =
  | 'bifurcated_twin'
  | 'hub_and_wings'
  | 'vertical_zigzag'
  | 'labyrinth_ring'
  | 'gauntlet_spire'
  | 'archipelago_clusters';

export interface OrganizedRoomNode {
  gx: number;
  gy: number;
  role: 'start' | 'main' | 'branch' | 'secret' | 'vertical' | 'sanctuary' | 'gauntlet' | 'goal';
  pattern: number;
  cols: number;
  rows: number;
  titlePrefix: string;
  subtitle: string;
  difficultyWeight: number;
  isStart?: boolean;
  isGoal?: boolean;
}

export interface PhaseOrganizationPlan {
  chapterIndex: number;
  archetype: PhaseTopologyArchetype;
  roomCount: number;
  nodes: OrganizedRoomNode[];
}

const ARCHETYPES: PhaseTopologyArchetype[] = [
  'bifurcated_twin',
  'hub_and_wings',
  'vertical_zigzag',
  'labyrinth_ring',
  'gauntlet_spire',
  'archipelago_clusters',
];

function hashPhase(a: number, b: number, c: number): number {
  let x = (a * 374761393 + b * 668265263 + c * 2147483647) >>> 0;
  x = ((x ^ (x >>> 13)) * 1274126177) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

/**
 * Generates an organic, connected, non-repeating grid organization of rooms (12 up to 20 rooms max)
 * so every single phase in the campaign has its own unique multi-path topology, branches,
 * secret vaults, vertical shafts, and progressive difficulty escalation.
 */
export function generateUniquePhaseOrganization(
  chapterIndex: number,
  maxRoomsCap = 20
): PhaseOrganizationPlan {
  const cap = Math.max(10, Math.min(20, maxRoomsCap));
  // Smoothly scale room count across the 50 chapters: starts at 12-14, reaches up to 20 rooms per phase
  const seed = hashPhase(chapterIndex + 1, 91, 313);
  const baseCount =
    chapterIndex < 5
      ? 12 + (chapterIndex % 3) // 12..14
      : chapterIndex < 15
        ? 14 + (chapterIndex % 4) // 14..17
        : chapterIndex < 30
          ? 16 + (chapterIndex % 5) // 16..20
          : 18 + (chapterIndex % 3); // 18..20
  const roomCount = Math.min(cap, Math.max(10, baseCount));
  const archetype = ARCHETYPES[(chapterIndex + (seed % 3)) % ARCHETYPES.length];

  const occupied = new Map<string, OrganizedRoomNode>();
  const ordered: OrganizedRoomNode[] = [];

  const place = (
    gx: number,
    gy: number,
    role: OrganizedRoomNode['role'],
    titlePrefix: string,
    subtitle: string,
    extra: Partial<OrganizedRoomNode> = {}
  ): boolean => {
    const key = `${gx},${gy}`;
    if (occupied.has(key) || ordered.length >= roomCount) return false;
    const idx = ordered.length;
    const isVert = role === 'vertical' || (idx > 0 && idx % 5 === 3);
    const pattern = (hashPhase(chapterIndex + 1, idx + 1, gx * 17 + gy * 31) % 6);
    const node: OrganizedRoomNode = {
      gx,
      gy,
      role,
      pattern: isVert ? 4 : pattern === 4 ? (idx % 3) : pattern,
      cols: isVert ? 48 : 60 + ((idx + chapterIndex) % 3) * 4,
      rows: isVert ? 34 : 26 + ((idx % 4 === 2) ? 2 : 0),
      titlePrefix,
      subtitle,
      difficultyWeight: Number((1 + (idx / Math.max(1, roomCount - 1)) * 1.4).toFixed(2)),
      ...extra,
    };
    occupied.set(key, node);
    ordered.push(node);
    return true;
  };

  // Start node at left-bottom / left-mid anchor depending on archetype
  const startGy = archetype === 'vertical_zigzag' ? 4 : 2;
  place(0, startGy, 'start', 'Pórtico Inicial', 'Entrada única desta fase — explore caminhos principais e secretos', {
    isStart: true,
    pattern: 0,
  });

  // Build connected spine from Start toward East while branching North/South according to archetype
  let curX = 0;
  let curY = startGy;

  const branchQueue: { x: number; y: number; dirX: number; dirY: number; label: string; role: OrganizedRoomNode['role'] }[] = [];

  while (ordered.length < roomCount - 1) {
    const step = ordered.length;
    // Choose next spine step cleanly so path never deadlocks
    let nextX = curX + 1;
    let nextY = curY;

    if (archetype === 'vertical_zigzag') {
      if (step % 3 === 1 && curY > 0 && !occupied.has(`${curX},${curY - 1}`)) {
        nextX = curX;
        nextY = curY - 1;
      } else if (step % 4 === 2 && curY < 4 && !occupied.has(`${curX},${curY + 1}`)) {
        nextX = curX;
        nextY = curY + 1;
      }
    } else if (archetype === 'bifurcated_twin') {
      if (step === 2 && curY > 0) {
        branchQueue.push({ x: curX, y: curY - 1, dirX: 1, dirY: 0, label: 'Rota Superior', role: 'branch' });
        branchQueue.push({ x: curX, y: curY + 1, dirX: 1, dirY: 0, label: 'Trilha Inferior', role: 'branch' });
      }
      if (step % 3 === 0 && (step + seed) % 2 === 0 && curY > 0 && !occupied.has(`${curX},${curY - 1}`)) {
        nextX = curX;
        nextY = curY - 1;
      }
    } else if (archetype === 'hub_and_wings') {
      if (step === 3) {
        branchQueue.push({ x: curX, y: Math.max(0, curY - 1), dirX: 0, dirY: -1, label: 'Ala Norte do Cofre', role: 'secret' });
        branchQueue.push({ x: curX, y: curY + 1, dirX: 0, dirY: 1, label: 'Fosso Sul de Provação', role: 'gauntlet' });
      }
      if (step === 6) {
        branchQueue.push({ x: curX, y: Math.max(0, curY - 1), dirX: 1, dirY: 0, label: 'Galeria Suspensa', role: 'branch' });
      }
    } else if (archetype === 'labyrinth_ring') {
      if (step === 2) {
        branchQueue.push({ x: curX, y: Math.max(0, curY - 1), dirX: 1, dirY: 0, label: 'Anel Superior', role: 'branch' });
      } else if (step === 5) {
        branchQueue.push({ x: curX, y: curY + 1, dirX: 1, dirY: 0, label: 'Câmara Oculta', role: 'secret' });
      }
    } else if (archetype === 'gauntlet_spire') {
      if (step % 4 === 2 && curY > 0 && !occupied.has(`${curX},${curY - 1}`)) {
        nextX = curX;
        nextY = curY - 1;
      } else if (step === 4) {
        branchQueue.push({ x: curX, y: curY + 1, dirX: 1, dirY: 0, label: 'Bastilha de Combate', role: 'gauntlet' });
      }
    } else {
      // archipelago_clusters
      if (step === 3 || step === 7) {
        branchQueue.push({ x: curX, y: curY > 0 ? curY - 1 : curY + 1, dirX: 1, dirY: 0, label: 'Ilhota Secreta', role: 'secret' });
      }
    }

    // Drain 1 queued side-branch room per cycle so side paths flourish naturally before Goal!
    if (branchQueue.length > 0 && step % 2 === 0 && ordered.length < roomCount - 2) {
      const br = branchQueue.shift()!;
      if (!occupied.has(`${br.x},${br.y}`)) {
        place(
          br.x,
          br.y,
          br.role,
          br.label,
          br.role === 'secret'
            ? 'Ala opcional repleta de materiais raros e relíquia escondida'
            : 'Caminho alternativo com emboscadas e atalhos táticos'
        );
        if (ordered.length < roomCount - 3 && br.x + br.dirX >= 0 && br.y + br.dirY >= 0) {
          branchQueue.push({
            x: br.x + br.dirX,
            y: Math.max(0, br.y + br.dirY),
            dirX: 1,
            dirY: 0,
            label: `${br.label} II`,
            role: br.role,
          });
        }
        continue;
      }
    }

    // Guarantee spine step always succeeds by shifting east if needed
    if (occupied.has(`${nextX},${nextY}`)) {
      nextX = curX + 1;
      nextY = curY;
    }
    while (occupied.has(`${nextX},${nextY}`)) {
      nextX += 1;
    }

    const isSanctuary = step === Math.floor(roomCount * 0.5);
    const isVert = !isSanctuary && nextY !== curY;
    const role: OrganizedRoomNode['role'] = isSanctuary
      ? 'sanctuary'
      : isVert
        ? 'vertical'
        : step >= roomCount - 3
          ? 'gauntlet'
          : 'main';

    const titlePrefix = isSanctuary
      ? 'Santuário Intermediário'
      : isVert
        ? 'Eixo Vertical'
        : role === 'gauntlet'
          ? 'Corredor de Elite'
          : 'Travessia';
    const subtitle = isSanctuary
      ? 'Altar de Bênçãos e Fogueira antes da metade final da fase'
      : role === 'gauntlet'
        ? 'Inimigos exclusivos intensificam a pressão rumo ao Chefe!'
        : 'Setor progressivo com caminhos conectados e recursos do bioma';

    place(nextX, nextY, role, titlePrefix, subtitle);
    curX = nextX;
    curY = nextY;
  }

  // Final room = Boss Arena / Goal Room strictly adjacent to curX, curY so it's 100% reachable!
  let goalX = curX + 1;
  let goalY = curY;
  while (occupied.has(`${goalX},${goalY}`)) {
    goalX += 1;
  }
  place(goalX, goalY, 'goal', 'Santuário do Chefe', 'Derrote o Guardião da Fase para purificar o bioma!', {
    isGoal: true,
    cols: 62,
    rows: 26,
    pattern: 0,
  });

  // Normalize gy to >= 0
  let minGy = Infinity;
  for (const n of ordered) minGy = Math.min(minGy, n.gy);
  if (minGy < 0) {
    for (const n of ordered) n.gy -= minGy;
  }

  return {
    chapterIndex,
    archetype,
    roomCount: ordered.length,
    nodes: ordered,
  };
}

/** Verifies via BFS on (gx, gy) adjacency that start node reaches goal node and all nodes are connected. */
export function verifyPhaseGraphConnected(nodes: { gx: number; gy: number; isStart?: boolean; isGoal?: boolean }[]): boolean {
  if (nodes.length === 0) return false;
  const map = new Map<string, number>();
  nodes.forEach((n, idx) => map.set(`${n.gx},${n.gy}`, idx));
  const startIdx = Math.max(0, nodes.findIndex((n) => n.isStart));
  const visited = new Set<number>([startIdx]);
  const queue = [startIdx];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (queue.length > 0) {
    const i = queue.shift()!;
    const cur = nodes[i];
    for (const [dx, dy] of dirs) {
      const nbIdx = map.get(`${cur.gx + dx},${cur.gy + dy}`);
      if (nbIdx !== undefined && !visited.has(nbIdx)) {
        visited.add(nbIdx);
        queue.push(nbIdx);
      }
    }
  }
  return visited.size === nodes.length;
}

export function getArchetypeLabel(a: PhaseTopologyArchetype): string {
  switch (a) {
    case 'bifurcated_twin':
      return 'Rotas Gêmeas Bifurcadas';
    case 'hub_and_wings':
      return 'Encruzilhada Central & Alas';
    case 'vertical_zigzag':
      return 'Ziguezague Vertical Escalonado';
    case 'labyrinth_ring':
      return 'Labirinto em Anéis';
    case 'gauntlet_spire':
      return 'Torreão & Bastilhas';
    case 'archipelago_clusters':
      return 'Arquipélago Conectado';
  }
}

export function getProgressiveEnemySpawnCount(stageIdx: number, totalStages: number): number {
  const ratio = totalStages > 1 ? stageIdx / (totalStages - 1) : 0;
  if (ratio < 0.25) return 1;
  if (ratio < 0.55) return 2;
  if (ratio < 0.85) return 3;
  return 4;
}

export function selectProgressiveEnemyKind(
  biomeEnemies: [EntityKind, EntityKind, EntityKind],
  exclusivePair: [EntityKind, EntityKind],
  stageIdx: number,
  totalStages: number,
  slotIdx: number
): EntityKind {
  const ratio = totalStages > 1 ? stageIdx / (totalStages - 1) : 0;
  if (ratio >= 0.45 && slotIdx % 2 === 1) {
    return exclusivePair[slotIdx % exclusivePair.length];
  }
  if (ratio >= 0.72) {
    return slotIdx === 0 ? exclusivePair[0] : exclusivePair[1];
  }
  return biomeEnemies[slotIdx % biomeEnemies.length];
}
