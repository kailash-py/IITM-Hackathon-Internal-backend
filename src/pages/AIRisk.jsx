import { band, bandName, bandColor, priColor, priBand, fmt, safeCap, overload, bottleneck } from '../risk.js';
import { HABS, CAPDET, DRIVERS } from '../demoData.js';

const Meter = ({ v, color }) => (
  <div className="meter">
    <div className="bar">
      <i style={{ width: `${v}%`, background: color || bandColor(v) }} />
    </div>
    <span className="pct" style={{ color: color || bandColor(v) }}>{v}</span>
  </div>
);

const Chip = ({ cls, txt }) => (
  <span className={`chip c-${cls}`}>{txt}</span>
);

export default function AIRisk({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const h = HABS.find(x => x.id === selHab) || HABS[0];
  const d = DRIVERS[h.id] || DRIVERS.H03;
  const cap = safeCap(CAPDET[h.id]);
  const ov = overload(h.pop, cap);
  const bn = bottleneck(CAPDET[h.id]);

  const plain = h.risk >= 85
    ? `Risk is high and rising. Rainfall over the last 72 hours is the largest single contributor, and this habitation sits close to the Alaknanda channel on slopes above 30°. Road access is rated ${h.acc.toLowerCase()}, so an evacuation started late would be slow. ${ov > 0 ? `The settlement already holds ${ov}% more people than its ${(bn || '').toLowerCase()} capacity can safely sustain.` : ''}`
    : `Risk is elevated but not acute. The dominant driver is terrain rather than current weather, which means the score moves slowly and is unlikely to spike without sustained rainfall.`;

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 02 · AI risk · model v2.4.1</div>
          <h1 className="h-page">
            {h.n} <span style={{ color: 'var(--dim)', fontWeight: 400, fontSize: 15 }}>· {h.blk} block</span>
          </h1>
          <p>The score on its own is not useful to an officer. What follows is what moved it, how sure the model is, and what it does not know.</p>
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
        <button className="btn pri" onClick={() => go('capacity')}>Check capacity next</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(158px,1fr))', marginBottom: 12 }}>
        <div className="card bd" style={{ textAlign: 'center', padding: 14 }}>
          <div className="eyebrow">Composite risk</div>
          <div className="num" style={{ fontSize: 44, fontWeight: 700, color: bandColor(h.risk), lineHeight: 1.05 }}>{h.risk}</div>
          <Chip cls={band(h.risk)} txt={bandName(h.risk)} />
        </div>
        <div className="card bd" style={{ textAlign: 'center', padding: 14 }}>
          <div className="eyebrow">Model confidence</div>
          <div className="num" style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.05 }}>
            {h.conf}<span style={{ fontSize: 18, color: 'var(--dim)' }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>estimate, not certainty</div>
        </div>
        {[['Hazard', h.haz], ['Vulnerability', h.vln], ['Exposure', h.exp], ['Infrastructure', h.inf]].map(([k, v]) => (
          <div className="card bd" style={{ padding: 14 }} key={k}>
            <div className="eyebrow">{k}</div>
            <div className="num" style={{ fontSize: 27, fontWeight: 600, color: bandColor(v), margin: '3px 0 6px' }}>{v}</div>
            <Meter v={v} />
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.35fr) minmax(280px,1fr)' }}>
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <header>
              <span className="h-sec">What moved this score</span>
              <span className="eyebrow">SHAP-style contribution</span>
            </header>
            <div className="bd">
              {d.map(([n, v]) => (
                <div className="driver" key={n}>
                  <span className="dn">{n}</span>
                  <div className="bar"><i style={{ width: `${v * 3.6}%`, background: 'var(--high)' }} /></div>
                  <span className="dv">+{v}</span>
                </div>
              ))}
              <div className="note acc" style={{ marginTop: 11 }}>Contributions are additive against the district baseline of 41. They explain this one prediction; they are not a claim about causation in general.</div>
            </div>
          </div>

          <div className="card">
            <header><span className="h-sec">Why is this area high risk?</span></header>
            <div className="bd">
              <p style={{ fontSize: 13.5, lineHeight: 1.62 }}>{plain}</p>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 5 }}>Recorded incidents</div>
                  {[['2021', 'Flash flood, 14 houses lost'], ['2023', 'Slope failure, road cut 9 days'], ['2024', 'Subsidence cracks, 42 structures']].map(([y, t]) => (
                    <div className="kv" key={y}>
                      <span className="k">{y}</span>
                      <span className="v" style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 5 }}>Conditions now</div>
                  {[['Rainfall, 24 h', '118 mm', 'var(--crit)'], ['River level', '+2.4 m', 'var(--high)'], ['Soil saturation', '91%', 'var(--crit)'], ['Road status', '1 link degraded', 'var(--mod)']].map(([k, v, c]) => (
                    <div className="kv" key={k}>
                      <span className="k">{k}</span>
                      <span className="v" style={{ color: c }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">What the model does not know</span></header>
            <div className="bd">
              <div className="note warn" style={{ marginBottom: 9 }}>Population is a 2024 projection off the 2011 census. Seasonal labour movement is not captured, so exposure could be understated in summer.</div>
              <div className="note" style={{ marginBottom: 9 }}>The GSI susceptibility layer is from 2025-Q4. Slope changes since then are not reflected.</div>
              <div className="note">No structural survey exists for 61% of buildings here. Fragility is inferred from material class, which is coarse.</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">People at stake</span></header>
            <div className="bd">
              {[['Population', fmt(h.pop)], ['Households', fmt(h.hh)], ['Children under 14', fmt(h.ch)], ['Adults over 60', fmt(h.eld)], ['Vulnerable total', fmt(h.vul)]].map(([k, v]) => (
                <div className="kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
              ))}
            </div>
          </div>

          <div className="card">
            <header>
              <span className="h-sec">Recommendation</span>
              <Chip cls={priBand(h.pri)} txt={h.pri} />
            </header>
            <div className="bd">
              <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                High hazard, high exposure and insufficient carrying capacity. The model recommends {h.pri === 'P1' ? 'immediate relocation planning' : 'scheduled relocation review'}.
              </p>
              <div className="note acc" style={{ margin: '10px 0' }}>The model recommends. It never approves. A permanent move needs field evidence and a signature from the District Authority.</div>
              <button className="btn pri sm" style={{ width: '100%' }} onClick={() => go('priority')}>Open priority engine</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
