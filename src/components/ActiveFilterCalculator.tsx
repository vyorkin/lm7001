import { useState, useMemo, useId } from "react";
import { calculateActiveFilter, TRANSISTOR_PRESETS } from "../lib/activeFilter";
import { hzToRad, mAtoA, khzToHz, mhzToHz, formatSI } from "../lib/units";
import ResultsPanel, { type ResultRow } from "./ResultsPanel";
import FrequencyPlot from "./FrequencyPlot";
import TopologyDiagram from "./TopologyDiagram";
import { useLocale } from "../i18n";
import type { ActiveFilterInput, RefFrequency, TransistorType } from "../types";

const REF_FREQS: RefFrequency[] = [
  1000, 5000, 9000, 10000, 25000, 50000, 100000,
];

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
  const t = useLocale();
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

  const CUSTOM_PRESET_NAME = t.customPreset;

  function applyPreset(name: string) {
    setPresetName(name);
    const preset = TRANSISTOR_PRESETS.find((p) => p.name === name);
    if (preset) {
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
      { logF: Math.log10(result.value.fc_actual), label: "fc", color: "#ffaa00" },
      { logF: Math.log10(result.value.fz), label: "fz", color: "rgba(118,131,144,0.65)" },
      { logF: Math.log10(result.value.fp), label: "fp", color: "rgba(118,131,144,0.65)" },
    ];
  }, [result.ok ? result.value.fc_actual : 0]);

  const pllRows: ResultRow[] = result.ok
    ? [
        { label: t.rowVcoFreq, symbol: "fvco", value: result.value.fVCO, unit: "Hz", highlight: true },
        { label: t.rowDivN, symbol: "N", value: result.value.N, unit: "", raw: true, rawFormat: (v) => v.toFixed(0), highlight: true },
        { label: t.rowGeomM, symbol: "m", value: result.value.m, unit: "", raw: true, rawFormat: (v) => v.toFixed(4) },
        { label: t.rowSeriesR, symbol: "R", value: result.value.R, unit: "Ω", digits: 2, highlight: true },
        { label: t.rowC1, symbol: "C1", value: result.value.C1, unit: "F", digits: 2, highlight: true },
        { label: t.rowC2, symbol: "C2", value: result.value.C2, unit: "F", digits: 2, highlight: true },
        { label: t.rowFz, symbol: "fz", value: result.value.fz, unit: "Hz" },
        { label: t.rowFp, symbol: "fp", value: result.value.fp, unit: "Hz" },
        { label: t.rowPhiMActual, symbol: "φm", value: result.value.phiM_actual, unit: "°", raw: true, rawFormat: (v) => `${v.toFixed(2)}°` },
      ]
    : [];

  const transistorRows: ResultRow[] = result.ok
    ? [
        { label: t.rowVtune, symbol: "Vt", value: result.value.Vtune_q, unit: "V", raw: true, rawFormat: (v) => `${v.toFixed(3)} V`, highlight: true },
        { label: t.rowIcQ, symbol: "Ic", value: result.value.Ic_q, unit: "A", digits: 2 },
        { label: t.rowIb, symbol: "Ib", value: result.value.Ib, unit: "A", digits: 2 },
        { label: t.rowRc, symbol: "Rc", value: result.value.Rc, unit: "Ω", digits: 2, highlight: true },
        { label: t.rowRb, symbol: "Rb", value: result.value.Rb, unit: "Ω", digits: 2, highlight: true },
        { label: t.rowZpassive, symbol: "Zp", value: result.value.Z_out_passive, unit: "Ω", digits: 2 },
        { label: t.rowZactive, symbol: "Za", value: result.value.Z_out, unit: "Ω", digits: 2, highlight: true },
      ]
    : [];

  const selectedPreset = TRANSISTOR_PRESETS.find((p) => p.name === presetName);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      {/* ── LEFT: Inputs ── */}
      <div className="flex flex-col gap-4">
        <Section title={t.vcoConfig} badge="RF">
          <Field id={`${id}-frf`} label={t.rfFreq} unit="MHz" hint={t.hintRF}>
            <input id={`${id}-frf`} className="field" type="number" step="0.1" min="45" max="130" value={fRF_mhz} onChange={(e) => setFRF(parseFloat(e.target.value) || 0)} />
          </Field>
          <Field id={`${id}-fif`} label={t.ifFreq} unit="MHz" hint={t.hintIF}>
            <input id={`${id}-fif`} className="field" type="number" step="0.1" min="0" value={fIF_mhz} onChange={(e) => setFIF(parseFloat(e.target.value) || 0)} />
          </Field>
          <Field id={`${id}-fref`} label={t.refFreq} unit="kHz" hint={t.hintRef}>
            <select id={`${id}-fref`} className="field field-select" value={fref} onChange={(e) => setFref(parseInt(e.target.value) as RefFrequency)}>
              {REF_FREQS.map((f) => (
                <option key={f} value={f}>{f >= 1000 ? `${f / 1000} kHz` : `${f} Hz`}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title={t.pllParams} badge="CHIP">
          <Field id={`${id}-icp`} label={t.chargePumpCurrent} unit="mA" hint={t.hintIcp}>
            <input id={`${id}-icp`} className="field" type="number" step="0.1" min="0.01" max="5" value={Icp_ma} onChange={(e) => setIcp(parseFloat(e.target.value) || 0)} />
          </Field>
          <Field id={`${id}-kvco`} label={t.vcoGain} unit="MHz/V" hint={t.hintKvco}>
            <input id={`${id}-kvco`} className="field" type="number" step="0.5" min="0.1" value={Kvco_mhz_v} onChange={(e) => setKvco(parseFloat(e.target.value) || 0)} />
          </Field>
        </Section>

        <Section title={t.loopDesign} badge="DESIGN">
          <Field id={`${id}-fc`} label={t.loopBW} unit="kHz" hint={t.hintFc}>
            <input id={`${id}-fc`} className="field" type="number" step="0.1" min="0.01" value={fc_khz} onChange={(e) => setFc(parseFloat(e.target.value) || 0)} />
          </Field>
          <Field id={`${id}-phim`} label={t.phaseMarginField} unit="°" hint={t.hintPhiM}>
            <input id={`${id}-phim`} className="field" type="number" step="1" min="10" max="85" value={phiM} onChange={(e) => setPhiM(parseFloat(e.target.value) || 0)} />
          </Field>
          <div className="mt-1">
            <input
              type="range" min="30" max="70" step="1" value={phiM}
              onChange={(e) => setPhiM(parseInt(e.target.value))}
              className="w-full h-1 rounded appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #adbac7 ${((phiM - 30) / 40) * 100}%, rgba(118,131,144,0.15) 0%)`, accentColor: "#adbac7" }}
            />
            <div className="flex justify-between font-mono text-xs text-text-dim mt-0.5">
              <span>30°</span><span>45°</span><span>70°</span>
            </div>
          </div>
        </Section>

        <Section title={t.transistorSection} badge="BJT">
          <Field id={`${id}-preset`} label={t.transistorModel} unit="">
            <select id={`${id}-preset`} className="field field-select" value={presetName} onChange={(e) => applyPreset(e.target.value)}>
              {TRANSISTOR_PRESETS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name !== "Пользовательский" ? `${p.name} (${p.type}, hFE≥${p.hFE_min})` : CUSTOM_PRESET_NAME}
                </option>
              ))}
            </select>
          </Field>

          {selectedPreset && selectedPreset.name !== "Пользовательский" && (
            <div className="font-mono text-xs text-text-dim bg-accent-glow/30 border border-accent-border/20 rounded-sm px-2 py-1">
              {selectedPreset.description} · hFE typ: {selectedPreset.hFE_typ}
            </div>
          )}

          <div>
            <div className="font-display text-sm font-500 text-text-secondary mb-1">
              {t.transistorTypeLabel}
            </div>
            <div className="flex gap-2">
              {(["NPN", "PNP"] as TransistorType[]).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setTransistorType(tp)}
                  className={[
                    "flex-1 py-1.5 font-mono text-sm border rounded-sm transition-all duration-100",
                    transistorType === tp
                      ? "border-accent bg-accent-glow text-accent glow-sm"
                      : "border-accent-border/40 text-text-dim hover:border-accent-border hover:text-text-secondary",
                  ].join(" ")}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          <Field id={`${id}-hfe`} label={t.hfeGain} unit="" hint={t.hintHfe}>
            <input id={`${id}-hfe`} className="field" type="number" step="10" min="10" max="1000" value={hFE}
              onChange={(e) => { setHFE(parseInt(e.target.value) || 0); setPresetName("Пользовательский"); }} />
          </Field>

          <Field id={`${id}-vcc`} label={t.vccVoltage} unit="V">
            <input id={`${id}-vcc`} className="field" type="number" step="0.5" min="3" max="24" value={Vcc} onChange={(e) => setVcc(parseFloat(e.target.value) || 0)} />
          </Field>

          <Field id={`${id}-icq`} label={t.quiescentCurrent} unit="mA" hint={t.hintIcq}>
            <input id={`${id}-icq`} className="field" type="number" step="0.1" min="0.1" max="50" value={Ic_q_ma} onChange={(e) => setIcq(parseFloat(e.target.value) || 0)} />
          </Field>
        </Section>
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
            {/* Topology diagram */}
            <div className="bg-bg-panel border border-accent-border/30 rounded-sm p-4">
              <div className="font-mono text-xs text-text-dim mb-3 tracking-wider">
                {t.topologyActive(transistorType)}
              </div>
              <TopologyDiagram
                transistorType={transistorType}
                Rc={formatSI(result.value.Rc, "Ω", 2)}
                Rb={formatSI(result.value.Rb, "Ω", 2)}
                R={formatSI(result.value.R, "Ω", 2)}
                C1={formatSI(result.value.C1, "F", 2)}
                C2={formatSI(result.value.C2, "F", 2)}
              />
            </div>

            {/* Bode plot — right after topology */}
            {plotData.length > 0 && (
              <FrequencyPlot
                data={plotData}
                refs={plotRefs}
                title={t.bodeTitle}
                showPhase={true}
              />
            )}

            {/* RC filter results */}
            <ResultsPanel
              title={t.calcTitleRC}
              rows={pllRows}
              warning={
                result.value.stabilityWarning
                  ? t.stabilityWarningActive(
                      (result.value.fc_actual / 1000).toFixed(2),
                      (fref / 10000).toFixed(1),
                    )
                  : undefined
              }
            />

            {/* Transistor results */}
            <ResultsPanel
              title={t.calcTitleTransistor}
              rows={transistorRows}
              note={t.zOutReduction(
                (result.value.Z_out_passive / result.value.Z_out).toFixed(0),
                transistorType,
                hFE,
              )}
            />
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
        <label htmlFor={id} className="font-display text-sm font-500 text-text-secondary block mb-1">
          {label}
          {hint && <span className="ml-2 font-mono text-xs text-text-dim">[{hint}]</span>}
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
