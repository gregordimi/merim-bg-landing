import { ReactNode, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { CHART_HEIGHTS, getChartConfig } from '@/config/chartConfig';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartWrapperDebug } from './ChartWrapperDebug';
import { GlobalFilters } from '@/utils/cube/filterUtils';

interface TrendData {
  value: string;
  direction: 'up' | 'down';
}

type ChartType = 'area' | 'bar' | 'custom';

interface ChartWrapperProps {
  title: string;
  description?: string;
  isLoading: boolean;
  error: any;
  progress?: any;
  children?: ReactNode;
  trend?: TrendData | null;
  height?: keyof typeof CHART_HEIGHTS;
  
  // Chart-specific props
  chartType?: ChartType;
  data?: any[] | null;
  chartConfigType?: 'trend' | 'category' | 'comparison' | 'distribution';
  
  // Chart configuration
  xAxisKey?: string;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  dataKeys?: string[];
  barRadius?: number | [number, number, number, number];
  showGradients?: boolean;
  
  // Debug props (optional - automatically enabled with ?dev=1)
  query?: any;
  resultSet?: any;
  globalFilters?: GlobalFilters;
}

export function ChartWrapper({ 
  title, 
  description, 
  isLoading, 
  error, 
  progress, 
  children,
  trend,
  height = 'medium',
  
  // Chart-specific props
  chartType = 'custom',
  data = null,
  chartConfigType = 'trend',
  xAxisKey = 'date',
  yAxisFormatter = (value: number) => `${value.toFixed(1)} лв`,
  xAxisFormatter,
  dataKeys = ['retailPrice', 'promoPrice'],
  barRadius = [2, 2, 0, 0],
  showGradients = true,
  
  // Debug props
  query,
  resultSet,
  globalFilters,
}: ChartWrapperProps) {
  const chartHeight = CHART_HEIGHTS[height];
  const chartConfig = getChartConfig(chartConfigType);
  
  // Check if debug mode is enabled via URL parameter
  const isDebugMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('dev') === '1';
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className={`h-[${chartHeight}px] w-full`} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Unable to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`flex flex-col items-center justify-center h-[${chartHeight}px] text-muted-foreground`}>
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-sm">{error.message || 'Failed to load data'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render chart content
  const renderChart = () => {
    if (chartType === 'custom') {
      return children;
    }

    if (!data || data.length === 0) {
      return (
        <div className={`w-full h-[${chartHeight}px] flex items-center justify-center text-muted-foreground`}>
          No data available for the selected filters
        </div>
      );
    }

    const commonProps = {
      data,
      margin: chartType === 'bar' 
        ? { top: 10, right: 10, left: 10, bottom: 80 }
        : { top: 10, right: 10, left: 10, bottom: 0 }
    };

    if (chartType === 'area') {
      return (
        <ChartContainer config={chartConfig} className={`h-[${chartHeight}px] w-full`}>
          <AreaChart {...commonProps}>
            {showGradients && (
              <defs>
                {dataKeys.map((key, index) => {
                  const color = chartConfig[key]?.color || '#0088FE';
                  return (
                    <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  );
                })}
              </defs>
            )}
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={yAxisFormatter}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {dataKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key]?.color || '#0088FE'}
                fill={showGradients ? `url(#fill${key})` : chartConfig[key]?.color || '#0088FE'}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      );
    }

    if (chartType === 'bar') {
      return (
        <ChartContainer config={chartConfig} className={`h-[${chartHeight}px] w-full`}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              angle={xAxisKey === 'category' ? -45 : 0}
              textAnchor={xAxisKey === 'category' ? 'end' : 'middle'}
              height={xAxisKey === 'category' ? 100 : 60}
              interval={0}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: xAxisKey === 'category' ? 11 : 12 }}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              tickFormatter={yAxisFormatter}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {dataKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartConfig[key]?.color || '#0088FE'}
                name={String(chartConfig[key]?.label || key)}
                radius={barRadius}
              />
            ))}
          </BarChart>
        </ChartContainer>
      );
    }

    return null;
  };

  // Render debug component if enabled via ?dev=1
  if (isDebugMode && query && globalFilters) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description}
              {trend && (
                <span className={`ml-2 inline-flex items-center text-sm font-medium ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-4 w-4 mr-1 ${
                    trend.direction === 'down' ? 'rotate-180' : ''
                  }`} />
                  {trend.value}%
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
        
        <ChartWrapperDebug
          query={query}
          resultSet={resultSet}
          displayData={data}
          globalFilters={globalFilters}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {trend && (
            <span className={`ml-2 inline-flex items-center text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${
                trend.direction === 'down' ? 'rotate-180' : ''
              }`} />
              {trend.value}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
