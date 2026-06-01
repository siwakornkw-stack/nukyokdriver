# Settings API

API สำหรับจัดการการตั้งค่า (Settings) ของระบบ โดยใช้ Tenant ID ในการแยกข้อมูล

## Middleware

### requireTenant
Middleware ใหม่ที่ใช้ตรวจสอบ token และดึงข้อมูล tenantId จาก ParsedToken โดยไม่ต้องตรวจสอบ customerId เหมือน requireUser

## Endpoints

### GET /settings
ดึงรายการการตั้งค่าทั้งหมดของ tenant

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): กรองตาม category
- `key` (optional): กรองตาม key

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "SettingConfigId": "uuid",
      "TenantId": "tenant-id",
      "Key": "setting-key",
      "Value": "setting-value",
      "Category": "setting-category"
    }
  ],
  "message": "Settings retrieved successfully"
}
```

### GET /settings/:id
ดึงการตั้งค่าเฉพาะตาม ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "SettingConfigId": "uuid",
    "TenantId": "tenant-id",
    "Key": "setting-key",
    "Value": "setting-value",
    "Category": "setting-category"
  },
  "message": "Setting retrieved successfully"
}
```

### POST /settings
สร้างการตั้งค่าใหม่

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "key": "setting-key",
  "value": "setting-value",
  "category": "setting-category"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "SettingConfigId": "uuid",
    "TenantId": "tenant-id",
    "Key": "setting-key",
    "Value": "setting-value",
    "Category": "setting-category"
  },
  "message": "Setting created successfully"
}
```

### PUT /settings/:id
อัปเดตการตั้งค่า

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "key": "updated-key",
  "value": "updated-value",
  "category": "updated-category"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully"
}
```

### DELETE /settings/:id
ลบการตั้งค่า

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

## การใช้งาน

1. ใช้ middleware `requireTenant` แทน `requireUser` เพื่อตรวจสอบเฉพาะ tenantId
2. ข้อมูลจะถูกแยกตาม TenantId ในฐานข้อมูล
3. สามารถกรองข้อมูลได้ตาม category และ key
4. มีการ validate ข้อมูลด้วย Zod schema

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Tenant ID is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Setting not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to get settings"
}
``` 