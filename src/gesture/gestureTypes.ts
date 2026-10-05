export type GestureType =
  | 'NONE'
  | 'OPEN_PALM'
  | 'FIST'
  | 'POINT'
  | 'PINCH'
  | 'THUMB_UP';

export interface FingerState {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface HandGestureResult {
  handIndex: number;
  handedness: string;
  gesture: GestureType;
  confidence: number; // 0.0 to 1.0
  fingerStates: FingerState;
  pinchDistance?: number;
}
