const { PrismaClient } = require('@prisma/client');

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // 1. Total Installs (count of unique CLI 'init' or 'create' events)
      const totalInstalls = await prisma.telemetry.count({
        where: {
            command: {
                in: ['init', 'create']
            }
        }
      });
      
      // 2. Node Versions Distribution
      const nodeVersionsRaw = await prisma.telemetry.groupBy({
        by: ['nodeVersion'],
        _count: { nodeVersion: true }
      });
      
      const nodeVersions = nodeVersionsRaw.map((item) => ({
        version: item.nodeVersion,
        count: item._count.nodeVersion,
      }));

      // 3. OS Stats
      const osStatsRaw = await prisma.telemetry.groupBy({
        by: ['osPlatform'],
        _count: { osPlatform: true }
      });

      const osStats = osStatsRaw.map((item) => ({
        platform: item.osPlatform,
        count: item._count.osPlatform,
      }));

      // 4. Lapeh CLI Version Distribution
      const cliVersionsRaw = await prisma.telemetry.groupBy({
        by: ['cliVersion'],
        _count: { cliVersion: true }
      });

      const cliVersions = cliVersionsRaw.map((item) => ({
        version: item.cliVersion,
        count: item._count.cliVersion,
      }));

      // 5. Recent Crashes
      const recentCrashes = await prisma.crashReport.findMany({
        take: 10,
        orderBy: {
          timestamp: 'desc',
        },
      });

      res.status(200).json({
        totalInstalls,
        nodeStats: {
          labels: nodeVersions.map(n => n.version),
          data: nodeVersions.map(n => n.count)
        },
        osStats: {
          labels: osStats.map(o => o.platform),
          data: osStats.map(o => o.count)
        },
        cliStats: {
            labels: cliVersions.map(c => c.version),
            data: cliVersions.map(c => c.count)
        },
        recentCrashes,
      });
    } catch (e) {
      console.error('Stats Error:', e);
      res.status(500).json({ error: 'Internal Server Error', details: e.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
