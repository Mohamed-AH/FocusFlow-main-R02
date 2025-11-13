/**
 * FocusFlow Chart Configuration
 * Consistent styling and configuration for all Recharts components
 */

import React from 'react';

// --- Color Palettes ---

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  success: '#059669',
  warning: '#DC2626',
  info: '#06B6D4',
  pink: '#EC4899',
  purple: '#8B5CF6',
  orange: '#F97316',
  blue: '#3B82F6',
  green: '#10B981',
  amber: '#F59E0B',
  emerald: '#059669',
  red: '#DC2626',
  cyan: '#06B6D4',
};

export const CATEGORY_COLORS: Record<string, string> = {
  work: '#3B82F6',
  personal: '#10B981',
  family: '#EC4899',
  learning: '#8B5CF6',
  academic: '#8B5CF6',
  wellness: '#F59E0B',
  development: '#06B6D4',
  business: '#F59E0B',
  product: '#3B82F6',
  marketing: '#EC4899',
  networking: '#10B981',
  strategy: '#8B5CF6',
  creative: '#EC4899',
  break: '#F59E0B',
  household: '#06B6D4',
  social: '#F97316',
  research: '#8B5CF6',
};

export const GRADIENT_COLORS = {
  primary: ['#3B82F6', '#60A5FA'],
  success: ['#059669', '#10B981'],
  warning: ['#DC2626', '#EF4444'],
  purple: ['#8B5CF6', '#A78BFA'],
  pink: ['#EC4899', '#F472B6'],
};

export const COMPLETION_RATE_COLORS = {
  excellent: '#059669', // >= 90%
  good: '#10B981', // >= 70%
  medium: '#F59E0B', // >= 50%
  low: '#DC2626', // < 50%
};

export function getCompletionRateColor(rate: number): string {
  if (rate >= 90) return COMPLETION_RATE_COLORS.excellent;
  if (rate >= 70) return COMPLETION_RATE_COLORS.good;
  if (rate >= 50) return COMPLETION_RATE_COLORS.medium;
  return COMPLETION_RATE_COLORS.low;
}

// --- Chart Dimensions (Responsive) ---

export const CHART_DIMENSIONS = {
  small: {
    height: 200,
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
  },
  medium: {
    height: 300,
    margin: { top: 10, right: 10, bottom: 20, left: 0 },
  },
  large: {
    height: 400,
    margin: { top: 20, right: 30, bottom: 20, left: 20 },
  },
};

// --- Tooltip Configuration ---

export const TOOLTIP_STYLES = {
  contentStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  labelStyle: {
    color: '#F1F5F9',
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: '#E2E8F0',
    padding: '2px 0',
  },
  cursor: {
    fill: 'rgba(148, 163, 184, 0.1)',
  },
};

// --- Grid Configuration ---

export const GRID_STYLES = {
  stroke: '#E2E8F0',
  strokeDasharray: '3 3',
  strokeOpacity: 0.3,
};

// --- Axis Configuration ---

export const AXIS_STYLES = {
  tick: {
    fill: '#64748B',
    fontSize: 12,
  },
  line: {
    stroke: '#E2E8F0',
  },
};

// --- Animation Configuration ---

export const ANIMATION_CONFIG = {
  animationDuration: 800,
  animationEasing: 'ease-in-out' as const,
};

// --- Custom Tooltip Components ---

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CompletionRateTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const rate = data.value as number;

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>{label}</p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        <span style={{ color: data.color }}>Completion: </span>
        <strong>{rate.toFixed(1)}%</strong>
      </p>
    </div>
  );
};

export const CategoryTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>{data.name}</p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Time: <strong>{formatMinutes(data.value)}</strong>
      </p>
      {data.payload.completionRate !== undefined && (
        <p style={TOOLTIP_STYLES.itemStyle}>
          Completion: <strong>{data.payload.completionRate.toFixed(0)}%</strong>
        </p>
      )}
    </div>
  );
};

export const ActivityTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>
        {data.icon} {data.name}
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Completed: <strong>{data.completedCount}/{data.plannedCount}</strong>
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Rate: <strong>{data.completionRate.toFixed(0)}%</strong>
      </p>
      {data.totalTime > 0 && (
        <p style={TOOLTIP_STYLES.itemStyle}>
          Time: <strong>{formatMinutes(data.totalTime)}</strong>
        </p>
      )}
    </div>
  );
};

// --- Legend Configuration ---

export const LEGEND_STYLES = {
  iconSize: 12,
  wrapperStyle: {
    paddingTop: '20px',
  },
};

// --- Pie Chart Configuration ---

export const PIE_CHART_CONFIG = {
  innerRadius: '60%',
  outerRadius: '80%',
  paddingAngle: 2,
  labelLine: false,
  label: {
    fill: '#64748B',
    fontSize: 12,
  },
};

// --- Bar Chart Configuration ---

export const BAR_CHART_CONFIG = {
  radius: [8, 8, 0, 0] as [number, number, number, number],
  maxBarSize: 60,
};

// --- Line/Area Chart Configuration ---

export const LINE_CHART_CONFIG = {
  strokeWidth: 3,
  dot: {
    r: 4,
    strokeWidth: 2,
    fill: '#fff',
  },
  activeDot: {
    r: 6,
    strokeWidth: 2,
  },
};

export const AREA_CHART_CONFIG = {
  strokeWidth: 2,
  fillOpacity: 0.3,
  dot: false,
  activeDot: {
    r: 6,
    strokeWidth: 2,
  },
};

// --- Utility Functions ---

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// --- Responsive Breakpoints ---

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export function getResponsiveHeight(width: number): number {
  if (width < BREAKPOINTS.mobile) return 200;
  if (width < BREAKPOINTS.tablet) return 250;
  if (width < BREAKPOINTS.desktop) return 300;
  return 350;
}

// --- Chart-Specific Presets ---

export const CHART_PRESETS = {
  completionTrend: {
    ...CHART_DIMENSIONS.medium,
    colors: GRADIENT_COLORS.primary,
    strokeColor: CHART_COLORS.primary,
    fillColor: CHART_COLORS.primary,
  },
  categoryBreakdown: {
    ...CHART_DIMENSIONS.medium,
    colors: Object.values(CATEGORY_COLORS),
  },
  activityLeaderboard: {
    ...CHART_DIMENSIONS.large,
    barColor: CHART_COLORS.primary,
  },
  streakHistory: {
    ...CHART_DIMENSIONS.medium,
    colors: [CHART_COLORS.accent, CHART_COLORS.primary],
  },
  weekComparison: {
    ...CHART_DIMENSIONS.medium,
    colors: [CHART_COLORS.primary, CHART_COLORS.secondary],
  },
  timeOfDay: {
    ...CHART_DIMENSIONS.large,
    colors: GRADIENT_COLORS.purple,
  },
};

// --- Export All ---

export default {
  CHART_COLORS,
  CATEGORY_COLORS,
  GRADIENT_COLORS,
  COMPLETION_RATE_COLORS,
  CHART_DIMENSIONS,
  TOOLTIP_STYLES,
  GRID_STYLES,
  AXIS_STYLES,
  ANIMATION_CONFIG,
  LEGEND_STYLES,
  PIE_CHART_CONFIG,
  BAR_CHART_CONFIG,
  LINE_CHART_CONFIG,
  AREA_CHART_CONFIG,
  CHART_PRESETS,
  getCompletionRateColor,
  getResponsiveHeight,
};
