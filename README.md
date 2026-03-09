# LM7001 Filter Calculator

[**Live Demo →**](https://lm7001.vercel.app)

A web-based RF engineering tool for designing PLL loop filters and output low-pass filters, targeting LM7001-based superheterodyne receiver circuits.

---

## English

### What it does

**Calculator A — PLL Loop Filter**

Designs a Type 2, 2nd-order passive loop filter for a charge-pump PLL. Given RF/IF frequencies, reference frequency, charge pump current, VCO gain, desired loop bandwidth, and phase margin, it computes:

- VCO frequency and integer division ratio N
- Filter components: C1, R, C2
- Actual phase margin (verified from placed components)
- Zero/pole frequencies fz, fp
- Stability warning when fc > fref/10

**Calculator B — Output LPF**

Designs a post-VCO harmonic rejection filter in two topologies:

- **RC** — 1st-order: given fc, solve for C (given R) or R (given C), or compute actual fc from both
- **LC** — 2nd-order Butterworth: given fc and Z0, computes L and C

Both modes display attenuation at 2× and 3× VCO frequency and render a Bode/attenuation plot.

### Stack

- React 18 + TypeScript (strict)
- Vite
- Tailwind CSS v3
- Recharts

### Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Type-check only:

```bash
npx tsc --noEmit
```

### Project structure

```
src/
  lib/
    loopFilter.ts   — PLL loop filter math (pure functions)
    outputLpf.ts    — Output LPF math (pure functions)
    units.ts        — SI unit conversions, formatSI()
  types/index.ts    — Shared TypeScript interfaces
  components/
    LoopFilterCalculator.tsx  — Calculator A UI
    OutputLPFCalculator.tsx   — Calculator B UI
    ResultsPanel.tsx          — Generic results display
    FrequencyPlot.tsx         — Recharts Bode/attenuation plot
```

### Design verification example (45° phase margin)

| Parameter | Value |
|-----------|-------|
| fRF | 90 MHz |
| fIF | 10.7 MHz |
| fref | 25 kHz |
| N | 4028 |
| fVCO | 100.7 MHz |
| Icp | 1 mA |
| Kvco | 10 MHz/V |
| fc | 2.5 kHz |
| C1 | 10.06 nF |
| R | 15.28 kΩ |
| C2 | 1.73 nF |
| φm actual | 48° |

LC LPF example: fc = 150 MHz, Z0 = 50 Ω → L = 53.05 nH, C = 21.22 pF, attenuation @ 240 MHz = −8.78 dB.

---

## Русский

### Описание

Веб-инструмент для проектирования фильтров ФАПЧ и выходных ФНЧ, ориентированный на супергетеродинные приёмники на базе микросхемы LM7001.

### Что считает

**Калькулятор А — петлевой фильтр ФАПЧ**

Рассчитывает пассивный петлевой фильтр 2-го порядка для ФАПЧ с зарядовой помпой. На входе: частоты RF/IF, опорная частота, ток зарядовой помпы, крутизна ГУН, полоса петли и запас по фазе. На выходе:

- Частота ГУН и целочисленный коэффициент деления N
- Компоненты фильтра: C1, R, C2
- Фактический запас по фазе (проверяется по установленным компонентам)
- Частоты нуля и полюса fz, fp
- Предупреждение о нестабильности при fc > fref/10

**Калькулятор Б — выходной ФНЧ**

Проектирует фильтр подавления гармоник после ГУН в двух топологиях:

- **RC** — 1-й порядок: при известной fc вычисляет C (если задано R) или R (если задано C), либо определяет фактическую fc из обоих значений
- **LC** — фильтр Баттерворта 2-го порядка: по fc и волновому сопротивлению Z0 вычисляет L и C

Оба режима показывают затухание на 2× и 3× частоте ГУН и строят график АЧХ.

### Стек

- React 18 + TypeScript (строгий режим)
- Vite
- Tailwind CSS v3
- Recharts

### Запуск

```bash
npm install
npm run dev
```

Сборка для продакшена:

```bash
npm run build
```

Только проверка типов:

```bash
npx tsc --noEmit
```

### Структура проекта

```
src/
  lib/
    loopFilter.ts   — математика петлевого фильтра (чистые функции)
    outputLpf.ts    — математика выходного ФНЧ (чистые функции)
    units.ts        — конвертация единиц СИ, formatSI()
  types/index.ts    — общие TypeScript-интерфейсы
  components/
    LoopFilterCalculator.tsx  — интерфейс калькулятора А
    OutputLPFCalculator.tsx   — интерфейс калькулятора Б
    ResultsPanel.tsx          — отображение результатов
    FrequencyPlot.tsx         — график Боде/АЧХ (Recharts)
```

### Пример расчёта (запас по фазе 45°)

| Параметр | Значение |
|----------|----------|
| fRF | 90 МГц |
| fIF | 10,7 МГц |
| fref | 25 кГц |
| N | 4028 |
| fVCO | 100,7 МГц |
| Icp | 1 мА |
| Kvco | 10 МГц/В |
| fc | 2,5 кГц |
| C1 | 10,06 нФ |
| R | 15,28 кОм |
| C2 | 1,73 нФ |
| φm факт. | 48° |

Пример LC ФНЧ: fc = 150 МГц, Z0 = 50 Ом → L = 53,05 нГн, C = 21,22 пФ, затухание на 240 МГц = −8,78 дБ.
