// ---------------------------------------------------------------------------
// Shared types for LM7001 filter calculators
// All internal values use SI units: Hz, rad/s, A, V, Ω, F, H
// ---------------------------------------------------------------------------

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

// Reference frequency options from the LM7001 datasheet
export type RefFrequency = 1000 | 5000 | 9000 | 10000 | 25000 | 50000 | 100000

// ---------------------------------------------------------------------------
// Calculator A — PLL Loop Filter
// ---------------------------------------------------------------------------

export interface LoopFilterInput {
  /** FM RF center frequency [Hz] */
  fRF: number
  /** FM IF frequency [Hz], typically 10.7 MHz */
  fIF: number
  /** Reference frequency [Hz], selected from datasheet values */
  fref: RefFrequency
  /** Charge pump current [A] */
  Icp: number
  /** VCO gain [Hz/V] */
  Kvco: number
  /** Desired loop bandwidth [Hz] */
  fc: number
  /** Desired phase margin [degrees] */
  phiM: number
}

export interface LoopFilterResult {
  /** VCO frequency = fRF + fIF [Hz] */
  fVCO: number
  /** Division ratio N = fVCO / fref (integer) */
  N: number
  /** Geometric mean factor m = tan(phiM) + sqrt(tan²(phiM)+1) */
  m: number
  /** Zero frequency ωz / 2π [Hz] */
  fz: number
  /** Pole frequency ωp / 2π [Hz] */
  fp: number
  /** Series resistor R [Ω] */
  R: number
  /** Dominant capacitor C1 [F] */
  C1: number
  /** Feed-forward capacitor C2 [F] */
  C2: number
  /** Actual phase margin [degrees] computed from placed zero/pole */
  phiM_actual: number
  /** Actual loop bandwidth [Hz] — equals requested fc */
  fc_actual: number
  /** True if fc > fref/10 (instability warning) */
  stabilityWarning: boolean
}

// ---------------------------------------------------------------------------
// Calculator C — Active Filter (transistor emitter follower)
// ---------------------------------------------------------------------------

export type TransistorType = 'NPN' | 'PNP'

export interface TransistorPreset {
  name: string
  type: TransistorType
  hFE_min: number
  hFE_typ: number
  Vbe: number
  description: string
}

export interface ActiveFilterInput extends LoopFilterInput {
  hFE: number
  Vcc: number
  Ic_q: number          // [A]
  transistorType: TransistorType
}

export interface ActiveFilterResult extends LoopFilterResult {
  hFE: number
  Vcc: number
  Vbe: number
  Ic_q: number
  Ib: number
  Rc: number
  Rb: number
  Vtune_q: number
  Z_out: number
  Z_out_passive: number
}

// ---------------------------------------------------------------------------
// Calculator B — Output Low-Pass Filter
// ---------------------------------------------------------------------------

export type LPFMode = 'rc' | 'lc'

export interface OutputLPFInput {
  mode: LPFMode
  /** Target cutoff frequency [Hz] */
  fc: number
  /** Source/load impedance [Ω], used in LC mode */
  Z0: number
  /** For RC mode: fixed resistor value [Ω]; 0 means "solve for R" */
  R?: number
  /** For RC mode: fixed capacitor value [F]; 0 means "solve for C" */
  C?: number
  /** VCO max frequency [Hz] for attenuation calculations */
  fVCO_max: number
}

export interface OutputLPFResult {
  mode: LPFMode
  /** Actual −3 dB cutoff frequency [Hz] */
  fc_actual: number
  /** Resistor value [Ω] (RC mode) */
  R?: number
  /** Capacitor value [F] */
  C?: number
  /** Inductor value [H] (LC mode) */
  L?: number
  /** Attenuation at 2× fVCO_max [dB] */
  atten2x: number
  /** Attenuation at 3× fVCO_max [dB] */
  atten3x: number
}
