// One-off: mark the admin Customer as LINE-linked so the dashboard's
// "link your LINE" modal (which needs a tenant LINE OA) stops appearing.
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.customer
  .updateMany({ where: { Username: 'admin' }, data: { LineUserId: 'manual-linked', LinePinVerify: true } })
  .then((r) => { console.log('updated count:', r.count); return db.$disconnect(); })
  .catch(async (e) => { console.error(e.message); await db.$disconnect(); process.exit(1); });
