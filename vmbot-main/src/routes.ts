import { Router } from 'express';
import { db } from './utils/db.server';

import * as os from 'os';
import { format } from 'date-fns';
import axios, { AxiosRequestConfig } from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { randomUUID } from "crypto";
import multer from 'multer';
import express from 'express';

const upload = multer();
const routes = Router();
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const notifyTelegramMsg = multer({ storage: multer.memoryStorage() });

routes.get('/', async (req, res) => {
    res.send('Winloss streak API.');
});

export default routes;