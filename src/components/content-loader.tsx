// Content loading component
export const ContentLoader = () => (
    <div className="max-w-none">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-8 bg-muted rounded w-1/2 mt-8"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-4/5"></div>
      </div>
    </div>
  );