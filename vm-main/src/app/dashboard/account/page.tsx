import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import PageAccount from '@/components/dashboard/account/PageAccount';

export const metadata = { title: `บัญชี | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <PageAccount />
  );
}
