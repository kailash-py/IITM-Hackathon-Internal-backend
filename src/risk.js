export function band(v) {
  if (v >= 85) return 'crit'
  if (v >= 70) return 'high'
  if (v >= 50) return 'mod'
  return 'low'
}

export function bandName(v) {
  if (v >= 85) return 'Critical'
  if (v >= 70) return 'High'
  if (v >= 50) return 'Moderate'
  return 'Low'
}

export function bandColor(v) {
  return { crit: 'var(--crit)', high: 'var(--high)', mod: 'var(--mod)', low: 'var(--low)' }[band(v)]
}

export function priColor(p) {
  return { P1: 'var(--crit)', P2: 'var(--high)', P3: 'var(--mod)', P4: 'var(--low)' }[p] || 'var(--muted)'
}

export function priBand(p) {
  return { P1: 'crit', P2: 'high', P3: 'mod', P4: 'low' }[p] || 'mute'
}

export function riskBadgeClass(level) {
  const l = String(level).toUpperCase()
  if (l === 'CRITICAL' || l === 'CRIT') return 'crit'
  if (l === 'HIGH') return 'high'
  if (l === 'MODERATE' || l === 'MOD') return 'mod'
  return 'low'
}

export function priBadgeClass(priority) {
  const p = String(priority).toLowerCase()
  if (p === 'immediate' || p === 'p1') return 'crit'
  if (p === 'urgent' || p === 'short' || p === 'p2') return 'high'
  if (p === 'medium' || p === 'p3') return 'mod'
  return 'low'
}

export function fmt(n) {
  return (n || 0).toLocaleString('en-IN')
}

export function chip(cls, txt) {
  return { cls, txt }
}

export function safeCap(capObj) {
  if (!capObj) return 0
  return Math.min(...Object.values(capObj))
}

export function overload(pop, cap) {
  if (!cap || cap <= 0) return 0
  return Math.round(((pop - cap) / cap) * 1000) / 10
}

export function bottleneck(capObj) {
  if (!capObj) return null
  let k = null, v = Infinity
  for (const x in capObj) { if (capObj[x] < v) { v = capObj[x]; k = x } }
  return k
}
