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
import notificationRouters from './notification/notification.routes';
import dataAdminRouters from './dataadmin/dataadmin.routes';

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
routers.use(API_URL + '/notification', notificationRouters);
routers.use(API_URL + '/data-admin', dataAdminRouters);

export default routers;