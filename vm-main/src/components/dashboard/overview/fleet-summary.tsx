'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Truck as TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';

import type { FleetSummary } from '@/types/dashboard';

export interface FleetSummaryProps {
  fleet?: FleetSummary;
  loading?: boolean;
  sx?: SxProps;
}

function ExpiryRow({ label, count }: { label: string; count: number }): React.JSX.Element {
  const danger = count > 0;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <WarningIcon
          fontSize="var(--icon-fontSize-md)"
          color={danger ? 'var(--mui-palette-warning-main)' : 'var(--mui-palette-text-disabled)'}
          weight={danger ? 'fill' : 'regular'}
        />
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Typography variant="subtitle2" color={danger ? 'warning.main' : 'text.secondary'}>
        {count} คัน
      </Typography>
    </Stack>
  );
}

export function FleetSummaryCard({ fleet, loading = false, sx }: FleetSummaryProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardHeader title="สรุปกองรถ" subheader="ภาษี/พรบ./ประกัน ใกล้หมดอายุภายใน 30 วัน" />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={220} />
        ) : (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--mui-palette-primary-main)',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <TruckIcon fontSize="var(--icon-fontSize-lg)" />
              </Box>
              <Stack spacing={0.25}>
                <Typography variant="h4">{fleet?.total ?? 0}</Typography>
                <Typography color="text.secondary" variant="body2">รถทั้งหมด (ใช้งาน)</Typography>
              </Stack>
            </Stack>

            {fleet && fleet.byType.length > 0 ? (
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                {fleet.byType.map((t) => (
                  <Chip key={t.name} size="small" variant="outlined" label={`${t.name} ${t.count}`} />
                ))}
              </Stack>
            ) : null}

            <Divider />

            <Stack spacing={1.5}>
              <ExpiryRow label="ภาษีใกล้หมดอายุ" count={fleet?.expiringTax ?? 0} />
              <ExpiryRow label="พรบ. ใกล้หมดอายุ" count={fleet?.expiringCompulsory ?? 0} />
              <ExpiryRow label="ประกันภัยใกล้หมดอายุ" count={fleet?.expiringInsurance ?? 0} />
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
