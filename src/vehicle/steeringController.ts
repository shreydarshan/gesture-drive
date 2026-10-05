import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { SteeringDirection } from './vehicleTypes';

export interface SteeringResult {
  steering: number; // -1.0 (Full Left) to +1.0 (Full Right)
  steeringAngle: number; // -30° to +30°
  steeringDirection: SteeringDirection;
}

export class SteeringController {
  private currentAngle = 0; // Current smoothed angle in degrees (-30 to +30)
  private smoothingAlpha = 0.25; // Exponential smoothing factor (0.0 = static, 1.0 = instant)
  private deadZoneDegrees = 3.0; // Angle dead zone around center (degrees)
  private maxAngleDegrees = 30.0; // Maximum steering angle boundary (degrees)

  public update(landmarks?: NormalizedLandmark[]): SteeringResult {
    let targetAngle = 0;

    if (landmarks && landmarks.length >= 10) {
      const wrist = landmarks[0];
      const middleMcp = landmarks[9];

      // Delta x and y in normalized screen space
      const dx = middleMcp.x - wrist.x;
      const dy = middleMcp.y - wrist.y;

      // Calculate tilt angle relative to vertical axis (-dy is pointing upwards)
      // Negate angle so user tilting hand towards screen-right yields positive (RIGHT) angle
      const rawAngleRad = -Math.atan2(dx, -dy);
      const rawAngleDeg = (rawAngleRad * 180) / Math.PI;

      // Apply dead zone around 0° center
      if (Math.abs(rawAngleDeg) <= this.deadZoneDegrees) {
        targetAngle = 0;
      } else if (rawAngleDeg > this.deadZoneDegrees) {
        targetAngle = rawAngleDeg - this.deadZoneDegrees;
      } else {
        targetAngle = rawAngleDeg + this.deadZoneDegrees;
      }

      // Clamp target angle within [-30°, +30°]
      targetAngle = Math.max(-this.maxAngleDegrees, Math.min(this.maxAngleDegrees, targetAngle));
    }

    // Apply exponential moving average (EMA) smoothing filter
    this.currentAngle =
      this.smoothingAlpha * targetAngle + (1 - this.smoothingAlpha) * this.currentAngle;

    // Small snap to zero when very close to center
    if (Math.abs(this.currentAngle) < 0.1) {
      this.currentAngle = 0;
    }

    const steeringAngle = Math.round(this.currentAngle);
    const steering = Number((this.currentAngle / this.maxAngleDegrees).toFixed(2));

    let steeringDirection: SteeringDirection = 'CENTER';
    if (steeringAngle < -3) {
      steeringDirection = 'LEFT';
    } else if (steeringAngle > 3) {
      steeringDirection = 'RIGHT';
    }

    return {
      steering,
      steeringAngle,
      steeringDirection,
    };
  }

  public reset(): void {
    this.currentAngle = 0;
  }

  public getState(): SteeringResult {
    const steeringAngle = Math.round(this.currentAngle);
    const steering = Number((this.currentAngle / this.maxAngleDegrees).toFixed(2));
    let steeringDirection: SteeringDirection = 'CENTER';

    if (steeringAngle < -3) {
      steeringDirection = 'LEFT';
    } else if (steeringAngle > 3) {
      steeringDirection = 'RIGHT';
    }

    return {
      steering,
      steeringAngle,
      steeringDirection,
    };
  }
}
