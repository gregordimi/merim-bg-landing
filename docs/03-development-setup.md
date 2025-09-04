# Development Setup

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 8+ or **pnpm** 8+ (preferred)
- **Git** for version control
- **VS Code** (recommended editor)

### Initial Setup

1. **Clone the repository**
```bash
git clone https://github.com/gregordimi/merim-bg-landing.git
cd merim-bg-landing
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Start development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Open your browser**
Visit `http://localhost:5173`

## 📋 Development Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run preview      # Preview production build locally

# Building
npm run build        # Build for production
npm run lint         # Run ESLint checks

# Utilities
npm run type-check   # TypeScript type checking
```

## 🛠️ Development Environment

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "unifiedjs.vscode-mdx"
  ]
}
```

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^'\"`,]*)(?:'|\"|`)"]
  ]
}
```

## 📁 Project Structure Deep Dive

### Core Directories
```
src/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components
│   ├── BlogMDXProvider.tsx
│   ├── Chart.tsx
│   └── theme-provider.tsx
├── content/            # Content files
│   └── blog/          # MDX blog posts
├── layouts/           # Page layouts
├── pages/             # Route components
├── utils/             # Utility functions
├── lib/               # Third-party configurations
└── assets/            # Static assets
```

### Configuration Files
```
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite build configuration
├── eslint.config.js   # ESLint rules
├── components.json    # Shadcn/ui configuration
└── tailwind.config.js # TailwindCSS configuration
```

## 🧩 Component Development

### Creating New Components

1. **Create component file**
```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, children }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
};

export default MyComponent;
```

2. **Export from index**
```typescript
// src/components/index.ts
export { default as MyComponent } from './MyComponent';
```

3. **Use in pages**
```typescript
import { MyComponent } from '@/components';

function SomePage() {
  return (
    <MyComponent title="Hello World">
      <p>Component content</p>
    </MyComponent>
  );
}
```

### Component Guidelines
- Use TypeScript interfaces for props
- Follow React functional component patterns
- Use TailwindCSS for styling
- Make components responsive by default
- Include proper accessibility attributes

## 📝 Content Development

### Adding Blog Posts

1. **Create MDX file**
```bash
# Create new file in src/content/blog/
touch src/content/blog/my-new-post.mdx
```

2. **Add frontmatter and content**
```mdx
---
title: "My New Blog Post"
date: "2025-01-15"
excerpt: "A brief description of the post content."
---

# My New Blog Post

Content goes here with **markdown** formatting.

## Interactive Charts

You can include charts:

export const chartData = [
  { name: 'Category A', value: 100 },
  { name: 'Category B', value: 200 }
];

<Chart type="bar" data={chartData} title="Sample Chart" />
```

3. **Register the post**
```typescript
// src/utils/blog.ts
import MyNewPost from '@/content/blog/my-new-post.mdx';

const blogPosts: BlogPost[] = [
  {
    slug: 'my-new-post',
    title: 'My New Blog Post',
    date: '2025-01-15',
    excerpt: 'A brief description of the post content.',
    content: MyNewPost
  },
  // ... other posts
];
```

### Content Guidelines
- Use semantic markdown headings (h1, h2, h3)
- Include alt text for images
- Write descriptive excerpts
- Use consistent date formatting
- Keep file names URL-friendly (lowercase, hyphens)

## 🎨 Styling Guidelines

### TailwindCSS Usage
```typescript
// Good - utility classes
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">

// Good - conditional classes
<button className={cn(
  "px-4 py-2 rounded-lg transition-colors",
  isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
)}>

// Avoid - inline styles
<div style={{ padding: '16px', backgroundColor: 'white' }}>
```

### Theme Integration
```typescript
// Use CSS custom properties for colors
<div className="text-foreground bg-background border-border">

// Support dark mode
<div className="bg-white dark:bg-gray-900">
```

## 🔍 Debugging & Troubleshooting

### Common Issues

1. **Import path errors**
```bash
# Solution: Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. **MDX not rendering**
```bash
# Check if post is registered in blog.ts
# Verify frontmatter format
# Ensure MDX syntax is correct
```

3. **Build failures**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### Development Tools

1. **React Developer Tools**
   - Install browser extension
   - Inspect component props and state

2. **TypeScript Compiler**
```bash
# Check types without building
npx tsc --noEmit
```

3. **Bundle Analysis**
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] All pages load without errors
- [ ] Responsive design works on mobile
- [ ] Dark/light theme toggle functions
- [ ] Blog posts render correctly
- [ ] Charts display and are interactive
- [ ] Navigation works properly
- [ ] Performance is acceptable

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment Preparation

### Pre-deployment Checklist
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without errors
- [ ] Build completes successfully
- [ ] All routes accessible
- [ ] Performance optimized
- [ ] SEO meta tags configured

### Build Optimization
```bash
# Production build
npm run build

# Check build size
ls -la dist/

# Test production build locally
npm run preview
```

---

*This guide should get you up and running with Merim.bg development. For specific questions, refer to other documentation sections or the project maintainers.*