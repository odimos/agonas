const BASE = import.meta.env.VITE_API_URL

export async function fetchRefereePreferences(refereeId) {
  const res = await fetch(`${BASE}/referee-preferences/?referee_id=${refereeId}`)
  if (!res.ok) throw new Error('Failed to fetch preferences')
  return res.json()
}

export async function upsertRefereePreference(refereeId, availabilityId, score) {
  const res = await fetch(`${BASE}/referee-preferences/?referee_id=${refereeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability_id: availabilityId, score }),
  })
  if (!res.ok) throw new Error('Failed to save preference')
  return res.json()
}
