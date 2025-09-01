import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle"
import { AppStoreButton, GooglePlayButton } from "./components/app-store-buttons";

// Data for the entire page
const content = {
  seo: {
    title: "Merim.bg - Цените. Следени от всички.",
    description:
      "Присъедини се към нашата общност. Вземете информиран избор за пазаруване с Merim.bg. Сравни цените на продукти от всеки магазин, директно от телефона си.",
    keywords:
      "цени, сравнение на цени, спестяване, пазаруване, инфлация, еврозона, България, супермаркет, баркод скенер",
  },
  header: {
    nav: { howItWorks: "Как работи", aboutUs: "За нас", blog: "Блог" },
    ctaButton: "Изтегли приложението",
  },
  hero: {
    title: "Цените. Следена от всички.",
    subtitle:
      "Присъедини се към нашата общност. Вземете информиран избор за пазаруване с Merim.bg. Сравни цените на продукти от всеки магазин, директно от телефона си.",
  },
  appButtons: {
    googlePlay: "Google Play",
    appStore: "App Store",
    getItOn: "СВАЛИ ОТ",
    downloadOn: "СВАЛИ ОТ",
  },
  problem: {
    title: "Притесняват ли те растящите цени?",
    cards: [
      {
        title: "Инфлация и Еврозона",
        text: "С наближаващото приемане на еврото и постоянната инфлация, потребителите се притесняват от спекулативни цени.",
      },
      {
        title: "Чувство, че плащаш твърде много",
        text: "Липсата на прозрачност води до финансово напрежение и усещането, че губиш контрол над бюджета.",
      },
      {
        title: "Трудно е да помниш всичко",
        text: "Да помниш точните цени на десетки продукти от различни магазини е почти невъзможно.",
      },
    ],
  },
  solution: {
    title: "Силата е в твоите ръце. И в твоя телефон.",
    text: "Merim.bg е безплатно мобилно приложение, което обединява силата на всички потребители. Чрез споделяне на информация в реално време, ние създаваме прозрачен пазар, където всеки може да направи най-добрия избор.",
  },
  howItWorks: {
    title: "Лесно е като 1-2-3",
    steps: [
      {
        title: "Сканирай",
        text: "Сканирай баркода, етикета с цената или касовата бележка.",
      },
      {
        title: "Сравни",
        text: "Виж цените на същия продукт в други магазини и исторически данни.",
      },
      {
        title: "Спести",
        text: "Вземи информирано решение и получи най-добрата стойност.",
      },
    ],
  },
  benefits: {
    title: "Повече от просто приложение",
    items: [
      {
        title: "Спести време и пари:",
        text: "Намери най-добрите цени с цялата информация на една ръка разстояние.",
      },
      {
        title: "Пазарувай информирано:",
        text: "Вземай решения, базирани на реални данни от хиляди потребители.",
      },
      {
        title: "Бъди част от общност:",
        text: "Участвай в национална мрежа за прозрачност и помогни на всички.",
      },
      {
        title: "Получи награди:",
        text: "Получавай стимули за споделяне на информация, като участие в томболи.",
      },
    ],
  },
  features: {
    title: "Всички инструменти, от които се нуждаеш",
    list: [
      "База данни с цени в реално време",
      "Търсене и сравнение на продукти",
      "Сканиране на баркодове и касови бележки",
      "Исторически данни за цените",
      'Индикатори "Добра" / "Лоша" сделка',
      "Рангове на магазини и продукти",
    ],
  },
  cta: {
    title: "Готов ли си да поемеш контрола?",
    text: "Изтегли MERIM.BG днес и се присъедини към движението за прозрачни цени в България.",
  },
  footer: {
    mission:
      "Нашата мисия е да върнем силата в ръцете на потребителя чрез прозрачност на цените.",
    columns: [
      {
        title: "Продукт",
        links: [
          { text: "Как работи", href: "#how-it-works" },
          { text: "Изтегли приложението", href: "#cta" },
          { text: "Награди", href: "#" },
        ],
      },
      {
        title: "Компания",
        links: [
          { text: "За нас", href: "#about-us" },
          { text: "Блог", href: "#blog" },
          { text: "За бизнеса", href: "#" },
        ],
      },
      {
        title: "Правни",
        links: [
          { text: "Общи условия", href: "#" },
          { text: "Политика за поверителност", href: "#" },
        ],
      },
    ],
    copyright: "© 2025 Merim.bg. Всички права запазени.",
  },
};

// --- Icon Components ---
const LogoIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35.54 25.66" width="35.540000915527344" height="25.65999984741211"><g xmlns="http://www.w3.org/2000/svg" transform="matrix(0 1 -1 0 52.39 -0)"><defs /><g fill="#000000"><g transform="translate(0, 0)"><path d="M0 52.39L0 48.73L11.16 34.55L0 20.48L0 16.85L24.78 16.85L24.78 25.37L19.87 25.37L19.56 21.61L8.23 21.61L7.98 21.66L17.68 34.33L17.68 34.81L7.96 47.58L8.06 47.63L20.46 47.63L20.78 43.87L25.66 43.87L25.66 52.39L0 52.39Z" /></g></g></g></svg>
);

// The main Wordmark component
const Wordmark = () => {
  return (
    <h1 className="text-4xl lg:text-6xl font-robs font-medium flex items-end space-x-0.5 select-none">
      <span className="inline-block transform rotate-[90deg] -translate-x-[4px] translate-y-[7px] transition-transform duration-300">Σ</span>
      <span>е</span>
      <span>р</span>
      <span>и</span>
      <span className="inline-block transform rotate-[90deg] translate-x-[4px] translate-y-[7px] transition-transform duration-300">Σ</span>
    </h1>
  );
};

const MenuIcon = (props) => (
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
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CheckCircleIcon = (props) => (
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
          <GooglePlayButton size="lg" className="w-36" href=""/>
          <AppStoreButton size="lg" className="w-36" href="" />
</div>
  );
// --- Page Sections ---
const Header = () => {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <a
          href="#"
          className="flex items-center gap-2 text-2xl font-bold text-foreground"
        >
          {/* <LogoIcon /> */}
          <Wordmark />.bg
          {/* <span>Merim.bg</span> */}
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {content.header.nav.howItWorks}
          </a>
          <a
            href="#about-us"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {content.header.nav.aboutUs}
          </a>
          <a
            href="#blog"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {content.header.nav.blog}
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Button asChild>
            <a href="#cta">{content.header.ctaButton}</a>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <a
                  href="#how-it-works"
                  className="text-lg text-foreground hover:text-primary"
                >
                  {content.header.nav.howItWorks}
                </a>
                <a
                  href="#about-us"
                  className="text-lg text-foreground hover:text-primary"
                >
                  {content.header.nav.aboutUs}
                </a>
                <a
                  href="#blog"
                  className="text-lg text-foreground hover:text-primary"
                >
                  {content.header.nav.blog}
                </a>
                <Button asChild className="mt-4">
                  <a href="#cta">{content.header.ctaButton}</a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

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
      <div className="mt-12 relative">
        <img
          src="https://placehold.co/1000x500/18181b/ffffff?text=App+Screenshot"
          alt="Merim.bg App Screenshot"
          className="rounded-2xl shadow-2xl mx-auto ring-1 ring-white/10"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/1000x500/18181b/ffffff?text=App+Screenshot";
          }}
        />
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
            src="https://placehold.co/600x600/18181b/ffffff?text=Community"
            alt="Community of shoppers"
            className="rounded-2xl shadow-xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x600/18181b/ffffff?text=Community";
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
            src="https://placehold.co/600x500/18181b/ffffff?text=Features"
            alt="App Features Illustration"
            className="rounded-2xl shadow-xl"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x500/18181b/ffffff?text=Features";
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

const Footer = () => (
  <footer className="py-12 bg-secondary/10">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <a
            href="#"
            className="flex items-center gap-2 text-2xl font-bold text-foreground align-text-bottom"
          >
            {/* <LogoIcon /> */}
            {/* <span>Merim.bg</span> */}
            <Wordmark /><div>.bg</div>
          </a>
          <p className="mt-4 text-muted-foreground text-sm max-w-xs">
            {content.footer.mission}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
          {content.footer.columns.map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold text-foreground">{column.title}</h4>
              <ul className="mt-4 space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>{content.footer.copyright}</p>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <div className="bg-background text-foreground antialiased">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
