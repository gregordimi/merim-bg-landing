import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/layouts/Layout";
import HomePage from "@/pages/HomePage";
// import DashboardSidebarPage from "@/pages/DashboardSidebarPage";
import DashboardPreview from './pages/DashboardPreview';

// Lazy load pages that aren't immediately needed
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const RewardsPage = lazy(() => import("@/pages/RewardsPage"));
const DashboardSidebarPage = lazy(() => import("@/pages/DashboardSidebarPage"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {

  React.useEffect(() => {
    // @ts-ignore
   var _mtm = window._mtm = window._mtm || [];
   _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
   var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
   // @ts-ignore
  //  g.async=true; g.src='https://cenite2-matomo.xxkpxb.easypanel.host/js/container_2OtD161c.js'; s.parentNode.insertBefore(g,s);
  g.async=true; g.src=`${import.meta.env.VITE_MATOMO_URL}/js/container_2OtD161c.js`; s.parentNode.insertBefore(g,s);
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main layout with header and footer */}
            <Route path="/" element={<Layout />}>
              {/* <Route index element={<HomePage />} /> */}
              <Route index element={<DashboardPreview />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="rewards" element={<RewardsPage />} />
            </Route>

            {/* New dashboard sidebar route - standalone (no layout wrapper) */}
            <Route path="/dashboard">
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
