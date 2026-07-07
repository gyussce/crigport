/* ═══ CRIG® — WebGL particle portrait (hero) ═══ */
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
const smooth = (x) => x * x * (3 - 2 * x);
const map01 = (v, a, b) => clamp01((v - a) / (b - a));

function ellipseMask(u, v, cx, cy, rx, ry) {
  const dx = (u - cx) / rx;
  const dy = (v - cy) / ry;
  return smooth(clamp01(1.15 - Math.sqrt(dx * dx + dy * dy)));
}

function getStageScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w < 560) return 0.62;
  if (h < 620 && w > 760) return 0.5;
  if (w < 900) return 0.74;
  return 0.88;
}

function getCameraZ() {
  if (window.innerHeight < 620 && window.innerWidth > 760) return 3.35;
  if (window.innerWidth < 560) return 3.42;
  return 2.82;
}

export function initParticles() {
  const canvas = document.getElementById("gl");
  const hero = document.getElementById("hero");
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
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
  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 40);
  camera.position.z = getCameraZ();

  const stage = new THREE.Group();
  stage.scale.setScalar(getStageScale());
  scene.add(stage);

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: reduced ? 1 : 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uMouseStrength: { value: finePointer && !reduced ? 1 : 0 },
    uDepthScale: { value: 1.35 },
    uSwirl: { value: 0 },
    uSize: { value: 10 },
    uTexture: { value: null },
    uCold: { value: new THREE.Color("#18c7ff") },
    uHot: { value: new THREE.Color("#ff9b32") },
    uAcid: { value: new THREE.Color("#bd5bff") },
  };

  return new Promise((resolve) => {
    new THREE.TextureLoader().load(
      "assets/hero_head.jpg",
      (tex) => {
        try {
          tex.colorSpace = THREE.SRGBColorSpace;
          const img = tex.image;
          const S = 320;
          const c2d = document.createElement("canvas");
          c2d.width = c2d.height = S;
          const ctx = c2d.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, S, S);
          const data = ctx.getImageData(0, 0, S, S).data;

          const luminanceAt = (x, y) => {
            const px = Math.min(S - 1, Math.max(0, x));
            const py = Math.min(S - 1, Math.max(0, y));
            const k = (py * S + px) * 4;
            return (data[k] * 0.299 + data[k + 1] * 0.587 + data[k + 2] * 0.114) / 255;
          };

          const isSmall = window.innerWidth < 700 || window.innerHeight < 540;
          const N = isSmall ? 164 : 218;
          const PLANE = 2.22;
          const pos = [];
          const uv = [];
          const rand = [];
          const depth = [];
          const maskAttr = [];
          const edgeAttr = [];

          for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
              const u = x / (N - 1);
              const v = y / (N - 1);
              const px = Math.min(S - 1, Math.round(u * (S - 1)));
              const py = Math.min(S - 1, Math.round((1 - v) * (S - 1)));
              const k = (py * S + px) * 4;
              const bright = luminanceAt(px, py);
              const edge = clamp01(
                Math.abs(luminanceAt(px + 2, py) - luminanceAt(px - 2, py)) * 2.1 +
                Math.abs(luminanceAt(px, py + 2) - luminanceAt(px, py - 2)) * 2.1
              );

              const head = ellipseMask(u, v, 0.52, 0.55, 0.19, 0.25);
              const chest = ellipseMask(u, v, 0.52, 0.27, 0.36, 0.34);
              const shoulders = ellipseMask(u, v, 0.52, 0.12, 0.55, 0.24);
              const tie = ellipseMask(u, v, 0.52, 0.25, 0.07, 0.38);
              const portrait = Math.max(head, chest * 0.94, shoulders * 0.8, tie);
              const aura = ellipseMask(u, v, 0.51, 0.43, 0.56, 0.62) * 0.16 * smooth(bright);
              const keep = portrait > 0.028 || Math.random() < aura;
              if (!keep) continue;

              const subjectDepth = portrait * 0.64 + head * 0.28 + tie * 0.18;
              const relief = clamp01(subjectDepth + bright * 0.22 + edge * 0.42);
              const jitter = portrait < 0.1 ? (Math.random() - 0.5) * 0.018 : 0;

              pos.push((u - 0.5) * PLANE, (v - 0.5) * PLANE * 1.05, relief * 0.52 + jitter);
              uv.push(u, v);
              rand.push((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, Math.random());
              depth.push(relief);
              maskAttr.push(clamp01(portrait + aura));
              edgeAttr.push(edge);
            }
          }

          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
          geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
          geo.setAttribute("aRandom", new THREE.Float32BufferAttribute(rand, 3));
          geo.setAttribute("aDepth", new THREE.Float32BufferAttribute(depth, 1));
          geo.setAttribute("aMask", new THREE.Float32BufferAttribute(maskAttr, 1));
          geo.setAttribute("aEdge", new THREE.Float32BufferAttribute(edgeAttr, 1));

          uniforms.uTexture.value = tex;
          const spacing = PLANE / N;
          const setPointSize = () => {
            const halfFov = (camera.fov * 0.5 * Math.PI) / 180;
            uniforms.uSize.value = ((window.innerHeight * 0.5) / Math.tan(halfFov)) * spacing * (isSmall ? 2.75 : 2.28) * DPR;
          };
          setPointSize();

          const mat = new THREE.ShaderMaterial({
            uniforms,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: `
              uniform float uTime, uProgress, uScroll, uSize, uMouseStrength, uDepthScale, uSwirl;
              uniform vec2 uMouse;
              attribute vec3 aRandom;
              attribute float aDepth;
              attribute float aMask;
              attribute float aEdge;
              varying vec2 vUv;
              varying float vFade;
              varying float vDepth;
              varying float vMask;
              varying float vEdge;
              varying float vPulse;

              mat2 rot(float a) {
                float c = cos(a), s = sin(a);
                return mat2(c, -s, s, c);
              }

              void main() {
                vUv = uv;
                vDepth = aDepth;
                vMask = aMask;
                vEdge = aEdge;

                vec3 pos = position;
                pos.z *= uDepthScale;

                float breathing = sin(pos.x * 7.4 + uTime * 1.25) + cos(pos.y * 6.2 - uTime * 0.9);
                pos.z += breathing * 0.022 * (0.4 + aMask);
                pos.xy += vec2(
                  sin(pos.y * 4.8 + uTime * 0.62),
                  cos(pos.x * 4.1 - uTime * 0.48)
                ) * 0.013 * aMask;

                vec2 toM = pos.xy - uMouse;
                float d = length(toM);
                float force = smoothstep(0.62, 0.0, d) * uMouseStrength;
                pos.xy += normalize(toM + 0.0001) * force * 0.24;
                pos.z += force * 0.45 * (0.35 + aDepth);

                vec3 scatter = vec3(
                  aRandom.x * 3.7,
                  aRandom.y * 2.9,
                  1.4 + aRandom.z * 2.4
                );
                float t = clamp(uProgress * 1.55 - aRandom.z * 0.55, 0.0, 1.0);
                t = t * t * (3.0 - 2.0 * t);
                pos = mix(scatter, pos, t);

                float ring = sin(length(pos.xy) * 12.0 - uTime * 2.7 + aRandom.z * 2.4);
                vPulse = smoothstep(0.88, 1.0, ring) * aMask * (1.0 - uScroll);
                pos.z += vPulse * 0.075;

                float swirl = uSwirl * (0.85 + aRandom.z * 1.8) * (1.15 - aDepth * 0.28);
                pos.xy = rot(swirl) * pos.xy;
                pos.z += uSwirl * aDepth * 0.9;

                pos += aRandom * uScroll * uScroll * 7.2;
                pos.z += uScroll * aDepth * 2.4;

                vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = uSize * (1.0 / -mv.z) * (0.7 + aDepth * 0.74 + aEdge * 0.35);
                vFade = t * (1.0 - uScroll * 0.88);
              }`,
            fragmentShader: `
              uniform sampler2D uTexture;
              uniform float uScroll;
              uniform vec3 uCold;
              uniform vec3 uHot;
              uniform vec3 uAcid;
              varying vec2 vUv;
              varying float vFade;
              varying float vDepth;
              varying float vMask;
              varying float vEdge;
              varying float vPulse;

              void main() {
                vec2 p = gl_PointCoord - 0.5;
                float dotShape = 1.0 - smoothstep(0.35, 0.5, length(p));
                if (dotShape <= 0.0) discard;

                vec3 texCol = texture2D(uTexture, vUv).rgb;
                float luma = dot(texCol, vec3(0.299, 0.587, 0.114));
                vec3 grade = mix(uCold, uHot, smoothstep(0.18, 0.88, luma + vEdge * 0.32));
                vec3 col = mix(grade * (0.38 + luma * 0.96), texCol, 0.2);
                col += uAcid * vEdge * 1.08;
                col += uHot * vPulse * 0.86;
                col = mix(col, uAcid * (0.45 + vDepth), uScroll * 0.82);

                float alpha = dotShape * vFade * (0.16 + vMask * 0.74 + vEdge * 0.3);
                gl_FragColor = vec4(col, alpha);
              }`,
          });

          const points = new THREE.Points(geo, mat);
          points.renderOrder = 1;
          points.position.y = window.innerWidth < 560 ? 0.08 : 0;
          stage.add(points);

          const fxMaterials = [];
          const ringGroup = new THREE.Group();
          ringGroup.position.set(0.02, -0.02, 0.04);
          stage.add(ringGroup);

          const ringSpecs = [
            [0.78, 0.006, "#18c7ff", 0.72, 0.22],
            [1.08, 0.006, "#bd5bff", 0.58, -0.12],
            [1.36, 0.005, "#ff9b32", 0.42, 0.32],
          ];

          ringSpecs.forEach(([radius, tube, color, opacity, y], i) => {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(radius, tube, 8, 220),
              new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })
            );
            ring.renderOrder = 3;
            ring.userData.baseOpacity = opacity;
            ring.position.y = y;
            ring.scale.y = 0.32 + i * 0.025;
            ring.rotation.x = i * 0.05;
            ring.rotation.z = i * 0.36;
            ringGroup.add(ring);
            fxMaterials.push(ring.material);
          });

          const ribbonGroup = new THREE.Group();
          ribbonGroup.position.z = 0.1;
          stage.add(ribbonGroup);

          const makeRibbon = ({ color, opacity, amp, y, z, phase, speed, freq, width }) => {
            const segments = isSmall ? 150 : 240;
            const positions = new Float32Array(segments * 3);
            const geoLine = new THREE.BufferGeometry();
            geoLine.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            const lineMat = new THREE.LineBasicMaterial({
              color,
              transparent: true,
              opacity,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            lineMat.userData.baseOpacity = opacity;
            const line = new THREE.Line(geoLine, lineMat);
            line.renderOrder = 4;
            line.userData = { positions, amp, y, z, phase, speed, freq, width, segments };
            ribbonGroup.add(line);
            fxMaterials.push(lineMat);
          };

          makeRibbon({ color: "#18c7ff", opacity: 0.68, amp: 0.23, y: 0.2, z: 0.44, phase: 0.1, speed: 0.78, freq: 1.15, width: 3.5 });
          makeRibbon({ color: "#bd5bff", opacity: 0.54, amp: 0.18, y: -0.08, z: 0.58, phase: 1.5, speed: -0.58, freq: 1.65, width: 3.22 });
          makeRibbon({ color: "#ff9b32", opacity: 0.42, amp: 0.14, y: -0.32, z: 0.72, phase: 2.8, speed: 0.68, freq: 2.05, width: 2.82 });

          const updateRibbons = (time, scroll) => {
            ribbonGroup.children.forEach((line, lineIndex) => {
              const d = line.userData;
              const fade = reduced ? 0.18 : 1 - scroll * 0.72;
              line.material.opacity = line.material.userData.baseOpacity * fade;
              for (let i = 0; i < d.segments; i++) {
                const t = i / (d.segments - 1);
                const x = (t - 0.5) * d.width;
                const orbital = Math.sin(t * TAU + d.phase + time * d.speed) * 0.12;
                const y = d.y + Math.sin(t * TAU * d.freq + d.phase + time * d.speed) * d.amp
                  + Math.sin(t * TAU * 2.6 - time * 0.42 + lineIndex) * d.amp * 0.28;
                const z = d.z + Math.cos(t * TAU + d.phase + time * d.speed) * 0.14 + orbital;
                d.positions[i * 3] = x;
                d.positions[i * 3 + 1] = y;
                d.positions[i * 3 + 2] = z;
              }
              line.geometry.attributes.position.needsUpdate = true;
            });
          };

          const halfH = Math.tan((camera.fov * 0.5 * Math.PI) / 180) * camera.position.z;
          if (finePointer && !reduced) {
            window.addEventListener("mousemove", (e) => {
              const nx = (e.clientX / window.innerWidth) * 2 - 1;
              const ny = -(e.clientY / window.innerHeight) * 2 + 1;
              uniforms.uMouse.value.set(nx * halfH * camera.aspect, ny * halfH);
              if (heroState.p < 0.04) {
                gsap.to(stage.rotation, {
                  y: nx * 0.16,
                  x: -ny * 0.08,
                  duration: 1.1,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              }
            });
          }

          window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.position.z = getCameraZ();
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            stage.scale.setScalar(getStageScale());
            points.position.y = window.innerWidth < 560 ? 0.08 : 0;
            setPointSize();
          });

          const clock = new THREE.Clock();
          const loop = () => {
            const time = clock.getElapsedTime();
            uniforms.uTime.value = time;
            if (!reduced) {
              updateRibbons(time, uniforms.uScroll.value);
              ringGroup.children.forEach((ring, i) => {
                ring.rotation.z += (0.0014 + i * 0.00055) * (1 + uniforms.uSwirl.value * 0.4);
                ring.material.opacity = ring.userData.baseOpacity * (1 - uniforms.uScroll.value * 0.62);
              });
              ribbonGroup.rotation.y = Math.sin(time * 0.28) * 0.08;
              ribbonGroup.rotation.x = Math.cos(time * 0.22) * 0.035;
            } else {
              updateRibbons(time, 0.92);
            }
            renderer.render(scene, camera);
          };

          let active = true;
          renderer.setAnimationLoop(loop);

          heroState.ready = true;
          heroState.setScroll = (v) => (uniforms.uScroll.value = v);
          heroState.intro = () => gsap.to(uniforms.uProgress, { value: 1, duration: 2.35, ease: "power3.out" });
          heroState.setActive = (on) => {
            if (on === active) return;
            active = on;
            renderer.setAnimationLoop(on ? loop : null);
          };
          heroState.choreograph = (p) => {
            heroState.p = p;
            uniforms.uMouseStrength.value = Math.max(0, 1 - p * 5);

            const b = smooth(map01(p, 0.28, 0.72));
            stage.rotation.y = b * TAU + Math.sin(b * Math.PI) * 0.12;
            stage.rotation.x = Math.sin(b * Math.PI) * 0.2;
            uniforms.uDepthScale.value = 1.35 + b * 2.15;
            camera.position.z = getCameraZ() - Math.sin(b * Math.PI) * 0.5;

            const c = map01(p, 0.7, 1);
            uniforms.uSwirl.value = c * 3.25;
            uniforms.uScroll.value = c;
            fxMaterials.forEach((m) => {
              if (m.userData.baseOpacity) m.opacity = m.userData.baseOpacity * (1 - c * 0.82);
            });
          };

          resolve();
        } catch (err) {
          console.warn("Particle init failed:", err);
          hero.classList.add("no-webgl");
          resolve();
        }
      },
      undefined,
      () => {
        hero.classList.add("no-webgl");
        resolve();
      }
    );
  });
}
