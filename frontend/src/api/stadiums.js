const BASE = import.meta.env.VITE_API_URL

export async function fetchStadiums(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await fetch(`${BASE}/stadiums/${params}`)
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
