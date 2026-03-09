/**
 * SVG schematic: passive PLL loop filter
 *
 *  PD1/PD2 ──┬──── R ────┬──── Vtune(VCO)
 *            │           │
 *           C2          C1
 *            │           │
 *           GND         GND
 */

const A  = "#adbac7";
const WR = "rgba(118,131,144,0.6)";
const LB = "rgba(139,148,158,0.85)";
const HL = "rgba(201,209,217,0.95)";

interface Props {
  R?: string;
  C1?: string;
  C2?: string;
}

export default function PassiveFilterDiagram({ R = "R", C1 = "C1", C2 = "C2" }: Props) {
  const W = 400, H = 175;

  const pdX = 20, pdY = 76;

  const j1X = 100, j1Y = 76;
  const rX1 = 118, rX2 = 240;
  const j2X = 260, j2Y = 76;
  const vtX = W - 10, vtY = 76;

  const c2X = j1X, c2T = 94, c2B = 114;
  const gnd1Y = 155;

  const c1X = j2X, c1T = 94, c1B = 114;
  const gnd2Y = 155;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ fontFamily: "'Share Tech Mono', monospace", userSelect: "none", display: "block" }}
      aria-label="Топология пассивного RC-фильтра ФАПЧ"
    >
      {/* PD arrow */}
      <polygon points={`${pdX},${pdY - 4} ${pdX + 12},${pdY} ${pdX},${pdY + 4}`} fill={WR} />
      <text x={pdX - 2} y={pdY - 11} fontSize="9" fill={LB}>PD1/PD2</text>

      {/* PD to j1 */}
      <line x1={pdX + 14} y1={pdY} x2={j1X} y2={j1Y} stroke={WR} strokeWidth="1.5" />

      {/* j1 junction dot */}
      <circle cx={j1X} cy={j1Y} r="2.8" fill={A} opacity="0.65" />

      {/* R: j1 → j2 */}
      <line x1={j1X} y1={j1Y} x2={rX1} y2={j1Y} stroke={WR} strokeWidth="1.5" />
      <HorizRes x1={rX1} x2={rX2} y={j1Y} label={R} />
      <line x1={rX2} y1={j1Y} x2={j2X} y2={j2Y} stroke={WR} strokeWidth="1.5" />

      {/* j2 junction dot */}
      <circle cx={j2X} cy={j2Y} r="2.8" fill={A} opacity="0.65" />

      {/* Vtune output */}
      <line x1={j2X} y1={j2Y} x2={vtX - 12} y2={vtY} stroke={WR} strokeWidth="1.5" />
      <polygon points={`${vtX - 12},${vtY - 3} ${vtX - 4},${vtY} ${vtX - 12},${vtY + 3}`} fill={WR} />
      <text x={vtX - 8} y={vtY - 11} textAnchor="end" fontSize="9" fill={LB}>Vtune</text>
      <text x={vtX - 8} y={vtY + 15} textAnchor="end" fontSize="9" fill="rgba(118,131,144,0.5)">(VCO)</text>

      {/* C2 */}
      <line x1={c2X} y1={j1Y} x2={c2X} y2={c2T} stroke={WR} strokeWidth="1.5" />
      <VertCap x={c2X} y1={c2T} y2={c2B} label={C2} labelSide="left" />
      <line x1={c2X} y1={c2B} x2={c2X} y2={gnd1Y} stroke={WR} strokeWidth="1.5" />
      <GndSym x={c2X} y={gnd1Y} />

      {/* C1 */}
      <line x1={c1X} y1={j2Y} x2={c1X} y2={c1T} stroke={WR} strokeWidth="1.5" />
      <VertCap x={c1X} y1={c1T} y2={c1B} label={C1} labelSide="right" />
      <line x1={c1X} y1={c1B} x2={c1X} y2={gnd2Y} stroke={WR} strokeWidth="1.5" />
      <GndSym x={c1X} y={gnd2Y} />
    </svg>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function HorizRes({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const mid = (x1 + x2) / 2;
  const w = (x2 - x1) * 0.65;
  const bh = 6;
  return (
    <g>
      <rect x={mid - w / 2} y={y - bh} width={w} height={bh * 2}
        fill="rgba(118,131,144,0.06)" stroke={A} strokeWidth="1.2" rx="1.5" opacity="0.75" />
      <text x={mid} y={y - bh - 8} textAnchor="middle" fontSize="10" fill={HL} fontWeight="500">
        [{label}]
      </text>
    </g>
  );
}

function VertCap({ x, y1, y2, label, labelSide }: {
  x: number; y1: number; y2: number; label: string; labelSide: "left" | "right";
}) {
  const mid = (y1 + y2) / 2;
  const pw = 10;
  const gap = 5;
  const lx = labelSide === "left" ? x - pw / 2 - 7 : x + pw / 2 + 7;
  return (
    <g>
      <line x1={x - pw / 2} y1={mid - gap / 2} x2={x + pw / 2} y2={mid - gap / 2}
        stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      <line x1={x - pw / 2} y1={mid + gap / 2} x2={x + pw / 2} y2={mid + gap / 2}
        stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      <text x={lx} y={mid + 4} textAnchor={labelSide === "left" ? "end" : "start"}
        fontSize="10" fill={HL} fontWeight="500">
        [{label}]
      </text>
    </g>
  );
}

function GndSym({ x, y }: { x: number; y: number }) {
  return (
    <g opacity="0.5">
      <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke={A} strokeWidth="1.5" />
      <line x1={x - 5} y1={y + 4} x2={x + 5} y2={y + 4} stroke={A} strokeWidth="1.2" />
      <line x1={x - 2.5} y1={y + 8} x2={x + 2.5} y2={y + 8} stroke={A} strokeWidth="1" />
    </g>
  );
}
