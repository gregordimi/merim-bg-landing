import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { content } from "@/i18n/bg";

const BlogPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {content.pages.blog.title}
          </h1>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Как да спестите пари при пазаруване</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Научете как да използвате Merim.bg за да намерите най-добрите цени.
                </p>
                <p className="text-xs text-muted-foreground mt-2">2025-01-15</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Инфлацията и нашето приложение</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Как технологията помага в борбата с растящите цени.
                </p>
                <p className="text-xs text-muted-foreground mt-2">2025-01-10</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Новини от общността</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Последни новини и актуализации от потребителите ни.
                </p>
                <p className="text-xs text-muted-foreground mt-2">2025-01-05</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;