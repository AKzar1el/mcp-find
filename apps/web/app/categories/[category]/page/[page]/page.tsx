import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryDirectory, getCategoryPageMetadata } from '@/components/category-directory';
import { parseCategoryPage } from '@/lib/category-pagination';

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() { return []; }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}): Promise<Metadata> {
  const { category, page: rawPage } = await params;
  const page = parseCategoryPage(rawPage);
  if (!page) return { title: 'Category Page Not Found', robots: { index: false, follow: false } };
  return getCategoryPageMetadata(category, page);
}

export default async function CategoryPaginationPage({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}) {
  const { category, page: rawPage } = await params;
  const page = parseCategoryPage(rawPage);
  if (!page) notFound();
  return <CategoryDirectory category={category} page={page} />;
}
