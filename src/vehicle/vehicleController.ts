import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { HandGestureResult } from '../gesture/gestureTypes';
import type { VehicleCommand, VehicleState } from './vehicleTypes';
import { SteeringController } from './steeringController';

export class VehicleController {
  private steeringController = new SteeringController();

  private state: VehicleState = {
    command: 'IDLE',
    speed: 0,
    steering: 0,
    steeringAngle: 0,
    steeringDirection: 'CENTER',
    isEmergencyStopped: false,
  };

  private maxSpeed = 120; // km/h

  public update(
    gestures: HandGestureResult[],
    rawLandmarksList?: NormalizedLandmark[][]
  ): VehicleState {
    const primaryLandmarks = rawLandmarksList?.[0];

    if (!gestures || gestures.length === 0) {
      return this.step('IDLE', primaryLandmarks);
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

    return this.step(command, primaryLandmarks);
  }

  private step(
    command: VehicleCommand,
    primaryLandmarks?: NormalizedLandmark[]
  ): VehicleState {
    let { speed, isEmergencyStopped } = this.state;

    if (command === 'EMERGENCY_STOP') {
      speed = 0;
      isEmergencyStopped = true;
    } else if (isEmergencyStopped) {
      // While emergency stop is latched, speed must remain 0
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

    // Steering calculation
    let steering = 0.0;
    let steeringAngle = 0;
    let steeringDirection: VehicleState['steeringDirection'] = 'CENTER';

    if (isEmergencyStopped) {
      // Emergency forces steering safely to 0° / Center
      this.steeringController.reset();
    } else {
      const steeringResult = this.steeringController.update(primaryLandmarks);
      steering = steeringResult.steering;
      steeringAngle = steeringResult.steeringAngle;
      steeringDirection = steeringResult.steeringDirection;
    }

    const activeCommand =
      isEmergencyStopped && command !== 'EMERGENCY_STOP' ? 'IDLE' : command;

    this.state = {
      command: activeCommand,
      speed: Math.round(speed),
      steering,
      steeringAngle,
      steeringDirection,
      isEmergencyStopped,
    };

    return this.state;
  }

  /**
   * Explicitly resets the latched emergency stop state.
   * Sets isEmergencyStopped to false, speed to 0, command to IDLE, and steering centered.
   */
  public resetEmergency(): void {
    this.steeringController.reset();
    this.state = {
      command: 'IDLE',
      speed: 0,
      steering: 0,
      steeringAngle: 0,
      steeringDirection: 'CENTER',
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
