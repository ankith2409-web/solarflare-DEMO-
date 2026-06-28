import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshBasicMaterial color="#FF6B00" />
    </mesh>
  );
}

function Earth() {
  return (
    <mesh position={[-3.5, 0, 0]}>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshBasicMaterial color="#00D4FF" />
    </mesh>
  );
}

function L1Orbit() {
  // L1 point is between Sun and Earth, ~1.5M km from Earth (out of 1.5M total to L1)
  // Show as a halo around L1 position
  const l1Ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (l1Ref.current) {
      l1Ref.current.rotation.z += dt * 0.5;
    }
  });
  return (
    <group position={[-2.0, 0, 0]}>
      <mesh ref={l1Ref}>
        <torusGeometry args={[0.55, 0.02, 8, 50]} />
        <meshBasicMaterial color="#FFB300" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function AdityaSatellite() {
  const satRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (satRef.current) {
      const t = performance.now() * 0.0008;
      // Satellite orbits L1 point (radius 0.55)
      satRef.current.position.x = -2.0 + Math.cos(t) * 0.55;
      satRef.current.position.y = Math.sin(t) * 0.55;
      satRef.current.position.z = 0;
    }
  });
  return (
    <group ref={satRef}>
      <mesh>
        <boxGeometry args={[0.12, 0.08, 0.06]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.005]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
    </group>
  );
}

export function OrbitTracker() {
  return (
    <div className="solar-card flex flex-col items-center">
      <div className="text-[10px] uppercase tracking-widest text-text-secondary font-mono mb-2">
        Aditya-L1 · L1 Halo Orbit
      </div>
      <div className="w-full h-[220px]">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }} style={{ background: 'transparent' }}>
          <ambientLight intensity={0.5} />
          <Sun />
          <Earth />
          <L1Orbit />
          <AdityaSatellite />
        </Canvas>
      </div>
      <div className="text-xs text-text-secondary text-center font-mono">
        <span className="text-white">1.5 M km</span> from Earth · Halo orbit around L1
      </div>
    </div>
  );
}