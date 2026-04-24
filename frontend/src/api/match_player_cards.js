const BASE = import.meta.env.VITE_API_URL

export async function fetchMatchCards(matchId) {
  const res = await fetch(`${BASE}/match-player-cards/?match_id=${matchId}`)
  if (!res.ok) throw new Error('Failed to fetch match cards')
  return res.json()
}

export async function createMatchCard(data) {
  const res = await fetch(`${BASE}/match-player-cards/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteMatchCard(id) {
  const res = await fetch(`${BASE}/match-player-cards/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete card')
}
