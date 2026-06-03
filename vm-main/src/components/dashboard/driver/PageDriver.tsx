'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  addDriverManaged,
  deleteDriverManaged,
  getDriversManaged,
  updateDriverManaged,
  uploadVehicleImage,
  type ManagedDriver,
} from '../../../../services/vehicle.service';
import { getLineSenders, setDriverLine, type LineSender } from '../../../../services/driver-job.service';

interface DriverForm {
  name: string;
  mobileNo: string;
  licenseNo: string;
  imageUrl: string;
  lineUserId: string;
}

const EMPTY_FORM: DriverForm = { name: '', mobileNo: '', licenseNo: '', imageUrl: '', lineUserId: '' };

export default function PageDriver(): React.JSX.Element {
  const [drivers, setDrivers] = React.useState<ManagedDriver[]>([]);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<DriverForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<ManagedDriver | null>(null);

  const [senders, setSenders] = React.useState<LineSender[]>([]);

  const reload = React.useCallback(async () => {
    const res = await getDriversManaged();
    if (res.ok && res.data?.success) setDrivers(res.data.data);
    else setMessage({ type: 'error', text: res.message ?? 'โหลดข้อมูลคนขับไม่สำเร็จ' });
  }, []);

  const reloadSenders = React.useCallback(async () => {
    const res = await getLineSenders();
    if (res?.success) setSenders(res.data);
  }, []);

  React.useEffect(() => {
    void reload();
    void reloadSenders();
  }, [reload, reloadSenders]);

  const handleCopy = async (userId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(userId);
      setMessage({ type: 'success', text: 'คัดลอก LINE userId แล้ว' });
    } catch {
      setMessage({ type: 'error', text: 'คัดลอกไม่สำเร็จ' });
    }
  };

  const handleOpenAdd = (): void => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const handleOpenEdit = (d: ManagedDriver): void => {
    setEditId(d.id);
    setForm({ name: d.name, mobileNo: d.mobileNo, licenseNo: d.licenseNo, imageUrl: d.imageUrl, lineUserId: d.lineUserId ?? '' });
    setOpen(true);
  };

  const handleClose = (): void => {
    if (saving) return;
    setOpen(false);
  };

  const handleUpload = async (file: File): Promise<void> => {
    setUploading(true);
    const res = await uploadVehicleImage({ file: [file] });
    setUploading(false);
    if (res.ok && res.data?.data?.url) {
      setForm((f) => ({ ...f, imageUrl: res.data!.data.url }));
    } else {
      setMessage({ type: 'error', text: res.message ?? 'อัพโหลดรูปไม่สำเร็จ' });
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกชื่อคนขับ' });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      mobileNo: form.mobileNo.trim() || undefined,
      licenseNo: form.licenseNo.trim() || undefined,
      imageUrl: form.imageUrl || undefined,
    };
    const res = editId ? await updateDriverManaged(payload, editId) : await addDriverManaged(payload);
    if (res.ok && res.data?.success) {
      if (editId) await setDriverLine(editId, form.lineUserId.trim());
      setSaving(false);
      setMessage({ type: 'success', text: editId ? 'แก้ไขคนขับสำเร็จ' : 'เพิ่มคนขับสำเร็จ' });
      setOpen(false);
      void reload();
    } else {
      setSaving(false);
      setMessage({ type: 'error', text: res.message ?? res.data?.message ?? 'บันทึกไม่สำเร็จ' });
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const res = await deleteDriverManaged(deleteTarget.id);
    if (res.ok && res.data?.success) {
      setMessage({ type: 'success', text: 'ลบคนขับสำเร็จ' });
      void reload();
    } else {
      setMessage({ type: 'error', text: res.message ?? res.data?.message ?? 'ลบไม่สำเร็จ' });
    }
    setDeleteTarget(null);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">จัดการคนขับ</Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          เพิ่มคนขับ
        </Button>
      </Stack>

      {message ? (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      ) : null}

      <Card>
        <CardHeader title="รายชื่อคนขับ" />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>รูป</TableCell>
                <TableCell>ชื่อ</TableCell>
                <TableCell>เบอร์โทร</TableCell>
                <TableCell>เลขใบขับขี่</TableCell>
                <TableCell align="center">รถ</TableCell>
                <TableCell align="center">งาน</TableCell>
                <TableCell align="center">LINE</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Avatar src={d.imageUrl || undefined}>{d.name?.charAt(0) ?? '?'}</Avatar>
                  </TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.mobileNo || '-'}</TableCell>
                  <TableCell>{d.licenseNo || '-'}</TableCell>
                  <TableCell align="center">{d.vehicleCount}</TableCell>
                  <TableCell align="center">{d.jobCount}</TableCell>
                  <TableCell align="center">
                    {d.lineUserId ? <Chip size="small" color="success" label="ผูกแล้ว" /> : <Chip size="small" label="ยังไม่ผูก" />}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" color="warning" onClick={() => handleOpenEdit(d)}>
                      แก้ไข
                    </Button>
                    <Button size="small" color="error" onClick={() => setDeleteTarget(d)}>
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    ยังไม่มีคนขับ
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Card>
        <CardHeader
          title="ผู้ทักเข้า LINE OA"
          subheader="คนขับทักหา LINE OA 1 ครั้ง แล้วคัดลอก userId มาวางในช่อง LINE userId ตอนแก้ไขคนขับ"
          action={
            <Button size="small" onClick={() => void reloadSenders()}>
              รีเฟรช
            </Button>
          }
        />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ LINE</TableCell>
                <TableCell>LINE userId</TableCell>
                <TableCell>ข้อความล่าสุด</TableCell>
                <TableCell>เวลา</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="right">คัดลอก</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {senders.map((s) => (
                <TableRow key={s.userId}>
                  <TableCell>{s.displayName || '-'}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}>{s.userId}</TableCell>
                  <TableCell>{s.lastText || `(${s.lastType})`}</TableCell>
                  <TableCell>{new Date(s.lastAt).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</TableCell>
                  <TableCell>
                    {s.linkedDriverName ? (
                      <Chip size="small" color="success" label={`ผูกแล้ว: ${s.linkedDriverName}`} />
                    ) : (
                      <Chip size="small" label="ยังไม่ผูก" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => void handleCopy(s.userId)}>
                      คัดลอก
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {senders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    ยังไม่มีผู้ทักเข้ามา
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'แก้ไขคนขับ' : 'เพิ่มคนขับ'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={form.imageUrl || undefined} sx={{ width: 64, height: 64 }}>
                {form.name?.charAt(0) ?? '?'}
              </Avatar>
              <Button component="label" variant="outlined" disabled={uploading}>
                {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูป'}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file);
                    e.target.value = '';
                  }}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อคนขับ"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เบอร์โทร"
                value={form.mobileNo}
                onChange={(e) => setForm((f) => ({ ...f, mobileNo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เลขใบขับขี่"
                value={form.licenseNo}
                onChange={(e) => setForm((f) => ({ ...f, licenseNo: e.target.value }))}
              />
            </Grid>
            {editId ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="LINE userId"
                  placeholder="Uxxxxxxxx..."
                  helperText="ได้จาก webhook เมื่อคนขับทักหา LINE OA"
                  value={form.lineUserId}
                  onChange={(e) => setForm((f) => ({ ...f, lineUserId: e.target.value }))}
                />
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            ต้องการลบคนขับ &quot;{deleteTarget?.name}&quot; ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()}>
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
