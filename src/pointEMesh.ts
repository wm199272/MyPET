import { Platform } from 'react-native';
import * as THREE from 'three';
import { Asset } from 'expo-asset';

import type { GarmentKind, Species } from './domain';
import { breedMeshFile, breedMeshModule } from './breedMeshMap';

const speciesTitle: Record<Species, string> = { dog: '狗', cat: '猫', other: '小动物' };

export async function loadBreedMesh(title: string, species: Species): Promise<ArrayBuffer | null> {
  const file = breedMeshFile[title] || breedMeshFile[speciesTitle[species]];
  if (!file) return null;
  try {
    if (Platform.OS === 'web') {
      const response = await fetch(`/meshes/${file}?v=upright`);
      if (!response.ok) return null;
      return await response.arrayBuffer();
    }
    const moduleId = breedMeshModule[file];
    if (!moduleId) return null;
    const asset = Asset.fromModule(moduleId);
    if (!asset.localUri) await asset.downloadAsync();
    const response = await fetch(asset.localUri || asset.uri);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

export function groupFromPointE(buffer: ArrayBuffer, garment?: { kind: GarmentKind; texture: THREE.Texture } | null): THREE.Group {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (magic !== 'PETM') throw new Error('bad mesh');
  const vertices = view.getUint32(8, true);
  const faces = view.getUint32(12, true);
  let offset = 16;
  const positions = new Float32Array(buffer.slice(offset, offset + vertices * 12));
  offset += vertices * 12;
  const colors = new Float32Array(buffer.slice(offset, offset + vertices * 12));
  offset += vertices * 12;
  const indices = new Uint32Array(buffer.slice(offset, offset + faces * 12));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0.02 }),
  );
  const group = new THREE.Group();
  group.add(mesh);
  if (garment && geometry.boundingBox) addGarment(group, garment.kind, garment.texture, geometry.boundingBox);
  return group;
}

function addGarment(group: THREE.Group, kind: GarmentKind, texture: THREE.Texture, box: THREE.Box3) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const cloth = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
  if (kind === 'harness') {
    const back = new THREE.Mesh(new THREE.PlaneGeometry(size.x * 0.42, size.z * 0.7), cloth);
    back.position.set(center.x - size.x * 0.05, box.max.y + 0.01, center.z);
    back.rotation.x = -Math.PI / 2.2;
    group.add(back);
    return;
  }
  if (kind === 'cooling') {
    const cape = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), cloth);
    cape.scale.set(size.x * 0.46, size.y * 0.22, size.z * 0.55);
    cape.position.set(center.x, box.max.y - size.y * 0.08, center.z);
    group.add(cape);
    return;
  }
  const suit = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), cloth);
  suit.scale.set(size.x * 0.34, size.y * 0.28, size.z * 0.42);
  suit.position.set(center.x - size.x * 0.04, center.y, center.z);
  group.add(suit);
}
