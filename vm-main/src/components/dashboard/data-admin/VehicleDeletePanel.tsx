'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import {
  listVehicles, previewVehicleDelete, deleteVehicles, type AdminVehicleRow,
} from '../../../../services/data-admin.service';

export default function VehicleDeletePanel(): React.JSX.Element {
  const [search, setSearch] = React.useState('');
  const [rows, setRows] = React.useState<AdminVehicleRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [confirm, setConfirm] = React.useState<{ vehicles: number; children: number } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = async (): Promise<void> => {
    setLoading(true);
    setSelected(new Set());
    setMessage(null);
    try {
      const { rows: r, total: t } = await listVehicles(search);
      setRows(r);
      setTotal(t);
      if (r.length === 0) setMessage({ type: 'info', text: 'ไม่พบรถตามเงื่อนไข' });
    } catch {
      setMessage({ type: 'error', text: 'โหลดรายการรถไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const openConfirm = async (): Promise<void> => {
    try {
      const r = await previewVehicleDelete(Array.from(selected));
      setConfirm(r);
    } catch {
      setMessage({ type: 'error', text: 'ดูจำนวนที่จะลบไม่สำเร็จ' });
    }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    try {
      const res = await deleteVehicles(Array.from(selected));
      setMessage({ type: res.success ? 'success' : 'error', text: res.message ?? 'เสร็จสิ้น' });
      setConfirm(null);
      await load();
    } catch {
      setMessage({ type: 'error', text: 'ลบไม่สำเร็จ' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="ลบรถ/เครื่องจักร (เฉพาะ admin)"
        subheader="ลบรถจะลบข้อมูลที่ผูกกับรถทั้งหมดด้วย (ค่าน้ำมัน/ซ่อม/อุบัติเหตุ/ผ่อน/รายได้/ประกัน/ภาษี/พ.ร.บ./รูป) — ถาวร กู้คืนไม่ได้"
        action={
          <Button color="error" variant="contained" disabled={selected.size === 0} onClick={() => void openConfirm()}>
            ลบที่เลือก ({selected.size})
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {message ? <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 2 }}>{message.text}</Alert> : null}
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}>
          <TextField
            label="ค้นหา (ทะเบียน/รุ่น)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void load(); }}
            sx={{ minWidth: 260 }}
          />
          <Button variant="contained" disabled={loading} onClick={() => void load()}>{loading ? 'กำลังโหลด...' : 'ค้นหา'}</Button>
        </Stack>
      </CardContent>
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
              <TableCell>ทะเบียน</TableCell>
              <TableCell>รุ่น/รายการ</TableCell>
              <TableCell>สถานะ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover selected={selected.has(r.id)}>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />
                </TableCell>
                <TableCell>{r.plate || '-'}</TableCell>
                <TableCell>{r.model || '-'}</TableCell>
                <TableCell><Chip size="small" label={r.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <CardContent>
        <Alert severity="info">แสดง {rows.length} จาก {total} คัน</Alert>
      </CardContent>

      <Dialog open={Boolean(confirm)} onClose={() => (deleting ? null : setConfirm(null))}>
        <DialogTitle>ยืนยันการลบรถ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            จะลบรถ <strong>{confirm?.vehicles ?? 0}</strong> คัน
            {confirm && confirm.children > 0 ? <> พร้อมข้อมูลที่ผูกอยู่ <strong>{confirm.children}</strong> รายการ</> : null}
            {' '}ออกถาวร — กู้คืนไม่ได้ ยืนยันหรือไม่?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setConfirm(null)}>ยกเลิก</Button>
          <Button color="error" variant="contained" disabled={deleting || (confirm?.vehicles ?? 0) === 0} onClick={() => void handleDelete()}>
            {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
