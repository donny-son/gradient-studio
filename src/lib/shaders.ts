import type { ComponentType } from 'react';
import { MeshGradient, Warp, Voronoi, SimplexNoise, GrainGradient } from '@paper-design/shaders-react';

export type ShaderKind = 'mesh' | 'warp' | 'voronoi' | 'simplex' | 'grain';

export type ShaderParamSpec = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

export type ShaderDef = {
  kind: ShaderKind;
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>;
  params: ShaderParamSpec[];
  buildProps: (
    colors: string[],
    values: Record<string, number>,
    speed: number,
    scale: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Record<string, any>;
};

export const SHADER_DEFS: ShaderDef[] = [
  {
    kind: 'mesh',
    name: 'Mesh',
    description: 'Flowing color spots warped by organic distortion.',
    component: MeshGradient,
    params: [
      { key: 'distortion', label: 'Distortion', min: 0, max: 1, step: 0.01, default: 0.6 },
      { key: 'swirl', label: 'Swirl', min: 0, max: 1, step: 0.01, default: 0.35 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colors,
      distortion: values.distortion,
      swirl: values.swirl,
      speed,
      scale,
    }),
  },
  {
    kind: 'warp',
    name: 'Warp',
    description: 'Smoky, marbled color fields warped by noise and swirl.',
    component: Warp,
    params: [
      { key: 'distortion', label: 'Distortion', min: 0, max: 1, step: 0.01, default: 0.4 },
      { key: 'swirl', label: 'Swirl', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colors,
      shape: 'edge',
      distortion: values.distortion,
      swirl: values.swirl,
      speed,
      scale,
    }),
  },
  {
    kind: 'voronoi',
    name: 'Voronoi',
    description: 'Cellular pattern with soft, glowing cell borders.',
    component: Voronoi,
    params: [
      { key: 'distortion', label: 'Distortion', min: 0, max: 0.5, step: 0.01, default: 0.2 },
      { key: 'glow', label: 'Glow', min: 0, max: 1, step: 0.01, default: 0.4 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colors,
      distortion: values.distortion,
      glow: values.glow,
      speed,
      scale,
    }),
  },
  {
    kind: 'simplex',
    name: 'Simplex',
    description: 'Smooth animated color curves from layered noise.',
    component: SimplexNoise,
    params: [
      { key: 'softness', label: 'Softness', min: 0, max: 1, step: 0.01, default: 0.25 },
      { key: 'stepsPerColor', label: 'Steps', min: 1, max: 6, step: 1, default: 2 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colors,
      softness: values.softness,
      stepsPerColor: values.stepsPerColor,
      speed,
      scale,
    }),
  },
  {
    kind: 'grain',
    name: 'Grain',
    description: 'Grainy, noise-textured gradient bands.',
    component: GrainGradient,
    params: [
      { key: 'intensity', label: 'Intensity', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'noise', label: 'Noise', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: '#050505',
      colors,
      shape: 'wave',
      intensity: values.intensity,
      noise: values.noise,
      speed,
      scale,
    }),
  },
];

export const getShaderDef = (kind: ShaderKind): ShaderDef =>
  SHADER_DEFS.find((def) => def.kind === kind) ?? SHADER_DEFS[0];

export const buildDefaultParamValues = (def: ShaderDef): Record<string, number> =>
  Object.fromEntries(def.params.map((param) => [param.key, param.default]));

export const buildAllDefaultParamValues = (): Record<ShaderKind, Record<string, number>> =>
  Object.fromEntries(SHADER_DEFS.map((def) => [def.kind, buildDefaultParamValues(def)])) as Record<
    ShaderKind,
    Record<string, number>
  >;
