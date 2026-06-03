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
  createUserManaged,
  deactivateUserManaged,
  listUsersManaged,
  updateUserRole,
  type ManagedUser,
} from '../../../../../services/auth.service';
import { useUser } from '@/hooks/use-user';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'ผู้ดูแลระบบ (admin)' },
  { value: 'staff', label: 'พนักงาน (staff)' },
  { value: 'viewer', label: 'ดูอย่างเดียว (viewer)' },
];

const ROLE_LABEL: Record<string, { label: string; color: 'primary' | 'info' | 'default' }> = {
  admin: { label: 'admin', color: 'primary' },
  staff: { label: 'staff', color: 'info' },
  viewer: { label: 'viewer', color: 'default' },
};

interface CreateForm {
  name: string;
  username: string;
  password: string;
  mobileNo: string;
  email: string;
  role: string;
}

const EMPTY_FORM: CreateForm = { name: '', username: '', password: '', mobileNo: '', email: '', role: 'staff' };

export default function AdminList(): React.JSX.Element {
  const { user } = useUser();
  const [users, setUsers] = React.useState<ManagedUser[]>([]);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<CreateForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<ManagedUser | null>(null);

  const reload = React.useCallback(async () => {
    const res = await listUsersManaged();
    if (res.ok && res.data?.success) setUsers(res.data.data);
    else setMessage({ type: 'error', text: res.message ?? 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ' });
  }, []);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleOpenAdd = (): void => {
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const handleClose = (): void => {
    if (saving) return;
    setOpen(false);
  };

  const handleCreateSave = async (): Promise<void> => {
    if (!form.username.trim() || !form.password.trim() || !form.mobileNo.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอก username, รหัสผ่าน และเบอร์โทร' });
      return;
    }
    if (form.password.length < 6) {
      setMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    setSaving(true);
    const res = await createUserManaged({
      name: form.name.trim() || undefined,
      username: form.username.trim(),
      password: form.password,
      mobileNo: form.mobileNo.trim(),
      email: form.email.trim() || undefined,
      role: form.role,
    });
    setSaving(false);
    if (res.ok && res.data?.success) {
      setMessage({ type: 'success', text: 'เพิ่มผู้ใช้สำเร็จ' });
      setOpen(false);
      void reload();
    } else {
      setMessage({ type: 'error', text: res.message ?? res.data?.message ?? 'เพิ่มผู้ใช้ไม่สำเร็จ' });
    }
  };

  const handleChangeRole = async (id: string, role: string): Promise<void> => {
    const res = await updateUserRole(id, role);
    if (res.ok && res.data?.success) {
      setMessage({ type: 'success', text: 'อัปเดต role สำเร็จ' });
      void reload();
    } else {
      setMessage({ type: 'error', text: res.message ?? res.data?.message ?? 'อัปเดต role ไม่สำเร็จ' });
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const res = await deactivateUserManaged(deleteTarget.CustomerId);
    if (res.ok && res.data?.success) {
      setMessage({ type: 'success', text: 'ปิดบัญชีผู้ใช้สำเร็จ' });
      void reload();
    } else {
      setMessage({ type: 'error', text: res.message ?? res.data?.message ?? 'ปิดบัญชีไม่สำเร็จ' });
    }
    setDeleteTarget(null);
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">ระบบจัดการผู้ใช้งาน</Typography>
        <Button variant="contained" onClick={handleOpenAdd}>
          เพิ่มผู้ใช้
        </Button>
      </Stack>

      {message ? (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      ) : null}

      <Card>
        <CardHeader title="รายชื่อผู้ใช้งาน" />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>รูป</TableCell>
                <TableCell>ชื่อ</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>เบอร์โทร</TableCell>
                <TableCell>สิทธิ์</TableCell>
                <TableCell align="center">เปลี่ยนสิทธิ์</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.CustomerId === user?.CustomerId;
                const roleChip = ROLE_LABEL[u.Role] ?? { label: u.Role, color: 'default' as const };
                return (
                  <TableRow key={u.CustomerId}>
                    <TableCell>
                      <Avatar src={u.ImageUrl || undefined}>{u.Name?.charAt(0) ?? u.Username.charAt(0)}</Avatar>
                    </TableCell>
                    <TableCell>{u.Name || '-'}</TableCell>
                    <TableCell>{u.Username}</TableCell>
                    <TableCell>{u.MobileNo || '-'}</TableCell>
                    <TableCell>
                      <Chip size="small" color={roleChip.color} label={roleChip.label} />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        select
                        size="small"
                        value={u.Role}
                        disabled={isSelf}
                        onChange={(e) => void handleChangeRole(u.CustomerId, e.target.value)}
                        sx={{ minWidth: 160 }}
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" color="error" disabled={isSelf} onClick={() => setDeleteTarget(u)}>
                        ปิดบัญชี
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    ยังไม่มีผู้ใช้
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>เพิ่มผู้ใช้</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="ชื่อ" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="รหัสผ่าน"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="เบอร์โทร" value={form.mobileNo} onChange={(e) => setForm((f) => ({ ...f, mobileNo: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="อีเมล" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="สิทธิ์"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button variant="contained" onClick={() => void handleCreateSave()} disabled={saving}>
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>ยืนยันการปิดบัญชี</DialogTitle>
        <DialogContent>
          <Typography>ต้องการปิดบัญชีผู้ใช้ &quot;{deleteTarget?.Username}&quot; ใช่หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>ยกเลิก</Button>
          <Button color="error" variant="contained" onClick={() => void handleDelete()}>
            ปิดบัญชี
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
