import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiButton = {
  styleOverrides: {
    root: {
      borderRadius: '12px',
      textTransform: 'none',
      fontWeight: 600,
      transition: 'background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
      '&:active': { transform: 'translateY(1px)' },
    },
    contained: ({ theme }) => ({
      boxShadow: `0 1px 2px rgba(16, 24, 40, 0.10), 0 1px 3px ${theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.24)` : 'rgba(99, 91, 255, 0.24)'}`,
      '&:hover': {
        boxShadow: `0 2px 4px rgba(16, 24, 40, 0.12), 0 4px 12px ${theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.32)` : 'rgba(99, 91, 255, 0.32)'}`,
      },
    }),
    sizeSmall: { padding: '6px 16px' },
    sizeMedium: { padding: '8px 20px' },
    sizeLarge: { padding: '11px 24px' },
    textSizeSmall: { padding: '7px 12px' },
    textSizeMedium: { padding: '9px 16px' },
    textSizeLarge: { padding: '12px 16px' },
  },
} satisfies Components<Theme>['MuiButton'];
