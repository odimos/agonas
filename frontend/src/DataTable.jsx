import { useState, useEffect, useRef } from 'react'
import { colors, fonts, radius } from './styles'
import { useLang } from './LangContext'

const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: 'created_at',  label: 'Ημ. Δημιουργίας ↑' },
  { value: '-created_at', label: 'Ημ. Δημιουργίας ↓' },
  { value: 'name',        label: 'Αλφαβητικά Α→Ω' },
  { value: '-name',       label: 'Αλφαβητικά Ω→Α' },
]

export default function DataTable({ columns, rows, renderRow, search, onSearch, searchFields, total, ordering, onOrdering }) {
  const { t } = useLang()
  const [page, setPage] = useState(1)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)

  useEffect(() => {
    if (!sortOpen) return
    function close(e) { if (!sortRef.current?.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [sortOpen])

  // Client-side filtering when searchFields provided
  const filteredRows = (searchFields && search)
    ? rows.filter(row => {
        const q = search.toLowerCase()
        return searchFields.some(f => (row[f] ?? '').toLowerCase().includes(q))
      })
    : rows

  // Reset to page 1 whenever the dataset changes (search, new data)
  useEffect(() => { setPage(1) }, [filteredRows.length, search])

  const totalRows  = total ?? filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))
  const start      = (page - 1) * PAGE_SIZE
  const pageRows   = filteredRows.slice(start, start + PAGE_SIZE)

  // Build a compact page window: always show first, last, current ±1, with ellipsis
  function pageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(n => n >= 1 && n <= totalPages))
    const nums = [...set].sort((a, b) => a - b)
    // insert null as ellipsis marker where gaps > 1
    const result = []
    for (let i = 0; i < nums.length; i++) {
      if (i > 0 && nums[i] - nums[i - 1] > 1) result.push(null)
      result.push(nums[i])
    }
    return result
  }

  function goTo(n) {
    if (n >= 1 && n <= totalPages) setPage(n)
  }

  return (
    <div style={st.tableCard}>

      {/* Search Toolbar */}
      <div style={st.toolbar}>
        <div style={st.searchWrap}>
          <span className="material-symbols-outlined" style={st.searchIcon}>search</span>
          <input
            style={st.searchInput}
            placeholder={t('dt_search')}
            value={search}
            onChange={e => onSearch(e.target.value)}
            data-testid="search-input"
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={st.iconBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant }}>filter_list</span>
          </button>
          {onOrdering && (
            <div style={{ position: 'relative' }} ref={sortRef}>
              <button
                style={{ ...st.iconBtn, ...(ordering && ordering !== 'created_at' ? { backgroundColor: `${colors.primary}18` } : {}) }}
                onClick={() => setSortOpen(v => !v)}
                data-testid="sort-btn"
                title="Ταξινόμηση"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: ordering && ordering !== 'created_at' ? colors.primary : colors.onSurfaceVariant }}>sort</span>
              </button>
              {sortOpen && (
                <div style={st.sortDropdown} data-testid="sort-dropdown">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      style={{ ...st.sortOption, ...(ordering === opt.value ? st.sortOptionActive : {}) }}
                      onClick={() => { onOrdering(opt.value); setSortOpen(false) }}
                      data-testid={`sort-option-${opt.value}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable table area */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '560px' }}>

          {/* Column Headers */}
          <div style={st.thead}>
            {columns.map(col => (
              <div key={col.header} style={col.style}>
                <span style={st.th}>{col.header}</span>
              </div>
            ))}
          </div>

          {/* Rows — current page only */}
          <div>
            {pageRows.map((row, i) => renderRow(row, i === 0))}
          </div>

        </div>
      </div>

      {/* Pagination */}
      <div style={st.pagination}>
        <span style={st.paginationInfo}>
          {t('dt_showing')} {Math.min(start + PAGE_SIZE, totalRows) - start > 0 ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, totalRows)} {t('dt_of')} {totalRows}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            style={{ ...st.pageBtn, ...st.pageBtnIcon, opacity: page === 1 ? 0.4 : 1 }}
            disabled={page === 1}
            onClick={() => goTo(page - 1)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
          </button>

          {pageNumbers().map((n, i) =>
            n === null
              ? <span key={`ellipsis-${i}`} style={st.ellipsis}>…</span>
              : <button
                  key={n}
                  style={{ ...st.pageBtn, ...(n === page ? st.pageBtnActive : {}) }}
                  onClick={() => goTo(n)}
                  data-testid={n === page ? 'page-btn-active' : 'page-btn'}
                >
                  {n}
                </button>
          )}

          <button
            style={{ ...st.pageBtn, ...st.pageBtnIcon, opacity: page === totalPages ? 0.4 : 1 }}
            disabled={page === totalPages}
            onClick={() => goTo(page + 1)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
          </button>
        </div>
      </div>

    </div>
  )
}

const st = {
  tableCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.outlineVariant}22`,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: '560px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.9375rem',
    color: colors.outline,
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.375rem',
    backgroundColor: colors.surfaceContainerLow,
    border: 'none',
    borderRadius: radius.DEFAULT,
    fontSize: '0.875rem',
    color: colors.onSurface,
    fontFamily: fonts.body,
    outline: 'none',
    boxSizing: 'border-box',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.DEFAULT,
    cursor: 'pointer',
  },
  thead: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: `${colors.surfaceContainerHigh}80`,
    padding: '0 1.5rem',
    borderBottom: `1px solid ${colors.outlineVariant}22`,
  },
  th: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.onSurfaceVariant,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1.5rem',
    borderTop: `1px solid ${colors.outlineVariant}22`,
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
  },
  pageBtn: {
    minWidth: '2rem',
    height: '2rem',
    padding: '0 0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.onSurfaceVariant,
    cursor: 'pointer',
    fontFamily: fonts.body,
  },
  pageBtnIcon: {
    padding: '0',
    width: '2rem',
  },
  pageBtnActive: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: `1px solid ${colors.primary}`,
  },
  ellipsis: {
    fontSize: '0.875rem',
    color: colors.onSurfaceVariant,
    padding: '0 0.25rem',
    userSelect: 'none',
  },
  sortDropdown: {
    position: 'absolute',
    top: 'calc(100% + 0.375rem)',
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.DEFAULT,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 50,
    minWidth: '11rem',
    overflow: 'hidden',
  },
  sortOption: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.5rem 0.875rem',
    background: 'none',
    border: 'none',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.onSurface,
    cursor: 'pointer',
    fontFamily: fonts.body,
  },
  sortOptionActive: {
    backgroundColor: `${colors.primary}14`,
    color: colors.primary,
    fontWeight: 700,
  },
}
