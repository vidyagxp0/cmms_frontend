import React from "react";

const EquipmentScene = () => {
  return (
  <svg
  viewBox="0 0 700 800"
  className="absolute inset-0 h-full w-full"
  preserveAspectRatio="xMidYMid slice"
  >
  <defs>

  {/* Tank gradients */}
  <linearGradient
  id="tankBody"
  x1="0"
  y1="0"
  x2="1"
  y2="0"
  >
  <stop offset="0%" stopColor="#2C4A6E"/>

  <stop offset="45%" stopColor="#4A6C93"/>

  <stop offset="55%" stopColor="#4A6C93"/>

  <stop offset="100%" stopColor="#213A57"/>
  </linearGradient>

  <linearGradient
  id="tankBody2"
  x1="0"
  y1="0"
  x2="1"
  y2="0"
  >
  <stop offset="0%" stopColor="#22405f"/>

  <stop offset="50%" stopColor="#3d5c80"/>

  <stop offset="100%" stopColor="#1a2f47"/>
  </linearGradient>

  {/* Glow */}
  <radialGradient
  id="glow"
  cx="50%"
  cy="50%"
  r="50%"
  >
  <stop offset="0%" stopColor="#2DD4C8" stopOpacity="0.55"/>

  <stop offset="100%" stopColor="#2DD4C8" stopOpacity="0"/>
  </radialGradient>

  {/* Connection line */}
  <linearGradient
  id="lineGrad"
  x1="0"
  y1="0"
  x2="1"
  y2="0"
  >
  <stop offset="0%" stopColor="#2DD4C8" stopOpacity="0"/>

  <stop offset="50%" stopColor="#2DD4C8" stopOpacity="0.9"/>

  <stop offset="100%" stopColor="#2DD4C8" stopOpacity="0"/>
  </linearGradient>

  </defs>

  {/* Blueprint grid */}
  <g
  opacity="0.06"
  stroke="#BFE3F0"
  strokeWidth="1"
  >
  {Array.from({ length: 15 }).map((_, i) => (
  <line key={`h-${i}`} x1="0" y1={i * 55} x2="700" y2={i * 55}/>
  ))}

  {Array.from({ length: 13 }).map((_, i) => (
  <line key={`v-${i}`} x1={i * 58} y1="0" x2={i * 58} y2="800"/>
  ))}
  </g>

  {/* Molecular pattern */}
  <g
  opacity="0.12"
  stroke="#7FD4E0"
  strokeWidth="1.2"
  fill="none"
  >
  <circle cx="110" cy="120" r="4" fill="#7FD4E0"/>

  <circle cx="160" cy="90" r="4" fill="#7FD4E0"/>

  <circle cx="150" cy="150" r="4" fill="#7FD4E0"/>

  <line x1="110" y1="120" x2="160" y2="90"/>

  <line x1="110" y1="120" x2="150" y2="150"/>

  <circle cx="600" cy="680" r="4" fill="#7FD4E0"/>

  <circle cx="650" cy="650" r="4" fill="#7FD4E0"/>

  <circle cx="640" cy="710" r="4" fill="#7FD4E0"/>

  <line x1="600" y1="680" x2="650" y2="650"/>

  <line x1="600" y1="680" x2="640" y2="710"/>
  </g>

  {/* Connection lines */}
  <g
  fill="none"
  strokeWidth="1.5"
  >
  <path d="M 210 300 C 300 300, 320 420, 430 430" stroke="url(#lineGrad)" strokeDasharray="6 8">
  <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2.4s" repeatCount="indefinite"/>
  </path>

  <path d="M 430 430 C 470 470, 470 560, 400 610" stroke="url(#lineGrad)" strokeDasharray="6 8">
  <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2.8s" repeatCount="indefinite"/>
  </path>

  <path d="M 210 300 C 150 380, 160 500, 230 560" stroke="url(#lineGrad)" strokeDasharray="6 8">
  <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="3.2s" repeatCount="indefinite"/>
  </path>
  </g>

  {/* Main pharmaceutical tank */}
  <g transform="translate(140,190)">

  <ellipse cx="70" cy="0" rx="70" ry="18" fill="url(#tankBody)"/>

  <rect x="0" y="0" width="140" height="180" fill="url(#tankBody)"/>

  <ellipse cx="70" cy="180" rx="70" ry="18" fill="#1a2f47"/>

  <ellipse cx="70" cy="0" rx="70" ry="18" fill="none" stroke="#9FC6DE" strokeOpacity="0.35"/>

  {[40, 75, 110, 145].map((y) => (
  <line key={y} x1="0" y1={y} x2="140" y2={y} stroke="#0D2136" strokeOpacity="0.25"/>
  ))}

  {/* Tank top */}
  <rect x="55" y="-26" width="30" height="26" rx="3" fill="#22405f" stroke="#7FD4E0" strokeOpacity="0.4"/>

  {/* Gauge */}
  <circle cx="70" cy="70" r="22" fill="#0F2A45" stroke="#2DD4C8" strokeWidth="1.5"/>

  <circle cx="70" cy="70" r="22" fill="url(#glow)"/>

  <line x1="70" y1="70" x2="82" y2="58" stroke="#2DD4C8" strokeWidth="2" strokeLinecap="round">
  <animateTransform attributeName="transform" type="rotate" from="0 70 70" to="360 70 70" dur="6s" repeatCount="indefinite"/>
  </line>

  <circle cx="70" cy="70" r="2.5" fill="#2DD4C8"/>

  </g>

  {/* Piping */}
  <path d="M 210 260 h 60 v 40 h 90" fill="none" stroke="#3d5c80" strokeWidth="10" strokeLinecap="round"/>

  <path d="M 210 260 h 60 v 40 h 90" fill="none" stroke="#2DD4C8" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round"/>

  {/* Calibration tank */}
  <g transform="translate(370,380)">

  <ellipse cx="55" cy="0" rx="55" ry="14" fill="url(#tankBody2)"/>

  <rect x="0" y="0" width="110" height="140" fill="url(#tankBody2)"/>

  <ellipse cx="55" cy="140" rx="55" ry="14" fill="#152538"/>

  {[30, 60, 90, 118].map((y) => (
  <line key={y} x1="0" y1={y} x2="110" y2={y} stroke="#0D2136" strokeOpacity="0.25"/>
  ))}

  <circle cx="55" cy="55" r="16" fill="#0F2A45" stroke="#7ED957" strokeWidth="1.5"/>

  <text
  x="55"
  y="59"
  textAnchor="middle"
  fontSize="10"
  fill="#7ED957"
  fontFamily="monospace"
  >
  OK
  </text>

  </g>

  {/* Gauge cluster */}
  <g transform="translate(190,560)">

  <circle cx="0" cy="0" r="26" fill="#0F2A45" stroke="#2DD4C8" strokeWidth="1.5"/>

  <line x1="0" y1="0" x2="10" y2="-14" stroke="#2DD4C8" strokeWidth="2" strokeLinecap="round">
  <animateTransform attributeName="transform" type="rotate" values="0;40;-20;0" dur="4s" repeatCount="indefinite"/>
  </line>

  <circle cx="60" cy="20" r="18" fill="#0F2A45" stroke="#9FC6DE" strokeOpacity="0.6" strokeWidth="1.5"/>

  </g>

  {/* Sensor pulse nodes */}
  {[
  [210, 300],
  [430, 430],
  [230, 560],
  ].map(([cx, cy], i) => (
  <circle key={i} cx={cx} cy={cy} r="4" fill="#2DD4C8">
  <animate attributeName="r" values="4;9;4" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.5}s`}/>

  <animate attributeName="opacity" values="0.9;0.15;0.9" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.5}s`}/>
  </circle>
  ))}
  </svg>
  );
};

export default EquipmentScene;