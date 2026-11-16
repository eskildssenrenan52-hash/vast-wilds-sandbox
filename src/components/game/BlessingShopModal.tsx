// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React from 'react';
import { BlessingUpgrades } from '../../game/types';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface UpgradeDef {
  key: keyof BlessingUpgrades;
  name: string;
  desc: string;
  maxLv: number;
  costs: number[];
  color: string;
}

const UPGRADES: UpgradeDef[] = [
  {
    key: 'speedLv',
    name: 'Botas de Vento',
    desc: '+8% de velocidade máxima de corrida por nível.',
    maxLv: 3,
    costs: [5, 10, 18],
    color: '#52e5ff',
  },
  {
    key: 'staminaLv',
    name: 'Pulmão de Titânio',
    desc: '+15% de vigor máximo para escalar penhascos por nível.',
    maxLv: 3,
    costs: [5, 10, 18],
    color: '#4df0c0',
  },
  {
    key: 'skillCdLv',
    name: 'Fluxo Arcano',
    desc: '-20% no tempo de recarga da Habilidade Ativa [Q] por nível.',
    maxLv: 3,
    costs: [5, 10, 18],
    color: '#d580ff',
  },
  {
    key: 'magnetLv',
    name: 'Ímã Estelar',
    desc: 'Aumenta o raio de atração das Moedas Astrais em +24px por nível.',
    maxLv: 2,
    costs: [6, 14],
    color: '#ffe47a',
  },
];

interface BlessingShopModalProps {
  coins: number;
  blessings: BlessingUpgrades;
  onBuy: (key: keyof BlessingUpgrades) => void;
  onClose: () => void;
}

export const BlessingShopModal: React.FC<BlessingShopModalProps> = ({
  coins,
  blessings,
  onBuy,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Altar de Bênçãos"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-4 pointer-events-auto"
    >
      <PixelWindow
        title="Altar de Bênçãos"
        subtitle="Converta Moedas Astrais coletadas nas fases em melhorias permanentes para todos os heróis."
        accentColor="#ffe47a"
        onClose={onClose}
        maxWidthClass="max-w-3xl"
      >
        <div className="pixel-subpanel mb-4 flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <PixelIcon name="shrine" className="h-5 w-5" />
            <span className="font-pixel text-sm text-[#e5def2]">
              Suas Bênçãos são salvas automaticamente na campanha.
            </span>
          </div>
          <div className="flex items-center gap-2 border-2 border-[#07050d] bg-[#0e0a18] px-3 py-1">
            <PixelIcon name="coin" className="h-4 w-4" />
            <span className="font-mono-num text-base font-bold text-[#ffe47a]">
              {coins} Moedas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {UPGRADES.map((u) => {
            const lv = blessings[u.key];
            const maxed = lv >= u.maxLv;
            const nextCost = u.costs[lv] ?? 0;
            const canAfford = !maxed && coins >= nextCost;

            return (
              <div key={u.key} className="pixel-subpanel flex flex-col justify-between p-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      style={{ color: u.color }}
                      className="font-pixel text-base font-bold text-stroke-dark"
                    >
                      {u.name}
                    </h3>
                    <span className="font-mono-num text-xs text-[#ffd27d]">
                      Nv. {lv}/{u.maxLv}
                    </span>
                  </div>
                  <p className="mt-1.5 font-body-pixel text-xs leading-snug text-[#d7cee8]">
                    {u.desc}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1">
                    {Array.from({ length: u.maxLv }).map((_, i) => (
                      <span
                        key={i}
                        style={{ backgroundColor: i < lv ? u.color : '#1c152e' }}
                        className="h-2.5 flex-1 border border-[#07050d]"
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <PixelButton
                    type="button"
                    variant={maxed ? 'emerald' : canAfford ? 'gold' : 'slate'}
                    disabled={maxed || !canAfford}
                    onClick={() => onBuy(u.key)}
                    className={`w-full py-1.5 text-xs ${
                      !maxed && !canAfford ? 'opacity-65' : ''
                    }`}
                  >
                    <PixelIcon name={maxed ? 'check' : 'coin'} className="h-3.5 w-3.5" />
                    <span>
                      {maxed
                        ? 'Nível Máximo'
                        : `Forjar Nv. ${lv + 1} (${nextCost} Moedas)`}
                    </span>
                  </PixelButton>
                </div>
              </div>
            );
          })}
        </div>
      </PixelWindow>
    </div>
  );
};
