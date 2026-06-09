import * as z from "zod";

export const userFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
  role: z.enum(["admin", "editor"], { message: "Role is required." }),
  password: z.string().optional().default(""),
});

export type UserFormSchema = z.output<typeof userFormSchema>;
