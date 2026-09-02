import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { band, bandName, bandColor, priColor, priBand, fmt, safeCap } from '../risk.js';
import { HABS, CAPDET, SITES, TEAMS } from '../demoData.js';

const CENTER = [30.42, 79.45];

const Chip = ({ cls, txt }) => (
  <span className={`chip c-${cls}`}>{txt}</span>
);

export default function RiskMap({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const h = HABS.find(x => x.id === selHab) || HABS[0];

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 01 · hazard data</div>
          <h1 className="h-page">Risk map</h1>
          <p>Every layer that feeds the risk model, drawn on one surface. Click a habitation to load it into the rest of the workflow.</p>
        </div>
        <button className="btn" onClick={() => go('hazards')}>Break down by hazard</button>
        <button className="btn pri" onClick={() => go('ai')}>Explain {h.n}</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,2.6fr) minmax(250px,1fr)' }}>
        <div className="mapwrap" style={{ height: 540 }}>
          <MapContainer center={CENTER} zoom={10} style={{ height: '100%', width: '100%', background: '#0A1218' }} zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {HABS.map(hab => (
              <CircleMarker
                key={hab.id}
                center={[hab.lat, hab.lng]}
                radius={6 + Math.min(7, hab.pop / 900)}
                pathOptions={{
                  fillColor: bandColor(hab.risk),
                  color: hab.id === selHab ? '#fff' : '#0A1218',
                  weight: hab.id === selHab ? 2.5 : 2,
                  fillOpacity: 0.85
                }}
                eventHandlers={{
                  click: () => { setSelHab(hab.id); }
                }}
              >
                <Popup>
                  <strong>{hab.n}</strong><br />
                  Risk: {hab.risk} · Pop: {fmt(hab.pop)}
                </Popup>
              </CircleMarker>
            ))}
            {SITES.map(s => (
              <CircleMarker
                key={s.id}
                center={[s.lat, s.lng]}
                radius={8}
                pathOptions={{ fillColor: '#2E9E5B', color: '#12291D', weight: 2, fillOpacity: 0.7 }}
              >
                <Popup>
                  <strong>{s.n}</strong><br />
                  Cap: {fmt(s.cap)} · Used: {fmt(s.used)}
                </Popup>
              </CircleMarker>
            ))}
            {(emergency || role === 'rescue') && TEAMS.map(t => {
              const col = t.st === 'Available' ? '#2E9E5B' : t.st === 'On site' ? '#00A8C6' : '#D9A404';
              return (
                <CircleMarker
                  key={t.id}
                  center={[t.lat, t.lng]}
                  radius={7}
                  pathOptions={{ fillColor: col, color: col, weight: 2, fillOpacity: 0.8 }}
                >
                  <Popup>
                    <strong>{t.n}</strong><br />
                    Status: {t.st} · {t.ppl} personnel
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          <div className="maplegend">
            <div><span className="sw" style={{ background: 'var(--crit)' }} />Critical 85+</div>
            <div><span className="sw" style={{ background: 'var(--high)' }} />High 70–84</div>
            <div><span className="sw" style={{ background: 'var(--mod)' }} />Moderate 50–69</div>
            <div><span className="sw" style={{ background: 'var(--low)' }} />Low &lt;50</div>
            <div><span className="sw" style={{ background: '#12291D', border: '1px solid var(--low)' }} />Safe site</div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <header>
              <span className="h-sec">{h.n}</span>
              <Chip cls={band(h.risk)} txt={bandName(h.risk)} />
            </header>
            <div className="bd">
              <div className="kv"><span className="k">Block</span><span className="v">{h.blk}</span></div>
              <div className="kv"><span className="k">Population</span><span className="v">{fmt(h.pop)}</span></div>
              <div className="kv"><span className="k">Composite risk</span><span className="v" style={{ color: bandColor(h.risk) }}>{h.risk}</span></div>
              <div className="kv"><span className="k">Safe capacity</span><span className="v">{fmt(safeCap(CAPDET[h.id]))}</span></div>
              <div className="kv"><span className="k">Relocation priority</span><span className="v" style={{ color: priColor(h.pri) }}>{h.pri}</span></div>
              <div className="kv"><span className="k">Road access</span><span className="v">{h.acc}</span></div>
              <button className="btn pri sm" style={{ width: '100%', marginTop: 10 }} onClick={() => go('ai')}>Open intelligence profile</button>
            </div>
          </div>

          <div className="card">
            <header><span className="h-sec">Layers on this map</span></header>
            <div className="bd">
              {[
                ['Hazard polygons', 'Composite risk band, GSI + IMD derived'],
                ['Road network', 'OSM, with live blockage reports'],
                ['Alaknanda channel', 'Survey of India drainage'],
                ['Verified safe sites', 'Capacity-checked, district register'],
                ['Rescue teams', 'Live only during an incident']
              ].map(([a, b]) => (
                <div key={a} style={{ padding: '6px 0', borderBottom: '1px dashed var(--line)' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
