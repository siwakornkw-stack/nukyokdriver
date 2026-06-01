import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Request, Response } from 'express';
import routers from "./routers/index";
import cookieParser from 'cookie-parser'
import * as middlewares from './routers/middlewares'

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use(middlewares.deserializeUser)

app.get('/', (req: Request, res: Response) => {
	res.send('Express + TypeScript Server');
});

app.use(routers);
app.use(middlewares.notFound)
app.use(middlewares.errorHandler)

// Only start a long-running listener when run directly (local/VPS).
// On Vercel the app is imported by api/index.ts as a serverless handler.
if (!process.env.VERCEL && process.env.PORT) {
	const PORT: number = parseInt(process.env.PORT as string, 10);
	app.listen(PORT, () => {
		console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
	});
}

export default app;
