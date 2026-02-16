declare module "react-markdown" {
  import type * as React from "react";

  /** タグ名からカスタムコンポーネントへのマッピング */
  export type Components = Partial<
    Record<string, React.ComponentType<{ children?: React.ReactNode }>>
  >;

  export interface ReactMarkdownProps {
    children?: React.ReactNode;
    className?: string;
    /** Markdown要素のカスタムレンダリング用コンポーネント */
    components?: Components | null;
  }

  const ReactMarkdown: React.ComponentType<ReactMarkdownProps>;
  export default ReactMarkdown;
}

