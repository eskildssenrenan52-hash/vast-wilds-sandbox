// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import React, { useEffect, useRef } from 'react';
import { getHeroDef, getHeroSkinDef, HeroId } from '../../game/heroes';
import {
  drawHeroEvolutionBackLayers,
  drawHeroEvolutionFrontLayers,
} from '../../game/heroEvolutionRenderer';
import { buildHeroPalette, HERO_SPRITE_SETS, drawPixelSprite } from '../../game/sprites';

interface HeroPortraitProps {
  heroId: HeroId;
  skinId?: string;
  size?: number;
  animate?: boolean;
  evolutionTier?: number;
  className?: string;
}

// 22x19 high-detail close-up portraits (non-squashed 13-row tall head+neck + 2x2 eyes + 6-row sculpted shoulders)
function makePortrait(
  head13: string[],
  collar: string,
  chestA: string,
  chestB: string,
  chestC: string,
  chestD: string,
  chestE: string
): string[] {
  return [...head13, collar, chestA, chestB, chestC, chestD, chestE].map((r) =>
    r.length === 22 ? r : r.length > 22 ? r.slice(0, 22) : r.padEnd(22, '.')
  );
}

const PORTRAIT_ROWS: Record<HeroId, string[]> = {
  lyra: makePortrait(
    [
      '.......oooooooo.......',
      '......ohHHHHHHho......',
      '.....ohHHHHHHHHho.....',
      '....ohHHGddssddGHHho..'.slice(0, 22),
      '.....ohdssssssssdho...',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '....oooGGGGGGGGooo....',
    '...oCcCCCCCCCCCCcCo...',
    '..oCCaaCCgGGgCCaaCCo..',
    '..oCCCCCgGGGGgCCCCCo..',
    '..oDDDDDCCggCCDDDDDo..',
    '...oDDDDDDDDDDDDDDo...'
  ),
  zephyr: makePortrait(
    [
      '.......oo.oo.oo.......',
      '......ohHoHHoHho......',
      '.....ohHHHHHHHHho.....',
      '....ohogAoggogAoho....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '.......oooSSooo.......',
      '......oAAAAAAAAo......',
    ],
    '...oooAAAAAAAAAAooo...',
    '..oAAACCCCCCCCCCAAAo..',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oCCaCCgGGGGgCCaCCo..',
    '..oDDDCCCCggCCCCDDDo..',
    '...oDDDDDDDDDDDDDDo...'
  ),
  nyx: makePortrait(
    [
      '.....oo........oo.....',
      '.....ohho....ohho.....',
      '....ohHHhoooohHHho....',
      '....ohHHHHHHHHHHho....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ooDDDDDDDDoo.....',
      '......oDDDDDDDDo......',
      '.......oDDDDDDo.......',
      '........oooooo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaaCCgGGgCCaaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgWWWWgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  ignis: makePortrait(
    [
      '.......ooAAAAoo.......',
      '......oaAAAAAAao......',
      '.....oGggggggggGo.....',
      '....oGgCCCCCCCCgGo....',
      '....ogCggggggggCgo....',
      '....ogCweeeSSeeego....',
      '....ogCDDDDDDDDCgo....',
      '.....ogDDDggDDDgo.....',
      '......oDDDDDDDDo......',
      '.......oDDDDDDo.......',
      '........oooooo........',
      '.......ooGGGGoo.......',
      '......oCCCCCCCCo......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgGGgCCCCCo...',
    '..oCCggggWWWWggggCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  seraphina: makePortrait(
    [
      '.....ooGGGGGGGGoo.....',
      '......oooooooooo......',
      '.....ohHHHHHHHHho.....',
      '....ohHHddddddHHho....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oCCaCCgGGGGgCCaCCo..',
    '..oDDaCCgWWWWgCCaDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  volt: makePortrait(
    [
      '....oo..oooooo..oo....',
      '...oHHoohHHHHhoHHHo...',
      '....ohHoHHHHHHoHho....',
      '.....ohdssssssdho.....',
      '.....ohAAAAAAAAho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooAAAAoo.......',
    ],
    '...ooAaCCCCCCCCaAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oCCCCCCgAAgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '...oDDDDDDDDDDDDDDo...'
  ),
  umbra: makePortrait(
    [
      '........oooooo........',
      '.......ohHHHHho.......',
      '......ohHHHHHHho......',
      '....oooGGGGGGGGooo....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgAAAAgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  aegis: makePortrait(
    [
      '.......ooGGGGoo.......',
      '......oohHHHHhoo......',
      '.....ohCCCCCCCCdo.....',
      '.....ohGGGGGGGGdo.....',
      '.....ohdweeeewddo.....',
      '.....ohdaaaaaaddo.....',
      '.....ohdddGGddddo.....',
      '......ohDDDDDDdo......',
      '.......oDDDDDDo.......',
      '........oooooo........',
      '.......ooGGGGoo.......',
      '......oCCCCCCCCo......',
      '.....ooCCCCCCCCoo.....',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oDDCCCCgaagCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  kitsune: makePortrait(
    [
      '....ooo........ooo....',
      '...oHHHo......oHHHo...',
      '...ohHHooooooooHHho...',
      '....ohHHHHHHHHHHho....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooAaCCCCCCCCaAoo...',
    '..oAAaaCCcWWcCCaaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgWWWWgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  chronos_mage: makePortrait(
    [
      '.......oooooooo.......',
      '......oDDDDDDDDo......',
      '.....ooGGGGGGGGoo.....',
      '.....ohHHHHHHHHho.....',
      '.....ohdssssssdho.....',
      '.....ohwessGGGGho.....',
      '.....oheesSGGGGho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooGGGGoo.......',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgAAAAgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  tidal: makePortrait(
    [
      '.......ooGooGoo.......',
      '......oGGGGGGGGoo.....',
      '.....ohHHHHHHHHho.....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooAaCCCCCCCCaAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgAAAAgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  solaris: makePortrait(
    [
      '.....ooGGGGGGGGoo.....',
      '......ooHHHHHHoo......',
      '.....ohHHHHHHHHho.....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooGGGGoo.......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgGGgCCCCCCo..',
    '..oCCaCCCgWWgCCCaCCo..',
    '..oDDaCCCgGGgCCCaDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  valkyrie: makePortrait(
    [
      '..oo....oooooo....oo..',
      '..oGoo.oGGGGGGoo.oGo..',
      '..oGoooohHHHHhhoooGo..',
      '...oohdssssssssdhoo...',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooGGGGoo.......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgGGgCCCCCCo..',
    '..oACCCCCgWWgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  ronin: makePortrait(
    [
      '.......oooooooo.......',
      '.....ooGggggggGoo.....',
      '...ooGGddddddddGGoo...',
      '.ooggggDDDDDDDDggggoo.',
      '.....oddddddddddo.....',
      '.....odwesssswedo.....',
      '.....ocCCCCCCCCco.....',
      '......oDDDDDDDDo......',
      '.......oDDDDDDo.......',
      '........oooooo........',
      '.......oacCCcao.......',
      '......oCCCCCCCCo......',
      '.....ooCCCCCCCCoo.....',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oCCaCCCgGGgCCCaCCo..',
    '..oCCCCCgGGGGgCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  draco: makePortrait(
    [
      '...oo............oo...',
      '...oGGo..oooo..oGGo...',
      '....oGGoHHHHHHoGGo....',
      '....oohddddddddhoo....',
      '.....ohdssssssdho.....',
      '.....oswessssweso.....',
      '.....odssSSSSssdo.....',
      '......odGGGGGGdo......',
      '.......oDDDDDDo.......',
      '........oooooo........',
      '.......ooGGGGoo.......',
      '......oCCCCCCCCo......',
      '.....ooCCCCCCCCoo.....',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgGGgCCCCCCo..',
    '..oCCCCCCgWWgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  nebula: makePortrait(
    [
      '.......ooAAAAoo.......',
      '.....ooGGGGGGGGoo.....',
      '.....ohHHHHHHHHho.....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgaaaagCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  druid: makePortrait(
    [
      '..ooo...oooooo...ooo..',
      '..oGGo.oHHHHHHooGGo...',
      '...oaoohdHHHHdhoao....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooaaaaao.......',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oCCCCCgGGGGgCCCCCo..',
    '..oDDCCCgGGGGgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  golem_knight: makePortrait(
    [
      '......oooooooooo......',
      '.....oDDDDDDDDDDo.....',
      '....oDDGGGGGGGGDDo....',
      '....oDDCCCCCCCCDDo....',
      '....oDDweeeeeewDDo....',
      '....oDDwaaaaaawDDo....',
      '....oDDDDDDDDDDDDo....',
      '.....oCDDDDDDDDCo.....',
      '......oDDDDDDDDo......',
      '.......oooooooo.......',
      '......ooCCCCCCoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooCCCCCCCCCCoo....',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oCCCCCCgWWgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  jester: makePortrait(
    [
      '.oo..............oo...',
      'oAAo....oooooo...oAAo.',
      '.oGGo.ohHHHHHHho.oGGo.',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....odweesssewdo.....',
      '.....odssssssssdo.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '.....ooGGGGGGGGoo.....',
      '......ooSSSSSSoo......',
      '.......oooooooo.......',
      '......oACCCCCCAo......',
    ],
    '...ooACCCCCCCCCCAoo...',
    '..oACCCCgGGGGgCCCCAo..',
    '..oCCCCCgaGGagCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  siren: makePortrait(
    [
      '.....oo.oooooo.oo.....',
      '....oGGoHHHHHHoGGo....',
      '.....ohHHHHHHHHho.....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgaGGagCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  reaper: makePortrait(
    [
      '........oooooo........',
      '......ooDDDDDDoo......',
      '.....oDDDDDDDDDDo.....',
      '....oDDdssssssdDDo....',
      '....oDDweeeeeewDDo....',
      '....oDDddddddddDDo....',
      '....oDDDDDDDDDDDDo....',
      '.....oDDDDDDDDDDo.....',
      '......oDDDDDDDDo......',
      '.......oooooooo.......',
      '......ooCCCCCCoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooCCCCCCCCCCoo....',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgGGGGgCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  paladin: makePortrait(
    [
      '.....ooGGGGGGGGoo.....',
      '......oooooooooo......',
      '....oCCCCCCCCCCCCo....',
      '....oGGddddddddGGo....',
      '....oGgweeeeeewgGo....',
      '....oCCgGGGGGGgCCo....',
      '....oCCdssssssdCCo....',
      '.....oCDDDDDDDDCo.....',
      '......oDDDDDDDDo......',
      '.......oooooooo.......',
      '......ooGGGGGGoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooCCCCCCCCCCoo....',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgGGgCCCCCCo..',
    '..oCCCCCCgWWgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  alchemist_hero: makePortrait(
    [
      '.......oooooooo.......',
      '.....ooHHHHHHHHoo.....',
      '....ohHHddddddHHho....',
      '....oggAAAooAAAggo....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgaGGagCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  phantom_thief: makePortrait(
    [
      '......oooooooooo......',
      '......oDDDDDDDDo......',
      '......oCCCCCCCCo......',
      '..ooooDaaaaaaaaDoooo..',
      '.....ohdssssssdho.....',
      '.....oDDweeeewDDo.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
      '......oCCCCCCCCo......',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgWWgCCCaAAo..',
    '..oACCCCgWWWWgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  sphinx_guard: makePortrait(
    [
      '......ooGGGGGGoo......',
      '....ooGGGGGGGGGGoo....',
      '...oGGCCCCCCCCCCGGo...',
      '...oGohdssssssdhoGo...',
      '...oGohwesssswehoGo...',
      '...oGoheesSSseehoGo...',
      '....oGCssssssssCGo....',
      '.....oCDDDDDDDDCo.....',
      '......oDDDDDDDDo......',
      '.......oooooooo.......',
      '......ooGGGGGGoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooGGGGGGGGGGoo....',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgGGgCCCCCCo..',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  cryo_queen: makePortrait(
    [
      '....oo..oooooo..oo....',
      '...oAAooGGGGGGooAAo...',
      '....oGGohHHHHhoGGo....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooAAAAoo.......',
    ],
    '...ooAAcccWWcccAAoo...',
    '..oAAaCCCgWWgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  thunder_monk: makePortrait(
    [
      '......ooAAAAAAoo......',
      '.....oHHHHHHHHHHo.....',
      '....oGGGGGGGGGGGGoo...',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooGGGGoo.......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCccccgGGgCCCCCo...',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgaGGagCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  star_dancer: makePortrait(
    [
      '..oo...oooooooo...oo..',
      '.oAAo.ohHHHHHHho.oAAo.',
      '..oo.ohHHHHHHHHho.oo..',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgaGGagCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  mech_pilot: makePortrait(
    [
      '..oo..............oo..',
      '..oGooooooooooooooGo..',
      '....oCCCCCCCCCCCCo....',
      '....oCDDDDDDDDDDCo....',
      '....oCDaaaaaaaaDCo....',
      '....oCDwAAAAAAwDCo....',
      '....oCDDDDDDDDDDCo....',
      '.....oCDDDDDDDDCo.....',
      '......oDDDDDDDDo......',
      '.......oooooooo.......',
      '......ooGGGGGGoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooCCCCCCCCCCoo....',
    ],
    '...ooCCGGGGGGGGCCoo...',
    '..oCCCCCCgWWgCCCCCCo..',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  blood_hunter: makePortrait(
    [
      '......oooooooooo......',
      '.....ohHHHHHHHHho.....',
      '....ohHHddddddHHho....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '...ooCCCCCCCCCCCCoo...',
      '....oDDDDDDDDDDDDo....',
      '.....oDDDDDDDDDDo.....',
      '......oooooooooo......',
      '.....oCCCCCCCCCCo.....',
      '....oCCCCCCCCCCCCo....',
      '...ooCCCCCCCCCCCCoo...',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  wind_archer: makePortrait(
    [
      '......oooooooo...oo...',
      '.....oDDDDDDDDooAAo...',
      '....oDDDDDDDDDDoAAo...',
      '....oDDdssssssdDDo....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oAAaCCCgGGgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCgaaaaCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  void_walker: makePortrait(
    [
      '..oo..............oo..',
      '.oAAo...oooooo...oAAo.',
      '..oAAooDDDDDDDDooAAo..',
      '....ooooddddddoooo....',
      '....oDDweeeeeewDDo....',
      '....oDDwAAAAAAwDDo....',
      '....oDDDDDDDDDDDDo....',
      '.....oDDDDDDDDDDo.....',
      '......oDDDDDDDDo......',
      '.......oooooooo.......',
      '......ooCCCCCCoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooCCCCCCCCCCoo....',
    ],
    '...ooaaCCCCCCCCaaoo...',
    '..oAAaCCCgAAgCCCaAAo..',
    '..oACCCCgAAAAgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  sun_priest: makePortrait(
    [
      '....ooGGGGGGGGGGoo....',
      '...oGGoHHHHHHHHoGGo...',
      '....oGGddddddddGGo....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooGGGGoo.......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgWWgCCCCCCo..',
    '..oCCCCCCgGGgCCCCCCo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  plague_doc: makePortrait(
    [
      '......oooooooooo......',
      '.....oDDDDDDDDDDo.....',
      '..oooDDggggggggDDooo..',
      '....oDDCCCCCCCCDDo....',
      '....oDDweeeeeewDDo....',
      '....oDDggAAAAggDDo....',
      '.....ooGGAAAAaaao.....',
      '......oDDDDDDDDo......',
      '.......oDDDDDDo.......',
      '........oooooo........',
      '......ooCCCCCCoo......',
      '.....oCCCCCCCCCCo.....',
      '....ooCCCCCCCCCCoo....',
    ],
    '...ooCCCCCCCCCCCCoo...',
    '..oCCaCCCgGGgCCCaCCo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  crystal_mage: makePortrait(
    [
      '.....oo..oooo..oo.....',
      '....oAGooGGGGooGAo....',
      '.....oGohHHHHhoGo.....',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdssssssdho.....',
      '......odssSSssdo......',
      '.......odssssdo.......',
      '........ooSSoo........',
      '........oSSSSo........',
      '.......ooSSSSoo.......',
    ],
    '...ooaACCCCCCCCAAoo...',
    '..oAAaCCCgWWgCCCaAAo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
  storm_king: makePortrait(
    [
      '..oo...oooooooo...oo..',
      '..oGoo.oGGGGGGoo.oGo..',
      '...oGCCCCCCCCCCCCGo...',
      '.....ohdssssssdho.....',
      '.....ohdssssssdho.....',
      '.....ohwessssweho.....',
      '.....oheesSSseeho.....',
      '.....ohdHHHHHHdho.....',
      '......oHHHHHHHHo......',
      '.......ooHHHHoo.......',
      '........oooooo........',
      '.......ooGGGGoo.......',
      '......oCCCCCCCCo......',
    ],
    '...ooGGGCCCCCCGGGoo...',
    '..oGCCCCCgWWgCCCCCCo..',
    '..oACCCCgGGGGgCCCCAo..',
    '..oDDCCCCCCCCCCCCDDo..',
    '..oDDDDDDDDDDDDDDDDo..',
    '...ooDDDDDDDDDDDDoo...'
  ),
};

function drawHeadgearPixels(
  ctx: CanvasRenderingContext2D,
  headgear: string | undefined,
  pal: Record<string, string>,
  cx: number,
  headTopY: number,
  eyeOffsetY = 5
) {
  if (!headgear || headgear === 'none') return;
  const safeTop = Math.max(3, headTopY);
  if (headgear === 'crown') {
    ctx.fillStyle = pal.G || '#ffe066';
    ctx.fillRect(cx - 4, safeTop - 3, 2, 2);
    ctx.fillRect(cx - 1, safeTop - 3, 2, 2);
    ctx.fillRect(cx + 2, safeTop - 3, 2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3.5, safeTop - 3, 1, 0.5);
    ctx.fillRect(cx - 0.5, safeTop - 3, 1, 0.5);
    ctx.fillRect(cx + 2.5, safeTop - 3, 1, 0.5);
    ctx.fillStyle = pal.g || '#d49435';
    ctx.fillRect(cx - 4, safeTop - 1, 8, 1);
  } else if (headgear === 'halo') {
    ctx.fillStyle = pal.G || '#fff7bd';
    ctx.fillRect(cx - 5, safeTop - 3, 10, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, safeTop - 3, 6, 0.5);
    ctx.fillStyle = pal.g || '#ffd24d';
    ctx.fillRect(cx - 6, safeTop - 2, 2, 1);
    ctx.fillRect(cx + 4, safeTop - 2, 2, 1);
  } else if (headgear === 'horns') {
    ctx.fillStyle = pal.g || '#ff4d6d';
    ctx.fillRect(cx - 5, safeTop - 2, 2, 3);
    ctx.fillRect(cx + 3, safeTop - 2, 2, 3);
    ctx.fillStyle = pal.G || '#ffffff';
    ctx.fillRect(cx - 5, safeTop - 2, 1, 1);
    ctx.fillRect(cx + 4, safeTop - 2, 1, 1);
  } else if (headgear === 'ears') {
    ctx.fillStyle = pal.H || '#ffd1dc';
    ctx.fillRect(cx - 5, safeTop - 2, 2, 3);
    ctx.fillRect(cx + 3, safeTop - 2, 2, 3);
    ctx.fillStyle = pal.G || '#ffffff';
    ctx.fillRect(cx - 4, safeTop - 1, 1, 1);
    ctx.fillRect(cx + 3, safeTop - 1, 1, 1);
  } else if (headgear === 'visor') {
    const vy = headTopY + eyeOffsetY;
    ctx.fillStyle = pal.a || '#38bdf8';
    ctx.fillRect(cx - 4, vy, 8, 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 3, vy, 2.5, 0.5);
  } else if (headgear === 'crest') {
    ctx.fillStyle = pal.G || '#ffd27d';
    ctx.fillRect(cx - 1, safeTop - 3, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 0.5, safeTop - 3, 1, 1);
    ctx.fillStyle = pal.a || '#ff5e8e';
    ctx.fillRect(cx - 3, safeTop - 2, 6, 1);
  }
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({
  heroId,
  skinId = 'default',
  size = 64,
  animate = false,
  evolutionTier = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hero = getHeroDef(heroId);
  const skin = getHeroSkinDef(heroId, skinId);

  useEffect(() => {
    let raf = 0;
    let t = 0;
    const render = () => {
      t += 0.05;
      const c = canvasRef.current;
      const ctx = c?.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.clearRect(0, 0, 24, 24);

        // Layered cosmic portrait backdrop + hero aura radial tint
        ctx.fillStyle = '#0c0818';
        ctx.fillRect(0, 0, 24, 24);
        const auraColor = evolutionTier >= 3 ? '#ffe066' : skin.badgeColor;
        const aura = ctx.createRadialGradient(12, 13, 1, 12, 13, 12);
        aura.addColorStop(0, auraColor + (evolutionTier >= 1 ? '70' : '55'));
        aura.addColorStop(0.6, auraColor + '20');
        aura.addColorStop(1, '#0c081800');
        ctx.fillStyle = aura;
        ctx.fillRect(1, 1, 22, 22);

        // Crisp 0.5px inner bevel frame + corner filigree sparkles
        ctx.fillStyle = auraColor + '48';
        ctx.fillRect(1, 1, 22, 0.5);
        ctx.fillRect(1, 1, 0.5, 22);
        ctx.fillStyle = auraColor + '99';
        ctx.fillRect(2, 2, 1.5, 0.5);
        ctx.fillRect(2, 2, 0.5, 1.5);
        ctx.fillRect(20.5, 2, 1.5, 0.5);
        ctx.fillRect(21.5, 2, 0.5, 1.5);

        const pal = buildHeroPalette(heroId, hero.modifiers.baseDashes, false, false, skinId);
        const rows = PORTRAIT_ROWS[heroId] ?? PORTRAIT_ROWS.lyra;
        const bobY = animate ? Math.round(Math.sin(t) * 2) * 0.25 : 0;
        const baseY = 3 + bobY;
        drawPixelSprite(
          ctx,
          `portrait22_v2_${heroId}_${skinId}`,
          rows,
          pal,
          1,
          baseY,
          false,
          1,
          1,
          false
        );
        drawHeadgearPixels(ctx, skin.palette.headgear, { ...pal, a: skin.badgeColor }, 12, baseY, 5);
        if (evolutionTier >= 3) {
          ctx.fillStyle = '#ffe066';
          ctx.fillRect(8, 1, 8, 1);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(10, 1, 4, 0.5);
        } else if (evolutionTier >= 1) {
          ctx.fillStyle = auraColor;
          ctx.fillRect(11, 1.5, 2, 1);
        }
      }
      if (animate) {
        raf = requestAnimationFrame(render);
      }
    };
    render();
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [heroId, skinId, animate, evolutionTier, hero.modifiers.baseDashes, skin]);

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      style={{ width: size, height: size }}
      className={`pixel-canvas block border-2 border-[#07050d] ${className}`}
    />
  );
};

export const HeroFullSpriteCanvas: React.FC<{
  heroId: HeroId;
  skinId?: string;
  evolutionTier?: number;
  size?: number;
}> = ({ heroId, skinId = 'default', evolutionTier = 0, size = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hero = getHeroDef(heroId);
  const skin = getHeroSkinDef(heroId, skinId);

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
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.clearRect(0, 0, 38, 38);

        const evoColor = evolutionTier >= 3 ? '#ffe066' : evolutionTier >= 2 ? hero.accentColor : skin.badgeColor;

        // Soft behind-hero aura halo
        const pulse = 0.8 + 0.2 * Math.sin(t * 2);
        const aura = ctx.createRadialGradient(19, 20, 1, 19, 20, 18);
        aura.addColorStop(0, evoColor + (evolutionTier >= 1 ? '66' : '50'));
        aura.addColorStop(0.55, evoColor + '22');
        aura.addColorStop(1, '#07050d00');
        ctx.globalAlpha = pulse;
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, 38, 38);
        ctx.globalAlpha = 1;

        // Crisp 2-tier sculpted pixel pedestal with 0.5px metallic rim & rune core
        ctx.fillStyle = '#07050d';
        ctx.fillRect(8, 32.5, 22, 4.5);
        ctx.fillStyle = '#1f1738';
        ctx.fillRect(9.5, 33, 19, 2);
        ctx.fillStyle = '#130e24';
        ctx.fillRect(8.5, 35, 21, 2);
        ctx.fillStyle = '#5c4d8a';
        ctx.fillRect(9.5, 33, 19, 0.5);
        ctx.fillStyle = evoColor + '55';
        ctx.fillRect(10.5, 32, 17, 1.5);
        ctx.fillStyle = evoColor + 'cc';
        ctx.fillRect(13, 33, 12, 0.5);
        ctx.fillStyle = '#ffffffaa';
        ctx.fillRect(16, 33, 6, 0.5);

        const frames = HERO_SPRITE_SETS[heroId]?.idle ?? HERO_SPRITE_SETS.lyra.idle;
        const frame = frames[Math.floor(t * 2) % frames.length];
        const pal = buildHeroPalette(heroId, hero.modifiers.baseDashes, false, false, skinId);
        const bob = Math.round(Math.sin(t) * 2) * 0.25;
        const feetY = 33 + bob;

        let firstSolidRow = 0;
        for (let r = 0; r < frame.length; r++) {
          if (/[^.\s]/.test(frame[r])) {
            firstSolidRow = r;
            break;
          }
        }
        const headTopY = feetY - frame.length + firstSolidRow;

        // Behind-hero high-detail evolution layers (wings, mandala, ground halo, rising motes)
        drawHeroEvolutionBackLayers(ctx, {
          heroId,
          tier: evolutionTier,
          time: t,
          cx: 19,
          cy: feetY - 7,
          headTopY,
          feetY,
          facing: 1,
          scale: 1,
        });

        drawPixelSprite(
          ctx,
          `showcase38_${heroId}_${skinId}_${Math.floor(t * 2) % frames.length}`,
          frame,
          pal,
          19,
          feetY,
          false,
          1,
          1,
          true
        );

        const hg = skin.palette.headgear;
        if (hg && hg !== 'none') {
          drawHeadgearPixels(ctx, hg, { ...pal, a: skin.badgeColor }, 19, headTopY, 5);
        }

        // Front-hero evolution adornments (crown, seraph halo, orbital gems)
        drawHeroEvolutionFrontLayers(ctx, {
          heroId,
          tier: evolutionTier,
          time: t,
          cx: 19,
          cy: feetY - 7,
          headTopY,
          feetY,
          facing: 1,
          scale: 1,
        });
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, [heroId, skinId, evolutionTier, hero.modifiers.baseDashes, hero.accentColor, skin]);

  return (
    <canvas
      ref={canvasRef}
      width={76}
      height={76}
      style={{ width: size, height: size }}
      className="pixel-canvas block"
    />
  );
};
