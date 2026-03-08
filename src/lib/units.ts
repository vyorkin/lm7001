// ---------------------------------------------------------------------------
// SI unit conversion helpers
// All internal calculations use SI base units.
// These helpers convert at I/O boundaries only.
// ---------------------------------------------------------------------------

export const TWO_PI = 2 * Math.PI

/** Hz → rad/s */
export const hzToRad = (hz: number): number => TWO_PI * hz

/** rad/s → Hz */
export const radToHz = (rad: number): number => rad / TWO_PI

/** MHz → Hz */
export const mhzToHz = (mhz: number): number => mhz * 1e6

/** Hz → MHz */
export const hzToMhz = (hz: number): number => hz / 1e6

/** kHz → Hz */
export const khzToHz = (khz: number): number => khz * 1e3

/** Hz → kHz */
export const hzToKhz = (hz: number): number => hz / 1e3

/** mA → A */
export const mAtoA = (ma: number): number => ma * 1e-3

/** A → mA */
export const aToMA = (a: number): number => a * 1e3

/** nF → F */
export const nFtoF = (nf: number): number => nf * 1e-9

/** F → nF */
export const fToNF = (f: number): number => f * 1e9

/** pF → F */
export const pFtoF = (pf: number): number => pf * 1e-12

/** F → pF */
export const fToPF = (f: number): number => f * 1e12

/** nH → H */
export const nHtoH = (nh: number): number => nh * 1e-9

/** H → nH */
export const hToNH = (h: number): number => h * 1e9

/** kΩ → Ω */
export const kOhmToOhm = (k: number): number => k * 1e3

/** Ω → kΩ */
export const ohmToKOhm = (ohm: number): number => ohm / 1e3

/**
 * Format a value with appropriate SI prefix.
 * Returns e.g. "47.2 nF", "1.5 kΩ", "53.1 nH"
 */
export function formatSI(
  value: number,
  unit: string,
  fractionDigits = 2,
): string {
  const abs = Math.abs(value)
  if (abs === 0) return `0 ${unit}`

  const prefixes: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'μ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
    [1e-15, 'f'],
  ]

  for (const [scale, prefix] of prefixes) {
    if (abs >= scale) {
      return `${(value / scale).toFixed(fractionDigits)} ${prefix}${unit}`
    }
  }

  return `${value.toExponential(fractionDigits)} ${unit}`
}
