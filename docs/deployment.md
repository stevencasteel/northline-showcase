# Deployment

- Repository: `stevencasteel/northline-showcase`
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Host: Cloudflare Pages
- URL: `https://northline-showcase.stevencasteel.com`

GitHub Actions verifies the build. Cloudflare Pages handles production and preview deployments.

## Responsive image pipeline

Run `npm run images:webp` after changing an image master. The generator reads only the original files under `public/assets/**/source_files`, creates non-upscaled responsive families at the supported width tiers, preserves alpha, and refreshes the generated manifest at `src/config/generatedResponsiveAssets.ts`. Service assets, the hero foreground, and founder frames use AVIF at quality 60; all other generated families use WebP.

The Vite build removes `source_files` from `dist`, so original masters are retained in the repository without being uploaded to Pages. Gallery cards, sequence thumbnails, and the modal use the same responsive WebP family; there is no separate `_sm` gallery naming convention.
