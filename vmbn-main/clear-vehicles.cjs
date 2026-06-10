// One-time prod cleanup: delete ALL vehicles + their child rows for a tenant.
// DRY-RUN by default. Pass CONFIRM=yes to actually delete.
// DATABASE_URL is read from the prod env file (not committed).
const fs = require('fs');

const ENV_FILE = process.env.ENV_FILE || 'C:/Users/Atlast/AppData/Local/Temp/prod.env';
const HOST = process.env.HOST || 'nukyok.vercel.app';
const CONFIRM = process.env.CONFIRM === 'yes';

const envText = fs.readFileSync(ENV_FILE, 'utf8');
const m = envText.match(/DATABASE_URL\s*=\s*"?([^"\n\r]+)/);
if (!m) { console.error('DATABASE_URL not found in', ENV_FILE); process.exit(1); }
process.env.DATABASE_URL = m[1].trim();

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Child tables that reference Vehicle via VehicleId. Must be deleted before vehicles.
const CHILDREN = [
  'tax', 'compulsoryMotorInsuranceVehicle', 'insurancePolicyVehicle',
  'attachFileVehicle', 'carTires', 'accidentVehicle', 'repairVehicle',
  'gasolineCost', 'drainTheOilVehicle', 'installmentsVehicle',
  'imageVehicle', 'incomeVehicle',
];

(async () => {
  const dom = await db.domainName.findFirst({ where: { HostName: HOST }, select: { TenantId: true } });
  if (!dom) { console.error('No tenant for host', HOST); process.exit(1); }
  const tenantId = dom.TenantId;
  const tenant = await db.tenant.findUnique({ where: { TenantId: tenantId }, select: { Name: true } });
  console.log(`Tenant: ${tenant?.Name} (${tenantId}) via host ${HOST}`);

  const vehicles = await db.vehicle.findMany({ where: { TenantId: tenantId }, select: { VehicleId: true } });
  const ids = vehicles.map((v) => v.VehicleId);
  console.log(`Vehicles: ${ids.length}`);
  if (ids.length === 0) { console.log('Nothing to delete.'); await db.$disconnect(); return; }

  console.log('--- child row counts ---');
  let totalChildren = 0;
  for (const model of CHILDREN) {
    const c = await db[model].count({ where: { VehicleId: { in: ids } } });
    totalChildren += c;
    console.log(`  ${model}: ${c}`);
  }
  console.log(`Total child rows: ${totalChildren}`);

  if (!CONFIRM) {
    console.log('\nDRY-RUN. No data deleted. Re-run with CONFIRM=yes to delete.');
    await db.$disconnect();
    return;
  }

  console.log('\nDeleting (children first, then vehicles) in a transaction...');
  const ops = CHILDREN.map((model) => db[model].deleteMany({ where: { VehicleId: { in: ids } } }));
  ops.push(db.vehicle.deleteMany({ where: { TenantId: tenantId } }));
  const results = await db.$transaction(ops);
  CHILDREN.forEach((model, i) => console.log(`  deleted ${model}: ${results[i].count}`));
  console.log(`  deleted vehicle: ${results[results.length - 1].count}`);
  console.log('Done.');
  await db.$disconnect();
})().catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
