import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PivotConfig, ResultSet } from "@cubejs-client/core";
import { type ChartType } from "./types";

// Format date for display
const formatDate = (dateStr: string, format?: Intl.DateTimeFormatOptions) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      "en-US",
      format || {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  } catch {
    return dateStr;
  }
};

// Format currency/number with rounding
const formatValue = (value: number, decimals: number = 2) => {
  return Number(value.toFixed(decimals));
};

interface ChartViewerProps {
  resultSet: ResultSet;
  pivotConfig: PivotConfig;
  chartType: ChartType;
  selectedRetailers?: string[];
  chartId: string;
  decimals?: number;
  currency?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
];

export function ChartViewer(props: ChartViewerProps) {
  const {
    resultSet,
    pivotConfig,
    chartType,
    selectedRetailers,
    decimals = 2,
    currency = "лв",
    dateFormat,
  } = props;

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-2">{formatDate(label, dateFormat)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatValue(entry.value, decimals)} {currency}
          </p>
        ))}
      </div>
    );
  };

  const { chartData, dataKeys } = useMemo(() => {
    const pivot = resultSet.tablePivot();

    if (selectedRetailers && selectedRetailers.length > 0 && pivot.length > 0) {
      const filtered = pivot.filter(
        (row: any) =>
          !row["retailers.name"] ||
          selectedRetailers.includes(row["retailers.name"])
      );

      // Group by date and retailer
      const grouped = filtered.reduce((acc: any, row: any) => {
        const date = row["prices.price_date.day"] || row["prices.price_date"];
        if (!acc[date]) {
          acc[date] = { date };
        }
        const retailer = row["retailers.name"];
        const value = formatValue(
          parseFloat(row["prices.averageRetailPrice"]) || 0,
          decimals
        );
        if (value > 0) {
          acc[date][retailer] = value;
        }
        return acc;
      }, {});

      return {
        chartData: Object.values(grouped),
        dataKeys: selectedRetailers,
      };
    }

    const grouped = pivot.reduce((acc: any, row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      if (!acc[date]) {
        acc[date] = { date };
      }

      const name =
        row["retailers.name"] || row["category_groups.name"] || "value";
      const value = formatValue(
        parseFloat(row["prices.averageRetailPrice"]) || 0,
        decimals
      );

      if (value > 0) {
        acc[date][name] = value;
      }

      return acc;
    }, {});

    const data = Object.values(grouped);
    const keys =
      data.length > 0
        ? Object.keys(data[0] as object).filter((k) => k !== "date")
        : [];

    return {
      chartData: data,
      dataKeys: keys,
    };
  }, [resultSet, pivotConfig, selectedRetailers]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        No data available
      </div>
    );
  }

  if (chartType === "pie" || chartType === "doughnut") {
    const pieData = dataKeys.map((key) => ({
      name: key,
      value: formatValue(
        chartData.reduce((sum: number, item: any) => sum + (item[key] || 0), 0),
        decimals
      ),
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={chartType === "doughnut" ? 60 : 0}
            outerRadius={80}
            label={(entry) => `${entry.name}: ${entry.value} ${currency}`}
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `${formatValue(value, decimals)} ${currency}`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(date, dateFormat)}
          />
          <YAxis
            tickFormatter={(value) =>
              `${formatValue(value, decimals)} ${currency}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => formatDate(date, dateFormat)}
        />
        <YAxis
          tickFormatter={(value) =>
            `${formatValue(value, decimals)} ${currency}`
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            fill={chartType === "area" ? COLORS[index % COLORS.length] : "none"}
            fillOpacity={chartType === "area" ? 0.3 : 0}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
