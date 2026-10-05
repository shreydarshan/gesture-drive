import React from 'react';
import type { VehicleState } from '../vehicle/vehicleTypes';

interface TelemetryHUDProps {
  vehicleState: VehicleState;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ vehicleState }) => {
  const {
    speed,
    steeringAngle,
    steeringDirection,
    command,
    safetyState,
    safetyReason,
    isEmergencyStopped,
  } = vehicleState;

  // Calculate percentage of max speed (0-120 km/h)
  const speedPercentage = Math.min(100, Math.max(0, (speed / 120) * 100));

  // Calculate steering percentage offset (-30° to +30° -> -100% to +100%)
  const steeringPercent = (steeringAngle / 30) * 100;

  const getSafetyBadgeInfo = () => {
    if (isEmergencyStopped || safetyState === 'EMERGENCY_STOP') {
      return {
        label: 'EMERGENCY STOP',
        class: 'hud-safety-emergency',
        hint: 'Emergency latch engaged',
      };
    }
    if (safetyState === 'SAFE_FALLBACK') {
      let hintText = 'Hand not detected';
      if (safetyReason === 'LOW_CONFIDENCE') hintText = 'Low confidence (<60%)';
      if (safetyReason === 'CONTROL_TIMEOUT') hintText = 'Control timeout (>500ms)';
      return {
        label: 'SAFE FALLBACK',
        class: 'hud-safety-fallback',
        hint: hintText,
      };
    }
    return {
      label: 'ACTIVE',
      class: 'hud-safety-active',
      hint: 'Tracking active',
    };
  };

  const getCommandColorClass = (cmd: string) => {
    switch (cmd) {
      case 'ACCELERATE':
        return 'hud-cmd-accelerate';
      case 'BRAKE':
        return 'hud-cmd-brake';
      case 'EMERGENCY_STOP':
        return 'hud-cmd-emergency';
      case 'SELECT':
        return 'hud-cmd-select';
      case 'IDLE':
      default:
        return 'hud-cmd-idle';
    }
  };

  const safetyInfo = getSafetyBadgeInfo();

  return (
    <div className="telemetry-hud-overlay">
      {/* Top HUD Bar */}
      <div className="hud-top-bar">
        <div className="hud-badge-group">
          <span className="hud-sim-title">
            <span className="hud-pulse-dot"></span>
            SIMULATOR HUD
          </span>

          <span className={`hud-safety-badge ${safetyInfo.class}`}>
            {safetyInfo.label}
          </span>
        </div>

        <div className="hud-command-group">
          <span className="hud-label">COMMAND</span>
          <span className={`hud-command-pill ${getCommandColorClass(command)}`}>
            {command.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Safety Alert Banner overlay if in FALLBACK or EMERGENCY */}
      {safetyState !== 'ACTIVE' && (
        <div className={`hud-alert-banner ${safetyState === 'EMERGENCY_STOP' || isEmergencyStopped ? 'banner-emergency' : 'banner-fallback'}`}>
          <div className="banner-icon">
            {isEmergencyStopped || safetyState === 'EMERGENCY_STOP' ? '🚨' : '⚠️'}
          </div>
          <div className="banner-content">
            <span className="banner-title">
              {isEmergencyStopped || safetyState === 'EMERGENCY_STOP'
                ? 'EMERGENCY STOP ENGAGED'
                : 'SAFE FALLBACK ACTIVE'}
            </span>
            <span className="banner-sub">{safetyInfo.hint} — Vehicle coasting to safe state</span>
          </div>
        </div>
      )}

      {/* Bottom HUD Telemetry Dashboard */}
      <div className="hud-bottom-bar">
        {/* Speedometer Gauge Box */}
        <div className="hud-gauge-card speed-card">
          <div className="gauge-header">
            <span className="hud-label">SPEED</span>
            <span className="hud-value-large">{speed.toFixed(1)} <small>km/h</small></span>
          </div>
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${isEmergencyStopped ? 'fill-emergency' : speed > 80 ? 'fill-high' : ''}`}
              style={{ width: `${speedPercentage}%` }}
            />
          </div>
        </div>

        {/* Steering Indicator Arc Box */}
        <div className="hud-gauge-card steering-card">
          <div className="gauge-header">
            <span className="hud-label">STEERING</span>
            <span className={`hud-value-medium steer-${steeringDirection.toLowerCase()}`}>
              {steeringDirection} ({steeringAngle > 0 ? `+${steeringAngle}` : steeringAngle}°)
            </span>
          </div>

          <div className="steering-gauge-bar">
            <div className="steering-center-marker" />
            <div
              className="steering-indicator-needle"
              style={{
                left: `calc(50% + ${(steeringPercent / 2).toFixed(1)}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
