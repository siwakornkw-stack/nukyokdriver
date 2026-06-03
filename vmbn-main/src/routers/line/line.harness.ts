/*
 * Offline webhook harness for the LINE dispatch feature.
 *
 * Stubs the Prisma client, Redis client, and global fetch (LINE API) so the real
 * webhook controller + command router can be driven without any infrastructure.
 * Run: npx ts-node src/routers/line/line.harness.ts
 */
import * as crypto from 'node:crypto'
import Module from 'module'

// ---------------------------------------------------------------------------
// In-memory fake Prisma
// ---------------------------------------------------------------------------

type Row = Record<string, any>

function matchWhere(row: Row, where: any): boolean {
  if (!where) return true
  for (const [k, v] of Object.entries<any>(where)) {
    if (k === 'AND') { if (!(v as any[]).every((w) => matchWhere(row, w))) return false; continue }
    if (k === 'OR') { if (!(v as any[]).some((w) => matchWhere(row, w))) return false; continue }
    const cell = row[k]
    if (v === null) { if (cell !== null && cell !== undefined) return false; continue }
    if (v && typeof v === 'object' && !(v instanceof Date)) {
      if ('equals' in v && cell !== v.equals) return false
      if ('not' in v) { if (v.not === null) { if (cell === null || cell === undefined) return false } else if (cell === v.not) return false }
      if ('in' in v && !v.in.includes(cell)) return false
      if ('gte' in v && !(new Date(cell) >= new Date(v.gte))) return false
      if ('lte' in v && !(new Date(cell) <= new Date(v.lte))) return false
    } else if (cell !== v) return false
  }
  return true
}

function applyOrder(rows: Row[], orderBy: any): Row[] {
  if (!orderBy) return rows
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy]
  return [...rows].sort((a, b) => {
    for (const o of orders) {
      const [key, dir] = Object.entries<any>(o)[0]
      const av = a[key], bv = b[key]
      if (av === bv) continue
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      const cmp = av > bv ? 1 : -1
      return dir === 'desc' ? -cmp : cmp
    }
    return 0
  })
}

const store = {
  tenant: [] as Row[],
  customer: [] as Row[],
  vehicleDriver: [] as Row[],
  driverJob: [] as Row[],
  notification: [] as Row[],
  lineWebhook: [] as Row[],
  lineCommand: [] as Row[],
}

function attachDriver(job: Row): Row {
  const d = store.vehicleDriver.find((x) => x.VehicleDriverId === job.VehicleDriverId)
  return { ...job, VehicleDriver: d ? { Name: d.Name, LineUserId: d.LineUserId } : null }
}

function attachTenant(cust: Row): Row {
  const t = store.tenant.find((x) => x.TenantId === cust.TenantId)
  return { ...cust, Tenant: t ? { LineChannelAccessToken: t.LineChannelAccessToken, TenantId: t.TenantId } : null }
}

function model(name: keyof typeof store, relation?: 'driver' | 'tenant') {
  const rows = () => store[name]
  const map = (r: Row) => (relation === 'driver' ? attachDriver(r) : relation === 'tenant' ? attachTenant(r) : r)
  return {
    findFirst: async ({ where, orderBy }: any = {}) => {
      const found = applyOrder(rows().filter((r) => matchWhere(r, where)), orderBy)[0]
      return found ? map(found) : null
    },
    findMany: async ({ where, orderBy, take }: any = {}) => {
      let res = applyOrder(rows().filter((r) => matchWhere(r, where)), orderBy).map(map)
      if (take) res = res.slice(0, take)
      return res
    },
    create: async ({ data }: any) => {
      const idKey = name === 'driverJob' ? 'DriverJobId' : name === 'lineWebhook' ? 'LineWebhookId' : name === 'lineCommand' ? 'LineCommandId' : name === 'notification' ? 'NotificationId' : 'Id'
      const row = { [idKey]: crypto.randomUUID(), CreatedAt: new Date(), ...data }
      rows().push(row)
      return row
    },
    update: async ({ where, data }: any) => {
      const row = rows().find((r) => matchWhere(r, where))
      if (row) Object.assign(row, data)
      return row
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0
      rows().filter((r) => matchWhere(r, where)).forEach((r) => { Object.assign(r, data); count++ })
      return { count }
    },
  }
}

const fakeDb = {
  tenant: model('tenant'),
  customer: model('customer', 'tenant'),
  vehicleDriver: model('vehicleDriver'),
  driverJob: model('driverJob', 'driver'),
  notification: model('notification'),
  lineWebhook: model('lineWebhook'),
  lineCommand: model('lineCommand'),
}

// ---------------------------------------------------------------------------
// In-memory fake Redis
// ---------------------------------------------------------------------------

const kv = new Map<string, string>()
const fakeRedis = {
  isOpen: true,
  connect: async () => {},
  disconnect: async () => {},
  on: () => {},
  set: async (key: string, val: string, opts?: any) => {
    if (opts?.NX && kv.has(key)) return null
    kv.set(key, val)
    return 'OK'
  },
  get: async (key: string) => (kv.has(key) ? kv.get(key)! : null),
  expire: async () => 1,
  del: async (key: string) => { kv.delete(key); return 1 },
}

// ---------------------------------------------------------------------------
// Intercept module resolution + fetch BEFORE importing the controller
// ---------------------------------------------------------------------------

const lineApiCalls: { url: string; body: any }[] = []
;(global as any).fetch = async (url: string, init: any) => {
  lineApiCalls.push({ url, body: JSON.parse(init.body) })
  return { ok: true, status: 200, json: async () => ({}), text: async () => '' }
}

const origLoad = (Module as any)._load
;(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  if (request.endsWith('db.server')) return { __esModule: true, db: fakeDb }
  if (request.endsWith('redisClient')) return { __esModule: true, default: fakeRedis, connectRedis: async () => {}, disconnectRedis: async () => {} }
  return origLoad.apply(this, arguments)
}

// Import AFTER stubs are in place.
const { webhook } = require('./line.controllers')

// ---------------------------------------------------------------------------
// Test scaffolding
// ---------------------------------------------------------------------------

const TENANT = 't1'
const SECRET = 'channel-secret'
const TOKEN = 'channel-token'

function seed() {
  store.tenant.length = 0; store.customer.length = 0; store.vehicleDriver.length = 0
  store.driverJob.length = 0; store.notification.length = 0; store.lineWebhook.length = 0; store.lineCommand.length = 0
  kv.clear(); lineApiCalls.length = 0
  store.tenant.push({ TenantId: TENANT, LineChannelAccessToken: TOKEN, LineChannelSecret: SECRET })
  store.customer.push({ CustomerId: 'c1', TenantId: TENANT, Name: 'แอดมิน', LineUserId: 'U-DISP', LinePinVerify: true, PinLine: null })
  store.customer.push({ CustomerId: 'c2', TenantId: TENANT, Name: 'ผู้รอผูก', LineUserId: null, LinePinVerify: false, PinLine: '1234' })
  store.vehicleDriver.push({ VehicleDriverId: 'd1', TenantId: TENANT, Name: 'สมชาย', Status: 'active', LineUserId: 'U-DRV' })
  store.vehicleDriver.push({ VehicleDriverId: 'd2', TenantId: TENANT, Name: 'สมหญิง', Status: 'active', LineUserId: null })
}

function sign(bodyStr: string): string {
  return crypto.createHmac('sha256', SECRET).update(Buffer.from(bodyStr)).digest('base64')
}

let evtSeq = 0
async function post(events: any[], opts: { badSig?: boolean; reuseEventId?: string } = {}) {
  const body = { destination: 'x', events: events.map((e) => ({ webhookEventId: opts.reuseEventId ?? `evt-${++evtSeq}`, deliveryContext: { isRedelivery: false }, timestamp: Date.now(), mode: 'active', ...e })) }
  const bodyStr = JSON.stringify(body)
  const captured: { statusCode: number; payload: any } = { statusCode: 200, payload: undefined }
  const res: any = {
    status(code: number) { captured.statusCode = code; return this },
    send(p: any) { captured.payload = p; return this },
  }
  const req: any = {
    params: { tenantId: TENANT },
    body,
    rawBody: Buffer.from(bodyStr),
    header: (n: string) => (n.toLowerCase() === 'x-line-signature' ? (opts.badSig ? 'WRONG' : sign(bodyStr)) : undefined),
  }
  await webhook(req, res, (err: any) => { throw err })
  return captured
}

const textEvent = (userId: string, text: string, replyToken = 'rt') => ({ type: 'message', message: { type: 'text', id: 'm', quoteToken: 'q', text }, source: { type: 'user', userId }, replyToken })
const postbackEvent = (userId: string, data: string, params?: any, replyToken = 'rt') => ({ type: 'postback', postback: { data, params }, source: { type: 'user', userId }, replyToken })

const lastReplyText = () => {
  const replies = lineApiCalls.filter((c) => c.url.includes('/reply'))
  const last = replies[replies.length - 1]
  return last?.body?.messages?.[0]?.text ?? ''
}
const lastPush = () => lineApiCalls.filter((c) => c.url.includes('/push')).slice(-1)[0]

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

let pass = 0, fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}  ${detail}`) }
}

async function run() {
  // 1. signature rejection
  seed()
  let r = await post([textEvent('U-DISP', 'ช่วย')], { badSig: true })
  check('invalid signature -> 401', r.statusCode === 401, `got ${r.statusCode}`)

  // 2. dispatcher help
  seed()
  await post([textEvent('U-DISP', 'ช่วย')])
  check('help reply', lastReplyText().includes('คำสั่งสั่งงานผ่าน LINE'), lastReplyText())

  // 3. full guided create-job flow
  seed()
  await post([textEvent('U-DISP', 'งาน')])
  check('flow start lists driver buttons', lastReplyText().includes('เลือกคนขับ'))
  check('flow state stored', !!kv.get(`line:flow:${TENANT}:U-DISP`))

  await post([postbackEvent('U-DISP', 'action=flow_driver&driverId=d1')])
  check('after pick driver -> ask origin', lastReplyText().includes('ต้นทาง'))

  await post([textEvent('U-DISP', 'บางนา')])
  check('after origin -> ask destination', lastReplyText().includes('ปลายทาง'))

  await post([textEvent('U-DISP', 'ลาดพร้าว')])
  check('after destination -> ask schedule', lastReplyText().includes('เวลานัด'))

  await post([postbackEvent('U-DISP', 'action=flow_skip_schedule')])
  check('skip schedule -> confirm summary', lastReplyText().includes('ยืนยันสร้างงาน'))

  await post([postbackEvent('U-DISP', 'action=flow_confirm')])
  check('confirm creates job #1', store.driverJob.length === 1 && store.driverJob[0].JobNo === 1, JSON.stringify(store.driverJob[0]))
  check('confirm pushes flex to driver', !!lastPush() && lastPush().body.to === 'U-DRV')
  check('confirm reply mentions #1', lastReplyText().includes('#1'))
  check('flow state cleared', !kv.get(`line:flow:${TENANT}:U-DISP`))

  // 4. driver accept -> arrived -> done lifecycle
  const jobId = store.driverJob[0].DriverJobId
  await post([postbackEvent('U-DRV', `action=accept&jobId=${jobId}`)])
  check('driver accept -> accepted', store.driverJob[0].Status === 'accepted', store.driverJob[0].Status)

  await post([postbackEvent('U-DRV', 'action=arrived&jobNo=1')])
  check('driver arrived -> arrived', store.driverJob[0].Status === 'arrived', store.driverJob[0].Status)

  await post([postbackEvent('U-DRV', 'action=done&jobNo=1')])
  check('driver done -> done', store.driverJob[0].Status === 'done', store.driverJob[0].Status)

  // 5. stale button after done
  await post([postbackEvent('U-DRV', `action=accept&jobId=${jobId}`)])
  check('stale accept gives feedback', lastReplyText().includes('เสร็จสิ้น'), lastReplyText())

  // 6. status + cancel commands
  seed()
  store.driverJob.push({ DriverJobId: 'j9', TenantId: TENANT, JobNo: 9, VehicleDriverId: 'd1', Origin: 'A', Destination: 'B', ScheduledAt: null, Note: null, Status: 'pending' })
  await post([textEvent('U-DISP', 'สถานะ 9')])
  check('status command', lastReplyText().includes('งาน #9') && lastReplyText().includes('รอตอบรับ'), lastReplyText())

  await post([textEvent('U-DISP', 'ยกเลิก 9')])
  check('cancel sets cancelled', store.driverJob.find((j) => j.JobNo === 9)!.Status === 'cancelled')
  check('cancel notifies driver', !!lastPush() && lastPush().body.to === 'U-DRV')

  // 7. list today
  await post([textEvent('U-DISP', 'งานวันนี้')])
  check('list today replies', lastReplyText().includes('งานวันนี้') || lastReplyText().includes('ไม่มีงาน'))

  // 8. drivers list (shows unlinked marker)
  await post([textEvent('U-DISP', 'คนขับ')])
  check('drivers list marks unlinked', lastReplyText().includes('สมหญิง') && lastReplyText().includes('ยังไม่ผูก LINE'), lastReplyText())

  // 9. dedupe: same webhookEventId processed once
  seed()
  store.driverJob.push({ DriverJobId: 'jd', TenantId: TENANT, JobNo: 5, VehicleDriverId: 'd1', Origin: 'A', Destination: 'B', ScheduledAt: null, Note: null, Status: 'pending' })
  await post([postbackEvent('U-DRV', 'action=accept&jobId=jd')], { reuseEventId: 'dup-1' })
  const afterFirst = store.driverJob.find((j) => j.DriverJobId === 'jd')!.Status
  store.driverJob.find((j) => j.DriverJobId === 'jd')!.Status = 'pending' // reset to detect reprocessing
  await post([postbackEvent('U-DRV', 'action=accept&jobId=jd')], { reuseEventId: 'dup-1' })
  check('dedupe skips redelivered event', afterFirst === 'accepted' && store.driverJob.find((j) => j.DriverJobId === 'jd')!.Status === 'pending')

  // 10. unknown user OTP linking
  seed()
  await post([textEvent('U-NEW', '1234')])
  const linked = store.customer.find((c) => c.CustomerId === 'c2')!
  check('OTP links customer', linked.LineUserId === 'U-NEW' && linked.LinePinVerify === true)
  check('OTP reply success', lastReplyText().includes('ยืนยันการสมัครสมาชิกสำเร็จ'))

  // 11. audit log written for dispatcher commands
  await post([textEvent('U-DISP', 'ช่วย')])
  check('command audit logged', store.lineCommand.some((c) => c.Role === 'dispatcher' && c.ParsedAction === 'help'))

  console.log(`\n${pass} passed, ${fail} failed`)
  ;(Module as any)._load = origLoad
  process.exit(fail === 0 ? 0 : 1)
}

run().catch((e) => { console.error(e); process.exit(1) })
