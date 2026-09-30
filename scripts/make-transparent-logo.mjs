// Usuwa białe tło z logo (JPG → PNG z przezroczystością) bez białej poświaty na krawędziach.
// Każdy piksel brzegowy jest dopasowywany do jednego z kolorów logo jako mieszanka „kolor + biel”.
import sharp from 'sharp';

const source = process.argv[2] ?? 'public/swiatczeka-logo.jpg';
const output = process.argv[3] ?? 'public/swiatczeka-logo.png';
const palette = [[0x84, 0x84, 0x84], [0xff, 0x96, 0x00], [0x00, 0xae, 0xe4], [0x6c, 0xc6, 0x2a]];

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);

for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
  const px = [data[i], data[i + 1], data[i + 2]];
  if (Math.min(...px) >= 250) { out[o + 3] = 0; continue; }
  let best = { residual: Infinity, alpha: 1, color: px };
  for (const color of palette) {
    let num = 0, den = 0;
    for (let c = 0; c < 3; c += 1) { num += (255 - px[c]) * (255 - color[c]); den += (255 - color[c]) ** 2; }
    const alpha = Math.min(1, Math.max(0, num / den));
    let residual = 0;
    for (let c = 0; c < 3; c += 1) residual += (px[c] - (alpha * color[c] + (1 - alpha) * 255)) ** 2;
    if (residual < best.residual) best = { residual, alpha, color };
  }
  if (best.residual > 900 || best.alpha > 0.96) { out[o] = px[0]; out[o + 1] = px[1]; out[o + 2] = px[2]; out[o + 3] = 255; continue; }
  out[o] = best.color[0]; out[o + 1] = best.color[1]; out[o + 2] = best.color[2]; out[o + 3] = Math.round(best.alpha * 255);
}

// Zabłąkana kropka w oryginale (pod literą „K”) oraz resztki szumu JPEG.
for (let y = 730; y < 770; y += 1) for (let x = 1720; x < 1770; x += 1) out[(y * info.width + x) * 4 + 3] = 0;
for (let o = 3; o < out.length; o += 4) if (out[o] < 8) out[o] = 0;

// Przycięcie do zawartości (+8 px marginesu).
let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
for (let y = 0; y < info.height; y += 1) for (let x = 0; x < info.width; x += 1) {
  if (out[(y * info.width + x) * 4 + 3] === 0) continue;
  if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
}
await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(output);
const meta = await sharp(output).metadata();
console.log(`${output}: ${meta.width}x${meta.height}`);
