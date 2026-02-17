"use client";

import { useMemo } from "react";
import { format, subDays, startOfWeek, addDays, getDay, isSameDay, isBefore } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapProps {
  submissions: { createdAt: Date | string }[];
}

export function SubmissionHeatmap({ submissions }: HeatmapProps) {
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 365)); // Last year, aligned to start of week

  // Calculate counts
  const submissionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((sub) => {
      const dateKey = format(new Date(sub.createdAt), "yyyy-MM-dd");
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [submissions]);

  // Generate days array
  const days = useMemo(() => {
    const d = [];
    let current = startDate;
    const end = addDays(today, 1);
    while (isBefore(current, end)) {
      d.push(current);
      current = addDays(current, 1);
    }
    return d;
  }, []);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted"; // simpler fallback
    if (count <= 2) return "bg-emerald-300 dark:bg-emerald-900";
    if (count <= 5) return "bg-emerald-500 dark:bg-emerald-700";
    return "bg-emerald-700 dark:bg-emerald-500";
  };
  
  return (
    <div className="w-full overflow-x-auto p-2">
      <div className="flex flex-col gap-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
               {days.map((day) => {
                   const dateKey = format(day, "yyyy-MM-dd");
                   const count = submissionCounts[dateKey] || 0;
                   return (
                       <TooltipProvider key={dateKey}>
                           <Tooltip delayDuration={0}>
                               <TooltipTrigger asChild>
                                   <div 
                                       className={`w-3 h-3 rounded-[2px] ${getColor(count)} hover:ring-2 hover:ring-zinc-400 transition-all cursor-pointer`}
                                   />
                               </TooltipTrigger>
                               <TooltipContent className="bg-zinc-900 text-zinc-50 border-zinc-800">
                                   <p className="text-xs font-semibold">
                                       {count} submissions on {format(day, "MMM d, yyyy")}
                                   </p>
                               </TooltipContent>
                           </Tooltip>
                       </TooltipProvider>
                   );
               })}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end w-max ml-auto">
              <span>Less</span>
              <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-[2px] bg-muted"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-300 dark:bg-emerald-900"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-500 dark:bg-emerald-700"></div>
                  <div className="w-3 h-3 rounded-[2px] bg-emerald-700 dark:bg-emerald-500"></div>
              </div>
              <span>More</span>
          </div>
      </div>
    </div>
  );
}
