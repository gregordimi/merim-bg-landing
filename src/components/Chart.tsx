import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: ChartData[];
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  color?: string;
  colors?: string[];
  height?: number;
  width?: number;
}

const defaultColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#ffb347', '#87ceeb', '#98fb98', '#f0e68c'
];

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  color = '#8884d8',
  colors = defaultColors,
  height = 300,
  width
}) => {
  const containerStyle = {
    width: width || '100%',
    height,
    marginBottom: '1rem'
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yAxisKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={yAxisKey} stroke={color} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yAxisKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Неподдържан тип диаграма</div>;
    }
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-card">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center text-foreground">{title}</h3>
      )}
      <div style={containerStyle}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;