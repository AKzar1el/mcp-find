import Link from "next/link";
import type { Metadata } from "next";
import { IconPlugOff, IconArrowLeft, IconSearch } from "@tabler/icons-react";

// A missing URL must not inherit the site-wide homepage canonical or index
// directive from layout.tsx. Next adds noindex to notFound() responses; this
// explicit metadata keeps the rendered document unambiguous and preserves
// follow for any links on the helpful error page.
export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <IconPlugOff size={44} className="text-neutral-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-xs font-bold">404</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
          Page Not Found
        </h1>
        <p className="text-neutral-400 text-lg mb-2">
          This page doesn&apos;t exist or may have been removed.
        </p>
        <p className="text-neutral-600 text-sm mb-10">
          The page you&apos;re looking for is missing from our directory.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/servers"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            <IconSearch size={18} />
            Browse Servers
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
          >
            <IconArrowLeft size={18} />
            Go Home
          </Link>
        </div>

        <div className="mt-16 opacity-20">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="h-8 rounded-lg bg-neutral-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
