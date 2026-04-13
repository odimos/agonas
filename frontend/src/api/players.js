const BASE = import.meta.env.VITE_API_URL

export async function fetchPlayers(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await fetch(`${BASE}/players/${params}`)
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
