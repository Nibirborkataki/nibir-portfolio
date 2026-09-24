import React from 'react';

// Monochrome illustrations for the project cards. All share one 480x300 canvas.
const INK = '#f4f4f5';
const MID = '#a1a1aa';
const DIM = '#52525b';
const FAINT = '#27272a';
const FONT = "'Space Grotesk', system-ui, sans-serif";

function Frame({ id, children }) {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" role="img" aria-hidden="true" fontFamily={FONT}>
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor="#26262b" />
          <stop offset="1" stopColor="#0a0a0b" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#ffffff" strokeOpacity="0.04" />
        </pattern>
      </defs>
      <rect width="480" height="300" fill={`url(#${id}-bg)`} />
      <rect width="480" height="300" fill={`url(#${id}-grid)`} />
      {children}
    </svg>
  );
}

function Sheet({ x, y, rotate, opacity = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
      <rect width="92" height="120" rx="4" fill="#fafafa" />
      <path d="M70 0 L92 22 L70 22 Z" fill="#d4d4d8" />
      <rect x="12" y="14" width="34" height="8" rx="2" fill="#18181b" />
      <text x="15" y="21" fontSize="6.5" fontWeight="800" fill="#fafafa">PDF</text>
      {[34, 44, 54, 64, 74, 84, 94].map((ly, i) => (
        <rect key={ly} x="12" y={ly} width={i % 3 === 2 ? 44 : 68} height="3.5" rx="1.75" fill="#d4d4d8" />
      ))}
    </g>
  );
}

export function RagArt() {
  const nodes = [
    [252, 118], [282, 96], [300, 132], [270, 150], [236, 150], [312, 104], [262, 180],
  ];
  return (
    <Frame id="rag">
      <Sheet x={40} y={100} rotate={-10} opacity={0.35} />
      <Sheet x={58} y={88} rotate={-4} opacity={0.6} />
      <Sheet x={78} y={80} rotate={3} />

      {/* chunks flowing into the local model */}
      <g stroke={MID} strokeWidth="1.2" strokeDasharray="3 5" fill="none" className="art-flow">
        <path d="M172 118 C 200 118, 210 120, 236 120" />
        <path d="M172 150 C 200 150, 214 150, 236 150" />
      </g>
      <g stroke={DIM} strokeWidth="1">
        {nodes.map(([x1, y1], i) =>
          nodes.slice(i + 1).map(([x2, y2]) => <line key={`${x1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />)
        )}
      </g>
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 7 : 4.5} fill={i === 0 ? INK : MID} className={i % 2 ? 'art-pulse' : ''} />
      ))}
      <rect x="226" y="198" width="100" height="22" rx="11" fill={FAINT} stroke={DIM} />
      <circle cx="240" cy="209" r="3.5" fill="#4ade80" />
      <text x="249" y="213" fontSize="10" fontWeight="700" fill={INK}>Ollama · local</text>

      {/* answer bubble */}
      <g transform="translate(340 70)">
        <rect width="118" height="58" rx="10" fill={FAINT} stroke={DIM} />
        <text x="12" y="20" fontSize="9" fontWeight="700" fill={MID}>ASK</text>
        <text x="12" y="38" fontSize="10.5" fontWeight="600" fill={INK}>What is the refund</text>
        <text x="12" y="51" fontSize="10.5" fontWeight="600" fill={INK}>policy on page 12?</text>
      </g>
      <g transform="translate(340 142)">
        <rect width="118" height="72" rx="10" fill={INK} />
        <text x="12" y="20" fontSize="9" fontWeight="800" fill="#18181b">ANSWER</text>
        {[32, 43, 54].map((ly, i) => (
          <rect key={ly} x="12" y={ly} width={i === 2 ? 58 : 94} height="4" rx="2" fill="#a1a1aa" />
        ))}
        <text x="12" y="66" fontSize="8" fontWeight="700" fill="#52525b">Source · p.12</text>
      </g>
    </Frame>
  );
}

export function DapoonArt() {
  return (
    <Frame id="dap">
      {/* tablet with the e-paper */}
      <g transform="translate(40 34)">
        <rect width="236" height="232" rx="16" fill="#18181b" stroke={DIM} />
        <rect x="12" y="12" width="212" height="208" rx="6" fill="#fafafa" />
        <text x="118" y="40" textAnchor="middle" fontSize="17" fontWeight="800" fill="#18181b" letterSpacing="-0.5">
          SANSKRITIR DAPOON
        </text>
        <rect x="24" y="48" width="188" height="1.5" fill="#18181b" />
        <text x="24" y="60" fontSize="6.5" fontWeight="700" fill="#71717a">E-PAPER · DAILY EDITION</text>
        <rect x="24" y="68" width="110" height="64" rx="2" fill="#27272a" />
        <path d="M24 132 L60 100 L84 118 L108 92 L134 132 Z" fill="#52525b" />
        {[70, 80, 90, 100, 110, 120, 130].map((ly) => (
          <rect key={ly} x="142" y={ly} width="70" height="3.5" rx="1.75" fill="#d4d4d8" />
        ))}
        {[144, 154, 164, 174, 184, 194, 204].map((ly, i) => (
          <g key={ly}>
            <rect x="24" y={ly} width="56" height="3.5" rx="1.75" fill="#d4d4d8" />
            <rect x="90" y={ly} width="56" height="3.5" rx="1.75" fill="#d4d4d8" />
            <rect x="156" y={ly} width={i === 6 ? 30 : 56} height="3.5" rx="1.75" fill="#d4d4d8" />
          </g>
        ))}
      </g>

      {/* integrations */}
      <g transform="translate(300 52)">
        <rect width="150" height="52" rx="10" fill={INK} />
        <text x="14" y="22" fontSize="9" fontWeight="800" fill="#52525b">PAYMENT GATEWAY</text>
        <text x="14" y="40" fontSize="14" fontWeight="800" fill="#18181b">₹ 99 · Paid</text>
        <circle cx="130" cy="34" r="9" fill="#18181b" />
        <path d="M125.5 34 L128.5 37 L134.5 31" stroke="#fafafa" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(300 122)">
        <rect width="150" height="52" rx="10" fill={FAINT} stroke={DIM} />
        <text x="14" y="22" fontSize="9" fontWeight="800" fill={MID}>SMS API</text>
        <text x="14" y="40" fontSize="12" fontWeight="700" fill={INK}>OTP 4821 sent</text>
      </g>
      <g transform="translate(300 192)">
        <rect width="150" height="52" rx="10" fill={FAINT} stroke={DIM} />
        <rect x="14" y="16" width="16" height="13" rx="2" fill={INK} />
        <path d="M17 16 V12 a5 5 0 0 1 10 0 V16" stroke={INK} strokeWidth="2" fill="none" />
        <text x="40" y="26" fontSize="9" fontWeight="800" fill={MID}>JWT AUTH</text>
        <text x="40" y="40" fontSize="10" fontWeight="600" fill={INK} fontFamily="monospace">eyJhbGciOi…</text>
      </g>
    </Frame>
  );
}

export function FloatifyArt() {
  const line = 'M40 214 L90 196 L130 204 L170 170 L214 176 L256 138 L300 146 L344 104 L388 112 L440 70';
  return (
    <Frame id="flo">
      <text x="40" y="44" fontSize="10" fontWeight="800" fill={MID} letterSpacing="1.5">FLOATIFY.IN</text>
      <text x="40" y="68" fontSize="22" fontWeight="800" fill={INK} letterSpacing="-0.5">Fund CAGR</text>

      {[110, 150, 190, 230].map((y) => (
        <line key={y} x1="40" x2="440" y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.06" />
      ))}
      <path d={`${line} L440 230 L40 230 Z`} fill="#ffffff" fillOpacity="0.06" />
      <path d={line} fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" className="art-draw" pathLength="1" />
      <circle cx="440" cy="70" r="5" fill={INK} />

      <g transform="translate(340 30)">
        <rect width="100" height="30" rx="15" fill={INK} />
        <text x="50" y="20" textAnchor="middle" fontSize="12" fontWeight="800" fill="#18181b">+14.2% CAGR</text>
      </g>

      {/* factsheet + cron */}
      <g transform="translate(40 246)">
        <rect width="120" height="34" rx="8" fill={FAINT} stroke={DIM} />
        <rect x="10" y="8" width="14" height="18" rx="2" fill={INK} />
        <text x="32" y="16" fontSize="8" fontWeight="800" fill={MID}>SCRAPED</text>
        <text x="32" y="27" fontSize="10" fontWeight="700" fill={INK}>PDF factsheet</text>
      </g>
      <g transform="translate(172 246)">
        <rect width="120" height="34" rx="8" fill={FAINT} stroke={DIM} />
        <circle cx="19" cy="17" r="8" fill="none" stroke={INK} strokeWidth="1.8" />
        <path d="M19 12 V17 L22.5 19" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <text x="34" y="16" fontSize="8" fontWeight="800" fill={MID}>CRON JOB</text>
        <text x="34" y="27" fontSize="10" fontWeight="700" fill={INK}>Daily · 06:00</text>
      </g>
      <g transform="translate(304 246)">
        <rect width="136" height="34" rx="8" fill={FAINT} stroke={DIM} />
        <text x="12" y="16" fontSize="8" fontWeight="800" fill={MID}>PIPELINE</text>
        <text x="12" y="27" fontSize="10" fontWeight="700" fill={INK}>Python · Scraping</text>
      </g>
    </Frame>
  );
}

export function FitArt() {
  const r = 58;
  const c = 2 * Math.PI * r;
  return (
    <Frame id="fit">
      {/* goal ring */}
      <g transform="translate(120 150)">
        <circle r={r} fill="none" stroke={FAINT} strokeWidth="12" />
        <circle
          r={r}
          fill="none"
          stroke={INK}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${c * 0.72} ${c}`}
          transform="rotate(-90)"
        />
        <text textAnchor="middle" y="-2" fontSize="26" fontWeight="800" fill={INK}>72%</text>
        <text textAnchor="middle" y="16" fontSize="9" fontWeight="700" fill={MID} letterSpacing="1">WEEKLY GOAL</text>
      </g>
      <path
        d="M40 262 H110 L122 240 L136 282 L150 226 L162 262 H200"
        fill="none"
        stroke={MID}
        strokeWidth="2"
        strokeLinejoin="round"
        className="art-flow"
      />

      {/* AI plan */}
      <g transform="translate(232 40)">
        <rect width="216" height="222" rx="14" fill={FAINT} stroke={DIM} />
        <path d="M22 26 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 z" fill={INK} className="art-pulse" />
        <text x="44" y="34" fontSize="11" fontWeight="800" fill={INK}>Your plan · Gemini</text>
        {[
          ['do', 'Squats · 3 × 12'],
          ['do', 'Brisk walk · 30 min'],
          ['do', 'Protein with every meal'],
          ['dont', 'Skip the warm-up'],
          ['dont', 'Train sore muscles'],
        ].map(([kind, label], i) => (
          <g key={label} transform={`translate(16 ${58 + i * 32})`}>
            <rect width="184" height="24" rx="6" fill={kind === 'do' ? '#fafafa' : 'transparent'} stroke={kind === 'do' ? 'none' : DIM} />
            {kind === 'do' ? (
              <path d="M10 12 L14 16 L21 8" stroke="#18181b" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M10 7 L20 17 M20 7 L10 17" stroke={MID} strokeWidth="2" strokeLinecap="round" />
            )}
            <text x="30" y="16" fontSize="10" fontWeight="700" fill={kind === 'do' ? '#18181b' : MID}>{label}</text>
          </g>
        ))}
      </g>
    </Frame>
  );
}
