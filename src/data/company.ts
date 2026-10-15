export interface CoreValue {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface LeadershipMember {
  name: string;
  designation: string; // "TODO: confirm title"
  bio: string;
  image: string;
}

export const COMPANY_INFO = {
  legalName: "MixtCast Visual Solutions Private Limited",
  brandName: "MIXTCAST",
  tagline: "Where Expertise Meets Innovation",
  philosophy: "Your vision, our technology — brought to life.",
  callToAction: "Let's create intelligent and immersive AV experiences.",
  shortDescription:
    "A dynamic and innovative Audio-Video integration company committed to designing and delivering world-class AV environments.",
  aboutParagraphs: [
    "MixtCast Visual Solutions Private Limited is a dynamic and innovative Audio-Video integration company committed to designing and delivering world-class AV environments. We specialize in providing customized solutions for a wide range of spaces including auditoriums, movie theatres, conference rooms, boardrooms, educational institutions, training centers, and more.",
    "With a team of experienced professionals and a passion for technology, we integrate the latest in audio-visual systems to create seamless, immersive, and future-ready experiences. From high-fidelity sound systems and advanced projection setups to smart control systems and collaborative conferencing tools, we ensure every installation meets the highest standards of quality, usability, and aesthetics.",
    "At MixtCast, we believe in creating intelligent AV ecosystems that empower communication, enhance learning, and elevate entertainment. Whether it's a large-scale auditorium or an interactive classroom, our solutions are tailored to match the unique needs of each client.",
  ],
  vision:
    "To be a leading force in audio-visual innovation, transforming how people experience sound, sight, and space — across every auditorium, classroom, boardroom, and entertainment venue we serve.",
  mission:
    "To deliver intelligent, reliable, and future-ready AV solutions through cutting-edge technology, expert integration, and client-focused service — enhancing communication, learning, and immersive experiences across diverse environments.",
  contact: {
    contactPerson: "Yogesh Chaudhari",
    designation: "Director / Principal Consultant [TODO: confirm title]",
    emailPrimary: "Yogesh@mixtcast.in",
    emailSales: "Sales@mixtcast.in",
    phone: "+91 99607 61772",
    phoneRaw: "+919960761772",
    whatsapp: "https://wa.me/919960761772",
    website: "www.mixtcast.in",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    addressLine: "[TODO: add full registered office address, Pune, Maharashtra, India]",
    /** Headquarters street address (shown on the About page). */
    address: "326, Building No. 23, Lokamanya Nagar, LBS Road, Navi Peth, Pune 411030",
  },
  coreValues: [
    {
      id: "quality",
      title: "Uncompromising Quality",
      description:
        "Every acoustic calculation, display calibration, and cable run meets the highest global standards of engineering excellence.",
      icon: "ShieldCheck",
    },
    {
      id: "innovation",
      title: "Future-Ready Innovation",
      description:
        "Deploying next-generation AI audio processing, automated room controls, and ultra-high-definition visual engines.",
      icon: "Cpu",
    },
    {
      id: "client-first",
      title: "Client-First Customization",
      description:
        "We never force generic templates. Every space is engineered specifically for its architectural dynamics and human workflow.",
      icon: "Users",
    },
    {
      id: "reliability",
      title: "Rock-Solid Reliability",
      description:
        "Industrial-grade component selection, meticulous testing, and proactive after-sales maintenance you can depend on.",
      icon: "Headphones",
    },
  ] as CoreValue[],
  whyChooseUs: [
    {
      id: "customized-solutions",
      title: "Customized Solutions",
      description:
        "Tailored AV architecture engineered specifically for the architectural acoustics and functional requirements of your space.",
      icon: "Sliders",
    },
    {
      id: "experienced-team",
      title: "Experienced Team",
      description:
        "Certified acoustic and visual engineers with deep hands-on expertise across high-stakes corporate, academic, and theatrical venues.",
      icon: "Award",
    },
    {
      id: "timely-execution",
      title: "Timely Execution",
      description:
        "Disciplined project management guaranteeing precision installation, commissioning, and handover on committed schedules.",
      icon: "Clock",
    },
    {
      id: "seamless-integration",
      title: "Seamless Integration",
      description:
        "Harmonious cohesion between sound, vision, architectural lighting, and one-touch automation suites.",
      icon: "Layers",
    },
    {
      id: "reliable-after-sales",
      title: "Reliable After-Sales Support",
      description:
        "Comprehensive maintenance, operator staff training, and rapid-response technical assistance for uninterrupted operation.",
      icon: "LifeBuoy",
    },
  ],
  leadership: [
    {
      name: "Yogesh Chaudhari",
      designation: "Executive Leadership [TODO: confirm title]",
      bio: "Spearheading MixtCast's mission to engineer world-class acoustic and visual environments across institutional, cinema, and corporate sectors.",
      image: "/images/team/yogesh-chaudhari.jpg",
    },
  ] as LeadershipMember[],
  process: [
    {
      step: 1,
      title: "Consulting & Design",
      description: "Expert consultation and strategic system design for reliable, future-ready technology infrastructure.",
    },
    {
      step: 2,
      title: "Site Survey",
      description: "Comprehensive site surveys to evaluate infrastructure, requirements, and project feasibility.",
    },
    {
      step: 3,
      title: "Procurement & Logistics",
      description: "Efficient procurement and coordinated logistics for smooth and timely project delivery.",
    },
    {
      step: 4,
      title: "Installation & Integration",
      description: "End-to-end installation and integration services tailored to your operational requirements.",
    },
    {
      step: 5,
      title: "Product Training & Commissioning",
      description: "Seamless system commissioning with expert training for efficient and reliable operation.",
    },
    {
      step: 6,
      title: "Support & Maintenance",
      description: "Delivering prompt technical support and preventive maintenance for continuous business operations.",
    },
  ],
};
