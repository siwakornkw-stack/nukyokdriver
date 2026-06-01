import express from 'express';
import userRouter from './reports';
import { requireUser } from '../middlewares';
const routers = express.Router();

routers.use('/', requireUser, userRouter);


export default routers;