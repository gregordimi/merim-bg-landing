import React, { Suspense, lazy } from "react";
import { MDXProvider } from "@mdx-js/react";

// Lazy load Chart component to reduce bundle size
const Chart = lazy(() => import("@/components/Chart"));

// Chart loading fallback
const ChartLoader = () => (
  <div className="my-6 p-4 border rounded-lg bg-card">
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  </div>
);

// Components that will be available in all MDX files
const components = {
  Chart: (props: any) => (
    <Suspense fallback={<ChartLoader />}>
      <Chart {...props} />
    </Suspense>
  ),
  // Add more components here as needed
  h1: (props: any) => (
    <h1
      className="text-3xl font-bold mb-4 mt-6 text-foreground first:mt-0"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="text-2xl font-semibold mb-3 mt-6 text-foreground"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="text-xl font-semibold mb-3 mt-5 text-foreground"
      {...props}
    />
  ),
  h4: (props: any) => (
    <h4
      className="text-lg font-semibold mb-3 mt-5 text-foreground"
      {...props}
    />
  ),
  h5: (props: any) => (
    <h5
      className="text-md font-semibold mb-2 mt-4 text-foreground"
      {...props}
    />
  ),
  h6: (props: any) => (
    <h6
      className="text-md font-semibold mb-1 mt-3 text-foreground"
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      className="mb-3 text-muted-foreground leading-normal text-base"
      {...props}
    />
  ),
  ul: (props: any) => (
    <ul
      className="mb-3 ml-6 space-y-1 list-disc text-muted-foreground text-base"
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="mb-3 ml-6 space-y-1 list-decimal text-muted-foreground text-base"
      {...props}
    />
  ),
  li: (props: any) => <li className="leading-normal" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-primary pl-6 py-4 italic my-8 text-muted-foreground bg-muted/30 rounded-r-lg"
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground"
      {...props}
    />
  ),
  pre: (props: any) => (
    <pre
      className="bg-muted p-6 rounded-lg overflow-x-auto my-8 text-sm"
      {...props}
    />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-6">
      <table
        className="w-full border-collapse border border-border rounded-lg bg-background"
        {...props}
      />
    </div>
  ),
  thead: (props: any) => <thead className="bg-muted" {...props} />,
  th: (props: any) => (
    <th
      className="border border-border px-4 py-3 bg-muted font-semibold text-left text-foreground text-sm"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="border border-border px-4 py-3 text-muted-foreground text-sm"
      {...props}
    />
  ),
  tr: (props: any) => <tr className="even:bg-muted/20" {...props} />,
  strong: (props: any) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: (props: any) => (
    <em className="italic text-muted-foreground" {...props} />
  ),
  hr: (props: any) => <hr className="my-12 border-border" {...props} />,
  a: (props: any) => (
    <a
      className="text-primary hover:text-primary/80 underline underline-offset-4"
      {...props}
    />
  ),
  img: (props: any) => (
    <img className="rounded-lg my-8 max-w-full h-auto" {...props} />
  ),
};

interface BlogMDXProviderProps {
  children: React.ReactNode;
}

const BlogMDXProvider: React.FC<BlogMDXProviderProps> = ({ children }) => {
  return <MDXProvider components={components}>{children}</MDXProvider>;
};

export default BlogMDXProvider;
