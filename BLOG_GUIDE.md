# Blog Content Management

This guide explains how to add and manage blog content in the Merim.bg application.

## Adding New Blog Posts

To add a new blog post, follow these steps:

### 1. Create a new MDX file

Create a new `.mdx` file in the `src/content/blog/` directory. For example:
```
src/content/blog/my-new-post.mdx
```

### 2. Add frontmatter

Start your MDX file with frontmatter containing the post metadata:

```mdx
---
title: "Your Blog Post Title"
date: "2025-01-20"
excerpt: "A brief description of your blog post content."
---

# Your Blog Post Title

Your blog content goes here...
```

### 3. Register the post

Add your new blog post to the `src/utils/blog.ts` file:

1. Import the new MDX file at the top:
```typescript
import myNewPostBlog from '/src/content/blog/my-new-post.mdx';
```

2. Add it to the `blogPosts` array:
```typescript
{
  slug: 'my-new-post',
  title: 'Your Blog Post Title',
  date: '2025-01-20',
  excerpt: 'A brief description of your blog post content.',
  content: myNewPostBlog
}
```

### 4. Available Components

Your MDX files automatically have access to these components:

#### Chart Component
Create interactive charts in your blog posts:

```mdx
export const data = [
  { name: 'Item 1', value: 100 },
  { name: 'Item 2', value: 200 }
];

<Chart 
  type="bar" 
  data={data} 
  title="My Chart Title"
  height={300}
/>
```

**Chart Types:**
- `bar` - Bar chart
- `line` - Line chart  
- `pie` - Pie chart

**Chart Props:**
- `type` - Chart type (required)
- `data` - Array of data objects (required)
- `title` - Chart title (optional)
- `height` - Chart height in pixels (default: 300)
- `color` - Primary color (default: '#8884d8')
- `colors` - Array of colors for pie charts

#### Styled HTML Elements

All standard HTML elements are automatically styled:
- Headers (`h1`, `h2`, `h3`)
- Paragraphs (`p`)
- Lists (`ul`, `ol`, `li`)
- Tables (`table`, `th`, `td`)
- Code blocks (`code`, `pre`)
- Blockquotes (`blockquote`)

### 5. Example Blog Post Structure

```mdx
---
title: "How to Optimize Your Shopping"
date: "2025-01-20"
excerpt: "Learn the best practices for smart shopping with data analysis."
---

import Chart from '../../components/Chart';

# How to Optimize Your Shopping

This post will show you data-driven insights for better shopping decisions.

## Price Trends

export const priceData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 110 },
  { name: 'Mar', value: 95 }
];

<Chart 
  type="line" 
  data={priceData} 
  title="Monthly Price Trends"
  color="#82ca9d"
/>

## Key Insights

Based on our analysis:
- Best time to shop: Tuesday mornings
- Avoid weekend shopping for better prices
- Use the Merim.bg app to track deals

### Tips and Tricks

1. **Plan ahead** - Make a shopping list
2. **Compare prices** - Use our app
3. **Track trends** - Monitor price changes

> Remember: Smart shopping saves money!
```

## File Organization

```
src/
├── content/
│   └── blog/
│       ├── spestete-pari.mdx
│       ├── statistika-i-danni.mdx
│       └── your-new-post.mdx
├── components/
│   ├── Chart.tsx
│   └── BlogMDXProvider.tsx
├── pages/
│   ├── BlogPage.tsx
│   └── BlogPostPage.tsx
└── utils/
    └── blog.ts
```

## URL Structure

Blog posts are accessible at:
- Blog listing: `/blog`
- Individual posts: `/blog/{slug}`

Where `{slug}` is the filename without the `.mdx` extension.

## Best Practices

1. **Use descriptive slugs** - Choose meaningful filenames
2. **Add excerpts** - Provide clear post summaries
3. **Use proper dates** - Format as YYYY-MM-DD
4. **Optimize images** - Keep file sizes reasonable
5. **Test locally** - Run `npm run dev` to preview changes

## Chart Data Examples

### Bar Chart
```javascript
const categoryData = [
  { name: 'Groceries', value: 45 },
  { name: 'Electronics', value: 30 },
  { name: 'Clothing', value: 25 }
];
```

### Line Chart  
```javascript
const timeSeriesData = [
  { name: 'Week 1', value: 100 },
  { name: 'Week 2', value: 120 },
  { name: 'Week 3', value: 110 },
  { name: 'Week 4', value: 130 }
];
```

### Pie Chart
```javascript
const distributionData = [
  { name: 'Sofia', value: 40 },
  { name: 'Plovdiv', value: 25 },
  { name: 'Varna', value: 20 },
  { name: 'Burgas', value: 15 }
];
```