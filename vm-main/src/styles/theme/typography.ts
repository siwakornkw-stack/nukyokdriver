import type { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography = {
  fontFamily:
    '"LineSeedSansTH"',/* , -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji" */
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.57 },
  button: { fontWeight: 700 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
  subtitle1: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.57 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.57 },
  overline: {
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    lineHeight: 1.25,
    textTransform: 'uppercase',
  },
  h1: { fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.033em' },
  h2: { fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em' },
  h3: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.18, letterSpacing: '-0.025em' },
  h4: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
  h5: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.017em' },
  h6: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
} satisfies TypographyOptions;
