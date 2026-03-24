export type SidebarNavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  /** If true, link is shown only for signed-in users */
  requiresAuth?: boolean;
};

export const sidebarNavItems: SidebarNavItem[] = [
  { id: "store", label: "Крамниця", icon: "🛒", href: "/store" },
  {
    id: "library",
    label: "Бібліотека",
    icon: "📚",
    href: "/library",
    requiresAuth: true,
  },
  {
    id: "unreal",
    label: "Мої замовлення",
    icon: "⚙️",
    href: "/orders",
    requiresAuth: true,
  },
  { id: "fab", label: "Fab", icon: "🎁", href: "/fab" },
];
