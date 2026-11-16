// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — pure musical composition data & helper math for all 20 biomes
import { BiomeId } from './types';

export type SynthTimbre =
  | 'flute'
  | 'celesta'
  | 'harp'
  | 'koto'
  | 'organ'
  | 'clockwork'
  | 'musicbox'
  | 'horn'
  | 'synthlead'
  | 'lute';

export type DrumStep = 'K' | 'S' | 'H' | 'T' | null;

export interface BiomeMusicScore {
  biome: BiomeId;
  title: string;
  modeName: string;
  bpm: number;
  subdivision: 2 | 4; // 2 = 8th-note feel, 4 = 16th-note feel per beat
  leadTimbre: SynthTimbre;
  arpTimbre: SynthTimbre;
  padWarmthHz: number;
  masterVolume: number; // balanced 0.08 - 0.12 pre-compressor
  chords: [number, number, number][]; // 4 chords across 32 steps (8 steps each)
  melody: (number | null)[]; // 32 MIDI notes (null = sustain / rest)
  counterArp: (number | null)[]; // 32 MIDI notes
  bass: (number | null)[]; // 32 MIDI notes
  drums: DrumStep[]; // 32 percussive steps
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// MIDI Reference:
// C3=48, D3=50, E3=52, F3=53, G3=55, A3=57, B3=59
// C4=60, C#4=61, D4=62, Eb4=63, E4=64, F4=65, F#4=66, G4=67, G#4=68, A4=69, Bb4=70, B4=71
// C5=72, C#5=73, D5=74, Eb5=75, E5=76, F5=77, F#5=78, G5=79, G#5=80, A5=81, Bb5=82, B5=83, C6=84

export const BIOME_MUSIC_SCORES: Record<BiomeId, BiomeMusicScore> = {
  // 1. SILVER ASH — Melancholic A Aeolian Piano/Flute Climb (Celeste-inspired wistful theme)
  silver_ash: {
    biome: 'silver_ash',
    title: 'Ecos das Cinzas',
    modeName: 'Lá Eólio (Balada Alpina)',
    bpm: 84,
    subdivision: 2,
    leadTimbre: 'flute',
    arpTimbre: 'harp',
    padWarmthHz: 3200,
    masterVolume: 0.1,
    chords: [
      [57, 60, 64], // Am
      [53, 57, 60], // F
      [60, 64, 67], // C
      [55, 59, 62], // G
    ],
    melody: [
      69, null, 72, null, 76, null, 74, 72,
      69, null, 65, null, 69, null, 72, null,
      79, null, 76, null, 74, 72, 74, null,
      71, null, 74, null, 72, 71, 67, null,
    ],
    counterArp: [
      null, 64, null, 69, null, 64, null, null,
      null, 60, null, 65, null, 60, null, 64,
      null, 67, null, 72, null, 67, null, null,
      null, 62, null, 67, null, 62, null, 67,
    ],
    bass: [
      45, null, null, null, 52, null, null, null,
      41, null, null, null, 48, null, null, null,
      48, null, null, null, 55, null, null, null,
      43, null, null, null, 50, null, 47, null,
    ],
    drums: [
      'K', null, null, null, 'H', null, null, null,
      'K', null, null, null, 'H', null, null, 'H',
      'K', null, null, null, 'S', null, null, null,
      'K', null, 'H', null, 'S', null, null, null,
    ],
  },

  // 2. BIOLUMINESCENT — Glowing E Dorian / Minor9 Cavern Marimba & Plucks
  bioluminescent: {
    biome: 'bioluminescent',
    title: 'Esporos Luminosos',
    modeName: 'Mi Dórico (Gruta Neon)',
    bpm: 102,
    subdivision: 2,
    leadTimbre: 'harp',
    arpTimbre: 'celesta',
    padWarmthHz: 4200,
    masterVolume: 0.1,
    chords: [
      [52, 55, 59], // Em
      [48, 52, 55], // C
      [55, 59, 62], // G
      [50, 54, 57], // D
    ],
    melody: [
      76, null, 79, 78, 76, null, 74, null,
      72, null, 74, 76, 79, null, null, null,
      83, null, 79, 78, 74, null, 76, null,
      78, null, 74, 73, 74, null, 71, null,
    ],
    counterArp: [
      64, 67, 71, null, 67, 71, null, 64,
      60, 64, 67, null, 64, 67, null, 60,
      67, 71, 74, null, 71, 74, null, 67,
      62, 66, 69, null, 66, 69, null, 62,
    ],
    bass: [
      40, null, 40, null, 47, null, 40, null,
      36, null, 36, null, 43, null, 36, null,
      43, null, 43, null, 50, null, 43, null,
      38, null, 38, null, 45, null, 42, null,
    ],
    drums: [
      'K', null, 'H', null, 'T', null, 'H', null,
      'K', null, 'H', 'T', 'S', null, 'H', null,
      'K', null, 'H', null, 'T', null, 'H', 'T',
      'K', null, 'H', null, 'S', null, 'T', null,
    ],
  },

  // 3. FROSTGLASS — Shimmering D Dorian Ice Citadels
  frostglass: {
    biome: 'frostglass',
    title: 'Catedral de Safira',
    modeName: 'Ré Dórico (Cristal Glacial)',
    bpm: 94,
    subdivision: 2,
    leadTimbre: 'celesta',
    arpTimbre: 'flute',
    padWarmthHz: 4800,
    masterVolume: 0.095,
    chords: [
      [50, 53, 57], // Dm
      [55, 59, 62], // G
      [60, 64, 67], // C
      [57, 60, 64], // Am
    ],
    melody: [
      74, null, 81, null, 79, 77, 76, null,
      74, null, 71, null, 74, null, 76, null,
      84, null, 79, null, 76, 77, 79, null,
      81, null, 76, null, 74, null, 72, null,
    ],
    counterArp: [
      null, 69, 74, null, 69, null, 74, null,
      null, 67, 71, null, 67, null, 71, null,
      null, 72, 76, null, 72, null, 76, null,
      null, 69, 72, null, 69, null, 72, null,
    ],
    bass: [
      38, null, null, null, 45, null, null, null,
      43, null, null, null, 50, null, null, null,
      48, null, null, null, 55, null, null, null,
      45, null, null, null, 52, null, null, null,
    ],
    drums: [
      'T', null, null, 'H', null, null, 'T', null,
      'K', null, null, 'H', 'T', null, null, null,
      'T', null, null, 'H', null, null, 'T', null,
      'K', null, 'H', null, 'T', null, 'H', null,
    ],
  },

  // 4. OBSIDIAN FORGE — Heroic D Phrygian Brass & Anvil March
  obsidian_forge: {
    biome: 'obsidian_forge',
    title: 'Batida da Bigorna',
    modeName: 'Ré Frígio (Forja Vulcânica)',
    bpm: 128,
    subdivision: 2,
    leadTimbre: 'horn',
    arpTimbre: 'clockwork',
    padWarmthHz: 2800,
    masterVolume: 0.1,
    chords: [
      [50, 57, 62], // D5
      [51, 58, 63], // Eb5
      [48, 55, 60], // C5
      [45, 52, 57], // A5
    ],
    melody: [
      62, null, 62, 65, 63, null, 62, null,
      63, null, 67, 65, 63, 62, 60, null,
      62, null, 69, null, 70, 69, 67, null,
      65, null, 63, 62, 61, null, 64, null,
    ],
    counterArp: [
      50, 57, null, 57, 51, 58, null, 58,
      51, 58, null, 58, 50, 57, null, 57,
      48, 55, null, 55, 51, 58, null, 58,
      45, 52, null, 57, 45, 52, 55, null,
    ],
    bass: [
      38, 38, null, 38, 38, null, 38, 45,
      39, 39, null, 39, 39, null, 39, 46,
      36, 36, null, 36, 36, null, 43, null,
      33, 33, null, 33, 45, null, 40, null,
    ],
    drums: [
      'K', null, 'T', null, 'S', null, 'K', 'T',
      'K', null, 'T', null, 'S', null, 'K', 'H',
      'K', 'K', 'T', null, 'S', null, 'K', 'T',
      'K', null, 'S', null, 'S', 'T', 'K', null,
    ],
  },

  // 5. ASTRAL VOID — Ethereal C# Minor Space Nocturne
  astral_void: {
    biome: 'astral_void',
    title: 'Horizonte Sideral',
    modeName: 'Dó# Menor (Nocturno Estelar)',
    bpm: 78,
    subdivision: 2,
    leadTimbre: 'celesta',
    arpTimbre: 'lute',
    padWarmthHz: 4100,
    masterVolume: 0.095,
    chords: [
      [49, 52, 56], // C#m
      [45, 49, 52], // A
      [52, 56, 59], // E
      [47, 51, 54], // B
    ],
    melody: [
      73, null, 76, null, 80, null, 78, null,
      76, null, 73, null, 71, null, null, null,
      83, null, 80, null, 78, 76, 75, null,
      76, null, 71, null, 73, null, null, null,
    ],
    counterArp: [
      null, 61, 64, 68, null, 68, 64, null,
      null, 57, 61, 64, null, 64, 61, null,
      null, 64, 68, 71, null, 71, 68, null,
      null, 59, 63, 66, null, 66, 63, null,
    ],
    bass: [
      37, null, null, null, 44, null, null, null,
      33, null, null, null, 40, null, null, null,
      40, null, null, null, 47, null, null, null,
      35, null, null, null, 42, null, null, null,
    ],
    drums: [
      'K', null, null, null, null, null, 'H', null,
      null, null, null, 'T', null, null, null, null,
      'K', null, null, null, null, 'H', null, null,
      null, null, 'T', null, null, null, 'H', null,
    ],
  },

  // 6. CRIMSON SAKURA — Japanese Hirajoshi Scale Koto & Shakuhachi Flute
  crimson_sakura: {
    biome: 'crimson_sakura',
    title: 'Pétalas ao Vento',
    modeName: 'Escala Hirajoshi (Lá)',
    bpm: 108,
    subdivision: 2,
    leadTimbre: 'koto',
    arpTimbre: 'flute',
    padWarmthHz: 4400,
    masterVolume: 0.1,
    chords: [
      [57, 60, 64], // Am
      [53, 57, 60], // F
      [52, 57, 59], // Esus4
      [57, 64, 69], // A5
    ],
    // Hirajoshi in A: A(69), B(71), C(72), E(76), F(77), A5(81)
    melody: [
      76, null, 77, 76, 72, null, 71, 69,
      72, null, 76, null, 77, null, 81, null,
      83, null, 81, 77, 76, null, 72, 71,
      69, null, 71, 72, 76, null, 69, null,
    ],
    counterArp: [
      null, 64, null, 69, null, 60, null, 64,
      null, 65, null, 69, null, 60, null, 65,
      null, 64, null, 71, null, 64, null, 69,
      null, 64, null, 69, null, 72, null, null,
    ],
    bass: [
      45, null, null, 52, 45, null, null, null,
      41, null, null, 48, 41, null, null, null,
      40, null, null, 47, 40, null, null, null,
      45, null, 48, null, 52, null, 45, null,
    ],
    drums: [
      'K', null, 'T', null, null, 'T', 'H', null,
      'K', null, null, 'T', 'S', null, 'T', null,
      'K', null, 'T', null, 'K', null, 'H', null,
      'K', 'T', 'S', null, 'T', null, 'H', null,
    ],
  },

  // 7. SUNKEN CATHEDRAL — F# Minor Abyssal Pipe Organ & Water Droplets
  sunken_cathedral: {
    biome: 'sunken_cathedral',
    title: 'Nave Abissal',
    modeName: 'Fá# Menor (Órgão Submerso)',
    bpm: 74,
    subdivision: 2,
    leadTimbre: 'organ',
    arpTimbre: 'celesta',
    padWarmthHz: 2600,
    masterVolume: 0.095,
    chords: [
      [54, 57, 61], // F#m
      [50, 54, 57], // D
      [47, 50, 54], // Bm
      [49, 53, 56], // C#
    ],
    melody: [
      73, null, 74, null, 76, null, 73, null,
      78, null, 76, null, 74, null, 73, null,
      71, null, 74, null, 73, null, 69, null,
      68, null, 69, 71, 73, null, null, null,
    ],
    counterArp: [
      null, 61, 66, null, 69, null, 66, null,
      null, 62, 66, null, 69, null, 66, null,
      null, 59, 62, null, 66, null, 62, null,
      null, 61, 65, null, 68, null, 65, null,
    ],
    bass: [
      42, null, null, null, 49, null, null, null,
      38, null, null, null, 45, null, null, null,
      35, null, null, null, 42, null, null, null,
      37, null, null, null, 44, null, null, null,
    ],
    drums: [
      'K', null, null, null, null, null, 'T', null,
      null, null, null, 'T', null, null, null, null,
      'K', null, null, null, null, null, 'T', null,
      null, null, 'T', null, 'K', null, null, null,
    ],
  },

  // 8. CLOCKWORK SPIRE — E Harmonic Minor Mechanical Escapement Fugue
  clockwork_spire: {
    biome: 'clockwork_spire',
    title: 'Engrenagens do Pêndulo',
    modeName: 'Mi Menor Harmônico (Relojoaria)',
    bpm: 122,
    subdivision: 2,
    leadTimbre: 'clockwork',
    arpTimbre: 'musicbox',
    padWarmthHz: 4600,
    masterVolume: 0.095,
    chords: [
      [52, 55, 59], // Em
      [57, 60, 64], // Am
      [59, 63, 66], // B
      [52, 55, 59], // Em
    ],
    melody: [
      76, 79, 78, 76, 75, 76, 79, null,
      81, 79, 76, 72, 76, null, 74, null,
      75, 78, 83, 81, 79, 78, 75, null,
      76, null, 71, 75, 76, null, null, null,
    ],
    counterArp: [
      64, 67, 71, 67, 64, 67, 71, 67,
      69, 72, 76, 72, 69, 72, 76, 72,
      63, 66, 71, 66, 63, 66, 71, 66,
      64, 67, 71, 67, 64, 59, 64, null,
    ],
    bass: [
      40, null, 47, null, 40, null, 47, null,
      45, null, 52, null, 45, null, 52, null,
      47, null, 54, null, 47, null, 51, null,
      40, null, 47, null, 40, null, 40, null,
    ],
    drums: [
      'T', 'H', 'T', 'H', 'S', 'H', 'T', 'H',
      'K', 'H', 'T', 'H', 'S', 'H', 'T', 'T',
      'T', 'H', 'T', 'H', 'S', 'H', 'T', 'H',
      'K', 'H', 'S', 'H', 'T', null, 'T', null,
    ],
  },

  // 9. EMERALD SKY — Bright G Lydian Overworld Sky Adventure
  emerald_sky: {
    biome: 'emerald_sky',
    title: 'Arquipélago Dourado',
    modeName: 'Sol Lídio (Céus Esmeralda)',
    bpm: 118,
    subdivision: 2,
    leadTimbre: 'flute',
    arpTimbre: 'harp',
    padWarmthHz: 4600,
    masterVolume: 0.1,
    chords: [
      [55, 59, 62], // G
      [57, 61, 64], // A (Lydian II!)
      [59, 62, 66], // Bm
      [50, 54, 57], // D
    ],
    melody: [
      79, null, 83, null, 85, 83, 81, null,
      78, null, 79, 81, 83, null, 76, null,
      79, null, 81, 83, 86, null, 85, 83,
      81, null, 78, null, 79, null, null, null,
    ],
    counterArp: [
      67, 71, 74, null, 71, 74, null, 67,
      69, 73, 76, null, 73, 76, null, 69,
      71, 74, 78, null, 74, 78, null, 71,
      66, 69, 74, null, 69, 74, null, 66,
    ],
    bass: [
      43, null, 50, null, 43, null, 50, null,
      45, null, 52, null, 45, null, 52, null,
      47, null, 54, null, 47, null, 54, null,
      38, null, 45, null, 50, null, 42, null,
    ],
    drums: [
      'K', null, 'H', null, 'S', null, 'H', 'H',
      'K', null, 'H', 'K', 'S', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'H', 'H',
      'K', 'K', 'S', null, 'K', null, 'H', null,
    ],
  },

  // 10. SOLAR MIRAGE — E Phrygian Dominant Golden Desert Odyssey
  solar_mirage: {
    biome: 'solar_mirage',
    title: 'Miragem de Ônix',
    modeName: 'Mi Frígio Dominante (Deserto)',
    bpm: 112,
    subdivision: 2,
    leadTimbre: 'koto',
    arpTimbre: 'horn',
    padWarmthHz: 3800,
    masterVolume: 0.1,
    chords: [
      [52, 56, 59], // E
      [53, 57, 60], // F
      [50, 53, 57], // Dm
      [52, 56, 59], // E
    ],
    // E(76), F(77), G#(80), A(81), B(83), C(84)
    melody: [
      76, null, 77, 80, 81, null, 80, 77,
      76, null, 72, 74, 76, null, null, null,
      80, null, 81, 83, 84, null, 83, 81,
      80, 77, 76, 74, 76, null, null, null,
    ],
    counterArp: [
      null, 64, 68, null, 71, 68, 64, null,
      null, 65, 69, null, 72, 69, 65, null,
      null, 62, 65, null, 69, 65, 62, null,
      null, 64, 68, null, 71, 68, 64, null,
    ],
    bass: [
      40, null, 40, 47, 40, null, 47, null,
      41, null, 41, 48, 41, null, 48, null,
      38, null, 38, 45, 38, null, 45, null,
      40, null, 47, null, 40, null, 40, null,
    ],
    drums: [
      'K', null, 'T', 'T', 'S', null, 'T', null,
      'K', 'K', 'T', null, 'S', null, 'H', 'T',
      'K', null, 'T', 'T', 'S', null, 'T', null,
      'K', null, 'S', 'T', 'K', null, 'H', null,
    ],
  },

  // 11. AMETHYST CRYPT — G# Harmonic Minor Gothic Musicbox
  amethyst_crypt: {
    biome: 'amethyst_crypt',
    title: 'Ecos da Cripta',
    modeName: 'Sol# Menor Harmônico (Gótico)',
    bpm: 90,
    subdivision: 2,
    leadTimbre: 'musicbox',
    arpTimbre: 'organ',
    padWarmthHz: 3600,
    masterVolume: 0.095,
    chords: [
      [56, 59, 63], // G#m
      [52, 56, 59], // E
      [49, 52, 56], // C#m
      [51, 55, 58], // D#
    ],
    melody: [
      75, null, 80, null, 79, 80, 83, null,
      80, null, 76, null, 75, null, 71, null,
      73, null, 76, 80, 79, null, 75, null,
      79, 80, 82, null, 80, null, null, null,
    ],
    counterArp: [
      null, 68, 71, 75, null, 75, 71, null,
      null, 64, 68, 71, null, 71, 68, null,
      null, 61, 64, 68, null, 68, 64, null,
      null, 63, 67, 70, null, 70, 67, null,
    ],
    bass: [
      44, null, null, null, 51, null, null, null,
      40, null, null, null, 47, null, null, null,
      37, null, null, null, 44, null, null, null,
      39, null, null, null, 46, null, 44, null,
    ],
    drums: [
      'T', null, null, null, 'H', null, 'T', null,
      'K', null, null, null, 'S', null, null, null,
      'T', null, null, 'H', null, null, 'T', null,
      'K', null, 'H', null, 'S', null, 'T', null,
    ],
  },

  // 12. ALCHEMICAL LABS — F Mixolydian Quirky Bubbling Steampunk Synth
  alchemical_labs: {
    biome: 'alchemical_labs',
    title: 'Destilaria de Plasma',
    modeName: 'Fá Mixolídio (Alquimia)',
    bpm: 120,
    subdivision: 2,
    leadTimbre: 'clockwork',
    arpTimbre: 'synthlead',
    padWarmthHz: 4200,
    masterVolume: 0.095,
    chords: [
      [53, 57, 60], // F
      [51, 55, 58], // Eb
      [46, 50, 53], // Bb
      [48, 52, 55], // C
    ],
    melody: [
      77, null, 75, 77, 81, null, 79, null,
      75, null, 74, 75, 79, null, 77, null,
      74, 77, 82, null, 81, 79, 77, null,
      79, null, 76, 79, 84, null, 77, null,
    ],
    counterArp: [
      65, 69, 72, 69, 65, 69, 72, null,
      63, 67, 70, 67, 63, 67, 70, null,
      58, 62, 65, 62, 58, 62, 65, null,
      60, 64, 67, 64, 60, 64, 67, null,
    ],
    bass: [
      41, null, 48, null, 41, null, 45, null,
      39, null, 46, null, 39, null, 43, null,
      34, null, 41, null, 34, null, 38, null,
      36, null, 43, null, 36, null, 48, null,
    ],
    drums: [
      'K', null, 'T', 'H', 'S', null, 'T', null,
      'K', 'H', 'T', null, 'S', null, 'T', 'H',
      'K', null, 'T', 'H', 'S', null, 'T', null,
      'K', 'K', 'S', 'T', 'S', 'T', 'H', null,
    ],
  },

  // 13. AURORA ZENITH — A Major 7th Luminous Borealis Choir
  aurora_zenith: {
    biome: 'aurora_zenith',
    title: 'Véus da Aurora',
    modeName: 'Lá Maior 7ª (Zênite Boreal)',
    bpm: 88,
    subdivision: 2,
    leadTimbre: 'celesta',
    arpTimbre: 'flute',
    padWarmthHz: 5000,
    masterVolume: 0.095,
    chords: [
      [57, 61, 64], // A
      [52, 56, 59], // E
      [54, 57, 61], // F#m
      [50, 54, 57], // D
    ],
    melody: [
      81, null, 80, 76, 73, null, 76, null,
      79, null, 76, null, 75, null, 71, null,
      78, null, 76, 73, 74, null, 76, null,
      81, null, 80, null, 83, null, 85, null,
    ],
    counterArp: [
      null, 69, 73, 76, null, 76, 73, null,
      null, 64, 68, 71, null, 71, 68, null,
      null, 66, 69, 73, null, 73, 69, null,
      null, 62, 66, 69, null, 73, 69, null,
    ],
    bass: [
      45, null, null, null, 52, null, null, null,
      40, null, null, null, 47, null, null, null,
      42, null, null, null, 49, null, null, null,
      38, null, null, null, 45, null, null, null,
    ],
    drums: [
      'K', null, null, 'H', null, null, 'T', null,
      'K', null, null, 'H', 'T', null, null, null,
      'K', null, null, 'H', null, null, 'T', null,
      'K', null, 'H', null, 'T', null, 'H', null,
    ],
  },

  // 14. CRIMSON CANYON — Bb Dorian Heroic Mesa Stride
  crimson_canyon: {
    biome: 'crimson_canyon',
    title: 'Falésias Escarlates',
    modeName: 'Sib Dórico (Cânion)',
    bpm: 116,
    subdivision: 2,
    leadTimbre: 'horn',
    arpTimbre: 'koto',
    padWarmthHz: 3600,
    masterVolume: 0.1,
    chords: [
      [46, 49, 53], // Bbm
      [51, 55, 58], // Eb
      [49, 53, 56], // Db
      [53, 56, 60], // Fm
    ],
    melody: [
      70, null, 77, null, 75, 73, 70, null,
      75, null, 77, 79, 82, null, 79, null,
      77, null, 75, 73, 72, null, 73, null,
      75, null, 72, 70, 68, null, 70, null,
    ],
    counterArp: [
      58, 61, 65, null, 61, 65, null, 58,
      63, 67, 70, null, 67, 70, null, 63,
      61, 65, 68, null, 65, 68, null, 61,
      60, 65, 68, null, 65, 68, null, 60,
    ],
    bass: [
      34, null, 41, null, 34, null, 41, null,
      39, null, 46, null, 39, null, 46, null,
      37, null, 44, null, 37, null, 44, null,
      41, null, 48, null, 41, null, 39, null,
    ],
    drums: [
      'K', null, 'H', null, 'S', null, 'K', 'H',
      'K', null, 'H', 'K', 'S', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'K', 'H',
      'K', 'K', 'S', null, 'S', null, 'H', null,
    ],
  },

  // 15. CYBER UNDERCITY — C Minor Neon Synthwave Pulse
  cyber_undercity: {
    biome: 'cyber_undercity',
    title: 'Metrópole Neon',
    modeName: 'Dó Menor (Synthwave)',
    bpm: 132,
    subdivision: 2,
    leadTimbre: 'synthlead',
    arpTimbre: 'clockwork',
    padWarmthHz: 4600,
    masterVolume: 0.095,
    chords: [
      [48, 51, 55], // Cm
      [44, 48, 51], // Ab
      [51, 55, 58], // Eb
      [46, 50, 53], // Bb
    ],
    melody: [
      72, null, 79, null, 75, 79, 82, null,
      80, null, 79, 75, 79, null, 72, null,
      84, null, 82, null, 79, 75, 79, null,
      77, null, 75, 74, 70, null, 74, null,
    ],
    counterArp: [
      60, 63, 67, 63, 60, 63, 67, 63,
      56, 60, 63, 60, 56, 60, 63, 60,
      63, 67, 70, 67, 63, 67, 70, 67,
      58, 62, 65, 62, 58, 62, 65, 62,
    ],
    bass: [
      36, 36, 48, 36, 36, 36, 48, 36,
      32, 32, 44, 32, 32, 32, 44, 32,
      39, 39, 51, 39, 39, 39, 51, 39,
      34, 34, 46, 34, 34, 34, 46, 34,
    ],
    drums: [
      'K', null, 'H', null, 'S', null, 'H', 'H',
      'K', null, 'H', null, 'S', null, 'H', 'K',
      'K', null, 'H', null, 'S', null, 'H', 'H',
      'K', null, 'S', 'H', 'S', 'K', 'H', null,
    ],
  },

  // 16. CELESTIAL MARBLE — G Mixolydian Regal Hellenic Parthenon
  celestial_marble: {
    biome: 'celestial_marble',
    title: 'Colunas do Partenon',
    modeName: 'Sol Mixolídio (Lira Celeste)',
    bpm: 104,
    subdivision: 2,
    leadTimbre: 'harp',
    arpTimbre: 'organ',
    padWarmthHz: 4200,
    masterVolume: 0.1,
    chords: [
      [55, 59, 62], // G
      [53, 57, 60], // F
      [48, 52, 55], // C
      [50, 54, 57], // D
    ],
    melody: [
      79, null, 74, 79, 83, null, 81, 79,
      77, null, 79, 81, 84, null, 79, null,
      83, null, 79, 76, 79, null, 74, null,
      78, null, 81, 79, 78, null, 74, null,
    ],
    counterArp: [
      null, 67, 71, 74, null, 71, 74, null,
      null, 65, 69, 72, null, 69, 72, null,
      null, 60, 64, 67, null, 64, 67, null,
      null, 62, 66, 69, null, 66, 69, null,
    ],
    bass: [
      43, null, 50, null, 43, null, 50, null,
      41, null, 48, null, 41, null, 48, null,
      36, null, 43, null, 36, null, 43, null,
      38, null, 45, null, 38, null, 42, null,
    ],
    drums: [
      'K', null, 'H', null, 'T', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'H', null,
      'K', null, 'H', null, 'T', null, 'H', null,
      'K', null, 'T', null, 'S', null, 'T', null,
    ],
  },

  // 17. EBONY FEN — F Dorian Misty Bayou Lullaby
  ebony_fen: {
    biome: 'ebony_fen',
    title: 'Bruma do Salgueiro',
    modeName: 'Fá Dórico (Pântano Místico)',
    bpm: 76,
    subdivision: 2,
    leadTimbre: 'lute',
    arpTimbre: 'flute',
    padWarmthHz: 3000,
    masterVolume: 0.1,
    chords: [
      [53, 56, 60], // Fm
      [46, 50, 53], // Bb
      [56, 60, 63], // Ab
      [51, 55, 58], // Eb
    ],
    melody: [
      72, null, 75, null, 77, null, 74, 72,
      70, null, 74, null, 77, null, null, null,
      80, null, 79, 77, 75, null, 72, null,
      74, null, 72, 70, 67, null, 68, null,
    ],
    counterArp: [
      null, 65, 68, null, 72, null, 68, null,
      null, 62, 65, null, 70, null, 65, null,
      null, 68, 72, null, 75, null, 72, null,
      null, 63, 67, null, 70, null, 67, null,
    ],
    bass: [
      41, null, null, null, 48, null, null, null,
      34, null, null, null, 41, null, null, null,
      44, null, null, null, 51, null, null, null,
      39, null, null, null, 46, null, null, null,
    ],
    drums: [
      'K', null, null, null, 'H', null, null, 'T',
      'K', null, null, null, 'S', null, null, null,
      'K', null, null, 'H', null, null, 'T', null,
      'K', null, 'H', null, 'S', null, null, null,
    ],
  },

  // 18. ORBITAL NEXUS — G# Minor Zero-Gravity Space Station Sequence
  orbital_nexus: {
    biome: 'orbital_nexus',
    title: 'Estação Sideral',
    modeName: 'Sol# Menor (Órbita Zero-G)',
    bpm: 126,
    subdivision: 2,
    leadTimbre: 'synthlead',
    arpTimbre: 'celesta',
    padWarmthHz: 4800,
    masterVolume: 0.095,
    chords: [
      [56, 59, 63], // G#m
      [52, 56, 59], // E
      [47, 51, 54], // B
      [54, 58, 61], // F#
    ],
    melody: [
      80, null, 83, null, 87, null, 85, 83,
      80, null, 76, null, 80, null, 83, null,
      83, null, 82, 80, 78, null, 75, null,
      78, null, 82, null, 85, null, 83, null,
    ],
    counterArp: [
      68, 71, 75, 71, 68, 71, 75, 71,
      64, 68, 71, 68, 64, 68, 71, 68,
      59, 63, 66, 63, 59, 63, 66, 63,
      66, 70, 73, 70, 66, 70, 73, 70,
    ],
    bass: [
      44, null, 44, 51, 44, null, 44, 51,
      40, null, 40, 47, 40, null, 40, 47,
      35, null, 35, 42, 35, null, 35, 42,
      42, null, 42, 49, 42, null, 49, null,
    ],
    drums: [
      'K', null, 'H', null, 'S', null, 'H', 'T',
      'K', null, 'H', 'K', 'S', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'H', 'T',
      'K', 'T', 'S', null, 'S', 'H', 'K', null,
    ],
  },

  // 19. TWILIGHT GARDEN — C Minor / Eb Romantic Lotus Nocturne
  twilight_garden: {
    biome: 'twilight_garden',
    title: 'Lótus do Ocaso',
    modeName: 'Dó Menor Lírico (Crepúsculo)',
    bpm: 94,
    subdivision: 2,
    leadTimbre: 'harp',
    arpTimbre: 'celesta',
    padWarmthHz: 4300,
    masterVolume: 0.1,
    chords: [
      [48, 51, 55], // Cm
      [56, 60, 63], // Ab
      [51, 55, 58], // Eb
      [55, 59, 62], // G
    ],
    melody: [
      79, null, 75, null, 72, 74, 75, null,
      80, null, 79, 77, 75, null, 72, null,
      82, null, 79, null, 75, 77, 79, null,
      74, null, 77, 75, 74, null, 71, null,
    ],
    counterArp: [
      null, 63, 67, 72, null, 67, 63, null,
      null, 68, 72, 75, null, 72, 68, null,
      null, 63, 67, 70, null, 67, 63, null,
      null, 62, 67, 71, null, 67, 62, null,
    ],
    bass: [
      36, null, null, 43, 36, null, 43, null,
      44, null, null, 51, 44, null, 51, null,
      39, null, null, 46, 39, null, 46, null,
      43, null, null, 50, 43, null, 47, null,
    ],
    drums: [
      'K', null, null, 'H', 'T', null, 'H', null,
      'K', null, null, 'H', 'S', null, null, null,
      'K', null, null, 'H', 'T', null, 'H', null,
      'K', null, 'H', null, 'S', null, 'T', null,
    ],
  },

  // 20. STORMCROWN — Heroic Summit Climax in E Minor / Harmonic
  stormcrown: {
    biome: 'stormcrown',
    title: 'Coroa da Tempestade',
    modeName: 'Mi Menor Épico (Clímax Final)',
    bpm: 140,
    subdivision: 2,
    leadTimbre: 'synthlead',
    arpTimbre: 'horn',
    padWarmthHz: 5000,
    masterVolume: 0.1,
    chords: [
      [52, 55, 59], // Em
      [48, 52, 55], // C
      [50, 54, 57], // D
      [47, 51, 54], // B
    ],
    melody: [
      76, null, 83, null, 81, 79, 78, null,
      76, null, 79, 81, 84, null, 83, null,
      86, null, 84, 83, 81, null, 78, null,
      79, null, 78, 76, 75, null, 83, null,
    ],
    counterArp: [
      64, 67, 71, 67, 64, 67, 71, 67,
      60, 64, 67, 64, 60, 64, 67, 64,
      62, 66, 69, 66, 62, 66, 69, 66,
      59, 63, 66, 63, 59, 63, 66, 71,
    ],
    bass: [
      40, 40, 47, 40, 40, 40, 47, 40,
      36, 36, 43, 36, 36, 36, 43, 36,
      38, 38, 45, 38, 38, 38, 45, 38,
      35, 35, 42, 35, 47, null, 42, null,
    ],
    drums: [
      'K', 'H', 'T', 'H', 'S', 'H', 'K', 'H',
      'K', 'H', 'K', 'H', 'S', 'H', 'T', 'H',
      'K', 'H', 'T', 'H', 'S', 'H', 'K', 'K',
      'K', 'T', 'S', 'H', 'S', 'K', 'S', 'T',
    ],
  },
  ...(() => {
    const specs: {
      biome: BiomeId;
      title: string;
      modeName: string;
      bpm: number;
      leadTimbre: SynthTimbre;
      arpTimbre: SynthTimbre;
      root: number;
      scale: number[];
      seed: number;
    }[] = [
      { biome: 'coral_abyss', title: 'Canto do Recife', modeName: 'Fá Lídio Submerso', bpm: 96, leadTimbre: 'celesta', arpTimbre: 'harp', root: 53, scale: [0, 2, 4, 6, 7, 9, 11], seed: 101 },
      { biome: 'ember_steppe', title: 'Vento das Brasas', modeName: 'Ré Frígio Vulcânico', bpm: 126, leadTimbre: 'horn', arpTimbre: 'lute', root: 50, scale: [0, 1, 3, 5, 7, 8, 10], seed: 102 },
      { biome: 'jade_bamboo', title: 'Névoa de Bambu', modeName: 'Sol Pentatônico Jade', bpm: 92, leadTimbre: 'flute', arpTimbre: 'koto', root: 55, scale: [0, 2, 4, 7, 9, 12, 14], seed: 103 },
      { biome: 'glacial_fjord', title: 'Maré do Fiorde', modeName: 'Dó# Menor Ártico', bpm: 108, leadTimbre: 'harp', arpTimbre: 'celesta', root: 49, scale: [0, 2, 3, 5, 7, 8, 10], seed: 104 },
      { biome: 'rust_foundry', title: 'Pistões de Ferro', modeName: 'Mi Locrio Industrial', bpm: 134, leadTimbre: 'clockwork', arpTimbre: 'synthlead', root: 52, scale: [0, 1, 3, 5, 6, 8, 10], seed: 105 },
      { biome: 'fungal_myriad', title: 'Pólen Dourado', modeName: 'Si Dórico Micelial', bpm: 104, leadTimbre: 'musicbox', arpTimbre: 'harp', root: 59, scale: [0, 2, 3, 5, 7, 9, 10], seed: 106 },
      { biome: 'storm_archipelago', title: 'Ilhas do Trovão', modeName: 'Lá Mixolídio Celeste', bpm: 132, leadTimbre: 'horn', arpTimbre: 'synthlead', root: 57, scale: [0, 2, 4, 5, 7, 9, 10], seed: 107 },
      { biome: 'obsidian_temple', title: 'Altar de Obsidiana', modeName: 'Fá# Menor Harmônico', bpm: 118, leadTimbre: 'flute', arpTimbre: 'organ', root: 54, scale: [0, 2, 3, 5, 7, 8, 11], seed: 108 },
      { biome: 'mercury_mire', title: 'Lago de Mercúrio', modeName: 'Eb Lídio Líquido', bpm: 112, leadTimbre: 'celesta', arpTimbre: 'clockwork', root: 51, scale: [0, 2, 4, 6, 7, 9, 11], seed: 109 },
      { biome: 'crimson_foundry', title: 'Órgão Carmesim', modeName: 'Sol Menor Gótico', bpm: 122, leadTimbre: 'organ', arpTimbre: 'horn', root: 55, scale: [0, 2, 3, 5, 7, 8, 11], seed: 110 },
      { biome: 'mirror_labyrinth', title: 'Reflexos Infinitos', modeName: 'Ré Dórico Cristal', bpm: 114, leadTimbre: 'celesta', arpTimbre: 'musicbox', root: 50, scale: [0, 2, 3, 5, 7, 9, 10], seed: 111 },
      { biome: 'hourglass_desert', title: 'Dunas da Ampulheta', modeName: 'Mi Duplo Harmônico', bpm: 120, leadTimbre: 'lute', arpTimbre: 'koto', root: 52, scale: [0, 1, 4, 5, 7, 8, 11], seed: 112 },
      { biome: 'velvet_opera', title: 'Valso Crepuscular', modeName: 'Dó Menor Barroco', bpm: 106, leadTimbre: 'organ', arpTimbre: 'harp', root: 48, scale: [0, 2, 3, 5, 7, 8, 11], seed: 113 },
      { biome: 'bone_catacombs', title: 'Cântico do Ossuário', modeName: 'Lá Frígio Espectral', bpm: 100, leadTimbre: 'organ', arpTimbre: 'musicbox', root: 57, scale: [0, 1, 3, 5, 7, 8, 10], seed: 114 },
      { biome: 'cloud_monastery', title: 'Sinos das Nuvens', modeName: 'Fá Pentatônico Celeste', bpm: 88, leadTimbre: 'flute', arpTimbre: 'celesta', root: 53, scale: [0, 2, 4, 7, 9, 12, 14], seed: 115 },
      { biome: 'cyber_grid', title: 'Pulso Holográfico', modeName: 'Dó# Synthwave', bpm: 138, leadTimbre: 'synthlead', arpTimbre: 'clockwork', root: 49, scale: [0, 2, 3, 5, 7, 9, 10], seed: 116 },
      { biome: 'amber_hive', title: 'Zumbido de Âmbar', modeName: 'Si Bemol Mixolídio', bpm: 124, leadTimbre: 'clockwork', arpTimbre: 'lute', root: 58, scale: [0, 2, 4, 5, 7, 9, 10], seed: 117 },
      { biome: 'astral_library', title: 'Arquivos Astrais', modeName: 'Ré Lídio Arcano', bpm: 94, leadTimbre: 'musicbox', arpTimbre: 'harp', root: 50, scale: [0, 2, 4, 6, 7, 9, 11], seed: 118 },
      { biome: 'magnetic_rift', title: 'Fenda Polar', modeName: 'Fá# Dórico Elétrico', bpm: 128, leadTimbre: 'synthlead', arpTimbre: 'celesta', root: 54, scale: [0, 2, 3, 5, 7, 9, 10], seed: 119 },
      { biome: 'prism_sanctum', title: 'Hino do Prisma', modeName: 'Lá Lídio Radiante', bpm: 116, leadTimbre: 'harp', arpTimbre: 'celesta', root: 57, scale: [0, 2, 4, 6, 7, 9, 11], seed: 120 },
      { biome: 'void_nebula', title: 'Poeira Cósmica', modeName: 'Dó# Eólio Espacial', bpm: 102, leadTimbre: 'synthlead', arpTimbre: 'harp', root: 49, scale: [0, 2, 3, 5, 7, 8, 10], seed: 121 },
      { biome: 'solar_corona', title: 'Fulgor da Supernova', modeName: 'Mi Lídio Solar', bpm: 136, leadTimbre: 'horn', arpTimbre: 'synthlead', root: 52, scale: [0, 2, 4, 6, 7, 9, 11], seed: 122 },
      { biome: 'lunar_bastion', title: 'Crateras Prateadas', modeName: 'Si Eólio Lunar', bpm: 90, leadTimbre: 'celesta', arpTimbre: 'flute', root: 59, scale: [0, 2, 3, 5, 7, 8, 10], seed: 123 },
      { biome: 'chrono_paradox', title: 'Paradoxo dos Ponteiros', modeName: 'Sol# Menor Cromático', bpm: 130, leadTimbre: 'clockwork', arpTimbre: 'musicbox', root: 56, scale: [0, 2, 3, 5, 7, 8, 11], seed: 124 },
      { biome: 'starlight_harbor', title: 'Velas de Luz Estelar', modeName: 'Dó Lídio Marítimo', bpm: 110, leadTimbre: 'flute', arpTimbre: 'lute', root: 48, scale: [0, 2, 4, 6, 7, 9, 11], seed: 125 },
      { biome: 'blood_eclipse', title: 'Vigília do Eclipse', modeName: 'Fá Frígio Escarlate', bpm: 134, leadTimbre: 'organ', arpTimbre: 'horn', root: 53, scale: [0, 1, 3, 5, 7, 8, 10], seed: 126 },
      { biome: 'crystal_singularity', title: 'Horizonte de Eventos', modeName: 'Eb Menor Cósmico', bpm: 126, leadTimbre: 'synthlead', arpTimbre: 'musicbox', root: 51, scale: [0, 2, 3, 5, 7, 8, 10], seed: 127 },
      { biome: 'seraph_citadel', title: 'Coro dos Serafins', modeName: 'Sol Lídio Celestial', bpm: 118, leadTimbre: 'harp', arpTimbre: 'horn', root: 55, scale: [0, 2, 4, 6, 7, 9, 11], seed: 128 },
      { biome: 'abyss_throne', title: 'Trono do Abismo', modeName: 'Ré Menor Abissal', bpm: 142, leadTimbre: 'organ', arpTimbre: 'synthlead', root: 50, scale: [0, 1, 3, 5, 7, 8, 11], seed: 129 },
      { biome: 'eternity_apex', title: 'Ápice da Eternidade', modeName: 'Dó Maior Épico Final', bpm: 146, leadTimbre: 'synthlead', arpTimbre: 'harp', root: 60, scale: [0, 2, 4, 6, 7, 9, 11], seed: 130 },
    ];
    const entries: Record<string, BiomeMusicScore> = {};
    for (const s of specs) {
      const chords: [number, number, number][] = [
        [s.root + s.scale[0], s.root + s.scale[2], s.root + s.scale[4]],
        [s.root + s.scale[3], s.root + s.scale[5], s.root + s.scale[0] + 12],
        [s.root + s.scale[4], s.root + s.scale[6], s.root + s.scale[1] + 12],
        [s.root + s.scale[2], s.root + s.scale[4], s.root + s.scale[6]],
      ];
      const melody: (number | null)[] = [];
      const counterArp: (number | null)[] = [];
      const bass: (number | null)[] = [];
      const drums: DrumStep[] = [];
      for (let i = 0; i < 32; i++) {
        const bar = Math.floor(i / 8);
        const h = (s.seed * 31 + i * 17 + bar * 13) % 97;
        const deg = (i + s.seed + bar * 2 + (h % 3)) % s.scale.length;
        const rest = i % 4 === 1 && h % 5 !== 0;
        melody.push(rest ? null : s.root + 12 + s.scale[deg]);
        counterArp.push(i % 2 === 0 ? chords[bar][i % 3] + 12 : null);
        bass.push(i % 4 === 0 ? chords[bar][0] - 12 : i % 4 === 2 ? chords[bar][2] - 12 : null);
        drums.push(i % 8 === 0 ? 'K' : i % 8 === 4 ? 'S' : i % 2 === 1 ? 'H' : h % 7 === 0 ? 'T' : null);
      }
      entries[s.biome] = {
        biome: s.biome,
        title: s.title,
        modeName: s.modeName,
        bpm: s.bpm,
        subdivision: 2,
        leadTimbre: s.leadTimbre,
        arpTimbre: s.arpTimbre,
        padWarmthHz: 3800 + (s.seed % 5) * 300,
        masterVolume: 0.1,
        chords,
        melody,
        counterArp,
        bass,
        drums,
      };
    }
    return entries as Record<BiomeId, BiomeMusicScore>;
  })(),
};

export const JUKEBOX_TO_BIOME: Record<string, BiomeId> = {
  cinzas_tema: 'silver_ash',
  micelio_danca: 'bioluminescent',
  forja_furia: 'obsidian_forge',
  sakura_vento: 'crimson_sakura',
  crono_engrenagem: 'clockwork_spire',
  vazio_astral: 'astral_void',
  boss_duelo: 'crimson_canyon',
  pinaculo_final: 'stormcrown',
};

/** Computes how many steps a melody/bass note holds before the next note in the 32-step loop */
export function computeNoteSteps(pattern: (number | null)[], stepIdx: number, maxHold = 4): number {
  let steps = 1;
  for (let i = 1; i < maxHold; i++) {
    const next = pattern[(stepIdx + i) % pattern.length];
    if (next !== null) break;
    steps++;
  }
  return steps;
}
