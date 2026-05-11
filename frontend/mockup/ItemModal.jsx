import { useState } from 'react'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'

export default function ItemModal({ title, subtitle, badge, maxWidth = '672px', onClose, onDelete, children }) {
  const [editing, setEditing] = useState(false)
  const { t } = useLang()

  function handleDelete() {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      onDelete?.()
      onClose()
    }
  }

  return (
    <div style={st.overlay} onClick={onClose}>
      <div style={{ ...st.modal, maxWidth }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={st.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <h2 style={st.title}>{title}</h2>
              {badge}
            </div>
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
              {t('modal_delete')}
            </button>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {editing ? (
              <>
                <button style={st.cancelBtn} onClick={() => setEditing(false)}>{t('modal_cancel')}</button>
                <button style={st.saveBtn}>{t('modal_save')}</button>
              </>
            ) : (
              <button style={st.editBtn} onClick={() => setEditing(true)}>{t('modal_edit')}</button>
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
    backgroundColor: `${colors.onSurface}66`,
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
    borderRadius: radius.DEFAULT,
    border: `1px solid ${colors.outlineVariant}4d`,
    boxShadow: '0 12px 32px rgba(25,28,28,0.12)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: colors.surfaceContainerHigh,
    borderBottom: `1px solid ${colors.outlineVariant}80`,
    flexShrink: 0,
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: colors.onSurface,
    margin: 0,
    fontFamily: fonts.headline,
  },
  subtitle: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: colors.onSurfaceVariant,
    margin: '0.1rem 0 0',
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
    padding: '1.5rem 2rem',
    backgroundColor: colors.surfaceContainerLow,
    borderTop: `1px solid ${colors.outlineVariant}4d`,
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
