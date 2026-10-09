import React, { useEffect, useRef } from 'react';
import { hasFinePointer } from '../utils/pointer';

/*
 * Background "plexus": a 3D network of nodes and thin connecting lines drifting slowly
 * behind the whole page.
 *  - Real depth: nodes are projected with perspective; far ones are smaller, fainter and
 *    softly blurred, near ones crisp – like a camera's depth of field.
 *  - Natural motion: every node floats on its own slow path, so links fade in and out as
 *    nodes drift closer or apart (no popping).
 *  - Scrolling moves through the network at about a third of the page speed (near nodes
 *    faster than far ones), and it wraps endlessly, so it is there all the way down.
 *  - Signals: dark pulses travel along the lines and hop from node to node.
 *  - With a mouse, the cursor joins the network: nearby nodes link to it and make way.
 *  - It is strongest in the empty space beside the content and fades to a whisper behind
 *    the text column, so reading is never disturbed.
 * Drawn on a 2D canvas behind all content (sections with their own background cover it).
 */

const INK = '17,24,39'; // the site's text colour (#111827)
const FOCAL = 900; // perspective focal length, px
const Z_NEAR = -300; // closest nodes (scale 1.5)
const Z_FAR = 560; // farthest nodes (scale 0.62)
const FOCUS_Z = 120; // depth that is perfectly sharp
// Node spacing and max link length scale with the screen, so phones get the same web
// proportions as desktops (desktop: ~235px spacing, links up to ~380px).
const cellFor = (w) => Math.min(235, Math.max(120, w * 0.12));
const LINK_RATIO = 1.62;
const PARALLAX = 0.3; // network scroll speed relative to the page
const EDGE_ALPHA = 0.5; // strongest line
const NODE_ALPHA = 0.9; // strongest node
const BUCKETS = 14; // lines are batched into this many opacity steps
const CURSOR_REACH = 170; // px

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

// Node sprites from sharp (0) to fully defocused (3): a solid core with a soft halo.
function makeSprites() {
  return [0, 1, 2, 3].map((level) => {
    const blur = level / 3;
    const size = 64;
    const r = size / 2;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    const core = 0.14 + blur * 0.3;
    grad.addColorStop(0, `rgba(${INK},${1 - blur * 0.55})`);
    grad.addColorStop(core, `rgba(${INK},${0.95 - blur * 0.6})`);
    grad.addColorStop(Math.min(core + 0.06 + blur * 0.25, 0.9), `rgba(${INK},${0.12 - blur * 0.05})`);
    grad.addColorStop(1, `rgba(${INK},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return canvas;
  });
}

export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const fine = hasFinePointer();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sprites = makeSprites();

    // ---- layout + nodes ----
    let W = 0;
    let H = 0;
    let dpr = 1;
    let range = 1; // height of the endlessly wrapping band of nodes
    let contentHalf = 1; // half-width of the text column, for the reading-area fade
    let centerLevel = 0.22;
    let nodes = [];
    let cell = 235;
    let link = cell * LINK_RATIO;

    const build = () => {
      const rand = (() => {
        let s = 1234567;
        return () => {
          s = (s * 16807) % 2147483647;
          return (s - 1) / 2147483646;
        };
      })();
      cell = cellFor(W);
      link = cell * LINK_RATIO;
      const sFar = FOCAL / (FOCAL + Z_FAR);
      const xr = W / 2 / sFar + link; // wide enough that far nodes reach the screen edges
      range = H / sFar + 2 * link; // tall enough that wrapping always happens off-screen
      const cols = Math.max(3, Math.round((2 * xr) / cell));
      const rows = Math.max(3, Math.round(range / cell));
      const density = fine ? 1 : 0.8; // a little lighter on phones
      nodes = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() > density) continue;
          nodes.push({
            x0: -xr + ((c + 0.15 + rand() * 0.7) / cols) * 2 * xr,
            y0: ((r + 0.15 + rand() * 0.7) / rows) * range,
            z0: Z_NEAR + rand() * (Z_FAR - Z_NEAR),
            ax: 18 + rand() * 30,
            ay: 18 + rand() * 30,
            az: 30 + rand() * 60,
            fx: 0.05 + rand() * 0.11,
            fy: 0.05 + rand() * 0.11,
            fz: 0.04 + rand() * 0.08,
            px: rand() * 6.28,
            py: rand() * 6.28,
            pz: rand() * 6.28,
            hub: rand() < 0.1, // a few larger nodes with a fine ring give the web hierarchy
            ox: 0, // smoothed cursor push, world px
            oy: 0,
            x: 0, y: 0, z: 0, s: 1, sx: 0, sy: 0, vis: false, mask: 1,
          });
        }
      }
    };

    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Phones change height when the address bar slides – only rebuild on real changes.
      const rebuild = w !== W || Math.abs(h - H) > 120;
      W = w;
      H = h;
      dpr = Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const ref = document.querySelector('#journey');
      let left = 48;
      if (ref) left = ref.getBoundingClientRect().left + parseFloat(getComputedStyle(ref).paddingLeft);
      contentHalf = Math.max(W / 2 - left, 120);
      centerLevel = W >= 1024 ? 0.2 : 0.55; // phones have no side space, so keep it even
      if (rebuild) build();
    };
    measure();

    // Stronger beside the content, a whisper behind the text column.
    const maskAt = (sx) =>
      centerLevel + (1 - centerLevel) * smoothstep(0.45, 1.02, Math.abs(sx - W / 2) / contentHalf);

    const mouse = { x: -9999, y: -9999, active: false };
    const onMouse = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    if (fine) {
      window.addEventListener('mousemove', onMouse, { passive: true });
      document.addEventListener('mouseleave', onLeave);
    }

    // ---- signals travelling along the lines ----
    const pulses = []; // { a, b, p, dur, hops }
    const pings = []; // { n, age }
    let nextPulse = 1.2;

    // ---- per-frame scratch ----
    const paths = Array.from({ length: BUCKETS }, () => null);
    let edges = []; // [i, j, alpha]
    let neighbours = [];

    const draw = (time, dt) => {
      const camY = reduceMotion ? 0 : window.scrollY * PARALLAX;
      const t = reduceMotion ? 0 : time;

      // project nodes
      for (const n of nodes) {
        n.x = n.x0 + n.ax * Math.sin(t * n.fx + n.px) + n.ox;
        const y = n.y0 + n.ay * Math.sin(t * n.fy + n.py) + n.oy;
        n.z = n.z0 + n.az * Math.sin(t * n.fz + n.pz);
        n.y = ((((y - camY) % range) + range) % range) - range / 2;
        n.s = FOCAL / (FOCAL + n.z);
        n.sx = W / 2 + n.x * n.s;
        n.sy = H / 2 + n.y * n.s;
        n.vis = n.sx > -link && n.sx < W + link && n.sy > -link && n.sy < H + link;
        n.mask = maskAt(n.sx);
      }

      // links: every pair closer than the link length, fading with distance and depth
      edges = [];
      neighbours = nodes.map(() => []);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!a.vis) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          if (!b.vis) continue;
          const dx = a.x - b.x;
          if (dx > link || dx < -link) continue;
          const dy = a.y - b.y;
          if (dy > link || dy < -link) continue;
          const dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > link * link) continue;
          const closeness = Math.pow(1 - Math.sqrt(d2) / link, 1.3);
          const depth = 1 - 0.72 * smoothstep(FOCUS_Z, Z_FAR, (a.z + b.z) / 2);
          const alpha = EDGE_ALPHA * closeness * depth * maskAt((a.sx + b.sx) / 2);
          if (alpha < 0.004) continue;
          edges.push([i, j, alpha]);
          neighbours[i].push(j);
          neighbours[j].push(i);
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // lines, batched by opacity
      for (let k = 0; k < BUCKETS; k++) paths[k] = null;
      for (const [i, j, alpha] of edges) {
        const k = Math.min(BUCKETS - 1, Math.floor((alpha / EDGE_ALPHA) * BUCKETS));
        const path = (paths[k] ??= new Path2D());
        path.moveTo(nodes[i].sx, nodes[i].sy);
        path.lineTo(nodes[j].sx, nodes[j].sy);
      }
      ctx.lineWidth = 0.9;
      for (let k = 0; k < BUCKETS; k++) {
        if (!paths[k]) continue;
        ctx.strokeStyle = `rgba(${INK},${(((k + 0.5) / BUCKETS) * EDGE_ALPHA).toFixed(3)})`;
        ctx.stroke(paths[k]);
      }

      // the cursor as a node: faint links to its neighbours, which gently make way
      if (fine && !reduceMotion) {
        const push = 1 - Math.exp(-dt * 6);
        for (const n of nodes) {
          let tx = 0;
          let ty = 0;
          if (mouse.active && n.vis) {
            const dx = n.sx - mouse.x;
            const dy = n.sy - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < CURSOR_REACH && d > 0.001) {
              const f = Math.pow(1 - d / CURSOR_REACH, 2) * 22;
              tx = ((dx / d) * f) / n.s;
              ty = ((dy / d) * f) / n.s;
              const a = 0.45 * Math.pow(1 - d / CURSOR_REACH, 1.5) * n.mask;
              ctx.strokeStyle = `rgba(${INK},${a.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(n.sx, n.sy);
              ctx.stroke();
            }
          }
          n.ox += (tx - n.ox) * push;
          n.oy += (ty - n.oy) * push;
        }
      }

      // nodes: sharp at the focus depth, lighter and softer away from it. Dots with no link
      // are nearly hidden, and dots are kept quieter than lines behind the text column.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.vis || n.sx < -40 || n.sx > W + 40 || n.sy < -40 || n.sy > H + 40) continue;
        const defocus = Math.min(1, Math.abs(n.z - FOCUS_Z) / 380);
        const sprite = sprites[Math.round(defocus * 3)];
        const size = (n.hub ? 26 : 18 + defocus * 6) * n.s;
        const depth = 1 - 0.65 * smoothstep(FOCUS_Z, Z_FAR, n.z);
        const linked = Math.min(neighbours[i].length, 2) / 2;
        ctx.globalAlpha =
          NODE_ALPHA * depth * (1 - 0.6 * defocus) * (0.25 + 0.75 * linked) * n.mask * n.mask;
        ctx.drawImage(sprite, n.sx - size / 2, n.sy - size / 2, size, size);
        if (n.hub && defocus < 0.6) {
          ctx.globalAlpha *= 0.35;
          ctx.strokeStyle = `rgb(${INK})`;
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, 7.5 * n.s, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      if (reduceMotion) return;

      // signals: start on a clearly visible link, travel, ping the node, sometimes hop on
      nextPulse -= dt;
      if (nextPulse <= 0 && edges.length) {
        nextPulse = 0.5 + Math.random() * 0.9;
        const candidates = edges.filter(([i, j, a]) => a > EDGE_ALPHA * 0.3 && nodes[i].sy > 0 && nodes[i].sy < H);
        if (candidates.length && pulses.length < 6) {
          const [i, j] = candidates[Math.floor(Math.random() * candidates.length)];
          const forward = Math.random() < 0.5;
          pulses.push({ a: forward ? i : j, b: forward ? j : i, p: 0, dur: 1 + Math.random() * 0.6, hops: 2 + Math.floor(Math.random() * 3) });
        }
      }
      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k];
        pulse.p += dt / pulse.dur;
        const a = nodes[pulse.a];
        const b = nodes[pulse.b];
        if (pulse.p >= 1) {
          pings.push({ n: pulse.b, age: 0 });
          const next = (neighbours[pulse.b] || []).filter((n) => n !== pulse.a);
          if (pulse.hops > 0 && next.length) {
            pulse.a = pulse.b;
            pulse.b = next[Math.floor(Math.random() * next.length)];
            pulse.p = 0;
            pulse.hops--;
          } else {
            pulses.splice(k, 1);
          }
          continue;
        }
        const mask = (a.mask + b.mask) / 2;
        const scale = (a.s + b.s) / 2;
        for (let tail = 0; tail < 5; tail++) {
          const p = ease(Math.max(0, pulse.p - tail * 0.035));
          const x = a.sx + (b.sx - a.sx) * p;
          const y = a.sy + (b.sy - a.sy) * p;
          ctx.fillStyle = `rgba(${INK},${(0.7 * mask * (1 - tail / 5)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, (2.1 - tail * 0.3) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (let k = pings.length - 1; k >= 0; k--) {
        const ping = pings[k];
        ping.age += dt / 0.9;
        if (ping.age >= 1) {
          pings.splice(k, 1);
          continue;
        }
        const n = nodes[ping.n];
        ctx.strokeStyle = `rgba(${INK},${(0.35 * (1 - ping.age) * n.mask).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, (3 + ease(ping.age) * 16) * n.s, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    let raf = 0;
    let last = performance.now();
    let lastDrawn = 0;
    let time = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      // phones and tablets: 30 fps is plenty for a slow background and saves battery
      if (!fine && now - lastDrawn < 32) return;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
      last = Math.max(now, last);
      lastDrawn = now;
      time += dt;
      draw(time, dt);
    };

    const onResize = () => {
      measure();
      if (reduceMotion) draw(0, 0);
    };
    window.addEventListener('resize', onResize);

    if (reduceMotion) draw(0, 0);
    else raf = requestAnimationFrame(frame);
    requestAnimationFrame(() => canvas.classList.add('is-visible'));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouse);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="network-bg fixed inset-0 -z-10 w-full h-full pointer-events-none"
    />
  );
}
