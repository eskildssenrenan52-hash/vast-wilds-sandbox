// @ts-nocheck
import React from 'react';
import { HudSnapshot, SideQuestKind } from '../../game/types';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface SideQuestsModalProps {
  hud: HudSnapshot;
  onClaimQuest: (questId: string) => void;
  onClose: () => void;
}

const QUEST_KIND_META: Record<
  SideQuestKind,
  { badge: string; color: string; icon: 'bolt' | 'star' | 'gem' | 'book' | 'crown' }
> = {
  light_beacons: { badge: 'FARÓIS ASTRAIS', color: '#52e5ff', icon: 'star' },
  hunt_elites: { badge: 'ELITE COROADA', color: '#ff5c8a', icon: 'crown' },
  lore_tablets: { badge: 'SABEDORIA', color: '#8effdb', icon: 'book' },
  secret_vaults: { badge: 'SEGREDOS', color: '#ffe066', icon: 'gem' },
  star_shards: { badge: 'FRAGMENTOS', color: '#ffd27d', icon: 'star' },
  style_mastery: { badge: 'ESTILO & ESQUIVA', color: '#c084fc', icon: 'bolt' },
};

export const SideQuestsModal: React.FC<SideQuestsModalProps> = ({
  hud,
  onClaimQuest,
  onClose,
}) => {
  const claimedCount = hud.sideQuests.filter((q) => q.claimed).length;
  const readyCount = hud.sideQuestsReadyCount ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Missões Secundárias e Exploração"
      data-testid="side-quests-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040b]/88 p-2 sm:p-4 pointer-events-auto"
    >
      <PixelWindow
        title={`Missões Secundárias · ${hud.isUnderworld ? `Círculo ${hud.chapterIndex + 1}` : `Fase ${hud.chapterIndex + 1}`}`}
        subtitle={`${hud.biomeName} · ${claimedCount}/${hud.sideQuests.length} resgatadas${readyCount > 0 ? ` · ${readyCount} pronta(s)!` : ''}`}
        accentColor="#ffe066"
        maxWidthClass="max-w-3xl"
        onClose={onClose}
        closeLabel="Fechar Missões Secundárias [O]"
      >
        <div className="space-y-3">
          {/* Current Stage 6-Sector Exploration Tracker */}
          <div className="pixel-subpanel flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-pixel text-xs font-bold uppercase tracking-wider text-[#8effdb]">
                  Exploração da Etapa Atual
                </span>
                <span className="border border-[#07050d] bg-[#132924] px-1.5 py-0.5 font-mono-num text-[11px] font-bold text-[#4df0c0]">
                  {hud.stageExplorationPct}% ({hud.stageZonesVisited}/{hud.stageZonesTotal} setores)
                </span>
              </div>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#d9d0eb]">
                Explore todas as alas e rotas elevadas da etapa expandida para ganhar{' '}
                <strong className="text-[#ffe066]">+8 ★ Moedas Astrais</strong>, XP e progresso do Passe!
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0" aria-label={`Setores explorados: ${hud.stageZonesVisited} de ${hud.stageZonesTotal}`}>
              {Array.from({ length: hud.stageZonesTotal }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-5 border-2 border-[#07050d] transition-colors ${
                    i < hud.stageZonesVisited
                      ? 'bg-[#4df0c0] shadow-[inset_0_2px_0_0_#ffffff]'
                      : 'bg-[#171226]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 4 Chapter Side Quests Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {hud.sideQuests.map((q) => {
              const meta = QUEST_KIND_META[q.kind] ?? QUEST_KIND_META.light_beacons;
              const pct = Math.min(100, Math.round((q.progress / Math.max(1, q.target)) * 100));
              return (
                <div
                  key={q.id}
                  data-testid={`side-quest-card-${q.id}`}
                  style={{
                    borderColor: q.claimed
                      ? '#2e5949'
                      : q.completed
                        ? '#ffe066'
                        : meta.color + '66',
                  }}
                  className="pixel-subpanel flex flex-col justify-between gap-2.5 p-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{ color: meta.color, borderColor: meta.color + '77' }}
                        className="inline-flex items-center gap-1 border bg-[#100b1c] px-1.5 py-0.5 font-pixel text-[10px] font-bold"
                      >
                        <PixelIcon name={meta.icon} className="h-3 w-3" />
                        <span>{meta.badge}</span>
                      </span>
                      <span
                        className={`font-mono-num text-[11px] font-bold ${
                          q.claimed
                            ? 'text-[#4df0c0]'
                            : q.completed
                              ? 'text-[#ffe066]'
                              : 'text-[#d7cee8]'
                        }`}
                      >
                        {q.progress}/{q.target}
                      </span>
                    </div>

                    <h3 className="mt-1.5 font-pixel text-sm font-bold text-[#f5efe6]">
                      {q.title}
                    </h3>
                    <p className="mt-0.5 font-sans text-xs leading-snug text-[#d9d0eb]">
                      {q.desc}
                    </p>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="relative h-2 w-full overflow-hidden border border-[#07050d] bg-[#0c0816]">
                      <div
                        style={{
                          width: `${pct}%`,
                          backgroundColor: q.claimed ? '#4df0c0' : meta.color,
                        }}
                        className="relative h-full transition-all"
                      >
                        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[1px] bg-white/45" />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 font-mono-num text-[10px]">
                        <span className="border border-[#07050d] bg-[#241b0c] px-1.5 py-0.5 text-[#ffe47a]">
                          +{q.coinReward} ★
                        </span>
                        <span className="border border-[#07050d] bg-[#102233] px-1.5 py-0.5 text-[#52e5ff]">
                          +{q.playerXpReward} XP
                        </span>
                        <span className="border border-[#07050d] bg-[#251338] px-1.5 py-0.5 text-[#e879f9]">
                          +{q.passXpReward} Passe
                        </span>
                      </div>

                      {q.claimed ? (
                        <span className="border border-[#07050d] bg-[#163d31] px-2 py-1 font-pixel text-[10px] font-bold text-[#8effdb]">
                          CONCLUÍDA ✓
                        </span>
                      ) : q.completed ? (
                        <PixelButton
                          type="button"
                          variant="gold"
                          data-testid={`claim-quest-${q.id}`}
                          onClick={() => onClaimQuest(q.id)}
                          className="px-2.5 py-1 text-[11px]"
                        >
                          Resgatar
                        </PixelButton>
                      ) : (
                        <span className="font-pixel text-[10px] text-[#9c92b0]">
                          Em progresso
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Field Exploration Legend */}
          <div className="pixel-subpanel grid grid-cols-1 gap-2.5 p-3 font-sans text-xs leading-relaxed text-[#d9d0eb] sm:grid-cols-2">
            <div>
              <strong className="font-pixel text-[#52e5ff]">Faróis Astrais [!]:</strong>{' '}
              Obeliscos brilhantes nas rotas superiores e alas laterais. Pressione{' '}
              <kbd className="border border-[#07050d] bg-[#0b0813] px-1 text-[#ffe066]">E</kbd> para acender.
            </div>
            <div>
              <strong className="font-pixel text-[#ff5c8a]">Guardiões Coroados:</strong>{' '}
              Inimigos Elite com coroa dourada e aura carmesim que guardam rotas ricas em tesouros.
            </div>
            <div>
              <strong className="font-pixel text-[#8effdb]">Estelas de Sabedoria:</strong>{' '}
              Monólitos com inscrições antigas que revelam segredos do bioma ao interagir com{' '}
              <kbd className="border border-[#07050d] bg-[#0b0813] px-1 text-[#ffe066]">E</kbd>.
            </div>
            <div>
              <strong className="font-pixel text-[#ffe066]">Câmaras Secretas:</strong>{' '}
              Paredes cintilantes quebráveis com Dash (
              <kbd className="border border-[#07050d] bg-[#0b0813] px-1 text-[#ffe066]">X</kbd>) escondem cofres nas extremidades das fases.
            </div>
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};
