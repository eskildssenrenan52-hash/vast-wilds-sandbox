// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React, { useMemo, useState } from 'react';
import {
  MECHANICS_CATALOG,
  MechanicCategory,
  TOTAL_MECHANICS,
} from '../../game/mechanicsCatalog';
import { PixelButton, PixelIcon, PixelWindow } from './PixelUi';

interface CompendiumModalProps {
  discoveredCodes: Set<string>;
  onClose: () => void;
}

const CATEGORIES: ('Todas' | MechanicCategory)[] = [
  'Todas',
  'Movimentação & Tech',
  'Terreno & Blocos',
  'Cristais & Forças',
  'Inimigos & Combate',
  'Mundo & Maestria',
];

export const CompendiumModal: React.FC<CompendiumModalProps> = ({
  discoveredCodes,
  onClose,
}) => {
  const [category, setCategory] = useState<'Todas' | MechanicCategory>('Todas');
  const [onlyDiscovered, setOnlyDiscovered] = useState(false);
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MECHANICS_CATALOG.filter((m) => {
      if (category !== 'Todas' && m.category !== category) return false;
      if (onlyDiscovered && !discoveredCodes.has(m.code)) return false;
      if (q) {
        const hay = `${m.name} ${m.description} ${m.tip} ${m.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [category, onlyDiscovered, discoveredCodes, search]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Compêndio de ${TOTAL_MECHANICS} Mecânicas`}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#05040a]/90 p-4 pointer-events-auto"
    >
      <PixelWindow
        title={`Compêndio de Mecânicas (${discoveredCodes.size}/${TOTAL_MECHANICS})`}
        subtitle="Cada técnica avançada, bloco especial, cristal, chefão e segredo desbloqueia ao vivenciá-lo nas fases."
        accentColor="#52e5ff"
        onClose={onClose}
        closeLabel="Fechar compêndio"
        maxWidthClass="max-w-5xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <PixelButton
                key={cat}
                type="button"
                variant={category === cat ? 'gold' : 'slate'}
                onClick={() => setCategory(cat)}
                className="px-2.5 py-1 text-xs"
              >
                {cat}
              </PixelButton>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar mecânica..."
              aria-label="Filtrar mecânicas"
              className="w-44 border-2 border-[#07050d] bg-[#100b1d] px-2.5 py-1 font-body-pixel text-xs text-[#f5efe6] placeholder-[#7c7399] outline-none focus:border-[#52e5ff]"
            />
            <PixelButton
              type="button"
              variant={onlyDiscovered ? 'emerald' : 'slate'}
              onClick={() => setOnlyDiscovered((v) => !v)}
              className="px-3 py-1 text-xs"
            >
              {onlyDiscovered ? 'Mostrando Descobertas' : `Mostrar Todas (${items.length})`}
            </PixelButton>
          </div>
        </div>

        <div className="pixel-scroll mt-3 grid max-h-[60vh] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => {
            const unlocked = discoveredCodes.has(m.code);
            return (
              <div
                key={m.id}
                style={{
                  borderColor: unlocked ? '#4df0c0' : '#07050d',
                }}
                className={`pixel-subpanel p-3 ${unlocked ? '' : 'opacity-85'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono-num text-[11px] text-[#a9a0bd]">
                    #{String(m.id).padStart(3, '0')} · {m.category}
                  </span>
                  {unlocked ? (
                    <PixelIcon name="check" className="h-4 w-4 text-[#4df0c0]" />
                  ) : (
                    <PixelIcon name="lock" className="h-3.5 w-3.5 text-[#6b5f87]" />
                  )}
                </div>
                <h3 className="mt-1 font-pixel text-base font-bold text-[#f5efe6]">
                  {m.name}
                </h3>
                <p className="mt-1 font-body-pixel text-xs leading-relaxed text-[#cfc6e0]">
                  {m.description}
                </p>
                <p className="mt-2 font-body-pixel text-[11px] text-[#e8a87c]">
                  Dica: {m.tip}
                </p>
              </div>
            );
          })}
        </div>
      </PixelWindow>
    </div>
  );
};

