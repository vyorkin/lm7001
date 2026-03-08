// ---------------------------------------------------------------------------
// PLL Loop Filter — Type 2, 2nd Order Passive
// Pure functions; no React imports.
// All values in SI units: Hz, rad/s, A, V, Ω, F
// ---------------------------------------------------------------------------

import { hzToRad, radToHz, TWO_PI } from './units'
import type { LoopFilterInput, LoopFilterResult, Result } from '../types'

/** Validate inputs and return an error string or null. */
function validate(i: LoopFilterInput): string | null {
  if (i.fRF <= 0) return 'fRF must be > 0'
  if (i.fIF <= 0) return 'fIF must be > 0'
  if (i.fref <= 0) return 'fref must be > 0'
  if (i.Icp <= 0) return 'Icp must be > 0'
  if (i.Kvco <= 0) return 'Kvco must be > 0'
  if (i.fc <= 0) return 'Loop bandwidth fc must be > 0'
  if (i.phiM <= 0 || i.phiM >= 90)
    return 'Phase margin must be between 0° and 90°'
  if (i.fc >= i.fref / 2)
    return 'Loop bandwidth fc must be much less than fref/2'
  return null
}

/**
 * Design a 2nd-order passive PLL loop filter.
 *
 * Topology:
 *   PD ──┬── R ──┬── Vtune
 *        │       │
 *       C2      C1
 *        │       │
 *       GND     GND
 *
 * Algorithm places ωz and ωp symmetrically around ωc using the phase
 * margin condition φm = arctan(ωc/ωz) − arctan(ωc/ωp).
 */
export function calculateLoopFilter(
  input: LoopFilterInput,
): Result<LoopFilterResult> {
  const err = validate(input)
  if (err !== null) return { ok: false, error: err }

  const { fRF, fIF, fref, Icp, Kvco, fc, phiM } = input

  // --- Derived quantities ---
  const fVCO = fRF + fIF
  const N = Math.round(fVCO / fref) // integer division ratio

  if (N <= 0) return { ok: false, error: 'Computed N ≤ 0 — check fRF/fIF/fref' }

  const Kvco_rad = hzToRad(Kvco) // rad/s/V
  const wc = hzToRad(fc) // rad/s

  // --- Phase margin geometry ---
  // φm = arctan(ωc/ωz) − arctan(ωc/ωp)
  // Maximised when ωz = ωc/m, ωp = ωc·m, where m = tan(φm) + sqrt(tan²(φm)+1)
  const phiM_rad = (phiM * Math.PI) / 180
  const T = Math.tan(phiM_rad)
  const m = T + Math.sqrt(T * T + 1) // geometric mean factor, m > 1

  const wz = wc / m // zero angular frequency
  const wp = wc * m // pole angular frequency

  // --- Component values ---
  // C1 from open-loop gain = 1 at ωc:
  //   |G(jωc)| = (Icp · Kvco_rad) / (2π · N · ωc²) = C1
  //   (using the approximation at the zero crossing)
  const C1 = (Icp * Kvco_rad) / (TWO_PI * N * wc * wc)
  const R = m / (wc * C1) // = 1 / (wz · C1)
  const C2 = C1 / (m * m) // = 1 / (wp · R)

  // --- Verification: actual zero / pole frequencies ---
  const fz = radToHz(wz) // = 1 / (2π · R · C1)
  const fp = radToHz(wp) // = (C1+C2) / (2π · R · C1 · C2)

  // --- Actual phase margin from placed components ---
  const wz_actual = 1 / (R * C1)
  const wp_actual = (C1 + C2) / (R * C1 * C2)
  const phiM_actual =
    ((Math.atan(wc / wz_actual) - Math.atan(wc / wp_actual)) * 180) / Math.PI

  const stabilityWarning = fc > fref / 10

  return {
    ok: true,
    value: {
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
    },
  }
}
