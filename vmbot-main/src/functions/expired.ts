import { db } from '../utils/db.server';

/*Expired Date*/
export async function getTaxExpiringIn7Days(TenantId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59, 999)

  return await db.tax.findMany({
    where: {
      Status: 'active',
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: {
        gte: today,
        lte: in7Days
      }
    },
    include: {
      Vehicle: true
    }
  })
}
// ดึงรายการภาษีที่หมดอายุในเดือนถัดไป
export async function getTaxExpiringNextMonth(TenantId: string) {
  const today = new Date()
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  return await db.tax.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: {
        gte: startOfNextMonth,
        lte: endOfNextMonth
      }
    },
    include: {
      Vehicle: true
    }
  })
}
// ดึงรายการภาษีที่หมดอายุแล้ว
export async function getExpiredTax(TenantId: string) {
  const today = new Date()

  return await db.tax.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: {
        lt: today
      }
    },
    include: {
      Vehicle: true
    }
  })
}

// --- แจ้งล่วงหน้า: หมดอายุภายใน 8-30 วัน (ไม่ทับ window 7 วัน) สำหรับ ภาษี/พรบ/ประกัน ---
function advanceWindow() {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59, 999)
  const in30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30, 23, 59, 59, 999)
  return { in7, in30 }
}
export async function getTaxExpiringAdvance(TenantId: string) {
  const { in7, in30 } = advanceWindow()
  return await db.tax.findMany({
    where: { Status: 'active', Vehicle: { TenantId: TenantId }, EndDate: { gt: in7, lte: in30 } },
    include: { Vehicle: true }
  })
}
export async function getCompulsoryMotorInsuranceExpiringAdvance(TenantId: string) {
  const { in7, in30 } = advanceWindow()
  return await db.compulsoryMotorInsuranceVehicle.findMany({
    where: { Status: 'active', Vehicle: { TenantId: TenantId }, EndDate: { gt: in7, lte: in30 } },
    include: { Vehicle: true }
  })
}
export async function getInsurancePolicyExpiringAdvance(TenantId: string) {
  const { in7, in30 } = advanceWindow()
  return await db.insurancePolicyVehicle.findMany({
    where: { Status: 'active', Vehicle: { TenantId: TenantId }, EndDate: { gt: in7, lte: in30 } },
    include: { Vehicle: true }
  })
}

export async function getCompulsoryMotorInsuranceExpiringIn7Days(TenantId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59, 999)

  return await db.compulsoryMotorInsuranceVehicle.findMany({
    where: {
      Status: 'active',
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: {
        gte: today,
        lte: in7Days
      }
    },
    include: {
      Vehicle: true
    }
  })
}
// พรบหมดอายุในเดือนถัดไป
export async function getCompulsoryMotorInsuranceExpiringNextMonth(TenantId: string) {
  const today = new Date()
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  return await db.compulsoryMotorInsuranceVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: {
        gte: startOfNextMonth,
        lte: endOfNextMonth
      }
    },
    include: {
      Vehicle: true
    }
  })
}
// พรบหมดอายุแล้ว
export async function getExpiredCompulsoryMotorInsurance(TenantId: string) {
  const today = new Date()

  return await db.compulsoryMotorInsuranceVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: { lt: today }
    },
    include: {
      Vehicle: true
    }
  })
}

export async function getInsurancePolicyExpiringIn7Days(TenantId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59, 59, 999)

  return await db.insurancePolicyVehicle.findMany({
    where: {
      Status: 'active',
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: {
        gte: today,
        lte: in7Days
      }
    },
    include: {
      Vehicle: true
    }
  })
}
// กรมธรรม์หมดอายุในเดือนถัดไป
export async function getInsurancePolicyExpiringNextMonth(TenantId: string) {
  const today = new Date()
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  return await db.insurancePolicyVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: { gte: startOfNextMonth, lte: endOfNextMonth }
    },
    include: {
      Vehicle: true
    }
  })
}
// กรมธรรม์หมดอายุแล้ว
export async function getExpiredInsurancePolicy(TenantId: string) {
  const today = new Date()

  return await db.insurancePolicyVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      EndDate: { lt: today }
    },
    include: {
      Vehicle: true
    }
  })
}

export async function getRepairVehicleExpiringIn7Days(TenantId: string) {
  const today = new Date()
  const in7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

  return await db.repairVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      ReceiveDate: { gte: today, lte: in7Days }
    },
    include: {
      Vehicle: true
    }
  })
}
// ซ่อม รับรถในสัปดาหน้า
export async function getRepairVehicleExpiringNextWeek(TenantId: string) {
  const today = new Date()
  const startOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const endOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)

  return await db.repairVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      ReceiveDate: { gte: startOfNextWeek, lte: endOfNextWeek }
    },
    include: {
      Vehicle: true
    }
  })
}
// ซ่อม รับรถแล้ว
export async function getExpiredRepairVehicle(TenantId: string) {
  const today = new Date()

  return await db.repairVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      ReceiveDate: { lt: today }
    },
    include: {
      Vehicle: true
    }
  })
}

export async function getDrainTheOilVehicleExpiringIn7Days(TenantId: string) {
  const today = new Date()
  const in7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

  return await db.drainTheOilVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      Date: { gte: today, lte: in7Days }
    },
    include: {
      Vehicle: true
    }
  })
}
// ถ่ายน้ำมันในสัปดาหน้า
export async function getDrainTheOilVehicleExpiringNextWeek(TenantId: string) {
  const today = new Date()
  const startOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const endOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)

  return await db.drainTheOilVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      Date: { gte: startOfNextWeek, lte: endOfNextWeek }
    },
    include: {
      Vehicle: true
    }
  })
}
// ถ่ายน้ำมันแล้ว
export async function getExpiredDrainTheOilVehicle(TenantId: string) {
  const today = new Date()

  return await db.drainTheOilVehicle.findMany({
    where: {
      Vehicle: {
        TenantId: TenantId
      },
      Date: { lt: today }
    },
    include: {
      Vehicle: true
    }
  })
}

// ค่างวด
export async function getInstallmentsVehicleExpiringIn7Days(TenantId: string) {
  const today = new Date()
  const in7Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

  return await db.installmentsVehicle.findMany({
    where: {
      Status: 'active',
      DatePay: null,
      Vehicle: {
        TenantId: TenantId
      },
      DueDate: { gte: today, lte: in7Days }
    },
    include: {
      Vehicle: true
    }
  })
}
export async function getInstallmentsVehicleExpiringNextWeek(TenantId: string) {
  const today = new Date()
  const startOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const endOfNextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)

  return await db.installmentsVehicle.findMany({
    where: {
      Status: 'active',
      DatePay: null,
      Vehicle: {
        TenantId: TenantId
      },
      DueDate: { gte: startOfNextWeek, lte: endOfNextWeek }
    },
    include: {
      Vehicle: true
    }
  })
}
// ค่างวดแล้ว (เฉพาะที่ยังไม่ชำระ — DatePay = null)
export async function getExpiredInstallmentsVehicle(TenantId: string) {
  const today = new Date()

  return await db.installmentsVehicle.findMany({
    where: {
      Status: 'active',
      DatePay: null,
      Vehicle: {
        TenantId: TenantId
      },
      DueDate: { lt: today }
    },
    include: {
      Vehicle: true
    }
  })
}