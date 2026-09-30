import React, { useEffect, useRef } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineDashedMaterial,
  LineLoop,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

/*
 * Two monochrome 3D "particle sculptures" living in the empty space left and right of the
 * page content. Each is a cloud of dots that reassembles into a new shape whenever you move
 * into another section, tilts toward the mouse, spreads out while you scroll fast or hover
 * near it, and is circled by thin orbit rings. Drawn on one canvas that sits behind all
 * content, so text always stays on top.
 */

const COUNT = 1100; // dots per sculpture
const FOV = 30;
const BOX = 1.9; // each sculpture is drawn in a square viewport this many times its size
const CAM_DIST = BOX / Math.tan((FOV * Math.PI) / 360); // sculpture radius 1 = half its size
const INK = new Color('#111111');
const MIN_SIZE = 80; // px – below this the side space is too narrow, so nothing is drawn

// Section anchors and the shape each side takes while that section is on screen.
const SECTIONS = ['#home', '#skills', '#journey', '#projects', '#reviews', '#contact'];
const LEFT_SHAPES = ['sphere', 'cube', 'helix', 'knot', 'icosa', 'galaxy'];
const RIGHT_SHAPES = ['torus', 'icosa', 'wave', 'cube', 'sphere', 'knot'];

/* ---------- shapes: COUNT points each, roughly within a unit sphere ---------- */

function random(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const unitVector = (rand) => {
  const z = rand() * 2 - 1;
  const a = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  return [Math.cos(a) * s, z, Math.sin(a) * s];
};

const SHAPES = {
  sphere(put) {
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      put(i, Math.cos(golden * i) * r * 0.92, y * 0.92, Math.sin(golden * i) * r * 0.92);
    }
  },
  cube(put, rand) {
    const h = 0.6;
    const corners = [];
    for (const x of [-h, h]) for (const y of [-h, h]) for (const z of [-h, h]) corners.push([x, y, z]);
    const edges = [];
    corners.forEach((a, i) =>
      corners.forEach((b, j) => {
        if (j > i && a.filter((v, k) => v !== b[k]).length === 1) edges.push([a, b]);
      })
    );
    for (let i = 0; i < COUNT; i++) {
      if (i % 5 < 3) {
        const [a, b] = edges[i % 12];
        const t = rand();
        put(i, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
      } else {
        const p = [(rand() * 2 - 1) * h, (rand() * 2 - 1) * h, (rand() * 2 - 1) * h];
        p[Math.floor(rand() * 3)] = rand() < 0.5 ? -h : h;
        put(i, ...p);
      }
    }
  },
  torus(put) {
    const U = 44;
    const V = 25;
    for (let i = 0; i < COUNT; i++) {
      const u = ((i % U) / U) * Math.PI * 2;
      const v = (Math.floor(i / U) / V) * Math.PI * 2;
      const ring = 0.66 + 0.28 * Math.cos(v);
      put(i, Math.cos(u) * ring, 0.28 * Math.sin(v), Math.sin(u) * ring);
    }
  },
  knot(put, rand) {
    for (let i = 0; i < COUNT; i++) {
      const t = (i / COUNT) * Math.PI * 2;
      const r = 2 + Math.cos(3 * t);
      const [jx, jy, jz] = unitVector(rand);
      const j = 0.045 * rand();
      put(i, r * Math.cos(2 * t) * 0.3 + jx * j, Math.sin(3 * t) * 0.3 + jy * j, r * Math.sin(2 * t) * 0.3 + jz * j);
    }
  },
  helix(put, rand) {
    const turns = 2.2;
    const strand = (t, side) => {
      const a = t * Math.PI * 2 * turns + side * Math.PI;
      return [Math.cos(a) * 0.48, (t - 0.5) * 1.8, Math.sin(a) * 0.48];
    };
    const strandPoints = Math.floor(COUNT * 0.8);
    for (let i = 0; i < COUNT; i++) {
      if (i < strandPoints) {
        put(i, ...strand(i / strandPoints, i % 2));
      } else {
        const t = (Math.floor(rand() * 18) + 0.5) / 18;
        const a = strand(t, 0);
        const b = strand(t, 1);
        const k = rand();
        put(i, a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
      }
    }
  },
  icosa(put, rand) {
    const p = (1 + Math.sqrt(5)) / 2;
    const raw = [
      [-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0],
      [0, -1, p], [0, 1, p], [0, -1, -p], [0, 1, -p],
      [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1],
    ];
    const edges = [];
    raw.forEach((a, i) =>
      raw.forEach((b, j) => {
        if (j > i && Math.abs(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) - 2) < 0.01) edges.push([a, b]);
      })
    );
    const norm = Math.hypot(1, p) / 0.92;
    const verts = 12 * 5; // a few dots stacked on each vertex read as "nodes"
    for (let i = 0; i < COUNT; i++) {
      if (i < verts) {
        const v = raw[i % 12];
        const [jx, jy, jz] = unitVector(rand);
        put(i, v[0] / norm + jx * 0.02, v[1] / norm + jy * 0.02, v[2] / norm + jz * 0.02);
      } else {
        const [a, b] = edges[i % 30];
        const t = rand();
        put(i, (a[0] + (b[0] - a[0]) * t) / norm, (a[1] + (b[1] - a[1]) * t) / norm, (a[2] + (b[2] - a[2]) * t) / norm);
      }
    }
  },
  wave(put, rand) {
    const n = 33;
    for (let i = 0; i < COUNT; i++) {
      const x = i < n * n ? ((i % n) / (n - 1)) * 1.8 - 0.9 : rand() * 1.8 - 0.9;
      const z = i < n * n ? (Math.floor(i / n) / (n - 1)) * 1.8 - 0.9 : rand() * 1.8 - 0.9;
      put(i, x, 0.24 * Math.sin(x * 3.2) * Math.cos(z * 3.2), z);
    }
  },
  galaxy(put, rand) {
    for (let i = 0; i < COUNT; i++) {
      const r = Math.pow(rand(), 0.7) * 0.95;
      const a = ((i % 3) * Math.PI * 2) / 3 + r * 3.4 + (rand() - 0.5) * 0.5 * (1 - r * 0.4);
      put(i, Math.cos(a) * r, (rand() - 0.5) * 0.1 * (1 - r), Math.sin(a) * r);
    }
  },
};

// Points are shuffled so any prefix is an even sample of the shape (used to thin out
// small sculptures via drawRange).
function buildShape(name, seed) {
  const rand = random(seed);
  const out = new Float32Array(COUNT * 3);
  SHAPES[name]((i, x, y, z) => {
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }, rand);
  for (let i = COUNT - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    for (let k = 0; k < 3; k++) {
      const tmp = out[i * 3 + k];
      out[i * 3 + k] = out[j * 3 + k];
      out[j * 3 + k] = tmp;
    }
  }
  return out;
}

/* ---------- materials ---------- */

const vertexShader = /* glsl */ `
  attribute vec4 aRand;
  uniform float uTime;
  uniform float uScatter;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vShade;
  void main() {
    vec3 p = position;
    float drift = sin(uTime * 1.3 + aRand.w * 40.0) * 0.018;
    p += aRand.xyz * (drift + uScatter * (0.35 + aRand.w * 0.65));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = uSize * uPixelRatio * (${CAM_DIST.toFixed(4)} / depth) * (0.7 + aRand.w * 0.6);
    vShade = clamp((${CAM_DIST.toFixed(4)} - depth) * 0.55 + 0.5, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vShade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.3, d);
    gl_FragColor = vec4(uColor, edge * uOpacity * mix(0.16, 0.85, vShade));
  }
`;

const pointsMaterial = (size) =>
  new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScatter: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0 },
      uColor: { value: INK },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });

function circleGeometry(radius, segments = 160) {
  const pts = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts[i * 3] = Math.cos(a) * radius;
    pts[i * 3 + 1] = Math.sin(a) * radius;
  }
  return new BufferGeometry().setAttribute('position', new BufferAttribute(pts, 3));
}

/* ---------- one sculpture ---------- */

function createSculpture(stops, shapes, seed, direction) {
  const scene = new Scene();
  const tilt = new Group(); // follows the mouse
  const spin = new Group(); // turns continuously
  scene.add(tilt);
  tilt.add(spin);

  const rand = random(seed);
  const aRand = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    const [x, y, z] = unitVector(rand);
    aRand.set([x, y, z, rand()], i * 4);
  }
  const positions = Float32Array.from(shapes[stops[0]]);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aRand', new BufferAttribute(aRand, 4));
  const material = pointsMaterial(2);
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  spin.add(points);

  // Orbit rings (one solid, one dashed), each carrying a small satellite dot.
  const ringDefs = [
    { radius: 1.22, tiltX: 1.2, tiltY: 0.25 * direction, speed: 0.35 * direction, dashed: false },
    { radius: 1.38, tiltX: 1.75, tiltY: -0.55 * direction, speed: -0.22 * direction, dashed: true },
  ];
  const rings = ringDefs.map((def, i) => {
    const holder = new Group();
    holder.rotation.set(def.tiltX, def.tiltY, 0);
    const ringMaterial = def.dashed
      ? new LineDashedMaterial({ color: INK, dashSize: 0.045, gapSize: 0.07, transparent: true, opacity: 0 })
      : new LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });
    const ring = new LineLoop(circleGeometry(def.radius), ringMaterial);
    if (def.dashed) ring.computeLineDistances();

    const satGeometry = new BufferGeometry();
    satGeometry.setAttribute('position', new BufferAttribute(new Float32Array(3), 3));
    satGeometry.setAttribute('aRand', new BufferAttribute(new Float32Array([0, 0, 0, 0.5]), 4));
    const satMaterial = pointsMaterial(6);
    const satellite = new Points(satGeometry, satMaterial);
    satellite.frustumCulled = false;

    ring.add(satellite);
    holder.add(ring);
    tilt.add(holder);
    return { ...def, ring, ringMaterial, satellite, satMaterial, phase: i * 2.1, baseOpacity: def.dashed ? 0.26 : 0.14 };
  });

  return {
    scene,
    tilt,
    spin,
    geometry,
    positions,
    material,
    rings,
    stops,
    direction,
    opacity: 0,
    scatter: 0,
    energy: 0,
    layout: { cx: 0, cy: 0, size: 0 },
  };
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

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
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;

    const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
    camera.position.set(0, 0, CAM_DIST);

    const shapeCache = {};
    const shapesFor = (names, seed) => {
      names.forEach((name, i) => {
        shapeCache[name] ??= buildShape(name, seed + i * 7);
      });
      return shapeCache;
    };
    const sides = [
      createSculpture(LEFT_SHAPES, shapesFor(LEFT_SHAPES, 11), 101, 1),
      createSculpture(RIGHT_SHAPES, shapesFor(RIGHT_SHAPES, 11), 202, -1),
    ];

    // ---- layout (cached; re-measured on resize / content changes) ----
    const page = { W: 0, H: 0, contentLeft: 0, contentRight: 0, heroLeft: 0, heroHeight: 0, tops: [], marquee: null };
    const measure = () => {
      const pr = Math.min(window.devicePixelRatio || 1, 1.75);
      // Resizing the canvas clears it, so only do it when the window actually changed
      // (this also runs whenever the page's height changes).
      if (window.innerWidth !== page.W || window.innerHeight !== page.H || pr !== renderer.getPixelRatio()) {
        page.W = window.innerWidth;
        page.H = window.innerHeight;
        renderer.setPixelRatio(pr);
        renderer.setSize(page.W, page.H);
        sides.forEach((s) => {
          s.material.uniforms.uPixelRatio.value = pr;
          s.rings.forEach((r) => (r.satMaterial.uniforms.uPixelRatio.value = pr));
        });
      }

      const ref = document.querySelector('#journey');
      if (ref) {
        const box = ref.getBoundingClientRect();
        const cs = getComputedStyle(ref);
        page.contentLeft = box.left + parseFloat(cs.paddingLeft);
        page.contentRight = page.W - (box.right - parseFloat(cs.paddingRight));
      }
      const heading = document.querySelector('.hero-heading');
      page.heroLeft = heading ? heading.getBoundingClientRect().left : page.contentLeft;
      const hero = document.querySelector('#home');
      page.heroHeight = hero ? hero.getBoundingClientRect().bottom + window.scrollY : page.H;
      page.tops = SECTIONS.map((sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      }).filter(Number.isFinite);
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

    // Which section we're in, as a float: 2.4 = 40% of the way through section 2.
    const sectionProgress = (scrollY) => {
      const { tops, H } = page;
      if (!tops.length) return 0;
      const center = scrollY + H * 0.5;
      let i = 0;
      while (i < tops.length - 1 && center >= tops[i + 1]) i++;
      if (i === tops.length - 1) return i;
      return i + Math.min(1, Math.max(0, (center - tops[i]) / (tops[i + 1] - tops[i])));
    };

    let raf = 0;
    let last = performance.now();
    let lastScroll = window.scrollY;
    let velocity = 0;
    const start = last;
    let drewLastFrame = false;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = (now - start) / 1000;
      const scrollY = window.scrollY;
      velocity += ((scrollY - lastScroll) / Math.max(dt, 0.001) - velocity) * 0.2;
      lastScroll = scrollY;

      const { W, H } = page;
      const ease = 1 - Math.exp(-dt * 5);

      // Side space: the hero's heading sits further out than other sections on wide screens.
      const heroPassed = smoothstep(page.heroHeight * 0.3, page.heroHeight * 0.8, scrollY);
      const leftGutter =
        Math.min(page.contentLeft, page.heroLeft) * (1 - heroPassed) + page.contentLeft * heroPassed;
      const gutters = [leftGutter, page.contentRight];

      const f = sectionProgress(scrollY);
      const idx = Math.floor(f);
      const morph = smoothstep(0.55, 1, f - idx);

      // Nothing to show on screens too narrow for the side space – skip the GPU work.
      const anyVisible = gutters.some((g) => Math.min(g * 0.72, 300, H * 0.42) >= MIN_SIZE);
      if (!anyVisible && !drewLastFrame) return;
      drewLastFrame = anyVisible || sides.some((s) => s.opacity > 0.01);

      renderer.setScissorTest(false);
      renderer.clear();
      renderer.setScissorTest(true);

      sides.forEach((s, sideIndex) => {
        const gutter = gutters[sideIndex];
        const size = Math.min(gutter * 0.72, 300, H * 0.42);
        const cx = sideIndex === 0 ? gutter * 0.5 : W - gutter * 0.52;
        const cy = H * (sideIndex === 0 ? 0.44 : 0.6) + Math.sin(time * 0.6 + sideIndex * 2) * 6;

        // Fade while the big marquee sentence passes over the sculpture.
        let dim = 1;
        if (page.marquee) {
          const top = scrollY + cy - size * 0.7;
          const bottom = scrollY + cy + size * 0.7;
          if (bottom > page.marquee[0] && top < page.marquee[1]) dim = 0.3;
        }
        const targetOpacity = size >= MIN_SIZE ? dim : 0;
        s.opacity += (targetOpacity - s.opacity) * ease;
        if (s.opacity < 0.01) return;

        // Hovering near a sculpture energises it.
        const dist = Math.hypot(mouse.x - cx, mouse.y - cy) / (size * 0.5);
        s.energy += (1 - smoothstep(0.7, 1.6, dist) - s.energy) * ease;
        const scatterTarget = Math.min(Math.abs(velocity) / 5000, 0.4) + s.energy * 0.22;
        s.scatter += (scatterTarget - s.scatter) * ease;

        // Morph between this section's shape and the next one's.
        const a = s.stops[Math.min(idx, s.stops.length - 1)];
        const b = s.stops[Math.min(idx + 1, s.stops.length - 1)];
        const from = shapeCache[a];
        const to = shapeCache[b];
        const follow = 1 - Math.exp(-dt * 4);
        const pos = s.positions;
        for (let j = 0; j < pos.length; j++) {
          const target = from[j] + (to[j] - from[j]) * morph;
          pos[j] += (target - pos[j]) * follow;
        }
        s.geometry.attributes.position.needsUpdate = true;
        s.geometry.setDrawRange(0, Math.min(COUNT, Math.max(380, Math.round(size * 4.2))));

        s.spin.rotation.y +=
          dt * (0.18 + Math.min(Math.abs(velocity) / 2500, 1.2) + s.energy * 0.9) * s.direction;
        s.spin.rotation.x = 0.35 + Math.sin(time * 0.3 + sideIndex) * 0.12;
        s.tilt.rotation.x += (mouse.ny * 0.35 - s.tilt.rotation.x) * ease;
        s.tilt.rotation.y += (mouse.nx * 0.45 - s.tilt.rotation.y) * ease;

        const u = s.material.uniforms;
        u.uTime.value = time;
        u.uScatter.value = s.scatter;
        u.uOpacity.value = s.opacity;
        u.uSize.value = Math.min(2.5, Math.max(1.3, (size / 300) * 2.3));

        s.rings.forEach((r) => {
          r.ring.rotation.z += dt * r.speed * (1 + s.energy * 2);
          r.ringMaterial.opacity = r.baseOpacity * s.opacity;
          const angle = time * 0.8 * Math.sign(r.speed) + r.phase;
          r.satellite.position.set(Math.cos(angle) * r.radius, Math.sin(angle) * r.radius, 0);
          r.satMaterial.uniforms.uOpacity.value = s.opacity;
          r.satMaterial.uniforms.uSize.value = Math.max(3.5, (size / 300) * 6);
        });

        const box = size * BOX;
        const x = cx - box / 2;
        const y = H - (cy + box / 2); // WebGL counts from the bottom
        renderer.setViewport(x, y, box, box);
        renderer.setScissor(x, y, box, box);
        renderer.render(s.scene, camera);
      });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('mousemove', onMouse);
      sides.forEach((s) => {
        s.geometry.dispose();
        s.material.dispose();
        s.rings.forEach((r) => {
          r.ring.geometry.dispose();
          r.ringMaterial.dispose();
          r.satellite.geometry.dispose();
          r.satMaterial.dispose();
        });
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="side-scene fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
