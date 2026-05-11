const BASE = import.meta.env.VITE_API_URL

export async function fetchMatchGoals(matchId) {
  const res = await fetch(`${BASE}/match-player-goals/?match_id=${matchId}`)
  if (!res.ok) throw new Error('Failed to fetch match goals')
  return res.json()
}

export async function createMatchGoal(data) {
  const res = await fetch(`${BASE}/match-player-goals/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function deleteMatchGoal(id) {
  const res = await fetch(`${BASE}/match-player-goals/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete goal')
}
