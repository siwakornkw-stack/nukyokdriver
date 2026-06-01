import * as React from 'react';
import type { Metadata } from 'next';
import { config } from '@/config';
import AdminList from '@/components/dashboard/settings/admin/AdminList';

export const metadata = { title: `Edit Vehicle | Dashboard | ${config.site.name}` } satisfies Metadata;


export default async function Page() {

  return <AdminList />
}