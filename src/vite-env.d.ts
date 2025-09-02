/// <reference types="vite/client" />
/// <reference types="@mdx-js/rollup" />

declare module "*.mdx" {
  import { ComponentType } from "react";
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
