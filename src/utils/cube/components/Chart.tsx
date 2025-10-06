import { useState } from "react";
import { ChartViewer } from "../ChartViewer";
import { QueryRenderer } from "../QueryRenderer";
import { ChartType } from "../types";
import { ChartConfig } from "../chartConfigs";
import { useRetailerList } from "../hooks/useRetailerList";
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
  const [selectedRetailer, setSelectedRetailer] = useState<string>("");
  const { retailers } = useRetailerList();

  const showRetailerFilter =
    config.enableRetailerFilter && retailers.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{config.title}</CardTitle>
            {config.description && (
              <CardDescription>{config.description}</CardDescription>
            )}
          </div>
          {showRetailerFilter && (
            <select
              className="px-3 py-2 border rounded-md bg-background text-sm"
              value={selectedRetailer}
              onChange={(e) => setSelectedRetailer(e.target.value)}
            >
              <option value="">All Retailers</option>
              {retailers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
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
              selectedRetailer={selectedRetailer || undefined}
            />
          )}
        </QueryRenderer>
      </CardContent>
    </Card>
  );
}
