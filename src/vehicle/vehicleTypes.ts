export type VehicleCommand =
  | 'ACCELERATE'
  | 'BRAKE'
  | 'STEER_LEFT'
  | 'STEER_RIGHT'
  | 'SELECT'
  | 'EMERGENCY_STOP'
  | 'IDLE';

export type SteeringDirection = 'LEFT' | 'CENTER' | 'RIGHT';

export type SafetyState = 'ACTIVE' | 'SAFE_FALLBACK' | 'EMERGENCY_STOP';

export type SafetyReason =
  | 'NONE'
  | 'HAND_NOT_DETECTED'
  | 'LOW_CONFIDENCE'
  | 'CONTROL_TIMEOUT'
  | 'EMERGENCY_LATCHED';

export interface VehicleState {
  command: VehicleCommand;
  speed: number; // 0 to 120 km/h
  steering: number; // -1.0 (Full Left) to +1.0 (Full Right), 0.0 is Center
  steeringAngle: number; // -30° (Full Left) to +30° (Full Right), 0° is Center
  steeringDirection: SteeringDirection;
  isEmergencyStopped: boolean;
  safetyState: SafetyState;
  safetyReason: SafetyReason;
}
