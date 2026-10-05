import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { VehicleModel } from './VehicleModel';

export const VehicleScene: React.FC = () => {
  return (
    <div className="vehicle-scene-container">
      <Canvas shadows>
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={[5.5, 3.2, 6.0]}
          fov={45}
        />

        {/* Ambient & Key Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#06b6d4" />
        <pointLight position={[5, 3, 5]} intensity={0.4} color="#a855f7" />

        {/* Ground Floor Plane with Grid */}
        <gridHelper args={[30, 30, '#06b6d4', '#1e293b']} position={[0, 0, 0]} />

        {/* Shadow Receiving Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.4} />
        </mesh>

        {/* 3D Vehicle Model Placeholder */}
        <VehicleModel />

        {/* Camera Interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={15}
          target={[0, 0.4, 0]}
        />
      </Canvas>

      {/* 3D Viewport Title Badge */}
      <div className="scene-badge">
        <span className="badge-dot"></span>
        3D Vehicle Simulator (Phase 7.1 Foundation)
      </div>
    </div>
  );
};
