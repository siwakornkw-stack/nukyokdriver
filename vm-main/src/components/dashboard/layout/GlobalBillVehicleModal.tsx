'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';

import { useShareContext } from '@/contexts/share-context';
import { paths } from '@/paths';
import { getVehicleAll } from '../../../../services/vehicle.service';
import { getResponseData } from '../../../../types/utils';

// Heavy modal — lazy-load so it never lands in the initial bundle of every page.
const VehicleInfoModal = dynamic(() => import('../vehicle/VehicleInfoModal'), { ssr: false });

// Mounts the vehicle-detail modal globally so the notification bell's "ดูเพิ่มเติม"
// can open a vehicle from ANY page. The vehicle page already mounts its own
// fully-wired modal, so this one stands down there to avoid a double-mount.
export function GlobalBillVehicleModal(): React.JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const { vehicle, setVehicle, openBillVehicleModal, setOpenBillVehicleModal, infoBillVehicleOpen, setInfoBillVehicleOpen } =
    useShareContext();

  const onVehiclePage = pathname === paths.dashboard.vehicle;

  // Preload the vehicle list into shared context so the bell can resolve a
  // VehicleId to a full record. On the vehicle page PageVehicle loads it itself.
  React.useEffect(() => {
    if (onVehiclePage || vehicle.length > 0) return;
    void (async () => {
      const res = await getVehicleAll();
      if (res.status === 200 && res.data) {
        const data = getResponseData(res);
        if (data) setVehicle(data.data);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (onVehiclePage) return null;
  if (!openBillVehicleModal || !infoBillVehicleOpen) return null;

  const handleClose = (): void => {
    setOpenBillVehicleModal(false);
    setInfoBillVehicleOpen(undefined);
  };

  return (
    <VehicleInfoModal
      open={openBillVehicleModal}
      onClose={handleClose}
      infoBillVehicle={infoBillVehicleOpen}
      // Editing lives on the vehicle page (with its full form wiring); send the
      // user there while keeping the selection so it reopens in context.
      onEdit={() => router.push(paths.dashboard.vehicle)}
      theme={theme}
    />
  );
}

export default GlobalBillVehicleModal;
