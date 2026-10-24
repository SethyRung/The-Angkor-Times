import { randomBytes } from "node:crypto";
import { db, schema } from "@nuxthub/db";
import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import type { PublicUser } from "./index.get";

const VALID_ROLES = ["admin", "editor"] as const;
type Role = (typeof VALID_ROLES)[number];

interface CreateUserBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  isAgent?: boolean;
}

function isValidRole(role: string): role is Role {
  return (VALID_ROLES as readonly string[]).includes(role);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateUserBody>(event);

    if (!body?.email || !body?.role) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "email and role are required",
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

    const isAgent = body.isAgent === true;
    if (isAgent && body.role !== "editor") {
      return createResponse(
        { code: ApiResponseCode.ValidationError, message: "Only an Editor can be an agent" },
        null,
      );
    }

    const password =
      isAgent && (!body.password || body.password.length < 8)
        ? randomBytes(32).toString("base64url")
        : body.password;

    if (!password || password.length < 8) {
      return createResponse(
        {
          code: ApiResponseCode.ValidationError,
          message: "Password must be at least 8 characters",
        },
        null,
      );
    }

    const firstName = body.firstName ?? null;
    const lastName = body.lastName ?? null;
    const name = [firstName, lastName].filter(Boolean).join(" ") || body.email;

    const user = await adminApi(event).createUser({
      body: {
        email: body.email,
        password,
        name,
        role: body.role,
        data: { firstName, lastName },
      },
      headers: event.headers,
    });

    await db.update(schema.users).set({ isAgent }).where(eq(schema.users.id, user.user.id));

    const created = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, user.user.id))
      .limit(1);

    if (!created.length) {
      return createResponse(
        { code: ApiResponseCode.InternalError, message: "Failed to create user" },
        null,
      );
    }

    const data: PublicUser = { ...created[0]!, tokens: [] };

    return createResponse({ code: ApiResponseCode.Success, message: "User created" }, data);
  } catch (e) {
    if (e instanceof APIError) {
      return createResponse({ code: ApiResponseCode.ValidationError, message: e.message }, null);
    }
    console.error("[admin/users POST]", e);
    return createResponse(
      { code: ApiResponseCode.InternalError, message: "Failed to create user" },
      null,
    );
  }
});
