export * from "./response";

import type {
  users,
  categories,
  tags,
  news,
  newsTags,
  navigation,
  refreshTokens,
} from "hub:db:schema";

type DateOrNull<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: string | null;
};

export type DbUser = DateOrNull<typeof users.$inferSelect, "createdAt" | "updatedAt">;
export type DbCategory = DateOrNull<typeof categories.$inferSelect, "createdAt">;
export type DbTag = DateOrNull<typeof tags.$inferSelect, "createdAt">;
export type DbNews = DateOrNull<
  typeof news.$inferSelect,
  "createdAt" | "updatedAt" | "publishedAt"
>;
export type DbNewsTag = typeof newsTags.$inferSelect;
export type DbNavigation = DateOrNull<typeof navigation.$inferSelect, "createdAt">;
export type DbRefreshToken = DateOrNull<
  typeof refreshTokens.$inferSelect,
  "createdAt" | "expiresAt" | "revokedAt"
>;

export interface NewsWithRelations extends DbNews {
  category: Pick<DbCategory, "id" | "name" | "slug"> | null;
  author: Pick<DbUser, "id" | "firstName" | "lastName"> | null;
  tags?: Pick<DbTag, "id" | "name" | "slug">[];
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}
