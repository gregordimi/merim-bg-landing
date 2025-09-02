# Blog System Documentation

## 📝 Overview

The Merim.bg blog system is built on MDX (Markdown + JSX), providing a powerful content management solution that combines the simplicity of Markdown with the flexibility of React components.

## 🏗️ System Architecture

### Content Flow
```
Content Creation → MDX Processing → Component Rendering → Route Generation → User Display
```

### Key Components
- **BlogMDXProvider** - Provides styled components for MDX rendering
- **Chart Component** - Interactive data visualizations
- **Blog Management** - Content discovery and routing
- **Theme Integration** - Dark/light mode support

## 📁 File Structure

```
src/
├── content/blog/           # MDX blog posts
│   ├── post-slug.mdx      # Individual posts
│   └── ...
├── components/
│   ├── BlogMDXProvider.tsx # MDX component provider
│   └── Chart.tsx          # Chart component
├── pages/
│   ├── BlogPage.tsx       # Blog listing page
│   └── BlogPostPage.tsx   # Individual post page
└── utils/
    └── blog.ts            # Blog management utilities
```

## ✍️ Creating Blog Posts

### 1. Basic Post Structure

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
date: "2025-01-15"
excerpt: "Brief description that appears in the blog listing."
---

# Your Post Title

Your content goes here with full Markdown support.

## Subheadings Work Great

You can use all standard Markdown features:

- Lists
- **Bold text**
- *Italic text*
- [Links](https://example.com)
- `Code snippets`

### Even More Subheadings

Content continues...
```

### 2. Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title displayed in listings and as page title |
| `date` | string | Yes | Publication date in YYYY-MM-DD format |
| `excerpt` | string | Yes | Brief description for blog listing cards |
| `author` | string | No | Post author (defaults to Merim.bg team) |
| `tags` | array | No | Categorization tags (future feature) |

### 3. Register Your Post

Add your post to the blog registry in `src/utils/blog.ts`:

```typescript
// Import your new post
import YourNewPost from '@/content/blog/your-post-slug.mdx';

const blogPosts: BlogPost[] = [
  {
    slug: 'your-post-slug',           // URL slug (should match filename)
    title: 'Your Post Title',        // Should match frontmatter
    date: '2025-01-15',              // Should match frontmatter  
    excerpt: 'Brief description...',  // Should match frontmatter
    content: YourNewPost             // Imported MDX component
  },
  // ... other posts
];
```

## 📊 Interactive Charts

### Available Chart Types

The blog system includes a powerful Chart component supporting multiple visualization types:

#### Bar Charts
```mdx
export const barData = [
  { name: 'Sofia', value: 125 },
  { name: 'Plovdiv', value: 110 },
  { name: 'Varna', value: 115 }
];

<Chart 
  type="bar" 
  data={barData} 
  title="Price Index by City"
  yAxisKey="value"
  color="#8884d8"
  height={300}
/>
```

#### Line Charts
```mdx
export const lineData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 102 },
  { name: 'Mar', value: 98 }
];

<Chart 
  type="line" 
  data={lineData} 
  title="Price Trends Over Time"
  yAxisKey="value"
  color="#82ca9d"
  height={300}
/>
```

#### Pie Charts
```mdx
export const pieData = [
  { name: '18-25', value: 18 },
  { name: '26-35', value: 25 },
  { name: '36-45', value: 22 }
];

<Chart 
  type="pie" 
  data={pieData} 
  title="User Distribution by Age"
  yAxisKey="value"
  height={350}
/>
```

### Chart Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | 'bar' \| 'line' \| 'pie' | Yes | Chart visualization type |
| `data` | Array<{name: string, value: number}> | Yes | Chart data |
| `title` | string | No | Chart title |
| `yAxisKey` | string | No | Data key for Y-axis (default: 'value') |
| `color` | string | No | Primary color for chart elements |
| `height` | number | No | Chart height in pixels (default: 300) |

## 🎨 Styling & Components

### Available MDX Components

The BlogMDXProvider automatically provides styled components for all standard Markdown elements:

#### Headings
```mdx
# H1 - Main Title (4xl, bold, large margins)
## H2 - Section Header (3xl, semibold, medium margins)  
### H3 - Subsection (2xl, semibold, small margins)
#### H4 - Minor Heading (xl, semibold)
##### H5 - Small Heading (lg, semibold)
###### H6 - Smallest Heading (base, semibold)
```

#### Text Elements
```mdx
Regular paragraph text with proper spacing and line height.

**Bold text** for emphasis.

*Italic text* for subtle emphasis.

`Inline code` with proper formatting.

> Blockquotes get special styling with left border and background.
```

#### Lists
```mdx
- Unordered lists have proper spacing
- Each item has good line height
- Nested lists work too
  - Subitem one
  - Subitem two

1. Ordered lists are numbered
2. They maintain proper spacing
3. And support nesting too
```

#### Code Blocks
```mdx
```javascript
// Code blocks get syntax highlighting
function example() {
  return "Hello, world!";
}
```

#### Tables
```mdx
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| More     | Data     | Here     |
```

#### Links and Images
```mdx
[External links](https://example.com) get hover effects.

![Alt text for images](path/to/image.jpg)
```

## 🔧 Advanced Features

### Custom Components

You can add custom React components to the MDX provider:

```typescript
// In BlogMDXProvider.tsx
const components = {
  Chart,
  // Add your custom component
  CustomAlert: (props: any) => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 my-6">
      {props.children}
    </div>
  ),
  // ... other components
};
```

Then use in MDX:
```mdx
<CustomAlert>
This is a custom alert component!
</CustomAlert>
```

### Data Import

You can import data from external files:

```typescript
// data/price-data.ts
export const priceData = [
  { name: 'Bread', price: 2.50 },
  { name: 'Milk', price: 1.80 }
];
```

```mdx
import { priceData } from '@/data/price-data';

<Chart type="bar" data={priceData} title="Current Prices" />
```

## 🎯 Content Guidelines

### Writing Best Practices

1. **Clear Headlines** - Use descriptive, scannable headings
2. **Short Paragraphs** - Keep paragraphs under 3-4 sentences
3. **Bullet Points** - Break up complex information
4. **Visual Elements** - Include charts, images, or callouts
5. **Call to Action** - End with clear next steps

### SEO Optimization

1. **Title Tags** - Keep titles under 60 characters
2. **Meta Descriptions** - Write compelling excerpts under 160 characters
3. **Headings Structure** - Use proper h1, h2, h3 hierarchy
4. **Internal Links** - Link to other relevant blog posts
5. **Alt Text** - Include descriptive alt text for all images

### Accessibility

1. **Heading Hierarchy** - Don't skip heading levels
2. **Link Context** - Use descriptive link text
3. **Color Contrast** - Rely on theme system colors
4. **Alt Text** - Describe image content meaningfully
5. **Keyboard Navigation** - Ensure all interactive elements are accessible

## 🚀 Performance Considerations

### Image Optimization
```mdx
<!-- Use optimized images -->
![Price trends chart](./images/price-trends-optimized.webp)

<!-- Provide alt text -->
![Alt: Bar chart showing 15% price increase across food categories](./chart.png)
```

### Chart Performance
- Keep data sets reasonable (< 100 data points for interactive charts)
- Use appropriate chart types for data size
- Consider static images for very large datasets

### Content Loading
- Posts are loaded dynamically based on route
- Large posts are code-split automatically
- Images are lazy-loaded by default

## 🔍 Troubleshooting

### Common Issues

1. **Post not appearing in blog list**
   - Check if post is registered in `blog.ts`
   - Verify frontmatter format
   - Ensure date format is YYYY-MM-DD

2. **Chart not rendering**
   - Verify data format matches expected structure
   - Check chart type is supported
   - Ensure data export is correct

3. **Styling issues**
   - Check if MDX components are applied
   - Verify BlogMDXProvider is wrapping content
   - Check for CSS conflicts

4. **Build errors**
   - Validate MDX syntax
   - Check import paths
   - Verify TypeScript types

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Verify development server** is running
3. **Test in incognito mode** to rule out cache issues
4. **Check network tab** for failed requests
5. **Validate MDX** using online MDX playground

---

*The blog system is designed to be both powerful and easy to use. For additional help, refer to the MDX documentation or reach out to the development team.*