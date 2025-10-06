import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  showFilter?: boolean;
}

export function ChartSkeleton({ showFilter = true }: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            {/* Description skeleton */}
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          {/* Filter skeleton */}
          {showFilter && (
            <div className="w-[300px] h-10 bg-muted animate-pulse rounded" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[600px] bg-muted/50 animate-pulse rounded-lg flex flex-col items-center justify-center gap-3">
          {/* Loading spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-muted-foreground text-sm">Loading chart data...</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple skeleton for just the chart area (no card wrapper)
export function ChartAreaSkeleton() {
  return (
    <div className="w-full h-[600px] bg-muted/30 animate-pulse rounded-lg flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div className="text-muted-foreground text-sm">Loading chart...</div>
    </div>
  );
}
