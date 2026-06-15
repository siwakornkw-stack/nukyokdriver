'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarCheck as CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';
import { HandCoins as HandCoinsIcon } from '@phosphor-icons/react/dist/ssr/HandCoins';
import { ChartLineUp as ChartLineUpIcon } from '@phosphor-icons/react/dist/ssr/ChartLineUp';

import { numberFormat } from '@/helpers/helper';
import type { InstallmentArSummary } from '@/types/dashboard';
import { MetricLabel } from './metric-label';

interface MetricCardProps {
  label: string;
  helpText?: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  loading?: boolean;
  progress?: number;
}

function MetricCard({ label, helpText, value, sub, color, icon, loading = false, progress }: MetricCardProps): React.JSX.Element {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1} sx={{ minWidth: 0 }}>
              <MetricLabel label={label} helpText={helpText} />
              {loading ? <Skeleton width={120} height={40} /> : (
                <Typography sx={{ fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', fontSize: 'clamp(1.1rem, 1.7vw, 1.6rem)' }}>{value}</Typography>
              )}
            </Stack>
            <Avatar sx={{ backgroundColor: color, height: '56px', width: '56px', flexShrink: 0 }}>{icon}</Avatar>
          </Stack>
          {progress !== undefined ? (
            loading ? <Skeleton variant="rounded" height={6} /> : <LinearProgress value={Math.min(Math.max(progress, 0), 100)} variant="determinate" />
          ) : null}
          {!loading && sub ? (
            <Typography color="text.secondary" variant="caption">{sub}</Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export interface InstallmentArCardsProps {
  summary?: InstallmentArSummary;
  loading?: boolean;
}

export function InstallmentArCards({ summary, loading = false }: InstallmentArCardsProps): React.JSX.Element {
  const dueWeek = summary?.dueThisWeek ?? { count: 0, amount: 0 };
  const overdue = summary?.overdue ?? { count: 0, amount: 0 };
  const paid = summary?.paidThisMonth ?? { count: 0, amount: 0 };
  const rate = summary?.collectionRate;

  return (
    <React.Fragment>
      <Grid lg={3} sm={6} xs={12}>
        <MetricCard
          label="ครบกำหนดสัปดาห์นี้"
          helpText="ค่างวดที่ยังไม่ชำระและครบกำหนดภายในสัปดาห์นี้"
          value={`${dueWeek.count} งวด`}
          sub={`฿${numberFormat(dueWeek.amount)}`}
          color="var(--mui-palette-warning-main)"
          icon={<CalendarCheckIcon fontSize="var(--icon-fontSize-lg)" />}
          loading={loading}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <MetricCard
          label="เกินกำหนด"
          helpText="ค่างวดที่เลยกำหนดและยังไม่ชำระ"
          value={`${overdue.count} งวด`}
          sub={`฿${numberFormat(overdue.amount)}`}
          color="var(--mui-palette-error-main)"
          icon={<WarningIcon fontSize="var(--icon-fontSize-lg)" />}
          loading={loading}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <MetricCard
          label="รับชำระเดือนนี้"
          helpText="ยอดที่รับชำระจริงในเดือนนี้"
          value={`฿${numberFormat(paid.amount)}`}
          sub={`${paid.count} งวด`}
          color="var(--mui-palette-success-main)"
          icon={<HandCoinsIcon fontSize="var(--icon-fontSize-lg)" />}
          loading={loading}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <MetricCard
          label="อัตราเก็บเงิน"
          helpText="สัดส่วนยอดที่เก็บได้เทียบยอดที่ครบกำหนดในเดือนนี้"
          value={rate === null || rate === undefined ? '-' : `${rate.toFixed(0)}%`}
          color="var(--mui-palette-primary-main)"
          icon={<ChartLineUpIcon fontSize="var(--icon-fontSize-lg)" />}
          loading={loading}
          progress={rate ?? 0}
        />
      </Grid>
    </React.Fragment>
  );
}
