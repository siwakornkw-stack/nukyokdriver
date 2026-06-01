import { db } from '../../utils/db.server'
import { pushMessage, replyMessage } from '../line/line.services'

export interface CreateJobInput {
  VehicleDriverId: string
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
    hour: '2-digit', minute: '2-digit',
  })
}

// LINE "buttons" template with accept/reject postback actions. The driver taps a
// button in LINE; LINE posts back to /line/webhook/:tenantId which calls handlePostback.
function buildJobMessage(job: {
  DriverJobId: string; Origin: string; Destination: string;
  VehicleNo: string | null; ScheduledAt: Date | null; Note: string | null;
}) {
  const lines = [
    'มีงานใหม่มอบหมายให้คุณ',
    `ต้นทาง: ${job.Origin}`,
    `ปลายทาง: ${job.Destination}`,
    job.VehicleNo ? `รถ: ${job.VehicleNo}` : null,
    job.ScheduledAt ? `เวลา: ${formatThai(job.ScheduledAt)}` : null,
    job.Note ? `หมายเหตุ: ${job.Note}` : null,
  ].filter(Boolean).join('\n')
  // buttons template text limit is 160 chars
  const text = lines.length > 160 ? lines.slice(0, 157) + '...' : lines
  return {
    type: 'template',
    altText: 'มีงานใหม่มอบหมายให้คุณ',
    template: {
      type: 'buttons',
      title: 'แจ้งงานคนขับ',
      text,
      actions: [
        { type: 'postback', label: 'รับงาน', data: `action=accept&jobId=${job.DriverJobId}`, displayText: 'รับงาน' },
        { type: 'postback', label: 'ปฏิเสธ', data: `action=reject&jobId=${job.DriverJobId}`, displayText: 'ปฏิเสธ' },
      ],
    },
  }
}

export async function getDriversWithLine(tenantId: string) {
  return db.vehicleDriver.findMany({
    where: { TenantId: tenantId },
    select: { VehicleDriverId: true, Name: true, Status: true, LineUserId: true },
    orderBy: { Name: 'asc' },
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

// Returns { job, pushed, pushError } — the job is always created; pushed indicates
// whether the LINE notification was actually delivered.
export async function createJob(tenantId: string, username: string | undefined, input: CreateJobInput) {
  const driver = await db.vehicleDriver.findFirst({
    where: { TenantId: tenantId, VehicleDriverId: input.VehicleDriverId },
  })
  if (!driver) throw new Error('ไม่พบคนขับ')

  const job = await db.driverJob.create({
    data: {
      TenantId: tenantId,
      VehicleDriverId: input.VehicleDriverId,
      VehicleId: input.VehicleId || null,
      VehicleNo: input.VehicleNo || null,
      Origin: input.Origin,
      Destination: input.Destination,
      ScheduledAt: input.ScheduledAt ? new Date(input.ScheduledAt) : null,
      Note: input.Note || null,
      Status: 'pending',
      CreatedByUsername: username || 'admin',
    },
  })

  let pushed = false
  let pushError: string | null = null
  if (!driver.LineUserId) {
    pushError = 'คนขับยังไม่ได้ผูก LINE'
  } else {
    const tenant = await db.tenant.findFirst({ where: { TenantId: tenantId }, select: { LineChannelAccessToken: true } })
    if (!tenant?.LineChannelAccessToken) {
      pushError = 'tenant ยังไม่ได้ตั้งค่า LINE Channel Access Token'
    } else {
      try {
        await pushMessage(tenant.LineChannelAccessToken, driver.LineUserId, [buildJobMessage(job)])
        pushed = true
      } catch (e: any) {
        pushError = e?.message || 'ส่ง LINE ไม่สำเร็จ'
      }
    }
  }

  return { job, pushed, pushError }
}

export async function cancelJob(tenantId: string, driverJobId: string) {
  return db.driverJob.updateMany({
    where: { TenantId: tenantId, DriverJobId: driverJobId },
    data: { Status: 'cancelled' },
  })
}

// Called from the LINE webhook when a driver taps accept/reject.
export async function handlePostback(userId: string | undefined, data: string, replyToken: string | undefined, tenantId: string) {
  if (!userId) return
  const params = new URLSearchParams(data)
  const action = params.get('action')
  const jobId = params.get('jobId')
  if (!jobId || (action !== 'accept' && action !== 'reject')) return

  const driver = await db.vehicleDriver.findFirst({ where: { TenantId: tenantId, LineUserId: userId } })
  if (!driver) return

  const job = await db.driverJob.findFirst({ where: { DriverJobId: jobId, TenantId: tenantId, VehicleDriverId: driver.VehicleDriverId } })
  if (!job) return
  // Only respond to a job still awaiting a decision.
  if (job.Status !== 'pending') return

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'
  await db.driverJob.update({ where: { DriverJobId: job.DriverJobId }, data: { Status: newStatus, RespondedAt: new Date() } })

  const tenant = await db.tenant.findFirst({ where: { TenantId: tenantId }, select: { LineChannelAccessToken: true } })
  if (tenant?.LineChannelAccessToken && replyToken) {
    const text = newStatus === 'accepted' ? 'รับงานเรียบร้อย ขอบคุณครับ' : 'รับทราบการปฏิเสธงานแล้ว'
    await replyMessage(tenant.LineChannelAccessToken, replyToken, [{ type: 'text', text }])
  }
}
