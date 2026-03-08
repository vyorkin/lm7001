import { formatSI } from '../lib/units'

export interface ResultRow {
  label: string
  symbol: string
  value: number
  unit: string
  /** How many decimal places to show in formatSI */
  digits?: number
  /** Highlight this row */
  highlight?: boolean
  /** Show raw number instead of SI prefix */
  raw?: boolean
  rawFormat?: (v: number) => string
}

interface Props {
  title: string
  rows: ResultRow[]
  warning?: string
  note?: string
}

export default function ResultsPanel({ title, rows, warning, note }: Props) {
  return (
    <div className="relative bg-bg-panel border border-accent-border rounded-sm panel-glow scanlines overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-accent-border/40 bg-accent-glow/50">
        <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase">
          {title}
        </span>
        <span className="font-mono text-xs text-text-dim">РАСЧЁТ</span>
      </div>

      {/* Warning banner */}
      {warning && (
        <div className="px-4 py-2 border-b border-warn/40 bg-warn/5 warn-pulse flex items-center gap-2">
          <span className="font-mono text-xs text-warn">⚠</span>
          <span className="font-display text-xs text-warn tracking-wide">{warning}</span>
        </div>
      )}

      {/* Result rows */}
      <div className="divide-y divide-accent-border/10">
        {rows.map((row) => (
          <ResultRowItem key={row.symbol} row={row} />
        ))}
      </div>

      {/* Note */}
      {note && (
        <div className="px-4 py-2 border-t border-accent-border/20 bg-bg-raised/30">
          <span className="font-mono text-xs text-text-dim">{note}</span>
        </div>
      )}
    </div>
  )
}

function ResultRowItem({ row }: { row: ResultRow }) {
  const displayValue = row.rawFormat
    ? row.rawFormat(row.value)
    : row.raw
      ? `${row.value.toFixed(row.digits ?? 1)} ${row.unit}`
      : formatSI(row.value, row.unit, row.digits ?? 2)

  return (
    <div
      className={[
        'flex items-center justify-between px-4 py-2.5 group',
        'hover:bg-accent-glow/30 transition-colors duration-100',
        row.highlight ? 'bg-accent-glow/20' : '',
      ].join(' ')}
    >
      {/* Label + symbol */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-mono text-xs text-accent/70 w-6 shrink-0">{row.symbol}</span>
        <span className="font-display text-sm text-text-secondary group-hover:text-text-primary transition-colors truncate">
          {row.label}
        </span>
      </div>

      {/* Value */}
      <span
        className={[
          'font-mono text-sm value-pulse shrink-0 ml-4',
          row.highlight ? 'text-accent glow-sm text-base' : 'text-accent/80',
        ].join(' ')}
      >
        {displayValue}
      </span>
    </div>
  )
}
