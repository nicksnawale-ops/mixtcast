export interface ClientProject {
  id: string;
  name: string;
  /** Categories (to confirm with each client): Education & Institutional, Cinema & Entertainment,
   *  Real Estate & Infrastructure, Corporate. */
  category:
    | "Education & Institutional"
    | "Cinema & Entertainment"
    | "Real Estate & Infrastructure"
    | "Corporate"
    | "Religious & Public Trusts";
  city: string;
  image: string;
  // Project descriptions are unconfirmed placeholders — do not display until verified with the client.
  descriptionPlaceholder: string;
  /** Whether `descriptionPlaceholder` has been verified with the client (it is not shown on Home until it is). */
  descriptionVerified?: boolean;
  isConfirmed: boolean;
  /** Confirmed project scope (shown on the Projects page); omit until confirmed with the client. */
  scope?: string;
  /** Project confirmed as delivered (shows "Delivered" on the Projects page). */
  confirmed: boolean;
  /** Links a testimonial (data/testimonials.ts) by its `organization`. */
  testimonialOrg?: string;
}

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "afmc",
    name: "Armed Forces Medical College",
    category: "Education & Institutional",
    city: "Pune, Maharashtra",
    image: "/images/projects/afmc.jpg",
    descriptionPlaceholder:
      "Advanced institutional auditorium and medical lecture theatre AV integration [TODO: confirm project scope with client].",
    descriptionVerified: false,
    isConfirmed: true,
    scope: "Digital AV Classroom — planning, installation, commissioning and training",
    confirmed: true,
    testimonialOrg: "AFMC",
  },
  {
    id: "ckb",
    name: "Chaphalkar Karandikar Brothers",
    category: "Cinema & Entertainment",
    city: "Pune, Maharashtra",
    image: "/images/projects/ckb.jpg",
    descriptionPlaceholder:
      "Commercial cinema projection, acoustic treatments, and professional audio integration [TODO: confirm project scope with client].",
    descriptionVerified: false,
    isConfirmed: true,
    confirmed: false,
  },
  {
    id: "city-pride",
    name: "City Pride Theatre",
    category: "Cinema & Entertainment",
    city: "Pune, Maharashtra",
    image: "/images/projects/city-pride.jpg",
    descriptionPlaceholder:
      "Multiplex audio-visual modernization, high-fidelity surround acoustics, and digital theatre signage [TODO: confirm project scope with client].",
    descriptionVerified: false,
    isConfirmed: true,
    confirmed: false,
  },
  {
    id: "padmm",
    name: "Padmm Constructions",
    category: "Real Estate & Infrastructure",
    city: "Pune, Maharashtra",
    image: "/images/projects/padmm.jpg",
    descriptionPlaceholder:
      "Corporate boardroom AV infrastructure, presentation suites, and digital collaboration spaces [TODO: confirm project scope with client].",
    descriptionVerified: false,
    isConfirmed: true,
    confirmed: false,
  },
  {
    id: "pc-patil",
    name: "PC Patil and Company",
    category: "Real Estate & Infrastructure",
    city: "Pune, Maharashtra",
    image: "/images/projects/pc-patil.jpg",
    descriptionPlaceholder:
      "Executive conferencing, one-touch automation suites, and meeting room technology [TODO: confirm project scope with client].",
    descriptionVerified: false,
    isConfirmed: true,
    confirmed: false,
  },
];

/** Additional clients shown on the Projects page only (Home keeps rendering CLIENT_PROJECTS as before). */
const ADDITIONAL_PROJECTS: ClientProject[] = [
  {
    id: "shani-shingnapur",
    name: "Shree Shaneshwar Devasthan, Shani Shingnapur",
    category: "Religious & Public Trusts",
    city: "", // location not confirmed — not displayed
    image: "",
    descriptionPlaceholder: "",
    descriptionVerified: false,
    isConfirmed: true,
    scope: "IT hardware and peripherals supply",
    confirmed: true,
    testimonialOrg: "Shree Shaneshwar Devasthan, Shani Shingnapur",
  },
  {
    id: "mula-education-society",
    name: "Mula Education Society, Sonai",
    category: "Education & Institutional",
    city: "", // location not confirmed — not displayed
    image: "",
    descriptionPlaceholder: "",
    descriptionVerified: false,
    isConfirmed: true,
    scope: "Enterprise IT procurement — desktops, laptops, servers, printers and IT accessories",
    confirmed: true,
    testimonialOrg: "Mula Education Society, Sonai",
  },
];

/** Projects page order. Only `name`, `category`, `scope` and linked testimonials are displayed there. */
const PROJECT_ORDER = ["afmc", "mula-education-society", "shani-shingnapur", "city-pride", "ckb", "padmm", "pc-patil"];
const ALL_PROJECTS = [...CLIENT_PROJECTS, ...ADDITIONAL_PROJECTS];
export const PROJECTS: ClientProject[] = PROJECT_ORDER.map((id) => ALL_PROJECTS.find((p) => p.id === id)!).filter(Boolean);
