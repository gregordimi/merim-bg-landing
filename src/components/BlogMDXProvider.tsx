import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import Chart from '@/components/Chart';

// Components that will be available in all MDX files
const components = {
  Chart,
  // Add more components here as needed
  h1: (props: any) => <h1 className="text-3xl font-bold mb-6 text-foreground" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground" {...props} />,
  p: (props: any) => <p className="mb-4 text-muted-foreground leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="mb-4 ml-6 list-disc text-muted-foreground" {...props} />,
  ol: (props: any) => <ol className="mb-4 ml-6 list-decimal text-muted-foreground" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-6" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-border" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-border px-4 py-2" {...props} />
  ),
  strong: (props: any) => <strong className="font-semibold text-foreground" {...props} />,
  em: (props: any) => <em className="italic" {...props} />,
};

interface BlogMDXProviderProps {
  children: React.ReactNode;
}

const BlogMDXProvider: React.FC<BlogMDXProviderProps> = ({ children }) => {
  return <MDXProvider components={components}>{children}</MDXProvider>;
};

export default BlogMDXProvider;