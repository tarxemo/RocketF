import * as THREE from 'three';

export const createRocketGroup = (position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) => {
  const group = new THREE.Group();
  group.position.set(position.x, position.y, position.z);
  group.rotation.set(rotation.x, rotation.y, rotation.z);
  return group;
};

export const updateRocketPosition = (
  group: THREE.Group,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number }
) => {
  group.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.1);
  group.rotation.set(rotation.x, rotation.y, rotation.z);
};
