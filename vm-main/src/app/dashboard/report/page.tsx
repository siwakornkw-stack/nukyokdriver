import * as React from 'react';
import type { Metadata } from 'next';

import PageReport from '@/components/dashboard/report/PageReport';
import { config } from '@/config';

export const metadata = { title: `รายงานสรุป | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <PageReport />;
}
