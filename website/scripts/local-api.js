const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Telemetry Endpoint (POST)
app.post('/api/telemetry', async (req, res) => {
  const { command, nodeVersion, osPlatform, osRelease, error, stack } = req.body;
  console.log('Received telemetry:', { command, nodeVersion, osPlatform });

  try {
    if (error) {
      await prisma.crashReport.create({
        data: {
          command,
          nodeVersion,
          osPlatform,
          error: String(error),
          stack: stack || null,
        },
      });
      console.log('Crash report saved');
    } else {
      await prisma.telemetry.create({
        data: {
          command,
          nodeVersion,
          osPlatform,
          osRelease: osRelease || '',
        },
      });
      console.log('Telemetry saved');
    }
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    console.error('Error saving telemetry:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Stats Endpoint (GET)
app.get('/api/stats', async (req, res) => {
  try {
    const totalInstalls = await prisma.telemetry.count({
      where: { command: 'init' },
    });

    const nodeVersionsRaw = await prisma.telemetry.groupBy({
      by: ['nodeVersion'],
      _count: {
        nodeVersion: true,
      },
    });

    const nodeVersions = nodeVersionsRaw.map((item) => ({
      version: item.nodeVersion,
      count: item._count.nodeVersion,
    }));

    const osStatsRaw = await prisma.telemetry.groupBy({
      by: ['osPlatform'],
      _count: {
        osPlatform: true,
      },
    });

    const osStats = osStatsRaw.map((item) => ({
      platform: item.osPlatform,
      count: item._count.osPlatform,
    }));

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
      recentCrashes,
    });
  } catch (e) {
    console.error('Error fetching stats:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Local API server running at http://localhost:${port}`);
});
