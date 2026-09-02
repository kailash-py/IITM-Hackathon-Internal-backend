import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import { bandColor } from '../risk.js';
import { HABS, SITES, TEAMS } from '../demoData.js';

const CENTER = [30.42, 79.45];
const RAINI = [30.4021, 79.5518];
const GOPESHWAR = [30.41, 79.33];
const ROUTE_B = [RAINI, [30.46, 79.48], [30.44, 79.42], GOPESHWAR];
const BLOCKED_SEG = [RAINI, [30.44, 79.50], [30.43, 79.46]];

const INC_DETAILS = [
  ['Type', 'Flood'],
  ['Location', 'Raini Gaon, Joshimath'],
  ['Declared', '11:18'],
  ['People exposed', '3,240'],
  ['Nearest team', 'SDRF-02, 11.4 km'],
  ['Recommended route', 'Route B'],
  ['Road status', 'NH-7 blocked at km 4.1'],
  ['Nearest safe site', 'Gopeshwar, 2,800 free'],
];

const STEPS = ['Available', 'Dispatched', 'En route', 'On site', 'Completed'];

function statusChip(st) {
  const cls = st === 'Available' ? 'low' : st === 'On site' ? 'info' : 'mod';
  return <span className={`chip c-${cls}`}>{st}</span>;
}

export default function Rescue({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [dispatched, setDispatched] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(null);

  function handleDispatch() {
    setDispatched(true);
    setDispatchModal(null);
    toast('Team dispatched', 'SDRF-02 assigned to INC-0091 via Route B. ETA 14 minutes.', 'ok');
  }

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 10 · rescue</div>
          <h1 className="h-page">Rescue operations console</h1>
          <p>Built for someone standing in the rain with one hand free. Big targets, current status, and the route the system already knows is open.</p>
        </div>
        <span className={`chip c-${emergency ? 'crit' : 'mute'}`}>
          {emergency ? '1 active incident' : 'No active incident'}
        </span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)' }}>
        {/* Left column */}
        <div>
          {/* Operational map */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Operational picture</span></header>
            <div style={{ padding: 1 }}>
              <div className="mapwrap" style={{ height: 360 }}>
                <MapContainer center={CENTER} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  {HABS.map(h => (
                    <CircleMarker key={h.id} center={[h.lat, h.lng]} radius={7}
                      pathOptions={{ color: bandColor(h.risk), fillColor: bandColor(h.risk), fillOpacity: 0.85, weight: 1 }}>
                      <Popup><b>{h.n}</b><br />Risk {h.risk}</Popup>
                    </CircleMarker>
                  ))}
                  {SITES.map(s => (
                    <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={7}
                      pathOptions={{ color: '#00a8c6', fillColor: '#00a8c6', fillOpacity: 0.85, weight: 1 }}>
                      <Popup><b>{s.n}</b><br />{s.used}/{s.cap} occupied</Popup>
                    </CircleMarker>
                  ))}
                  {TEAMS.map(t => (
                    <CircleMarker key={t.id} center={[t.lat, t.lng]} radius={5}
                      pathOptions={{ color: '#b87cff', fillColor: '#b87cff', fillOpacity: 0.9, weight: 1 }}>
                      <Popup><b>{t.n}</b><br />{t.st}</Popup>
                    </CircleMarker>
                  ))}
                  <Polyline positions={BLOCKED_SEG} pathOptions={{ color: '#D93A3A', weight: 4, dashArray: '8 6' }} />
                  {dispatched && <Polyline positions={ROUTE_B} pathOptions={{ color: '#00C9DB', weight: 3, dashArray: '10 6' }} />}
                </MapContainer>
                <div className="maplegend">
                  <div><span className="sw" style={{ background: 'var(--crit)' }} />Critical 85+</div>
                  <div><span className="sw" style={{ background: 'var(--high)' }} />High 70–84</div>
                  <div><span className="sw" style={{ background: 'var(--mod)' }} />Moderate 50–69</div>
                  <div><span className="sw" style={{ background: 'var(--low)' }} />Low &lt;50</div>
                </div>
              </div>
            </div>
          </div>

          {/* Teams table */}
          <div className="card">
            <header><span className="h-sec">Teams</span></header>
            <div style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr><th>Team</th><th>Responders</th><th>Status</th><th>ETA</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {TEAMS.map(t => (
                    <tr key={t.id}>
                      <td>
                        <b>{t.n}</b>
                        <div className="num" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{t.id}</div>
                      </td>
                      <td className="n">{t.ppl}</td>
                      <td>{statusChip(t.st)}</td>
                      <td className="n">{t.eta === null ? '—' : `${t.eta} min`}</td>
                      <td>
                        {t.st === 'Available' ? (
                          <button className="btn sm pri" onClick={() => setDispatchModal(t)}>Dispatch</button>
                        ) : (
                          <button className="btn sm" onClick={() => toast('Status updated', `${t.id} marked as on site.`, 'ok')}>Update</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* INC-0091 detail */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header>
              <span className="h-sec">INC-0091</span>
              <span className="chip c-crit">Critical</span>
            </header>
            <div className="bd">
              {INC_DETAILS.map(([k, v]) => (
                <div className="kv" key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                </div>
              ))}
              <div style={{ display: 'grid', gap: 6, marginTop: 11 }}>
                <button className={`btn ${dispatched ? '' : 'pri'}`} onClick={() => go('route')}>View recommended route</button>
                <button className="btn" onClick={() => toast('Marked rescued', '24 people registered at Gopeshwar intake and linked to family IDs.', 'ok')}>Mark people rescued</button>
                <button className="btn" onClick={() => go('family')}>Open family grid</button>
              </div>
            </div>
          </div>

          {/* Mission status stepper */}
          <div className="card">
            <header><span className="h-sec">Mission status</span></header>
            <div className="bd">
              <div className="wf" style={{ flexDirection: 'column', margin: 0 }}>
                {STEPS.map((label, i) => {
                  let cls = '';
                  if (i === 0) cls = 'done';
                  else if (dispatched && i <= 2) cls = i === 2 ? 'cur' : 'done';

                  return (
                    <div key={label} className={`s ${cls}`}
                      style={{ borderRight: '1px solid var(--line)', borderBottom: 'none' }}>
                      <div className="n">{String(i + 1).padStart(2, '0')}</div>
                      <div className="t">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch confirmation modal */}
      {dispatchModal && (
        <div className="mask" onClick={() => setDispatchModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <header><span className="h-sec">Dispatch {dispatchModal.id}</span></header>
            <div className="bd">
              <div className="kv"><span className="k">Incident</span><span className="v">INC-0091 · Flood · Raini Gaon</span></div>
              <div className="kv"><span className="k">Distance</span><span className="v">11.4 km via Route B</span></div>
              <div className="kv"><span className="k">Estimated arrival</span><span className="v">14 minutes</span></div>
              <div className="kv"><span className="k">Route A status</span><span className="v" style={{ color: 'var(--crit)' }}>Blocked, debris at km 4.1</span></div>
              <div className="note acc" style={{ marginTop: 11 }}>
                Route B is 3.1 km longer and avoids two slope-failure segments flagged in the last 6 hours.
              </div>
            </div>
            <footer style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 14px' }}>
              <button className="btn" onClick={() => setDispatchModal(null)}>Cancel</button>
              <button className="btn pri" onClick={handleDispatch}>Dispatch now</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
