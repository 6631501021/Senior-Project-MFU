'use strict';
const mfuVisionCamera = require('../server/Project/mfuVision/service/mfuVision_camera');
const prisma = require('../lib/prisma');

async function test() {
  console.log('Testing camera creation and subsequent update...');

  try {
    // 1. Create initial camera
    const created = await mfuVisionCamera.create({
      location: 'Test Camera Init',
      stream_path: 'rtsp://mfustream:mediamfu2025@172.28.107.28:554/cam/realmonitor?channel=1&subtype=0'
    });
    console.log('Created camera:', created.cameraId);

    // 2. Perform update
    const updated = await mfuVisionCamera.update(created.cameraId, {
      location: 'Test Camera Updated',
      stream_path: 'rtsp://mfustream:Mediamfu2025@172.30.50.12/Streaming/Channels/101'
    });
    console.log('Updated camera returned response:');
    console.log(JSON.stringify(updated, null, 2));

    // 3. Verify in PostgreSQL
    const stored = await prisma.camera.findUnique({
      where: { cameraId: created.cameraId }
    });

    console.log('\nVerify stored columns:');
    console.log('location:', stored.location);
    console.log('ipAddress:', stored.ipAddress);
    console.log('streamPath:', stored.streamPath);

    if (stored.location === 'Test Camera Updated' && 
        stored.ipAddress === '172.30.50.12' && 
        stored.streamPath === '/Streaming/Channels/101') {
      console.log('\n>>> SUCCESS: URL updates were parsed and saved correctly! <<<');
    } else {
      console.error('\n>>> FAILURE: Updated fields mismatch! <<<');
    }

    // 4. Cleanup
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
