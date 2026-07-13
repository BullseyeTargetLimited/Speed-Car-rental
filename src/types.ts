export type VehicleCategory = 'SUV' | '4WD' | 'Sedan' | 'Premium';

export interface Vehicle {
  id: string;
  manufacturer: string;
  make: string;
  model: string;
  year: number;
  seats: number;
  category: VehicleCategory;
  pricePerDay: number;
  image: string; // Placeholder or descriptive key for visuals
  features: string[];
}

export interface InsurancePackage {
  id: string;
  name: string;
  pricePerDay: number;
  description: string;
}

export interface CampingGear {
  id: string;
  name: string;
  pricePerDay: number;
  iconName: string;
  description: string;
}

export interface TourismPackage {
  id: string;
  name: string;
  type: 'cultural' | 'mountain' | 'desert';
  durationDays: number;
  pricePerPerson: number;
  description: string;
  highlights: string[];
  locations: string[];
  image?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  durationMonths: number;
  includedKm: string;
  tier: string;
  description: string;
}

export type Language = 'en' | 'ar' | 'fr';

export interface Booking {
  bookingId: string;
  type: 'rental' | 'tourism' | 'combo';
  vehicleId?: string;
  insurancePackageId?: string;
  selectedCampingGearIds: string[];
  tourismPackageId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  needGps: boolean;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  language: Language;
  status: 'pending' | 'confirmed' | 'delivered';
  pickupTime?: string;
  dropoffTime?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  flightNumber?: string;
  airlineCarrier?: string;
  terminalNumber?: string;
  luggageCount?: number;
  placardText?: string;
  connectingFlight?: string;
  customerPickupDetails?: string;
  paymentMethod?: 'credit-card' | 'on-arrival';
  subtotal?: number;
  vatAmount?: number;
  cardFee?: number;
  travelersCount?: number;
  rentalDays?: number;
}
