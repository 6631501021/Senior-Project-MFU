'use strict';
const prisma = require('../lib/prisma');

async function run() {
  try {
    const camerasCount = await prisma.camera.count();
    console.log('--- Database Camera Count ---');
    console.log('Total cameras:', camerasCount);
    
    if (camerasCount > 0) {
      const sample = await prisma.camera.findMany({ take: 5 });
      console.log('Sample cameras:', JSON.stringify(sample, null, 2));
    }
  } catch (error) {
    console.error('Error counting cameras:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();
