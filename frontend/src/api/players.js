const BASE = import.meta.env.VITE_API_URL

export async function fetchPlayers(search = '', teamId = null, ordering = 'created_at') {
  const p = new URLSearchParams()
  if (search) p.set('search', search)
  if (teamId != null) p.set('team_id', teamId)
  if (ordering) p.set('ordering', ordering)
  const qs = p.toString() ? `?${p}` : ''
  const res = await fetch(`${BASE}/players/${qs}`)
  if (!res.ok) throw new Error('Failed to fetch players')
  return res.json()
}

export async function createPlayer(data) {
  const res = await fetch(`${BASE}/players/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updatePlayer(id, data) {
  const res = await fetch(`${BASE}/players/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deletePlayer(id) {
  const res = await fetch(`${BASE}/players/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete player')
}
