import type { Category } from "./Category";

export type Navigation = {
  id: string;
  label: string;
  url: string;
  category: Category;
};
