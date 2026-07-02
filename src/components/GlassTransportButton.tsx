import { Pause, Play } from 'lucide-react';

interface GlassTransportButtonProps {
  isPaused: boolean;
  onToggle: () => void;
}

export function GlassTransportButton({ isPaused, onToggle }: GlassTransportButtonProps) {
  return (
    <div className="glass-transport">
      <button
        type="button"
        onClick={onToggle}
        className="glass-transport-btn"
        aria-label={isPaused ? 'Play shader animation' : 'Pause shader animation'}
        aria-pressed={isPaused}
      >
        {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
      </button>
    </div>
  );
}
