import { Response, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from '../../typings/express'
import { ParsedToken } from '../../typings/token'
import * as service from './driverjob.services'

function auth(req: IGetUserAuthInfoRequest): ParsedToken {
  const parsedToken: ParsedToken | undefined = req.parsedToken
  if (!parsedToken) throw new Error('Unauthorized')
  return parsedToken
}

export async function getDrivers(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const { tenantId } = auth(req)
    const drivers = await service.getDriversWithLine(tenantId)
    res.json({ success: true, data: drivers })
  } catch (e) { next(e) }
}

export async function getLineSenders(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const { tenantId } = auth(req)
    const senders = await service.listRecentLineSenders(tenantId)
    res.json({ success: true, data: senders })
  } catch (e) { next(e) }
}

export async function setDriverLine(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const { tenantId } = auth(req)
    const { id } = req.params
    const { lineUserId } = req.body
    await service.setDriverLineUserId(tenantId, id, lineUserId ?? null)
    res.json({ success: true, message: 'อัปเดต LINE ของคนขับแล้ว' })
  } catch (e) { next(e) }
}

export async function getJobs(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const { tenantId } = auth(req)
    const jobs = await service.listJobs(tenantId)
    res.json({ success: true, data: jobs })
  } catch (e) { next(e) }
}

export async function addJob(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const token = auth(req)
    const { Origin, Destination } = req.body
    if (!Origin || !Destination) {
      res.status(400)
      throw new Error('กรุณาระบุต้นทาง และปลายทาง')
    }
    const result = await service.createJob(token.tenantId, token.username, req.body)
    const msg = result.job.VehicleDriverId
      ? (result.pushed ? 'สร้างงานและส่ง LINE ให้คนขับแล้ว' : `สร้างงานแล้ว แต่ยังไม่ได้ส่ง LINE (${result.pushError})`)
      : 'สร้างงานแล้ว เลือกคนขับภายหลัง'
    res.json({ success: true, message: msg, data: result.job, pushed: result.pushed })
  } catch (e) { next(e) }
}

export async function assignDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const { tenantId } = auth(req)
    const { id } = req.params
    const { VehicleDriverId } = req.body
    if (!VehicleDriverId) {
      res.status(400)
      throw new Error('กรุณาระบุคนขับ')
    }
    const result = await service.assignDriver(tenantId, id, VehicleDriverId)
    res.json({
      success: true,
      message: result.pushed ? 'เลือกคนขับและส่ง LINE แล้ว' : `เลือกคนขับแล้ว แต่ยังไม่ได้ส่ง LINE (${result.pushError})`,
      data: result.job,
      pushed: result.pushed,
    })
  } catch (e) { next(e) }
}

export async function cancelJob(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const { tenantId } = auth(req)
    await service.cancelJob(tenantId, req.params.id)
    res.json({ success: true, message: 'ยกเลิกงานแล้ว' })
  } catch (e) { next(e) }
}
