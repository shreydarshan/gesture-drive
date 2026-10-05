import React from 'react';

export const VehicleModel: React.FC = () => {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Lower Main Chassis Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.5, 4.2]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Aerodynamic Body Accent Stripe */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[1.96, 0.04, 4.16]} />
        <meshStandardMaterial
          color="#06b6d4"
          roughness={0.3}
          metalness={0.6}
          emissive="#06b6d4"
          emissiveIntensity={0.2}
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
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[0.7, 0.05, 2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Rear Taillights */}
      <mesh position={[-0.7, 0.05, -2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh position={[0.7, 0.05, -2.11]}>
        <boxGeometry args={[0.35, 0.12, 0.05]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* 4 Wheels */}
      {/* Front Left */}
      <Wheel position={[-1.05, -0.15, 1.2]} />
      {/* Front Right */}
      <Wheel position={[1.05, -0.15, 1.2]} />
      {/* Rear Left */}
      <Wheel position={[-1.05, -0.15, -1.2]} />
      {/* Rear Right */}
      <Wheel position={[1.05, -0.15, -1.2]} />
    </group>
  );
};

const Wheel: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position} rotation={[0, 0, Math.PI / 2]}>
    {/* Tire Rubber */}
    <mesh castShadow>
      <cylinderGeometry args={[0.4, 0.4, 0.28, 24]} />
      <meshStandardMaterial color="#090d16" roughness={0.8} />
    </mesh>
    {/* Inner Alloy Rim */}
    <mesh>
      <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
      <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} />
    </mesh>
  </group>
);
