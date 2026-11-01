import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dumbbell } from "lucide-react";
import sharp from "sharp";

const output = new URL("../public/", import.meta.url);
await mkdir(output, { recursive: true });
// Preserve the branding mark angle (-45 degrees in Lucide, plus its -8-degree tilt).
// Only the surrounding app-icon square stays upright.
const icon = (maskable = false) => {
  const size = maskable ? 288 : 320;
  const symbol = renderToStaticMarkup(
    createElement(Dumbbell, { size, stroke: "#ffffff" }),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="${maskable ? 0 : 112}" fill="#dc3045"/><g transform="translate(256 256) rotate(-8) translate(${-size / 2} ${-size / 2})">${symbol}</g></svg>`;
};
await writeFile(new URL("app-icon.svg", output), icon());
for (const size of [192, 512]) {
  await sharp(Buffer.from(icon()))
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`icon-${size}.png`, output)));
}
await sharp(Buffer.from(icon(true)))
  .resize(512, 512)
  .png()
  .toFile(fileURLToPath(new URL("icon-maskable-512.png", output)));
await sharp(Buffer.from(icon(true)))
  .resize(180, 180)
  .png()
  .toFile(fileURLToPath(new URL("apple-touch-icon.png", output)));
console.log(
  "Generated favicon, install icons, maskable icon and Apple touch icon.",
);
