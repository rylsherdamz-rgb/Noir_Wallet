import { readFileSync } from "fs";
import { inflateSync } from "zlib";
const [, , file, x0S, x1S, y0S, y1S] = process.argv;
const x0 = Number(x0S ?? 0), x1 = Number(x1S ?? 1919), y0 = Number(y0S ?? 0), y1 = Number(y1S ?? 1079);
const png = readFileSync(file);
const w = png.readUInt32BE(16), h = png.readUInt32BE(20), stride = w * 3 + 1;
const idat = [];
let off = 8;
while (off + 12 <= png.length) {
  const len = png.readUInt32BE(off);
  const type = png.toString("ascii", off + 4, off + 8);
  if (type === "IEND") break;
  if (type === "IDAT") idat.push(png.subarray(off + 8, off + 8 + len));
  off += 12 + len;
}
const raw = inflateSync(Buffer.concat(idat));
const bpp = 3;
let prev = new Array(w * 3).fill(0);
const grid = [];
for (let r = 0; r <= y1; r++) {
  const f = raw[r * stride];
  const cur = new Array(w * 3).fill(0);
  for (let x = 0; x < w * 3; x++) {
    const a = x >= bpp ? cur[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
    let v;
    if (f === 0) v = raw[r * stride + 1 + x];
    else if (f === 1) v = (raw[r * stride + 1 + x] + a) & 255;
    else if (f === 2) v = (raw[r * stride + 1 + x] + b) & 255;
    else if (f === 3) v = (raw[r * stride + 1 + x] + ((a + b) >> 1)) & 255;
    else { const p = a + b - c; const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v = (raw[r * stride + 1 + x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255; }
    cur[x] = v;
  }
  if (r >= y0 && ((r - y0) % 20 === 0)) {
    const ry = (r - y0) / 20;
    const arr = grid[ry] = grid[ry] || new Array(96).fill(" ");
    for (let x = x0; x <= x1; x += 20) {
      const R = cur[x * 3], G = cur[x * 3 + 1], B = cur[x * 3 + 2];
      const m = Math.max(R, G, B);
      arr[Math.floor((x - x0) / 20)] = m >= 180 ? "#" : m >= 90 ? "+" : m >= 30 ? "." : " ";
    }
  }
  prev = cur;
}
for (const row of grid) console.log(row.join(""));
