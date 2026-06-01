import * as React from 'react';
import type { Metadata } from 'next';
import { config } from '@/config';
import EditPageVehicle from '@/components/dashboard/vehicle/EditPageVehicle';

export const metadata = { title: `Edit Vehicle | Dashboard | ${config.site.name}` } satisfies Metadata;


export default async function Page() {

  return <EditPageVehicle />
}