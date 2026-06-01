import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runBot } from '../src/runBot';

// Triggered by Vercel Cron (see vercel.json). Vercel sends the request with an
// `Authorization: Bearer <CRON_SECRET>` header when CRON_SECRET is configured,
// which blocks public access to this endpoint.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await runBot();
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('ERROR: cron run failed:', error?.message);
    return res.status(500).json({ success: false, message: error?.message });
  }
}
