import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AppStoreButton, GooglePlayButton } from "@/components/app-store-buttons";
import { content } from "@/i18n/bg";

const CheckCircleIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// --- Reusable UI Components ---
const AppButtons = () => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
    <GooglePlayButton size="lg" className="w-36" href="" />
    <AppStoreButton size="lg" className="w-36" href="" />
  </div>
);

const HeroSection = () => (
  <section className="py-20 sm:py-28 md:py-32 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-foreground">
        {content.hero.title}
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
        {content.hero.subtitle}
      </p>
      <AppButtons />

      <div className="mt-16 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start justify-center">
          <Card className="w-full h-80 md:h-[600px] p-0">
            <div className="w-full h-full overflow-hidden rounded-t-2xl">
              <img
                src="https://placehold.co/300x600/9CA3AF/E5E7EB?text=Екран+1"
                alt="App Screenshot 1"
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardFooter className="m-3 justify-center"><div>{content.hero.scr1}</div></CardFooter>
          </Card>
          <Card className="w-full h-80 md:h-[600px] p-0">
          <div className="w-full h-full overflow-hidden rounded-t-2xl">
              <img
                src="https://placehold.co/300x600/9CA3AF/E5E7EB?text=Екран+2"
                alt="App Screenshot 2"
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardFooter className="m-3 justify-center"><div>{content.hero.scr2}</div></CardFooter>
          </Card>
          <Card className="w-full h-80 md:h-[600px] p-0">
          <div className="w-full h-full overflow-hidden rounded-t-2xl">
              <img
                src="https://placehold.co/300x600/9CA3AF/E5E7EB?text=Екран+3"
                alt="App Screenshot 3"
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardFooter className="m-3 justify-center"><div>{content.hero.scr3}</div></CardFooter>
          </Card>
          <Card className="w-full h-80 md:h-[600px] p-0">
          <div className="w-full h-full overflow-hidden rounded-t-2xl">
              <img
                src="https://placehold.co/300x600/9CA3AF/E5E7EB?text=Екран+4"
                alt="App Screenshot 4"
                className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardFooter className="m-3 justify-center"><div>{content.hero.scr4}</div></CardFooter>
          </Card>
        </div>
      </div>
    </div>
  </section>
);

const ProblemSection = () => (
  <section id="problem" className="py-20 sm:py-24 bg-secondary/10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {content.problem.title}
        </h2>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {content.problem.cards.map((card, index) => (
          <Card key={index} className="bg-background">
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const SolutionSection = () => (
  <section id="about-us" className="py-20 sm:py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src="https://placehold.co/600x600/18181b/ffffff?text=Общност"
            alt="Community of shoppers"
            className="rounded-2xl shadow-xl"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x600/18181b/ffffff?text=Общност";
            }}
          />
        </div>
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {content.solution.title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            {content.solution.text}
          </p>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 sm:py-24 bg-secondary/10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {content.howItWorks.title}
        </h2>
      </div>
      <div className="relative mt-16">
        {/* Decorative line on larger screens */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 hidden md:block"
        ></div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {content.howItWorks.steps.map((step, index) => (
            <Card key={index} className="bg-background text-center">
              <CardHeader>
                <div className="mx-auto bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center rounded-full text-xl font-bold mb-4 ring-8 ring-background">
                  {index + 1}
                </div>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const BenefitsSection = () => (
  <section id="benefits" className="py-20 sm:py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {content.benefits.title}
        </h2>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {content.benefits.items.map((item, index) => (
          <Card
            key={index}
            className="bg-secondary/10 border-none text-center sm:text-left"
          >
            <CardHeader>
              <div className="flex justify-center sm:justify-start">
                <div className="bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center rounded-lg mb-4">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 sm:py-24 bg-secondary/10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="max-w-xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {content.features.title}
          </h2>
          <ul className="mt-8 space-y-4">
            {content.features.list.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-primary" />
                <p className="text-muted-foreground">{feature}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <img
            src="https://placehold.co/600x500/18181b/ffffff?text=Функции"
            alt="App Features Illustration"
            className="rounded-2xl shadow-xl"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x500/18181b/ffffff?text=Функции";
            }}
          />
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section id="cta" className="py-20 sm:py-24 bg-background">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {content.cta.title}
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-lg text-primary-foreground/80">
          {content.cta.text}
        </p>
        <AppButtons />
      </div>
    </div>
  </section>
);

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
};

export default HomePage;