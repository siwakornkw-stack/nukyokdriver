import * as React from 'react';
import type { Metadata } from 'next';

import PageVehicle from '@/components/dashboard/vehicle/PageVehicle';
import { config } from '@/config';

export const metadata = { title: `Vehicle | Dashboard | ${config.site.name}` } satisfies Metadata;


export default async function Page() {

  return <PageVehicle />
}