import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import lottie from 'lottie-web/build/player/lottie_light';
import animationUrl from '../assets/anime_portfolio_loading_.json?url';
import { markAppReady } from '../utils/appReady';
import '../styles/loader.css';

// Everything in the overlay uses the artwork's own pixel space (1536 x 1024),
// so effects stay locked to the character at any screen size.
const ART_W = 1536;
const ART_H = 1024;

const MIN_DURATION = 3800; // ms – long enough to enjoy the scene
const MAX_WAIT = 12000; // ms – never trap a visitor behind the loader
const REDUCED_MIN_DURATION = 1200;

// Frames (of 240 @ 30fps) where the JSON flashes its blink line – our eyelids close in sync.
const BLINK_FRAMES = [70, 172];

// Eyelid offsets, in multiples of each eye's vertical radius.
const LID_OPEN = -2.4;
const LID_CLOSED = 0.4;

const EYES = [
  { id: 'l', cx: 768, cy: 239, rx: 27, ry: 12, rot: 21 },
  { id: 'r', cx: 859, cy: 273, rx: 21, ry: 11, rot: 24 },
];

// Fingertips: centre of the displacement mask + where the motion cues sit.
const FINGERS = [
  { id: 'a', cx: 801, cy: 806, rx: 24, ry: 30, tipX: 807, tipY: 823 },
  { id: 'b', cx: 836, cy: 799, rx: 17, ry: 25, tipX: 840, tipY: 814 },
];

// Regions the filter can push vertically. The hand mask fades out towards the wrist,
// so the hand pivots there; fingers are listed after it so they layer on top.
const MOVERS = [{ id: 'hand', cx: 775, cy: 778, rx: 118, ry: 62 }, ...FINGERS];

// Visible keys around the fingertips, grouped by the finger that presses them.
const KEYS = [
  { x: 786, y: 838, finger: 'a' },
  { x: 770, y: 843, finger: 'a' },
  { x: 752, y: 848, finger: 'a' },
  { x: 800, y: 845, finger: 'a' },
  { x: 822, y: 833, finger: 'b' },
  { x: 826, y: 843, finger: 'b' },
];

const STEAM = [
  'M438 728 C 424 700, 458 676, 440 646 S 424 598, 446 566',
  'M458 730 C 474 702, 444 680, 462 650 S 478 606, 458 574',
  'M448 726 C 440 704, 462 690, 450 664 S 440 628, 452 604',
];

const STATUS = [
  [0, 'Waking up the pixels'],
  [25, 'Brewing some coffee'],
  [50, 'Compiling ideas'],
  [75, 'Polishing the details'],
  [100, 'Ready'],
];

const svgUri = (markup) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

// Filter region shared by the masks (extends above the canvas so hair tips can move).
const FX = { x: 0, y: -60, w: ART_W, h: ART_H + 60 };

const HAIR_MASK = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${FX.w}" height="${FX.h}" viewBox="${FX.x} ${FX.y} ${FX.w} ${FX.h}">
<defs>
<radialGradient id="w"><stop offset="0.35" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="k"><stop offset="0.5" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<mask id="m"><rect x="${FX.x}" y="${FX.y}" width="${FX.w}" height="${FX.h}" fill="#fff"/><ellipse cx="815" cy="252" rx="175" ry="88" fill="url(#k)"/></mask>
</defs>
<g mask="url(#m)">
<ellipse cx="790" cy="78" rx="255" ry="150" fill="url(#w)"/>
<ellipse cx="968" cy="168" rx="72" ry="82" fill="url(#w)"/>
<ellipse cx="612" cy="150" rx="58" ry="62" fill="url(#w)"/>
</g>
</svg>`);

const moverMask = ({ cx, cy, rx, ry }) =>
  svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${FX.w}" height="${FX.h}" viewBox="${FX.x} ${FX.y} ${FX.w} ${FX.h}">
<defs><radialGradient id="g"><stop offset="0.4" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#g)"/>
</svg>`);

const DISPLACE_SCALE = 30;
const NEUTRAL = 128;

// The JSON uses legacy keyframes without bezier handles, which lottie-web needs.
function addMissingEasing(node) {
  if (Array.isArray(node)) {
    node.forEach(addMissingEasing);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (typeof node.t === 'number' && node.s !== undefined && !node.o && node.h !== 1) {
    node.o = { x: [0.42], y: [0] };
    node.i = { x: [0.58], y: [1] };
  }
  Object.values(node).forEach(addMissingEasing);
}

async function fetchJsonWithProgress(url, onProgress, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const length = Number(res.headers.get('content-length')) || 0;
  // Compressed responses report the wire size, so byte progress would be wrong.
  if (!res.body || !length || res.headers.get('content-encoding')) {
    return res.json();
  }
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(received / length, 1));
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

function makeDust(count) {
  // Deterministic pseudo-random so the layout is stable between renders.
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: 380 + rand() * 820,
    y: 120 + rand() * 760,
    r: 0.8 + rand() * 1.8,
  }));
}

export default function LoadingScreen({ onFinish }) {
  const rootRef = useRef(null);
  const artRef = useRef(null);
  const stageRef = useRef(null);
  const lottieRef = useRef(null);
  const counterRef = useRef(null);
  const statusRef = useRef(null);
  const barRef = useRef(null);
  const svgRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const dust = useMemo(() => makeDust(26), []);
  const moverMasks = useMemo(() => MOVERS.map(moverMask), []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hold = new URLSearchParams(window.location.search).get('loader') === 'hold';
    const minDuration = reduceMotion ? REDUCED_MIN_DURATION : MIN_DURATION;
    const svg = svgRef.current;
    const q = (selector) => Array.from(svg.querySelectorAll(selector));
    const abort = new AbortController();
    const start = performance.now();

    let anim = null;
    let rafId = 0;
    let exiting = false;
    let lastFrame = 0;
    const progress = { json: 0, jsonDone: false, fonts: false, page: document.readyState === 'complete' };
    let shown = 0;

    const ctx = gsap.context(() => {}, rootRef);

    // ---------- real loading signals ----------
    document.fonts?.ready.then(() => { progress.fonts = true; });
    const onLoad = () => { progress.page = true; };
    window.addEventListener('load', onLoad);

    // ---------- ambient + character motion ----------
    const lids = q('.np-lid');
    const lashes = q('.np-lash');
    const lid = { pos: LID_OPEN };
    const writeLids = () => {
      // pos is in eye-radius units; the lash only shows as the lid nears closed.
      const closedness = (lid.pos - LID_OPEN) / (LID_CLOSED - LID_OPEN);
      EYES.forEach((e, i) => {
        const t = `translate(0 ${(lid.pos * e.ry).toFixed(2)})`;
        lids[i].setAttribute('transform', t);
        lashes[i].setAttribute('transform', t);
        lashes[i].setAttribute('opacity', Math.max(0, closedness * 1.6 - 0.6).toFixed(2));
      });
    };
    const blink = () => {
      ctx.add(() => {
        gsap.timeline({ onUpdate: writeLids })
          .to(lid, { pos: LID_CLOSED, duration: 0.08, ease: 'power2.in' })
          .to(lid, { pos: LID_OPEN, duration: 0.17, ease: 'power2.out' }, '+=0.05');
      });
    };

    // Vertical push in image pixels (positive = down). Fingers ride on top of the hand.
    const push = { hand: 0, a: 0, b: 0 };
    const floods = Object.fromEntries(MOVERS.map((m) => [m.id, svg.querySelector(`#np-move-flood-${m.id}`)]));
    const writePush = () => {
      MOVERS.forEach(({ id }) => {
        const dy = id === 'hand' ? push.hand : push.hand + push[id];
        // Negative Y displacement samples from above => the region moves down.
        const g = Math.round(NEUTRAL - (dy * 255) / DISPLACE_SCALE);
        floods[id].setAttribute('flood-color', `rgb(${NEUTRAL},${g},${NEUTRAL})`);
      });
    };

    const tap = (fingerId) => {
      const keys = q(`.np-key[data-finger="${fingerId}"]`);
      const key = keys[Math.floor(Math.random() * keys.length)];
      const cues = q(`.np-cue-${fingerId} path`);
      ctx.add(() => {
        // Small lift, quick strike, a beat on the key, then release.
        gsap.timeline({ onUpdate: writePush })
          .to(push, { [fingerId]: -1.2, duration: 0.07, ease: 'sine.out' })
          .to(push, { [fingerId]: 4, duration: 0.07, ease: 'power3.in' })
          .to(push, { [fingerId]: 0, duration: 0.2, ease: 'power2.out' }, '+=0.04');
        gsap.fromTo(key, { opacity: 0.95 }, { opacity: 0, duration: 0.45, ease: 'power2.out', delay: 0.14 });
        gsap.fromTo(
          cues,
          { opacity: 0.85, scale: 0.6, transformOrigin: '50% 100%' },
          { opacity: 0, scale: 1.25, duration: 0.32, ease: 'power1.out', stagger: 0.02, delay: 0.13 }
        );
      });
    };

    const typeLoop = () => {
      // A "one-two" (sometimes a third) keystroke, the hand dipping with it, then a thinking pause.
      const strokes = Math.random() < 0.3 ? ['a', 'b', 'a'] : Math.random() < 0.5 ? ['a', 'b'] : ['b', 'a'];
      const gap = 0.24;
      ctx.add(() => {
        gsap.timeline({ onUpdate: writePush })
          .to(push, { hand: -1.4, duration: 0.22, ease: 'sine.out' })
          .to(push, { hand: 1, duration: 0.16, ease: 'power2.in' })
          .to(push, { hand: 0, duration: 0.45, ease: 'sine.inOut' }, `+=${strokes.length * gap}`);
        strokes.forEach((finger, i) => gsap.delayedCall(0.3 + i * gap, () => tap(finger)));
        gsap.delayedCall(0.3 + strokes.length * gap + 0.9 + Math.random() * 0.9, typeLoop);
      });
    };

    if (!reduceMotion) {
      ctx.add(() => {
        // Hair: drift the noise field slowly through the hair mask - a light room breeze.
        const offset = svg.querySelector('#np-hair-offset');
        const hairAlpha = svg.querySelector('#np-hair-alpha');
        const wind = { dx: 0, dy: 0, gust: 0.28 };
        const applyWind = () => {
          offset.setAttribute('dx', wind.dx.toFixed(2));
          offset.setAttribute('dy', wind.dy.toFixed(2));
          hairAlpha.setAttribute('slope', wind.gust.toFixed(3));
        };
        gsap.to(wind, { dx: 70, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: applyWind });
        gsap.to(wind, { dy: 10, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to(wind, { gust: 0.48, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1.2 });

        // Body: barely-there breathing, anchored at the desk so the desk stays put.
        gsap.to(stageRef.current, {
          scaleY: 1.006,
          scaleX: 1.0025,
          transformOrigin: '50% 81%',
          duration: 2.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });

        // Ambient: backlight pulse, screen flicker, mug steam, floating dust.
        gsap.to('.np-glow', { opacity: 0.65, scale: 1.04, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to(q('.np-screen-light'), {
          opacity: () => gsap.utils.random(0.55, 1),
          duration: () => gsap.utils.random(0.12, 0.5),
          ease: 'none',
          repeat: -1,
          repeatRefresh: true,
        });

        q('.np-steam path').forEach((path, i) => {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: `${len * 0.45} ${len}`, strokeDashoffset: len * 0.45, opacity: 0 });
          gsap
            .timeline({ repeat: -1, delay: i * 1.1 })
            .to(path, { strokeDashoffset: -len * 0.9, duration: 3.2, ease: 'none' })
            .to(path, { opacity: 0.55, duration: 0.9, ease: 'sine.out' }, 0)
            .to(path, { opacity: 0, duration: 1.2, ease: 'sine.in' }, 2);
        });

        q('.np-dust circle').forEach((dot) => {
          gsap.to(dot, {
            y: gsap.utils.random(-90, -40),
            x: gsap.utils.random(-25, 25),
            duration: gsap.utils.random(6, 11),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
          gsap.fromTo(
            dot,
            { opacity: 0 },
            {
              opacity: gsap.utils.random(0.25, 0.8),
              duration: gsap.utils.random(1.5, 3),
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: gsap.utils.random(0, 2),
            }
          );
        });

        gsap.from(artRef.current, { opacity: 0, scale: 0.97, duration: 1.1, ease: 'power3.out' });
      });
      typeLoop();
    }

    // ---------- the Lottie itself ----------
    fetchJsonWithProgress(animationUrl, (p) => { progress.json = p; }, abort.signal)
      .then((data) => {
        addMissingEasing(data);
        anim = lottie.loadAnimation({
          container: lottieRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: !reduceMotion,
          animationData: data,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        });
        anim.addEventListener('DOMLoaded', () => {
          const image = lottieRef.current?.querySelector('image');
          if (image && !reduceMotion) image.setAttribute('filter', 'url(#np-art-motion)');
          progress.jsonDone = true;
        });
        anim.addEventListener('enterFrame', ({ currentTime }) => {
          if (currentTime < lastFrame) lastFrame = -1; // looped
          if (BLINK_FRAMES.some((f) => lastFrame < f && currentTime >= f)) blink();
          lastFrame = currentTime;
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error(err);
          progress.jsonDone = true; // don't block the site on a missing animation
        }
      });

    // ---------- counter ----------
    const exit = () => {
      exiting = true;
      ctx.add(() => {
        gsap
          .timeline({ onComplete: () => onFinishRef.current?.() })
          .to({}, { duration: 0.35 })
          .to('.np-count-inner', { yPercent: -110, duration: 0.7, ease: 'power3.in' })
          .to('.np-meta', { opacity: 0, y: -12, duration: 0.5, ease: 'power2.in' }, '<')
          .to(artRef.current, { opacity: 0, scale: 0.96, y: -30, duration: 0.7, ease: 'power3.in' }, '<0.05')
          .to(rootRef.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'power4.inOut' }, '-=0.25')
          .add(markAppReady, '-=0.55');
      });
    };

    const tick = (now) => {
      const elapsed = Math.max(now - start, 0); // first rAF timestamp can precede `start`
      const jsonPart = progress.jsonDone ? 1 : Math.max(progress.json, 0.9 * (1 - Math.exp(-elapsed / 1600)));
      let real = jsonPart * 0.7 + (progress.fonts ? 0.1 : 0) + (progress.page ? 0.2 : 0);
      if (elapsed > MAX_WAIT) real = 1;
      const timed = Math.min(elapsed / minDuration, 1);
      const target = Math.min(real, 1 - Math.pow(1 - timed, 1.6)) * 100;
      shown += (target - shown) * 0.09;
      if (target >= 100 && shown > 99.6) shown = 100;
      const value = Math.floor(shown);

      counterRef.current.textContent = String(value);
      barRef.current.style.transform = `scaleX(${shown / 100})`;
      rootRef.current.setAttribute('aria-valuenow', String(value));
      const status = STATUS.filter(([at]) => value >= at).pop()[1];
      if (statusRef.current.textContent !== status) statusRef.current.textContent = status;

      if (value >= 100 && !exiting && !hold) exit();
      if (!exiting) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      abort.abort();
      cancelAnimationFrame(rafId);
      window.removeEventListener('load', onLoad);
      ctx.revert();
      anim?.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="np-loader"
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className="np-grain" aria-hidden="true" />

      <div className="np-meta np-top">
        <span>Nibir Borkataki</span>
        <span>Portfolio &copy;{new Date().getFullYear()}</span>
      </div>

      <div className="np-art-wrap">
        <div ref={artRef} className="np-art">
          <div className="np-glow" aria-hidden="true" />
          <div ref={stageRef} className="np-stage">
            <div ref={lottieRef} className="np-lottie" />
            <svg
              ref={svgRef}
              className="np-overlay"
              viewBox={`0 0 ${ART_W} ${ART_H}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                {/* Applied to the Lottie's image: wind through the hair + fingertip key presses. */}
                <filter
                  id="np-art-motion"
                  filterUnits="userSpaceOnUse"
                  primitiveUnits="userSpaceOnUse"
                  x={FX.x}
                  y={FX.y}
                  width={FX.w}
                  height={FX.h}
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodColor={`rgb(${NEUTRAL},${NEUTRAL},${NEUTRAL})`} result="neutral" />
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.009 0.02"
                    numOctaves="2"
                    seed="7"
                    x="300"
                    y="-60"
                    width="760"
                    height="330"
                    result="noise"
                  />
                  <feOffset id="np-hair-offset" in="noise" dx="0" dy="0" result="noiseMoved" />
                  <feColorMatrix
                    in="noiseMoved"
                    type="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1"
                    result="noiseOpaque"
                  />
                  <feImage href={HAIR_MASK} x={FX.x} y={FX.y} width={FX.w} height={FX.h} preserveAspectRatio="none" result="hairMask" />
                  <feComposite in="noiseOpaque" in2="hairMask" operator="in" result="hairNoise" />
                  <feComponentTransfer in="hairNoise" result="hairMap">
                    <feFuncA id="np-hair-alpha" type="linear" slope="0.55" />
                  </feComponentTransfer>
                  {MOVERS.map((m, i) => (
                    <React.Fragment key={m.id}>
                      <feImage
                        href={moverMasks[i]}
                        x={FX.x}
                        y={FX.y}
                        width={FX.w}
                        height={FX.h}
                        preserveAspectRatio="none"
                        result={`moveMask-${m.id}`}
                      />
                      <feFlood id={`np-move-flood-${m.id}`} floodColor={`rgb(${NEUTRAL},${NEUTRAL},${NEUTRAL})`} result={`moveColor-${m.id}`} />
                      <feComposite in={`moveColor-${m.id}`} in2={`moveMask-${m.id}`} operator="in" result={`move-${m.id}`} />
                    </React.Fragment>
                  ))}
                  <feMerge result="map">
                    <feMergeNode in="neutral" />
                    <feMergeNode in="hairMap" />
                    {MOVERS.map((m) => (
                      <feMergeNode key={m.id} in={`move-${m.id}`} />
                    ))}
                  </feMerge>
                  <feDisplacementMap in="SourceGraphic" in2="map" scale={DISPLACE_SCALE} xChannelSelector="R" yChannelSelector="G" />
                </filter>

                <linearGradient id="np-lid-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d49574" />
                  <stop offset="0.8" stopColor="#bf7e62" />
                  <stop offset="1" stopColor="#a4654f" />
                </linearGradient>
                <radialGradient id="np-soft-light">
                  <stop offset="0" stopColor="#dbe6ff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#dbe6ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="np-key-glow">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="0.45" stopColor="#cfe0ff" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#9fbfff" stopOpacity="0" />
                </radialGradient>
                <filter id="np-blur-sm" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
                {EYES.map((e) => (
                  <clipPath key={e.id} id={`np-eye-${e.id}`}>
                    <ellipse cx="0" cy="0" rx={e.rx} ry={e.ry} />
                  </clipPath>
                ))}
              </defs>

              {/* Laptop screen light spilling onto face and hands */}
              <g className="np-blend-screen">
                <ellipse className="np-screen-light" cx="815" cy="300" rx="120" ry="95" fill="url(#np-soft-light)" opacity="0.35" />
                <ellipse className="np-screen-light" cx="790" cy="770" rx="150" ry="80" fill="url(#np-soft-light)" opacity="0.45" />
              </g>

              {/* Eyelids */}
              {EYES.map((e) => (
                <g key={e.id} transform={`translate(${e.cx} ${e.cy}) rotate(${e.rot})`}>
                  <g clipPath={`url(#np-eye-${e.id})`}>
                    <path
                      className="np-lid"
                      d={`M ${-e.rx - 4} ${-e.ry * 3} L ${e.rx + 4} ${-e.ry * 3} L ${e.rx + 4} 0 Q 0 ${e.ry * 1.2} ${-e.rx - 4} 0 Z`}
                      fill="url(#np-lid-fill)"
                      transform={`translate(0 ${LID_OPEN * e.ry})`}
                    />
                  </g>
                  {/* The lash crease is unclipped so it reads as a closed-eye curve */}
                  <path
                    className="np-lash"
                    d={`M ${-e.rx * 0.95} ${e.ry * 0.05} Q 0 ${e.ry * 1.25} ${e.rx * 0.95} ${e.ry * 0.05}`}
                    fill="none"
                    stroke="#1f1310"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    opacity="0"
                    transform={`translate(0 ${LID_OPEN * e.ry})`}
                  />
                </g>
              ))}

              {/* Key press flashes */}
              <g className="np-blend-screen">
                {KEYS.map((k, i) => (
                  <g key={i} className="np-key" data-finger={k.finger} opacity="0">
                    <ellipse cx={k.x} cy={k.y} rx="15" ry="7" fill="url(#np-key-glow)" transform={`rotate(-12 ${k.x} ${k.y})`} />
                    <rect x={k.x - 5} y={k.y - 2.5} width="10" height="5" rx="1.5" fill="#f4f8ff" transform={`rotate(-12 ${k.x} ${k.y})`} />
                  </g>
                ))}
              </g>

              {/* Typing motion cues around the fingertips */}
              {FINGERS.map((f) => (
                <g key={f.id} className={`np-cue-${f.id}`} stroke="#e8ecf5" strokeWidth="1.8" strokeLinecap="round" fill="none">
                  <path d={`M ${f.tipX - 13} ${f.tipY - 6} l -7 -4`} opacity="0" />
                  <path d={`M ${f.tipX - 11} ${f.tipY - 15} l -6 -8`} opacity="0" />
                  <path d={`M ${f.tipX + 9} ${f.tipY - 13} l 5 -8`} opacity="0" />
                </g>
              ))}

              {/* Steam from the mug */}
              <g className="np-steam" stroke="#e9e4dc" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#np-blur-sm)">
                {STEAM.map((d, i) => (
                  <path key={i} d={d} opacity="0" />
                ))}
              </g>

              {/* Floating dust in the light */}
              <g className="np-dust" fill="#f6e7c9">
                {dust.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity="0" />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="np-meta np-bottom-left">
        <span className="np-status-dot" />
        <span ref={statusRef}>Waking up the pixels</span>
      </div>

      <div className="np-count" aria-hidden="true">
        <span className="np-count-inner">
          <span ref={counterRef}>0</span>
          <span className="np-count-pct">%</span>
        </span>
      </div>

      <div className="np-bar" aria-hidden="true">
        <div ref={barRef} className="np-bar-fill" />
      </div>
    </div>
  );
}
