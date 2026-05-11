// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const BASE_STADIUM = { name: 'TestStadium', phone: '2100000001', address: 'Test St 1' }

async function apiCreate(request, data = {}) {
  const res = await request.post(`${API}/stadiums/`, { data: { ...BASE_STADIUM, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/stadiums/${id}`)
}

async function apiCleanup(request, name) {
  const res = await request.get(`${API}/stadiums/?search=${encodeURIComponent(name)}`)
  const data = await res.json()
  for (const s of data.filter(s => s.name === name)) await apiDelete(request, s.id)
}

async function clickRow(page, name) {
  await page.getByTestId('search-input').fill(name)
  return page.getByTestId('stadium-row').filter({ hasText: name }).first().click()
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading, add button, and search input', async ({ page }) => {
  await page.goto('/entities/stadiums')
  await expect(page.getByRole('heading', { name: 'Γήπεδα' })).toBeVisible()
  await expect(page.getByTestId('add-stadium-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ──────────────────────────────────────────────────────────────────────

test('add stadium creates a new row and appears in list', async ({ page, request }) => {
  await apiCleanup(request, 'NewSpecStad')

  await page.goto('/entities/stadiums')
  await page.getByTestId('add-stadium-btn').click()

  await expect(page.locator('h2').filter({ hasText: 'Νέο Γήπεδο' })).toBeVisible()

  await page.getByTestId('input-name').fill('NewSpecStad')
  await page.getByTestId('input-phone').fill('2100000099')
  await page.getByTestId('input-address').fill('123 Spec Ave')
  await page.getByTestId('btn-save').click()

  await expect(page.locator('h2').filter({ hasText: 'Νέο Γήπεδο' })).not.toBeVisible()
  await page.getByTestId('search-input').fill('NewSpecStad')
  await expect(
    page.getByTestId('stadium-row').filter({ hasText: 'NewSpecStad' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'NewSpecStad')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'DetailStad')
  const id = await apiCreate(request, { name: 'DetailStad' })

  await page.goto('/entities/stadiums')
  await clickRow(page, 'DetailStad')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Γηπέδου')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates stadium name and list reflects change', async ({ page, request }) => {
  await apiCleanup(request, 'EditStad')
  await apiCleanup(request, 'EditedStad')
  const id = await apiCreate(request, { name: 'EditStad' })

  await page.goto('/entities/stadiums')
  await clickRow(page, 'EditStad')
  await page.getByTestId('btn-edit').click()

  const nameInput = page.getByTestId('input-name')
  await nameInput.clear()
  await nameInput.fill('EditedStad')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await page.getByTestId('search-input').fill('EditedStad')
  await expect(
    page.getByTestId('stadium-row').filter({ hasText: 'EditedStad' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'EditedStad')
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete removes stadium from list', async ({ page, request }) => {
  await apiCleanup(request, 'DeleteStad')
  await apiCreate(request, { name: 'DeleteStad' })

  await page.goto('/entities/stadiums')
  await clickRow(page, 'DeleteStad')

  page.on('dialog', dialog => dialog.accept())
  await page.getByTestId('btn-delete').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await expect(
    page.getByTestId('stadium-row').filter({ hasText: 'DeleteStad' })
  ).toHaveCount(0)
})

// ─── search ───────────────────────────────────────────────────────────────────

test('search filters the stadium list', async ({ page, request }) => {
  await apiCleanup(request, 'AlphaStad')
  await apiCleanup(request, 'BetaStad')
  const id1 = await apiCreate(request, { name: 'AlphaStad' })
  const id2 = await apiCreate(request, { name: 'BetaStad' })

  await page.goto('/entities/stadiums')
  await page.getByTestId('search-input').fill('AlphaStad')

  await expect(
    page.getByTestId('stadium-row').filter({ hasText: 'AlphaStad' }).first()
  ).toBeVisible()
  await expect(
    page.getByTestId('stadium-row').filter({ hasText: 'BetaStad' })
  ).toHaveCount(0)

  await apiDelete(request, id1)
  await apiDelete(request, id2)
})

// ─── close modal ──────────────────────────────────────────────────────────────

test('create modal closes when X is clicked', async ({ page }) => {
  await page.goto('/entities/stadiums')
  await page.getByTestId('add-stadium-btn').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέο Γήπεδο' })).toBeVisible()
  await page.getByTestId('modal-close').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέο Γήπεδο' })).not.toBeVisible()
})
