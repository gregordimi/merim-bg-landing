import { lazy } from "react";

// // Lazy load MDX files to reduce initial bundle size
// const spestetePariBlog = lazy(
//   () => import("/src/content/blog/spestete-pari.mdx")
// );
// const inflatsiaBlog = lazy(
//   () => import("/src/content/blog/inflatsiya-i-tehnologii.mdx")
// );
// const noviniOtObshtnosttaBlog = lazy(
//   () => import("/src/content/blog/novini-ot-obshtnostta.mdx")
// );
// const optimiziranePazarskaListaBlog = lazy(
//   () => import("/src/content/blog/optimizirane-pazarska-lista.mdx")
// );
// const analizNaPazara2025Blog = lazy(
//   () => import("/src/content/blog/analiz-na-pazara-2025.mdx")
// );
// const aiPazaruvanneBlog = lazy(
//   () => import("/src/content/blog/ai-pazaruване.mdx")
// );
// const statistikaIDanniBlog = lazy(
//   () => import("/src/content/blog/statistika-i-danni.mdx")
// );

const postConvid = lazy(
  () => import("/src/content/blog/post-covid-inflation.mdx")
);

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: React.ComponentType;
}

export interface BlogMeta {
  title: string;
  date: string;
  excerpt: string;
}

// Define all blog posts with their metadata
const blogPosts: BlogPost[] = [
  // {
  //   slug: "spestete-pari",
  //   title: "Как да спестите пари при пазаруване",
  //   date: "2025-01-15",
  //   excerpt:
  //     "Научете как да използвате Merim.bg за да намерите най-добрите цени.",
  //   content: spestetePariBlog,
  // },
  // {
  //   slug: "statistika-i-danni",
  //   title: "Статистика и данни: Как се променят цените",
  //   date: "2025-01-14",
  //   excerpt: "Визуализация на тенденциите в цените с интерактивни диаграми.",
  //   content: statistikaIDanniBlog,
  // },
  // {
  //   slug: "optimizirane-pazarska-lista",
  //   title: "5 начина да оптимизирате пазарската си листа",
  //   date: "2025-01-12",
  //   excerpt:
  //     "Практични съвети за планиране на покупки и максимално спестяване.",
  //   content: optimiziranePazarskaListaBlog,
  // },
  // {
  //   slug: "inflatsiya-i-tehnologii",
  //   title: "Инфлацията и нашето приложение",
  //   date: "2025-01-10",
  //   excerpt: "Как технологията помага в борбата с растящите цени.",
  //   content: inflatsiaBlog,
  // },
  // {
  //   slug: "analiz-na-pazara-2025",
  //   title: "Анализ на пазара: Тенденции в цените за 2025",
  //   date: "2025-01-08",
  //   excerpt:
  //     "Детайлен анализ на цените в България и прогнози за следващите месеци.",
  //   content: analizNaPazara2025Blog,
  // },
  // {
  //   slug: "novini-ot-obshtnostta",
  //   title: "Новини от общността",
  //   date: "2025-01-05",
  //   excerpt: "Последни новини и актуализации от потребителите ни.",
  //   content: noviniOtObshtnosttaBlog,
  // },
  // {
  //   slug: "ai-pazaruване",
  //   title: "Интелигентно пазаруване с AI и машинно обучение",
  //   date: "2025-01-02",
  //   excerpt: "Как изкуственият интелект променя начина, по който пазаруваме.",
  //   content: aiPazaruvanneBlog,
  // },
  {
    slug: "post-convid-inflation",
    title: "Инфлация след ковид",
    date: "2024-12-29",
    excerpt: "Как се променят цените след ковид.",
    content: postConvid
  }
];

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  // Sort by date (newest first)
  return [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Get a single blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) || null;
}

// Get blog post slugs for routing
export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
