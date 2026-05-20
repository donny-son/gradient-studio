import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { GradientType } from '../lib/gradients';
import { PATTERN_GRID_SIZE, hexToRgb, rgbToCss, samplePalette } from '../lib/gradients';

// Number of intermediate color stops sampled along the gradient. More stops =
// smoother, more "filmic" transitions instead of hard linear blends.
const SMOOTH_SAMPLES = 64;

interface WallpaperCanvasProps {
  colors: string[];
  type: GradientType;
  angle: number;
  width: number;
  height: number;
  device: 'desktop' | 'phone';
  grainScale: number;
  bandWidth: number;
  weights: number[];
  pattern: number[];
}

const getColorStop = (index: number, count: number) => {
  if (count <= 1) {
    return 0;
  }

  return index / (count - 1);
};

const clampChannel = (value: number) => Math.max(0, Math.min(255, value));

const applyGrain = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grainScale: number,
) => {
  if (grainScale <= 0) {
    return;
  }

  const strength = Math.min(1, grainScale / 40);
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = width;
  noiseCanvas.height = height;

  const noiseContext = noiseCanvas.getContext('2d');
  if (!noiseContext) {
    return;
  }

  const imageData = noiseContext.createImageData(width, height);
  const { data } = imageData;
  const contrast = 72 + strength * 56;
  const chroma = strength * 10;

  for (let index = 0; index < data.length; index += 4) {
    const monochrome = 128 + (Math.random() + Math.random() - 1) * contrast;
    const colorShift = (Math.random() + Math.random() - 1) * chroma;

    data[index] = clampChannel(monochrome + colorShift);
    data[index + 1] = clampChannel(monochrome);
    data[index + 2] = clampChannel(monochrome - colorShift);
    data[index + 3] = 255;
  }

  noiseContext.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.02 + strength * 0.18;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.drawImage(noiseCanvas, 0, 0);
  ctx.restore();
};

// Render a painted 6x6 pattern by drawing each cell into a tiny offscreen
// canvas, then upscaling with the browser's bilinear filter. Cells naturally
// blend into a smooth, multi-directional gradient — and the small canvas
// makes the whole thing cheap regardless of the final 4K size.
const renderCustomPattern = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: number[],
  palette: string[],
) => {
  const fallback = palette[0] ?? '#0f172a';
  const source = document.createElement('canvas');
  source.width = PATTERN_GRID_SIZE;
  source.height = PATTERN_GRID_SIZE;
  const sourceCtx = source.getContext('2d');
  if (!sourceCtx) return;

  for (let y = 0; y < PATTERN_GRID_SIZE; y += 1) {
    for (let x = 0; x < PATTERN_GRID_SIZE; x += 1) {
      const cellIndex = y * PATTERN_GRID_SIZE + x;
      const colorIndex = pattern[cellIndex] ?? 0;
      sourceCtx.fillStyle = palette[colorIndex] ?? fallback;
      sourceCtx.fillRect(x, y, 1, 1);
    }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Inset by half a pixel so the *centers* of the source cells land at the
  // corners of the target — otherwise the outermost half-cell stretches flat
  // along each edge and the gradient loses its painted shape.
  const sx = -width / (PATTERN_GRID_SIZE * 2 - 2);
  const sy = -height / (PATTERN_GRID_SIZE * 2 - 2);
  const sw = width - sx * 2;
  const sh = height - sy * 2;
  ctx.drawImage(source, sx, sy, sw, sh);
};

export const WallpaperCanvas = forwardRef<HTMLCanvasElement, WallpaperCanvasProps>(({
  colors,
  type,
  angle,
  width,
  height,
  device,
  grainScale,
  bandWidth,
  weights,
  pattern,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution to 4K
    canvas.width = width;
    canvas.height = height;

    const palette = colors.length > 0 ? colors : ['#0f172a'];

    if (type === 'custom') {
      renderCustomPattern(ctx, width, height, pattern, palette);
      applyGrain(ctx, width, height, grainScale);
      return;
    }

    if (palette.length === 1) {
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, width, height);
      applyGrain(ctx, width, height, grainScale);
      return;
    }

    let gradient: CanvasGradient;

    if (type === 'linear' || type === 'glow') {
      const radians = (angle * Math.PI) / 180;
      const x2 = width * Math.cos(radians);
      const y2 = height * Math.sin(radians);
      gradient = ctx.createLinearGradient(0, 0, x2, y2);
    } else if (type === 'conic') {
      gradient = ctx.createConicGradient((angle * Math.PI) / 180, width / 2, height / 2);
    } else {
      gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      );
    }

    // For "glow", mirror the palette so the last color blooms as a centered
    // band (base → ... → accent → ... → base), like a horizon glow. The
    // per-color girths are mirrored alongside it.
    const rgbs = palette.map(hexToRgb);
    const paletteWeights =
      weights.length === palette.length ? weights : palette.map(() => 1);
    const sequence = type === 'glow' ? [...rgbs, ...rgbs.slice(0, -1).reverse()] : rgbs;
    const seqWeights =
      type === 'glow'
        ? [...paletteWeights, ...paletteWeights.slice(0, -1).reverse()]
        : paletteWeights;

    // Lay down many eased stops for smooth, soft transitions. `band` widens
    // the flat region each color holds before blending into the next.
    const band = Math.min(1, Math.max(0, bandWidth / 100));
    for (let step = 0; step <= SMOOTH_SAMPLES; step += 1) {
      const offset = getColorStop(step, SMOOTH_SAMPLES + 1);
      gradient.addColorStop(offset, rgbToCss(samplePalette(sequence, offset, band, seqWeights)));
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    applyGrain(ctx, width, height, grainScale);
  }, [colors, type, angle, width, height, grainScale, bandWidth, weights, pattern]);

  return (
    <div className={`device-frame ${device === 'phone' ? 'device-frame-phone' : 'device-frame-desktop'}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover" 
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
});

WallpaperCanvas.displayName = 'WallpaperCanvas';
