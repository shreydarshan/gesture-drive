import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { VehicleModel } from './VehicleModel';
import type { VehicleState } from '../vehicle/vehicleTypes';

interface VehicleSceneProps {
  vehicleState: VehicleState;
}

export const VehicleScene: React.FC<VehicleSceneProps> = ({ vehicleState }) => {
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

        {/* Dynamic Road Environment */}
        <RoadEnvironment
          speed={vehicleState.speed}
          isEmergencyStopped={vehicleState.isEmergencyStopped}
        />

        {/* 3D Vehicle Model */}
        <VehicleModel vehicleState={vehicleState} />

        {/* Camera Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={15}
          target={[0, 0.4, 0]}
        />
      </Canvas>

      {/* 3D Viewport Title & Status Badge */}
      <div className="scene-badge">
        <span className={`badge-dot ${vehicleState.isEmergencyStopped ? 'emergency-dot' : ''}`}></span>
        3D Simulation {vehicleState.isEmergencyStopped ? '(EMERGENCY STOP)' : vehicleState.speed > 0 ? `(${vehicleState.speed} km/h)` : '(Idle)'}
      </div>
    </div>
  );
};

const RoadEnvironment: React.FC<{ speed: number; isEmergencyStopped: boolean }> = ({
  speed,
  isEmergencyStopped,
}) => {
  const roadGroupRef = useRef<THREE.Group>(null);
  const scrollOffsetRef = useRef<number>(0);
  const stateRef = useRef({ speed, isEmergencyStopped });

  // Update stateRef in useEffect to prevent stale closure inside R3F useFrame
  useEffect(() => {
    stateRef.current = { speed, isEmergencyStopped };
  }, [speed, isEmergencyStopped]);

  useFrame((_, delta) => {
    if (!roadGroupRef.current) return;
    const { speed: currentSpeed, isEmergencyStopped: currentEmergency } = stateRef.current;

    if (!currentEmergency && currentSpeed > 0) {
      scrollOffsetRef.current = (scrollOffsetRef.current + currentSpeed * delta * 0.15) % 10;
      roadGroupRef.current.position.z = -scrollOffsetRef.current;
    }
  });

  return (
    <group>
      {/* Ground Shadow Receiver Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      {/* Scrolling Road Surface & Dashes */}
      <group ref={roadGroupRef}>
        <gridHelper args={[40, 40, '#06b6d4', '#1e293b']} position={[0, 0, 0]} />

        {/* Roadside Light Markers */}
        {[-20, -10, 0, 10, 20].map((z) => (
          <group key={z} position={[0, 0, z]}>
            <mesh position={[-4.5, 0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.0, 12]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[4.5, 0.5, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.0, 12]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
