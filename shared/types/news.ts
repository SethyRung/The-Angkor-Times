import * as z from "zod";

export const newsFormSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  content: z.string().min(1, "Content is required."),
  featuredImage: z.string().optional().default(""),
  categoryId: z.string().min(1, "Category is required."),
});

export type NewsFormSchema = z.output<typeof newsFormSchema>;

export interface NewsCategory {
  id: string;
  name: string;
}
