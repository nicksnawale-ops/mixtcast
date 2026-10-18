export interface PartnerItem {
  id: string;
  name: string;
  category: "Audio" | "Display" | "Control & Switching" | "Microphones";
  specialty: string;
  imageSlot: string;
  logo: string;
  /** Set to "dark" for white/light logos that need a black tile behind them. */
  logoBg?: "dark";
}

export const TECHNOLOGY_PARTNERS: PartnerItem[] = [
  {
    id: "audio-technica",
    name: "Audio-Technica",
    category: "Microphones",
    specialty: "Precision transducers, studio reference microphones & conferencing systems",
    imageSlot: "/images/partners/audio-technica.svg",
    logo: "/images/partners/audio-technica.svg",
  },
  {
    id: "bose",
    name: "Bose Professional",
    category: "Audio",
    specialty: "Architectural line arrays, spatial sound reinforcement & beam-steering speakers",
    imageSlot: "/images/partners/bose.svg",
    logo: "/images/partners/bose.svg",
  },
  {
    id: "shure",
    name: "Shure",
    category: "Microphones",
    specialty: "Digital wireless microphone systems & ceiling beamforming microphone arrays",
    imageSlot: "/images/partners/shure.svg",
    logo: "/images/partners/shure.svg",
  },
  {
    id: "biamp",
    name: "Biamp",
    category: "Audio",
    specialty: "Tesira DSP network processing, VoIP conferencing & echo cancellation",
    imageSlot: "/images/partners/biamp.svg",
    logo: "/images/partners/biamp.svg",
  },
  {
    id: "yamaha",
    name: "Yamaha Commercial Audio",
    category: "Audio",
    specialty: "Digital mixing consoles, multi-channel amplifiers & professional audio systems",
    imageSlot: "/images/partners/yamaha.svg",
    logo: "/images/partners/yamaha.png",
  },
  {
    id: "samsung",
    name: "Samsung",
    category: "Display",
    specialty: "The Wall MicroLED, commercial 4K SMART signage & interactive e-boards",
    imageSlot: "/images/partners/samsung.svg",
    logo: "/images/partners/samsung.svg",
  },
  {
    id: "lg",
    name: "LG Commercial Displays",
    category: "Display",
    specialty: "Transparent OLED, ultra-stretch digital signage & high-brightness outdoor displays",
    imageSlot: "/images/partners/lg.svg",
    logo: "/images/partners/lg.svg",
  },
  {
    id: "sennheiser",
    name: "Sennheiser",
    category: "Microphones",
    specialty: "TeamConnect ceiling microphones & multi-channel speech wireless systems",
    imageSlot: "/images/partners/sennheiser.svg",
    logo: "/images/partners/sennheiser.svg",
  },
  {
    id: "qsc",
    name: "QSC / Q-SYS",
    category: "Control & Switching",
    specialty: "Cloud-manageable audio, video and control (AV&C) platform ecosystem",
    imageSlot: "/images/partners/qsc.svg",
    logo: "/images/partners/qsc.svg",
  },
  {
    id: "kramer",
    name: "Kramer Electronics",
    category: "Control & Switching",
    specialty: "AV-over-IP streaming, matrix switchers & room automation controllers",
    imageSlot: "/images/partners/kramer.svg",
    logo: "/images/partners/kramer.svg",
  },
  {
    id: "audac",
    name: "AUDAC",
    category: "Audio",
    specialty: "Multi-zone audio matrixes, modular sound sources & column speakers",
    imageSlot: "/images/partners/audac.svg",
    logo: "/images/partners/audac.png",
    logoBg: "dark",
  },
  {
    id: "harman",
    name: "Harman Professional",
    category: "Audio",
    specialty: "JBL Professional, Crown Amplifiers, Soundcraft consoles & AMX control systems",
    imageSlot: "/images/partners/harman.svg",
    logo: "/images/partners/harman.svg",
  },
  {
    id: "l-acoustics",
    name: "L-Acoustics",
    category: "Audio",
    specialty: "Professional line-array loudspeaker systems, amplified controllers & immersive sound technology",
    imageSlot: "/images/partners/l-acoustics.svg",
    logo: "/images/partners/l-acoustics.svg",
  },
];
