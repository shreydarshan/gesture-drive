import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { HandGestureResult } from './gestureTypes';
import { distance2D, getFingerStates, getHandScale } from './geometry';

/**
 * Recognizes a gesture from 21 MediaPipe hand landmarks.
 * Pure deterministic geometric rules — no external ML model required.
 */
export function recognizeHandGesture(
  landmarks: NormalizedLandmark[],
  handIndex = 0,
  handednessLabel = 'Right'
): HandGestureResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      handIndex,
      handedness: handednessLabel,
      gesture: 'NONE',
      confidence: 0,
      fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    };
  }

  const handScale = getHandScale(landmarks);
  const fingerStates = getFingerStates(landmarks);

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexTip = landmarks[8];

  // 1. PINCH detection
  // Distance between thumb tip (4) and index tip (8), normalized by hand scale
  const rawPinchDist = distance2D(thumbTip, indexTip);
  const normalizedPinchDist = rawPinchDist / handScale;

  if (normalizedPinchDist < 0.32) {
    const confidence = Number(
      Math.max(0.65, Math.min(0.98, 1.0 - (normalizedPinchDist / 0.32) * 0.35)).toFixed(2)
    );
    return {
      handIndex,
      handedness: handednessLabel,
      gesture: 'PINCH',
      confidence,
      fingerStates,
      pinchDistance: Number(normalizedPinchDist.toFixed(3)),
    };
  }

  const { index, middle, ring, pinky } = fingerStates;

  // 2. THUMB_UP detection
  // Thumb points upward relative to screen space (y=0 is top)
  const isThumbUpward = thumbTip.y < thumbIp.y && thumbIp.y < wrist.y;
  const mainFingersFolded = !index && !middle && !ring && !pinky;

  if (isThumbUpward && mainFingersFolded) {
    const verticalDiff = wrist.y - thumbTip.y;
    const confidence = Number(
      Math.max(0.75, Math.min(0.96, 0.75 + (verticalDiff / handScale) * 0.2)).toFixed(2)
    );
    return {
      handIndex,
      handedness: handednessLabel,
      gesture: 'THUMB_UP',
      confidence,
      fingerStates,
      pinchDistance: Number(normalizedPinchDist.toFixed(3)),
    };
  }

  // 3. POINT detection
  // Index finger extended; middle, ring, pinky folded
  if (index && !middle && !ring && !pinky) {
    return {
      handIndex,
      handedness: handednessLabel,
      gesture: 'POINT',
      confidence: 0.92,
      fingerStates,
      pinchDistance: Number(normalizedPinchDist.toFixed(3)),
    };
  }

  // 4. OPEN_PALM detection
  // All 4 main fingers extended
  if (index && middle && ring && pinky) {
    return {
      handIndex,
      handedness: handednessLabel,
      gesture: 'OPEN_PALM',
      confidence: 0.95,
      fingerStates,
      pinchDistance: Number(normalizedPinchDist.toFixed(3)),
    };
  }

  // 5. FIST detection
  // All 4 main fingers folded
  if (!index && !middle && !ring && !pinky) {
    return {
      handIndex,
      handedness: handednessLabel,
      gesture: 'FIST',
      confidence: 0.90,
      fingerStates,
      pinchDistance: Number(normalizedPinchDist.toFixed(3)),
    };
  }

  // 6. Fallback NONE
  return {
    handIndex,
    handedness: handednessLabel,
    gesture: 'NONE',
    confidence: 0.5,
    fingerStates,
    pinchDistance: Number(normalizedPinchDist.toFixed(3)),
  };
}

/**
 * Process multiple detected hands (up to 2 hands)
 */
export function recognizeMultipleHandGestures(
  landmarksList: NormalizedLandmark[][],
  handednessList?: { displayName?: string; categoryName?: string }[][]
): HandGestureResult[] {
  if (!landmarksList || landmarksList.length === 0) {
    return [];
  }

  return landmarksList.map((landmarks, handIndex) => {
    const label =
      handednessList?.[handIndex]?.[0]?.displayName ||
      handednessList?.[handIndex]?.[0]?.categoryName ||
      (handIndex === 0 ? 'Right' : 'Left');

    return recognizeHandGesture(landmarks, handIndex, label);
  });
}
