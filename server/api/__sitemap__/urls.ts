import { db, schema } from "@nuxthub/db";
import { desc, isNotNull } from "drizzle-orm";

export default defineSitemapEventHandler(async () => {
  const [stories, categories] = await Promise.all([
    db
      .select({
        id: schema.news.id,
        title: schema.news.title,
        publishedAt: schema.news.publishedAt,
        updatedAt: schema.news.updatedAt,
        featuredImage: schema.news.featuredImage,
      })
      .from(schema.news)
      .where(isNotNull(schema.news.publishedAt))
      .orderBy(desc(schema.news.publishedAt)),
    db.select({ slug: schema.categories.slug }).from(schema.categories),
  ]);

  return [
    ...categories.map((category) => ({
      loc: `/category/${category.slug}`,
    })),
    ...stories.map((story) => ({
      loc: `/news/${story.id}`,
      lastmod: story.updatedAt ?? story.publishedAt ?? undefined,
      images: story.featuredImage ? [{ loc: story.featuredImage, title: story.title }] : undefined,
    })),
  ];
});
