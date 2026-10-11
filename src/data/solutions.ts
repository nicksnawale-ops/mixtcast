export interface SolutionSpace {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  challenge: string;
  solution: string;
  keySystems: { label: string; serviceSlug: string }[];
  image: string;
  outcomes: string[];
}

export const SOLUTIONS: SolutionSpace[] = [
  {
    id: "auditoriums",
    slug: "auditoriums",
    title: "Auditoriums & Grand Assembly Halls",
    tagline: "Large-capacity acoustics, stage production, and commanding visual presence.",
    challenge:
      "Large architectural spaces suffer from long reverberation times, uneven acoustic dead zones, poor sightlines from rear tiers, and complex stage operations that overwhelm non-technical staff.",
    solution:
      "We design custom electro-acoustic line arrays with delayed fills, high-gain laser projection or fine-pitch LED walls, automated motorized stage rigging, and single-touch master touchpanels that simplify complex auditorium operation.",
    keySystems: [
      { label: "Auditorium Designing", serviceSlug: "auditorium-designing" },
      { label: "Audio Designing", serviceSlug: "audio-designing" },
      { label: "Acoustic Solutions", serviceSlug: "acoustic-solutions" },
      { label: "Lighting Solutions", serviceSlug: "lighting-solutions" },
    ],
    image: "/images/solutions/auditorium.jpg",
    outcomes: [
      "100% speech intelligibility across all seating tiers",
      "Seamless single-operator touch controls for complex lighting and audio scenes",
      "Broadcast-grade multi-camera recording and live-streaming capability",
    ],
  },
  {
    id: "commercial-theatres",
    slug: "commercial-theatres",
    title: "Movie & Commercial Theatres",
    tagline: "DCI-certified laser projection and immersive 3D surround sound.",
    challenge:
      "Modern audiences demand pristine picture contrast, razor-sharp high-frame-rate projection, and enveloping three-dimensional soundscapes that rival the best multiplex experiences in the world.",
    solution:
      "MixtCast installs DCI-compliant laser projection, perforated acoustic screens, and multi-channel Dolby Atmos speaker arrays with specialized cinema acoustic wall drapery and isolation baffles.",
    keySystems: [
      { label: "Commercial Theatre", serviceSlug: "commercial-theatre" },
      { label: "Acoustic Solutions", serviceSlug: "acoustic-solutions" },
      { label: "Digital Signage Solutions", serviceSlug: "digital-signage-solutions" },
      { label: "Audio Designing", serviceSlug: "audio-designing" },
    ],
    image: "/images/solutions/commercial-theatre.jpg",
    outcomes: [
      "Cinema-grade color reproduction and HDR contrast compliance",
      "Uniform bass response without standing-wave distortions",
      "Integrated lobby digital signage and box-office display sync",
    ],
  },
  {
    id: "conference-boardrooms",
    slug: "conference-boardrooms",
    title: "Conference Rooms & Boardrooms",
    tagline: "Frictionless hybrid collaboration, beamforming audio, and executive clarity.",
    challenge:
      "Executives lose valuable meeting time fighting incompatible cables, unintelligible hybrid participant audio, distracting HVAC noise, and confusing conference interfaces.",
    solution:
      "We deploy AI-powered voice-tracking ceiling beamforming microphones, dual-display video setups with automated camera framing, and one-touch join consoles integrated with Microsoft Teams and Zoom Rooms.",
    keySystems: [
      { label: "AV Control Suite", serviceSlug: "av-control-suite" },
      { label: "AI in Audio Visual", serviceSlug: "ai-in-audio-visual" },
      { label: "Video Designing", serviceSlug: "video-designing" },
      { label: "Audio Designing", serviceSlug: "audio-designing" },
    ],
    image: "/images/solutions/boardroom.jpg",
    outcomes: [
      "Zero-setup meeting launches via automated calendar synchronization",
      "Crystal-clear speech pickup regardless of where participants sit",
      "Clean clutter-free conference tables with concealed under-desk routing",
    ],
  },
  {
    id: "educational-smart-classrooms",
    slug: "educational-institutions",
    title: "Educational Institutions & Smart Classrooms",
    tagline: "Active learning, interactive displays, and equitable hybrid lecture capture.",
    challenge:
      "Traditional lecture halls isolate remote or back-row students, while professors struggle with inflexible blackboard configurations and difficult recording workflows.",
    solution:
      "We install interactive touch panels, automated presenter tracking cameras, voice-lift amplification systems, and seamless lecture capture archives for asynchronous student review.",
    keySystems: [
      { label: "AI in Audio Visual", serviceSlug: "ai-in-audio-visual" },
      { label: "Video Designing", serviceSlug: "video-designing" },
      { label: "Audio Designing", serviceSlug: "audio-designing" },
      { label: "Acoustic Solutions", serviceSlug: "acoustic-solutions" },
    ],
    image: "/images/solutions/smart-classroom.jpg",
    outcomes: [
      "Intuitive digital whiteboarding and wireless device mirroring",
      "Equal auditory clarity for students seated anywhere in the room",
      "Automated lecture recording and upload to campus learning platforms",
    ],
  },
  {
    id: "training-centers",
    slug: "training-centers",
    title: "Corporate Training Centers",
    tagline: "High-engagement interactive workshop spaces and flexible modular setups.",
    challenge:
      "Corporate training spaces require flexible layouts (pod seating, classroom, theatre mode) that quickly break traditional fixed AV routing.",
    solution:
      "We build modular AV-over-IP architectures with wireless presentation gateways, zoning audio matrixes, and digital breakout screens that adapt dynamically to any workshop configuration.",
    keySystems: [
      { label: "AV Control Suite", serviceSlug: "av-control-suite" },
      { label: "Video Designing", serviceSlug: "video-designing" },
      { label: "Digital Signage Solutions", serviceSlug: "digital-signage-solutions" },
    ],
    image: "/images/solutions/training-center.jpg",
    outcomes: [
      "Swift room reconfiguration with saved software presets",
      "Independent breakout pod collaboration and master instructor takeover",
      "Enhanced retention through interactive multimedia displays",
    ],
  },
  {
    id: "home-theatres",
    slug: "residential-home-theatres",
    title: "Residential Home Theatres",
    tagline: "Private cinema sanctuaries with bespoke architectural acoustic luxury.",
    challenge:
      "Standard residential rooms suffer from severe flutter echoes, poor sound isolation to adjacent bedrooms, and cluttered consumer electronics.",
    solution:
      "We design discrete in-wall architectural Dolby Atmos speaker layouts, precision acoustic absorption fabrics, hidden rack equipment, and synchronized luxury lighting scenes.",
    keySystems: [
      { label: "Customized Home Theatre", serviceSlug: "customized-home-theatre" },
      { label: "Acoustic Solutions", serviceSlug: "acoustic-solutions" },
      { label: "Lighting Solutions", serviceSlug: "lighting-solutions" },
    ],
    image: "/images/solutions/home-theatre.jpg",
    outcomes: [
      "Pure reference-level cinema sound tailored to the listener's seating",
      "Room soundproofing preventing leakage to the rest of the residence",
      "One-touch automation dimming lights, lowering screens, and starting movies",
    ],
  },
  {
    id: "studios",
    slug: "podcast-chroma-studios",
    title: "Podcast & Chroma Studios",
    tagline: "Broadcast-ready acoustics, infinity green screens, and multi-cam streaming.",
    challenge:
      "Creators and brands struggle with echoey rooms, uneven green screen lighting shadows that ruin keying, and messy cable setups that waste production hours.",
    solution:
      "We deliver turnkey broadcast podcast desks with boom microphones, digital audio interfaces, calibrated multi-zone chroma cyclorama lighting, and multi-camera live switching suites.",
    keySystems: [
      { label: "Podcasting Studio", serviceSlug: "podcasting-studio" },
      { label: "Customized Chroma Studio", serviceSlug: "customized-chroma-studio" },
      { label: "Acoustic Solutions", serviceSlug: "acoustic-solutions" },
      { label: "Lighting Solutions", serviceSlug: "lighting-solutions" },
    ],
    image: "/images/solutions/podcast-studio.jpg",
    outcomes: [
      "Broadcast-fidelity vocals with zero background noise",
      "Shadowless even illumination for instant green-screen compositing",
      "Turnkey one-button live streaming and multi-track recording",
    ],
  },
];
