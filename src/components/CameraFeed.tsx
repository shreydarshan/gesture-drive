import React, { type RefObject } from 'react';
import type { HandTrackingStats } from '../types/handTracking';

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  stats: HandTrackingStats;
  onStart: () => void;
  onStop: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  videoRef,
  canvasRef,
  stats,
  onStart,
  onStop,
}) => {
  const isRunning = stats.status === 'active' || stats.status === 'initializing';

  return (
    <div className="camera-section">
      <div className="viewport-container">
        {/* Mirrored video element */}
        <video
          ref={videoRef}
          className={`camera-video ${isRunning ? 'visible' : 'hidden'}`}
          playsInline
          muted
        />

        {/* Overlay canvas for 21 hand landmarks */}
        <canvas
          ref={canvasRef}
          className={`landmarks-overlay ${isRunning ? 'visible' : 'hidden'}`}
        />

        {/* Loading overlay */}
        {stats.isModelLoading && (
          <div className="viewport-overlay-message">
            <div className="spinner"></div>
            <p>Initializing MediaPipe Hand Landmarker...</p>
          </div>
        )}

        {/* Error / Denial message */}
        {stats.errorMessage && stats.status !== 'initializing' && (
          <div className="viewport-overlay-error">
            <div className="error-icon">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h4>Camera Error</h4>
            <p>{stats.errorMessage}</p>
          </div>
        )}

        {/* Idle placeholder state */}
        {stats.status === 'idle' && !stats.errorMessage && (
          <div className="viewport-idle">
            <div className="camera-icon-wrapper">
              <svg
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <h3>Camera is Turned Off</h3>
            <p>Click "Start Camera" to initialize real-time hand landmark tracking.</p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="controls-bar">
        {!isRunning ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onStart}
            disabled={stats.status === 'initializing'}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {stats.status === 'initializing' ? 'Starting...' : 'Start Camera'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-danger"
            onClick={onStop}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};
