export interface PartnerData {
  id: string;
  name: string;
  email: string;
  relationshipType: 'partner' | 'spouse';
  permissions: PartnerPermissions;
  linkedDate: Date;
  isActive: boolean;
}

export interface PartnerPermissions {
  cyclePhase: boolean;
  nextPeriodDate: boolean;
  moodTrends: boolean;
  energyLevels: boolean;
  generalSymptoms: boolean;
  tips: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationshipType: 'mother' | 'sister' | 'daughter' | 'guardian' | 'other';
  permissions: FamilyPermissions;
  linkedDate: Date;
  isActive: boolean;
}

export interface FamilyPermissions {
  generalHealth: boolean;
  cycleRegularity: boolean;
  emergencyAlerts: boolean;
  basicInsights: boolean;
}

export interface DoctorAccess {
  id: string;
  doctorName: string;
  clinicName: string;
  email: string;
  accessLevel: 'basic' | 'detailed' | 'full';
  expirationDate: Date;
  isActive: boolean;
  qrCode: string;
}

export interface PartnerTip {
  id: string;
  phase: string;
  category: 'support' | 'activity' | 'communication' | 'comfort';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ShareCapsule {
  id: string;
  recipientType: 'partner' | 'family' | 'doctor';
  recipientId: string;
  data: Record<string, unknown>;
  permissions: PartnerPermissions | FamilyPermissions | Record<string, boolean>;
  createdDate: Date;
  expirationDate?: Date;
  isActive: boolean;
}
