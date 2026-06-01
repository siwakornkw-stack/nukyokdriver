import { Router } from 'express'
import { requireUser } from '../middlewares'
import * as UserController from './users.controllers'
import multer from 'multer'
import { blobStorage } from '../../utils/storage'

const router = Router()

router.get(
    '/',
    requireUser,
    UserController.user
)

router.get(
    '/check-line',
    requireUser,
    UserController.checkLine
)

const storageImageVehicle = blobStorage('users')
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
    UserController.uploadImageUser
)
router.post(
    '/update',
    requireUser,
    UserController.updateUser
)

router.post(
    '/update-password',
    requireUser,
    UserController.updatePassword
)

export default router