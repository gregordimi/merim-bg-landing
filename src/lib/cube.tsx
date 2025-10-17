import { useMemo } from "react";
import cube from "@cubejs-client/core";
import WebSocketTransport from "@cubejs-client/ws-transport";
import { CubeProvider as BaseCubeProvider } from "@cubejs-client/react";
import { extractHashConfig } from "@/utils/cube/config";

interface AppConfig extends Record<string, unknown> {
  apiUrl: string;
  apiToken: string;
  useWebSockets?: boolean;
}

export function useCubeApi() {
  const { apiUrl, apiToken, useWebSockets } = extractHashConfig<AppConfig>({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || "",
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || "",
    useWebSockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === "true",
  });

  const cubeApi = useMemo(() => {
    let transport = undefined;
    if (useWebSockets) {
      transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
    }
    return cube(apiToken, {
      apiUrl,
      transport,
    });
  }, [apiToken, apiUrl, useWebSockets]);

  return cubeApi;
}

interface CubeProviderProps {
  children: React.ReactNode;
}

export function CubeProvider({ children }: CubeProviderProps) {
  const cubeApi = useCubeApi();
  
  return (
    <BaseCubeProvider cubeApi={cubeApi}>
      {children}
    </BaseCubeProvider>
  );
}