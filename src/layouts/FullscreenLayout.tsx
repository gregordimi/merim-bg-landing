import React from "react";
import { Outlet, Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Wordmark = () => {
  return (
    <h1 className="text-2xl lg:text-3xl font-robs font-medium flex items-end space-x-0.5 select-none">
      <span className="inline-block transform rotate-[90deg] -translate-x-[2px] translate-y-[4px] transition-transform duration-300">
        Σ
      </span>
      <span>е</span>
      <span>р</span>
      <span>и</span>
      <span className="inline-block transform rotate-[90deg] translate-x-[2px] translate-y-[4px] transition-transform duration-300">
        Σ
      </span>
    </h1>
  );
};

const FullscreenLayout: React.FC = () => {
  return (
    <div className="bg-background text-foreground antialiased min-h-screen flex flex-col">
      {/* Minimal Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-foreground"
            >
              <Wordmark />
              .org
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Fullscreen Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default FullscreenLayout;
