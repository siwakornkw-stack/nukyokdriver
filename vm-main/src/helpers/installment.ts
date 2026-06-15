import dayjs, { type Dayjs } from 'dayjs';

import type { InstallmentPaymentStatus } from '@/types/vehicle';

// สถานะการชำระ derived จาก dueDate + datePay (DB ไม่ได้เก็บสถานะนี้)
// paid = มี datePay / overdue = ยังไม่จ่าย & เลยกำหนด / due = ยังไม่จ่าย & ยังไม่ถึงกำหนด
export function getInstallmentStatus(dueDate: Dayjs | null, datePay: Dayjs | null): InstallmentPaymentStatus {
  if (datePay && datePay.isValid()) return 'paid';
  if (dueDate && dueDate.isValid() && dueDate.startOf('day').isBefore(dayjs().startOf('day'))) return 'overdue';
  return 'due';
}

export function daysOverdue(dueDate: Dayjs | null, datePay: Dayjs | null): number {
  if (datePay && datePay.isValid()) return 0;
  if (!dueDate || !dueDate.isValid()) return 0;
  const diff = dayjs().startOf('day').diff(dueDate.startOf('day'), 'day');
  return diff > 0 ? diff : 0;
}
