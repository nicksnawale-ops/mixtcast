export interface Testimonial {
  quote: string;
  author: string;
  organization: string;
  rating: number;
}

/** Client testimonials, verbatim as provided by the client. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The Digital AV Classroom solution delivered by Mixtcast exceeded our expectations. From planning and installation to commissioning and training, every stage was executed efficiently, resulting in a reliable and user-friendly learning environment.",
    author: "HOD",
    organization: "AFMC",
    rating: 5,
  },
  {
    quote:
      "We are pleased with Mixtcast's timely delivery of quality IT hardware and peripherals. Their commitment to reliability, professionalism, and customer satisfaction ensured a smooth procurement experience from start to finish.",
    author: "Administration Department",
    organization: "Shree Shaneshwar Devasthan, Shani Shingnapur",
    rating: 5,
  },
  {
    quote:
      "From desktops and laptops to servers, printers, and IT accessories, Mixtcast delivered reliable products with exceptional service and on-time execution. We highly recommend them for enterprise IT procurement.",
    author: "Secretary",
    organization: "Mula Education Society, Sonai",
    rating: 5,
  },
];
