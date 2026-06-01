import * as bcrypt from 'bcrypt'
import { db } from '../../utils/db.server'
import type { Customer, Prisma } from '@prisma/client'
import { Request } from 'express';

export async function getTenantId(req: Request) {
  const headers = req.headers as unknown as { [key: string]: string | undefined };
  const domain = headers['x-domain'] || headers['host'];
  console.log(domain);
  const tenant = await db.domainName.findFirst({
    where: {
          HostName: domain
    },
    select:{
      TenantId: true
    }
  });
  return tenant?.TenantId || undefined
}
export function createUser(Customer: Prisma.CustomerCreateInput) {
  Customer.Password = bcrypt.hashSync(Customer.Password, 12)
  return db.customer.create({
    data: Customer,
  })
}

export async function getTenant(tenantId: string) {
  const tenant = await db.tenant.findFirst({
    where: {
          TenantId: tenantId
    }
  });
  return tenant || undefined
}

export function findUserById(CustomerId: Customer['CustomerId']) {
  return db.customer.findUnique({
    where: {
      CustomerId,
    },
  })
}