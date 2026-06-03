import { Response, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from '../../typings/express'
import { ParsedToken } from '../../typings/token'
import { listRecords, previewCount, deleteRecords, isDataType, dataTypeList, type Filter } from './dataadmin.services'

const auth = (req: IGetUserAuthInfoRequest): ParsedToken => {
  const t = req.parsedToken
  if (!t) throw new Error('Unauthorized')
  return t
}

export async function types(_req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try { res.json({ success: true, types: dataTypeList() }) } catch (e) { next(e) }
}

export async function list(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const t = auth(req)
    const type = req.params.type
    if (!isDataType(type)) return res.status(400).json({ success: false, message: 'ชนิดข้อมูลไม่ถูกต้อง' })
    const filter: Filter = { vehicleId: req.query.vehicleId as string, from: req.query.from as string, to: req.query.to as string }
    const limit = Number(req.query.limit) || 200
    const offset = Number(req.query.offset) || 0
    const { rows, total } = await listRecords(type, t.tenantId, filter, limit, offset)
    res.json({ success: true, rows, total })
  } catch (e) { next(e) }
}

export async function preview(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const t = auth(req)
    const type = req.params.type
    if (!isDataType(type)) return res.status(400).json({ success: false, message: 'ชนิดข้อมูลไม่ถูกต้อง' })
    const count = await previewCount(type, t.tenantId, { ids: req.body.ids, filter: req.body.filter })
    res.json({ success: true, count })
  } catch (e) { next(e) }
}

export async function remove(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const t = auth(req)
    const type = req.params.type
    if (!isDataType(type)) return res.status(400).json({ success: false, message: 'ชนิดข้อมูลไม่ถูกต้อง' })
    const deleted = await deleteRecords(type, t.tenantId, { ids: req.body.ids, filter: req.body.filter, allowAll: req.body.allowAll })
    res.json({ success: true, deleted, message: `ลบ ${deleted} รายการ` })
  } catch (e) { next(e) }
}
