import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatSI } from '../lib/units'

interface PlotPoint {
  /** log10(frequency) — used as x-axis value */
  logF: number
  /** actual frequency [Hz] — for label display */
  freq: number
  /** magnitude [dB] */
  mag?: number
  /** phase [degrees] */
  phase?: number
}

interface Props {
  data: PlotPoint[]
  /** Vertical reference lines to draw */
  refs?: { logF: number; label: string; color?: string }[]
  title: string
  showPhase?: boolean
  /** x-axis label suffix */
  freqUnit?: string
}

/** Format a frequency for tick labels */
function fmtFreq(hz: number): string {
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)}M`
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)}k`
  return `${hz.toFixed(0)}`
}

const GRID_COLOR = 'rgba(0,255,204,0.06)'
const TICK_COLOR = '#3a5560'
const MAG_COLOR = '#00ffcc'
const PHASE_COLOR = '#0088ff'

export default function FrequencyPlot({
  data,
  refs = [],
  title,
  showPhase = true,
}: Props) {
  const tickValues: number[] = []
  if (data.length > 0) {
    const minLog = Math.floor(data[0]!.logF)
    const maxLog = Math.ceil(data[data.length - 1]!.logF)
    for (let i = minLog; i <= maxLog; i++) {
      tickValues.push(i)
      tickValues.push(i + 0.301) // half-decade (×2)
      tickValues.push(i + 0.699) // (×5)
    }
  }

  return (
    <div className="bg-bg-panel border border-accent-border/50 rounded-sm panel-glow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-accent-border/30 bg-accent-glow/30">
        <span className="font-mono text-xs text-accent/70 tracking-[0.15em] uppercase">
          {title}
        </span>
        <div className="flex items-center gap-4 font-mono text-xs text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-px bg-accent inline-block" />
            Усиление [dB]
          </span>
          {showPhase && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-px bg-blue inline-block" />
              Фаза [°]
            </span>
          )}
        </div>
      </div>

      <div className="p-2" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 40 }}>
            <CartesianGrid
              stroke={GRID_COLOR}
              strokeDasharray="0"
              vertical={true}
              horizontal={true}
            />

            <XAxis
              dataKey="logF"
              type="number"
              domain={['auto', 'auto']}
              ticks={tickValues}
              tickFormatter={(v: number) => fmtFreq(Math.pow(10, v))}
              tick={{ fill: TICK_COLOR, fontSize: 10, fontFamily: 'Share Tech Mono' }}
              axisLine={{ stroke: 'rgba(0,255,204,0.15)' }}
              tickLine={{ stroke: TICK_COLOR }}
              label={{
                value: 'Частота [Hz]',
                position: 'insideBottom',
                offset: -2,
                fill: TICK_COLOR,
                fontSize: 9,
                fontFamily: 'Rajdhani',
              }}
            />

            <YAxis
              yAxisId="mag"
              domain={['auto', 'auto']}
              tick={{ fill: TICK_COLOR, fontSize: 10, fontFamily: 'Share Tech Mono' }}
              axisLine={{ stroke: 'rgba(0,255,204,0.15)' }}
              tickLine={{ stroke: TICK_COLOR }}
              tickFormatter={(v: number) => `${v.toFixed(0)}dB`}
            />

            {showPhase && (
              <YAxis
                yAxisId="phase"
                orientation="right"
                domain={[-180, 180]}
                ticks={[-180, -135, -90, -45, 0, 45, 90, 135, 180]}
                tick={{ fill: TICK_COLOR, fontSize: 10, fontFamily: 'Share Tech Mono' }}
                axisLine={{ stroke: 'rgba(0,136,255,0.15)' }}
                tickLine={{ stroke: TICK_COLOR }}
                tickFormatter={(v: number) => `${v}°`}
              />
            )}

            <Tooltip
              contentStyle={{
                background: '#0c1218',
                border: '1px solid rgba(0,255,204,0.25)',
                borderRadius: '2px',
                fontFamily: 'Share Tech Mono',
                fontSize: '11px',
                color: '#00ffcc',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'mag') return [`${value.toFixed(1)} dB`, 'Усиление']
                if (name === 'phase') return [`${value.toFixed(1)}°`, 'Фаза']
                return [value, name]
              }}
              labelFormatter={(logF: number) =>
                `f = ${formatSI(Math.pow(10, logF), 'Hz', 2)}`
              }
              cursor={{ stroke: 'rgba(0,255,204,0.3)', strokeWidth: 1 }}
            />

            {/* Reference lines */}
            {refs.map((r) => (
              <ReferenceLine
                key={r.label}
                x={r.logF}
                yAxisId="mag"
                stroke={r.color ?? 'rgba(255,170,0,0.5)'}
                strokeDasharray="4 3"
                label={{
                  value: r.label,
                  position: 'top',
                  fill: r.color ?? '#ffaa00',
                  fontSize: 9,
                  fontFamily: 'Share Tech Mono',
                }}
              />
            ))}

            {/* 0 dB line */}
            <ReferenceLine
              yAxisId="mag"
              y={0}
              stroke="rgba(0,255,204,0.2)"
              strokeDasharray="6 4"
            />

            <Line
              yAxisId="mag"
              type="monotone"
              dataKey="mag"
              stroke={MAG_COLOR}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />

            {showPhase && (
              <Line
                yAxisId="phase"
                type="monotone"
                dataKey="phase"
                stroke={PHASE_COLOR}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            <Legend wrapperStyle={{ display: 'none' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
