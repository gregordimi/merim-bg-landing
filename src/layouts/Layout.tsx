import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import {
  AppStoreButton,
  GooglePlayButton,
} from "@/components/app-store-buttons";
import { content } from "@/i18n/bg";

// The main Wordmark component
const Wordmark = () => {
  return (
    <h1 className="text-4xl lg:text-6xl font-robs font-medium flex items-end space-x-0.5 select-none">
      <span className="inline-block transform rotate-[90deg] -translate-x-[4px] translate-y-[7px] transition-transform duration-300">
        Σ
      </span>
      <span>е</span>
      <span>р</span>
      <span>и</span>
      <span className="inline-block transform rotate-[90deg] translate-x-[4px] translate-y-[7px] transition-transform duration-300">
        Σ
      </span>
    </h1>
  );
};

const MenuIcon = (props: any) => (
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

// --- Reusable UI Components ---
const AppButtons = () => (
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
    <GooglePlayButton size="lg" className="w-36" href="" />
    <AppStoreButton size="lg" className="w-36" href="" />
  </div>
);

// Shared scroll to section function
const useScrollToSection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (href: string) => {
    // Handle different href formats
    if (href.startsWith("/#")) {
      // Homepage section link (e.g., "/#how-it-works")
      const sectionId = href.substring(2);
      if (location.pathname === "/") {
        // Already on homepage, just scroll
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to homepage first, then scroll
        navigate("/");
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else if (href.includes("#")) {
      // Other page with anchor (e.g., "/about#contact")
      const [path, sectionId] = href.split("#");
      if (location.pathname === path) {
        // Already on the target page, just scroll
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to the page first, then scroll
        navigate(path);
        setTimeout(() => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } else {
      // Regular navigation without anchor
      navigate(href);
    }
  };
};

export const Header = () => {
  const scrollToSection = useScrollToSection();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-foreground"
        >
          <Wordmark />
          .bg
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("/#how-it-works")}
            className="text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            {content.header.nav.howItWorks}
          </button>
          <Link
            to="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {content.header.nav.aboutUs}
          </Link>
          <Link
            to="/blog"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {content.header.nav.blog}
          </Link>
          <Link
            to="/dashboard/stats"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {content.header.nav.dashboard}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Button onClick={() => scrollToSection("/#cta")}>
            {content.header.ctaButton}
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
                <button
                  onClick={() => scrollToSection("/#how-it-works")}
                  className="text-lg text-foreground hover:text-primary bg-transparent border-none cursor-pointer text-left"
                >
                  {content.header.nav.howItWorks}
                </button>
                <Link
                  to="/about"
                  className="text-lg text-foreground hover:text-primary"
                >
                  {content.header.nav.aboutUs}
                </Link>
                <Link
                  to="/blog"
                  className="text-lg text-foreground hover:text-primary"
                >
                  {content.header.nav.blog}
                </Link>
                <Button
                  className="mt-4"
                  onClick={() => scrollToSection("/#cta")}
                >
                  {content.header.ctaButton}
                </Button>
                <AppButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export const Footer = () => {
  const scrollToSection = useScrollToSection();

  return (
    <footer className="py-12 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-foreground align-text-bottom"
            >
              <Wordmark />
              <div>.bg</div>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm max-w-xs">
              {content.footer.mission}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            {content.footer.columns.map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold text-foreground">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.href.startsWith("/#") || link.href.includes("#") ? (
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer text-left p-0"
                        >
                          {link.text}
                        </button>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.text}
                        </Link>
                      )}
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
};

const Layout: React.FC = () => {
  return (
    <div className="bg-background text-foreground antialiased">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
