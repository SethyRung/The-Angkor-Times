UPDATE "users" SET "role" = 'editor' WHERE "role" = 'author';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'editor';--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('admin', 'editor'));
