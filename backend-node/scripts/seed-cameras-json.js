'use strict';

const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');

function readJsonFile(filePath) {
  const absolutePath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(absolutePath)) {
    console.warn(`File not found: ${absolutePath}`);
    return null;
  }
  const buffer = fs.readFileSync(absolutePath);
  let text = buffer.toString('utf8');
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      let textUtf16 = buffer.toString('utf16le');
      if (textUtf16.charCodeAt(0) === 0xFEFF) {
        textUtf16 = textUtf16.slice(1);
      }
      return JSON.parse(textUtf16);
    } catch (e2) {
      console.error(`Failed to parse JSON for ${filePath}:`, e.message, e2.message);
      return null;
    }
  }
}

async function run() {
  console.log('Starting camera seeding process...');

  const cctv2 = readJsonFile('../../cameras/cctvinfo2.json');
  const oldcctv4 = readJsonFile('../../cameras/oldcctvinfo4.json');

  if (!cctv2 && !oldcctv4) {
    console.error('Error: Could not read any camera files.');
    process.exit(1);
  }

  try {
    // 1. Clean existing records safely
    console.log('Cleaning up existing camera assignments in violations table...');
    await prisma.violation.updateMany({ data: { cameraId: null } });

    console.log('Truncating cameras table...');
    await prisma.camera.deleteMany({});

    const cameraRecords = [];

    // 2. Parse new cameras (cctvinfo2.json)
    if (cctv2 && cctv2.length > 0) {
      console.log(`Processing ${cctv2.length} new cameras from cctvinfo2.json...`);
      cctv2.forEach((item) => {
        const name = String(item['CAMERA NAME_NEW'] || '').trim();
        const detail = String(item['Location'] || item['POSITION'] || '').trim();
        let cleanLocation = name;
        if (detail && detail.toLowerCase() !== name.toLowerCase()) {
          cleanLocation = `${name} (${detail})`;
        }

        const ip = String(item['IP ADDRESS'] || '').trim();
        let streamUrl = String(item['ANPR&PTZ RTSP'] || '').trim();

        // If URL is empty but IP is present, construct it
        if (!streamUrl && ip) {
          streamUrl = `rtsp://mfustream:Mediamfu2025@${ip}:554/Streaming/Channels/101/`;
        }

        if (cleanLocation && (ip || streamUrl)) {
          cameraRecords.push({
            location: cleanLocation,
            ipAddress: ip || null,
            streamPath: streamUrl || null,
            status: 'active',
            installedAt: new Date()
          });
        }
      });
    }

    // 3. Parse old cameras (oldcctvinfo4.json)
    if (oldcctv4 && oldcctv4.length > 0) {
      console.log(`Processing ${oldcctv4.length} old cameras from oldcctvinfo4.json...`);
      oldcctv4.forEach((item) => {
        const name = String(item['CAMERA NAME_NEW'] || '').trim();
        const detail = String(item['Location'] || item['POSITION'] || '').trim();
        let cleanLocation = name;
        if (detail && detail.toLowerCase() !== name.toLowerCase()) {
          cleanLocation = `${name} (${detail})`;
        }

        const ip = String(item['IP ADDRESS'] || '').trim();
        let streamUrl = String(item['ANPR&PTZ RTSP'] || '').trim();

        // If URL is empty but IP is present, construct it
        if (!streamUrl && ip) {
          streamUrl = `rtsp://mfustream:mediamfu2025@${ip}/Streaming/Channels/101`;
        }

        if (cleanLocation && (ip || streamUrl)) {
          cameraRecords.push({
            location: cleanLocation,
            ipAddress: ip || null,
            streamPath: streamUrl || null,
            status: 'active',
            installedAt: new Date()
          });
        }
      });
    }

    // 4. Batch insert into PostgreSQL
    console.log(`Inserting ${cameraRecords.length} cameras into PostgreSQL database...`);
    
    // Using prisma createMany
    const result = await prisma.camera.createMany({
      data: cameraRecords
    });

    console.log(`Seeding complete. Successfully inserted ${result.count} cameras.`);

  } catch (error) {
    console.error('Fatal error during camera seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
