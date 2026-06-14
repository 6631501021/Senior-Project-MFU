'use strict';

const express = require('express');
const router = express.Router();

const account = require('../accounts/service/account');
const mfuVisionRecord = require('./service/mfuVision_record');
const mfuVisionCamera = require('./service/mfuVision_camera');
const accountAccess = require('../security/service/account-access');

async function checkAdmin(request) {
  const account = request.authAccount;
  if (!account) return false;
  const role = account.role || (account.userinfo && account.userinfo.role);
  if (role === 'admin') return true;

  const accountId = account._id;
  const evaluation = await accountAccess.evaluatePermission(accountId, '/newsystem/registry', 'view');
  return !!(evaluation && evaluation.allowed);
}

function ok(response, data, status) {
  return response.status(status || 200).json({
    code: 20000,
    message: 'Success',
    data: data
  });
}

function fail(response, error) {
  var status = error && error.status ? error.status : 500;
  return response.status(status).json({
    code: status === 400 ? 40000 : status === 404 ? 40400 : 50000,
    message: error && error.message ? error.message : 'MFU Vision request failed'
  });
}

// Create a new record (used by AI service or manual entry - unauthenticated for local/M2M access)
router.post('/records', async function (request, response) {
  try {
    return ok(response, await mfuVisionRecord.create(request.body || {}), 201);
  } catch (error) {
    return fail(response, error);
  }
});

// Dynamic Camera Stream Route (Unauthenticated so HTML <img> tags can request it directly)
router.get('/cameras/:id/stream', async function (request, response) {
  try {
    const camId = parseInt(request.params.id, 10);
    if (isNaN(camId)) {
      return response.status(400).json({ code: 40000, message: 'Invalid camera ID' });
    }

    const camera = await mfuVisionCamera.findById(camId);
    if (!camera) {
      return response.status(404).json({ code: 40400, message: 'Camera not found' });
    }

    const streamPath = camera.streamPath || '';
    const ipAddress = camera.ipAddress || '';

    // If it's a relative proxy path (like /video_helmet, /video_moto, etc.)
    if (streamPath.startsWith('/') && !streamPath.startsWith('/Streaming/')) {
      const mfuStream = require('./service/mfuVision_stream');
      if (streamPath === '/video_helmet') return mfuStream.proxyHelmetStream(request, response);
      if (streamPath === '/video_moto') return mfuStream.proxyMotoStream(request, response);
      if (streamPath === '/video_plate') return mfuStream.proxyPlateStream(request, response);
      if (streamPath === '/video_gate_ms_out') return mfuStream.proxyRtspGateOut(request, response);
      if (streamPath === '/video_gate_ms_in') return mfuStream.proxyRtspGateIn(request, response);
    }

    // Construct RTSP URL dynamically if IP and path are provided
    if (ipAddress && streamPath.startsWith('/')) {
      const rtspUrl = `rtsp://mfustream:Mediamfu2025@${ipAddress}:554${streamPath}`;
      console.log(`[Dynamic Stream] Spawning RTSP stream for Camera ${camId} (${camera.location}) -> ${rtspUrl}`);
      const mfuStream = require('./service/mfuVision_stream');
      const handler = mfuStream.createDynamicRtspHandler(rtspUrl);
      return handler(request, response);
    }

    // Fallback: If it's a full RTSP/HTTP URL
    if (streamPath.startsWith('rtsp://') || streamPath.startsWith('rtsp/')) {
      const mfuStream = require('./service/mfuVision_stream');
      const handler = mfuStream.createDynamicRtspHandler(streamPath);
      return handler(request, response);
    }

    // Default fallback local video
    const mfuStream = require('./service/mfuVision_stream');
    return mfuStream.proxyHelmetStream(request, response);
  } catch (error) {
    console.error('[Dynamic Stream Error]:', error);
    return response.status(500).json({ code: 50000, message: 'Failed to initialize stream', error: error.message });
  }
});

router.use(account.onCheckAuthorization);

// List records with pagination and filters
router.get('/records', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    const query = request.query || {};
    if (!isAdmin) {
      const userPlate = request.authAccount.licensePlate || (request.authAccount.userinfo && request.authAccount.userinfo.licensePlate) || '';
      query.plate_number = userPlate || '__NONE__';
    }
    return ok(response, await mfuVisionRecord.list(query));
  } catch (error) {
    return fail(response, error);
  }
});

// Get aggregated statistics
router.get('/records/stats', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    let plateNumber = null;
    if (!isAdmin) {
      plateNumber = request.authAccount.licensePlate || (request.authAccount.userinfo && request.authAccount.userinfo.licensePlate) || '__NONE__';
    }
    return ok(response, await mfuVisionRecord.stats(plateNumber));
  } catch (error) {
    return fail(response, error);
  }
});

// Get a single record by ID (PostgreSQL integer PK)
router.get('/records/:id', async function (request, response) {
  try {
    var recordId = parseInt(request.params.id, 10);
    if (isNaN(recordId)) {
      return response.status(400).json({
        code: 40000,
        message: 'Invalid record ID: must be an integer'
      });
    }
    const record = await mfuVisionRecord.findById(recordId);
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      const userPlate = request.authAccount.licensePlate || (request.authAccount.userinfo && request.authAccount.userinfo.licensePlate) || '';
      const recordPlate = record.licensePlate || record.license_plate || '';
      if (!userPlate || String(recordPlate).toLowerCase().trim() !== String(userPlate).toLowerCase().trim()) {
        return response.status(403).json({
          code: 40300,
          message: 'Access Denied: You do not own this record'
        });
      }
    }
    return ok(response, record);
  } catch (error) {
    return fail(response, error);
  }
});

// Update a record (approve/reject/edit) — PostgreSQL integer PK
router.put('/records/:id', async function (request, response) {
  try {
    var recordId = parseInt(request.params.id, 10);
    if (isNaN(recordId)) {
      return response.status(400).json({
        code: 40000,
        message: 'Invalid record ID: must be an integer'
      });
    }
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot edit records'
      });
    }
    return ok(response, await mfuVisionRecord.update(recordId, request.body || {}));
  } catch (error) {
    return fail(response, error);
  }
});

// Delete a record — PostgreSQL integer PK
router.delete('/records/:id', async function (request, response) {
  try {
    var recordId = parseInt(request.params.id, 10);
    if (isNaN(recordId)) {
      return response.status(400).json({
        code: 40000,
        message: 'Invalid record ID: must be an integer'
      });
    }
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot delete records'
      });
    }
    return ok(response, await mfuVisionRecord.remove(recordId));
  } catch (error) {
    return fail(response, error);
  }
});

// Seed demo data
router.post('/records/seed-demo', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot seed records'
      });
    }
    return ok(response, await mfuVisionRecord.seedDemo(), 201);
  } catch (error) {
    return fail(response, error);
  }
});

// ==========================================
// Camera Management Routes (PostgreSQL)
// ==========================================

// Get all cameras
router.get('/cameras', async function (request, response) {
  try {
    return ok(response, await mfuVisionCamera.list());
  } catch (error) {
    return fail(response, error);
  }
});

// Create a new camera (Admin only)
router.post('/cameras', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot create cameras'
      });
    }
    return ok(response, await mfuVisionCamera.create(request.body || {}), 201);
  } catch (error) {
    return fail(response, error);
  }
});

// Delete a camera (Admin only)
router.delete('/cameras/:id', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot delete cameras'
      });
    }
    var camId = parseInt(request.params.id, 10);
    if (isNaN(camId)) {
      return response.status(400).json({
        code: 40000,
        message: 'Invalid camera ID: must be an integer'
      });
    }
    return ok(response, await mfuVisionCamera.remove(camId));
  } catch (error) {
    return fail(response, error);
  }
});

module.exports = router;
