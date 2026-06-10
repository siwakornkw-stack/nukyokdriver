import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { MetricLabel } from './metric-label';

export interface TasksProgressProps {
  sx?: SxProps;
  value: number;
  loading?: boolean;
  helpText?: string;
}

export function TasksProgress({ value, sx, loading = false, helpText }: TasksProgressProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1} sx={{ minWidth: 0 }}>
              <MetricLabel label="จำนวนรายได้" helpText={helpText} />
              {loading ? <Skeleton width={80} height={40} /> : <Typography sx={{ fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', fontSize: 'clamp(1.1rem, 1.7vw, 1.6rem)' }}>{value}%</Typography>}
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px', flexShrink: 0 }}>
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          <div>
            {loading ? (
              <Skeleton variant="rounded" height={6} />
            ) : (
              <LinearProgress value={value} variant="determinate" />
            )}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
