import { useState, useEffect } from 'react'
import LoopFilterCalculator from './components/LoopFilterCalculator'
import OutputLPFCalculator from './components/OutputLPFCalculator'
import ActiveFilterCalculator from './components/ActiveFilterCalculator'

type Tab = 'loop' | 'lpf' | 'active'
type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export default function App() {
  const [tab, setTab] = useState<Tab>('loop')
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') {
      html.classList.add('light')
    } else {
      html.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="relative border-b border-accent-border bg-bg-panel/80 backdrop-blur-sm">
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Chip ID */}
          <div className="flex items-baseline gap-3 flex-1">
            <span className="font-mono text-3xl font-bold text-accent glow tracking-widest select-none">
              LM7001
            </span>
            <span className="font-display text-sm font-600 text-text-secondary uppercase tracking-[0.25em]">
              Калькулятор фильтра
            </span>
          </div>

          {/* Chip spec badges + theme toggle */}
          <div className="flex flex-wrap items-center gap-2 text-text-dim font-mono text-xs">
            {['SANYO · EN5262', 'DIP16 · MFP20', 'FM 45–130 MHz'].map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 border border-accent-border rounded-sm bg-accent-glow"
              >
                {s}
              </span>
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              className="ml-1 p-1.5 rounded-sm border border-accent-border bg-accent-glow hover:bg-accent/10 transition-colors duration-150"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? (
                <SunIcon />
              ) : (
                <MoonIcon />
              )}
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="max-w-7xl mx-auto px-6 flex gap-0 border-t border-accent-border/40 mt-0">
          <TabButton active={tab === 'loop'} onClick={() => setTab('loop')}>
            <span className="mr-2 opacity-50">①</span>
            Петлевой фильтр PLL
          </TabButton>
          <TabButton active={tab === 'lpf'} onClick={() => setTab('lpf')}>
            <span className="mr-2 opacity-50">②</span>
            Выходной ФНЧ
          </TabButton>
          <TabButton active={tab === 'active'} onClick={() => setTab('active')}>
            <span className="mr-2 opacity-50">③</span>
            Активный фильтр
          </TabButton>

          {/* flex spacer */}
          <div className="flex-1 border-b border-accent-border/30" />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {tab === 'loop' && (
          <div className="tab-content">
            <LoopFilterCalculator />
          </div>
        )}
        {tab === 'lpf' && (
          <div className="tab-content">
            <OutputLPFCalculator />
          </div>
        )}
        {tab === 'active' && (
          <div className="tab-content">
            <ActiveFilterCalculator />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-accent-border/20 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-mono text-xs text-text-dim">
          <span>LM7001J/JM — Sanyo Semiconductor · Документация EN5262 (фев 1997)</span>
          <span>VCO: 87–120 MHz · fref: 1–100 kHz</span>
        </div>
      </footer>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-5 py-2.5 font-display font-600 text-sm uppercase tracking-wider',
        'border-b-2 transition-all duration-150 select-none whitespace-nowrap',
        active
          ? 'border-accent text-accent glow-sm bg-accent-glow'
          : 'border-transparent text-text-secondary hover:text-text-primary hover:border-accent-border',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
