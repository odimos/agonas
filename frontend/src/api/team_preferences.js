const BASE = import.meta.env.VITE_API_URL

export async function fetchPreferences(teamId) {
  const res = await fetch(`${BASE}/team-preferences/?team_id=${teamId}`)
  if (!res.ok) throw new Error('Failed to fetch preferences')
  return res.json()
}

export async function upsertPreference(teamId, availabilityId, score) {
  const res = await fetch(`${BASE}/team-preferences/?team_id=${teamId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability_id: availabilityId, score }),
  })
  if (!res.ok) throw new Error('Failed to save preference')
  return res.json()
}
