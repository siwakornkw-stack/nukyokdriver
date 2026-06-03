import { db } from '../../utils/db.server'
import { pushMessage, replyMessage, getProfile } from '../line/line.services'

export interface CreateJobInput {
  VehicleDriverId?: string | null
  VehicleId?: string | null
  VehicleNo?: string | null
  Origin: string
  Destination: string
  ScheduledAt?: string | null
  Note?: string | null
}

function formatThai(d: Date): string {
  return d.toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

// A label/value row inside the Flex body.
function infoRow(label: string, value: string) {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      { type: 'text', text: label, color: '#8C8C8C', size: 'sm', flex: 2 },
      { type: 'text', text: value, color: '#1A1A1A', size: 'sm', flex: 5, wrap: true },
    ],
  }
}

// A label/value row whose value is a tappable link (opens the URI in LINE).
function linkRow(label: string, text: string, uri: string) {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      { type: 'text', text: label, color: '#8C8C8C', size: 'sm', flex: 2 },
      { type: 'text', text, color: '#0B5FFF', size: 'sm', flex: 5, wrap: true, decoration: 'underline', action: { type: 'uri', label: 'เปิดแผนที่', uri } },
    ],
  }
}

// LINE Flex bubble with accept/reject postback actions. The driver taps a button
// in LINE; LINE posts back to /line/webhook/:tenantId which calls handlePostback.
export function buildJobMessage(job: {
  DriverJobId: string; JobNo?: number | null; Origin: string; Destination: string;
  VehicleNo: string | null; ScheduledAt: Date | null; Note: string | null;
}) {
  const contents = job.Origin.split('\n')
  const dests = (job.Destination ?? '').split('\n')
  const rows: any[] = []
  contents.forEach((c, i) => {
    const label = contents.length > 1 ? `งาน ${i + 1}` : 'เนื้อหางาน'
    rows.push(infoRow(label, c))
    const d = dests[i]
    if (d && d !== '-') {
      if (/^https?:\/\//i.test(d)) rows.push(linkRow('จุดหมาย', 'เปิดแผนที่ (Google Map)', d))
      else rows.push(infoRow('จุดหมาย', d))
    }
  })
  if (job.VehicleNo) rows.push(infoRow('รถ', job.VehicleNo))
  if (job.ScheduledAt) rows.push(infoRow('เวลา', formatThai(job.ScheduledAt)))
  if (job.Note) rows.push(infoRow('หมายเหตุ', job.Note))

  const subtitle = job.JobNo ? `งาน #${job.JobNo} มอบหมายให้คุณ` : 'มีงานใหม่มอบหมายให้คุณ'

  return {
    type: 'flex',
    altText: 'มีงานใหม่มอบหมายให้คุณ',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0B5FFF',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: 'แจ้งงานคนขับ', color: '#FFFFFF', weight: 'bold', size: 'lg' },
          { type: 'text', text: subtitle, color: '#DDE6FF', size: 'sm', margin: 'sm' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: rows,
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#1DB446',
            action: { type: 'postback', label: 'รับงาน', data: `action=accept&jobId=${job.DriverJobId}`, displayText: 'รับงาน' },
          },
          {
            type: 'button',
            style: 'secondary',
            action: { type: 'postback', label: 'ปฏิเสธ', data: `action=reject&jobId=${job.DriverJobId}`, displayText: 'ปฏิเสธ' },
          },
        ],
      },
    },
  }
}

export async function getDriversWithLine(tenantId: string) {
  return db.vehicleDriver.findMany({
    where: { TenantId: tenantId, Status: 'active' },
    select: { VehicleDriverId: true, Name: true, Status: true, LineUserId: true },
    orderBy: { Name: 'asc' },
  })
}

// Recent distinct LINE users who messaged this tenant's OA, newest first, with
// the driver they're already linked to (if any). Lets an admin copy a userId
// into the driver form without the driver having to find it themselves.
export async function listRecentLineSenders(tenantId: string) {
  const hooks = await db.lineWebhook.findMany({
    where: { TenantId: tenantId },
    orderBy: { CreatedAt: 'desc' },
    take: 200,
  })

  const byUser = new Map<string, { userId: string; lastText: string | null; lastType: string; lastAt: Date }>()
  for (const h of hooks) {
    let body: any
    try { body = JSON.parse(h.Body) } catch { continue }
    for (const e of body?.events ?? []) {
      const uid = e?.source?.userId
      if (!uid) continue
      const at = e?.timestamp ? new Date(e.timestamp) : h.CreatedAt
      const existing = byUser.get(uid)
      if (existing && existing.lastAt >= at) continue
      byUser.set(uid, {
        userId: uid,
        lastText: e?.message?.type === 'text' ? e.message.text : null,
        lastType: e?.type ?? 'unknown',
        lastAt: at,
      })
    }
  }

  const userIds = [...byUser.keys()]
  const linked = userIds.length
    ? await db.vehicleDriver.findMany({
        where: { TenantId: tenantId, LineUserId: { in: userIds } },
        select: { LineUserId: true, Name: true },
      })
    : []
  const linkedName = new Map(linked.map((d) => [d.LineUserId as string, d.Name]))

  // Resolve LINE display names via the profile API (best effort, in parallel).
  const tenant = await db.tenant.findFirst({
    where: { TenantId: tenantId },
    select: { LineChannelAccessToken: true },
  })
  const token = tenant?.LineChannelAccessToken
  const displayName = new Map<string, string>()
  if (token) {
    await Promise.all(
      userIds.map(async (uid) => {
        const profile = await getProfile(token, uid)
        if (profile?.displayName) displayName.set(uid, profile.displayName)
      }),
    )
  }

  return [...byUser.values()]
    .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime())
    .map((s) => ({
      userId: s.userId,
      displayName: displayName.get(s.userId) ?? null,
      lastText: s.lastText,
      lastType: s.lastType,
      lastAt: s.lastAt,
      linkedDriverName: linkedName.get(s.userId) ?? null,
    }))
}

// Per-tenant running number so dispatchers can refer to a job by a short "#12"
// in LINE instead of a UUID. Not gap-free; only needs to be unique per tenant.
export async function nextJobNo(tenantId: string): Promise<number> {
  const last = await db.driverJob.findFirst({
    where: { TenantId: tenantId, JobNo: { not: null } },
    orderBy: { JobNo: 'desc' },
    select: { JobNo: true },
  })
  return (last?.JobNo ?? 0) + 1
}

export async function findJobByNo(tenantId: string, jobNo: number) {
  return db.driverJob.findFirst({
    where: { TenantId: tenantId, JobNo: jobNo },
    include: { VehicleDriver: { select: { Name: true, LineUserId: true } } },
  })
}

// Jobs scheduled for today plus any still-open jobs, for the "งานวันนี้" command.
export async function listJobsToday(tenantId: string) {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end = new Date(); end.setHours(23, 59, 59, 999)
  return db.driverJob.findMany({
    where: {
      TenantId: tenantId,
      OR: [
        { ScheduledAt: { gte: start, lte: end } },
        { Status: { in: ['pending', 'accepted', 'arrived'] } },
      ],
    },
    include: { VehicleDriver: { select: { Name: true } } },
    orderBy: [{ ScheduledAt: 'asc' }, { CreatedAt: 'desc' }],
    take: 50,
  })
}

export async function listActiveJobsForDriver(tenantId: string, vehicleDriverId: string) {
  return db.driverJob.findMany({
    where: {
      TenantId: tenantId,
      VehicleDriverId: vehicleDriverId,
      Status: { in: ['pending', 'accepted', 'arrived'] },
    },
    orderBy: [{ ScheduledAt: 'asc' }, { CreatedAt: 'desc' }],
    take: 20,
  })
}

export async function setDriverLineUserId(tenantId: string, vehicleDriverId: string, lineUserId: string | null) {
  return db.vehicleDriver.updateMany({
    where: { TenantId: tenantId, VehicleDriverId: vehicleDriverId },
    data: { LineUserId: lineUserId || null },
  })
}

export async function listJobs(tenantId: string) {
  return db.driverJob.findMany({
    where: { TenantId: tenantId },
    include: { VehicleDriver: { select: { Name: true } } },
    orderBy: { CreatedAt: 'desc' },
    take: 200,
  })
}

// Push a job's accept/reject card to its assigned driver's LINE. Returns whether
// it was delivered and, if not, why (unlinked driver, missing token, send error).
async function pushJobToDriver(tenantId: string, driver: { LineUserId: string | null }, job: Parameters<typeof buildJobMessage>[0]) {
  if (!driver.LineUserId) return { pushed: false, pushError: 'คนขับยังไม่ได้ผูก LINE' }
  const tenant = await db.tenant.findFirst({ where: { TenantId: tenantId }, select: { LineChannelAccessToken: true } })
  if (!tenant?.LineChannelAccessToken) return { pushed: false, pushError: 'tenant ยังไม่ได้ตั้งค่า LINE Channel Access Token' }
  try {
    await pushMessage(tenant.LineChannelAccessToken, driver.LineUserId, [buildJobMessage(job)])
    return { pushed: true, pushError: null as string | null }
  } catch (e: any) {
    return { pushed: false, pushError: e?.message || 'ส่ง LINE ไม่สำเร็จ' }
  }
}

// Create a job. A driver is optional: when omitted the job is left 'unassigned'
// for a dispatcher to assign later (see assignDriver). Returns { job, pushed, pushError }.
export async function createJob(tenantId: string, username: string | undefined, input: CreateJobInput) {
  let driver: { LineUserId: string | null } | null = null
  if (input.VehicleDriverId) {
    driver = await db.vehicleDriver.findFirst({ where: { TenantId: tenantId, VehicleDriverId: input.VehicleDriverId } })
    if (!driver) throw new Error('ไม่พบคนขับ')
  }

  const job = await db.driverJob.create({
    data: {
      TenantId: tenantId,
      JobNo: await nextJobNo(tenantId),
      VehicleDriverId: input.VehicleDriverId || null,
      VehicleId: input.VehicleId || null,
      VehicleNo: input.VehicleNo || null,
      Origin: input.Origin,
      Destination: input.Destination,
      ScheduledAt: input.ScheduledAt ? new Date(input.ScheduledAt) : null,
      Note: input.Note || null,
      Status: driver ? 'pending' : 'unassigned',
      CreatedByUsername: username || 'admin',
    },
  })

  if (!driver) return { job, pushed: false, pushError: null as string | null }
  return { job, ...(await pushJobToDriver(tenantId, driver, job)) }
}

// Assign a driver to an existing unassigned job, then push the LINE card.
export async function assignDriver(tenantId: string, jobId: string, vehicleDriverId: string) {
  const driver = await db.vehicleDriver.findFirst({ where: { TenantId: tenantId, VehicleDriverId: vehicleDriverId } })
  if (!driver) throw new Error('ไม่พบคนขับ')
  const existing = await db.driverJob.findFirst({ where: { TenantId: tenantId, DriverJobId: jobId } })
  if (!existing) throw new Error('ไม่พบงาน')

  const job = await db.driverJob.update({
    where: { DriverJobId: jobId },
    data: { VehicleDriverId: vehicleDriverId, Status: 'pending', RespondedAt: null },
  })
  return { job, ...(await pushJobToDriver(tenantId, driver, job)) }
}

export async function cancelJob(tenantId: string, driverJobId: string) {
  return db.driverJob.updateMany({
    where: { TenantId: tenantId, DriverJobId: driverJobId },
    data: { Status: 'cancelled' },
  })
}

// Quick-reply buttons shown after a driver accepts, to drive the job lifecycle
// forward (accepted -> arrived -> done) without typing.
function lifecycleQuickReply(jobNo: number | null, current: 'accepted' | 'arrived') {
  const items: any[] = []
  if (current === 'accepted') {
    items.push({ type: 'action', action: { type: 'postback', label: 'ถึงแล้ว', data: `action=arrived&jobNo=${jobNo}`, displayText: `ถึงแล้ว #${jobNo}` } })
  }
  items.push({ type: 'action', action: { type: 'postback', label: 'เสร็จงาน', data: `action=done&jobNo=${jobNo}`, displayText: `เสร็จงาน #${jobNo}` } })
  return { items }
}

// Called from the LINE webhook when a driver taps a job-card button.
// Handles accept/reject on the original Flex card and arrived/done on the
// follow-up quick replies. accept/reject carry jobId (UUID); the lifecycle
// quick replies carry jobNo (the short per-tenant number).
export async function handlePostback(userId: string | undefined, data: string, replyToken: string | undefined, tenantId: string) {
  if (!userId) return
  const params = new URLSearchParams(data)
  const action = params.get('action')
  const jobId = params.get('jobId')
  const jobNoRaw = params.get('jobNo')
  if (!action || !['accept', 'reject', 'arrived', 'done'].includes(action)) return

  const driver = await db.vehicleDriver.findFirst({ where: { TenantId: tenantId, LineUserId: userId } })
  if (!driver) return

  const job = jobId
    ? await db.driverJob.findFirst({ where: { DriverJobId: jobId, TenantId: tenantId, VehicleDriverId: driver.VehicleDriverId } })
    : jobNoRaw
      ? await db.driverJob.findFirst({ where: { JobNo: parseInt(jobNoRaw, 10), TenantId: tenantId, VehicleDriverId: driver.VehicleDriverId } })
      : null
  if (!job) return

  const tenant = await db.tenant.findFirst({ where: { TenantId: tenantId }, select: { LineChannelAccessToken: true } })
  const reply = async (text: string, quickReply?: any) => {
    if (tenant?.LineChannelAccessToken && replyToken) {
      const msg: any = { type: 'text', text }
      if (quickReply) msg.quickReply = quickReply
      await replyMessage(tenant.LineChannelAccessToken, replyToken, [msg])
    }
  }

  if (action === 'accept' || action === 'reject') {
    // The Flex card stays in the chat after a response, so a driver can tap a stale
    // button. Give feedback about the current state instead of silently ignoring it.
    if (job.Status !== 'pending') {
      const stale: Record<string, string> = {
        accepted: 'งานนี้คุณรับไว้แล้ว',
        rejected: 'งานนี้คุณปฏิเสธไปแล้ว',
        arrived: 'งานนี้คุณถึงจุดหมายแล้ว',
        cancelled: 'งานนี้ถูกยกเลิกแล้ว',
        done: 'งานนี้เสร็จสิ้นแล้ว',
      }
      await reply(stale[job.Status] ?? 'งานนี้ถูกดำเนินการไปแล้ว')
      return
    }
    const newStatus = action === 'accept' ? 'accepted' : 'rejected'
    await db.driverJob.update({ where: { DriverJobId: job.DriverJobId }, data: { Status: newStatus, RespondedAt: new Date() } })
    if (newStatus === 'accepted') {
      await reply('รับงานเรียบร้อย ขอบคุณครับ', lifecycleQuickReply(job.JobNo, 'accepted'))
    } else {
      await reply('รับทราบการปฏิเสธงานแล้ว')
    }
    return
  }

  if (action === 'arrived') {
    if (job.Status !== 'accepted') { await reply('ต้องรับงานก่อนถึงจะแจ้ง "ถึงแล้ว" ได้'); return }
    await db.driverJob.update({ where: { DriverJobId: job.DriverJobId }, data: { Status: 'arrived' } })
    await reply(`รับทราบ ถึงจุดหมายงาน #${job.JobNo} แล้ว`, lifecycleQuickReply(job.JobNo, 'arrived'))
    return
  }

  if (action === 'done') {
    if (job.Status !== 'accepted' && job.Status !== 'arrived') { await reply('งานนี้ยังไม่อยู่ในสถานะที่ปิดได้'); return }
    await db.driverJob.update({ where: { DriverJobId: job.DriverJobId }, data: { Status: 'done' } })
    await reply(`ปิดงาน #${job.JobNo} เรียบร้อย ขอบคุณครับ`)
    return
  }
}
