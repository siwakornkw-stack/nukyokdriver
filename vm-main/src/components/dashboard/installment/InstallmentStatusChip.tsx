import * as React from 'react';
import Chip from '@mui/material/Chip';

import type { InstallmentPaymentStatus } from '@/types/vehicle';

const config: Record<InstallmentPaymentStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  paid: { label: 'ชำระแล้ว', color: 'success' },
  due: { label: 'รอชำระ', color: 'warning' },
  overdue: { label: 'เกินกำหนด', color: 'error' },
};

export function InstallmentStatusChip({ status }: { status: InstallmentPaymentStatus }): React.JSX.Element {
  const c = config[status];
  return <Chip size="small" label={c.label} color={c.color} variant="filled" sx={{ fontWeight: 700 }} />;
}
