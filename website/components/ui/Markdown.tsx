import { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";
import CopyButton from "./CopyButton";

import P from "./typography/P";
import Li from "./typography/Li";
import H1 from "./typography/H1";
import H2 from "./typography/H2";

type MarkdownProps = ComponentPropsWithoutRef<typeof ReactMarkdown> & {
  copyableCode?: boolean;
};

function childrenToText(children: any): string {
  if (typeof children === "string") {
    return children;
  }

  if (Array.isArray(children)) {
    return children.map(childrenToText).join("");
  }

  if (children.props && children.props.children) {
    return childrenToText(children.props.children);
  }

  return "";
}

const DEFAULT_COMPONENTS: MarkdownProps["components"] = {
  code({ node, inline, className, children, ...props }) {
    return (
      <code {...props} className={cn("relative", className)}>
        {!inline && (
          <CopyButton
            getValue={() => childrenToText(children)}
            className="absolute top-0 right-0"
            variant="dark"
          />
        )}

        {children}
      </code>
    );
  },
};

const Markdown = ({
  className,
  remarkPlugins = [],
  rehypePlugins = [],
  linkTarget = "_blank",
  components,
  copyableCode = true,
  children,
  ...props
}: MarkdownProps) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm, ...remarkPlugins]}
    rehypePlugins={[rehypeHighlight, ...rehypePlugins]}
    linkTarget={linkTarget}
    className={cn("prose max-w-none", className)}
    components={{
      ...(copyableCode ? DEFAULT_COMPONENTS : undefined),
      ...components,
      p({ children }) {
        return <P>{children}</P>;
      },
      li({ children }) {
        return <Li>{children}</Li>;
      },
      h1({ children }) {
        return <H1>{children}</H1>;
      },
      h2({ children }) {
        return <H2>{children}</H2>;
      },
    }}
    {...props}
  >
    {children}
  </ReactMarkdown>
);

export default Markdown;
