import * as React from 'react';
import type { Metadata } from 'next';

import PageDriverJobs from '@/components/dashboard/driver-jobs/PageDriverJobs';
import { config } from '@/config';

export const metadata = { title: `สั่งงานคนขับ | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <PageDriverJobs />;
}
