import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, useDashboard } from './api.js'
import { band, bandColor, priColor } from './risk.js'

import Command from './pages/Command.jsx'
import RiskMap from './pages/RiskMap.jsx'
import Habitations from './pages/Habitations.jsx'
import AIRisk from './pages/AIRisk.jsx'
import Hazards from './pages/Hazards.jsx'
import Capacity from './pages/Capacity.jsx'
import Priority from './pages/Priority.jsx'
import SafeSites from './pages/SafeSites.jsx'
import Verify from './pages/Verify.jsx'
import Approval from './pages/Approval.jsx'
import Emergency from './pages/Emergency.jsx'
import Alerts from './pages/Alerts.jsx'
import Rescue from './pages/Rescue.jsx'
import Route from './pages/Route.jsx'
import Family from './pages/Family.jsx'
import WhatIf from './pages/WhatIf.jsx'
import Analytics from './pages/Analytics.jsx'
import DataAI from './pages/DataAI.jsx'
import Reports from './pages/Reports.jsx'
import Citizen from './pages/Citizen.jsx'
import Notifications from './pages/Notifications.jsx'
import Settings from './pages/Settings.jsx'

const ROLES = {
  authority: { name: 'R. Negi', title: 'District Disaster Authority', short: 'RN', desc: 'Monitor, approve relocation, run emergency', icon: '🏛' },
  officer:   { name: 'S. Bisht', title: 'Relocation Officer', short: 'SB', desc: 'Verify on ground, match safe sites, propose', icon: '📋' },
  rescue:    { name: 'Insp. Rawat', title: 'NDRF / SDRF', short: 'IR', desc: 'Live incidents, dispatch, hazard-aware routes', icon: '🚒' },
  citizen:   { name: 'Meena Devi', title: 'Citizen', short: 'MD', desc: 'My risk, safe route, shelter, family', icon: '👤' },
  admin:     { name: 'Sys. Admin', title: 'Administrator', short: 'SA', desc: 'Users, data sources, model health, audit', icon: '⚙' },
}

const NAV = [
  { g: 'Proactive' },
  { id: 'command',     t: 'Command Center',       i: '▣', r: ['authority', 'admin'] },
  { id: 'riskmap',     t: 'Risk Map',             i: '◈', r: ['authority', 'officer', 'rescue', 'admin'] },
  { id: 'habitations', t: 'Habitations',          i: '▤', r: ['authority', 'officer', 'admin'] },
  { id: 'ai',          t: 'AI Risk Intelligence', i: '◉', r: ['authority', 'officer', 'admin'] },
  { id: 'hazards',     t: 'Multi-Hazard Analysis',i: '◬', r: ['authority', 'officer', 'admin'] },
  { id: 'capacity',    t: 'Carrying Capacity',    i: '▮', r: ['authority', 'officer', 'admin'] },
  { id: 'priority',    t: 'Relocation Priority',  i: '⚑', r: ['authority', 'officer', 'admin'] },
  { id: 'safesites',   t: 'Safe Sites',           i: '⌂', r: ['authority', 'officer', 'rescue', 'admin'] },
  { id: 'verify',      t: 'Field Verification',   i: '✓', r: ['authority', 'officer', 'admin'] },
  { id: 'approval',    t: 'Authority Approval',   i: '⚖', r: ['authority', 'admin'] },
  { g: 'Reactive' },
  { id: 'emergency',   t: 'Emergency',            i: '▲', r: ['authority', 'rescue', 'admin'] },
  { id: 'alerts',      t: 'Alerts',               i: '◮', r: ['authority', 'rescue', 'admin'] },
  { id: 'rescue',      t: 'Rescue Operations',    i: '⛑', r: ['authority', 'rescue', 'admin'] },
  { id: 'route',       t: 'Safe Route',           i: '⇢', r: ['authority', 'rescue', 'citizen', 'admin'] },
  { id: 'family',      t: 'Family Reunification', i: '⚭', r: ['authority', 'rescue', 'officer', 'admin'] },
  { g: 'Insight' },
  { id: 'whatif',      t: 'What-If Simulator',    i: '∿', r: ['authority', 'admin'] },
  { id: 'analytics',   t: 'Analytics',            i: '◱', r: ['authority', 'admin'] },
  { id: 'dataai',      t: 'Data & AI',            i: '⌗', r: ['authority', 'officer', 'admin'] },
  { id: 'reports',     t: 'Reports',              i: '⎙', r: ['authority', 'officer', 'rescue', 'admin'] },
  { g: 'You' },
  { id: 'citizen',     t: 'Citizen App',          i: '▢', r: ['authority', 'officer', 'rescue', 'citizen', 'admin'] },
  { id: 'notifications',t:'Notifications',        i: '🔔', r: ['authority', 'officer', 'rescue', 'admin'] },
  { id: 'settings',    t: 'Profile & Settings',   i: '⚙', r: ['authority', 'officer', 'rescue', 'citizen', 'admin'] },
]

const CHAIN = [
  { id: 'riskmap',     st: '01', lb: 'Hazard data' },
  { id: 'ai',          st: '02', lb: 'AI risk' },
  { id: 'habitations', st: '03', lb: 'Rank' },
  { id: 'capacity',    st: '04', lb: 'Capacity' },
  { id: 'priority',    st: '05', lb: 'Priority' },
  { id: 'safesites',   st: '06', lb: 'Safe site' },
  { id: 'verify',      st: '07', lb: 'Verify' },
  { id: 'approval',    st: '08', lb: 'Approve' },
  { id: 'alerts',      st: '09', lb: 'Warn' },
  { id: 'rescue',      st: '10', lb: 'Rescue' },
  { id: 'family',      st: '11', lb: 'Reunite' },
  { id: 'analytics',   st: '12', lb: 'Learn' },
]

const SESSION_KEY = 'sih-desk'
function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

const PAGES = {
  command: Command, riskmap: RiskMap, habitations: Habitations, ai: AIRisk,
  hazards: Hazards, capacity: Capacity, priority: Priority, safesites: SafeSites,
  verify: Verify, approval: Approval, emergency: Emergency, alerts: Alerts,
  rescue: Rescue, route: Route, family: Family, whatif: WhatIf,
  analytics: Analytics, dataai: DataAI, reports: Reports, citizen: Citizen,
  notifications: Notifications, settings: Settings,
}

export default function App() {
  const data = useDashboard()
  const [session, setSession] = useState(loadSession)
  const [page, setPage] = useState('command')
  const [emergency, setEmergency] = useState(false)
  const [selHab, setSelHab] = useState(null)
  const [selSite, setSelSite] = useState(null)
  const [notifRead, setNotifRead] = useState(false)
  const [toasts, setToasts] = useState([])
  const [railOpen, setRailOpen] = useState(false)

  const [loginStep, setLoginStep] = useState(1)
  const [pendingRole, setPendingRole] = useState('authority')

  const role = session?.role || 'authority'
  const roleInfo = ROLES[role] || ROLES.authority

  const toast = useCallback((title, msg, kind) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, msg, kind }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4200)
  }, [])

  function go(p) {
    setPage(p)
    setRailOpen(false)
    if (p === 'notifications') setNotifRead(true)
    const viewEl = document.querySelector('.view')
    if (viewEl) viewEl.scrollTop = 0
  }

  function toggleEmergency() {
    const next = !emergency
    setEmergency(next)
    if (next) {
      go('emergency')
      toast('Emergency declared', 'INC-0091 · Flood · Raini Gaon · Critical. Console switched to emergency mode.', 'crit')
    } else {
      toast('Stood down', 'Incident closed. Console returned to proactive mode.', 'ok')
    }
  }

  async function doLogin() {
    try {
      const res = await api.login({ role: pendingRole })
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...res.session, role: pendingRole }))
      setSession({ ...res.session, role: pendingRole })
      setPage(pendingRole === 'citizen' ? 'citizen' : pendingRole === 'rescue' ? 'rescue' : pendingRole === 'officer' ? 'verify' : 'command')
      toast('Signed in', 'Signed in as ' + ROLES[pendingRole].title + '. All data on screen is simulated.', 'ok')
    } catch {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ role: pendingRole, name: ROLES[pendingRole].name, office: ROLES[pendingRole].title }))
      setSession({ role: pendingRole, name: ROLES[pendingRole].name, office: ROLES[pendingRole].title })
      setPage(pendingRole === 'citizen' ? 'citizen' : pendingRole === 'rescue' ? 'rescue' : pendingRole === 'officer' ? 'verify' : 'command')
      toast('Signed in', 'Signed in as ' + ROLES[pendingRole].title + ' (offline mode).', 'ok')
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setLoginStep(1)
  }

  const visibleNav = useMemo(() => NAV.filter(n => n.g || n.r.includes(role)), [role])
  const chainIdx = CHAIN.findIndex(c => c.id === page)

  const [syncClock, setSyncClock] = useState('')
  useEffect(() => {
    const tick = () => setSyncClock(new Date().toTimeString().slice(0, 8) + ' IST')
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  const defaultHab = data.habitations?.[0]?.id || data.habitations?.[0]?.habCode || 'H01'
  const effectiveSelHab = selHab || defaultHab

  const pageProps = {
    data, go, toast, emergency, toggleEmergency,
    selHab: effectiveSelHab, setSelHab, selSite, setSelSite,
    role, roleInfo, session, logout,
  }

  if (!session) {
    return (
      <>
        <div className="demo-bar"><b>Demo / simulated data</b> · prototype only · not connected to NDMA, IMD, GSI or any government system</div>
        <div className="login-screen">
          <div className="pitch">
            <svg className="bgmap" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">
              <g fill="none" stroke="#00A8C6" strokeWidth="1">
                <path d="M-20 120 C 120 90, 200 170, 320 140 S 520 110, 640 160" />
                <path d="M-20 220 C 130 200, 220 265, 340 235 S 530 210, 640 255" />
                <path d="M-20 330 C 110 300, 210 370, 330 340 S 520 320, 640 360" />
                <path d="M80 -20 C 110 130, 60 260, 120 400 S 150 520, 140 540" />
                <path d="M300 -20 C 340 140, 280 280, 350 420" />
              </g>
              <g fill="#D93A3A"><circle cx="140" cy="200" r="16" opacity=".5" /><circle cx="352" cy="318" r="12" opacity=".4" /></g>
              <g fill="#E2701E"><circle cx="470" cy="180" r="11" opacity=".4" /></g>
            </svg>
            <div className="eyebrow">Smart India Hackathon 2026 · SIH26191 · Disaster Management</div>
            <h1>Who is at risk, and who moves first?</h1>
            <p className="lede">SAMPARK ranks every habitation in a district by multi-hazard risk, measures whether the land can still safely hold the people living on it, and turns that into one queue of decisions an officer can actually work through.</p>
            <div className="wgrid">
              <div><div className="q">What</div><div className="a">Multi-hazard risk &amp; carrying-capacity intelligence for vulnerable habitations</div></div>
              <div><div className="q">Who</div><div className="a">District authority · relocation officer · NDRF/SDRF · citizen</div></div>
              <div><div className="q">Why</div><div className="a">Hazard maps show risk. They don't say who to move first, or where there is room</div></div>
              <div><div className="q">How</div><div className="a">AI risk score → capacity match → field verification → officer approval → alert, rescue, reunite</div></div>
            </div>
            <div className="note acc" style={{ marginTop: 22, maxWidth: 520 }}>SAMPARK does not replace NDMA SACHET, IMD warnings or NDRF command. It sits under them as a district-level decision-support layer.</div>
          </div>
          <div className="auth">
            <div className="authbox">
              {loginStep === 1 ? (
                <div>
                  <div className="eyebrow">Secure sign-in</div>
                  <h2 style={{ fontSize: 19, margin: '6px 0 3px' }}>Choose your role</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginBottom: 16 }}>Each role sees a different console. Demo sign-in needs no password.</p>
                  {Object.entries(ROLES).map(([k, r]) => (
                    <button key={k} className={`rolebtn ${k === pendingRole ? 'on' : ''}`} onClick={() => setPendingRole(k)}>
                      <div className="ri">{r.icon}</div>
                      <div><div className="rn">{r.title}</div><div className="rd">{r.desc}</div></div>
                    </button>
                  ))}
                  <label className="f" style={{ marginTop: 14 }}>
                    <span>Officer ID</span>
                    <input className="inp" defaultValue={{ authority: 'DDMA-CHM-0417', officer: 'RO-CHM-0233', rescue: 'NDRF-BN7-0088', citizen: 'UID-****-4192', admin: 'SYS-ADM-0001' }[pendingRole]} readOnly />
                  </label>
                  <label className="f"><span>Password</span><input className="inp" type="password" defaultValue="demo-prototype" readOnly /></label>
                  <button className="btn pri" style={{ width: '100%', padding: 10 }} onClick={() => setLoginStep(2)}>Continue to OTP</button>
                </div>
              ) : (
                <div>
                  <div className="eyebrow">Two-factor verification</div>
                  <h2 style={{ fontSize: 19, margin: '6px 0 3px' }}>Enter the 6-digit code</h2>
                  <p style={{ color: 'var(--muted)', fontSize: '12.5px', marginBottom: 16 }}>Any code works in the prototype.</p>
                  <div className="otp">
                    {[4, 8, 1, 7, 0, 2].map((v, i) => <input key={i} maxLength="1" defaultValue={v} style={{ width: 42, height: 46, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 19, background: 'var(--ink)', border: '1px solid var(--line2)', borderRadius: 'var(--r)' }} />)}
                  </div>
                  <button className="btn pri" style={{ width: '100%', padding: 10, marginTop: 16 }} onClick={doLogin}>Verify and sign in</button>
                  <button className="btn" style={{ width: '100%', marginTop: 7 }} onClick={() => setLoginStep(1)}>Back</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast ${t.kind || ''}`}><div className="tt">{t.title}</div><div className="tm">{t.msg}</div></div>)}</div>
      </>
    )
  }

  const PageComponent = PAGES[page]

  return (
    <>
      <div className="demo-bar"><b>Demo / simulated data</b> · prototype only · not connected to NDMA, IMD, GSI or any government system</div>
      <div className="app-root">
        <div className="shell">
          <aside className={`rail ${railOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setRailOpen(false) }}>
            <div className="brand">
              <div className="mark"><div className="glyph" /><div><div className="name">SAMPARK</div><div className="sub">Hazard intelligence</div></div></div>
            </div>
            <div className="navwrap">
              <nav className="nav">
                {visibleNav.map((n, idx) => {
                  if (n.g) return <div key={`g-${idx}`} className="navgrp">{n.g}</div>
                  const badge = n.id === 'notifications' && !notifRead ? <span className="nav-badge">3</span> : null
                  return (
                    <button key={n.id} className={`nav-link ${page === n.id ? 'on' : ''}`} onClick={() => go(n.id)}>
                      <span className="ic">{n.i}</span>{n.t}{badge}
                    </button>
                  )
                })}
              </nav>
            </div>
            <div className="railfoot">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div className="av" style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{roleInfo.short}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>{roleInfo.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>{roleInfo.title}</div>
                </div>
              </div>
              <button className="btn" style={{ width: '100%', marginTop: 4 }} onClick={logout}>Sign out</button>
              <div style={{ marginTop: 8, fontSize: 9, color: 'var(--dim)', fontFamily: 'var(--mono)', letterSpacing: '.06em' }}>MODEL v2.4.1 · DATA 98%</div>
            </div>
          </aside>

          <div className="main">
            <div className="topbar">
              <button className="iconbtn burger-btn" onClick={() => setRailOpen(!railOpen)}>☰</button>
              <div className="tb-region">
                <select className="lang" style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, color: 'var(--text)', border: 'none', background: 'none', padding: 0 }}>
                  <option>Chamoli District, Uttarakhand</option>
                  <option>Rudraprayag District, Uttarakhand</option>
                  <option>Pithoragarh District, Uttarakhand</option>
                </select>
              </div>
              <div className="tb-sep" />
              <div className={`status ${emergency ? 'st-emg' : 'st-normal'}`} title="System status">
                <span className="dot" /><span>{emergency ? 'Emergency active' : 'Normal'}</span>
              </div>
              <button className="btn sm" onClick={toggleEmergency}>{emergency ? 'Stand down' : 'Simulate incident'}</button>
              <div className="tb-spacer" />
              <div className="tb-meta">LAST DATA SYNC<br /><span>{syncClock}</span></div>
              <div className="tb-sep" />
              <button className="iconbtn" onClick={() => go('notifications')} title="Notifications">🔔{!notifRead && <span className="dotmark" />}</button>
              <select className="lang">
                <option>EN</option><option>हिन्दी</option><option>मराठी</option><option>தமிழ்</option><option>বাংলা</option>
              </select>
              <div className="who" onClick={() => go('settings')}>
                <div className="av">{roleInfo.short}</div>
                <div><div className="nm">{roleInfo.name}</div><div className="rl">{roleInfo.title}</div></div>
              </div>
              <button className="btn sm" onClick={logout} title="Sign out" style={{ color: 'var(--muted)' }}>Sign out</button>
            </div>

            {chainIdx > -1 && (
              <div className="chain">
                {CHAIN.map((c, i) => (
                  <button key={c.id} className={`lnk ${i === chainIdx ? 'on' : ''} ${chainIdx > -1 && i < chainIdx ? 'done' : ''}`} onClick={() => go(c.id)}>
                    <span className="st">{c.st}</span><span className="lb">{c.lb}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="view">
              {data.error && <div className="note crit" style={{ marginBottom: 12 }}>{data.error}</div>}
              {data.loading && !data.habitations.length && <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)' }}>Opening the district picture…</div>}
              {PageComponent && <PageComponent {...pageProps} />}
            </div>
          </div>
        </div>
      </div>
      <div className="toasts">{toasts.map(t => <div key={t.id} className={`toast ${t.kind || ''}`}><div className="tt">{t.title}</div><div className="tm">{t.msg}</div></div>)}</div>
    </>
  )
}
