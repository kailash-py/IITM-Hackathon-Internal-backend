import { useState, useMemo } from 'react';
import { band, bandName, bandColor, fmt } from '../risk.js';

const DEFAULTS = { rain: 118, river: 2.4, road: 1, lead: 0 };

function wiCalc({ rain, river, road, lead }) {
  const base = Math.min(100, Math.round(rain * 0.42 + river * 8 + road * 7));
  const expA = Math.round(3240 * Math.min(1, base / 92));
  const expB = Math.round(expA * (1 - Math.min(0.78, lead * 0.011)));
  const delA = Math.round(48 + road * 22);
  const delB = Math.round(delA * (1 - Math.min(0.66, lead * 0.009)));
  return { base, expA, expB, delA, delB };
}

const SLIDERS = [
  { k: 'rain',  label: 'Rainfall, 24 h',            unit: 'mm',    min: 0, max: 250, step: 1 },
  { k: 'river', label: 'River level above normal',   unit: 'm',     min: 0, max: 5,   step: 0.1 },
  { k: 'road',  label: 'Road links degraded',        unit: 'links', min: 0, max: 4,   step: 1 },
  { k: 'lead',  label: 'Warning lead time',          unit: 'min',   min: 0, max: 90,  step: 1 },
];

export default function WhatIf({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [wi, setWi] = useState(DEFAULTS);

  const r = useMemo(() => wiCalc(wi), [wi]);

  const set = (k, v) => setWi(prev => ({ ...prev, [k]: +v }));

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Decision support · simulation</div>
          <h1 className="h-page">What-if intervention simulator</h1>
          <p>Move the inputs and see what changes. This is how you argue for pre-positioning a team before anything has happened.</p>
        </div>
        <span className="chip c-mod">Simulation · prototype estimates</span>
      </div>

      <div className="note warn" style={{ marginBottom: 12 }}>
        <b>These are not forecasts and not guarantees.</b> The relationships are illustrative and fitted to a demonstration dataset. A deployment would need calibration against real historical events in this district before any of these numbers could be used to justify a decision.
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(260px,.8fr) minmax(0,1.3fr)' }}>
        {/* Scenario inputs */}
        <div className="card">
          <header><span className="h-sec">Scenario inputs</span></header>
          <div className="bd">
            {SLIDERS.map(({ k, label, unit, min, max, step }) => (
              <label className="f" key={k}>
                <span>{label} · {wi[k]} {unit}</span>
                <input
                  type="range" min={min} max={max} step={step}
                  value={wi[k]}
                  style={{ width: '100%', accentColor: 'var(--accent)' }}
                  onChange={e => set(k, e.target.value)}
                />
              </label>
            ))}

            <div style={{ padding: 11, border: '1px solid var(--line2)', borderRadius: 'var(--r)', background: 'var(--panel2)', marginTop: 6 }}>
              <div className="eyebrow">Resulting composite risk</div>
              <div className="num" style={{ fontSize: 34, fontWeight: 700, color: bandColor(r.base) }}>{r.base}</div>
              <span className={`chip c-${band(r.base)}`}>{bandName(r.base)}</span>
            </div>

            <button className="btn sm" style={{ width: '100%', marginTop: 10 }} onClick={() => setWi(DEFAULTS)}>
              Reset to current conditions
            </button>
          </div>
        </div>

        {/* Scenario comparison */}
        <div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 12 }}>
            {/* Scenario A */}
            <div className="card" style={{ borderColor: '#5C1F22' }}>
              <header style={{ background: 'var(--crit-bg)' }}>
                <span className="h-sec" style={{ color: '#FF8080' }}>Scenario A · no intervention</span>
              </header>
              <div className="bd">
                <div style={{ marginBottom: 12 }}>
                  <div className="eyebrow">Population exposed</div>
                  <div className="num" style={{ fontSize: 31, fontWeight: 700, color: 'var(--crit)' }}>{fmt(r.expA)}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div className="eyebrow">Response delay</div>
                  <div className="num" style={{ fontSize: 31, fontWeight: 700, color: 'var(--crit)' }}>
                    {r.delA}<span style={{ fontSize: 14 }}>min</span>
                  </div>
                </div>
                <div className="kv"><span className="k">Routes available</span><span className="v">{Math.max(1, 3 - wi.road)} of 3</span></div>
                <div className="kv">
                  <span className="k">Shelter reached in time</span>
                  <span className="v" style={{ color: 'var(--crit)' }}>{Math.round(100 - r.expA / 3240 * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="card" style={{ borderColor: '#1E4A31' }}>
              <header style={{ background: 'var(--low-bg)' }}>
                <span className="h-sec" style={{ color: '#5FCB8F' }}>Scenario B · alert + pre-position</span>
              </header>
              <div className="bd">
                <div style={{ marginBottom: 12 }}>
                  <div className="eyebrow">Population exposed</div>
                  <div className="num" style={{ fontSize: 31, fontWeight: 700, color: 'var(--low)' }}>{fmt(r.expB)}</div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div className="eyebrow">Response delay</div>
                  <div className="num" style={{ fontSize: 31, fontWeight: 700, color: 'var(--low)' }}>
                    {r.delB}<span style={{ fontSize: 14 }}>min</span>
                  </div>
                </div>
                <div className="kv">
                  <span className="k">Routes available</span>
                  <span className="v" style={{ color: 'var(--low)' }}>{Math.max(1, 3 - wi.road)} of 3, pre-verified</span>
                </div>
                <div className="kv">
                  <span className="k">Shelter reached in time</span>
                  <span className="v" style={{ color: 'var(--low)' }}>{Math.round(100 - r.expB / 3240 * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Difference */}
          <div className="card">
            <header>
              <span className="h-sec">Difference</span>
              <span className="eyebrow">A minus B</span>
            </header>
            <div className="bd">
              {[
                ['People kept out of the hazard polygon', fmt(r.expA - r.expB), 'var(--low)'],
                ['Minutes saved in response', (r.delA - r.delB) + ' min', 'var(--low)'],
                ['Warning lead time applied', wi.lead + ' min', 'var(--accent)'],
              ].map(([k, v, c]) => (
                <div className="kv" key={k}>
                  <span className="k">{k}</span>
                  <span className="v" style={{ color: c, fontSize: 14 }}>{v}</span>
                </div>
              ))}
              <div className="note acc" style={{ marginTop: 11 }}>
                The single largest lever on this screen is warning lead time, not rescue capacity. At zero minutes of warning the two scenarios converge — which is the argument for the proactive half of this system existing at all.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
