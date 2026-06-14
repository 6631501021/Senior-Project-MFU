'use strict';

const prisma = require('../../../../lib/prisma');

/**
 * Maps PostgreSQL Prisma Violation object to legacy Mongo-compatible object
 * so that frontend views (e.g. timestamp, violation_type, image_url) work out of the box.
 */
function formatToTimezoneLessISO(date) {
  if (!date) return null;
  if (date instanceof Date) {
    try {
      return date.toISOString().slice(0, -1);
    } catch (e) {
      return date;
    }
  }
  return date;
}

function mapViolationToLegacy(violation) {
  if (!violation) return null;
  const ts = formatToTimezoneLessISO(violation.occurredAt);
  return {
    _id: violation.violationId,
    id: violation.violationId,
    timestamp: ts,
    location: violation.camera ? violation.camera.location : 'Unknown',
    camera_id: violation.cameraId != null ? String(violation.cameraId) : '',
    violation_type: mapToLegacyType(violation.violationsType),
    image_url: violation.imagePath,
    confidence: violation.confidenceScore,
    plate_number: violation.licensePlate || 'N/A',
    status: 'pending',

    violationId: violation.violationId,
    cameraId: violation.cameraId,
    licensePlate: violation.licensePlate,
    violationsType: violation.violationsType,
    imagePath: violation.imagePath,
    confidenceScore: violation.confidenceScore,
    occurredAt: violation.occurredAt,
    camera: violation.camera
  };
}

function mapToLegacyType(type) {
  if (!type) return 'no_helmet';
  const val = String(type).toLowerCase().replace('-', '_');
  if (val === 'non_helmet' || val === 'no_helmet') {
    return 'no_helmet';
  }
  if (val === 'unauthorized_entry' || val === 'unauthorized') {
    return 'unauthorized_entry';
  }
  if (val === 'speeding') {
    return 'speeding';
  }
  return 'other';
}


/**
 * List records with pagination and filters.
 * @param {Object} query - { page, limit, location, violation_type, from, to, license_plate, sort }
 */
async function list(query) {
  var page = Math.max(parseInt(query.page, 10) || 1, 1);
  var limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  var skip = (page - 1) * limit;

  var where = {};

  // Filter by camera location (through camera relation)
  if (query.location) {
    where.camera = {
      location: { contains: query.location, mode: 'insensitive' }
    };
  }
  if (query.violation_type) {
    where.violationsType = String(query.violation_type).trim();
  }
  // license_plate filter (nhelmet uses license_plate instead of plate_number)
  if (query.plate_number || query.license_plate) {
    var plateVal = query.plate_number || query.license_plate;
    where.licensePlate = { contains: plateVal, mode: 'insensitive' };
  }
  if (query.camera_id) {
    var camId = parseInt(query.camera_id, 10);
    if (!isNaN(camId)) {
      where.cameraId = camId;
    }
  }

  // Date range filter
  if (query.from || query.to) {
    where.occurredAt = {};
    if (query.from) {
      where.occurredAt.gte = new Date(query.from);
    }
    if (query.to) {
      where.occurredAt.lte = new Date(query.to);
    }
  }

  // Sort field
  var orderBy = { occurredAt: 'desc' }; // default
  if (query.sort) {
    var sortStr = String(query.sort);
    if (sortStr.charAt(0) === '-') {
      orderBy = {};
      var field = sortStr.substring(1);
      orderBy[field === 'timestamp' ? 'occurredAt' : field] = 'desc';
    } else {
      orderBy = {};
      orderBy[sortStr === 'timestamp' ? 'occurredAt' : sortStr] = 'asc';
    }
  }

  var total = await prisma.violation.count({ where: where });
  var records = await prisma.violation.findMany({
    where: where,
    orderBy: orderBy,
    skip: skip,
    take: limit,
    include: { camera: true }
  });

  return {
    records: records.map(mapViolationToLegacy),
    pagination: {
      page: page,
      limit: limit,
      total: total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get aggregated statistics.
 */
async function stats(licensePlate) {
  var now = new Date();

  // Start of today (local midnight approximation in UTC)
  var startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // Time boundaries
  var oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  var oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  var sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Build optional license plate filter
  var baseWhere = {};
  if (licensePlate) {
    baseWhere.licensePlate = { contains: licensePlate, mode: 'insensitive' };
  }

  var violationsToday = await prisma.violation.count({
    where: Object.assign({}, baseWhere, { occurredAt: { gte: startOfToday } })
  });

  var violationsLastHour = await prisma.violation.count({
    where: Object.assign({}, baseWhere, { occurredAt: { gte: oneHourAgo } })
  });

  var totalRecords = await prisma.violation.count({ where: baseWhere });

  // Active cameras = distinct camera_id values with records in last 24h
  var activeCameraRecords = await prisma.violation.findMany({
    where: Object.assign({}, baseWhere, { occurredAt: { gte: oneDayAgo }, cameraId: { not: null } }),
    distinct: ['cameraId'],
    select: { cameraId: true }
  });

  // Detection rate: percentage of Non-Helmet vs total in last 7 days
  var totalWeek = await prisma.violation.count({
    where: Object.assign({}, baseWhere, { occurredAt: { gte: sevenDaysAgo } })
  });
  var helmetsWeek = await prisma.violation.count({
    where: Object.assign({}, baseWhere, {
      occurredAt: { gte: sevenDaysAgo },
      violationsType: 'Non-Helmet'
    })
  });
  var detectionRate = totalWeek > 0 ? Math.round((helmetsWeek / totalWeek) * 100) : 0;

  var violationsWeek = totalWeek;
  var violationsMonth = await prisma.violation.count({
    where: Object.assign({}, baseWhere, { occurredAt: { gte: thirtyDaysAgo } })
  });

  // Hourly trend for last 24 hours (raw SQL)
  var hourlyTrendQuery = licensePlate
    ? prisma.$queryRaw`
        SELECT EXTRACT(HOUR FROM occurred_at)::int AS "_id", COUNT(*)::int AS "count"
        FROM violations
        WHERE occurred_at >= ${oneDayAgo}
          AND license_plate ILIKE ${'%' + licensePlate + '%'}
        GROUP BY EXTRACT(HOUR FROM occurred_at)
        ORDER BY "_id" ASC
      `
    : prisma.$queryRaw`
        SELECT EXTRACT(HOUR FROM occurred_at)::int AS "_id", COUNT(*)::int AS "count"
        FROM violations
        WHERE occurred_at >= ${oneDayAgo}
        GROUP BY EXTRACT(HOUR FROM occurred_at)
        ORDER BY "_id" ASC
      `;
  var hourlyTrend = await hourlyTrendQuery;

  // Daily trend for last 7 days
  var dailyTrendQuery = licensePlate
    ? prisma.$queryRaw`
        SELECT EXTRACT(DOW FROM occurred_at)::int AS "_id", COUNT(*)::int AS "count"
        FROM violations
        WHERE occurred_at >= ${sevenDaysAgo}
          AND license_plate ILIKE ${'%' + licensePlate + '%'}
        GROUP BY EXTRACT(DOW FROM occurred_at)
        ORDER BY "_id" ASC
      `
    : prisma.$queryRaw`
        SELECT EXTRACT(DOW FROM occurred_at)::int AS "_id", COUNT(*)::int AS "count"
        FROM violations
        WHERE occurred_at >= ${sevenDaysAgo}
        GROUP BY EXTRACT(DOW FROM occurred_at)
        ORDER BY "_id" ASC
      `;
  var dailyTrend = await dailyTrendQuery;

  // Violation type breakdown
  var typeBreakdownRaw = await prisma.violation.groupBy({
    by: ['violationsType'],
    where: Object.assign({}, baseWhere, { occurredAt: { gte: sevenDaysAgo } }),
    _count: { violationId: true },
    orderBy: { _count: { violationId: 'desc' } }
  });
  var typeBreakdown = typeBreakdownRaw.map(function (row) {
    return { _id: row.violationsType, count: row._count.violationId };
  });

  // Location breakdown — via camera relation (join cameras table)
  var locationBreakdownRaw = await prisma.$queryRaw`
    SELECT c.location AS "_id",
           COUNT(*)::int AS "total",
           AVG(v.confidence_score) AS "avgConfidence",
           COUNT(*) FILTER (WHERE v.violations_type = 'Non-Helmet')::int AS "noHelmet"
    FROM violations v
    JOIN cameras c ON v.camera_id = c.camera_id
    WHERE v.occurred_at >= ${sevenDaysAgo}
    GROUP BY c.location
    ORDER BY "total" DESC
  `;
  var locationBreakdown = locationBreakdownRaw.map(function (row) {
    return {
      _id: row._id,
      total: row.total,
      avgConfidence: parseFloat(row.avgConfidence) || 0,
      noHelmet: row.noHelmet
    };
  });

  return {
    violations_today: violationsToday,
    violations_last_hour: violationsLastHour,
    violations_week: violationsWeek,
    violations_month: violationsMonth,
    total_records: totalRecords,
    active_cameras: activeCameraRecords.length,
    detection_rate: detectionRate,
    hourly_trend: hourlyTrend,
    daily_trend: dailyTrend,
    type_breakdown: typeBreakdown,
    location_breakdown: locationBreakdown
  };
}

/**
 * Find a single record by ID.
 */
async function findById(id) {
  var violationId = parseInt(id, 10);
  if (isNaN(violationId)) {
    var error = new Error('Invalid record ID');
    error.status = 400;
    throw error;
  }

  var record = await prisma.violation.findUnique({
    where: { violationId: violationId },
    include: { camera: true }
  });
  if (!record) {
    var notFoundError = new Error('Record not found');
    notFoundError.status = 404;
    throw notFoundError;
  }
  return mapViolationToLegacy(record);
}

/**
 * Create a new record.
 * Accepts field names from:
 *   - AI service (plate_number, violation_type, image_url, confidence)
 *   - nhelmet DB columns (license_plate, violations_type, image_path, confidence_score)
 */
async function create(body) {
  if (!body) {
    var error = new Error('Request body is required');
    error.status = 400;
    throw error;
  }

  // Resolve camera_id (accept integer directly)
  var cameraId = null;
  if (body.camera_id != null) {
    var parsed = parseInt(body.camera_id, 10);
    if (!isNaN(parsed)) cameraId = parsed;
  }

  var data = {
    licensePlate: body.license_plate || body.plate_number || null,
    occurredAt: body.timestamp ? new Date(body.timestamp) : new Date(),
    cameraId: cameraId,
    violationsType: body.violations_type || body.violation_type || 'Non-Helmet',
    imagePath: body.image_url || body.image_path || '',
    confidenceScore: body.confidence != null ? Number(body.confidence) : (body.confidence_score != null ? Number(body.confidence_score) : 0),
  };

  const record = await prisma.violation.create({
    data: data,
    include: { camera: true }
  });
  return mapViolationToLegacy(record);
}

/**
 * Update a record.
 */
async function update(id, body) {
  var violationId = parseInt(id, 10);
  if (isNaN(violationId)) {
    var error = new Error('Record ID is required');
    error.status = 400;
    throw error;
  }

  // Map incoming field names to Prisma model field names (nhelmet columns)
  var fieldMapping = {
    license_plate: 'licensePlate',
    plate_number: 'licensePlate',
    camera_id: 'cameraId',
    violations_type: 'violationsType',
    violation_type: 'violationsType',
    image_url: 'imagePath',
    image_path: 'imagePath',
    confidence: 'confidenceScore',
    confidence_score: 'confidenceScore',
  };

  var updates = {};
  Object.keys(fieldMapping).forEach(function (inputField) {
    if (body[inputField] !== undefined) {
      updates[fieldMapping[inputField]] = body[inputField];
    }
  });

  try {
    var record = await prisma.violation.update({
      where: { violationId: violationId },
      data: updates,
      include: { camera: true }
    });
    return mapViolationToLegacy(record);
  } catch (e) {
    if (e.code === 'P2025') {
      var notFoundError = new Error('Record not found');
      notFoundError.status = 404;
      throw notFoundError;
    }
    throw e;
  }
}

/**
 * Remove a record by ID.
 */
async function remove(id) {
  var violationId = parseInt(id, 10);
  if (isNaN(violationId)) {
    var error = new Error('Record ID is required');
    error.status = 400;
    throw error;
  }

  try {
    await prisma.violation.delete({
      where: { violationId: violationId }
    });
    return { deleted: true, id: id };
  } catch (e) {
    if (e.code === 'P2025') {
      var notFoundError = new Error('Record not found');
      notFoundError.status = 404;
      throw notFoundError;
    }
    throw e;
  }
}

/**
 * Seed demo data for testing purposes.
 */
async function seedDemo() {
  // Get camera IDs from the cameras table so we can reference them
  var cameras = await prisma.camera.findMany({ select: { cameraId: true } });
  var cameraIds = cameras.map(function (c) { return c.cameraId; });

  var plates = [
    '1กก-8822', '3กb-1234', 'ษร-999', '2ขค-5678',
    'กท-4455', '7มม-0011', '9บพ-3344', 'รย-7788',
    '5ศษ-2299', '1กร-6677', '4จฉ-8811', '6ทท-5522'
  ];
  var types = ['Non-Helmet', 'Non-Helmet', 'Non-Helmet', 'unauthorized_entry'];

  var records = [];
  var now = Date.now();

  for (var i = 0; i < 50; i++) {
    var hoursAgo = Math.floor(Math.random() * 168); // up to 7 days
    records.push({
      licensePlate: plates[Math.floor(Math.random() * plates.length)],
      occurredAt: new Date(now - hoursAgo * 60 * 60 * 1000),
      cameraId: cameraIds.length > 0 ? cameraIds[Math.floor(Math.random() * cameraIds.length)] : null,
      violationsType: types[Math.floor(Math.random() * types.length)],
      imagePath: '/uploads/demo_' + i + '.jpg',
      confidenceScore: parseFloat((0.7 + Math.random() * 0.28).toFixed(2)),
    });
  }

  var result = await prisma.violation.createMany({ data: records });
  return { inserted: result.count };
}

module.exports = {
  list: list,
  stats: stats,
  findById: findById,
  create: create,
  update: update,
  remove: remove,
  seedDemo: seedDemo
};
