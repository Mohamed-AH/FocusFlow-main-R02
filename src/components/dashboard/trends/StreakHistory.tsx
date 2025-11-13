/**
 * StreakHistory - Line chart showing streak progression over time
 * Includes annotations for perfect days and streak milestones
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from 'recharts';
import { calculateStreakHistory } from '@/lib/analytics';
import {
  CHART_COLORS,
  TOOLTIP_STYLES,
  GRID_STYLES,
  AXIS_STYLES,
  ANIMATION_CONFIG,
  LINE_CHART_CONFIG,
} from '@/config/chartConfig';
import { Flame, Star } from 'lucide-react';

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

interface StreakHistoryProps {
  profile: Profile;
  days: number;
}

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>{label}</p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        <Flame className="inline h-3 w-3 text-orange-500 mr-1" />
        Streak: <strong>{data.streak} days</strong>
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Completion: <strong>{data.completionRate.toFixed(0)}%</strong>
      </p>
      {data.isPerfectDay && (
        <p style={{ ...TOOLTIP_STYLES.itemStyle, color: '#FFD700' }}>
          <Star className="inline h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
          Perfect Day!
        </p>
      )}
    </div>
  );
};

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const StreakHistory: React.FC<StreakHistoryProps> = ({
  profile,
  days,
}) => {
  const historyData = useMemo(() => {
    const data = calculateStreakHistory(
      profile.dailyRecords,
      profile.preferences.completionGoal,
      days
    );

    return data.map(item => ({
      ...item,
      label: formatDate(item.date),
    }));
  }, [profile.dailyRecords, profile.preferences.completionGoal, days]);

  const maxStreak = useMemo(() => {
    return Math.max(...historyData.map(d => d.streak), 0);
  }, [historyData]);

  const perfectDays = useMemo(() => {
    return historyData.filter(d => d.isPerfectDay);
  }, [historyData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak History
        </CardTitle>
        <CardDescription>
          Streak progression over the last {days} days • Current: {profile.streaks.current} | Best: {profile.streaks.best}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={historyData}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid {...GRID_STYLES} />

            <XAxis
              dataKey="label"
              {...AXIS_STYLES}
              tick={{ ...AXIS_STYLES.tick }}
              tickLine={false}
              interval={Math.floor(historyData.length / 10)} // Show ~10 labels
            />

            <YAxis
              {...AXIS_STYLES}
              tick={{ ...AXIS_STYLES.tick }}
              tickLine={false}
              label={{
                value: 'Streak (days)',
                angle: -90,
                position: 'insideLeft',
                style: { ...AXIS_STYLES.tick },
              }}
            />

            <Tooltip content={<CustomTooltip />} cursor={TOOLTIP_STYLES.cursor} />

            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* Streak Line */}
            <Line
              type="monotone"
              dataKey="streak"
              stroke={CHART_COLORS.orange}
              strokeWidth={LINE_CHART_CONFIG.strokeWidth}
              dot={LINE_CHART_CONFIG.dot}
              activeDot={LINE_CHART_CONFIG.activeDot}
              name="Streak"
              animationDuration={ANIMATION_CONFIG.animationDuration}
            />

            {/* Perfect Day Markers */}
            {perfectDays.map((day, index) => (
              <ReferenceDot
                key={`perfect-${index}`}
                x={day.label}
                y={day.streak}
                r={8}
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="text-2xl font-bold text-orange-500">
              {profile.streaks.current}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Current Streak
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div className="text-2xl font-bold text-red-500">
              {profile.streaks.best}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Best Streak
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-2xl font-bold text-yellow-500">
              {perfectDays.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Perfect Days
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-500">
              {maxStreak}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Peak Streak
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 pt-6 border-t space-y-2">
          <h4 className="text-sm font-semibold mb-3">Streak Insights</h4>

          {profile.streaks.current >= 7 && (
            <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
              <span>🔥</span>
              <span>
                Impressive! You've maintained a {profile.streaks.current}-day streak. Keep the momentum going!
              </span>
            </div>
          )}

          {profile.streaks.current < profile.streaks.best && profile.streaks.best > 7 && (
            <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span>💪</span>
              <span>
                You've done it before! Your best streak was {profile.streaks.best} days.
                You can reach that again!
              </span>
            </div>
          )}

          {perfectDays.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <span>⭐</span>
              <span>
                You achieved {perfectDays.length} perfect day{perfectDays.length > 1 ? 's' : ''} with 100% completion!
              </span>
            </div>
          )}

          {profile.streaks.current === 0 && profile.streaks.best > 0 && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <span>🎯</span>
              <span>
                Start a new streak today! Complete {profile.preferences.completionGoal}% of your tasks to begin.
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakHistory;
