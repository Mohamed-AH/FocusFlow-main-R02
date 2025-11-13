/**
 * DashboardLayout - Main container for analytics dashboard
 * Features: Tab navigation, date range selection, export functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  Calendar,
  Share2
} from 'lucide-react';

// Import Overview components
import { StatsGrid } from './overview/StatsGrid';
import { CompletionTrendChart } from './overview/CompletionTrendChart';
import { CategoryBreakdown } from './overview/CategoryBreakdown';

// Import Activities components
import { ActivityLeaderboard } from './activities/ActivityLeaderboard';
import { CategoryPerformance } from './activities/CategoryPerformance';
import { TimeOfDayHeatmap } from './activities/TimeOfDayHeatmap';

// Import Trends components
import { StreakHistory } from './trends/StreakHistory';
import { WeekOverWeekComparison } from './trends/WeekOverWeekComparison';
import { PerformanceCalendar } from './trends/PerformanceCalendar';

// Type imports (matching index.tsx structure)
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

interface DashboardLayoutProps {
  profile: Profile;
  onClose?: () => void;
}

export type DateRange = '7days' | '30days' | '90days' | 'custom';

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ profile, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting dashboard data...');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing dashboard...');
  };

  const getDaysFromRange = (): number => {
    switch (dateRange) {
      case '7days':
        return 7;
      case '30days':
        return 30;
      case '90days':
        return 90;
      case 'custom':
        // Calculate days between custom dates
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays + 1;
        }
        return 7;
      default:
        return 7;
    }
  };

  const getRangeLabel = (): string => {
    switch (dateRange) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case 'custom':
        return customStartDate && customEndDate
          ? `${customStartDate} to ${customEndDate}`
          : 'Custom Range';
      default:
        return 'Last 7 Days';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics Dashboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {profile.avatar} {profile.name} • {getRangeLabel()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-background rounded-lg border p-1">
              <Button
                variant={dateRange === '7days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('7days')}
              >
                7D
              </Button>
              <Button
                variant={dateRange === '30days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('30days')}
              >
                30D
              </Button>
              <Button
                variant={dateRange === '90days' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('90days')}
              >
                90D
              </Button>
              <Button
                variant={dateRange === 'custom' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDateRange('custom')}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Custom Date Range Picker (if selected) */}
        {dateRange === 'custom' && (
          <div className="px-6 pb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b bg-card px-6">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Scrollable */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0">
              <OverviewTab profile={profile} days={getDaysFromRange()} />
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-0">
              <ActivitiesTab profile={profile} days={getDaysFromRange()} />
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="mt-0">
              <TrendsTab profile={profile} days={getDaysFromRange()} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

// --- Tab Components ---

const OverviewTab: React.FC<{ profile: Profile; days: number }> = ({ profile, days }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <StatsGrid profile={profile} days={days} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompletionTrendChart profile={profile} days={days} />
        <CategoryBreakdown profile={profile} days={days} />
      </div>
    </div>
  );
};

const ActivitiesTab: React.FC<{ profile: Profile; days: number }> = ({ profile, days }) => {
  return (
    <div className="space-y-6">
      {/* Activity Leaderboard */}
      <ActivityLeaderboard profile={profile} days={days} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPerformance profile={profile} days={days} />
        <TimeOfDayHeatmap profile={profile} days={days} />
      </div>
    </div>
  );
};

const TrendsTab: React.FC<{ profile: Profile; days: number }> = ({ profile, days }) => {
  return (
    <div className="space-y-6">
      {/* Week Comparison */}
      <WeekOverWeekComparison profile={profile} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakHistory profile={profile} days={days} />
        <PerformanceCalendar profile={profile} days={days} />
      </div>
    </div>
  );
};

export default DashboardLayout;
