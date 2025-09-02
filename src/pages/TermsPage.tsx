import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { content } from "@/i18n/bg";

const TermsPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {content.pages.terms.title}
          </h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Общи положения</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Тези общи условия регулират използването на Merim.bg приложението и услугите.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Използване на приложението</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Приложението е предназначено за споделяне и сравняване на цени на продукти 
                в различни магазини в България.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Отговорности</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Потребителите са отговорни за достоверността на споделената информация.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;