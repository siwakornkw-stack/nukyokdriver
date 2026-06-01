import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../../typings/express';
import { ParsedToken } from '../../typings/token';
import { parse } from 'csv-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ImportResult {
    row: number;
    status: 'success' | 'error';
    message: string;
}

export class TypeController {
    // Generic CSV import function
    private static async importCSVData(
        req: IGetUserAuthInfoRequest,
        res: Response,
        modelName: string,
        fieldName: string
    ) {
        try {
            const parsedToken: ParsedToken | undefined = req.parsedToken;
            if (!parsedToken) {
                return res.status(401).json({
                    success: false,
                    code: 401,
                    message: 'Unauthorized',
                    data: null
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'ไม่พบไฟล์ CSV',
                    data: null
                });
            }

            const tenantId = parsedToken.tenantId;

            if (!tenantId) {
                return res.status(400).json({
                    success: false,
                    code: 400,
                    message: 'ไม่พบข้อมูล Tenant',
                    data: null
                });
            }

            const csvData = req.file.buffer.toString('utf-8');
            const results: ImportResult[] = [];

            return new Promise((resolve, reject) => {
                parse(csvData, {
                    columns: true,
                    skip_empty_lines: true,
                    trim: true
                }, async (err, records) => {
                    if (err) {
                        return resolve(res.status(400).json({
                            success: false,
                            code: 400,
                            message: 'รูปแบบไฟล์ CSV ไม่ถูกต้อง',
                            data: null
                        }));
                    }

                    try {
                        for (let i = 0; i < records.length; i++) {
                            const record = records[i];
                            const row = i + 1;

                            // ตรวจสอบว่าข้อมูลมีอยู่จริง - ใช้วิธีอื่นในการเข้าถึงข้อมูล
                            let fieldValue = record[fieldName];
                            
                            // หากไม่สามารถเข้าถึงได้ ให้ลองใช้ Object.values
                            if (!fieldValue && Object.keys(record).length === 1) {
                                fieldValue = Object.values(record)[0];
                            }
                            
                            // หากยังไม่ได้ ให้ลองใช้ Object.entries
                            if (!fieldValue) {
                                const entries = Object.entries(record);
                                if (entries.length > 0) {
                                    fieldValue = entries[0][1];
                                }
                            }

                            if (!fieldValue) {
                                results.push({
                                    row,
                                    status: 'error',
                                    message: `ไม่พบข้อมูลในคอลัมน์ ${fieldName}`
                                });
                                continue;
                            }

                            // ตรวจสอบว่าข้อมูลไม่เป็น null หรือ undefined
                            if (fieldValue === null || fieldValue === undefined || fieldValue.toString().trim() === '') {
                                results.push({
                                    row,
                                    status: 'error',
                                    message: `ข้อมูลในคอลัมน์ ${fieldName} เป็นค่าว่าง`
                                });
                                continue;
                            }

                            try {
                                // Validate model name exists in Prisma client
                                if (!(prisma as any)[modelName]) {
                                    results.push({
                                        row,
                                        status: 'error',
                                        message: `Model ${modelName} ไม่พบในระบบ`
                                    });
                                    continue;
                                }

                                // Check if record already exists
                                const existingRecord = await (prisma as any)[modelName].findFirst({
                                    where: {
                                        TenantId: tenantId,
                                        Name: fieldValue
                                    }
                                });

                                if (existingRecord) {
                                    results.push({
                                        row,
                                        status: 'error',
                                        message: 'ข้อมูลซ้ำ'
                                    });
                                    continue;
                                }

                                // Create new record
                                const newRecord = await (prisma as any)[modelName].create({
                                    data: {
                                        TenantId: tenantId,
                                        Name: fieldValue,
                                        Status: 'active',
                                        CreatedByUsername: parsedToken.username || 'system',
                                        CreatedAt: new Date(),
                                        UpdatedAt: new Date()
                                    }
                                });

                                results.push({
                                    row,
                                    status: 'success',
                                    message: 'เพิ่มข้อมูลสำเร็จ'
                                });
                            } catch (dbError) {
                                const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
                                
                                results.push({
                                    row,
                                    status: 'error',
                                    message: `เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${errorMessage}`
                                });
                            }
                        }

                        return resolve(res.json({
                            success: true,
                            code: 200,
                            message: 'นำเข้าข้อมูลสำเร็จ',
                            data: results
                        }));
                    } catch (error) {
                        return resolve(res.status(500).json({
                            success: false,
                            code: 500,
                            message: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล',
                            data: null
                        }));
                    }
                });
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                code: 500,
                message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
                data: null
            });
        }
    }

    // 1. Import Vehicle Brand
    static async importVehicleBrand(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
        return TypeController.importCSVData(req, res, 'VehicleBrand', 'name');
    }

    // 2. Import Vehicle Department
    static async importVehicleDepartment(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
        return TypeController.importCSVData(req, res, 'VehicleDepartment', 'name');
    }

    // 3. Import Vehicle Driver
    static async importVehicleDriver(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
        return TypeController.importCSVData(req, res, 'VehicleDriver', 'name');
    }

    // 4. Import Vehicle Owner
    static async importVehicleOwner(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
        return TypeController.importCSVData(req, res, 'VehicleOwner', 'name');
    }

    // 5. Import Vehicle Type
    static async importVehicleType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
        return TypeController.importCSVData(req, res, 'VehicleType', 'name');
    }

    // 6. Import Fuel Type
    static async importFuelType(req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) {
        return TypeController.importCSVData(req, res, 'FuelType', 'name');
    }
} 