import React from "react";

interface ProgressRingLayer {
  /** Value between 0 and 1 */
  value: number;
  /** Stroke color or gradient (CSS) */
  color: string;
  /** Stroke width in px */
  strokeWidth: number;
  /** Optional: pulsing animation for milestone */
  pulse?: boolean;
  /** Optional: dashed ring for markers */
  dashed?: boolean;
  /** Optional: z-index order (higher = on top) */
  zIndex?: number;
}

interface ProgressRingProps {
  /** Diameter in px */
  size?: number;
  /** Array of ring layers (from bottom to top) */
  layers: ProgressRingLayer[];
  /** Center content (e.g., percentage, streak, message) */
  children?: React.ReactNode;
  /** Animate transitions */
  animate?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

const DEFAULT_SIZE = 120;

export const ProgressRing: React.FC<ProgressRingProps> = ({
  size = DEFAULT_SIZE,
  layers,
  children,
  animate = true,
  ariaLabel = "Progress ring"
}) => {
  // SVG circle math
  const center = size / 2;
  const radius = (size - Math.max(...layers.map(l => l.strokeWidth))) / 2;
  const circumference = 2 * Math.PI * radius;

  // Sort layers by zIndex (default 0)
  const sortedLayers = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={ariaLabel}
      role="img"
    >
      <svg
        width={size}
        height={size}
        className="absolute top-0 left-0"
        style={{ zIndex: 0 }}
      >
        {sortedLayers.map((layer, i) => {
          const offset = circumference * (1 - layer.value);
          const strokeDasharray = layer.dashed
            ? `${circumference / 24} ${circumference / 24}`
            : circumference;
          const strokeDashoffset = offset;
          const transition = animate
            ? "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s"
            : undefined;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={layer.color}
              strokeWidth={layer.strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition,
                filter: layer.pulse
                  ? "drop-shadow(0 0 8px rgba(255,255,0,0.5))"
                  : undefined,
                zIndex: layer.zIndex || 0,
              }}
              strokeLinecap="round"
              opacity={layer.value > 0 ? 1 : 0.15}
            />
          );
        })}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center select-none"
        style={{ zIndex: 2 }}
      >
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;