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
import type { VehicleModel } from '@/types/vehicle';
import { useRouter } from 'next/navigation';


export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: string;
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: VehicleModel[];
  sx?: SxProps;
}

export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  const router = useRouter();
  return (
    <Card sx={sx}>
      <CardHeader title="รายการล่าสุด" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>เลขบิล</TableCell>
              <TableCell>ทะเบียน</TableCell>
              <TableCell sortDirection="desc">สร้างเมื่อ</TableCell>
              <TableCell>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(0,6).map((order) => {
              //const { label, color } = statusMap['delivered']/* statusMap[order.status] ?? { label: 'Unknown', color: 'default' } */;
              //const { label, color } = statusMap[order.status] ?? { label: 'Unknown', color: 'default' };
              return (
                <TableRow hover key={order.id}>
                  <TableCell>Vehicle-{order.no.toString().padStart(5, '0')}</TableCell>
                  <TableCell>{order.licensePlatePrefix + ' ' + order.licensePlateSuffix + ' ' + order.licensePlateProvince}</TableCell>
                  <TableCell>{dayjs(order.createdAt).format('DD MMMM YYYY HH:mm')}</TableCell>
                  <TableCell>
                    {/* <Chip color={color} label={label} size="small" /> */}
                    {order.status}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
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
