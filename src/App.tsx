import React from 'react';
import { Header } from './components/Header';
import { CameraFeed } from './components/CameraFeed';
import { StatusPanel } from './components/StatusPanel';
import { VehicleScene } from './components/VehicleScene';
import { useHandTracking } from './hooks/useHandTracking';

const App: React.FC = () => {
  const { videoRef, canvasRef, stats, startCamera, stopCamera, resetEmergency } =
    useHandTracking();

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="viewports-row">
          <CameraFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            stats={stats}
            onStart={startCamera}
            onStop={stopCamera}
          />
          <VehicleScene vehicleState={stats.vehicleState} />
        </div>

        <div className="dashboard-row">
          <StatusPanel stats={stats} onResetEmergency={resetEmergency} />
        </div>
      </main>

      <footer className="app-footer">
        <p>GestureDrive Phase 7.3 — 3D Simulator Experience & Telemetry HUD (React Three Fiber)</p>
      </footer>
    </div>
  );
};

export default App;
