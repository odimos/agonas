import { colors, fonts } from './styles'

export default function ModalField({ label, value, onChange, editing, icon, type = 'text', multiline = false, span2 = false, placeholder = '', rows = 4 }) {
  const inputSt = {
    ...st.input,
    borderBottomColor: editing ? colors.primary : `${colors.outlineVariant}4d`,
    cursor: editing ? 'text' : 'default',
    paddingLeft: icon ? '2.25rem' : '0.75rem',
  }

  return (
    <div style={span2 ? { gridColumn: '1 / -1' } : {}}>
      <label style={st.label}>{label}</label>
      {multiline ? (
        <textarea
          style={{ ...inputSt, resize: 'none', width: '100%', boxSizing: 'border-box', paddingLeft: '0.75rem' }}
          value={value}
          readOnly={!editing}
          onChange={e => onChange?.(e.target.value)}
          rows={rows}
          placeholder={editing ? placeholder : ''}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          {icon && (
            <span className="material-symbols-outlined" style={{ ...st.icon, color: colors.tertiary }}>
              {icon}
            </span>
          )}
          <input
            style={{ ...inputSt, width: '100%', boxSizing: 'border-box' }}
            type={type}
            value={value}
            readOnly={!editing}
            onChange={e => onChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

const st = {
  label: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    marginBottom: '0.375rem',
    fontFamily: fonts.label,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    border: 'none',
    borderBottom: `2px solid`,
    outline: 'none',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.onSurface,
    fontFamily: fonts.body,
    transition: 'border-color 0.15s ease',
    display: 'block',
  },
  icon: {
    position: 'absolute',
    left: '0.625rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1rem',
    pointerEvents: 'none',
  },
}
