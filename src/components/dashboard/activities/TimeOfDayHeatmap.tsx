/**
 * TimeOfDayHeatmap - Heatmap showing productivity patterns throughout the day
 * Displays completion rates for each hour of the day
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeTimeOfDay } from '@/lib/analytics';
import { Clock, Sun, Moon } from 'lucide-react';
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

interface TimeOfDayHeatmapProps {
  profile: Profile;
  days: number;
}

const getIntensityColor = (rate: number, hasData: boolean): string => {
  if (!hasData) return 'bg-gray-100 dark:bg-gray-800';
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 70) return 'bg-green-400';
  if (rate >= 50) return 'bg-yellow-400';
  if (rate >= 30) return 'bg-orange-400';
  return 'bg-red-400';
};

const getTimeIcon = (hour: number): React.ReactNode => {
  if (hour >= 6 && hour < 12) return <Sun className="h-4 w-4 text-amber-500" />;
  if (hour >= 12 && hour < 18) return <Sun className="h-4 w-4 text-orange-500" />;
  if (hour >= 18 && hour < 22) return <Moon className="h-4 w-4 text-blue-400" />;
  return <Moon className="h-4 w-4 text-indigo-500" />;
};

const getTimePeriod = (hour: number): string => {
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 18) return 'Afternoon';
  if (hour >= 18 && hour < 22) return 'Evening';
  return 'Night';
};

export const TimeOfDayHeatmap: React.FC<TimeOfDayHeatmapProps> = ({
  profile,
  days,
}) => {
  const timeData = useMemo(() => {
    return analyzeTimeOfDay(profile.activities, profile.dailyRecords, days);
  }, [profile.activities, profile.dailyRecords, days]);

  // Group by time period
  const periodData = useMemo(() => {
    const periods = {
      Morning: timeData.filter(t => t.hour >= 6 && t.hour < 12),
      Afternoon: timeData.filter(t => t.hour >= 12 && t.hour < 18),
      Evening: timeData.filter(t => t.hour >= 18 && t.hour < 22),
      Night: timeData.filter(t => t.hour >= 22 || t.hour < 6),
    };

    return Object.entries(periods).map(([period, slots]) => {
      const totalActivities = slots.reduce((sum, s) => sum + s.totalCount, 0);
      const completedActivities = slots.reduce((sum, s) => sum + s.completionCount, 0);
      const avgCompletionRate = totalActivities > 0
        ? (completedActivities / totalActivities) * 100
        : 0;

      return {
        period,
        avgCompletionRate,
        totalActivities,
        completedActivities,
        slots,
      };
    });
  }, [timeData]);

  // Find peak productivity hour
  const peakHour = useMemo(() => {
    const withData = timeData.filter(t => t.totalCount > 0);
    if (withData.length === 0) return null;

    return withData.reduce((max, current) =>
      current.completionRate > max.completionRate ? current : max
    );
  }, [timeData]);

  const hasData = timeData.some(t => t.totalCount > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            Productivity by Time of Day
          </CardTitle>
          <CardDescription>
            No time-based data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Add start times to your activities to see time-of-day patterns</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-500" />
          Productivity by Time of Day
        </CardTitle>
        <CardDescription>
          Activity completion rates throughout the day • {days} days analyzed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Heatmap Grid */}
        <div className="space-y-4">
          {/* 24-hour grid */}
          <div className="grid grid-cols-12 gap-2">
            {timeData.map((slot) => (
              <div
                key={slot.hour}
                className="group relative"
                title={`${slot.label}: ${slot.completionRate.toFixed(0)}% (${slot.completionCount}/${slot.totalCount})`}
              >
                <div
                  className={cn(
                    'aspect-square rounded-lg transition-all cursor-pointer hover:scale-110 hover:shadow-md',
                    getIntensityColor(slot.completionRate, slot.totalCount > 0)
                  )}
                >
                  <div className="flex items-center justify-center h-full">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {slot.hour}
                    </span>
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{slot.label}</div>
                    <div>Rate: {slot.completionRate.toFixed(0)}%</div>
                    <div>Activities: {slot.completionCount}/{slot.totalCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-red-400" />
              <div className="w-4 h-4 rounded bg-orange-400" />
              <div className="w-4 h-4 rounded bg-yellow-400" />
              <div className="w-4 h-4 rounded bg-green-400" />
              <div className="w-4 h-4 rounded bg-green-500" />
            </div>
            <span>High</span>
          </div>
        </div>

        {/* Period Summary */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-3">Performance by Time Period</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {periodData.map((period) => (
              <div key={period.period} className="text-center p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-center mb-2">
                  {getTimeIcon(period.slots[0]?.hour || 0)}
                </div>
                <div className="text-sm font-medium">{period.period}</div>
                <div className="text-2xl font-bold mt-1">
                  {period.avgCompletionRate.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {period.completedActivities}/{period.totalActivities} completed
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hour Insight */}
        {peakHour && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-2xl">⚡</div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  Peak Productivity Hour
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">
                  You're most productive at <strong>{peakHour.label}</strong> ({getTimePeriod(peakHour.hour)})
                  with a <strong>{peakHour.completionRate.toFixed(0)}%</strong> completion rate.
                  Consider scheduling your most important tasks during this time!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeOfDayHeatmap;
