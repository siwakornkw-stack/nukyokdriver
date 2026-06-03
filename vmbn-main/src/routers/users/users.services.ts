import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'
import type { Customer, Prisma } from '@prisma/client'
import { UpdateUserLogin } from '../../typings/user'

export function findUserByUsername(TenantId: string, Username: string) {
  return db.customer.findFirst({
    where: {
      AND: [
        {
          TenantId: TenantId,
        },
        {
          Username: Username,
        },
      ],
    }
  })
}

export function createUser(Customer: Prisma.CustomerCreateInput) {
  Customer.PasswordHash = bcrypt.hashSync(Customer.Password, 12)
  return db.customer.create({
    data: Customer,
  })
}

export function updateUserLogin(data: UpdateUserLogin) {
  const dateNow = new Date();
  return db.customer.update({
    data: {
      IsOnline: true,
      LatestOnline: dateNow,
      LatestLogin: dateNow,
      LatestIpAddress: data.LatestIpAddress,
    },
    where: {
      CustomerId: data.CustomerId
    }
  });
}
export function findUserById(CustomerId: Customer['CustomerId']) {
  return db.customer.findFirst({
    where: {
      CustomerId,
    },
  })
}
export function findUserByIdMVC(CustomerId: Customer['CustomerId']) {
  return db.customer.findFirst({
    where: {
      CustomerId,
    },
    select: {
      CustomerId: true,
      TenantId: true,
      ImageUrl: true,
      Name: true,
      Username: true,
      MobileNo: true,
      LineId: true,
      Email: true,
      Role: true,
    }
  })
}

export function checkLineService({ TenantId, CustomerId }: { TenantId: string, CustomerId: string }) {
  return db.customer.findFirst({
    where: {
      TenantId: TenantId,
      CustomerId: CustomerId
    },
    include: {
      Tenant: {
        select: {
          LineImgUrl: true
        }
      }
    }
  })
}

export function updateUserService(data: Prisma.CustomerUpdateInput, CustomerId: string, TenantId: string) {
  return db.customer.update({
    data: data,
    where: {
      CustomerId: CustomerId,
      TenantId: TenantId
    }
  })
}

export function updatePasswordService(CustomerId: string, TenantId: string, newPassword: string) {
  const hashedPassword = bcrypt.hashSync(newPassword, 12)
  return db.customer.update({
    data: {
      PasswordHash: hashedPassword
    },
    where: {
      CustomerId: CustomerId,
      TenantId: TenantId
    }
  })
}

export const USER_ROLES = ['admin', 'staff', 'viewer'] as const
export type UserRole = (typeof USER_ROLES)[number]

export function listUsersService(TenantId: string) {
  return db.customer.findMany({
    where: {
      TenantId: TenantId,
      Status: { not: 'delete' }
    },
    orderBy: { CreatedTime: 'asc' },
    select: {
      CustomerId: true,
      Name: true,
      Username: true,
      Email: true,
      MobileNo: true,
      Role: true,
      Status: true,
      ImageUrl: true,
      LatestLogin: true,
      CreatedTime: true
    }
  })
}

export async function createManagedUser(
  TenantId: string,
  input: { name?: string; username: string; password: string; mobileNo: string; email?: string; role: string },
  createdByUsername: string
) {
  const existing = await findUserByUsername(TenantId, input.username)
  if (existing) throw new Error('username นี้ถูกใช้แล้ว')

  const passwordHash = bcrypt.hashSync(input.password, 12)
  return db.customer.create({
    data: {
      Tenant: { connect: { TenantId } },
      Status: 'active',
      Role: input.role,
      Name: input.name,
      Username: input.username,
      Password: passwordHash,
      PasswordHash: passwordHash,
      MobileNo: input.mobileNo,
      Email: input.email,
      LatestIpAddress: '0.0.0.0',
      CreatedByUsername: createdByUsername
    },
    select: {
      CustomerId: true,
      Name: true,
      Username: true,
      Email: true,
      MobileNo: true,
      Role: true,
      Status: true
    }
  })
}

export function updateUserRoleService(CustomerId: string, TenantId: string, role: string, updatedByUsername: string) {
  return db.customer.update({
    where: { CustomerId, TenantId },
    data: { Role: role, UpdatedByUsername: updatedByUsername },
    select: { CustomerId: true, Username: true, Role: true }
  })
}

export function deactivateUserService(CustomerId: string, TenantId: string, updatedByUsername: string) {
  return db.customer.update({
    where: { CustomerId, TenantId },
    data: { Status: 'delete', DeletedByUsername: updatedByUsername, DeletedTime: new Date() },
    select: { CustomerId: true, Status: true }
  })
}

export function verifyPasswordService(CustomerId: string, TenantId: string, password: string) {
  return db.customer.findFirst({
    where: {
      CustomerId: CustomerId,
      TenantId: TenantId
    },
    select: {
      PasswordHash: true
    }
  }).then(user => {
    if (!user) return false
    return bcrypt.compareSync(password, user.PasswordHash)
  })
}
