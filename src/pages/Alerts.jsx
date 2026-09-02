import { useState } from 'react';
import { fmt } from '../risk.js';

const LANGS = ['Hindi', 'Garhwali', 'English', 'Nepali'];
const CHANNELS = [
  ['SMS', '2,904 numbers'],
  ['IVR call', '1,180 landlines'],
  ['App push', '842 devices'],
  ['Siren relay', '2 village units'],
  ['Cell broadcast', 'pending NDMA tie-in'],
];

const DELIVERY = [
  { ch: 'SMS', num: '2,904 / 3,240', pct: 90, col: 'var(--low)' },
  { ch: 'IVR call', num: '1,061 / 1,180', pct: 90, col: 'var(--low)' },
  { ch: 'App push', num: '842 / 842', pct: 100, col: 'var(--low)' },
  { ch: 'Siren relay', num: '2 / 2 units', pct: 100, col: 'var(--low)' },
];

const HISTORY = [
  ['12:04', 'Moderate', 'Joshimath block', 'Stay alert, rainfall rising'],
  ['09:20', 'Moderate', 'Ghat block', 'River level watch'],
  ['Yesterday', 'High', 'Raini Gaon', 'Prepare to move'],
];

export default function Alerts({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [alertSent, setAlertSent] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    setAlertSent(true);
    setConfirming(false);
    toast('Alert issued', '2,904 of 3,240 recipients reached across SMS, IVR, app push and two sirens.', 'crit');
  }

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 09 · warn</div>
          <h1 className="h-page">Geo-targeted alerts</h1>
          <p>An alert that says "be careful" wastes the only attention you will get. Every message here carries one instruction and one destination.</p>
        </div>
        {alertSent
          ? <span className="chip c-low">Issued 12:34</span>
          : <span className="chip c-mute">Draft</span>}
      </div>

      <div className="note acc" style={{ marginBottom: 12 }}>
        SAMPARK does not replace NDMA SACHET or IMD bulletins. Those remain the authoritative national warning channel. This is district-level, polygon-scoped messaging that carries the route and shelter our own system computed.
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.1fr) minmax(300px,.85fr)' }}>
        {/* Compose alert */}
        <div className="card">
          <header><span className="h-sec">Compose alert</span></header>
          <div className="bd">
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <label className="f">
                <span>Hazard</span>
                <select className="inp">
                  <option>Flood</option>
                  <option>Landslide</option>
                  <option>Cloudburst</option>
                </select>
              </label>
              <label className="f">
                <span>Severity</span>
                <select className="inp">
                  <option>Critical — evacuate now</option>
                  <option>High — prepare to move</option>
                  <option>Moderate — stay alert</option>
                </select>
              </label>
            </div>
            <label className="f">
              <span>Affected area</span>
              <select className="inp">
                <option>Raini Gaon hazard polygon (3,240 people)</option>
                <option>Joshimath block, all habitations</option>
                <option>Custom polygon on map</option>
              </select>
            </label>
            <label className="f">
              <span>Message</span>
              <textarea className="inp" style={{ minHeight: 78 }} defaultValue="Flood risk is critical in your area. Move now to Gopeshwar Relief Campus using the Tapovan road. Do not use the Helang road — it is blocked. Tap the link for a live route." />
            </label>
            <label className="f">
              <span>Languages</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {LANGS.map((l, i) => (
                  <span key={l} className={`chip ${i < 3 ? 'c-info' : 'c-mute'}`}>{l}</span>
                ))}
              </div>
            </label>
            <label className="f">
              <span>Channels</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CHANNELS.map(([ch, desc], i) => (
                  <span key={ch} className={`chip ${i < 4 ? 'c-info' : 'c-mute'}`}>{ch} · {desc}</span>
                ))}
              </div>
            </label>
            <button
              className="btn danger"
              style={{ width: '100%', padding: 10 }}
              disabled={alertSent}
              onClick={() => setConfirming(true)}
            >
              {alertSent ? 'Alert already issued' : 'Issue alert'}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Recipient preview */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Recipient preview</span></header>
            <div className="bd">
              <div style={{ background: '#F2F5F8', color: '#16202B', borderRadius: 9, padding: 13 }}>
                <div style={{ background: '#C22B2B', color: '#fff', padding: '8px 11px', borderRadius: 6, fontWeight: 700, fontSize: 13.5, marginBottom: 9 }}>
                  🚨 CRITICAL FLOOD ALERT
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.55 }}>
                  Flood risk is critical in your area. Move now to <b>Gopeshwar Relief Campus</b> using the Tapovan road. Do not use the Helang road — it is blocked.
                </p>
                <div style={{ background: '#00758B', color: '#fff', textAlign: 'center', padding: 10, borderRadius: 6, fontWeight: 700, fontSize: 13, marginTop: 10 }}>
                  VIEW SAFE ROUTE
                </div>
                <div style={{ fontSize: 10.5, color: '#5B6B7C', marginTop: 8, fontFamily: 'var(--mono)' }}>
                  SAMPARK · Chamoli DDMA · 12:34 · demo
                </div>
              </div>
            </div>
          </div>

          {alertSent ? (
            /* Delivery stats */
            <div className="card">
              <header>
                <span className="h-sec">Delivery</span>
                <span className="chip c-low">Complete</span>
              </header>
              <div className="bd">
                {DELIVERY.map(d => (
                  <div key={d.ch} style={{ marginBottom: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span>{d.ch}</span>
                      <span className="num" style={{ color: d.col }}>{d.num}</span>
                    </div>
                    <div className="bar" style={{ marginTop: 3 }}>
                      <i style={{ width: `${d.pct}%`, background: d.col }} />
                    </div>
                  </div>
                ))}
                <div className="note warn" style={{ marginTop: 9 }}>
                  336 numbers unreachable — no signal, not undelivered. Those households are on the siren and volunteer relay list.
                </div>
              </div>
            </div>
          ) : (
            /* Alert history */
            <div className="card">
              <header><span className="h-sec">Alert history</span></header>
              <div style={{ padding: 0 }}>
                {HISTORY.map(([t, s, a, m], i) => (
                  <div key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <b style={{ fontSize: 12.5 }}>{a}</b>
                      <span className="num" style={{ fontSize: 10.5, color: 'var(--dim)' }}>{t}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{s} · {m}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {confirming && (
        <div className="mask" onClick={() => setConfirming(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <header><span className="h-sec">Confirm alert</span></header>
            <div className="bd">
              <p style={{ fontSize: 13 }}>This sends to <b>3,240 people</b> across four channels simultaneously.</p>
              <div className="note crit" style={{ marginTop: 11 }}>
                False alarms are not free. Every unnecessary alert reduces how many people act on the next real one.
              </div>
            </div>
            <footer style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 14px' }}>
              <button className="btn" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn danger" onClick={handleConfirm}>Issue alert now</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
