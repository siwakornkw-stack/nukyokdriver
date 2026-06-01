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
import { formatMoney } from '@/helpers/helper';
import { getVehicleAll } from '../../../../services/vehicle.service';
import { VehicleAllResponse } from '@/types/vehicle';
import ShareSweetAlert from '@/components/ShareSweetAlert';
import { SSENotificationData, useNotification } from '@/contexts/notification-context';
import { Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
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
    isError: isDashboardError } = useQuery<WrapResponse<DashboardResponse | null>>({
      queryKey: ['dashboard'],
      queryFn: getDashboard,
      refetchInterval: 30000,
      staleTime: 10000,
      retry: 3
    });

  const {
    data: vehicleData,
    isLoading: isVehicleLoading,
    isError: isVehicleError } = useQuery<WrapResponse<VehicleAllResponse | null>>({
      queryKey: ['vehicle'],
      queryFn: () => getVehicleAll('UpdatedAt', 'desc', 6),
      refetchInterval: 30000,
      staleTime: 10000,
      retry: 3
    });

  async function openCheckLine(data: CheckLine) {
    try {
      // เพิ่ม console.log เพื่อดีบัก
      console.log('Attempting to open alert');

      if (!swalRef.current) {
        console.error('swalRef is not available');
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
      const result = await swalRef.current.open({
        // icon: "/assets/logo.png",
        title: "ระบบแจ้งเตือน",
        cancelText: "ปิด",
        html: alertContent,
        showConfirmButton: false
      });

      console.log('Alert result:', result);
    } catch (error) {
      console.error('Error opening alert:', error);
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
    if (isDashboardLoading) {
      console.log('กำลังโหลดข้อมูล...');
    }
    if (isDashboardError) {
      console.error('เกิดข้อผิดพลาด:', isDashboardError);
    }
    if (dashboardData) {
      console.log('ข้อมูลอัพเดท:', dashboardData);
      setDashboardData((dashboardData as WrapResponse<DashboardResponse>).data ?? null);
    }
  }, [dashboardData, isDashboardError, isDashboardLoading]);

  useEffect(() => {
    if (isVehicleLoading) {
      console.log('กำลังโหลดข้อมูล Vehicle ...');
    }
    if (isVehicleError) {
      console.error('เกิดข้อผิดพลาด Vehicle:', isVehicleError);
    }
    if (vehicleData) {
      console.log('ข้อมูลอัพเดท Vehicle:', vehicleData);
      setVehicleData((vehicleData as WrapResponse<VehicleAllResponse>).data ?? null);
    }
  }, [vehicleData, isVehicleError, isVehicleLoading]);

  const [timeRange, setTimeRange] = useState<'year' | 'month' | 'week'>('year');

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: 'year' | 'month' | 'week',
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

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

  useEffect(() => {
    const handleNotification = (sse: SSENotificationData) => {
      console.log( 'handleNotification', sse);
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

      <ToggleButtonGroup
        value={timeRange}
        exclusive
        onChange={handleTimeRangeChange}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="year">
          ปีนี้
        </ToggleButton>
        <ToggleButton value="month">
          เดือนนี้
        </ToggleButton>
        <ToggleButton value="week">
          สัปดาห์นี้
        </ToggleButton>
      </ToggleButtonGroup>

      <Grid container spacing={3}>
        <Grid lg={3} sm={6} xs={12}>
          <Budget diff={timeRangeData?.outgoingsDiff ?? 0} trend={timeRangeData?.outgoingsTrend ?? 'up'} sx={{ height: '100%' }} value={`฿${formatMoney(timeRangeData?.outgoings ?? 0)}`} subValue={timeRange === 'month' ? 'จากเดือนที่แล้ว' : timeRange === 'week' ? 'จากสัปดาห์ที่แล้ว' : 'จากปีที่แล้ว'} />
        </Grid>
        <Grid lg={3} sm={6} xs={12}>
          <Income diff={timeRangeData?.incomeDiff ?? 0} trend={timeRangeData?.incomeTrend ?? 'up'} sx={{ height: '100%' }} value={`฿${formatMoney(timeRangeData?.income ?? 0)}`} subValue={timeRange === 'month' ? 'จากเดือนที่แล้ว' : timeRange === 'week' ? 'จากสัปดาห์ที่แล้ว' : 'จากปีที่แล้ว'} />
        </Grid>
        {/* <Grid lg={3} sm={6} xs={12}>
        <TotalCustomers diff={16} trend="down" sx={{ height: '100%' }} value="1.6k" />
      </Grid> */}
        <Grid lg={3} sm={6} xs={12}>
          <TasksProgress sx={{ height: '100%' }} value={timeRangeData?.incomePercentage ?? 0} />
        </Grid>
        <Grid lg={3} sm={6} xs={12}>
          <TotalProfit sx={{ height: '100%' }}
            value={timeRangeData?.profit ? `฿${formatMoney(timeRangeData.profit)}` : '฿0'} />
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
