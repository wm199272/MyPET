import * as THREE from 'three';

import { buildPet } from './buildPet';
import type { GarmentKind, Species } from './domain';
import { figureFor } from './petFigure';
import { groupFromPointE, loadBreedMesh } from './pointEMesh';

export type StageState = {
  species: Species;
  breed: string;
  garment: { kind: GarmentKind; photo: string } | null;
};

export type PetView = {
  stop: () => void;
  resize: (width: number, height: number) => void;
  addYaw: (delta: number) => void;
  setDragging: (dragging: boolean) => void;
};

export function startPetView(options: {
  canvas: HTMLCanvasElement;
  context?: WebGLRenderingContext;
  getState: () => StageState;
  element?: HTMLElement;
  endFrame?: () => void;
  initialWidth: number;
  initialHeight: number;
}): PetView {
  const renderer = new THREE.WebGLRenderer({
    canvas: options.canvas,
    context: options.context,
    antialias: !options.context,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0xf6e8e8, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  scene.add(new THREE.HemisphereLight(0xfff4ec, 0xe7d2cc, 0.75));
  const key = new THREE.DirectionalLight(0xfffaf7, 1.35);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf3c9c4, 0.45);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.MeshBasicMaterial({ color: 0xc9b2ae, transparent: true, opacity: 0.28 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  scene.add(shadow);
  const pivot = new THREE.Group();
  scene.add(pivot);

  let stopped = false;
  let yaw = -1.05;
  let dragging = false;
  let width = options.initialWidth;
  let height = options.initialHeight;
  let builtKey = '';
  let loading = false;
  let frame = 0;

  function resize(nextWidth: number, nextHeight: number) {
    if (nextWidth < 2 || nextHeight < 2) return;
    width = nextWidth;
    height = nextHeight;
    renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function replacePet(pet: THREE.Group) {
    while (pivot.children.length > 0) disposeObject(pivot.children[0]);
    const box = new THREE.Box3().setFromObject(pet);
    const center = box.getCenter(new THREE.Vector3());
    pet.position.x -= center.x;
    pet.position.z -= center.z;
    pet.position.y -= box.min.y;
    pivot.add(pet);
    const fitted = new THREE.Box3().setFromObject(pivot);
    const size = fitted.getSize(new THREE.Vector3());
    const mid = fitted.getCenter(new THREE.Vector3());
    const vertical = (30 * Math.PI) / 180;
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * Math.max(camera.aspect, 0.5));
    const distance = Math.max(
      (size.y * 0.78) / Math.sin(vertical / 2),
      (Math.max(size.x, size.z) * 0.7) / Math.sin(horizontal / 2),
    );
    camera.position.set(mid.x + distance * 0.18, mid.y + distance * 0.06, mid.z + distance * 0.96);
    camera.lookAt(mid.x, mid.y * 0.92, mid.z);
    camera.updateProjectionMatrix();
    shadow.position.set(mid.x, 0.002, mid.z);
    shadow.scale.set(Math.max(size.x, size.z) * 0.62, Math.max(size.x, size.z) * 0.4, 1);
  }

  async function ensure() {
    const state = options.getState();
    const key = `${state.species}|${state.breed}|${state.garment?.kind || ''}|${state.garment?.photo || ''}`;
    if (key === builtKey || loading) return;
    builtKey = key;
    loading = true;
    let texture: THREE.Texture | null = null;
    if (state.garment?.photo) {
      try {
        texture = await loadTexture(state.garment.photo);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      } catch {
        texture = null;
      }
    }
    loading = false;
    if (stopped) {
      texture?.dispose();
      return;
    }
    const latest = options.getState();
    const latestKey = `${latest.species}|${latest.breed}|${latest.garment?.kind || ''}|${latest.garment?.photo || ''}`;
    if (latestKey !== builtKey) {
      texture?.dispose();
      builtKey = '';
      return;
    }
    const figure = figureFor(latest.species, latest.breed);
    const worn = latest.garment && texture ? { kind: latest.garment.kind, texture } : null;
    const mesh = await loadBreedMesh(figure.title, latest.species);
    if (options.getState().species + '|' + options.getState().breed !== `${latest.species}|${latest.breed}`) {
      texture?.dispose();
      builtKey = '';
      return;
    }
    replacePet(mesh ? groupFromPointE(mesh, worn) : buildPet(figure, worn));
  }

  function tick() {
    if (stopped) return;
    void ensure();
    if (!dragging) yaw += 0.004;
    pivot.rotation.y = yaw;
    renderer.render(scene, camera);
    options.endFrame?.();
    frame = requestAnimationFrame(tick);
  }

  resize(width, height);
  tick();

  const last = { x: 0 };
  const onDown = (event: PointerEvent) => {
    dragging = true;
    last.x = event.clientX;
  };
  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    yaw += (event.clientX - last.x) * 0.01;
    last.x = event.clientX;
  };
  const onUp = () => {
    dragging = false;
  };
  if (options.element) options.element.style.touchAction = 'none';
  options.element?.addEventListener('pointerdown', onDown);
  options.element?.addEventListener('pointermove', onMove);
  globalThis.addEventListener?.('pointerup', onUp);

  return {
    resize,
    addYaw: (delta) => {
      yaw += delta;
    },
    setDragging: (next) => {
      dragging = next;
    },
    stop: () => {
      stopped = true;
      cancelAnimationFrame(frame);
      options.element?.removeEventListener('pointerdown', onDown);
      options.element?.removeEventListener('pointermove', onMove);
      globalThis.removeEventListener?.('pointerup', onUp);
      while (pivot.children.length > 0) disposeObject(pivot.children[0]);
      shadow.geometry.dispose();
      (shadow.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}

async function loadTexture(uri: string): Promise<THREE.Texture> {
  let source = uri;
  if (uri.startsWith('file://')) {
    const { File } = await import('expo-file-system');
    const base64 = await new File(uri).base64();
    source = `data:image/jpeg;base64,${base64}`;
  }
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(source, resolve, undefined, reject);
  });
}

function disposeObject(object: THREE.Object3D) {
  object.removeFromParent();
  object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const mapped = material as THREE.MeshStandardMaterial;
      if (mapped.map) mapped.map.dispose();
      material.dispose();
    });
  });
}
