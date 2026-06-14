// Member photo registry. Photos live under public/members/<slug>/<role>.png
// and are served as static files from the local /members/ path.
type Role = "chairman" | "convenor1" | "convenor2";

// Manifest of available photos. Add an entry here when you drop a new file
// into public/members/<slug>/. Missing entries fall back to the default icon.
const AVAILABLE: Record<string, Role[]> = {
  arb: ["chairman", "convenor1","convenor2"],
  auditory: ["chairman", "convenor1", "convenor2"],
  english: ["chairman", "convenor1"],
  gk: ["chairman", "convenor1", "convenor2"],
  library: ["chairman", "convenor2"],
  malayalam: ["convenor1"],
  media: ["chairman","convenor1"],
  pkv: ["convenor1"],
  publishing: ["chairman", "convenor1", "convenor2"],
  sab: ["convenor1", "convenor2"],
  skssf: ["chairman", "convenor2"],
  srdb: ["chairman", "convenor1", "convenor2"],
  urdu: ["chairman"],
};

export function getMemberPhoto(slug: string, role: Role): string | undefined {
  return AVAILABLE[slug]?.includes(role) ? `/members/${slug}/${role}.png` : undefined;
}

// --- Core Committee photos ---------------------------------------------------
// Photos live under public/members/core/<role-slug>.<ext> and are served as
// static files. To add/replace a photo: drop the file in that folder and list
// its role-slug + extension below. Missing entries fall back to the default
// avatar icon. A non-technical user only needs to add/replace files and
// update this list — no database changes required.
const AVAILABLE_CORE: Record<string, "png" | "jpg" | "jpeg" | "webp"> = {
  "president": "png",
  "joint-secretary": "png",
  "office-secretary": "png",
  "secretary":"png",
};

function roleToSlug(role: string): string {
  return role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getCorePhoto(role: string): string | undefined {
  const slug = roleToSlug(role);
  const ext = AVAILABLE_CORE[slug];
  return ext ? `/members/core/${slug}.${ext}` : undefined;
}
