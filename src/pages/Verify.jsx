import { useState } from 'react'
import { fmt } from '../risk.js'
import { HABS } from '../demoData.js'

const CHECKLIST = [
  ['Road condition verified', 'Photograph both approach roads and note surface state'],
  ['Population verified', 'Confirm resident count against the household register'],
  ['Water availability verified', 'Record source, yield and whether supply is year-round'],
  ['Shelter capacity verified', 'Count habitable structures, flag fragile construction'],
  ['Hazard evidence verified', 'Photograph cracks, scarps, erosion or flood marks'],
  ['Communication availability verified', 'Test mobile signal and note the nearest working tower'],
]

export default function Verify({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [checks, setChecks] = useState([false, false, false, false, false, false])
  const [photos, setPhotos] = useState(0)
  const [gps, setGps] = useState(false)

  const done = checks.filter(Boolean).length

  function toggleCheck(i) {
    setChecks(prev => { const next = [...prev]; next[i] = !next[i]; return next })
  }

  function addPhoto() {
    setPhotos(p => p + 1)
    toast('Photo attached', `Image ${photos + 1} stored against task FV-0442 with EXIF location.`, 'ok')
  }

  function capGPS() {
    setGps(true)
    toast('Location captured', '30.4021° N, 79.5518° E · accuracy ±4 m', 'ok')
  }

  function submitVerification() {
    const n = checks.filter(Boolean).length
    if (n < 6) {
      toast('Checklist incomplete', `${6 - n} item${6 - n === 1 ? '' : 's'} still open. Complete the checklist before submitting.`, 'warn')
      return
    }
    if (!photos || !gps) {
      toast('Evidence missing', 'Attach at least one photograph and capture GPS before submitting.', 'warn')
      return
    }
    const h02 = HABS.find(x => x.id === 'H02')
    if (h02) h02.ver = 'Verified'
    toast('Verification submitted', `FV-0442 sent to the District Authority with ${photos} photos and a GPS fix.`, 'ok')
    go('approval')
  }

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 07 · field verification · task FV-0442</div>
          <h1 className="h-page">Field verification</h1>
          <p>The model flagged this habitation. Nothing moves until a person stands there and says whether the model was right.</p>
        </div>
        <span className={`chip c-${done === 6 ? 'low' : 'mod'}`}>{done} of 6 complete</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(300px,.9fr)' }}>
        {/* Left column */}
        <div>
          {/* Task brief */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header>
              <span className="h-sec">Task brief</span>
              <span className="chip c-crit">P1 — Immediate</span>
            </header>
            <div className="bd">
              <div className="kv"><span className="k">Habitation</span><span className="v">Tapovan Tok, Joshimath block</span></div>
              <div className="kv"><span className="k">Assigned to</span><span className="v">S. Bisht, Relocation Officer</span></div>
              <div className="kv"><span className="k">Raised</span><span className="v">3 days ago, automatically on risk gate</span></div>
              <div className="kv">
                <span className="k">Why flagged</span>
                <span className="v" style={{ fontWeight: 400, fontSize: '11.5px', textAlign: 'right', maxWidth: '60%' }}>
                  Rainfall 72 h + slope &gt; 30° + 2,870 exposed
                </span>
              </div>
              <div className="note warn" style={{ marginTop: 10 }}>
                Offline-first. The form saves on the handset and syncs when signal returns — this habitation has no coverage past the second bend.
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Checklist</span></header>
            <div className="bd">
              {CHECKLIST.map((c, i) => (
                <label
                  key={i}
                  className={`check ${checks[i] ? 'done' : ''}`}
                  onClick={e => { e.preventDefault(); toggleCheck(i) }}
                >
                  <input type="checkbox" checked={checks[i]} readOnly />
                  <div>
                    <div className="ct">{c[0]}</div>
                    <div className="cs">{c[1]}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div className="card">
            <header><span className="h-sec">Evidence</span></header>
            <div className="bd">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <button className="btn" onClick={addPhoto}>📷 Attach photo{photos ? ` (${photos})` : ''}</button>
                <button className={`btn ${gps ? 'ok' : ''}`} onClick={capGPS}>📍 {gps ? 'GPS captured' : 'Capture GPS'}</button>
              </div>

              {photos > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {Array.from({ length: photos }).map((_, i) => (
                    <div key={i} style={{ width: 74, height: 56, background: 'var(--panel3)', border: '1px solid var(--line2)', borderRadius: 'var(--r)', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--dim)' }}>
                      IMG_{String(i + 1).padStart(3, '0')}
                    </div>
                  ))}
                </div>
              )}

              {gps && (
                <div className="note acc" style={{ marginBottom: 10 }}>
                  30.4021° N, 79.5518° E · ±4 m · captured on device, timestamped
                </div>
              )}

              <label className="f">
                <span>Ground observation</span>
                <textarea
                  className="inp"
                  placeholder="What did you actually see? Note anything that contradicts the model."
                  defaultValue="Fresh tension cracks along the upper terrace, roughly 40 m of them. Two houses already vacated by residents. The lower approach road is intact but the culvert at km 3.2 is undercut."
                />
              </label>
              <button className="btn pri" style={{ width: '100%' }} onClick={submitVerification}>Submit verification</button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Model said vs ground said */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Model said vs ground said</span></header>
            <div className="bd">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 10 }}>
                <div style={{ padding: 10, border: '1px solid var(--accent-dim)', borderRadius: 'var(--r)', background: 'var(--accent-ink)' }}>
                  <div className="eyebrow" style={{ color: 'var(--accent)' }}>Model prediction</div>
                  <div className="num" style={{ fontSize: 27, fontWeight: 700, color: 'var(--accent)' }}>87</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>High risk, 86% confidence</div>
                </div>
                <div style={{ padding: 10, border: `1px solid ${done === 6 ? '#1E4A31' : 'var(--line)'}`, borderRadius: 'var(--r)', background: done === 6 ? 'var(--low-bg)' : 'var(--panel2)' }}>
                  <div className="eyebrow" style={{ color: done === 6 ? 'var(--low)' : 'var(--dim)' }}>Ground finding</div>
                  <div className="num" style={{ fontSize: 27, fontWeight: 700, color: done === 6 ? 'var(--low)' : 'var(--dim)' }}>
                    {done === 6 ? 'Confirmed' : '—'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                    {done === 6 ? 'Officer agrees, adds culvert damage' : 'Awaiting checklist'}
                  </div>
                </div>
              </div>

              {[
                ['Road condition', 'Model: degraded', 'Ground: passable, culvert undercut', 'mod'],
                ['Population', 'Model: 2,870', 'Ground: 2,912 present', 'low'],
                ['Hazard evidence', 'Model: inferred', 'Ground: cracks photographed', 'crit'],
                ['Shelter capacity', 'Model: 2,100', 'Ground: 1,980 habitable', 'mod'],
              ].map(([k, a, b, c]) => (
                <div key={k} style={{ padding: '7px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <b style={{ fontSize: 12 }}>{k}</b>
                    <span className={`chip c-${c}`}>
                      {c === 'low' ? 'Match' : c === 'mod' ? 'Minor gap' : 'Worse than modelled'}
                    </span>
                  </div>
                  <div className="num" style={{ fontSize: '10.5px', color: 'var(--dim)', marginTop: 2 }}>
                    {a} · {b}
                  </div>
                </div>
              ))}
              <div className="note acc" style={{ marginTop: 10 }}>
                Disagreements are the point. Every one is fed back as a training label, which is how the model stops being wrong in the same way twice.
              </div>
            </div>
          </div>

          {/* Open tasks */}
          <div className="card">
            <header><span className="h-sec">Open tasks</span></header>
            <div style={{ padding: 0 }}>
              {[
                ['FV-0442', 'Tapovan Tok', 'P1', 'In progress', 'mod'],
                ['FV-0443', 'Bhyundar', 'P2', 'Assigned', 'info'],
                ['FV-0444', 'Gauchar Khal', 'P2', 'Assigned', 'info'],
                ['FV-0439', 'Raini Gaon', 'P1', 'Submitted', 'low'],
              ].map(([id, n, p, st, c]) => (
                <div key={id} style={{ padding: '9px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{n}</div>
                    <div className="num" style={{ fontSize: '10.5px', color: 'var(--dim)' }}>{id} · {p}</div>
                  </div>
                  <span className={`chip c-${c}`}>{st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
