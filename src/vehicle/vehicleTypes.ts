export type VehicleCommand =
  | 'ACCELERATE'
  | 'BRAKE'
  | 'STEER_LEFT'
  | 'STEER_RIGHT'
  | 'SELECT'
  | 'EMERGENCY_STOP'
  | 'IDLE';

export interface VehicleState {
  command: VehicleCommand;
  speed: number; // 0 to 120 km/h
  steering: number; // -1.0 (Full Left) to +1.0 (Full Right), 0.0 is Center
  isEmergencyStopped: boolean;
}
