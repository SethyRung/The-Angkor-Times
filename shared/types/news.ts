export interface Category {
  id: string;
  name: string;
}

export interface NewsAuthor {
  id: string;
  first_name?: string;
  last_name?: string;
}

export interface NewsTag {
  id: string;
  name: string;
}

export type NewsStatus = "Pending Approval" | "Published" | "Rejected";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  featured_image: string;
  category: Category;
  author: NewsAuthor;
  tags: NewsTag[];
  status: NewsStatus;
  date_published: string;
  date_created: string;
  date_updated: string;
}

export interface NavLink {
  id: string;
  label: string;
  url: string;
  order: number;
  category: Category;
}

export type TileVariant = "mint" | "ultraviolet" | "yellow" | "pink" | "orange" | "white" | "dark";
