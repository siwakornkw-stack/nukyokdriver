import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Receipt as ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';
import { MetricLabel } from './metric-label';

export interface TotalProfitProps {
  sx?: SxProps;
  value: string;
  loading?: boolean;
  helpText?: string;
}

export function TotalProfit({ value, sx, loading = false, helpText }: TotalProfitProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <MetricLabel label="รวมกำไร" helpText={helpText} />
            {loading ? <Skeleton width={120} height={40} /> : <Typography variant="h4">{value}</Typography>}
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
            <ReceiptIcon fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
