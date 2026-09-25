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
    }),
  },
});
