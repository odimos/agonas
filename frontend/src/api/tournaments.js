const BASE = import.meta.env.VITE_API_URL

export async function fetchTournaments() {
  const res = await fetch(`${BASE}/tournaments/`)
  if (!res.ok) throw new Error('Failed to fetch tournaments')
  return res.json()
}

export async function createTournament(data) {
  const res = await fetch(`${BASE}/tournaments/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}
