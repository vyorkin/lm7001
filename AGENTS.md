## Project Overview

Build a React TypeScript web application — a calculator for designing filters used with the
LM7001 PLL frequency synthesizer chip (Sanyo). The app has two separate calculators:

1. **PLL Loop Filter** — passive RC filter on the PD1/PD2 outputs that stabilises the PLL loop.
2. **Output Low-Pass Filter** — RC or LC filter placed after the VCO to suppress harmonics.

Target VCO frequency range: **87 MHz – 120 MHz** (FM broadcast band + extended, VCO = RF + IF).

---

## Chip Reference: LM7001J / LM7001JM

Source: Sanyo datasheet EN5262 (February 1997).

| Parameter | Value |
|---|---|
| Supply VDD1 (PLL block) | 4.5 – 6.5 V |
| Supply VDD2 (crystal oscillator) | 3.5 – 6.5 V |
| Crystal oscillator (XIN) | 5.0 – 7.2 (typ) – 8.0 MHz |
| FM input frequency (FMIN, s=1, high-speed) | 45 – 130 MHz |
| AM input frequency (AMIN, s=0) | 0.5 – 10 MHz |
| Reference frequencies (selectable) | 1, 5, 9, 10, 25, 50, 100 kHz |
| Programmable N divisor | 14-bit: D0 (LSB) – D13 (MSB), N = 1 – 16383 |
| Charge pump outputs | **PD1 and PD2** (two independent outputs, can be paralleled) |
| Charge pump current (Icp) | **Not specified in datasheet** — must be user input |
| PD output impedance | High-Z (3-state); leakage 0.01 – 10 nA |
| Serial interface | 3-wire: CE, CL, DATA |
| Packages | DIP16 (LM7001J), MFP20 (LM7001JM) |

### VCO Frequency Calculation

The chip divides the VCO (local oscillator) frequency, not the RF frequency directly:

```
FM VCO = FM RF + IF    (standard FM IF = 10.7 MHz)
N = FM VCO / fref

Example: RF = 90.0 MHz, IF = 10.7 MHz
  VCO = 100.7 MHz, fref = 100 kHz → N = 1007
```

For the standard FM band (RF 87.5–108 MHz) with 10.7 MHz IF:
- VCO range: 98.2 – 118.7 MHz
- N range at fref = 25 kHz: 3928 – 4748

### Charge Pump Note

The chip provides **two separate charge pump outputs** (PD1, PD2). They are typically:
- Connected together (parallel) to double effective Icp
- Or used independently for dual-loop designs

Since Icp is not datasheet-specified, the user must measure it or use a typical value from
application examples (common range: 0.1 – 2 mA for NMOS-era chips like this).

---

## Feature Requirements

### Calculator A — PLL Loop Filter

Design a **2nd-order passive loop filter** for the charge pump PLL.

**User inputs:**
| Parameter | Symbol | Default / range |
|---|---|---|
| FM RF frequency | fRF | 87.5 – 108 MHz |
| FM IF frequency | fIF | 10.7 MHz |
| Reference frequency | fref | 25 kHz (select from: 1/5/9/10/25/50/100 kHz) |
| Charge pump current | Icp | 1 mA (user measured) |
| VCO gain | Kvco | Hz/V (user measured) |
| Desired loop bandwidth | fc | fref / 10 (suggestion, user-editable) |
| Desired phase margin | φm | 45° (30–70° range) |

**Calculated outputs:**
| Output | Description |
|---|---|
| N | Division ratio = fVCO / fref |
| fVCO | Computed VCO frequency (fRF + fIF) |
| R | Series resistor |
| C1 | Dominant (stabilising) capacitor |
| C2 | Feed-forward capacitor (C2 << C1) |
| fz | Zero frequency = 1 / (2π·R·C1) |
| fp | Pole frequency = (C1+C2) / (2π·R·C1·C2) |
| φm (actual) | Phase margin from chosen component values |
| fc (actual) | Actual loop bandwidth |

Show a warning if fc > fref / 10 (risk of reference spur injection / instability).

---

### Calculator B — Output Low-Pass Filter

Design a filter at the VCO output to suppress 2nd and higher harmonics.

Goal: pass 87–120 MHz, suppress ≥ 174 MHz (2nd harmonic of 87 MHz).

**Sub-modes (user selects):**

**Mode 1 — RC (1st order):**
Inputs: R and fc_target → calculate C (or: C and fc_target → calculate R)

**Mode 2 — LC Butterworth (2nd order):**
Inputs: fc_target, source/load impedance Z0 (default 50 Ω) → calculate L and C

**Common inputs:**
| Parameter | Default |
|---|---|
| Target cutoff frequency fc | 150 MHz |
| Source impedance Z0 | 50 Ω |
| VCO max frequency | 120 MHz |

**Outputs:**
- Component values (R, C) or (L, C)
- Actual −3 dB cutoff frequency
- Attenuation at 2× fVCO_max = 240 MHz [dB]
- Attenuation at 3× fVCO_max = 360 MHz [dB]

---

## Math & Formulas

### PLL Loop Filter — Type 2, 2nd Order Passive

**Filter topology (passive lag-lead):**

```
PD1/PD2 ──┬──── R ────┬──── VCO Vtune
           │           │
          C2          C1
           │           │
          GND         GND
```

C2 is directly at the charge pump output (suppresses discrete voltage steps).
R + C1 in series creates the stabilising zero.

**Transfer function:**

```
F(s) = (1 + s·R·C1) / [ s·(C1+C2)·(1 + s·R·C1·C2/(C1+C2)) ]
```

**Open-loop transfer function:**

```
G(s) = (Icp / 2π) · (Kvco_rad / N) · F(s) / s

where Kvco_rad = 2π · Kvco_Hz   [rad/s/V]
```

**Zero and pole frequencies:**

```
ωz = 1 / (R · C1)
ωp = (C1 + C2) / (R · C1 · C2)   ≈ 1 / (R · C2)  when C1 >> C2
```

**Phase margin at crossover ωc:**

```
φm = arctan(ωc / ωz) − arctan(ωc / ωp)
```

**Design algorithm (given fc, φm, Icp, Kvco, N):**

```
ωc = 2π · fc

// Geometric mean factor from phase margin
T  = tan(φm_rad)
m  = T + sqrt(T² + 1)         // = 1/tan(φm/2 + π/4), m > 1

// Place zero and pole symmetrically around ωc
ωz = ωc / m
ωp = ωc · m

// Component values
C1 = (Icp · Kvco_rad) / (2π · N · ωc²)   // dominant cap
R  = m / (ωc · C1)                          // = 1/(ωz · C1)
C2 = C1 / m²                                // = 1/(ωp · R)
```

**Unit-gain check at ωc (verification):**

```
// This should equal 1.0 (within rounding tolerance)
|G(jωc)| = (Icp · Kvco_rad · R · C1) / (N · (C1+C2)) ·
           sqrt(1 + (ωc·R·C1)²) / sqrt(1 + (ωc·R·C1·C2/(C1+C2))²)
           / (ωc · R · (C1+C2))
```

**Typical component ranges for FM PLL at fref = 25 kHz, fc ≈ 2.5 kHz, φm = 45°:**
- N ≈ 4000 (for ~100 MHz VCO)
- C1 ~ 10–100 nF
- R ~ 1–100 kΩ
- C2 = C1/m² (for φm=45°: m ≈ 2.414, so C2 ≈ C1/5.8)

---

### Output Low-Pass Filter

**RC filter (1st order):**

```
fc = 1 / (2π · R · C)

Solve for C: C = 1 / (2π · R · fc)
Solve for R: R = 1 / (2π · C · fc)

Attenuation at frequency f:
  A(f) = −20 · log10(sqrt(1 + (f/fc)²))   [dB]
```

**LC Butterworth 2nd order (maximally flat magnitude):**

```
fc = 1 / (2π · sqrt(L · C))
Z0 = sqrt(L / C)   [characteristic impedance]

Solve: L = Z0 / (2π · fc)
       C = 1 / (Z0 · 2π · fc)

Attenuation at frequency f (f >> fc):
  A(f) ≈ −40 · log10(f / fc)   [dB]
```

---

## Tech Stack

| Tool | Choice |
|---|---|
| Framework | React 18 + TypeScript (`strict: true`) |
| Build tool | Vite |
| Styling | Tailwind CSS v3 |
| Math | Pure TypeScript — no external math library |
| Charts | Recharts (for optional frequency response plot) |
| State | `useState` / `useReducer` — no Redux |
| Package manager | npm |

**Before using any library feature, check docs via the Context7 MCP server.**

---

## Project Structure

```
lm7001/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── LoopFilterCalculator.tsx   # Calculator A: inputs + results
│   │   ├── OutputLPFCalculator.tsx    # Calculator B: inputs + results
│   │   ├── ResultsPanel.tsx           # Formatted component value display
│   │   └── FrequencyPlot.tsx          # Optional: Bode / attenuation plot
│   ├── lib/
│   │   ├── loopFilter.ts              # PLL loop filter math — pure functions
│   │   ├── outputLpf.ts               # Output LPF math — pure functions
│   │   └── units.ts                   # SI unit conversions (Hz↔rad/s, etc.)
│   └── types/
│       └── index.ts                   # Shared TypeScript interfaces
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

All calculation logic lives in `src/lib/` as **pure functions** (no React imports).
Components only call lib functions and render results.

---

## Code Conventions

- TypeScript `strict: true`; no `any`
- Named exports everywhere; default exports only for React components
- **SI units internally**: Hz, rad/s, A, V, Ω, F, H — convert only at I/O boundaries
- Every lib function: takes a typed input object, returns a typed result object
- Validate inputs and return `{ ok: false, error: string }` — do not throw
- Keep components small; move math to `src/lib/` immediately

---

## Development Principles

- Challenge assumptions before implementing — flag risks, propose alternatives
- Greenfield project: refactor freely, change architecture if a better design emerges
- Write clear UI labels with units (e.g. "Loop bandwidth fc [Hz]")
- Include realistic default values so the calculator produces sensible output on first load

---

## Session Startup Checklist

1. Read **AGENTS.md**.
2. Run `npm install`, then verify: `npm run build`.
3. Check TypeScript: `npx tsc --noEmit`.
4. Review recent changes: `git log --oneline -10`.
5. Proceed with the assigned task.
