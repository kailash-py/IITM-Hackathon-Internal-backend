import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { band, bandName, bandColor, priColor, priBand, fmt, safeCap, overload, bottleneck } from '../risk.js';
import { HABS, CAPDET, SITES, TEAMS, AUDIT } from '../demoData.js';

const CENTER = [30.42, 79.45];

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

export default function Command({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const crit = HABS.filter(h => h.risk >= 85);
  const high = HABS.filter(h => h.risk >= 70 && h.risk < 85);
  const exposed = HABS.filter(h => h.risk >= 70).reduce((a, h) => a + h.pop, 0);
  const p1 = HABS.filter(h => h.pri === 'P1').reduce((a, h) => a + h.pop, 0);
  const avail = SITES.reduce((a, s) => a + (s.cap - s.used), 0);
  const top = [...HABS].sort((a, b) => b.risk - a.risk).slice(0, 5);

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Proactive mode · {emergency ? 'incident running in parallel' : 'no active incident'}</div>
          <h1 className="h-page">District command center</h1>
          <p>One district, ten habitations, one queue. The list on the right is ordered by what the model believes needs a decision first — not by how bad the weather looks.</p>
        </div>
        <button className="btn" onClick={() => go('reports')}>Generate district report</button>
        <button className="btn pri" onClick={() => go('priority')}>Open priority queue</button>
      </div>

      {emergency && (
        <div className="note crit" style={{ marginBottom: 12 }}>
          <b>INC-0091 · Flood · Raini Gaon · Critical.</b> 3,240 residents inside the hazard polygon.{' '}
          <button className="btn sm danger" style={{ marginLeft: 8 }} onClick={() => go('emergency')}>Open emergency console</button>
        </div>
      )}

      <div className="kpis" style={{ marginBottom: 12 }}>
        <div className="kpi" onClick={() => go('habitations')}>
          <div className="lb">Critical habitations</div>
          <div className="vl" style={{ color: 'var(--crit)' }}>{crit.length}</div>
          <div className="dl">of {HABS.length} assessed</div>
        </div>
        <div className="kpi" onClick={() => go('habitations')}>
          <div className="lb">High risk</div>
          <div className="vl" style={{ color: 'var(--high)' }}>{high.length}</div>
          <div className="dl">risk 70–84</div>
        </div>
        <div className="kpi" onClick={() => go('capacity')}>
          <div className="lb">Population exposed</div>
          <div className="vl">{fmt(exposed)}</div>
          <div className="dl">in high + critical zones</div>
        </div>
        <div className="kpi" onClick={() => go('priority')}>
          <div className="lb">P1 immediate relocation</div>
          <div className="vl" style={{ color: 'var(--crit)' }}>{fmt(p1)}</div>
          <div className="dl">people, 2 habitations</div>
        </div>
        <div className="kpi" onClick={() => go('safesites')}>
          <div className="lb">Safe-site capacity free</div>
          <div className="vl" style={{ color: 'var(--low)' }}>{fmt(avail)}</div>
          <div className="dl">across 4 verified sites</div>
        </div>
        <div className="kpi" onClick={() => go('emergency')}>
          <div className="lb">Active emergencies</div>
          <div className="vl" style={{ color: emergency ? 'var(--crit)' : 'inherit' }}>{emergency ? 1 : 0}</div>
          <div className="dl">{emergency ? 'INC-0091 flood' : 'none open'}</div>
        </div>
        <div className="kpi" onClick={() => go('rescue')}>
          <div className="lb">Rescue teams active</div>
          <div className="vl">
            {TEAMS.filter(t => t.st !== 'Available').length}
            <span style={{ fontSize: 14, color: 'var(--dim)' }}>/{TEAMS.length}</span>
          </div>
          <div className="dl">94 responders</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,2.3fr) minmax(270px,1fr)' }}>
        <div className="card">
          <header>
            <span className="h-sec">District risk map</span>
            <span className="eyebrow">Chamoli · updated 4 min ago</span>
          </header>
          <div style={{ padding: 1 }}>
            <div className="mapwrap" style={{ height: 442 }}>
              <MapContainer center={CENTER} zoom={10} style={{ height: '100%', width: '100%', background: '#0A1218' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {HABS.map(h => (
                  <CircleMarker
                    key={h.id}
                    center={[h.lat, h.lng]}
                    radius={6 + Math.min(7, h.pop / 900)}
                    pathOptions={{ fillColor: bandColor(h.risk), color: '#0A1218', weight: 2, fillOpacity: 0.85 }}
                    eventHandlers={{ click: () => { setSelHab(h.id); go('ai'); } }}
                  >
                    <Popup>
                      <strong>{h.n}</strong><br />
                      Risk: {h.risk} · Pop: {fmt(h.pop)}
                    </Popup>
                  </CircleMarker>
                ))}
                {SITES.map(s => (
                  <CircleMarker
                    key={s.id}
                    center={[s.lat, s.lng]}
                    radius={8}
                    pathOptions={{ fillColor: 'var(--low)', color: '#2E9E5B', weight: 2, fillOpacity: 0.7 }}
                  >
                    <Popup>
                      <strong>{s.n}</strong><br />
                      Capacity: {fmt(s.cap)} · Used: {fmt(s.used)}
                    </Popup>
                  </CircleMarker>
                ))}
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

        <div className="card" style={{ alignSelf: 'start' }}>
          <header>
            <span className="h-sec">Priority actions</span>
            <Chip cls="crit" txt="Act today" />
          </header>
          <div className="plist">
            {top.map((h, i) => {
              const ov = overload(h.pop, safeCap(CAPDET[h.id]));
              return (
                <div className="row" key={h.id} onClick={() => { setSelHab(h.id); go('ai'); }}>
                  <div className="idx">{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div className="nm">
                      {h.n} <Chip cls={priBand(h.pri)} txt={h.pri} />
                    </div>
                    <div className="mt">
                      Risk {h.risk} · {fmt(h.pop)} people · {ov > 0 ? `over capacity ${ov}%` : 'within capacity'}
                    </div>
                    <div className="mt" style={{ color: 'var(--dim)' }}>
                      {h.acc === 'Poor' ? 'Road access poor · ' : ''}Verification: {h.ver}
                    </div>
                  </div>
                  <div style={{ width: 44 }}><Meter v={h.risk} /></div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '9px 12px', borderTop: '1px solid var(--line)' }}>
            <button className="btn sm" style={{ width: '100%' }} onClick={() => go('priority')}>See all 10 in the priority engine</button>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', marginTop: 12 }}>
        <div className="card">
          <header><span className="h-sec">Where the district stands</span></header>
          <div className="bd">
            {[['Habitations assessed', '10 of 10'], ['Field verification complete', '1'], ['Verification in progress', '1'], ['Proposals awaiting approval', '1'], ['Approved relocations', '1'], ['Model confidence, district mean', '84%']].map(([k, v]) => (
              <div className="kv" key={k}><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        </div>

        <div className="card">
          <header><span className="h-sec">Data freshness</span></header>
          <div className="bd">
            {[['IMD rainfall', '12 min', 'var(--low)'], ['River gauge, Alaknanda', '8 min', 'var(--low)'], ['GSI susceptibility layer', '2025-Q4', 'var(--mod)'], ['Census population', '2011 + 2024 projection', 'var(--mod)'], ['OSM road network', '3 days', 'var(--low)'], ['Field verification', '1 h', 'var(--low)']].map(([k, v, c]) => (
              <div className="kv" key={k}><span className="k">{k}</span><span className="v" style={{ color: c }}>{v}</span></div>
            ))}
            <div className="note warn" style={{ marginTop: 9 }}>Two sources are stale by design in this demo. Anything older than a quarter is flagged, because a risk score built on old population data quietly misleads.</div>
          </div>
        </div>

        <div className="card">
          <header><span className="h-sec">Recent decisions</span></header>
          <div className="bd" style={{ padding: 0 }}>
            {AUDIT.slice(0, 5).map((a, i) => (
              <div key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="num" style={{ color: 'var(--dim)', fontSize: 11 }}>{a[0]}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--accent)' }}>{a[1]}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{a[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
