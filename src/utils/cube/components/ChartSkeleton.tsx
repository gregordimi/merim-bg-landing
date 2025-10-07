import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Suspense, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ChartSkeletonProps {
  showFilter?: boolean;
  progress?: any;
  isLoading?: boolean;
  error?: Error | null;
  children?: ReactNode;
}

interface ChartAreaSkeletonProps {
  progress?: any;
  isLoading?: boolean;
  error?: Error | null;
  children?: ReactNode;
}

interface CubeQueryWrapperProps {
  isLoading: boolean;
  error: Error | null;
  progress?: any;
  children: ReactNode;
  fallback?: ReactNode;
}

// Comprehensive wrapper for Cube.js query states
export function CubeQueryWrapper({
  isLoading,
  error,
  progress,
  children,
  fallback,
}: CubeQueryWrapperProps) {
  if (error) {
    return (
      <div className="w-full h-[400px] bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center gap-3">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-red-700 text-sm font-medium">
          Failed to load data
        </div>
        <div className="text-red-600 text-xs max-w-md text-center">
          {error.message}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // Show loading if explicitly loading OR if we don't have any children to render
  const hasContent = children && (Array.isArray(children) ? children.length > 0 : true);
  
  if (isLoading || !hasContent) {
    return fallback || <ChartAreaSkeleton progress={progress} />;
  }

  return (
    <Suspense fallback={fallback || <ChartAreaSkeleton progress={progress} />}>
      {children}
    </Suspense>
  );
}

export function ChartSkeleton({
  showFilter = true,
  progress,
  isLoading,
  error,
  children,
}: ChartSkeletonProps) {
  const getProgressMessage = () => {
    if (!progress) return "Loading chart data...";

    if (progress.stage) {
      const stage = progress.stage.stage || progress.stage;
      switch (stage) {
        case "download":
          return "Downloading data...";
        case "transform":
          return "Processing data...";
        case "load":
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
        <CubeQueryWrapper
          isLoading={isLoading || false}
          error={error || null}
          progress={progress}
        >
          {children || (
            <div className="w-full h-[600px] bg-muted/50 animate-pulse rounded-lg flex flex-col items-center justify-center gap-3">
              {/* Loading spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-muted-foreground text-sm">
                {getProgressMessage()}
              </div>
              {progress?.stage?.progress && (
                <div className="w-64 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.stage.progress * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </CubeQueryWrapper>
      </CardContent>
    </Card>
  );
}

// Simple skeleton for just the chart area (no card wrapper)
export function ChartAreaSkeleton({
  progress,
  isLoading,
  error,
  children,
}: ChartAreaSkeletonProps = {}) {
  const getProgressMessage = () => {
    if (!progress) return "Loading chart...";

    if (progress.stage) {
      const stage = progress.stage.stage || progress.stage;
      switch (stage) {
        case "download":
          return "Downloading data...";
        case "transform":
          return "Processing data...";
        case "load":
          return "Loading query...";
        default:
          return `${stage}...` || "Loading chart...";
      }
    }

    return "Loading chart...";
  };

  return (
    <CubeQueryWrapper
      isLoading={isLoading || false}
      error={error || null}
      progress={progress}
    >
      {children || (
        <div className="w-full h-[600px] bg-muted/30 animate-pulse rounded-lg flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <div className="text-muted-foreground text-sm">
            {getProgressMessage()}
          </div>
          {progress?.stage?.progress && (
            <div className="w-64 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.stage.progress * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </CubeQueryWrapper>
  );
}
