export const WINGS = [
  { slug: "arb", name: "Arabic Wing", tagline: "Arabic Literary Board", chairman: "Ihsan Paloli", convenor1: "Fahiz M", convenor2: "Ramsheed C", description: "Promoting Arabic language, literature and oratory among students through symposia, creative writing and public speaking.", activities: ["Arabic Symposium", "Calligraphy Workshop", "Literary Magazine"] },
  { slug: "english", name: "English Wing", tagline: "Language & Literature", chairman: "Muhammed Mazin VV", convenor1: "Thahnun Arafath", convenor2: "Anfal MV", description: "Cultivating English communication and literary excellence through debate, writing and performance.", activities: ["Debate Club", "Spell Bee", "Poetry Slam"] },
  { slug: "urdu", name: "Urdu Wing", tagline: "Adab & Shayari", chairman: "Anas P", convenor1: "Fazlu Rahman", convenor2: "Asif Ali", description: "Reviving the Urdu language and its rich poetic heritage through mushaira and language workshops.", activities: ["Mushaira", "Urdu Workshop", "Bayan Competition"] },
  { slug: "malayalam", name: "Malayalam Wing", tagline: "Mother Tongue", chairman: "Muhammed Rabeeh K", convenor1: "Ameen MK", convenor2: "Adil M", description: "Nurturing love for Malayalam literature and culture through readings, workshops and festivals.", activities: ["Kavya Sandhya", "Story Workshop", "Cultural Fest"] },
  { slug: "media", name: "Media Wing", tagline: "Voice of Campus", chairman: "Muhammed Sinan A", convenor1: "Sahal EK", convenor2: "Ajzal M", description: "Capturing campus stories through video, photography and journalism across digital platforms.", activities: ["Campus Magazine", "Podcast Series", "Documentary"] },
  { slug: "publishing", name: "Publishing Bureau", tagline: "Words in Print", chairman: "Nadhil Nishan", convenor1: "Yaseen Nisar", convenor2: "Muhammed S", description: "Designing, editing and publishing periodicals, booklets and official MADAD publications.", activities: ["Annual Periodical", "Editorial Workshop", "Bulletin Release"] },
  { slug: "srdb", name: "SRDB", tagline: "Students Resource Development Board", chairman: "Muhsin Ali V", convenor1: "Shamil VP", convenor2: "Hadi Shifin", description: "Developing students' skills, talents and resources through training programs and mentorship.", activities: ["Skill Bootcamp", "Mentorship Program", "Talent Drive"] },
  { slug: "pkv", name: "PKV Wing", tagline: "Knowledge & Vision", chairman: "Ahammed Hamdan", convenor1: "Muhammed Hanih", convenor2: "Muhammed Faheem", description: "Driving intellectual growth through curated study sessions, vision-building and learning circles.", activities: ["Study Circle", "Vision Sessions", "Learning Drive"] },
  { slug: "sab", name: "SAB", tagline: "Social Affairs Board", chairman: "Aman Ajsal", convenor1: "Muhammed Sabanid T", convenor2: "Swadaqathulla", description: "Leading community service, welfare drives and social responsibility initiatives.", activities: ["Relief Camp", "Welfare Drive", "Awareness Campaign"] },
  { slug: "library", name: "Library Wing", tagline: "Gateway to Reading", chairman: "Muhammed Nafih", convenor1: "Abdul Baeis", convenor2: "Muhammed Hanan PP", description: "Managing the library, encouraging reading habits and curating resources for students.", activities: ["Reading Challenge", "Book Fair", "Library Orientation"] },
  { slug: "skssf", name: "SKSSF", tagline: "Faith & Fellowship", chairman: "Mohammed Aslam", convenor1: "Abdul Bazith", convenor2: "Swafvan NS", description: "Coordinating spiritual, cultural and fellowship activities under the SKSSF framework.", activities: ["Spiritual Gathering", "Cultural Meet", "Community Program"] },
  { slug: "auditory", name: "Auditory Wing", tagline: "Transparency Through Accountability", chairman: "Shammas MP", convenor1: "Farhan KC", convenor2: "Nijad Ahammed P", description: "Audits and reviews all wings and the Core Committee to ensure transparency, accountability, and effective functioning.", activities: ["Stage Management", "Sound Setup", "Event Support"] },
  { slug: "gk", name: "GK Wing", tagline: "Knowledge Quest", chairman: "Umar Farooq CP", convenor1: "Muhammed Anshif M", convenor2: "Muhammed Hashir MK", description: "Sharpening general knowledge and current affairs awareness through quizzes and contests.", activities: ["Quiz Championship", "Current Affairs Bulletin", "GK Olympiad"] },
] as const;

// Core Committee is an internal organizational unit, NOT an official wing.
// Kept separate from WINGS so wing count, hero, and public wing listings stay unchanged.
export const CORE_COMMITTEE = { slug: "core-committee", name: "Core Committee" } as const;

export function resolveOrgName(slug: string | null | undefined): string {
  if (!slug) return "";
  if (slug === CORE_COMMITTEE.slug) return CORE_COMMITTEE.name;
  return WINGS.find((w) => w.slug === slug)?.name ?? slug;
}

export const STATS = [
  { value: 210, label: "Students", suffix: "+" },
  { value: 13, label: "Wings" },
  { value: 500, label: "Programs Conducted", suffix: "+" },
  { value: 47, label: "Active Members" },
  { value: 5, label: "Years of Service" },
];

export const ANNOUNCEMENTS = [
  { id: 1, title: "MADAD Annual Day 2026", wing: "Core Committee", date: "2026-08-12", description: "Grand annual celebration showcasing achievements of all 13 wings." },
  { id: 2, title: "Inter-Wing Arabic Symposium", wing: "arb", date: "2026-07-04", description: "Students compete in oratory, poetry and creative writing in Arabic." },
  { id: 3, title: "GK Quiz Championship", wing: "gk", date: "2026-07-22", description: "Inter-batch general knowledge and current affairs quiz championship." },
  { id: 4, title: "Malayalam Cultural Fest", wing: "malayalam", date: "2026-09-02", description: "A celebration of Malayalam literature, art and performance across batches." },
];

export const STATIONERY = [
  { id: 1, name: "MADAD Record Book", price: 60, stock: 320, status: "In Stock", desc: "Premium ruled record book with MADAD insignia." },
  { id: 2, name: "Assignment Book", price: 45, stock: 180, status: "In Stock", desc: "200-page assignment book with margin." },
  { id: 3, name: "Lab Record", price: 80, stock: 45, status: "Low Stock", desc: "Hardbound lab record book with index pages." },
  { id: 4, name: "Drawing Sheets (10)", price: 35, stock: 0, status: "Out of Stock", desc: "A3 cartridge drawing sheets — pack of 10." },
  { id: 5, name: "MADAD Branded Pen", price: 15, stock: 800, status: "In Stock", desc: "Smooth-flow blue ink pen with MADAD branding." },
  { id: 6, name: "Highlighter Set", price: 90, stock: 60, status: "In Stock", desc: "4-color premium highlighter set." },
];

// Photos are resolved by role via getCorePhoto() from member-photos.ts.
// Drop a file in public/members/core/<role-slug>.jpg and list it there.
export const COMMITTEE = [
  { name: "Muhammed Jasim T", role: "President", desc: "Leading the union's vision and strategic direction." },
  { name: "Muhammed Shahal AK", role: "Vice President", desc: "Coordinating wings and inter-departmental initiatives." },
  { name: "Yahya Al Sabith", role: "Secretary", desc: "Overseeing day-to-day operations and member affairs." },
  { name: "Muhammed Aflah CV", role: "Joint Secretary", desc: "Supporting the secretariat and documentation." },
  { name: "Muhammed Misbah", role: "Treasurer", desc: "Managing finances and accounts of MADAD." },
  { name: "Muhammed Shammas KT", role: "Financial Secretary", desc: "Handling financial records and budgeting." },
  { name: "Sufiyan AB", role: "Office Secretary", desc: "Managing office affairs and administration." },
  { name: "Muhammed Sabah M", role: "PRO", desc: "Leading public relations and outreach." },
];
