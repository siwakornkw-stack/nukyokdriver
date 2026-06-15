export type UploadImageVehicleDTO = {
  file: File[];
};

export type UploadImageVehicleResponse = {
  code: number;
  message: string;
  data: {
    url: string;
  };
}

export type CreateVehicleDTO = Omit<VehicleModel, 'id' | 'no' | 'img' | 'createdAt' | 'updatedAt'>;
export type UpdateVehicleDTO = Omit<VehicleModel, 'id' | 'img' | 'createdAt' | 'updatedAt'>;

export interface VehicleModel {
  id: string;
  no: number;
  licensePlatePrefix: string;
  licensePlateSuffix: string;
  licensePlateProvince: string;
  vehicleType: string;
  vehicleCharacteristic: string;
  brand: string;
  model: string;
  generation: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  engineBrand: string;
  fuelType: string;
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
  registrationDate: string;
  startDate: string;
  age: string;
  ownership: string;
  owner: string;
  department: string;
  driver: string;
  status: string;
  note: string;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum VehicleStatus {
  Active = 'active',
  Inactive = 'inactive',
  Maintenance = 'maintenance'
}

export enum FuelType {
  Gasoline = 'gasoline',
  Diesel = 'diesel',
  Electric = 'electric',
  Hybrid = 'hybrid'
}

export type Option = {
  id: string;
  name: string;
}

export type OptionResponse = {
  code: number;
  message: string;
  data: {
    vehicleType: Option[];
    vehicleBrand: Option[];
    fuelType: Option[];
    vehicleOwner: Option[];
    vehicleDepartment: Option[];
    vehicleDriver: Option[];
    vehicleStatus: Option[];
  }
}

export type OptionOneResponse = {
  code: number;
  message: string;
  data: Option[];
}

export type VehicleAllResponse = {
  code: number;
  message: string;
  data: VehicleModel[];
}

export type VehicleTaxResponse = {
  code: number;
  message: string;
  data: VehicleTaxData[];
}

export type CreateVehicleTaxDTO = Omit<VehicleTaxData, 'uuid'>;
export type UpdateVehicleTaxDTO = Omit<VehicleTaxData, 'uuid'>;

export type VehicleTaxData = {
  uuid: string;
  year: number;
  endDate: string;
  totalPremium: number;
  insuranceCompany: string;
  brokerName: string;
}

export type CreateCompulsoryMotorInsuranceVehicleDTO = Omit<CompulsoryMotorInsuranceVehicleData, 'uuid'>;
export type UpdateCompulsoryMotorInsuranceVehicleDTO = Omit<CompulsoryMotorInsuranceVehicleData, 'uuid'>;
export type CompulsoryMotorInsuranceVehicleResponse = {
  code: number;
  message: string;
  data: CompulsoryMotorInsuranceVehicleData[];
}
export type CompulsoryMotorInsuranceVehicleData = {
  uuid: string;
  year: number;
  endDate: string;
  totalPremium: number;
  insuranceCompany: string;
  brokerName: string;
}

export type CreateInsurancePolicyVehicleDTO = Omit<InsurancePolicyVehicleData, 'uuid'>;
export type UpdateInsurancePolicyVehicleDTO = Omit<InsurancePolicyVehicleData, 'uuid'>;
export type InsurancePolicyVehicleResponse = {
  code: number;
  message: string;
  data: InsurancePolicyVehicleData[];
}
export type InsurancePolicyVehicleData = {
  uuid: string;
  year: number;
  type: string;
  insuranceCompany: string;
  brokerName: string;
  startDate: string;
  endDate: string;
  totalPremium: number;
}

export type CreateAttachFileVehicleDTO = {
  files: FileWithNote[];
};
export type UpdateAttachFileVehicleDTO = Omit<AttachFileVehicleData, 'uuid' | 'url'>;
export type AttachFileVehicleResponse = {
  code: number;
  message: string;
  data: AttachFileVehicleData[];
}
export type AttachFileVehicleData = {
  uuid: string;
  fileName: string;
  description: string;
  url: string;
}
export interface FileWithNote extends File {
  note?: string;
}

export type CreateCarTiresDTO = Omit<CarTiresData, 'uuid'>;
export type UpdateCarTiresDTO = Omit<CarTiresData, 'uuid'>;
export type CarTiresResponse = {
  code: number;
  message: string;
  data: CarTiresData[];
}
export type CarTiresData = {
  uuid: string;
  brand: string;
  position: string;
  changeDate: string;
}

export type CreateAccidentVehicleDTO = Omit<AccidentVehicleData, 'uuid'>;
export type UpdateAccidentVehicleDTO = Omit<AccidentVehicleData, 'uuid'>;
export type AccidentVehicleResponse = {
  code: number;
  message: string;
  data: AccidentVehicleData[];
}
export type AccidentVehicleData = {
  uuid: string;
  date: string;
  time: string;
  party: string;
  licensePlate: string;
  driverName: string;
  opponent: string;
}

export type CreateRepairVehicleDTO = Omit<RepairVehicleData, 'uuid'>;
export type UpdateRepairVehicleDTO = Omit<RepairVehicleData, 'uuid'>;
export type RepairVehicleResponse = {
  code: number;
  message: string;
  data: RepairVehicleData[];
}
export type RepairVehicleData = {
  uuid: string;
  repairDate: string;
  licensePlate: string;
  repairShop: string;
  description?: string | null;
  receiveDate: string;
  insurancePay: number;
  companyPay: number;
}

export type CreateGasolineCostDTO = Omit<GasolineCostData, 'uuid'>;
export type UpdateGasolineCostDTO = Omit<GasolineCostData, 'uuid'>;
export type GasolineCostResponse = {
  code: number;
  message: string;
  data: GasolineCostData[];
}
export type GasolineCostData = {
  uuid: string;
  item: string;
  liters: number;
  amount: number;
  odometerStart: number;
  odometerEnd: number;
  dateTime: string;
}

export type CreateDrainTheOilVehicleDTO = Omit<DrainTheOilVehicleData, 'uuid'>;
export type UpdateDrainTheOilVehicleDTO = Omit<DrainTheOilVehicleData, 'uuid'>;
export type DrainTheOilVehicleResponse = {
  code: number;
  message: string;
  data: DrainTheOilVehicleData[];
}
export type DrainTheOilVehicleData = {
  uuid: string;
  date: string;
  textAlert: string;
}

export type CreateInstallmentsVehicleDTO = Omit<InstallmentsVehicleData, 'uuid'>;
export type UpdateInstallmentsVehicleDTO = Omit<InstallmentsVehicleData, 'uuid'>;
export type InstallmentsVehicleResponse = {
  code: number;
  message: string;
  data: InstallmentsVehicleData[];
}
export type InstallmentsVehicleData = {
  uuid: string;
  installmentNumber: number;
  dueDate: string;
  amount?: number;
  datePay?: string | null;
  status?: string;
  paymentEvidence?: string;
}

// สถานะการชำระค่างวด เป็นค่า derived จาก dueDate + datePay (ไม่ได้เก็บใน DB)
export type InstallmentPaymentStatus = 'paid' | 'due' | 'overdue';

export type CreateImageVehicleDTO = {
  files: FileWithImageVehicle[];
};
export type UpdateImageVehicleDTO = Omit<ImageVehicleData, 'uuid' | 'url'>;
export type ImageVehicleResponse = {
  code: number;
  message: string;
  data: ImageVehicleData[];
}
export type ImageVehicleData = {
  uuid: string;
  title: string;
  description: string;
  url: string;
  createdBy: string;
  updatedBy: string;
}
export interface FileWithImageVehicle extends File {
  note?: string;
}

export type CreateIncomeVehicleDTO = Omit<IncomeVehicleData, 'uuid'>;
export type UpdateIncomeVehicleDTO = Omit<IncomeVehicleData, 'uuid'>;
export type IncomeVehicleResponse = {
  code: number;
  message: string;
  data: IncomeVehicleData[];
}
export type IncomeVehicleData = {
  uuid: string;
  receiveDate: string;
  customerName: string;
  description: string;
  amount: number;
  dateTime: string;
  time: string;
  workOrderNumber: string;
  invoiceNumber: string;
  paymentStatusId: string;
  amountReceive: number;
  vehicleDriverId: string;
}

export type CreateTypeDTO = Omit<TypeData, 'uuid'>;
export type UpdateTypeDTO = Omit<TypeData, 'uuid'>;
export type TypeResponse = {
  code: number;
  message: string;
  data: TypeData[];  
}
export type TypeData = {
  uuid: string;
  name: string;
}

export type NotificationResponse = {
  code: number;
  message: string;
  data: NotificationData[];
}

export type NotificationData = {
  VehicleId: string;
  VehicleNo: string;
  Tax: string | null;
  CmInsurance: string | null;
  InsurancePolicy: string | null;
  RepairVehicle: string | null;
  DrainTheOilVehicle: string | null;
  InstallmentsVehicle: string | null;
}

export type ImportResponse<T> = {
  success: boolean;
  code: number;
  message: string;
  data?: ImportData<T>;
}

export type ImportData<T> = {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  items?: T[];
}

export type ImportItemsStatus = {
  no: number;
  licensePlate: string;
  text?: string;
  status: string;
  error: boolean;
}