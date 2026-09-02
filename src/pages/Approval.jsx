import { useState } from 'react'
import { priColor, fmt } from '../risk.js'
import { HABS } from '../demoData.js'

export default function Approval({ data, go, toast, emergency, toggleEmergency, selHab, setSelHab, selSite, setSelSite, role, roleInfo, session, logout }) {
  const [approved, setApproved] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const steps = [
    ['AI flagged', 'done'],
    ['Field verified', 'done'],
    ['Safe site matched', 'done'],
    ['Proposal raised', 'done'],
    ['Authority review', approved ? 'done' : 'cur'],
    [approved ? 'Approved' : 'Approved / rejected', approved ? 'done' : ''],
  ]

  function decide(kind) {
    if (kind === 'approve') {
      setApproved(true)
      const h01 = HABS.find(x => x.id === 'H01')
      if (h01) h01.apr = 'Approved'
      setShowModal(false)
      toast('Relocation approved', 'RP-2026-0117 approved. 3,240 residents of Raini Gaon assigned to Gopeshwar Relief Campus.', 'ok')
    } else if (kind === 'reject') {
      setShowModal(false)
      toast('Proposal rejected', 'RP-2026-0117 returned with reasons. Officer notified.', 'warn')
    } else {
      setShowModal(false)
      toast('Re-verification requested', 'FV-0442 reopened for S. Bisht with your note attached.', 'warn')
    }
  }

  return (
    <>
      <div className="pagehead">
        <div className="grow">
          <div className="eyebrow">Stage 08 · approval</div>
          <h1 className="h-page">Authority approval</h1>
          <p>Permanent relocation is a legal act with consequences for thousands of people. The model can rank, verify and recommend. It cannot sign.</p>
        </div>
        {approved
          ? <span className="chip c-low">Approved 13:41</span>
          : <span className="chip c-mod">Awaiting decision</span>}
      </div>

      {/* Workflow stepper */}
      <div className="wf">
        {steps.map((s, i) => (
          <div key={i} className={`s ${s[1]}`}>
            <div className="n">{String(i + 1).padStart(2, '0')}</div>
            <div className="t">{s[0]}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.25fr) minmax(290px,1fr)' }}>
        {/* Left: proposal detail */}
        <div className="card">
          <header>
            <span className="h-sec">RP-2026-0117 · Raini Gaon</span>
            <span className="chip c-crit">P1 — Immediate</span>
          </header>
          <div className="bd">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 14 }}>
              {[
                ['Residents affected', '3,240'],
                ['Households', '648'],
                ['Vulnerable persons', '1,208'],
                ['Destination', 'Gopeshwar Relief Campus'],
                ['Distance', '5.2 km'],
                ['Free capacity there', '2,800'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="eyebrow">{k}</div>
                  <div className="num" style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 6 }}>Evidence in the file</div>
            {[
              ['AI risk assessment', 'Composite 92, confidence 89%, seven contributing drivers listed', 'ai'],
              ['Field verification FV-0439', '6 of 6 checklist items, 6 photographs, GPS fix, officer narrative', 'verify'],
              ['Carrying capacity report', 'Population 3,240 against safe capacity 1,900. Water is the binding constraint', 'capacity'],
              ['Safe-site match', 'Gopeshwar scored 92% on suitability; three alternatives considered and ranked', 'safesites'],
            ].map(([t, d, g]) => (
              <div key={t} style={{ padding: '9px 0', borderBottom: '1px dashed var(--line)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--low)' }}>✓</span>
                <div style={{ flex: 1 }}>
                  <b style={{ fontSize: '12.5px' }}>{t}</b>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: 2 }}>{d}</div>
                </div>
                <button className="btn sm" onClick={() => go(g)}>View</button>
              </div>
            ))}

            <div className="note warn" style={{ marginTop: 12 }}>
              One dissent is on file: the officer notes 42 households have standing crops and have asked for a two-week deferral. Approving does not resolve that — it starts the conversation.
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn ok" disabled={approved} onClick={() => setShowModal(true)}>
                {approved ? 'Approved' : 'Approve relocation'}
              </button>
              <button className="btn" disabled={approved} onClick={() => decide('reverify')}>
                Request re-verification
              </button>
              <button className="btn danger" disabled={approved} onClick={() => decide('reject')}>
                Reject
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Approval queue */}
          <div className="card" style={{ marginBottom: 12 }}>
            <header><span className="h-sec">Approval queue</span></header>
            <div style={{ padding: 0 }}>
              {[
                ['RP-2026-0117', 'Raini Gaon', approved ? 'Approved' : 'With you', approved ? 'low' : 'crit'],
                ['RP-2026-0118', 'Tapovan Tok', 'Awaiting field evidence', 'mod'],
                ['RP-2026-0114', 'Bhyundar', 'Draft with officer', 'mute'],
                ['RP-2026-0109', 'Gauchar Khal', 'Draft with officer', 'mute'],
              ].map(([id, n, st, c]) => (
                <div key={id} style={{ padding: '9px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{n}</div>
                    <div className="num" style={{ fontSize: '10.5px', color: 'var(--dim)' }}>{id}</div>
                  </div>
                  <span className={`chip c-${c}`}>{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What approval triggers */}
          <div className="card">
            <header><span className="h-sec">What approval triggers</span></header>
            <div className="bd">
              {[
                ['Capacity is reserved', '2,800 places held at Gopeshwar for 30 days'],
                ['Households are notified', 'SMS and IVR in Hindi and Garhwali'],
                ['Transport is requisitioned', 'Task raised to the district transport officer'],
                ['Family IDs are issued', 'Every household gets an ID before movement, so nobody is untraceable later'],
                ['Site is unlocked for intake', 'Shelter registration opens for these households only'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '7px 0', borderBottom: '1px dashed var(--line)' }}>
                  <b style={{ fontSize: '12.5px' }}>{k}</b>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: 2 }}>{v}</div>
                </div>
              ))}
              {approved && (
                <div className="note acc" style={{ marginTop: 10 }}>
                  All five fired at 13:41. Family IDs F102–F749 issued.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approval confirmation modal */}
      {showModal && (
        <div className="mask on" onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal">
            <header>
              <span className="h-sec">Confirm approval</span>
              <div style={{ flex: 1 }} />
              <button className="iconbtn" onClick={() => setShowModal(false)}>✕</button>
            </header>
            <div className="bd">
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                You are approving permanent relocation of <b>3,240 residents</b> of Raini Gaon to Gopeshwar Relief Campus.
              </p>
              <div className="note warn" style={{ marginTop: 11 }}>
                This is recorded against your officer ID, timestamped, and cannot be silently reversed. The audit entry is permanent.
              </div>
              <label className="f" style={{ marginTop: 12 }}>
                <span>Order note (optional)</span>
                <textarea className="inp" placeholder="Conditions, phasing, deferrals" />
              </label>
            </div>
            <footer>
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn ok" onClick={() => decide('approve')}>Approve and sign</button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
