'use strict';

const express = require('express');
const router = express.Router();

const account = require('../accounts/service/account');
const mfuVisionRecord = require('./service/mfuVision_record');

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
    return ok(response, await mfuVisionRecord.list(request.query || {}));
  } catch (error) {
    return fail(response, error);
  }
});

// Get aggregated statistics
router.get('/records/stats', async function (request, response) {
  try {
    return ok(response, await mfuVisionRecord.stats());
  } catch (error) {
    return fail(response, error);
  }
});

// Get a single record by ID
router.get('/records/:id', async function (request, response) {
  try {
    return ok(response, await mfuVisionRecord.findById(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

// Update a record (approve/reject/edit)
router.put('/records/:id', async function (request, response) {
  try {
    return ok(response, await mfuVisionRecord.update(request.params.id, request.body || {}));
  } catch (error) {
    return fail(response, error);
  }
});

// Delete a record
router.delete('/records/:id', async function (request, response) {
  try {
    return ok(response, await mfuVisionRecord.remove(request.params.id));
  } catch (error) {
    return fail(response, error);
  }
});

// Seed demo data
router.post('/records/seed-demo', async function (request, response) {
  try {
    return ok(response, await mfuVisionRecord.seedDemo(), 201);
  } catch (error) {
    return fail(response, error);
  }
});

module.exports = router;
