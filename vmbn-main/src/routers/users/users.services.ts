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
      RefreshTokens: {
        connect: {
          RefreshTokenId: data.RefreshTokensId
        }
      },
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
