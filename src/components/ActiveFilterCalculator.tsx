import { useState, useMemo, useId } from "react";
import { calculateActiveFilter, TRANSISTOR_PRESETS } from "../lib/activeFilter";
import { hzToRad, mAtoA, khzToHz, mhzToHz } from "../lib/units";
import ResultsPanel, { type ResultRow } from "./ResultsPanel";
import FrequencyPlot from "./FrequencyPlot";
import type { ActiveFilterInput, RefFrequency, TransistorType } from "../types";

const REF_FREQS: RefFrequency[] = [
  1000, 5000, 9000, 10000, 25000, 50000, 100000,
];

const CUSTOM_PRESET_NAME = "Пользовательский";

const DEFAULT_PRESET = TRANSISTOR_PRESETS.find((p) => p.name === "BC547B")!;

const DEFAULT_INPUT = {
  fRF_mhz: 90.0,
  fIF_mhz: 10.7,
  fref: 25000 as RefFrequency,
  Icp_ma: 1.0,
  Kvco_mhz_v: 10.0,
  fc_khz: 2.5,
  phiM: 45,
  presetName: DEFAULT_PRESET.name,
  transistorType: DEFAULT_PRESET.type,
  hFE: DEFAULT_PRESET.hFE_min,
  Vcc: 9,
  Ic_q_ma: 1.0,
};

export default function ActiveFilterCalculator() {
  const [fRF_mhz, setFRF] = useState(DEFAULT_INPUT.fRF_mhz);
  const [fIF_mhz, setFIF] = useState(DEFAULT_INPUT.fIF_mhz);
  const [fref, setFref] = useState<RefFrequency>(DEFAULT_INPUT.fref);
  const [Icp_ma, setIcp] = useState(DEFAULT_INPUT.Icp_ma);
  const [Kvco_mhz_v, setKvco] = useState(DEFAULT_INPUT.Kvco_mhz_v);
  const [fc_khz, setFc] = useState(DEFAULT_INPUT.fc_khz);
  const [phiM, setPhiM] = useState(DEFAULT_INPUT.phiM);

  const [presetName, setPresetName] = useState(DEFAULT_INPUT.presetName);
  const [transistorType, setTransistorType] = useState<TransistorType>(
    DEFAULT_INPUT.transistorType,
  );
  const [hFE, setHFE] = useState(DEFAULT_INPUT.hFE);
  const [Vcc, setVcc] = useState(DEFAULT_INPUT.Vcc);
  const [Ic_q_ma, setIcq] = useState(DEFAULT_INPUT.Ic_q_ma);

  const id = useId();

  function applyPreset(name: string) {
    setPresetName(name);
    const preset = TRANSISTOR_PRESETS.find((p) => p.name === name);
    if (preset && name !== CUSTOM_PRESET_NAME) {
      setTransistorType(preset.type);
      setHFE(preset.hFE_min);
    }
  }

  const input: ActiveFilterInput = {
    fRF: mhzToHz(fRF_mhz),
    fIF: mhzToHz(fIF_mhz),
    fref,
    Icp: mAtoA(Icp_ma),
    Kvco: mhzToHz(Kvco_mhz_v),
    fc: khzToHz(fc_khz),
    phiM,
    hFE,
    Vcc,
    Ic_q: mAtoA(Ic_q_ma),
    transistorType,
  };

  const result = useMemo(
    () => calculateActiveFilter(input),
    [
      input.fRF,
      input.fIF,
      input.fref,
      input.Icp,
      input.Kvco,
      input.fc,
      input.phiM,
      input.hFE,
      input.Vcc,
      input.Ic_q,
      input.transistorType,
    ],
  );

  // Bode plot data (same as passive loop filter)
  const plotData = useMemo(() => {
    if (!result.ok) return [];
    const { R, C1, C2, N } = result.value;
    const Kvco_rad = hzToRad(input.Kvco);
    const Icp = input.Icp;
    const fMin = Math.max(1, input.fc / 100);
    const fMax = input.fref * 5;
    const points: { logF: number; freq: number; mag: number; phase: number }[] =
      [];

    for (let i = 0; i <= 300; i++) {
      const logF =
        Math.log10(fMin) + (i / 300) * (Math.log10(fMax) - Math.log10(fMin));
      const freq = Math.pow(10, logF);
      const w = 2 * Math.PI * freq;

      const Ctot = C1 + C2;
      const tau1 = R * C1;
      const tau2 = (R * C1 * C2) / Ctot;

      const numRe = 1;
      const numIm = w * tau1;
      const numMag = Math.sqrt(numRe * numRe + numIm * numIm);
      const numPhase = Math.atan2(numIm, numRe);

      const den1Mag = w * Ctot;
      const den1Phase = Math.PI / 2;
      const den2Re = 1;
      const den2Im = w * tau2;
      const den2Mag = Math.sqrt(den2Re * den2Re + den2Im * den2Im);
      const den2Phase = Math.atan2(den2Im, den2Re);

      const F_mag = numMag / (den1Mag * den2Mag);
      const F_phase = numPhase - den1Phase - den2Phase;

      const gain_factor = (Icp / (2 * Math.PI)) * (Kvco_rad / N);
      const G_mag = (gain_factor * F_mag) / w;
      const G_phase = F_phase - Math.PI / 2;

      const mag_db = 20 * Math.log10(G_mag);
      const phase_deg = (G_phase * 180) / Math.PI;

      if (mag_db < -80 || mag_db > 80) continue;
      points.push({ logF, freq, mag: mag_db, phase: phase_deg });
    }
    return points;
  }, [result.ok ? result.value.R : 0, result.ok ? result.value.C1 : 0]);

  const plotRefs = useMemo(() => {
    if (!result.ok) return [];
    return [
      {
        logF: Math.log10(result.value.fc_actual),
        label: "fc",
        color: "#ffaa00",
      },
      {
        logF: Math.log10(result.value.fz),
        label: "fz",
        color: "rgba(0,136,255,0.7)",
      },
      {
        logF: Math.log10(result.value.fp),
        label: "fp",
        color: "rgba(0,136,255,0.7)",
      },
    ];
  }, [result.ok ? result.value.fc_actual : 0]);

  const pllRows: ResultRow[] = result.ok
    ? [
        {
          label: "Частота VCO",
          symbol: "fvco",
          value: result.value.fVCO,
          unit: "Hz",
          highlight: true,
        },
        {
          label: "Коэффициент деления N",
          symbol: "N",
          value: result.value.N,
          unit: "",
          raw: true,
          rawFormat: (v) => v.toFixed(0),
          highlight: true,
        },
        {
          label: "Геометрический коэффициент",
          symbol: "m",
          value: result.value.m,
          unit: "",
          raw: true,
          rawFormat: (v) => v.toFixed(4),
        },
        {
          label: "Последовательный резистор",
          symbol: "R",
          value: result.value.R,
          unit: "Ω",
          digits: 2,
          highlight: true,
        },
        {
          label: "Основной конденсатор C₁",
          symbol: "C1",
          value: result.value.C1,
          unit: "F",
          digits: 2,
          highlight: true,
        },
        {
          label: "Опережающий конденсатор C₂",
          symbol: "C2",
          value: result.value.C2,
          unit: "F",
          digits: 2,
          highlight: true,
        },
        {
          label: "Частота нуля",
          symbol: "fz",
          value: result.value.fz,
          unit: "Hz",
        },
        {
          label: "Частота полюса",
          symbol: "fp",
          value: result.value.fp,
          unit: "Hz",
        },
        {
          label: "Запас по фазе (факт)",
          symbol: "φm",
          value: result.value.phiM_actual,
          unit: "°",
          raw: true,
          rawFormat: (v) => `${v.toFixed(2)}°`,
        },
      ]
    : [];

  const transistorRows: ResultRow[] = result.ok
    ? [
        {
          label: "Напряжение настройки VCO",
          symbol: "Vt",
          value: result.value.Vtune_q,
          unit: "V",
          raw: true,
          rawFormat: (v) => `${v.toFixed(3)} В`,
          highlight: true,
        },
        {
          label: "Ток коллектора (покой)",
          symbol: "Ic",
          value: result.value.Ic_q,
          unit: "A",
          digits: 2,
        },
        {
          label: "Ток базы",
          symbol: "Ib",
          value: result.value.Ib,
          unit: "A",
          digits: 2,
        },
        {
          label: "Резистор коллектора",
          symbol: "Rc",
          value: result.value.Rc,
          unit: "Ω",
          digits: 2,
          highlight: true,
        },
        {
          label: "Базовый резистор",
          symbol: "Rb",
          value: result.value.Rb,
          unit: "Ω",
          digits: 2,
          highlight: true,
        },
        {
          label: "Вых. сопротивление (пасс.)",
          symbol: "Zp",
          value: result.value.Z_out_passive,
          unit: "Ω",
          digits: 2,
        },
        {
          label: "Вых. сопротивление (акт.)",
          symbol: "Za",
          value: result.value.Z_out,
          unit: "Ω",
          digits: 2,
          highlight: true,
        },
      ]
    : [];

  const isNPN = transistorType === "NPN";
  const selectedPreset = TRANSISTOR_PRESETS.find((p) => p.name === presetName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      {/* ── LEFT: Inputs ── */}
      <div className="flex flex-col gap-4">
        {/* VCO Configuration */}
        <Section title="Конфигурация VCO" badge="RF">
          <Field
            id={`${id}-frf`}
            label="Частота RF"
            unit="MHz"
            hint="87.5–108 MHz"
          >
            <input
              id={`${id}-frf`}
              className="field"
              type="number"
              step="0.1"
              min="45"
              max="130"
              value={fRF_mhz}
              onChange={(e) => setFRF(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field
            id={`${id}-fif`}
            label="Частота ПЧ"
            unit="MHz"
            hint="стд: 10.7"
          >
            <input
              id={`${id}-fif`}
              className="field"
              type="number"
              step="0.1"
              min="0"
              value={fIF_mhz}
              onChange={(e) => setFIF(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field
            id={`${id}-fref`}
            label="Опорная частота"
            unit="kHz"
            hint="регистр чипа"
          >
            <select
              id={`${id}-fref`}
              className="field field-select"
              value={fref}
              onChange={(e) =>
                setFref(parseInt(e.target.value) as RefFrequency)
              }
            >
              {REF_FREQS.map((f) => (
                <option key={f} value={f}>
                  {f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        {/* PLL Parameters */}
        <Section title="Параметры PLL" badge="CHIP">
          <Field
            id={`${id}-icp`}
            label="Ток зарядного насоса Icp"
            unit="mA"
            hint="PD1/PD2"
          >
            <input
              id={`${id}-icp`}
              className="field"
              type="number"
              step="0.1"
              min="0.01"
              max="5"
              value={Icp_ma}
              onChange={(e) => setIcp(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field
            id={`${id}-kvco`}
            label="Крутизна VCO Kvco"
            unit="MHz/V"
            hint="измерено"
          >
            <input
              id={`${id}-kvco`}
              className="field"
              type="number"
              step="0.5"
              min="0.1"
              value={Kvco_mhz_v}
              onChange={(e) => setKvco(parseFloat(e.target.value) || 0)}
            />
          </Field>
        </Section>

        {/* Loop Design */}
        <Section title="Параметры петли" badge="DESIGN">
          <Field
            id={`${id}-fc`}
            label="Полоса петли fc"
            unit="kHz"
            hint="рек.: fref/10"
          >
            <input
              id={`${id}-fc`}
              className="field"
              type="number"
              step="0.1"
              min="0.01"
              value={fc_khz}
              onChange={(e) => setFc(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field
            id={`${id}-phim`}
            label="Запас по фазе φm"
            unit="°"
            hint="30–70°, тип 45°"
          >
            <input
              id={`${id}-phim`}
              className="field"
              type="number"
              step="1"
              min="10"
              max="85"
              value={phiM}
              onChange={(e) => setPhiM(parseFloat(e.target.value) || 0)}
            />
          </Field>
          <div className="mt-1">
            <input
              type="range"
              min="30"
              max="70"
              step="1"
              value={phiM}
              onChange={(e) => setPhiM(parseInt(e.target.value))}
              className="w-full h-1 rounded appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00ffcc ${((phiM - 30) / 40) * 100}%, rgba(0,255,204,0.15) 0%)`,
                accentColor: "#00ffcc",
              }}
            />
            <div className="flex justify-between font-mono text-xs text-text-dim mt-0.5">
              <span>30°</span>
              <span>45°</span>
              <span>70°</span>
            </div>
          </div>
        </Section>

        {/* Transistor */}
        <Section title="Транзистор" badge="BJT">
          {/* Preset selector */}
          <Field id={`${id}-preset`} label="Модель транзистора" unit="">
            <select
              id={`${id}-preset`}
              className="field field-select"
              value={presetName}
              onChange={(e) => applyPreset(e.target.value)}
            >
              {TRANSISTOR_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                  {p.name !== CUSTOM_PRESET_NAME
                    ? ` (${p.type}, hFE≥${p.hFE_min})`
                    : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* Description badge */}
          {selectedPreset && selectedPreset.name !== CUSTOM_PRESET_NAME && (
            <div className="font-mono text-xs text-text-dim bg-accent-glow/30 border border-accent-border/20 rounded-sm px-2 py-1">
              {selectedPreset.description} · hFE typ: {selectedPreset.hFE_typ}
            </div>
          )}

          {/* NPN / PNP toggle */}
          <div>
            <div className="font-display text-sm font-500 text-text-secondary mb-1">
              Тип
            </div>
            <div className="flex gap-2">
              {(["NPN", "PNP"] as TransistorType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTransistorType(t)}
                  className={[
                    "flex-1 py-1.5 font-mono text-sm border rounded-sm transition-all duration-100",
                    transistorType === t
                      ? "border-accent bg-accent-glow text-accent glow-sm"
                      : "border-accent-border/40 text-text-dim hover:border-accent-border hover:text-text-secondary",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Field id={`${id}-hfe`} label="Усиление тока hFE" unit="" hint="мин.">
            <input
              id={`${id}-hfe`}
              className="field"
              type="number"
              step="10"
              min="10"
              max="1000"
              value={hFE}
              onChange={(e) => {
                setHFE(parseInt(e.target.value) || 0);
                setPresetName(CUSTOM_PRESET_NAME);
              }}
            />
          </Field>

          <Field id={`${id}-vcc`} label="Напряжение питания Vcc" unit="В">
            <input
              id={`${id}-vcc`}
              className="field"
              type="number"
              step="0.5"
              min="3"
              max="24"
              value={Vcc}
              onChange={(e) => setVcc(parseFloat(e.target.value) || 0)}
            />
          </Field>

          <Field
            id={`${id}-icq`}
            label="Ток покоя Ic"
            unit="mA"
            hint="0.5–5 мА"
          >
            <input
              id={`${id}-icq`}
              className="field"
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              value={Ic_q_ma}
              onChange={(e) => setIcq(parseFloat(e.target.value) || 0)}
            />
          </Field>
        </Section>
      </div>

      {/* ── RIGHT: Results + Plot ── */}
      <div className="flex flex-col gap-4">
        {!result.ok && (
          <div className="bg-danger/10 border border-danger/30 rounded-sm p-4 font-mono text-sm text-danger">
            <span className="mr-2">✗</span>
            {result.error}
          </div>
        )}

        {result.ok && (
          <>
            {/* Topology diagram */}
            <div className="bg-bg-panel border border-accent-border/30 rounded-sm p-4">
              <div className="font-mono text-xs text-text-dim mb-2 tracking-wider">
                ТОПОЛОГИЯ
              </div>
              {isNPN ? (
                <pre className="font-mono text-xs text-accent/50 leading-tight select-none">
                  {`         +Vcc
           │
          [Rc]
           │
           ├─── коллектор
PD1/PD2 ──┼── R ──┬──[база] Q1 NPN
           │       │  └─── эмиттер ──── Vtune(VCO)
          C2      C1
           │       │
          GND     GND
                        [Rb] к +Vcc`}
                </pre>
              ) : (
                <pre className="font-mono text-xs text-accent/50 leading-tight select-none">
                  {`         GND
           │
          [Rc]
           │
           ├─── коллектор
PD1/PD2 ──┼── R ──┬──[база] Q1 PNP
           │       │  └─── эмиттер ──── Vtune(VCO)
          C2      C1
           │       │
          GND     GND
                        [Rb] к GND`}
                </pre>
              )}
            </div>

            {/* RC filter results */}
            <ResultsPanel
              title="Компоненты RC-фильтра"
              rows={pllRows}
              warning={
                result.value.stabilityWarning
                  ? `fc = ${(result.value.fc_actual / 1000).toFixed(2)} kHz > fref/10 = ${(fref / 10000).toFixed(1)} kHz — риск паразитных составляющих`
                  : undefined
              }
            />

            {/* Transistor results */}
            <ResultsPanel
              title="Параметры транзисторного каскада"
              rows={transistorRows}
              note={`Снижение Z_вых: ${(result.value.Z_out_passive / result.value.Z_out).toFixed(0)}× (${transistorType}, hFE=${hFE})`}
            />

            {/* Bode plot */}
            {plotData.length > 0 && (
              <FrequencyPlot
                data={plotData}
                refs={plotRefs}
                title="График Боде разомкнутой петли  |G(jω)|"
                showPhase={true}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-panel border border-accent-border/30 rounded-sm panel-glow corner-bracket">
      <div className="flex items-center justify-between px-4 py-2 border-b border-accent-border/20">
        <span className="font-display text-xs font-600 text-text-secondary uppercase tracking-[0.2em]">
          {title}
        </span>
        <span className="font-mono text-xs px-1.5 py-0.5 border border-accent-border rounded-sm text-accent/60 bg-accent-glow/50">
          {badge}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  id,
  label,
  unit,
  hint,
  children,
}: {
  id: string;
  label: string;
  unit: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-start">
      <div>
        <label
          htmlFor={id}
          className="font-display text-sm font-500 text-text-secondary block mb-1"
        >
          {label}
          {hint && (
            <span className="ml-2 font-mono text-xs text-text-dim">
              [{hint}]
            </span>
          )}
        </label>
        {children}
      </div>
      {unit && (
        <div className="font-mono text-xs text-accent/50 self-end pb-1.5 pt-6 whitespace-nowrap">
          {unit}
        </div>
      )}
    </div>
  );
}
