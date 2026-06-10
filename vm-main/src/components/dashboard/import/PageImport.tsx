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
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { importAuto, checkAiStatus, type ImportSheetResult, type AiStatusResponse } from '../../../../services/import-data.service';

const AI_SEVERITY: Record<AiStatusResponse['status'], 'success' | 'warning' | 'error'> = {
  ok: 'success', quota: 'warning', unavailable: 'warning', no_key: 'warning', error: 'error',
};

const AI_PROVIDER_LABEL: Record<AiStatusResponse['status'], string> = {
  ok: 'พร้อม', quota: 'quota เต็ม', unavailable: 'โหลดสูง', no_key: 'ไม่มี key', error: 'ใช้ไม่ได้',
};

const TYPE_LABEL: Record<string, string> = {
  vehicles: 'รถ', jobs: 'สั่งงานคนขับ', repair: 'ซ่อม', accident: 'อุบัติเหตุ',
  fuel: 'ค่าน้ำมัน', oil: 'เปลี่ยนน้ำมัน', installment: 'ค่างวด', income: 'รายได้', unknown: 'ไม่รู้จัก',
};

export default function PageImport(): React.JSX.Element {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [results, setResults] = React.useState<ImportSheetResult[]>([]);
  const [duplicates, setDuplicates] = React.useState<string[]>([]);
  const [aiChecking, setAiChecking] = React.useState(false);
  const [aiStatus, setAiStatus] = React.useState<AiStatusResponse | null>(null);

  const handleCheckAi = async (): Promise<void> => {
    setAiChecking(true);
    setAiStatus(null);
    try {
      setAiStatus(await checkAiStatus());
    } catch {
      setAiStatus({ success: false, status: 'error', message: 'เช็ค AI ไม่สำเร็จ' });
    } finally {
      setAiChecking(false);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setMessage({ type: 'error', text: 'กรุณาเลือกไฟล์ก่อน' });
      return;
    }
    setLoading(true);
    setResults([]);
    setDuplicates([]);
    try {
      const res = await importAuto(file);
      setResults(res.results ?? []);
      setDuplicates(res.duplicates ?? []);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message ?? 'เสร็จสิ้น' });
    } catch (e) {
      setMessage({ type: 'error', text: 'อัปโหลดไม่สำเร็จ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">นำเข้าข้อมูล (Excel / CSV)</Typography>

      {message ? (
        <Alert severity={message.type} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      ) : null}

      <Card>
        <CardHeader
          title="โยนไฟล์ข้อมูลดิบ"
          subheader="รองรับ .xlsx (หลาย sheet) / .csv / .json — AI จะตรวจว่าแต่ละ sheet เป็นรถ/สั่งงานคนขับ(LINE)/ซ่อม/อุบัติเหตุ/ค่าน้ำมัน/เปลี่ยนน้ำมัน/ค่างวด/รายได้/ประกัน แล้วนำเข้าให้อัตโนมัติ"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center">
            <Button variant="outlined" component="label">
              เลือกไฟล์
              <input
                hidden
                type="file"
                accept=".xlsx,.xls,.csv,.json"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && f.size > 4 * 1024 * 1024) {
                    setFile(null);
                    setMessage({ type: 'error', text: `ไฟล์ใหญ่เกินไป (${(f.size / 1024 / 1024).toFixed(1)} MB) — จำกัด 4 MB. ถ้าไฟล์มีรูปภาพฝัง ให้ลบรูปหรือ Save As เป็น .csv ก่อน` });
                    return;
                  }
                  setMessage(null);
                  setFile(f);
                }}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              {file ? file.name : 'ยังไม่ได้เลือกไฟล์'}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="text" disabled={aiChecking} onClick={() => void handleCheckAi()}>
              {aiChecking ? 'กำลังเช็ค AI...' : 'เช็ค AI ก่อนนำเข้า'}
            </Button>
            <Button variant="contained" disabled={!file || loading} onClick={() => void handleUpload()}>
              {loading ? 'กำลังนำเข้า...' : 'นำเข้าข้อมูล'}
            </Button>
          </Stack>
          {aiStatus ? (
            <Alert severity={AI_SEVERITY[aiStatus.status]} sx={{ mt: 2 }} onClose={() => setAiStatus(null)}>
              {aiStatus.message}
              {aiStatus.providers && aiStatus.providers.length > 0 ? (
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  {aiStatus.providers.map((p) => (
                    <Chip
                      key={p.name}
                      size="small"
                      label={`${p.name}: ${AI_PROVIDER_LABEL[p.status]}`}
                      color={p.status === 'ok' ? 'success' : p.status === 'error' ? 'error' : 'warning'}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              ) : null}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {results.length > 0 ? (
        <Card>
          <CardHeader title="ผลการนำเข้า" />
          <Divider />
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sheet</TableCell>
                  <TableCell>ชนิด</TableCell>
                  <TableCell align="right">เพิ่มใหม่</TableCell>
                  <TableCell align="right">อัปเดต</TableCell>
                  <TableCell align="right">ประกัน/พรบ/ภาษี</TableCell>
                  <TableCell align="right">ข้าม</TableCell>
                  <TableCell>ข้อผิดพลาด</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.sheet}>
                    <TableCell>{r.sheet}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={TYPE_LABEL[r.type] ?? r.type}
                        color={r.type === 'unknown' ? 'default' : 'primary'}
                      />
                    </TableCell>
                    <TableCell align="right">{r.created}</TableCell>
                    <TableCell align="right">{r.updated}</TableCell>
                    <TableCell align="right">{r.sub}</TableCell>
                    <TableCell align="right">{r.skipped}</TableCell>
                    <TableCell>
                      {r.errors.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      ) : (
                        r.errors.slice(0, 5).map((err, i) => (
                          <Typography key={i} variant="caption" display="block" color="error">{err}</Typography>
                        ))
                      )}
                      {r.errors.length > 5 ? (
                        <Typography variant="caption" color="text.secondary">…และอีก {r.errors.length - 5} รายการ</Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      ) : null}

      {duplicates.length > 0 ? (
        <Card>
          <CardHeader
            title={`จุดที่ซ้ำในไฟล์ (ตัดออก ${duplicates.length} รายการ)`}
            subheader="แถวที่มี key ซ้ำกันในไฟล์ ระบบเก็บไว้ชุดเดียว ที่เหลือตัดทิ้ง"
          />
          <Divider />
          <CardContent>
            <Stack spacing={0.5}>
              {duplicates.map((d, i) => (
                <Typography key={i} variant="body2" color="text.secondary">{d}</Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
