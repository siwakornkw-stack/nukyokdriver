# Deploy vm-main (Frontend) บน Vercel

Frontend นี้เป็น Next.js 14 — Vercel รองรับโดยตรง ไม่ต้องแก้โค้ด แค่ตั้งค่าตามนี้

## 1. นำเข้าโปรเจกต์
- Vercel → **Add New → Project** → เลือก repo
- ถ้าเป็น repo รวม 3 โฟลเดอร์ (monorepo): ตั้ง **Root Directory = `vm-main`**
- Framework Preset: **Next.js** (Vercel ตรวจให้อัตโนมัติ)
- Build Command / Output: ปล่อย default (`next build`)

## 2. ตั้ง Environment Variables
Settings → Environment Variables (ดูรายการเต็มใน `.env.example`):

| Key | ตัวอย่างค่า |
| --- | --- |
| `NEXT_PUBLIC_URL_API` | `https://your-backend-domain.com` |
| `NEXT_PUBLIC_URL_IMAGE` | `https://your-backend-domain.com` |
| `NEXT_PUBLIC_HOST_IMAGE` | `your-backend-domain.com` (hostname อย่างเดียว) |

> ค่าขึ้นต้น `NEXT_PUBLIC_` ถูก inline ตอน build — ถ้าแก้ค่าต้อง **Redeploy**

## 3. Deploy
กด **Deploy** รอ build เสร็จ

## ข้อควรรู้
- `NEXT_PUBLIC_HOST_IMAGE` ต้องตรงกับ host ของรูปที่เสิร์ฟแบบ https ไม่งั้น `next/image` จะบล็อก (ดู `next.config.mjs`)
- Backend (`vmbn-main`) ต้องเปิด **CORS** ให้โดเมน Vercel และต้องเป็น **https**
- ESLint ถูกตั้งให้ไม่บล็อก build (`eslint.ignoreDuringBuilds`) — ส่วน TypeScript ยังบล็อกอยู่ ถ้า build ตกเพราะ TS error ต้องแก้โค้ดก่อน

## backend / bot
`vmbn-main` (Express + SSE + Redis + อัปโหลดไฟล์ลงดิสก์) และ `vmbot-main` (cron) **ไม่เหมาะกับ Vercel serverless** ให้โฮสต์ที่ VPS/Railway/Render ตามเดิม แล้วชี้ `NEXT_PUBLIC_URL_API` มาที่ backend นั้น
