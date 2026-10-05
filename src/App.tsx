import React from 'react';
import { Header } from './components/Header';
import { CameraFeed } from './components/CameraFeed';
import { StatusPanel } from './components/StatusPanel';
import { useHandTracking } from './hooks/useHandTracking';

const App: React.FC = () => {
  const { videoRef, canvasRef, stats, startCamera, stopCamera } = useHandTracking();

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <div className="workspace-grid">
          <CameraFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            stats={stats}
            onStart={startCamera}
            onStop={stopCamera}
          />
          <StatusPanel stats={stats} />
        </div>
      </main>

      <footer className="app-footer">
        <p>GestureDrive Phase 3 — Geometric Gesture Recognition Engine</p>
      </footer>
    </div>
  );
};

export default App;
