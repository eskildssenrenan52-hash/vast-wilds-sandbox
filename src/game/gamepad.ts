// @ts-nocheck -- imported game code, written for a looser TS config
// @ts-nocheck — imported game code, typed under the original looser tsconfig
import { InputState } from './types';

export interface GamepadButtonSample {
  pressed: boolean;
  value?: number;
}

export interface GamepadSnapshot {
  connected: boolean;
  id: string;
  input: InputState;
  pauseJustPressed: boolean;
  mapJustPressed: boolean;
  confirmJustPressed: boolean;
  skipJustPressed: boolean;
  anyPressed: boolean;
}

const STICK_DEADZONE = 0.26;
const TRIGGER_THRESHOLD = 0.45;

const EMPTY_GAMEPAD_INPUT: InputState = {
  left: false,
  right: false,
  up: false,
  down: false,
  jumpHeld: false,
  jumpJustPressed: false,
  dashJustPressed: false,
  grabHeld: false,
  interactJustPressed: false,
  skillJustPressed: false,
};

function isBtnDown(buttons: readonly GamepadButtonSample[], index: number): boolean {
  const b = buttons[index];
  if (!b) return false;
  return Boolean(b.pressed || (typeof b.value === 'number' && b.value > TRIGGER_THRESHOLD));
}

/**
 * Pure decoder transforming raw Web Gamepad API arrays into edge-triggered InputState.
 * Standard mapping (Xbox / PlayStation / Switch Pro / Generic):
 * - Left Stick (axes[0], axes[1]) & D-Pad (12..15): Move & Aim
 * - A / Cross (0): Jump (+ Confirm in dialogue/cutscene)
 * - B / Circle (1): Interact [E]
 * - X / Square (2) or RT / R2 (7): Dash
 * - Y / Triangle (3): Hero Skill [Q]
 * - LB / L1 (4), RB / R1 (5), LT / L2 (6): Grab / Climb
 * - Back / Select (8): Map [M]
 * - Start / Options (9): Pause [Esc] / Skip Cutscene
 */
export function decodeGamepadState(
  buttons: readonly GamepadButtonSample[],
  axes: readonly number[],
  prevButtons: readonly boolean[]
): Omit<GamepadSnapshot, 'connected' | 'id'> {
  const pressedNow = buttons.map((_, i) => isBtnDown(buttons, i));
  const just = (idx: number): boolean => Boolean(pressedNow[idx] && !prevButtons[idx]);

  const axX = axes[0] ?? 0;
  const axY = axes[1] ?? 0;

  // Optional POV Hat fallback on axes[9] used by some DirectInput gamepads
  const hat = axes[9];
  const hatValid = typeof hat === 'number' && hat >= -1 && hat <= 1.05;
  const hatUp = hatValid && (hat < -0.85 || hat > 0.85);
  const hatRight = hatValid && hat > -0.7 && hat < -0.2;
  const hatDown = hatValid && hat > -0.15 && hat < 0.25;
  const hatLeft = hatValid && hat > 0.35 && hat < 0.82;

  const left = axX < -STICK_DEADZONE || isBtnDown(buttons, 14) || hatLeft;
  const right = axX > STICK_DEADZONE || isBtnDown(buttons, 15) || hatRight;
  const up = axY < -STICK_DEADZONE || isBtnDown(buttons, 12) || hatUp;
  const down = axY > STICK_DEADZONE || isBtnDown(buttons, 13) || hatDown;

  const jumpHeld = Boolean(pressedNow[0]);
  const jumpJustPressed = just(0);
  const dashJustPressed = just(2) || just(7);
  const grabHeld = Boolean(pressedNow[4] || pressedNow[5] || pressedNow[6]);
  const interactJustPressed = just(1);
  const skillJustPressed = just(3);

  const pauseJustPressed = just(9);
  const mapJustPressed = just(8);
  const confirmJustPressed = just(0) || just(1) || just(2);
  const skipJustPressed = just(9) || just(8);
  const anyPressed =
    pressedNow.some(Boolean) ||
    Math.abs(axX) > STICK_DEADZONE ||
    Math.abs(axY) > STICK_DEADZONE;

  return {
    input: {
      left,
      right,
      up,
      down,
      jumpHeld,
      jumpJustPressed,
      dashJustPressed,
      grabHeld,
      interactJustPressed,
      skillJustPressed,
    },
    pauseJustPressed,
    mapJustPressed,
    confirmJustPressed,
    skipJustPressed,
    anyPressed,
  };
}

let prevButtonStates: boolean[] = [];

export function resetGamepadEdgeCache(): void {
  prevButtonStates = [];
}

export function pollPrimaryGamepad(): GamepadSnapshot {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return {
      connected: false,
      id: '',
      input: { ...EMPTY_GAMEPAD_INPUT },
      pauseJustPressed: false,
      mapJustPressed: false,
      confirmJustPressed: false,
      skipJustPressed: false,
      anyPressed: false,
    };
  }

  let pads: (Gamepad | null)[] = [];
  try {
    pads = Array.from(navigator.getGamepads() ?? []);
  } catch {
    pads = [];
  }

  const active = pads.find((p) => p && p.connected);
  if (!active) {
    prevButtonStates = [];
    return {
      connected: false,
      id: '',
      input: { ...EMPTY_GAMEPAD_INPUT },
      pauseJustPressed: false,
      mapJustPressed: false,
      confirmJustPressed: false,
      skipJustPressed: false,
      anyPressed: false,
    };
  }

  const decoded = decodeGamepadState(active.buttons, active.axes, prevButtonStates);
  prevButtonStates = active.buttons.map((_, i) => isBtnDown(active.buttons, i));

  return {
    connected: true,
    id: active.id || 'Gamepad Padrão',
    ...decoded,
  };
}

export function triggerGamepadRumble(
  durationMs = 95,
  weakMagnitude = 0.25,
  strongMagnitude = 0.45
): void {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
  try {
    const pads = Array.from(navigator.getGamepads() ?? []);
    const active = pads.find((p) => p && p.connected);
    const actuator = active?.vibrationActuator;
    if (actuator && typeof actuator.playEffect === 'function') {
      void actuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: Math.max(20, Math.min(400, durationMs)),
        weakMagnitude: Math.max(0, Math.min(1, weakMagnitude)),
        strongMagnitude: Math.max(0, Math.min(1, strongMagnitude)),
      });
    }
  } catch {
    // Ignore unsupported browser rumble implementations
  }
}
