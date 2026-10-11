export interface NavLinkItem {
  label: string;
  path: string;
}

export const MAIN_NAV_LINKS: NavLinkItem[] = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Solutions", path: "/solutions" },
  { label: "Projects", path: "/projects" },
  { label: "Partners", path: "/partners" },
  { label: "Contact", path: "/contact" },
];

export const FOOTER_QUICK_LINKS: NavLinkItem[] = [
  { label: "Corporate Profile", path: "/about" },
  { label: "Engineered Solutions", path: "/solutions" },
  { label: "Client Portfolio", path: "/projects" },
  { label: "Technology Partners", path: "/partners" },
  { label: "Get a Consultation", path: "/contact" },
];
