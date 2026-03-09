# LM7001 Filter Calculator — Improvement Roadmap

## Project Overview

A polished RF engineering web app (React 18 + TypeScript + Vite + Recharts) with three calculators: PLL loop filter, output LPF, and active BJT filter. Deployed at https://lm7001.vercel.app.

---

## Tier 1 — High Value, Low Effort

### 1. Share via URL
Encode all calculator inputs as URL query params for shareable links. Decode on load.
- `URLSearchParams` read/write, `history.replaceState` on input change
- Files: `LoopFilterCalculator.tsx`, `OutputLPFCalculator.tsx`, `ActiveFilterCalculator.tsx`

### 2. Copy Results to Clipboard
"Copy" button in `ResultsPanel.tsx` — exports formatted text or CSV for lab notes.

### 3. E-Series Component Rounding
After calculating R, C, L — show nearest E12/E24/E96 standard value + error %.
- New file: `src/lib/eseries.ts`
- Show both exact and rounded values in `ResultsPanel.tsx`

### 4. Formula Reveal Panel
Collapsible "Show formulas" section per calculator with key equations.
- New component: `FormulaPanel.tsx`

---

## Tier 2 — Moderate Effort

### 5. Closed-Loop Bode Plot (Tab 1)
Currently Tab 1 shows open-loop only. Add H_cl(jω) = L(jω) / (1 + L(jω)) as a second series.
- Files: `loopFilter.ts`, `FrequencyPlot.tsx`, `LoopFilterCalculator.tsx`

### 6. Lock-Time Estimation
Add t_lock ≈ 1/fc estimate to PLL loop filter results.
- Files: `loopFilter.ts`, `types/index.ts`

### 7. Parameter Sweep / Sensitivity Analysis
Sweep one input (e.g., fc from 1–10 kHz) and plot the effect on R, C1, C2, phase margin.
- New components: `SweepPanel.tsx`

### 8. PDF / Print Export
Clean single-page print stylesheet: inputs + results table + topology diagram + Bode plot.
- New file: `src/styles/print.css`

### 9. BOM Export (CSV / JSON)
Bill of Materials with designators (R1, C1, C2, L1), calculated values, E-series rounded values.
- New file: `src/lib/bom.ts`

---

## Tier 3 — Significant New Features

### 10. Capture Range & Pull-In Range Calculator (Tab 4)
Hold-in range (Δf_H), pull-in range (Δf_P), lock-in range (Δf_L).
- New files: `src/lib/pllRanges.ts`, `src/components/PLLRangesCalculator.tsx`

### 11. Reference Spur Estimation
Spur level in dBc from loop filter attenuation at fref.
- Spur ≈ 20·log10(|H(j·2π·fref)|)
- Files: `loopFilter.ts` (extend result), `LoopFilterCalculator.tsx`

### 12. 3rd-Order Passive Loop Filter
Add a second RC section for better spur rejection. Filter-order toggle in Tab 1.
- New file: `src/lib/loopFilter3rd.ts`

### 13. Phase Noise Integration
Estimate integrated phase noise (in-band RMS jitter) from a simplified noise floor model.
- New file: `src/lib/phaseNoise.ts`

### 14. IF / Ceramic Filter Reference Guide
Static tab or modal: lookup table of common 10.7 MHz FM ceramic IF filters.

---

## Tier 4 — Developer Experience

### 15. Unit Tests (Vitest)
Test all pure math functions. Golden test case: the verified 45° example.
- fRF=90 MHz, fIF=10.7 MHz, fref=25 kHz → N=4028, C1=10.06 nF, R=15.28 kΩ, C2=1.73 nF
- Files: `src/lib/__tests__/loopFilter.test.ts`, `outputLpf.test.ts`, `activeFilter.test.ts`

### 16. Storybook
Develop `ResultsPanel`, `FrequencyPlot`, and SVG diagram components in isolation.

### 17. Accessibility (WCAG 2.1 AA)
- `role="table"` + `aria-label` on ResultsPanel
- `<title>` + `<desc>` on SVG schematics
- Keyboard navigation for tabs

---

## Priority Matrix

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| 3 | E-series rounding | High | Low |
| 1 | Share via URL | High | Low |
| 5 | Closed-loop Bode plot | High | Medium |
| 6 | Lock-time estimation | Medium | Low |
| 2 | Copy results | Medium | Low |
| 4 | Formula panel | Medium | Low |
| 7 | Parameter sweep | High | Medium |
| 10 | Capture/pull-in ranges | High | Medium |
| 11 | Reference spur | High | Medium |
| 8 | PDF/print export | Medium | Medium |
| 9 | BOM export | Medium | Medium |
| 15 | Unit tests | High (DX) | Medium |
| 12 | 3rd-order filter | High | High |
| 13 | Phase noise | Medium | High |
| 14 | IF filter guide | Medium | Low |
