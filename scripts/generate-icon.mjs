import { mkdir, readFile, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";

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

function encodePng(size, pixels) {
  const rows = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    rows[y * (size * 4 + 1)] = 0;
    pixels.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function createCategoryIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const scale = size / 28;
  for (const [radius, thickness] of [[3, 2], [7, 1.5], [11, 1.5]]) {
    const outer = (radius * scale) ** 2;
    const inner = ((radius - thickness) * scale) ** 2;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const distance = (x - center) ** 2 + (y - center) ** 2;
        if (distance < inner || distance > outer) continue;
        pixels.set([255, 255, 255, 255], (y * size + x) * 4);
      }
    }
  }
  return encodePng(size, pixels);
}

async function writeFileIfChanged(path, content) {
  try {
    const existing = await readFile(path);
    if (existing.equals(content)) return;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  await writeFile(path, content);
}

const iconDir = "com.devdael.echowave.sdPlugin/imgs";
await mkdir(iconDir, { recursive: true });
await Promise.all([
  writeFileIfChanged(`${iconDir}/plugin-icon.png`, await readFile(new URL("../assets/brand/plugin-icon.png", import.meta.url))),
  writeFileIfChanged(`${iconDir}/plugin-icon@2x.png`, await readFile(new URL("../assets/brand/plugin-icon@2x.png", import.meta.url))),
  writeFileIfChanged(`${iconDir}/category-icon.png`, createCategoryIcon(28)),
  writeFileIfChanged(`${iconDir}/category-icon@2x.png`, createCategoryIcon(56))
]);
