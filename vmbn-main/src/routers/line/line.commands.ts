import { db } from '../../utils/db.server'
import { getCache, setCache } from '../../utils/redis'
import redis, { connectRedis } from '../../utils/redisClient'
import { replyMessage, pushMessage } from './line.services'
import * as DriverJobService from '../driverjob/driverjob.services'

// --- Conversation state (guided create-job flow) -------------------------------

type FlowStep = 'driver' | 'origin' | 'destination' | 'schedule' | 'confirm'

interface FlowDraft {
  driverId?: string
  driverName?: string
  origin?: string
  destination?: string
  scheduledAt?: string | null
  note?: string | null
}

interface FlowState {
  step: FlowStep
  draft: FlowDraft
}

const FLOW_TTL = 600 // seconds; an abandoned flow expires on its own
const flowKey = (tenantId: string, userId: string) => `line:flow:${tenantId}:${userId}`

async function getFlow(tenantId: string, userId: string): Promise<FlowState | null> {
  const raw = await getCache(flowKey(tenantId, userId))
  if (!raw) return null
  try { return JSON.parse(raw) as FlowState } catch { return null }
}

async function setFlow(tenantId: string, userId: string, state: FlowState) {
  await setCache(flowKey(tenantId, userId), JSON.stringify(state), FLOW_TTL)
}

async function clearFlow(tenantId: string, userId: string) {
  try { await connectRedis(); await redis.del(flowKey(tenantId, userId)) } catch { /* best effort */ }
}

// --- Dispatcher context --------------------------------------------------------

export interface DispatcherCtx {
  tenantId: string
  userId: string
  replyToken: string | undefined
  channelAccessToken: string | null
  customerId?: string
  name: string | null
}

async function reply(ctx: DispatcherCtx, text: string, quickReply?: any) {
  if (!ctx.channelAccessToken || !ctx.replyToken) return
  const msg: any = { type: 'text', text }
  if (quickReply) msg.quickReply = quickReply
  await replyMessage(ctx.channelAccessToken, ctx.replyToken, [msg])
}

function fmtThai(d: Date | null): string {
  if (!d) return '-'
  return d.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

const HELP = [
  'คำสั่งสั่งงานผ่าน LINE',
  '• งาน — สร้างงานใหม่ (เลือกทีละขั้น)',
  '• งานวันนี้ — ดูงานที่ค้าง/วันนี้',
  '• คนขับ — รายชื่อคนขับ',
  '• สถานะ <เลขงาน> — ดูสถานะงาน',
  '• ยกเลิก <เลขงาน> — ยกเลิกงาน',
  '• ช่วย — แสดงเมนูนี้',
].join('\n')

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอตอบรับ', accepted: 'รับงานแล้ว', arrived: 'ถึงจุดหมาย',
  rejected: 'ปฏิเสธ', cancelled: 'ยกเลิก', done: 'เสร็จสิ้น',
}

// --- Guided flow ---------------------------------------------------------------

async function startFlow(ctx: DispatcherCtx) {
  const drivers = await DriverJobService.getDriversWithLine(ctx.tenantId)
  if (drivers.length === 0) {
    await reply(ctx, 'ยังไม่มีคนขับในระบบ เพิ่มคนขับก่อนจึงจะสั่งงานได้')
    return
  }
  await setFlow(ctx.tenantId, ctx.userId, { step: 'driver', draft: {} })

  // LINE quick reply allows at most 13 items.
  const items = drivers.slice(0, 13).map((d) => ({
    type: 'action',
    action: { type: 'postback', label: (d.Name || 'คนขับ').slice(0, 20), data: `action=flow_driver&driverId=${d.VehicleDriverId}`, displayText: `เลือก ${d.Name}` },
  }))
  await reply(ctx, 'สร้างงานใหม่: เลือกคนขับ', { items })
}

async function flowPickDriver(ctx: DispatcherCtx, driverId: string) {
  const state = await getFlow(ctx.tenantId, ctx.userId)
  if (!state) { await reply(ctx, 'หมดเวลาทำรายการ พิมพ์ "งาน" เพื่อเริ่มใหม่'); return }
  const driver = await db.vehicleDriver.findFirst({ where: { TenantId: ctx.tenantId, VehicleDriverId: driverId }, select: { Name: true } })
  if (!driver) { await reply(ctx, 'ไม่พบคนขับ พิมพ์ "งาน" เพื่อเริ่มใหม่'); await clearFlow(ctx.tenantId, ctx.userId); return }
  state.step = 'origin'
  state.draft.driverId = driverId
  state.draft.driverName = driver.Name
  await setFlow(ctx.tenantId, ctx.userId, state)
  await reply(ctx, `คนขับ: ${driver.Name}\nพิมพ์ "ต้นทาง"`)
}

async function flowText(ctx: DispatcherCtx, state: FlowState, text: string): Promise<boolean> {
  if (state.step === 'origin') {
    state.draft.origin = text
    state.step = 'destination'
    await setFlow(ctx.tenantId, ctx.userId, state)
    await reply(ctx, 'พิมพ์ "ปลายทาง"')
    return true
  }
  if (state.step === 'destination') {
    state.draft.destination = text
    state.step = 'schedule'
    await setFlow(ctx.tenantId, ctx.userId, state)
    await reply(ctx, 'เลือกเวลานัด หรือกด "ไม่ระบุเวลา"', {
      items: [
        { type: 'action', action: { type: 'datetimepicker', label: 'เลือกเวลา', data: 'action=flow_schedule', mode: 'datetime' } },
        { type: 'action', action: { type: 'postback', label: 'ไม่ระบุเวลา', data: 'action=flow_skip_schedule', displayText: 'ไม่ระบุเวลา' } },
      ],
    })
    return true
  }
  return false
}

async function flowSetSchedule(ctx: DispatcherCtx, datetime: string | null) {
  const state = await getFlow(ctx.tenantId, ctx.userId)
  if (!state) { await reply(ctx, 'หมดเวลาทำรายการ พิมพ์ "งาน" เพื่อเริ่มใหม่'); return }
  state.draft.scheduledAt = datetime
  state.step = 'confirm'
  await setFlow(ctx.tenantId, ctx.userId, state)
  await showConfirm(ctx, state)
}

async function showConfirm(ctx: DispatcherCtx, state: FlowState) {
  const d = state.draft
  const when = d.scheduledAt ? fmtThai(new Date(d.scheduledAt)) : 'ไม่ระบุ'
  const summary = [
    'ยืนยันสร้างงาน',
    `คนขับ: ${d.driverName}`,
    `ต้นทาง: ${d.origin}`,
    `ปลายทาง: ${d.destination}`,
    `เวลา: ${when}`,
  ].join('\n')
  await reply(ctx, summary, {
    items: [
      { type: 'action', action: { type: 'postback', label: 'ยืนยัน', data: 'action=flow_confirm', displayText: 'ยืนยันสร้างงาน' } },
      { type: 'action', action: { type: 'postback', label: 'ยกเลิก', data: 'action=flow_cancel', displayText: 'ยกเลิก' } },
    ],
  })
}

async function flowConfirm(ctx: DispatcherCtx) {
  const state = await getFlow(ctx.tenantId, ctx.userId)
  if (!state || !state.draft.driverId || !state.draft.origin || !state.draft.destination) {
    await reply(ctx, 'ข้อมูลไม่ครบ พิมพ์ "งาน" เพื่อเริ่มใหม่')
    await clearFlow(ctx.tenantId, ctx.userId)
    return
  }
  await clearFlow(ctx.tenantId, ctx.userId)
  const { job, pushed, pushError } = await DriverJobService.createJob(ctx.tenantId, ctx.name || 'line-dispatcher', {
    VehicleDriverId: state.draft.driverId,
    Origin: state.draft.origin,
    Destination: state.draft.destination,
    ScheduledAt: state.draft.scheduledAt || null,
    Note: state.draft.note || null,
  })
  const head = `สร้างงาน #${job.JobNo} ให้ ${state.draft.driverName} แล้ว`
  await reply(ctx, pushed ? `${head}\nส่งแจ้งเตือนไปยังคนขับเรียบร้อย` : `${head}\n(ส่ง LINE ไม่ได้: ${pushError})`)
}

// --- Read commands -------------------------------------------------------------

async function cmdListToday(ctx: DispatcherCtx) {
  const jobs = await DriverJobService.listJobsToday(ctx.tenantId)
  if (jobs.length === 0) { await reply(ctx, 'ไม่มีงานวันนี้'); return }
  const lines = jobs.map((j) => `#${j.JobNo ?? '-'} ${j.VehicleDriver?.Name ?? ''} ${j.Origin}→${j.Destination} [${STATUS_LABEL[j.Status] ?? j.Status}]`)
  await reply(ctx, ['งานวันนี้/ค้าง', ...lines].join('\n'))
}

async function cmdListDrivers(ctx: DispatcherCtx) {
  const drivers = await DriverJobService.getDriversWithLine(ctx.tenantId)
  if (drivers.length === 0) { await reply(ctx, 'ยังไม่มีคนขับ'); return }
  const lines = drivers.map((d) => `• ${d.Name}${d.LineUserId ? '' : ' (ยังไม่ผูก LINE)'}`)
  await reply(ctx, ['คนขับ', ...lines].join('\n'))
}

async function cmdStatus(ctx: DispatcherCtx, jobNo: number) {
  const job = await DriverJobService.findJobByNo(ctx.tenantId, jobNo)
  if (!job) { await reply(ctx, `ไม่พบงาน #${jobNo}`); return }
  await reply(ctx, [
    `งาน #${job.JobNo}`,
    `คนขับ: ${job.VehicleDriver?.Name ?? '-'}`,
    `${job.Origin} → ${job.Destination}`,
    `เวลา: ${fmtThai(job.ScheduledAt)}`,
    `สถานะ: ${STATUS_LABEL[job.Status] ?? job.Status}`,
  ].join('\n'))
}

async function cmdCancel(ctx: DispatcherCtx, jobNo: number) {
  const job = await DriverJobService.findJobByNo(ctx.tenantId, jobNo)
  if (!job) { await reply(ctx, `ไม่พบงาน #${jobNo}`); return }
  if (['cancelled', 'done', 'rejected'].includes(job.Status)) { await reply(ctx, `งาน #${jobNo} อยู่ในสถานะ ${STATUS_LABEL[job.Status] ?? job.Status} ยกเลิกไม่ได้`); return }
  await DriverJobService.cancelJob(ctx.tenantId, job.DriverJobId)
  await reply(ctx, `ยกเลิกงาน #${jobNo} แล้ว`)
  // Best-effort notify the driver of the cancellation.
  if (ctx.channelAccessToken && job.VehicleDriver?.LineUserId) {
    try {
      await pushMessage(ctx.channelAccessToken, job.VehicleDriver.LineUserId, [{ type: 'text', text: `งาน #${jobNo} (${job.Origin}→${job.Destination}) ถูกยกเลิก` }])
    } catch { /* ignore push failure */ }
  }
}

// --- Entry points (called from controller) -------------------------------------

// Returns the parsed action string for audit logging.
export async function handleDispatcherText(ctx: DispatcherCtx, text: string): Promise<string> {
  const trimmed = text.trim()

  // An in-progress flow consumes free-text steps before keyword matching.
  const state = await getFlow(ctx.tenantId, ctx.userId)
  if (state) {
    if (/^(ยกเลิก|cancel)$/i.test(trimmed)) {
      await clearFlow(ctx.tenantId, ctx.userId)
      await reply(ctx, 'ยกเลิกการสร้างงานแล้ว')
      return 'flow_abort'
    }
    const handled = await flowText(ctx, state, trimmed)
    if (handled) return `flow_${state.step}`
    // Steps awaiting a button (driver/schedule/confirm): nudge the user.
    await reply(ctx, 'กรุณาเลือกจากปุ่มด้านล่าง หรือพิมพ์ "ยกเลิก" เพื่อเริ่มใหม่')
    return 'flow_wait_button'
  }

  if (/^(งาน|\/job|สั่งงาน)$/i.test(trimmed)) { await startFlow(ctx); return 'start_flow' }
  if (/^(งานวันนี้|งานค้าง)$/i.test(trimmed)) { await cmdListToday(ctx); return 'list_today' }
  if (/^(คนขับ|drivers?)$/i.test(trimmed)) { await cmdListDrivers(ctx); return 'list_drivers' }
  if (/^(ช่วย|help|เมนู|menu)$/i.test(trimmed)) { await reply(ctx, HELP); return 'help' }

  const statusM = trimmed.match(/^สถานะ\s*#?(\d+)$/)
  if (statusM) { await cmdStatus(ctx, parseInt(statusM[1], 10)); return 'status' }
  const cancelM = trimmed.match(/^ยกเลิก\s*#?(\d+)$/)
  if (cancelM) { await cmdCancel(ctx, parseInt(cancelM[1], 10)); return 'cancel' }

  await reply(ctx, `ไม่เข้าใจคำสั่ง\n\n${HELP}`)
  return 'unknown'
}

export async function handleDispatcherPostback(ctx: DispatcherCtx, data: string, params: Record<string, string> | undefined): Promise<string> {
  const p = new URLSearchParams(data)
  const action = p.get('action')
  switch (action) {
    case 'flow_driver': { const id = p.get('driverId'); if (id) await flowPickDriver(ctx, id); return 'flow_driver' }
    case 'flow_schedule': { await flowSetSchedule(ctx, params?.datetime ?? null); return 'flow_schedule' }
    case 'flow_skip_schedule': { await flowSetSchedule(ctx, null); return 'flow_skip_schedule' }
    case 'flow_confirm': { await flowConfirm(ctx); return 'flow_confirm' }
    case 'flow_cancel': { await clearFlow(ctx.tenantId, ctx.userId); await reply(ctx, 'ยกเลิกการสร้างงานแล้ว'); return 'flow_cancel' }
    default: return 'ignored'
  }
}
