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

function sendLocalFileHead(videoFileName, res) {
  const absolutePath = path.resolve(__dirname, '../../../../vdo', videoFileName);

  if (!fs.existsSync(absolutePath)) {
    res.writeHead(404, {
      'Content-Type': 'application/json',
      'X-MFU-Stream-Mode': 'missing'
    });
    return res.end();
  }

  const stat = fs.statSync(absolutePath);
  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-MFU-Stream-Mode': 'mp4'
  });
  return res.end();
}

const { spawn } = require('child_process');

function createProxyStreamHandler(pythonEndpoint, videoFileName) {
  return function (req, res) {
    const pythonUrl = `http://127.0.0.1:5000/${pythonEndpoint}`;

    if (req.method === 'HEAD') {
      const headReq = http.request(pythonUrl, { method: 'HEAD', timeout: 1000 }, (proxyRes) => {
        const headers = Object.assign({}, proxyRes.headers, {
          'X-MFU-Stream-Mode': 'mjpeg'
        });
        res.writeHead(proxyRes.statusCode, headers);
        res.end();
      });

      headReq.on('timeout', () => {
        headReq.destroy();
      });

      headReq.on('error', () => {
        sendLocalFileHead(videoFileName, res);
      });

      headReq.end();
      return;
    }

    const proxyReq = http.get(pythonUrl, (proxyRes) => {
      // Pipe headers and payload from AI service MJPEG
      const headers = Object.assign({}, proxyRes.headers, {
        'X-MFU-Stream-Mode': 'mjpeg'
      });
      res.writeHead(proxyRes.statusCode, headers);
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

function createRtspMjpegHandler(rtspUrl) {
  return function (req, res) {
    const boundary = 'frame';
    res.writeHead(200, {
      'Content-Type': `multipart/x-mixed-replace; boundary=${boundary}`,
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const ffmpegCommand = process.env.FFMPEG_PATH || 'ffmpeg';
    const ffmpegArgs = [
      '-rtsp_transport', 'tcp',
      '-timeout', '3000000',          // ใช้ -timeout เป็นตัวพิมพ์เล็กตามคำสั่งระบบ (หน่วยไมโครวินาที = 3 วินาที)
      '-fflags', 'nobuffer+genpts',
      '-i', rtspUrl,
      '-f', 'mjpeg',
      '-q:v', '5',
      '-r', '10',
      '-an',
      '-'
    ];

    const ffmpegProc = spawn(ffmpegCommand, ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

    let headersSent = false;
    let buffer = Buffer.alloc(0);

    ffmpegProc.stderr.on('data', (chunk) => {
      // Confirm ffmpeg is running; do not flood logs.
      if (!headersSent) {
        headersSent = true;
      }
      console.error(`[mfuVision_stream] ffmpeg stderr (${rtspUrl}):`, chunk.toString().trim());
    });

    ffmpegProc.stderr.on('error', (err) => {
      console.error(`[mfuVision_stream] ffmpeg stderr error (${rtspUrl}):`, err && err.message ? err.message : err);
    });

    ffmpegProc.stdout.on('data', (chunk) => {
      if (res.destroyed || res.finished) {
        return;
      }

      buffer = Buffer.concat([buffer, chunk]);
      let endIndex = buffer.indexOf(Buffer.from([0xFF, 0xD9]));

      while (endIndex !== -1) {
        const jpegFrame = buffer.slice(0, endIndex + 2);
        buffer = buffer.slice(endIndex + 2);

        const partHeader = `--${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpegFrame.length}\r\n\r\n`;
        res.write(partHeader);
        res.write(jpegFrame);
        res.write('\r\n');

        endIndex = buffer.indexOf(Buffer.from([0xFF, 0xD9]));
      }
    });

    ffmpegProc.stdout.on('error', (err) => {
      console.error(`[mfuVision_stream] ffmpeg stdout error (${rtspUrl}):`, err && err.message ? err.message : err);
      if (!res.finished) {
        try {
          res.end();
        } catch (e) {
          // ignore
        }
      }
    });

    ffmpegProc.on('close', (code, signal) => {
      console.error(`[mfuVision_stream] ffmpeg exited (${rtspUrl}) code=${code} signal=${signal}`);
      if (!res.finished) {
        try {
          res.end();
        } catch (e) {
          // ignore
        }
      }
    });

    ffmpegProc.on('error', (err) => {
      console.error(`[mfuVision_stream] ffmpeg spawn error (${rtspUrl}):`, err && err.message ? err.message : err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ code: 50000, message: 'RTSP proxy error', details: err.message || String(err) }));
      }
      if (!res.finished) {
        res.end();
      }
    });

    req.on('close', () => {
      // Graceful shutdown: try SIGTERM first, then SIGKILL if needed
      if (ffmpegProc && !ffmpegProc.killed) {
        console.log(`[mfuVision_stream] client disconnected (${rtspUrl}), sending SIGTERM to ffmpeg...`);
        ffmpegProc.kill('SIGTERM');
        
        // Force kill after 5 seconds if process doesn't exit gracefully
        const killTimeout = setTimeout(() => {
          if (ffmpegProc && !ffmpegProc.killed) {
            console.warn(`[mfuVision_stream] ffmpeg (${rtspUrl}) did not exit after SIGTERM, forcing SIGKILL...`);
            ffmpegProc.kill('SIGKILL');
          }
        }, 5000);
        
        ffmpegProc.on('exit', () => {
          clearTimeout(killTimeout);
        });
      }
    });
  };
}

// แก้ไขให้เป็นตัว m พิมพ์เล็กทั้งหมด
module.exports = {
  proxyHelmetStream: createProxyStreamHandler('video_helmet', 'all test1.mp4'),
  proxyMotoStream: createProxyStreamHandler('video_moto', 'helmet test2.mp4'),
  proxyPlateStream: createProxyStreamHandler('video_plate', 'Lisent plate test4.mp4'),
  
  // ปรับเปลี่ยนพาสเวิร์ดพิมพ์เล็กตัว m และเติมรหัสซับสตรีมต่อท้ายระบบดึงภาพ (ใส่ตามแชนแนลที่คุณเปิดใน VLC แล้วติดจริง)
  proxyRtspGateOut: createRtspMjpegHandler('rtsp://mfustream:Mediamfu2025@172.30.36.21:554/Streaming/Channels/102/'), 
  proxyRtspGateIn: createRtspMjpegHandler('rtsp://mfustream:Mediamfu2025@172.30.36.22:554/Streaming/Channels/102/')
};
