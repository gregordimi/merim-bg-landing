# Dashboard Refactor Plan: Fix Query Consistency Issues

## Problem Statement

The current dashboard has inconsistent Cube.js queries due to:
- Object reference changes causing unnecessary re-renders
- Monolithic components with multiple queries
- Cascading re-renders preventing pre-aggregation cache hits
- 5+ second query times on 5M row dataset

## Solution Architecture

Break down monolithic dashboard components into isolated chart components with stable query patterns.

---

## Phase 1: Create Shared Infrastructure

### 1.1 Create Stable Query Hook

**File:** `src/hooks/useStableQuery.ts`

```typescript
import { useMemo } from 'react';
import { useCubeQuery } from '@cubejs-client/react';

export function useStableQuery(queryBuilder: () => any, dependencies: any[]) {
  // Convert all dependencies to stable strings
  const stableDeps = dependencies.map(dep => {
    if (Array.isArray(dep)) return dep.join(',');
    if (typeof dep === 'object') return JSON.stringify(dep);
    return String(dep);
  });

  const query = useMemo(queryBuilder, stableDeps);
  
  return useCubeQuery(query, {
    castNumerics: true,
    resetResultSetOnChange: false,
    subscribe: false,
  });
}
```

### 1.2 Create Query Helper Utilities

**File:** `src/utils/queryHelpers.ts`

```typescript
import { GlobalFilters } from '@/pages/DashboardPage';

export function buildFilters(globalFilters: GlobalFilters) {
  const filters = [];
  
  if (globalFilters.retailers?.length > 0) {
    filters.push({
      member: "retailers.name",
      operator: "equals" as const,
      values: globalFilters.retailers,
    });
  }
  
  if (globalFilters.locations?.length > 0) {
    filters.push({
      member: "settlements.name_bg",
      operator: "equals" as const,
      values: globalFilters.locations,
    });
  }
  
  if (globalFilters.categories?.length > 0) {
    filters.push({
      member: "category_groups.name",
      operator: "equals" as const,
      values: globalFilters.categories,
    });
  }
  
  return filters;
}

export function buildTimeDimensions(dateRange?: string[]) {
  return dateRange ? [
    {
      dimension: "prices.price_date",
      dateRange: dateRange,
    }
  ] : [
    {
      dimension: "prices.price_date", 
      dateRange: "Last 30 days" as const,
    }
  ];
}

export function buildTimeDimensionsWithGranularity(dateRange?: string[], granularity: string = 'day') {
  return dateRange ? [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: dateRange,
    }
  ] : [
    {
      dimension: "prices.price_date",
      granularity: granularity as const,
      dateRange: "Last 30 days" as const,
    }
  ];
}
```

### 1.3 Create Chart Wrapper Component

**File:** `src/components/charts/ChartWrapper.tsx`

```typescript
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CubeQueryWrapper } from '@/utils/cube/components/ChartSkeleton';

interface ChartWrapperProps {
  title: string;
  description?: string;
  isLoading: boolean;
  error: any;
  progress: any;
  children: ReactNode;
}

export function ChartWrapper({ 
  title, 
  description, 
  isLoading, 
  error, 
  progress, 
  children 
}: ChartWrapperProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <CubeQueryWrapper isLoading={isLoading} error={error} progress={progress}>
          {children}
        </CubeQueryWrapper>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 2: Extract Executive Overview Charts

### 2.1 Create Stats Cards Component

**File:** `src/components/charts/StatsCards.tsx`

```typescript
import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  globalFilters: GlobalFilters;
}

export function StatsCards({ globalFilters }: StatsCardsProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      measures: [
        "prices.minRetailPrice",
        "prices.maxRetailPrice", 
        "prices.medianRetailPrice",
      ],
      filters: buildFilters(globalFilters),
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const statsData = useMemo(() => {
    if (!resultSet) return { minPrice: 0, maxPrice: 0, medianPrice: 0 };
    
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return { minPrice: 0, maxPrice: 0, medianPrice: 0 };

    const data = pivot[0];
    return {
      minPrice: data?.["prices.minRetailPrice"] || 0,
      maxPrice: data?.["prices.maxRetailPrice"] || 0,
      medianPrice: data?.["prices.medianRetailPrice"] || 0,
    };
  }, [resultSet]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Minimum Price</p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.minPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Median Price</p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.medianPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Maximum Price</p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.maxPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2.2 Create Trend Chart Component

**File:** `src/components/charts/TrendChart.tsx`

```typescript
import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensionsWithGranularity } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  globalFilters: GlobalFilters;
}

export function TrendChart({ globalFilters }: TrendChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensionsWithGranularity(globalFilters.dateRange, 'day'),
      filters: buildFilters(globalFilters),
      order: { "prices.price_date": "asc" as const },
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];
    
    return resultSet.tablePivot().map((row: any) => ({
      date: row["prices.price_date.day"] || row["prices.price_date"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ChartWrapper
      title="Price Trends Over Time"
      description="Track retail and promotional price changes"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name === "retailPrice" ? "Retail Price" : "Promo Price"
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="retailPrice"
              stroke="#0088FE"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Retail Price"
            />
            <Line
              type="monotone"
              dataKey="promoPrice"
              stroke="#00C49F"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Promo Price"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
```

### 2.3 Create Category Chart Component

**File:** `src/components/charts/CategoryChart.tsx`

```typescript
import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryChartProps {
  globalFilters: GlobalFilters;
}

export function CategoryChart({ globalFilters }: CategoryChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["category_groups.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 20,
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      category: row["category_groups.name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Average Retail & Promo Prices by Category"
      description="Compare retail and promotional prices across product categories"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label = name === "retailPrice" ? "Retail Price" : "Promo Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="retailPrice" fill="#0088FE" name="Retail Price" />
            <Bar dataKey="promoPrice" fill="#00C49F" name="Promo Price" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
```

### 2.4 Update Executive Overview

**File:** `src/components/dashboard/ExecutiveOverview.tsx`

```typescript
import { GlobalFilters } from "@/pages/DashboardPage";
import { StatsCards } from "@/components/charts/StatsCards";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryChart } from "@/components/charts/CategoryChart";

interface ExecutiveOverviewProps {
  globalFilters: GlobalFilters;
}

export default function ExecutiveOverview({ globalFilters }: ExecutiveOverviewProps) {
  return (
    <div className="space-y-6">
      <StatsCards globalFilters={globalFilters} />
      <TrendChart globalFilters={globalFilters} />
      <CategoryChart globalFilters={globalFilters} />
    </div>
  );
}
```

---

## Phase 3: Extract Geographical Insights Charts

### 3.1 Create Regional Trend Chart Component

**File:** `src/components/charts/RegionalTrendChart.tsx`

```typescript
import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensionsWithGranularity } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RegionalTrendChartProps {
  globalFilters: GlobalFilters;
}

export function RegionalTrendChart({ globalFilters }: RegionalTrendChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice"],
      timeDimensions: buildTimeDimensionsWithGranularity(globalFilters.dateRange, 'day'),
      filters: buildFilters(globalFilters),
      order: { "prices.price_date": "asc" as const },
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    const dataMap = new Map();

    // Group data by date
    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const municipality = row["municipality.name"];
      const price = Number(row["prices.averageRetailPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      
      const dateEntry = dataMap.get(date);
      dateEntry[municipality] = price > 0 ? price : null;
    });

    // Convert to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [resultSet]);

  // Get unique municipalities for line colors
  const municipalities = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    const municipalitySet = new Set();
    pivot.forEach((row: any) => {
      if (row["municipality.name"]) {
        municipalitySet.add(row["municipality.name"]);
      }
    });
    return Array.from(municipalitySet);
  }, [resultSet]);

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
    "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"
  ];

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric" 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ChartWrapper
      title="Regional Price Trends"
      description="Track how prices vary across different municipalities over time"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && municipalities.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            {municipalities.map((municipality, index) => (
              <Line
                key={String(municipality)}
                type="monotone"
                dataKey={String(municipality)}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
```

### 3.2 Create Settlement Chart Component

**File:** `src/components/charts/SettlementChart.tsx`

```typescript
import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SettlementChartProps {
  globalFilters: GlobalFilters;
}

export function SettlementChart({ globalFilters }: SettlementChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["settlements.name_bg"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 20,
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      settlement: row["settlements.name_bg"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 20 Settlements - Retail vs Promo"
      description="Compare retail and promotional prices by settlement"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="settlement"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label = name === "retailPrice" ? "Retail Price" : "Promo Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="retailPrice" fill="#0088FE" name="Retail Price" />
            <Bar dataKey="promoPrice" fill="#00C49F" name="Promo Price" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
```

### 3.3 Create Municipality Chart Component

**File:** `src/components/charts/MunicipalityChart.tsx`

```typescript
import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { ChartWrapper } from './ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MunicipalityChartProps {
  globalFilters: GlobalFilters;
}

export function MunicipalityChart({ globalFilters }: MunicipalityChartProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      dimensions: ["municipality.name"],
      measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
      filters: buildFilters(globalFilters),
      order: { "prices.averageRetailPrice": "desc" as const },
      limit: 15,
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    return resultSet.tablePivot().map((row: any) => ({
      municipality: row["municipality.name"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 15 Municipalities - Retail vs Promo"
      description="Compare retail and promotional prices across municipalities"
      isLoading={isLoading}
      error={error}
      progress={progress}
    >
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="municipality"
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
            />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label = name === "retailPrice" ? "Retail Price" : "Promo Price";
                return [`${value.toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="retailPrice" fill="#0088FE" name="Retail Price" />
            <Bar dataKey="promoPrice" fill="#00C49F" name="Promo Price" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
```

### 3.4 Update Geographical Insights

**File:** `src/components/dashboard/GeographicalInsights.tsx`

```typescript
import { GlobalFilters } from "@/pages/DashboardPage";
import { RegionalTrendChart } from "@/components/charts/RegionalTrendChart";
import { SettlementChart } from "@/components/charts/SettlementChart";
import { MunicipalityChart } from "@/components/charts/MunicipalityChart";

interface GeographicalInsightsProps {
  globalFilters: GlobalFilters;
}

export default function GeographicalInsights({ globalFilters }: GeographicalInsightsProps) {
  return (
    <div className="space-y-6">
      <RegionalTrendChart globalFilters={globalFilters} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettlementChart globalFilters={globalFilters} />
        <MunicipalityChart globalFilters={globalFilters} />
      </div>
    </div>
  );
}
```

---

## Phase 4: Fix Parent State Management

### 4.1 Update Dashboard Page

**File:** `src/pages/DashboardPage.tsx`

```typescript
import { useState, useMemo } from 'react';

export interface GlobalFilters {
  retailers: string[];
  locations: string[];
  categories: string[];
  dateRange?: string[];
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<GlobalFilters>({
    retailers: [],
    locations: [],
    categories: [],
    dateRange: undefined,
  });

  // CRITICAL: Memoize the filters object to prevent unnecessary re-renders
  const stableFilters = useMemo(() => ({
    retailers: filters.retailers,
    locations: filters.locations,
    categories: filters.categories,
    dateRange: filters.dateRange,
  }), [
    filters.retailers.join(','),
    filters.locations.join(','), 
    filters.categories.join(','),
    (filters.dateRange || []).join(','),
  ]);

  return (
    <div>
      {/* Filter components */}
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      
      {/* Dashboard tabs */}
      <Tabs>
        <TabsContent value="executive">
          <ExecutiveOverview globalFilters={stableFilters} />
        </TabsContent>
        <TabsContent value="geographical">
          <GeographicalInsights globalFilters={stableFilters} />
        </TabsContent>
        <TabsContent value="category">
          <CategoryDeepDive globalFilters={stableFilters} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Phase 5: Testing & Validation

### 5.1 Test Each Component Individually

1. **Create test pages for each chart component**
2. **Verify query consistency with browser dev tools**
3. **Check Cube.js logs for pre-aggregation usage**
4. **Measure performance improvements**

### 5.2 Performance Validation

**Expected Results:**
- First load: 3-5 seconds (building pre-aggregations)
- Subsequent loads: <500ms (using pre-aggregations)
- Filter changes: <1 second (stable queries)
- No duplicate queries in network tab

### 5.3 Debugging Tools

Add to each chart component:
```typescript
console.log(`${ComponentName} query:`, JSON.stringify(query, null, 2));
console.log(`${ComponentName} rendered at:`, new Date().toISOString());
```

---

## Phase 6: Cleanup & Optimization

### 6.1 Remove Old Components

1. **Delete old monolithic component code**
2. **Remove unused imports**
3. **Clean up console.log statements**

### 6.2 Add Error Boundaries

**File:** `src/components/ErrorBoundary.tsx`

```typescript
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium">Chart Error</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || 'Something went wrong loading this chart.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 6.3 Add Loading States

Wrap each chart in error boundary:
```typescript
<ChartErrorBoundary>
  <StatsCards globalFilters={globalFilters} />
</ChartErrorBoundary>
```

---

## Success Criteria

✅ **Query Consistency:** Same filters = same query = cache hit  
✅ **Performance:** <500ms for cached queries  
✅ **Maintainability:** Each chart is isolated and testable  
✅ **Reusability:** Charts can be used across different dashboards  
✅ **Error Handling:** Graceful degradation when queries fail  

---

---

## Notes for Implementation

1. **Start with Phase 1** - Infrastructure must be in place first
2. **Test each component individually** before integrating
3. **Keep old components** until new ones are fully tested
4. **Monitor Cube.js logs** to verify pre-aggregation usage
5. **Use browser dev tools** to verify query consistency
6. **Add performance monitoring** to measure improvements

This refactor will solve the query consistency issues permanently and create a maintainable, performant dashboard architecture.