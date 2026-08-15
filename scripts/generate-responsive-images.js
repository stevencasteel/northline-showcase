import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

sharp.concurrency(1);

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const assetsRoot = path.join(projectRoot, "public/assets");
const manifestPath = path.join(
  projectRoot,
  "src/config/generatedResponsiveAssets.ts",
);
const widthTiers = [640, 960, 1440, 1920, 2560];
const sourceExtensions = /\.(png|jpe?g|webp)$/i;
const force = process.argv.includes("--force");
const help = process.argv.includes("--help") || process.argv.includes("-h");
const targetArgs = process.argv
  .slice(2)
  .filter(
    (argument) =>
      argument !== "--force" && argument !== "--help" && argument !== "-h",
  );

// These are source masters that are not part of the deployed composition. They stay
// in source_files for future art direction, but do not create dead public assets.
const excludedSourceNames = new Set([
  "._associations_bg_texture.jpg",
  "._badge_row-2_07_celestial_canopy_co-op.png",
  "._footer-eaves-foreground.png",
  "._map-frame.png",
  "._copper_frame_left.png",
  "._copper_frame_right.png",
  "._founder_left_frame.png",
  "._founder_right_frame.png",
  "._don-rafael-montoya-signature.png",
  "._founder-jean-texture.jpg",
  "._hero-copper-edge-alternate.png",
  "._badge-banner-workshirt.png",
  "unused_badge_century_seal.png",
  "unused_badge_realm_council.png",
  "unused_badge_united_roofwrights.png",
  "badge-banner-workshirt full.png",
  "copper_frame_left.png",
  "copper_frame_right.png",
  "copper-edge copy.png",
  "hero-copper-edge-alternate.png",
]);

const isSourceFile = (file) =>
  sourceExtensions.test(file) && !path.basename(file).startsWith("._");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function familyForSource(sourcePath) {
  const sourceFilesDirectory = path.dirname(sourcePath);
  const sectionDirectory =
    path.basename(sourceFilesDirectory) === "source_files"
      ? path.dirname(sourceFilesDirectory)
      : sourceFilesDirectory;
  const relativeSection = path.relative(assetsRoot, sectionDirectory);
  const sourceExtension = path.extname(sourcePath);
  const baseName = path.basename(sourcePath, sourceExtension);
  return {
    base: `/assets/${path.posix.join(relativeSection.split(path.sep).join("/"), baseName)}`,
    outputDirectory: sectionDirectory,
    baseName,
  };
}

function encodingFor(sourcePath, metadata) {
  const relative = path
    .relative(assetsRoot, sourcePath)
    .split(path.sep)
    .join("/");
  const baseName = path.basename(sourcePath).toLowerCase();
  const isTexture = /texture|felt|steel|underlayment|cover-board|paper/.test(
    relative.toLowerCase(),
  );
  const isSharpGraphic =
    /badge|banner|copper-edge|sphere|plaque|map-frame/.test(baseName);

  if (metadata.hasAlpha) {
    return {
      quality: isSharpGraphic ? 92 : 84,
      alphaQuality: 100,
      effort: 6,
      treatment: isSharpGraphic
        ? "alpha-full-quality-ui"
        : "alpha-full-quality-photo",
    };
  }

  return {
    quality: isTexture ? 80 : isSharpGraphic ? 90 : 82,
    effort: 6,
    treatment: isTexture ? "texture" : isSharpGraphic ? "sharp-ui" : "photo",
  };
}

function formatFor(sourcePath) {
  const relative = path
    .relative(assetsRoot, sourcePath)
    .split(path.sep)
    .join("/");
  const isAvifFamily =
    relative.startsWith("services/source_files/") ||
    relative === "hero/source_files/foreground.png" ||
    relative === "founder/source_files/founder_left_frame.png" ||
    relative === "founder/source_files/founder_right_frame.png";
  return isAvifFamily ? "avif" : "webp";
}

function outputPathFor(base, width, sourceWidth, format) {
  const outputBase = path.join(
    assetsRoot,
    base.replace("/assets/", "").split("/").join(path.sep),
  );
  return sourceWidth < widthTiers[0]
    ? `${outputBase}.${format}`
    : `${outputBase}-${width}.${format}`;
}

function widthsForSource(sourcePath, sourceWidth) {
  const relative = path
    .relative(assetsRoot, sourcePath)
    .split(path.sep)
    .join("/");
  if (relative === "hero/source_files/foreground.png") {
    return [640, 960, 1920].filter((width) => width <= sourceWidth);
  }
  const isCompactFamily =
    (relative.startsWith("associations/source_files/") &&
      !relative.includes("associations_bg_texture")) ||
    (relative.startsWith("reviews/source_files/") &&
      !relative.includes("roofing-felt-fiber") &&
      !relative.includes("leaf_background_texture")) ||
    relative.startsWith("customer service/source_files/") ||
    relative.startsWith("ui/source_files/copper-sphere-");
  if (isCompactFamily && sourceWidth >= widthTiers[0]) return [widthTiers[0]];
  return sourceWidth < widthTiers[0]
    ? []
    : widthTiers.filter((width) => width <= sourceWidth);
}

function removeStaleVariants(base, keepPaths) {
  const outputDirectory = path.dirname(
    path.join(
      assetsRoot,
      base.replace("/assets/", "").split("/").join(path.sep),
    ),
  );
  const baseName = path.basename(base);
  if (!fs.existsSync(outputDirectory)) return;
  const keep = new Set(keepPaths);
  for (const entry of fs.readdirSync(outputDirectory)) {
    if (
      !new RegExp(
        `^${baseName}(?:-(?:${widthTiers.join("|")}))?\\.(?:webp|avif)$`,
      ).test(entry)
    )
      continue;
    const outputPath = path.join(outputDirectory, entry);
    if (!keep.has(outputPath)) fs.unlinkSync(outputPath);
  }
}

function expectedDimensions(sourceWidth, sourceHeight, targetWidth) {
  const width = Math.min(sourceWidth, targetWidth);
  const height = Math.round((sourceHeight * width) / sourceWidth);
  return { width, height };
}

function dimensionsMatch(metadata, sourceMetadata, expected) {
  const ratioHeight =
    (sourceMetadata.height * expected.width) / sourceMetadata.width;
  return (
    metadata.width === expected.width &&
    Math.abs(metadata.height - ratioHeight) <= 1
  );
}

async function outputIsValid(outputPath, expected, sourceMetadata) {
  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0)
    return false;
  if (
    fs.statSync(outputPath).mtimeMs < fs.statSync(sourceMetadata.path).mtimeMs
  )
    return false;
  try {
    const metadata = await sharp(outputPath).metadata();
    const expectedFormat = path.extname(outputPath).slice(1);
    const validFormats =
      expectedFormat === "avif" ? ["avif", "heif"] : [expectedFormat];
    return (
      validFormats.includes(metadata.format) &&
      dimensionsMatch(metadata, sourceMetadata, expected) &&
      (!sourceMetadata.hasAlpha || metadata.hasAlpha)
    );
  } catch {
    return false;
  }
}

async function convertVariant(
  sourcePath,
  outputPath,
  targetWidth,
  sourceMetadata,
  encoding,
) {
  const expected = expectedDimensions(
    sourceMetadata.width,
    sourceMetadata.height,
    targetWidth,
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const image = sharp(sourcePath).resize({
    width: targetWidth,
    fit: "inside",
    withoutEnlargement: true,
  });
  if (path.extname(outputPath) === ".avif") {
    await image
      .avif({ quality: 60, effort: encoding.effort })
      .toFile(outputPath);
  } else {
    await image
      .webp({
        quality: encoding.quality,
        alphaQuality: encoding.alphaQuality,
        effort: encoding.effort,
      })
      .toFile(outputPath);
  }

  const metadata = await sharp(outputPath).metadata();
  const expectedFormat = path.extname(outputPath).slice(1);
  const validFormats =
    expectedFormat === "avif" ? ["avif", "heif"] : [expectedFormat];
  if (
    !validFormats.includes(metadata.format) ||
    !dimensionsMatch(metadata, sourceMetadata, expected)
  ) {
    throw new Error(
      `Invalid output dimensions for ${outputPath}: expected ${expected.width}x${expected.height}, got ${metadata.width}x${metadata.height}`,
    );
  }
  if (sourceMetadata.hasAlpha && !metadata.hasAlpha) {
    throw new Error(`Alpha channel was lost while converting ${sourcePath}`);
  }
  return { ...expected, bytes: fs.statSync(outputPath).size };
}

async function mapConcurrent(items, worker, limit = 4) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index]);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

function readManifestEntries() {
  if (!fs.existsSync(manifestPath)) return {};
  const contents = fs.readFileSync(manifestPath, "utf8");
  const match = contents.match(/= (\{[\s\S]*\}) as const\s*$/);
  return match ? JSON.parse(match[1]) : {};
}

function writeManifest(families, mergeExisting = false) {
  const entries = mergeExisting ? readManifestEntries() : {};
  Object.assign(
    entries,
    Object.fromEntries(
      families.map((family) => [
        family.base,
        {
          sourceWidth: family.sourceWidth,
          sourceHeight: family.sourceHeight,
          hasAlpha: family.hasAlpha,
          format: family.outputFormat,
          widths: family.widths,
        },
      ]),
    ),
  );
  const contents = `// Generated by scripts/generate-responsive-images.js. Do not edit by hand.\nexport const RESPONSIVE_ASSETS = ${JSON.stringify(entries, null, 2)} as const\n`;
  fs.writeFileSync(manifestPath, contents);
}

function resolveTarget(target) {
  if (target.startsWith("/assets/"))
    return path.join(projectRoot, "public", target.slice(1));
  return path.resolve(projectRoot, target);
}

function printHelp() {
  console.log(`Usage: npm run images:responsive [-- --force] [source-file ...]

With no source files, all raster masters are analyzed. Pass one or more source
file paths to process only those masters and merge their entries into the
existing responsive asset manifest.

Examples:
  npm run images:responsive
  npm run images:responsive -- public/assets/navbar/source_files/nav_email_default.png
  npm run images:responsive -- /assets/navbar/source_files/nav_email_hover.png --force`);
}

async function main() {
  if (help) {
    printHelp();
    return;
  }

  const standaloneSources = [
    path.join(assetsRoot, "founder/founder-jean-texture.jpg"),
  ].filter((file) => fs.existsSync(file));
  const allSourceFiles = walk(assetsRoot)
    .filter((file) => file.includes(`${path.sep}source_files${path.sep}`))
    .filter(isSourceFile)
    .filter((file) => !excludedSourceNames.has(path.basename(file)))
    .concat(standaloneSources)
    .sort();
  const sourceFiles =
    targetArgs.length === 0
      ? allSourceFiles
      : targetArgs.map(resolveTarget).map((file) => {
          if (!allSourceFiles.includes(file)) {
            throw new Error(
              `Target is not a supported raster source master: ${file}`,
            );
          }
          return file;
        });

  if (sourceFiles.length === 0)
    throw new Error("No source_files raster masters were found");

  const families = [];
  let generated = 0;
  let skipped = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  const alphaFamilies = [];

  for (const sourcePath of sourceFiles) {
    const sourceMetadata = await sharp(sourcePath).metadata();
    if (
      !sourceMetadata.width ||
      !sourceMetadata.height ||
      !sourceMetadata.format
    ) {
      throw new Error(`Could not read dimensions or format for ${sourcePath}`);
    }
    sourceMetadata.path = sourcePath;
    const family = familyForSource(sourcePath);
    const encoding = encodingFor(sourcePath, sourceMetadata);
    const format = formatFor(sourcePath);
    const widths = widthsForSource(sourcePath, sourceMetadata.width);
    const targets = widths.length > 0 ? widths : [sourceMetadata.width];
    const variantReport = [];
    const outputPaths = targets.map((targetWidth) =>
      outputPathFor(family.base, targetWidth, sourceMetadata.width, format),
    );
    removeStaleVariants(family.base, outputPaths);

    totalBefore += fs.statSync(sourcePath).size;
    if (sourceMetadata.hasAlpha) alphaFamilies.push(family.base);

    const variants = await mapConcurrent(targets, async (targetWidth) => {
      const outputPath = outputPathFor(
        family.base,
        targetWidth,
        sourceMetadata.width,
        format,
      );
      const expected = expectedDimensions(
        sourceMetadata.width,
        sourceMetadata.height,
        targetWidth,
      );
      if (
        !force &&
        (await outputIsValid(outputPath, expected, sourceMetadata))
      ) {
        return {
          path: outputPath,
          status: "skipped",
          ...expected,
          bytes: fs.statSync(outputPath).size,
        };
      }
      const result = await convertVariant(
        sourcePath,
        outputPath,
        targetWidth,
        sourceMetadata,
        encoding,
      );
      return { path: outputPath, status: "generated", ...result };
    });
    variants.forEach((variant) => {
      if (variant.status === "generated") generated += 1;
      else skipped += 1;
      totalAfter += variant.bytes;
      variantReport.push(variant);
    });

    families.push({
      base: family.base,
      source: path.relative(projectRoot, sourcePath).split(path.sep).join("/"),
      sourceWidth: sourceMetadata.width,
      sourceHeight: sourceMetadata.height,
      format: sourceMetadata.format,
      outputFormat: format,
      hasAlpha: !!sourceMetadata.hasAlpha,
      sourceBytes: fs.statSync(sourcePath).size,
      widths,
      encoding: encoding.treatment,
      variants: variantReport,
    });

    const variantSummary = variantReport
      .map(
        (variant) =>
          `${variant.width}x${variant.height}/${Math.round(variant.bytes / 1024)}KiB`,
      )
      .join(", ");
    console.log(
      `${family.base} <- ${path.relative(projectRoot, sourcePath).split(path.sep).join("/")} [${sourceMetadata.width}x${sourceMetadata.height}${sourceMetadata.hasAlpha ? ", alpha" : ""}] ${variantSummary}`,
    );
  }

  writeManifest(families, targetArgs.length > 0);
  const generatedFormats = families.reduce((counts, family) => {
    counts[family.outputFormat] =
      (counts[family.outputFormat] || 0) +
      family.variants.filter((variant) => variant.status === "generated")
        .length;
    return counts;
  }, {});
  console.log(
    `\nAnalyzed ${families.length} source families; generated ${generated} variants (${generatedFormats.webp || 0} WebPs, ${generatedFormats.avif || 0} AVIFs); skipped ${skipped} valid variants.`,
  );
  console.log(`Alpha families: ${alphaFamilies.length}`);
  console.log(
    `Source bytes: ${totalBefore}; deployed responsive image bytes: ${totalAfter}`,
  );
  console.log(`Manifest: ${path.relative(projectRoot, manifestPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
