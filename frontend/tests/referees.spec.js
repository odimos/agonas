// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const BASE_REFEREE = { first_name: 'Test', last_name: 'Ref', phone: '6900000001' }

async function apiCreate(request, data = {}) {
  const res = await request.post(`${API}/referees/`, { data: { ...BASE_REFEREE, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/referees/${id}`)
}

async function apiCleanup(request, firstName) {
  const res = await request.get(`${API}/referees/?search=${encodeURIComponent(firstName)}`)
  const data = await res.json()
  for (const r of data.filter(r => r.first_name === firstName)) await apiDelete(request, r.id)
}

async function clickRow(page, name) {
  await page.getByTestId('search-input').fill(name.split(' ')[0])
  return page.getByTestId('referee-row').filter({ hasText: name }).first().click()
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading, add button, and search input', async ({ page }) => {
  await page.goto('/entities/referees')
  await expect(page.getByRole('heading', { name: 'Διαιτητές' })).toBeVisible()
  await expect(page.getByTestId('add-referee-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ──────────────────────────────────────────────────────────────────────

test('add referee creates a new row and appears in list', async ({ page, request }) => {
  await apiCleanup(request, 'Playwright')

  await page.goto('/entities/referees')
  await page.getByTestId('add-referee-btn').click()

  await expect(page.locator('h2').filter({ hasText: 'Νέος Διαιτητής' })).toBeVisible()

  await page.getByTestId('input-first-name').fill('Playwright')
  await page.getByTestId('input-last-name').fill('Ref')
  await page.getByTestId('input-phone').fill('6911000001')
  await page.getByTestId('btn-save').click()

  await expect(page.locator('h2').filter({ hasText: 'Νέος Διαιτητής' })).not.toBeVisible()
  await page.getByTestId('search-input').fill('Playwright')
  await expect(
    page.getByTestId('referee-row').filter({ hasText: 'Playwright Ref' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'Playwright')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'Detail')
  const id = await apiCreate(request, { first_name: 'Detail', last_name: 'View', phone: '6922222222' })

  await page.goto('/entities/referees')
  await clickRow(page, 'Detail View')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Διαιτητή')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates referee and list reflects change', async ({ page, request }) => {
  await apiCleanup(request, 'EditMe')
  const id = await apiCreate(request, { first_name: 'EditMe', last_name: 'Before', phone: '6933333333' })

  await page.goto('/entities/referees')
  await clickRow(page, 'EditMe Before')
  await page.getByTestId('btn-edit').click()

  const lastNameInput = page.getByTestId('input-last-name')
  await lastNameInput.clear()
  await lastNameInput.fill('After')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await page.getByTestId('search-input').fill('EditMe')
  await expect(
    page.getByTestId('referee-row').filter({ hasText: 'EditMe After' }).first()
  ).toBeVisible()

  await apiDelete(request, id)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete removes referee from list', async ({ page, request }) => {
  await apiCleanup(request, 'ToDelete')
  await apiCreate(request, { first_name: 'ToDelete', last_name: 'Me', phone: '6944444444' })

  await page.goto('/entities/referees')
  await clickRow(page, 'ToDelete Me')

  page.on('dialog', dialog => dialog.accept())
  await page.getByTestId('btn-delete').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await expect(
    page.getByTestId('referee-row').filter({ hasText: 'ToDelete Me' })
  ).toHaveCount(0)
})

// ─── search ───────────────────────────────────────────────────────────────────

test('search filters the referee list', async ({ page, request }) => {
  await apiCleanup(request, 'AlphaRef')
  await apiCleanup(request, 'BetaRef')
  const id1 = await apiCreate(request, { first_name: 'AlphaRef', last_name: 'Search', phone: '6955555555' })
  const id2 = await apiCreate(request, { first_name: 'BetaRef',  last_name: 'Search', phone: '6966666666' })

  await page.goto('/entities/referees')
  await page.getByTestId('search-input').fill('AlphaRef')

  await expect(
    page.getByTestId('referee-row').filter({ hasText: 'AlphaRef Search' }).first()
  ).toBeVisible()
  await expect(
    page.getByTestId('referee-row').filter({ hasText: 'BetaRef Search' })
  ).toHaveCount(0)

  await apiDelete(request, id1)
  await apiDelete(request, id2)
})

// ─── close modal ──────────────────────────────────────────────────────────────

test('create modal closes when X is clicked', async ({ page }) => {
  await page.goto('/entities/referees')
  await page.getByTestId('add-referee-btn').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέος Διαιτητής' })).toBeVisible()
  await page.getByTestId('modal-close').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέος Διαιτητής' })).not.toBeVisible()
})
