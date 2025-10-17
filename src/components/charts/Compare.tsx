import React, { useState, useEffect } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { GlobalFilters } from "@/utils/cube/filterUtils";

// --------------------------------------
// COLOR DEFINITIONS
// --------------------------------------
const COLOR_PAIRS = [
  ["#4A5FCC", "#8B9AE8"], // Blue: dark / light
  ["#2E7D32", "#81C784"], // Green
  ["#F57C00", "#FFB74D"], // Orange
  ["#C2185B", "#F06292"], // Pink
  ["#7B1FA2", "#BA68C8"], // Purple
  ["#0097A7", "#4DD0E1"], // Cyan
  ["#D32F2F", "#E57373"], // Red
  ["#F9A825", "#FDD835"], // Yellow
];

// --------------------------------------
// DATA PROCESSING
// --------------------------------------
function processCompareData(result: any): any[] {
  if (!result) return [];

  const loadResponse = result.loadResponse;
  if (!loadResponse?.results?.length) return [];

  const currentData = loadResponse.results[0]?.data || [];
  const previousData = loadResponse.results[1]?.data || [];

  const prevMap = new Map<string, number>(
    previousData.map((row: any) => [
      `${row["category_groups.name"]}|${row["categories.name"]}`,
      parseFloat(row["prices.averageRetailPrice"]),
    ])
  );

  const grouped: Record<string, any> = {};

  // Assign consistent hue per group
  const groupNames: string[] = Array.from(
    new Set(currentData.map((r: any) => r["category_groups.name"] as string))
  );
  const groupColorMap: Record<string, number> = {};
  groupNames.forEach((g, i) => {
    groupColorMap[g] = i % COLOR_PAIRS.length;
  });

  currentData.forEach((row: any) => {
    const group = row["category_groups.name"];
    const category = row["categories.name"];
    const currentValue = parseFloat(row["prices.averageRetailPrice"]);
    const previousValue: number = prevMap.get(`${group}|${category}`) || 0;

    const diff = currentValue - previousValue;
    const percentChange =
      previousValue !== 0 ? (diff / previousValue) * 100 : 0;
    const isPositive = percentChange >= 0;

    const colorPairIndex = groupColorMap[group];
    const colorPair = COLOR_PAIRS[colorPairIndex % COLOR_PAIRS.length];
    const color = isPositive ? colorPair[0] : colorPair[1];

    if (!grouped[group]) {
      grouped[group] = {
        name: group,
        colorIndex: groupColorMap[group],
        children: [],
      };
    }

    grouped[group].children.push({
      name: category,
      size: currentValue || previousValue,
      currentValue,
      previousValue,
      percentChange,
      isPositive,
      fill: color,
      groupName: group,
    });
  });

  previousData.forEach((row: any) => {
    const group = row["category_groups.name"];
    const category = row["categories.name"];
    const previousValue = parseFloat(row["prices.averageRetailPrice"]);

    if (!grouped[group]) {
      grouped[group] = {
        name: group,
        colorIndex: groupColorMap[group],
        children: [],
      };
    }

    const alreadyExists = grouped[group].children.some(
      (c: any) => c.name === category
    );
    if (!alreadyExists) {
      const currentValue = 0;
      const diff = currentValue - previousValue;
      const percentChange =
        previousValue !== 0 ? (diff / previousValue) * 100 : 0;
      const isPositive = percentChange >= 0;

      const colorPairIndex = groupColorMap[group];
      const colorPair = COLOR_PAIRS[colorPairIndex % COLOR_PAIRS.length];
      const color = isPositive ? colorPair[0] : colorPair[1];

      grouped[group].children.push({
        name: category,
        size: previousValue,
        currentValue: 0,
        previousValue,
        percentChange,
        isPositive,
        fill: color,
        groupName: group,
      });
    }
  });

  const processedGroups = Object.values(grouped).map((group: any) => {
    let totalChange = 0;
    let count = 0;

    for (const child of group.children) {
      if (child.previousValue !== 0) {
        totalChange += child.percentChange;
        count++;
      }
    }

    const avgChange = count > 0 ? totalChange / count : 0;
    const isPositive = avgChange >= 0;

    const colorPair = COLOR_PAIRS[group.colorIndex % COLOR_PAIRS.length];
    const color = isPositive ? colorPair[0] : colorPair[1];

    return {
      ...group,
      avgChange,
      isPositive,
      fill: color,
    };
  });

  return processedGroups;
}

// --------------------------------------
// TOOLTIP
// --------------------------------------
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const current = data.currentValue || 0;
    const previous = data.previousValue || 0;
    const diff = current - previous;
    const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;

    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold text-sm mb-2">{data.name}</p>
        <div className="text-xs space-y-1">
          <p>
            Current: <span className="font-medium">{current.toFixed(2)}</span>
          </p>
          <p>
            Previous: <span className="font-medium">{previous.toFixed(2)}</span>
          </p>
          <p className={diff >= 0 ? "text-red-600": "text-green-600" }>
            Change:{" "}
            <span className="font-medium">
              {diff >= 0 ? "+" : ""}
              {diff.toFixed(2)} ({percentChange.toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// --------------------------------------
// CUSTOM TREEMAP CELL RENDERER
// --------------------------------------
const CustomizedContent = (props: any) => {
  const {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    name = "",
    payload = {},
    fill = "#cccccc",
  } = props || {};

  if (!payload) return null;

  const hasChildren =
    Array.isArray(payload.children) && payload.children.length > 0;

  const bgColor = fill || payload.fill || "#cccccc";

  let changeValue = 0;

  if (hasChildren) {
    changeValue = payload.avgChange || 0;
  } else {
    // For leaf nodes, the actual data is in the root of the node object
    // Recharts passes the original data object directly
    const current = props.currentValue || 0;
    const previous = props.previousValue || 0;
    const storedChange = props.percentChange;

    if (storedChange !== undefined) {
      changeValue = storedChange;
    } else if (previous !== 0) {
      changeValue = ((current - previous) / previous) * 100;
    }
  }

  // Parent node rendering
  if (hasChildren) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={bgColor}
          stroke="#fff"
          strokeWidth={2}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(16, width / 10)}
          fontWeight="bold"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          fill="#fff"
          fontSize={Math.min(14, width / 12)}
        >
          {changeValue >= 0 ? "+" : ""}
          {changeValue.toFixed(1)}%
        </text>
      </g>
    );
  }

  // Leaf node rendering
  const truncatedName = name.length > 30 ? name.substring(0, 27) + "..." : name;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={bgColor}
        stroke="#fff"
        strokeWidth={2}
      />
      {width > 60 && height > 40 ? (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
            fontWeight="500"
          >
            {truncatedName}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
          >
            {changeValue >= 0 ? "+" : ""}
            {changeValue.toFixed(1)}%
          </text>
        </>
      ) : null}
    </g>
  );
};

// --------------------------------------
// CUSTOM LEGEND
// --------------------------------------
const CustomLegend = ({ data }: { data: any[] }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4 p-4 bg-gray-50 rounded">
      {data.map((group, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: group.fill }}
          />
          <span className="text-sm font-medium text-gray-700">
            {group.name}
          </span>
        </div>
      ))}
    </div>
  );
};

// --------------------------------------
// MAIN COMPONENT
// --------------------------------------
const Compare: React.FC<{ globalFilters: GlobalFilters }> = ({
  globalFilters,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">(
    "day"
  );

  const {
    resultSet: result,
    isLoading,
    error,
  } = useCubeQuery({
    dimensions: ["category_groups.name", "categories.name"],
    timeDimensions: [
      {
        dimension: "prices.price_date",
        compareDateRange: [
          ["2025-10-16", "2025-10-16"],
          ["2025-10-15", "2025-10-15"],
        ],
        granularity: granularity,
      },
    ],
    measures: ["prices.averageRetailPrice"],
  });

  useEffect(() => {
    if (!result) return;
    try {
      const treemapData = processCompareData(result);
      setData(treemapData);
    } catch (err) {
      console.error("Error processing data", err);
      setData([]);
    }
  }, [result]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {["day", "week", "month"].map((g) => (
          <button
            key={g}
            onClick={() => setGranularity(g as any)}
            className={`px-4 py-2 rounded ${
              granularity === g
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {g[0].toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>

      <div className="h-96 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded">
            <p className="text-gray-600">No data available</p>
          </div>
        )}
      </div>

      {data.length > 0 && <CustomLegend data={data} />}
    </div>
  );
};

export default Compare;
