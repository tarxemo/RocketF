import { useRef } from 'react';
import * as THREE from 'three';

const RocketModel = () => {
  const rocketRef = useRef<THREE.Group>(null);
  
  // Use a simple rocket model (you can replace this with a more detailed model)
  return (
    <group ref={rocketRef} scale={[0.5, 0.5, 0.5]}>
      {/* Rocket body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.3, 3, 32]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Nose cone */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Fins */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle) => (
        <mesh 
          key={angle} 
          position={[Math.cos(angle) * 0.5, -0.8, Math.sin(angle) * 0.5]} 
          rotation={[0, angle, 0]}
          castShadow
        >
          <boxGeometry args={[1, 0.1, 0.5]} />
          <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

export default RocketModel;
