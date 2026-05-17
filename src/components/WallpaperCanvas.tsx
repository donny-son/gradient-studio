import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { GradientType } from '../lib/gradients';
import { hexToRgb, rgbToCss, samplePalette } from '../lib/gradients';

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
}

const getColorStop = (index: number, count: number) => {
  if (count <= 1) {
    return 0;
  }

  return index / (count - 1);
};

const applyGrain = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grainScale: number,
) => {
  if (grainScale <= 0) {
    return;
  }

  const grainSize = Math.max(1, Math.round(grainScale / 7));
  const noiseWidth = Math.ceil(width / grainSize);
  const noiseHeight = Math.ceil(height / grainSize);
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = noiseWidth;
  noiseCanvas.height = noiseHeight;

  const noiseContext = noiseCanvas.getContext('2d');
  if (!noiseContext) {
    return;
  }

  const imageData = noiseContext.createImageData(noiseWidth, noiseHeight);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const value = Math.random() * 255;
    imageData.data[index] = value;
    imageData.data[index + 1] = value;
    imageData.data[index + 2] = value;
    imageData.data[index + 3] = 255;
  }

  noiseContext.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.globalAlpha = Math.min(0.32, grainScale / 120);
  ctx.globalCompositeOperation = 'overlay';
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCanvas, 0, 0, width, height);
  ctx.restore();
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
  }, [colors, type, angle, width, height, grainScale, bandWidth, weights]);

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
