import type { CSSProperties, Ref } from 'react';
import type { PaperShaderElement } from '@paper-design/shaders-react';
import { getShaderDef } from '../lib/shaders';
import type { ShaderKind } from '../lib/shaders';

interface ShaderBackgroundProps {
  kind: ShaderKind;
  colors: string[];
  paramValues: Record<string, number>;
  speed: number;
  scale: number;
  frame?: number;
  style?: CSSProperties;
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;
  mountRef?: Ref<PaperShaderElement>;
}

export function ShaderBackground({
  kind,
  colors,
  paramValues,
  speed,
  scale,
  frame,
  style,
  minPixelRatio,
  maxPixelCount,
  webGlContextAttributes,
  mountRef,
}: ShaderBackgroundProps) {
  const def = getShaderDef(kind);
  const Component = def.component;
  const shaderProps = def.buildProps(colors, paramValues, speed, scale);

  return (
    <Component
      {...shaderProps}
      ref={mountRef}
      frame={frame}
      width="100%"
      height="100%"
      minPixelRatio={minPixelRatio}
      maxPixelCount={maxPixelCount}
      webGlContextAttributes={webGlContextAttributes}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
