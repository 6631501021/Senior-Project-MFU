'use strict';
const mfuVisionCamera = require('../server/Project/mfuVision/service/mfuVision_camera');
const prisma = require('../lib/prisma');

async function test() {
  console.log('Testing camera creation with full RTSP URL...');

  const payload = {
    location: 'Test ANPR Camera 1',
    stream_path: 'rtsp://mfustream:mediamfu2025@172.28.107.28:554/cam/realmonitor?channel=1&subtype=0'
  };

  try {
    const created = await mfuVisionCamera.create(payload);
    console.log('Successfully created camera:');
    console.log(JSON.stringify(created, null, 2));

    // Verify fields stored in DB
    const stored = await prisma.camera.findUnique({
      where: { cameraId: created.cameraId }
    });

    console.log('\nStored columns in PostgreSQL:');
    console.log('ipAddress:', stored.ipAddress);
    console.log('streamPath:', stored.streamPath);
    console.log('location:', stored.location);

    if (stored.ipAddress === '172.28.107.28:554' && stored.streamPath === '/cam/realmonitor?channel=1&subtype=0') {
      console.log('\n>>> SUCCESS: URL was parsed correctly! <<<');
    } else {
      console.error('\n>>> FAILURE: URL parsed fields mismatch! <<<');
    }

    // Clean up
    console.log('\nCleaning up test camera...');
    await mfuVisionCamera.remove(created.cameraId);
    console.log('Cleanup completed.');

  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
