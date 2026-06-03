// AI-based column mapping with a multi-provider fallback chain. Given the first
// rows of a sheet, an AI returns which column is which canonical field, the
// header row index, and the sheet type. Providers are tried in order; the first
// one that has an API key set and returns a valid result wins. Falls back to
// null on total failure so the caller can use the heuristic mapper instead.
//
// Configure any subset via env (all free tiers): GEMINI_API_KEY, GROQ_API_KEY,
// OPENROUTER_API_KEY, MISTRAL_API_KEY, CEREBRAS_API_KEY.

export interface AiMapping {
  type: 'vehicles' | 'jobs' | 'repair' | 'accident' | 'fuel' | 'oil' | 'installment' | 'income' | 'unknown'
  headerRow: number
  columns: Record<string, number>
}

const CATEGORY_TYPES = new Set(['vehicles', 'jobs', 'repair', 'accident', 'fuel', 'oil', 'installment', 'income'])

type ProviderKind = 'gemini' | 'openai'

interface Provider {
  name: string
  envKey: string
  kind: ProviderKind
  url: string
  model: string
}

// Order = fallback priority. Each is used only if its env key is set.
const PROVIDERS: Provider[] = [
  { name: 'Gemini', envKey: 'GEMINI_API_KEY', kind: 'gemini', url: 'https://generativelanguage.googleapis.com/v1beta/models', model: 'gemini-flash-latest' },
  { name: 'Groq', envKey: 'GROQ_API_KEY', kind: 'openai', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  { name: 'OpenRouter', envKey: 'OPENROUTER_API_KEY', kind: 'openai', url: 'https://openrouter.ai/api/v1/chat/completions', model: 'z-ai/glm-4.5-air:free' },
  { name: 'Mistral', envKey: 'MISTRAL_API_KEY', kind: 'openai', url: 'https://api.mistral.ai/v1/chat/completions', model: 'mistral-small-latest' },
  { name: 'Cerebras', envKey: 'CEREBRAS_API_KEY', kind: 'openai', url: 'https://api.cerebras.ai/v1/chat/completions', model: 'gpt-oss-120b' },
]

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
origin: เนื้อหางาน / รายละเอียดงานที่สั่งคนขับ / ต้นทาง / จุดรับ
destination: จุดหมายปลายทาง / ลิงก์ Google Map / ปลายทาง / จุดส่ง / หน้างาน
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

function buildPrompt(sheetName: string, matrix: any[][]): string {
  // compact preview: first 8 rows, cells trimmed to 40 chars
  const preview = matrix.slice(0, 8).map((row) => row.map((c) => (c === null || c === undefined ? '' : String(c)).slice(0, 40)))

  return `คุณเป็นตัวช่วยแมพคอลัมน์ไฟล์ Excel ภาษาไทยสำหรับระบบจัดการรถ/เครื่องจักร
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
- "jobs" = ตารางสั่งงานคนขับผ่าน LINE (มีเนื้อหางาน/ต้นทาง อาจมีคนขับ/จุดหมายปลายทาง/ลิงก์แผนที่/วันเวลา)
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
}

function parseMapping(text: string | null): AiMapping | null {
  if (!text) return null
  // Tolerate code fences / extra prose: extract the first {...} block.
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null
  try {
    const parsed = JSON.parse(text.slice(start, end + 1))
    if (!parsed || typeof parsed.headerRow !== 'number' || typeof parsed.columns !== 'object' || parsed.columns === null) return null
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

interface RawResult { ok: boolean; status: number; text: string | null }

async function callGemini(p: Provider, key: string, prompt: string, opts: { json: boolean; maxTokens?: number }): Promise<RawResult> {
  const generationConfig: any = { temperature: 0 }
  if (opts.json) generationConfig.responseMimeType = 'application/json'
  if (opts.maxTokens) generationConfig.maxOutputTokens = opts.maxTokens
  const res = await fetch(`${p.url}/${p.model}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
  })
  if (!res.ok) return { ok: false, status: res.status, text: null }
  const data: any = await res.json()
  return { ok: true, status: 200, text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null }
}

async function callOpenAI(p: Provider, key: string, prompt: string, opts: { json: boolean; maxTokens?: number }): Promise<RawResult> {
  const body: any = { model: p.model, temperature: 0, messages: [{ role: 'user', content: prompt }] }
  if (opts.json) body.response_format = { type: 'json_object' }
  if (opts.maxTokens) body.max_tokens = opts.maxTokens
  const res = await fetch(p.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) return { ok: false, status: res.status, text: null }
  const data: any = await res.json()
  return { ok: true, status: 200, text: data?.choices?.[0]?.message?.content ?? null }
}

function callProvider(p: Provider, key: string, prompt: string, opts: { json: boolean; maxTokens?: number }): Promise<RawResult> {
  return p.kind === 'gemini' ? callGemini(p, key, prompt, opts) : callOpenAI(p, key, prompt, opts)
}

export async function aiMapSheet(sheetName: string, matrix: any[][]): Promise<AiMapping | null> {
  const prompt = buildPrompt(sheetName, matrix)
  for (const p of PROVIDERS) {
    const key = process.env[p.envKey]
    if (!key) continue
    try {
      const r = await callProvider(p, key, prompt, { json: true })
      if (!r.ok) continue // quota/error on this provider -> try the next one
      const mapping = parseMapping(r.text)
      if (mapping) return mapping
    } catch {
      // network/parse failure -> try the next provider
    }
  }
  return null
}

export type AiStatus = 'ok' | 'quota' | 'unavailable' | 'no_key' | 'error'

export interface ProviderHealth {
  name: string
  status: AiStatus
  httpCode?: number
}

export interface AiHealth {
  status: AiStatus
  message: string
  providers: ProviderHealth[]
}

function mapHttpToStatus(httpCode: number): AiStatus {
  if (httpCode === 429) return 'quota'
  if (httpCode === 503) return 'unavailable'
  return 'error'
}

// Lightweight probe so the import page can tell the user whether AI column
// mapping is available before they upload. Pings every configured provider.
// Import still works without AI (heuristic fallback), so this is informational.
export async function checkAiHealth(): Promise<AiHealth> {
  const configured = PROVIDERS.filter((p) => process.env[p.envKey])
  if (configured.length === 0) {
    return { status: 'no_key', message: 'ยังไม่ได้ตั้งค่า AI API key ตัวใดเลย', providers: [] }
  }

  const providers: ProviderHealth[] = []
  for (const p of configured) {
    const key = process.env[p.envKey] as string
    try {
      const r = await callProvider(p, key, 'ping', { json: false, maxTokens: 1 })
      providers.push({ name: p.name, status: r.ok ? 'ok' : mapHttpToStatus(r.status), httpCode: r.ok ? 200 : r.status })
    } catch {
      providers.push({ name: p.name, status: 'error' })
    }
  }

  const okNames = providers.filter((p) => p.status === 'ok').map((p) => p.name)
  if (okNames.length > 0) {
    return { status: 'ok', message: `AI พร้อมใช้งาน (${okNames.join(', ')})`, providers }
  }
  if (providers.some((p) => p.status === 'quota')) {
    return { status: 'quota', message: 'AI ทุกตัว quota เต็ม — จะใช้การแมพแบบ rule-based แทน', providers }
  }
  if (providers.some((p) => p.status === 'unavailable')) {
    return { status: 'unavailable', message: 'AI กำลังมีโหลดสูงชั่วคราว ลองใหม่อีกครั้ง', providers }
  }
  return { status: 'error', message: 'AI ใช้งานไม่ได้ทุกตัว — จะใช้ rule-based แทน', providers }
}
