import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarkerInstance: HandLandmarker | null = null;
let isInitializing = false;
let initPromise: Promise<HandLandmarker> | null = null;

const WASM_FILES_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export async function getHandLandmarker(): Promise<HandLandmarker> {
  if (handLandmarkerInstance) {
    return handLandmarkerInstance;
  }

  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_FILES_URL);

      try {
        handLandmarkerInstance = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_URL,
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          }
        );
      } catch (gpuErr) {
        console.warn('GPU delegate failed, falling back to CPU:', gpuErr);
        handLandmarkerInstance = await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          }
        );
      }

      return handLandmarkerInstance;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

export function disposeHandLandmarker(): void {
  if (handLandmarkerInstance) {
    try {
      handLandmarkerInstance.close();
    } catch (e) {
      console.warn('Error closing HandLandmarker instance:', e);
    }
    handLandmarkerInstance = null;
    initPromise = null;
    isInitializing = false;
  }
}
