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
          <span className="metric-label">Confidence</span>
          <span className="metric-value">
            {stats.confidence !== null ? `${stats.confidence}%` : 'N/A'}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">FPS</span>
          <span className="metric-value fps-value">{stats.fps}</span>
        </div>
      </div>
    </div>
  );
};
