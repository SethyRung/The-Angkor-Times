import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";

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
        .set({ passwordHash, role: "admin" })
        .where(eq(schema.users.id, existing[0]!.id));
      return { result: "updated", email };
    }

    await db.insert(schema.users).values({
      email,
      passwordHash,
      firstName: "Site",
      lastName: "Admin",
      role: "admin",
    });

    return { result: "created", email };
  },
});
