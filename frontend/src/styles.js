// Shared design tokens — sourced from navbar.html Tailwind config
// Import what you need: import { colors, radius, fonts, s } from './styles'

export const colors = {
  // Primary (sage green)
  primary:                  '#4c6455',
  onPrimary:                '#ffffff',
  primaryContainer:         '#8fa998',
  onPrimaryContainer:       '#273e31',
  primaryFixed:             '#cee9d6',
  primaryFixedDim:          '#b2cdbb',
  onPrimaryFixed:           '#082014',
  onPrimaryFixedVariant:    '#344c3e',
  inversePrimary:           '#b2cdbb',
  surfaceTint:              '#4c6455',

  // Secondary (mid green)
  secondary:                '#2c6a48',
  onSecondary:              '#ffffff',
  secondaryContainer:       '#adeec4',
  onSecondaryContainer:     '#316e4c',
  secondaryFixed:           '#b0f1c7',
  secondaryFixedDim:        '#95d4ac',
  onSecondaryFixed:         '#002111',
  onSecondaryFixedVariant:  '#0f5132',

  // Tertiary (emerald)
  tertiary:                 '#006c49',
  onTertiary:               '#ffffff',
  tertiaryContainer:        '#10b981',
  onTertiaryContainer:      '#00422b',
  tertiaryFixed:            '#6ffbbe',
  tertiaryFixedDim:         '#4edea3',
  onTertiaryFixed:          '#002113',
  onTertiaryFixedVariant:   '#005236',

  // Surface & background
  background:               '#f9f9f8',
  onBackground:             '#191c1c',
  surface:                  '#f9f9f8',
  onSurface:                '#191c1c',
  surfaceDim:               '#d9dad9',
  surfaceBright:            '#f9f9f8',
  surfaceContainerLowest:   '#ffffff',
  surfaceContainerLow:      '#f3f4f3',
  surfaceContainer:         '#edeeed',
  surfaceContainerHigh:     '#e7e8e7',
  surfaceContainerHighest:  '#e1e3e2',
  surfaceVariant:           '#e1e3e2',
  onSurfaceVariant:         '#424844',
  inverseSurface:           '#2e3131',
  inverseOnSurface:         '#f0f1f0',

  // Outline
  outline:                  '#727973',
  outlineVariant:           '#c2c8c2',

  // Error
  error:                    '#ba1a1a',
  onError:                  '#ffffff',
  errorContainer:           '#ffdad6',
  onErrorContainer:         '#93000a',
}

export const fonts = {
  headline: "'Inter', system-ui, sans-serif",
  body:     "'Inter', system-ui, sans-serif",
  label:    "'Inter', system-ui, sans-serif",
}

export const radius = {
  DEFAULT: '0.125rem',
  lg:      '0.25rem',
  xl:      '0.5rem',
  full:    '0.75rem',
}

// Common reusable style objects
export const s = {
  // Sticky top navbar shell
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    height: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    backgroundColor: 'rgba(250, 250, 249, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid rgba(194, 200, 194, 0.3)`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    fontFamily: fonts.body,
  },

  // Main content area offset below sticky header
  pageContent: {
    paddingTop: '4rem',
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.onBackground,
    fontFamily: fonts.body,
  },

  // Nav link — inactive
  navLink: {
    fontFamily: fonts.label,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: colors.onSurfaceVariant,
    textDecoration: 'none',
    paddingBottom: '2px',
    borderBottom: '2px solid transparent',
    transition: 'color 0.15s ease, border-color 0.15s ease',
  },

  // Nav link — active
  navLinkActive: {
    color: colors.tertiary,
    borderBottom: `2px solid ${colors.tertiary}`,
  },

  // Card surface
  card: {
    backgroundColor: colors.surfaceContainerLow,
    border: `1px solid ${colors.outlineVariant}`,
    borderRadius: radius.xl,
    padding: '1.25rem',
  },

  // Primary button
  btnPrimary: {
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    border: 'none',
    borderRadius: radius.full,
    padding: '0.5rem 1.25rem',
    fontFamily: fonts.label,
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
  },

  // Outlined button
  btnOutline: {
    backgroundColor: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.outline}`,
    borderRadius: radius.full,
    padding: '0.5rem 1.25rem',
    fontFamily: fonts.label,
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  // Page wrapper (full-page background)
  page: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.onBackground,
    fontFamily: fonts.body,
  },

  // Entities sub-page container (Teams, Players, Referees, Stadiums)
  entitiesPage: {
    padding: '2rem 2.5rem',
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
    maxWidth: '1200px',
    width: '100%',
  },
}
