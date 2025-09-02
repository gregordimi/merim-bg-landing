# Deployment Guide

## 🚀 Overview

This guide covers deploying the Merim.bg application to production environments. The application is built as a static site and can be deployed to various hosting platforms.

## 🏗️ Build Process

### Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally (optional)
npm run preview
```

### Build Output
```
dist/
├── index.html           # Main entry point
├── assets/
│   ├── index-[hash].js  # Application JavaScript
│   ├── index-[hash].css # Application styles
│   └── ...              # Other assets
├── blog/               # Blog post routes
└── ...                 # Other static files
```

### Build Optimization
- **Tree shaking** - Unused code automatically removed
- **Code splitting** - Routes loaded on demand
- **Asset hashing** - Cache busting for updates
- **Minification** - Compressed JavaScript and CSS
- **Image optimization** - Optimized image formats

## 🌐 Hosting Platforms

### Vercel (Recommended)

Vercel provides excellent support for React applications with automatic deployments.

#### Setup Steps

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

3. **Vercel Configuration** (`vercel.json`)
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/blog/([^/]+)",
      "dest": "/blog/$1.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Environment Variables
```bash
# Set in Vercel dashboard or CLI
VITE_API_URL=https://api.merim.bg
VITE_ANALYTICS_ID=your-analytics-id
```

### Netlify

Netlify offers excellent static site hosting with built-in CI/CD.

#### Setup Steps

1. **Connect GitHub Repository**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (set in environment variables)

3. **Netlify Configuration** (`netlify.toml`)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/blog/*"
  to = "/blog/:splat.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### GitHub Pages

GitHub Pages provides free hosting for public repositories.

#### Setup Steps

1. **Install GitHub Pages Action**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. **Configure Repository**
   - Go to repository Settings > Pages
   - Select "GitHub Actions" as source
   - Configure custom domain if needed

### Self-Hosted Solutions

#### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "DENY";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }
}
```

```bash
# Build and run Docker container
docker build -t merim-bg .
docker run -p 80:80 merim-bg
```

## ⚙️ Environment Configuration

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.merim.bg
VITE_SITE_URL=https://merim.bg
VITE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_VERSION=1.0.0
```

### Build-time Configuration

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});
```

## 🔒 Security Considerations

### Content Security Policy

```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.merim.bg;
">
```

### Security Headers

```javascript
// For serverless functions or API routes
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
};
```

## 📊 Performance Monitoring

### Lighthouse Optimization

Target scores:
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

### Core Web Vitals

Monitor these metrics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Analytics Integration

```typescript
// utils/analytics.ts
export const trackPageView = (url: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

## 🚨 Error Monitoring

### Error Boundary

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build for production
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_ANALYTICS_ID: ${{ secrets.VITE_ANALYTICS_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 Pre-deployment Checklist

### Technical Checklist
- [ ] Build completes without errors
- [ ] All routes are accessible
- [ ] Environment variables configured
- [ ] Security headers implemented
- [ ] Performance optimized (Lighthouse score 90+)
- [ ] Error monitoring configured
- [ ] Analytics tracking implemented

### Content Checklist
- [ ] All blog posts display correctly
- [ ] Charts render properly
- [ ] Images load and display
- [ ] Links work correctly
- [ ] Meta tags configured for SEO
- [ ] Sitemap generated (if applicable)

### Testing Checklist
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified
- [ ] Dark/light theme toggle works
- [ ] Accessibility testing passed
- [ ] Performance testing completed

## 🔧 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build
   ```

2. **Routing Issues**
   - Ensure SPA fallback is configured
   - Check .htaccess or server configuration
   - Verify client-side routing setup

3. **Asset Loading Issues**
   - Check public path configuration
   - Verify asset paths in build output
   - Ensure CDN configuration is correct

4. **Environment Variable Issues**
   - Verify variables are prefixed with `VITE_`
   - Check deployment platform variable configuration
   - Ensure variables are available at build time

### Debug Commands

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for unused dependencies
npx depcheck

# Audit security vulnerabilities
npm audit

# Performance profiling
npm run build -- --profile
```

---

*This deployment guide ensures a smooth and secure production deployment of the Merim.bg application. Follow the checklist carefully to avoid common deployment issues.*