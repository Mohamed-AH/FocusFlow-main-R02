/**
 * CategoryBreakdown - Donut/Pie chart showing time distribution by category
 * Uses Recharts PieChart for visualization
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { aggregateTimeByCategory, formatMinutesToHours } from '@/lib/analytics';
import {
  CATEGORY_COLORS,
  TOOLTIP_STYLES,
  ANIMATION_CONFIG,
  PIE_CHART_CONFIG,
} from '@/config/chartConfig';

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

interface CategoryBreakdownProps {
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
        Percentage: <strong>{data.percentage.toFixed(1)}%</strong>
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Completed: <strong>{data.completedCount} activities</strong>
      </p>
      <p style={TOOLTIP_STYLES.itemStyle}>
        Completion Rate: <strong>{data.completionRate.toFixed(0)}%</strong>
      </p>
    </div>
  );
};

// Custom Label for Pie Chart
const renderCustomLabel = (entry: any) => {
  if (entry.percentage < 5) return ''; // Don't show label for small slices
  return `${entry.percentage.toFixed(0)}%`;
};

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  profile,
  days,
}) => {
  const categoryData = useMemo(() => {
    const data = aggregateTimeByCategory(profile.activities, profile.dailyRecords, days);

    // Calculate percentages
    const totalTime = data.reduce((sum, cat) => sum + cat.totalTime, 0);

    return data.map(cat => ({
      ...cat,
      percentage: totalTime > 0 ? (cat.totalTime / totalTime) * 100 : 0,
      // Use category color from CATEGORY_COLORS or fallback to the activity color
      fillColor: CATEGORY_COLORS[cat.category] || cat.color,
    }));
  }, [profile.activities, profile.dailyRecords, days]);

  const totalTime = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.totalTime, 0);
  }, [categoryData]);

  // Custom Legend
  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate">
              {entry.value.charAt(0).toUpperCase() + entry.value.slice(1)}
            </span>
            <span className="font-medium ml-auto">
              {entry.payload.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            Time by Category
          </CardTitle>
          <CardDescription>
            No activity data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Complete some activities to see your category breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          Time by Category
        </CardTitle>
        <CardDescription>
          How you spend your focused time • Total: {formatMinutesToHours(totalTime)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="totalTime"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={PIE_CHART_CONFIG.innerRadius}
              outerRadius={PIE_CHART_CONFIG.outerRadius}
              paddingAngle={PIE_CHART_CONFIG.paddingAngle}
              label={renderCustomLabel}
              labelLine={false}
              animationDuration={ANIMATION_CONFIG.animationDuration}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fillColor} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>

        {/* Top 3 Categories */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-3">Top Categories</h4>
          <div className="space-y-2">
            {categoryData.slice(0, 3).map((cat, index) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.fillColor }}
                  />
                  <span className="text-sm font-medium capitalize">
                    {cat.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatMinutesToHours(cat.totalTime)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {cat.percentage.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
