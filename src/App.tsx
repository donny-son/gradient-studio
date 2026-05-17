import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getPalette } from 'colorthief';
import {
  Aperture,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedDevice = DEVICE_PRESETS[device];

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
            <div className="control-row">
              <div className="control-cell control-cell-label">
                <ImageIcon size={18} />
                <span>Source</span>
              </div>
              <button
                type="button"
              onClick={() => fileInputRef.current?.click()}
                className="control-cell control-cell-action group"
            >
                <Upload size={18} className="text-cyan-200" />
                <span>
                {isProcessing ? 'Processing...' : 'Upload source image'}
              </span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              </button>
          </div>

            <div className="control-row control-row-stack">
              <div className="control-cell control-cell-label">
                <Palette size={18} />
                <span>Presets</span>
              </div>
              <div className="control-cell">
                <div className="flex w-full flex-col gap-4">
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
                </div>
              </div>
          </div>

            <div className="control-row control-row-stack">
              <div className="control-cell control-cell-label">
                <Sparkles size={18} />
                <span>Gradient</span>
              </div>
              <div className="control-cell">
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
              </div>
            </div>

            <div className="control-row control-row-stack">
              <div className="control-cell control-cell-label">
                <Palette size={18} />
                <span>Palette</span>
              </div>
              <div className="control-cell">
                <div className="flex w-full flex-col gap-2">
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
            </div>
          </div>
            </div>

            <div className="control-row">
              <div className="control-cell control-cell-label">
                <Monitor size={18} />
                <span>Preview</span>
              </div>
              <div className="control-cell">
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
            </div>

            {type !== 'radial' && (
              <div className="control-row">
                <div className="control-cell control-cell-label">
                  <span>Angle</span>
                </div>
                <div className="control-cell control-cell-range">
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

            <div className="control-row">
              <div className="control-cell control-cell-label">
                <Layers3 size={18} />
                <span>Band</span>
              </div>
              <div className="control-cell control-cell-range">
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

            <div className="control-row">
              <div className="control-cell control-cell-label">
                <SlidersHorizontal size={18} />
                <span>Grain</span>
              </div>
              <div className="control-cell control-cell-range">
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
        </div>
        </div>

        <div className="order-2 lg:order-3 lg:col-span-8">
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
    </div>
    </div>
  );
}
