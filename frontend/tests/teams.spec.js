// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const VALID = { name: 'TestTeam', is_active: true }

async function apiCreate(request, data) {
  const res = await request.post(`${API}/teams/`, { data: { ...VALID, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/teams/${id}`)
}

async function apiCleanup(request, name) {
  const res = await request.get(`${API}/teams/?search=${encodeURIComponent(name)}`)
  const teams = await res.json()
  for (const t of teams.filter(t => t.name === name)) await apiDelete(request, t.id)
}

function clickRow(page, name) {
  return page.getByTestId('team-row').filter({ hasText: name }).first().click()
}

function modalTitle(page) {
  return page.getByTestId('modal-title')
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading and add button', async ({ page }) => {
  await page.goto('/teams')
  await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible()
  await expect(page.getByTestId('add-team-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ──────────────────────────────────────────────────────────────────────

test('add team creates a new row', async ({ page, request }) => {
  await apiCleanup(request, 'NewTeam')
  await page.goto('/teams')

  await page.getByTestId('add-team-btn').click()
  await expect(modalTitle(page)).toHaveText('Add Team')

  await page.getByTestId('input-name').fill('NewTeam')
  await page.getByTestId('btn-save').click()

  await expect(modalTitle(page)).not.toBeVisible()
  await expect(page.getByTestId('team-row').filter({ hasText: 'NewTeam' }).first()).toBeVisible()

  await apiCleanup(request, 'NewTeam')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens details modal', async ({ page, request }) => {
  await apiCleanup(request, 'DetailTeam')
  const id = await apiCreate(request, { name: 'DetailTeam' })

  await page.goto('/teams')
  await clickRow(page, 'DetailTeam')

  await expect(modalTitle(page)).toHaveText('Team Details')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit modal updates team', async ({ page, request }) => {
  await apiCleanup(request, 'EditTeam')
  await apiCleanup(request, 'EditedTeam')
  const id = await apiCreate(request, { name: 'EditTeam' })

  await page.goto('/teams')
  await clickRow(page, 'EditTeam')
  await page.getByTestId('btn-edit').click()

  await expect(modalTitle(page)).toHaveText('Edit Team')
  const nameInput = page.getByTestId('input-name')
  await nameInput.clear()
  await nameInput.fill('EditedTeam')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('team-row').filter({ hasText: 'EditedTeam' }).first()).toBeVisible()

  await apiCleanup(request, 'EditedTeam')
})

// ─── players list in details ──────────────────────────────────────────────────

test('details modal shows players assigned to the team', async ({ page, request }) => {
  await apiCleanup(request, 'RosterTeam')
  const teamId = await apiCreate(request, { name: 'RosterTeam' })

  // create two players assigned to this team
  const p1 = await request.post(`${API}/players/`, { data: { first_name: 'Alice', last_name: 'Roster', team_id: teamId } })
  const p2 = await request.post(`${API}/players/`, { data: { first_name: 'Bob', last_name: 'Roster', team_id: teamId } })
  const p1Id = (await p1.json()).id
  const p2Id = (await p2.json()).id

  await page.goto('/teams')
  await clickRow(page, 'RosterTeam')

  await expect(modalTitle(page)).toHaveText('Team Details')
  await expect(page.getByTestId('team-detail-player').filter({ hasText: 'Alice Roster' })).toBeVisible()
  await expect(page.getByTestId('team-detail-player').filter({ hasText: 'Bob Roster' })).toBeVisible()

  // cleanup
  await request.delete(`${API}/players/${p1Id}`)
  await request.delete(`${API}/players/${p2Id}`)
  await apiDelete(request, teamId)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete modal removes team', async ({ page, request }) => {
  await apiCleanup(request, 'DeleteTeam')
  await apiCreate(request, { name: 'DeleteTeam' })

  await page.goto('/teams')
  await clickRow(page, 'DeleteTeam')
  await page.getByTestId('btn-delete').click()

  await expect(modalTitle(page)).toHaveText('Delete Team')
  await page.getByTestId('btn-confirm-delete').click()

  await expect(page.getByTestId('team-row').filter({ hasText: 'DeleteTeam' })).toHaveCount(0)
})
