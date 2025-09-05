import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { content } from "@/i18n/bg";

const AboutPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {content.pages.about.pagetitle}
          </h1>
          
          <Card className="mb-8" id="about">
            <CardHeader>
              <CardTitle>{content.pages.about.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.pages.about.content}
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8" id="contact">
            <CardHeader>
              <CardTitle>{content.pages.about.contacttitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {content.pages.about.contact}
              </p>
              <a className="text-muted-foreground"
               href={content.pages.about.contacthref}>
                {content.pages.about.contacta}
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;