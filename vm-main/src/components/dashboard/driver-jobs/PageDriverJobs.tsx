'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  addJob,
  cancelJob,
  getDrivers,
  getJobs,
  setDriverLine,
  type DriverJob,
  type DriverWithLine,
} from '../../../../services/driver-job.service';

const STATUS_LABEL: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'รอตอบรับ', color: 'warning' },
  accepted: { label: 'รับงาน', color: 'success' },
  rejected: { label: 'ปฏิเสธ', color: 'error' },
  cancelled: { label: 'ยกเลิก', color: 'default' },
  done: { label: 'เสร็จสิ้น', color: 'success' },
};

export default function PageDriverJobs(): React.JSX.Element {
  const [drivers, setDrivers] = React.useState<DriverWithLine[]>([]);
  const [jobs, setJobs] = React.useState<DriverJob[]>([]);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // create-job form
  const [form, setForm] = React.useState({ VehicleDriverId: '', Origin: '', Destination: '', ScheduledAt: '', Note: '' });
  // driver line edits
  const [lineEdits, setLineEdits] = React.useState<Record<string, string>>({});

  const reload = React.useCallback(async () => {
    const [d, j] = await Promise.all([getDrivers(), getJobs()]);
    if (d?.success) setDrivers(d.data);
    if (j?.success) setJobs(j.data);
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleAdd = async (): Promise<void> => {
    if (!form.VehicleDriverId || !form.Origin || !form.Destination) {
      setMessage({ type: 'error', text: 'กรุณาเลือกคนขับ และกรอกต้นทาง/ปลายทาง' });
      return;
    }
    const res = await addJob({
      VehicleDriverId: form.VehicleDriverId,
      Origin: form.Origin,
      Destination: form.Destination,
      ScheduledAt: form.ScheduledAt || undefined,
      Note: form.Note || undefined,
    });
    setMessage({ type: res.pushed ? 'success' : 'info', text: res.message ?? (res.success ? 'สร้างงานแล้ว' : 'ผิดพลาด') });
    if (res.success) {
      setForm({ VehicleDriverId: '', Origin: '', Destination: '', ScheduledAt: '', Note: '' });
      void reload();
    }
  };

  const handleCancel = async (id: string): Promise<void> => {
    const res = await cancelJob(id);
    setMessage({ type: res.success ? 'success' : 'error', text: res.message ?? '' });
    void reload();
  };

  const handleSaveLine = async (id: string): Promise<void> => {
    const current = drivers.find((d) => d.VehicleDriverId === id)?.LineUserId ?? '';
    const value = id in lineEdits ? lineEdits[id] : current;
    const res = await setDriverLine(id, value);
    setMessage({ type: res.success ? 'success' : 'error', text: res.message ?? '' });
    void reload();
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">สั่งงานคนขับผ่าน LINE</Typography>

      {message ? (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      ) : null}

      <Card>
        <CardHeader title="สร้างงานใหม่" subheader="เลือกคนขับที่ผูก LINE แล้ว ระบบจะส่งการ์ดรับงาน/ปฏิเสธไปทาง LINE" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item md={4} xs={12}>
              <TextField
                select
                fullWidth
                label="คนขับ"
                value={form.VehicleDriverId}
                onChange={(e) => setForm((f) => ({ ...f, VehicleDriverId: e.target.value }))}
              >
                <MenuItem value="">— เลือกคนขับ —</MenuItem>
                {drivers.map((d) => (
                  <MenuItem key={d.VehicleDriverId} value={d.VehicleDriverId}>
                    {d.Name} {d.LineUserId ? '(LINE ✓)' : '(ยังไม่ผูก LINE)'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField fullWidth label="ต้นทาง" value={form.Origin} onChange={(e) => setForm((f) => ({ ...f, Origin: e.target.value }))} />
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField fullWidth label="ปลายทาง" value={form.Destination} onChange={(e) => setForm((f) => ({ ...f, Destination: e.target.value }))} />
            </Grid>
            <Grid item md={4} xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                label="วัน-เวลา"
                InputLabelProps={{ shrink: true }}
                value={form.ScheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, ScheduledAt: e.target.value }))}
              />
            </Grid>
            <Grid item md={8} xs={12}>
              <TextField fullWidth label="หมายเหตุ" value={form.Note} onChange={(e) => setForm((f) => ({ ...f, Note: e.target.value }))} />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => void handleAdd()}>
            ส่งงานให้คนขับ
          </Button>
        </Box>
      </Card>

      <Card>
        <CardHeader title="รายการงาน" />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>คนขับ</TableCell>
                <TableCell>เส้นทาง</TableCell>
                <TableCell>เวลา</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((j) => {
                const st = STATUS_LABEL[j.Status] ?? { label: j.Status, color: 'default' as const };
                return (
                  <TableRow key={j.DriverJobId}>
                    <TableCell>{j.VehicleDriver?.Name ?? '-'}</TableCell>
                    <TableCell>
                      {j.Origin} → {j.Destination}
                      {j.Note ? <Typography variant="caption" display="block" color="text.secondary">{j.Note}</Typography> : null}
                    </TableCell>
                    <TableCell>{j.ScheduledAt ? new Date(j.ScheduledAt).toLocaleString('th-TH') : '-'}</TableCell>
                    <TableCell><Chip size="small" label={st.label} color={st.color} /></TableCell>
                    <TableCell align="right">
                      {j.Status === 'pending' || j.Status === 'accepted' ? (
                        <Button size="small" color="error" onClick={() => void handleCancel(j.DriverJobId)}>
                          ยกเลิก
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">ยังไม่มีงาน</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Card>
        <CardHeader title="ผูก LINE ให้คนขับ" subheader="กรอก LINE userId ของคนขับ (ได้จาก webhook เมื่อคนขับทักหา LINE OA)" />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>คนขับ</TableCell>
                <TableCell>LINE userId</TableCell>
                <TableCell align="right">บันทึก</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.VehicleDriverId}>
                  <TableCell>{d.Name}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Uxxxxxxxx..."
                      defaultValue={d.LineUserId ?? ''}
                      onChange={(e) => setLineEdits((m) => ({ ...m, [d.VehicleDriverId]: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" onClick={() => void handleSaveLine(d.VehicleDriverId)}>
                      บันทึก
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Stack>
  );
}
