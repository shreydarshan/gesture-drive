import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VehicleState } from '../vehicle/vehicleTypes';

interface VehicleModelProps {
  vehicleState: VehicleState;
}

export const VehicleModel: React.FC<VehicleModelProps> = ({ vehicleState }) => {
  const bodyGroupRef = useRef<THREE.Group>(null);
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);

  const tireMesh1 = useRef<THREE.Mesh>(null);
  const tireMesh2 = useRef<THREE.Mesh>(null);
  const tireMesh3 = useRef<THREE.Mesh>(null);
  const tireMesh4 = useRef<THREE.Mesh>(null);

  const wheelRotationRef = useRef<number>(0);
  const vehicleStateRef = useRef<VehicleState>(vehicleState);

  // Keep vehicleStateRef updated inside useEffect to prevent stale closures inside useFrame
  useEffect(() => {
    vehicleStateRef.current = vehicleState;
  }, [vehicleState]);

  useFrame((_, delta) => {
    if (!bodyGroupRef.current) return;

    const { speed, steeringAngle, isEmergencyStopped } = vehicleStateRef.current;

    // 1. Steering Yaw & Lateral Shift
    const targetSteerRad = -(steeringAngle * Math.PI) / 180;
    const targetYaw = targetSteerRad * 0.4;
    const targetX = targetSteerRad * 1.5;

    bodyGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      bodyGroupRef.current.rotation.y,
      targetYaw,
      delta * 6
    );

    bodyGroupRef.current.position.x = THREE.MathUtils.lerp(
      bodyGroupRef.current.position.x,
      targetX,
      delta * 6
    );

    // 2. Front Wheels Steering Rotation (y-axis pivot)
    if (frontLeftWheelRef.current && frontRightWheelRef.current) {
      frontLeftWheelRef.current.rotation.y = THREE.MathUtils.lerp(
        frontLeftWheelRef.current.rotation.y,
        targetSteerRad,
        delta * 8
      );
      frontRightWheelRef.current.rotation.y = THREE.MathUtils.lerp(
        frontRightWheelRef.current.rotation.y,
        targetSteerRad,
        delta * 8
      );
    }

    // 3. All Wheels Axle Rotation (forward motion)
    if (!isEmergencyStopped && speed > 0) {
      wheelRotationRef.current += speed * delta * 0.15;
    }

    const currentRotation = wheelRotationRef.current;
    if (tireMesh1.current) tireMesh1.current.rotation.x = currentRotation;
    if (tireMesh2.current) tireMesh2.current.rotation.x = currentRotation;
    if (tireMesh3.current) tireMesh3.current.rotation.x = currentRotation;
    if (tireMesh4.current) tireMesh4.current.rotation.x = currentRotation;
  });

  const isEmergency = vehicleState.isEmergencyStopped;

  return (
    <group ref={bodyGroupRef} position={[0, 0.4, 0]}>
      {/* Lower Main Chassis Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.5, 4.2]} />
        <meshStandardMaterial
          color={isEmergency ? '#450a0a' : '#0f172a'}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Body Accent Stripe */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[1.96, 0.04, 4.16]} />
        <meshStandardMaterial
          color={isEmergency ? '#ef4444' : '#06b6d4'}
          roughness={0.3}
          metalness={0.6}
          emissive={isEmergency ? '#ef4444' : '#06b6d4'}
          emissiveIntensity={isEmergency ? 0.8 : 0.2}
        />
      </mesh>

      {/* Cabin Roof / Windshield */}
      <mesh position={[0, 0.45, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.45, 2.0]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Front Headlights */}
      <mesh position={[-0.7, 0.05, 2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={isEmergency ? 0.5 : 1.5}
        />
      </mesh>
      <mesh position={[0.7, 0.05, 2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={isEmergency ? 0.5 : 1.5}
        />
      </mesh>

      {/* Rear Taillights */}
      <mesh position={[-0.7, 0.05, -2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isEmergency ? 2.5 : 1.2}
        />
      </mesh>
      <mesh position={[0.7, 0.05, -2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={isEmergency ? 2.5 : 1.2}
        />
      </mesh>

      {/* Emergency Beacon Light on Roof */}
      {isEmergency && (
        <mesh position={[0, 0.72, -0.2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={3.0}
          />
        </mesh>
      )}

      {/* 4 Wheels */}
      {/* Front Left */}
      <group ref={frontLeftWheelRef} position={[-1.05, -0.15, 1.2]}>
        <Wheel tireRef={tireMesh1} />
      </group>
      {/* Front Right */}
      <group ref={frontRightWheelRef} position={[1.05, -0.15, 1.2]}>
        <Wheel tireRef={tireMesh2} />
      </group>
      {/* Rear Left */}
      <group position={[-1.05, -0.15, -1.2]}>
        <Wheel tireRef={tireMesh3} />
      </group>
      {/* Rear Right */}
      <group position={[1.05, -0.15, -1.2]}>
        <Wheel tireRef={tireMesh4} />
      </group>
    </group>
  );
};

const Wheel: React.FC<{ tireRef: React.RefObject<THREE.Mesh | null> }> = ({ tireRef }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    {/* Tire Rubber Mesh */}
    <mesh ref={tireRef} castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.28, 24]} />
      <meshStandardMaterial color="#090d16" roughness={0.8} />
    </mesh>
    {/* Inner Rim */}
    <mesh>
      <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
      <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
    </mesh>
  </group>
);
