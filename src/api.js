import { useCallback, useEffect, useState } from 'react'

const rawBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const BASE = rawBase

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const res = await fetch(`${BASE}${cleanPath}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.details || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  health: () => request('/api/health'),
  config: () => request('/api/config'),
  desks: () => request('/api/desks'),
  login: (body) => request('/api/login', { method: 'POST', body: JSON.stringify(body) }),
  stats: () => request('/api/stats'),
  habitations: () => request('/api/habitations'),
  camps: () => request('/api/camps'),
  teams: () => request('/api/teams'),
  incidents: () => request('/api/incidents'),
  sos: () => request('/api/sos'),
  sendSos: (body) => request('/api/sos', { method: 'POST', body: JSON.stringify(body) }),
  weather: () => request('/api/weather/current'),
  setWeather: (scenario) => request('/api/weather/scenario', { method: 'POST', body: JSON.stringify({ scenario }) }),
  approveRelocation: (body) => request('/api/relocate/approve', { method: 'POST', body: JSON.stringify(body) }),
  verifyField: (body) => request('/api/verify-field', { method: 'POST', body: JSON.stringify(body) }),
  fieldTasks: () => request('/api/field-tasks'),
  dispatch: (body) => request('/api/dispatch', { method: 'POST', body: JSON.stringify(body) }),
  route: (incidentId) => request(`/api/route/${encodeURIComponent(String(incidentId).replace('#', ''))}`),
  reunification: () => request('/api/reunification'),
  registerPerson: (body) => request('/api/reunification', { method: 'POST', body: JSON.stringify(body) }),
  reunite: (id) => request(`/api/reunification/${id}/reunite`, { method: 'POST' }),
  alerts: () => request('/api/alerts'),
  broadcast: (body) => request('/api/alerts/broadcast', { method: 'POST', body: JSON.stringify(body) }),
}

const empty = {
  stats: {},
  habitations: [],
  camps: [],
  teams: [],
  incidents: [],
  sos: [],
  weather: null,
  reunification: { records: [], totalRegistered: 0, reunitedCount: 0, inCampCount: 0 },
  alerts: [],
  tasks: [],
  config: { mockMode: true },
}

export function useDashboard() {
  const [state, setState] = useState({ ...empty, loading: true, error: null })

  const refresh = useCallback(async () => {
    try {
      const [stats, habitations, camps, teams, incidents, sos, weather, reunification, alerts, tasks, config] =
        await Promise.all([
          api.stats(),
          api.habitations(),
          api.camps(),
          api.teams(),
          api.incidents(),
          api.sos(),
          api.weather(),
          api.reunification(),
          api.alerts(),
          api.fieldTasks(),
          api.config(),
        ])
      setState({
        stats,
        habitations,
        camps,
        teams,
        incidents,
        sos,
        weather,
        reunification,
        alerts,
        tasks,
        config,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Backend unreachable. Start the API on port 5000.',
      }))
    }
  }, [])

  useEffect(() => {
    refresh()
    const source = new EventSource(`${BASE}/api/stream`)
    source.addEventListener('update', () => refresh())
    const timer = setInterval(refresh, 45000)
    return () => {
      source.close()
      clearInterval(timer)
    }
  }, [refresh])

  return { ...state, refresh }
}
