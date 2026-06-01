'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * MFU Vision video stream handler.
 *
 * Direct HTTP proxy to Python AI Service (MJPEG).
 * Gracefully falls back to local MP4 files (Range Requests) if Python is offline.
 */

function streamLocalFile(videoFileName, req, res) {
  const absolutePath = path.resolve(__dirname, '../../../../vdo', videoFileName);

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({
      code: 40400,
      message: `Video file not found: ${videoFileName}`
    });
  }

  const stat = fs.statSync(absolutePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      });
      return res.end();
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(absolutePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    };

    res.writeHead(200, head);
    fs.createReadStream(absolutePath).pipe(res);
  }
}

function createProxyStreamHandler(pythonEndpoint, videoFileName) {
  return function (req, res) {
    const pythonUrl = `http://127.0.0.1:5000/${pythonEndpoint}`;

    const proxyReq = http.get(pythonUrl, (proxyRes) => {
      // Pipe headers and payload from AI service MJPEG
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      // AI Service offline, use clean raw video fallback
      streamLocalFile(videoFileName, req, res);
    });

    req.on('close', () => {
      proxyReq.destroy();
    });
  };
}

module.exports = {
  proxyHelmetStream: createProxyStreamHandler('video_helmet', 'all test1.mp4'),
  proxyMotoStream: createProxyStreamHandler('video_moto', 'helmet test2.mp4'),
  proxyPlateStream: createProxyStreamHandler('video_plate', 'Lisent plate test4.mp4')
};
