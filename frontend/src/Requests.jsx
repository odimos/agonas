import { useState } from 'react'
import { colors, fonts, radius, s } from './styles'
import { PageHeader } from './Buttons'
import { useLang } from './LangContext'

const MOCK_REQUESTS = [
  {
    id: 1,
    name: 'Silver Creek FC',
    initials: 'SC',
    avatarBg: colors.surfaceContainerHigh,
    avatarColor: colors.primary,
    type: 'team',
    date: 'Oct 12, 2023',
    email: 'm.smith@silvercreek.com',
    phone: '+1 (555) 012-3456',
    status: 'approved',
  },
  {
    id: 2,
    name: 'Julian Alvarez',
    initials: 'JA',
    avatarBg: colors.tertiaryFixed,
    avatarColor: colors.onTertiaryFixed,
    type: 'individual',
    date: 'Oct 14, 2023',
    email: 'j.alvarez@gmail.com',
    phone: '+1 (555) 987-6543',
    status: 'pending',
  },
  {
    id: 3,
    name: 'North Valley Titans',
    initials: 'NV',
    avatarBg: colors.surfaceContainerHigh,
    avatarColor: colors.primary,
    type: 'team',
    date: 'Oct 15, 2023',
    email: 'titans.hq@northvalley.org',
    phone: '+1 (555) 444-2211',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Ryan Kostic',
    initials: 'RK',
    avatarBg: colors.errorContainer,
    avatarColor: colors.onErrorContainer,
    type: 'individual',
    date: 'Oct 09, 2023',
    email: 'ryan.k@provider.net',
    phone: '+1 (555) 321-0987',
    status: 'rejected',
  },
]

const STATUS_STYLE = {
  approved: { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  pending:  { backgroundColor: colors.surfaceContainerHigh, color: colors.onSurfaceVariant },
  rejected: { backgroundColor: colors.errorContainer, color: colors.onErrorContainer },
}

function StatusBadge({ status, label }) {
  return (
    <span style={{ ...st.badge, ...STATUS_STYLE[status] }}>{label}</span>
  )
}

function RequestRow({ req, t }) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      style={{ borderBottom: `1px solid ${colors.outlineVariant}1a`, backgroundColor: hovered ? colors.surfaceContainerLow : 'transparent', transition: 'background-color 0.15s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Name */}
      <td style={st.td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ ...st.avatar, backgroundColor: req.avatarBg, color: req.avatarColor }}>
            {req.initials}
          </div>
          <span style={st.nameText}>{req.name}</span>
        </div>
      </td>

      {/* Type */}
      <td style={st.td}>
        <span style={st.cellSecondary}>{req.type === 'team' ? t('req_type_team') : t('req_type_indiv')}</span>
      </td>

      {/* Date */}
      <td style={st.td}>
        <span style={st.cellSecondary}>{req.date}</span>
      </td>

      {/* Contact */}
      <td style={st.td}>
        <div style={st.contactEmail}>{req.email}</div>
        <div style={st.contactPhone}>{req.phone}</div>
      </td>

      {/* Status */}
      <td style={st.td}>
        <StatusBadge status={req.status} label={t(`req_${req.status}`)} />
      </td>

      {/* Actions */}
      <td style={{ ...st.td, textAlign: 'right' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
          <button style={st.actionBtn} title="View">
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>visibility</span>
          </button>
          <button style={{ ...st.actionBtn, color: colors.error }} title="Reject">
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>close</span>
          </button>
          <button style={{ ...st.actionBtn, color: colors.tertiary }} title="Approve">
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>check</span>
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function Requests() {
  const { t } = useLang()

  return (
    <div style={s.entitiesPage}>
      <PageHeader title={t('sm_requests')} />
      <p style={st.subtitle}>{t('req_subtitle')}</p>

      <div style={st.tableWrap}>
        <div style={{ overflowX: 'auto' }}>
          <table style={st.table}>
            <thead>
              <tr style={{ backgroundColor: colors.surfaceContainerLow }}>
                {['req_col_name', 'req_col_type', 'req_col_date', 'req_col_contact', 'req_col_status', 'req_col_actions'].map((key, i) => (
                  <th key={key} style={{ ...st.th, textAlign: i === 5 ? 'right' : 'left' }}>
                    {t(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_REQUESTS.map(req => (
                <RequestRow key={req.id} req={req} t={t} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const st = {
  subtitle: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    fontWeight: 500,
    margin: '-0.5rem 0 0',
    fontFamily: fonts.body,
  },
  tableWrap: {
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}33`,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem 1.5rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.label,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '1.25rem 1.5rem',
    verticalAlign: 'middle',
  },
  avatar: {
    width: '2rem',
    height: '2rem',
    borderRadius: radius.DEFAULT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: fonts.label,
  },
  nameText: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: colors.onSurface,
    fontFamily: fonts.body,
  },
  cellSecondary: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
  },
  contactEmail: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.onSurface,
    fontFamily: fonts.body,
  },
  contactPhone: {
    fontSize: '0.625rem',
    color: colors.onSurfaceVariant,
    fontFamily: fonts.body,
    marginTop: '0.125rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: radius.DEFAULT,
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: fonts.label,
  },
  actionBtn: {
    padding: '0.375rem',
    background: 'none',
    border: 'none',
    borderRadius: radius.DEFAULT,
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
}
