import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  a({ href = "", children, ...props }) {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...props}
      >
        {children}
        {external && <span className="markdown-link-arrow" aria-hidden="true"> ↗</span>}
      </a>
    );
  },
  code({ className, children, ...props }) {
    const block = Boolean(className);
    return (
      <code className={`${className || ""} ${block ? "markdown-code-block" : "markdown-code-inline"}`} {...props}>
        {children}
      </code>
    );
  },
  pre({ children }) {
    const code = children?.props;
    const language = code?.className?.match(/language-([\w-]+)/)?.[1];
    return (
      <div className="markdown-pre-wrap">
        <div className="markdown-code-topline">
          <span className="markdown-code-dots"><i /><i /><i /></span>
          <span>{language || "Code"}</span>
        </div>
        <pre>{children}</pre>
      </div>
    );
  },
  table({ children }) {
    return <div className="markdown-table-wrap"><table>{children}</table></div>;
  },
  input({ checked, ...props }) {
    return <input type="checkbox" checked={checked} readOnly {...props} />;
  },
};

export default function AnswerMarkdown({ children }) {
  return (
    <div className="prose-answer">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
