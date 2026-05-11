// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'

async function apiCreateDraft(request) {
  const res = await request.post(`${API}/matches/`, { data: { status: 'draft' } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/matches/${id}`)
}

async function apiCleanupDrafts(request) {
  const res = await request.get(`${API}/matches/?status=draft`)
  const all = await res.json()
  for (const m of all) await apiDelete(request, m.id)
}

// ─── list / heading ───────────────────────────────────────────────────────────

test('dashboard renders heading, add button, and week navigation', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: 'Πρόγραμμα Αγώνων' })).toBeVisible()
  await expect(page.getByTestId('add-match-btn')).toBeVisible()
  // week nav shows two dates separated by —
  await expect(page.locator('text=—').first()).toBeVisible()
})

// ─── add draft ────────────────────────────────────────────────────────────────

test('add draft match creates a new row', async ({ page, request }) => {
  await apiCleanupDrafts(request)

  await page.goto('/dashboard')
  await page.getByTestId('add-match-btn').click()

  // modal opens
  await expect(page.locator('h2').filter({ hasText: 'Προσθήκη Αγώνα' })).toBeVisible()
  // status is already draft by default — submit
  await page.getByTestId('btn-save').click()

  await expect(page.locator('h2').filter({ hasText: 'Προσθήκη Αγώνα' })).not.toBeVisible()
  // draft row appears
  await expect(page.getByTestId('match-row').first()).toBeVisible()

  await apiCleanupDrafts(request)
})

// ─── add expected match ───────────────────────────────────────────────────────

test('add expected match with all required fields succeeds', async ({ page, request }) => {
  // ensure teams, referee, stadium exist
  const homeRes = await request.post(`${API}/teams/`, { data: { name: 'DashHome', is_active: true } })
  const awayRes = await request.post(`${API}/teams/`, { data: { name: 'DashAway', is_active: true } })
  const homeId  = (await homeRes.json()).id
  const awayId  = (await awayRes.json()).id
  const refRes  = await request.post(`${API}/referees/`, { data: { first_name: 'DashRef', last_name: 'One', phone: '6900000099' } })
  const refId   = (await refRes.json()).id
  const stRes   = await request.post(`${API}/stadiums/`, { data: { name: 'DashStad', phone: '2100000099', address: 'St 1' } })
  const stId    = (await stRes.json()).id

  await page.goto('/dashboard')
  await page.getByTestId('add-match-btn').click()

  await page.getByTestId('input-status').selectOption('expected')
  await page.getByTestId('input-home-team').selectOption({ value: String(homeId) })
  await page.getByTestId('input-away-team').selectOption({ value: String(awayId) })
  await page.getByTestId('input-referee').selectOption({ value: String(refId) })
  await page.getByTestId('input-stadium').selectOption({ value: String(stId) })
  await page.getByTestId('input-scheduled-at').fill('2026-08-01T18:00')

  await page.getByTestId('btn-save').click()
  await expect(page.locator('h2').filter({ hasText: 'Προσθήκη Αγώνα' })).not.toBeVisible()

  // cleanup
  const all = await (await request.get(`${API}/matches/`)).json()
  for (const m of all.filter(m => m.home_team_id === homeId)) await apiDelete(request, m.id)
  await request.delete(`${API}/teams/${homeId}`)
  await request.delete(`${API}/teams/${awayId}`)
  await request.delete(`${API}/referees/${refId}`)
  await request.delete(`${API}/stadiums/${stId}`)
})

// ─── inline status change ─────────────────────────────────────────────────────

test('inline status dropdown updates match status', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/dashboard')

  // Target the exact row by match ID
  const row = page.locator(`[data-match-id="${id}"]`)
  await expect(row).toBeVisible()

  await row.getByTestId('inline-status-select').selectOption('canceled', { force: true })
  await page.waitForTimeout(1200)

  const check = await request.get(`${API}/matches/${id}`)
  expect((await check.json()).status).toBe('canceled')

  await apiDelete(request, id)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete button removes the match', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/dashboard')

  const row = page.locator(`[data-match-id="${id}"]`)
  await expect(row).toBeVisible()

  page.once('dialog', dialog => dialog.accept())
  await row.locator('button[title="Delete"]').click()
  await page.waitForTimeout(1200)

  const check = await request.get(`${API}/matches/${id}`)
  expect(check.status()).toBe(404)
})

// ─── week navigation ──────────────────────────────────────────────────────────

test('week navigation changes the displayed date range', async ({ page }) => {
  await page.goto('/dashboard')
  const weekLabel = page.getByTestId('week-label')
  const initial = await weekLabel.textContent()

  // navigate forward one week — the > button is the last chevron_right button
  await page.getByRole('button', { name: '' }).filter({ has: page.locator('text=chevron_right') }).last().click()
  await page.waitForTimeout(500)

  const next = await weekLabel.textContent()
  expect(next).not.toBe(initial)
})

// ─── status filter ────────────────────────────────────────────────────────────

test('status filter dropdown hides non-matching rows', async ({ page, request }) => {
  const draftId = await apiCreateDraft(request)

  await page.goto('/dashboard')
  const draftRow = page.locator(`[data-match-id="${draftId}"]`)
  await expect(draftRow).toBeVisible()

  // Open status dropdown and tick "Αναμενόμενο" — hides the draft row
  await page.locator('button').filter({ hasText: 'ΚΑΤΑΣΤΑΣΗ' }).click()
  await page.locator('button').filter({ hasText: 'Αναμενομενο' }).click()
  await page.keyboard.press('Escape')

  await expect(draftRow).not.toBeVisible()

  // Clear all filters
  await page.locator('button').filter({ hasText: 'ΚΑΘΑΡΙΣΜΟΣ' }).click()
  await expect(draftRow).toBeVisible()

  await apiDelete(request, draftId)
})

// ─── modal close ─────────────────────────────────────────────────────────────

test('create modal closes when X is clicked', async ({ page }) => {
  await page.goto('/dashboard')
  await page.getByTestId('add-match-btn').click()
  await expect(page.locator('h2').filter({ hasText: 'Προσθήκη Αγώνα' })).toBeVisible()
  await page.getByTestId('modal-close').click()
  await expect(page.locator('h2').filter({ hasText: 'Προσθήκη Αγώνα' })).not.toBeVisible()
})

// ─── view modal (eye icon) ────────────────────────────────────────────────────

test('eye icon opens the match detail modal with all fields', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/dashboard')
  const row = page.locator(`[data-match-id="${id}"]`)
  await expect(row).toBeVisible()

  await row.locator('button[title="View"]').click()

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Αγώνα')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  // All key fields visible
  await expect(page.getByTestId('input-status')).toBeVisible()
  await expect(page.getByTestId('input-tournament')).toBeVisible()
  await expect(page.getByTestId('input-home-team')).toBeVisible()
  await expect(page.getByTestId('input-away-team')).toBeVisible()
  await expect(page.getByTestId('input-referee')).toBeVisible()
  await expect(page.getByTestId('input-stadium')).toBeVisible()
  await expect(page.getByTestId('input-comments')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit via modal ───────────────────────────────────────────────────────────

test('edit modal updates match and row reflects change', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/dashboard')
  await page.locator(`[data-match-id="${id}"]`).locator('button[title="View"]').click()
  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Αγώνα')

  await page.getByTestId('btn-edit').click()

  // SelectField has pointerEvents toggled — use force
  await page.getByTestId('input-status').selectOption('canceled', { force: true })
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()

  const check = await request.get(`${API}/matches/${id}`)
  expect((await check.json()).status).toBe('canceled')

  await apiDelete(request, id)
})

// ─── delete via modal ─────────────────────────────────────────────────────────

test('delete via detail modal removes the match', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/dashboard')
  await page.locator(`[data-match-id="${id}"]`).locator('button[title="View"]').click()
  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Αγώνα')

  // Register BEFORE clicking — ItemModal uses window.confirm
  page.once('dialog', dialog => dialog.accept())
  await page.getByTestId('btn-delete').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()

  const check = await request.get(`${API}/matches/${id}`)
  expect(check.status()).toBe(404)
})

// ─── comments field visible in modal ─────────────────────────────────────────

test('comments field is editable in the detail modal', async ({ page, request }) => {
  const id = await apiCreateDraft(request)

  await page.goto('/dashboard')
  await page.locator(`[data-match-id="${id}"]`).locator('button[title="View"]').click()
  await page.getByTestId('btn-edit').click()

  // textarea is visible and writable in edit mode
  const comments = page.getByTestId('input-comments')
  await comments.fill('Test comment from Playwright')
  await page.getByTestId('btn-save-changes').click()

  await page.waitForTimeout(800)
  await expect(page.getByTestId('modal-title')).not.toBeVisible()

  const check = await request.get(`${API}/matches/${id}`)
  expect((await check.json()).comments).toBe('Test comment from Playwright')

  await apiDelete(request, id)
})
