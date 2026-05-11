// @ts-check
import { test, expect } from '@playwright/test'

const API = 'http://localhost:8000/api'

// ── helpers ───────────────────────────────────────────────────────────────────

async function apiPost(request, path, data) {
  const res = await request.post(`${API}${path}`, { data })
  return (await res.json())
}

async function setup(request) {
  const home = await apiPost(request, '/teams/', { name: 'EventHome', is_active: true })
  const away = await apiPost(request, '/teams/', { name: 'EventAway', is_active: true })
  const ref = await apiPost(request, '/referees/', { first_name: 'Ev', last_name: 'Ref', phone: '6900000055' })
  const sta = await apiPost(request, '/stadiums/', { name: 'EvStad', phone: '2100000055', address: 'Ev St 1' })
  const match = await apiPost(request, '/matches/', {
    status: 'finished',
    home_team_id: home.id, away_team_id: away.id,
    referee_id: ref.id, stadium_id: sta.id,
    scheduled_at: '2026-09-01T18:00:00',
    home_score: 2, away_score: 1,
    home_fair_play: 0, away_fair_play: 0,
  })
  const player = await apiPost(request, '/players/', {
    first_name: 'EvPlayer', last_name: 'One', team_id: home.id,
  })
  return { home, away, match, player, ref, sta }
}

async function teardown(request, ids) {
  if (ids.match) await request.delete(`${API}/matches/${ids.match.id}`)
  if (ids.player) await request.delete(`${API}/players/${ids.player.id}`)
  if (ids.home) await request.delete(`${API}/teams/${ids.home.id}`)
  if (ids.away) await request.delete(`${API}/teams/${ids.away.id}`)
  if (ids.ref) await request.delete(`${API}/referees/${ids.ref.id}`)
  if (ids.sta) await request.delete(`${API}/stadiums/${ids.sta.id}`)
}

async function openMatchDetails(page, matchId) {
  await page.goto('/matches')
  await page.getByTestId('match-row').filter({ hasText: 'EventHome' }).first().click()
  await expect(page.getByTestId('modal-title')).toHaveText('Match Details')
}

// ── goals ─────────────────────────────────────────────────────────────────────

test('finished match details shows goals section with add button', async ({ page, request }) => {
  const ids = await setup(request)
  await openMatchDetails(page, ids.match.id)

  await expect(page.getByTestId('add-goal-btn')).toBeVisible()
  await teardown(request, ids)
})

test('add goal button hides when form is open', async ({ page, request }) => {
  const ids = await setup(request)
  await openMatchDetails(page, ids.match.id)

  await page.getByTestId('add-goal-btn').click()
  await expect(page.getByTestId('add-goal-btn')).not.toBeVisible()
  await expect(page.getByTestId('goal-player-select')).toBeVisible()

  await teardown(request, ids)
})

test('can add a goal and it appears in the list', async ({ page, request }) => {
  const ids = await setup(request)
  await openMatchDetails(page, ids.match.id)

  await page.getByTestId('add-goal-btn').click()
  const teamSel = page.getByTestId('goal-team-select')
  await expect(teamSel).toContainText('EventHome')
  await teamSel.selectOption({ label: 'EventHome' })
  const playerSel = page.getByTestId('goal-player-select')
  await expect(playerSel).toContainText('EvPlayer One')
  await playerSel.selectOption({ label: 'EvPlayer One' })
  await page.getByTestId('goal-minute-input').fill('45')
  await page.getByTestId('goal-add-btn').click()

  await expect(page.getByTestId('goal-row').filter({ hasText: 'EvPlayer One' })).toBeVisible()
  await expect(page.getByTestId('add-goal-btn')).toBeVisible()

  await teardown(request, ids)
})

test('can remove a goal', async ({ page, request }) => {
  const ids = await setup(request)
  // Pre-create goal via API
  await apiPost(request, '/match-player-goals/', {
    match_id: ids.match.id, player_id: ids.player.id, team_id: ids.home.id, minute: 30, own_goal: false,
  })

  await openMatchDetails(page, ids.match.id)
  await expect(page.getByTestId('goal-row')).toHaveCount(1)

  await page.getByTestId('goal-remove-btn').click()
  await expect(page.getByTestId('goal-row')).toHaveCount(0)

  await teardown(request, ids)
})

// ── cards ─────────────────────────────────────────────────────────────────────

test('finished match details shows cards section with add button', async ({ page, request }) => {
  const ids = await setup(request)
  await openMatchDetails(page, ids.match.id)

  await expect(page.getByTestId('add-card-btn')).toBeVisible()
  await teardown(request, ids)
})

test('add card button hides when form is open', async ({ page, request }) => {
  const ids = await setup(request)
  await openMatchDetails(page, ids.match.id)

  await page.getByTestId('add-card-btn').click()
  await expect(page.getByTestId('add-card-btn')).not.toBeVisible()
  await expect(page.getByTestId('card-player-select')).toBeVisible()

  await teardown(request, ids)
})

test('can add a card and it appears in the list', async ({ page, request }) => {
  const ids = await setup(request)
  await openMatchDetails(page, ids.match.id)

  await page.getByTestId('add-card-btn').click()
  await page.getByTestId('card-team-select').selectOption({ value: String(ids.home.id) })
  await page.getByTestId('card-player-select').selectOption({ value: String(ids.player.id) })
  await page.getByTestId('card-minute-input').fill('60')
  await page.getByTestId('card-type-select').selectOption('red')
  await page.getByTestId('card-add-btn').click()

  await expect(page.getByTestId('card-row').filter({ hasText: 'EvPlayer One' })).toBeVisible()
  await expect(page.getByTestId('add-card-btn')).toBeVisible()

  await teardown(request, ids)
})

test('can remove a card', async ({ page, request }) => {
  const ids = await setup(request)
  await apiPost(request, '/match-player-cards/', {
    match_id: ids.match.id, player_id: ids.player.id, team_id: ids.home.id, minute: 20, card_type: 'yellow',
  })

  await openMatchDetails(page, ids.match.id)
  await expect(page.getByTestId('card-row')).toHaveCount(1)

  await page.getByTestId('card-remove-btn').click()
  await expect(page.getByTestId('card-row')).toHaveCount(0)

  await teardown(request, ids)
})

// ── draft match has no goals/cards sections ───────────────────────────────────

test('draft match details has no goals or cards sections', async ({ page, request }) => {
  const draftRes = await request.post(`${API}/matches/`, { data: { status: 'draft' } })
  const draft = await draftRes.json()

  await page.goto('/matches')
  // Draft rows show "— draft —" text in the match column
  await page.getByTestId('match-row').filter({ hasText: '— draft —' }).first().click()
  await expect(page.getByTestId('modal-title')).toHaveText('Match Details')

  await expect(page.getByTestId('add-goal-btn')).not.toBeVisible()
  await expect(page.getByTestId('add-card-btn')).not.toBeVisible()

  await request.delete(`${API}/matches/${draft.id}`)
})
