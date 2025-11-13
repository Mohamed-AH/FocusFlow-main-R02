/**
 * WeekOverWeekComparison - Dual bar chart comparing current vs previous week
 * Shows key metrics side-by-side with percentage changes
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { compareWeeks, formatMinutesToHours } from '@/lib/analytics';
import {
  CHART_COLORS,
  TOOLTIP_STYLES,
  GRID_STYLES,
  AXIS_STYLES,
  ANIMATION_CONFIG,
  BAR_CHART_CONFIG,
} from '@/config/chartConfig';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type imports
interface Activity {
  id: string;
  name: string;
  duration: number;
  startTime: number | null;
  color: string;
  icon: string;
  category: string;
  order?: number;
  isDefault?: boolean;
}

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
  activities: Record<string, Activity>;
  dailyRecords: Record<string, DailyRecord>;
  streaks: any;
  achievements: any[];
  preferences: any;
}

interface WeekOverWeekComparisonProps {
  profile: Profile;
}

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={TOOLTIP_STYLES.itemStyle}>
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <strong>
            {entry.name.includes('Time')
              ? `${entry.value.toFixed(1)}h`
              : entry.value.toFixed(1)}
          </strong>
        </p>
      ))}
    </div>
  );
};

const ChangeIndicator: React.FC<{ change: number; changeType: string }> = ({ change, changeType }) => {
  const Icon = changeType === 'increase' ? TrendingUp : changeType === 'decrease' ? TrendingDown : Minus;
  const colorClass = changeType === 'increase'
    ? 'text-green-500'
    : changeType === 'decrease'
      ? 'text-red-500'
      : 'text-gray-400';

  return (
    <div className={cn('flex items-center gap-1 text-sm', colorClass)}>
      <Icon className="h-4 w-4" />
      <span className="font-semibold">
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </span>
    </div>
  );
};

export const WeekOverWeekComparison: React.FC<WeekOverWeekComparisonProps> = ({
  profile,
}) => {
  const comparisonData = useMemo(() => {
    return compareWeeks(profile.dailyRecords, profile.activities);
  }, [profile.dailyRecords, profile.activities]);

  // Format data for chart
  const chartData = useMemo(() => {
    return comparisonData.map(item => ({
      metric: item.metric,
      'This Week': item.currentWeek,
      'Last Week': item.previousWeek,
    }));
  }, [comparisonData]);

  // Calculate overall trend
  const overallTrend = useMemo(() => {
    const avgChange = comparisonData.reduce((sum, item) => sum + item.change, 0) / comparisonData.length;
    return {
      value: avgChange,
      type: avgChange > 0 ? 'increase' : avgChange < 0 ? 'decrease' : 'neutral',
    };
  }, [comparisonData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-5 w-1.5 rounded-full bg-blue-500" />
                <div className="h-5 w-1.5 rounded-full bg-green-500" />
              </div>
              Week-over-Week Comparison
            </CardTitle>
            <CardDescription>
              Comparing your performance: This week vs Last week
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Overall Trend</div>
            <ChangeIndicator change={overallTrend.value} changeType={overallTrend.type} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid {...GRID_STYLES} />

            <XAxis
              dataKey="metric"
              {...AXIS_STYLES}
              tick={{ ...AXIS_STYLES.tick, fontSize: 11 }}
              tickLine={false}
            />

            <YAxis
              {...AXIS_STYLES}
              tick={{ ...AXIS_STYLES.tick }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={TOOLTIP_STYLES.cursor} />

            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />

            <Bar
              dataKey="This Week"
              fill={CHART_COLORS.primary}
              radius={BAR_CHART_CONFIG.radius}
              animationDuration={ANIMATION_CONFIG.animationDuration}
            />

            <Bar
              dataKey="Last Week"
              fill={CHART_COLORS.secondary}
              radius={BAR_CHART_CONFIG.radius}
              animationDuration={ANIMATION_CONFIG.animationDuration}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Detailed Comparison Table */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-4">Detailed Changes</h4>
          <div className="space-y-3">
            {comparisonData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.metric}</div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>
                      This Week:{' '}
                      <strong>
                        {item.metric.includes('Time')
                          ? `${item.currentWeek.toFixed(1)}h`
                          : item.currentWeek.toFixed(1)}
                      </strong>
                    </span>
                    <span>
                      Last Week:{' '}
                      <strong>
                        {item.metric.includes('Time')
                          ? `${item.previousWeek.toFixed(1)}h`
                          : item.previousWeek.toFixed(1)}
                      </strong>
                    </span>
                  </div>
                </div>
                <ChangeIndicator change={item.change} changeType={item.changeType} />
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-3">Performance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-500">
                {comparisonData.filter(item => item.changeType === 'increase').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Metrics Improved
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-500">
                {comparisonData.filter(item => item.changeType === 'decrease').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Metrics Declined
              </div>
            </div>

            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
              <div className="text-2xl font-bold text-gray-500">
                {comparisonData.filter(item => item.changeType === 'neutral').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                No Change
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 pt-6 border-t space-y-2">
          <h4 className="text-sm font-semibold mb-3">Week Insights</h4>

          {overallTrend.type === 'increase' && (
            <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
              <span>📈</span>
              <span>
                Great progress! Your overall performance improved by {Math.abs(overallTrend.value).toFixed(1)}% this week.
              </span>
            </div>
          )}

          {overallTrend.type === 'decrease' && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <span>📉</span>
              <span>
                Performance dipped by {Math.abs(overallTrend.value).toFixed(1)}% this week. Let's focus on getting back on track!
              </span>
            </div>
          )}

          {comparisonData.find(item => item.metric === 'Perfect Days' && item.changeType === 'increase') && (
            <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <span>⭐</span>
              <span>
                You achieved more perfect days this week! Keep up the excellent work.
              </span>
            </div>
          )}

          {comparisonData.find(item => item.metric === 'Total Focus Time (hrs)' && item.changeType === 'increase') && (
            <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span>⏰</span>
              <span>
                You spent more time focusing this week. That dedication is paying off!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekOverWeekComparison;
