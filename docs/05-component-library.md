# Component Library

## 🧩 Overview

The Merim.bg component library provides a collection of reusable, accessible, and well-designed React components built on top of Radix UI and styled with TailwindCSS.

## 🏗️ Architecture

### Design System Principles
- **Accessibility First** - WCAG 2.1 compliant components
- **Composition over Configuration** - Flexible and composable APIs
- **Theme Aware** - Support for light/dark themes
- **Responsive** - Mobile-first design approach
- **Type Safe** - Full TypeScript support

### Component Categories
1. **UI Primitives** - Basic building blocks (buttons, inputs, etc.)
2. **Layout Components** - Structural components (containers, grids)
3. **Content Components** - Blog and content-specific components
4. **Visualization** - Charts and data display components
5. **Navigation** - Routing and navigation components

## 🎨 Design Tokens

### Color System
```typescript
// Theme colors (CSS custom properties)
const colors = {
  // Base colors
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  
  // UI colors
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  muted: 'var(--muted)',
  accent: 'var(--accent)',
  
  // Semantic colors
  destructive: 'var(--destructive)',
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  
  // Chart colors
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
};
```

### Typography Scale
```css
/* Font families */
--font-robs: Roboto Slab, serif;     /* Primary heading font */
--font-sans: Open Sans, sans-serif;  /* Body text font */
--font-mono: Menlo, monospace;       /* Code font */

/* Text sizes (using Tailwind scale) */
text-xs    /* 12px */
text-sm    /* 14px */
text-base  /* 16px */
text-lg    /* 18px */
text-xl    /* 20px */
text-2xl   /* 24px */
text-3xl   /* 30px */
text-4xl   /* 36px */
```

### Spacing System
```css
/* Based on 0.25rem (4px) scale */
spacing: 0.25rem;  /* Base unit */

/* Common spacing values */
p-2  /* 8px */
p-4  /* 16px */
p-6  /* 24px */
p-8  /* 32px */
```

## 🔧 Core Components

### Button Component

```typescript
// components/ui/button.tsx
import { cn } from "@/utils/cs";

interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        
        // Variants
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        
        // Sizes
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-11 px-8': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

Usage:
```typescript
<Button variant="default" size="lg" onClick={handleClick}>
  Click me
</Button>
```

### Card Component

```typescript
// components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        hover && "transition-shadow hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);
```

Usage:
```typescript
<Card hover>
  <CardHeader>
    <h3 className="text-2xl font-semibold">Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>
```

## 📊 Chart Component

### Core Chart Implementation

```typescript
// components/Chart.tsx
import { BarChart, LineChart, PieChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: Array<{name: string; value: number; [key: string]: any}>;
  title?: string;
  height?: number;
  color?: string;
  yAxisKey?: string;
}

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  height = 300,
  color = '#8884d8',
  yAxisKey = 'value'
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-muted-foreground"
              fontSize={12}
            />
            <YAxis 
              className="text-muted-foreground"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey={yAxisKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
        
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" className="text-muted-foreground" fontSize={12} />
            <YAxis className="text-muted-foreground" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
            />
          </LineChart>
        );
        
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={120}
              paddingAngle={2}
              dataKey={yAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={generateColor(index)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-center text-foreground">
          {title}
        </h3>
      )}
      <div className="bg-card border border-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

### Chart Usage Examples

```typescript
// Bar chart for comparisons
<Chart 
  type="bar" 
  data={[
    { name: 'Sofia', value: 125 },
    { name: 'Plovdiv', value: 110 }
  ]} 
  title="Price Index by City" 
  color="#3b82f6"
/>

// Line chart for trends
<Chart 
  type="line" 
  data={[
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 102 }
  ]} 
  title="Price Trends" 
  color="#10b981"
/>

// Pie chart for distributions
<Chart 
  type="pie" 
  data={[
    { name: '18-25', value: 25 },
    { name: '26-35', value: 35 }
  ]} 
  title="Age Distribution"
  height={350}
/>
```

## 🎨 Theme System

### Theme Provider

```typescript
// components/theme-provider.tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Theme Toggle Component

```typescript
// components/mode-toggle.tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

const ModeToggle: React.FC = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
```

## 📱 Responsive Design

### Breakpoints
```css
/* TailwindCSS breakpoints */
sm:   640px   /* Small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Small laptops */
xl:   1280px  /* Laptops */
2xl:  1536px  /* Large screens */
```

### Responsive Patterns

```typescript
// Stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Different text sizes
<h1 className="text-2xl md:text-4xl lg:text-5xl">

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">
```

## ♿ Accessibility Features

### Focus Management
```typescript
// Visible focus rings
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Semantic HTML
```typescript
// Use proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// Landmark regions
<main role="main">
<nav role="navigation">
<aside role="complementary">
```

### Screen Reader Support
```typescript
// Descriptive labels
<button aria-label="Toggle dark mode">
  <SunIcon />
</button>

// Hidden content for screen readers
<span className="sr-only">Loading...</span>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  Status updates appear here
</div>
```

## 🔧 Utility Functions

### Class Name Utilities
```typescript
// utils/cs.tsx
import { extendTailwindMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Add custom class groups if needed
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:
```typescript
// Conditional classes
cn(
  'base-classes',
  condition && 'conditional-classes',
  { 'object-style': condition }
)

// Merge conflicting classes
cn('p-4 p-6') // Results in 'p-6'
```

## 📦 Component Export Pattern

```typescript
// components/index.ts
export { Button } from './ui/button';
export { Card, CardHeader, CardContent } from './ui/card';
export { Chart } from './Chart';
export { ThemeProvider, useTheme } from './theme-provider';
export { ModeToggle } from './mode-toggle';

// Import pattern in pages
import { Button, Card, Chart } from '@/components';
```

## 🧪 Testing Components

### Component Testing Checklist
- [ ] Renders without errors
- [ ] Props work as expected
- [ ] Accessibility attributes present
- [ ] Keyboard navigation works
- [ ] Responsive design functions
- [ ] Dark/light theme support
- [ ] Error states handled gracefully

### Manual Testing
```typescript
// Test different states
<Button disabled>Disabled Button</Button>
<Button loading>Loading Button</Button>

// Test responsive behavior
<Chart data={largeDataset} />
<Chart data={smallDataset} />

// Test theme switching
// Toggle between light/dark modes
```

---

*The component library is designed to be both powerful and consistent. All components follow the same patterns and principles, making the codebase maintainable and scalable.*