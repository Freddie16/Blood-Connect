
export enum BloodGroup {
  A_POS = "A+",
  A_NEG = "A-",
  B_POS = "B+",
  B_NEG = "B-",
  AB_POS = "AB+",
  AB_NEG = "AB-",
  O_POS = "O+",
  O_NEG = "O-",
  UNKNOWN = "Unknown"
}

export enum UrgencyLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  CRITICAL = "Critical"
}

export enum AppView {
  SPLASH = "SPLASH",
  AUTH = "AUTH",
  ONBOARDING = "ONBOARDING",
  HOME = "HOME",
  ALERTS = "ALERTS",
  PROFILE = "PROFILE",
  CHAT_AI = "CHAT_AI",
  APPOINTMENTS = "APPOINTMENTS",
  STAFF_DASHBOARD = "STAFF_DASHBOARD",
  DONOR_MAP = "DONOR_MAP",
  SETTINGS = "SETTINGS"

}

export enum UserType {
  DONOR = "donor",
  STAFF = "staff",
  ORGANIZATION = "organization"
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  bloodGroup: BloodGroup;
  county: string;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate?: string;
  userType: UserType;
  organization?: string; // For staff users
  location?: {
    lat: number;
    lng: number;
  };
}

export interface BloodAlert {
  id: string;
  hospitalName: string;
  organization: string;
  location: string;
  bloodGroup: BloodGroup[];
  urgency: UrgencyLevel;
  requiredUnits: number;
  collectedUnits: number;
  distanceKm: number;
  timestamp: string;
  description: string;
  isRsvped: boolean;
  createdBy: string; // Staff user ID who created the alert
  contactInfo: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Appointment {
  id: string;
  donorId: string;
  donorName: string;
  hospitalName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  bloodGroup: BloodGroup;
}

export interface InventoryItem {
  bloodGroup: BloodGroup;
  units: number;
  expiringSoon: number; // units expiring in < 7 days
  lastUpdated: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NearbyDonor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  distance: number;
  location: {
    lat: number;
    lng: number;
  };
  totalDonations: number;
  isVerified: boolean;
}