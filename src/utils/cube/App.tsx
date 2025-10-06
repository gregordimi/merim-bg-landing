
import cube, { PivotConfig, Query } from '@cubejs-client/core';
import { CubeProvider } from '@cubejs-client/react';
import WebSocketTransport from '@cubejs-client/ws-transport';
import { ChartViewer } from './ChartViewer.tsx';
import { extractHashConfig } from './config';
import { QueryRenderer } from './QueryRenderer.tsx';
import { ChartType, Config } from './types';
import { useState, useEffect } from 'react';

export default function Charts() {
  const {
    apiUrl,
    apiToken,
    chartType,
    useWebSockets,
    useSubscription
  } = extractHashConfig({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || '',
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || '',
    chartType: import.meta.env.VITE_CHART_TYPE as ChartType,
    websockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === 'true',
    subscription: import.meta.env.VITE_CUBE_API_USE_SUBSCRIPTION === 'true',
  } as Config);


  // State for current grouping and retailer filter
  const [grouping, setGrouping] = useState<'retailer' | 'category'>('retailer');
  const [retailerList, setRetailerList] = useState<string[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');

  // Fetch retailer names from Cube API when grouping is retailer
  useEffect(() => {
    if (grouping === 'retailer') {
      // Minimal query to get retailer names using Cube.js REST API
      const fetchRetailers = async () => {
        try {
          const response = await fetch(`${apiUrl}/load`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: apiToken
            },
            body: JSON.stringify({
              query: {
                dimensions: ['retailers.name'],
                filters: [],
                timeDimensions: [],
                measures: []
              }
            })
          });
          const data = await response.json();
          // Cube.js returns data in data[]
          const names: string[] = Array.from(new Set((data?.data || []).map((row: { [key: string]: string }) => row['retailers.name']).filter(Boolean)));
          setRetailerList(names);
        } catch (e) {
          setRetailerList([]);
        }
      };
      fetchRetailers();
    }
  }, [grouping, apiUrl, apiToken]);

  // Build configs based on state
  const retailerConfig = {
    query: {
      dimensions: ['retailers.name', 'prices.price_date.day'], // ensure both are present
      filters: [
        { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' }
      ],
      timeDimensions: [
        { dimension: 'prices.price_date', granularity: 'day' }
      ],
      measures: ['prices.averageRetailPrice']
    },
    pivotConfig: {
      x: ['prices.price_date.day'],
      y: ['retailers.name', 'measures'],
      fillMissingDates: false
    }
  };

  const categoryConfig = {
    query: {
      dimensions: ['category_groups.name'],
      filters: [
        { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' },
        { member: 'retailers.name', operator: 'set' }
      ],
      timeDimensions: [
        { dimension: 'prices.price_date', granularity: 'day' }
      ],
      measures: ['prices.averageRetailPrice']
    },
    pivotConfig: {
      x: ['prices.price_date.day'],
      y: ['category_groups.name', 'measures'],
      fillMissingDates: false
    }
  };

  const currentConfig = grouping === 'retailer' ? retailerConfig : categoryConfig;

  let transport = undefined;
  if (useWebSockets) {
    transport = new WebSocketTransport({ authorization: apiToken, apiUrl });
  }
  const cubeApi = cube(apiToken, { apiUrl, transport });

  return (
    <div className='min-h-screen w-1/2 mx-auto py-10'>
      <div className='flex gap-4 mb-6'>
        <button
          className={`px-4 py-2 rounded border ${grouping === 'retailer' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => setGrouping('retailer')}
        >
          Group by Retailer
        </button>
        <button
          className={`px-4 py-2 rounded border ${grouping === 'category' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          onClick={() => setGrouping('category')}
        >
          Group by Category
        </button>
        {grouping === 'retailer' && (
          <select
            className='ml-4 px-2 py-1 border rounded'
            value={selectedRetailer}
            onChange={e => setSelectedRetailer(e.target.value)}
          >
            <option value=''>All Retailers</option>
            {retailerList.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
      </div>
      <CubeProvider cubeApi={cubeApi}>
        <QueryRenderer query={currentConfig.query} subscribe={useSubscription}>
          {({ resultSet }) => (
            <ChartViewer
              chartType={chartType}
              resultSet={resultSet}
              pivotConfig={currentConfig.pivotConfig}
              selectedRetailer={grouping === 'retailer' ? selectedRetailer : undefined}
            />
          )}
        </QueryRenderer>
      </CubeProvider>
    </div>
  );
}
