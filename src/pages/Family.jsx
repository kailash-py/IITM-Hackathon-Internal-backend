import { useState } from 'react';
import { FAMILIES, SITES } from '../demoData.js';

function site(id) {
  return SITES.find(s => s.id === id) || { n: id };
}

export default function Family({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [families, setFamilies] = useState(() => FAMILIES.map(f => ({
    ...f,
    members: f.members.map(m => ({ ...m })),
    match: f.match ? { ...f.match } : null,
  })));
  const [registerModal, setRegisterModal] = useState(false);
  const [missingModal, setMissingModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(null);

  const tot = families.reduce((a, f) => a + f.size, 0);
  const found = families.reduce((a, f) => a + f.found, 0);
  const matchCount = families.filter(f => f.match).length;

  function verifyMatch(fid) {
    setFamilies(prev => prev.map(f => {
      if (f.id !== fid) return f;
      const updated = {
        ...f,
        members: f.members.map(m => {
          if (m.st === 'Missing' && f.match && f.match.conf > 90) {
            return { ...m, st: 'Safe', loc: f.match.at };
          }
          return m;
        }),
        match: null,
      };
      updated.found = updated.members.filter(m => m.st === 'Safe').length;
      return updated;
    }));
    setVerifyModal(null);
    toast('Match verified', `Identity confirmed by two shelter staff. Family ${fid} marked reunited.`, 'ok');
  }

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 11 · reunite</div>
          <h1 className="h-page">Family reunification</h1>
          <p>People get separated at the shelter door, not in the water. This is a coordination layer over shelter registers — it does not replace IFRC Restoring Family Links or any statutory tracing process.</p>
        </div>
        <button className="btn" onClick={() => setRegisterModal(true)}>Register person</button>
        <button className="btn pri" onClick={() => setMissingModal(true)}>Report missing</button>
      </div>

      <div className="kpis" style={{ marginBottom: 12 }}>
        <div className="kpi">
          <div className="lb">Families tracked</div>
          <div className="vl">{families.length}</div>
          <div className="dl">{tot} people</div>
        </div>
        <div className="kpi">
          <div className="lb">Accounted for</div>
          <div className="vl" style={{ color: 'var(--low)' }}>{found}</div>
          <div className="dl">registered at a shelter</div>
        </div>
        <div className="kpi">
          <div className="lb">Still missing</div>
          <div className="vl" style={{ color: 'var(--crit)' }}>{tot - found}</div>
          <div className="dl">open reports</div>
        </div>
        <div className="kpi">
          <div className="lb">Awaiting verification</div>
          <div className="vl" style={{ color: 'var(--mod)' }}>{matchCount}</div>
          <div className="dl">possible matches</div>
        </div>
        <div className="kpi">
          <div className="lb">Registered safe today</div>
          <div className="vl" style={{ color: 'var(--low)' }}>1,842</div>
          <div className="dl">across 2 shelters</div>
        </div>
      </div>

      <div className="note warn" style={{ marginBottom: 12 }}>
        A wrong match is worse than no match. The system proposes; two shelter staff confirm identity in person before any family is contacted. Nothing here auto-notifies a relative.
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))' }}>
        {families.map(f => (
          <div className="card" key={f.id}>
            <header>
              <span className="h-sec">Family {f.id}</span>
              {f.found === f.size
                ? <span className="chip c-low">Reunited</span>
                : <span className="chip c-crit">{f.size - f.found} missing</span>}
              <div style={{ flex: 1 }} />
              <span className="num" style={{ color: 'var(--dim)', fontSize: 11 }}>{f.found}/{f.size}</span>
            </header>
            <div className="bd">
              <div className="bar" style={{ marginBottom: 10 }}>
                <i style={{ width: `${(f.found / f.size) * 100}%`, background: f.found === f.size ? 'var(--low)' : 'var(--mod)' }} />
              </div>

              {f.members.map((m, mi) => (
                <div key={mi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div style={{
                    width: 23, height: 23, borderRadius: '50%',
                    background: m.st === 'Safe' ? 'var(--low-bg)' : 'var(--crit-bg)',
                    color: m.st === 'Safe' ? 'var(--low)' : '#FF8080',
                    display: 'grid', placeItems: 'center', fontSize: 10, flex: 'none',
                  }}>
                    {m.st === 'Safe' ? '✓' : '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {m.n}<span style={{ color: 'var(--dim)', fontWeight: 400 }}> · {m.a}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.loc}</div>
                  </div>
                </div>
              ))}

              {f.match ? (
                <div style={{ marginTop: 10, padding: 10, border: '1px solid var(--mod)', borderRadius: 'var(--r)', background: 'var(--mod-bg)' }}>
                  <div className="eyebrow" style={{ color: 'var(--mod)' }}>Possible match · {f.match.conf}% confidence</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, margin: '3px 0' }}>{f.match.n}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>At {f.match.at} · {f.match.by}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
                    <button className="btn sm ok" onClick={() => setVerifyModal(f)}>Verify</button>
                    <button className="btn sm" onClick={() => toast('Contact requested', `Shelter coordinator at ${f.match.at} notified to arrange contact.`, 'ok')}>Contact</button>
                  </div>
                </div>
              ) : f.found === f.size ? (
                <div className="note acc" style={{ marginTop: 10 }}>All members accounted for at {site(f.shelter).n}.</div>
              ) : (
                <div className="note" style={{ marginTop: 10 }}>No candidate above the 60% threshold yet. Report stays open.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Register person modal */}
      {registerModal && (
        <div className="mask" onClick={() => setRegisterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <header><span className="h-sec">Register a person</span></header>
            <div className="bd">
              <label className="f"><span>Full name</span><input className="inp" /></label>
              <label className="f"><span>Approximate age</span><input className="inp" type="number" /></label>
              <label className="f">
                <span>Shelter</span>
                <select className="inp">
                  <option>Gopeshwar Relief Campus</option>
                  <option>Karnaprayag ITI Ground</option>
                </select>
              </label>
              <label className="f"><span>Family ID, if known</span><input className="inp" placeholder="F102" /></label>
              <div className="note warn">Collect the minimum needed to reunite. Names and shelter location only — no identity numbers, no photographs of minors.</div>
            </div>
            <footer style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 14px' }}>
              <button className="btn" onClick={() => setRegisterModal(false)}>Cancel</button>
              <button className="btn pri" onClick={() => { setRegisterModal(false); toast('Person registered', 'Record created and screened against 3 open missing-person reports.', 'ok'); }}>Register</button>
            </footer>
          </div>
        </div>
      )}

      {/* Report missing modal */}
      {missingModal && (
        <div className="mask" onClick={() => setMissingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <header><span className="h-sec">Report someone missing</span></header>
            <div className="bd">
              <label className="f"><span>Name of missing person</span><input className="inp" /></label>
              <label className="f"><span>Last seen</span><input className="inp" placeholder="Location and time" /></label>
              <label className="f"><span>Reported by</span><input className="inp" /></label>
            </div>
            <footer style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 14px' }}>
              <button className="btn" onClick={() => setMissingModal(false)}>Cancel</button>
              <button className="btn pri" onClick={() => { setMissingModal(false); toast('Report filed', 'Screened against 1,842 registered persons. No match above 60% yet.', 'warn'); }}>File report</button>
            </footer>
          </div>
        </div>
      )}

      {/* Verify match modal */}
      {verifyModal && (
        <div className="mask" onClick={() => setVerifyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <header><span className="h-sec">Verify identity</span></header>
            <div className="bd">
              <p style={{ fontSize: 13 }}>Match confidence <b>{verifyModal.match.conf}%</b> for {verifyModal.match.n}.</p>
              <div className="note warn" style={{ marginTop: 10 }}>
                Confirm only after two shelter staff have identified the person face to face. A false positive tells a family their relative is alive when they are not.
              </div>
            </div>
            <footer style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 14px' }}>
              <button className="btn" onClick={() => setVerifyModal(null)}>Cancel</button>
              <button className="btn ok" onClick={() => verifyMatch(verifyModal.id)}>Confirm identity</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
