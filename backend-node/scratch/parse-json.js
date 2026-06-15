'use strict';
const fs = require('fs');
const path = require('path');

function readJsonFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const buffer = fs.readFileSync(absolutePath);
  
  // Try parsing as UTF-8 first
  try {
    let text = buffer.toString('utf8');
    // Strip UTF-8 BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }
    return JSON.parse(text);
  } catch (e) {
    try {
      let text = buffer.toString('utf16le');
      // Strip UTF-16 BOM if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }
      return JSON.parse(text);
    } catch (e2) {
      console.error(`Failed to parse ${filePath}:`, e.message, e2.message);
      return null;
    }
  }
}

const cctv2 = readJsonFile('../cameras/cctvinfo2.json');
const oldcctv4 = readJsonFile('../cameras/oldcctvinfo4.json');

console.log('cctvinfo2.json count:', cctv2 ? cctv2.length : 'failed');
if (cctv2 && cctv2.length > 0) {
  console.log('cctvinfo2.json keys:', Object.keys(cctv2[0]));
  console.log('cctvinfo2.json sample first 3 items:', JSON.stringify(cctv2.slice(0, 3), null, 2));
}

console.log('\noldcctvinfo4.json count:', oldcctv4 ? oldcctv4.length : 'failed');
if (oldcctv4 && oldcctv4.length > 0) {
  console.log('oldcctvinfo4.json keys:', Object.keys(oldcctv4[0]));
  console.log('oldcctvinfo4.json sample first 3 items:', JSON.stringify(oldcctv4.slice(0, 3), null, 2));
}
