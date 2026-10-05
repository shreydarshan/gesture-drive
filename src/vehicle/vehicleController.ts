import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { HandGestureResult } from '../gesture/gestureTypes';
import type { VehicleCommand, VehicleState } from './vehicleTypes';
import { SteeringController } from './steeringController';
import { SafetyController } from './safetyController';

export class VehicleController {
  private steeringController = new SteeringController();
  private safetyController = new SafetyController(60, 500); // 60% confidence threshold, 500ms timeout

  private state: VehicleState = {
    command: 'IDLE',
    speed: 0,
    steering: 0,
    steeringAngle: 0,
    steeringDirection: 'CENTER',
    isEmergencyStopped: false,
    safetyState: 'ACTIVE',
    safetyReason: 'NONE',
  };

  private maxSpeed = 120; // km/h

  public update(
    gestures: HandGestureResult[],
    rawLandmarksList?: NormalizedLandmark[][],
    trackingConfidence: number | null = null,
    timestamp: number = performance.now()
  ): VehicleState {
    const primaryLandmarks = rawLandmarksList?.[0];
    const handDetected = Boolean(gestures && gestures.length > 0 && primaryLandmarks);

    const primaryHand = gestures[0];
    const rawGesture = primaryHand ? primaryHand.gesture : 'NONE';

    let requestedCommand: VehicleCommand = 'IDLE';

    switch (rawGesture) {
      case 'THUMB_UP':
        requestedCommand = 'ACCELERATE';
        break;
      case 'OPEN_PALM':
        requestedCommand = 'BRAKE';
        break;
      case 'FIST':
        requestedCommand = 'EMERGENCY_STOP';
        break;
      case 'PINCH':
        requestedCommand = 'SELECT';
        break;
      case 'POINT':
      case 'NONE':
      default:
        requestedCommand = 'IDLE';
        break;
    }

    // 1. Check for Emergency Stop trigger
    if (requestedCommand === 'EMERGENCY_STOP') {
      this.state.isEmergencyStopped = true;
    }

    // 2. Safety Layer Evaluation
    const safety = this.safetyController.evaluate(
      handDetected,
      trackingConfidence,
      timestamp,
      this.state.isEmergencyStopped
    );

    // 3. Command determination
    let activeCommand = requestedCommand;

    if (this.state.isEmergencyStopped) {
      activeCommand = 'EMERGENCY_STOP';
    } else if (!safety.isSafeToDrive) {
      activeCommand = 'IDLE'; // Fallback to safe coasting
    }

    // 4. Speed state transition
    let { speed } = this.state;

    if (activeCommand === 'EMERGENCY_STOP') {
      speed = 0;
    } else {
      switch (activeCommand) {
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

    // 5. Steering state transition
    let steering = 0.0;
    let steeringAngle = 0;
    let steeringDirection: VehicleState['steeringDirection'] = 'CENTER';

    if (!safety.isSafeToDrive || this.state.isEmergencyStopped) {
      // Return steering safely to CENTER when tracking is invalid or emergency is engaged
      this.steeringController.reset();
    } else {
      const steeringResult = this.steeringController.update(primaryLandmarks);
      steering = steeringResult.steering;
      steeringAngle = steeringResult.steeringAngle;
      steeringDirection = steeringResult.steeringDirection;
    }

    this.state = {
      command: activeCommand,
      speed: Math.round(speed * 10) / 10,
      steering,
      steeringAngle,
      steeringDirection,
      isEmergencyStopped: this.state.isEmergencyStopped,
      safetyState: safety.safetyState,
      safetyReason: safety.safetyReason,
    };

    return this.state;
  }

  /**
   * Explicitly resets the latched emergency stop state and safety evaluation.
   */
  public resetEmergency(): void {
    this.steeringController.reset();
    this.safetyController.reset();
    this.state = {
      command: 'IDLE',
      speed: 0,
      steering: 0,
      steeringAngle: 0,
      steeringDirection: 'CENTER',
      isEmergencyStopped: false,
      safetyState: 'ACTIVE',
      safetyReason: 'NONE',
    };
  }

  public reset(): void {
    this.resetEmergency();
  }

  public getState(): VehicleState {
    return this.state;
  }
}
