import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { content } from "@/i18n/bg";

const PrivacyPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {content.pages.privacy.title}
          </h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Събиране на информация</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ние събираме минимално количество данни, необходими за функционирането на приложението.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Използване на данните</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Данните се използват единствено за подобряване на услугите и предоставяне 
                на точна информация за цените.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Защита на данните</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ние използваме съвременни технологии за защита на вашите лични данни.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;