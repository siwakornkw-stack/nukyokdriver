'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import VehicleDeletePanel from './VehicleDeletePanel';
import { getResponseData } from '../../../../types/utils';
import { getVehicleAll } from '../../../../services/vehicle.service';
import {
  getDataTypes, listData, previewDelete, deleteData,
  type DataType, type DataTypeOption, type DataRow, type DataFilter,
} from '../../../../services/data-admin.service';

interface VehicleOpt { id: string; label: string }

const fmtDate = (iso: string | null): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function PageDataAdmin(): React.JSX.Element {
  const [types, setTypes] = React.useState<DataTypeOption[]>([]);
  const [type, setType] = React.useState<DataType>('fuel');
  const [vehicles, setVehicles] = React.useState<VehicleOpt[]>([]);
  const [filter, setFilter] = React.useState<DataFilter>({});
  const [rows, setRows] = React.useState<DataRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // confirm dialog state
  const [confirm, setConfirm] = React.useState<{ mode: 'selected' | 'filter'; count: number } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    void (async () => {
      setTypes(await getDataTypes());
      const res = await getVehicleAll(undefined, undefined, 1000);
      const list = getResponseData(res)?.data ?? [];
      setVehicles(list.map((v) => ({
        id: v.id,
        label: [v.licensePlatePrefix, v.licensePlateSuffix].filter(Boolean).join(' ').trim() || v.model || v.id,
      })));
    })();
  }, []);

  const hasFilter = Boolean(filter.vehicleId || filter.from || filter.to);

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    setSelected(new Set());
    setMessage(null);
    try {
      const { rows: r, total: t } = await listData(type, filter);
      setRows(r);
      setTotal(t);
      if (r.length === 0) setMessage({ type: 'info', text: 'ไม่พบข้อมูลตามเงื่อนไข' });
    } catch {
      setMessage({ type: 'error', text: 'ค้นหาไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = (): void => {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  };

  const openConfirm = async (mode: 'selected' | 'filter'): Promise<void> => {
    try {
      const body = mode === 'selected' ? { ids: Array.from(selected) } : { filter };
      const count = await previewDelete(type, body);
      setConfirm({ mode, count });
    } catch {
      setMessage({ type: 'error', text: 'ดูจำนวนที่จะลบไม่สำเร็จ' });
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirm) return;
    setDeleting(true);
    try {
      const body = confirm.mode === 'selected' ? { ids: Array.from(selected) } : { filter };
      const res = await deleteData(type, body);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message ?? 'เสร็จสิ้น' });
      setConfirm(null);
      await handleSearch();
    } catch {
      setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">จัดการ/ลบข้อมูล</Typography>
      <Alert severity="warning">เมนูสำหรับผู้ดูแลระบบ — การลบข้อมูลถาวร กู้คืนไม่ได้ ตรวจจำนวนก่อนยืนยันทุกครั้ง</Alert>

      {message ? (
        <Alert severity={message.type} onClose={() => setMessage(null)}>{message.text}</Alert>
      ) : null}

      <Card>
        <CardHeader title="ค้นหาข้อมูล" subheader="เลือกชนิดข้อมูล กรองตามรถ/ช่วงวันที่ แล้วเลือกแถวที่จะลบ หรือลบทั้งหมดตามเงื่อนไข" />
        <Divider />
        <CardContent>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-end' }}>
            <TextField select label="ชนิดข้อมูล" value={type} onChange={(e) => setType(e.target.value as DataType)} sx={{ minWidth: 160 }}>
              {types.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField select label="รถ (ทั้งหมด)" value={filter.vehicleId ?? ''} onChange={(e) => setFilter((f) => ({ ...f, vehicleId: e.target.value || undefined }))} sx={{ minWidth: 200 }}>
              <MenuItem value="">ทั้งหมด</MenuItem>
              {vehicles.map((v) => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
            </TextField>
            <TextField label="ตั้งแต่วันที่" type="date" InputLabelProps={{ shrink: true }} value={filter.from ?? ''} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value || undefined }))} />
            <TextField label="ถึงวันที่" type="date" InputLabelProps={{ shrink: true }} value={filter.to ?? ''} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value || undefined }))} />
            <Button variant="contained" disabled={loading} onClick={() => void handleSearch()}>{loading ? 'กำลังค้นหา...' : 'ค้นหา'}</Button>
          </Stack>
        </CardContent>
      </Card>

      {rows.length > 0 ? (
        <Card>
          <CardHeader
            title={`ผลการค้นหา (${total} รายการ)`}
            action={
              <Stack direction="row" spacing={1}>
                <Button color="error" variant="outlined" disabled={selected.size === 0} onClick={() => void openConfirm('selected')}>
                  ลบที่เลือก ({selected.size})
                </Button>
                <Button color="error" variant="contained" disabled={!hasFilter} onClick={() => void openConfirm('filter')}>
                  ลบทั้งหมดตามเงื่อนไข
                </Button>
              </Stack>
            }
          />
          <Divider />
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={rows.length > 0 && selected.size === rows.length}
                      indeterminate={selected.size > 0 && selected.size < rows.length}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell>วันที่</TableCell>
                  <TableCell>รถ</TableCell>
                  <TableCell>รายละเอียด</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover selected={selected.has(r.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />
                    </TableCell>
                    <TableCell>{fmtDate(r.date)}</TableCell>
                    <TableCell>{r.vehicle}</TableCell>
                    <TableCell>{r.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          {total > rows.length ? (
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                แสดง {rows.length} จาก {total} รายการ — &quot;ลบทั้งหมดตามเงื่อนไข&quot; จะลบครบทั้ง {total} รายการ
              </Typography>
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <VehicleDeletePanel />

      <Dialog open={Boolean(confirm)} onClose={() => (deleting ? null : setConfirm(null))}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            จะลบข้อมูล <strong>{confirm?.count ?? 0}</strong> รายการ ออกถาวร — กู้คืนไม่ได้ ยืนยันหรือไม่?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setConfirm(null)}>ยกเลิก</Button>
          <Button color="error" variant="contained" disabled={deleting || (confirm?.count ?? 0) === 0} onClick={() => void handleDelete()}>
            {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
