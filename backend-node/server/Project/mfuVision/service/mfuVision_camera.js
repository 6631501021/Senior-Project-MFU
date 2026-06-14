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

  var data = {
    location: String(body.location).trim(),
    streamPath: String(body.stream_path).trim(),
    ipAddress: body.ip_address ? String(body.ip_address).trim() : null,
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

module.exports = {
  list: list,
  create: create,
  remove: remove,
  findById: findById
};
