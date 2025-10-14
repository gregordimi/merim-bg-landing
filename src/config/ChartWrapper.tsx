import { ReactNode, useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import {
  CHART_HEIGHTS,
  getChartConfig,
  CHART_COLORS,
} from "@/config/chartConfig";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { ChartWrapperDebug } from "./ChartWrapperDebug";
import { GlobalFilters } from "@/utils/cube/filterUtils";

interface TrendData {
  value: string;
  direction: "up" | "down";
}

type ChartType =
  | "area"
  | "bar"
  | "horizontal-bar"
  | "multiline"
  | "pie"
  | "radar"
  | "custom";

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
  data?: any[] | null | undefined;
  chartConfigType?: "trend" | "category" | "comparison" | "distribution";

  // Chart configuration
  xAxisKey?: string;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  dataKeys?: string[];
  barRadius?: number | [number, number, number, number];
  showGradients?: boolean;

  // Multi-line chart specific props
  dynamicKeys?: string[]; // For multi-line charts where keys are dynamic (e.g., retailer names)

  // Horizontal bar specific props
  layout?: "horizontal" | "vertical";
  yAxisWidth?: number;

  // Pie chart specific props
  innerRadius?: number;
  outerRadius?: number;
  pieDataKey?: string;
  showPercentage?: boolean;

  // Radar chart specific props
  radarDataKey?: string;

  // Reload functionality
  onReload?: () => void;

  // Debug props (optional - automatically enabled with ?dev=1)
  query?: any;
  resultSet?: any;
  globalFilters?: GlobalFilters;
}

/**
 * Custom hook for tracking media query status.
 * @param {string} query - The media query string to match.
 * @returns {boolean} - True if the media query matches, false otherwise.
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

export function ChartWrapper({
  title,
  description,
  isLoading,
  error,
  progress,
  children,
  trend,
  height = "medium",

  // Chart-specific props
  chartType = "custom",
  data = null,
  chartConfigType = "trend",
  xAxisKey = "date",
  yAxisFormatter = (value: number) => `${value.toFixed(1)} лв`,
  xAxisFormatter,
  dataKeys = ["retailPrice", "promoPrice"],
  barRadius = [2, 2, 0, 0],
  showGradients = true,

  // Multi-line chart specific props
  dynamicKeys = [],

  // Horizontal bar specific props
  layout = "horizontal",
  yAxisWidth = 130,

  // Pie chart specific props
  innerRadius = 60,
  outerRadius = 120,
  pieDataKey = "value",
  showPercentage = true,

  // Radar chart specific props
  radarDataKey = "subject",

  // Reload functionality
  onReload,

  // Debug props
  query,
  resultSet,
  globalFilters,
}: ChartWrapperProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const chartHeight = CHART_HEIGHTS[height];
  const chartConfig = getChartConfig(chartConfigType);

  // Check if debug mode is enabled via URL parameter
  const isDebugMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("dev") === "1";
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
          <div
            className={`flex flex-col items-center justify-center h-[${chartHeight}px] text-muted-foreground`}
          >
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-sm mb-4">
              {error.message || "Failed to load data"}
            </p>
            {onReload && (
              <Button onClick={onReload} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render chart content
  const renderChart = () => {
    if (chartType === "custom") {
      return children;
    }

    // Show "No data available" only for empty arrays, and only if we have a resultSet
    if (resultSet && data && data.length === 0) {
      return (
        <div
          className={`w-full h-[${chartHeight}px] flex flex-col items-center justify-center text-muted-foreground`}
        >
          <p className="mb-4">No data available for the selected filters</p>
          {onReload && (
            <Button onClick={onReload} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
          )}
        </div>
      );
    }

    // If no data yet, return null (let loading state handle it)
    if (!data || data.length === 0) {
      return null;
    }

    if (chartType === "area") {
      return (
        <ChartContainer
          config={chartConfig}
          className={`h-[${chartHeight}px] w-full`}
        >
          <AreaChart
            data={data}
            margin={
              isMobile
                ? { top: 5, right: 5, left: -20, bottom: 0 }
                : { top: 10, right: 10, left: 10, bottom: 0 }
            }
          >
            {showGradients && (
              <defs>
                {dataKeys.map((key) => {
                  const color = chartConfig[key]?.color || "#0088FE";
                  return (
                    <linearGradient
                      key={key}
                      id={`fill${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  );
                })}
              </defs>
            )}
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={yAxisFormatter}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key]?.color || "#0088FE"}
                fill={
                  showGradients
                    ? `url(#fill${key})`
                    : chartConfig[key]?.color || "#0088FE"
                }
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      );
    }

    if (chartType === "bar") {
      return (
        <ChartContainer
          config={chartConfig}
          className={`h-[${chartHeight}px] w-full`}
        >
          <BarChart
            data={data}
            margin={
              isMobile
                ? { top: 5, right: 5, left: -20, bottom: 40 }
                : { top: 10, right: 10, left: 10, bottom: 80 }
            }
          >
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey={xAxisKey}
              angle={xAxisKey === "category" ? -45 : 0}
              textAnchor={xAxisKey === "category" ? "end" : "middle"}
              height={isMobile ? 60 : xAxisKey === "category" ? 100 : 60}
              interval={isMobile ? "preserveStartEnd" : 0}
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              tick={{
                fontSize: isMobile ? 10 : xAxisKey === "category" ? 11 : 12,
              }}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={yAxisFormatter}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartConfig[key]?.color || "#0088FE"}
                name={String(chartConfig[key]?.label || key)}
                radius={barRadius}
              />
            ))}
          </BarChart>
        </ChartContainer>
      );
    }

    if (chartType === "horizontal-bar") {
      const currentYAxisWidth = isMobile ? 80 : yAxisWidth;
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={
              isMobile
                ? { top: 10, right: 20, left: 10, bottom: 10 }
                : { top: 20, right: 80, left: 20, bottom: 20 }
            }
          >
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={yAxisFormatter}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              width={currentYAxisWidth}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label = chartConfig[name]?.label || name;
                return [yAxisFormatter(value), label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            {dataKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartConfig[key]?.color || CHART_COLORS[0]}
                name={String(chartConfig[key]?.label || key)}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "multiline") {
      return (
        <ChartContainer
          config={chartConfig}
          className={`h-[${chartHeight}px] w-full`}
        >
          <LineChart
            data={data}
            margin={
              isMobile
                ? { top: 5, right: 5, left: -20, bottom: 0 }
                : { top: 10, right: 10, left: 10, bottom: 0 }
            }
          >
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={isMobile ? 4 : 8}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={yAxisFormatter}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {dynamicKeys.map((key, index) => (
              <Line
                key={String(key)}
                type="monotone"
                dataKey={String(key)}
                stroke={
                  chartConfig[key]?.color ||
                  CHART_COLORS[index % CHART_COLORS.length]
                }
                strokeWidth={2}
                dot={{ r: isMobile ? 3 : 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      );
    }

    if (chartType === "pie") {
      return (
        <ChartContainer
          config={chartConfig}
          className={`h-[${chartHeight}px] w-full`}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={
                showPercentage && !isMobile
                  ? ({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  : undefined
              }
              outerRadius={isMobile ? 80 : outerRadius}
              innerRadius={isMobile ? 40 : innerRadius}
              dataKey={pieDataKey}
              paddingAngle={2}
            >
              {data.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent />}
              className="flex-wrap gap-2"
            />
          </PieChart>
        </ChartContainer>
      );
    }

    if (chartType === "radar") {
      return (
        <ChartContainer
          config={chartConfig}
          className={`h-[${chartHeight}px] w-full`}
        >
          <RadarChart data={data}>
            <PolarGrid
              gridType="circle"
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey={radarDataKey}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "dataMax"]}
              tick={{ fontSize: isMobile ? 8 : 10 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((key) => (
              <Radar
                key={key}
                name={String(chartConfig[key]?.label || key)}
                dataKey={key}
                stroke={chartConfig[key]?.color || CHART_COLORS[0]}
                fill={chartConfig[key]?.color || CHART_COLORS[0]}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
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
                <span
                  className={`ml-2 inline-flex items-center text-sm font-medium ${
                    trend.direction === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendingUp
                    className={`h-4 w-4 mr-1 ${
                      trend.direction === "down" ? "rotate-180" : ""
                    }`}
                  />
                  {trend.value}%
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderChart()}</CardContent>
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
            <span
              className={`ml-2 inline-flex items-center text-sm font-medium ${
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 mr-1 ${
                  trend.direction === "down" ? "rotate-180" : ""
                }`}
              />
              {trend.value}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}