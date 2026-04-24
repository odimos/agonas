import { useState, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'
const MY_TEAM = 'Team North'

const MATCH = {
  date: new Date(2026, 3, 19),
  opponent: 'Southern Stars',
  home: false,
  venue: 'Stars Ground',
  time: '17:00',
  tournament: 'Spring League 2026',
}

const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const HOME_TEAM = MATCH.home ? MY_TEAM : MATCH.opponent
const AWAY_TEAM = MATCH.home ? MATCH.opponent : MY_TEAM
const DATE_STR  = `${WEEKDAYS[MATCH.date.getDay()]}, ${SHORT_MONTHS[MATCH.date.getMonth()]} ${MATCH.date.getDate()}`

const PLAYERS = [
  'Jordan Vance', 'Marcus Silva', 'Leo Hartmann', 'Kai Russo',
  'Finn Olsen', 'Dante Cruz', 'Oscar Webb', 'Remy Blanc',
  'Noah Steele', 'Eli Thorn', 'Sam Adler',
]

const RATINGS = ['–', '0', '1', '2', '3', '4', '5']

function SectionHeader({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>{label}</span>
    </div>
  )
}

const selectStyle = { fontSize: '0.8rem', fontWeight: 600, color: colors.onSurface, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }

function GoalRow({ entry, players, onChange, onRemove }) {
  return (
    <div style={{ background: colors.surfaceContainerLow, borderRadius: radius.xl, padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <input
        type="number" min={1} max={120} placeholder="min"
        value={entry.minute}
        onChange={e => onChange({ ...entry, minute: e.target.value })}
        style={{ width: '2.8rem', fontSize: '0.75rem', fontWeight: 600, fontStyle: 'italic', color: colors.onSurface, background: 'transparent', border: 'none', borderBottom: `1px solid ${colors.outlineVariant}`, outline: 'none', textAlign: 'center', fontFamily: 'inherit', padding: '0.1rem 0', flexShrink: 0 }}
      />
      <select
        value={entry.player}
        onChange={e => onChange({ ...entry, player: e.target.value })}
        style={{ ...selectStyle, flex: 1, minWidth: 0, fontSize: '0.75rem' }}
      >
        <option value="">Player…</option>
        {players.map(p => <option key={p}>{p}</option>)}
      </select>
      <select
        value={entry.type}
        onChange={e => onChange({ ...entry, type: e.target.value })}
        style={{ ...selectStyle, fontSize: '0.7rem', color: entry.type === 'own_goal' ? colors.error : colors.tertiary, fontWeight: 700, flexShrink: 0 }}
      >
        <option value="goal">Goal</option>
        <option value="own_goal">OG</option>
      </select>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.onSurfaceVariant, display: 'flex', padding: '0.1rem', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
      </button>
    </div>
  )
}

function CardRow({ entry, players, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: colors.surfaceContainerLow, borderRadius: radius.xl, padding: '0.5rem 0.75rem' }}>
      <button
        onClick={() => onChange({ ...entry, type: entry.type === 'yellow' ? 'red' : 'yellow' })}
        style={{ width: '1.1rem', height: '1.5rem', borderRadius: '0.15rem', background: entry.type === 'yellow' ? '#f59e0b' : colors.error, border: 'none', cursor: 'pointer', flexShrink: 0 }}
      />
      <select
        value={entry.player}
        onChange={e => onChange({ ...entry, player: e.target.value })}
        style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: colors.onSurface, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
      >
        <option value="">Select player…</option>
        {players.map(p => <option key={p}>{p}</option>)}
      </select>
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.onSurfaceVariant, display: 'flex', padding: '0.1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
      </button>
    </div>
  )
}

export default function RefereeForm() {
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [goals, setGoals] = useState([])
  const [cards, setCards] = useState([])
  const [fairPlayHome, setFairPlayHome] = useState('')
  const [fairPlayAway, setFairPlayAway] = useState('')
  const [photos, setPhotos] = useState([{ src: null, team: '' }, { src: null, team: '' }, { src: null, team: '' }])
  const [comment, setComment] = useState('')
  const [commentOpen, setCommentOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const photoRefs = [useRef(), useRef(), useRef()]

  const TEAM_OPTIONS = ['', HOME_TEAM, AWAY_TEAM, 'Both']

  function onPhotoChange(i, e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhotos(p => p.map((x, j) => j === i ? { ...x, src: ev.target.result } : x))
    reader.readAsDataURL(file)
  }
  function setPhotoTeam(i, team) {
    setPhotos(p => p.map((x, j) => j === i ? { ...x, team } : x))
  }
  function removePhoto(i) {
    setPhotos(p => p.map((x, j) => j === i ? { src: null, team: '' } : x))
  }

  function addGoal() { setGoals(g => [...g, { player: '', minute: '', type: 'goal', id: Date.now() }]) }
  function addCard() { setCards(c => [...c, { player: '', minute: '', type: 'yellow', id: Date.now() }]) }
  function updateGoal(id, val) { setGoals(g => g.map(x => x.id === id ? { ...x, ...val } : x)) }
  function removeGoal(id)      { setGoals(g => g.filter(x => x.id !== id)) }
  function updateCard(id, val) { setCards(c => c.map(x => x.id === id ? { ...x, ...val } : x)) }
  function removeCard(id)      { setCards(c => c.filter(x => x.id !== id)) }

  if (submitted) {
    return (
      <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface, display: 'flex', flexDirection: 'column' }}>
        <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}e6`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary }}>Referee Form</span>
        </header>
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3.5rem 2rem 5rem' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: colors.secondaryContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2.25rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.onSurface, margin: 0 }}>Form Submitted</h2>
          <p style={{ fontSize: '0.875rem', color: colors.onSurfaceVariant, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>Your referee evaluation for {HOME_TEAM} vs {AWAY_TEAM} has been sent.</p>
          <button onClick={() => setSubmitted(false)} style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: colors.tertiary, background: 'none', border: `1.5px solid ${colors.tertiary}`, borderRadius: radius.full, padding: '0.5rem 1.5rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Back to form
          </button>
        </main>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface, overflowX: 'hidden' }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}e6`, backdropFilter: 'blur(12px)', borderBottom: GHOST, boxSizing: 'border-box' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary }}>Referee Form</span>
        <span style={{ fontSize: '0.6rem', color: colors.onSurfaceVariant, marginTop: '0.1rem' }}>{DATE_STR} · {MATCH.tournament}</span>
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>

        {/* Result */}
        <section style={{ padding: '0.75rem 0 1rem' }}>
          <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: 0, overflow: 'hidden', borderLeft: 'none', borderRight: 'none' }}>
            {[
              { team: HOME_TEAM, score: homeScore, setScore: setHomeScore },
              { team: AWAY_TEAM, score: awayScore, setScore: setAwayScore },
            ].map(({ team, score, setScore }, i, arr) => (
              <div key={team} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem', borderBottom: i < arr.length - 1 ? GHOST : 'none' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>{team}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => setScore(s => Math.max(0, s - 1))}
                    style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', border: GHOST, background: colors.surfaceContainer, color: colors.onSurface, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}
                  >−</button>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: colors.onSurface, minWidth: '1.5rem', textAlign: 'center', lineHeight: 1 }}>{score}</span>
                  <button
                    onClick={() => setScore(s => s + 1)}
                    style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', border: GHOST, background: colors.surfaceContainer, color: colors.onSurface, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', flexShrink: 0 }}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Photos */}
        <section style={{ padding: '0 0.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Photos</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div
                  onClick={() => !p.src && photoRefs[i].current.click()}
                  style={{ position: 'relative', aspectRatio: '1', borderRadius: radius.xl, overflow: 'hidden', background: colors.surfaceContainerLow, border: p.src ? 'none' : `1.5px dashed ${colors.outlineVariant}`, cursor: p.src ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {p.src ? (
                    <>
                      <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={e => { e.stopPropagation(); removePhoto(i) }}
                        style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>close</span>
                      </button>
                    </>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: colors.outlineVariant }}>add_photo_alternate</span>
                  )}
                </div>
                <select
                  value={p.team}
                  onChange={e => setPhotoTeam(i, e.target.value)}
                  style={{ fontSize: '0.65rem', fontWeight: 600, color: p.team ? colors.onSurface : colors.onSurfaceVariant, background: colors.surfaceContainer, border: GHOST, borderRadius: radius.xl, padding: '0.2rem 0.3rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', width: '100%', textAlign: 'center' }}
                >
                  <option value="">Team…</option>
                  {TEAM_OPTIONS.filter(t => t).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input ref={photoRefs[i]} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onPhotoChange(i, e)} />
              </div>
            ))}
          </div>
        </section>

        {/* Goals */}
        <section style={{ padding: '0 0.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Goals</span>
            </div>
            <button onClick={addGoal} style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.25rem', background: colors.tertiary, border: 'none', cursor: 'pointer', color: '#fff', fontSize: '1.25rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {goals.map(g => (
              <GoalRow key={g.id} entry={g} players={PLAYERS} onChange={val => updateGoal(g.id, val)} onRemove={() => removeGoal(g.id)} />
            ))}
          </div>
        </section>

        {/* Cards */}
        <section style={{ padding: '0 0.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>style</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Cards</span>
            </div>
            <button onClick={addCard} style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.25rem', background: colors.tertiary, border: 'none', cursor: 'pointer', color: '#fff', fontSize: '1.25rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cards.map(c => (
              <CardRow key={c.id} entry={c} players={PLAYERS} onChange={val => updateCard(c.id, val)} onRemove={() => removeCard(c.id)} />
            ))}
          </div>
        </section>

        {/* Fair Play */}
        <section style={{ padding: '0 0 1rem' }}>
          <div style={{ padding: '0 0.5rem' }}><SectionHeader icon="handshake" label="Fair Play" /></div>
          <div style={{ background: colors.surfaceContainerLowest, borderTop: GHOST, borderBottom: GHOST, padding: '0.4rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {[
              { label: HOME_TEAM, value: fairPlayHome, set: setFairPlayHome },
              { label: AWAY_TEAM, value: fairPlayAway, set: setFairPlayAway },
            ].map(({ label, value, set }, i, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, borderRight: i < arr.length - 1 ? GHOST : 'none', paddingRight: i < arr.length - 1 ? '0.5rem' : 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                <select
                  value={value}
                  onChange={e => set(e.target.value)}
                  style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.onSurface, background: colors.surfaceContainer, border: GHOST, borderRadius: radius.xl, padding: '0.3rem 0.4rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}
                >
                  {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Referee comment — collapsible */}
        <section style={{ padding: '0 0.5rem 1.5rem' }}>
          <button
            onClick={() => setCommentOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0.75rem', fontFamily: 'inherit' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>rate_review</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Referee Comment</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, transition: 'transform 0.2s', transform: commentOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
          </button>
          {commentOpen && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add any notes about the match, incidents, or player conduct…"
              rows={4}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.8rem', color: colors.onSurface, background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '0.75rem 1rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
            />
          )}
        </section>

        {/* Submit */}
        <div style={{ padding: '0 0.5rem 1rem' }}>
          <button
            onClick={() => setSubmitted(true)}
            style={{ width: '100%', padding: '0.875rem', background: colors.tertiary, color: '#fff', border: 'none', borderRadius: radius.xl, fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em' }}
          >
            Submit Form
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
