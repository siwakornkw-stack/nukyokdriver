'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
// import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getSummary } from '../../../../services/dashboard.service';
import { useQuery } from '@tanstack/react-query';
import { WrapResponse } from '../../../../types/utils';
import { SummaryResponse } from '@/types/dashboard';
import TableFooter from '@mui/material/TableFooter';
import { numberFormat } from '@/helpers/helper';

export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: string;
  createdAt: Date;
}

export interface SummaryProps {
  sx?: SxProps;
}

export function Summary({ sx }: SummaryProps): React.JSX.Element {
  const router = useRouter();
  const today = dayjs().toDate();
  const dayAgo = dayjs().subtract(1, 'day').toDate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([dayAgo, today]);
  const [startDate, endDate] = dateRange;
  const { data: summaryData } = useQuery<WrapResponse<SummaryResponse | null>>({
    queryKey: ['summary', dateRange[0], dateRange[1]],
    queryFn: async () => {
      if (!dateRange[0] || !dateRange[1]) {
        return {
          ok: true,
          data: {
            code: 200,
            message: 'success',
            data: { vehicleSummary: [], income: 0, outgoings: 0, profit: 0 }
          }
        };
      }
      return getSummary(dateRange[0], dateRange[1]);
    },
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 3
  });

  return (
    <Card sx={sx}>
      <CardHeader title="สรุปรายได้-รายจ่าย" />
      <Box sx={{ p: 2 }}>
        <DatePicker
          selectsRange={true}
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}          
          onChange={(update) => setDateRange(update)}
          dateFormat="dd/MM/yyyy"
          isClearable={true}
          placeholderText="เลือกช่วงวันที่"
          className="form-control"
          maxDate={today}
        />
      </Box>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>เลขรถ</TableCell>
              <TableCell>ทะเบียน</TableCell>
              <TableCell>รายได้</TableCell>
              <TableCell>ค่าใช้จ่าย</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summaryData?.data?.data.vehicleSummary.slice(0, 6).map((order) => {
              //const { label, color } = statusMap['delivered']/* statusMap[order.status] ?? { label: 'Unknown', color: 'default' } */;
              //const { label, color } = statusMap[order.status] ?? { label: 'Unknown', color: 'default' };
              return (
                <TableRow hover key={order.no}>
                  <TableCell>Vehicle-{order.no.toString().padStart(5, '0')}</TableCell>
                  <TableCell>{order.license}</TableCell>
                  <TableCell>{numberFormat(order.income)}</TableCell>
                  <TableCell>{numberFormat(order.outgoings)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow sx={{
              '& td': {
                fontWeight: 'bold',
                borderTop: '2px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}>
              <TableCell></TableCell>
              <TableCell>รวม</TableCell>
              <TableCell>{numberFormat(summaryData?.data?.data.income ?? 0)}</TableCell>
              <TableCell>{numberFormat(summaryData?.data?.data.outgoings ?? 0)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Box>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
          onClick={() => router.push('/dashboard/vehicle')}
        >
          ดูทั้งหมด
        </Button>
      </CardActions>
    </Card>
  );
}
