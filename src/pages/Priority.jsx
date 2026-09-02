import { bandColor, priColor, priBand, fmt, safeCap, overload } from '../risk.js'
import { HABS, CAPDET } from '../demoData.js'

const GROUPS = { P1: 'Immediate', P2: 'Urgent', P3: 'Short term', P4: 'Monitor' }

export default function Priority({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const h = HABS.find(x => x.id === selHab) || HABS[0]
  const cap = safeCap(CAPDET[h.id])
  const ov = overload(h.pop, cap)

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 05 · priority</div>
          <h1 className="h-page">Relocation priority engine</h1>
          <p>Risk, vulnerability, capacity overload and accessibility resolve into one of four queues. This is the screen an officer actually works from.</p>
        </div>
        <button className="btn pri" onClick={() => go('approval')}>Go to approvals</button>
      </div>

      {/* Priority bucket cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', marginBottom: 14 }}>
        {Object.entries(GROUPS).map(([p, lbl]) => {
          const list = HABS.filter(x => x.pri === p)
          const ppl = list.reduce((a, x) => a + x.pop, 0)
          return (
            <div className="card" key={p}>
              <header style={{ borderBottomColor: priColor(p) }}>
                <span className="h-sec" style={{ color: priColor(p) }}>{p} — {lbl}</span>
              </header>
              <div className="bd" style={{ padding: '10px 12px' }}>
                <div className="num" style={{ fontSize: 23, fontWeight: 700 }}>
                  {fmt(ppl)}<span style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 400 }}> people</span>
                </div>
                <div className="eyebrow" style={{ margin: '2px 0 8px' }}>
                  {list.length} habitation{list.length === 1 ? '' : 's'}
                </div>
                {list.length > 0
                  ? list.map(x => (
                    <button
                      key={x.id}
                      className="btn sm"
                      style={{ width: '100%', marginBottom: 4, justifyContent: 'flex-start', borderColor: x.id === h.id ? 'var(--accent)' : undefined }}
                      onClick={() => setSelHab(x.id)}
                    >
                      {x.n}
                    </button>
                  ))
                  : <span style={{ fontSize: 12, color: 'var(--dim)' }}>None</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Two-column detail */}
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(290px,1fr)' }}>
        {/* Why hab is priority */}
        <div className="card">
          <header>
            <span className="h-sec">Why {h.n} is {h.pri}</span>
            <span className={`chip c-${priBand(h.pri)}`}>{GROUPS[h.pri]}</span>
          </header>
          <div className="bd">
            {[
              ['Composite risk', h.risk, '≥ 85 pushes to P1'],
              ['Vulnerability', h.vln, 'share of children, elderly, fragile housing'],
              ['Capacity overload', Math.max(0, ov), 'population above safe capacity'],
              ['Infrastructure fragility', 100 - h.inf, 'inverse of infrastructure score'],
            ].map(([k, v, note]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span>{k}</span>
                  <span className="num" style={{ fontWeight: 600, color: bandColor(v) }}>{v}</span>
                </div>
                <div className="bar" style={{ margin: '3px 0' }}>
                  <i style={{ width: `${Math.min(100, v)}%`, background: bandColor(v) }} />
                </div>
                <div className="eyebrow">{note}</div>
              </div>
            ))}

            {/* Final priority box */}
            <div style={{ margin: '12px 0', padding: 11, border: `1px solid ${priColor(h.pri)}`, borderRadius: 'var(--r)', background: 'var(--panel2)' }}>
              <div className="eyebrow">Final priority</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: priColor(h.pri), margin: '2px 0 4px' }}>
                {h.pri} — {GROUPS[h.pri]}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                {h.pri === 'P1'
                  ? `Every gate is tripped: risk above 85, access rated ${h.acc.toLowerCase()}, and the settlement is ${ov}% over its safe capacity. Relocation planning should start now.`
                  : h.pri === 'P2'
                    ? 'Risk is high and capacity is stretched, but access is workable. Schedule verification within the fortnight.'
                    : h.pri === 'P3'
                      ? 'Elevated risk with capacity headroom. Review at the next monsoon cycle.'
                      : 'Risk is within tolerance and capacity is sufficient. Keep under passive monitoring.'}
              </div>
            </div>

            <div className="note acc">
              <b>Recommendation, not decision.</b> The engine ranks. Field verification tests the ranking against the ground. The District Authority signs. That separation is deliberate and is enforced in the workflow, not just in policy.
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Status of this case */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Status of this case</span></header>
            <div className="bd">
              <div className="kv">
                <span className="k">AI recommendation</span>
                <span className="v" style={{ color: priColor(h.pri) }}>{h.pri}</span>
              </div>
              <div className="kv">
                <span className="k">Field verification</span>
                <span className="v">{h.ver}</span>
              </div>
              <div className="kv">
                <span className="k">Safe site matched</span>
                <span className="v">{h.id === 'H01' ? 'Gopeshwar Relief Campus' : 'Not yet'}</span>
              </div>
              <div className="kv">
                <span className="k">Authority approval</span>
                <span className="v" style={{ color: h.apr === 'Approved' ? 'var(--low)' : 'var(--mod)' }}>
                  {h.apr}
                </span>
              </div>
              <div style={{ display: 'grid', gap: 6, marginTop: 11 }}>
                <button className="btn sm" onClick={() => go('verify')}>Open field verification</button>
                <button className="btn sm" onClick={() => go('safesites')}>Match a safe site</button>
                <button className="btn pri sm" onClick={() => go('approval')}>Send to authority</button>
              </div>
            </div>
          </div>

          {/* Gate thresholds */}
          <div className="card">
            <header><span className="h-sec">Gate thresholds</span></header>
            <div className="bd">
              {[
                ['P1 Immediate', 'risk ≥ 85 AND (overload > 40% OR access poor)'],
                ['P2 Urgent', 'risk ≥ 70 AND overload > 10%'],
                ['P3 Short term', 'risk ≥ 50'],
                ['P4 Monitor', 'everything else'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
                  <b style={{ fontSize: '12.5px', color: priColor(k.split(' ')[0]) }}>{k}</b>
                  <div className="num" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{v}</div>
                </div>
              ))}
              <div className="note" style={{ marginTop: 9 }}>
                Thresholds are configurable per district by the administrator, and every change is written to the audit log.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
