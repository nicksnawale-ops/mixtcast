export interface ServiceItem {
  slug: string;
  title: string;
  category: "Audio" | "Video" | "Spaces" | "Studios";
  icon: string;
  shortLine: string;
  overview: string;
  deliverables: string[];
  idealFor: string[];
  image: string;
  accentQuote?: string;
}

export const SERVICES: ServiceItem[] = [
  {
    slug: "audio-designing",
    title: "Audio Designing",
    category: "Audio",
    icon: "Volume2",
    shortLine: "High-fidelity acoustic architecture, speech intelligibility, and sound reinforcement.",
    overview:
      "We engineer customized audio ecosystems that guarantee pristine clarity, uniform sound pressure levels, and immersive depth. From electro-acoustic simulations to DSP matrix tuning, our designs eliminate dead zones and acoustic phase distortion across any volume or room geometry.",
    deliverables: [
      "Speech intelligibility & STIPA acoustic calculations",
      "Line array and point-source speaker dispersion modeling",
      "Digital Signal Processing (DSP) routing & Dante audio networking",
      "Feedback suppression, gain-sharing automixing, and equalization",
      "Precision multi-zone amplification and stage monitoring",
    ],
    idealFor: [
      "Auditoriums & Amphitheatres",
      "Corporate Boardrooms",
      "Places of Worship & Houses of Prayer",
      "Live Performance Venues",
    ],
    image: "/images/services/audio-designing.jpg",
    accentQuote: "Pristine acoustic dynamics where every spoken syllable is delivered with natural fidelity.",
  },
  {
    slug: "video-designing",
    title: "Video Designing",
    category: "Video",
    icon: "Tv",
    shortLine: "Ultra-high-definition projection, video walls, and low-latency distribution.",
    overview:
      "Our video designing services turn presentation surfaces into breathtaking visual centerpieces. We calculate precise throw ratios, ambient light rejection, pixel pitch, and viewing cones to deliver razor-sharp visual clarity in all lighting conditions.",
    deliverables: [
      "High-lumen laser projection mapping and motorized tensioned screens",
      "Direct-view Fine Pitch LED video wall engineering",
      "4K/8K uncompressed AV-over-IP matrix switching",
      "Multi-source presentation scalers and multi-window processors",
      "Ergonomic sightline and DISCAS standard viewing angle audits",
    ],
    idealFor: [
      "Executive Briefing Centers",
      "Network Operations & Command Centers",
      "Large-scale Lecture Halls",
      "Retail & Brand Experience Centers",
    ],
    image: "/images/services/video-designing.jpg",
    accentQuote: "Pixel-perfect visual canvases calibrated for maximum contrast and audience engagement.",
  },
  {
    slug: "auditorium-designing",
    title: "Auditorium Designing",
    category: "Spaces",
    icon: "Building2",
    shortLine: "Turnkey architectural AV integration for large-capacity assemblies and events.",
    overview:
      "Auditoriums require complex coordination of acoustics, stage lighting, multi-camera broadcasting, and intuitive operator consoles. MixtCast provides end-to-end auditorium engineering that empowers speakers, performers, and audiences with world-class production values.",
    deliverables: [
      "Integrated line-array loudspeaker clusters with delayed surround fills",
      "Motorized stage rigging, acoustic drapery, and safety interlocks",
      "Automated PTZ multi-camera tracking for event recording and streaming",
      "Centralized master stage control touchpanels and podium integration",
      "Full ADA hearing loop and assistive listening compliance",
    ],
    idealFor: [
      "Educational Universities & Institutes",
      "Armed Forces & Government Institutions",
      "Corporate Headquarters & Town Halls",
      "Cultural & Performing Arts Centers",
    ],
    image: "/images/services/auditorium-designing.jpg",
    accentQuote: "Grand assembled spaces engineered for seamless performance and effortless governance.",
  },
  {
    slug: "lighting-solutions",
    title: "Lighting Solutions",
    category: "Spaces",
    icon: "Sun",
    shortLine: "Architectural, theatrical, and ambient lighting scenes with smart automated cues.",
    overview:
      "Lighting sets the emotional tone and visual focus of any environment. We design energy-efficient architectural and theatrical lighting rigs that synchronize seamlessly with presentation cues, video recordings, and conference modes.",
    deliverables: [
      "High-CRI broadcast-grade LED stage wash and profile fixtures",
      "DMX/RDM lighting console programming and touchscreen scene recalls",
      "Architectural cove lighting and dynamic color-temperature dimming",
      "Daylight harvesting and automated occupancy sensors",
      "Flicker-free studio lighting optimized for high-frame-rate recording",
    ],
    idealFor: [
      "Auditoriums & Multipurpose Halls",
      "Broadcasting & Virtual Production Stages",
      "High-End Hospitality & Ballrooms",
      "Corporate Boardrooms",
    ],
    image: "/images/services/lighting-solutions.jpg",
    accentQuote: "Illuminating spaces with dramatic impact and broadcast-grade color fidelity.",
  },
  {
    slug: "digital-signage-solutions",
    title: "Digital Signage Solutions",
    category: "Video",
    icon: "MonitorPlay",
    shortLine: "Dynamic commercial displays, interactive wayfinding, and centralized CMS.",
    overview:
      "Transform corporate campuses, public lobbies, and retail spaces into informative, engaging digital environments. We deploy commercial-grade 24/7 displays with cloud-managed content scheduling, real-time messaging, and interactive touch kiosks.",
    deliverables: [
      "Ultra-narrow bezel and seamless LED commercial display networks",
      "Centralized cloud-based content management and automated playlists",
      "Wayfinding interactive kiosks with capacitive multi-touch",
      "Emergency broadcast override integration and live data feeds",
      "Outdoor weatherproof IP65 high-brightness digital totems",
    ],
    idealFor: [
      "Corporate Campuses & Technology Parks",
      "Hospitality & Healthcare Foyers",
      "Shopping Malls & Cinema Lobbies",
      "Educational Campuses",
    ],
    image: "/images/services/digital-signage-solutions.jpg",
    accentQuote: "Dynamic visual touchpoints that communicate vital information in real-time.",
  },
  {
    slug: "av-control-suite",
    title: "AV Control Suite",
    category: "Audio",
    icon: "Cpu",
    shortLine: "One-touch room automation, scheduling panels, and unified equipment management.",
    overview:
      "Eliminate technology friction with custom-programmed touch interfaces. Our AV Control Suites consolidate lighting, motorized screens, climate, audio levels, and video routing into intuitive, one-touch user workflows for instant meeting startup.",
    deliverables: [
      "Custom tabletop and in-wall capacitive touch interface design",
      "One-touch 'Start Meeting' presets coordinating displays, mics, and blinds",
      "Centralized room scheduling panels with calendar synchronization",
      "Remote device monitoring, firmware health diagnostics, and alerts",
      "Secure network isolation and encrypted control protocols",
    ],
    idealFor: [
      "Enterprise Conference Rooms",
      "Executive Boardrooms",
      "Training Facilities & Seminar Halls",
      "Control & Command Rooms",
    ],
    image: "/images/services/av-control-suite.jpg",
    accentQuote: "Effortless one-touch room orchestration that lets teams focus on collaboration.",
  },
  {
    slug: "acoustic-solutions",
    title: "Acoustic Solutions",
    category: "Audio",
    icon: "Waves",
    shortLine: "Precision reverberation control, soundproofing, and aesthetic acoustic treatments.",
    overview:
      "The finest speakers cannot compensate for poor room acoustics. We conduct on-site reverberation time (RT60) measurements and implement architectural acoustic treatments that balance absorption, diffusion, and isolation while complementing interior aesthetics.",
    deliverables: [
      "On-site RT60 reverberation analysis and 3D acoustic simulation",
      "Custom fabric-wrapped wall absorption panels and bass traps",
      "Architectural quadratic residue diffusers and acoustic timber slatting",
      "Acoustic baffles and ceiling cloud suspension systems",
      "Sound transmission class (STC) wall isolation and acoustic seal systems",
    ],
    idealFor: [
      "Recording & Podcasting Studios",
      "Auditoriums & Cinema Halls",
      "Open Corporate Workspaces & Huddle Rooms",
      "Home Theatres & Media Dens",
    ],
    image: "/images/services/acoustic-solutions.jpg",
    accentQuote: "Harmonizing room physics to deliver tight bass, clean speech, and serene quietude.",
  },
  {
    slug: "ai-in-audio-visual",
    title: "AI in Audio Visual",
    category: "Audio",
    icon: "Sparkles",
    shortLine: "Intelligent auto-framing, beamforming voice tracking, and smart room analytics.",
    overview:
      "Leverage artificial intelligence to elevate remote collaboration and venue intelligence. We deploy smart cameras with active speaker tracking, AI-powered acoustic echo cancellation, and real-time room occupancy analytics.",
    deliverables: [
      "AI presenter tracking and multi-speaker framing PTZ systems",
      "Deep-learning noise suppression removing HVAC, typing, and ambient noise",
      "Beamforming ceiling microphone arrays with dynamic acoustic tracking",
      "Automated live transcription, translation, and meeting summarization feeds",
      "Computer-vision workspace utilization and occupancy telemetry",
    ],
    idealFor: [
      "Hybrid Enterprise Boardrooms",
      "High-Tech Smart Classrooms",
      "Town Halls & Virtual Keynote Studios",
      "Executive Collaboration Suites",
    ],
    image: "/images/services/ai-in-audio-visual.jpg",
    accentQuote: "Intelligent automation that adapts in real-time to human behavior and acoustics.",
  },
  {
    slug: "commercial-theatre",
    title: "Commercial Theatre",
    category: "Spaces",
    icon: "Film",
    shortLine: "DCI-compliant projection, immersive Dolby Atmos sound, and cinema acoustics.",
    overview:
      "Deliver cinematic spectacles that captivate moviegoers. We engineer complete commercial cinema complexes with DCI-certified laser projectors, multi-channel immersive audio arrays, perforated acoustically transparent screens, and automated cinema management.",
    deliverables: [
      "DCI-compliant high-contrast RGB laser cinema projection systems",
      "Dolby Atmos / 7.1 surround sound audio processor and loudspeaker arrays",
      "Precision perforated micro-perf screens with motorized masking",
      "Acoustic wall panelling engineered for cinematic dynamic range",
      "Automated cinema lobby signage, ticketing, and auditorium scheduling",
    ],
    idealFor: [
      "Multiplexes & Independent Movie Theatres",
      "Institutional Film Auditoriums",
      "Film Production Screening Rooms",
      "Luxury Commercial Theatres",
    ],
    image: "/images/services/commercial-theatre.jpg",
    accentQuote: "Awe-inspiring cinematic magic engineered for authentic theatrical drama.",
  },
  {
    slug: "customized-home-theatre",
    title: "Customized Home Theatre",
    category: "Spaces",
    icon: "Home",
    shortLine: "Private bespoke cinema sanctuaries with reference-grade audiovisuals.",
    overview:
      "Bring the ultimate cinematic experience into private residences. We design customized private screening rooms featuring acoustic wall fabrics, motorized leather recliners, 4K HDR laser projectors, and multi-subwoofer bass management.",
    deliverables: [
      "Reference-grade 4K HDR home cinema projection and ambient-light screens",
      "Discrete architectural Dolby Atmos in-wall/in-ceiling speaker placement",
      "Multi-subwoofer calibration eliminating room acoustic nulls and resonances",
      "Integrated smart lighting scenes and motorized blackout drapery control",
      "Ultra-quiet isolated ventilation and dedicated AV equipment racks",
    ],
    idealFor: [
      "Luxury Private Residences & Villas",
      "Penthouse Media Lounges",
      "Celebrity Screening Rooms",
      "Exclusive Clubhouses",
    ],
    image: "/images/services/customized-home-theatre.jpg",
    accentQuote: "The intimacy of home paired with the uncompromised power of commercial cinema.",
  },
  {
    slug: "customized-chroma-studio",
    title: "Customized Chroma Studio",
    category: "Studios",
    icon: "Video",
    shortLine: "Seamless green-screen cycloramas, broadcast lighting, and virtual production.",
    overview:
      "Turnkey virtual production and chroma key studio integration. We build infinity cove cycloramas, calibrated multi-zone green-screen lighting grids, and real-time compositing video switchers for flawless digital keying.",
    deliverables: [
      "Seamless curved infinity cyc wall construction and chroma green coating",
      "Even-diffusion ceiling grid lighting eliminating shadows and hot spots",
      "Multi-camera broadcast SDI routing and low-latency hardware keyers",
      "Acoustic room soundproofing preventing exterior noise bleed",
      "Teleprompters, confidence monitors, and studio talkback intercoms",
    ],
    idealFor: [
      "Corporate Communications & Training Studios",
      "EdTech Content Creation Hubs",
      "Broadcast Television & OTT Studios",
      "Advertising & Digital Media Agencies",
    ],
    image: "/images/services/customized-chroma-studio.jpg",
    accentQuote: "Flawless green-screen environments engineered for limitless virtual realities.",
  },
  {
    slug: "podcasting-studio",
    title: "Podcasting Studio",
    category: "Studios",
    icon: "Mic",
    shortLine: "Broadcast-quality multi-host podcast setups with multicam video switching.",
    overview:
      "Launch professional audio and video podcast productions with bespoke studio architecture. We provide broadcast dynamic microphones, multi-camera switching, warm studio acoustic aesthetic backdrops, and one-touch recording workstations.",
    deliverables: [
      "Broadcast microphone suites with low-noise preamps and boom arms",
      "Multi-camera PTZ / cinema camera integration with automated video switching",
      "Custom acoustic timber slats, neon branding, and ambient video backdrops",
      "Multi-track digital audio recording consoles and headphone distribution",
      "Live streaming encoders for YouTube, Spotify, and social syndication",
    ],
    idealFor: [
      "Content Creators & Media Production Houses",
      "Corporate Thought-Leadership Studios",
      "Educational Podcasting Labs",
      "Financial & Advisory Media Channels",
    ],
    image: "/images/services/podcasting-studio.jpg",
    accentQuote: "Intimate, broadcast-grade studios built for captivating long-form conversation.",
  },
];
