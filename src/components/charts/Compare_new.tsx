import React, { useState, useEffect } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { GlobalFilters } from "@/utils/cube/filterUtils";
import groupsData from "./Compare_new_groups.json";
import categoriesData from "./Compare_new_category.json";

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
function processCompareData(result: any, priceType: "retail" | "promo"): any[] {
  if (!result) return [];

  const loadResponse = result.loadResponse;
  if (!loadResponse?.results?.length) return [];

  const currentData = loadResponse.results[0]?.data || [];
  const previousData = loadResponse.results[1]?.data || [];

  // Create maps for ALL price data from Cube (store both retail and promo)
  const currentRetailMap = new Map<string, number>();
  const previousRetailMap = new Map<string, number>();
  const currentPromoMap = new Map<string, number>();
  const previousPromoMap = new Map<string, number>();
  const countMap = new Map<string, number>();

  currentData.forEach((row: any) => {
    const categoryId = String(row["prices.category_id"]);
    currentRetailMap.set(
      categoryId,
      parseFloat(row["prices.averageRetailPrice"]) || 0
    );
    currentPromoMap.set(
      categoryId,
      parseFloat(row["prices.averagePromoPrice"]) || 0
    );
    countMap.set(categoryId, parseFloat(row["prices.count"]) || 0);
  });

  previousData.forEach((row: any) => {
    const categoryId = String(row["prices.category_id"]);
    previousRetailMap.set(
      categoryId,
      parseFloat(row["prices.averageRetailPrice"]) || 0
    );
    previousPromoMap.set(
      categoryId,
      parseFloat(row["prices.averagePromoPrice"]) || 0
    );
  });

  // Create maps for static data (JSON has number IDs)
  const groupStaticMap = new Map(groupsData.map((g: any) => [String(g.id), g]));

  const categoryStaticMap = new Map(
    categoriesData.map((c: any) => [String(c.id), c])
  );

  // Build category to group mapping from the data
  // Assuming group IDs are 1001-1008 and categories belong to groups
  const categoryToGroupMap = new Map<string, string>();

  // Map categories to groups based on ID ranges or explicit mapping
  // Group 1001: categories 1-5 (Основни храни)
  // Group 1002: categories 6-14 (Млечни и яйца)
  // Group 1003: categories 15-30 (Месо и риба)
  // Group 1004: categories 51-62 (Плодове и зеленчуци)
  // Group 1005: categories 33-49, 63-69 (Пакетирани храни)
  // Group 1006: categories 70-78 (Напитки и тютюн)
  // Group 1007: categories 79-85 (Хигиена и козметика)
  // Group 1008: categories 86-101 (Лекарствени средства)

  const groupRanges: Record<string, number[][]> = {
    "1001": [
      [1, 5],
      [35, 45],
    ],
    "1002": [
      [6, 14],
      [31, 32],
    ],
    "1003": [[15, 30]],
    "1004": [[50, 62]],
    "1005": [
      [33, 34],
      [46, 49],
      [63, 69],
    ],
    "1006": [[70, 78]],
    "1007": [[79, 85]],
    "1008": [[86, 101]],
  };

  // Build the mapping
  for (const [groupId, ranges] of Object.entries(groupRanges)) {
    for (const [start, end] of ranges) {
      for (let catId = start; catId <= end; catId++) {
        categoryToGroupMap.set(String(catId), groupId);
      }
    }
  }

  const grouped: Record<string, any> = {};

  // Assign colors to groups
  const groupColorMap: Record<string, number> = {};
  groupsData.forEach((g: any, i: number) => {
    groupColorMap[String(g.id)] = i % COLOR_PAIRS.length;
  });

  // Process all categories from static data
  categoriesData.forEach((categoryStatic: any) => {
    const categoryId = String(categoryStatic.id);
    const groupId = categoryToGroupMap.get(categoryId);

    if (!groupId) return;

    const groupStaticData = groupStaticMap.get(groupId);
    if (!groupStaticData) return;

    // Get all price data
    const currentRetail = currentRetailMap.get(categoryId) || 0;
    const previousRetail = previousRetailMap.get(categoryId) || 0;
    const currentPromo = currentPromoMap.get(categoryId) || 0;
    const previousPromo = previousPromoMap.get(categoryId) || 0;
    const count = countMap.get(categoryId) || 0;

    // Calculate changes for the selected price type
    const currentValue = priceType === "retail" ? currentRetail : currentPromo;
    const previousValue =
      priceType === "retail" ? previousRetail : previousPromo;

    const diff = currentValue - previousValue;
    const percentChange =
      previousValue !== 0 ? (diff / previousValue) * 100 : 0;
    const isPositive = percentChange >= 0;

    const colorPairIndex = groupColorMap[groupId];
    const colorPair = COLOR_PAIRS[colorPairIndex % COLOR_PAIRS.length];
    const color = isPositive ? colorPair[0] : colorPair[1];

    if (!grouped[groupId]) {
      grouped[groupId] = {
        name: groupStaticData.group,
        groupId: groupId,
        colorIndex: colorPairIndex,
        size: groupStaticData.relative_share * 1000,
        children: [],
      };
    }

    grouped[groupId].children.push({
      name: categoryStatic.category,
      categoryId: categoryId,
      size: categoryStatic.relative_share * 1000,
      currentValue,
      previousValue,
      percentChange,
      isPositive,
      fill: color,
      groupName: groupStaticData.group,
      // Store all price data for tooltip
      currentRetail,
      previousRetail,
      currentPromo,
      previousPromo,
      count,
    });
  });

  // Calculate average change per group
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

    // Get all price data
    const currentRetail = data.currentRetail || 0;
    const previousRetail = data.previousRetail || 0;
    const currentPromo = data.currentPromo || 0;
    const previousPromo = data.previousPromo || 0;
    const count = data.count || 0;

    // Calculate retail changes
    const retailDiff = currentRetail - previousRetail;
    const retailPercentChange =
      previousRetail !== 0 ? (retailDiff / previousRetail) * 100 : 0;

    // Calculate promo changes
    const promoDiff = currentPromo - previousPromo;
    const promoPercentChange =
      previousPromo !== 0 ? (promoDiff / previousPromo) * 100 : 0;

    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg max-w-xs">
        <p className="font-semibold text-sm mb-2 border-b pb-1">{data.name}</p>
        <div className="text-xs space-y-2">
          <p className="font-medium text-gray-700">
            Products: <span className="font-bold">{count}</span>
          </p>

          <div className="border-t pt-2">
            <p className="font-semibold text-blue-700 mb-1">Retail Price</p>
            <p>
              Current:{" "}
              <span className="font-medium">{currentRetail.toFixed(2)} лв</span>
            </p>
            <p>
              Previous:{" "}
              <span className="font-medium">
                {previousRetail.toFixed(2)} лв
              </span>
            </p>
            <p className={retailDiff >= 0 ? "text-red-600" : "text-green-600"}>
              Change:{" "}
              <span className="font-medium">
                {retailDiff >= 0 ? "+" : ""}
                {retailDiff.toFixed(2)} лв ({retailPercentChange.toFixed(1)}%)
              </span>
            </p>
          </div>

          <div className="border-t pt-2">
            <p className="font-semibold text-purple-700 mb-1">Promo Price</p>
            <p>
              Current:{" "}
              <span className="font-medium">{currentPromo.toFixed(2)} лв</span>
            </p>
            <p>
              Previous:{" "}
              <span className="font-medium">{previousPromo.toFixed(2)} лв</span>
            </p>
            <p className={promoDiff >= 0 ? "text-red-600" : "text-green-600"}>
              Change:{" "}
              <span className="font-medium">
                {promoDiff >= 0 ? "+" : ""}
                {promoDiff.toFixed(2)} лв ({promoPercentChange.toFixed(1)}%)
              </span>
            </p>
          </div>
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
  const [priceType, setPriceType] = useState<"retail" | "promo">("retail");

  const {
    resultSet: result,
    isLoading,
    error,
  } = useCubeQuery({
    dimensions: [
      "prices.category_group_id",
      "prices.category_group_name",
      "prices.category_id",
      "prices.category_name",
    ],
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
    measures: [
      "prices.averagePromoPrice",
      "prices.averageRetailPrice",
      "prices.count",
    ],
  });

  useEffect(() => {
    if (!result) return;
    try {
      const treemapData = processCompareData(result, priceType);
      setData(treemapData);
    } catch (err) {
      console.error("Error processing data", err);
      setData([]);
    }
  }, [result, priceType]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.toString()}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <div className="flex gap-2">
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
        <div className="flex gap-2">
          <button
            onClick={() => setPriceType("retail")}
            className={`px-4 py-2 rounded ${
              priceType === "retail"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Retail Price
          </button>
          <button
            onClick={() => setPriceType("promo")}
            className={`px-4 py-2 rounded ${
              priceType === "promo"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Promo Price
          </button>
        </div>
      </div>

      <div className="h-[600px] w-full">
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
