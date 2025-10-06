import { useState, useMemo } from "react";
import { ChartViewer } from "../ChartViewer";
import { QueryRenderer } from "../QueryRenderer";
import { ChartType } from "../types";
import { ChartConfig } from "../chartConfigs";
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
        </div>
      </CardHeader>
      <CardContent>
        <QueryRenderer query={config.query}>
          {({ resultSet }) => {
            const retailers = config.enableRetailerFilter
              ? Array.from(
                  new Set(
                    resultSet
                      .tablePivot()
                      .map((row: any) => row["retailers.name"] as string)
                      .filter(Boolean)
                  )
                ).sort()
              : [];

            return (
              <>
                {config.enableRetailerFilter && retailers.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <MultiSelect
                      options={retailers}
                      selected={selectedRetailers}
                      onChange={setSelectedRetailers}
                      placeholder="All Retailers"
                      className="w-[300px]"
                    />
                  </div>
                )}
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
              </>
            );
          }}
        </QueryRenderer>
      </CardContent>
    </Card>
  );
}
