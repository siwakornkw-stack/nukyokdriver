export interface BillVehicle {
  id: string;  
  vehicleDetails: VehicleDetails;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDetails {
  color: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  img: string;
}