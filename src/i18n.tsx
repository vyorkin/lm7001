import { createContext, useContext } from 'react'

export type Lang = 'ru' | 'en'

export interface Translations {
  // App
  filterCalculator: string
  lightTheme: string
  darkTheme: string
  toggleTheme: string
  tabLoop: string
  tabLpf: string
  tabActive: string
  footerDoc: string

  // FrequencyPlot
  gainLabel: string
  phaseLabel: string
  freqAxis: string
  gainTooltip: string
  phaseTooltip: string

  // ResultsPanel
  calcBadge: string

  // LoopFilterCalculator sections
  vcoConfig: string
  pllParams: string
  loopDesign: string

  // LoopFilter fields
  rfFreq: string
  hintRF: string
  ifFreq: string
  hintIF: string
  refFreq: string
  hintRef: string
  chargePumpCurrent: string
  hintIcp: string
  vcoGain: string
  hintKvco: string
  loopBW: string
  hintFc: string
  phaseMarginField: string
  hintPhiM: string

  // LoopFilter topology / results
  topologyPassive: string
  calcTitleLoop: string
  bodeTitle: string
  rowVcoFreq: string
  rowDivN: string
  rowGeomM: string
  rowSeriesR: string
  rowC1: string
  rowC2: string
  rowFz: string
  rowFp: string
  rowPhiMActual: string
  rowFcActual: string
  stabilityWarning: (fc: string, fref10: string) => string

  // OutputLPF
  filterType: string
  lcButterworth: string
  lcSub: string
  rcSub: string
  params: string
  targetFc: string
  impedance: string
  solveFor: string
  resistorR: string
  capacitorC: string
  maxVcoFreq: string
  harmonics: string
  harmonic2: string
  harmonic3: string
  suppressTarget: string
  topologyLabel: string
  calcTitleLpf: string
  attenuationTitle: string
  rowFc3dB: string
  rowR: string
  rowC: string
  rowL: string
  rowAtten2x: (f: number) => string
  rowAtten3x: (f: number) => string

  // ActiveFilter
  transistorSection: string
  transistorModel: string
  transistorTypeLabel: string
  hfeGain: string
  hintHfe: string
  vccVoltage: string
  quiescentCurrent: string
  hintIcq: string
  topologyActive: (type: string) => string
  calcTitleRC: string
  calcTitleTransistor: string
  stabilityWarningActive: (fc: string, fref10: string) => string
  zOutReduction: (ratio: string, type: string, hfe: number) => string
  rowVtune: string
  rowIcQ: string
  rowIb: string
  rowRc: string
  rowRb: string
  rowZpassive: string
  rowZactive: string
  customPreset: string
}

const ru: Translations = {
  filterCalculator: 'Калькулятор фильтра',
  lightTheme: 'Светлая тема',
  darkTheme: 'Тёмная тема',
  toggleTheme: 'Переключить тему',
  tabLoop: 'Петлевой фильтр PLL',
  tabLpf: 'Выходной ФНЧ',
  tabActive: 'Активный фильтр',
  footerDoc: 'LM7001J/JM — Sanyo Semiconductor · Документация EN5262 (фев 1997)',

  gainLabel: 'Усиление [dB]',
  phaseLabel: 'Фаза [°]',
  freqAxis: 'Частота [Hz]',
  gainTooltip: 'Усиление',
  phaseTooltip: 'Фаза',

  calcBadge: 'РАСЧЁТ',

  vcoConfig: 'Конфигурация VCO',
  pllParams: 'Параметры PLL',
  loopDesign: 'Параметры петли',

  rfFreq: 'Частота RF',
  hintRF: '87.5–108 MHz',
  ifFreq: 'Частота ПЧ',
  hintIF: 'стд: 10.7',
  refFreq: 'Опорная частота',
  hintRef: 'регистр чипа',
  chargePumpCurrent: 'Ток зарядного насоса Icp',
  hintIcp: 'измерить на PD1/PD2',
  vcoGain: 'Крутизна VCO Kvco',
  hintKvco: 'измерено',
  loopBW: 'Полоса петли fc',
  hintFc: 'рек.: fref/10',
  phaseMarginField: 'Запас по фазе φm',
  hintPhiM: '30–70°, тип 45°',

  topologyPassive: 'ТОПОЛОГИЯ — ПАССИВНЫЙ RC-ФИЛЬТР',
  calcTitleLoop: 'Рассчитанные значения компонентов',
  bodeTitle: 'График Боде разомкнутой петли  |G(jω)|',
  rowVcoFreq: 'Частота VCO',
  rowDivN: 'Коэффициент деления N',
  rowGeomM: 'Геометрический коэффициент',
  rowSeriesR: 'Последовательный резистор',
  rowC1: 'Основной конденсатор C₁',
  rowC2: 'Опережающий конденсатор C₂',
  rowFz: 'Частота нуля',
  rowFp: 'Частота полюса',
  rowPhiMActual: 'Запас по фазе (факт)',
  rowFcActual: 'Полоса петли (факт)',
  stabilityWarning: (fc, fref10) =>
    `fc = ${fc} kHz > fref/10 = ${fref10} kHz — риск паразитных спектральных составляющих`,

  filterType: 'Тип фильтра',
  lcButterworth: 'LC Баттерворт',
  lcSub: '2-й порядок · −40 dB/дек',
  rcSub: '1-й порядок · −20 dB/дек',
  params: 'Параметры',
  targetFc: 'Целевая частота среза fc',
  impedance: 'Волновое сопротивление Z₀',
  solveFor: 'Вычислить',
  resistorR: 'Резистор R',
  capacitorC: 'Конденсатор C',
  maxVcoFreq: 'Макс. частота VCO',
  harmonics: 'Цели по гармоникам',
  harmonic2: '2-я гармоника',
  harmonic3: '3-я гармоника',
  suppressTarget: 'Цель: подавить ≥',
  topologyLabel: 'ТОПОЛОГИЯ',
  calcTitleLpf: 'Рассчитанные значения фильтра',
  attenuationTitle: 'Затухание от частоты',
  rowFc3dB: 'Частота среза (−3 dB)',
  rowR: 'Резистор',
  rowC: 'Конденсатор',
  rowL: 'Катушка индуктивности',
  rowAtten2x: (f) => `Затухание на 2×${f} MHz`,
  rowAtten3x: (f) => `Затухание на 3×${f} MHz`,

  transistorSection: 'Транзистор',
  transistorModel: 'Модель транзистора',
  transistorTypeLabel: 'Тип',
  hfeGain: 'Усиление тока hFE',
  hintHfe: 'мин.',
  vccVoltage: 'Напряжение питания Vcc',
  quiescentCurrent: 'Ток покоя Ic',
  hintIcq: '0.5–5 мА',
  topologyActive: (type) => `ТОПОЛОГИЯ — ${type} ЭМИТТЕРНЫЙ ПОВТОРИТЕЛЬ`,
  calcTitleRC: 'Компоненты RC-фильтра',
  calcTitleTransistor: 'Параметры транзисторного каскада',
  stabilityWarningActive: (fc, fref10) =>
    `fc = ${fc} kHz > fref/10 = ${fref10} kHz — риск паразитных составляющих`,
  zOutReduction: (ratio, type, hfe) =>
    `Снижение Z_вых: ${ratio}× (${type}, hFE=${hfe})`,
  rowVtune: 'Напряжение настройки VCO',
  rowIcQ: 'Ток коллектора (покой)',
  rowIb: 'Ток базы',
  rowRc: 'Резистор коллектора',
  rowRb: 'Базовый резистор',
  rowZpassive: 'Вых. сопротивление (пасс.)',
  rowZactive: 'Вых. сопротивление (акт.)',
  customPreset: 'Пользовательский',
}

const en: Translations = {
  filterCalculator: 'Filter Calculator',
  lightTheme: 'Light theme',
  darkTheme: 'Dark theme',
  toggleTheme: 'Toggle theme',
  tabLoop: 'PLL Loop Filter',
  tabLpf: 'Output LPF',
  tabActive: 'Active Filter',
  footerDoc: 'LM7001J/JM — Sanyo Semiconductor · Datasheet EN5262 (Feb 1997)',

  gainLabel: 'Gain [dB]',
  phaseLabel: 'Phase [°]',
  freqAxis: 'Frequency [Hz]',
  gainTooltip: 'Gain',
  phaseTooltip: 'Phase',

  calcBadge: 'CALC',

  vcoConfig: 'VCO Configuration',
  pllParams: 'PLL Parameters',
  loopDesign: 'Loop Design',

  rfFreq: 'RF Frequency',
  hintRF: '87.5–108 MHz',
  ifFreq: 'IF Frequency',
  hintIF: 'std: 10.7',
  refFreq: 'Reference Frequency',
  hintRef: 'chip register',
  chargePumpCurrent: 'Charge pump current Icp',
  hintIcp: 'measure at PD1/PD2',
  vcoGain: 'VCO gain Kvco',
  hintKvco: 'measured',
  loopBW: 'Loop bandwidth fc',
  hintFc: 'rec.: fref/10',
  phaseMarginField: 'Phase margin φm',
  hintPhiM: '30–70°, typ 45°',

  topologyPassive: 'TOPOLOGY — PASSIVE RC FILTER',
  calcTitleLoop: 'Calculated component values',
  bodeTitle: 'Open-loop Bode plot  |G(jω)|',
  rowVcoFreq: 'VCO Frequency',
  rowDivN: 'Division ratio N',
  rowGeomM: 'Geometric coefficient',
  rowSeriesR: 'Series resistor',
  rowC1: 'Main capacitor C₁',
  rowC2: 'Lead capacitor C₂',
  rowFz: 'Zero frequency',
  rowFp: 'Pole frequency',
  rowPhiMActual: 'Phase margin (actual)',
  rowFcActual: 'Loop bandwidth (actual)',
  stabilityWarning: (fc, fref10) =>
    `fc = ${fc} kHz > fref/10 = ${fref10} kHz — risk of spurious spectral components`,

  filterType: 'Filter Type',
  lcButterworth: 'LC Butterworth',
  lcSub: '2nd order · −40 dB/dec',
  rcSub: '1st order · −20 dB/dec',
  params: 'Parameters',
  targetFc: 'Target cutoff frequency fc',
  impedance: 'Characteristic impedance Z₀',
  solveFor: 'Solve for',
  resistorR: 'Resistor R',
  capacitorC: 'Capacitor C',
  maxVcoFreq: 'Max VCO frequency',
  harmonics: 'Harmonic targets',
  harmonic2: '2nd harmonic',
  harmonic3: '3rd harmonic',
  suppressTarget: 'Target: suppress ≥',
  topologyLabel: 'TOPOLOGY',
  calcTitleLpf: 'Calculated filter values',
  attenuationTitle: 'Attenuation vs frequency',
  rowFc3dB: 'Cutoff frequency (−3 dB)',
  rowR: 'Resistor',
  rowC: 'Capacitor',
  rowL: 'Inductor',
  rowAtten2x: (f) => `Attenuation at 2×${f} MHz`,
  rowAtten3x: (f) => `Attenuation at 3×${f} MHz`,

  transistorSection: 'Transistor',
  transistorModel: 'Transistor model',
  transistorTypeLabel: 'Type',
  hfeGain: 'Current gain hFE',
  hintHfe: 'min.',
  vccVoltage: 'Supply voltage Vcc',
  quiescentCurrent: 'Quiescent current Ic',
  hintIcq: '0.5–5 mA',
  topologyActive: (type) => `TOPOLOGY — ${type} EMITTER FOLLOWER`,
  calcTitleRC: 'RC filter components',
  calcTitleTransistor: 'Transistor stage parameters',
  stabilityWarningActive: (fc, fref10) =>
    `fc = ${fc} kHz > fref/10 = ${fref10} kHz — risk of spurious components`,
  zOutReduction: (ratio, type, hfe) =>
    `Z_out reduction: ${ratio}× (${type}, hFE=${hfe})`,
  rowVtune: 'VCO tuning voltage',
  rowIcQ: 'Collector current (quiescent)',
  rowIb: 'Base current',
  rowRc: 'Collector resistor',
  rowRb: 'Base resistor',
  rowZpassive: 'Output impedance (passive)',
  rowZactive: 'Output impedance (active)',
  customPreset: 'Custom',
}

const dict: Record<Lang, Translations> = { ru, en }

export const LangContext = createContext<Lang>('ru')

export function useLocale(): Translations {
  return dict[useContext(LangContext)]
}
