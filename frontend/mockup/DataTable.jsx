import { colors, fonts, radius } from './styles'

export default function DataTable({ columns, rows, renderRow, search, onSearch, total }) {
  return (
    <div style={st.tableCard}>

      {/* Search Toolbar */}
      <div style={st.toolbar}>
        <div style={st.searchWrap}>
          <span className="material-symbols-outlined" style={st.searchIcon}>search</span>
          <input
            style={st.searchInput}
            placeholder="Search..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={st.iconBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant }}>filter_list</span>
          </button>
          <button style={st.iconBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: colors.onSurfaceVariant }}>sort</span>
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div style={st.thead}>
        {columns.map(col => (
          <div key={col.header} style={col.style}>
            <span style={st.th}>{col.header}</span>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div>
        {rows.map((row, i) => renderRow(row, i === 0))}
      </div>

      {/* Pagination */}
      <div style={st.pagination}>
        <span style={st.paginationInfo}>Showing {rows.length} of {total ?? rows.length}</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button style={{ ...st.pageBtn, ...st.pageBtnIcon, opacity: 0.4 }} disabled>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
          </button>
          {[1, 2, 3].map(n => (
            <button key={n} style={{ ...st.pageBtn, ...(n === 1 ? st.pageBtnActive : {}) }}>{n}</button>
          ))}
          <button style={{ ...st.pageBtn, ...st.pageBtnIcon }}>
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
}
