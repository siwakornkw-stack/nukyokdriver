'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import dayjs from 'dayjs';

import { numberFormat } from '@/helpers/helper';
import type { InstallmentArItem } from '@/types/dashboard';
import { InstallmentStatusChip } from '@/components/dashboard/installment/InstallmentStatusChip';

const MAX_ROWS = 8;

export interface InstallmentDueListProps {
  items?: InstallmentArItem[];
  loading?: boolean;
  onMarkPaid: (item: InstallmentArItem) => Promise<void>;
  sx?: SxProps;
}

export function InstallmentDueList({ items = [], loading = false, onMarkPaid, sx }: InstallmentDueListProps): React.JSX.Element {
  const [markingId, setMarkingId] = React.useState<string | null>(null);
  const visible = items.slice(0, MAX_ROWS);

  const handleMark = async (item: InstallmentArItem): Promise<void> => {
    setMarkingId(item.uuid);
    try {
      await onMarkPaid(item);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <Card sx={sx}>
      <CardHeader
        title="ค่างวดที่รอชำระ"
        subheader={items.length > 0 ? `ทั้งหมด ${items.length} งวด` : undefined}
      />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 2 }}><Skeleton variant="rectangular" height={260} /></Box>
        ) : items.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: 'text.secondary' }}>
            ไม่มีค่างวดที่รอชำระ
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ทะเบียน</TableCell>
                  <TableCell align="center">งวดที่</TableCell>
                  <TableCell align="center">วันครบกำหนด</TableCell>
                  <TableCell align="right">จำนวนเงิน</TableCell>
                  <TableCell align="center">สถานะ</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((item) => (
                  <TableRow key={item.uuid} hover>
                    <TableCell>
                      <Stack spacing={0}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.licensePlate || '-'}</Typography>
                        {item.vehicleNo != null ? (
                          <Typography variant="caption" color="text.secondary">
                            Vehicle-{item.vehicleNo.toString().padStart(5, '0')}
                          </Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">{item.installmentNumber}</TableCell>
                    <TableCell align="center">
                      <Stack spacing={0} sx={{ alignItems: 'center' }}>
                        <Typography variant="body2">{dayjs(item.dueDate).format('DD/MM/YYYY')}</Typography>
                        {item.status === 'overdue' ? (
                          <Typography variant="caption" color="error">เกิน {item.daysOverdue} วัน</Typography>
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>฿{numberFormat(item.amount)}</TableCell>
                    <TableCell align="center"><InstallmentStatusChip status={item.status} /></TableCell>
                    <TableCell align="right">
                      <LoadingButton
                        size="small"
                        variant="contained"
                        color="success"
                        loading={markingId === item.uuid}
                        onClick={() => { void handleMark(item); }}
                      >
                        ชำระแล้ว
                      </LoadingButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {items.length > MAX_ROWS ? (
              <Box sx={{ p: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  แสดง {MAX_ROWS} จาก {items.length} งวด
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
