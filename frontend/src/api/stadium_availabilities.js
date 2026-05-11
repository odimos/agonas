const BASE = import.meta.env.VITE_API_URL

export async function fetchAvailabilities(stadiumId) {
  const res = await fetch(`${BASE}/stadium-availabilities/?stadium_id=${stadiumId}`)
  if (!res.ok) throw new Error('Failed to fetch availabilities')
  return res.json()
}

export async function fetchAllAvailabilities() {
  const res = await fetch(`${BASE}/stadium-availabilities/`)
  if (!res.ok) throw new Error('Failed to fetch availabilities')
  return res.json()
}

export async function createAvailability(stadiumId, data) {
  const res = await fetch(`${BASE}/stadium-availabilities/?stadium_id=${stadiumId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updateAvailability(id, data) {
  const res = await fetch(`${BASE}/stadium-availabilities/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteAvailability(id) {
  const res = await fetch(`${BASE}/stadium-availabilities/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete availability')
}
