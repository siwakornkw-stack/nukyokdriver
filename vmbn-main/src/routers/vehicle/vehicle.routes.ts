import { Router } from 'express'
import { requireUser, requireWrite } from '../middlewares'
import * as VehicleController from './vehicle.controllers'
import multer from 'multer'
import { blobStorage, tmpStorage } from '../../utils/storage'

const router = Router()

router.get(
    '/',
    requireUser,
    VehicleController.getVehicleAll
)

router.get(
    '/option',
    requireUser,
    VehicleController.getAllOptionVehicle
)

router.get(
    '/option-driver',
    requireUser,
    VehicleController.getOptionDriver
)

router.get(
    '/option-payment-status',
    requireUser,
    VehicleController.getOptionPaymentStatus
)

const storageImageVehicle = blobStorage('vehicle')
const uploadImageVehicle = multer({
    storage: storageImageVehicle,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png' , 'image/jpg' , 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const error = new Error('ประเภทไฟล์ไม่ได้รับอนุญาต') as any;
            error.code = 'INVALID_FILE_TYPE';
            cb(error);
        }
    }
});
router.post(
    '/image',
    requireUser,
    (req, res, next) => {
        uploadImageVehicle.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.uploadImageVehicle
)

router.post(
    '/add',
    requireUser,
    VehicleController.addVehicle
)

router.post(
    '/update/:id',
    requireUser,
    VehicleController.updateVehicle
)

router.get(
    '/tax/:id',
    requireUser,
    VehicleController.getTaxByIdVehicle
)

router.post(
    '/tax/add/:id',
    requireUser,
    VehicleController.addVehicleTax
)
router.post(
    '/tax/update/:id',
    requireUser,
    VehicleController.updateVehicleTax
)

router.get(
    '/compulsory-motor-insurance/:id',
    requireUser,
    VehicleController.getCompulsoryMotorInsuranceByIdVehicle
)

router.post(
    '/compulsory-motor-insurance/add/:id',
    requireUser,
    VehicleController.addCompulsoryMotorInsuranceVehicle
)
router.post(
    '/compulsory-motor-insurance/update/:id',
    requireUser,
    VehicleController.updateCompulsoryMotorInsuranceVehicle
)

router.get(
    '/insurance-policy/:id',
    requireUser,
    VehicleController.getInsurancePolicyByIdVehicle
)
router.post(
    '/insurance-policy/add/:id',
    requireUser,
    VehicleController.addInsurancePolicyVehicle
)
router.post(
    '/insurance-policy/update/:id',
    requireUser,
    VehicleController.updateInsurancePolicyVehicle
)

router.get(
    '/attach-file/:id',
    requireUser,
    VehicleController.getAttachFileByIdVehicle
)

const storage = blobStorage('vehicle-attachments')
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const error = new Error('ประเภทไฟล์ไม่ได้รับอนุญาต') as any;
            error.code = 'INVALID_FILE_TYPE';
            cb(error);
        }
    }
});

router.post(
    '/attach-file/add/:id',
    requireUser,
    (req, res, next) => {
        upload.array('files')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.addAttachFileVehicle
)
router.post(
    '/attach-file/update/:id',
    requireUser,
    VehicleController.updateAttachFileVehicle
)

router.get(
    '/car-tires/:id',
    requireUser,
    VehicleController.getCarTiresByIdVehicle
)
router.post(
    '/car-tires/add/:id',
    requireUser,
    VehicleController.addCarTires   
)
router.post(
    '/car-tires/update/:id',
    requireUser,
    VehicleController.updateCarTires
)

router.get(
    '/accident-vehicle/:id',
    requireUser,
    VehicleController.getAccidentVehicleByIdVehicle
)
router.post(
    '/accident-vehicle/add/:id',
    requireUser,
    VehicleController.addAccidentVehicle   
)
router.post(
    '/accident-vehicle/update/:id',
    requireUser,
    VehicleController.updateAccidentVehicle
)

router.get(
    '/repair-vehicle/:id',
    requireUser,
    VehicleController.getRepairVehicleByIdVehicle
)
router.post(
    '/repair-vehicle/add/:id',
    requireUser,
    VehicleController.addRepairVehicle   
)
router.post(
    '/repair-vehicle/update/:id',
    requireUser,
    VehicleController.updateRepairVehicle
)

router.get(
    '/gasoline-cost/:id',
    requireUser,
    VehicleController.getGasolineCostByIdVehicle
)
router.post(
    '/gasoline-cost/add/:id',
    requireUser,
    VehicleController.addGasolineCost   
)
router.post(
    '/gasoline-cost/update/:id',
    requireUser,
    VehicleController.updateGasolineCost
)

router.get(
    '/drain-oil/:id',
    requireUser,
    VehicleController.getDrainTheOilVehicleByIdVehicle
)
router.post(
    '/drain-oil/add/:id',
    requireUser,
    VehicleController.addDrainTheOilVehicle   
)
router.post(
    '/drain-oil/update/:id',
    requireUser,
    VehicleController.updateDrainTheOilVehicle
)


router.get(
    '/installments/:id',
    requireUser,
    VehicleController.getInstallmentsVehicleByIdVehicle
)
router.post(
    '/installments/add/:id',
    requireUser,
    VehicleController.addInstallmentsVehicle   
)
router.post(
    '/installments/update/:id',
    requireUser,
    VehicleController.updateInstallmentsVehicle
)

router.get(
    '/image/:id',
    requireUser,
    VehicleController.getImageVehicleByIdVehicle
)

const storageImage = blobStorage('vehicle-images')
const uploadImage = multer({
    storage: storageImage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png' , 'image/jpg' , 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const error = new Error('ประเภทไฟล์ไม่ได้รับอนุญาต') as any;
            error.code = 'INVALID_FILE_TYPE';
            cb(error);
        }
    }
});
router.post(
    '/image/add/:id',
    requireUser,
    (req, res, next) => {
        uploadImage.array('files')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.addImageVehicle
)


router.get(
    '/income/:id',
    requireUser,
    VehicleController.getIncomeVehicleByIdVehicle
)
router.post(
    '/income/add/:id',
    requireUser,
    VehicleController.addIncomeVehicle   
)
router.post(
    '/income/update/:id',
    requireUser,
    VehicleController.updateIncomeVehicle
)
router.post(
    '/income/delete/:id',
    requireUser,
    VehicleController.deleteIncomeVehicle
)

router.get(
    '/vehicle-type',
    requireUser,
    VehicleController.getVehicleType
)
router.post(
    '/vehicle-type/add',
    requireUser,
    VehicleController.addVehicleType
)
router.post(
    '/vehicle-type/update/:id',
    requireUser,
    VehicleController.updateVehicleType
)

router.get(
    '/vehicle-brand',
    requireUser,
    VehicleController.getVehicleBrand
)
router.post(
    '/vehicle-brand/add',
    requireUser,
    VehicleController.addVehicleBrand
)
router.post(
    '/vehicle-brand/update/:id',
    requireUser,
    VehicleController.updateVehicleBrand
)

router.get(
    '/vehicle-owner',
    requireUser,
    VehicleController.getVehicleOwner
)
router.post(
    '/vehicle-owner/add',
    requireUser,
    VehicleController.addVehicleOwner
)
router.post(
    '/vehicle-owner/update/:id',
    requireUser,
    VehicleController.updateVehicleOwner
)

router.get(
    '/vehicle-department',
    requireUser,
    VehicleController.getVehicleDepartment
)
router.post(
    '/vehicle-department/add',
    requireUser,
    VehicleController.addVehicleDepartment
)
router.post(
    '/vehicle-department/update/:id',
    requireUser,
    VehicleController.updateVehicleDepartment
)

router.get(
    '/vehicle-driver',
    requireUser,
    VehicleController.getVehicleDriver
)
router.get(
    '/vehicle-driver/manage',
    requireUser,
    VehicleController.getDriversManaged
)
router.post(
    '/vehicle-driver/add',
    requireUser,
    requireWrite,
    VehicleController.addVehicleDriver
)
router.post(
    '/vehicle-driver/update/:id',
    requireUser,
    requireWrite,
    VehicleController.updateVehicleDriver
)
router.delete(
    '/vehicle-driver/delete/:id',
    requireUser,
    requireWrite,
    VehicleController.deleteVehicleDriver
)

router.get(
    '/vehicle-status',
    requireUser,
    VehicleController.getVehicleStatus
)
router.post(
    '/vehicle-status/add',
    requireUser,
    VehicleController.addVehicleStatus
)
router.post(
    '/vehicle-status/update/:id',
    requireUser,
    VehicleController.updateVehicleStatus
)

router.get(
    '/fuel-type',
    requireUser,
    VehicleController.getFuelType
)
router.post(
    '/fuel-type/add',
    requireUser,
    VehicleController.addFuelType
)
router.post(
    '/fuel-type/update/:id',
    requireUser,
    VehicleController.updateFuelType
)

router.get(
    '/notification',
    requireUser,
    VehicleController.getNotification
)

const uploadCSV = multer({
    storage: tmpStorage('.csv'),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            const error = new Error('กรุณาอัพโหลดไฟล์ CSV เท่านั้น') as any;
            error.code = 'INVALID_FILE_TYPE';
            cb(error);
        }
    }
});

router.post(
    '/import',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importVehicle
)

router.post(
    '/import-tax/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importTax
)

router.post(
    '/import-compulsory-motor-insurance/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importCompulsoryMotorInsurance
)

router.post(
    '/import-insurance-policy/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importInsurancePolicy
)

router.post(
    '/import-car-tires/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importCarTires
)

router.post(
    '/import-accident-vehicle/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importAccidentVehicle
)

router.post(
    '/import-repair-vehicle/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importRepairVehicle
)

router.post(
    '/import-gasoline-cost/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importGasolineCost
)

router.post(
    '/import-drain-oil/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importDrainOil
)

router.post(
    '/import-installments/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importInstallments
)

router.post(
    '/import-income/:id',
    requireUser,
    (req, res, next) => {
        uploadCSV.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.importIncome
)

// ================== อัปโหลดไฟล์กลาง ==================
const createStorage = (folder: string) => blobStorage(folder)
const createUploadConfig = (folder: string, allowedTypes: string[]) => multer({
    storage: createStorage(folder),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) cb(null, true);
        else {
            const error = new Error('ประเภทไฟล์ไม่ได้รับอนุญาต') as any;
            error.code = 'INVALID_FILE_TYPE';
            cb(error);
        }
    }
});
router.post(
    '/upload-file/:type',
    requireUser,
    (req, res, next) => {
        const type = req.params.type;
        let uploadConfig;
        switch (type) {
            case 'tax':
                uploadConfig = createUploadConfig('tax-documents', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
                break;
            case 'compulsory-insurance':
                uploadConfig = createUploadConfig('compulsory-insurance', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
                break;
            case 'insurance-policy':
                uploadConfig = createUploadConfig('insurance-policy', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
                break;
            case 'installment':
                uploadConfig = createUploadConfig('installment-documents', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
                break;
            case 'accident':
                uploadConfig = createUploadConfig('accident-documents', ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']);
                break;
            default:
                return res.status(400).json({ success: false, message: 'ประเภทไฟล์ไม่ถูกต้อง' });
        }
        uploadConfig.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: err.code === 'LIMIT_FILE_SIZE' 
                        ? 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)' 
                        : err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    },
    VehicleController.uploadFile
)

// ================== ตรวจสอบ / ลบข้อมูลซ้ำ ==================
router.get(
    '/duplicates',
    requireUser,
    VehicleController.getDuplicateVehicles
)
router.post(
    '/duplicates/delete',
    requireUser,
    VehicleController.bulkDeleteVehicles
)

// ================== ลบข้อมูลตาม type ==================
router.delete(
    '/:type/delete/:id',
    requireUser,
    VehicleController.deleteVehicleData
)

// ================== ลบข้อมูล master data ==================
router.delete(
    '/type/:type/delete/:id',
    requireUser,
    VehicleController.deleteTypeData
)

// ================== ลบข้อมูล vehicle ==================
router.delete(
    '/delete/:id',
    requireUser,
    VehicleController.deleteVehicle
)

export default router
