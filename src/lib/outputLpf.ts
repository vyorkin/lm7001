// ---------------------------------------------------------------------------
// Output Low-Pass Filter calculator
// Pure functions; no React imports.
// All values in SI units: Hz, Ω, F, H
// ---------------------------------------------------------------------------

import { TWO_PI } from './units'
import type { OutputLPFInput, OutputLPFResult, Result } from '../types'

/**
 * Attenuation of a 1st-order RC filter at frequency f [dB].
 * A(f) = −20·log10(sqrt(1 + (f/fc)²))
 */
function attenRC(f: number, fc: number): number {
  return -20 * Math.log10(Math.sqrt(1 + (f / fc) ** 2))
}

/**
 * Attenuation of a 2nd-order Butterworth LC filter at frequency f [dB].
 * |H(f)|² = 1 / (1 + (f/fc)^4)  for Butterworth 2nd order
 * A(f) = −10·log10(1 + (f/fc)^4)
 */
function attenLC(f: number, fc: number): number {
  return -10 * Math.log10(1 + (f / fc) ** 4)
}

/** Calculate RC output low-pass filter. */
function calcRC(input: OutputLPFInput): Result<OutputLPFResult> {
  const { fc, R, C, fVCO_max } = input

  if (fc <= 0) return { ok: false, error: 'fc must be > 0' }
  if (fVCO_max <= 0) return { ok: false, error: 'fVCO_max must be > 0' }

  let r: number
  let c: number

  if (R !== undefined && R > 0 && (C === undefined || C === 0)) {
    // Solve for C
    r = R
    c = 1 / (TWO_PI * r * fc)
  } else if (C !== undefined && C > 0 && (R === undefined || R === 0)) {
    // Solve for R
    c = C
    r = 1 / (TWO_PI * c * fc)
  } else if (
    R !== undefined &&
    R > 0 &&
    C !== undefined &&
    C > 0
  ) {
    // Both provided — compute actual fc from given values
    r = R
    c = C
  } else {
    return {
      ok: false,
      error:
        'Provide either R (to solve for C) or C (to solve for R), or both to compute actual fc',
    }
  }

  const fc_actual = 1 / (TWO_PI * r * c)

  return {
    ok: true,
    value: {
      mode: 'rc',
      fc_actual,
      R: r,
      C: c,
      atten2x: attenRC(2 * fVCO_max, fc_actual),
      atten3x: attenRC(3 * fVCO_max, fc_actual),
    },
  }
}

/** Calculate LC Butterworth 2nd-order output low-pass filter. */
function calcLC(input: OutputLPFInput): Result<OutputLPFResult> {
  const { fc, Z0, fVCO_max } = input

  if (fc <= 0) return { ok: false, error: 'fc must be > 0' }
  if (Z0 <= 0) return { ok: false, error: 'Z0 must be > 0' }
  if (fVCO_max <= 0) return { ok: false, error: 'fVCO_max must be > 0' }

  // LC Butterworth 2nd order: L = Z0/(2π·fc),  C = 1/(Z0·2π·fc)
  const L = Z0 / (TWO_PI * fc)
  const C = 1 / (Z0 * TWO_PI * fc)
  const fc_actual = 1 / (TWO_PI * Math.sqrt(L * C))

  return {
    ok: true,
    value: {
      mode: 'lc',
      fc_actual,
      L,
      C,
      atten2x: attenLC(2 * fVCO_max, fc_actual),
      atten3x: attenLC(3 * fVCO_max, fc_actual),
    },
  }
}

/** Dispatch to RC or LC calculator based on mode. */
export function calculateOutputLPF(
  input: OutputLPFInput,
): Result<OutputLPFResult> {
  if (input.mode === 'rc') return calcRC(input)
  if (input.mode === 'lc') return calcLC(input)
  return { ok: false, error: `Unknown mode: ${String(input.mode)}` }
}
