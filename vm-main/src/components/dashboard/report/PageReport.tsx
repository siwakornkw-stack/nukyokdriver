'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
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
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { numberFormat } from '@/helpers/helper';
import {
  getCostDetail,
  getExpenseSummary,
  getFuelDetail,
  getIncomeSummary,
  type ExpenseSummaryRow,
  type FuelDetailRow,
  type IncomeSummaryRow,
  type InstallmentDetailRow,
  type InsuranceDetailRow,
  type RepairDetailRow,
  type TaxDetailRow,
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

const REPAIR_HEADERS: { key: keyof RepairDetailRow; label: string; money?: boolean }[] = [
  { key: 'date', label: 'วันที่' },
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'description', label: 'รายการซ่อม' },
  { key: 'repairShop', label: 'อู่/ร้านซ่อม' },
  { key: 'insurancePay', label: 'ประกันจ่าย', money: true },
  { key: 'companyPay', label: 'บริษัทจ่าย', money: true },
];

const INSTALLMENT_HEADERS: { key: keyof InstallmentDetailRow; label: string; money?: boolean }[] = [
  { key: 'datePay', label: 'วันที่จ่าย' },
  { key: 'dueDate', label: 'ครบกำหนด' },
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'installmentNumber', label: 'งวดที่' },
  { key: 'amount', label: 'จำนวนเงิน', money: true },
  { key: 'paymentEvidence', label: 'หลักฐานการชำระ' },
];

const INSURANCE_HEADERS: { key: keyof InsuranceDetailRow; label: string; money?: boolean }[] = [
  { key: 'endDate', label: 'หมดอายุ' },
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'type', label: 'ประเภท' },
  { key: 'insuranceCompany', label: 'บริษัทประกัน' },
  { key: 'premium', label: 'ค่าเบี้ย', money: true },
];

const TAX_HEADERS: { key: keyof TaxDetailRow; label: string; money?: boolean }[] = [
  { key: 'kind', label: 'ประเภท' },
  { key: 'endDate', label: 'หมดอายุ' },
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'insuranceCompany', label: 'หน่วยงาน/บริษัท' },
  { key: 'premium', label: 'จำนวนเงิน', money: true },
];

const EXPENSE_HEADERS: { key: keyof ExpenseSummaryRow; label: string; money?: boolean }[] = [
  { key: 'licensePlate', label: 'ทะเบียน' },
  { key: 'vehicleType', label: 'ประเภท' },
  { key: 'income', label: 'รายได้', money: true },
  { key: 'fuelCost', label: 'ค่าน้ำมัน', money: true },
  { key: 'repairCost', label: 'ค่าซ่อม', money: true },
  { key: 'taxCost', label: 'ภาษี', money: true },
  { key: 'compulsoryCost', label: 'พรบ.', money: true },
  { key: 'insuranceCost', label: 'ประกันภัย', money: true },
  { key: 'installmentCost', label: 'ค่างวด', money: true },
  { key: 'totalCost', label: 'ต้นทุนรวม', money: true },
  { key: 'profit', label: 'กำไร', money: true },
];

function downloadCsv(filename: string, headers: { label: string }[], rows: (string | number)[][]): void {
  const esc = (v: string | number): string => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map((h) => esc(h.label)).join(','), ...rows.map((r) => r.map(esc).join(','))];
  // UTF-8 BOM so Excel renders Thai correctly.
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
type TabKey = 'expense' | 'repair' | 'installment' | 'insurance' | 'tax' | 'fuel' | 'income';

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

// Generic sortable detail table — used by the flat per-transaction tabs
// (ค่าซ่อม / ค่างวด / ประกันภัย / ภาษี+พรบ). Mirrors the fuel-detail table shape.
function DetailTable<T extends { id: string | number }>({
  headers, rows, sort, onSort, loading, minWidth,
}: {
  headers: { key: keyof T; label: string; money?: boolean }[];
  rows: T[];
  sort: { key: keyof T | null; dir: SortDir };
  onSort: (key: keyof T) => void;
  loading: boolean;
  minWidth: number;
}): React.JSX.Element {
  return (
    <Table sx={{ minWidth }}>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={String(h.key)} align={h.money ? 'right' : 'left'} sortDirection={sort.key === h.key ? sort.dir : false}>
              <TableSortLabel
                active={sort.key === h.key}
                direction={sort.key === h.key ? sort.dir : 'asc'}
                onClick={() => onSort(h.key)}
              >
                {h.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {!loading && rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={headers.length} align="center" sx={{ color: 'text.secondary', py: 4 }}>
              ไม่มีข้อมูลในช่วงวันที่ที่เลือก
            </TableCell>
          </TableRow>
        ) : null}
        {rows.map((r) => (
          <TableRow hover key={String(r.id)}>
            {headers.map((h) => (
              <TableCell key={String(h.key)} align={h.money ? 'right' : 'left'}>
                {h.money ? numberFormat(r[h.key] as number) : String(r[h.key] ?? '-')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="overline">{label}</Typography>
        <Typography variant="h5" color={color}>{numberFormat(value)}</Typography>
      </CardContent>
    </Card>
  );
}

export default function PageReport(): React.JSX.Element {
  const [year, setYear] = React.useState<number | 'all'>('all');
  const [month, setMonth] = React.useState<number | 'all'>('all');
  const [tab, setTab] = React.useState<TabKey>('expense');
  const [vehicle, setVehicle] = React.useState<string>('all');
  const [fuelSort, setFuelSort] = React.useState<{ key: keyof FuelDetailRow | null; dir: SortDir }>({ key: null, dir: 'asc' });
  const [incomeSort, setIncomeSort] = React.useState<{ key: keyof IncomeSummaryRow | null; dir: SortDir }>({ key: null, dir: 'asc' });
  const [expenseSort, setExpenseSort] = React.useState<{ key: keyof ExpenseSummaryRow | null; dir: SortDir }>({ key: 'totalCost', dir: 'desc' });
  const [repairSort, setRepairSort] = React.useState<{ key: keyof RepairDetailRow | null; dir: SortDir }>({ key: 'date', dir: 'desc' });
  const [installmentSort, setInstallmentSort] = React.useState<{ key: keyof InstallmentDetailRow | null; dir: SortDir }>({ key: 'datePay', dir: 'desc' });
  const [insuranceSort, setInsuranceSort] = React.useState<{ key: keyof InsuranceDetailRow | null; dir: SortDir }>({ key: 'endDate', dir: 'desc' });
  const [taxSort, setTaxSort] = React.useState<{ key: keyof TaxDetailRow | null; dir: SortDir }>({ key: 'endDate', dir: 'desc' });

  const { startDate, endDate } = React.useMemo<{ startDate: Date | null; endDate: Date | null }>(() => {
    if (year === 'all') return { startDate: null, endDate: null };
    const base = dayjs().year(year);
    if (month === 'all') return { startDate: base.startOf('year').toDate(), endDate: base.endOf('year').toDate() };
    const m = base.month(month);
    return { startDate: m.startOf('month').toDate(), endDate: m.endOf('month').toDate() };
  }, [year, month]);

  const { data: expenseWrap, isLoading: expenseLoading } = useQuery({
    queryKey: ['report-expense', startDate, endDate],
    queryFn: () => getExpenseSummary(startDate, endDate),
    staleTime: 10000,
  });
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
  const { data: costWrap, isLoading: costLoading } = useQuery({
    queryKey: ['report-cost-detail', startDate, endDate],
    queryFn: () => getCostDetail(startDate, endDate),
    staleTime: 10000,
  });

  const expenseRows: ExpenseSummaryRow[] = expenseWrap?.data?.data ?? [];
  const fuelRows: FuelDetailRow[] = fuelWrap?.data?.data ?? [];
  const incomeRows: IncomeSummaryRow[] = incomeWrap?.data?.data ?? [];
  const repairRows: RepairDetailRow[] = costWrap?.data?.data?.repair ?? [];
  const installmentRows: InstallmentDetailRow[] = costWrap?.data?.data?.installment ?? [];
  const insuranceRows: InsuranceDetailRow[] = costWrap?.data?.data?.insurance ?? [];
  const taxRows: TaxDetailRow[] = costWrap?.data?.data?.taxCompulsory ?? [];

  const vehicleOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    [...expenseRows, ...fuelRows, ...incomeRows].forEach((r) => {
      if (r.vehicleId && !map.has(r.vehicleId)) map.set(r.vehicleId, r.licensePlate);
    });
    return Array.from(map.entries()).map(([id, plate]) => ({ id, plate })).sort((a, b) => a.plate.localeCompare(b.plate, 'th'));
  }, [expenseRows, fuelRows, incomeRows]);

  const filteredExpense = vehicle === 'all' ? expenseRows : expenseRows.filter((r) => r.vehicleId === vehicle);
  const filteredFuel = vehicle === 'all' ? fuelRows : fuelRows.filter((r) => r.vehicleId === vehicle);
  const filteredIncome = vehicle === 'all' ? incomeRows : incomeRows.filter((r) => r.vehicleId === vehicle);
  const filteredRepair = vehicle === 'all' ? repairRows : repairRows.filter((r) => r.vehicleId === vehicle);
  const filteredInstallment = vehicle === 'all' ? installmentRows : installmentRows.filter((r) => r.vehicleId === vehicle);
  const filteredInsurance = vehicle === 'all' ? insuranceRows : insuranceRows.filter((r) => r.vehicleId === vehicle);
  const filteredTax = vehicle === 'all' ? taxRows : taxRows.filter((r) => r.vehicleId === vehicle);

  const sortedExpense = React.useMemo(() => sortRows(filteredExpense, expenseSort.key, expenseSort.dir), [filteredExpense, expenseSort]);
  const sortedFuel = React.useMemo(() => sortRows(filteredFuel, fuelSort.key, fuelSort.dir), [filteredFuel, fuelSort]);
  const sortedIncome = React.useMemo(() => sortRows(filteredIncome, incomeSort.key, incomeSort.dir), [filteredIncome, incomeSort]);
  const sortedRepair = React.useMemo(() => sortRows(filteredRepair, repairSort.key, repairSort.dir), [filteredRepair, repairSort]);
  const sortedInstallment = React.useMemo(() => sortRows(filteredInstallment, installmentSort.key, installmentSort.dir), [filteredInstallment, installmentSort]);
  const sortedInsurance = React.useMemo(() => sortRows(filteredInsurance, insuranceSort.key, insuranceSort.dir), [filteredInsurance, insuranceSort]);
  const sortedTax = React.useMemo(() => sortRows(filteredTax, taxSort.key, taxSort.dir), [filteredTax, taxSort]);

  const handleExpenseSort = (key: keyof ExpenseSummaryRow): void =>
    setExpenseSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleFuelSort = (key: keyof FuelDetailRow): void =>
    setFuelSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleIncomeSort = (key: keyof IncomeSummaryRow): void =>
    setIncomeSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleRepairSort = (key: keyof RepairDetailRow): void =>
    setRepairSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleInstallmentSort = (key: keyof InstallmentDetailRow): void =>
    setInstallmentSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleInsuranceSort = (key: keyof InsuranceDetailRow): void =>
    setInsuranceSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));
  const handleTaxSort = (key: keyof TaxDetailRow): void =>
    setTaxSort((p) => ({ key, dir: p.key === key && p.dir === 'asc' ? 'desc' : 'asc' }));

  // ยอดรวมทุกหมวดดึงจาก expense endpoint แหล่งเดียว เพื่อให้ตัวเลขสอดคล้องกัน
  const totals = React.useMemo(() => {
    const t = {
      income: 0,
      fuel: 0,
      repair: 0,
      tax: 0,
      compulsory: 0,
      insurance: 0,
      installment: 0,
      totalCost: 0,
    };
    for (const r of filteredExpense) {
      t.income += r.income;
      t.fuel += r.fuelCost;
      t.repair += r.repairCost;
      t.tax += r.taxCost;
      t.compulsory += r.compulsoryCost;
      t.insurance += r.insuranceCost;
      t.installment += r.installmentCost;
      t.totalCost += r.totalCost;
    }
    return t;
  }, [filteredExpense]);

  const profit = totals.income - totals.totalCost;

  const exportActive = (): void => {
    const range = startDate && endDate ? `${dayjs(startDate).format('YYYYMMDD')}-${dayjs(endDate).format('YYYYMMDD')}` : 'all';
    const dump = <T,>(name: string, headers: { key: keyof T; label: string }[], rows: T[]): void =>
      downloadCsv(`report-${name}-${range}.csv`, headers, rows.map((r) => headers.map((h) => r[h.key] as string | number)));
    if (tab === 'expense') dump('expense', EXPENSE_HEADERS, sortedExpense);
    else if (tab === 'fuel') dump('fuel', FUEL_HEADERS, sortedFuel);
    else if (tab === 'income') dump('income', INCOME_HEADERS, sortedIncome);
    else if (tab === 'repair') dump('repair', REPAIR_HEADERS, sortedRepair);
    else if (tab === 'installment') dump('installment', INSTALLMENT_HEADERS, sortedInstallment);
    else if (tab === 'insurance') dump('insurance', INSURANCE_HEADERS, sortedInsurance);
    else dump('tax', TAX_HEADERS, sortedTax);
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
        <Grid xs={12} sm={6} md={3}><SummaryCard label="รายได้รวม" value={totals.income} color="success.main" /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="ค่าน้ำมัน" value={totals.fuel} /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="ค่าซ่อม" value={totals.repair} /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="ภาษี + พรบ." value={totals.tax + totals.compulsory} /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="ประกันภัย" value={totals.insurance} /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="ค่างวด" value={totals.installment} /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="ต้นทุนรวม" value={totals.totalCost} color="error.main" /></Grid>
        <Grid xs={12} sm={6} md={3}><SummaryCard label="กำไรสุทธิ" value={profit} color={profit < 0 ? 'error.main' : 'success.main'} /></Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v as TabKey)} sx={{ px: 2 }} variant="scrollable" scrollButtons="auto">
          <Tab label="ต้นทุน/กำไร" value="expense" />
          <Tab label="ค่าน้ำมัน (รายการ)" value="fuel" />
          <Tab label="ค่าซ่อม" value="repair" />
          <Tab label="ค่างวด" value="installment" />
          <Tab label="ประกันภัย" value="insurance" />
          <Tab label="ภาษี + พรบ." value="tax" />
          <Tab label="รายได้" value="income" />
        </Tabs>
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          {tab === 'expense' ? (
            <Table sx={{ minWidth: 1100 }}>
              <TableHead>
                <TableRow>
                  {EXPENSE_HEADERS.map((h) => (
                    <TableCell key={h.key} align={h.money ? 'right' : 'left'} sortDirection={expenseSort.key === h.key ? expenseSort.dir : false}>
                      <TableSortLabel
                        active={expenseSort.key === h.key}
                        direction={expenseSort.key === h.key ? expenseSort.dir : 'asc'}
                        onClick={() => handleExpenseSort(h.key)}
                      >
                        {h.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {!expenseLoading && sortedExpense.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={EXPENSE_HEADERS.length} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                      ไม่มีข้อมูลในช่วงวันที่ที่เลือก
                    </TableCell>
                  </TableRow>
                ) : null}
                {sortedExpense.map((r) => (
                  <TableRow hover key={r.id}>
                    {EXPENSE_HEADERS.map((h) => (
                      <TableCell
                        key={h.key}
                        align={h.money ? 'right' : 'left'}
                        sx={h.key === 'profit' ? { color: r.profit < 0 ? 'error.main' : 'success.main', fontWeight: 600 } : undefined}
                      >
                        {h.money ? numberFormat(r[h.key] as number) : String(r[h.key] ?? '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              {sortedExpense.length > 0 ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'text.primary' }}>รวม</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.income)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.fuel)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.repair)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.tax)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.compulsory)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.insurance)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.installment)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>{numberFormat(totals.totalCost)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: profit < 0 ? 'error.main' : 'success.main' }}>{numberFormat(profit)}</TableCell>
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          ) : tab === 'fuel' ? (
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
          ) : tab === 'income' ? (
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
          ) : tab === 'repair' ? (
            <DetailTable headers={REPAIR_HEADERS} rows={sortedRepair} sort={repairSort} onSort={handleRepairSort} loading={costLoading} minWidth={820} />
          ) : tab === 'installment' ? (
            <DetailTable headers={INSTALLMENT_HEADERS} rows={sortedInstallment} sort={installmentSort} onSort={handleInstallmentSort} loading={costLoading} minWidth={820} />
          ) : tab === 'insurance' ? (
            <DetailTable headers={INSURANCE_HEADERS} rows={sortedInsurance} sort={insuranceSort} onSort={handleInsuranceSort} loading={costLoading} minWidth={720} />
          ) : (
            <DetailTable headers={TAX_HEADERS} rows={sortedTax} sort={taxSort} onSort={handleTaxSort} loading={costLoading} minWidth={720} />
          )}
        </Box>
      </Card>
    </Stack>
  );
}
