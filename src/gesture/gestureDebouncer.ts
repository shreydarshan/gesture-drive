import type { GestureType, HandGestureResult } from './gestureTypes';

export class GestureDebouncer {
  private history: Map<number, GestureType[]> = new Map();
  private lastStable: Map<number, HandGestureResult> = new Map();
  private windowSize: number;

  constructor(windowSize = 5) {
    this.windowSize = windowSize;
  }

  public process(rawResults: HandGestureResult[]): HandGestureResult[] {
    const currentHandIndices = new Set(rawResults.map((r) => r.handIndex));

    // Clear history for hands that disappeared
    for (const handIndex of this.history.keys()) {
      if (!currentHandIndices.has(handIndex)) {
        this.history.delete(handIndex);
        this.lastStable.delete(handIndex);
      }
    }

    return rawResults.map((raw) => {
      const { handIndex, gesture } = raw;

      if (!this.history.has(handIndex)) {
        this.history.set(handIndex, []);
      }

      const buffer = this.history.get(handIndex)!;
      buffer.push(gesture);

      if (buffer.length > this.windowSize) {
        buffer.shift();
      }

      // Count gesture occurrences in window
      const counts = new Map<GestureType, number>();
      for (const g of buffer) {
        counts.set(g, (counts.get(g) || 0) + 1);
      }

      // Find dominant gesture in window
      let dominantGesture: GestureType = gesture;
      let maxCount = 0;

      for (const [g, count] of counts.entries()) {
        if (count > maxCount) {
          maxCount = count;
          dominantGesture = g;
        }
      }

      // Require at least majority (3 out of 5 frames) to switch gesture
      const threshold = Math.ceil(this.windowSize / 2);
      const stableGesture = maxCount >= threshold ? dominantGesture : (this.lastStable.get(handIndex)?.gesture || gesture);

      const result: HandGestureResult = {
        ...raw,
        gesture: stableGesture,
      };

      this.lastStable.set(handIndex, result);
      return result;
    });
  }

  public reset(): void {
    this.history.clear();
    this.lastStable.clear();
  }
}
