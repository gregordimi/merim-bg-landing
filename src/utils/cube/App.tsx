
import cube from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import WebSocketTransport from '@cubejs-client/ws-transport';
import { extractHashConfig } from './config';
import { ChartType } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RetailerChart } from './charts/RetailerChart';
import { CategoryChart } from './charts/CategoryChart';

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  chartType: ChartType;
  useWebSockets?: boolean;
}

export default function Charts() {
  const {
    apiUrl,
    apiToken,
    chartType,
    useWebSockets
  } = extractHashConfig<AppConfig>({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || '',
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || '',
    chartType: import.meta.env.VITE_CHART_TYPE as ChartType,
    websockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === 'true',
  });

  let transport = undefined;
  if (useWebSockets) {
    transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
  }
  const cubeApi = cube(apiToken, { apiUrl, transport });

  return (
    <div className='min-h-screen w-1/2 mx-auto py-10'>
      <CubeProvider cubeApi={cubeApi}>
        <Tabs defaultValue="retailer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="retailer">Group by Retailer</TabsTrigger>
            <TabsTrigger value="category">Group by Category</TabsTrigger>
          </TabsList>
                  <TabsContent value="retailer">
          <RetailerChart
            apiUrl={apiUrl}
            apiToken={apiToken}
            chartType={chartType}
          />
        </TabsContent>
        <TabsContent value="category">
          <CategoryChart
            apiUrl={apiUrl}
            apiToken={apiToken}
            chartType={chartType}
          />
        </TabsContent>
        </Tabs>
      </CubeProvider>
    </div>
  );
}
