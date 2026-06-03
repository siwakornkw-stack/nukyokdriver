import * as React from 'react';
import type { Metadata } from 'next';

import PageDriver from '@/components/dashboard/driver/PageDriver';
import { config } from '@/config';

export const metadata = { title: `จัดการคนขับ | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <PageDriver />;
}
