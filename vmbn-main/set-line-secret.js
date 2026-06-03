// Set the LINE Channel Secret (and optionally Channel Access Token) for a tenant.
// The webhook verifies x-line-signature using this secret, so it must match the
// value from LINE Developers Console > Channel > Basic settings > Channel secret.
//
// Run against the SAME DATABASE_URL the backend uses (prod = the Neon/Vercel one):
//   node set-line-secret.js <channelSecret>
//   node set-line-secret.js <channelSecret> --tenant "<TenantName or TenantId>"
//   node set-line-secret.js <channelSecret> --token <channelAccessToken>
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const secret = process.argv[2];
  if (!secret || secret.startsWith('--')) {
    console.error('Usage: node set-line-secret.js <channelSecret> [--tenant <name|id>] [--token <accessToken>]');
    process.exit(1);
  }
  const tenantArg = arg('--tenant');
  const token = arg('--token');

  let tenant;
  if (tenantArg) {
    tenant = await db.tenant.findFirst({ where: { OR: [{ TenantId: tenantArg }, { Name: tenantArg }] } });
    if (!tenant) { console.error('Tenant not found:', tenantArg); process.exit(1); }
  } else {
    const all = await db.tenant.findMany({ select: { TenantId: true, Name: true } });
    if (all.length === 0) { console.error('No tenants in database'); process.exit(1); }
    if (all.length > 1) {
      console.error('Multiple tenants found, pass --tenant <name|id>:');
      all.forEach((t) => console.error(`  - ${t.Name} (${t.TenantId})`));
      process.exit(1);
    }
    tenant = all[0];
  }

  const data = { LineChannelSecret: secret };
  if (token) data.LineChannelAccessToken = token;

  await db.tenant.update({ where: { TenantId: tenant.TenantId }, data });
  console.log(`Updated tenant "${tenant.Name}" (${tenant.TenantId})`);
  console.log(`  LineChannelSecret set (len ${secret.length})`);
  if (token) console.log(`  LineChannelAccessToken set (len ${token.length})`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1); });
