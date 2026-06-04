'use strict';

const express = require('express');
const router = express.Router();

const account = require('../accounts/service/account');
const mfuVisionRecord = require('./service/mfuVision_record');
const accountAccess = require('../security/service/account-access');

async function checkAdmin(request) {
  const accountId = request.authAccount && request.authAccount._id;
  if (!accountId) return false;
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

// Get a single record by ID
router.get('/records/:id', async function (request, response) {
  try {
    const record = await mfuVisionRecord.findById(request.params.id);
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      const userPlate = request.authAccount.licensePlate || (request.authAccount.userinfo && request.authAccount.userinfo.licensePlate) || '';
      const recordPlate = record.plate_number || '';
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

// Update a record (approve/reject/edit)
router.put('/records/:id', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot edit records'
      });
    }
    return ok(response, await mfuVisionRecord.update(request.params.id, request.body || {}));
  } catch (error) {
    return fail(response, error);
  }
});

// Delete a record
router.delete('/records/:id', async function (request, response) {
  try {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return response.status(403).json({
        code: 40300,
        message: 'Forbidden: Regular users cannot delete records'
      });
    }
    return ok(response, await mfuVisionRecord.remove(request.params.id));
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

module.exports = router;
