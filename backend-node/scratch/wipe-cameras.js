'use strict';
const prisma = require('../lib/prisma');

async function wipe() {
  console.log('Starting camera wipe process...');
  try {
    console.log('Wiping camera assignments in violations table (setting camera_id to null)...');
    const violationsResult = await prisma.violation.updateMany({
      data: { cameraId: null }
    });
    console.log(`Updated ${violationsResult.count} violation records.`);

    console.log('Deleting all cameras from PostgreSQL...');
    const camerasResult = await prisma.camera.deleteMany({});
    console.log(`Successfully deleted ${camerasResult.count} cameras.`);

    console.log('\n>>> SUCCESS: All cameras wiped! <<<');
  } catch (error) {
    console.error('Wipe process failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

wipe();
