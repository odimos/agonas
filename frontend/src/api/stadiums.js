const BASE = import.meta.env.VITE_API_URL

export async function fetchStadiums(search = '', ordering = 'created_at') {
  const p = new URLSearchParams()
  if (search) p.set('search', search)
  if (ordering) p.set('ordering', ordering)
  const qs = p.toString() ? `?${p}` : ''
  const res = await fetch(`${BASE}/stadiums/${qs}`)
  if (!res.ok) throw new Error('Failed to fetch stadiums')
  return res.json()
}

export async function createStadium(data) {
  const res = await fetch(`${BASE}/stadiums/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updateStadium(id, data) {
  const res = await fetch(`${BASE}/stadiums/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteStadium(id) {
  const res = await fetch(`${BASE}/stadiums/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete stadium')
}
