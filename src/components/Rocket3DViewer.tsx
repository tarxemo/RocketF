// src/components/Rocket3DViewer.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { TelemetryData } from '../types/telemetry';

interface Rocket3DViewerProps {
  telemetry: TelemetryData | null;
}

const Rocket3DViewer: React.FC<Rocket3DViewerProps> = ({ telemetry }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rocketRef = useRef<THREE.Group | null>(null);
  const trajectoryRef = useRef<THREE.Line | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize Three.js scene
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000033);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // Load rocket model
    const loader = new GLTFLoader();
    loader.load(
      '/models/rocket.glb',
      (gltf) => {
        const rocket = gltf.scene;
        rocket.scale.set(0.5, 0.5, 0.5);
        rocketRef.current = rocket;
        scene.add(rocket);
      },
      undefined,
      (error) => {
        console.error('Error loading rocket model:', error);
      }
    );

    // Add coordinate axes helper
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Update rocket position and rotation based on telemetry
    if (!telemetry || !rocketRef.current) return;

    const { position, orientation } = telemetry;

    // Update rocket position
    rocketRef.current.position.set(position.x, position.y, position.z);

    // Update rocket orientation (convert from Euler angles to quaternion)
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(
      new THREE.Euler(
        orientation.pitch,
        orientation.yaw,
        orientation.roll,
        'XYZ'
      )
    );
    rocketRef.current.setRotationFromQuaternion(quaternion);

    // Update trajectory
    updateTrajectory(telemetry.trajectoryHistory);
  }, [telemetry]);

  const updateTrajectory = (points: Array<{x: number, y: number, z: number}>) => {
    if (!sceneRef.current) return;

    // Remove old trajectory if exists
    if (trajectoryRef.current) {
      sceneRef.current.remove(trajectoryRef.current);
    }

    // Create new trajectory line
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const line = new THREE.Line(geometry, material);
    trajectoryRef.current = line;
    sceneRef.current.add(line);
  };

  return <div ref={mountRef} className="rocket-3d-viewer" />;
};

export default Rocket3DViewer;