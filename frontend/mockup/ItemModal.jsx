import { useState } from 'react'
import { colors, fonts, radius } from './styles'

export default function ItemModal({ title, subtitle, onClose, onDelete, children }) {
  const [editing, setEditing] = useState(false)

  function handleDelete() {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      onDelete?.()
      onClose()
    }
  }

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={st.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={st.header}>
          <div>
            <h2 style={st.title}>{title}</h2>
            {subtitle && <p style={st.subtitle}>{subtitle}</p>}
          </div>
          <button style={st.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: colors.onSurfaceVariant }}>close</span>
          </button>
        </div>

        {/* Content — render prop passes editing state down */}
        <div style={st.content}>
          {typeof children === 'function' ? children(editing) : children}
        </div>

        {/* Footer */}
        <div style={st.footer}>
          {editing ? <div /> : (
            <button style={st.deleteBtn} onClick={handleDelete}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete_forever</span>
              Διαγραφή
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {editing ? (
              <>
                <button style={st.cancelBtn} onClick={() => setEditing(false)}>Ακύρωση</button>
                <button style={st.saveBtn}>Αποθήκευση</button>
              </>
            ) : (
              <button style={st.editBtn} onClick={() => setEditing(true)}>Επεξεργασία</button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

const st = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.onSurface}33`,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: colors.surfaceContainerLowest,
    width: '100%',
    maxWidth: '672px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: radius.lg,
    border: `1px solid ${colors.outlineVariant}33`,
    boxShadow: '0 12px 32px rgba(25,28,28,0.12)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: colors.surfaceContainerLow,
    borderBottom: `1px solid ${colors.outlineVariant}1a`,
    flexShrink: 0,
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  subtitle: {
    fontSize: '0.5625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
    margin: '0.125rem 0 0',
    fontFamily: fonts.label,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: radius.DEFAULT,
    color: colors.onSurfaceVariant,
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '2rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    backgroundColor: colors.surfaceContainerHigh,
    borderTop: `1px solid ${colors.outlineVariant}1a`,
    flexShrink: 0,
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'none',
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.error,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  editBtn: {
    padding: '0.5rem 2rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  cancelBtn: {
    padding: '0.5rem 1.25rem',
    backgroundColor: 'transparent',
    color: colors.onSurfaceVariant,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
  saveBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: fonts.label,
  },
}
