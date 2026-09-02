import { NOTIFS } from '../demoData.js';

export default function Notifications({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Inbox</div>
          <h1 className="h-page">Notifications</h1>
          <p>Ordered by consequence, not by time. Anything that can kill someone sits above anything that is merely late.</p>
        </div>
        <button className="btn" onClick={() => toast('Marked read', 'All notifications marked as read.', 'ok')}>
          Mark all read
        </button>
      </div>

      <div className="card">
        <div style={{ padding: 0 }}>
          {NOTIFS.map((n, i) => (
            <div
              key={i}
              style={{
                padding: '11px 13px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                gap: 11,
                cursor: 'pointer',
                borderLeft: `3px solid ${n.sev === 'crit' ? 'var(--crit)' : n.sev === 'warn' ? 'var(--mod)' : 'var(--line2)'}`,
              }}
              onClick={() => go(n.go)}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flex: 'none',
                display: 'grid', placeItems: 'center', fontSize: 11,
                background: n.sev === 'crit' ? 'var(--crit-bg)' : n.sev === 'warn' ? 'var(--mod-bg)' : 'var(--panel3)',
                color: n.sev === 'crit' ? '#FF8080' : n.sev === 'warn' ? 'var(--mod)' : 'var(--muted)',
              }}>
                {n.sev === 'crit' ? '!' : n.sev === 'warn' ? '▲' : 'i'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.t}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{n.m}</div>
              </div>
              <div className="eyebrow" style={{ whiteSpace: 'nowrap' }}>{n.w}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
