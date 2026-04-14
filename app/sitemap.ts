import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, link: true, updatedAt: true }
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true }
  });

  const productUrls = products.map((product) => ({
    url: `https://tsquarey.store/products/${product.link || product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `https://tsquarey.store/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://tsquarey.store',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://tsquarey.store/products',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://tsquarey.store/categories',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...categoryUrls,
    ...productUrls,
  ]
}