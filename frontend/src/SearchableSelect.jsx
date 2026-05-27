import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { colors, fonts, radius } from './styles'

// options: [{ value, label }]
// onChange(value | null)
export default function SearchableSelect({
  value, options = [], onChange,
  style, getLabel, testId, disabled, required,
}) {
  const [editing, setEditing] = useState(false)
  const [query, setQuery]     = useState('')
  const [menuRect, setMenuRect] = useState(null)
  const rootRef               = useRef(null)
  const inputRef              = useRef(null)
  const menuRef               = useRef(null)

  const currentLabel = getLabel ? getLabel(value) : (options.find(o => String(o.value) === String(value))?.label ?? '')

  const sorted = useMemo(
    () => [...options].sort((a, b) => String(a.label).localeCompare(String(b.label), 'el')),
    [options],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter(o => String(o.label).toLowerCase().includes(q))
  }, [sorted, query])

  function openEdit() {
    if (disabled) return
    setQuery(currentLabel || '')
    setEditing(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  function close() {
    setEditing(false)
    setQuery('')
  }

  function pick(v) {
    onChange(v)
    close()
  }

  useEffect(() => {
    if (!editing) return
    function updateRect() {
      const r = rootRef.current?.getBoundingClientRect()
      if (r) setMenuRect({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 192) })
    }
    updateRect()
    function onDocClick(e) {
      const inRoot = rootRef.current?.contains(e.target)
      const inMenu = menuRef.current?.contains(e.target)
      if (!inRoot && !inMenu) close()
    }
    function onKey(e) {
      if (e.key === 'Escape') close()
      else if (e.key === 'Enter' && filtered.length > 0) pick(filtered[0].value)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [editing, filtered])

  return (
    <span
      ref={rootRef}
      onClick={() => !editing && openEdit()}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        width: '100%', minWidth: 0, cursor: disabled ? 'default' : 'pointer',
      }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface,
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${colors.tertiary}`,
            outline: 'none',
            padding: '0.125rem 0',
            fontFamily: fonts.body,
            width: '100%', minWidth: '6rem',
            ...style,
          }}
        />
      ) : (
        <span
          style={{
            fontSize: '0.875rem', fontWeight: 600, color: colors.onSurface,
            flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            ...style,
            ...(disabled ? { opacity: 0.35 } : {}),
          }}
          data-testid={testId}
        >
          {currentLabel || '—'}
        </span>
      )}

      {editing && menuRect && createPortal(
        <div
          ref={menuRef}
          style={{ ...popup.menu, top: menuRect.top, left: menuRect.left, width: menuRect.width }}
        >
          <div style={popup.list}>
            {!required && (
              <button style={popup.option} onClick={() => pick(null)}>—</button>
            )}
            {filtered.length === 0 && (
              <div style={popup.empty}>Δεν βρέθηκαν αποτελέσματα</div>
            )}
            {filtered.map(o => (
              <button
                key={o.value}
                style={{
                  ...popup.option,
                  ...(String(o.value) === String(value) ? popup.optionActive : {}),
                }}
                onClick={() => pick(o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </span>
  )
}

const popup = {
  menu: {
    position: 'fixed', zIndex: 1000,
    minWidth: '12rem', maxWidth: '20rem',
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    display: 'flex', flexDirection: 'column',
    fontFamily: fonts.body,
  },
  list: {
    maxHeight: '14rem', overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
  },
  option: {
    textAlign: 'left',
    padding: '0.5rem 0.75rem',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.8125rem', color: colors.onSurface,
    fontFamily: fonts.body,
  },
  optionActive: {
    backgroundColor: `${colors.tertiary}22`,
    fontWeight: 700,
    color: colors.tertiary,
  },
  empty: {
    padding: '0.75rem',
    fontSize: '0.75rem', color: colors.outline,
    fontStyle: 'italic', textAlign: 'center',
  },
}
