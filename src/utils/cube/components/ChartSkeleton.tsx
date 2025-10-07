import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  showFilter?: boolean;
  progress?: any; // Cube.js progress object
}

interface ChartAreaSkeletonProps {
  progress?: any; // Cube.js progress object
}

export function ChartSkeleton({ showFilter = true, progress }: ChartSkeletonProps) {
  const getProgressMessage = () => {
    if (!progress) return "Loading chart data...";
    
    if (progress.stage) {
      const stage = progress.stage.stage || progress.stage;
      switch (stage) {
        case 'download':
          return "Downloading data...";
        case 'transform':
          return "Processing data...";
        case 'load':
          return "Loading query...";
        default:
          return `${stage}...` || "Loading chart data...";
      }
    }
    
    return "Loading chart data...";
  };
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
          <div className="text-muted-foreground text-sm">{getProgressMessage()}</div>
          {progress?.stage?.progress && (
            <div className="w-64 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress.stage.progress * 100}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple skeleton for just the chart area (no card wrapper)
export function ChartAreaSkeleton({ progress }: ChartAreaSkeletonProps = {}) {
  const getProgressMessage = () => {
    if (!progress) return "Loading chart...";
    
    if (progress.stage) {
      const stage = progress.stage.stage || progress.stage;
      switch (stage) {
        case 'download':
          return "Downloading data...";
        case 'transform':
          return "Processing data...";
        case 'load':
          return "Loading query...";
        default:
          return `${stage}...` || "Loading chart...";
      }
    }
    
    return "Loading chart...";
  };

  return (
    <div className="w-full h-[600px] bg-muted/30 animate-pulse rounded-lg flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div className="text-muted-foreground text-sm">{getProgressMessage()}</div>
      {progress?.stage?.progress && (
        <div className="w-64 bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress.stage.progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
