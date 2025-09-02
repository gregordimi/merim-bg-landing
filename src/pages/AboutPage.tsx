import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { content } from "@/i18n/bg";

const AboutPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {content.pages.about.title}
          </h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Нашата мисия</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.pages.about.content}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Как работим</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ние създаваме технология, която позволява на потребителите да споделят 
                информация за цени в реално време, създавайки прозрачен пазар за всички.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;