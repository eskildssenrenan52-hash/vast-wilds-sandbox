// @ts-nocheck -- decoupled pure side quest definitions and progression helpers
import type { SideQuestDef, SideQuestKind, SideQuestViewItem } from './types';

export const STAGE_EXPLORATION_SECTORS = 6;

const REGION_EPITHETS = [
  'da Vigília',
  'dos Ecos',
  'de Cristal',
  'da Forja',
  'do Vazio',
  'da Aurora',
  'do Abismo',
  'Celeste',
  'Escarlate',
  'da Eternidade',
];

const UW_EPITHETS = [
  'do Estige',
  'de Tártaro',
  'das Cinzas',
  'de Cócito',
  'do Ossuário',
  'da Caldeira',
  'de Érebo',
  'do Pandemônio',
];

export function getSideQuestKey(chapterIndex: number, isUnderworld: boolean, kind: SideQuestKind): string {
  return `${isUnderworld ? 'uw' : 'sf'}_ch${chapterIndex}_${kind}`;
}

export function generateChapterSideQuests(
  chapterIndex: number,
  isUnderworld: boolean,
  chapterName?: string
): SideQuestDef[] {
  const chNum = chapterIndex + 1;
  const epithet = isUnderworld
    ? UW_EPITHETS[chapterIndex % UW_EPITHETS.length]
    : REGION_EPITHETS[chapterIndex % REGION_EPITHETS.length];
  const worldLabel = chapterName
    ? chapterName.replace(/^(Fase|Círculo)\s+[IVXLCDM\d]+\s*·\s*/i, '')
    : `${isUnderworld ? 'Círculo' : 'Fase'} ${chNum}`;

  const tierScale = Math.min(2.5, 1 + chapterIndex * 0.04);
  const coinBase = Math.round(16 * tierScale);
  const xpBase = Math.round(75 * tierScale);
  const passBase = Math.round(55 * tierScale);

  // Rotate 4th quest specialty across chapters for rich variety
  const bonusCycle: SideQuestKind[] = ['lore_tablets', 'star_shards', 'style_mastery'];
  const bonusKind = bonusCycle[chapterIndex % bonusCycle.length];

  const bonusQuest: SideQuestDef =
    bonusKind === 'lore_tablets'
      ? {
          id: getSideQuestKey(chapterIndex, isUnderworld, 'lore_tablets'),
          chapterIndex,
          isUnderworld,
          kind: 'lore_tablets',
          title: `Crônicas ${epithet}`,
          lore: `Decifre as Estelas de Sabedoria ocultas nos altos e vales de ${worldLabel}.`,
          objectiveLabel: 'Estelas de Sabedoria decifradas',
          target: isUnderworld ? 2 : 3,
          coinReward: Math.round(coinBase * 1.2),
          playerXpReward: Math.round(xpBase * 1.25),
          passXpReward: Math.round(passBase * 1.15),
          accent: '#67e8f9',
        }
      : bonusKind === 'star_shards'
        ? {
            id: getSideQuestKey(chapterIndex, isUnderworld, 'star_shards'),
            chapterIndex,
            isUnderworld,
            kind: 'star_shards',
            title: `Estilhaços ${epithet}`,
            lore: `Recupere fragmentos estelares nas rotas superiores de ${worldLabel}.`,
            objectiveLabel: 'Estilhaços Estelares coletados',
            target: isUnderworld ? 4 : 6,
            coinReward: Math.round(coinBase * 1.25),
            playerXpReward: Math.round(xpBase * 1.2),
            passXpReward: Math.round(passBase * 1.2),
            accent: '#fde047',
          }
        : {
            id: getSideQuestKey(chapterIndex, isUnderworld, 'style_mastery'),
            chapterIndex,
            isUnderworld,
            kind: 'style_mastery',
            title: `Arte de Combate ${epithet}`,
            lore: `Execute Golpes de Alma ou Esquivas Perfeitas diante dos sentinelas de ${worldLabel}.`,
            objectiveLabel: 'Golpes de Alma / Esquivas Perfeitas',
            target: 5,
            coinReward: Math.round(coinBase * 1.3),
            playerXpReward: Math.round(xpBase * 1.35),
            passXpReward: Math.round(passBase * 1.25),
            accent: '#f472b6',
        };

  return [
    {
      id: getSideQuestKey(chapterIndex, isUnderworld, 'light_beacons'),
      chapterIndex,
      isUnderworld,
      kind: 'light_beacons',
      title: `Faróis ${epithet}`,
      lore: `Acenda os Faróis Astrais espalhados pelas asas expandidas de ${worldLabel}.`,
      objectiveLabel: 'Faróis Astrais acesos',
      target: isUnderworld ? 3 : 4,
      coinReward: coinBase,
      playerXpReward: xpBase,
      passXpReward: passBase,
      accent: '#52e5ff',
    },
    {
      id: getSideQuestKey(chapterIndex, isUnderworld, 'hunt_elites'),
      chapterIndex,
      isUnderworld,
      kind: 'hunt_elites',
      title: `Caçada de Elite ${epithet}`,
      lore: `Derrote Guardiões Coroados e ameaças que protegem as rotas laterais de ${worldLabel}.`,
      objectiveLabel: 'Guardiões de Elite derrotados',
      target: isUnderworld ? 2 : 3,
      coinReward: Math.round(coinBase * 1.35),
      playerXpReward: Math.round(xpBase * 1.4),
      passXpReward: Math.round(passBase * 1.3),
      accent: '#fb7185',
    },
    {
      id: getSideQuestKey(chapterIndex, isUnderworld, 'secret_vaults'),
      chapterIndex,
      isUnderworld,
      kind: 'secret_vaults',
      title: `Cofres ${epithet}`,
      lore: `Encontre e abra Baús de Tesouro escondidos em câmaras secretas de ${worldLabel}.`,
      objectiveLabel: 'Cofres / Baús abertos',
      target: isUnderworld ? 2 : 3,
      coinReward: Math.round(coinBase * 1.15),
      playerXpReward: Math.round(xpBase * 1.15),
      passXpReward: Math.round(passBase * 1.1),
      accent: '#ffd27d',
    },
    bonusQuest,
  ];
}

export function buildSideQuestViewList(
  chapterIndex: number,
  isUnderworld: boolean,
  chapterName: string,
  progressMap: Record<string, number>,
  claimedSet: Set<string>
): SideQuestViewItem[] {
  const defs = generateChapterSideQuests(chapterIndex, isUnderworld, chapterName);
  return defs.map((def) => {
    const raw = Math.max(0, Math.floor(progressMap[def.id] ?? 0));
    const progress = Math.min(def.target, raw);
    const completed = progress >= def.target;
    const claimed = claimedSet.has(def.id);
    return {
      ...def,
      progress,
      completed,
      claimed,
    };
  });
}

export function incrementSideQuestMap(
  progressMap: Record<string, number>,
  chapterIndex: number,
  isUnderworld: boolean,
  kind: SideQuestKind,
  delta = 1
): { questId: string; newProgress: number; justCompleted: boolean } {
  const defs = generateChapterSideQuests(chapterIndex, isUnderworld);
  const match = defs.find((d) => d.kind === kind);
  if (!match) {
    return {
      questId: getSideQuestKey(chapterIndex, isUnderworld, kind),
      newProgress: 0,
      justCompleted: false,
    };
  }
  const prev = Math.max(0, Math.floor(progressMap[match.id] ?? 0));
  const next = Math.min(match.target, prev + Math.max(1, delta));
  progressMap[match.id] = next;
  return {
    questId: match.id,
    newProgress: next,
    justCompleted: prev < match.target && next >= match.target,
  };
}

export function computeRoomSectorIndex(playerCenterX: number, roomWidthPx: number): number {
  if (roomWidthPx <= 0) return 0;
  const ratio = Math.max(0, Math.min(0.9999, playerCenterX / roomWidthPx));
  return Math.floor(ratio * STAGE_EXPLORATION_SECTORS);
}

export function computeStageExplorationPct(visitedSectors: number[] | undefined): number {
  if (!visitedSectors || visitedSectors.length === 0) return 0;
  const unique = new Set(visitedSectors.filter((s) => s >= 0 && s < STAGE_EXPLORATION_SECTORS));
  return Math.min(100, Math.round((unique.size / STAGE_EXPLORATION_SECTORS) * 100));
}
