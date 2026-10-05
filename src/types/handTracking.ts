import type { HandGestureResult } from '../gesture/gestureTypes';
import type { VehicleState } from '../vehicle/vehicleTypes';

export type CameraStatus =
  | 'idle'
  | 'initializing'
  | 'active'
  | 'error'
  | 'no-camera'
  | 'denied';

export interface HandTrackingStats {
  status: CameraStatus;
  errorMessage: string | null;
  handDetected: boolean;
  numHands: number;
  confidence: number | null;
  fps: number;
  isModelLoading: boolean;
  gestures: HandGestureResult[];
  vehicleState: VehicleState;
}
