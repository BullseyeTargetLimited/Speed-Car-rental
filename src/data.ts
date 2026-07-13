import { Vehicle, InsurancePackage, CampingGear, TourismPackage, SubscriptionPlan } from './types';

export const VEHICLES: Vehicle[] = [
  {
    id: 'toyota_landcruiser',
    manufacturer: 'TOYOTA',
    make: 'LANDCRUISER',
    model: '2019',
    year: 2019,
    seats: 8,
    category: '4WD',
    pricePerDay: 42.5, // ~110 USD
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    features: ['V8 Engine', 'Full-Time 4WD', 'Dual AC', 'Rooftop Tent Compatible', 'Cool Box', 'Leather Seats']
  },
  {
    id: 'toyota_prado',
    manufacturer: 'TOYOTA',
    make: 'PRADO',
    model: '2023',
    year: 2023,
    seats: 7,
    category: 'Premium',
    pricePerDay: 36.5, // ~95 USD
    image: 'https://images.unsplash.com/photo-1533557838520-f4d9294f3183?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Keyless', 'AWD Drive Mode', 'Premium Sound System', 'Spacious Cargo', 'GPS Nav System']
  },
  {
    id: 'mitsubishi_pajero',
    manufacturer: 'MITSUBISHI',
    make: 'MITSUBISHI PAJERO',
    model: '2013',
    year: 2013,
    seats: 8,
    category: '4WD',
    pricePerDay: 27.0, // ~70 USD
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    features: ['Heavy Duty Chassis', 'Super Select 4WD', 'Sunroof', 'Towing Hitch', 'All-Terrain Tires']
  },
  {
    id: 'great_wall_tank',
    manufacturer: 'GREAT WALL',
    make: 'TANK 300',
    model: '2026',
    year: 2026,
    seats: 7,
    category: 'Premium',
    pricePerDay: 34.5, // ~90 USD
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    features: ['Luxurious Cabin', 'Triple Diff Locks', 'Adaptive Cruise', '360 Camera', 'Ambient Lighting']
  },
  {
    id: 'great_wall_h9',
    manufacturer: 'GREAT WALL',
    make: 'HAVAL H9',
    model: '2025',
    year: 2025,
    seats: 7,
    category: 'SUV',
    pricePerDay: 32.5, // ~85 USD
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
    features: ['Massage Seats', 'Multi-terrain Select', 'Panoramic Roof', 'Electronic Shifter']
  },
  {
    id: 'saic_rx8',
    manufacturer: 'SAIC',
    make: 'RX8',
    model: '2024',
    year: 2024,
    seats: 7,
    category: 'SUV',
    pricePerDay: 29.0, // ~75 USD
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    features: ['Turbo Engine', 'Wireless Charger', 'Spacious Third Row', 'LED Headlights']
  },
  {
    id: 'kia_sportage',
    manufacturer: 'KIA',
    make: 'SPORTAGE',
    model: '2025',
    year: 2025,
    seats: 5,
    category: 'SUV',
    pricePerDay: 21.0, // ~55 USD
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
    features: ['Apple CarPlay', 'Blind Spot Detection', 'Power Tailgate', 'Fuel Efficient']
  },
  {
    id: 'great_wall_h7',
    manufacturer: 'GREAT WALL',
    make: 'HAVAL H7',
    model: '2026',
    year: 2026,
    seats: 7,
    category: 'SUV',
    pricePerDay: 30.5,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    features: ['Lane Keep Assist', 'Dual Zone Climate', 'Spacious Trunk']
  },
  {
    id: 'changan_cs35',
    manufacturer: 'CHANGAN',
    make: 'CS35',
    model: '2021',
    year: 2021,
    seats: 5,
    category: 'SUV',
    pricePerDay: 17.5, // ~45 USD
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    features: ['Compact SUV', 'Bluetooth Audio', 'Rear Parking Sensors']
  },
  {
    id: 'changan_alsvin',
    manufacturer: 'CHANGAN',
    make: 'ALSVIN',
    model: '2023',
    year: 2023,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 11.5, // ~30 USD
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    features: ['Excellent Fuel Economy', 'Reverse Camera', '7-inch Screen']
  },
  {
    id: 'changan_edo_plus',
    manufacturer: 'CHANGAN',
    make: 'EDO PLUS',
    model: '2023',
    year: 2023,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 13.5, // ~35 USD
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
    features: ['Sleek Design', 'Sunroof', 'Leather Steering Wheel']
  },
  {
    id: 'hyundai_accent',
    manufacturer: 'HYUNDAI',
    make: 'ACCENT',
    model: '2024',
    year: 2024,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 11.5, // ~30 USD
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
    features: ['Smart Cruise Control', 'USB-C Charging', 'Large Infotainment']
  },
  {
    id: 'saic_mg5',
    manufacturer: 'SAIC',
    make: 'MG5',
    model: '2021',
    year: 2021,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 10.5, // ~28 USD
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    features: ['Stylish Front Grill', 'Rear View Camera', 'Excellent Maneuverability']
  },
  {
    id: 'nissan_micra',
    manufacturer: 'NISSAN',
    make: 'MICRA',
    model: '2018',
    year: 2018,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 9.5, // ~25 USD
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=800&q=80',
    features: ['Super Compact', 'Easy Park', 'High City MPG']
  },
  {
    id: 'nissan_pathfinder',
    manufacturer: 'NISSAN',
    make: 'PATHFINDER',
    model: '2015',
    year: 2015,
    seats: 8,
    category: 'SUV',
    pricePerDay: 31.0, // ~80 USD
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    features: ['Tri-Zone AC', 'Heavy Towing capacity', 'Intuitive AWD']
  },
  {
    id: 'nissan_sunny',
    manufacturer: 'NISSAN',
    make: 'SUNNY',
    model: '2018',
    year: 2018,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 8.5, // ~22 USD
    image: 'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&w=800&q=80',
    features: ['Legendary Reliability', 'Exceptional Legroom', 'Massive Trunk Space']
  },
  {
    id: 'toyota_corolla',
    manufacturer: 'TOYOTA',
    make: 'COROLLA',
    model: '2019',
    year: 2019,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 12.5, // ~32 USD
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
    features: ['Safety Sense', 'Smooth CVT', 'High Quality AC']
  },
  {
    id: 'toyota_yaris',
    manufacturer: 'TOYOTA',
    make: 'YARIS',
    model: '2018',
    year: 2018,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 9.2, // ~24 USD
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    features: ['Compact Profile', 'Very Low Maintenance', 'Comfortable Suspension']
  },
  {
    id: 'saic_mg3',
    manufacturer: 'SAIC',
    make: 'MG3',
    model: '2026',
    year: 2026,
    seats: 5,
    category: 'Sedan',
    pricePerDay: 10.0, // ~26 USD
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80',
    features: ['Latest Infotainment', 'Sleek Headlamps', 'Eco Driving Mode']
  }
];

export const INSURANCE_PACKAGES: InsurancePackage[] = [
  {
    id: 'basic',
    name: 'Basic Cover (Third Party)',
    pricePerDay: 0.0,
    description: 'Standard third-party liability covering mandatory legal limits. Deductible deposit applies for own damage.'
  },
  {
    id: 'standard',
    name: 'Standard Collision Damage (CDW)',
    pricePerDay: 3.8, // ~10 USD
    description: 'Limits your liability in case of an accident. Reduces deductible deposit significantly.'
  },
  {
    id: 'full_premium',
    name: 'Full Premium Zero Liability',
    pricePerDay: 7.7, // ~20 USD
    description: 'Zero excess/deductible for damages. Full window, tire, and body protection with premium 24/7 road assistance.'
  }
];

export const CAMPING_GEAR: CampingGear[] = [
  {
    id: 'rooftop_tent',
    name: 'Premium Rooftop Tent (Hard Shell)',
    pricePerDay: 7.7, // ~20 USD
    description: 'High-quality waterproof dual-person rooftop tent mounted directly over your 4WD/SUV. Folds open in 60 seconds.',
    iconName: 'tent'
  },
  {
    id: 'camping_chairs',
    name: 'Foldable Camping Chairs (Set of 2)',
    pricePerDay: 1.5, // ~4 USD
    description: 'Ergonomic quick-folding heavy-duty outdoor chairs with built-in drink holders.',
    iconName: 'chair'
  },
  {
    id: 'portable_stove',
    name: 'Dual-Burner Portable Gas Stove',
    pricePerDay: 2.3, // ~6 USD
    description: 'Reliable stove with butane canister fuel included. Perfect for preparing warm meals in the desert or mountains.',
    iconName: 'flame'
  },
  {
    id: 'complete_kitchen_box',
    name: 'Outdoor Cookware & Dining Accessories Kit',
    pricePerDay: 3.1, // ~8 USD
    description: 'Includes cooler box, thermal cups, plates, pans, cutlery, and cleaning supplies for a complete wilderness kitchen.',
    iconName: 'coffee'
  },
  {
    id: 'heavy_sleeping_bag',
    name: 'Cozy Sleeping Bags & Thermal Mats (Pair)',
    pricePerDay: 1.9, // ~5 USD
    description: 'Sub-zero rated sleeping bags and self-inflating padding for absolute comfort under Oman’s starry skies.',
    iconName: 'moon'
  }
];

export const TOURISM_PACKAGES: TourismPackage[] = [
  {
    id: 'nizwa_cultural',
    name: 'Nizwa & Bahla Cultural Heritage Expedition',
    type: 'cultural',
    durationDays: 2,
    pricePerPerson: 58.0, // ~150 USD
    description: 'Immerse yourself in Omani history. Wander the traditional Muttrah Souq, explore Nizwa’s magnificent castle, and visit the UNESCO-listed Bahla Fort with local guides.',
    highlights: ['Nizwa Fort & Friday Goat Market', 'UNESCO Bahla Clay Fort', 'Muttrah Souq Spices', 'Al Hamra Mud Village Trek'],
    locations: ['Muscat', 'Muttrah', 'Nizwa', 'Bahla', 'Al Hamra'],
    image: '/src/assets/images/oman_nizwa_fort_1783926713124.jpg'
  },
  {
    id: 'jebel_shams_trek',
    name: 'Grand Canyon Mountain Trek (Jebel Shams & Akhdar)',
    type: 'mountain',
    durationDays: 3,
    pricePerPerson: 85.0, // ~220 USD
    description: 'Ascend Oman’s highest peaks. Traverse the stunning balconies of Jebel Shams (The Sun Mountain), feel the cool breeze of Jebel Akhdar terraces, and camp at 3000m.',
    highlights: ['Balcony Walk along Arabia’s Grand Canyon', 'Birkat Al Mouz ancient ruins', 'Terraced Gardens of Jebel Akhdar', 'High-altitude bonfire camping'],
    locations: ['Nizwa', 'Jebel Shams', 'Jebel Akhdar', 'Al Hamra'],
    image: '/src/assets/images/oman_mountain_4wd_1783926667916.jpg'
  },
  {
    id: 'wahiba_desert_safari',
    name: 'Wahiba Sands & Wadi Bani Khalid Desert Safari',
    type: 'desert',
    durationDays: 2,
    pricePerPerson: 69.0, // ~180 USD
    description: 'Experience deep golden sands and emerald crystal pools. Watch a spectacular sunset over 150m desert dunes, camp with local Bedouins, and plunge into the fresh wadi waters.',
    highlights: ['4x4 Dune Bashing in Wahiba Sands', 'Bedouin Coffee & Dates Hospitality', 'Swimming in Wadi Bani Khalid pools', 'Stargazing around desert campfire'],
    locations: ['Sur', 'Bidiya', 'Wahiba Sands', 'Wadi Bani Khalid'],
    image: '/src/assets/images/oman_desert_camp_1783926683564.jpg'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'daily_flex',
    name: 'SPEED Daily Flex',
    pricePerMonth: 290.0, // ~750 USD / month
    durationMonths: 1,
    includedKm: '4,000 Km / Mo',
    tier: 'Essential',
    description: 'Flexible daily roll-over. Perfect for temporary projects, short visits, or seasonal road trippers who need a vehicle on short-term commitment.'
  },
  {
    id: 'weekly_super',
    name: 'SPEED Professional Premium',
    pricePerMonth: 220.0, // ~570 USD / month (billed monthly)
    durationMonths: 3,
    includedKm: '5,000 Km / Mo',
    tier: 'Executive',
    description: 'Medium-term subscription with free routine maintenance and delivery. Includes swap vehicle availability within 2 hours anywhere in Muscat.'
  },
  {
    id: 'annual_unlimited',
    name: 'SPEED Corporate Elite (Annual)',
    pricePerMonth: 180.0, // ~465 USD / month
    durationMonths: 12,
    includedKm: 'Unlimited',
    tier: 'VIP',
    description: 'Ultimate peace of mind for long-term residents. Brand-new 2025/2026 fleet options, zero insurance deductible, and annual registration managed by SPEED.'
  }
];

export const LOCATIONS = [
  'Muscat International Airport (MCT)',
  'SPEED Corporate HQ (Muscat - Al Khuwair)',
  'Salalah International Airport (SLL)',
  'Nizwa Heritage Center Parking',
  'Sohar City Center Center',
  'Sur Seafront Hub',
  'Duqm Port Executive Terminal'
];

export const TRANSLATIONS = {
  en: {
    heroTitle: 'SPEED Car Rental & Off-Road Adventures',
    heroSubtitle: 'Professional Travel Solutions, Premium Off-Road Fleet & Guided Wilderness Safaris',
    heroDesc: 'Embark on the ultimate Omani escape. Rent premium 4WDs, robust SUVs, and elegant sedans, fully integrated with high-end camping gears and curated Omani trekking & desert tours.',
    bookingTitle: 'Start Your Oman Booking Wizard',
    bookingChoice: 'What would you like to plan today?',
    rentalOnly: 'Car Rental Only',
    tourOnly: 'Oman Tour Package Only',
    comboAll: 'Ultimate Combo (Car + Camping Gear + Tour)',
    selectLocation: 'Pickup & Drop-off Details',
    pickupLoc: 'Pick-up Location',
    dropoffLoc: 'Drop-off Location',
    pickupDate: 'Pick-up Date',
    dropoffDate: 'Drop-off Date',
    chooseVehicle: 'Select Your Perfect Vehicle',
    categories: 'Categories',
    features: 'Key Features',
    chooseInsurance: 'Select Insurance Cover',
    chooseCamping: 'Rent Essential Camping Gears & Extras',
    campingDesc: 'Equip your 4WD with premium accessories for overnight stays in Jebel Shams or Wahiba Sands!',
    chooseTour: 'Add an Authentic Oman Tourism Package',
    personalDetails: 'Driver Details & Simulated Checkout',
    confirmBooking: 'Instant Confirm Booking',
    summaryTitle: 'Booking Calculation Summary',
    days: 'days',
    people: 'Travelers / Persons',
    gpsInclude: 'Include Premium GPS Navigator (Free)',
    whatsappBot: '24/7 Support via WhatsApp',
    apiTitle: 'Travel API Portal for Global Aggregators',
    loyaltyTitle: 'SPEED Priority Rewards Program',
    trackingTitle: 'Real-Time Car Delivery Live Tracker',
    subscriptionTitle: 'Flexible Car Subscription Plans',
    companyHistory: 'Professional Travel in the Sultanate',
    companyHistoryDesc: 'Founded with a vision of exceptional customer satisfaction, SPEED has served over 85,000 global explorers across Oman. With a rigorous 50-point inspection fleet, premium multi-lingual road assistance, and an elite crew of local guides, we are the standard of professional travel in the Sultanate.',
    currencyCode: 'OMR',
    currencySymbol: 'ر.ع.',
    usdEquivalent: 'USD Equivalent',
    languages: 'Languages',
    driverName: 'Full Name',
    driverEmail: 'Email Address',
    driverPhone: 'Mobile Number (+968 recommended)',
    paymentSim: 'Secure Payment Processing (Simulated)',
    cardNum: 'Credit / Debit Card Number',
    cardExp: 'Expiry Date',
    cardCvv: 'CVV Code',
    successMsg: 'Booking Successful! In-App Push Notification Dispatched.',
    welcomeMessage: 'Welcome to SPEED Oman. How can I help you plan your ideal rental, camping gear, or tour across Nizwa, Jebel Shams, or Muscat today?',
    trackingLogs: {
      ready: 'Car prepped and detailed at Muscat HQ.',
      loaded: 'Rooftop tent & camping gear securely installed.',
      departed: 'Driver dispatched! Headed towards your delivery address.',
      nearby: 'Vehicle is within 2 km of your location. Driver contacting you shortly.',
      completed: 'Handover complete! Drive safe across Oman.'
    }
  },
  ar: {
    heroTitle: 'سبيد لتأجير السيارات ومغامرات عُمان',
    heroSubtitle: 'حلول سفر احترافية وأسطول دفع رباعي متميز وجولات برية بصحبة مرشدين',
    heroDesc: 'انطلق في مغامرة عمانية لا تُنسى. استأجر سيارات الدفع الرباعي الفاخرة، سيارات الدفع الرباعي القوية، وسيارات السيدان الأنيقة، المجهزة بالكامل بأحدث أدوات التخييم وبرامج الرحلات الجبلية والصحراوية المنسقة.',
    bookingTitle: 'معالج حجز رحلات وسيارات سبيد',
    bookingChoice: 'ماذا ترغب في التخطيط له اليوم؟',
    rentalOnly: 'تأجير سيارة فقط',
    tourOnly: 'باقة جولة سياحية في عمان فقط',
    comboAll: 'الباقة الشاملة (سيارة + معدات تخييم + جولة سياحية)',
    selectLocation: 'تفاصيل الاستلام والتسليم',
    pickupLoc: 'موقع الاستلام',
    dropoffLoc: 'موقع التسليم',
    pickupDate: 'تاريخ الاستلام',
    dropoffDate: 'تاريخ التسليم',
    chooseVehicle: 'اختر سيارتك المثالية',
    categories: 'الفئات',
    features: 'الميزات الأساسية',
    chooseInsurance: 'اختر باقة التأمين',
    chooseCamping: 'استأجر أدوات التخييم والملحقات الأساسية',
    campingDesc: 'جهز سيارتك ذات الدفع الرباعي بملحقات فاخرة للمبيت في جبل شمس أو رمال وهيبة!',
    chooseTour: 'أضف باقة سياحية عمانية أصيلة',
    personalDetails: 'بيانات السائق والدفع المحاكي',
    confirmBooking: 'تأكيد الحجز الفوري',
    summaryTitle: 'ملخص الحساب الإجمالي للحجز',
    days: 'أيام',
    people: 'عدد المسافرين / الأشخاص',
    gpsInclude: 'تضمين جهاز ملاحة GPS مجاني',
    whatsappBot: 'الدعم المباشر عبر الواتساب ٢٤/٧',
    apiTitle: 'بوابة مطوري واجهة البرمجة للمنصات العالمية',
    loyaltyTitle: 'برنامج مكافآت السائقين المتميزين من سبيد',
    trackingTitle: 'تتبع تسليم السيارة المباشر في الوقت الحقيقي',
    subscriptionTitle: 'خطط الاشتراك الشهري المرن للسيارات',
    companyHistory: 'التميز العماني الأصيل والسفر الاحترافي',
    companyHistoryDesc: 'تأسست سبيد برؤية متميزة لخدمة المسافرين وتأجير السيارات، وخدمت أكثر من ٨٥,٠٠٠ مستكشف حول العالم في عمان. بأسطول يخضع لفحص صارم من ٥٠ نقطة، ودعم فني وطلبي متميز على الطرق، فإننا نضع معايير السفر الاحترافي في السلطنة.',
    currencyCode: 'ريال عماني',
    currencySymbol: 'ر.ع.',
    usdEquivalent: 'المعادل بالدولار الأمريكي',
    languages: 'اللغات',
    driverName: 'الاسم الكامل',
    driverEmail: 'البريد الإلكتروني',
    driverPhone: 'رقم الهاتف المحمول (+968 يفضل)',
    paymentSim: 'معالجة الدفع الآمن (محاكاة)',
    cardNum: 'رقم بطاقة الائتمان / الخصم',
    cardExp: 'تاريخ الانتهاء',
    cardCvv: 'الرمز السري (CVV)',
    successMsg: 'تم الحجز بنجاح! تم إرسال إشعار فوري في التطبيق.',
    welcomeMessage: 'مرحباً بك في سبيد عمان. كيف يمكنني مساعدتك في تخطيط سيارتك، أدوات التخييم، أو جولتك عبر نزوى، جبل شمس، أو مسقط اليوم؟',
    trackingLogs: {
      ready: 'السيارة جاهزة وجرى تنظيفها في المقر الرئيسي بمسقط.',
      loaded: 'تم تثبيت خيمة السقف ومعدات التخييم بأمان.',
      departed: 'تم إرسال السائق! وهو في طريقه إلى موقع التسليم الخاص بك.',
      nearby: 'السيارة على بعد أقل من ٢ كم. سيتصل بك السائق قريباً.',
      completed: 'تم التسليم بنجاح! رافقتكم السلامة في ربوع عمان.'
    }
  },
  fr: {
    heroTitle: 'SPEED Location de Voitures & Expéditions à Oman',
    heroSubtitle: 'Solutions de Voyage Professionnelles, Flotte Tout-Terrain Premium & Safaris Guidés',
    heroDesc: 'Embarquez pour l’aventure omanaise ultime. Louez des 4x4 premium, des SUV robustes ou des berlines élégantes, équipés d’accessoires de camping haut de gamme et de circuits guidés dans le désert ou les montagnes d’Oman.',
    bookingTitle: 'Assistant de Réservation SPEED',
    bookingChoice: 'Que souhaitez-vous planifier aujourd’hui ?',
    rentalOnly: 'Location de Voiture Uniquement',
    tourOnly: 'Circuit Touristique Uniquement',
    comboAll: 'Pack Combo Ultime (Voiture + Équipement Camping + Circuit)',
    selectLocation: 'Détails du Retrait et Dépôt',
    pickupLoc: 'Lieu de Retrait',
    dropoffLoc: 'Lieu de Restitution',
    pickupDate: 'Date de Retrait',
    dropoffDate: 'Date de Dépôt',
    chooseVehicle: 'Choisissez Votre Véhicule Idéal',
    categories: 'Catégories',
    features: 'Caractéristiques Clés',
    chooseInsurance: 'Sélectionnez l’Assurance',
    chooseCamping: 'Louez l’Équipement de Camping',
    campingDesc: 'Équipez votre 4x4 de tentes de toit haut de gamme pour vos nuitées magiques au Jebel Shams ou à Wahiba Sands !',
    chooseTour: 'Ajoutez un Pack de Tourisme Authentique à Oman',
    personalDetails: 'Détails du Conducteur & Paiement Sécurisé',
    confirmBooking: 'Confirmer la Réservation Instantanément',
    summaryTitle: 'Résumé du Calcul de Réservation',
    days: 'jours',
    people: 'Voyageurs / Personnes',
    gpsInclude: 'Inclure le Navigateur GPS Premium (Gratuit)',
    whatsappBot: 'Assistance Directe 24/7 via WhatsApp',
    apiTitle: 'Portail API Travel pour les Agrégateurs Mondiaux',
    loyaltyTitle: 'Programme de Fidélité SPEED Priority',
    trackingTitle: 'Suivi de Livraison de Véhicule en Temps Réel',
    subscriptionTitle: 'Abonnements de Voitures Flexibles',
    companyHistory: 'Excellence et Voyage Professionnel à Oman',
    companyHistoryDesc: 'Fondée avec un engagement fort pour la satisfaction client, SPEED a accompagné plus de 85 000 explorateurs du monde entier à Oman. Avec un contrôle rigoureux en 50 points de notre flotte et un service d’assistance multilingue d’élite, nous sommes la référence du voyage professionnel dans le Sultanat.',
    currencyCode: 'OMR',
    currencySymbol: 'ر.ع.',
    usdEquivalent: 'Équivalent USD',
    languages: 'Langues',
    driverName: 'Nom Complet',
    driverEmail: 'Adresse E-mail',
    driverPhone: 'Numéro de Mobile (Préférer +968)',
    paymentSim: 'Traitement de Paiement Sécurisé (Simulé)',
    cardNum: 'Numéro de Carte Bancaire',
    cardExp: 'Date d’Expiration',
    cardCvv: 'Code CVV',
    successMsg: 'Réservation réussie ! Notification Push envoyée dans l’application.',
    welcomeMessage: 'Bienvenue chez SPEED Oman. Comment puis-je vous aider à planifier votre location, matériel de camping ou circuit à Nizwa, Jebel Shams ou Mascate aujourd’hui ?',
    trackingLogs: {
      ready: 'Véhicule préparé et nettoyé au siège de Mascate.',
      loaded: 'La tente de toit et le kit de camping sont installés avec soin.',
      departed: 'Chauffeur en route vers votre lieu de livraison !',
      nearby: 'Le véhicule est à moins de 2 km de votre position. Le chauffeur va vous appeler.',
      completed: 'Livraison effectuée avec succès ! Bonne route à travers Oman.'
    }
  }
};
