import { useState } from "react";
import { ChartViewer } from "../ChartViewer";
import { QueryRenderer } from "../QueryRenderer";
import { ChartType } from "../types";
import { ChartConfig } from "../chartConfigs";
import { useRetailerList } from "../hooks/useRetailerList";
import { MultiSelect } from "./MultiSelect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartProps {
  config: ChartConfig;
  chartType: ChartType;
}

export function Chart({ config, chartType }: ChartProps) {
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  
  // Use custom query if provided in config, otherwise use default
  const { retailers, isLoading } = useRetailerList(
    config.retailerQuery ? { query: config.retailerQuery } : undefined
  );

  const showRetailerFilter =
    config.enableRetailerFilter && retailers.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{config.title}</CardTitle>
            {config.description && (
              <CardDescription>{config.description}</CardDescription>
            )}
          </div>
          {showRetailerFilter && (
            <div className="w-[400px]">
              <MultiSelect
                options={retailers}
                selected={selectedRetailers}
                onChange={setSelectedRetailers}
                placeholder={isLoading ? "Loading..." : "All Retailers"}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <QueryRenderer query={config.query} subscribe={false}>
          {({ resultSet }) => (
            <ChartViewer
              chartId={config.id}
              chartType={chartType}
              resultSet={resultSet}
              pivotConfig={config.pivotConfig}
              selectedRetailers={selectedRetailers}
              decimals={config.decimals}
              currency={config.currency}
              dateFormat={config.dateFormat}
            />
          )}
        </QueryRenderer>
      </CardContent>
    </Card>
  );
}
