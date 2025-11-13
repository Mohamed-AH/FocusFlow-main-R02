/**
 * ActivityLeaderboard - Ranked list of activities by performance
 * Shows completion rate, total time, and focus ratings
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getActivityLeaderboard, formatMinutesToHours } from '@/lib/analytics';
import { Trophy, Clock, TrendingUp, Star } from 'lucide-react';
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

interface ActivityLeaderboardProps {
  profile: Profile;
  days: number;
}

type SortBy = 'completionRate' | 'totalTime' | 'completedCount';

export const ActivityLeaderboard: React.FC<ActivityLeaderboardProps> = ({
  profile,
  days,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('completionRate');
  const [showAll, setShowAll] = useState(false);

  const leaderboard = useMemo(() => {
    return getActivityLeaderboard(profile.activities, profile.dailyRecords, days, sortBy);
  }, [profile.activities, profile.dailyRecords, days, sortBy]);

  const displayedActivities = showAll ? leaderboard : leaderboard.slice(0, 10);

  const getMedalEmoji = (index: number): string | null => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return null;
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 90) return 'text-green-500';
    if (rate >= 70) return 'text-blue-500';
    if (rate >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCompletionBgColor = (rate: number): string => {
    if (rate >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (rate >= 70) return 'bg-blue-100 dark:bg-blue-900/20';
    if (rate >= 50) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Activity Leaderboard
          </CardTitle>
          <CardDescription>
            No activity data available for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Complete some activities to see your leaderboard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Activity Leaderboard
            </CardTitle>
            <CardDescription>
              Top performing activities over the last {days} days
            </CardDescription>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={sortBy === 'completionRate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('completionRate')}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Rate
            </Button>
            <Button
              variant={sortBy === 'totalTime' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('totalTime')}
            >
              <Clock className="h-3 w-3 mr-1" />
              Time
            </Button>
            <Button
              variant={sortBy === 'completedCount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('completedCount')}
            >
              #
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50',
                getCompletionBgColor(activity.completionRate)
              )}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border font-bold text-sm">
                {getMedalEmoji(index) || index + 1}
              </div>

              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{activity.icon}</span>
                  <h4 className="font-semibold truncate">{activity.name}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                    {activity.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Completed: {activity.completedCount}/{activity.plannedCount}
                  </span>
                  <span>
                    Time: {formatMinutesToHours(activity.totalTime)}
                  </span>
                  {activity.avgFocusRating !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {activity.avgFocusRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Completion Rate */}
              <div className="text-right">
                <div className={cn('text-2xl font-bold', getCompletionColor(activity.completionRate))}>
                  {activity.completionRate.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">completion</div>
              </div>

              {/* Visual Bar */}
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${activity.completionRate}%`,
                    backgroundColor: activity.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {leaderboard.length > 10 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${leaderboard.length})`}
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {leaderboard.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Activities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {leaderboard.filter(a => a.completionRate >= 80).length}
            </div>
            <div className="text-xs text-muted-foreground">High Performers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {leaderboard
                .filter(a => a.avgFocusRating !== null)
                .reduce((sum, a) => sum + (a.avgFocusRating || 0), 0) /
                leaderboard.filter(a => a.avgFocusRating !== null).length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg Focus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLeaderboard;
