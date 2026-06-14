'use strict';

const prisma = require('../lib/prisma');

async function updateStreamPaths() {
  console.log('Updating camera 1 streamPath to /video_gate_ms_out...');
  await prisma.camera.update({
    where: { cameraId: 1 },
    data: { streamPath: '/video_gate_ms_out' }
  });

  console.log('Updating camera 2 streamPath to /video_gate_ms_in...');
  await prisma.camera.update({
    where: { cameraId: 2 },
    data: { streamPath: '/video_gate_ms_in' }
  });

  console.log('Update completed.');
  await prisma.$disconnect();
}

updateStreamPaths();
