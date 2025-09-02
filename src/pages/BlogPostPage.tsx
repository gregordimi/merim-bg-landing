import React, { Suspense, lazy } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getBlogPostBySlug } from '@/utils/blog';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Lazy load the MDX provider only when needed
const BlogMDXProvider = lazy(() => import('@/components/BlogMDXProvider'));

// Content loading component
const ContentLoader = () => (
  <div className="max-w-none">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
      <div className="h-8 bg-muted rounded w-1/2 mt-8"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-4/5"></div>
    </div>
  </div>
);

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return <Navigate to="/blog" replace />;
  }
  
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return (
      <div className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Статията не е намерена
            </h1>
            <p className="text-muted-foreground mb-8">
              Статията, която търсите, не съществува или е била премахната.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Обратно към блога
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bg-BG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back to blog link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Обратно към блога
          </Link>
          
          {/* Article header */}
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              {post.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <time 
                dateTime={post.date}
                className="text-muted-foreground"
              >
                {formatDate(post.date)}
              </time>
              {post.excerpt && (
                <p className="text-lg text-muted-foreground italic">
                  {post.excerpt}
                </p>
              )}
            </div>
            <div className="mt-6 h-px bg-border"></div>
          </header>
          
          {/* Article content */}
          <article className="max-w-none">
            <Suspense fallback={<ContentLoader />}>
              <BlogMDXProvider>
                <post.content />
              </BlogMDXProvider>
            </Suspense>
          </article>
          
          {/* Article footer */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-muted-foreground">
                Публикувано на {formatDate(post.date)}
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
              >
                Още статии
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;