import type { TransistorType } from "../types";

interface Props {
  transistorType: TransistorType;
  Rc?: string;
  Rb?: string;
  R?: string;
  C1?: string;
  C2?: string;
}

const A  = "#adbac7";
const W  = "rgba(118,131,144,0.6)";
const LB = "rgba(139,148,158,0.85)";
const HL = "rgba(201,209,217,0.95)";

export default function TopologyDiagram({
  transistorType,
  Rc = "Rc",
  Rb = "Rb",
  R = "R",
  C1 = "C1",
  C2 = "C2",
}: Props) {
  const isNPN = transistorType === "NPN";
  const supplyLabel = isNPN ? "+Vcc" : "GND";

  // ── Layout constants ────────────────────────────────────────────────────────
  const SVG_W = 448;
  const SVG_H = 266;

  // +Vcc bus: connects Rc-top and Rb-top and collector (for NPN)
  const busY = 22;

  // Left supply vertical: Rc + C2
  const lcX = 112; // x for left chain (Rc, C2, GND)
  const rcT = 30;
  const rcB = 78;
  // Collector node = Rc-bottom
  const cjY = rcB;

  // C2 shunt from collector node
  const c2T = 95;
  const c2B = 116;
  const gnd1Y = 244;

  // PD input horizontal
  const pdY = 160;

  // Base junction (NodeB): where R-right, C1, Rb-bottom, base-lead all meet
  const nbX = 228;
  const nbY = pdY;

  // Rb on right of left chain, above nodeB
  const rbX = nbX;
  const rbT = 30;
  const rbB = 78;

  // C1 shunt from nodeB
  const c1T = 178;
  const c1B = 200;
  const gnd2Y = 244;

  // R horizontal: from lcX+gap to nbX-gap
  const rX1 = 130;
  const rX2 = 210;

  // BJT
  const bjX = 292, bjY = 160, bjR = 23;

  // Collector exit (NPN: up-right diagonal from vertical bar)
  // BJT internal bar at x = bjX - bjR*0.4 ≈ 283
  // Collector line ends at (bjX + 14, bjY - 17) ≈ (306, 143)
  const colExX = 306, colExY = 143;

  // Emitter exit (NPN: down-right)
  const emtExX = 306, emtExY = 177;

  // Collector wire runs horizontally at y=cjY=78 from colExX back to lcX
  // It crosses the Rb vertical at (nbX, cjY) — no-connect crossing at that point
  const colWireY = cjY; // = rcB = 78

  // PD wire crosses lcX vertical at y=pdY
  // lcX vertical from c2B (116) to gnd1 (244) at x=lcX → PD crosses at (lcX, pdY=160) which is in [116,244]

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ fontFamily: "'Share Tech Mono', monospace", userSelect: "none", display: "block" }}
      aria-label={`Топология активного фильтра ФАПЧ (${transistorType})`}
    >
      {/* ── +Vcc / GND bus ─────────────────────────────────────────────── */}
      <line x1={lcX} y1={busY} x2={rbX} y2={busY} stroke={W} strokeWidth="1.5" />
      <text x={(lcX + rbX) / 2} y={busY - 7} textAnchor="middle" fontSize="10" fill={LB} fontWeight="600">
        {supplyLabel}
      </text>

      {/* ── Left chain: Rc → collector node → C2 → GND ────────────────── */}
      <line x1={lcX} y1={busY} x2={lcX} y2={rcT} stroke={W} strokeWidth="1.5" />
      <VertRes x={lcX} y1={rcT} y2={rcB} label={Rc} />
      {/* cj node (Rc bottom = collector) → C2 */}
      <line x1={lcX} y1={rcB} x2={lcX} y2={c2T} stroke={W} strokeWidth="1.5" />
      <VertCap x={lcX} y1={c2T} y2={c2B} label={C2} labelSide="left" />
      <line x1={lcX} y1={c2B} x2={lcX} y2={gnd1Y} stroke={W} strokeWidth="1.5" />
      <GndSym x={lcX} y={gnd1Y} />

      {/* ── Rb chain: bus → Rb → nodeB ────────────────────────────────── */}
      <line x1={rbX} y1={busY} x2={rbX} y2={rbT} stroke={W} strokeWidth="1.5" />
      <VertRes x={rbX} y1={rbT} y2={rbB} label={Rb} labelRight />
      <line x1={rbX} y1={rbB} x2={rbX} y2={nbY} stroke={W} strokeWidth="1.5" />

      {/* ── PD input → R → nodeB ─────────────────────────────────────── */}
      {/* Wire from PD to crossing at lcX */}
      <line x1={18} y1={pdY} x2={lcX - 8} y2={pdY} stroke={W} strokeWidth="1.5" />
      {/* No-connect bump over lcX vertical */}
      <NoCon x={lcX} y={pdY} />
      {/* Wire from lcX to R start */}
      <line x1={lcX + 8} y1={pdY} x2={rX1} y2={pdY} stroke={W} strokeWidth="1.5" />
      <HorizRes x1={rX1} x2={rX2} y={pdY} label={R} />
      <line x1={rX2} y1={pdY} x2={nbX} y2={pdY} stroke={W} strokeWidth="1.5" />

      {/* ── PD arrow ────────────────────────────────────────────────────── */}
      <polygon points={`${18},${pdY - 4} ${30},${pdY} ${18},${pdY + 4}`} fill={W} />
      <text x={14} y={pdY - 7} textAnchor="end" fontSize="9" fill={LB}>PD1/PD2</text>

      {/* ── C1 + GND ──────────────────────────────────────────────────── */}
      <line x1={nbX} y1={nbY} x2={nbX} y2={c1T} stroke={W} strokeWidth="1.5" />
      <VertCap x={nbX} y1={c1T} y2={c1B} label={C1} labelSide="right" />
      <line x1={nbX} y1={c1B} x2={nbX} y2={gnd2Y} stroke={W} strokeWidth="1.5" />
      <GndSym x={nbX} y={gnd2Y} />

      {/* ── Collector wire: BJT col-exit → up → cross Rb → left → Rc-bot ── */}
      <line x1={colExX} y1={colExY} x2={colExX} y2={colWireY} stroke={W} strokeWidth="1.5" />
      {/* Horizontal at colWireY from colExX to nbX, with no-connect cross over Rb */}
      <line x1={colExX} y1={colWireY} x2={nbX + 8} y2={colWireY} stroke={W} strokeWidth="1.5" />
      <NoCon x={nbX} y={colWireY} horizontal />
      <line x1={nbX - 8} y1={colWireY} x2={lcX} y2={colWireY} stroke={W} strokeWidth="1.5" />
      {/* Collector junction dot at lcX */}
      <circle cx={lcX} cy={cjY} r="2.8" fill={A} opacity="0.65" />

      {/* ── Emitter wire → Vtune ─────────────────────────────────────── */}
      <line x1={emtExX} y1={emtExY} x2={SVG_W - 10} y2={emtExY} stroke={W} strokeWidth="1.5" />
      <text x={SVG_W - 8} y={emtExY - 7} textAnchor="end" fontSize="9" fill={LB}>Vtune</text>
      <text x={SVG_W - 8} y={emtExY + 13} textAnchor="end" fontSize="9" fill="rgba(118,131,144,0.5)">(VCO)</text>
      <polygon points={`${SVG_W - 12},${emtExY - 3} ${SVG_W - 4},${emtExY} ${SVG_W - 12},${emtExY + 3}`} fill={W} />

      {/* ── NodeB junction dot ────────────────────────────────────────── */}
      <circle cx={nbX} cy={nbY} r="2.8" fill={A} opacity="0.65" />

      {/* ── BJT symbol ───────────────────────────────────────────────── */}
      <BJTSym cx={bjX} cy={bjY} r={bjR} isNPN={isNPN} />

      {/* ── BJT base lead ─────────────────────────────────────────────── */}
      <line x1={nbX} y1={nbY} x2={bjX - bjR} y2={nbY} stroke={W} strokeWidth="1.5" />

      {/* ── Transistor label ──────────────────────────────────────────── */}
      <text x={bjX + bjR + 5} y={bjY + bjR + 2} textAnchor="start" fontSize="10" fill={HL} fontWeight="600">
        Q1 {transistorType}
      </text>

    </svg>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function VertRes({
  x, y1, y2, label, labelRight,
}: {
  x: number; y1: number; y2: number; label: string; labelRight?: boolean;
}) {
  const mid = (y1 + y2) / 2;
  const h = (y2 - y1) * 0.7;
  const bw = 11;
  const lx = labelRight ? x + bw + 4 : x - bw - 4;
  const anchor = labelRight ? "start" : "end";
  return (
    <g>
      <rect
        x={x - bw} y={mid - h / 2} width={bw * 2} height={h}
        fill="rgba(118,131,144,0.06)" stroke={A} strokeWidth="1.2" rx="1.5" opacity="0.75"
      />
      <text x={lx} y={mid + 4} fontSize="10" textAnchor={anchor} fill={HL} fontWeight="500">
        [{label}]
      </text>
    </g>
  );
}

function HorizRes({
  x1, x2, y, label,
}: {
  x1: number; x2: number; y: number; label: string;
}) {
  const mid = (x1 + x2) / 2;
  const w = (x2 - x1) * 0.7;
  const bh = 8;
  return (
    <g>
      <rect
        x={mid - w / 2} y={y - bh} width={w} height={bh * 2}
        fill="rgba(118,131,144,0.06)" stroke={A} strokeWidth="1.2" rx="1.5" opacity="0.75"
      />
      <text x={mid} y={y - bh - 8} textAnchor="middle" fontSize="10" fill={HL} fontWeight="500">
        [{label}]
      </text>
    </g>
  );
}

function VertCap({
  x, y1, y2, label, labelSide,
}: {
  x: number; y1: number; y2: number; label: string; labelSide: "left" | "right";
}) {
  const mid = (y1 + y2) / 2;
  const gap = 6;
  const pw = 14;
  const lx = labelSide === "left" ? x - pw / 2 - 5 : x + pw / 2 + 5;
  const anchor = labelSide === "left" ? "end" : "start";
  return (
    <g>
      <line x1={x - pw / 2} y1={mid - gap / 2} x2={x + pw / 2} y2={mid - gap / 2}
        stroke={A} strokeWidth="2.2" opacity="0.8" strokeLinecap="round" />
      <line x1={x - pw / 2} y1={mid + gap / 2} x2={x + pw / 2} y2={mid + gap / 2}
        stroke={A} strokeWidth="2.2" opacity="0.8" strokeLinecap="round" />
      <text x={lx} y={mid + 4} textAnchor={anchor} fontSize="10" fill={HL} fontWeight="500">
        [{label}]
      </text>
    </g>
  );
}

function GndSym({ x, y }: { x: number; y: number }) {
  return (
    <g opacity="0.55">
      <line x1={x - 9} y1={y} x2={x + 9} y2={y} stroke={A} strokeWidth="1.5" />
      <line x1={x - 6} y1={y + 5} x2={x + 6} y2={y + 5} stroke={A} strokeWidth="1.2" />
      <line x1={x - 3} y1={y + 10} x2={x + 3} y2={y + 10} stroke={A} strokeWidth="1" />
    </g>
  );
}

/** No-connection crossing indicator (small arc bump upward on horizontal wire) */
function NoCon({ x, y }: { x: number; y: number; horizontal?: boolean }) {
  const r = 8;
  return (
    <path
      d={`M ${x - r} ${y} Q ${x} ${y - r * 1.4} ${x + r} ${y}`}
      fill="none" stroke={W} strokeWidth="1.5"
    />
  );
}

function BJTSym({
  cx, cy, r, isNPN,
}: {
  cx: number; cy: number; r: number; isNPN: boolean;
}) {
  // Circle
  // Base vertical bar at x = cx - r*0.35
  const barX = cx - r * 0.35;
  const barY1 = cy - r * 0.6;
  const barY2 = cy + r * 0.6;

  // Collector diagonal: from (barX, cy - r*0.4) to (cx + r*0.6, cy - r*0.75)
  const colBX = barX, colBY = cy - r * 0.38;
  const colEX = cx + r * 0.62, colEY = cy - r * 0.76;

  // Emitter diagonal: from (barX, cy + r*0.4) to (cx + r*0.6, cy + r*0.75)
  const emtBX = barX, emtBY = cy + r * 0.38;
  const emtEX = cx + r * 0.62, emtEY = cy + r * 0.76;

  // Arrow on emitter
  // NPN: arrow at tip (pointing away from bar = outward at emtEX, emtEY)
  // PNP: arrow near bar (pointing toward bar = inward)
  const dx = emtEX - emtBX;
  const dy = emtEY - emtBY;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const arrowSize = 5;

  // NPN: arrow at emitter tip, pointing outward
  const aNPN_tip = { x: emtEX, y: emtEY };
  const aNPN_b1 = { x: emtEX - ux * arrowSize - uy * arrowSize * 0.5, y: emtEY - uy * arrowSize + ux * arrowSize * 0.5 };
  const aNPN_b2 = { x: emtEX - ux * arrowSize + uy * arrowSize * 0.5, y: emtEY - uy * arrowSize - ux * arrowSize * 0.5 };

  // PNP: arrow near base end of emitter
  const tPNP = 0.35; // along emitter line from bar end
  const aPNP_tip = { x: emtBX + dx * tPNP, y: emtBY + dy * tPNP };
  const aPNP_b1 = { x: aPNP_tip.x + ux * arrowSize - uy * arrowSize * 0.5, y: aPNP_tip.y + uy * arrowSize + ux * arrowSize * 0.5 };
  const aPNP_b2 = { x: aPNP_tip.x + ux * arrowSize + uy * arrowSize * 0.5, y: aPNP_tip.y + uy * arrowSize - ux * arrowSize * 0.5 };

  return (
    <g>
      {/* Circle */}
      <circle cx={cx} cy={cy} r={r}
        fill="rgba(118,131,144,0.06)" stroke={A} strokeWidth="1.3" opacity="0.75" />
      {/* Base bar */}
      <line x1={barX} y1={barY1} x2={barX} y2={barY2} stroke={A} strokeWidth="2" opacity="0.85" />
      {/* Collector line */}
      <line x1={colBX} y1={colBY} x2={colEX} y2={colEY} stroke={A} strokeWidth="1.5" opacity="0.8" />
      {/* Emitter line */}
      <line x1={emtBX} y1={emtBY} x2={emtEX} y2={emtEY} stroke={A} strokeWidth="1.5" opacity="0.8" />
      {/* Arrow */}
      {isNPN ? (
        <polygon
          points={`${aNPN_tip.x},${aNPN_tip.y} ${aNPN_b1.x},${aNPN_b1.y} ${aNPN_b2.x},${aNPN_b2.y}`}
          fill={A} opacity="0.8"
        />
      ) : (
        <polygon
          points={`${aPNP_tip.x},${aPNP_tip.y} ${aPNP_b1.x},${aPNP_b1.y} ${aPNP_b2.x},${aPNP_b2.y}`}
          fill={A} opacity="0.8"
        />
      )}
    </g>
  );
}
