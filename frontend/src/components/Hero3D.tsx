import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Ribbon = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-2, 0, 0]} rotation={[0.4, 0.2, 0]}>
          <torusKnotGeometry args={[1.5, 0.4, 100, 16]} />
          <MeshDistortMaterial color="#F5C518" speed={2} distort={0.2} roughness={0.2} metalness={0.1} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <RoundedBox args={[1, 1, 1]} radius={0.1} position={[2, 1, -1]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#1A1A1A" roughness={0.1} metalness={0.8} />
        </RoundedBox>
      </Float>
      
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.5}>
        <mesh position={[1.5, -1.5, 1]} rotation={[-0.2, 0.4, 0.1]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#E8746B" roughness={0.3} metalness={0.2} />
        </mesh>
      </Float>
    </group>
  );
};

export const Hero3D = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', opacity: 0.8 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <Ribbon />
      </Canvas>
    </div>
  );
};
