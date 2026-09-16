import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconExternalLink } from "@tabler/icons-react";
import { isSafeHttpUrl } from "@/lib/url";

interface ReadmeSectionProps {
  readmeContent: string | null;
  githubUrl: string | null;
}

/**
 * Remove decorative GitHub-specific markup before rendering the README. The
 * result is rendered by this Server Component, so the original markdown does
 * not become a client-component prop in the route's RSC payload.
 */
export function cleanReadmeHtml(raw: string): string {
  let cleaned = raw;
  cleaned = cleaned.replace(/<p\s+align="center"[^>]*>[\s\S]*?<\/p>/gi, "");
  cleaned = cleaned.replace(/<h[1-6]\s+align="center"[^>]*>[\s\S]*?<\/h[1-6]>/gi, "");
  cleaned = cleaned.replace(/^[ \t]*<br\s*\/?>[ \t]*$/gm, "");
  cleaned = cleaned.replace(/<hr\b[^>]*\/?>/gi, "");
  cleaned = cleaned.replace(/<picture>[\s\S]*?<\/picture>/gi, "");
  cleaned = cleaned.replace(/<video[\s\S]*?(?:<\/video>|\/>)\s*/gi, "");
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  cleaned = cleaned.replace(
    /^[ \t]*<a\s[^>]*>[ \t]*<img\s[^>]*>[ \t]*<\/a>[ \t]*$/gm,
    ""
  );
  cleaned = cleaned.replace(
    /^[ \t]*<img\s[^>]*src="[^"]*(?:shields\.io|badge)[^"]*"[^>]*\/?>[ \t]*$/gm,
    ""
  );
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.replace(/^\s+/, "");
}

/**
 * README content is intentionally server rendered. The prior client component
 * sent every markdown body through the RSC payload in addition to the HTML it
 * produced. Static markdown keeps the substantive overview crawlable while
 * removing that duplicated payload and an otherwise unnecessary client fetch
 * for rows without a stored README.
 */
export function ReadmeSection({ readmeContent, githubUrl }: ReadmeSectionProps) {
  if (!readmeContent) {
    return (
      <section className="rounded-xl border border-neutral-800 p-6 text-center">
        <p className="text-neutral-500 text-sm">
          This MCP has no overview available.
          {githubUrl && isSafeHttpUrl(githubUrl) && (
            <>
              {" "}
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                View on GitHub
                <IconExternalLink size={12} />
              </a>
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="prose prose-invert prose-neutral max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-headings:border-b prose-headings:border-neutral-800 prose-headings:pb-2 prose-headings:mb-4 prose-p:text-neutral-400 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 prose-a:transition-colors prose-strong:text-neutral-200 prose-strong:font-semibold prose-em:text-neutral-300 prose-li:text-neutral-400 prose-ul:marker:text-neutral-600 prose-ol:marker:text-neutral-600 prose-blockquote:border-l-neutral-700 prose-blockquote:text-neutral-400 prose-blockquote:not-italic prose-table:border-collapse prose-thead:border-neutral-700 prose-th:text-neutral-300 prose-th:bg-neutral-800/60 prose-th:border prose-th:border-neutral-700 prose-th:px-3 prose-th:py-2 prose-td:text-neutral-400 prose-td:border prose-td:border-neutral-800 prose-td:px-3 prose-td:py-2 prose-tr:border-neutral-800 prose-code:text-blue-300 prose-code:bg-neutral-900 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1({ children }) {
              return <h2 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2 mb-4">{children}</h2>;
            },
            h2({ children }) {
              return <h3 className="text-xl font-bold tracking-tight text-white border-b border-neutral-800 pb-2 mb-4">{children}</h3>;
            },
            h3({ children }) {
              return <h4 className="text-lg font-bold tracking-tight text-white border-b border-neutral-800 pb-2 mb-4">{children}</h4>;
            },
            h4({ children }) {
              return <h5 className="text-base font-bold tracking-tight text-white border-b border-neutral-800 pb-2 mb-4">{children}</h5>;
            },
            h5({ children }) {
              return <h6 className="text-base font-semibold tracking-tight text-white border-b border-neutral-800 pb-2 mb-4">{children}</h6>;
            },
            h6({ children }) {
              return <p className="text-sm font-bold text-neutral-300">{children}</p>;
            },
            pre({ children }) {
              return <pre className="overflow-x-auto rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-sm font-mono leading-relaxed">{children}</pre>;
            },
            code({ children }) {
              return <code className="text-neutral-200">{children}</code>;
            },
            a({ href, children }) {
              const external = href?.startsWith("http");
              return (
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  {children}
                </a>
              );
            },
            img({ src, alt }) {
              return <img src={src} alt={alt ?? ""} className="rounded-lg max-w-full h-auto my-4 border border-neutral-800" />; // eslint-disable-line @next/next/no-img-element
            },
          }}
        >
          {cleanReadmeHtml(readmeContent)}
        </ReactMarkdown>
      </div>
    </section>
  );
}
