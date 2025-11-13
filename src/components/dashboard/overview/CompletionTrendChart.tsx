/**
 * CompletionTrendChart - Line/Area chart showing completion rate trends
 * Uses Recharts for visualization
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { calculateCompletionTrends } from '@/lib/analytics';
import {
  CHART_COLORS,
  TOOLTIP_STYLES,
  GRID_STYLES,
  AXIS_STYLES,
  ANIMATION_CONFIG,
  AREA_CHART_CONFIG,
  getCompletionRateColor,
} from '@/config/chartConfig';

// Type imports
interface DailyRecord {
  date: string;
  activities: Record<string, any>;
  completionRate?: number;
  mood?: string;
}

interface Profile {
  id: string;
  name: string;
  type: string;
  avatar: string;
  created: string;
  activities: Record<string, any>;
  dailyRecords: Record<string, DailyRecord>;
  streaks: {
    current: number;
    best: number;
    perfectDays: number;
    lastUpdate: string;
  };
  achievements: any[];
  preferences: {
    completionGoal: number;
    workingHours: { start: string; end: string };
    breakReminders: boolean;
    weeklyGoal: number;
  };
}

interface CompletionTrendChartProps {
  profile: Profile;
  days: number;
}

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const rate = payload[0].value as number;
  const data = payload[0].payload;

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>
        {data.dayOfWeek}, {label}
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        <span style={{ color: CHART_COLORS.primary }}>Completion Rate: </span>
        <strong>{rate.toFixed(1)}%</strong>
      </p>
      {rate === 100 && (
        <p style={{ ...TOOLTIP_STYLES.itemStyle, color: '#FFD700' }}>
          ⭐ Perfect Day!
        </p>
      )}
    </div>
  );
};

export const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({
  profile,
  days,
}) => {
  const trendData = useMemo(() => {
    return calculateCompletionTrends(profile.dailyRecords, days);
  }, [profile.dailyRecords, days]);

  // Calculate average for reference line
  const averageRate = useMemo(() => {
    const sum = trendData.reduce((acc, item) => acc + item.completionRate, 0);
    return sum / trendData.length;
  }, [trendData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          Completion Rate Trend
        </CardTitle>
        <CardDescription>
          Daily completion percentage over the last {days} days • Avg: {averageRate.toFixed(1)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
          >
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid {...GRID_STYLES} />

            <XAxis
              dataKey="label"
              {...AXIS_STYLES}
              tick={{ ...AXIS_STYLES.tick }}
              tickLine={false}
            />

            <YAxis
              {...AXIS_STYLES}
              tick={{ ...AXIS_STYLES.tick }}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip content={<CustomTooltip />} cursor={TOOLTIP_STYLES.cursor} />

            {/* Goal Reference Line */}
            <ReferenceLine
              y={profile.preferences.completionGoal}
              stroke={CHART_COLORS.warning}
              strokeDasharray="5 5"
              label={{
                value: `Goal: ${profile.preferences.completionGoal}%`,
                position: 'right',
                fill: CHART_COLORS.warning,
                fontSize: 12,
              }}
            />

            {/* Average Reference Line */}
            <ReferenceLine
              y={averageRate}
              stroke={CHART_COLORS.success}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />

            <Area
              type="monotone"
              dataKey="completionRate"
              stroke={CHART_COLORS.primary}
              strokeWidth={AREA_CHART_CONFIG.strokeWidth}
              fill="url(#completionGradient)"
              fillOpacity={AREA_CHART_CONFIG.fillOpacity}
              dot={false}
              activeDot={AREA_CHART_CONFIG.activeDot}
              animationDuration={ANIMATION_CONFIG.animationDuration}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
            <span>Completion Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5" style={{ backgroundColor: CHART_COLORS.warning, border: '1px dashed' }} />
            <span>Goal ({profile.preferences.completionGoal}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5" style={{ backgroundColor: CHART_COLORS.success, opacity: 0.5 }} />
            <span>Average ({averageRate.toFixed(0)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionTrendChart;
