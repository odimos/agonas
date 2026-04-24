import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import { colors, radius } from '../styles'

const GHOST = '1px solid rgba(194,200,194,0.2)'

const PHOTO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBkCHnAwmADB4NVNQl029WFv6xEjDW2ujhKW1D5szW1EdUo9ag9ORUcUCLaUe9DMvbJiY8BPok1c2xCeHmNuaV5_wjrimUUTomUrObt4xbRwxFj2DFuw1lSNEZt0_G-70h4qXyNPS2zW_PnJEuAtK7mcSeHqltTrFcmOBbajPqTHtgMb5243h_kGpJAkBl_F5A7vyL2RhSR7HN4UcOQwwVi44NnCMAdi_qEEvwuYu2_sxcXoxptbfBmZPuC-HxYcsMX2BCqiHLVKw'

const SQUAD = [
  { name: 'J. Vance',  pos: 'FWD', photo: PHOTO_URL },
  { name: 'M. Reyes',  pos: 'MID' },
  { name: 'T. Okafor', pos: 'DEF' },
  { name: 'L. Petrov', pos: 'GK',  posColor: colors.onSurfaceVariant },
  { name: 'S. Malik',  pos: 'MID' },
  { name: 'D. Santos', pos: 'DEF' },
  { name: 'A. Flores', pos: 'FWD' },
  { name: 'K. Yamada', pos: 'DEF' },
]

const FORM = ['L','W','W','D','W']
const FORM_COLOR = { W: colors.tertiary, D: colors.outline, L: colors.error }

const MATCH_HISTORY = [
  { home: 'Team North',    away: 'Southern Stars', score: '2 – 0', result: 'win',  meta: 'Away · Stars Ground', date: 'Apr 19', comp: 'Northern League'     },
  { home: 'Team North',    away: 'Northern Hawks',  score: '3 – 1', result: 'win',  meta: 'Home · Stadium Nord', date: 'Apr 12', comp: 'Northern League'     },
  { home: 'Coastal Elite', away: 'Team North',      score: '0 – 1', result: 'win',  meta: 'Away · Coast Arena',  date: 'Apr 8',  comp: 'Regional Cup'        },
  { home: 'Team North',    away: 'Metro United',    score: '2 – 2', result: 'draw', meta: 'Home · Stadium Nord', date: 'Apr 5',  comp: 'Northern League'     },
  { home: 'Western Rovers',away: 'Team North',      score: '1 – 0', result: 'loss', meta: 'Away · Rovers Park',  date: 'Mar 28', comp: 'Nat. Championship'   },
]

const RESULT_BORDER = { win: colors.tertiary, draw: colors.outline,         loss: colors.error }
const RESULT_COLOR  = { win: colors.tertiary, draw: colors.onSurfaceVariant, loss: colors.error }
const RESULT_LABEL  = { win: 'Win',           draw: 'Draw',                  loss: 'Loss'      }

export default function Team() {
  const [squadOpen, setSquadOpen] = useState(false)

  return (
    <div style={{ minHeight: '100dvh', background: colors.background, fontFamily: "'Inter', sans-serif", color: colors.onSurface }}>
      {/* TopAppBar */}
      <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', boxSizing: 'border-box', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '3.5rem', background: `${colors.surface}cc`, backdropFilter: 'blur(12px)', borderBottom: GHOST }}>
        <div style={{ width: '2rem' }} />
        <h1 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.primary, margin: 0 }}>My Team</h1>
        <button style={{ fontSize: '0.8rem', fontWeight: 600, color: colors.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
      </header>

      <main style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        {/* Hero */}
        <div style={{ position: 'relative' }}>
          <div style={{ height: '7rem', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.tertiary})` }} />
          <div style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, 50%)', bottom: 0 }}>
            <div style={{ width: '6rem', height: '6rem', borderRadius: '1rem', border: `4px solid ${colors.surface}`, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: '#1a3329', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.125rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: colors.secondaryContainer, fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: colors.secondaryContainer, letterSpacing: '0.15em', textTransform: 'uppercase' }}>North</span>
            </div>
          </div>
        </div>

        {/* Team identity */}
        <section style={{ marginTop: '4rem', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.25rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: colors.onSurface, margin: 0 }}>TEAM NORTH</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant, marginRight: '0.25rem' }}>Form</span>
            {FORM.map((f, i) => (
              <div key={i} style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: FORM_COLOR[f], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{f}</div>
            ))}
          </div>
        </section>

        {/* Season stats */}
        <section style={{ padding: '1.25rem 1rem 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { value: '12', label: 'Won',   color: colors.tertiary        },
              { value: '4',  label: 'Drawn', color: colors.onSurfaceVariant },
              { value: '2',  label: 'Lost',  color: colors.error            },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                <span style={{ fontSize: '1.875rem', fontWeight: 900, color }}>{value}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Squad */}
        <section style={{ marginTop: '1.25rem', padding: '0 1rem' }}>
          <button
            onClick={() => setSquadOpen(o => !o)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: colors.surfaceContainerLowest, border: GHOST, borderRadius: squadOpen ? `${radius.xl} ${radius.xl} 0 0` : radius.xl, padding: '0.75rem 1rem', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>person</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface }}>Squad</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 500, color: colors.onSurfaceVariant }}>{SQUAD.length} Players</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, transition: 'transform 0.2s', transform: squadOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
          </button>
          {squadOpen && (
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderTop: 'none', borderRadius: `0 0 ${radius.xl} ${radius.xl}`, overflow: 'hidden' }}>
              {SQUAD.map((p, i) => (
                <div key={i} style={{ padding: '0.625rem 1rem', borderTop: i === 0 ? 'none' : GHOST, fontSize: '0.875rem', fontWeight: 500, color: colors.onSurface }}>
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tournaments */}
        <section style={{ padding: '1.25rem 1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>Tournaments</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Northern League */}
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: GHOST, background: `${colors.surfaceContainerLow}99` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>social_leaderboard</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Northern League</span>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>2025/26</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {[
                  { label: 'Phase',    value: 'Group Stage', align: 'flex-start', valueStyle: { fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface } },
                  { label: 'Position', value: '2nd',         align: 'center',     valueStyle: { fontSize: '1.25rem', fontWeight: 900, color: colors.tertiary } },
                  { label: 'Points',   value: '34',          align: 'center',     valueStyle: { fontSize: '1.25rem', fontWeight: 900, color: colors.onSurface } },
                  { label: 'Played',   value: '18',          align: 'center',     valueStyle: { fontSize: '1.25rem', fontWeight: 900, color: colors.onSurface } },
                ].map(({ label, value, align, valueStyle }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: align, gap: '0.125rem' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>{label}</span>
                    <span style={valueStyle}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 1rem 0.75rem' }}>
                <div style={{ height: '0.375rem', background: colors.surfaceContainer, borderRadius: '1rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: colors.tertiary, borderRadius: '1rem', width: '67%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.55rem', color: colors.onSurfaceVariant }}>34 pts</span>
                  <span style={{ fontSize: '0.55rem', color: colors.onSurfaceVariant }}>51 pts max</span>
                </div>
              </div>
            </div>

            {/* Regional Cup */}
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: GHOST, background: `${colors.surfaceContainerLow}99` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.tertiary, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Regional Cup</span>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>2026</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Phase</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Quarter Final</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Next Match</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface }}>vs City FC · May 3</span>
                </div>
              </div>
              <div style={{ padding: '0 1rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {[colors.tertiary, colors.tertiary, colors.secondaryContainer, colors.surfaceContainer].map((bg, i) => (
                  <div key={i} style={{ flex: 1, height: '0.375rem', borderRadius: '1rem', background: bg }} />
                ))}
                <span style={{ fontSize: '0.55rem', color: colors.onSurfaceVariant, marginLeft: '0.25rem' }}>QF → SF → F</span>
              </div>
            </div>

            {/* National Championship (eliminated) */}
            <div style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', opacity: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: GHOST, background: `${colors.surfaceContainerLow}99` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>National Championship</span>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>2026</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurfaceVariant }}>Eliminated at</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface }}>Round of 16</span>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: colors.error, background: `${colors.errorContainer}80`, padding: '0.25rem 0.5rem', borderRadius: radius.full, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Eliminated</span>
              </div>
            </div>

          </div>
        </section>

        {/* Match History */}
        <section style={{ padding: '1.25rem 1rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>history</span>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.onSurface, margin: 0 }}>Match History</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MATCH_HISTORY.map((m, i) => (
              <div key={i} style={{ background: colors.surfaceContainerLowest, border: GHOST, borderRadius: radius.xl, overflow: 'hidden', display: 'flex', borderLeft: `4px solid ${RESULT_BORDER[m.result]}` }}>
                <div style={{ flex: 1, padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 900, color: colors.onSurface }}>{m.score}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: colors.onSurface, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{m.away}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{m.meta}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.625rem', color: colors.onSurfaceVariant }}>{m.date}</span>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, color: RESULT_COLOR[m.result], textTransform: 'uppercase' }}>{RESULT_LABEL[m.result]}</span>
                      <span style={{ fontSize: '0.55rem', color: colors.onSurfaceVariant, background: colors.surfaceContainer, padding: '0.125rem 0.375rem', borderRadius: radius.lg }}>{m.comp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
