import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'
import type { Admin, Customer, Prisma } from '@prisma/client'
import { UpdateUserLoginAdmin } from '../../typings/user'

export function findUserAdminByUsername(TenantId:string, Username: string) {
  return db.admin.findFirst({
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

export function createUserAdmin(Admin: Prisma.AdminCreateInput) {
  Admin.PasswordHash = bcrypt.hashSync(Admin.Password, 12)
  return db.admin.create({
    data: Admin,
  })
}

export function updateUserLoginAdmin(data: UpdateUserLoginAdmin) {
  const dateNow = new Date();
  return db.admin.update({
    data: {
      RefreshTokensAdmin: {
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
      AdminId: data.AdminId
    }
  });
}
export function findUserAdminById(AdminId: Admin['AdminId']) {
  return db.admin.findFirst({
    where: {
      AdminId,
    },
  })
}
export function findUserAdminByIdMVC(AdminId: Admin['AdminId']) {
  return db.admin.findFirst({
    where: {
      AdminId,
    },
    select: {
      AdminId: true,
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