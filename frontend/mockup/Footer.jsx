import { colors, fonts } from './styles'

const FOOTER_LINKS = [
  { label: 'Privacy Policy',    href: '#' },
  { label: 'Terms of Service',  href: '#' },
  { label: 'API Documentation', href: '#' },
  { label: 'Support',           href: '#' },
]

const styles = {
  footer: {
    width: '100%',
    marginTop: 'auto',
    backgroundColor: colors.surfaceContainerLowest,
    borderTop: `1px solid rgba(194, 200, 194, 0.3)`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    fontFamily: fonts.body,
  },
  copyright: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: colors.outline,
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: colors.outline,
    textDecoration: 'underline',
    textDecorationColor: `${colors.tertiaryContainer}4d`,
    transition: 'color 0.15s ease',
  },
}

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <span style={styles.copyright}>© 2024 Executive Utility League Systems</span>
      <div style={styles.links}>
        {FOOTER_LINKS.map(({ label, href }) => (
          <a key={label} href={href} style={styles.link}>
            {label}
          </a>
        ))}
      </div>
    </footer>
  )
}
