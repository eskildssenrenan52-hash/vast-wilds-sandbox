// @ts-nocheck -- imported game code
import { AnyBiomeId } from './types';

export type MaterialId =
  | 'madeira_ancestral'
  | 'pedra_runica'
  | 'minerio_cobre'
  | 'minerio_ferro'
  | 'minerio_ouro'
  | 'minerio_mitril'
  | 'minerio_titanio'
  | 'minerio_adamantita'
  | 'minerio_eter'
  | 'cristal_biolum'
  | 'cristal_gelo'
  | 'esporo_luminoso'
  | 'brasa_viva'
  | 'areia_estelar'
  | 'essencia_sombria'
  | 'essencia_solar'
  | 'essencia_abissal'
  | 'erva_celeste'
  | 'osso_antigo'
  | 'engrenagem_arcana'
  | 'fio_celestial'
  | 'nucleo_guardiao'
  | 'fragmento_eclipse'
  | 'po_fada'
  | 'escama_dragao'
  | 'obsidiana_viva'
  | 'pedra_evolucao'
  | 'racao_estelar';

export interface MaterialDef {
  id: MaterialId;
  name: string;
  rarity: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  color: string;
  category: 'Minério' | 'Bioma' | 'Essência' | 'Especial';
  desc: string;
}

export const MATERIALS: MaterialDef[] = [
  { id: 'madeira_ancestral', name: 'Madeira Ancestral', rarity: 'Comum', color: '#c98b52', category: 'Bioma', desc: 'Madeira leve colhida em florestas e ilhas.' },
  { id: 'pedra_runica', name: 'Pedra Rúnica', rarity: 'Comum', color: '#94a3b8', category: 'Minério', desc: 'Rocha firme ideal para construções e forja básica.' },
  { id: 'minerio_cobre', name: 'Minério de Cobre', rarity: 'Comum', color: '#fb923c', category: 'Minério', desc: 'Metal maleável de cavernas rasas.' },
  { id: 'minerio_ferro', name: 'Minério de Ferro', rarity: 'Comum', color: '#cbd5e1', category: 'Minério', desc: 'Base para armaduras, ferramentas e bigornas.' },
  { id: 'minerio_ouro', name: 'Minério de Ouro', rarity: 'Incomum', color: '#facc15', category: 'Minério', desc: 'Metal nobre ótimo para anéis e amuletos.' },
  { id: 'minerio_mitril', name: 'Minério de Mitril', rarity: 'Raro', color: '#34d399', category: 'Minério', desc: 'Liga élfica leve e ultrarresistente.' },
  { id: 'minerio_titanio', name: 'Minério de Titânio', rarity: 'Raro', color: '#60a5fa', category: 'Minério', desc: 'Metal aeroespacial encontrado nas profundezas.' },
  { id: 'minerio_adamantita', name: 'Minério de Adamantita', rarity: 'Épico', color: '#f43f5e', category: 'Minério', desc: 'Minério rubro próximo ao núcleo vulcânico.' },
  { id: 'minerio_eter', name: 'Minério de Éter', rarity: 'Lendário', color: '#52e5ff', category: 'Minério', desc: 'Fragmento sólido de pura energia astral.' },
  { id: 'cristal_biolum', name: 'Cristal Biolum', rarity: 'Incomum', color: '#4df0c0', category: 'Bioma', desc: 'Gema pulsante das cavernas de micélio.' },
  { id: 'cristal_gelo', name: 'Cristal Glacial', rarity: 'Incomum', color: '#7ce8ff', category: 'Bioma', desc: 'Gelo eterno da cidadela safira.' },
  { id: 'esporo_luminoso', name: 'Esporo Luminoso', rarity: 'Comum', color: '#a3e635', category: 'Bioma', desc: 'Pó de cogumelo usado em poções e tochas.' },
  { id: 'brasa_viva', name: 'Brasa Viva', rarity: 'Incomum', color: '#ff7733', category: 'Essência', desc: 'Calor concentrado da Forja de Magma.' },
  { id: 'areia_estelar', name: 'Areia Estelar', rarity: 'Incomum', color: '#fde047', category: 'Bioma', desc: 'Grãos dourados de desertos e dunas.' },
  { id: 'essencia_sombria', name: 'Essência Sombria', rarity: 'Raro', color: '#c084fc', category: 'Essência', desc: 'Coletada em criptas e biomas corrompidos.' },
  { id: 'essencia_solar', name: 'Essência Solar', rarity: 'Raro', color: '#fbbf24', category: 'Essência', desc: 'Luz condensada de guardiões solares.' },
  { id: 'essencia_abissal', name: 'Essência Abissal', rarity: 'Épico', color: '#ff3864', category: 'Essência', desc: 'Energia densa do Submundo e abismos.' },
  { id: 'erva_celeste', name: 'Erva Celeste', rarity: 'Comum', color: '#86efac', category: 'Bioma', desc: 'Erva alquímica usada em poções e elixires.' },
  { id: 'osso_antigo', name: 'Osso Antigo', rarity: 'Incomum', color: '#e2e8f0', category: 'Bioma', desc: 'Relíquia óstea de masmorras e catacumbas.' },
  { id: 'engrenagem_arcana', name: 'Engrenagem Arcana', rarity: 'Raro', color: '#ffb84d', category: 'Especial', desc: 'Peça de precisão da Torre do Relógio.' },
  { id: 'fio_celestial', name: 'Fio Celestial', rarity: 'Incomum', color: '#f0abfc', category: 'Bioma', desc: 'Tecido leve para capas, botas e mantos.' },
  { id: 'nucleo_guardiao', name: 'Núcleo de Guardião', rarity: 'Lendário', color: '#ffe066', category: 'Especial', desc: 'CoraçãoDropado por chefões e guardiões.' },
  { id: 'fragmento_eclipse', name: 'Fragmento Eclipse', rarity: 'Épico', color: '#e879f9', category: 'Especial', desc: 'Lascas cósmicas de eventos e torres.' },
  { id: 'po_fada', name: 'Pó de Fada', rarity: 'Raro', color: '#f9a8d4', category: 'Especial', desc: 'Catalisador mágico para evoluções e runas.' },
  { id: 'escama_dragao', name: 'Escama Dracônica', rarity: 'Épico', color: '#fb7185', category: 'Especial', desc: 'Escama impenetrável para armaduras lendárias.' },
  { id: 'obsidiana_viva', name: 'Obsidiana Viva', rarity: 'Raro', color: '#6b21a8', category: 'Minério', desc: 'Vidro vulcânico forjado por magma e água.' },
  { id: 'pedra_evolucao', name: 'Pedra da Evolução', rarity: 'Lendário', color: '#ffd27d', category: 'Especial', desc: 'Catalisador supremo que desperta estágios de herói.' },
  { id: 'racao_estelar', name: 'Ração Estelar', rarity: 'Incomum', color: '#4df0c0', category: 'Especial', desc: 'Petisco nutritivo que eleva nível e vínculo dos Pets.' },
];

export const MATERIAL_MAP: Record<MaterialId, MaterialDef> = Object.fromEntries(
  MATERIALS.map((m) => [m.id, m])
) as Record<MaterialId, MaterialDef>;

export type CraftingStationId =
  | 'workbench'
  | 'runic_forge'
  | 'alchemy_cauldron'
  | 'celestial_loom'
  | 'cosmic_altar';

export interface CraftingStationDef {
  id: CraftingStationId;
  name: string;
  desc: string;
  color: string;
}

export const CRAFTING_STATIONS: CraftingStationDef[] = [
  { id: 'workbench', name: 'Bancada de Artífice', desc: 'Ferramentas, blocos de casa, mobília e equipamentos iniciais.', color: '#e8a87c' },
  { id: 'runic_forge', name: 'Forja Rúnica', desc: 'Armas, escudos, armaduras metálicas e aprimoramentos.', color: '#ff7733' },
  { id: 'celestial_loom', name: 'Tear Celestial', desc: 'Capas, luvas, botas velozes e vestes arcanas.', color: '#f0abfc' },
  { id: 'alchemy_cauldron', name: 'Caldeirão Alquímico', desc: 'Poções de combate, elixires de mineração e rações de Pet.', color: '#4df0c0' },
  { id: 'cosmic_altar', name: 'Altar Cósmico', desc: 'Pedras de Evolução de Herói, joias míticas e invocadores.', color: '#52e5ff' },
];

export type RecipeCategory = 'equipamento' | 'alquimia' | 'ferramenta' | 'construcao' | 'evolucao_pet';

export interface CraftRecipeDef {
  id: string;
  name: string;
  station: CraftingStationId;
  category: RecipeCategory;
  desc: string;
  color: string;
  ingredients: { id: MaterialId; qty: number }[];
  coinCost?: number;
  output:
    | { kind: 'equipment'; templateId: string }
    | { kind: 'buff'; buffId: AlchemyBuffId; durationSec: number }
    | { kind: 'tool_tier'; tier: number }
    | { kind: 'sandbox_item'; itemId: string; qty: number }
    | { kind: 'material'; materialId: MaterialId; qty: number };
}

export type AlchemyBuffId =
  | 'elixir_furia'
  | 'tonico_velocidade'
  | 'elixir_mineracao'
  | 'pocao_escudo'
  | 'nectar_eter';

export interface AlchemyBuffDef {
  id: AlchemyBuffId;
  name: string;
  color: string;
  desc: string;
  attackBonus: number;
  speedMult: number;
  miningSpeedMult: number;
  skillCdMult: number;
  overdriveMult: number;
}

export const ALCHEMY_BUFFS: Record<AlchemyBuffId, AlchemyBuffDef> = {
  elixir_furia: {
    id: 'elixir_furia',
    name: 'Elixir da Fúria',
    color: '#ff4d7d',
    desc: '+2 Ataque e +35% recarga de Éter por 120s.',
    attackBonus: 2,
    speedMult: 1,
    miningSpeedMult: 1,
    skillCdMult: 1,
    overdriveMult: 1.35,
  },
  tonico_velocidade: {
    id: 'tonico_velocidade',
    name: 'Tônico Céfiro',
    color: '#52e5ff',
    desc: '+22% Velocidade e -15% recarga de Habilidade por 120s.',
    attackBonus: 0,
    speedMult: 1.22,
    miningSpeedMult: 1,
    skillCdMult: 0.85,
    overdriveMult: 1,
  },
  elixir_mineracao: {
    id: 'elixir_mineracao',
    name: 'Elixir de Escavação',
    color: '#fbbf24',
    desc: '+85% velocidade de mineração e corte no Mundo Sandbox por 180s.',
    attackBonus: 0,
    speedMult: 1.08,
    miningSpeedMult: 1.85,
    skillCdMult: 1,
    overdriveMult: 1,
  },
  pocao_escudo: {
    id: 'pocao_escudo',
    name: 'Poção Baluarte',
    color: '#4df0c0',
    desc: 'Restaura Escudo imediato e reduz tempo de recarga em 20% por 120s.',
    attackBonus: 0,
    speedMult: 1,
    miningSpeedMult: 1,
    skillCdMult: 0.8,
    overdriveMult: 1,
  },
  nectar_eter: {
    id: 'nectar_eter',
    name: 'Néctar do Éter',
    color: '#ffd27d',
    desc: '+3 Ataque, +18% Velocidade e Éter Supremo 1.6x por 90s.',
    attackBonus: 3,
    speedMult: 1.18,
    miningSpeedMult: 1.4,
    skillCdMult: 0.78,
    overdriveMult: 1.6,
  },
};

export const CRAFT_RECIPES: CraftRecipeDef[] = [
  // --- EQUIPAMENTOS (10 SLOTS ACROSS TIERS) ---
  {
    id: 'craft_espada_cinzas',
    name: 'Lâmina das Cinzas',
    station: 'runic_forge',
    category: 'equipamento',
    desc: 'Arma T1 equilibrada (+2 Ataque, +6% Crítico).',
    color: '#e8a87c',
    ingredients: [
      { id: 'minerio_ferro', qty: 4 },
      { id: 'pedra_runica', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_espada_cinzas' },
  },
  {
    id: 'craft_escudo_basalto',
    name: 'Égide de Basalto',
    station: 'runic_forge',
    category: 'equipamento',
    desc: 'Mão Secundária T1 (+1 Defesa, +10% Vigor).',
    color: '#94a3b8',
    ingredients: [
      { id: 'minerio_ferro', qty: 4 },
      { id: 'minerio_cobre', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_escudo_basalto' },
  },
  {
    id: 'craft_elmo_ferro',
    name: 'Elmo do Explorador',
    station: 'runic_forge',
    category: 'equipamento',
    desc: 'Capacete T1 (+10% Vigor, +1 Poder Mineração).',
    color: '#cbd5e1',
    ingredients: [{ id: 'minerio_ferro', qty: 5 }],
    output: { kind: 'equipment', templateId: 'eq_elmo_ferro' },
  },
  {
    id: 'craft_peitoral_ferro',
    name: 'Cota de Forja',
    station: 'runic_forge',
    category: 'equipamento',
    desc: 'Armadura T1 (+2 Defesa, +12% Vigor).',
    color: '#cbd5e1',
    ingredients: [
      { id: 'minerio_ferro', qty: 6 },
      { id: 'brasa_viva', qty: 2 },
    ],
    output: { kind: 'equipment', templateId: 'eq_peitoral_ferro' },
  },
  {
    id: 'craft_luvas_micelio',
    name: 'Manoplas Biolum',
    station: 'celestial_loom',
    category: 'equipamento',
    desc: 'Luvas T2 (+1 Ataque, +8% Crítico, -8% Recarga Dash).',
    color: '#4df0c0',
    ingredients: [
      { id: 'cristal_biolum', qty: 4 },
      { id: 'fio_celestial', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_luvas_micelio' },
  },
  {
    id: 'craft_botas_vendaval',
    name: 'Botas do Vendaval',
    station: 'celestial_loom',
    category: 'equipamento',
    desc: 'Botas T2 (+14% Velocidade, +8% Salto).',
    color: '#52e5ff',
    ingredients: [
      { id: 'fio_celestial', qty: 4 },
      { id: 'cristal_gelo', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_botas_vendaval' },
  },
  {
    id: 'craft_capa_aurora',
    name: 'Manto da Aurora',
    station: 'celestial_loom',
    category: 'equipamento',
    desc: 'Capa T3 (+1 Pulo Aéreo Extra, -10% Recarga [Q]).',
    color: '#a5b4fc',
    ingredients: [
      { id: 'fio_celestial', qty: 5 },
      { id: 'cristal_gelo', qty: 4 },
      { id: 'po_fada', qty: 2 },
    ],
    output: { kind: 'equipment', templateId: 'eq_capa_aurora' },
  },
  {
    id: 'craft_anel_solar',
    name: 'Anel do Sol Dourado',
    station: 'cosmic_altar',
    category: 'equipamento',
    desc: 'Anel T2 (+1 Ataque, +15% Sorte de Drop).',
    color: '#fbbf24',
    ingredients: [
      { id: 'minerio_ouro', qty: 4 },
      { id: 'areia_estelar', qty: 4 },
    ],
    output: { kind: 'equipment', templateId: 'eq_anel_solar' },
  },
  {
    id: 'craft_anel_sombrio',
    name: 'Anel do Eclipse',
    station: 'cosmic_altar',
    category: 'equipamento',
    desc: 'Anel T3 (+10% Crítico, +4% Roubo de Alma).',
    color: '#c084fc',
    ingredients: [
      { id: 'essencia_sombria', qty: 4 },
      { id: 'minerio_mitril', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_anel_sombrio' },
  },
  {
    id: 'craft_amuleto_eter',
    name: 'Amuleto Coração de Éter',
    station: 'cosmic_altar',
    category: 'equipamento',
    desc: 'Amuleto T4 (+2 Ataque, -14% Recarga [Q], +1 Dash Aéreo!).',
    color: '#52e5ff',
    ingredients: [
      { id: 'minerio_eter', qty: 3 },
      { id: 'nucleo_guardiao', qty: 1 },
      { id: 'po_fada', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_amuleto_eter' },
  },
  {
    id: 'craft_lamina_draconica',
    name: 'Espada Dracônica',
    station: 'runic_forge',
    category: 'equipamento',
    desc: 'Arma Épica T4 (+4 Ataque, +15% Crítico, Set Fogo/Dragão).',
    color: '#ff3864',
    ingredients: [
      { id: 'minerio_adamantita', qty: 5 },
      { id: 'escama_dragao', qty: 3 },
      { id: 'brasa_viva', qty: 5 },
    ],
    output: { kind: 'equipment', templateId: 'eq_lamina_draconica' },
  },
  {
    id: 'craft_armadura_eter',
    name: 'Armadura Soberana do Éter',
    station: 'cosmic_altar',
    category: 'equipamento',
    desc: 'Armadura Mítica T5 (+4 Defesa, +30% Vigor, +15% Vel).',
    color: '#ffd27d',
    ingredients: [
      { id: 'minerio_eter', qty: 6 },
      { id: 'minerio_titanio', qty: 6 },
      { id: 'nucleo_guardiao', qty: 2 },
    ],
    output: { kind: 'equipment', templateId: 'eq_armadura_eter' },
  },

  {
    id: 'craft_elmo_aurora',
    name: 'Diadema da Aurora',
    station: 'cosmic_altar',
    category: 'equipamento',
    desc: 'Capacete Épico T3 (+2 Defesa, -10% Recarga [Q], +15% Vigor).',
    color: '#7ce8ff',
    ingredients: [
      { id: 'cristal_gelo', qty: 5 },
      { id: 'minerio_mitril', qty: 4 },
      { id: 'po_fada', qty: 2 },
    ],
    output: { kind: 'equipment', templateId: 'eq_elmo_aurora' },
  },
  {
    id: 'craft_escudo_eter',
    name: 'Orbe Guardião do Éter',
    station: 'cosmic_altar',
    category: 'equipamento',
    desc: 'Mão Secundária Lendária T4 (+3 Defesa, +1 Ataque, -8% Recarga).',
    color: '#ffd27d',
    ingredients: [
      { id: 'minerio_eter', qty: 3 },
      { id: 'fragmento_eclipse', qty: 2 },
    ],
    output: { kind: 'equipment', templateId: 'eq_escudo_eter' },
  },
  {
    id: 'craft_luvas_draconicas',
    name: 'Garras Dracônicas',
    station: 'runic_forge',
    category: 'equipamento',
    desc: 'Luvas Lendárias T4 (+2 Ataque, +12% Crítico, +2 Mineração).',
    color: '#ff3864',
    ingredients: [
      { id: 'escama_dragao', qty: 4 },
      { id: 'minerio_adamantita', qty: 4 },
    ],
    output: { kind: 'equipment', templateId: 'eq_luvas_draconicas' },
  },
  {
    id: 'craft_botas_eter',
    name: 'Grevas Celestiais',
    station: 'celestial_loom',
    category: 'equipamento',
    desc: 'Botas Lendárias T4 (+20% Velocidade, +12% Salto).',
    color: '#52e5ff',
    ingredients: [
      { id: 'fio_celestial', qty: 6 },
      { id: 'minerio_eter', qty: 3 },
      { id: 'essencia_solar', qty: 3 },
    ],
    output: { kind: 'equipment', templateId: 'eq_botas_eter' },
  },

  // --- ALQUIMIA & POÇÕES ---
  {
    id: 'craft_elixir_furia',
    name: 'Elixir da Fúria',
    station: 'alchemy_cauldron',
    category: 'alquimia',
    desc: '+2 Ataque e Éter 1.35x por 120s.',
    color: '#ff4d7d',
    ingredients: [
      { id: 'erva_celeste', qty: 2 },
      { id: 'brasa_viva', qty: 2 },
    ],
    output: { kind: 'buff', buffId: 'elixir_furia', durationSec: 120 },
  },
  {
    id: 'craft_tonico_velocidade',
    name: 'Tônico Céfiro',
    station: 'alchemy_cauldron',
    category: 'alquimia',
    desc: '+22% Velocidade e -15% CD de [Q] por 120s.',
    color: '#52e5ff',
    ingredients: [
      { id: 'erva_celeste', qty: 2 },
      { id: 'cristal_gelo', qty: 2 },
    ],
    output: { kind: 'buff', buffId: 'tonico_velocidade', durationSec: 120 },
  },
  {
    id: 'craft_elixir_mineracao',
    name: 'Elixir de Escavação',
    station: 'alchemy_cauldron',
    category: 'alquimia',
    desc: '+85% velocidade de mineração no Mundo Sandbox por 180s.',
    color: '#fbbf24',
    ingredients: [
      { id: 'esporo_luminoso', qty: 3 },
      { id: 'minerio_cobre', qty: 2 },
    ],
    output: { kind: 'buff', buffId: 'elixir_mineracao', durationSec: 180 },
  },
  {
    id: 'craft_pocao_escudo',
    name: 'Poção Baluarte',
    station: 'alchemy_cauldron',
    category: 'alquimia',
    desc: 'Restaura Escudo imediato e -20% CD por 120s.',
    color: '#4df0c0',
    ingredients: [
      { id: 'cristal_biolum', qty: 2 },
      { id: 'erva_celeste', qty: 3 },
    ],
    output: { kind: 'buff', buffId: 'pocao_escudo', durationSec: 120 },
  },
  {
    id: 'craft_nectar_eter',
    name: 'Néctar do Éter Supremo',
    station: 'alchemy_cauldron',
    category: 'alquimia',
    desc: '+3 Ataque, +18% Velocidade e Éter 1.6x por 90s.',
    color: '#ffd27d',
    ingredients: [
      { id: 'minerio_eter', qty: 1 },
      { id: 'po_fada', qty: 2 },
      { id: 'erva_celeste', qty: 4 },
    ],
    output: { kind: 'buff', buffId: 'nectar_eter', durationSec: 90 },
  },

  // --- FERRAMENTAS DE MINERAÇÃO & COLETA (TIERS 2..6) ---
  {
    id: 'craft_picareta_ferro',
    name: 'Picareta de Ferro (Tier 2)',
    station: 'workbench',
    category: 'ferramenta',
    desc: 'Minera Ouro, Tijolos da Masmorra e dobra velocidade em pedra.',
    color: '#cbd5e1',
    ingredients: [
      { id: 'madeira_ancestral', qty: 4 },
      { id: 'minerio_ferro', qty: 5 },
    ],
    output: { kind: 'tool_tier', tier: 2 },
  },
  {
    id: 'craft_picareta_mitril',
    name: 'Picareta de Mitril (Tier 3)',
    station: 'runic_forge',
    category: 'ferramenta',
    desc: 'Quebra Obsidiana, Pedra Infernal e minera Titânio/Mitril.',
    color: '#34d399',
    ingredients: [
      { id: 'minerio_mitril', qty: 5 },
      { id: 'minerio_ouro', qty: 4 },
    ],
    output: { kind: 'tool_tier', tier: 3 },
  },
  {
    id: 'craft_picareta_titanio',
    name: 'Picareta Titânica (Tier 4)',
    station: 'runic_forge',
    category: 'ferramenta',
    desc: 'Minera Adamantita, Cristal de Éter e blocos endurecidos.',
    color: '#60a5fa',
    ingredients: [
      { id: 'minerio_titanio', qty: 6 },
      { id: 'obsidiana_viva', qty: 4 },
    ],
    output: { kind: 'tool_tier', tier: 4 },
  },
  {
    id: 'craft_picareta_eter',
    name: 'Broca Astral de Éter (Tier 5)',
    station: 'cosmic_altar',
    category: 'ferramenta',
    desc: 'Broca veloz que pulveriza blocos abissais e veios raros!',
    color: '#52e5ff',
    ingredients: [
      { id: 'minerio_eter', qty: 4 },
      { id: 'minerio_adamantita', qty: 5 },
      { id: 'engrenagem_arcana', qty: 3 },
    ],
    output: { kind: 'tool_tier', tier: 5 },
  },
  {
    id: 'craft_broca_cosmica',
    name: 'Broca Cósmica do Abismo (Tier 6)',
    station: 'cosmic_altar',
    category: 'ferramenta',
    desc: 'Ferramenta Suprema — minera qualquer bloco em 1 golpe + bônus de minério!',
    color: '#ffe066',
    ingredients: [
      { id: 'minerio_eter', qty: 8 },
      { id: 'nucleo_guardiao', qty: 2 },
      { id: 'essencia_abissal', qty: 4 },
    ],
    output: { kind: 'tool_tier', tier: 6 },
  },

  // --- BLOCOS, MOBÍLIA & ENGENHOCAS SANDBOX ---
  {
    id: 'craft_pacote_madeira',
    name: 'Tábuas & Paredes de Madeira (x25)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Gera 25 tábuas para construir casas, pisos e telhados.',
    color: '#c98b52',
    ingredients: [{ id: 'madeira_ancestral', qty: 3 }],
    output: { kind: 'sandbox_item', itemId: 'block_plank', qty: 25 },
  },
  {
    id: 'craft_pacote_sakura',
    name: 'Tábuas Sakura Ornamentais (x25)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Blocos róseos de madeira Sakura para templos e vilas orientais.',
    color: '#f472b6',
    ingredients: [
      { id: 'madeira_ancestral', qty: 3 },
      { id: 'fio_celestial', qty: 1 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_sakura_plank', qty: 25 },
  },
  {
    id: 'craft_pacote_tijolo',
    name: 'Tijolos de Pedra (x25)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Tijolos rúnicos firmes para fortalezas e torres.',
    color: '#94a3b8',
    ingredients: [{ id: 'pedra_runica', qty: 4 }],
    output: { kind: 'sandbox_item', itemId: 'block_brick', qty: 25 },
  },
  {
    id: 'craft_pacote_neon',
    name: 'Tijolos Cibernéticos Neon (x25)',
    station: 'runic_forge',
    category: 'construcao',
    desc: 'Blocos luminosos de alta tecnologia da Subcidade e Relógio.',
    color: '#22d3ee',
    ingredients: [
      { id: 'pedra_runica', qty: 4 },
      { id: 'engrenagem_arcana', qty: 1 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_neon_brick', qty: 25 },
  },
  {
    id: 'craft_plataformas',
    name: 'Plataformas de Madeira (x20)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Plataformas atravessáveis por baixo para andares e pontes.',
    color: '#e8a87c',
    ingredients: [{ id: 'madeira_ancestral', qty: 2 }],
    output: { kind: 'sandbox_item', itemId: 'block_platform', qty: 20 },
  },
  {
    id: 'craft_tochas',
    name: 'Tochas Luminosas (x15)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Ilumina cavernas e valida iluminação para NPCs em casas!',
    color: '#fde047',
    ingredients: [
      { id: 'madeira_ancestral', qty: 2 },
      { id: 'esporo_luminoso', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'furn_torch', qty: 15 },
  },
  {
    id: 'craft_lanternas',
    name: 'Lanternas Ornamentais (x12)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Lanternas fortes que iluminam grandes salões e contam para casas.',
    color: '#ffb84d',
    ingredients: [
      { id: 'minerio_cobre', qty: 3 },
      { id: 'esporo_luminoso', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'furn_lantern', qty: 12 },
  },
  {
    id: 'craft_bloco_sonho',
    name: 'Blocos Oníricos / Dream Block (x12)',
    station: 'cosmic_altar',
    category: 'construcao',
    desc: 'Blocos atravessáveis com Dash para atalhos secretos estilo campanha!',
    color: '#c084fc',
    ingredients: [
      { id: 'essencia_sombria', qty: 2 },
      { id: 'cristal_biolum', qty: 3 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_dream', qty: 12 },
  },
  {
    id: 'craft_nuvem_salto',
    name: 'Nuvens Elásticas Celestes (x8)',
    station: 'celestial_loom',
    category: 'construcao',
    desc: 'Nuvens macias que arremessam você para o céu sem custo de dash.',
    color: '#a8f5ff',
    ingredients: [
      { id: 'fio_celestial', qty: 3 },
      { id: 'cristal_gelo', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_cloud_bounce', qty: 8 },
  },
  {
    id: 'craft_esteira_dir',
    name: 'Esteiras Mecânicas Direita (x10)',
    station: 'runic_forge',
    category: 'construcao',
    desc: 'Esteira automática da Torre do Relógio para acelerar travessias.',
    color: '#fb923c',
    ingredients: [
      { id: 'minerio_ferro', qty: 3 },
      { id: 'engrenagem_arcana', qty: 1 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_conveyor_r', qty: 10 },
  },
  {
    id: 'craft_mola_impulso',
    name: 'Molas de Impulso (x6)',
    station: 'runic_forge',
    category: 'construcao',
    desc: 'Molas mecânicas que lançam o herói verticalmente e recarregam dash.',
    color: '#ff5c8a',
    ingredients: [
      { id: 'minerio_ferro', qty: 3 },
      { id: 'engrenagem_arcana', qty: 1 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_spring', qty: 6 },
  },
  {
    id: 'craft_cristal_dash',
    name: 'Cristais de Dash Portáteis (x4)',
    station: 'cosmic_altar',
    category: 'construcao',
    desc: 'Coloque cristais no mundo para criar rotas aéreas acrobáticas!',
    color: '#4df099',
    ingredients: [
      { id: 'cristal_biolum', qty: 4 },
      { id: 'po_fada', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'block_dash_crystal', qty: 4 },
  },
  {
    id: 'craft_cama_spawn',
    name: 'Cama Astral (Ponto de Spawn)',
    station: 'celestial_loom',
    category: 'construcao',
    desc: 'Define o ponto de retorno e conta como mobília de casa!',
    color: '#ff5c8a',
    ingredients: [
      { id: 'madeira_ancestral', qty: 5 },
      { id: 'fio_celestial', qty: 3 },
    ],
    output: { kind: 'sandbox_item', itemId: 'furn_bed', qty: 1 },
  },
  {
    id: 'craft_tear_estacao',
    name: 'Tear Celestial & Bigorna',
    station: 'workbench',
    category: 'construcao',
    desc: 'Gera 1 Tear Celestial + 1 Bigorna Rúnica para sua base.',
    color: '#f0abfc',
    ingredients: [
      { id: 'madeira_ancestral', qty: 4 },
      { id: 'minerio_ferro', qty: 4 },
    ],
    output: { kind: 'sandbox_item', itemId: 'station_loom_anvil', qty: 1 },
  },
  {
    id: 'craft_kit_casa',
    name: 'Kit Mobília de Casa (Porta + Mesa + Cadeira)',
    station: 'workbench',
    category: 'construcao',
    desc: 'Conjunto completo para validar uma Casa de NPC imediatamente!',
    color: '#4df0c0',
    ingredients: [
      { id: 'madeira_ancestral', qty: 6 },
      { id: 'minerio_cobre', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'kit_house', qty: 1 },
  },

  // --- INVOCADORES DE CHEFES DO SANDBOX (4 CHEFES EXCLUSIVOS) ---
  {
    id: 'craft_invocador_boss',
    name: 'Olho Invocador do Núcleo',
    station: 'cosmic_altar',
    category: 'construcao',
    desc: 'Invoca o Guardião do Núcleo Sandbox (Drop: Núcleo + Éter).',
    color: '#ff3864',
    ingredients: [
      { id: 'osso_antigo', qty: 4 },
      { id: 'essencia_sombria', qty: 3 },
      { id: 'brasa_viva', qty: 3 },
    ],
    output: { kind: 'sandbox_item', itemId: 'boss_summon', qty: 1 },
  },
  {
    id: 'craft_invocador_leviata',
    name: 'Concha do Leviatã Abissal',
    station: 'cosmic_altar',
    category: 'construcao',
    desc: 'Invoca o Leviatã Abissal das Águas & Corais no Sandbox.',
    color: '#38bdf8',
    ingredients: [
      { id: 'cristal_gelo', qty: 4 },
      { id: 'cristal_biolum', qty: 4 },
      { id: 'essencia_abissal', qty: 1 },
    ],
    output: { kind: 'sandbox_item', itemId: 'boss_summon_leviathan', qty: 1 },
  },
  {
    id: 'craft_invocador_cronos',
    name: 'Selo do Arcanjo do Relógio',
    station: 'cosmic_altar',
    category: 'construcao',
    desc: 'Invoca o Arcanjo Cronos na Torre do Relógio ou superfície.',
    color: '#fbbf24',
    ingredients: [
      { id: 'engrenagem_arcana', qty: 4 },
      { id: 'minerio_mitril', qty: 4 },
      { id: 'essencia_solar', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'boss_summon_chronos', qty: 1 },
  },
  {
    id: 'craft_invocador_magma',
    name: 'Coroa do Imperador de Magma',
    station: 'cosmic_altar',
    category: 'construcao',
    desc: 'Invoca o Imperador Vulcânico de Magma (Recompensa Lendária!).',
    color: '#ff5522',
    ingredients: [
      { id: 'minerio_adamantita', qty: 4 },
      { id: 'brasa_viva', qty: 6 },
      { id: 'escama_dragao', qty: 2 },
    ],
    output: { kind: 'sandbox_item', itemId: 'boss_summon_magma', qty: 1 },
  },

  // --- EVOLUÇÃO DE HERÓIS & PETS ---
  {
    id: 'craft_pedra_evolucao',
    name: 'Pedra da Evolução',
    station: 'cosmic_altar',
    category: 'evolucao_pet',
    desc: 'Forja 1 Pedra da Evolução usada para evoluir Heróis até 3x!',
    color: '#ffd27d',
    ingredients: [
      { id: 'essencia_solar', qty: 3 },
      { id: 'essencia_sombria', qty: 3 },
      { id: 'cristal_biolum', qty: 4 },
    ],
    coinCost: 12,
    output: { kind: 'material', materialId: 'pedra_evolucao', qty: 1 },
  },
  {
    id: 'craft_racao_estelar',
    name: 'Ração Estelar (x3)',
    station: 'alchemy_cauldron',
    category: 'evolucao_pet',
    desc: 'Alimenta seu Pet equipado concedendo +45 XP de Vínculo.',
    color: '#4df0c0',
    ingredients: [
      { id: 'erva_celeste', qty: 3 },
      { id: 'po_fada', qty: 1 },
    ],
    output: { kind: 'material', materialId: 'racao_estelar', qty: 3 },
  },
];

export const RECIPE_MAP: Record<string, CraftRecipeDef> = Object.fromEntries(
  CRAFT_RECIPES.map((r) => [r.id, r])
);

export function createStarterMaterials(): Record<MaterialId, number> {
  return {
    madeira_ancestral: 12,
    pedra_runica: 10,
    minerio_cobre: 6,
    minerio_ferro: 6,
    minerio_ouro: 2,
    minerio_mitril: 0,
    minerio_titanio: 0,
    minerio_adamantita: 0,
    minerio_eter: 0,
    cristal_biolum: 3,
    cristal_gelo: 2,
    esporo_luminoso: 4,
    brasa_viva: 2,
    areia_estelar: 2,
    essencia_sombria: 2,
    essencia_solar: 1,
    essencia_abissal: 0,
    erva_celeste: 5,
    osso_antigo: 2,
    engrenagem_arcana: 1,
    fio_celestial: 4,
    nucleo_guardiao: 0,
    fragmento_eclipse: 0,
    po_fada: 2,
    escama_dragao: 0,
    obsidiana_viva: 0,
    pedra_evolucao: 1,
    racao_estelar: 2,
  };
}

/** Deterministic biome material drops awarded from enemy kills, chests, bosses, or stage clears. */
export function getBiomeMaterialDrops(
  biome: AnyBiomeId,
  isBoss: boolean,
  isElite: boolean,
  seed = 0
): { id: MaterialId; qty: number }[] {
  const b = String(biome);
  const drops: { id: MaterialId; qty: number }[] = [];

  if (b.includes('ash') || b.includes('steppe') || b.includes('canyon')) {
    drops.push({ id: 'pedra_runica', qty: 2 }, { id: 'minerio_ferro', qty: 1 });
  } else if (b.includes('biolum') || b.includes('fungal') || b.includes('fen')) {
    drops.push({ id: 'cristal_biolum', qty: 2 }, { id: 'esporo_luminoso', qty: 2 });
  } else if (b.includes('frost') || b.includes('glacial') || b.includes('aurora') || b.includes('cocytus')) {
    drops.push({ id: 'cristal_gelo', qty: 2 }, { id: 'minerio_titanio', qty: 1 });
  } else if (b.includes('forge') || b.includes('magma') || b.includes('brimstone') || b.includes('obsidian')) {
    drops.push({ id: 'brasa_viva', qty: 2 }, { id: 'obsidiana_viva', qty: 1 });
  } else if (b.includes('solar') || b.includes('desert') || b.includes('amber')) {
    drops.push({ id: 'areia_estelar', qty: 2 }, { id: 'minerio_ouro', qty: 1 });
  } else if (b.includes('crypt') || b.includes('bone') || b.includes('shadow') || b.includes('eclipse')) {
    drops.push({ id: 'osso_antigo', qty: 2 }, { id: 'essencia_sombria', qty: 1 });
  } else if (b.includes('clockwork') || b.includes('rust') || b.includes('cyber')) {
    drops.push({ id: 'engrenagem_arcana', qty: 1 }, { id: 'minerio_mitril', qty: 1 });
  } else if (b.includes('sakura') || b.includes('twilight') || b.includes('emerald') || b.includes('sky')) {
    drops.push({ id: 'fio_celestial', qty: 2 }, { id: 'erva_celeste', qty: 2 });
  } else {
    drops.push({ id: 'po_fada', qty: 1 }, { id: 'essencia_solar', qty: 1 });
  }

  if (isElite) {
    drops.push({ id: 'minerio_mitril', qty: 1 }, { id: 'racao_estelar', qty: 1 });
  }
  if (isBoss) {
    drops.push(
      { id: 'nucleo_guardiao', qty: 1 },
      { id: 'pedra_evolucao', qty: 1 },
      { id: seed % 2 === 0 ? 'minerio_eter' : 'escama_dragao', qty: 2 }
    );
  }
  return drops;
}

export function canCraftRecipe(
  recipe: CraftRecipeDef,
  materials: Record<string, number>,
  coins: number
): boolean {
  if ((recipe.coinCost ?? 0) > coins) return false;
  for (const ing of recipe.ingredients) {
    if ((materials[ing.id] ?? 0) < ing.qty) return false;
  }
  return true;
}
