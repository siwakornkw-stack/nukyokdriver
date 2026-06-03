import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info';

export interface MetricLabelProps {
  label: string;
  helpText?: string;
}

export function MetricLabel({ label, helpText }: MetricLabelProps): React.JSX.Element {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Typography color="text.secondary" variant="overline">
        {label}
      </Typography>
      {helpText ? (
        <Tooltip title={helpText} enterTouchDelay={0}>
          <Box
            component="span"
            tabIndex={0}
            aria-label={helpText}
            sx={{
              display: 'inline-flex',
              color: 'var(--mui-palette-text-secondary)',
              cursor: 'help',
              borderRadius: '50%',
              '&:focus-visible': { outline: '2px solid var(--mui-palette-primary-main)', outlineOffset: 2 },
            }}
          >
            <InfoIcon size={14} />
          </Box>
        </Tooltip>
      ) : null}
    </Stack>
  );
}
