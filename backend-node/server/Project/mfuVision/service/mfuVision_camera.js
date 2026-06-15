'use strict';

const prisma = require('../../../../lib/prisma');

/**
 * List all cameras in PostgreSQL.
 */
async function list() {
  return prisma.camera.findMany({
    orderBy: { cameraId: 'asc' }
  });
}

/**
 * Helper to parse camera URL into ipAddress and streamPath.
 */
function parseCameraUrl(urlInput) {
  let streamPath = String(urlInput || '').trim();
  let ipAddress = null;

  if (streamPath.match(/^(?:rtsp:\/\/|rtsp\/|http:\/\/|https:\/\/)/i)) {
    const match = streamPath.match(/^(?:rtsp:\/\/|rtsp\/|http:\/\/|https:\/\/)?(?:[^@\/\n]+@)?([^:\/\n]+(?::\d+)?)(.*)$/i);
    if (match) {
      ipAddress = match[1];
      streamPath = match[2] || '/';
    }
  }

  return { ipAddress, streamPath };
}

/**
 * Create a new camera.
 * Accepts:
 *   - location (string)
 *   - stream_path (string)
 *   - ip_address (string, optional)
 *   - status (string, optional, defaults to 'active')
 */
async function create(body) {
  if (!body || !body.location || !body.stream_path) {
    var error = new Error('Location and stream_path are required');
    error.status = 400;
    throw error;
  }

  const parsed = parseCameraUrl(body.stream_path);

  var data = {
    location: String(body.location).trim(),
    streamPath: parsed.streamPath,
    ipAddress: parsed.ipAddress || (body.ip_address ? String(body.ip_address).trim() : null),
    status: body.status ? String(body.status).trim() : 'active',
    installedAt: new Date()
  };

  return prisma.camera.create({ data: data });
}

/**
 * Remove a camera by ID.
 * Since Violations references Camera, we should delete or disconnect violations first
 * or map onUpdate / onDelete cascade in database. Since we do not want to delete
 * historical violation records, we should set cameraId to null for any violations that
 * referenced the deleted camera.
 */
async function remove(id) {
  var cameraId = parseInt(id, 10);
  if (isNaN(cameraId)) {
    var error = new Error('Invalid camera ID');
    error.status = 400;
    throw error;
  }

  try {
    // 1. Update referencing violations to set cameraId to null
    await prisma.violation.updateMany({
      where: { cameraId: cameraId },
      data: { cameraId: null }
    });

    // 2. Delete the camera record
    await prisma.camera.delete({
      where: { cameraId: cameraId }
    });

    return { deleted: true, id: cameraId };
  } catch (e) {
    if (e.code === 'P2025') {
      var notFoundError = new Error('Camera not found');
      notFoundError.status = 404;
      throw notFoundError;
    }
    throw e;
  }
}

/**
 * Find a camera by ID.
 */
async function findById(id) {
  var cameraId = parseInt(id, 10);
  if (isNaN(cameraId)) {
    var error = new Error('Invalid camera ID');
    error.status = 400;
    throw error;
  }
  return prisma.camera.findUnique({
    where: { cameraId: cameraId }
  });
}

/**
 * Update a camera.
 * Accepts:
 *   - location (string, optional)
 *   - stream_path (string, optional)
 *   - status (string, optional)
 */
async function update(id, body) {
  var cameraId = parseInt(id, 10);
  if (isNaN(cameraId)) {
    var error = new Error('Invalid camera ID');
    error.status = 400;
    throw error;
  }

  const data = {};
  if (body.location !== undefined) {
    data.location = String(body.location).trim();
  }

  if (body.stream_path !== undefined) {
    const parsed = parseCameraUrl(body.stream_path);
    data.streamPath = parsed.streamPath;
    if (parsed.ipAddress) {
      data.ipAddress = parsed.ipAddress;
    } else if (body.ip_address !== undefined) {
      data.ipAddress = body.ip_address ? String(body.ip_address).trim() : null;
    }
  } else if (body.ip_address !== undefined) {
    data.ipAddress = body.ip_address ? String(body.ip_address).trim() : null;
  }

  if (body.status !== undefined) {
    data.status = String(body.status).trim();
  }

  try {
    return await prisma.camera.update({
      where: { cameraId: cameraId },
      data: data
    });
  } catch (e) {
    if (e.code === 'P2025') {
      var notFoundError = new Error('Camera not found');
      notFoundError.status = 404;
      throw notFoundError;
    }
    throw e;
  }
}

module.exports = {
  list: list,
  create: create,
  update: update,
  remove: remove,
  findById: findById
};
