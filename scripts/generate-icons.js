import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', deflated);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Icon drawer: DayForge geometric emblem
function drawIcon(isMaskable) {
  return (x, y, w, h) => {
    // Normalised coords -1 to 1
    const nx = (x / w) * 2 - 1;
    const ny = (y / h) * 2 - 1;
    const distFromCenter = Math.sqrt(nx * nx + ny * ny);

    // Background: Deep obsidian #09090b
    let r = 9, g = 9, b = 11, a = 255;

    // Outer rounded square / squircle margin
    const padding = isMaskable ? 0.35 : 0.15;
    const size = 1.0 - padding;

    // Forge emblem geometry:
    // Stylized "D" & anvil stepped geometry
    const insideBox = Math.abs(nx) < size && Math.abs(ny) < size;
    
    // Core forge block in center
    // Upper horizontal bar
    const inTopBar = Math.abs(ny - (-size * 0.45)) < size * 0.16 && nx > -size * 0.7 && nx < size * 0.65;
    // Lower horizontal bar (anvil base)
    const inBaseBar = Math.abs(ny - (size * 0.5)) < size * 0.18 && Math.abs(nx) < size * 0.75;
    // Left vertical spine
    const inSpine = Math.abs(nx - (-size * 0.45)) < size * 0.22 && Math.abs(ny) < size * 0.65;
    // Center glow / blue accent core
    const inCore = Math.abs(nx - 0.05) < size * 0.25 && Math.abs(ny - (-0.02)) < size * 0.25;

    if (insideBox) {
      if (inTopBar || inSpine || inBaseBar) {
        // Crisp clean white forge body
        r = 244; g = 244; b = 245;
      }
      if (inCore) {
        // Muted sapphire blue spark: #3b82f6
        r = 59; g = 130; b = 246;
      }
    }

    return [r, g, b, a];
  };
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192, 512x512, maskable 512x512, apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, drawIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, drawIcon(false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, drawIcon(true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, drawIcon(false)));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPNG(32, 32, drawIcon(false)));

// Also create clean SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#09090B"/>
  <rect x="110" y="120" width="80" height="272" rx="16" fill="#F4F4F5"/>
  <rect x="110" y="120" width="230" height="72" rx="16" fill="#F4F4F5"/>
  <rect x="90" y="320" width="332" height="72" rx="16" fill="#F4F4F5"/>
  <circle cx="270" cy="235" r="44" fill="#3B82F6"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

console.log('Successfully generated all PWA icons in /public');
