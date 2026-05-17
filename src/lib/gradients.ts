export type GradientPreset = {
  name: string;
  colors: string[];
};

export type GradientType = 'linear' | 'radial' | 'conic' | 'glow';

export const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Midnight Aurora', colors: ['#0f172a', '#334155', '#0ea5e9', '#22d3ee'] },
  { name: 'Sunset Bloom', colors: ['#f43f5e', '#fb923c', '#facc15', '#ec4899'] },
  { name: 'Deep Emerald', colors: ['#064e3b', '#059669', '#34d399', '#a7f3d0'] },
  { name: 'Royal Velvet', colors: ['#4c1d95', '#7c3aed', '#c084fc', '#e9d5ff'] },
  { name: 'Cosmic Dust', colors: ['#1e1b4b', '#4338ca', '#6366f1', '#818cf8'] },
  { name: 'Warm Sand', colors: ['#78350f', '#d97706', '#fbbf24', '#fef3c7'] },
  // Japanese-gradient style presets (pair with the "Glow" type)
  { name: 'Tokyo Glow', colors: ['#bdbdb8', '#ddd9c8', '#f2d24a'] },
  { name: 'Crimson Horizon', colors: ['#050505', '#0b1030', '#c0392b', '#8c8c8a'] },
  { name: 'Copper Fade', colors: ['#b85f37', '#a59f96', '#cfcdca'] },
];

/* ---- Color helpers for smooth, eased gradient blending ---- */

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// Smootherstep — softer S-curve than smoothstep, key to the "filmic" look.
const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

// Shape a 0→1 segment transition. `band`∈[0,1] carves flat plateaus at each
// end so the colors hold steady, compressing the blend into the middle —
// higher `band` = wider, more distinct color bands with sharper edges.
const shapeTransition = (x: number, band: number) => {
  const flat = clamp01(band) * 0.5;
  const span = 1 - flat * 2;
  if (span <= 0) {
    return x < 0.5 ? 0 : 1;
  }
  return smootherstep((x - flat) / span);
};

export const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

export const rgbToCss = ([r, g, b]: number[]) =>
  `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

// Sample a color sequence at position t∈[0,1], easing each segment transition.
// `band`∈[0,1] controls how wide each color holds before blending.
// `weights` gives each color a "girth" — a color's weight widens both
// segments touching it, so it claims more of the gradient. Omit for an even
// spread; falls back to even if the length doesn't match the colors.
export const samplePalette = (
  rgbs: number[][],
  t: number,
  band = 0,
  weights?: number[],
): number[] => {
  const segments = rgbs.length - 1;
  if (segments < 1) {
    return rgbs[0];
  }

  const useWeights = !!weights && weights.length === rgbs.length;

  // Width of each transition segment, derived from its two colors' girths.
  const widths: number[] = [];
  let total = 0;
  for (let j = 0; j < segments; j += 1) {
    const width = useWeights
      ? Math.max(0.0001, weights![j] + weights![j + 1])
      : 1;
    widths.push(width);
    total += width;
  }

  // Walk the cumulative widths to find which segment `t` lands in.
  const target = clamp01(t) * total;
  let acc = 0;
  let index = 0;
  while (index < segments - 1 && acc + widths[index] < target) {
    acc += widths[index];
    index += 1;
  }

  const local = shapeTransition((target - acc) / widths[index], band);
  const a = rgbs[index];
  const b = rgbs[index + 1];

  return [
    a[0] + (b[0] - a[0]) * local,
    a[1] + (b[1] - a[1]) * local,
    a[2] + (b[2] - a[2]) * local,
  ];
};
