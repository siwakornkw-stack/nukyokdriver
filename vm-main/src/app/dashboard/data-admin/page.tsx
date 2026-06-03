import * as React from 'react';
import type { Metadata } from 'next';

import PageDataAdmin from '@/components/dashboard/data-admin/PageDataAdmin';
import { config } from '@/config';

export const metadata = { title: `จัดการ/ลบข้อมูล | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <PageDataAdmin />;
}
