import { useCallback, useEffect, useRef, useState } from 'react';
import type { CameraStatus, HandTrackingStats } from '../types/handTracking';
import { drawHandLandmarks } from '../lib/drawing';
import { disposeHandLandmarker, getHandLandmarker } from '../lib/mediapipe';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import { recognizeMultipleHandGestures } from '../gesture/gestureRecognizer';
import { GestureDebouncer } from '../gesture/gestureDebouncer';
import { VehicleController } from '../vehicle/vehicleController';

const INITIAL_VEHICLE_STATE = {
  command: 'IDLE' as const,
  speed: 0,
  steering: 0,
  isEmergencyStopped: false,
};

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stats, setStats] = useState<HandTrackingStats>({
    status: 'idle',
    errorMessage: null,
    handDetected: false,
    numHands: 0,
    confidence: null,
    fps: 0,
    isModelLoading: false,
    gestures: [],
    vehicleState: INITIAL_VEHICLE_STATE,
  });

  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const debouncerRef = useRef<GestureDebouncer>(new GestureDebouncer(5));
  const vehicleControllerRef = useRef<VehicleController>(new VehicleController());
  const lastVideoTimeRef = useRef<number>(-1);
  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const processFrameRef = useRef<(() => void) | null>(null);

  // Helper to safely update stats state
  const updateStats = useCallback((partial: Partial<HandTrackingStats>) => {
    if (!isMountedRef.current) return;
    setStats((prev) => ({ ...prev, ...partial }));
  }, []);

  // Explicit Emergency Reset handler
  const resetEmergency = useCallback(() => {
    vehicleControllerRef.current.resetEmergency();
    const updatedState = vehicleControllerRef.current.getState();
    updateStats({ vehicleState: updatedState });
  }, [updateStats]);

  // Stop Camera function
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    debouncerRef.current.reset();
    vehicleControllerRef.current.reset();
    lastVideoTimeRef.current = -1;

    updateStats({
      status: 'idle',
      errorMessage: null,
      handDetected: false,
      numHands: 0,
      confidence: null,
      fps: 0,
      gestures: [],
      vehicleState: INITIAL_VEHICLE_STATE,
    });
  }, [updateStats]);

  // Main processing frame loop function
  const processFrame = useCallback(() => {
    if (!isMountedRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (video && canvas && landmarker && video.readyState >= 2) {
      if (video.videoWidth && video.videoHeight) {
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      }

      const currentTime = video.currentTime;
      if (currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = currentTime;

        try {
          const startTimeMs = performance.now();
          const results = landmarker.detectForVideo(video, startTimeMs);

          // Calculate FPS
          frameCountRef.current++;
          const now = performance.now();
          if (lastFpsTimeRef.current === 0) {
            lastFpsTimeRef.current = now;
          }
          const elapsed = now - lastFpsTimeRef.current;
          if (elapsed >= 500) {
            const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
            frameCountRef.current = 0;
            lastFpsTimeRef.current = now;
            updateStats({ fps: currentFps });
          }

          // Process detection & gestures
          const detectedHandsCount = results.landmarks ? results.landmarks.length : 0;
          const hasHands = detectedHandsCount > 0;

          let avgConfidence: number | null = null;
          if (results.handedness && results.handedness.length > 0) {
            const totalScore = results.handedness.reduce((acc, hand) => {
              const score = hand[0]?.score || 0;
              return acc + score;
            }, 0);
            avgConfidence = Math.round((totalScore / results.handedness.length) * 100);
          }

          // Gesture recognition & temporal debouncing
          const rawGestures = recognizeMultipleHandGestures(
            results.landmarks,
            results.handedness
          );
          const stabilizedGestures = debouncerRef.current.process(rawGestures);

          // Vehicle control state engine
          const vehicleState = vehicleControllerRef.current.update(stabilizedGestures);

          updateStats({
            handDetected: hasHands,
            numHands: detectedHandsCount,
            confidence: avgConfidence,
            gestures: stabilizedGestures,
            vehicleState,
          });

          // Draw landmarks on overlay canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawHandLandmarks(ctx, results.landmarks, results.handedness);
          }
        } catch (err) {
          console.error('HandLandmarker detection error:', err);
        }
      }
    }

    if (isMountedRef.current && streamRef.current) {
      animFrameIdRef.current = requestAnimationFrame(() => {
        processFrameRef.current?.();
      });
    }
  }, [updateStats]);

  useEffect(() => {
    processFrameRef.current = processFrame;
  }, [processFrame]);

  // Start Camera function
  const startCamera = useCallback(async () => {
    stopCamera();

    updateStats({
      status: 'initializing',
      errorMessage: null,
      isModelLoading: true,
    });

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      updateStats({
        status: 'error',
        errorMessage: 'MediaDevices API is not supported in this browser environment.',
        isModelLoading: false,
      });
      return;
    }

    try {
      const landmarker = await getHandLandmarker();
      landmarkerRef.current = landmarker;
      updateStats({ isModelLoading: false });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      updateStats({
        status: 'active',
        errorMessage: null,
      });

      frameCountRef.current = 0;
      lastFpsTimeRef.current = performance.now();
      animFrameIdRef.current = requestAnimationFrame(() => {
        processFrameRef.current?.();
      });
    } catch (err: unknown) {
      console.error('Error starting camera or initializing MediaPipe:', err);
      let status: CameraStatus = 'error';
      let message = 'Failed to access camera.';

      if (err instanceof DOMException) {
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError'
        ) {
          status = 'denied';
          message =
            'Camera permission denied. Please grant camera permissions in your browser address bar to use GestureDrive.';
        } else if (
          err.name === 'NotFoundError' ||
          err.name === 'DevicesNotFoundError'
        ) {
          status = 'no-camera';
          message =
            'No webcam detected on your device. Please attach a camera and try again.';
        } else if (
          err.name === 'NotReadableError' ||
          err.name === 'TrackStartError'
        ) {
          status = 'error';
          message =
            'Camera is currently in use by another application or system process.';
        } else {
          message = err.message || message;
        }
      } else if (err instanceof Error) {
        message = err.message || message;
      }

      updateStats({
        status,
        errorMessage: message,
        isModelLoading: false,
      });
    }
  }, [stopCamera, updateStats]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      stopCamera();
      disposeHandLandmarker();
    };
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    stats,
    startCamera,
    stopCamera,
    resetEmergency,
  };
}
