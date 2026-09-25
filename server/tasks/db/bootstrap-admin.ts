import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

export default defineTask({
  meta: {
    name: "db:bootstrap-admin",
    description: "Upserts the admin user from runtimeConfig.admin so login works in dev",
  },
  async run() {
    const config = useRuntimeConfig();
    const email = config.admin?.email;
    const password = config.admin?.password;

    if (!email || !password) {
      return { result: "skipped", reason: "ADMIN_EMAIL or ADMIN_PASSWORD not set" };
    }

    const passwordHash = await hashPassword(password);

    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existing.length) {
      await db
        .update(schema.users)
        .set({ role: "admin", emailVerified: true })
        .where(eq(schema.users.id, existing[0]!.id));
      await db
        .update(schema.accounts)
        .set({ password: passwordHash })
        .where(eq(schema.accounts.userId, existing[0]!.id));
      return { result: "updated", email };
    }

    const inserted = await db
      .insert(schema.users)
      .values({
        email,
        name: "Site Admin",
        firstName: "Site",
        lastName: "Admin",
        role: "admin",
        emailVerified: true,
      })
      .returning();

    const user = inserted[0]!;

    await db.insert(schema.accounts).values({
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: passwordHash,
    });

    return { result: "created", email };
  },
});
