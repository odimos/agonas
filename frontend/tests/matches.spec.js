// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'

async function getOrCreateTeam(request, name) {
  const res = await request.get(`${API}/teams/?search=${encodeURIComponent(name)}`)
  const list = await res.json()
  const found = list.find(t => t.name === name)
  if (found) return found.id
  const created = await request.post(`${API}/teams/`, { data: { name, is_active: true } })
  return (await created.json()).id
}

async function getOrCreateReferee(request) {
  const res = await request.get(`${API}/referees/?search=Spec`)
  const list = await res.json()
  if (list.length) return list[0].id
  const created = await request.post(`${API}/referees/`, {
    data: { first_name: 'Spec', last_name: 'Ref', phone: '6900000099' },
  })
  return (await created.json()).id
}

async function getOrCreateStadium(request) {
  const res = await request.get(`${API}/stadiums/?search=SpecStad`)
  const list = await res.json()
  if (list.length) return list[0].id
  const created = await request.post(`${API}/stadiums/`, {
    data: { name: 'SpecStad', phone: '2100000099', address: 'Stadium St 1' },
  })
  return (await created.json()).id
}

async function apiCreateDraft(request) {
  const res = await request.post(`${API}/matches/`, { data: { status: 'draft' } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/matches/${id}`)
}

function clickRow(page, text) {
  return page.getByTestId('match-row').filter({ hasText: text }).first().click()
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading and add button', async ({ page }) => {
  await page.goto('/matches')
  await expect(page.getByRole('heading', { name: 'Matches' })).toBeVisible()
  await expect(page.getByTestId('add-match-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add draft ────────────────────────────────────────────────────────────────

test('add draft match creates a new row', async ({ page, request }) => {
  await page.goto('/matches')

  await page.getByTestId('add-match-btn').click()
  await expect(page.getByTestId('modal-title')).toHaveText('Add Match')

  // status is already draft by default — just save
  await page.getByTestId('btn-save').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  // draft row appears (shows "— draft —")
  const rows = page.getByTestId('match-row')
  await expect(rows.first()).toBeVisible()

  // cleanup — delete any draft matches we just created
  const res = await request.get(`${API}/matches/`)
  const all = await res.json()
  for (const m of all.filter(m => m.status === 'draft')) await apiDelete(request, m.id)
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/matches')
  await page.getByTestId('match-row').first().click()

  await expect(page.getByTestId('modal-title')).toHaveText('Match Details')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal changes status to canceled', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/matches')
  await page.getByTestId('match-row').first().click()
  await page.getByTestId('btn-edit').click()

  await expect(page.getByTestId('modal-title')).toHaveText('Edit Match')
  await page.getByTestId('input-status').selectOption('canceled')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await expect(page.getByTestId('match-row').filter({ hasText: 'Canceled' }).first()).toBeVisible()

  await apiDelete(request, id)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete modal removes the match', async ({ page, request }) => {
  const id = await apiCreateDraft(request)
  const countBefore = (await (await request.get(`${API}/matches/`)).json()).length

  await page.goto('/matches')
  await page.getByTestId('match-row').first().click()
  await page.getByTestId('btn-delete').click()

  await expect(page.getByTestId('modal-title')).toHaveText('Delete Match')
  await page.getByTestId('btn-confirm-delete').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()

  const countAfter = (await (await request.get(`${API}/matches/`)).json()).length
  expect(countAfter).toBe(countBefore - 1)
})

// ─── add expected ─────────────────────────────────────────────────────────────

test('add expected match with all required fields succeeds', async ({ page, request }) => {
  const homeId = await getOrCreateTeam(request, 'SpecHome')
  const awayId = await getOrCreateTeam(request, 'SpecAway')
  await getOrCreateReferee(request)
  await getOrCreateStadium(request)

  await page.goto('/matches')
  await page.getByTestId('add-match-btn').click()

  await page.getByTestId('input-status').selectOption('expected')
  await page.getByTestId('input-home-team').selectOption({ value: String(homeId) })
  await page.getByTestId('input-away-team').selectOption({ value: String(awayId) })
  await page.getByTestId('input-referee').selectOption({ index: 1 })
  await page.getByTestId('input-stadium').selectOption({ index: 1 })
  await page.getByTestId('input-scheduled-at').fill('2026-08-01T18:00')

  await page.getByTestId('btn-save').click()
  await expect(page.getByTestId('modal-title')).not.toBeVisible()

  await expect(page.getByTestId('match-row').filter({ hasText: 'SpecHome' }).first()).toBeVisible()

  // cleanup
  const res = await request.get(`${API}/matches/`)
  const all = await res.json()
  for (const m of all.filter(m => m.home_team_id === homeId)) await apiDelete(request, m.id)
})
