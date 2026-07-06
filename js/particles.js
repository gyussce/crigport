/* ═══ CRIG® — WebGL particle portrait (hero) ═══ */
import * as THREE from "three";
import { reduced } from "./utils.js";

export const heroState = { ready: false, p: 0, setScroll: () => {}, intro: () => {}, choreograph: () => {}, setActive: () => {} };

export function initParticles() {
  const canvas = document.getElementById("gl");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    document.getElementById("hero").classList.add("no-webgl");
    return Promise.resolve();
  }
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 30);
  camera.position.z = 2.6;

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: reduced ? 1 : 0 },   // intro assemble 0→1
    uScroll: { value: 0 },                    // scroll disperse 0→1
    uMouse: { value: new THREE.Vector2(99, 99) },
    uMouseStrength: { value: 1 },              // fades out during choreography
    uDepthScale: { value: 1 },                 // relief exaggeration while spinning
    uSwirl: { value: 0 },                      // vortex blowout
    uSize: { value: 10 },
    uTexture: { value: null },
    uAccent: { value: new THREE.Color("#c8ff3d") },
  };

  return new Promise((resolve) => {
    new THREE.TextureLoader().load(
      "assets/hero_head.jpg",
      (tex) => {
        try {
          const img = tex.image;
          const S = 256;
          const c2d = document.createElement("canvas");
          c2d.width = c2d.height = S;
          const ctx = c2d.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, S, S);
          const data = ctx.getImageData(0, 0, S, S).data;

          const N = 190; // N*N particles
          const count = N * N;
          const PLANE = 2.15;
          const pos = new Float32Array(count * 3);
          const uv = new Float32Array(count * 2);
          const rand = new Float32Array(count * 3);
          const depth = new Float32Array(count);

          let i = 0;
          for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
              const u = x / (N - 1), v = y / (N - 1);
              const px = Math.min(S - 1, Math.round(u * (S - 1)));
              const py = Math.min(S - 1, Math.round((1 - v) * (S - 1)));
              const k = (py * S + px) * 4;
              const bright = (data[k] * 0.299 + data[k + 1] * 0.587 + data[k + 2] * 0.114) / 255;
              pos[i * 3] = (u - 0.5) * PLANE;
              pos[i * 3 + 1] = (v - 0.5) * PLANE;
              pos[i * 3 + 2] = bright * 0.35;
              uv[i * 2] = u; uv[i * 2 + 1] = v;
              rand[i * 3] = (Math.random() - 0.5) * 2;
              rand[i * 3 + 1] = (Math.random() - 0.5) * 2;
              rand[i * 3 + 2] = Math.random();
              depth[i] = bright;
              i++;
            }
          }

          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
          geo.setAttribute("aRandom", new THREE.BufferAttribute(rand, 3));
          geo.setAttribute("aDepth", new THREE.BufferAttribute(depth, 1));

          uniforms.uTexture.value = tex;
          const spacing = PLANE / N;
          const setSize = () => {
            uniforms.uSize.value = ((window.innerHeight * 0.5) / Math.tan((25 * Math.PI) / 180)) * spacing * 2.1 * DPR;
          };
          setSize();

          const mat = new THREE.ShaderMaterial({
            uniforms,
            transparent: true,
            depthTest: false,
            vertexShader: `
              uniform float uTime, uProgress, uScroll, uSize, uMouseStrength, uDepthScale, uSwirl;
              uniform vec2 uMouse;
              attribute vec3 aRandom;
              attribute float aDepth;
              varying vec2 vUv;
              varying float vFade;
              void main() {
                vUv = uv;
                vec3 pos = position;
                // depth relief (exaggerated while the head spins)
                pos.z *= uDepthScale;
                // idle breathing
                pos.z += sin(pos.x * 3.0 + uTime * 0.7) * 0.02 + cos(pos.y * 2.6 + uTime * 0.55) * 0.02;
                // mouse repulsion
                vec2 toM = pos.xy - uMouse;
                float d = length(toM);
                float force = smoothstep(0.55, 0.0, d) * uMouseStrength;
                pos.xy += normalize(toM + 0.0001) * force * 0.28;
                pos.z += force * 0.5 * (0.4 + aDepth);
                // intro: fly in from a scattered sphere
                vec3 scatter = aRandom * 4.5 + vec3(0.0, 0.0, 2.0 * aRandom.z);
                float t = clamp(uProgress * 1.6 - aRandom.z * 0.6, 0.0, 1.0);
                t = t * t * (3.0 - 2.0 * t);
                pos = mix(scatter, pos, t);
                // vortex: swirl particles around the center, deeper ones lag behind
                float ang = uSwirl * (0.6 + aRandom.z * 1.3) * (1.2 - aDepth * 0.4);
                float ca = cos(ang), sa = sin(ang);
                pos.xy = mat2(ca, -sa, sa, ca) * pos.xy;
                pos.z += uSwirl * aDepth * 0.9;
                // scroll: disintegrate
                pos += aRandom * uScroll * uScroll * 7.0;
                pos.z += uScroll * aDepth * 2.0;
                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = uSize * (1.0 / -mv.z) * (0.75 + aDepth * 0.55);
                vFade = t * (1.0 - uScroll * 0.85);
              }`,
            fragmentShader: `
              uniform sampler2D uTexture;
              uniform float uScroll;
              uniform vec3 uAccent;
              varying vec2 vUv;
              varying float vFade;
              void main() {
                if (length(gl_PointCoord - 0.5) > 0.5) discard;
                vec3 col = texture2D(uTexture, vUv).rgb * 0.85;
                col = mix(col, uAccent * dot(col, vec3(0.6)), uScroll * 0.9);
                gl_FragColor = vec4(col, vFade);
              }`,
          });

          const points = new THREE.Points(geo, mat);
          scene.add(points);

          // mouse → world coords on the portrait plane
          const halfH = Math.tan((25 * Math.PI) / 180) * camera.position.z;
          window.addEventListener("mousemove", (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            uniforms.uMouse.value.set(nx * halfH * camera.aspect, ny * halfH);
            if (heroState.p < 0.04) // choreography owns the rotation once scrolling starts
              gsap.to(points.rotation, { y: nx * 0.12, x: -ny * 0.08, duration: 1.2, ease: "power2.out", overwrite: "auto" });
          });

          window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            setSize();
          });

          const clock = new THREE.Clock();
          const loop = () => {
            uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
          };
          let active = true;
          renderer.setAnimationLoop(loop);

          const map = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)));
          const smooth = (x) => x * x * (3 - 2 * x);

          heroState.ready = true;
          heroState.setScroll = (v) => (uniforms.uScroll.value = v);
          heroState.intro = () => gsap.to(uniforms.uProgress, { value: 1, duration: 2.4, ease: "power3.out" });
          heroState.setActive = (on) => {
            if (on === active) return;
            active = on;
            renderer.setAnimationLoop(on ? loop : null);
          };
          heroState.choreograph = (p) => {
            heroState.p = p;
            uniforms.uMouseStrength.value = Math.max(0, 1 - p * 5);
            // act I (0→0.3): text departs, head holds the stage
            // act II (0.3→0.72): full spin — relief deepens, camera pushes in
            const b = smooth(map(p, 0.3, 0.72));
            points.rotation.y = b * Math.PI * 2;
            points.rotation.x = Math.sin(b * Math.PI) * 0.18;
            uniforms.uDepthScale.value = 1 + b * 2.3;
            camera.position.z = 2.6 - Math.sin(b * Math.PI) * 0.5;
            // act III (0.7→1): vortex blowout
            const c = map(p, 0.7, 1);
            uniforms.uSwirl.value = c * 3.1;
            uniforms.uScroll.value = c;
          };
          resolve();
        } catch (err) {
          console.warn("Particle init failed:", err);
          document.getElementById("hero").classList.add("no-webgl");
          resolve();
        }
      },
      undefined,
      () => { document.getElementById("hero").classList.add("no-webgl"); resolve(); }
    );
  });
}
