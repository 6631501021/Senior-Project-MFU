'use strict';

const MfuVisionRecord = require('../models/mfuVision_record.model');

/**
 * List records with pagination and filters.
 * @param {Object} query - { page, limit, location, violation_type, status, from, to, plate_number, sort }
 */
async function list(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }
  if (query.violation_type) {
    filter.violation_type = String(query.violation_type).trim();
  }
  if (query.status) {
    filter.status = String(query.status).trim();
  }
  if (query.plate_number) {
    filter.plate_number = { $regex: query.plate_number, $options: 'i' };
  }
  if (query.camera_id) {
    filter.camera_id = String(query.camera_id).trim();
  }

  // Date range filter
  if (query.from || query.to) {
    filter.timestamp = {};
    if (query.from) {
      filter.timestamp.$gte = new Date(query.from);
    }
    if (query.to) {
      filter.timestamp.$lte = new Date(query.to);
    }
  }

  const sortField = query.sort || '-timestamp';
  const total = await MfuVisionRecord.countDocuments(filter);
  const records = await MfuVisionRecord.find(filter)
    .sort(sortField)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    records: records,
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
async function stats(plateNumber) {
  const now = new Date();

  // Start of today (local midnight approximation in UTC)
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  // One hour ago
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // Build optional plate number filter
  const filter = {};
  if (plateNumber) {
    filter.plate_number = { $regex: plateNumber, $options: 'i' };
  }

  const violationsToday = await MfuVisionRecord.countDocuments(Object.assign({
    timestamp: { $gte: startOfToday }
  }, filter));

  const violationsLastHour = await MfuVisionRecord.countDocuments(Object.assign({
    timestamp: { $gte: oneHourAgo }
  }, filter));

  const totalRecords = await MfuVisionRecord.countDocuments(filter);

  // Active cameras = distinct camera_id values with records in last 24h
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const activeCameras = await MfuVisionRecord.distinct('camera_id', Object.assign({
    timestamp: { $gte: oneDayAgo }
  }, filter));

  // Detection rate: percentage of no_helmet vs total in last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalWeek = await MfuVisionRecord.countDocuments(Object.assign({
    timestamp: { $gte: sevenDaysAgo }
  }, filter));
  const helmetsWeek = await MfuVisionRecord.countDocuments(Object.assign({
    timestamp: { $gte: sevenDaysAgo },
    violation_type: 'no_helmet'
  }, filter));
  const detectionRate = totalWeek > 0 ? Math.round((helmetsWeek / totalWeek) * 100) : 0;

  // New weekly and monthly total violations counts
  const violationsWeek = totalWeek;
  const violationsMonth = await MfuVisionRecord.countDocuments(Object.assign({
    timestamp: { $gte: thirtyDaysAgo }
  }, filter));

  // Hourly trend for last 24 hours
  const hourlyTrend = await MfuVisionRecord.aggregate([
    { $match: Object.assign({ timestamp: { $gte: oneDayAgo } }, filter) },
    {
      $group: {
        _id: { $hour: '$timestamp' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Daily trend for last 7 days
  const dailyTrend = await MfuVisionRecord.aggregate([
    { $match: Object.assign({ timestamp: { $gte: sevenDaysAgo } }, filter) },
    {
      $group: {
        _id: { $dayOfWeek: '$timestamp' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Violation type breakdown
  const typeBreakdown = await MfuVisionRecord.aggregate([
    { $match: Object.assign({ timestamp: { $gte: sevenDaysAgo } }, filter) },
    {
      $group: {
        _id: '$violation_type',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Location breakdown (cross-gate analysis)
  const locationBreakdown = await MfuVisionRecord.aggregate([
    { $match: Object.assign({ timestamp: { $gte: sevenDaysAgo } }, filter) },
    {
      $group: {
        _id: '$location',
        total: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        noHelmet: {
          $sum: { $cond: [{ $eq: ['$violation_type', 'no_helmet'] }, 1, 0] }
        }
      }
    },
    { $sort: { total: -1 } }
  ]);

  return {
    violations_today: violationsToday,
    violations_last_hour: violationsLastHour,
    violations_week: violationsWeek,
    violations_month: violationsMonth,
    total_records: totalRecords,
    active_cameras: activeCameras.length,
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
  const record = await MfuVisionRecord.findById(id).lean();
  if (!record) {
    const error = new Error('Record not found');
    error.status = 404;
    throw error;
  }
  return record;
}

/**
 * Create a new record.
 */
async function create(body) {
  if (!body) {
    const error = new Error('Request body is required');
    error.status = 400;
    throw error;
  }

  const data = {
    plate_number: body.plate_number || '',
    timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
    location: body.location || '',
    camera_id: body.camera_id || '',
    violation_type: body.violation_type || 'no_helmet',
    image_url: body.image_url || '',
    plate_image_url: body.plate_image_url || '',
    confidence: body.confidence != null ? Number(body.confidence) : 0,
    status: body.status || 'pending',
    reviewer: body.reviewer || '',
    review_note: body.review_note || '',
    ai_metadata: body.ai_metadata || {}
  };

  const record = new MfuVisionRecord(data);
  return record.save();
}

/**
 * Update a record.
 */
async function update(id, body) {
  if (!id) {
    const error = new Error('Record ID is required');
    error.status = 400;
    throw error;
  }

  const allowedFields = [
    'plate_number', 'location', 'camera_id', 'violation_type',
    'image_url', 'plate_image_url', 'confidence', 'status',
    'reviewer', 'review_note', 'ai_metadata'
  ];

  const updates = {};
  allowedFields.forEach(function (field) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  });

  const record = await MfuVisionRecord.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!record) {
    const error = new Error('Record not found');
    error.status = 404;
    throw error;
  }
  return record;
}

/**
 * Remove a record by ID.
 */
async function remove(id) {
  if (!id) {
    const error = new Error('Record ID is required');
    error.status = 400;
    throw error;
  }

  const record = await MfuVisionRecord.findByIdAndDelete(id).lean();
  if (!record) {
    const error = new Error('Record not found');
    error.status = 404;
    throw error;
  }
  return { deleted: true, id: id };
}

/**
 * Seed demo data for testing purposes.
 */
async function seedDemo() {
  const locations = [
    'Main Gate - IN', 'Main Gate - OUT',
    'Dormitory Gate - IN', 'Dormitory Gate - OUT',
    'Medical Center Gate', 'Engineering Gate'
  ];
  const cameras = ['CAM-001', 'CAM-002', 'CAM-003', 'CAM-004', 'CAM-005', 'CAM-006'];
  const plates = [
    '1กก-8822', '3กb-1234', 'ษร-999', '2ขค-5678',
    'กท-4455', '7มม-0011', '9บพ-3344', 'รย-7788',
    '5ศษ-2299', '1กร-6677', '4จฉ-8811', '6ทท-5522'
  ];
  const types = ['no_helmet', 'no_helmet', 'no_helmet', 'unauthorized_entry'];
  const statuses = ['pending', 'pending', 'approved', 'rejected'];

  const records = [];
  const now = Date.now();

  for (var i = 0; i < 50; i++) {
    var hoursAgo = Math.floor(Math.random() * 168); // up to 7 days
    records.push({
      plate_number: plates[Math.floor(Math.random() * plates.length)],
      timestamp: new Date(now - hoursAgo * 60 * 60 * 1000),
      location: locations[Math.floor(Math.random() * locations.length)],
      camera_id: cameras[Math.floor(Math.random() * cameras.length)],
      violation_type: types[Math.floor(Math.random() * types.length)],
      image_url: '',
      plate_image_url: '',
      confidence: parseFloat((0.7 + Math.random() * 0.28).toFixed(2)),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reviewer: '',
      review_note: '',
      ai_metadata: {
        model: 'helmet_train1(3).pt',
        inference_time_ms: Math.floor(20 + Math.random() * 80),
        detections: Math.floor(1 + Math.random() * 4)
      }
    });
  }

  const result = await MfuVisionRecord.insertMany(records);
  return { inserted: result.length };
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
