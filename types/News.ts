import type { Author } from "./Author";
import type { Category } from "./Category";

export type News = {
  id: string;
  title: string;
  content: string;
  author: Author;
  featured_image: string;
  description: string;
  category: Category;
  date_published: string;
  tags: number[];
};
