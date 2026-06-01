
import * as React from 'react';
import type { Metadata } from 'next';
import PageOverview from '@/components/dashboard/overview/PageOverview';
import { config } from '@/config';
import '../../../public/styles/datepicker.scss';

export const metadata = { title: `แดชบอร์ด | ${config.site.name}` } satisfies Metadata;


export default function Page(): React.JSX.Element {
  return (
    <PageOverview />
  );
}
