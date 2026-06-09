import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "~~/server/utils/auth";
import type { PublicUser } from "./index.get";

const VALID_ROLES = ["admin", "editor"] as const;
type Role = (typeof VALID_ROLES)[number];

interface CreateUserBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}

function isValidRole(role: string): role is Role {
  return (VALID_ROLES as readonly string[]).includes(role);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateUserBody>(event);

    if (!body?.email || !body?.password || !body?.role) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "email, password, and role are required",
        },
        null,
      );
    }

    if (body.password.length < 8) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Password must be at least 8 characters",
        },
        null,
      );
    }

    if (!isValidRole(body.role)) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "role must be 'admin' or 'editor'" },
        null,
      );
    }

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .limit(1);

    if (existing.length) {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Email already registered" },
        null,
      );
    }

    const passwordHash = await hashPassword(body.password);

    const inserted = await db
      .insert(schema.users)
      .values({
        email: body.email,
        passwordHash,
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        role: body.role,
      })
      .returning();

    if (!inserted.length) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create user" },
        null,
      );
    }

    const row = inserted[0]!;
    const { passwordHash: _passwordHash, ...publicUser } = row;
    const data: PublicUser = publicUser;

    return createResponse({ code: ApiResponseCode.Success, message: "User created" }, data);
  } catch (e) {
    console.error("[admin/users POST]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to create user" },
      null,
    );
  }
});
