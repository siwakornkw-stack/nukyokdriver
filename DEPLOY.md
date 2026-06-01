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
