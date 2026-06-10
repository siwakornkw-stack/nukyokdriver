import { Response, NextFunction } from 'express'
import { IGetUserAuthInfoRequest } from '../../typings/express'
import { ParsedToken } from '../../typings/token'
import { importWorkbook, getImportHistory } from './importdata.services'
import { checkAiHealth } from './aiMapper'

export async function checkAi(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const health = await checkAiHealth()
    res.json({ success: true, ...health })
  } catch (e) { next(e) }
}

export async function importAuto(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')

    const file = (req as any).file as { buffer: Buffer; originalname: string } | undefined
    if (!file) {
      return res.status(400).json({ success: false, message: 'กรุณาอัปโหลดไฟล์ (.xlsx หรือ .csv)' })
    }
    // multer/busboy decodes the multipart filename as latin1, which garbles Thai
    // (UTF-8) names. Re-decode the bytes as UTF-8 to restore the original name.
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8')

    const results = await importWorkbook(parsedToken.tenantId, parsedToken.username, file.buffer, fileName)
    const created = results.reduce((s, r) => s + r.created, 0)
    const updated = results.reduce((s, r) => s + r.updated, 0)
    const sub = results.reduce((s, r) => s + r.sub, 0)
    const duplicates = results.flatMap((r) => r.duplicates ?? [])

    res.json({
      success: true,
      message: `เพิ่มใหม่ ${created} คัน, อัปเดต ${updated} คัน, ประกัน/พรบ/ภาษี ${sub} รายการ` + (duplicates.length ? `, ตัดแถวซ้ำ ${duplicates.length} รายการ` : ''),
      fileName,
      results,
      duplicates,
    })
  } catch (e) { next(e) }
}

export async function history(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
  try {
    const parsedToken: ParsedToken | undefined = req.parsedToken
    if (!parsedToken) throw new Error('Unauthorized')
    const items = await getImportHistory(parsedToken.tenantId)
    res.json({ success: true, items })
  } catch (e) { next(e) }
}
