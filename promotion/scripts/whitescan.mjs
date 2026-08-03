import { readFileSync } from "fs";
import { inflateSync } from "zlib";

const [, , file, yS, x0S, x1S, threshS] = process.argv;
const y = Number(yS);
const x0 = Number(x0S ?? 0);
const x1 = Number(x1S ?? 1919);
const thresh = Number(threshS ?? 30);
const png = readFileSync(file);
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
const stride = w * 3 + 1;
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
const row = (yy) => {
  let prev = new Array(w * 3).fill(0);
  for (let r = 0; r <= yy; r++) {
    const f = raw[r * stride];
    const src = raw.subarray(r * stride + 1, (r + 1) * stride);
    const cur = new Array(w * 3).fill(0);
    for (let x = 0; x < w * 3; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v;
      switch (f) {
        case 0: v = src[x]; break;
        case 1: v = (src[x] + a) & 0xff; break;
        case 2: v = (src[x] + b) & 0xff; break;
        case 3: v = (src[x] + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          v = (src[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
        default: v = src[x];
      }
      cur[x] = v;
    }
    prev = cur;
  }
  return prev;
};
const prev = row(y);
const out = [];
let runStart = null;
for (let x = x0; x <= x1; x++) {
  const r = prev[x * 3];
  const g = prev[x * 3 + 1] ?? 0;
  const b = prev[x * 3 + 2] ?? 0;
  const m = Math.max(r, g, b);
  if (m >= thresh) {
    if (runStart === null) runStart = x;
  } else if (runStart !== null) {
    out.push(`${runStart}-${x - 1}`);
    runStart = null;
  }
}
if (runStart !== null) out.push(`${runStart}-${x1}`);
console.log(`y=${y}: ${out.join(" ") || "(none)"}`);
