export interface ClientProject {
  id: string;
  name: string;
  category: "Education & Institutional" | "Cinema & Entertainment" | "Real Estate & Infrastructure" | "Corporate";
  city: string;
  image: string;
  descriptionPlaceholder: string;
  isConfirmed: boolean;
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
    isConfirmed: true,
  },
  {
    id: "ckb",
    name: "Chaphalkar Karandikar Brothers",
    category: "Cinema & Entertainment",
    city: "Pune, Maharashtra",
    image: "/images/projects/ckb.jpg",
    descriptionPlaceholder:
      "Commercial cinema projection, acoustic treatments, and professional audio integration [TODO: confirm project scope with client].",
    isConfirmed: true,
  },
  {
    id: "city-pride",
    name: "City Pride Theatre",
    category: "Cinema & Entertainment",
    city: "Pune, Maharashtra",
    image: "/images/projects/city-pride.jpg",
    descriptionPlaceholder:
      "Multiplex audio-visual modernization, high-fidelity surround acoustics, and digital theatre signage [TODO: confirm project scope with client].",
    isConfirmed: true,
  },
  {
    id: "padmm",
    name: "Padmm Constructions",
    category: "Real Estate & Infrastructure",
    city: "Pune, Maharashtra",
    image: "/images/projects/padmm.jpg",
    descriptionPlaceholder:
      "Corporate boardroom AV infrastructure, presentation suites, and digital collaboration spaces [TODO: confirm project scope with client].",
    isConfirmed: true,
  },
  {
    id: "pc-patil",
    name: "PC Patil and Company",
    category: "Real Estate & Infrastructure",
    city: "Pune, Maharashtra",
    image: "/images/projects/pc-patil.jpg",
    descriptionPlaceholder:
      "Executive conferencing, one-touch automation suites, and meeting room technology [TODO: confirm project scope with client].",
    isConfirmed: true,
  },
];
