import * as THREE from "three";

export function handleHeadRotation(
  bone: THREE.Bone,
  mouseX: number,
  mouseY: number
) {
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, mouseX * 0.4, 0.05);
  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, -mouseY * 0.2, 0.05);
}
