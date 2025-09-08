import React, { Suspense } from 'react';
import { lazy } from 'react';
import { ContentLoader } from '@/components/content-loader';

const BlogMDXProvider = lazy(() => import('@/components/BlogMDXProvider'));
const RewardsContent = lazy(() => import('@/content/rewards.mdx'));

const RewardsPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <article className="max-w-none">
            <Suspense fallback={<ContentLoader />}>
              <BlogMDXProvider>
                <RewardsContent />
              </BlogMDXProvider>
            </Suspense>
          </article>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;