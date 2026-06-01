// AI-based column mapping using Google Gemini (free tier). Given the first rows
// of a sheet, Gemini returns which column is which canonical field, the header
// row index, and the sheet type. Falls back to null on any failure so the caller
// can use the heuristic mapper instead.

const MODEL = 'gemini-flash-latest'

export interface AiMapping {
  type: 'vehicles' | 'jobs' | 'repair' | 'accident' | 'fuel' | 'oil' | 'installment' | 'income' | 'unknown'
  headerRow: number
  columns: Record<string, number>
}

const CATEGORY_TYPES = new Set(['vehicles', 'jobs', 'repair', 'accident', 'fuel', 'oil', 'installment', 'income'])

const FIELD_GUIDE = `
license: ทะเบียน / ป้ายทะเบียน / ทะเบียนรถ (เลขทะเบียนรถ ช่องเดียว)
province: จังหวัดทะเบียน (ถ้าแยกช่อง)
model: รายการทรัพย์สิน / ชื่อรถ / รุ่น / แบบรถ
brand: ยี่ห้อ
driver: คนขับ / ชื่อคนขับ / ผู้ประจำรถ / ผู้ปฏิบัติงาน
vehicleType: ประเภทรถ / ชนิดรถ
note: หมายเหตุ
registrationDate: วันที่ซื้อ / วันที่จดทะเบียน / วันที่ครอบครอง
installmentAmount: ผ่อนเดือนละ / ค่างวด
status: สถานะ
insuranceEnd: ประกันหมดวันที่ / วันหมดประกัน (ประกันภาคสมัครใจ)
insuranceClass: ประกันชั้น (เช่น ชั้น 1, ชั้น 3)
insuranceCompany: ชื่อบริษัทประกัน
brokerName: ชื่อโบรกเกอร์
premium: ค่าเบี้ยประกัน / ค่าเบี้ยรวม (จำนวนเงิน)
compulsoryEnd: พรบ / พ.ร.บ. (วันหมดอายุ พรบ.)
taxEnd: ภาษี / ภาษีรถ (วันหมดอายุภาษี)
origin: ต้นทาง / จุดรับ
destination: ปลายทาง / จุดส่ง / หน้างาน
scheduledAt: วันเวลา / วันที่นัด / วันที่
repairDate: วันที่ซ่อม
repairShop: อู่ / ร้านซ่อม
receiveDate: วันรับรถ
insurancePay: ประกันจ่าย
companyPay: บริษัทจ่าย
accidentDate: วันที่เกิดเหตุ
accidentTime: เวลาเกิดเหตุ
party: คู่กรณี
opponent: ฝ่ายตรงข้าม
fuelItem: ชนิด/รายการน้ำมัน
liters: จำนวนลิตร
amount: จำนวนเงิน
odometerStart: เลขไมล์เริ่ม
odometerEnd: เลขไมล์สิ้นสุด
odometer: เลขไมล์
oilDate: วันที่เปลี่ยน/ถ่ายน้ำมันเครื่อง
oilDueDate: ครบกำหนดเปลี่ยน
textAlert: ข้อความแจ้งเตือน
installmentNumber: งวดที่
dueDate: วันครบกำหนด
datePay: วันที่จ่าย
incomeDescription: รายละเอียดงาน
customerName: ชื่อลูกค้า
workOrderNumber: เลขใบสั่งงาน
invoiceNumber: เลขใบแจ้งหนี้
amountReceive: จำนวนเงินที่รับ`

export async function aiMapSheet(sheetName: string, matrix: any[][]): Promise<AiMapping | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null

  // compact preview: first 8 rows, cells trimmed to 40 chars
  const preview = matrix.slice(0, 8).map((row) => row.map((c) => (c === null || c === undefined ? '' : String(c)).slice(0, 40)))

  const prompt = `คุณเป็นตัวช่วยแมพคอลัมน์ไฟล์ Excel ภาษาไทยสำหรับระบบจัดการรถ/เครื่องจักร
ข้อมูลคือ array ของแถว (แต่ละแถวเป็น array ของค่าในเซลล์) index เริ่มที่ 0
ชื่อ sheet: "${sheetName}"

งานของคุณ ตอบเป็น JSON เท่านั้น:
{
  "type": "vehicles" | "jobs" | "repair" | "accident" | "fuel" | "oil" | "installment" | "income" | "unknown",
  "headerRow": <index แถวที่เป็นหัวคอลัมน์จริง ข้ามแถวชื่อเรื่อง/หัวตาราง>,
  "columns": { "<field>": <column index>, ... }
}

type:
- "vehicles" = ตารางรายการรถ/เครื่องจักร/ทรัพย์สิน (มีทะเบียน หรือ ชื่อรายการทรัพย์สิน) อาจมีคอลัมน์ประกัน/พรบ/ภาษีด้วย
- "jobs" = ตารางสั่งงานคนขับ (มีต้นทางและปลายทาง)
- "repair" = ประวัติซ่อมรถ (มีวันที่ซ่อม/อู่)
- "accident" = ประวัติอุบัติเหตุ (มีวันที่เกิดเหตุ/คู่กรณี)
- "fuel" = ค่าน้ำมัน (มีจำนวนลิตร/เลขไมล์)
- "oil" = เปลี่ยนถ่ายน้ำมันเครื่อง (มีวันที่เปลี่ยนน้ำมัน)
- "installment" = ค่างวดผ่อนรถ (มีงวดที่/วันครบกำหนด)
- "income" = รายได้ (มีเลขใบสั่งงาน/จำนวนเงินที่รับ)
- "unknown" = ไม่เข้าพวกข้างบน (เช่น รายงานสรุป, dropdown list)
หมายเหตุ: repair/accident/fuel/oil/installment/income ต้องมีคอลัมน์ทะเบียนรถด้วย (เพื่อจับคู่กับรถที่มีอยู่)

columns: แมพเฉพาะคอลัมน์ที่มั่นใจ ใช้ชื่อ field จากรายการนี้ (ค่าเป็น column index 0-based):${FIELD_GUIDE}

ข้อมูล (8 แถวแรก):
${JSON.stringify(preview)}`

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0 },
      }),
    })
    if (!res.ok) return null
    const data: any = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed.headerRow !== 'number' || typeof parsed.columns !== 'object' || parsed.columns === null) return null
    // keep only numeric column indexes
    const columns: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed.columns)) {
      if (typeof v === 'number' && v >= 0) columns[k] = v
    }
    const type = CATEGORY_TYPES.has(parsed.type) ? parsed.type : 'unknown'
    return { type, headerRow: parsed.headerRow, columns }
  } catch {
    return null
  }
}
