import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FingerState } from './gestureTypes';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Compute 2D Euclidean distance between two points
export function distance2D(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Compute 3D Euclidean distance between two points
export function distance3D(p1: Point3D, p2: Point3D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Reference length of the hand to ensure scale-invariant distance measurements
// Uses distance between Wrist (0) and Middle MCP (9)
export function getHandScale(landmarks: NormalizedLandmark[]): number {
  if (!landmarks || landmarks.length < 10) return 1.0;
  const scale = distance2D(landmarks[0], landmarks[9]);
  return scale > 0.001 ? scale : 1.0;
}

// Determine finger extension states for all 5 digits
export function getFingerStates(landmarks: NormalizedLandmark[]): FingerState {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false };
  }

  const wrist = landmarks[0];

  // Helper for 4 main fingers (Index, Middle, Ring, Pinky)
  const isFingerExtended = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
    const tip = landmarks[tipIdx];
    const pip = landmarks[pipIdx];
    const mcp = landmarks[mcpIdx];

    const distTipWrist = distance2D(tip, wrist);
    const distPipWrist = distance2D(pip, wrist);

    const distTipMcp = distance2D(tip, mcp);
    const distPipMcp = distance2D(pip, mcp);

    return distTipWrist > distPipWrist && distTipMcp > 1.1 * distPipMcp;
  };

  const index = isFingerExtended(8, 6, 5);
  const middle = isFingerExtended(12, 10, 9);
  const ring = isFingerExtended(16, 14, 13);
  const pinky = isFingerExtended(20, 18, 17);

  // Thumb extension state
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const pinkyMcp = landmarks[17];

  const distThumbTipPinky = distance2D(thumbTip, pinkyMcp);
  const distThumbIpPinky = distance2D(thumbIp, pinkyMcp);
  const distThumbTipWrist = distance2D(thumbTip, wrist);
  const distThumbIpWrist = distance2D(thumbIp, wrist);

  const thumb = distThumbTipPinky > distThumbIpPinky * 1.15 && distThumbTipWrist > distThumbIpWrist;

  return { thumb, index, middle, ring, pinky };
}
