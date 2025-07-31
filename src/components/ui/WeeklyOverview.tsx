import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDates(baseDate: Date) {
  // Returns array of 7 Date objects for the week containing baseDate (Sunday to Saturday)
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() - baseDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getColorByCompletion(pct: number | undefined) {
  if (pct === undefined || pct === null) return "bg-slate-200 text-slate-400";
  if (pct >= 80) return "bg-green-400 text-white";
  if (pct >= 50) return "bg-yellow-400 text-white";
  if (pct > 0) return "bg-red-400 text-white";
  return "bg-slate-200 text-slate-400";
}

function getMoodEmoji(pct: number | undefined) {
  if (pct === undefined || pct === null) return "⬜";
  if (pct >= 80) return "🟩";
  if (pct >= 50) return "🟨";
  if (pct > 0) return "🟥";
  return "⬜";
}

interface WeeklyOverviewProps {
  dailyRecords: Record<string, any>;
  weekOffset?: number; // 0 = current, -1 = prev, +1 = next
  onDayClick?: (date: string) => void;
}

export const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({
  dailyRecords,
  weekOffset = 0,
  onDayClick,
}) => {
  const [detailDay, setDetailDay] = useState<string | null>(null);

  // Calculate week dates
  const today = new Date();
  const base = new Date(today);
  base.setDate(today.getDate() + (weekOffset * 7));
  const weekDates = useMemo(() => getWeekDates(base), [base]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-row items-center justify-between w-full mb-2">
        <span className="text-sm font-semibold text-slate-700">This Week</span>
        {/* Week navigation (future: add prev/next) */}
      </div>
      <div className="grid grid-cols-7 gap-2 w-full">
        {weekDates.map((date, idx) => {
          const key = getDayKey(date);
          const record = dailyRecords?.[key];
          const pct = record?.completionRate;
          const isToday = key === getDayKey(today);
          return (
            <motion.button
              key={key}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl px-1 py-1 transition-all duration-200 focus:outline-none",
                getColorByCompletion(pct),
                isToday && "ring-2 ring-primary"
              )}
              style={{ minWidth: 36, minHeight: 48 }}
              onClick={() => onDayClick ? onDayClick(key) : setDetailDay(key)}
              aria-label={`Show details for ${date.toLocaleDateString()}`}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ delay: idx * 0.04 }}
            >
              <span className="text-xs font-medium">{DAY_LABELS[date.getDay()]}</span>
              <span className="text-xs">{date.getDate()}</span>
              <span className="text-lg mt-1">{getMoodEmoji(pct)}</span>
              <span className="text-xs font-semibold">{pct !== undefined ? `${pct}%` : ""}</span>
            </motion.button>
          );
        })}
      </div>
      {/* Detail Modal */}
      <AnimatePresence>
        {detailDay && (
          <Dialog open={!!detailDay} onOpenChange={() => setDetailDay(null)}>
            <DialogContent className="max-w-xs w-full rounded-2xl p-0 overflow-hidden">
              <DialogHeader className="bg-primary/10 px-4 py-3">
                <DialogTitle className="text-lg font-bold text-primary">
                  Day Details
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {detailDay}
                </DialogDescription>
              </DialogHeader>
              <div className="px-4 py-3">
                {dailyRecords?.[detailDay] ? (
                  <>
                    <div className="mb-2">
                      <span className="font-semibold">Completion:</span>{" "}
                      <span>{dailyRecords[detailDay].completionRate}%</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Time Focused:</span>{" "}
                      <span>{dailyRecords[detailDay].totalCompletedTime || 0} min</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Activities:</span>
                      <ul className="list-disc ml-5 text-sm">
                        {dailyRecords[detailDay].activities
                          ? Object.values(dailyRecords[detailDay].activities).map((a: any, i: number) => (
                              <li key={i}>
                                {a.completed ? "✅" : "⬜"} {a.planned ? a.name || "Activity" : "Unplanned"}
                              </li>
                            ))
                          : <li>No activities</li>}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400">No data for this day.</div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeeklyOverview;