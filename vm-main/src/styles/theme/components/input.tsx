import type { Components } from '@mui/material/styles';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

import type { Theme } from '../types';

// Stripe-style inputs: rounded, hairline border, soft focus ring instead of a
// thick 2px outline.
export const MuiOutlinedInput = {
  styleOverrides: {
    root: ({ theme }) => {
      const primaryChannel = theme.vars ? theme.vars.palette.primary.mainChannel : '99 91 255';
      return {
        borderRadius: '12px',
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
        [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: {
          borderWidth: '1px',
        },
        [`&.${outlinedInputClasses.focused}`]: {
          boxShadow: `0 0 0 4px rgba(${primaryChannel} / 0.16)`,
        },
        [`&:hover:not(.${outlinedInputClasses.focused}) .${outlinedInputClasses.notchedOutline}`]: {
          borderColor: 'var(--mui-palette-neutral-400)',
        },
      };
    },
  },
} satisfies Components<Theme>['MuiOutlinedInput'];
