const express = require('express');
const cors = require('cors');
const path = require('path');

// Try to load .env from website root or project root
// Priority: website/.env > project root .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const statsHandler = require('../api/stats');
const telemetryHandler = require('../api/telemetry');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock Request/Response objects for Vercel functions
const adaptHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

app.get('/api/stats', adaptHandler(statsHandler));
app.all('/api/telemetry', adaptHandler(telemetryHandler));

app.listen(PORT, () => {
  console.log(`✅ Local API Server running at http://localhost:${PORT}`);
  console.log(`   - Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`   - Telemetry API: http://localhost:${PORT}/api/telemetry`);
  console.log(`   - Database URL: ${process.env.DATABASE_URL ? 'Loaded' : 'MISSING! (Check .env)'}`);
});
