import type { CSSProperties } from 'react';
import { getShaderDef } from '../lib/shaders';
import type { ShaderKind } from '../lib/shaders';

interface ShaderBackgroundProps {
  kind: ShaderKind;
  colors: string[];
  paramValues: Record<string, number>;
  speed: number;
  scale: number;
  style?: CSSProperties;
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;
}

export function ShaderBackground({
  kind,
  colors,
  paramValues,
  speed,
  scale,
  style,
  minPixelRatio,
  maxPixelCount,
  webGlContextAttributes,
}: ShaderBackgroundProps) {
  const def = getShaderDef(kind);
  const Component = def.component;
  const shaderProps = def.buildProps(colors, paramValues, speed, scale);

  return (
    <Component
      {...shaderProps}
      width="100%"
      height="100%"
      minPixelRatio={minPixelRatio}
      maxPixelCount={maxPixelCount}
      webGlContextAttributes={webGlContextAttributes}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
