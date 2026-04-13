// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'

// Helper: create a referee via API and return its id for cleanup
async function apiCreate(request, data) {
  const res = await request.post(`${API}/referees/`, {
    data: { first_name: 'Test', last_name: 'Ref', phone: '6900000001', ...data },
  })
  const body = await res.json()
  return body.id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/referees/${id}`)
}

// Delete all referees matching a search term — used before each test to
// clear leftover records from previous failed runs
async function apiCleanup(request, search) {
  const res = await request.get(`${API}/referees/?search=${encodeURIComponent(search)}`)
  const data = await res.json()
  for (const r of data) await apiDelete(request, r.id)
}

// Scoped row click — avoids strict mode errors when duplicate names exist
// (e.g. from a previous failed test run that didn't clean up)
function clickRow(page, name) {
  return page.getByTestId('referee-row').filter({ hasText: name }).first().click()
}

// ─── list page ──────────────────────────────────────────────────────────────

test('list page renders heading and add button', async ({ page }) => {
  await page.goto('/referees')
  await expect(page.getByRole('heading', { name: 'Referees' })).toBeVisible()
  await expect(page.getByTestId('add-referee-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ─────────────────────────────────────────────────────────────────────

test('add referee modal opens and creates a referee', async ({ page, request }) => {
  await page.goto('/referees')

  await page.getByTestId('add-referee-btn').click()
  await expect(page.getByText('Add Referee', { exact: true })).toBeVisible()

  await page.getByTestId('input-first-name').fill('Playwright')
  await page.getByTestId('input-last-name').fill('Tester')
  await page.getByTestId('input-phone').fill('6911111111')
  await page.getByTestId('input-email').fill('pw@test.com')
  await page.getByTestId('btn-save').click()

  // modal closes and new row appears
  await expect(page.getByText('Add Referee', { exact: true })).not.toBeVisible()
  await expect(page.getByTestId('referee-row').filter({ hasText: 'Playwright Tester' }).first()).toBeVisible()

  // cleanup
  const res = await request.get(`${API}/referees/?search=Playwright`)
  const data = await res.json()
  for (const r of data) await apiDelete(request, r.id)
})

test('add modal shows error when required field is blank', async ({ page }) => {
  await page.goto('/referees')
  await page.getByTestId('add-referee-btn').click()

  // submit without filling anything
  await page.getByTestId('btn-save').click()
  await expect(page.getByText(/required/i)).toBeVisible()
})

// ─── details ─────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'Detail')
  const id = await apiCreate(request, { first_name: 'Detail', last_name: 'View', phone: '6922222222' })

  await page.goto('/referees')
  await clickRow(page, 'Detail View')

  await expect(page.getByText('Referee Details')).toBeVisible()
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates referee', async ({ page, request }) => {
  await apiCleanup(request, 'EditMe')
  await apiCleanup(request, 'Edited')
  const id = await apiCreate(request, { first_name: 'EditMe', last_name: 'Please', phone: '6933333333' })

  await page.goto('/referees')
  await clickRow(page, 'EditMe Please')
  await page.getByTestId('btn-edit').click()

  await expect(page.getByText('Edit Referee', { exact: true })).toBeVisible()
  const firstNameInput = page.getByTestId('input-first-name')
  await firstNameInput.clear()
  await firstNameInput.fill('Edited')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('referee-row').filter({ hasText: 'Edited Please' }).first()).toBeVisible()

  await apiDelete(request, id)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete modal removes referee from list', async ({ page, request }) => {
  await apiCleanup(request, 'ToDelete')
  const id = await apiCreate(request, { first_name: 'ToDelete', last_name: 'Me', phone: '6944444444' })

  await page.goto('/referees')
  await clickRow(page, 'ToDelete Me')
  await page.getByTestId('btn-delete').click()

  await expect(page.getByText('Delete Referee', { exact: true })).toBeVisible()
  await page.getByTestId('btn-confirm-delete').click()

  await expect(page.getByTestId('referee-row').filter({ hasText: 'ToDelete Me' })).toHaveCount(0)
  // no cleanup needed — already deleted
})

// ─── search ───────────────────────────────────────────────────────────────────

test('search filters the list', async ({ page, request }) => {
  await apiCleanup(request, 'Alpha')
  await apiCleanup(request, 'Beta')
  const id1 = await apiCreate(request, { first_name: 'Alpha', last_name: 'Search', phone: '6955555555' })
  const id2 = await apiCreate(request, { first_name: 'Beta', last_name: 'Search', phone: '6966666666' })

  await page.goto('/referees')
  await page.getByTestId('search-input').fill('Alpha')

  await expect(page.getByTestId('referee-row').filter({ hasText: 'Alpha Search' }).first()).toBeVisible()
  await expect(page.getByTestId('referee-row').filter({ hasText: 'Beta Search' })).toHaveCount(0)

  await apiDelete(request, id1)
  await apiDelete(request, id2)
})

// ─── close modal ──────────────────────────────────────────────────────────────

test('modal closes when X is clicked', async ({ page }) => {
  await page.goto('/referees')
  await page.getByTestId('add-referee-btn').click()
  await expect(page.getByText('Add Referee', { exact: true })).toBeVisible()
  await page.getByTestId('modal-close').click()
  await expect(page.getByText('Add Referee', { exact: true })).not.toBeVisible()
})
