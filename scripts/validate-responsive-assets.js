import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const assetsRoot = path.join(projectRoot, "public/assets");
const manifestPath = path.join(
  projectRoot,
  "src/config/generatedResponsiveAssets.ts",
);
const sourcePattern =
  /(?:responsiveBase|responsiveImage|responsiveSource|<StageImage[^>]*base=)[^'"`]*['"`]([^'"`]+)['"`]/g;
const manifestSource = fs.readFileSync(manifestPath, "utf8");
const manifest = JSON.parse(
  manifestSource
    .slice(manifestSource.indexOf("= ") + 2)
    .replace(/ as const\s*$/, ""),
);
const errors = [];

const outputPath = (base, width, format, widths) => {
  const relativeBase = base.replace("/assets/", "");
  return path.join(
    assetsRoot,
    path.dirname(relativeBase),
    `${path.basename(relativeBase)}${widths.length ? `-${width}` : ""}.${format}`,
  );
};

for (const [base, entry] of Object.entries(manifest)) {
  if (entry.widths.some((width) => width > entry.sourceWidth))
    errors.push(`${base}: generated tier exceeds source width`);
  const widths = entry.widths.length ? entry.widths : [undefined];
  for (const width of widths) {
    const file = outputPath(base, width, entry.format, entry.widths);
    if (!fs.existsSync(file)) {
      errors.push(
        `${base}: missing output ${path.relative(projectRoot, file)}`,
      );
      continue;
    }
    try {
      const metadata = await sharp(file).metadata();
      if (entry.hasAlpha && !metadata.hasAlpha)
        errors.push(
          `${base}: alpha channel missing from ${path.relative(projectRoot, file)}`,
        );
      if (!metadata.width || !metadata.height)
        errors.push(
          `${base}: missing dimensions in ${path.relative(projectRoot, file)}`,
        );
    } catch (error) {
      errors.push(
        `${base}: unreadable output ${path.relative(projectRoot, file)} (${error.message})`,
      );
    }
  }
}

const walk = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const sourceFiles = walk(path.join(projectRoot, "src")).filter((file) =>
  /\.(ts|tsx)$/.test(file),
);
for (const file of sourceFiles) {
  const contents = fs.readFileSync(file, "utf8");
  for (const match of contents.matchAll(sourcePattern)) {
    const base = match[1];
    if (
      !base.startsWith("/assets/") ||
      path.extname(base) ||
      base.endsWith("/") ||
      base.includes("${")
    )
      continue;
    if (!manifest[base])
      errors.push(
        `${path.relative(projectRoot, file)}: responsive base missing from manifest: ${base}`,
      );
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${Object.keys(manifest).length} responsive asset families and their output variants.`,
  );
}
