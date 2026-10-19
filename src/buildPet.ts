import * as THREE from 'three';

import type { GarmentKind } from './domain';
import type { Figure } from './petFigure';

const skin = '#C48A78';

type Body = {
  length: number;
  radius: number;
  centerY: number;
  head: number;
};

export function buildPet(figure: Figure, garment?: { kind: GarmentKind; texture: THREE.Texture } | null): THREE.Group {
  const group = new THREE.Group();
  const body = measure(figure);
  const main = fur(figure.stripes || figure.spots ? '#ffffff' : figure.coat.main, figure.stripes || figure.spots ? pattern(figure) : undefined);
  const point = fur(figure.coat.dark);
  const light = fur(figure.coat.light);
  const coat = figure.mask === 'points' ? point : main;
  const nose = new THREE.MeshPhysicalMaterial({ color: '#241E1C', roughness: 0.32, metalness: 0.04, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const eyeWhite = fur('#F4F1EC');
  const pupil = fur('#161311');
  const innerEar = fur(skin);
  const whisker = fur('#E7DFD6');

  group.add(torso(body, main));
  group.add(ball(main, [-body.length * 0.4, body.centerY, 0], [body.radius * 0.72, body.radius * 0.9, body.radius * 0.82]));
  group.add(ball(light, [body.length * 0.16, body.centerY - body.radius * 0.55, body.radius * 0.15], [body.radius * 0.42, body.radius * 0.22, body.radius * 0.16]));
  if (figure.mask === 'saddle') {
    group.add(ball(point, [0, body.centerY + body.radius * 0.55, 0], [body.length * 0.22, body.radius * 0.28, body.radius * 0.7]));
  }
  if (figure.fluff > 0.08) {
    group.add(ball(light, [body.length * 0.28, body.centerY + body.radius * 0.35, 0], [body.radius * 0.55, body.radius * 0.4, body.radius * 0.7]));
  }

  const legZ = body.radius * 0.72;
  const legs = [
    { x: body.length * 0.28, z: legZ, front: true },
    { x: body.length * 0.28, z: -legZ, front: true },
    { x: -body.length * 0.28, z: legZ * 0.86, front: false },
    { x: -body.length * 0.28, z: -legZ * 0.86, front: false },
  ];
  legs.forEach((leg) => addLeg(group, figure, body, leg.x, leg.z, leg.front, main));
  addTail(group, figure, body, figure.mask === 'points' ? point : main);

  const headX = body.length * 0.46 + body.head * 0.2;
  const headY = body.centerY + body.radius * 0.45 + body.head * 0.25;
  group.add(bone(
    new THREE.Vector3(body.length * 0.34, body.centerY + body.radius * 0.15, 0),
    new THREE.Vector3(headX - body.head * 0.35, headY - body.head * 0.05, 0),
    body.radius * 0.42,
    body.head * 0.42,
    main,
  ));

  const head = new THREE.Group();
  head.position.set(headX, headY, 0);
  const skull = figure.species === 'cat'
    ? [body.head * 0.95, body.head * 0.9, body.head]
    : [body.head * 1.05, body.head * 0.86, body.head * 0.92];
  head.add(ball(main, [0, 0, 0], skull as [number, number, number]));
  head.add(ball(main, [-body.head * 0.08, -body.head * 0.02, body.head * 0.42], [body.head * 0.38, body.head * 0.32, body.head * 0.32]));
  head.add(ball(main, [-body.head * 0.08, -body.head * 0.02, -body.head * 0.42], [body.head * 0.38, body.head * 0.32, body.head * 0.32]));
  const snout = figure.mask === 'points' ? point : light;
  if (figure.muzzle > 0.035) head.add(muzzle(figure, snout));
  const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.02, body.head * 0.08), 16, 12), nose);
  noseMesh.scale.set(1.2, 0.7, 0.9);
  noseMesh.position.set(body.head * 0.72 + Math.max(figure.muzzle, 0.035) * 0.85, -body.head * 0.16, 0);
  head.add(noseMesh);
  addEars(head, figure, body.head, coat, innerEar);

  const eyeY = body.head * 0.08;
  const eyeZ = body.head * 0.34;
  const eyeR = body.head * (figure.species === 'cat' ? 0.13 : 0.1);
  [-1, 1].forEach((side) => {
    head.add(ball(fur('#3A312C'), [body.head * 0.55, eyeY, side * eyeZ], [eyeR * 1.3, eyeR * 0.85, eyeR * 0.5]));
    head.add(ball(eyeWhite, [body.head * 0.66, eyeY, side * eyeZ], [eyeR, eyeR * 0.72, eyeR * 0.42]));
    head.add(ball(pupil, [body.head * 0.72, eyeY, side * eyeZ], [eyeR * 0.48, figure.species === 'cat' ? eyeR * 0.85 : eyeR * 0.52, eyeR * 0.28]));
    head.add(ball(fur('#FFFFFF'), [body.head * 0.74, eyeY + eyeR * 0.18, side * (eyeZ + eyeR * 0.12)], [eyeR * 0.18, eyeR * 0.18, eyeR * 0.1]));
  });
  if (figure.species === 'cat') {
    [-1, 1].forEach((side) => {
      [-0.01, 0.03, 0.07].forEach((dy) => {
        const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, body.head * 0.85, 4), whisker);
        hair.rotation.z = Math.PI / 2;
        hair.rotation.y = side * 0.35;
        hair.position.set(body.head * 0.85, dy, side * body.head * 0.2);
        head.add(hair);
      });
    });
  }
  group.add(head);

  if (garment) addGarment(group, figure, garment.kind, garment.texture, body, legs);
  return group;
}

function measure(figure: Figure): Body {
  const radius = figure.chest * 0.42;
  return {
    length: figure.length,
    radius,
    centerY: figure.height + radius * 0.9,
    head: figure.head,
  };
}

function torso(body: Body, material: THREE.Material) {
  const points = [
    new THREE.Vector2(0.55, 0),
    new THREE.Vector2(0.88, 0.14),
    new THREE.Vector2(1, 0.34),
    new THREE.Vector2(0.84, 0.52),
    new THREE.Vector2(0.98, 0.74),
    new THREE.Vector2(0.74, 0.9),
    new THREE.Vector2(0.46, 1),
  ];
  const geometry = new THREE.LatheGeometry(points, 32);
  geometry.rotateZ(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(body.length, body.radius, body.radius * 0.9);
  mesh.position.set(-body.length * 0.5, body.centerY, 0);
  return mesh;
}

function muzzle(figure: Figure, material: THREE.Material) {
  const reach = Math.max(figure.muzzle, 0.04);
  const points = [
    new THREE.Vector2(reach * 0.28, 0),
    new THREE.Vector2(reach * 0.62, reach * 0.35),
    new THREE.Vector2(reach * 0.7, reach * 0.72),
    new THREE.Vector2(reach * 0.36, reach),
  ];
  const geometry = new THREE.LatheGeometry(points, 18);
  geometry.rotateZ(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(figure.head * 0.62, -figure.head * 0.18, 0);
  return mesh;
}

function addLeg(
  group: THREE.Group,
  figure: Figure,
  body: Body,
  x: number,
  z: number,
  front: boolean,
  material: THREE.Material,
) {
  const thickness = Math.max(0.045, body.radius * (figure.height < 0.34 ? 0.46 : 0.32));
  const hip = new THREE.Vector3(x, body.centerY - body.radius * 0.05, z);
  const knee = new THREE.Vector3(x + (front ? thickness * 0.25 : -thickness * 0.3), Math.max(body.centerY - body.radius * 0.85, figure.height * 0.46), z);
  const ankle = new THREE.Vector3(x, 0.04, z * 0.92);
  group.add(bone(hip, knee, thickness * 1.05, thickness * 0.78, material));
  group.add(bone(knee, ankle, thickness * 0.72, thickness * 0.58, material));
  group.add(ball(material, [ankle.x + (front ? 0.03 : -0.02), 0.028, ankle.z], [thickness * 1.15, 0.03, thickness * 0.85]));
}

function addEars(head: THREE.Group, figure: Figure, headSize: number, outer: THREE.Material, inner: THREE.Material) {
  [-1, 1].forEach((side) => {
    if (figure.ear === 'floppy') {
      const ear = ball(outer, [headSize * 0.05, -headSize * 0.05, side * headSize * 0.72], [headSize * 0.22 * figure.earSize, headSize * 0.62 * figure.earSize, headSize * 0.1]);
      ear.rotation.z = side * -0.2;
      head.add(ear);
      return;
    }
    if (figure.ear === 'fold') {
      head.add(ball(outer, [headSize * 0.2, headSize * 0.38, side * headSize * 0.48], [headSize * 0.24 * figure.earSize, headSize * 0.1, headSize * 0.3 * figure.earSize]));
      return;
    }
    if (figure.ear === 'bat') {
      head.add(ball(outer, [headSize * 0.05, headSize * 0.62, side * headSize * 0.55], [headSize * 0.16, headSize * 0.55 * figure.earSize, headSize * 0.34]));
      return;
    }
    const ear = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), outer);
    blade.scale.set(headSize * 0.2, headSize * 0.62 * figure.earSize, headSize * 0.07);
    blade.position.y = headSize * 0.28 * figure.earSize;
    const lining = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), inner);
    lining.scale.set(headSize * 0.11, headSize * 0.4 * figure.earSize, headSize * 0.03);
    lining.position.set(headSize * 0.04, headSize * 0.26 * figure.earSize, 0);
    ear.add(blade, lining);
    ear.position.set(headSize * 0.02, headSize * 0.5, side * headSize * 0.58);
    ear.rotation.z = side * 0.85;
    ear.rotation.y = side * -0.15;
    head.add(ear);
  });
}

function addTail(group: THREE.Group, figure: Figure, body: Body, material: THREE.Material) {
  const x0 = -body.length * 0.46;
  const y0 = body.centerY + body.radius * 0.15;
  if (figure.tail === 'bob') {
    group.add(ball(material, [x0, y0, 0], [body.radius * 0.22, body.radius * 0.18, body.radius * 0.18]));
    return;
  }
  const points: THREE.Vector3[] = [];
  const count = figure.tail === 'whip' ? 8 : 6;
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    let x = x0 - t * body.length * (figure.tail === 'whip' ? 0.42 : 0.22);
    let y = y0;
    if (figure.tail === 'curl') {
      const angle = t * Math.PI * 1.15;
      x = x0 + Math.sin(angle) * body.radius * 0.35;
      y = y0 + (1 - Math.cos(angle)) * body.radius * 1.15;
    }
    if (figure.tail === 'plume') y = y0 + t * body.radius * 1.35;
    if (figure.tail === 'whip') y = y0 + Math.sin(t * Math.PI) * body.radius * 0.55;
    if (figure.tail === 'straight') y = y0 - t * body.radius * 0.15;
    points.push(new THREE.Vector3(x, y, Math.sin(t * 0.6) * body.radius * 0.08));
  }
  const radius = body.radius * (figure.tail === 'plume' ? 0.16 : 0.07);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 28, radius, 8, false), material));
}

function bone(from: THREE.Vector3, to: THREE.Vector3, radiusTop: number, radiusBottom: number, material: THREE.Material) {
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = Math.max(direction.length(), 0.02);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 16), material);
  mesh.position.copy(from).lerp(to, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return mesh;
}

function ball(material: THREE.Material, position: [number, number, number], scale: [number, number, number]) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  return mesh;
}

let grain: THREE.DataTexture | null = null;

function furGrain() {
  if (grain) return grain;
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const shade = 225 + Math.floor((n - Math.floor(n)) * 30);
      const index = (y * size + x) * 4;
      data[index] = shade;
      data[index + 1] = shade;
      data[index + 2] = shade;
      data[index + 3] = 255;
    }
  }
  grain = new THREE.DataTexture(data, size, size);
  grain.wrapS = THREE.RepeatWrapping;
  grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(4, 4);
  grain.colorSpace = THREE.SRGBColorSpace;
  grain.needsUpdate = true;
  return grain;
}

function fur(color: string, map?: THREE.Texture) {
  if (map) {
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.needsUpdate = true;
  }
  return new THREE.MeshPhysicalMaterial({
    color,
    ...(map ? { map } : { map: furGrain() }),
    roughness: 0.74,
    metalness: 0,
    sheen: 0.32,
    sheenRoughness: 0.62,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.28),
  });
}

function pattern(figure: Figure): THREE.DataTexture {
  const width = 96;
  const height = 96;
  const data = new Uint8Array(width * height * 4);
  const main = rgb(figure.coat.main);
  const dark = rgb(figure.coat.dark);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let ink = false;
      if (figure.stripes) ink = Math.sin((y / height) * Math.PI * 9) > 0.2 && Math.sin((x / width) * Math.PI * 3) > -0.2;
      if (figure.spots) {
        const dx = (x % 18) - 9;
        const dy = (y % 18) - 9;
        if (dx * dx + dy * dy < 16) ink = true;
      }
      const color = ink ? dark : main;
      const index = (y * width + x) * 4;
      data[index] = color[0];
      data[index + 1] = color[1];
      data[index + 2] = color[2];
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function rgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function addGarment(
  group: THREE.Group,
  figure: Figure,
  kind: GarmentKind,
  texture: THREE.Texture,
  body: Body,
  legs: { x: number; z: number }[],
) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const cloth = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
  if (kind === 'harness') {
    const bib = new THREE.Mesh(new THREE.PlaneGeometry(body.radius * 1.5, body.radius * 1.1), cloth);
    bib.position.set(body.length * 0.22, body.centerY - body.radius * 0.15, 0);
    bib.rotation.y = Math.PI / 2;
    group.add(bib);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(body.length * 0.4, body.radius * 1.3), cloth);
    back.position.set(0, body.centerY + body.radius * 0.85, 0);
    back.rotation.x = -Math.PI / 2.3;
    group.add(back);
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(Math.max(body.radius * 1.15, 0.16), 0.018, 8, 28),
      new THREE.MeshStandardMaterial({ color: '#6B5346', roughness: 0.62 }),
    );
    strap.rotation.y = Math.PI / 2;
    strap.position.set(body.length * 0.08, body.centerY, 0);
    group.add(strap);
    return;
  }
  if (kind === 'cooling') {
    const cape = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), cloth);
    cape.scale.set(body.length * 0.42, body.radius * 0.55, body.radius * 1.05);
    cape.position.set(0, body.centerY + body.radius * 0.35, 0);
    group.add(cape);
    return;
  }
  group.add(ball(cloth, [0, body.centerY, 0], [body.length * 0.38, body.radius * 0.95, body.radius * 1.05]));
  legs.forEach((leg) => {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(body.radius * 0.28, body.radius * 0.22, Math.max(figure.height * 0.45, 0.08), 12), cloth);
    sleeve.position.set(leg.x, Math.max(figure.height * 0.55, body.centerY * 0.45), leg.z);
    group.add(sleeve);
  });
}
