import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { content } from "@/i18n/bg";
import { getAllBlogPosts } from "@/utils/blog";
import { Calendar, ArrowRight } from "lucide-react";

const BlogPage: React.FC = () => {
  const blogPosts = getAllBlogPosts();
  
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
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {content.pages.blog.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {content.pages.blog.description}
            </p>
          </header>
          
          {blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {content.pages.blog.noarticles}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Card key={post.slug} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={post.date}>
                        {formatDate(post.date)}
                      </time>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
                    >
                     {content.pages.blog.readmore}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;