"use client";

import { useBlogFilter } from "./blog-filter-state";
import { cn } from "@/lib/utils";

interface CategoryItem {
  name: string;
  count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "ai-ml": "AI & ML",
  devtools: "Developer Tools",
  general: "General",
  security: "Security",
  databases: "Databases",
  productivity: "Productivity",
  communication: "Communication",
  cloud: "Cloud",
  search: "Search",
};

function formatCategory(name: string): string {
  return CATEGORY_LABELS[name] || name.charAt(0).toUpperCase() + name.slice(1);
}

export function BlogCategoryFilter({
  categories,
  totalCount,
}: {
  categories: CategoryItem[];
  totalCount: number;
}) {
  const { activeCategory, selectCategory: handleClick } = useBlogFilter();

  const buttonBase =
    "px-3 py-1.5 rounded-lg text-sm transition-colors duration-200";
  const buttonActive = "bg-blue-600/20 text-blue-300";
  const buttonInactive =
    "text-neutral-400 hover:text-white hover:bg-neutral-900";

  return (
    <>
      {/* Desktop: vertical list */}
      <nav className="hidden sm:flex flex-col gap-0.5">
        <button
          onClick={() => handleClick(null)}
          className={cn(
            buttonBase,
            "w-full text-left",
            !activeCategory ? buttonActive : buttonInactive
          )}
        >
          All{" "}
          <span className="text-neutral-600 text-xs">({totalCount})</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              handleClick(activeCategory === cat.name ? null : cat.name)
            }
            className={cn(
              buttonBase,
              "w-full text-left",
              activeCategory === cat.name ? buttonActive : buttonInactive
            )}
          >
            {formatCategory(cat.name)}{" "}
            <span className="text-neutral-600 text-xs">({cat.count})</span>
          </button>
        ))}
      </nav>

      {/* Mobile: horizontal scroll */}
      <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => handleClick(null)}
          className={cn(
            buttonBase,
            "whitespace-nowrap",
            !activeCategory ? buttonActive : buttonInactive
          )}
        >
          All ({totalCount})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              handleClick(activeCategory === cat.name ? null : cat.name)
            }
            className={cn(
              buttonBase,
              "whitespace-nowrap",
              activeCategory === cat.name ? buttonActive : buttonInactive
            )}
          >
            {formatCategory(cat.name)} ({cat.count})
          </button>
        ))}
      </div>
    </>
  );
}
