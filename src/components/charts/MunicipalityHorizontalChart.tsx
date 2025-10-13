import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '../../config/ChartWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MunicipalityHorizontalChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  municipality: string;
  retailPrice: number;
  promoPrice: number;
}

function processMunicipalityData(resultSet: any, limit: number = 15) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    return pivot
      .map((row: any) => ({
        municipality: row["prices.municipality_name"],
        retailPrice: Number(row["prices.averageRetailPrice"] || 0),
        promoPrice: Number(row["prices.averagePromoPrice"] || 0),
      }))
      .sort((a, b) => b.retailPrice - a.retailPrice)
      .slice(0, limit);
  } catch (error) {
    console.error("Error processing municipality data:", error);
    return [];
  }
}

export function MunicipalityHorizontalChart({ globalFilters }: MunicipalityHorizontalChartProps) {
  const query = useMemo(() => {
    const query = buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters,
      ["prices.municipality_name"] // Always include municipalities dimension
    );
    
    // Remove time dimensions for aggregate query to improve performance
    query.timeDimensions = [];
    
    return query;
  }, [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
    ],
    'municipality-horizontal-chart'
  );

  const data = useMemo(() => {
    return processMunicipalityData(resultSet, 15);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Top 15 Municipalities - Horizontal View"
      description="Compare retail and promotional prices across municipalities (horizontal bars)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="custom"
      height="xl"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    >
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 150, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `${Number(value).toFixed(2)} лв`} 
            />
            <YAxis 
              type="category" 
              dataKey="municipality" 
              width={130}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const label = name === "retailPrice" ? "Retail Price" : "Promo Price";
                return [`${Number(value).toFixed(2)} лв`, label];
              }}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            <Bar dataKey="retailPrice" fill="#0088FE" name="Retail Price" radius={[0, 4, 4, 0]} />
            <Bar dataKey="promoPrice" fill="#00C49F" name="Promo Price" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      )}
    </ChartWrapper>
  );
}