// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const BASE_PLAYER = { first_name: 'Test', last_name: 'Player' }

async function apiCreate(request, data = {}) {
  const res = await request.post(`${API}/players/`, { data: { ...BASE_PLAYER, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/players/${id}`)
}

// Cleanup by exact first_name — handles leftover records from failed prior runs
async function apiCleanup(request, firstName) {
  const res = await request.get(`${API}/players/?search=${encodeURIComponent(firstName)}`)
  const players = await res.json()
  for (const p of players.filter(p => p.first_name === firstName)) {
    await apiDelete(request, p.id)
  }
}

async function clickRow(page, name) {
  await page.getByTestId('search-input').fill(name.split(' ')[0])
  return page.getByTestId('player-row').filter({ hasText: name }).first().click()
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading, add button, and search input', async ({ page }) => {
  await page.goto('/entities/players')
  await expect(page.getByRole('heading', { name: 'Παίκτες' })).toBeVisible()
  await expect(page.getByTestId('add-player-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ──────────────────────────────────────────────────────────────────────

test('add player creates a new row and appears in list', async ({ page, request }) => {
  await apiCleanup(request, 'Playwright')

  await page.goto('/entities/players')
  await page.getByTestId('add-player-btn').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible() // modal-title is on ItemModal, not CreateModal
  // CreateModal uses a plain h2 with the title text
  await expect(page.locator('h2').filter({ hasText: 'Νέος Παίκτης' })).toBeVisible()

  await page.getByTestId('input-first-name').fill('Playwright')
  await page.getByTestId('input-last-name').fill('Tester')
  await page.getByTestId('input-nickname').fill('pwt')
  await page.getByTestId('btn-save').click()

  // modal closes and new row appears
  await expect(page.locator('h2').filter({ hasText: 'Νέος Παίκτης' })).not.toBeVisible()
  await page.getByTestId('search-input').fill('Playwright')
  await expect(
    page.getByTestId('player-row').filter({ hasText: 'Playwright Tester' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'Playwright')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'Detail')
  const id = await apiCreate(request, { first_name: 'Detail', last_name: 'View' })

  await page.goto('/entities/players')
  await clickRow(page, 'Detail View')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Παίκτη')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates player and list reflects new name', async ({ page, request }) => {
  await apiCleanup(request, 'EditMe')
  const id = await apiCreate(request, { first_name: 'EditMe', last_name: 'Before' })

  await page.goto('/entities/players')
  await clickRow(page, 'EditMe Before')
  await page.getByTestId('btn-edit').click()

  const lastNameInput = page.getByTestId('input-last-name')
  await lastNameInput.clear()
  await lastNameInput.fill('After')
  await page.getByTestId('btn-save-changes').click()

  // modal closes, updated row is visible
  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await expect(
    page.getByTestId('player-row').filter({ hasText: 'EditMe After' }).first()
  ).toBeVisible()

  await apiDelete(request, id)
})

// ─── team assignment ──────────────────────────────────────────────────────────

test('assigning a team shows team name in the list row', async ({ page, request }) => {
  const teamRes = await request.post(`${API}/teams/`, { data: { name: 'SpecTeam', is_active: true } })
  const teamId = (await teamRes.json()).id

  await apiCleanup(request, 'Teamd')
  await page.goto('/entities/players')

  await page.getByTestId('add-player-btn').click()
  await page.getByTestId('input-first-name').fill('Teamd')
  await page.getByTestId('input-last-name').fill('Player')
  await page.getByTestId('input-team').selectOption({ label: 'SpecTeam' })
  await page.getByTestId('btn-save').click()

  await page.getByTestId('search-input').fill('Teamd')
  await expect(
    page.getByTestId('player-row').filter({ hasText: 'SpecTeam' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'Teamd')
  await request.delete(`${API}/teams/${teamId}`)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete removes player from list', async ({ page, request }) => {
  await apiCleanup(request, 'ToDelete')
  const id = await apiCreate(request, { first_name: 'ToDelete', last_name: 'Me' })

  await page.goto('/entities/players')
  await clickRow(page, 'ToDelete Me')

  // accept the window.confirm dialog
  page.on('dialog', dialog => dialog.accept())
  await page.getByTestId('btn-delete').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await expect(
    page.getByTestId('player-row').filter({ hasText: 'ToDelete Me' })
  ).toHaveCount(0)
  // no API cleanup needed — already deleted through UI
})

// ─── search ───────────────────────────────────────────────────────────────────

test('search filters the player list', async ({ page, request }) => {
  await apiCleanup(request, 'Alpha')
  await apiCleanup(request, 'Beta')
  const id1 = await apiCreate(request, { first_name: 'Alpha', last_name: 'Search' })
  const id2 = await apiCreate(request, { first_name: 'Beta',  last_name: 'Search' })

  await page.goto('/entities/players')
  await page.getByTestId('search-input').fill('Alpha')

  await expect(
    page.getByTestId('player-row').filter({ hasText: 'Alpha Search' }).first()
  ).toBeVisible()
  await expect(
    page.getByTestId('player-row').filter({ hasText: 'Beta Search' })
  ).toHaveCount(0)

  await apiDelete(request, id1)
  await apiDelete(request, id2)
})

// ─── close modal ──────────────────────────────────────────────────────────────

test('create modal closes when X is clicked', async ({ page }) => {
  await page.goto('/entities/players')
  await page.getByTestId('add-player-btn').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέος Παίκτης' })).toBeVisible()
  await page.getByTestId('modal-close').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέος Παίκτης' })).not.toBeVisible()
})
