const BASE = import.meta.env.VITE_API_URL

export async function fetchTeams(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  const res = await fetch(`${BASE}/teams/${params}`)
  if (!res.ok) throw new Error('Failed to fetch teams')
  return res.json()
}

export async function createTeam(data) {
  const res = await fetch(`${BASE}/teams/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function updateTeam(id, data) {
  const res = await fetch(`${BASE}/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteTeam(id) {
  const res = await fetch(`${BASE}/teams/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete team')
}
