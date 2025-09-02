# Technical Architecture

## 🏗️ System Overview

The Merim.bg application is built as a modern, performant web application using cutting-edge technologies to ensure scalability, maintainability, and excellent user experience.

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.1.1** - Latest stable version with improved performance
- **TypeScript** - Type-safe development and better developer experience
- **Vite 7.1.2** - Fast build tool and development server

### Styling & UI
- **TailwindCSS 4.1.12** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful icon library
- **CSS Custom Properties** - Theme system with dark/light mode

### Content Management
- **MDX 3.1.1** - Markdown with JSX components
- **Remark** - Markdown processing
- **Frontmatter** - Metadata extraction from content files

### Data Visualization
- **Recharts 3.1.2** - Composable charting library
- **Custom Chart Component** - Reusable visualization wrapper

### Routing & Navigation
- **React Router DOM 7.8.2** - Client-side routing
- **Dynamic routing** - Automatic blog post routing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, dialogs, etc.)
│   ├── BlogMDXProvider.tsx  # MDX component provider
│   ├── Chart.tsx       # Data visualization component
│   └── theme-provider.tsx   # Theme management
├── content/            # Content management
│   └── blog/          # MDX blog posts
├── layouts/           # Page layout components
├── pages/             # Route components
│   ├── HomePage.tsx
│   ├── BlogPage.tsx
│   ├── BlogPostPage.tsx
│   └── ...
├── utils/             # Utility functions
│   ├── blog.ts        # Blog post management
│   └── cs.tsx         # Class name utilities
├── lib/               # Third-party integrations
└── assets/            # Static assets
```

## 🔧 Build Configuration

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### Key Features:
- **Path aliases** - Clean import statements
- **MDX processing** - Frontmatter extraction
- **Hot reload** - Fast development experience

## 🎨 Design System

### Theme Architecture
- **CSS Custom Properties** - Dynamic theming
- **Light/Dark modes** - User preference support
- **Consistent spacing** - Systematic layout approach
- **Typography scale** - Harmonious text sizing

### Component Philosophy
- **Composition over inheritance** - Flexible component design
- **Accessibility first** - WCAG compliant components
- **Responsive by default** - Mobile-first approach
- **Consistent API** - Predictable component interfaces

## 📝 Content Architecture

### Blog System
```
content/blog/
├── post-slug.mdx      # Individual blog posts
└── ...

utils/blog.ts          # Blog management logic
├── getAllBlogPosts()  # Get all posts with metadata
├── getBlogPostBySlug() # Get specific post
└── types              # TypeScript definitions
```

### MDX Integration
- **Frontmatter support** - Metadata extraction
- **Component embedding** - React components in markdown
- **Automatic routing** - Dynamic URL generation
- **Type safety** - TypeScript definitions for content

## 📊 Data Flow

### Blog Content Flow
1. **Content Creation** - Author writes MDX file
2. **Metadata Extraction** - Frontmatter parsed during build
3. **Component Registration** - Post registered in blog index
4. **Route Generation** - Dynamic routes created
5. **Rendering** - MDX converted to React components

### Chart Data Flow
1. **Data Definition** - Charts defined in MDX files
2. **Component Rendering** - Chart component processes data
3. **Visualization** - Recharts renders interactive charts
4. **Responsive Layout** - Charts adapt to screen size

## 🔒 Security Considerations

### Content Security
- **Input sanitization** - Safe MDX processing
- **XSS prevention** - Secure component rendering
- **Type validation** - Runtime type checking

### Build Security
- **Dependency scanning** - Regular security audits
- **Minimal attack surface** - Static site generation
- **HTTPS enforcement** - Secure communication

## 🚀 Performance Optimizations

### Build Optimizations
- **Tree shaking** - Unused code elimination
- **Code splitting** - Lazy loading of routes
- **Asset optimization** - Image and font optimization
- **Bundle analysis** - Size monitoring

### Runtime Optimizations
- **Component memoization** - Prevent unnecessary re-renders
- **Lazy loading** - On-demand content loading
- **Efficient routing** - Client-side navigation
- **Optimized images** - Responsive image loading

## 🔄 Development Workflow

### Development Environment
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Code quality checks
```

### Code Quality
- **ESLint** - Code style enforcement
- **TypeScript** - Type checking
- **Prettier** - Code formatting (configured)
- **Git hooks** - Pre-commit validation

## 🏗️ Deployment Architecture

### Static Site Generation
- **Pre-rendered pages** - Fast initial load
- **Dynamic imports** - Optimized bundle size
- **CDN optimization** - Global content delivery
- **Progressive enhancement** - Works without JavaScript

### Hosting Requirements
- **Static hosting** - No server required
- **HTTPS support** - Security requirement
- **Custom domains** - Brand consistency
- **Global CDN** - Performance optimization

---

*This architecture ensures a scalable, maintainable, and performant application that can grow with user needs.*