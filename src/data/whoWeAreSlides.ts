import { SOLUTIONS } from "./solutions";

/**
 * Home "Who We Are" featured-photo slideshow. Images are ones already in the project; titles and alt text come from
 * the Solutions data. `companyPhoto` is true only for images credited as company-owned in IMAGE_CREDITS.md — the
 * "Pune, India" location pill is shown only on those, so no stock photo is presented as a MixtCast location.
 */
export interface WhoWeAreSlide {
  id: string;
  image: string;
  image800: string;
  /** Intrinsic width of `image`, for the srcSet descriptor. */
  width: number;
  alt: string;
  title: string;
  eyebrow: string;
  companyPhoto: boolean;
}

const EYEBROW = "FEATURED ENVIRONMENT";

const fromSpace = (slug: string, companyPhoto: boolean): WhoWeAreSlide => {
  const space = SOLUTIONS.find((s) => s.slug === slug);
  if (!space) throw new Error(`Unknown solutions space: ${slug}`);
  return {
    id: slug,
    image: space.photo,
    image800: space.photo.replace(/\.webp$/, "-800.webp"),
    width: 1600,
    alt: space.photoAlt,
    title: space.title,
    eyebrow: EYEBROW,
    companyPhoto,
  };
};

export const WHO_WE_ARE_SLIDES: WhoWeAreSlide[] = [
  {
    id: "who-we-are",
    image: "/images/home/who-we-are.webp",
    image800: "/images/home/who-we-are-800.webp",
    width: 1400,
    alt: "Professional podcast studio with a boom-arm microphone, headphones and acoustic wall panels",
    title: "Acoustic Studio & Podcast Suites",
    eyebrow: EYEBROW,
    companyPhoto: false, // Pexels (stock)
  },
  fromSpace("auditoriums", false), // Unsplash (stock)
  fromSpace("conference-boardrooms", true), // company-owned
  fromSpace("commercial-theatres", false), // Unsplash (stock)
  fromSpace("residential-home-theatres", true), // company-owned
  fromSpace("educational-institutions", false), // Unsplash (stock)
  fromSpace("training-centers", false), // Unsplash (stock)
];

/** Slideshow timing (s). */
export const SLIDESHOW = {
  intervalS: 5.5,
  crossfadeS: 0.9,
  titleS: 0.3,
  /** Pause after the projector reveal before the first advance. */
  startAfterRevealS: 0.6,
};
