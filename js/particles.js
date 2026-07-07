/* ═══ CRIG® — passive WebGL ringed planet (hero) ═══ */
import * as THREE from "three";
import { finePointer, reduced } from "./utils.js";

export const heroState = {
  ready: false,
  p: 0,
  setScroll: () => {},
  intro: () => {},
  choreograph: () => {},
  setActive: () => {},
};

const TAU = Math.PI * 2;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function getStageScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 560) return 0.82;
  if (h < 620 && w > 760) return 0.56;
  if (w < 900) return 0.92;
  return 1.08;
}

function getCameraZ() {
  if (window.innerHeight < 620 && window.innerWidth > 760) return 3.65;
  if (window.innerWidth < 560) return 3.8;
  return 3.15;
}

function positionStage(stage) {
  if (window.innerWidth < 560) stage.position.set(0, 0.14, 0);
  else if (window.innerHeight < 620 && window.innerWidth > 760) stage.position.set(0, 0, 0);
  else stage.position.set(0, -0.04, 0);
}

export function initParticles() {
  const canvas = document.getElementById("gl");
  const hero = document.getElementById("hero");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (e) {
    hero.classList.add("no-webgl");
    return Promise.resolve();
  }

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.z = getCameraZ();

  const stage = new THREE.Group();
  stage.scale.setScalar(getStageScale());
  positionStage(stage);
  scene.add(stage);

  const planetUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uFade: { value: 1 },
    uBase: { value: new THREE.Color("#4e1b86") },
    uLight: { value: new THREE.Color("#18c7ff") },
    uShadow: { value: new THREE.Color("#12081e") },
    uAccent: { value: new THREE.Color("#ff54c8") },
  };

  const planetMat = new THREE.ShaderMaterial({
    uniforms: planetUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewNormal;

      void main() {
        vNormal = normalize(normal);
        vViewNormal = normalize(normalMatrix * normal);
        vec3 pos = position;
        float ripple = sin(position.y * 9.0 + uTime * 0.45) * 0.009
          + sin(position.x * 7.0 - uTime * 0.32) * 0.006;
        pos += normal * ripple;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }`,
    fragmentShader: `
      uniform float uTime;
      uniform float uScroll;
      uniform float uFade;
      uniform vec3 uBase;
      uniform vec3 uLight;
      uniform vec3 uShadow;
      uniform vec3 uAccent;
      varying vec3 vNormal;
      varying vec3 vViewNormal;

      void main() {
        vec3 n = normalize(vViewNormal);
        vec3 modelN = normalize(vNormal);
        float light = dot(n, normalize(vec3(-0.42, 0.32, 0.84))) * 0.5 + 0.5;
        float bands = sin((modelN.y + uTime * 0.012) * 16.0)
          + sin((modelN.y - uTime * 0.009) * 31.0) * 0.34;
        float belt = smoothstep(0.18, 0.98, bands * 0.5 + 0.5);
        float fresnel = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.1);
        vec3 col = mix(uShadow, uBase, light);
        col = mix(col, uLight, belt * 0.2);
        col += uAccent * fresnel * 0.72;
        col = mix(col, uAccent * 0.55, uScroll * 0.16);
        gl_FragColor = vec4(col, 0.9 * uFade);
      }`,
  });

  const planet = new THREE.Mesh(new THREE.SphereGeometry(0.72, 96, 64), planetMat);
  planet.renderOrder = 2;
  stage.add(planet);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, 64, 48),
    new THREE.MeshBasicMaterial({
      color: "#bd5bff",
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.renderOrder = 1;
  stage.add(glow);

  const ringGroup = new THREE.Group();
  ringGroup.rotation.x = 1.02;
  ringGroup.rotation.z = -0.28;
  stage.add(ringGroup);

  const ringSpecs = [
    { radius: 1.02, tube: 0.012, color: "#18c7ff", opacity: 0.46 },
    { radius: 1.16, tube: 0.008, color: "#bd5bff", opacity: 0.42 },
    { radius: 1.32, tube: 0.005, color: "#ff9b32", opacity: 0.26 },
  ];
  const ringMats = [];

  ringSpecs.forEach((spec, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(spec.radius, spec.tube, 12, 220),
      new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    ring.renderOrder = 3 + i;
    ring.scale.y = 0.38;
    ring.userData.baseOpacity = spec.opacity;
    ringGroup.add(ring);
    ringMats.push(ring.material);
  });

  const starCount = window.innerWidth < 560 ? 180 : 320;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const palette = [new THREE.Color("#bd5bff"), new THREE.Color("#18c7ff"), new THREE.Color("#f3ecf8")];
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 7.5;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
    starPositions[i * 3 + 2] = -1.2 - Math.random() * 2.6;
    const c = palette[i % palette.length];
    starColors[i * 3] = c.r;
    starColors[i * 3 + 1] = c.g;
    starColors[i * 3 + 2] = c.b;
  }

  const starsGeo = new THREE.BufferGeometry();
  starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starsGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
  const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(stars);

  const pointer = { x: 0, y: 0 };
  if (finePointer && !reduced) {
    window.addEventListener("mousemove", (e) => {
      pointer.x = ((e.clientX / window.innerWidth) * 2 - 1) * 0.1;
      pointer.y = (-(e.clientY / window.innerHeight) * 2 + 1) * 0.06;
    });
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = getCameraZ();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    stage.scale.setScalar(getStageScale());
    positionStage(stage);
  });

  const clock = new THREE.Clock();
  let active = true;
  let scrollProgress = 0;

  const loop = () => {
    const time = clock.getElapsedTime();
    planetUniforms.uTime.value = time;
    planetUniforms.uScroll.value = scrollProgress;

    if (!reduced) {
      planet.rotation.y = time * 0.08 + scrollProgress * 0.32;
      planet.rotation.x = Math.sin(time * 0.18) * 0.035;
      glow.rotation.y = -time * 0.05;
      ringGroup.rotation.z = -0.28 + time * 0.035 + scrollProgress * 0.22;
      ringGroup.rotation.x = 1.02 + Math.sin(time * 0.16) * 0.035;
      stage.rotation.y += (pointer.x + scrollProgress * 0.08 - stage.rotation.y) * 0.05;
      stage.rotation.x += (pointer.y - stage.rotation.x) * 0.05;
      stars.rotation.y = time * 0.006;
      stars.rotation.x = Math.sin(time * 0.08) * 0.02;
    }

    const fade = 1 - scrollProgress * 0.42;
    planetUniforms.uFade.value = fade;
    glow.material.opacity = 0.15 * fade;
    ringMats.forEach((mat, i) => {
      mat.opacity = ringSpecs[i].opacity * (1 - scrollProgress * 0.35);
    });
    stars.material.opacity = 0.38 * (1 - scrollProgress * 0.28);

    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(loop);

  heroState.ready = true;
  heroState.setScroll = (v) => {
    scrollProgress = clamp01(v);
  };
  heroState.intro = () => {
    const base = getStageScale();
    gsap.fromTo(stage.scale, { x: base * 0.86, y: base * 0.86, z: base * 0.86 }, {
      x: base, y: base, z: base, duration: 1.5, ease: "power3.out",
    });
    gsap.fromTo(stage.rotation, { z: -0.08 }, { z: 0, duration: 1.5, ease: "power3.out" });
  };
  heroState.setActive = (on) => {
    if (on === active) return;
    active = on;
    renderer.setAnimationLoop(on ? loop : null);
  };
  heroState.choreograph = (p) => {
    heroState.p = p;
    scrollProgress = clamp01(p);
    stage.position.y = (window.innerWidth < 560 ? 0.14 : -0.04) + scrollProgress * -0.16;
  };

  return Promise.resolve();
}
