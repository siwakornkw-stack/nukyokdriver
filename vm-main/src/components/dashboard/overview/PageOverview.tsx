'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import Grid from '@mui/material/Unstable_Grid2'
import { Budget } from '@/components/dashboard/overview/budget';
import { LatestOrders } from '@/components/dashboard/overview/latest-orders';
import { LatestProducts } from '@/components/dashboard/overview/latest-products';
import { Sales } from '@/components/dashboard/overview/sales';
import { TasksProgress } from '@/components/dashboard/overview/tasks-progress';
// import { TotalCustomers } from '@/components/dashboard/overview/total-customers';
import { TotalProfit } from '@/components/dashboard/overview/total-profit';
import { Traffic } from '@/components/dashboard/overview/traffic';
import { Income } from '@/components/dashboard/overview/income';
import { getDashboard } from '../../../../services/dashboard.service';
import type { DashboardResponse } from '@/types/dashboard';
import { getResponseData, type WrapResponse } from '../../../../types/utils';
import { useEffect, useState } from 'react';
import { numberFormat } from '@/helpers/helper';
import { getVehicleAll } from '../../../../services/vehicle.service';
import { VehicleAllResponse } from '@/types/vehicle';
import ShareSweetAlert from '@/components/ShareSweetAlert';
import { SSENotificationData, useNotification } from '@/contexts/notification-context';
import { Alert, Button, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { checkLine } from '../../../../services/auth.service';
import { CheckLine } from '@/types/user';
import { Summary } from './summary';
import { useShareContext } from '@/contexts/share-context';
import { CustomToast } from '@/helpers/toast';

const urlImage = process.env.NEXT_PUBLIC_URL_IMAGE || '';

export default function PageOverview(): React.JSX.Element {
  const { onNotification } = useNotification();
  const { swalRef } = useShareContext();

  const [DashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [VehicleData, setVehicleData] = useState<VehicleAllResponse | null>(null);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard } = useQuery<WrapResponse<DashboardResponse | null>>({
      queryKey: ['dashboard'],
      queryFn: getDashboard,
      refetchInterval: 30000,
      staleTime: 10000,
      retry: 3
    });

  const {
    data: vehicleData,
    isLoading: isVehicleLoading,
    isError: isVehicleError,
    refetch: refetchVehicle } = useQuery<WrapResponse<VehicleAllResponse | null>>({
      queryKey: ['vehicle'],
      queryFn: () => getVehicleAll('UpdatedAt', 'desc', 6),
      refetchInterval: 30000,
      staleTime: 10000,
      retry: 3
    });

  async function openCheckLine(data: CheckLine) {
    try {
      if (!swalRef.current) {
        return;
      }
      const alertContent = (
        <Stack spacing={2} direction="column" flexWrap="wrap" sx={{
          overflowY: 'auto',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 1,
          gap: 1
        }}>
          <Typography>กรุณาเพิ่ม Line ID เพื่อรับข้อความแจ้งเตือน</Typography>
          {data.lineImgUrl ? <img 
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                src={`${urlImage}${data.lineImgUrl}`} 
                alt="line" 
              />  : <Skeleton
            variant="rectangular"
            width="360"
            sx={{
              width: '100%',
              height: 'auto',
              aspectRatio: '1/1'
            }}
          />}
          <Typography>กรุณากรอกตัวเลข 4 ตัวส่งไปที่ Line นี้</Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>{data.pid}</Typography>
        </Stack>
      );
      await swalRef.current.open({
        title: "ระบบแจ้งเตือน",
        cancelText: "ปิด",
        html: alertContent,
        showConfirmButton: false
      });
    } catch {
      // ignore alert open failure
    }
  }

  const handleCheckLine = async () => {
    const res = await checkLine();
    if (!res.ok) {
      return;
    }
    const result = getResponseData(res);
    if (result) {
      if (!result.data.hasLine) {
        void openCheckLine(result.data);
      }
    }
  }

  useEffect(() => {
    void handleCheckLine();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      setDashboardData((dashboardData as WrapResponse<DashboardResponse>).data ?? null);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (vehicleData) {
      setVehicleData((vehicleData as WrapResponse<VehicleAllResponse>).data ?? null);
    }
  }, [vehicleData]);

  const [timeRange, setTimeRange] = useState<'year' | 'month' | 'week'>('year');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: 'year' | 'month' | 'week',
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  useEffect(() => {
    const shortcuts: Record<string, 'year' | 'month' | 'week'> = { y: 'year', m: 'month', w: 'week' };
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      const next = shortcuts[e.key.toLowerCase()];
      if (next) {
        setTimeRange(next);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const getTimeRangeData = () => {
    if (!DashboardData?.data) return null;
    
    switch (timeRange) {
      case 'week':
        return {
          outgoings: DashboardData.data.outgoingsWeek,
          outgoingsDiff: DashboardData.data.outgoingsWeekDiff,
          outgoingsTrend: DashboardData.data.outgoingsWeekTrend,
          income: DashboardData.data.incomeWeek,
          incomeDiff: DashboardData.data.incomeWeekDiff,
          incomeTrend: DashboardData.data.incomeWeekTrend,
          incomePercentage: DashboardData.data.incomeWeekPercentage,
          graphData: DashboardData.data.graphDataWeek,
          profit: DashboardData.data.profitWeek
        };
      case 'month':
        return {
          outgoings: DashboardData.data.outgoings,
          outgoingsDiff: DashboardData.data.outgoingsDiff,
          outgoingsTrend: DashboardData.data.outgoingsTrend,
          income: DashboardData.data.income,
          incomeDiff: DashboardData.data.incomeDiff,
          incomeTrend: DashboardData.data.incomeTrend,
          incomePercentage: DashboardData.data.incomePercentage,
          graphData: DashboardData.data.graphDataMonth,
          profit: DashboardData.data.profit
        };
      default:
        return {
          outgoings: DashboardData.data.outgoingsYear,
          outgoingsDiff: DashboardData.data.outgoingsYearDiff,
          outgoingsTrend: DashboardData.data.outgoingsYearTrend,
          income: DashboardData.data.incomeYear,
          incomeDiff: DashboardData.data.incomeYearDiff,
          incomeTrend: DashboardData.data.incomeYearTrend,
          incomePercentage: DashboardData.data.incomeYearPercentage,
          graphData: DashboardData.data.graphData,
          profit: DashboardData.data.profitYear
        };
    }
  };

  const timeRangeData = getTimeRangeData();
  const compareLabel = timeRange === 'month' ? 'จากเดือนที่แล้ว' : timeRange === 'week' ? 'จากสัปดาห์ที่แล้ว' : 'จากปีที่แล้ว';

  useEffect(() => {
    const handleNotification = (sse: SSENotificationData) => {
      swalRef.current?.close();
      if (sse.data) {
        CustomToast.success('Success', sse.data.message);
      }
    };

    onNotification(handleNotification);
  }, [onNotification, swalRef]);

  return (
    <React.Fragment>

      <ShareSweetAlert />

      {(isDashboardError || isVehicleError) ? (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                if (isDashboardError) void refetchDashboard();
                if (isVehicleError) void refetchVehicle();
              }}
            >
              ลองใหม่
            </Button>
          }
        >
          โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
        </Alert>
      ) : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
      >
        <Typography variant="h4">ภาพรวม</Typography>
        <Stack spacing={0.5} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
          >
            <ToggleButton value="year" title="ปีนี้ (กด Y)">
              ปีนี้
            </ToggleButton>
            <ToggleButton value="month" title="เดือนนี้ (กด M)">
              เดือนนี้
            </ToggleButton>
            <ToggleButton value="week" title="สัปดาห์นี้ (กด W)">
              สัปดาห์นี้
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography color="text.secondary" variant="caption">
            ทางลัด: กด Y / M / W เพื่อสลับช่วงเวลา
          </Typography>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid lg={3} sm={6} xs={12}>
          <Income helpText="รายได้รวมในช่วงเวลาที่เลือก" loading={isDashboardLoading} diff={timeRangeData?.incomeDiff ?? 0} trend={timeRangeData?.incomeTrend ?? 'up'} sx={{ height: '100%' }} value={`฿${numberFormat(timeRangeData?.income ?? 0)}`} subValue={compareLabel} />
        </Grid>
        <Grid lg={3} sm={6} xs={12}>
          <TotalProfit helpText="กำไรสุทธิ = รายได้ - ค่าใช้จ่าย" loading={isDashboardLoading} sx={{ height: '100%' }}
            value={timeRangeData?.profit ? `฿${numberFormat(timeRangeData.profit)}` : '฿0'} />
        </Grid>
        <Grid lg={3} sm={6} xs={12}>
          <Budget helpText="ค่าใช้จ่ายรวมในช่วงเวลาที่เลือก" loading={isDashboardLoading} diff={timeRangeData?.outgoingsDiff ?? 0} trend={timeRangeData?.outgoingsTrend ?? 'up'} sx={{ height: '100%' }} value={`฿${numberFormat(timeRangeData?.outgoings ?? 0)}`} subValue={compareLabel} />
        </Grid>
        <Grid lg={3} sm={6} xs={12}>
          <TasksProgress helpText="สัดส่วนรายได้เทียบเป้าหมาย" loading={isDashboardLoading} sx={{ height: '100%' }} value={timeRangeData?.incomePercentage ?? 0} />
        </Grid>
        <Grid lg={8} xs={12}>
          <Sales
            chartSeries={timeRangeData?.graphData ?? []}
            sx={{ height: '100%' }}
            timeRange={timeRange}
          />
        </Grid>
        <Grid lg={4} md={12} xs={12}>
          <Traffic chartSeries={[timeRangeData?.outgoings ?? 0, timeRangeData?.income ?? 0]} labels={['ค่าใช้จ่าย', 'รายได้']} sx={{ height: '100%' }} />
        </Grid>
        
        <Grid lg={12} md={12} xs={12}>
          <Summary
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid lg={4} md={12} xs={12}>
          <LatestProducts
            products={VehicleData?.data ?? []}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid lg={8} md={12} xs={12}>
          <LatestOrders
            orders={VehicleData?.data ?? []}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>

    </React.Fragment>
  );
}
