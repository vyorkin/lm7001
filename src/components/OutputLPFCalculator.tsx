import { useState, useMemo, useId } from 'react'
import { calculateOutputLPF } from '../lib/outputLpf'
import { mhzToHz, TWO_PI } from '../lib/units'
import ResultsPanel, { type ResultRow } from './ResultsPanel'
import FrequencyPlot from './FrequencyPlot'
import type { LPFMode, OutputLPFInput } from '../types'

export default function OutputLPFCalculator() {
  const id = useId()
  const [mode, setMode] = useState<LPFMode>('lc')
  const [fc_mhz, setFc] = useState(150)
  const [Z0, setZ0] = useState(50)
  const [fVCO_max_mhz, setFVCOMax] = useState(120)
  // RC mode specifics
  const [rcSolveFor, setRcSolveFor] = useState<'C' | 'R'>('C')
  const [rcR_ohm, setRcR] = useState(100)
  const [rcC_pf, setRcC] = useState(10)

  const input: OutputLPFInput = useMemo(() => {
    const base = {
      mode,
      fc: mhzToHz(fc_mhz),
      Z0,
      fVCO_max: mhzToHz(fVCO_max_mhz),
    }
    if (mode === 'rc') {
      return {
        ...base,
        R: rcSolveFor === 'C' ? rcR_ohm : 0,
        C: rcSolveFor === 'R' ? rcC_pf * 1e-12 : 0,
      }
    }
    return base
  }, [mode, fc_mhz, Z0, fVCO_max_mhz, rcSolveFor, rcR_ohm, rcC_pf])

  const result = useMemo(() => calculateOutputLPF(input), [input])

  // Generate attenuation curve data
  const plotData = useMemo(() => {
    if (!result.ok) return []
    const { fc_actual, mode: m, L, C, R } = result.value
    const fMin = fc_actual / 20
    const fMax = mhzToHz(fVCO_max_mhz) * 4
    const points: { logF: number; freq: number; mag: number }[] = []

    for (let i = 0; i <= 300; i++) {
      const logF = Math.log10(fMin) + (i / 300) * (Math.log10(fMax) - Math.log10(fMin))
      const freq = Math.pow(10, logF)
      let mag_db: number

      if (m === 'rc' && R !== undefined && C !== undefined) {
        const fc = 1 / (TWO_PI * R * C)
        mag_db = -20 * Math.log10(Math.sqrt(1 + (freq / fc) ** 2))
      } else if (m === 'lc' && L !== undefined && C !== undefined) {
        // Butterworth 2nd order |H|² = 1 / (1 + (f/fc)^4)
        mag_db = -10 * Math.log10(1 + (freq / fc_actual) ** 4)
      } else {
        continue
      }

      if (mag_db < -60) continue
      points.push({ logF, freq, mag: mag_db })
    }
    return points
  }, [result.ok ? result.value.fc_actual : 0, result.ok ? result.value.mode : ''])

  const plotRefs = useMemo(() => {
    const refs = []
    if (result.ok) {
      refs.push({
        logF: Math.log10(result.value.fc_actual),
        label: 'fc',
        color: '#ffaa00',
      })
    }
    const f2 = mhzToHz(fVCO_max_mhz) * 2
    const f3 = mhzToHz(fVCO_max_mhz) * 3
    refs.push({ logF: Math.log10(f2), label: '2×fmax', color: 'rgba(255,68,102,0.6)' })
    refs.push({ logF: Math.log10(f3), label: '3×fmax', color: 'rgba(255,68,102,0.4)' })
    return refs
  }, [result.ok ? result.value.fc_actual : 0, fVCO_max_mhz])

  const rows: ResultRow[] = useMemo((): ResultRow[] => {
    if (!result.ok) return []
    const v = result.value
    const base: ResultRow[] = [
      {
        label: 'Частота среза (−3 dB)',
        symbol: 'fc',
        value: v.fc_actual,
        unit: 'Hz',
        highlight: true,
      },
    ]
    if (v.R !== undefined)
      base.push({ label: 'Резистор', symbol: 'R', value: v.R, unit: 'Ω', highlight: true })
    if (v.C !== undefined)
      base.push({ label: 'Конденсатор', symbol: 'C', value: v.C, unit: 'F', highlight: true })
    if (v.L !== undefined)
      base.push({ label: 'Катушка индуктивности', symbol: 'L', value: v.L, unit: 'H', highlight: true })
    base.push({
      label: `Затухание на 2×${fVCO_max_mhz} MHz`,
      symbol: 'A2x',
      value: v.atten2x,
      unit: 'dB',
      raw: true,
      rawFormat: (n) => `${n.toFixed(1)} dB`,
    })
    base.push({
      label: `Затухание на 3×${fVCO_max_mhz} MHz`,
      symbol: 'A3x',
      value: v.atten3x,
      unit: 'dB',
      raw: true,
      rawFormat: (n) => `${n.toFixed(1)} dB`,
    })
    return base
  }, [result.ok ? result.value.fc_actual : 0, fVCO_max_mhz])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      {/* ── LEFT: Inputs ── */}
      <div className="flex flex-col gap-4">
        {/* Mode selector */}
        <div className="bg-bg-panel border border-accent-border/30 rounded-sm panel-glow">
          <div className="px-4 py-2 border-b border-accent-border/20">
            <span className="font-display text-xs font-600 text-text-secondary uppercase tracking-[0.2em]">
              Тип фильтра
            </span>
          </div>
          <div className="p-4 flex gap-3">
            <ModeButton
              active={mode === 'lc'}
              onClick={() => setMode('lc')}
              title="LC Баттерворт"
              sub="2-й порядок · −40 dB/дек"
            />
            <ModeButton
              active={mode === 'rc'}
              onClick={() => setMode('rc')}
              title="RC"
              sub="1-й порядок · −20 dB/дек"
            />
          </div>
        </div>

        {/* Common parameters */}
        <div className="bg-bg-panel border border-accent-border/30 rounded-sm panel-glow corner-bracket">
          <div className="flex items-center justify-between px-4 py-2 border-b border-accent-border/20">
            <span className="font-display text-xs font-600 text-text-secondary uppercase tracking-[0.2em]">
              Параметры
            </span>
            <span className="font-mono text-xs px-1.5 py-0.5 border border-accent-border rounded-sm text-accent/60 bg-accent-glow/50">
              {mode === 'lc' ? 'LC' : 'RC'}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <FieldRow id={`${id}-fc`} label="Целевая частота среза fc" unit="MHz">
              <input
                id={`${id}-fc`}
                className="field"
                type="number"
                step="1"
                min="1"
                value={fc_mhz}
                onChange={(e) => setFc(parseFloat(e.target.value) || 0)}
              />
            </FieldRow>

            {mode === 'lc' && (
              <FieldRow id={`${id}-z0`} label="Волновое сопротивление Z₀" unit="Ω">
                <input
                  id={`${id}-z0`}
                  className="field"
                  type="number"
                  step="1"
                  min="1"
                  value={Z0}
                  onChange={(e) => setZ0(parseFloat(e.target.value) || 0)}
                />
              </FieldRow>
            )}

            {mode === 'rc' && (
              <>
                {/* Solve-for toggle */}
                <div>
                  <div className="font-display text-xs text-text-secondary mb-2">Вычислить</div>
                  <div className="flex gap-2">
                    {(['C', 'R'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setRcSolveFor(s)}
                        className={[
                          'flex-1 py-1 font-mono text-sm border rounded-sm transition-all',
                          rcSolveFor === s
                            ? 'border-accent text-accent bg-accent-glow'
                            : 'border-accent-border text-text-dim hover:border-accent/40',
                        ].join(' ')}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {rcSolveFor === 'C' ? (
                  <FieldRow id={`${id}-r`} label="Резистор R" unit="Ω">
                    <input
                      id={`${id}-r`}
                      className="field"
                      type="number"
                      step="10"
                      min="1"
                      value={rcR_ohm}
                      onChange={(e) => setRcR(parseFloat(e.target.value) || 0)}
                    />
                  </FieldRow>
                ) : (
                  <FieldRow id={`${id}-c`} label="Конденсатор C" unit="pF">
                    <input
                      id={`${id}-c`}
                      className="field"
                      type="number"
                      step="1"
                      min="0.1"
                      value={rcC_pf}
                      onChange={(e) => setRcC(parseFloat(e.target.value) || 0)}
                    />
                  </FieldRow>
                )}
              </>
            )}

            <FieldRow id={`${id}-fvco`} label="Макс. частота VCO" unit="MHz">
              <input
                id={`${id}-fvco`}
                className="field"
                type="number"
                step="1"
                min="10"
                value={fVCO_max_mhz}
                onChange={(e) => setFVCOMax(parseFloat(e.target.value) || 0)}
              />
            </FieldRow>
          </div>
        </div>

        {/* Harmonic attenuation targets */}
        <div className="bg-bg-panel border border-accent-border/30 rounded-sm p-4">
          <div className="font-display text-xs text-text-secondary uppercase tracking-wider mb-3">
            Цели по гармоникам
          </div>
          <div className="space-y-2 font-mono text-xs text-text-dim">
            <div className="flex justify-between">
              <span>2-я гармоника</span>
              <span className="text-accent/60">{(fVCO_max_mhz * 2).toFixed(0)} MHz</span>
            </div>
            <div className="flex justify-between">
              <span>3-я гармоника</span>
              <span className="text-accent/60">{(fVCO_max_mhz * 3).toFixed(0)} MHz</span>
            </div>
            <div className="flex justify-between border-t border-accent-border/20 pt-2 mt-2">
              <span>Цель: подавить ≥</span>
              <span className="text-warn">{(fVCO_max_mhz * 2).toFixed(0)} MHz</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Results + Plot ── */}
      <div className="flex flex-col gap-4">
        {!result.ok && (
          <div className="bg-danger/10 border border-danger/30 rounded-sm p-4 font-mono text-sm text-danger">
            <span className="mr-2">✗</span>{result.error}
          </div>
        )}

        {result.ok && (
          <>
            {/* LC topology */}
            {mode === 'lc' && (
              <div className="bg-bg-panel border border-accent-border/30 rounded-sm p-4">
                <div className="font-mono text-xs text-text-dim mb-2 tracking-wider">ТОПОЛОГИЯ — LC Баттерворт 2-й порядок</div>
                <pre className="font-mono text-xs text-accent/50 leading-tight select-none">
{`VCO ──── L ────┬──── Load (Z0)
               │
               C
               │
              GND`}
                </pre>
              </div>
            )}

            {mode === 'rc' && (
              <div className="bg-bg-panel border border-accent-border/30 rounded-sm p-4">
                <div className="font-mono text-xs text-text-dim mb-2 tracking-wider">ТОПОЛОГИЯ — RC 1-й порядок</div>
                <pre className="font-mono text-xs text-accent/50 leading-tight select-none">
{`VCO ──── R ────┬──── Output
               │
               C
               │
              GND`}
                </pre>
              </div>
            )}

            <ResultsPanel title="Рассчитанные значения фильтра" rows={rows} />

            {plotData.length > 0 && (
              <FrequencyPlot
                data={plotData}
                refs={plotRefs}
                title="Затухание от частоты"
                showPhase={false}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ModeButton({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean
  onClick: () => void
  title: string
  sub: string
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 text-left p-3 border rounded-sm transition-all duration-150',
        active
          ? 'border-accent bg-accent-glow shadow-[0_0_12px_rgba(0,255,204,0.1)]'
          : 'border-accent-border bg-bg-raised hover:border-accent/40',
      ].join(' ')}
    >
      <div
        className={[
          'font-mono text-sm font-bold',
          active ? 'text-accent' : 'text-text-secondary',
        ].join(' ')}
      >
        {title}
      </div>
      <div className="font-display text-xs text-text-dim mt-0.5">{sub}</div>
    </button>
  )
}

function FieldRow({
  id,
  label,
  unit,
  children,
}: {
  id: string
  label: string
  unit: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 items-start">
      <div>
        <label htmlFor={id} className="font-display text-sm font-500 text-text-secondary block mb-1">
          {label}
        </label>
        {children}
      </div>
      <div className="font-mono text-xs text-accent/50 self-end pb-1.5 pt-6 whitespace-nowrap">
        {unit}
      </div>
    </div>
  )
}
