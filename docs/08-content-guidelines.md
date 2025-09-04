# Content Guidelines

## ✍️ Writing Standards

### Voice & Tone

**Brand Voice**: Friendly, knowledgeable, and empowering
- Use clear, accessible language that all users can understand
- Be helpful and solution-oriented
- Show empathy for users' financial concerns
- Maintain optimism while being realistic about challenges

**Tone Guidelines**:
- **Informative** - Provide valuable, actionable insights
- **Encouraging** - Help users feel confident about their decisions
- **Trustworthy** - Back claims with data and sources
- **Conversational** - Write as if speaking to a friend

### Content Structure

#### Blog Post Format
```
1. Compelling headline (50-60 characters)
2. Brief excerpt/summary (150-160 characters)
3. Introduction (1-2 paragraphs)
4. Main content with clear sections
5. Data visualizations (where relevant)
6. Key takeaways/actionable tips
7. Conclusion with next steps
```

#### Heading Hierarchy
```
# H1 - Main title (only one per post)
## H2 - Major sections
### H3 - Subsections
#### H4 - Minor points
```

### Language Guidelines

#### Bulgarian Language Standards
- Use contemporary Bulgarian without excessive anglicisms
- Write numbers and dates in Bulgarian format
- Use Bulgarian punctuation and grammar rules
- Include regional variations when discussing prices

#### Technical Terms
- Explain technical concepts in simple terms
- Use consistent terminology throughout content
- Create a glossary for complex terms
- Provide context for abbreviations

## 📊 Data Visualization Guidelines

### Chart Selection

**Bar Charts** - Use for:
- Comparing prices across stores or regions
- Showing category-wise price changes
- Displaying survey results or rankings

**Line Charts** - Use for:
- Price trends over time
- Seasonal variations
- Historical comparisons

**Pie Charts** - Use for:
- Market share distributions
- User demographic breakdowns
- Budget allocation examples

### Chart Design Principles

```mdx
// Good chart example
export const chartData = [
  { name: 'София', value: 125, details: 'Столичен регион' },
  { name: 'Пловдив', value: 110, details: 'Южен регион' }
];

<Chart 
  type="bar" 
  data={chartData} 
  title="Индекс на цените по градове (България = 100)"
  yAxisKey="value"
  color="#3b82f6"
  height={300}
/>
```

**Chart Requirements**:
- Always include descriptive titles
- Use meaningful data labels
- Provide context for numbers (baselines, units)
- Ensure accessibility with proper color contrast
- Include data sources when applicable

### Data Standards

- Round numbers appropriately (e.g., 12.3% not 12.34567%)
- Use consistent units throughout (лв., %, бр.)
- Include sample sizes for statistics
- Provide dates for time-sensitive data
- Link to data sources when possible

## 🎯 SEO & Discoverability

### Title Optimization

**Good Examples**:
- "5 начина да спестите пари при пазаруване през 2025"
- "Анализ на цените: Какво очаква българския пазар"
- "Как технологиите променят начина ни на пазаруване"

**Avoid**:
- Generic titles ("Съвети за пазаруване")
- Clickbait without substance
- Overly long titles (>60 characters)

### Meta Descriptions

**Format**: Problem + Solution + Benefit
```
Научете как да използвате данните за цени, за да спестявате до 30% от семейния бюджет. Практични съвети с конкретни примери.
```

### Internal Linking

- Link to related blog posts
- Reference relevant data visualizations
- Connect to app features and benefits
- Use descriptive anchor text

## 📝 Content Types & Templates

### Market Analysis Posts

**Template Structure**:
```mdx
---
title: "Анализ на пазара: [Topic] за [Time Period]"
date: "YYYY-MM-DD"
excerpt: "Brief analysis summary with key findings"
---

# Market Analysis Title

## Ключови находки
- Bullet point summary of main insights
- 3-5 key findings maximum

## Данни и тенденции
[Include relevant charts and visualizations]

## Анализ на резултатите
[Detailed explanation of data]

## Прогнози и препоръки
[Future outlook and actionable advice]

## Заключение
[Summary and next steps]
```

### How-To Guides

**Template Structure**:
```mdx
---
title: "[Number] начина да [achieve goal]"
date: "YYYY-MM-DD"
excerpt: "Practical guide summary"
---

# How-To Guide Title

## Въведение
[Problem context and solution overview]

## Стъпка 1: [Action]
[Detailed instructions with examples]

## Стъпка 2: [Action]
[Continued instructions]

## Съвети за успех
- Practical tips
- Common mistakes to avoid

## Заключение
[Summary and call to action]
```

### News & Updates

**Template Structure**:
```mdx
---
title: "Новини: [Event/Update]"
date: "YYYY-MM-DD"
excerpt: "Brief news summary"
---

# News Title

## Какво се случи
[Event description]

## Влияние върху потребителите
[How this affects users]

## Нашата реакция
[Company response or feature updates]

## Следващи стъпки
[What users should do]
```

## 🖼️ Visual Content Guidelines

### Image Standards

**Technical Requirements**:
- Format: WebP preferred, JPG/PNG acceptable
- Resolution: Minimum 1200px width for featured images
- File size: Under 500KB for optimal loading
- Alt text: Descriptive and meaningful

**Content Guidelines**:
- Use authentic, relevant imagery
- Avoid generic stock photos
- Include charts and data visualizations
- Ensure cultural relevance for Bulgarian audience

### Chart Styling

**Color Palette**:
```css
Primary: #3b82f6 (Blue)
Secondary: #10b981 (Green)  
Accent: #f59e0b (Orange)
Neutral: #6b7280 (Gray)
```

**Accessibility**:
- Minimum contrast ratio 4.5:1
- Don't rely solely on color to convey information
- Include patterns or textures for differentiation
- Provide alternative text descriptions

## 📱 Mobile-First Writing

### Scannable Content

- Use short paragraphs (2-3 sentences max)
- Include bullet points and numbered lists
- Break up text with subheadings
- Highlight key information

### Mobile Formatting

```mdx
// Good for mobile
## Quick Tips
1. Short, actionable item
2. Another brief point
3. Final concise tip

// Avoid long paragraphs
Long blocks of text are difficult to read on mobile devices and should be broken up into smaller, more digestible chunks that are easier to scan and comprehend.
```

## ♿ Accessibility Guidelines

### Writing for Accessibility

- Use plain language and simple sentence structure
- Define technical terms and abbreviations
- Provide context for time-sensitive information
- Include alternative descriptions for visual content

### Inclusive Language

- Use person-first language
- Avoid assumptions about user circumstances
- Include diverse examples and scenarios
- Be sensitive to economic challenges

## 🔍 Content Review Process

### Quality Checklist

**Before Publishing**:
- [ ] Fact-check all statistics and claims
- [ ] Verify data sources and dates
- [ ] Test all charts for accuracy
- [ ] Review for grammar and spelling
- [ ] Check mobile formatting
- [ ] Validate accessibility features
- [ ] Confirm SEO optimization

### Editorial Standards

**Research Requirements**:
- Use authoritative sources (NSI, banks, official reports)
- Include recent data (within 6 months when possible)
- Cross-reference statistics from multiple sources
- Link to original sources when available

**Accuracy Standards**:
- Round percentages to one decimal place
- Use current prices and examples
- Update outdated information regularly
- Include disclaimers for estimates or projections

## 📈 Performance Metrics

### Content Success Metrics

**Engagement**:
- Time on page (target: 2+ minutes)
- Scroll depth (target: 70%+)
- Chart interactions
- Social shares

**SEO Performance**:
- Organic search rankings
- Click-through rates
- Featured snippet appearances
- Internal link clicks

**User Value**:
- Comments and feedback
- Return visitor rate
- Newsletter signups from content
- App downloads attributed to content

### A/B Testing Guidelines

**Test Elements**:
- Headlines and titles
- Introduction paragraphs
- Chart types and presentations
- Call-to-action placement

**Testing Process**:
1. Define hypothesis
2. Create variations
3. Run test for minimum 2 weeks
4. Analyze results
5. Implement winning version

---

*These guidelines ensure consistent, high-quality content that serves our users' needs while building trust and authority in the price comparison space.*