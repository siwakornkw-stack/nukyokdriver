'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';
import { formatMoney, numberFormat } from '@/helpers/helper';
import type { CostBreakdown } from '@/types/dashboard';

const CATEGORIES: { key: keyof Omit<CostBreakdown, 'total'>; label: string }[] = [
  { key: 'fuel', label: 'ค่าน้ำมัน' },
  { key: 'repair', label: 'ค่าซ่อม' },
  { key: 'tax', label: 'ภาษี' },
  { key: 'compulsory', label: 'พรบ.' },
  { key: 'insurance', label: 'ประกันภัย' },
  { key: 'installment', label: 'ค่างวด' },
];

export interface CostBreakdownProps {
  breakdown?: CostBreakdown;
  loading?: boolean;
  sx?: SxProps;
}

export function CostBreakdownCard({ breakdown, loading = false, sx }: CostBreakdownProps): React.JSX.Element {
  const theme = useTheme();
  const data = CATEGORIES.map((c) => breakdown ? breakdown[c.key] : 0);
  const labels = CATEGORIES.map((c) => c.label);
  const total = breakdown?.total ?? 0;
  const options = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader
        title="ต้นทุนแยกหมวด"
        subheader={`รวม ฿${numberFormat(total)}`}
      />
      <CardContent>
        {loading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : total === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'text.secondary' }}>
            ไม่มีต้นทุนในช่วงเวลานี้
          </Box>
        ) : (
          <Stack spacing={2}>
            <Chart height={300} options={options} series={[{ name: 'ต้นทุน', data }]} type="bar" width="100%" />
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ justifyContent: 'center' }}>
              {CATEGORIES.map((c, i) => (
                <Stack key={c.key} direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: COLORS(theme)[i] }} />
                  <Typography variant="caption" color="text.secondary">
                    {c.label} ฿{numberFormat(data[i])}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function COLORS(theme: Theme): string[] {
  return [
    theme.palette.primary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.secondary.main,
  ];
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent', toolbar: { show: false } },
    colors: COLORS(theme),
    dataLabels: {
      enabled: true,
      formatter: (val) => `฿${formatMoney(Number(val))}`,
      style: { colors: [theme.palette.text.primary], fontSize: '11px' },
      offsetX: 30,
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    legend: { show: false },
    plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: '60%' } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { y: { formatter: (val) => `฿${numberFormat(Number(val))}` } },
    xaxis: {
      categories: labels,
      axisBorder: { color: theme.palette.divider },
      axisTicks: { color: theme.palette.divider },
      labels: { formatter: (val) => formatMoney(Number(val)), style: { colors: theme.palette.text.secondary } },
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
  };
}
