import { useState } from 'react';
import { fmt } from '../risk.js';
import { SITES, FAMILIES } from '../demoData.js';

export default function Citizen({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [tab, setTab] = useState('home');

  const f = FAMILIES[0];

  const homeTab = (
    <>
      <div className="ph-h">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', color: '#5B6B7C' }}>CURRENT LOCATION</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>Raini Gaon</div>
        <div style={{ fontSize: 12, color: '#5B6B7C' }}>Joshimath, Chamoli</div>
      </div>
      <div className="ph-sec">
        <div style={{ background: '#C22B2B', color: '#fff', borderRadius: 9, padding: 15, marginBottom: 11 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.12em', opacity: 0.85 }}>YOUR RISK RIGHT NOW</div>
          <div style={{ fontSize: 27, fontWeight: 800, margin: '2px 0 5px' }}>CRITICAL</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>Flood risk is rising near you. Move to Gopeshwar Relief Campus now. Do not use the Helang road.</div>
        </div>
        <button className="ph-btn pri" onClick={() => setTab('route')}>View safe route</button>
        <button className="ph-btn" onClick={() => setTab('shelter')}>Nearest safe shelter</button>
        <button className="ph-btn" onClick={() => setTab('family')}>Family status · {f.found} of {f.size} safe</button>
        <button className="ph-btn sos" onClick={() => toast('SOS sent', 'Location and household ID sent to Chamoli DDMA and SDRF-02. Stay where you are if it is safe.', 'crit')}>
          SOS · SEND MY LOCATION
        </button>
        <button className="ph-btn" onClick={() => toast('Calling', 'Dialling district emergency line 1077.')}>Emergency contact · 1077</button>
      </div>
    </>
  );

  const routeTab = (
    <>
      <div className="ph-h">
        <div style={{ fontSize: 16, fontWeight: 700 }}>Safe route</div>
        <div style={{ fontSize: 12, color: '#5B6B7C' }}>To Gopeshwar Relief Campus</div>
      </div>
      <div className="ph-sec">
        <div className="ph-card" style={{ borderColor: '#C22B2B', background: '#FDF1F1' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: '#C22B2B', letterSpacing: '.1em' }}>ROUTE A · DO NOT USE</div>
          <div style={{ fontWeight: 700, margin: '2px 0' }}>Helang road · 8.3 km</div>
          <div style={{ fontSize: 12.5, color: '#7A5555' }}>Blocked by debris since 12:31.</div>
        </div>
        <div className="ph-card" style={{ borderColor: '#00758B', background: '#EFF8FA' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: '#00758B', letterSpacing: '.1em' }}>ROUTE B · TAKE THIS ONE</div>
          <div style={{ fontWeight: 700, margin: '2px 0' }}>Tapovan road · 11.4 km · 31 min</div>
          <div style={{ fontSize: 12.5, color: '#4A6570' }}>Metalled the whole way, above the flood line.</div>
        </div>
        <div className="ph-card" style={{ padding: 0, overflow: 'hidden', height: 186, background: '#0A1218' }}>
          <svg viewBox="0 0 320 186" style={{ width: '100%', height: '100%' }}>
            <rect width="320" height="186" fill="#0A1218" />
            <text x="160" y="93" fill="#5B6B7C" textAnchor="middle" fontSize="12">Map placeholder</text>
          </svg>
        </div>
        <button className="ph-btn pri" onClick={() => toast('Navigation started', 'Turn-by-turn guidance would open here.')}>Start walking directions</button>
      </div>
    </>
  );

  const shelterTab = (
    <>
      <div className="ph-h">
        <div style={{ fontSize: 16, fontWeight: 700 }}>Nearest safe shelter</div>
        <div style={{ fontSize: 12, color: '#5B6B7C' }}>Verified and with room today</div>
      </div>
      <div className="ph-sec">
        {SITES.slice(0, 3).map((s, i) => (
          <div
            className="ph-card"
            key={s.id}
            style={i === 0 ? { borderColor: '#1E7A4A', background: '#F0FAF4' } : undefined}
          >
            {i === 0 && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: '#1E7A4A', letterSpacing: '.1em' }}>RECOMMENDED</div>
            )}
            <div style={{ fontWeight: 700, margin: '2px 0' }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: '#5B6B7C' }}>
              {s.dist} km · {fmt(s.cap - s.used)} places free · health centre {s.health} km
            </div>
            <div style={{ height: 5, background: '#DDE4EC', borderRadius: 3, marginTop: 7 }}>
              <div style={{
                height: '100%',
                width: `${(s.used / s.cap) * 100}%`,
                background: s.used / s.cap > 0.55 ? '#D9822B' : '#1E7A4A',
                borderRadius: 3,
              }} />
            </div>
          </div>
        ))}
        <button className="ph-btn pri" onClick={() => setTab('route')}>Get directions</button>
      </div>
    </>
  );

  const familyTab = (
    <>
      <div className="ph-h">
        <div style={{ fontSize: 16, fontWeight: 700 }}>My family</div>
        <div style={{ fontSize: 12, color: '#5B6B7C' }}>Family ID {f.id} · {f.found} of {f.size} accounted for</div>
      </div>
      <div className="ph-sec">
        {f.members.map((m, i) => (
          <div className="ph-card" key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 11 }}>
            <div style={{
              width: 29, height: 29, borderRadius: '50%',
              background: m.st === 'Safe' ? '#E4F5EB' : '#FDECEC',
              color: m.st === 'Safe' ? '#1E7A4A' : '#C22B2B',
              display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13,
            }}>
              {m.st === 'Safe' ? '✓' : '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.n}</div>
              <div style={{ fontSize: 11.5, color: '#5B6B7C' }}>{m.st === 'Safe' ? m.loc : 'Reported missing'}</div>
            </div>
          </div>
        ))}
        {f.match && (
          <div className="ph-card" style={{ borderColor: '#D9822B', background: '#FDF6EC' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: '#8A5A16', letterSpacing: '.1em' }}>POSSIBLE MATCH FOUND</div>
            <div style={{ fontSize: 12.5, marginTop: 4, lineHeight: 1.5 }}>
              Someone matching Rahul's description was registered at Karnaprayag ITI Ground. Shelter staff are confirming identity before we contact you.
            </div>
          </div>
        )}
        <button className="ph-btn" onClick={() => toast('Report filed', 'Missing person report updated and sent to the district register.', 'ok')}>
          Update missing report
        </button>
      </div>
    </>
  );

  const bodies = { home: homeTab, route: routeTab, shelter: shelterTab, family: familyTab };

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Citizen experience</div>
          <h1 className="h-page">Citizen app</h1>
          <p>The person holding this phone is frightened, possibly in the dark, and on one bar of signal. Four buttons, one instruction, no dashboard.</p>
        </div>
      </div>

      <div className="phonewrap">
        <div className="phone">
          <div className="pbar">
            <span>9:41</span>
            <span>SAMPARK</span>
            <span>▂▄ 42%</span>
          </div>
          <div className="pbody">
            {bodies[tab]}
          </div>
          <div className="ph-nav">
            {[['home', 'Home'], ['route', 'Route'], ['shelter', 'Shelter'], ['family', 'Family']].map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 270 }}>
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Design constraints we accepted</span></header>
            <div className="bd">
              {[
                ['One instruction per screen', 'A frightened person will not read a paragraph or compare options.'],
                ['Works on a feature phone too', 'Everything here also exists as SMS and an IVR menu, because 336 households have no smartphone.'],
                ['No risk score shown', '"92" means nothing to a resident. "Move now, use this road" does.'],
                ['Family status is on the home screen', 'It is the first thing anyone asks, and it stops people walking back into the hazard to look.'],
                ['SOS never needs a login', 'If the app is open, the button works.'],
              ].map(([k, v], i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px dashed var(--line)' }}>
                  <b style={{ fontSize: 12.5 }}>{k}</b>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="note acc">
            Accessibility: minimum 14 px body text, 44 px touch targets, contrast above 4.5:1, and every colour cue paired with a word — because red and green are the two colours colour-blind users most often confuse, and this is not a screen to get wrong.
          </div>
        </div>
      </div>
    </>
  );
}
