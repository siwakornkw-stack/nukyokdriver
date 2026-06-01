import express from 'express';
import multer from 'multer';
import { requireUser } from '../middlewares';
import { TypeController } from './type.controllers';

const router = express.Router();

// Configure multer for CSV upload
const uploadCSV = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('รองรับเฉพาะไฟล์ CSV เท่านั้น'));
        }
    }
});

// Generic error handler for multer
const handleMulterError = (req: any, res: any, next: any) => {
    uploadCSV.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: err.code === 'LIMIT_FILE_SIZE' 
                    ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                    : err.message,
                data: null
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                code: 400,
                message: err.message,
                data: null
            });
        }
        next();
    });
};

// 1. Import Vehicle Brand
router.post(
    '/import-vehicle-brand',
    requireUser,
    handleMulterError,
    TypeController.importVehicleBrand
);

// 2. Import Vehicle Department
router.post(
    '/import-vehicle-department',
    requireUser,
    handleMulterError,
    TypeController.importVehicleDepartment
);

// 3. Import Vehicle Driver
router.post(
    '/import-vehicle-driver',
    requireUser,
    handleMulterError,
    TypeController.importVehicleDriver
);

// 4. Import Vehicle Owner
router.post(
    '/import-vehicle-owner',
    requireUser,
    handleMulterError,
    TypeController.importVehicleOwner
);

// 5. Import Vehicle Type
router.post(
    '/import-vehicle-type',
    requireUser,
    handleMulterError,
    TypeController.importVehicleType
);

// 6. Import Fuel Type
router.post(
    '/import-fuel-type',
    requireUser,
    handleMulterError,
    TypeController.importFuelType
);

export default router; 