const BASE = import.meta.env.VITE_API_URL

export async function fetchReferees(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await fetch(`${BASE}/referees/${params}`)
  if (!res.ok) throw new Error('Failed to fetch referees')
  return res.json()
}

export async function createReferee(data) {
  const res = await fetch(`${BASE}/referees/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updateReferee(id, data) {
  const res = await fetch(`${BASE}/referees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteReferee(id) {
  const res = await fetch(`${BASE}/referees/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete referee')
}
