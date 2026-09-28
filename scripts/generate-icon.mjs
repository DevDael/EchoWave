import { mkdir, readFile, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";

const size = 256;
const pixels = Buffer.alloc(size * size * 4);

function setPixel(x, y, [red, green, blue, alpha = 255]) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const offset = (y * size + x) * 4;
  pixels[offset] = red;
  pixels[offset + 1] = green;
  pixels[offset + 2] = blue;
  pixels[offset + 3] = alpha;
}

function fillCircle(cx, cy, radius, color) {
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) setPixel(x, y, color);
    }
  }
}

function ring(cx, cy, radius, thickness, color) {
  const outer = radius ** 2;
  const inner = (radius - thickness) ** 2;
  for (let y = cy - radius; y <= cy + radius; y += 1) {
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      const distance = (x - cx) ** 2 + (y - cy) ** 2;
      if (distance <= outer && distance >= inner) setPixel(x, y, color);
    }
  }
}

for (let y = 0; y < size; y += 1) {
  for (let x = 0; x < size; x += 1) setPixel(x, y, [15, 23, 42, 255]);
}
ring(128, 122, 82, 8, [30, 64, 83, 255]);
ring(128, 122, 54, 7, [56, 189, 248, 255]);
fillCircle(128, 122, 20, [56, 189, 248, 255]);
fillCircle(185, 75, 11, [74, 222, 128, 255]);

const scanlines = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y += 1) {
  scanlines[y * (size * 4 + 1)] = 0;
  pixels.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function encodeSquarePng(iconSize, iconPixels) {
  const rows = Buffer.alloc((iconSize * 4 + 1) * iconSize);
  for (let y = 0; y < iconSize; y += 1) {
    rows[y * (iconSize * 4 + 1)] = 0;
    iconPixels.copy(rows, y * (iconSize * 4 + 1) + 1, y * iconSize * 4, (y + 1) * iconSize * 4);
  }
  const iconHeader = Buffer.alloc(13);
  iconHeader.writeUInt32BE(iconSize, 0);
  iconHeader.writeUInt32BE(iconSize, 4);
  iconHeader.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", iconHeader),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function createCategoryIcon(iconSize) {
  const iconPixels = Buffer.alloc(iconSize * iconSize * 4);
  const center = iconSize / 2;
  const put = (x, y) => {
    if (x < 0 || y < 0 || x >= iconSize || y >= iconSize) return;
    const offset = (Math.floor(y) * iconSize + Math.floor(x)) * 4;
    iconPixels.set([255, 255, 255, 255], offset);
  };
  const ringScale = iconSize / 28;
  for (const [radius, thickness] of [[3, 2], [7, 1.5], [11, 1.5]]) {
    const outer = (radius * ringScale) ** 2;
    const inner = ((radius - thickness) * ringScale) ** 2;
    for (let y = 0; y < iconSize; y += 1) {
      for (let x = 0; x < iconSize; x += 1) {
        const distance = (x - center) ** 2 + (y - center) ** 2;
        if (distance <= outer && distance >= inner) put(x, y);
      }
    }
  }
  return encodeSquarePng(iconSize, iconPixels);
}

const header = Buffer.alloc(13);
header.writeUInt32BE(size, 0);
header.writeUInt32BE(size, 4);
header.set([8, 6, 0, 0, 0], 8);
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", header),
  chunk("IDAT", deflateSync(scanlines)),
  chunk("IEND", Buffer.alloc(0))
]);

function createHighResolutionIcon() {
  const highSize = size * 2;
  const highPixels = Buffer.alloc(highSize * highSize * 4);
  for (let y = 0; y < highSize; y += 1) {
    for (let x = 0; x < highSize; x += 1) {
      const sourceOffset = (Math.floor(y / 2) * size + Math.floor(x / 2)) * 4;
      const targetOffset = (y * highSize + x) * 4;
      pixels.copy(highPixels, targetOffset, sourceOffset, sourceOffset + 4);
    }
  }
  const highScanlines = Buffer.alloc((highSize * 4 + 1) * highSize);
  for (let y = 0; y < highSize; y += 1) {
    highScanlines[y * (highSize * 4 + 1)] = 0;
    highPixels.copy(highScanlines, y * (highSize * 4 + 1) + 1, y * highSize * 4, (y + 1) * highSize * 4);
  }
  const highHeader = Buffer.alloc(13);
  highHeader.writeUInt32BE(highSize, 0);
  highHeader.writeUInt32BE(highSize, 4);
  highHeader.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", highHeader),
    chunk("IDAT", deflateSync(highScanlines)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

await mkdir("com.devdael.echowave.sdPlugin/imgs", { recursive: true });
await Promise.all([
  writeFileIfChanged("com.devdael.echowave.sdPlugin/imgs/plugin-icon.png", png),
  writeFileIfChanged("com.devdael.echowave.sdPlugin/imgs/plugin-icon@2x.png", createHighResolutionIcon()),
  writeFileIfChanged("com.devdael.echowave.sdPlugin/imgs/category-icon.png", createCategoryIcon(28)),
  writeFileIfChanged("com.devdael.echowave.sdPlugin/imgs/category-icon@2x.png", createCategoryIcon(56))
]);

async function writeFileIfChanged(path, content) {
  try {
    const existing = await readFile(path);
    if (existing.equals(content)) return;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await writeFile(path, content);
}
