/**
 * PerformanceCalendar - Extended heatmap calendar showing performance over time
 * GitHub-style contribution calendar for completion rates
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDateRange } from '@/lib/analytics';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  streaks: any;
  achievements: any[];
  preferences: any;
}

interface PerformanceCalendarProps {
  profile: Profile;
  days: number;
}

const getIntensityClass = (rate: number | null): string => {
  if (rate === null) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  if (rate === 100) return 'bg-yellow-500 shadow-sm'; // Perfect day
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 70) return 'bg-green-400';
  if (rate >= 50) return 'bg-yellow-400';
  if (rate >= 30) return 'bg-orange-400';
  if (rate > 0) return 'bg-red-400';
  return 'bg-gray-200 dark:bg-gray-700';
};

const getDayAbbreviation = (dateStr: string): string => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getWeekNumber = (dateStr: string): number => {
  const date = new Date(dateStr);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const PerformanceCalendar: React.FC<PerformanceCalendarProps> = ({
  profile,
  days,
}) => {
  const calendarData = useMemo(() => {
    const dateRange = getDateRange(days);

    return dateRange.map(date => {
      const record = profile.dailyRecords[date];
      return {
        date,
        completionRate: record?.completionRate ?? null,
        mood: record?.mood,
        dayAbbr: getDayAbbreviation(date),
        weekNumber: getWeekNumber(date),
      };
    });
  }, [profile.dailyRecords, days]);

  // Group by weeks for better layout
  const weeklyData = useMemo(() => {
    const weeks: typeof calendarData[] = [];
    let currentWeek: typeof calendarData = [];

    calendarData.forEach((day, index) => {
      currentWeek.push(day);

      // New week starts on Sunday (index 0) or when we've collected 7 days
      if (currentWeek.length === 7 || index === calendarData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  }, [calendarData]);

  // Calculate stats
  const stats = useMemo(() => {
    const daysWithData = calendarData.filter(d => d.completionRate !== null);
    const perfectDays = daysWithData.filter(d => d.completionRate === 100).length;
    const highPerformanceDays = daysWithData.filter(d => d.completionRate !== null && d.completionRate >= 80).length;
    const avgCompletion = daysWithData.length > 0
      ? daysWithData.reduce((sum, d) => sum + (d.completionRate || 0), 0) / daysWithData.length
      : 0;

    return {
      totalDays: calendarData.length,
      activeDays: daysWithData.length,
      perfectDays,
      highPerformanceDays,
      avgCompletion,
    };
  }, [calendarData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Performance Calendar
        </CardTitle>
        <CardDescription>
          {stats.activeDays} active days in the last {days} days • Avg: {stats.avgCompletion.toFixed(0)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Day Labels */}
            <div className="flex gap-1 mb-2">
              <div className="w-8"></div> {/* Spacing for week numbers */}
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="w-8 text-center text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Rows */}
            <div className="space-y-1">
              {weeklyData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-1 items-center">
                  {/* Week number */}
                  <div className="w-8 text-xs text-muted-foreground text-right pr-2">
                    W{week[0]?.weekNumber}
                  </div>

                  {/* Days in week */}
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = week[dayIndex];

                    if (!day) {
                      return (
                        <div key={dayIndex} className="w-8 h-8" />
                      );
                    }

                    return (
                      <div
                        key={day.date}
                        className="group relative"
                        title={`${formatDateForDisplay(day.date)}: ${day.completionRate !== null ? day.completionRate.toFixed(0) + '%' : 'No data'}`}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-md transition-all cursor-pointer hover:scale-110 hover:shadow-md flex items-center justify-center',
                            getIntensityClass(day.completionRate)
                          )}
                        >
                          {day.completionRate === 100 && (
                            <span className="text-xs">⭐</span>
                          )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                            <div className="font-semibold">{formatDateForDisplay(day.date)}</div>
                            <div>
                              {day.completionRate !== null
                                ? `${day.completionRate.toFixed(0)}% completion`
                                : 'No activities'
                              }
                            </div>
                            {day.mood && <div>Mood: {day.mood}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="w-4 h-4 rounded bg-red-400" />
                <div className="w-4 h-4 rounded bg-orange-400" />
                <div className="w-4 h-4 rounded bg-yellow-400" />
                <div className="w-4 h-4 rounded bg-green-400" />
                <div className="w-4 h-4 rounded bg-green-500" />
                <div className="w-4 h-4 rounded bg-yellow-500 flex items-center justify-center">
                  <span className="text-[8px]">⭐</span>
                </div>
              </div>
              <span>More</span>
            </div>

            <div className="text-xs text-muted-foreground">
              ⭐ = Perfect Day (100%)
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="text-2xl font-bold text-blue-500">
              {stats.activeDays}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Active Days
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.perfectDays}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Perfect Days
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="text-2xl font-bold text-green-500">
              {stats.highPerformanceDays}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              High Performance (80%+)
            </div>
          </div>

          <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="text-2xl font-bold text-purple-500">
              {stats.avgCompletion.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average Completion
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 pt-6 border-t space-y-2">
          <h4 className="text-sm font-semibold mb-3">Calendar Insights</h4>

          {stats.perfectDays > 0 && (
            <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <span>⭐</span>
              <span>
                Amazing! You achieved {stats.perfectDays} perfect day{stats.perfectDays > 1 ? 's' : ''} with 100% completion.
              </span>
            </div>
          )}

          {stats.activeDays / stats.totalDays >= 0.8 && (
            <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
              <span>🎯</span>
              <span>
                Excellent consistency! You've been active {((stats.activeDays / stats.totalDays) * 100).toFixed(0)}% of the time.
              </span>
            </div>
          )}

          {stats.avgCompletion >= 70 && (
            <div className="flex items-start gap-2 text-sm text-blue-600 dark:text-blue-400">
              <span>💪</span>
              <span>
                Strong performance! Your average completion rate of {stats.avgCompletion.toFixed(0)}% shows great dedication.
              </span>
            </div>
          )}

          {stats.activeDays / stats.totalDays < 0.5 && (
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <span>📅</span>
              <span>
                You've been active {stats.activeDays} out of {stats.totalDays} days. Try to build more consistency!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceCalendar;
