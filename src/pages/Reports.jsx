const REPORTS = [
  ['District risk report', 'All 10 habitations, risk bands, exposure and priority queue', 'Weekly', '◱'],
  ['Habitation intelligence report', 'One habitation, full profile, drivers, capacity and history', 'On demand', '▤'],
  ['Relocation report', 'Proposals, evidence, approvals and current status', 'Monthly', '⚑'],
  ['Emergency incident report', 'INC-0091 timeline, actions, delivery and outcomes', 'Per incident', '▲'],
  ['Rescue performance report', 'Dispatch to on-site times, routes taken, blockages', 'Monthly', '⛑'],
  ['Family reunification report', 'Registrations, matches, verifications, open cases', 'Per incident', '⚭'],
];

export default function Reports({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Records</div>
          <h1 className="h-page">Reports</h1>
          <p>Every report carries the model version, the data vintage and the officer who signed each decision inside it. A report that cannot be audited is not evidence.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        {REPORTS.map((r, i) => (
          <div className="card" key={i}>
            <header>
              <span style={{ fontSize: 15, color: 'var(--accent)' }}>{r[3]}</span>
              <span className="h-sec">{r[0]}</span>
            </header>
            <div className="bd">
              <p style={{ fontSize: 12.5, color: 'var(--muted)', minHeight: 34 }}>{r[1]}</p>
              <div className="kv">
                <span className="k">Cadence</span>
                <span className="v">{r[2]}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <button
                  className="btn sm pri"
                  onClick={() => toast('Report queued', r[0] + ' is being generated as PDF. Mock action in the prototype.', 'ok')}
                >
                  Generate PDF
                </button>
                <button
                  className="btn sm"
                  onClick={() => toast('Export queued', 'CSV export started.', 'ok')}
                >
                  Export CSV
                </button>
                <button
                  className="btn sm"
                  onClick={() => toast('Share link', 'A signed, expiring link would be issued to named recipients.', 'ok')}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
