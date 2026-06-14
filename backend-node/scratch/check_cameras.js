'use strict';

const prisma = require('../lib/prisma');

async function checkCameras() {
  const cams = await prisma.camera.findMany({});
  console.log('PostgreSQL Cameras:');
  console.log(JSON.stringify(cams, null, 2));
  await prisma.$disconnect();
}

checkCameras();
