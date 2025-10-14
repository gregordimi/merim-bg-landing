import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlobalFilters } from "@/utils/cube/filterUtils";

interface ChartWrapperDebugProps {
  query: any;
  resultSet: any;
  displayData: any[] | null | undefined;
  globalFilters: GlobalFilters;
}

export function ChartWrapperDebug({
  query,
  resultSet,
  displayData,
  globalFilters,
}: ChartWrapperDebugProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  return (
    <div className="space-y-4">
      {/* Debug Controls */}
      <div className="mb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          {showDebugInfo ? "Hide" : "Show"} Debug Info
        </Button>
        {displayData && (
          <Badge variant="secondary">{displayData.length} data points</Badge>
        )}
      </div>

      {/* Debug Information */}
      {showDebugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Query Information */}
              <div>
                <h4 className="font-semibold mb-2">Query:</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(query, null, 2)}
                </pre>
              </div>

              {/* Raw Data Preview */}
              {resultSet && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Raw Data (first 10 rows):
                  </h4>
                  <div className="bg-muted p-3 rounded text-sm overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          {resultSet.tableColumns().map((column: any) => (
                            <th
                              key={column.key}
                              className="text-left p-1 font-semibold"
                            >
                              {column.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultSet
                          .tablePivot()
                          .slice(0, 10)
                          .map((row: any, index: number) => (
                            <tr key={index} className="border-b">
                              {resultSet.tableColumns().map((column: any) => (
                                <td key={column.key} className="p-1">
                                  {row[column.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Processed Chart Data */}
              {displayData && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Processed Chart Data (first 10 points):
                  </h4>
                  <div className="bg-muted p-3 rounded text-sm overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1 font-semibold">
                            Data Point
                          </th>
                          <th className="text-left p-1 font-semibold">
                            Values
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayData.slice(0, 10).map((point, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-1">{index + 1}</td>
                            <td className="p-1">
                              <pre className="text-xs">
                                {JSON.stringify(point, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Filter Information */}
              <div>
                <h4 className="font-semibold mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Retailers:{" "}
                    {(globalFilters.retailers || []).length > 0
                      ? (globalFilters.retailers || []).length
                      : "All"}
                    {(globalFilters.retailers || []).length > 0 &&
                      ` (${(globalFilters.retailers || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Settlements:{" "}
                    {(globalFilters.settlements || []).length > 0
                      ? (globalFilters.settlements || []).length
                      : "All"}
                    {(globalFilters.settlements || []).length > 0 &&
                      ` (${(globalFilters.settlements || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Municipalities:{" "}
                    {(globalFilters.municipalities || []).length > 0
                      ? (globalFilters.municipalities || []).length
                      : "All"}
                    {(globalFilters.municipalities || []).length > 0 &&
                      ` (${(globalFilters.municipalities || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Categories:{" "}
                    {(globalFilters.categories || []).length > 0
                      ? (globalFilters.categories || []).length
                      : "All"}
                    {(globalFilters.categories || []).length > 0 &&
                      ` (${(globalFilters.categories || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Date: {globalFilters.datePreset ?? "last7days"}
                  </Badge>
                  <Badge variant="outline">
                    Granularity: {globalFilters.granularity ?? "day"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
