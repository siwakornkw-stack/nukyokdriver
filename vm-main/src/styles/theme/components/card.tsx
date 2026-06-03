import { paperClasses } from '@mui/material/Paper';
import type { Components } from '@mui/material/styles';

import type { Theme } from '../types';

export const MuiCard = {
  styleOverrides: {
    root: ({ theme }) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        borderRadius: '20px',
        transition: 'box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        [`&.${paperClasses.elevation1}`]: {
          boxShadow: isDark
            ? '0 1px 2px rgba(0, 0, 0, 0.30), 0 8px 24px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            : '0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06), 0 0 0 1px rgba(16, 24, 40, 0.05)',
          '&:hover': {
            boxShadow: isDark
              ? '0 2px 4px rgba(0, 0, 0, 0.34), 0 16px 40px rgba(0, 0, 0, 0.36), 0 0 0 1px rgba(255, 255, 255, 0.10)'
              : '0 2px 4px rgba(16, 24, 40, 0.05), 0 16px 40px rgba(16, 24, 40, 0.10), 0 0 0 1px rgba(16, 24, 40, 0.06)',
          },
        },
      };
    },
  },
} satisfies Components<Theme>['MuiCard'];
