// src/components/Rocket3DViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { TelemetryData } from '../types/telemetry';

interface Rocket3DViewerProps {
  telemetry: TelemetryData | null;
}

type CameraView = 'external' | 'onboard' | 'engine' | 'payload' | 'separation' | 'orbital';

const Rocket3DViewer: React.FC<Rocket3DViewerProps> = ({ telemetry }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rocketRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [currentView, setCurrentView] = useState<CameraView>('external');
  const [showFlame, setShowFlame] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000000
    );
    camera.position.set(50, 30, 50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Rim lighting for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.5);
    rimLight.position.set(-50, 0, -50);
    scene.add(rimLight);

    // Create detailed rocket geometry
    const rocketGroup = new THREE.Group();
    rocketRef.current = rocketGroup;

    // First Stage - Main body
    const firstStageGeometry = new THREE.CylinderGeometry(3.7, 3.7, 42, 32);
    const firstStageMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xf0f0f0,
      shininess: 100,
      specular: 0x222222
    });
    const firstStage = new THREE.Mesh(firstStageGeometry, firstStageMaterial);
    firstStage.position.y = 0;
    firstStage.castShadow = true;
    firstStage.receiveShadow = true;
    rocketGroup.add(firstStage);

    // Grid fins (Falcon 9 style)
    for (let i = 0; i < 4; i++) {
      const finGeometry = new THREE.BoxGeometry(0.3, 6, 3);
      const finMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      const angle = (i * Math.PI) / 2;
      fin.position.x = Math.cos(angle) * 4.2;
      fin.position.z = Math.sin(angle) * 4.2;
      fin.position.y = -15;
      fin.rotation.y = angle;
      fin.castShadow = true;
      rocketGroup.add(fin);
    }

    // Landing legs
    for (let i = 0; i < 4; i++) {
      const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 8, 8);
      const legMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      leg.position.x = Math.cos(angle) * 3;
      leg.position.z = Math.sin(angle) * 3;
      leg.position.y = -17;
      leg.rotation.z = Math.cos(angle) * 0.3;
      leg.rotation.x = Math.sin(angle) * 0.3;
      leg.castShadow = true;
      rocketGroup.add(leg);
    }

    // Interstage adapter
    const interstageGeometry = new THREE.CylinderGeometry(3.7, 3.7, 4, 32);
    const interstageMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const interstage = new THREE.Mesh(interstageGeometry, interstageMaterial);
    interstage.position.y = 23;
    interstage.castShadow = true;
    rocketGroup.add(interstage);

    // Second Stage
    const secondStageGeometry = new THREE.CylinderGeometry(3.7, 3.7, 14, 32);
    const secondStageMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xf0f0f0,
      shininess: 100 
    });
    const secondStage = new THREE.Mesh(secondStageGeometry, secondStageMaterial);
    secondStage.position.y = 32;
    secondStage.castShadow = true;
    rocketGroup.add(secondStage);

    // Payload fairing
    const fairingGeometry = new THREE.ConeGeometry(3.7, 12, 32);
    const fairingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      shininess: 150 
    });
    const fairing = new THREE.Mesh(fairingGeometry, fairingMaterial);
    fairing.position.y = 45;
    fairing.castShadow = true;
    rocketGroup.add(fairing);

    // Engine nozzles (Merlin engines)
    const engineGroup = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const nozzleGeometry = new THREE.ConeGeometry(0.6, 4, 16);
      const nozzleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
      
      if (i === 0) {
        // Center engine
        nozzle.position.set(0, -23, 0);
      } else {
        // Outer ring of 8 engines
        const angle = ((i - 1) * 2 * Math.PI) / 8;
        nozzle.position.x = Math.cos(angle) * 2.2;
        nozzle.position.z = Math.sin(angle) * 2.2;
        nozzle.position.y = -23;
      }
      nozzle.castShadow = true;
      engineGroup.add(nozzle);
    }
    rocketGroup.add(engineGroup);

    // Engine flames (initially hidden)
    const flameGroup = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const flameGeometry = new THREE.ConeGeometry(0.8, 8, 8);
      const flameMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff4400,
        transparent: true,
        opacity: 0.8
      });
      const flame = new THREE.Mesh(flameGeometry, flameMaterial);
      
      if (i === 0) {
        flame.position.set(0, -29, 0);
      } else {
        const angle = ((i - 1) * 2 * Math.PI) / 8;
        flame.position.x = Math.cos(angle) * 2.2;
        flame.position.z = Math.sin(angle) * 2.2;
        flame.position.y = -29;
      }
      flame.visible = false;
      flameGroup.add(flame);
    }
    rocketGroup.add(flameGroup);

    scene.add(rocketGroup);

    // Earth with texture
    const earthGeometry = new THREE.SphereGeometry(6371, 64, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4488ff,
      transparent: true,
      opacity: 0.9
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.y = -6371 - 100;
    earth.receiveShadow = true;
    scene.add(earth);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(6471, 64, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x88ccff,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.y = -6371 - 100;
    scene.add(atmosphere);

    // Stars background
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 15000;
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 2000000;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 1.5,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate stars slowly
      stars.rotation.y += 0.0002;
      
      // Animate flames if visible
      if (showFlame) {
        flameGroup.children.forEach((flame, index) => {
          flame.scale.y = 0.8 + Math.sin(Date.now() * 0.01 + index) * 0.3;
          flame.scale.x = 0.9 + Math.sin(Date.now() * 0.015 + index) * 0.2;
          flame.scale.z = 0.9 + Math.sin(Date.now() * 0.015 + index) * 0.2;
        });
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [showFlame]);

  // Update rocket position and state based on telemetry
  useEffect(() => {
    if (telemetry && rocketRef.current) {
      // Update position (scaled down for visualization)
      rocketRef.current.position.set(
        telemetry.position.x / 1000,
        telemetry.position.y / 1000,
        telemetry.position.z / 1000
      );
      
      // Update orientation
      rocketRef.current.rotation.set(
        telemetry.orientation.pitch,
        telemetry.orientation.yaw,
        telemetry.orientation.roll
      );

      // Show/hide engine flames based on engine status
      const engineRunning = telemetry.engine.status === 'RUNNING';
      setShowFlame(engineRunning);
      
      if (rocketRef.current.children) {
        const flameGroup = rocketRef.current.children.find(child => 
          child.children.length > 0 && child.children[0].type === 'Mesh'
        );
        if (flameGroup) {
          flameGroup.children.forEach(flame => {
            flame.visible = engineRunning;
          });
        }
      }
    }
  }, [telemetry]);

  // Camera view switching
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !rocketRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const rocket = rocketRef.current;

    switch (currentView) {
      case 'external':
        camera.position.set(50, 30, 50);
        controls.target.copy(rocket.position);
        controls.enableRotate = true;
        break;
      case 'onboard':
        camera.position.copy(rocket.position);
        camera.position.y += 5;
        camera.lookAt(rocket.position.x, rocket.position.y + 100, rocket.position.z);
        controls.enableRotate = false;
        break;
      case 'engine':
        camera.position.copy(rocket.position);
        camera.position.y -= 15;
        camera.position.z += 10;
        camera.lookAt(rocket.position.x, rocket.position.y - 25, rocket.position.z);
        controls.enableRotate = false;
        break;
      case 'payload':
        camera.position.copy(rocket.position);
        camera.position.y += 50;
        camera.lookAt(rocket.position.x, rocket.position.y + 45, rocket.position.z);
        controls.enableRotate = false;
        break;
      case 'separation':
        camera.position.copy(rocket.position);
        camera.position.y += 10;
        camera.position.z += 20;
        camera.lookAt(rocket.position.x, rocket.position.y + 23, rocket.position.z);
        controls.enableRotate = false;
        break;
      case 'orbital':
        camera.position.set(0, 200, 200);
        controls.target.set(0, 0, 0);
        controls.enableRotate = true;
        break;
    }
    
    controls.update();
  }, [currentView, telemetry]);

  const cameraViews = [
    { id: 'external', name: 'External', icon: '🎥', description: 'External tracking camera' },
    { id: 'onboard', name: 'Onboard', icon: '👁️', description: 'Onboard forward camera' },
    { id: 'engine', name: 'Engine', icon: '🔥', description: 'Engine bay camera' },
    { id: 'payload', name: 'Payload', icon: '🛰️', description: 'Payload bay camera' },
    { id: 'separation', name: 'Stage Sep', icon: '🔗', description: 'Stage separation view' },
    { id: 'orbital', name: 'Orbital', icon: '🌍', description: 'Orbital overview' }
  ];

  return (
    <div className="w-full h-full relative">
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full rounded-lg" />
      
      {/* Camera Controls Overlay - Compact for mobile */}
      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 space-y-1">
        <div className="text-xs font-semibold text-cyan-300 mb-1 hidden sm:block">CAMERA VIEWS</div>
        <div className="grid grid-cols-3 sm:grid-cols-2 gap-1">
          {cameraViews.map((view) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id as CameraView)}
              className={`p-1 sm:p-2 rounded text-xs font-medium transition-all duration-200 ${
                currentView === view.id
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-slate-700/50 text-cyan-300 hover:bg-slate-600/50'
              }`}
              title={view.description}
            >
              <div className="flex items-center justify-center sm:space-x-1">
                <span className="text-xs sm:text-sm">{view.icon}</span>
                <span className="hidden sm:inline text-xs">{view.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Overlay - Compact for mobile */}
      {telemetry && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 space-y-1 text-xs max-w-[120px] sm:max-w-none">
          <div className="font-semibold text-cyan-300 text-xs hidden sm:block">VEHICLE STATUS</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400">Alt:</span>
              <span className="text-white">{(telemetry.position.y / 1000).toFixed(1)}km</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400">Vel:</span>
              <span className="text-white">{telemetry.velocity.total.toFixed(0)}m/s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400">Eng:</span>
              <span className={`font-semibold text-xs ${
                telemetry.engine.status === 'RUNNING' ? 'text-green-400' : 
                telemetry.engine.status === 'OFF' ? 'text-gray-400' : 'text-red-400'
              }`}>
                {telemetry.engine.status === 'RUNNING' ? '🔥' : telemetry.engine.status === 'OFF' ? '⚫' : '❌'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current View Indicator - Simplified for mobile */}
      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-cyan-300 hidden sm:inline">VIEW:</span>
          <span className="text-white font-semibold text-xs">
            {cameraViews.find(v => v.id === currentView)?.icon} 
            <span className="hidden sm:inline ml-1">{cameraViews.find(v => v.id === currentView)?.name.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* Controls Help - Hidden on mobile to save space */}
      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-cyan-300 hidden md:block">
        <div>Mouse: Rotate • Wheel: Zoom • Right-click: Pan</div>
      </div>
    </div>
  );
};

export default Rocket3DViewer;