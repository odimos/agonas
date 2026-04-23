// Shared design tokens — sourced from navbar.html Tailwind config
// Import what you need: import { colors, radius, fonts, s } from './styles'

export const colors = {
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

  secondary:                '#2c6a48',
  onSecondary:              '#ffffff',
  secondaryContainer:       '#adeec4',
  onSecondaryContainer:     '#316e4c',
  secondaryFixed:           '#b0f1c7',
  secondaryFixedDim:        '#95d4ac',
  onSecondaryFixed:         '#002111',
  onSecondaryFixedVariant:  '#0f5132',

  tertiary:                 '#006c49',
  onTertiary:               '#ffffff',
  tertiaryContainer:        '#10b981',
  onTertiaryContainer:      '#00422b',
  tertiaryFixed:            '#6ffbbe',
  tertiaryFixedDim:         '#4edea3',
  onTertiaryFixed:          '#002113',
  onTertiaryFixedVariant:   '#005236',

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

  outline:                  '#727973',
  outlineVariant:           '#c2c8c2',

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
