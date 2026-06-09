import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "~~/server/utils/auth";
import type { PublicUser } from "./index.get";

const VALID_ROLES = ["admin", "editor"] as const;
type Role = (typeof VALID_ROLES)[number];

interface UpdateUserBody {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

function isValidRole(role: string): role is Role {
  return (VALID_ROLES as readonly string[]).includes(role);
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");
    if (!id) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "User id required" },
        null,
      );
    }

    const me = event.context.user as { userId: string; role: string } | undefined;
    if (!me) {
      return createResponse(
        { code: ApiResponseCode.Unauthorized, message: "Authentication required" },
        null,
      );
    }

    const body = await readBody<UpdateUserBody>(event);

    if (body.role !== undefined && !isValidRole(body.role)) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "role must be 'admin' or 'editor'" },
        null,
      );
    }

    if (body.password !== undefined && body.password.length < 8) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Password must be at least 8 characters",
        },
        null,
      );
    }

    if (me.userId === id && body.role === "editor") {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "You cannot demote your own admin account",
        },
        null,
      );
    }

    if (body.email !== undefined) {
      const dup = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);
      if (dup.length && dup[0]!.id !== id) {
        return createResponse(
          { code: ApiResponseCode.ValidationError, message: "Email already in use" },
          null,
        );
      }
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.email !== undefined) update.email = body.email;
    if (body.firstName !== undefined) update.firstName = body.firstName;
    if (body.lastName !== undefined) update.lastName = body.lastName;
    if (body.role !== undefined) update.role = body.role;
    if (body.password !== undefined && body.password.length > 0) {
      update.passwordHash = await hashPassword(body.password);
    }

    const updated = await db
      .update(schema.users)
      .set(update)
      .where(eq(schema.users.id, id))
      .returning();

    if (!updated.length) {
      return createResponse({ code: ApiResponseCode.NotFound, message: "User not found" }, null);
    }

    const row = updated[0]!;
    const { passwordHash: _passwordHash, ...publicUser } = row;
    const data: PublicUser = publicUser;

    return createResponse({ code: ApiResponseCode.Success, message: "User updated" }, data);
  } catch (e) {
    console.error("[admin/users PUT]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to update user" },
      null,
    );
  }
});
