export type Role = 'admin' | 'programmer' | 'user';

export type ProjectSection = 'ACADEMICO' | 'LABORAL';
export type Participation = 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'FULLSTACK';
export type AdvisoryStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type Modality = 'VIRTUAL' | 'PRESENCIAL';
export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role: Role;
  photoUrl?: string;
  headline?: string;
  bio?: string;
  createdAt?: string;
}

export interface ProgrammerProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  specialty: string;
  description?: string;
  skills?: string[];
  photoUrl?: string;
  contacts?: { type: string; url: string }[];
  socials?: { name: string; url: string }[];
  projects?: Project[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  participation: Participation;
  technologies: string[];
  repoUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  section: ProjectSection;
  active?: boolean;
}

export interface AvailabilitySlot {
  id: number;
  day: Weekday;
  startTime: string;
  endTime: string;
  modality: Modality;
}

export interface AvailabilityRequest {
  day: Weekday;
  startTime: string;
  endTime: string;
  modality: Modality;
}

export interface Advisory {
  id?: number;
  programmerProfileId: number;
  programmerName?: string;
  requesterName?: string;
  requesterEmail?: string;
  scheduledAt: string;
  comment?: string;
  status: AdvisoryStatus;
  response?: string;
}
