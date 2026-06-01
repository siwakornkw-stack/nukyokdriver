// Vercel serverless entrypoint. An Express app is itself a (req, res) handler,
// so we hand the whole app to Vercel. vercel.json rewrites every path here.
import app from '../src/server';

export default app;
