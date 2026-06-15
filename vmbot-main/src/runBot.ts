import { db } from './utils/db.server';
import { getAllCustomerTenant, getAllTenant, sendLineMessage } from './functions/global';
import {
  getCompulsoryMotorInsuranceExpiringIn7Days,
  getDrainTheOilVehicleExpiringIn7Days,
  getInstallmentsVehicleExpiringIn7Days,
  getInsurancePolicyExpiringIn7Days,
  getRepairVehicleExpiringIn7Days,
  getTaxExpiringIn7Days,
  getTaxExpiringAdvance,
  getCompulsoryMotorInsuranceExpiringAdvance,
  getInsurancePolicyExpiringAdvance,
} from './functions/expired';

function formatDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

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

export async function runBot(): Promise<void> {
  try {
    console.log("INFO: START");

    const tenants = await getAllTenant();

    for (const tenant of tenants) {
      const tenantId = tenant.TenantId;

      // ภาษีที่หมดอายุใน 7 วัน
      const taxExpiringIn7Days = await getTaxExpiringIn7Days(tenantId);

      // พรบหมดอายุใน 7 วัน
      const cmInsuranceExpiringIn7Days = await getCompulsoryMotorInsuranceExpiringIn7Days(tenantId);

      // กรมธรรม์หมดอายุใน 7 วัน
      const insurancePolicyExpiringIn7Days = await getInsurancePolicyExpiringIn7Days(tenantId);

      // ซ่อมรับรถใน 7 วัน
      const repairVehicleExpiringIn7Days = await getRepairVehicleExpiringIn7Days(tenantId);

      // ถ่ายน้ำมันใน 7 วัน
      const drainTheOilVehicleExpiringIn7Days = await getDrainTheOilVehicleExpiringIn7Days(tenantId);

      // ค่างวดใน 7 วัน
      const installmentsVehicleExpiringIn7Days = await getInstallmentsVehicleExpiringIn7Days(tenantId);

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
      const vehiclesExpired = Array.from(vehicles.values());
      console.log(vehiclesExpired);
      if (vehiclesExpired.length > 0 && tenant.LineChannelAccessToken !== null) {
        const customers = await getAllCustomerTenant(tenantId);
        if (customers.length > 0) {
          customers.forEach(customer => {
            vehiclesExpired.forEach(vehicle => {
              let message = "******ระบบแจ้งเตือน******\n";
              message += `Vehicle-${vehicle.VehicleNo.toString().padStart(5, '0')}\n`;
              if (vehicle.Tax) message += `ภาษีรถยนต์: หมดอายุ ${vehicle.Tax}\n`;
              if (vehicle.CmInsurance) message += `พรบ: หมดอายุ ${vehicle.CmInsurance}\n`;
              if (vehicle.InsurancePolicy) message += `กรมธรรม์: หมดอายุ ${vehicle.InsurancePolicy}\n`;
              if (vehicle.RepairVehicle) message += `ซ่อมรถยนต์: รับรถ ${vehicle.RepairVehicle}\n`;
              if (vehicle.DrainTheOilVehicle) message += `ถ่ายน้ำมัน: ถึงรอบวันที่ ${vehicle.DrainTheOilVehicle}\n`;
              if (vehicle.InstallmentsVehicle) message += `ค่างวด: หมดอายุ ${vehicle.InstallmentsVehicle}\n`;

              if (customer.LineUserId) {
                console.log(message);
                sendLineMessage(tenant.LineChannelAccessToken!, customer.LineUserId, message);
              }
            });
          });
        }
      }

      // รอบที่ 2: แจ้งล่วงหน้า ภาษี/พรบ/ประกัน ที่จะหมดภายใน 8-30 วัน
      // ส่งสัปดาห์ละครั้ง (วันจันทร์) เพื่อไม่ให้สแปมรายวันตลอด ~23 วันของช่วง advance
      if (new Date().getDay() === 1) {
      const [taxAdvance, cmAdvance, insAdvance] = await Promise.all([
        getTaxExpiringAdvance(tenantId),
        getCompulsoryMotorInsuranceExpiringAdvance(tenantId),
        getInsurancePolicyExpiringAdvance(tenantId),
      ]);
      const advance = new Map<string, { VehicleNo: string; Tax: string | null; CmInsurance: string | null; InsurancePolicy: string | null }>();
      const setAdvance = (vid: string, no: string, field: 'Tax' | 'CmInsurance' | 'InsurancePolicy', endDate: Date) => {
        if (!advance.has(vid)) advance.set(vid, { VehicleNo: no, Tax: null, CmInsurance: null, InsurancePolicy: null });
        advance.get(vid)![field] = formatDate(endDate);
      };
      taxAdvance.forEach(x => setAdvance(x.Vehicle.VehicleId, `${x.Vehicle.No}`, 'Tax', x.EndDate));
      cmAdvance.forEach(x => setAdvance(x.Vehicle.VehicleId, `${x.Vehicle.No}`, 'CmInsurance', x.EndDate));
      insAdvance.forEach(x => setAdvance(x.Vehicle.VehicleId, `${x.Vehicle.No}`, 'InsurancePolicy', x.EndDate));

      const advanceList = Array.from(advance.values());
      if (advanceList.length > 0 && tenant.LineChannelAccessToken !== null) {
        const customers = await getAllCustomerTenant(tenantId);
        customers.forEach(customer => {
          advanceList.forEach(vehicle => {
            let message = "⚠️ แจ้งล่วงหน้า (หมดอายุภายใน 30 วัน)\n";
            message += `Vehicle-${vehicle.VehicleNo.toString().padStart(5, '0')}\n`;
            if (vehicle.Tax) message += `ภาษีรถยนต์: หมดอายุ ${vehicle.Tax}\n`;
            if (vehicle.CmInsurance) message += `พรบ: หมดอายุ ${vehicle.CmInsurance}\n`;
            if (vehicle.InsurancePolicy) message += `กรมธรรม์: หมดอายุ ${vehicle.InsurancePolicy}\n`;
            if (customer.LineUserId) {
              console.log(message);
              sendLineMessage(tenant.LineChannelAccessToken!, customer.LineUserId, message);
            }
          });
        });
      }
      }
    }
  } catch (error: any) {
    console.error("ERROR: catch message: " + error.message);
  } finally {
    console.log("END: finally disconnect Prisma Database.");
    await db.$disconnect();
    if (global.gc) {
      global.gc();
      console.log('INFO: Clear Ram Completed.');
    }
  }
}
