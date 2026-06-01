import * as dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();

import { runBot } from './runBot';

const cronTime: string = process.env.CRON_RUN as string;

console.log("vehicle-management-bot running.");

// Local / VPS mode: schedule the job with node-cron.
// On Vercel the job is triggered by Vercel Cron via api/cron.ts instead.
if (cronTime) {
  console.log('initiated cron job ', cronTime);
  cron.schedule(`${cronTime}`, () => {
    runBot();
  });
}
