# Deploy ทั้ง 3 ส่วนบน Vercel

โปรเจกต์นี้มี 3 ส่วน แต่ละส่วนเป็น **Vercel Project แยกกัน** (ตั้ง Root Directory ต่างกัน)

| Vercel Project | Root Directory | ชนิด |
| --- | --- | --- |
| Frontend | `vm-main` | Next.js |
| Backend API | `vmbn-main` | Express (serverless function) |
| Bot | `vmbot-main` | Vercel Cron |

> ⚠️ ทดสอบจริงต้องทำบน Vercel — โค้ดทั้งหมดยังไม่ได้รัน build/test ในเครื่อง (ไม่มี Node ติดตั้ง)

---

## 1) Frontend — `vm-main`
ดูรายละเอียดใน [vm-main/DEPLOY.md](vm-main/DEPLOY.md)
- Root Directory = `vm-main`, Framework = Next.js
- Env: `NEXT_PUBLIC_URL_API`, `NEXT_PUBLIC_URL_IMAGE`, `NEXT_PUBLIC_HOST_IMAGE`
  ชี้ทั้งหมดไปที่โดเมนของ Backend Project

## 2) Backend API — `vmbn-main`
- Root Directory = `vmbn-main`. Vercel จะใช้ `vercel.json` ที่ rewrite ทุก path เข้า `api/index.ts` (ตัว Express app เดิม)
- **Vercel Blob**: ไป Storage → Create Blob Store แล้วเชื่อมกับ Project
  - `BLOB_READ_WRITE_TOKEN` Vercel ใส่ให้อัตโนมัติ
  - ตั้ง `BLOB_PUBLIC_BASE_URL` = base URL ของ store (เช่น `https://xxxx.public.blob.vercel-storage.com`, ไม่มี `/` ท้าย)
  - ไฟล์อัปโหลด (รูป/เอกสาร) เก็บใน Blob ที่ path `uploads/<folder>/<file>` และ URL `/uploads/...` ใน DB จะถูก redirect ไป Blob ให้อัตโนมัติ
- **Redis**: ตั้ง `REDIS_URL` (เช่น Upstash) หรือ `REDIS_HOST/PORT/PASSWORD`
- **Database/JWT**: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` ฯลฯ (ดู `.env.example`)
- Prisma client ถูก generate ตอน build (`postinstall`) พร้อม binary `rhel-openssl-3.0.x` สำหรับ Vercel
- เปิด CORS อยู่แล้ว — ใส่โดเมน Frontend ได้ทันที

### ข้อจำกัดที่ต้องรู้ (SSE)
ฟีเจอร์ **แจ้งเตือนเรียลไทม์ผ่าน SSE** (`/sse/connect`) ใช้ long-lived connection ซึ่ง Vercel serverless ตัดที่ `maxDuration` (30s) แล้ว client จะ reconnect ใหม่เรื่อย ๆ
→ ใช้งานได้แบบ "ไม่เรียลไทม์" และ**กิน quota function** ถ้ามีผู้ใช้ออนไลน์เยอะ
ถ้าต้องการเรียลไทม์จริง ควรเปลี่ยนเป็น polling หรือย้ายเฉพาะส่วน SSE ไปโฮสต์ที่รัน Node server ได้

## 3) Bot — `vmbot-main`
- Root Directory = `vmbot-main`. `vercel.json` ตั้ง Vercel Cron เรียก `/api/cron`
- ตารางเวลาเริ่มต้น: `0 1 * * *` (ทุกวัน 01:00 **UTC** = 08:00 ไทย) — แก้ใน `vercel.json` ได้
  > Vercel Hobby รัน cron ได้วันละครั้ง; ต้องถี่กว่านั้นใช้ Pro
- Env: `DATABASE_URL` (ฐานเดียวกับ backend), `CRON_SECRET` (กันคนนอกยิง endpoint)
- รัน local แบบเดิมยังได้: ตั้ง `CRON_RUN` แล้ว `npm run dev` (node-cron)

---

## หลัง deploy: rotate secrets ที่หลุด
`.env` เดิมถูก commit มาก่อน (JWT secrets, DB, รหัส Redis `KMP123456`) ถือว่ารั่วแล้ว — ควร**เปลี่ยนใหม่ทั้งหมด**แล้วตั้งเป็น Environment Variables บน Vercel เท่านั้น (ตอนนี้ `.env` ถูกใส่ใน `.gitignore` แล้ว)

---

# Release checklist: Installment AR + Importer fixes (2026-06)

## สิ่งที่เปลี่ยน (ไม่มี DB migration)
**`vmbn-main`**
- เพิ่ม endpoint `GET /dashboard/installments-ar` (สรุปค่างวด: ครบกำหนด/เกินกำหนด/รับชำระ/aging)
- `importWorkbook`: บันทึก `ImportLog` ทุกชนิด (เดิมเฉพาะรายได้)
- `importInstallmentMatrix`: gen งวดค้าง (lastInst+1..N, DatePay=null) จาก "งวดที่X/N"
- **Date fix**: `dmyFirst` (DD/MM ก่อน) ใน fuel/oil/installment/installment-matrix/accident — กันวันสลับเดือน (12/5 → ธ.ค.)
- **Repair fix**: ย้าย synonym `companyPay` ก่อน `taxEnd` + เพิ่ม `ราคารวม` — "ราคารวมภาษี7%" map ถูก
- `vehicle/expired.ts`: overdue/notification query กรอง `DatePay:null` + `Status:'active'`

**`vmbot-main`**
- `functions/expired.ts`: cron reminder กรอง `DatePay:null` + `Status:'active'`
- `prisma/schema.prisma`: `InstallmentsVehicle` sync (TextAlert → Amount/DatePay/PaymentEvidence) — build ต้องรัน `prisma generate`

**`vm-main`**
- AR panel บนหน้า dashboard + per-vehicle modal มี Amount/สถานะ/วันที่ชำระ (mark as paid)
- `PageDataAdmin`: history โชว์ทุกชนิด (ยอดเงินเฉพาะรายได้)

## ลำดับ deploy (manual — git push ไม่ auto-deploy)
1. [x] `vercel --prod` ใน **`vmbn-main`** ก่อน (ให้ endpoint ใหม่มีจริง ไม่งั้น frontend 500) — deployed 2026-06-12, READY (`nukyok-api.vercel.app`)
2. [x] `vercel --prod` ใน **`vmbot-main`** (build รัน `prisma generate` — schema เปลี่ยน, **ไม่ต้อง migrate DB**) — deployed 2026-06-12, READY (`nukyok-bot`)
3. [x] `vercel --prod` ใน **`vm-main`** — deployed 2026-06-12, READY (`nukyok`)

## Data remediation (แก้ข้อมูลเก่าที่ import ผิด)
> Deploy แค่กันพังในอนาคต **ไม่แก้ข้อมูลเก่า** ต้องลบ+re-import เพราะ:
> - น้ำมัน/ซ่อม: dedup key มีวันที่/ยอด → re-import วันที่ถูก = **เพิ่มแถวใหม่ ไม่ทับ** (ซ้ำ)
> - ค่างวด matrix: dedup key = `VehicleId|InstallmentNumber` → re-import **skip งวดเดิมเสมอ** วันที่/งวดค้างจะไม่อัปเดต

ทำใน หน้า **จัดการ/ลบข้อมูล** (admin):
1. [ ] **ลบ** ข้อมูล**ค่างวด** ทั้งหมด → re-import `dw-ตารางผ่อนรถประจำปี2569.xlsx` → ได้ paid วันที่ถูก + งวดค้าง gen (AR panel โชว์ครบกำหนด/เกินกำหนด)
2. [ ] **ลบ** ข้อมูล**น้ำมัน** (ช่วงที่ผิด) → re-import ไฟล์น้ำมัน 5 เดือน → เดือนถูก ไม่หลง Oct/Dec
3. [ ] **ลบ** ข้อมูล**ซ่อม (MA)** → re-import `ตาราง MA (ค่าซ่อม).xlsx` → companyPay ไม่หาย + sync แถวที่ขาด
4. [ ] ประกัน/พรบ: เบี้ย = 0 เพราะ**ไฟล์ไม่มีคอลัมน์เบี้ย** — ถ้าต้องการยอด ต้องเพิ่มคอลัมน์เบี้ย (header ตรง synonym: `ค่าเบี้ย`/`เบี้ยประกัน`/`เบี้ยรวม`) ในไฟล์ก่อน re-import
5. [ ] แก้ typo ในไฟล์ก่อน upload: น้ำมัน 02 เซลล์ `"21//2/2569"` (slash ซ้อน → ถูก skip)

## Verify หลัง remediation
- [ ] dashboard: AR cards/aging/รายการค้าง โชว์ตัวเลข; mark-as-paid ได้
- [ ] รายงานสรุป: ยอดน้ำมันรายเดือนตรง (Jan 209/612,395.89 … May 133/581,582.20), ไม่มีแถว Oct/Dec หลง
- [ ] จัดการ/ลบข้อมูล: ประวัติ import โชว์ครบทุกชนิด (ผ่อน/ประกัน/ซ่อม/น้ำมัน/รายได้)
- [ ] ค่างวด: งวดจ่ายแล้ว 85 + งวดค้าง gen (~504) — สถานะ derive ถูก
