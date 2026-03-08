// ---------------------------------------------------------------------------
// Active PLL Loop Filter — Emitter Follower (NPN/PNP)
// Pure functions; no React imports.
// All values in SI units: Hz, rad/s, A, V, Ω, F
// ---------------------------------------------------------------------------

import { hzToRad, radToHz, TWO_PI } from './units'
import type {
  ActiveFilterInput,
  ActiveFilterResult,
  Result,
  TransistorPreset,
} from '../types'

// ---------------------------------------------------------------------------
// Transistor presets
// ---------------------------------------------------------------------------

export const TRANSISTOR_PRESETS: TransistorPreset[] = [
  {
    name: 'КТ315Б',
    type: 'NPN',
    hFE_min: 30,
    hFE_typ: 100,
    Vbe: 0.65,
    description: 'Советский, ДО-35',
  },
  {
    name: 'КТ315Г',
    type: 'NPN',
    hFE_min: 50,
    hFE_typ: 150,
    Vbe: 0.65,
    description: 'Советский, ДО-35',
  },
  {
    name: 'КТ361Б',
    type: 'PNP',
    hFE_min: 30,
    hFE_typ: 100,
    Vbe: 0.65,
    description: 'Советский, ДО-35',
  },
  {
    name: 'КТ3102А',
    type: 'NPN',
    hFE_min: 100,
    hFE_typ: 200,
    Vbe: 0.65,
    description: 'Советский, малошумящий',
  },
  {
    name: 'BC547B',
    type: 'NPN',
    hFE_min: 110,
    hFE_typ: 200,
    Vbe: 0.65,
    description: 'Европейский, ТО-92',
  },
  {
    name: 'BC557B',
    type: 'PNP',
    hFE_min: 110,
    hFE_typ: 200,
    Vbe: 0.65,
    description: 'Европейский, ТО-92',
  },
  {
    name: '2SC1815Y',
    type: 'NPN',
    hFE_min: 120,
    hFE_typ: 200,
    Vbe: 0.65,
    description: 'Японский, ТО-92',
  },
  {
    name: 'Пользовательский',
    type: 'NPN',
    hFE_min: 100,
    hFE_typ: 100,
    Vbe: 0.65,
    description: 'Ввод вручную',
  },
]

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateActive(i: ActiveFilterInput): string | null {
  if (i.fRF <= 0) return 'fRF должно быть > 0'
  if (i.fIF <= 0) return 'fIF должно быть > 0'
  if (i.fref <= 0) return 'fref должно быть > 0'
  if (i.Icp <= 0) return 'Icp должно быть > 0'
  if (i.Kvco <= 0) return 'Kvco должно быть > 0'
  if (i.fc <= 0) return 'Полоса петли fc должна быть > 0'
  if (i.phiM <= 0 || i.phiM >= 90)
    return 'Запас по фазе должен быть между 0° и 90°'
  if (i.fc >= i.fref / 2)
    return 'Полоса петли fc должна быть намного меньше fref/2'
  if (i.hFE <= 0) return 'hFE должно быть > 0'
  if (i.Vcc <= 0) return 'Vcc должно быть > 0'
  if (i.Ic_q <= 0) return 'Ток покоя Ic должен быть > 0'
  return null
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

/**
 * Design active PLL loop filter with emitter follower transistor stage.
 *
 * RC topology (same as passive):
 *   PD ──┬── R ──┬── [Q base] ─── Vtune
 *        │       │
 *       C2      C1
 *        │       │
 *       GND     GND
 *
 * Transistor (NPN emitter follower):
 *   Base ← RC filter output
 *   Emitter → Vtune(VCO)
 *   Collector → Vcc via Rc
 *
 * Reduces output impedance from R → R/hFE + re
 */
export function calculateActiveFilter(
  input: ActiveFilterInput,
): Result<ActiveFilterResult> {
  const err = validateActive(input)
  if (err !== null) return { ok: false, error: err }

  const { fRF, fIF, fref, Icp, Kvco, fc, phiM, hFE, Vcc, Ic_q, transistorType } = input

  // --- Derived quantities ---
  const fVCO = fRF + fIF
  const N = Math.round(fVCO / fref)

  if (N <= 0) return { ok: false, error: 'Вычисленное N ≤ 0 — проверьте fRF/fIF/fref' }

  const Kvco_rad = hzToRad(Kvco)
  const wc = hzToRad(fc)

  // --- Phase margin geometry ---
  const phiM_rad = (phiM * Math.PI) / 180
  const T = Math.tan(phiM_rad)
  const m = T + Math.sqrt(T * T + 1)

  const wz = wc / m
  const wp = wc * m

  // --- RC component values ---
  const C1 = (Icp * Kvco_rad) / (TWO_PI * N * wc * wc)
  const R = m / (wc * C1)
  const C2 = C1 / (m * m)

  const fz = radToHz(wz)
  const fp = radToHz(wp)

  // --- Actual phase margin ---
  const wz_actual = 1 / (R * C1)
  const wp_actual = (C1 + C2) / (R * C1 * C2)
  const phiM_actual =
    ((Math.atan(wc / wz_actual) - Math.atan(wc / wp_actual)) * 180) / Math.PI

  const stabilityWarning = fc > fref / 10

  // --- Transistor bias point ---
  const Vbe = 0.65 // silicon Vbe [V]
  const Vtune_q = Vcc / 2 // desired quiescent tune voltage

  let Vbase_q: number
  let Rc: number
  let Rb: number

  if (transistorType === 'NPN') {
    // NPN: base = emitter + Vbe
    Vbase_q = Vtune_q + Vbe
    // Collector resistor: drops Vcc - Vbase_q at Ic_q
    Rc = (Vcc - Vbase_q) / Ic_q
    // Base bias resistor from Vcc (10× Ib for stability)
    const Ib_temp = Ic_q / hFE
    Rb = (Vcc - Vbase_q) / (10 * Ib_temp)
  } else {
    // PNP: base = emitter - Vbe (emitter at Vtune_q from GND perspective,
    // but PNP emitter is at Vcc side — recalc for PNP common emitter follower)
    // PNP emitter follower: emitter → Vtune, collector to GND via Rc
    // Vtune_q = Vbase_q + Vbe (emitter is higher than base for PNP by Vbe... wait)
    // PNP: Veb = Vbe = 0.65V, so Vemitter = Vbase + Vbe
    // Since emitter = Vtune_q: Vbase_q = Vtune_q - Vbe
    Vbase_q = Vtune_q - Vbe
    // Collector resistor to GND
    Rc = Vtune_q / Ic_q
    // Base resistor to GND
    const Ib_temp = Ic_q / hFE
    Rb = Vbase_q / (10 * Ib_temp)
  }

  const Ib = Ic_q / hFE

  // --- Output impedance ---
  // Thermal resistance re = Vt / Ic_q (Vt ≈ 26 mV at room temp)
  const re = 0.026 / Ic_q
  const Z_out = R / hFE + re
  const Z_out_passive = R

  return {
    ok: true,
    value: {
      // RC filter results
      fVCO,
      N,
      m,
      fz,
      fp,
      R,
      C1,
      C2,
      phiM_actual,
      fc_actual: fc,
      stabilityWarning,
      // Transistor results
      hFE,
      Vcc,
      Vbe,
      Ic_q,
      Ib,
      Rc,
      Rb,
      Vtune_q,
      Z_out,
      Z_out_passive,
    },
  }
}
