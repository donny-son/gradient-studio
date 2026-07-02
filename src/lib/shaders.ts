import type { ComponentType } from 'react';
import {
  MeshGradient,
  Warp,
  Voronoi,
  SimplexNoise,
  GrainGradient,
  DotOrbit,
  ColorPanels,
  GodRays,
  Metaballs,
  NeuroNoise,
  PerlinNoise,
  SmokeRing,
  Spiral,
  Swirl,
} from '@paper-design/shaders-react';

export type ShaderKind =
  | 'mesh'
  | 'warp'
  | 'voronoi'
  | 'simplex'
  | 'grain'
  | 'dotOrbit'
  | 'colorPanels'
  | 'godRays'
  | 'metaballs'
  | 'neuroNoise'
  | 'perlinNoise'
  | 'smokeRing'
  | 'spiral'
  | 'swirl';

// A near-black neutral used as a shader's backdrop color when its palette
// slot is reserved for a distinct foreground/background split.
const NEUTRAL_BACK = '#050505';

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
      colorBack: NEUTRAL_BACK,
      colors,
      shape: 'wave',
      intensity: values.intensity,
      noise: values.noise,
      speed,
      scale,
    }),
  },
  {
    kind: 'dotOrbit',
    name: 'Dot Orbit',
    description: 'Orbiting dots that drift and swap colors as they travel.',
    component: DotOrbit,
    params: [
      { key: 'size', label: 'Dot Size', min: 0.2, max: 2, step: 0.01, default: 1 },
      { key: 'spreading', label: 'Spreading', min: 0, max: 1, step: 0.01, default: 1 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colors,
      size: values.size,
      spreading: values.spreading,
      speed,
      scale,
    }),
  },
  {
    kind: 'colorPanels',
    name: 'Panels',
    description: 'Overlapping translucent color panels sliding past each other.',
    component: ColorPanels,
    params: [
      { key: 'density', label: 'Density', min: 1, max: 10, step: 0.5, default: 3 },
      { key: 'blur', label: 'Blur', min: 0, max: 1, step: 0.01, default: 0.15 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colors,
      density: values.density,
      blur: values.blur,
      speed,
      scale,
    }),
  },
  {
    kind: 'godRays',
    name: 'God Rays',
    description: 'Dramatic bursts of light radiating from a glowing core.',
    component: GodRays,
    params: [
      { key: 'density', label: 'Density', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'intensity', label: 'Intensity', min: 0, max: 1, step: 0.01, default: 0.8 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colorBloom: colors[colors.length - 1] ?? '#ffffff',
      colors,
      density: values.density,
      intensity: values.intensity,
      speed,
      scale,
    }),
  },
  {
    kind: 'metaballs',
    name: 'Metaballs',
    description: 'Blobby, merging droplets of color.',
    component: Metaballs,
    params: [
      { key: 'count', label: 'Count', min: 2, max: 20, step: 1, default: 10 },
      { key: 'size', label: 'Size', min: 0.1, max: 1.5, step: 0.01, default: 0.83 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colors,
      count: values.count,
      size: values.size,
      speed,
      scale,
    }),
  },
  {
    kind: 'neuroNoise',
    name: 'Neuro',
    description: 'Organic, brain-like flowing noise in three tones.',
    component: NeuroNoise,
    params: [
      { key: 'brightness', label: 'Brightness', min: 0, max: 1, step: 0.01, default: 0.1 },
      { key: 'contrast', label: 'Contrast', min: 0, max: 1, step: 0.01, default: 0.3 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colorMid: colors[Math.floor(colors.length / 2)] ?? colors[0] ?? '#47a6ff',
      colorFront: colors[colors.length - 1] ?? colors[0] ?? '#ffffff',
      brightness: values.brightness,
      contrast: values.contrast,
      speed,
      scale,
    }),
  },
  {
    kind: 'perlinNoise',
    name: 'Perlin',
    description: 'Classic drifting cloud-like noise between two tones.',
    component: PerlinNoise,
    params: [
      { key: 'proportion', label: 'Proportion', min: 0, max: 1, step: 0.01, default: 0.35 },
      { key: 'softness', label: 'Softness', min: 0, max: 1, step: 0.01, default: 0.4 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: colors[0] ?? '#0f172a',
      colorFront: colors[colors.length - 1] ?? colors[0] ?? '#ffffff',
      proportion: values.proportion,
      softness: values.softness,
      speed,
      scale: scale * 2.5,
    }),
  },
  {
    kind: 'smokeRing',
    name: 'Smoke Ring',
    description: 'A glowing, noise-textured ring of smoke.',
    component: SmokeRing,
    params: [
      { key: 'radius', label: 'Radius', min: 0.05, max: 0.6, step: 0.01, default: 0.25 },
      { key: 'thickness', label: 'Thickness', min: 0.1, max: 1, step: 0.01, default: 0.65 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colors,
      radius: values.radius,
      thickness: values.thickness,
      speed,
      scale,
    }),
  },
  {
    kind: 'spiral',
    name: 'Spiral',
    description: 'A hypnotic, hand-drawn spiral of colored strokes.',
    component: Spiral,
    params: [
      { key: 'density', label: 'Density', min: 0.2, max: 3, step: 0.01, default: 1 },
      { key: 'strokeWidth', label: 'Stroke Width', min: 0.05, max: 1, step: 0.01, default: 0.5 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: colors[0] ?? '#001429',
      colorFront: colors[colors.length - 1] ?? colors[0] ?? '#79d1ff',
      density: values.density,
      strokeWidth: values.strokeWidth,
      speed,
      scale,
    }),
  },
  {
    kind: 'swirl',
    name: 'Swirl',
    description: 'Concentric bands of color twisting around a center.',
    component: Swirl,
    params: [
      { key: 'bandCount', label: 'Bands', min: 1, max: 10, step: 1, default: 4 },
      { key: 'twist', label: 'Twist', min: 0, max: 1, step: 0.01, default: 0.1 },
    ],
    buildProps: (colors, values, speed, scale) => ({
      colorBack: NEUTRAL_BACK,
      colors,
      bandCount: values.bandCount,
      twist: values.twist,
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
