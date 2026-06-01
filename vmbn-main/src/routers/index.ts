import express from 'express';
import authRouters from './auths/auth.routes';
import userRouters from './users/users.routes';
import vehicleRouters from './vehicle/vehicle.routes';
import lineRouters from './line/line.routes';
import dashboardRouters from './dashboard/dashboard.routes';
import summaryRouters from './summary/summary.routes';
import typeRouters from './type/type.routes';
import settingRouters from './settings/setting.routes';
import driverJobRouters from './driverjob/driverjob.routes';
import importDataRouters from './importdata/importdata.routes';
import { connectSSE, sendMessage } from './sse/sse.controllers';
import { requireUserSSE } from './middlewares';
//import { sseService } from '../services/sse.service';

const API_URL = process.env.API_URL || ''


const routers = express.Router();

// Uploaded files live in Vercel Blob (see utils/storage.ts). The database keeps
// the original `/uploads/<folder>/<file>` paths, so redirect those to the public
// Blob URL. BLOB_PUBLIC_BASE_URL has no trailing slash, e.g.
// https://<store-id>.public.blob.vercel-storage.com
const BLOB_BASE = process.env.BLOB_PUBLIC_BASE_URL || ''
routers.get(API_URL + '/uploads/*', (req, res) => {
    const objectPath = req.path.slice(API_URL.length) // -> /uploads/<folder>/<file>
    res.redirect(`${BLOB_BASE}${objectPath}`)
})

routers.use(API_URL + '/auth', authRouters);
routers.use(API_URL + '/users', userRouters);
routers.use(API_URL + '/vehicle', vehicleRouters);
routers.use(API_URL + '/line', lineRouters);
routers.use(API_URL + '/dashboard', dashboardRouters);
routers.use(API_URL + '/summary', summaryRouters);
routers.use(API_URL + '/type', typeRouters);
routers.use(API_URL + '/settings', settingRouters);
routers.use(API_URL + '/driver-job', driverJobRouters);
routers.use(API_URL + '/import', importDataRouters);

// SSE Routes
routers.get(API_URL + '/sse/connect', requireUserSSE, connectSSE);
routers.post(API_URL + '/sse/send', requireUserSSE, sendMessage);

/* routers.get(API_URL + '/sse/test', (req, res) => {
    sseService.sendMessage('47635c8e-3497-4cf7-8aa4-ccfc2bc62e58', {
        type: 'notification',
        data: {
            title: 'ยืนยันการสมัครสมาชิก',
            message: 'ยืนยันการสมัครสมาชิกสำเร็จ',
            timestamp: new Date()
        }
    })
    res.send('Hello World');
}); */

export default routers;