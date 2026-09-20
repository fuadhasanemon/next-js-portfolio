import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/* Curl-driven particle shell. Raw three.js keeps the bundle to one dependency
   and lets us own the frame loop (pause offscreen / hidden / reduced-motion). */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform vec2  uPointer;
  uniform float uSize;
  uniform float uAmp;

  attribute float aScale;
  attribute float aSeed;

  varying float vDepth;
  varying float vSeed;

  // -- simplex noise (Ashima / webgl-noise, trimmed) --------------------
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  // ---------------------------------------------------------------------

  void main() {
    vec3 pos = position;
    float t = uTime * 0.12;

    // Two octaves of flow so the shell breathes instead of pulsing uniformly.
    float n1 = snoise(pos * 0.85 + vec3(t, t * 0.7, -t));
    float n2 = snoise(pos * 1.9 - vec3(t * 1.3, -t, t * 0.4));
    float disp = (n1 * 0.7 + n2 * 0.3) * uAmp;

    pos += normalize(pos) * disp;

    // Pointer parallax - soft and mass-like, never a 1:1 cursor follow.
    pos.x += uPointer.x * 0.35 * (0.4 + aScale);
    pos.y += uPointer.y * 0.35 * (0.4 + aScale);

    // Scroll dissolves the shell outward and tips it away from the viewer.
    pos += normalize(pos) * uScroll * 1.6;
    pos.y -= uScroll * 1.2;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (14.0 / -mv.z);

    vDepth = clamp((-mv.z - 3.0) / 7.0, 0.0, 1.0);
    vSeed = aSeed;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform float uOpacity;

  varying float vDepth;
  varying float vSeed;

  void main() {
    // Round, soft-edged sprite - cheaper and crisper than a texture.
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.06, d);
    if (alpha < 0.01) discard;

    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 1.0, vSeed));
    col = mix(col, uColorC, smoothstep(0.55, 1.0, vSeed));

    // Far particles cool off, so the shell reads as volume rather than a disc.
    col = mix(col, uColorA * 0.55, vDepth * 0.65);

    gl_FragColor = vec4(col, alpha * uOpacity * (1.0 - vDepth * 0.55));
  }
`;

const PALETTE = {
  light: { a: [0.09, 0.62, 0.58], b: [0.45, 0.24, 0.85], c: [0.95, 0.45, 0.18], opacity: 0.85 },
  dark: { a: [0.11, 0.78, 0.72], b: [0.62, 0.45, 0.98], c: [0.98, 0.52, 0.24], opacity: 0.95 },
};

const HeroField = ({ className = "" }) => {
  const mountRef = useRef(null);
  const apiRef = useRef(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
      } catch {
        return; // No WebGL - the CSS aurora behind the canvas carries the hero.
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isCoarse = window.matchMedia("(pointer: coarse)").matches;
      const width = () => mount.clientWidth || 1;
      const height = () => mount.clientHeight || 1;

      const maxDpr = isCoarse ? 1.5 : 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.setSize(width(), height(), false);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width() / height(), 0.1, 100);
      camera.position.set(0, 0, 7.2);

      // Fibonacci sphere - even coverage, no polar clumping.
      const count = isCoarse ? 2600 : window.innerWidth < 1280 ? 4200 : 6000;
      const positions = new Float32Array(count * 3);
      const scales = new Float32Array(count);
      const seeds = new Float32Array(count);
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        const jitter = 0.94 + Math.random() * 0.12;
        positions[i * 3] = Math.cos(theta) * radius * 2.15 * jitter;
        positions[i * 3 + 1] = y * 2.15 * jitter;
        positions[i * 3 + 2] = Math.sin(theta) * radius * 2.15 * jitter;
        scales[i] = 0.55 + Math.random() * 0.85;
        seeds[i] = Math.random();
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

      const uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uSize: { value: isCoarse ? 2.1 : 2.6 },
        uAmp: { value: 0.42 },
        uColorA: { value: new THREE.Vector3(...PALETTE.dark.a) },
        uColorB: { value: new THREE.Vector3(...PALETTE.dark.b) },
        uColorC: { value: new THREE.Vector3(...PALETTE.dark.c) },
        uOpacity: { value: 0 }, // faded in once the first frame is on screen
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const pointer = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      let scroll = 0;
      let targetOpacity = PALETTE.dark.opacity;

      const onPointerMove = (e) => {
        const rect = mount.getBoundingClientRect();
        target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        target.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };
      const onPointerLeave = () => {
        target.x = 0;
        target.y = 0;
      };
      const onScroll = () => {
        scroll = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)));
      };
      const onResize = () => {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
        renderer.setSize(width(), height(), false);
        camera.aspect = width() / height();
        // Pull the camera back on narrow viewports so the shell stays whole.
        camera.position.z = width() < 640 ? 8.6 : width() < 1024 ? 7.8 : 7.2;
        camera.updateProjectionMatrix();
      };

      let visible = true;
      const io =
        typeof IntersectionObserver !== "undefined"
          ? new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
              threshold: 0,
            })
          : null;
      if (io) io.observe(mount);

      if (!isCoarse) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        mount.addEventListener("pointerleave", onPointerLeave);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      onResize();
      onScroll();

      const clock = new THREE.Clock();
      let raf = 0;
      let fade = 0;

      const render = () => {
        raf = requestAnimationFrame(render);
        if (!visible || document.hidden) return;

        const dt = Math.min(clock.getDelta(), 0.05);
        uniforms.uTime.value += reduced ? 0 : dt;

        // Eased follow keeps the parallax weighty instead of twitchy.
        pointer.x += (target.x - pointer.x) * Math.min(1, dt * 3.2);
        pointer.y += (target.y - pointer.y) * Math.min(1, dt * 3.2);
        uniforms.uPointer.value.set(pointer.x, pointer.y);

        uniforms.uScroll.value += (scroll - uniforms.uScroll.value) * Math.min(1, dt * 4);

        fade += (targetOpacity - fade) * Math.min(1, dt * 1.4);
        uniforms.uOpacity.value = fade;

        if (!reduced) {
          points.rotation.y += dt * 0.055;
          points.rotation.x = Math.sin(uniforms.uTime.value * 0.18) * 0.12 + pointer.y * 0.1;
          points.rotation.z = pointer.x * 0.06;
        }

        renderer.render(scene, camera);
      };
      render();

      apiRef.current = {
        setTheme(mode) {
          const p = PALETTE[mode] || PALETTE.dark;
          uniforms.uColorA.value.set(...p.a);
          uniforms.uColorB.value.set(...p.b);
          uniforms.uColorC.value.set(...p.c);
          targetOpacity = p.opacity;
        },
      };

      cleanup = () => {
        cancelAnimationFrame(raf);
        if (io) io.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        mount.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
        apiRef.current = null;
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (apiRef.current) {
      apiRef.current.setTheme(resolvedTheme === "light" ? "light" : "dark");
    }
  }, [resolvedTheme]);

  return <div ref={mountRef} aria-hidden="true" className={className} />;
};

export default HeroField;
