// @ts-nocheck -- imported game code
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/engine';
import {
  DETAILED_PETS,
  DetailedPetDef,
  computePetLevelBonuses,
  drawDetailedPetShowcase,
  getPetNextLevelXp,
} from '../../game/pets';
import { HudSnapshot } from '../../game/types';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface PetsModalProps {
  engine: GameEngine;
  hud: HudSnapshot;
  onClose: () => void;
}

export const PetSpriteCanvas: React.FC<{
  pet: DetailedPetDef;
  size?: number;
  bondLv?: number;
  className?: string;
}> = ({ pet, size = 76, bondLv = 1, className = 'border-2 border-[#07050d] bg-[#0c0816]' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    let lastDraw = 0;
    const draw = (now = 0) => {
      if (lastDraw !== 0 && now - lastDraw < 140) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastDraw = now;
      t += 0.14;
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.clearRect(0, 0, 32, 32);

        drawDetailedPetShowcase(ctx, pet, t, 16, 16, {
          facing: 1,
          bondLv,
          drawBackdrop: true,
          scale: 1,
        });
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [pet, bondLv]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{ width: size, height: size }}
      className={`pixel-canvas block ${className}`}
    />
  );
};

export const PetsModal: React.FC<PetsModalProps> = ({ engine, hud, onClose }) => {
  const [selectedId, setSelectedId] = useState<DetailedPetDef['id']>(
    DETAILED_PETS.find((p) => p.id === hud.equippedSpirit)?.id ?? DETAILED_PETS[0].id
  );
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [, setTick] = useState(0);

  const selectedPet = DETAILED_PETS.find((p) => p.id === selectedId) ?? DETAILED_PETS[0];
  const isUnlocked = engine.unlockedSpirits.has(selectedPet.id);
  const isEquipped = hud.equippedSpirit === selectedPet.id;
  const lv = engine.petLevels[selectedPet.id] ?? 1;
  const bondXp = engine.petBondXp[selectedPet.id] ?? 0;
  const nextXp = getPetNextLevelXp(lv);
  const bonuses = computePetLevelBonuses(selectedPet.id, lv);
  const foodCount = hud.craftingMaterials.racao_estelar ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Santuário de Pets Exclusivos"
      data-testid="pets-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-3 sm:p-4 pointer-events-auto"
    >
      <PixelWindow
        title="Companheiros & Pets Exclusivos"
        subtitle={`Ração Estelar: ${foodCount} · Moedas Astrais: ${hud.astralCoins}★ · Vínculo evolui atributos e projéteis!`}
        accentColor="#4df0c0"
        onClose={onClose}
        closeLabel="Fechar Santuário de Pets"
        maxWidthClass="max-w-5xl"
      >
        {feedback && (
          <div
            className={`mb-2.5 border-2 border-[#07050d] px-3 py-1.5 font-pixel text-xs font-bold ${
              feedback.ok ? 'bg-[#123d32] text-[#8effdb]' : 'bg-[#4a1220] text-[#ff9bb2]'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        <div className="max-h-[70vh] overflow-y-auto pr-1 pixel-scroll">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* Active Selected Pet Showcase */}
            <div
              style={{ borderColor: selectedPet.color }}
              className="pixel-subpanel flex flex-col justify-between p-4 lg:col-span-5"
            >
              <div>
                <div className="flex items-start gap-3">
                  <PetSpriteCanvas pet={selectedPet} size={92} bondLv={lv} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        style={{ backgroundColor: selectedPet.color, color: '#09080f' }}
                        className="border border-[#07050d] px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase"
                      >
                        {selectedPet.rarity}
                      </span>
                      <span className="border border-[#07050d] bg-[#161029] px-1.5 py-0.5 font-mono-num text-[10px] text-[#ffe066]">
                        Nv.{lv}/10
                      </span>
                    </div>
                    <h3 style={{ color: selectedPet.color }} className="mt-1 font-pixel text-lg font-bold">
                      {selectedPet.name}
                    </h3>
                    <div className="font-body-pixel text-[11px] text-[#b8afc9]">{selectedPet.title}</div>
                  </div>
                </div>

                {/* Bond XP Progress */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between font-mono-num text-[10px] text-[#d5cce6]">
                    <span>Vínculo Estelar</span>
                    <span>{lv >= 10 ? 'MÁXIMO' : `${bondXp}/${nextXp} XP`}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden border border-[#07050d] bg-[#090612]">
                    <div
                      style={{
                        width: `${lv >= 10 ? 100 : Math.min(100, Math.round((bondXp / nextXp) * 100))}%`,
                        backgroundColor: selectedPet.color,
                      }}
                      className="h-full"
                    />
                  </div>
                </div>

                <p className="mt-3 font-body-pixel text-xs leading-relaxed text-[#e5def2]">
                  {selectedPet.perkDesc}
                </p>

                {/* Skill Box */}
                <div className="mt-3 border-2 border-[#261e3b] bg-[#0b0814] p-2.5">
                  <div className="font-pixel text-[11px] font-bold text-[#ffe066]">
                    Habilidade Ativa: {selectedPet.skillName}
                  </div>
                  <div className="mt-0.5 font-body-pixel text-[11px] text-[#c9c0db]">
                    {selectedPet.skillDesc}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono-num text-[11px] text-[#efe8fa]">
                  <div className="bg-[#0b0814] px-2 py-1">Imã: {bonuses.collectRange}px</div>
                  <div className="bg-[#0b0814] px-2 py-1">Disparo: {bonuses.shootInterval.toFixed(2)}s</div>
                  <div className="bg-[#0b0814] px-2 py-1">Bônus XP: +{Math.round((bonuses.xpBonus - 1) * 100)}%</div>
                  <div className="bg-[#0b0814] px-2 py-1">Ataque: +{bonuses.attackBonus}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!isUnlocked ? (
                  <PixelButton
                    type="button"
                    variant={hud.astralCoins >= selectedPet.cost ? 'gold' : 'slate'}
                    disabled={hud.astralCoins < selectedPet.cost}
                    onClick={() => {
                      const ok = engine.selectSpirit(selectedPet.id);
                      setFeedback(
                        ok
                          ? { ok: true, msg: `${selectedPet.name} desbloqueado e equipado!` }
                          : { ok: false, msg: 'Moedas Astrais insuficientes.' }
                      );
                      setTick((t) => t + 1);
                    }}
                    className="flex-1 py-2 text-xs"
                  >
                    <PixelIcon name="coin" className="h-3.5 w-3.5" />
                    <span>Desbloquear ({selectedPet.cost}★)</span>
                  </PixelButton>
                ) : (
                  <>
                    <PixelButton
                      type="button"
                      variant={isEquipped ? 'gold' : 'emerald'}
                      onClick={() => {
                        engine.selectSpirit(selectedPet.id);
                        setFeedback({ ok: true, msg: `${selectedPet.name} acompanhando você!` });
                        setTick((t) => t + 1);
                      }}
                      className="flex-1 py-2 text-xs"
                    >
                      <span>{isEquipped ? 'Equipado' : 'Equipar Pet'}</span>
                    </PixelButton>
                    <PixelButton
                      type="button"
                      variant={foodCount > 0 ? 'cyan' : 'slate'}
                      data-testid="feed-pet-btn"
                      onClick={() => {
                        const res = engine.feedPet(selectedPet.id);
                        setFeedback(res);
                        setTick((t) => t + 1);
                      }}
                      className="py-2 text-xs"
                    >
                      <span>Alimentar (+45 XP)</span>
                    </PixelButton>
                  </>
                )}
              </div>
            </div>

            {/* Pet Roster Cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:col-span-7">
              {DETAILED_PETS.map((pet) => {
                const unlocked = engine.unlockedSpirits.has(pet.id);
                const equipped = hud.equippedSpirit === pet.id;
                const selected = selectedId === pet.id;
                const pLv = engine.petLevels[pet.id] ?? 1;
                return (
                  <button
                    key={pet.id}
                    type="button"
                    data-testid={`pet-card-${pet.id}`}
                    onClick={() => {
                      setSelectedId(pet.id);
                      setFeedback(null);
                    }}
                    style={{ borderColor: selected ? pet.color : equipped ? '#4df0c0' : '#261e3b' }}
                    className={`pixel-subpanel flex items-center gap-3 p-2.5 text-left transition-transform hover:-translate-y-0.5 ${
                      selected ? 'bg-[#1b1332]' : 'bg-[#0e0a19]'
                    }`}
                  >
                    <PetSpriteCanvas pet={pet} size={60} bondLv={pLv} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span style={{ color: pet.color }} className="truncate font-pixel text-xs font-bold">
                          {pet.name}
                        </span>
                        {equipped ? (
                          <span className="border border-[#07050d] bg-[#1a5c49] px-1.5 py-0.5 font-pixel text-[9px] font-bold text-[#8effdb]">
                            ATIVO
                          </span>
                        ) : !unlocked ? (
                          <span className="font-mono-num text-[10px] text-[#ffe47a]">{pet.cost}★</span>
                        ) : (
                          <span className="font-mono-num text-[10px] text-[#52e5ff]">Nv.{pLv}</span>
                        )}
                      </div>
                      <div className="font-body-pixel text-[10px] text-[#b8afc9]">
                        {pet.rarity} · {pet.skillName}
                      </div>
                      <p className="mt-1 line-clamp-2 font-body-pixel text-[10px] text-[#dcd3eb]">
                        {pet.perkDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PixelWindow>
    </div>
  );
};
