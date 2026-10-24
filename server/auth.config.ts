import { createAuthMiddleware, APIError } from "better-auth/api";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { defineServerAuth } from "@nuxtjs/better-auth/config";

const ac = createAccessControl(defaultStatements);
const adminRole = ac.newRole({
  ...adminAc.statements,
});
const editorRole = ac.newRole({
  user: [],
  session: [],
});

export default defineServerAuth({
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        input: true,
        required: false,
      },
      lastName: {
        type: "string",
        input: true,
        required: false,
      },
      isAgent: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        editor: editorRole,
      },
      defaultRole: "editor",
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        throw new APIError("BAD_REQUEST", {
          message: "Sign-up is disabled. Accounts are created by an administrator.",
        });
      }

      if (ctx.path === "/sign-in/email") {
        const email = typeof ctx.body?.email === "string" ? ctx.body.email : "";
        if (!email) return;

        const { db, schema } = await import("@nuxthub/db");
        const { eq } = await import("drizzle-orm");
        const rows = await db
          .select({ isAgent: schema.users.isAgent })
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        if (rows[0]?.isAgent) {
          throw new APIError("FORBIDDEN", {
            message: "Agents cannot sign in.",
          });
        }
      }
    }),
  },
});
