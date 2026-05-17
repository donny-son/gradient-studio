# Gradient Studio

Build high-resolution gradient wallpapers in the browser. Extract palettes from
images, blend them with multiple gradient engines, and export device-ready PNGs.

## Features

- **Palette extraction** — upload any image and pull a 5-color palette from it.
- **Gradient engines** — linear, radial, conic, and a mirrored "glow" mode.
- **Per-color girth** — weight each color so it claims more or less of the blend.
- **Drag-to-reorder** palette, adjustable angle, band width, and film grain.
- **Device presets** — 4K desktop (3840×2160) and phone (1290×2796) output.
- **One-click PNG export** at full internal resolution.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint     # run ESLint
```

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS v4, [colorthief](https://github.com/lokesh/color-thief),
and [lucide-react](https://lucide.dev/).
