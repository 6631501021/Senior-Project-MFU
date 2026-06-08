// app.js
const express = require('express');
const initialize = require("../helpers/initialize");
const middlewares = require('../middleware/middlewares');
const swagger = require('../swagger/swagger');
const routes = require('../server/routes/app.routes');
const { corsOptions } = require('./corsAndIP');
const runtimeAccessSettings = require('../helpers/runtime-access-settings');
const databaseBackup = require('../server/Project/settings/service/database_backup');

let isReady = false;

module.exports = function () {
  const app = express();
  runtimeAccessSettings.bindExpressApp(app);

  // Swagger setup
  swagger(app);

  app.get('/healthz', (req, res) => {
    if (isReady) {
      res.status(200).send('OK');
    } else {
      res.status(503).send('Service Unavailable');
    }
  });

  initialize.init(async function (status) {
    if (status) {
      await runtimeAccessSettings.prime();
      await databaseBackup.primeAutoBackup().catch((err) => {
        console.error('Database backup scheduler prime failed:', err && err.message ? err.message : err);
      });
      middlewares(app);
      app.options('*', require('cors')(corsOptions));

      // Load routes
      routes(app);

      // MFU Vision video stream proxies (no auth, direct proxy to AI service)
      const mfuStream = require('../server/Project/mfuVision/service/mfuVision_stream');
      app.get('/video_helmet', mfuStream.proxyHelmetStream);
      app.get('/video_moto', mfuStream.proxyMotoStream);
      app.get('/video_plate', mfuStream.proxyPlateStream);
      app.get('/video_gate_ms_out', mfuStream.proxyRtspGateOut);
      app.get('/video_gate_ms_in', mfuStream.proxyRtspGateIn);

      // Legacy API endpoint alias for PROJECT_SUMMARY compatibility (no auth, returns 10 latest records)
      const mfuVisionRecord = require('../server/Project/mfuVision/service/mfuVision_record');
      app.get('/api/records', async function (req, res) {
        try {
          const result = await mfuVisionRecord.list({ limit: 10, sort: '-timestamp' });
          res.status(200).json({
            code: 20000,
            message: 'Success',
            data: result.records || []
          });
        } catch (error) {
          res.status(500).json({
            code: 50000,
            message: error.message || 'Failed to fetch records'
          });
        }
      });

      // Health check endpoint
      const mongoose = require('mongoose');
      app.get('/health', function (req, res) {
        const dbState = mongoose.connection.readyState;
        const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
        const healthy = dbState === 1;
        res.status(healthy ? 200 : 503).json({
          status: healthy ? 'ok' : 'degraded',
          uptime: process.uptime(),
          database: dbStatus,
          timestamp: new Date().toISOString()
        });
      });

      isReady = true;
    }
  });

  return app;
};
