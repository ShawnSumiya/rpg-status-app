declare module "react-markdown" {
  import type * as React from "react";

  export interface ReactMarkdownProps {
    children: React.ReactNode;
    className?: string;
  }

  const ReactMarkdown: React.ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

