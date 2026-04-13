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

async function apiCleanup(request, search) {
  const res = await request.get(`${API}/players/?search=${encodeURIComponent(search)}`)
  for (const p of await res.json()) await apiDelete(request, p.id)
}

function clickRow(page, name) {
  return page.getByTestId('player-row').filter({ hasText: name }).first().click()
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
  await apiCleanup(request, 'NewPlayer')
  await page.goto('/players')

  await page.getByTestId('add-player-btn').click()
  await expect(page.getByText('Add Player', { exact: true })).toBeVisible()

  await page.getByTestId('input-first-name').fill('New')
  await page.getByTestId('input-last-name').fill('Player')
  await page.getByTestId('input-nickname').fill('np')
  await page.getByTestId('btn-save').click()

  await expect(page.getByText('Add Player', { exact: true })).not.toBeVisible()
  await expect(page.getByTestId('player-row').filter({ hasText: 'New Player' }).first()).toBeVisible()

  await apiCleanup(request, 'NewPlayer')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'DetailPlayer')
  const id = await apiCreate(request, { first_name: 'Detail', last_name: 'Player' })

  await page.goto('/players')
  await clickRow(page, 'Detail Player')

  await expect(page.getByText('Player Details', { exact: true })).toBeVisible()
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates player', async ({ page, request }) => {
  await apiCleanup(request, 'EditPlayer')
  await apiCleanup(request, 'EditedPlayer')
  const id = await apiCreate(request, { first_name: 'Edit', last_name: 'Player' })

  await page.goto('/players')
  await clickRow(page, 'Edit Player')
  await page.getByTestId('btn-edit').click()

  await expect(page.getByText('Edit Player', { exact: true })).toBeVisible()
  const lastNameInput = page.getByTestId('input-last-name')
  await lastNameInput.clear()
  await lastNameInput.fill('EditedPlayer')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('player-row').filter({ hasText: 'Edit EditedPlayer' }).first()).toBeVisible()

  await apiCleanup(request, 'EditedPlayer')
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete modal removes player', async ({ page, request }) => {
  await apiCleanup(request, 'DeletePlayer')
  await apiCreate(request, { first_name: 'Delete', last_name: 'Player' })

  await page.goto('/players')
  await clickRow(page, 'Delete Player')
  await page.getByTestId('btn-delete').click()

  await expect(page.getByText('Delete Player', { exact: true })).toBeVisible()
  await page.getByTestId('btn-confirm-delete').click()

  await expect(page.getByTestId('player-row').filter({ hasText: 'Delete Player' })).toHaveCount(0)
})
