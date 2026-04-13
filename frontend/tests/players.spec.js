// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const VALID = { first_name: 'Test', last_name: 'Player' }

async function apiCreate(request, data) {
  const res = await request.post(`${API}/players/`, { data: { ...VALID, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/players/${id}`)
}

// Cleans up players by exact first_name match (search narrows candidates, filter pins exact match)
async function apiCleanup(request, firstName) {
  const res = await request.get(`${API}/players/?search=${encodeURIComponent(firstName)}`)
  const players = await res.json()
  for (const p of players.filter(p => p.first_name === firstName)) await apiDelete(request, p.id)
}

function clickRow(page, name) {
  return page.getByTestId('player-row').filter({ hasText: name }).first().click()
}

function modalTitle(page) {
  return page.getByTestId('modal-title')
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading and add button', async ({ page }) => {
  await page.goto('/players')
  await expect(page.getByRole('heading', { name: 'Players' })).toBeVisible()
  await expect(page.getByTestId('add-player-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ──────────────────────────────────────────────────────────────────────

test('add player creates a new row', async ({ page, request }) => {
  await apiCleanup(request, 'New')
  await page.goto('/players')

  await page.getByTestId('add-player-btn').click()
  await expect(modalTitle(page)).toHaveText('Add Player')

  await page.getByTestId('input-first-name').fill('New')
  await page.getByTestId('input-last-name').fill('Player')
  await page.getByTestId('input-nickname').fill('np')
  await page.getByTestId('btn-save').click()

  await expect(modalTitle(page)).not.toBeVisible()
  await expect(page.getByTestId('player-row').filter({ hasText: 'New Player' }).first()).toBeVisible()

  await apiCleanup(request, 'New')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'Detail')
  const id = await apiCreate(request, { first_name: 'Detail', last_name: 'Player' })

  await page.goto('/players')
  await clickRow(page, 'Detail Player')

  await expect(modalTitle(page)).toHaveText('Player Details')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates player', async ({ page, request }) => {
  await apiCleanup(request, 'Edit')
  await apiCleanup(request, 'Edited')
  const id = await apiCreate(request, { first_name: 'Edit', last_name: 'Player' })

  await page.goto('/players')
  await clickRow(page, 'Edit Player')
  await page.getByTestId('btn-edit').click()

  await expect(modalTitle(page)).toHaveText('Edit Player')
  const lastNameInput = page.getByTestId('input-last-name')
  await lastNameInput.clear()
  await lastNameInput.fill('Edited')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('player-row').filter({ hasText: 'Edit Edited' }).first()).toBeVisible()

  await apiCleanup(request, 'Edit')
})

// ─── team assignment ──────────────────────────────────────────────────────────

test('assigning a team shows team name in the list', async ({ page, request }) => {
  // create a team to assign
  const teamRes = await request.post('http://localhost:8000/api/teams/', { data: { name: 'PlayerTestTeam', is_active: true } })
  const teamId = (await teamRes.json()).id

  await apiCleanup(request, 'Teamd')
  await page.goto('/players')

  await page.getByTestId('add-player-btn').click()
  await page.getByTestId('input-first-name').fill('Teamd')
  await page.getByTestId('input-last-name').fill('Player')
  await page.getByTestId('input-team').selectOption({ label: 'PlayerTestTeam' })
  await page.getByTestId('btn-save').click()

  await expect(page.getByTestId('player-row').filter({ hasText: 'PlayerTestTeam' }).first()).toBeVisible()

  await apiCleanup(request, 'Teamd')
  await request.delete(`http://localhost:8000/api/teams/${teamId}`)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete modal removes player', async ({ page, request }) => {
  await apiCleanup(request, 'Delete')
  await apiCreate(request, { first_name: 'Delete', last_name: 'Player' })

  await page.goto('/players')
  await clickRow(page, 'Delete Player')
  await page.getByTestId('btn-delete').click()

  await expect(modalTitle(page)).toHaveText('Delete Player')
  await page.getByTestId('btn-confirm-delete').click()

  await expect(page.getByTestId('player-row').filter({ hasText: 'Delete Player' })).toHaveCount(0)
})
