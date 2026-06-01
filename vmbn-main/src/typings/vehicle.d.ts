
export type CreateVehicleDTO = Omit<Vehicle, 'No' | 'Img' | 'CreatedAt' | 'UpdatedAt' | 'VehicleId' | 'TaxId'>;

export interface VehicleModelResponse {
  id: string;
  no: number;
  licensePlatePrefix: string;
  licensePlateSuffix: string;
  licensePlateProvince: string;
  vehicleType: string | null;
  vehicleCharacteristic: string;
  brand: string | null;
  model: string;
  generation: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  engineBrand: string;
  fuelType: string | null;
  tankSize: number;
  fuelConsumption: number;
  cylinderCount: number;
  cylinder: number;
  vehicleSize: string;
  cargoSize: string;
  gasSerialNumber: string;
  vehicleWeight: number;
  cargoWeight: number;
  wheelCount: number;
  seatCount: number;
  registrationDate: Date | null;
  startDate: Date | null;
  age: string;
  ownership: string;
  lineNotifyToken: string;
  owner: string;
  department: string;
  driver: string;
  status: string;
  note: string;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MulterFile extends Express.Multer.File {
  note?: string;
}
