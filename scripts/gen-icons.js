#!/usr/bin/env node
/**
 * Generate TabBar icon PNGs for WeChat mini program.
 * Creates 81x81 PNG files with simple home and clock icons.
 * No external dependencies - uses raw PNG encoding with Node.js built-in zlib.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 81;
const OUTPUT_DIR = path.join(__dirname, '..', 'miniprogram', 'images');

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// --- PNG encoding helpers (no dependencies) ---

function crc32(buf) {
  // CRC32 lookup table
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([typeBytes, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, body, crcBuf]);
}

function encodePNG(pixels) {
  // pixels is a SIZE x SIZE array of [r, g, b, a]
  // Build raw image data with filter byte (0 = None) per row
  const raw = [];
  for (let y = 0; y < SIZE; y++) {
    raw.push(0); // filter: None
    for (let x = 0; x < SIZE; x++) {
      const px = pixels[y * SIZE + x];
      raw.push(px[0], px[1], px[2], px[3]);
    }
  }
  const rawBuf = Buffer.from(raw);
  const compressed = zlib.deflateSync(rawBuf);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);  // width
  ihdr.writeUInt32BE(SIZE, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// --- Drawing helpers ---

function createCanvas() {
  return new Array(SIZE * SIZE).fill(null).map(() => [0, 0, 0, 0]);
}

function setPixel(pixels, x, y, r, g, b, a) {
  if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
    pixels[y * SIZE + x] = [r, g, b, a];
  }
}

function drawLine(pixels, x0, y0, x1, y1, r, g, b, a, thickness) {
  const half = Math.floor(thickness / 2);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0, cy = y0;
  while (true) {
    for (let ox = -half; ox <= half; ox++) {
      for (let oy = -half; oy <= half; oy++) {
        setPixel(pixels, cx + ox, cy + oy, r, g, b, a);
      }
    }
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

function drawCircle(pixels, cx, cy, radius, r, g, b, a, thickness) {
  const half = Math.floor(thickness / 2);
  for (let angle = 0; angle < 360; angle += 0.5) {
    const rad = angle * Math.PI / 180;
    const px = Math.round(cx + radius * Math.cos(rad));
    const py = Math.round(cy + radius * Math.sin(rad));
    for (let ox = -half; ox <= half; ox++) {
      for (let oy = -half; oy <= half; oy++) {
        setPixel(pixels, px + ox, py + oy, r, g, b, a);
      }
    }
  }
}

function drawRect(pixels, x, y, w, h, r, g, b, a) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(pixels, x + dx, y + dy, r, g, b, a);
    }
  }
}

function fillTriangle(pixels, x0, y0, x1, y1, x2, y2, r, g, b, a) {
  const minX = Math.max(0, Math.min(x0, x1, x2));
  const maxX = Math.min(SIZE - 1, Math.max(x0, x1, x2));
  const minY = Math.max(0, Math.min(y0, y1, y2));
  const maxY = Math.min(SIZE - 1, Math.max(y0, y1, y2));

  function sign(px, py, ax, ay, bx, by) {
    return (px - bx) * (ay - by) - (ax - bx) * (py - by);
  }

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const d1 = sign(px, py, x0, y0, x1, y1);
      const d2 = sign(px, py, x1, y1, x2, y2);
      const d3 = sign(px, py, x2, y2, x0, y0);
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
      if (!(hasNeg && hasPos)) {
        setPixel(pixels, px, py, r, g, b, a);
      }
    }
  }
}

// --- Icon drawing functions ---

function drawHomeIcon(color) {
  const [r, g, b] = color;
  const a = 255;
  const pixels = createCanvas();
  const cx = 40, cy = 40;
  const thick = 4;

  // Roof - triangle
  const roofTop = 12;
  const roofLeft = 10;
  const roofRight = 70;
  const roofBase = 38;

  // Draw filled roof triangle
  fillTriangle(pixels, cx, roofTop, roofLeft, roofBase, roofRight, roofBase, r, g, b, a);

  // Clear inside of roof to make it an outline
  fillTriangle(pixels, cx, roofTop + thick + 2, roofLeft + thick + 2, roofBase - 1, roofRight - thick - 2, roofBase - 1, 0, 0, 0, 0);

  // Restore the base line of the roof
  drawLine(pixels, roofLeft, roofBase, roofRight, roofBase, r, g, b, a, thick);

  // House body - rectangle outline
  const bodyLeft = 18;
  const bodyRight = 62;
  const bodyTop = roofBase;
  const bodyBottom = 68;

  // Left wall
  drawLine(pixels, bodyLeft, bodyTop, bodyLeft, bodyBottom, r, g, b, a, thick);
  // Right wall
  drawLine(pixels, bodyRight, bodyTop, bodyRight, bodyBottom, r, g, b, a, thick);
  // Bottom
  drawLine(pixels, bodyLeft, bodyBottom, bodyRight, bodyBottom, r, g, b, a, thick);

  // Door
  const doorLeft = 33;
  const doorRight = 47;
  const doorTop = 48;
  const doorBottom = 68;
  drawLine(pixels, doorLeft, doorTop, doorRight, doorTop, r, g, b, a, 3);
  drawLine(pixels, doorLeft, doorTop, doorLeft, doorBottom, r, g, b, a, 3);
  drawLine(pixels, doorRight, doorTop, doorRight, doorBottom, r, g, b, a, 3);

  return pixels;
}

function drawHistoryIcon(color) {
  const [r, g, b] = color;
  const a = 255;
  const pixels = createCanvas();
  const cx = 40, cy = 40;
  const radius = 28;
  const thick = 4;

  // Clock circle
  drawCircle(pixels, cx, cy, radius, r, g, b, a, thick);

  // Hour hand (pointing to 10 o'clock position roughly)
  const hourAngle = -60 * Math.PI / 180; // 10 o'clock
  const hourLen = 14;
  const hx = Math.round(cx + hourLen * Math.cos(hourAngle));
  const hy = Math.round(cy + hourLen * Math.sin(hourAngle));
  drawLine(pixels, cx, cy, hx, hy, r, g, b, a, thick);

  // Minute hand (pointing to 12 o'clock - straight up)
  const minLen = 20;
  drawLine(pixels, cx, cy, cx, cy - minLen, r, g, b, a, 3);

  // Center dot
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      setPixel(pixels, cx + dx, cy + dy, r, g, b, a);
    }
  }

  return pixels;
}

// --- Generate all icons ---

const INACTIVE_COLOR = [0x6B, 0x68, 0x62]; // #6B6862
const ACTIVE_COLOR = [0xCC, 0x78, 0x5C];   // #CC785C

const icons = [
  { name: 'tab-home.png', draw: drawHomeIcon, color: INACTIVE_COLOR },
  { name: 'tab-home-active.png', draw: drawHomeIcon, color: ACTIVE_COLOR },
  { name: 'tab-history.png', draw: drawHistoryIcon, color: INACTIVE_COLOR },
  { name: 'tab-history-active.png', draw: drawHistoryIcon, color: ACTIVE_COLOR },
];

for (const icon of icons) {
  const pixels = icon.draw(icon.color);
  const png = encodePNG(pixels);
  const outPath = path.join(OUTPUT_DIR, icon.name);
  fs.writeFileSync(outPath, png);
  console.log(`Generated: ${outPath} (${png.length} bytes)`);
}

console.log('\nAll icons generated successfully!');
