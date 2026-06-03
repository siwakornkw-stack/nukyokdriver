import { Response, Request, NextFunction, response } from 'express'
import { IGetUserAuthInfoRequest } from "../../typings/express"
import { ParsedToken } from '../../typings/token'
import * as vehicleServices from './vehicle.services'
import { Vehicle } from '@prisma/client'
import { CreateVehicleDTO, MulterFile } from '../../typings/vehicle'
import { Prisma } from '@prisma/client'
import multer from 'multer'
import { getCompulsoryMotorInsuranceExpiringIn7Days, getDrainTheOilVehicleExpiringIn7Days, getExpiredCompulsoryMotorInsurance, getExpiredDrainTheOilVehicle, getExpiredInstallmentsVehicle, getExpiredInsurancePolicy, getExpiredRepairVehicle, getExpiredTax, getInstallmentsVehicleExpiringIn7Days, getInsurancePolicyExpiringIn7Days, getRepairVehicleExpiringIn7Days, getTaxExpiringIn7Days } from './expired'
import { readCSVFile } from '../../utils/readCSVFile'
import { findVehicleByLicensePlate } from './vehicle.services'
import { db } from '../../utils/db.server'

export async function getVehicleAll(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const sortBy = String(req.query.sortBy || 'UpdatedAt')
    const sortOrder = String(req.query.sortOrder || 'desc')
    const limit = Number(req.query.limit || undefined)

    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const response = await vehicleServices.getVehicleAll(parsedToken.tenantId, sortBy, sortOrder, limit);

    if (!response) {
      res.status(404)
      throw new Error('User not found.')
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    res.status(statusCode).json({
      success: false,
      code: statusCode,
      message: error.message
    });
  }
}

export async function getAllOptionVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('getAllOptionVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const data: any = {}
    const resVehicleType = await vehicleServices.getAllVehicleType(parsedToken.tenantId);
    const resVehicleBrand = await vehicleServices.getAllVehicleBrand(parsedToken.tenantId);
    const resVehicleStatus = await vehicleServices.getAllVehicleStatus(parsedToken.tenantId);
    const resVehicleOwner = await vehicleServices.getAllVehicleOwner(parsedToken.tenantId);
    const resVehicleDepartment = await vehicleServices.getAllVehicleDepartment(parsedToken.tenantId);
    const resVehicleDriver = await vehicleServices.getAllVehicleDriver(parsedToken.tenantId);
    const resFuelType = await vehicleServices.getAllFuelType(parsedToken.tenantId);
    if (resVehicleType) data.vehicleType = resVehicleType.map((item: any) => ({
      id: item.VehicleTypeId,
      name: item.Name
    }))
    if (resVehicleBrand) data.vehicleBrand = resVehicleBrand.map((item: any) => ({
      id: item.VehicleBrandId,
      name: item.Name
    }))
    if (resVehicleStatus) data.vehicleStatus = resVehicleStatus.map((item: any) => ({
      id: item.VehicleStatusId,
      name: item.Name
    }))
    if (resVehicleOwner) data.vehicleOwner = resVehicleOwner.map((item: any) => ({
      id: item.VehicleOwnerId,
      name: item.Name
    }))
    if (resVehicleDepartment) data.vehicleDepartment = resVehicleDepartment.map((item: any) => ({
      id: item.VehicleDepartmentId,
      name: item.Name
    }))
    if (resVehicleDriver) data.vehicleDriver = resVehicleDriver.map((item: any) => ({
      id: item.VehicleDriverId,
      name: item.Name
    }))
    if (resFuelType) data.fuelType = resFuelType.map((item: any) => ({
      id: item.FuelTypeId,
      name: item.Name
    }))
    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: data
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getOptionDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('getOptionDriver');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleDriver(parsedToken.tenantId);

    let vehicleDriver: any[] = []

    if (response) vehicleDriver = response.map((item: any) => ({
      id: item.VehicleDriverId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: vehicleDriver
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}


export async function getOptionPaymentStatus(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('getOptionPaymentStatus');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllPaymentStatus(parsedToken.tenantId);

    let paymentStatus: any[] = []

    if (response) paymentStatus = response.map((item: any) => ({
      id: item.PaymentStatusId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: paymentStatus
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function addVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleCreateInput = {
      Img: data.img,
      LicensePlatePrefix: data.licensePlatePrefix,
      LicensePlateSuffix: data.licensePlateSuffix,
      LicensePlateProvince: data.licensePlateProvince,
      ...(data.vehicleType ? {
        VehicleType: {
          connect: { VehicleTypeId: data.vehicleType }
        }
      } : {}),
      VehicleCharacteristic: data.vehicleCharacteristic,
      ...(data.brand ? {
        VehicleBrand: {
          connect: { VehicleBrandId: data.brand }
        }
      } : {}),
      Model: data.model,
      Generation: data.generation,
      Color: data.color,
      ChassisNumber: data.chassisNumber,
      EngineNumber: data.engineNumber,
      EngineBrand: data.engineBrand,
      ...(data.fuelType ? {
        FuelType: {
          connect: { FuelTypeId: data.fuelType }
        }
      } : {}),
      TankSize: data.tankSize,
      FuelConsumption: data.fuelConsumption,
      CylinderCount: data.cylinderCount,
      Cylinder: data.cylinder,
      VehicleSize: data.vehicleSize,
      CargoSize: data.cargoSize,
      GasSerialNumber: data.gasSerialNumber,
      VehicleWeight: data.vehicleWeight,
      CargoWeight: data.cargoWeight,
      WheelCount: data.wheelCount,
      SeatCount: data.seatCount,
      RegistrationDate: new Date(data.registrationDate),
      StartDate: new Date(data.startDate),
      Age: String(data.age),
      Ownership: data.ownership,
      LineNotifyToken: data.lineNotifyToken,
      ...(data.owner ? {
        VehicleOwner: {
          connect: { VehicleOwnerId: data.owner }
        }
      } : {}),
      ...(data.department ? {
        VehicleDepartment: {
          connect: { VehicleDepartmentId: data.department }
        }
      } : {}),
      ...(data.driver ? {
        VehicleDriver: {
          connect: { VehicleDriverId: data.driver }
        }
      } : {}),
      ...(data.status ? {
        VehicleStatus: {
          connect: { VehicleStatusId: data.status }
        }
      } : {}),
      InstallmentPeriods: data.installmentPeriods ? Number(data.installmentPeriods) : null,
      InstallmentAmount: data.installmentAmount ? new Prisma.Decimal(data.installmentAmount) : null,
      Note: data.note,
      Tenant: {
        connect: { TenantId: parsedToken.tenantId }
      }
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleService(payload)
    console.log('Service response:', response);

    if (!response) throw new Error('Failed to add vehicle')

    // สร้างข้อมูล InstallmentsVehicle อัตโนมัติถ้ามีข้อมูล installmentPeriods และ installmentAmount
    if (data.installmentPeriods && data.installmentAmount) {
      try {
        // ตรวจสอบว่ามีข้อมูล InstallmentsVehicle อยู่แล้วหรือไม่
        const existingInstallments = await db.installmentsVehicle.findFirst({
          where: { VehicleId: response.VehicleId }
        });
        
        if (!existingInstallments) {
          await vehicleServices.createInstallmentsForVehicle(
            response.VehicleId,
            Number(data.installmentPeriods),
            Number(data.installmentAmount),
            parsedToken.username
          );
          console.log('Created installments for vehicle:', response.VehicleId);
        } else {
          console.log('Installments already exist for vehicle:', response.VehicleId);
        }
      } catch (installmentError) {
        console.error('Error creating installments:', installmentError);
        // ไม่ throw error เพราะการสร้าง vehicle สำเร็จแล้ว
      }
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}


export async function updateVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.VehicleUpdateInput = {
      VehicleId: id,
      Img: data.img,
      LicensePlatePrefix: data.licensePlatePrefix,
      LicensePlateSuffix: data.licensePlateSuffix,
      LicensePlateProvince: data.licensePlateProvince,
      ...(data.vehicleType ? {
        VehicleType: {
          connect: { VehicleTypeId: data.vehicleType }
        }
      } : {}),
      VehicleCharacteristic: data.vehicleCharacteristic,
      ...(data.brand ? {
        VehicleBrand: {
          connect: { VehicleBrandId: data.brand }
        }
      } : {}),
      Model: data.model,
      Generation: data.generation,
      Color: data.color,
      ChassisNumber: data.chassisNumber,
      EngineNumber: data.engineNumber,
      EngineBrand: data.engineBrand,
      ...(data.fuelType ? {
        FuelType: {
          connect: { FuelTypeId: data.fuelType }
        }
      } : {}),
      TankSize: data.tankSize,
      FuelConsumption: data.fuelConsumption,
      CylinderCount: data.cylinderCount,
      Cylinder: data.cylinder,
      VehicleSize: data.vehicleSize,
      CargoSize: data.cargoSize,
      GasSerialNumber: data.gasSerialNumber,
      VehicleWeight: data.vehicleWeight,
      CargoWeight: data.cargoWeight,
      WheelCount: data.wheelCount,
      SeatCount: data.seatCount,
      RegistrationDate: new Date(data.registrationDate),
      StartDate: new Date(data.startDate),
      Age: String(data.age),
      Ownership: data.ownership,
      LineNotifyToken: data.lineNotifyToken,
      ...(data.owner ? {
        VehicleOwner: {
          connect: { VehicleOwnerId: data.owner }
        }
      } : {}),
      ...(data.department ? {
        VehicleDepartment: {
          connect: { VehicleDepartmentId: data.department }
        }
      } : {}),
      ...(data.driver ? {
        VehicleDriver: {
          connect: { VehicleDriverId: data.driver }
        }
      } : {}),
      ...(data.status ? {
        VehicleStatus: {
          connect: { VehicleStatusId: data.status }
        }
      } : {}),
      InstallmentPeriods: data.installmentPeriods ? Number(data.installmentPeriods) : null,
      InstallmentAmount: data.installmentAmount ? new Prisma.Decimal(data.installmentAmount) : null,
      Note: data.note,
      Tenant: {
        connect: { TenantId: parsedToken.tenantId }
      },
      UpdatedAt: new Date()
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleService(payload)
    console.log('Service response:', response);

    if (!response) throw new Error('Failed to update vehicle')

    // สร้างข้อมูล InstallmentsVehicle อัตโนมัติถ้ามีข้อมูล installmentPeriods และ installmentAmount
    if (data.installmentPeriods && data.installmentAmount) {
      try {
        // ลบข้อมูล InstallmentsVehicle เดิมก่อน
        await db.installmentsVehicle.deleteMany({
          where: { VehicleId: id }
        });
        
        // สร้างข้อมูล InstallmentsVehicle ใหม่
        await vehicleServices.createInstallmentsForVehicle(
          id,
          Number(data.installmentPeriods),
          Number(data.installmentAmount),
          parsedToken.username
        );
        console.log('Updated installments for vehicle:', id);
      } catch (installmentError) {
        console.error('Error updating installments:', installmentError);
        // ไม่ throw error เพราะการอัปเดต vehicle สำเร็จแล้ว
      }
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getTaxByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getTaxByIdVehicleService(id)

    if (!response) throw new Error('Failed to get tax by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function uploadImageVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start uploadImageVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const file = req.file as MulterFile;

    if (!file) {
      throw new Error('ไม่พบไฟล์ที่อัพโหลด')
    }

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {
        url: `/uploads/vehicle/${file.filename}`
      }
    })
  } catch (error: any) {
    console.error('Error in uploadImageVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function addVehicleTax(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleTax');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.TaxCreateInput = {
      Status: 'active',
      Year: data.year,
      EndDate: new Date(data.endDate),
      TotalPremium: data.totalPremium,
      InsuranceCompany: data.insuranceCompany,
      BrokerName: data.brokerName,
      File: data.file,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleTaxService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function updateVehicleTax(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleTax');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleTax id is required')

    const data = req.body
    const payload: Prisma.TaxUpdateInput = {
      Year: data.year,
      EndDate: new Date(data.endDate),
      TotalPremium: data.totalPremium,
      InsuranceCompany: data.insuranceCompany,
      BrokerName: data.brokerName,
      File: data.file,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleTaxService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleTax:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getCompulsoryMotorInsuranceByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getCompulsoryMotorInsuranceByIdVehicleService(id)

    if (!response) throw new Error('Failed to get compulsory motor insurance by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addCompulsoryMotorInsuranceVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addCompulsoryMotorInsuranceVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.CompulsoryMotorInsuranceVehicleCreateInput = {
      Status: 'active',
      Year: data.year,
      EndDate: new Date(data.endDate),
      TotalPremium: data.totalPremium,
      InsuranceCompany: data.insuranceCompany,
      BrokerName: data.brokerName,
      File: data.file,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addCompulsoryMotorInsuranceVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateCompulsoryMotorInsuranceVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateCompulsoryMotorInsuranceVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleTax id is required')

    const data = req.body
    const payload: Prisma.CompulsoryMotorInsuranceVehicleUpdateInput = {
      Year: data.year,
      EndDate: new Date(data.endDate),
      TotalPremium: data.totalPremium,
      InsuranceCompany: data.insuranceCompany,
      BrokerName: data.brokerName,
      File: data.file,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateCompulsoryMotorInsuranceVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleTax:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getInsurancePolicyByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getInsurancePolicyByIdVehicleService(id)

    if (!response) throw new Error('Failed to get insurance policy by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addInsurancePolicyVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addInsurancePolicyVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.InsurancePolicyVehicleCreateInput = {
      Status: 'active',
      Year: data.year,
      Type: data.type,
      InsuranceCompany: data.insuranceCompany,
      BrokerName: data.brokerName,
      StartDate: new Date(data.startDate),
      EndDate: new Date(data.endDate),
      TotalPremium: data.totalPremium,
      PolicyFile: data.policyFile,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addInsurancePolicyVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addInsurancePolicyVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateInsurancePolicyVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateInsurancePolicyVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('InsurancePolicyVehicle id is required')

    const data = req.body
    const payload: Prisma.InsurancePolicyVehicleUpdateInput = {
      Year: data.year,
      Type: data.type,
      InsuranceCompany: data.insuranceCompany,
      BrokerName: data.brokerName,
      StartDate: new Date(data.startDate),
      EndDate: new Date(data.endDate),
      TotalPremium: data.totalPremium,
      PolicyFile: data.policyFile,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateInsurancePolicyVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateInsurancePolicyVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getAttachFileByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getAttachFileByIdVehicleService(id)

    if (!response) throw new Error('Failed to get attach file by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addAttachFileVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addAttachFileVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const files = req.files as MulterFile[];
    if (!files || files.length === 0) {
      throw new Error('ไม่พบไฟล์ที่อัพโหลด')
    }
    const notes = Array.isArray(req.body.notes) ? req.body.notes : [req.body.notes];

    const payloads = files.map((file, index) => ({
      Status: 'active',
      FileName: file.originalname,
      Description: notes[index] || '',
      Url: `/uploads/vehicle-attachments/${file.filename}`,
      VehicleId: id,
      CreatedByUsername: parsedToken.username
    }));
    console.log('Sending payload:', payloads);
    const response = await vehicleServices.addAttachFileVehicleService(payloads);
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addAttachFileVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateAttachFileVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateAttachFileVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('AttachFileVehicle id is required')

    const data = req.body
    const payload: Prisma.AttachFileVehicleUpdateInput = {
      FileName: data.fileName,
      Description: data.description,
      Url: data.url,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateAttachFileVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateAttachFileVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}



export async function getCarTiresByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getCarTiresByIdVehicleService(id)

    if (!response) throw new Error('Failed to get car tires by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addCarTires(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addCarTires');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.CarTiresCreateInput = {
      Status: 'active',
      ChangeDate: new Date(data.changeDate),
      Position: data.position,
      Brand: data.brand,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addCarTiresService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addCarTires:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateCarTires(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateCarTires');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('CarTires id is required')

    const data = req.body
    const payload: Prisma.CarTiresUpdateInput = {
      ChangeDate: new Date(data.changeDate),
      Position: data.position,
      Brand: data.brand,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateCarTiresService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateCarTires:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getAccidentVehicleByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getAccidentVehicleByIdVehicleService(id)

    if (!response) throw new Error('Failed to get accident vehicle by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addAccidentVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addAccidentVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body

    const payload: Prisma.AccidentVehicleCreateInput = {
      Status: 'active',
      Date: new Date(data.date),
      Time: data.time,
      Party: data.party,
      LicensePlate: data.licensePlate,
      DriverName: data.driverName,
      Opponent: data.opponent,
      Files: data.files,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addAccidentVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addAccidentVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateAccidentVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateAccidentVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('AccidentVehicle id is required')

    const data = req.body

    const payload: Prisma.AccidentVehicleUpdateInput = {
      Date: new Date(data.date),
      Time: data.time,
      Party: data.party,
      LicensePlate: data.licensePlate,
      DriverName: data.driverName,
      Opponent: data.opponent,
      Files: data.files,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateAccidentVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateAccidentVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getRepairVehicleByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getRepairVehicleByIdVehicleService(id)

    if (!response) throw new Error('Failed to get repair vehicle by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addRepairVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addRepairVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.RepairVehicleCreateInput = {
      Status: 'active',
      RepairDate: new Date(data.repairDate),
      LicensePlate: data.licensePlate,
      RepairShop: data.repairShop,
      ReceiveDate: new Date(data.receiveDate),
      InsurancePay: data.insurancePay,
      CompanyPay: data.companyPay,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addRepairVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addRepairVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateRepairVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateRepairVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('RepairVehicle id is required')

    const data = req.body
    const payload: Prisma.RepairVehicleUpdateInput = {
      RepairDate: new Date(data.repairDate),
      LicensePlate: data.licensePlate,
      RepairShop: data.repairShop,
      ReceiveDate: new Date(data.receiveDate),
      InsurancePay: data.insurancePay,
      CompanyPay: data.companyPay,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateRepairVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateRepairVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getGasolineCostByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getGasolineCostByIdVehicleService(id)

    if (!response) throw new Error('Failed to get gasoline cost by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addGasolineCost(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addGasolineCost');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.GasolineCostCreateInput = {
      Status: 'active',
      Item: data.item,
      Liters: data.liters,
      Amount: data.amount,
      OdometerStart: data.odometerStart,
      OdometerEnd: data.odometerEnd,
      DateTime: new Date(data.dateTime),
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addGasolineCostService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addGasolineCost:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateGasolineCost(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateGasolineCost');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('GasolineCost id is required')

    const data = req.body
    const payload: Prisma.GasolineCostUpdateInput = {
      Item: data.item,
      Liters: data.liters,
      Amount: data.amount,
      OdometerStart: data.odometerStart,
      OdometerEnd: data.odometerEnd,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username,
      DateTime: new Date(data.dateTime),
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateGasolineCostService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateGasolineCost:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getDrainTheOilVehicleByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getDrainTheOilVehicleByIdVehicleService(id)

    if (!response) throw new Error('Failed to get drain the oil vehicle by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addDrainTheOilVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addDrainTheOilVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.DrainTheOilVehicleCreateInput = {
      Status: 'active',
      Date: new Date(data.date),
      DueDate: data.dueDate ? new Date(data.dueDate) : null,
      Odometer: data.odometer ? Number(data.odometer) : 0,
      TextAlert: data.textAlert,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addDrainTheOilVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addDrainTheOilVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateDrainTheOilVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateDrainTheOilVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('DrainTheOilVehicle id is required')

    const data = req.body
    const payload: Prisma.DrainTheOilVehicleUpdateInput = {
      Date: new Date(data.date),
      DueDate: data.dueDate ? new Date(data.dueDate) : null,
      Odometer: data.odometer ? Number(data.odometer) : 0,
      TextAlert: data.textAlert,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateDrainTheOilVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateDrainTheOilVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getInstallmentsVehicleByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getInstallmentsVehicleByIdVehicleService(id)

    if (!response) throw new Error('Failed to get installments vehicle by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addInstallmentsVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addInstallmentsVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.InstallmentsVehicleCreateInput = {
      Status: 'active',
      InstallmentNumber: data.installmentNumber,
      DueDate: new Date(data.dueDate),
      Amount: data.amount ? new Prisma.Decimal(data.amount) : new Prisma.Decimal(0),
      PaymentEvidence: data.paymentEvidence || null,
      DatePay: data.datePay ? new Date(data.datePay) : null,
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addInstallmentsVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addInstallmentsVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateInstallmentsVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateInstallmentsVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('InstallmentsVehicle id is required')

    const data = req.body
    const payload: Prisma.InstallmentsVehicleUpdateInput = {
      InstallmentNumber: data.installmentNumber,
      DueDate: new Date(data.dueDate),
      Amount: data.amount ? new Prisma.Decimal(data.amount) : new Prisma.Decimal(0),
      PaymentEvidence: data.paymentEvidence || null,
      DatePay: data.datePay ? new Date(data.datePay) : null,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateInstallmentsVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateInstallmentsVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getImageVehicleByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getImageVehicleByIdVehicleService(id)

    if (!response) throw new Error('Failed to get image vehicle by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addImageVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addImageVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')
    const files = req.files as MulterFile[];

    if (!files || files.length === 0) {
      throw new Error('ไม่พบไฟล์ที่อัพโหลด')
    }
    const notes = Array.isArray(req.body.notes) ? req.body.notes : [req.body.notes];

    const data = req.body
    const payload: Prisma.ImageVehicleCreateManyInput[] = files.map((file, index) => ({
      Status: 'active',
      Url: `/uploads/vehicle-images/${file.filename}`,
      Title: file.originalname,
      Description: notes[index] || '',
      VehicleId: id,
      CreatedByUsername: parsedToken.username
    }));
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addImageVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addImageVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateImageVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateImageVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('ImageVehicle id is required')

    const data = req.body
    const payload: Prisma.ImageVehicleUpdateInput = {
      Url: data.url,
      Title: data.title,
      Description: data.description,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateImageVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateImageVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}



export async function getIncomeVehicleByIdVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const response = await vehicleServices.getIncomeVehicleByIdVehicleService(id)

    if (!response) throw new Error('Failed to get income vehicle by id vehicle')

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addIncomeVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addIncomeVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('Vehicle id is required')

    const data = req.body
    const payload: Prisma.IncomeVehicleCreateInput = {
      Status: 'active',
      ReceiveDate: new Date(data.receiveDate) || undefined,
      CustomerName: data.customerName,
      Description: data.description,
      AmountReceive: data.amountReceive,
      DateTime: new Date(data.dateTime),
      Time: data.time,
      WorkOrderNumber: data.workOrderNumber,
      InvoiceNumber: data.invoiceNumber,
      PaymentStatus: {
        connect: { PaymentStatusId: data.paymentStatusId }
      },
      VehicleDriver: {
        connect: { VehicleDriverId: data.vehicleDriverId }
      },
      Vehicle: {
        connect: { VehicleId: id }
      },
      CreatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addIncomeVehicleService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addIncomeVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateIncomeVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateIncomeVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('IncomeVehicle id is required')

    const data = req.body
    const payload: Prisma.IncomeVehicleUpdateInput = {
      ReceiveDate: new Date(data.receiveDate),
      CustomerName: data.customerName,
      Description: data.description,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username,
      DateTime: new Date(data.dateTime),
      Time: data.time,
      WorkOrderNumber: data.workOrderNumber,
      InvoiceNumber: data.invoiceNumber,
      PaymentStatus: {
        connect: { PaymentStatusId: data.paymentStatusId }
      },
      AmountReceive: data.amountReceive,
      VehicleDriver: {
        connect: { VehicleDriverId: data.vehicleDriverId }
      },
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateIncomeVehicleService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateIncomeVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function deleteIncomeVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start deleteIncomeVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('IncomeVehicle id is required')

    const response = await vehicleServices.deleteIncomeVehicleService(id, parsedToken.username)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in deleteIncomeVehicle:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}



export async function getVehicleType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleType(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get vehicle type')

    const mappedResponse = response.map((item) => ({
      uuid: item.VehicleTypeId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addVehicleType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleType');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleTypeCreateInput = {
      Status: 'active',
      Name: data.name,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleTypeService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicleType:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateVehicleType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleType');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleType id is required')

    const data = req.body
    const payload: Prisma.VehicleTypeUpdateInput = {
      Name: data.name,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleTypeService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleType:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getVehicleBrand(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleBrand(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get vehicle brand')

    const mappedResponse = response.map((item) => ({
      uuid: item.VehicleBrandId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addVehicleBrand(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleBrand');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleBrandCreateInput = {
      Status: 'active',
      Name: data.name,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleBrandService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicleBrand:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateVehicleBrand(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleBrand');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleBrand id is required')

    const data = req.body
    const payload: Prisma.VehicleBrandUpdateInput = {
      Name: data.name,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleBrandService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleBrand:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getVehicleOwner(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleOwner(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get vehicle owner')

    const mappedResponse = response.map((item) => ({
      uuid: item.VehicleOwnerId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addVehicleOwner(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleOwner');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleOwnerCreateInput = {
      Status: 'active',
      Name: data.name,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleOwnerService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicleOwner:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateVehicleOwner(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleOwner');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleOwner id is required')

    const data = req.body
    const payload: Prisma.VehicleOwnerUpdateInput = {
      Name: data.name,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleOwnerService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleOwner:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getVehicleDepartment(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleDepartment(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get vehicle department')

    const mappedResponse = response.map((item) => ({
      uuid: item.VehicleDepartmentId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addVehicleDepartment(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleDepartment');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleDepartmentCreateInput = {
      Status: 'active',
      Name: data.name,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleDepartmentService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicleDepartment:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateVehicleDepartment(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleDepartment');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleDepartment id is required')

    const data = req.body
    const payload: Prisma.VehicleDepartmentUpdateInput = {
      Name: data.name,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleDepartmentService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleDepartment:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getVehicleDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleDriver(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get vehicle driver')

    const mappedResponse = response.map((item) => ({
      uuid: item.VehicleDriverId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addVehicleDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleDriver');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleDriverCreateInput = {
      Status: 'active',
      Name: data.name,
      MobileNo: data.mobileNo ?? null,
      LicenseNo: data.licenseNo ?? null,
      ImageUrl: data.imageUrl ?? null,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleDriverService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicleDriver:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateVehicleDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleDriver');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleDriver id is required')

    const data = req.body
    const payload: Prisma.VehicleDriverUpdateInput = {
      Name: data.name,
      MobileNo: data.mobileNo ?? null,
      LicenseNo: data.licenseNo ?? null,
      ImageUrl: data.imageUrl ?? null,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleDriverService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleDriver:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getDriversManaged(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const drivers = await vehicleServices.getDriversManaged(parsedToken.tenantId)

    const data = drivers.map((d) => ({
      id: d.VehicleDriverId,
      name: d.Name,
      mobileNo: d.MobileNo ?? '',
      licenseNo: d.LicenseNo ?? '',
      imageUrl: d.ImageUrl ?? '',
      status: d.Status,
      lineUserId: d.LineUserId ?? '',
      vehicleCount: d._count.Vehicle,
      jobCount: d._count.DriverJobs,
      createdAt: d.CreatedAt
    }))

    res.json({ success: true, code: 200, message: 'success', data })
  } catch (error: any) {
    res.status(500).json({ success: false, code: 500, message: error.message })
  }
}

export async function deleteVehicleDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) {
      res.status(400)
      throw new Error('VehicleDriver id is required')
    }

    const result = await vehicleServices.deleteVehicleDriverService(id, parsedToken.tenantId, parsedToken.username)

    if (!result || result.count === 0) {
      res.status(404)
      throw new Error('ไม่พบคนขับที่ต้องการลบ')
    }

    res.json({ success: true, code: 200, message: 'ลบคนขับสำเร็จ', data: { deletedCount: result.count } })
  } catch (error: any) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    res.status(statusCode).json({ success: false, code: statusCode, message: error.message })
  }
}

export async function getVehicleStatus(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllVehicleStatus(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get vehicle status')

    const mappedResponse = response.map((item) => ({
      uuid: item.VehicleStatusId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addVehicleStatus(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addVehicleStatus');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.VehicleStatusCreateInput = {
      Status: 'active',
      Name: data.name,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addVehicleStatusService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addVehicleStatus:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateVehicleStatus(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateVehicleStatus');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('VehicleStatus id is required')

    const data = req.body
    const payload: Prisma.VehicleStatusUpdateInput = {
      Name: data.name,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateVehicleStatusService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateVehicleStatus:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function getFuelType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const response = await vehicleServices.getAllFuelType(parsedToken.tenantId);

    if (!response) throw new Error('Failed to get fuel type')

    const mappedResponse = response.map((item) => ({
      uuid: item.FuelTypeId,
      name: item.Name
    }))

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: mappedResponse
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function addFuelType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start addFuelType');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const data = req.body
    const payload: Prisma.FuelTypeCreateInput = {
      Status: 'active',
      Name: data.name,
      CreatedByUsername: parsedToken.username,
      UpdatedByUsername: parsedToken.username,
      TenantId: parsedToken.tenantId
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.addFuelTypeService(payload)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in addFuelType:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}
export async function updateFuelType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start updateFuelType');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const id = req.params.id
    if (!id) throw new Error('FuelType id is required')

    const data = req.body
    const payload: Prisma.FuelTypeUpdateInput = {
      Name: data.name,
      UpdatedAt: new Date(),
      UpdatedByUsername: parsedToken.username
    }
    console.log('Sending payload:', payload);
    const response = await vehicleServices.updateFuelTypeService(payload, id)
    console.log('Service response:', response);

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: {}
    })
  } catch (error: any) {
    console.error('Error in updateFuelType:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}


function formatDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// สร้าง interface สำหรับ response
interface VehicleNotification {
  VehicleId: string;
  VehicleNo: string;
  Tax: string | null;
  CmInsurance: string | null;
  InsurancePolicy: string | null;
  RepairVehicle: string | null;
  DrainTheOilVehicle: string | null;
  InstallmentsVehicle: string | null;
}

export async function getNotification(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    // ภาษีที่หมดอายุใน 7 วัน
    const taxExpiringIn7Days = await getTaxExpiringIn7Days(parsedToken.tenantId);

    // พรบหมดอายุใน 7 วัน
    const cmInsuranceExpiringIn7Days = await getCompulsoryMotorInsuranceExpiringIn7Days(parsedToken.tenantId);

    // กรมธรรม์หมดอายุใน 7 วัน
    const insurancePolicyExpiringIn7Days = await getInsurancePolicyExpiringIn7Days(parsedToken.tenantId);

    // ซ่อมรับรถใน 7 วัน
    const repairVehicleExpiringIn7Days = await getRepairVehicleExpiringIn7Days(parsedToken.tenantId);

    // ถ่ายน้ำมันใน 7 วัน
    const drainTheOilVehicleExpiringIn7Days = await getDrainTheOilVehicleExpiringIn7Days(parsedToken.tenantId);

    // ค่างวดใน 7 วัน
    const installmentsVehicleExpiringIn7Days = await getInstallmentsVehicleExpiringIn7Days(parsedToken.tenantId);

    const vehicles = new Map<string, VehicleNotification>();

    // แยกการเพิ่มข้อมูลเป็นแต่ละประเภท
    taxExpiringIn7Days.forEach(tax => {
      const vehicleId = tax.Vehicle.VehicleId;
      const vehicleNo = `${tax.Vehicle.No}`;

      if (!vehicles.has(vehicleId)) {
        vehicles.set(vehicleId, {
          VehicleId: vehicleId,
          VehicleNo: vehicleNo,
          Tax: formatDate(tax.EndDate),
          CmInsurance: null,
          InsurancePolicy: null,
          RepairVehicle: null,
          DrainTheOilVehicle: null,
          InstallmentsVehicle: null
        });
      } else {
        vehicles.get(vehicleId)!.Tax = formatDate(tax.EndDate);
      }
    });

    cmInsuranceExpiringIn7Days.forEach(insurance => {
      const vehicleId = insurance.Vehicle.VehicleId;
      const vehicleNo = `${insurance.Vehicle.No}`;

      if (!vehicles.has(vehicleId)) {
        vehicles.set(vehicleId, {
          VehicleId: vehicleId,
          VehicleNo: vehicleNo,
          Tax: null,
          CmInsurance: formatDate(insurance.EndDate),
          InsurancePolicy: null,
          RepairVehicle: null,
          DrainTheOilVehicle: null,
          InstallmentsVehicle: null
        });
      } else {
        vehicles.get(vehicleId)!.CmInsurance = formatDate(insurance.EndDate);
      }
    });

    insurancePolicyExpiringIn7Days.forEach(policy => {
      const vehicleId = policy.Vehicle.VehicleId;
      const vehicleNo = `${policy.Vehicle.No}`;

      if (!vehicles.has(vehicleId)) {
        vehicles.set(vehicleId, {
          VehicleId: vehicleId,
          VehicleNo: vehicleNo,
          Tax: null,
          CmInsurance: null,
          InsurancePolicy: formatDate(policy.EndDate),
          RepairVehicle: null,
          DrainTheOilVehicle: null,
          InstallmentsVehicle: null
        });
      } else {
        vehicles.get(vehicleId)!.InsurancePolicy = formatDate(policy.EndDate);
      }
    });

    repairVehicleExpiringIn7Days.forEach(repair => {
      const vehicleId = repair.Vehicle.VehicleId;
      const vehicleNo = `${repair.Vehicle.No}`;

      if (!vehicles.has(vehicleId)) {
        vehicles.set(vehicleId, {
          VehicleId: vehicleId,
          VehicleNo: vehicleNo,
          Tax: null,
          CmInsurance: null,
          InsurancePolicy: null,
          RepairVehicle: formatDate(repair.ReceiveDate),
          DrainTheOilVehicle: null,
          InstallmentsVehicle: null
        });
      } else {
        vehicles.get(vehicleId)!.RepairVehicle = formatDate(repair.ReceiveDate);
      }
    });

    drainTheOilVehicleExpiringIn7Days.forEach(drain => {
      const vehicleId = drain.Vehicle.VehicleId;
      const vehicleNo = `${drain.Vehicle.No}`;

      if (!vehicles.has(vehicleId)) {
        vehicles.set(vehicleId, {
          VehicleId: vehicleId,
          VehicleNo: vehicleNo,
          Tax: null,
          CmInsurance: null,
          InsurancePolicy: null,
          RepairVehicle: null,
          DrainTheOilVehicle: formatDate(drain.Date),
          InstallmentsVehicle: null
        });
      } else {
        vehicles.get(vehicleId)!.DrainTheOilVehicle = formatDate(drain.Date);
      }
    });

    installmentsVehicleExpiringIn7Days.forEach(installment => {
      const vehicleId = installment.Vehicle.VehicleId;
      const vehicleNo = `${installment.Vehicle.No}`;

      if (!vehicles.has(vehicleId)) {
        vehicles.set(vehicleId, {
          VehicleId: vehicleId,
          VehicleNo: vehicleNo,
          Tax: null,
          CmInsurance: null,
          InsurancePolicy: null,
          RepairVehicle: null,
          DrainTheOilVehicle: null,
          InstallmentsVehicle: formatDate(installment.DueDate)
        });
      } else {
        vehicles.get(vehicleId)!.InstallmentsVehicle = formatDate(installment.DueDate);
      }
    });

    // แปลง Map เป็น Array
    const response = Array.from(vehicles.values());

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: response
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    });
  }
}

export async function importVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start importVehicle');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    console.log('เริ่มการนำเข้าข้อมูลรถยนต์...');

    if (!req.file) {
      console.log('ไม่พบไฟล์ที่อัพโหลด');
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัพโหลดไฟล์ CSV'
      });
    }

    console.log('ไฟล์ที่อัพโหลด:', req.file.originalname);

    const importLog = {
      fileName: req.file.originalname,
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedBy: parsedToken.username || 'unknown',
      importedAt: new Date()
    };

    // ดึงข้อมูลทั้งหมดที่จำเป็น
    console.log('กำลังดึงข้อมูลอ้างอิง...');
    const [brands, types, fuelTypes, owners, departments, drivers, statuses] = await Promise.all([
      vehicleServices.getAllVehicleBrand(parsedToken.tenantId || ''),
      vehicleServices.getAllVehicleType(parsedToken.tenantId || ''),
      vehicleServices.getAllFuelType(parsedToken.tenantId || ''),
      vehicleServices.getAllVehicleOwner(parsedToken.tenantId || ''),
      vehicleServices.getAllVehicleDepartment(parsedToken.tenantId || ''),
      vehicleServices.getAllVehicleDriver(parsedToken.tenantId || ''),
      vehicleServices.getAllVehicleStatus(parsedToken.tenantId || '')
    ]);
    console.log('ดึงข้อมูลอ้างอิงสำเร็จ');

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลรถยนต์:', dataRows);

    const vehicles = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        console.log(`กำลังประมวลผลรายการที่ ${index + 1}`);

        // ตรวจสอบข้อมูลซ้ำของทะเบียนรถ
        const existingVehicle = await findVehicleByLicensePlate(
          parsedToken.tenantId || '',
          record.licensePlatePrefix,
          record.licensePlateSuffix,
          record.licensePlateProvince
        );

        if (existingVehicle) {
          throw new Error('มีข้อมูลทะเบียนรถนี้ในระบบแล้ว');
        }

        // ค้นหา ID จากข้อมูลอ้างอิง
        const vehicleType = types.find(t => t.Name === record.vehicleType);
        const vehicleBrand = brands.find(b => b.Name === record.brand);
        const fuelType = fuelTypes.find(f => f.Name === record.fuelType);
        const vehicleOwner = owners.find(o => o.Name === record.owner);
        const vehicleDepartment = departments.find(d => d.Name === record.department);
        const vehicleDriver = drivers.find(d => d.Name === record.driver);
        const vehicleStatus = statuses.find(s => s.Name === record.status);

        if (!vehicleType || !vehicleBrand || !fuelType || !vehicleOwner || !vehicleDepartment || !vehicleDriver || !vehicleStatus) {
          if (!vehicleType) {
            throw new Error('ไม่พบข้อมูลประเภทรถยนต์');
          }
          if (!vehicleBrand) {
            throw new Error('ไม่พบข้อมูลยี่ห้อรถยนต์');
          }
          if (!fuelType) {
            throw new Error('ไม่พบข้อมูลประเภทน้ำมัน');
          }
          if (!vehicleOwner) {
            throw new Error('ไม่พบข้อมูลเจ้าของรถยนต์');
          }
          if (!vehicleDepartment) {
            throw new Error('ไม่พบข้อมูลหน่วยงาน');
          }
          if (!vehicleDriver) {
            throw new Error('ไม่พบข้อมูลผู้ขับขี่');
          }
          if (!vehicleStatus) {
            throw new Error('ไม่พบข้อมูลสถานะรถยนต์');
          }
        }

        const vehicleData = {
          LicensePlatePrefix: record.licensePlatePrefix,
          LicensePlateSuffix: record.licensePlateSuffix,
          LicensePlateProvince: record.licensePlateProvince,
          VehicleTypeId: vehicleType.VehicleTypeId,
          VehicleCharacteristic: record.vehicleCharacteristic,
          VehicleBrandId: vehicleBrand.VehicleBrandId,
          Model: record.model,
          Color: record.color,
          Generation: record.generation,
          ChassisNumber: record.chassisNumber,
          EngineNumber: record.engineNumber,
          EngineBrand: record.engineBrand,
          FuelTypeId: fuelType.FuelTypeId,
          TankSize: parseInt(record.tankSize),
          FuelConsumption: parseInt(record.fuelConsumption),
          CylinderCount: parseInt(record.cylinderCount),
          Cylinder: parseInt(record.cylinder),
          VehicleSize: String(record.vehicleSize),
          CargoSize: String(record.cargoSize),
          GasSerialNumber: record.gasSerialNumber,
          VehicleWeight: parseInt(record.vehicleWeight),
          CargoWeight: parseInt(record.cargoWeight),
          WheelCount: parseInt(record.wheelCount),
          SeatCount: parseInt(record.seatCount),
          RegistrationDate: new Date(record.registrationDate),
          StartDate: new Date(record.startDate),
          Age: String(record.age),
          Ownership: record.ownership,
          LineNotifyToken: record.lineNotifyToken,
          VehicleOwnerId: vehicleOwner.VehicleOwnerId,
          VehicleDepartmentId: vehicleDepartment.VehicleDepartmentId,
          VehicleDriverId: vehicleDriver.VehicleDriverId,
          VehicleStatusId: vehicleStatus.VehicleStatusId,
          InstallmentPeriods: record.installmentPeriods ? Number(record.installmentPeriods) : null,
          InstallmentAmount: record.installmentAmount ? new Prisma.Decimal(record.installmentAmount) : null,
          Note: record.note,
          Img: record.img,
          TenantId: parsedToken.tenantId || '',
          CreatedByUsername: parsedToken.username || 'unknown',
          UpdatedByUsername: parsedToken.username || 'unknown'
        };

        console.log('ข้อมูลรถยนต์ที่แปลงแล้ว:', vehicleData);
        importLog.successCount++;
        return vehicleData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${record.licensePlatePrefix} ${record.licensePlateSuffix} ${record.licensePlateProvince}`,
            vehicleType: record.vehicleType,
            brand: record.brand,
            model: record.model
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((v): v is NonNullable<typeof v> => v !== null);

    console.log('สรุปผลการนำเข้า:');
    console.log('- จำนวนรายการทั้งหมด:', importLog.totalRecords);
    console.log('- จำนวนรายการที่สำเร็จ:', importLog.successCount);
    console.log('- จำนวนรายการที่ผิดพลาด:', importLog.errorCount);

    if (importLog.errors.length > 0) {
      console.log('รายการที่ผิดพลาด:', importLog.errors);
    }

    // บันทึกข้อมูลรถยนต์
    if (vehicles.length > 0) {
      console.log('กำลังบันทึกข้อมูลรถยนต์...');
      await vehicleServices.addVehicleListService(vehicles);
      console.log('บันทึกข้อมูลรถยนต์สำเร็จ');

      // สร้างข้อมูล InstallmentsVehicle อัตโนมัติสำหรับรถยนต์ที่มีข้อมูล installmentPeriods และ installmentAmount
      for (const vehicle of vehicles) {
        if (vehicle.InstallmentPeriods && vehicle.InstallmentAmount) {
          try {
            // หา VehicleId ของรถยนต์ที่เพิ่งบันทึกโดยใช้ข้อมูลทะเบียนรถ
            const savedVehicle = await findVehicleByLicensePlate(
              parsedToken.tenantId || '',
              vehicle.LicensePlatePrefix,
              vehicle.LicensePlateSuffix,
              vehicle.LicensePlateProvince
            );
            
            if (savedVehicle) {
              // ตรวจสอบว่ามีข้อมูล InstallmentsVehicle อยู่แล้วหรือไม่
              const existingInstallments = await db.installmentsVehicle.findFirst({
                where: { VehicleId: savedVehicle.VehicleId }
              });
              
              if (!existingInstallments) {
                await vehicleServices.createInstallmentsForVehicle(
                  savedVehicle.VehicleId,
                  Number(vehicle.InstallmentPeriods),
                  Number(vehicle.InstallmentAmount),
                  parsedToken.username
                );
                console.log('สร้างข้อมูลผ่อนชำระสำหรับรถยนต์:', savedVehicle.VehicleId);
              } else {
                console.log('ข้อมูลผ่อนชำระมีอยู่แล้วสำหรับรถยนต์:', savedVehicle.VehicleId);
              }
            }
          } catch (installmentError) {
            console.error('เกิดข้อผิดพลาดในการสร้างข้อมูลผ่อนชำระ:', installmentError);
            // ไม่ throw error เพราะการสร้าง vehicle สำเร็จแล้ว
          }
        }
      }
    }

    // บันทึก log การนำเข้า
    console.log('กำลังบันทึก log การนำเข้า...');
    console.log('บันทึก log การนำเข้าสำเร็จ');

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'อัพโหลดข้อมูลสำเร็จ',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((vehicle): vehicle is NonNullable<typeof vehicle> => vehicle !== null)
          .map((vehicle, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.licensePlatePrefix} ${vehicle.licensePlateSuffix} ${vehicle.licensePlateProvince}`,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
    });
  }
}

export async function importTax(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    console.log('Start importTax');
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    console.log('เริ่มการนำเข้าข้อมูลภาษีรถยนต์...');

    // ค้นหารถยนต์จาก id
    const id = req.params.id;
    if (!id) throw new Error('Vehicle id is required');

    const vehicle = await vehicleServices.findVehicleById(id);

    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์ในระบบ');
    }

    if (!req.file) {
      console.log('ไม่พบไฟล์ที่อัพโหลด');
      return res.status(400).json({
        success: false,
        message: 'กรุณาอัพโหลดไฟล์ CSV'
      });
    }

    console.log('ไฟล์ที่อัพโหลด:', req.file.originalname);

    const importLog = {
      fileName: req.file.originalname,
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedBy: parsedToken.username || 'unknown',
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลภาษีรถยนต์:', dataRows);

    const processedYears = new Set();
    const taxes = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        console.log(`กำลังประมวลผลรายการที่ ${index + 1}`);

        const taxData = {
          Status: 'active',
          Year: parseInt(record.Year),
          EndDate: new Date(record.EndDate),
          TotalPremium: parseFloat(record.TotalPremium),
          InsuranceCompany: record.InsuranceCompany,
          BrokerName: record.BrokerName,
          File: record.File || null,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown',
          UpdatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (isNaN(taxData.Year) || taxData.Year === null || taxData.Year === undefined) {
          throw new Error('ปีภาษีไม่ถูกต้อง');
        }

        if (!taxData.EndDate || isNaN(taxData.EndDate.getTime())) {
          throw new Error('วันที่สิ้นสุดไม่ถูกต้อง');
        }

        if (isNaN(taxData.TotalPremium) || taxData.TotalPremium === null || taxData.TotalPremium === undefined) {
          throw new Error('จำนวนเงินไม่ถูกต้อง');
        }

        if (!taxData.InsuranceCompany || taxData.InsuranceCompany.trim() === '') {
          throw new Error('กรุณาระบุบริษัทประกันภัย');
        }

        if (!taxData.BrokerName || taxData.BrokerName.trim() === '') {
          throw new Error('กรุณาระบุชื่อนายหน้า');
        }

        // ตรวจสอบว่าปีภาษีซ้ำกับที่มีใน processedYears หรือไม่
        if (processedYears.has(taxData.Year)) {
          throw new Error(`พบปีภาษี ${taxData.Year} ซ้ำในไฟล์ CSV`);
        }
        processedYears.add(taxData.Year);

        // ตรวจสอบว่าปีภาษีซ้ำกับที่มีในฐานข้อมูลหรือไม่
        const existingTaxes = await vehicleServices.getTaxByIdVehicleService(vehicle.VehicleId);
        const isDuplicateYear = existingTaxes.some(tax => tax.year === taxData.Year);
        if (isDuplicateYear) {
          throw new Error(`ปีภาษี ${taxData.Year} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลภาษีรถยนต์ที่แปลงแล้ว:', taxData);
        importLog.successCount++;
        return taxData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            year: record.year,
            endDate: record.endDate
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    console.log('สรุปผลการนำเข้า:');
    console.log('- จำนวนรายการทั้งหมด:', importLog.totalRecords);
    console.log('- จำนวนรายการที่สำเร็จ:', importLog.successCount);
    console.log('- จำนวนรายการที่ผิดพลาด:', importLog.errorCount);

    if (importLog.errors.length > 0) {
      console.log('รายการที่ผิดพลาด:', importLog.errors);
    }

    // บันทึกข้อมูลภาษีรถยนต์
    if (taxes.length > 0) {
      console.log('กำลังบันทึกข้อมูลภาษีรถยนต์...');
      await vehicleServices.addTaxListService(taxes);
      console.log('บันทึกข้อมูลภาษีรถยนต์สำเร็จ');
    }

    // บันทึก log การนำเข้า
    console.log('กำลังบันทึก log การนำเข้า...');
    console.log('บันทึก log การนำเข้าสำเร็จ');

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'อัพโหลดข้อมูลสำเร็จ',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((tax): tax is NonNullable<typeof tax> => tax !== null)
          .map((tax, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: tax.Year,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
    });
  }
}

export async function importCompulsoryMotorInsurance(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลประกันภัยภาคบังคับ:', dataRows);

    const processedYears = new Set();
    const insurances = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        console.log(`กำลังประมวลผลรายการที่ ${index + 1}`);

        const insuranceData = {
          Status: 'active',
          Year: parseInt(record.Year),
          EndDate: new Date(record.EndDate),
          TotalPremium: parseFloat(record.TotalPremium),
          InsuranceCompany: record.InsuranceCompany,
          BrokerName: record.BrokerName,
          File: record.File || null,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown',
          UpdatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (isNaN(insuranceData.Year) || insuranceData.Year === null || insuranceData.Year === undefined) {
          throw new Error('ปีไม่ถูกต้อง');
        }

        if (!insuranceData.EndDate || isNaN(insuranceData.EndDate.getTime())) {
          throw new Error('วันที่สิ้นสุดไม่ถูกต้อง');
        }

        if (isNaN(insuranceData.TotalPremium) || insuranceData.TotalPremium === null || insuranceData.TotalPremium === undefined) {
          throw new Error('จำนวนเงินไม่ถูกต้อง');
        }

        if (!insuranceData.InsuranceCompany || insuranceData.InsuranceCompany.trim() === '') {
          throw new Error('กรุณาระบุบริษัทประกันภัย');
        }

        if (!insuranceData.BrokerName || insuranceData.BrokerName.trim() === '') {
          throw new Error('กรุณาระบุชื่อนายหน้า');
        }

        // ตรวจสอบว่าปีซ้ำกับที่มีใน processedYears หรือไม่
        if (processedYears.has(insuranceData.Year)) {
          throw new Error(`พบปี ${insuranceData.Year} ซ้ำในไฟล์ CSV`);
        }
        processedYears.add(insuranceData.Year);

        // ตรวจสอบว่าปีซ้ำกับที่มีในฐานข้อมูลหรือไม่
        const existingInsurances = await vehicleServices.getCompulsoryMotorInsuranceByIdVehicleService(vehicle.VehicleId);
        const isDuplicateYear = existingInsurances.some(insurance => insurance.year === insuranceData.Year);
        if (isDuplicateYear) {
          throw new Error(`ปี ${insuranceData.Year} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลประกันภัยภาคบังคับที่แปลงแล้ว:', insuranceData);
        importLog.successCount++;
        return insuranceData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.year,
            endDate: record.endDate
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    console.log('สรุปผลการนำเข้า:');
    console.log('จำนวนรายการทั้งหมด:', importLog.totalRecords);
    console.log('จำนวนรายการที่นำเข้าได้:', importLog.successCount);
    console.log('จำนวนรายการที่มีข้อผิดพลาด:', importLog.errorCount);

    if (importLog.errorCount > 0) {
      console.log('รายละเอียดข้อผิดพลาด:', importLog.errors);
    }

    if (insurances.length > 0) {
      await vehicleServices.addCompulsoryMotorInsuranceVehicleListService(insurances);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: "นำเข้าข้อมูลสำเร็จ",
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((insurance): insurance is NonNullable<typeof insurance> => insurance !== null)
          .map((insurance, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: insurance.Year,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    res.status(400).json({
      success: false,
      message: error?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
    });
  }
}

export async function importInsurancePolicy(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลประกันภัย:', dataRows);

    const processedYears = new Set();
    const insurances = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        console.log(`กำลังประมวลผลรายการที่ ${index + 1}`);

        const insuranceData = {
          Status: 'active',
          Year: parseInt(record.Year),
          Type: record.Type,
          InsuranceCompany: record.InsuranceCompany,
          BrokerName: record.BrokerName,
          StartDate: new Date(record.StartDate),
          EndDate: new Date(record.EndDate),
          TotalPremium: parseFloat(record.TotalPremium),
          PolicyFile: record.PolicyFile || null,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (isNaN(insuranceData.Year) || insuranceData.Year === null || insuranceData.Year === undefined) {
          throw new Error('ปีไม่ถูกต้อง');
        }

        if (!insuranceData.Type || insuranceData.Type.trim() === '') {
          throw new Error('กรุณาระบุประเภทประกันภัย');
        }

        if (!insuranceData.StartDate || isNaN(insuranceData.StartDate.getTime())) {
          throw new Error('วันที่เริ่มต้นไม่ถูกต้อง');
        }

        if (!insuranceData.EndDate || isNaN(insuranceData.EndDate.getTime())) {
          throw new Error('วันที่สิ้นสุดไม่ถูกต้อง');
        }

        if (isNaN(insuranceData.TotalPremium) || insuranceData.TotalPremium === null || insuranceData.TotalPremium === undefined) {
          throw new Error('จำนวนเงินไม่ถูกต้อง');
        }

        if (!insuranceData.InsuranceCompany || insuranceData.InsuranceCompany.trim() === '') {
          throw new Error('กรุณาระบุบริษัทประกันภัย');
        }

        if (!insuranceData.BrokerName || insuranceData.BrokerName.trim() === '') {
          throw new Error('กรุณาระบุชื่อนายหน้า');
        }

        // ตรวจสอบว่าปีซ้ำกับที่มีใน processedYears หรือไม่
        if (processedYears.has(insuranceData.Year)) {
          throw new Error(`พบปี ${insuranceData.Year} ซ้ำในไฟล์ CSV`);
        }
        processedYears.add(insuranceData.Year);

        // ตรวจสอบว่าปีซ้ำกับที่มีในฐานข้อมูลหรือไม่
        const existingInsurances = await vehicleServices.getInsurancePolicyByIdVehicleService(vehicle.VehicleId);
        const isDuplicateYear = existingInsurances.some(insurance => insurance.year === insuranceData.Year);
        if (isDuplicateYear) {
          throw new Error(`ปี ${insuranceData.Year} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลประกันภัยที่แปลงแล้ว:', insuranceData);
        importLog.successCount++;
        return insuranceData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.Year,
            endDate: record.EndDate
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    console.log('สรุปผลการนำเข้า:');
    console.log('จำนวนรายการทั้งหมด:', importLog.totalRecords);
    console.log('จำนวนรายการที่นำเข้าได้:', importLog.successCount);
    console.log('จำนวนรายการที่มีข้อผิดพลาด:', importLog.errorCount);

    if (importLog.errorCount > 0) {
      console.log('รายละเอียดข้อผิดพลาด:', importLog.errors);
    }

    if (insurances.length > 0) {
      await vehicleServices.addInsurancePolicyVehicleListService(insurances);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: "นำเข้าข้อมูลสำเร็จ",
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((insurance): insurance is NonNullable<typeof insurance> => insurance !== null)
          .map((insurance, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: insurance.Year,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    res.status(400).json({
      success: false,
      message: error?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
    });
  }
}

export async function importCarTires(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลยางรถยนต์:', dataRows);

    const carTires = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        console.log(`กำลังประมวลผลรายการที่ ${index + 1}`);

        const carTireData = {
          Status: 'active',
          ChangeDate: new Date(record.ChangeDate),
          Position: record.Position,
          Brand: record.Brand,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (!carTireData.ChangeDate || isNaN(carTireData.ChangeDate.getTime())) {
          throw new Error('วันที่เปลี่ยนยางไม่ถูกต้อง');
        }

        if (!carTireData.Position || carTireData.Position.trim() === '') {
          throw new Error('กรุณาระบุตำแหน่งยาง');
        }

        if (!carTireData.Brand || carTireData.Brand.trim() === '') {
          throw new Error('กรุณาระบุยี่ห้อยาง');
        }

        console.log('ข้อมูลยางรถยนต์ที่แปลงแล้ว:', carTireData);
        importLog.successCount++;
        return carTireData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.ChangeDate,
            changeDate: record.ChangeDate
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    console.log('สรุปผลการนำเข้า:');
    console.log('จำนวนรายการทั้งหมด:', importLog.totalRecords);
    console.log('จำนวนรายการที่นำเข้าได้:', importLog.successCount);
    console.log('จำนวนรายการที่มีข้อผิดพลาด:', importLog.errorCount);

    if (importLog.errorCount > 0) {
      console.log('รายละเอียดข้อผิดพลาด:', importLog.errors);
    }

    if (carTires.length > 0) {
      await vehicleServices.addCarTiresListService(carTires);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: "นำเข้าข้อมูลสำเร็จ",
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((carTire): carTire is NonNullable<typeof carTire> => carTire !== null)
          .map((carTire, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: carTire.ChangeDate,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    res.status(400).json({
      success: false,
      message: error?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
    });
  }
}

export async function importAccidentVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลอุบัติเหตุ:', dataRows);

    const processedDates = new Set<string>();

    const accidents = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {

        const accidentData = {
          Status: 'active',
          Date: new Date(record.Date),
          Time: record.Time,
          Party: record.Party,
          LicensePlate: record.LicensePlate,
          DriverName: record.DriverName,
          Opponent: record.Opponent,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (!accidentData.Date || isNaN(accidentData.Date.getTime())) {
          throw new Error('วันที่เกิดเหตุไม่ถูกต้อง');
        }

        if (!accidentData.Time || accidentData.Time.trim() === '') {
          throw new Error('กรุณาระบุเวลาเกิดเหตุ');
        }

        if (!accidentData.Party || accidentData.Party.trim() === '') {
          throw new Error('กรุณาระบุคู่กรณี');
        }

        const accidentDate = new Date(record.Date).toISOString().split('T')[0];
        if (processedDates.has(accidentDate)) {
          throw new Error(`พบวันที่ ${accidentDate} ซ้ำในไฟล์ CSV`);
        }
        processedDates.add(accidentDate);

        const existingAccidents = await vehicleServices.getAccidentVehicleByIdVehicleService(vehicle.VehicleId);
        const isDuplicateDate = existingAccidents.some(accident =>
          new Date(accident.date).toISOString().split('T')[0] === accidentDate
        );
        if (isDuplicateDate) {
          throw new Error(`วันที่ ${accidentDate} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลอุบัติเหตุที่แปลงแล้ว:', accidentData);
        importLog.successCount++;
        return accidentData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.Date,
            date: record.Date
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    console.log('สรุปผลการนำเข้า:');
    console.log('จำนวนรายการทั้งหมด:', importLog.totalRecords);
    console.log('จำนวนรายการที่นำเข้าได้:', importLog.successCount);
    console.log('จำนวนรายการที่มีข้อผิดพลาด:', importLog.errorCount);

    if (importLog.errorCount > 0) {
      console.log('รายละเอียดข้อผิดพลาด:', importLog.errors);
    }

    if (accidents.length > 0) {
      await vehicleServices.addAccidentVehicleListService(accidents);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: "นำเข้าข้อมูลสำเร็จ",
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((accident): accident is NonNullable<typeof accident> => accident !== null)
          .map((accident, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: accident.Date,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล:', error);
    res.status(400).json({
      success: false,
      message: error?.message || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล"
    });
  }
}

export async function importRepairVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลซ่อมบำรุง:', dataRows);

    const processedDates = new Set<string>();

    const repairs = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        const repairData = {
          Status: 'active',
          RepairDate: new Date(record.RepairDate),
          LicensePlate: record.LicensePlate,
          RepairShop: record.RepairShop,
          ReceiveDate: new Date(record.ReceiveDate),
          InsurancePay: parseFloat(record.InsurancePay) || 0,
          CompanyPay: parseFloat(record.CompanyPay) || 0,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (!repairData.RepairDate || isNaN(repairData.RepairDate.getTime())) {
          throw new Error('วันที่ซ่อมไม่ถูกต้อง');
        }

        if (!repairData.ReceiveDate || isNaN(repairData.ReceiveDate.getTime())) {
          throw new Error('วันที่รับรถไม่ถูกต้อง');
        }

        if (!repairData.RepairShop || repairData.RepairShop.trim() === '') {
          throw new Error('กรุณาระบุร้านซ่อม');
        }

        const repairDate = new Date(record.RepairDate).toISOString().split('T')[0];
        if (processedDates.has(repairDate)) {
          throw new Error(`พบวันที่ ${repairDate} ซ้ำในไฟล์ CSV`);
        }
        processedDates.add(repairDate);

        const existingRepairs = await vehicleServices.getRepairVehicleByIdVehicleService(vehicle.VehicleId);
        const isDuplicateDate = existingRepairs.some(repair =>
          new Date(repair.repairDate).toISOString().split('T')[0] === repairDate
        );
        if (isDuplicateDate) {
          throw new Error(`วันที่ ${repairDate} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลซ่อมบำรุงที่แปลงแล้ว:', repairData);
        importLog.successCount++;
        return repairData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.RepairDate,
            date: record.RepairDate
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    if (repairs.length > 0) {
      await vehicleServices.addRepairVehicleListService(repairs);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'นำเข้าข้อมูลซ่อมบำรุงเรียบร้อยแล้ว',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((repair): repair is NonNullable<typeof repair> => repair !== null)
          .map((repair, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: repair.RepairDate,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลซ่อมบำรุง:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลซ่อมบำรุง'
    });
  }
}

export async function importGasolineCost(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลค่าน้ำมัน:', dataRows);

    const processedDates = new Set<string>();

    const gasolineCosts = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        const gasolineCostData = {
          Status: 'active',
          DateTime: new Date(record.DateTime),
          Item: record.Item,
          Liters: parseFloat(record.Liters) || 0,
          Amount: parseFloat(record.Amount) || 0,
          OdometerStart: parseFloat(record.OdometerStart) || 0,
          OdometerEnd: parseFloat(record.OdometerEnd) || 0,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        /* 
        if (!gasolineCostData.Date || isNaN(gasolineCostData.Date.getTime())) {
          throw new Error('วันที่ไม่ถูกต้อง');
        } */

        if (!gasolineCostData.Item || gasolineCostData.Item.trim() === '') {
          throw new Error('กรุณาระบุรายการ');
        }

        if (gasolineCostData.Liters <= 0) {
          throw new Error('จำนวนลิตรต้องมากกว่า 0');
        }

        if (gasolineCostData.Amount <= 0) {
          throw new Error('จำนวนเงินต้องมากกว่า 0');
        }

        if (gasolineCostData.OdometerStart >= gasolineCostData.OdometerEnd) {
          throw new Error('เลขไมล์เริ่มต้นต้องน้อยกว่าเลขไมล์สิ้นสุด');
        }

        /* const gasolineDate = new Date(record.Date).toISOString().split('T')[0];
        if (processedDates.has(gasolineDate)) {
          throw new Error(`พบวันที่ ${gasolineDate} ซ้ำในไฟล์ CSV`);
        }
        processedDates.add(gasolineDate);

        const existingGasolineCosts = await vehicleServices.getGasolineCostByIdVehicleService(vehicle.VehicleId);
        const isDuplicateDate = existingGasolineCosts.some(gasoline => 
          new Date(gasoline.item).toISOString().split('T')[0] === gasolineDate
        );
        if (isDuplicateDate) {
          throw new Error(`วันที่ ${gasolineDate} มีอยู่ในระบบแล้ว`);
        } */

        console.log('ข้อมูลค่าน้ำมันที่แปลงแล้ว:', gasolineCostData);
        importLog.successCount++;
        return gasolineCostData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.Item,
            date: new Date()
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    if (gasolineCosts.length > 0) {
      await vehicleServices.addGasolineCostListService(gasolineCosts);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'นำเข้าข้อมูลค่าน้ำมันเรียบร้อยแล้ว',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((gasoline): gasoline is NonNullable<typeof gasoline> => gasoline !== null)
          .map((gasoline, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: gasoline.Item,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลค่าน้ำมัน:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลค่าน้ำมัน'
    });
  }
}

export async function importDrainOil(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลเปลี่ยนน้ำมัน:', dataRows);

    const processedDates = new Set<string>();

    const drainOils = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        const drainOilData = {
          Status: 'active',
          Date: new Date(record.Date),
          DueDate: record.DueDate ? new Date(record.DueDate) : null,
          Odometer: record.Odometer ? Number(record.Odometer) : 0,
          TextAlert: record.TextAlert,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (!drainOilData.Date || isNaN(drainOilData.Date.getTime())) {
          throw new Error('วันที่ไม่ถูกต้อง');
        }

        if (!drainOilData.TextAlert || drainOilData.TextAlert.trim() === '') {
          throw new Error('กรุณาระบุข้อความแจ้งเตือน');
        }

        const drainOilDate = new Date(record.Date).toISOString().split('T')[0];
        if (processedDates.has(drainOilDate)) {
          throw new Error(`พบวันที่ ${drainOilDate} ซ้ำในไฟล์ CSV`);
        }
        processedDates.add(drainOilDate);

        const existingDrainOils = await vehicleServices.getDrainTheOilVehicleByIdVehicleService(vehicle.VehicleId);
        const isDuplicateDate = existingDrainOils.some(drainOil =>
          new Date(drainOil.date).toISOString().split('T')[0] === drainOilDate
        );
        if (isDuplicateDate) {
          throw new Error(`วันที่ ${drainOilDate} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลเปลี่ยนน้ำมันที่แปลงแล้ว:', drainOilData);
        importLog.successCount++;
        return drainOilData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.TextAlert,
            date: new Date()
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    if (drainOils.length > 0) {
      await vehicleServices.addDrainTheOilVehicleListService(drainOils);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'นำเข้าข้อมูลเปลี่ยนน้ำมันเรียบร้อยแล้ว',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((drainOil): drainOil is NonNullable<typeof drainOil> => drainOil !== null)
          .map((drainOil, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: drainOil.Date,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลเปลี่ยนน้ำมัน:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลเปลี่ยนน้ำมัน'
    });
  }
}

export async function importInstallments(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลผ่อนชำระ:', dataRows);

    const processedDates = new Set<string>();

    const installments = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {
        const installmentData = {
          Status: 'active',
          InstallmentNumber: parseInt(record.InstallmentNumber),
          DueDate: new Date(record.DueDate),
          Amount: record.Amount ? new Prisma.Decimal(record.Amount) : new Prisma.Decimal(0),
          PaymentEvidence: record.PaymentEvidence || null,
          VehicleId: vehicle.VehicleId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (!installmentData.DueDate || isNaN(installmentData.DueDate.getTime())) {
          throw new Error('วันที่ไม่ถูกต้อง');
        }

        if (!installmentData.Amount || installmentData.Amount.toNumber() <= 0) {
          throw new Error('กรุณาระบุจำนวนเงิน');
        }

        if (isNaN(installmentData.InstallmentNumber)) {
          throw new Error('หมายเลขงวดไม่ถูกต้อง');
        }

        const installmentNumber = record.InstallmentNumber;
        if (processedDates.has(installmentNumber)) {
          throw new Error(`พบวันที่ ${installmentNumber} ซ้ำในไฟล์ CSV`);
        }
        processedDates.add(installmentNumber);

        const existingInstallments = await vehicleServices.getInstallmentsVehicleByIdVehicleService(vehicle.VehicleId);
        const isDuplicate = existingInstallments.some(installment =>
          installment.installmentNumber === installmentNumber
        );
        if (isDuplicate) {
          throw new Error(`งวดที่ ${installmentNumber} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลผ่อนชำระที่แปลงแล้ว:', installmentData);
        importLog.successCount++;
        return installmentData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.installment,
            date: new Date()
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    if (installments.length > 0) {
      await vehicleServices.addInstallmentsVehicleListService(installments);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'นำเข้าข้อมูลผ่อนชำระเรียบร้อยแล้ว',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((installment): installment is NonNullable<typeof installment> => installment !== null)
          .map((installment, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: installment.InstallmentNumber,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลผ่อนชำระ:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลผ่อนชำระ'
    });
  }
}

export async function importIncome(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    if (!req.file) {
      throw new Error('กรุณาอัพโหลดไฟล์ CSV');
    }

    const vehicleId = req.params.id;
    if (!vehicleId) {
      throw new Error('ไม่พบรหัสรถยนต์');
    }

    const vehicle = await vehicleServices.findVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('ไม่พบข้อมูลรถยนต์');
    }

    if (!parsedToken) {
      throw new Error('ไม่พบข้อมูลผู้ใช้');
    }


    const vehicleDrivers = await vehicleServices.getAllVehicleDriver(parsedToken.tenantId || '');
    if (!vehicleDrivers) {
      throw new Error('ไม่พบข้อมูลผู้ขับรถ');
    }

    const paymentStatuses = await vehicleServices.getAllPaymentStatus(parsedToken.tenantId || '');
    if (!paymentStatuses) {
      throw new Error('ไม่พบข้อมูลสถานะการชำระเงิน');
    }

    const importLog = {
      totalRecords: 0,
      successCount: 0,
      errorCount: 0,
      errors: [] as string[],
      importedAt: new Date()
    };

    const records = await readCSVFile(req.file.path);

    // ข้าม header และ description rows
    const dataRows = records.slice(1);
    importLog.totalRecords = dataRows.length;
    console.log('จำนวนรายการข้อมูล:', dataRows.length);
    console.log('ข้อมูลรายได้:', dataRows);

    const processedDates = new Set<string>();

    const incomes = (await Promise.all(dataRows.map(async (record: any, index: number) => {
      try {

        const vehicleDriver = vehicleDrivers.find(d => d.Name === record.VehicleDriver);
        if (!vehicleDriver) {
          throw new Error(`ไม่พบข้อมูลผู้ขับรถ: ${record.VehicleDriver}`);
        }

        const paymentStatus = paymentStatuses.find(p => p.Name === record.StatusPayment);
        if (!paymentStatus) {
          throw new Error(`ไม่พบสถานะการชำระเงิน: ${record.StatusPayment}`);
        }

        const incomeData = {
          Status: 'active',
          ReceiveDate: new Date(record.ReceiveDate) || null,
          CustomerName: record.CustomerName || 'ไม่ระบุ',
          Description: record.Description,
          VehicleId: vehicle.VehicleId,
          DateTime: new Date(record.DateTime),
          Time: record.Time,
          WorkOrderNumber: record.WorkOrderNumber,
          InvoiceNumber: record.InvoiceNumber,
          AmountReceive: parseFloat(record.AmountReceive),
          VehicleDriverId: vehicleDriver.VehicleDriverId,
          PaymentStatusId: paymentStatus.PaymentStatusId,
          CreatedByUsername: parsedToken.username || 'unknown'
        };

        // ตรวจสอบข้อมูล
        if (!incomeData.ReceiveDate || isNaN(incomeData.ReceiveDate.getTime())) {
          throw new Error('วันที่ไม่ถูกต้อง');
        }

        if (isNaN(incomeData.AmountReceive)) {
          throw new Error('จำนวนเงินไม่ถูกต้อง');
        }

        if (!incomeData.Description || incomeData.Description.trim() === '') {
          throw new Error('กรุณาระบุรายละเอียดรายได้');
        }

        const incomeDate = record.ReceiveDate;
        if (processedDates.has(incomeDate)) {
          throw new Error(`พบวันที่ ${incomeDate} ซ้ำในไฟล์ CSV`);
        }
        processedDates.add(incomeDate);

        const existingIncomes = await vehicleServices.getIncomeVehicleByIdVehicleService(vehicle.VehicleId);
        const isDuplicate = existingIncomes.some(income =>
          new Date(income.receiveDate).toISOString() === new Date(incomeDate).toISOString()
        );
        if (isDuplicate) {
          throw new Error(`รายได้วันที่ ${incomeDate} มีอยู่ในระบบแล้ว`);
        }

        console.log('ข้อมูลรายได้ที่แปลงแล้ว:', incomeData);
        importLog.successCount++;
        return incomeData;
      } catch (error: any) {
        console.error(`เกิดข้อผิดพลาดในรายการที่ ${index + 1}:`, error.message || 'ไม่มีข้อมูลข้อผิดพลาด');
        importLog.errorCount++;
        const errorDetails = {
          row: index + 3,
          message: error?.message || 'ไม่มีข้อมูลข้อผิดพลาด',
          vehicle: {
            licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
            text: record.income,
            date: new Date()
          }
        };
        importLog.errors.push(JSON.stringify(errorDetails));
        return null;
      }
    }))).filter((t): t is NonNullable<typeof t> => t !== null);

    if (incomes.length > 0) {
      await vehicleServices.addIncomeVehicleListService(incomes);
    }

    // ลบไฟล์ CSV หลังจากนำเข้าข้อมูลสำเร็จ
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('ลบไฟล์ CSV สำเร็จ');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบไฟล์ CSV:', error);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'นำเข้าข้อมูลรายได้เรียบร้อยแล้ว',
      data: {
        totalRecords: importLog.totalRecords,
        successCount: importLog.successCount,
        errorCount: importLog.errorCount,
        errors: importLog.errors,
        items: dataRows
          .filter((income): income is NonNullable<typeof income> => income !== null)
          .map((income, index) => {
            const rowIndex = index + 3;
            const hasError = importLog.errors.find(error => JSON.parse(error).row === rowIndex);

            return {
              no: rowIndex,
              licensePlate: `${vehicle.LicensePlatePrefix} ${vehicle.LicensePlateSuffix} ${vehicle.LicensePlateProvince}`,
              text: income.Description,
              status: hasError ? JSON.parse(hasError).message : 'นำเข้าสำเร็จ',
              error: hasError ? true : false
            };
          })
      }
    });
  } catch (error: any) {
    console.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูลรายได้:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลรายได้'
    });
  }
}

export async function uploadFile(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'ไม่พบไฟล์' });
    }
    // คืน url แบบ /uploads/xxx/filename
    const url = req.file.path.replace(/^uploads/, '/uploads').replace(/\\/g, '/');
    res.json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteVehicleData(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const { type, id } = req.params

    if (!type || !id) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'กรุณาระบุ type และ id'
      })
    }

    // ตรวจสอบ type ที่อนุญาต
    const allowedTypes = [
      'tax',
      'compulsory-motor-insurance', 
      'insurance-policy',
      'attach-file',
      'car-tires',
      'accident-vehicle',
      'repair-vehicle',
      'gasoline-cost',
      'drain-oil',
      'installments',
      'income'
    ]

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'ประเภทข้อมูลไม่ถูกต้อง'
      })
    }

    console.log('delete data',type, id)

    const result = await vehicleServices.deleteVehicleDataByType(type, id, parsedToken.tenantId, parsedToken.username)

    if (!result) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'ไม่พบข้อมูลที่ต้องการลบ'
      })
    }

    res.json({
      success: true,
      code: 200,
      message: 'ลบข้อมูลสำเร็จ',
      data: result
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    })
  }
}

export async function deleteVehicle(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'กรุณาระบุ id ของ vehicle'
      })
    }

    const result = await vehicleServices.deleteVehicleService(id, parsedToken.tenantId, parsedToken.username)

    if (!result) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'ไม่พบข้อมูล vehicle ที่ต้องการลบ'
      })
    }

    res.json({
      success: true,
      code: 200,
      message: 'ลบข้อมูล vehicle สำเร็จ',
      data: result
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    })
  }
}

export async function getDuplicateVehicles(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const groups = await vehicleServices.findDuplicateVehicles(parsedToken.tenantId)

    res.json({
      success: true,
      code: 200,
      message: `พบกลุ่มข้อมูลซ้ำ ${groups.length} กลุ่ม`,
      data: groups
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    })
  }
}

export async function bulkDeleteVehicles(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const ids = req.body?.ids

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'กรุณาระบุ ids ที่ต้องการลบ'
      })
    }

    const deletedCount = await vehicleServices.bulkSoftDeleteVehicles(ids, parsedToken.tenantId, parsedToken.username)

    res.json({
      success: true,
      code: 200,
      message: `ลบข้อมูลซ้ำ ${deletedCount} รายการสำเร็จ`,
      data: { deletedCount }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    })
  }
}

export async function deleteTypeData(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const { type, id } = req.params

    if (!type || !id) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'กรุณาระบุ type และ id'
      })
    }

    // ตรวจสอบ type ที่อนุญาต
    const allowedTypes = [
      'vehicle-type',
      'vehicle-brand', 
      'fuel-type',
      'vehicle-owner',
      'vehicle-department',
      'vehicle-driver'
    ]

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'ประเภทข้อมูลไม่ถูกต้อง'
      })
    }

    const result = await vehicleServices.deleteTypeDataByType(type, id, parsedToken.tenantId, parsedToken.username)

    if (!result) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'ไม่พบข้อมูลที่ต้องการลบ'
      })
    }

    res.json({
      success: true,
      code: 200,
      message: 'ลบข้อมูลสำเร็จ',
      data: result
    })

  } catch (error: any) {
    res.status(500).json({
      success: false,
      code: 500,
      message: error.message
    })
  }
}

