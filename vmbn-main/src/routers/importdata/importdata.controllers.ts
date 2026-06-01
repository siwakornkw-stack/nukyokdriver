import { Response, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from '../../typings/express'
import { ParsedToken } from '../../typings/token'
import { importWorkbook } from './importdata.services'

export async function importAuto(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const file = (req as any).file as { buffer: Buffer; originalname: string } | undefined
    if (!file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ (.xlsx หรือ .csv)' })
    }

    const results = await importWorkbook(parsedToken.tenantId, parsedToken.username, file.buffer)
    const created = results.reduce((s, r) => s + r.created, 0)
    const updated = results.reduce((s, r) => s + r.updated, 0)
    const sub = results.reduce((s, r) => s + r.sub, 0)

    res.json({
      success: true,
      message: `เพิ่มใหม่ ${created} คัน, อัปเดต ${updated} คัน, ประกัน/พรบ/ภาษี ${sub} รายการ`,
      fileName: file.originalname,
      results,
    })
  } catch (e) { next(e) }
}
