import React, { useEffect, useRef } from 'react';
import {
  CanvasTexture,
  DirectionalLight,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/*
 * A single glossy black 3D decagon (a thick 10-sided slab with bevelled edges, like polished
 * obsidian) floating in the empty space to the right of the page content. It is lit like a
 * real object – studio reflections, key and rim lights, a soft shadow beneath it – spins
 * slowly on its axis while gently wobbling, tilts toward the mouse, and every few seconds
 * grows big, pauses, and shrinks back.
 * Drawn on a canvas that sits behind all content, so text always stays on top.
 */

const FOV = 30;
const HALF = 2.5; // half the drawn square, in world units (the solid's radius is ~1 at rest)
const CAM_DIST = HALF / Math.tan((FOV * Math.PI) / 360);
const BIG = 1.55; // scale at the peak of the grow cycle
const CYCLE = 11; // seconds per grow-and-shrink cycle
const MIN_SIZE = 56; // px – below this the side space is too narrow, so nothing is drawn

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// 0 = normal size, 1 = big. Small for a while, grows, holds, shrinks back.
const growCycle = (time) => {
  const t = time % CYCLE;
  return smoothstep(4, 6.2, t) - smoothstep(7.8, 10, t);
};

// Revolving this profile with 10 segments gives the decagon: flat 10-sided faces front and
// back, a bevel around each, and ten side faces.
function decagonGeometry() {
  const profile = [
    [0, -0.34],
    [0.8, -0.34],
    [0.93, -0.2],
    [0.93, 0.2],
    [0.8, 0.34],
    [0, 0.34],
  ].map(([x, y]) => new Vector2(x, y));
  return new LatheGeometry(profile, 10);
}

function shadowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.22)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export default function SideScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let renderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return undefined; // no WebGL – the page simply stays as it is
    }
    renderer.autoClear = false;
    renderer.toneMapping = NeutralToneMapping;
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    // Set after the reflection map is built – building it resets the clear colour to opaque.
    renderer.setClearColor(0x000000, 0);

    const key = new DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 4, 5);
    const rim = new DirectionalLight(0xffffff, 1);
    rim.position.set(-4, 2, -3);
    scene.add(key, rim);

    const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
    camera.position.set(0, 0, CAM_DIST);

    // tilt (mouse) > float (bob, grow, wobble) > body (spins on its own axis)
    const tilt = new Group();
    const float = new Group();
    scene.add(tilt);
    tilt.add(float);

    const geometry = decagonGeometry();
    const material = new MeshPhysicalMaterial({
      color: 0x111111,
      metalness: 0.2,
      roughness: 0.28,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      flatShading: true,
      envMapIntensity: 1.7,
    });
    const body = new Mesh(geometry, material);
    float.add(body);

    const shadowMap = shadowTexture();
    const shadowMaterial = new MeshBasicMaterial({
      map: shadowMap,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
    const shadow = new Mesh(new PlaneGeometry(2.4, 0.5), shadowMaterial);
    scene.add(shadow); // not tilted – it stays on the "floor"

    // ---- layout (cached; re-measured on resize / content changes) ----
    const page = { W: 0, H: 0, gutter: 0, marquee: null };
    const measure = () => {
      const pr = Math.min(window.devicePixelRatio || 1, 1.75);
      // Resizing the canvas clears it, so only do it when the window actually changed
      // (this also runs whenever the page's height changes).
      if (window.innerWidth !== page.W || window.innerHeight !== page.H || pr !== renderer.getPixelRatio()) {
        page.W = window.innerWidth;
        page.H = window.innerHeight;
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
    let drewLastFrame = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      // The first rAF timestamp can be earlier than performance.now() at mount – never go negative.
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = Math.max(now, last);
      const time = Math.max((now - start) / 1000, 0);
      const scrollY = window.scrollY;
      velocity += ((scrollY - lastScroll) / Math.max(dt, 0.001) - velocity) * 0.2;
      lastScroll = scrollY;
      const ease = 1 - Math.exp(-dt * 5);

      const { W, H, gutter } = page;
      const size = Math.min(gutter * 0.5, 210); // on-screen diameter at normal size
      const visible = size >= MIN_SIZE;
      if (!visible && !drewLastFrame) return;

      const cx = W - gutter * 0.5;
      const cy = H * 0.55;

      // Fade back while the big marquee sentence passes in front of it.
      let dim = 1;
      if (page.marquee) {
        const top = scrollY + cy - size;
        const bottom = scrollY + cy + size;
        if (bottom > page.marquee[0] && top < page.marquee[1]) dim = 0.3;
      }
      opacity = Math.min(1, Math.max(0, opacity + ((visible ? dim : 0) - opacity) * ease));
      canvas.style.opacity = opacity.toFixed(3);
      drewLastFrame = opacity > 0.01;

      // Hovering near it makes it swell slightly and spin faster.
      const grow = growCycle(time);
      const scale = 1 + (BIG - 1) * grow;
      const dist = Math.hypot(mouse.x - cx, mouse.y - cy) / ((size / 2) * scale);
      energy += (1 - smoothstep(0.8, 1.6, dist) - energy) * ease;

      body.rotation.y += dt * (0.45 + Math.min(Math.abs(velocity) / 2500, 1.5) + energy * 1.2);

      // Face turned toward the viewer, slowly wobbling so the bevels keep catching the light.
      const bob = Math.sin(time * 0.9) * 0.08;
      float.rotation.x = 1.22 + Math.sin(time * 0.45) * 0.24;
      float.rotation.z = 0.3 + Math.sin(time * 0.31) * 0.22;
      float.position.y = bob;
      float.scale.setScalar(scale + energy * 0.08);

      tilt.rotation.x += (mouse.ny * 0.2 - tilt.rotation.x) * ease;
      tilt.rotation.y += (mouse.nx * 0.35 - tilt.rotation.y) * ease;

      // The shadow spreads with the solid's size and softens as it floats up.
      const s = float.scale.x;
      shadow.position.y = -1.15 * s - 0.1;
      shadow.scale.set(s * (1 - bob * 0.8), s * (1 - bob * 0.8), 1);
      shadowMaterial.opacity = 0.75 - bob * 1.5;

      renderer.setScissorTest(false);
      renderer.clear();
      if (!drewLastFrame) return;
      renderer.setScissorTest(true);
      const box = size * HALF;
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
      geometry.dispose();
      material.dispose();
      shadow.geometry.dispose();
      shadowMaterial.dispose();
      shadowMap.dispose();
      envMap.dispose();
      pmrem.dispose();
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
