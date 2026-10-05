import type { HandGestureResult } from '../gesture/gestureTypes';
import type { VehicleCommand, VehicleState } from './vehicleTypes';

export class VehicleController {
  private state: VehicleState = {
    command: 'IDLE',
    speed: 0,
    steering: 0,
    isEmergencyStopped: false,
  };

  private maxSpeed = 120; // km/h

  public update(gestures: HandGestureResult[]): VehicleState {
    if (!gestures || gestures.length === 0) {
      return this.step('IDLE');
    }

    const primaryHand = gestures[0];
    const rawGesture = primaryHand ? primaryHand.gesture : 'NONE';

    let command: VehicleCommand = 'IDLE';

    switch (rawGesture) {
      case 'THUMB_UP':
        command = 'ACCELERATE';
        break;
      case 'OPEN_PALM':
        command = 'BRAKE';
        break;
      case 'FIST':
        command = 'EMERGENCY_STOP';
        break;
      case 'PINCH':
        command = 'SELECT';
        break;
      case 'POINT':
      case 'NONE':
      default:
        command = 'IDLE';
        break;
    }

    return this.step(command);
  }

  private step(command: VehicleCommand): VehicleState {
    let { speed, isEmergencyStopped } = this.state;
    const steering = 0.0;

    if (command === 'EMERGENCY_STOP') {
      speed = 0;
      isEmergencyStopped = true;
    } else if (isEmergencyStopped) {
      // While latched in emergency stop, keep speed 0 until resetEmergency() is called
      speed = 0;
    } else {
      switch (command) {
        case 'ACCELERATE':
          speed = Math.min(this.maxSpeed, speed + 1.5);
          break;
        case 'BRAKE':
          speed = Math.max(0, speed - 3.0);
          break;
        case 'SELECT':
        case 'IDLE':
        default:
          speed = Math.max(0, speed - 0.5);
          break;
      }
    }

    const activeCommand = isEmergencyStopped && command !== 'EMERGENCY_STOP' ? 'IDLE' : command;

    this.state = {
      command: activeCommand,
      speed: Math.round(speed),
      steering,
      isEmergencyStopped,
    };

    return this.state;
  }

  /**
   * Explicitly resets the latched emergency stop state.
   * Sets isEmergencyStopped to false, speed to 0, command to IDLE, and steering centered.
   */
  public resetEmergency(): void {
    this.state = {
      command: 'IDLE',
      speed: 0,
      steering: 0,
      isEmergencyStopped: false,
    };
  }

  public reset(): void {
    this.resetEmergency();
  }

  public getState(): VehicleState {
    return this.state;
  }
}
