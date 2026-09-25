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

    const firstName = body.firstName ?? null;
    const lastName = body.lastName ?? null;
    const name = [firstName, lastName].filter(Boolean).join(" ") || body.email;

    const auth = serverAuth(event);
    const user = await auth.api.createUser({
      body: {
        email: body.email,
        password: body.password,
        name,
        role: body.role,
        data: { firstName, lastName },
      },
      headers: event.headers,
    });

    const data: PublicUser = {
      ...user.user,
      firstName,
      lastName,
      role: user.user.role ?? null,
      image: user.user.image ?? null,
      banReason: user.user.banReason ?? null,
      banExpires: user.user.banExpires ?? null,
    };

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
