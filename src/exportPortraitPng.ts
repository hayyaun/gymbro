import { getFontEmbedCSS, toCanvas } from "html-to-image";

export async function exportPortraitPng(
  sheet: HTMLElement,
  template: "forge" | "pahlavan",
  { pixelRatio, backgroundColor }: { pixelRatio: number; backgroundColor: string },
) {
  const isForge = template === "forge";
  // Measure an unscaled copy so the export uses the full sheet geometry at any preview size.
  const host = document.createElement("div");
  host.inert = true;
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "-10000px";
  const copy = sheet.cloneNode(true) as HTMLElement;
  host.append(copy);
  document.body.append(host);

  try {
    const hero = copy.querySelector<HTMLElement>(isForge ? ".forge-hero" : ".poster-hero");
    const art = hero?.querySelector<HTMLElement>(isForge ? ".forge-hero-art" : ".pahlavan-art");
    const portrait = art?.querySelector("img");
    if (!hero || !art || !portrait) {
      throw new Error("Workout sheet is missing its portrait layer");
    }
    await portrait.decode();

    const sheetBox = copy.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    const portraitBox = portrait.getBoundingClientRect();
    const heroX = heroBox.left - sheetBox.left;
    const heroY = heroBox.top - sheetBox.top;

    // Both portrait themes use a centered contain fit with bottom alignment.
    const scale = Math.min(
      portraitBox.width / portrait.naturalWidth,
      portraitBox.height / portrait.naturalHeight,
    );
    const width = portrait.naturalWidth * scale;
    const height = portrait.naturalHeight * scale;
    const x = portraitBox.left - sheetBox.left + (portraitBox.width - width) / 2;
    const y = portraitBox.bottom - sheetBox.top - height;
    portrait.remove();

    const fontEmbedCSS = await getFontEmbedCSS(copy);
    // Capture the hero text and labels to layer above the portrait.
    const foreground = await toCanvas(hero, {
      pixelRatio,
      fontEmbedCSS,
      width: heroBox.width,
      height: heroBox.height,
      filter: (node) => node !== art,
    });
    for (const child of hero.children) {
      if (child !== art && child instanceof HTMLElement) {
        child.style.visibility = "hidden";
      }
    }

    const canvas = await toCanvas(copy, {
      pixelRatio,
      fontEmbedCSS,
      backgroundColor,
      width: sheetBox.width,
      height: sheetBox.height,
    });
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Workout sheet export canvas is unavailable");

    context.scale(canvas.width / sheetBox.width, canvas.height / sheetBox.height);
    context.save();
    context.beginPath();
    context.rect(heroX, heroY, heroBox.width, heroBox.height);
    context.clip();
    // WebKit can omit raster images embedded in the SVG snapshot. Draw this PNG directly.
    if (isForge) {
      context.translate(x + width, y);
      context.scale(-1, 1);
      context.drawImage(portrait, 0, 0, width, height);
    } else {
      context.drawImage(portrait, x, y, width, height);
    }
    context.restore();
    context.drawImage(foreground, heroX, heroY, heroBox.width, heroBox.height);

    const png = canvas.toDataURL("image/png");
    if (png === "data:,") throw new Error("Workout sheet export canvas could not be encoded");
    return png;
  } finally {
    host.remove();
  }
}
