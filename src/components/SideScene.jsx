import React, { useEffect, useRef } from 'react';
import { Mesh, NoBlending, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector4, WebGLRenderer } from 'three';
import { MAX_DROPS, fragmentShader, vertexShader } from './liquidMetalShader';

/*
 * Liquid metal in the empty space to the right of the page content: a core droplet with
 * five smaller droplets orbiting it. Every few seconds they spiral inward, melt together
 * into one big drop, hold, and split apart again. Raymarched on the GPU (see
 * liquidMetalShader.js) and lit by a procedural photo studio, so it reads as polished
 * mercury with a real soft shadow. It tilts toward the mouse, stirs when you hover or
 * scroll fast, and sits on a canvas behind all content so text always stays on top.
 */

const FOV = 30;
const HALF = 1.9; // half the drawn square, in world units (room for the orbits + shadow)
const TAN_HALF = Math.tan((FOV * Math.PI) / 360);
const CAM_Z = HALF / TAN_HALF;
const CYCLE = 12; // seconds per spread → merge → split cycle
const MIN_BOX = 150; // px – below this the side space is too narrow, so nothing is drawn
const MAX_BOX = 440;

// Orbiting droplets: size, orbit radius, angular speed, start angle, orbit-plane tilt.
const SATELLITES = [
  { r: 0.26, orbit: 0.92, speed: 0.5, phase: 0.2, tiltX: 0.35, tiltZ: 0.2 },
  { r: 0.2, orbit: 0.8, speed: -0.62, phase: 1.6, tiltX: -0.5, tiltZ: 0.6 },
  { r: 0.23, orbit: 0.98, speed: 0.44, phase: 3.1, tiltX: 0.9, tiltZ: -0.3 },
  { r: 0.17, orbit: 0.74, speed: 0.7, phase: 4.3, tiltX: -0.2, tiltZ: -0.8 },
  { r: 0.21, orbit: 0.86, speed: -0.52, phase: 5.4, tiltX: 0.6, tiltZ: 0.9 },
];

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// 0 = droplets spread out, 1 = fused into one big drop.
const mergeCycle = (time) => {
  const t = time % CYCLE;
  return smoothstep(4.5, 7, t) - smoothstep(9, 11.5, t);
};

export default function SideScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return undefined; // no WebGL – the page simply stays as it is
    }
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;

    const drops = Array.from({ length: MAX_DROPS }, () => new Vector4());
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      blending: NoBlending, // the shader writes premultiplied colour + alpha itself
      uniforms: {
        uDrops: { value: drops },
        uTime: { value: 0 },
        uBlend: { value: 0.3 },
        uWobble: { value: 0.03 },
        uCamZ: { value: CAM_Z },
        uCamY: { value: -0.25 },
        uTanHalf: { value: TAN_HALF },
        uPixel: { value: 0.01 },
        uGround: { value: -1.3 },
        uShadow: { value: 0.38 },
      },
    });
    const quad = new Mesh(new PlaneGeometry(1, 1), material);
    quad.frustumCulled = false;
    const scene = new Scene();
    scene.add(quad);
    const camera = new OrthographicCamera(); // unused by the shader, required by render()

    // ---- layout (cached; re-measured on resize / content changes) ----
    let quality = 1; // lowered automatically if the GPU can't keep up
    const page = { W: 0, H: 0, gutter: 0, marquee: null, pixelRatio: 1 };
    const measure = () => {
      const pr = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
      if (window.innerWidth !== page.W || window.innerHeight !== page.H || pr !== page.pixelRatio) {
        page.W = window.innerWidth;
        page.H = window.innerHeight;
        page.pixelRatio = pr;
        renderer.setPixelRatio(pr);
        renderer.setSize(page.W, page.H);
      }
      const ref = document.querySelector('#journey');
      if (ref) {
        const box = ref.getBoundingClientRect();
        page.gutter = page.W - (box.right - parseFloat(getComputedStyle(ref).paddingRight));
      }
      const marquee = document.querySelector('#horizontal-scroll');
      if (marquee) {
        const r = marquee.getBoundingClientRect();
        page.marquee = [r.top + window.scrollY, r.bottom + window.scrollY];
      }
    };
    measure();
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(document.body);
    window.addEventListener('resize', measure);

    const mouse = { x: -9999, y: -9999, nx: 0, ny: 0 };
    const onMouse = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.nx = (e.clientX / page.W) * 2 - 1;
      mouse.ny = (e.clientY / page.H) * 2 - 1;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    let raf = 0;
    let last = performance.now();
    const start = last;
    let lastScroll = window.scrollY;
    let velocity = 0;
    let opacity = 0;
    let energy = 0;
    let orbitClock = 0;
    let yaw = 0;
    let pitch = 0;
    let drewLastFrame = false;
    let slowFrames = 0;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      // The first rAF timestamp can be earlier than performance.now() at mount – never go negative.
      const rawDt = Math.max((now - last) / 1000, 0);
      const dt = Math.min(rawDt, 0.05);
      last = Math.max(now, last);
      const time = Math.max((now - start) / 1000, 0);
      const scrollY = window.scrollY;
      velocity += ((scrollY - lastScroll) / Math.max(dt, 0.001) - velocity) * 0.2;
      lastScroll = scrollY;
      const ease = 1 - Math.exp(-dt * 5);

      const { W, H, gutter } = page;
      const box = Math.min(gutter, MAX_BOX);
      const visible = box >= MIN_BOX;
      if (!visible && !drewLastFrame) return;

      const cx = W - gutter / 2;
      const cy = H * 0.56;

      // Fade back while the big marquee sentence passes in front of it.
      let dim = 1;
      if (page.marquee) {
        const top = scrollY + cy - box / 2;
        const bottom = scrollY + cy + box / 2;
        if (bottom > page.marquee[0] && top < page.marquee[1]) dim = 0.3;
      }
      opacity = Math.min(1, Math.max(0, opacity + ((visible ? dim : 0) - opacity) * ease));
      canvas.style.opacity = opacity.toFixed(3);
      drewLastFrame = opacity > 0.01;

      renderer.setScissorTest(false);
      renderer.clear();
      if (!drewLastFrame) return;

      // If frames are consistently slow, render at a lower resolution (twice at most).
      if (rawDt > 0.028) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 90 && quality > 0.6) {
        quality *= 0.75;
        slowFrames = 0;
        measure();
      }

      // Hovering near it (or scrolling fast) stirs the liquid.
      const dist = Math.hypot(mouse.x - cx, mouse.y - cy) / (box * 0.4);
      energy += (1 - smoothstep(0.7, 1.5, dist) - energy) * ease;
      const speed = Math.min(Math.abs(velocity) / 2000, 2);
      orbitClock += dt * (1 + speed + energy * 1.5);
      yaw += (mouse.nx * 0.6 - yaw) * ease;
      pitch += (mouse.ny * 0.35 - pitch) * ease;

      const m = mergeCycle(time);
      const push = 1 + Math.min(Math.abs(velocity) / 6000, 0.12); // flung outward by fast scrolling
      const bob = Math.sin(time * 0.8) * 0.05;
      const cyaw = Math.cos(yaw);
      const syaw = Math.sin(yaw);
      const cpit = Math.cos(pitch);
      const spit = Math.sin(pitch);

      drops[0].set(0, bob, 0, 0.42 + 0.4 * m);
      SATELLITES.forEach((s, i) => {
        // spiral inward (like water circling a drain) while merging
        const a = s.phase + orbitClock * s.speed + m * 2.2 * Math.sign(s.speed);
        let x = Math.cos(a) * s.orbit;
        let y = 0;
        let z = Math.sin(a) * s.orbit;
        const cx1 = Math.cos(s.tiltX);
        const sx1 = Math.sin(s.tiltX);
        [y, z] = [y * cx1 - z * sx1, y * sx1 + z * cx1];
        const cz1 = Math.cos(s.tiltZ);
        const sz1 = Math.sin(s.tiltZ);
        [x, y] = [x * cz1 - y * sz1, x * sz1 + y * cz1];
        // whole constellation tilts toward the mouse (the studio stays put, so reflections move)
        [x, z] = [x * cyaw + z * syaw, -x * syaw + z * cyaw];
        [y, z] = [y * cpit - z * spit, y * spit + z * cpit];
        const k = (1 - m) * push;
        drops[i + 1].set(x * k, y * k + bob, z * k, s.r * (1 + 1.6 * m));
      });

      const u = material.uniforms;
      u.uTime.value = time;
      u.uWobble.value = 0.03 + 0.05 * m + energy * 0.03 + Math.min(Math.abs(velocity) / 8000, 0.03);
      u.uPixel.value = (2 * HALF) / (box * page.pixelRatio);

      renderer.setScissorTest(true);
      const x = cx - box / 2;
      const y = H - (cy + box / 2); // WebGL counts from the bottom
      renderer.setViewport(x, y, box, box);
      renderer.setScissor(x, y, box, box);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('mousemove', onMouse);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="side-scene fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0 }}
    />
  );
}
