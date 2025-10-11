/**
 * Debug Context
 * 
 * Provides debug mode state across the application based on URL parameter
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface DebugContextValue {
  isDebugMode: boolean;
}

const DebugContext = createContext<DebugContextValue>({ isDebugMode: false });

export function useDebugMode() {
  return useContext(DebugContext);
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const isDebugMode = useMemo(() => searchParams.get('dev') === '1', [searchParams]);

  return (
    <DebugContext.Provider value={{ isDebugMode }}>
      {children}
    </DebugContext.Provider>
  );
}
