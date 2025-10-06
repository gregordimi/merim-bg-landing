import { useMemo, useState } from "react";
import cube from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { extractHashConfig } from "./config";
import { ChartType } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chart } from "./components/Chart";
import { CHART_CONFIGS } from "./chartConfigs";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  chartType: ChartType;
  useWebSockets?: boolean;
}

export default function Charts() {
  const { apiUrl, apiToken, chartType, useWebSockets } =
    extractHashConfig<AppConfig>({
      apiUrl: import.meta.env.VITE_CUBE_API_URL || "",
      apiToken: import.meta.env.VITE_CUBE_API_TOKEN || "",
      chartType: (import.meta.env.VITE_CHART_TYPE as ChartType) || "line",
      websockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === "true",
    });

  const [activeTab, setActiveTab] = useState("retailer");

  const cubeApi = useMemo(() => {
    let transport = undefined;
    if (useWebSockets) {
      transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
    }
    return cube(apiToken, { apiUrl, transport });
  }, [apiToken, apiUrl, useWebSockets]);

  return (
    <div className="h-full w-full">
      <CubeProvider cubeApi={cubeApi}>
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b bg-muted/30">
          <h1 className="text-3xl font-bold mb-2">Price Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track and compare retail prices across categories and retailers
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="retailer">By Retailer</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
            </TabsList>

            <div className="space-y-6">
              <div
                style={{ display: activeTab === "retailer" ? "block" : "none" }}
              >
                <Chart config={CHART_CONFIGS.retailer} chartType={chartType} />
              </div>
              <div
                style={{ display: activeTab === "category" ? "block" : "none" }}
              >
                <Chart config={CHART_CONFIGS.category} chartType={chartType} />
              </div>
            </div>
          </Tabs>
        </div>
      </CubeProvider>
    </div>
  );
}
