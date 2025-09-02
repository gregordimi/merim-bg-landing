import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import Chart from '@/components/Chart';

// Components that will be available in all MDX files
const components = {
  Chart,
  // Add more components here as needed
  h1: (props: any) => <h1 className="text-4xl font-bold mb-8 mt-12 text-foreground first:mt-0" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-semibold mb-6 mt-12 text-foreground" {...props} />,
  h3: (props: any) => <h3 className="text-2xl font-semibold mb-4 mt-8 text-foreground" {...props} />,
  h4: (props: any) => <h4 className="text-xl font-semibold mb-3 mt-6 text-foreground" {...props} />,
  h5: (props: any) => <h5 className="text-lg font-semibold mb-2 mt-4 text-foreground" {...props} />,
  h6: (props: any) => <h6 className="text-base font-semibold mb-2 mt-4 text-foreground" {...props} />,
  p: (props: any) => <p className="mb-6 text-muted-foreground leading-relaxed text-lg" {...props} />,
  ul: (props: any) => <ul className="mb-6 ml-6 space-y-2 list-disc text-muted-foreground text-lg" {...props} />,
  ol: (props: any) => <ol className="mb-6 ml-6 space-y-2 list-decimal text-muted-foreground text-lg" {...props} />,
  li: (props: any) => <li className="leading-relaxed" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-primary pl-6 py-4 italic my-8 text-muted-foreground bg-muted/30 rounded-r-lg" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-muted p-6 rounded-lg overflow-x-auto my-8 text-sm" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full border-collapse border border-border rounded-lg" {...props} />
    </div>
  ),
  thead: (props: any) => (
    <thead className="bg-muted" {...props} />
  ),
  th: (props: any) => (
    <th className="border border-border px-6 py-4 bg-muted font-semibold text-left text-foreground" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-border px-6 py-4 text-muted-foreground" {...props} />
  ),
  tr: (props: any) => (
    <tr className="even:bg-muted/20" {...props} />
  ),
  strong: (props: any) => <strong className="font-semibold text-foreground" {...props} />,
  em: (props: any) => <em className="italic text-muted-foreground" {...props} />,
  hr: (props: any) => <hr className="my-12 border-border" {...props} />,
  a: (props: any) => <a className="text-primary hover:text-primary/80 underline underline-offset-4" {...props} />,
  img: (props: any) => <img className="rounded-lg my-8 max-w-full h-auto" {...props} />,
};

interface BlogMDXProviderProps {
  children: React.ReactNode;
}

const BlogMDXProvider: React.FC<BlogMDXProviderProps> = ({ children }) => {
  return <MDXProvider components={components}>{children}</MDXProvider>;
};

export default BlogMDXProvider;