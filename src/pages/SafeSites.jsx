import { fmt, safeCap, bandColor } from '../risk.js'
import { HABS, CAPDET, SITES } from '../demoData.js'

export default function SafeSites({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const h = HABS.find(x => x.id === selHab) || HABS[0]
  const cap = safeCap(CAPDET[h.id])
  const need = Math.max(0, h.pop - cap)
  const ranked = [...SITES].sort((a, b) => b.suit - a.suit)
  const best = ranked[0]
  const totalFree = SITES.reduce((a, s) => a + s.cap - s.used, 0)

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 06 · safe-site match</div>
          <h1 className="h-page">Safe-site capacity matching</h1>
          <p>Moving people to a site that is already full is the failure mode nobody plans for. Every candidate below is scored on free capacity first, distance second.</p>
        </div>
        <select className="inp" style={{ width: 'auto' }} value={h.id} onChange={e => setSelHab(e.target.value)}>
          {HABS.map(x => <option key={x.id} value={x.id}>{x.n}</option>)}
        </select>
      </div>

      <div className="note acc" style={{ marginBottom: 12 }}>
        <b>{h.n}</b> needs to move <b className="num">{fmt(need || Math.round(h.pop * 0.3))}</b> people to stay within safe capacity. Total free capacity across four verified sites is <b className="num">{fmt(totalFree)}</b>.
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(300px,.85fr)' }}>
        {/* Left: ranked site cards */}
        <div>
          {ranked.map((s, i) => {
            const free = s.cap - s.used
            const enough = free >= (need || 1)
            return (
              <div
                key={s.id}
                className="card"
                style={{ marginBottom: 10, borderColor: i === 0 ? 'var(--low)' : undefined }}
                onClick={() => setSelSite(s.id)}
              >
                <header style={i === 0 ? { background: 'var(--low-bg)' } : undefined}>
                  <span className="h-sec">{s.n}</span>
                  {i === 0
                    ? <span className="chip c-low">Recommended</span>
                    : <span className="chip c-mute">Option {i + 1}</span>}
                  <div style={{ flex: 1 }} />
                  <span className="num" style={{ fontSize: 19, fontWeight: 700, color: s.suit >= 85 ? 'var(--low)' : s.suit >= 70 ? 'var(--mod)' : 'var(--high)' }}>
                    {s.suit}%
                  </span>
                  <span className="eyebrow">suitability</span>
                </header>
                <div className="bd">
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(94px,1fr))', gap: 9, marginBottom: 10 }}>
                    {[
                      ['Distance', s.dist + ' km'],
                      ['Total capacity', fmt(s.cap)],
                      ['Free now', fmt(free)],
                      ['Site risk', s.risk],
                      ['Access', s.acc],
                      ['Healthcare', s.health + ' km'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="eyebrow">{k}</div>
                        <div className="num" style={{ fontSize: '13.5px', fontWeight: 600, marginTop: 1 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bar" style={{ height: 8 }}>
                    <i style={{ width: `${s.used / s.cap * 100}%`, background: s.used / s.cap > 0.6 ? 'var(--high)' : 'var(--accent)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }} className="eyebrow">
                    <span>{fmt(s.used)} occupied</span>
                    <span style={{ color: enough ? 'var(--low)' : 'var(--crit)' }}>
                      {enough ? 'ENOUGH ROOM' : 'NOT ENOUGH ROOM'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right column */}
        <div>
          {/* Map placeholder */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Sites on the map</span></header>
            <div style={{ padding: 1 }}>
              <div className="mapwrap" style={{ height: 300 }}>
                <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
                  <rect width="400" height="300" fill="#0A1218" />
                  {ranked.map((s, i) => {
                    const cx = 60 + i * 90
                    const cy = 100 + (i % 2) * 80
                    return (
                      <g key={s.id}>
                        <circle cx={cx} cy={cy} r={12} fill={i === 0 ? 'var(--low)' : 'var(--accent-dim)'} opacity={0.7} />
                        <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="9" fontFamily="var(--mono)">{s.id}</text>
                        <text x={cx} y={cy + 22} textAnchor="middle" fill="var(--muted)" fontSize="8" fontFamily="var(--mono)">{s.suit}%</text>
                      </g>
                    )
                  })}
                </svg>
                <div className="maplegend">
                  <div><div className="sw" style={{ background: 'var(--low)' }} /> Recommended</div>
                  <div><div className="sw" style={{ background: 'var(--accent-dim)' }} /> Other sites</div>
                </div>
              </div>
            </div>
          </div>

          {/* Why recommended */}
          <div className="card">
            <header>
              <span className="h-sec">Why {best.n}</span>
              <span className="chip c-low">Recommended</span>
            </header>
            <div className="bd">
              <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: 'var(--muted)' }}>
                It is not the closest site — Pipalkoti School Block is a kilometre nearer. But Pipalkoti has {fmt(SITES[2].cap - SITES[2].used)} places free against a need of {fmt(need || Math.round(h.pop * 0.3))}, its road access is poor, and the nearest health facility is 6.8 km away. Gopeshwar has room, a hospital 2.1 km away and a road that stays open in rain.
              </p>
              <div style={{ marginTop: 11 }}>
                {[
                  ['Free capacity covers the need', 'yes', 'var(--low)'],
                  ['Site risk band', 'low', 'var(--low)'],
                  ['All-weather road', 'yes', 'var(--low)'],
                  ['Healthcare within 5 km', '2.1 km', 'var(--low)'],
                  ['Piped water', '24 hours', 'var(--low)'],
                  ['Distance penalty', '5.2 km', 'var(--mod)'],
                ].map(([k, v, c]) => (
                  <div className="kv" key={k}>
                    <span className="k">{k}</span>
                    <span className="v" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn pri sm" style={{ width: '100%', marginTop: 11 }} onClick={() => go('verify')}>
                Verify on ground, then propose
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
