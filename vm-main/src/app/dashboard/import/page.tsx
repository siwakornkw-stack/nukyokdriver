import * as React from 'react';
import type { Metadata } from 'next';

import PageImport from '@/components/dashboard/import/PageImport';
import { config } from '@/config';

export const metadata = { title: `นำเข้าข้อมูล | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <PageImport />;
}
