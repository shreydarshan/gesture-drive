import React from 'react';
import type { HandTrackingStats } from '../types/handTracking';

interface StatusPanelProps {
  stats: HandTrackingStats;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ stats }) => {
  const getStatusBadge = () => {
    switch (stats.status) {
      case 'active':
        return { text: 'Active', class: 'status-active' };
      case 'initializing':
        return { text: 'Initializing...', class: 'status-initializing' };
      case 'denied':
        return { text: 'Permission Denied', class: 'status-error' };
      case 'no-camera':
        return { text: 'No Camera Found', class: 'status-error' };
      case 'error':
        return { text: 'Error', class: 'status-error' };
      case 'idle':
      default:
        return { text: 'Camera Off', class: 'status-idle' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="status-panel">
      {/* Tracking Metrics */}
      <div className="status-header">
        <h3>Tracking Metrics</h3>
        <span className={`status-pill ${statusBadge.class}`}>
          <span className="status-dot"></span>
          {statusBadge.text}
        </span>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Hand Detected</span>
          <span
            className={`metric-value ${
              stats.handDetected ? 'highlight-positive' : ''
            }`}
          >
            {stats.handDetected ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Hands Count</span>
          <span className="metric-value">{stats.numHands} / 2</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">Tracking Confidence</span>
          <span className="metric-value">
            {stats.confidence !== null ? `${stats.confidence}%` : 'N/A'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">FPS</span>
          <span className="metric-value fps-value">{stats.fps}</span>
        </div>
      </div>

      {/* Gesture Recognition Engine Section */}
      <div className="gesture-section">
        <div className="status-header">
          <h3>Gesture Recognition</h3>
          <span className="gesture-engine-tag">Engine v1.0</span>
        </div>

        {stats.gestures.length === 0 ? (
          <div className="gesture-card empty-gesture">
            <div className="gesture-main-row">
              <span className="gesture-label">Gesture</span>
              <span className="gesture-value gesture-none">NONE</span>
            </div>
            <p className="gesture-hint">Show your hand to the camera to detect gestures.</p>
          </div>
        ) : (
          stats.gestures.map((res) => (
            <div key={res.handIndex} className="gesture-card">
              <div className="gesture-card-header">
                <span className="hand-label">
                  Hand {res.handIndex + 1} ({res.handedness})
                </span>
                <span className="confidence-pill">
                  {Math.round(res.confidence * 100)}% match
                </span>
              </div>

              <div className="gesture-main-row">
                <span className="gesture-label">Gesture</span>
                <span className={`gesture-value ${res.gesture !== 'NONE' ? 'gesture-active' : 'gesture-none'}`}>
                  {res.gesture}
                </span>
              </div>

              {/* Visual Debugging: Finger Extension States */}
              <div className="debug-finger-states">
                <span className="debug-title">Finger States:</span>
                <div className="finger-pills">
                  <FingerPill label="Thumb" active={res.fingerStates.thumb} />
                  <FingerPill label="Index" active={res.fingerStates.index} />
                  <FingerPill label="Middle" active={res.fingerStates.middle} />
                  <FingerPill label="Ring" active={res.fingerStates.ring} />
                  <FingerPill label="Pinky" active={res.fingerStates.pinky} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FingerPill: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <span className={`finger-badge ${active ? 'active' : 'folded'}`}>
    {label}: {active ? 'Ext' : 'Fold'}
  </span>
);
