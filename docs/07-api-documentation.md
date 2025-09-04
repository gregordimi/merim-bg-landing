# API Documentation

## 🔗 Overview

This document outlines the API integrations and data sources for the Merim.bg application. While the current version focuses on the frontend presentation layer, this documentation prepares for future backend integrations.

## 🏗️ API Architecture

### Current State
The application currently operates as a static site with:
- **Static content** - Blog posts stored as MDX files
- **Mock data** - Chart data embedded in blog posts
- **No external APIs** - Self-contained application

### Future API Integration

```typescript
// Planned API structure
interface APIClient {
  // Product and pricing data
  getProducts(): Promise<Product[]>;
  getProductPrices(productId: string): Promise<Price[]>;
  getPriceHistory(productId: string, timeframe: string): Promise<PriceHistory[]>;
  
  // Market data
  getMarketTrends(): Promise<MarketTrend[]>;
  getRegionalPrices(): Promise<RegionalPrice[]>;
  getCategoryStats(): Promise<CategoryStats[]>;
  
  // User features (future)
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  getUserShoppingList(userId: string): Promise<ShoppingList>;
  trackUserAction(action: UserAction): Promise<void>;
}
```

## 📊 Data Models

### Product Data

```typescript
interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  barcode?: string;
  image?: string;
  description?: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'piece';
  created_at: string;
  updated_at: string;
}
```

### Price Data

```typescript
interface Price {
  id: string;
  product_id: string;
  store_id: string;
  price: number;
  currency: 'BGN';
  date: string;
  is_promotion: boolean;
  promotion_end_date?: string;
  verified_by_user: boolean;
  created_at: string;
}
```

### Store Data

```typescript
interface Store {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  website?: string;
  working_hours: WorkingHours[];
}
```

### Market Analytics

```typescript
interface MarketTrend {
  category: string;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  price_change_percent: number;
  average_price: number;
  median_price: number;
  data_points: number;
  last_updated: string;
}

interface RegionalPrice {
  region: string;
  city: string;
  category: string;
  average_price: number;
  price_index: number; // relative to national average
  sample_size: number;
  last_updated: string;
}
```

## 🔌 API Integration Patterns

### HTTP Client Setup

```typescript
// lib/api-client.ts
class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://api.merim.bg';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }

    return response.json();
  }

  // Product methods
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const queryParams = filters ? `?${new URLSearchParams(filters as any)}` : '';
    return this.request<Product[]>(`/products${queryParams}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  // Price methods
  async getProductPrices(productId: string): Promise<Price[]> {
    return this.request<Price[]>(`/products/${productId}/prices`);
  }

  async getPriceHistory(
    productId: string, 
    timeframe: string = '30d'
  ): Promise<PriceHistory[]> {
    return this.request<PriceHistory[]>(
      `/products/${productId}/price-history?timeframe=${timeframe}`
    );
  }

  // Market data methods
  async getMarketTrends(category?: string): Promise<MarketTrend[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<MarketTrend[]>(`/market/trends${query}`);
  }

  async getRegionalPrices(): Promise<RegionalPrice[]> {
    return this.request<RegionalPrice[]>('/market/regional-prices');
  }
}

export const apiClient = new APIClient();
```

### Error Handling

```typescript
// lib/api-errors.ts
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

// Error boundary for API errors
export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    switch (error.status) {
      case 404:
        return 'Данните не са намерени';
      case 429:
        return 'Прекалено много заявки. Моля, опитайте отново по-късно';
      case 500:
        return 'Проблем със сървъра. Моля, опитайте отново';
      default:
        return 'Възникна грешка при зареждането на данните';
    }
  }
  
  return 'Неочаквана грешка';
};
```

### React Query Integration

```typescript
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  });
};

export const usePriceHistory = (productId: string, timeframe: string = '30d') => {
  return useQuery({
    queryKey: ['price-history', productId, timeframe],
    queryFn: () => apiClient.getPriceHistory(productId, timeframe),
    enabled: !!productId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
```

## 🔐 Authentication & Authorization

### User Authentication

```typescript
// Future authentication implementation
interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  subscription_tier: 'free' | 'premium';
  created_at: string;
}

interface AuthContext {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

// Auth provider implementation
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### API Key Management

```typescript
// For public API access (future)
interface APIKeyConfig {
  public_key: string;
  rate_limit: number;
  allowed_endpoints: string[];
  expires_at: string;
}

// Rate limiting headers
interface RateLimitHeaders {
  'x-ratelimit-limit': string;
  'x-ratelimit-remaining': string;
  'x-ratelimit-reset': string;
}
```

## 📈 Real-time Data Updates

### WebSocket Integration

```typescript
// lib/websocket-client.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'price_update':
        // Update price data in cache
        this.updatePriceCache(data.payload);
        break;
      case 'new_deal':
        // Show notification for new deals
        this.showDealNotification(data.payload);
        break;
    }
  }

  subscribe(channel: string, productId?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        channel,
        product_id: productId
      }));
    }
  }
}
```

## 📊 Analytics & Tracking

### Event Tracking

```typescript
// lib/analytics.ts
interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
  properties: Record<string, any>;
}

export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  // Send to analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, properties);
  }

  // Also send to internal analytics API
  apiClient.trackEvent({
    event_name: eventName,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    properties
  });
};

// Common tracking events
export const analytics = {
  productView: (productId: string) => 
    trackEvent('product_view', { product_id: productId }),
  
  priceComparison: (productIds: string[]) => 
    trackEvent('price_comparison', { product_ids: productIds }),
  
  blogPostView: (slug: string) => 
    trackEvent('blog_post_view', { post_slug: slug }),
  
  chartInteraction: (chartType: string, dataSet: string) => 
    trackEvent('chart_interaction', { chart_type: chartType, data_set: dataSet }),
};
```

## 🔧 API Utilities

### Cache Management

```typescript
// lib/cache.ts
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();
```

### Data Transformation

```typescript
// utils/data-transforms.ts
export const transformPriceData = (prices: Price[]): ChartData[] => {
  return prices.map(price => ({
    name: formatDate(price.date),
    value: price.price,
    store: price.store_name,
    isPromotion: price.is_promotion
  }));
};

export const aggregateRegionalData = (prices: RegionalPrice[]): ChartData[] => {
  return prices.map(regional => ({
    name: regional.city,
    value: regional.price_index,
    category: regional.category
  }));
};

export const calculateTrends = (history: PriceHistory[]): TrendData => {
  const sorted = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const current = sorted[sorted.length - 1]?.average_price || 0;
  const previous = sorted[sorted.length - 2]?.average_price || 0;
  
  return {
    current_price: current,
    previous_price: previous,
    change_percent: ((current - previous) / previous) * 100,
    trend_direction: current > previous ? 'up' : 'down'
  };
};
```

## 🚨 Error Monitoring

### API Error Tracking

```typescript
// lib/error-monitoring.ts
export const reportAPIError = (error: APIError, context: any = {}) => {
  // Send to error monitoring service (e.g., Sentry)
  console.error('API Error:', {
    status: error.status,
    message: error.message,
    response: error.response,
    context,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    url: window.location.href
  });

  // Also track in analytics
  trackEvent('api_error', {
    error_status: error.status,
    error_message: error.message,
    endpoint: context.endpoint || 'unknown'
  });
};
```

---

*This API documentation serves as a blueprint for future backend integrations. The current static implementation provides a solid foundation that can be enhanced with real-time data as the platform grows.*