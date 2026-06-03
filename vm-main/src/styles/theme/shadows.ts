import type { Shadows } from '@mui/material/styles/shadows';

// Layered, low-opacity shadows (Stripe-style): a tight ambient layer plus a
// softer diffuse layer. Reads as "premium depth" instead of a single flat blur.
export const shadows = [
  'none',
  '0px 1px 2px rgba(16, 24, 40, 0.05)',
  '0px 1px 2px rgba(16, 24, 40, 0.06), 0px 1px 3px rgba(16, 24, 40, 0.10)',
  '0px 1px 3px rgba(16, 24, 40, 0.05), 0px 2px 6px rgba(16, 24, 40, 0.08)',
  '0px 2px 4px rgba(16, 24, 40, 0.05), 0px 4px 8px rgba(16, 24, 40, 0.08)',
  '0px 2px 6px rgba(16, 24, 40, 0.05), 0px 6px 12px rgba(16, 24, 40, 0.08)',
  '0px 3px 8px rgba(16, 24, 40, 0.05), 0px 8px 16px rgba(16, 24, 40, 0.08)',
  '0px 4px 10px rgba(16, 24, 40, 0.05), 0px 10px 20px rgba(16, 24, 40, 0.08)',
  '0px 4px 12px rgba(16, 24, 40, 0.06), 0px 12px 24px rgba(16, 24, 40, 0.09)',
  '0px 5px 14px rgba(16, 24, 40, 0.06), 0px 14px 28px rgba(16, 24, 40, 0.09)',
  '0px 6px 16px rgba(16, 24, 40, 0.06), 0px 16px 32px rgba(16, 24, 40, 0.10)',
  '0px 6px 18px rgba(16, 24, 40, 0.06), 0px 18px 36px rgba(16, 24, 40, 0.10)',
  '0px 7px 20px rgba(16, 24, 40, 0.07), 0px 20px 40px rgba(16, 24, 40, 0.10)',
  '0px 7px 22px rgba(16, 24, 40, 0.07), 0px 22px 44px rgba(16, 24, 40, 0.11)',
  '0px 8px 24px rgba(16, 24, 40, 0.07), 0px 24px 48px rgba(16, 24, 40, 0.11)',
  '0px 8px 26px rgba(16, 24, 40, 0.07), 0px 26px 52px rgba(16, 24, 40, 0.11)',
  '0px 9px 28px rgba(16, 24, 40, 0.08), 0px 28px 56px rgba(16, 24, 40, 0.12)',
  '0px 9px 30px rgba(16, 24, 40, 0.08), 0px 30px 60px rgba(16, 24, 40, 0.12)',
  '0px 10px 32px rgba(16, 24, 40, 0.08), 0px 32px 64px rgba(16, 24, 40, 0.12)',
  '0px 10px 34px rgba(16, 24, 40, 0.08), 0px 34px 68px rgba(16, 24, 40, 0.13)',
  '0px 11px 36px rgba(16, 24, 40, 0.09), 0px 36px 72px rgba(16, 24, 40, 0.13)',
  '0px 11px 38px rgba(16, 24, 40, 0.09), 0px 38px 76px rgba(16, 24, 40, 0.13)',
  '0px 12px 40px rgba(16, 24, 40, 0.09), 0px 40px 80px rgba(16, 24, 40, 0.14)',
  '0px 12px 42px rgba(16, 24, 40, 0.10), 0px 42px 84px rgba(16, 24, 40, 0.14)',
  '0px 13px 44px rgba(16, 24, 40, 0.10), 0px 44px 88px rgba(16, 24, 40, 0.14)',
] satisfies Shadows;
