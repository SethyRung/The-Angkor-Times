import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import * as z from "zod";
import type { DbNews } from "#shared/types";

export default defineEventHandler(async (event) => {
  const id = z.uuid().safeParse(getRouterParam(event, "id"));
  if (!id.success) {
    return createResponse(
      { code: ApiResponseCode.ValidationError, message: "A valid news id is required" },
      null,
    );
  }

  try {
    const [row] = await db.select().from(schema.news).where(eq(schema.news.id, id.data)).limit(1);

    if (!row) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "News not found" }, null);
    }

    const data: DbNews = {
      ...row,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      createdAt: row.createdAt?.toISOString() ?? null,
      updatedAt: row.updatedAt?.toISOString() ?? null,
    };

    return createResponse({ code: ApiResponseCode.Success, message: "OK" }, data);
  } catch (error) {
    console.error("[admin/news GET :id]", error);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to fetch news" },
      null,
    );
  }
});
