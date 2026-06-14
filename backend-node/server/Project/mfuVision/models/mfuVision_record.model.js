// ====================================================================
// [DEPRECATED] — MFU Vision Mongoose Model
// This Mongoose schema is NO LONGER IN USE.
// The MFU Vision system has been migrated to PostgreSQL (database: nhelmet)
// managed via pgAdmin 4 and Prisma ORM.
// See: backend-node/prisma/schema.prisma  (Violation, Camera, Register, Administrator)
// See: backend-node/lib/prisma.js          (PrismaClient singleton)
// ====================================================================

// 'use strict';
//
// const mongoose = require('mongoose');
//
// const mfuVisionRecordSchema = new mongoose.Schema(
//   {
//     plate_number: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//       index: true
//     },
//     location: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     camera_id: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     violation_type: {
//       type: String,
//       trim: true,
//       enum: ['no_helmet', 'unauthorized_entry', 'speeding', 'other'],
//       default: 'no_helmet'
//     },
//     image_url: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     plate_image_url: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     confidence: {
//       type: Number,
//       min: 0,
//       max: 1,
//       default: 0
//     },
//     status: {
//       type: String,
//       trim: true,
//       enum: ['pending', 'approved', 'rejected'],
//       default: 'pending'
//     },
//     reviewer: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     review_note: {
//       type: String,
//       trim: true,
//       default: ''
//     },
//     ai_metadata: {
//       type: mongoose.Schema.Types.Mixed,
//       default: {}
//     }
//   },
//   {
//     timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
//     collection: 'mfu_records'
//   }
// );
//
// mfuVisionRecordSchema.index({ location: 1, timestamp: -1 });
// mfuVisionRecordSchema.index({ violation_type: 1 });
// mfuVisionRecordSchema.index({ status: 1 });
// mfuVisionRecordSchema.index({ plate_number: 1 });
//
// module.exports = mongoose.model('MfuVisionRecord', mfuVisionRecordSchema);
