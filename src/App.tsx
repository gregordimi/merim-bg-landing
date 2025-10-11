import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/layouts/Layout";
import FullscreenLayout from "@/layouts/FullscreenLayout";
import HomePage from "@/pages/HomePage";
import Charts from "@/utils/cube/App";
import DashboardSidebarPage from "@/pages/DashboardSidebarPage";
import ChartDebugPage from "@/pages/ChartDebugPage";
import ChartListPage from "@/pages/ChartListPage";

// Lazy load pages that aren't immediately needed
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const RewardsPage = lazy(() => import("@/pages/RewardsPage"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {

  React.useEffect(() => {
   var _mtm = window._mtm = window._mtm || [];
   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
   g.async=true; g.src='https://cenite2-matomo.xxkpxb.easypanel.host/js/container_2OtD161c.js'; s.parentNode.insertBefore(g,s);
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main layout with header and footer */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="rewards" element={<RewardsPage />} />
            </Route>

            {/* Fullscreen layout for charts (no footer, minimal header) */}
            <Route path="/charts" element={<FullscreenLayout />}>
              <Route index element={<Charts />} />
              <Route path="category" element={<Charts />} />
              <Route path="debug" element={<ChartDebugPage />} />
              <Route path="list" element={<ChartListPage />} />
            </Route>

            {/* New dashboard sidebar route - standalone (no layout wrapper) */}
            <Route path="/dashboard-sidebar">
              <Route index element={<DashboardSidebarPage />} />
              <Route path=":chartId" element={<DashboardSidebarPage />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
