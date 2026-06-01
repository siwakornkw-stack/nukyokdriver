'use client';

import { SweetAlertHandle } from '@/components/SweetAlert';
import { VehicleModel } from '@/types/vehicle';

import React, { createContext, useContext, useRef, useState } from 'react';

interface ShareContextInterface {
	swalRef: React.RefObject<SweetAlertHandle>;
	vehicle: VehicleModel[];
	setVehicle: React.Dispatch<React.SetStateAction<VehicleModel[]>>;
	openBillVehicleModal: boolean;
	setOpenBillVehicleModal: React.Dispatch<React.SetStateAction<boolean>>;
	infoBillVehicleOpen: VehicleModel | undefined;
	setInfoBillVehicleOpen: React.Dispatch<React.SetStateAction<VehicleModel | undefined>>;
}

const ShareContext = createContext<ShareContextInterface | null>(null);

interface ShareWrapperProps {
	children: React.ReactNode;
}

export function ShareWrapper({ children }: ShareWrapperProps) {
	const swalRef = useRef<SweetAlertHandle>(null);	  
	const [vehicle, setVehicle] = useState<VehicleModel[]>([]);
	const [openBillVehicleModal, setOpenBillVehicleModal] = useState<boolean>(false);
	const [infoBillVehicleOpen, setInfoBillVehicleOpen] = useState<VehicleModel | undefined>(undefined);

	return (
		<ShareContext.Provider value={{
			swalRef,
			vehicle,
			setVehicle,
			openBillVehicleModal,
			setOpenBillVehicleModal,
			infoBillVehicleOpen,
			setInfoBillVehicleOpen
		}}>
			{children}
		</ShareContext.Provider>
	);
}

export function useShareContext() {
	return useContext(ShareContext)!;
}

export default ShareContext;
