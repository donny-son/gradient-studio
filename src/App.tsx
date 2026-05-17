import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { getPalette } from 'colorthief';
import {
  Aperture,
  ChevronDown,
  Download,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  Monitor,
  Palette,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sunrise,
  Upload,
} from 'lucide-react';
import { GRADIENT_PRESETS, PRESET_GROUPS } from './lib/gradients';
import type { GradientType } from './lib/gradients';
import { WallpaperCanvas } from './components/WallpaperCanvas';

type DeviceType = 'desktop' | 'phone';

// Neutral per-color girth — equal values give an even spread.
const DEFAULT_WEIGHT = 10;

const DEVICE_PRESETS: Record<DeviceType, { label: string; width: number; height: number }> = {
  desktop: { label: 'Desktop', width: 3840, height: 2160 },
  phone: { label: 'Phone', width: 1290, height: 2796 },
};

const GRADIENT_TYPES: Array<{ type: GradientType; label: string; icon: typeof Layers3 }> = [
  { type: 'linear', label: 'Linear', icon: Layers3 },
  { type: 'radial', label: 'Radial', icon: Aperture },
  { type: 'conic', label: 'Conic', icon: Sparkles },
  { type: 'glow', label: 'Glow', icon: Sunrise },
];

// A collapsible control group — a notebook page you fold open or shut.
type SectionProps = {
  id: string;
  icon: typeof Layers3;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
};

function Section({ id, icon: Icon, title, open, onToggle, children }: SectionProps) {
  return (
    <div className={`accordion-section${open ? ' accordion-section-open' : ''}`}>
      <button
        type="button"
        className="accordion-header"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <Icon size={18} />
        <span>{title}</span>
        <ChevronDown size={18} className="accordion-chevron" />
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

export default function App() {
  const [colors, setColors] = useState<string[]>(GRADIENT_PRESETS[0].colors);
  const [weights, setWeights] = useState<number[]>(
    GRADIENT_PRESETS[0].colors.map(() => DEFAULT_WEIGHT),
  );
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [grainScale, setGrainScale] = useState(10);
  const [bandWidth, setBandWidth] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['presets', 'palette']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedDevice = DEVICE_PRESETS[device];

  // Fold a control section open or shut.
  const toggleSection = (id: string) =>
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((section) => section !== id) : [...prev, id],
    );

  // Swap the whole palette and reset every girth back to neutral.
  const applyPalette = (next: string[]) => {
    setColors(next);
    setWeights(next.map(() => DEFAULT_WEIGHT));
  };

  // Reorder a color (and its girth) via drag-and-drop.
  const moveColor = (from: number | null, to: number) => {
    if (from === null || from === to) return;
    const nextColors = [...colors];
    const nextWeights = [...weights];
    const [movedColor] = nextColors.splice(from, 1);
    const [movedWeight] = nextWeights.splice(from, 1);
    nextColors.splice(to, 0, movedColor);
    nextWeights.splice(to, 0, movedWeight);
    setColors(nextColors);
    setWeights(nextWeights);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const imageUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to load image'));
      });

      const palette = await getPalette(img, { colorCount: 5 });
      const hexColors = palette?.map((color) => color.hex()) ?? [];

      if (hexColors.length > 0) {
        applyPalette(hexColors);
      }
    } catch (error) {
      console.error('Error extracting colors:', error);
    } finally {
      URL.revokeObjectURL(imageUrl);
      setIsProcessing(false);
    }
  };

  const downloadWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `wallpaper-${device}-${selectedDevice.width}x${selectedDevice.height}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-bg-dark text-slate-500 p-4 md:p-8 lg:p-10">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="order-1 lg:col-span-12">
          <h1 className="text-4xl font-black tracking-normal text-slate-900 md:text-6xl">
            Gradient Studio
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-700 md:text-lg">
            Build high-resolution wallpapers with extracted palettes, multiple gradient engines, and device-specific previews.
          </p>
        </div>

        <div className="order-3 lg:order-2 lg:col-span-4">
          <div className="glass-panel overflow-hidden">
            <Section
              id="source"
              icon={ImageIcon}
              title="Source"
              open={openSections.includes('source')}
              onToggle={toggleSection}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="upload-btn"
              >
                <Upload size={18} />
                <span>{isProcessing ? 'Processing...' : 'Upload source image'}</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </button>
            </Section>

            <Section
              id="presets"
              icon={Palette}
              title="Presets"
              open={openSections.includes('presets')}
              onToggle={toggleSection}
            >
              {PRESET_GROUPS.map((group) => (
                <div key={group.country}>
                  <p className="preset-group-label">{group.country}</p>
                  <div className="grid w-full grid-cols-2 gap-2">
                    {group.presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPalette(preset.colors)}
                        className="preset-cell"
                      >
                        <span className="preset-swatch" style={{ background: `linear-gradient(90deg, ${preset.colors.join(', ')})` }} />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </Section>

            <Section
              id="gradient"
              icon={Sparkles}
              title="Gradient"
              open={openSections.includes('gradient')}
              onToggle={toggleSection}
            >
              <div className="segmented-grid">
                {GRADIENT_TYPES.map(({ type: gradientType, label, icon: Icon }) => (
                  <button
                    key={gradientType}
                    type="button"
                    onClick={() => {
                      setType(gradientType);
                      // Vertical orientation makes the glow read as a
                      // horizontal "horizon" band.
                      if (gradientType === 'glow') setAngle(90);
                    }}
                    className={`segment-cell ${type === gradientType ? 'segment-cell-active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              {type !== 'radial' && (
                <div className="field">
                  <span className="field-label">Angle</span>
                  <div className="control-cell-range">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value))}
                      className="w-full accent-brand-primary"
                    />
                    <span className="angle-readout">{angle}°</span>
                  </div>
                </div>
              )}
            </Section>

            <Section
              id="palette"
              icon={Palette}
              title="Palette"
              open={openSections.includes('palette')}
              onToggle={toggleSection}
            >
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-row${dragIndex === index ? ' color-row-dragging' : ''}${
                    overIndex === index && dragIndex !== index ? ' color-row-over' : ''
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setOverIndex(index);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    moveColor(dragIndex, index);
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                >
                  <button
                    type="button"
                    className="drag-handle"
                    draggable
                    onDragStart={(event) => {
                      setDragIndex(index);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', String(index));
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setOverIndex(null);
                    }}
                    aria-label={`Reorder color ${index + 1}`}
                  >
                    <GripVertical size={16} />
                  </button>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...colors];
                      newColors[index] = e.target.value;
                      setColors(newColors);
                    }}
                    aria-label={`Palette color ${index + 1}`}
                    className="color-orb"
                  />
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={weights[index] ?? DEFAULT_WEIGHT}
                    onChange={(e) => {
                      const newWeights = [...weights];
                      newWeights[index] = parseInt(e.target.value);
                      setWeights(newWeights);
                    }}
                    aria-label={`Color ${index + 1} girth`}
                    className="w-full accent-brand-primary"
                  />
                  <span className="angle-readout">{weights[index] ?? DEFAULT_WEIGHT}</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setColors([...colors, '#ffffff']);
                  setWeights([...weights, DEFAULT_WEIGHT]);
                }}
                className="color-add"
                aria-label="Add color"
              >
                <Plus size={16} />
              </button>
            </Section>

            <Section
              id="output"
              icon={Monitor}
              title="Output"
              open={openSections.includes('output')}
              onToggle={toggleSection}
            >
              <div className="field">
                <span className="field-label">Preview device</span>
                <div className="segmented-grid segmented-grid-two">
                  <button
                    type="button"
                    onClick={() => setDevice('desktop')}
                    className={`segment-cell ${device === 'desktop' ? 'segment-cell-active' : ''}`}
                  >
                    <Monitor size={16} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice('phone')}
                    className={`segment-cell ${device === 'phone' ? 'segment-cell-active' : ''}`}
                  >
                    <Smartphone size={16} />
                    <span>Phone</span>
                  </button>
                </div>
              </div>

              <div className="field">
                <span className="field-label">
                  <Layers3 size={14} /> Band
                </span>
                <div className="control-cell-range">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bandWidth}
                    onChange={(event) => setBandWidth(parseInt(event.target.value))}
                    className="w-full accent-brand-primary"
                  />
                  <span className="angle-readout">{bandWidth}</span>
                </div>
              </div>

              <div className="field">
                <span className="field-label">
                  <SlidersHorizontal size={14} /> Grain
                </span>
                <div className="control-cell-range">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={grainScale}
                    onChange={(event) => setGrainScale(parseInt(event.target.value))}
                    className="w-full accent-brand-primary"
                  />
                  <span className="angle-readout">{grainScale}</span>
                </div>
              </div>
            </Section>
          </div>
        </div>

        <div className="order-2 lg:order-3 lg:col-span-8 lg:sticky lg:top-8 lg:self-start">
          <div className="preview-stage">
          <WallpaperCanvas
              ref={canvasRef}
            colors={colors}
            type={type}
            angle={angle}
              width={selectedDevice.width}
              height={selectedDevice.height}
              device={device}
              grainScale={grainScale}
              bandWidth={bandWidth}
              weights={weights}
          />

            <button type="button" onClick={downloadWallpaper} className="download-btn">
              <Download size={19} />
              Download {selectedDevice.width}x{selectedDevice.height} PNG
            </button>

            <div className="preview-status">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Active Output</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedDevice.label} / {type} / {selectedDevice.width}x{selectedDevice.height}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                {colors.map((c, i) => (
                    <div key={i} className="h-7 w-7 rounded-full border-2 border-slate-950" style={{ backgroundColor: c }} />
                ))}
              </div>
            <button 
              onClick={() => applyPalette(GRADIENT_PRESETS[0].colors)}
                  className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-white"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        </div>
          </div>
      </div>

        <footer className="order-4 lg:col-span-12 mt-4 flex flex-col items-center gap-1 border-t border-slate-300/60 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <p className="flex items-center gap-3">
            <span>
              Crafted by{' '}
              <a
                href="https://son.do"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
              >
                son.do
              </a>
            </span>
            <a
              href="https://github.com/donny-son/gradient-studio"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-semibold text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>Source</span>
            </a>
          </p>
          <p>Released under the MIT License &copy; 2026 Do Son</p>
        </footer>
    </div>
    </div>
  );
}
