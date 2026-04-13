// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const VALID = { name: 'TestStadium', phone: '2100000000', address: 'Athens' }

async function apiCreate(request, data) {
  const res = await request.post(`${API}/stadiums/`, { data: { ...VALID, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/stadiums/${id}`)
}

async function apiCleanup(request, search) {
  const res = await request.get(`${API}/stadiums/?search=${encodeURIComponent(search)}`)
  for (const s of await res.json()) await apiDelete(request, s.id)
}

function clickRow(page, name) {
  return page.getByTestId('stadium-row').filter({ hasText: name }).first().click()
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading and add button', async ({ page }) => {
  await page.goto('/stadiums')
  await expect(page.getByRole('heading', { name: 'Stadiums' })).toBeVisible()
  await expect(page.getByTestId('add-stadium-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ─────────────────────────────────────────────────────────────────────

test('add stadium creates a new row', async ({ page, request }) => {
  await apiCleanup(request, 'NewStadium')
  await page.goto('/stadiums')

  await page.getByTestId('add-stadium-btn').click()
  await expect(page.getByText('Add Stadium', { exact: true })).toBeVisible()

  await page.getByTestId('input-name').fill('NewStadium')
  await page.getByTestId('input-phone').fill('2101111111')
  await page.getByTestId('input-address').fill('Piraeus')
  await page.getByTestId('btn-save').click()

  await expect(page.getByText('Add Stadium', { exact: true })).not.toBeVisible()
  await expect(page.getByTestId('stadium-row').filter({ hasText: 'NewStadium' }).first()).toBeVisible()

  await apiCleanup(request, 'NewStadium')
})

// ─── details ─────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'DetailStadium')
  const id = await apiCreate(request, { name: 'DetailStadium' })

  await page.goto('/stadiums')
  await clickRow(page, 'DetailStadium')

  await expect(page.getByText('Stadium Details')).toBeVisible()
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates stadium', async ({ page, request }) => {
  await apiCleanup(request, 'EditStadium')
  await apiCleanup(request, 'EditedStadium')
  const id = await apiCreate(request, { name: 'EditStadium' })

  await page.goto('/stadiums')
  await clickRow(page, 'EditStadium')
  await page.getByTestId('btn-edit').click()

  await expect(page.getByText('Edit Stadium', { exact: true })).toBeVisible()
  const nameInput = page.getByTestId('input-name')
  await nameInput.clear()
  await nameInput.fill('EditedStadium')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('stadium-row').filter({ hasText: 'EditedStadium' }).first()).toBeVisible()

  await apiCleanup(request, 'EditedStadium')
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete modal removes stadium', async ({ page, request }) => {
  await apiCleanup(request, 'DeleteStadium')
  await apiCreate(request, { name: 'DeleteStadium' })

  await page.goto('/stadiums')
  await clickRow(page, 'DeleteStadium')
  await page.getByTestId('btn-delete').click()

  await expect(page.getByText('Delete Stadium', { exact: true })).toBeVisible()
  await page.getByTestId('btn-confirm-delete').click()

  await expect(page.getByTestId('stadium-row').filter({ hasText: 'DeleteStadium' })).toHaveCount(0)
})
