export type Review = {
  id: string;
  name: string;
  designation: string;
  company: string;
  reviewText: string;
  rating: number;
  avatarImage?: string;
  location?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReviewFormInput = Omit<Review, "id" | "sortOrder" | "createdAt" | "updatedAt"> & {
  sortOrder?: number;
};

export function reviewerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "IP";
}
