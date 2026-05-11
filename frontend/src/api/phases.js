const BASE = import.meta.env.VITE_API_URL

export async function fetchPhase(id) {
  const res = await fetch(`${BASE}/phases/${id}`)
  if (!res.ok) throw new Error('Failed to fetch phase')
  return res.json()
}

export async function fetchPhases(tournamentId = null) {
  const qs = tournamentId ? `?tournament_id=${tournamentId}` : ''
  const res = await fetch(`${BASE}/phases/${qs}`)
  if (!res.ok) throw new Error('Failed to fetch phases')
  return res.json()
}

export async function createPhase(tournamentId, order = 1) {
  const res = await fetch(`${BASE}/phases/?tournament_id=${tournamentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updatePhase(id, data) {
  const res = await fetch(`${BASE}/phases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deletePhase(id) {
  const res = await fetch(`${BASE}/phases/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete phase')
}
