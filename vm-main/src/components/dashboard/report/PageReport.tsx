'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Unstable_Grid2';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { numberFormat } from '@/helpers/helper';
import {
  getFuelDetail,
  getIncomeSummary,
  type FuelDetailRow,
  type IncomeSummaryRow,
} from '../../../../services/report.service';

const FUEL_HEADERS: { key: keyof FuelDetailRow; label: string; money?: boolean }[] = [
  { key: 'date', label: 'วันที่' },
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'item', label: 'รายการ' },
  { key: 'taxInvoiceNumber', label: 'เลขที่ใบกำกับภาษี' },
  { key: 'liters', label: 'ลิตร' },
  { key: 'amount', label: 'ยอดเงิน', money: true },
  { key: 'odometerStart', label: 'ไมล์เริ่ม' },
  { key: 'odometerEnd', label: 'ไมล์จบ' },
  { key: 'distance', label: 'ระยะทาง (กม.)' },
];

const INCOME_HEADERS: { key: keyof IncomeSummaryRow; label: string; money?: boolean }[] = [
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'vehicleType', label: 'ประเภท' },
  { key: 'driverName', label: 'คนขับ' },
  { key: 'totalTrips', label: 'จำนวนเที่ยว' },
  { key: 'totalIncome', label: 'รายได้รวม', money: true },
  { key: 'averageIncome', label: 'เฉลี่ย/เที่ยว', money: true },
  { key: 'lastTripDate', label: 'ล่าสุด' },
];

function downloadCsv(filename: string, headers: { label: string }[], rows: (string | number)[][]): void {
  const esc = (v: string | number): string => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map((h) => esc(h.label)).join(','), ...rows.map((r) => r.map(esc).join(','))];
  // UTF-8 BOM so Excel renders Thai correctly.
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const YEARS = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);

type SortDir = 'asc' | 'desc';

function sortRows<T>(rows: T[], key: keyof T | null, dir: SortDir): T[] {
  if (!key) return rows;
  return [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''), 'th');
    return dir === 'asc' ? cmp : -cmp;
  });
}

export default function PageReport(): React.JSX.Element {
  const [year, setYear] = React.useState<number | 'all'>('all');
  const [month, setMonth] = React.useState<number | 'all'>('all');
  const [tab, setTab] = React.useState<'fuel' | 'income'>('fuel');
  const [vehicle, setVehicle] = React.useState<string>('all');
  const [fuelSort, setFuelSort] = React.useState<{ key: keyof FuelDetailRow | null; dir: SortDir }>({ key: null, dir: 'asc' });
  const [incomeSort, setIncomeSort] = React.useState<{ key: keyof IncomeSummaryRow | null; dir: SortDir }>({ key: null, dir: 'asc' });

  const { startDate, endDate } = React.useMemo<{ startDate: Date | null; endDate: Date | null }>(() => {
    if (year === 'all') return { startDate: null, endDate: null };
    const base = dayjs().year(year);
    if (month === 'all') return { startDate: base.startOf('year').toDate(), endDate: base.endOf('year').toDate() };
    const m = base.month(month);
    return { startDate: m.startOf('month').toDate(), endDate: m.endOf('month').toDate() };
  }, [year, month]);

  const { data: fuelWrap, isLoading: fuelLoading } = useQuery({
    queryKey: ['report-fuel-detail', startDate, endDate],
    queryFn: () => getFuelDetail(startDate, endDate),
    staleTime: 10000,
  });
  const { data: incomeWrap, isLoading: incomeLoading } = useQuery({
    queryKey: ['report-income', startDate, endDate],
    queryFn: () => getIncomeSummary(startDate, endDate),
    staleTime: 10000,
  });

  const fuelRows: FuelDetailRow[] = fuelWrap?.data?.data ?? [];
  const incomeRows: IncomeSummaryRow[] = incomeWrap?.data?.data ?? [];

  const vehicleOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    [...fuelRows, ...incomeRows].forEach((r) => {
      if (!map.has(r.vehicleId)) map.set(r.vehicleId, r.licensePlate);
    });
    return Array.from(map.entries()).map(([id, plate]) => ({ id, plate })).sort((a, b) => a.plate.localeCompare(b.plate, 'th'));
  }, [fuelRows, incomeRows]);

  const filteredFuel = vehicle === 'all' ? fuelRows : fuelRows.filter((r) => r.vehicleId === vehicle);
  const filteredIncome = vehicle === 'all' ? incomeRows : incomeRows.filter((r) => r.vehicleId === vehicle);

  const sortedFuel = React.useMemo(() => sortRows(filteredFuel, fuelSort.key, fuelSort.dir), [filteredFuel, fuelSort]);
  const sortedIncome = React.useMemo(() => sortRows(filteredIncome, incomeSort.key, incomeSort.dir), [filteredIncome, incomeSort]);

  const handleFuelSort = (key: keyof FuelDetailRow): void =>
    setFuelSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleIncomeSort = (key: keyof IncomeSummaryRow): void =>
    setIncomeSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));

  const totalFuel = filteredFuel.reduce((s, r) => s + r.amount, 0);
  const totalIncome = filteredIncome.reduce((s, r) => s + r.totalIncome, 0);
  const profit = totalIncome - totalFuel;

  const exportActive = (): void => {
    const range = startDate && endDate ? `${dayjs(startDate).format('YYYYMMDD')}-${dayjs(endDate).format('YYYYMMDD')}` : 'all';
    if (tab === 'fuel') {
      downloadCsv(
        `report-fuel-${range}.csv`,
        FUEL_HEADERS,
        sortedFuel.map((r) => FUEL_HEADERS.map((h) => r[h.key] as string | number)),
      );
    } else {
      downloadCsv(
        `report-income-${range}.csv`,
        INCOME_HEADERS,
        sortedIncome.map((r) => INCOME_HEADERS.map((h) => r[h.key] as string | number)),
      );
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">รายงานสรุป</Typography>

      <Card>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>ปี</InputLabel>
            <Select
              label="ปี"
              value={year}
              onChange={(e) => {
                const v = e.target.value;
                setYear(v === 'all' ? 'all' : Number(v));
                if (v === 'all') setMonth('all');
              }}
            >
              <MenuItem value="all">ทั้งหมด</MenuItem>
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>{y + 543}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }} disabled={year === 'all'}>
            <InputLabel>เดือน</InputLabel>
            <Select
              label="เดือน"
              value={month}
              onChange={(e) => {
                const v = e.target.value;
                setMonth(v === 'all' ? 'all' : Number(v));
              }}
            >
              <MenuItem value="all">ทั้งปี</MenuItem>
              {MONTHS.map((name, i) => (
                <MenuItem key={name} value={i}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>ทะเบียน</InputLabel>
            <Select label="ทะเบียน" value={vehicle} onChange={(e) => setVehicle(String(e.target.value))}>
              <MenuItem value="all">ทุกคัน</MenuItem>
              {vehicleOptions.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.plate}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={exportActive}>
            export CSV
          </Button>
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">ค่าน้ำมันรวม</Typography>
              <Typography variant="h5">{numberFormat(totalFuel)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">รายได้รวม</Typography>
              <Typography variant="h5">{numberFormat(totalIncome)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="overline">กำไร</Typography>
              <Typography variant="h5" color={profit < 0 ? 'error.main' : 'success.main'}>{numberFormat(profit)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v as 'fuel' | 'income')} sx={{ px: 2 }}>
          <Tab label="ค่าน้ำมัน" value="fuel" />
          <Tab label="รายได้" value="income" />
        </Tabs>
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          {tab === 'fuel' ? (
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  {FUEL_HEADERS.map((h) => (
                    <TableCell key={h.key} sortDirection={fuelSort.key === h.key ? fuelSort.dir : false}>
                      <TableSortLabel
                        active={fuelSort.key === h.key}
                        direction={fuelSort.key === h.key ? fuelSort.dir : 'asc'}
                        onClick={() => handleFuelSort(h.key)}
                      >
                        {h.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!fuelLoading && sortedFuel.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={FUEL_HEADERS.length} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      ไม่มีข้อมูลในช่วงวันที่ที่เลือก
                    </TableCell>
                  </TableRow>
                ) : null}
                {sortedFuel.map((r) => (
                  <TableRow hover key={r.id}>
                    {FUEL_HEADERS.map((h) => (
                      <TableCell key={h.key}>{h.money ? numberFormat(r[h.key] as number) : String(r[h.key] ?? '-')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  {INCOME_HEADERS.map((h) => (
                    <TableCell key={h.key} sortDirection={incomeSort.key === h.key ? incomeSort.dir : false}>
                      <TableSortLabel
                        active={incomeSort.key === h.key}
                        direction={incomeSort.key === h.key ? incomeSort.dir : 'asc'}
                        onClick={() => handleIncomeSort(h.key)}
                      >
                        {h.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!incomeLoading && sortedIncome.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={INCOME_HEADERS.length} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      ไม่มีข้อมูลในช่วงวันที่ที่เลือก
                    </TableCell>
                  </TableRow>
                ) : null}
                {sortedIncome.map((r) => (
                  <TableRow hover key={r.id}>
                    {INCOME_HEADERS.map((h) => (
                      <TableCell key={h.key}>{h.money ? numberFormat(r[h.key] as number) : String(r[h.key] ?? '-')}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Card>
    </Stack>
  );
}
