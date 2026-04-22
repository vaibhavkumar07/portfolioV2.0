import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

const Scene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(14.5, w / h, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xff4f1f, 2.0);
    keyLight.position.set(3, 8, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x0084d6, 0.8);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0x00c853, 1.5, 25);
    rimLight.position.set(-2, 4, -4);
    scene.add(rimLight);

    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };

    let headBone: THREE.Bone | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let modelLoaded = false;
    let ivrGroup: THREE.Group | null = null;

    const loader = new GLTFLoader();
    loader.load(
      "/model/character.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if ((child as THREE.Bone).isBone && child.name === "spine006") {
            headBone = child as THREE.Bone;
          }
        });
        scene.add(model);
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          mixer.clipAction(gltf.animations[0]).play();
        }
        modelLoaded = true;
      },
      undefined,
      () => {
        ivrGroup = buildIVRScene();
        scene.add(ivrGroup);
      }
    );

    function buildIVRScene(): THREE.Group {
      const group = new THREE.Group();

      // Central IVR hub — glowing orange sphere
      const hubMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 32, 32),
        new THREE.MeshStandardMaterial({
          color: 0xff4f1f, emissive: 0xff4f1f,
          emissiveIntensity: 0.8, roughness: 0.15, metalness: 0.7,
        })
      );
      hubMesh.userData.type = "hub";
      group.add(hubMesh);

      // Concentric signal-wave rings
      const ringColors = [0xff4f1f, 0xff6a3d, 0xff8c6a];
      [0.75, 1.25, 1.85].forEach((r, i) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r, 0.025 - i * 0.004, 12, 80),
          new THREE.MeshStandardMaterial({
            color: ringColors[i], emissive: ringColors[i],
            emissiveIntensity: 0.5 - i * 0.1,
            transparent: true, opacity: 0.55 - i * 0.1,
            roughness: 0.3, metalness: 0.5,
          })
        );
        ring.rotation.x = Math.PI / 2;
        ring.userData.rotZ = (i % 2 === 0 ? 1 : -1) * (0.006 + i * 0.003);
        ring.userData.type = "ring";
        group.add(ring);
      });

      // IVR node network — menu option nodes
      const nodeData = [
        { pos: [3.0,  1.8,  0.3], col: 0x0084d6, label: "Press 1" },
        { pos: [-3.2, 1.2,  0.2], col: 0x00c853, label: "Press 2" },
        { pos: [ 2.0, -2.2,  0.4], col: 0xff4f1f, label: "Press 3" },
        { pos: [-2.0, -2.0, -0.3], col: 0x0084d6, label: "Press 4" },
        { pos: [ 0.3,  3.2,  0.0], col: 0x00c853, label: "Main"    },
        { pos: [ 3.5, -0.8, -0.8], col: 0xff4f1f, label: "Hold"    },
      ];

      nodeData.forEach(({ pos, col }, i) => {
        const [x, y, z] = pos;
        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 16),
          new THREE.MeshStandardMaterial({
            color: col, emissive: col,
            emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.6,
          })
        );
        node.position.set(x, y, z);
        node.userData = { type: "node", baseY: y, floatPhase: i * 1.05, baseX: x, floatPhaseX: i * 0.7 };
        group.add(node);

        // Connection line hub → node
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, z),
        ]);
        const line = new THREE.Line(lineGeo,
          new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.22 })
        );
        line.userData.type = "line";
        group.add(line);

        // Outer small ring at node
        const nodeRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.35, 0.012, 8, 32),
          new THREE.MeshStandardMaterial({
            color: col, emissive: col, emissiveIntensity: 0.4,
            transparent: true, opacity: 0.35,
          })
        );
        nodeRing.position.set(x, y, z);
        nodeRing.rotation.x = Math.PI / 2;
        nodeRing.userData = { type: "nodeRing", rotZ: (i % 2 === 0 ? 1 : -1) * 0.012 };
        group.add(nodeRing);
      });

      // Waveform bars — audio/voice visualization
      const barCount = 22;
      for (let i = 0; i < barCount; i++) {
        const baseH = 0.15 + Math.random() * 0.7;
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, baseH, 0.055),
          new THREE.MeshStandardMaterial({
            color: 0xff4f1f, emissive: 0xff4f1f,
            emissiveIntensity: 0.5, transparent: true, opacity: 0.55,
          })
        );
        bar.position.set(-2.8 + i * 0.27, -3.6, -0.5);
        bar.userData = { type: "bar", baseH, wavePhase: i * 0.28, waveSpeed: 2.2 + Math.random() * 0.8 };
        group.add(bar);
      }

      // Floating data packets — small cubes moving in space
      for (let i = 0; i < 14; i++) {
        const packet = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.08, 0.08),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x0084d6 : 0x00c853,
            emissive: i % 2 === 0 ? 0x0084d6 : 0x00c853,
            emissiveIntensity: 0.7, transparent: true, opacity: 0.7,
          })
        );
        const angle = (i / 14) * Math.PI * 2;
        const radius = 1.5 + (i % 3) * 0.8;
        packet.position.set(
          Math.cos(angle) * radius,
          -1.5 + (i % 4) * 1.2,
          Math.sin(angle) * radius
        );
        packet.userData = { type: "packet", angle, radius, speed: 0.4 + i * 0.05, baseY: packet.position.y, phase: i * 0.6 };
        group.add(packet);
      }

      // Corner bracket decorations (IVR UI feel)
      const bracketMat = new THREE.LineBasicMaterial({ color: 0xff4f1f, transparent: true, opacity: 0.3 });
      const bracketPts = [
        [-4.5, 4, 0], [-4.5, 3, 0], [-4.5, 3, 0], [-3.5, 3, 0],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(bracketPts), bracketMat));
      const bracketPts2 = [
        [4.5, 4, 0], [4.5, 3, 0], [4.5, 3, 0], [3.5, 3, 0],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(bracketPts2), bracketMat));

      group.position.set(0, 12.3, 0);
      return group;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.05;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.05;

      if (modelLoaded && headBone) {
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, smoothMouse.x * 0.4, 0.05);
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, -smoothMouse.y * 0.2, 0.05);
      }
      if (mixer) mixer.update(delta);

      if (ivrGroup) {
        ivrGroup.children.forEach((child) => {
          const { type } = child.userData;
          if (type === "ring") {
            (child as THREE.Mesh).rotation.z = elapsed * child.userData.rotZ;
          } else if (type === "node") {
            child.position.y = child.userData.baseY + Math.sin(elapsed + child.userData.floatPhase) * 0.18;
          } else if (type === "nodeRing") {
            (child as THREE.Mesh).rotation.z = elapsed * child.userData.rotZ;
          } else if (type === "bar") {
            const s = 0.25 + 0.75 * Math.abs(Math.sin(elapsed * child.userData.waveSpeed + child.userData.wavePhase));
            child.scale.y = s;
          } else if (type === "packet") {
            const { angle, radius, speed, baseY, phase } = child.userData;
            const a = angle + elapsed * speed * 0.15;
            child.position.x = Math.cos(a) * radius;
            child.position.z = Math.sin(a) * radius;
            child.position.y = baseY + Math.sin(elapsed * 0.8 + phase) * 0.3;
            child.rotation.x = elapsed * 0.5;
            child.rotation.y = elapsed * 0.7;
          } else if (type === "hub") {
            const s = 1 + 0.06 * Math.sin(elapsed * 2.5);
            child.scale.setScalar(s);
          }
        });

        ivrGroup.rotation.y = smoothMouse.x * 0.35;
        ivrGroup.rotation.x = smoothMouse.y * 0.18;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default Scene;
