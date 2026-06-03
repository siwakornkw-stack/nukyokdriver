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
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  addJob,
  assignJob,
  cancelJob,
  getDrivers,
  getJobs,
  type DriverJob,
  type DriverWithLine,
} from '../../../../services/driver-job.service';

const STATUS_LABEL: Record<string, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  unassigned: { label: 'ยังไม่เลือกคนขับ', color: 'default' },
  pending: { label: 'รอตอบรับ', color: 'warning' },
  accepted: { label: 'รับงาน', color: 'success' },
  rejected: { label: 'ปฏิเสธ', color: 'error' },
  cancelled: { label: 'ยกเลิก', color: 'default' },
  done: { label: 'เสร็จสิ้น', color: 'success' },
};

const DateTimeInput = React.forwardRef<
  HTMLInputElement,
  { value?: string; onClick?: () => void; onChange?: () => void }
>(function DateTimeInput({ value, onClick, onChange }, ref) {
  return (
    <TextField
      fullWidth
      label="วัน-เวลา"
      placeholder="เลือกวัน-เวลา"
      inputRef={ref}
      value={value ?? ''}
      onClick={onClick}
      onChange={onChange}
      InputLabelProps={{ shrink: true }}
    />
  );
});

export default function PageDriverJobs(): React.JSX.Element {
  const [drivers, setDrivers] = React.useState<DriverWithLine[]>([]);
  const [jobs, setJobs] = React.useState<DriverJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // create-job form
  const [form, setForm] = React.useState({ ScheduledAt: '', Note: '' });
  // job items: each pairs a content line with its own destination map link
  const [items, setItems] = React.useState<{ id: string; content: string; map: string }[]>([
    { id: crypto.randomUUID(), content: '', map: '' },
  ]);
  // per-job driver selection for the assign step
  const [assignSel, setAssignSel] = React.useState<Record<string, string>>({});

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const [d, j] = await Promise.all([getDrivers(), getJobs()]);
      if (d?.success) setDrivers(d.data);
      if (j?.success) setJobs(j.data);
    } catch {
      setMessage({ type: 'error', text: 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่' });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleAdd = async (): Promise<void> => {
    const valid = items
      .map((it) => ({ content: it.content.trim(), map: it.map.trim() }))
      .filter((it) => it.content);
    if (!valid.length) {
      setMessage({ type: 'error', text: 'กรุณากรอกเนื้อหางาน' });
      return;
    }
    // Origin / Destination hold one line per job item, paired by index.
    const res = await addJob({
      Origin: valid.map((v) => v.content).join('\n'),
      Destination: valid.map((v) => v.map || '-').join('\n'),
      ScheduledAt: form.ScheduledAt || undefined,
      Note: form.Note || undefined,
    });
    setMessage({ type: res.success ? 'success' : 'error', text: res.message ?? (res.success ? 'สร้างงานแล้ว' : 'ผิดพลาด') });
    if (res.success) {
      setForm({ ScheduledAt: '', Note: '' });
      setItems([{ id: crypto.randomUUID(), content: '', map: '' }]);
      void reload();
    }
  };

  const handleAssign = async (id: string): Promise<void> => {
    const driverId = assignSel[id];
    if (!driverId) {
      setMessage({ type: 'error', text: 'เลือกคนขับก่อน' });
      return;
    }
    const res = await assignJob(id, driverId);
    setMessage({ type: res.pushed ? 'success' : 'info', text: res.message ?? '' });
    if (res.success) {
      setAssignSel((s) => { const n = { ...s }; delete n[id]; return n; });
      void reload();
    }
  };

  const handleCancel = async (id: string): Promise<void> => {
    const res = await cancelJob(id);
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
        <CardHeader title="สร้างงานใหม่" subheader="สร้างงานก่อน แล้วเลือกคนขับภายหลังจากรายการงาน ระบบจะส่งการ์ดรับงาน/ปฏิเสธทาง LINE ตอนเลือกคนขับ" />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack spacing={2}>
                {items.map((it, i) => (
                  <Box key={it.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">งาน {i + 1}</Typography>
                      {items.length > 1 ? (
                        <IconButton size="small" aria-label="ลบงาน" onClick={() => setItems((arr) => arr.filter((v) => v.id !== it.id))}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>
                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        label="เนื้อหางาน"
                        value={it.content}
                        onChange={(e) => setItems((arr) => arr.map((v) => (v.id === it.id ? { ...v, content: e.target.value } : v)))}
                      />
                      <TextField
                        fullWidth
                        label="จุดหมายปลายทาง (ลิงก์ Google Map)"
                        placeholder="วางลิงก์ Google Map"
                        value={it.map}
                        onChange={(e) => setItems((arr) => arr.map((v) => (v.id === it.id ? { ...v, map: e.target.value } : v)))}
                      />
                    </Stack>
                  </Box>
                ))}
                <Box>
                  <Button size="small" startIcon={<AddIcon />} onClick={() => setItems((arr) => [...arr, { id: crypto.randomUUID(), content: '', map: '' }])}>
                    เพิ่มช่องงาน
                  </Button>
                </Box>
              </Stack>
            </Grid>
            <Grid item md={4} xs={12}>
              <Box sx={{ '& .react-datepicker-wrapper': { width: '100%' } }}>
                <DatePicker
                  selected={form.ScheduledAt ? new Date(form.ScheduledAt) : null}
                  onChange={(d) => setForm((f) => ({ ...f, ScheduledAt: d ? d.toISOString() : '' }))}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  customInput={<DateTimeInput />}
                  popperPlacement="bottom-start"
                  isClearable
                />
              </Box>
            </Grid>
            <Grid item md={8} xs={12}>
              <TextField fullWidth label="หมายเหตุ" value={form.Note} onChange={(e) => setForm((f) => ({ ...f, Note: e.target.value }))} />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={() => void handleAdd()}>
            สร้างงาน
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
                <TableCell>เนื้อหางาน</TableCell>
                <TableCell>เวลา</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>กำลังโหลด...</TableCell>
                </TableRow>
              ) : null}
              {jobs.map((j) => {
                const st = STATUS_LABEL[j.Status] ?? { label: j.Status, color: 'default' as const };
                return (
                  <TableRow key={j.DriverJobId}>
                    <TableCell>{j.VehicleDriver?.Name ?? '-'}</TableCell>
                    <TableCell>
                      {j.Origin.split('\n').map((c, i) => {
                        const d = (j.Destination ?? '').split('\n')[i];
                        return (
                          <Box key={`${j.DriverJobId}-${i}`} sx={{ mb: 0.5 }}>
                            <Typography variant="body2">{c}</Typography>
                            {d && d !== '-' ? (
                              /^https?:\/\//i.test(d) ? (
                                <Link href={d} target="_blank" rel="noopener" variant="caption">เปิดแผนที่</Link>
                              ) : (
                                <Typography variant="caption" display="block" color="text.secondary">{d}</Typography>
                              )
                            ) : null}
                          </Box>
                        );
                      })}
                      {j.Note ? <Typography variant="caption" display="block" color="text.secondary">{j.Note}</Typography> : null}
                    </TableCell>
                    <TableCell>{j.ScheduledAt ? new Date(j.ScheduledAt).toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</TableCell>
                    <TableCell><Chip size="small" label={st.label} color={st.color} /></TableCell>
                    <TableCell align="right">
                      {j.Status === 'unassigned' || j.Status === 'rejected' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <TextField
                            select
                            size="small"
                            label="คนขับ"
                            value={assignSel[j.DriverJobId] ?? ''}
                            onChange={(e) => setAssignSel((s) => ({ ...s, [j.DriverJobId]: e.target.value }))}
                            sx={{ minWidth: 180 }}
                          >
                            <MenuItem value="">— เลือกคนขับ —</MenuItem>
                            {drivers.map((d) => (
                              <MenuItem key={d.VehicleDriverId} value={d.VehicleDriverId}>
                                {d.Name} {d.LineUserId ? '(LINE ✓)' : '(ยังไม่ผูก LINE)'}
                              </MenuItem>
                            ))}
                          </TextField>
                          <Button size="small" variant="contained" onClick={() => void handleAssign(j.DriverJobId)}>
                            ส่ง LINE
                          </Button>
                          <Button size="small" color="error" onClick={() => void handleCancel(j.DriverJobId)}>
                            ยกเลิก
                          </Button>
                        </Stack>
                      ) : j.Status === 'pending' || j.Status === 'accepted' ? (
                        <Button size="small" color="error" onClick={() => void handleCancel(j.DriverJobId)}>
                          ยกเลิก
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 4 }}>ยังไม่มีงาน</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Stack>
  );
}
