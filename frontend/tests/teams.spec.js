// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'
const BASE_TEAM = { name: 'TestTeam', is_active: true }

async function apiCreate(request, data = {}) {
  const res = await request.post(`${API}/teams/`, { data: { ...BASE_TEAM, ...data } })
  return (await res.json()).id
}

async function apiDelete(request, id) {
  await request.delete(`${API}/teams/${id}`)
}

// Cleanup by exact name match to handle leftover records from failed runs
async function apiCleanup(request, name) {
  const res = await request.get(`${API}/teams/?search=${encodeURIComponent(name)}`)
  const teams = await res.json()
  for (const t of teams.filter(t => t.name === name)) await apiDelete(request, t.id)
}

function clickRow(page, name) {
  return page.getByTestId('team-row').filter({ hasText: name }).first().click()
}

// ─── list ─────────────────────────────────────────────────────────────────────

test('list page renders heading, add button, and search input', async ({ page }) => {
  await page.goto('/entities/teams')
  await expect(page.getByRole('heading', { name: 'Ομάδες' })).toBeVisible()
  await expect(page.getByTestId('add-team-btn')).toBeVisible()
  await expect(page.getByTestId('search-input')).toBeVisible()
})

// ─── add ──────────────────────────────────────────────────────────────────────

test('add team creates a new row and appears in list', async ({ page, request }) => {
  await apiCleanup(request, 'NewSpecTeam')

  await page.goto('/entities/teams')
  await page.getByTestId('add-team-btn').click()

  await expect(page.locator('h2').filter({ hasText: 'Νέα Ομάδα' })).toBeVisible()

  // The name input is a plain input inside the identity row (not a ModalField)
  await page.getByTestId('input-name').fill('NewSpecTeam')
  await page.getByTestId('btn-save').click()

  await expect(page.locator('h2').filter({ hasText: 'Νέα Ομάδα' })).not.toBeVisible()

  // Search to confirm row is present
  await page.getByTestId('search-input').fill('NewSpecTeam')
  await expect(
    page.getByTestId('team-row').filter({ hasText: 'NewSpecTeam' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'NewSpecTeam')
})

// ─── details ──────────────────────────────────────────────────────────────────

test('clicking a row opens the details modal', async ({ page, request }) => {
  await apiCleanup(request, 'DetailTeam')
  const id = await apiCreate(request, { name: 'DetailTeam' })

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('DetailTeam')
  await clickRow(page, 'DetailTeam')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Ομάδας')
  await expect(page.getByTestId('btn-edit')).toBeVisible()
  await expect(page.getByTestId('btn-delete')).toBeVisible()

  await apiDelete(request, id)
})

// ─── edit ─────────────────────────────────────────────────────────────────────

test('edit updates team name and list reflects change', async ({ page, request }) => {
  await apiCleanup(request, 'EditTeam')
  await apiCleanup(request, 'EditedTeam')
  const id = await apiCreate(request, { name: 'EditTeam' })

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('EditTeam')
  await clickRow(page, 'EditTeam')
  await page.getByTestId('btn-edit').click()

  const nameInput = page.getByTestId('input-name')
  await nameInput.clear()
  await nameInput.fill('EditedTeam')
  await page.getByTestId('btn-save-changes').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()

  // clear search and re-search for updated name
  await page.getByTestId('search-input').fill('EditedTeam')
  await expect(
    page.getByTestId('team-row').filter({ hasText: 'EditedTeam' }).first()
  ).toBeVisible()

  await apiCleanup(request, 'EditedTeam')
})

// ─── players roster in details ────────────────────────────────────────────────

test('details modal shows players assigned to the team', async ({ page, request }) => {
  await apiCleanup(request, 'RosterTeam')
  const teamId = await apiCreate(request, { name: 'RosterTeam' })

  const r1 = await request.post(`${API}/players/`, {
    data: { first_name: 'Alice', last_name: 'Roster', team_id: teamId },
  })
  const r2 = await request.post(`${API}/players/`, {
    data: { first_name: 'Bob', last_name: 'Roster', team_id: teamId },
  })
  const p1Id = (await r1.json()).id
  const p2Id = (await r2.json()).id

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('RosterTeam')
  await clickRow(page, 'RosterTeam')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Ομάδας')
  await expect(
    page.getByTestId('team-detail-player').filter({ hasText: 'Alice Roster' })
  ).toBeVisible()
  await expect(
    page.getByTestId('team-detail-player').filter({ hasText: 'Bob Roster' })
  ).toBeVisible()

  await request.delete(`${API}/players/${p1Id}`)
  await request.delete(`${API}/players/${p2Id}`)
  await apiDelete(request, teamId)
})

// ─── delete ───────────────────────────────────────────────────────────────────

test('delete removes team from list', async ({ page, request }) => {
  await apiCleanup(request, 'DeleteTeam')
  await apiCreate(request, { name: 'DeleteTeam' })

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('DeleteTeam')
  await clickRow(page, 'DeleteTeam')

  page.on('dialog', dialog => dialog.accept())
  await page.getByTestId('btn-delete').click()

  await expect(page.getByTestId('modal-title')).not.toBeVisible()
  await expect(
    page.getByTestId('team-row').filter({ hasText: 'DeleteTeam' })
  ).toHaveCount(0)
})

// ─── search ───────────────────────────────────────────────────────────────────

test('search filters the team list', async ({ page, request }) => {
  await apiCleanup(request, 'AlphaTeam')
  await apiCleanup(request, 'BetaTeam')
  const id1 = await apiCreate(request, { name: 'AlphaTeam' })
  const id2 = await apiCreate(request, { name: 'BetaTeam' })

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('AlphaTeam')

  await expect(
    page.getByTestId('team-row').filter({ hasText: 'AlphaTeam' }).first()
  ).toBeVisible()
  await expect(
    page.getByTestId('team-row').filter({ hasText: 'BetaTeam' })
  ).toHaveCount(0)

  await apiDelete(request, id1)
  await apiDelete(request, id2)
})

// ─── close modal ──────────────────────────────────────────────────────────────

test('create modal closes when X is clicked', async ({ page }) => {
  await page.goto('/entities/teams')
  await page.getByTestId('add-team-btn').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέα Ομάδα' })).toBeVisible()
  await page.getByTestId('modal-close').click()
  await expect(page.locator('h2').filter({ hasText: 'Νέα Ομάδα' })).not.toBeVisible()
})

// ─── add player to team ───────────────────────────────────────────────────────

test('add player button assigns a player to the team roster', async ({ page, request }) => {
  await apiCleanup(request, 'RosterAddTeam')
  const teamId = await apiCreate(request, { name: 'RosterAddTeam' })

  // create a free (unassigned) player to add
  const pr = await request.post(`${API}/players/`, {
    data: { first_name: 'AddSpec', last_name: 'Player' },
  })
  const playerId = (await pr.json()).id

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('RosterAddTeam')
  await clickRow(page, 'RosterAddTeam')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Ομάδας')

  // open the picker
  await page.getByTestId('btn-add-player-open').click()
  await expect(page.getByTestId('add-player-picker')).toBeVisible()

  // select the player and confirm
  await page.getByTestId('add-player-select').selectOption({ value: String(playerId) })
  await page.getByTestId('btn-add-player-confirm').click()

  // picker closes and player appears in roster
  await expect(page.getByTestId('add-player-picker')).not.toBeVisible()
  await expect(
    page.getByTestId('team-detail-player').filter({ hasText: 'AddSpec Player' })
  ).toBeVisible()

  // verify via API that player now belongs to the team
  const check = await request.get(`${API}/players/${playerId}`)
  expect((await check.json()).team_id).toBe(teamId)

  // cleanup
  await request.delete(`${API}/players/${playerId}`)
  await apiDelete(request, teamId)
})

// ─── remove player from team ──────────────────────────────────────────────────

test('trash button removes a player from the team roster', async ({ page, request }) => {
  await apiCleanup(request, 'RosterRemoveTeam')
  const teamId = await apiCreate(request, { name: 'RosterRemoveTeam' })

  // create a player already on this team
  const pr = await request.post(`${API}/players/`, {
    data: { first_name: 'RemoveSpec', last_name: 'Player', team_id: teamId },
  })
  const playerId = (await pr.json()).id

  await page.goto('/entities/teams')
  await page.getByTestId('search-input').fill('RosterRemoveTeam')
  await clickRow(page, 'RosterRemoveTeam')

  await expect(page.getByTestId('modal-title')).toHaveText('Λεπτομέρειες Ομάδας')
  await expect(
    page.getByTestId('team-detail-player').filter({ hasText: 'RemoveSpec Player' })
  ).toBeVisible()

  // click the trash button on this player's row
  await page.getByTestId('team-detail-player')
    .filter({ hasText: 'RemoveSpec Player' })
    .getByTestId('btn-remove-player')
    .click()

  // player disappears from roster
  await expect(
    page.getByTestId('team-detail-player').filter({ hasText: 'RemoveSpec Player' })
  ).not.toBeVisible()

  // verify via API that player's team_id is now null
  const check = await request.get(`${API}/players/${playerId}`)
  expect((await check.json()).team_id).toBeNull()

  // cleanup
  await request.delete(`${API}/players/${playerId}`)
  await apiDelete(request, teamId)
})
