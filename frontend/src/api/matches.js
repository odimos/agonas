const BASE = import.meta.env.VITE_API_URL

export async function fetchMatches(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await fetch(`${BASE}/matches/${params}`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}

export async function createMatch(data) {
  const res = await fetch(`${BASE}/matches/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updateMatch(id, data) {
  const res = await fetch(`${BASE}/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteMatch(id) {
  const res = await fetch(`${BASE}/matches/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete match')
}
