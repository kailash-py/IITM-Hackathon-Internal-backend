import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { bandColor } from '../risk.js';
import { HABS, SITES } from '../demoData.js';

const CENTER = [30.42, 79.45];
const RAINI = [30.4021, 79.5518];
const GOPESHWAR = [30.41, 79.33];

const ROUTE_A_PTS = [
  RAINI,
  [30.42, 79.52],
  [30.43, 79.48],
  [30.43, 79.44],
  [30.42, 79.40],
  GOPESHWAR,
];

const ROUTE_B_PTS = [
  RAINI,
  [30.46, 79.54],
  [30.48, 79.50],
  [30.47, 79.46],
  [30.45, 79.42],
  [30.44, 79.38],
  GOPESHWAR,
];

const SEGMENTS = [
  ['Tapovan bend', 'Low', 'var(--low)'],
  ['Km 3.2 culvert', 'Moderate — undercut', 'var(--mod)'],
  ['Helang straight', 'Blocked', 'var(--crit)'],
  ['Upper bypass', 'Low', 'var(--low)'],
  ['Gopeshwar approach', 'Low', 'var(--low)'],
];

export default function Route({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Hazard-aware routing</div>
          <h1 className="h-page">Safe route</h1>
          <p>The shortest road is not the safe road. Routing weights each segment by live blockage reports and slope-failure risk, then re-solves.</p>
        </div>
        <button className="btn pri" onClick={() => toast('Route shared', 'Route B pushed to SDRF-02 handset and to 842 citizen devices in the polygon.', 'ok')}>
          Share route
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(280px,1fr)' }}>
        {/* Map */}
        <div className="card">
          <header><span className="h-sec">Raini Gaon → Gopeshwar Relief Campus</span></header>
          <div style={{ padding: 1 }}>
            <div className="mapwrap" style={{ height: 440 }}>
              <MapContainer center={CENTER} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {HABS.map(h => (
                  <CircleMarker key={h.id} center={[h.lat, h.lng]} radius={6}
                    pathOptions={{ color: bandColor(h.risk), fillColor: bandColor(h.risk), fillOpacity: 0.7, weight: 1 }}>
                    <Popup><b>{h.n}</b><br />Risk {h.risk}</Popup>
                  </CircleMarker>
                ))}
                {SITES.map(s => (
                  <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={6}
                    pathOptions={{ color: '#00a8c6', fillColor: '#00a8c6', fillOpacity: 0.85, weight: 1 }}>
                    <Popup><b>{s.n}</b><br />{s.used}/{s.cap}</Popup>
                  </CircleMarker>
                ))}
                {/* Route A — blocked, red dashed */}
                <Polyline positions={ROUTE_A_PTS} pathOptions={{ color: '#D93A3A', weight: 4, dashArray: '10 8', opacity: 0.8 }} />
                {/* Route B — recommended, cyan animated dashed */}
                <Polyline positions={ROUTE_B_PTS} pathOptions={{ color: '#00C9DB', weight: 4, dashArray: '12 8', opacity: 0.9 }} />
                {/* Start marker */}
                <CircleMarker center={RAINI} radius={9}
                  pathOptions={{ color: '#D93A3A', fillColor: '#D93A3A', fillOpacity: 1, weight: 2 }}>
                  <Popup><b>Raini Gaon</b><br />Origin</Popup>
                </CircleMarker>
                {/* End marker */}
                <CircleMarker center={GOPESHWAR} radius={9}
                  pathOptions={{ color: '#00a8c6', fillColor: '#00a8c6', fillOpacity: 1, weight: 2 }}>
                  <Popup><b>Gopeshwar Relief Campus</b><br />Destination</Popup>
                </CircleMarker>
              </MapContainer>
              <div className="maplegend">
                <div><span className="sw" style={{ background: '#D93A3A' }} />Route A (blocked)</div>
                <div><span className="sw" style={{ background: '#00C9DB' }} />Route B (recommended)</div>
                <div><span className="sw" style={{ background: '#00a8c6' }} />Safe site</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — route cards + segment risk */}
        <div>
          {/* Route A */}
          <div className="card" style={{ marginBottom: 12, borderColor: '#5C1F22' }}>
            <header style={{ background: 'var(--crit-bg)' }}>
              <span className="h-sec" style={{ color: '#FF8080' }}>Route A</span>
              <span className="chip c-crit">Blocked</span>
            </header>
            <div className="bd">
              <div className="kv"><span className="k">Distance</span><span className="v">8.3 km</span></div>
              <div className="kv"><span className="k">Normal time</span><span className="v">22 min</span></div>
              <div className="kv"><span className="k">Status</span><span className="v" style={{ color: 'var(--crit)' }}>Impassable</span></div>
              <div className="note crit" style={{ marginTop: 9 }}>
                Debris across NH-7 at km 4.1, reported by SDRF-02 at 12:31. Two further segments sit inside an active slope-failure polygon.
              </div>
            </div>
          </div>

          {/* Route B */}
          <div className="card" style={{ marginBottom: 12, borderColor: 'var(--accent-dim)' }}>
            <header style={{ background: 'var(--accent-ink)' }}>
              <span className="h-sec" style={{ color: 'var(--accent)' }}>Route B</span>
              <span className="chip c-info">Recommended</span>
            </header>
            <div className="bd">
              <div className="kv"><span className="k">Distance</span><span className="v">11.4 km</span></div>
              <div className="kv"><span className="k">Estimated time</span><span className="v">31 min</span></div>
              <div className="kv"><span className="k">Hazard exposure</span><span className="v" style={{ color: 'var(--low)' }}>Low, 0.4 km in amber zone</span></div>
              <div className="kv"><span className="k">Surface</span><span className="v">Metalled throughout</span></div>
              <div className="kv"><span className="k">Last verified</span><span className="v">12:38, SDRF-05</span></div>
              <div className="note acc" style={{ marginTop: 9 }}>
                Three kilometres longer and nine minutes slower. It avoids both failure segments and stays above the flood line for its whole length.
              </div>
            </div>
          </div>

          {/* Segment risk */}
          <div className="card">
            <header><span className="h-sec">Segment risk</span></header>
            <div className="bd">
              {SEGMENTS.map(([k, v, c]) => (
                <div className="kv" key={k}>
                  <span className="k">{k}</span>
                  <span className="v" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
