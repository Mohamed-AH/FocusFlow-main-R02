/**
 * CategoryPerformance - Bar chart showing performance metrics by category
 * Displays completion rate and time spent per category
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
import { aggregateTimeByCategory, formatMinutesToHours } from '@/lib/analytics';
import {
  CATEGORY_COLORS,
  TOOLTIP_STYLES,
  GRID_STYLES,
  AXIS_STYLES,
  ANIMATION_CONFIG,
  BAR_CHART_CONFIG,
} from '@/config/chartConfig';
import { Layers } from 'lucide-react';

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

interface ActivityRecord {
  completed: boolean;
  planned: boolean;
  actualDuration: number;
  completedAt: string | null;
  focusRating: number | null;
  notes: string;
}

interface DailyRecord {
  date: string;
  activities: Record<string, ActivityRecord>;
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

interface CategoryPerformanceProps {
  profile: Profile;
  days: number;
}

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div style={TOOLTIP_STYLES.contentStyle}>
      <p style={TOOLTIP_STYLES.labelStyle}>
        {data.category.charAt(0).toUpperCase() + data.category.slice(1)}
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Time: <strong>{formatMinutesToHours(data.totalTime)}</strong>
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Completion Rate: <strong>{data.completionRate.toFixed(0)}%</strong>
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Activities Completed: <strong>{data.completedCount}</strong>
      </p>
    </div>
  );
};

export const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({
  profile,
  days,
}) => {
  const categoryData = useMemo(() => {
    const data = aggregateTimeByCategory(profile.activities, profile.dailyRecords, days);

    // Sort by completion rate (descending)
    return data
      .sort((a, b) => b.completionRate - a.completionRate)
      .map(cat => ({
        ...cat,
        displayName: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
        fillColor: CATEGORY_COLORS[cat.category] || cat.color,
      }));
  }, [profile.activities, profile.dailyRecords, days]);

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            Category Performance
          </CardTitle>
          <CardDescription>
            No category data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Complete some activities to see category performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-500" />
          Category Performance
        </CardTitle>
        <CardDescription>
          Completion rate by category • {categoryData.length} categories tracked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={categoryData}
            margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
            layout="horizontal"
          >
            <CartesianGrid {...GRID_STYLES} />

            <XAxis
              dataKey="displayName"
              {...AXIS_STYLES}
              angle={-45}
              textAnchor="end"
              tick={AXIS_STYLES.tick}
              tickLine={false}
              height={80}
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

            <Bar
              dataKey="completionRate"
              fill="#3B82F6"
              radius={BAR_CHART_CONFIG.radius}
              maxBarSize={BAR_CHART_CONFIG.maxBarSize}
              animationDuration={ANIMATION_CONFIG.animationDuration}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fillColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Category Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoryData.slice(0, 6).map((cat) => (
              <div key={cat.category} className="flex items-start gap-2">
                <div
                  className="w-3 h-3 rounded-sm mt-1 flex-shrink-0"
                  style={{ backgroundColor: cat.fillColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium capitalize truncate">
                    {cat.category}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{cat.completionRate.toFixed(0)}%</span>
                    <span>{formatMinutesToHours(cat.totalTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-3">Performance Insights</h4>
          <div className="space-y-2 text-sm">
            {categoryData[0] && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span>✓</span>
                <span>
                  <strong>{categoryData[0].displayName}</strong> has the highest completion rate at{' '}
                  {categoryData[0].completionRate.toFixed(0)}%
                </span>
              </div>
            )}
            {categoryData[categoryData.length - 1] && categoryData[categoryData.length - 1].completionRate < 50 && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <span>⚠</span>
                <span>
                  <strong>{categoryData[categoryData.length - 1].displayName}</strong> needs attention with{' '}
                  {categoryData[categoryData.length - 1].completionRate.toFixed(0)}% completion
                </span>
              </div>
            )}
            {categoryData.filter(c => c.completionRate >= 80).length > 0 && (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span>📊</span>
                <span>
                  {categoryData.filter(c => c.completionRate >= 80).length} categories achieving 80%+ completion
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformance;
