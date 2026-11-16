// @ts-nocheck -- imported game code
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getHeroEvolutionData, EVOLUTION_TIER_NAMES } from '../../game/heroEvolution';
import type { HeroDef } from '../../game/heroes';
import { DETAILED_PETS, DETAILED_PET_MAP } from '../../game/pets';
import { generateUniquePhaseOrganization, getArchetypeLabel } from '../../game/phaseOrganization';
import { ENEMY_SPRITES, PROP_SPRITES, drawPixelSprite } from '../../game/sprites';
import { ChapterDef, SpiritId, TILE_SIZE, TileType } from '../../game/types';
import { getAnyBiomeMeta } from '../../game/worldDataUnderworld';
import { HeroFullSpriteCanvas } from './HeroPortrait';
import { PetSpriteCanvas } from './PetsModal';
import { PixelButton, PixelIcon } from './PixelUi';

interface StagePreviewCardProps {
  chapter: ChapterDef;
  chapterIndex: number;
  isUnderworld: boolean;
  onOpenStageMap: () => void;
}

export const StagePreviewCard: React.FC<StagePreviewCardProps> = ({
  chapter,
  chapterIndex,
  isUnderworld,
  onOpenStageMap,
}) => {
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stages = chapter.stages;
  const safeRoomIdx = Math.max(0, Math.min(stages.length - 1, selectedRoomIdx));
  const room = stages[safeRoomIdx] ?? stages[0];
  const biomeMeta = useMemo(() => getAnyBiomeMeta(room?.biome ?? chapter.id), [room?.biome, chapter.id]);
  const orgPlan = useMemo(
    () => generateUniquePhaseOrganization(chapterIndex, Math.max(12, Math.min(20, stages.length))),
    [chapterIndex, stages.length]
  );

  // Reset to Room 1 whenever active chapter changes
  useEffect(() => {
    setSelectedRoomIdx(0);
  }, [chapter.id, chapterIndex]);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    let lastDraw = 0;
    const render = (now = 0) => {
      if (lastDraw !== 0 && now - lastDraw < 140) {
        raf = requestAnimationFrame(render);
        return;
      }
      lastDraw = now;
      t += 0.14;
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (c && ctx && room) {
        const W = c.width;
        const H = c.height;
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W, H);

        // --- LEFT HALF: UNIQUE PHASE TOPOLOGY MINIMAP (160px) ---
        const mapW = 152;
        ctx.fillStyle = '#090612';
        ctx.fillRect(0, 0, mapW, H);

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        for (const st of stages) {
          minX = Math.min(minX, st.gx);
          maxX = Math.max(maxX, st.gx);
          minY = Math.min(minY, st.gy);
          maxY = Math.max(maxY, st.gy);
        }
        const spanX = Math.max(1, maxX - minX);
        const spanY = Math.max(1, maxY - minY);
        const padX = 16;
        const padY = 20;
        const cellW = (mapW - padX * 2) / spanX;
        const cellH = (H - padY * 2) / Math.max(1, spanY);

        const posOf = (gx: number, gy: number) => ({
          x: Math.round(padX + (gx - minX) * (spanX === 0 ? 0 : cellW)),
          y: Math.round(padY + (gy - minY) * (spanY === 0 ? 0 : cellH)),
        });

        // Subtle blueprint grid lines
        ctx.strokeStyle = 'rgba(130, 110, 190, 0.14)';
        ctx.lineWidth = 1;
        for (let gx = 16; gx < mapW; gx += 20) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, H);
          ctx.stroke();
        }

        // Adjacency edges
        const coordMap = new Map<string, number>();
        stages.forEach((st, i) => coordMap.set(`${st.gx},${st.gy}`, i));
        ctx.strokeStyle = biomeMeta.accent + '88';
        ctx.lineWidth = 2;
        for (const st of stages) {
          const p0 = posOf(st.gx, st.gy);
          for (const [dx, dy] of [
            [1, 0],
            [0, 1],
          ]) {
            const nbIdx = coordMap.get(`${st.gx + dx},${st.gy + dy}`);
            if (nbIdx !== undefined) {
              const p1 = posOf(stages[nbIdx].gx, stages[nbIdx].gy);
              ctx.beginPath();
              ctx.moveTo(p0.x, p0.y);
              ctx.lineTo(p1.x, p1.y);
              ctx.stroke();
            }
          }
        }

        // Room nodes color-coded by role
        stages.forEach((st, i) => {
          const { x, y } = posOf(st.gx, st.gy);
          const role = orgPlan.nodes[i]?.role;
          const isGoal =
            role === 'goal' ||
            st.entities.some((e) => e.kind === 'chapter_goal' || e.kind === 'summit_heart');
          const isStart = i === 0 || role === 'start';
          const col = isGoal
            ? '#ff2e63'
            : isStart
              ? '#4df0c0'
              : role === 'secret'
                ? '#c084fc'
                : role === 'sanctuary'
                  ? '#52e5ff'
                  : role === 'gauntlet'
                    ? '#ff7733'
                    : '#d5cce6';

          const isSel = i === safeRoomIdx;
          if (isSel) {
            ctx.strokeStyle = '#ffe066';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - 6, y - 6, 12, 12);
          }
          ctx.fillStyle = '#07050d';
          ctx.fillRect(x - 4, y - 4, 8, 8);
          ctx.fillStyle = col;
          ctx.fillRect(x - 3, y - 3, 6, 6);
          if (isGoal) {
            ctx.fillStyle = '#ffe066';
            ctx.fillRect(x - 1, y - 1, 2, 2);
          }
        });

        // Divider
        ctx.fillStyle = '#2d234a';
        ctx.fillRect(mapW, 0, 2, H);

        // --- RIGHT HALF: LIVE MINIATURE ROOM RENDERER ---
        const rx0 = mapW + 2;
        const rW = W - rx0;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, biomeMeta.skyTop);
        grad.addColorStop(0.55, biomeMeta.skyMid);
        grad.addColorStop(1, biomeMeta.skyBottom);
        ctx.fillStyle = grad;
        ctx.fillRect(rx0, 0, rW, H);

        // Silhouette mountain ridge
        ctx.fillStyle = biomeMeta.mountainMid;
        ctx.beginPath();
        ctx.moveTo(rx0, H);
        for (let x = 0; x <= rW; x += 12) {
          const my = H - 22 - Math.sin(x * 0.06 + chapterIndex) * 14 - Math.cos(x * 0.14) * 6;
          ctx.lineTo(rx0 + x, my);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        // Ambient floating particles in room preview
        for (let i = 0; i < 8; i++) {
          const px = rx0 + ((i * 31 + Math.round(t * 14)) % rW);
          const py = ((i * 19 + Math.round(Math.sin(t + i) * 6)) % (H - 12)) + 6;
          ctx.fillStyle = biomeMeta.particleColor + 'aa';
          ctx.fillRect(px, py, 2, 2);
        }

        // Room tiles scaled cleanly into rW x H
        const scaleX = rW / room.cols;
        const scaleY = H / room.rows;
        for (let ty = 0; ty < room.rows; ty++) {
          for (let tx = 0; tx < room.cols; tx++) {
            const tile = room.tiles[ty * room.cols + tx];
            if (tile === TileType.EMPTY) continue;
            const dx = rx0 + tx * scaleX;
            const dy = ty * scaleY;
            const dw = Math.ceil(scaleX);
            const dh = Math.ceil(scaleY);

            if (tile === TileType.SPIKE_UP || tile === TileType.SPIKE_DOWN || tile === TileType.SPIKE_LEFT || tile === TileType.SPIKE_RIGHT) {
              ctx.fillStyle = '#ff3864';
              ctx.fillRect(dx, dy, dw, dh);
            } else if (tile === TileType.ONE_WAY) {
              ctx.fillStyle = biomeMeta.secondaryAccent;
              ctx.fillRect(dx, dy, dw, Math.max(1.5, dh * 0.45));
            } else if (tile === TileType.ICE) {
              ctx.fillStyle = '#7ce8ff';
              ctx.fillRect(dx, dy, dw, dh);
            } else if (tile === TileType.WATER) {
              ctx.fillStyle = '#2287b899';
              ctx.fillRect(dx, dy, dw, dh);
            } else {
              ctx.fillStyle = biomeMeta.tileMain;
              ctx.fillRect(dx, dy, dw, dh);
              const aboveEmpty = ty > 0 && room.tiles[(ty - 1) * room.cols + tx] === TileType.EMPTY;
              if (aboveEmpty) {
                ctx.fillStyle = biomeMeta.tileHighlight;
                ctx.fillRect(dx, dy, dw, Math.max(1.5, dh * 0.4));
              }
            }
          }
        }

        // Live Enemies, Relics, Campfires, Bosses in preview!
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx0, 0, rW, H);
        ctx.clip();
        for (const ent of room.entities) {
          const ex = rx0 + (ent.x / (room.cols * TILE_SIZE)) * rW;
          const ey = (ent.y / (room.rows * TILE_SIZE)) * H;

          if (ent.kind === 'relic' || ent.kind === 'winged_relic') {
            const sp = PROP_SPRITES.relic;
            const fi = Math.floor(t * 4) % sp.frames.length;
            drawPixelSprite(ctx, `prev_relic_${fi}`, sp.frames[fi], sp.palette, ex, ey + Math.sin(t * 4) * 2, false, 0.7, 0.7, true);
          } else if (ent.kind === 'chapter_goal' || ent.kind === 'summit_heart') {
            const sp = PROP_SPRITES.chapter_goal;
            const fi = Math.floor(t * 4) % sp.frames.length;
            drawPixelSprite(ctx, `prev_goal_${fi}`, sp.frames[fi], sp.palette, ex, ey, false, 0.85, 0.85, true);
          } else if (ent.kind === 'campfire') {
            const sp = PROP_SPRITES.campfire;
            const fi = Math.floor(t * 6) % sp.frames.length;
            drawPixelSprite(ctx, `prev_camp_${fi}`, sp.frames[fi], sp.palette, ex, ey + 2, false, 0.75, 0.75, true);
          } else if (ent.kind in ENEMY_SPRITES) {
            const sp = ENEMY_SPRITES[ent.kind];
            const fi = Math.floor(t * 5) % sp.frames.length;
            const isBoss = ent.kind.startsWith('boss_');
            const sc = isBoss ? 0.8 : 0.68;
            drawPixelSprite(ctx, `prev_e_${ent.kind}_${fi}`, sp.frames[fi], sp.palette, ex, ey + 2, false, sc, sc, true);
          }
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [room, stages, safeRoomIdx, biomeMeta, orgPlan, chapterIndex]);

  const enemyNames = useMemo(() => {
    const names = new Set<string>();
    for (const st of stages) {
      for (const e of st.entities) {
        if (e.kind.startsWith('enemy_') || e.kind.startsWith('boss_')) {
          names.add(e.kind.replace(/^enemy_|^boss_/, '').replace(/_/g, ' '));
        }
      }
    }
    return Array.from(names).slice(0, 3);
  }, [stages]);

  return (
    <div
      data-testid="title-stage-preview"
      style={{ borderColor: biomeMeta.accent }}
      className="pixel-panel relative flex flex-col gap-1.5 overflow-hidden bg-[#100c1be8] p-2.5"
    >
      <span
        aria-hidden="true"
        style={{ backgroundColor: biomeMeta.accent }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-80"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              style={{ backgroundColor: biomeMeta.accent, color: '#09080f' }}
              className="border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase"
            >
              {isUnderworld ? `SUBMUNDO ${chapterIndex + 1}` : `FASE ${chapterIndex + 1}`}
            </span>
            <span className="font-mono-num text-[10px] font-bold text-[#ffe066]">
              {stages.length} Salas Únicas
            </span>
          </div>
          <h3 className="truncate font-pixel text-xs font-bold text-[#f5efe6]">
            {chapter.name}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            data-testid="stage-preview-prev-room"
            onClick={() => setSelectedRoomIdx((i) => (i - 1 + stages.length) % stages.length)}
            className="border-2 border-[#07050d] bg-[#1b1430] px-1.5 py-0.5 font-pixel text-[11px] text-[#f5efe6] hover:bg-[#2a204a]"
            aria-label="Sala anterior do preview"
          >
            &lt;
          </button>
          <span className="min-w-[50px] text-center font-mono-num text-[10px] font-bold text-[#52e5ff]">
            {safeRoomIdx + 1}/{stages.length}
          </span>
          <button
            type="button"
            data-testid="stage-preview-next-room"
            onClick={() => setSelectedRoomIdx((i) => (i + 1) % stages.length)}
            className="border-2 border-[#07050d] bg-[#1b1430] px-1.5 py-0.5 font-pixel text-[11px] text-[#f5efe6] hover:bg-[#2a204a]"
            aria-label="Próxima sala do preview"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Interactive Dual Canvas: Left Topology Graph + Right Live Room Render */}
      <canvas
        ref={canvasRef}
        width={384}
        height={94}
        className="pixel-canvas w-full border-2 border-[#07050d] bg-[#080510]"
      />

      <div className="flex items-center justify-between gap-2 text-[10px]">
        <div className="min-w-0 flex-1">
          <div className="truncate font-pixel text-[10px] font-bold text-[#ffd27d]">
            {room?.name} · <span className="text-[#b8afc9]">{getArchetypeLabel(orgPlan.archetype)}</span>
          </div>
          {enemyNames.length > 0 && (
            <div className="truncate font-body-pixel text-[9px] text-[#c7bddb] capitalize">
              Ameaças: {enemyNames.join(' · ')}
            </div>
          )}
        </div>
        <PixelButton
          type="button"
          variant="cyan"
          onClick={onOpenStageMap}
          className="whitespace-nowrap shrink-0 !px-2 !py-1 text-[10px]"
        >
          <PixelIcon name="stages" className="h-3 w-3" />
          <span>Mapa de Fases</span>
        </PixelButton>
      </div>
    </div>
  );
};

interface HeroEvolutionAndPetShowcaseCardProps {
  hero: HeroDef;
  skinId: string;
  actualEvolutionTier: number;
  equippedPetId: SpiritId;
  petBondLv: number;
  playerLevel: number;
  levelProgress: number;
  currentXp: number;
  nextXp: number;
  heroPowerScore: number;
  auraName: string;
  auraColor: string;
  passLevel: number;
  passProgress: number;
  onOpenHeroes: () => void;
  onOpenForgeEvo: () => void;
  onOpenPets: () => void;
}

export const HeroEvolutionAndPetShowcaseCard: React.FC<HeroEvolutionAndPetShowcaseCardProps> = ({
  hero,
  skinId,
  actualEvolutionTier,
  equippedPetId,
  petBondLv,
  playerLevel,
  levelProgress,
  currentXp,
  nextXp,
  heroPowerScore,
  auraName,
  auraColor,
  passLevel,
  passProgress,
  onOpenHeroes,
  onOpenForgeEvo,
  onOpenPets,
}) => {
  const [previewEvoTier, setPreviewEvoTier] = useState<number>(Math.max(0, actualEvolutionTier));
  useEffect(() => {
    setPreviewEvoTier(Math.max(0, actualEvolutionTier));
  }, [hero.id, actualEvolutionTier]);

  const evoData = getHeroEvolutionData(hero.id, previewEvoTier);
  const activePet = DETAILED_PET_MAP[equippedPetId] ?? DETAILED_PETS[0];
  const isPreviewOnly = previewEvoTier > actualEvolutionTier;

  return (
    <div
      data-testid="title-hero-evo-showcase"
      style={{ borderColor: previewEvoTier >= 3 ? '#ffe066' : hero.accentColor }}
      className="pixel-panel relative flex flex-col gap-2 overflow-hidden bg-[#100c1be8] p-2.5"
    >
      <span
        aria-hidden="true"
        style={{ backgroundColor: previewEvoTier >= 3 ? '#ffe066' : hero.accentColor }}
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-80"
      />

      {/* Header: Hero Name + Level + Evolution Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <strong
              style={{ color: hero.accentColor }}
              className="font-pixel text-sm font-bold text-stroke-dark"
            >
              {hero.name}
            </strong>
            <span
              data-testid="title-player-level"
              className="border border-[#07050d] bg-[#16273b] px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-[#52e5ff]"
            >
              NV.{playerLevel}
            </span>
            <span className="border border-[#07050d] bg-[#1b132e] px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-[#ffd27d]">
              PODER {heroPowerScore}
            </span>
          </div>
          <div className="truncate font-body-pixel text-[10px] text-[#dcd3eb]">
            {EVOLUTION_TIER_NAMES[evoData.tier]}{' '}
            {isPreviewOnly && <span className="text-[#ffe066]">(Prévia Visual)</span>}
          </div>
        </div>

        {/* Interactive Evolution Tier Preview Pills (Base | I | II | III) */}
        <div className="flex items-center gap-1">
          {([0, 1, 2, 3] as const).map((tierNum) => {
            const active = previewEvoTier === tierNum;
            const unlocked = actualEvolutionTier >= tierNum;
            return (
              <button
                key={tierNum}
                type="button"
                data-testid={`title-evo-preview-${tierNum}`}
                onClick={() => setPreviewEvoTier(tierNum)}
                className={`border-2 px-1.5 py-0.5 font-mono-num text-[9px] font-bold transition-colors ${
                  active
                    ? 'border-[#ffe066] bg-[#362010] text-[#ffe066]'
                    : unlocked
                      ? 'border-[#07050d] bg-[#1a2e28] text-[#4df0c0] hover:bg-[#244038]'
                      : 'border-[#07050d] bg-[#140e24] text-[#9e94b8] hover:text-[#f5efe6]'
                }`}
              >
                {tierNum === 0 ? 'Base' : `${tierNum}x`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Visual Stage: Large Hero Evolution Animation + Animated Detailed Pet Companion */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-7 flex flex-col items-center justify-between border-2 border-[#29223d] bg-[#0a0714] p-1.5">
          <HeroFullSpriteCanvas
            heroId={hero.id}
            skinId={skinId}
            evolutionTier={previewEvoTier}
            size={84}
          />
          <div className="mt-1 flex w-full flex-wrap items-center justify-center gap-1 font-mono-num text-[9px] text-[#e5def2]">
            <span className="bg-[#18112b] px-1.5 py-0.5 text-[#ff8aa8]">ATQ +{evoData.attackBonus}</span>
            <span className="bg-[#18112b] px-1.5 py-0.5 text-[#52e5ff]">VEL {Math.round(evoData.speedMult * 100)}%</span>
            {evoData.extraAirJump > 0 && <span className="bg-[#18112b] px-1.5 py-0.5 text-[#4df0c0]">+Pulo</span>}
            {evoData.extraAirDash > 0 && <span className="bg-[#18112b] px-1.5 py-0.5 text-[#ffe066]">+Dash</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPets}
          className="col-span-5 flex flex-col items-center justify-between border-2 border-[#29223d] bg-[#0a0714] p-1.5 text-center transition-colors hover:border-[#4df0c0]"
        >
          <span className="font-pixel text-[9px] uppercase tracking-wider text-[#4df0c0]">
            Pet · Nv.{petBondLv}
          </span>
          <PetSpriteCanvas
            pet={activePet}
            size={62}
            bondLv={petBondLv}
            className="border border-[#221a38] bg-[#080510]"
          />
          <div className="w-full">
            <div style={{ color: activePet.color }} className="truncate font-pixel text-[10px] font-bold">
              {activePet.name}
            </div>
            <div className="truncate font-body-pixel text-[9px] text-[#b8afc9]">
              {activePet.skillName}
            </div>
          </div>
        </button>
      </div>

      {/* XP & Season Footer + Quick Jump Actions */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        <div className="border border-[#29223d] bg-[#0b0813] px-2 py-1">
          <div className="flex items-center justify-between font-mono-num text-[#b8afc9]">
            <span style={{ color: auraColor }} className="truncate font-pixel text-[9px]">{auraName}</span>
            <span>{currentXp}/{nextXp}</span>
          </div>
          <div className="mt-0.5 h-1.5 w-full overflow-hidden border border-[#07050d] bg-[#120d21]">
            <div style={{ width: `${Math.round(levelProgress * 100)}%` }} className="h-full bg-[#52e5ff]" />
          </div>
        </div>

        <div className="border border-[#29223d] bg-[#0b0813] px-2 py-1">
          <div className="flex items-center justify-between font-pixel text-[9px] text-[#b8afc9]">
            <span>Passe</span>
            <span className="font-mono-num text-[#ffd27d]">Nv.{passLevel}</span>
          </div>
          <div className="mt-0.5 h-1.5 w-full overflow-hidden border border-[#07050d] bg-[#120d21]">
            <div style={{ width: `${Math.round(passProgress * 100)}%` }} className="h-full bg-[#ffd27d]" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <PixelButton
          type="button"
          variant="emerald"
          onClick={onOpenHeroes}
          className="flex-1 whitespace-nowrap !px-2 !py-1 text-[10px]"
        >
          <PixelIcon name="hero" className="h-3.5 w-3.5" />
          <span>Trocar Herói</span>
        </PixelButton>
        <PixelButton
          type="button"
          variant="gold"
          onClick={onOpenForgeEvo}
          className="flex-1 whitespace-nowrap !px-2 !py-1 text-[10px]"
        >
          <PixelIcon name="crown" className="h-3.5 w-3.5" />
          <span>Evoluir / Forja [I]</span>
        </PixelButton>
      </div>
    </div>
  );
};
