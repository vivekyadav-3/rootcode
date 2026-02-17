import { Skeleton } from "@/components/ui/skeleton";

export default function ProblemLoading() {
  return (
    <div className="flex h-[calc(100vh-64px)] gap-4 p-4 overflow-hidden">
      {/* Left Column: Problem description */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="rounded-xl border bg-card p-6 flex-1 overflow-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex gap-2 mb-8">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>

      {/* Right Column: Code editor */}
      <div className="flex-[1.5] flex flex-col gap-4 overflow-hidden">
        <div className="rounded-xl border bg-card/50 flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
