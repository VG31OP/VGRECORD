import fs from "fs";
import path from "path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#DB2777"/>
    </linearGradient>
    <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E0E7FF"/>
    </linearGradient>
    <linearGradient id="recDot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF3366"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#312E81" flood-opacity="0.5"/>
    </filter>
    <filter id="vShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect x="48" y="48" width="928" height="928" rx="240" fill="url(#bgGrad)" filter="url(#shadow)"/>
  
  <!-- Subtle Inner Border Highlight -->
  <rect x="52" y="52" width="920" height="920" rx="236" stroke="rgba(255,255,255,0.25)" stroke-width="8"/>

  <!-- Radar / Motion Soundwaves / Lens Rings -->
  <circle cx="512" cy="512" r="340" stroke="rgba(255, 255, 255, 0.18)" stroke-width="28" stroke-dasharray="60 40"/>
  <circle cx="512" cy="512" r="240" stroke="rgba(255, 255, 255, 0.12)" stroke-width="16"/>

  <!-- Iconic VGRECORD Bold Geometric V -->
  <path d="M304 360L512 704L720 360" stroke="url(#vGrad)" stroke-width="76" stroke-linecap="round" stroke-linejoin="round" filter="url(#vShadow)"/>

  <!-- Active Recording Glowing Core Lens Dot -->
  <circle cx="512" cy="450" r="70" fill="url(#recDot)"/>
  <circle cx="512" cy="450" r="92" stroke="#FFFFFF" stroke-width="18" stroke-opacity="0.85"/>
</svg>`;

async function main() {
  const rootDir = process.cwd();
  const svgBuffer = Buffer.from(svgContent, "utf-8");

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

  // 1. Generate icons/icons/png/
  const pngDir = path.join(rootDir, "icons", "icons", "png");
  if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir, { recursive: true });

  const icoPngPaths = [];
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];

  for (const size of sizes) {
    const pngPath = path.join(pngDir, `${size}x${size}.png`);
    await sharp(svgBuffer).resize(size, size).png().toFile(pngPath);

    if (icoSizes.includes(size)) {
      icoPngPaths.push(pngPath);
    }
  }
  console.log("Generated icons/icons/png files.");

  // 2. Generate standard multi-layer ICO
  const icoBuffer = await pngToIco(icoPngPaths);

  const winDir = path.join(rootDir, "icons", "icons", "win");
  if (!fs.existsSync(winDir)) fs.mkdirSync(winDir, { recursive: true });
  fs.writeFileSync(path.join(winDir, "icon.ico"), icoBuffer);
  console.log("Generated icons/icons/win/icon.ico.");

  const buildDir = path.join(rootDir, "build");
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });
  fs.writeFileSync(path.join(buildDir, "icon.ico"), icoBuffer);
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(buildDir, "icon.png"));
  console.log("Generated build/icon.ico and build/icon.png.");

  // 3. Generate public/app-icons/
  const publicIconsDir = path.join(rootDir, "public", "app-icons");
  if (!fs.existsSync(publicIconsDir)) fs.mkdirSync(publicIconsDir, { recursive: true });

  const appIconSizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of appIconSizes) {
    const outPng = await sharp(svgBuffer).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(publicIconsDir, `recordly-${size}.png`), outPng);
    fs.writeFileSync(path.join(publicIconsDir, `recordlymac-${size}.png`), outPng);
    fs.writeFileSync(path.join(publicIconsDir, `vgrecord-${size}.png`), outPng);
  }
  fs.writeFileSync(path.join(rootDir, "public", "favicon.ico"), icoBuffer);
  console.log("Generated public/app-icons and public/favicon.ico files.");

  // 4. Dist app-icons if dist folder exists
  const distIconsDir = path.join(rootDir, "dist", "app-icons");
  if (fs.existsSync(distIconsDir)) {
    for (const size of appIconSizes) {
      const outPng = await sharp(svgBuffer).resize(size, size).png().toBuffer();
      fs.writeFileSync(path.join(distIconsDir, `recordly-${size}.png`), outPng);
      fs.writeFileSync(path.join(distIconsDir, `recordlymac-${size}.png`), outPng);
      fs.writeFileSync(path.join(distIconsDir, `vgrecord-${size}.png`), outPng);
    }
  }
}

main().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
