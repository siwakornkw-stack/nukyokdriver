import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'
import { Prisma } from '@prisma/client'
import type { Customer, Vehicle } from '@prisma/client'
import type { CreateVehicleDTO, VehicleModelResponse } from '../../typings/vehicle'
import { create } from 'node:domain'

export function getVehicleAll(TenantId:string, sortBy: string, sortOrder: string, limit?: number): Promise<VehicleModelResponse[]> {
  return db.vehicle.findMany({
    where: {
      AND: [
        {
          TenantId: TenantId,
        },
        {
          Status: 'active'
        }
      ],
    },
    orderBy: {
      [sortBy]: sortOrder
    },
    ...(limit ? { take: limit } : {}),
    include: {
      VehicleType: true,
      VehicleBrand: true,
      FuelType: true,
      VehicleStatus: true,
      VehicleOwner: true,
      VehicleDepartment: true,
      VehicleDriver: true,
    }
  }).then(vehicles => vehicles.map(v => ({
    id: v.VehicleId,
    no: v.No,
    licensePlatePrefix: v.LicensePlatePrefix,
    licensePlateSuffix: v.LicensePlateSuffix,
    licensePlateProvince: v.LicensePlateProvince,
    vehicleType: v.VehicleType?.Name || '',
    vehicleCharacteristic: v.VehicleCharacteristic,
    brand: v.VehicleBrand?.Name || '',
    model: v.Model,
    color: v.Color,
    generation: v.Generation,
    chassisNumber: v.ChassisNumber,
    engineNumber: v.EngineNumber,
    engineBrand: v.EngineBrand,
    fuelType: v.FuelType?.Name || '',
    tankSize: v.TankSize,
    fuelConsumption: v.FuelConsumption,
    cylinderCount: v.CylinderCount,
    cylinder: v.Cylinder,
    vehicleSize: v.VehicleSize,
    cargoSize: v.CargoSize,
    gasSerialNumber: v.GasSerialNumber,
    vehicleWeight: v.VehicleWeight,
    cargoWeight: v.CargoWeight,
    wheelCount: v.WheelCount,
    seatCount: v.SeatCount,
    registrationDate: v.RegistrationDate,
    startDate: v.StartDate,
    age: v.Age,
    ownership: v.Ownership,
    lineNotifyToken: v.LineNotifyToken || '',
    owner: v.VehicleOwner?.Name || '',
    department: v.VehicleDepartment?.Name || '',
    driver: v.VehicleDriver?.Name || '',
    status: v.VehicleStatus?.Name || '',
    note: v.Note || '',
    img: v.Img || '',
    createdAt: v.CreatedAt,
    updatedAt: v.UpdatedAt,
  })))
}

export function findVehicleById(VehicleId: Vehicle['VehicleId']) {
  return db.vehicle.findFirst({
    where: {
      VehicleId,
    },
  })
}

export function getVehicleAllWithRelation(TenantId:string) {
  return db.vehicle.findMany({
    where: {
      AND: [
        {
          TenantId: TenantId,
        },
      ],
    },
    include: {
      VehicleOwner: true,
      VehicleDepartment: true,
      VehicleDriver: true,
    }
  })
}

export function getVehicleAllWithRelationById(VehicleId: Vehicle['VehicleId']) {
  return db.vehicle.findFirst({
    where: {
      VehicleId,
    },
    include: {
      VehicleOwner: true,
      VehicleDepartment: true,
      VehicleDriver: true,
    }
  })
}

export function getAllVehicleType(TenantId:string) {
  return db.vehicleType.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      VehicleTypeId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}
export function addVehicleTypeService(data: Prisma.VehicleTypeCreateInput) {
  return db.vehicleType.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateVehicleTypeService(data: Prisma.VehicleTypeUpdateInput, VehicleTypeId: string) {
  return db.vehicleType.update({
    where: { VehicleTypeId: VehicleTypeId },
    data: data
  })
}
export function getAllFuelType(TenantId:string) {
  return db.fuelType.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      FuelTypeId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}
export function addFuelTypeService(data: Prisma.FuelTypeCreateInput) {
  return db.fuelType.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateFuelTypeService(data: Prisma.FuelTypeUpdateInput, FuelTypeId: string) {
  return db.fuelType.update({
    where: { FuelTypeId: FuelTypeId },
    data: data
  })
}
export function getAllVehicleBrand(TenantId:string) {
  return db.vehicleBrand.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      VehicleBrandId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}
export function addVehicleBrandService(data: Prisma.VehicleBrandCreateInput) {
  return db.vehicleBrand.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateVehicleBrandService(data: Prisma.VehicleBrandUpdateInput, VehicleBrandId: string) {
  return db.vehicleBrand.update({
    where: { VehicleBrandId: VehicleBrandId },
    data: data
  })
}
export function getAllVehicleStatus(TenantId:string) {
  return db.vehicleStatus.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      VehicleStatusId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}
export function addVehicleStatusService(data: Prisma.VehicleStatusCreateInput) {
  return db.vehicleStatus.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateVehicleStatusService(data: Prisma.VehicleStatusUpdateInput, VehicleStatusId: string) {
  return db.vehicleStatus.update({
    where: { VehicleStatusId: VehicleStatusId },
    data: data
  })
}
export function getAllVehicleOwner(TenantId:string) {
  return db.vehicleOwner.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      VehicleOwnerId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}
export function addVehicleOwnerService(data: Prisma.VehicleOwnerCreateInput) {
  return db.vehicleOwner.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateVehicleOwnerService(data: Prisma.VehicleOwnerUpdateInput, VehicleOwnerId: string) {
  return db.vehicleOwner.update({
    where: { VehicleOwnerId: VehicleOwnerId },
    data: data
  })
}
export function getAllVehicleDepartment(TenantId:string) {
  return db.vehicleDepartment.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      VehicleDepartmentId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}
export function addVehicleDepartmentService(data: Prisma.VehicleDepartmentCreateInput) {
  return db.vehicleDepartment.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateVehicleDepartmentService(data: Prisma.VehicleDepartmentUpdateInput, VehicleDepartmentId: string) {
  return db.vehicleDepartment.update({
    where: { VehicleDepartmentId: VehicleDepartmentId },
    data: data
  })
}
export function getAllVehicleDriver(TenantId:string) {
  return db.vehicleDriver.findMany({
    where: {
      TenantId: TenantId,
      Status: 'active'
    },
    select: {
      VehicleDriverId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}


export function getAllPaymentStatus(TenantId:string) {
  return db.paymentStatus.findMany({
    where: {
      TenantId: TenantId,
    },
    select: {
      PaymentStatusId: true,
      Name: true,
    },
    orderBy: {
      UpdatedAt: 'desc'
    }
  })
}

export function addVehicleDriverService(data: Prisma.VehicleDriverCreateInput) {
  return db.vehicleDriver.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}
export function updateVehicleDriverService(data: Prisma.VehicleDriverUpdateInput, VehicleDriverId: string) {
  return db.vehicleDriver.update({
    where: { VehicleDriverId: VehicleDriverId },
    data: data
  })
}
export function addVehicleService(data: Prisma.VehicleCreateInput) {
  console.log('addVehicleService');
  return db.vehicle.create({
    data: {
      ...data,
      Status: 'active'
    }
  })
}

export function updateVehicleService(data: Prisma.VehicleUpdateInput) {
  return db.vehicle.update({
    where: {
      VehicleId: data.VehicleId as string,
    },
    data: data
  })
}

export function getTaxByIdVehicleService(VehicleId: string) {
  return db.tax.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.TaxId,
    year: t.Year,
    endDate: t.EndDate,
    totalPremium: t.TotalPremium,
    insuranceCompany: t.InsuranceCompany,
    brokerName: t.BrokerName,
    file: t.File || '',
  })))
}

export function addVehicleTaxService(data: Prisma.TaxCreateInput) {
  return db.tax.create({
    data: data
  })
}

export function updateVehicleTaxService(data: Prisma.TaxUpdateInput, TaxId: string) {
  return db.tax.update({
    where: { TaxId: TaxId },
    data: data
  })
}

export function getCompulsoryMotorInsuranceByIdVehicleService(VehicleId: string) {
  return db.compulsoryMotorInsuranceVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.CompulsoryMotorInsuranceVehicleId,
    year: t.Year,
    endDate: t.EndDate,
    totalPremium: t.TotalPremium,
    insuranceCompany: t.InsuranceCompany,
    brokerName: t.BrokerName,
    file: t.File || '',
  })))
}
export function addCompulsoryMotorInsuranceVehicleService(data: Prisma.CompulsoryMotorInsuranceVehicleCreateInput) {
  return db.compulsoryMotorInsuranceVehicle.create({
    data: data
  })
}
export function updateCompulsoryMotorInsuranceVehicleService(data: Prisma.CompulsoryMotorInsuranceVehicleUpdateInput, CompulsoryMotorInsuranceVehicleId: string) {
  return db.compulsoryMotorInsuranceVehicle.update({
    where: { CompulsoryMotorInsuranceVehicleId: CompulsoryMotorInsuranceVehicleId },
    data: data
  })
}

export function getInsurancePolicyByIdVehicleService(VehicleId: string) {
  return db.insurancePolicyVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.InsurancePolicyVehicleId,
    status: t.Status,
    year: t.Year,
    type: t.Type,
    insuranceCompany: t.InsuranceCompany,
    brokerName: t.BrokerName,
    startDate: t.StartDate,
    endDate: t.EndDate,
    totalPremium: t.TotalPremium,
    policyFile: t.PolicyFile || '',
  })))
}
export function addInsurancePolicyVehicleService(data: Prisma.InsurancePolicyVehicleCreateInput) {
  return db.insurancePolicyVehicle.create({
    data: data
  })
}
export function updateInsurancePolicyVehicleService(data: Prisma.InsurancePolicyVehicleUpdateInput, InsurancePolicyVehicleId: string) {
  return db.insurancePolicyVehicle.update({
    where: { InsurancePolicyVehicleId: InsurancePolicyVehicleId },
    data: data
  })
}

export function getAttachFileByIdVehicleService(VehicleId: string) {
  return db.attachFileVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.AttachFileVehicleId,
    fileName: t.FileName,
    description: t.Description,
    url: t.Url,
  })))
}
export async function addAttachFileVehicleService(data: Prisma.AttachFileVehicleCreateManyInput[]) {
  try {
    const result = await db.attachFileVehicle.createMany({
      data: data
    });
    return result;
  } catch (error) {
    console.error('Error in addAttachFileVehicleService:', error);
    throw error;
  }
}
export function updateAttachFileVehicleService(data: Prisma.AttachFileVehicleUpdateInput, AttachFileVehicleId: string) {
  return db.attachFileVehicle.update({
    where: { AttachFileVehicleId: AttachFileVehicleId },
    data: data
  })
}

export function getCarTiresByIdVehicleService(VehicleId: string) {
  return db.carTires.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.CarTiresId,
    changeDate: t.ChangeDate,
    position: t.Position,
    brand: t.Brand,
  })))
}
export function addCarTiresService(data: Prisma.CarTiresCreateInput) {
  return db.carTires.create({
    data: data
  })
}
export function updateCarTiresService(data: Prisma.CarTiresUpdateInput, CarTiresId: string) {
  return db.carTires.update({
    where: { CarTiresId: CarTiresId },
    data: data
  })
}

export function getAccidentVehicleByIdVehicleService(VehicleId: string) {
  return db.accidentVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.AccidentVehicleId,
    status: t.Status,
    date: t.Date,
    time: t.Time,
    party: t.Party,
    licensePlate: t.LicensePlate,
    driverName: t.DriverName,
    opponent: t.Opponent,
  })))
}
export function addAccidentVehicleService(data: Prisma.AccidentVehicleCreateInput) {
  return db.accidentVehicle.create({
    data: data
  })
}
export function updateAccidentVehicleService(data: Prisma.AccidentVehicleUpdateInput, AccidentVehicleId: string) {
  return db.accidentVehicle.update({
    where: { AccidentVehicleId: AccidentVehicleId },
    data: data
  })
}

export function getRepairVehicleByIdVehicleService(VehicleId: string) {
  return db.repairVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.RepairVehicleId,
    status: t.Status,
    repairDate: t.RepairDate,
    licensePlate: t.LicensePlate,
    repairShop: t.RepairShop,
    receiveDate: t.ReceiveDate,
    insurancePay: t.InsurancePay,
    companyPay: t.CompanyPay,
  })))
}
export function addRepairVehicleService(data: Prisma.RepairVehicleCreateInput) {
  return db.repairVehicle.create({
    data: data
  })
}
export function updateRepairVehicleService(data: Prisma.RepairVehicleUpdateInput, RepairVehicleId: string) {
  return db.repairVehicle.update({
    where: { RepairVehicleId: RepairVehicleId },
    data: data
  })
}

export function getGasolineCostByIdVehicleService(VehicleId: string) {
  return db.gasolineCost.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.GasolineCostId,
    status: t.Status,
    item: t.Item,
    liters: t.Liters,
    amount: t.Amount,
    odometerStart: t.OdometerStart,
    odometerEnd: t.OdometerEnd,
  })))
}
export function addGasolineCostService(data: Prisma.GasolineCostCreateInput) {
  return db.gasolineCost.create({
    data: data
  })
}
export function updateGasolineCostService(data: Prisma.GasolineCostUpdateInput, GasolineCostId: string) {
  return db.gasolineCost.update({
    where: { GasolineCostId: GasolineCostId },
    data: data
  })
}

export function getDrainTheOilVehicleByIdVehicleService(VehicleId: string) {
  return db.drainTheOilVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.DrainTheOilVehicleId,
    status: t.Status,
    date: t.Date,
    textAlert: t.TextAlert,
  })))
}
export function addDrainTheOilVehicleService(data: Prisma.DrainTheOilVehicleCreateInput) {
  return db.drainTheOilVehicle.create({
    data: data
  })
}
export function updateDrainTheOilVehicleService(data: Prisma.DrainTheOilVehicleUpdateInput, DrainTheOilVehicleId: string) {
  return db.drainTheOilVehicle.update({
    where: { DrainTheOilVehicleId: DrainTheOilVehicleId },
    data: data
  })
}

export function getInstallmentsVehicleByIdVehicleService(VehicleId: string) {
  return db.installmentsVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(installments => installments.map(t => ({
    uuid: t.InstallmentsVehicleId,
    status: t.Status,
    installmentNumber: t.InstallmentNumber,
    dueDate: t.DueDate,
    amount: t.Amount,
    ...(t.DatePay && { datePay: t.DatePay }),
    paymentEvidence: t.PaymentEvidence,
  })))
}
export function addInstallmentsVehicleService(data: Prisma.InstallmentsVehicleCreateInput) {
  return db.installmentsVehicle.create({
    data: data
  })
}
export function updateInstallmentsVehicleService(data: Prisma.InstallmentsVehicleUpdateInput, InstallmentsVehicleId: string) {
  return db.installmentsVehicle.update({
    where: { InstallmentsVehicleId: InstallmentsVehicleId },
    data: data
  })
}

export function getImageVehicleByIdVehicleService(VehicleId: string) {
  return db.imageVehicle.findMany({
    where: { 
      VehicleId: VehicleId
    }
  }).then(taxes => taxes.map(t => ({
    uuid: t.ImageVehicleId,
    status: t.Status,
    url: t.Url,
    title: t.Title,
    description: t.Description,
    createdBy: t.CreatedByUsername,
    updatedBy: t.UpdatedByUsername,
  })))
}
export async function addImageVehicleService(data: Prisma.ImageVehicleCreateManyInput[]) {
  try {
    const result = await db.imageVehicle.createMany({
      data: data
    });
    return result;
  } catch (error) {
    console.error('Error in addImageVehicleService:', error);
    throw error;
  }
}
export function updateImageVehicleService(data: Prisma.ImageVehicleUpdateInput, ImageVehicleId: string) {
  return db.imageVehicle.update({
    where: { ImageVehicleId: ImageVehicleId },
    data: data
  })
}

export function getIncomeVehicleByIdVehicleService(VehicleId: string) {
  return db.incomeVehicle.findMany({
    where: { 
      VehicleId: VehicleId,
      Status: 'active'
    }
  }).then(incomes => incomes.map(t => ({
    uuid: t.IncomeVehicleId,
    receiveDate: t.ReceiveDate ? t.ReceiveDate.toISOString() : '',
    customerName: t.CustomerName || '',
    description: t.Description,
    dateTime: t.DateTime ? t.DateTime.toISOString() : '',
    time: t.Time || '',
    workOrderNumber: t.WorkOrderNumber || '',
    invoiceNumber: t.InvoiceNumber || '',
    paymentStatusId: t.PaymentStatusId || '',
    amountReceive: Number(t.AmountReceive) || 0,
    vehicleDriverId: t.VehicleDriverId || '',
  })))
}
export function addIncomeVehicleService(data: Prisma.IncomeVehicleCreateInput) {
  return db.incomeVehicle.create({
    data: data
  })
}
export function updateIncomeVehicleService(data: Prisma.IncomeVehicleUpdateInput, IncomeVehicleId: string) {
  return db.incomeVehicle.update({
    where: { IncomeVehicleId: IncomeVehicleId },
    data: data
  })
}

export function deleteIncomeVehicleService(IncomeVehicleId: string, UpdatedByUsername: string) {
  return db.incomeVehicle.update({
    where: { IncomeVehicleId: IncomeVehicleId },
    data: { Status: 'inactive', UpdatedAt: new Date(), UpdatedByUsername: UpdatedByUsername }
  })
}

export function addVehicleListService(data: Prisma.VehicleCreateManyInput[]) {
  console.log('addVehicleListService');
  return db.vehicle.createMany({
    data: data
  })
}

export function findVehicleByLicensePlate(TenantId: string, licensePlatePrefix: string, licensePlateSuffix: string, licensePlateProvince: string) {
  return db.vehicle.findFirst({
    where: {
      AND: [
        { TenantId },
        { LicensePlatePrefix: licensePlatePrefix },
        { LicensePlateSuffix: licensePlateSuffix },
        { LicensePlateProvince: licensePlateProvince }
      ]
    }
  })
}

export function addTaxListService(data: Prisma.TaxCreateManyInput[]) {
  console.log('addTaxListService');
  return db.tax.createMany({
    data: data
  })
}
export function addCompulsoryMotorInsuranceVehicleListService(data: Prisma.CompulsoryMotorInsuranceVehicleCreateManyInput[]) {
  console.log('addCompulsoryMotorInsuranceVehicleListService');
  return db.compulsoryMotorInsuranceVehicle.createMany({
    data: data
  })
}

export function addInsurancePolicyVehicleListService(data: Prisma.InsurancePolicyVehicleCreateManyInput[]) {
  console.log('addInsurancePolicyVehicleListService');
  return db.insurancePolicyVehicle.createMany({
    data: data
  })
}

export function addCarTiresListService(data: Prisma.CarTiresCreateManyInput[]) {
  return db.carTires.createMany({
    data: data
  })
}

export function addAccidentVehicleListService(data: Prisma.AccidentVehicleCreateManyInput[]) {
  return db.accidentVehicle.createMany({
    data: data
  })
}

export function addRepairVehicleListService(data: Prisma.RepairVehicleCreateManyInput[]) {
  return db.repairVehicle.createMany({
    data: data
  })
}

export function addGasolineCostListService(data: Prisma.GasolineCostCreateManyInput[]) {
  return db.gasolineCost.createMany({
    data: data
  })
}

export async function addDrainTheOilVehicleListService(drainOils: Prisma.DrainTheOilVehicleCreateManyInput[]) {
  return await db.drainTheOilVehicle.createMany({
    data: drainOils
  });
}

export async function addInstallmentsVehicleListService(installments: Prisma.InstallmentsVehicleCreateManyInput[]) {
  return await db.installmentsVehicle.createMany({
    data: installments
  });
}

export async function addIncomeVehicleListService(incomes: Prisma.IncomeVehicleCreateManyInput[]) {
  return await db.incomeVehicle.createMany({
    data: incomes
  });
}

export async function createInstallmentsForVehicle(
  vehicleId: string, 
  installmentPeriods: number, 
  installmentAmount: number, 
  username: string
) {
  if(installmentPeriods === 0 || installmentAmount === 0) return;

  const installments: Prisma.InstallmentsVehicleCreateManyInput[] = [];
  const currentDate = new Date();
  
  for (let i = 1; i <= installmentPeriods; i++) {
    const dueDate = new Date(currentDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    installments.push({
      Status: 'active',
      InstallmentNumber: i,
      DueDate: dueDate,
      Amount: new Prisma.Decimal(installmentAmount),
      DatePay: null,
      PaymentEvidence: '',
      VehicleId: vehicleId,
      CreatedByUsername: username,
      UpdatedByUsername: username
    });
  }
  
  return await db.installmentsVehicle.createMany({
    data: installments
  });
}

export async function deleteVehicleDataByType(type: string, id: string, tenantId: string, username: string) {
  try {
    switch (type) {
      case 'tax':
        return await db.tax.update({
          where: {
            TaxId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'compulsory-motor-insurance':
        return await db.compulsoryMotorInsuranceVehicle.update({
          where: {
            CompulsoryMotorInsuranceVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'insurance-policy':
        return await db.insurancePolicyVehicle.update({
          where: {
            InsurancePolicyVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'attach-file':
        return await db.attachFileVehicle.update({
          where: {
            AttachFileVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'car-tires':
        return await db.carTires.update({
          where: {
            CarTiresId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'accident-vehicle':
        return await db.accidentVehicle.update({
          where: {
            AccidentVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'repair-vehicle':
        return await db.repairVehicle.update({
          where: {
            RepairVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'gasoline-cost':
        return await db.gasolineCost.update({
          where: {
            GasolineCostId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'drain-oil':
        return await db.drainTheOilVehicle.update({
          where: {
            DrainTheOilVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'installments':
        return await db.installmentsVehicle.update({
          where: {
            InstallmentsVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'income':
        return await db.incomeVehicle.update({
          where: {
            IncomeVehicleId: id,
            Vehicle: {
              TenantId: tenantId
            }
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      default:
        throw new Error('ประเภทข้อมูลไม่ถูกต้อง')
    }
  } catch (error) {
    console.error('Error deleting vehicle data:', error)
    return null
  }
}

export async function deleteVehicleService(vehicleId: string, tenantId: string, username: string) {
  try {
    return await db.vehicle.update({
      where: {
        VehicleId: vehicleId,
        TenantId: tenantId
      },
      data: {
        Status: 'delete',
        UpdatedAt: new Date(),
        UpdatedByUsername: username
      }
    })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return null
  }
}

export async function deleteTypeDataByType(type: string, id: string, tenantId: string, username: string) {
  try {
    switch (type) {
      case 'vehicle-type':
        return await db.vehicleType.update({
          where: {
            VehicleTypeId: id,
            TenantId: tenantId
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'vehicle-brand':
        return await db.vehicleBrand.update({
          where: {
            VehicleBrandId: id,
            TenantId: tenantId
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'fuel-type':
        return await db.fuelType.update({
          where: {
            FuelTypeId: id,
            TenantId: tenantId
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'vehicle-owner':
        return await db.vehicleOwner.update({
          where: {
            VehicleOwnerId: id,
            TenantId: tenantId
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'vehicle-department':
        return await db.vehicleDepartment.update({
          where: {
            VehicleDepartmentId: id,
            TenantId: tenantId
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      case 'vehicle-driver':
        return await db.vehicleDriver.update({
          where: {
            VehicleDriverId: id,
            TenantId: tenantId
          },
          data: {
            Status: 'delete',
            UpdatedAt: new Date(),
            UpdatedByUsername: username
          }
        })

      default:
        throw new Error('ประเภทข้อมูลไม่ถูกต้อง')
    }
  } catch (error) {
    console.error('Error deleting master data:', error)
    return null
  }
}
