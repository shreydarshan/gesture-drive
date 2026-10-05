import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { VehicleModel } from './VehicleModel';
import { TelemetryHUD } from './TelemetryHUD';
import type { VehicleState } from '../vehicle/vehicleTypes';

interface VehicleSceneProps {
  vehicleState: VehicleState;
}

export const VehicleScene: React.FC<VehicleSceneProps> = ({ vehicleState }) => {
  return (
    <div className="vehicle-scene-container">
      {/* Canvas Viewport */}
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
        <pointLight position={[-5, 5, -5]} intensity={0.6} color="#06b6d4" />
        <pointLight position={[5, 3, 5]} intensity={0.5} color="#a855f7" />

        {/* Dynamic Road Highway Environment */}
        <RoadEnvironment
          speed={vehicleState.speed}
          isEmergencyStopped={vehicleState.isEmergencyStopped}
        />

        {/* 3D Vehicle Model */}
        <VehicleModel vehicleState={vehicleState} />

        {/* Camera Orbit Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4}
          maxDistance={15}
          target={[0, 0.4, 0]}
        />
      </Canvas>

      {/* Telemetry HUD In-Scene Overlay */}
      <TelemetryHUD vehicleState={vehicleState} />
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
      scrollOffsetRef.current = (scrollOffsetRef.current + currentSpeed * delta * 0.18) % 12;
      roadGroupRef.current.position.z = -scrollOffsetRef.current;
    }
  });

  return (
    <group>
      {/* Ground Shadow Receiver Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      {/* Main Highway Surface Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[10, 80]} />
        <meshStandardMaterial color="#0b1329" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Scrolling Road Markings & Props Group */}
      <group ref={roadGroupRef}>
        {/* Ambient Ground Grid Matrix */}
        <gridHelper args={[60, 60, '#06b6d4', '#1e293b']} position={[0, -0.01, 0]} />

        {/* Highway Left & Right Glowing Curbs */}
        <mesh position={[-5.0, 0.02, 0]}>
          <boxGeometry args={[0.15, 0.04, 80]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[5.0, 0.02, 0]}>
          <boxGeometry args={[0.15, 0.04, 80]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
        </mesh>

        {/* Center Dashed Lane Markings */}
        {[-36, -24, -12, 0, 12, 24, 36].map((z) => (
          <group key={z} position={[0, 0.01, z]}>
            {/* Center Yellow Dash */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.02, 5.0]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
            </mesh>
            {/* Left Lane White Dash */}
            <mesh position={[-2.5, 0, 0]}>
              <boxGeometry args={[0.12, 0.02, 3.5]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            {/* Right Lane White Dash */}
            <mesh position={[2.5, 0, 0]}>
              <boxGeometry args={[0.12, 0.02, 3.5]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Roadside Futuristic Light Poles */}
        {[-30, -15, 0, 15, 30].map((z) => (
          <group key={z} position={[0, 0, z]}>
            {/* Left Pole */}
            <mesh position={[-5.6, 1.2, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 2.4, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Left Light Head */}
            <mesh position={[-5.6, 2.45, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.4]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.8} />
            </mesh>

            {/* Right Pole */}
            <mesh position={[5.6, 1.2, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 2.4, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Right Light Head */}
            <mesh position={[5.6, 2.45, 0]}>
              <boxGeometry args={[0.4, 0.12, 0.4]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
