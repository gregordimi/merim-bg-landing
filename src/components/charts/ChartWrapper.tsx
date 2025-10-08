import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CubeQueryWrapper } from '@/utils/cube/components/ChartSkeleton';

interface ChartWrapperProps {
  title: string;
  description?: string;
  isLoading: boolean;
  error: any;
  progress: any;
  children: ReactNode;
}

export function ChartWrapper({ 
  title, 
  description, 
  isLoading, 
  error, 
  progress, 
  children 
}: ChartWrapperProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <CubeQueryWrapper isLoading={isLoading} error={error} progress={progress}>
          {children}
        </CubeQueryWrapper>
      </CardContent>
    </Card>
  );
}
