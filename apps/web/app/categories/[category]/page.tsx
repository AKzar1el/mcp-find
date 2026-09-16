import type { Metadata } from 'next';
import { CategoryDirectory, getCategoryPageMetadata } from '@/components/category-directory';

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() { return []; }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return getCategoryPageMetadata(category, 1);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <CategoryDirectory category={category} page={1} />;
}
