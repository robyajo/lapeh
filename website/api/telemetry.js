const { PrismaClient } = require('@prisma/client');

// Use a global variable to prevent multiple instances in development (hot reloading)
// In production, this doesn't matter as much for serverless
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { command, nodeVersion, osPlatform, osRelease, error, stack } = req.body;

    try {
      if (error) {
        await prisma.crashReport.create({
          data: {
            command: command || 'unknown',
            nodeVersion: nodeVersion || 'unknown',
            osPlatform: osPlatform || 'unknown',
            error,
            stack,
            timestamp: new Date()
          }
        });
      } else {
        await prisma.telemetry.create({
          data: {
            command,
            nodeVersion,
            osPlatform,
            osRelease: osRelease || '',
            timestamp: new Date()
          }
        });
      }
      res.status(200).json({ status: 'ok' });
    } catch (e) {
      console.error('Telemetry Error:', e);
      res.status(500).json({ error: 'Internal Server Error', details: e.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
