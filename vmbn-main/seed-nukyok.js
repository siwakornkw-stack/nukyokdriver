// One-off seed: create a Tenant, bind the Vercel host as its domain, and an admin Customer.
// Run with DATABASE_URL pointing at the (direct) Neon connection.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const db = new PrismaClient();

const HOST = 'nukyok.vercel.app';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

async function main() {
  let domain = await db.domainName.findFirst({ where: { HostName: HOST } });
  let tenantId;

  if (domain) {
    tenantId = domain.TenantId;
    console.log('Domain already exists, tenantId =', tenantId);
  } else {
    const tenant = await db.tenant.create({
      data: {
        Name: 'Nukyok',
        Status: 'active',
        SystemExpiredDate: new Date('2099-12-31T00:00:00Z'),
      },
    });
    tenantId = tenant.TenantId;
    await db.domainName.create({
      data: { TenantId: tenantId, HostName: HOST, Type: 'app' },
    });
    console.log('Created tenant', tenantId, 'and domain', HOST);
  }

  const existing = await db.customer.findFirst({
    where: { TenantId: tenantId, Username: ADMIN_USERNAME },
  });
  if (existing) {
    console.log('Admin user already exists:', ADMIN_USERNAME);
  } else {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
    await db.customer.create({
      data: {
        TenantId: tenantId,
        Status: 'active',
        Name: 'Admin',
        Username: ADMIN_USERNAME,
        Password: hash,
        PasswordHash: hash,
        MobileNo: '0000000000',
        LatestIpAddress: '127.0.0.1',
        CreatedByUsername: 'seed',
      },
    });
    console.log('Created admin user:', ADMIN_USERNAME, '/', ADMIN_PASSWORD);
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
