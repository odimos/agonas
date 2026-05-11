import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'

export function ExportCSVButton({ onClick }) {
  const { t } = useLang()
  return (
    <button style={st.csvBtn} onClick={onClick}>
      <span className="material-symbols-outlined" style={st.icon}>download</span>
      {t('btn_export')}
    </button>
  )
}

export function AddButton({ label, onClick, testId }) {
  return (
    <button style={st.addBtn} onClick={onClick} data-testid={testId}>
      <span className="material-symbols-outlined" style={st.icon}>add</span>
      {label}
    </button>
  )
}

export function StatCard({ label, count, accentColor, valueColor, style }) {
  return (
    <div style={{ ...st.statCard, borderLeftColor: accentColor ?? colors.tertiary, ...style }}>
      <p style={st.statLabel}>{label}</p>
      <p style={{ ...st.statValue, color: valueColor ?? colors.onSurface }}>{count}</p>
    </div>
  )
}

export function PageHeader({ title, addLabel, onAdd, onExport, addTestId }) {
  return (
    <div style={st.header}>
      <h1 style={st.title}>{title}</h1>
      <div style={st.actions}>
        <ExportCSVButton onClick={onExport} />
        <AddButton label={addLabel} onClick={onAdd} testId={addTestId} />
      </div>
    </div>
  )
}

const st = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  csvBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    fontFamily: fonts.label,
    whiteSpace: 'nowrap',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 1.25rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: fonts.label,
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  icon: {
    fontSize: '1rem',
    verticalAlign: 'middle',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    backgroundColor: colors.surfaceContainerLowest,
    borderLeft: '4px solid',
    borderRadius: radius.lg,
    padding: '1.5rem 1.5rem 1.5rem 1.75rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    minWidth: '200px',
  },
  statLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    margin: 0,
    fontFamily: fonts.label,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    lineHeight: '2.25rem',
    fontFamily: fonts.headline,
  },
}
