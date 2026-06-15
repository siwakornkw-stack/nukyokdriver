'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { numberFormat } from '@/helpers/helper';
import type { InstallmentArSummary } from '@/types/dashboard';

const BUCKETS: { key: keyof InstallmentArSummary['aging']; label: string; color: string }[] = [
  { key: 'notYetDue', label: 'ยังไม่ถึงกำหนด', color: 'var(--mui-palette-info-main)' },
  { key: 'd1_30', label: 'เกิน 1-30 วัน', color: 'var(--mui-palette-warning-main)' },
  { key: 'd31_60', label: 'เกิน 31-60 วัน', color: 'var(--mui-palette-warning-dark)' },
  { key: 'd61_90', label: 'เกิน 61-90 วัน', color: 'var(--mui-palette-error-light)' },
  { key: 'd90plus', label: 'เกิน 90 วันขึ้นไป', color: 'var(--mui-palette-error-main)' },
];

export interface InstallmentAgingCardProps {
  aging?: InstallmentArSummary['aging'];
  loading?: boolean;
  sx?: SxProps;
}

export function InstallmentAgingCard({ aging, loading = false, sx }: InstallmentAgingCardProps): React.JSX.Element {
  const values = BUCKETS.map((b) => (aging ? aging[b.key] : 0));
  const total = values.reduce((s, v) => s + v, 0);
  const max = Math.max(...values, 1);

  return (
    <Card sx={sx}>
      <CardHeader title="อายุหนี้ค่างวด (ยอดค้าง)" subheader={`รวม ฿${numberFormat(total)}`} />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={220} />
        ) : total === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, color: 'text.secondary' }}>
            ไม่มียอดค้างชำระ
          </Box>
        ) : (
          <Stack spacing={2}>
            {BUCKETS.map((b, i) => (
              <Stack key={b.key} spacing={0.5}>
                <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">{b.label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>฿{numberFormat(values[i])}</Typography>
                </Stack>
                <Box sx={{ height: 8, borderRadius: '4px', backgroundColor: 'var(--mui-palette-background-level1, rgba(16,24,40,0.06))' }}>
                  <Box sx={{ height: 8, borderRadius: '4px', width: `${(values[i] / max) * 100}%`, backgroundColor: b.color }} />
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
