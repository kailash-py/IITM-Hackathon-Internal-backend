import { band, bandColor, fmt, safeCap, overload, bottleneck } from '../risk.js'
import { HABS, CAPDET } from '../demoData.js'

export default function Capacity({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const h = HABS.find(x => x.id === selHab) || HABS[0]
  const d = CAPDET[h.id]
  const cap = safeCap(d)
  const bn = bottleneck(d)
  const ov = overload(h.pop, cap)
  const pct = Math.min(200, Math.round(h.pop / cap * 100))
  const safeWidth = Math.min(100, 100 / pct * 100)

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 04 · carrying capacity</div>
          <h1 className="h-page">Carrying capacity assessment</h1>
          <p>Risk tells you a place is dangerous. Capacity tells you whether it can hold the people already living there — and neither hazard maps nor warning systems answer that.</p>
        </div>
        <select className="inp" style={{ width: 'auto' }} value={h.id} onChange={e => setSelHab(e.target.value)}>
          {HABS.map(x => <option key={x.id} value={x.id}>{x.n}</option>)}
        </select>
        <button className="btn pri" onClick={() => go('safesites')}>Find room elsewhere</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.25fr) minmax(290px,1fr)' }}>
        {/* Left: resource-wise capacity */}
        <div className="card">
          <header>
            <span className="h-sec">{h.n} · resource-wise capacity</span>
            <span className={`chip c-${ov > 50 ? 'crit' : ov > 0 ? 'high' : 'low'}`}>
              {ov > 0 ? 'Over capacity' : 'Within capacity'}
            </span>
          </header>
          <div className="bd">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <div className="eyebrow">Population</div>
                <div className="num" style={{ fontSize: 31, fontWeight: 700 }}>{fmt(h.pop)}</div>
              </div>
              <div>
                <div className="eyebrow">Safe capacity</div>
                <div className="num" style={{ fontSize: 31, fontWeight: 700, color: 'var(--accent)' }}>{fmt(cap)}</div>
              </div>
              <div>
                <div className="eyebrow">{ov > 0 ? 'Over capacity by' : 'Headroom'}</div>
                <div className="num" style={{ fontSize: 31, fontWeight: 700, color: ov > 0 ? 'var(--crit)' : 'var(--low)' }}>
                  {ov > 0 ? '+' + ov : Math.abs(ov)}%
                </div>
              </div>
            </div>

            {/* Capacity bar */}
            <div style={{ position: 'relative', height: 24, background: 'var(--panel3)', borderRadius: 3, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ position: 'absolute', inset: 0, width: `${safeWidth}%`, background: 'var(--low)', opacity: 0.5 }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${safeWidth}%`, right: 0, background: 'var(--crit)', opacity: 0.65 }} />
              <div style={{ position: 'absolute', left: `${safeWidth}%`, top: 0, bottom: 0, width: 2, background: '#fff' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '9.5px', color: 'var(--dim)', letterSpacing: '.06em', marginBottom: 16 }}>
              <span>SAFE {fmt(cap)}</span>
              <span>EXCESS {fmt(Math.max(0, h.pop - cap))}</span>
            </div>

            <div className="eyebrow" style={{ marginBottom: 7 }}>Each resource, in people it can sustain</div>
            {Object.entries(d).map(([k, v]) => {
              const isBn = k === bn
              const w = Math.min(100, v / Math.max(h.pop, v) * 100)
              return (
                <div key={k} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 3 }}>
                    <span>
                      {k === 'Access' ? 'Road / evacuation access' : k}
                      {isBn && <span className="chip c-crit" style={{ marginLeft: 5 }}>Binding constraint</span>}
                    </span>
                    <span className="num" style={{ fontWeight: 600, color: isBn ? 'var(--crit)' : 'var(--text)' }}>{fmt(v)}</span>
                  </div>
                  <div className="bar" style={{ height: 7 }}>
                    <i style={{ width: `${w}%`, background: isBn ? 'var(--crit)' : 'var(--accent-dim)' }} />
                  </div>
                </div>
              )
            })}

            <div className="note acc" style={{ marginTop: 12 }}>
              <b>Safe capacity is set by the weakest critical resource, not the average.</b>{' '}
              Here that is {bn ? bn.toLowerCase() : '—'} at {fmt(cap)} people. Averaging the five would give {fmt(Math.round(Object.values(d).reduce((a, b) => a + b, 0) / 5))} and would be wrong — you cannot make up a water shortfall with spare road width.
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">How each number is derived</span></header>
            <div className="bd">
              {[
                ['Housing', 'Habitable structures × mean household size, minus structures rated fragile'],
                ['Water', 'Assured dry-season yield ÷ 55 litres per person per day, NDMA relief norm'],
                ['Healthcare', 'PHC beds and staff within 30 minutes travel, scaled to district norm'],
                ['Emergency', 'Shelter floor area ÷ 3.5 m² per person, minus non-usable area'],
                ['Access', 'Evacuation throughput of the road network in a 6-hour window'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '7px 0', borderBottom: '1px dashed var(--line)' }}>
                  <b style={{ fontSize: '12.5px' }}>{k}</b>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: 2 }}>{v}</div>
                </div>
              ))}
              <div className="note warn" style={{ marginTop: 10 }}>
                Norms are illustrative for the prototype. A deployment would take them from the state relief manual, not from us.
              </div>
            </div>
          </div>

          <div className="card">
            <header><span className="h-sec">District at a glance</span></header>
            <div style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr><th>Habitation</th><th>Pop</th><th>Safe</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {HABS.map(x => {
                    const xCap = safeCap(CAPDET[x.id])
                    const xOv = overload(x.pop, xCap)
                    return (
                      <tr key={x.id} onClick={() => setSelHab(x.id)} style={x.id === h.id ? { background: 'var(--panel3)' } : undefined}>
                        <td>{x.n}</td>
                        <td className="n">{fmt(x.pop)}</td>
                        <td className="n">{fmt(xCap)}</td>
                        <td>
                          {xOv > 0
                            ? <span className={`chip c-${xOv > 50 ? 'crit' : 'high'}`}>+{xOv}%</span>
                            : <span className="chip c-low">ok</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
