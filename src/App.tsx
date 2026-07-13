import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Car,
  Tent,
  Compass,
  User,
  ShieldCheck,
  CreditCard,
  Phone,
  Layers,
  Award,
  Truck,
  Terminal,
  Globe,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  ExternalLink,
  Star,
  Home,
  Download,
  Settings
} from 'lucide-react';
import {
  VEHICLES,
  INSURANCE_PACKAGES,
  CAMPING_GEAR,
  TOURISM_PACKAGES,
  SUBSCRIPTION_PLANS,
  LOCATIONS,
  TRANSLATIONS
} from './data';
import { Vehicle, InsurancePackage, CampingGear, TourismPackage, SubscriptionPlan, Language, Booking } from './types';
import Logo from './components/Logo';
import OmanMapSimulator from './components/OmanMapSimulator';
import LoyaltyPanel from './components/LoyaltyPanel';
import ApiPortal from './components/ApiPortal';
import AiChatBot from './components/AiChatBot';
import PushNotificationManager, { PushNotification } from './components/PushNotificationManager';
import PriceComparison from './components/PriceComparison';
import CustomitineraryPlanner from './components/CustomitineraryPlanner';
import GoogleReviewsShowcase from './components/GoogleReviewsShowcase';
import AdminPanel from './components/AdminPanel';
import { jsPDF } from 'jspdf';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];

  // Dynamic Fleet state (includes any price/image overrides set by admin)
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [dynamicPricing, setDynamicPricing] = useState({ enabled: false, factor: 1.15 });

  // Active Tab at the top level
  const [activeTab, setActiveTab] = useState<'booking' | 'comparison' | 'custom-planner' | 'loyalty' | 'subscriptions' | 'api' | 'reviews' | 'admin'>('booking');

  // Push Notifications state
  const [notifications, setNotifications] = useState<PushNotification[]>([]);

  // Wizard state values
  const [bookingType, setBookingType] = useState<'rental' | 'tourism' | 'combo'>('combo');
  const [pickupLoc, setPickupLoc] = useState(LOCATIONS[0]);
  const [dropoffLoc, setDropoffLoc] = useState(LOCATIONS[1]);
  
  // Dates
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  const [rentalDays, setRentalDays] = useState(0);

  // Arrival Details & Pickup Customer Information
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [airlineCarrier, setAirlineCarrier] = useState('');
  const [terminalNumber, setTerminalNumber] = useState('Terminal 1');
  const [luggageCount, setLuggageCount] = useState<number>(3);
  const [placardText, setPlacardText] = useState('');
  const [connectingFlight, setConnectingFlight] = useState('');
  const [customerPickupDetails, setCustomerPickupDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'on-arrival'>('on-arrival');
  const [emailSentHtml, setEmailSentHtml] = useState<string | null>(null);

  // Vehicle
  const [selectedVehicleId, setSelectedVehicleId] = useState('toyota_landcruiser');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState<'ALL' | 'SUV' | '4WD' | 'Sedan' | 'Premium'>('ALL');

  // Camping Gears & Extras
  const [selectedCampingGearIds, setSelectedCampingGearIds] = useState<string[]>(['rooftop_tent', 'portable_stove']);
  const [needGps, setNeedGps] = useState(true);

  // Tourism Package
  const [selectedTourId, setSelectedTourId] = useState('jebel_shams_trek');
  const [travelersCount, setTravelersCount] = useState(2);

  // Driver Details & Insurance
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('full_premium');
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  // Simulated Payment Cards
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Booking Wizard Step
  const [wizardStep, setWizardStep] = useState(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Custom Calendar State for "intuitive calendar interface"
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [hoveredCalendarDate, setHoveredCalendarDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(6); // 0-indexed: 6 is July
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Synchronize arrival date & time with selected pickup values for smooth checkout
  useEffect(() => {
    if (pickupDate) {
      setArrivalDate(pickupDate);
    }
  }, [pickupDate]);

  useEffect(() => {
    if (pickupTime) {
      setArrivalTime(pickupTime);
    }
  }, [pickupTime]);

  // Clear step1Error when required inputs are present and valid
  useEffect(() => {
    if (pickupDate && pickupTime && dropoffDate && dropoffTime) {
      const d1 = new Date(`${pickupDate}T${pickupTime}`);
      const d2 = new Date(`${dropoffDate}T${dropoffTime}`);
      if (d2.getTime() > d1.getTime()) {
        setStep1Error(null);
      }
    }
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime]);

  // Auto-navigate calendar view to year/month of selected pickupDate
  useEffect(() => {
    if (pickupDate) {
      const parts = pickupDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // standard month index is 1-indexed in date string, 0-indexed in JS
        if (!isNaN(year) && !isNaN(month) && month >= 0 && month <= 11) {
          setCalendarYear(year);
          setCalendarMonth(month);
        }
      }
    }
  }, [pickupDate]);

  // Re-calculate rental days whenever dates/times change
  useEffect(() => {
    if (!pickupDate || !dropoffDate) {
      setRentalDays(0);
      return;
    }
    const pTime = pickupTime || '10:00';
    const dTime = dropoffTime || '10:00';
    const d1 = new Date(`${pickupDate}T${pTime}`);
    const d2 = new Date(`${dropoffDate}T${dTime}`);
    const diffTimeMs = d2.getTime() - d1.getTime();
    const diffHours = diffTimeMs / (1000 * 60 * 60);

    if (isNaN(diffHours) || diffHours <= 0) {
      setRentalDays(1);
    } else {
      let days = Math.floor(diffHours / 24);
      const extraHours = diffHours % 24;
      if (extraHours > 2) {
        days += 1;
      }
      setRentalDays(days > 0 ? days : 1);
    }
  }, [pickupDate, dropoffDate, pickupTime, dropoffTime]);

  // Synchronize dynamic fleet configurations from admin settings on application launch
  useEffect(() => {
    const fetchInitialFleet = async () => {
      try {
        const response = await fetch('/api/admin/vehicles');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const overrides = data.overrides || {};
            if (data.settings) {
              setDynamicPricing({
                enabled: !!data.settings.enabled,
                factor: data.settings.occupancyFactor || 1.15
              });
            }
            const merged = VEHICLES.map(v => {
              const override = overrides[v.id];
              let price = v.pricePerDay;
              let img = v.image;

              if (override) {
                if (override.pricePerDay !== undefined) price = override.pricePerDay;
                if (override.image !== undefined && override.image !== '') img = override.image;
              }

              return {
                ...v,
                pricePerDay: price,
                image: img
              };
            });
            setVehicles(merged);
          }
        }
      } catch (err) {
        console.error("Initial fleet fetch failed:", err);
      }
    };
    fetchInitialFleet();
  }, []);

  // Push notifications dispatcher helper
  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const newNotif: PushNotification = {
      id: Math.random().toString(),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissNotification(newNotif.id);
    }, 6000);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Pricing calculator helper
  const calculateCosts = () => {
    const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const insurance = INSURANCE_PACKAGES.find((i) => i.id === selectedInsuranceId);
    const tour = TOURISM_PACKAGES.find((t) => t.id === selectedTourId);

    const hasCar = bookingType === 'rental' || bookingType === 'combo';
    const hasTour = bookingType === 'tourism' || bookingType === 'combo';

    let vRate = hasCar && vehicle ? vehicle.pricePerDay : 0;
    // Apply dynamic surge multiplier if enabled
    if (dynamicPricing.enabled && vRate > 0) {
      vRate = Number((vRate * dynamicPricing.factor).toFixed(2));
    }

    const iRate = hasCar && insurance ? insurance.pricePerDay : 0;
    
    // Camping gear cost per day
    let gearRateSum = 0;
    if (hasCar) {
      selectedCampingGearIds.forEach((gid) => {
        const gear = CAMPING_GEAR.find((g) => g.id === gid);
        if (gear) gearRateSum += gear.pricePerDay;
      });
    }

    const carSubtotal = (vRate + iRate + gearRateSum) * rentalDays;
    const tourSubtotal = hasTour && tour ? tour.pricePerPerson * travelersCount : 0;
    const subtotal = carSubtotal + tourSubtotal;
    const vatAmount = subtotal * 0.05;
    const cardFee = paymentMethod === 'credit-card' ? (subtotal + vatAmount) * 0.03 : 0;
    const grandTotal = subtotal + vatAmount + cardFee;

    return {
      vehicleRate: vRate,
      insuranceRate: iRate,
      gearRateSum,
      carSubtotal,
      tourSubtotal,
      subtotal,
      vatAmount,
      cardFee,
      grandTotal,
      grandTotalUsd: grandTotal * 2.6 // 1 OMR = ~2.6 USD
    };
  };

  const costs = calculateCosts();

  // Wizard Navigation
  const handleNextStep = () => {
    // If we're on step 1, advance based on booking choices
    if (wizardStep === 1) {
      if (!pickupDate || !pickupTime || !dropoffDate || !dropoffTime) {
        setStep1Error('Please fill out all pickup and drop-off dates and times. These fields are mandatory.');
        return;
      }
      
      // Additional safety validation to make sure drop-off is not before pickup
      const d1 = new Date(`${pickupDate}T${pickupTime}`);
      const d2 = new Date(`${dropoffDate}T${dropoffTime}`);
      if (d2.getTime() <= d1.getTime()) {
        setStep1Error('Drop-off date and time must be after the pick-up date and time.');
        return;
      }

      setStep1Error(null);
      if (bookingType === 'tourism') {
        setWizardStep(4); // Skip car and extras, go straight to tour packages
      } else {
        setWizardStep(2); // Go to vehicle selection
      }
    } else if (wizardStep === 2) {
      setWizardStep(3); // Go to camping gear
    } else if (wizardStep === 3) {
      if (bookingType === 'combo') {
        setWizardStep(4); // Combo goes to tours
      } else {
        setWizardStep(5); // Rental Only goes straight to payment/checkout
      }
    } else if (wizardStep === 4) {
      setWizardStep(5); // Tour / Combo goes to checkout
    }
  };

  const handleBackStep = () => {
    if (wizardStep === 5) {
      if (bookingType === 'rental') {
        setWizardStep(3);
      } else {
        setWizardStep(4);
      }
    } else if (wizardStep === 4) {
      if (bookingType === 'tourism') {
        setWizardStep(1);
      } else {
        setWizardStep(3);
      }
    } else if (wizardStep === 3) {
      setWizardStep(2);
    } else if (wizardStep === 2) {
      setWizardStep(1);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const randomId = 'SP-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      bookingId: randomId,
      type: bookingType,
      vehicleId: bookingType !== 'tourism' ? selectedVehicleId : undefined,
      insurancePackageId: bookingType !== 'tourism' ? selectedInsuranceId : undefined,
      selectedCampingGearIds: bookingType !== 'tourism' ? selectedCampingGearIds : [],
      tourismPackageId: bookingType !== 'rental' ? selectedTourId : undefined,
      pickupLocation: pickupLoc,
      dropoffLocation: dropoffLoc,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
      needGps,
      totalPrice: costs.grandTotal,
      customerName: driverName,
      customerEmail: driverEmail,
      customerPhone: driverPhone,
      language: lang,
      status: 'confirmed',
      arrivalDate,
      arrivalTime,
      flightNumber,
      airlineCarrier: pickupLoc.toLowerCase().includes('airport') ? airlineCarrier : undefined,
      terminalNumber: pickupLoc.toLowerCase().includes('airport') ? terminalNumber : undefined,
      luggageCount: pickupLoc.toLowerCase().includes('airport') ? luggageCount : undefined,
      placardText: pickupLoc.toLowerCase().includes('airport') ? placardText : undefined,
      connectingFlight: pickupLoc.toLowerCase().includes('airport') ? connectingFlight : undefined,
      customerPickupDetails,
      paymentMethod,
      subtotal: costs.subtotal,
      vatAmount: costs.vatAmount,
      cardFee: costs.cardFee,
      travelersCount: bookingType !== 'rental' ? travelersCount : undefined,
      rentalDays
    };

    setConfirmedBooking(newBooking);
    
    // Call the server API endpoint to format and trigger the email notification to admin@bullseyetargetllc.com
    try {
      const response = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking: newBooking,
          costs: {
            ...costs,
            rentalDays
          }
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.emailHtml) {
          setEmailSentHtml(data.emailHtml);
          addNotification(
            '📧 Booking Confirmation Sent',
            `Details securely transmitted to ${data.recipient}`,
            'success'
          );
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('Server failed to confirm booking:', errorData.error || errorData);
          addNotification(
            '⚠️ Confirmation Email Error',
            errorData.error || 'The server encountered an error compiling your dispatch email details.',
            'warning'
          );
        } catch {
          console.error('Server failed to confirm booking with non-JSON response.');
        }
      }
    } catch (err) {
      console.error('Error submitting booking confirmation:', err);
    }
    
    // Dispatch automated booking confirmations via push notifications
    addNotification(
      '🎉 Booking Confirmed! #' + randomId,
      `Thank you ${driverName}. Your vehicle (${vehicles.find(v => v.id === selectedVehicleId)?.make || 'Tour Package'}) is booked for pickup on ${pickupDate}. Our team is preparing your custom setup!`,
      'success'
    );

    // Set wizard to step 6 (confirmation view)
    setWizardStep(6);
  };

  const downloadReceiptPdf = (booking: Booking, action: 'download' | 'print' = 'download') => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Standard portrait A4 document
    
    // Set modern styling colors
    const primaryColor = [45, 122, 130]; // #2D7A82
    const secondaryColor = [196, 126, 90]; // #C47E5A
    const darkTextColor = [30, 30, 30];
    const lightTextColor = [100, 100, 100];
    const borderCol = [220, 220, 220];

    // Page border aligned perfectly to fit page with margins
    doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
    doc.rect(10, 10, 190, 277);

    // Decorative top accent bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(10, 10, 190, 6, 'F');

    // Helper to draw company logo in PDF
    const drawCompanyLogo = (x: number, y: number, w: number, h: number) => {
      // 1. Draw rounded slate background #242930 (RGB: 36, 41, 48)
      doc.setFillColor(36, 41, 48);
      doc.roundedRect(x, y, w, h, 1, 1, 'F');

      // 2. Draw diagonal blue/teal slash on the right side: #4B9CB5 (RGB: 75, 156, 181)
      const x1 = x + (220 / 320) * w;
      const y1 = y + h;
      const x2 = x + w;
      const y2 = y;
      const x3 = x + w;
      const y3 = y + h;

      doc.setFillColor(75, 156, 181);
      doc.triangle(x1, y1, x2, y2, x3, y3, 'F');

      // 3. Draw "SPEED" text
      doc.setFont('Helvetica', 'bolditalic');
      doc.setTextColor(255, 255, 255);
      const fontSize = h * 1.35;
      doc.setFontSize(fontSize);
      
      const textX = x + (15 / 320) * w;
      const textY = y + 0.7 * h;
      doc.text('SPEED', textX, textY);

      // 4. Draw small blue accent rectangle
      const rectX = x + (15 / 320) * w;
      const rectY = y + (72 / 90) * h;
      const rectW = (130 / 320) * w;
      const rectH = (4 / 90) * h;
      doc.setFillColor(75, 156, 181);
      doc.rect(rectX, rectY, rectW, rectH, 'F');

      // 5. Draw "EST. 2009"
      doc.setFont('Courier', 'bold');
      const subFontSize = h * 0.22;
      doc.setFontSize(subFontSize);
      doc.setTextColor(160, 174, 192); // #A0AEC0 (RGB: 160, 174, 192)
      
      const subX = x + (160 / 320) * w;
      const subY = y + (81 / 90) * h;
      doc.text('EST. 2009', subX, subY);
    };

    // Draw Company Logo
    drawCompanyLogo(20, 19, 40, 12.5);

    // Title / Brand Header next to logo
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('OMAN ADVENTURES', 66, 25);

    // Subtitle next to logo
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('Premium 4WD Rental, Camping Expeditions & Desert Safaris', 66, 30);
    doc.text('Muscat, Sultanate of Oman | +968 9307 0770 | info@speedoman.com', 66, 35);

    // Header Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 44, 190, 44);

    // Confirmation badge
    doc.setFillColor(235, 245, 246); // Light teal bg
    doc.rect(145, 19, 45, 11, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CONFIRMED', 156, 26.5);

    // Section 1: Receipt Overview
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Expedition Booking Receipt', 20, 52);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    // Grid details
    doc.text('Booking Ref:', 20, 60);
    doc.setFont('Helvetica', 'bold');
    doc.text(`#${booking.bookingId}`, 50, 60);

    doc.setFont('Helvetica', 'normal');
    doc.text('Date of Booking:', 110, 60);
    doc.setFont('Helvetica', 'bold');
    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(todayStr, 145, 60);

    doc.setFont('Helvetica', 'normal');
    doc.text('Service Type:', 20, 66);
    doc.setFont('Helvetica', 'bold');
    doc.text(booking.type.toUpperCase() + ' EXPEDITION', 50, 66);

    doc.setFont('Helvetica', 'normal');
    doc.text('Payment Method:', 110, 66);
    doc.setFont('Helvetica', 'bold');
    doc.text(booking.paymentMethod === 'on-arrival' ? 'Pay on Arrival' : 'Paid Online (Card)', 145, 66);

    // Section 2: Customer details
    doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
    doc.setLineWidth(0.2);
    doc.line(20, 72, 190, 72);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Primary Customer Details', 20, 80);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text('Full Name:', 20, 88);
    doc.text(booking.customerName, 50, 88);

    doc.text('Email Address:', 20, 94);
    doc.text(booking.customerEmail, 50, 94);

    doc.text('Mobile Number:', 20, 100);
    doc.text(booking.customerPhone, 50, 100);

    // Section 3: Itinerary details
    doc.line(20, 106, 190, 106);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Itinerary & Station Details', 20, 114);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    
    // Stack station details vertically to completely prevent side-by-side text overlap when stations have long names (e.g. Muscat International Airport)
    doc.setFont('Helvetica', 'normal');
    doc.text('Pickup Station:', 20, 122);
    doc.setFont('Helvetica', 'bold');
    const splitPickupLoc = doc.splitTextToSize(booking.pickupLocation, 135);
    doc.text(splitPickupLoc, 55, 122);
    
    const pickupLocHeight = splitPickupLoc.length * 4.5;
    const nextY1 = 122 + Math.max(5, pickupLocHeight);

    doc.setFont('Helvetica', 'normal');
    doc.text('Pickup Period:', 20, nextY1);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${booking.pickupDate} at ${booking.pickupTime || '10:00'}`, 55, nextY1);

    const nextY2 = nextY1 + 6;

    doc.setFont('Helvetica', 'normal');
    doc.text('Return Station:', 20, nextY2);
    doc.setFont('Helvetica', 'bold');
    const splitDropoffLoc = doc.splitTextToSize(booking.dropoffLocation, 135);
    doc.text(splitDropoffLoc, 55, nextY2);

    const dropoffLocHeight = splitDropoffLoc.length * 4.5;
    const nextY3 = nextY2 + Math.max(5, dropoffLocHeight);

    doc.setFont('Helvetica', 'normal');
    doc.text('Return Period:', 20, nextY3);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${booking.dropoffDate} at ${booking.dropoffTime || '10:00'}`, 55, nextY3);

    // If there is a Tour Package associated with this booking, display its high-level info on Page 1
    const tour = booking.tourismPackageId ? TOURISM_PACKAGES.find(t => t.id === booking.tourismPackageId) : null;
    const hasTour = !!tour;
    const totalPages = hasTour ? 3 : 2;

    let section3EndY = nextY3 + 6;
    if (hasTour && tour) {
      doc.setFont('Helvetica', 'normal');
      doc.text('Tour Package:', 20, section3EndY);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`${tour.name} (${tour.durationDays} Days)`, 55, section3EndY);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      section3EndY += 6;
    }

    // Section 4: Special VIP Airport welcoming (if applicable)
    let curY = section3EndY;
    if (booking.pickupLocation.toLowerCase().includes('airport')) {
      doc.line(20, curY, 190, curY);
      curY += 6;
      
      doc.setFillColor(245, 250, 250);
      doc.rect(20, curY, 170, 28, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('COMPLIMENTARY AIRPORT VIP WELCOME SERVICES', 25, curY + 5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      
      doc.text(`Flight Number: ${booking.flightNumber || 'N/A'}`, 25, curY + 11);
      doc.text(`Airline Carrier: ${booking.airlineCarrier || 'N/A'}`, 110, curY + 11);
      doc.text(`Terminal: ${booking.terminalNumber || 'N/A'}`, 25, curY + 16);
      doc.text(`Bags / Luggage: ${booking.luggageCount || 0} bags`, 110, curY + 16);
      
      doc.setFont('Helvetica', 'bold');
      const placardTextLimit = doc.splitTextToSize(`Placard Greeting Text: "${booking.placardText || 'N/A'}"`, 160);
      doc.text(placardTextLimit, 25, curY + 22);
      
      curY += 34;
    }

    // Section 5: Financial Summary
    doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
    doc.setLineWidth(0.2);
    doc.line(20, curY, 190, curY);
    curY += 8;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Financial Statement', 20, curY);
    curY += 7;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    
    const vehicleName = vehicles.find(v => v.id === booking.vehicleId)?.make || 'Premium Expedition Package';
    const vehicleMan = vehicles.find(v => v.id === booking.vehicleId)?.manufacturer || 'Oman Fleet';
    doc.text('Assigned Fleet Item:', 20, curY);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${vehicleMan} ${vehicleName}`, 55, curY);
    curY += 5;

    doc.setFont('Helvetica', 'normal');
    doc.text('Calculation Duration:', 20, curY);
    const date1 = new Date(booking.pickupDate);
    const date2 = new Date(booking.dropoffDate);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    doc.setFont('Helvetica', 'bold');
    doc.text(`${diffDays} Days (Calculated at 24-hr standard cycle)`, 55, curY);
    curY += 8;

    // Detailed financial calculations including VAT and card fee
    const subtotal = booking.subtotal !== undefined ? booking.subtotal : booking.totalPrice;
    const vatAmount = booking.vatAmount !== undefined ? booking.vatAmount : (subtotal * 0.05);
    const cardFee = booking.cardFee !== undefined ? booking.cardFee : (booking.paymentMethod === 'credit-card' ? (subtotal + vatAmount) * 0.03 : 0);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    
    // Subtotal Row
    doc.text('Base Expedition Subtotal:', 20, curY);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${subtotal.toFixed(2)} OMR`, 145, curY);
    curY += 5;

    // VAT Row
    doc.setFont('Helvetica', 'normal');
    doc.text('Oman VAT (5%):', 20, curY);
    doc.setFont('Helvetica', 'bold');
    doc.text(`+${vatAmount.toFixed(2)} OMR`, 145, curY);
    curY += 5;

    // Card Surcharge Row (if applicable)
    if (booking.paymentMethod === 'credit-card') {
      doc.setFont('Helvetica', 'normal');
      doc.text('Card Payment Surcharge (3%):', 20, curY);
      doc.setFont('Helvetica', 'bold');
      doc.text(`+${cardFee.toFixed(2)} OMR`, 145, curY);
      curY += 5;
    }

    curY += 2; // Space before grand total box

    // Grand total box
    doc.setFillColor(248, 248, 246);
    doc.rect(20, curY, 170, 14, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.rect(20, curY, 170, 14);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('GRAND TOTAL AMOUNT:', 25, curY + 9);
    
    doc.setFontSize(12.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`${booking.totalPrice.toFixed(2)} OMR`, 145, curY + 9);
    
    curY += 22;

    // Section 6: Standard guidelines & Instructions
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Important Expedition Guidelines:', 20, curY);
    curY += 5;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    
    // Safely split guidelines to fit page width and prevent overflow/overlapping
    const guidelines = [
      '• Please present a copy of your driver license and international driving permit (if non-GCC) at pickup.',
      '• Speed limits in Oman: 120km/h on major highways, and strictly drive safely inside deep sandy wadis.',
      '• For immediate fleet support or coordinate adjustments, contact our operations center on WhatsApp +968 9307 0770.'
    ];

    guidelines.forEach(g => {
      const splitLines = doc.splitTextToSize(g, 170);
      splitLines.forEach((line: string) => {
        doc.text(line, 20, curY);
        curY += 4;
      });
    });

    // Footer signature relative to page bottom to prevent overlapping
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`SPEED Oman Adventures Operations Team | Page 1 of ${totalPages}`, 20, 266);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('Thank you for booking with SPEED. Have a safe and magical journey escaping into the nature of Oman!', 20, 271);

    // --- PAGE 2 (OPTIONAL): DETAILED EXPEDITION ITINERARY ---
    if (hasTour && tour) {
      doc.addPage();

      // Page border for Page 2
      doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
      doc.rect(10, 10, 190, 277);

      // Decorative top accent bar for Page 2
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(10, 10, 190, 6, 'F');

      // Draw Company Logo for Page 2
      drawCompanyLogo(20, 19, 35, 11);

      // Title next to logo
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('OMAN EXPEDITIONS', 60, 25);

      // Subtitle next to logo
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Detailed Travel Itinerary & Route Highlights', 60, 30);

      // Header Divider
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.4);
      doc.line(20, 35, 190, 35);

      let pItinY = 46;

      // Tour Name & Duration Banner Box
      doc.setFillColor(245, 250, 250);
      doc.rect(20, pItinY, 170, 18, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(tour.name.toUpperCase(), 25, pItinY + 6);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Expedition Duration: ${tour.durationDays} Days  |  Type: ${tour.type.toUpperCase()}`, 25, pItinY + 12);

      pItinY += 26;

      // Tour Description
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Expedition Overview:', 20, pItinY);
      pItinY += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      const descLines = doc.splitTextToSize(tour.description, 170);
      descLines.forEach((line: string) => {
        doc.text(line, 20, pItinY);
        pItinY += 4.5;
      });

      pItinY += 6;

      // Key Route & Locations (Visual Timeline Map)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Expedition Route & Key Stations:', 20, pItinY);
      pItinY += 8;

      // Draw horizontal timeline connection line
      doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, pItinY + 2, 190, pItinY + 2);

      const locCount = tour.locations.length;
      const stepWidth = 170 / Math.max(1, locCount - 1);

      tour.locations.forEach((loc, index) => {
        const xPos = 20 + (index * stepWidth);
        
        // Timeline node node circle
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(xPos, pItinY + 2, 1.5, 'F');

        // Location labels staggered above/below timeline line to prevent overlap
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
        
        const labelY = (index % 2 === 0) ? pItinY - 2 : pItinY + 7;
        doc.text(loc, xPos, labelY, { align: 'center' });
      });

      pItinY += 15;

      // Daily Highlights List
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Itinerary Daily Highlights & Landmarks:', 20, pItinY);
      pItinY += 7;

      tour.highlights.forEach((highlight, idx) => {
        // High-contrast Day tag badge
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(20, pItinY - 3, 13, 4.5, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(`DAY ${idx + 1}`, 22, pItinY);

        // Highlight name with bullet-style indentation
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
        doc.text(highlight, 38, pItinY);

        pItinY += 7.5;
      });

      // Footer signature for Page 2
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`SPEED Oman Adventures Operations Team | Page 2 of ${totalPages}`, 20, 266);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text('Thank you for booking with SPEED. Have a safe and magical journey escaping into the nature of Oman!', 20, 271);
    }

    // --- PAGE 2 (OR 3): TERMS, CONDITIONS & CUSTOMER RESPONSIBILITY ---
    doc.addPage();

    // Page border for Terms
    doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
    doc.rect(10, 10, 190, 277);

    // Decorative top accent bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(10, 10, 190, 6, 'F');

    // Draw Company Logo for Terms page
    drawCompanyLogo(20, 19, 35, 11);

    // Title next to logo
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('OMAN RENTAL AGREEMENT', 60, 25);

    // Subtitle next to logo
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('Terms & Conditions & Customer Responsibility Agreement', 60, 30);

    // Header Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 35, 190, 35);

    // Section 1: Rental Terms & Conditions
    let p2Y = 45;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('1. STANDARD RENTAL TERMS & CONDITIONS', 20, p2Y);
    p2Y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    const terms = [
      '1.1. Driver Qualifications: The renter must be at least 23 years of age, holding a valid driver license for a minimum of 2 years. Non-GCC nationals must present a valid International Driving Permit (IDP) alongside their original national driver license.',
      '1.2. Rental Duration: Rental periods are calculated on a standard 24-hour cycle. Grace period for vehicle return is 1 hour, after which a full extra day of rental fee will apply.',
      '1.3. Geographical Limits: Vehicles are strictly restricted to operate within the borders of the Sultanate of Oman. Crossing international borders (e.g., to UAE) is forbidden unless a specific written permit and premium cross-border insurance is pre-arranged.',
      '1.4. Security Deposit: A pre-authorization security deposit is captured at vehicle delivery. This is released within 14-21 business days after return, pending traffic fine checks from the Royal Oman Police (ROP) database.',
      '1.5. Fuel Policy: Vehicles are delivered with a full tank of fuel and must be returned with the same level. If returned with less, refueling charges plus a 15% administration fee will be billed to the renter.'
    ];

    terms.forEach(term => {
      const splitLines = doc.splitTextToSize(term, 170);
      splitLines.forEach((line: string) => {
        doc.text(line, 20, p2Y);
        p2Y += 3.8;
      });
      p2Y += 1.5;
    });

    p2Y += 3;

    // Section 2: Customer Responsibility & Safety Guidelines
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('2. CUSTOMER RESPONSIBILITY & OFF-ROAD SAFETY', 20, p2Y);
    p2Y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    const responsibilities = [
      '2.1. Safe Wadi and Desert Crossing: High-clearance 4WD vehicles must only be engaged in 4x4 modes when driving on sand or gravel. Driving through high-flow running wadis (flash floods) is strictly illegal and dangerous. Renters are fully responsible for engine hydrostatic lock due to water intake.',
      '2.2. Tire Pressure Adjustment: Before driving into deep sandy deserts (e.g., Wahiba Sands), tires must be deflated to 15-18 PSI to prevent getting stuck. Renters must re-inflate tires to standard highway pressure immediately upon returning to asphalt surfaces using the provided compressor.',
      '2.3. Accident and Damage Reporting: In the event of any collision or damage, the renter must obtain a green or red slip Police Report from the Royal Oman Police (ROP). Insurance claims are legally void in Oman without an official police report, making the renter 100% liable for all repair costs.',
      '2.4. Speed Limits and Traffic Compliance: Speed limits on major Oman freeways are capped at 120 km/h with radar tolerance. All speeding tickets, seatbelt violations, and parking fines incurred during the rental period are the absolute responsibility of the renter.',
      '2.5. Equipment and Camping Gear Care: All supplementary expedition gear (such as rooftop tents, refrigerators, gas stoves, GPS recovery tools, and recovery boards) must be returned clean and in fully functional condition. Missing or broken gear will be charged at current retail replacement rates.'
    ];

    responsibilities.forEach(resp => {
      const splitLines = doc.splitTextToSize(resp, 170);
      splitLines.forEach((line: string) => {
        doc.text(line, 20, p2Y);
        p2Y += 3.8;
      });
      p2Y += 1.5;
    });

    // Signature Block / Consent at bottom of page
    const sigY = 238;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CUSTOMER ACKNOWLEDGEMENT & ACCEPTANCE', 20, sigY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('By accepting this rental receipt, I hereby agree to the above Terms, Conditions & Customer Responsibility requirements.', 20, sigY + 4);

    doc.setDrawColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.setLineWidth(0.2);
    
    // Line for customer signature
    doc.line(20, sigY + 16, 90, sigY + 16);
    doc.text('Customer Signature & Date', 20, sigY + 20);

    // Line for SPEED Oman representative signature
    doc.line(120, sigY + 16, 190, sigY + 16);
    doc.text('Authorized SPEED Oman Signature', 120, sigY + 20);

    // Footer on terms page
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`SPEED Oman Adventures Operations Team | Page ${totalPages} of ${totalPages}`, 20, 266);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text('Thank you for booking with SPEED. Have a safe and magical journey escaping into the nature of Oman!', 20, 271);

    // Save or Print
    if (action === 'print') {
      try {
        doc.autoPrint();
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (err) {
        console.error("Print error:", err);
        // Fallback to save if window.open is blocked or fails
        doc.save(`SPEED-Oman-Booking-${booking.bookingId}.pdf`);
      }
    } else {
      doc.save(`SPEED-Oman-Booking-${booking.bookingId}.pdf`);
    }
  };

  // Dynamic available calendar dates based on selected calendarMonth and calendarYear
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const paddedMonth = String(calendarMonth + 1).padStart(2, '0');
    const paddedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${calendarYear}-${paddedMonth}-${paddedDay}`;
    
    // Simulate mock pre-reserved dates for realism (e.g. 8th to 11th)
    let isRented = dayNum >= 8 && dayNum <= 11;
    let isSelected = dateStr === pickupDate || dateStr === dropoffDate;
    let isRange = dateStr > pickupDate && dateStr < dropoffDate;

    return { dayNum, dateStr, isRented, isSelected, isRange };
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans antialiased selection:bg-[#2D7A82] selection:text-white">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
              setActiveTab('booking');
              setWizardStep(1);
              setConfirmedBooking(null);
            }}
            title="Go to Home / Reset Booking"
            className="focus:outline-none hover:opacity-85 transition shrink-0 cursor-pointer text-left"
          >
            <Logo className="h-10 md:h-12" />
          </button>
          
          {/* Subtitle / badge */}
          <span className="hidden xl:inline-block text-[11px] font-mono text-stone-600 bg-stone-100 border border-stone-200 rounded px-2.5 py-1">
            🛡️ <strong className="text-[#2D7A82]">Oman Adventure Fleet</strong> (Premium 4WDs & Sedans)
          </span>
        </div>

        {/* Global Nav Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'booking' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Compass className="inline h-3.5 w-3.5 mr-1" />
            {t.bookingTitle}
          </button>
          
          {/* Sights Tours Custom Expedition Planner Tab */}
          <button
            onClick={() => setActiveTab('custom-planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'custom-planner' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Compass className="inline h-3.5 w-3.5 mr-1 text-[#C47E5A]" />
            Wilderness Planner
          </button>

          {/* Zahara Tours Comparison Tab */}
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'comparison' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Car className="inline h-3.5 w-3.5 mr-1" />
            Compare Rates
          </button>

          {/* Google Maps & Customer Reviews Tab */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Star className="inline h-3.5 w-3.5 mr-1 fill-current text-amber-500 animate-pulse" />
            Maps & Reviews
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'loyalty' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Award className="inline h-3.5 w-3.5 mr-1" />
            {t.loyaltyTitle}
          </button>
          
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'subscriptions' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Layers className="inline h-3.5 w-3.5 mr-1" />
            {t.subscriptionTitle}
          </button>
          
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'api' ? 'bg-[#2D7A82] text-white shadow-sm' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50/50'
            }`}
          >
            <Terminal className="inline h-3.5 w-3.5 mr-1" />
            Partners API
          </button>

          {/* Admin Cockpit Dashboard */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'admin' ? 'bg-[#C47E5A] text-white shadow-sm animate-pulse' : 'text-stone-600 hover:text-[#C47E5A] hover:bg-[#C47E5A]/5'
            }`}
          >
            <Settings className="inline h-3.5 w-3.5 mr-1" />
            Admin Cockpit
          </button>
        </nav>

        {/* Right side language selector & phone contact */}
        <div className="flex items-center gap-3">
          {/* Direct WhatsApp Callout */}
          <a
            href="https://wa.me/96893070770"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-400/30"
            title="WhatsApp Support +968 9307 0770"
          >
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.478 5.357 1.479 5.437 0 9.859-4.42 9.862-9.859.002-2.636-1.023-5.111-2.884-6.974C17.26 1.936 14.78 1.9 12.012 1.9c-5.44 0-9.863 4.419-9.866 9.86 0 2.128.556 4.195 1.61 6.012l-.995 3.633 3.731-.978zm11.367-7.234c-.3-.15-1.772-.875-2.046-.975-.275-.1-.475-.15-.674.15-.199.3-.773.975-.948 1.175-.175.2-.35.225-.65.075-1.205-.6-2.099-1.077-2.933-2.51-.219-.375.219-.348.627-1.156.075-.15.038-.282-.019-.394-.056-.113-.475-1.144-.65-1.569-.171-.413-.342-.356-.475-.362-.122-.006-.263-.008-.403-.008-.14 0-.368.053-.56.263-.193.21-.738.72-7.38.72s1.147 1.417 1.302 1.625c.156.208 2.229 3.403 5.4 4.767.753.325 1.341.519 1.8.663.757.241 1.448.207 1.993.125.607-.09 1.772-.725 2.022-1.391.25-.666.25-1.238.175-1.391-.075-.153-.275-.253-.575-.403z"/>
            </svg>
          </a>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
            <Globe className="h-3.5 w-3.5 text-stone-400 ml-1.5 shrink-0" />
            {(['en', 'ar', 'fr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition cursor-pointer ${
                  lang === l ? 'bg-[#2D7A82] text-white' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Tab bar */}
      <div className="xl:hidden sticky top-[73px] z-30 bg-white/95 border-b border-stone-200/80 overflow-x-auto whitespace-nowrap scrollbar-hide py-2 px-4 flex gap-1.5">
        <button
          onClick={() => setActiveTab('booking')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'booking' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {t.bookingTitle}
        </button>
        <button
          onClick={() => setActiveTab('custom-planner')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'custom-planner' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          🧭 Wilderness Planner
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'comparison' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          🚗 Compare Rates
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'reviews' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          ⭐ Maps & Reviews
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'loyalty' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {t.loyaltyTitle}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'subscriptions' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {t.subscriptionTitle}
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'api' ? 'bg-[#2D7A82] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          Partners API
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
            activeTab === 'admin' ? 'bg-[#C47E5A] text-white shadow-sm' : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          ⚙️ Admin Panel
        </button>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        
        {/* Banner Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-[#192b30] to-[#0f1d21] border border-stone-800 p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-8 shadow-xl text-white">
          {/* Subtle glowing accent */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex-1 space-y-4 z-10">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-[#4B9CB5] px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
              <span>{t.heroSubtitle}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-100 to-teal-200">
              {t.heroTitle}
            </h1>
            
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-2xl">
              {t.heroDesc}
            </p>
            
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="bg-stone-950/65 border border-stone-800 rounded-xl p-3 text-center min-w-[100px]">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-mono font-bold">ESTABLISHED</p>
                <p className="text-base font-black text-teal-400 font-display">2009</p>
              </div>
              <div className="bg-stone-950/65 border border-stone-800 rounded-xl p-3 text-center min-w-[100px]">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-mono font-bold">PREMIUM FLEET</p>
                <p className="text-base font-black text-teal-400 font-display">19+ Models</p>
              </div>
              <div className="bg-stone-950/65 border border-stone-800 rounded-xl p-3 text-center min-w-[100px]">
                <p className="text-[9px] text-stone-500 uppercase tracking-widest font-mono font-bold">NATIVE SUPPORT</p>
                <p className="text-base font-black text-teal-400 font-display">EN/AR/FR</p>
              </div>
            </div>
          </div>

          {/* Visual Landscape Split Collage */}
          <div className="w-full lg:w-[480px] shrink-0 grid grid-cols-2 gap-4 z-10">
            {/* Mountain Canyon */}
            <div className="relative overflow-hidden rounded-2xl h-52 border border-stone-800 shadow-md group">
              <img
                src="/src/assets/images/oman_mountain_4wd_1783926667916.jpg"
                alt="Oman Jebel Akhdar Mountain 4WD"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[8px] bg-teal-500 text-slate-950 font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider block w-max mb-1">
                  Mountains
                </span>
                <span className="text-[11px] font-bold text-white block truncate leading-tight">
                  Jebel Akhdar Canyon
                </span>
              </div>
            </div>

            {/* Desert Oasis */}
            <div className="relative overflow-hidden rounded-2xl h-52 border border-stone-800 shadow-md group">
              <img
                src="/src/assets/images/oman_desert_camp_1783926683564.jpg"
                alt="Oman Wahiba Sands Desert Safari"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[8px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider block w-max mb-1">
                  Wilderness
                </span>
                <span className="text-[11px] font-bold text-white block truncate leading-tight">
                  Wahiba Sands Desert
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Router Switch */}
        {activeTab === 'booking' && (
          <section className="space-y-6">
            
            {/* Wizard Header and Progress steps */}
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-150 pb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2 font-display">
                    <Compass className="text-[#2D7A82] h-6 w-6" />
                    {t.bookingTitle}
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <p className="text-xs text-stone-500">
                      Customize your car, camping gear accessories, and Oman trekking packages in one unified flow.
                    </p>
                    {wizardStep > 1 && (
                      <button
                        onClick={() => {
                          setConfirmedBooking(null);
                          setWizardStep(1);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D7A82] hover:text-white hover:bg-[#2D7A82] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded cursor-pointer transition sm:ml-3"
                      >
                        <Home className="h-3 w-3" />
                        Cancel & Return to Home Page
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  {[1, 2, 3, 4, 5].map((step) => {
                    // Decide visibility based on bookingType
                    const isSkipped = 
                      (step === 2 && bookingType === 'tourism') ||
                      (step === 3 && bookingType === 'tourism') ||
                      (step === 4 && bookingType === 'rental');

                    if (isSkipped) return null;

                    return (
                      <span
                        key={step}
                        className={`h-6 px-2.5 rounded-full flex items-center justify-center font-bold border transition ${
                          wizardStep === step
                            ? 'bg-[#2D7A82] text-white border-[#2D7A82]'
                            : wizardStep > step
                            ? 'bg-[#EBF5F6] text-[#2D7A82] border-[#2D7A82]/30'
                            : 'bg-stone-50 text-stone-400 border-stone-200'
                        }`}
                      >
                        {step}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Booking Type, Pickup locations, and Dates */}
              {wizardStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Booking Selection Mode */}
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-3 font-semibold">
                      {t.bookingChoice}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Combo Option (Recommended) */}
                      <button
                        type="button"
                        onClick={() => setBookingType('combo')}
                        className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          bookingType === 'combo'
                            ? 'bg-gradient-to-tr from-slate-900 to-slate-850 border-[#4B9CB5] text-white ring-1 ring-[#4B9CB5]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <Tent className={`h-5 w-5 mt-1 ${bookingType === 'combo' ? 'text-teal-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-teal-400 font-extrabold flex items-center gap-1">
                            RECOMMENDED <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                          </p>
                          <p className="text-sm font-bold text-white mt-1">{t.comboAll}</p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Complete expedition: 4WD rental + customized rooftop tents + guided trek/safari package.
                          </p>
                        </div>
                      </button>

                      {/* Rental Only */}
                      <button
                        type="button"
                        onClick={() => setBookingType('rental')}
                        className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          bookingType === 'rental'
                            ? 'bg-gradient-to-tr from-slate-900 to-slate-850 border-[#4B9CB5] text-white ring-1 ring-[#4B9CB5]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <Car className={`h-5 w-5 mt-1 ${bookingType === 'rental' ? 'text-teal-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Standard</p>
                          <p className="text-sm font-bold text-white mt-1">{t.rentalOnly}</p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Rent a vehicle from our premium fleet. Includes full insurance & optional accessories.
                          </p>
                        </div>
                      </button>

                      {/* Tour Only */}
                      <button
                        type="button"
                        onClick={() => setBookingType('tourism')}
                        className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          bookingType === 'tourism'
                            ? 'bg-gradient-to-tr from-slate-900 to-slate-850 border-[#4B9CB5] text-white ring-1 ring-[#4B9CB5]'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <Compass className={`h-5 w-5 mt-1 ${bookingType === 'tourism' ? 'text-teal-400' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">Excursions</p>
                          <p className="text-sm font-bold text-white mt-1">{t.tourOnly}</p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            Guided mountain hikes, cultural tours, and desert safaris without a rental vehicle.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Locations Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
                        {t.pickupLoc}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute top-3 left-3 text-teal-400 h-4 w-4" />
                        <select
                          value={pickupLoc}
                          onChange={(e) => setPickupLoc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:border-teal-500 focus:outline-none"
                        >
                          {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                      {pickupLoc.toLowerCase().includes('airport') && (
                        <div className="mt-2.5 bg-[#0f2d30] border border-teal-500 p-3.5 rounded-lg flex items-start gap-3 text-xs text-teal-100 animate-fade-in shadow-lg">
                          <span className="text-lg leading-none mt-0.5">✈️</span>
                          <div className="space-y-1">
                            <span className="font-bold block text-teal-300 uppercase tracking-wider text-[11px]">
                              Airport Delivery VIP Welcoming Included!
                            </span>
                            <p className="text-slate-200 leading-relaxed">
                              An agent will track your flight status and meet you inside the arrivals lounge. You can specify your flight number, airline carrier, luggage count, and greeting placard text in the final checkout step.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
                        {t.dropoffLoc}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute top-3 left-3 text-teal-400 h-4 w-4" />
                        <select
                          value={dropoffLoc}
                          onChange={(e) => setDropoffLoc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:border-teal-500 focus:outline-none"
                        >
                          {LOCATIONS.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dates with Intuitive Calendar Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Standard pickup input */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
                          {t.pickupDate} & Time <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none transition-all ${
                              step1Error && !pickupDate ? 'border-red-500 bg-red-950/10' : 'border-slate-700'
                            }`}
                          />
                          <input
                            type="time"
                            required
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none transition-all ${
                              step1Error && !pickupTime ? 'border-red-500 bg-red-950/10' : 'border-slate-700'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-2 font-semibold">
                          {t.dropoffDate} & Time <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            value={dropoffDate}
                            onChange={(e) => setDropoffDate(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none transition-all ${
                              step1Error && !dropoffDate ? 'border-red-500 bg-red-950/10' : 'border-slate-700'
                            }`}
                          />
                          <input
                            type="time"
                            required
                            value={dropoffTime}
                            onChange={(e) => setDropoffTime(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none transition-all ${
                              step1Error && !dropoffTime ? 'border-red-500 bg-red-950/10' : 'border-slate-700'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-300">
                        <div className="flex justify-between">
                          <span>Total Rental Days:</span>
                          <span className="font-bold text-teal-400">{rentalDays} {t.days}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          * Off-road pickup includes custom comprehensive driver orientation before dispatch.
                        </div>
                      </div>
                    </div>

                    {/* Intuitive Calendar Interface showing dynamic availability */}
                    <div className="lg:col-span-2 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (calendarMonth === 0) {
                                setCalendarMonth(11);
                                setCalendarYear(prev => prev - 1);
                              } else {
                                setCalendarMonth(prev => prev - 1);
                              }
                            }}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition cursor-pointer"
                            title="Previous Month"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {/* Month Selector */}
                          <select
                            value={calendarMonth}
                            onChange={(e) => setCalendarMonth(parseInt(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                          >
                            {Array.from({ length: 12 }).map((_, i) => (
                              <option key={i} value={i}>
                                {new Intl.DateTimeFormat(lang === 'ar' ? 'ar-OM' : 'en-US', { month: 'long' }).format(new Date(2026, i, 1))}
                              </option>
                            ))}
                          </select>

                          {/* Year Selector */}
                          <select
                            value={calendarYear}
                            onChange={(e) => setCalendarYear(parseInt(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono focus:border-teal-500 focus:outline-none cursor-pointer"
                          >
                            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              if (calendarMonth === 11) {
                                setCalendarMonth(0);
                                setCalendarYear(prev => prev + 1);
                              } else {
                                setCalendarMonth(prev => prev + 1);
                              }
                            }}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition cursor-pointer"
                            title="Next Month"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 self-end sm:self-auto">
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-teal-500"></span> Selected
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-[#1e293b]"></span> Available
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-rose-500"></span> Pre-booked
                          </span>
                        </div>
                      </div>

                      {/* Month Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                          <span key={idx} className="text-[10px] text-slate-500 font-bold py-1">
                            {day}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for padding before the 1st day of the selected month */}
                        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                          <div key={idx} className="aspect-square opacity-0"></div>
                        ))}

                         {/* Rendering dynamic available days */}
                        {calendarDays.map(({ dayNum, dateStr, isRented, isSelected, isRange }) => {
                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => {
                                if (isRented) return;
                                
                                // Direct calendar range picking
                                if (!pickupDate) {
                                  setPickupDate(dateStr);
                                } else if (!dropoffDate) {
                                  if (dateStr < pickupDate) {
                                    setPickupDate(dateStr);
                                  } else if (dateStr === pickupDate) {
                                    // toggle off
                                    setPickupDate('');
                                  } else {
                                    setDropoffDate(dateStr);
                                  }
                                } else {
                                  // Both are set, start a new range selection
                                  setPickupDate(dateStr);
                                  setDropoffDate('');
                                }
                                setSelectedCalendarDate(dateStr);
                              }}
                              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition relative cursor-pointer ${
                                isRented
                                  ? 'bg-rose-950/20 text-rose-500 border border-rose-950/40 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-teal-500 text-slate-950 font-bold'
                                  : isRange
                                  ? 'bg-teal-950/50 text-teal-300 border border-teal-800/40'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                              }`}
                            >
                              <span>{dayNum}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {step1Error && (
                    <div className="bg-rose-950/20 border border-rose-500/50 rounded-xl p-4 text-xs text-rose-200 flex items-start gap-3 animate-fade-in">
                      <span className="text-base">⚠️</span>
                      <div>
                        <p className="font-bold uppercase tracking-wider text-[10px] text-rose-400 font-mono mb-1">Validation Error</p>
                        <p>{step1Error}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 self-start sm:self-center">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span>Required fields are marked with <span className="text-red-500 font-bold">*</span></span>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full sm:w-auto bg-[#4B9CB5] hover:bg-[#3d8399] text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer shadow-lg shadow-teal-500/15"
                    >
                      Configure Vehicle Selection
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Vehicle Selection */}
              {wizardStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <label className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold block">
                        {t.chooseVehicle}
                      </label>

                      {/* Filter buttons */}
                      <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {(['ALL', 'SUV', '4WD', 'Sedan', 'Premium'] as const).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setVehicleCategoryFilter(cat)}
                            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                              vehicleCategoryFilter === cat
                                ? 'bg-teal-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {vehicles.filter(
                        (v) => vehicleCategoryFilter === 'ALL' || v.category === vehicleCategoryFilter
                      ).map((v) => {
                        const isSelected = v.id === selectedVehicleId;
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVehicleId(v.id)}
                            className={`rounded-xl border p-4 flex flex-col justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 border-teal-500 ring-1 ring-teal-500'
                                : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                                    {v.category}
                                  </span>
                                  <h3 className="text-base font-extrabold text-white mt-1.5 font-display">
                                    {v.manufacturer} {v.make}
                                  </h3>
                                  <p className="text-xs text-slate-400">{v.seats} Seats</p>
                                </div>

                                <div className="text-right">
                                  <span className="text-lg font-black text-teal-400">{v.pricePerDay} {t.currencySymbol}</span>
                                  <p className="text-[10px] text-slate-500">/ day</p>
                                </div>
                              </div>

                              {/* Beautiful Real Vehicle Photo */}
                              <div className="bg-slate-900 rounded-lg h-36 my-3.5 relative overflow-hidden border border-slate-800/60 group">
                                <img
                                  src={v.image}
                                  alt={`${v.manufacturer} ${v.make}`}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                {v.category === '4WD' && (
                                  <span className="absolute bottom-2 right-2 text-[8px] bg-teal-500/90 text-slate-950 px-2 py-0.5 rounded font-bold font-mono shadow-sm">
                                    CAMPING READY
                                  </span>
                                )}
                              </div>

                              {/* Features */}
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {v.features.slice(0, 3).map((f, idx) => (
                                  <span key={idx} className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`w-full mt-4 text-xs font-bold py-2 rounded-lg transition-all ${
                                isSelected
                                  ? 'bg-teal-500 text-slate-950'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              }`}
                            >
                              {isSelected ? '✓ Selected Vehicle' : 'Select Vehicle'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#4B9CB5] hover:bg-[#3d8399] text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      Camping Gear & Accessories
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Camping Gears & Accessories */}
              {wizardStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5 font-display">
                      {t.chooseCamping}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {t.campingDesc}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CAMPING_GEAR.map((gear) => {
                        const isChecked = selectedCampingGearIds.includes(gear.id);
                        return (
                          <div
                            key={gear.id}
                            onClick={() => {
                              setSelectedCampingGearIds((prev) =>
                                isChecked ? prev.filter((id) => id !== gear.id) : [...prev, gear.id]
                              );
                            }}
                            className={`p-4 rounded-xl border flex gap-3 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-slate-900 border-teal-500'
                                : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            <div className="pt-0.5">
                              <div
                                className={`h-4 w-4 rounded border flex items-center justify-center ${
                                  isChecked ? 'bg-teal-500 border-teal-500' : 'border-slate-600'
                                }`}
                              >
                                {isChecked && <Check className="h-3 w-3 text-slate-950" />}
                              </div>
                            </div>

                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-white">{gear.name}</h4>
                                <span className="text-xs font-mono text-teal-400 font-extrabold shrink-0 ml-2">
                                  +{gear.pricePerDay} {t.currencySymbol} / day
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {gear.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Premium GPS Navigator */}
                    <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-teal-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Compass className="text-teal-400 h-5 w-5 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{t.gpsInclude}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Offline routing loaded for Sultanate of Oman wadis.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNeedGps(!needGps)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                          needGps ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {needGps ? '✓ Included' : 'Include'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#4B9CB5] hover:bg-[#3d8399] text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {bookingType === 'combo' ? 'Configure Oman Tourism Package' : 'Proceed to Checkout'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Tourism Packages */}
              {wizardStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-base font-extrabold text-white mb-1.5 font-display">
                      {t.chooseTour}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Select one of our curated local packages. Includes expert local guides, cultural permits, and camp access.
                    </p>

                    <div className="space-y-4">
                      {/* Explicit No Tour Package Option */}
                      <div
                        onClick={() => setSelectedTourId('')}
                        className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 transition-all cursor-pointer ${
                          selectedTourId === '' || selectedTourId === null
                            ? 'bg-slate-900 border-teal-500'
                            : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-slate-950 border border-slate-800 text-teal-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider animate-pulse">
                              Independent
                            </span>
                            <span className="text-xs text-slate-400 font-mono">Self-Guided</span>
                          </div>
                          <h4 className="text-sm font-bold text-white font-display">No Tour Package (Independent Travel Only)</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            No organized tourism package needed. Enjoy complete freedom to drive across Oman’s stunning wadis, deserts, and coastline on your own schedule.
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                              ★ 100% Flexible Itinerary
                            </span>
                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                              ★ No guide fees or group constraints
                            </span>
                          </div>
                        </div>

                        <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0 text-right">
                          <div>
                            <span className="text-lg font-black text-teal-400">0.00 {t.currencySymbol}</span>
                            <p className="text-[10px] text-slate-500">no package charges</p>
                          </div>

                          <button
                            type="button"
                            className={`w-full mt-3 text-xs font-bold py-1.5 rounded-lg transition-all ${
                              (selectedTourId === '' || selectedTourId === null) ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {(selectedTourId === '' || selectedTourId === null) ? 'Selected (Independent)' : 'Skip Tourism Package'}
                          </button>
                        </div>
                      </div>

                      {TOURISM_PACKAGES.map((tour) => {
                        const isSelected = tour.id === selectedTourId;
                        return (
                          <div
                            key={tour.id}
                            onClick={() => setSelectedTourId(isSelected ? '' : tour.id)}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 border-teal-500'
                                : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            {/* Visual Photography Thumbnail */}
                            {tour.image && (
                              <div className="w-full md:w-48 h-32 md:h-auto shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 relative">
                                <img
                                  src={tour.image}
                                  alt={tour.name}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-2 left-2 bg-slate-950/85 text-teal-400 border border-slate-800 text-[8px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                                  {tour.type}
                                </div>
                              </div>
                            )}

                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-teal-400 font-mono font-bold">{tour.durationDays} Days Expedition</span>
                                <span className="text-[10px] text-slate-500 font-mono">• Guided & permitted</span>
                              </div>
                              <h4 className="text-sm font-bold text-white font-display">{tour.name}</h4>
                              <p className="text-xs text-slate-300 leading-relaxed">{tour.description}</p>
                              
                              <div className="flex flex-wrap gap-1 pt-1">
                                {tour.highlights.map((hl, idx) => (
                                  <span key={idx} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                                    ★ {hl}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 shrink-0 text-right">
                              <div>
                                <span className="text-lg font-black text-teal-400">{tour.pricePerPerson} {t.currencySymbol}</span>
                                <p className="text-[10px] text-slate-500">per person</p>
                              </div>

                              <button
                                type="button"
                                className={`w-full mt-3 text-xs font-bold py-1.5 rounded-lg transition-all ${
                                  isSelected ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {isSelected ? 'Selected Package' : 'Select Package'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Travelers Count */}
                    {(selectedTourId && selectedTourId !== '') && (
                      <div className="mt-5 bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white">{t.people}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">Adjust group count to modify tourism package rates.</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setTravelersCount(prev => Math.max(1, prev - 1))}
                            className="bg-slate-850 border border-slate-700 hover:bg-slate-700 p-1.5 rounded transition cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-sm font-bold w-4 text-center">{travelersCount}</span>
                          <button
                            type="button"
                            onClick={() => setTravelersCount(prev => Math.min(12, prev + 1))}
                            className="bg-slate-850 border border-slate-700 hover:bg-slate-700 p-1.5 rounded transition cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#4B9CB5] hover:bg-[#3d8399] text-slate-950 font-bold px-6 py-2.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      Configure Driver & Checkout
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Checkout / Payment */}
              {wizardStep === 5 && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-6 animate-fade-in">
                  
                  {/* Checkout summary panel */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                      {t.summaryTitle}
                    </h3>
                    
                    <div className="divide-y divide-slate-900 text-xs text-slate-300 space-y-2">
                      {/* Booking Choice */}
                      <div className="flex justify-between pb-2 font-semibold">
                        <span>Expedition Type:</span>
                        <span className="text-white capitalize">{bookingType}</span>
                      </div>

                      {/* Dates */}
                      <div className="flex justify-between py-2">
                        <span>Rental Duration:</span>
                        <span>{pickupDate} to {dropoffDate} ({rentalDays} {t.days})</span>
                      </div>

                      {/* Vehicle Cost */}
                      {(bookingType === 'rental' || bookingType === 'combo') && (
                        <div className="flex justify-between py-2">
                          <span>
                            Vehicle ({vehicles.find((v) => v.id === selectedVehicleId)?.make}):
                          </span>
                          <span>
                            {costs.vehicleRate * rentalDays} {t.currencySymbol}
                          </span>
                        </div>
                      )}

                      {/* Camping Extras */}
                      {(bookingType === 'rental' || bookingType === 'combo') && selectedCampingGearIds.length > 0 && (
                        <div className="flex justify-between py-2">
                          <span>Camping Gear Accessories ({selectedCampingGearIds.length} items):</span>
                          <span>{costs.gearRateSum * rentalDays} {t.currencySymbol}</span>
                        </div>
                      )}

                      {/* Tourism package */}
                      {(bookingType === 'tourism' || bookingType === 'combo') && (
                        <div className="flex justify-between py-2">
                          <span>
                            {selectedTourId
                              ? `Tour Package (${TOURISM_PACKAGES.find((t) => t.id === selectedTourId)?.name || 'Custom'}):`
                              : 'Tour Package (No Package Selected / Independent Travel):'}
                          </span>
                          <span>{costs.tourSubtotal} {t.currencySymbol}</span>
                        </div>
                      )}

                      {/* Subtotal */}
                      <div className="flex justify-between py-2 border-t border-slate-900 font-semibold text-slate-300">
                        <span>Base Subtotal:</span>
                        <span className="text-white">{costs.subtotal.toFixed(2)} {t.currencySymbol}</span>
                      </div>

                      {/* VAT of 5% */}
                      <div className="flex justify-between py-1.5 text-slate-400">
                        <span>Oman VAT (5%):</span>
                        <span className="font-mono text-slate-300">+{costs.vatAmount.toFixed(2)} {t.currencySymbol}</span>
                      </div>

                      {/* Card fee (if card payment) */}
                      {paymentMethod === 'credit-card' && (
                        <div className="flex justify-between py-1.5 text-amber-400 font-medium animate-fade-in">
                          <span>Card Surcharge (3%):</span>
                          <span className="font-mono">+{costs.cardFee.toFixed(2)} {t.currencySymbol}</span>
                        </div>
                      )}

                      {/* Total cost */}
                      <div className="flex justify-between pt-3 text-sm font-extrabold border-t border-slate-800">
                        <span className="text-teal-400">GRAND TOTAL (OMR):</span>
                        <span className="text-teal-400">
                          {costs.grandTotal.toFixed(2)} {t.currencySymbol}
                        </span>
                      </div>

                      {/* USD conversion */}
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>{t.usdEquivalent}:</span>
                        <span>${costs.grandTotalUsd.toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver details */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-1">
                      {t.personalDetails}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          {t.driverName}
                        </label>
                        <input
                          type="text"
                          required
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          {t.driverEmail}
                        </label>
                        <input
                          type="email"
                          required
                          value={driverEmail}
                          onChange={(e) => setDriverEmail(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          {t.driverPhone}
                        </label>
                        <input
                          type="text"
                          required
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Insurance Packages selection */}
                    {(bookingType === 'rental' || bookingType === 'combo') && (
                      <div className="mt-4 border-t border-slate-900 pt-3">
                        <label className="text-[10px] text-slate-400 block mb-2 font-mono font-bold uppercase tracking-wider">{t.chooseInsurance}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {INSURANCE_PACKAGES.map((ins) => (
                            <div
                              key={ins.id}
                              onClick={() => setSelectedInsuranceId(ins.id)}
                              className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                                selectedInsuranceId === ins.id
                                  ? 'bg-slate-900 border-teal-500'
                                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-white">{ins.name}</span>
                                <span className="text-xs font-mono font-bold text-teal-400">
                                  {ins.pricePerDay === 0 ? 'Free' : `+${ins.pricePerDay} ${t.currencySymbol}`}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">{ins.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrival & Airport Pickup Information */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                        <span>✈️</span> {pickupLoc.toLowerCase().includes('airport') ? 'VIP Airport Welcoming & Meet-and-Greet Details' : 'Arrival & Pickup Information'}
                      </h4>
                      {pickupLoc.toLowerCase().includes('airport') && (
                        <span className="text-[10px] bg-teal-500/10 border border-teal-500/30 text-teal-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse">
                          VIP Service Enabled
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {pickupLoc.toLowerCase().includes('airport') 
                        ? 'Since you requested Muscat or Salalah Airport delivery, SPEED provides a complimentary VIP arrivals welcome. Our team will track your flight landings in real-time, prepare a high-quality physical signboard, and meet you inside the arrival gates.' 
                        : 'Provide details below to arrange automatic arrival pickup at your designated station.'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Arrival Date
                        </label>
                        <input
                          type="date"
                          value={arrivalDate}
                          onChange={(e) => setArrivalDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Arrival Time
                        </label>
                        <input
                          type="time"
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Flight Number {pickupLoc.toLowerCase().includes('airport') ? '(Required)' : '(Optional)'}
                        </label>
                        <input
                          type="text"
                          required={pickupLoc.toLowerCase().includes('airport')}
                          placeholder="e.g. WY 101"
                          value={flightNumber}
                          onChange={(e) => setFlightNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Show advanced airport flight related details if airport pickup */}
                    {pickupLoc.toLowerCase().includes('airport') && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-900/50 animate-fade-in">
                        <div>
                          <label className="text-[10px] text-teal-400 block mb-1 font-semibold">
                            Airline Carrier / Company <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Oman Air, Emirates, Qatar Airways"
                            value={airlineCarrier}
                            onChange={(e) => setAirlineCarrier(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-teal-400 block mb-1 font-semibold">
                            Arrival Terminal <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <select
                            value={terminalNumber}
                            onChange={(e) => setTerminalNumber(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none"
                          >
                            <option value="Terminal 1">Terminal 1 (International Arrivals)</option>
                            <option value="Terminal 2">Terminal 2 (Domestic / Low-Cost Arrivals)</option>
                            <option value="VIP General Aviation Terminal">VIP Executive Lounge / Terminal</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-teal-400 block mb-1 font-semibold">
                            Total Bags / Luggage Count <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            required
                            value={luggageCount}
                            onChange={(e) => setLuggageCount(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:border-teal-500 focus:outline-none font-mono"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-[10px] text-teal-400 block mb-1 font-semibold">
                            Placard Greeting Signboard Text <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Dr. Amjad Al-Busaidi"
                              value={placardText}
                              onChange={(e) => setPlacardText(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none font-bold"
                            />
                            <span className="absolute right-2.5 top-1.5 text-[9px] bg-amber-950 text-amber-400 border border-amber-900/50 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                              Placard Preview
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-teal-400 block mb-1 font-semibold">Connecting Flight / Flight Origin</label>
                          <input
                            type="text"
                            placeholder="e.g. No (Direct Flight) or London via Doha"
                            value={connectingFlight}
                            onChange={(e) => setConnectingFlight(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Full Customer Instructions & Pickup Notes</label>
                      <textarea
                        rows={2}
                        placeholder={pickupLoc.toLowerCase().includes('airport') 
                          ? "e.g., Travelling with children, need SIM card assistance, wheelchair requested, or special meet point instructions..." 
                          : "E.g., 4 passengers with 3 big suitcases, please bring a signboard with name, need toddler child seat, etc..."}
                        value={customerPickupDetails}
                        onChange={(e) => setCustomerPickupDetails(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-teal-400" />
                      Payment Method
                    </h4>

                    {/* Payment Option Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        type="button"
                        onClick={() => setPaymentMethod('on-arrival')}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-center gap-3 ${
                          paymentMethod === 'on-arrival'
                            ? 'bg-slate-900 border-teal-500'
                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'on-arrival' ? 'border-teal-500 animate-pulse' : 'border-slate-600'}`}>
                          {paymentMethod === 'on-arrival' && <div className="h-2 w-2 rounded-full bg-teal-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">💳 Pay on Arrival</span>
                          <span className="text-[10px] text-slate-400">Settle with Cash/Card at pick up. 0 OMR pre-payment.</span>
                        </div>
                      </div>

                      <div
                        type="button"
                        onClick={() => setPaymentMethod('credit-card')}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-center gap-3 ${
                          paymentMethod === 'credit-card'
                            ? 'bg-slate-900 border-teal-500'
                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit-card' ? 'border-teal-500' : 'border-slate-600'}`}>
                          {paymentMethod === 'credit-card' && <div className="h-2 w-2 rounded-full bg-teal-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">🔒 Pay Online with Card</span>
                          <span className="text-[10px] text-slate-400">Secure instant reservation. Simulating credit-card transaction.</span>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'credit-card' ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-900 pt-3 animate-fade-in">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            {t.cardNum} <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 4716 1234 5678 9812"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            {t.cardExp} <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 11/29"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">
                            {t.cardCvv} <span className="text-red-500 font-bold ml-0.5">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 382"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-teal-950/20 border border-teal-900/50 p-3 rounded-lg text-[11px] text-teal-300">
                        👌 <strong>Excellent choice:</strong> You have selected <strong>Pay on Arrival</strong>. No advance payment or card details are required today. Your booking is fully secured and we will dispatch a confirmation email to <strong>admin@bullseyetargetllc.com</strong>.
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleBackStep}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t.confirmBooking}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 6: Booking Confirmed Success Digital Receipt */}
              {wizardStep === 6 && confirmedBooking && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center py-6 space-y-3">
                    <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                      <ShieldCheck className="h-8 w-8 animate-bounce" />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                      Booking Confirmed & Fully Prepped
                    </span>
                    <h3 className="text-2xl font-black text-white font-display">
                      Your Sultanate Expedition is Registered!
                    </h3>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto">
                      A customized automated booking confirmation has been dispatched to your email and mobile. Our fleet managers are preparing your custom adventure setup!
                    </p>
                  </div>

                  {/* Gorgeous Banner image of Oman Wild Escaping */}
                  <div className="relative rounded-xl overflow-hidden h-64 border border-slate-800 shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80" 
                      alt="Escaping Nature of Oman Jebel Shams" 
                      className="w-full h-full object-cover brightness-75"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                      <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">EXPEDITION SNAPSHOT</span>
                      <h4 className="text-lg font-bold text-white font-display">Escaping into the Nature of Oman</h4>
                      <p className="text-xs text-slate-300 mt-1">From Jebel Shams heights to Wahiba’s golden sand dunes, your route is set.</p>
                    </div>
                  </div>

                  {/* Receipt Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 border border-slate-800 rounded-xl p-5 md:p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-mono text-slate-500 uppercase font-bold">Booking Reference</h4>
                        <p className="text-sm font-extrabold text-teal-400 font-mono">#{confirmedBooking.bookingId}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-mono text-slate-500 uppercase font-bold">Pickup Terminal</h4>
                          <p className="text-xs font-bold text-white">{confirmedBooking.pickupLocation}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-mono text-slate-500 uppercase font-bold">Return Terminal</h4>
                          <p className="text-xs font-bold text-white">{confirmedBooking.dropoffLocation}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-mono text-slate-500 uppercase font-bold">Handover Date</h4>
                          <p className="text-xs font-bold text-white">{confirmedBooking.pickupDate}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-mono text-slate-500 uppercase font-bold">Return Date</h4>
                          <p className="text-xs font-bold text-white">{confirmedBooking.dropoffDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-850 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Driver Name:</span>
                          <span className="text-white font-bold">{confirmedBooking.customerName}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Mobile / Contact:</span>
                          <span className="text-white font-bold font-mono">{confirmedBooking.customerPhone}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Payment Method:</span>
                          <span className="text-emerald-400 font-bold font-mono">
                            {confirmedBooking.paymentMethod === 'on-arrival' ? '💳 Pay on Arrival' : `🔒 Simulated Card •••• ${cardNumber.slice(-4)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Insurance Cover:</span>
                          <span className="text-white font-bold">
                            {INSURANCE_PACKAGES.find(i => i.id === selectedInsuranceId)?.name || 'Basic Cover'}
                          </span>
                        </div>

                        {confirmedBooking.pickupLocation.toLowerCase().includes('airport') && (
                          <div className="mt-3 pt-3 border-t border-slate-900 space-y-1.5 text-stone-300">
                            <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">✈️ Airport Greeting Placard Details</span>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                              <div><span className="text-slate-500">Flight:</span> <strong className="text-white font-mono">{confirmedBooking.flightNumber}</strong></div>
                              <div><span className="text-slate-500">Carrier:</span> <strong className="text-white">{confirmedBooking.airlineCarrier || airlineCarrier}</strong></div>
                              <div><span className="text-slate-500">Terminal:</span> <strong className="text-white text-[10px]">{confirmedBooking.terminalNumber || terminalNumber}</strong></div>
                              <div><span className="text-slate-500">Luggage:</span> <strong className="text-white">{confirmedBooking.luggageCount || luggageCount} bag(s)</strong></div>
                              <div className="col-span-2"><span className="text-slate-500">Placard Text:</span> <strong className="text-amber-400 font-bold">"{confirmedBooking.placardText || placardText}"</strong></div>
                              {confirmedBooking.connectingFlight && (
                                <div className="col-span-2"><span className="text-slate-500">Connection Origin:</span> <span className="text-slate-300">{confirmedBooking.connectingFlight}</span></div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-900 pt-3 space-y-1.5 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Base Subtotal:</span>
                          <span className="text-white font-bold">{(confirmedBooking.subtotal || confirmedBooking.totalPrice).toFixed(2)} {t.currencySymbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Oman VAT (5%):</span>
                          <span className="text-white font-bold">{(confirmedBooking.vatAmount || 0).toFixed(2)} {t.currencySymbol}</span>
                        </div>
                        {confirmedBooking.paymentMethod === 'credit-card' && (
                          <div className="flex justify-between text-amber-400 font-medium">
                            <span>Card Surcharge (3%):</span>
                            <span>+{(confirmedBooking.cardFee || 0).toFixed(2)} {t.currencySymbol}</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-900 pt-3 flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-slate-500 block">
                            {confirmedBooking.paymentMethod === 'on-arrival' ? 'TOTAL DUE AT PICKUP' : 'AMOUNT PAID'}
                          </span>
                          <span className="text-xl font-black text-teal-400">{confirmedBooking.totalPrice.toFixed(2)} {t.currencySymbol}</span>
                        </div>
                        <span className={`text-[10px] font-mono px-2 py-1 rounded font-bold ${
                          confirmedBooking.paymentMethod === 'on-arrival'
                            ? 'text-amber-400 bg-amber-950/60 border border-amber-900'
                            : 'text-emerald-400 bg-emerald-950/60 border border-emerald-900'
                        }`}>
                          {confirmedBooking.paymentMethod === 'on-arrival' ? 'PAY ON ARRIVAL' : 'PAID FULLY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Automated Admin Booking Notification Email Preview */}
                  {emailSentHtml && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                          📬 Booking Confirmation Email Dispatch Preview
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        This beautifully formatted confirmation email has been securely transmitted to <strong className="text-white">admin@bullseyetargetllc.com</strong> and copied to customer <strong className="text-white">{confirmedBooking.customerEmail}</strong>:
                      </p>
                      <div 
                        className="bg-white text-stone-900 rounded-lg p-6 max-h-[450px] overflow-y-auto border border-slate-700 shadow-inner prose prose-slate max-w-none text-xs"
                        dangerouslySetInnerHTML={{ __html: emailSentHtml }}
                      />
                    </div>
                  )}

                  {/* Actions to reset and download PDF */}
                  <div className="flex flex-col space-y-4 pt-4 border-t border-slate-850">
                    {/* Top row: PDF and WhatsApp */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center">
                      <button
                        type="button"
                        onClick={() => downloadReceiptPdf(confirmedBooking)}
                        className="w-full sm:w-auto bg-[#2D7A82] hover:bg-[#1f5960] text-white font-extrabold text-xs px-6 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-500/15"
                      >
                        <Download className="h-4 w-4 animate-bounce" />
                        Download PDF Confirmation Receipt
                      </button>

                      <a
                        href="https://wa.me/96893070770"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-6 py-3.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/15 cursor-pointer"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.478 5.357 1.479 5.437 0 9.859-4.42 9.862-9.859.002-2.636-1.023-5.111-2.884-6.974C17.26 1.936 14.78 1.9 12.012 1.9c-5.44 0-9.863 4.419-9.866 9.86 0 2.128.556 4.195 1.61 6.012l-.995 3.633 3.731-.978zm11.367-7.234c-.3-.15-1.772-.875-2.046-.975-.275-.1-.475-.15-.674.15-.199.3-.773.975-.948 1.175-.175.2-.35.225-.65.075-1.205-.6-2.099-1.077-2.933-2.51-.219-.375.219-.348.627-1.156.075-.15.038-.282-.019-.394-.056-.113-.475-1.144-.65-1.569-.171-.413-.342-.356-.475-.362-.122-.006-.263-.008-.403-.008-.14 0-.368.053-.56.263-.193.21-.738.72-7.38.72s1.147 1.417 1.302 1.625c.156.208 2.229 3.403 5.4 4.767.753.325 1.341.519 1.8.663.757.241 1.448.207 1.993.125.607-.09 1.772-.725 2.022-1.391.25-.666.25-1.238.175-1.391-.075-.153-.275-.253-.575-.403z"/>
                        </svg>
                        Contact Fleet Manager Azaan via WhatsApp
                      </a>
                    </div>

                    {/* Bottom row: Home navigation / reset flow */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-start items-center pt-2 border-t border-slate-900/60">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmedBooking(null);
                          setWizardStep(1);
                        }}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Home className="h-4 w-4 text-teal-400" />
                        Return to Home Page
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmedBooking(null);
                          setWizardStep(1);
                        }}
                        className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 hover:text-white font-bold text-xs px-5 py-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        Book Another Expedition
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Price Comparison Tab (Zahara Tours & Omani Competitors comparison) */}
        {activeTab === 'comparison' && (
          <section className="space-y-6">
            <PriceComparison 
              lang={lang} 
              onSelectVehicle={(vehicleId) => {
                setSelectedVehicleId(vehicleId);
                setActiveTab('booking');
                setWizardStep(2);
                addNotification(
                  '🚗 Vehicle Selected', 
                  `You selected ${vehicles.find(v => v.id === vehicleId)?.make || 'the vehicle'}. Complete your pickup options below!`,
                  'info'
                );
              }}
            />
          </section>
        )}

        {/* Custom Wilderness Planner Tab (Sights Tours inspired) */}
        {activeTab === 'custom-planner' && (
          <section className="space-y-6">
            <CustomitineraryPlanner 
              lang={lang} 
              addNotification={addNotification}
            />
          </section>
        )}

        {/* Loyalty Priority Club Tab */}
        {activeTab === 'loyalty' && (
          <section className="space-y-6">
            <LoyaltyPanel lang={lang} />
          </section>
        )}

        {/* Subscription Plans Tab */}
        {activeTab === 'subscriptions' && (
          <section className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl text-white">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
                <Layers className="text-[#4B9CB5] h-6 w-6" />
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{t.subscriptionTitle}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Avoid heavy upfront capital outlays. Swap vehicles instantly and enjoy zero insurance deductibles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-teal-500 transition"
                  >
                    {plan.tier === 'VIP' && (
                      <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 px-3 py-1 rounded-bl-lg font-mono text-[9px] font-bold tracking-wider uppercase">
                        POPULAR
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{plan.tier} Tier</span>
                        <h4 className="text-lg font-extrabold text-white mt-1 font-display">{plan.name}</h4>
                      </div>

                      <div className="flex items-baseline gap-1 py-2 border-y border-slate-900">
                        <span className="text-3xl font-black text-teal-400">{plan.pricePerMonth} {t.currencySymbol}</span>
                        <span className="text-xs text-slate-500">/ month</span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Min Duration:</span>
                          <span className="font-semibold">{plan.durationMonths} month(s)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mileage Allowance:</span>
                          <span className="font-semibold text-teal-400">{plan.includedKm}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed italic">
                          "{plan.description}"
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addNotification(
                          '📞 Subscription Inquiry Dispatched',
                          `Thank you! We received your request for ${plan.name}. A corporate subscription manager will WhatsApp you shortly.`,
                          'success'
                        );
                      }}
                      className="w-full mt-6 bg-slate-900 border border-slate-800 hover:border-teal-500 group-hover:bg-teal-500 group-hover:text-slate-950 text-white font-bold text-xs py-2 rounded-lg transition-all cursor-pointer"
                    >
                      Inquire Subscription Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* OTA Developer Portal Tab */}
        {activeTab === 'api' && (
          <section className="space-y-6">
            <ApiPortal lang={lang} />
          </section>
        )}

        {/* Google Maps & Verified Customer Reviews Showcase */}
        {activeTab === 'reviews' && (
          <section className="space-y-6">
            <GoogleReviewsShowcase lang={lang} />
          </section>
        )}

        {/* Admin Dashboard Control Console */}
        {activeTab === 'admin' && (
          <section className="space-y-6">
            <AdminPanel 
              lang={lang} 
              vehicles={vehicles} 
              onUpdateVehicles={setVehicles} 
              addNotification={addNotification} 
              onDownloadPdf={downloadReceiptPdf}
            />
          </section>
        )}

        {/* Tourism Escaping Wilderness Gallery Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest block">
              The Spirit of Oman
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white font-display">
              Escaping Into the Wilderness
            </h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Rent a premium 4WD fully prepped with a hardshell rooftop tent, camping tables, and portable stoves. Drive off the beaten path and camp at these breathtaking desert and canyon sites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mountain Escape */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-teal-500/40 transition">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80" 
                  alt="Jebel Shams mountain canyon road in Oman" 
                  className="w-full h-full object-cover duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded text-[10px] font-mono text-teal-400 font-bold uppercase">
                  Mountain Trek
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="text-base font-bold text-white font-display">Jebel Shams (The Grand Canyon)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Towering 3,000m above sea level, experience cool alpine climates, dramatic canyon balconies, and stargazing from your vehicle rooftop tent.
                </p>
              </div>
            </div>

            {/* Desert Escape */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-teal-500/40 transition">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80" 
                  alt="Wahiba Sands desert sand dunes in Oman" 
                  className="w-full h-full object-cover duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded text-[10px] font-mono text-teal-400 font-bold uppercase">
                  Desert Safari
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="text-base font-bold text-white font-display">Wahiba Sands (Deep Dunes)</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Navigate majestic golden dunes, dine with traditional local Bedouins, and enjoy 4x4 dune-bashing before sleeping in your wild desert campsite.
                </p>
              </div>
            </div>

            {/* Wadi Escape */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-teal-500/40 transition">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" 
                  alt="Oman emerald oasis pools wadi" 
                  className="w-full h-full object-cover duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 rounded text-[10px] font-mono text-teal-400 font-bold uppercase">
                  Wadi Oasis
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="text-base font-bold text-white font-display">Wadi Bani Khalid & Wadi Shab</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Plunge into crystal-clear emerald pools tucked between high limestone gorges. The perfect refresh during your overland road trip across Sur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Happy Customers Testimonials Section */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-widest block">
              Customer Experiences
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white font-display">
              Stories From Happy Drivers
            </h3>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              We take pride in providing pristine, safe vehicles and premium custom camping equipment for adventure seekers from all corners of the globe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "SPEED is the absolute best choice for off-road overlanding in Oman! The rooftop tent was completely clean and set up perfectly on top of our Landcruiser. We stayed in the middle of Jebel Shams canyon in absolute comfort and safety. Will definitely book again!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-850 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-850 overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
                    alt="Sophia M. happy customer" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sophia & Marcus M.</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Germany • Off-Road Adventurers</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Outstanding local service. The vehicle fleet is extremely well-maintained and they run a thorough 50-point inspection before handoff. Zero excess premium insurance gave me total peace of mind in the sand dunes. Friendly team and fast support!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-850 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-850 overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
                    alt="Ameen A. happy customer" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ameen Al-Balushi</h4>
                  <p className="text-[10px] text-slate-500 font-mono">Muscat, Oman • Weekend Explorer</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Our family booked a 4WD vehicle + camping gears package. Having a high-quality portable stove, warm sleeping mats, and comfortable chairs already packed in the trunk saved us so much effort. Highly recommend the Jebel Akhdar mountain tour!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-850 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-850 overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" 
                    alt="The Henderson Family happy customer" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">The Henderson Family</h4>
                  <p className="text-[10px] text-slate-500 font-mono">London, UK • Expedition Travelers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company History & Professional Experience Section */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-white font-display">
            {t.companyHistory}
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {t.companyHistoryDesc}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800 pt-4 font-mono">
            <span>📞 Direct Line: <strong className="text-teal-400">+96893070770</strong></span>
            <span>📍 Corporate HQ: Al Khuwair Main Street, Muscat, Sultanate of Oman</span>
            <span>✉️ General Inquiries: info@speedcarrental.net</span>
          </div>
        </section>

      </main>

      {/* Floating Push Notification alerts */}
      <PushNotificationManager notifications={notifications} onDismiss={dismissNotification} />

      {/* Bot & WhatsApp Floating Widget component */}
      <AiChatBot lang={lang} />

    </div>
  );
}
