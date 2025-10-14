import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import RocketModel from './RocketModel';
import { Suspense } from 'react';

interface RocketSceneProps {
  className?: string;
  showControls?: boolean;
  cameraPosition?: [number, number, number];
}

const RocketScene: React.FC<RocketSceneProps> = ({ 
  className = '', 
  showControls = true,
  cameraPosition = [10, 10, 10]
}) => {
  return (
    <div className={`w-full h-[600px] ${className} bg-black/20 rounded-lg`}>
      <Canvas
        shadows
        camera={{ 
          position: cameraPosition, 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <RocketModel />
          
          <gridHelper args={[100, 100]} />
          <axesHelper args={[5]} />
          
          {showControls && (
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
            />
          )}
          <Environment preset="sunset" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default RocketScene;
