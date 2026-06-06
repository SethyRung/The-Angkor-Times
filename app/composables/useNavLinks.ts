import type { NavigationMenuItem } from "@nuxt/ui";

export function useNavLinks() {
  const navItems = computed<NavigationMenuItem[]>(() => [
    { label: "Technology", to: "/category/technology" },
    { label: "Business", to: "/category/business" },
    { label: "Culture", to: "/category/culture" },
    { label: "Sports", to: "/category/sports" },
    { label: "Politics", to: "/category/politics" },
  ]);

  return { navItems };
}
