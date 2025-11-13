/**
 * FocusFlow Analytics Library
 * Comprehensive data processing and analytics functions for the dashboard
 */

// --- Type Definitions (matching index.tsx) ---

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

// --- Date Utility Functions ---

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(getDateDaysAgo(i));
  }
  return dates;
}

export function getCustomDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDayOfWeek(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

// --- Completion Trend Analysis ---

export interface CompletionTrendData {
  date: string;
  completionRate: number;
  label: string;
  dayOfWeek: string;
}

export function calculateCompletionTrends(
  dailyRecords: Record<string, DailyRecord>,
  days: number = 7
): CompletionTrendData[] {
  const dateRange = getDateRange(days);

  return dateRange.map(date => {
    const record = dailyRecords[date];
    return {
      date,
      completionRate: record?.completionRate ?? 0,
      label: formatDate(date),
      dayOfWeek: getDayOfWeek(date),
    };
  });
}

// --- Key Metrics Calculation ---

export interface KeyMetrics {
  totalFocusedTime: number; // in minutes
  averageCompletionRate: number;
  currentStreak: number;
  bestStreak: number;
  perfectDays: number;
  mostProductiveDay: { date: string; rate: number } | null;
  favoriteActivity: { name: string; count: number; icon: string } | null;
  activeDays: number;
  totalActivitiesCompleted: number;
}

export function calculateKeyMetrics(
  profile: Profile,
  days: number = 7
): KeyMetrics {
  const dateRange = getDateRange(days);
  const { dailyRecords, activities, streaks } = profile;

  let totalFocusedTime = 0;
  let totalCompletionRate = 0;
  let activeDays = 0;
  let mostProductiveDay: { date: string; rate: number } | null = null;
  let totalActivitiesCompleted = 0;

  const activityCompletionCount: Record<string, number> = {};

  dateRange.forEach(date => {
    const record = dailyRecords[date];
    if (record) {
      activeDays++;
      const completionRate = record.completionRate ?? 0;
      totalCompletionRate += completionRate;

      if (!mostProductiveDay || completionRate > mostProductiveDay.rate) {
        mostProductiveDay = { date, rate: completionRate };
      }

      // Calculate focused time and count completions
      Object.entries(record.activities).forEach(([activityId, activityRecord]) => {
        if (activityRecord.completed) {
          totalActivitiesCompleted++;
          totalFocusedTime += activityRecord.actualDuration || activities[activityId]?.duration || 0;

          activityCompletionCount[activityId] = (activityCompletionCount[activityId] || 0) + 1;
        }
      });
    }
  });

  // Find favorite activity
  let favoriteActivity: { name: string; count: number; icon: string } | null = null;
  Object.entries(activityCompletionCount).forEach(([activityId, count]) => {
    if (!favoriteActivity || count > favoriteActivity.count) {
      const activity = activities[activityId];
      if (activity) {
        favoriteActivity = {
          name: activity.name,
          count,
          icon: activity.icon,
        };
      }
    }
  });

  return {
    totalFocusedTime,
    averageCompletionRate: activeDays > 0 ? totalCompletionRate / activeDays : 0,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    perfectDays: streaks.perfectDays,
    mostProductiveDay,
    favoriteActivity,
    activeDays,
    totalActivitiesCompleted,
  };
}

// --- Category Analysis ---

export interface CategoryData {
  category: string;
  totalTime: number; // in minutes
  completedCount: number;
  completionRate: number;
  color: string;
}

export function aggregateTimeByCategory(
  activities: Record<string, Activity>,
  dailyRecords: Record<string, DailyRecord>,
  days: number = 7
): CategoryData[] {
  const dateRange = getDateRange(days);
  const categoryMap: Record<string, {
    totalTime: number;
    completedCount: number;
    plannedCount: number;
    colors: Set<string>;
  }> = {};

  dateRange.forEach(date => {
    const record = dailyRecords[date];
    if (record) {
      Object.entries(record.activities).forEach(([activityId, activityRecord]) => {
        const activity = activities[activityId];
        if (activity) {
          const category = activity.category;

          if (!categoryMap[category]) {
            categoryMap[category] = {
              totalTime: 0,
              completedCount: 0,
              plannedCount: 0,
              colors: new Set(),
            };
          }

          categoryMap[category].colors.add(activity.color);

          if (activityRecord.completed) {
            categoryMap[category].completedCount++;
            categoryMap[category].totalTime += activityRecord.actualDuration || activity.duration;
          }

          if (activityRecord.planned) {
            categoryMap[category].plannedCount++;
          }
        }
      });
    }
  });

  return Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      totalTime: data.totalTime,
      completedCount: data.completedCount,
      completionRate: data.plannedCount > 0 ? (data.completedCount / data.plannedCount) * 100 : 0,
      color: Array.from(data.colors)[0] || '#3B82F6',
    }))
    .sort((a, b) => b.totalTime - a.totalTime);
}

// --- Activity Leaderboard ---

export interface ActivityLeaderboardItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  completionRate: number;
  completedCount: number;
  plannedCount: number;
  totalTime: number;
  avgFocusRating: number | null;
}

export function getActivityLeaderboard(
  activities: Record<string, Activity>,
  dailyRecords: Record<string, DailyRecord>,
  days: number = 7,
  sortBy: 'completionRate' | 'totalTime' | 'completedCount' = 'completionRate'
): ActivityLeaderboardItem[] {
  const dateRange = getDateRange(days);
  const activityStats: Record<string, {
    completedCount: number;
    plannedCount: number;
    totalTime: number;
    focusRatings: number[];
  }> = {};

  dateRange.forEach(date => {
    const record = dailyRecords[date];
    if (record) {
      Object.entries(record.activities).forEach(([activityId, activityRecord]) => {
        if (!activityStats[activityId]) {
          activityStats[activityId] = {
            completedCount: 0,
            plannedCount: 0,
            totalTime: 0,
            focusRatings: [],
          };
        }

        if (activityRecord.planned) {
          activityStats[activityId].plannedCount++;
        }

        if (activityRecord.completed) {
          activityStats[activityId].completedCount++;
          const activity = activities[activityId];
          activityStats[activityId].totalTime += activityRecord.actualDuration || activity?.duration || 0;

          if (activityRecord.focusRating !== null) {
            activityStats[activityId].focusRatings.push(activityRecord.focusRating);
          }
        }
      });
    }
  });

  const leaderboard = Object.entries(activityStats)
    .map(([activityId, stats]) => {
      const activity = activities[activityId];
      if (!activity) return null;

      const avgFocusRating = stats.focusRatings.length > 0
        ? stats.focusRatings.reduce((sum, rating) => sum + rating, 0) / stats.focusRatings.length
        : null;

      return {
        id: activityId,
        name: activity.name,
        icon: activity.icon,
        category: activity.category,
        color: activity.color,
        completionRate: stats.plannedCount > 0 ? (stats.completedCount / stats.plannedCount) * 100 : 0,
        completedCount: stats.completedCount,
        plannedCount: stats.plannedCount,
        totalTime: stats.totalTime,
        avgFocusRating,
      };
    })
    .filter(Boolean) as ActivityLeaderboardItem[];

  // Sort by specified field
  leaderboard.sort((a, b) => b[sortBy] - a[sortBy]);

  return leaderboard;
}

// --- Streak History ---

export interface StreakHistoryData {
  date: string;
  streak: number;
  completionRate: number;
  isPerfectDay: boolean;
}

export function calculateStreakHistory(
  dailyRecords: Record<string, DailyRecord>,
  completionGoal: number = 70,
  days: number = 30
): StreakHistoryData[] {
  const dateRange = getDateRange(days);
  const streakHistory: StreakHistoryData[] = [];
  let currentStreak = 0;

  dateRange.forEach(date => {
    const record = dailyRecords[date];
    const completionRate = record?.completionRate ?? 0;
    const isPerfectDay = completionRate === 100;

    // Update streak (simplified - actual streak calculation would be more complex)
    if (completionRate >= completionGoal) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }

    streakHistory.push({
      date,
      streak: currentStreak,
      completionRate,
      isPerfectDay,
    });
  });

  return streakHistory;
}

// --- Week-over-Week Comparison ---

export interface WeekComparisonData {
  metric: string;
  currentWeek: number;
  previousWeek: number;
  change: number; // percentage
  changeType: 'increase' | 'decrease' | 'neutral';
}

export function compareWeeks(
  dailyRecords: Record<string, DailyRecord>,
  activities: Record<string, Activity>
): WeekComparisonData[] {
  const currentWeekDates = getDateRange(7);
  const previousWeekDates = getDateRange(14).slice(0, 7);

  const calculateWeekMetrics = (dates: string[]) => {
    let totalCompletionRate = 0;
    let totalFocusedTime = 0;
    let activitiesCompleted = 0;
    let perfectDays = 0;
    let activeDays = 0;

    dates.forEach(date => {
      const record = dailyRecords[date];
      if (record) {
        activeDays++;
        const completionRate = record.completionRate ?? 0;
        totalCompletionRate += completionRate;

        if (completionRate === 100) perfectDays++;

        Object.entries(record.activities).forEach(([activityId, activityRecord]) => {
          if (activityRecord.completed) {
            activitiesCompleted++;
            totalFocusedTime += activityRecord.actualDuration || activities[activityId]?.duration || 0;
          }
        });
      }
    });

    return {
      avgCompletionRate: activeDays > 0 ? totalCompletionRate / activeDays : 0,
      totalFocusedTime,
      activitiesCompleted,
      perfectDays,
    };
  };

  const current = calculateWeekMetrics(currentWeekDates);
  const previous = calculateWeekMetrics(previousWeekDates);

  const createComparison = (
    metric: string,
    currentValue: number,
    previousValue: number
  ): WeekComparisonData => {
    const change = previousValue > 0
      ? ((currentValue - previousValue) / previousValue) * 100
      : 0;

    return {
      metric,
      currentWeek: currentValue,
      previousWeek: previousValue,
      change,
      changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral',
    };
  };

  return [
    createComparison('Avg Completion Rate', current.avgCompletionRate, previous.avgCompletionRate),
    createComparison('Total Focus Time (hrs)', current.totalFocusedTime / 60, previous.totalFocusedTime / 60),
    createComparison('Activities Completed', current.activitiesCompleted, previous.activitiesCompleted),
    createComparison('Perfect Days', current.perfectDays, previous.perfectDays),
  ];
}

// --- Time-of-Day Analysis ---

export interface TimeSlot {
  hour: number;
  label: string;
  completionCount: number;
  totalCount: number;
  completionRate: number;
}

export function analyzeTimeOfDay(
  activities: Record<string, Activity>,
  dailyRecords: Record<string, DailyRecord>,
  days: number = 30
): TimeSlot[] {
  const dateRange = getDateRange(days);
  const timeSlots: Record<number, { completed: number; total: number }> = {};

  // Initialize 24 hours
  for (let i = 0; i < 24; i++) {
    timeSlots[i] = { completed: 0, total: 0 };
  }

  dateRange.forEach(date => {
    const record = dailyRecords[date];
    if (record) {
      Object.entries(record.activities).forEach(([activityId, activityRecord]) => {
        const activity = activities[activityId];
        if (activity && activity.startTime !== null) {
          const hour = Math.floor(activity.startTime / 60);
          if (hour >= 0 && hour < 24) {
            timeSlots[hour].total++;
            if (activityRecord.completed) {
              timeSlots[hour].completed++;
            }
          }
        }
      });
    }
  });

  return Object.entries(timeSlots).map(([hour, data]) => {
    const h = parseInt(hour);
    const label = h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;

    return {
      hour: h,
      label,
      completionCount: data.completed,
      totalCount: data.total,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    };
  });
}

// --- Pattern Recognition & Insights ---

export interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  icon: string;
}

export function identifyProductivityPatterns(
  profile: Profile,
  days: number = 30
): Insight[] {
  const insights: Insight[] = [];
  const { dailyRecords, activities, streaks } = profile;
  const dateRange = getDateRange(days);

  // 1. Best day of week analysis
  const dayOfWeekStats: Record<string, { total: number; sum: number }> = {};
  dateRange.forEach(date => {
    const record = dailyRecords[date];
    const dayOfWeek = getDayOfWeek(date);
    if (!dayOfWeekStats[dayOfWeek]) {
      dayOfWeekStats[dayOfWeek] = { total: 0, sum: 0 };
    }
    if (record) {
      dayOfWeekStats[dayOfWeek].total++;
      dayOfWeekStats[dayOfWeek].sum += record.completionRate ?? 0;
    }
  });

  let bestDay = '';
  let bestDayRate = 0;
  Object.entries(dayOfWeekStats).forEach(([day, stats]) => {
    const avg = stats.total > 0 ? stats.sum / stats.total : 0;
    if (avg > bestDayRate) {
      bestDay = day;
      bestDayRate = avg;
    }
  });

  if (bestDay && bestDayRate > 70) {
    insights.push({
      type: 'success',
      title: `${bestDay}s are your power days!`,
      description: `You complete ${bestDayRate.toFixed(0)}% of tasks on ${bestDay}s on average.`,
      icon: '🚀',
    });
  }

  // 2. Streak analysis
  if (streaks.current >= 7) {
    insights.push({
      type: 'success',
      title: 'Impressive consistency!',
      description: `You've maintained a ${streaks.current}-day streak. Keep it up!`,
      icon: '🔥',
    });
  } else if (streaks.best > streaks.current && streaks.current > 0) {
    insights.push({
      type: 'info',
      title: 'Almost there!',
      description: `Your best streak was ${streaks.best} days. You can beat it!`,
      icon: '💪',
    });
  }

  // 3. Category analysis
  const categoryData = aggregateTimeByCategory(activities, dailyRecords, days);
  if (categoryData.length > 0) {
    const topCategory = categoryData[0];
    const totalTime = categoryData.reduce((sum, cat) => sum + cat.totalTime, 0);
    const percentage = totalTime > 0 ? (topCategory.totalTime / totalTime) * 100 : 0;

    if (percentage > 50) {
      insights.push({
        type: 'warning',
        title: 'Balance your activities',
        description: `${percentage.toFixed(0)}% of your time is spent on ${topCategory.category}. Consider diversifying.`,
        icon: '⚖️',
      });
    }
  }

  // 4. Recent performance
  const recentDates = getDateRange(7);
  const recentCompletionRates = recentDates.map(date => dailyRecords[date]?.completionRate ?? 0);
  const recentAvg = recentCompletionRates.reduce((sum, rate) => sum + rate, 0) / recentCompletionRates.length;

  if (recentAvg < 50) {
    insights.push({
      type: 'warning',
      title: 'Low completion this week',
      description: `Your average completion is ${recentAvg.toFixed(0)}%. Try breaking tasks into smaller chunks.`,
      icon: '📉',
    });
  } else if (recentAvg >= 80) {
    insights.push({
      type: 'success',
      title: 'Exceptional week!',
      description: `You're averaging ${recentAvg.toFixed(0)}% completion. Outstanding work!`,
      icon: '⭐',
    });
  }

  return insights;
}

// --- Formatting Utilities ---

export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
