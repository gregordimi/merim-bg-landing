# HTML Blog Posts Guide

This guide explains how to create and use HTML blog posts in your blog system alongside MDX files.

## Overview

Your blog system now supports both MDX and HTML formats:
- **MDX files**: Great for markdown content with React components
- **HTML files**: Perfect for complex layouts, custom styling, and interactive elements

## Creating HTML Blog Posts

### 1. Create the HTML file

Place your HTML files in the `public/content/blog/` directory:

```
public/content/blog/
├── my-html-post.html
├── another-post.html
└── sample-html-post.html
```

### 2. HTML Structure

Your HTML files should be complete HTML documents:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Blog Post Title</title>
    <style>
        /* Your custom styles here */
    </style>
</head>
<body>
    <h1>Your Blog Post Title</h1>
    <p>Your content here...</p>
    
    <script>
        // Your JavaScript here
    </script>
</body>
</html>
```

### 3. Register the HTML post

In `src/utils/blog.ts`, add your HTML blog post:

```typescript
// Create the HTML blog post component
const myHtmlBlog = createHtmlBlogPost('/content/blog/my-html-post.html');

// Add to the blogPosts array
{
  slug: "my-html-post",
  title: "My HTML Blog Post",
  date: "2025-01-01",
  excerpt: "Description of your HTML blog post.",
  content: myHtmlBlog,
  type: 'html',
}
```

## Features Available in HTML Posts

### 1. Custom Styling
- Full CSS control with `<style>` tags
- Inline styles
- CSS Grid and Flexbox layouts
- Animations and transitions

### 2. Interactive Elements
- JavaScript functionality
- Forms and input elements
- Calculators and tools
- Dynamic content updates

### 3. Rich Media
- Images and videos
- Embedded content (maps, social media)
- Custom graphics and charts

### 4. Advanced Layouts
- Multi-column layouts
- Card-based designs
- Complex table structures
- Custom components

## Best Practices

### 1. Responsive Design
Always include responsive styles:

```css
@media (max-width: 768px) {
    .your-element {
        /* Mobile styles */
    }
}
```

### 2. Accessibility
- Use semantic HTML elements
- Include alt text for images
- Ensure proper heading hierarchy
- Add ARIA labels where needed

### 3. Performance
- Optimize images
- Minimize inline CSS and JavaScript
- Use efficient selectors
- Avoid heavy external dependencies

### 4. Consistency
- Follow your site's design system
- Use consistent typography
- Maintain brand colors and spacing
- Test across different devices

## Examples

### Simple HTML Post
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Simple Post</title>
</head>
<body>
    <h1>Simple HTML Post</h1>
    <p>This is a simple HTML blog post with basic content.</p>
</body>
</html>
```

### Interactive HTML Post
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Interactive Post</title>
    <style>
        .calculator { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px; 
        }
    </style>
</head>
<body>
    <h1>Price Calculator</h1>
    
    <div class="calculator">
        <input type="number" id="price" placeholder="Enter price">
        <button onclick="calculate()">Calculate Savings</button>
        <div id="result"></div>
    </div>
    
    <script>
        function calculate() {
            const price = document.getElementById('price').value;
            const savings = price * 0.15;
            document.getElementById('result').innerHTML = 
                `You could save: ${savings.toFixed(2)} лв`;
        }
    </script>
</body>
</html>
```

## When to Use HTML vs MDX

### Use HTML when you need:
- Complex custom layouts
- Interactive JavaScript elements
- Specific styling requirements
- Integration with external libraries
- Custom forms or calculators

### Use MDX when you need:
- Simple markdown content
- React component integration
- Consistent blog styling
- Easy content editing
- Standard blog post structure

## Troubleshooting

### Common Issues:

1. **HTML file not loading**
   - Check file path in `createHtmlBlogPost()`
   - Ensure file is in `public/content/blog/`
   - Verify file permissions

2. **Styles not applying**
   - Check CSS syntax
   - Ensure styles are in `<style>` tags
   - Test with browser developer tools

3. **JavaScript not working**
   - Check console for errors
   - Ensure scripts are in `<script>` tags
   - Verify DOM elements exist

4. **Responsive issues**
   - Add viewport meta tag
   - Test on different screen sizes
   - Use relative units (%, em, rem)

## File Organization

Recommended structure:
```
public/content/blog/
├── html/
│   ├── interactive-posts/
│   │   ├── calculator.html
│   │   └── comparison-tool.html
│   └── rich-content/
│       ├── infographic.html
│       └── multimedia.html
└── templates/
    ├── basic-template.html
    └── interactive-template.html
```

This organization helps maintain your HTML blog posts and makes them easier to manage.