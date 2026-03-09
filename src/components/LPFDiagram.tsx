/**
 * SVG schematic for OutputLPF calculator.
 * mode "lc":  VCO ──── L ────┬──── Load(Z0)
 *                            C
 *                            │
 *                           GND
 *
 * mode "rc":  VCO ──── R ────┬──── Output
 *                            C
 *                            │
 *                           GND
 */

const A  = "#adbac7";
const WR = "rgba(118,131,144,0.6)";
const LB = "rgba(139,148,158,0.85)";
const HL = "rgba(201,209,217,0.95)";

interface Props {
  mode: "lc" | "rc";
  seriesLabel?: string;
  shuntLabel?: string;
}

export default function LPFDiagram({ mode, seriesLabel, shuntLabel }: Props) {
  const isLC = mode === "lc";
  const SVG_W = 380, SVG_H = 175;

  const inX = 18, inY = 76;
  const sX1 = 60, sX2 = 195;
  const sY = 76;
  const jX = 215, jY = 76;

  const cX = jX, cT = 94, cB = 114;
  const gndY = 155;

  const outX = SVG_W - 12;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ fontFamily: "'Share Tech Mono', monospace", userSelect: "none", display: "block" }}
      aria-label={isLC ? "Топология LC-фильтра Баттерворт 2-го порядка" : "Топология RC-фильтра 1-го порядка"}
    >
      {/* VCO input */}
      <polygon points={`${inX},${inY - 4} ${inX + 12},${inY} ${inX},${inY + 4}`} fill={WR} />
      <text x={inX - 2} y={inY - 11} fontSize="9" fill={LB}>VCO</text>

      {/* wire: input → series element */}
      <line x1={inX + 14} y1={inY} x2={sX1} y2={sY} stroke={WR} strokeWidth="1.5" />

      {/* Series element */}
      {isLC
        ? <InductorH x1={sX1} x2={sX2} y={sY} label={seriesLabel ?? "L"} />
        : <HorizRes x1={sX1} x2={sX2} y={sY} label={seriesLabel ?? "R"} />
      }

      {/* wire: series → junction */}
      <line x1={sX2} y1={sY} x2={jX} y2={jY} stroke={WR} strokeWidth="1.5" />

      {/* Junction dot */}
      <circle cx={jX} cy={jY} r="2.8" fill={A} opacity="0.65" />

      {/* Shunt cap */}
      <line x1={cX} y1={jY} x2={cX} y2={cT} stroke={WR} strokeWidth="1.5" />
      <VertCap x={cX} y1={cT} y2={cB} label={shuntLabel ?? "C"} />
      <line x1={cX} y1={cB} x2={cX} y2={gndY} stroke={WR} strokeWidth="1.5" />
      <GndSym x={cX} y={gndY} />

      {/* Output wire */}
      <line x1={jX} y1={jY} x2={outX - 10} y2={jY} stroke={WR} strokeWidth="1.5" />
      <polygon points={`${outX - 12},${jY - 3} ${outX - 4},${jY} ${outX - 12},${jY + 3}`} fill={WR} />
      <text x={outX - 8} y={jY - 11} textAnchor="end" fontSize="9" fill={LB}>
        {isLC ? `Load (Z₀)` : "Output"}
      </text>

      {/* Filter order label */}
      <text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fontSize="9"
        fill="rgba(118,131,144,0.5)">
        {isLC ? "Butterworth 2nd order" : "RC 1st order"}
      </text>
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

/** Inductor: series of bumps above the wire */
function InductorH({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const numBumps = 5;
  const bumpW = (x2 - x1) / numBumps;
  const bumpR = bumpW / 2;
  const arcs = Array.from({ length: numBumps }, (_, i) => {
    const cx = x1 + bumpR + i * bumpW;
    return `M ${cx - bumpR} ${y} A ${bumpR} ${bumpR} 0 0 1 ${cx + bumpR} ${y}`;
  }).join(" ");

  return (
    <g>
      <path d={arcs} fill="none" stroke={A} strokeWidth="1.8" opacity="0.8" />
      <text x={(x1 + x2) / 2} y={y - bumpR - 6} textAnchor="middle" fontSize="10" fill={HL} fontWeight="500">
        [{label}]
      </text>
    </g>
  );
}

function VertCap({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  const mid = (y1 + y2) / 2;
  const pw = 10;
  const gap = 5;
  return (
    <g>
      <line x1={x - pw / 2} y1={mid - gap / 2} x2={x + pw / 2} y2={mid - gap / 2}
        stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      <line x1={x - pw / 2} y1={mid + gap / 2} x2={x + pw / 2} y2={mid + gap / 2}
        stroke={A} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      <text x={x + pw / 2 + 7} y={mid + 4} textAnchor="start" fontSize="10" fill={HL} fontWeight="500">
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
