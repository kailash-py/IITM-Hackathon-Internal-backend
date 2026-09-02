import { AUDIT } from '../demoData.js';

export default function Settings({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Account</div>
          <h1 className="h-page">Profile and settings</h1>
          <p>Who you are decides what you can approve. Role changes are logged and take effect at next sign-in.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(288px,1fr))' }}>
        {/* Profile */}
        <div className="card">
          <header><span className="h-sec">Profile</span></header>
          <div className="bd">
            <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 13 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: 'var(--accent-dim)', color: 'var(--accent)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700,
              }}>
                {roleInfo?.short || 'RN'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{roleInfo?.name || 'R. Negi'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{roleInfo?.title || 'District Disaster Authority'}</div>
              </div>
            </div>
            <div className="kv"><span className="k">Officer ID</span><span className="v">DDMA-CHM-0417</span></div>
            <div className="kv"><span className="k">District</span><span className="v">Chamoli, Uttarakhand</span></div>
            <div className="kv"><span className="k">Blocks</span><span className="v">All 4</span></div>
            <div className="kv">
              <span className="k">Signing authority</span>
              <span className="v" style={{ color: role === 'authority' ? 'var(--low)' : 'var(--dim)' }}>
                {role === 'authority' ? 'Yes, up to P1' : 'No'}
              </span>
            </div>
            <label className="f" style={{ marginTop: 12 }}>
              <span>Switch role (demo)</span>
              <select
                className="inp"
                value={role}
                onChange={e => {
                  logout();
                }}
              >
                {[
                  ['authority', 'District Disaster Authority'],
                  ['officer', 'Relocation Officer'],
                  ['rescue', 'NDRF / SDRF'],
                  ['citizen', 'Citizen'],
                  ['admin', 'Administrator'],
                ].map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <header><span className="h-sec">Notifications</span></header>
          <div className="bd">
            {[
              ['Critical risk alerts', true],
              ['Field task assignments', true],
              ['Approval requests', true],
              ['Rescue status changes', true],
              ['Safe-site capacity warnings', true],
              ['Family match proposals', true],
              ['Model retraining notices', false],
              ['Weekly digest', false],
            ].map(([k, v]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: '1px dashed var(--line)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked={v} style={{ accentColor: 'var(--accent)' }} />
                <span style={{ fontSize: 12.5 }}>{k}</span>
              </label>
            ))}
            <div className="note" style={{ marginTop: 9 }}>Critical alerts cannot be switched off for signing officers.</div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <header><span className="h-sec">Preferences</span></header>
          <div className="bd">
            <label className="f">
              <span>Interface language</span>
              <select className="inp">
                <option>English</option>
                <option>हिन्दी</option>
                <option>Garhwali</option>
              </select>
            </label>
            <label className="f">
              <span>Alert language, outgoing</span>
              <select className="inp">
                <option>Hindi + Garhwali + English</option>
                <option>Hindi only</option>
              </select>
            </label>
            <label className="f">
              <span>Emergency behaviour</span>
              <select className="inp">
                <option>Switch console automatically</option>
                <option>Ask first</option>
              </select>
            </label>
            <label className="f">
              <span>Session timeout</span>
              <select className="inp">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
              </select>
            </label>
            <button className="btn" style={{ width: '100%' }} onClick={() => toast('Saved', 'Preferences updated for this session.', 'ok')}>
              Save preferences
            </button>
          </div>
        </div>

        {/* Audit log */}
        <div className="card">
          <header>
            <span className="h-sec">Audit log</span>
            <span className="eyebrow">immutable</span>
          </header>
          <div style={{ padding: 0, maxHeight: 300, overflow: 'auto' }}>
            {AUDIT.map((a, i) => (
              <div key={i} style={{ padding: '9px 12px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', gap: 9 }}>
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
