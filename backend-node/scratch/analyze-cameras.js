'use strict';
const fs = require('fs');
const path = require('path');

function readJsonFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const buffer = fs.readFileSync(absolutePath);
  let text = buffer.toString('utf8');
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  return JSON.parse(text);
}

const cctv2 = readJsonFile('../cameras/cctvinfo2.json');
const oldcctv4 = readJsonFile('../cameras/oldcctvinfo4.json');

function analyze(name, list) {
  console.log(`=== Analysis of ${name} ===`);
  let total = list.length;
  let hasRtspUrl = 0;
  let hasEnableRtspOk = 0;
  let hasBoth = 0;
  let enableRtspNoUrl = 0;
  let urlPatterns = new Set();
  let credentials = new Set();

  list.forEach(item => {
    const url = item['ANPR&PTZ RTSP'] || '';
    const enable = item['enable rtsp'] || '';
    
    if (url) {
      hasRtspUrl++;
      if (url.startsWith('rtsp://')) {
        const urlObj = url.substring(7);
        const parts = urlObj.split('@');
        if (parts.length > 1) {
          credentials.add(parts[0]);
        }
        
        // Generalize URL path
        const hostPath = parts[parts.length - 1];
        const slashIdx = hostPath.indexOf('/');
        if (slashIdx !== -1) {
          urlPatterns.add(hostPath.substring(slashIdx));
        }
      }
    }
    if (enable.toLowerCase() === 'ok') {
      hasEnableRtspOk++;
    }
    if (url && enable.toLowerCase() === 'ok') {
      hasBoth++;
    }
    if (!url && enable.toLowerCase() === 'ok') {
      enableRtspNoUrl++;
    }
  });

  console.log(`Total items: ${total}`);
  console.log(`Has ANPR&PTZ RTSP URL: ${hasRtspUrl}`);
  console.log(`Has enable rtsp = 'ok': ${hasEnableRtspOk}`);
  console.log(`Has both: ${hasBoth}`);
  console.log(`Has enable rtsp = 'ok' but NO URL: ${enableRtspNoUrl}`);
  console.log(`Credentials found:`, Array.from(credentials));
  console.log(`URL Paths found:`, Array.from(urlPatterns));
  console.log('');
}

analyze('cctvinfo2.json (New)', cctv2);
analyze('oldcctvinfo4.json (Old)', oldcctv4);
