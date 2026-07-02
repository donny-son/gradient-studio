import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderBackground } from '../components/ShaderBackground';
import type { ShaderKind } from './shaders';

interface CaptureShaderSnapshotOptions {
  kind: ShaderKind;
  colors: string[];
  paramValues: Record<string, number>;
  scale: number;
  frame: number;
  width: number;
  height: number;
}

// Mounts the shader off-screen at the exact export resolution, pinned to the
// same animation frame currently shown in the live preview (so a paused or
// mid-animation canvas exports exactly what's on screen instead of a fresh,
// independently-animated render), waits for a couple of animation frames so
// the WebGL buffer is actually painted, then reads it back as a PNG data
// URL. minPixelRatio/maxPixelCount are pinned so the captured canvas is
// exactly `width`x`height` regardless of the device's pixel ratio, and
// preserveDrawingBuffer keeps the frame readable via toDataURL after the
// shader's own render loop swaps buffers.
export const captureShaderSnapshot = async ({
  kind,
  colors,
  paramValues,
  scale,
  frame,
  width,
  height,
}: CaptureShaderSnapshotOptions): Promise<string> => {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    await new Promise<void>((resolve) => {
      root.render(
        createElement(ShaderBackground, {
          kind,
          colors,
          paramValues,
          scale,
          frame,
          speed: 0,
          minPixelRatio: 1,
          maxPixelCount: width * height,
          webGlContextAttributes: { preserveDrawingBuffer: true },
        }),
      );
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const canvas = host.querySelector('canvas');
    if (!canvas) {
      throw new Error('Shader canvas failed to mount for export');
    }
    return canvas.toDataURL('image/png');
  } finally {
    root.unmount();
    host.remove();
  }
};
