export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  shortBio: string;
  expertise?: string[];
  fullBio?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeamMemberFormInput = Omit<TeamMember, "id" | "createdAt" | "updatedAt" | "sortOrder"> & {
  sortOrder?: number;
};

export function teamMemberInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "IP";
}
