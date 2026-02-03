export interface NavLink {
  href: string;
  label: string;
}

export const HOME_NAV_LINKS: NavLink[] = [
  { href: "/instagram", label: "Instagram" },
  { href: "/apollo", label: "Apollo" },
  { href: "/Eleuthia", label: "Eleuthia" },
  { href: "/timeline", label: "Timeline" },
  { href: "/health", label: "Health" },
  { href: "/wealth", label: "Wealth" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learning", label: "Learning" },
  { href: "/settings", label: "Settings" },
];

export const HOME_CIRCLE_RADIUS = 280;
