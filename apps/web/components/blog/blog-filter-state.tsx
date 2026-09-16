"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const BlogFilterContext = createContext({
  activeCategory: null as string | null,
  selectCategory: (_category: string | null) => {},
});

// Posts live in the deployment, not a database. Keep their HTML prerendered and
// filter it locally rather than invoking a server function for every category.
export function BlogFilterProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setActiveCategory(new URLSearchParams(window.location.search).get("category") || null);
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function selectCategory(category: string | null) {
    const url = new URL(window.location.href);
    if (category) url.searchParams.set("category", category);
    else url.searchParams.delete("category");
    window.history.pushState(null, "", url);
    setActiveCategory(category);
  }

  return <BlogFilterContext.Provider value={{ activeCategory, selectCategory }}>{children}</BlogFilterContext.Provider>;
}

export function useBlogFilter() {
  return useContext(BlogFilterContext);
}

export function BlogFilteredPost({ category, children }: { category?: string; children: ReactNode }) {
  const { activeCategory } = useBlogFilter();
  return <li hidden={Boolean(activeCategory && activeCategory !== category)}>{children}</li>;
}

export function BlogArticleCount({ categories, totalCount }: {
  categories: { name: string; count: number }[];
  totalCount: number;
}) {
  const { activeCategory } = useBlogFilter();
  const count = activeCategory ? categories.find(category => category.name === activeCategory)?.count ?? 0 : totalCount;
  return <>{count} {count === 1 ? "article" : "articles"}{activeCategory && ` in ${activeCategory}`}</>;
}

export function BlogEmptyCategory({ categories }: { categories: { name: string; count: number }[] }) {
  const { activeCategory } = useBlogFilter();
  if (!activeCategory || categories.some(category => category.name === activeCategory)) return null;
  return <p className="text-neutral-500 text-lg text-center py-20">No articles in this category.</p>;
}
