// frontend/lib/cases.ts

export type CaseStatus = "pending" | "unsolved" | "solved";

export interface TimelineEvent {
  id: string;
  time: string; // ISO string
  title: string;
  description: string;
}

export interface Detective {
  id: string;
  name: string;
  badgeId: string;
  avatarInitials: string;
  rating?: number;
}

export type EvidenceType = "photo" | "video" | "audio" | "document" | "other";

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  tag: string;
  filename: string;
  url: string;
  uploadedAt: string;
  uploadedByName: string;
  uploadedByRole: "admin" | "detective" | "system";
}

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "admin" | "detective";
  createdAt: string;
  body: string;
}

export interface CaseFile {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  area: string;
  status: CaseStatus;
  reportedAt: string;
  lastUpdatedAt: string;

  summary: string;
  location: string;
  victim: string;
  suspects: string[];

  assignedDetectiveId?: string | null;

  images: string[];
  timeline: TimelineEvent[];

  notes: CaseNote[];
  evidence: EvidenceItem[];
}

// demoCases not used anymore, but kept for type safety
export const demoCases: CaseFile[] = [];
export const demoDetectives: Detective[] = [];
