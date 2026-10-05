import React from 'react';
import type { HandTrackingStats } from '../types/handTracking';

interface StatusPanelProps {
  stats: HandTrackingStats;
  onResetEmergency: () => void;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  stats,
  onResetEmergency,
}) => {
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
  const vehicle = stats.vehicleState;

  const getCommandBadgeClass = (cmd: string) => {
    switch (cmd) {
      case 'ACCELERATE':
        return 'cmd-accelerate';
      case 'BRAKE':
        return 'cmd-brake';
      case 'EMERGENCY_STOP':
        return 'cmd-emergency';
      case 'SELECT':
        return 'cmd-select';
      case 'IDLE':
      default:
        return 'cmd-idle';
    }
  };

  return (
    <div className={`status-panel ${vehicle.isEmergencyStopped ? 'emergency-active-panel' : ''}`}>
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

      {/* Vehicle Control Section */}
      <div className="vehicle-section">
        <div className="status-header">
          <h3>Vehicle Control</h3>
          <span className="vehicle-sim-tag">Simulation</span>
        </div>

        <div className={`vehicle-card ${vehicle.isEmergencyStopped ? 'emergency-alert-card' : ''}`}>
          <div className="vehicle-main-row">
            <span className="vehicle-label">Vehicle Command</span>
            <span className={`command-badge ${getCommandBadgeClass(vehicle.command)}`}>
              {vehicle.command.replace('_', ' ')}
            </span>
          </div>

          <div className="vehicle-metrics-grid">
            <div className="vehicle-sub-metric">
              <span className="sub-label">Speed</span>
              <span className="sub-value">{vehicle.speed} <small>km/h</small></span>
            </div>

            <div className="vehicle-sub-metric">
              <span className="sub-label">Steering</span>
              <span className="sub-value">
                {vehicle.steering === 0 ? '0° (Center)' : `${vehicle.steering > 0 ? '+' : ''}${vehicle.steering}°`}
              </span>
            </div>

            <div className="vehicle-sub-metric full-width">
              <span className="sub-label">Emergency Status</span>
              <div className="emergency-status-wrapper">
                <span className={`emergency-pill ${vehicle.isEmergencyStopped ? 'engaged' : 'normal'}`}>
                  {vehicle.isEmergencyStopped ? 'ENGAGED' : 'NORMAL'}
                </span>

                {vehicle.isEmergencyStopped && (
                  <button
                    type="button"
                    className="btn-reset-emergency"
                    onClick={onResetEmergency}
                    title="Reset simulated emergency stop state"
                  >
                    RESET EMERGENCY
                  </button>
                )}
              </div>
            </div>
          </div>
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
            <p className="gesture-hint">Show your hand to the camera to drive.</p>
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
