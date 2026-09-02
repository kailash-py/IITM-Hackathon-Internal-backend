import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import { band, bandColor, fmt } from '../risk.js';
import { HABS, SITES, TEAMS } from '../demoData.js';

const CENTER = [30.42, 79.45];
const RAINI = [30.4021, 79.5518];
const GOPESHWAR = [30.41, 79.33];
const ROUTE_B = [RAINI, [30.46, 79.48], [30.44, 79.42], GOPESHWAR];
const BLOCKED_SEG = [RAINI, [30.44, 79.50], [30.43, 79.46]];

const LOG = [
  ['13:41', 'Relocation RP-0117 approved by District Authority'],
  ['13:22', 'Field evidence FV-0439 submitted, 6 photos'],
  ['12:58', 'Composite risk recalculated 88 → 92'],
  ['12:40', 'SDRF-02 dispatched to INC-0091'],
  ['12:31', 'NH-7 marked blocked, routing recomputed for 3 missions'],
  ['11:42', 'Shelter intake opened at Karnaprayag ITI Ground'],
  ['11:18', 'Incident declared by Insp. Rawat'],
];

export default function Emergency({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [alertSent, setAlertSent] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  if (!emergency) {
    return (
      <>
        <div className="pagehead">
          <div className="grow">
            <div className="eyebrow">Reactive mode</div>
            <h1 className="h-page">Emergency console</h1>
            <p>No incident is open. The console stays quiet until one is declared, so that a red screen always means something.</p>
          </div>
        </div>
        <div className="card">
          <div className="bd" style={{ textAlign: 'center', padding: '44px 20px' }}>
            <div style={{ fontSize: 34, opacity: 0.35, marginBottom: 9 }}>▲</div>
            <h3 style={{ fontSize: 16, marginBottom: 5 }}>No active incident</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: '48ch', margin: '0 auto 16px' }}>
              Declaring an incident switches the whole console to emergency mode, unlocks dispatch and alerting, and starts the incident log.
            </p>
            <button className="btn danger" onClick={toggleEmergency}>Declare incident (demo)</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow" style={{ color: 'var(--crit)' }}>● Emergency active · INC-0091 · declared 11:18</div>
          <h1 className="h-page">Flood · Raini Gaon · Critical</h1>
          <p>Emergency actions do not wait for approval. The authority is informed in parallel, not asked first.</p>
        </div>
        <button className="btn" onClick={toggleEmergency}>Stand down</button>
      </div>

      <div className="kpis" style={{ marginBottom: 12 }}>
        <div className="kpi">
          <div className="lb">Rainfall, 24 h</div>
          <div className="vl" style={{ color: 'var(--crit)' }}>118<span style={{ fontSize: 14 }}>mm</span></div>
          <div className="dl">+34 mm in 3 h</div>
        </div>
        <div className="kpi">
          <div className="lb">River level</div>
          <div className="vl" style={{ color: 'var(--crit)' }}>+2.4<span style={{ fontSize: 14 }}>m</span></div>
          <div className="dl">danger mark +1.8 m</div>
        </div>
        <div className="kpi">
          <div className="lb">Population exposed</div>
          <div className="vl">3,240</div>
          <div className="dl">648 households</div>
        </div>
        <div className="kpi">
          <div className="lb">Roads blocked</div>
          <div className="vl" style={{ color: 'var(--high)' }}>1</div>
          <div className="dl">NH-7 Helang–Joshimath</div>
        </div>
        <div className="kpi">
          <div className="lb">Alert status</div>
          <div className="vl" style={{ fontSize: 19, color: alertSent ? 'var(--low)' : 'var(--mod)' }}>
            {alertSent ? 'SENT' : 'PENDING'}
          </div>
          <div className="dl">{alertSent ? '2,904 delivered' : 'not yet issued'}</div>
        </div>
        <div className="kpi">
          <div className="lb">Rescue status</div>
          <div className="vl" style={{ fontSize: 19, color: dispatched ? 'var(--accent)' : 'var(--mod)' }}>
            {dispatched ? 'EN ROUTE' : 'STANDBY'}
          </div>
          <div className="dl">{dispatched ? 'SDRF-02 · ETA 14 min' : 'no team dispatched'}</div>
        </div>
        <div className="kpi">
          <div className="lb">People registered safe</div>
          <div className="vl" style={{ color: 'var(--low)' }}>1,842</div>
          <div className="dl">at 2 shelters</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,2.2fr) minmax(270px,1fr)' }}>
        {/* Live incident map */}
        <div className="card">
          <header>
            <span className="h-sec">Live incident map</span>
            <span className="chip c-crit">INC-0091</span>
          </header>
          <div style={{ padding: 1 }}>
            <div className="mapwrap" style={{ height: 420 }}>
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
                <div><span className="sw" style={{ background: '#12291D', border: '1px solid var(--low)' }} />Safe site</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Actions + Log */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Actions</span></header>
            <div className="bd" style={{ display: 'grid', gap: 7 }}>
              <button className={`btn ${alertSent ? '' : 'danger'}`} onClick={() => { if (!alertSent) { setAlertSent(true); toast('Alert issued', '2,904 of 3,240 recipients reached across SMS, IVR, app push and two sirens.', 'crit'); } else { go('alerts'); } }}>
                {alertSent ? '✓ Alert issued — review' : 'Send geo-targeted alert'}
              </button>
              <button className={`btn ${dispatched ? '' : 'pri'}`} onClick={() => { if (!dispatched) { setDispatched(true); toast('Team dispatched', 'SDRF-02 assigned to INC-0091 via Route B. ETA 14 minutes.', 'ok'); } else { go('rescue'); } }}>
                {dispatched ? '✓ SDRF-02 dispatched — track' : 'Dispatch rescue team'}
              </button>
              <button className="btn" onClick={() => go('route')}>View hazard-aware route</button>
              <button className="btn" onClick={() => go('safesites')}>View safe site capacity</button>
              <button className="btn" onClick={() => go('family')}>Open family reunification grid</button>
              <button className="btn" onClick={() => go('reports')}>Start incident report</button>
            </div>
          </div>

          <div className="card">
            <header><span className="h-sec">Incident log</span></header>
            <div style={{ padding: 0, maxHeight: 230, overflow: 'auto' }}>
              {LOG.map(([t, m], i) => (
                <div key={i} style={{ padding: '7px 12px', borderBottom: '1px solid var(--line)' }}>
                  <span className="num" style={{ color: 'var(--dim)', fontSize: 11 }}>{t}</span>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
