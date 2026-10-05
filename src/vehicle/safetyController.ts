import type { SafetyReason, SafetyState } from './vehicleTypes';

export interface SafetyEvaluation {
  safetyState: SafetyState;
  safetyReason: SafetyReason;
  isSafeToDrive: boolean;
}

export class SafetyController {
  private minConfidenceThreshold: number; // Percentage threshold (e.g. 60%)
  private commandTimeoutMs: number; // Timeout in ms (e.g. 500ms)
  private lastValidInputTime = 0;

  constructor(minConfidenceThreshold = 60, commandTimeoutMs = 500) {
    this.minConfidenceThreshold = minConfidenceThreshold;
    this.commandTimeoutMs = commandTimeoutMs;
  }

  public evaluate(
    handDetected: boolean,
    confidence: number | null,
    now: number = performance.now(),
    isEmergencyLatched = false
  ): SafetyEvaluation {
    // 1. Highest Priority: Emergency Stop Latched
    if (isEmergencyLatched) {
      return {
        safetyState: 'EMERGENCY_STOP',
        safetyReason: 'EMERGENCY_LATCHED',
        isSafeToDrive: false,
      };
    }

    // 2. Hand Loss Check
    if (!handDetected) {
      if (
        this.lastValidInputTime > 0 &&
        now - this.lastValidInputTime > this.commandTimeoutMs
      ) {
        return {
          safetyState: 'SAFE_FALLBACK',
          safetyReason: 'CONTROL_TIMEOUT',
          isSafeToDrive: false,
        };
      }
      return {
        safetyState: 'SAFE_FALLBACK',
        safetyReason: 'HAND_NOT_DETECTED',
        isSafeToDrive: false,
      };
    }

    // 3. Low Confidence Check
    const confValue = confidence ?? 0;
    if (confValue < this.minConfidenceThreshold) {
      if (
        this.lastValidInputTime > 0 &&
        now - this.lastValidInputTime > this.commandTimeoutMs
      ) {
        return {
          safetyState: 'SAFE_FALLBACK',
          safetyReason: 'CONTROL_TIMEOUT',
          isSafeToDrive: false,
        };
      }
      return {
        safetyState: 'SAFE_FALLBACK',
        safetyReason: 'LOW_CONFIDENCE',
        isSafeToDrive: false,
      };
    }

    // 4. Valid Input: Update Timestamp & Active State
    this.lastValidInputTime = now;

    return {
      safetyState: 'ACTIVE',
      safetyReason: 'NONE',
      isSafeToDrive: true,
    };
  }

  public reset(): void {
    this.lastValidInputTime = 0;
  }
}
