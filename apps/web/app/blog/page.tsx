import { getAllPosts } from "@/lib/blog";
import { generateBlogIndexJsonLd } from "@/lib/blog-jsonld";
import { safeJsonLd } from "@/lib/json-ld";
import { SITE_URL } from "@mcpfind/shared";
import { Navbar } from "@/components/ui/navbar";
import { PostCard } from "@/components/blog/post-card";
import { BlogCategoryFilter } from "@/components/blog/blog-category-filter";
import { BlogFilterProvider, BlogFilteredPost, BlogArticleCount, BlogEmptyCategory } from "@/components/blog/blog-filter-state";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import type { Metadata } from "next";

// Published files change only with deployments. Avoid hourly ISR rewrites and
// fail the build if request-time dependencies are accidentally reintroduced.
export const dynamic = 'error';
export const revalidate = false;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, tutorials, and analysis on MCP servers and the Model Context Protocol. Learn how to connect AI assistants to your tools and data.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: {
      "application/rss+xml": "/blog/feed.xml",
    },
  },
  openGraph: {
    title: "Blog | MCP Find",
    description:
      "Guides, tutorials, and analysis on MCP servers and the Model Context Protocol.",
    type: "website",
    url: `${SITE_URL}/blog`,
    images: [
      {
        url: `${SITE_URL}/og-image-mcp.png`,
        width: 1200,
        height: 630,
        alt: "MCP Find — The open-source way to find MCP servers",
      },
    ],
  },
};

export default function BlogIndexPage() {
  // Fetch all posts to derive category counts
  const allPosts = getAllPosts();

  // Derive categories sorted by count
  const categoryCounts = new Map<string, number>();
  allPosts.forEach((p) => {
    const cat = p.frontmatter.category;
    if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  });
  const categories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <BlogFilterProvider>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(generateBlogIndexJsonLd()),
          }}
        />

        <Navbar variant="sticky" />

        {/* Hero */}
        <div className="border-b border-neutral-900 bg-neutral-950/50 pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
              <Link
                href="/"
                className="hover:text-white flex items-center gap-1.5 transition-colors duration-200"
              >
                <IconArrowLeft size={14} />
                Home
              </Link>
              <span>/</span>
              <span className="text-neutral-300">Blog</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl leading-relaxed">
              Guides, tutorials, and analysis on MCP servers and the Model Context
              Protocol. Learn how to connect AI assistants to your tools and data.
            </p>
            {allPosts.length > 0 && (
              <p className="text-neutral-500 text-sm mt-4">
                <BlogArticleCount categories={categories} totalCount={allPosts.length} />
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile: horizontal filter row */}
          <div className="sm:hidden mb-6">
            <BlogCategoryFilter
              categories={categories}
              totalCount={allPosts.length}
            />
          </div>

          <div className="flex gap-8">
            {/* Desktop: sidebar */}
            <aside className="shrink-0 w-48 hidden sm:block">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <BlogCategoryFilter
                categories={categories}
                totalCount={allPosts.length}
              />
            </aside>

            {/* Posts grid */}
            <main className="flex-1 min-w-0">
              <BlogEmptyCategory categories={categories} />
              {allPosts.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
                  {allPosts.map((post) => (
                    <BlogFilteredPost key={post.slug} category={post.frontmatter.category}>
                      <PostCard post={post} className="h-full" />
                    </BlogFilteredPost>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-20">
                  <p className="text-neutral-500 text-lg">
                    No articles published yet. Check back soon!
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </BlogFilterProvider>
  );
}
