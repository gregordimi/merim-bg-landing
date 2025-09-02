# Merim.bg - Smart Price Comparison Platform

**Merim.bg** is a revolutionary price comparison platform designed to empower Bulgarian consumers with transparent pricing information and intelligent shopping tools.

![Merim.bg Screenshot](https://github.com/user-attachments/assets/8e4cf97c-4d9d-4321-a38e-496645cefc7e)

## 🎯 Mission

To democratize access to pricing information and help consumers make informed purchasing decisions through technology and data transparency.

## ✨ Key Features

### 🛒 Smart Shopping Experience
- **Price Comparison Engine** - Real-time price tracking across major Bulgarian retailers
- **Shopping List Optimization** - AI-powered recommendations for maximum savings
- **Deal Alerts** - Notifications for price drops and special offers
- **Budget Planning** - Tools to manage household expenses effectively

### 📊 Data Analytics & Insights
- **Interactive Charts** - Dynamic data visualizations using Recharts
- **Market Trend Analysis** - Price patterns and predictions
- **Regional Comparisons** - Price differences across Bulgarian cities
- **Inflation Tracking** - Real-time market analysis

### 📝 Content Management System
- **Dynamic Blog** - MDX-powered content with interactive elements
- **Educational Content** - Shopping tips, market analysis, and consumer guides
- **Community Updates** - Latest news and platform developments

### 🎨 Modern User Experience
- **Responsive Design** - Optimized for mobile and desktop
- **Dark/Light Theme** - User preference support
- **Accessibility First** - WCAG 2.1 compliant components
- **Fast Performance** - Built with modern web technologies

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Vite 7.1.2** - Fast build tool and development server
- **TailwindCSS 4.1.12** - Utility-first CSS framework

### Content & Data Visualization
- **MDX 3.1.1** - Markdown with JSX components for blog posts
- **Recharts 3.1.2** - Interactive charts and data visualization
- **Remark** - Markdown processing with frontmatter support

### UI Components
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful icon library
- **Custom Design System** - Consistent, theme-aware components

### Routing & Navigation
- **React Router DOM 7.8.2** - Client-side routing
- **Dynamic Blog Routing** - Automatic post discovery and routing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 8+ or pnpm 8+ (preferred)

### Installation

```bash
# Clone the repository
git clone https://github.com/gregordimi/merim-bg-landing.git
cd merim-bg-landing

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser
# Visit http://localhost:5173
```

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint checks
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── BlogMDXProvider.tsx  # MDX content renderer
│   ├── Chart.tsx       # Data visualization component
│   └── theme-provider.tsx   # Theme management
├── content/            # Content management
│   └── blog/          # MDX blog posts
├── layouts/           # Page layout components
├── pages/             # Route components
│   ├── HomePage.tsx   # Landing page
│   ├── BlogPage.tsx   # Blog listing
│   └── BlogPostPage.tsx    # Individual blog posts
├── utils/             # Utility functions
│   ├── blog.ts        # Blog post management
│   └── cs.tsx         # Class name utilities
└── assets/            # Static assets
```

## 📝 Blog System

### Creating Blog Posts

1. **Create MDX file** in `src/content/blog/`
2. **Add frontmatter** with title, date, and excerpt
3. **Register post** in `src/utils/blog.ts`
4. **Content automatically appears** on the blog page

Example blog post:
```mdx
---
title: "Market Analysis: Price Trends for 2025"
date: "2025-01-15"
excerpt: "Detailed analysis of price trends and predictions for Bulgarian market."
---

# Market Analysis: Price Trends for 2025

Content with **markdown** formatting and interactive charts.

## Price Trends by Category

export const chartData = [
  { name: 'Food', value: 15.2 },
  { name: 'Electronics', value: 8.7 }
];

<Chart type="bar" data={chartData} title="Price Increase by Category (%)" />
```

### Interactive Charts

The blog system supports multiple chart types:

```mdx
# Bar Charts - for comparisons
<Chart type="bar" data={data} title="Price Comparison" />

# Line Charts - for trends over time
<Chart type="line" data={data} title="Price Trends" />

# Pie Charts - for distributions
<Chart type="pie" data={data} title="Market Share" />
```

## 🎨 Design System

### Theme Support
- **CSS Custom Properties** - Dynamic theming
- **Light/Dark Modes** - Automatic system preference detection
- **Consistent Colors** - Semantic color system
- **Typography Scale** - Harmonious text sizing

### Component Philosophy
- **Accessibility First** - WCAG 2.1 compliant
- **Composition over Configuration** - Flexible APIs
- **Responsive by Default** - Mobile-first approach
- **Type Safety** - Full TypeScript support

## 📊 Interactive Data Visualization

### Chart Features
- **Responsive Design** - Adapts to all screen sizes
- **Theme Integration** - Matches light/dark mode
- **Interactive Tooltips** - Detailed data on hover
- **Customizable Styling** - Consistent with design system

### Supported Visualizations
- Bar charts for price comparisons
- Line charts for trend analysis
- Pie charts for market distributions
- Custom styling and color schemes

## 🌍 Deployment

### Hosting Options
- **Vercel** (Recommended) - Automatic deployments from Git
- **Netlify** - Static site hosting with CI/CD
- **GitHub Pages** - Free hosting for public repositories
- **Self-hosted** - Docker containers with Nginx

### Build Process
```bash
npm run build    # Creates optimized production build
npm run preview  # Test production build locally
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- [Project Overview](./docs/01-project-overview.md) - Mission, vision, and goals
- [Technical Architecture](./docs/02-technical-architecture.md) - System design and technologies
- [Development Setup](./docs/03-development-setup.md) - Getting started guide
- [Blog System](./docs/04-blog-system.md) - Content management documentation
- [Component Library](./docs/05-component-library.md) - UI component documentation
- [Deployment Guide](./docs/06-deployment.md) - Production deployment instructions
- [API Documentation](./docs/07-api-documentation.md) - Backend integration planning
- [Content Guidelines](./docs/08-content-guidelines.md) - Writing and styling standards

## 🤝 Contributing

We welcome contributions to improve Merim.bg! Please read our documentation before contributing:

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow code standards** (ESLint, TypeScript)
4. **Test your changes** thoroughly
5. **Submit pull request** with clear description

### Development Guidelines
- Follow TypeScript best practices
- Use TailwindCSS for styling
- Write accessible components
- Include proper documentation
- Test on multiple devices

## 📄 License

Copyright © 2025 Gregor Dimitrov. All rights reserved.

This project is proprietary software. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited without explicit written permission from the copyright holder.

## 🔗 Links

- **Live Application**: [https://merim.bg](https://merim.bg)
- **Documentation**: [./docs/README.md](./docs/README.md)
- **Blog Guide**: [BLOG_GUIDE.md](./BLOG_GUIDE.md)

## 📞 Contact

For questions, feedback, or collaboration opportunities:

- **Project Maintainer**: Gregor Dimitrov
- **GitHub**: [@gregordimi](https://github.com/gregordimi)
- **Email**: [Contact through GitHub]

---

**Merim.bg** - Empowering Bulgarian consumers through price transparency and smart shopping technology.
