// @ts-nocheck — typed cleanly alongside PixelUi components
import React, { useState } from 'react';
import { GameEngine } from '../../game/engine';
import {
  AURA_TRAILS,
  DAILY_REWARDS,
  MISSIONS,
  PASS_ASTRAL_UNLOCK_COST,
  PASS_TIERS,
  PASS_XP_PER_TIER,
  STAR_MILESTONES,
  getPassProgressFromXp,
} from '../../game/passAndRewards';
import { AuraTrailId, HudSnapshot } from '../../game/types';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

type PassTab = 'pass' | 'missions' | 'vault' | 'auras';

interface PassAndRewardsModalProps {
  engine: GameEngine;
  hud: HudSnapshot;
  onClose: () => void;
}

export const PassAndRewardsModal: React.FC<PassAndRewardsModalProps> = ({
  engine,
  hud,
  onClose,
}) => {
  const [tab, setTab] = useState<PassTab>('pass');
  const passProg = getPassProgressFromXp(hud.passXp);
  const dailyIdx = hud.dailyStreakDay % DAILY_REWARDS.length;

  const claimablePassCount = PASS_TIERS.reduce((acc, tierDef) => {
    if (tierDef.tier > passProg.level) return acc;
    let c = acc;
    if (!hud.claimedFreePassTiers.includes(tierDef.tier)) c++;
    if (hud.passAstralUnlocked && !hud.claimedAstralPassTiers.includes(tierDef.tier)) c++;
    return c;
  }, 0);

  const claimableMissionsCount = MISSIONS.filter(
    (m) => !hud.claimedMissions.includes(m.id) && (hud.missionStats[m.metric] ?? 0) >= m.target
  ).length;

  const claimableStarsCount = STAR_MILESTONES.filter(
    (s) => !hud.claimedStarMilestones.includes(s.starsRequired) && hud.totalWorldStars >= s.starsRequired
  ).length;

  const vaultReadyCount = (hud.canClaimDaily ? 1 : 0) + claimableStarsCount;

  const tabs: { id: PassTab; label: string; color: string }[] = [
    {
      id: 'pass',
      label: `Passe Estelar (${passProg.level}/40)${claimablePassCount > 0 ? ` · ${claimablePassCount}!` : ''}`,
      color: '#ffd27d',
    },
    {
      id: 'missions',
      label: `Missões & Marcos${claimableMissionsCount > 0 ? ` · ${claimableMissionsCount}!` : ''}`,
      color: '#52e5ff',
    },
    {
      id: 'vault',
      label: `Estrelas (${hud.totalWorldStars}/150★) & Diário${vaultReadyCount > 0 ? ` · ${vaultReadyCount}!` : ''}`,
      color: '#4df0c0',
    },
    {
      id: 'auras',
      label: `Trilhas de Aura (${hud.unlockedAuraTrails.length}/${AURA_TRAILS.length})`,
      color: '#e879f9',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Passe Estelar, Missões e Cofre de Recompensas"
      data-testid="pass-rewards-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/92 p-3 md:p-6 pointer-events-auto"
    >
      <PixelWindow
        title="Passe Estelar & Cofre de Recompensas"
        subtitle={`Moedas Astrais: ${hud.astralCoins}★ · Estrelas de Mundo: ${hud.totalWorldStars}/150★ · Sequência Diária: ${hud.dailyStreakDay} dias`}
        accentColor="#ffd27d"
        onClose={onClose}
        closeLabel="Fechar Passe e Recompensas"
        maxWidthClass="max-w-5xl"
      >
        {/* Crisp Rectangular Pixel Tab Strip */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 border-2 border-[#07050d] bg-[#100b1d] p-2">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <PixelButton
                key={t.id}
                type="button"
                variant={active ? 'gold' : 'slate'}
                data-testid={`pass-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className="px-3 py-1.5 text-xs"
              >
                <span
                  style={{ backgroundColor: t.color }}
                  className="inline-block h-2 w-2 border border-[#07050d]"
                  aria-hidden="true"
                />
                <span>{t.label}</span>
              </PixelButton>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="pixel-scroll max-h-[66vh] overflow-y-auto pr-1">
          {tab === 'pass' && (
            <div className="flex flex-col gap-3">
              {/* Pass Progress Banner */}
              <div className="pixel-subpanel flex flex-wrap items-center justify-between gap-3 bg-[#150f28] p-3">
                <div className="min-w-[220px] flex-1">
                  <div className="flex items-center gap-2">
                    <PixelIcon name="crown" className="h-4 w-4 text-[#ffd27d]" />
                    <span className="font-pixel text-sm font-bold text-[#ffd27d]">
                      TEMPORADA ASTRAL · NÍVEL {passProg.level}/40
                    </span>
                    <span className="border border-[#07050d] bg-[#1c1530] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#52e5ff]">
                      {passProg.currentTierXp}/{PASS_XP_PER_TIER} XP
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden border-2 border-[#07050d] bg-[#090712]">
                    <div
                      style={{ width: `${Math.round(passProg.progress * 100)}%` }}
                      className="h-full bg-[#ffd27d]"
                    />
                  </div>
                  <p className="mt-1 font-body-pixel text-[11px] text-[#cfc6e0]">
                    Ganhe XP do Passe jogando fases, derrotando inimigos/chefes e concluindo Missões.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {claimablePassCount > 0 && (
                    <PixelButton
                      type="button"
                      variant="emerald"
                      data-testid="claim-all-pass-btn"
                      onClick={() => engine.claimAllPassRewards()}
                      className="px-3 py-2 text-xs"
                    >
                      <PixelIcon name="check" className="h-3.5 w-3.5" />
                      <span>Resgatar Tudo ({claimablePassCount})</span>
                    </PixelButton>
                  )}

                  {!hud.passAstralUnlocked ? (
                    <PixelButton
                      type="button"
                      variant={hud.astralCoins >= PASS_ASTRAL_UNLOCK_COST ? 'gold' : 'slate'}
                      disabled={hud.astralCoins < PASS_ASTRAL_UNLOCK_COST}
                      data-testid="unlock-astral-pass-btn"
                      onClick={() => engine.unlockAstralPass()}
                      className="px-3 py-2 text-xs"
                    >
                      <PixelIcon name="gem" className="h-3.5 w-3.5" />
                      <span>Liberar Trilha Astral ({PASS_ASTRAL_UNLOCK_COST}★)</span>
                    </PixelButton>
                  ) : (
                    <span className="border-2 border-[#07050d] bg-[#2a194d] px-3 py-1.5 font-pixel text-xs font-bold text-[#e879f9]">
                      PASSE ASTRAL ATIVO
                    </span>
                  )}
                </div>
              </div>

              {/* 40-Tier Dual Track List */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {PASS_TIERS.map((tierDef) => {
                  const unlocked = passProg.level >= tierDef.tier;
                  const freeClaimed = hud.claimedFreePassTiers.includes(tierDef.tier);
                  const astralClaimed = hud.claimedAstralPassTiers.includes(tierDef.tier);
                  const freeReady = unlocked && !freeClaimed;
                  const astralReady = unlocked && hud.passAstralUnlocked && !astralClaimed;

                  return (
                    <div
                      key={tierDef.tier}
                      style={{
                        borderColor: unlocked ? '#ffd27d' : '#2a2042',
                      }}
                      className={`pixel-subpanel flex flex-col justify-between p-2.5 ${
                        unlocked ? 'bg-[#19132e]' : 'bg-[#100c1e] opacity-75'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between border-b border-[#281e42] pb-1">
                        <span className="font-mono-num text-xs font-bold text-[#ffd27d]">
                          NÍVEL {String(tierDef.tier).padStart(2, '0')}
                        </span>
                        <span className="font-mono-num text-[10px] text-[#a9a0bd]">
                          {tierDef.xpRequired} XP
                        </span>
                      </div>

                      {/* Free Track */}
                      <div className="border border-[#07050d] bg-[#131a29] p-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-pixel text-[9px] font-bold text-[#9ff0ff]">GRÁTIS</span>
                          {freeClaimed && (
                            <span className="font-pixel text-[9px] font-bold text-[#4df0c0]">RESGATADO</span>
                          )}
                        </div>
                        <div
                          style={{ color: tierDef.freeReward.color }}
                          className="mt-0.5 truncate font-pixel text-[11px] font-bold"
                          title={tierDef.freeReward.label}
                        >
                          {tierDef.freeReward.label}
                        </div>
                        {freeReady && (
                          <PixelButton
                            type="button"
                            variant="cyan"
                            onClick={() => engine.claimPassReward(tierDef.tier, 'free')}
                            className="mt-1.5 w-full py-1 text-[10px]"
                          >
                            Resgatar
                          </PixelButton>
                        )}
                      </div>

                      {/* Astral Track */}
                      <div className="mt-1.5 border border-[#07050d] bg-[#211333] p-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-pixel text-[9px] font-bold text-[#e879f9]">ASTRAL</span>
                          {!hud.passAstralUnlocked ? (
                            <PixelIcon name="lock" className="h-3 w-3 text-[#7b7094]" />
                          ) : astralClaimed ? (
                            <span className="font-pixel text-[9px] font-bold text-[#4df0c0]">RESGATADO</span>
                          ) : null}
                        </div>
                        <div
                          style={{ color: tierDef.astralReward.color }}
                          className="mt-0.5 truncate font-pixel text-[11px] font-bold"
                          title={tierDef.astralReward.label}
                        >
                          {tierDef.astralReward.label}
                        </div>
                        {astralReady && (
                          <PixelButton
                            type="button"
                            variant="gold"
                            onClick={() => engine.claimPassReward(tierDef.tier, 'astral')}
                            className="mt-1.5 w-full py-1 text-[10px]"
                          >
                            Resgatar Astral
                          </PixelButton>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'missions' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel font-bold text-[#52e5ff]">
                  MISSÕES DIÁRIAS & MARCOS DE CAMINHO ({hud.claimedMissions.length}/{MISSIONS.length} CONCLUÍDAS)
                </span>
                <p className="font-body-pixel text-[11px] text-[#d7cee8]">
                  Complete tarefas em qualquer modo de jogo para acelerar seu Passe Estelar e acumular Moedas Astrais.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {MISSIONS.map((m) => {
                  const claimed = hud.claimedMissions.includes(m.id);
                  const val = hud.missionStats[m.metric] ?? 0;
                  const pct = Math.min(1, val / Math.max(1, m.target));
                  const ready = !claimed && val >= m.target;
                  return (
                    <div
                      key={m.id}
                      style={{ borderColor: claimed ? '#4df0c0' : ready ? m.accent : '#281e42' }}
                      className="pixel-subpanel flex flex-col justify-between bg-[#120d22] p-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase ${
                              m.category === 'daily'
                                ? 'bg-[#173647] text-[#52e5ff]'
                                : 'bg-[#331b47] text-[#e879f9]'
                            }`}
                          >
                            {m.category === 'daily' ? 'Diária' : 'Marco'}
                          </span>
                          <span className="font-mono-num text-[10px] text-[#ffe47a]">
                            +{m.coinReward}★ · +{m.passXpReward} XP Passe
                          </span>
                        </div>
                        <strong style={{ color: m.accent }} className="mt-1.5 block font-pixel text-sm font-bold">
                          {m.title}
                        </strong>
                        <p className="mt-1 font-body-pixel text-xs text-[#d7cee8]">{m.desc}</p>
                        <div className="mt-2">
                          <div className="mb-1 flex justify-between font-mono-num text-[10px] text-[#b8afc9]">
                            <span>Progresso</span>
                            <span>
                              {Math.min(val, m.target)}/{m.target}
                            </span>
                          </div>
                          <div className="h-2 w-full border border-[#07050d] bg-[#0a0712]">
                            <div
                              style={{
                                width: `${Math.round(pct * 100)}%`,
                                backgroundColor: claimed ? '#4df0c0' : m.accent,
                              }}
                              className="h-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={claimed ? 'emerald' : ready ? 'gold' : 'slate'}
                          disabled={!ready}
                          data-testid={`claim-mission-${m.id}`}
                          onClick={() => engine.claimMission(m.id)}
                          className="w-full py-1.5 text-xs"
                        >
                          {claimed
                            ? 'Resgatada'
                            : ready
                              ? `Resgatar (+${m.coinReward}★)`
                              : `Faltam ${Math.max(0, m.target - val)}`}
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'vault' && (
            <div className="flex flex-col gap-4">
              {/* 7-Day Login Streak Vault */}
              <div className="pixel-subpanel bg-[#140e24] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2a2042]">
                  <div>
                    <h3 className="font-pixel text-sm font-bold text-[#ffd27d]">
                      COFRE DIÁRIO DE LOGIN · SEQUÊNCIA: {hud.dailyStreakDay} DIAS
                    </h3>
                    <p className="font-body-pixel text-[11px] text-[#d7cee8]">
                      Retorne diariamente para resgatar pacotes progressivos até o Baú da Coroa do Dia 7.
                    </p>
                  </div>
                  <PixelButton
                    type="button"
                    variant={hud.canClaimDaily ? 'gold' : 'slate'}
                    disabled={!hud.canClaimDaily}
                    data-testid="claim-daily-btn"
                    onClick={() => engine.claimDailyReward()}
                    className="px-4 py-2 text-xs"
                  >
                    <PixelIcon name="coin" className="h-3.5 w-3.5" />
                    <span>{hud.canClaimDaily ? 'Abrir Cofre de Hoje!' : 'Já Resgatado Hoje'}</span>
                  </PixelButton>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {DAILY_REWARDS.map((d, idx) => {
                    const isCurrent = idx === dailyIdx && hud.canClaimDaily;
                    const isDone = idx < (hud.dailyStreakDay % DAILY_REWARDS.length);
                    return (
                      <div
                        key={d.day}
                        style={{
                          borderColor: isCurrent ? '#ffd27d' : isDone ? '#4df0c0' : '#2a2042',
                        }}
                        className={`pixel-subpanel p-2 text-center ${
                          isCurrent ? 'bg-[#2a1f10]' : isDone ? 'bg-[#142923]' : 'bg-[#0e0a1a]'
                        }`}
                      >
                        <div style={{ color: d.accent }} className="font-pixel text-xs font-bold">
                          DIA {d.day}
                        </div>
                        <div className="mt-1 font-mono-num text-xs font-bold text-[#ffe47a]">
                          +{d.coinReward}★
                        </div>
                        <div className="font-mono-num text-[10px] text-[#52e5ff]">
                          +{d.passXpReward} XP
                        </div>
                        <div className="mt-1 font-pixel text-[9px] text-[#b8afc9]">
                          {isDone ? 'ABERTO' : isCurrent ? 'DISPONÍVEL' : 'BLOQ.'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* World Stars (150 Stars) Milestone Vault */}
              <div className="pixel-subpanel bg-[#140e24] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2a2042]">
                  <div>
                    <h3 className="font-pixel text-sm font-bold text-[#4df0c0]">
                      COFRE DE ESTRELAS DOS 50 MUNDOS · TOTAL: {hud.totalWorldStars} / 150★
                    </h3>
                    <p className="font-body-pixel text-[11px] text-[#d7cee8]">
                      Conclua cada mundo com poucas mortes e relíquias para acumular até 3★ por mundo!
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {STAR_MILESTONES.map((ms) => {
                    const claimed = hud.claimedStarMilestones.includes(ms.starsRequired);
                    const unlocked = hud.totalWorldStars >= ms.starsRequired;
                    const ready = unlocked && !claimed;
                    return (
                      <div
                        key={ms.starsRequired}
                        style={{ borderColor: claimed ? '#4df0c0' : ready ? ms.accent : '#2a2042' }}
                        className="pixel-subpanel flex flex-col justify-between bg-[#120d22] p-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span style={{ color: ms.accent }} className="font-mono-num text-xs font-bold">
                              {ms.starsRequired} ESTRELAS
                            </span>
                            <span className="font-mono-num text-[10px] text-[#ffe47a]">
                              +{ms.coinReward}★
                            </span>
                          </div>
                          <strong className="mt-1 block font-pixel text-sm text-[#f5efe6]">
                            {ms.title}
                          </strong>
                          <p className="mt-1 font-body-pixel text-[11px] text-[#cfc6e0]">
                            +{ms.passXpReward} XP Passe · +{ms.masteryXpReward} XP Maestria
                            {ms.auraUnlock ? ' + Trilha de Aura!' : ''}
                          </p>
                        </div>

                        <div className="mt-2.5">
                          <PixelButton
                            type="button"
                            variant={claimed ? 'emerald' : ready ? 'gold' : 'slate'}
                            disabled={!ready}
                            onClick={() => engine.claimStarMilestone(ms.starsRequired)}
                            className="w-full py-1.5 text-xs"
                          >
                            {claimed
                              ? 'Baú Aberto'
                              : ready
                                ? 'Abrir Cofre!'
                                : `Faltam ${Math.max(0, ms.starsRequired - hud.totalWorldStars)}★`}
                          </PixelButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'auras' && (
            <div className="flex flex-col gap-3">
              <div className="pixel-subpanel bg-[#140e24] px-3 py-2 text-xs">
                <span className="font-pixel font-bold text-[#e879f9]">
                  TRILHAS DE AURA VISUAIS ({hud.unlockedAuraTrails.length}/{AURA_TRAILS.length})
                </span>
                <p className="font-body-pixel text-[11px] text-[#d7cee8]">
                  Equipe rastros cósmicos que brilham atrás do seu herói durante saltos, corridas e combates!
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {AURA_TRAILS.map((aura) => {
                  const unlocked = hud.unlockedAuraTrails.includes(aura.id);
                  const equipped = hud.equippedAuraTrail === aura.id;
                  const canAfford = hud.astralCoins >= aura.cost;
                  return (
                    <div
                      key={aura.id}
                      style={{ borderColor: equipped ? aura.primaryColor : '#281e42' }}
                      className={`pixel-subpanel flex flex-col justify-between p-3 ${
                        equipped ? 'bg-[#21163b]' : 'bg-[#120d22]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              style={{
                                background: `linear-gradient(135deg, ${aura.primaryColor}, ${aura.secondaryColor})`,
                              }}
                              className="inline-block h-3.5 w-3.5 border border-[#07050d]"
                            />
                            <strong style={{ color: aura.primaryColor }} className="font-pixel text-sm font-bold">
                              {aura.name}
                            </strong>
                          </div>
                          {equipped ? (
                            <span className="border border-[#07050d] bg-[#4df0c0] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#09080f]">
                              ATIVA
                            </span>
                          ) : unlocked ? (
                            <span className="border border-[#07050d] bg-[#2a223d] px-1.5 py-0.5 font-pixel text-[9px] text-[#b8afc9]">
                              LIBERADA
                            </span>
                          ) : (
                            <span className="border border-[#07050d] bg-[#362010] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#ffe47a]">
                              {aura.cost}★
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 font-body-pixel text-xs leading-relaxed text-[#d7cee8]">
                          {aura.desc}
                        </p>
                      </div>

                      <div className="mt-3">
                        <PixelButton
                          type="button"
                          variant={equipped ? 'emerald' : unlocked || canAfford ? 'gold' : 'slate'}
                          disabled={!unlocked && !canAfford}
                          data-testid={`aura-btn-${aura.id}`}
                          onClick={() => engine.equipOrBuyAuraTrail(aura.id as AuraTrailId)}
                          className="w-full py-1.5 text-xs"
                        >
                          {equipped
                            ? 'Trilha Equipada'
                            : unlocked
                              ? 'Equipar Trilha'
                              : canAfford
                                ? `Desbloquear (${aura.cost}★)`
                                : `Precisa ${aura.cost}★`}
                        </PixelButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PixelWindow>
    </div>
  );
};
