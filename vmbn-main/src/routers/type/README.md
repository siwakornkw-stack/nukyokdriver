# Type Import API

API สำหรับนำเข้าข้อมูลประเภทต่างๆ ผ่านไฟล์ CSV

## Base URL
```
${urlApi}/type/
```

## Endpoints

### 1. Import Vehicle Brand
**POST** `/type/import-vehicle-brand`

นำเข้าข้อมูลยี่ห้อรถยนต์

**Headers:**
```
Content-Type: multipart/form-data
x-domain: domain
Authorization: Bearer ${accessToken}
```

**Body:** FormData with 'file' field

**ตัวอย่าง CSV:**
```csv
name
Toyota
Honda
Nissan
```

### 2. Import Vehicle Department
**POST** `/type/import-vehicle-department`

นำเข้าข้อมูลแผนกรถยนต์

**Headers:**
```
Content-Type: multipart/form-data
x-domain: domain
Authorization: Bearer ${accessToken}
```

**Body:** FormData with 'file' field

**ตัวอย่าง CSV:**
```csv
name
สำนักงานใหญ่
สาขากรุงเทพฯ
สาขานนทบุรี
```

### 3. Import Vehicle Driver
**POST** `/type/import-vehicle-driver`

นำเข้าข้อมูลคนขับรถ

**Headers:**
```
Content-Type: multipart/form-data
x-domain: domain
Authorization: Bearer ${accessToken}
```

**Body:** FormData with 'file' field

**ตัวอย่าง CSV:**
```csv
name
นายสมชาย ใจดี
นายสมศักดิ์ รักงาน
นางสาวสมหญิง เก่ง
```

### 4. Import Vehicle Owner
**POST** `/type/import-vehicle-owner`

นำเข้าข้อมูลเจ้าของรถ

**Headers:**
```
Content-Type: multipart/form-data
x-domain: domain
Authorization: Bearer ${accessToken}
```

**Body:** FormData with 'file' field

**ตัวอย่าง CSV:**
```csv
name
บริษัท เอ จำกัด
นาย ก. กา
นางสาว ข. ขา
```

### 5. Import Vehicle Type
**POST** `/type/import-vehicle-type`

นำเข้าข้อมูลประเภทรถ

**Headers:**
```
Content-Type: multipart/form-data
x-domain: domain
Authorization: Bearer ${accessToken}
```

**Body:** FormData with 'file' field

**ตัวอย่าง CSV:**
```csv
name
รถยนต์นั่งส่วนบุคคล
รถยนต์บรรทุก
รถจักรยานยนต์
```

### 6. Import Fuel Type
**POST** `/type/import-fuel-type`

นำเข้าข้อมูลประเภทเชื้อเพลิง

**Headers:**
```
Content-Type: multipart/form-data
x-domain: domain
Authorization: Bearer ${accessToken}
```

**Body:** FormData with 'file' field

**ตัวอย่าง CSV:**
```csv
name
เบนซิน
ดีเซล
แก๊สโซฮอล์ 91
```

## Response Format

### Success Response
```json
{
  "success": true,
  "code": 200,
  "message": "นำเข้าข้อมูลสำเร็จ",
  "data": [
    {
      "row": 1,
      "status": "success",
      "message": "เพิ่มข้อมูลสำเร็จ"
    },
    {
      "row": 2,
      "status": "error", 
      "message": "ข้อมูลซ้ำ"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "code": 400,
  "message": "เกิดข้อผิดพลาดในการนำเข้าข้อมูล",
  "data": null
}
```

## ข้อกำหนด

1. **ไฟล์ CSV** ต้องมีคอลัมน์ `name` เท่านั้น
2. **ขนาดไฟล์** สูงสุด 5MB
3. **รูปแบบไฟล์** รองรับเฉพาะ CSV เท่านั้น
4. **การตรวจสอบซ้ำ** ระบบจะตรวจสอบข้อมูลซ้ำตาม TenantId และ Name
5. **Status** ข้อมูลที่นำเข้าจะมี Status เป็น 'active' โดยอัตโนมัติ
6. **CreatedByUsername** จะบันทึกจากผู้ใช้ที่ทำการ import

## ข้อผิดพลาดที่อาจเกิดขึ้น

- `ไม่พบไฟล์ CSV` - ไม่มีการอัพโหลดไฟล์
- `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)` - ไฟล์มีขนาดเกินกำหนด
- `รองรับเฉพาะไฟล์ CSV เท่านั้น` - ไฟล์ไม่ใช่รูปแบบ CSV
- `รูปแบบไฟล์ CSV ไม่ถูกต้อง` - โครงสร้าง CSV ไม่ถูกต้อง
- `ไม่พบข้อมูลในคอลัมน์ name` - ไม่มีข้อมูลในคอลัมน์ name
- `ข้อมูลซ้ำ` - ข้อมูลมีอยู่แล้วในระบบ
- `ไม่พบข้อมูล Tenant` - ไม่พบข้อมูล Tenant ใน request 