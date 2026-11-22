import * as THREE from 'three';

/**
 * Component reutilizable: oclusión arquitectónica y colisión de paseo.
 * Unidades métricas, eje Y vertical. Sin dependencia del resto de la escena.
 */
export const PLAN = Object.freeze({
  xMin: -7.42, xMax: 7.42, zMin: -2.27, zMax: 2.27,
  divisions: [-2.6, 2.6], halfDoor: 0.79, radius: 0.24
});

export function crossDivision(a, b, xLine, halfDoor = PLAN.halfDoor, radius = PLAN.radius) {
  const crosses = (a.x < xLine && b.x >= xLine) || (a.x > xLine && b.x <= xLine);
  return !crosses || Math.abs(b.z) + radius <= halfDoor;
}

export function canMoveWithinPlan(a, b, obstacles = [], plan = PLAN) {
  const r = plan.radius;
  if (b.x < plan.xMin + r || b.x > plan.xMax - r || b.z < plan.zMin + r || b.z > plan.zMax - r) return false;
  for (const x of plan.divisions) {
    // Evita atravesar paredes aun cuando el paso de tiempo excede su espesor.
    if (!crossDivision(a, b, x, plan.halfDoor, r)) return false;
    if (Math.abs(b.x - x) < r + 0.11 && Math.abs(b.z) + r > plan.halfDoor) return false;
  }
  for (const p of obstacles) {
    if (b.x > p.x1-r && b.x < p.x2+r && b.z > p.z1-r && b.z < p.z2+r) return false;
  }
  return true;
}

export class ArchitecturalOcclusion {
  constructor({fade = 0.075, response = 9} = {}) {
    this.fade = fade;
    this.response = response;
    this.enabled = true;
    this.registry = [];
    this.ray = new THREE.Raycaster();
    this.start = new THREE.Vector3();
    this.dir = new THREE.Vector3();
  }
  register(mesh, kind = 'wall') {
    if (!mesh.isMesh) throw new TypeError('Se espera THREE.Mesh');
    // Material por superficie, nunca modificar el material compartido del resto de la obra.
    const source = mesh.material;
    mesh.material = source.clone();
    mesh.material.transparent = true;
    mesh.material.opacity = 1;
    mesh.material.depthWrite = true;
    mesh.material.side = THREE.DoubleSide;
    this.registry.push({mesh, kind, opacity: 1});
    return mesh;
  }
  update(cameraPosition, subject, delta = 1/60) {
    this.start.copy(cameraPosition);
    this.dir.copy(subject).sub(cameraPosition);
    const distance = this.dir.length();
    const occluding = new Set();
    if (this.enabled && distance > 0.1) {
      this.ray.set(this.start, this.dir.normalize());
      this.ray.near = 0.03;
      this.ray.far = distance - 0.17;
      const hits = this.ray.intersectObjects(this.registry.map(x => x.mesh), false);
      for (const hit of hits) occluding.add(hit.object);
    }
    const rate = 1 - Math.exp(-this.response * Math.min(delta, 0.12));
    for (const o of this.registry) {
      const roofOverCamera = o.kind === 'roof' && cameraPosition.y > 2.9;
      const wanted = this.enabled && (occluding.has(o.mesh) || roofOverCamera) ? this.fade : 1;
      o.opacity += (wanted - o.opacity) * rate;
      if (Math.abs(o.opacity - wanted) < 0.008) o.opacity = wanted;
      o.mesh.material.opacity = o.opacity;
      o.mesh.material.depthWrite = o.opacity > 0.985;
      o.mesh.visible = o.opacity > 0.02;
    }
  }
  clear() {
    for (const o of this.registry) o.mesh.material.dispose();
    this.registry.length = 0;
  }
}

export function slidePlayer(position, displacement, obstacles, plan = PLAN) {
  // Resolver cada eje separadamente: contacto suave en bordes y marcos.
  const nextX = {x: position.x + displacement.x, z: position.z};
  const x = canMoveWithinPlan(position, nextX, obstacles, plan) ? nextX.x : position.x;
  const nextZ = {x, z: position.z + displacement.z};
  const z = canMoveWithinPlan({x, z:position.z}, nextZ, obstacles, plan) ? nextZ.z : position.z;
  return {x,z};
}
