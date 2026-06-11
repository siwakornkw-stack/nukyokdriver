import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import PageHelp from '@/components/dashboard/help/PageHelp';

export const metadata = { title: `วิธีใช้งาน | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <PageHelp />;
}
