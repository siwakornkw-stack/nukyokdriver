import { db } from '../../utils/db.server'

export type LineRole = 'dispatcher' | 'driver' | 'unknown'

export interface ResolvedLineUser {
  role: LineRole
  name: string | null
  driverId?: string
  customerId?: string
}

// Maps a LINE userId to who they are within a tenant. A driver can only respond
// to jobs; a dispatcher (a LINE-linked Customer) can issue commands. Drivers are
// checked first so a person linked as both is treated as a driver in their chat.
export const resolveLineUser = async (tenantId: string, userId: string | undefined): Promise<ResolvedLineUser> => {
  if (!userId) return { role: 'unknown', name: null }

  const driver = await db.vehicleDriver.findFirst({
    where: { TenantId: tenantId, LineUserId: userId },
    select: { VehicleDriverId: true, Name: true },
  })
  if (driver) return { role: 'driver', name: driver.Name, driverId: driver.VehicleDriverId }

  const customer = await db.customer.findFirst({
    where: { TenantId: tenantId, LineUserId: userId, LinePinVerify: true },
    select: { CustomerId: true, Name: true },
  })
  if (customer) return { role: 'dispatcher', name: customer.Name, customerId: customer.CustomerId }

  return { role: 'unknown', name: null }
}
