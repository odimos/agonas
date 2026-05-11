import { useState, useEffect } from 'react'
import { colors, radius, fonts } from './styles'
import ModalField from './ModalField'
import { useLang } from './LangContext'
import { fetchAllAvailabilities } from './api/stadium_availabilities'
import { fetchPreferences, upsertPreference } from './api/team_preferences'

// form shape: { name, is_active, captain_id, vice_captain_id, comments }
export function initTeamForm(team = {}) {
  return {
    name:            team.name            ?? '',
    is_active:       team.is_active       ?? true,
    captain_id:      team.captain_id      ?? null,
    vice_captain_id: team.vice_captain_id ?? null,
    comments:        team.comments        ?? '',
  }
}

function OfficerCard({ circleColor, icon, label, playerId, players, editing, onChange, testId, t }) {
  const selected = players.find(p => p.id === playerId)
  return (
    <div style={{ ...st.card, borderLeftColor: circleColor }}>
      <div style={st.cardHeader}>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: circleColor }}>{icon}</span>
        <span style={st.cardLabel}>{label}</span>
      </div>
      {editing ? (
        players.length === 0 ? (
          <p style={st.cardEmpty}>{t('modal_no_players')}</p>
        ) : (
          <div style={{ position: 'relative' }}>
            <select
              style={{ ...st.playerSelect, borderBottomColor: circleColor }}
              value={playerId ?? ''}
              onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
              data-testid={testId}
            >
              <option value="">{t('modal_select_player')}</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined" style={st.selectChevron}>expand_more</span>
          </div>
        )
      ) : (
        <div style={st.cardText}>
          <p style={st.cardName}>
            {selected ? `${selected.first_name} ${selected.last_name}` : '—'}
          </p>
          {selected?.email && <p style={st.cardMeta}>{selected.email}</p>}
          {selected?.phone && <p style={st.cardMeta}>{selected.phone}</p>}
        </div>
      )}
    </div>
  )
}

const SCORE_COLORS = ['#e53935', '#ffc107', '#ff9800', '#4caf50']
const DAYS_SHORT = ['Δευτ', 'Τρίτ', 'Τετ', 'Πέμπ', 'Παρ', 'Σαββ', 'Κυρ']

function ScoreChip({ score, avId, editing, teamId, onChange }) {
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (!editing || busy) return
    const next = (score + 1) % 4
    setBusy(true)
    try { await upsertPreference(teamId, avId, next); onChange(avId, next) }
    finally { setBusy(false) }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
        padding: '0.5rem 0.625rem', borderRadius: radius.DEFAULT,
        backgroundColor: colors.surfaceContainerLow,
        border: `2px solid ${SCORE_COLORS[score]}`,
        cursor: editing ? 'pointer' : 'default', minWidth: '5rem', transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: '0.2rem' }}>
        {[1,2,3].map(i => (
          <span key={i} style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: i <= score ? SCORE_COLORS[score] : SCORE_COLORS[score] + '33' }} />
        ))}
      </div>
      <span style={{ fontSize: '0.625rem', fontWeight: 700, color: SCORE_COLORS[score], fontFamily: fonts.label }}>
        {score === 0 ? 'Όχι' : score === 1 ? 'Χαμηλή' : score === 2 ? 'Μέση' : 'Υψηλή'}
      </span>
    </div>
  )
}

function StadiumAccordion({ stadium, slots, prefs, editing, teamId, onPrefChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${colors.outlineVariant}33`, borderRadius: radius.DEFAULT, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: colors.surfaceContainerLowest, border: 'none', cursor: 'pointer', fontFamily: fonts.body }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface }}>{stadium.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', color: colors.outline }}>{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: colors.onSurfaceVariant, transform: open ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}>expand_more</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: colors.surface }}>
          {slots.map(av => {
            const pref = prefs.find(p => p.availability_id === av.id)
            const score = pref ? pref.score : 0
            return (
              <div key={av.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: colors.onSurfaceVariant, fontFamily: fonts.label, textTransform: 'uppercase' }}>
                  {DAYS_SHORT[av.day]} {av.start_time.slice(0,5)}
                </span>
                <ScoreChip score={score} avId={av.id} editing={editing} teamId={teamId} onChange={onPrefChange} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TeamModalContent({ form, setForm, editing, players = [], availablePlayers = [], onAddPlayer, onRemovePlayer, teamId }) {
  const { t } = useLang()
  const set = field => value => setForm(f => ({ ...f, [field]: value }))
  const [addPickerOpen, setAddPickerOpen] = useState(false)
  const [addingId, setAddingId] = useState('')
  const [addBusy, setAddBusy] = useState(false)
  const [availabilities, setAvailabilities] = useState([])
  const [prefs, setPrefs] = useState([])
  const [stadiums, setStadiums] = useState([])

  useEffect(() => {
    fetchAllAvailabilities().then(avs => {
      setAvailabilities(avs)
      const stadiumMap = {}
      avs.forEach(av => { if (!stadiumMap[av.stadium_id]) stadiumMap[av.stadium_id] = { id: av.stadium_id, name: av.stadium_name } })
      setStadiums(Object.values(stadiumMap))
    }).catch(() => {})
    if (teamId) fetchPreferences(teamId).then(setPrefs).catch(() => {})
  }, [teamId])

  function handlePrefChange(avId, score) {
    setPrefs(prev => {
      const existing = prev.find(p => p.availability_id === avId)
      if (existing) return prev.map(p => p.availability_id === avId ? { ...p, score } : p)
      return [...prev, { availability_id: avId, score, team_id: teamId }]
    })
  }

  async function handleAdd() {
    if (!addingId || !onAddPlayer) return
    setAddBusy(true)
    try {
      await onAddPlayer(Number(addingId))
      setAddingId('')
      setAddPickerOpen(false)
    } finally {
      setAddBusy(false)
    }
  }

  return (
    <div style={st.body}>

      {/* Team identity row */}
      <div style={st.identityRow}>
        <div style={st.logoWrap}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: colors.onSurfaceVariant }}>shield</span>
          {editing && (
            <label style={st.logoOverlay}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>photo_camera</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} />
            </label>
          )}
        </div>
        {editing ? (
          <input
            style={st.nameInput}
            value={form.name}
            onChange={e => set('name')(e.target.value)}
            data-testid="input-name"
          />
        ) : (
          <h3 style={st.teamName} data-testid="team-detail-name">{form.name}</h3>
        )}
      </div>

      {/* Active toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={st.sectionLabel}>{t('modal_active_label')}</span>
        <input
          type="checkbox"
          checked={form.is_active}
          disabled={!editing}
          onChange={e => set('is_active')(e.target.checked)}
          data-testid="input-is-active"
          style={{ cursor: editing ? 'pointer' : 'default' }}
        />
      </div>

      {/* Captain + Vice-captain */}
      <div style={st.officerGrid}>
        <OfficerCard
          circleColor={colors.tertiary}
          icon="stars"
          label={t('modal_captain')}
          playerId={form.captain_id}
          players={players}
          editing={editing}
          onChange={set('captain_id')}
          testId="input-captain"
          t={t}
        />
        <OfficerCard
          circleColor={colors.primaryContainer}
          icon="star_half"
          label={t('modal_vice')}
          playerId={form.vice_captain_id}
          players={players}
          editing={editing}
          onChange={set('vice_captain_id')}
          testId="input-vice-captain"
          t={t}
        />
      </div>

      {/* Comments */}
      <div>
        <label style={st.sectionLabel}>{t('modal_comments_label')}</label>
        {editing ? (
          <ModalField value={form.comments} editing onChange={set('comments')} multiline rows={3}
            placeholder="Enter administrative notes, sportsmanship records, or scheduling details..."
            testId="input-comments" />
        ) : (
          <div style={st.commentView}>
            {form.comments ? `"${form.comments}"` : <span style={{ fontStyle: 'normal', color: colors.outline }}>—</span>}
          </div>
        )}
      </div>

      {/* Players roster */}
      <div>
        <div style={st.playerList}>
          <div style={st.playerListHeader}>
            <span style={st.sectionLabel}>{t('modal_players_label')} ({players.length})</span>
            <button style={st.addBtn} onClick={() => setAddPickerOpen(v => !v)} data-testid="btn-add-player-open">
              <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>person_add</span>
              {t('modal_add_player')}
            </button>
          </div>

          {/* Inline add-player picker */}
          {addPickerOpen && (
            <div style={st.addPickerRow} data-testid="add-player-picker">
              <div style={{ position: 'relative', flex: 1 }}>
                <select
                  style={st.addSelect}
                  value={addingId}
                  onChange={e => setAddingId(e.target.value)}
                  data-testid="add-player-select"
                >
                  <option value="">{t('modal_select_player')}</option>
                  {availablePlayers.map(p => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined" style={st.selectChevron}>expand_more</span>
              </div>
              <button
                style={{ ...st.addBtn, opacity: (!addingId || addBusy) ? 0.5 : 1 }}
                onClick={handleAdd}
                disabled={!addingId || addBusy}
                data-testid="btn-add-player-confirm"
              >
                {addBusy ? '…' : t('btn_add')}
              </button>
              <button style={{ ...st.iconBtn, fontSize: '1rem' }} onClick={() => { setAddPickerOpen(false); setAddingId('') }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
              </button>
            </div>
          )}

          {players.length === 0 ? (
            <div style={st.emptyPlayers}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: colors.onSurfaceVariant }}>group</span>
              <p style={st.emptyText}>{t('modal_no_reg_players')}</p>
            </div>
          ) : (
            players.map(p => (
              <div key={p.id} style={st.playerRow} data-testid="team-detail-player">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <p style={st.playerName}>{p.first_name} {p.last_name}</p>
                  <span style={st.playerId}>ID: {p.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.125rem' }}>
                  <button style={st.iconBtn}><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>visibility</span></button>
                  <button
                    style={{ ...st.iconBtn, color: colors.error }}
                    onClick={() => onRemovePlayer?.(p)}
                    data-testid="btn-remove-player"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preferences */}
      {stadiums.length > 0 && (
        <div>
          <label style={st.sectionLabel}>Προτιμήσεις Γηπέδων</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stadiums.map(stadium => (
              <StadiumAccordion
                key={stadium.id}
                stadium={stadium}
                slots={availabilities.filter(av => av.stadium_id === stadium.id)}
                prefs={prefs}
                editing={editing}
                teamId={teamId}
                onPrefChange={handlePrefChange}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

const st = {
  body: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },

  identityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1rem 1.25rem',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.DEFAULT,
  },
  logoWrap: {
    position: 'relative',
    width: '4rem',
    height: '4rem',
    borderRadius: radius.DEFAULT,
    backgroundColor: colors.surfaceContainerHigh,
    border: `1px solid ${colors.outlineVariant}4d`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
  },
  teamName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  nameInput: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    fontFamily: fonts.headline,
    border: 'none',
    borderBottom: `2px solid ${colors.tertiary}`,
    background: 'transparent',
    outline: 'none',
    flex: 1,
    padding: '0.125rem 0',
  },

  officerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },

  card: {
    padding: '1rem 1.25rem',
    borderLeft: '4px solid',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: `0 ${radius.DEFAULT} ${radius.DEFAULT} 0`,
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' },
  cardLabel: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
  },
  cardText:  { display: 'flex', flexDirection: 'column', gap: 0 },
  cardName:  { fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface, margin: 0, lineHeight: 1.4, marginBottom: '0.125rem' },
  cardMeta:  { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: 0, lineHeight: 1.3 },
  cardEmpty: { fontSize: '0.75rem', color: colors.outline, fontStyle: 'italic', margin: 0, fontFamily: fonts.body },
  playerSelect: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    borderBottom: '2px solid',
    outline: 'none',
    padding: '0.5rem 1.75rem 0.5rem 0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    fontFamily: fonts.body,
    appearance: 'none',
    WebkitAppearance: 'none',
    boxSizing: 'border-box',
    display: 'block',
    cursor: 'pointer',
  },
  selectChevron: {
    position: 'absolute',
    right: '0.375rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    color: colors.onSurfaceVariant,
    pointerEvents: 'none',
  },

  addPickerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: colors.surfaceContainerLow,
    borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  addSelect: {
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    borderBottom: `2px solid ${colors.tertiary}`,
    outline: 'none',
    padding: '0.375rem 1.75rem 0.375rem 0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurface,
    fontFamily: fonts.body,
    appearance: 'none',
    WebkitAppearance: 'none',
    boxSizing: 'border-box',
    display: 'block',
    cursor: 'pointer',
  },

  sectionLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.5rem',
    fontFamily: fonts.label,
  },
  commentView: {
    padding: '0.875rem 1rem',
    backgroundColor: `${colors.surfaceVariant}4d`,
    borderLeft: `2px solid ${colors.outlineVariant}4d`,
    fontSize: '0.875rem',
    color: colors.onSurface,
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: colors.tertiary,
    color: colors.onTertiary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    fontFamily: fonts.label,
  },

  playerList: { border: `1px solid ${colors.outlineVariant}33`, overflow: 'hidden', borderRadius: radius.DEFAULT },
  playerListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: colors.surfaceContainerHigh,
    borderBottom: `1px solid ${colors.outlineVariant}1a`,
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.3rem 1rem',
    borderTop: `1px solid ${colors.outlineVariant}1a`,
  },
  playerName: { fontSize: '0.8125rem', fontWeight: 500, color: colors.onSurface, margin: 0 },
  playerId:   { fontSize: '0.6875rem', color: colors.onSurfaceVariant, fontFamily: 'monospace' },
  iconBtn:    { background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: colors.onSurfaceVariant, display: 'flex' },

  emptyPlayers: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '2rem',
    border: `1px solid ${colors.outlineVariant}22`,
    borderRadius: radius.DEFAULT,
    backgroundColor: colors.surfaceContainerLow,
  },
  emptyText: { fontSize: '0.75rem', color: colors.onSurfaceVariant, margin: 0 },
}
