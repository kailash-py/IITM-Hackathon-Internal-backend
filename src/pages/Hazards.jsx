import { band, bandName, bandColor, fmt } from '../risk.js';
import { HABS, HAZARD_WEIGHTS } from '../demoData.js';

const Chip = ({ cls, txt }) => (
  <span className={`chip c-${cls}`}>{txt}</span>
);

export default function Hazards({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const h = HABS.find(x => x.id === selHab) || HABS[0];
  const hz = h.hazards;
  const keys = Object.keys(hz);
  const composite = Math.round(keys.reduce((a, k) => a + hz[k] * HAZARD_WEIGHTS[k], 0));

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 02b · hazard decomposition</div>
          <h1 className="h-page">Multi-hazard analysis</h1>
          <p>The composite score hides which hazard is driving it. For an officer deciding what to prepare for, that distinction is the whole point.</p>
        </div>
        <select
          className="inp"
          style={{ width: 'auto' }}
          value={h.id}
          onChange={e => setSelHab(e.target.value)}
        >
          {HABS.map(x => (
            <option key={x.id} value={x.id}>{x.n}</option>
          ))}
        </select>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.3fr) minmax(290px,1fr)' }}>
        <div className="card">
          <header>
            <span className="h-sec">Hazard-wise estimate · {h.n}</span>
            <span className="eyebrow">rolling 72 h window</span>
          </header>
          <div className="bd">
            {keys.map(k => (
              <div key={k} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{k === 'Coastal' ? 'Coastal erosion' : k}</span>
                  <span>
                    <Chip cls={band(hz[k])} txt={bandName(hz[k])} />{' '}
                    <span className="num" style={{ marginLeft: 6, fontWeight: 600, color: bandColor(hz[k]) }}>{hz[k]}</span>
                  </span>
                </div>
                <div className="bar"><i style={{ width: `${hz[k]}%`, background: bandColor(hz[k]) }} /></div>
                <div className="eyebrow" style={{ marginTop: 3 }}>
                  weight {(HAZARD_WEIGHTS[k] * 100).toFixed(0)}% · {k === 'Cyclone' || k === 'Coastal' ? 'not applicable to this inland district' : 'active in this district'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Combined score</span></header>
            <div className="bd">
              <div style={{ textAlign: 'center', padding: '6px 0 12px' }}>
                <div className="num" style={{ fontSize: 48, fontWeight: 700, color: bandColor(composite), lineHeight: 1 }}>{composite}</div>
                <Chip cls={band(composite)} txt={bandName(composite) + ' · multi-hazard'} />
              </div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>How it is built</div>
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                Each hazard score is weighted by its historical frequency and severity in this district, then combined. Hazards that cannot occur here carry near-zero weight, so a coastal score of 0 does not drag the composite down.
              </p>
              <div className="note warn" style={{ marginTop: 10 }}>A high score means elevated likelihood under current conditions. It is not a prediction that an event will occur, and it carries no date.</div>
            </div>
          </div>

          <div className="card">
            <header><span className="h-sec">Evidence behind each hazard</span></header>
            <div className="bd">
              {[
                ['Flood', 'IMD rainfall + Alaknanda gauge', '12 min', 'var(--low)'],
                ['Landslide', 'GSI susceptibility + slope DEM', '2025-Q4', 'var(--mod)'],
                ['Cloudburst', 'IMD nowcast radar', '20 min', 'var(--low)'],
                ['Earthquake', 'Seismic zone V, BIS', 'static', 'var(--dim)']
              ].map(([k, src, age, c]) => (
                <div key={k} style={{ padding: '7px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <b style={{ fontSize: 12.5 }}>{k}</b>
                    <span className="num" style={{ fontSize: 11, color: c }}>{age}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{src}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
