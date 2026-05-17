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
  // Japanese-inspired templates — soft vertical "glow" gradients (top → bottom).
  // Reference: "Japanese Gradients for UI" (the-brandidentity.com).
  { name: 'Copper Sunset', colors: ['#c76a35', '#6e3a1c', '#1c0f07', '#000000'] },
  { name: 'Hazy Dawn', colors: ['#1c2540', '#3a4a63', '#9aa6ab', '#d9cdb8'] },
  { name: 'Ember Horizon', colors: ['#070708', '#141a38', '#b23a2c', '#9a9a98'] },
  { name: 'Charcoal Fade', colors: ['#050505', '#2a2a2c', '#5c5c5e', '#8e8e90'] },
  { name: 'Gilded Haze', colors: ['#bdbcb8', '#d8d2bf', '#e8c84a', '#bdbcb8'] },
  { name: 'Teal Dusk', colors: ['#1a2236', '#33445a', '#6f8e92', '#aebcb6'] },
  { name: 'Violet Ash', colors: ['#241a33', '#4a3b58', '#8a8290', '#b8b4ba'] },
  { name: 'Mauve Sky', colors: ['#7d8aa0', '#9a9bab', '#bfb2b4', '#d8c3c2'] },
  // Korean-inspired templates — palettes drawn from traditional Korean color
  // themes (오방색, 백자, 청자, 단청, 한복, 조각보, 태극, 수묵).
  { name: 'Obangsaek', colors: ['#1a1a1a', '#13447e', '#c8392f', '#e4b53f', '#f1ebdc'] },
  { name: 'Baekja Porcelain', colors: ['#bcb2a0', '#d2c9b8', '#e6dfd0', '#f4efe4'] },
  { name: 'Goryeo Celadon', colors: ['#3f6457', '#6d9183', '#9cbcab', '#cfe0d2'] },
  { name: 'Dancheong', colors: ['#13432f', '#11539a', '#c8412c', '#e6c244', '#ece4d0'] },
  { name: 'Hanbok Plum', colors: ['#5e1f38', '#9c3a57', '#cf7a8e', '#f0dad9'] },
  { name: 'Jogakbo', colors: ['#3a2b3c', '#b03b4a', '#d9c7a8', '#6f9a86'] },
  { name: 'Taegeuk', colors: ['#0b3a72', '#2a5fa0', '#f0ebe0', '#cd2e3a', '#7d1f2c'] },
  { name: 'Ink & Hanji', colors: ['#141417', '#3f3b38', '#8d867b', '#e8e2d4'] },
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
